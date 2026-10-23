/* The Cryptic Club — generator.js
 * Motor procedural determinista: la misma semilla produce siempre el mismo críptico.
 * Combina palabras objetivo, definiciones (sinónimos) e indicadores de anagrama,
 * inversión y charada. No hace scraping: todo el material vive en este archivo. */

const WORD_BANK = [
  { p: 'AMOR',    d: ['sentimiento intenso', 'afecto profundo'] },
  { p: 'ROSA',    d: ['flor espinosa', 'flor de jardín'] },
  { p: 'LUNA',    d: ['satélite de la Tierra', 'astro nocturno'] },
  { p: 'MAR',     d: ['masa de agua salada', 'océano menor'] },
  { p: 'TORO',    d: ['animal de cuernos', 'bovino bravo'] },
  { p: 'CASA',    d: ['vivienda familiar', 'hogar propio'] },
  { p: 'NUBE',    d: ['masa blanca del cielo', 'vapor suspendido'] },
  { p: 'LIBRO',   d: ['volumen de páginas', 'obra escrita'] },
  { p: 'VIENTO',  d: ['aire en movimiento', 'brisa fuerte'] },
  { p: 'FUEGO',   d: ['llama ardiente', 'calor intenso'] },
  { p: 'PLATO',   d: ['vajilla para servir', 'recipiente de comida'] },
  { p: 'PERRO',   d: ['fiel compañero', 'can doméstico'] },
  { p: 'NIDO',    d: ['hogar de un pájaro', 'refugio de aves'] },
  { p: 'CALLE',   d: ['vía urbana', 'camino entre edificios'] },
  { p: 'PAPEL',   d: ['hoja para escribir', 'soporte de tinta'] },
  { p: 'ARENA',   d: ['granos de la playa', 'material de reloj de sol'] }
];

const INDICADORES = {
  anagrama: ['desordenado', 'revuelto', 'mezclado', 'roto', 'loco'],
  inversion: ['al revés', 'hacia atrás', 'en espejo'],
  charada: ['con']
};

function hashSemilla(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function generadorAleatorio(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function GeneradorProceduralIA(semilla) {
  const clave = String(semilla);
  const r = generadorAleatorio(hashSemilla(clave));
  const elegir = (arr) => arr[Math.floor(r() * arr.length)];
  const capitalizar = (s) => s.charAt(0) + s.slice(1).toLowerCase();
  const mezclar = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const entrada = elegir(WORD_BANK);
  const W = entrada.p;
  const def = elegir(entrada.d);
  const tipo = elegir(['anagrama', 'inversion', 'charada']);

  let pista;
  let desglose;
  let dificultad = 'medio';

  if (tipo === 'anagrama') {
    let mezcla = W;
    for (let i = 0; i < 20 && mezcla === W; i++) mezcla = mezclar(W.split('')).join('');
    const ind = elegir(INDICADORES.anagrama);
    const mat = capitalizar(mezcla);
    pista = `${mat} ${ind}, ${def}`;
    desglose = { definicion: def, indicador: ind, material: mat };
    dificultad = 'facil';
  } else if (tipo === 'inversion') {
    const ind = elegir(INDICADORES.inversion);
    const mat = capitalizar(W.split('').reverse().join(''));
    pista = `${mat} ${ind}, ${def}`;
    desglose = { definicion: def, indicador: ind, material: mat };
    dificultad = 'facil';
  } else {
    const k = 2 + Math.floor(r() * (W.length - 3));
    const a = W.slice(0, k);
    const b = W.slice(k).toLowerCase();
    const ind = INDICADORES.charada[0];
    pista = `${capitalizar(a)} ${ind} ${b}, ${def}`;
    desglose = { definicion: def, indicador: ind, material: capitalizar(a) };
  }

  return {
    id: `gen-${clave}`,
    fecha: clave,
    pista,
    longitud: W.length,
    respuesta: W,
    tipo: 'ia',
    dificultad,
    desglose,
    capas: {
      semantica: `Se define como: ${def}.`,
      estructura: `${W.length} letras. Empieza por ${W[0]} y termina en ${W[W.length - 1]}.`
    },
    generado: true
  };
}
