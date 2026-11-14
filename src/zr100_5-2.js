/* ZR 100 · Karte 5.2 · Zehner-Freunde (Memory) */
(() => {
  const { h, rnd, shuffle, wait } = LL;
  const PAARE = 6;

  const css = `
  .spielfeld{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;max-width:760px;margin:0 auto}
  .mk{aspect-ratio:4/3;border-radius:16px;border:3px solid #333;font-size:46px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .25s}
  .mk.zu.b{background:repeating-linear-gradient(45deg,#DCE7FF 0 10px,#C5D6FF 10px 20px);border-color:#1E5BD8}
  .mk.zu.r{background:repeating-linear-gradient(45deg,#FFE0E0 0 10px,#FFC9C9 10px 20px);border-color:#E02020}
  .mk.auf{background:#fff}
  .mk.auf.b{color:#1E5BD8;border-color:#1E5BD8} .mk.auf.r{color:#E02020;border-color:#E02020}
  .mk.weg{visibility:hidden}
  .mk.robo-wahl{box-shadow:0 0 0 6px #9FD3F0}
  .leiste{display:flex;align-items:center;gap:14px;flex-wrap:wrap;justify-content:space-between;margin-bottom:10px}
  .paare{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
  .paar{background:#fff;border:2px solid #2E7D32;border-radius:10px;padding:2px 10px;font-weight:700}
  .zf{display:grid;grid-template-columns:repeat(5,44px);gap:6px;padding:10px;border:3px solid #333;border-radius:10px;background:#fff;width:max-content;margin:10px auto}
  .zf div{width:44px;height:44px;border:2px dashed #aaa;border-radius:50%}
  .zf .b{background:#1E5BD8;border:none} .zf .r{background:#E02020;border:none}
  `;
  document.head.append(h('style', {}, css));

  function neuesSpiel() {
    const einer = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, PAARE);
    const karten = [];
    einer.forEach(e => {
      const z = 1 + rnd(8);
      karten.push({ wert: z * 10 + e, farbe: 'b', e });
      karten.push({ wert: 10 - e, farbe: 'r', e: 10 - e });
    });
    return shuffle(karten).map((k, i) => ({ ...k, id: i, offen: false, weg: false, gesehen: false }));
  }
  const passt = (a, b) => a.farbe !== b.farbe && a.e + b.e === 10;
  const blauRot = (a, b) => a.farbe === 'b' ? [a, b] : [b, a];
  const zehnerZiel = blau => Math.ceil(blau.wert / 10) * 10;

  function schablone(blau, rot) {
    const zellen = [];
    for (let i = 0; i < 10; i++) zellen.push(h('div', { class: i < blau.e ? 'b' : i < blau.e + Math.min(rot.wert, 10 - blau.e) ? 'r' : '' }));
    const ueber = blau.e + rot.wert - 10;
    const extra = ueber > 0 ? h('div', { style: 'display:flex;gap:6px;justify-content:center;align-items:center;margin-top:4px' },
      h('span', { style: 'font-size:18px;margin-right:6px' }, 'passt nicht mehr hinein:'),
      Array.from({ length: ueber }, () => h('div', { style: 'width:36px;height:36px;border-radius:50%;background:#E02020' }))) : null;
    return h('div', {},
      h('div', { class: 'zf' }, zellen), extra,
      h('p', { style: 'text-align:center', html: `<span class="blau">${blau.wert}</span> hat <b class="blau">${blau.e}</b> Einer. Dazu kommen <b class="rot">${rot.wert}</b>.` +
        (ueber > 0 ? `<br>Das ist ${ueber} zu viel.` : ueber < 0 ? `<br>Es fehlt noch ${-ueber}.` : '<br>Der Zehner ist voll!') }));
  }
  const satzJa = (b, r) => [`<span class="blau">${b.wert}</span> und <span class="rot">${r.wert}</span> sind Zehner-Freunde.`, `Zusammen sind sie ${zehnerZiel(b)}.`];
  const satzNein = (b, r) => { const d = b.e + r.wert - 10;
    return [`<span class="blau">${b.wert}</span> und <span class="rot">${r.wert}</span> sind keine Zehner-Freunde.`, d < 0 ? `Es fehlt noch ${-d}.` : `Das ist ${d} zu viel.`]; };

  function start(mode, main) {
    const karten = neuesSpiel();
    let gefunden = 0, amZug = mode === 'robo' ? 'du' : 'k1', sperre = false, wahl = [];

    const rz = LL.roboZeile(main);
    const leiste = h('div', { class: 'leiste' });
    const dran = LL.dranAnzeige(leiste);
    const paare = h('div', { class: 'paare' }, h('b', {}, 'Unsere Paare: '));
    const schabBtn = h('button', { class: 'btn hell', onclick: zeigeSchablone }, 'Schablone');
    leiste.append(paare, schabBtn);
    main.append(leiste);
    const feld = h('div', { class: 'spielfeld' }); main.append(feld);
    const knoepfe = h('div', { class: 'knopfreihe versteckt' }); main.append(knoepfe);
    if (mode === 'zwei') rz.zeige(false);

    const els = karten.map(k => {
      const b = h('button', { class: `mk zu ${k.farbe}`, 'aria-label': k.farbe === 'b' ? 'blaue Karte' : 'rote Karte' });
      b.onclick = () => tippe(k);
      feld.append(b); k.el = b; return b;
    });
    const zeichne = k => { k.el.className = `mk ${k.farbe} ${k.weg ? 'weg' : k.offen ? 'auf' : 'zu'}`; k.el.textContent = k.offen && !k.weg ? k.wert : ''; };
    const meldung = t => { if (mode === 'robo') rz.sag(t); else dran.set(amZug, t); };

    function zug() {
      wahl = []; sperre = false; knoepfe.classList.add('versteckt');
      if (gefunden === PAARE) return fertig();
      if (amZug === 'robo') { dran.set('robo'); return roboZug(); }
      dran.set(amZug);
      meldung(mode === 'robo' ? 'Du bist dran. Du deckst eine <span class="blau">blaue</span> und eine <span class="rot">rote</span> Karte auf.' : 'ist dran. Deck eine blaue und eine rote Karte auf.');
    }
    function naechster() { amZug = mode === 'robo' ? (amZug === 'du' ? 'robo' : 'du') : (amZug === 'k1' ? 'k2' : 'k1'); zug(); }

    function tippe(k) {
      if (sperre || amZug === 'robo' || k.offen || k.weg) return;
      if (wahl.length === 1 && wahl[0].farbe === k.farbe) {
        meldung(k.farbe === 'b' ? 'Nimm jetzt eine <span class="rot">rote</span> Karte.' : 'Nimm jetzt eine <span class="blau">blaue</span> Karte.'); return;
      }
      k.offen = true; k.gesehen = true; zeichne(k); wahl.push(k);
      if (wahl.length === 2) entscheiden();
    }

    async function entscheiden() {
      sperre = true;
      const [b, r] = blauRot(...wahl);
      const richtig = passt(b, r);
      let fehler = 0;
      for (;;) {
        const ja = await LL.frage(`Machen <span class="blau">${b.wert}</span> und <span class="rot">${r.wert}</span> den Zehner voll?`,
          [{ text: 'Ja, Zehner-Freunde', cls: 'ok', wert: true }, { text: 'Nein', cls: 'nein', wert: false }]);
        if (ja === richtig) break;
        fehler++;
        if (fehler === 1) await LL.hinweis(`Schau auf die Einer. <span class="blau">${b.wert}</span> hat <b>${b.e}</b> Einer. Wie viele fehlen bis 10?`);
        else await LL.hinweis('Die Schablone hilft dir.', schablone(b, r));
      }
      const wer = mode === 'zwei' ? LL.SPIELER[amZug].name : null;
      await LL.sprichSo(richtig ? satzJa(b, r) : satzNein(b, r), wer);
      await paarAbschluss(b, r, richtig);
    }

    async function paarAbschluss(b, r, richtig) {
      if (richtig) {
        await wait(300);
        b.weg = r.weg = true; zeichne(b); zeichne(r); gefunden++;
        paare.append(h('span', { class: 'paar', html: `<span class="blau">${b.wert}</span> | <span class="rot">${r.wert}</span>` }));
      } else {
        await wait(500);
        b.offen = r.offen = false; zeichne(b); zeichne(r);
      }
      naechster();
    }

    function zeigeSchablone() {
      const offen = karten.filter(k => k.offen && !k.weg);
      if (offen.length === 2) { const [b, r] = blauRot(...offen); LL.hinweis('So sieht es mit der Schablone aus.', schablone(b, r), 'Schließen'); }
      else LL.hinweis('Deck zuerst eine blaue und eine rote Karte auf. Dann zeigt dir die Schablone, ob der Zehner voll ist.', null, 'Schließen');
    }

    async function roboZug() {
      sperre = true;
      rz.sag('Jetzt bin ich dran. Ich decke zwei Karten auf.');
      await wait(1200);
      const da = karten.filter(k => !k.weg);
      const bl = da.filter(k => k.farbe === 'b'), ro = da.filter(k => k.farbe === 'r');
      let b, r;
      const bekanntesPaar = bl.filter(x => x.gesehen).map(x => [x, ro.find(y => y.gesehen && passt(x, y))]).find(p => p[1]);
      if (bekanntesPaar && Math.random() < 0.7) [b, r] = bekanntesPaar;
      else { b = bl[rnd(bl.length)]; r = ro[rnd(ro.length)]; }
      for (const k of [b, r]) { k.offen = k.gesehen = true; zeichne(k); k.el.classList.add('robo-wahl'); await wait(700); }
      const richtig = passt(b, r);
      const schummelt = !richtig && Math.random() < 0.45;   // Robo irrt sich manchmal
      const behauptung = richtig || schummelt;
      rz.sag(behauptung ? `<span class="blau">${b.wert}</span> und <span class="rot">${r.wert}</span> sind Zehner-Freunde!` : `<span class="blau">${b.wert}</span> und <span class="rot">${r.wert}</span> sind keine Zehner-Freunde.`);
      await wait(600);
      let fehler = 0;
      for (;;) {
        const stimmt = await LL.frage(`Robo sagt: ${behauptung ? `<span class="blau">${b.wert}</span> und <span class="rot">${r.wert}</span> sind Zehner-Freunde.` : `<span class="blau">${b.wert}</span> und <span class="rot">${r.wert}</span> sind keine Zehner-Freunde.`}<br><b>Stimmt das?</b>`,
          [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
        if (stimmt === (behauptung === richtig)) break;
        fehler++;
        if (fehler === 1) await LL.hinweis(`Prüfe genau. <span class="blau">${b.wert}</span> hat <b>${b.e}</b> Einer. Dazu kommen <span class="rot">${r.wert}</span>. Ist der Zehner voll?`);
        else await LL.hinweis('Die Schablone hilft dir.', schablone(b, r));
      }
      b.el.classList.remove('robo-wahl'); r.el.classList.remove('robo-wahl');
      if (schummelt) { rz.sag('Oh, danke! Du hast meinen Fehler gefunden.'); await LL.sprichSo(satzNein(b, r)); }
      else { rz.sag(richtig ? 'Danke fürs Prüfen!' : 'Danke fürs Prüfen! Ich decke die Karten wieder zu.'); await LL.sprichSo(richtig ? satzJa(b, r) : satzNein(b, r)); }
      await paarAbschluss(b, r, richtig);
    }

    async function fertig() {
      await wait(500);
      LL.ende(mode === 'robo' ? `Super! Wir haben alle ${PAARE} Paare zusammen gefunden.` : `Super! Ihr habt alle ${PAARE} Paare gefunden.`);
    }
    zug();
  }

  LL.init({
    code: '5.2', title: 'Zehner-Freunde', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 5 · Spiel', farbe: '#E2557F',
    intro: ['Du deckst eine <span class="blau">blaue</span> und eine <span class="rot">rote</span> Karte auf.',
      'Machen die Zahlen den Zehner voll? Dann sind sie Zehner-Freunde.', 'Die Schablone hilft beim Prüfen.', 'Robo spielt mit. Manchmal irrt sich Robo. Du prüfst genau.'],
    start,
  });
})();
