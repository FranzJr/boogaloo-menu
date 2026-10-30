/* Lógica del portal de staff: login (admin o colaborador), hub de secciones
   y gestión de pedidos en curso. */

const ADMIN_SESSION_KEY = 'boogaloo_admin_session_v1';
const fmt = (n) => '¥' + Number(n || 0).toLocaleString('ja-JP');

let identity = null; // { esAdmin, usuario|clienteId, nombre, token, rol? }
let currentFilter = 'activos';
let ordersCache = [];
let currentHyMonth = new Date();

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
  document.getElementById('menu-view').style.display = 'none';
  document.getElementById('hygiene-view').style.display = 'none';
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
  fetchHorarioSemanal();
}

function showMenuAdmin() {
  hideAllViews();
  document.getElementById('menu-view').style.display = 'block';
  document.getElementById('menu-who-label').textContent = identityLabel();
  fetchAgotados();
}

function showHygiene() {
  hideAllViews();
  document.getElementById('hygiene-view').style.display = 'block';
  document.getElementById('hygiene-who-label').textContent = identityLabel();
  renderHygieneCalendar();
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
document.getElementById('menu-logout-btn').addEventListener('click', doLogout);
document.getElementById('hygiene-logout-btn').addEventListener('click', doLogout);

document.getElementById('hub-pedidos-btn').addEventListener('click', showPanel);
document.getElementById('hub-turnos-btn').addEventListener('click', () => {
  window.location.href = 'turnos.html';
});
document.getElementById('hub-reservas-btn').addEventListener('click', showReservas);
document.getElementById('hub-menu-btn').addEventListener('click', showMenuAdmin);
document.getElementById('hub-higiene-btn').addEventListener('click', showHygiene);
document.getElementById('back-to-hub-btn').addEventListener('click', showHub);
document.getElementById('reservas-back-to-hub-btn').addEventListener('click', showHub);
document.getElementById('menu-back-to-hub-btn').addEventListener('click', showHub);
document.getElementById('hygiene-back-to-hub-btn').addEventListener('click', showHub);

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

// Lista plana de <option> con todos los productos del menú (para el
// selector de "agregar item" en un pedido existente y en el pedido nuevo).
function menuItemOptionsHtml() {
  return MENU_CATEGORIES.map((cat) =>
    (cat.items || [])
      .map((it) => `<option value="${it.sku}">${mi(it.nombre)} — ${fmt(it.precio)}</option>`)
      .join('')
  ).join('');
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

  const opciones = menuItemOptionsHtml();

  list.innerHTML = pedidos
    .map((p) => {
      const fecha = new Date(p.Fecha).toLocaleString('ja-JP');
      const pagado = p.Pagado === 'Si' || p.Pagado === true;
      const itemsHtml = p.Items.map(
        (it, idx) => `
        <div class="order-item-row">
          <button class="check-toggle ${it.entregado ? 'done' : ''}" data-pedido="${p.ID}" data-sku="${it.sku}" data-entregado="${!it.entregado}" type="button" title="${I18n.t('markDeliveredTitle')}">${it.entregado ? '✓' : ''}</button>
          <span class="n">${it.cantidad}x ${it.nombre}</span>
          <span class="p">${fmt(it.subtotal)}</span>
          ${pagado ? '' : `<button class="item-remove-btn" data-quitar-pedido="${p.ID}" data-item-index="${idx}" type="button" title="${I18n.t('removeItemBtn')}">×</button>`}
        </div>`
      ).join('');

      const addItemHtml = pagado
        ? ''
        : `
        <div class="order-add-item" data-order-add>
          <select class="order-add-select">${opciones}</select>
          <input type="number" class="order-add-qty" min="1" value="1" />
          <button class="ghost-btn" data-agregar-item="${p.ID}" type="button">${I18n.t('addItemToOrderBtn')}</button>
        </div>`;

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
        ${addItemHtml}
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
  const quitarBtn = e.target.closest('[data-quitar-pedido]');
  const agregarBtn = e.target.closest('[data-agregar-item]');

  if (quitarBtn) {
    if (!confirm(I18n.t('confirmRemoveItem'))) return;
    quitarBtn.disabled = true;
    try {
      await apiCall('quitarItemPedido', {
        ...authParams(),
        pedidoId: quitarBtn.dataset.quitarPedido,
        itemIndex: quitarBtn.dataset.itemIndex,
      });
      await fetchOrders();
    } catch (err) {
      alert(I18n.t('couldNotUpdatePrefix') + err.message);
      quitarBtn.disabled = false;
    }
    return;
  }

  if (agregarBtn) {
    const card = agregarBtn.closest('[data-order-add]');
    const sku = card.querySelector('.order-add-select').value;
    const cantidad = Math.max(1, parseInt(card.querySelector('.order-add-qty').value, 10) || 1);
    agregarBtn.disabled = true;
    try {
      await apiCall('agregarItems', {
        ...authParams(),
        pedidoId: agregarBtn.dataset.agregarItem,
        items: [{ sku, cantidad }],
      });
      await fetchOrders();
    } catch (err) {
      alert(I18n.t('couldNotUpdatePrefix') + err.message);
      agregarBtn.disabled = false;
    }
    return;
  }

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

// ---------------- Nuevo pedido manual (mesa/cliente sin cuenta) ----------------
// Crea un pedido nuevo e independiente -- nunca se agrega a un pedido
// existente, así que dos clientes nunca terminan mezclados en el mismo pedido.

let nuevoPedidoItems = []; // [{sku, cantidad}]

function renderNewOrderModal() {
  const body = document.getElementById('new-order-modal-body');
  const itemsHtml = nuevoPedidoItems.length
    ? nuevoPedidoItems
        .map((it, idx) => {
          const def = MENU_INDEX[it.sku];
          return `
        <div class="order-item-row">
          <span class="n">${it.cantidad}x ${mi(def.nombre)}</span>
          <span class="p">${fmt(def.precio * it.cantidad)}</span>
          <button class="item-remove-btn" data-quitar-nuevo="${idx}" type="button" title="${I18n.t('removeItemBtn')}">×</button>
        </div>`;
        })
        .join('')
    : `<p class="subt">${I18n.t('newOrderNoItems')}</p>`;

  const total = nuevoPedidoItems.reduce((s, it) => s + MENU_INDEX[it.sku].precio * it.cantidad, 0);

  body.innerHTML = `
    <h2>${I18n.t('newOrderTitle')}</h2>
    <div class="form-error" id="new-order-error" style="display:none;"></div>
    <div class="field"><label>${I18n.t('newOrderNameLabel')}</label><input id="new-order-nombre" type="text" /></div>
    <div class="field"><label>${I18n.t('newOrderPhoneLabel')}</label><input id="new-order-telefono" type="text" /></div>
    <div class="order-add-item" data-order-add>
      <select class="order-add-select" id="new-order-select">${menuItemOptionsHtml()}</select>
      <input type="number" class="order-add-qty" id="new-order-qty" min="1" value="1" />
      <button class="ghost-btn" id="new-order-add-btn" type="button">${I18n.t('addItemToOrderBtn')}</button>
    </div>
    <div class="order-items" style="margin:10px 0;">${itemsHtml}</div>
    <div class="order-total" style="margin-bottom:14px;">${I18n.t('totalPrefix')}${fmt(total)}</div>
    <button class="primary-btn" id="new-order-submit-btn" type="button" style="width:100%;">${I18n.t('newOrderSubmitBtn')}</button>
    <button class="link-btn" id="new-order-cancel-btn" type="button" style="width:100%; margin-top:8px;">${I18n.t('cancelBtn')}</button>
  `;

  document.getElementById('new-order-add-btn').addEventListener('click', () => {
    const sku = document.getElementById('new-order-select').value;
    const cantidad = Math.max(1, parseInt(document.getElementById('new-order-qty').value, 10) || 1);
    const existing = nuevoPedidoItems.find((it) => it.sku === sku);
    if (existing) existing.cantidad += cantidad;
    else nuevoPedidoItems.push({ sku, cantidad });
    renderNewOrderModal();
  });

  document.getElementById('new-order-cancel-btn').addEventListener('click', closeNewOrderModal);

  document.getElementById('new-order-submit-btn').addEventListener('click', async () => {
    const nombre = document.getElementById('new-order-nombre').value.trim();
    const errorBox = document.getElementById('new-order-error');
    if (!nombre) {
      errorBox.textContent = I18n.t('newOrderNameRequired');
      errorBox.style.display = 'block';
      return;
    }
    if (!nuevoPedidoItems.length) {
      errorBox.textContent = I18n.t('newOrderNoItems');
      errorBox.style.display = 'block';
      return;
    }
    errorBox.style.display = 'none';
    const submitBtn = document.getElementById('new-order-submit-btn');
    submitBtn.disabled = true;
    try {
      await apiCall('crearPedido', {
        cliente: {
          nombre,
          telefono: document.getElementById('new-order-telefono').value.trim(),
          tipo: 'invitado',
        },
        items: nuevoPedidoItems,
      });
      closeNewOrderModal();
      await fetchOrders();
    } catch (err) {
      errorBox.textContent = I18n.t('couldNotUpdatePrefix') + err.message;
      errorBox.style.display = 'block';
      submitBtn.disabled = false;
    }
  });

  body.querySelectorAll('[data-quitar-nuevo]').forEach((btn) => {
    btn.addEventListener('click', () => {
      nuevoPedidoItems.splice(parseInt(btn.dataset.quitarNuevo, 10), 1);
      renderNewOrderModal();
    });
  });
}

function openNewOrderModal() {
  nuevoPedidoItems = [];
  renderNewOrderModal();
  document.getElementById('new-order-modal').classList.add('open');
}

function closeNewOrderModal() {
  document.getElementById('new-order-modal').classList.remove('open');
}

document.getElementById('new-order-btn').addEventListener('click', openNewOrderModal);

// ---------------- Menú (productos agotados) ----------------

let agotadosCache = new Set();

async function fetchAgotados() {
  const list = document.getElementById('menu-admin-list');
  list.innerHTML = `<div class="empty-state">${I18n.t('loadingOrders')}</div>`;
  try {
    const res = await apiCall('listarAgotados', {});
    agotadosCache = new Set(res.skus || []);
    renderMenuAdmin();
  } catch (err) {
    list.innerHTML = `<div class="empty-state">${I18n.t('errorLoadingPrefix')}${err.message}</div>`;
  }
}

function renderMenuAdmin() {
  const list = document.getElementById('menu-admin-list');
  list.innerHTML = MENU_CATEGORIES.map((cat) => {
    const items = [].concat(cat.items || [], cat.extras || []);
    const rowsHtml = items
      .map((it) => {
        const agotado = agotadosCache.has(it.sku);
        return `
        <div class="order-item-row">
          <span class="n">${mi(it.nombre)} · ${fmt(it.precio)}</span>
          <button class="btn-agotado ${agotado ? 'done' : ''}" data-toggle-agotado="${it.sku}" data-valor="${!agotado}" type="button">
            ${agotado ? I18n.t('markAvailableBtn') : I18n.t('markAgotadoBtn')}
          </button>
        </div>`;
      })
      .join('');
    return `
      <div class="menu-admin-section">
        <h3>${mi(cat.nombre)}</h3>
        ${rowsHtml}
      </div>`;
  }).join('');
}

document.getElementById('menu-admin-list').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-toggle-agotado]');
  if (!btn) return;
  btn.disabled = true;
  try {
    await apiCall('marcarAgotado', {
      ...authParams(),
      sku: btn.dataset.toggleAgotado,
      agotado: btn.dataset.valor === 'true',
    });
    await fetchAgotados();
  } catch (err) {
    alert(I18n.t('couldNotUpdatePrefix') + err.message);
    btn.disabled = false;
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

// ---------------- Horario del negocio ----------------

let horarioSemanalCache = {};

// Público (no requiere login): la misma acción que usan turnos.html/reserva.html.
async function fetchHorarioSemanal() {
  try {
    const res = await apiCall('configTurnos', {});
    horarioSemanalCache = res.horarioSemanal || {};
    renderHorarioSemanal();
  } catch (err) {
    document.getElementById('horario-body').innerHTML = `<p class="subt">—</p>`;
  }
}

function renderHorarioSemanal() {
  const el = document.getElementById('horario-body');
  const weekdays = I18n.t('tnWeekdays');
  el.innerHTML = [0, 1, 2, 3, 4, 5, 6]
    .map((dia) => {
      const d = horarioSemanalCache[dia] || { abierto: false, horaInicio: '', horaFin: '' };
      return `
      <div class="tn-mode-row">
        <span class="name">${weekdays[dia]}</span>
        <label style="display:flex; align-items:center; gap:4px; font-size:0.8rem; white-space:nowrap;">
          <input type="checkbox" data-horario-abierto="${dia}" ${d.abierto ? 'checked' : ''} /> ${I18n.t('horarioAbiertoLabel')}
        </label>
        <input type="time" data-horario-inicio="${dia}" value="${d.horaInicio || ''}" style="width:100px; padding:6px 8px; border-radius:8px; border:1px solid var(--border); font:inherit;" />
        <input type="time" data-horario-fin="${dia}" value="${d.horaFin || ''}" style="width:100px; padding:6px 8px; border-radius:8px; border:1px solid var(--border); font:inherit;" />
        <button class="ghost-btn" data-save-horario="${dia}" type="button">${I18n.t('tnSetRate')}</button>
      </div>`;
    })
    .join('');
}

document.getElementById('horario-body').addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-save-horario]');
  if (!btn) return;
  const dia = btn.dataset.saveHorario;
  const abierto = document.querySelector(`[data-horario-abierto="${dia}"]`).checked;
  const horaInicio = document.querySelector(`[data-horario-inicio="${dia}"]`).value;
  const horaFin = document.querySelector(`[data-horario-fin="${dia}"]`).value;
  btn.disabled = true;
  try {
    await apiCall('actualizarHorarioSemanal', { ...authParams(), diaSemana: Number(dia), abierto, horaInicio, horaFin });
    await fetchHorarioSemanal();
  } catch (err) {
    alert(I18n.t('couldNotUpdatePrefix') + err.message);
  }
  btn.disabled = false;
});

// ---------------- Control sanitario (maqueta: localStorage, sin backend) ----------------
// Ver js/hygiene-data.js para los datos de partida (HYGIENE_SEED_RECORDS) y la
// nota sobre qué parte es demo y qué parte son los datos reales de la última semana.

function loadHygieneOverrides() {
  try {
    return JSON.parse(localStorage.getItem(HYGIENE_STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveHygieneOverride(fechaStr, record) {
  const overrides = loadHygieneOverrides();
  overrides[fechaStr] = record;
  localStorage.setItem(HYGIENE_STORAGE_KEY, JSON.stringify(overrides));
}

function hyGetRecord(fechaStr) {
  const overrides = loadHygieneOverrides();
  if (overrides[fechaStr] !== undefined) return overrides[fechaStr];
  return HYGIENE_SEED_RECORDS[fechaStr];
}

// Cumple la normativa si cada ítem diario está en orden: temperaturas dentro
// del límite y los check obligatorios en true. El control de plagas (mensual)
// no se exige todos los días, así que no afecta este resultado.
function hyIsCompliant(record) {
  if (!record || !record.items) return false;
  return HYGIENE_ITEMS.every((it) => {
    const val = record.items[it.id];
    if (it.type === 'temp') return val !== undefined && val !== '' && !isNaN(Number(val)) && Number(val) <= it.max;
    if (it.monthly) return true;
    return val === true;
  });
}

function hyComputeStatus(fechaStr, record) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (hyParseDate(fechaStr) > today) return 'future';
  if (!record) return 'missing';
  if (record.cerrado) return 'closed';
  return hyIsCompliant(record) ? 'ok' : 'incomplete';
}

function hyStatusLabel(status) {
  if (status === 'closed') return I18n.t('hyStatusClosed');
  if (status === 'ok') return I18n.t('hyStatusOk');
  if (status === 'incomplete') return I18n.t('hyStatusIncomplete');
  if (status === 'missing') return I18n.t('hyStatusMissing');
  return I18n.t('hyStatusFuture');
}

function hyBuildMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay();
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

function renderHygieneCalendar() {
  const year = currentHyMonth.getFullYear();
  const month = currentHyMonth.getMonth();
  const weekdays = I18n.t('tnWeekdays');
  const monthLabels = I18n.t('tnMonthLabels');

  document.getElementById('hy-month-label').textContent = `${monthLabels[month]} ${year}`;
  document.getElementById('hy-table-head').innerHTML = weekdays.map((w) => `<th>${w}</th>`).join('');

  const weeks = hyBuildMonthMatrix(year, month);
  document.getElementById('hy-table-body').innerHTML = weeks
    .map(
      (week) => `<tr>${week
        .map((day) => {
          if (!day) return '<td class="tn-empty"></td>';
          const fechaStr = hyDateStr(new Date(year, month, day));
          const status = hyComputeStatus(fechaStr, hyGetRecord(fechaStr));
          const clickable = status !== 'future';
          return `<td data-fecha="${fechaStr}" class="${clickable ? 'hy-clickable' : ''}">
            <span class="n">${day}</span>
            ${clickable ? `<span class="hy-chip hy-${status}">${hyStatusLabel(status)}</span>` : ''}
          </td>`;
        })
        .join('')}</tr>`
    )
    .join('');

  document.getElementById('hy-list').innerHTML = weeks
    .reduce((flat, week) => flat.concat(week), [])
    .filter((day) => day)
    .map((day) => {
      const d = new Date(year, month, day);
      const fechaStr = hyDateStr(d);
      const status = hyComputeStatus(fechaStr, hyGetRecord(fechaStr));
      const clickable = status !== 'future';
      return `<div class="tn-li" ${clickable ? `data-fecha="${fechaStr}"` : 'style="cursor:default; opacity:0.55;"'}>
        <span class="d">${day}</span>
        <span class="w">${weekdays[d.getDay()]}</span>
        <span class="p">${hyStatusLabel(status)}</span>
        <span class="tn-dot hy-dot-${status}"></span>
      </div>`;
    })
    .join('');

  renderHygieneLegend();
}

function renderHygieneLegend() {
  document.getElementById('hy-legend').innerHTML = ['ok', 'incomplete', 'missing', 'closed', 'future']
    .map((status) => `<div class="tn-lg"><span class="tn-dot hy-dot-${status}"></span><div><b>${hyStatusLabel(status)}</b></div></div>`)
    .join('');
}

document.getElementById('hy-prev').addEventListener('click', () => {
  currentHyMonth = new Date(currentHyMonth.getFullYear(), currentHyMonth.getMonth() - 1, 1);
  renderHygieneCalendar();
});
document.getElementById('hy-next').addEventListener('click', () => {
  currentHyMonth = new Date(currentHyMonth.getFullYear(), currentHyMonth.getMonth() + 1, 1);
  renderHygieneCalendar();
});

document.getElementById('hy-table-body').addEventListener('click', (e) => {
  const td = e.target.closest('td[data-fecha]');
  if (td) openHygieneModal(td.dataset.fecha);
});
document.getElementById('hy-list').addEventListener('click', (e) => {
  const row = e.target.closest('[data-fecha]');
  if (row) openHygieneModal(row.dataset.fecha);
});

// ---------------- Modal de detalle / edición de un día ----------------

const hyModal = document.getElementById('hy-modal');
const hyModalBody = document.getElementById('hy-modal-body');
let hyModalFecha = null;

function closeHygieneModal() {
  hyModal.classList.remove('open');
}
hyModal.addEventListener('click', (e) => {
  if (e.target === hyModal) closeHygieneModal();
});

function hygieneItemGroupHtml(groupKey, titleKey, items) {
  const rows = HYGIENE_ITEMS.filter((it) => it.group === groupKey)
    .map((it) => {
      if (it.type === 'temp') {
        const val = items[it.id] !== undefined ? items[it.id] : '';
        return `
        <div class="hy-item-row">
          <span class="hy-item-label">${it.es} / ${it.ja}</span>
          <input type="number" class="hy-item-input" data-item="${it.id}" value="${val}" />
        </div>`;
      }
      const checked = items[it.id] === true;
      const tag = it.monthly ? ` ${I18n.t('hyMonthlyTag')}` : '';
      return `
        <div class="hy-item-row">
          <label class="hy-item-check">
            <input type="checkbox" data-item="${it.id}" ${checked ? 'checked' : ''} />
            <span>${it.es} / ${it.ja}${tag}</span>
          </label>
        </div>`;
    })
    .join('');
  return `<div class="hy-group"><h3>${I18n.t(titleKey)}</h3>${rows}</div>`;
}

function hygieneModalBodyHtml(fechaStr) {
  const record = hyGetRecord(fechaStr);
  const status = hyComputeStatus(fechaStr, record);
  const d = hyParseDate(fechaStr);
  const dateLabel = `${d.getDate()} ${I18n.t('tnMonthLabels')[d.getMonth()]} ${d.getFullYear()} (${I18n.t('tnWeekdays')[d.getDay()]})`;

  if (status === 'closed') {
    return `
      <h2>${I18n.t('hyDayDetailTitle', dateLabel)}</h2>
      <p class="subt">${I18n.t('hyClosedDayNote')}</p>
      <button class="ghost-btn" id="hy-modal-close" type="button" style="width:100%;">${I18n.t('closeBtn')}</button>
    `;
  }

  const items = (record && record.items) || {};
  const firma = (record && record.firma) || '';
  const notas = (record && record.notas) || '';

  return `
    <h2>${I18n.t('hyDayDetailTitle', dateLabel)}</h2>
    ${status === 'missing' ? `<p class="subt">${I18n.t('hyNoRecordNote')}</p>` : ''}
    ${hygieneItemGroupHtml('general', 'hyGeneralGroup', items)}
    ${hygieneItemGroupHtml('importante', 'hyImportanteGroup', items)}
    <div class="field"><label>${I18n.t('hySignatureLabel')}</label><input type="text" id="hy-modal-firma" value="${firma}" /></div>
    <div class="field"><label>${I18n.t('hyNotesLabel')}</label><textarea id="hy-modal-notas" rows="2">${notas}</textarea></div>
    <button class="primary-btn" id="hy-modal-save" type="button" style="width:100%;">${I18n.t('hySaveBtn')}</button>
    <button class="ghost-btn" id="hy-modal-close" type="button" style="width:100%; margin-top:8px;">${I18n.t('closeBtn')}</button>
  `;
}

function openHygieneModal(fechaStr) {
  hyModalFecha = fechaStr;
  hyModalBody.innerHTML = hygieneModalBodyHtml(fechaStr);
  hyModal.classList.add('open');
  const closeBtn = document.getElementById('hy-modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeHygieneModal);
  const saveBtn = document.getElementById('hy-modal-save');
  if (saveBtn) saveBtn.addEventListener('click', saveHygieneDay);
}

function saveHygieneDay() {
  const fechaStr = hyModalFecha;
  const items = {};
  HYGIENE_ITEMS.forEach((it) => {
    const el = hyModalBody.querySelector(`[data-item="${it.id}"]`);
    if (!el) return;
    items[it.id] = it.type === 'temp' ? Number(el.value) : el.checked;
  });
  const firma = document.getElementById('hy-modal-firma').value.trim();
  const notas = document.getElementById('hy-modal-notas').value.trim();
  saveHygieneOverride(fechaStr, { fecha: fechaStr, cerrado: false, items, firma, notas });
  closeHygieneModal();
  renderHygieneCalendar();
  alert(I18n.t('hySavedOk'));
}

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
  document.getElementById('new-order-btn').textContent = I18n.t('newOrderBtn');
  document.getElementById('admin-reservas-title').textContent = I18n.t('hubReservasBtn');
  document.getElementById('reservas-back-to-hub-btn').textContent = I18n.t('backToHubBtn');
  document.getElementById('reservas-logout-btn').textContent = I18n.t('logoutBtn');
  document.querySelector('[data-rfilter="pendientes"]').textContent = I18n.t('rsFilterPendientes');
  document.querySelector('[data-rfilter="revision"]').textContent = I18n.t('rsFilterRevision');
  document.querySelector('[data-rfilter="confirmadas"]').textContent = I18n.t('rsFilterConfirmadas');
  document.querySelector('[data-rfilter="todas"]').textContent = I18n.t('rsFilterTodas');
  document.getElementById('reservas-refresh-btn').textContent = I18n.t('refreshBtn');
  document.getElementById('horario-title').textContent = I18n.t('horarioTitle');
  document.getElementById('hub-menu-btn').textContent = I18n.t('hubMenuBtn');
  document.getElementById('admin-menu-title').textContent = I18n.t('menuAdminTitle');
  document.getElementById('menu-back-to-hub-btn').textContent = I18n.t('backToHubBtn');
  document.getElementById('menu-logout-btn').textContent = I18n.t('logoutBtn');
  document.getElementById('hub-higiene-btn').textContent = I18n.t('hubHigieneBtn');
  document.getElementById('hygiene-title').textContent = I18n.t('hubHigieneBtn');
  document.getElementById('hygiene-back-to-hub-btn').textContent = I18n.t('backToHubBtn');
  document.getElementById('hygiene-logout-btn').textContent = I18n.t('logoutBtn');
  document.getElementById('hygiene-demo-banner').textContent = I18n.t('hyDemoBanner');
}

function onLangChange() {
  applyStaticI18n();
  if (document.getElementById('panel-view').style.display !== 'none') renderOrders();
  if (document.getElementById('reservas-view').style.display !== 'none') {
    renderReservas();
    renderHorarioSemanal();
  }
  if (document.getElementById('menu-view').style.display !== 'none') renderMenuAdmin();
  if (document.getElementById('hygiene-view').style.display !== 'none') renderHygieneCalendar();
}

renderLangSelect(document.getElementById('admin-lang-slot'));
renderLangSelect(document.getElementById('hub-lang-slot'));
renderLangSelect(document.getElementById('panel-lang-slot'));
renderLangSelect(document.getElementById('reservas-lang-slot'));
renderLangSelect(document.getElementById('menu-lang-slot'));
renderLangSelect(document.getElementById('hygiene-lang-slot'));

// ---------------- Init ----------------

applyStaticI18n();
identity = detectIdentity();
if (identity) {
  showHub();
} else {
  showLogin(null);
}
