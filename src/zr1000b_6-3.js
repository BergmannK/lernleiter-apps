/* ZR 1000 Teil B · Karte 6.3 · Rechen-Memory (Aufgabe und Ergebnis) */
(() => {
  const { h, rnd } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const T = B.viele(40, () => { const hu = 1 + rnd(8), z = rnd(8), e = rnd(8), bz = 1 + rnd(9 - z - 1 || 1), be = 1 + rnd(9 - e - 1 || 1); if (z + bz > 9 || e + be > 9) return null; return { a: hu * 100 + z * 10 + e, op: '+', b: bz * 10 + be }; });
      const used = new Set(), paare = [];
      for (const t of T) { const r = B.erg(t); if (used.has(r)) continue; used.add(r); paare.push({ t, text: `${B.rt(t)} = ${r}`, a: () => h('span', { style: 'font-size:26px', html: B.auf(t) }), b: () => h('span', {}, String(r)) }); if (paare.length === 6) break; }
      await LL.memory(main, rz, mode, {
        paare, ablage: 'Unsere Paare: ',
        beschreibe: k => k.seite === 'a' ? `die Aufgabe ${B.rt(k.p.t)}` : `das Ergebnis ${B.erg(k.p.t)}`,
        satzJa: p => [`Meine Aufgabe ist ${B.rt(p.t)}.`, `Das Ergebnis ist ${B.erg(p.t)}.`, 'Das passt!'],
        hinweisNein: (k1, k2, passt) => { const a = [k1, k2].find(k => k.seite === 'a'), e = [k1, k2].find(k => k.seite === 'b'); if (!a || !e) return 'Ein Paar ist immer eine Aufgabe und ein Ergebnis.'; return `${B.rt(a.p.t)} = ${B.erg(a.p.t)}. ${passt ? 'Das passt.' : `Die Ergebniskarte zeigt ${B.erg(e.p.t)}.`}`; },
      });
      LL.ende(mode === 'robo' ? 'Super! Wir haben alle Paare gefunden.' : 'Super! Ihr habt alle Paare gefunden.');
    })();
  }
  LL.init({ code: '6.3', title: 'Rechen-Memory', lernleiter: B.LLname(6), farbe: '#7B4FA0',
    intro: ['Alle Karten liegen verdeckt.', 'Du deckst eine Aufgabenkarte und eine Ergebniskarte auf.', 'Passt das Ergebnis? Dann kommt das Paar zu euren Paaren.', 'Dann ist Robo dran. Du prüfst.'], start });
})();
