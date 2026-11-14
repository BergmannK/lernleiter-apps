/* ZR 100 · Karte 2.3 · Blitzblick */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `
  .blitz{position:relative;min-height:240px;max-width:520px;margin:10px auto;background:#fff;border:3px solid #ccc;border-radius:18px;display:flex;align-items:center;justify-content:center}
  .blitz .heft{position:absolute;inset:0;border-radius:15px;background:repeating-linear-gradient(45deg,#E8F0FF 0 14px,#D6E3FF 14px 28px);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#1E5BD8}
  .mitte{text-align:center;margin:10px 0}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);
    let sek = 3;

    function blitzFeld(z, e) {
      const b = h('div', { class: 'blitz' }, LL.zahlBild(z, e));
      const heft = h('div', { class: 'heft' }, 'abgedeckt'); b.append(heft);
      return { b, auf: () => heft.style.display = 'none', zu: () => heft.style.display = 'flex' };
    }

    async function kindSchaut(n, leger, schauer) {
      feld.innerHTML = '';
      const z = Math.floor(n / 10), e = n % 10;
      dran.set(schauer, mode === 'robo' || schauer === 'du' ? 'schaust.' : 'schaut.');
      const bf = blitzFeld(z, e); feld.append(bf.b);
      if (leger === 'robo') rz.sag('Ich habe eine Zahl gelegt. Gleich decke ich auf. Schau genau hin.');
      else feld.prepend(h('p', { class: 'mitte', html: `${LL.SPIELER[leger].name} hat die Zahl ${n} gelegt.` }));
      const los = h('button', { class: 'btn' }, `Aufdecken (${sek} Sekunden)`);
      const nochmal = h('button', { class: 'btn hell', style: 'display:none' }, 'Noch einmal schauen');
      feld.append(h('div', { class: 'mitte' }, los, ' ', nochmal));
      const zeigen = async () => { los.disabled = nochmal.disabled = true; bf.auf(); await wait(sek * 1000); bf.zu(); los.style.display = 'none'; nochmal.style.display = ''; nochmal.disabled = false; };
      await new Promise(r => los.onclick = async () => { await zeigen(); r(); });
      nochmal.onclick = zeigen;
      if (leger === 'robo') rz.sag('Welche Zahl hast du gesehen?');
      const fz = h('span', { class: 'feld' }), fe = h('span', { class: 'feld' }), fn = h('span', { class: 'feld' });
      feld.append(h('div', { class: 'mitte', style: 'font-size:28px' }, 'Ich sehe ', fz, ' Zehner und ', fe, ' Einer. Die Zahl heißt ', fn, '.'));
      await LL.eingabe(feld, [{ el: fz, soll: z }, { el: fe, soll: e }, { el: fn, soll: n }], {
        beiFehler: async (i, f) => LL.hinweis(f === 1 ? 'Tippe auf „Noch einmal schauen“. Die Zehnerstreifen stehen links, die Einer rechts.' : (i === 0 ? `Es sind ${z} Zehnerstreifen.` : i === 1 ? `Es sind ${e} Einer.` : `${z} Zehner und ${e} Einer sind ${n}.`)) });
      bf.auf(); nochmal.remove(); los.remove();
      await LL.sprichSo([`Ich sehe ${z} Zehner und ${e} Einer.`, `Die Zahl heißt ${n}.`], mode === 'zwei' ? LL.SPIELER[schauer].name : null);
      if (leger === 'robo') rz.sag('Das stimmt!');
    }

    async function roboSchaut() {
      feld.innerHTML = '';
      dran.set('du', 'legst eine Zahl.');
      rz.sag('Ich schaue weg. Du legst eine Zahl.');
      feld.append(h('p', { class: 'mitte', html: '<b>Du legst eine Zahl</b> mit Zehnern und Einern.' }));
      const mat = LL.legematte(feld);
      const ok = h('button', { class: 'btn ok' }, 'Fertig gelegt');
      feld.append(h('div', { class: 'mitte' }, ok));
      for (;;) { await new Promise(r => ok.onclick = r); if (mat.wert() > 0) break; await LL.hinweis('Lege zuerst Zehner und Einer.'); }
      const z = mat.werte.Z, e = mat.werte.E, n = mat.wert();
      feld.innerHTML = '';
      const bf = blitzFeld(z, e); feld.append(bf.b);
      rz.sag(`Deck auf. Ich schaue ${sek} Sekunden.`);
      const auf = h('button', { class: 'btn' }, 'Für Robo aufdecken');
      feld.append(h('div', { class: 'mitte' }, auf));
      await new Promise(r => auf.onclick = r); auf.remove();
      bf.auf(); await wait(sek * 1000); bf.zu();
      const irrt = Math.random() < 0.4;
      let rz2 = z, re = e;
      if (irrt) { if (e > 1 && rnd(2)) re = e - 1; else if (z < 9) rz2 = z + 1; else re = (e + 1) % 10; }
      const r = rz2 * 10 + re;
      rz.sag(`Ich sehe ${rz2} Zehner und ${re} Einer. Die Zahl heißt ${r}.`);
      bf.auf();
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Robo sagt: ${r}. Du hast ${n} gelegt. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (a === (r === n)) break;
        f++; await LL.hinweis(f === 1 ? 'Vergleiche Robos Zahl mit deiner Zahl.' : `Robo sagt ${r}. Gelegt ist ${n}.`);
      }
      if (r === n) await LL.sprichSo('Das stimmt!');
      else { rz.sag('Oh, ich habe falsch gezählt.'); await LL.sprichSo([`Das stimmt nicht.`, `Ich habe ${z} Zehner und ${e} Einer gelegt.`, `Die Zahl heißt ${n}.`]); }
    }

    (async () => {
      sek = await LL.frage('Wie lange schaut ihr hin?', [{ text: '3 Sekunden', wert: 3 }, { text: '2 Sekunden (schwerer)', cls: 'hell', wert: 2 }]);
      const plan = mode === 'robo' ? ['robo', 'du', 'robo', 'du'] : [['k1', 'k2'], ['k2', 'k1'], ['k1', 'k2'], ['k2', 'k1']];
      for (const p of plan) {
        if (p === 'robo') { let n; do { n = 11 + rnd(89); } while (n % 10 === 0); await kindSchaut(n, 'robo', 'du'); }
        else if (p === 'du') await roboSchaut();
        else {
          // zu zweit: ein Kind legt verdeckt, das andere schaut
          const [leger, schauer] = p;
          feld.innerHTML = '';
          dran.set(leger, 'legt eine Zahl.');
          feld.append(h('p', { class: 'mitte', html: `<b>${LL.SPIELER[leger].name} legt eine Zahl.</b> ${LL.SPIELER[schauer].name} schaut weg.` }));
          const mat = LL.legematte(feld);
          const ok = h('button', { class: 'btn ok' }, 'Fertig gelegt');
          feld.append(h('div', { class: 'mitte' }, ok));
          for (;;) { await new Promise(r => ok.onclick = r); if (mat.wert() > 0) break; await LL.hinweis('Lege zuerst Zehner und Einer.'); }
          await kindSchaut(mat.wert(), leger, schauer);
        }
        await LL.frage('Weiter? Dann tauscht ihr.', [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben schnell und genau geschaut.' : 'Super! Ihr habt schnell und genau geschaut.');
    })();
  }

  LL.init({
    code: '2.3', title: 'Blitzblick', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 2 · Spiel', farbe: '#2E9E44',
    intro: ['Robo legt eine Zahl mit Zehnerstreifen und Plättchen.', 'Robo deckt auf. Du schaust 3 Sekunden hin.', 'Robo deckt wieder ab. Du sagst die Zahl.', 'Dann tauscht ihr: Du legst, Robo schaut.'],
    start,
  });
})();
