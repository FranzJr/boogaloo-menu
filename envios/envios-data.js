/* Catálogo de "Envíos congelados" — independiente del menú del restaurante
   (js/menu-data.js). Enfocado únicamente en arepas: Arepa Tela (sin
   relleno) y Arepa con Queso Doble Crema. Un mismo plato puede existir acá
   y en el menú con contenido/precio distinto, porque acá se vende por pack
   para viajar congelado, no por porción para comer en el local.

   Ajusta ENVIOS_CONFIG y los precios/packs de abajo según tu operación real
   de envíos (proveedor de caja térmica, transportadora, Stripe, etc). */

const L = (es, en, ja, pt) => ({ es, en, ja, pt });

const ENVIOS_CONFIG = {
  // Pedidos iguales o mayores a este monto (¥) no pagan envío.
  freeShippingThreshold: 8000,
  // Tarifa plana de envío congelado (caja térmica + transportadora) cuando
  // el pedido no alcanza el envío gratis.
  shippingFee: 1280,
  // TODO: reemplaza por el correo real del negocio antes de publicar.
  contactEmail: 'pedidos@boogaloo.jp',
  // TODO(pago): pega aquí tus Stripe Payment Links (panel de Stripe >
  // Products > "+ Create payment link", uno por producto, con cantidad
  // ajustable activada). Mientras el valor esté vacío, ese producto no
  // muestra el botón "Pagar con tarjeta ahora" y el pedido sigue el flujo
  // normal de siempre (caja + solicitud de envío por correo).
  stripePaymentLinks: {
    'arepa-tela': '',
    'arepa-queso-doble-crema': '',
  },
};

const ENVIOS_PRODUCTS = [
  {
    id: 'arepa-tela',
    // Sin foto de producto todavía (ver nota en envios.js): se muestra con
    // la ilustración real del oso pintando, sobre fondo color lienzo —
    // referencia directa a la historia de "Arepa Tela" de abajo.
    img: '../img/oso/oso-pintando.png',
    canvasCard: true,
    badge: null,
    porciones: 6,
    peso: '720g',
    prepMinutos: 10,
    precio: 2200,
    nombre: L('Arepa Tela', 'Arepa Tela', 'アレパ・テラ', 'Arepa Tela'),
    desc: L(
      '6 arepas de maíz trillado, sin relleno — el lienzo en blanco de la cocina colombiana. Solo maíz, agua y sal.',
      '6 plain trillado-corn arepas — the blank canvas of Colombian cooking. Just corn, water and salt.',
      'トリジャード製法のとうもろこし粉で作ったプレーンアレパ6個。コロンビア料理の「白いキャンバス」。とうもろこし・水・塩のみ。',
      '6 arepas de milho trillado, sem recheio — a tela em branco da culinária colombiana. Só milho, água e sal.'
    ),
    recalentado: L(
      'Sartén sin aceite a fuego medio, 4-5 min por lado, hasta que dore. También sirve el horno a 200°C por 10 min.',
      'Dry pan over medium heat, 4-5 min per side, until golden. Oven at 200°C for 10 min also works.',
      '油をひかずにフライパンで中火、片面4〜5分ずつ焼き色がつくまで。オーブン200℃10分でも可。',
      'Frigideira sem óleo em fogo médio, 4-5 min de cada lado, até dourar. Forno a 200°C por 10 min também funciona.'
    ),
    idealPara: L(
      'Tu lienzo: huevo, mantequilla, aguacate, lo que se te ocurra',
      'Your canvas: egg, butter, avocado, whatever you like',
      'あなたのキャンバスに：卵、バター、アボカドなど自由に',
      'Sua tela: ovo, manteiga, abacate, o que você quiser'
    ),
  },
  {
    id: 'arepa-queso-doble-crema',
    // Foto real del plato (Arepa Cheese del menú del local) — la más
    // cercana que tenemos a "queso doble crema"; si consigues una foto del
    // producto ya empacado al vacío, reemplázala aquí.
    img: '../img/platos/arepa-cheese.jpg',
    canvasCard: false,
    badge: 'bestseller',
    porciones: 6,
    peso: '900g',
    prepMinutos: 10,
    precio: 2800,
    nombre: L(
      'Arepa con Queso Doble Crema',
      'Arepa with Doble Crema Cheese',
      'ダブルクレマチーズのアレパ',
      'Arepa com Queijo Doble Crema'
    ),
    desc: L(
      '6 arepas rellenas del queso colombiano que más se estira — doble crema, derretido hasta el último bocado.',
      '6 arepas filled with the stretchiest Colombian cheese — doble crema, melted into every bite.',
      'コロンビアを代表する伸びるチーズ「ドブレクレマ」をたっぷり包んだアレパ6個。',
      '6 arepas recheadas com o queijo colombiano que mais estica — doble crema, derretido até a última mordida.'
    ),
    recalentado: L(
      'Sartén con un poco de mantequilla a fuego medio, 6-8 min por lado, hasta que el queso se derrita por dentro.',
      'Pan with a little butter over medium heat, 6-8 min per side, until the cheese melts inside.',
      'バターを少量ひいたフライパンで中火、片面6〜8分、中のチーズが溶けるまで。',
      'Frigideira com um pouco de manteiga em fogo médio, 6-8 min de cada lado, até o queijo derreter por dentro.'
    ),
    idealPara: L(
      'El antojo de queso que se estira hasta el techo',
      'The cheese-pull craving',
      '伸びるチーズが食べたい時に',
      'Aquela vontade de queijo que estica até o teto'
    ),
  },
];

const ENVIOS_INDEX = ENVIOS_PRODUCTS.reduce((idx, p) => {
  idx[p.id] = p;
  return idx;
}, {});

// Igual que mi() en js/menu-data.js: toma el texto en el idioma activo.
function ei(field) {
  if (!field) return '';
  const lang = (typeof I18n !== 'undefined' && I18n.lang) || 'es';
  return field[lang] || '';
}

// Prefecturas en japonés: en un envío dentro de Japón la transportadora
// necesita la dirección en japonés sin importar el idioma de la interfaz,
// igual que en cualquier tienda japonesa que atiende clientes extranjeros.
const JP_PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];
