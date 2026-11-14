/* ZR 1000 Teil B · Karte 5.3 · Stopp-Rennen */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const A = B.viele(40, () => { const hu = 1 + rnd(8), z = 2 + rnd(8), d = 2 + rnd(7), e = 1 + rnd(9), op = rnd(2) ? '+' : '–'; const a = hu * 100 + z * 10, b = d * 10 + e; if (op === '+' ? z + d < 10 || hu === 9 : z >= d) return null; return { a, op, b }; });
      await LL.rechenRunden(main, rz, mode, { aufgaben: A, erg: B.erg, rahmen: 'rennen', felder: 14, schritte: t => { const plus = t.op === '+', st = plus ? Math.ceil(t.a / 100) * 100 : Math.floor(t.a / 100) * 100, t1 = Math.abs(st - t.a); return [
          { vor: plus ? `Bis ${st} fehlen` : `Zurück bis ${st} sind es`, soll: t1, tipps: [`Wie viel ist es von ${t.a} bis ${st}?`, `Es sind ${t1}.`] },
          { vor: `Ich zerlege ${t.b} in ${t1} und`, soll: t.b - t1, tipps: [`${t1} und wie viel sind zusammen ${t.b}?`, `${t1} und ${t.b - t1} sind ${t.b}.`] },
          { vor: `${B.auf(t)} =`, soll: B.erg(t), tipps: [`Von ${st} rechnest du noch ${t.b - t1} ${plus ? 'weiter' : 'zurück'}.`, `${B.rt(t)} = ${B.erg(t)}.`] }]; },
        sprich: t => [`Ich rechne ${B.rt(t)}.`, 'Ich rechne bis zum Hunderter.', `Das Ergebnis ist ${B.erg(t)}.`],
        roboText: (t, r) => `Ich rechne ${B.rt(t)}. Das Ergebnis ist ${r}.`, roboFehler: t => B.erg(t) + (t.op === '+' ? -100 : 100) });
      LL.ende(mode === 'robo' ? 'Super! Wir sind beide im Ziel.' : 'Super! Ihr seid beide im Ziel.');
    })();
  }
  LL.init({ code: '5.3', title: 'Stopp-Rennen', lernleiter: B.LLname(5), farbe: '#E2557F', intro: ['Du ziehst eine Aufgabenkarte und rechnest laut.', 'Robo prüft. Richtig? Dann würfelst du und ziehst deine Figur.', 'Dann rechnet Robo und du prüfst.', 'Ihr bringt beide Figuren gemeinsam ins Ziel.'], start });
})();
