/* ZR 100 · Karte 1.3 · Schätzen und bündeln */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `
  .haufen{position:relative;height:300px;max-width:760px;margin:0 auto;background:#fff;border:3px solid #ccc;border-radius:18px;overflow:hidden}
  .haufen .p{position:absolute;width:26px;height:26px;border-radius:50%;background:#1E5BD8;border:2px solid #0d3a99;padding:0}
  .haufen .p.weg{visibility:hidden}
  .decke{position:absolute;inset:0;background:repeating-linear-gradient(45deg,#eee 0 14px,#e0e0e0 14px 28px);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;color:#666}
  .buendel{display:flex;gap:8px;align-items:flex-end;min-height:190px;justify-content:center;flex-wrap:wrap;margin:10px 0}
  .streifen{display:grid;grid-template-rows:repeat(10,16px);width:20px;border:2px solid #1E5BD8;border-radius:4px;background:#fff}
  .streifen div{border-bottom:1px solid #9bb6ef}.streifen div.voll{background:#1E5BD8}
  .schaetz{display:flex;gap:30px;justify-content:center;font-size:26px;flex-wrap:wrap}`));

  function haufen(n) {
    const box = h('div', { class: 'haufen' });
    const W = Math.min(760, document.body.clientWidth - 40), H = 300, pts = [];
    for (let i = 0; i < n; i++) {
      let x, y, t = 0;
      do { x = 10 + Math.random() * (W - 46); y = 10 + Math.random() * (H - 46); t++; } while (t < 60 && pts.some(p => Math.hypot(p[0] - x, p[1] - y) < 30));
      pts.push([x, y]);
      box.append(h('button', { class: 'p', style: `left:${x}px;top:${y}px`, 'aria-label': 'Plättchen' }));
    }
    return box;
  }

  async function schaetzEingabe(main, wer) {
    const f = h('span', { class: 'feld' });
    const z = h('div', { class: 'zeile', style: 'font-size:28px;text-align:center;margin:10px 0' }, h('span', { html: (wer ? `<b>${wer}:</b> ` : '') + 'Ich schätze, es sind ungefähr ' }), f, '.');
    main.append(z);
    await new Promise(res => {
      const tk = LL.tastatur(k => {
        if (k === 'weg') f.textContent = f.textContent.slice(0, -1);
        else if (k === 'ok') { if (+f.textContent > 0) { tk.remove(); res(); } }
        else if (f.textContent.length < 3) f.textContent += k;
      });
      main.append(tk);
    });
    z.remove();
    return +f.textContent;
  }

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const feld = h('div'); main.append(feld);
    const RUNDEN = 2;

    async function runde(nr) {
      feld.innerHTML = '';
      const n = 30 + rnd(31);
      const box = haufen(n);
      const decke = h('div', { class: 'decke' }, 'Gleich geht es los.');
      box.append(decke); feld.append(box);
      if (mode === 'robo') rz.sag('Schau genau hin. Du hast 3 Sekunden. Du zählst nicht.');
      const los = h('button', { class: 'btn', style: 'display:block;margin:12px auto' }, 'Plättchen zeigen');
      feld.append(los);
      await new Promise(r => los.onclick = r); los.remove();
      decke.style.display = 'none';
      await wait(3000);
      decke.style.display = 'flex'; decke.textContent = 'Wie viele sind es ungefähr?';
      // Schätzen
      const schaetzungen = {};
      if (mode === 'robo') {
        schaetzungen.du = await schaetzEingabe(feld);
        await LL.sprichSo(`Ich schätze, es sind ungefähr ${schaetzungen.du}.`);
        const r = Math.max(10, Math.round((n + (rnd(2) ? 1 : -1) * (3 + rnd(10))) / 10) * 10);
        schaetzungen.robo = r;
        rz.sag(`Ich schätze, es sind ungefähr ${r}.`);
      } else {
        schaetzungen.k1 = await schaetzEingabe(feld, '★ Kind 1');
        schaetzungen.k2 = await schaetzEingabe(feld, '● Kind 2');
        await LL.sprichSo([`Ich schätze, es sind ungefähr ${schaetzungen.k1}.`], 'Kind 1');
        await LL.sprichSo([`Ich schätze, es sind ungefähr ${schaetzungen.k2}.`], 'Kind 2');
      }
      const tafel = h('div', { class: 'schaetz' }, Object.entries(schaetzungen).map(([k, v]) => h('div', {}, `${LL.SPIELER[k].zeichen} ${LL.SPIELER[k].name}: ${v}`)));
      feld.prepend(tafel);
      // Bündeln
      decke.remove();
      const anw = h('p', { style: 'text-align:center;font-size:24px', html: '<b>Ihr bündelt.</b> Tippe jedes Plättchen an. Immer 10 kommen auf einen Zehnerstreifen.' });
      const bund = h('div', { class: 'buendel' });
      feld.insertBefore(anw, box); feld.append(bund);
      if (mode === 'robo') rz.sag('Jetzt bündeln wir. Tippe die Plättchen an.');
      let gelegt = 0, akt = null;
      await new Promise(res => {
        box.querySelectorAll('.p').forEach(p => p.onclick = () => {
          if (p.classList.contains('weg')) return;
          p.classList.add('weg');
          if (gelegt % 10 === 0) { akt = h('div', { class: 'streifen' }, Array.from({ length: 10 }, () => h('div'))); bund.append(akt); }
          akt.children[9 - (gelegt % 10)].classList.add('voll');
          gelegt++;
          if (gelegt === n) res();
        });
      });
      // aus den vollen Streifen Zehnerstreifen machen, Rest als Einer zeigen
      const z = Math.floor(n / 10), e = n % 10;
      bund.innerHTML = ''; bund.append(LL.zahlBild(z, e));
      box.remove();
      await LL.zahlFrage(feld, 'Wir haben', z, ['Zähle die vollen Zehnerstreifen.', `Es sind ${z} Zehnerstreifen.`], 'Zehner gebündelt.');
      await LL.zahlFrage(feld, 'Dazu kommen', e, ['Zähle die einzelnen Plättchen.', `Es sind ${e} Einer.`], 'Einer.');
      await LL.zahlFrage(feld, `${z} Zehner und ${e} Einer sind`, n, [`${z} Zehner sind ${z * 10}. Dazu ${e} Einer.`, `Es sind ${n}.`], '.');
      await LL.sprichSo([`Wir haben ${z} Zehner und ${e} Einer gebündelt.`, `Das sind ${n}.`], mode === 'zwei' ? 'Kind 1 und Kind 2' : null);
      // Vergleichen
      const ids = Object.keys(schaetzungen);
      const abst = ids.map(k => Math.abs(schaetzungen[k] - n));
      const best = abst[0] === abst[1] ? 'beide' : ids[abst[0] < abst[1] ? 0 : 1];
      const opt = mode === 'robo'
        ? [{ text: 'Meine Schätzung', wert: 'du' }, { text: 'Robos Schätzung', wert: 'robo' }, { text: 'Beide gleich nah', wert: 'beide' }]
        : [{ text: 'Kind 1', wert: 'k1' }, { text: 'Kind 2', wert: 'k2' }, { text: 'Beide gleich nah', wert: 'beide' }];
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Es sind ${n}. Wessen Schätzung war nah dran?`, opt);
        if (a === best) break;
        f++; await LL.hinweis(f === 1 ? `Vergleiche: ${ids.map(k => `${LL.SPIELER[k].name} ${schaetzungen[k]}`).join(', ')}. Welche Zahl ist näher an ${n}?` :
          ids.map((k, i) => `${schaetzungen[k]} ist ${abst[i]} von ${n} entfernt.`).join(' '));
      }
      const satz = best === 'beide' ? 'Unsere Schätzungen waren gleich nah dran.' : best === 'robo' ? 'Robos Schätzung war nah dran.' : best === 'du' ? 'Meine Schätzung war nah dran.' : `Die Schätzung von ${LL.SPIELER[best].name} war nah dran.`;
      await LL.sprichSo(satz);
      if (mode === 'robo') rz.sag(nr < RUNDEN ? 'Wir spielen noch einmal.' : 'Schätzen wird mit Übung immer besser.');
    }

    (async () => {
      for (let i = 1; i <= RUNDEN; i++) await runde(i);
      LL.ende(mode === 'robo' ? 'Super! Wir haben zweimal geschätzt und gebündelt.' : 'Super! Ihr habt zweimal geschätzt und gebündelt.');
    })();
  }

  LL.init({
    code: '1.3', title: 'Schätzen und bündeln', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 1 · Üben', farbe: '#E8B10E',
    intro: ['Viele Plättchen erscheinen. Du schaust 3 Sekunden hin.', 'Du schätzt: Es sind ungefähr … . Robo schätzt auch.', 'Ihr bündelt immer 10 Plättchen auf einen Zehnerstreifen. Ihr zählt.', 'Ihr vergleicht: Wessen Schätzung war nah dran?'],
    start,
  });
})();
