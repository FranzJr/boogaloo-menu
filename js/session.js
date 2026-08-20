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

  isColaborador() {
    return !!(this.data && this.data.tipo === 'cliente' && this.data.rol === 'colaborador');
  },

  // true si ya sabemos quién es (cliente con cuenta, o invitado que ya dio su nombre antes).
  // Sirve para no volver a pedir los datos en cada pedido nuevo del mismo dispositivo.
  hasIdentity() {
    return !!(this.data && (this.data.tipo === 'cliente' || this.data.nombre));
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
      rol: cliente.rol || 'cliente',
    });
  },
};

Session.load();
