/* Pega aquí la URL de tu implementación de Apps Script (termina en /exec)
   después de "Implementar > Nueva implementación > Aplicación web". */
const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzF5m-teqH7ofAYbQy4U9dUYxPBlSgtx-quzpxEirX1KFMDDLYEhgVJz_vfMBfzfRe4/exec';

/* Datos del emisor que salen por defecto en recibos y facturas (se pueden
   editar al emitir). Deben coincidir con RECIBO_NEGOCIO_DEFECTO en el Apps Script. */
const RECIBO_NEGOCIO_DEFAULT = {
  nombre: 'Zenware株式会社',
  direccion: '愛知県名古屋市中川区中郷2丁目16番地 ニシベビル101号室',
  telefono: '070-1683-8899',
  registro: 'T8180001165239',
};

// Completa con los datos por defecto cualquier campo vacío (o el nombre
// "Boogaloo" que usaban versiones anteriores del backend).
function negocioConDefectos(n) {
  const d = RECIBO_NEGOCIO_DEFAULT;
  n = n || {};
  const nombre = String(n.nombre || '').trim();
  return {
    nombre: !nombre || nombre === 'Boogaloo' ? d.nombre : nombre,
    direccion: String(n.direccion || '').trim() || d.direccion,
    telefono: String(n.telefono || '').trim() || d.telefono,
    registro: String(n.registro || '').trim() || d.registro,
  };
}
