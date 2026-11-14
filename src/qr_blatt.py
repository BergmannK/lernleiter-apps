#!/usr/bin/env python3
"""QR-Blatt für die Lernleiter-Apps (A4, zum Laminieren).
Aufruf: python3 qr_blatt.py BASIS-URL apps.json AUSGABE.pdf [TITEL]"""
import io, json, sys
import segno
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader

pdfmetrics.registerFont(TTFont('A', '/usr/share/fonts/truetype/andika/Andika-Regular.ttf'))
pdfmetrics.registerFont(TTFont('AB', '/usr/share/fonts/truetype/andika/Andika-Bold.ttf'))
INK = HexColor('#222222')
COL = {('ZR 100', 4): '#EE7F4B', ('ZR 100', 5): '#E2557F', ('ZR 1000 Teil B', 3): '#2BA9C2'}
LLNAME = {'ZR 100': 'Zahlen und Rechnen bis 100', 'ZR 1000 Teil A': 'Zahlenraum bis 1000 · Teil A', 'ZR 1000 Teil B': 'Rechnen im Zahlenraum bis 1000'}

def qr_img(url):
    b = io.BytesIO(); segno.make(url, error='m').save(b, kind='png', scale=12, border=2); b.seek(0)
    return ImageReader(b)

def tablet(c, x, y, s=1):
    c.setStrokeColor(INK); c.setLineWidth(1.4); c.setFillColor(white)
    c.roundRect(x, y, 9 * mm * s, 12 * mm * s, 1.5 * mm, stroke=1, fill=1)
    c.circle(x + 4.5 * mm * s, y + 1.4 * mm * s, 0.6 * mm, stroke=0, fill=0)
    c.setFillColor(INK); c.circle(x + 4.5 * mm * s, y + 1.4 * mm * s, 0.55 * mm, stroke=0, fill=1)

def karte(c, x, y, w, h, url, oben, titel, unten, farbe):
    c.setStrokeColor(HexColor(farbe)); c.setLineWidth(2.2); c.roundRect(x, y, w, h, 4 * mm)
    c.setFillColor(HexColor(farbe)); c.roundRect(x + 5 * mm, y + h - 15 * mm, 22 * mm, 10 * mm, 2 * mm, stroke=0, fill=1)
    c.setFillColor(white); c.setFont('AB', 16); c.drawCentredString(x + 16 * mm, y + h - 12 * mm, oben)
    c.setFillColor(INK); c.setFont('AB', 17); c.drawString(x + 31 * mm, y + h - 12 * mm, titel)
    q = min(w - 30 * mm, h - 48 * mm)
    c.drawImage(qr_img(url), x + (w - q) / 2, y + 22 * mm, q, q)
    tablet(c, x + w / 2 - 30 * mm, y + 8 * mm)
    c.setFont('AB', 15); c.drawString(x + w / 2 - 18 * mm, y + 13 * mm, 'Mit Robo spielen' if oben != 'Apps' else 'Alle Apps')
    c.setFont('A', 9); c.setFillColor(HexColor('#555555')); c.drawCentredString(x + w / 2, y + 3.5 * mm, unten)

def main():
    base = sys.argv[1].rstrip('/') + '/'
    apps = json.load(open(sys.argv[2], encoding='utf-8'))
    out = sys.argv[3]; titel = sys.argv[4] if len(sys.argv) > 4 else 'Lernleiter-Apps · QR-Codes'
    c = canvas.Canvas(out, pagesize=A4); W, H = A4
    eintraege = [dict(url=base, oben='Apps', titel='Übersicht', unten=base, farbe='#1E5BD8')]
    for a in apps:
        eintraege.append(dict(url=base + a['pfad'], oben=a['karte'], titel=a['titel'],
                              unten=f"{LLNAME.get(a['lernleiter'], a['lernleiter'])} · Milestone {a['milestone']}",
                              farbe=COL.get((a['lernleiter'], a['milestone']), '#1E5BD8')))
    m = 12 * mm; gap = 8 * mm; cw = (W - 2 * m - gap) / 2; ch = 118 * mm
    for i, e in enumerate(eintraege):
        if i % 4 == 0:
            if i: c.showPage()
            c.setFont('AB', 18); c.setFillColor(INK); c.drawString(m, H - 15 * mm, titel)
            c.setFont('A', 10); c.drawString(m, H - 21 * mm, 'Du scannst den Code mit der Kamera des iPads. Die App öffnet sich.')
        k = i % 4; x = m + (k % 2) * (cw + gap); y = H - 28 * mm - (k // 2 + 1) * ch - (k // 2) * 6 * mm
        karte(c, x, y, cw, ch, **e)
    c.save(); print('QR-Blatt:', out)

main()
