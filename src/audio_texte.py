#!/usr/bin/env python3
"""Erzeugt aus den gesammelten App-Texten die Vertonungs-Aufträge und das Manifest.

Aufruf: python3 audio_texte.py TEXTE.txt [TEXTE2.txt ...] --jobs jobs.tsv --manifest manifest.json [--zahlen 0-100]

TEXTE.txt: Zeilen "a<TAB>Text" (a = Anweisung/Ryan, r = Robo/Serena), gesammelt mit ?sammeln.
Regeln (gleich wie core.js):
  - Text vereinheitlichen, in Sätze teilen (. ! ?)
  - Satz ohne Zahl          -> ganzer Satz          (s:)
  - Satz mit genau einer Zahl, dessen Muster in GANZ steht -> alle Zahlen des Bereichs als ganze Sätze (s:)
  - sonst                  -> Textteile (f:) + Zahlwörter (n:)
"""
import argparse, hashlib, json, re, sys

VOICE = {'a': 'Ryan', 'r': 'Serena'}

# Muster mit einer Zahl, die als ganze Sätze vertont werden (natürlicher Klang): Muster -> Zahlen
GANZ = {
    'Zusammen sind sie #.': range(20, 100, 10),
    'Es fehlt noch #.': range(1, 10),
    'Das ist # zu viel.': range(1, 10),
    'Ist es #?': range(1, 101),
    'Meine Zahl ist größer als #.': range(1, 101),
    'Meine Zahl ist kleiner als #.': range(1, 101),
}

def norm(s):
    s = re.sub(r'<br\s*/?>', ' ', s, flags=re.I)
    s = re.sub(r'<[^>]+>', '', s).replace('&nbsp;', ' ')
    s = re.sub(r'[„“"«»]', '', s)
    s = s.replace('–', ' minus ').replace('−', ' minus ').replace('+', ' plus ').replace('=', ' ist ').replace('|', ' ')
    return re.sub(r'\s+', ' ', s).strip()

def saetze(s):
    out, cur = [], ''
    for ch in s:
        cur += ch
        if ch in '.!?':
            out.append(cur.strip()); cur = ''
    if cur.strip(): out.append(cur.strip())
    return [x for x in out if x]

key = lambda s: re.sub(r'\s+', ' ', s.lower()).strip()
fragkey = lambda s: re.sub(r'^[\s.,!?:;]+|[\s.,!?:;]+$', '', key(s))

EINER = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn',
         'elf', 'zwölf', 'dreizehn', 'vierzehn', 'fünfzehn', 'sechzehn', 'siebzehn', 'achtzehn', 'neunzehn']
ZEHNER = ['', '', 'zwanzig', 'dreißig', 'vierzig', 'fünfzig', 'sechzig', 'siebzig', 'achtzig', 'neunzig']

def zahlwort(n, im_wort=False):
    if n < 20:
        w = EINER[n]
        return 'ein' if (im_wort and n == 1) else w
    if n < 100:
        e, z = n % 10, n // 10
        return ZEHNER[z] if e == 0 else ('ein' if e == 1 else EINER[e]) + 'und' + ZEHNER[z]
    if n < 1000:
        h, r = n // 100, n % 100
        return ('ein' if h == 1 else EINER[h]) + 'hundert' + (zahlwort(r) if r else '')
    if n == 1000:
        return 'eintausend'
    raise ValueError(n)

BUCHSTABE = {'H': 'Ha', 'Z': 'Zett', 'E': 'Eh', 'T': 'Teh'}   # Stellenwert-Abkürzungen als Buchstabennamen (nicht „Hey“)
_RAND = r'(?<![\wÄÖÜäöüß])'
def buchstaben(s):
    return re.sub(_RAND + r'([HZET])(?![\wÄÖÜäöüß])', lambda m: BUCHSTABE[m.group(1)], s)

def tts_text(s):
    """Text für die Sprachausgabe: Zahlen als Wörter, keine Ausrufezeichen (ruhiger)."""
    s = re.sub(r'\d+', lambda m: zahlwort(int(m.group())), s)
    s = buchstaben(s)
    return s.replace('!', '.')

def fname(voice, art, k):
    if art == 'n':
        return f'{voice}/n/{k}.mp3'
    return f'{voice}/{art}/{hashlib.sha1(k.encode()).hexdigest()[:12]}.mp3'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('texte', nargs='+')
    ap.add_argument('--jobs', required=True)
    ap.add_argument('--manifest', required=True)
    ap.add_argument('--zahlen', default='0-100', help='Zahlwörter, die einzeln vertont werden, z. B. 0-100')
    a = ap.parse_args()
    lo, hi = map(int, a.zahlen.split('-'))
    man = {'a': {}, 'r': {}}
    jobs = {}  # datei -> (stimme, text)

    def add(voice, art, k, text):
        f = fname(voice, art, k)
        man[voice][f'{art}:{k}'] = f
        jobs.setdefault(f, (VOICE[voice], text))

    for path in a.texte:
        for line in open(path, encoding='utf-8'):
            if '\t' not in line: continue
            v, t = line.rstrip('\n').split('\t', 1)
            for satz in saetze(norm(t)):
                if re.search(r'[a-zäöüß]-[a-zäöüß]', satz):
                    continue  # Silben-Schreibweise (drei-hundert-fünf): bleibt bei der Computerstimme
                zahlen = re.findall(r'\d+', satz)
                muster = re.sub(r'\d+', '#', satz)
                if not zahlen:
                    add(v, 's', key(satz), tts_text(satz)); continue
                if len(zahlen) == 1 and muster in GANZ:
                    for n in GANZ[muster]:
                        s2 = muster.replace('#', str(n))
                        add(v, 's', key(s2), tts_text(s2))
                    continue
                for teil in re.split(r'(\d+)', satz):
                    if re.fullmatch(r'\d+', teil): continue
                    k = fragkey(teil)
                    if k: add(v, 'f', k, tts_text(teil.strip(' ,;:')))
                for n in list(range(lo, min(hi, 100) + 1)) + ([x * 100 for x in range(2, 10)] + [1000] if hi > 100 else []):
                    add(v, 'n', str(n), zahlwort(n))
    with open(a.jobs, 'w', encoding='utf-8', newline='\n') as f:
        for datei, (stimme, text) in sorted(jobs.items()):
            f.write(f'{stimme}\t{datei}\t{text}\n')
    json.dump(man, open(a.manifest, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    zeichen = sum(len(t) for _, t in jobs.values())
    print(f'{len(jobs)} Aufnahmen, {zeichen} Zeichen', file=sys.stderr)

if __name__ == '__main__':
    main()
