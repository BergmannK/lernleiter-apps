/* ZR 1000 Teil B · Karte 1.2 · Hunderter-Päckchen */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const A = B.viele(6, () => { const x = 1 + rnd(9), y = 1 + rnd(9), op = rnd(2) ? '+' : '–'; if (op === '+' ? x + y > 10 : x <= y) return null; return { a: x * 100, op, b: y * 100 }; });
      await LL.rechenRunden(main, rz, mode, {
        aufgaben: A, erg: B.erg,
        anzeige: t => h('div', { style: 'display:flex;gap:16px;justify-content:center' }, LL.wuerfelMaterial(t.a / 100, 0, 0, { klein: true }), t.op === '+' ? LL.wuerfelMaterial(t.b / 100, 0, 0, { klein: true, farbe: '#E02020' }) : h('span')),
        schritte: t => [
          { vor: `Die kleine Aufgabe: ${t.a / 100} ${t.op} ${t.b / 100} =`, soll: B.erg(t) / 100, tipps: ['Rechne nur mit den Hunderterplatten.', `${t.a / 100} ${t.op} ${t.b / 100} = ${B.erg(t) / 100}.`] },
          { vor: `${B.auf(t)} =`, soll: B.erg(t), tipps: [`Die kleine Aufgabe hilft: ${B.erg(t) / 100} Hunderter.`, `${B.erg(t) / 100} Hunderter sind ${B.erg(t)}.`] }],
        sprich: t => [`Ich lege ${B.rt(t)}.`, `${t.a / 100} Hunderter ${t.op === '+' ? 'plus' : 'minus'} ${t.b / 100} Hunderter sind ${B.erg(t) / 100} Hunderter.`, `Das Ergebnis ist ${B.erg(t)}.`],
        roboText: (t, r) => `Ich rechne ${B.rt(t)}. Das Ergebnis ist ${r}.`,
        roboFehler: t => B.erg(t) + (rnd(2) ? 100 : -100),
      });
      LL.ende(mode === 'robo' ? 'Super! Wir haben das Päckchen zusammen gerechnet.' : 'Super! Ihr habt das Päckchen gerechnet.');
    })();
  }
  LL.init({ code: '1.2', title: 'Hunderter-Päckchen', lernleiter: B.LLname(1), farbe: '#E8B10E', intro: ['Du ziehst eine Aufgabenkarte.', 'Du legst die Aufgabe mit Hunderterplatten.', 'Du rechnest. Die kleine Aufgabe hilft: 6 – 2 = 4.', 'Robo prüft. Dann rechnet Robo und du prüfst.'], start });
})();
