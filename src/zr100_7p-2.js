/* ZR 100 · Karte 7+.2 · Drei passen zusammen (kleine Aufgabe, Bild, große Aufgabe) */
(() => {
  const { h, wait, rnd, shuffle } = LL;
  document.head.append(h('style', {}, `
  .tgrid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;max-width:1000px;margin:0 auto}
  .okarte{min-height:120px;font-size:30px}
  .gesammelt{display:flex;gap:8px;flex-wrap:wrap}
  .gesammelt span{background:#fff;border:2px solid #2E7D32;border-radius:10px;padding:2px 10px;font-weight:700}
  @media (max-width:800px){.tgrid{grid-template-columns:repeat(3,1fr)}}`));

  function trios() {
    const L = [];
    while (L.length < 5) {
      const z = 1 + rnd(8), e = rnd(6), b = 1 + rnd(9 - e);
      if (e + b > 9 || L.some(t => t.e === e && t.b === b)) continue;
      L.push({ z, e, b, id: L.length });
    }
    return L;
  }
  const inhalt = (t, art) => art === 'klein' ? h('span', { html: `<span class="blau">${t.e}</span> + <span class="rot">${t.b}</span>` })
    : art === 'gross' ? h('span', { html: `<span class="blau">${t.z * 10 + t.e}</span> + <span class="rot">${t.b}</span>` })
    : LL.zahlBild(t.z, t.e + t.b, { klein: true, rotE: t.b });
  const saetze = t => ['Die Karten passen zusammen.', `Die kleine Aufgabe ist ${t.e} + ${t.b} = ${t.e + t.b}.`, `Die große Aufgabe ist ${t.z * 10 + t.e} + ${t.b} = ${t.z * 10 + t.e + t.b}.`];

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div', { style: 'display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px' });
    const dran = LL.dranAnzeige(kopf); const ges = h('div', { class: 'gesammelt' }, h('b', {}, 'Unsere Trios: ')); kopf.append(ges); main.append(kopf);
    const grid = h('div', { class: 'tgrid' }); main.append(grid);
    const T = trios();
    const karten = shuffle(T.flatMap(t => ['klein', 'bild', 'gross'].map(art => ({ t, art }))));
    karten.forEach(k => { k.el = h('button', { class: 'okarte' }, inhalt(k.t, k.art)); grid.append(k.el); });
    const offen = () => karten.filter(k => !k.weg);
    const tippe = () => new Promise(r => offen().forEach(k => k.el.onclick = () => { offen().forEach(x => x.el.onclick = null); r(k); }));
    const sammle = t => { karten.filter(k => k.t === t).forEach(k => { k.weg = true; k.el.classList.add('weg'); }); ges.append(h('span', {}, `${t.z * 10 + t.e} + ${t.b}`)); };

    async function kindZug(id) {
      dran.set(id);
      if (mode === 'robo') rz.sag('Du suchst 3 Karten, die zusammenpassen: kleine Aufgabe, Bild und große Aufgabe.');
      const erste = await tippe(); erste.el.classList.add('gewaehlt');
      let n = 1, f = 0;
      while (n < 3) {
        const k = await tippe();
        if (k.el.classList.contains('gewaehlt')) continue;
        if (k.t === erste.t && k.art !== erste.art) { k.el.classList.add('gewaehlt'); n++; f = 0; continue; }
        f++;
        await LL.hinweis(f === 1 ? 'Diese Karte passt nicht dazu. Schau auf die Einer: Sie sind in der kleinen Aufgabe, im Bild und in der großen Aufgabe gleich.' :
          `Suche: ${erste.t.e} + ${erste.t.b}, das Bild mit ${erste.t.z} Zehnern, und ${erste.t.z * 10 + erste.t.e} + ${erste.t.b}.`);
        if (f >= 2) karten.filter(x => x.t === erste.t).forEach(x => x.el.classList.add('gewaehlt'));
      }
      await LL.sprichSo(saetze(erste.t), mode === 'zwei' ? LL.SPIELER[id].name : null);
      karten.forEach(k => k.el.classList.remove('gewaehlt'));
      sammle(erste.t);
    }
    async function roboZug() {
      dran.set('robo');
      rz.sag('Ich suche ein Trio.');
      await wait(1000);
      const t = offen()[rnd(offen().length)].t;
      const richtige = offen().filter(k => k.t === t);
      const andere = offen().filter(k => k.t !== t && k.art === 'gross');
      const irrt = andere.length && Math.random() < 0.45;
      const wahl = irrt ? [richtige.find(k => k.art === 'klein'), richtige.find(k => k.art === 'bild'), andere[rnd(andere.length)]] : richtige;
      for (const k of wahl) { k.el.classList.add('robo-wahl'); await wait(600); }
      rz.sag('Diese 3 Karten passen zusammen.');
      let f = 0;
      for (;;) {
        const a = await LL.frage('Robo sagt: Diese 3 Karten passen zusammen. Stimmt das?', [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (a === !irrt) break;
        f++; await LL.hinweis(f === 1 ? 'Rechne die kleine Aufgabe und die große Aufgabe. Passen sie zum Bild?' : 'Die große Aufgabe hat andere Einer als die kleine Aufgabe.');
      }
      wahl.forEach(k => k.el.classList.remove('robo-wahl'));
      rz.sag(irrt ? 'Oh, danke! Ich nehme die richtige große Aufgabe.' : 'Danke fürs Prüfen!');
      await LL.sprichSo(saetze(t));
      sammle(t);
    }
    (async () => {
      const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
      let i = 0;
      while (offen().length) { const id = ids[i++ % 2]; if (id === 'robo') await roboZug(); else await kindZug(id); }
      LL.ende(mode === 'robo' ? 'Super! Wir haben alle Trios zusammen gefunden.' : 'Super! Ihr habt alle Trios gefunden.');
    })();
  }

  LL.init({
    code: '7+.2', title: 'Drei passen zusammen', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Wiederholung 7+ · Spiel', farbe: '#6E6E6E',
    intro: ['Alle Karten liegen offen.', 'Ihr sucht zusammen 3 Karten: kleine Aufgabe, Bild, große Aufgabe.', 'Du sagst die kleine und die große Aufgabe.', 'Ihr sucht weiter, bis alle Karten weg sind. Niemand gewinnt.'],
    start,
  });
})();
