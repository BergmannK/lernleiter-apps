/* ZR 1000 Teil B · Karte 7.3 · Rechen-Rennen */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const A = B.viele(40, () => { const a = 120 + rnd(780), e = [7, 8, 9][rnd(3)], b = (2 + rnd(5)) * 10 + e, op = rnd(2) ? '+' : '–'; if (op === '+' ? a + b > 999 : a - b < 100) return null; return { a, op, b }; });
      await LL.rechenRunden(main, rz, mode, { aufgaben: A, erg: B.erg, rahmen: 'rennen', felder: 14, schritte: t => { const r10 = Math.ceil(t.b / 10) * 10, d = r10 - t.b, m = t.op === '+' ? t.a + r10 : t.a - r10, op2 = t.op === '+' ? '–' : '+'; return [
          { vor: `${t.b} ist nah an`, soll: r10, tipps: ['Welcher Zehner kommt kurz nach der zweiten Zahl?', `${t.b} ist nah an ${r10}.`] },
          { vor: `Hilfsaufgabe: ${t.a} ${t.op} ${r10} =`, soll: m, tipps: ['Rechne mit dem Zehner. Nur die Zehner ändern sich.', `${t.a} ${t.op} ${r10} = ${m}.`] },
          { vor: `Ich gehe ${d} ${t.op === '+' ? 'zurück' : 'vor'}: ${m} ${op2} ${d} =`, soll: B.erg(t), tipps: [`Du hast ${d} zu viel ${t.op === '+' ? 'dazugerechnet' : 'weggenommen'}.`, `${m} ${op2} ${d} = ${B.erg(t)}.`] }]; },
        sprich: t => [`Ich rechne ${B.rt(t)} mit der Hilfsaufgabe.`, `Das Ergebnis ist ${B.erg(t)}.`],
        roboText: (t, r) => `Ich rechne ${B.rt(t)} in Schritten. Das Ergebnis ist ${r}.`,
        roboFehler: t => { const d = Math.ceil(t.b / 10) * 10 - t.b; return t.op === '+' ? B.erg(t) + 2 * d : B.erg(t) - 2 * d; } });
      LL.ende(mode === 'robo' ? 'Super! Wir sind beide im Ziel.' : 'Super! Ihr seid beide im Ziel.');
    })();
  }
  LL.init({ code: '7.3', title: 'Rechen-Rennen', lernleiter: B.LLname(7), farbe: '#C62828', intro: ['Du ziehst eine Aufgabenkarte und rechnest.', 'Robo prüft. Richtig? Dann würfelst du und ziehst deine Figur.', 'Dann rechnet Robo und du prüfst.', 'Ihr bringt beide Figuren gemeinsam ins Ziel.'], start });
})();
