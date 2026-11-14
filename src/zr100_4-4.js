/* ZR 100 · Karte 4.4 · Errate die Zahl (Hundertertafel) */
(() => {
  const { h, rnd, wait } = LL;
  const css = `
  .tafel{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;max-width:min(640px,calc(100vh - 250px));min-width:300px;margin:0 auto;user-select:none}
  .tafel button{aspect-ratio:1;border:2px solid #555;border-radius:6px;background:#fff;font-size:21px;font-weight:700;padding:0}
  .tafel button.zu{background:#BDBDBD;color:#888;border-color:#999}
  .tafel button.tipp{background:#FFD54A}
  .tafel button.ziel{background:#2E7D32;color:#fff}
  .tafel button.zone{outline:4px solid #E7B400;outline-offset:-4px}
  .info{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:10px}
  .striche{font-size:26px;letter-spacing:2px;color:#444}
  .bereich{font-weight:700}
  .geheim{max-width:520px;margin:20px auto;text-align:center}
  `;
  document.head.append(h('style', {}, css));

  function start(mode, main) {
    let bis = 100;
    // Runde 1: Robo / Kind 2 denkt, das Kind rät. Runde 2: Rollen tauschen.
    const runden = mode === 'robo' ? [{ denker: 'robo', rater: 'du' }, { denker: 'du', rater: 'robo' }]
                                   : [{ denker: 'k1', rater: 'k2' }, { denker: 'k2', rater: 'k1' }];
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const info = h('div', { class: 'info' }); main.append(info);
    const dran = LL.dranAnzeige(info);
    const bereichEl = h('div', { class: 'bereich' }); info.append(bereichEl);
    const striche = h('div', { class: 'striche', title: 'Versuche' }); info.append(striche);
    const tafel = h('div', { class: 'tafel' }); main.append(tafel);
    const unten = h('div'); main.append(unten);
    const felder = [];
    for (let n = 1; n <= 100; n++) felder[n] = h('button', {}, String(n)), tafel.append(felder[n]);

    let lo, hi, versuche, ziel;
    const setzeStriche = () => { let s = ''; for (let i = 1; i <= versuche; i++) s += i % 5 === 0 ? '<s>||||</s> ' : ''; s += '|'.repeat(versuche % 5); striche.innerHTML = versuche ? 'Versuche: ' + s : ''; };
    const zeigeBereich = () => { bereichEl.innerHTML = `Die Zahl liegt zwischen <span class="blau">${lo}</span> und <span class="blau">${hi}</span>.`; };
    function aufbau() {
      for (let n = 1; n <= 100; n++) { felder[n].className = n > bis ? 'zu' : ''; felder[n].onclick = null; }
      lo = 1; hi = bis; versuche = 0; setzeStriche(); zeigeBereich();
    }
    const meldung = (t, wer) => { if (mode === 'robo') rz.sag(t); else dran.set(wer, t); };

    async function geheimEingeben(denker) {
      // Das denkende Kind gibt seine Zahl verdeckt ein.
      tafel.classList.add('versteckt'); info.classList.add('versteckt');
      const box = h('div', { class: 'geheim' });
      const name = denker === 'du' ? 'Du' : LL.SPIELER[denker].name;
      box.append(h('p', { html: mode === 'robo' ? 'Robo schaut weg. <b>Du denkst dir eine Zahl bis ' + bis + '.</b> Du tippst sie ein.' :
        `<b>${LL.SPIELER[denker].zeichen} ${name}</b> denkt sich eine Zahl bis ${bis}. Das andere Kind schaut weg.` }));
      const f = h('span', { class: 'feld' }); box.append(f);
      unten.append(box);
      if (mode === 'robo') rz.sag('Ich halte mir die Augen zu. Du denkst dir eine Zahl.');
      await new Promise(res => {
        const tk = LL.tastatur(k => {
          if (k === 'weg') f.textContent = f.textContent.slice(0, -1);
          else if (k === 'ok') { const z = +f.textContent; if (z >= 1 && z <= bis) { tk.remove(); res(); } else { f.classList.add('falsch'); setTimeout(() => f.classList.remove('falsch'), 400); } }
          else if (f.textContent.length < 3) f.textContent += k;
        });
        box.append(tk);
      });
      ziel = +f.textContent;
      box.remove(); tafel.classList.remove('versteckt'); info.classList.remove('versteckt');
    }

    /* Das Kind rät, Robo oder Kind antwortet */
    async function kindRaet(rater, denker) {
      dran.set(rater);
      if (denker === 'robo') { ziel = 1 + rnd(bis); rz.sag(`Ich habe mir eine Zahl bis ${bis} gedacht. Rate! Tippe eine Zahl an.`); }
      else meldung('rät. Tippe eine Zahl an.', rater);
      let erster = true;
      for (;;) {
        if (!erster) meldung(mode === 'robo' ? 'Rate weiter. Tippe eine Zahl an.' : 'rät weiter. Tippe eine Zahl an.', rater);
        erster = false;
        const tipp = await new Promise(res => { for (let n = lo; n <= hi; n++) felder[n].onclick = () => res(n); });
        for (let n = 1; n <= 100; n++) felder[n].onclick = null;
        versuche++; setzeStriche();
        felder[tipp].classList.add('tipp');
        const wer = mode === 'zwei' ? LL.SPIELER[rater].name : null;
        await LL.sprichSo(`Ist es ${tipp}?`, wer);
        if (tipp === ziel) { felder[tipp].className = 'ziel'; return; }
        const groesser = ziel > tipp;
        let antwort;
        if (denker === 'robo') { antwort = groesser; rz.sag(groesser ? `Meine Zahl ist größer als ${tipp}.` : `Meine Zahl ist kleiner als ${tipp}.`); }
        else antwort = await denkerAntwortet(denker, tipp);
        await abdecken(tipp, antwort);
        felder[tipp].classList.remove('tipp');
      }
    }
    async function denkerAntwortet(denker, tipp) {
      // Kind 2 (zu zweit) antwortet – die App prüft die Antwort.
      let fehler = 0;
      for (;;) {
        const a = await LL.frage(`<b>${LL.SPIELER[denker].zeichen} ${LL.SPIELER[denker].name}</b>, deine Zahl ist geheim. Was sagst du?`,
          [{ text: 'Meine Zahl ist größer.', wert: true }, { text: 'Meine Zahl ist kleiner.', wert: false }]);
        if (a === ziel > tipp) return a;
        fehler++;
        await LL.hinweis(fehler === 1 ? `Schau nochmal genau. Ist deine Zahl größer oder kleiner als ${tipp}?` : `Deine Zahl ist ${ziel}. ${ziel} ist ${ziel > tipp ? 'größer' : 'kleiner'} als ${tipp}.`);
      }
    }
    /* Kind deckt ab, was nicht mehr geht */
    async function abdecken(tipp, groesser) {
      const neuLo = groesser ? tipp + 1 : lo, neuHi = groesser ? hi : tipp - 1;
      meldung(`Die Zahl ist ${groesser ? 'größer' : 'kleiner'} als ${tipp}. Welche Zahlen gehen nicht mehr? <b>Tippe sie an.</b>`, mode === 'zwei' ? dran.wer : null);
      let fehler = 0;
      for (;;) {
        const t = await new Promise(res => { for (let n = lo; n <= hi; n++) felder[n].onclick = () => res(n); });
        for (let n = 1; n <= 100; n++) felder[n].onclick = null;
        const kannWeg = t < neuLo || t > neuHi;
        if (kannWeg) break;
        fehler++;
        if (fehler === 1) await LL.hinweis(`Die Zahl ist <b>${groesser ? 'größer' : 'kleiner'}</b> als ${tipp}. Kann es ${t} sein? Tippe eine Zahl an, die nicht mehr geht.`);
        else {
          for (let n = lo; n <= hi; n++) if (n < neuLo || n > neuHi) felder[n].classList.add('zone');
          await LL.hinweis(`Die gelb umrandeten Zahlen gehen nicht mehr. Sie sind ${groesser ? 'kleiner' : 'größer'} als ${groesser ? neuLo : neuHi}${groesser ? '' : ''}. Tippe eine davon an.`);
        }
      }
      for (let n = lo; n <= hi; n++) if (n < neuLo || n > neuHi) { felder[n].className = 'zu'; await wait(8); }
      lo = neuLo; hi = neuHi; zeigeBereich();
      await LL.sprichSo(lo === hi ? `Die Zahl muss ${lo} sein.` : `Die Zahl liegt zwischen ${lo} und ${hi}.`, mode === 'zwei' ? LL.SPIELER[dran.wer || 'k1'].name : null);
    }

    /* Robo rät, Kind antwortet */
    async function roboRaet() {
      dran.set('robo', 'rät.');
      rz.sag('Jetzt rate ich. Du sagst mir: größer oder kleiner?');
      await wait(1000);
      let irrtuemer = 0;
      for (;;) {
        let tipp = Math.round((lo + hi) / 2);
        let schummel = false;
        if (versuche > 0 && irrtuemer < 2 && Math.random() < 0.3) {   // Robo irrt sich: rät eine Zahl, die schon abgedeckt ist
          const raus = []; for (let n = 1; n <= bis; n++) if (n < lo || n > hi) raus.push(n);
          if (raus.length) { tipp = raus[rnd(raus.length)]; schummel = true; irrtuemer++; }
        }
        versuche++; setzeStriche();
        felder[tipp].classList.add('tipp');
        rz.sag(`Ist es ${tipp}?`);
        if (schummel) {
          let fehler = 0;
          for (;;) {
            const a = await LL.frage(`Robo fragt: Ist es ${tipp}?`, [{ text: 'Die Zahl geht nicht mehr!', cls: 'nein', wert: 'raus' }, { text: 'größer', wert: 'g' }, { text: 'kleiner', wert: 'k' }]);
            if (a === 'raus') break;
            fehler++;
            await LL.hinweis(fehler === 1 ? `Schau auf die Tafel. Ist ${tipp} noch weiß?` : `${tipp} ist grau. Die Zahl geht nicht mehr. Du sagst Robo: Die Zahl geht nicht mehr!`);
          }
          rz.sag(`Oh, stimmt! ${tipp} ist schon abgedeckt. Danke!`);
          felder[tipp].classList.remove('tipp'); felder[tipp].className = 'zu';
          await wait(1200);
          continue;
        }
        if (tipp === ziel) {
          const ok = await LL.frage(`Robo fragt: Ist es ${tipp}?`, [{ text: 'Ja, richtig!', cls: 'ok', wert: true }, { text: 'größer', wert: 'g' }, { text: 'kleiner', wert: 'k' }]);
          if (ok !== true) { await LL.hinweis(`Deine Zahl war ${ziel}. Robo hat ${tipp} gesagt. Das ist richtig!`); }
          felder[tipp].className = 'ziel'; return;
        }
        let fehler = 0, a;
        for (;;) {
          a = await LL.frage(`Robo fragt: Ist es ${tipp}?`, [{ text: 'Ja, richtig!', cls: 'ok', wert: true }, { text: 'Meine Zahl ist größer.', wert: 'g' }, { text: 'Meine Zahl ist kleiner.', wert: 'k' }]);
          if (a === (ziel > tipp ? 'g' : 'k')) break;
          fehler++;
          await LL.hinweis(fehler === 1 ? `Denk an deine Zahl. Ist sie größer oder kleiner als ${tipp}?` : `Deine Zahl ist ${ziel}. ${ziel} ist ${ziel > tipp ? 'größer' : 'kleiner'} als ${tipp}.`);
        }
        await LL.sprichSo(ziel > tipp ? `Meine Zahl ist größer als ${tipp}.` : `Meine Zahl ist kleiner als ${tipp}.`);
        rz.sag('Dann decke ich ab, was nicht mehr geht.');
        const neuLo = ziel > tipp ? tipp + 1 : lo, neuHi = ziel > tipp ? hi : tipp - 1;
        for (let n = lo; n <= hi; n++) if (n < neuLo || n > neuHi) { felder[n].className = 'zu'; await wait(8); }
        felder[tipp].classList.remove('tipp');
        lo = neuLo; hi = neuHi; zeigeBereich();
        await wait(900);
      }
    }

    async function ablauf() {
      // Leichter: nur bis 50
      bis = await LL.frage('Mit welchen Zahlen spielt ihr?', [{ text: 'bis 50 (leichter)', cls: 'hell', wert: 50 }, { text: 'bis 100', wert: 100 }]);
      for (const r of runden) {
        aufbau();
        if (r.denker !== 'robo') await geheimEingeben(r.denker);
        if (r.rater === 'robo') await roboRaet();
        else { dran.wer = r.rater; await kindRaet(r.rater, r.denker); }
        const text = r.rater === 'robo' ? `Ich habe deine Zahl gefunden! Es war ${ziel}.` : `Richtig! Die Zahl ist ${ziel}.`;
        meldung(text, r.rater);
        await LL.frage(`${text}<br>${versuche} Versuche.` + (r === runden[0] ? (mode === 'robo' ? '<br>Jetzt tauschen wir die Rollen.' : '<br>Jetzt tauscht ihr die Rollen.') : ''), [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Das hat Spaß gemacht! Wir haben beide Zahlen gefunden.' : 'Super! Ihr habt beide Zahlen gefunden.');
    }
    ablauf();
  }

  LL.init({
    code: '4.4', title: 'Errate die Zahl', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 4 · Spiel', farbe: '#EE7F4B',
    intro: ['Robo denkt sich heimlich eine Zahl.', 'Du rätst. Du tippst eine Zahl an der Hundertertafel an.',
      'Robo sagt nur: „Meine Zahl ist größer.“ oder „Meine Zahl ist kleiner.“', 'Du deckst ab, was nicht mehr geht.', 'Dann tauscht ihr: Du denkst dir eine Zahl, Robo rät.'],
    start,
  });
})();
