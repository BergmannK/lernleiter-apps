/* ZR 1000 Teil B · Karte 3.2 · Mit Stopp rechnen (Rechenstrich mit Hunderterstopp) */
(() => {
  const { h, rnd, wait, shuffle } = LL;
  const css = `
  .aufgabe{font-size:54px;font-weight:700;text-align:center;margin:6px 0 12px}
  .zeile{font-size:30px;text-align:center;margin:14px 0;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap}
  .strich{width:100%;max-width:980px;display:block;margin:6px auto;touch-action:manipulation}
  .strich .hit{fill:transparent;cursor:pointer}
  .strich .mark{fill:#FFD54A;opacity:.8}
  .karte-r{background:#F3FAFF;border:3px solid #9FD3F0;border-radius:18px;padding:10px 16px;margin:10px 0}
  .schritt{opacity:.35} .schritt.jetzt{opacity:1} .schritt.fertig{opacity:1}
  `;
  document.head.append(h('style', {}, css));
  const B = n => `<span class="blau">${n}</span>`, R = n => `<span class="rot">${n}</span>`;

  function aufgaben(plus, minus) {
    const L = [];
    while (L.filter(a => a.op === '+').length < plus) {
      const hu = 1 + rnd(8), z = 3 + rnd(7), z2 = 11 - z + rnd(z - 1); // Übergang erzwingen
      const a = hu * 100 + z * 10, b = Math.min(z2, 9) * 10;
      if ((a % 100) / 10 + b / 10 > 10 && a + b < 1000 && !L.some(x => x.a === a)) L.push({ a, b, op: '+' });
    }
    while (L.filter(a => a.op === '–').length < minus) {
      const hu = 2 + rnd(8), z = 1 + rnd(6), z2 = z + 1 + rnd(9 - z);
      const a = hu * 100 + z * 10, b = z2 * 10;
      if (b > (a % 100) && a < 1000 && !L.some(x => x.a === a)) L.push({ a, b, op: '–' });
    }
    return L;
  }
  const loesung = t => {
    const plus = t.op === '+';
    const stopp = plus ? Math.ceil(t.a / 100) * 100 : Math.floor(t.a / 100) * 100;
    const t1 = Math.abs(stopp - t.a), t2 = t.b - t1, erg = plus ? t.a + t.b : t.a - t.b;
    return { stopp, t1, t2, erg, plus };
  };

  /* Rechenstrich zeichnen */
  function rechenstrich(t, L, extra = []) {
    const lo = Math.min(t.a, L.erg, ...extra) - 20, hi = Math.max(t.a, L.erg, ...extra) + 20;
    const W = 980, H = 190, x0 = 40, x1 = W - 40, y = 130;
    const X = n => x0 + (n - lo) / (hi - lo) * (x1 - x0);
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'strich');
    const el = (tag, at, txt) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (txt != null) e.textContent = txt; svg.append(e); return e; };
    el('line', { x1: x0 - 20, y1: y, x2: x1 + 20, y2: y, stroke: '#222', 'stroke-width': 4 });
    const hits = {}, marks = {};
    for (let n = lo; n <= hi; n += 10) {
      const lang = n % 100 === 0 ? 22 : n % 50 === 0 ? 16 : 10;
      marks[n] = el('rect', { x: X(n) - 16, y: y - 26, width: 32, height: 52, rx: 6, class: 'mark', visibility: 'hidden' });
      el('line', { x1: X(n), y1: y - lang, x2: X(n), y2: y + lang, stroke: '#222', 'stroke-width': n % 100 === 0 ? 4 : 2.5 });
      if (n % 100 === 0) el('text', { x: X(n), y: y + 50, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: '#222' }, n);
      hits[n] = el('rect', { x: X(n) - (X(10 + lo) - X(lo)) / 2, y: 0, width: X(10 + lo) - X(lo), height: H, class: 'hit' });
    }
    el('text', { x: X(t.a), y: y + 50, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: '#1E5BD8' }, t.a);
    const sprung = (von, nach, lab, farbe = '#E02020') => {
      const xa = X(von), xb = X(nach), mx = (xa + xb) / 2, hoehe = Math.min(90, 30 + Math.abs(xb - xa) / 3);
      el('path', { d: `M${xa} ${y - 4} Q${mx} ${y - hoehe} ${xb} ${y - 4}`, fill: 'none', stroke: farbe, 'stroke-width': 4 });
      el('path', { d: `M${xb} ${y - 4} l${xb > xa ? -14 : 14} -6 l${xb > xa ? 2 : -2} 12 z`, fill: farbe });
      el('text', { x: mx, y: y - hoehe / 2 - 18, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: farbe }, lab);
    };
    const schreibe = (n, farbe) => { if (n % 100 !== 0) el('text', { x: X(n), y: y + 50, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: farbe }, n); };
    return {
      svg, sprung, schreibe,
      markiere(n, an = true) { if (marks[n]) marks[n].setAttribute('visibility', an ? 'visible' : 'hidden'); },
      warte() { return new Promise(res => { for (const n in hits) hits[n].onclick = () => { for (const m in hits) hits[m].onclick = null; res(+n); }; }); },
    };
  }

  /* Das Kind rechnet eine Aufgabe Schritt für Schritt */
  async function kindRechnet(t, box, wer) {
    const L = loesung(t), op = L.plus ? '+' : '–';
    box.innerHTML = '';
    box.append(h('div', { class: 'aufgabe', html: `${B(t.a)} ${op} ${R(t.b)}` }));
    await LL.sprichSo(`Ich rechne ${B(t.a)} ${op} ${R(t.b)}.`, wer);

    // Schritt 1: bis zum Hunderter
    const f1 = h('span', { class: 'feld' }), f2 = h('span', { class: 'feld' });
    box.append(h('div', { class: 'zeile' }, L.plus ? 'Bis' : 'Zurück bis', f1, L.plus ? 'fehlen' : 'sind es', f2));
    await LL.eingabe(box, [{ el: f1, soll: L.stopp }, { el: f2, soll: L.t1 }], {
      beiFehler: async (i, n) => {
        if (i === 0) await LL.hinweis(n === 1 ? `Welcher Hunderter kommt ${L.plus ? 'nach' : 'vor'} ${B(t.a)}?` : `${L.plus ? 'Nach' : 'Vor'} ${B(t.a)} kommt der Hunderter ${L.stopp}.`);
        else await LL.hinweis(n === 1 ? `Wie viele Zehner sind es von ${t.a} bis ${L.stopp}?` : `Zähle in Zehnerschritten: ${zehner(t.a, L.stopp).join(', ')}.`);
      } });
    await LL.sprichSo(L.plus ? `Bis ${L.stopp} fehlen ${L.t1}.` : `Zurück bis ${L.stopp} sind es ${L.t1}.`, wer);

    // Schritt 2: zerlegen
    const g1 = h('span', { class: 'feld' }), g2 = h('span', { class: 'feld' });
    box.append(h('div', { class: 'zeile' }, h('span', { html: `Ich zerlege ${R(t.b)} in` }), g1, 'und', g2));
    await LL.eingabe(box, [{ el: g1, soll: L.t1 }, { el: g2, soll: L.t2 }], {
      beiFehler: async (i, n) => {
        if (i === 0) await LL.hinweis(`Zuerst kommt der Teil bis zum Hunderter. Das sind ${L.t1}.`);
        else await LL.hinweis(n === 1 ? `${R(t.b)} sind ${t.b / 10} Zehner. ${L.t1 / 10} Zehner hast du schon. Wie viele Zehner bleiben?` : `${L.t1} und ${L.t2} sind zusammen ${t.b}.`);
      } });
    await LL.sprichSo(`Ich zerlege ${R(t.b)} in ${L.t1} und ${L.t2}.`, wer);

    // Schritt 3: am Rechenstrich springen
    const rs = rechenstrich(t, L);
    const anw = h('div', { class: 'zeile', html: `<span>Du springst zuerst bis zum Hunderter. <b>Tippe auf den Stopp.</b></span>` });
    box.append(anw, rs.svg);
    rs.svg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await springe(rs, t.a, L.stopp, (L.plus ? '+' : '–') + L.t1, async n => {
      await LL.hinweis(n === 1 ? `Spring zuerst bis zum Hunderter. Wo ist ${L.stopp}?` : `Der Stopp ist bei ${L.stopp}. Er ist gelb markiert.`);
      if (n > 1) rs.markiere(L.stopp);
    });
    rs.markiere(L.stopp, false);
    anw.innerHTML = `<span>Jetzt springst du den Rest: ${R((L.plus ? '+ ' : '– ') + L.t2)}. <b>Tippe, wo du landest.</b></span>`;
    await springe(rs, L.stopp, L.erg, (L.plus ? '+' : '–') + L.t2, async n => {
      await LL.hinweis(n === 1 ? `Von ${L.stopp} springst du noch ${L.t2} ${L.plus ? 'weiter' : 'zurück'}. Jeder Strich sind 10.` : `Zähle: ${zehner(L.stopp, L.erg).join(', ')}. Die Stelle ist gelb markiert.`);
      if (n > 1) rs.markiere(L.erg);
    });
    rs.markiere(L.erg, false); rs.schreibe(L.erg, '#2E7D32');
    anw.innerHTML = 'Super gesprungen!';

    // Schritt 4: Ergebnis
    const e = h('span', { class: 'feld' });
    box.append(h('div', { class: 'zeile' }, h('span', { html: `${B(t.a)} ${op} ${R(t.b)} =` }), e));
    e.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await LL.eingabe(box, [{ el: e, soll: L.erg }], { beiFehler: async n => LL.hinweis('Schau auf den Rechenstrich. Wo bist du gelandet?') });
    await LL.sprichSo(`Das Ergebnis ist ${L.erg}.`, wer);
    return L;
  }
  async function springe(rs, von, nach, lab, hilfe) {
    let fehler = 0;
    for (;;) {
      const n = await rs.warte();
      if (n === nach) { rs.sprung(von, nach, lab); return; }
      fehler++; await hilfe(fehler);
    }
  }
  const zehner = (a, b) => { const L = []; const s = b > a ? 10 : -10; for (let n = a; n !== b + s; n += s) L.push(n); return L; };

  /* Robo rechnet, das Kind prüft */
  async function roboRechnet(t, box, rz) {
    const L = loesung(t), op = L.plus ? '+' : '–';
    box.innerHTML = '';
    box.append(h('div', { class: 'aufgabe', html: `${B(t.a)} ${op} ${R(t.b)}` }));
    // Robo macht manchmal einen Fehler
    // Robo macht manchmal einen Fehler beim Zerlegen (10 zu viel oder zu wenig)
    let d = 0;
    if (Math.random() < 0.5) d = (L.t2 > 10 && Math.random() < 0.5) ? -10 : 10;
    const roboT2 = L.t2 + d, roboErg = L.plus ? L.erg + d : L.erg - d;
    rz.sag(`Ich rechne ${B(t.a)} ${op} ${R(t.b)}. ${L.plus ? 'Bis' : 'Zurück bis'} ${L.stopp} sind es ${L.t1}. Dann noch ${roboT2}. Das Ergebnis ist ${roboErg}.`);
    const rs = rechenstrich(t, L, [roboErg]);
    box.append(h('div', { class: 'karte-r', html: `<b>Robos Rechnung:</b><br>${B(t.a)} ${op} ${L.t1} = ${L.stopp}<br>${L.stopp} ${op} ${roboT2} = ${roboErg}` }), rs.svg);
    rs.sprung(t.a, L.stopp, op + L.t1);
    await wait(500);
    rs.sprung(L.stopp, roboErg, op + roboT2, '#7a7a7a'); rs.schreibe(roboErg, '#555');
    box.append(h('div', { class: 'zeile', html: `<span>Robo sagt: ${B(t.a)} ${op} ${R(t.b)} = <b>${roboErg}</b></span>` }));
    let fehler = 0;
    for (;;) {
      const ok = await LL.frage(`Robo sagt: ${B(t.a)} ${op} ${R(t.b)} = ${roboErg}. <b>Stimmt das?</b>`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]);
      if (ok === (roboErg === L.erg)) break;
      fehler++;
      await LL.hinweis(fehler === 1 ? `Prüfe Schritt für Schritt: ${R(t.b)} zerlegt in ${L.t1} und ... ?` : `${R(t.b)} = ${L.t1} + ${L.t2}. ${L.stopp} ${op} ${L.t2} = ${L.erg}.`);
    }
    if (roboErg === L.erg) { rz.sag('Danke fürs Prüfen!'); await LL.sprichSo(`Ich prüfe. Robo hat richtig gerechnet. Das Ergebnis ist ${L.erg}.`); return; }
    rz.sag('Oh! Wo ist mein Fehler? Sag mir das richtige Ergebnis.');
    const e = h('span', { class: 'feld' });
    box.append(h('div', { class: 'zeile' }, h('span', { html: `Richtig ist: ${B(t.a)} ${op} ${R(t.b)} =` }), e));
    e.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await LL.eingabe(box, [{ el: e, soll: L.erg }], { beiFehler: async () => LL.hinweis(`Rechne selbst: ${L.plus ? 'bis' : 'zurück bis'} ${L.stopp}, dann noch ${L.t2}.`) });
    await LL.sprichSo([`Robo hat einen Fehler gemacht.`, `${B(t.a)} ${op} ${R(t.b)} = ${L.erg}.`]);
    rz.sag('Danke! Jetzt verstehe ich es.');
  }

  /* Partnerkind prüft (zu zweit): rechnet nach */
  async function kindPrueft(t, L, box, pruefer) {
    const op = L.plus ? '+' : '–';
    const e = h('span', { class: 'feld' });
    box.append(h('div', { class: 'zeile', html: `<span><b>${LL.SPIELER[pruefer].zeichen} ${LL.SPIELER[pruefer].name} prüft.</b> Rechne im Kopf oder am Rechenstrich nach:</span>` }),
      h('div', { class: 'zeile' }, h('span', { html: `${B(t.a)} ${op} ${R(t.b)} =` }), e));
    e.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await LL.eingabe(box, [{ el: e, soll: L.erg }], { beiFehler: async () => LL.hinweis('Rechne mit Stopp am Hunderter. Schau auf den Rechenstrich.') });
    await LL.sprichSo(`Ich habe auch ${L.erg}. Es stimmt.`, LL.SPIELER[pruefer].name);
  }

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    const kopfzeile = h('div', { style: 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px' });
    const dran = LL.dranAnzeige(kopfzeile);
    const zaehler = h('b'); kopfzeile.append(zaehler); main.append(kopfzeile);
    const box = h('div'); main.append(box);
    if (mode === 'zwei') rz.zeige(false);

    // Zuerst nur plus, dann minus.
    const A = aufgaben(3, 3);
    const plus = A.filter(a => a.op === '+'), minus = A.filter(a => a.op === '–');
    const plan = mode === 'robo'
      ? [['du', plus[0]], ['robo', plus[1]], ['du', plus[2]], ['du', minus[0]], ['robo', minus[1]], ['du', minus[2]]]
      : [['k1', plus[0]], ['k2', plus[1]], ['k1', plus[2]], ['k2', minus[0]], ['k1', minus[1]], ['k2', minus[2]]];

    (async () => {
      for (let i = 0; i < plan.length; i++) {
        const [wer, t] = plan[i];
        zaehler.textContent = `Aufgabe ${i + 1} von ${plan.length}`;
        if (i === 3) await LL.frage('Jetzt kommen Minus-Aufgaben. Du rechnest <b>zurück</b> bis zum Hunderter.', [{ text: 'Los geht\'s', wert: 1 }]);
        if (wer === 'robo') { dran.set('robo', 'rechnet. Du prüfst.'); await roboRechnet(t, box, rz); }
        else {
          dran.set(wer, 'rechnet.');
          if (mode === 'robo') rz.sag('Du rechnest. Ich schaue zu und prüfe.');
          const L = await kindRechnet(t, box, mode === 'zwei' ? LL.SPIELER[wer].name : null);
          if (mode === 'robo') { rz.sag(`Ich prüfe: ${B(t.a)} ${L.plus ? '+' : '–'} ${R(t.b)} = ${L.erg}. Das stimmt!`); await wait(1500); }
          else { const p = wer === 'k1' ? 'k2' : 'k1'; dran.set(p, 'prüft.'); await kindPrueft(t, L, box, p); }
        }
        await LL.frage('Fertig! Weiter zur nächsten Aufgabe?', [{ text: 'Weiter', wert: 1 }]);
      }
      LL.ende(mode === 'robo' ? 'Toll! Wir haben 6 Aufgaben zusammen gerechnet und geprüft.' : 'Toll! Ihr habt 6 Aufgaben gerechnet und geprüft.');
    })();
  }

  LL.init({
    code: '3.2', title: 'Mit Stopp rechnen', lernleiter: 'Lernleiter Rechnen im Zahlenraum bis 1000 · Milestone 3 · Üben', farbe: '#2BA9C2',
    intro: ['Du bekommst eine Aufgabe, zum Beispiel <span class="blau">570</span> + <span class="rot">80</span>.', 'Du überlegst: Wie viele Zehner fehlen bis zum Hunderter?',
      'Du rechnest am Rechenstrich mit Stopp.', 'Robo prüft dein Ergebnis. Dann rechnet Robo und du prüfst.', 'Zuerst kommen Plus-Aufgaben, dann Minus-Aufgaben.'],
    start,
  });
})();
