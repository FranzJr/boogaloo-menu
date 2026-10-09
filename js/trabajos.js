/* Ofertas de trabajo. Las ofertas viven en la hoja "Trabajos" del spreadsheet
   (acción pública listarTrabajos): agregar, editar u ocultar una oferta se hace
   directo en la hoja, sin tocar código. Las postulaciones llegan a la hoja
   "Postulaciones". */

function pick(field) {
  return field ? field[I18n.lang] || field.es || '' : '';
}
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

let trabajos = null; // null = cargando

function renderJobs() {
  const list = document.getElementById('jb-list');
  const empty = document.getElementById('jb-empty');
  if (trabajos === null) {
    list.innerHTML = `<p class="ev-empty">${I18n.t('loadingText')}</p>`;
    empty.style.display = 'none';
    return;
  }
  empty.style.display = trabajos.length ? 'none' : 'block';
  list.innerHTML = trabajos
    .map(
      (t) => `
    <article class="ev-card job-card">
      <div class="ev-badge job-badge">💼</div>
      <div class="ev-body">
        <h3>${esc(pick(t.titulo))}</h3>
        <ul class="ev-dates"><li><span>🕒 ${I18n.t('jobsScheduleLabel')}: ${esc(pick(t.horario))}</span></li>
          ${t.pago ? `<li><span>💴 ${I18n.t('jobsPayLabel')}: ${esc(t.pago)}</span></li>` : ''}</ul>
        <p class="ev-desc">${esc(pick(t.descripcion))}</p>
        <button class="primary-btn" data-apply="${esc(t.id)}" type="button" style="width:auto; padding:10px 20px;">${I18n.t('jobsApplyBtn')}</button>
      </div>
    </article>`
    )
    .join('');
}

async function loadJobs() {
  try {
    const res = await apiCall('listarTrabajos', {});
    trabajos = res.trabajos || [];
  } catch (err) {
    trabajos = [];
  }
  renderJobs();
}

// ---------------- Postulación ----------------

const jbModal = document.getElementById('jb-modal');
const jbModalBody = document.getElementById('jb-modal-body');
jbModal.addEventListener('click', (e) => {
  if (e.target === jbModal) jbModal.classList.remove('open');
});

document.getElementById('jb-list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-apply]');
  if (btn) openApply(btn.dataset.apply);
});

function openApply(jobId) {
  const job = trabajos.find((t) => t.id === jobId);
  if (!job) return;
  const s = typeof Session !== 'undefined' ? Session.data : null;
  jbModalBody.innerHTML = `
    <h2>${I18n.t('jobsFormTitle')}</h2>
    <p class="subt">${esc(pick(job.titulo))}</p>
    <div class="form-error" id="jb-error"></div>
    <div class="field"><label>${I18n.t('nameLabel')}</label><input id="jb-nombre" type="text" value="${esc((s && s.nombre) || '')}" /></div>
    <div class="field"><label>${I18n.t('emailLabel')}</label><input id="jb-email" type="email" value="${esc((s && s.email) || '')}" /></div>
    <div class="field"><label>${I18n.t('phoneOptionalLabel')}</label><input id="jb-telefono" type="tel" value="${esc((s && s.telefono) || '')}" /></div>
    <p class="subt">${I18n.t('jobsFormContactNote')}</p>
    <div class="field"><label>${I18n.t('jobsFormMessage')}</label><textarea id="jb-mensaje" rows="4" maxlength="600" style="width:100%; padding:10px; border-radius:10px; border:1px solid var(--border); font:inherit;"></textarea></div>
    <button class="primary-btn" id="jb-submit" type="button" style="width:100%;">${I18n.t('jobsApplyBtn')}</button>
    <button class="link-btn" id="jb-cancel" type="button" style="width:100%; margin-top:8px;">${I18n.t('cancelBtn')}</button>
  `;
  jbModal.classList.add('open');
  document.getElementById('jb-cancel').onclick = () => jbModal.classList.remove('open');
  document.getElementById('jb-submit').onclick = async () => {
    const box = document.getElementById('jb-error');
    const submit = document.getElementById('jb-submit');
    submit.disabled = true;
    try {
      await apiCall('postularTrabajo', {
        trabajoId: jobId,
        nombre: document.getElementById('jb-nombre').value.trim(),
        email: document.getElementById('jb-email').value.trim(),
        telefono: document.getElementById('jb-telefono').value.trim(),
        mensaje: document.getElementById('jb-mensaje').value.trim(),
      });
      jbModalBody.innerHTML = `
        <div class="form-success">
          <div class="check">✓</div>
          <h2>${I18n.t('jobsSuccessTitle')}</h2>
          <p class="subt">${I18n.t('jobsSuccessSub')}</p>
        </div>
        <button class="primary-btn" id="jb-done" type="button" style="width:100%;">${I18n.t('doneBtn')}</button>`;
      document.getElementById('jb-done').onclick = () => jbModal.classList.remove('open');
    } catch (err) {
      box.textContent = err.message;
      box.classList.add('show');
      submit.disabled = false;
    }
  };
}

function applyStaticI18n() {
  applyLayoutI18n();
  document.getElementById('page-subtitle').textContent = I18n.t('jobsNavLabel');
  document.getElementById('jb-hero-title').textContent = I18n.t('jobsNavLabel');
  document.getElementById('jb-hero-sub').textContent = I18n.t('jobsHeroSub');
  document.getElementById('jb-empty').textContent = I18n.t('jobsNone');
  renderJobs();
}

function onLangChange() {
  applyStaticI18n();
}

renderSiteHeader(`
  <span id="lang-select-slot"></span>
  <a class="cart-btn" href="index.html" id="jb-menu-link" style="text-decoration:none;"></a>
`);
renderSiteFooter();
renderLangSelect(document.getElementById('lang-select-slot'));
applyStaticI18n();
document.getElementById('jb-menu-link').textContent = I18n.t('abVerMenuBtn');
loadJobs();
