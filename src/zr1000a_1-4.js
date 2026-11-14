/* ZR 1000 Teil A · Karte 1.4 · Schätzen und bündeln (200–400 Büroklammern) */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `
  .haufen{position:relative;height:320px;max-width:780px;margin:0 auto;background:#fff;border:3px solid #ccc;border-radius:18px;overflow:hidden}
  .haufen i{position:absolute;width:14px;height:6px;border-radius:3px;background:#7a8a99}
  .decke{position:absolute;inset:0;background:repeating-linear-gradient(45deg,#eee 0 14px,#e0e0e0 14px 28px);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#666}
  .mitte{text-align:center;margin:10px 0}.schaetz{display:flex;gap:30px;justify-content:center;font-size:26px;flex-wrap:wrap}`));

  async function schaetz(feld, wer) {
    const f = h('span', { class: 'feld' });
    const z = h('div', { class: 'mitte', style: 'font-size:28px' }, h('span', { html: (wer ? `<b>${wer}:</b> ` : '') + 'Ich schätze, es sind ungefähr ' }), f, '.');
    feld.append(z);
    await new Promise(res => { const tk = LL.tastatur(k => { if (k === 'weg') f.textContent = f.textContent.slice(0, -1); else if (k === 'ok') { if (+f.textContent > 0) { tk.remove(); res(); } } else if (f.textContent.length < 4) f.textContent += k; }); feld.append(tk); });
    z.remove(); return +f.textContent;
  }

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const feld = h('div'); main.append(feld);
    (async () => {
      for (let runde = 1; runde <= 2; runde++) {
        feld.innerHTML = '';
        const n = 200 + rnd(201);
        const box = h('div', { class: 'haufen' });
        for (let i = 0; i < n; i++) box.append(h('i', { style: `left:${2 + Math.random() * 95}%;top:${2 + Math.random() * 94}%;transform:rotate(${rnd(180)}deg)` }));
        const decke = h('div', { class: 'decke' }, 'Gleich geht es los.'); box.append(decke); feld.append(box);
        if (mode === 'robo') rz.sag('Schau dir die Büroklammern an. Du fasst sie nicht an. Du hast 5 Sekunden.');
        const los = h('button', { class: 'btn' }, 'Büroklammern zeigen'); feld.append(h('div', { class: 'mitte' }, los));
        await new Promise(r => los.onclick = r); los.remove();
        decke.style.display = 'none'; await wait(5000); decke.style.display = 'flex'; decke.textContent = 'Wie viele sind es ungefähr?';
        const S = {};
        if (mode === 'robo') {
          S.du = await schaetz(feld); await LL.sprichSo(`Ich schätze, es sind ungefähr ${S.du}.`);
          S.robo = Math.round((n + (rnd(2) ? 1 : -1) * (20 + rnd(60))) / 50) * 50; rz.sag(`Ich schätze, es sind ungefähr ${S.robo}.`);
        } else {
          S.k1 = await schaetz(feld, '★ Kind 1'); S.k2 = await schaetz(feld, '● Kind 2');
          await LL.sprichSo(`Ich schätze, es sind ungefähr ${S.k1}.`, 'Kind 1'); await LL.sprichSo(`Ich schätze, es sind ungefähr ${S.k2}.`, 'Kind 2');
        }
        feld.prepend(h('div', { class: 'schaetz' }, Object.entries(S).map(([k, v]) => h('div', {}, `${LL.SPIELER[k].zeichen} ${LL.SPIELER[k].name}: ${v}`))));
        // Bündeln
        decke.style.display = 'none';
        const b1 = h('button', { class: 'btn' }, 'Immer 10 Klammern zu 1 Zehner bündeln');
        feld.append(h('div', { class: 'mitte' }, b1));
        if (mode === 'robo') rz.sag('Jetzt bündeln wir. Immer 10 Klammern sind 1 Zehner.');
        await new Promise(r => b1.onclick = r); b1.remove();
        const hu = Math.floor(n / 100), z = Math.floor(n / 10) % 10, e = n % 10;
        box.innerHTML = ''; box.style.height = 'auto'; box.style.padding = '10px';
        box.append(LL.wuerfelMaterial(0, Math.floor(n / 10), e, { klein: true }));
        const b2 = h('button', { class: 'btn' }, 'Immer 10 Zehner in einen Becher');
        feld.append(h('div', { class: 'mitte' }, b2));
        await new Promise(r => b2.onclick = r); b2.remove();
        box.innerHTML = ''; box.append(LL.wuerfelMaterial(hu, z, e));
        const fh = h('span', { class: 'feld' }), fz = h('span', { class: 'feld' }), fe = h('span', { class: 'feld' }), fn = h('span', { class: 'feld' });
        feld.append(h('div', { class: 'mitte', style: 'font-size:26px' }, 'Wir haben ', fh, ' Hunderter, ', fz, ' Zehner und ', fe, ' Einer. Das sind ', fn, '.'));
        await LL.eingabe(feld, [{ el: fh, soll: hu }, { el: fz, soll: z }, { el: fe, soll: e }, { el: fn, soll: n }], {
          beiFehler: async (i, f) => LL.hinweis(f === 1 ? ['Zähle die Becher mit den Hunderterplatten.', 'Zähle die Zehnerstangen.', 'Zähle die einzelnen Klammern.', 'Hunderter, Zehner und Einer zusammen.'][i] : [`${hu} Hunderter.`, `${z} Zehner.`, `${e} Einer.`, `Das sind ${n}.`][i]) });
        await LL.sprichSo([`Wir haben ${hu} Hunderter, ${z} Zehner und ${e} Einer.`, `Das sind ${n}.`], mode === 'zwei' ? 'Kind 1 und Kind 2' : null);
        const ids = Object.keys(S), ab = ids.map(k => Math.abs(S[k] - n));
        const best = ab[0] === ab[1] ? 'beide' : ids[ab[0] < ab[1] ? 0 : 1];
        const opt = mode === 'robo' ? [{ text: 'Meine Schätzung', wert: 'du' }, { text: 'Robos Schätzung', wert: 'robo' }, { text: 'Beide gleich nah', wert: 'beide' }] : [{ text: 'Kind 1', wert: 'k1' }, { text: 'Kind 2', wert: 'k2' }, { text: 'Beide gleich nah', wert: 'beide' }];
        let f = 0;
        for (;;) { const a = await LL.frage(`Es sind ${n}. Wessen Schätzung war nah dran?`, opt); if (a === best) break; f++; await LL.hinweis(ids.map((k, i) => `${S[k]} ist ${ab[i]} von ${n} entfernt.`).join(' ')); }
        await LL.sprichSo(best === 'beide' ? 'Unsere Schätzungen waren gleich nah dran.' : best === 'robo' ? 'Robos Schätzung war nah dran.' : best === 'du' ? 'Meine Schätzung war nah dran.' : `Die Schätzung von ${LL.SPIELER[best].name} war nah dran.`);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben zweimal geschätzt und gebündelt.' : 'Super! Ihr habt zweimal geschätzt und gebündelt.');
    })();
  }

  LL.init({
    code: '1.4', title: 'Schätzen und bündeln', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 1 · Üben', farbe: '#E8B10E',
    intro: ['Ihr schaut die Büroklammern an. Ihr fasst sie nicht an.', 'Jedes Kind schätzt: Es sind ungefähr … .', 'Ihr bündelt: immer 10 Klammern zu 1 Zehner, immer 10 Zehner in einen Becher.', 'Ihr zählt Hunderter, Zehner und Einer. Wessen Schätzung war nah dran?'],
    start,
  });
})();
