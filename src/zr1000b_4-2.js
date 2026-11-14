/* ZR 1000 Teil B · Karte 4.2 · Erst Zehner, dann Einer */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const A = B.viele(6, () => { const hu = 1 + rnd(8), z = rnd(10), e = rnd(10), bz = 1 + rnd(9), be = 1 + rnd(9), op = rnd(2) ? '+' : '–'; if (op === '+' ? z + bz > 9 || e + be > 9 : z < bz || e < be) return null; return { a: hu * 100 + z * 10 + e, op, b: bz * 10 + be }; });
      await LL.rechenRunden(main, rz, mode, { aufgaben: A, erg: B.erg, schritte: t => { const bz = t.b - t.b % 10, be = t.b % 10, m = t.op === '+' ? t.a + bz : t.a - bz; return [
          { vor: `Ich zerlege ${t.b} in`, soll: bz, nach: `und ${be}.`, tipps: ['Wie viele Zehner hat die zweite Zahl?', `${t.b} = ${bz} + ${be}.`] },
          { vor: `${t.a} ${t.op} ${bz} =`, soll: m, tipps: ['Rechne zuerst die Zehner. Nur die Zehnerstelle ändert sich.', `${t.a} ${t.op} ${bz} = ${m}.`] },
          { vor: `${m} ${t.op} ${be} =`, soll: B.erg(t), tipps: ['Rechne dann die Einer.', `${m} ${t.op} ${be} = ${B.erg(t)}.`] }]; }, sprich: t => { const bz = t.b - t.b % 10, be = t.b % 10, m = t.op === '+' ? t.a + bz : t.a - bz; return [`Ich zerlege ${t.b} in ${bz} und ${be}.`, `${t.a} ${t.op} ${bz} = ${m}.`, `${m} ${t.op} ${be} = ${B.erg(t)}.`]; },
        roboText: (t, r) => `Ich rechne erst die Zehner, dann die Einer. ${B.rt(t)} = ${r}.`, roboFehler: t => B.erg(t) + (rnd(2) ? 10 : 1) });
      LL.ende(mode === 'robo' ? 'Super! Erst Zehner, dann Einer.' : 'Super! Ihr habt alle Aufgaben gerechnet.');
    })();
  }
  LL.init({ code: '4.2', title: 'Erst Zehner, dann Einer', lernleiter: B.LLname(4), farbe: '#EE7F4B', intro: ['Du ziehst eine Aufgabenkarte.', 'Du zerlegst die zweite Zahl in Zehner und Einer.', 'Du rechnest erst die Zehner, dann die Einer.', 'Robo prüft. Dann tauscht ihr.'], start });
})();
