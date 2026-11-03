/* Control sanitario / 衛生管理記録 — definición del formulario.

   Esta hoja reproduce el "記録表（一般的衛生管理・重要管理）" que exige el
   Centro de Salud de Nakagawa (Nagoya) a partir de la visita del
   23/oct/2026 (ver 食品衛生監視指導票 №02). Las filas y su orden son las
   mismas del formulario real, por eso los nombres de cada ítem van en
   español + japonés tal como aparecen ahí — no se traducen a otros idiomas
   porque son el texto exacto que pide la inspección.

   Los registros viven en el backend (hoja "Higiene" del spreadsheet, acciones
   listarHigiene / guardarHigiene). Aquí NO hay datos de ejemplo: un día sin
   registro se muestra como "sin registro". HYGIENE_REAL_RECORDS son solo los
   registros que ya se llenaron a mano en papel (23-30 oct 2026): el admin los
   puede cargar al sistema UNA vez con el botón de importar, después de
   revisarlos, y nunca pisan un día que ya tenga registro guardado. */

// Días cerrados (getDay(): 0=dom...6=sáb). Valor de respaldo; admin.js lo
// reemplaza con el horario real del negocio (hoja Horario) al cargar.
let HYGIENE_CLOSED_WEEKDAYS = [1, 2, 3];

const HYGIENE_WEEKDAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const HYGIENE_WEEKDAYS_JA = ['日', '月', '火', '水', '木', '金', '土'];

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
