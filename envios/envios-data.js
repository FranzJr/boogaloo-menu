/* Catálogo de "Envíos congelados" — independiente del menú del restaurante
   (js/menu-data.js). Un mismo plato puede existir en los dos archivos con
   contenido/precio distinto, porque acá se vende por pack para viajar
   congelado, no por porción para comer en el local.

   Ajusta ENVIOS_CONFIG y los precios/packs de abajo según tu operación real
   de envíos (proveedor de caja térmica, transportadora, etc). */

const L = (es, en, ja, pt) => ({ es, en, ja, pt });

const ENVIOS_CONFIG = {
  // Pedidos iguales o mayores a este monto (¥) no pagan envío.
  freeShippingThreshold: 8000,
  // Tarifa plana de envío congelado (caja térmica + transportadora) cuando
  // el pedido no alcanza el envío gratis.
  shippingFee: 1280,
  // TODO: reemplaza por el correo real del negocio antes de publicar.
  contactEmail: 'pedidos@boogaloo.jp',
};

const ENVIOS_PRODUCTS = [
  {
    id: 'pack-arepas-clasicas',
    img: '../img/platos/arepa-cheese.jpg',
    badge: 'bestseller',
    porciones: 6,
    peso: '900g',
    prepMinutos: 12,
    precio: 3200,
    nombre: L('Pack Arepas Clásicas', 'Classic Arepas Pack', 'アレパ・クラシックパック', 'Pack Arepas Clássicas'),
    desc: L(
      '6 arepas congeladas (2 de queso, 2 de carne, 2 de pollo), listas para dorar en sartén u horno.',
      '6 frozen arepas (2 cheese, 2 beef, 2 chicken), ready to pan-sear or bake.',
      '冷凍アレパ6個（チーズ2個、ビーフ2個、チキン2個）。フライパンやオーブンで温めるだけ。',
      '6 arepas congeladas (2 de queijo, 2 de carne, 2 de frango), prontas para dourar na frigideira ou no forno.'
    ),
    recalentado: L(
      'Sartén con un poco de aceite a fuego medio, 6-8 min por lado; o horno a 200°C, 12-15 min. Evita el microondas: reseca la masa.',
      'Pan-sear with a little oil over medium heat, 6-8 min per side; or oven at 200°C for 12-15 min. Avoid the microwave — it dries out the dough.',
      'フライパンに少量の油をひき中火で片面6〜8分。またはオーブン200℃で12〜15分。電子レンジは生地が乾燥するため避けてください。',
      'Na frigideira com um pouco de óleo em fogo médio, 6-8 min de cada lado; ou no forno a 200°C por 12-15 min. Evite o micro-ondas — resseca a massa.'
    ),
    idealPara: L('Cena rápida entre semana', 'A quick weeknight dinner', '平日の手早い夕食に', 'Um jantar rápido durante a semana'),
  },
  {
    id: 'pack-empanadas-mixtas',
    img: '../img/platos/empanada.jpg',
    badge: 'popular',
    porciones: 10,
    peso: '750g',
    prepMinutos: 8,
    precio: 3600,
    nombre: L('Pack Empanadas Mixtas', 'Mixed Empanadas Pack', 'エンパナーダ・ミックスパック', 'Pack Empanadas Mistas'),
    desc: L(
      '10 empanadas congeladas (5 de carne, 5 de pollo con queso) con ají casero congelado incluido.',
      '10 frozen empanadas (5 beef, 5 chicken & cheese), with homemade frozen ají sauce included.',
      '冷凍エンパナーダ10個（牛肉5個、チキン＆チーズ5個）。自家製アヒソース（冷凍）付き。',
      '10 pastéis congelados (5 de carne, 5 de frango com queijo), com molho ají caseiro congelado incluído.'
    ),
    recalentado: L(
      'Fríe en aceite caliente 3-4 min hasta dorar, u hornea a 200°C por 15 min. El ají se descongela a temperatura ambiente en 15 min.',
      'Deep-fry in hot oil for 3-4 min until golden, or bake at 200°C for 15 min. Thaw the ají sauce at room temperature for 15 min.',
      '熱した油で3〜4分揚げ焼き、またはオーブン200℃で15分。アヒソースは常温で15分ほど自然解凍してください。',
      'Frite em óleo quente por 3-4 min até dourar, ou asse a 200°C por 15 min. O molho ají descongela em temperatura ambiente em 15 min.'
    ),
    idealPara: L('Compartir con amigos', 'Sharing with friends', '友人とシェアするのに', 'Compartilhar com amigos'),
  },
  {
    id: 'aborrajado-congelado',
    img: '../img/platos/aborrajado.jpg',
    badge: null,
    porciones: 4,
    peso: '640g',
    prepMinutos: 10,
    precio: 2400,
    nombre: L('Aborrajado Congelado', 'Frozen Aborrajado', '冷凍アボラハード', 'Aborrajado Congelado'),
    desc: L(
      '4 unidades de plátano maduro relleno de queso y bocadillo (guayaba), ya empanizado y listo para freír.',
      '4 pieces of ripe plantain stuffed with cheese and guava paste, already battered and ready to fry.',
      '熟したプラタノにチーズとグアバペーストを詰め、衣付けした状態で冷凍。揚げるだけで完成、4個入り。',
      '4 unidades de banana-da-terra madura recheada com queijo e goiabada, já empanada e pronta para fritar.'
    ),
    recalentado: L(
      'Fríe en aceite caliente 4-5 min por lado, directo del congelador, sin descongelar antes.',
      'Deep-fry in hot oil for 4-5 min per side, straight from the freezer — no need to thaw first.',
      '解凍せずに冷凍のまま熱した油で片面4〜5分揚げてください。',
      'Frite em óleo quente por 4-5 min de cada lado, direto do freezer, sem descongelar antes.'
    ),
    idealPara: L('Antojo dulce y salado', 'A sweet-and-salty craving', '甘じょっぱいものが食べたい時に', 'Uma vontade de doce com salgado'),
  },
  {
    id: 'caldo-costilla-congelado',
    img: '../img/platos/caldo-costilla.jpg',
    badge: 'new',
    porciones: 4,
    peso: '1.2kg',
    prepMinutos: 15,
    precio: 3000,
    nombre: L('Caldo de Costilla Congelado', 'Frozen Beef Rib Soup', '冷凍牛カルビスープ', 'Caldo de Costela Congelado'),
    desc: L(
      '4 raciones de caldo de costilla colombiano, congelado en su punto justo de cocción.',
      '4 portions of Colombian beef rib soup, frozen right at the perfect cooking point.',
      'コロンビア風牛カルビスープ4人前。ちょうど良い煮込み具合で急速冷凍しています。',
      '4 porções de caldo de costela colombiano, congelado no ponto certo de cozimento.'
    ),
    recalentado: L(
      'Calienta en una olla a fuego medio 12-15 min, revolviendo de vez en cuando, sin necesidad de descongelar antes.',
      'Heat in a pot over medium heat for 12-15 min, stirring occasionally — no need to thaw first.',
      '鍋に入れ中火で12〜15分、時々かき混ぜながら温めてください。解凍は不要です。',
      'Aqueça em uma panela em fogo médio por 12-15 min, mexendo de vez em quando, sem precisar descongelar antes.'
    ),
    idealPara: L('Días fríos de invierno', 'Cold winter days', '寒い冬の日に', 'Dias frios de inverno'),
  },
  {
    id: 'pack-postres-dulce-colombia',
    img: '../img/platos/postre-brownie.jpg',
    badge: null,
    porciones: 6,
    peso: '480g',
    prepMinutos: 0,
    precio: 2600,
    nombre: L('Pack Postres Dulce Colombia', 'Sweet Colombia Desserts Pack', 'デザート「ドゥルセ・コロンビア」パック', 'Pack Sobremesas Doce Colômbia'),
    desc: L(
      '2 brownies de arequipe, 2 alfajores y 2 milhojas, congelados individualmente.',
      '2 arequipe brownies, 2 alfajores and 2 milhojas, individually frozen.',
      'アレキペのブラウニー2個、アルファホール2個、ミルオハス2個。個包装で冷凍。',
      '2 brownies de arequipe, 2 alfajores e 2 milhojas, congelados individualmente.'
    ),
    recalentado: L(
      'Pasa del congelador al refrigerador la noche anterior, o déjalos 15-20 min a temperatura ambiente antes de servir.',
      'Move from the freezer to the fridge the night before, or leave at room temperature for 15-20 min before serving.',
      '前日に冷凍庫から冷蔵庫へ移すか、常温で15〜20分置いてからお召し上がりください。',
      'Passe do freezer para a geladeira na noite anterior, ou deixe 15-20 min em temperatura ambiente antes de servir.'
    ),
    idealPara: L('Sobremesa para compartir', 'A dessert to share', 'シェアするデザートに', 'Uma sobremesa para compartilhar'),
  },
  {
    id: 'salsas-congeladas',
    img: '../img/platos/guacamole.jpg',
    badge: null,
    porciones: 8,
    peso: '400g',
    prepMinutos: 5,
    precio: 900,
    nombre: L('Salsas Caseras Congeladas', 'Frozen Homemade Sauces', '冷凍自家製ソースセット', 'Molhos Caseiros Congelados'),
    desc: L(
      'Guacamole casero y hogao colombiano, en porciones congeladas de 200g cada uno.',
      'Homemade guacamole and Colombian hogao sauce, in frozen 200g portions each.',
      '自家製ワカモレとコロンビア風オアガオソース。それぞれ200gの冷凍パック。',
      'Guacamole caseiro e hogao colombiano, em porções congeladas de 200g cada.'
    ),
    recalentado: L(
      'Descongela en el refrigerador 3-4 horas antes de servir. No se recomienda calentar el guacamole.',
      'Thaw in the fridge 3-4 hours before serving. Reheating the guacamole is not recommended.',
      '召し上がる3〜4時間前に冷蔵庫で解凍してください。ワカモレの加熱はおすすめしません。',
      'Descongele na geladeira 3-4 horas antes de servir. Não é recomendado aquecer o guacamole.'
    ),
    idealPara: L('Acompañar cualquier plato', 'Pairing with any dish', 'どんな料理にも添えて', 'Acompanhar qualquer prato'),
  },
  {
    id: 'combo-familiar-boogaloo',
    img: '../img/platos/arepa-costilla.jpg',
    badge: 'bestvalue',
    porciones: 16,
    peso: '2.4kg',
    prepMinutos: 15,
    precio: 7800,
    nombre: L('Combo Familiar Boogaloo', 'Boogaloo Family Combo', 'ボガルー・ファミリーコンボ', 'Combo Familiar Boogaloo'),
    desc: L(
      '4 arepas, 6 empanadas y 6 postres — todo lo esencial de Boogaloo en una sola caja, con descuento.',
      '4 arepas, 6 empanadas and 6 desserts — all of Boogaloo\'s essentials in one box, at a discount.',
      'アレパ4個、エンパナーダ6個、デザート6個。ボガルーの人気商品がお得に詰まった一箱。',
      '4 arepas, 6 empanadas e 6 sobremesas — o essencial do Boogaloo em uma única caixa, com desconto.'
    ),
    recalentado: L(
      'Cada producto trae su propia guía de recalentado dentro de la caja.',
      'Each product includes its own reheating guide inside the box.',
      '箱の中に商品ごとの温め方ガイドが入っています。',
      'Cada produto vem com seu próprio guia de reaquecimento dentro da caixa.'
    ),
    idealPara: L('Familias o reuniones', 'Families or gatherings', 'ご家族や集まりに', 'Famílias ou reuniões'),
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
