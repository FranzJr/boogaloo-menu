/* Página de eventos. Los eventos se reservan en Meetup (grupo "Boogaloo");
   aquí se listan los próximos para que los vea quien llega al sitio. Cuando
   pasa la fecha de un evento, deja de mostrarse solo. Para agregar uno nuevo,
   añade un objeto a EVENTS (o una fecha a una serie) con el enlace de Meetup. */

const MEETUP_URL = 'https://www.meetup.com/meetup-group-htdlitmv/';
const VENUE_MAP = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Boogaloo ニシベビル 101, 2-16 Nakago, Nakagawa Ward, Nagoya, Aichi 454-0921');

const EVENTS = [
  {
    id: 'mateada',
    dates: [{ date: '2026-09-27', url: 'https://www.meetup.com/meetup-group-htdlitmv/events/316607314/' }],
    start: '11:00',
    end: '19:00',
    price: { es: 'Entrada ¥300', en: 'Entrance ¥300', ja: '入場料 ¥300', pt: 'Entrada ¥300' },
    langs: 'JA · ES · EN',
    title: { es: 'MATEADA', en: 'MATEADA', ja: 'MATEADA', pt: 'MATEADA' },
    tag: { es: 'Colombia × Argentina', en: 'Colombia × Argentina', ja: 'コロンビア × アルゼンチン', pt: 'Colômbia × Argentina' },
    desc: {
      es: 'Una celebración cultural Colombia × Argentina con comida, música, baile y buena conversación. Está abierta a todos, sin importar la nacionalidad ni el idioma. Con DJ Rey (Cunumi Fiesta) y la invitada especial Yuuki-san. ¡Come, bebe, baila, conversa y haz amigos!',
      en: 'A Colombia × Argentina cultural celebration with food, music, dancing and good conversation. Everyone is welcome, whatever their nationality or language. With DJ Rey (Cunumi Fiesta) and special guest Yuuki-san. Eat, drink, dance, talk and make friends!',
      ja: 'コロンビア×アルゼンチンの文化交流イベント。食べ物、音楽、ダンス、おしゃべりを楽しみます。国籍や言語を問わず、どなたでも歓迎です。DJ Rey（Cunumi Fiesta）とスペシャルゲストのYuukiさんが登場。食べて、飲んで、踊って、話して、友達を作ろう！',
      pt: 'Uma celebração cultural Colômbia × Argentina com comida, música, dança e boa conversa. Todos são bem-vindos, seja qual for a nacionalidade ou o idioma. Com DJ Rey (Cunumi Fiesta) e a convidada especial Yuuki-san. Coma, beba, dance, converse e faça amigos!',
    },
  },
  {
    id: 'spanish-club',
    dates: [
      { date: '2026-10-03', url: 'https://www.meetup.com/meetup-group-htdlitmv/events/lfhhbvyjcnbfb/' },
      { date: '2026-10-10', url: 'https://www.meetup.com/meetup-group-htdlitmv/events/316632366/' },
      { date: '2026-10-17', url: 'https://www.meetup.com/meetup-group-htdlitmv/events/lfhhbvyjcnbwb/' },
    ],
    start: '13:00',
    end: '15:00',
    price: { es: 'Una bebida como mínimo', en: 'One drink minimum', ja: 'ワンドリンク制', pt: 'Uma bebida no mínimo' },
    langs: '',
    title: {
      es: 'Club de Español ☕ (principiantes bienvenidos)',
      en: 'Spanish Club ☕ (beginners welcome)',
      ja: 'スペイン語クラブ ☕ Club de Español（初心者歓迎）',
      pt: 'Clube de Espanhol ☕ (iniciantes bem-vindos)',
    },
    tag: { es: 'Todos los sábados', en: 'Every Saturday', ja: '毎週土曜日', pt: 'Todos os sábados' },
    desc: {
      es: 'Dos horas de conversación informal en español con hablantes nativos, para todos los niveles. Hay una mesa para principiantes (saludos y presentaciones) y una mesa de conversación libre. Practica el idioma con café colombiano.',
      en: 'Two hours of casual Spanish conversation with native speakers, for all levels. There is a beginners’ table (greetings and introductions) and a free-conversation table. Practice the language over Colombian coffee.',
      ja: 'ネイティブスピーカーと楽しむ2時間のスペイン語会話。全レベル歓迎です。初心者テーブル（あいさつ・自己紹介）とフリートークのテーブルがあります。コロンビアコーヒーを飲みながら気軽に練習しましょう。',
      pt: 'Duas horas de conversa informal em espanhol com falantes nativos, para todos os níveis. Há uma mesa para iniciantes (cumprimentos e apresentações) e uma mesa de conversa livre. Pratique o idioma tomando café colombiano.',
    },
  },
];

const LOCALES = { es: 'es', en: 'en-US', ja: 'ja-JP', pt: 'pt-BR' };

function pick(field) {
  return field ? field[I18n.lang] || field.es : '';
}

function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(LOCALES[I18n.lang] || 'es', { weekday: 'long', month: 'long', day: 'numeric' });
}

function badgeParts(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return { month: dt.toLocaleDateString(LOCALES[I18n.lang] || 'es', { month: 'short' }), day: d };
}

// Solo fechas que aún no terminaron (hora de Japón).
function upcomingDates(ev) {
  const now = Date.now();
  return ev.dates.filter((d) => new Date(`${d.date}T${ev.end}:00+09:00`).getTime() > now);
}

function renderEvents() {
  const cards = EVENTS.map((ev) => ({ ev, dates: upcomingDates(ev) }))
    .filter((x) => x.dates.length)
    .sort((a, b) => (a.dates[0].date < b.dates[0].date ? -1 : 1));

  document.getElementById('ev-empty').style.display = cards.length ? 'none' : 'block';
  document.getElementById('ev-list').innerHTML = cards
    .map(({ ev, dates }) => {
      const b = badgeParts(dates[0].date);
      const datesHtml = dates
        .map(
          (d) => `<li><span>${fmtDate(d.date)} · ${ev.start}–${ev.end}</span>
            <a class="ghost-btn" href="${d.url}" target="_blank" rel="noopener">${I18n.t('evRsvpBtn')}</a></li>`
        )
        .join('');
      return `
    <article class="ev-card">
      <div class="ev-badge"><span>${b.month}</span><b>${b.day}</b></div>
      <div class="ev-body">
        <span class="ev-tag">${pick(ev.tag)}</span>
        <h3>${pick(ev.title)}</h3>
        <ul class="ev-dates">${datesHtml}</ul>
        <p class="ev-desc">${pick(ev.desc)}</p>
        <div class="ev-meta">
          <span>📍 <a href="${VENUE_MAP}" target="_blank" rel="noopener">${I18n.t('evVenue')}</a></span>
          <span>💴 ${pick(ev.price)}</span>
          ${ev.langs ? `<span>🗣 ${ev.langs}</span>` : ''}
        </div>
      </div>
    </article>`;
    })
    .join('');
}

function applyStaticI18n() {
  applyLayoutI18n();
  document.getElementById('page-subtitle').textContent = I18n.t('evNavLabel');
  document.getElementById('ev-hero-title').textContent = I18n.t('evNavLabel');
  document.getElementById('ev-hero-sub').textContent = I18n.t('evHeroSub');
  document.getElementById('ev-meetup-cta').textContent = I18n.t('evMeetupCta');
  document.getElementById('ev-upcoming-title').textContent = I18n.t('evUpcoming');
  document.getElementById('ev-empty').textContent = I18n.t('evNone');
  renderEvents();
}

function onLangChange() {
  applyStaticI18n();
}

renderSiteHeader(`
  <span id="lang-select-slot"></span>
  <a class="cart-btn" href="index.html" id="ev-menu-link" style="text-decoration:none;"></a>
`);
renderSiteFooter();
renderLangSelect(document.getElementById('lang-select-slot'));
applyStaticI18n();
document.getElementById('ev-menu-link').textContent = I18n.t('abVerMenuBtn');
