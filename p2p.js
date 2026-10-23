/* The Cryptic Club — p2p.js
 * Capa de red del Modo 1v1 con PeerJS (WebRTC). Solo gestiona conexión y mensajes.
 * La partida viaja directamente entre navegadores. PeerJS usa su servidor de señalización
 * público para el handshake inicial; no hay backend propio. */
const P2P = (() => {
  'use strict';

  const PREFIX = 'tcc-';
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let peer = null;
  let conn = null;
  let cb = {};

  const genCodigo = () =>
    Array.from({ length: 4 }, () => ALPHA[Math.floor(Math.random() * ALPHA.length)]).join('');
  const disponible = () => typeof window.Peer === 'function';

  function cerrar() {
    cb = {}; // evita disparar callbacks al cerrar nosotros
    try { conn && conn.close(); } catch (_) {}
    try { peer && peer.destroy(); } catch (_) {}
    conn = null;
    peer = null;
  }

  function vincular(c, callbacks) {
    conn = c;
    const avisar = () => callbacks.onEstado && callbacks.onEstado('Rival conectado', true);
    if (c.open) avisar(); else c.on('open', avisar);
    c.on('data', (m) => callbacks.onMensaje && callbacks.onMensaje(m));
    c.on('close', () => { conn = null; callbacks.onCerrado && callbacks.onCerrado(); });
    c.on('error', () => callbacks.onError && callbacks.onError('Error en la conexión.'));
  }

  function crear(callbacks, intento = 0) {
    cerrar();
    cb = callbacks || {};
    if (!disponible()) return cb.onError && cb.onError('No se pudo cargar PeerJS. Revisa tu conexión.');

    const code = genCodigo();
    peer = new Peer(PREFIX + code);
    peer.on('open', () => {
      cb.onCodigo && cb.onCodigo(code);
      cb.onEstado && cb.onEstado('Sala creada. Esperando a tu rival…', false);
    });
    peer.on('connection', (c) => {
      if (conn) { c.close(); return; }      // solo un rival por sala
      vincular(c, cb);
    });
    peer.on('error', (e) => {
      if (e.type === 'unavailable-id' && intento < 3) return crear(callbacks, intento + 1);
      cb.onError && cb.onError('No se pudo crear la sala. Inténtalo de nuevo.');
    });
  }

  function unirse(codigo, callbacks) {
    cerrar();
    cb = callbacks || {};
    if (!disponible()) return cb.onError && cb.onError('No se pudo cargar PeerJS. Revisa tu conexión.');

    peer = new Peer();
    peer.on('open', () => {
      const c = peer.connect(PREFIX + codigo, { reliable: true });
      vincular(c, cb);
      cb.onEstado && cb.onEstado('Conectando…', false);
    });
    peer.on('error', (e) => {
      cb.onError && cb.onError(e.type === 'peer-unavailable'
        ? 'No existe ninguna sala con ese código.'
        : 'No se pudo conectar con la sala.');
    });
  }

  function enviar(msg) {
    if (conn && conn.open) conn.send(msg);
  }

  return { crear, unirse, enviar, cerrar };
})();
