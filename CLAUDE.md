# Projekt: Haus Grest – Horror-Text-Adventure

Ein Spukhaus-Horror-Abenteuer als Mischung aus **Spielbuch** (Fighting Fantasy, vor allem „House of Hell“) und **Parser-Text-Adventure** (Magnetic Scrolls, „Guild of Thieves“), mit Illustrationen. Autor: David. Er ist kein Programmierer, aber erfahrener Spielleiter. Erkläre technische Schritte kurz und verständlich, auf Deutsch.

Die Geschichte, Figuren, Zeitleiste und Ermittlungsstränge stehen in **`docs/spielbibel.md`**. Diese Datei ist die Quelle der Wahrheit für den Inhalt. Lies sie, bevor du Inhalte schreibst, und trage neue Festlegungen dort ein.

## Technik-Regeln

- Reines **HTML, CSS und JavaScript**. Kein Framework, kein Build-Schritt, keine npm-Pakete.
  - **Ausnahme `tools/`:** Hilfswerkzeuge für den Autor (Node-Skripte) dürfen npm-Pakete nutzen. Sie gehören nicht zum Spiel; `index.html` und `js/` binden nie etwas aus `tools/` ein.
  - `tools/bilder.js` erzeugt Bildkandidaten über die Gemini API (Modell `gemini-nano-banana-2.1`, Interactions-API) aus `docs/medien-liste.md` nach `assets/bilder/_kandidaten/`; `tools/auswahl.html` (bzw. `node tools/bilder.js auswahl`) übernimmt die beste Variante. API-Key nur aus der Umgebungsvariable `GEMINI_API_KEY` – nie in Dateien schreiben oder ausgeben. Vor jedem Lauf Anzahl und Kosten zeigen und David fragen. Standard: **2 Kandidaten pro Bild** (Konstante `VARIANTEN` im Skript).
  - `tools/grundriss.js` zeichnet aus `js/content/grundriss.js` die Grundriss-Vorlagen (SVG + PNG per Chrome/Edge headless) nach `assets/bilder/_vorlagen/`; Tabelle 2b der Medienliste macht daraus per Bildbearbeitung die Bauplan-Fotos (Anweisung wörtlich).
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
- `js/engine/welt.js` – Orte, Sichtbarkeit, Licht/Dunkelheit, Raumbeschreibung, Verstecke (`versteckt: {bei, wie:[...], nurOffen, auchBei: { anderesDing: ['unter','anheben','nehmen'] }, andeutung: ['hart','schwer']}`), Kartendaten. **Deutet ein Text auf Verstecktes hin** („etwas Hartes unter dem Foto“), bekommt es `andeutung` (Wörter/Adjektivstämme – „nimm etwas hartes“, „untersuche das harte“ finden es) und `auchBei` (über das andere Ding zu finden: „schau unter foto“, „heb foto hoch“, „nimm foto heraus“). Feste Teile eines Dings (`rel: 'teil'`, z. B. Leiste, Schlitz) sind immer mit ihm sichtbar; geschlossene Behälter verbergen ihren Inhalt auch auf Ablagen.
- `js/engine/parser.js` – Verb-Tabelle `VERBEN` (neue Verben/Synonyme hier eintragen), Zerlegen, Objekt-Auflösung mit Rückfragen. Passt eine Wortfolge samt „von …“ auf ein Ding („nimm den Brief von 1905“), ist sie ein Objekt – keine Präposition. Gleichnamige Dinge unterscheidet ein Namenszusatz `zusatz: 'von 1905'` (erscheint im Namen, seine Wörter treffen das Ding). Rückfragen bei Mehrdeutigkeit für alle Verben gleich (Vorlieben in `VORLIEBE`, spiel.js, sortieren nur Unmögliches aus).
- `js/engine/aktionen.js` – allgemeines Verhalten jeder Handlung. Inhalte übersteuern per `bei: { aktion: function (api, ctx) {...; return true;} }` oder `texte: { aktion: '...' }`. Dinge mit Rückseite: `rueckseite: { beschreibung, schrift: true }` („dreh … um“, Bild `ding-<id>-rueckseite`, Untersuchen zeigt die Vorderseite). **Zahlenschloss** an Dingen: `zahlenschloss: { stellen, code, bereit(api), richtig(api), falsch }` („drehe ringe auf 1205“, „tippe 1205“; Teile verweisen mit `teilVon`). Werkzeug-Dinge tragen `werkzeug: 1|2`.
- `js/engine/zeit.js` – Uhrzeit und Datum (`z.zeit = {tag, minute}`), Tageszeit daraus (Morgen 6–11, Mittag 11–17, Abend 17–22, Nacht 22–6), Minuten pro Handlung (Tabelle `DAUER`, pro Ding `dauer: {lesen: 20}`), Öffnungszeiten `{ von, bis, tage: 'werktags' }`, warten/schlafen. Texte können Tageszeit-Objekte sein: `{ tag, abend, nacht, sonst }`.
- `js/engine/proben.js` – Proben nach Delta Green: `api.probe('st')` (Eigenschaft × 5), `api.probe('handwerk', { mod, grund, beruf: { handwerk: 0 | 'auto' } })`, `api.probe('nerven')`; Kritisch = Pasch/01 unter dem Ziel, Patzer = Pasch/100 darüber; schwer verletzt −20 auf körperliche Proben. `api.nervenProbe('1/1W6', {grund})`, Nacht-Malus im Haus, Schock ab 5 Punkten. Gestaffelte Hinweise: `api.fehlversuch` (spiel.js, siehe Rätsel-Grundsätze). Ausgabe als animierter Würfelblock. **Proben per Daten** am Ding: `proben: { aktion: { wer, mod, erfolg, misserfolg, kritisch, patzer, wenn, einmal } }` (Zweige: Text oder Funktion).
- `js/engine/charakter.js` – **Charakter**: sechs Eigenschaften (würfeln 4W6-beste-3 oder 72 Punkte verteilen), Fertigkeiten (Basis + Beruf), Beruf mit `vorteile` (`api.hatVorteil('mechanik')`), LP = (ST+AU)/2, NERVEN 80, WP = WI. Verletzungen `api.verletze('1W4', {grund})` mit Wunden-Liste, Erste Hilfe einmal pro Wunde („versorge wunde“), `api.heile`, `api.vollHeilen` (Krankenhaus), `api.willenskraft(kosten)`. Alle Zahlen/Namen in `js/content/allgemein.js`.
- `js/engine/buch.js` – Bücher zum Blättern (`buch: { titel, seiten: [...] }` an einem Ding); Befehle „lies eintrag 3“, „blättere weiter“; Lese-Ansicht in der Oberfläche. Gesperrte Seiten (`gesperrt: { frei, text }`) und „entziffere …“ (`buch.entziffern: { wer, mod, tipps }`).
- `js/engine/reisen.js` – Reiseziele (`HG.ziel`), Öffnungszeiten, Spielbuch-Zielauswahl. Räume haben `schauplatz`, Abfahrt nur aus Räumen mit `abfahrt: true`. Hinweise schalten Ziele frei (`schaltetFrei`).
- `js/engine/handy.js` – Handy (Ding mit `istHandy`): `HG.nachricht`, `HG.anruf`, `HG.kontakt`, Fotos (`foto`-Text an Dingen/Räumen). Auslösen per `api.nachricht/anruf`. Dokumente (`dokument: true`) werden fotografiert statt eingesteckt; Galerie mit „lies foto 3“.
- `js/engine/macht.js` – **MACHT** des Hauses (unsichtbar, `z.macht`; NERVEN-Verlust lädt auf, Spuk und gefälschte Nachrichten/Anrufe kosten; wirkt indirekt auf Spuk-Häufigkeit und NERVEN-Proben) und **Spiegel** (`spiegel: 'winzig|klein|gross|spiegelzimmer'` an Dingen/Räumen, Spuk mit `spiegel:` braucht einen intakten Spiegel; zerbrochene Spiegel erneuern sich über Nacht). Alle Werte in `js/content/macht.js`. API: `api.machtStufe()`, `api.hausHandelt(art)`, `api.spiegel(min)`.
- `js/engine/spuk.js` – Grusel-Baukasten `HG.spuk(...)` (Geruch, Geräusch, Illusion, bewegen, erscheinen, Nachricht, Anruf), zufällig pro Zug oder per `api.spuk('id')`. **Bei Tag selten** (`spukTagFaktor` in allgemein.js, pro Ereignis `tagFaktor`), nachts häufiger. **Gewöhnung:** Wer die NERVEN-Probe eines Ereignisses einmal bestanden hat, würfelt dafür nicht mehr (`gewoehnung: false` schaltet ab; allgemein `api.nervenProbe(spec, { gewoehnung: 'schlüssel' })`). Jeder Raum im Haus braucht eine Tag- und eine Nacht-Erscheinung (der Test prüft das).
- `js/engine/spiel.js` – Ablauf, Meta-Befehle, Notizbuch, Vorschläge, `HG.api` (Werkzeugkasten für Inhalte: `sage`, `abschnitt`, `nerven`, `hinweis`, `flag`, `zaehle` …). Notizbuch gruppiert nach `strang` (Gruppen in `HG.daten.spiel.straenge`); `z.gesehen` merkt angesehene Hinweise, `z.getan` Gelesenes/Untersuchtes für die Menüs („Bereits gelesen“, Tabelle `ERLEDIGT_MENUE`).
- `js/engine/medien.js` – Bilder (`raum-<id>[-variante][-abend|-nacht]`, `ort-<schauplatz>`, `ding-<id>`, `ding-<id>-<seite>`) und Sound (Schleife `ort-<schauplatz>[-nacht]`, Effekte `effekt-<name>`, `api.sound(name)`, Spuk spielt `effekt-spuk-<id>`). Lautstärke/Stumm im Browser gespeichert, nicht im Spielstand.
- `js/engine/plan.js` – **Baupläne**: `HG.bauplan(id, {...})` (Stockwerke mit Räumen/Türen/Fenstern/Treppen in Metern) → SVG-Grundriss im Stil von 1899 (`HG.plan.svg`) und Lage der Räume fürs Overlay. Ein Ding mit `plan: 'haus'` öffnet beim Untersuchen die Plan-Ansicht; danach ist der Plan im Schauplatz die Karte („karte“). Unbesuchte Räume zeigen den Namen aus dem Plan. Blätter als Foto: `ding-<ding>-<stockwerk>`, sonst die Zeichnung. Handschriftliche Anmerkungen eines Plan-Dings (`planNotizen: [{ stock, raum, kreis, text, l: [x,y] }]`, z. B. Carstens Kopie im Lager) liegen als Text über der Karte – nur, wenn man dieses Ding angesehen hat.
- `js/engine/anzeige.js` – Browser-Oberfläche. Handytauglich: unter 860 px Reiter unten (Werte/Inventar/Notizen/Handy) und die Seitenleiste als Blatt; antippbare Wörter im Text (Menü aus `HG.spiel.aktionenFuer(id)`, abgeleitet aus Ding-Eigenschaften), Verb-Leiste mit Richtungstasten, Autovervollständigung (`HG.spiel.ergaenze`, Befehlsliste `HG.parser.VERB_LISTE`). Hover-Effekte nur in `@media (hover: hover)`. **Nahansicht** für Dinge mit `nahansicht: { groesse, svg(api), bereiche: [{ titel, r, befehl }], ringe }` – jeder Klick löst einen normalen Befehl aus, die Antwort erscheint im Dialog. Charakterbogen in der Seitenleiste (Handy: Reiter „Werte“).
- Web-App: `manifest.webmanifest`, `sw.js` (offline, liest die Dateiliste aus index.html; nach Änderungen `VERSION` hochzählen), Icons in `assets/icons/`. Beides nur aktiv über http(s); per Doppelklick (file://) bleibt alles wie bisher.
- Platzhalter in allen Texten: `{name} {vorname} {nachname} {anrede} {briefanrede}` und `{g:männlich|weiblich|ohne Angabe}`; im Code `HG.g(m, w, d)` bzw. `api.g(...)`.
- Raum-Haken: `vorBetreten` (vor der Beschreibung), `beimBetreten`, `jedeRunde` (nach dem Voranschreiten der Zeit); Dinge mit `imDunkeln: true` findet man auch im Dunkeln. `api.verweilt('haus')` = Minuten heute an einem Schauplatz (für die Ablenkungen des Hauses bei Tag: gefälschte Anrufe/Nachrichten), `api.istTag()`. Verschlossene Türen/Behälter geben gestaffelte Hinweise mit `tipps: { verschlossen: { 2: …, 3: … } }`. Neue Verben: „öle … (mit …)“ (Ding mit `oel: true`), „spiele …“ (`spielen`-Text oder `bei.spielen`).
- Inhalt: `allgemein.js` (Charaktererstellung, Startwerte, Texte), `prolog.js` (Wohnung, Notarbrief), `handy.js` (Handy, Kontakte, Nachrichten, Anrufe), `schauplaetze.js` (Bauamt mit Frau Pohl und Bauakte; Polizei, Friedhof … noch Platzhalter), `lager-schmidt.js` (vollständiger Schauplatz, Vorlage `docs/lager-schmidt.md`), `hinweise-lager.js`, `erdgeschoss.js` (Haus Grest: Einfahrt, Halle, Garderobe, Arbeitszimmer, Flur), `erdgeschoss-nord.js` (Hinterdiele, Dienstbotenzimmer mit Rätsel „Der Riegel“, Anrichte/Gäste-WC, Küche, Speisekammer), `erdgeschoss-ost.js` (Speisezimmer, Salon, Wintergarten mit Rätsel „Carstens Wintergarten“), `grundriss.js` (Bernwards Bauplan 1899 = Karte des Hauses, Originalzustand), `kaestchen.js` (Rätsel „Bernwards Kästchen“ in Lager Schmidt), `spuk.js`, `hinweise.js`, `bilder.js` (SVG-Szenen), `medien.js` (welche Dinge Fundstücke mit Bild sind, Geräusche an Dingen, Bildvarianten).

## Parser – Ziele

Deutlich mächtiger als im Vorgängerprojekt „Die Glocke von Kesselmoor“:

- Großer Verb-Wortschatz mit Synonymen: untersuche, durchsuche, nimm, lege/stelle … in/auf …, öffne/schließe, schließe … mit … auf/ab, drücke/ziehe/drehe/schiebe, lies, zünde an/lösche, horche/lausche, rieche, taste/fühle, klopfe, zerbrich, reiße, kletter, verstecke dich, warte, sprich mit / frage … nach …, zeige … (jemandem), gib, benutze/kombiniere … mit …, schreibe, schau in/unter/hinter …
- Objekte mit Adjektiven („rostiger Schlüssel“) und Rückfragen bei Mehrdeutigkeit („Welchen meinst du …?“).
- Pronomen „es/ihn/sie“ für das zuletzt Genannte, „alles“, Mehrfachbefehle mit „und“ bzw. „dann“.
- Behälter und Ablagen (Schubladen, Truhen, Regale), verborgene Dinge (unter dem Teppich, hinter dem Bild).
- Licht und Dunkelheit, verschlossene Türen, Schlüssel.
- Meta-Befehle: hilfe, inventar (i), notizbuch, karte, schau (l), speichern, laden, rückgängig.
- Zusätzlich anklickbare Vorschläge wie im Spielbuch – Tippen bleibt aber die Hauptbedienung.

## Spielmechanik (siehe Spielbibel, Abschnitt 6, Rätsel-Grundsätze 6b)

- Regelsystem nach **Delta Green** (Spielbibel 6): Eigenschaften ST, AU, GE, VE, WI, AS (Probe = Wert × 5 %), Fertigkeiten in Prozent, Beruf, **LP** (bei 0 tot), **NERVEN** (Start 80; bei 0 ist das Spiel verloren), **WP**. Misslungene Proben führen nie in eine Sackgasse.
- **Notizbuch** mit gefundenen Hinweisen; Hinweise lassen sich zu Schlussfolgerungen kombinieren, die neue Wege freischalten.
- Nummerierte Abschnitte bei wichtigen Ereignissen als Spielbuch-Anspielung.

## Rätsel – Grundsätze (Spielbibel 6b)

- **Dichte begrenzen** (David, 22.11.2026): pro Raum höchstens **ein zentrales Rätsel** und **2–3 wichtige Funde**; pro Besuch eines Schauplatzes möglichst **nicht mehr als 5 neue Notizbuch-Einträge**. Lieber Funde auf andere Orte verteilen (in der Spielbibel vormerken) als einen Ort überladen.
- **Dokumente** (Zeitungsausschnitte, Kopien, Briefe, Fotos von Fremden) tragen `dokument: true`: „nimm“ oder „fotografiere“ macht ein Handyfoto – das Dokument wird dabei gelesen bzw. betrachtet (mit allen Haken), landet in der Galerie („lies foto 3“) und im Notizbuch, nicht im Inventar. Das ist der Standard für alle Papiere – auch in einem getragenen Behälter (z. B. der Brief im Kästchen). Ins Inventar kommen nur echte Gegenstände (Waffe, Werkzeug, Zirkel, Kästchen, Tagebuch, Taschenspiegel …). **Tragkraft** `tragkraft` (allgemein.js, 12) gilt für jedes In-die-Hand-Nehmen; Handy, Schlüssel und Dinge mit `klein: true` zählen nicht.
- **Lange Texte staffeln:** Bücher können Seiten sperren (`gesperrt: { frei(api), text }`, „entziffere …“ per Probe, siehe buch.js). Ein Buch erzeugt nur wenige zusammenfassende Notizbuch-Hinweise; die Einzelheiten bleiben im Buch nachlesbar.

- Hinweise liegen in der Welt (Daten, Namen, Gravuren, Briefe); jede nötige Information an mindestens drei Stellen.
- Mehrstufig und mit mehreren Wegen: Kopf (sauberster Weg), Fertigkeit (Probe), Gewalt (mit Folgen). Kein Weg endet in einer Sackgasse.
- Alles per Texteingabe lösbar; eine Nahansicht ist Zusatz, nie Pflicht.
- **Gestaffelte Hinweise nach Fehlversuchen:** Jedes Rätsel bekommt beim 2. und 3. vergeblichen Versuch zunehmend deutlichere Hinweise (der dritte nennt notfalls den Befehl). Allgemein über `api.fehlversuch('schluessel', { 2: '…', 3: '…' })` – Texte oder `function (api, n)`, damit der Hinweis zum aktuellen Stand passt; ab der höchsten Stufe wiederholt sich der deutlichste. Eingebaut im Zahlenschloss (`zahlenschloss.tipps: { gesperrt, falsch }`) und in Proben per Daten (`proben: { aktion: { …, tipps } }`). Anzeige als eigener Block „tipp“. Beispiel: `js/content/kaestchen.js`.

## Stil

- Alle Texte und die Oberfläche auf **Deutsch**. Erzählt in der 2. Person („Du …“), Präsens.
- Atmosphäre: schleichender, viktorianisch-gotischer Horror; Andeutungen statt Splatter.
- Die Hexe heißt im Erzähltext „die Krähe“. Historische Figuren dürfen zeitgemäß sprechen, der Erzähler vermeidet abwertende Volksgruppen-Bezeichnungen.

## Arbeitsweise

- Kleine Schritte; nach jeder Änderung muss das Spiel weiterhin laufen.
- Nach größeren Änderungen das Spiel im Browser testen – und **`node tools/test.js`** laufen lassen (automatischer Durchlauf ohne Browser: Prolog → Lager → Kästchen auf allen drei Wegen → Brief → Zirkel → Bauplan-Kopie → Erdgeschoss: Räume, Riegel und Wintergarten auf allen Wegen, Nacht, Ablenkungen, Gewöhnung; prüft außerdem, dass jeder Befehl aus Menüs und Vorschlägen funktioniert; `-v` zeigt die ganze Spielausgabe). Neue Schauplätze dort mit aufnehmen.
- Inhalte nicht erfinden, die der Spielbibel widersprechen. Bei offenen Story-Fragen David fragen oder als Vorschlag markieren.
