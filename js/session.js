/* Identidad del cliente en este navegador/dispositivo: invitado o cuenta registrada.
   Se guarda en localStorage para no pedir login en cada visita. */

const SESSION_KEY = 'boogaloo_session_v1';

const Session = {
  data: null,

  load() {
    try {
      this.data = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
    } catch (e) {
      this.data = null;
    }
    return this.data;
  },

  save(data) {
    this.data = data;
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  },

  clear() {
    this.data = null;
    localStorage.removeItem(SESSION_KEY);
  },

  isLoggedIn() {
    return !!(this.data && this.data.tipo === 'cliente');
  },

  ensureGuest(nombre, telefono) {
    const guestId =
      (this.data && this.data.guestId) || 'INV-' + Math.random().toString(36).slice(2, 10);
    this.save({ tipo: 'invitado', guestId, nombre, telefono });
    return this.data;
  },

  setCliente(cliente) {
    this.save({
      tipo: 'cliente',
      clienteId: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono,
      token: cliente.token,
    });
  },
};

Session.load();
