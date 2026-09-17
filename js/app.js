/* Lógica de la página del cliente: renderizar menú, carrito, cuenta y checkout. */

renderSiteHeader(`
  <span id="lang-select-slot"></span>
  <button class="account-pill" id="account-pill" type="button">Invitado</button>
  <button class="cart-btn my-orders-btn" id="my-orders-btn" type="button" style="display:none;">
    <span class="icon-receipt" aria-hidden="true"></span>
    <span id="my-orders-label">Mis pedidos</span>
    <span class="badge" id="my-orders-badge" style="display:none;">0</span>
  </button>
  <button class="cart-btn" id="open-cart-btn" type="button">
    <span class="icon-cart" aria-hidden="true"></span>
    <span id="cart-label">Carrito</span>
    <span class="badge" id="cart-badge" style="display:none;">0</span>
  </button>
`, `<nav class="cat-nav" id="cat-nav"></nav>`);
renderSiteFooter();

const fmt = (n) => '¥' + Number(n || 0).toLocaleString('ja-JP');

// ---------------- Gate de bienvenida (restaurante vs reserva) ----------------

const GATE_KEY = 'boogaloo_entry_choice_v1';
const gateModal = document.getElementById('gate-modal');

document.getElementById('gate-dine-in-btn').addEventListener('click', () => {
  sessionStorage.setItem(GATE_KEY, 'restaurante');
  gateModal.classList.remove('open');
});
document.getElementById('gate-reserve-btn').addEventListener('click', () => {
  sessionStorage.setItem(GATE_KEY, 'reserva');
  window.location.href = 'reserva.html';
});
if (!sessionStorage.getItem(GATE_KEY)) {
  gateModal.classList.add('open');
}

// ---------------- Render del menú ----------------

// Junta variantes en una sola tarjeta en vez de una tarjeta repetida por cada
// combinación. Dos niveles de agrupación:
// - sizeGroup: mismo producto en varios tamaños (ej. Capuccino 8oz/12oz) -> selector de tamaño.
// - styleGroup: además tiene una variante de "estilo" (Agua/Leche, ej. Jugo de Mango) ->
//   selector de estilo + selector de tamaño dentro del estilo elegido.
function groupItemsForDisplay(items) {
  const groups = [];
  const bySize = {};
  const byStyle = {};
  (items || []).forEach((it) => {
    if (it.styleGroup) {
      if (!byStyle[it.styleGroup]) {
        byStyle[it.styleGroup] = { kind: 'style', key: it.styleGroup, byStyleName: {}, styleOrder: [] };
        groups.push(byStyle[it.styleGroup]);
      }
      const g = byStyle[it.styleGroup];
      if (!g.byStyleName[it.style]) {
        g.byStyleName[it.style] = [];
        g.styleOrder.push(it.style);
      }
      g.byStyleName[it.style].push(it);
      return;
    }
    if (!it.sizeGroup) {
      groups.push({ kind: 'single', item: it });
      return;
    }
    if (!bySize[it.sizeGroup]) {
      bySize[it.sizeGroup] = { kind: 'size', key: it.sizeGroup, variants: [] };
      groups.push(bySize[it.sizeGroup]);
    }
    bySize[it.sizeGroup].variants.push(it);
  });
  // Si un sizeGroup terminó con un solo item, se muestra simple (sin pills).
  return groups.map((g) => (g.kind === 'size' && g.variants.length === 1 ? { kind: 'single', item: g.variants[0] } : g));
}

// Le quita el sufijo de onzas al nombre para mostrar el nombre "base" en la
// tarjeta agrupada (ej. "Capuccino 8oz" -> "Capuccino").
function stripSizeSuffix(nombre) {
  return nombre.replace(/\s*\d+\s*oz\s*$/i, '');
}

function sizeLabel(nombre) {
  const m = nombre.match(/(\d+\s*oz)\s*$/i);
  return m ? m[1].replace(/\s+/, '') : nombre;
}

// ---------------- Productos agotados ----------------
// Set de skus agotados, cargado del backend. El primer render del menú pasa
// sin esta info (todo se ve disponible) y se re-renderiza en cuanto llega,
// igual que refreshTrackedOrders: no bloquea el primer pintado del menú.
let agotadosSkus = new Set();

async function fetchAgotados() {
  try {
    const res = await apiCall('listarAgotados', {});
    agotadosSkus = new Set(res.skus || []);
  } catch (err) {
    // si falla, el menú se queda como si nada estuviera agotado
  }
}

function isAgotado(sku) {
  return agotadosSkus.has(sku);
}

function renderMenu() {
  const nav = document.getElementById('cat-nav');
  const content = document.getElementById('menu-content');
  nav.innerHTML = '';
  content.innerHTML = '';

  MENU_CATEGORIES.forEach((cat) => {
    const link = document.createElement('a');
    link.href = '#' + cat.id;
    link.textContent = mi(cat.nombre);
    nav.appendChild(link);

    const section = document.createElement('section');
    section.className = 'category-section';
    section.id = cat.id;

    const itemsHtml = groupItemsForDisplay(cat.items)
      .map((g) => {
        if (g.kind === 'single') {
          const it = g.item;
          const nombre = mi(it.nombre);
          const subt = mi(it.subt);
          const desc = mi(it.desc);
          const aka = it.aka ? ` <span class="aka">"${it.aka}"</span>` : '';
          const photo = it.img
            ? `<img class="item-photo" src="${it.img}" alt="" loading="lazy" ${it.imgPosition ? `style="object-position: ${it.imgPosition};"` : ''} />`
            : '';
          const outOfStock = isAgotado(it.sku);
          return `
      <article class="item-card${it.img ? ' has-photo' : ''}${outOfStock ? ' out-of-stock' : ''}">
        ${photo}
        <div class="item-top">
          <div class="item-info">
            <h3>${nombre}${aka}</h3>
            ${subt ? `<span class="subt">${subt}</span>` : ''}
          </div>
        </div>
        ${desc ? `<p class="item-desc">${desc}</p>` : ''}
        <div class="item-footer">
          <span class="item-price">${fmt(it.precio)}</span>
          <button class="add-btn" data-add-sku="${it.sku}" type="button" ${outOfStock ? 'disabled' : ''}>${outOfStock ? I18n.t('outOfStockBtn') : I18n.t('addBtn')}</button>
        </div>
      </article>`;
        }

        if (g.kind === 'style') {
          // Tarjeta con selector de estilo (Agua/Leche) + selector de tamaño dentro
          // del estilo elegido (ej. Jugo de Mango: Agua/Leche × 12oz/16oz).
          const styleNames = g.styleOrder;
          const stylesData = {};
          styleNames.forEach((styleName) => {
            stylesData[styleName] = g.byStyleName[styleName].map((v) => ({
              sku: v.sku,
              precio: v.precio,
              label: sizeLabel(mi(v.nombre)),
              out: isAgotado(v.sku),
            }));
          });
          const first = g.byStyleName[styleNames[0]][0];
          const nombreBase = mi(first.nombreBase);
          const photo = first.img
            ? `<img class="item-photo" src="${first.img}" alt="" loading="lazy" ${first.imgPosition ? `style="object-position: ${first.imgPosition};"` : ''} />`
            : '';

          const allOut = styleNames.every((s) => stylesData[s].every((v) => v.out));
          // Arranca en el primer estilo que tenga al menos un tamaño disponible.
          const initialStyle = styleNames.find((s) => stylesData[s].some((v) => !v.out)) || styleNames[0];
          const initialVariants = stylesData[initialStyle];
          const availableInitial = initialVariants.filter((v) => !v.out);
          const initial = allOut ? initialVariants[0] : availableInitial[0];

          const styleLabel = (s) => I18n.t(s === 'Agua' ? 'styleAgua' : 'styleLeche');
          const stylePills = styleNames
            .map((s) => `
          <button type="button" class="pill-option${s === initialStyle ? ' selected' : ''}" data-style="${s}">${styleLabel(s)}</button>`)
            .join('');

          const sizePillsHtml = (variants, allOutInStyle, initialSku) =>
            variants
              .map((v) => {
                const selected = !allOutInStyle && v.sku === initialSku;
                const label = v.label + (v.out ? ' · ' + I18n.t('outOfStockBtn') : '');
                return `
          <button type="button" class="pill-option${selected ? ' selected' : ''}${v.out ? ' agotado' : ''}" data-size-sku="${v.sku}" data-price="${v.precio}" ${v.out ? 'disabled' : ''}>${label}</button>`;
              })
              .join('');

          const stylesJson = JSON.stringify(stylesData).replace(/'/g, '&#39;');

          return `
      <article class="item-card${first.img ? ' has-photo' : ''} style-group${allOut ? ' out-of-stock' : ''}" data-group="${g.key}" data-styles='${stylesJson}'>
        ${photo}
        <div class="item-top">
          <div class="item-info">
            <h3>${nombreBase}</h3>
          </div>
        </div>
        <div class="pill-row style-row" data-style-row>${stylePills}</div>
        <div class="pill-row size-row" data-size-row>${sizePillsHtml(initialVariants, allOut, initial.sku)}</div>
        <div class="item-footer">
          <span class="item-price">${fmt(initial.precio)}</span>
          <button class="add-btn" data-add-sku="${initial.sku}" type="button" ${allOut ? 'disabled' : ''}>${allOut ? I18n.t('outOfStockBtn') : I18n.t('addBtn')}</button>
        </div>
      </article>`;
        }

        // Tarjeta agrupada por tamaño (café 8/12oz, guanábana 12/16oz...)
        const variants = g.variants;
        const first = variants[0];
        const availableVariants = variants.filter((v) => !isAgotado(v.sku));
        const allOut = availableVariants.length === 0;
        // Si el tamaño seleccionado por defecto está agotado, arranca en el
        // primero que sí haya (así el precio/botón inicial ya son válidos).
        const initial = allOut ? first : availableVariants[0];
        const nombreBase = stripSizeSuffix(mi(first.nombre));
        const photo = first.img
          ? `<img class="item-photo" src="${first.img}" alt="" loading="lazy" ${first.imgPosition ? `style="object-position: ${first.imgPosition};"` : ''} />`
          : '';
        const esAmbasTemp = first.subt && first.subt.es === 'Caliente o frío';
        const esSoloCaliente = first.subt && first.subt.es === 'Caliente';
        const subtHtml = esSoloCaliente ? `<span class="subt">${mi(first.subt)}</span>` : '';

        const sizePills = variants
          .map((v) => {
            const out = isAgotado(v.sku);
            const selected = !allOut && v.sku === initial.sku;
            const label = sizeLabel(mi(v.nombre)) + (out ? ' · ' + I18n.t('outOfStockBtn') : '');
            return `
          <button type="button" class="pill-option${selected ? ' selected' : ''}${out ? ' agotado' : ''}" data-size-sku="${v.sku}" data-price="${v.precio}" ${out ? 'disabled' : ''}>${label}</button>`;
          })
          .join('');

        // El valor real (data-temp) queda fijo en español -- es lo que ve
        // cocina en el pedido -- aunque el texto del botón sí se traduzca.
        const tempPills = esAmbasTemp
          ? `
          <div class="pill-row temp-row" data-temp-row>
            <button type="button" class="pill-option selected" data-temp="Caliente">${I18n.t('tempHot')}</button>
            <button type="button" class="pill-option" data-temp="Frío">${I18n.t('tempIced')}</button>
          </div>`
          : '';

        return `
      <article class="item-card${first.img ? ' has-photo' : ''} size-group${allOut ? ' out-of-stock' : ''}" data-group="${g.key}">
        ${photo}
        <div class="item-top">
          <div class="item-info">
            <h3>${nombreBase}</h3>
            ${subtHtml}
          </div>
        </div>
        <div class="pill-row size-row" data-size-row>${sizePills}</div>
        ${tempPills}
        <div class="item-footer">
          <span class="item-price">${fmt(initial.precio)}</span>
          <button class="add-btn" data-add-group="${g.key}" data-add-sku="${initial.sku}" type="button" ${allOut ? 'disabled' : ''}>${allOut ? I18n.t('outOfStockBtn') : I18n.t('addBtn')}</button>
        </div>
      </article>`;
      })
      .join('');

    const extrasHtml = (cat.extras || []).length
      ? `<div class="extras-row">
          ${cat.extras
            .map((ex) => {
              const exNombre = mi(ex.nombre);
              const out = isAgotado(ex.sku);
              return `
            <span class="extra-chip${out ? ' out-of-stock' : ''}">
              ${exNombre} · <span class="price">${fmt(ex.precio)}</span>
              <button data-add-sku="${ex.sku}" type="button" aria-label="${I18n.t('addAria')} ${exNombre}" ${out ? 'disabled' : ''}>${out ? '×' : '+'}</button>
            </span>`;
            })
            .join('')}
        </div>`
      : '';

    section.innerHTML = `
      <div class="category-heading">
        <div class="cat-icon icon-${cat.icon}" aria-hidden="true"></div>
        <div>
          <h2>${mi(cat.nombre)}</h2>
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
  const stylePill = e.target.closest('[data-style]');
  if (stylePill) {
    const card = stylePill.closest('.item-card');
    card.querySelectorAll('[data-style]').forEach((p) => p.classList.remove('selected'));
    stylePill.classList.add('selected');

    const stylesData = JSON.parse(card.dataset.styles);
    const variants = stylesData[stylePill.dataset.style];
    const available = variants.filter((v) => !v.out);
    const allOut = available.length === 0;
    const initial = allOut ? variants[0] : available[0];

    const sizeRow = card.querySelector('[data-size-row]');
    sizeRow.innerHTML = variants
      .map((v) => {
        const selected = !allOut && v.sku === initial.sku;
        const label = v.label + (v.out ? ' · ' + I18n.t('outOfStockBtn') : '');
        return `<button type="button" class="pill-option${selected ? ' selected' : ''}${v.out ? ' agotado' : ''}" data-size-sku="${v.sku}" data-price="${v.precio}" ${v.out ? 'disabled' : ''}>${label}</button>`;
      })
      .join('');

    card.querySelector('.item-price').textContent = fmt(initial.precio);
    const addBtn = card.querySelector('[data-add-sku]');
    addBtn.dataset.addSku = initial.sku;
    addBtn.disabled = allOut;
    addBtn.textContent = allOut ? I18n.t('outOfStockBtn') : I18n.t('addBtn');
    return;
  }

  const sizePill = e.target.closest('[data-size-sku]');
  if (sizePill) {
    const card = sizePill.closest('.item-card');
    card.querySelectorAll('[data-size-sku]').forEach((p) => p.classList.remove('selected'));
    sizePill.classList.add('selected');
    card.querySelector('.item-price').textContent = fmt(sizePill.dataset.price);
    const addBtn = card.querySelector('[data-add-sku]');
    if (addBtn) addBtn.dataset.addSku = sizePill.dataset.sizeSku;
    return;
  }

  const tempPill = e.target.closest('[data-temp]');
  if (tempPill) {
    const row = tempPill.closest('[data-temp-row]');
    row.querySelectorAll('[data-temp]').forEach((p) => p.classList.remove('selected'));
    tempPill.classList.add('selected');
    return;
  }

  const btn = e.target.closest('[data-add-sku]');
  if (!btn) return;
  const card = btn.closest('.item-card');
  const tempPillSelected = card.querySelector('[data-temp].selected');
  const nota = tempPillSelected ? tempPillSelected.dataset.temp : undefined;
  Cart.add(btn.dataset.addSku, 1, nota);
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
  applyLayoutI18n();
  document.getElementById('page-subtitle').textContent = I18n.t('brandTagline');
  document.getElementById('my-orders-label').textContent = I18n.t('myOrders');
  document.getElementById('cart-label').textContent = I18n.t('cart');
  document.getElementById('cart-drawer-title').textContent = I18n.t('cartDrawerTitle');
  document.getElementById('cart-total-label').textContent = I18n.t('totalLabel');
  document.getElementById('checkout-btn').textContent = I18n.t('continueOrder');
  document.getElementById('gate-title').textContent = I18n.t('gateTitle');
  document.getElementById('gate-subtitle').textContent = I18n.t('gateSubtitle');
  document.getElementById('gate-dine-in-btn').textContent = I18n.t('gateDineInBtn');
  document.getElementById('gate-reserve-btn').textContent = I18n.t('gateReserveBtn');
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
fetchAgotados().then(renderMenu);
setInterval(() => fetchAgotados().then(renderMenu), 60000);
