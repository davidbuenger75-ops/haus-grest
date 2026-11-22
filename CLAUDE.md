# Projekt: Haus Grest – Horror-Text-Adventure

Ein Spukhaus-Horror-Abenteuer als Mischung aus **Spielbuch** (Fighting Fantasy, vor allem „House of Hell“) und **Parser-Text-Adventure** (Magnetic Scrolls, „Guild of Thieves“), mit Illustrationen. Autor: David. Er ist kein Programmierer, aber erfahrener Spielleiter. Erkläre technische Schritte kurz und verständlich, auf Deutsch.

Die Geschichte, Figuren, Zeitleiste und Ermittlungsstränge stehen in **`docs/spielbibel.md`**. Diese Datei ist die Quelle der Wahrheit für den Inhalt. Lies sie, bevor du Inhalte schreibst, und trage neue Festlegungen dort ein.

## Technik-Regeln

- Reines **HTML, CSS und JavaScript**. Kein Framework, kein Build-Schritt, keine npm-Pakete.
  - **Ausnahme `tools/`:** Hilfswerkzeuge für den Autor (Node-Skripte) dürfen npm-Pakete nutzen. Sie gehören nicht zum Spiel; `index.html` und `js/` binden nie etwas aus `tools/` ein.
  - `tools/bilder.js` erzeugt Bildkandidaten über die Gemini API (Modell `gemini-nano-banana-2.1`, Interactions-API) aus `docs/medien-liste.md` nach `assets/bilder/_kandidaten/`; `tools/auswahl.html` (bzw. `node tools/bilder.js auswahl`) übernimmt die beste Variante. API-Key nur aus der Umgebungsvariable `GEMINI_API_KEY` – nie in Dateien schreiben oder ausgeben. Vor jedem Lauf Anzahl und Kosten zeigen und David fragen. Standard: **2 Kandidaten pro Bild** (Konstante `VARIANTEN` im Skript).
  - Ablauf: immer zuerst das **Tagbild**; Nacht-, Abend-, Spuk- und andere Varianten (Tabelle 1b der Medienliste) werden per Bildbearbeitung aus dem übernommenen Tagbild abgeleitet.

## Bildstil (festgelegt 22.11.2026, „Stil B“)

- **Räume, Schauplätze, Tagebuchskizzen:** „halbrealistische digitale Ölmalerei, dunkle Gothic-Horror-Atmosphäre, sichtbare Pinselstriche, gedämpfte Farben, starke Licht-Schatten-Kontraste, kein Text“ + Stil-Referenzbild `assets/bilder/_stil.png` (die gewählte Eingangshalle).
- **Fundstücke** (Fotos, Zeitungsausschnitte, Dokumente): „realistisches Foto eines echten Dokuments bzw. alten Fotos, Gebrauchsspuren, natürliches Licht“; bei lesbaren Dingen „Schrift nur angedeutet und unleserlich“ statt „kein Text“.
- Die Stil-Bausteine stehen maßgeblich in `docs/medien-liste.md`; Prompts in den Tabellen beschreiben nur das Motiv. Ausnahme für gewollten Text im Bild: Prompt endet mit „– Text im Bild: …“ (z. B. Schild „LAGER SCHMIDT“).
- Bildmotive müssen zum Spieltext passen; bei Abweichungen David fragen, ob Bild oder Text angepasst wird.
- Das Spiel muss per **Doppelklick auf `index.html`** im Browser laufen (file://). Deshalb **keine ES-Module** (`import`/`export`) und kein `fetch` von lokalen Dateien. Dateien werden über normale `<script src>`-Tags in `index.html` eingebunden, die Reihenfolge ist wichtig: erst `js/engine/`, dann `js/content/`, zuletzt `js/main.js`.
- Gemeinsamer globaler Namensraum: `window.HG` (z. B. `HG.parser`, `HG.world`, `HG.content`).
- **Engine und Inhalt strikt trennen:**
  - `js/engine/` – Parser, Weltmodell, Spielzustand, Anzeige, Speichern. Enthält keine Story-Texte.
  - `js/content/` – Räume, Gegenstände, Figuren, Hinweise, Ereignisse als Daten. Eine Datei pro Bereich des Hauses bzw. pro Thema (z. B. `erdgeschoss.js`, `hinweise.js`).
  - Neue Spiellogik möglichst als allgemeine Engine-Funktion bauen, die der Inhalt per Daten nutzt – keine Sonderfälle im Engine-Code für einzelne Räume.
- Spielzustand ist **ein serialisierbares Objekt** (nur Daten, keine Funktionen), damit Speichern/Laden per `localStorage` funktioniert (immer in `try/catch`). Bei Änderungen am Zustandsformat eine Versionsnummer hochzählen.
- Illustrationen: handgezeichnete **SVG-Szenen im Code** (Federzeichnungs-Stil) als Rückfall; optional **Bilddateien** in `assets/bilder/` und **Sound** in `assets/sound/` nach festen Dateinamen (siehe `docs/medien-liste.md`). Fehlende Dateien werden still ignoriert. Neue Räume, Fundstücke oder Spuk-Ereignisse auch in `docs/medien-liste.md` nachtragen.
- Barrierearm: Texte gut lesbar, Animationen respektieren `prefers-reduced-motion`.

## Engine-Aufbau (Stand 22.11.2026)

- `js/engine/grundlagen.js` – `HG.raum/ding/hinweis/schluss/bild/spielDaten` (Register), Textwerkzeuge, deutsche Artikel/Adjektivendungen (`HG.text`), Würfel.
- `js/engine/zustand.js` – Spielzustand (`HG.zustand.z`, Version `VERSION`), Speichern/Laden in `localStorage`, Rückgängig. Verschieben sich Inhalte (z. B. Buchseiten), hängt der Inhalt einen eigenen Migrationsschritt an: `HG.zustand.migration(v, fn)`. Beim Laden fliegen Hinweise/Schlüsse heraus, die es nicht mehr gibt.
- `js/engine/welt.js` – Orte, Sichtbarkeit, Licht/Dunkelheit, Raumbeschreibung, Verstecke (`versteckt: {bei, wie:[...]}`), Kartendaten.
- `js/engine/parser.js` – Verb-Tabelle `VERBEN` (neue Verben/Synonyme hier eintragen), Zerlegen, Objekt-Auflösung mit Rückfragen.
- `js/engine/aktionen.js` – allgemeines Verhalten jeder Handlung. Inhalte übersteuern per `bei: { aktion: function (api, ctx) {...; return true;} }` oder `texte: { aktion: '...' }`. Dinge mit Rückseite: `rueckseite: { beschreibung, schrift: true }` („dreh … um“, Bild `ding-<id>-rueckseite`, Untersuchen zeigt die Vorderseite).
- `js/engine/zeit.js` – Uhrzeit und Datum (`z.zeit = {tag, minute}`), Tageszeit daraus (Morgen 6–11, Mittag 11–17, Abend 17–22, Nacht 22–6), Minuten pro Handlung (Tabelle `DAUER`, pro Ding `dauer: {lesen: 20}`), Öffnungszeiten `{ von, bis, tage: 'werktags' }`, warten/schlafen. Texte können Tageszeit-Objekte sein: `{ tag, abend, nacht, sonst }`.
- `js/engine/proben.js` – Prozentproben (W100) allgemein: `api.probe(wert|zahl, opt)`, `api.nervenProbe('1/1W6', {grund})`; Nacht-Malus im Haus, Schock ab 5 Punkten. Ausgabe als animierter Würfelblock.
- `js/engine/buch.js` – Bücher zum Blättern (`buch: { titel, seiten: [...] }` an einem Ding); Befehle „lies eintrag 3“, „blättere weiter“; Lese-Ansicht in der Oberfläche.
- `js/engine/reisen.js` – Reiseziele (`HG.ziel`), Öffnungszeiten, Spielbuch-Zielauswahl. Räume haben `schauplatz`, Abfahrt nur aus Räumen mit `abfahrt: true`. Hinweise schalten Ziele frei (`schaltetFrei`).
- `js/engine/handy.js` – Handy (Ding mit `istHandy`): `HG.nachricht`, `HG.anruf`, `HG.kontakt`, Fotos (`foto`-Text an Dingen/Räumen). Auslösen per `api.nachricht/anruf`.
- `js/engine/macht.js` – **MACHT** des Hauses (unsichtbar, `z.macht`; NERVEN-Verlust lädt auf, Spuk und gefälschte Nachrichten/Anrufe kosten; wirkt indirekt auf Spuk-Häufigkeit und NERVEN-Proben) und **Spiegel** (`spiegel: 'winzig|klein|gross|spiegelzimmer'` an Dingen/Räumen, Spuk mit `spiegel:` braucht einen intakten Spiegel; zerbrochene Spiegel erneuern sich über Nacht). Alle Werte in `js/content/macht.js`. API: `api.machtStufe()`, `api.hausHandelt(art)`, `api.spiegel(min)`.
- `js/engine/spuk.js` – Grusel-Baukasten `HG.spuk(...)` (Geruch, Geräusch, Illusion, bewegen, erscheinen, Nachricht, Anruf), zufällig pro Zug oder per `api.spuk('id')`.
- `js/engine/spiel.js` – Ablauf, Meta-Befehle, Notizbuch, Vorschläge, `HG.api` (Werkzeugkasten für Inhalte: `sage`, `abschnitt`, `nerven`, `hinweis`, `flag`, `zaehle` …). Notizbuch gruppiert nach `strang` (Gruppen in `HG.daten.spiel.straenge`); `z.gesehen` merkt angesehene Hinweise, `z.getan` Gelesenes/Untersuchtes für die Menüs („Bereits gelesen“, Tabelle `ERLEDIGT_MENUE`).
- `js/engine/medien.js` – Bilder (`raum-<id>[-variante][-abend|-nacht]`, `ort-<schauplatz>`, `ding-<id>`, `ding-<id>-<seite>`) und Sound (Schleife `ort-<schauplatz>[-nacht]`, Effekte `effekt-<name>`, `api.sound(name)`, Spuk spielt `effekt-spuk-<id>`). Lautstärke/Stumm im Browser gespeichert, nicht im Spielstand.
- `js/engine/anzeige.js` – Browser-Oberfläche. Handytauglich: unter 860 px Reiter unten (Werte/Inventar/Notizen/Handy) und die Seitenleiste als Blatt; antippbare Wörter im Text (Menü aus `HG.spiel.aktionenFuer(id)`, abgeleitet aus Ding-Eigenschaften), Verb-Leiste mit Richtungstasten, Autovervollständigung (`HG.spiel.ergaenze`, Befehlsliste `HG.parser.VERB_LISTE`). Hover-Effekte nur in `@media (hover: hover)`.
- Web-App: `manifest.webmanifest`, `sw.js` (offline, liest die Dateiliste aus index.html; nach Änderungen `VERSION` hochzählen), Icons in `assets/icons/`. Beides nur aktiv über http(s); per Doppelklick (file://) bleibt alles wie bisher.
- Platzhalter in allen Texten: `{name} {vorname} {nachname} {anrede} {briefanrede}` und `{g:männlich|weiblich|ohne Angabe}`; im Code `HG.g(m, w, d)` bzw. `api.g(...)`.
- Raum-Haken: `vorBetreten` (vor der Beschreibung), `beimBetreten`, `jedeRunde` (nach dem Voranschreiten der Zeit); Dinge mit `imDunkeln: true` findet man auch im Dunkeln.
- Inhalt: `allgemein.js` (Charaktererstellung, Startwerte, Texte), `prolog.js` (Wohnung, Notarbrief), `handy.js` (Handy, Kontakte, Nachrichten, Anrufe), `schauplaetze.js` (Bauamt, Polizei … als Platzhalter), `lager-schmidt.js` (vollständiger Schauplatz, Vorlage `docs/lager-schmidt.md`), `hinweise-lager.js`, `erdgeschoss.js` (Haus Grest), `spuk.js`, `hinweise.js`, `bilder.js` (SVG-Szenen), `medien.js` (welche Dinge Fundstücke mit Bild sind, Geräusche an Dingen, Bildvarianten).

## Parser – Ziele

Deutlich mächtiger als im Vorgängerprojekt „Die Glocke von Kesselmoor“:

- Großer Verb-Wortschatz mit Synonymen: untersuche, durchsuche, nimm, lege/stelle … in/auf …, öffne/schließe, schließe … mit … auf/ab, drücke/ziehe/drehe/schiebe, lies, zünde an/lösche, horche/lausche, rieche, taste/fühle, klopfe, zerbrich, reiße, kletter, verstecke dich, warte, sprich mit / frage … nach …, zeige … (jemandem), gib, benutze/kombiniere … mit …, schreibe, schau in/unter/hinter …
- Objekte mit Adjektiven („rostiger Schlüssel“) und Rückfragen bei Mehrdeutigkeit („Welchen meinst du …?“).
- Pronomen „es/ihn/sie“ für das zuletzt Genannte, „alles“, Mehrfachbefehle mit „und“ bzw. „dann“.
- Behälter und Ablagen (Schubladen, Truhen, Regale), verborgene Dinge (unter dem Teppich, hinter dem Bild).
- Licht und Dunkelheit, verschlossene Türen, Schlüssel.
- Meta-Befehle: hilfe, inventar (i), notizbuch, karte, schau (l), speichern, laden, rückgängig.
- Zusätzlich anklickbare Vorschläge wie im Spielbuch – Tippen bleibt aber die Hauptbedienung.

## Spielmechanik (Stand: Entwurf, siehe Spielbibel)

- Werte im Fighting-Fantasy-Stil: GESCHICK, AUSDAUER, **NERVEN** (sinkt bei Schrecken; bei 0 ist das Spiel verloren).
- **Notizbuch** mit gefundenen Hinweisen; Hinweise lassen sich zu Schlussfolgerungen kombinieren, die neue Wege freischalten.
- Nummerierte Abschnitte bei wichtigen Ereignissen als Spielbuch-Anspielung.

## Stil

- Alle Texte und die Oberfläche auf **Deutsch**. Erzählt in der 2. Person („Du …“), Präsens.
- Atmosphäre: schleichender, viktorianisch-gotischer Horror; Andeutungen statt Splatter.
- Die Hexe heißt im Erzähltext „die Krähe“. Historische Figuren dürfen zeitgemäß sprechen, der Erzähler vermeidet abwertende Volksgruppen-Bezeichnungen.

## Arbeitsweise

- Kleine Schritte; nach jeder Änderung muss das Spiel weiterhin laufen.
- Nach größeren Änderungen das Spiel im Browser testen (oder mit einem kurzen automatischen Durchlauf).
- Inhalte nicht erfinden, die der Spielbibel widersprechen. Bei offenen Story-Fragen David fragen oder als Vorschlag markieren.
