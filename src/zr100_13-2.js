/* ZR 100 · Karte 13.2 · Welcher Weg passt? (Aufgaben zu Wege-Schildern sortieren) */
(() => {
  const { h, wait, rnd, shuffle } = LL;
  document.head.append(h('style', {}, `
  .schilder{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;max-width:1000px;margin:10px auto}
  .schild{background:#fff;border:3px solid #333;border-radius:14px;min-height:170px;padding:8px;display:flex;flex-direction:column;gap:6px;align-items:center}
  .schild h3{margin:0;font-size:20px;text-align:center}
  .schild .k{background:#FFF6D5;border:2px solid #333;border-radius:10px;padding:2px 10px;font-weight:700;font-size:20px}
  .stapel{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:10px 0}
  .stapel button{font-size:28px;font-weight:700;border:3px solid #333;border-radius:12px;background:#FFF6D5;padding:10px 18px}
  .stapel button.gewaehlt{box-shadow:0 0 0 5px #FFD54A}
  @media (max-width:800px){.schilder{grid-template-columns:repeat(2,1fr)}}`));
  const SCH = { schritte: 'Schritte', stopp: 'Zehnerstopp', nachbar: 'Nachbaraufgabe', ergaenzen: 'Ergänzen' };
  const AUF = [
    { t: '55 + 19', ok: ['nachbar', 'schritte'], grund: 'Die 19 ist nah an der 20.' },
    { t: '38 + 7', ok: ['stopp', 'schritte'], grund: 'Ich rechne erst bis 40.' },
    { t: '64 – 29', ok: ['nachbar', 'schritte'], grund: 'Die 29 ist nah an der 30.' },
    { t: '72 – 68', ok: ['ergaenzen'], grund: 'Die Zahlen liegen nah beieinander.' },
    { t: '46 + 23', ok: ['schritte'], grund: 'Ich rechne erst die Zehner, dann die Einer.' },
    { t: '53 – 6', ok: ['stopp', 'schritte'], grund: 'Ich rechne erst bis 50.' },
    { t: '81 – 79', ok: ['ergaenzen'], grund: 'Die Zahlen liegen nah beieinander.' },
    { t: '34 + 38', ok: ['nachbar', 'schritte'], grund: 'Die 38 ist nah an der 40.' },
  ];
  const mit = w => w === 'schritte' ? 'in Schritten' : w === 'stopp' ? 'mit dem Zehnerstopp' : w === 'nachbar' ? 'mit der Nachbaraufgabe' : 'mit Ergänzen';

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const stapel = h('div', { class: 'stapel' }); main.append(stapel);
    const schilder = h('div', { class: 'schilder' }); main.append(schilder);
    const S = {};
    for (const [k, v] of Object.entries(SCH)) { S[k] = h('button', { class: 'schild' }, h('h3', {}, v)); schilder.append(S[k]); }
    const karten = shuffle(AUF).map(a => ({ ...a }));
    const offen = () => karten.filter(k => !k.gelegt);
    const zeigeStapel = () => { stapel.innerHTML = ''; offen().forEach(k => { k.el = h('button', {}, k.t.replace('–', '–')); stapel.append(k.el); }); };
    const lege = (k, w) => { k.gelegt = true; S[w].append(h('div', { class: 'k' }, k.t)); zeigeStapel(); };
    const tippeSchild = () => new Promise(r => Object.entries(S).forEach(([w, el]) => el.onclick = () => { Object.values(S).forEach(x => x.onclick = null); r(w); }));

    async function kindZug(id) {
      dran.set(id);
      if (mode === 'robo') rz.sag('Du ziehst eine Aufgabe. Du legst sie zu einem Schild.');
      const k = await new Promise(r => offen().forEach(x => x.el.onclick = () => r(x)));
      k.el.classList.add('gewaehlt');
      let f = 0, w;
      for (;;) {
        w = await tippeSchild();
        if (k.ok.includes(w)) break;
        f++; await LL.hinweis(f === 1 ? `Schau dir ${k.t} genau an. ${k.grund}` : `Bei ${k.t} passt: ${k.ok.map(x => SCH[x]).join(' oder ')}.`);
      }
      await LL.sprichSo([`Ich rechne ${k.t} ${mit(w)}.`, k.grund, 'Der Weg ist geschickt, weil …'], mode === 'zwei' ? LL.SPIELER[id].name : null);
      lege(k, w);
    }
    async function roboZug() {
      dran.set('robo');
      const k = offen()[rnd(offen().length)];
      k.el.classList.add('gewaehlt');
      const irrt = Math.random() < 0.4;
      const falsch = Object.keys(SCH).filter(x => !k.ok.includes(x));
      const w = irrt ? falsch[rnd(falsch.length)] : k.ok[0];
      rz.sag(`Ich lege ${k.t} zum Schild ${SCH[w]}.`);
      S[w].style.boxShadow = '0 0 0 5px #9FD3F0';
      let f = 0;
      for (;;) {
        const a = await LL.frage(`Robo legt ${k.t} zu „${SCH[w]}“. Passt der Weg?`, [{ text: 'Passt', cls: 'ok', wert: true }, { text: 'Passt nicht', cls: 'nein', wert: false }]);
        if (a === !irrt) break;
        f++; await LL.hinweis(f === 1 ? `Überlege, wie du ${k.t} rechnen würdest. ${k.grund}` : `Bei ${k.t} passt: ${k.ok.map(x => SCH[x]).join(' oder ')}.`);
      }
      S[w].style.boxShadow = '';
      if (irrt) { rz.sag(`Oh, danke! Ich lege ${k.t} zu ${SCH[k.ok[0]]}.`); await LL.sprichSo([`Ich rechne ${k.t} ${mit(k.ok[0])}.`, k.grund]); lege(k, k.ok[0]); }
      else { rz.sag(`Danke! ${k.grund}`); lege(k, w); }
      await wait(600);
    }
    (async () => {
      zeigeStapel();
      const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
      let i = 0;
      while (offen().length) { const id = ids[i++ % 2]; if (id === 'robo') await roboZug(); else await kindZug(id); }
      await LL.sprichSo(['Es gibt nicht nur einen richtigen Weg.', 'Woran erkenne ich den geschickten Weg?'], mode === 'zwei' ? 'Kind 1 und Kind 2' : null);
      LL.ende(mode === 'robo' ? 'Super! Alle Aufgaben liegen bei einem passenden Weg. Schreibt dazu ein Plakat mit der Klasse.' : 'Super! Alle Aufgaben liegen bei einem passenden Weg.');
    })();
  }

  LL.init({
    code: '13.2', title: 'Welcher Weg passt?', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 13 · Erklären', farbe: '#E53935',
    intro: ['Die Wege-Schilder liegen da: Schritte, Zehnerstopp, Nachbaraufgabe, Ergänzen.', 'Du ziehst eine Aufgabe. Du legst sie zu einem Schild.', 'Du sagst, warum der Weg passt.', 'Es gibt nicht nur einen richtigen Weg. Am Ende sprecht ihr in der Gruppe darüber.'],
    start,
  });
})();
