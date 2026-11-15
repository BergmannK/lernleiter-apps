#!/usr/bin/env python3
"""Nachvertonung (Luca, 15.11.): Zahlen und kurze Textteile (bis 2 Wörter) klangen oft verschluckt oder als „ähh“.
Diese werden jetzt in 3 Varianten (verschiedene Startwerte) vertont; audio_auswahl.py nimmt automatisch die beste.
Sätze mit „…“ (Lücken in Sprich-so-Sätzen) werden mit einer kurzen Pause statt „…“ neu vertont.
Aufruf: python3 audio_nachvertonen.py JOBS_ALT.tsv JOBS_NEU.tsv"""
import sys, re
sys.path.insert(0, __import__('os').path.dirname(__file__))
from audio_texte import tts_text, buchstaben

def pause_statt_luecke(t):
    t = re.sub(r'\s*(…|_{2,})\s*', ', ', t)
    t = re.sub(r',\s*([.!?])', r'\1', t)
    return re.sub(r'\s+', ' ', t).strip(' ,')

def main():
    alt, neu = sys.argv[1:3]
    out = []
    for line in open(alt, encoding='utf-8'):
        if not line.strip(): continue
        stimme, datei, text = line.rstrip('\n').split('\t', 2)
        basis = re.sub(r'(_v\d+)?\.mp3$', '', datei)
        kurz = '/n/' in datei or ('/f/' in datei and len(text.split()) <= 2)
        if '…' in text or '_' in text:
            out.append((stimme, basis + '_v3.mp3', buchstaben(pause_statt_luecke(text))))
        elif kurz:
            t = buchstaben(text.strip(' .,'))
            for k, tv in enumerate([t, t, t + '.'], 1):
                out.append((stimme, f'{basis}_v3_t{k}.mp3', tv))
    open(neu, 'w', encoding='utf-8').write(''.join('\t'.join(x) + '\n' for x in out))
    print(len(out), 'Aufnahmen,', sum(len(x[2]) for x in out), 'Zeichen')


if __name__ == '__main__':
    main()
