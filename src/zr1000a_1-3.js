/* ZR 1000 Teil A · Karte 1.3 · Hunderter-Sammler (Zehnerstangen sammeln, 10 Zehner gegen 1 Hunderter) */
(() => {
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const ziel = await LL.wuerfelSpiel(main, rz, mode, { art: 'sammeln', klein: 'Zehner', gross: 'Hunderter', ziele: [3, 5], material: (g, k) => LL.wuerfelMaterial(g, k, 0, { klein: true }) });
      LL.ende(mode === 'robo' ? `Super! Wir haben beide ${ziel} Hunderter gesammelt.` : `Super! Ihr habt beide ${ziel} Hunderter gesammelt.`);
    })();
  }
  LL.init({
    code: '1.3', title: 'Hunderter-Sammler', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 1 · Spiel', farbe: '#E8B10E',
    intro: ['Du würfelst. Du nimmst so viele Zehnerstangen.', 'Hast du 10 Zehnerstangen? Du tauschst sie gegen 1 Hunderterplatte.', 'Du sagst nach jedem Zug deine Zahl.', 'Robo sammelt auch. Ihr sammelt beide, bis jeder 5 Hunderter hat.'],
    start,
  });
})();
