/* ZR 1000 Teil B · Karte 2.2 · Kleine Aufgabe hilft */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const A = B.viele(6, () => { const hu = 1 + rnd(8), z = rnd(10), d = 1 + rnd(9), op = rnd(2) ? '+' : '–'; if (op === '+' ? z + d > 9 : z < d) return null; return { a: hu * 100 + z * 10, op, b: d * 10 }; });
      await LL.rechenRunden(main, rz, mode, {
        aufgaben: A, erg: B.erg,
        anzeige: t => LL.wuerfelMaterial(Math.floor(t.a / 100), Math.floor(t.a / 10) % 10, 0, { klein: true }),
        schritte: t => { const z = Math.floor(t.a / 10) % 10, d = t.b / 10; return [
          { vor: `Die kleine Aufgabe: ${z} ${t.op} ${d} =`, soll: t.op === '+' ? z + d : z - d, tipps: [`Schau nur auf die Zehner: ${z} Zehner ${t.op} ${d} Zehner.`, `${z} ${t.op} ${d} = ${t.op === '+' ? z + d : z - d}.`] },
          { vor: `Die große Aufgabe: ${B.auf(t)} =`, soll: B.erg(t), tipps: ['Die Hunderter und die Einer bleiben gleich. Nur die Zehner ändern sich.', `${B.rt(t)} = ${B.erg(t)}.`] }]; },
        sprich: t => [`Die kleine Aufgabe ist ${Math.floor(t.a / 10) % 10} ${t.op} ${t.b / 10}.`, `Die große Aufgabe ist ${B.rt(t)}.`, `Das Ergebnis ist ${B.erg(t)}.`],
        roboText: (t, r) => `Die kleine Aufgabe ist ${Math.floor(t.a / 10) % 10} ${t.op} ${t.b / 10}. Das Ergebnis ist ${r}.`,
        roboFehler: t => B.erg(t) + (rnd(2) ? 100 : 1),
      });
      LL.ende(mode === 'robo' ? 'Super! Die kleine Aufgabe hat uns geholfen.' : 'Super! Die kleine Aufgabe hat euch geholfen.');
    })();
  }
  LL.init({ code: '2.2', title: 'Kleine Aufgabe hilft', lernleiter: B.LLname(2), farbe: '#2E9E44', intro: ['Du ziehst eine Aufgabenkarte.', 'Du rechnest zuerst die kleine Aufgabe.', 'Du rechnest dann die große Aufgabe.', 'Robo prüft mit dem Material. Dann tauscht ihr.'], start });
})();
