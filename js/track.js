/* Rastreo anónimo de visitas para el panel de Analítica (admin).
   - Un ID aleatorio por navegador (localStorage) y otro por sesión
     (sessionStorage): no hay IP, nombre ni correo.
   - Se salta a quien tenga sesión de staff y a quien active "No rastrear".
   - Cada página pública envía una visita ("pv"), un latido cada 45 s para
     saber quién está en línea, y eventos de negocio (cart, order,
     inscripcion) que llama el resto del sitio con Track.event(). */
(function () {
  const VID_KEY = 'boogaloo_vid_v1';
  const SID_KEY = 'boogaloo_sid_v1';

  function esStaff() {
    try {
      const admin = JSON.parse(localStorage.getItem('boogaloo_admin_session_v1') || 'null');
      if (admin && admin.token) return true;
      if (typeof Session !== 'undefined' && Session.isColaborador && Session.isColaborador()) return true;
    } catch (e) {}
    return false;
  }

  window.Track = { event() {} };
  if (navigator.doNotTrack === '1' || esStaff()) return;
  if (typeof APPS_SCRIPT_URL === 'undefined' || APPS_SCRIPT_URL.indexOf('PEGA_AQUI') !== -1) return;

  function rid() {
    const a = new Uint8Array(8);
    (window.crypto || window.msCrypto).getRandomValues(a);
    return Array.from(a, (b) => b.toString(16).padStart(2, '0')).join('');
  }

  let vid, sid, nuevo = false;
  try {
    vid = localStorage.getItem(VID_KEY);
    if (!vid) { vid = rid(); localStorage.setItem(VID_KEY, vid); nuevo = true; }
    sid = sessionStorage.getItem(SID_KEY);
    if (!sid) { sid = rid(); sessionStorage.setItem(SID_KEY, sid); }
  } catch (e) {
    return; // sin almacenamiento no hay forma de identificar la visita
  }

  const path = location.pathname.toLowerCase();
  const pagina = path.indexOf('/envios') !== -1 ? 'envios'
    : /about/.test(path) ? 'historia'
    : /blog/.test(path) ? 'blog'
    : /eventos/.test(path) ? 'eventos'
    : /reserva/.test(path) ? 'reserva'
    : 'menu';
  const w = window.innerWidth;
  const dispositivo = w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';

  function origen() {
    try {
      const ref = document.referrer ? new URL(document.referrer).hostname : '';
      if (!ref || ref === location.hostname) return 'directo';
      if (/instagram/.test(ref)) return 'instagram';
      if (/google/.test(ref)) return 'google';
      if (/facebook|fb\./.test(ref)) return 'facebook';
      if (/(^|\.)t\.co$|twitter|x\.com/.test(ref)) return 'x';
      if (/line\.me|line\./.test(ref)) return 'line';
      if (/ubereats/.test(ref)) return 'ubereats';
      if (/meetup/.test(ref)) return 'meetup';
      return 'otro';
    } catch (e) {
      return 'directo';
    }
  }

  function send(evento) {
    const idioma = (typeof I18n !== 'undefined' && I18n.lang) || (navigator.language || 'es').slice(0, 2);
    try {
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'registrarVisita', vid, sid, evento, pagina, dispositivo, idioma,
          origen: origen(), nuevo,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch (e) {}
  }

  window.Track = {
    event(nombre) {
      send(nombre);
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'boogaloo_' + nombre, page: pagina });
    },
  };

  send('pv');
  setInterval(() => {
    if (document.visibilityState === 'visible') send('latido');
  }, 45000);
})();
