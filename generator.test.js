/* Comprueba que cada críptico del banco es un juego de palabras válido.
 * Ejecutar con: node generator.test.js */
const assert = require('node:assert');
const fs = require('node:fs');
const vm = require('node:vm');

const ctx = vm.createContext({});
vm.runInContext(fs.readFileSync('database.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('generator.js', 'utf8'), ctx);
const BANCO = vm.runInContext('BANCO', ctx);
const PUZZLES = vm.runInContext('PUZZLES', ctx);
const generar = vm.runInContext('GeneradorProceduralIA', ctx);

// Misma normalización que app.js: sin tildes, solo letras, en mayúsculas.
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
const ordenadas = (s) => norm(s).split('').sort().join('');

// 1. Cada mecanismo se cumple de verdad.
for (const e of BANCO) {
  assert.strictEqual(e.r, norm(e.r), `${e.r}: la respuesta debe ir sin tildes y en mayúsculas`);
  if (e.t === 'anagrama') {
    assert.strictEqual(ordenadas(e.m), ordenadas(e.r), `${e.r}: "${e.m}" no es anagrama`);
    assert.notStrictEqual(norm(e.m), e.r, `${e.r}: el material es la propia respuesta`);
  } else if (e.t === 'inversion') {
    assert.strictEqual(norm(e.m).split('').reverse().join(''), e.r, `${e.r}: "${e.m}" al revés no da la respuesta`);
  } else if (e.t === 'oculta') {
    assert.ok(norm(e.m).includes(e.r), `${e.r}: no está escondida en "${e.m}"`);
    assert.ok(!e.m.split(' ').some((w) => norm(w).includes(e.r)), `${e.r}: aparece entera dentro de una sola palabra de "${e.m}"`);
  } else if (e.t === 'charada') {
    assert.strictEqual(norm(e.m[0]) + norm(e.m[1]), e.r, `${e.r}: ${e.m.join(' + ')} no forma la respuesta`);
  } else {
    assert.fail(`${e.r}: mecanismo desconocido "${e.t}"`);
  }
  assert.ok(!norm(e.d).includes(e.r), `${e.r}: la definición contiene la respuesta`);
}

// 2. Sin respuestas repetidas, ni entre sí ni con el catálogo manual.
const respuestas = BANCO.map((e) => e.r);
assert.strictEqual(new Set(respuestas).size, respuestas.length, 'hay respuestas repetidas en el banco');
const manuales = new Set(PUZZLES.map((p) => norm(p.respuesta)));
for (const r of respuestas) assert.ok(!manuales.has(r), `${r} ya existe en database.js`);

// 3. Los crípticos generados son coherentes, deterministas y no se repiten en un ciclo completo.
const dia = (n) => new Date(Date.UTC(2026, 10, 19 + n)).toISOString().slice(0, 10);
const vistos = new Set();
for (let i = 0; i < BANCO.length; i++) {
  const p = generar(dia(i));
  assert.deepStrictEqual(p, generar(dia(i)), `${dia(i)}: no es determinista`);
  assert.strictEqual(p.longitud, p.respuesta.length);
  for (const parte of Object.values(p.desglose)) assert.ok(p.pista.includes(parte), `${dia(i)}: "${parte}" no aparece en la pista`);
  assert.ok(p.explicacion.includes(p.respuesta), `${dia(i)}: explicación sin respuesta`);
  if (p.mecanismo === 'oculta') {
    // Las letras marcadas en mayúsculas dentro de «…» deben ser exactamente la respuesta.
    const marcadas = [...p.explicacion.split('«')[1]].filter((c) => c !== c.toLowerCase()).join('');
    assert.strictEqual(norm(marcadas), p.respuesta, `${dia(i)}: explicación mal marcada: ${p.explicacion}`);
  }
  assert.ok(!vistos.has(p.respuesta), `${p.respuesta} se repite antes de agotar el banco`);
  vistos.add(p.respuesta);
}

// 4. Las series del 1v1 ("SALA-0".."SALA-4") no repiten críptico dentro de una partida.
const sala = [0, 1, 2, 3, 4].map((i) => generar(`AB12-${i}`).respuesta);
assert.strictEqual(new Set(sala).size, 5, 'el 1v1 repite crípticos en una partida');

console.log(`OK: ${BANCO.length} crípticos verificados`);
