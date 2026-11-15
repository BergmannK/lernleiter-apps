/* Lernleiter-Apps · gemeinsamer Kern
   Keine Anmeldung, keine Speicherung, keine Verbindungen nach außen. */
const LL = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const h = (tag, attrs = {}, ...kids) => {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v);
    }
    for (const k of kids.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k));
    return e;
  };
  const rnd = n => Math.floor(Math.random() * n);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const plain = s => String(s).replace(/<[^>]+>/g, '').replace(/[–−]/g, ' minus ').replace(/\+/g, ' plus ').replace(/=/g, ' ist ');

  /* ---------- Vorlesen ----------
     Zuerst vorab erzeugte MP3s (Stimme Ryan = Anweisungen, Serena = Robo) aus ../audio/.
     Ganzer Satz -> sonst Bausteine (Textteile + Zahlwörter) -> sonst Computerstimme. */
  let autoRead = false, voice = null;
  function pickVoice() {
    const vs = speechSynthesis.getVoices().filter(v => v.lang && v.lang.toLowerCase().startsWith('de'));
    voice = vs.find(v => /anna|petra|helena|marlene|katja/i.test(v.name)) || vs[0] || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  const AUDIO_BASE = (document.currentScript && document.currentScript.dataset.audio) || '../audio/';
  // Audio-Paket pro App: audio/<ordner>-<karte>.pak = [4 Byte Länge][JSON-Index][MP3-Daten]
  let manifest = null, pakDaten = null; const urlCache = {};
  const PAK = AUDIO_BASE + location.pathname.split('/').slice(-2).join('-').replace(/\.html$/, '') + '.pak';
  fetch(PAK).then(r => r.ok ? r.arrayBuffer() : null).then(buf => {
    if (!buf) return;
    const len = new DataView(buf).getUint32(0, true);
    manifest = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 4, len)));
    pakDaten = new Uint8Array(buf, 4 + len);
  }).catch(() => {});
  const clipUrl = c => { const k = c.join(':'); if (!urlCache[k]) urlCache[k] = URL.createObjectURL(new Blob([pakDaten.slice(c[0], c[0] + c[1])], { type: 'audio/mpeg' })); return urlCache[k]; };
  // Text vereinheitlichen: identisch zur Erzeugung (siehe audio_texte.py)
  const norm = s => String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
    .replace(/[„“"«»]/g, '').replace(/[–−]/g, ' minus ').replace(/\+/g, ' plus ').replace(/=/g, ' ist ').replace(/\|/g, ' ')
    .replace(/\s+/g, ' ').trim();
  const saetze = s => { const out = []; let cur = ''; for (const ch of s) { cur += ch; if ('.!?'.includes(ch)) { out.push(cur.trim()); cur = ''; } } if (cur.trim()) out.push(cur.trim()); return out.filter(Boolean); };
  const key = s => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const fragKey = s => key(s).replace(/^[\s.,!?:;]+|[\s.,!?:;]+$/g, '');
  function clipsFor(text, v) {
    if (!manifest) return null;
    const M = manifest[v] || {}, list = [];
    for (const satz of saetze(norm(text))) {
      const ganz = M['s:' + key(satz)];
      if (ganz) { list.push(ganz); continue; }
      for (const teil of satz.split(/(\d+)/)) {
        if (/^\d+$/.test(teil)) {
          const n = +teil, z = M['n:' + n];
          if (z) { list.push(z); continue; }
          // Zahlen über 100 aus Hunderter + Rest zusammensetzen (z. B. fünfhundert + siebzig)
          const hu = M['n:' + Math.floor(n / 100) * 100], r = n % 100 ? M['n:' + (n % 100)] : null;
          if (n > 100 && n < 1000 && hu && (r || n % 100 === 0)) { list.push(hu); if (r) list.push(r); continue; }
          return null;
        }
        const k = fragKey(teil); if (!k) continue;
        const f = M['f:' + k]; if (!f) return null; list.push(f);
      }
    }
    return list.length ? list : null;
  }
  // Zum Sammeln aller gesprochenen Texte (nur für die Erzeugung der Audios): ?sammeln
  const SAMMELN = /[?&]sammeln/.test(location.search) ? (window.__texte = new Set()) : null;
  const merke = (text, v = 'a') => { if (SAMMELN && text) SAMMELN.add(v + '\t' + norm(typeof text === 'function' ? text() : text)); };
  const player = new Audio(); let queue = [], playId = 0;
  player.addEventListener('ended', () => { if (queue.length) { player.src = clipUrl(queue.shift()); player.play().catch(() => {}); } });
  function stopAll() { queue = []; playId++; try { player.pause(); } catch (e) {} if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  // iPad: Audio erst nach einer Berührung erlaubt -> beim ersten Tippen kurz "entsperren"
  const STILL = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';
  document.addEventListener('pointerdown', function entsperren() { if (!player.src) { player.src = STILL; player.play().catch(() => {}); } document.removeEventListener('pointerdown', entsperren); });
  // Computerstimme (nur wenn eine Aufnahme fehlt): Zahlen als Wörter, sonst liest sie „47.“ als „siebenundvierzigste“
  const EIN = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const ZEH = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  function zahlwort(n) {
    if (n < 20) return EIN[n];
    if (n < 100) { const e = n % 10; return e ? (e === 1 ? 'ein' : EIN[e]) + 'und' + ZEH[Math.floor(n / 10)] : ZEH[n / 10]; }
    if (n < 1000) { const hu = Math.floor(n / 100), r = n % 100; return (hu === 1 ? 'ein' : EIN[hu]) + 'hundert' + (r ? zahlwort(r) : ''); }
    if (n === 1000) return 'eintausend';
    return String(n);
  }
  const fuerStimme = s => s.replace(/\d+/g, m => zahlwort(+m)).replace(/\s*(…|_{2,})\s*/g, ', ').replace(/,\s*([.!?])/g, '$1');
  function say(text, v = 'a') {
    merke(text, v);
    stopAll();
    const clips = clipsFor(text, v);
    if (clips) { queue = clips.slice(1); player.src = clipUrl(clips[0]); player.play().catch(() => {}); return; }
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(fuerStimme(norm(text)));
    u.lang = 'de-DE'; u.rate = 0.85; if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }
  const ICON = {
    laut: '<svg viewBox="0 0 32 32"><path d="M4 12h6l8-6v20l-8-6H4z" fill="#333"/><path d="M22 11c2 2 2 8 0 10M25 8c4 4 4 12 0 16" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/></svg>',
    zurueck: '<svg viewBox="0 0 32 32"><path d="M20 6L9 16l11 10" stroke="#333" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sprech: '<svg viewBox="0 0 32 32" width="30" height="30"><path d="M4 6h24v15H14l-7 6v-6H4z" fill="none" stroke="#2E7D32" stroke-width="2.5" stroke-linejoin="round"/><circle cx="11" cy="13.5" r="1.8" fill="#2E7D32"/><circle cx="16" cy="13.5" r="1.8" fill="#2E7D32"/><circle cx="21" cy="13.5" r="1.8" fill="#2E7D32"/></svg>',
    lampe: '<svg viewBox="0 0 32 32" width="30" height="30"><path d="M16 4a9 9 0 0 0-5 16.5V24h10v-3.5A9 9 0 0 0 16 4z" fill="#FFD54A" stroke="#B88A00" stroke-width="2"/><rect x="12" y="25" width="8" height="3" rx="1" fill="#888"/></svg>',
  };
  function lautBtn(text, v = 'a') {
    if (typeof text !== 'function') merke(text, v);
    return h('button', { class: 'rund', 'aria-label': 'Vorlesen', html: ICON.laut, onclick: e => { e.stopPropagation(); say(typeof text === 'function' ? text() : text, v); } });
  }

  /* ---------- Figuren ---------- */
  const ROBO = `<svg viewBox="0 0 100 120" class="robo"><line x1="50" y1="6" x2="50" y2="20" stroke="#556" stroke-width="4"/><circle cx="50" cy="6" r="6" fill="#E02020"/>
    <rect x="18" y="20" width="64" height="48" rx="14" fill="#9FD3F0" stroke="#3A6E8C" stroke-width="4"/>
    <circle cx="37" cy="42" r="8" fill="#fff" stroke="#3A6E8C" stroke-width="3"/><circle cx="63" cy="42" r="8" fill="#fff" stroke="#3A6E8C" stroke-width="3"/>
    <circle cx="38" cy="43" r="3.5" fill="#222"/><circle cx="64" cy="43" r="3.5" fill="#222"/>
    <path d="M38 56q12 8 24 0" stroke="#3A6E8C" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <rect x="26" y="72" width="48" height="36" rx="10" fill="#9FD3F0" stroke="#3A6E8C" stroke-width="4"/>
    <circle cx="42" cy="88" r="5" fill="#1E5BD8"/><circle cx="58" cy="88" r="5" fill="#E02020"/>
    <line x1="26" y1="80" x2="12" y2="92" stroke="#3A6E8C" stroke-width="5" stroke-linecap="round"/><line x1="74" y1="80" x2="88" y2="92" stroke="#3A6E8C" stroke-width="5" stroke-linecap="round"/></svg>`;
  const KINDER = `<svg viewBox="0 0 120 100"><circle cx="35" cy="28" r="16" fill="#F2C9A0" stroke="#333" stroke-width="3"/><path d="M15 95c0-28 40-28 40 0" fill="#FFD54A" stroke="#333" stroke-width="3"/>
    <circle cx="85" cy="28" r="16" fill="#C98F5E" stroke="#333" stroke-width="3"/><path d="M65 95c0-28 40-28 40 0" fill="#7CC47F" stroke="#333" stroke-width="3"/>
    <rect x="45" y="58" width="30" height="22" rx="4" fill="#fff" stroke="#333" stroke-width="3"/></svg>`;
  const SPIELER = { robo: { name: 'Robo', zeichen: '🤖' }, k1: { name: 'Kind 1', zeichen: '★' }, k2: { name: 'Kind 2', zeichen: '●' }, du: { name: 'Du', zeichen: '★' } };

  /* ---------- Grundgerüst ---------- */
  let cfg = null, mode = null;
  function kopf(back) {
    const ton = h('button', { class: 'rund', 'aria-label': 'Automatisch vorlesen', title: 'Automatisch vorlesen', html: ICON.laut });
    ton.onclick = () => { autoRead = !autoRead; ton.classList.toggle('an', autoRead); if (autoRead) say('Ich lese dir vor.'); else stopAll(); };
    ton.classList.toggle('an', autoRead);
    return h('header', { class: 'kopf' },
      back ? h('button', { class: 'rund', 'aria-label': 'Zurück', html: ICON.zurueck, onclick: back }) : null,
      h('div', { class: 'nr' }, cfg.code),
      h('h1', { html: `${cfg.title}<small>${cfg.lernleiter}</small>` }),
      ton);
  }
  function screen(back) {
    document.body.innerHTML = '';
    document.body.append(kopf(back));
    const m = h('main'); document.body.append(m); window.scrollTo(0, 0); return m;
  }
  function init(c) {
    cfg = c;
    document.documentElement.style.setProperty('--ms', c.farbe || '#1E5BD8');
    document.title = `${c.code} ${c.title}`;
    startScreen();
  }
  function startScreen() {
    const m = screen(null);
    const intro = cfg.intro;
    m.append(h('div', { class: 'start' },
      h('div', { class: 'schritte' },
        h('div', { style: 'display:flex;align-items:center;gap:10px' }, h('b', { style: 'flex:1' }, 'So geht das Spiel:'), lautBtn(intro.join(' '))),
        h('ol', {}, intro.map(t => h('li', { html: t })))),
      h('div', { class: 'modi' },
        h('button', { class: 'modus', onclick: () => go('robo'), html: ROBO + '<span>Ich spiele mit Robo</span>' }),
        h('button', { class: 'modus', onclick: () => go('zwei'), html: KINDER + '<span>Wir spielen zu zweit</span>' }))));
  }
  function go(m) { mode = m; cfg.start(m, screen(startScreen)); }

  /* Robo-Zeile mit Sprechblase */
  function roboZeile(parent) {
    const txt = h('div', { class: 'txt' });
    let last = '';
    const fig = h('div', { class: 'figur', html: ROBO });
    let robo = true;
    const row = h('div', { class: 'robozeile' }, fig, h('div', { class: 'blase' }, txt, lautBtn(() => last, 'r')));
    parent.append(row);
    return {
      el: row,
      sag(t, vorlesen = true, anzeige = null) { last = t; txt.innerHTML = anzeige == null ? t : anzeige; merke(t, 'r'); if (autoRead && vorlesen) say(t, 'r'); },
      nochmal() { say(last, 'r'); },
      zeige(b) { row.classList.toggle('versteckt', !b); robo = b; },
    };
  }

  /* Overlay-Dialoge */
  function dialog(content, unten = false) {
    const ov = h('div', { class: 'overlay' + (unten ? ' unten' : '') }, h('div', { class: 'dialog' }, content));
    document.body.append(ov);
    return () => ov.remove();
  }
  function sprichSo(saetze, wer = null) {
    saetze = [].concat(saetze);
    return new Promise(res => {
      const knopf = mode === 'zwei' ? 'Gesagt!' : 'Ich habe es gesagt.';
      const zu = dialog([
        h('div', { class: 'sprich-titel', html: ICON.sprech + (wer ? `Sprich so · ${wer}` : 'Sprich so:') }),
        ...saetze.map(s => h('div', { class: 'sprich', style: 'margin-bottom:10px' }, h('div', { class: 'txt', html: s }), lautBtn(s))),
        h('div', { class: 'knopfreihe' }, h('button', { class: 'btn ok', onclick: () => { zu(); res(); } }, knopf))]);
      if (autoRead) say(saetze.join(' '));
    });
  }
  function hinweis(html, extra = null, knopf = 'Ich probiere es nochmal.') {
    return new Promise(res => {
      const zu = dialog([
        h('h2', { html: ICON.lampe + 'Tipp' }),
        h('div', { class: 'hinweis', style: 'display:flex;gap:12px;align-items:center' }, h('div', { style: 'flex:1', html }), lautBtn(html)),
        extra,
        h('div', { class: 'knopfreihe' }, h('button', { class: 'btn', onclick: () => { zu(); res(); } }, knopf))]);
      if (autoRead) say(html);
    });
  }
  function frage(html, optionen) { /* optionen: [{text, cls, wert}] */
    return new Promise(res => {
      const zu = dialog([
        h('div', { class: 'blase', style: 'margin-bottom:8px' }, h('div', { class: 'txt', html }), lautBtn(html)),
        h('div', { class: 'knopfreihe' }, optionen.map(o => h('button', { class: 'btn ' + (o.cls || ''), onclick: () => { zu(); res(o.wert); } }, o.text)))], true);
      if (autoRead) say(html);
    });
  }

  /* Torte zur Selbsteinschätzung */
  function torteSVG(viertel) {
    const r = 44, c = 48;
    let p = '';
    if (viertel === 4) p = `<circle cx="${c}" cy="${c}" r="${r}" fill="#FFB74D"/>`;
    else { const a = viertel * Math.PI / 2; const x = c + r * Math.sin(a), y = c - r * Math.cos(a);
      p = `<path d="M${c} ${c}L${c} ${c - r}A${r} ${r} 0 ${viertel > 2 ? 1 : 0} 1 ${x.toFixed(1)} ${y.toFixed(1)}Z" fill="#FFB74D"/>`; }
    return `<svg viewBox="0 0 96 96"><circle cx="${c}" cy="${c}" r="${r}" fill="#fff"/>${p}
      <circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="#333" stroke-width="3"/>
      <path d="M${c} ${c - r}V${c + r}M${c - r} ${c}H${c + r}" stroke="#333" stroke-width="1.5" stroke-dasharray="3 3"/></svg>`;
  }
  function ende(text) {
    const m = screen(startScreen);
    const T = ['Ich brauche noch Hilfe.', 'Ich kann es ein bisschen.', 'Ich kann es gut.', 'Ich kann es sicher.'];
    const rz = roboZeile(m); rz.sag(text);
    const weiter = h('div', { class: 'versteckt', style: 'text-align:center' },
      h('p', { style: 'font-size:26px' }, h('b', {}, 'Danke! '), 'Du legst die Karte zurück in den Ordner.'),
      h('div', { class: 'knopfreihe' },
        h('button', { class: 'btn', onclick: () => go(mode) }, 'Nochmal spielen'),
        h('button', { class: 'btn hell', onclick: startScreen }, 'Zum Anfang')));
    const torten = T.map((t, i) => {
      const b = h('button', { class: 'torte', html: torteSVG(i + 1) + `<span>${t}</span>` });
      b.onclick = () => { torten.forEach(x => x.classList.remove('wahl')); b.classList.add('wahl'); weiter.classList.remove('versteckt'); if (autoRead) say(t); };
      return b;
    });
    m.append(h('div', { class: 'schritte', style: 'margin:0 auto;text-align:center' },
      h('div', { style: 'display:flex;align-items:center;gap:10px;justify-content:center' }, h('b', {}, 'Wie gut kannst du das? Du tippst auf eine Torte.'), lautBtn('Wie gut kannst du das? Du tippst auf eine Torte.')),
      h('div', { class: 'torten' }, torten)), weiter);
  }

  /* Zahlentastatur */
  function tastatur(onKey) {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    return h('div', { class: 'tasten' },
      keys.map(k => h('button', { onclick: () => onKey(k) }, k)),
      h('button', { class: 'weg', style: 'grid-column:span 2', onclick: () => onKey('weg') }, '⌫ löschen'),
      h('button', { class: 'weg', style: 'grid-column:span 3;background:#2E7D32;color:#fff;border-color:#2E7D32', onclick: () => onKey('ok') }, 'fertig ✓'));
  }
  /* Eingabe in mehrere Felder: felder = [{el, soll}] -> Promise, löst wenn alle richtig */
  function eingabe(parent, felder, { maxLen = 4, beiFehler } = {}) {
    let idx = 0, fehler = 0;
    const setAktiv = i => { idx = i; felder.forEach((f, j) => f.el.classList.toggle('aktiv', j === i)); };
    felder.forEach((f, j) => { f.el.textContent = ''; f.el.onclick = () => setAktiv(j); if (SAMMELN) f.el.dataset.soll = f.soll; });
    setAktiv(0);
    return new Promise(res => {
      const tk = tastatur(async k => {
        const f = felder[idx];
        if (k === 'weg') { f.el.textContent = f.el.textContent.slice(0, -1); f.el.classList.remove('falsch', 'richtig'); return; }
        if (k !== 'ok') { if (f.el.textContent.length < maxLen) f.el.textContent += k; f.el.classList.remove('falsch'); return; }
        if (f.el.textContent === '') return;
        if (+f.el.textContent === f.soll) {
          f.el.classList.add('richtig'); f.el.classList.remove('aktiv'); f.el.onclick = null;
          const next = felder.findIndex(x => !x.el.classList.contains('richtig'));
          if (next < 0) { tk.remove(); res(fehler); } else { fehler = 0; setAktiv(next); }
        } else {
          f.el.classList.add('falsch'); fehler++;
          if (beiFehler) await beiFehler(idx, fehler, +f.el.textContent);
          f.el.textContent = ''; f.el.classList.remove('falsch');
        }
      });
      parent.append(tk);
    });
  }

  /* Wer ist dran (zu zweit) */
  function dranAnzeige(parent) {
    const el = h('div', { class: 'dran' }); parent.append(el);
    return { set(key, zusatz = 'ist dran.') { const s = SPIELER[key]; if (key === 'du') zusatz = zusatz.replace(/^ist /, 'bist ').replace(/^rechnet/, 'rechnest').replace(/^rät/, 'rätst').replace(/^prüft/, 'prüfst'); el.innerHTML = `<span class="zeichen">${s.zeichen}</span>${s.name} ${zusatz}`; }, el };
  }


  /* ---------- Material und Bausteine für viele Apps ---------- */
  // Zehnerstreifen + Einerplättchen. z, e: Anzahl; opt.rotZ/rotE: wie viele davon rot (2. Zahl); opt.weg: durchgestrichene Einer
  function zahlBild(z, e, opt = {}) {
    const { rotZ = 0, rotE = 0, klein = false, wegZ = 0, wegE = 0 } = opt;
    const w = klein ? 12 : 18, gap = klein ? 3 : 5, cell = klein ? 11 : 16;
    const box = h('div', { class: 'zbild', style: `display:inline-flex;gap:${gap * 2}px;align-items:flex-end;padding:6px` });
    const zs = h('div', { style: `display:flex;gap:${gap}px;align-items:flex-end` });
    for (let i = 0; i < z; i++) {
      const rot = i >= z - rotZ, weg = i >= z - wegZ;
      const st = h('div', { style: `display:grid;grid-template-rows:repeat(10,${cell}px);width:${w}px;border:2px solid ${rot ? '#E02020' : '#1E5BD8'};border-radius:4px;background:${rot ? '#FFD9D9' : '#D6E3FF'};${weg ? 'opacity:.25;' : ''}` });
      for (let k = 0; k < 10; k++) st.append(h('div', { style: `border-bottom:${k < 9 ? '1px solid ' + (rot ? '#E02020' : '#1E5BD8') : '0'}` }));
      zs.append(st);
    }
    const es = h('div', { style: `display:grid;grid-template-columns:repeat(2,${cell + 2}px);gap:${gap}px;align-content:end` });
    for (let i = 0; i < e; i++) {
      const rot = i >= e - rotE, weg = i >= e - wegE;
      es.append(h('div', { style: `width:${cell + 2}px;height:${cell + 2}px;border-radius:50%;background:${rot ? '#E02020' : '#1E5BD8'};${weg ? 'opacity:.25;' : ''}` }));
    }
    if (z) box.append(zs);
    if (e) box.append(es);
    if (!z && !e) box.append(h('span', { style: 'color:#999' }, 'leer'));
    return box;
  }
  // Würfelmaterial: Hunderterplatten, Zehnerstangen, Einerwürfel
  function wuerfelMaterial(hu, z, e, opt = {}) {
    const box = h('div', { style: 'display:inline-flex;gap:10px;align-items:flex-end;padding:6px;flex-wrap:wrap' });
    const col = opt.farbe || '#1E5BD8', bg = opt.farbe === '#E02020' ? '#FFD9D9' : '#D6E3FF';
    const s = opt.klein ? 4 : 5;
    for (let i = 0; i < hu; i++) {
      const p = h('div', { style: `display:grid;grid-template-columns:repeat(10,${s}px);grid-template-rows:repeat(10,${s}px);gap:1px;padding:2px;border:2px solid ${col};background:${col}` });
      for (let k = 0; k < 100; k++) p.append(h('div', { style: `background:${bg}` }));
      box.append(p);
    }
    const zs = h('div', { style: 'display:flex;gap:3px;align-items:flex-end' });
    for (let i = 0; i < z; i++) {
      const st = h('div', { style: `display:grid;grid-template-rows:repeat(10,${s}px);gap:1px;padding:2px;border:2px solid ${col};background:${col}` });
      for (let k = 0; k < 10; k++) st.append(h('div', { style: `width:${s}px;background:${bg}` }));
      zs.append(st);
    }
    if (z) box.append(zs);
    const es = h('div', { style: `display:grid;grid-template-columns:repeat(3,${s + 6}px);gap:3px` });
    for (let i = 0; i < e; i++) es.append(h('div', { style: `width:${s + 6}px;height:${s + 6}px;border:2px solid ${col};background:${bg}` }));
    if (e) box.append(es);
    return box;
  }
  // Stellentafel (H Z E oder Z E) mit Ziffern
  function stellentafel(werte, stellen = 'ZE', farbe = '#222') {
    const t = h('div', { style: 'display:inline-grid;grid-template-columns:repeat(' + stellen.length + ',48px);border:2px solid #222;border-radius:6px;overflow:hidden;background:#fff' });
    for (const c of stellen) t.append(h('div', { style: 'background:#EDEDED;text-align:center;font-weight:700;border-right:1px solid #222' }, c));
    werte.forEach(v => t.append(h('div', { style: `text-align:center;font-size:30px;font-weight:700;color:${farbe};border-top:2px solid #222;border-right:1px solid #222;height:48px;line-height:48px` }, String(v))));
    return t;
  }
  // Würfel: zeigt ein rollendes Würfelbild und liefert die Augenzahl
  const AUGEN = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
  function wuerfelBild(n) {
    const d = h('div', { style: 'display:inline-grid;grid-template-columns:repeat(3,18px);grid-template-rows:repeat(3,18px);gap:4px;padding:10px;border:3px solid #222;border-radius:14px;background:#fff' });
    for (let i = 1; i <= 9; i++) d.append(h('div', { style: `border-radius:50%;${AUGEN[n].includes(i) ? 'background:#222' : ''}` }));
    return d;
  }
  async function wuerfeln(parent, max = 6) {
    const platz = h('div', { style: 'display:flex;justify-content:center;margin:8px 0' }); parent.append(platz);
    let n = 1;
    for (let i = 0; i < 8; i++) { n = 1 + rnd(max); platz.innerHTML = ''; platz.append(wuerfelBild(n)); await wait(70 + i * 15); }
    return { n, platz };
  }
  // Eine Zahl eingeben (mit Tipps in Stufen). Liefert Anzahl der Fehler.
  async function zahlFrage(parent, vorText, soll, tipps = [], nachText = '') {
    const f = h('span', { class: 'feld' });
    const zeile = h('div', { class: 'zeile', style: 'font-size:28px;text-align:center;margin:12px 0;display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap' },
      h('span', { html: vorText }), f, nachText ? h('span', { html: nachText }) : null);
    parent.append(zeile);
    try { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
    return eingabe(parent, [{ el: f, soll }], { beiFehler: async (i, n) => { const t = tipps[Math.min(n, tipps.length) - 1]; if (t) await hinweis(typeof t === 'function' ? t() : t); } });
  }
  // Offene Karten zum Antippen (für Quartett, Trio, Domino …)
  const kartenCss = `.okarte{border:3px solid #333;border-radius:14px;background:#fff;min-height:96px;display:flex;align-items:center;justify-content:center;padding:6px;font-size:30px;font-weight:700}
    .okarte.gewaehlt{box-shadow:0 0 0 5px #FFD54A}.okarte.weg{visibility:hidden}.okarte.robo-wahl{box-shadow:0 0 0 5px #9FD3F0}`;
  document.head.append(h('style', {}, kartenCss));

  // Legematte zum Legen mit Knöpfen (+/–). stellen: 'ZE' oder 'HZE'. Liefert {el, wert(), setze(), werte}
  function legematte(parent, opt = {}) {
    const stellen = opt.stellen || 'ZE', max = opt.max || 9;
    const werte = Object.fromEntries([...stellen].map(c => [c, 0]));
    const box = h('div', { style: 'background:#fff;border:3px solid #ccc;border-radius:16px;padding:10px;display:grid;grid-template-columns:repeat(' + stellen.length + ',1fr);gap:10px;max-width:' + (stellen.length * 260) + 'px;margin:8px auto' });
    const NAME = { H: 'Hunderter', Z: 'Zehner', E: 'Einer' };
    const felder = {};
    for (const c of stellen) {
      const bild = h('div', { style: 'min-height:200px;display:flex;align-items:flex-end;justify-content:center' });
      const anz = h('b', { style: 'font-size:22px' });
      const plus = h('button', { class: 'btn hell', style: 'padding:6px 14px;min-height:48px', 'aria-label': NAME[c] + ' dazu' }, '+');
      const minus = h('button', { class: 'btn hell', style: 'padding:6px 14px;min-height:48px', 'aria-label': NAME[c] + ' weg' }, '–');
      plus.onclick = () => { if (werte[c] < max) { werte[c]++; zeichne(); } };
      minus.onclick = () => { if (werte[c] > 0) { werte[c]--; zeichne(); } };
      felder[c] = { bild, anz };
      box.append(h('div', { style: 'border:2px dashed #999;border-radius:10px;padding:6px;display:flex;flex-direction:column;align-items:center;gap:6px' },
        h('b', {}, c), bild, anz, opt.nurAnzeige ? null : h('div', { style: 'display:flex;gap:8px' }, minus, plus)));
    }
    function zeichne() {
      for (const c of stellen) {
        const b = felder[c].bild; b.innerHTML = '';
        if (stellen.includes('H')) b.append(c === 'H' ? wuerfelMaterial(werte.H, 0, 0, { klein: true }) : c === 'Z' ? wuerfelMaterial(0, werte.Z, 0) : wuerfelMaterial(0, 0, werte.E));
        else b.append(c === 'Z' ? zahlBild(werte.Z, 0, { klein: true }) : zahlBild(0, werte.E));
        felder[c].anz.textContent = `${werte[c]} ${NAME[c]}`;
      }
    }
    zeichne(); parent.append(box);
    return { el: box, werte, setze(o) { Object.assign(werte, o); zeichne(); }, wert() { return (werte.H || 0) * 100 + (werte.Z || 0) * 10 + (werte.E || 0); } };
  }

  /* Memory für alle Paar-Spiele. paare: [{id, a: () => Element, b: () => Element, text}] 
     cfg: { offen, satzJa(p) -> [Sätze], beschreibe(k) -> 'Text', hinweisNein(k1,k2) } */
  async function memory(main, rz, mode, cfg) {
    document.head.append(h('style', {}, `.mgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:820px;margin:0 auto}
      .mk2{min-height:120px;border-radius:14px;border:3px solid #333;background:#fff;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:700;padding:6px}
      .mk2.zu{background:repeating-linear-gradient(45deg,#FFF6D5 0 12px,#F5E7B3 12px 24px)}.mk2.weg{visibility:hidden}.mk2.robo-wahl{box-shadow:0 0 0 6px #9FD3F0}
      @media (max-width:700px){.mgrid{grid-template-columns:repeat(3,1fr)}}`));
    const kopf = h('div', { style: 'display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:10px' });
    const dran = dranAnzeige(kopf);
    const schachtel = h('div', { style: 'display:flex;gap:6px;flex-wrap:wrap;align-items:center' }, h('b', {}, cfg.ablage || 'Unsere Paare: '));
    kopf.append(schachtel); main.append(kopf);
    const grid = h('div', { class: 'mgrid' }); main.append(grid);
    const karten = shuffle(cfg.paare.flatMap(p => [{ p, seite: 'a' }, { p, seite: 'b' }]));
    karten.forEach(k => { k.el = h('button', { class: 'mk2' + (cfg.offen ? '' : ' zu') }); grid.append(k.el); k.offen = !!cfg.offen; k.gesehen = false; zeig(k); });
    function zeig(k) { k.el.className = 'mk2' + (k.weg ? ' weg' : k.offen ? '' : ' zu'); k.el.innerHTML = ''; if (k.offen && !k.weg) k.el.append(k.p[k.seite]()); }
    const da = () => karten.filter(k => !k.weg);
    const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    let zug = 0;
    const wer = id => mode === 'zwei' ? SPIELER[id].name : null;
    async function aufdecken(k) { k.offen = true; k.gesehen = true; zeig(k); await wait(250); }
    async function abschluss(k1, k2, passt) {
      if (passt) {
        await wait(400); k1.weg = k2.weg = true; zeig(k1); zeig(k2);
        schachtel.append(h('span', { style: 'background:#fff;border:2px solid #2E7D32;border-radius:10px;padding:2px 10px;font-weight:700', html: k1.p.text }));
      } else if (!cfg.offen) { await wait(500); k1.offen = k2.offen = false; zeig(k1); zeig(k2); }
    }
    while (da().length) {
      const id = ids[zug++ % 2];
      dran.set(id);
      if (id === 'robo') {
        rz.sag('Jetzt bin ich dran. Ich decke zwei Karten auf.');
        await wait(1000);
        const bek = da().filter(k => k.gesehen || cfg.offen);
        let k1, k2;
        const paar = bek.map(a => [a, bek.find(b => b !== a && b.p === a.p)]).find(x => x[1]);
        if (paar && Math.random() < 0.65) [k1, k2] = paar;
        else { const d = shuffle(da()); k1 = d[0]; k2 = d.find(x => x !== k1 && (Math.random() < 0.35 ? x.p === k1.p : true)) || d[1]; }
        for (const k of [k1, k2]) { k.el.classList.add('robo-wahl'); await aufdecken(k); k.el.classList.add('robo-wahl'); await wait(600); }
        const passt = k1.p === k2.p, irrt = !passt && Math.random() < 0.45, beh = passt || irrt;
        rz.sag(beh ? 'Die Karten passen zusammen.' : 'Die Karten passen nicht zusammen.');
        let f = 0;
        for (;;) {
          const a = await frage(`Robo sagt: ${cfg.beschreibe(k1)} und ${cfg.beschreibe(k2)} ${beh ? 'passen zusammen' : 'passen nicht zusammen'}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
          if (a === (beh === passt)) break;
          f++; await hinweis(f === 1 ? 'Schau dir beide Karten genau an.' : cfg.hinweisNein(k1, k2, passt));
        }
        k1.el.classList.remove('robo-wahl'); k2.el.classList.remove('robo-wahl');
        rz.sag(irrt ? 'Oh, danke! Du hast meinen Fehler gefunden.' : 'Danke fürs Prüfen!');
        if (passt) await sprichSo(cfg.satzJa(k1.p));
        await abschluss(k1, k2, passt);
        continue;
      }
      if (mode === 'robo') rz.sag('Du bist dran. Du deckst zwei Karten auf.');
      const wahl = [];
      await new Promise(res => da().forEach(k => k.el.onclick = async () => {
        if (wahl.includes(k)) return;
        wahl.push(k); if (!k.offen) await aufdecken(k); k.el.style.boxShadow = '0 0 0 5px #FFD54A';
        if (wahl.length === 2) { da().forEach(x => x.el.onclick = null); res(); }
      }));
      const [k1, k2] = wahl;
      const passt = k1.p === k2.p;
      let f = 0;
      for (;;) {
        const a = await frage(`${cfg.beschreibe(k1)} und ${cfg.beschreibe(k2)}: Passen die Karten zusammen?`, [{ text: 'Ja, sie passen', cls: 'ok', wert: true }, { text: 'Nein', cls: 'nein', wert: false }]);
        if (a === passt) break;
        f++; await hinweis(f === 1 ? 'Schau dir beide Karten genau an.' : cfg.hinweisNein(k1, k2, passt));
      }
      k1.el.style.boxShadow = k2.el.style.boxShadow = '';
      if (passt) await sprichSo(cfg.satzJa(k1.p), wer(id));
      await abschluss(k1, k2, passt);
    }
  }

  /* Domino: aufgaben [{a, op, b}] -> Kette. Jede Karte: links Ergebnis der vorigen Aufgabe, rechts neue Aufgabe. */
  async function domino(main, rz, mode, aufgaben) {
    document.head.append(h('style', {}, `.kette{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:10px 0}
      .dk{display:flex;border:3px solid #333;border-radius:12px;background:#fff;font-weight:700;font-size:24px;overflow:hidden}
      .dk>div{padding:10px 12px;min-width:70px;text-align:center}.dk>div+div{border-left:3px solid #333}
      .hand{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:12px 0}.hand .dk{font-size:28px;cursor:pointer}
      .dk.gewaehlt{box-shadow:0 0 0 5px #FFD54A}.dk.robo-wahl{box-shadow:0 0 0 5px #9FD3F0}`));
    const erg = t => t.op === '+' ? t.a + t.b : t.a - t.b;
    const at = t => `<span class="blau">${t.a}</span> ${t.op} <span class="rot">${t.b}</span>`;
    const kopf = h('div'); const dran = dranAnzeige(kopf); main.append(kopf);
    const kette = h('div', { class: 'kette' }); main.append(kette);
    const handBox = h('div', { class: 'hand' }); main.append(handBox);
    const karte = (links, rechtsHtml) => h('div', { class: 'dk' }, h('div', {}, links), h('div', { html: rechtsHtml || 'Ende' }));
    kette.append(karte('Start', at(aufgaben[0])));
    // Karten: Ergebnis von Aufgabe i | Aufgabe i+1
    const stapel = aufgaben.map((t, i) => ({ links: erg(t), rechts: aufgaben[i + 1] }));
    const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    for (let i = 0; i < aufgaben.length; i++) {
      const t = aufgaben[i], r = erg(t), id = ids[i % 2];
      dran.set(id);
      const rest = stapel.filter(k => !k.gelegt);
      const hand = shuffle(rest).slice(0, Math.min(4, rest.length));
      if (!hand.includes(stapel[i])) hand[0] = stapel[i];
      handBox.innerHTML = '';
      const els = shuffle(hand).map(k => { const e = karte(k.links, k.rechts ? at(k.rechts) : 'Ende'); e.k = k; handBox.append(e); return e; });
      if (id === 'robo') {
        rz.sag(`Ich rechne ${t.a} ${t.op} ${t.b}.`);
        await wait(1200);
        const irrt = els.length > 1 && Math.random() < 0.4;
        const w = irrt ? els.find(e => e.k !== stapel[i]) : els.find(e => e.k === stapel[i]);
        w.classList.add('robo-wahl');
        rz.sag(`Das Ergebnis ist ${w.k.links}. Ich lege die Karte mit ${w.k.links} an.`);
        let f = 0;
        for (;;) {
          const x = await frage(`Robo sagt: ${t.a} ${t.op} ${t.b} = ${w.k.links}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
          if (x === !irrt) break;
          f++; await hinweis(f === 1 ? `Rechne selbst: ${t.a} ${t.op} ${t.b}.` : `${t.a} ${t.op} ${t.b} = ${r}.`);
        }
        if (irrt) { rz.sag(`Oh, danke! Das Ergebnis ist ${r}.`); await sprichSo([`${t.a} ${t.op} ${t.b} = ${r}.`, `Robo legt die Karte mit ${r} an.`]); }
        else rz.sag('Danke fürs Prüfen!');
      } else {
        if (mode === 'robo') rz.sag(`Du rechnest ${t.a} ${t.op} ${t.b}. Du suchst die Karte mit dem Ergebnis.`);
        handBox.prepend(h('div', { style: 'width:100%;text-align:center;font-size:26px', html: `Du rechnest ${at(t)}. Tippe die Karte mit dem Ergebnis an.` }));
        let f = 0;
        for (;;) {
          const w = await new Promise(res => els.forEach(e => e.onclick = () => res(e)));
          if (w.k === stapel[i]) break;
          f++; await hinweis(f === 1 ? `Rechne zuerst die kleine Aufgabe mit den Einern. Die Zehner bleiben gleich.` : `${t.a} ${t.op} ${t.b} = ${r}. Suche die Karte mit ${r}.`);
        }
        await sprichSo([`Ich rechne ${t.a} ${t.op} ${t.b}.`, `Das Ergebnis ist ${r}.`, `Ich lege die Karte mit ${r} an.`], mode === 'zwei' ? SPIELER[id].name : null);
      }
      stapel[i].gelegt = true;
      kette.append(karte(stapel[i].links, stapel[i].rechts ? at(stapel[i].rechts) : 'Ende'));
      await wait(400);
    }
    handBox.innerHTML = '';
  }

  // Zahlwort (0–1000), wie in audio_texte.py
  const EIN = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn'];
  const ZEH = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig'];
  function zahlwort(n) {
    if (n < 20) return EIN[n];
    if (n < 100) { const e = n % 10, z = Math.floor(n / 10); return e ? (e === 1 ? 'ein' : EIN[e]) + 'und' + ZEH[z] : ZEH[z]; }
    if (n < 1000) { const hu = Math.floor(n / 100), r = n % 100; return (hu === 1 ? 'ein' : EIN[hu]) + 'hundert' + (r ? zahlwort(r) : ''); }
    return 'eintausend';
  }
  /* Kooperatives Sammel- oder Abbauspiel mit Würfel (Stellen: klein -> groß).
     cfg: { art: 'sammeln'|'abbauen', klein: 'Einer'|'Zehner', gross: 'Zehner'|'Hunderter', start, ziele:[leicht, normal], material: (gross, klein) => Element } */
  async function wuerfelSpiel(main, rz, mode, cfg) {
    document.head.append(h('style', {}, `.matten{display:grid;grid-template-columns:1fr 1fr;gap:14px}.matte{background:#fff;border:3px solid #ccc;border-radius:16px;padding:10px;min-height:230px}
      .matte.amzug{border-color:var(--ms)}.matte h3{margin:0 0 6px;font-size:20px;display:flex;justify-content:space-between}.felder{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .feldze{border:2px dashed #999;border-radius:10px;min-height:170px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:4px}
      .steuer{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:10px 0;align-items:center}@media (max-width:800px){.matten{grid-template-columns:1fr}}`));
    const { klein, gross } = cfg, K = klein[0], G = gross[0], sammeln = cfg.art === 'sammeln';
    const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    const kopf = h('div'); const dran = dranAnzeige(kopf); main.append(kopf);
    const matten = h('div', { class: 'matten' }); main.append(matten);
    const steuer = h('div', { class: 'steuer' }); main.append(steuer);
    const sp = {};
    ids.forEach(id => {
      const el = h('div', { class: 'matte' }); const t = h('h3', {}, `${SPIELER[id].zeichen} ${SPIELER[id].name}`, h('span'));
      const fg = h('div', { class: 'feldze' }), fk = h('div', { class: 'feldze' });
      el.append(t, h('div', { class: 'felder' }, fg, fk)); matten.append(el); sp[id] = { g: 0, k: 0, el, fg, fk, st: t.lastChild };
    });
    const zeichne = id => { const p = sp[id]; p.fg.innerHTML = ''; p.fk.innerHTML = ''; p.fg.append(cfg.material(p.g, 0), h('b', {}, G)); p.fk.append(cfg.material(0, p.k), h('b', {}, K)); p.st.textContent = `${p.g} ${G}  ${p.k} ${K}`; };
    const nm = id => mode === 'zwei' ? SPIELER[id].name : null;
    const ziel = await frage(sammeln ? `Wie viele ${gross} sammelt ihr?` : `Mit wie vielen ${gross}n startet ihr?`, [{ text: `${cfg.ziele[0]} ${gross} (leichter)`, cls: 'hell', wert: cfg.ziele[0] }, { text: `${cfg.ziele[1]} ${gross}`, wert: cfg.ziele[1] }]);
    ids.forEach(id => { if (!sammeln) sp[id].g = ziel; zeichne(id); });
    const fertig = id => sammeln ? sp[id].g >= ziel : sp[id].g === 0 && sp[id].k === 0;
    const wert = p => sammeln ? null : p.g * 10 + p.k;
    async function kindZug(id) {
      const p = sp[id]; steuer.innerHTML = '';
      const w = h('button', { class: 'btn' }, 'Würfeln'); steuer.append(w); await new Promise(r => w.onclick = r); steuer.innerHTML = '';
      let { n } = await wuerfeln(steuer);
      if (!sammeln && n > wert(p)) { n = wert(p); await hinweis(`Du hast nur noch ${n} ${klein}. Du nimmst alle weg.`, null, 'OK'); }
      if (!sammeln) await sprichSo(`Ich muss ${n} ${klein} wegnehmen.`, nm(id));
      let anz = 0; const vorher = p.k;
      const info = h('span', { style: 'font-size:22px' });
      const eins = h('button', { class: 'btn hell' }, sammeln ? `+ 1 ${klein.replace(/r$/, 'r')}` : `– 1 ${klein}`);
      const tausch = h('button', { class: 'btn hell' }, sammeln ? `10 ${klein} gegen 1 ${gross} tauschen` : `1 ${gross} in 10 ${klein} tauschen`);
      const ok = h('button', { class: 'btn ok' }, 'Fertig');
      steuer.append(h('div', { class: 'steuer', style: 'width:100%' }, eins, tausch, ok, info));
      const upd = () => { info.textContent = `${sammeln ? 'Dazugelegt' : 'Weggenommen'}: ${anz} von ${n}`; zeichne(id); };
      let th = 0;
      eins.onclick = async () => {
        if (anz >= n) { await hinweis(`Du hast ${n} gewürfelt. Mehr geht nicht.`); return; }
        if (!sammeln && p.k === 0) { th++; await hinweis(th === 1 ? `Im ${K}-Feld ist nichts mehr. Was kannst du tun?` : `Tippe auf „1 ${gross} in 10 ${klein} tauschen“.`); return; }
        p.k += sammeln ? 1 : -1; anz++; upd();
      };
      tausch.onclick = async () => {
        if (sammeln) {
          if (p.k < 10) { await hinweis(`Im ${K}-Feld sind ${p.k} ${klein}. Erst bei 10 tauschst du.`); return; }
          p.k -= 10; p.g++; zeichne(id); await sprichSo([`Ich habe 10 ${klein}.`, `Ich tausche sie gegen 1 ${gross}.`], nm(id));
        } else {
          if (p.g === 0) { await hinweis(`Du hast keinen ${gross} mehr.`); return; }
          if (p.k >= n - anz) { await hinweis(`Du hast noch genug ${klein}.`); return; }
          p.g--; p.k += 10; zeichne(id); await sprichSo([`Ich tausche 1 ${gross} gegen 10 ${klein}.`], nm(id));
        }
      };
      upd();
      let f = 0;
      for (;;) {
        await new Promise(r => ok.onclick = r);
        if (anz !== n) { f++; await hinweis(`Du hast ${n} gewürfelt. ${sammeln ? 'Lege' : 'Nimm'} genau ${n} ${klein} ${sammeln ? 'dazu' : 'weg'}.`); if (f > 2) { p.k = sammeln ? vorher + n - 10 * 0 : p.k - (n - anz); anz = n; upd(); } continue; }
        if (sammeln && p.k >= 10) { f++; await hinweis(f === 1 ? `Schau ins ${K}-Feld. Hast du 10 ${klein} oder mehr?` : `Tippe auf „10 ${klein} gegen 1 ${gross} tauschen“.`); continue; }
        break;
      }
      steuer.innerHTML = '';
      await sprichSo(`Ich habe jetzt ${p.g} ${gross} und ${p.k} ${klein}.`, nm(id));
    }
    async function roboZug() {
      const p = sp.robo; steuer.innerHTML = ''; rz.sag('Ich würfle.');
      let { n } = await wuerfeln(steuer);
      if (!sammeln) n = Math.min(n, wert(p));
      rz.sag(sammeln ? `Ich habe ${n} gewürfelt. Ich lege ${n} ${klein} dazu.` : `Ich muss ${n} ${klein} wegnehmen.`);
      await wait(1000);
      const mussTauschen = sammeln ? p.k + n >= 10 : p.k < n;
      if (sammeln) { p.k += n; zeichne('robo'); await wait(700); }
      if (mussTauschen) {
        const frag = sammeln ? `Robo hat ${p.k} ${klein}. Was muss Robo tun?` : `Robo hat ${p.k} ${klein} und muss ${n} wegnehmen. Was muss Robo tun?`;
        if (Math.random() < 0.5) {
          rz.sag('Was mache ich jetzt?');
          let f = 0;
          for (;;) {
            const a = await frage(frag, [{ text: sammeln ? `10 ${klein} gegen 1 ${gross} tauschen` : `1 ${gross} in 10 ${klein} tauschen`, cls: 'ok', wert: true }, { text: 'Nichts', cls: 'hell', wert: false }]);
            if (a) break; f++; await hinweis(f === 1 ? `Zähle Robos ${klein}.` : `Robo muss tauschen.`);
          }
          rz.sag('Danke! Ich tausche.');
        } else rz.sag(sammeln ? `Ich habe 10 ${klein}. Ich tausche sie gegen 1 ${gross}.` : `Ich tausche 1 ${gross} gegen 10 ${klein}.`);
        await wait(900);
        if (sammeln) { p.k -= 10; p.g++; } else { p.g--; p.k += 10; }
        zeichne('robo'); await wait(600);
      }
      if (!sammeln) { p.k -= n; zeichne('robo'); }
      rz.sag(`Ich habe jetzt ${p.g} ${gross} und ${p.k} ${klein}.`); await wait(1300);
    }
    let i = 0;
    while (!ids.every(fertig)) {
      const id = ids[i++ % 2]; if (fertig(id)) continue;
      ids.forEach(x => sp[x].el.classList.toggle('amzug', x === id)); dran.set(id);
      if (id === 'robo') await roboZug(); else await kindZug(id);
    }
    steuer.innerHTML = '';
    return ziel;
  }

  /* Rechen-Runden für viele Übungs- und Spielkarten.
     cfg: { aufgaben: [t], schritte(t) -> [{vor, soll, nach, tipps}], sprich(t) -> [Sätze], erg(t),
            roboText(t, r) -> 'So rechnet Robo …', roboFehler(t) -> falsches Ergebnis, anzeige(t) -> Element|null,
            rahmen: null | 'stapel' | 'popcorn' | 'rennen', felder: 12 } */
  async function rechenRunden(main, rz, mode, cfg) {
    document.head.append(h('style', {}, `.rr-auf{font-size:48px;font-weight:700;text-align:center;margin:6px 0}.rr-zeile{display:flex;gap:10px;align-items:center;justify-content:center;font-size:28px;margin:8px 0;flex-wrap:wrap}
      .rr-rahmen{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:6px 0;align-items:center}
      .bahn{display:grid;grid-template-columns:repeat(var(--n),1fr);gap:3px;max-width:900px;margin:6px auto}.bahn div{height:44px;border:2px solid #999;border-radius:6px;background:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;position:relative}
      .bahn div.ziel{background:#EAF6EA;border-color:#2E7D32}.pop{display:inline-block;width:22px;height:22px;border-radius:50%;background:#FFE9A8;border:2px solid #E7B400}`));
    const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    const kopf = h('div', { style: 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px' });
    const dran = dranAnzeige(kopf); const zaehler = h('b'); kopf.append(zaehler); main.append(kopf);
    const rahmen = h('div', { class: 'rr-rahmen' }); main.append(rahmen);
    const box = h('div'); main.append(box);
    let stapel = 0; const pos = Object.fromEntries(ids.map(i => [i, 0])); const N = cfg.felder || 12;
    function zeigeRahmen() {
      rahmen.innerHTML = '';
      if (cfg.rahmen === 'stapel') rahmen.append(h('b', {}, `Unser Stapel: ${stapel} Karten`));
      if (cfg.rahmen === 'popcorn') { rahmen.append(h('b', {}, 'Unsere Popcorn-Schüssel: ')); for (let i = 0; i < stapel; i++) rahmen.append(h('span', { class: 'pop' })); }
      if (cfg.rahmen === 'rennen') {
        const bahn = h('div', { class: 'bahn', style: `--n:${N + 1}` });
        for (let i = 0; i <= N; i++) {
          const f = h('div', { class: i === N ? 'ziel' : '' }, i === N ? 'Ziel' : String(i || 'Start'));
          ids.forEach(id => { if (pos[id] === i) f.append(h('span', { style: 'position:absolute;top:-6px;' + (id === ids[0] ? 'left:2px' : 'right:2px') + ';font-size:22px' }, SPIELER[id].zeichen)); });
          bahn.append(f);
        }
        rahmen.append(h('div', { style: 'width:100%' }, bahn));
      }
    }
    async function belohnung(id) {
      if (cfg.rahmen === 'stapel' || cfg.rahmen === 'popcorn') { stapel++; zeigeRahmen(); }
      if (cfg.rahmen === 'rennen') {
        const { n, platz } = await wuerfeln(box);
        pos[id] = Math.min(N, pos[id] + n); zeigeRahmen(); await wait(600); platz.remove();
      }
    }
    zeigeRahmen();
    const fertig = () => cfg.rahmen === 'rennen' ? ids.every(i => pos[i] >= N) : false;
    let i = 0;
    for (const t of cfg.aufgaben) {
      if (fertig()) break;
      let id = ids[i++ % 2];
      if (cfg.rahmen === 'rennen' && pos[id] >= N) id = ids.find(x => pos[x] < N);
      dran.set(id, id === 'robo' ? 'rechnet. Du prüfst.' : (id === 'du' ? 'rechnest.' : 'rechnet.'));
      if (cfg.rahmen !== 'rennen') zaehler.textContent = `Aufgabe ${i} von ${cfg.aufgaben.length}`;
      box.innerHTML = '';
      box.append(h('div', { class: 'rr-auf', html: `<span class="blau">${t.a}</span> ${t.op} <span class="rot">${t.b}</span>` }));
      const anz = cfg.anzeige ? cfg.anzeige(t) : null; if (anz) box.append(h('div', { style: 'text-align:center' }, anz));
      const r = cfg.erg(t);
      if (id === 'robo') {
        const irrt = Math.random() < 0.45, rr = irrt ? cfg.roboFehler(t) : r;
        rz.sag(cfg.roboText(t, rr));
        box.append(h('div', { class: 'rr-zeile', html: `Robo: <span class="blau">${t.a}</span> ${t.op} <span class="rot">${t.b}</span> = <b>${rr}</b>` }));
        let f = 0;
        for (;;) {
          const a = await frage(`Robo sagt: ${t.a} ${t.op} ${t.b} = ${rr}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
          if (a === (rr === r)) break;
          f++; await hinweis(f === 1 ? `Rechne selbst nach: ${t.a} ${t.op} ${t.b}.` : `${t.a} ${t.op} ${t.b} = ${r}.`);
        }
        if (rr !== r) {
          rz.sag('Oh! Wie heißt das richtige Ergebnis?');
          await zahlFrage(box, `Richtig ist: ${t.a} ${t.op} ${t.b} =`, r, cfg.schritte(t).map(s => s.tipps ? s.tipps[0] : '').filter(Boolean).slice(0, 1).concat([`${t.a} ${t.op} ${t.b} = ${r}.`]));
          rz.sag('Danke! Jetzt verstehe ich es.');
          await sprichSo([`Stimmt nicht.`, `${t.a} ${t.op} ${t.b} = ${r}.`]);
        } else { rz.sag('Danke fürs Prüfen!'); await sprichSo('Stimmt!'); }
        await belohnung('robo');
      } else {
        for (const s of cfg.schritte(t)) {
          const f = h('span', { class: 'feld' });
          box.append(h('div', { class: 'rr-zeile' }, h('span', { html: s.vor }), f, s.nach ? h('span', { html: s.nach }) : null));
          try { f.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
          await eingabe(box, [{ el: f, soll: s.soll }], { beiFehler: async (_, n) => { const tt = (s.tipps || [])[Math.min(n, (s.tipps || []).length) - 1]; if (tt) await hinweis(tt); } });
        }
        await sprichSo(cfg.sprich(t), mode === 'zwei' ? SPIELER[id].name : null);
        if (mode === 'zwei') {
          const p = ids.find(x => x !== id);
          await frage(`${SPIELER[p].name} prüft mit dem Material oder am Rechenstrich. Stimmt es?`, [{ text: 'Stimmt', cls: 'ok', wert: 1 }]);
        } else rz.sag(`Ich prüfe: ${t.a} ${t.op} ${t.b} = ${r}. Das stimmt!`);
        await belohnung(id);
      }
      if (!fertig()) await frage('Nächste Aufgabe?', [{ text: 'Weiter', wert: 1 }]);
    }
    return stapel;
  }

  return { $, h, rnd, shuffle, wait, say, lautBtn, init, roboZeile, dialog, sprichSo, hinweis, frage, ende, eingabe, tastatur, dranAnzeige, SPIELER, ICON,
    zahlBild, wuerfelMaterial, stellentafel, wuerfelBild, wuerfeln, zahlFrage, legematte, memory, domino, zahlwort, wuerfelSpiel, rechenRunden,
    get mode() { return mode; }, get autoRead() { return autoRead; } };
})();
