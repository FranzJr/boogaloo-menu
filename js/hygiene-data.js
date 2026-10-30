/* Control sanitario / 衛生管理記録 — datos de la MAQUETA (ver nota abajo).

   Esta hoja reproduce el "記録表（一般的衛生管理・重要管理）" que exige el
   Centro de Salud de Nakagawa (Nagoya) a partir de la visita del
   23/oct/2026 (ver 食品衛生監視指導票 №02). Las filas y su orden son las
   mismas del formulario real, por eso los nombres de cada ítem van en
   español + japonés tal como aparecen ahí — no se traducen a otros idiomas
   porque son el texto exacto que pide la inspección, no contenido del sitio.

   MAQUETA: desde el 1 de agosto de 2026 hasta el 22 de octubre no existía
   todavía este formulario (la inspección y el inicio de registro fueron el
   23/oct/2026), así que esos días son datos de EJEMPLO generados para
   mostrar cómo se vería la herramienta usada desde esa fecha — no son
   registros reales. Del 23 al 30 de octubre sí son los datos reales,
   transcritos de la hoja en papel que ya se llenó a mano (revísalos: una
   transcripción desde una foto puede tener algún error puntual, y se
   corrige fácilmente editando ese día desde la propia pantalla).

   Todavía no hay backend: lo que se genera aquí es el punto de partida, y
   cualquier día que el admin o un colaborador guarde desde la pantalla se
   queda en localStorage del navegador (ver HYGIENE_STORAGE_KEY en
   admin.js). Cuando se apruebe la maqueta, ese guardado se reemplaza por
   una acción real del Apps Script que escriba en la hoja de cálculo. */

const HYGIENE_STORAGE_KEY = 'boogaloo_hygiene_records_v1';

// Boogaloo cierra lunes, martes y miércoles (getDay(): 0=dom...6=sáb).
const HYGIENE_CLOSED_WEEKDAYS = [1, 2, 3];

const HYGIENE_WEEKDAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HYGIENE_WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];

// Último día con datos de la maqueta (hoy). Más allá de esta fecha un día
// simplemente no tiene registro todavía (es futuro).
const HYGIENE_TODAY_STR = '2026-10-30';

const HYGIENE_ITEMS = [
  { id: 'insumos', group: 'general', code: '①', type: 'check', es: 'Recepción de insumos', ja: '原材料の受入確認' },
  { id: 'nevera', group: 'general', code: '②', type: 'temp', unit: '°C', max: 10, es: 'Nevera', ja: '冷蔵庫（℃）' },
  { id: 'congelador', group: 'general', code: '②', type: 'temp', unit: '°C', max: -15, es: 'Congelador', ja: '冷凍庫（℃）' },
  { id: 'contaminacion', group: 'general', code: '③-1', type: 'check', es: 'Contaminación cruzada (tablas por color)', ja: '交差汚染・二次汚染の防止（まな板の使い分け）' },
  { id: 'utensilios', group: 'general', code: '③-2', type: 'check', es: 'Lavado y desinfección de utensilios', ja: '器具等の洗浄・消毒・殺菌' },
  { id: 'bano', group: 'general', code: '③-3', type: 'check', es: 'Baño', ja: 'トイレの洗浄・消毒' },
  { id: 'salud', group: 'general', code: '④-1', type: 'check', es: 'Salud y ropa del personal', ja: '従業員の健康管理・作業着' },
  { id: 'manos', group: 'general', code: '④-2', type: 'check', es: 'Lavado de manos', ja: '手洗いの実施' },
  { id: 'plagas', group: 'general', code: '⑤', type: 'check', monthly: true, es: 'Ratas e insectos (revisión/fumigación)', ja: '鼠族・昆虫対策（点検・駆除）' },
  { id: 'g1', group: 'importante', code: 'G1', type: 'check', es: 'Sin cocción', ja: '非加熱のもの' },
  { id: 'g2a', group: 'importante', code: 'G2', type: 'check', es: 'Cocido y servido', ja: '加熱後すぐ提供' },
  { id: 'g2b', group: 'importante', code: 'G2', type: 'check', es: 'Vitrina caliente ≥65°C', ja: '加熱後高温保管（ショーケース65℃以上）' },
  { id: 'g3a', group: 'importante', code: 'G3', type: 'check', es: 'Enfriado y recalentado', ja: '加熱後冷却・再加熱' },
  { id: 'g3b', group: 'importante', code: 'G3', type: 'check', es: 'Enfriado y servido frío', ja: '加熱後冷却して提供' },
];

const HYGIENE_INDEX = HYGIENE_ITEMS.reduce((idx, it) => {
  idx[it.id] = it;
  return idx;
}, {});

function hyDateStr(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function hyParseDate(fecha) {
  const [y, m, d] = fecha.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function hyIsClosed(fecha) {
  return HYGIENE_CLOSED_WEEKDAYS.indexOf(hyParseDate(fecha).getDay()) !== -1;
}

// PRNG determinístico (mismo patrón que js/analytics-data.js) para que la
// muestra generada no cambie en cada carga, aunque sea solo de ejemplo.
function hySeededRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) h = (Math.imul(31, h) + seedStr.charCodeAt(i)) | 0;
  return function () {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Genera un día de EJEMPLO cumpliendo la normativa (nevera ≤10°C, congelador
// ≤-15°C, todo marcado como hecho). El control de plagas solo se marca una
// vez al mes, como indicó el inspector ("虫の駆除を毎月行う").
function hyGenerateDay(fecha) {
  if (hyIsClosed(fecha)) return { fecha, cerrado: true };
  const rng = hySeededRandom(fecha);
  const day = Number(fecha.slice(8, 10));
  const items = {};
  HYGIENE_ITEMS.forEach((it) => {
    if (it.type === 'temp') {
      items[it.id] = it.id === 'nevera' ? Math.round(2 + rng() * 6) : -Math.round(17 + rng() * 8);
    } else if (it.monthly) {
      items[it.id] = day <= 7; // se revisa en la primera semana del mes
    } else {
      items[it.id] = true;
    }
  });
  return { fecha, cerrado: false, items, firma: 'F.R.', notas: '' };
}

// Datos REALES del 23 al 30 de octubre de 2026, transcritos de la hoja en
// papel ya llenada a mano (食品衛生監視指導票 №02 de Nakagawa). Revisa y
// corrige cualquier celda desde la pantalla si la transcripción no coincide
// con lo que anotaste en papel.
const HYGIENE_REAL_RECORDS = {
  '2026-10-23': {
    fecha: '2026-10-23', cerrado: false, firma: 'F.R.',
    items: { insumos: true, nevera: 4, congelador: -25, contaminacion: true, utensilios: true, bano: true, salud: true, manos: true, plagas: true, g1: true, g2a: true, g2b: true, g3a: true, g3b: true },
    notas: 'Visita del Centro de Salud de Nakagawa. Inicio del registro según el plan de gestión higiénica.',
  },
  '2026-10-24': {
    fecha: '2026-10-24', cerrado: false, firma: 'F.R.',
    items: { insumos: true, nevera: 3, congelador: -17, contaminacion: true, utensilios: true, bano: true, salud: true, manos: true, plagas: false, g1: true, g2a: true, g2b: true, g3a: true, g3b: true },
    notas: '',
  },
  '2026-10-25': {
    fecha: '2026-10-25', cerrado: false, firma: 'F.R.',
    items: { insumos: true, nevera: 4, congelador: -20, contaminacion: true, utensilios: true, bano: true, salud: true, manos: true, plagas: false, g1: true, g2a: true, g2b: true, g3a: true, g3b: true },
    notas: '',
  },
  '2026-10-26': { fecha: '2026-10-26', cerrado: true },
  '2026-10-27': { fecha: '2026-10-27', cerrado: true },
  '2026-10-28': { fecha: '2026-10-28', cerrado: true },
  '2026-10-29': {
    fecha: '2026-10-29', cerrado: false, firma: 'F.R.',
    items: { insumos: true, nevera: 4, congelador: -18, contaminacion: true, utensilios: true, bano: true, salud: true, manos: true, plagas: false, g1: true, g2a: true, g2b: true, g3a: true, g3b: true },
    notas: '',
  },
  '2026-10-30': {
    fecha: '2026-10-30', cerrado: false, firma: 'F.R.',
    items: { insumos: true, nevera: 4, congelador: -25, contaminacion: true, utensilios: true, bano: true, salud: true, manos: true, plagas: false, g1: true, g2a: true, g2b: true, g3a: true, g3b: true },
    notas: 'Del 23 al 29 de octubre se registró el 30 según confirmación del responsable (formulario nuevo). Nevera ≤10°C y congelador entre -17 y -25°C, sin anomalías en el periodo.',
  },
};

// Construye todo el rango 1-ago-2026 → HYGIENE_TODAY_STR: genera cada día de
// ejemplo y encima pisa con los datos reales de la última semana.
function hyBuildSeedRecords() {
  const records = {};
  const start = hyParseDate('2026-08-01');
  const end = hyParseDate(HYGIENE_TODAY_STR);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const fecha = hyDateStr(d);
    records[fecha] = hyGenerateDay(fecha);
  }
  Object.assign(records, HYGIENE_REAL_RECORDS);
  return records;
}

const HYGIENE_SEED_RECORDS = hyBuildSeedRecords();
