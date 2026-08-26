/* Lógica del portal de staff: login (admin o colaborador), hub de secciones
   y gestión de pedidos en curso. */

const ADMIN_SESSION_KEY = 'boogaloo_admin_session_v1';
const fmt = (n) => '¥' + Number(n || 0).toLocaleString('ja-JP');

let identity = null; // { esAdmin, usuario|clienteId, nombre, token, rol? }
let currentFilter = 'activos';
let ordersCache = [];

function loadAdminSession() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');
  } catch (e) {
    return null;
  }
}
function saveAdminSession(s) {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(s));
}
function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

// Detecta quién está identificado en este navegador: primero admin (Usuarios),
// si no, un colaborador ya identificado en Session (misma sesión que usa el
// sitio de clientes y turnos.html, así no hay que loguearse dos veces).
function detectIdentity() {
  const admin = loadAdminSession();
  if (admin && admin.token) {
    return { esAdmin: true, usuario: admin.usuario, token: admin.token, rol: admin.rol, nombre: admin.usuario };
  }
  if (Session.isColaborador()) {
    return {
      esAdmin: false,
      clienteId: Session.data.clienteId,
      token: Session.data.token,
      nombre: Session.data.nombre,
    };
  }
  return null;
}

function authParams() {
  return identity.esAdmin ? { usuario: identity.usuario, token: identity.token } : { clienteId: identity.clienteId, token: identity.token };
}

function identityLabel() {
  return identity.esAdmin ? identity.usuario + ' · ' + (identity.rol || 'admin') : identity.nombre;
}

// ---------------- Vistas ----------------

function hideAllViews() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('hub-view').style.display = 'none';
  document.getElementById('panel-view').style.display = 'none';
  document.getElementById('reservas-view').style.display = 'none';
}

function showLogin(message) {
  hideAllViews();
  document.getElementById('login-view').style.display = 'block';
  const err = document.getElementById('login-error');
  if (message) {
    err.textContent = message;
    err.classList.add('show');
  } else {
    err.classList.remove('show');
  }
}

function showHub() {
  hideAllViews();
  document.getElementById('hub-view').style.display = 'block';
  document.getElementById('hub-who-label').textContent = identityLabel();
}

function showPanel() {
  hideAllViews();
  document.getElementById('panel-view').style.display = 'block';
  document.getElementById('who-label').textContent = identityLabel();
  fetchOrders();
}

function showReservas() {
  hideAllViews();
  document.getElementById('reservas-view').style.display = 'block';
  document.getElementById('reservas-who-label').textContent = identityLabel();
  fetchReservas();
}

document.getElementById('login-btn').addEventListener('click', doLogin);
document.getElementById('login-clave').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});

async function doLogin() {
  const usuario = document.getElementById('login-usuario').value.trim();
  const clave = document.getElementById('login-clave').value;
  if (!usuario || !clave) return showLogin(I18n.t('fillUserPassError'));
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.textContent = I18n.t('enteringBtn');
  try {
    const res = await apiCall('loginAdmin', { usuario, clave });
    saveAdminSession({ usuario: res.usuario, token: res.token, rol: res.rol });
    identity = { esAdmin: true, usuario: res.usuario, token: res.token, rol: res.rol, nombre: res.usuario };
    showLogin(null);
    showHub();
    return;
  } catch (err) {
    // No es admin: intenta como colaborador (mismo campo usado como correo).
    try {
      const res = await apiCall('loginCliente', { email: usuario, clave });
      if (res.cliente.rol !== 'colaborador') {
        // No revela si la cuenta existe: mismo mensaje que credenciales inválidas.
        throw new Error(I18n.t('wrongCredentialsError'));
      }
      Session.setCliente(res.cliente);
      identity = { esAdmin: false, clienteId: res.cliente.id, token: res.cliente.token, nombre: res.cliente.nombre };
      showLogin(null);
      showHub();
      return;
    } catch (err2) {
      showLogin(I18n.t('wrongCredentialsError'));
    }
  } finally {
    btn.disabled = false;
    btn.textContent = I18n.t('enterBtn');
  }
}

function doLogout() {
  if (identity && identity.esAdmin) {
    clearAdminSession();
  } else {
    Session.clear();
  }
  identity = null;
  showLogin(null);
}

document.getElementById('hub-logout-btn').addEventListener('click', doLogout);
document.getElementById('logout-btn').addEventListener('click', doLogout);
document.getElementById('reservas-logout-btn').addEventListener('click', doLogout);

document.getElementById('hub-pedidos-btn').addEventListener('click', showPanel);
document.getElementById('hub-turnos-btn').addEventListener('click', () => {
  window.location.href = 'turnos.html';
});
document.getElementById('hub-reservas-btn').addEventListener('click', showReservas);
document.getElementById('back-to-hub-btn').addEventListener('click', showHub);
document.getElementById('reservas-back-to-hub-btn').addEventListener('click', showHub);

document.getElementById('refresh-btn').addEventListener('click', fetchOrders);

document.getElementById('filter-row').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-filter]');
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  document.querySelectorAll('#filter-row [data-filter]').forEach((b) => b.classList.toggle('active', b === btn));
  renderOrders();
});

async function fetchOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = `<div class="empty-state">${I18n.t('loadingOrders')}</div>`;
  try {
    const res = await apiCall('listarPedidos', authParams());
    ordersCache = res.pedidos;
    renderOrders();
  } catch (err) {
    if (err.codigo === 'noAutorizado' || err.codigo === 'sesionExpirada') {
      identity = null;
      clearAdminSession();
      Session.clear();
      showLogin(I18n.t('sessionExpiredMsg'));
      return;
    }
    list.innerHTML = `<div class="empty-state">${I18n.t('errorLoadingPrefix')}${err.message}</div>`;
  }
}

function estadoClass(estado) {
  const e = (estado || '').toLowerCase();
  if (e === 'cobrado') return 'cobrado';
  if (e === 'entregado') return 'entregado';
  return 'pendiente';
}

function estadoLabel(estado) {
  const e = (estado || '').toLowerCase();
  if (e === 'cobrado') return I18n.t('statusCobrado');
  if (e === 'entregado') return I18n.t('statusEntregado');
  return I18n.t('statusPendiente');
}

function renderOrders() {
  const list = document.getElementById('orders-list');
  let pedidos = ordersCache;
  if (currentFilter === 'activos') pedidos = pedidos.filter((p) => p.Estado !== 'Cobrado');
  if (currentFilter === 'cobrados') pedidos = pedidos.filter((p) => p.Estado === 'Cobrado');

  if (!pedidos.length) {
    list.innerHTML = `<div class="empty-state">${I18n.t('noOrdersView')}</div>`;
    return;
  }

  list.innerHTML = pedidos
    .map((p) => {
      const fecha = new Date(p.Fecha).toLocaleString('ja-JP');
      const itemsHtml = p.Items.map(
        (it) => `
        <div class="order-item-row">
          <button class="check-toggle ${it.entregado ? 'done' : ''}" data-pedido="${p.ID}" data-sku="${it.sku}" data-entregado="${!it.entregado}" type="button" title="${I18n.t('markDeliveredTitle')}">${it.entregado ? '✓' : ''}</button>
          <span class="n">${it.cantidad}x ${it.nombre}</span>
          <span class="p">${fmt(it.subtotal)}</span>
        </div>`
      ).join('');

      const pagado = p.Pagado === 'Si' || p.Pagado === true;

      return `
      <div class="order-card">
        <div class="order-card-head">
          <div>
            <div class="id">${p.ID}</div>
            <div class="meta">${fecha} · ${p.Cliente} (${p.Tipo})${p.Telefono ? ' · ' + p.Telefono : ''}</div>
          </div>
          <span class="status-tag ${estadoClass(p.Estado)}">${estadoLabel(p.Estado)}</span>
        </div>
        <div class="order-items">${itemsHtml}</div>
        <div class="order-card-footer">
          <span class="order-total">${I18n.t('totalPrefix')}${fmt(p.Total)}</span>
          <div class="order-actions">
            <button class="btn-paid ${pagado ? 'done' : ''}" data-pagar="${p.ID}" data-valor="${!pagado}" type="button">
              ${pagado ? I18n.t('paidDoneBtn') : I18n.t('markPaidBtn')}
            </button>
            <button class="ghost-btn" data-eliminar="${p.ID}" type="button">${I18n.t('deleteBtn')}</button>
          </div>
        </div>
      </div>`;
    })
    .join('');
}

document.getElementById('orders-list').addEventListener('click', async (e) => {
  const toggleBtn = e.target.closest('[data-pedido]');
  const pagarBtn = e.target.closest('[data-pagar]');
  const eliminarBtn = e.target.closest('[data-eliminar]');

  if (toggleBtn) {
    toggleBtn.disabled = true;
    try {
      await apiCall('actualizarPedido', {
        ...authParams(),
        pedidoId: toggleBtn.dataset.pedido,
        itemSku: toggleBtn.dataset.sku,
        entregado: toggleBtn.dataset.entregado === 'true',
      });
      await fetchOrders();
    } catch (err) {
      alert(I18n.t('couldNotUpdatePrefix') + err.message);
      toggleBtn.disabled = false;
    }
    return;
  }

  if (pagarBtn) {
    pagarBtn.disabled = true;
    try {
      await apiCall('actualizarPedido', {
        ...authParams(),
        pedidoId: pagarBtn.dataset.pagar,
        pagado: pagarBtn.dataset.valor === 'true',
      });
      await fetchOrders();
    } catch (err) {
      alert(I18n.t('couldNotUpdatePrefix') + err.message);
      pagarBtn.disabled = false;
    }
    return;
  }

  if (eliminarBtn) {
    if (!confirm(I18n.t('confirmDelete', eliminarBtn.dataset.eliminar))) return;
    eliminarBtn.disabled = true;
    try {
      await apiCall('eliminarPedido', {
        ...authParams(),
        pedidoId: eliminarBtn.dataset.eliminar,
      });
      await fetchOrders();
    } catch (err) {
      alert(I18n.t('couldNotDeletePrefix') + err.message);
      eliminarBtn.disabled = false;
    }
  }
});

// ---------------- Reservas ----------------

let currentReservasFilter = 'pendientes';
let reservasCache = [];

function estadoReservaClass(estado) {
  const e = (estado || '').toLowerCase();
  if (e === 'confirmada') return 'confirmada';
  if (e === 'cancelada') return 'cancelada';
  if (e === 'pendienterevision') return 'pendienterevision';
  return 'pendiente';
}
function estadoReservaLabel(estado) {
  const e = (estado || '').toLowerCase();
  if (e === 'confirmada') return I18n.t('rsEstadoConfirmada');
  if (e === 'cancelada') return I18n.t('rsEstadoCancelada');
  if (e === 'pendienterevision') return I18n.t('rsEstadoPendienteRevision');
  return I18n.t('rsEstadoPendiente');
}

document.getElementById('reservas-refresh-btn').addEventListener('click', fetchReservas);

document.getElementById('reservas-filter-row').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-rfilter]');
  if (!btn) return;
  currentReservasFilter = btn.dataset.rfilter;
  document.querySelectorAll('#reservas-filter-row [data-rfilter]').forEach((b) => b.classList.toggle('active', b === btn));
  renderReservas();
});

async function fetchReservas() {
  const list = document.getElementById('reservas-list');
  list.innerHTML = `<div class="empty-state">${I18n.t('loadingOrders')}</div>`;
  try {
    const res = await apiCall('listarReservas', authParams());
    reservasCache = res.reservas;
    renderReservas();
  } catch (err) {
    if (err.codigo === 'noAutorizado' || err.codigo === 'sesionExpirada') {
      identity = null;
      clearAdminSession();
      Session.clear();
      showLogin(I18n.t('sessionExpiredMsg'));
      return;
    }
    list.innerHTML = `<div class="empty-state">${I18n.t('rsErrorLoadingPrefix')}${err.message}</div>`;
  }
}

function renderReservas() {
  const list = document.getElementById('reservas-list');
  let reservas = reservasCache;
  if (currentReservasFilter === 'pendientes') reservas = reservas.filter((r) => r.Estado === 'Pendiente');
  if (currentReservasFilter === 'revision') reservas = reservas.filter((r) => r.Estado === 'PendienteRevision');
  if (currentReservasFilter === 'confirmadas') reservas = reservas.filter((r) => r.Estado === 'Confirmada');

  if (!reservas.length) {
    list.innerHTML = `<div class="empty-state">${I18n.t('rsNoReservasView')}</div>`;
    return;
  }

  list.innerHTML = reservas
    .map((r) => {
      const itemsHtml = (r.Items || [])
        .map((it) => `<div class="order-item-row"><span class="n">${it.cantidad}x ${it.nombre}</span><span class="p">${fmt(it.subtotal)}</span></div>`)
        .join('');
      const puedeConfirmar = r.Estado === 'Pendiente' || r.Estado === 'PendienteRevision';
      const puedeCancelar = r.Estado !== 'Cancelada';

      return `
      <div class="order-card">
        <div class="order-card-head">
          <div>
            <div class="id">${r.ID}</div>
            <div class="meta">${r.Fecha} ${r.Hora} · ${r.Personas} × · ${r.Nombre} (${r.Tipo})${r.Telefono ? ' · ' + r.Telefono : ''}</div>
          </div>
          <span class="status-tag ${estadoReservaClass(r.Estado)}">${estadoReservaLabel(r.Estado)}</span>
        </div>
        ${itemsHtml ? `<div class="order-items">${itemsHtml}</div>` : ''}
        ${r.Notas ? `<p class="subt" style="margin:6px 0;">${r.Notas}</p>` : ''}
        <div class="order-card-footer">
          <div class="order-actions">
            ${puedeConfirmar ? `<button class="btn-paid" data-confirmar-reserva="${r.ID}" type="button">${I18n.t('rsConfirmarBtn')}</button>` : ''}
            ${puedeCancelar ? `<button class="ghost-btn" data-cancelar-reserva="${r.ID}" type="button">${I18n.t('rsCancelarBtn')}</button>` : ''}
          </div>
        </div>
      </div>`;
    })
    .join('');
}

document.getElementById('reservas-list').addEventListener('click', async (e) => {
  const confirmarBtn = e.target.closest('[data-confirmar-reserva]');
  const cancelarBtn = e.target.closest('[data-cancelar-reserva]');

  if (confirmarBtn) {
    confirmarBtn.disabled = true;
    try {
      await apiCall('actualizarReserva', { ...authParams(), reservaId: confirmarBtn.dataset.confirmarReserva, estado: 'Confirmada' });
      await fetchReservas();
    } catch (err) {
      alert(I18n.t('couldNotUpdatePrefix') + err.message);
      confirmarBtn.disabled = false;
    }
    return;
  }

  if (cancelarBtn) {
    if (!confirm(I18n.t('rsConfirmCancelar'))) return;
    cancelarBtn.disabled = true;
    try {
      await apiCall('actualizarReserva', { ...authParams(), reservaId: cancelarBtn.dataset.cancelarReserva, estado: 'Cancelada' });
      await fetchReservas();
    } catch (err) {
      alert(I18n.t('couldNotUpdatePrefix') + err.message);
      cancelarBtn.disabled = false;
    }
  }
});

// ---------------- Idioma ----------------

function applyStaticI18n() {
  document.getElementById('admin-panel-title').textContent = I18n.t('adminPanelTitle');
  document.getElementById('admin-login-sub').textContent = I18n.t('adminLoginSub');
  document.getElementById('admin-usuario-label').textContent = I18n.t('usuarioLabel');
  document.getElementById('admin-clave-label').textContent = I18n.t('passwordLabel');
  document.getElementById('login-btn').textContent = I18n.t('enterBtn');
  document.getElementById('hub-title').textContent = I18n.t('adminPanelTitle');
  document.getElementById('hub-subtitle').textContent = I18n.t('hubSubtitle');
  document.getElementById('hub-pedidos-btn').textContent = I18n.t('ordersTitle');
  document.getElementById('hub-turnos-btn').textContent = I18n.t('hubTurnosBtn');
  document.getElementById('hub-reservas-btn').textContent = I18n.t('hubReservasBtn');
  document.getElementById('hub-logout-btn').textContent = I18n.t('logoutBtn');
  document.getElementById('admin-orders-title').textContent = I18n.t('ordersTitle');
  document.getElementById('logout-btn').textContent = I18n.t('logoutBtn');
  document.getElementById('back-to-hub-btn').textContent = I18n.t('backToHubBtn');
  document.querySelector('[data-filter="activos"]').textContent = I18n.t('filterActive');
  document.querySelector('[data-filter="cobrados"]').textContent = I18n.t('filterPaid');
  document.querySelector('[data-filter="todos"]').textContent = I18n.t('filterAll');
  document.getElementById('refresh-btn').textContent = I18n.t('refreshBtn');
  document.getElementById('admin-reservas-title').textContent = I18n.t('hubReservasBtn');
  document.getElementById('reservas-back-to-hub-btn').textContent = I18n.t('backToHubBtn');
  document.getElementById('reservas-logout-btn').textContent = I18n.t('logoutBtn');
  document.querySelector('[data-rfilter="pendientes"]').textContent = I18n.t('rsFilterPendientes');
  document.querySelector('[data-rfilter="revision"]').textContent = I18n.t('rsFilterRevision');
  document.querySelector('[data-rfilter="confirmadas"]').textContent = I18n.t('rsFilterConfirmadas');
  document.querySelector('[data-rfilter="todas"]').textContent = I18n.t('rsFilterTodas');
  document.getElementById('reservas-refresh-btn').textContent = I18n.t('refreshBtn');
}

function onLangChange() {
  applyStaticI18n();
  if (document.getElementById('panel-view').style.display !== 'none') renderOrders();
  if (document.getElementById('reservas-view').style.display !== 'none') renderReservas();
}

renderLangSelect(document.getElementById('admin-lang-slot'));
renderLangSelect(document.getElementById('hub-lang-slot'));
renderLangSelect(document.getElementById('panel-lang-slot'));
renderLangSelect(document.getElementById('reservas-lang-slot'));

// ---------------- Init ----------------

applyStaticI18n();
identity = detectIdentity();
if (identity) {
  showHub();
} else {
  showLogin(null);
}
