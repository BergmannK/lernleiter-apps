/* ZR 100 · Karte 10.3 · Abbau-Spiel (Würfeln, Einer wegnehmen, Zehner tauschen) – kooperativ */
(() => {
  const { h, wait } = LL;
  document.head.append(h('style', {}, `
  .matten{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .matte{background:#fff;border:3px solid #ccc;border-radius:16px;padding:10px;min-height:250px}
  .matte.amzug{border-color:var(--ms)}
  .matte h3{margin:0 0 6px;font-size:20px;display:flex;justify-content:space-between}
  .felder{display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .feldze{border:2px dashed #999;border-radius:10px;min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding:4px}
  .steuer{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin:10px 0;align-items:center}
  @media (max-width:800px){.matten{grid-template-columns:1fr}}`));

  function start(mode, main) {
    const rz = LL.roboZeile(main);
    if (mode === 'zwei') rz.zeige(false);
    const ids = mode === 'robo' ? ['du', 'robo'] : ['k1', 'k2'];
    const kopf = h('div'); const dran = LL.dranAnzeige(kopf); main.append(kopf);
    const matten = h('div', { class: 'matten' }); main.append(matten);
    const steuer = h('div', { class: 'steuer' }); main.append(steuer);
    const sp = {};
    ids.forEach(id => {
      const el = h('div', { class: 'matte' });
      const titel = h('h3', {}, `${LL.SPIELER[id].zeichen} ${LL.SPIELER[id].name}`, h('span'));
      const fz = h('div', { class: 'feldze' }), fe = h('div', { class: 'feldze' });
      el.append(titel, h('div', { class: 'felder' }, fz, fe)); matten.append(el);
      sp[id] = { z: 0, e: 0, el, fz, fe, stand: titel.lastChild };
    });
    const zeichne = id => { const p = sp[id]; p.fz.innerHTML = ''; p.fe.innerHTML = ''; p.fz.append(LL.zahlBild(p.z, 0, { klein: true }), h('b', {}, 'Z')); p.fe.append(LL.zahlBild(0, p.e, { klein: true }), h('b', {}, 'E')); p.stand.textContent = `${p.z} Z  ${p.e} E`; };
    const leer = id => sp[id].z === 0 && sp[id].e === 0;
    const nm = id => id === 'du' ? 'Du' : LL.SPIELER[id].name;

    async function kindZug(id) {
      const p = sp[id];
      steuer.innerHTML = '';
      const w = h('button', { class: 'btn' }, 'Würfeln'); steuer.append(w);
      await new Promise(r => w.onclick = r); steuer.innerHTML = '';
      let { n } = await LL.wuerfeln(steuer);
      const gesamt = p.z * 10 + p.e;
      if (n > gesamt) { await LL.hinweis(`Du hast ${n} gewürfelt, aber du hast nur noch ${gesamt}. Du nimmst alle weg.`, null, 'OK'); n = gesamt; }
      await LL.sprichSo(`Ich muss ${n} Einer wegnehmen.`, mode === 'zwei' ? nm(id) : null);
      let weg = 0;
      const info = h('span', { style: 'font-size:22px' });
      const minus = h('button', { class: 'btn hell' }, '– 1 Einer');
      const tausch = h('button', { class: 'btn hell' }, '1 Zehner in 10 Einer tauschen');
      const ok = h('button', { class: 'btn ok' }, 'Fertig');
      steuer.append(h('div', { class: 'steuer', style: 'width:100%' }, minus, tausch, ok, info));
      const upd = () => { info.textContent = `Du hast ${weg} von ${n} Einern weggenommen.`; zeichne(id); };
      let tauschHinweis = 0;
      minus.onclick = async () => {
        if (weg >= n) { await LL.hinweis(`Du nimmst nur ${n} Einer weg.`); return; }
        if (p.e === 0) { tauschHinweis++; await LL.hinweis(tauschHinweis === 1 ? 'Im E-Feld sind keine Einer mehr. Was kannst du tun?' : 'Tippe auf „1 Zehner in 10 Einer tauschen“.'); return; }
        p.e--; weg++; upd();
      };
      tausch.onclick = async () => {
        if (p.z === 0) { await LL.hinweis('Du hast keinen Zehner mehr.'); return; }
        if (p.e >= n - weg) { await LL.hinweis(`Du hast noch genug Einer. Du brauchst noch ${n - weg}.`); return; }
        p.z--; p.e += 10; zeichne(id);
        await LL.sprichSo([`Ich habe nur ${p.e - 10} Einer.`, 'Ich tausche einen Zehner.'], mode === 'zwei' ? nm(id) : null);
      };
      upd();
      for (;;) { await new Promise(r => ok.onclick = r); if (weg === n) break; await LL.hinweis(`Du musst ${n} Einer wegnehmen. Bis jetzt sind es ${weg}.`); }
      steuer.innerHTML = '';
      await LL.sprichSo(`Ich habe jetzt ${p.z} Zehner und ${p.e} Einer.`, mode === 'zwei' ? nm(id) : null);
    }

    async function roboZug() {
      const p = sp.robo;
      steuer.innerHTML = '';
      rz.sag('Ich würfle.');
      let { n } = await LL.wuerfeln(steuer);
      n = Math.min(n, p.z * 10 + p.e);
      rz.sag(`Ich muss ${n} Einer wegnehmen.`);
      await wait(1000);
      if (p.e < n) {
        const vergisst = Math.random() < 0.5;
        if (vergisst) {
          rz.sag(`Ich habe nur ${p.e} Einer. Ich kann nicht ${n} wegnehmen. Was mache ich?`);
          let f = 0;
          for (;;) {
            const a = await LL.frage(`Robo hat ${p.e} Einer und muss ${n} wegnehmen. Was muss Robo tun?`, [{ text: '1 Zehner in 10 Einer tauschen', cls: 'ok', wert: true }, { text: 'Aufhören', cls: 'hell', wert: false }]);
            if (a) break;
            f++; await LL.hinweis(f === 1 ? 'Robo hat noch Zehner. Ein Zehner sind 10 Einer.' : 'Robo tauscht 1 Zehner gegen 10 Einer.');
          }
          rz.sag('Danke! Ich tausche einen Zehner.');
        } else rz.sag(`Ich habe nur ${p.e} Einer. Ich tausche einen Zehner.`);
        await wait(1000);
        p.z--; p.e += 10; zeichne('robo'); await wait(700);
      }
      p.e -= n; zeichne('robo');
      rz.sag(`Ich habe jetzt ${p.z} Zehner und ${p.e} Einer.`);
      await wait(1300);
    }

    (async () => {
      const start = await LL.frage('Mit wie vielen Zehnern startet ihr?', [{ text: '3 Zehner (leichter)', cls: 'hell', wert: 3 }, { text: '5 Zehner', wert: 5 }]);
      ids.forEach(id => { sp[id].z = start; zeichne(id); });
      if (mode === 'robo') rz.sag(`Wir legen beide ${start} Zehner. Wir bauen ab, bis wir beide nichts mehr haben.`);
      let i = 0;
      while (!ids.every(leer)) {
        const id = ids[i++ % 2];
        if (leer(id)) continue;
        ids.forEach(x => sp[x].el.classList.toggle('amzug', x === id));
        dran.set(id);
        if (id === 'robo') await roboZug(); else await kindZug(id);
      }
      LL.ende(mode === 'robo' ? 'Super! Wir haben beide alles abgebaut.' : 'Super! Ihr habt beide alles abgebaut.');
    })();
  }

  LL.init({
    code: '10.3', title: 'Abbau-Spiel', lernleiter: 'Lernleiter Zahlen und Rechnen bis 100 · Milestone 10 · Spiel', farbe: '#5E9E1E',
    intro: ['Du legst 5 Zehner. Robo auch.', 'Du würfelst. Du nimmst so viele Einer weg.', 'Zu wenig Einer? Du tauschst 1 Zehner gegen 10 Einer.', 'Ihr baut beide ab, bis ihr nichts mehr habt.'],
    start,
  });
})();
