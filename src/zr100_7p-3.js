/* ZR 100 · Karte 7+.3 · Dazulegen – wegnehmen (Umkehraufgabe) */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}.bildbox{display:flex;justify-content:center;min-height:200px;align-items:flex-end;background:#fff;border:3px solid #ccc;border-radius:16px;max-width:520px;margin:8px auto}
  .zeile2{display:flex;gap:8px;align-items:center;justify-content:center;font-size:30px;margin:10px 0;flex-wrap:wrap}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const feld = h('div'); main.append(feld);
    const zeig = (box, a, b, weg) => { box.innerHTML = ''; const z = Math.floor(a / 10), e = a % 10; box.append(b >= 10 ? LL.zahlBild(z + b / 10, e, { rotZ: b / 10, wegZ: weg ? b / 10 : 0 }) : LL.zahlBild(z, e + b, { rotE: b, wegE: weg ? b : 0 })); };
    const gl = (x, op, y, r) => `<span class="blau">${x}</span> ${op} <span class="rot">${y}</span> = ${r}`;

    async function kindAufgabe(a, b, id) {
      feld.innerHTML = '';
      const r = a + b, einh = b >= 10 ? `${b / 10} Zehner` : `${b} Einer`;
      const box = h('div', { class: 'bildbox' }); feld.append(box); zeig(box, a, 0, false);
      feld.append(h('p', { class: 'mitte', html: `Du legst <b>${a}</b>.` }));
      const dazu = h('button', { class: 'btn' }, `${einh} in Rot dazulegen`);
      feld.append(h('div', { class: 'mitte' }, dazu));
      await new Promise(res => dazu.onclick = res); dazu.remove();
      zeig(box, a, b, false);
      const p1 = h('span', { class: 'feld' }), p2 = h('span', { class: 'feld' }), p3 = h('span', { class: 'feld' });
      feld.append(h('div', { class: 'zeile2' }, 'Du schreibst:', p1, '+', p2, '=', p3));
      await LL.eingabe(feld, [{ el: p1, soll: a }, { el: p2, soll: b }, { el: p3, soll: r }], { beiFehler: async (i) => LL.hinweis(i === 0 ? `Am Anfang lag ${a}.` : i === 1 ? `Du hast ${einh} dazugelegt.` : `${a} + ${b} = ${r}. Zähle nach.`) });
      await LL.sprichSo(`Ich lege ${b} dazu.`, mode === 'zwei' ? LL.SPIELER[id].name : null);
      const weg = h('button', { class: 'btn' }, `Die ${einh} wieder wegnehmen`);
      feld.append(h('div', { class: 'mitte' }, weg));
      weg.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await new Promise(res => weg.onclick = res); weg.remove();
      zeig(box, a, b, true);
      const m1 = h('span', { class: 'feld' }), m2 = h('span', { class: 'feld' }), m3 = h('span', { class: 'feld' });
      feld.append(h('div', { class: 'zeile2' }, 'Du schreibst:', m1, '–', m2, '=', m3));
      m1.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await LL.eingabe(feld, [{ el: m1, soll: r }, { el: m2, soll: b }, { el: m3, soll: a }], { beiFehler: async (i) => LL.hinweis(i === 0 ? `Vor dem Wegnehmen waren es ${r}.` : i === 1 ? `Du nimmst ${b} wieder weg.` : `Es bleibt die Zahl vom Anfang: ${a}.`) });
      await LL.sprichSo([`Ich nehme die ${b} wieder weg.`, 'Die Minusaufgabe ist die Umkehraufgabe.'], mode === 'zwei' ? LL.SPIELER[id].name : null);
    }

    async function roboAufgabe(a, b) {
      feld.innerHTML = '';
      const r = a + b;
      const box = h('div', { class: 'bildbox' }); feld.append(box); zeig(box, a, b, false);
      rz.sag(`Ich lege ${a}. Ich lege ${b} dazu. ${a} plus ${b} ist ${r}.`);
      feld.append(h('div', { class: 'zeile2', html: gl(a, '+', b, r) }));
      await wait(1800);
      zeig(box, a, b, true);
      const irrt = Math.random() < 0.45;
      const fx = irrt ? (rnd(2) ? [r, '+', b, r + b] : [r, '–', b, a + 10]) : [r, '–', b, a];
      rz.sag(`Ich nehme die ${b} wieder weg. Meine Umkehraufgabe ist ${fx[0]} ${fx[1]} ${fx[2]} ist ${fx[3]}.`);
      feld.append(h('div', { class: 'zeile2', html: 'Robo: ' + gl(...fx) }));
      let f = 0;
      for (;;) {
        const x = await LL.frage(`Robo schreibt: ${fx[0]} ${fx[1]} ${fx[2]} = ${fx[3]}. Stimmt die Umkehraufgabe?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (x === !irrt) break;
        f++; await LL.hinweis(f === 1 ? 'Bei der Umkehraufgabe nimmst du wieder weg. Du kommst zur Zahl vom Anfang zurück.' : `Richtig ist ${r} – ${b} = ${a}.`);
      }
      if (irrt) { rz.sag(`Oh, danke! Richtig ist ${r} minus ${b} ist ${a}.`); await LL.sprichSo([`${r} – ${b} = ${a}.`, 'Die Minusaufgabe ist die Umkehraufgabe.']); }
      else rz.sag('Danke fürs Prüfen!');
    }

    (async () => {
      const A = [[34, 5], [52, 6], [47, 20], [10 + rnd(5) * 10 + rnd(5) + 1, 1 + rnd(4)], [20 + rnd(4) * 10 + rnd(9), 10 * (1 + rnd(3))], [61 + rnd(3), 3 + rnd(4)]];
      const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
      for (let i = 0; i < A.length; i++) {
        const id = ids[i % 2]; dran.set(id);
        if (id === 'robo') await roboAufgabe(...A[i]); else await kindAufgabe(...A[i], id);
        await LL.frage('Nächste Aufgabe?', [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben immer beide Aufgaben aufgeschrieben.' : 'Super! Ihr habt immer beide Aufgaben aufgeschrieben.');
    })();
  }

  LL.init({
    code: '7+.3', title: 'Dazulegen – wegnehmen', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Wiederholung 7+ · Einführung', farbe: '#6E6E6E',
    intro: ['Du legst 34. Du legst 5 rote Einer dazu. Du schreibst 34 + 5 = 39.', 'Du nimmst die 5 roten wieder weg. Du schreibst 39 – 5 = 34.', 'Du legst auch 52 + 6 und 47 + 20 und nimmst wieder weg.', 'Du schreibst immer beide Aufgaben auf. Robo macht es auch. Du prüfst.'],
    start,
  });
})();
