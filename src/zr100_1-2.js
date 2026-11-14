/* ZR 100 · Karte 1.2 · Zehner-Sammler (Würfeln, Einer sammeln, 10 Einer gegen 1 Zehner tauschen) */
(() => {
  const { h, wait, rnd } = LL;
  document.head.append(h('style', {}, `
  .matten{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .matte{background:#fff;border:3px solid #ccc;border-radius:16px;padding:10px;min-height:250px}
  .matte.amzug{border-color:var(--ms)}
  .matte h3{margin:0 0 6px;font-size:20px;display:flex;justify-content:space-between}
  .felder{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .feldze{border:2px dashed #999;border-radius:10px;min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:4px}
  .feldze b{font-size:20px}
  .steuer{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:10px 0;align-items:center}
  @media (max-width:800px){.matten{grid-template-columns:1fr}}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    const sp = {};
    const kopf = h('div', { style: 'display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px' });
    const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const matten = h('div', { class: 'matten' }); main.append(matten);
    const steuer = h('div', { class: 'steuer' }); main.append(steuer);
    let ziel = 5;
    ids.forEach(id => {
      const el = h('div', { class: 'matte' });
      const titel = h('h3', {}, `${LL.SPIELER[id].zeichen} ${LL.SPIELER[id].name}`, h('span', { class: 'stand' }));
      const fz = h('div', { class: 'feldze' }), fe = h('div', { class: 'feldze' });
      el.append(titel, h('div', { class: 'felder' }, fz, fe)); matten.append(el);
      sp[id] = { z: 0, e: 0, el, fz, fe, stand: titel.querySelector('.stand') };
    });
    const zeichne = id => {
      const p = sp[id];
      p.fz.innerHTML = ''; p.fe.innerHTML = '';
      p.fz.append(LL.zahlBild(p.z, 0, { klein: true }), h('b', {}, 'Z'));
      p.fe.append(LL.zahlBild(0, p.e, { klein: true }), h('b', {}, 'E'));
      p.stand.textContent = `${p.z} Z  ${p.e} E`;
    };
    ids.forEach(zeichne);
    const fertig = id => sp[id].z >= ziel;
    const name = id => id === 'du' ? 'Du' : LL.SPIELER[id].name;

    async function kindZug(id) {
      const p = sp[id];
      steuer.innerHTML = '';
      const knopf = h('button', { class: 'btn' }, 'Würfeln');
      steuer.append(knopf);
      await new Promise(r => knopf.onclick = r);
      steuer.innerHTML = '';
      const { n } = await LL.wuerfeln(steuer);
      const vorher = p.e; let gelegt = 0;
      const info = h('span', { style: 'font-size:24px' });
      const plus = h('button', { class: 'btn hell' }, '+ 1 Einer');
      const minus = h('button', { class: 'btn hell' }, '– 1 Einer');
      const tausch = h('button', { class: 'btn hell' }, '10 Einer tauschen');
      const ok = h('button', { class: 'btn ok' }, 'Fertig');
      steuer.append(h('div', { class: 'steuer', style: 'width:100%' }, plus, minus, tausch, ok, info));
      const upd = () => { info.textContent = `Du hast ${gelegt} Einer dazugelegt.`; zeichne(id); };
      plus.onclick = () => { p.e++; gelegt++; upd(); };
      minus.onclick = () => { if (gelegt > 0 && p.e > 0) { p.e--; gelegt--; upd(); } };
      let getauscht = false, fehlerZahl = 0, fehlerTausch = 0;
      tausch.onclick = async () => {
        if (p.e < 10) { await LL.hinweis(`Im E-Feld sind ${p.e} Einer. Erst bei 10 Einern tauschst du.`); return; }
        p.e -= 10; p.z++; getauscht = true; zeichne(id);
        await LL.sprichSo(['Ich habe 10 Einer.', 'Ich tausche sie gegen 1 Zehner.'], mode === 'zwei' ? name(id) : null);
      };
      upd();
      for (;;) {
        await new Promise(r => ok.onclick = r);
        if (gelegt !== n) {
          fehlerZahl++;
          if (fehlerZahl === 1) { await LL.hinweis(`Du hast ${n} gewürfelt. Du legst genau ${n} Einer dazu. Zähle nach.`); continue; }
          p.e = vorher + n - (getauscht ? 10 : 0); gelegt = n; upd();
          await LL.hinweis(`Ich habe es für dich gelegt: ${n} Einer.`);
        }
        if (p.e >= 10) {
          fehlerTausch++;
          await LL.hinweis(fehlerTausch === 1 ? 'Schau ins E-Feld. Hast du 10 Einer oder mehr?' : `Du hast ${p.e} Einer. Tippe auf „10 Einer tauschen“.`);
          continue;
        }
        break;
      }
      await LL.sprichSo(`Ich habe jetzt ${p.z} Zehner und ${p.e} Einer.`, mode === 'zwei' ? name(id) : null);
    }

    async function roboZug() {
      const p = sp.robo;
      steuer.innerHTML = '';
      rz.sag('Ich würfle.');
      const { n } = await LL.wuerfeln(steuer);
      rz.sag(`Ich habe ${n} gewürfelt. Ich lege ${n} Einer dazu.`);
      await wait(900);
      p.e += n; zeichne('robo');
      await wait(700);
      if (p.e >= 10) {
        if (Math.random() < 0.5) {
          rz.sag('Ich bin fertig.');
          let f = 0;
          for (;;) {
            const a = await LL.frage(`Robo hat ${p.e} Einer im E-Feld. Was muss Robo tun?`, [{ text: '10 Einer tauschen', cls: 'ok', wert: true }, { text: 'Nichts', cls: 'hell', wert: false }]);
            if (a) break;
            f++; await LL.hinweis(f === 1 ? 'Zähle die Einer bei Robo. Sind es 10 oder mehr?' : `Robo hat ${p.e} Einer. Das sind mehr als 9. Robo muss tauschen.`);
          }
          rz.sag('Danke! Ich tausche 10 Einer gegen 1 Zehner.');
        } else rz.sag('Ich habe 10 Einer. Ich tausche sie gegen 1 Zehner.');
        await wait(900);
        p.e -= 10; p.z++; zeichne('robo');
        await wait(600);
      }
      rz.sag(`Ich habe jetzt ${p.z} Zehner und ${p.e} Einer.`);
      await wait(1200);
    }

    (async () => {
      ziel = await LL.frage('Wie viele Zehner sammelt ihr?', [{ text: '3 Zehner (leichter)', cls: 'hell', wert: 3 }, { text: '5 Zehner', wert: 5 }]);
      if (mode === 'robo') rz.sag(`Wir sammeln beide ${ziel} Zehner. Du fängst an.`);
      let i = 0;
      while (!ids.every(fertig)) {
        const id = ids[i % 2]; i++;
        if (fertig(id)) continue;
        ids.forEach(x => sp[x].el.classList.toggle('amzug', x === id));
        dran.set(id);
        if (id === 'robo') await roboZug(); else await kindZug(id);
        if (fertig(id)) { if (id === 'robo') rz.sag(`Ich habe ${ziel} Zehner.`); else await LL.frage(`${name(id) === 'Du' ? 'Du hast' : name(id) + ' hat'} ${ziel} Zehner gesammelt.`, [{ text: 'Weiter', wert: 1 }]); }
      }
      steuer.innerHTML = '';
      LL.ende(mode === 'robo' ? `Super! Wir haben beide ${ziel} Zehner gesammelt.` : `Super! Ihr habt beide ${ziel} Zehner gesammelt.`);
    })();
  }

  LL.init({
    code: '1.2', title: 'Zehner-Sammler', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 1 · Spiel', farbe: '#E8B10E',
    intro: ['Du würfelst.', 'Du legst so viele Einer in das E-Feld.', 'Hast du 10 Einer? Du tauschst sie gegen 1 Zehner.', 'Robo sammelt auch. Ihr sammelt beide, bis jeder 5 Zehner hat.'],
    start,
  });
})();
