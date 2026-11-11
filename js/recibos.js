/* Lista de recibos y facturas emitidos, con su seguimiento (admin.html#recibos).
   Estado: Enviado = emitido y nadie abrió el enlace; Visto = se abrió el enlace;
   Descargado = se bajó el PDF. Los eventos los registra recibo.html (primera
   apertura y cada descarga del PDF) y no cuentan si quien abre es el staff. */

const RCL = {
  title: L('Recibos', 'Receipts', '領収書', 'Recibos'),
  st: {
    enviado: L('Enviado', 'Sent', '送信済み', 'Enviado'),
    visto: L('Visto', 'Viewed', '閲覧済み', 'Visto'),
    descargado: L('Descargado', 'Downloaded', 'ダウンロード済み', 'Baixado'),
  },
  fAll: L('Todos', 'All', 'すべて', 'Todos'),
  fUnopened: L('Sin abrir', 'Not opened', '未開封', 'Não abertos'),
  fSeen: L('Vistos', 'Viewed', '閲覧済み', 'Vistos'),
  fDown: L('Descargados', 'Downloaded', 'ダウンロード済み', 'Baixados'),
  empty: L('Todavía no hay recibos emitidos.', 'No receipts issued yet.', '発行済みの領収書はまだありません。', 'Ainda não há recibos emitidos.'),
  emptyFilter: L('Ningún recibo en este filtro.', 'No receipts in this filter.', 'この条件に該当する領収書はありません。', 'Nenhum recibo neste filtro.'),
  hintUnopened: L('Estos recibos están emitidos pero el cliente aún no abrió el enlace: vale la pena recordárselo.', 'These receipts are issued but the customer has not opened the link yet — worth a reminder.', '発行済みですが、お客様がまだリンクを開いていません。リマインドしましょう。', 'Estes recibos foram emitidos mas o cliente ainda não abriu o link — vale lembrar.'),
  hintTrack: L('El estado cuenta cuando el cliente abre el enlace o descarga el PDF. Lo que abres tú desde el panel no se cuenta.', 'Status counts when the customer opens the link or downloads the PDF. What you open from the panel is not counted.', 'お客様がリンクを開く／PDFをダウンロードすると記録されます。管理画面から開いた分は記録されません。', 'O estado conta quando o cliente abre o link ou baixa o PDF. O que você abre pelo painel não conta.'),
  invoice: L('Factura', 'Invoice', '請求書', 'Fatura'),
  receipt: L('Recibo', 'Receipt', '領収書', 'Recibo'),
  to: L('A nombre de', 'Issued to', '宛名', 'Em nome de'),
  issued: L((t) => `Emitido ${t}`, (t) => `Issued ${t}`, (t) => `発行 ${t}`, (t) => `Emitido ${t}`),
  firstOpen: L((t) => `Primera apertura: ${t}`, (t) => `First opened: ${t}`, (t) => `初回閲覧：${t}`, (t) => `Primeira abertura: ${t}`),
  downloads: L((n) => (n === 1 ? '1 descarga del PDF' : `${n} descargas del PDF`), (n) => (n === 1 ? '1 PDF download' : `${n} PDF downloads`), (n) => `PDFダウンロード ${n}回`, (n) => (n === 1 ? '1 download do PDF' : `${n} downloads do PDF`)),
  lastDown: L((t) => `Última descarga: ${t}`, (t) => `Last download: ${t}`, (t) => `最終ダウンロード：${t}`, (t) => `Último download: ${t}`),
  nobody: L('Nadie lo ha abierto', 'Nobody has opened it', 'まだ誰も開いていません', 'Ninguém abriu ainda'),
  copy: L('Copiar enlace', 'Copy link', 'リンクをコピー', 'Copiar link'),
  copied: L('¡Copiado!', 'Copied!', 'コピーしました', 'Copiado!'),
  open: L('Abrir', 'Open', '開く', 'Abrir'),
  statusLabel: L('Estado', 'Status', '状態', 'Estado'),
  refresh: L('Actualizar', 'Refresh', '更新', 'Atualizar'),
  fromOrder: L('Pedido', 'Order', '注文', 'Pedido'),
  fromEvent: L('Inscripción', 'Sign-up', '申込', 'Inscrição'),
};

let rclData = [];
let rclFilter = 'todos';

function rclT(o, ...args) {
  const v = o[(typeof I18n !== 'undefined' && I18n.lang) || 'es'] || o.es;
  return typeof v === 'function' ? v(...args) : v;
}

const rclLocale = () => ({ es: 'es-CO', en: 'en-US', ja: 'ja-JP', pt: 'pt-BR' }[I18n.lang] || 'es-CO');

// Fecha y hora cortas; con año solo si no es el actual. Si solo hay fecha (recibos
// anteriores al seguimiento), muestra solo la fecha.
function rclTime(iso) {
  if (!iso) return '';
  const hasTime = String(iso).indexOf('T') !== -1;
  const d = new Date(hasTime ? iso : iso + 'T00:00:00+09:00');
  if (isNaN(d)) return String(iso);
  const opts = { month: 'short', day: 'numeric' };
  if (d.getFullYear() !== new Date().getFullYear()) opts.year = 'numeric';
  if (hasTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
  return d.toLocaleString(rclLocale(), opts);
}

function rclEsc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// {estado, hora} a partir de las columnas de seguimiento de una fila de pedido/inscripción.
function rclStatusOf(visto, descargasRaw) {
  let descargas = [];
  try { descargas = Array.isArray(descargasRaw) ? descargasRaw : JSON.parse(descargasRaw || '[]'); } catch (e) { descargas = []; }
  const v = visto instanceof Date ? visto.toISOString() : String(visto || '');
  if (descargas.length) return { estado: 'descargado', hora: descargas[descargas.length - 1], descargas };
  if (v) return { estado: 'visto', hora: v, descargas };
  return { estado: 'enviado', hora: '', descargas };
}

function rclBadge(estado, hora) {
  return `<span class="rcl-badge rcl-${estado}">${rclEsc(rclT(RCL.st[estado]))}${hora ? ` · ${rclEsc(rclTime(hora))}` : ''}</span>`;
}

function rclApplyStatic() {
  document.getElementById('rcl-title').textContent = rclT(RCL.title);
  document.getElementById('rcl-back-btn').textContent = I18n.t('backToHubBtn');
  document.getElementById('rcl-logout-btn').textContent = I18n.t('logoutBtn');
  document.getElementById('rcl-refresh-btn').textContent = rclT(RCL.refresh);
  const hub = document.getElementById('hub-recibos-btn');
  if (hub) hub.textContent = rclT(RCL.title);
}

async function loadRecibos(silent) {
  const msg = document.getElementById('rcl-status');
  if (!silent) msg.textContent = I18n.t('loadingText');
  try {
    rclData = (await apiCall('listarRecibos', authParams())).recibos;
    msg.textContent = '';
    renderRecibos();
  } catch (err) {
    if (err.codigo === 'noAutorizado' || err.codigo === 'sesionExpirada') {
      identity = null;
      clearAdminSession();
      Session.clear();
      showLogin(I18n.t('sessionExpiredMsg'));
      return;
    }
    msg.textContent = I18n.t('errorLoadingPrefix') + err.message;
  }
}

function showRecibos() {
  hideAllViews();
  document.getElementById('recibos-view').style.display = 'block';
  document.getElementById('rcl-who-label').textContent = identityLabel();
  rclApplyStatic();
  loadRecibos(false);
}

function renderRecibos() {
  rclApplyStatic();
  const counts = { todos: rclData.length, enviado: 0, visto: 0, descargado: 0 };
  rclData.forEach((r) => counts[r.estado]++);
  const filters = [
    ['todos', RCL.fAll, counts.todos],
    ['enviado', RCL.fUnopened, counts.enviado],
    ['visto', RCL.fSeen, counts.visto],
    ['descargado', RCL.fDown, counts.descargado],
  ];
  document.getElementById('rcl-filters').innerHTML = filters
    .map(([id, label, n]) => `<button data-rcl-filter="${id}" type="button" class="${rclFilter === id ? 'active' : ''}">${rclEsc(rclT(label))} (${n})</button>`)
    .join('');

  const rows = rclFilter === 'todos' ? rclData : rclData.filter((r) => r.estado === rclFilter);
  const list = document.getElementById('rcl-list');
  const hint = rclFilter === 'enviado' && rows.length ? `<p class="subt">${rclEsc(rclT(RCL.hintUnopened))}</p>` : '';
  if (!rows.length) {
    list.innerHTML = `<p class="subt">${rclEsc(rclT(rclData.length ? RCL.emptyFilter : RCL.empty))}</p>`;
    return;
  }
  list.innerHTML = hint + rows.map((r) => {
    const last = r.descargas.length ? r.descargas[r.descargas.length - 1] : '';
    const lines = [
      `${rclT(r.documento === 'factura' ? RCL.invoice : RCL.receipt)} · ${rclT(r.origen === 'inscripcion' ? RCL.fromEvent : RCL.fromOrder)} ${r.id}`,
      r.destinatario ? `${rclT(RCL.to)}: ${r.destinatario}` : '',
      r.emitido ? rclT(RCL.issued, rclTime(r.emitido)) : '',
      r.estado === 'enviado' ? rclT(RCL.nobody) : rclT(RCL.firstOpen, rclTime(r.visto)),
      r.descargas.length ? `${rclT(RCL.downloads, r.descargas.length)} · ${rclT(RCL.lastDown, rclTime(last))}` : '',
    ].filter(Boolean);
    return `
      <div class="order-card rcl-card">
        <div class="rcl-head">
          <div><b>${rclEsc(r.cliente || '—')}</b> <span class="rcl-total">${rclEsc(typeof fmt === 'function' ? fmt(r.total) : '¥' + r.total)}</span></div>
          ${rclBadge(r.estado, r.estado === 'enviado' ? '' : r.estado === 'visto' ? r.visto : last)}
        </div>
        <p class="subt" style="margin:4px 0 8px;">${rclEsc(r.concepto)}</p>
        <div class="rcl-lines">${lines.map((l) => `<div>${rclEsc(l)}</div>`).join('')}</div>
        <div class="rcl-actions">
          <button class="ghost-btn" data-rcl-copy="${rclEsc(r.token)}" type="button">${rclEsc(rclT(RCL.copy))}</button>
          <a class="ghost-btn" href="${rclEsc(reciboUrl(r.token))}" target="_blank" rel="noopener" style="text-decoration:none;">${rclEsc(rclT(RCL.open))}</a>
        </div>
      </div>`;
  }).join('') + `<p class="subt" style="margin-top:14px;">${rclEsc(rclT(RCL.hintTrack))}</p>`;
}

document.getElementById('rcl-filters').addEventListener('click', (e) => {
  const b = e.target.closest('[data-rcl-filter]');
  if (!b) return;
  rclFilter = b.dataset.rclFilter;
  renderRecibos();
});

document.getElementById('rcl-list').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-rcl-copy]');
  if (!b) return;
  const url = reciboUrl(b.dataset.rclCopy);
  try {
    await navigator.clipboard.writeText(url);
    b.textContent = rclT(RCL.copied);
    setTimeout(() => { b.textContent = rclT(RCL.copy); }, 1500);
  } catch (err) {
    window.prompt('URL', url);
  }
});

// Línea de estado para el modal de emisión: "Estado: Visto · 12 nov, 10:32 · 2 descargas del PDF".
function rclStatusLine(row) {
  const st = rclStatusOf(row.ReciboVisto, row.ReciboDescargas);
  const extra = st.descargas.length ? ` · ${rclEsc(rclT(RCL.downloads, st.descargas.length))}` : '';
  return `${rclEsc(rclT(RCL.statusLabel))}: ${rclBadge(st.estado, st.hora)}${extra}`;
}
