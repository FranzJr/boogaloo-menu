/* Página de enlaces para la biografía de Instagram (boogaloo.cafe/links/).
   Pensada para celular: una columna de botones grandes y el oso de Boogaloo
   "hablando" con una burbuja que escribe sola un mensaje distinto cada pocos
   segundos. GOOGLE_MAPS_URL y UBER_EATS_URL salen de js/layout.js (una sola
   fuente para todo el sitio). */

const MEETUP_URL = 'https://www.meetup.com/meetup-group-htdlitmv/';
const LK_SHIP_KEY = 'boogaloo_ship_banner_v1';

const LK_LINKS = [
  { id: 'uber', emoji: '🛵', key: 'lkUber', href: UBER_EATS_URL, ext: true, primary: true },
  { id: 'chat', emoji: '💬', key: 'lkChat', href: '#lk-chat' },
  { id: 'menu', emoji: '🍽️', key: 'lkMenu', href: '../index.html' },
  { id: 'maps', emoji: '📍', key: 'lkMaps', href: GOOGLE_MAPS_URL, ext: true },
  { id: 'reserva', emoji: '📅', key: 'lkReserve', href: '../reserva.html' },
  { id: 'eventos', emoji: '🎉', key: 'lkEvents', href: '../eventos.html' },
  { id: 'envios', emoji: '❄️', key: 'lkShipping', href: '../envios/index.html', shipOnly: true },
  { id: 'blog', emoji: '📖', key: 'lkBlog', href: '../blog.html' },
  { id: 'historia', emoji: '🇨🇴', key: 'lkStory', href: '../about.html' },
  { id: 'trabajos', emoji: '💼', key: 'lkJobs', href: '../trabajos.html' },
  { id: 'meetup', emoji: '🤝', key: 'lkMeetup', href: MEETUP_URL, ext: true },
];

let showShipping = true;
try {
  showShipping = localStorage.getItem(LK_SHIP_KEY) !== 'false';
} catch (e) {}

function renderLinks() {
  document.getElementById('lk-links').innerHTML = LK_LINKS.filter((l) => !l.shipOnly || showShipping)
    .map(
      (l) => `
    <a class="lk-btn${l.primary ? ' lk-btn-primary' : ''}" href="${l.href.replace(/&/g, '&amp;')}" data-lk="${l.id}"${l.ext ? ' target="_blank" rel="noopener"' : ''}>
      <span class="lk-emoji" aria-hidden="true">${l.emoji}</span><span>${I18n.t(l.key)}</span>
    </a>`
    )
    .join('');
}

document.getElementById('lk-links').addEventListener('click', (e) => {
  const a = e.target.closest('[data-lk]');
  if (!a) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'boogaloo_link_click', link: a.dataset.lk });
  if (a.dataset.lk === 'chat') {
    e.preventDefault();
    document.getElementById('lk-chat').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    const input = document.getElementById('bc-input');
    if (input) setTimeout(() => input.focus({ preventScroll: true }), 350);
  }
});

// ---------------- El oso habla ----------------

const LK_PHRASES = ['lkBubble1', 'lkBubble2', 'lkBubble3', 'lkBubble4'];
let lkIndex = 0;
let lkTyping = null;
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function say(text) {
  const bubble = document.getElementById('lk-bubble');
  const bear = document.getElementById('lk-bear-img');
  clearInterval(lkTyping);
  if (reducedMotion) {
    bubble.textContent = text;
    return;
  }
  const chars = Array.from(text); // por caracteres reales, para no partir un emoji a la mitad
  let i = 0;
  bubble.textContent = '';
  bear.classList.add('talking');
  lkTyping = setInterval(() => {
    i++;
    bubble.textContent = chars.slice(0, i).join('');
    if (i >= chars.length) {
      clearInterval(lkTyping);
      bear.classList.remove('talking');
    }
  }, 38);
}

function nextPhrase() {
  say(I18n.t(LK_PHRASES[lkIndex % LK_PHRASES.length]));
  lkIndex++;
}

function applyStaticI18n() {
  document.getElementById('lk-sub').textContent = I18n.t('lkSub');
  renderLinks();
}

function onLangChange() {
  applyStaticI18n();
  if (window.refreshBearChatLang) window.refreshBearChatLang();
  lkIndex = Math.max(0, lkIndex - 1);
  nextPhrase();
}

renderLangSelect(document.getElementById('lk-lang-slot'));
applyStaticI18n();
// El oso responde con la información de la página, publicada en un meta tag.
window.bearKnowledgeReady = initBearKnowledge();
mountBearChat('lk-chat');
nextPhrase();
if (!reducedMotion) setInterval(nextPhrase, 5200);

// El enlace de envíos sigue el mismo interruptor que el aviso del home (admin).
apiCall('obtenerConfig', {})
  .then((res) => {
    showShipping = !!res.config.shipBanner;
    try {
      localStorage.setItem(LK_SHIP_KEY, String(showShipping));
    } catch (e) {}
    renderLinks();
  })
  .catch(() => {});
