/* ZR 1000 Teil B · Karte 2.4 · Glückswürfeln -> kooperativ: Schaffen wir zusammen 1000? */
(() => {
  const { h, rnd, wait } = LL;
  const WERT = { 2: 20, 3: 30, 4: 40, 5: 50, 6: 100 };
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div', { style: 'display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px;align-items:center' });
    const dran = LL.dranAnzeige(kopf); const stand = h('b', { style: 'font-size:26px' }); kopf.append(stand); main.append(kopf);
    main.append(h('p', { style: 'text-align:center', html: 'Würfel: 2 = 20, 3 = 30, 4 = 40, 5 = 50, <b>6 = 100</b>. <b>Bei einer 1 ist alles von dieser Runde weg.</b>' }));
    const feld = h('div'); main.append(feld);
    let S = 0, zuege = 0; const MAXZ = 10;
    const zeig = () => stand.textContent = `Unsere Zahl: ${S} · Zug ${zuege} von ${MAXZ}`;
    async function kindZug(id) {
      feld.innerHTML = ''; dran.set(id);
      let akt = S;
      for (;;) {
        const w = h('button', { class: 'btn' }, 'Würfeln'); const stop = h('button', { class: 'btn hell' }, 'Aufhören');
        const knoepfe = h('div', { style: 'text-align:center;margin:8px' }, w, ' ', akt > S ? stop : null); feld.append(knoepfe);
        const was = await new Promise(r => { w.onclick = () => r('w'); stop.onclick = () => r('s'); });
        knoepfe.remove();
        if (was === 's') { S = akt; await LL.sprichSo(['Ich höre auf.', `Wir haben jetzt ${S}.`], mode === 'zwei' ? LL.SPIELER[id].name : null); break; }
        const { n } = await LL.wuerfeln(feld);
        if (n === 1) { await LL.hinweis(`Eine 1! Alles von dieser Runde ist weg. Wir bleiben bei ${S}.`, null, 'Schade'); break; }
        const neu = akt + WERT[n];
        await LL.zahlFrage(feld, `Ich habe ${akt}. Ich würfle eine ${n}: ${akt} + ${WERT[n]} =`, neu, [`Die ${n} zählt ${WERT[n]}.`, `${akt} + ${WERT[n]} = ${neu}.`]);
        await LL.sprichSo([`Ich habe ${akt}. Ich würfle eine ${n}.`, `${akt} + ${WERT[n]} = ${neu}.`], mode === 'zwei' ? LL.SPIELER[id].name : null);
        akt = neu;
        if (akt >= 1000) { S = akt; break; }
      }
    }
    async function roboZug() {
      feld.innerHTML = ''; dran.set('robo');
      let akt = S, wuerfe = 0;
      for (;;) {
        if (wuerfe >= 2 + rnd(2)) { S = akt; rz.sag(`Ich höre auf. Wir haben jetzt ${S}.`); await wait(1500); break; }
        rz.sag('Ich würfle.'); const { n } = await LL.wuerfeln(feld); wuerfe++;
        if (n === 1) { rz.sag(`Oh nein, eine 1! Alles von dieser Runde ist weg. Wir bleiben bei ${S}.`); await wait(2000); break; }
        const neu = akt + WERT[n], irrt = Math.random() < 0.35, rr = irrt ? neu + (rnd(2) ? 10 : -10) : neu;
        rz.sag(`Ich habe ${akt}. Ich würfle eine ${n}. ${akt} plus ${WERT[n]} ist ${rr}.`);
        let f = 0;
        for (;;) { const x = await LL.frage(`Robo sagt: ${akt} + ${WERT[n]} = ${rr}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]); if (x === !irrt) break; f++; await LL.hinweis(f === 1 ? `Rechne nach: ${akt} + ${WERT[n]}.` : `${akt} + ${WERT[n]} = ${neu}.`); }
        if (irrt) rz.sag(`Oh, danke! ${akt} plus ${WERT[n]} ist ${neu}.`);
        akt = neu; await wait(800);
        if (akt >= 1000) { S = akt; break; }
      }
    }
    (async () => {
      const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
      if (mode === 'robo') rz.sag('Wir sammeln zusammen. Schaffen wir 1000 in 10 Zügen?');
      zeig();
      while (zuege < MAXZ && S < 1000) { const id = ids[zuege % 2]; zuege++; zeig(); if (id === 'robo') await roboZug(); else await kindZug(id); zeig(); }
      LL.ende(S >= 1000 ? (mode === 'robo' ? `Super! Wir haben zusammen ${S} geschafft.` : `Super! Ihr habt zusammen ${S} geschafft.`) : (mode === 'robo' ? `Wir haben zusammen ${S} gesammelt. Beim nächsten Mal schaffen wir 1000.` : `Ihr habt zusammen ${S} gesammelt.`));
    })();
  }
  LL.init({ code: '2.4', title: 'Glückswürfeln', lernleiter: B.LLname(2), farbe: '#2E9E44',
    intro: ['Du würfelst: 2 = 20, 3 = 30, 4 = 40, 5 = 50, 6 = 100.', 'Du rechnest dazu und sagst die neue Zahl.', 'Du darfst weiterwürfeln oder aufhören. Bei einer 1 ist alles von dieser Runde weg.', 'Ihr sammelt zusammen mit Robo: Schafft ihr 1000?'], start });
})();
