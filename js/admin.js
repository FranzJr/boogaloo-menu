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
  document.getElementById('menu-view').style.display = 'none';
  document.getElementById('analytics-view').style.display = 'none';
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
  // La analítica (tráfico del sitio) queda reservada al admin, igual que nómina.
  document.getElementById('hub-analytics-btn').style.display = identity.esAdmin ? '' : 'none';
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

// ---------------- Analítica (datos de ejemplo — ver js/analytics-data.js) ----------------

let anData = null;

function showAnalytics() {
  hideAllViews();
  document.getElementById('analytics-view').style.display = 'block';
  document.getElementById('analytics-who-label').textContent = identityLabel();
  if (!anData) anData = generateAnalyticsMock();
  renderAnalytics();
}

function anLangText(field) {
  const lang = (typeof I18n !== 'undefined' && I18n.lang) || 'es';
  return field[lang] || field.es || '';
}

function renderAnalytics() {
  renderAnKpis();
  renderAnTrendChart();
  renderAnByPageChart();
  renderAnDeviceChart();
  renderAnFunnelChart();
  renderAnRecommendations();
  renderAnVisitorsTable();
}

function anPctLabel(n) {
  const sign = n > 0 ? '+' : '';
  return sign + Math.round(n) + '%';
}

function renderAnKpis() {
  const d = anData;
  const trendToday = ((d.visitsToday - d.visitsYesterday) / Math.max(1, d.visitsYesterday)) * 100;
  const trendMonth = ((d.visitsThisMonth - d.visitsLastMonthProjected) / Math.max(1, d.visitsLastMonthProjected)) * 100;
  const tiles = [
    {
      live: true,
      value: String(d.onlineNow),
      label: `<span class="an-live-dot"></span>${I18n.t('anOnlineNow')}`,
    },
    {
      value: String(d.visitsToday),
      label: I18n.t('anVisitsToday'),
      trend: trendToday,
      trendText: I18n.t('anVsYesterday', anPctLabel(trendToday)),
    },
    {
      value: d.visitsThisMonth.toLocaleString('ja-JP'),
      label: I18n.t('anVisitsMonth'),
      trend: trendMonth,
      trendText: I18n.t('anVsLastMonth', anPctLabel(trendMonth)),
    },
    { value: d.conversionPct.toFixed(1) + '%', label: I18n.t('anConversion') },
    { value: I18n.t('anMinutesShort', d.avgSessionMinutes), label: I18n.t('anAvgSession') },
    { value: d.bounceRatePct + '%', label: I18n.t('anBounceRate') },
  ];
  document.getElementById('an-kpis').innerHTML = tiles.map((tile) => `
    <div class="st${tile.live ? ' an-live' : ''}">
      <b>${tile.value}</b>
      <small>${tile.label}</small>
      ${tile.trendText ? `<small class="an-kpi-trend ${tile.trend >= 0 ? 'up' : 'down'}">${tile.trendText}</small>` : ''}
    </div>
  `).join('');
}

function renderAnTrendChart() {
  const series = anData.dailySeries;
  const n = series.length;
  const W = 640, H = 200, mL = 34, mR = 10, mT = 14, mB = 24;
  const plotW = W - mL - mR, plotH = H - mT - mB;
  const maxVal = Math.max(...series.map((d) => d.visits)) * 1.15;
  const x = (i) => mL + (i / (n - 1)) * plotW;
  const y = (v) => mT + plotH - (v / maxVal) * plotH;

  const linePath = series.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.visits).toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${x(n - 1).toFixed(1)},${(mT + plotH).toFixed(1)} L${x(0).toFixed(1)},${(mT + plotH).toFixed(1)} Z`;

  const gridVals = [0, Math.round(maxVal / 2), Math.round(maxVal)];
  const gridLines = gridVals.map((v) => `
    <line x1="${mL}" y1="${y(v).toFixed(1)}" x2="${W - mR}" y2="${y(v).toFixed(1)}" stroke="var(--border)" stroke-width="1" />
    <text x="0" y="${(y(v) + 3).toFixed(1)}" font-size="9" fill="var(--ink-soft)">${v}</text>
  `).join('');

  const labelIdxs = [0, Math.floor((n - 1) / 2), n - 1];
  const dateLabels = labelIdxs.map((i) => `
    <text x="${x(i).toFixed(1)}" y="${H - 4}" font-size="9" fill="var(--ink-soft)" text-anchor="${i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}">${series[i].date.slice(5)}</text>
  `).join('');

  document.getElementById('an-trend-chart').innerHTML = `
    <div class="an-trend-wrap">
      <svg class="an-trend-svg" viewBox="0 0 ${W} ${H}" id="an-trend-svg">
        <defs>
          <linearGradient id="an-trend-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--co-blue)" stop-opacity="0.35" />
            <stop offset="100%" stop-color="var(--co-blue)" stop-opacity="0" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path class="an-trend-area" d="${areaPath}" />
        <path class="an-trend-line" d="${linePath}" />
        <line class="an-trend-guide" id="an-trend-guide" x1="0" y1="${mT}" x2="0" y2="${mT + plotH}" />
        <circle class="an-trend-dot" id="an-trend-dot" r="4" cx="0" cy="0" />
        ${dateLabels}
        <rect class="an-trend-hit" id="an-trend-hit" x="${mL}" y="0" width="${plotW}" height="${H}" />
      </svg>
      <div class="an-tooltip" id="an-trend-tooltip"></div>
    </div>
  `;

  const svg = document.getElementById('an-trend-svg');
  const hit = document.getElementById('an-trend-hit');
  const guide = document.getElementById('an-trend-guide');
  const dot = document.getElementById('an-trend-dot');
  const tooltip = document.getElementById('an-trend-tooltip');
  const wrap = svg.parentElement;

  function showAt(clientX, clientY) {
    const rect = svg.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const i = Math.round(fraction * (n - 1));
    const px = x(i), py = y(series[i].visits);
    guide.setAttribute('x1', px); guide.setAttribute('x2', px);
    guide.classList.add('show');
    dot.setAttribute('cx', px); dot.setAttribute('cy', py);
    dot.classList.add('show');
    const wrapRect = wrap.getBoundingClientRect();
    tooltip.textContent = `${series[i].date} — ${series[i].visits}`;
    tooltip.style.left = (clientX - wrapRect.left) + 'px';
    tooltip.style.top = (clientY - wrapRect.top) + 'px';
    tooltip.classList.add('show');
  }
  function hide() {
    guide.classList.remove('show');
    dot.classList.remove('show');
    tooltip.classList.remove('show');
  }
  hit.addEventListener('mousemove', (e) => showAt(e.clientX, e.clientY));
  hit.addEventListener('mouseleave', hide);
  hit.addEventListener('touchmove', (e) => {
    if (e.touches[0]) showAt(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  hit.addEventListener('touchend', hide);
}

function renderAnByPageChart() {
  const pages = anData.byPage;
  const max = Math.max(...pages.map((p) => p.visits));
  document.getElementById('an-bypage-chart').innerHTML = pages.map((p) => `
    <div class="an-bar-row">
      <div class="an-bar-label"><span>${anLangText(p.nombre)}</span><span class="n">${p.visits}</span></div>
      <div class="an-bar-track"><div class="an-bar-fill" style="width:${Math.max(4, (p.visits / max) * 100)}%;"></div></div>
    </div>
  `).join('');
}

function renderAnDeviceChart() {
  const dv = anData.device;
  const rows = [
    { label: I18n.t('anDeviceMobile'), pct: dv.mobilePct },
    { label: I18n.t('anDeviceDesktop'), pct: dv.desktopPct },
    { label: I18n.t('anDeviceTablet'), pct: dv.tabletPct },
  ];
  document.getElementById('an-device-chart').innerHTML = rows.map((r) => `
    <div class="an-bar-row">
      <div class="an-bar-label"><span>${r.label}</span><span class="n">${r.pct}%</span></div>
      <div class="an-bar-track"><div class="an-bar-fill" style="width:${Math.max(4, r.pct)}%;"></div></div>
    </div>
  `).join('');
}

function renderAnFunnelChart() {
  const f = anData.funnel;
  const stages = [
    { key: 'visits', label: I18n.t('anFunnelVisits'), value: f.visits, tint: 0.25 },
    { key: 'viewedMenu', label: I18n.t('anFunnelViewedMenu'), value: f.viewedMenu, tint: 0.5 },
    { key: 'addedCart', label: I18n.t('anFunnelAddedCart'), value: f.addedCart, tint: 0.72 },
    { key: 'completed', label: I18n.t('anFunnelCompleted'), value: f.completed, tint: 1 },
  ];
  const max = stages[0].value;
  document.getElementById('an-funnel-chart').innerHTML = stages.map((s) => `
    <div class="an-funnel-row">
      <div class="an-funnel-label"><span>${s.label}</span><span class="pct">${s.value.toLocaleString('ja-JP')} (${Math.round((s.value / max) * 100)}%)</span></div>
      <div class="an-funnel-track"><div class="an-funnel-fill" style="width:${Math.max(4, (s.value / max) * 100)}%; background: color-mix(in srgb, var(--co-blue) ${Math.round(s.tint * 100)}%, #cfe0f2);"></div></div>
    </div>
  `).join('');
}

function renderAnRecommendations() {
  const lang = (typeof I18n !== 'undefined' && I18n.lang) || 'es';
  const recs = computeAnRecommendations(anData, lang);
  document.getElementById('an-recommendations').innerHTML = recs.map((r) => `
    <div class="an-rec ${r.severity}">
      <span class="an-rec-dot"></span>
      <div>
        <p class="an-rec-title">${r.title}</p>
        <p class="an-rec-body">${r.body}</p>
      </div>
    </div>
  `).join('');
}

function renderAnVisitorsTable() {
  const rows = anData.visitorsToday;
  const deviceLabel = { mobile: I18n.t('anDeviceMobile'), desktop: I18n.t('anDeviceDesktop'), tablet: I18n.t('anDeviceTablet') };
  document.getElementById('an-visitors-table').innerHTML = `
    <thead>
      <tr>
        <th>${I18n.t('anColVisitorId')}</th>
        <th>${I18n.t('anColFirstSeen')}</th>
        <th>${I18n.t('anColPages')}</th>
        <th>${I18n.t('anColLastPage')}</th>
        <th>${I18n.t('anColDevice')}</th>
        <th>${I18n.t('anColType')}</th>
      </tr>
    </thead>
    <tbody>
      ${rows.map((v) => `
        <tr>
          <td>${v.id}</td>
          <td>${v.firstSeen}</td>
          <td>${v.pages}</td>
          <td>${anLangText(v.lastPage.nombre)}</td>
          <td>${deviceLabel[v.device]}</td>
          <td><span class="an-type-tag ${v.isNew ? 'new' : 'returning'}">${v.isNew ? I18n.t('anNew') : I18n.t('anReturning')}</span></td>
        </tr>
      `).join('')}
    </tbody>
  `;
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

document.getElementById('hub-pedidos-btn').addEventListener('click', showPanel);
document.getElementById('hub-turnos-btn').addEventListener('click', () => {
  window.location.href = 'turnos.html';
});
document.getElementById('hub-reservas-btn').addEventListener('click', showReservas);
document.getElementById('hub-menu-btn').addEventListener('click', showMenuAdmin);
document.getElementById('hub-analytics-btn').addEventListener('click', showAnalytics);
document.getElementById('back-to-hub-btn').addEventListener('click', showHub);
document.getElementById('reservas-back-to-hub-btn').addEventListener('click', showHub);
document.getElementById('menu-back-to-hub-btn').addEventListener('click', showHub);
document.getElementById('analytics-back-to-hub-btn').addEventListener('click', showHub);
document.getElementById('analytics-logout-btn').addEventListener('click', doLogout);
document.getElementById('analytics-regenerate-btn').addEventListener('click', () => {
  anData = anRegenerate();
  renderAnalytics();
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
  document.getElementById('hub-analytics-btn').textContent = I18n.t('anHubBtn');
  document.getElementById('analytics-title').textContent = I18n.t('anTitle');
  document.getElementById('analytics-mock-badge').textContent = I18n.t('anMockBadge');
  document.getElementById('analytics-mock-notice').textContent = I18n.t('anMockNotice');
  document.getElementById('analytics-regenerate-btn').textContent = I18n.t('anRegenerateBtn');
  document.getElementById('analytics-back-to-hub-btn').textContent = I18n.t('backToHubBtn');
  document.getElementById('analytics-logout-btn').textContent = I18n.t('logoutBtn');
  document.getElementById('an-trend-title').textContent = I18n.t('anTrendChartTitle');
  document.getElementById('an-bypage-title').textContent = I18n.t('anByPageTitle');
  document.getElementById('an-device-title').textContent = I18n.t('anByDeviceTitle');
  document.getElementById('an-funnel-title').textContent = I18n.t('anFunnelTitle');
  document.getElementById('an-recommendations-title').textContent = I18n.t('anRecommendationsTitle');
  document.getElementById('an-visitors-title').textContent = I18n.t('anVisitorsTodayTitle');
}

function onLangChange() {
  applyStaticI18n();
  if (document.getElementById('panel-view').style.display !== 'none') renderOrders();
  if (document.getElementById('reservas-view').style.display !== 'none') {
    renderReservas();
    renderHorarioSemanal();
  }
  if (document.getElementById('menu-view').style.display !== 'none') renderMenuAdmin();
  if (document.getElementById('analytics-view').style.display !== 'none') renderAnalytics();
}

renderLangSelect(document.getElementById('admin-lang-slot'));
renderLangSelect(document.getElementById('hub-lang-slot'));
renderLangSelect(document.getElementById('panel-lang-slot'));
renderLangSelect(document.getElementById('reservas-lang-slot'));
renderLangSelect(document.getElementById('analytics-lang-slot'));
renderLangSelect(document.getElementById('menu-lang-slot'));

// ---------------- Init ----------------

applyStaticI18n();
identity = detectIdentity();
if (identity) {
  showHub();
} else {
  showLogin(null);
}
