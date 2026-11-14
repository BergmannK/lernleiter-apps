/* ZR 1000 Teil B · Karte 5.2 · Mit Stopp rechnen */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const A = B.viele(30, () => { const hu = 1 + rnd(8), z = 2 + rnd(8), d = 2 + rnd(7), e = 1 + rnd(9), op = rnd(2) ? '+' : '–'; const a = hu * 100 + z * 10, b = d * 10 + e; if (op === '+' ? z + d < 10 || hu === 9 : z >= d) return null; return { a, op, b }; });
      const P = A.filter(t => t.op === '+').slice(0, 3), M = A.filter(t => t.op === '–').slice(0, 3);
      await LL.rechenRunden(main, rz, mode, { aufgaben: P.concat(M), erg: B.erg, schritte: t => { const plus = t.op === '+', st = plus ? Math.ceil(t.a / 100) * 100 : Math.floor(t.a / 100) * 100, t1 = Math.abs(st - t.a); return [
          { vor: plus ? `Bis ${st} fehlen` : `Zurück bis ${st} sind es`, soll: t1, tipps: [`Wie viel ist es von ${t.a} bis ${st}?`, `Es sind ${t1}.`] },
          { vor: `Ich zerlege ${t.b} in ${t1} und`, soll: t.b - t1, tipps: [`${t1} und wie viel sind zusammen ${t.b}?`, `${t1} und ${t.b - t1} sind ${t.b}.`] },
          { vor: `${B.auf(t)} =`, soll: B.erg(t), tipps: [`Von ${st} rechnest du noch ${t.b - t1} ${plus ? 'weiter' : 'zurück'}.`, `${B.rt(t)} = ${B.erg(t)}.`] }]; },
        sprich: t => { const st = t.op === '+' ? Math.ceil(t.a / 100) * 100 : Math.floor(t.a / 100) * 100, t1 = Math.abs(st - t.a); return [`Ich rechne ${B.rt(t)}. ${t.op === '+' ? `Bis ${st} fehlen ${t1}.` : `Zurück bis ${st} sind es ${t1}.`}`, `Ich zerlege ${t.b} in ${t1} und ${t.b - t1}.`, `Das Ergebnis ist ${B.erg(t)}.`]; },
        roboText: (t, r) => `Ich rechne ${B.rt(t)} mit Stopp am Hunderter. Das Ergebnis ist ${r}.`, roboFehler: t => B.erg(t) + (t.op === '+' ? -100 : 100) });
      LL.ende(mode === 'robo' ? 'Super! Wir haben mit Stopp gerechnet.' : 'Super! Ihr habt mit Stopp gerechnet.');
    })();
  }
  LL.init({ code: '5.2', title: 'Mit Stopp rechnen', lernleiter: B.LLname(5), farbe: '#E2557F', intro: ['Du ziehst eine Aufgabenkarte.', 'Du überlegst: Wie viel fehlt bis zum Hunderter?', 'Du zerlegst die zweite Zahl und rechnest mit Stopp.', 'Robo prüft. Zuerst kommen Plus-Aufgaben, dann Minus-Aufgaben.'], start });
})();
