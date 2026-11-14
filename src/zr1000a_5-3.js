/* ZR 1000 Teil A · Karte 5.3 · Tausenderbuch-Suche */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}
  .blatt{display:grid;grid-template-columns:auto repeat(10,1fr);gap:3px;max-width:min(640px,calc(100vh - 240px));min-width:320px;margin:8px auto}
  .blatt div{font-size:13px;color:#888;display:flex;align-items:center;justify-content:center}
  .blatt button{aspect-ratio:1;border:1px solid #777;border-radius:5px;background:#fff;font-size:14px;font-weight:700;padding:0}
  .blatt button.an{background:#2E7D32;color:#fff}.blatt button.robo{background:#9FD3F0}
  .wuerfelreihe{display:flex;gap:16px;justify-content:center;align-items:center}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);

    function blatt(b) {
      const g = h('div', { class: 'blatt' }); const F = {};
      g.append(h('div'));
      for (let s = 0; s < 10; s++) g.append(h('div', {}, `Sp. ${s}`));
      for (let z = 0; z < 10; z++) {
        g.append(h('div', {}, `Z. ${z}`));
        for (let s = 0; s < 10; s++) { const n = b * 100 + z * 10 + s; F[n] = h('button', {}, String(n)); g.append(F[n]); }
      }
      return { g, F };
    }
    async function dreiWuerfe(id) {
      const reihe = h('div', { class: 'wuerfelreihe' }); feld.append(reihe);
      const w = [];
      for (const was of ['Blatt', 'Zeile', 'Spalte']) {
        if (id !== 'robo') { const b = h('button', { class: 'btn' }, `Würfeln: ${was}`); reihe.append(b); await new Promise(r => b.onclick = r); b.remove(); }
        const box = h('div', { style: 'text-align:center' }); reihe.append(box);
        const { n, platz } = await LL.wuerfeln(box);
        const wert = n === 6 ? 0 : n; w.push(wert);
        box.append(h('div', { style: 'font-weight:700' }, `${was}: ${wert}`));
        if (id === 'robo') await wait(500);
      }
      return w;
    }

    async function kindSucht(id) {
      feld.innerHTML = '';
      dran.set(id);
      feld.append(h('p', { class: 'mitte', html: 'Du würfelst dreimal: erst das Blatt, dann die Zeile, dann die Spalte. <b>Die 6 zählt als 0.</b>' }));
      const [b, z, s] = await dreiWuerfe(id);
      const n = b * 100 + z * 10 + s;
      await LL.sprichSo(`Mein Würfel zeigt ${b}, ${z}, ${s}.`, mode === 'zwei' ? LL.SPIELER[id].name : null);
      await LL.zahlFrage(feld, `Blatt ${b}, Zeile ${z}, Spalte ${s}. Die Zahl heißt`, n, ['Das Blatt sagt die Hunderter, die Zeile die Zehner, die Spalte die Einer.', `Die Zahl heißt ${n}.`], '.');
      await LL.sprichSo(`Das ist Blatt ${b}, Zeile ${z}, Spalte ${s}. Die Zahl heißt ${n}.`, mode === 'zwei' ? LL.SPIELER[id].name : null);
      feld.append(h('p', { class: 'mitte', html: `Hier ist Blatt ${b} aus dem Tausenderbuch. <b>Tippe die ${n} an.</b>` }));
      const { g, F } = blatt(b); feld.append(g);
      g.scrollIntoView({ behavior: 'smooth', block: 'start' });
      let f = 0;
      for (;;) {
        const t = await new Promise(r => Object.entries(F).forEach(([k, el]) => el.onclick = () => r(+k)));
        if (t === n) { F[n].className = 'an'; break; }
        f++; await LL.hinweis(f === 1 ? `Geh zuerst in Zeile ${z}. Dann gehst du nach rechts bis Spalte ${s}.` : `Die ${n} steht in Zeile ${z}, Spalte ${s}.`);
        if (f >= 3) F[n].className = 'robo';
      }
      await LL.sprichSo('Ich habe sie gefunden!', mode === 'zwei' ? LL.SPIELER[id].name : null);
    }

    async function roboSucht() {
      feld.innerHTML = '';
      dran.set('robo', 'sucht.');
      rz.sag('Ich würfle dreimal.');
      const [b, z, s] = await dreiWuerfe('robo');
      const n = b * 100 + z * 10 + s;
      rz.sag(`Mein Würfel zeigt ${b}, ${z}, ${s}. Die Zahl heißt ${n}. Ich suche sie.`);
      const { g, F } = blatt(b); feld.append(g);
      await wait(1500);
      const irrt = z !== s && Math.random() < 0.45;
      const t = irrt ? b * 100 + s * 10 + z : n;
      F[t].className = 'robo';
      rz.sag(`Ich habe die ${n} gefunden. Hier ist sie.`);
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Robo zeigt auf die ${t}. Robo sucht die ${n}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (a === !irrt) break;
        f++; await LL.hinweis(f === 1 ? 'Lies die Zahl, auf die Robo zeigt.' : `Robo zeigt auf ${t}. Gesucht ist ${n}.`);
      }
      if (irrt) { F[t].className = ''; F[n].className = 'an'; rz.sag(`Oh, ich habe Zeile und Spalte vertauscht. Die ${n} ist hier.`); await LL.sprichSo([`Stimmt nicht, weil Robo Zeile und Spalte vertauscht hat.`]); }
      else { F[n].className = 'an'; rz.sag('Danke fürs Prüfen!'); }
      await wait(800);
    }

    (async () => {
      const plan = mode === 'robo' ? ['du', 'robo', 'du', 'robo'] : ['k1', 'k2', 'k1', 'k2'];
      for (const id of plan) {
        if (id === 'robo') await roboSucht(); else await kindSucht(id);
        await LL.frage('Weiter? Dann tauscht ihr.', [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben alle Zahlen im Tausenderbuch gefunden.' : 'Super! Ihr habt alle Zahlen gefunden.');
    })();
  }

  LL.init({
    code: '5.3', title: 'Tausenderbuch-Suche', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 5 · Spiel', farbe: '#E2557F',
    intro: ['Du würfelst dreimal: erst das Blatt, dann die Zeile, dann die Spalte. Die 6 zählt als 0.', 'Du schreibst die Zahl auf.', 'Du suchst die Zahl im Tausenderbuch.', 'Robo prüft. Dann tauscht ihr.'],
    start,
  });
})();
