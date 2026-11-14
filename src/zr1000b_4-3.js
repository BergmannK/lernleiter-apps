/* ZR 1000 Teil B · Karte 4.3 · Zahlen-Duell -> kooperativ: Ergebnisse vergleichen */
(() => {
  const { h, rnd, wait } = LL;
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const feld = h('div'); main.append(feld);
    const gen = () => { const hu = 2 + rnd(6), z = rnd(9), e = rnd(9), bz = 1 + rnd(9), be = 1 + rnd(9); if (z + bz > 9 || e + be > 9) return null; return { a: hu * 100 + z * 10 + e, op: '+', b: bz * 10 + be }; };
    async function kindRechnet(t, wer) {
      const bz = t.b - t.b % 10, be = t.b % 10, m = t.a + bz;
      const box = h('div', { style: 'background:#fff;border:3px solid #ccc;border-radius:16px;padding:10px;margin:8px auto;max-width:700px' }, h('div', { style: 'font-size:36px;font-weight:700;text-align:center', html: `${wer}: ${B.auf(t)}` }));
      feld.append(box);
      await LL.zahlFrage(box, `${t.a} + ${bz} =`, m, ['Rechne erst die Zehner.', `${t.a} + ${bz} = ${m}.`]);
      await LL.zahlFrage(box, `${m} + ${be} =`, B.erg(t), ['Rechne dann die Einer.', `${m} + ${be} = ${B.erg(t)}.`]);
      return B.erg(t);
    }
    (async () => {
      for (let r = 0; r < 4; r++) {
        feld.innerHTML = '';
        let ta, tb; do { ta = gen(); tb = gen(); } while (!ta || !tb || B.erg(ta) === B.erg(tb));
        const a = await kindRechnet(ta, mode === 'robo' ? '★ Deine Karte' : '★ Kind 1');
        let b;
        if (mode === 'robo') {
          const irrt = Math.random() < 0.4; b = irrt ? B.erg(tb) + 10 : B.erg(tb);
          rz.sag(`Meine Karte ist ${B.rt(tb)}. Mein Ergebnis ist ${b}.`);
          feld.append(h('div', { class: 'mitte', style: 'font-size:30px;text-align:center', html: `🤖 Robo: ${B.auf(tb)} = <b>${b}</b>` }));
          let f = 0;
          for (;;) { const x = await LL.frage(`Robo sagt: ${B.rt(tb)} = ${b}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]); if (x === !irrt) break; f++; await LL.hinweis(f === 1 ? 'Rechne Robos Aufgabe nach: erst die Zehner, dann die Einer.' : `${B.rt(tb)} = ${B.erg(tb)}.`); }
          if (irrt) { b = B.erg(tb); rz.sag(`Oh, danke! Mein Ergebnis ist ${b}.`); } else rz.sag('Danke fürs Prüfen!');
        } else b = await kindRechnet(tb, '● Kind 2');
        const soll = a > b ? '>' : '<';
        let f = 0;
        for (;;) { const x = await LL.frage(`Vergleiche: ${a} ? ${b}`, [{ text: '<', wert: '<' }, { text: '>', wert: '>' }]); if (x === soll) break; f++; await LL.hinweis(f === 1 ? 'Vergleiche zuerst die Hunderter, dann die Zehner, dann die Einer.' : `${a} ${soll} ${b}.`); }
        await LL.sprichSo([`Mein Ergebnis ist ${a}.`, `${mode === 'robo' ? 'Robos' : 'Dein'} Ergebnis ist ${b}.`, `${Math.max(a, b)} ist größer als ${Math.min(a, b)}.`], mode === 'zwei' ? 'Kind 1' : null);
        await LL.frage('Nächste Karten?', [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben viermal gerechnet und verglichen.' : 'Super! Ihr habt viermal gerechnet und verglichen.');
    })();
  }
  LL.init({ code: '4.3', title: 'Zahlen-Duell', lernleiter: B.LLname(4), farbe: '#EE7F4B',
    intro: ['Du ziehst eine Karte. Robo auch.', 'Ihr rechnet beide: erst die Zehner, dann die Einer.', 'Du prüfst Robos Ergebnis.', 'Ihr vergleicht: … ist größer als … . Niemand gewinnt.'], start });
})();
