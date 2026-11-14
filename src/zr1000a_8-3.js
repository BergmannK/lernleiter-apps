/* ZR 1000 Teil A · Karte 8.3 · Zahlen ordnen */
(() => {
  const { h, wait, rnd, shuffle } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}
  .karten{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:10px 0}
  .karten button,.reihe div{min-width:120px;height:86px;font-size:40px;font-weight:700;border:3px solid #333;border-radius:12px;background:#fff}
  .reihe{display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap;min-height:96px;margin:10px 0}
  .reihe div{display:flex;align-items:center;justify-content:center;background:#EAF6EA}.reihe span{font-size:34px;font-weight:700}`));

  function zahlen4() {
    const hu = 1 + rnd(8), a = rnd(10), b = rnd(10);
    const s = new Set([hu * 100 + a * 10 + b, hu * 100 + b * 10 + a, (hu + 1) * 100 + rnd(100), hu * 100 + rnd(10) * 10]);
    while (s.size < 4) s.add(100 + rnd(900));
    return shuffle([...s]);
  }

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);

    async function kindOrdnet(id) {
      feld.innerHTML = ''; dran.set(id);
      const Z = zahlen4(), sortiert = [...Z].sort((x, y) => x - y);
      feld.append(h('p', { class: 'mitte', html: '<b>Ordne die Zahlen:</b> Tippe zuerst die kleinste Zahl an, dann die nächste, bis zur größten.' }));
      const karten = h('div', { class: 'karten' }), reihe = h('div', { class: 'reihe' });
      feld.append(karten, reihe);
      const els = Z.map(n => { const b = h('button', {}, String(n)); karten.append(b); return [n, b]; });
      let i = 0, f = 0;
      while (i < 4) {
        const n = await new Promise(r => els.forEach(([v, b]) => b.onclick = () => r(v)));
        if (n === sortiert[i]) { els.find(e => e[0] === n)[1].style.visibility = 'hidden'; if (i) reihe.append(h('span', {}, '<')); reihe.append(h('div', {}, String(n))); i++; f = 0; continue; }
        f++; await LL.hinweis(f === 1 ? 'Vergleiche zuerst die Hunderter, dann die Zehner, dann die Einer. Welche Zahl ist die kleinste von den übrigen?' : `Die nächste Zahl ist ${sortiert[i]}.`);
      }
      await LL.sprichSo([`Die kleinste Zahl ist ${sortiert[0]}.`, `${sortiert[0]} ist kleiner als ${sortiert[1]}.`], mode === 'zwei' ? LL.SPIELER[id].name : null);
      // Ziffernkarten
      let d; do { d = shuffle([rnd(10), 1 + rnd(9), 1 + rnd(9)]); } while (new Set(d).size < 3);
      const s = [...d].sort((x, y) => y - x), gross = s[0] * 100 + s[1] * 10 + s[2];
      const k = [...d].sort((x, y) => x - y); if (k[0] === 0) [k[0], k[1]] = [k[1], k[0]];
      const klein = k[0] * 100 + k[1] * 10 + k[2];
      feld.append(h('p', { class: 'mitte', html: `Deine Ziffernkarten: <b>${d.join('  ')}</b>` }));
      await LL.zahlFrage(feld, 'Die größte Zahl heißt', gross, ['Die größte Ziffer kommt zu den Hundertern.', `Die größte Zahl ist ${gross}.`]);
      await LL.zahlFrage(feld, 'Die kleinste Zahl heißt', klein, [d.includes(0) ? 'Die 0 steht nie vorn. Die kleinste andere Ziffer kommt zu den Hundertern.' : 'Die kleinste Ziffer kommt zu den Hundertern.', `Die kleinste Zahl ist ${klein}.`]);
      await LL.sprichSo(['Die größte Zahl bilde ich so: Die größte Ziffer kommt zu den Hundertern.'].concat(d.includes(0) ? ['Die 0 steht nie vorn.'] : []), mode === 'zwei' ? LL.SPIELER[id].name : null);
    }

    async function roboOrdnet() {
      feld.innerHTML = ''; dran.set('robo', 'ordnet.');
      const Z = zahlen4(), sortiert = [...Z].sort((x, y) => x - y);
      const irrt = Math.random() < 0.5, r = [...sortiert];
      if (irrt) { const i = rnd(3); [r[i], r[i + 1]] = [r[i + 1], r[i]]; }
      rz.sag(`Ich ordne: ${r.join(', ')}.`);
      feld.append(h('div', { class: 'reihe' }, r.flatMap((n, i) => i ? [h('span', {}, '<'), h('div', {}, String(n))] : [h('div', {}, String(n))])));
      let f = 0;
      for (;;) {
        const a = await LL.frage('Robo hat die Zahlen geordnet. Stimmt die Reihe?', [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (a === !irrt) break;
        f++; await LL.hinweis(f === 1 ? 'Prüfe jedes Paar: Ist die linke Zahl kleiner als die rechte?' : `Richtig ist: ${sortiert.join(' < ')}.`);
      }
      if (irrt) { const i = r.findIndex((n, j) => n !== sortiert[j]); rz.sag(`Oh, danke! ${r[i + 1]} ist kleiner als ${r[i]}.`); await LL.sprichSo([`Stimmt nicht.`, `${r[i + 1]} ist kleiner als ${r[i]}.`]); }
      else { rz.sag('Danke fürs Prüfen!'); await LL.sprichSo(`${sortiert[0]} ist kleiner als ${sortiert[1]}.`); }
    }

    (async () => {
      const plan = mode === 'robo' ? ['du', 'robo', 'du', 'robo'] : ['k1', 'k2', 'k1', 'k2'];
      for (const id of plan) { if (id === 'robo') await roboOrdnet(); else await kindOrdnet(id); await LL.frage('Weiter? Dann tauscht ihr.', [{ text: 'Weiter', wert: 1 }]); }
      LL.ende(mode === 'robo' ? 'Super! Wir haben alle Zahlen geordnet.' : 'Super! Ihr habt alle Zahlen geordnet.');
    })();
  }

  LL.init({
    code: '8.3', title: 'Zahlen ordnen', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 8 · Üben', farbe: '#8C6239',
    intro: ['Du ziehst vier Zahlenkarten.', 'Du legst sie von der kleinsten bis zur größten Zahl.', 'Robo prüft. Dann ordnet Robo und du prüfst.', 'Mit drei Ziffernkarten bildest du die größte und die kleinste Zahl.'],
    start,
  });
})();
