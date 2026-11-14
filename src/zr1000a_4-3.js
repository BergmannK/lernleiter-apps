/* ZR 1000 Teil A · Karte 4.3 · Abbau-Spiel (Zehner wegnehmen, Hunderter tauschen) – kooperativ */
(() => {
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      await LL.wuerfelSpiel(main, rz, mode, { art: 'abbauen', klein: 'Zehner', gross: 'Hunderter', ziele: [3, 5], material: (g, k) => LL.wuerfelMaterial(g, k, 0, { klein: true }) });
      LL.ende(mode === 'robo' ? 'Super! Wir haben beide alles abgebaut.' : 'Super! Ihr habt beide alles abgebaut.');
    })();
  }
  LL.init({
    code: '4.3', title: 'Abbau-Spiel', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 4 · Spiel', farbe: '#EE7F4B',
    intro: ['Du legst 5 Hunderter. Robo auch.', 'Du würfelst. Du nimmst so viele Zehner weg.', 'Zu wenig Zehner? Du tauschst 1 Hunderter gegen 10 Zehner.', 'Ihr baut beide ab, bis ihr nichts mehr habt.'],
    start,
  });
})();
