/* ZR 1000 Teil B · Karte 3.4 · Rückwärts-Rennen -> kooperativ: gemeinsam von 1000 nach 0 */
(() => {
  const { h, rnd, wait } = LL;
  const WERT = { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50, 6: 100 };
  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 1000 130'); svg.style.cssText = 'width:100%;max-width:1000px;display:block;margin:6px auto'; main.append(svg);
    const feld = h('div'); main.append(feld);
    let START = 1000; const pos = {};
    const X = n => 40 + (START - n) / START * 920;
    function zeichne() {
      svg.innerHTML = '';
      const el = (t, a, tx) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (tx != null) e.textContent = tx; svg.append(e); };
      el('line', { x1: 40, y1: 80, x2: 960, y2: 80, stroke: '#222', 'stroke-width': 4 });
      for (let n = 0; n <= START; n += 100) { el('line', { x1: X(n), y1: 62, x2: X(n), y2: 98, stroke: '#222', 'stroke-width': 3 }); el('text', { x: X(n), y: 124, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700 }, n); }
      ids.forEach((id, i) => el('text', { x: X(pos[id]), y: 50 - i * 22, 'text-anchor': 'middle', 'font-size': 26 }, LL.SPIELER[id].zeichen));
    }
    async function kindZug(id) {
      feld.innerHTML = ''; dran.set(id);
      const w = h('button', { class: 'btn' }, 'Würfeln'); feld.append(h('div', { style: 'text-align:center' }, w)); await new Promise(r => w.onclick = r); w.parentElement.remove();
      const { n } = await LL.wuerfeln(feld); const z = WERT[n], p = pos[id];
      if (z > p) { await LL.hinweis(`Du stehst auf ${p}. ${z} zurück geht nicht. Du bleibst stehen.`, null, 'OK'); return; }
      await LL.zahlFrage(feld, `Ich stehe auf ${p}. Ich würfle eine ${n}: ${p} – ${z} =`, p - z, [Math.floor(p / 100) !== Math.floor((p - z - 1) / 100) && p % 100 !== 0 ? `Rechne zuerst zurück bis ${Math.floor(p / 100) * 100}.` : `Nimm ${z / 10} Zehner weg.`, `${p} – ${z} = ${p - z}.`]);
      const ueber = p % 100 !== 0 && p % 100 < z;
      await LL.sprichSo([`Ich stehe auf ${p}.`, `Ich würfle eine ${n}: ${p} – ${z} = ${p - z}.`].concat(ueber ? ['Ich gehe über den Hunderter.'] : []), mode === 'zwei' ? LL.SPIELER[id].name : null);
      pos[id] = p - z; zeichne();
    }
    async function roboZug() {
      feld.innerHTML = ''; dran.set('robo'); rz.sag('Ich würfle.');
      const { n } = await LL.wuerfeln(feld); const z = WERT[n], p = pos.robo;
      if (z > p) { rz.sag(`Ich stehe auf ${p}. ${z} zurück geht nicht. Ich bleibe stehen.`); await wait(1500); return; }
      const irrt = Math.random() < 0.35, rr = irrt ? p - z + 100 : p - z;
      rz.sag(`Ich stehe auf ${p}. Ich würfle eine ${n}. ${p} minus ${z} ist ${rr}.`);
      let f = 0;
      for (;;) { const x = await LL.frage(`Robo sagt: ${p} – ${z} = ${rr}. Stimmt das?`, [{ text: 'Stimmt', cls: 'ok', wert: true }, { text: 'Stimmt nicht', cls: 'nein', wert: false }]); if (x === !irrt) break; f++; await LL.hinweis(f === 1 ? `Rechne nach: ${p} – ${z}.` : `${p} – ${z} = ${p - z}.`); }
      if (irrt) rz.sag(`Oh, danke! Ich bin über den Hunderter gegangen. ${p} minus ${z} ist ${p - z}.`); else rz.sag('Danke fürs Prüfen!');
      pos.robo = p - z; zeichne(); await wait(1200);
    }
    (async () => {
      START = await LL.frage('Wo startet ihr?', [{ text: 'bei 500 (kürzer)', cls: 'hell', wert: 500 }, { text: 'bei 1000', wert: 1000 }]);
      ids.forEach(id => pos[id] = START); zeichne();
      if (mode === 'robo') rz.sag(`Wir starten beide bei ${START}. Wir laufen zusammen zurück bis 0.`);
      let i = 0, leer = 0;
      while (ids.some(id => pos[id] > 0)) {
        const id = ids[i++ % 2]; if (pos[id] === 0) continue;
        if (id === 'robo') await roboZug(); else await kindZug(id);
        if (++leer > 120) break;
      }
      LL.ende(mode === 'robo' ? 'Super! Wir sind beide bei 0 angekommen.' : 'Super! Ihr seid beide bei 0 angekommen.');
    })();
  }
  LL.init({ code: '3.4', title: 'Rückwärts-Rennen', lernleiter: B.LLname(3), farbe: '#2BA9C2',
    intro: ['Ihr startet beide bei 1000.', 'Du würfelst: 1 = 10, 2 = 20, 3 = 30, 4 = 40, 5 = 50, 6 = 100 zurück.', 'Du sagst die Aufgabe, zum Beispiel 1000 – 30 = 970. Dann ziehst du.', 'Ihr kommt gemeinsam genau bei 0 an.'], start });
})();
