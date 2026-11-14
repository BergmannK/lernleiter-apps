/* ZR 100 · Karte 2.2 · Hören – legen – schreiben */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `
  .zkarte{display:inline-flex;width:150px;height:110px;border:3px solid #333;border-radius:14px;align-items:center;justify-content:center;font-size:52px;font-weight:700;background:#fff}
  .zkarte.zu{background:repeating-linear-gradient(45deg,#FFF6D5 0 12px,#F5E7B3 12px 24px);color:transparent}
  .mitte{text-align:center;margin:10px 0}`));
  const zahl = () => { let n; do { n = 11 + rnd(89); } while (n % 10 === 0 || Math.floor(n / 10) === n % 10); return n; };

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);
    const name = id => LL.SPIELER[id].name;

    // Ein Kind hört, legt und schreibt
    async function hoerenLegen(n, sprecher, hoerer) {
      feld.innerHTML = '';
      const z = Math.floor(n / 10), e = n % 10;
      const karte = h('div', { class: 'zkarte zu' }, String(n));
      feld.append(h('div', { class: 'mitte' }, karte));
      dran.set(hoerer, mode === 'robo' ? 'hörst zu.' : 'hört zu.');
      if (sprecher === 'robo') {
        rz.sag(`Ich spreche: ${n}.`, true, 'Ich spreche die Zahl. Hör gut zu.');
        feld.append(h('div', { class: 'mitte' }, h('button', { class: 'btn', onclick: () => rz.nochmal() }, '🔊 Zahl anhören')));
      } else {
        const zeig = h('button', { class: 'btn' }, `${name(sprecher)}: Karte ansehen`);
        feld.append(h('div', { class: 'mitte' }, zeig, h('p', {}, `${name(hoerer)} schaut weg.`)));
        await new Promise(r => zeig.onclick = r);
        karte.classList.remove('zu'); zeig.remove();
        await LL.sprichSo(`Ich spreche: ${n}.`, name(sprecher));
        karte.classList.add('zu');
      }
      // Was hörst du?
      const fz = h('span', { class: 'feld' }), fe = h('span', { class: 'feld' });
      feld.append(h('div', { class: 'zeile', style: 'font-size:28px;display:flex;gap:10px;justify-content:center;align-items:center;flex-wrap:wrap;margin:10px 0' }, 'Ich höre', fz, 'Zehner und', fe, 'Einer.'));
      await LL.eingabe(feld, [{ el: fz, soll: z }, { el: fe, soll: e }], {
        beiFehler: async (i, f) => LL.hinweis(f === 1 ? (i === 0 ? 'Die Zehner hörst du am Ende: …zig. Hör noch einmal.' : 'Die Einer hörst du zuerst. Hör noch einmal.') : `Die Zahl ist ${n}. Das sind ${z} Zehner und ${e} Einer.`) });
      await LL.sprichSo(`Ich höre ${z} Zehner und ${e} Einer.`, mode === 'zwei' ? name(hoerer) : null);
      // Legen
      feld.append(h('p', { class: 'mitte', html: '<b>Du legst die Zahl.</b>' }));
      const mat = LL.legematte(feld);
      const ok = h('button', { class: 'btn ok' }, 'Fertig gelegt');
      feld.append(h('div', { class: 'mitte' }, ok));
      ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
      let f = 0;
      for (;;) {
        await new Promise(r => ok.onclick = r);
        if (mat.werte.Z === z && mat.werte.E === e) break;
        f++;
        if (f === 1) await LL.hinweis(`Du hast ${mat.werte.Z} Zehner und ${mat.werte.E} Einer gelegt. Du brauchst ${z} Zehner und ${e} Einer.`);
        else { mat.setze({ Z: z, E: e }); await LL.hinweis('Ich habe es dir gelegt. Schau es dir an.'); break; }
      }
      ok.remove();
      // Schreiben: zuerst Zehner, dann Einer
      const sz = h('span', { class: 'feld', style: 'min-width:70px' }), se = h('span', { class: 'feld', style: 'min-width:70px' });
      feld.append(h('div', { class: 'zeile', style: 'font-size:28px;display:flex;gap:6px;justify-content:center;align-items:center;margin:10px 0' }, 'Du schreibst zuerst den Zehner, dann den Einer:', sz, se));
      sz.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await LL.eingabe(feld, [{ el: sz, soll: z }, { el: se, soll: e }], { maxLen: 1, beiFehler: async i => LL.hinweis(i === 0 ? `Zuerst kommen die Zehner. Du hast ${z} Zehner gelegt.` : `Dann die Einer. Du hast ${e} Einer gelegt.`) });
      karte.classList.remove('zu');
      await LL.sprichSo([`Ich schreibe zuerst die ${z} und dann die ${e}.`], mode === 'zwei' ? name(hoerer) : null);
      if (sprecher === 'robo') rz.sag('Wir prüfen mit der Karte. Es stimmt.');
      await LL.frage('Ihr prüft mit der Karte. Es stimmt.', [{ text: 'Weiter', wert: 1 }]);
    }

    // Das Kind spricht, Robo legt und schreibt (Robo verdreht manchmal die Ziffern)
    async function kindSpricht(n) {
      feld.innerHTML = '';
      dran.set('du', 'sprichst die Zahl.');
      const karte = h('div', { class: 'zkarte' }, String(n));
      feld.append(h('p', { class: 'mitte', html: 'Du ziehst eine Karte. <b>Du sprichst die Zahl langsam.</b>' }), h('div', { class: 'mitte' }, karte));
      await LL.sprichSo(`Ich spreche: ${n}.`);
      const dreher = Math.random() < 0.45;
      const r = dreher ? (n % 10) * 10 + Math.floor(n / 10) : n;
      rz.sag(`Ich höre ${Math.floor(r / 10)} Zehner und ${r % 10} Einer. Ich schreibe ${r}.`);
      const zeig = h('div', { class: 'mitte' }, LL.zahlBild(Math.floor(r / 10), r % 10, { klein: true }), h('div', { style: 'font-size:40px;font-weight:700' }, `Robo schreibt: ${r}`));
      feld.append(zeig);
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Deine Karte: ${n}. Robo schreibt: ${r}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (a === !dreher) break;
        f++; await LL.hinweis(f === 1 ? 'Vergleiche Robos Zahl genau mit deiner Karte. Schau auf die Zehner und die Einer.' : `Deine Karte ist ${n}. Robo hat ${r} geschrieben. ${dreher ? 'Robo hat die Ziffern vertauscht.' : 'Das ist gleich.'}`);
      }
      if (dreher) { rz.sag(`Oh, ich habe die Ziffern vertauscht. Richtig ist ${n}.`); await LL.sprichSo([`Robo hat ${r} geschrieben.`, `Richtig ist ${n}: ${Math.floor(n / 10)} Zehner und ${n % 10} Einer.`]); }
      else rz.sag('Danke fürs Prüfen!');
      await wait(800);
    }

    (async () => {
      const runden = mode === 'robo'
        ? [['robo', 'du'], ['du', 'robo'], ['robo', 'du'], ['du', 'robo']]
        : [['k1', 'k2'], ['k2', 'k1'], ['k1', 'k2'], ['k2', 'k1']];
      const benutzt = new Set();
      for (const [sprecher, hoerer] of runden) {
        let n; do { n = zahl(); } while (benutzt.has(n)); benutzt.add(n);
        if (mode === 'robo' && sprecher === 'du') await kindSpricht(n);
        else await hoerenLegen(n, sprecher, hoerer);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben gut zugehört und genau geprüft.' : 'Super! Ihr habt gut zugehört und genau geprüft.');
    })();
  }

  LL.init({
    code: '2.2', title: 'Hören – legen – schreiben', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 2 · Spiel', farbe: '#2E9E44',
    intro: ['Robo sagt eine Zahl. Du hörst genau zu.', 'Du sagst, was du hörst: 2 Zehner und 3 Einer.', 'Du legst die Zahl. Du schreibst zuerst den Zehner, dann den Einer.', 'Dann sprichst du eine Zahl. Robo legt und schreibt. Du prüfst.'],
    start,
  });
})();
