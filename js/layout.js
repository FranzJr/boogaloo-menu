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
    <nav class="staff-subnav" id="staff-subnav" style="display:none;">
      <div class="staff-subnav-inner">
        <span class="staff-subnav-who" id="staff-subnav-who"></span>
        <a href="admin.html" id="staff-link-pedidos"></a>
        <a href="turnos.html" id="staff-link-turnos"></a>
        <a href="about.html" id="staff-link-historia"></a>
        <a href="blog.html" id="staff-link-blog"></a>
      </div>
    </nav>
  `;
  const staff = detectStaffIdentity();
  if (staff) {
    document.getElementById('staff-subnav').style.display = 'block';
    document.getElementById('staff-subnav-who').textContent = staff.nombre;
  }
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
  if (document.getElementById('staff-link-pedidos')) {
    document.getElementById('staff-link-pedidos').textContent = I18n.t('ordersTitle');
    document.getElementById('staff-link-turnos').textContent = I18n.t('hubTurnosBtn');
    document.getElementById('staff-link-historia').textContent = I18n.t('abNavHistoria');
    document.getElementById('staff-link-blog').textContent = I18n.t('blogNavLabel');
  }
  if (document.getElementById('site-footer-text')) {
    document.getElementById('site-footer-text').textContent = I18n.t('footerText');
    document.getElementById('footer-historia-link').textContent = I18n.t('abNavHistoria');
    document.getElementById('footer-blog-link').textContent = I18n.t('blogNavLabel');
    document.getElementById('footer-copyright').textContent = I18n.t('abCopyright', new Date().getFullYear());
  }
}
