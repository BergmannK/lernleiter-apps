/* ZR 1000 Teil B · Karte 3.3 · Zehner-Popcorn */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const A = B.viele(8, () => { const hu = 1 + rnd(8), z = 1 + rnd(9), d = 2 + rnd(8), op = rnd(2) ? '+' : '–'; if (op === '+' ? z + d <= 10 || hu === 9 : z >= d) return null; return { a: hu * 100 + z * 10, op, b: d * 10 }; });
      const n = await LL.rechenRunden(main, rz, mode, {
        aufgaben: A, erg: B.erg, rahmen: 'popcorn',
        schritte: t => { const plus = t.op === '+', st = plus ? Math.ceil(t.a / 100) * 100 : Math.floor(t.a / 100) * 100, t1 = Math.abs(st - t.a); return [
          { vor: plus ? `Bis ${st} fehlen` : `Zurück bis ${st} sind es`, soll: t1, tipps: [`Wie viele Zehner sind es von ${t.a} bis ${st}?`, `Es sind ${t1}.`] },
          { vor: `Ich zerlege ${t.b} in ${t1} und`, soll: t.b - t1, tipps: [`${t1} und wie viel sind zusammen ${t.b}?`, `${t1} und ${t.b - t1} sind ${t.b}.`] },
          { vor: `${B.auf(t)} =`, soll: B.erg(t), tipps: [`Von ${st} rechnest du noch ${t.b - t1} ${plus ? 'weiter' : 'zurück'}.`, `${B.rt(t)} = ${B.erg(t)}.`] }]; },
        sprich: t => [`Ich rechne ${B.rt(t)}.`, 'Ich rechne bis zum Hunderter.', `Das Ergebnis ist ${B.erg(t)}.`],
        roboText: (t, r) => `Ich rechne ${B.rt(t)}. Ich rechne bis zum Hunderter. Das Ergebnis ist ${r}.`,
        roboFehler: t => B.erg(t) + (t.op === '+' ? -100 : 100),
      });
      LL.ende(mode === 'robo' ? `Super! ${n} Popcorn sind in unserer Schüssel.` : `Super! ${n} Popcorn sind in eurer Schüssel.`);

    })();
  }
  LL.init({ code: '3.3', title: 'Zehner-Popcorn', lernleiter: B.LLname(3), farbe: '#2BA9C2', intro: ['Du ziehst eine Karte und rechnest. Du sagst deinen Rechenweg.', 'Robo prüft.', 'Richtig? Dann springt ein Popcorn in eure gemeinsame Schüssel.', 'Dann rechnet Robo und du prüfst.'], start });
})();
