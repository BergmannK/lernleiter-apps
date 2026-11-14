/* ZR 1000 Teil A · Karte 2.3 · Hohe Hausnummer -> kooperativ: Baue eine große Zahl */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `.mitte{text-align:center;margin:10px 0}
  .tafeln{display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:820px;margin:0 auto}
  .tf{background:#fff;border:3px solid #ccc;border-radius:16px;padding:10px;text-align:center}
  .slots{display:inline-grid;grid-template-columns:repeat(3,70px);border:2px solid #222;border-radius:8px;overflow:hidden}
  .slots div{background:#EDEDED;font-weight:700;border-right:1px solid #222}
  .slots button{height:70px;font-size:40px;font-weight:700;border:0;border-top:2px solid #222;border-right:1px solid #222;background:#fff}
  .slots button.frei{background:#FFF6D5}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const tafeln = h('div', { class: 'tafeln' }); main.append(tafeln);
    const unten = h('div'); main.append(unten);
    const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    const nm = id => id === 'du' ? 'Du' : LL.SPIELER[id].name;
    const STELLE = { 0: 'H', 1: 'Z', 2: 'E' };

    async function runde() {
      tafeln.innerHTML = ''; unten.innerHTML = '';
      const T = {};
      ids.forEach(id => {
        const slots = [0, 1, 2].map(() => h('button', { class: 'frei' }, ''));
        const box = h('div', { class: 'tf' }, h('div', { style: 'font-weight:700;margin-bottom:6px' }, `${LL.SPIELER[id].zeichen} ${LL.SPIELER[id].name}`),
          h('div', { class: 'slots' }, ['H', 'Z', 'E'].map(c => h('div', {}, c)), slots));
        tafeln.append(box); T[id] = { slots, werte: [null, null, null], wuerfe: [] };
      });
      for (let wurf = 0; wurf < 3; wurf++) {
        for (const id of ids) {
          dran.set(id, id === 'du' ? 'würfelst.' : 'würfelt.');
          const t = T[id];
          unten.innerHTML = '';
          if (id !== 'robo') { const w = h('button', { class: 'btn' }, 'Würfeln'); unten.append(h('div', { class: 'mitte' }, w)); await new Promise(r => w.onclick = r); unten.innerHTML = ''; }
          const { n } = await LL.wuerfeln(unten);
          t.wuerfe.push(n);
          let pos;
          if (id === 'robo') {
            const frei = [0, 1, 2].filter(i => t.werte[i] === null);
            pos = n >= 5 ? frei[0] : n <= 2 ? frei[frei.length - 1] : frei[Math.floor(frei.length / 2)];
            rz.sag(`Ich habe eine ${n}. Ich schreibe sie in das ${STELLE[pos]}-Feld.`);
            await wait(1300);
          } else {
            unten.append(h('p', { class: 'mitte', html: `Du hast eine <b>${n}</b>. Tippe ein freies Feld an: H, Z oder E.` }));
            pos = await new Promise(r => t.slots.forEach((b, i) => b.onclick = () => { if (t.werte[i] === null) { t.slots.forEach(x => x.onclick = null); r(i); } }));
            if (pos === 0 && n >= 4) await LL.sprichSo(`Ich schreibe die ${n} in das H-Feld, weil sie groß ist.`, mode === 'zwei' ? nm(id) : null);
          }
          t.werte[pos] = n; t.slots[pos].textContent = String(n); t.slots[pos].classList.remove('frei');
        }
      }
      unten.innerHTML = '';
      const zahl = id => T[id].werte[0] * 100 + T[id].werte[1] * 10 + T[id].werte[2];
      const [a, b] = ids.map(zahl);
      // Eigene Zahl lesen
      await LL.zahlFrage(unten, 'Meine Zahl heißt', a, ['Lies H, Z und E von links nach rechts.', `Deine Zahl ist ${a}.`], '.');
      await LL.sprichSo(`Meine Zahl heißt ${a}.`, mode === 'zwei' ? nm(ids[0]) : null);
      if (mode === 'robo') rz.sag(`Meine Zahl heißt ${b}.`);
      const soll = a > b ? '>' : a < b ? '<' : '=';
      let f = 0;
      for (;;) {
        const x = await LL.frage(`Vergleiche: ${a} ? ${b}`, [{ text: '<', wert: '<' }, { text: '=', wert: '=' }, { text: '>', wert: '>' }]);
        if (x === soll) break;
        f++; await LL.hinweis(f === 1 ? 'Vergleiche zuerst die Hunderter, dann die Zehner, dann die Einer.' : `${a} ${soll} ${b}.`);
      }
      await LL.sprichSo(a === b ? `${a} ist gleich ${b}.` : `${Math.max(a, b)} ist größer als ${Math.min(a, b)}.`);
      // Gemeinsam: Was wäre die größte Zahl gewesen?
      const w = [...T[ids[0]].wuerfe].sort((x, y) => y - x), max = w[0] * 100 + w[1] * 10 + w[2];
      await LL.zahlFrage(unten, `Deine Würfe: ${T[ids[0]].wuerfe.join(', ')}. Die größte Zahl daraus heißt`, max, ['Die größte Ziffer kommt zu den Hundertern, die kleinste zu den Einern.', `Die größte Zahl ist ${max}.`], '.');
      await LL.sprichSo(['Die größte Ziffer kommt zu den Hundertern.', `Die größte Zahl ist ${max}.`], mode === 'zwei' ? nm(ids[0]) : null);
      if (mode === 'robo') rz.sag(a === max ? 'Toll! Du hast die größte Zahl gebaut.' : 'Beim nächsten Mal überlegen wir genau, wohin die Ziffer kommt.');
      await LL.frage('Noch eine Runde?', [{ text: 'Weiter', wert: 1 }]);
    }
    (async () => {
      for (let i = 0; i < 3; i++) await runde();
      LL.ende(mode === 'robo' ? 'Super! Wir haben große Zahlen gebaut.' : 'Super! Ihr habt große Zahlen gebaut.');
    })();
  }

  LL.init({
    code: '2.3', title: 'Hohe Hausnummer', lernleiter: 'Lernleiter Zahlenraum bis 1000 · Teil A · Milestone 2 · Spiel', farbe: '#2E9E44',
    intro: ['Du würfelst. Robo würfelt dann.', 'Du schreibst die Zahl in ein Feld: H, Z oder E. Du darfst nicht mehr tauschen.', 'Nach drei Würfen liest du deine Zahl vor. Ihr vergleicht.', 'Zusammen überlegt ihr: Was wäre die größte Zahl gewesen?'],
    start,
  });
})();
