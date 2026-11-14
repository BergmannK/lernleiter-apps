/* ZR 1000 Teil A · Karte 2.2 · Zahlen-Diktat (Stellenwert-Sprechweise) */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}.zkarte{display:inline-flex;min-width:170px;height:110px;border:3px solid #333;border-radius:14px;align-items:center;justify-content:center;font-size:52px;font-weight:700;background:#fff;padding:0 10px}`));
  const zahl = () => { let n; do { n = 101 + rnd(899); } while (n % 10 === 0 && rnd(2)); return n; };
  const stw = n => `${Math.floor(n / 100)} Hunderter, ${Math.floor(n / 10) % 10} Zehner und ${n % 10} Einer`;

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);

    async function kindLegt(n, sprecher, leger) {
      feld.innerHTML = '';
      const H = Math.floor(n / 100), Z = Math.floor(n / 10) % 10, E = n % 10;
      dran.set(leger, leger === 'du' ? 'legst die Zahl.' : 'legt die Zahl.');
      if (sprecher === 'robo') {
        rz.sag(`Ich diktiere: ${stw(n)}.`, true, 'Ich diktiere die Zahl. Hör gut zu.');
        feld.append(h('div', { class: 'mitte' }, h('button', { class: 'btn', onclick: () => rz.nochmal() }, '🔊 Diktat anhören')));
      } else {
        const z = h('button', { class: 'btn' }, `${LL.SPIELER[sprecher].name}: Karte ansehen`);
        feld.append(h('div', { class: 'mitte' }, z));
        await new Promise(r => z.onclick = r); z.remove();
        await LL.sprichSo(`Ich diktiere: ${stw(n)}.`, LL.SPIELER[sprecher].name);
      }
      feld.append(h('p', { class: 'mitte', html: '<b>Lege die Zahl</b> in die Stellenwerttafel.' }));
      const mat = LL.legematte(feld, { stellen: 'HZE' });
      const ok = h('button', { class: 'btn ok' }, 'Fertig gelegt'); feld.append(h('div', { class: 'mitte' }, ok));
      let f = 0;
      for (;;) {
        await new Promise(r => ok.onclick = r);
        if (mat.werte.H === H && mat.werte.Z === Z && mat.werte.E === E) break;
        f++;
        if (f === 1) await LL.hinweis(`Du hast ${mat.werte.H} Hunderter, ${mat.werte.Z} Zehner und ${mat.werte.E} Einer gelegt. Hör noch einmal genau hin.`);
        else { mat.setze({ H, Z, E }); await LL.hinweis(`Diktiert waren ${stw(n)}. Ich habe es dir gelegt.`); break; }
      }
      ok.remove();
      await LL.zahlFrage(feld, 'Die Zahl heißt', n, ['Schreibe zuerst die Hunderter, dann die Zehner, dann die Einer.', `${stw(n)} sind ${n}.`], '.');
      feld.prepend(h('div', { class: 'mitte' }, h('div', { class: 'zkarte' }, String(n))));
      await LL.sprichSo([`Ich lege ${stw(n)}.`, `Die Zahl heißt ${n}.`], mode === 'zwei' ? LL.SPIELER[leger].name : null);
      if (sprecher === 'robo') rz.sag('Ich prüfe mit der Karte. Es stimmt.');
    }

    async function kindDiktiert(n) {
      feld.innerHTML = '';
      dran.set('du', 'diktierst.');
      feld.append(h('p', { class: 'mitte', html: 'Du ziehst eine Karte. <b>Du diktierst die Zahl.</b> Du zeigst die Karte nicht.' }), h('div', { class: 'mitte' }, h('div', { class: 'zkarte' }, String(n))));
      await LL.sprichSo(`Ich diktiere: ${stw(n)}.`);
      const irrt = Math.random() < 0.45;
      const H = Math.floor(n / 100), Z = Math.floor(n / 10) % 10, E = n % 10;
      const r = irrt ? H * 100 + E * 10 + Z : n;
      rz.sag(`Ich lege ${stw(r)}. Die Zahl heißt ${r}.`);
      const mat = LL.legematte(feld, { stellen: 'HZE', nurAnzeige: true }); mat.setze({ H: Math.floor(r / 100), Z: Math.floor(r / 10) % 10, E: r % 10 });
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Deine Karte: ${n}. Robo legt ${r}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (a === (r === n)) break;
        f++; await LL.hinweis(f === 1 ? 'Vergleiche Hunderter, Zehner und Einer mit deiner Karte.' : `Robo hat ${r} gelegt. Deine Karte ist ${n}.`);
      }
      if (r !== n) { rz.sag(`Oh, ich habe Zehner und Einer vertauscht. Richtig ist ${n}.`); mat.setze({ H, Z, E }); await LL.sprichSo([`Das stimmt nicht.`, `Die Zahl heißt ${n}.`]); }
      else { rz.sag('Danke fürs Prüfen!'); await LL.sprichSo('Das stimmt!'); }
      await LL.sprichSo('Ich sortiere das Material.');
    }

    (async () => {
      const plan = mode === 'robo' ? [['robo', 'du'], ['du', 'robo'], ['robo', 'du'], ['du', 'robo']] : [['k1', 'k2'], ['k2', 'k1'], ['k1', 'k2'], ['k2', 'k1']];
      for (const [sp, le] of plan) {
        const n = zahl();
        if (mode === 'robo' && sp === 'du') await kindDiktiert(n); else await kindLegt(n, sp, le);
        await LL.frage('Weiter? Dann tauscht ihr.', [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben uns gegenseitig Zahlen diktiert.' : 'Super! Ihr habt euch gegenseitig Zahlen diktiert.');
    })();
  }

  LL.init({
    code: '2.2', title: 'Zahlen-Diktat', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 2 · Üben', farbe: '#2E9E44',
    intro: ['Robo zieht eine Karte. Robo sagt: „2 Hunderter, 4 Zehner, 7 Einer.“', 'Du legst die Zahl mit Würfelmaterial in die Stellenwerttafel.', 'Du sagst die Zahl. Ihr prüft mit der Karte.', 'Dann tauscht ihr: Du diktierst, Robo legt.'],
    start,
  });
})();
