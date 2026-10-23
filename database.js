/* The Cryptic Club — base de datos simulada.
 * Campos:
 *  id        identificador único
 *  fecha     día de publicación (YYYY-MM-DD, hora de Madrid)
 *  pista     texto de la pista
 *  longitud  número de letras de la respuesta
 *  respuesta solución (sin espacios; acentos permitidos, se normalizan)
 *  tipo      'comunidad' | 'ia'
 *  capas     (solo 'ia') { semantica, estructura }
 */
const PUZZLES = [
  {
    id: 'p-001',
    fecha: '2026-10-22',
    pista: 'Me miras y me ves, pero nunca me tocas.',
    longitud: 6,
    respuesta: 'ESPEJO',
    tipo: 'comunidad'
  },
  {
    id: 'p-002',
    fecha: '2026-10-23',
    pista: 'Sin pies camino, sin boca marco las horas.',
    longitud: 5,
    respuesta: 'RELOJ',
    tipo: 'ia',
    capas: {
      semantica: 'Objeto doméstico que indica la hora del día.',
      estructura: 'Cinco letras. Empieza por R y termina en J.'
    }
  },
  {
    id: 'p-003',
    fecha: '2026-10-24',
    pista: 'Te sigue a todas partes, pero solo aparece cuando hay luz.',
    longitud: 6,
    respuesta: 'SOMBRA',
    tipo: 'comunidad'
  }
];
