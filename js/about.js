/* Página "Nuestra historia": contenido estático traducido + animaciones de
   scroll (reveal por sección). Progressive enhancement: si JS no corre, todo
   el contenido queda visible desde el inicio (ver css: body.js-ready). */

document.body.classList.add('js-ready');

// ---------------- Reveal al hacer scroll ----------------

const revealTargets = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ab-visible');
          observer.unobserve(entry.target);
          if (entry.target.classList.contains('ab-stats')) animateStats();
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => observer.observe(el));
} else {
  // Sin soporte: muestra todo de una vez, sin animar los números.
  revealTargets.forEach((el) => el.classList.add('ab-visible'));
}

// Cuenta hacia arriba los dos números que sí se sienten como una métrica
// (4.8★ y 100%); el año (2026) no se anima, contar hasta un año se ve raro.
// Respeta prefers-reduced-motion: si el usuario lo pide, muestra el valor final directo.
function animateStats() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ['ab-stat2-value', 'ab-stat3-value'].forEach((id) => {
    const el = document.getElementById(id);
    const match = el.textContent.match(/^([\d.]+)/);
    if (!match) return;
    const target = parseFloat(match[1]);
    const decimals = match[1].includes('.') ? 1 : 0;
    const suffix = el.textContent.slice(match[1].length);
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ---------------- Platos destacados (reusa menu-data.js) ----------------

function renderPlatos() {
  document.querySelectorAll('.ab-plato-card [data-sku]').forEach((el) => {
    const item = MENU_INDEX[el.dataset.sku];
    if (item) el.textContent = mi(item.nombre);
  });
}

// ---------------- Idioma ----------------

function applyStaticI18n() {
  applyLayoutI18n();
  document.getElementById('page-subtitle').textContent = I18n.t('abNavHistoria');
  document.getElementById('ab-menu-link').textContent = I18n.t('abVerMenuBtn');
  document.getElementById('ab-reserve-link').textContent = I18n.t('gateReserveBtn');
  document.getElementById('ab-hero-title').textContent = I18n.t('abHeroTitle');
  document.getElementById('ab-hero-subtitle').textContent = I18n.t('abHeroSubtitle');
  document.getElementById('ab-proof-caption').textContent = I18n.t('abProofCaption');
  document.getElementById('ab-historia-title').textContent = I18n.t('abHistoriaTitle');
  document.getElementById('ab-historia-p1').textContent = I18n.t('abHistoriaP1');
  document.getElementById('ab-historia-p2').textContent = I18n.t('abHistoriaP2');
  document.getElementById('ab-historia-p3').textContent = I18n.t('abHistoriaP3');
  document.getElementById('ab-nombre-title').textContent = I18n.t('abNombreTitle');
  document.getElementById('ab-nombre-text').textContent = I18n.t('abNombreText');
  document.getElementById('ab-arte-title').textContent = I18n.t('abArteTitle');
  document.getElementById('ab-arte-text').textContent = I18n.t('abArteText');
  document.getElementById('ab-stat1-value').textContent = I18n.t('abStat1Value');
  document.getElementById('ab-stat1-label').textContent = I18n.t('abStat1Label');
  document.getElementById('ab-stat2-value').textContent = I18n.t('abStat2Value');
  document.getElementById('ab-stat2-label').textContent = I18n.t('abStat2Label');
  document.getElementById('ab-stat3-value').textContent = I18n.t('abStat3Value');
  document.getElementById('ab-stat3-label').textContent = I18n.t('abStat3Label');
  document.getElementById('ab-platos-title').textContent = I18n.t('abPlatosTitle');
  document.getElementById('ab-plato-costilla').textContent = I18n.lang === 'en' ? 'Beef Rib Arepa' : I18n.lang === 'ja' ? '牛カルビのアレパ' : I18n.lang === 'pt' ? 'Arepa de Costela' : 'Arepa de Costilla';
  document.getElementById('ab-resenas-title').textContent = I18n.t('abResenasTitle');
  document.getElementById('ab-resena1').textContent = I18n.t('abResena1');
  document.getElementById('ab-resena1-autor').textContent = I18n.t('abResena1Autor');
  document.getElementById('ab-resena2').textContent = I18n.t('abResena2');
  document.getElementById('ab-resena2-autor').textContent = I18n.t('abResena2Autor');
  document.getElementById('ab-resena3').textContent = I18n.t('abResena3');
  document.getElementById('ab-resena3-autor').textContent = I18n.t('abResena3Autor');
  document.getElementById('ab-cta-title').textContent = I18n.t('abCtaTitle');
  document.getElementById('ab-cta-subtitle').textContent = I18n.t('abCtaSubtitle');
  document.getElementById('ab-cta-menu-btn').textContent = I18n.t('abVerMenuBtn');
  document.getElementById('ab-cta-reserve-btn').textContent = I18n.t('gateReserveBtn');
  renderPlatos();
}

function onLangChange() {
  applyStaticI18n();
}

renderSiteHeader(`
  <span id="lang-select-slot"></span>
  <a class="cart-btn" href="index.html" id="ab-menu-link" style="text-decoration:none;"></a>
  <a class="cart-btn" href="reserva.html" id="ab-reserve-link" style="text-decoration:none;"></a>
`);
renderSiteFooter();
renderLangSelect(document.getElementById('lang-select-slot'));

applyStaticI18n();
