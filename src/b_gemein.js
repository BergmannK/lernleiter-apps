/* Gemeinsame Hilfen für ZR 1000 Teil B */
const B = (() => {
  const { rnd } = LL;
  const erg = t => t.op === '+' ? t.a + t.b : t.a - t.b;
  const auf = t => `<span class="blau">${t.a}</span> ${t.op} <span class="rot">${t.b}</span>`;
  const rt = t => `${t.a} ${t.op} ${t.b}`;
  // Aufgaben-Erzeuger: fn liefert {a, op, b} oder null; doppelte vermeiden
  function viele(n, fn) { const L = [], keys = new Set(); let tries = 0; while (L.length < n && tries++ < 5000) { const t = fn(); if (t && !keys.has(rt(t))) { keys.add(rt(t)); L.push(t); } } return L; }
  const LL_ = 'Lernleiter Rechnen im Zahlenraum bis 1000';
  return { erg, auf, rt, viele, LLname: m => `${LL_} · Teil B · Milestone ${m}` };
})();
