/* ZR 100 · Karte 2.5 · Pärchen am Hunderterfeld (Memory: Zahl und Hunderterfeld) */
(() => {
  const { h, rnd } = LL;
  function hunderterfeld(n) {
    const g = h('div', { style: 'display:grid;grid-template-columns:repeat(10,8px);grid-template-rows:repeat(10,8px);gap:1px;padding:3px;background:#999;border:1px solid #666' });
    for (let i = 0; i < 100; i++) {
      const r = Math.floor(i / 10), c = i % 10;
      g.append(h('div', { style: `background:${i < n ? '#1E5BD8' : '#fff'};${c === 4 ? 'margin-right:2px;' : ''}${r === 4 ? 'margin-bottom:2px;' : ''}` }));
    }
    return g;
  }
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const offen = await LL.frage('Wie spielt ihr?', [{ text: 'Karten verdeckt', wert: false }, { text: 'Karten offen (leichter)', cls: 'hell', wert: true }]);
      const zahlen = [];
      while (zahlen.length < 6) { const n = 11 + rnd(89); if (n % 10 && !zahlen.some(x => Math.abs(x - n) < 3)) zahlen.push(n); }
      const paare = zahlen.map(n => ({ n, text: String(n), a: () => h('span', {}, String(n)), b: () => hunderterfeld(n) }));
      await LL.memory(main, rz, mode, {
        paare, offen, ablage: 'In der Schachtel: ',
        beschreibe: k => k.seite === 'a' ? `die Zahl ${k.p.n}` : 'das Hunderterfeld',
        satzJa: p => [`Das ist die ${p.n}.`, `Das sind ${Math.floor(p.n / 10)} Zehner und ${p.n % 10} Einer.`, 'Die Karten passen zusammen.'],
        hinweisNein: (k1, k2, passt) => {
          const f = [k1, k2].find(k => k.seite === 'b'), z = [k1, k2].find(k => k.seite === 'a');
          if (!f || !z) return 'Ein Paar ist immer eine Zahl und ein Hunderterfeld.';
          return `Im Hunderterfeld sind ${Math.floor(f.p.n / 10)} volle Reihen und ${f.p.n % 10} einzelne. Das ist ${f.p.n}. ${passt ? 'Das passt zur Zahl.' : `Die Zahl ist ${z.p.n}.`}`;
        },
      });
      LL.ende(mode === 'robo' ? 'Super! Alle Paare sind in der Schachtel.' : 'Super! Ihr habt alle Paare gefunden.');
    })();
  }
  LL.init({
    code: '2.5', title: 'Pärchen am Hunderterfeld', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 2 · Spiel', farbe: '#2E9E44',
    intro: ['Alle Karten liegen verdeckt.', 'Du deckst 2 Karten auf. Du sagst beide Zahlen.', 'Passen die Karten? Dann kommen sie in die Schachtel.', 'Ihr spielt mit Robo, bis alle Paare in der Schachtel sind.'],
    start,
  });
})();
