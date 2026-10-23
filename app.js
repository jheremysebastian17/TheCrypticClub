/* The Cryptic Club — app.js
 * Estado, LocalStorage, navegación, reloj de Madrid y lógica de juego. */
(() => {
  'use strict';

  // ---------- Configuración ----------
  const STORAGE_KEY = 'the-cryptic-club:v1';
  const TZ = 'Europe/Madrid';
  const RUSH_SECONDS = 60;
  const RUSH_GAIN_MS = 3000;
  const RUSH_LOSS_MS = 2000;
  const SEEDS_TOP = [
    { n: 'Mara', p: 14 }, { n: 'Dex', p: 12 }, { n: 'Ojo', p: 9 },
    { n: 'Vela', p: 7 }, { n: 'Ion', p: 5 }
  ];
  const CATEGORIES = ['Todos', 'Progreso', 'Maestría', 'Racha', 'Velocidad', 'Secretos'];

  const ACHIEVEMENTS = [
    // Progreso
    { id: 'primer-paso', cat: 'Progreso', titulo: 'Primer paso', descripcion: 'Resuelve tu primer acertijo.', key: 'resueltos', meta: 1 },
    { id: 'hilo-ariadna', cat: 'Progreso', titulo: 'Hilo de Ariadna', descripcion: 'Resuelve 10 acertijos.', key: 'resueltos', meta: 10 },
    { id: 'bibliotecario', cat: 'Progreso', titulo: 'Bibliotecario', descripcion: 'Resuelve 50 acertijos.', key: 'resueltos', meta: 50 },
    { id: 'arqueologo', cat: 'Progreso', titulo: 'Arqueólogo', descripcion: 'Resuelve 3 acertijos del Archivo.', key: 'archivoResueltos', meta: 3 },
    { id: 'voz-pueblo', cat: 'Progreso', titulo: 'Voz del pueblo', descripcion: 'Propón un acertijo a la comunidad.', key: 'propuestas', meta: 1 },
    // Maestría
    { id: 'mente-limpia', cat: 'Maestría', titulo: 'Mente limpia', descripcion: 'Resuelve 5 sin pedir ayuda.', key: 'sinAyuda', meta: 5 },
    { id: 'ojo-halcon', cat: 'Maestría', titulo: 'Ojo de halcón', descripcion: 'Resuelve 20 sin pedir ayuda.', key: 'sinAyuda', meta: 20 },
    { id: 'cerebro-hibrido', cat: 'Maestría', titulo: 'Cerebro híbrido', descripcion: 'Resuelve 3 acertijos del IA Lab.', key: 'iaResueltos', meta: 3 },
    { id: 'doble-lectura', cat: 'Maestría', titulo: 'Doble lectura', descripcion: 'Revela la capa estructural de un acertijo IA.', key: 'capasUsadas', meta: 1 },
    { id: 'sin-titubeos', cat: 'Maestría', titulo: 'Sin titubeos', descripcion: 'Resuelve un acertijo al primer intento.', key: 'primerIntento', meta: 1 },
    // Racha
    { id: 'costumbre', cat: 'Racha', titulo: 'Costumbre', descripcion: 'Alcanza una racha de 3 días.', key: 'racha', meta: 3 },
    { id: 'semana-perfecta', cat: 'Racha', titulo: 'Semana perfecta', descripcion: 'Alcanza una racha de 7 días.', key: 'racha', meta: 7 },
    { id: 'fiel-club', cat: 'Racha', titulo: 'Fiel al club', descripcion: 'Alcanza una racha de 14 días.', key: 'racha', meta: 14 },
    { id: 'inquebrantable', cat: 'Racha', titulo: 'Inquebrantable', descripcion: 'Alcanza una racha de 30 días.', key: 'racha', meta: 30 },
    // Velocidad
    { id: 'primer-latido', cat: 'Velocidad', titulo: 'Primer latido', descripcion: 'Completa una partida de Contrarreloj.', key: 'rushPartidas', meta: 1 },
    { id: 'reloj-en-mano', cat: 'Velocidad', titulo: 'Reloj en mano', descripcion: 'Acierta 5 en una sola partida.', key: 'rushMejorSesion', meta: 5 },
    { id: 'cronometro-vivo', cat: 'Velocidad', titulo: 'Cronómetro vivo', descripcion: 'Acierta 10 en una sola partida.', key: 'rushMejorSesion', meta: 10 },
    { id: 'maestro-tiempo', cat: 'Velocidad', titulo: 'Maestro del tiempo', descripcion: 'Acierta 15 en una sola partida.', key: 'rushMejorSesion', meta: 15 },
    // Secretos
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

  // ---------- Texto y fechas ----------
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

  // Desfase horario de Madrid (ms) en un instante concreto (CET/CEST)
  function madridOffsetMs(date) {
    const p = madridParts(date);
    return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s, date.getMilliseconds()) - date.getTime();
  }

  // Milisegundos reales hasta la próxima medianoche de Madrid (con cambio de hora)
  function msUntilMadridMidnight(now = new Date()) {
    const p = madridParts(now);
    const wallNext = Date.UTC(p.y, p.m - 1, p.d + 1);
    let target = wallNext - madridOffsetMs(now);
    target = wallNext - madridOffsetMs(new Date(target));
    return target - now.getTime();
  }

  const dateFmtLong = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const dateFmtShort = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const utcNoon = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d, 12)); };
  const formatDateLong = (key) => dateFmtLong.format(utcNoon(key)).replace(',', '').toUpperCase();
  const formatDateShort = (key) => dateFmtShort.format(utcNoon(key));

  // ---------- Almacenamiento ----------
  const defaultState = () => ({
    progreso: {},
    racha: { actual: 0, mejor: 0, ultimo: null },
    rush: { mejor: 0 },
    contadores: {},
    propuestas: [],
    desbloqueados: []
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
        racha: { ...base.racha, ...s.racha },
        rush: { ...base.rush, ...s.rush },
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
  const sortedPuzzles = () => [...PUZZLES].sort((a, b) => a.fecha.localeCompare(b.fecha));

  function getDailyPuzzle(key) {
    const list = sortedPuzzles();
    const past = list.filter((p) => p.fecha <= key);
    return past.length ? past[past.length - 1] : list[0];
  }

  function getProgress(id) {
    if (!state.progreso[id]) {
      state.progreso[id] = { resuelto: false, intentos: 0, ayudas: 0, revelados: [], capa2: false };
    }
    return state.progreso[id];
  }

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

  // ---------- Tablero de juego (Hoy, Archivo, IA Lab) ----------
  function solvePuzzle(puzzle, mode) {
    const p = getProgress(puzzle.id);
    p.intentos += 1;
    p.resuelto = true;
    p.modo = mode;

    if (mode === 'hoy') updateStreak();
    inc('resueltos');
    if (p.ayudas === 0) inc('sinAyuda');
    if (p.intentos === 1) inc('primerIntento');
    if (mode === 'archivo') inc('archivoResueltos');
    if (puzzle.tipo === 'ia') inc('iaResueltos');
    if (madridParts().h < 5) inc('nocturnos');
    saveState();
  }

  function renderBoard(root, puzzle, { mode = 'hoy' } = {}) {
    const len = puzzle.longitud;
    const answer = normalize(puzzle.respuesta);
    const prog = getProgress(puzzle.id);
    const boxes = [];

    const feedback = el('p', { class: 'feedback', role: 'status', 'aria-live': 'polite' });
    const setFeedback = (msg, tone = '') => { feedback.textContent = msg; feedback.dataset.tone = tone; };
    const lettersWrap = el('div', { class: 'letters', role: 'group', 'aria-label': `Respuesta de ${len} letras` });

    const moveFocus = (from, dir) => {
      let j = from + dir;
      while (j >= 0 && j < len && boxes[j].readOnly) j += dir;
      if (j >= 0 && j < len) { boxes[j].focus(); boxes[j].select(); }
    };

    function check() {
      const p = getProgress(puzzle.id);
      if (p.resuelto) return;
      const guess = boxes.map((b) => normalize(b.value)).join('');
      if (guess.length < len) {
        setFeedback('Completa todas las letras antes de comprobar.', 'warn');
        return;
      }
      if (guess === answer) {
        solvePuzzle(puzzle, mode);
        renderBoard(root, puzzle, { mode });
        updateStreakText();
        return;
      }
      p.intentos += 1;
      saveState();
      lettersWrap.classList.remove('shake');
      void lettersWrap.offsetWidth; // reinicia la animación
      lettersWrap.classList.add('shake');
      setFeedback('Aún no es esta. Revisa la pista y prueba de nuevo.', 'warn');
    }

    function help() {
      const p = getProgress(puzzle.id);
      if (p.resuelto) return;
      const idx = Array.from({ length: len }, (_, k) => k).find((k) => !p.revelados.includes(k));
      if (idx === undefined) return;
      p.revelados.push(idx);
      p.ayudas += 1;
      const box = boxes[idx];
      box.value = answer[idx];
      box.readOnly = true;
      box.classList.add('is-revealed');
      setFeedback(`Letra ${idx + 1} revelada.`);
      helpBtn.disabled = p.revelados.length >= len;
      inc('ayudas');
      moveFocus(idx, 1);
    }

    for (let i = 0; i < len; i++) {
      const revealed = prog.revelados.includes(i);
      const locked = revealed || prog.resuelto;
      const box = el('input', {
        class: 'letter' + (revealed ? ' is-revealed' : ''),
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

    const checkBtn = el('button', { class: 'btn btn-primary', type: 'button', onclick: check }, 'Comprobar');
    const helpBtn = el('button', { class: 'btn btn-ghost', type: 'button', onclick: help }, 'Dame una ayuda');
    checkBtn.disabled = prog.resuelto;
    helpBtn.disabled = prog.resuelto || prog.revelados.length >= len;

    if (prog.resuelto) {
      const n = prog.intentos;
      setFeedback(`Resuelto${n ? ` en ${n} ${n === 1 ? 'intento' : 'intentos'}` : ''}.`, 'ok');
    }

    root.replaceChildren(
      el('span', { class: 'tag', text: puzzle.tipo === 'ia' ? 'IA' : 'Comunidad' }),
      el('p', { class: 'clue-row' },
        el('span', { class: 'clue', text: puzzle.pista }),
        el('span', { class: 'length', text: `(${len})` })),
      lettersWrap,
      el('div', { class: 'actions' }, helpBtn, checkBtn),
      feedback
    );
  }

  // ---------- Vista: Hoy ----------
  let currentDay = null;

  function renderHoy() {
    const root = $('#hoy-root');
    const today = todayKey();
    const puzzle = getDailyPuzzle(today);
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

    renderBoard(boardEl, puzzle, { mode: 'hoy' });
    updateCountdown();
  }

  function updateCountdown() {
    const total = Math.max(0, Math.floor(msUntilMadridMidnight() / 1000));
    const text = `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
    $$('[data-countdown]').forEach((n) => { n.textContent = text; });
  }

  // ---------- Vista: Archivo ----------
  let archivoSel = null;

  function renderArchivo() {
    const root = $('#archivo-root');
    const past = sortedPuzzles().filter((p) => p.fecha < todayKey()).reverse();
    const children = [
      el('header', { class: 'section-head' },
        el('p', { class: 'eyebrow', text: 'Archivo' }),
        el('p', { class: 'muted', text: 'Juega acertijos anteriores. No suman a tu racha.' }))
    ];

    if (!past.length) {
      children.push(el('p', { class: 'muted', text: 'Todavía no hay acertijos archivados.' }));
    } else {
      children.push(el('ul', { class: 'archive-list' }, past.map((p) => {
        const prog = getProgress(p.id);
        const cls = ['archive-item', prog.resuelto && 'is-done', archivoSel === p.id && 'is-active']
          .filter(Boolean).join(' ');
        return el('li', {},
          el('button', {
            class: cls,
            type: 'button',
            'aria-pressed': String(archivoSel === p.id),
            onclick: () => { archivoSel = p.id; renderArchivo(); }
          },
            el('span', { class: 'archive-date', text: formatDateShort(p.fecha) }),
            el('span', { class: 'archive-meta', text: `${p.longitud} letras · ${p.tipo === 'ia' ? 'IA' : 'Comunidad'}` }),
            el('span', { class: 'archive-status', text: prog.resuelto ? 'Resuelto' : 'Pendiente' })));
      })));

      const sel = past.find((p) => p.id === archivoSel);
      if (sel) {
        const boardEl = el('div', { class: 'board' });
        children.push(boardEl);
        renderBoard(boardEl, sel, { mode: 'archivo' });
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
        el('button', { class: 'btn btn-primary', type: 'button', onclick: startRush }, 'Empezar'))
    );
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
        el('button', { class: 'btn btn-primary', type: 'button', onclick: submitRush }, 'Responder'))
    );
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
        el('button', { class: 'btn btn-primary', type: 'button', onclick: startRush }, 'Otra partida'))
    );
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
        el('span', { class: 'cat', text: a.cat }),
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
      el('p', { class: 'card-count', text: hidden ? '—' : `${shown}/${a.meta}` })
    );
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
      el('div', { class: 'grid' }, list.map(achievementCard))
    );
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

        state.propuestas.push({
          pista,
          respuesta,
          longitud: respuesta.length,
          tipo: 'comunidad',
          fecha: todayKey(),
          estado: 'simulada'
        });
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
        el('button', { class: 'btn btn-primary', type: 'submit' }, 'Enviar propuesta'))
    );

    root.replaceChildren(
      el('header', { class: 'section-head' },
        el('p', { class: 'eyebrow', text: 'Comunidad' }),
        el('p', { class: 'muted', text: 'Propón un críptico. La propuesta se simula y no se publica.' }),
        el('p', { class: 'muted small', text: `Propuestas enviadas: ${state.propuestas.length}` })),
      form
    );
  }

  function revealCapa2(id) {
    const p = getProgress(id);
    if (p.capa2) return;
    p.capa2 = true;
    inc('capasUsadas');
    saveState();
    renderIA();
  }

  function renderIA() {
    const root = $('#lab-ia-root');
    const cards = PUZZLES.filter((p) => p.tipo === 'ia').map((p) => {
      const prog = getProgress(p.id);
      const boardEl = el('div', { class: 'board' });
      renderBoard(boardEl, p, { mode: 'lab' });

      return el('article', { class: 'lab-card' },
        el('div', { class: 'layer-block' },
          el('span', { class: 'tag', text: 'Capa 1 · Semántica' }),
          el('p', { class: 'layer', text: p.capas.semantica })),
        prog.capa2
          ? el('div', { class: 'layer-block' },
              el('span', { class: 'tag', text: 'Capa 2 · Estructura' }),
              el('p', { class: 'layer', text: p.capas.estructura }))
          : el('button', { class: 'btn btn-ghost btn-sm', type: 'button', onclick: () => revealCapa2(p.id) },
              'Revelar capa estructural'),
        boardEl
      );
    });

    root.replaceChildren(
      el('header', { class: 'section-head' },
        el('p', { class: 'eyebrow', text: 'IA Lab' }),
        el('p', { class: 'muted', text: 'Acertijos con pistas en dos capas: semántica y estructural.' })),
      ...cards
    );
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

    if (name === 'hoy') updateStreakText();
    if (name === 'archivo') renderArchivo();
    if (name === 'rush') renderRush();
    if (name === 'logros') renderLogros();
    if (name === 'lab') setLabSub(labSub);

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
