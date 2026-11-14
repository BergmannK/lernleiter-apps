#!/usr/bin/env python3
"""Packt die vertonten Clips je App in EINE Datei (GitHub-Upload: wenige Dateien statt Tausender).

Aufruf: python3 audio_pack.py MANIFEST.json CLIP-ORDNER ZIELORDNER APP-PFAD TEXTE.txt [...]
  APP-PFAD z. B. zr100/5-2.html  ->  ZIELORDNER/zr100-5-2.pak
  TEXTE.txt: gesammelte Texte dieser App (?sammeln). Nur Clips, die diese App braucht, kommen ins Paket.
Format: [4 Byte Länge, little endian][JSON {stimme: {schlüssel: [offset, länge]}}][MP3-Daten]
"""
import json, os, re, struct, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from audio_texte import norm, saetze, key, fragkey, GANZ


def benoetigt(texte_dateien, man):
    """Schlüssel, die die App laut ihren Texten braucht (gleiche Logik wie core.js)."""
    need = {'a': set(), 'r': set()}
    for p in texte_dateien:
        for line in open(p, encoding='utf-8'):
            if '\t' not in line:
                continue
            v, t = line.rstrip('\n').split('\t', 1)
            for satz in saetze(norm(t)):
                muster = re.sub(r'\d+', '#', satz)
                if muster in GANZ:
                    need[v].update(k for k in man[v] if k.startswith('s:') and re.sub(r'\d+', '#', k[2:]) == key(muster))
                need[v].add('s:' + key(satz))
                for teil in re.split(r'(\d+)', satz):
                    if re.fullmatch(r'\d+', teil):
                        n = int(teil)
                        need[v].add(f'n:{n}')
                        if n > 100:
                            need[v].update({f'n:{n // 100 * 100}', f'n:{n % 100}'})
                    elif fragkey(teil):
                        need[v].add('f:' + fragkey(teil))
    return need


def main():
    man_p, clips, ziel, app = sys.argv[1:5]
    texte = sys.argv[5:]
    man = json.load(open(man_p, encoding='utf-8'))
    need = benoetigt(texte, man) if texte else {v: set(m) for v, m in man.items()}
    for v in need:  # alle Zahlwörter immer mitnehmen (Zahlen sind im Spiel zufällig)
        need[v].update(k for k in man.get(v, {}) if k.startswith('n:'))
    index, daten, off = {}, bytearray(), 0
    for v, m in man.items():
        index[v] = {}
        for k, f in m.items():
            if k not in need.get(v, ()):
                continue
            pfad = os.path.join(clips, f)
            if not os.path.exists(pfad):
                continue
            klein = os.path.join(clips + '_32k', f)   # kleiner neu kodieren: 32 kbit/s mono
            if not os.path.exists(klein):
                os.makedirs(os.path.dirname(klein), exist_ok=True)
                subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', pfad, '-ac', '1', '-b:a', '32k', klein], check=True)
            b = open(klein, 'rb').read()
            index[v][k] = [off, len(b)]
            daten += b; off += len(b)
    j = json.dumps(index, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    os.makedirs(ziel, exist_ok=True)
    out = os.path.join(ziel, app.replace('/', '-').replace('.html', '.pak'))
    with open(out, 'wb') as fh:
        fh.write(struct.pack('<I', len(j))); fh.write(j); fh.write(daten)
    anz = sum(len(x) for x in index.values())
    print(f'{out}: {anz} Clips, {len(daten) / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
