/* ZR 100 · Karte 4.7 · Dazwischen? (ungefähr am Rechenstrich 0–50–100 eintragen) */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `
  .rs{width:100%;max-width:980px;display:block;margin:8px auto}
  .zk{display:inline-flex;width:130px;height:96px;border:3px solid #333;border-radius:14px;align-items:center;justify-content:center;font-size:48px;font-weight:700;background:#fff}
  .mitte{text-align:center;margin:10px 0}`));
  const NS = 'http://www.w3.org/2000/svg';

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const W = 980, H = 170, x0 = 50, x1 = W - 50, y = 110;
    const X = n => x0 + n / 100 * (x1 - x0), N = px => (px - x0) / (x1 - x0) * 100;
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'rs');
    const el = (t, a, txt) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; svg.append(e); return e; };
    el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: '#222', 'stroke-width': 5 });
    for (const n of [0, 50, 100]) { el('line', { x1: X(n), y1: y - 22, x2: X(n), y2: y + 22, stroke: '#222', 'stroke-width': 4 }); el('text', { x: X(n), y: y + 52, 'text-anchor': 'middle', 'font-size': 28, 'font-weight': 700 }, n); }
    const hit = el('rect', { x: x0 - 20, y: 0, width: x1 - x0 + 40, height: H, fill: 'transparent', style: 'cursor:pointer', class: 'hit' });
    main.append(svg);
    const feld = h('div'); main.append(feld);
    const markiere = (n, farbe) => { el('line', { x1: X(n), y1: y - 14, x2: X(n), y2: y + 14, stroke: farbe, 'stroke-width': 4 }); el('text', { x: X(n), y: y - 22, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: farbe }, n); };
    const tippOrt = () => new Promise(r => hit.onclick = ev => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); hit.onclick = null; r(Math.max(0, Math.min(100, N(p.x)))); });
    const haelfte = n => n < 50 ? 'zwischen 0 und 50' : 'zwischen 50 und 100';
    const naeher = n => { const a = n < 50 ? 0 : 50, b = n < 50 ? 50 : 100; return n - a < b - n ? a : b; };

    async function kindTraegtEin(n, wer) {
      feld.innerHTML = '';
      dran.set(wer, wer === 'du' ? 'bist dran.' : 'ist dran.');
      feld.append(h('div', { class: 'mitte' }, h('div', { class: 'zk' }, String(n))));
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Wo liegt die ${n}?`, [{ text: 'zwischen 0 und 50', wert: n < 50 }, { text: 'zwischen 50 und 100', wert: n >= 50 }]);
        if (a) break;
        f++; await LL.hinweis(f === 1 ? `Ist ${n} kleiner oder größer als 50?` : `${n} ist ${n < 50 ? 'kleiner' : 'größer'} als 50.`);
      }
      const nah = naeher(n);
      f = 0;
      for (;;) {
        const a = await LL.frage(`Ist ${n} näher an ${n < 50 ? 0 : 50} oder an ${n < 50 ? 50 : 100}?`, [{ text: `näher an ${n < 50 ? 0 : 50}`, wert: n < 50 ? 0 : 50 }, { text: `näher an ${n < 50 ? 50 : 100}`, wert: n < 50 ? 50 : 100 }]);
        if (a === nah || Math.abs(n % 50 - 25) === 0) break;
        f++; await LL.hinweis(f === 1 ? `Wie weit ist es von ${n} bis ${n < 50 ? 0 : 50}? Und bis ${n < 50 ? 50 : 100}?` : `${n} ist näher an ${nah}.`);
      }
      feld.append(h('p', { class: 'mitte', html: `<b>Tippe auf den Rechenstrich</b>, wo ungefähr die ${n} liegt.` }));
      if (mode === 'robo') rz.sag(`Trage die ${n} ungefähr ein.`);
      f = 0;
      for (;;) {
        const p = await tippOrt();
        if (Math.abs(p - n) <= 8) break;
        f++; await LL.hinweis(f === 1 ? `Du hast bei ungefähr ${Math.round(p)} getippt. Die ${n} liegt ${haelfte(n)}, näher an ${nah}.` : `Die Mitte zwischen 0 und 50 ist 25. Die Mitte zwischen 50 und 100 ist 75. Die ${n} ist ${n < 25 || (n >= 50 && n < 75) ? 'links' : 'rechts'} davon.`);
      }
      markiere(n, '#1E5BD8');
      await LL.sprichSo([`${n} liegt ${haelfte(n)}.`, `${n} ist näher an ${nah}.`, `Ich trage ${n} hier ein.`], mode === 'zwei' ? LL.SPIELER[wer].name : null);
    }

    async function roboTraegtEin(n) {
      feld.innerHTML = '';
      dran.set('robo');
      feld.append(h('div', { class: 'mitte' }, h('div', { class: 'zk' }, String(n))));
      rz.sag(`Ich ziehe die ${n}. Ich trage sie ein.`);
      await wait(1200);
      const irrt = Math.random() < 0.45;
      const ort = irrt ? 100 - n : n + (rnd(7) - 3);
      const strich = el('line', { x1: X(ort), y1: y - 14, x2: X(ort), y2: y + 14, stroke: '#3A6E8C', 'stroke-width': 5 });
      const lab = el('text', { x: X(ort), y: y - 22, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700, fill: '#3A6E8C' }, n);
      rz.sag(`Hier liegt die ${n}.`);
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Robo hat die ${n} eingetragen. Stimmt das ungefähr?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (a === !irrt) break;
        f++; await LL.hinweis(f === 1 ? `Liegt die ${n} zwischen 0 und 50 oder zwischen 50 und 100? Wo hat Robo sie eingetragen?` : `Die ${n} liegt ${haelfte(n)}. Robo hat sie ${haelfte(ort)} eingetragen.`);
      }
      strich.remove(); lab.remove();
      if (irrt) { rz.sag(`Oh, danke! Die ${n} liegt ${haelfte(n)}.`); await LL.sprichSo([`${n} liegt ${haelfte(n)}.`, `${n} ist näher an ${naeher(n)}.`]); }
      else rz.sag('Danke fürs Prüfen!');
      markiere(n, '#3A6E8C');
      await wait(600);
    }

    (async () => {
      const zahlen = []; while (zahlen.length < 6) { const n = 3 + rnd(95); if (n % 25 && !zahlen.some(z => Math.abs(z - n) < 6)) zahlen.push(n); }
      const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
      for (let i = 0; i < zahlen.length; i++) {
        const id = ids[i % 2];
        if (id === 'robo') await roboTraegtEin(zahlen[i]); else await kindTraegtEin(zahlen[i], id);
      }
      feld.innerHTML = '';
      LL.ende(mode === 'robo' ? 'Super! Unser Rechenstrich ist voll.' : 'Super! Euer Rechenstrich ist voll.');
    })();
  }

  LL.init({
    code: '4.7', title: 'Dazwischen?', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 4 · Spiel', farbe: '#EE7F4B',
    intro: ['Du ziehst eine Zahlenkarte.', 'Du sagst: Die Zahl liegt zwischen 0 und 50 oder zwischen 50 und 100.', 'Du trägst die Zahl ungefähr am Rechenstrich ein.', 'Dann ist Robo dran. Du prüfst. Am Ende ist der Rechenstrich voll.'],
    start,
  });
})();
