/* Envíos congelados — lógica de la página.
   Carrito y "pedidos de envío" son independientes del carrito del menú
   (js/cart.js): usan su propia clave de localStorage porque son un
   producto distinto (packs para enviar, no consumo en el local).

   El envío final de la solicitud NO llama todavía al backend (Apps
   Script) — eso se conecta después (ver README de esta carpeta / pendiente
   de pagos). Por ahora la solicitud se guarda en localStorage y se ofrece
   un mailto: prellenado como puente hasta que exista esa acción. */

const fmtY = (n) => '¥' + Math.round(Number(n) || 0).toLocaleString('ja-JP');

const FZ_CART_KEY = 'boogaloo_envios_cart_v1';
const FZ_ORDERS_KEY = 'boogaloo_envios_orders_v1';

const FzCart = {
  items: {}, // { [productId]: cantidad }

  load() {
    try {
      this.items = JSON.parse(localStorage.getItem(FZ_CART_KEY) || '{}');
    } catch (e) {
      this.items = {};
    }
    return this.items;
  },

  save() {
    localStorage.setItem(FZ_CART_KEY, JSON.stringify(this.items));
  },

  setQty(id, qty) {
    if (qty <= 0) {
      delete this.items[id];
    } else {
      this.items[id] = qty;
    }
    this.save();
  },

  qty(id) {
    return this.items[id] || 0;
  },

  count() {
    return Object.values(this.items).reduce((sum, q) => sum + q, 0);
  },

  detailedItems() {
    return Object.keys(this.items)
      .map((id) => {
        const def = ENVIOS_INDEX[id];
        if (!def) return null;
        const cantidad = this.items[id];
        return { id, cantidad, nombre: ei(def.nombre), precio: def.precio, subtotal: def.precio * cantidad };
      })
      .filter(Boolean);
  },

  subtotal() {
    return this.detailedItems().reduce((sum, i) => sum + i.subtotal, 0);
  },

  clear() {
    this.items = {};
    this.save();
  },
};

FzCart.load();

// Hasta 3 productos marcados con "Comparar" (no se persiste: es una ayuda
// puntual mientras se navega el catálogo, no parte del pedido).
const FzCompare = {
  ids: [],
  has(id) { return this.ids.indexOf(id) !== -1; },
  toggle(id) {
    const i = this.ids.indexOf(id);
    if (i !== -1) {
      this.ids.splice(i, 1);
      return true;
    }
    if (this.ids.length >= 3) return false;
    this.ids.push(id);
    return true;
  },
};

let fzReheatOpen = {}; // { [productId]: bool } — estado de los acordeones "Cómo recalentar"
let fzCheckoutStep = 1; // 1 revisión, 2 datos de envío, 3 confirmación, 4 éxito
let fzShippingData = { nombre: '', telefono: '', postal: '', prefectura: '', direccion: '', fecha: '', notas: '' };
let fzLastOrderId = '';

function fzShippingFee() {
  const subtotal = FzCart.subtotal();
  return subtotal >= ENVIOS_CONFIG.freeShippingThreshold || subtotal === 0 ? 0 : ENVIOS_CONFIG.shippingFee;
}

function fzTotal() {
  return FzCart.subtotal() + fzShippingFee();
}

// ---------------- Header / Footer (rutas relativas a /envios/) ----------------

function renderFzHeader() {
  const mount = document.getElementById('fz-header-mount');
  mount.innerHTML = `
    <div class="flag-stripe"></div>
    <header class="site-header fz-header">
      <div class="header-inner">
        <a class="brand" href="../index.html" style="text-decoration:none; color:inherit;">
          <picture>
            <source media="(max-width: 640px)" srcset="../img/logo/logo-mobile.png" />
            <img class="brand-logo" src="../img/logo/logo-web.png" alt="Boogaloo" />
          </picture>
          <div class="brand-text">
            <h1 class="sr-only">Boogaloo</h1>
            <p id="fz-page-subtitle"></p>
          </div>
        </a>
        <div class="header-actions">
          <span id="fz-lang-select-slot"></span>
          <a class="cart-btn fz-back-link" href="../index.html" id="fz-back-link">←</a>
        </div>
      </div>
    </header>
  `;
  renderLangSelect(document.getElementById('fz-lang-select-slot'));
}

function renderFzFooter() {
  const mount = document.getElementById('fz-footer-mount');
  mount.innerHTML = `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <span id="fz-footer-text"></span>
        <nav class="footer-links">
          <a href="../index.html" id="fz-footer-menu-link"></a>
          <a href="../about.html" id="fz-footer-historia-link"></a>
          <a href="https://instagram.com/boogaloo.jp" target="_blank" rel="noopener">Instagram</a>
        </nav>
        <span class="footer-copyright" id="fz-footer-copyright"></span>
      </div>
    </footer>
  `;
}

function renderFzSnow() {
  const host = document.getElementById('fz-snow');
  let html = '';
  for (let i = 0; i < 18; i++) {
    const left = Math.round(Math.random() * 100);
    const duration = (6 + Math.random() * 6).toFixed(1);
    const delay = (Math.random() * 6).toFixed(1);
    const size = (4 + Math.random() * 4).toFixed(1);
    html += `<span style="left:${left}%; width:${size}px; height:${size}px; animation-duration:${duration}s; animation-delay:${delay}s;"></span>`;
  }
  host.innerHTML = html;
}

// ---------------- Mascota ----------------

function updateFzMascot() {
  const bubble = document.getElementById('fz-mascot-bubble');
  const subtotal = FzCart.subtotal();
  if (subtotal === 0) {
    bubble.textContent = I18n.t('fzMascotEmpty');
    return;
  }
  const missing = ENVIOS_CONFIG.freeShippingThreshold - subtotal;
  if (missing > 0) {
    bubble.textContent = I18n.t('fzMascotAlmostFree', fmtY(missing));
  } else {
    bubble.textContent = I18n.t('fzMascotFreeUnlocked');
  }
}

// ---------------- Catálogo ----------------

function fzBadgeLabel(badge) {
  if (badge === 'bestseller') return I18n.t('fzBadgeBestseller');
  if (badge === 'popular') return I18n.t('fzBadgePopular');
  if (badge === 'new') return I18n.t('fzBadgeNew');
  if (badge === 'bestvalue') return I18n.t('fzBadgeBestValue');
  return '';
}

function renderCatalog() {
  const grid = document.getElementById('fz-grid');
  grid.innerHTML = ENVIOS_PRODUCTS.map((p) => {
    const qty = FzCart.qty(p.id);
    const reheatOpen = !!fzReheatOpen[p.id];
    return `
      <article class="fz-card" data-id="${p.id}">
        <div class="fz-card-img-wrap">
          <img src="${p.img}" alt="${ei(p.nombre)}" />
          ${p.badge ? `<span class="fz-badge">${fzBadgeLabel(p.badge)}</span>` : ''}
        </div>
        <div class="fz-card-body">
          <h4>${ei(p.nombre)}</h4>
          <div class="fz-card-meta">
            <span>${I18n.t('fzServings', p.porciones)}</span>
            <span>${p.peso}</span>
            ${p.prepMinutos ? `<span>${I18n.t('fzPrepTime', p.prepMinutos)}</span>` : ''}
          </div>
          <p class="fz-card-desc">${ei(p.desc)}</p>
          <button type="button" class="fz-reheat-toggle" data-reheat="${p.id}">${I18n.t('fzReheatTitle')}</button>
          <p class="fz-reheat-text${reheatOpen ? ' show' : ''}" id="fz-reheat-${p.id}">${ei(p.recalentado)}</p>
          <label class="fz-compare-check">
            <input type="checkbox" data-compare="${p.id}" ${FzCompare.has(p.id) ? 'checked' : ''} />
            ${I18n.t('fzCompareLabel')}
          </label>
          <div class="fz-card-footer">
            <span class="fz-price">${fmtY(p.precio)}</span>
            ${qty > 0 ? `
              <div class="qty-stepper">
                <button type="button" data-qty-minus="${p.id}">−</button>
                <span>${qty}</span>
                <button type="button" data-qty-plus="${p.id}">+</button>
              </div>
            ` : `<button type="button" class="ghost-btn" data-add="${p.id}">${I18n.t('fzAddToBox')}</button>`}
          </div>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('[data-add]').forEach((btn) => {
    btn.addEventListener('click', () => {
      FzCart.setQty(btn.getAttribute('data-add'), 1);
      onFzCartChange();
    });
  });
  grid.querySelectorAll('[data-qty-plus]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-qty-plus');
      FzCart.setQty(id, FzCart.qty(id) + 1);
      onFzCartChange();
    });
  });
  grid.querySelectorAll('[data-qty-minus]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-qty-minus');
      FzCart.setQty(id, FzCart.qty(id) - 1);
      onFzCartChange();
    });
  });
  grid.querySelectorAll('[data-reheat]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-reheat');
      fzReheatOpen[id] = !fzReheatOpen[id];
      document.getElementById('fz-reheat-' + id).classList.toggle('show', fzReheatOpen[id]);
    });
  });
  grid.querySelectorAll('[data-compare]').forEach((input) => {
    input.addEventListener('change', () => {
      const id = input.getAttribute('data-compare');
      const ok = FzCompare.toggle(id);
      if (!ok) input.checked = false;
      updateCompareBar();
    });
  });
}

function onFzCartChange() {
  renderCatalog();
  updateFzMascot();
  updateFzBoxBar();
  if (document.getElementById('fz-drawer').classList.contains('open')) renderFzDrawer();
}

// ---------------- Comparar ----------------

function updateCompareBar() {
  const bar = document.getElementById('fz-compare-bar');
  if (FzCompare.ids.length >= 2) {
    bar.classList.add('show');
    document.getElementById('fz-compare-bar-label').textContent = FzCompare.ids.length + ' / 3';
  } else {
    bar.classList.remove('show');
  }
}

function openCompareModal() {
  const body = document.getElementById('fz-compare-modal-body');
  const items = FzCompare.ids.map((id) => ENVIOS_INDEX[id]).filter(Boolean);
  const rows = [
    ['fzCompareColServings', (p) => I18n.t('fzServings', p.porciones)],
    ['fzCompareColWeight', (p) => p.peso],
    ['fzCompareColTime', (p) => (p.prepMinutos ? I18n.t('fzPrepTime', p.prepMinutos) : '—')],
    ['fzCompareColPrice', (p) => fmtY(p.precio)],
    ['fzCompareColIdeal', (p) => ei(p.idealPara)],
  ];
  body.innerHTML = `
    <h2>${I18n.t('fzCompareTitle')}</h2>
    <p class="subt">${I18n.t('fzCompareSubtitle')}</p>
    ${items.length < 2 ? `<p class="subt">${I18n.t('fzCompareEmpty')}</p>` : `
      <div style="overflow-x:auto;">
        <table class="fz-compare-table">
          <thead>
            <tr>
              <th>${I18n.t('fzCompareColProduct')}</th>
              ${items.map((p) => `<th>${ei(p.nombre)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.map(([labelKey, getVal]) => `
              <tr>
                <th>${I18n.t(labelKey)}</th>
                ${items.map((p) => `<td>${getVal(p)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}
    <button class="ghost-btn" id="fz-compare-close" style="width:100%; margin-top:14px;">${I18n.t('closeBtn')}</button>
  `;
  document.getElementById('fz-compare-close').addEventListener('click', closeCompareModal);
  document.getElementById('fz-compare-modal').classList.add('open');
}

function closeCompareModal() {
  document.getElementById('fz-compare-modal').classList.remove('open');
}

// ---------------- Barra flotante + drawer "tu caja" ----------------

function updateFzBoxBar() {
  const bar = document.getElementById('fz-box-bar');
  const count = FzCart.count();
  if (count > 0) {
    bar.classList.add('show');
    document.getElementById('fz-box-count').textContent = I18n.t('fzFloatingBarLabel', count);
    document.getElementById('fz-box-amount').textContent = fmtY(fzTotal());
  } else {
    bar.classList.remove('show');
  }
  document.getElementById('fz-box-cta').textContent = I18n.t('fzContinueBtn');
}

function openFzDrawer() {
  renderFzDrawer();
  document.getElementById('fz-drawer-overlay').classList.add('open');
  document.getElementById('fz-drawer').classList.add('open');
}

function closeFzDrawer() {
  document.getElementById('fz-drawer-overlay').classList.remove('open');
  document.getElementById('fz-drawer').classList.remove('open');
}

function renderFzDrawer() {
  document.getElementById('fz-drawer-title').textContent = I18n.t('fzSummaryTitle');
  const body = document.getElementById('fz-drawer-body');
  const items = FzCart.detailedItems();
  if (items.length === 0) {
    body.innerHTML = `<p class="empty-cart">${I18n.t('fzSummaryEmpty')}</p>`;
  } else {
    body.innerHTML = items.map((i) => `
      <div class="fz-cart-row">
        <div class="qty-stepper">
          <button type="button" data-drawer-minus="${i.id}">−</button>
          <span>${i.cantidad}</span>
          <button type="button" data-drawer-plus="${i.id}">+</button>
        </div>
        <div class="name">${i.nombre}</div>
        <div class="subtotal">${fmtY(i.subtotal)}</div>
      </div>
    `).join('');
    body.querySelectorAll('[data-drawer-plus]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-drawer-plus');
        FzCart.setQty(id, FzCart.qty(id) + 1);
        onFzCartChange();
      });
    });
    body.querySelectorAll('[data-drawer-minus]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-drawer-minus');
        FzCart.setQty(id, FzCart.qty(id) - 1);
        onFzCartChange();
      });
    });
  }

  const subtotal = FzCart.subtotal();
  const shipping = fzShippingFee();
  const missing = ENVIOS_CONFIG.freeShippingThreshold - subtotal;
  const progressPct = Math.min(100, Math.round((subtotal / ENVIOS_CONFIG.freeShippingThreshold) * 100));

  document.getElementById('fz-drawer-footer').innerHTML = `
    <p class="fz-progress-note${missing <= 0 && subtotal > 0 ? ' free' : ''}">
      ${subtotal === 0 ? '' : missing > 0 ? I18n.t('fzFreeShippingProgress', fmtY(missing)) : I18n.t('fzFreeShippingUnlocked')}
    </p>
    <div class="fz-progress-track"><div class="fz-progress-fill" style="width:${progressPct}%;"></div></div>
    <div class="fz-totals-row"><span>${I18n.t('fzSubtotalLabel')}</span><span>${fmtY(subtotal)}</span></div>
    <div class="fz-totals-row">
      <span>${I18n.t('fzShippingLabel')}</span>
      <span class="${shipping === 0 ? 'free-tag' : ''}">${shipping === 0 ? I18n.t('fzShippingFree') : fmtY(shipping)}</span>
    </div>
    <div class="fz-totals-row total"><span>${I18n.t('fzTotalLabel')}</span><span>${fmtY(subtotal + shipping)}</span></div>
    <button class="primary-btn" id="fz-drawer-continue" type="button" style="width:100%;" ${items.length === 0 ? 'disabled' : ''}>${I18n.t('fzContinueBtn')}</button>
  `;
  const continueBtn = document.getElementById('fz-drawer-continue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      closeFzDrawer();
      fzCheckoutStep = 1;
      openCheckoutModal();
    });
  }
}

// ---------------- Checkout (pasos) ----------------

function openCheckoutModal() {
  renderCheckoutModal();
  document.getElementById('fz-checkout-modal').classList.add('open');
}

function closeCheckoutModal() {
  document.getElementById('fz-checkout-modal').classList.remove('open');
}

function fzStepsDotsHtml(step) {
  return `<div class="fz-steps-dots">${[1, 2, 3].map((n) => `<span class="${n === step ? 'active' : ''}"></span>`).join('')}</div>`;
}

function renderCheckoutModal() {
  const body = document.getElementById('fz-checkout-modal-body');
  const items = FzCart.detailedItems();
  const subtotal = FzCart.subtotal();
  const shipping = fzShippingFee();

  if (fzCheckoutStep === 1) {
    body.innerHTML = `
      ${fzStepsDotsHtml(1)}
      <h2>${I18n.t('fzStepReviewTitle')}</h2>
      <ul class="fz-review-list">
        ${items.map((i) => `<li><span>${i.cantidad} × ${i.nombre}</span><span>${fmtY(i.subtotal)}</span></li>`).join('')}
      </ul>
      <div class="fz-totals-row"><span>${I18n.t('fzSubtotalLabel')}</span><span>${fmtY(subtotal)}</span></div>
      <div class="fz-totals-row">
        <span>${I18n.t('fzShippingLabel')}</span>
        <span class="${shipping === 0 ? 'free-tag' : ''}">${shipping === 0 ? I18n.t('fzShippingFree') : fmtY(shipping)}</span>
      </div>
      <div class="fz-totals-row total" style="margin-bottom:14px;"><span>${I18n.t('fzTotalLabel')}</span><span>${fmtY(subtotal + shipping)}</span></div>
      <button class="primary-btn" id="fz-step1-next" type="button" style="width:100%; margin-bottom:8px;">${I18n.t('fzContinueBtn')}</button>
      <button class="ghost-btn" id="fz-step1-cancel" type="button" style="width:100%;">${I18n.t('cancelBtn')}</button>
    `;
    document.getElementById('fz-step1-next').addEventListener('click', () => { fzCheckoutStep = 2; renderCheckoutModal(); });
    document.getElementById('fz-step1-cancel').addEventListener('click', closeCheckoutModal);
    return;
  }

  if (fzCheckoutStep === 2) {
    body.innerHTML = `
      ${fzStepsDotsHtml(2)}
      <h2>${I18n.t('fzStepShippingTitle')}</h2>
      <div class="form-error" id="fz-shipping-error"></div>
      <div class="field"><label>${I18n.t('nameLabel')}</label><input type="text" id="fz-in-nombre" value="${fzShippingData.nombre}" /></div>
      <div class="field"><label>${I18n.t('fzPhoneLabel')}</label><input type="tel" id="fz-in-telefono" placeholder="${I18n.t('phonePlaceholder')}" value="${fzShippingData.telefono}" /></div>
      <div class="field"><label>${I18n.t('fzPostalLabel')}</label><input type="text" id="fz-in-postal" placeholder="123-4567" value="${fzShippingData.postal}" /></div>
      <div class="field">
        <label>${I18n.t('fzPrefectureLabel')}</label>
        <select class="fz-select" id="fz-in-prefectura">
          <option value="">—</option>
          ${JP_PREFECTURES.map((p) => `<option value="${p}" ${fzShippingData.prefectura === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>${I18n.t('fzAddressLabel')}</label><textarea id="fz-in-direccion" rows="2">${fzShippingData.direccion}</textarea></div>
      <div class="field"><label>${I18n.t('fzDateLabel')}</label><input type="date" id="fz-in-fecha" value="${fzShippingData.fecha}" /></div>
      <div class="field"><label>${I18n.t('fzNotesLabel')}</label><textarea id="fz-in-notas" rows="2">${fzShippingData.notas}</textarea></div>
      <button class="primary-btn" id="fz-step2-next" type="button" style="width:100%; margin-bottom:8px;">${I18n.t('fzContinueBtn')}</button>
      <button class="ghost-btn" id="fz-step2-back" type="button" style="width:100%;">${I18n.t('backBtn')}</button>
    `;
    document.getElementById('fz-in-fecha').min = fzTodayStr();
    document.getElementById('fz-step2-back').addEventListener('click', () => { fzCheckoutStep = 1; renderCheckoutModal(); });
    document.getElementById('fz-step2-next').addEventListener('click', () => {
      fzShippingData = {
        nombre: document.getElementById('fz-in-nombre').value.trim(),
        telefono: document.getElementById('fz-in-telefono').value.trim(),
        postal: document.getElementById('fz-in-postal').value.trim(),
        prefectura: document.getElementById('fz-in-prefectura').value,
        direccion: document.getElementById('fz-in-direccion').value.trim(),
        fecha: document.getElementById('fz-in-fecha').value,
        notas: document.getElementById('fz-in-notas').value.trim(),
      };
      const errBox = document.getElementById('fz-shipping-error');
      if (!fzShippingData.nombre || !fzShippingData.telefono || !fzShippingData.prefectura || !fzShippingData.direccion) {
        errBox.textContent = I18n.t('fzRequiredFieldsError');
        errBox.classList.add('show');
        return;
      }
      fzCheckoutStep = 3;
      renderCheckoutModal();
    });
    return;
  }

  if (fzCheckoutStep === 3) {
    body.innerHTML = `
      ${fzStepsDotsHtml(3)}
      <h2>${I18n.t('fzStepConfirmTitle')}</h2>
      <ul class="fz-review-list">
        ${items.map((i) => `<li><span>${i.cantidad} × ${i.nombre}</span><span>${fmtY(i.subtotal)}</span></li>`).join('')}
      </ul>
      <div class="fz-totals-row total" style="margin-bottom:14px;"><span>${I18n.t('fzTotalLabel')}</span><span>${fmtY(subtotal + shipping)}</span></div>
      <p class="subt" style="margin:0 0 4px;">
        ${fzShippingData.nombre} · ${fzShippingData.telefono}<br />
        ${fzShippingData.prefectura} ${fzShippingData.direccion}${fzShippingData.postal ? ' (〒' + fzShippingData.postal + ')' : ''}
      </p>
      <div class="fz-notice">
        <strong>${I18n.t('fzPaymentNoticeTitle')}</strong>
        ${I18n.t('fzPaymentNoticeText')}
      </div>
      <button class="primary-btn" id="fz-step3-send" type="button" style="width:100%; margin-bottom:8px;">${I18n.t('fzSendRequestBtn')}</button>
      <button class="ghost-btn" id="fz-step3-back" type="button" style="width:100%;">${I18n.t('backBtn')}</button>
    `;
    document.getElementById('fz-step3-back').addEventListener('click', () => { fzCheckoutStep = 2; renderCheckoutModal(); });
    document.getElementById('fz-step3-send').addEventListener('click', submitFzOrder);
    return;
  }

  // fzCheckoutStep === 4: éxito
  body.innerHTML = `
    <div class="fz-success-icon">✓</div>
    <h2 style="text-align:center;">${I18n.t('fzOrderConfirmedTitle')}</h2>
    <p class="subt" style="text-align:center;">${I18n.t('fzOrderConfirmedText')}</p>
    <p class="subt" style="text-align:center;">${I18n.t('fzOrderNumberLabel')}: <strong>${fzLastOrderId}</strong></p>
    <a class="ghost-btn" id="fz-email-fallback" style="display:block; width:100%; margin-bottom:8px; text-decoration:none; text-align:center;" href="${fzMailtoLink()}">${I18n.t('fzEmailFallbackBtn')}</a>
    <button class="primary-btn" id="fz-back-to-shop" type="button" style="width:100%;">${I18n.t('fzBackToShop')}</button>
  `;
  document.getElementById('fz-back-to-shop').addEventListener('click', closeCheckoutModal);
}

function fzTodayStr() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function fzMailtoLink() {
  const items = FzCart.detailedItems();
  const subtotal = FzCart.subtotal();
  const shipping = fzShippingFee();
  const lines = [
    `${I18n.t('fzOrderNumberLabel')}: ${fzLastOrderId}`,
    '',
    ...items.map((i) => `${i.cantidad} x ${i.nombre} — ${fmtY(i.subtotal)}`),
    '',
    `${I18n.t('fzSubtotalLabel')}: ${fmtY(subtotal)}`,
    `${I18n.t('fzShippingLabel')}: ${shipping === 0 ? I18n.t('fzShippingFree') : fmtY(shipping)}`,
    `${I18n.t('fzTotalLabel')}: ${fmtY(subtotal + shipping)}`,
    '',
    `${fzShippingData.nombre} · ${fzShippingData.telefono}`,
    `〒${fzShippingData.postal} ${fzShippingData.prefectura} ${fzShippingData.direccion}`,
    fzShippingData.fecha ? `${I18n.t('fzDateLabel')}: ${fzShippingData.fecha}` : '',
    fzShippingData.notas ? `${I18n.t('fzNotesLabel')}: ${fzShippingData.notas}` : '',
  ].filter(Boolean);
  const subject = encodeURIComponent('Boogaloo — ' + I18n.t('fzOrderNumberLabel') + ' ' + fzLastOrderId);
  const bodyText = encodeURIComponent(lines.join('\n'));
  return `mailto:${ENVIOS_CONFIG.contactEmail}?subject=${subject}&body=${bodyText}`;
}

// TODO(backend): cuando exista una acción de Apps Script para pedidos de
// envío (ej. apiCall('crearPedidoEnvio', payload)), reemplaza el guardado
// en localStorage + mailto de abajo por esa llamada real.
function submitFzOrder() {
  fzLastOrderId = 'BGL-' + Date.now().toString(36).toUpperCase();
  const order = {
    id: fzLastOrderId,
    fecha: new Date().toISOString(),
    items: FzCart.detailedItems(),
    subtotal: FzCart.subtotal(),
    envio: fzShippingFee(),
    total: fzTotal(),
    envioA: { ...fzShippingData },
  };
  let orders = [];
  try {
    orders = JSON.parse(localStorage.getItem(FZ_ORDERS_KEY) || '[]');
  } catch (e) {
    orders = [];
  }
  orders.push(order);
  localStorage.setItem(FZ_ORDERS_KEY, JSON.stringify(orders));

  FzCart.clear();
  updateFzMascot();
  updateFzBoxBar();
  renderCatalog();

  fzCheckoutStep = 4;
  renderCheckoutModal();
}

// ---------------- FAQ ----------------

function renderFaq() {
  const faqs = [
    ['fzFaqShippingQ', 'fzFaqShippingA'],
    ['fzFaqPaymentQ', 'fzFaqPaymentA'],
    ['fzFaqReheatQ', 'fzFaqReheatA'],
    ['fzFaqStorageQ', 'fzFaqStorageA'],
  ];
  document.getElementById('fz-faq-list').innerHTML = faqs.map(([qKey, aKey]) => `
    <details class="fz-faq-item">
      <summary>${I18n.t(qKey)}</summary>
      <p>${I18n.t(aKey)}</p>
    </details>
  `).join('');
}

// ---------------- Idioma ----------------

function applyStaticI18n() {
  document.getElementById('fz-page-subtitle').textContent = I18n.t('fzBrandSubtitle');
  document.getElementById('fz-footer-text').textContent = I18n.t('footerText');
  document.getElementById('fz-footer-menu-link').textContent = I18n.t('backToMenuBtn');
  document.getElementById('fz-footer-historia-link').textContent = I18n.t('abNavHistoria');
  document.getElementById('fz-footer-copyright').textContent = I18n.t('abCopyright', new Date().getFullYear());

  document.getElementById('fz-hero-title').textContent = I18n.t('fzHeroTitle');
  document.getElementById('fz-hero-subtitle').textContent = I18n.t('fzHeroSubtitle');
  document.getElementById('fz-hero-cta').textContent = I18n.t('fzHeroCta');
  document.getElementById('fz-trust-fresh').textContent = I18n.t('fzTrustFresh');
  document.getElementById('fz-trust-box').textContent = I18n.t('fzTrustBox');
  document.getElementById('fz-trust-courier').textContent = I18n.t('fzTrustCourier');

  document.getElementById('fz-how-title').textContent = I18n.t('fzHowTitle');
  document.getElementById('fz-how1-title').textContent = I18n.t('fzHowStep1Title');
  document.getElementById('fz-how1-text').textContent = I18n.t('fzHowStep1Text');
  document.getElementById('fz-how2-title').textContent = I18n.t('fzHowStep2Title');
  document.getElementById('fz-how2-text').textContent = I18n.t('fzHowStep2Text');
  document.getElementById('fz-how3-title').textContent = I18n.t('fzHowStep3Title');
  document.getElementById('fz-how3-text').textContent = I18n.t('fzHowStep3Text');

  document.getElementById('fz-catalog-title').textContent = I18n.t('fzCatalogTitle');
  document.getElementById('fz-catalog-subtitle').textContent = I18n.t('fzCatalogSubtitle');
  document.getElementById('fz-faq-title').textContent = I18n.t('fzFaqTitle');

  document.getElementById('fz-compare-bar-btn').textContent = I18n.t('fzCompareTitle');

  updateFzMascot();
  renderCatalog();
  renderFaq();
  updateFzBoxBar();
}

function onLangChange() {
  applyStaticI18n();
  if (document.getElementById('fz-drawer').classList.contains('open')) renderFzDrawer();
  if (document.getElementById('fz-checkout-modal').classList.contains('open')) renderCheckoutModal();
  if (document.getElementById('fz-compare-modal').classList.contains('open')) openCompareModal();
}

// ---------------- Init ----------------

renderFzHeader();
renderFzFooter();
renderFzSnow();
applyStaticI18n();

document.getElementById('fz-drawer-close').addEventListener('click', closeFzDrawer);
document.getElementById('fz-drawer-overlay').addEventListener('click', closeFzDrawer);
document.getElementById('fz-box-bar').addEventListener('click', openFzDrawer);
document.getElementById('fz-compare-bar-btn').addEventListener('click', openCompareModal);
document.getElementById('fz-compare-modal').addEventListener('click', (e) => {
  if (e.target.id === 'fz-compare-modal') closeCompareModal();
});
document.getElementById('fz-checkout-modal').addEventListener('click', (e) => {
  if (e.target.id === 'fz-checkout-modal') closeCheckoutModal();
});
