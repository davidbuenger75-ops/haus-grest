# Haus Grest

Horror-Text-Adventure im Spielbuch-Stil.

**Spielen:** `index.html` doppelklicken – öffnet sich im Browser.

**Weiterentwickeln:** In diesem Ordner Claude Code starten (`claude`). Claude liest automatisch `CLAUDE.md`.

## Ordner

| Ordner/Datei | Inhalt |
|---|---|
| `CLAUDE.md` | Regeln und Projektwissen für Claude Code |
| `docs/spielbibel.md` | Story, Figuren, Zeitleiste, Ermittlungsstränge |
| `docs/lager-schmidt.md` | Vorlage für den Schauplatz Lager Schmidt |
| `index.html` | Startseite des Spiels |
| `css/` | Aussehen |
| `js/engine/` | Spieltechnik: `parser.js` (Wortschatz), `aktionen.js` (was Verben bewirken), `welt.js`, `zustand.js` (Speichern), `zeit.js`, `reisen.js`, `handy.js`, `spuk.js`, `proben.js` (Würfel), `buch.js` (Tagebuch), `medien.js` (Bild- und Sounddateien), `spiel.js` (Ablauf), `anzeige.js` (Oberfläche) |
| `js/content/` | Spielinhalt: `allgemein.js` (Werte, Texte), `prolog.js`, `handy.js`, `schauplaetze.js`, `lager-schmidt.js`, `erdgeschoss.js` (Haus Grest), `spuk.js`, `hinweise.js` + `hinweise-lager.js` (Notizbuch), `bilder.js` (Zeichnungen), `medien.js` (Fundstücke, Geräusche) |
| `js/main.js` | Startet das Spiel |
| `assets/bilder/` | Bilddateien (optional, Namen siehe `docs/medien-liste.md`) |
| `assets/sound/` | Sounddateien (optional, Namen siehe `docs/medien-liste.md`) |
| `docs/medien-liste.md` | Alle erwarteten Bild- und Sounddateien mit Prompt-Vorschlägen |
