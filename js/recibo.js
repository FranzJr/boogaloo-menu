/* Recibo / factura pública (領収書 / 請求書). Se abre con recibo.html?t=TOKEN, sin
   iniciar sesión. El token lo genera el staff desde el panel (acción generarRecibo).
   El contenido (items, total, negocio) viene congelado del backend; aquí solo se
   elige el idioma, el tipo de documento y se puede escribir el nombre/concepto
   antes de descargar como imagen o PDF. Los precios del menú ya incluyen impuesto
   (内税): el impuesto se muestra desglosado, no se suma. */

const RC_TOKEN = new URLSearchParams(location.search).get('t') || '';
const RC_LIBS = {
  html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
};

let recibo = null;
let rcTipo = 'recibo';
// Concepto por defecto: inscripción si el documento es de un evento, comida y bebida si no.
const defaultPurpose = () =>
  I18n.t(recibo && recibo.items.some((it) => typeof EVENTS_DATA !== 'undefined' && EVENTS_DATA.some((e) => e.id === it.sku)) ? 'rcPurposeEvent' : 'rcPurposeDefault');
let purposeIsDefault = false; // el concepto por defecto sigue el idioma hasta que alguien lo edite

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
const yen = (n) => '¥' + Number(n || 0).toLocaleString('ja-JP');

// Impuesto incluido en el total: tasa 10 % en el local, 8 % (軽減税率) para llevar.
// Se redondea hacia abajo, como se hace por factura (端数処理 por tasa).
function calcTax(total, consumo) {
  const rate = consumo === 'llevar' ? 8 : 10;
  const tax = Math.floor((total * rate) / (100 + rate));
  return { rate, tax, base: total - tax };
}

// "2026-11-03" -> texto según el idioma (en japonés: 2026年11月3日)
function fechaTexto(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return esc(iso || '');
  const y = +m[1], mo = +m[2], d = +m[3];
  if (I18n.lang === 'ja') return y + '年' + mo + '月' + d + '日';
  return new Date(y, mo - 1, d).toLocaleDateString(I18n.lang === 'pt' ? 'pt-BR' : I18n.lang === 'en' ? 'en-US' : 'es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

// El nombre del item se guarda en español; se traduce por sku con el menú (o con
// el evento, si es una inscripción). Si traía una nota entre paréntesis (ej.
// "sin azúcar") se conserva; los eventos llevan además la fecha del evento.
function nombreItem(it) {
  const ev = typeof EVENTS_DATA !== 'undefined' && EVENTS_DATA.find((e) => e.id === it.sku);
  if (ev) {
    const titulo = (ev.title[I18n.lang] || ev.title.es).replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu, '').trim();
    return it.detalle ? titulo + ' (' + it.detalle + ')' : titulo;
  }
  const def = typeof MENU_INDEX !== 'undefined' && MENU_INDEX[it.sku];
  if (!def) return it.detalle ? it.nombre + ' (' + it.detalle + ')' : it.nombre;
  const base = def.nombre.es;
  const nota = String(it.nombre).indexOf(base) === 0 ? String(it.nombre).slice(base.length) : '';
  return (def.nombre[I18n.lang] || base) + nota;
}

// En japonés basta el título en japonés; en otros idiomas se agrega el término
// japonés (領収書 / 請求書) porque es el documento que reconoce el contribuyente.
function tituloDoc() {
  const jp = rcTipo === 'factura' ? '請求書' : '領収書';
  const own = I18n.t(rcTipo === 'factura' ? 'rcInvoice' : 'rcReceipt');
  return I18n.lang === 'ja' ? jp : esc(own) + ' <small>' + jp + '</small>';
}

function renderDoc() {
  const doc = document.getElementById('rc-doc');
  const r = recibo;
  const tax = calcTax(r.total, r.consumo);
  const reducido = r.consumo === 'llevar';
  const mark = reducido ? (I18n.lang === 'ja' ? ' ※' : ' *') : '';
  const nombre = document.getElementById('rc-recipient').value.trim();
  const concepto = document.getElementById('rc-purpose').value.trim();
  const neg = negocioConDefectos(r.negocio);
  const sama = I18n.lang === 'ja' ? ' 様' : '';
  const nota = rcTipo === 'factura' ? I18n.t('rcInvoiceNote') : I18n.t('rcReceivedNote');

  doc.innerHTML = `
    <div class="rc-logo"><img src="img/logo/logo-web.png" alt="Boogaloo" /></div>
    <h2 class="rc-title">${tituloDoc()}</h2>
    <div class="rc-meta">
      <div><span>${I18n.t('rcNo')}</span> ${esc(r.numero)}</div>
      <div><span>${I18n.t('rcIssued')}</span> ${fechaTexto(r.emitido)}</div>
    </div>
    <div class="rc-to">${nombre ? esc(nombre) + sama : '<span class="rc-blank"></span>' + sama}</div>
    <div class="rc-amount"><span>${I18n.t('rcTotal')}</span><strong>${yen(r.total)}</strong></div>
    ${concepto ? `<div class="rc-purpose">${I18n.t('rcPurposeLabel')}: ${esc(concepto)}</div>` : ''}
    <p class="rc-note">${esc(nota)}</p>
    <table class="rc-table">
      <thead><tr><th>${I18n.t('rcItem')}</th><th>${I18n.t('rcQty')}</th><th>${I18n.t('rcUnit')}</th><th>${I18n.t('rcAmount')}</th></tr></thead>
      <tbody>
        ${r.items.map((it) => `<tr><td>${esc(nombreItem(it))}${mark}</td><td>${it.cantidad}</td><td>${yen(it.precio)}</td><td>${yen(it.subtotal)}</td></tr>`).join('')}
      </tbody>
      <tfoot>
        <tr class="rc-total"><td colspan="3">${I18n.t('rcTotal')}</td><td>${yen(r.total)}</td></tr>
        <tr><td colspan="3">${I18n.t(reducido ? 'rcTaxable8' : 'rcTaxable10')}</td><td>${yen(tax.base)}</td></tr>
        <tr><td colspan="3">${I18n.t(reducido ? 'rcTaxIncl8' : 'rcTaxIncl10')}</td><td>${yen(tax.tax)}</td></tr>
      </tfoot>
    </table>
    ${reducido ? `<p class="rc-fine">${I18n.t('rcReducedMark')}</p>` : ''}
    <div class="rc-issuer">
      <strong>${esc(neg.nombre || 'Boogaloo')}</strong>
      ${neg.direccion ? '<div>' + esc(neg.direccion) + '</div>' : ''}
      ${neg.telefono ? '<div>TEL ' + esc(neg.telefono) + '</div>' : ''}
      ${neg.registro ? '<div>' + I18n.t('rcRegNo') + ': ' + esc(neg.registro) + '</div>' : ''}
      <div class="rc-fine">${I18n.t('rcDate')}: ${fechaTexto(r.fechaPedido)}</div>
    </div>`;
}

function fillStaticText() {
  document.getElementById('rc-type-label').textContent = I18n.t('rcTypeLabel');
  document.getElementById('rc-recipient-label').textContent = I18n.t('rcRecipientLabel');
  document.getElementById('rc-purpose-label').textContent = I18n.t('rcPurposeLabel');
  document.getElementById('rc-recipient').placeholder = I18n.t('rcRecipientPh');
  document.getElementById('rc-edit-hint').textContent = I18n.t('rcEditHint');
  document.getElementById('rc-png').textContent = I18n.t('rcDownloadPng');
  document.getElementById('rc-pdf').textContent = I18n.t('rcDownloadPdf');
  document.getElementById('rc-print').textContent = I18n.t('rcPrint');
  document.getElementById('rc-copy').textContent = I18n.t('rcCopyLink');
  const sel = document.getElementById('rc-type');
  const opciones = [['recibo', 'rcReceipt', '領収書'], ['factura', 'rcInvoice', '請求書']];
  sel.innerHTML = opciones
    .filter(([v]) => v === 'factura' || (recibo && recibo.tipo === 'recibo'))
    .map(([v, k, jp]) => `<option value="${v}">${esc(I18n.lang === 'ja' ? jp : I18n.t(k) + ' / ' + jp)}</option>`)
    .join('');
  sel.value = rcTipo;
}

function refresh() {
  if (!recibo) return;
  if (purposeIsDefault) document.getElementById('rc-purpose').value = defaultPurpose();
  fillStaticText();
  renderDoc();
}

function onLangChange() {
  applyLayoutI18n();
  document.getElementById('page-subtitle').textContent = I18n.t('rcPageTitle');
  document.title = 'Boogaloo — ' + I18n.t('rcPageTitle');
  if (recibo) refresh();
  else if (document.getElementById('rc-status').dataset.err) document.getElementById('rc-status').textContent = I18n.t('rcNotFound');
}

// ---------------- Descarga ----------------

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error('No se pudo cargar ' + src));
    document.head.appendChild(s);
  });
}

async function capture() {
  if (!window.html2canvas) await loadScript(RC_LIBS.html2canvas);
  const doc = document.getElementById('rc-doc');
  return window.html2canvas(doc, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
}

function fileBase() {
  return (rcTipo === 'factura' ? 'invoice-' : 'receipt-') + recibo.numero;
}

function setMsg(text) {
  document.getElementById('rc-msg').textContent = text || '';
}

async function runDownload(btnId, fn) {
  const btn = document.getElementById(btnId);
  btn.disabled = true;
  setMsg(I18n.t('rcPreparing'));
  try {
    await fn();
    setMsg('');
  } catch (err) {
    setMsg(I18n.t('rcDownloadErr'));
  }
  btn.disabled = false;
}

// Seguimiento para el staff: primera apertura y cada descarga del PDF. No cuenta si quien
// abre es del staff (admin o colaborador identificado en este navegador). Un fallo aquí
// nunca debe molestar al cliente ni impedir la descarga.
function rcTrack(evento) {
  try {
    if (detectStaffIdentity()) return;
    apiCall('registrarEventoRecibo', { token: RC_TOKEN, evento }).catch(() => {});
  } catch (e) {
    // ignora
  }
}

document.getElementById('rc-png').addEventListener('click', () =>
  runDownload('rc-png', async () => {
    const canvas = await capture();
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = fileBase() + '.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
  })
);

document.getElementById('rc-pdf').addEventListener('click', () =>
  runDownload('rc-pdf', async () => {
    const canvas = await capture();
    if (!window.jspdf) await loadScript(RC_LIBS.jspdf);
    const pdf = new window.jspdf.jsPDF({ unit: 'mm', format: 'a4', compress: true });
    const margen = 12;
    const w = 210 - margen * 2;
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', margen, margen, w, Math.min(h, 297 - margen * 2), undefined, 'FAST');
    pdf.save(fileBase() + '.pdf');
    rcTrack('descarga');
  })
);

document.getElementById('rc-print').addEventListener('click', () => window.print());

document.getElementById('rc-copy').addEventListener('click', async () => {
  const url = location.origin + location.pathname + '?t=' + encodeURIComponent(RC_TOKEN);
  try {
    await navigator.clipboard.writeText(url);
    setMsg(I18n.t('rcCopied'));
  } catch (e) {
    window.prompt('URL', url);
  }
});

document.getElementById('rc-type').addEventListener('change', (e) => {
  rcTipo = e.target.value;
  renderDoc();
});
document.getElementById('rc-recipient').addEventListener('input', renderDoc);
document.getElementById('rc-purpose').addEventListener('input', () => {
  purposeIsDefault = false;
  renderDoc();
});

// ---------------- Init ----------------

async function load() {
  const status = document.getElementById('rc-status');
  if (!RC_TOKEN) {
    status.dataset.err = '1';
    status.textContent = I18n.t('rcNotFound');
    return;
  }
  status.textContent = I18n.t('loadingText');
  try {
    const res = await apiCall('obtenerRecibo', { token: RC_TOKEN });
    recibo = res.recibo;
    rcTipo = recibo.tipo;
    status.style.display = 'none';
    purposeIsDefault = !recibo.concepto;
    document.getElementById('rc-purpose').value = recibo.concepto || defaultPurpose();
    document.getElementById('rc-recipient').value = recibo.destinatario || '';
    document.getElementById('rc-controls').style.display = '';
    document.getElementById('rc-doc').style.display = '';
    document.getElementById('rc-actions').style.display = '';
    refresh();
    rcTrack('visto');
  } catch (err) {
    status.dataset.err = '1';
    status.textContent = err.codigo === 'reciboNoEncontrado' ? I18n.t('rcNotFound') : err.message;
  }
}

renderSiteHeader(`<span id="lang-select-slot"></span>`);
renderSiteFooter();
renderLangSelect(document.getElementById('lang-select-slot'));
onLangChange();
load();
