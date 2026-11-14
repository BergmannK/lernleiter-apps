/* ZR 100 · Karte 4.5 · Zahlenrätsel an der Hundertertafel */
(() => {
  const { h, wait, rnd, shuffle } = LL;
  document.head.append(h('style', {}, `
  .tafel{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;max-width:min(560px,calc(100vh - 300px));min-width:300px;margin:0 auto}
  .tafel button{aspect-ratio:1;border:2px solid #555;border-radius:6px;background:#fff;font-size:19px;font-weight:700;padding:0}
  .tafel button.an{background:#2E7D32;color:#fff}.tafel button.robo{background:#9FD3F0}
  .hinweise{max-width:760px;margin:8px auto;display:flex;flex-direction:column;gap:6px}
  .hinweise div{background:#fff;border:2px solid #E7B400;border-radius:12px;padding:8px 12px;font-size:22px}
  .hwahl{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:860px;margin:8px auto}
  .hwahl button{background:#fff;border:2px solid #bbb;border-radius:12px;padding:10px;font-size:20px;text-align:left}
  .hwahl button.an{border-color:#2E7D32;background:#EAF6EA}`));

  // Hinweis-Sätze zu einer Zahl (alle wahr)
  function hinweise(n) {
    const z = Math.floor(n / 10), e = n % 10, L = [];
    if (n > 10) L.push(`Meine Zahl liegt unter der ${n - 10}.`);
    if (n <= 90) L.push(`Meine Zahl liegt über der ${n + 10}.`);
    if (e !== 0 && e !== 1) L.push(`Meine Zahl liegt nach der ${n - 1}.`);
    if (e !== 0 && e !== 9) L.push(`Meine Zahl liegt vor der ${n + 1}.`);
    L.push(`Meine Zahl liegt zwischen ${n - 1} und ${n + 1}.`);
    return L;
  }
  const passt = (n, satz) => {
    const m = satz.match(/(unter|über|nach|vor) der (\d+)/), m2 = satz.match(/zwischen (\d+) und (\d+)/), m3 = satz.match(/mit (\d+) Einern/), m4 = satz.match(/(\d+) Zehnern/);
    if (m) { const x = +m[2]; return { unter: n === x + 10, über: n === x - 10, nach: n === x + 1, vor: n === x - 1 }[m[1]]; }
    if (m2) return n > +m2[1] && n < +m2[2];
    if (m3) return n % 10 === +m3[1];
    if (m4) return Math.floor(n / 10) === +m4[1];
    return false;
  };

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const hw = h('div', { class: 'hinweise' }); main.append(hw);
    const tafel = h('div', { class: 'tafel' }); main.append(tafel);
    const unten = h('div'); main.append(unten);
    const F = [];
    for (let n = 1; n <= 100; n++) { F[n] = h('button', {}, String(n)); tafel.append(F[n]); }
    const leeren = () => { for (let n = 1; n <= 100; n++) { F[n].className = ''; F[n].onclick = null; } hw.innerHTML = ''; unten.innerHTML = ''; };
    const tippe = () => new Promise(r => { for (let n = 1; n <= 100; n++) F[n].onclick = () => { for (let k = 1; k <= 100; k++) F[k].onclick = null; r(n); }; });

    async function kindSucht(n, saetze, rater, denker) {
      dran.set(rater, rater === 'du' ? 'suchst die Zahl.' : 'sucht die Zahl.');
      for (const s of saetze) { hw.append(h('div', {}, s)); if (denker === 'robo') { rz.sag(s); await wait(1500); } }
      if (denker !== 'robo') await LL.sprichSo(saetze, LL.SPIELER[denker].name);
      let f = 0;
      for (;;) {
        const t = await tippe();
        if (t === n) { F[n].className = 'an'; break; }
        f++;
        const falsch = saetze.find(s => !passt(t, s));
        await LL.hinweis(f === 1 ? `Prüfe die ${t}: ${falsch || saetze[0]} Stimmt das für ${t}?` : `Lies jeden Hinweis und prüfe an der Tafel. ${falsch || saetze[0]}`);
        if (f >= 3) F[n].className = 'robo';
      }
      await LL.sprichSo(`Deine Zahl ist ${n}.`, mode === 'zwei' ? LL.SPIELER[rater].name : null);
      if (denker === 'robo') rz.sag('Richtig! Das ist meine Zahl.');
    }

    async function roboSucht() {
      dran.set('du', 'denkst dir eine Zahl.');
      rz.sag('Ich schaue weg. Du tippst heimlich eine Zahl an.');
      const n = await tippe(); F[n].className = 'an';
      await wait(300); F[n].className = '';
      // Hinweise auswählen: 3 wahre und 3 falsche
      const wahr = shuffle(hinweise(n)).slice(0, 3);
      wahr.push(`Sie ist eine Zahl mit ${n % 10} Einern.`);
      const andere = n < 50 ? n + 23 : n - 27;
      const falsch = shuffle(hinweise(andere)).slice(0, 2).concat([`Sie ist eine Zahl mit ${(n + 3) % 10} Einern.`]);
      const alle = shuffle(wahr.concat(falsch));
      unten.append(h('p', { style: 'text-align:center;font-size:22px', html: `Deine Zahl ist <b>${n}</b>. Wähle 3 Hinweise, die stimmen.` }));
      const box = h('div', { class: 'hwahl' }); unten.append(box);
      const gewaehlt = new Set();
      alle.forEach(s => { const b = h('button', {}, s); b.onclick = () => { if (gewaehlt.has(s)) gewaehlt.delete(s); else gewaehlt.add(s); b.classList.toggle('an'); }; box.append(b); });
      const ok = h('button', { class: 'btn ok', style: 'display:block;margin:10px auto' }, 'Fertig');
      unten.append(ok); ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      let f = 0;
      for (;;) {
        await new Promise(r => ok.onclick = r);
        const sel = [...gewaehlt];
        const bad = sel.find(s => !passt(n, s));
        if (sel.length === 3 && !bad) break;
        f++;
        await LL.hinweis(bad ? `Prüfe: ${bad} Stimmt das für ${n}?` : 'Wähle genau 3 Hinweise.');
      }
      const saetze = [...gewaehlt];
      unten.innerHTML = '';
      await LL.sprichSo(saetze);
      saetze.forEach(s => hw.append(h('div', {}, s)));
      rz.sag('Ich suche die Zahl an der Tafel.');
      await wait(1500);
      // Robo findet die Zahl, irrt sich aber manchmal
      const irrt = Math.random() < 0.4;
      const kand = irrt ? [n + 1, n - 1, n + 10, n - 10].filter(x => x >= 1 && x <= 100 && !saetze.every(s => passt(x, s))) : [];
      const tipp = irrt && kand.length ? kand[rnd(kand.length)] : n;
      F[tipp].className = 'robo';
      rz.sag(`Deine Zahl ist ${tipp}.`);
      let g = 0;
      for (;;) {
        const a = await LL.frage(`Robo sagt: Deine Zahl ist ${tipp}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (a === (tipp === n)) break;
        g++; await LL.hinweis(g === 1 ? 'Denk an deine Zahl.' : `Deine Zahl ist ${n}.`);
      }
      if (tipp !== n) { F[tipp].className = ''; rz.sag(`Oh! Ich prüfe die Hinweise noch einmal. Deine Zahl ist ${n}.`); await wait(1500); }
      else rz.sag('Ich habe sie gefunden!');
      F[n].className = 'an';
    }

    (async () => {
      const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
      for (let r = 0; r < 4; r++) {
        leeren();
        const denker = ids[(r + 1) % 2], rater = ids[r % 2];
        if (denker === 'robo') {
          let n; do { n = 12 + rnd(78); } while (n % 10 === 0 || n % 10 === 1 || n % 10 === 9);
          const h1 = `Meine Zahl liegt zwischen ${Math.floor(n / 10) * 10} und ${Math.floor(n / 10) * 10 + 10}.`;
          const s = [h1, `Sie ist eine Zahl mit ${n % 10} Einern.`, shuffle(hinweise(n))[0]];
          await kindSucht(n, s, rater, denker);
        } else if (rater === 'robo') await roboSucht();
        else {
          // zu zweit: Denker tippt heimlich, wählt Hinweise; Rater sucht
          dran.set(denker, 'denkt sich eine Zahl.');
          unten.append(h('p', { style: 'text-align:center;font-size:22px', html: `<b>${LL.SPIELER[denker].name}</b> tippt heimlich eine Zahl an. ${LL.SPIELER[rater].name} schaut weg.` }));
          const n = await tippe(); unten.innerHTML = '';
          const s = shuffle(hinweise(n)).slice(0, 2).concat([`Sie ist eine Zahl mit ${n % 10} Einern.`]);
          await kindSucht(n, s, rater, denker);
        }
        await LL.frage('Weiter? Dann tauscht ihr.', [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben alle Rätsel gelöst.' : 'Super! Ihr habt alle Rätsel gelöst.');
    })();
  }

  LL.init({
    code: '4.5', title: 'Zahlenrätsel', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 4 · Spiel', farbe: '#EE7F4B',
    intro: ['Robo denkt sich eine Zahl. Robo sagt drei Hinweise.', 'Hinweise: Meine Zahl liegt vor, nach, über, unter … oder zwischen … und … .', 'Du suchst die Zahl an der Hundertertafel und tippst sie an.', 'Stimmt die Zahl? Dann tauscht ihr.'],
    start,
  });
})();
