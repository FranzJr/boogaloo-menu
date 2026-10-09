/* Header y footer estándar, reutilizados en todas las páginas del sitio.
   Cada página monta esto en <div id="site-header-mount"></div> /
   <div id="site-footer-mount"></div>, llama renderSiteHeader()/renderSiteFooter()
   antes de aplicar su propio i18n, y llama applyLayoutI18n() dentro de su
   applyStaticI18n() para traducir las partes compartidas (menú de staff, footer). */

const STAFF_ADMIN_SESSION_KEY = 'boogaloo_admin_session_v1';

// Detecta si hay una sesión de staff activa en este navegador: admin (localStorage)
// o colaborador (Session, si session.js está cargado en la página).
function detectStaffIdentity() {
  try {
    const admin = JSON.parse(localStorage.getItem(STAFF_ADMIN_SESSION_KEY) || 'null');
    if (admin && admin.token) return { esAdmin: true, nombre: admin.usuario };
  } catch (e) {
    // ignora
  }
  try {
    if (typeof Session !== 'undefined' && Session.isColaborador()) {
      return { esAdmin: false, nombre: Session.data.nombre };
    }
  } catch (e) {
    // ignora
  }
  return null;
}

// actionsHtml: HTML de los botones específicos de cada página (cuenta, carrito,
// volver, etc.) — cada página sigue manejando sus propios ids y lógica.
// afterHtml: contenido extra dentro de <header> después de header-inner (ej. el
// nav de categorías del menú).
// ---------------- Menú único del sitio (3 niveles) ----------------
// Un solo componente para todas las pantallas. Según quién esté identificado se
// apilan hasta tres filas:
//   1. Invitado: lo ve todo el mundo (historia, blog, eventos, Maps, Uber Eats).
//   2. Colaborador: lo ve el colaborador y también el admin (pedidos, turnos...).
//   3. Admin: solo lo ve el admin (analítica, colaboradores y tarifas, configuración).
const GOOGLE_MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Boogaloo Colombian Café & Restaurant, 2-16 Nakago, Nakagawa Ward, Nagoya');
const UBER_EATS_URL = 'https://www.ubereats.com/jp/store/boogaloo/wVHPVVMsXsCw1K6icgtndw?diningMode=DELIVERY&surfaceName=';

const NAV_GUEST = [
  { id: 'historia', href: 'about.html', key: 'abNavHistoria' },
  { id: 'blog', href: 'blog.html', key: 'blogNavLabel' },
  { id: 'eventos', href: 'eventos.html', key: 'evNavLabel' },
  { id: 'maps', href: GOOGLE_MAPS_URL, ext: true, text: 'Google Maps' },
  { id: 'uber', href: UBER_EATS_URL, ext: true, key: 'pubNavUber' },
];
const NAV_STAFF = [
  { id: 'pedidos', href: 'admin.html#pedidos', key: 'ordersTitle' },
  { id: 'turnos', href: 'turnos.html', key: 'hubTurnosBtn' },
  { id: 'reservas', href: 'admin.html#reservas', key: 'hubReservasBtn' },
  { id: 'menu', href: 'admin.html#menu', key: 'menuAdminTitle' },
  { id: 'inventario', href: 'admin.html#inventario', key: 'hubInventarioBtn' },
  { id: 'inscripciones', href: 'admin.html#eventos', key: 'navInscripciones' },
  { id: 'nomina', href: 'nomina.html', key: 'hubNominaBtn' },
];
const NAV_ADMIN = [
  { id: 'analitica', href: 'admin.html#analitica', key: 'anHubBtn' },
  { id: 'colaboradores', href: 'turnos.html', key: 'navColabsRates' },
  { id: 'config', href: 'admin.html#config', key: 'navSiteConfig' },
];

function navLinkHtml(it, prefix) {
  const href = (it.ext ? it.href : prefix + it.href).replace(/&/g, '&amp;');
  return `<a href="${href}" data-nav-id="${it.id}"${it.key ? ` data-nav-key="${it.key}"` : ''}${it.ext ? ' target="_blank" rel="noopener"' : ''}>${it.text || ''}</a>`;
}

// prefix: ruta hacia la raíz del sitio ('' en la raíz, '../' en /envios/).
function siteNavHtml(prefix) {
  const staff = detectStaffIdentity();
  let html = `<nav class="public-nav" aria-label="Boogaloo"><div class="staff-subnav-inner">${NAV_GUEST.map((it) => navLinkHtml(it, prefix)).join('')}</div></nav>`;
  if (staff) {
    html += `<nav class="staff-subnav" aria-label="Staff"><div class="staff-subnav-inner">
      <span class="staff-subnav-who">${String(staff.nombre || '').replace(/</g, '&lt;')}</span>
      ${NAV_STAFF.map((it) => navLinkHtml(it, prefix)).join('')}
      <a href="#" data-nav-logout data-nav-key="logoutBtn" class="staff-subnav-logout"></a>
    </div></nav>`;
  }
  if (staff && staff.esAdmin) {
    html += `<nav class="staff-subnav admin-subnav" aria-label="Admin"><div class="staff-subnav-inner">
      <span class="staff-subnav-who">Admin</span>
      ${NAV_ADMIN.map((it) => navLinkHtml(it, prefix)).join('')}
    </div></nav>`;
  }
  return html;
}

// Marca como activo el enlace de la página (y sección de admin) actual.
function markActiveNav() {
  const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('[data-nav-id]').forEach((a) => {
    if (a.target === '_blank') return;
    const [f, h] = a.getAttribute('href').split('#');
    const hrefFile = (f.split('/').pop() || 'index.html').toLowerCase();
    const active = hrefFile === file && (h ? location.hash === '#' + h : !location.hash);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function logoutStaff() {
  try {
    localStorage.removeItem(STAFF_ADMIN_SESSION_KEY);
    if (typeof Session !== 'undefined') Session.clear();
  } catch (e) {
    // ignora
  }
  location.reload();
}

// Pinta (o repinta, por ejemplo después de iniciar o cerrar sesión) el menú en mountId.
function mountSiteNav(mountId, prefix) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  mount.innerHTML = siteNavHtml(prefix || '');
  mount.onclick = (e) => {
    if (e.target.closest('[data-nav-logout]')) {
      e.preventDefault();
      logoutStaff();
    }
  };
  applyLayoutI18n();
  markActiveNav();
}
window.addEventListener('hashchange', markActiveNav);

function renderSiteHeader(actionsHtml, afterHtml) {
  const mount = document.getElementById('site-header-mount');
  if (!mount) return;
  mount.innerHTML = `
    <div class="flag-stripe"></div>
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="index.html" style="text-decoration:none; color:inherit;">
          <picture>
            <source media="(max-width: 640px)" srcset="img/logo/logo-mobile.png" />
            <img class="brand-logo" src="img/logo/logo-web.png" alt="Boogaloo" />
          </picture>
          <div class="brand-text">
            <h1 class="sr-only">Boogaloo</h1>
            <p id="page-subtitle"></p>
          </div>
        </a>
        <div class="header-actions">${actionsHtml || ''}</div>
      </div>
      ${afterHtml || ''}
    </header>
    <div id="site-nav-mount"></div>
  `;
  mountSiteNav('site-nav-mount', '');
}

function renderSiteFooter(extraLinksHtml) {
  const mount = document.getElementById('site-footer-mount');
  if (!mount) return;
  mount.innerHTML = `
    <footer class="site-footer">
      <div class="site-footer-inner">
        <span id="site-footer-text"></span>
        <nav class="footer-links">
          <a href="about.html" id="footer-historia-link"></a>
          <a href="blog.html" id="footer-blog-link"></a>
          <a href="eventos.html" id="footer-eventos-link"></a>
          <a href="envios/index.html" id="footer-envios-link"></a>
          <a href="https://instagram.com/boogaloo.jp" target="_blank" rel="noopener">Instagram</a>
          ${extraLinksHtml || ''}
        </nav>
        <span class="footer-copyright" id="footer-copyright"></span>
      </div>
    </footer>
  `;
}

// Traduce las partes compartidas (menú de staff + footer). Cada página llama
// esto dentro de su propio applyStaticI18n(), después de renderSiteHeader/Footer.
function applyLayoutI18n() {
  document.querySelectorAll('[data-nav-key]').forEach((a) => {
    a.textContent = I18n.t(a.dataset.navKey);
  });
  if (document.getElementById('site-footer-text')) {
    document.getElementById('site-footer-text').textContent = I18n.t('footerText');
    document.getElementById('footer-historia-link').textContent = I18n.t('abNavHistoria');
    document.getElementById('footer-blog-link').textContent = I18n.t('blogNavLabel');
    document.getElementById('footer-eventos-link').textContent = I18n.t('evNavLabel');
    document.getElementById('footer-envios-link').textContent = I18n.t('footerEnviosLink');
    document.getElementById('footer-copyright').textContent = I18n.t('abCopyright', new Date().getFullYear());
  }
}
