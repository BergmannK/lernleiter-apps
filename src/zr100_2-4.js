/* ZR 100 · Karte 2.4 · Zahlen-Quartett (gemeinsam, niemand gewinnt) */
(() => {
  const { h, wait, rnd, shuffle } = LL;
  document.head.append(h('style', {}, `
  .qgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:900px;margin:0 auto}
  .okarte{min-height:120px;font-size:34px}
  .okarte .aufg{font-size:30px}
  .gesammelt{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}
  .gesammelt span{background:#fff;border:2px solid #2E7D32;border-radius:10px;padding:2px 10px;font-weight:700}
  @media (max-width:800px){.qgrid{grid-template-columns:repeat(3,1fr)}}`));
  const ARTEN = ['zahl', 'tafel', 'bild', 'plus'];

  function inhalt(n, art) {
    const z = Math.floor(n / 10), e = n % 10;
    if (art === 'zahl') return h('span', {}, String(n));
    if (art === 'tafel') return LL.stellentafel([z, e]);
    if (art === 'bild') return LL.zahlBild(z, e, { klein: true });
    return h('span', { class: 'aufg', html: `<span class="blau">${z * 10}</span> + <span class="rot">${e}</span>` });
  }

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div', { style: 'display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center' });
    const dran = LL.dranAnzeige(kopf); const ges = h('div', { class: 'gesammelt' }, h('b', {}, 'Unsere Quartette: '));
    kopf.append(ges); main.append(kopf);
    const grid = h('div', { class: 'qgrid' }); main.append(grid);

    (async () => {
      const anzahl = await LL.frage('Mit wie vielen Zahlen spielt ihr?', [{ text: '4 Zahlen (leichter)', cls: 'hell', wert: 4 }, { text: '6 Zahlen', wert: 6 }]);
      const zahlen = [];
      while (zahlen.length < anzahl) { const n = 11 + rnd(89); if (n % 10 && !zahlen.includes(n) && !zahlen.includes((n % 10) * 10 + Math.floor(n / 10))) zahlen.push(n); }
      const karten = shuffle(zahlen.flatMap(n => ARTEN.map(art => ({ n, art }))));
      karten.forEach(k => { k.el = h('button', { class: 'okarte' }, inhalt(k.n, k.art)); grid.append(k.el); });
      const offen = () => karten.filter(k => !k.weg);
      const tippe = () => new Promise(res => offen().forEach(k => k.el.onclick = () => { offen().forEach(x => x.el.onclick = null); res(k); }));
      const satz = n => [`${Math.floor(n / 10) * 10} und ${n % 10} sind ${n}.`, 'Die Karten gehören zusammen.'];
      const sammle = async n => {
        for (const k of karten.filter(k => k.n === n)) { k.weg = true; k.el.classList.add('weg'); }
        ges.append(h('span', {}, String(n)));
        await wait(300);
      };

      async function kindZug(id) {
        dran.set(id, mode === 'robo' ? 'bist dran.' : 'ist dran.');
        if (mode === 'robo') rz.sag('Du nimmst eine Karte. Dann suchst du die anderen 3 Karten.');
        const erste = await tippe();
        erste.el.classList.add('gewaehlt');
        const n = erste.n, z = Math.floor(n / 10);
        await LL.sprichSo([`Die Zahl ist ${n}.`, `Hier sehe ich ${z} Zehner.`], mode === 'zwei' ? LL.SPIELER[id].name : null);
        let gefunden = 1, f = 0;
        while (gefunden < 4) {
          const k = await tippe();
          if (k.el.classList.contains('gewaehlt')) continue;
          if (k.n === n) { k.el.classList.add('gewaehlt'); gefunden++; f = 0; continue; }
          f++;
          await LL.hinweis(f === 1 ? `Diese Karte zeigt nicht ${n}. Du suchst ${z} Zehner und ${n % 10} Einer.` : `Suche: die Zahl ${n}, die Stellentafel mit ${z} und ${n % 10}, das Bild und ${z * 10} + ${n % 10}.`);
          if (f >= 2) karten.filter(x => x.n === n && !x.weg).forEach(x => x.el.classList.add('gewaehlt'));
        }
        await LL.sprichSo(satz(n), mode === 'zwei' ? LL.SPIELER[id].name : null);
        await sammle(n);
      }

      async function roboZug() {
        dran.set('robo');
        rz.sag('Ich nehme eine Karte.');
        await wait(900);
        const erste = offen()[rnd(offen().length)];
        erste.el.classList.add('robo-wahl');
        const n = erste.n;
        rz.sag(`Die Zahl ist ${n}. Ich suche die anderen Karten.`);
        await wait(900);
        const richtige = offen().filter(k => k.n === n && k !== erste);
        const falsche = offen().filter(k => k.n !== n);
        const irrt = falsche.length && Math.random() < 0.45;
        const wahl = irrt ? [richtige[0], richtige[1], falsche[rnd(falsche.length)]] : richtige;
        for (const k of shuffle(wahl)) { k.el.classList.add('robo-wahl'); await wait(600); }
        rz.sag('Diese 4 Karten gehören zusammen.');
        let f = 0;
        for (;;) {
          const a = await LL.frage(`Robo sagt: Diese 4 Karten zeigen alle ${n}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
          if (a === !irrt) break;
          f++; await LL.hinweis(f === 1 ? `Prüfe jede blaue Karte. Zeigt sie ${n}?` : 'Eine Karte zeigt eine andere Zahl.');
        }
        wahl.forEach(k => k.el.classList.remove('robo-wahl'));
        if (irrt) {
          rz.sag('Oh, danke! Eine Karte passt nicht. Ich suche die richtige.');
          await wait(900);
        } else rz.sag('Danke fürs Prüfen!');
        richtige.concat([erste]).forEach(k => k.el.classList.add('gewaehlt'));
        await LL.sprichSo(satz(n));
        await sammle(n);
      }

      const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
      let i = 0;
      while (offen().length) { const id = ids[i++ % 2]; if (id === 'robo') await roboZug(); else await kindZug(id); }
      LL.ende(mode === 'robo' ? `Super! Wir haben alle ${anzahl} Quartette zusammen gefunden.` : `Super! Ihr habt alle ${anzahl} Quartette gefunden.`);
    })();
  }

  LL.init({
    code: '2.4', title: 'Zahlen-Quartett', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 2 · Spiel', farbe: '#2E9E44',
    intro: ['Alle Karten liegen offen.', 'Du nimmst eine Karte und sagst die Zahl.', 'Du suchst die anderen 3 Karten: Stellentafel, Bild, Plusaufgabe, Zahl.', 'Ihr spielt zusammen mit Robo. Niemand gewinnt.'],
    start,
  });
})();
