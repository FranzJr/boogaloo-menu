/* Menú Boogaloo — estructurado a partir de "Menu Boogaloo.pdf"
   Cada item tiene un sku único: DEBE coincidir exactamente con MENU en apps-script/Code.gs,
   porque el precio final del pedido se calcula (y se confía) en el backend, no en el navegador. */

const MENU_CATEGORIES = [
  {
    id: 'arepas',
    icon: 'arepa',
    nombre: 'Arepas',
    subt: 'アレパ',
    items: [
      {
        sku: 'arepa-cheese',
        nombre: 'Arepa Cheese',
        subt: 'チーズアレパ · Cheese Arepa',
        desc: 'Arepa colombiana rellena de queso fundido.',
        precio: 350,
      },
      {
        sku: 'arepa-carne',
        nombre: 'Arepa Carne',
        subt: 'ビーフアレパ · Beef Arepa',
        desc: 'Arepa colombiana rellena de carne de res deshilachada, cocinada lentamente con cebolla, ajo, tomate y pimentón, cubierta con queso.',
        precio: 1050,
      },
      {
        sku: 'arepa-pollo',
        nombre: 'Arepa Pollo',
        subt: 'チキンアレパ · Chicken Arepa',
        desc: 'Arepa colombiana rellena de pollo deshilachado, cocinado lentamente con cebolla, ajo, tomate y pimentón, cubierta con queso.',
        precio: 950,
      },
      {
        sku: 'arepa-chorizo',
        nombre: 'Arepa con Chorizo',
        subt: 'チョリソーアレパ · Chorizo Arepa',
        desc: 'Arepa colombiana rellena de queso fundido y chorizo a la parrilla.',
        precio: 850,
      },
    ],
  },
  {
    id: 'empanadas',
    icon: 'empanada',
    nombre: 'Empanadas',
    subt: 'エンパナーダ',
    nota: 'Todas las empanadas vienen con ají casero y guacamole fresco.',
    items: [
      {
        sku: 'empanada-carne',
        nombre: 'Empanada de Carne',
        subt: '牛ひき肉のエンパナーダ · Beef Empanada',
        desc: 'Carne molida cocinada en hogao (tomate, cebolla y cebolla larga).',
        precio: 600,
      },
      {
        sku: 'empanada-pollo-queso',
        nombre: 'Empanada de Pollo con Queso',
        subt: '鶏肉とチーズのエンパナーダ · Chicken & Cheese Empanada',
        desc: 'Pollo desmechado cocinado en hogao colombiano, mezclado con queso mozzarella fundido.',
        precio: 600,
      },
    ],
  },
  {
    id: 'platano',
    icon: 'platano',
    nombre: 'Plátano Maduro',
    subt: 'プラタノ マドゥーロ',
    items: [
      {
        sku: 'maduro-queso-bocadillo',
        nombre: 'Maduro con Queso y Bocadillo',
        subt: 'チーズとグアバペーストの焼きプラタノ',
        desc: 'Plátano maduro entero horneado con queso fundido y bocadillo de guayaba. Perfecto para compartir.',
        precio: 800,
      },
      {
        sku: 'aborrajado',
        nombre: 'Aborrajado con Queso y Bocadillo',
        subt: 'プラタノのチーズ&グアバペースト揚げ',
        desc: 'Plátano maduro relleno de queso y bocadillo de guayaba, cubierto con una ligera masa y frito.',
        precio: 500,
      },
    ],
  },
  {
    id: 'postres',
    icon: 'postre',
    nombre: 'Postres y Obleas',
    subt: 'デザート',
    items: [
      {
        sku: 'ensalada-frutas',
        nombre: 'Ensalada de Frutas Premium',
        subt: 'コロンビア風フルーツサラダ',
        desc: 'Frutas de temporada, queso, crema, menta, oblea y almíbar casero.',
        precio: 1850,
      },
      {
        sku: 'oblea-traditional',
        nombre: 'Oblea Traditional',
        subt: 'オブレア · Arequipe + crema + queso',
        desc: 'Oblea colombiana con arequipe, crema fresca y queso.',
        precio: 950,
      },
      {
        sku: 'oblea-berry',
        nombre: 'Berry Oblea',
        subt: 'オブレアベリーズ',
        desc: 'Oblea con arequipe, crema fresca, queso y mermelada de frutos rojos.',
        precio: 950,
      },
      {
        sku: 'oblea-special',
        nombre: 'Boogaloo Special Oblea',
        subt: 'オブレア・スペシャル',
        desc: 'Arequipe, crema fresca, queso, mermelada de frutos rojos y banano o fresa.',
        precio: 950,
      },
      {
        sku: 'postre-alfajor',
        nombre: 'Alfajor de Arequipe',
        subt: '季節のデザート · Postre ocasional',
        desc: 'Postre ocasional de temporada.',
        precio: 600,
      },
      {
        sku: 'postre-brownie',
        nombre: 'Brownie de Arequipe',
        subt: '季節のデザート · Postre ocasional',
        desc: 'Postre ocasional de temporada.',
        precio: 600,
      },
      {
        sku: 'postre-milhojas',
        nombre: 'Milhojas de Arequipe',
        subt: '季節のデザート · Postre ocasional',
        desc: 'Postre ocasional de temporada.',
        precio: 600,
      },
    ],
  },
  {
    id: 'jugos',
    icon: 'jugo',
    nombre: 'Jugos Naturales',
    subt: 'Fresh Juices',
    items: [
      { sku: 'jugo-mango-agua-12', nombre: 'Jugo de Mango (Agua) 12oz', subt: 'Mango Juice · Water', precio: 500 },
      { sku: 'jugo-mango-agua-16', nombre: 'Jugo de Mango (Agua) 16oz', subt: 'Mango Juice · Water', precio: 600 },
      { sku: 'jugo-mango-leche-12', nombre: 'Jugo de Mango (Leche) 12oz', subt: 'Mango Juice · Milk', precio: 600 },
      { sku: 'jugo-mango-leche-16', nombre: 'Jugo de Mango (Leche) 16oz', subt: 'Mango Juice · Milk', precio: 700 },
      { sku: 'jugo-fresa-agua-12', nombre: 'Jugo de Fresa (Agua) 12oz', subt: 'Strawberry Juice · Water', precio: 500 },
      { sku: 'jugo-fresa-agua-16', nombre: 'Jugo de Fresa (Agua) 16oz', subt: 'Strawberry Juice · Water', precio: 600 },
      { sku: 'jugo-fresa-leche-12', nombre: 'Jugo de Fresa (Leche) 12oz', subt: 'Strawberry Juice · Milk', precio: 600 },
      { sku: 'jugo-fresa-leche-16', nombre: 'Jugo de Fresa (Leche) 16oz', subt: 'Strawberry Juice · Milk', precio: 700 },
      { sku: 'te-frutos-rojos-frio', nombre: 'Iced Berry Tea', subt: 'Té de Frutos Rojos frío', precio: 500 },
      { sku: 'panela-limon', nombre: 'Agua de Panela con Limón', subt: 'Lemon & panela', precio: 500 },
    ],
  },
  {
    id: 'cafe',
    icon: 'cafe',
    nombre: 'Café y Bebidas Calientes',
    subt: 'Coffee & Hot Drinks',
    items: [
      { sku: 'te-frutos-rojos-caliente-8', nombre: 'Hot Berry Tea 8oz', precio: 400 },
      { sku: 'te-frutos-rojos-caliente-12', nombre: 'Hot Berry Tea 12oz', precio: 500 },
      { sku: 'capuccino-8', nombre: 'Capuccino 8oz', subt: 'Hot / Iced', precio: 550 },
      { sku: 'capuccino-12', nombre: 'Capuccino 12oz', subt: 'Hot / Iced', precio: 650 },
      { sku: 'mocha-8', nombre: 'Mocha 8oz', subt: 'Hot / Iced', precio: 600 },
      { sku: 'mocha-12', nombre: 'Mocha 12oz', subt: 'Hot / Iced', precio: 700 },
      { sku: 'latte-8', nombre: 'Café Latte 8oz', subt: 'Hot / Iced', precio: 550 },
      { sku: 'latte-12', nombre: 'Café Latte 12oz', subt: 'Hot / Iced', precio: 650 },
      { sku: 'tinto-8', nombre: 'Tinto 8oz', subt: 'Colombian Black Coffee', precio: 400 },
      { sku: 'tinto-12', nombre: 'Tinto 12oz', subt: 'Colombian Black Coffee', precio: 500 },
      { sku: 'americano-8', nombre: 'Americano 8oz', precio: 450 },
      { sku: 'americano-12', nombre: 'Americano 12oz', precio: 550 },
    ],
    extras: [
      { sku: 'topping-caramelo', nombre: 'Topping Caramelo', precio: 100 },
      { sku: 'topping-chocolate', nombre: 'Topping Chocolate', precio: 100 },
      { sku: 'topping-helado', nombre: 'Topping Helado', precio: 150 },
    ],
  },
  {
    id: 'otros',
    icon: 'otros',
    nombre: 'Otros',
    subt: 'Others',
    items: [
      { sku: 'ensalada-verde', nombre: 'Ensalada Verde', subt: 'Green Salad', desc: 'Mezcla de lechugas, tomate, cebolla encurtida y vegetales frescos.', precio: 300 },
      { sku: 'guacamole', nombre: 'Guacamole Casero', subt: 'Homemade Guacamole', precio: 300 },
      { sku: 'caldo-costilla', nombre: 'Caldo de Costilla', subt: 'Traditional Colombian Beef Rib Soup', precio: 300 },
    ],
    extras: [
      { sku: 'extra-queso', nombre: 'Extra Queso', precio: 100 },
      { sku: 'extra-helado-vainilla', nombre: 'Extra Helado de Vainilla', precio: 150 },
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
