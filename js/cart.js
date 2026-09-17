/* Carrito de compras, persistido en localStorage para que sobreviva
   entre visitas sin necesidad de iniciar sesión. */

const CART_KEY = 'boogaloo_cart_v1';

const Cart = {
  items: [], // [{ sku, cantidad }]

  load() {
    try {
      this.items = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch (e) {
      this.items = [];
    }
    return this.items;
  },

  save() {
    localStorage.setItem(CART_KEY, JSON.stringify(this.items));
  },

  add(sku, cantidad = 1, nota) {
    // Dos líneas con el mismo sku pero distinta nota (ej. Capuccino Frío vs
    // Caliente) se guardan por separado -- si se juntaran no habría forma de
    // saber cuál pidió cuál.
    const existing = this.items.find((i) => i.sku === sku && (i.nota || '') === (nota || ''));
    if (existing) {
      existing.cantidad += cantidad;
    } else {
      const item = { sku, cantidad };
      if (nota) item.nota = nota;
      this.items.push(item);
    }
    this.save();
  },

  setQty(sku, cantidad, nota) {
    if (cantidad <= 0) {
      this.remove(sku, nota);
      return;
    }
    const existing = this.items.find((i) => i.sku === sku && (i.nota || '') === (nota || ''));
    if (existing) existing.cantidad = cantidad;
    this.save();
  },

  remove(sku, nota) {
    this.items = this.items.filter((i) => !(i.sku === sku && (i.nota || '') === (nota || '')));
    this.save();
  },

  clear() {
    this.items = [];
    this.save();
  },

  count() {
    return this.items.reduce((sum, i) => sum + i.cantidad, 0);
  },

  detailedItems() {
    return this.items
      .map((i) => {
        const def = MENU_INDEX[i.sku];
        if (!def) return null;
        return {
          ...i,
          nombre: mi(def.nombre) + (i.nota ? ` (${i.nota})` : ''),
          precio: def.precio,
          subtotal: def.precio * i.cantidad,
        };
      })
      .filter(Boolean);
  },

  total() {
    return this.detailedItems().reduce((sum, i) => sum + i.subtotal, 0);
  },
};

Cart.load();
