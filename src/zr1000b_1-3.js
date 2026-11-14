/* ZR 1000 Teil B · Karte 1.3 · Hunderter-Domino */
(() => {
  const { rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const L = [], erg = new Set();
      while (L.length < 8) {
        const x = 1 + rnd(9), y = 1 + rnd(9), op = rnd(2) ? '+' : '–';
        if (op === '+' ? x + y > 10 : x <= y) continue;
        const r = op === '+' ? x + y : x - y; if (erg.has(r)) continue; erg.add(r);
        L.push({ a: x * 100, op, b: y * 100 });
        if (erg.size >= 9) break;
      }
      await LL.domino(main, rz, mode, L);
      LL.ende(mode === 'robo' ? 'Super! Unsere Domino-Kette ist fertig.' : 'Super! Eure Domino-Kette ist fertig.');
    })();
  }
  LL.init({ code: '1.3', title: 'Hunderter-Domino', lernleiter: B.LLname(1), farbe: '#E8B10E',
    intro: ['Die Startkarte liegt schon.', 'Du rechnest die Aufgabe. Die kleine Aufgabe hilft.', 'Du suchst die Karte mit dem Ergebnis und legst sie an.', 'Dann legt Robo an. Du prüfst. Niemand gewinnt.'], start });
})();
