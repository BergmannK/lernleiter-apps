/* ZR 1000 Teil A · Karte 3.2 · Zahlwort-Memory */
(() => {
  const { h, rnd, shuffle } = LL;
  // Zahlwort mit Silbentrennern zur Unterstützung beim Lesen
  const silben = n => {
    const hu = Math.floor(n / 100), r = n % 100, teile = [];
    if (hu) teile.push((hu === 1 ? 'ein' : LL.zahlwort(hu)), 'hundert');
    if (r) { const w = LL.zahlwort(r); const m = r > 20 && r % 10 ? w.match(/^(.*?)und(.*)$/) : null; if (m) teile.push(m[1], 'und', m[2]); else teile.push(w); }
    return teile.join('-');
  };
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    (async () => {
      const a = 2 + rnd(7), b = 1 + rnd(9), c = 1 + rnd(9);
      const set = new Set([a * 100 + b * 10 + c, a * 100 + c * 10 + b, (1 + rnd(9)) * 100 + 5, (1 + rnd(9)) * 100 + 50]);
      while (set.size < 6) set.add(101 + rnd(899));
      const zahlen = [...set].filter(n => n % 100 !== 0).slice(0, 6);
      while (zahlen.length < 6) zahlen.push(111 + rnd(888));
      const paare = zahlen.map(n => ({ n, text: String(n), a: () => h('span', {}, String(n)), b: () => h('span', { style: 'font-size:19px;line-height:1.2;text-align:center;word-break:break-word' }, silben(n)) }));
      await LL.memory(main, rz, mode, {
        paare, ablage: 'Unsere Paare: ',
        beschreibe: k => k.seite === 'a' ? `die Zahl ${k.p.n}` : 'das Zahlwort',
        satzJa: p => [`Die Zahl ${p.n} heißt ${LL.zahlwort(p.n)}.`].concat(Math.floor(p.n / 10) % 10 === 0 ? ['Ich höre keine Zehner. Ich schreibe eine 0.'] : p.n % 10 === 0 ? ['Ich höre keine Einer. Ich schreibe eine 0.'] : []).concat(['Das passt!']),
        hinweisNein: (k1, k2, passt) => {
          const z = [k1, k2].find(k => k.seite === 'a'), w = [k1, k2].find(k => k.seite === 'b');
          if (!z || !w) return 'Ein Paar ist immer eine Zahl und ein Zahlwort.';
          return passt ? `Das Wort ${silben(w.p.n)} passt zur Zahl ${z.p.n}.` : `Das Wort ${silben(w.p.n)} ist die Zahl ${w.p.n}. Die Zahlenkarte zeigt ${z.p.n}.`;
        },
      });
      LL.ende(mode === 'robo' ? 'Super! Wir haben alle Paare gefunden.' : 'Super! Ihr habt alle Paare gefunden.');
    })();
  }
  LL.init({
    code: '3.2', title: 'Zahlwort-Memory', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 3 · Üben', farbe: '#2BA9C2',
    intro: ['Alle Karten liegen verdeckt.', 'Du deckst eine Zahlenkarte und eine Zahlwort-Karte auf.', 'Du sprichst das Zahlwort laut. Passt es zur Zahl?', 'Passt es? Dann kommt das Paar zu euren Paaren. Dann ist Robo dran.'],
    start,
  });
})();
