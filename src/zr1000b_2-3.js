/* ZR 1000 Teil B · Karte 2.3 · Aufgaben-Tandem */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const A = B.viele(8, () => { const hu = 1 + rnd(8), z = rnd(10), d = 1 + rnd(9), op = rnd(2) ? '+' : '–'; if (op === '+' ? z + d > 9 : z < d) return null; return { a: hu * 100 + z * 10, op, b: d * 10 }; });
      const n = await LL.rechenRunden(main, rz, mode, {
        aufgaben: A, erg: B.erg, rahmen: 'stapel',
        schritte: t => { const z = Math.floor(t.a / 10) % 10, d = t.b / 10; return [
          { vor: `Die kleine Aufgabe: ${z} ${t.op} ${d} =`, soll: t.op === '+' ? z + d : z - d, tipps: [`Schau nur auf die Zehner: ${z} Zehner ${t.op} ${d} Zehner.`, `${z} ${t.op} ${d} = ${t.op === '+' ? z + d : z - d}.`] },
          { vor: `Die große Aufgabe: ${B.auf(t)} =`, soll: B.erg(t), tipps: ['Die Hunderter und die Einer bleiben gleich. Nur die Zehner ändern sich.', `${B.rt(t)} = ${B.erg(t)}.`] }]; },
        sprich: t => { const z = Math.floor(t.a / 10) % 10, d = t.b / 10, k = t.op === '+' ? z + d : z - d; return [`Die kleine Aufgabe ist ${z} ${t.op} ${d} = ${k}.`, `Die große Aufgabe ist ${B.rt(t)} = ${B.erg(t)}.`]; },
        roboText: (t, r) => `Die große Aufgabe ist ${B.rt(t)} = ${r}.`,
        roboFehler: t => B.erg(t) + (t.op === '+' ? 10 : -10),
      });
      LL.ende(mode === 'robo' ? `Super! Wir haben ${n} Karten auf unserem Stapel.` : `Super! Ihr habt ${n} Karten geschafft.`);

    })();
  }
  LL.init({ code: '2.3', title: 'Aufgaben-Tandem', lernleiter: B.LLname(2), farbe: '#2E9E44', intro: ['Du ziehst eine Aufgabenkarte. Du sagst die kleine Aufgabe.', 'Dann sagst du die große Aufgabe und das Ergebnis.', 'Robo rechnet auch. Ihr prüft euch gegenseitig.', 'Jede richtige Karte kommt auf euren gemeinsamen Stapel.'], start });
})();
