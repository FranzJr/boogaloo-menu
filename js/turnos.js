/* Turnos de colaboradores: calendario mensual, elegir/soltar turnos abiertos,
   marcar horas trabajadas y (para admin) confirmar pago y gestionar tarifas. */

const ADMIN_SESSION_KEY = 'boogaloo_admin_session_v1';
const fmtY = (n) => '¥' + Math.round(Number(n) || 0).toLocaleString('ja-JP');

let identity = null; // { esAdmin, usuario|clienteId, nombre, token }
let currentMonth = new Date();
currentMonth.setDate(1);
let turnosCache = [];
let clientesCache = [];
let tarifasCache = [];
let horarioNegocio = { horaInicio: '10:00', horaFin: '19:00', diasHabiles: [1, 2, 3, 4, 5, 6] };

function pad2(n) {
  return String(n).padStart(2, '0');
}
function dstr(d) {
  return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
}
function horasEntre(hi, hf) {
  if (!hi || !hf) return 0;
  const [h1, m1] = hi.split(':').map(Number);
  const [h2, m2] = hf.split(':').map(Number);
  return Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
}

function detectIdentity() {
  try {
    const admin = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');
    if (admin && admin.token) return { esAdmin: true, usuario: admin.usuario, token: admin.token, nombre: I18n.t('tnAdmin') };
  } catch (e) {
    // ignora
  }
  if (Session.isColaborador()) {
    return {
      esAdmin: false,
      clienteId: Session.data.clienteId,
      token: Session.data.token,
      nombre: Session.data.nombre,
      modoTurno: Session.data.modoTurno || 'elegir',
    };
  }
  return null;
}

function authParams() {
  return identity.esAdmin ? { usuario: identity.usuario, token: identity.token } : { clienteId: identity.clienteId, token: identity.token };
}

// ---------------- Carga de datos ----------------

async function loadMonth() {
  const y = currentMonth.getFullYear();
  const m = currentMonth.getMonth();
  const desde = dstr(new Date(y, m, 1));
  const hasta = dstr(new Date(y, m + 1, 0));
  document.getElementById('tn-table-body').innerHTML = '';
  document.getElementById('tn-list').innerHTML = `<p class="subt">${I18n.t('tnLoading')}</p>`;
  try {
    const res = await apiCall('listarTurnos', { ...authParams(), desde, hasta });
    turnosCache = res.turnos;
  } catch (err) {
    turnosCache = [];
  }
  if (identity.esAdmin) {
    await loadClientesYTarifas();
  }
  renderMonthLabel();
  renderStats();
  renderCalendar();
  renderLegend();
}

async function loadClientesYTarifas() {
  try {
    const [rc, rt] = await Promise.all([
      apiCall('listarClientes', authParams()),
      apiCall('listarTarifas', authParams()),
    ]);
    clientesCache = rc.clientes;
    tarifasCache = rt.tarifas;
  } catch (err) {
    clientesCache = [];
    tarifasCache = [];
  }
  renderTarifas();
  renderColaboradores();
}

function tarifaDe(colaboradorId) {
  const t = tarifasCache.find((x) => x.colaboradorId === colaboradorId);
  return t ? Number(t.valorHora) || 0 : 0;
}

// ---------------- Render ----------------

function renderMonthLabel() {
  const labels = I18n.t('tnMonthLabels');
  document.getElementById('tn-month-label').textContent =
    labels[currentMonth.getMonth()] + ' ' + currentMonth.getFullYear();
}

function estadoColorClass(estado) {
  if (estado === 'Confirmado') return 'confirmado';
  if (estado === 'Trabajado') return 'trabajado';
  if (estado === 'Asignado') return 'asignado';
  return 'abierto';
}

function estadoLabelTn(t) {
  if (!identity.esAdmin && t.ColaboradorID && !t.esPropio) return I18n.t('tnBusy');
  if (t.Estado === 'Confirmado') return I18n.t('tnConfirmed');
  if (t.Estado === 'Trabajado') return I18n.t('tnWorked');
  if (t.Estado === 'Asignado') return I18n.t('tnAssigned');
  return I18n.t('tnOpen');
}

function renderStats() {
  const el = document.getElementById('tn-stats');
  if (identity.esAdmin) {
    const porPersona = {};
    turnosCache.forEach((t) => {
      if (!t.ColaboradorID) return;
      const key = t.ColaboradorID;
      if (!porPersona[key]) porPersona[key] = { nombre: t.ColaboradorNombre, confirmadas: 0, pendientes: 0, valor: 0 };
      const h = horasEntre(t.HoraInicio, t.HoraFin);
      if (t.Estado === 'Confirmado') {
        porPersona[key].confirmadas += Number(t.Horas) || h;
        porPersona[key].valor += Number(t.ValorTotal) || 0;
      } else if (t.Trabajado === 'Si') {
        porPersona[key].pendientes += h;
      }
    });
    const cards = Object.values(porPersona)
      .map(
        (p) => `
      <div class="st"><b>${p.nombre}</b><small>${p.confirmadas.toFixed(1)} ${I18n.t('tnHours')} · ${fmtY(p.valor)}</small></div>`
      )
      .join('');
    el.innerHTML = cards || `<p class="subt">${I18n.t('tnNoShiftsMonth')}</p>`;
  } else {
    let confirmadas = 0;
    let valor = 0;
    let pendientes = 0;
    turnosCache
      .filter((t) => t.esPropio)
      .forEach((t) => {
        const h = horasEntre(t.HoraInicio, t.HoraFin);
        if (t.Estado === 'Confirmado') {
          confirmadas += Number(t.Horas) || h;
          valor += Number(t.ValorTotal) || 0;
        } else if (t.Trabajado === 'Si') {
          pendientes += h;
        }
      });
    el.innerHTML = `
      <div class="st"><b>${confirmadas.toFixed(1)} ${I18n.t('tnHours')}</b><small>${I18n.t('tnConfirmedHoursLabel')}</small></div>
      <div class="st"><b>${pendientes.toFixed(1)} ${I18n.t('tnHours')}</b><small>${I18n.t('tnPendingHoursLabel')}</small></div>
      <div class="st"><b>${fmtY(valor)}</b><small>${I18n.t('tnTotalToPay')}</small></div>
    `;
  }
}

function turnosDelDia(fechaStr) {
  return turnosCache.filter((t) => dstr(new Date(t.Fecha)) === fechaStr);
}

function shiftChipHtml(t) {
  const cls = estadoColorClass(identity.esAdmin || t.esPropio ? t.Estado : 'abierto-ajeno');
  const nombre = t.Estado === 'Abierto' ? I18n.t('tnOpen') : estadoLabelTn(t) === I18n.t('tnBusy') ? I18n.t('tnBusy') : t.ColaboradorNombre || estadoLabelTn(t);
  return `<div class="tn-chip tn-${cls}" data-turno="${t.ID}">
    <b>${nombre}</b><i>${t.HoraInicio}–${t.HoraFin}</i>
  </div>`;
}

function buildMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay(); // 0=domingo
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks = [];
  let week = new Array(startWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }
  return weeks;
}

function renderCalendar() {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const weekdays = I18n.t('tnWeekdays');

  document.getElementById('tn-table-head').innerHTML = weekdays.map((w) => `<th>${w}</th>`).join('');

  const weeks = buildMonthMatrix(year, month);
  document.getElementById('tn-table-body').innerHTML = weeks
    .map(
      (week) => `<tr>${week
        .map((day) => {
          if (!day) return '<td class="tn-empty"></td>';
          const fechaStr = dstr(new Date(year, month, day));
          const turnos = turnosDelDia(fechaStr);
          return `<td data-fecha="${fechaStr}">
            <span class="n">${day}</span>
            ${turnos.map(shiftChipHtml).join('')}
            ${identity.esAdmin ? `<button class="tn-add-cell" data-fecha="${fechaStr}" type="button">+</button>` : ''}
          </td>`;
        })
        .join('')}</tr>`
    )
    .join('');

  const sorted = turnosCache.slice().sort((a, b) => new Date(a.Fecha) - new Date(b.Fecha));
  document.getElementById('tn-list').innerHTML = sorted.length
    ? sorted
        .map((t) => {
          const d = new Date(t.Fecha);
          const w = weekdays[d.getDay()];
          const nombre =
            t.Estado === 'Abierto' ? I18n.t('tnOpen') : !identity.esAdmin && !t.esPropio ? I18n.t('tnBusy') : t.ColaboradorNombre;
          return `<div class="tn-li" data-turno="${t.ID}">
            <span class="d">${d.getDate()}</span>
            <span class="w">${w}</span>
            <span class="p">${nombre}<small>${t.HoraInicio}–${t.HoraFin}</small></span>
            <span class="tn-dot tn-${estadoColorClass(t.Estado)}"></span>
          </div>`;
        })
        .join('')
    : `<p class="subt" style="padding:14px 2px;">${I18n.t('tnNoShiftsMonth')}</p>`;
}

function renderLegend() {
  document.getElementById('tn-legend').innerHTML = `
    <div class="tn-lg"><span class="tn-dot tn-abierto"></span><div><b>${I18n.t('tnOpen')}</b><small>${I18n.t('tnLegendOpen')}</small></div></div>
    <div class="tn-lg"><span class="tn-dot tn-asignado"></span><div><b>${I18n.t('tnAssigned')}</b><small>${I18n.t('tnLegendAssigned')}</small></div></div>
    <div class="tn-lg"><span class="tn-dot tn-trabajado"></span><div><b>${I18n.t('tnWorked')}</b><small>${I18n.t('tnLegendWorked')}</small></div></div>
    <div class="tn-lg"><span class="tn-dot tn-confirmado"></span><div><b>${I18n.t('tnConfirmed')}</b><small>${I18n.t('tnLegendConfirmed')}</small></div></div>
  `;
}

function renderTarifas() {
  const el = document.getElementById('tn-tarifas-body');
  const colabs = clientesCache.filter((c) => c.rol === 'colaborador');
  el.innerHTML = colabs.length
    ? colabs
        .map(
          (c) => `
      <div class="tn-rate-row">
        <span>${c.nombre}</span>
        <input type="number" min="0" step="10" value="${tarifaDe(c.id)}" data-tarifa="${c.id}" data-nombre="${c.nombre}" />
        <span>${I18n.t('tnPerHour')}</span>
        <button class="ghost-btn" data-save-tarifa="${c.id}" type="button">${I18n.t('tnSetRate')}</button>
      </div>`
        )
        .join('')
    : `<p class="subt">—</p>`;
}

function renderColaboradores() {
  const el = document.getElementById('tn-colabs-body');
  el.innerHTML = clientesCache.length
    ? clientesCache
        .map((c) => {
          const modo = c.modoTurno || 'elegir';
          const modoBtn =
            c.rol === 'colaborador'
              ? `<button class="ghost-btn" data-toggle-modo="${c.id}" data-modo="${modo}" type="button" title="${modo === 'libre' ? I18n.t('tnModeLibreDesc') : I18n.t('tnModeElegirDesc')}">
                  ${I18n.t('tnModeLabel')}: ${modo === 'libre' ? I18n.t('tnModeLibre') : I18n.t('tnModeElegir')}
                </button>`
              : '';
          return `
      <div class="tn-mode-row">
        <span class="name">${c.nombre}<small>${c.email}</small></span>
        ${modoBtn}
        <button class="ghost-btn" data-toggle-rol="${c.id}" data-rol="${c.rol}" type="button">
          ${c.rol === 'colaborador' ? I18n.t('tnMakeClient') : I18n.t('tnMakeColab')}
        </button>
      </div>`;
        })
        .join('')
    : `<p class="subt">—</p>`;
}

// ---------------- Modal de detalle ----------------

const tnModal = document.getElementById('tn-modal');
const tnModalBody = document.getElementById('tn-modal-body');

function closeTnModal() {
  tnModal.classList.remove('open');
}
tnModal.addEventListener('click', (e) => {
  if (e.target === tnModal) closeTnModal();
});

function openTurnoModal(turnoId) {
  const t = turnosCache.find((x) => x.ID === turnoId);
  if (!t) return;
  const esAjeno = !identity.esAdmin && t.ColaboradorID && !t.esPropio;
  const fecha = new Date(t.Fecha).toLocaleDateString();

  let body = `
    <h2>${fecha}</h2>
    <p class="subt">${t.HoraInicio}–${t.HoraFin} · ${estadoLabelTn(t)}</p>
  `;

  if (esAjeno) {
    body += `<button class="ghost-btn" id="tn-modal-close" type="button">${I18n.t('tnClose')}</button>`;
  } else if (t.Estado === 'Abierto') {
    if (identity.esAdmin) {
      body += `<button class="primary-btn" id="tn-modal-delete" type="button">${I18n.t('tnDelete')}</button>`;
    } else {
      body += `<button class="primary-btn" id="tn-modal-claim" type="button">${I18n.t('tnClaim')}</button>`;
    }
  } else {
    body += `<div class="order-summary"><div class="row"><span>${I18n.t('nameLabel')}</span><span>${t.ColaboradorNombre}</span></div></div>`;

    if (t.Estado === 'Confirmado') {
      body += `<div class="order-summary">
        <div class="row"><span>${I18n.t('tnHours')}</span><span>${Number(t.Horas).toFixed(1)}</span></div>
        <div class="row"><span>${I18n.t('tnValue')}</span><span>${fmtY(t.ValorTotal)}</span></div>
      </div>`;
    }

    if (!identity.esAdmin && t.esPropio) {
      if (t.Estado === 'Asignado') {
        body += `<button class="primary-btn" id="tn-modal-worked" type="button">${I18n.t('tnMarkWorked')}</button>`;
        body += `<button class="ghost-btn" id="tn-modal-release" type="button" style="margin-top:8px;">${I18n.t('tnRelease')}</button>`;
      } else if (t.Estado === 'Trabajado') {
        body += `<button class="ghost-btn" id="tn-modal-unworked" type="button">${I18n.t('tnMarkNotWorked')}</button>`;
      }
    }

    if (identity.esAdmin) {
      if (t.Trabajado === 'Si' && t.Estado !== 'Confirmado') {
        body += `<button class="primary-btn" id="tn-modal-confirm" type="button">${I18n.t('tnConfirmPay')}</button>`;
      }
      body += `<button class="ghost-btn" id="tn-modal-delete" type="button" style="margin-top:8px;">${I18n.t('tnDelete')}</button>`;
    }

    body += `<button class="ghost-btn" id="tn-modal-close" type="button" style="margin-top:8px;">${I18n.t('tnClose')}</button>`;
  }

  tnModalBody.innerHTML = body;
  tnModal.classList.add('open');

  const closeBtn = document.getElementById('tn-modal-close');
  if (closeBtn) closeBtn.onclick = closeTnModal;

  const claimBtn = document.getElementById('tn-modal-claim');
  if (claimBtn) claimBtn.onclick = () => doAction('elegirTurno', { turnoId }, claimBtn);

  const releaseBtn = document.getElementById('tn-modal-release');
  if (releaseBtn) releaseBtn.onclick = () => doAction('cancelarTurno', { turnoId }, releaseBtn);

  const workedBtn = document.getElementById('tn-modal-worked');
  if (workedBtn) workedBtn.onclick = () => doAction('marcarTrabajado', { turnoId, trabajado: true }, workedBtn);

  const unworkedBtn = document.getElementById('tn-modal-unworked');
  if (unworkedBtn) unworkedBtn.onclick = () => doAction('marcarTrabajado', { turnoId, trabajado: false }, unworkedBtn);

  const confirmBtn = document.getElementById('tn-modal-confirm');
  if (confirmBtn) confirmBtn.onclick = () => doAction('confirmarTurnoAdmin', { turnoId }, confirmBtn);

  const deleteBtn = document.getElementById('tn-modal-delete');
  if (deleteBtn)
    deleteBtn.onclick = () => {
      if (!confirm(I18n.t('tnConfirmDeleteShift'))) return;
      doAction('eliminarTurno', { turnoId }, deleteBtn);
    };
}

async function doAction(action, extra, btn) {
  btn.disabled = true;
  try {
    await apiCall(action, { ...authParams(), ...extra });
    closeTnModal();
    await loadMonth();
  } catch (err) {
    alert(err.message);
    btn.disabled = false;
  }
}

document.getElementById('tn-table-body').addEventListener('click', (e) => {
  const chip = e.target.closest('[data-turno]');
  if (chip) return openTurnoModal(chip.dataset.turno);
  const addBtn = e.target.closest('.tn-add-cell');
  if (addBtn) openNewShiftForm(addBtn.dataset.fecha);
});
document.getElementById('tn-list').addEventListener('click', (e) => {
  const li = e.target.closest('[data-turno]');
  if (li) openTurnoModal(li.dataset.turno);
});

// ---------------- Admin: nuevo turno ----------------

function openNewShiftForm(fechaPreset) {
  const form = document.getElementById('tn-new-shift-form');
  form.style.display = 'block';
  form.innerHTML = `
    <div class="field"><label>${I18n.t('tnDate')}</label><input type="date" id="tn-nf-fecha" value="${fechaPreset || dstr(new Date())}" /></div>
    <div class="field"><label>${I18n.t('tnStart')}</label><input type="time" id="tn-nf-inicio" value="10:00" /></div>
    <div class="field"><label>${I18n.t('tnEnd')}</label><input type="time" id="tn-nf-fin" value="15:00" /></div>
    <div class="form-error" id="tn-nf-error"></div>
    <button class="primary-btn" id="tn-nf-submit" type="button">${I18n.t('tnCreate')}</button>
    <button class="ghost-btn" id="tn-nf-cancel" type="button" style="margin-top:8px;">${I18n.t('tnCancel')}</button>
  `;
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('tn-nf-cancel').onclick = () => (form.style.display = 'none');
  document.getElementById('tn-nf-submit').onclick = async () => {
    const fecha = document.getElementById('tn-nf-fecha').value;
    const horaInicio = document.getElementById('tn-nf-inicio').value;
    const horaFin = document.getElementById('tn-nf-fin').value;
    const btn = document.getElementById('tn-nf-submit');
    btn.disabled = true;
    try {
      await apiCall('crearTurnoAbierto', { ...authParams(), fecha, horaInicio, horaFin });
      form.style.display = 'none';
      await loadMonth();
    } catch (err) {
      document.getElementById('tn-nf-error').textContent = err.message;
      document.getElementById('tn-nf-error').classList.add('show');
      btn.disabled = false;
    }
  };
}

document.getElementById('tn-new-shift-btn').addEventListener('click', () => openNewShiftForm());

// ---------------- Colaborador: registrar mi turno ----------------

function openRegisterForm() {
  const form = document.getElementById('tn-register-form');
  form.style.display = 'block';
  form.innerHTML = `
    <div class="field"><label>${I18n.t('tnDate')}</label><input type="date" id="tn-rf-fecha" value="${dstr(new Date())}" /></div>
    <div class="field"><label>${I18n.t('tnStart')}</label><input type="time" id="tn-rf-inicio" value="${horarioNegocio.horaInicio}" min="${horarioNegocio.horaInicio}" max="${horarioNegocio.horaFin}" /></div>
    <div class="field"><label>${I18n.t('tnEnd')}</label><input type="time" id="tn-rf-fin" value="${horarioNegocio.horaFin}" min="${horarioNegocio.horaInicio}" max="${horarioNegocio.horaFin}" /></div>
    <p class="subt">${I18n.t('tnBusinessHoursNote', horarioNegocio.horaInicio, horarioNegocio.horaFin)}</p>
    <div class="form-error" id="tn-rf-error"></div>
    <button class="primary-btn" id="tn-rf-submit" type="button">${I18n.t('tnCreate')}</button>
    <button class="ghost-btn" id="tn-rf-cancel" type="button" style="margin-top:8px;">${I18n.t('tnCancel')}</button>
  `;
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('tn-rf-cancel').onclick = () => (form.style.display = 'none');
  document.getElementById('tn-rf-submit').onclick = async () => {
    const fecha = document.getElementById('tn-rf-fecha').value;
    const horaInicio = document.getElementById('tn-rf-inicio').value;
    const horaFin = document.getElementById('tn-rf-fin').value;
    const btn = document.getElementById('tn-rf-submit');
    btn.disabled = true;
    try {
      await apiCall('registrarMiTurno', { ...authParams(), fecha, horaInicio, horaFin });
      form.style.display = 'none';
      await loadMonth();
    } catch (err) {
      document.getElementById('tn-rf-error').textContent = err.message;
      document.getElementById('tn-rf-error').classList.add('show');
      btn.disabled = false;
    }
  };
}

document.getElementById('tn-register-btn').addEventListener('click', () => openRegisterForm());

document.getElementById('tn-tarifas-body').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-save-tarifa]');
  if (!btn) return;
  const input = document.querySelector(`[data-tarifa="${btn.dataset.saveTarifa}"]`);
  btn.disabled = true;
  try {
    await apiCall('actualizarTarifa', {
      ...authParams(),
      colaboradorId: btn.dataset.saveTarifa,
      colaboradorNombre: input.dataset.nombre,
      valorHora: Number(input.value) || 0,
    });
    await loadClientesYTarifas();
  } catch (err) {
    alert(err.message);
  }
  btn.disabled = false;
});

document.getElementById('tn-colabs-body').addEventListener('click', async (e) => {
  const rolBtn = e.target.closest('[data-toggle-rol]');
  if (rolBtn) {
    const nuevoRol = rolBtn.dataset.rol === 'colaborador' ? 'cliente' : 'colaborador';
    rolBtn.disabled = true;
    try {
      await apiCall('cambiarRolCliente', { ...authParams(), clienteId: rolBtn.dataset.toggleRol, rol: nuevoRol });
      await loadClientesYTarifas();
    } catch (err) {
      alert(err.message);
    }
    rolBtn.disabled = false;
    return;
  }

  const modoBtn = e.target.closest('[data-toggle-modo]');
  if (modoBtn) {
    const nuevoModo = modoBtn.dataset.modo === 'libre' ? 'elegir' : 'libre';
    modoBtn.disabled = true;
    try {
      await apiCall('cambiarModoTurno', { ...authParams(), clienteId: modoBtn.dataset.toggleModo, modo: nuevoModo });
      await loadClientesYTarifas();
    } catch (err) {
      alert(err.message);
    }
    modoBtn.disabled = false;
  }
});

// ---------------- Navegación de mes ----------------

document.getElementById('tn-prev').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  loadMonth();
});
document.getElementById('tn-next').addEventListener('click', () => {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  loadMonth();
});

// ---------------- Idioma ----------------

function applyStaticI18n() {
  document.getElementById('tn-page-label').textContent = I18n.t('tnPageLabel');
  document.getElementById('tn-denied-text').textContent = I18n.t('tnDeniedText');
  document.getElementById('tn-new-shift-btn').textContent = I18n.t('tnNewShiftBtn');
  document.getElementById('tn-tarifas-title').textContent = I18n.t('tnTarifasTitle');
  document.getElementById('tn-colabs-title').textContent = I18n.t('tnColabsTitle');
  document.getElementById('tn-register-btn').textContent = I18n.t('tnRegisterShiftBtn');
  document.getElementById('tn-who').textContent = identity ? identity.nombre : '';
}

function onLangChange() {
  applyStaticI18n();
  if (identity) loadMonth();
}

renderLangSelect(document.getElementById('lang-select-slot'));

// ---------------- Init ----------------

applyStaticI18n();
identity = detectIdentity();

apiCall('configTurnos', {})
  .then((r) => {
    horarioNegocio = r.horarioNegocio;
  })
  .catch(() => {
    // usa el valor por defecto si el backend no está desplegado todavía
  });

if (!identity) {
  document.getElementById('tn-denied').style.display = 'block';
} else {
  document.getElementById('tn-app').style.display = 'block';
  document.getElementById('tn-who').textContent = identity.nombre;
  if (identity.esAdmin) {
    document.getElementById('tn-admin-tools').style.display = 'block';
  } else {
    document.getElementById('tn-colab-tools').style.display = 'block';
  }
  loadMonth();
}
