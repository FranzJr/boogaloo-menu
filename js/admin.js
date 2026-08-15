/* Lógica del panel de administrador: login y gestión de pedidos en curso. */

const ADMIN_SESSION_KEY = 'boogaloo_admin_session_v1';
const fmt = (n) => '¥' + Number(n || 0).toLocaleString('ja-JP');

let adminSession = null;
let currentFilter = 'activos';
let ordersCache = [];

function loadAdminSession() {
  try {
    adminSession = JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY) || 'null');
  } catch (e) {
    adminSession = null;
  }
  return adminSession;
}
function saveAdminSession(s) {
  adminSession = s;
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(s));
}
function clearAdminSession() {
  adminSession = null;
  localStorage.removeItem(ADMIN_SESSION_KEY);
}

function showLogin(message) {
  document.getElementById('login-view').style.display = 'block';
  document.getElementById('panel-view').style.display = 'none';
  const err = document.getElementById('login-error');
  if (message) {
    err.textContent = message;
    err.classList.add('show');
  } else {
    err.classList.remove('show');
  }
}

function showPanel() {
  document.getElementById('login-view').style.display = 'none';
  document.getElementById('panel-view').style.display = 'block';
  document.getElementById('who-label').textContent = adminSession.usuario + ' · ' + (adminSession.rol || 'admin');
  fetchOrders();
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
    showLogin(null);
    showPanel();
  } catch (err) {
    showLogin(err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = I18n.t('enterBtn');
  }
}

document.getElementById('logout-btn').addEventListener('click', () => {
  clearAdminSession();
  showLogin(null);
});

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
    const res = await apiCall('listarPedidos', { usuario: adminSession.usuario, token: adminSession.token });
    ordersCache = res.pedidos;
    renderOrders();
  } catch (err) {
    if (/no autorizado|expirada/i.test(err.message)) {
      clearAdminSession();
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
        usuario: adminSession.usuario,
        token: adminSession.token,
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
        usuario: adminSession.usuario,
        token: adminSession.token,
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
        usuario: adminSession.usuario,
        token: adminSession.token,
        pedidoId: eliminarBtn.dataset.eliminar,
      });
      await fetchOrders();
    } catch (err) {
      alert(I18n.t('couldNotDeletePrefix') + err.message);
      eliminarBtn.disabled = false;
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
  document.getElementById('admin-orders-title').textContent = I18n.t('ordersTitle');
  document.getElementById('logout-btn').textContent = I18n.t('logoutBtn');
  document.querySelector('[data-filter="activos"]').textContent = I18n.t('filterActive');
  document.querySelector('[data-filter="cobrados"]').textContent = I18n.t('filterPaid');
  document.querySelector('[data-filter="todos"]').textContent = I18n.t('filterAll');
  document.getElementById('refresh-btn').textContent = I18n.t('refreshBtn');
}

function onLangChange() {
  applyStaticI18n();
  if (document.getElementById('panel-view').style.display !== 'none') renderOrders();
}

renderLangSelect(document.getElementById('admin-lang-slot'));
renderLangSelect(document.getElementById('panel-lang-slot'));

// ---------------- Init ----------------

applyStaticI18n();
loadAdminSession();
if (adminSession && adminSession.token) {
  showPanel();
} else {
  showLogin(null);
}
