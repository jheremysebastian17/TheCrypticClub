/* The Cryptic Club — generator.js
 * Motor determinista: la misma semilla produce siempre el mismo críptico.
 * Cada entrada del banco es un juego de palabras real y comprobable (generator.test.js lo verifica):
 *   anagrama  → las letras de `m` reordenadas dan `r`
 *   inversion → `m` leída al revés da `r`
 *   oculta    → `r` aparece escondida entre las palabras de `m`
 *   charada   → las dos palabras de `m` unidas dan `r`
 * `r` = respuesta (sin tildes), `d` = definición, `m` = material de la pista.
 * Ojo: añadir o quitar entradas cambia qué críptico toca cada día generado. */

const BANCO = [
  // --- Anagramas ---
  { t: 'anagrama', r: 'MORA', m: 'Ramo', d: 'fruto del zarzal' },
  { t: 'anagrama', r: 'ASCO', m: 'Saco', d: 'repugnancia' },
  { t: 'anagrama', r: 'CARNE', m: 'Nacer', d: 'alimento del carnívoro' },
  { t: 'anagrama', r: 'CEDRO', m: 'Cerdo', d: 'árbol de madera aromática' },
  { t: 'anagrama', r: 'PARIS', m: 'Prisa', d: 'capital de Francia' },
  { t: 'anagrama', r: 'SERGIO', m: 'Riesgo', d: 'nombre de varón' },
  { t: 'anagrama', r: 'JAMON', m: 'Monja', d: 'manjar curado del cerdo' },
  { t: 'anagrama', r: 'IGNORANTE', m: 'Argentino', d: 'que nada sabe' },
  { t: 'anagrama', r: 'JAPONES', m: 'Esponja', d: 'natural de Tokio' },
  { t: 'anagrama', r: 'FRESA', m: 'Frase', d: 'fruta roja de primavera' },
  { t: 'anagrama', r: 'ALGO', m: 'Lago', d: 'un poco' },
  { t: 'anagrama', r: 'NORMA', m: 'Ramón', d: 'regla' },
  { t: 'anagrama', r: 'PANEL', m: 'Nepal', d: 'tablero' },
  { t: 'anagrama', r: 'ALVARO', m: 'Valora', d: 'nombre de pila masculino' },
  { t: 'anagrama', r: 'CORTA', m: 'Actor', d: 'de poca longitud' },
  { t: 'anagrama', r: 'COBRA', m: 'Barco', d: 'serpiente venenosa' },
  { t: 'anagrama', r: 'TOSCA', m: 'Costa', d: 'ópera de Puccini' },
  { t: 'anagrama', r: 'MARTA', m: 'Trama', d: 'nombre de mujer' },
  { t: 'anagrama', r: 'LIDERA', m: 'Delira', d: 'va en cabeza' },
  { t: 'anagrama', r: 'PENSAR', m: 'Prensa', d: 'usar la cabeza' },
  { t: 'anagrama', r: 'ESTAR', m: 'Resta', d: 'hallarse' },
  { t: 'anagrama', r: 'MONICA', m: 'Camino', d: 'nombre femenino' },
  { t: 'anagrama', r: 'PARO', m: 'Ropa', d: 'desempleo' },
  { t: 'anagrama', r: 'CORTES', m: 'Sector', d: 'parlamento español' },
  { t: 'anagrama', r: 'MARIANO', m: 'Armonía', d: 'nombre masculino' },
  { t: 'anagrama', r: 'QUIEREN', m: 'Enrique', d: 'desean' },
  { t: 'anagrama', r: 'EDUCARON', m: 'Cuaderno', d: 'enseñaron' },
  { t: 'anagrama', r: 'ESTERA', m: 'Teresa', d: 'alfombra de esparto' },
  { t: 'anagrama', r: 'ALERGIA', m: 'Alegría', d: 'reacción al polen' },
  { t: 'anagrama', r: 'PEDRO', m: 'Poder', d: 'nombre de apóstol' },
  { t: 'anagrama', r: 'ARMA', m: 'Rama', d: 'pistola o espada' },
  { t: 'anagrama', r: 'LIRAS', m: 'Salir', d: 'antiguas monedas italianas' },
  { t: 'anagrama', r: 'MOLA', m: 'Loma', d: 'gusta, coloquialmente' },
  { t: 'anagrama', r: 'HINCA', m: 'China', d: 'clava' },
  { t: 'anagrama', r: 'NILO', m: 'Lino', d: 'río de Egipto' },
  { t: 'anagrama', r: 'RADIO', m: 'Odiar', d: 'aparato de ondas' },
  { t: 'anagrama', r: 'LISA', m: 'Isla', d: 'sin arrugas' },
  { t: 'anagrama', r: 'VENA', m: 'Nave', d: 'vaso sanguíneo' },
  { t: 'anagrama', r: 'RAPTO', m: 'Tropa', d: 'secuestro' },
  { t: 'anagrama', r: 'OCRE', m: 'Cero', d: 'color terroso' },
  { t: 'anagrama', r: 'SANO', m: 'Asno', d: 'con buena salud' },
  { t: 'anagrama', r: 'MIRA', m: 'Rima', d: 'observa' },
  { t: 'anagrama', r: 'COSTAR', m: 'Castor', d: 'valer' },

  // --- Inversiones ---
  { t: 'inversion', r: 'ROMA', m: 'Amor', d: 'ciudad eterna' },
  { t: 'inversion', r: 'NADA', m: 'Adán', d: 'ninguna cosa' },
  { t: 'inversion', r: 'LAMINA', m: 'Animal', d: 'plancha delgada' },
  { t: 'inversion', r: 'ZORRA', m: 'Arroz', d: 'raposa' },
  { t: 'inversion', r: 'LOS', m: 'Sol', d: 'artículo plural' },
  { t: 'inversion', r: 'RATA', m: 'Atar', d: 'roedor de alcantarilla' },
  { t: 'inversion', r: 'OIDO', m: 'Odio', d: 'sentido de la música' },
  { t: 'inversion', r: 'RARO', m: 'Orar', d: 'poco común' },
  { t: 'inversion', r: 'EVA', m: 'Ave', d: 'primera mujer' },
  { t: 'inversion', r: 'SACO', m: 'Ocas', d: 'bolsa grande' },
  { t: 'inversion', r: 'ANIMA', m: 'Amina', d: 'da ánimos' },
  { t: 'inversion', r: 'AVAL', m: 'Lava', d: 'garantía' },
  { t: 'inversion', r: 'AZAR', m: 'Raza', d: 'casualidad' },
  { t: 'inversion', r: 'ATLAS', m: 'Salta', d: 'libro de mapas' },
  { t: 'inversion', r: 'RATON', m: 'Notar', d: 'roedor pequeño' },
  { t: 'inversion', r: 'RASO', m: 'Osar', d: 'tela brillante' },
  { t: 'inversion', r: 'ARES', m: 'Será', d: 'dios griego de la guerra' },
  { t: 'inversion', r: 'SON', m: 'Nos', d: 'ritmo cubano' },
  { t: 'inversion', r: 'AMAR', m: 'Rama', d: 'querer' },
  { t: 'inversion', r: 'ARO', m: 'Ora', d: 'anillo' },
  { t: 'inversion', r: 'DUAL', m: 'Laúd', d: 'doble' },
  { t: 'inversion', r: 'ASIR', m: 'Risa', d: 'agarrar' },
  { t: 'inversion', r: 'ATINA', m: 'Anita', d: 'acierta' },
  { t: 'inversion', r: 'ERES', m: 'Seré', d: 'segunda persona de ser' },

  // --- Palabras ocultas ---
  { t: 'oculta', r: 'CASA', m: 'poca sal', d: 'vivienda' },
  { t: 'oculta', r: 'MESA', m: 'come sandía', d: 'mueble de comedor' },
  { t: 'oculta', r: 'PERRO', m: 'súper rojo', d: 'mejor amigo del hombre' },
  { t: 'oculta', r: 'NIDO', m: 'sin ídolos', d: 'hogar de pájaros' },
  { t: 'oculta', r: 'TELA', m: 'siete lagos', d: 'tejido' },
  { t: 'oculta', r: 'SOL', m: 'paso largo', d: 'estrella cercana' },
  { t: 'oculta', r: 'PATO', m: 'mapa torcido', d: 'ave de estanque' },
  { t: 'oculta', r: 'RISA', m: 'abrí salas', d: 'carcajada' },
  { t: 'oculta', r: 'VINO', m: 'alevín osado', d: 'bebida de uva' },
  { t: 'oculta', r: 'CAMA', m: 'poca madera', d: 'mueble para dormir' },
  { t: 'oculta', r: 'DEDO', m: 'desde donde', d: 'parte de la mano' },
  { t: 'oculta', r: 'LAGO', m: 'sala gótica', d: 'agua rodeada de tierra' },
  { t: 'oculta', r: 'MANO', m: 'toma nota', d: 'extremidad con cinco dedos' },
  { t: 'oculta', r: 'PELO', m: 'golpe loco', d: 'cabello' },
  { t: 'oculta', r: 'CENA', m: 'hace nada', d: 'última comida del día' },
  { t: 'oculta', r: 'ARTE', m: 'comprar tela', d: 'pintura o escultura' },
  { t: 'oculta', r: 'SOPA', m: 'paso pausado', d: 'plato de cuchara' },
  { t: 'oculta', r: 'RAMA', m: 'mirar a María', d: 'brazo de un árbol' },
  { t: 'oculta', r: 'OSO', m: 'caso sonado', d: 'plantígrado' },
  { t: 'oculta', r: 'PAN', m: 'mapa nuevo', d: 'alimento de horno' },
  { t: 'oculta', r: 'CARA', m: 'poca razón', d: 'rostro' },
  { t: 'oculta', r: 'BOCA', m: 'lobo cansado', d: 'por donde se come' },
  { t: 'oculta', r: 'COPA', m: 'poco pan', d: 'trofeo' },
  { t: 'oculta', r: 'PINO', m: 'pin oficial', d: 'árbol de piñas' },
  { t: 'oculta', r: 'MIEL', m: 'mi elefante', d: 'dulce de abejas' },
  { t: 'oculta', r: 'ISLA', m: 'país latino', d: 'tierra rodeada de mar' },
  { t: 'oculta', r: 'PESO', m: 'golpe sonoro', d: 'lo que marca la báscula' },
  { t: 'oculta', r: 'CIELO', m: 'especie loca', d: 'donde están las nubes' },
  { t: 'oculta', r: 'VERDE', m: 'volver despacio', d: 'color de la hierba' },
  { t: 'oculta', r: 'NOCHE', m: 'sin ochenta', d: 'cuando sale la luna' },
  { t: 'oculta', r: 'TARDE', m: 'estar dentro', d: 'después del mediodía' },
  { t: 'oculta', r: 'MONO', m: 'como nosotros', d: 'primate' },
  { t: 'oculta', r: 'RANA', m: 'llamar a nadie', d: 'anfibio saltarín' },
  { t: 'oculta', r: 'PERA', m: 'súper amigo', d: 'fruta de agua' },
  { t: 'oculta', r: 'UVA', m: 'tu vaso', d: 'fruto de la vid' },
  { t: 'oculta', r: 'GOTA', m: 'mango tailandés', d: 'partícula de lluvia' },
  { t: 'oculta', r: 'DATO', m: 'nada tóxico', d: 'información concreta' },
  { t: 'oculta', r: 'MAPA', m: 'goma pasada', d: 'plano geográfico' },
  { t: 'oculta', r: 'TAZA', m: 'esta zanja', d: 'recipiente para el café' },

  // --- Charadas ---
  { t: 'charada', r: 'SOLDADO', m: ['Sol', 'dado'], d: 'militar' },
  { t: 'charada', r: 'PASAPORTE', m: ['Pasa', 'porte'], d: 'documento de viaje' },
  { t: 'charada', r: 'GIRASOL', m: ['Gira', 'sol'], d: 'flor que mira al astro' },
  { t: 'charada', r: 'MALETA', m: ['Mal', 'eta'], d: 'equipaje' },
  { t: 'charada', r: 'CAMALEON', m: ['Cama', 'león'], d: 'reptil que cambia de color' },
  { t: 'charada', r: 'MEDIANOCHE', m: ['Media', 'noche'], d: 'las doce' },
  { t: 'charada', r: 'BOCACALLE', m: ['Boca', 'calle'], d: 'entrada de una vía' },
  { t: 'charada', r: 'SOBREMESA', m: ['Sobre', 'mesa'], d: 'charla tras la comida' },
  { t: 'charada', r: 'SALVAVIDAS', m: ['Salva', 'vidas'], d: 'flotador' },
  { t: 'charada', r: 'PASAMANOS', m: ['Pasa', 'manos'], d: 'barandilla' },
  { t: 'charada', r: 'PANTALON', m: ['Pan', 'talón'], d: 'prenda con perneras' },
  { t: 'charada', r: 'CARACOL', m: ['Cara', 'col'], d: 'molusco con la casa a cuestas' },
  { t: 'charada', r: 'ALTAVOZ', m: ['Alta', 'voz'], d: 'amplificador de sonido' },
  { t: 'charada', r: 'AGUACERO', m: ['Agua', 'cero'], d: 'lluvia intensa' },
  { t: 'charada', r: 'PUNTAPIE', m: ['Punta', 'pie'], d: 'patada' },
  { t: 'charada', r: 'BAJAMAR', m: ['Baja', 'mar'], d: 'marea en retirada' },
  { t: 'charada', r: 'RASCACIELOS', m: ['Rasca', 'cielos'], d: 'edificio altísimo' },
  { t: 'charada', r: 'SACAPUNTAS', m: ['Saca', 'puntas'], d: 'afilador de lápices' },
  { t: 'charada', r: 'MANIOBRA', m: ['Maní', 'obra'], d: 'operación delicada' },
  { t: 'charada', r: 'PARQUE', m: ['Par', 'que'], d: 'jardín público' },
  { t: 'charada', r: 'ARCOIRIS', m: ['Arco', 'iris'], d: 'siete colores tras la lluvia' },
  { t: 'charada', r: 'SINFIN', m: ['Sin', 'fin'], d: 'infinidad' },
  { t: 'charada', r: 'HIERBABUENA', m: ['Hierba', 'buena'], d: 'menta del mojito' },
  { t: 'charada', r: 'MILAGRO', m: ['Mil', 'agro'], d: 'prodigio' },
  { t: 'charada', r: 'PARASOL', m: ['Para', 'sol'], d: 'sombrilla' },
  { t: 'charada', r: 'LAVAMANOS', m: ['Lava', 'manos'], d: 'pila pequeña' },
  { t: 'charada', r: 'DIAMANTE', m: ['Di', 'amante'], d: 'piedra preciosa' },
  { t: 'charada', r: 'SOLEDAD', m: ['Sol', 'edad'], d: 'falta de compañía' },
  { t: 'charada', r: 'MARTES', m: ['Mar', 'tés'], d: 'día de la semana' },
  { t: 'charada', r: 'TOMATE', m: ['Toma', 'te'], d: 'fruto rojo de ensalada' },
  { t: 'charada', r: 'CAMAROTE', m: ['Cama', 'rote'], d: 'dormitorio de barco' },
  { t: 'charada', r: 'ALACENA', m: ['Ala', 'cena'], d: 'armario de cocina' },
  { t: 'charada', r: 'VERDAD', m: ['Ver', 'dad'], d: 'lo contrario de mentira' },
  { t: 'charada', r: 'SINCERO', m: ['Sin', 'cero'], d: 'franco' },
  { t: 'charada', r: 'MALDAD', m: ['Mal', 'dad'], d: 'perversidad' },
  { t: 'charada', r: 'CANDADO', m: ['Can', 'dado'], d: 'cerradura portátil' },
  { t: 'charada', r: 'CANTINA', m: ['Can', 'tina'], d: 'bar de estación' },
  { t: 'charada', r: 'PANERA', m: ['Pan', 'era'], d: 'donde se guardan las barras' },
  { t: 'charada', r: 'SOLERA', m: ['Sol', 'era'], d: 'vejez noble de un vino' },
  { t: 'charada', r: 'ARMADURA', m: ['Arma', 'dura'], d: 'protección de caballero' },
  { t: 'charada', r: 'ARMARIO', m: ['Arma', 'río'], d: 'mueble para la ropa' },
  { t: 'charada', r: 'CASAMIENTO', m: ['Casa', 'miento'], d: 'boda' },
  { t: 'charada', r: 'PARACAIDAS', m: ['Para', 'caídas'], d: 'frena al que salta del avión' },
  { t: 'charada', r: 'PARABRISAS', m: ['Para', 'brisas'], d: 'cristal delantero del coche' },
  { t: 'charada', r: 'SOBRETODO', m: ['Sobre', 'todo'], d: 'abrigo largo' },
  { t: 'charada', r: 'BIENVENIDA', m: ['Bien', 'venida'], d: 'saludo de llegada' },
  { t: 'charada', r: 'MALESTAR', m: ['Mal', 'estar'], d: 'incomodidad' },
  { t: 'charada', r: 'MEDIODIA', m: ['Medio', 'día'], d: 'las doce con sol' }
];

// Indicadores invariables en género y número, para que concuerden con cualquier material.
const INDICADORES = {
  anagrama: ['en desorden', 'patas arriba', 'en otro orden', 'con las letras bailando', 'tras un terremoto'],
  inversion: ['al revés', 'hacia atrás', 'de vuelta', 'en el espejo'],
  oculta: ['Dentro de', 'Se esconde en', 'Entre las letras de', 'En el interior de'],
  charada: ['y', 'seguido de', 'junto a', 'más']
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

// Orden fijo y barajado del banco: mezcla los mecanismos y garantiza que un críptico
// no se repite hasta haber pasado por todos los demás.
const ORDEN_BANCO = (() => {
  const r = generadorAleatorio(hashSemilla('the-cryptic-club'));
  const orden = BANCO.map((_, i) => i);
  for (let i = orden.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [orden[i], orden[j]] = [orden[j], orden[i]];
  }
  return orden;
})();

const EPOCA_BANCO = Date.UTC(2026, 9, 20);

function indiceBanco(clave) {
  const n = BANCO.length;
  let pos;
  const fecha = /^(\d{4})-(\d{2})-(\d{2})$/.exec(clave);
  const serie = /^(.*)-(\d+)$/.exec(clave);
  if (fecha) {
    // Reto diario: un puesto por día natural.
    pos = Math.round((Date.UTC(+fecha[1], fecha[2] - 1, +fecha[3]) - EPOCA_BANCO) / 86400000);
  } else if (serie) {
    // Series como las del 1v1 ("SALA-0", "SALA-1"...): puestos consecutivos, sin repetidos en la partida.
    pos = hashSemilla(serie[1]) + Number(serie[2]);
  } else {
    pos = hashSemilla(clave);
  }
  return ORDEN_BANCO[((pos % n) + n) % n];
}

const sinTildes = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

function GeneradorProceduralIA(semilla) {
  const clave = String(semilla);
  const r = generadorAleatorio(hashSemilla(clave));
  const elegir = (arr) => arr[Math.floor(r() * arr.length)];

  const { t: tipo, r: W, m, d: def } = BANCO[indiceBanco(clave)];
  const ind = elegir(INDICADORES[tipo]);
  let pista;
  let material;
  let explicacion;

  if (tipo === 'anagrama') {
    material = m;
    pista = `${m} ${ind}: ${def}`;
    explicacion = `Las letras de ${sinTildes(m).toUpperCase()}, reordenadas, forman ${W}.`;
  } else if (tipo === 'inversion') {
    material = m;
    pista = `${m} ${ind}: ${def}`;
    explicacion = `${sinTildes(m).toUpperCase()} leído de derecha a izquierda es ${W}.`;
  } else if (tipo === 'oculta') {
    material = m;
    pista = `${ind} «${m}»: ${def}`;
    // Marca en mayúsculas dónde está escondida la respuesta: "poCA SAl".
    const plano = sinTildes(m).toLowerCase();
    let visto = '';
    let ini = -1;
    let fin = -1;
    for (let i = 0; i < plano.length && fin < 0; i++) {
      if (!/[a-z]/.test(plano[i])) continue;
      visto += plano[i];
      if (visto.endsWith(W.toLowerCase())) fin = i;
    }
    for (let i = fin, quedan = W.length; i >= 0 && quedan > 0; i--) {
      if (/[a-z]/.test(plano[i])) { quedan--; ini = i; }
    }
    explicacion = `${W} está escondida en «${m.slice(0, ini)}${m.slice(ini, fin + 1).toUpperCase()}${m.slice(fin + 1)}».`;
  } else {
    material = m[0];
    pista = `${m[0]} ${ind} ${m[1]}: ${def}`;
    explicacion = `${sinTildes(m[0]).toUpperCase()} + ${sinTildes(m[1]).toUpperCase()} = ${W}.`;
  }

  const dificultad = W.length >= 8 ? 'dificil' : (tipo === 'inversion' || W.length <= 4 ? 'facil' : 'medio');

  return {
    id: `gen-${clave}`,
    fecha: clave,
    pista,
    longitud: W.length,
    respuesta: W,
    tipo: 'ia',
    mecanismo: tipo,
    dificultad,
    desglose: { definicion: def, indicador: ind, material },
    explicacion,
    capas: {
      semantica: `Se define como: ${def}.`,
      estructura: `${W.length} letras. Empieza por ${W[0]} y termina en ${W[W.length - 1]}.`
    },
    generado: true
  };
}
