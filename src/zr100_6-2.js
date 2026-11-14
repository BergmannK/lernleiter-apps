/* ZR 100 · Karte 6.2 · Nur die Zehner ändern sich */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}.auf{font-size:44px;font-weight:700;text-align:center;margin:6px 0}`));

  function aufgaben() {
    const s = 11 + rnd(2) * 10 + rnd(8), m = 61 + rnd(3) * 10 + rnd(8);
    const plus = [20, 50, 70].filter(d => s + d < 100).map(d => ({ a: s, d, op: '+' }));
    const minus = [20, 30, 40].map(d => ({ a: m, d, op: '–' }));
    return plus.concat(minus).slice(0, 6);
  }
  const erg = t => t.op === '+' ? t.a + t.d : t.a - t.d;
  const txt = t => `<span class="blau">${t.a}</span> ${t.op} <span class="rot">${t.d}</span>`;

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);

    async function kindRechnet(t, id) {
      feld.innerHTML = '';
      const z = Math.floor(t.a / 10), e = t.a % 10, dz = t.d / 10, r = erg(t);
      feld.append(h('div', { class: 'auf', html: txt(t) }));
      feld.append(h('p', { class: 'mitte', html: `Auf der Legematte liegt ${t.a}. <b>${t.op === '+' ? `Lege ${dz} Zehner dazu.` : `Nimm ${dz} Zehner weg.`}</b>` }));
      const mat = LL.legematte(feld); mat.setze({ Z: z, E: e });
      const ok = h('button', { class: 'btn ok' }, 'Fertig');
      feld.append(h('div', { class: 'mitte' }, ok));
      let f = 0;
      for (;;) {
        await new Promise(res => ok.onclick = res);
        if (mat.werte.Z === Math.floor(r / 10) && mat.werte.E === e) break;
        f++;
        if (mat.werte.E !== e) await LL.hinweis(`Die Einer bleiben gleich. Es sind ${e} Einer.`);
        else await LL.hinweis(f === 1 ? `Du ${t.op === '+' ? 'legst' : 'nimmst'} nur Zehnerstreifen ${t.op === '+' ? 'dazu' : 'weg'}: ${dz} Stück.` : `Am Ende liegen ${Math.floor(r / 10)} Zehner.`);
        if (f >= 3) { mat.setze({ Z: Math.floor(r / 10), E: e }); break; }
      }
      ok.remove();
      await LL.zahlFrage(feld, `${txt(t)} =`, r, [`Zähle die Zehner und Einer auf der Legematte.`, `${Math.floor(r / 10)} Zehner und ${e} Einer sind ${r}.`]);
      let g = 0;
      for (;;) {
        const x = await LL.frage(`${t.a} ${t.op} ${t.d} = ${r}. Was bleibt gleich?`, [{ text: 'Die Einer', wert: 'e' }, { text: 'Die Zehner', wert: 'z' }]);
        if (x === 'e') break;
        g++; await LL.hinweis(g === 1 ? `Vergleiche ${t.a} und ${r}. Welche Ziffer ist gleich?` : `Bei ${t.a} und ${r} sind die Einer gleich: ${e}.`);
      }
      await LL.sprichSo(['Die Einer bleiben gleich.', t.op === '+' ? 'Ich lege nur Zehnerstreifen dazu.' : `Ich nehme ${dz} Zehner weg.`, `${t.a} ${t.op} ${t.d} = ${r}.`], mode === 'zwei' ? LL.SPIELER[id].name : null);
    }

    async function roboRechnet(t) {
      feld.innerHTML = '';
      const r = erg(t), e = t.a % 10;
      feld.append(h('div', { class: 'auf', html: txt(t) }));
      const irrt = Math.random() < 0.45;
      const rr = irrt ? (t.op === '+' ? r + (rnd(2) ? 1 : 10) : r - (rnd(2) ? 1 : 10)) : r;
      rz.sag(`Ich ${t.op === '+' ? 'lege' : 'nehme'} ${t.d / 10} Zehner ${t.op === '+' ? 'dazu' : 'weg'}. Das Ergebnis ist ${rr}.`);
      const mat = LL.legematte(feld, { nurAnzeige: true }); mat.setze({ Z: Math.floor(rr / 10), E: rr % 10 });
      feld.append(h('div', { class: 'auf', html: `Robo: ${txt(t)} = ${rr}` }));
      let f = 0;
      for (;;) {
        const x = await LL.frage(`Robo sagt: ${t.a} ${t.op} ${t.d} = ${rr}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (x === !irrt) break;
        f++; await LL.hinweis(f === 1 ? 'Prüfe: Sind die Einer gleich geblieben? Stimmen die Zehner?' : `Richtig ist ${t.a} ${t.op} ${t.d} = ${r}.`);
      }
      if (irrt) { rz.sag(`Oh, danke! Richtig ist ${r}. Die Einer bleiben gleich.`); mat.setze({ Z: Math.floor(r / 10), E: e }); await LL.sprichSo([`${t.a} ${t.op} ${t.d} = ${r}.`, 'Die Einer bleiben gleich.']); }
      else rz.sag('Danke fürs Prüfen!');
    }

    (async () => {
      const A = aufgaben();
      const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
      for (let i = 0; i < A.length; i++) {
        const id = ids[i % 2]; dran.set(id);
        if (i === 3) await LL.frage('Jetzt kommt Minus. Du nimmst Zehner weg.', [{ text: 'Los geht\'s', wert: 1 }]);
        if (id === 'robo') await roboRechnet(A[i]); else await kindRechnet(A[i], id);
        await LL.frage('Nächste Aufgabe?', [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Super! Nur die Zehner haben sich geändert.' : 'Super! Ihr habt es geschafft.');
    })();
  }

  LL.init({
    code: '6.2', title: 'Nur die Zehner ändern sich', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 6 · Üben', farbe: '#7B4FA0',
    intro: ['Du legst 12. Du legst 2 Zehner dazu: 12 + 20 = 32.', 'Du legst auch 12 + 50 und 12 + 70.', 'Du schaust: Was bleibt gleich? Was ändert sich?', 'Minus: Du legst 65. Du nimmst 2 Zehner weg: 65 – 20 = 45.'],
    start,
  });
})();
