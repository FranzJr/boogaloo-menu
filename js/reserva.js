/* Página de reservas: identidad (invitado o cuenta), personas, fecha/hora
   (con opción de horario extendido) y selección opcional de items del menú. */

let identityState = { tab: 'invitado' };
let reservaItems = {}; // sku -> cantidad
// horarioSemanal: 0=domingo ... 6=sábado. Cada día abre en un rango distinto (o está
// cerrado); lo carga configTurnos, este es solo el valor de respaldo antes de esa carga.
let horarioSemanal = {
  0: { abierto: true, horaInicio: '11:00', horaFin: '16:00' },
  1: { abierto: false, horaInicio: '', horaFin: '' },
  2: { abierto: true, horaInicio: '11:00', horaFin: '18:00' },
  3: { abierto: true, horaInicio: '11:00', horaFin: '18:00' },
  4: { abierto: false, horaInicio: '', horaFin: '' },
  5: { abierto: true, horaInicio: '11:00', horaFin: '18:00' },
  6: { abierto: true, horaInicio: '11:00', horaFin: '18:00' },
};

function dstrToday() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function horarioDelDia(fechaStr) {
  if (!fechaStr) return null;
  const dia = new Date(fechaStr + 'T12:00:00').getDay();
  return horarioSemanal[dia] || { abierto: false, horaInicio: '', horaFin: '' };
}

function showRsError(msg) {
  const el = document.getElementById('rs-error');
  el.textContent = msg;
  el.classList.add('show');
}
function clearRsError() {
  document.getElementById('rs-error').classList.remove('show');
}
function showIdentityError(msg) {
  const el = document.getElementById('rs-identity-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

// ---------------- Identidad ----------------

function renderIdentityPanel() {
  const panel = document.getElementById('rs-identity-panel');
  if (Session.isLoggedIn()) {
    const s = Session.data;
    panel.innerHTML = `
      <p class="subt">${I18n.t('rsReservingAs')}</p>
      <div class="order-summary"><div class="row"><span>${I18n.t('nameLabel')}</span><span>${s.nombre}</span></div></div>
      <button class="ghost-btn" id="rs-change-identity" type="button" style="margin-top:8px;">${I18n.t('rsChangeIdentityBtn')}</button>
    `;
    document.getElementById('rs-change-identity').onclick = () => {
      Session.clear();
      renderIdentityPanel();
    };
    return;
  }

  const tabs = ['invitado', 'login', 'registro'];
  const tabLabels = { invitado: I18n.t('tabGuest'), login: I18n.t('tabLogin'), registro: I18n.t('tabRegister') };
  panel.innerHTML = `
    <p class="subt">${I18n.t('rsIdentitySub')}</p>
    <div class="tabs" id="rs-tabs">
      ${tabs.map((t) => `<button data-tab="${t}" class="${identityState.tab === t ? 'active' : ''}" type="button">${tabLabels[t]}</button>`).join('')}
    </div>
    <div class="form-error" id="rs-identity-error"></div>
    <div id="rs-tab-body"></div>
  `;
  document.getElementById('rs-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    identityState.tab = btn.dataset.tab;
    renderIdentityPanel();
  });
  renderIdentityTabBody();
}

function renderIdentityTabBody() {
  const el = document.getElementById('rs-tab-body');
  if (identityState.tab === 'invitado') {
    el.innerHTML = `
      <div class="field"><label>${I18n.t('nameLabel')}</label><input id="rs-g-nombre" type="text" placeholder="${I18n.t('yourNamePlaceholder')}" /></div>
      <div class="field"><label>${I18n.t('phoneOptionalLabel')}</label><input id="rs-g-telefono" type="tel" placeholder="${I18n.t('phonePlaceholder')}" /></div>
    `;
  } else if (identityState.tab === 'login') {
    el.innerHTML = `
      <div class="field"><label>${I18n.t('emailLabel')}</label><input id="rs-l-email" type="email" placeholder="${I18n.t('emailPlaceholder')}" /></div>
      <div class="field"><label>${I18n.t('passwordLabel')}</label><input id="rs-l-clave" type="password" placeholder="••••••••" /></div>
      <button class="primary-btn" id="rs-l-submit" type="button">${I18n.t('loginBtnText')}</button>
    `;
    document.getElementById('rs-l-submit').onclick = async () => {
      const email = document.getElementById('rs-l-email').value.trim();
      const clave = document.getElementById('rs-l-clave').value;
      if (!email || !clave) return showIdentityError(I18n.t('fillEmailPassError'));
      try {
        const res = await apiCall('loginCliente', { email, clave });
        Session.setCliente(res.cliente);
        renderIdentityPanel();
      } catch (err) {
        showIdentityError(err.message);
      }
    };
  } else if (identityState.tab === 'registro') {
    el.innerHTML = `
      <div class="field"><label>${I18n.t('nameLabel')}</label><input id="rs-r-nombre" type="text" /></div>
      <div class="field"><label>${I18n.t('emailLabel')}</label><input id="rs-r-email" type="email" /></div>
      <div class="field"><label>${I18n.t('phoneOptionalLabel')}</label><input id="rs-r-telefono" type="tel" /></div>
      <div class="field"><label>${I18n.t('passwordLabel')}</label><input id="rs-r-clave" type="password" /></div>
      <button class="primary-btn" id="rs-r-submit" type="button">${I18n.t('createAccountBtn')}</button>
    `;
    document.getElementById('rs-r-submit').onclick = async () => {
      const nombre = document.getElementById('rs-r-nombre').value.trim();
      const email = document.getElementById('rs-r-email').value.trim();
      const telefono = document.getElementById('rs-r-telefono').value.trim();
      const clave = document.getElementById('rs-r-clave').value;
      if (!nombre || !email || !clave) return showIdentityError(I18n.t('fillAllError'));
      try {
        const res = await apiCall('registrarCliente', { nombre, email, telefono, clave });
        Session.setCliente(res.cliente);
        renderIdentityPanel();
      } catch (err) {
        showIdentityError(err.message);
      }
    };
  }
}

function getClienteInfo() {
  if (Session.isLoggedIn()) {
    const s = Session.data;
    return { tipo: 'cliente', clienteId: s.clienteId, nombre: s.nombre, telefono: s.telefono || '', email: s.email || '' };
  }
  if (identityState.tab === 'invitado') {
    const nombreEl = document.getElementById('rs-g-nombre');
    const nombre = nombreEl ? nombreEl.value.trim() : '';
    const telefono = document.getElementById('rs-g-telefono').value.trim();
    return nombre ? { tipo: 'invitado', nombre, telefono } : null;
  }
  return null;
}

// ---------------- Horario ----------------

function updateHorarioUI() {
  const extendido = document.getElementById('rs-extendido').checked;
  const horaInput = document.getElementById('rs-hora');
  const extNote = document.getElementById('rs-extendido-note');
  const horarioNote = document.getElementById('rs-horario-note');
  const dia = horarioDelDia(document.getElementById('rs-fecha').value);

  if (extendido) {
    horaInput.removeAttribute('min');
    horaInput.removeAttribute('max');
    extNote.textContent = I18n.t('rsExtendedNote');
    extNote.style.display = 'block';
    horarioNote.className = 'subt';
    horarioNote.textContent = '';
    return;
  }
  extNote.style.display = 'none';

  if (dia && dia.abierto) {
    horaInput.min = dia.horaInicio;
    horaInput.max = dia.horaFin;
    horarioNote.className = 'subt';
    horarioNote.textContent = I18n.t('tnBusinessHoursNote', dia.horaInicio, dia.horaFin);
  } else {
    horaInput.removeAttribute('min');
    horaInput.removeAttribute('max');
    horarioNote.className = 'form-error show';
    horarioNote.textContent = I18n.t('rsClosedDayNote');
  }
}
document.getElementById('rs-extendido').addEventListener('change', updateHorarioUI);
document.getElementById('rs-fecha').addEventListener('change', updateHorarioUI);

// ---------------- Selector de menú ----------------

function renderMenuPicker() {
  const el = document.getElementById('rs-menu-picker');
  el.innerHTML = MENU_CATEGORIES.map((cat) => {
    const items = (cat.items || []).concat(cat.extras || []);
    const rows = items
      .map((it) => {
        const qty = reservaItems[it.sku] || 0;
        return `
        <div class="tn-rate-row">
          <span>${mi(it.nombre)}</span>
          <input type="number" min="0" step="1" value="${qty}" data-rs-item="${it.sku}" />
        </div>`;
      })
      .join('');
    return `<p class="subt" style="margin:10px 0 4px; font-weight:700;">${mi(cat.nombre)}</p>${rows}`;
  }).join('');
}

document.getElementById('rs-menu-picker').addEventListener('input', (e) => {
  const input = e.target.closest('[data-rs-item]');
  if (!input) return;
  reservaItems[input.dataset.rsItem] = Math.max(0, parseInt(input.value, 10) || 0);
});

// ---------------- Envío ----------------

document.getElementById('rs-submit-btn').addEventListener('click', async () => {
  clearRsError();

  const cliente = getClienteInfo();
  if (!cliente) {
    return showRsError(!Session.isLoggedIn() && identityState.tab !== 'invitado' ? I18n.t('rsCompleteIdentityError') : I18n.t('writeNameError'));
  }

  const personas = parseInt(document.getElementById('rs-personas').value, 10);
  const fecha = document.getElementById('rs-fecha').value;
  const hora = document.getElementById('rs-hora').value;
  const notas = document.getElementById('rs-notas').value.trim();
  if (!personas || personas < 1) return showRsError(I18n.t('rsPersonasError'));
  if (!fecha || !hora) return showRsError(I18n.t('rsFechaHoraError'));

  const extendido = document.getElementById('rs-extendido').checked;
  const dia = horarioDelDia(fecha);
  if (!extendido && (!dia || !dia.abierto || hora < dia.horaInicio || hora > dia.horaFin)) {
    return showRsError(I18n.t('rsClosedDayNote'));
  }

  const items = Object.keys(reservaItems)
    .filter((sku) => reservaItems[sku] > 0)
    .map((sku) => ({ sku, cantidad: reservaItems[sku] }));

  const btn = document.getElementById('rs-submit-btn');
  btn.disabled = true;
  btn.textContent = I18n.t('sendingBtn');
  try {
    const res = await apiCall('crearReserva', { cliente, personas, fecha, hora, notas, items });
    showSuccessView(res);
  } catch (err) {
    showRsError(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = I18n.t('rsSubmitBtn');
  }
});

function showSuccessView(res) {
  document.getElementById('rs-form-view').style.display = 'none';
  document.getElementById('rs-success-view').style.display = 'block';
  document.getElementById('rs-success-body').innerHTML = `
    <h2>${I18n.t('rsSuccessTitle')}</h2>
    <p class="subt">${res.fueraDeHorario ? I18n.t('rsSuccessExtendedMsg') : I18n.t('rsSuccessNormalMsg')}</p>
    <div class="order-summary"><div class="row"><span>${I18n.t('rsReservaIdLabel')}</span><span>${res.reservaId}</span></div></div>
    <a class="primary-btn" href="index.html" style="display:block; text-align:center; text-decoration:none; margin-top:14px;">${I18n.t('backToMenuBtn')}</a>
  `;
}

// ---------------- Idioma ----------------

function applyStaticI18n() {
  document.getElementById('rs-page-label').textContent = I18n.t('rsPageLabel');
  document.getElementById('rs-personas-label').textContent = I18n.t('rsPersonasLabel');
  document.getElementById('rs-fecha-label').textContent = I18n.t('tnDate');
  document.getElementById('rs-hora-label').textContent = I18n.t('rsHoraLabel');
  document.getElementById('rs-extendido-label').textContent = I18n.t('rsExtendedToggleLabel');
  document.getElementById('rs-menu-title').textContent = I18n.t('rsMenuPickerTitle');
  document.getElementById('rs-notas-label').textContent = I18n.t('rsNotasLabel');
  document.getElementById('rs-submit-btn').textContent = I18n.t('rsSubmitBtn');
  updateHorarioUI();
}

function onLangChange() {
  applyStaticI18n();
  renderIdentityPanel();
  renderMenuPicker();
}

renderLangSelect(document.getElementById('lang-select-slot'));

// ---------------- Init ----------------

document.getElementById('rs-fecha').min = dstrToday();
document.getElementById('rs-fecha').value = dstrToday();

apiCall('configTurnos', {})
  .then((r) => {
    // Si el backend todavía no tiene el redeploy con horarioSemanal, mantiene el
    // valor por defecto en vez de sobrescribirlo con undefined.
    if (r.horarioSemanal) horarioSemanal = r.horarioSemanal;
    applyStaticI18n();
  })
  .catch(() => {
    // usa el valor por defecto si el backend no está desplegado todavía
  });

applyStaticI18n();
renderIdentityPanel();
renderMenuPicker();
