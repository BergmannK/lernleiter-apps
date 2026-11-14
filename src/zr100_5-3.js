/* ZR 100 · Karte 5.3 · Zehnerzahlen zur 100 */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `
  .streifenreihe{display:flex;gap:10px;justify-content:center;margin:10px 0}
  .zs{width:30px;height:200px;border-radius:5px;display:grid;grid-template-rows:repeat(10,1fr);padding:0}
  .zs.b{background:#D6E3FF;border:3px solid #1E5BD8}.zs.r{background:#FFD9D9;border:3px solid #E02020}
  .zs div{border-bottom:1px solid rgba(0,0,0,.25)}
  .liste{max-width:520px;margin:10px auto;font-size:28px;display:flex;flex-direction:column;gap:4px;align-items:center}
  .zeile2{display:flex;gap:8px;align-items:center;justify-content:center;font-size:30px;margin:10px 0;flex-wrap:wrap}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const reihe = h('div', { class: 'streifenreihe' }); main.append(reihe);
    const arbeit = h('div'); main.append(arbeit);
    const liste = h('div', { class: 'liste' }); main.append(liste);
    let blau = 1;
    const zeichne = (klickbar) => new Promise(res => {
      reihe.innerHTML = '';
      for (let i = 0; i < 10; i++) {
        const b = h('button', { class: 'zs ' + (i < blau ? 'b' : 'r'), 'aria-label': i < blau ? 'blauer Streifen' : 'roter Streifen' }, Array.from({ length: 10 }, () => h('div')));
        if (klickbar) b.onclick = () => { if (i < blau) { LL.hinweis('Tippe auf einen roten Streifen.'); return; } blau++; zeichne(false); res(); };
        reihe.append(b);
      }
      if (!klickbar) res();
    });
    const zeileText = (a, b) => `<span class="blau">${a}</span> + <span class="rot">${b}</span> = 100`;

    async function kindSchreibt(id) {
      const a = blau * 10, b = 100 - a;
      const fa = h('span', { class: 'feld' }), fb = h('span', { class: 'feld' }), fe = h('span', { class: 'feld' });
      arbeit.innerHTML = '';
      arbeit.append(h('div', { class: 'zeile2' }, h('span', { html: `Du schreibst: ` }), fa, '+', fb, '=', fe));
      await LL.eingabe(arbeit, [{ el: fa, soll: a }, { el: fb, soll: b }, { el: fe, soll: 100 }], {
        beiFehler: async (i, f) => LL.hinweis(i === 0 ? `Zähle die blauen Streifen. Es sind ${blau} Zehner, also ${a}.` : i === 1 ? `Zähle die roten Streifen: ${10 - blau} Zehner, also ${b}.` : 'Alle Streifen zusammen sind 10 Zehner. Das sind 100.') });
      fa.style.color = '#1E5BD8'; fb.style.color = '#E02020';
      liste.append(h('div', { html: zeileText(a, b) }));
      await LL.sprichSo(`${a} plus ${b} ist 100.`, mode === 'zwei' ? LL.SPIELER[id].name : null);
    }

    async function roboSchreibt() {
      const a = blau * 10, b = 100 - a;
      const irrt = Math.random() < 0.45;
      const rb = irrt ? b + 10 : b;
      rz.sag(`Ich schreibe: ${a} plus ${rb} ist 100.`);
      arbeit.innerHTML = '';
      arbeit.append(h('div', { class: 'zeile2', html: `Robo schreibt: ${zeileText(a, rb)}` }));
      let f = 0;
      for (;;) {
        const x = await LL.frage(`Robo schreibt: ${a} + ${rb} = 100. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (x === !irrt) break;
        f++; await LL.hinweis(f === 1 ? 'Zähle die roten Streifen.' : `Es sind ${10 - blau} rote Streifen. Das sind ${b}.`);
      }
      if (irrt) { rz.sag(`Oh, danke! Es sind ${10 - blau} rote Streifen. Richtig ist ${a} plus ${b} ist 100.`); await wait(1500); }
      else rz.sag('Danke fürs Prüfen!');
      liste.append(h('div', { html: zeileText(a, b) }));
    }

    (async () => {
      await zeichne(false);
      const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
      if (mode === 'robo') rz.sag('Du legst 10 Zehnerstreifen: 1 blauen und 9 rote.');
      for (let schritt = 1; schritt <= 9; schritt++) {
        const id = ids[(schritt - 1) % 2];
        dran.set(id);
        if (schritt > 1) {
          if (id === 'robo') { rz.sag('Ich tausche einen roten Streifen gegen einen blauen.'); await wait(1000); blau++; await zeichne(false); }
          else {
            arbeit.innerHTML = '';
            arbeit.append(h('p', { style: 'text-align:center;font-size:24px', html: '<b>Du tauschst:</b> Tippe auf einen roten Streifen. Er wird blau.' }));
            await zeichne(true);
          }
        }
        if (id === 'robo') await roboSchreibt(); else await kindSchreibt(id);
      }
      arbeit.innerHTML = '';
      await LL.sprichSo(['Die erste Zahl wird größer.', 'Die zweite Zahl wird kleiner.', 'Das Ergebnis bleibt 100.'], mode === 'zwei' ? 'Kind 1 und Kind 2' : null);
      LL.ende(mode === 'robo' ? 'Super! Wir haben alle Zehnerzahlen bis 100 gefunden.' : 'Super! Ihr habt alle Zehnerzahlen bis 100 gefunden.');
    })();
  }

  LL.init({
    code: '5.3', title: 'Zehnerzahlen zur 100', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 5 · Üben', farbe: '#E2557F',
    intro: ['Du legst 10 Zehnerstreifen: 1 blauen und 9 rote.', 'Du schreibst: 10 + 90 = 100.', 'Du tauschst einen roten Streifen gegen einen blauen. Du schreibst: 20 + 80 = 100.', 'Du machst weiter bis 90 + 10 = 100. Robo hilft und schreibt mit.'],
    start,
  });
})();
