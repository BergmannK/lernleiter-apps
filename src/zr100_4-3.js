/* ZR 100 · Karte 4.3 · Wer hat mehr? -> kooperativ: Welche Zahl ist größer? */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `
  .vgl{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;max-width:860px;margin:10px auto}
  .vk{background:#fff;border:3px solid #ccc;border-radius:16px;padding:10px;text-align:center}
  .vk .zahl{font-size:56px;font-weight:700}
  .zeichen{width:90px;height:90px;border:3px dashed #999;border-radius:14px;font-size:56px;font-weight:700;display:flex;align-items:center;justify-content:center;background:#fff}
  .mitte{text-align:center;margin:10px 0}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const feld = h('div'); main.append(feld);
    const [A, B] = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    const nm = id => id === 'du' ? 'Du' : LL.SPIELER[id].name;

    async function runde(nr) {
      feld.innerHTML = '';
      let a = 11 + rnd(89), b = 11 + rnd(89);
      if (nr === 2) b = Math.floor(a / 10) * 10 + rnd(10);      // einmal gleich viele Zehner
      if (nr === 4) b = a;                                        // einmal gleich
      const karte = (id, n) => h('div', { class: 'vk' }, h('div', {}, `${LL.SPIELER[id].zeichen} ${nm(id)}`), h('div', { class: 'zahl' }, String(n)), LL.zahlBild(Math.floor(n / 10), n % 10, { klein: true }));
      const zeichen = h('div', { class: 'zeichen' }, '?');
      feld.append(h('div', { class: 'vgl' }, karte(A, a), zeichen, karte(B, b)));
      if (mode === 'robo') rz.sag(`Ich habe die ${b} gezogen. Du hast die ${a}. Wir vergleichen.`);
      const za = Math.floor(a / 10), zb = Math.floor(b / 10);
      // 1. Zehner vergleichen
      const sollZ = za > zb ? 'A' : za < zb ? 'B' : 'gleich';
      let f = 0;
      for (;;) {
        const x = await LL.frage('Du vergleichst zuerst die Zehner. Wer hat mehr Zehner?', [{ text: mode === 'robo' ? 'Ich' : 'Kind 1', wert: 'A' }, { text: mode === 'robo' ? 'Robo' : 'Kind 2', wert: 'B' }, { text: 'Gleich viele', cls: 'hell', wert: 'gleich' }]);
        if (x === sollZ) break;
        f++; await LL.hinweis(f === 1 ? 'Zähle die Zehnerstreifen auf beiden Karten.' : `${a} hat ${za} Zehner. ${b} hat ${zb} Zehner.`);
      }
      let saetze = [`${nm(A) === 'Du' ? 'Ich habe' : nm(A) + ' hat'} ${za} Zehner. ${nm(B) === 'Robo' ? 'Robo hat' : nm(B) + ' hat'} ${zb} Zehner.`];
      if (sollZ === 'gleich') {
        const ea = a % 10, eb = b % 10, sollE = ea > eb ? 'A' : ea < eb ? 'B' : 'gleich';
        f = 0;
        for (;;) {
          const x = await LL.frage('Gleich viele Zehner. Du vergleichst die Einer. Wer hat mehr Einer?', [{ text: mode === 'robo' ? 'Ich' : 'Kind 1', wert: 'A' }, { text: mode === 'robo' ? 'Robo' : 'Kind 2', wert: 'B' }, { text: 'Gleich viele', cls: 'hell', wert: 'gleich' }]);
          if (x === sollE) break;
          f++; await LL.hinweis(f === 1 ? 'Zähle die Einer auf beiden Karten.' : `${a} hat ${ea} Einer. ${b} hat ${eb} Einer.`);
        }
      }
      // 2. Zeichen setzen
      const soll = a > b ? '>' : a < b ? '<' : '=';
      f = 0;
      for (;;) {
        const x = await LL.frage(`Welches Zeichen passt? ${a} ? ${b}`, [{ text: '<', wert: '<' }, { text: '=', wert: '=' }, { text: '>', wert: '>' }]);
        if (x === soll) break;
        f++; await LL.hinweis(f === 1 ? 'Die Spitze zeigt zur kleineren Zahl. Die offene Seite zeigt zur größeren Zahl.' : `${a > b ? `${a} ist größer als ${b}` : a < b ? `${a} ist kleiner als ${b}` : 'Die Zahlen sind gleich'}.`);
      }
      zeichen.textContent = soll; zeichen.style.borderStyle = 'solid';
      saetze.push(a === b ? `${a} ist gleich ${b}.` : a > b ? `${a} ist größer als ${b}.` : `${b} ist größer als ${a}.`);
      await LL.sprichSo(saetze, mode === 'zwei' ? 'Kind 1 und Kind 2' : null);
      if (mode === 'robo') rz.sag(a === b ? 'Wir haben die gleiche Zahl.' : 'Richtig verglichen!');
      await LL.frage('Nächste Karten?', [{ text: 'Weiter', wert: 1 }]);
    }

    (async () => {
      for (let i = 1; i <= 5; i++) await runde(i);
      LL.ende(mode === 'robo' ? 'Super! Wir haben 5 Mal verglichen.' : 'Super! Ihr habt 5 Mal verglichen.');
    })();
  }

  LL.init({
    code: '4.3', title: 'Welche Zahl ist größer?', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 4 · Spiel', farbe: '#EE7F4B',
    intro: ['Du ziehst eine Karte. Robo auch.', 'Du vergleichst zuerst die Zehner.', 'Gleich viele Zehner? Du vergleichst die Einer.', 'Du setzt das Zeichen: kleiner, gleich oder größer.'],
    start,
  });
})();
