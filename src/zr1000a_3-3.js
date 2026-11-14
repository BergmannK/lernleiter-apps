/* ZR 1000 Teil A · Karte 3.3 · Zahlen-Telefon (Zahlwort hören, in die Stellenwerttafel schreiben) */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}.zkarte{display:inline-flex;min-width:170px;height:110px;border:3px solid #333;border-radius:14px;align-items:center;justify-content:center;font-size:52px;font-weight:700;background:#fff;padding:0 10px}`));
  let mitNull = true;
  const zahl = () => { let n; do { n = 101 + rnd(899); } while ((!mitNull && (n % 10 === 0 || Math.floor(n / 10) % 10 === 0)) || (Math.floor(n / 10) % 10 === n % 10)); return n; };
  const stw = n => `${Math.floor(n / 100)} Hunderter, ${Math.floor(n / 10) % 10} Zehner und ${n % 10} Einer`;

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);

    async function kindLegt(n, sprecher, leger) {
      feld.innerHTML = '';
      const H = Math.floor(n / 100), Z = Math.floor(n / 10) % 10, E = n % 10;
      dran.set(leger, leger === 'du' ? 'schreibst die Zahl.' : 'schreibt die Zahl.');
      if (sprecher === 'robo') {
        rz.sag(`Ich sage: ${n}.`, true, 'Ich sage das Zahlwort. Hör gut zu.');
        feld.append(h('div', { class: 'mitte' }, h('button', { class: 'btn', onclick: () => rz.nochmal() }, '🔊 Zahlwort anhören')));
      } else {
        const z = h('button', { class: 'btn' }, `${LL.SPIELER[sprecher].name}: Karte ansehen`);
        feld.append(h('div', { class: 'mitte' }, z));
        await new Promise(r => z.onclick = r); z.remove();
        await LL.sprichSo(['Ich sage das Zahlwort in Silben.', `Ich sage: ${n}.`], LL.SPIELER[sprecher].name);
      }
      feld.append(h('p', { class: 'mitte', html: '<b>Schreibe die Zahl</b> in die Stellenwerttafel: erst H, dann Z, dann E.' }));
      const fh = h('span', { class: 'feld', style: 'min-width:70px' }), fz = h('span', { class: 'feld', style: 'min-width:70px' }), fe = h('span', { class: 'feld', style: 'min-width:70px' });
      feld.append(h('div', { class: 'mitte', style: 'font-size:26px;display:flex;gap:6px;justify-content:center;align-items:center' }, 'H', fh, 'Z', fz, 'E', fe));
      await LL.eingabe(feld, [{ el: fh, soll: H }, { el: fz, soll: Z }, { el: fe, soll: E }], { maxLen: 1, beiFehler: async (i, f) => LL.hinweis(f === 1 ? ['Wie viele Hunderter hörst du am Anfang?', 'Die Zehner hörst du am Ende: …zig. Hörst du keine Zehner? Dann schreibst du 0.', 'Die Einer hörst du nach den Hundertern. Hörst du keine Einer? Dann schreibst du 0.'][i] : `Die Zahl ist ${n}.`) });
      feld.prepend(h('div', { class: 'mitte' }, h('div', { class: 'zkarte' }, String(n))));
      await LL.sprichSo([`Du schreibst ${n}.`, 'Stimmt!'], mode === 'zwei' ? LL.SPIELER[leger].name : null);
      if (sprecher === 'robo') rz.sag('Ich prüfe mit der Karte. Es stimmt.');
    }

    async function kindDiktiert(n) {
      feld.innerHTML = '';
      dran.set('du', 'sagst das Zahlwort.');
      feld.append(h('p', { class: 'mitte', html: 'Du ziehst eine Karte. <b>Du sagst das Zahlwort.</b> Du zeigst die Karte nicht.' }), h('div', { class: 'mitte' }, h('div', { class: 'zkarte' }, String(n))));
      await LL.sprichSo(['Ich sage das Zahlwort in Silben.', `Ich sage: ${n}.`]);
      const irrt = Math.random() < 0.45;
      const H = Math.floor(n / 100), Z = Math.floor(n / 10) % 10, E = n % 10;
      const r = irrt ? H * 100 + E * 10 + Z : n;
      rz.sag(`Ich schreibe ${r}.`);
      const mat = { setze() {} }; feld.append(h('div', { class: 'mitte' }, LL.stellentafel([Math.floor(r / 100), Math.floor(r / 10) % 10, r % 10], 'HZE')));
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Deine Karte: ${n}. Robo schreibt ${r}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (a === (r === n)) break;
        f++; await LL.hinweis(f === 1 ? 'Vergleiche Hunderter, Zehner und Einer mit deiner Karte.' : `Robo hat ${r} geschrieben. Deine Karte ist ${n}.`);
      }
      if (r !== n) { rz.sag(`Oh, ich habe Zehner und Einer vertauscht. Richtig ist ${n}.`); mat.setze({ H, Z, E }); await LL.sprichSo([`Stimmt nicht, weil Robo Zehner und Einer vertauscht hat.`, `Die Zahl heißt ${n}.`]); }
      else { rz.sag('Danke fürs Prüfen!'); await LL.sprichSo('Das stimmt!'); }
    }

    (async () => {
      mitNull = await LL.frage('Welche Zahlen nehmt ihr?', [{ text: 'Ohne Null (leichter)', cls: 'hell', wert: false }, { text: 'Auch mit Null', wert: true }]);
      const plan = mode === 'robo' ? [['robo', 'du'], ['du', 'robo'], ['robo', 'du'], ['du', 'robo']] : [['k1', 'k2'], ['k2', 'k1'], ['k1', 'k2'], ['k2', 'k1']];
      for (const [sp, le] of plan) {
        const n = zahl();
        if (mode === 'robo' && sp === 'du') await kindDiktiert(n); else await kindLegt(n, sp, le);
        await LL.frage('Weiter? Dann tauscht ihr.', [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben gut telefoniert.' : 'Super! Ihr habt gut telefoniert.');
    })();
  }

  LL.init({
    code: '3.3', title: 'Zahlen-Telefon', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 3 · Spiel', farbe: '#2BA9C2',
    intro: ['Robo zieht eine Zahlenkarte. Robo zeigt sie nicht.', 'Robo sagt das Zahlwort.', 'Du schreibst die Zahl in die Stellenwerttafel.', 'Ihr prüft mit der Karte. Dann tauscht ihr.'],
    start,
  });
})();
