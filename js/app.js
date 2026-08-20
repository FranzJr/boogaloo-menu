/* Lógica de la página del cliente: renderizar menú, carrito, cuenta y checkout. */

const fmt = (n) => '¥' + Number(n || 0).toLocaleString('ja-JP');

// ---------------- Render del menú ----------------

function renderMenu() {
  const nav = document.getElementById('cat-nav');
  const content = document.getElementById('menu-content');
  nav.innerHTML = '';
  content.innerHTML = '';

  MENU_CATEGORIES.forEach((cat) => {
    const link = document.createElement('a');
    link.href = '#' + cat.id;
    link.textContent = cat.nombre;
    nav.appendChild(link);

    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = cat.id;

    const itemsHtml = (cat.items || [])
      .map((it) => {
        const nombre = mi(it.nombre);
        const subt = mi(it.subt);
        const desc = mi(it.desc);
        const aka = it.aka ? ` <span class="aka">"${it.aka}"</span>` : '';
        return `
      <article class="item-card">
        <div class="item-top">
          <div class="item-info">
            <h3>${nombre}${aka}</h3>
            ${subt ? `<span class="subt">${subt}</span>` : ''}
          </div>
        </div>
        ${desc ? `<p class="item-desc">${desc}</p>` : ''}
        <div class="item-footer">
          <span class="item-price">${fmt(it.precio)}</span>
          <button class="add-btn" data-add-sku="${it.sku}" type="button">${I18n.t('addBtn')}</button>
        </div>
      </article>`;
      })
      .join('');

    const extrasHtml = (cat.extras || []).length
      ? `<div class="extras-row">
          ${cat.extras
            .map((ex) => {
              const exNombre = mi(ex.nombre);
              return `
            <span class="extra-chip">
              ${exNombre} · <span class="price">${fmt(ex.precio)}</span>
              <button data-add-sku="${ex.sku}" type="button" aria-label="${I18n.t('addAria')} ${exNombre}">+</button>
            </span>`;
            })
            .join('')}
        </div>`
      : '';

    section.innerHTML = `
      <div class="category-heading">
        <div class="cat-icon icon-${cat.icon}" aria-hidden="true"></div>
        <div>
          <h2>${cat.nombre}</h2>
          <span class="subt">${mi(cat.subt)}</span>
        </div>
      </div>
      ${cat.nota ? `<p class="category-nota">${mi(cat.nota)}</p>` : ''}
      <div class="item-grid">${itemsHtml}</div>
      ${extrasHtml}
    `;
    content.appendChild(section);
  });
}

document.getElementById('menu-content').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add-sku]');
  if (!btn) return;
  Cart.add(btn.dataset.addSku, 1);
  renderCartBadge();
  const original = btn.textContent;
  btn.textContent = I18n.t('addedBtn');
  setTimeout(() => {
    btn.textContent = original;
  }, 900);
});

// ---------------- Carrito ----------------

function renderCartBadge() {
  const count = Cart.count();
  const badge = document.getElementById('cart-badge');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';

  const bar = document.getElementById('floating-cart-bar');
  const showBar = count > 0 && !document.getElementById('cart-drawer').classList.contains('open');
  bar.classList.toggle('show', showBar);
  document.getElementById('floating-count').textContent = I18n.t('floatingCartText', count);
  document.getElementById('floating-amount').textContent = fmt(Cart.total());
}

function renderCartBody() {
  const body = document.getElementById('cart-body');
  const items = Cart.detailedItems();
  if (!items.length) {
    body.innerHTML = `<div class="empty-cart">${I18n.t('cartEmpty')}</div>`;
  } else {
    body.innerHTML = items
      .map(
        (i) => `
      <div class="cart-row">
        <div class="name">${i.nombre}<small>${fmt(i.precio)} ${I18n.t('perUnit')}</small></div>
        <div class="qty-stepper">
          <button data-qty-sku="${i.sku}" data-delta="-1" type="button">−</button>
          <span>${i.cantidad}</span>
          <button data-qty-sku="${i.sku}" data-delta="1" type="button">+</button>
        </div>
        <div class="subtotal">${fmt(i.subtotal)}</div>
      </div>`
      )
      .join('');
  }
  document.getElementById('cart-total').textContent = fmt(Cart.total());
  document.getElementById('checkout-btn').disabled = items.length === 0;
  renderCartBadge();
}

document.getElementById('cart-body').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-qty-sku]');
  if (!btn) return;
  const sku = btn.dataset.qtySku;
  const delta = Number(btn.dataset.delta);
  const current = Cart.items.find((i) => i.sku === sku);
  const next = (current ? current.cantidad : 0) + delta;
  Cart.setQty(sku, next);
  renderCartBody();
});

function openCart() {
  renderCartBody();
  document.getElementById('cart-overlay').classList.add('open');
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('floating-cart-bar').classList.remove('show');
}
function closeCart() {
  document.getElementById('cart-overlay').classList.remove('open');
  document.getElementById('cart-drawer').classList.remove('open');
  renderCartBadge();
}

document.getElementById('open-cart-btn').addEventListener('click', openCart);
document.getElementById('floating-cart-bar').addEventListener('click', openCart);
document.getElementById('close-cart-btn').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);

// ---------------- Cuenta / checkout ----------------

const modalOverlay = document.getElementById('account-modal');
const modalBody = document.getElementById('account-modal-body');
let modalState = { purpose: 'manage', tab: 'invitado' };

function closeModal() {
  modalOverlay.classList.remove('open');
}

function openAccountModal(purpose) {
  modalState = {
    purpose,
    tab: Session.isLoggedIn() ? 'cuenta' : purpose === 'manage' ? 'login' : 'invitado',
  };
  modalOverlay.classList.add('open');
  renderModal();
}

function renderModal() {
  if (modalState.step === 'confirm') return renderConfirmStep();
  if (modalState.step === 'success') return renderSuccessStep();

  if (Session.isLoggedIn() && modalState.purpose === 'manage') {
    const s = Session.data;
    modalBody.innerHTML = `
      <h2>${I18n.t('myAccountTitle')}</h2>
      <p class="subt">${I18n.t('sessionActive')}</p>
      <div class="order-summary">
        <div class="row"><span>${I18n.t('nameLabel')}</span><span>${s.nombre}</span></div>
        <div class="row"><span>${I18n.t('emailLabel')}</span><span>${s.email}</span></div>
      </div>
      ${Session.isColaborador() ? `<a class="ghost-btn" href="turnos.html" style="display:block; margin-bottom:8px; text-decoration:none;">${I18n.t('tnPageLabel')}</a>` : ''}
      <button class="primary-btn" id="modal-logout-btn" type="button">${I18n.t('logoutBtn')}</button>
      <button class="ghost-btn" id="modal-close-btn" type="button" style="margin-top:8px;">${I18n.t('backToMenuBtn')}</button>
    `;
    document.getElementById('modal-logout-btn').onclick = () => {
      Session.clear();
      updateAccountPill();
      closeModal();
    };
    document.getElementById('modal-close-btn').onclick = closeModal;
    return;
  }

  const tabs = modalState.purpose === 'checkout' ? ['invitado', 'login', 'registro'] : ['login', 'registro'];
  const tabLabels = { invitado: I18n.t('tabGuest'), login: I18n.t('tabLogin'), registro: I18n.t('tabRegister') };

  modalBody.innerHTML = `
    <h2>${modalState.purpose === 'checkout' ? I18n.t('almostReadyTitle') : I18n.t('myAccountTitle')}</h2>
    <p class="subt">${modalState.purpose === 'checkout' ? I18n.t('tellUsWhoSub') : I18n.t('loginOrCreateSub')}</p>
    <div class="tabs" id="modal-tabs">
      ${tabs
        .map((t) => `<button data-tab="${t}" class="${modalState.tab === t ? 'active' : ''}" type="button">${tabLabels[t]}</button>`)
        .join('')}
    </div>
    <div class="form-error" id="modal-error"></div>
    <div id="modal-tab-body"></div>
    ${modalState.purpose === 'manage' ? `<button class="ghost-btn" id="modal-close-btn" type="button">${I18n.t('cancelBtn')}</button>` : ''}
  `;

  document.getElementById('modal-tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    modalState.tab = btn.dataset.tab;
    renderModal();
  });
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) closeBtn.onclick = closeModal;

  renderTabBody();
}

function showModalError(msg) {
  const el = document.getElementById('modal-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
}

function renderTabBody() {
  const el = document.getElementById('modal-tab-body');
  if (modalState.tab === 'invitado') {
    el.innerHTML = `
      <div class="field"><label>${I18n.t('nameLabel')}</label><input id="g-nombre" type="text" placeholder="${I18n.t('yourNamePlaceholder')}" /></div>
      <div class="field"><label>${I18n.t('phoneOptionalLabel')}</label><input id="g-telefono" type="tel" placeholder="${I18n.t('phonePlaceholder')}" /></div>
      <button class="primary-btn" id="g-submit" type="button">${I18n.t('continueGuestBtn')}</button>
    `;
    document.getElementById('g-submit').onclick = () => {
      const nombre = document.getElementById('g-nombre').value.trim();
      if (!nombre) return showModalError(I18n.t('writeNameError'));
      const telefono = document.getElementById('g-telefono').value.trim();
      Session.ensureGuest(nombre, telefono);
      updateAccountPill();
      afterIdentified();
    };
  } else if (modalState.tab === 'login') {
    el.innerHTML = `
      <div class="field"><label>${I18n.t('emailLabel')}</label><input id="l-email" type="email" placeholder="${I18n.t('emailPlaceholder')}" /></div>
      <div class="field"><label>${I18n.t('passwordLabel')}</label><input id="l-clave" type="password" placeholder="••••••••" /></div>
      <button class="primary-btn" id="l-submit" type="button">${I18n.t('loginBtnText')}</button>
    `;
    document.getElementById('l-submit').onclick = async () => {
      const email = document.getElementById('l-email').value.trim();
      const clave = document.getElementById('l-clave').value;
      if (!email || !clave) return showModalError(I18n.t('fillEmailPassError'));
      try {
        const res = await apiCall('loginCliente', { email, clave });
        Session.setCliente(res.cliente);
        updateAccountPill();
        afterIdentified();
      } catch (err) {
        showModalError(err.message);
      }
    };
  } else if (modalState.tab === 'registro') {
    el.innerHTML = `
      <div class="field"><label>${I18n.t('nameLabel')}</label><input id="r-nombre" type="text" /></div>
      <div class="field"><label>${I18n.t('emailLabel')}</label><input id="r-email" type="email" /></div>
      <div class="field"><label>${I18n.t('phoneOptionalLabel')}</label><input id="r-telefono" type="tel" /></div>
      <div class="field"><label>${I18n.t('passwordLabel')}</label><input id="r-clave" type="password" /></div>
      <button class="primary-btn" id="r-submit" type="button">${I18n.t('createAccountBtn')}</button>
    `;
    document.getElementById('r-submit').onclick = async () => {
      const nombre = document.getElementById('r-nombre').value.trim();
      const email = document.getElementById('r-email').value.trim();
      const telefono = document.getElementById('r-telefono').value.trim();
      const clave = document.getElementById('r-clave').value;
      if (!nombre || !email || !clave) return showModalError(I18n.t('fillAllError'));
      try {
        const res = await apiCall('registrarCliente', { nombre, email, telefono, clave });
        Session.setCliente(res.cliente);
        updateAccountPill();
        afterIdentified();
      } catch (err) {
        showModalError(err.message);
      }
    };
  }
}

function afterIdentified() {
  if (modalState.purpose === 'checkout') {
    modalState.step = 'confirm';
    renderModal();
  } else {
    closeModal();
  }
}

function renderConfirmStep() {
  const items = Cart.detailedItems();
  modalBody.innerHTML = `
    <h2>${I18n.t('confirmOrderTitle')}</h2>
    <p class="subt">${I18n.t('reviewItemsSub')}</p>
    <div class="order-summary">
      ${items.map((i) => `<div class="row"><span>${i.cantidad}x ${i.nombre}</span><span>${fmt(i.subtotal)}</span></div>`).join('')}
      <div class="row total"><span>${I18n.t('totalLabel')}</span><span>${fmt(Cart.total())}</span></div>
    </div>
    <div class="form-error" id="modal-error"></div>
    <button class="primary-btn" id="confirm-submit" type="button">${I18n.t('sendOrderBtn')}</button>
    <button class="ghost-btn" id="confirm-back" type="button" style="margin-top:8px;">${I18n.t('backBtn')}</button>
  `;
  document.getElementById('confirm-back').onclick = () => {
    modalState.step = null;
    renderModal();
  };
  document.getElementById('confirm-submit').onclick = submitOrder;
}

// Pedido activo (no cobrado) de hoy ya rastreado en este dispositivo: si existe,
// lo nuevo se suma ahí en vez de crear un pedido aparte (misma mesa/cliente).
function activeTrackedOrderToday() {
  const hoy = new Date().toDateString();
  return trackedOrdersData.find(
    (p) => p.Estado !== 'Cobrado' && new Date(p.Fecha).toDateString() === hoy
  );
}

async function submitOrder() {
  const btn = document.getElementById('confirm-submit');
  btn.disabled = true;
  btn.textContent = I18n.t('sendingBtn');
  try {
    const s = Session.data;
    const cliente =
      s && s.tipo === 'cliente'
        ? { tipo: 'cliente', nombre: s.nombre, telefono: s.telefono, email: s.email }
        : { tipo: 'invitado', nombre: (s && s.nombre) || 'Invitado', telefono: (s && s.telefono) || '' };

    await refreshTrackedOrders();
    const abierto = activeTrackedOrderToday();

    let res;
    if (abierto) {
      try {
        res = await apiCall('agregarItems', { pedidoId: abierto.ID, items: Cart.items });
      } catch (err) {
        // el pedido abierto ya no admite items (p.ej. lo acaban de cobrar): crea uno nuevo
        res = await apiCall('crearPedido', { cliente, items: Cart.items });
      }
    } else {
      res = await apiCall('crearPedido', { cliente, items: Cart.items });
    }

    Cart.clear();
    trackOrder(res.pedidoId);
    modalState.step = 'success';
    modalState.lastOrder = res;
    renderModal();
  } catch (err) {
    showModalError(err.message);
    btn.disabled = false;
    btn.textContent = I18n.t('sendOrderBtn');
  }
}

function renderSuccessStep() {
  const order = modalState.lastOrder;
  modalBody.innerHTML = `
    <div class="form-success">
      <div class="check">✓</div>
      <h2>${order.combinado ? I18n.t('orderAddedTitle') : I18n.t('orderSentTitle')}</h2>
      <p class="subt">${order.pedidoId}</p>
    </div>
    <div class="order-summary">
      ${order.items.map((i) => `<div class="row"><span>${i.cantidad}x ${i.nombre}</span><span>${fmt(i.subtotal)}</span></div>`).join('')}
      <div class="row total"><span>${order.combinado ? I18n.t('orderTotalLabel') : I18n.t('totalLabel')}</span><span>${fmt(order.total)}</span></div>
    </div>
    <button class="primary-btn" id="success-close" type="button">${I18n.t('doneBtn')}</button>
  `;
  document.getElementById('success-close').onclick = () => {
    modalState = { purpose: 'manage', tab: 'invitado' };
    closeModal();
    closeCart();
    renderCartBody();
  };
}

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (!Cart.items.length) return;
  if (Session.hasIdentity()) {
    modalState = { purpose: 'checkout', step: 'confirm' };
    modalOverlay.classList.add('open');
    renderConfirmStep();
  } else {
    openAccountModal('checkout');
  }
});

document.getElementById('account-pill').addEventListener('click', () => openAccountModal('manage'));

function updateAccountPill() {
  const pill = document.getElementById('account-pill');
  const s = Session.data;
  pill.textContent = s && s.tipo === 'cliente' ? s.nombre : s && s.nombre ? s.nombre + I18n.t('guestSuffix') : I18n.t('guest');
}

// ---------------- Mis pedidos (seguimiento hasta que quede Cobrado) ----------------

const TRACKED_ORDERS_KEY = 'boogaloo_pedidos_seguidos_v1';
let trackedOrdersData = [];

function trackedOrderIds() {
  try {
    return JSON.parse(localStorage.getItem(TRACKED_ORDERS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function trackOrder(pedidoId) {
  const ids = trackedOrderIds();
  if (ids.indexOf(pedidoId) === -1) {
    ids.unshift(pedidoId);
    localStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify(ids.slice(0, 20)));
  }
  refreshTrackedOrders();
}

const ordersModalOverlay = document.getElementById('orders-modal');
const ordersModalBody = document.getElementById('orders-modal-body');

function closeOrdersModal() {
  ordersModalOverlay.classList.remove('open');
}
ordersModalOverlay.addEventListener('click', (e) => {
  if (e.target === ordersModalOverlay) closeOrdersModal();
});

document.getElementById('my-orders-btn').addEventListener('click', async () => {
  ordersModalOverlay.classList.add('open');
  ordersModalBody.innerHTML = `<h2>${I18n.t('myOrdersModalTitle')}</h2><p class="subt">${I18n.t('loadingText')}</p>`;
  await refreshTrackedOrders();
  renderOrdersModal();
});

function estadoTagClass(estado) {
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

function renderOrdersModal() {
  if (!trackedOrdersData.length) {
    ordersModalBody.innerHTML = `
      <h2>${I18n.t('myOrdersModalTitle')}</h2>
      <p class="subt">${I18n.t('noOrdersYetText')}</p>
      <button class="ghost-btn" id="orders-modal-close" type="button">${I18n.t('closeBtn')}</button>
    `;
  } else {
    ordersModalBody.innerHTML = `
      <h2>${I18n.t('myOrdersModalTitle')}</h2>
      <p class="subt">${I18n.t('autoUpdatesText')}</p>
      ${trackedOrdersData
        .map(
          (p) => `
        <div class="order-summary" style="margin-bottom:10px;">
          <div class="row" style="align-items:center;">
            <strong>${p.ID}</strong>
            <span class="status-tag ${estadoTagClass(p.Estado)}">${estadoLabel(p.Estado)}</span>
          </div>
          ${p.Items.map((i) => `<div class="row"><span>${i.cantidad}x ${i.nombre}${i.entregado ? ' ✓' : ''}</span><span>${fmt(i.subtotal)}</span></div>`).join('')}
          <div class="row total"><span>${I18n.t('totalLabel')}</span><span>${fmt(p.Total)}</span></div>
        </div>`
        )
        .join('')}
      <button class="ghost-btn" id="orders-modal-close" type="button">${I18n.t('closeBtn')}</button>
    `;
  }
  document.getElementById('orders-modal-close').onclick = closeOrdersModal;
}

async function refreshTrackedOrders() {
  const ids = trackedOrderIds();
  const badge = document.getElementById('my-orders-badge');
  const btn = document.getElementById('my-orders-btn');
  if (!ids.length) {
    btn.style.display = 'none';
    return;
  }
  btn.style.display = 'flex';
  try {
    const res = await apiCall('consultarPedidos', { ids });
    trackedOrdersData = res.pedidos;
    const activos = trackedOrdersData.filter((p) => p.Estado !== 'Cobrado').length;
    badge.textContent = activos;
    badge.style.display = activos > 0 ? 'flex' : 'none';
    if (ordersModalOverlay.classList.contains('open')) renderOrdersModal();
  } catch (err) {
    // si falla la consulta (ej. backend no configurado aún), no interrumpe el resto de la app
  }
}

// ---------------- Idioma ----------------

function applyStaticI18n() {
  document.getElementById('brand-tagline').textContent = I18n.t('brandTagline');
  document.getElementById('my-orders-label').textContent = I18n.t('myOrders');
  document.getElementById('cart-label').textContent = I18n.t('cart');
  document.getElementById('site-footer-text').textContent = I18n.t('footerText');
  document.getElementById('cart-drawer-title').textContent = I18n.t('cartDrawerTitle');
  document.getElementById('cart-total-label').textContent = I18n.t('totalLabel');
  document.getElementById('checkout-btn').textContent = I18n.t('continueOrder');
}

function onLangChange() {
  applyStaticI18n();
  renderMenu();
  renderCartBadge();
  updateAccountPill();
  if (document.getElementById('cart-drawer').classList.contains('open')) renderCartBody();
  if (modalOverlay.classList.contains('open')) renderModal();
  if (ordersModalOverlay.classList.contains('open')) renderOrdersModal();
}

renderLangSelect(document.getElementById('lang-select-slot'));

// ---------------- Init ----------------

applyStaticI18n();
renderMenu();
renderCartBadge();
updateAccountPill();
refreshTrackedOrders();
setInterval(refreshTrackedOrders, 20000);
