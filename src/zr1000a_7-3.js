/* ZR 1000 Teil A · Karte 7.3 · Wo bin ich? (Zahlen am Zahlenstrahl bis 1000 schätzen) */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `.rs{width:100%;max-width:1000px;display:block;margin:8px auto}.mitte{text-align:center;margin:10px 0}
  .zk{display:inline-flex;min-width:150px;height:96px;border:3px solid #333;border-radius:14px;align-items:center;justify-content:center;font-size:46px;font-weight:700;background:#fff}`));
  const NS = 'http://www.w3.org/2000/svg';

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const zkBox = h('div', { class: 'mitte' }); main.append(zkBox);
    const W = 1000, H = 170, x0 = 40, x1 = W - 40, y = 100;
    const X = n => x0 + n / 1000 * (x1 - x0), N = px => (px - x0) / (x1 - x0) * 1000;
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'rs');
    const el = (t, a, txt) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; svg.append(e); return e; };
    main.append(svg);
    const feld = h('div'); main.append(feld);
    let nurEnden = false, temp = [];
    function zeichneStrahl() {
      svg.innerHTML = '';
      el('line', { x1: x0, y1: y, x2: x1, y2: y, stroke: '#222', 'stroke-width': 4 });
      for (let n = 0; n <= 1000; n += 10) {
        const lang = n % 100 === 0 ? 20 : n % 50 === 0 ? 13 : 7;
        el('line', { x1: X(n), y1: y - lang, x2: X(n), y2: y + lang, stroke: '#222', 'stroke-width': n % 100 === 0 ? 3 : 1 });
        if (n % 100 === 0 && (!nurEnden || n === 0 || n === 1000)) el('text', { x: X(n), y: y + 46, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 700 }, n);
      }
      svg._hit = el('rect', { x: x0 - 20, y: 0, width: x1 - x0 + 40, height: H, fill: 'transparent', class: 'hit' });
    }
    const klammer = (n, farbe) => { const g = [el('path', { d: `M${X(n)} ${y - 10} l-9 -26 h18 z`, fill: farbe }), el('text', { x: X(n), y: y - 42, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: farbe }, Math.round(n))]; temp.push(...g); return g; };
    const tippOrt = () => new Promise(r => svg._hit.onclick = ev => { const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const p = pt.matrixTransform(svg.getScreenCTM().inverse()); svg._hit.onclick = null; r(Math.max(0, Math.min(1000, N(p.x)))); });
    const hu = n => Math.floor(n / 100) * 100;

    async function runde(id) {
      temp.forEach(e => e.remove()); temp = [];
      feld.innerHTML = ''; zkBox.innerHTML = '';
      dran.set(id);
      const n = (1 + rnd(98)) * 10 + (rnd(3) === 0 ? rnd(10) : 0);
      zkBox.append(h('div', { class: 'zk' }, String(n)));
      let s;
      if (id === 'robo') {
        rz.sag(`Ich ziehe die ${n}. Ich schätze, wo sie liegt.`);
        await wait(1200);
        s = Math.max(0, Math.min(1000, n + (rnd(2) ? 1 : -1) * (rnd(2) ? 10 + rnd(30) : 60 + rnd(60))));
        klammer(s, '#3A6E8C');
        rz.sag(`Ich schätze: Die ${n} liegt hier.`);
      } else {
        feld.append(h('p', { class: 'mitte', html: `<b>Tippe auf den Zahlenstrahl</b>, wo die ${n} ungefähr liegt.` }));
        if (mode === 'robo') rz.sag(`Wo liegt die ${n}? Tippe auf den Zahlenstrahl.`);
        s = await tippOrt();
        klammer(s, '#1E5BD8');
        await LL.sprichSo([`Ich schätze: Die ${n} liegt hier.`, `${n} liegt zwischen ${hu(n)} und ${hu(n) + 100}.`], mode === 'zwei' ? LL.SPIELER[id].name : null);
      }
      // Prüfen
      await wait(500);
      const r = el('line', { x1: X(n), y1: y - 24, x2: X(n), y2: y + 24, stroke: '#2E7D32', 'stroke-width': 5 }); temp.push(r);
      temp.push(el('text', { x: X(n), y: y + 66, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 700, fill: '#2E7D32' }, `${n}`));
      const ab = Math.abs(Math.round(s) - n), nah = ab < 50;
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Grün ist die richtige Stelle. Die Schätzung war bei ungefähr ${Math.round(s / 10) * 10}. Ist das weniger als 50 entfernt?`, [{ text: 'Ja, nah dran', cls: 'ok', wert: true }, { text: 'Nein, weiter weg', cls: 'nein', wert: false }]);
        if (a === nah) break;
        f++; await LL.hinweis(f === 1 ? 'Zwischen zwei langen Strichen sind 100. Zwischen zwei mittleren Strichen sind 50.' : `Der Abstand ist ungefähr ${Math.round(ab / 10) * 10}.`);
      }
      await LL.sprichSo(nah ? 'Das ist nah dran!' : `Das ist noch weit weg. ${n} liegt zwischen ${hu(n)} und ${hu(n) + 100}.`, mode === 'zwei' ? LL.SPIELER[id].name : null);
      if (id === 'robo') rz.sag(nah ? 'Juhu, nah dran!' : 'Beim nächsten Mal schaue ich zuerst auf die Hunderter.');
    }

    (async () => {
      nurEnden = await LL.frage('Wie ist der Zahlenstrahl beschriftet?', [{ text: 'Alle Hunderter', wert: false }, { text: 'Nur 0 und 1000 (schwerer)', cls: 'hell', wert: true }]);
      zeichneStrahl();
      const plan = mode === 'robo' ? ['du', 'robo', 'du', 'robo', 'du', 'robo'] : ['k1', 'k2', 'k1', 'k2', 'k1', 'k2'];
      for (const id of plan) { await runde(id); await LL.frage('Nächste Karte?', [{ text: 'Weiter', wert: 1 }]); }
      LL.ende(mode === 'robo' ? 'Super! Wir haben gut geschätzt.' : 'Super! Ihr habt gut geschätzt.');
    })();
  }

  LL.init({
    code: '7.3', title: 'Wo bin ich?', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 7 · Spiel', farbe: '#C62828',
    intro: ['Du ziehst eine Zahlenkarte.', 'Du tippst auf die Stelle am Zahlenstrahl, die du schätzt.', 'Ihr prüft: Wie weit ist die Schätzung von der richtigen Stelle weg?', 'Weniger als 50? Dann ist es nah dran. Dann ist Robo dran.'],
    start,
  });
})();
