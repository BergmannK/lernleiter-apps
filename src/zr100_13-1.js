/* ZR 100 · Karte 13.1 · Mein Weg – dein Weg (Rechenwege vergleichen) */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}.auf{font-size:48px;font-weight:700;text-align:center}
  .weg{background:#F3FAFF;border:3px solid #9FD3F0;border-radius:16px;padding:10px 16px;margin:10px auto;max-width:640px;font-size:26px}
  .zeile2{display:flex;gap:8px;align-items:center;justify-content:center;font-size:28px;margin:8px 0;flex-wrap:wrap}`));
  const WEGE = { schritte: 'in Schritten', stellen: 'stellenweise', hilfs: 'mit einer Hilfsaufgabe' };
  function schritte(a, b, wegName) {
    const r = a + b, bz = b - b % 10, be = b % 10, az = a - a % 10, ae = a % 10;
    if (wegName === 'schritte') return [[a, '+', bz, a + bz], [a + bz, '+', be, r]];
    if (wegName === 'stellen') return [[az, '+', bz, az + bz], [ae, '+', be, ae + be], [az + bz, '+', ae + be, r]];
    const rund = Math.ceil(b / 10) * 10, d = rund - b;
    return [[a, '+', rund, a + rund], [a + rund, '–', d, r]];
  }
  const passtHilfs = b => b % 10 >= 8;

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);
    const zeigeWeg = (titel, steps) => h('div', { class: 'weg', html: `<b>${titel}</b><br>` + steps.map(s => `${s[0]} ${s[1]} ${s[2]} = ${s[3]}`).join('<br>') });

    async function kindWeg(a, b, verboten, id) {
      const opts = Object.keys(WEGE).filter(w => w !== verboten && (w !== 'hilfs' || passtHilfs(b)));
      const w = await LL.frage(`${mode === 'zwei' ? LL.SPIELER[id].name + ', w' : 'W'}ie rechnest du ${a} + ${b}?${verboten ? ' Nimm einen anderen Weg.' : ''}`, opts.map(o => ({ text: WEGE[o], wert: o })));
      const st = schritte(a, b, w);
      const box = h('div', { class: 'weg', html: `<b>${mode === 'zwei' ? LL.SPIELER[id].name : 'Dein'} Weg: ${WEGE[w]}</b>` });
      feld.append(box);
      for (const s of st) {
        const f = h('span', { class: 'feld' });
        box.append(h('div', { class: 'zeile2' }, `${s[0]} ${s[1]} ${s[2]} =`, f));
        await LL.eingabe(box, [{ el: f, soll: s[3] }], { beiFehler: async (i, n) => LL.hinweis(n === 1 ? `Rechne ${s[0]} ${s[1]} ${s[2]}. Du kannst die Zehner und Einer einzeln anschauen.` : `${s[0]} ${s[1]} ${s[2]} = ${s[3]}.`) });
      }
      await LL.sprichSo([`Ich rechne ${WEGE[w]}.`, ...st.map(s => `${s[0]} ${s[1]} ${s[2]} = ${s[3]}.`)], mode === 'zwei' ? LL.SPIELER[id].name : null);
      return w;
    }

    async function aufgabe(a, b, ids) {
      feld.innerHTML = '';
      feld.append(h('div', { class: 'auf', html: `<span class="blau">${a}</span> + <span class="rot">${b}</span>` }));
      let w1, w2;
      if (mode === 'robo') {
        w1 = passtHilfs(b) && rnd(2) ? 'hilfs' : ['schritte', 'stellen'][rnd(2)];
        const st = schritte(a, b, w1);
        dran.set('robo', 'erklärt.');
        rz.sag(`Ich rechne ${WEGE[w1]}. ` + st.map(s => `${s[0]} ${s[1]} ${s[2]} = ${s[3]}.`).join(' '));
        feld.append(zeigeWeg(`Robos Weg: ${WEGE[w1]}`, st));
        await wait(1500);
        dran.set('du', 'rechnest anders.');
        w2 = await kindWeg(a, b, w1, 'du');
      } else {
        dran.set('k1', 'rechnet.'); w1 = await kindWeg(a, b, null, 'k1');
        dran.set('k2', 'rechnet anders.'); w2 = await kindWeg(a, b, w1, 'k2');
      }
      // Vergleichen
      const geschickt = passtHilfs(b) ? 'hilfs' : null;
      const x = await LL.frage(`Ihr habt beide ${a + b}. Welcher Weg ist bei dieser Aufgabe geschickt?`, [{ text: WEGE[w1], wert: w1 }, { text: WEGE[w2], wert: w2 }, { text: 'Beide sind gut', cls: 'hell', wert: 'beide' }]);
      if (geschickt && x !== geschickt && x !== 'beide' && (w1 === 'hilfs' || w2 === 'hilfs'))
        await LL.hinweis(`Bei ${b} ist die Hilfsaufgabe oft geschickt: ${b} ist nah an ${Math.ceil(b / 10) * 10}.`, null, 'OK');
      const wahl = x === 'beide' ? null : x;
      const saetze = !wahl ? ['Beide Wege sind gut, weil …', `Wir haben beide ${a + b}.`] : wahl === w2 ? ['Mein Weg ist geschickt, weil …', `Dein Weg ist anders: Du rechnest ${WEGE[w1]}.`] : ['Dein Weg ist geschickt, weil …', `Ich rechne ${WEGE[w2]}.`];
      await LL.sprichSo(saetze, mode === 'zwei' ? 'Kind 1 und Kind 2' : null);
      if (mode === 'robo') rz.sag('Danke! Es gibt verschiedene Wege. Beide führen zum Ergebnis.');
    }

    (async () => {
      const A = [[47, 25], [36, 29], [58, 34]];
      for (const [a, b] of A) { await aufgabe(a, b); await LL.frage('Nächste Aufgabe?', [{ text: 'Weiter', wert: 1 }]); }
      LL.ende(mode === 'robo' ? 'Super! Wir haben unsere Wege verglichen.' : 'Super! Ihr habt eure Wege verglichen.');
    })();
  }

  LL.init({
    code: '13.1', title: 'Mein Weg – dein Weg', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 13 · Einführung', farbe: '#E53935',
    intro: ['Robo zieht eine Aufgabe und zeigt seinen Rechenweg.', 'Du rechnest die Aufgabe auf einem anderen Weg.', 'Ihr vergleicht: Welcher Weg ist bei dieser Aufgabe geschickt?', 'Am besten erklärt ihr euch die Wege auch mit einem Partnerkind.'],
    start,
  });
})();
