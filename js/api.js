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
  if (!data.ok) throw new Error(data.error || 'Ocurrió un error');
  return data;
}
