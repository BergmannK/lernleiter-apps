#!/usr/bin/env python3
"""Schneidet Wiederholungen und lange Stille aus den Clips.

Das Sprachmodell hört bei sehr kurzen Texten (z. B. „und“, „46“) manchmal nicht auf und
wiederholt das Wort. Wir behalten nur den ersten zusammenhängenden Sprechteil.
Aufruf: python3 audio_putzen.py JOBS.tsv EIN-ORDNER AUS-ORDNER
"""
import os, sys
import numpy as np, soundfile as sf


def segmente(d, sr, schwelle=0.02, fenster=0.05):
    w = int(sr * fenster)
    e = np.array([np.abs(d[i:i + w]).mean() for i in range(0, len(d), w)])
    an = e > schwelle
    segs, start = [], None
    for i, x in enumerate(an):
        if x and start is None: start = i
        if not x and start is not None: segs.append([start, i]); start = None
    if start is not None: segs.append([start, len(an)])
    return [[a * fenster, b * fenster] for a, b in segs]


def putzen(d, sr, text):
    worte = len(text.split())
    max_dauer = 0.9 + 0.085 * len(text)          # grobe Obergrenze für die Länge
    max_luecke = 0.7 if worte > 3 else 0.3       # längere Pause = Ende des Satzes
    segs = segmente(d, sr)
    if not segs: return d
    ende = segs[0][1]
    for a, b in segs[1:]:
        if a - ende > max_luecke or b - segs[0][0] > max_dauer: break
        ende = b
    s0 = max(0, int((segs[0][0] - 0.04) * sr)); s1 = min(len(d), int((ende + 0.08) * sr))
    out = d[s0:s1]
    if len(out) / sr > max_dauer * 1.3:            # immer noch zu lang: hart kürzen mit kurzem Ausblenden
        out = out[:int(max_dauer * 1.15 * sr)].copy()
        f = int(0.06 * sr); out[-f:] *= np.linspace(1, 0, f)
        putzen.verdaechtig.append(text)
    return out
putzen.verdaechtig = []


def main():
    jobs, ein, aus = sys.argv[1:4]
    n = gekuerzt = 0
    for line in open(jobs, encoding='utf-8'):
        if not line.strip(): continue
        _, datei, text = line.rstrip('\n').split('\t', 2)
        q = os.path.join(ein, datei)
        if not os.path.exists(q): continue
        d, sr = sf.read(q)
        neu = putzen(d, sr, text)
        z = os.path.join(aus, datei); os.makedirs(os.path.dirname(z), exist_ok=True)
        sf.write(z, neu, sr)
        n += 1; gekuerzt += len(neu) < len(d) - sr * 0.3
    print(f'{n} Clips, {gekuerzt} gekürzt, {len(putzen.verdaechtig)} hart gekürzt:', putzen.verdaechtig)


if __name__ == '__main__':
    main()
