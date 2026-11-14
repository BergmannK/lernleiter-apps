# Lernleiter-Apps

Interaktive Partner-Apps zu den Lernleitern Mathematik (ZR 100, ZR 1000 Teil A „Orientierung“, ZR 1000 Teil B „Rechnen“).
Online: https://bergmannk.github.io/lernleiter-apps/

- `index.html` – Startseite für die Lehrkraft (alle Apps)
- `zr100/`, `zr1000a/`, `zr1000b/` – eine App pro Karte (`7p-2` = Karte 7+.2); die QR-Codes auf den Karten zeigen auf diese Adressen
- `audio/` – Sprachaufnahmen je App (`<ordner>-<karte>.pak`, Stimmen Ryan/Serena); fehlt eine Aufnahme, spricht die Computerstimme
- `src/` – Quellcode; neu bauen mit `python3 src/build.py .` (schreibt die Apps in den angegebenen Ordner)
