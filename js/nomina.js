/* Recibos de pago (給与明細書): cada colaborador ve los suyos mes a mes; el
   admin puede ver los de cualquiera. Los recibos los genera el admin desde
   Turnos con "Registrar pago". Mismo formato que una 給与明細書 japonesa. */

const ADMIN_SESSION_KEY = 'boogaloo_admin_session_v1';
const COMPANY_NAME = 'Boogaloo';
const fmtN = (n) => (Number(n) ? Math.round(Number(n)).toLocaleString('ja-JP') : '');

// [japonés, es, en, pt] -- el formato es el japonés; debajo va la traducción.
const PS = {
  no: ['社員No.', 'N.º empleado', 'Employee No.', 'N.º funcionário'],
  dept: ['所属コード', 'Código área', 'Dept. code', 'Cód. área'],
  name: ['氏 名', 'Nombre', 'Name', 'Nome'],
  title: ['給 与 明 細 書', 'Recibo de pago', 'Payslip', 'Recibo de pagamento'],
  payDate: ['支給日', 'Fecha de pago', 'Payment date', 'Data de pagamento'],
  work: ['勤 務', 'Trabajo', 'Work', 'Trabalho'],
  days: ['勤務日数', 'Días', 'Days', 'Dias'],
  hours: ['出勤時間', 'Horas', 'Hours', 'Horas'],
  ot: ['残業', 'Extra', 'Overtime', 'Extra'],
  otn: ['深夜残業', 'Extra nocturna', 'Night OT', 'Extra noturna'],
  oth: ['休日残業', 'Extra festivo', 'Holiday OT', 'Extra feriado'],
  pay: ['支 給 明 細', 'Ingresos', 'Earnings', 'Proventos'],
  base: ['基本給', 'Pago base', 'Base pay', 'Pagamento base'],
  otp: ['残業手当', 'Pago extra', 'Overtime pay', 'Pgto. extra'],
  otnp: ['深夜残業手当', 'Extra nocturna', 'Night OT pay', 'Extra noturna'],
  othp: ['休日出勤手当', 'Festivos', 'Holiday pay', 'Feriados'],
  abs: ['勤怠減額', 'Descuento faltas', 'Absence deduction', 'Desc. faltas'],
  tsG: ['課税通勤費', 'Transporte gravable', 'Taxable commute', 'Transp. tributável'],
  tsN: ['非課税通勤費', 'Transporte no gravable', 'Non-tax. commute', 'Transp. não trib.'],
  payTotal: ['支給額合計', 'Total ingresos', 'Total earnings', 'Total proventos'],
  ded: ['控 除 明 細', 'Deducciones', 'Deductions', 'Descontos'],
  kenpo: ['健康保険料', 'Seguro de salud', 'Health ins.', 'Seguro saúde'],
  kosei: ['厚生年金料', 'Pensión', 'Pension', 'Previdência'],
  koyo: ['雇用保険料', 'Seguro de empleo', 'Employment ins.', 'Seguro-desemprego'],
  shakai: ['社会保険料合計', 'Total seguros', 'Total insurance', 'Total seguros'],
  kazei: ['課税対象額', 'Base gravable', 'Taxable amount', 'Base tributável'],
  shotoku: ['所得税', 'Imp. renta', 'Income tax', 'Imp. renda'],
  juumin: ['住民税', 'Imp. residencial', 'Resident tax', 'Imp. residencial'],
  dedTotal: ['控除額合計', 'Total deducciones', 'Total deductions', 'Total descontos'],
  net: ['差引支給額', 'Neto a pagar', 'Net pay', 'Valor líquido'],
  memo: ['メ モ', 'Memo', 'Memo', 'Memo'],
  sama: ['様', '', '', ''],
};

let identity = null;
let nominas = [];
let selectedColab = '';
let selectedMes = '';

function detectIdentity() {
  try {
    const admin = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');
    if (admin && admin.token) return { esAdmin: true, usuario: admin.usuario, token: admin.token, nombre: 'Admin' };
  } catch (e) {
    // ignora
  }
  if (Session.isColaborador()) {
    return { esAdmin: false, clienteId: Session.data.clienteId, token: Session.data.token, nombre: Session.data.nombre };
  }
  return null;
}

function authParams() {
  return identity.esAdmin ? { usuario: identity.usuario, token: identity.token } : { clienteId: identity.clienteId, token: identity.token };
}

function langIdx() {
  return { ja: 0, es: 1, en: 2, pt: 3 }[I18n.lang] || 1;
}

// Celda de etiqueta: japonés arriba y, si el idioma no es japonés, la traducción pequeña.
function lbl(key) {
  const row = PS[key];
  const tr = langIdx() === 0 ? '' : `<small>${row[langIdx()]}</small>`;
  return `<span class="ps-l">${row[0]}</span>${tr}`;
}

function monthTitle(mes) {
  const [y, m] = mes.split('-').map(Number);
  return `${y}年${m}月`;
}

function slipHtml(n) {
  const cell = (label, value, cls = '') => `<div class="ps-cell ${cls}"><div class="ps-h">${lbl(label)}</div><div class="ps-v">${value}</div></div>`;
  const turnos = (n.turnos || [])
    .map((t) => `${t.fecha.slice(5).replace('-', '/')} ${t.inicio}–${t.fin} (${Number(t.horas).toFixed(1)}h · ¥${fmtN(t.valor)})`)
    .join(' / ');
  return `
  <div class="payslip" id="payslip">
    <div class="ps-top">
      <div class="ps-id">
        <div class="ps-cell"><div class="ps-h">${lbl('no')}</div><div class="ps-v">${n.colaboradorId.replace('CLI-', '')}</div></div>
        <div class="ps-cell"><div class="ps-h">${lbl('dept')}</div><div class="ps-v"></div></div>
        <div class="ps-cell ps-name"><div class="ps-h">${lbl('name')}</div><div class="ps-v">${n.colaboradorNombre} <span class="ps-sama">${PS.sama[0]}</span></div></div>
      </div>
      <div class="ps-title">
        <h2>${monthTitle(n.mes)} ${PS.title[0]}</h2>
        ${langIdx() === 0 ? '' : `<small>${PS.title[langIdx()]}</small>`}
        <div class="ps-date">${PS.payDate[0]}: ${n.fechaPago || ''}</div>
        <div class="ps-co">${COMPANY_NAME}</div>
      </div>
    </div>

    <div class="ps-block"><div class="ps-side">${PS.work[0]}</div><div class="ps-grid g5">
      ${cell('days', n.dias)}${cell('hours', n.horas)}${cell('ot', '')}${cell('otn', '')}${cell('oth', '')}
    </div></div>

    <div class="ps-block"><div class="ps-side">${PS.pay[0]}</div><div class="ps-grid g7">
      ${cell('base', fmtN(n.base))}${cell('otp', '')}${cell('otnp', '')}${cell('othp', '')}${cell('abs', '')}${cell('tsG', fmtN(n.tsukinGravado))}${cell('tsN', fmtN(n.tsukinNoGravado))}
      <div class="ps-fill s6"></div>${cell('payTotal', fmtN(n.shikyuTotal), 'ps-total')}
    </div></div>

    <div class="ps-block"><div class="ps-side">${PS.ded[0]}</div>
    ${n.seguros === false
      ? `<div class="ps-grid g3">
      ${cell('kazei', fmtN(n.kazeiTaisho))}${cell('shotoku', fmtN(n.shotoku))}${cell('juumin', fmtN(n.juumin))}
      <div class="ps-fill s2"></div>${cell('dedTotal', fmtN(n.kojoTotal), 'ps-total')}
      <div class="ps-fill s2"></div>${cell('net', fmtN(n.sashihiki), 'ps-total ps-net')}
    </div>`
      : `<div class="ps-grid g7">
      ${cell('kenpo', fmtN(n.kenpo))}${cell('kosei', fmtN(n.kosei))}${cell('koyo', fmtN(n.koyo))}${cell('shakai', fmtN(n.shakaiTotal))}${cell('kazei', fmtN(n.kazeiTaisho))}${cell('shotoku', fmtN(n.shotoku))}${cell('juumin', fmtN(n.juumin))}
      <div class="ps-fill s6"></div>${cell('dedTotal', fmtN(n.kojoTotal), 'ps-total')}
      <div class="ps-fill s6"></div>${cell('net', fmtN(n.sashihiki), 'ps-total ps-net')}
    </div>`}
    </div>

    <div class="ps-block"><div class="ps-side">${PS.memo[0]}</div><div class="ps-memo">
      ${n.memo ? `<p>${n.memo.replace(/</g, '&lt;')}</p>` : ''}
      ${turnos ? `<p class="ps-shifts">${I18n.t('nmShiftsDetail')}: ${turnos}</p>` : ''}
    </div></div>
  </div>`;
}

function render() {
  const emptyEl = document.getElementById('nm-empty');
  const slipEl = document.getElementById('nm-slip');
  const visibles = nominas.filter((n) => !identity.esAdmin || !selectedColab || n.colaboradorId === selectedColab);

  if (identity.esAdmin) {
    const sel = document.getElementById('nm-colab-select');
    const colabs = {};
    nominas.forEach((n) => (colabs[n.colaboradorId] = n.colaboradorNombre));
    sel.innerHTML = Object.entries(colabs).map(([id, nombre]) => `<option value="${id}" ${id === selectedColab ? 'selected' : ''}>${nombre}</option>`).join('');
  }

  const meses = visibles.map((n) => n.mes);
  if (!meses.length) {
    emptyEl.textContent = I18n.t('nmNoData');
    emptyEl.style.display = 'block';
    document.getElementById('nm-months').innerHTML = '';
    slipEl.innerHTML = '';
    return;
  }
  emptyEl.style.display = 'none';
  if (!meses.includes(selectedMes)) selectedMes = meses[0];
  document.getElementById('nm-months').innerHTML = meses
    .map((m) => `<button type="button" class="pill-option${m === selectedMes ? ' selected' : ''}" data-mes="${m}">${monthTitle(m)}</button>`)
    .join('');
  slipEl.innerHTML = slipHtml(visibles.find((n) => n.mes === selectedMes));
}

async function load() {
  try {
    const res = await apiCall('listarNominas', authParams());
    nominas = res.nominas;
  } catch (err) {
    nominas = [];
    document.getElementById('nm-empty').textContent = err.message;
  }
  if (identity.esAdmin && !selectedColab && nominas.length) selectedColab = nominas[0].colaboradorId;
  render();
}

document.getElementById('nm-months').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mes]');
  if (!b) return;
  selectedMes = b.dataset.mes;
  render();
});
document.getElementById('nm-colab-select').addEventListener('change', (e) => {
  selectedColab = e.target.value;
  selectedMes = '';
  render();
});
document.getElementById('nm-print').addEventListener('click', () => window.print());

function applyStaticI18n() {
  applyLayoutI18n();
  document.getElementById('page-subtitle').textContent = I18n.t('hubNominaBtn');
  document.getElementById('nm-denied-text').textContent = I18n.t('nmDenied');
  document.getElementById('nm-print').textContent = I18n.t('nmPrint');
  document.getElementById('nm-colab-label').textContent = I18n.t('nmSelectColab');
}

function onLangChange() {
  applyStaticI18n();
  if (identity) render();
}

renderSiteHeader(`
  <span id="lang-select-slot"></span>
  <a class="cart-btn" href="index.html" style="text-decoration:none;">←</a>
`);
renderSiteFooter();
renderLangSelect(document.getElementById('lang-select-slot'));

identity = detectIdentity();
applyStaticI18n();
if (!identity) {
  document.getElementById('nm-denied').style.display = 'block';
} else {
  document.getElementById('nm-app').style.display = 'block';
  if (identity.esAdmin) document.getElementById('nm-colab-field').style.display = 'block';
  load();
}
