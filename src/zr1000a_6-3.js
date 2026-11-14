/* ZR 1000 Teil A · Karte 6.3 · Wer kennt den Nachbarn? */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}.zk{display:inline-flex;min-width:170px;height:110px;border:3px solid #333;border-radius:14px;align-items:center;justify-content:center;font-size:52px;font-weight:700;background:#fff}
  .zeile2{display:flex;gap:10px;align-items:center;justify-content:center;font-size:26px;margin:8px 0;flex-wrap:wrap}`));
  const DER = art => art === 'zahl' ? 'Die' : 'Der', DERk = art => art === 'zahl' ? 'die' : 'der';
  const ART = { zahl: 'Nachbarzahl', zehner: 'Nachbarzehner', hunderter: 'Nachbarhunderter' };
  const nachbarn = (n, art) => art === 'zahl' ? [n - 1, n + 1] : art === 'zehner' ? [Math.floor(n / 10) * 10, Math.floor(n / 10) * 10 + 10] : [Math.floor(n / 100) * 100, Math.floor(n / 100) * 100 + 100];

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);
    let leicht = false;
    const zahl = () => { let n; do { n = 101 + rnd(888); } while (n % 10 === 0); return n; };
    const artVon = w => w <= 2 ? 'zahl' : w <= 4 || leicht ? 'zehner' : 'hunderter';

    async function runde(id) {
      feld.innerHTML = '';
      dran.set(id);
      const n = zahl();
      feld.append(h('div', { class: 'mitte' }, h('div', { class: 'zk' }, String(n))));
      if (id === 'robo') rz.sag(`Meine Zahl ist ${n}. Ich würfle.`);
      else { const b = h('button', { class: 'btn' }, 'Würfeln'); feld.append(h('div', { class: 'mitte' }, b)); await new Promise(r => b.onclick = r); b.parentElement.remove(); }
      const { n: w } = await LL.wuerfeln(feld);
      const art = artVon(w), [vor, nach] = nachbarn(n, art);
      feld.append(h('p', { class: 'mitte', style: 'font-size:24px', html: `Würfel ${w}: <b>${ART[art]}</b>` }));
      if (id === 'robo') {
        const irrt = Math.random() < 0.45;
        const rnach = irrt ? nach + (art === 'zahl' ? 1 : art === 'zehner' ? 10 : 100) : nach;
        rz.sag(`Meine Zahl ist ${n}. ${DER(art)} ${ART[art]} davor ist ${vor}. ${DER(art)} ${ART[art]} danach ist ${rnach}.`);
        feld.append(h('div', { class: 'zeile2', html: `Robo: davor <b>${vor}</b> · danach <b>${rnach}</b>` }));
        let f = 0;
        for (;;) {
          const a = await LL.frage(`Robo sagt: ${ART[art]} davor ${vor}, danach ${rnach}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
          if (a === !irrt) break;
          f++; await LL.hinweis(f === 1 ? `Prüfe: Zwischen welchen ${art === 'zahl' ? 'Zahlen' : art === 'zehner' ? 'Zehnerzahlen' : 'Hunderterzahlen'} liegt ${n}?` : `${n} liegt zwischen ${vor} und ${nach}.`);
        }
        if (irrt) { rz.sag(`Oh, danke! ${DER(art)} ${ART[art]} danach ist ${nach}.`); await LL.sprichSo([`Stimmt nicht, weil ${n} zwischen ${vor} und ${nach} liegt.`]); }
        else { rz.sag('Danke fürs Prüfen!'); await LL.sprichSo('Stimmt!'); }
        return;
      }
      const fv = h('span', { class: 'feld' }), fn = h('span', { class: 'feld' });
      feld.append(h('div', { class: 'zeile2' }, `${ART[art]} davor:`, fv, 'danach:', fn));
      await LL.eingabe(feld, [{ el: fv, soll: vor }, { el: fn, soll: nach }], {
        beiFehler: async (i, f) => LL.hinweis(f === 1 ? (art === 'zahl' ? 'Die Nachbarzahlen sind 1 kleiner und 1 größer.' : art === 'zehner' ? 'Nachbarzehner sind Zahlen mit 0 Einern. Zwischen welchen Zehnern liegt die Zahl?' : 'Nachbarhunderter sind Zahlen mit 0 Zehnern und 0 Einern.') : `${n} liegt zwischen ${vor} und ${nach}.`) });
      await LL.sprichSo([`Meine Zahl ist ${n}. ${DER(art)} ${ART[art]} davor ist ${vor}.`, `${DER(art)} ${ART[art]} danach ist ${nach}.`], mode === 'zwei' ? LL.SPIELER[id].name : null);
      if (mode === 'robo') rz.sag('Stimmt!');
    }

    (async () => {
      leicht = await LL.frage('Welche Nachbarn übt ihr?', [{ text: 'Nachbarzahlen und Nachbarzehner (leichter)', cls: 'hell', wert: true }, { text: 'Auch Nachbarhunderter', wert: false }]);
      const plan = mode === 'robo' ? ['du', 'robo', 'du', 'robo', 'du', 'robo'] : ['k1', 'k2', 'k1', 'k2', 'k1', 'k2'];
      for (const id of plan) { await runde(id); await LL.frage('Nächste Karte?', [{ text: 'Weiter', wert: 1 }]); }
      LL.ende(mode === 'robo' ? 'Super! Wir kennen alle Nachbarn.' : 'Super! Ihr kennt alle Nachbarn.');
    })();
  }

  LL.init({
    code: '6.3', title: 'Wer kennt den Nachbarn?', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 6 · Spiel', farbe: '#7B4FA0',
    intro: ['Du ziehst eine Zahlenkarte.', 'Du würfelst: 1 oder 2 = Nachbarzahl, 3 oder 4 = Nachbarzehner, 5 oder 6 = Nachbarhunderter.', 'Du sagst den Nachbarn davor und danach.', 'Dann ist Robo dran. Du prüfst.'],
    start,
  });
})();
