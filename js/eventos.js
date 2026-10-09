/* Página de eventos. Los eventos se reservan en Meetup (grupo "Boogaloo");
   aquí se listan los próximos para que los vea quien llega al sitio. Cuando
   pasa la fecha de un evento, deja de mostrarse solo. Para agregar uno nuevo,
   añade un objeto a EVENTS (o una fecha a una serie) con el enlace de Meetup. */

const MEETUP_URL = 'https://www.meetup.com/meetup-group-htdlitmv/';
const VENUE_MAP = 'https://maps.app.goo.gl/YZKnmjyWFr4daoji8';

const EVENTS = EVENTS_DATA;

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
          (d) => `<li><span>${fmtDate(d.date)}${ev.start ? ' · ' + ev.start + (ev.end ? '–' + ev.end : '') : ''}</span>
            <span class="ev-date-actions">
              ${ev.registration ? `<button class="primary-btn ev-reg-btn" data-reg-event="${ev.id}" data-reg-date="${d.date}" type="button">${I18n.t('evRegisterBtn')}</button>` : ''}
              ${d.url ? `<a class="ghost-btn" href="${d.url}" target="_blank" rel="noopener">${I18n.t('evRsvpBtn')}</a>` : ''}
            </span></li>`
        )
        .join('');
      return `
    <article class="ev-card">
      <div class="ev-badge"><span>${b.month}</span><b>${b.day}</b></div>
      <div class="ev-body">
        <span class="ev-tag">${pick(ev.tag)}</span>
        <h3>${pick(ev.title)}</h3>
        <ul class="ev-dates">${datesHtml}</ul>
        ${ev.desc ? `<p class="ev-desc">${pick(ev.desc)}</p>` : ''}
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

// ---------------- Inscripción ----------------

const evModal = document.getElementById('ev-modal');
const evModalBody = document.getElementById('ev-modal-body');
evModal.addEventListener('click', (e) => {
  if (e.target === evModal) evModal.classList.remove('open');
});

document.getElementById('ev-list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-reg-event]');
  if (btn) openRegistration(btn.dataset.regEvent, btn.dataset.regDate);
});

function openRegistration(eventId, fecha) {
  const ev = EVENTS.find((x) => x.id === eventId);
  if (!ev) return;
  const s = typeof Session !== 'undefined' ? Session.data : null;
  const activityHtml = ev.activities
    ? `<div class="field"><label>${I18n.t('evRegActivity')}</label>
        <select id="ev-r-actividad" class="order-add-select" style="width:100%;">
          ${ev.activities.map((a) => `<option value="${a.value}">${pick(a.label)}</option>`).join('')}
        </select></div>`
    : '';
  evModalBody.innerHTML = `
    <h2>${I18n.t('evRegTitle')}</h2>
    <p class="subt">${pick(ev.title)} · ${fmtDate(fecha)}${ev.start ? ' · ' + ev.start : ''}</p>
    <div class="form-error" id="ev-r-error"></div>
    <div class="field"><label>${I18n.t('nameLabel')}</label><input id="ev-r-nombre" type="text" value="${(s && s.nombre) || ''}" /></div>
    <div class="field"><label>${I18n.t('emailLabel')}</label><input id="ev-r-email" type="email" value="${(s && s.email) || ''}" /></div>
    <div class="field"><label>${I18n.t('phoneOptionalLabel')}</label><input id="ev-r-telefono" type="tel" value="${(s && s.telefono) || ''}" /></div>
    <div class="field"><label>${I18n.t('evRegPeople')}</label><input id="ev-r-personas" type="number" min="1" max="10" value="1" /></div>
    ${activityHtml}
    <div class="field"><label>${I18n.t('evRegNotes')}</label><input id="ev-r-notas" type="text" maxlength="250" /></div>
    <div class="order-summary"><div class="row total"><span>${I18n.t('totalLabel')}</span><span id="ev-r-total"></span></div></div>
    <p class="subt">${I18n.t('evRegPayNote')}</p>
    <button class="primary-btn" id="ev-r-submit" type="button" style="width:100%;">${I18n.t('evRegSubmit')}</button>
    <button class="link-btn" id="ev-r-cancel" type="button" style="width:100%; margin-top:8px;">${I18n.t('cancelBtn')}</button>
  `;
  evModal.classList.add('open');

  const personasInp = document.getElementById('ev-r-personas');
  const totalEl = document.getElementById('ev-r-total');
  const updateTotal = () => {
    const n = Math.min(10, Math.max(1, parseInt(personasInp.value, 10) || 1));
    totalEl.textContent = '¥' + (n * ART_PRICE).toLocaleString('ja-JP');
  };
  personasInp.addEventListener('input', updateTotal);
  updateTotal();
  document.getElementById('ev-r-cancel').onclick = () => evModal.classList.remove('open');

  document.getElementById('ev-r-submit').onclick = async () => {
    const box = document.getElementById('ev-r-error');
    const submit = document.getElementById('ev-r-submit');
    submit.disabled = true;
    try {
      const res = await apiCall('registrarEvento', {
        eventoId: eventId,
        fecha,
        nombre: document.getElementById('ev-r-nombre').value.trim(),
        email: document.getElementById('ev-r-email').value.trim(),
        telefono: document.getElementById('ev-r-telefono').value.trim(),
        personas: parseInt(personasInp.value, 10) || 1,
        actividad: ev.activities ? document.getElementById('ev-r-actividad').value : '',
        notas: document.getElementById('ev-r-notas').value.trim(),
      });
      if (window.Track) Track.event('inscripcion');
      evModalBody.innerHTML = `
        <div class="form-success">
          <div class="check">✓</div>
          <h2>${I18n.t('evRegSuccessTitle')}</h2>
          <p class="subt">${res.inscripcionId}</p>
        </div>
        <div class="order-summary">
          <div class="row"><span>${pick(ev.title)}</span><span>${fmtDate(fecha)}</span></div>
          <div class="row total"><span>${I18n.t('totalLabel')}</span><span>¥${res.total.toLocaleString('ja-JP')}</span></div>
        </div>
        <p class="subt">${I18n.t('evRegPayNote')}</p>
        <button class="primary-btn" id="ev-r-done" type="button" style="width:100%;">${I18n.t('doneBtn')}</button>`;
      document.getElementById('ev-r-done').onclick = () => evModal.classList.remove('open');
    } catch (err) {
      box.textContent = err.message;
      box.classList.add('show');
      submit.disabled = false;
    }
  };
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
