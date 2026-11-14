/* ZR 1000 Teil A · Karte 8.2 · Wer hat mehr? -> kooperativ: Zahlen bis 1000 vergleichen */
(() => {
  const { h, wait, rnd, shuffle } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}
  .vgl{display:grid;grid-template-columns:1fr auto 1fr;gap:14px;align-items:center;max-width:860px;margin:10px auto}
  .vk{background:#fff;border:3px solid #ccc;border-radius:16px;padding:10px;text-align:center;min-height:150px}
  .zeichen{width:90px;height:90px;border:3px dashed #999;border-radius:14px;font-size:56px;font-weight:700;display:flex;align-items:center;justify-content:center;background:#fff}
  .ziffern{display:flex;gap:10px;justify-content:center}.ziffern button{width:64px;height:84px;font-size:40px;font-weight:700;border:3px solid #333;border-radius:10px;background:#FFF6D5}
  .ziffern button:disabled{opacity:.3}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const feld = h('div'); main.append(feld);
    const [A, B] = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    const nm = id => id === 'du' ? 'Du' : LL.SPIELER[id].name;

    async function legeZahl(box, ziffern, id) {
      box.append(h('div', { style: 'font-weight:700' }, `${LL.SPIELER[id].zeichen} ${nm(id)}`));
      const tafelPlatz = h('div'); box.append(tafelPlatz);
      const werte = [];
      const zeig = () => { tafelPlatz.innerHTML = ''; tafelPlatz.append(LL.stellentafel([werte[0] ?? '', werte[1] ?? '', werte[2] ?? ''], 'HZE')); };
      zeig();
      const zf = h('div', { class: 'ziffern' });
      box.append(h('div', { style: 'margin-top:6px;font-size:18px' }, 'Tippe die Ziffern: erst H, dann Z, dann E.'), zf);
      await new Promise(res => ziffern.forEach(d => { const b = h('button', {}, String(d)); b.onclick = () => { b.disabled = true; werte.push(d); zeig(); if (werte.length === 3) res(); }; zf.append(b); }));
      zf.remove(); box.lastChild.remove?.();
      return werte[0] * 100 + werte[1] * 10 + werte[2];
    }

    async function runde() {
      feld.innerHTML = '';
      const za = shuffle([1 + rnd(9), rnd(10), rnd(10)]), zb = shuffle([1 + rnd(9), rnd(10), rnd(10)]);
      const ka = h('div', { class: 'vk' }), kb = h('div', { class: 'vk' }), zeichen = h('div', { class: 'zeichen' }, '?');
      feld.append(h('div', { class: 'vgl' }, ka, zeichen, kb));
      let a; for (;;) { ka.innerHTML = ''; a = await legeZahl(ka, za, A); if (a >= 100) break; await LL.hinweis('Die 0 darf nicht vorne stehen. Lege noch einmal.'); }
      let b;
      if (B === 'robo') {
        const s = [...zb].sort((x, y) => y - x); b = s[0] * 100 + s[1] * 10 + s[2];
        if (rnd(2)) { const t = [s[0], s[2], s[1]]; b = t[0] * 100 + t[1] * 10 + t[2]; }
        kb.append(h('div', { style: 'font-weight:700' }, '🤖 Robo'), LL.stellentafel([Math.floor(b / 100), Math.floor(b / 10) % 10, b % 10], 'HZE'));
        rz.sag(`Meine Zahl ist ${b}. Deine Zahl ist ${a}.`);
      } else { for (;;) { kb.innerHTML = ''; b = await legeZahl(kb, zb, B); if (b >= 100) break; await LL.hinweis('Die 0 darf nicht vorne stehen. Lege noch einmal.'); } }
      const sa = String(a), sb = String(b);
      let stelle = 0; while (stelle < 2 && sa[stelle] === sb[stelle]) stelle++;
      const NAME = ['Hunderter', 'Zehner', 'Einer'];
      const saetze = [`Meine Zahl ist ${a}. ${nm(B) === 'Robo' ? 'Robos' : 'Deine'} Zahl ist ${b}.`];
      for (let i = 0; i <= stelle; i++) {
        const x = +sa[i], y = +sb[i], soll = x > y ? 'A' : x < y ? 'B' : 'gleich';
        let f = 0;
        for (;;) {
          const r = await LL.frage(`Vergleiche die ${NAME[i]}: ${x} und ${y}. Wer hat mehr ${NAME[i]}?`, [{ text: mode === 'robo' ? 'Ich' : 'Kind 1', wert: 'A' }, { text: mode === 'robo' ? 'Robo' : 'Kind 2', wert: 'B' }, { text: 'Gleich viele', cls: 'hell', wert: 'gleich' }]);
          if (r === soll) break;
          f++; await LL.hinweis(`${a} hat ${x} ${NAME[i]}. ${b} hat ${y} ${NAME[i]}.`);
        }
        saetze.push(soll === 'gleich' ? `Die ${NAME[i]} sind gleich.` : `${Math.max(x, y)} ${NAME[i]} sind mehr als ${Math.min(x, y)} ${NAME[i]}.`);
      }
      const soll = a > b ? '>' : a < b ? '<' : '=';
      let f = 0;
      for (;;) { const x = await LL.frage(`${a} ? ${b}`, [{ text: '<', wert: '<' }, { text: '=', wert: '=' }, { text: '>', wert: '>' }]); if (x === soll) break; f++; await LL.hinweis(f === 1 ? 'Die Spitze zeigt zur kleineren Zahl.' : `${a} ${soll} ${b}.`); }
      zeichen.textContent = soll; zeichen.style.borderStyle = 'solid';
      saetze.push(a === b ? 'Die Zahlen sind gleich.' : a > b ? 'Meine Zahl ist größer.' : 'Meine Zahl ist kleiner.');
      await LL.sprichSo(saetze, mode === 'zwei' ? nm(A) : null);
      await LL.frage('Nächste Runde?', [{ text: 'Weiter', wert: 1 }]);
    }
    (async () => {
      for (let i = 0; i < 4; i++) await runde();
      LL.ende(mode === 'robo' ? 'Super! Wir haben viermal verglichen.' : 'Super! Ihr habt viermal verglichen.');
    })();
  }

  LL.init({
    code: '8.2', title: 'Wer hat mehr?', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 8 · Spiel', farbe: '#8C6239',
    intro: ['Du ziehst drei Ziffernkarten. Du legst eine Zahl in die Stellenwerttafel.', 'Robo legt auch eine Zahl.', 'Ihr vergleicht: erst die Hunderter, dann die Zehner, dann die Einer.', 'Ihr setzt das Zeichen. Niemand gewinnt.'],
    start,
  });
})();
