/* Cliente ligero para hablar con el Apps Script Web App.
   Usamos Content-Type "text/plain" a propósito: evita el preflight CORS
   que Apps Script no maneja bien, y en el servidor igual se parsea como JSON. */

async function apiCall(action, payload = {}) {
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.indexOf('PEGA_AQUI') !== -1) {
    throw new Error(
      'Falta configurar APPS_SCRIPT_URL en js/config.js. Despliega el Apps Script y pega la URL ahí.'
    );
  }
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error('Error de red: ' + res.status);
  const data = await res.json();
  if (!data.ok) {
    const err = new Error(translateApiError(data));
    err.codigo = data.codigo || null;
    throw err;
  }
  return data;
}

// El backend siempre manda 'error' en español; cuando además manda un 'codigo'
// conocido, lo traducimos al idioma activo. Si no hay traducción, cae al texto
// en español que mandó el servidor (mismo comportamiento de siempre).
function translateApiError(data) {
  if (data && data.codigo && typeof I18n !== 'undefined' && typeof STRINGS !== 'undefined') {
    const key = 'err' + data.codigo.charAt(0).toUpperCase() + data.codigo.slice(1);
    if (STRINGS.es[key] !== undefined) {
      return I18n.t(key, data.horaInicio, data.horaFin);
    }
  }
  return (data && data.error) || 'Ocurrió un error';
}
