/* ZR 1000 Teil A · Karte 1.2 · Vom Zehner zum Tausender */
(() => {
  const { h, wait } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}.ablage{min-height:150px;background:#fff;border:3px dashed #999;border-radius:16px;max-width:760px;margin:10px auto;display:flex;align-items:flex-end;justify-content:center;gap:8px;padding:10px;flex-wrap:wrap}
  .wuerfel3d{width:120px;height:120px;background:#D6E3FF;border:4px solid #1E5BD8;box-shadow:12px -12px 0 #9DB8F0;margin:20px}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const feld = h('div'); main.append(feld);
    const nm = mode === 'zwei' ? 'Kind 1 und Kind 2' : null;

    async function legeZehn(titel, teil, bild) {
      feld.innerHTML = '';
      feld.append(h('p', { class: 'mitte', html: titel }));
      const abl = h('div', { class: 'ablage' }); feld.append(abl);
      const knopf = h('button', { class: 'btn' }, `${teil} legen`);
      const zaehl = h('span', { style: 'font-size:26px;margin-left:12px' }, '0');
      feld.append(h('div', { class: 'mitte' }, knopf, zaehl));
      let n = 0;
      await new Promise(res => knopf.onclick = () => { n++; abl.append(bild()); zaehl.textContent = String(n); if (n === 10) { knopf.disabled = true; res(); } });
      await wait(400);
    }

    (async () => {
      if (mode === 'robo') rz.sag('Wir bündeln vom Zehner bis zum Tausender. Du legst, ich schaue zu.');
      // 1. Zehner zum Hunderter
      await legeZehn('<b>Du legst 10 Zehnerstangen</b> nebeneinander.', '1 Zehnerstange', () => LL.wuerfelMaterial(0, 1, 0));
      const f1 = h('div'); feld.append(f1);
      await LL.zahlFrage(f1, '10 Zehner sind', 1, ['Die 10 Zehnerstangen sind so groß wie eine Hunderterplatte.', '10 Zehner sind 1 Hunderter.'], 'Hunderter.');
      feld.querySelector('.ablage').innerHTML = ''; feld.querySelector('.ablage').append(LL.wuerfelMaterial(1, 0, 0));
      await LL.sprichSo('10 Zehner sind 1 Hunderter.', nm);
      // 2. Hunderter zum Tausender
      await legeZehn('<b>Du legst 10 Hunderterplatten</b> aufeinander.', '1 Hunderterplatte', () => LL.wuerfelMaterial(1, 0, 0, { klein: true }));
      const f2 = h('div'); feld.append(f2);
      await LL.zahlFrage(f2, '10 Hunderter sind', 1, ['10 Hunderterplatten aufeinander sind so hoch wie ein Tausenderwürfel.', '10 Hunderter sind 1 Tausender.'], 'Tausender.');
      feld.querySelector('.ablage').innerHTML = ''; feld.querySelector('.ablage').append(h('div', { class: 'wuerfel3d' }));
      await LL.sprichSo('10 Hunderter sind 1 Tausender.', nm);
      // 3. Wie viele Zehner hat ein Tausender?
      const f3 = h('div'); feld.append(f3);
      await LL.zahlFrage(f3, 'Ein Tausender hat', 100, ['Ein Hunderter hat 10 Zehner. Ein Tausender hat 10 Hunderter.', '10 mal 10 Zehner sind 100 Zehner.'], 'Zehner.');
      await LL.sprichSo('Ein Tausender hat 100 Zehner.', nm);
      // 4. Robo erklärt – mit einem Fehler
      if (mode === 'robo') {
        rz.sag('Jetzt erkläre ich. Ein Tausender hat 10 Zehner.');
        let f = 0;
        for (;;) {
          const a = await LL.frage('Robo sagt: Ein Tausender hat 10 Zehner. Stimmt das?', [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
          if (!a) break;
          f++; await LL.hinweis(f === 1 ? 'Wie viele Zehner hat ein Tausender? Schau auf deine Antwort von eben.' : 'Ein Tausender hat 100 Zehner. 10 Zehner sind nur 1 Hunderter.');
        }
        rz.sag('Oh, danke! 10 Zehner sind 1 Hunderter. Ein Tausender hat 100 Zehner.');
        await wait(1500);
      }
      await LL.sprichSo(['Ich erkläre: 10 Zehner sind 1 Hunderter.', '10 Hunderter sind 1 Tausender.', 'Ein Tausender hat 100 Zehner.'], nm);
      LL.ende(mode === 'robo' ? 'Super! Du hast vom Zehner bis zum Tausender gebündelt.' : 'Super! Ihr habt vom Zehner bis zum Tausender gebündelt.');
    })();
  }

  LL.init({
    code: '1.2', title: 'Vom Zehner zum Tausender', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 1 · Üben', farbe: '#E8B10E',
    intro: ['Du legst 10 Zehnerstangen nebeneinander.', 'Das ist so groß wie eine Hunderterplatte.', 'Du legst 10 Hunderterplatten aufeinander. So hoch ist ein Tausenderwürfel.', 'Du erklärst, was du gemacht hast. Robo erklärt auch. Du prüfst.'],
    start,
  });
})();
