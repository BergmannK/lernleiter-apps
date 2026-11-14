/* ZR 100 · Karte 7.2 · Domino (ZE plus/minus E ohne Zehnerübergang) */
(() => {
  const { rnd } = LL;
  function aufgaben(op) {
    const L = [], erg = new Set();
    while (L.length < 8) {
      const z = 1 + rnd(8), e = op === '+' ? rnd(6) : 4 + rnd(6), b = op === '+' ? 1 + rnd(9 - e) : 1 + rnd(e);
      if (op === '+' && e + b > 9) continue;
      const a = z * 10 + e, r = op === '+' ? a + b : a - b;
      if (erg.has(r) || a < 11 || b < 1) continue;
      erg.add(r); L.push({ a, op, b });
    }
    return L;
  }
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const op = await LL.frage('Welches Domino spielt ihr?', [{ text: 'Domino plus', wert: '+' }, { text: 'Domino minus', wert: '–' }]);
      await LL.domino(main, rz, mode, aufgaben(op));
      LL.ende(mode === 'robo' ? 'Super! Unsere Domino-Kette ist fertig.' : 'Super! Eure Domino-Kette ist fertig.');
    })();
  }
  LL.init({
    code: '7.2', title: 'Domino', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 7 · Spiel', farbe: '#C62828',
    intro: ['Die Startkarte liegt schon.', 'Du rechnest die Aufgabe auf der Karte.', 'Du suchst die Karte mit dem Ergebnis. Du legst sie an.', 'Dann legt Robo die nächste Karte an. Du prüfst.'],
    start,
  });
})();
