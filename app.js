/* The Cryptic Club — app.js
 * Núcleo: estado, LocalStorage, navegación, reloj de Madrid, juego, perfil y 1v1. */
(() => {
  'use strict';

  // ---------- Configuración ----------
  const STORAGE_KEY = 'the-cryptic-club:v1';
  const TZ = 'Europe/Madrid';
  const ARCHIVE_START = '2026-10-20';
  const MAX_PISTAS = 3;
  const RUSH_SECONDS = 60;
  const RUSH_GAIN_MS = 3000;
  const RUSH_LOSS_MS = 2000;
  const VS_LEN = 5;
  const VS_COUNTDOWN = 3;
  const SEEDS_TOP = [
    { n: 'Mara', p: 14 }, { n: 'Dex', p: 12 }, { n: 'Ojo', p: 9 },
    { n: 'Vela', p: 7 }, { n: 'Ion', p: 5 }
  ];
  const CATEGORIES = ['Todos', 'Progreso', 'Maestría', 'Racha', 'Velocidad', 'Secretos'];
  const DIF = { facil: 'Fácil', medio: 'Medio', dificil: 'Difícil' };
  const DIAS = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
  const MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];
  const SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  const ACHIEVEMENTS = [
    { id: 'primer-paso', cat: 'Progreso', titulo: 'Primer paso', descripcion: 'Resuelve tu primer acertijo.', key: 'resueltos', meta: 1 },
    { id: 'hilo-ariadna', cat: 'Progreso', titulo: 'Hilo de Ariadna', descripcion: 'Resuelve 10 acertijos.', key: 'resueltos', meta: 10 },
    { id: 'bibliotecario', cat: 'Progreso', titulo: 'Bibliotecario', descripcion: 'Resuelve 50 acertijos.', key: 'resueltos', meta: 50 },
    { id: 'arqueologo', cat: 'Progreso', titulo: 'Arqueólogo', descripcion: 'Resuelve 3 acertijos del Archivo.', key: 'archivoResueltos', meta: 3 },
    { id: 'voz-pueblo', cat: 'Progreso', titulo: 'Voz del pueblo', descripcion: 'Propón un acertijo a la comunidad.', key: 'propuestas', meta: 1 },
    { id: 'mente-limpia', cat: 'Maestría', titulo: 'Mente limpia', descripcion: 'Resuelve 5 sin pedir ayuda.', key: 'sinAyuda', meta: 5 },
    { id: 'ojo-halcon', cat: 'Maestría', titulo: 'Ojo de halcón', descripcion: 'Resuelve 20 sin pedir ayuda.', key: 'sinAyuda', meta: 20 },
    { id: 'cerebro-hibrido', cat: 'Maestría', titulo: 'Cerebro híbrido', descripcion: 'Resuelve 3 acertijos del IA Lab.', key: 'iaResueltos', meta: 3 },
    { id: 'doble-lectura', cat: 'Maestría', titulo: 'Doble lectura', descripcion: 'Revela la capa estructural de un acertijo IA.', key: 'capasUsadas', meta: 1 },
    { id: 'sin-titubeos', cat: 'Maestría', titulo: 'Sin titubeos', descripcion: 'Resuelve un acertijo al primer intento.', key: 'primerIntento', meta: 1 },
    { id: 'costumbre', cat: 'Racha', titulo: 'Costumbre', descripcion: 'Alcanza una racha de 3 días.', key: 'racha', meta: 3 },
    { id: 'semana-perfecta', cat: 'Racha', titulo: 'Semana perfecta', descripcion: 'Alcanza una racha de 7 días.', key: 'racha', meta: 7 },
    { id: 'fiel-club', cat: 'Racha', titulo: 'Fiel al club', descripcion: 'Alcanza una racha de 14 días.', key: 'racha', meta: 14 },
    { id: 'inquebrantable', cat: 'Racha', titulo: 'Inquebrantable', descripcion: 'Alcanza una racha de 30 días.', key: 'racha', meta: 30 },
    { id: 'primer-latido', cat: 'Velocidad', titulo: 'Primer latido', descripcion: 'Completa una partida de Contrarreloj.', key: 'rushPartidas', meta: 1 },
    { id: 'reloj-en-mano', cat: 'Velocidad', titulo: 'Reloj en mano', descripcion: 'Acierta 5 en una sola partida.', key: 'rushMejorSesion', meta: 5 },
    { id: 'cronometro-vivo', cat: 'Velocidad', titulo: 'Cronómetro vivo', descripcion: 'Acierta 10 en una sola partida.', key: 'rushMejorSesion', meta: 10 },
    { id: 'maestro-tiempo', cat: 'Velocidad', titulo: 'Maestro del tiempo', descripcion: 'Acierta 15 en una sola partida.', key: 'rushMejorSesion', meta: 15 },
    { id: 'buho', cat: 'Secretos', titulo: 'Búho', descripcion: 'Resuelve un acertijo entre las 00:00 y las 05:00 en Madrid.', key: 'nocturnos', meta: 1, secreto: true },
    { id: 'hermetico', cat: 'Secretos', titulo: 'Hermético', descripcion: 'Pide 10 ayudas en total.', key: 'ayudas', meta: 10, secreto: true },
    { id: 'fallo-honroso', cat: 'Secretos', titulo: 'Fallo honroso', descripcion: 'Falla 10 respuestas en Contrarreloj.', key: 'rushFallos', meta: 10, secreto: true },
    { id: 'club-secreto', cat: 'Secretos', titulo: 'Club secreto', descripcion: 'Abre el manual de cómo se juega.', key: 'ayudaAbierta', meta: 1, secreto: true }
  ];

  // ---------- Utilidades DOM ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const pad = (n) => String(n).padStart(2, '0');

  function el(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => {
      if (v === undefined || v === null || v === false) return;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : String(v));
    });
    children.flat().forEach((c) => {
      if (c === undefined || c === null || c === false) return;
      node.append(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return node;
  }

  let toastTimer = null;
  function showToast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-visible'), 2600);
  }

  // ---------- Texto, fechas y tiempos ----------
  const normalize = (str = '') =>
    str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z]/g, '').toUpperCase();

  const MADRID_FMT = new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });

  function madridParts(date = new Date()) {
    const p = Object.fromEntries(MADRID_FMT.formatToParts(date).map(({ type, value }) => [type, value]));
    return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second };
  }
  const keyFrom = ({ y, m, d }) => `${y}-${pad(m)}-${pad(d)}`;
  const todayKey = () => keyFrom(madridParts());

  function addDays(key, n) {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
  }
  const utcNoon = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12));
  };
  const formatDateLong = (key) => {
    const d = utcNoon(key);
    return `${DIAS[d.getUTCDay()]} ${d.getUTCDate()} DE ${MESES[d.getUTCMonth()]}`;
  };
  const formatDateShort = (key) => {
    const d = utcNoon(key);
    return `${d.getUTCDate()} de ${MESES[d.getUTCMonth()].toLowerCase()}`;
  };
  const fmtTiempo = (ms) => {
    if (ms === undefined || ms === null) return '--:--';
    const s = Math.round(ms / 1000);
    return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  };

  function madridOffsetMs(date) {
    const p = madridParts(date);
    return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s, date.getMilliseconds()) - date.getTime();
  }
  function msUntilMadridMidnight(now = new Date()) {
    const p = madridParts(now);
    const wallNext = Date.UTC(p.y, p.m - 1, p.d + 1);
    let target = wallNext - madridOffsetMs(now);
    target = wallNext - madridOffsetMs(new Date(target));
    return target - now.getTime();
  }

  // ---------- Estado y LocalStorage ----------
  const defaultState = () => ({
    perfil: { nombre: 'Jugador' },
    progreso: {},
    racha: { actual: 0, mejor: 0, ultimo: null },
    rush: { mejor: 0 },
    contadores: {},
    propuestas: [],
    desbloqueados: [],
    versus: { victorias: 0, derrotas: 0 }
  });

  function loadState() {
    const base = defaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const s = JSON.parse(raw);
      return {
        ...base,
        ...s,
        perfil: { ...base.perfil, ...s.perfil },
        racha: { ...base.racha, ...s.racha },
        rush: { ...base.rush, ...s.rush },
        versus: { ...base.versus, ...s.versus },
        contadores: { ...s.contadores },
        progreso: { ...s.progreso }
      };
    } catch {
      return base;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn('No se pudo guardar el progreso:', err);
    }
  }

  let state = loadState();

  // ---------- Puzzles y progreso ----------
  // Manual si existe para la fecha; si no, el motor procedural.
  function getPuzzleForDate(key) {
    return PUZZLES.find((p) => p.fecha === key) || GeneradorProceduralIA(key);
  }

  function getProgress(puzzle) {
    if (!state.progreso[puzzle.id]) {
      state.progreso[puzzle.id] = {
        resuelto: false, intentos: 0, ayudas: 0, revelados: [],
        capa2: false, fecha: puzzle.fecha
      };
    }
    return state.progreso[puzzle.id];
  }

  const peekProgress = (id) => state.progreso[id] || {};

  // ---------- Racha ----------
  function effectiveStreak() {
    const t = todayKey();
    const r = state.racha;
    return (r.ultimo === t || r.ultimo === addDays(t, -1)) ? r.actual : 0;
  }

  const streakText = () => {
    const n = effectiveStreak();
    return `Racha actual 🔥 ${n} ${n === 1 ? 'día' : 'días'}`;
  };

  function updateStreakText() {
    $$('[data-streak]').forEach((n) => { n.textContent = streakText(); });
  }

  function updateStreak() {
    const t = todayKey();
    const r = state.racha;
    if (r.ultimo === t) return;
    r.actual = r.ultimo === addDays(t, -1) ? r.actual + 1 : 1;
    r.ultimo = t;
    r.mejor = Math.max(r.mejor, r.actual);
  }

  // ---------- Logros ----------
  const achievementValue = (a) => (a.key === 'racha' ? state.racha.mejor : state.contadores[a.key] || 0);

  function checkAchievements() {
    ACHIEVEMENTS.forEach((a) => {
      if (!state.desbloqueados.includes(a.id) && achievementValue(a) >= a.meta) {
        state.desbloqueados.push(a.id);
        showToast(`Logro desbloqueado: ${a.titulo}`);
      }
    });
    saveState();
  }

  function inc(key, by = 1) {
    state.contadores[key] = (state.contadores[key] || 0) + by;
    checkAchievements();
  }

  function setMax(key, val) {
    if ((state.contadores[key] || 0) < val) {
      state.contadores[key] = val;
      checkAchievements();
    }
  }

  // ---------- Resolución del juego ----------
  function solvePuzzle(puzzle, mode) {
    const p = getProgress(puzzle);
    p.intentos += 1;
    p.resuelto = true;
    p.modo = mode;
    p.tiempoMs = Date.now() - (p.inicio || Date.now());
    p.estrellas = p.estrellas || 0;

    if (mode === 'hoy' && puzzle.fecha === todayKey()) updateStreak();
    inc('resueltos');
    if (p.ayudas === 0) inc('sinAyuda');
    if (p.intentos === 1) inc('primerIntento');
    if (mode === 'archivo') inc('archivoResueltos');
    if (puzzle.tipo === 'ia') inc('iaResueltos');
    if (madridParts().h < 5) inc('nocturnos');
    saveState();
  }

  // Colorea la pista según su desglose (definición, indicador, material)
  function marcarPista(pista, d = {}) {
    const lower = pista.toLowerCase();
    const ranges = [['definicion', d.definicion], ['indicador', d.indicador], ['material', d.material]]
      .filter(([, t]) => t)
      .map(([k, t]) => ({ k, t, s: lower.indexOf(t.toLowerCase()) }))
      .filter((r) => r.s >= 0)
      .map((r) => ({ ...r, e: r.s + r.t.length }))
      .sort((a, b) => a.s - b.s);

    const nodes = [];
    let pos = 0;
    ranges.forEach((r) => {
      if (r.s < pos) return;
      if (r.s > pos) nodes.push(pista.slice(pos, r.s));
      nodes.push(el('mark', { class: `seg seg-${r.k}` }, pista.slice(r.s, r.e)));
      pos = r.e;
    });
    if (pos < pista.length) nodes.push(pista.slice(pos));
    return nodes;
  }

  function estrellas(prog, onPick) {
    return el('div', { class: 'stars', role: 'radiogroup', 'aria-label': 'Valoración del caso' },
      [1, 2, 3, 4, 5].map((n) => el('button', {
        class: 'star' + (n <= (prog.estrellas || 0) ? ' is-on' : ''),
        type: 'button',
        role: 'radio',
        'aria-checked': String((prog.estrellas || 0) === n),
        'aria-label': `${n} de 5`,
        onclick: () => onPick(n)
      }, '★')));
  }

  function panelResolucion(root, puzzle, mode, prog) {
    const d = puzzle.desglose || {};
    const rows = [
      ['definicion', 'Definición', d.definicion],
      ['indicador', 'Indicador', d.indicador],
      ['material', 'Material / relleno', d.material]
    ].filter((r) => r[2]);

    return el('section', { class: 'resolution' },
      el('p', { class: 'eyebrow', text: 'Cómo se resuelve' }),
      rows.length
        ? el('dl', { class: 'breakdown' }, rows.map(([k, label, t]) =>
            el('div', { class: 'bd-row' },
              el('dt', { class: `bd-${k}`, text: label }),
              el('dd', { text: t }))))
        : null,
      !d.indicador ? el('p', { class: 'muted small', text: 'Definición directa: el enunciado completo apunta a la respuesta.' }) : null,
      el('div', { class: 'stats' },
        el('span', { text: `Tiempo ${fmtTiempo(prog.tiempoMs)}` }),
        el('span', { text: `Pistas ${prog.ayudas}/${MAX_PISTAS}` })),
      el('div', { class: 'rating' },
        el('p', { class: 'label', text: '¿Qué te pareció este caso?' }),
        estrellas(prog, (n) => {
          prog.estrellas = n;
          saveState();
          renderBoard(root, puzzle, mode);
        }))
    );
  }

  // ---------- Tablero (Hoy, Archivo, IA Lab) ----------
  function renderBoard(root, puzzle, mode = 'hoy') {
    const len = puzzle.longitud;
    const answer = normalize(puzzle.respuesta);
    const prog = getProgress(puzzle);
    if (!prog.resuelto && !prog.inicio) {
      prog.inicio = Date.now();
      saveState();
    }

    const boxes = [];
    const feedback = el('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const say = (msg, tone = '') => { feedback.textContent = msg; feedback.dataset.tone = tone; };
    const lettersWrap = el('div', { class: 'letters', role: 'group', 'aria-label': `Respuesta de ${len} letras` });

    const moveFocus = (from, dir) => {
      let j = from + dir;
      while (j >= 0 && j < len && boxes[j].readOnly) j += dir;
      if (j >= 0 && j < len) { boxes[j].focus(); boxes[j].select(); }
    };

    const helpBtn = el('button', { class: 'btn btn-ghost', type: 'button', onclick: () => help() }, 'Dame una ayuda');
    const checkBtn = el('button', { class: 'btn btn-primary', type: 'button', onclick: () => check() }, 'Comprobar');

    function syncHelp() {
      const p = getProgress(puzzle);
      helpBtn.textContent = `Dame una ayuda (${p.ayudas}/${MAX_PISTAS})`;
      helpBtn.disabled = p.resuelto || p.ayudas >= MAX_PISTAS;
    }

    function check() {
      const p = getProgress(puzzle);
      if (p.resuelto) return;
      const guess = boxes.map((b) => normalize(b.value)).join('');
      if (guess.length < len) return say('Completa todas las letras antes de comprobar.', 'warn');
      if (guess === answer) {
        solvePuzzle(puzzle, mode);
        renderBoard(root, puzzle, mode);
        updateStreakText();
        return;
      }
      p.intentos += 1;
      saveState();
      lettersWrap.classList.remove('shake');
      void lettersWrap.offsetWidth;
      lettersWrap.classList.add('shake');
      say('Aún no es esta. Revisa la pista y prueba de nuevo.', 'warn');
    }

    function help() {
      const p = getProgress(puzzle);
      if (p.resuelto || p.ayudas >= MAX_PISTAS) return;
      const idx = [...Array(len).keys()].find((k) => !p.revelados.includes(k));
      if (idx === undefined) return;
      p.revelados.push(idx);
      p.ayudas += 1;
      saveState();
      const box = boxes[idx];
      box.value = answer[idx];
      box.readOnly = true;
      box.classList.add('is-revealed');
      say(`Pista ${p.ayudas}/${MAX_PISTAS}: letra ${idx + 1} revelada.`);
      syncHelp();
      inc('ayudas');
      moveFocus(idx, 1);
    }

    for (let i = 0; i < len; i++) {
      const revealed = prog.revelados.includes(i);
      const locked = revealed || prog.resuelto;
      const box = el('input', {
        class: 'letter' + (revealed ? ' is-revealed' : '') + (prog.resuelto ? ' is-solved' : ''),
        type: 'text',
        maxlength: '1',
        inputmode: 'text',
        autocomplete: 'off',
        autocapitalize: 'characters',
        spellcheck: 'false',
        'aria-label': `Letra ${i + 1} de ${len}`,
        readonly: locked
      });
      if (locked) box.value = answer[i];

      box.addEventListener('input', () => {
        box.value = normalize(box.value).slice(-1);
        if (box.value) moveFocus(i, 1);
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          check();
        } else if (e.key === 'Backspace' && !box.value) {
          e.preventDefault();
          if (i > 0 && !boxes[i - 1].readOnly) boxes[i - 1].value = '';
          moveFocus(i, -1);
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          moveFocus(i, -1);
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          moveFocus(i, 1);
        }
      });
      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = normalize(e.clipboardData.getData('text'));
        let j = i;
        for (const ch of text) {
          while (j < len && boxes[j].readOnly) j++;
          if (j >= len) break;
          boxes[j].value = ch;
          j++;
        }
        const empty = boxes.find((b) => !b.readOnly && !b.value);
        (empty || boxes[len - 1]).focus();
      });

      boxes.push(box);
      lettersWrap.append(box);
    }

    syncHelp();
    checkBtn.disabled = prog.resuelto;

    if (prog.resuelto) say('Caso resuelto.', 'ok');

    const tipoLabel = puzzle.tipo === 'ia' ? 'IA' : 'Comunidad';
    const dif = DIF[puzzle.dificultad];
    root.replaceChildren(
      el('span', { class: 'tag', text: dif ? `${tipoLabel} · ${dif}` : tipoLabel }),
      el('p', { class: 'clue-row' },
        el('span', { class: 'clue' }, prog.resuelto ? marcarPista(puzzle.pista, puzzle.desglose) : puzzle.pista),
        el('span', { class: 'length', text: `(${len})` })),
      lettersWrap,
      prog.resuelto ? null : el('div', { class: 'actions' }, helpBtn, checkBtn),
      feedback,
      prog.resuelto ? panelResolucion(root, puzzle, mode, prog) : null
    );
  }

  // ---------- Vista: Hoy ----------
  let currentDay = null;

  function renderHoy() {
    const root = $('#hoy-root');
    const today = todayKey();
    const puzzle = getPuzzleForDate(today);
    const boardEl = el('div', { class: 'board' });

    root.replaceChildren(
      el('header', { class: 'section-head' },
        el('p', { class: 'eyebrow', text: formatDateLong(today) }),
        el('p', { class: 'streak', 'data-streak': '', text: streakText() })),
      boardEl,
      el('div', { class: 'countdown' },
        el('span', { class: 'label', text: 'Próximo acertijo en' }),
        el('span', { class: 'time', 'data-countdown': '', text: '--:--:--' }))
    );

    renderBoard(boardEl, puzzle, 'hoy');
    updateCountdown();
  }

  function updateCountdown() {
    const total = Math.max(0, Math.floor(msUntilMadridMidnight() / 1000));
    const text = `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
    $$('[data-countdown]').forEach((n) => { n.textContent = text; });
  }

  // ---------- Vista: Archivo ----------
  let archivoSel = null;

  const fragmento = (t) => (t.length > 52 ? `${t.slice(0, 52).trimEnd()}…` : t);

  function renderArchivo() {
    const root = $('#archivo-root');
    const hoy = todayKey();
    const items = [];
    for (let k = addDays(hoy, -1); k >= ARCHIVE_START; k = addDays(k, -1)) {
      const p = getPuzzleForDate(k);
      items.push({ k, p, prog: peekProgress(p.id) });
    }

    const children = [
      el('header', { class: 'section-head' },
        el('p', { class: 'eyebrow', text: 'Archivo' }),
        el('p', { class: 'muted', text: 'Desde el 20 de octubre. Jugar aquí registra tu tiempo, pero no suma a la racha.' }))
    ];

    if (!items.length) {
      children.push(el('p', { class: 'muted', text: 'El archivo empieza el 20 de octubre. Vuelve mañana.' }));
    } else {
      children.push(el('ul', { class: 'archive-list' }, items.map(({ k, p, prog }) => {
        const cls = ['archive-item', prog.resuelto && 'is-done', archivoSel === k && 'is-active']
          .filter(Boolean).join(' ');
        return el('li', {},
          el('button', {
            class: cls,
            type: 'button',
            'aria-pressed': String(archivoSel === k),
            onclick: () => { archivoSel = k; renderArchivo(); }
          },
            el('span', { class: 'archive-date', text: formatDateShort(k) }),
            el('span', { class: 'archive-frag', text: fragmento(p.pista) }),
            el('span', { class: 'archive-dif', text: DIF[p.dificultad] || '' }),
            el('span', { class: 'archive-status', text: prog.resuelto ? 'Resuelto' : 'Sin jugar' })));
      })));

      const sel = items.find((i) => i.k === archivoSel);
      if (sel) {
        const boardEl = el('div', { class: 'board' });
        children.push(boardEl);
        renderBoard(boardEl, sel.p, 'archivo');
      }
    }

    root.replaceChildren(...children);
  }

  // ---------- Vista: Contrarreloj ----------
  const rush = { estado: 'lobby', endAt: 0, score: 0, deck: [], current: null, timer: null, flash: '' };

  function shuffle(list) {
    const a = [...list];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function nextRush() {
    if (!rush.deck.length) rush.deck = shuffle(PUZZLES);
    rush.current = rush.deck.pop();
    rush.flash = '';
  }

  function startRush() {
    rush.estado = 'playing';
    rush.score = 0;
    rush.deck = shuffle(PUZZLES);
    rush.endAt = Date.now() + RUSH_SECONDS * 1000;
    nextRush();
    clearInterval(rush.timer);
    rush.timer = setInterval(tickRush, 200);
    renderRush();
  }

  function tickRush() {
    if (rush.estado !== 'playing') return;
    const remaining = rush.endAt - Date.now();
    if (remaining <= 0) { endRush(); return; }
    const t = $('#rush-time');
    if (t) t.textContent = String(Math.ceil(remaining / 1000));
  }

  function submitRush() {
    if (rush.estado !== 'playing') return;
    const input = $('#rush-input');
    if (!input) return;
    const guess = normalize(input.value);
    if (!guess) return;

    if (guess === normalize(rush.current.respuesta)) {
      rush.score += 1;
      rush.endAt += RUSH_GAIN_MS;
      setMax('rushMejorSesion', rush.score);
      nextRush();
      rush.flash = '+3 s';
    } else {
      rush.endAt -= RUSH_LOSS_MS;
      rush.flash = '−2 s';
      inc('rushFallos');
    }
    renderRush();
  }

  function skipRush() {
    if (rush.estado !== 'playing') return;
    rush.endAt -= RUSH_LOSS_MS;
    nextRush();
    rush.flash = '−2 s';
    renderRush();
  }

  function endRush() {
    clearInterval(rush.timer);
    rush.timer = null;
    rush.estado = 'done';
    state.rush.mejor = Math.max(state.rush.mejor, rush.score);
    inc('rushPartidas');
    saveState();
    renderRush();
  }

  function rushLobby() {
    const best = state.rush.mejor;
    return el('div', { class: 'rush' },
      el('h2', { class: 'h2', text: 'Contrarreloj' }),
      el('ul', { class: 'rules' },
        el('li', { text: 'Tienes 60 segundos para resolver tantos acertijos como puedas.' }),
        el('li', { text: 'Cada acierto suma 3 segundos. Cada fallo o salto resta 2.' }),
        el('li', { text: 'Escribe la respuesta completa y pulsa Enter.' })),
      el('p', { class: 'muted', text: `Récord local: ${best} ${best === 1 ? 'acierto' : 'aciertos'}` }),
      el('div', { class: 'actions' },
        el('button', { class: 'btn btn-primary', type: 'button', onclick: startRush }, 'Empezar')));
  }

  function rushPlaying() {
    const remaining = Math.ceil((rush.endAt - Date.now()) / 1000);
    const input = el('input', {
      id: 'rush-input',
      class: 'rush-input',
      type: 'text',
      autocomplete: 'off',
      autocapitalize: 'characters',
      spellcheck: 'false',
      'aria-label': 'Tu respuesta',
      onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); submitRush(); } }
    });
    return el('div', { class: 'rush' },
      el('div', { class: 'rush-head' },
        el('span', { id: 'rush-time', class: 'rush-time', text: String(Math.max(0, remaining)) }),
        el('span', { class: 'rush-score', text: `Aciertos ${rush.score}` })),
      el('p', { id: 'rush-flash', class: 'rush-flash', role: 'status', text: rush.flash }),
      el('p', { class: 'clue', text: rush.current.pista }),
      input,
      el('div', { class: 'actions' },
        el('button', { class: 'btn btn-ghost', type: 'button', onclick: skipRush }, 'Saltar (−2 s)'),
        el('button', { class: 'btn btn-primary', type: 'button', onclick: submitRush }, 'Responder')));
  }

  function rushResults() {
    const entries = [...SEEDS_TOP.map((e) => ({ ...e, you: false })), { n: 'Tú', p: rush.score, you: true }]
      .sort((a, b) => b.p - a.p)
      .slice(0, 5);
    const score = rush.score;
    return el('div', { class: 'rush' },
      el('h2', { class: 'h2', text: 'Tiempo' }),
      el('p', { class: 'rush-result', text: `${score} ${score === 1 ? 'acierto' : 'aciertos'}` }),
      el('p', { class: 'muted', text: `Récord local: ${state.rush.mejor}` }),
      el('h3', { class: 'h3', text: 'Top 5 (simulado)' }),
      el('ol', { class: 'ranking' }, entries.map((e) =>
        el('li', { class: e.you ? 'is-you' : undefined },
          el('span', { text: e.n }),
          el('span', { text: String(e.p) })))),
      el('div', { class: 'actions' },
        el('button', { class: 'btn btn-primary', type: 'button', onclick: startRush }, 'Otra partida')));
  }

  function renderRush() {
    const root = $('#rush-root');
    const view = rush.estado === 'playing' ? rushPlaying() : rush.estado === 'done' ? rushResults() : rushLobby();
    root.replaceChildren(view);
    if (rush.estado === 'playing') $('#rush-input')?.focus();
  }

  // ---------- Vista: Logros ----------
  let achFilter = 'Todos';

  function achievementCard(a) {
    const val = achievementValue(a);
    const unlocked = state.desbloqueados.includes(a.id);
    const hidden = a.secreto && !unlocked;
    const shown = Math.min(val, a.meta);
    const pct = Math.round((shown / a.meta) * 100);

    return el('article', { class: 'card' + (unlocked ? ' is-unlocked' : '') },
      el('div', { class: 'card-top' },
        el('span', { text: a.cat }),
        el('span', { class: 'lock', 'aria-label': unlocked ? 'Desbloqueado' : 'Bloqueado', text: unlocked ? '✦' : '🔒' })),
      el('h3', { class: 'card-title', text: hidden ? 'Secreto' : a.titulo }),
      el('p', { class: 'card-desc', text: hidden ? '???' : a.descripcion }),
      el('div', {
        class: 'bar',
        role: 'progressbar',
        'aria-valuemin': '0',
        'aria-valuemax': String(a.meta),
        'aria-valuenow': String(shown)
      }, el('span', { style: `width:${pct}%` })),
      el('p', { class: 'card-count', text: hidden ? '—' : `${shown}/${a.meta}` }));
  }

  function renderLogros() {
    const root = $('#logros-root');
    const list = ACHIEVEMENTS.filter((a) => achFilter === 'Todos' || a.cat === achFilter);
    root.replaceChildren(
      el('header', { class: 'section-head' },
        el('p', { class: 'eyebrow', text: 'Logros' }),
        el('p', { class: 'muted', text: `${state.desbloqueados.length} de ${ACHIEVEMENTS.length} desbloqueados` })),
      el('div', { class: 'filters', role: 'group', 'aria-label': 'Categorías' },
        CATEGORIES.map((cat) => el('button', {
          class: 'filter' + (achFilter === cat ? ' is-active' : ''),
          type: 'button',
          'aria-pressed': String(achFilter === cat),
          onclick: () => { achFilter = cat; renderLogros(); }
        }, cat))),
      el('div', { class: 'grid' }, list.map(achievementCard)));
  }

  // ---------- Vista: Perfil ----------
  const initial = (name) => (name || 'J').trim().charAt(0).toUpperCase();

  function renderPerfil() {
    const root = $('#perfil-root');
    const today = todayKey();
    const progs = Object.values(state.progreso);
    const resueltos = progs.filter((p) => p.resuelto);
    const total = resueltos.length;
    const sinAyuda = resueltos.filter((p) => !p.ayudas).length;
    const pct = total ? Math.round((sinAyuda / total) * 100) : 0;
    const rushN = state.contadores.rushPartidas || 0;
    const racha = effectiveStreak();

    const porFecha = {};
    progs.forEach((p) => {
      if (!p.fecha) return;
      const e = (porFecha[p.fecha] ||= { jugado: false, resuelto: false });
      if (p.resuelto) e.resuelto = true;
      if (p.resuelto || p.intentos > 0) e.jugado = true;
    });

    const dow = utcNoon(today).getUTCDay();
    const lunes = addDays(today, -((dow + 6) % 7));
    const semana = Array.from({ length: 7 }, (_, i) => {
      const k = addDays(lunes, i);
      const cls = 'day' + (porFecha[k]?.jugado ? ' is-played' : '') + (k === today ? ' is-today' : '');
      return el('div', { class: cls, title: formatDateShort(k) },
        el('span', { text: SEMANA[i] }),
        el('span', { class: 'day-dot' }));
    });

    const heat = Array.from({ length: 30 }, (_, i) => {
      const k = addDays(today, i - 29);
      const hit = porFecha[k]?.resuelto;
      return el('span', {
        class: 'hm' + (hit ? ' is-on' : ''),
        title: `${formatDateShort(k)}${hit ? ' · resuelto' : ''}`
      });
    });

    const metric = (value, label) => el('div', { class: 'metric' },
      el('span', { class: 'metric-value', text: String(value) }),
      el('span', { class: 'metric-label', text: label }));

    root.replaceChildren(
      el('header', { class: 'profile-head' },
        el('div', { class: 'avatar', 'aria-hidden': 'true', text: initial(state.perfil.nombre) }),
        el('div', { class: 'profile-id' },
          el('p', { class: 'eyebrow', text: 'Perfil' }),
          el('input', {
            class: 'name-input',
            value: state.perfil.nombre,
            maxlength: '24',
            'aria-label': 'Nombre de usuario',
            oninput: (e) => {
              state.perfil.nombre = e.target.value.trim() || 'Jugador';
              saveState();
              $('.avatar').textContent = initial(state.perfil.nombre);
            }
          }))),
      el('section', { class: 'streak-big' },
        el('span', { class: 'streak-num', text: `🔥 ${racha}` }),
        el('span', { class: 'muted', text: racha === 1 ? 'día de racha actual' : 'días de racha actual' })),
      el('div', { class: 'week', role: 'group', 'aria-label': 'Días jugados esta semana' }, semana),
      el('div', { class: 'metrics' },
        metric(total, 'Casos resueltos'),
        metric(`${pct}%`, 'Acierto sin pistas'),
        metric(rushN, 'Partidas Contrarreloj')),
      el('h3', { class: 'h3', text: 'Últimos 30 días' }),
      el('div', { class: 'heatmap', role: 'img', 'aria-label': 'Mapa de actividad de los últimos 30 días' }, heat),
      el('p', { class: 'hint', text: 'Verde: caso resuelto · Gris: pendiente o no jugado' }));
  }

  // ---------- Vista: IA Lab & Comunidad ----------
  let labSub = 'comunidad';

  function renderComunidad() {
    const root = $('#lab-comunidad-root');
    const feedback = el('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const say = (msg) => { feedback.textContent = msg; };

    const pistaInput = el('textarea', {
      id: 'prop-pista',
      class: 'field',
      rows: '3',
      maxlength: '240',
      placeholder: 'Escribe la pista con la ambigüedad justa…'
    });
    const respInput = el('input', {
      id: 'prop-resp',
      class: 'field caps',
      type: 'text',
      maxlength: '12',
      autocomplete: 'off',
      autocapitalize: 'characters',
      placeholder: 'Solución, p. ej. ESPEJO'
    });

    const form = el('form', {
      class: 'form',
      novalidate: true,
      onsubmit: (e) => {
        e.preventDefault();
        const pista = pistaInput.value.trim();
        const respuesta = normalize(respInput.value);
        if (pista.length < 12) return say('La pista necesita al menos 12 caracteres.');
        if (respuesta.length < 3 || respuesta.length > 12) return say('La solución debe tener entre 3 y 12 letras.');

        state.propuestas.push({ pista, respuesta, longitud: respuesta.length, tipo: 'comunidad', fecha: todayKey(), estado: 'simulada' });
        inc('propuestas');
        renderComunidad();
        showToast('Propuesta enviada. Gracias por tu acertijo.');
      }
    },
      el('div', { class: 'field-group' },
        el('label', { class: 'label', for: 'prop-pista', text: 'Pista' }),
        pistaInput),
      el('div', { class: 'field-group' },
        el('label', { class: 'label', for: 'prop-resp', text: 'Solución' }),
        respInput),
      el('p', { class: 'hint', text: 'La longitud se calcula automáticamente. Solo letras, sin espacios.' }),
      feedback,
      el('div', { class: 'actions' },
        el('button', { class: 'btn btn-primary', type: 'submit' }, 'Enviar propuesta')));

    root.replaceChildren(
      el('header', { class: 'section-head' },
        el('p', { class: 'eyebrow', text: 'Comunidad' }),
        el('p', { class: 'muted', text: 'Propón un críptico. La propuesta se simula y no se publica.' }),
        el('p', { class: 'muted small', text: `Propuestas enviadas: ${state.propuestas.length}` })),
      form);
  }

  function revealCapa2(puzzle) {
    const p = getProgress(puzzle);
    if (p.capa2) return;
    p.capa2 = true;
    inc('capasUsadas');
    saveState();
    renderIA();
  }

  function renderIA() {
    const root = $('#lab-ia-root');
    const cards = PUZZLES.filter((p) => p.tipo === 'ia').map((p) => {
      const prog = getProgress(p);
      const boardEl = el('div', { class: 'board' });
      renderBoard(boardEl, p, 'lab');

      return el('article', { class: 'lab-card' },
        el('div', { class: 'layer-block' },
          el('span', { class: 'tag', text: 'Capa 1 · Semántica' }),
          el('p', { class: 'layer', text: p.capas.semantica })),
        prog.capa2
          ? el('div', { class: 'layer-block' },
              el('span', { class: 'tag', text: 'Capa 2 · Estructura' }),
              el('p', { class: 'layer', text: p.capas.estructura }))
          : el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => revealCapa2(p) },
              'Revelar capa estructural'),
        boardEl);
    });

    root.replaceChildren(
      el('header', { class: 'section-head' },
        el('p', { class: 'eyebrow', text: 'IA Lab' }),
        el('p', { class: 'muted', text: 'Acertijos con pistas en dos capas: semántica y estructural.' })),
      ...cards);
  }

  function setLabSub(sub) {
    labSub = sub;
    $$('.subtab').forEach((b) => {
      const on = b.dataset.sub === sub;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-selected', String(on));
    });
    $$('[data-sub-panel]').forEach((p) => { p.hidden = p.dataset.subPanel !== sub; });
    if (sub === 'comunidad') renderComunidad();
    else renderIA();
  }

  // ---------- Vista: Modo 1v1 ----------
  const vs = {
    fase: 'menu', rol: null, codigo: '', msg: '', conectado: false,
    puzzles: [], done: 0, rival: 0, t0: 0, cuenta: 0, ms: 0,
    resultado: null, registrado: false, timer: null
  };

  function vsReset() {
    clearTimeout(vs.timer);
    P2P.cerrar();
    Object.assign(vs, {
      fase: 'menu', rol: null, codigo: '', msg: '', conectado: false,
      puzzles: [], done: 0, rival: 0, t0: 0, cuenta: 0, ms: 0,
      resultado: null, registrado: false, timer: null
    });
    renderVersus();
  }

  function finVersus(resultado, ms = 0) {
    if (vs.fase === 'fin') return;
    clearTimeout(vs.timer);
    vs.fase = 'fin';
    vs.resultado = resultado;
    vs.ms = ms;
    if (!vs.registrado) {
      vs.registrado = true;
      if (resultado === 'victoria' || resultado === 'rival-abandono') state.versus.victorias += 1;
      else if (resultado === 'derrota') state.versus.derrotas += 1;
      saveState();
    }
    renderVersus();
  }

  function empezarCuenta() {
    vs.fase = 'cuenta';
    vs.cuenta = VS_COUNTDOWN;
    renderVersus();
    const paso = () => {
      vs.cuenta -= 1;
      if (vs.cuenta > 0) {
        renderVersus();
        vs.timer = setTimeout(paso, 1000);
      } else {
        vs.fase = 'juego';
        vs.done = 0;
        vs.rival = 0;
        vs.t0 = Date.now();
        renderVersus();
      }
    };
    vs.timer = setTimeout(paso, 1000);
  }

  const vsCallbacks = {
    onCodigo(c) { vs.codigo = c; renderVersus(); },
    onEstado(txt, ok) {
      vs.conectado = ok;
      vs.msg = ok
        ? (vs.rol === 'host' ? 'Rival conectado. Ya puedes iniciar la partida.' : 'Conectado. Esperando a que el anfitrión inicie…')
        : txt;
      if (vs.fase === 'sala') renderVersus();
    },
    onError(txt) {
      vs.msg = txt;
      if (vs.fase === 'sala') renderVersus();
    },
    onCerrado() {
      if (vs.fase === 'juego' || vs.fase === 'cuenta') return finVersus('desconexion');
      vs.conectado = false;
      vs.msg = 'La conexión con el rival se cerró.';
      if (vs.fase === 'sala') renderVersus();
    },
    onMensaje(m) {
      if (m.type === 'start' && vs.rol === 'guest') {
        vs.puzzles = m.puzzles;
        empezarCuenta();
      } else if (m.type === 'progress') {
        vs.rival = m.done;
        if (vs.fase === 'juego') updateVsBars();
      } else if (m.type === 'win' && vs.fase === 'juego') {
        finVersus('derrota', m.ms);
      } else if (m.type === 'bye' && (vs.fase === 'juego' || vs.fase === 'cuenta')) {
        finVersus('rival-abandono');
      }
    }
  };

  function crearSala() {
    vs.fase = 'sala';
    vs.rol = 'host';
    vs.codigo = '';
    vs.msg = 'Creando sala…';
    renderVersus();
    P2P.crear(vsCallbacks);
  }

  function unirseSala() {
    const code = ($('#vs-code')?.value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 4) {
      vs.msg = 'El código tiene 4 caracteres.';
      return renderVersus();
    }
    vs.fase = 'sala';
    vs.rol = 'guest';
    vs.codigo = code;
    vs.msg = 'Conectando…';
    renderVersus();
    P2P.unirse(code, vsCallbacks);
  }

  function iniciarSala() {
    // Ambos reciben los mismos 5 crípticos: los genera el anfitrión y se envían por la conexión.
    vs.puzzles = Array.from({ length: VS_LEN }, (_, i) => GeneradorProceduralIA(`${vs.codigo}-${i}`));
    P2P.enviar({ type: 'start', puzzles: vs.puzzles });
    empezarCuenta();
  }

  function vsEnviar() {
    if (vs.fase !== 'juego') return;
    const input = $('#vs-input');
    if (!input) return;
    const g = normalize(input.value);
    if (!g) return;

    if (g === normalize(vs.puzzles[vs.done].respuesta)) {
      vs.done += 1;
      P2P.enviar({ type: 'progress', done: vs.done });
      if (vs.done >= VS_LEN) {
        const ms = Date.now() - vs.t0;
        P2P.enviar({ type: 'win', ms });
        return finVersus('victoria', ms);
      }
      renderVersus();
    } else {
      const fb = $('#vs-feedback');
      if (fb) fb.textContent = 'No es esta. Sigue intentándolo.';
      input.select();
    }
  }

  function vsAbandonar() {
    if (vs.fase !== 'juego' && vs.fase !== 'cuenta') return vsReset();
    P2P.enviar({ type: 'bye' });
    setTimeout(vsReset, 200);
  }

  function updateVsBars() {
    [['me', vs.done], ['rival', vs.rival]].forEach(([k, n]) => {
      const t = $(`[data-vs-n="${k}"]`);
      if (t) t.textContent = `${n}/${VS_LEN}`;
      const b = $(`[data-vs-bar="${k}"]`);
      if (b) b.style.width = `${(n / VS_LEN) * 100}%`;
    });
  }

  function vsBar(label, key, n) {
    return el('div', { class: 'vs-row' },
      el('div', { class: 'vs-meta' },
        el('span', { text: label }),
        el('span', { 'data-vs-n': key, text: `${n}/${VS_LEN}` })),
      el('div', { class: 'bar' },
        el('span', { 'data-vs-bar': key, style: `width:${(n / VS_LEN) * 100}%` })));
  }

  function vsMenu() {
    return el('div', {},
      el('div', { class: 'vs-grid' },
        el('div', { class: 'vs-card' },
          el('h3', { class: 'h3', text: 'Crear sala' }),
          el('p', { class: 'muted', text: 'Genera un código corto y compártelo con tu rival.' }),
          el('div', { class: 'actions' },
            el('button', { class: 'btn btn-primary', type: 'button', onclick: crearSala }, 'Crear sala'))),
        el('div', { class: 'vs-card' },
          el('h3', { class: 'h3', text: 'Unirse' }),
          el('input', {
            id: 'vs-code',
            class: 'field caps',
            maxlength: '4',
            placeholder: 'Código',
            autocomplete: 'off',
            autocapitalize: 'characters',
            spellcheck: 'false',
            onkeydown: (e) => { if (e.key === 'Enter') unirseSala(); }
          }),
          el('div', { class: 'actions' },
            el('button', { class: 'btn btn-ghost', type: 'button', onclick: unirseSala }, 'Unirse')))),
      vs.msg ? el('p', { class: 'feedback', text: vs.msg }) : null,
      el('p', { class: 'hint', text: `Victorias ${state.versus.victorias} · Derrotas ${state.versus.derrotas}` }),
      el('p', { class: 'hint', text: 'La partida viaja directamente entre navegadores (WebRTC). El servidor público de PeerJS solo ayuda a establecer la conexión.' }));
  }

  function vsSala() {
    return el('div', { class: 'vs-card vs-center' },
      el('p', { class: 'eyebrow', text: vs.rol === 'host' ? 'Código de sala' : 'Sala' }),
      vs.codigo ? el('p', { class: 'vs-code', text: vs.codigo }) : null,
      el('p', { class: 'muted', text: vs.msg }),
      vs.rol === 'host' && vs.conectado
        ? el('div', { class: 'actions' }, el('button', { class: 'btn btn-primary', type: 'button', onclick: iniciarSala }, 'Iniciar partida'))
        : null,
      el('div', { class: 'actions' }, el('button', { class: 'btn btn-ghost', type: 'button', onclick: vsReset }, 'Salir')));
  }

  function vsCuenta() {
    return el('div', { class: 'vs-card vs-center' },
      el('p', { class: 'vs-count', text: String(vs.cuenta) }),
      el('p', { class: 'muted', text: 'Prepárate. Los cinco casos son los mismos para ambos.' }));
  }

  function vsJuego() {
    const actual = vs.puzzles[vs.done];
    return el('div', { class: 'rush' },
      el('div', { class: 'vs-bars' }, vsBar('Tú', 'me', vs.done), vsBar('Rival', 'rival', vs.rival)),
      el('p', { class: 'eyebrow', text: `Caso ${vs.done + 1} de ${VS_LEN}` }),
      el('p', { class: 'clue', text: actual.pista }),
      el('input', {
        id: 'vs-input',
        class: 'rush-input',
        type: 'text',
        autocomplete: 'off',
        autocapitalize: 'characters',
        spellcheck: 'false',
        'aria-label': 'Tu respuesta',
        onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); vsEnviar(); } }
      }),
      el('p', { id: 'vs-feedback', class: 'feedback', role: 'status' }),
      el('div', { class: 'actions' },
        el('button', { class: 'btn btn-primary', type: 'button', onclick: vsEnviar }, 'Responder'),
        el('button', { class: 'btn btn-ghost', type: 'button', onclick: vsAbandonar }, 'Abandonar')));
  }

  function vsFin() {
    const gana = vs.resultado === 'victoria' || vs.resultado === 'rival-abandono';
    const titulo = gana ? 'Victoria' : vs.resultado === 'derrota' ? 'Derrota' : 'Partida anulada';
    const detalle = {
      victoria: 'Has resuelto los cinco casos primero.',
      derrota: 'Tu rival ha resuelto los cinco casos primero.',
      'rival-abandono': 'Tu rival abandonó la partida.',
      desconexion: 'Se perdió la conexión con el rival. La partida no cuenta.'
    }[vs.resultado];
    return el('div', { class: 'vs-card vs-center' },
      el('p', { class: 'vs-result', text: titulo }),
      el('p', { class: 'muted', text: detalle }),
      vs.ms ? el('p', { class: 'hint', text: `Tu tiempo: ${fmtTiempo(vs.ms)}` }) : null,
      el('div', { class: 'actions' },
        el('button', { class: 'btn btn-primary', type: 'button', onclick: vsReset }, 'Volver al menú')));
  }

  function renderVersus() {
    const root = $('#versus-root');
    const body = { menu: vsMenu, sala: vsSala, cuenta: vsCuenta, juego: vsJuego, fin: vsFin }[vs.fase]();
    root.replaceChildren(
      el('header', { class: 'section-head' },
        el('p', { class: 'eyebrow', text: 'Modo 1v1' }),
        el('p', { class: 'muted', text: 'Dos navegadores, una sala. Cinco crípticos, un ganador.' })),
      body);
    if (vs.fase === 'juego') $('#vs-input')?.focus();
  }

  // ---------- Modal ----------
  function openModal() {
    const m = $('#modal-help');
    m.hidden = false;
    document.body.classList.add('no-scroll');
    inc('ayudaAbierta');
    $('.modal-close', m).focus();
  }

  function closeModal() {
    $('#modal-help').hidden = true;
    document.body.classList.remove('no-scroll');
  }

  // ---------- Navegación ----------
  function setView(name) {
    if (name !== 'rush' && rush.estado === 'playing') endRush();

    $$('.view').forEach((v) => v.classList.toggle('is-active', v.dataset.view === name));
    $$('.tab').forEach((t) => {
      const on = t.dataset.target === name;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });

    if (name === 'hoy') { renderHoy(); }
    if (name === 'archivo') renderArchivo();
    if (name === 'rush') renderRush();
    if (name === 'logros') renderLogros();
    if (name === 'perfil') renderPerfil();
    if (name === 'lab') setLabSub(labSub);
    if (name === 'versus') renderVersus();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Reloj ----------
  function tick() {
    updateCountdown();
    const t = todayKey();
    if (t !== currentDay) {
      currentDay = t;
      renderHoy();
      renderArchivo();
    }
  }

  // ---------- Arranque ----------
  function bind() {
    $$('.tab').forEach((b) => b.addEventListener('click', () => setView(b.dataset.target)));
    $$('.subtab').forEach((b) => b.addEventListener('click', () => setLabSub(b.dataset.sub)));
    $('#btn-help').addEventListener('click', openModal);
    $$('[data-close-modal]').forEach((b) => b.addEventListener('click', closeModal));
    $('#modal-help').addEventListener('click', (e) => { if (e.target.id === 'modal-help') closeModal(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !$('#modal-help').hidden) closeModal();
    });
  }

  function init() {
    currentDay = todayKey();
    bind();
    renderHoy();
    renderRush();
    updateCountdown();
    setInterval(tick, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
