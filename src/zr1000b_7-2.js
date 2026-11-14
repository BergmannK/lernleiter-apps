/* ZR 1000 Teil B · Karte 7.2 · Hilfsaufgabe */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const A = B.viele(6, () => { const a = 120 + rnd(780), e = [7, 8, 9][rnd(3)], b = (2 + rnd(5)) * 10 + e, op = rnd(2) ? '+' : '–'; if (op === '+' ? a + b > 999 : a - b < 100) return null; return { a, op, b }; });
      await LL.rechenRunden(main, rz, mode, { aufgaben: A, erg: B.erg, schritte: t => { const r10 = Math.ceil(t.b / 10) * 10, d = r10 - t.b, m = t.op === '+' ? t.a + r10 : t.a - r10, op2 = t.op === '+' ? '–' : '+'; return [
          { vor: `${t.b} ist nah an`, soll: r10, tipps: ['Welcher Zehner kommt kurz nach der zweiten Zahl?', `${t.b} ist nah an ${r10}.`] },
          { vor: `Hilfsaufgabe: ${t.a} ${t.op} ${r10} =`, soll: m, tipps: ['Rechne mit dem Zehner. Nur die Zehner ändern sich.', `${t.a} ${t.op} ${r10} = ${m}.`] },
          { vor: `Ich gehe ${d} ${t.op === '+' ? 'zurück' : 'vor'}: ${m} ${op2} ${d} =`, soll: B.erg(t), tipps: [`Du hast ${d} zu viel ${t.op === '+' ? 'dazugerechnet' : 'weggenommen'}.`, `${m} ${op2} ${d} = ${B.erg(t)}.`] }]; },
        sprich: t => { const r10 = Math.ceil(t.b / 10) * 10, d = r10 - t.b; return [`Ich rechne ${t.a} ${t.op} ${r10}.`, `Ich gehe dann ${d} ${t.op === '+' ? 'zurück' : 'vor'}.`, `Das Ergebnis ist ${B.erg(t)}.`]; },
        roboText: (t, r) => { const r10 = Math.ceil(t.b / 10) * 10; return `Ich rechne mit der Hilfsaufgabe ${t.a} ${t.op} ${r10}. Das Ergebnis ist ${r}.`; },
        roboFehler: t => { const d = Math.ceil(t.b / 10) * 10 - t.b; return t.op === '+' ? B.erg(t) + 2 * d : B.erg(t) - 2 * d; } });
      LL.ende(mode === 'robo' ? 'Super! Die Hilfsaufgabe hat geholfen.' : 'Super! Ihr habt mit der Hilfsaufgabe gerechnet.');
    })();
  }
  LL.init({ code: '7.2', title: 'Hilfsaufgabe', lernleiter: B.LLname(7), farbe: '#C62828', intro: ['Du ziehst eine Aufgabenkarte mit einer Zahl kurz vor dem nächsten Zehner, zum Beispiel 38.', 'Du rechnest mit dem nächsten Zehner: 346 + 40 = 386.', 'Du gehst zurück: 386 – 2 = 384.', 'Robo erklärt deinen Weg. Dann tauscht ihr.'], start });
})();
