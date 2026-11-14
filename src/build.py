#!/usr/bin/env python3
"""Baut die Lernleiter-Apps: jede App ist eine einzelne HTML-Datei (Schrift, CSS, JS eingebettet).
Aufruf: python3 build.py ZIELORDNER [BASIS-URL]
"""
import base64, json, os, sys

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(SRC, '..', 'dist')
BASE = sys.argv[2] if len(sys.argv) > 2 else 'https://bergmannk.github.io/lernleiter-apps/'

# Pfad -> (Quelldatei, Lernleiter, Milestone, Karte, Titel)
APPS = [
    ('zr100/1-2.html', 'zr100_1-2.js', 'ZR 100', 1, '1.2', 'Zehner-Sammler'),
    ('zr100/1-3.html', 'zr100_1-3.js', 'ZR 100', 1, '1.3', 'Schätzen und bündeln'),
    ('zr100/2-2.html', 'zr100_2-2.js', 'ZR 100', 2, '2.2', 'Hören – legen – schreiben'),
    ('zr100/2-3.html', 'zr100_2-3.js', 'ZR 100', 2, '2.3', 'Blitzblick'),
    ('zr100/2-4.html', 'zr100_2-4.js', 'ZR 100', 2, '2.4', 'Zahlen-Quartett'),
    ('zr100/2-5.html', 'zr100_2-5.js', 'ZR 100', 2, '2.5', 'Pärchen am Hunderterfeld'),
    ('zr100/4-3.html', 'zr100_4-3.js', 'ZR 100', 4, '4.3', 'Welche Zahl ist größer?'),
    ('zr100/4-4.html', 'zr100_4-4.js', 'ZR 100', 4, '4.4', 'Errate die Zahl'),
    ('zr100/4-5.html', 'zr100_4-5.js', 'ZR 100', 4, '4.5', 'Zahlenrätsel'),
    ('zr100/4-7.html', 'zr100_4-7.js', 'ZR 100', 4, '4.7', 'Dazwischen?'),
    ('zr100/5-2.html', 'zr100_5-2.js', 'ZR 100', 5, '5.2', 'Zehner-Freunde'),
    ('zr100/5-3.html', 'zr100_5-3.js', 'ZR 100', 5, '5.3', 'Zehnerzahlen zur 100'),
    ('zr100/6-2.html', 'zr100_6-2.js', 'ZR 100', 6, '6.2', 'Nur die Zehner ändern sich'),
    ('zr100/7-2.html', 'zr100_7-2.js', 'ZR 100', 7, '7.2', 'Domino'),
    ('zr100/7p-2.html', 'zr100_7p-2.js', 'ZR 100', 75, '7+.2', 'Drei passen zusammen'),
    ('zr100/7p-3.html', 'zr100_7p-3.js', 'ZR 100', 75, '7+.3', 'Dazulegen – wegnehmen'),
    ('zr100/10-3.html', 'zr100_10-3.js', 'ZR 100', 10, '10.3', 'Abbau-Spiel'),
    ('zr100/13-1.html', 'zr100_13-1.js', 'ZR 100', 13, '13.1', 'Mein Weg – dein Weg'),
    ('zr100/13-2.html', 'zr100_13-2.js', 'ZR 100', 13, '13.2', 'Welcher Weg passt?'),
    ('zr1000a/1-2.html', 'zr1000a_1-2.js', 'ZR 1000 Teil A', 1, '1.2', 'Vom Zehner zum Tausender'),
    ('zr1000a/1-3.html', 'zr1000a_1-3.js', 'ZR 1000 Teil A', 1, '1.3', 'Hunderter-Sammler'),
    ('zr1000a/1-4.html', 'zr1000a_1-4.js', 'ZR 1000 Teil A', 1, '1.4', 'Schätzen und bündeln'),
    ('zr1000a/2-2.html', 'zr1000a_2-2.js', 'ZR 1000 Teil A', 2, '2.2', 'Zahlen-Diktat'),
    ('zr1000a/2-3.html', 'zr1000a_2-3.js', 'ZR 1000 Teil A', 2, '2.3', 'Hohe Hausnummer'),
    ('zr1000a/2-4.html', 'zr1000a_2-4.js', 'ZR 1000 Teil A', 2, '2.4', 'Blitzblick'),
    ('zr1000a/3-2.html', 'zr1000a_3-2.js', 'ZR 1000 Teil A', 3, '3.2', 'Zahlwort-Memory'),
    ('zr1000a/3-3.html', 'zr1000a_3-3.js', 'ZR 1000 Teil A', 3, '3.3', 'Zahlen-Telefon'),
    ('zr1000a/4-3.html', 'zr1000a_4-3.js', 'ZR 1000 Teil A', 4, '4.3', 'Abbau-Spiel'),
    ('zr1000a/5-3.html', 'zr1000a_5-3.js', 'ZR 1000 Teil A', 5, '5.3', 'Tausenderbuch-Suche'),
    ('zr1000a/6-3.html', 'zr1000a_6-3.js', 'ZR 1000 Teil A', 6, '6.3', 'Wer kennt den Nachbarn?'),
    ('zr1000a/7-3.html', 'zr1000a_7-3.js', 'ZR 1000 Teil A', 7, '7.3', 'Wo bin ich?'),
    ('zr1000a/8-2.html', 'zr1000a_8-2.js', 'ZR 1000 Teil A', 8, '8.2', 'Wer hat mehr?'),
    ('zr1000a/8-3.html', 'zr1000a_8-3.js', 'ZR 1000 Teil A', 8, '8.3', 'Zahlen ordnen'),
    ('zr1000b/1-2.html', 'b_gemein.js+zr1000b_1-2.js', 'ZR 1000 Teil B', 1, '1.2', 'Hunderter-Päckchen'),
    ('zr1000b/1-3.html', 'b_gemein.js+zr1000b_1-3.js', 'ZR 1000 Teil B', 1, '1.3', 'Hunderter-Domino'),
    ('zr1000b/2-2.html', 'b_gemein.js+zr1000b_2-2.js', 'ZR 1000 Teil B', 2, '2.2', 'Kleine Aufgabe hilft'),
    ('zr1000b/2-3.html', 'b_gemein.js+zr1000b_2-3.js', 'ZR 1000 Teil B', 2, '2.3', 'Aufgaben-Tandem'),
    ('zr1000b/2-4.html', 'b_gemein.js+zr1000b_2-4.js', 'ZR 1000 Teil B', 2, '2.4', 'Glückswürfeln'),
    ('zr1000b/3-2.html', "zr1000b_3-2.js", 'ZR 1000 Teil B', 3, '3.2', 'Mit Stopp rechnen'),
    ('zr1000b/3-3.html', 'b_gemein.js+zr1000b_3-3.js', 'ZR 1000 Teil B', 3, '3.3', 'Zehner-Popcorn'),
    ('zr1000b/3-4.html', 'b_gemein.js+zr1000b_3-4.js', 'ZR 1000 Teil B', 3, '3.4', 'Rückwärts-Rennen'),
    ('zr1000b/4-2.html', 'b_gemein.js+zr1000b_4-2.js', 'ZR 1000 Teil B', 4, '4.2', 'Erst Zehner, dann Einer'),
    ('zr1000b/4-3.html', 'b_gemein.js+zr1000b_4-3.js', 'ZR 1000 Teil B', 4, '4.3', 'Zahlen-Duell'),
    ('zr1000b/5-2.html', 'b_gemein.js+zr1000b_5-2.js', 'ZR 1000 Teil B', 5, '5.2', 'Mit Stopp rechnen'),
    ('zr1000b/5-3.html', 'b_gemein.js+zr1000b_5-3.js', 'ZR 1000 Teil B', 5, '5.3', 'Stopp-Rennen'),
    ('zr1000b/6-2.html', 'b_gemein.js+zr1000b_6-2.js', 'ZR 1000 Teil B', 6, '6.2', 'Stellenweise rechnen'),
    ('zr1000b/6-3.html', 'b_gemein.js+zr1000b_6-3.js', 'ZR 1000 Teil B', 6, '6.3', 'Rechen-Memory'),
    ('zr1000b/7-2.html', 'b_gemein.js+zr1000b_7-2.js', 'ZR 1000 Teil B', 7, '7.2', 'Hilfsaufgabe'),
    ('zr1000b/7-3.html', 'b_gemein.js+zr1000b_7-3.js', 'ZR 1000 Teil B', 7, '7.3', 'Rechen-Rennen'),
]

def rd(p):
    with open(os.path.join(SRC, p), encoding='utf-8') as f:
        return f.read()

def font(p):
    with open(os.path.join(SRC, 'fonts', p), 'rb') as f:
        return 'data:font/woff2;base64,' + base64.b64encode(f.read()).decode()

CSS = rd('core.css').replace('FONT_REGULAR', font('andika-Regular.woff2')).replace('FONT_BOLD', font('andika-Bold.woff2'))
CORE = rd('core.js')
HEAD = '''<!doctype html><html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="robots" content="noindex">
<title>{title}</title><style>{css}</style></head><body>'''

def build():
    for path, js, ll, ms, code, title in APPS:
        if not all(os.path.exists(os.path.join(SRC, x)) for x in js.split('+')):
            print('fehlt noch:', js); continue
        out = os.path.join(OUT, path)
        os.makedirs(os.path.dirname(out), exist_ok=True)
        html = HEAD.format(title=f'{code} {title}', css=CSS) + f'<script>{CORE}</script><script>{"".join(rd(x) for x in js.split("+"))}</script></body></html>'
        with open(out, 'w', encoding='utf-8') as f:
            f.write(html)
    # Startseite für die Lehrkraft
    rows = ''
    for ll in dict.fromkeys(a[2] for a in APPS):
        rows += f'<h2>Lernleiter {ll}</h2><div class="liste">'
        for path, js, l2, ms, code, title in APPS:
            if l2 == ll:
                rows += f'<a class="eintrag" href="{path}"><span class="nr">{code}</span><span>{title}<small>Milestone {ms}</small></span></a>'
        rows += '</div>'
    idx = HEAD.format(title='Lernleiter-Apps', css=CSS) + f'''
<style>.liste{{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}}
.eintrag{{display:flex;gap:14px;align-items:center;background:#fff;border:2px solid #ccc;border-radius:16px;padding:12px;text-decoration:none;color:#222;font-weight:700}}
.eintrag .nr{{background:#1E5BD8;color:#fff;border-radius:10px;padding:8px 10px;min-width:60px;text-align:center}}
.eintrag small{{display:block;font-weight:400;color:#666;font-size:16px}} h2{{margin:22px 0 10px}}</style>
<header class="kopf"><div class="nr">Apps</div><h1>Lernleiter-Apps<small>Übersicht für die Lehrkraft · Muster</small></h1></header>
<main>{rows}<p style="margin-top:30px;color:#666;font-size:16px">Ohne Anmeldung, ohne Speicherung, ohne Werbung. Die Apps laden nichts aus dem Internet nach.</p></main></body></html>'''
    with open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(idx)
    with open(os.path.join(OUT, 'apps.json'), 'w', encoding='utf-8') as f:
        json.dump([dict(pfad=a[0], lernleiter=a[2], milestone=a[3], karte=a[4], titel=a[5]) for a in APPS], f, ensure_ascii=False, indent=1)
    print('gebaut:', OUT)

build()
