#!/usr/bin/env python3
"""Wählt aus den Varianten *_v3_t1/t2/t3.mp3 die beste Aufnahme und trägt sie ins Manifest ein.
Gut = ein zusammenhängender Sprechteil, Länge passend zur Wortlänge (kein Verschlucken, kein Wiederholen, kein „ähh“).
Aufruf: python3 audio_auswahl.py JOBS_NACH.tsv CLIPS MANIFEST_ALT MANIFEST_NEU CLEAN_ORDNER"""
import sys, os, re, json, math, subprocess, collections
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__))
from audio_putzen import putzen

def lade(p):
    raw = subprocess.run(['ffmpeg', '-v', 'quiet', '-i', p, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32), 16000

def segmente(d, sr, schwelle=0.02, fenster=0.02, luecke=0.22):
    w = int(sr * fenster); e = np.array([np.abs(d[i:i + w]).mean() for i in range(0, len(d), w)]) if len(d) else np.zeros(0)
    an = np.flatnonzero(e > schwelle)
    if not an.size: return []
    segs = [[an[0], an[0] + 1]]
    for i in an[1:]:
        if (i - segs[-1][1]) * fenster > luecke: segs.append([i, i + 1])
        else: segs[-1][1] = i + 1
    return [(a * fenster, b * fenster) for a, b in segs if (b - a) * fenster > 0.06]

def bewerte(p, text):
    d, sr = lade(p)
    lang = len(text.split()) > 2
    segs = segmente(d, sr, luecke=0.6 if lang else 0.22)
    if not segs: return 99, 0
    soll = 0.22 + 0.068 * len(re.sub(r'[^\wäöüß]', '', text))
    dauer = segs[-1][1] - segs[0][0]
    if lang: return abs(math.log(max(dauer, 0.05) / soll)) + 0.6 * (len(segs) - 1), dauer
    return (len(segs) - 1) * 0.8 + abs(math.log(max(dauer, 0.05) / soll)) + (2 if dauer < 0.55 * soll else 0), dauer

jobs, clips, man_alt, man_neu, clean = sys.argv[1:6]
gruppen = collections.defaultdict(list)
for line in open(jobs, encoding='utf-8'):
    if not line.strip(): continue
    _, datei, text = line.rstrip('\n').split('\t', 2)
    gruppen[re.sub(r'(_t\d)?\.mp3$', '', datei)].append((datei, text))
man = json.load(open(man_alt, encoding='utf-8'))
neu_name = {}
schwach = []
for basis, takes in gruppen.items():
    if not all(os.path.exists(os.path.join(clips, d)) for d, _ in takes): continue
    if len(takes) == 1: best = takes[0][0]; sc = 0
    else:
        bew = sorted((bewerte(os.path.join(clips, d), t)[0], d) for d, t in takes)
        sc, best = bew[0]
        if sc > 0.9: schwach.append((best, round(sc, 2), takes[0][1]))
    # gekürzt (nur erster Sprechteil) in den Clean-Ordner
    d, sr = sf.read(os.path.join(clips, best))
    if d.ndim > 1: d = d.mean(1)
    ziel = os.path.join(clean, best); os.makedirs(os.path.dirname(ziel), exist_ok=True)
    sf.write(ziel, putzen(d, sr, takes[0][1].strip(' .')), sr)
    alt = re.sub(r'_v\d+$', '', basis)
    ver = int(re.search(r'_v(\d+)$', basis).group(1)) if re.search(r'_v(\d+)$', basis) else 0
    if alt not in neu_name or ver >= neu_name[alt][1]: neu_name[alt] = (best, ver)
n = 0
for v in man:
    for k, f in man[v].items():
        b = re.sub(r'(_v\d+)?\.mp3$', '', f)
        if b in neu_name: man[v][k] = neu_name[b][0]; n += 1
json.dump(man, open(man_neu, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(n, 'Einträge ersetzt;', len(schwach), 'unsicher:', schwach[:30])
