/* Menú Boogaloo — estructurado a partir de "Menu Boogaloo.pdf"
   Cada item tiene un sku único: DEBE coincidir exactamente con MENU en apps-script/Code.gs,
   porque el precio final del pedido se calcula (y se confía) en el backend, no en el navegador.

   Internacionalización: `nombre` (y `aka` si existe) son nombres propios colombianos y se
   mantienen IGUALES en los 4 idiomas — así como "sushi" o "pizza" no se traducen. Solo `subt`
   y `desc` cambian por idioma, y ahí es donde se explican los términos regionales (panela,
   hogao, arequipe, bocadillo...) para quien no habla español. Usa L(es,en,ja,pt) para definirlos. */

const L = (es, en, ja, pt) => ({ es, en, ja, pt });

const MENU_CATEGORIES = [
  {
    id: 'arepas',
    icon: 'arepa',
    nombre: 'Arepas',
    subt: L(
      'Tortas de maíz a la parrilla',
      'Grilled Colombian corn cakes',
      'コロンビア風とうもろこしのパン',
      'Bolinhos de milho grelhados'
    ),
    items: [
      {
        sku: 'arepa-cheese',
        nombre: 'Arepa Cheese',
        desc: L(
          'Arepa colombiana rellena de queso fundido.',
          'Colombian corn cake filled with melted cheese.',
          'とろけるチーズを包んだコロンビア風アレパ。',
          'Bolinho de milho colombiano recheado com queijo derretido.'
        ),
        precio: 350,
      },
      {
        sku: 'arepa-carne',
        nombre: 'Arepa Carne',
        subt: L(null, 'Beef arepa', 'ビーフアレパ', 'Arepa de carne'),
        desc: L(
          'Arepa colombiana rellena de carne de res deshilachada, cocinada lentamente con cebolla, ajo, tomate y pimentón, cubierta con queso.',
          'Colombian corn cake filled with slow-cooked shredded beef, onion, garlic, tomato and bell pepper, topped with cheese.',
          'じっくり煮込んだほぐし牛肉に、玉ねぎ・にんにく・トマト・パプリカの旨味たっぷりソースとチーズを合わせたコロンビア風アレパ。',
          'Bolinho de milho colombiano recheado com carne bovina desfiada, cozida lentamente com cebola, alho, tomate e pimentão, coberto com queijo.'
        ),
        precio: 1050,
      },
      {
        sku: 'arepa-pollo',
        nombre: 'Arepa Pollo',
        subt: L(null, 'Chicken arepa', 'チキンアレパ', 'Arepa de frango'),
        desc: L(
          'Arepa colombiana rellena de pollo deshilachado, cocinado lentamente con cebolla, ajo, tomate y pimentón, cubierta con queso.',
          'Colombian corn cake filled with slow-cooked shredded chicken, onion, garlic, tomato and bell pepper, topped with cheese.',
          'じっくり調理したほぐし鶏肉に、玉ねぎ・にんにく・トマト・パプリカの旨味たっぷりソースとチーズを合わせたコロンビア風アレパ。',
          'Bolinho de milho colombiano recheado com frango desfiado, cozido lentamente com cebola, alho, tomate e pimentão, coberto com queijo.'
        ),
        precio: 950,
      },
      {
        sku: 'arepa-chorizo',
        nombre: 'Arepa con Chorizo',
        subt: L(null, 'Chorizo arepa', 'チョリソーアレパ', 'Arepa com chorizo'),
        desc: L(
          'Arepa colombiana rellena de queso fundido y chorizo a la parrilla.',
          'Colombian corn cake filled with melted cheese and grilled chorizo sausage.',
          'とろけるチーズとジューシーなチョリソー（コロンビア風ソーセージ）をたっぷり包んだコロンビア風アレパ。',
          'Bolinho de milho colombiano recheado com queijo derretido e chorizo (linguiça colombiana) grelhado.'
        ),
        precio: 850,
      },
    ],
  },
  {
    id: 'empanadas',
    icon: 'empanada',
    nombre: 'Empanadas',
    subt: L(
      'Pastelitos fritos de maíz rellenos',
      'Fried corn-dough turnovers',
      '揚げとうもろこし生地の点心',
      'Pastéis fritos de milho recheados'
    ),
    nota: L(
      'Todas las empanadas vienen con ají casero y guacamole fresco.',
      'All empanadas come with homemade ají sauce and fresh guacamole.',
      'すべてのエンパナーダに、自家製アヒソース（コロンビア風薬味ソース）とワカモレが付きます。',
      'Todos os pastéis vêm com molho ají caseiro e guacamole fresco.'
    ),
    items: [
      {
        sku: 'empanada-carne',
        nombre: 'Empanada de Carne',
        subt: L(null, 'Beef empanada', '牛ひき肉のエンパナーダ', 'Empanada de carne'),
        desc: L(
          'Carne molida cocinada en hogao (tomate, cebolla y cebolla larga).',
          'Ground beef cooked in hogao, a traditional Colombian sauce of tomato, onion and scallion.',
          'やわらかい牛ひき肉を、アオガオ（トマト、玉ねぎ、青ねぎをじっくり炒めて作るコロンビアの伝統ソース）で丁寧に煮込み、香り豊かに仕上げました。',
          'Carne moída cozida em hogao, molho tradicional colombiano de tomate, cebola e cebolinha.'
        ),
        precio: 600,
      },
      {
        sku: 'empanada-pollo-queso',
        nombre: 'Empanada de Pollo con Queso',
        subt: L(null, 'Chicken & cheese empanada', '鶏肉とチーズのエンパナーダ', 'Empanada de frango com queijo'),
        desc: L(
          'Pollo desmechado cocinado en hogao colombiano, mezclado con queso mozzarella fundido.',
          'Shredded chicken cooked in hogao (Colombian tomato-onion sauce), blended with melted mozzarella.',
          'やわらかくほぐした鶏肉を、アオガオ（コロンビアの伝統的なトマト・玉ねぎソース）で煮込み、とろけるチーズと合わせました。',
          'Frango desfiado cozido em hogao (molho colombiano de tomate e cebola), misturado com queijo muçarela derretido.'
        ),
        precio: 600,
      },
    ],
  },
  {
    id: 'platano',
    icon: 'platano',
    nombre: 'Plátano Maduro',
    subt: L(
      'Plátano dulce maduro',
      'Sweet ripe plantain',
      '甘く熟した料理用バナナ',
      'Banana-da-terra doce e madura'
    ),
    items: [
      {
        sku: 'maduro-queso-bocadillo',
        nombre: 'Maduro con Queso y Bocadillo',
        desc: L(
          'Plátano maduro entero horneado con queso fundido y bocadillo (dulce de guayaba). Perfecto para compartir.',
          'Whole ripe plantain baked with melted cheese and bocadillo (Colombian guava paste). Perfect to share.',
          '甘く熟したプラタノ（料理用バナナ）に、とろけるチーズとコロンビア伝統のグアバペースト「ボカディージョ」を合わせました。シェアにぴったり。',
          'Banana-da-terra madura inteira, assada com queijo derretido e bocadillo (goiabada colombiana). Perfeito para compartilhar.'
        ),
        precio: 800,
      },
      {
        sku: 'aborrajado',
        nombre: 'Aborrajado con Queso y Bocadillo',
        desc: L(
          'Plátano maduro relleno de queso y bocadillo (dulce de guayaba), cubierto con una ligera masa y frito.',
          'Ripe plantain stuffed with cheese and bocadillo (Colombian guava paste), lightly battered and fried.',
          '熟したプラタノにチーズとグアバペースト「ボカディージョ」を詰め、衣をつけて香ばしく揚げました。',
          'Banana-da-terra madura recheada com queijo e bocadillo (goiabada colombiana), empanada levemente e frita.'
        ),
        precio: 500,
      },
    ],
  },
  {
    id: 'postres',
    icon: 'postre',
    nombre: 'Postres y Obleas',
    subt: L(
      'Dulces colombianos tradicionales',
      'Traditional Colombian sweets',
      'コロンビアの伝統的なスイーツ',
      'Doces tradicionais colombianos'
    ),
    items: [
      {
        sku: 'ensalada-frutas',
        nombre: 'Ensalada de Frutas Premium',
        desc: L(
          'Frutas de temporada, queso, crema, menta, oblea (galleta de barquillo) y almíbar casero.',
          'Seasonal fruit, cheese, cream, mint, oblea (thin wafer) and homemade syrup.',
          '旬のフルーツ、チーズ、クリーム、ミント、オブレア（薄いウエハース）、自家製シロップを合わせたコロンビア風フルーツサラダ。',
          'Frutas da estação, queijo, creme, hortelã, oblea (bolacha fina) e calda caseira.'
        ),
        precio: 1850,
      },
      {
        sku: 'oblea-traditional',
        nombre: 'Oblea Traditional',
        subt: L(null, 'Wafer with arequipe, cream & cheese', 'アレキペ+生クリーム+チーズのオブレア', 'Bolacha com arequipe, creme e queijo'),
        desc: L(
          'Oblea (galleta fina tipo barquillo) colombiana con arequipe (dulce de leche colombiano), crema fresca y queso.',
          'Colombian oblea (thin wafer) with arequipe (Colombian dulce de leche), fresh cream and cheese.',
          'コロンビアの薄いウエハース「オブレア」に、アレキペ（コロンビア風ミルクキャラメル）、生クリーム、チーズをのせました。',
          'Oblea (bolacha fina) colombiana com arequipe (doce de leite colombiano), creme fresco e queijo.'
        ),
        precio: 950,
      },
      {
        sku: 'oblea-berry',
        nombre: 'Berry Oblea',
        subt: L(null, 'Wafer with berry jam', 'ベリーミックスジャムのオブレア', 'Bolacha com geleia de frutas vermelhas'),
        desc: L(
          'Oblea con arequipe (dulce de leche colombiano), crema fresca, queso y mermelada de frutos rojos.',
          'Oblea (thin wafer) with arequipe (Colombian dulce de leche), fresh cream, cheese and mixed berry jam.',
          'オブレアに、アレキペ（ミルクキャラメル）、生クリーム、チーズ、ベリーミックスジャムをのせました。',
          'Oblea com arequipe (doce de leite colombiano), creme fresco, queijo e geleia de frutas vermelhas.'
        ),
        precio: 950,
      },
      {
        sku: 'oblea-special',
        nombre: 'Boogaloo Special Oblea',
        subt: L(null, 'Our signature loaded wafer', 'オブレア・スペシャル', 'Nossa bolacha especial'),
        desc: L(
          'Arequipe (dulce de leche colombiano), crema fresca, queso, mermelada de frutos rojos y banano o fresa.',
          'Arequipe (Colombian dulce de leche), fresh cream, cheese, mixed berry jam and banana or strawberry.',
          'アレキペ（ミルクキャラメル）、生クリーム、チーズ、ベリーミックスジャム、バナナまたはいちごをのせた特製オブレア。',
          'Arequipe (doce de leite colombiano), creme fresco, queijo, geleia de frutas vermelhas e banana ou morango.'
        ),
        precio: 950,
      },
      {
        sku: 'postre-alfajor',
        nombre: 'Alfajor de Arequipe',
        subt: L(
          'Postre ocasional de temporada',
          'Seasonal occasional dessert',
          '季節のデザート',
          'Sobremesa sazonal ocasional'
        ),
        desc: L(
          'Alfajor (dos galletas rellenas de dulce) relleno de arequipe, el dulce de leche colombiano.',
          'Alfajor (two cookies filled with a sweet spread) filled with arequipe, Colombian dulce de leche.',
          'アレキペ（コロンビア風ミルクキャラメル）を挟んだアルファホール。',
          'Alfajor (duas bolachas recheadas) recheado com arequipe, o doce de leite colombiano.'
        ),
        precio: 600,
      },
      {
        sku: 'postre-brownie',
        nombre: 'Brownie de Arequipe',
        subt: L(
          'Postre ocasional de temporada',
          'Seasonal occasional dessert',
          '季節のデザート',
          'Sobremesa sazonal ocasional'
        ),
        desc: L(
          'Brownie de chocolate relleno con arequipe, el dulce de leche colombiano.',
          'Chocolate brownie filled with arequipe, Colombian dulce de leche.',
          'アレキペ（コロンビア風ミルクキャラメル）入りのチョコレートブラウニー。',
          'Brownie de chocolate recheado com arequipe, o doce de leite colombiano.'
        ),
        precio: 600,
      },
      {
        sku: 'postre-milhojas',
        nombre: 'Milhojas de Arequipe',
        subt: L(
          'Postre ocasional de temporada',
          'Seasonal occasional dessert',
          '季節のデザート',
          'Sobremesa sazonal ocasional'
        ),
        desc: L(
          'Hojaldre en capas relleno de arequipe, el dulce de leche colombiano.',
          'Layered puff pastry filled with arequipe, Colombian dulce de leche.',
          'アレキペ（コロンビア風ミルクキャラメル）を重ねたミルオハス（パイ生地のミルフィーユ）。',
          'Massa folhada em camadas recheada com arequipe, o doce de leite colombiano.'
        ),
        precio: 600,
      },
    ],
  },
  {
    id: 'jugos',
    icon: 'jugo',
    nombre: 'Jugos Naturales',
    subt: L('Jugos frescos de fruta', 'Fresh fruit juices', 'フレッシュジュース', 'Sucos naturais de fruta'),
    items: [
      {
        sku: 'jugo-mango-agua-12',
        nombre: 'Jugo de Mango (Agua) 12oz',
        subt: L(null, 'Mango juice · water base', 'マンゴージュース（水）', 'Suco de manga · à base de água'),
        precio: 500,
      },
      {
        sku: 'jugo-mango-agua-16',
        nombre: 'Jugo de Mango (Agua) 16oz',
        subt: L(null, 'Mango juice · water base', 'マンゴージュース（水）', 'Suco de manga · à base de água'),
        precio: 600,
      },
      {
        sku: 'jugo-mango-leche-12',
        nombre: 'Jugo de Mango (Leche) 12oz',
        subt: L(null, 'Mango juice · milk base', 'マンゴージュース（ミルク）', 'Suco de manga · à base de leite'),
        precio: 600,
      },
      {
        sku: 'jugo-mango-leche-16',
        nombre: 'Jugo de Mango (Leche) 16oz',
        subt: L(null, 'Mango juice · milk base', 'マンゴージュース（ミルク）', 'Suco de manga · à base de leite'),
        precio: 700,
      },
      {
        sku: 'jugo-fresa-agua-12',
        nombre: 'Jugo de Fresa (Agua) 12oz',
        subt: L(null, 'Strawberry juice · water base', 'いちごジュース（水）', 'Suco de morango · à base de água'),
        precio: 500,
      },
      {
        sku: 'jugo-fresa-agua-16',
        nombre: 'Jugo de Fresa (Agua) 16oz',
        subt: L(null, 'Strawberry juice · water base', 'いちごジュース（水）', 'Suco de morango · à base de água'),
        precio: 600,
      },
      {
        sku: 'jugo-fresa-leche-12',
        nombre: 'Jugo de Fresa (Leche) 12oz',
        subt: L(null, 'Strawberry juice · milk base', 'いちごジュース（ミルク）', 'Suco de morango · à base de leite'),
        precio: 600,
      },
      {
        sku: 'jugo-fresa-leche-16',
        nombre: 'Jugo de Fresa (Leche) 16oz',
        subt: L(null, 'Strawberry juice · milk base', 'いちごジュース（ミルク）', 'Suco de morango · à base de leite'),
        precio: 700,
      },
      {
        sku: 'te-frutos-rojos-frio',
        nombre: 'Iced Berry Tea',
        subt: L('Té de frutos rojos frío', null, 'アイスベリーティー', 'Chá gelado de frutas vermelhas'),
        precio: 500,
      },
      {
        sku: 'panela-limon',
        nombre: 'Agua de Panela con Limón',
        aka: 'Lemonela',
        desc: L(
          'Bebida fría de panela (bloque de jugo de caña de azúcar sin refinar) con limón. También la conocemos como "Lemonela".',
          'Cold drink made with panela (unrefined cane sugar block) and lime. We also call it "Lemonela".',
          'パネラ（精製していないサトウキビの塊）とライムで作る冷たい飲み物。「レモネラ」とも呼びます。',
          'Bebida gelada de panela (bloco de suco de cana-de-açúcar não refinado) com limão. Também chamamos de "Lemonela".'
        ),
        precio: 500,
      },
    ],
  },
  {
    id: 'cafe',
    icon: 'cafe',
    nombre: 'Café y Bebidas Calientes',
    subt: L('Café colombiano y más', 'Colombian coffee & more', 'コロンビア産コーヒーなど', 'Café colombiano e mais'),
    items: [
      { sku: 'te-frutos-rojos-caliente-8', nombre: 'Hot Berry Tea 8oz', subt: L('Té de frutos rojos caliente', null, 'ホットベリーティー', 'Chá quente de frutas vermelhas'), precio: 400 },
      { sku: 'te-frutos-rojos-caliente-12', nombre: 'Hot Berry Tea 12oz', subt: L('Té de frutos rojos caliente', null, 'ホットベリーティー', 'Chá quente de frutas vermelhas'), precio: 500 },
      { sku: 'capuccino-8', nombre: 'Capuccino 8oz', subt: L('Caliente o frío', 'Hot or iced', 'ホット・アイス', 'Quente ou gelado'), precio: 550 },
      { sku: 'capuccino-12', nombre: 'Capuccino 12oz', subt: L('Caliente o frío', 'Hot or iced', 'ホット・アイス', 'Quente ou gelado'), precio: 650 },
      { sku: 'mocha-8', nombre: 'Mocha 8oz', subt: L('Caliente o frío', 'Hot or iced', 'ホット・アイス', 'Quente ou gelado'), precio: 600 },
      { sku: 'mocha-12', nombre: 'Mocha 12oz', subt: L('Caliente o frío', 'Hot or iced', 'ホット・アイス', 'Quente ou gelado'), precio: 700 },
      { sku: 'latte-8', nombre: 'Café Latte 8oz', subt: L('Caliente o frío', 'Hot or iced', 'ホット・アイス', 'Quente ou gelado'), precio: 550 },
      { sku: 'latte-12', nombre: 'Café Latte 12oz', subt: L('Caliente o frío', 'Hot or iced', 'ホット・アイス', 'Quente ou gelado'), precio: 650 },
      { sku: 'tinto-8', nombre: 'Tinto 8oz', subt: L('Café negro colombiano', 'Colombian black coffee', 'コロンビア風ブラックコーヒー', 'Café preto colombiano'), precio: 400 },
      { sku: 'tinto-12', nombre: 'Tinto 12oz', subt: L('Café negro colombiano', 'Colombian black coffee', 'コロンビア風ブラックコーヒー', 'Café preto colombiano'), precio: 500 },
      { sku: 'americano-8', nombre: 'Americano 8oz', precio: 450 },
      { sku: 'americano-12', nombre: 'Americano 12oz', precio: 550 },
    ],
    extras: [
      { sku: 'topping-caramelo', nombre: 'Topping Caramelo', subt: L(null, 'Caramel topping', 'キャラメルトッピング', 'Cobertura de caramelo'), precio: 100 },
      { sku: 'topping-chocolate', nombre: 'Topping Chocolate', subt: L(null, 'Chocolate topping', 'チョコレートトッピング', 'Cobertura de chocolate'), precio: 100 },
      { sku: 'topping-helado', nombre: 'Topping Helado', subt: L(null, 'Ice cream topping', 'アイスクリームトッピング', 'Cobertura de sorvete'), precio: 150 },
    ],
  },
  {
    id: 'otros',
    icon: 'otros',
    nombre: 'Otros',
    subt: L('Ensaladas y acompañamientos', 'Salads & sides', 'サラダ・その他', 'Saladas e acompanhamentos'),
    items: [
      {
        sku: 'ensalada-verde',
        nombre: 'Ensalada Verde',
        subt: L(null, 'Green salad', 'グリーンサラダ', 'Salada verde'),
        desc: L(
          'Mezcla de lechugas, tomate, cebolla encurtida y vegetales frescos.',
          'Mixed lettuce, tomato, pickled onion and fresh vegetables.',
          'レタスミックス、トマト、紫玉ねぎのピクルス、野菜。',
          'Mix de alfaces, tomate, cebola em conserva e vegetais frescos.'
        ),
        precio: 300,
      },
      {
        sku: 'guacamole',
        nombre: 'Guacamole Casero',
        subt: L(null, 'Homemade guacamole', '自家製ワカモレ', 'Guacamole caseiro'),
        precio: 300,
      },
      {
        sku: 'caldo-costilla',
        nombre: 'Caldo de Costilla',
        subt: L(null, 'Traditional Colombian beef rib soup', 'コロンビア風牛カルビスープ', 'Sopa tradicional colombiana de costela'),
        precio: 300,
      },
    ],
    extras: [
      { sku: 'extra-queso', nombre: 'Extra Queso', subt: L(null, 'Extra cheese', 'チーズ追加', 'Queijo extra'), precio: 100 },
      { sku: 'extra-helado-vainilla', nombre: 'Extra Helado de Vainilla', subt: L(null, 'Extra vanilla ice cream', 'バニラアイス追加', 'Sorvete de baunilha extra'), precio: 150 },
    ],
  },
];

// Índice plano sku -> item, útil para el carrito
const MENU_INDEX = (() => {
  const idx = {};
  MENU_CATEGORIES.forEach((cat) => {
    (cat.items || []).forEach((it) => (idx[it.sku] = it));
    (cat.extras || []).forEach((it) => (idx[it.sku] = it));
  });
  return idx;
})();

// Devuelve el texto de un campo i18n {es,en,ja,pt} en el idioma actual.
// Sin fallback entre idiomas: un valor "null" es intencional (p.ej. el nombre del
// item ya está en ese idioma, así que el subtítulo no hace falta).
function mi(field) {
  if (!field) return '';
  const lang = (typeof I18n !== 'undefined' && I18n.lang) || 'es';
  return field[lang] || '';
}
