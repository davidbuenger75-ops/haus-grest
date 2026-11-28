// Haus Grest – automatischer Testdurchlauf (Hilfswerkzeug für den Autor, gehört nicht zum Spiel)
//
//   node tools/test.js            alle Tests
//   node tools/test.js -v         dazu die komplette Spielausgabe
//
// Lädt Engine und Inhalt wie index.html (ohne Oberfläche) in eine Node-Sandbox und spielt:
// Prolog → Lager Schmidt → Kästchen auf allen drei Wegen (Code, Werkzeug, Gewalt) → Brief nehmen und lesen
// (auch über die Menüs) → Zirkel über „nimm etwas hartes“ und andere naheliegende Befehle → Carstens Bauplan.
// (…) → Haus, Obergeschoss, Dachboden, Polizeiwache → Keller und Ritualraum (Abschnitt 18)
// Außerdem: Jeder Befehl, den ein Menü (Wort-Menü, Verb-Leiste) oder die Vorschlagsleiste anbietet, muss funktionieren.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WURZEL = path.join(__dirname, '..');
const LAUT = process.argv.includes('-v');

// ------------------------------------------------------------------ Sandbox
function neueWelt() {
  const speicher = {};
  const ctx = {
    console, JSON, Math: Object.create(Math), Date, setTimeout, clearTimeout,
    localStorage: {
      getItem: k => (k in speicher ? speicher[k] : null),
      setItem: (k, v) => { speicher[k] = String(v); },
      removeItem: k => { delete speicher[k]; },
      key: i => Object.keys(speicher)[i], get length() { return Object.keys(speicher).length; }
    },
    navigator: { userAgent: 'node' },
    location: { protocol: 'file:' }
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  const html = fs.readFileSync(path.join(WURZEL, 'index.html'), 'utf8');
  const dateien = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1])
    .filter(f => !/anzeige\.js$|main\.js$/.test(f));   // keine Oberfläche
  for (const f of dateien) vm.runInContext(fs.readFileSync(path.join(WURZEL, f), 'utf8'), ctx, { filename: f });
  return ctx;
}

let fehler = 0, tests = 0;
const PLATZHALTER_RE = /\{(name|vorname|nachname|anrede|briefanrede|g:)[^}]*\}?/;
const UNERSETZT = [];
function pruefe(bed, text) {
  tests++;
  if (bed) { if (LAUT) console.log('  ✓ ' + text); return; }
  fehler++; console.log('  ✗ ' + text);
}

function spieler(ctx) {
  const HG = ctx.HG, log = [];
  // Ein Platzhalter ({name}, {g:…}) darf nie unersetzt sichtbar werden – geprüft in jeder Ausgabe aller Tests
  HG.ausgabe.ziel = b => {
    log.push(b);
    if (b.typ !== 'eingabe' && PLATZHALTER_RE.test(String(b.html || '')) && UNERSETZT.length < 20) UNERSETZT.push(String(b.html).slice(0, 120));
  };
  // Würfel mit festem Startwert – jeder Lauf spielt gleich
  let saat = 12345;
  HG.zufall = () => { saat = (saat * 1103515245 + 12345) % 2147483648; return saat / 2147483648; };
  return {
    HG,
    /** Befehl eingeben, Ausgabe als reiner Text zurück */
    tu(befehl) {
      const start = log.length;
      HG.spiel.eingabe(befehl);
      const neu = log.slice(start).filter(b => b.typ !== 'eingabe');
      const t = neu.map(b => String(b.html || '').replace(/<[^>]+>/g, '')).join('\n');
      if (LAUT) console.log('> ' + befehl + '\n' + t.replace(/^/gm, '    '));
      return t;
    },
    bloecke: log
  };
}

const KAPUTT = /siehst hier nichts dergleichen|kenne ich nicht|verstehe nicht|Diesen Satz verstehe|Fehler in der Engine|Das kann ich \(noch\) nicht|Ich weiß nicht, was du mit/;

/** Neues Spiel bis in die Wohnung, Umschlag geöffnet, Briefe gelesen, Schlüssel eingesteckt. */
function prolog() {
  const ctx = neueWelt();
  const s = spieler(ctx);
  s.HG.spiel.start();
  s.tu('Test Person'); s.tu('Frau'); s.tu('verteilen'); s.tu('12 12 12 12 12 12'); s.tu('1');
  return s;
}

function zumLager(s) {
  s.tu('öffne umschlag');
  s.tu('lies notarbrief'); s.tu('lies testament');
  s.tu('nimm hausschlüssel'); s.tu('nimm lagerschlüssel');
  s.tu('fahre zum lager');
  if (s.HG.zustand.z.raum !== 'lager_tor') s.tu('fahre zu lager schmidt');
  // Büro offen oder Tastenfeld
  let t = s.tu('geh nach osten');
  if (s.HG.zustand.z.raum !== 'lager_gang') { s.tu('tippe 0308'); s.tu('geh nach osten'); }
  s.tu('schließe tür auf'); s.tu('öffne tür'); s.tu('geh nach osten');
  s.tu('ziehe an der schnur');
}

/** Alle Befehle aus Menüs und Vorschlägen im aktuellen Raum ausprobieren (Zustand wird danach zurückgesetzt). */
function pruefeMenues(s, wo) {
  const HG = s.HG, S = HG.spiel, Z = HG.zustand;
  const befehle = new Set();
  HG.welt.umfeld().forEach(id => S.aktionenFuer(id).forEach(a => a.befehl && befehle.add(a.befehl)));
  ['untersuche', 'nimm', 'öffne', 'lies', 'benutze'].forEach(v => S.objekteFuer(v).forEach(id => befehle.add(v + ' ' + S.kurzwort(id))));
  S.vorschlaege().forEach(v => befehle.add(v));
  const sicher = JSON.stringify(Z.z);
  let kaputt = [];
  befehle.forEach(b => {
    if (/^(neustart|laden|fahre)/.test(b)) return;
    const t = s.tu(b);
    if (KAPUTT.test(t) || (S.offen && S.offen.art === 'wahl')) kaputt.push(b + '  →  ' + t.split('\n')[0]);
    S.offen = null;
    Z.z = JSON.parse(sicher);
  });
  pruefe(!kaputt.length, wo + ': alle ' + befehle.size + ' Menü-/Vorschlagsbefehle funktionieren' + (kaputt.length ? '\n      ' + kaputt.join('\n      ') : ''));
}

// ================================================================== Tests
console.log('Haus Grest – Testdurchlauf');

// --- 1. Prolog ------------------------------------------------------------
{
  console.log('\n1. Prolog');
  const s = prolog();
  pruefe(s.HG.zustand.z.raum === 'wohnung', 'Start in der Wohnung');
  pruefeMenues(s, 'Wohnung (Umschlag zu)');
  s.tu('öffne umschlag');
  pruefeMenues(s, 'Wohnung (Umschlag offen)');
  let t = s.tu('lies brief');
  pruefe(/Notar/.test(t) && !KAPUTT.test(t), '„lies brief“ liest das Schreiben des Notars');
  pruefe(s.HG.zustand.z.hinweise.includes('notarbrief'), 'Hinweis „notarbrief“ im Notizbuch');
}

// --- 2. Lager: Kästchen auf allen drei Wegen -------------------------------
function imLager() { const s = prolog(); zumLager(s); return s; }

{
  console.log('\n2. Lager Schmidt');
  const s = imLager();
  pruefe(s.HG.zustand.z.raum === 'lager_c214', 'In Einheit C-214 angekommen');
  pruefeMenues(s, 'C-214 (alles zu)');
  ['karton_gerdes', 'karton_romanow', 'karton_grest', 'karton_kueche', 'schuhkarton'].forEach(k => s.tu('öffne ' + s.HG.spiel.kurzwort(k)));
  pruefeMenues(s, 'C-214 (alle Kartons offen)');
  {
    // Dokument im offenen Karton: "nimm X" = "nimm X aus Karton" (beide fotografieren)
    const sicher = JSON.stringify(s.HG.zustand.z);
    const a = s.tu('nimm grundbuchauszug'), fa = s.HG.handy.hatFoto('grundbuchauszug');
    s.HG.zustand.z = JSON.parse(sicher);
    const b = s.tu('nimm grundbuchauszug aus gerdes-karton'), fb = s.HG.handy.hatFoto('grundbuchauszug');
    s.HG.zustand.z = JSON.parse(sicher);
    pruefe(fa && fb && a.split('\n')[0] === b.split('\n')[0], 'Dokument: „nimm grundbuchauszug“ und „… aus gerdes-karton“ verhalten sich gleich');
  }
  ['karton_gerdes', 'karton_romanow', 'karton_grest', 'karton_kueche'].forEach(k => {
    const inhalt = s.HG.welt.kinder(k, 'in').filter(id => !s.HG.daten.dinge[id].szenerie);
    pruefe(inhalt.length >= 3, s.HG.daten.dinge[k].nomen + ' enthält mindestens drei Dinge (' + inhalt.join(', ') + ')');
  });
}

// --- 3. Zirkel über naheliegende Befehle -----------------------------------
const ZIRKEL_BEFEHLE = ['nimm etwas hartes', 'untersuche das harte', 'schau unter foto', 'heb foto hoch', 'nimm foto heraus', 'nimm etwas schweres', 'durchsuche grest-karton', 'taste grest-karton ab'];
{
  console.log('\n3. Zirkel im Grest-Karton');
  ZIRKEL_BEFEHLE.forEach(b => {
    const s = imLager();
    s.tu('öffne grest-karton');
    const vorher = s.tu('untersuche grest-karton');
    const t = s.tu(b);
    const gefunden = !s.HG.zustand.eig('zirkel', 'versteckt');
    pruefe(/etwas Hartes/.test(vorher), 'Der offene Karton verrät „etwas Hartes“');
    pruefe(gefunden && !KAPUTT.test(t), '„' + b + '“ findet den Zirkel' + (gefunden ? '' : '  →  ' + t.split('\n')[0]));
    if (b === 'nimm etwas hartes') pruefe(s.HG.welt.getragen('zirkel'), '„nimm etwas hartes“ steckt den Zirkel ein');
  });
  const s = imLager();
  const t = s.tu('nimm etwas hartes');
  pruefe(s.HG.zustand.eig('zirkel', 'versteckt'), 'Bei geschlossenem Karton bleibt der Zirkel verborgen');
}

// --- 4. Kästchen öffnen: Code, Werkzeug, Gewalt ----------------------------
function briefPruefen(s, weg) {
  const HG = s.HG;
  // a) "nimm brief" und "nimm brief aus kästchen" verhalten sich gleich
  const sicher = JSON.stringify(HG.zustand.z);
  const t1 = s.tu('nimm brief');
  const foto = () => HG.handy.hatFoto('brief_1905') && !HG.welt.inHand('brief_1905');
  const foto1 = foto();
  HG.spiel.offen = null; HG.zustand.z = JSON.parse(sicher);
  const t2 = s.tu('nimm brief aus kästchen');
  const foto2 = foto();
  HG.zustand.z = JSON.parse(sicher);
  pruefe(foto1 && foto2, weg + ': „nimm brief“ und „nimm brief aus kästchen“ fotografieren den Brief (statt ihn einzustecken)' + (foto1 ? '' : '  →  ' + t1.split('\n')[0]) + (foto2 ? '' : '  →  ' + t2.split('\n')[0]));
  // b) Lesen per Menü (Verb-Leiste und Wort-Menü)
  const lies = HG.spiel.objekteFuer('lies').filter(id => id === 'brief_1905').map(id => 'lies ' + HG.spiel.kurzwort(id))[0];
  pruefe(!!lies, weg + ': Brief steht im Lies-Menü');
  const menue = HG.spiel.aktionenFuer('brief_1905').filter(a => a.text === 'Lesen')[0];
  const sicher2 = JSON.stringify(HG.zustand.z);
  [lies, menue && menue.befehl, 'lies brief', 'lies den brief von 1905', 'lies bernwards brief', 'lies 1905er-brief'].filter(Boolean).forEach(b => {
    const t = s.tu(b);
    pruefe(/Meine E\./.test(t) && !KAPUTT.test(t), weg + ': „' + b + '“ liest den Brief' + (/Meine E\./.test(t) ? '' : '  →  ' + t.split('\n')[0]));
    HG.spiel.offen = null; HG.zustand.z = JSON.parse(sicher2);
  });
  s.tu('lies brief');
  pruefe(HG.zustand.z.hinweise.includes('bernwards_letzter_brief'), weg + ': Hinweis „Bernwards letzter Brief“');
  s.tu('nimm ring');
  pruefe(HG.welt.getragen('ehering'), weg + ': Ehering eingesteckt');
  pruefeMenues(s, weg + ' (Kästchen offen)');
}

{
  console.log('\n4a. Kästchen per Code');
  const s = imLager();
  s.tu('schiebe leiste');
  s.tu('öffne grest-karton'); s.tu('nimm etwas hartes');
  s.tu('stecke zirkel in schlitz');
  const t = s.tu('drehe ringe auf 1205');
  pruefe(s.HG.zustand.eig('kaestchen', 'weg') === 'code', 'Kästchen per Code 1205 geöffnet');
  briefPruefen(s, 'Code');
}
{
  console.log('\n4b. Kästchen per Werkzeug (Handwerk)');
  const s = imLager();
  s.tu('öffne küchen-karton'); s.tu('nimm werkzeug');
  s.HG.zufall = () => 0.05;   // Probe gelingt
  s.tu('knacke kästchen mit werkzeug');
  pruefe(s.HG.zustand.eig('kaestchen', 'weg') === 'handwerk', 'Kästchen mit dem Feinmechaniker-Set geöffnet');
  briefPruefen(s, 'Werkzeug');
}
{
  console.log('\n4c. Kästchen per Gewalt');
  const s = imLager();
  s.HG.zufall = () => 0.05;   // Stärke-Probe gelingt
  let n = 0;
  while (!s.HG.zustand.eig('kaestchen', 'offen') && n++ < 12) s.tu('brich kästchen auf');
  pruefe(s.HG.zustand.eig('kaestchen', 'weg') === 'gewalt', 'Kästchen aufgebrochen (' + n + ' Versuche)');
  pruefe(s.HG.zustand.eig('brief_1905', 'zerrissen'), 'Brief ist zerrissen');
  const t = s.tu('nimm brief');
  pruefe(s.HG.handy.hatFoto('brief_1905'), 'Gewalt: zerrissener Brief fotografiert');
  const l = s.tu('lies brief');
  pruefe(/Riss/.test(l), 'Gewalt: zerrissener Brief lesbar');
}

// --- 5. Mehrdeutigkeit „Brief“ ----------------------------------------------
{
  console.log('\n5. Rückfragen bei „Brief“');
  // Dokumente werden abfotografiert statt eingesteckt
  const s1 = prolog();
  s1.tu('öffne umschlag');
  const tn = s1.tu('nimm notarbrief');
  pruefe(!s1.HG.welt.getragen('notarbrief') && s1.HG.handy.hatFoto('notarbrief') && /Foto genügt/.test(tn),
    '„nimm notarbrief“ fotografiert ihn ab, statt ihn einzustecken');
  pruefe(/schon abfotografiert/.test(s1.tu('nimm notarbrief')), 'Zweites „nimm notarbrief“: schon auf dem Handy');
  // Zwei Briefe zugleich: Bernwards Brief von 1905 (im Gepäck) und der von 1900 in der Schreibtischschublade
  const s2 = imHaus();
  s2.HG.zustand.setze('brief_1905', 'ort', 'spieler');
  s2.HG.zustand.setze('messingschluessel', 'ort', 'spieler'); s2.HG.zustand.setze('messingschluessel', 'versteckt', false);
  s2.HG.zustand.z.raum = 'arbeitszimmer';
  s2.tu('schließe schublade mit messingschlüssel auf'); s2.tu('öffne schublade');
  pruefe(s2.HG.zustand.eig('schreibtischschublade', 'offen'), 'Schreibtischschublade offen (Vorbereitung)');
  // Alpha-Test 27.11.2026: Dinge im Raum gehen vor Dingen in der Tasche – der Brief in der Schublade ist gemeint,
  // der von 1905 im Gepäck bleibt über seinen Namen erreichbar
  ['lies brief', 'untersuche brief', 'riech an brief'].forEach(b => {
    const sicher = JSON.stringify(s2.HG.zustand.z);
    const t = s2.tu(b);
    pruefe(!s2.HG.spiel.offen && !KAPUTT.test(t), '„' + b + '“ meint den Brief im Raum: ' + t.split('\n')[0].slice(0, 60));
    s2.HG.spiel.offen = null; s2.HG.zustand.z = JSON.parse(sicher);
  });
  {
    const t = s2.tu('lies brief von 1905');
    pruefe(!s2.HG.spiel.offen && !KAPUTT.test(t) && /1905/.test(t), '„lies brief von 1905“ erreicht den Brief im Gepäck');
  }
}

// --- 6. Carstens Bauplan ----------------------------------------------------
{
  console.log('\n6. Carstens Bauplan-Kopie');
  const s = imLager();
  s.tu('öffne grest-karton');
  const t = s.tu('nimm bauplan');
  const HG = s.HG;
  pruefe(HG.handy.hatFoto('bauplan_kopie'), 'Kopie wird fotografiert (Dokument)');
  pruefe(!HG.welt.getragen('bauplan_kopie'), 'Kopie bleibt im Karton');
  pruefe(HG.plan.bekannt(HG.daten.plaene.haus), 'Plan ist danach als Karte bekannt');
  const notizen = HG.plan.notizen(HG.daten.plaene.haus);
  pruefe(notizen.some(n => /SIE/.test(n.text)) && notizen.some(n => /2,40/.test(n.text)), 'Carstens Anmerkungen liegen auf der Karte');
  const s2 = prolog();
  pruefe(!HG.plan.notizen || s2.HG.plan.notizen(s2.HG.daten.plaene.haus).length === 0, 'Ohne die Kopie keine Anmerkungen');
}

// --- 7. Parser: Wortfolge mit „von“ ----------------------------------------
{
  console.log('\n7. Parser');
  const s = imLager();
  const t = s.tu('untersuche den brief von carsten');
  pruefe(/nichts dergleichen|nicht/.test(t), '„untersuche den brief von carsten“ ohne Treffer bleibt eine klare Meldung');
}

// ================================================================== Haus Grest, Erdgeschoss
function imHaus(opt) {
  const s = prolog();
  if (!(opt && opt.spuk)) s.HG.spukwerk.zug = () => {};   // zufälliger Spuk stört die Abläufe (Schock-Flucht!)
  if (!(opt && opt.gefahren)) s.HG.gefahren.darf = () => false;   // zufällige Gefahren ebenso (eigener Abschnitt 15)
  if (!(opt && opt.licht)) s.HG.licht.vergeht = () => {};          // Akku und Kerze brennen nur in Abschnitt 15/16 herunter
  s.tu('öffne umschlag'); s.tu('lies notarbrief'); s.tu('nimm hausschlüssel');
  s.tu('fahre zum haus');
  s.tu('schließe haustür auf'); s.tu('öffne haustür'); s.tu('geh nach norden');
  s.tu('schalte taschenlampe ein');
  return s;
}
function geh(s, ...wege) { wege.forEach(w => s.tu('geh nach ' + w)); return s.HG.zustand.z.raum; }
const EG = ['halle', 'garderobe', 'arbeitszimmer', 'flur', 'hinterdiele', 'dienstbotenzimmer', 'anrichte', 'kueche', 'speisekammer', 'speisezimmer', 'salon', 'wintergarten'];

{
  console.log('\n8. Erdgeschoss: Räume und Spuk-Daten');
  const s = imHaus();
  const HG = s.HG;
  pruefe(HG.zustand.z.raum === 'halle', 'In der Halle angekommen');
  EG.concat(['einfahrt']).forEach(r => {
    const ev = Object.keys(HG.daten.spuk).map(k => HG.daten.spuk[k]).filter(d => (d.orte || []).includes(r));
    const tag = ev.some(d => !d.zeiten || d.zeiten.some(z => z === 'morgen' || z === 'mittag'));
    const nacht = ev.some(d => !d.zeiten || d.zeiten.includes('nacht'));
    pruefe(tag && nacht, r + ': Spuk bei Tag und bei Nacht vorhanden');
  });
  // Alle Ausgänge führen in vorhandene Räume, und jeder Raum ist auf dem Bauplan
  EG.forEach(r => {
    const aus = HG.daten.raeume[r].ausgaenge || {};
    const kaputt = Object.keys(aus).filter(k => { const a = aus[k]; const z = typeof a === 'string' ? a : a.ziel; return z && !HG.daten.raeume[z]; });
    pruefe(!kaputt.length, r + ': alle Ausgänge führen zu Räumen' + (kaputt.length ? ' (' + kaputt.join(', ') + ')' : ''));
    pruefe(!!HG.plan.finde(HG.daten.plaene.haus, r), r + ': steht im Bauplan');
  });
  // Menüs in jedem erreichbaren Raum (bei Tag)
  pruefeMenues(s, 'Halle');
  geh(s, 'osten'); pruefeMenues(s, 'Speisezimmer');
  geh(s, 'süden'); pruefeMenues(s, 'Salon');
  geh(s, 'nordwesten', 'norden'); pruefeMenues(s, 'Flur');
  geh(s, 'osten'); pruefeMenues(s, 'Anrichte');
  geh(s, 'osten'); pruefeMenues(s, 'Küche');
  geh(s, 'südwesten'); pruefeMenues(s, 'Speisekammer');
  geh(s, 'nordosten', 'westen', 'westen', 'westen'); pruefeMenues(s, 'Hinterdiele');
  pruefe(HG.zustand.z.raum === 'hinterdiele', 'Weg Halle → … → Hinterdiele stimmt');
}

{
  console.log('\n9. Rätsel „Der Riegel“ (Dienstbotenzimmer)');
  // Kopf: Öl aus der Speisekammer
  let s = imHaus(); let HG = s.HG;
  geh(s, 'norden', 'westen');
  s.tu('schiebe riegel');
  const t2 = s.tu('schiebe riegel');
  pruefe(HG.zustand.eig('kraehentuer', 'verschlossen'), 'Bei Tag: Riegel festgerostet');
  pruefe(s.bloecke.some(b => b.typ === 'tipp'), 'Nach Fehlversuchen kommt ein Tipp');
  geh(s, 'osten', 'osten', 'osten', 'südwesten');
  s.tu('nimm ölkännchen');
  pruefe(HG.welt.getragen('oelkanne'), 'Ölkännchen aus der Speisekammer genommen');
  geh(s, 'nordosten', 'westen', 'westen', 'westen');
  s.tu('öle riegel');
  s.tu('schiebe riegel');
  pruefe(!HG.zustand.eig('kraehentuer', 'verschlossen'), 'Kopf: geölter Riegel lässt sich schieben');
  pruefe(HG.zustand.z.hinweise.includes('elisabeths_siegel'), 'Hinweis „Ein versiegeltes Zimmer“');
  geh(s, 'westen');
  pruefe(HG.zustand.z.raum === 'dienstbotenzimmer', 'Im Dienstbotenzimmer');
  pruefeMenues(s, 'Dienstbotenzimmer');
  s.tu('heb diele an');
  s.tu('untersuche zigarrenkiste');
  pruefe(HG.zustand.z.hinweise.includes('vogelschaedel'), 'Zigarrenkiste unter der Diele gefunden');
  s.tu('nimm gebetbuch');
  HG.zufall = () => 0.97;   // Verstand-Probe misslingt
  s.tu('lies gebetbuch');
  pruefe(!HG.zustand.z.hinweise.includes('kraehe_gebetbuch'), 'Spiegelschrift ohne Spiegel: nicht gelesen');
  // Mit dem Taschenspiegel aus der Küche
  HG.zufall = () => 0.05;   // NERVEN-Proben gelingen (sonst droht eine Schock-Flucht)
  geh(s, 'osten', 'osten', 'osten', 'osten');
  s.tu('öffne schublade'); s.tu('öffne handtuch'); s.tu('nimm taschenspiegel');
  pruefe(HG.welt.getragen('taschenspiegel'), 'Taschenspiegel aus der Küchenschublade');
  HG.zufall = () => 0.97;
  s.tu('lies gebetbuch');
  pruefe(!HG.zustand.z.hinweise.includes('kraehe_gebetbuch'), 'Lesen nimmt den Taschenspiegel nicht von selbst');
  HG.zufall = () => 0.05;
  s.tu('benutze handspiegel mit buch');
  pruefe(HG.zustand.z.hinweise.includes('kraehe_gebetbuch'), 'Mit Taschenspiegel: Spiegelschrift gelesen');
  // Mit dem Flurspiegel (ohne Taschenspiegel)
  s = imHaus(); HG = s.HG;
  HG.zustand.setze('kraehentuer', 'verschlossen', false); HG.api.bewege('gebetbuch', 'spieler');
  geh(s, 'norden');
  s.tu('benutze spiegel mit gebetbuch');
  pruefe(HG.zustand.z.hinweise.includes('kraehe_gebetbuch'), 'Mit dem Flurspiegel: Spiegelschrift gelesen');

  // Gewalt
  s = imHaus(); HG = s.HG;
  geh(s, 'norden', 'westen');
  HG.zufall = () => 0.05;
  s.tu('reiß am riegel');
  pruefe(!HG.zustand.eig('kraehentuer', 'verschlossen'), 'Gewalt: Riegel losgerissen');
  // Werkzeug
  s = imHaus(); HG = s.HG;
  HG.api.bewege('feinwerkzeug', 'spieler');
  geh(s, 'norden', 'westen');
  HG.zufall = () => 0.05;
  s.tu('benutze werkzeug mit riegel');
  pruefe(!HG.zustand.eig('kraehentuer', 'verschlossen'), 'Werkzeug: Rost gelöst, Riegel offen');
  // Nacht
  s = imHaus(); HG = s.HG;
  s.tu('warte bis nacht');
  geh(s, 'norden', 'westen');
  s.tu('schiebe riegel');
  pruefe(HG.api.istNacht() && !HG.zustand.eig('kraehentuer', 'verschlossen'), 'Nachts gleitet der Riegel von selbst');
}

{
  console.log('\n10. Rätsel „Carstens Wintergarten“');
  let s = imHaus(); let HG = s.HG;
  geh(s, 'osten');
  s.tu('öffne glastür'); s.tu('öffne glastür'); const t = s.tu('geh nach osten');
  pruefe(HG.zustand.z.raum === 'speisezimmer', 'Glastür abgeschlossen');
  pruefe(s.bloecke.some(b => b.typ === 'tipp' && /Kühlschrank/.test(b.html)), 'Tipp verweist auf den Zettel am Kühlschrank');
  geh(s, 'norden');
  s.tu('lies zettel');
  pruefe(HG.zustand.z.hinweise.includes('carstens_wg_zettel'), 'Zettel am Kühlschrank gelesen');
  geh(s, 'westen');
  const nervenVorher = HG.zustand.z.werte.nerven;
  s.tu('schau hinter spiegel');
  pruefe(HG.welt.imUmfeld('wg_schluessel'), 'Schlüssel hinter dem verhängten Spiegel');
  pruefe(HG.zustand.z.werte.nerven === nervenVorher, 'Ohne Hineinsehen keine NERVEN-Probe');
  s.tu('nimm wg-schlüssel');
  // Handtuch: erst das Gesicht (Spukbild), erst der zweite Versuch nimmt es ab
  HG.medien.spukVariante = null;
  s.tu('nimm handtuch');
  pruefe(!HG.api.eig('wc_handtuch', 'ab') && HG.zustand.z.flags.handtuch_gesicht, 'Erster Griff zum Handtuch: Gesicht, Hand zurück');
  pruefe(HG.medien.raumKandidaten().some(k => k.name === 'raum-anrichte-spuk'), 'Gesicht im Handtuch zeigt das Spukbild der Anrichte');
  s.tu('nimm handtuch');
  pruefe(HG.api.eig('wc_handtuch', 'ab'), 'Zweiter Versuch nimmt das Handtuch ab');
  // Allgemeiner Spuk (Lavendel) zeigt kein raumeigenes Spukbild
  HG.medien.spukVariante = null; HG.spukwerk.ausloesen('lavendel');
  pruefe(!HG.medien.spukVariante, 'Allgemeiner Spuk zeigt kein Spukbild');
  geh(s, 'osten');
  HG.spukwerk.ausloesen('kueche_klingel');
  pruefe(/ANKLEIDEZIMMER/.test(s.tu('untersuche klingelkasten')), 'Nach der Klingel ist die Klappe im Klingelkasten unten');
  s.tu('drücke klappe');
  pruefe(/Alle Klappen sind oben/.test(s.tu('untersuche klingelkasten')), 'Klappe lässt sich hochdrücken');
  geh(s, 'süden');
  s.tu('schließe glastür auf'); geh(s, 'osten');
  pruefe(HG.zustand.z.raum === 'wintergarten', 'Kopf: Wintergarten aufgeschlossen');
  pruefeMenues(s, 'Wintergarten');
  s.tu('untersuche rollstuhl'); s.tu('öffne tasche'); s.tu('lies fläschchen');
  pruefe(HG.zustand.z.hinweise.includes('rollstuhl_elisabeth') && HG.zustand.z.hinweise.includes('tinktur'), 'Rollstuhl und Tinktur gefunden');
  // Gewalt
  s = imHaus(); HG = s.HG;
  geh(s, 'osten'); s.tu('zerbrich glastür');
  geh(s, 'osten');
  pruefe(HG.zustand.z.raum === 'wintergarten', 'Gewalt: Scheibe eingeschlagen, Wintergarten erreicht');
  s.tu('warte'); s.tu('warte');
  pruefe(HG.zustand.eig('wg_tuer_speise', 'zerbrochen'), 'Die Scheibe bleibt bis zur Nacht kaputt');
  s.tu('warte bis nacht'); while (HG.zeit.phase() === 'nacht') s.tu('warte');
  const glas = s.tu('untersuche glastür zum speisezimmer');
  pruefe(!HG.zustand.eig('wg_tuer_speise', 'zerbrochen') && !HG.zustand.eig('wg_tuer_speise', 'verschlossen'), 'Über Nacht hat sich die Scheibe erneuert wie ein Spiegel (Tür bleibt offen)');
  // Werkzeug
  s = imHaus(); HG = s.HG;
  HG.api.bewege('feinwerkzeug', 'spieler'); HG.zufall = () => 0.05;
  geh(s, 'südosten'); s.tu('knacke glastür mit werkzeug'); geh(s, 'osten');
  pruefe(HG.zustand.z.raum === 'wintergarten', 'Werkzeug: Schloss geknackt (vom Salon aus)');
}

{
  console.log('\n11. Salon, Speisezimmer bei Nacht');
  const s = imHaus(); const HG = s.HG;
  geh(s, 'südosten');
  // Mit Kästchen (eigene Gravur) und Tagebuch („Heft“) im Gepäck – Davids Spieltest 24.11.2026
  HG.api.bewege('kaestchen', 'spieler'); HG.api.bewege('tagebuch', 'spieler');
  pruefe(!KAPUTT.test(s.tu('untersuche marmorkamin')), '„untersuche marmorkamin“ verstanden');
  // Alpha-Test 27.11.2026: Dinge im Raum vor Dingen in der Tasche – „lies gravur“ meint die Messingplatte am Kamin
  s.tu('lies gravur');
  pruefe(!HG.spiel.offen && HG.zustand.z.hinweise.includes('hochzeitstag'), '„lies gravur“: Messingplatte am Kamin – „Unser Tag“ (zweite Quelle für den Code)');
  const t2 = s.tu('lies gravur am kästchen');
  pruefe(!HG.spiel.offen && /erbaute/.test(t2), '„lies gravur am kästchen“ erreicht die Gravur im Gepäck');
  pruefe(/erbaute/.test(s.tu('lies die gravur des kästchens')), '„lies die gravur des kästchens“ ebenso');
  pruefe(/Notenheft/.test(s.tu('untersuche flügel')), 'Flügel nennt das Notenheft');
  pruefe(!/Umschlag/.test(s.tu('untersuche notenheft')), 'Notenheft erwähnt keinen Umschlag mehr');
  s.tu('nimm notenheft');
  pruefe(HG.zustand.z.hinweise.includes('renate_vogt'), 'Notenheft von Renate Vogt fotografiert');
  s.tu('spiele flügel');
  s.tu('warte bis nacht');
  geh(s, 'norden');
  pruefe(HG.zustand.z.hinweise.includes('dreizehn_gedecke'), 'Nachts: Tafel für dreizehn gedeckt');
  pruefeMenues(s, 'Speisezimmer (Nacht)');
  geh(s, 'westen');
  pruefe(HG.zustand.z.raum === 'halle', 'Zurück in der Halle bei Nacht');
}

{
  console.log('\n12. Ablenkungen bei Tag, Gewöhnung');
  const s = imHaus({ spuk: true }); const HG = s.HG;
  let n = 0;
  while (!HG.zustand.z.flags.ablenkung_polizei && n++ < 40 && HG.api.istTag()) { s.tu('warte'); if (HG.HG) break; if (HG.zustand.z.handy.klingelt) s.tu('geh ran'); }
  pruefe(!!HG.zustand.z.flags.ablenkung_polizei, 'Nach einer Weile im Haus ruft „die Polizei“ an (' + HG.api.verweilt('haus') + ' Min. im Haus)');
  s.tu('ruf polizei an');
  pruefe(HG.zustand.z.hinweise.includes('falscher_anruf_polizei'), 'Rückruf entlarvt den Anruf');
  // Gewöhnung
  HG.zufall = () => 0.05;
  const a = HG.api.nervenProbe('1/1W6', { gewoehnung: 'test' });
  HG.zufall = () => 0.97;
  const b = HG.api.nervenProbe('1/1W6', { gewoehnung: 'test' });
  pruefe(a.erfolg && b.gewoehnt && b.verlust === 0, 'Gewöhnung: nach bestandener Probe keine zweite');
  // Großer Spiegel im Flur: nach bestandener Probe kein neuer NERVEN-Verlust beim erneuten Hineinsehen
  HG.zufall = () => 0.05;
  const spBei = HG.daten.dinge.spiegel.bei;
  spBei.hineinschauen(HG.api, {});
  HG.zufall = () => 0.97;
  const nervenVor = HG.zustand.z.werte.nerven;
  spBei.hineinschauen(HG.api, {}); spBei.hineinschauen(HG.api, {}); spBei.hineinschauen(HG.api, {});
  pruefe(HG.zustand.z.werte.nerven === nervenVor, 'Flur-Spiegel: nach bestandener Probe keine weiteren Proben');
  // Tragkraft: auch automatisches Nehmen (lesen, benutzen …) hält die Grenze ein; das Handy zählt nicht
  {
    const t = imHaus({}); const H = t.HG, Z = H.zustand;
    const max = H.daten.spiel.tragkraft;
    const frei = Object.keys(H.daten.dinge).filter(id => {
      const d = H.daten.dinge[id];
      return !d.istHandy && !d.fest && !d.tuer && !d.person && !d.orte && !d.dokument && Z.eig(id, 'ort') !== 'spieler';
    });
    Object.keys(H.daten.dinge).forEach(id => { if (Z.eig(id, 'ort') === 'spieler' && !H.daten.dinge[id].istHandy) Z.setze(id, 'ort', Z.z.raum); });
    frei.slice(0, max).forEach(id => Z.setze(id, 'ort', 'spieler'));
    const extra = frei[max];
    Z.setze(extra, 'ort', Z.z.raum); Z.setze(extra, 'versteckt', false);
    const zahl = () => H.welt.kinder('spieler').filter(id => !H.daten.dinge[id].istHandy).length;
    H.spiel.eingabe('nimm ' + (H.daten.dinge[extra].woerter || [extra])[0]);
    pruefe(zahl() === max, 'Tragkraft: bei ' + max + ' Dingen kein weiteres');
    pruefe(Z.eig('handy', 'ort') === 'spieler', 'Tragkraft: Handy zählt nicht mit');
    Z.setze(frei[0], 'ort', Z.z.raum);
    H.spiel.eingabe('nimm ' + (H.daten.dinge[extra].woerter || [extra])[0]);
    pruefe(Z.eig(extra, 'ort') === 'spieler', 'Tragkraft: nach dem Ablegen eines Dings klappt das Nehmen wieder');
  }
  // Nachts keine Ablenkungen
  const s2 = imHaus({ spuk: true }); const H2 = s2.HG;
  s2.tu('warte bis nacht');
  for (let i = 0; i < 30; i++) s2.tu('warte');
  pruefe(!H2.zustand.z.flags.ablenkung_polizei || H2.zustand.z.zeit.minute < 19 * 60, 'Nachts keine Ablenkungs-Anrufe');
}


{
  console.log('\n13. Pistole, Inhaltshinweis, Hilfe, Abspann');
  // Inhaltshinweis beim Start, Telefonseelsorge unter „hilfe“
  const p = prolog(); const HP = p.HG;
  pruefe(p.bloecke.some(b => /Inhaltshinweis/.test(b.html || '') && /0800 111 0 111/.test(b.html || '')), 'Inhaltshinweis mit Telefonseelsorge beim Spielstart');
  pruefe(/0800 111 0 111/.test(p.tu('hilfe')), '„hilfe“ nennt die Telefonseelsorge');
  // +5 NERVEN beim Tragen, zurück beim Ablegen
  let s = imHaus(); let HG = s.HG; const Z = HG.zustand.z;
  // Polizist(in): kein Bonus, stattdessen ein Satz (Alpha-Test 27.11.2026)
  Z.beruf = 'polizei'; Z.werte.nerven = 50;
  HG.api.bewege('pistole', 'spieler');
  const tPol = s.tu('warte');
  pruefe(Z.werte.nerven === 50 && /Es ist nicht deine/.test(tPol), 'Polizist(in) mit Pistole: kein NERVEN-Bonus, „Es ist nicht deine.“');
  s.tu('lege pistole ab');
  pruefe(Z.werte.nerven === 50, 'Polizist(in) legt die Pistole ab: nichts geht verloren');
  Z.beruf = 'journalismus';
  HG.api.bewege('pistole', 'spieler'); s.tu('warte');
  pruefe(Z.werte.nerven === 55, 'Pistole tragen: +5 NERVEN (' + Z.werte.nerven + ')');
  s.tu('lege pistole ab');
  pruefe(Z.werte.nerven === 50, 'Pistole abgelegt: Bonus wieder weg (' + Z.werte.nerven + ')');
  s.tu('nimm pistole');
  pruefe(Z.werte.nerven === 55, 'Wieder aufgenommen: +5 NERVEN');
  // Ereignis: Willenskraft-Probe gelingt → Magazin weg, Spiel geht weiter
  HG.zufall = () => 0.01;
  Z.werte.nerven = 9; s.tu('warte');
  pruefe(!Z.vorbei && !HG.api.eig('pistole', 'geladen') && Z.flags.pistole_ereignis, 'Die Pistole: widerstanden, Magazin weggeworfen');
  Z.werte.nerven = 8; s.tu('warte');
  pruefe(!Z.vorbei, 'Entladene Pistole: kein neues Ereignis');
  // Ereignis: beide Proben misslingen → Ende „Willkommen zu Hause“ mit Abspann
  s = imHaus(); HG = s.HG;
  HG.api.bewege('pistole', 'spieler'); s.tu('warte');
  HG.zufall = () => 0.99;
  const wpVorher = HG.zustand.z.werte.wp;
  HG.zustand.z.werte.nerven = 9; s.tu('warte');
  const ende = s.bloecke.filter(b => b.typ === 'ende').map(b => b.html).join(' ');
  pruefe(HG.zustand.z.vorbei && /Willkommen zu Hause/.test(ende), 'Die Pistole: beide Proben misslungen → „Willkommen zu Hause“');
  pruefe(HG.zustand.z.werte.wp < wpVorher, 'Zweite Chance kostet WP');
  pruefe(s.bloecke.some(b => /0800 111 0 111/.test(b.html || '') && /Danke fürs Spielen/.test(b.html || '')), 'Abspann mit Telefonseelsorge');
  // „entlade pistole“
  s = imHaus(); HG = s.HG;
  HG.api.bewege('pistole', 'spieler');
  s.tu('entlade pistole');
  pruefe(!HG.api.eig('pistole', 'geladen'), '„entlade pistole“');
  HG.zustand.z.werte.nerven = 9; s.tu('warte');
  pruefe(!HG.zustand.z.vorbei && !HG.zustand.z.flags.pistole_ereignis, 'Entladen: kein Ereignis bei NERVEN < 10');
  pruefe(/nicht entladen/.test(s.tu('entlade handy')), 'Andere Dinge lassen sich nicht entladen');
}


{
  console.log('\n14. Obergeschoss: Räume, Rätsel, Funde');
  const s = imHaus(); const HG = s.HG; const Z = () => HG.zustand.z;
  const OG = ['galerie', 'schlafzimmer', 'bibliothek', 'kinderzimmer', 'bad', 'waeschekammer', 'gaestezimmer'];
  OG.forEach(r => {
    const ev = Object.keys(HG.daten.spuk).map(k => HG.daten.spuk[k]).filter(d => (d.orte || []).includes(r));
    pruefe(ev.some(d => !d.zeiten || d.zeiten.some(z => z === 'morgen' || z === 'mittag')) && ev.some(d => !d.zeiten || d.zeiten.includes('nacht')), r + ': Spuk bei Tag und bei Nacht vorhanden');
    const aus = HG.daten.raeume[r].ausgaenge || {};
    const kaputt = Object.keys(aus).filter(k => { const a = aus[k]; const z = typeof a === 'string' ? a : a.ziel; return z && !HG.daten.raeume[z]; });
    pruefe(!kaputt.length, r + ': alle Ausgänge führen zu Räumen' + (kaputt.length ? ' (' + kaputt.join(', ') + ')' : ''));
    pruefe(!!HG.plan.finde(HG.daten.plaene.haus, r), r + ': steht im Bauplan');
  });
  // Die Treppe ist frei (bei Tag ohne Gefahr)
  geh(s, 'hoch');
  pruefe(Z().raum === 'galerie', 'Treppe: hinauf auf die Galerie');
  pruefeMenues(s, 'Galerie');
  geh(s, 'nordwesten'); pruefeMenues(s, 'Kinderzimmer');
  geh(s, 'osten', 'westen'); pruefeMenues(s, 'Bibliothek');
  geh(s, 'osten', 'norden'); pruefeMenues(s, 'Bad');
  geh(s, 'süden', 'nordosten'); pruefeMenues(s, 'Wäschekammer');
  geh(s, 'südwesten', 'osten'); pruefeMenues(s, 'Gästezimmer');
  geh(s, 'westen', 'südosten'); pruefeMenues(s, 'Krankenzimmer');
  geh(s, 'westen');
  pruefe(/Bodenklappe ist zu/.test(s.tu('geh hoch')), 'Bodenklappe: ohne Hakenstange zu hoch');

  // Wäschekammer: Werkzeuge
  geh(s, 'nordosten');
  s.tu('nimm hakenstange'); s.tu('nimm laken'); s.tu('nimm eimer'); s.tu('öffne schublade'); s.tu('nimm schere');
  pruefe(['hakenstange', 'laken', 'eimer', 'schere'].every(id => HG.welt.getragen(id)), 'Wäschekammer: Hakenstange, Laken, Eimer, Schere');
  geh(s, 'südwesten');
  s.tu('öffne klappe mit hakenstange');
  pruefe(HG.api.eig('bodenklappe', 'offen'), 'Bodenklappe mit der Hakenstange geöffnet');
  s.tu('geh hoch');
  pruefe(Z().raum === 'speicher', 'Durch die Bodenklappe auf den Speicher');
  s.tu('geh runter');

  // Bad: „Das schwarze Wasser“ – Kopf-Weg mit der Hakenstange
  geh(s, 'norden');
  s.tu('zieh kette mit hakenstange');
  pruefe(HG.api.eig('wanne', 'leer') && HG.api.eig('stimmgabel', 'ort') === 'wanne', 'Bad: Wanne mit der Hakenstange geleert, Stimmgabel am Grund');
  s.tu('nimm stimmgabel');
  pruefe(HG.welt.getragen('stimmgabel'), 'Stimmgabel genommen');
  geh(s, 'süden');

  // Krankenzimmer: „Die unsichtbare Schrift“
  geh(s, 'südosten');
  s.tu('nimm tagebuch von elisabeth');
  pruefe(HG.welt.getragen('elisabeths_tagebuch'), 'Elisabeths Tagebuch genommen');
  s.tu('lies tagebuch von elisabeth');
  pruefe(!Z().hinweise.includes('elisabeths_tagebuch'), 'Ohne Wärme bleibt die Schrift unsichtbar');
  HG.api.bewege('kerze', 'spieler'); HG.zustand.setze('kerze', 'brennt', true);
  HG.zufall = () => 0.05;
  s.tu('halte tagebuch über kerze');
  pruefe(Z().flags.zitronentinte, '„halte tagebuch über kerze“: Zitronentinte sichtbar');
  s.tu('lies tagebuch von elisabeth'); s.tu('lies eintrag 7');
  pruefe(Z().hinweise.includes('elisabeths_tagebuch'), 'Elisabeths Tagebuch gelesen (Hinweis)');
  geh(s, 'westen');

  // Kinderzimmer: Puppenhaus und Bettinas Haarspange
  geh(s, 'nordwesten');
  s.tu('untersuche puppenhaus');
  pruefe(Z().hinweise.includes('puppenhaus_modell'), 'Puppenhaus: Hinweis auf die zugemauerte Tür');
  HG.zufall = () => 0.97;
  s.tu('öffne puppenhaus');
  pruefe(!HG.api.eig('puppenhaus', 'offen'), 'Puppenhaus: Haken klemmt (ohne Werkzeug, Probe misslungen)');
  HG.api.bewege('feinwerkzeug', 'spieler');
  s.tu('öffne puppenhaus mit werkzeug');
  pruefe(HG.api.eig('puppenhaus', 'offen'), 'Puppenhaus mit der Pinzette geöffnet');
  s.tu('schau unter puppenbett'); s.tu('nimm haarspange');
  pruefe(HG.welt.getragen('haarspange'), 'Bettinas Haarspange gefunden');
  s.tu('nimm kinderbuch');
  pruefe(Z().hinweise.includes('geheimschrift'), 'Kinderbuch „Geheimschriften“ fotografiert');
  geh(s, 'osten');

  // Bibliothek: „Ein Buch zu viel“
  geh(s, 'westen');
  s.tu('untersuche etiketten');
  pruefe(Z().flags.buch_ohne_etikett, 'Etiketten: das Buch ohne Etikett entdeckt');
  s.tu('nimm kräuterbuch');
  pruefe(!HG.welt.getragen('kraeuterbuch'), 'Kräuterbuch: ohne Leiter zu hoch');
  HG.zufall = () => 0.05;
  s.tu('kletter auf die leiter'); s.tu('nimm kräuterbuch');
  pruefe(HG.welt.getragen('kraeuterbuch'), 'Kräuterbuch von der Rollleiter geholt');
  s.tu('lies kräuterbuch'); s.tu('lies eintrag 2');
  pruefe(Z().hinweise.includes('kraeuterbuch'), 'Kräuterbuch gelesen (Hinweis)');
  s.tu('schau hinter regale'); s.tu('nimm zeichenrolle');
  pruefe(Z().hinweise.includes('brinkhoff_plaene'), 'Brinkhoffs Pläne hinter dem Regal');
  geh(s, 'osten');

  // Gästezimmer: „Der Koffer“
  geh(s, 'osten');
  s.tu('lies klebezettel');
  s.tu('drehe rädchen auf 0308');
  pruefe(HG.api.eig('koffer', 'offen'), 'Koffer mit 0308 geöffnet');
  s.tu('nimm laser');
  pruefe(HG.welt.getragen('laser') && !HG.api.eig('laser', 'kaputt'), 'Laser-Entfernungsmesser heil');
  // Schlussfolgerungen
  Z().hinweise.push('kraehe_gebetbuch');
  HG.spiel.kombiniereHinweise('kraehe_gebetbuch', 'elisabeths_tagebuch');
  pruefe(Z().schluesse.includes('zwei_elisabeths'), 'Schlussfolgerung „Es gibt zwei Elisabeths“');

  // Gewalt-Wege
  const g = imHaus(); const H2 = g.HG;
  geh(g, 'hoch', 'osten');
  g.tu('brich koffer auf');
  pruefe(H2.api.eig('koffer', 'offen') && H2.api.eig('laser', 'kaputt'), 'Koffer aufgebrochen: Laser kaputt, kein Sackgasse');
  geh(g, 'westen', 'nordwesten');
  g.tu('brich puppenhaus auf');
  pruefe(H2.api.eig('puppenhaus', 'offen') && H2.api.eig('puppenhaus', 'kaputt'), 'Puppenhaus aufgebrochen (taugt nachts nicht mehr als Karte)');
  geh(g, 'osten', 'westen');
  g.tu('reiß bücher heraus');
  pruefe(H2.api.eig('kraeuterbuch', 'ort') === 'bibliothek' && !H2.api.eig('kraeuterbuch', 'oben'), 'Bücher herausgerissen: Kräuterbuch liegt am Boden');
  geh(g, 'osten', 'nordosten'); g.tu('nimm eimer'); geh(g, 'südwesten', 'norden');
  g.tu('benutze eimer mit wanne');
  pruefe(H2.api.eig('wanne', 'leer'), 'Wanne mit dem Eimer ausgeschöpft');
}

{
  console.log('\n15. Gefahren, Kämpfe, Nacht, Seelen');
  const s = imHaus({ gefahren: true, licht: true }); const HG = s.HG; const Z = () => HG.zustand.z;
  HG.gefahren.zug = () => {};   // zufällige Raum-Gefahren, Seelen und Wanderer hier gezielt auslösen
  const nachtUm = (min) => { Z().zeit.minute = min; };
  // Witwe auf der Treppe: Auswahl, vorsichtig gehen
  nachtUm(60);
  HG.daten.gefahren.witwe.chance = 1; HG.daten.gefahren.baumeister.phasen = ['nie'];
  HG.zufall = () => 0.05;
  s.tu('geh hoch');
  pruefe(HG.spiel.offen && HG.spiel.offen.art === 'auswahl', 'Witwe auf der Treppe: Auswahl erscheint');
  pruefe(HG.spiel.vorschlaege().some(v => /Langsam/.test(v)), 'Auswahl steht in den Vorschlägen');
  s.tu('2');
  pruefe(Z().raum === 'galerie', 'Langsam gegangen: oben angekommen');
  // Sturz
  Z().gefahren.nacht = {};
  HG.zufall = () => 0.93;   // misslungen, aber kein Patzer
  const lp = Z().werte.lp;
  s.tu('geh runter'); s.tu('1');
  pruefe(Z().raum === 'halle' && Z().werte.lp < lp, 'Treppensturz: unten in der Halle, verletzt');
  // „geh vorsichtig hoch“ ohne Auswahl
  Z().gefahren.nacht = {}; HG.zufall = () => 0.05;
  s.tu('geh vorsichtig hoch');
  pruefe(Z().raum === 'galerie' && !HG.spiel.offen, '„geh vorsichtig hoch“: direkt die vorsichtige Probe');
  // Beim Namen nennen (mit Wissen): bannen für die Nacht
  Z().hinweise.push('dreizehn_kreuze', 'kiste_ostermann');
  Z().gefahren.nacht = {};
  s.tu('geh runter');
  pruefe(HG.spiel.vorschlaege().some(v => /beim Namen/.test(v)), 'Mit Wissen: „Sie beim Namen nennen“ wird angeboten');
  s.tu('Sie beim Namen nennen');
  pruefe(HG.spiel.vorschlaege().includes('Margarete Ostermann'), 'Namen zur Auswahl');
  s.tu('Margarete Ostermann');
  const wahr = HG.spiel.vorschlaege().find(v => /Heinrich ist tot/.test(v));
  pruefe(!!wahr, 'Wahrheiten zur Auswahl');
  s.tu(wahr);
  pruefe(HG.gefahren.gebannt('margarete') && Z().raum === 'halle', 'Margarete gebannt, unten angekommen');
  Z().gefahren.nacht = {};
  s.tu('geh hoch');
  pruefe(Z().raum === 'galerie' && !HG.spiel.offen, 'Gebannt: die Treppe ist für diese Nacht sicher');

  // Kampf: Die Hand aus dem Badspiegel – verhängen
  geh(s, 'nordosten'); s.tu('nimm laken'); s.tu('nimm schere'); s.tu('öffne schublade'); s.tu('nimm schere');
  geh(s, 'südwesten', 'norden');
  HG.zufall = () => 0.05;
  delete Z().flags.kampf_erklaert;
  const vorKampf = s.bloecke.length;
  HG.api.kampf('die_hand', { spiegel: 'badspiegel' });
  pruefe(!!Z().kampf, 'Kampf „Die Hand“ beginnt');
  const erkl = s.bloecke.slice(vorKampf).filter(b => b.typ === 'tipp').map(b => b.html).join(' ');
  pruefe(/HALT/.test(erkl) && /verhänge/.test(erkl) && /weiche aus/.test(erkl), 'Erster Kampf: Erklärung mit HALT und den möglichen Aktionen');
  pruefe(/HALT zeigt/.test(s.tu('hilfe')) && !!Z().kampf && Z().kampf.runde === 0, 'Im Kampf: „hilfe“ erklärt den Kampf, kostet keine Runde');
  pruefe(HG.spiel.vorschlaege().some(v => /verhänge/.test(v)), 'Kampf-Vorschläge: Spiegel verhängen');
  pruefe(/keine Zeit/.test(s.tu('öffne die schublade')), 'Im Kampf: andere Befehle zählen nicht');
  s.tu('weiche aus');
  pruefe(Z().kampf && Z().kampf.runde === 1, 'Ausweichen: eine Runde');
  s.tu('verhänge den spiegel');
  pruefe(!Z().kampf && HG.api.eig('badspiegel', 'verhaengt'), 'Spiegel verhängt: Manifestation abgeschnitten');
  pruefe(!HG.macht.istPortal('badspiegel'), 'Verhängter Spiegel ist kein Portal mehr');
  // Kampf: Die Näherin – Schere
  geh(s, 'süden', 'nordosten');
  const vorKampf2 = s.bloecke.length;
  HG.api.kampf('naeherin', {});
  pruefe(!s.bloecke.slice(vorKampf2).some(b => b.typ === 'tipp' && /HALT zeigt/.test(b.html)), 'Zweiter Kampf: keine Erklärung mehr');
  let n = 0; while (Z().kampf && n++ < 10) s.tu('schneide dich frei');
  pruefe(!Z().kampf, 'Die Näherin: mit der Schere freigeschnitten');
  // Kampf: Licht und Flucht
  HG.zustand.setze('handy', 'brennt', true);
  HG.api.kampf('die_wandernde', {});
  s.tu('halte das Licht auf sie');
  pruefe(Z().kampf && Z().kampf.halt === 8, 'Licht (Handy): HALT −2');
  s.tu('flieh');
  pruefe(!Z().kampf && Z().raum !== 'waeschekammer', 'Flucht gelungen: anderer Raum');
  // Kampf: Pistole ist nutzlos
  HG.api.bewege('pistole', 'spieler');
  HG.api.kampf('die_hand', { spiegel: 'gaeste_spiegel' });
  const halt = Z().kampf.halt;
  s.tu('schieß');
  pruefe(Z().kampf && Z().kampf.halt === halt, 'Pistole: nutzlos gegen Manifestationen');
  s.tu('zerschlage den spiegel');
  pruefe(!Z().kampf && HG.api.eig('gaeste_spiegel', 'zerbrochen'), 'Spiegel zerschlagen: abgeschnitten');
  HG.api.bewege('pistole', 'schuhkarton', 'in');

  // Bekehren: Bettina
  Z().hinweise.push('bettina_gerdes', 'gespraech_brigitte');
  HG.api.bewege('haarspange', 'spieler');
  Z().raum = 'kinderzimmer';
  const machtVorher = Z().macht;
  HG.gefahren.erscheine('bettina');
  s.tu('sprich mit bettina');
  const satz = HG.spiel.vorschlaege().find(v => /nicht deine Schuld/.test(v));
  pruefe(!!satz, 'Bettina: Wahrheiten zur Auswahl');
  s.tu(satz);
  pruefe(HG.gefahren.istBekehrt('bettina') && Z().macht < machtVorher, 'Bettina bekehrt, MACHT gesunken');

  // Puppenhaus zeigt nachts die Gefahren
  Z().gefahren.wanderer = { raum: 'bibliothek', nacht: HG.nacht.nummer(), zuletzt: HG.zeit.jetzt() };
  HG.zustand.setze('handy', 'brennt', true); HG.zustand.setze('handy', 'vorratStand', 80);
  pruefe(/Bibliothek/.test(s.tu('schau ins puppenhaus')), 'Puppenhaus: nachts Figuren, wo etwas lauert');

  // Verstecken vor dem Wanderer
  Z().raum = 'gaestezimmer';
  s.tu('versteck dich unter dem bett');
  pruefe(Z().versteckt, 'Versteckt unter dem Bett');
  HG.zufall = () => 0.05;
  HG.gefahren.wandererKommt();
  pruefe(!Z().kampf, 'Versteckt: der Wanderer geht vorbei');
  Z().versteckt = null;
  HG.gefahren.wandererKommt();
  pruefe(!!Z().kampf, 'Nicht versteckt: Kampf mit der Wandernden');
  Z().kampf = null;

  // Andere Gefahren mit Auswahl
  Z().raum = 'gaestezimmer'; Z().gefahren.nacht = {};
  HG.gefahren.loese('schlaefer');
  s.tu('Sofort hinausgehen');
  pruefe(Z().raum === 'galerie', 'Der Schläfer: hinausgegangen');
  Z().raum = 'kueche';
  HG.gefahren.loese('gas');
  s.tu('Raus aus der Küche');
  pruefe(Z().raum === 'anrichte', 'Das Gas: aus der Küche geflohen');
  Z().raum = 'schlafzimmer'; HG.api.bewege('stimmgabel', 'spieler');
  HG.gefahren.loese('fenster');
  pruefe(HG.spiel.vorschlaege().some(v => /Stimmgabel/.test(v)), 'Die am Fenster: Stimmgabel wird angeboten');
  s.tu('Die Stimmgabel anschlagen');
  pruefe(!HG.spiel.offen && Z().werte.lp > 0, 'Die am Fenster: mit der Stimmgabel widerstanden');
  // Baumeister mit dem Bauplan
  HG.daten.gefahren.baumeister.phasen = ['daemmerung', 'tief'];
  HG.api.bewege('bauplan', 'spieler');
  Z().raum = 'bibliothek'; Z().zeit.minute = 60; Z().gefahren.baumeister = HG.nacht.nummer();
  HG.zufall = () => 0.1;
  s.tu('geh nach osten');
  pruefe(HG.spiel.offen && Z().raum !== 'galerie', 'Der Baumeister: die Tür führt in den falschen Raum');
  s.tu('Bernwards Plan mit dem Raum vergleichen');
  pruefe(Z().raum === 'galerie' && HG.gefahren.gebannt('brinkhoff'), 'Mit Bernwards Plan: richtiger Raum, Baumeister gebannt');

  // Akku
  HG.zustand.setze('handy', 'brennt', true); HG.zustand.setze('handy', 'vorratStand', 1);
  s.tu('warte');
  pruefe(!HG.api.eig('handy', 'brennt') && HG.licht.leer('handy'), 'Akku leer: Taschenlampe aus');
  pruefe(/leer/.test(s.tu('schalte taschenlampe ein')), 'Leerer Akku: Lampe lässt sich nicht einschalten');
  HG.licht.fahrt(30);
  pruefe(HG.licht.prozent('handy') === 30, 'Im Auto geladen (30 Minuten → 30 %)');
  // Nachtphasen und 3-Uhr-Höhepunkt
  pruefe(HG.nacht.phase(20 * 60) === 'daemmerung' && HG.nacht.phase(60) === 'tief' && HG.nacht.phase(4 * 60) === 'abebben' && HG.nacht.phase(12 * 60) === null, 'Nachtphasen');
  Z().raum = 'halle'; Z().zeit.minute = 2 * 60 + 58; Z().flags.klappe_ankleidezimmer = false;
  HG.api.zeitVergeht(5);
  pruefe(Z().flags.klappe_ankleidezimmer, '3 Uhr: Höhepunkt (Klingel „Ankleidezimmer“)');
}


{
  console.log('\n16. Dachboden: Klappe → Kalender → Kiste → Hallmann bekehren');
  const s = imHaus({ licht: true }); const HG = s.HG; const Z = () => HG.zustand.z;
  const DACH = ['speicher', 'maedchenkammer', 'waescheboden', 'turmerker'];
  DACH.forEach(r => {
    const ev = Object.keys(HG.daten.spuk).map(k => HG.daten.spuk[k]).filter(d => (d.orte || []).includes(r));
    pruefe(ev.some(d => !d.zeiten || d.zeiten.some(z => z === 'morgen' || z === 'mittag')) && ev.some(d => !d.zeiten || d.zeiten.includes('nacht')), r + ': Spuk bei Tag und bei Nacht vorhanden');
    const aus = HG.daten.raeume[r].ausgaenge || {};
    pruefe(!Object.keys(aus).some(k => { const a = aus[k]; const z = typeof a === 'string' ? a : a.ziel; return z && !HG.daten.raeume[z]; }), r + ': alle Ausgänge führen zu Räumen');
    pruefe(!!HG.plan.finde(HG.daten.plaene.haus, r), r + ': steht im Bauplan');
  });
  // Klappe mit der Hakenstange, hinauf auf den Speicher
  geh(s, 'hoch', 'nordosten'); s.tu('nimm hakenstange'); geh(s, 'südwesten');
  s.tu('öffne klappe mit hakenstange');
  geh(s, 'hoch');
  pruefe(Z().raum === 'speicher', 'Über die Bodenklappe auf den Speicher');
  pruefeMenues(s, 'Speicher');
  geh(s, 'süden'); pruefeMenues(s, 'Mädchenkammer');
  s.tu('lies ritzung');
  pruefe(Z().hinweise.includes('zwei_gesichter'), 'Ritzung „L. W. 1928“ gelesen');
  geh(s, 'norden', 'nordosten'); pruefeMenues(s, 'Wäscheboden');
  geh(s, 'südwesten', 'südosten');
  pruefe(Z().flags.kraehen_nacht === HG.nacht.nummer(), 'Turmerker bei Tag: Krähen aufgescheucht (die Wandernde kommt früher)');
  pruefe(HG.wert(HG.daten.spiel.wanderer.phasen, HG.api).includes('daemmerung'), 'Wanderer: in dieser Nacht schon in der Dämmerung');
  pruefeMenues(s, 'Turmerker');
  s.tu('nimm silberlöffel');
  pruefe(HG.welt.getragen('silberloeffel'), 'Silberlöffel „E. G.“ aus dem Krähennest');
  geh(s, 'nordwesten');
  // Kalender im Mantel → Code 0258
  s.tu('durchsuche mantel');
  s.tu('nimm taschenkalender');
  pruefe(Z().handy.fotos.some(f => f.id === 'taschenkalender'), 'Taschenkalender aus dem Mantel fotografiert');
  s.tu('drehe rädchen auf 1111');
  pruefe(!HG.api.eig('hallmann_kiste', 'offen'), 'Falscher Code: Kiste bleibt zu');
  s.tu('drehe rädchen auf 0258');
  pruefe(HG.api.eig('hallmann_kiste', 'offen'), 'Hallmanns Kiste mit 0258 geöffnet');
  s.tu('nimm taschenuhr'); s.tu('nimm protokolle'); s.tu('nimm bügelsäge');
  pruefe(HG.welt.getragen('taschenuhr') && HG.welt.getragen('buegelsaege'), 'Taschenuhr und Bügelsäge genommen');
  pruefe(Z().hinweise.includes('hallmann_protokolle'), 'Messprotokolle: „Wie man die MACHT schwächt“');
  // Die Kisten der Vorbesitzer
  ['ostermann-kiste', 'albers-kiste', 'teubner-schachtel', 'brzezinski-kiste', 'brinkhoff-kiste'].forEach(k => s.tu('öffne ' + k));
  pruefe(['kiste_ostermann', 'kiste_albers', 'kiste_teubner', 'kiste_brzezinski', 'kiste_brinkhoff'].every(h => Z().hinweise.includes(h)), 'Alle fünf Kisten: Wissen über die Diener');
  Z().hinweise.push('dreizehn_kreuze');
  pruefe(['heinrich', 'margarete', 'albers', 'wilhelmine', 'josef'].every(id => HG.gefahren.weiss(id)), 'Mit Grundbuch: Geschichte der Diener bekannt');
  Z().hinweise.push('architekt_brinkhoff');
  pruefe(HG.gefahren.weiss('brinkhoff'), 'Brinkhoff: Bauakte + Kiste genügen (statt der Pläne)');
  // Grubenlampe mit Karbid
  s.tu('nimm grubenlampe'); s.tu('nimm karbid');
  pruefe(/leer|Karbid/.test(s.tu('zünde grubenlampe an')), 'Grubenlampe ohne Karbid brennt nicht');
  s.tu('fülle karbid in grubenlampe');
  pruefe(HG.licht.prozent('grubenlampe') === 100, 'Karbid eingefüllt');
  HG.api.bewege('streichhoelzer', 'spieler');
  s.tu('zünde grubenlampe an');
  pruefe(HG.api.eig('grubenlampe', 'brennt'), 'Grubenlampe brennt');
  HG.zufall = () => 0.05;
  HG.api.kampf('die_wandernde', {});
  s.tu('halte die grubenlampe auf sie');
  pruefe(Z().kampf && Z().kampf.halt === 6, 'Grubenlampe im Kampf: HALT −4');
  Z().kampf = null;
  HG.api.zeitVergeht(130);
  pruefe(!HG.api.eig('grubenlampe', 'brennt'), 'Nach gut zwei Stunden ist das Karbid verbraucht');
  // Kellerkette mit der Bügelsäge
  geh(s, 'runter', 'runter', 'norden');
  s.tu('säge kette mit bügelsäge');
  pruefe(Z().flags.kellerkette_offen, 'Kellerkette durchgesägt');
  s.tu('geh runter');
  pruefe(Z().raum === 'kellerflur', 'Durch die Kellertür hinunter in den Kellerflur');
  geh(s, 'hoch');
  // Hallmann bekehren
  Z().hinweise.push('hallmann_brand');
  pruefe(HG.gefahren.weiss('hallmann'), 'Hallmanns Geschichte: Bauakte + Messprotokolle');
  Z().raum = 'speicher'; Z().zeit.minute = 60;
  HG.zustand.setze('handy', 'vorratStand', 100); HG.zustand.setze('handy', 'brennt', true);
  HG.gefahren.erscheine('hallmann');
  s.tu('sprich mit hallmann');
  const satz = HG.spiel.vorschlaege().find(v => /nicht Irmgard am Telefon/.test(v));
  pruefe(!!satz, 'Hallmann: Wahrheit zur Auswahl');
  s.tu(satz);
  pruefe(HG.gefahren.istBekehrt('hallmann'), 'Wolfgang Hallmann bekehrt (sein Nagel ist lose)');
  const vorher = s.bloecke.length;
  HG.handy.anruf('anruf_carsten');
  pruefe(s.bloecke.slice(vorher).some(b => /Nicht rangehen/.test(b.html || '')), 'Hallmanns Hilfe: Warnung bei gefälschtem Anruf');

  // Andere Wege zur Kiste: Handwerk und Gewalt
  const g = imHaus(); const H2 = g.HG;
  H2.zustand.setze('bodenklappe', 'offen', true);
  geh(g, 'hoch', 'hoch');
  H2.api.bewege('feinwerkzeug', 'spieler');
  H2.zufall = () => 0.05;
  g.tu('knacke hallmanns kiste mit werkzeug');
  pruefe(H2.api.eig('hallmann_kiste', 'offen'), 'Hallmanns Kiste mit Handwerk geöffnet');
  const g2 = imHaus(); const H3 = g2.HG;
  H3.zustand.setze('bodenklappe', 'offen', true);
  geh(g2, 'hoch', 'hoch');
  H3.zufall = () => 0.05;
  g2.tu('brich hallmanns kiste auf');
  pruefe(H3.api.eig('hallmann_kiste', 'offen'), 'Hallmanns Kiste aufgebrochen (laut)');
}

// --- 17. Polizeiwache: Nachlass, Kellerschlüssel, Akte, Pistole -------------
{
  console.log('\n17. Polizeiwache: Nachlass → Kellerschlüssel → Akte, Pistole (abgeben, verschwiegen, entdeckt)');
  /** Neues Spiel, morgens um 10 an der Wache. folge: feste Würfelfolge (sonst 0.05 = alles gelingt) */
  function zurWache(opt) {
    const s = imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
    HG.reisen.schalteFrei('polizei');
    s.tu('geh nach süden');
    Z().zeit.minute = (opt && opt.uhr || 10) * 60;
    if (opt && opt.pistole) { HG.api.bewege('pistole', 'spieler'); HG.zustand.setze('pistole', 'geladen', true); }
    if (!(opt && opt.polizei)) Z().beruf = 'journalismus';   // die Testfigur ist sonst Polizistin (Akte ohne Probe)
    HG.zufall = () => 0.05;
    s.tu('fahre zur polizei');
    return s;
  }
  // Vergleichsprobe (Engine)
  {
    const s = zurWache(); const HG = s.HG;
    const folge = (...w) => { let i = 0; HG.zufall = () => w[Math.min(i++, w.length - 1)]; };
    HG.zustand.z.fertigkeiten.schleichen = 40;
    folge(0.29, 0.49); pruefe(HG.api.vergleich('schleichen', 60, { versteckt: true }).verloren, 'Vergleich: beide schaffen es (30 gegen 50) – der höhere Wurf gewinnt');
    folge(0.39, 0.09); pruefe(HG.api.vergleich('schleichen', 60, { versteckt: true }).gewonnen, 'Vergleich: 40 schlägt 10');
    folge(0.97, 0.97); pruefe(HG.api.vergleich('schleichen', 60, { versteckt: true }).patt, 'Vergleich: beide scheitern → Patt');
    folge(0.97, 0.19); pruefe(HG.api.vergleich('schleichen', 60, { versteckt: true }).verloren, 'Vergleich: nur der Gegner schafft es');
    folge(0.10, 0.49); pruefe(HG.api.vergleich('schleichen', 60, { versteckt: true }).gewonnen, 'Vergleich: kritischer Erfolg (11) schlägt normalen');
    const vorher = s.bloecke.length;
    folge(0.29, 0.49); HG.api.vergleich('schleichen', 60, { versteckt: true });
    pruefe(s.bloecke.length === vorher, 'Verdeckter Vergleich: kein Würfelblock');
  }
  // Weg 1: ohne Pistole – Bildschirm, Unterschrift, Schlüssel, Akte per Überreden
  const s = zurWache(); const HG = s.HG, Z = () => HG.zustand.z;
  pruefe(Z().raum === 'polizei', 'Ankunft an der Polizeiwache');
  pruefe(HG.welt.imUmfeld('jansen'), 'Bei Tag sitzt Frau Jansen am Tresen');
  pruefeMenues(s, 'Polizeiwache');
  pruefe(/Begleitung/.test(s.tu('geh nach osten')), 'Ohne Begleitung kein Zutritt nach hinten');
  s.tu('frage jansen nach carstens sachen');
  pruefe(Z().raum === 'polizei_buero' && Z().flags.jansen_weg, 'Jansen führt in den Besprechungsraum und holt den Karton');
  pruefeMenues(s, 'Besprechungsraum (Jansen weg)');
  s.tu('lies bildschirm');
  pruefe(Z().hinweise.includes('polizeiakte_haeuser'), 'Bildschirm: Vorgang Häuser gelesen');
  s.tu('warte');
  pruefe(HG.welt.imUmfeld('nachlass_karton') && HG.welt.imUmfeld('jansen'), 'Jansen kommt mit dem Karton zurück');
  pruefe(/unterschreiben/.test(s.tu('öffne karton')), 'Karton erst nach der Unterschrift');
  pruefe(/Erst unterschreiben|Moment/.test(s.tu('geh nach westen')) && Z().raum === 'polizei_buero', 'Gehen erst nach der Unterschrift');
  pruefe(/sieben/.test(s.tu('lies protokoll')), 'Übergabeprotokoll: Position 7 (Rasiermesser)');
  s.tu('unterschreibe protokoll');
  pruefe(Z().flags.nachlass_erhalten, 'Protokoll unterschrieben');
  pruefeMenues(s, 'Besprechungsraum (Karton offen)');
  s.tu('nimm schlüsselbund');
  pruefe(HG.welt.getragen('carstens_schluessel'), 'Carstens Schlüsselbund mit dem Kellerschlüssel');
  s.tu('öffne geldbörse'); s.tu('nimm foto');
  pruefe(Z().handy.fotos.some(f => f.id === 'foto_familienfeier'), 'Foto von der Familienfeier fotografiert');
  s.tu('geh nach westen');
  pruefe(Z().raum === 'polizei' && HG.api.eig('nachlass_karton', 'ort') === 'tresen_wache', 'Zurück am Tresen, der Karton steht dort');
  HG.zufall = () => 0.97;
  s.tu('frage jansen nach der akte');
  pruefe(!Z().flags.akte_gezeigt && Z().flags.akte_abgelehnt, 'Überreden misslungen: keine Akte');
  const t2 = s.tu('frage jansen nach der akte');
  pruefe(/Nein gesagt/.test(t2) && s.bloecke.some(b => b.typ === 'tipp'), 'Am selben Tag nicht noch einmal, mit gestaffeltem Hinweis');
  Z().zeit.tag++; Z().zeit.minute = 10 * 60; HG.zufall = () => 0.05;
  s.tu('frage jansen nach der akte');
  pruefe(Z().flags.akte_gezeigt, 'Am nächsten Tag: Überreden gelungen');
  s.tu('lies akte');
  pruefe(Z().hinweise.includes('polizeiakte_romanow'), 'Akte Romanow gelesen');
  pruefe(!HG.gefahren.weiss('natascha'), 'Natascha: ohne den Online-Artikel reicht die Akte allein nicht');
  Z().hinweise.push('natascha_romanow');
  pruefe(HG.gefahren.weiss('natascha'), 'Nataschas Geschichte: Online-Artikel + Polizeiakte');
  Z().hinweise.push('tb_wandlung', 'testament');
  pruefe(HG.gefahren.weiss('carsten'), 'Carstens Geschichte: Tagebuch + Testament + Polizeiakte');
  // Kellerkette mit dem Schlüssel
  s.tu('fahre zum haus'); s.tu('geh nach norden');
  geh(s, 'norden');
  pruefe(Z().raum === 'flur', 'Im Flur vor der Kellertür');
  s.tu('schließe kette auf');
  pruefe(Z().flags.kellerkette_offen && Z().flags.kellerkette_aufgeschlossen, 'Kellerkette mit Carstens Schlüssel aufgeschlossen');
  pruefe(/aufgeschlossen/.test(s.tu('untersuche kellertür')), 'Kellertür: Kette aufgeschlossen, nicht durchtrennt');

  // Weg 2: Pistole freiwillig abgeben → Akte ohne Probe
  {
    const g = zurWache({ pistole: true }); const H = g.HG, Z2 = () => H.zustand.z;
    g.tu('frage jansen nach carstens sachen');
    pruefe(H.spiel.offen && H.spiel.offen.art === 'auswahl', 'Mit Pistole: Auswahl vor der Sicherheitstür');
    g.tu('1');
    pruefe(Z2().flags.pistole_abgegeben && !H.welt.getragen('pistole'), 'Pistole abgegeben');
    pruefe(Z2().raum === 'polizei_buero', 'Danach geht es nach hinten');
    g.tu('warte'); g.tu('warte');
    H.zufall = () => 0.97;   // Überreden würde misslingen
    g.tu('frage jansen nach der akte');
    pruefe(Z2().flags.akte_gezeigt, 'Vertrauen: Akte ohne Probe');
  }
  // Weg 3: Pistole verschwiegen – Patt im verdeckten Wurf, sie fällt nicht auf
  {
    const g = zurWache({ pistole: true }); const H = g.HG, Z2 = () => H.zustand.z;
    g.tu('frage jansen nach carstens sachen'); g.tu('2');
    g.tu('warte'); g.tu('warte');
    H.zufall = () => 0.97;
    const t = g.tu('unterschreibe protokoll');
    pruefe(!Z2().flags.pistole_entdeckt && H.welt.getragen('pistole'), 'Pistole verschwiegen: nicht bemerkt (beide scheitern)');
    pruefe(!/W100/.test(t), 'Der Wurf bleibt verdeckt');
  }
  // Weg 4: Pistole verschwiegen – Jansen gewinnt den Vergleich
  {
    const g = zurWache({ pistole: true }); const H = g.HG, Z2 = () => H.zustand.z;
    g.tu('frage jansen nach carstens sachen'); g.tu('nichts sagen und mitgehen');
    g.tu('warte'); g.tu('warte');
    let i = 0; const w = [0.97, 0.30]; H.zufall = () => (i < w.length ? w[i++] : 0.5);
    g.tu('unterschreibe protokoll');
    pruefe(Z2().flags.pistole_entdeckt && !H.welt.getragen('pistole'), 'Pistole entdeckt und abgenommen');
    pruefe(Z2().flags.nachlass_erhalten, 'Den Nachlass bekommt man trotzdem (keine Sackgasse)');
    g.tu('nimm schlüsselbund');
    pruefe(H.welt.getragen('carstens_schluessel'), 'Kellerschlüssel trotz entdeckter Pistole');
    H.zufall = () => 0.05;
    g.tu('frage jansen nach der akte');
    pruefe(Z2().flags.akte_gezeigt, 'Akte nach entdeckter Pistole noch per Überreden (−20) erreichbar');
  }
  // Beruf Polizei: Akte ohne Probe
  {
    const g = zurWache({ polizei: true }); const H = g.HG;
    H.zufall = () => 0.97;
    g.tu('frage jansen nach der akte');
    pruefe(H.zustand.z.flags.akte_gezeigt, 'Beruf Polizei: Akte ohne Probe');
  }
  // Weg 5: nachts – Wolters, Pistole bei ihm abgeben, am Morgen Akte bei Jansen
  {
    const g = zurWache({ pistole: true, uhr: 23 }); const H = g.HG, Z2 = () => H.zustand.z;
    pruefe(H.welt.imUmfeld('wolters') && !H.welt.imUmfeld('jansen'), 'Nachts sitzt Wolters am Tresen');
    pruefeMenues(g, 'Polizeiwache (Nacht)');
    pruefe(/morgen/.test(g.tu('frage wolters nach carstens sachen')), 'Nachlass nachts: „Kommen Sie morgen“');
    g.tu('gib die pistole ab');
    pruefe(Z2().flags.pistole_abgegeben && Z2().flags.pistole_bei_wolters, '„gib die pistole ab“ bei Wolters');
    Z2().zeit.tag++; Z2().zeit.minute = 9 * 60; g.tu('warte');
    pruefe(H.welt.imUmfeld('jansen'), 'Am Morgen übernimmt Jansen');
    H.zufall = () => 0.97;
    g.tu('frage jansen nach der akte');
    pruefe(Z2().flags.akte_gezeigt, 'Wolters’ Zettel: Akte ohne Probe');
  }
}

// --- 18. Keller und Ritualraum ------------------------------------------------
{
  console.log('\n18. Keller: Räume → fehlende Wand (Laser, Zollstock, Klopfen, blind, Natascha) → Durchbruch → Kreis brechen → Gefahren, Salz, Neumond');
  const KELLER = ['kellerflur', 'vorratskeller', 'weinkeller', 'waschkueche', 'heizungskeller', 'ritualraum'];
  /** Neues Spiel, Kellerkette offen, mit Licht im Flur vor der Kellertür */
  function imKeller(opt) {
    const s = imHaus(opt); const HG = s.HG;
    HG.zustand.z.flags.kellerkette_offen = true;
    geh(s, 'norden');
    return s;
  }
  const s = imKeller(); const HG = s.HG; const Z = () => HG.zustand.z;
  KELLER.forEach(r => {
    const ev = Object.keys(HG.daten.spuk).map(k => HG.daten.spuk[k]).filter(d => (d.orte || []).includes(r));
    pruefe(ev.some(d => !d.zeiten || d.zeiten.some(z => z === 'morgen' || z === 'mittag')) && ev.some(d => !d.zeiten || d.zeiten.includes('nacht')), r + ': Spuk bei Tag und bei Nacht vorhanden');
    const aus = HG.daten.raeume[r].ausgaenge || {};
    pruefe(!Object.keys(aus).some(k => { const a = aus[k]; const z = typeof a === 'string' ? a : a.ziel; return z && !HG.daten.raeume[z]; }), r + ': alle Ausgänge führen zu Räumen');
    pruefe(!!HG.plan.finde(HG.daten.plaene.haus, r), r + ': steht im Bauplan');
  });
  // Neumond: Nacht 7, danach alle 14 Nächte (David, 27.11.2026)
  pruefe(HG.nacht.bisNeumond(1) === 6 && HG.nacht.istNeumond(7) && HG.nacht.bisNeumond(8) === 13 && HG.nacht.istNeumond(21) && HG.nacht.istNeumond(35) && HG.nacht.bisNeumond(22) === 13 && !HG.nacht.istNeumond(3), 'Neumond: Nacht 7, dann Nacht 21, 35 …');

  s.tu('geh runter');
  pruefe(Z().raum === 'kellerflur', 'Die Kellertreppe hinunter in den Kellerflur');
  pruefeMenues(s, 'Kellerflur');
  pruefe(/silbrig/.test(s.tu('schalte hauptschalter ein')), 'Sicherungskasten: Licht von oben (Stimmung)');
  pruefe(/Heizung/.test(s.tu('klopfe an vermauerte tür')), 'Vermauerte Tür: dahinter die Heizung');
  geh(s, 'westen'); pruefeMenues(s, 'Vorratskeller');
  pruefe(/Für Heinrich/.test(s.tu('untersuche einmachgläser')), 'Einmachgläser von Margarete Ostermann');
  geh(s, 'süden'); pruefeMenues(s, 'Weinkeller');
  pruefe(/Hier nicht/.test(s.tu('versteck dich')), 'Weinkeller: hier versteckt man sich nicht');
  geh(s, 'norden', 'osten', 'osten'); pruefeMenues(s, 'Waschküche');
  s.tu('nimm salz');
  pruefe(HG.welt.getragen('salz') && HG.api.eig('salz', 'anzahl') === 3, 'Salz für drei Linien eingesteckt');
  geh(s, 'süden');
  pruefe(Z().raum === 'heizungskeller' && !HG.spiel.ausgaenge().some(a => a.id === 'westen'), 'Heizungskeller: kein Weg nach Westen (noch)');
  pruefeMenues(s, 'Heizungskeller');
  s.tu('geh nach westen');
  pruefe(Z().raum === 'heizungskeller', 'Die Westwand ist zu');
  // Weg 1 (Kopf): Laser + Plan
  HG.api.bewege('laser', 'spieler');
  s.tu('miss raum mit laser');
  pruefe(!Z().flags.wand_gefunden && Z().flags.wand_gemessen, 'Ohne den Bauplan: 10,60 m, aber kein Vergleich');
  Z().hinweise.push('carstens_plan');
  pruefe(/2,40/.test(s.tu('benutze laser')), '„benutze laser“ mit Plan: es fehlen 2,40 m');
  pruefe(Z().flags.wand_gefunden && Z().hinweise.includes('fehlende_wand'), 'Westwand markiert, Hinweis „Die Wand im Heizungskeller“');
  // Durchbrechen bei Nacht: nach dem zweiten Schlag kommt die Wandernde
  HG.zufall = () => 0.05;
  Z().zeit.minute = 22 * 60;
  s.tu('zerschlage wand mit vorschlaghammer');
  pruefe(HG.api.eig('kellerwand', 'treffer') === 1 && HG.welt.getragen('vorschlaghammer'), 'Erster Treffer (Hammer von der Werkbank)');
  s.tu('zerschlage wand mit vorschlaghammer');
  pruefe(Z().kampf && Z().kampf.id === 'die_wandernde', 'Nachts: Lärm lockt die Wandernde');
  Z().kampf = null;
  s.tu('schlag die wand ein');
  pruefe(Z().flags.wand_durch && HG.spiel.ausgaenge().some(a => a.id === 'westen'), 'Dritter Treffer: Durchbruch, Weg nach Westen offen');
  geh(s, 'westen');
  pruefe(Z().raum === 'ritualraum', 'Im Ritualraum');
  pruefeMenues(s, 'Ritualraum');
  let t = s.tu('lies kalender');
  pruefe(Z().hinweise.includes('kalender_kraehe') && /1929/.test(t) && /Striche|heute/.test(t), 'Kalender der Krähe: Zwölferblöcke, Skizze, Countdown');
  s.tu('untersuche nägel');
  pruefe(Z().hinweise.includes('dreizehn_naegel'), 'Dreizehn Nägel (Hinweis)');
  // Falsche Ordnung → Die Tür
  s.tu('nimm die kohle');
  pruefe(Z().kampf && Z().kampf.id === 'die_tuer' && !HG.api.eig('kreis_kohle', 'entfernt'), 'Falsche Ordnung: „Die Tür“ greift heraus, der Kreis ist wieder ganz');
  Z().kampf = null;
  s.tu('entferne den namen'); s.tu('entferne das blut');
  pruefe(HG.api.eig('kreis_blut', 'entfernt') && !Z().kampf, 'Name und Blut in der richtigen Ordnung');
  s.tu('entferne die knochen');
  const machtVorher = HG.macht.wert();
  s.tu('wische die kohle weg');
  pruefe(Z().flags.kreis_gebrochen && Z().hinweise.includes('kreis_gebrochen'), 'Den Kreis rückwärts gebrochen');
  pruefe(HG.macht.wert() < machtVorher - 15 && !HG.macht.groesse('schwarze_scheibe'), 'MACHT sinkt deutlich, die Scheibe spiegelt nicht mehr');
  Z().hinweise.push('kraehe_gebetbuch');
  HG.spiel.kombiniereHinweise('kalender_kraehe', 'kraehe_gebetbuch');
  pruefe(Z().schluesse.includes('kreis_rueckwaerts'), 'Schlussfolgerung „Den Kreis rückwärts brechen“');
  Z().hinweise.push('vogelschaedel');
  HG.spiel.kombiniereHinweise('kalender_kraehe', 'vogelschaedel');
  pruefe(Z().schluesse.includes('nacht_der_tuer'), 'Schlussfolgerung „Die Nacht der Tür“');
  pruefe(/winzigen Loch/.test(HG.wert(HG.daten.dinge.puppenhaus.beschreibung, HG.api)), 'Puppenhaus: der Streifen hinter der Wand hat ein Loch');

  // Weg 2: Zollstock von Hand (erst verzählt, dann richtig)
  {
    const g = imKeller(); const H = g.HG; const Z2 = () => H.zustand.z;
    Z2().raum = 'heizungskeller'; Z2().hinweise.push('carstens_plan');
    H.zufall = () => 0.97;
    pruefe(/verzählst/.test(g.tu('miss raum')) && !Z2().flags.wand_gefunden, 'Zollstock: verzählt');
    H.zufall = () => 0.05;
    g.tu('miss raum');
    pruefe(Z2().flags.wand_gefunden && H.welt.getragen('zollstock'), 'Zollstock: Westwand gefunden');
  }
  // Weg 3: Wände abklopfen (Wahrnehmung −20)
  {
    const g = imKeller(); const H = g.HG; const Z2 = () => H.zustand.z;
    Z2().raum = 'heizungskeller'; Z2().fertigkeiten.wahrnehmung = 60;
    H.zufall = () => 0.05;
    g.tu('klopfe an westwand');
    pruefe(Z2().flags.wand_gefunden, 'Abklopfen: hohl an der Westwand');
  }
  // Weg 4: blind schlagen – teuer, aber keine Sackgasse
  {
    const g = imKeller(); const H = g.HG; const Z2 = () => H.zustand.z;
    Z2().raum = 'heizungskeller';
    const lp = Z2().werte.lp;
    g.tu('zerschlage wand');
    pruefe(!Z2().flags.wand_gefunden && Z2().werte.lp < lp, 'Blind geschlagen: Nordwand, Rückschlag');
    g.tu('zerschlage wand');
    pruefe(Z2().flags.wand_gefunden, 'Zweiter Versuch: die Westwand klingt hohl');
    // Bei Tag ist die Wand härter; die Treffer heilen um drei Uhr
    H.zufall = () => 0.05; g.tu('zerschlage wand');
    pruefe(H.api.eig('kellerwand', 'treffer') === 1, 'Treffer bei Tag');
    Z2().zeit.minute = 2 * 60 + 58; H.api.zeitVergeht(5);
    pruefe(H.api.eig('kellerwand', 'treffer') === 0 && /wie am ersten Tag/.test(g.tu('untersuche westwand')), 'Um drei Uhr ist die Wand wieder heil');
  }
  // Weg 5: Natascha (bekehrt) zeigt die Stelle
  {
    const g = imKeller(); const H = g.HG; const Z2 = () => H.zustand.z;
    H.gefahren.st().seelen.natascha = 'bekehrt';
    Z2().raum = 'waschkueche'; geh(g, 'süden');
    pruefe(Z2().flags.wand_gefunden, 'Natascha zeigt die Stelle an der Westwand');
  }
  // Okkultismus erkennt die Ordnung; Scheibe zerschlagen stärkt das Haus
  {
    const g = imKeller(); const H = g.HG; const Z2 = () => H.zustand.z;
    Z2().flags.wand_durch = true; Z2().raum = 'ritualraum'; Z2().fertigkeiten.okkultismus = 90;
    H.zufall = () => 0.05;
    pruefe(/zuerst der Name/.test(g.tu('untersuche kreis')) && Z2().flags.kreis_ordnung, 'Okkultismus: die Ordnung erkannt');
    H.api.bewege('vorschlaghammer', 'spieler'); H.macht.setze(50);
    g.tu('zerschlage die scheibe');
    pruefe(H.api.eig('schwarze_scheibe', 'zerbrochen') && H.macht.wert() > 60, 'Scheibe zerschlagen: das Haus wird stärker');
    Z2().zeit.tag++; Z2().zeit.minute = 2 * 60 + 58; H.api.zeitVergeht(5); g.tu('warte');
    pruefe(!H.api.eig('schwarze_scheibe', 'zerbrochen'), 'Um drei Uhr ist die Scheibe wieder heil');
  }
  // Gefahren im Keller: Witwe auf der Kellertreppe, Gas im Weinkeller, Zerschlagender in der Waschküche, Salz
  {
    const g = imKeller(); const H = g.HG; const Z2 = () => H.zustand.z;
    Z2().zeit.minute = 60;
    H.zufall = () => 0.97;
    H.gefahren.loese('witwe', { ausgang: H.daten.raeume.flur.ausgaenge.runter, richtung: 'runter' });
    pruefe(/Kellertreppe/.test(g.bloecke.slice(-6).map(b => b.html || '').join(' ')), 'Witwe: eigenes Bild auf der Kellertreppe');
    g.tu('Einfach weitergehen');
    pruefe(Z2().raum === 'kellerflur', 'Sturz auf der Kellertreppe: unten im Kellerflur');
    Z2().raum = 'weinkeller'; Z2().gefahren.nacht = {};
    H.gefahren.loese('gas');
    g.tu('Raus in den Vorratskeller');
    pruefe(Z2().raum === 'vorratskeller', 'Das Gas im Weinkeller: in den Vorratskeller geflohen');
    Z2().raum = 'waschkueche';
    pruefe(H.daten.gefahren.zerschlagende.bedingung(H.api), 'Der Zerschlagende: der Spiegel der Waschküche reicht');
    H.gefahren.loese('zerschlagende');
    pruefe(Z2().kampf && Z2().kampf.spiegel === 'waschkueche_spiegel', 'Der Zerschlagende greift aus dem Spiegel der Waschküche');
    Z2().kampf = null;
    // Salzlinie: die Wandernde kommt nicht herein
    Z2().raum = 'vorratskeller'; H.api.bewege('salz', 'spieler');
    g.tu('streue salz');
    pruefe(H.gefahren.geschuetzt('vorratskeller') && H.api.eig('salz', 'anzahl') === 2, 'Salzlinie im Vorratskeller');
    Z2().raum = 'vorratskeller';   // (falls ein Schock die Figur weggetrieben hat)
    H.gefahren.st().wanderer = { raum: 'kellerflur', nacht: H.nacht.nummer(), zuletzt: -9999 };
    H.zufall = () => 0.05;
    H.gefahren.wandererZug();
    pruefe(!Z2().kampf && H.gefahren.st().wanderer.raum === 'kellerflur', 'Die Wandernde bleibt vor der Salzlinie stehen');
  }
}

// --- 19. Wohnung Gerdes: drei Wege durch die Tür, Brigittes Geschichte, Bettinas Referat --------
{
  console.log('\n19. Wohnung Gerdes: Tür (Nummern, Haarspange, Überreden) → Brigittes Geschichte → Referat');
  /** Neues Spiel (im Haus gewesen), mittags in Unna vor der Tür. */
  function zuGerdes(opt) {
    const s = imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
    HG.reisen.schalteFrei('gerdes');
    s.tu('geh nach süden');
    Z().zeit.minute = 12 * 60;
    if (opt && opt.nummern) Z().hinweise.push('fremde_nummern');
    if (opt && opt.spange) { HG.api.bewege('haarspange', 'spieler'); HG.zustand.setze('haarspange', 'versteckt', false); }
    HG.zufall = () => (opt && opt.wurf) || 0.05;
    s.tu('fahre nach unna');
    return s;
  }
  // Weg 1: Kopf – „Schreibt es Ihnen auch?“
  {
    const s = zuGerdes({ nummern: true }); const HG = s.HG, Z = () => HG.zustand.z;
    pruefe(Z().raum === 'gerdes', 'Ankunft vor der Wohnung Gerdes');
    pruefeMenues(s, 'Treppenhaus Gerdes');
    pruefe(/Kette/.test(s.tu('geh hinein')) && Z().raum === 'gerdes', 'Ohne Brigittes Vertrauen bleibt die Kette vor');
    s.tu('sprich mit brigitte');
    pruefe(s.HG.spiel.offen && s.HG.spiel.offen.art === 'auswahl', 'Brigitte: Auswahl an der Tür');
    s.tu('2');
    pruefe(Z().raum === 'gerdes_wohnung' && Z().flags.gerdes_herein, 'Kopf: Die Frage nach den fremden Nummern öffnet die Tür');
    pruefeMenues(s, 'Wohnzimmer Gerdes');
    s.tu('frage brigitte nach bettina');
    pruefe(Z().hinweise.includes('gespraech_brigitte'), 'Brigittes Geschichte im Notizbuch');
    pruefe(!HG.gefahren.weiss('bettina'), 'Bettina: Brigitte allein reicht nicht (Zeitungsausschnitt fehlt)');
    Z().hinweise.push('bettina_gerdes');
    pruefe(HG.gefahren.weiss('bettina'), 'Bettinas Geschichte: Zeitungsausschnitt + Brigitte');
    s.tu('frage brigitte nach dem altenheim');
    pruefe(HG.welt.imUmfeld('referat_bettina'), 'Brigitte legt Bettinas Referat auf den Tisch');
    s.tu('lies referat'); s.tu('nimm referat');
    pruefe(Z().hinweise.includes('bettinas_referat') && Z().ziele.altenheim, 'Referat gelesen: Lotte W. im Lindenhof, Altenheim frei');
    pruefe(Z().handy.fotos.some(f => f.id === 'referat_bettina'), 'Das Referat landet als Foto in der Galerie');
    s.tu('frage brigitte nach dem handy'); s.tu('warte'); s.tu('warte');
    pruefe(Z().flags.bettina_sms, 'Eine Nachricht von Bettinas Nummer');
    s.tu('lies trauerkarte');
    pruefe(!/kenne ich nicht|siehst hier nichts/.test(s.tu('untersuche foto')), 'Bettinas Foto mit der Haarspange');
    s.tu('geh hinaus');
    pruefe(Z().raum === 'gerdes' && /angelehnt/.test(s.tu('schau')), 'Draußen ist die Tür angelehnt');
    s.tu('geh hinein');
    pruefe(Z().raum === 'gerdes_wohnung', 'Beim zweiten Mal geht es direkt hinein');
  }
  // Weg 2: Anker – Bettinas Haarspange
  {
    const s = zuGerdes({ spange: true }); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('zeige brigitte die haarspange');
    pruefe(Z().raum === 'gerdes_wohnung' && HG.welt.getragen('haarspange'), 'Anker: Die Haarspange öffnet die Tür, die Spange bleibt bei dir');
  }
  // Weg 3: Fertigkeit – Überreden; misslungen: heute nicht mehr, mit Hinweisen; Altenheim trotzdem frei
  {
    const s = zuGerdes({ wurf: 0.97 }); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('sprich mit brigitte'); s.tu('2');
    pruefe(Z().raum === 'gerdes' && Z().flags.brigitte_abgewiesen, 'Überreden misslungen: die Tür bleibt zu');
    pruefe(Z().hinweise.includes('brigitte_altenheim'), 'Trotzdem schickt Brigitte einen ins Altenheim (keine Sackgasse)');
    s.tu('sprich mit brigitte');
    pruefe(s.bloecke.some(b => b.typ === 'tipp'), 'Gestaffelter Hinweis an der Tür');
    Z().zeit.tag++; Z().zeit.minute = 10 * 60; HG.zufall = () => 0.05;
    s.tu('sprich mit brigitte'); s.tu('2');
    pruefe(Z().raum === 'gerdes_wohnung', 'Am nächsten Tag: Überreden gelungen');
    const t = s.tu('sprich mit brigitte');
    pruefe(!/^true$/m.test(t), 'Kein „true“ in der Ausgabe');
  }
  // Nachts öffnet niemand
  {
    const s = imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
    HG.reisen.schalteFrei('gerdes'); s.tu('geh nach süden');
    Z().zeit.minute = 22 * 60;
    pruefe(/morgen ab acht/.test(s.tu('fahre nach unna')) && Z().raum !== 'gerdes', 'Nachts fährt man nicht zu Brigitte');
  }
}

// --- 20. Altenheim: Lotte Wiegand ------------------------------------------------------------
{
  console.log('\n20. Altenheim: Lavendel → Lotte (vormittags, Kopf, Erste Hilfe, Pflegekraft) → zwei Gesichter, Ring');
  function zumLindenhof(opt) {
    const s = opt && opt.nieImHaus ? prolog() : imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
    HG.reisen.schalteFrei('altenheim');
    if (!(opt && opt.nieImHaus)) s.tu('geh nach süden');
    else { s.tu('öffne umschlag'); s.tu('lies notarbrief'); }
    Z().zeit.minute = (opt && opt.uhr || 14) * 60;
    if (opt && opt.beruf) Z().beruf = opt.beruf; else Z().beruf = 'journalismus';
    HG.zufall = () => (opt && opt.wurf) || 0.05;
    s.tu('fahre zum altenheim');
    return s;
  }
  // Wer im Haus war, den erkennt Lotte am Lavendel
  {
    const s = zumLindenhof(); const HG = s.HG, Z = () => HG.zustand.z;
    pruefe(Z().raum === 'altenheim', 'Ankunft am Empfang im Lindenhof');
    pruefeMenues(s, 'Empfang Lindenhof');
    s.tu('frage pflegerin nach dem ulmenweg');
    pruefe(Z().flags.arslan_lotte, 'Frau Arslan nennt Lotte Wiegand');
    s.tu('geh nach norden');
    pruefe(Z().flags.lotte_lavendel && Z().flags.lotte_klar === Z().zeit.tag, '„Sie werden’s merken“: Lotte erkennt den Lavendel');
    pruefeMenues(s, 'Aufenthaltsraum');
    s.tu('frage lotte nach der gnädigen frau');
    pruefe(Z().hinweise.includes('lotte_zwei_gesichter'), 'Lotte: zwei Gesichter');
    pruefe(!HG.spiel.vorschlaege().includes('frage lotte nach dem ring'), 'Lotte: „frage nach dem Ring“ erst, wenn man den Ehering gefunden hat');
    s.tu('frage lotte nach dem ring');
    pruefe(!Z().hinweise.includes('lotte_ring'), 'Ohne Ehering erzählt Lotte nichts vom Ring');
    HG.zustand.setze('ehering', 'ort', 'spieler');
    pruefe(HG.spiel.vorschlaege().includes('frage lotte nach dem ring'), 'Mit Ehering: „frage lotte nach dem ring“');
    s.tu('frage lotte nach dem ring');
    pruefe(Z().hinweise.includes('lotte_ring'), 'Lotte: der Ring');
    Z().hinweise.push('elisabeths_siegel', 'elisabeths_ring');
    const sl = Object.values(HG.daten.schluesse);
    pruefe(sl.find(x => x.id === 'zwei_elisabeths').aus.includes('lotte_zwei_gesichter') && sl.find(x => x.id === 'ring_wartet').aus.includes('lotte_ring'), 'Lottes Aussagen zählen für „Zwei Elisabeths“ und „Der Ring wartet“');
  }
  // Nachmittags, nie im Haus gewesen: verwirrt → Hinweise → Erste Hilfe misslingt (döst) → gelingt
  {
    const s = zumLindenhof({ nieImHaus: true, wurf: 0.97 }); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('geh nach norden');
    pruefe(!Z().flags.lotte_klar, 'Nie im Haus gewesen: Lotte erkennt einen nicht');
    s.tu('frage lotte nach dem ring'); s.tu('frage lotte nach dem ring');
    pruefe(!Z().hinweise.includes('lotte_ring') && s.bloecke.some(b => b.typ === 'tipp'), 'Verwirrt: kein Hinweis, aber gestaffelte Tipps');
    s.tu('sprich mit lotte'); s.tu('1');
    pruefe(Z().flags.lotte_doest, 'Erste Hilfe misslungen: Lotte nickt ein');
    s.tu('warte 30 minuten'); HG.zufall = () => 0.05;
    s.tu('sprich mit lotte'); s.tu('1');
    pruefe(Z().flags.lotte_klar === Z().zeit.tag, 'Erste Hilfe gelungen: Lotte ist wieder da');
    HG.zustand.setze('ehering', 'ort', 'spieler');
    s.tu('frage lotte nach dem ring');
    pruefe(Z().hinweise.includes('lotte_ring'), 'Danach erzählt sie vom Ring');
  }
  // Kopf: nach der Kammer fragen (Ritzung bekannt) · Zeit: vormittags · Beruf: Pflegekraft
  {
    const s = zumLindenhof({ nieImHaus: true }); const HG = s.HG, Z = () => HG.zustand.z;
    Z().hinweise.push('zwei_gesichter');
    s.tu('geh nach norden'); s.tu('frage lotte nach der kammer');
    pruefe(Z().flags.lotte_klar === Z().zeit.tag, 'Kopf: Die Frage nach ihrer Kammer holt Lotte zurück');
    const v = zumLindenhof({ nieImHaus: true, uhr: 10 });
    v.tu('geh nach norden'); v.tu('frage lotte nach der gnädigen frau');
    pruefe(v.HG.zustand.z.hinweise.includes('lotte_zwei_gesichter'), 'Zeit: Vormittags ist Lotte klar');
    const p = zumLindenhof({ nieImHaus: true, beruf: 'pflege' });
    p.tu('geh nach norden'); p.tu('frage lotte nach der gnädigen frau');
    pruefe(p.HG.zustand.z.hinweise.includes('lotte_zwei_gesichter'), 'Beruf Pflegekraft: Lotte ist klar');
  }
  // Abends spiegelt die Scheibe
  {
    const s = zumLindenhof({ uhr: 18 }); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('geh nach norden');
    pruefe(Z().flags.spiegel_lindenhof === Z().zeit.tag, 'Abends: die Frau in der Scheibe (NERVEN-Probe)');
  }
}

// --- 21. Frau Kolbe: Nachbarhaus, drei Wege zum Vertrauen, Renate und Hallmann --------------
{
  console.log('\n21. Frau Kolbe: Weg von der Einfahrt → verschlossen → Kommentar/Notenheft/Taschenuhr/Überreden → Renate, Hallmann');
  function zuKolbe(opt) {
    const s = imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('geh nach süden');
    Z().zeit.minute = (opt && opt.uhr || 11) * 60;
    (opt && opt.hinweise || []).forEach(h => Z().hinweise.push(h));
    if (opt && opt.uhrDabei) HG.api.bewege('taschenuhr', 'spieler');
    HG.zufall = () => (opt && opt.wurf) || 0.05;
    s.tu('geh nach westen');
    return s;
  }
  // Kopf: der Kommentar unter Nataschas Artikel
  {
    const s = zuKolbe({ hinweise: ['natascha_romanow'] }); const HG = s.HG, Z = () => HG.zustand.z;
    pruefe(Z().raum === 'kolbe', 'Von der Einfahrt zu Fuß nach Westen: vor dem Haus Kolbe');
    pruefeMenues(s, 'Vor dem Haus Kolbe');
    s.tu('geh hinein');
    pruefe(Z().raum === 'kolbe_kueche', 'Tagsüber lässt sie einen in die Küche');
    pruefeMenues(s, 'Küche Kolbe');
    s.tu('frage frau kolbe nach renate');
    pruefe(!Z().hinweise.includes('kolbe_renate') && s.HG.spiel.offen && s.HG.spiel.offen.art === 'auswahl', 'Beim Thema Haus wird sie verschlossen: Auswahl');
    s.tu('2');
    pruefe(Z().flags.kolbe_vertraut, 'Kopf: Ihr eigener Kommentar überzeugt sie');
    s.tu('frage frau kolbe nach renate');
    pruefe(Z().hinweise.includes('kolbe_renate'), 'Renate: 2. Quelle im Notizbuch');
    Z().hinweise.push('renate_vogt');
    pruefe(HG.gefahren.weiss('renate'), 'Renates Geschichte: Notenheft + Frau Kolbe');
    s.tu('frage frau kolbe nach hallmann');
    pruefe(Z().hinweise.includes('kolbe_hallmann') && Z().ziele.stadtarchiv, 'Hallmann: Irmgards Stimme am Telefon, Stadtarchiv frei');
    Z().hinweise.push('hallmann_brand');
    pruefe(HG.gefahren.weiss('hallmann'), 'Hallmanns Geschichte: Bauakte + Frau Kolbe');
    ['carsten', 'natascha', 'bettina', 'spiegel', 'brzezinski', 'brinkhoff', 'knie'].forEach(t => {
      const a = s.tu('frage frau kolbe nach ' + t);
      pruefe(!/^true$/m.test(a) && a.length > 40, 'Frau Kolbe antwortet zu „' + t + '“');
    });
    pruefe(!/lieber nicht/.test(s.tu('trink kaffee')) && !/lieber nicht/.test(s.tu('iss gebäck')), 'Kaffee und Gebäck: iss / trink');
    s.tu('geh hinaus'); s.tu('geh nach osten');
    pruefe(Z().raum === 'einfahrt', 'Zurück zur Einfahrt');
  }
  // Kopf: Renates Notenheft · Anker: die Taschenuhr
  {
    const s = zuKolbe({ hinweise: ['renate_vogt'] }); const Z = () => s.HG.zustand.z;
    s.tu('geh hinein'); s.tu('frage frau kolbe nach dem haus'); s.tu('2');
    pruefe(Z().flags.kolbe_vertraut, 'Kopf: Renates Satz aus dem Notenheft überzeugt sie');
    const u = zuKolbe({ uhrDabei: true }); const Zu = () => u.HG.zustand.z;
    u.tu('geh hinein'); u.tu('zeige frau kolbe die taschenuhr');
    pruefe(Zu().flags.kolbe_vertraut && u.HG.welt.getragen('taschenuhr'), 'Anker: Hallmanns Taschenuhr – sie erkennt sie, die Uhr bleibt bei dir');
  }
  // Fertigkeit: Überreden misslingt → heute nicht mehr, Tipps → nächster Tag gelingt
  {
    const s = zuKolbe({ wurf: 0.97 }); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('geh hinein'); s.tu('frage frau kolbe nach dem haus'); s.tu('2');
    pruefe(!Z().flags.kolbe_vertraut && Z().flags.kolbe_abgewiesen === Z().zeit.tag, 'Überreden misslungen');
    s.tu('frage frau kolbe nach dem haus'); s.tu('1');
    pruefe(s.bloecke.some(b => b.typ === 'tipp'), 'Gestaffelter Hinweis bei Frau Kolbe');
    Z().zeit.tag++; Z().zeit.minute = 10 * 60; HG.zufall = () => 0.05;
    s.tu('frage frau kolbe nach dem haus'); s.tu('2');
    pruefe(Z().flags.kolbe_vertraut, 'Am nächsten Tag: Überreden gelungen');
  }
  // Abends öffnet sie nicht
  {
    const s = zuKolbe({ uhr: 21 }); const Z = () => s.HG.zustand.z;
    s.tu('geh hinein');
    pruefe(Z().raum === 'kolbe', 'Abends bleibt die Tür zu');
  }
}

// --- 22. Stadtarchiv: Frau Wessels, Grest-Unterlagen, Mikrofilm (Datum, Recherche, Journalist) --------
{
  console.log('\n22. Stadtarchiv: Grest → Kirchenbuch/Kopien/1930 → Hallmann 1974 (Datum, Lesegerät) → Brzezinski 1963 (Recherche, Journalist)');
  function insArchiv(opt) {
    const s = imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
    HG.reisen.schalteFrei('stadtarchiv');
    s.tu('geh nach süden');
    Z().zeit.minute = 9 * 60;
    Z().beruf = (opt && opt.beruf) || 'polizei';
    (opt && opt.hinweise || []).forEach(h => Z().hinweise.push(h));
    HG.zufall = () => (opt && opt.wurf) || 0.05;
    s.tu('fahre zum stadtarchiv');
    return s;
  }
  {
    const s = insArchiv({ hinweise: ['hallmann_brand', 'kiste_brzezinski', 'dreizehn_kreuze'] }); const HG = s.HG, Z = () => HG.zustand.z;
    pruefe(Z().raum === 'stadtarchiv', 'Ankunft im Lesesaal');
    pruefeMenues(s, 'Lesesaal');
    s.tu('frage frau wessels nach grest');
    pruefe(['kirchenbuch', 'archivkopien', 'zeitung_1930'].every(id => HG.welt.imUmfeld(id)), 'Frau Wessels bringt Kirchenbuch, Kopien und Zeitungsnotiz 1930');
    s.tu('lies kirchenbuch'); s.tu('lies archivkopien'); s.tu('lies zeitungsnotiz');
    pruefe(['hochzeitstag', 'bauantrag_1899', 'pflegerin_vermisst'].every(h => Z().hinweise.includes(h)), 'Hochzeit 12.5.1898, Bernwards Unfall 1905, Elisabeths Tod 1930 im Notizbuch');
    s.tu('frage frau wessels nach hallmann');
    pruefe(HG.welt.imUmfeld('zeitung_1974'), 'Kopf: Mit dem Datum aus der Bauakte findet sie die Zeitung 1974 selbst');
    s.tu('lies zeitung von 1974');
    pruefe(Z().hinweise.includes('zeitung_1974') && HG.gefahren.weiss('hallmann'), 'Hallmann: Bauakte + Zeitung 1974');
    s.tu('frage frau wessels nach brzezinski');
    pruefe(Z().flags.rolle_1963, 'Brzezinski: ohne Datum gibt es die Filmrolle');
    s.tu('benutze lesegerät');
    pruefe(HG.welt.imUmfeld('zeitung_1963'), 'Fertigkeit: Recherche am Lesegerät findet die Meldung 1963');
    s.tu('lies zeitung von 1963');
    pruefe(Z().hinweise.includes('zeitung_1963') && Z().flags.foto_1963_gesehen, 'Die heilen Spiegel, die Frau auf dem Foto');
    HG.spiel.kombiniereHinweise('kiste_brzezinski', 'zeitung_1963');
    pruefe(Z().schluesse.includes('spiegel_heilen'), 'Schlussfolgerung „Die Spiegel heilen“ (Kiste + Zeitung 1963)');
    s.tu('frage frau wessels nach dem friedhof');
    pruefe(Z().ziele.friedhof, 'Frau Wessels nennt den Friedhof');
    ['pflegerin', 'carsten', 'rathausbrand', 'renate'].forEach(t => {
      const a = s.tu('frage frau wessels nach ' + t);
      pruefe(!/^true$/m.test(a) && a.length > 40, 'Frau Wessels antwortet zu „' + t + '“');
    });
  }
  // Ohne Datum: Hallmann 1974 am Lesegerät – Misserfolg, Tipps, dann gelungen; Journalist ohne Probe
  {
    const s = insArchiv({ wurf: 0.97 }); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('frage frau wessels nach hallmann');
    pruefe(Z().flags.rolle_1974 && !HG.welt.imUmfeld('zeitung_1974'), 'Ohne Datum: die Filmrolle 1974');
    s.tu('benutze lesegerät'); s.tu('benutze lesegerät');
    pruefe(!HG.welt.imUmfeld('zeitung_1974') && s.bloecke.some(b => b.typ === 'tipp'), 'Recherche misslungen: gestaffelte Hinweise');
    HG.zufall = () => 0.05; s.tu('benutze lesegerät');
    pruefe(HG.welt.imUmfeld('zeitung_1974'), 'Neuer Versuch gelingt');
    const j = insArchiv({ beruf: 'journalismus', wurf: 0.97 });
    j.tu('frage frau wessels nach brzezinski'); j.tu('benutze lesegerät');
    pruefe(j.HG.welt.imUmfeld('zeitung_1963'), 'Journalist(in): findet die Meldung ohne Probe');
  }
}

// --- 23. Friedhof: Grab Grest, Inschrift auf drei Wegen, Ring ist Anker -------------------
{
  console.log('\n23. Friedhof: Grabstein (zwei Hände) → Inschrift (Moos, Wahrnehmung, Gärtner) → „Der Ring ist der Anker“');
  function zumFriedhof(opt) {
    const s = imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
    HG.reisen.schalteFrei('friedhof');
    s.tu('geh nach süden');
    Z().zeit.minute = (opt && opt.uhr || 11) * 60;
    HG.zufall = () => (opt && opt.wurf) || 0.05;
    s.tu('fahre zum friedhof');
    return s;
  }
  {
    const s = zumFriedhof({ wurf: 0.97 }); const HG = s.HG, Z = () => HG.zustand.z;
    pruefe(Z().raum === 'friedhof', 'Ankunft am Friedhofstor');
    pruefeMenues(s, 'Friedhof Tor');
    s.tu('untersuche gräber');
    pruefe(Z().flags.carstens_grab, 'Carstens Grab mit Lavendel im Senfglas');
    s.tu('geh nach norden');
    pruefe(Z().raum === 'friedhof_alt', 'Der alte Teil hinter der Kirche');
    pruefeMenues(s, 'Alter Friedhof');
    const b = s.tu('untersuche grabstein');
    pruefe(/zwei Hände/.test(b) && /Ring/.test(b), 'Grabstein: zwei Hände, nur eine mit Ring');
    s.tu('lies inschrift'); s.tu('lies inschrift');
    pruefe(!Z().hinweise.includes('grabstein_grest') && s.bloecke.some(b => b.typ === 'tipp'), 'Wahrnehmung misslungen: gestaffelte Hinweise');
    s.tu('entferne moos');
    pruefe(Z().flags.moos_weg && Z().hinweise.includes('grabstein_grest'), 'Kopf: Moos entfernt, Inschrift gelesen');
    Z().hinweise.push('elisabeths_ring');
    HG.spiel.kombiniereHinweise('grabstein_grest', 'elisabeths_ring');
    pruefe(Z().schluesse.includes('ring_wartet') && !Z().schluesse.includes('ring_ist_anker'), 'Grabstein + Ring: erst „Der Ring wartet“ (noch nicht „Der Ring ist der Anker“)');
  }
  {
    const s = zumFriedhof(); const Z = () => s.HG.zustand.z;
    s.tu('geh nach norden'); s.tu('lies inschrift');
    pruefe(Z().hinweise.includes('grabstein_grest') && !Z().flags.moos_weg, 'Fertigkeit: Wahrnehmung liest die Inschrift durchs Moos');
    const g = zumFriedhof(); const Zg = () => g.HG.zustand.z;
    g.tu('frage gärtner nach der inschrift');
    pruefe(Zg().hinweise.includes('grabstein_grest'), 'Figur: Herr Kowalski kennt die Inschrift auswendig');
    ['grest', 'lavendel', 'pflegerin', 'carsten', 'bernward', 'ostermann'].forEach(t => {
      const a = g.tu('frage gärtner nach ' + t);
      pruefe(!/^true$/m.test(a) && a.length > 40, 'Herr Kowalski antwortet zu „' + t + '“');
    });
  }
  {
    const s = zumFriedhof({ uhr: 18 }); const Z = () => s.HG.zustand.z;
    s.tu('geh nach norden');
    const tk = s.bloecke.slice(-6).map(b => b.html || '').join(' ');
    pruefe(Z().flags['friedhof_abend_' + Z().zeit.tag] && !/auf die Hand/.test(tk) && /Grabsteine weiter/.test(tk), 'Abends: die Krähe fliegt auf und landet ein paar Grabsteine weiter (nicht auf der Hand)');
    const k1 = s.tu('schau'), k2 = s.tu('schau');
    pruefe(/Krähe/.test(k1) && /Krähe/.test(k2) && k1 !== k2, 'Bei „schau“ sitzt die Krähe jedes Mal woanders und sieht her');
    s.tu('geh nach süden'); const k3 = s.tu('geh nach norden');
    pruefe(/Krähe/.test(k3), 'Bei der Rückkehr ist die Krähe noch da');
    const n = imHaus(); n.HG.reisen.schalteFrei('friedhof'); n.tu('geh nach süden'); n.HG.zustand.z.zeit.minute = 22 * 60;
    n.tu('fahre zum friedhof');
    pruefe(n.HG.zustand.z.raum !== 'friedhof', 'Nachts ist das Tor zu');
  }
}

// --- 24. Schlafen zu Hause: +1W4 LP, +1W8 NERVEN, WP voll ----------------------------------
{
  console.log('\n24. Schlafen zu Hause: LP +1W4, NERVEN +1W8, WP voll');
  const s = prolog(); const HG = s.HG, Z = () => HG.zustand.z;
  Z().werte.lp = 3; Z().werte.nerven = 40; Z().werte.wp = 2;
  Z().zeit.minute = 22 * 60; HG.zufall = () => 0.99;
  s.tu('schlafe');
  pruefe(Z().werte.lp === Math.min(Z().max.lp, 7) && Z().werte.nerven === 48 && Z().werte.wp === Z().max.wp, 'Nacht zu Hause: LP +4, NERVEN +8 (Höchstwürfe), WP voll');
}

// --- 25. Finale: Spiegelzimmer, Wahl der Hand, Enden, Feuer -----------------------------------
{
  console.log('\n25. Finale: Spalt lockt → Neumond ohne Kreis → Kampf → Wahl der Hand → Erlösung / Willkommen · Feuer');
  /** Auf der Galerie, zur gewünschten Uhrzeit; opt.neumond = die Tapetentür ist offen (3-Uhr-Höhepunkt erlebt). */
  function aufGalerie(opt) {
    opt = opt || {};
    const s = imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('geh hoch');
    Z().zeit.minute = (opt.uhr === undefined ? 22 : opt.uhr) * 60 + 30;
    if (opt.uhr !== undefined && opt.uhr < 6) Z().zeit.tag++;
    if (opt.neumond) Z().flags.spiegelzimmer_offen = HG.nacht.nummer();
    if (opt.kreis) Z().flags.kreis_gebrochen = true;
    if (opt.ring) { HG.api.bewege('ehering', 'spieler'); }
    (opt.bekehrt || []).forEach(id => { HG.gefahren.istBekehrt(id) || (Z().gefahren = Z().gefahren || { nacht: {}, gebannt: {}, seelen: {}, wanderer: null, da: null, aktiv: null, schutz: {} }, Z().gefahren.seelen[id] = 'bekehrt'); });
    if (opt.zwei) Z().schluesse.push('zwei_elisabeths');
    HG.zufall = () => opt.wurf || 0.05;
    return s;
  }
  const wahlIndex = (s, muster) => s.HG.spiel.offen.optionen.findIndex(o => muster.test(o.text)) + 1;
  // Bei Tag bleibt die Tür zu
  {
    const s = aufGalerie({ uhr: 12 }); const Z = () => s.HG.zustand.z;
    pruefe(Z().raum === 'galerie', 'Auf der Galerie');
    s.tu('geh hinein');
    pruefe(Z().raum === 'galerie', 'Bei Tag: Die Tapetentür gibt nicht nach');
  }
  // Eine gewöhnliche Nacht: Der Spalt lockt – Manifestation, Flucht
  {
    const s = aufGalerie({ uhr: 22 }); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('öffne tapetentür');
    pruefe(Z().kampf && Z().kampf.id === 'alle_spiegel', 'Nachts lockt der Spalt: extreme Manifestation im Spiegelzimmer');
    s.tu('flieh');
    pruefe(!Z().kampf && Z().raum === 'galerie' && !Z().vorbei, 'Flucht zurück auf die Galerie');
  }
  // Neumondnacht nach 3 Uhr, Kreis nicht gebrochen: zurückziehen; eine bekehrte Seele zeigt nach unten
  {
    const s = aufGalerie({ uhr: 3, neumond: true, bekehrt: ['natascha'] }); const Z = () => s.HG.zustand.z;
    const t = s.tu('geh hinein');
    pruefe(Z().raum === 'galerie' && !Z().vorbei && /zu stark/.test(t) && /Natascha/.test(t), 'Kreis nicht gebrochen: Rückzug, Natascha zeigt nach unten');
  }
  // Das Finale: Kreis gebrochen, Ring, zwei bekehrte Seelen → Kampf → richtige Hand → Erlösung
  {
    const s = aufGalerie({ uhr: 3, neumond: true, kreis: true, ring: true, bekehrt: ['bettina', 'renate'], zwei: true }); const HG = s.HG, Z = () => HG.zustand.z;
    HG.api.bewege('tinktur', 'spieler');
    s.tu('geh hinein');
    pruefe(Z().raum === 'spiegelzimmer' && s.HG.spiel.offen && s.HG.spiel.offen.art === 'auswahl', 'Finale: Sie bittet um den Ring (Auswahl)');
    pruefe(HG.finale.stufe(HG.api) === 'schwach' && !HG.welt.getragen('tinktur'), 'Zwei bekehrte Seelen: MACHT schwach; die Tinktur wird verbraucht');
    s.tu(String(wahlIndex(s, /andere/)));
    pruefe(Z().kampf && Z().kampf.id === 'die_andere', 'Die andere Elisabeth: Kampf');
    pruefe(!/flieh/.test(HG.kampf.moeglich().map(a => a.id).join(' ')), 'Kein Zurück: Fliehen ist nicht möglich');
    Z().kampf.halt = 1;
    s.tu('halte das licht auf sie');
    pruefe(!Z().kampf && s.HG.spiel.offen && s.HG.spiel.offen.art === 'auswahl', 'Besiegt: Wahl der Hand');
    s.tu(String(wahlIndex(s, /zittert/)));
    pruefe(Z().vorbei && s.bloecke.some(b => /Erlösung/.test(b.html || b.text || '')), 'Richtige Hand mit Ring: Ende „Erlösung“');
  }
  // Falsche Hand → Willkommen zu Hause
  {
    const s = aufGalerie({ uhr: 3, neumond: true, kreis: true, ring: true, zwei: true }); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('geh hinein'); s.tu(String(wahlIndex(s, /andere/)));
    pruefe(HG.finale.stufe(HG.api) !== 'schwach' && HG.daten.manifestationen.die_andere.halt >= 18, 'Ohne bekehrte Seelen: ein harter Kampf (HALT ' + HG.daten.manifestationen.die_andere.halt + ')');
    Z().kampf.halt = 1; s.tu('halte das licht auf sie');
    s.tu(String(wahlIndex(s, /ruhig wartet/)));
    pruefe(Z().vorbei && s.bloecke.some(b => /Willkommen zu Hause/.test(b.html || b.text || '')), 'Falsche Hand: „Willkommen zu Hause“');
  }
  // Ihr den Ring geben → Willkommen zu Hause · im Griff ins Glas gezogen → Willkommen zu Hause
  {
    const s = aufGalerie({ uhr: 3, neumond: true, kreis: true, ring: true }); const Z = () => s.HG.zustand.z;
    s.tu('geh hinein'); s.tu(String(wahlIndex(s, /Ring geben/)));
    pruefe(Z().vorbei, 'Ihr den Ring gegeben: verloren');
    const g = aufGalerie({ uhr: 3, neumond: true, kreis: true, ring: true, zwei: true }); const Zg = () => g.HG.zustand.z;
    g.tu('geh hinein'); g.tu(String(wahlIndex(g, /andere/)));
    Zg().kampf.griff = true; Zg().kampf.griffRunden = 2; Zg().kampf.halt = 50;
    g.tu('halte das licht auf sie');
    pruefe(Zg().vorbei && g.bloecke.some(b => /Willkommen zu Hause/.test(b.html || b.text || '')), 'Im Griff ins Glas gezogen: „Willkommen zu Hause“');
  }
  // Um drei Uhr in einer Neumondnacht geht die Tür auf
  {
    const s = aufGalerie({ uhr: 22 }); const HG = s.HG, Z = () => HG.zustand.z;
    HG.nacht.istNeumond = () => true;
    HG.daten.spiel.hoehepunkt(HG.api);
    pruefe(Z().flags.spiegelzimmer_offen === HG.nacht.nummer(), 'Höhepunkt in der Neumondnacht: Die Tapetentür öffnet sich');
  }
  // Feuer: Das Haus ruft die Feuerwehr (gelöscht, es geht weiter) · Hallmann verhindert es (Ende „Feuer“)
  {
    const s = aufGalerie({ uhr: 12 }); const HG = s.HG, Z = () => HG.zustand.z;
    s.tu('geh runter');
    HG.api.bewege('benzinkanister', 'spieler'); HG.api.bewege('sturmstreichhoelzer', 'spieler');
    s.tu('gieße benzin aus');
    pruefe(HG.welt.imUmfeld('benzinlache') && !HG.welt.getragen('benzinkanister'), 'Benzin in der Halle ausgegossen');
    s.tu('zünde benzin an');
    pruefe(Z().flags.feuer_geloescht && Z().raum === 'einfahrt' && !Z().vorbei, 'Das Haus ruft die Feuerwehr: gelöscht, das Spiel geht weiter');
    const h = aufGalerie({ uhr: 12 }); const Zh = () => h.HG.zustand.z;
    h.tu('geh runter'); Zh().flags.hallmann_hilft = true;
    h.HG.api.bewege('benzinkanister', 'spieler'); h.HG.api.bewege('sturmstreichhoelzer', 'spieler');
    h.tu('gieße benzin aus'); h.tu('zünde benzin an');
    pruefe(Zh().vorbei && h.bloecke.some(b => /originalgetreu/.test(b.html || b.text || '')), 'Hallmann legt auf: Ende „Feuer“ – und der Wiederaufbau');
  }
}

// --- 26. Allgemeine Kulisse: Wand, Boden, Decke, Raum in jedem Raum ---------------------------
{
  console.log('\n26. Kulisse: wand/wände/boden/decke/zimmer/raum × untersuche/taste/klopfe/durchsuche in jedem Raum');
  const s = imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
  const sicher = JSON.stringify(Z());
  const kaputt = [];
  Object.keys(HG.daten.raeume).forEach(raum => {
    ['wand', 'wände', 'boden', 'decke', 'zimmer', 'raum'].forEach(wort => {
      ['untersuche', 'taste', 'klopfe an', 'durchsuche'].forEach(verb => {
        HG.zustand.z = JSON.parse(sicher); Z().raum = raum; Z().zeit.minute = 12 * 60;
        const t = s.tu(verb + ' ' + (verb === 'klopfe an' ? 'die ' : '') + wort);
        if (/nichts dergleichen|kenne ich nicht|Was meinst du|Welche[ns]? meinst du/.test(t) || !t.trim()) kaputt.push(raum + ': ' + verb + ' ' + wort + ' → ' + t.split('\n')[0]);
      });
    });
  });
  pruefe(!kaputt.length, 'Kulisse in allen ' + Object.keys(HG.daten.raeume).length + ' Räumen' + (kaputt.length ? '\n      ' + kaputt.slice(0, 15).join('\n      ') + (kaputt.length > 15 ? '\n      … ' + kaputt.length + ' insgesamt' : '') : ''));
  HG.zustand.z = JSON.parse(sicher); Z().raum = 'heizungskeller';
  pruefe(HG.parser.aufloesen(['wand']).ids[0] !== 'kulisse_wand', 'Heizungskeller: „wand“ meint die eigene Wand, nicht die Kulisse');
  HG.zustand.z = JSON.parse(sicher); Z().raum = 'friedhof_alt';
  pruefe(/Himmel/.test(s.tu('untersuche decke')), 'Draußen: Über dir ist nur der Himmel');
}

// --- 27. Protokoll für Tester ---------------------------------------------------------------
{
  console.log('\n27. Protokoll: Eingaben, Würfe, Uhrzeit, Spielstand-Kurzinfo');
  const s = imHaus(); const HG = s.HG;
  s.tu('nimm kerze'); s.tu('geh nach westen');
  HG.api.probe('st', { grund: 'Protokolltest' });
  s.tu('protokoll');
  const t = HG.protokoll.text();
  pruefe(/> nimm kerze/.test(t) && /\[T1 \d\d:\d\d\] > geh nach westen/.test(t), 'Eingaben mit Spieltag und Uhrzeit');
  pruefe(/🎲 .*Protokolltest/.test(t), 'Würfe stehen im Protokoll');
  pruefe(/--- Spielstand ---/.test(t) && /NERVEN \d+/.test(t) && /Ort: Eingangshalle/.test(t) && /MACHT/.test(t), 'Spielstand-Kurzinfo (Ort, Werte, MACHT)');
  pruefe(/===== Neues Spiel =====/.test(t), 'Marke beim neuen Spiel');
}

// --- 28. Sound: Untertitel, lauter Schreck einmal pro Nacht, Abspann ----------------------------
{
  console.log('\n28. Sound: Untertitel, ein lauter Schreck pro Nacht, Sound-Verzeichnis, Abspann');
  const s = imHaus(); const HG = s.HG, Z = () => HG.zustand.z;
  s.tu('geh hoch'); s.tu('klopfe an die tapetentür');
  pruefe(s.bloecke.some(b => b.typ === 'ton' && /klopft dreimal/.test(b.html)), 'Untertitel: [Es klopft dreimal zurück]');
  Z().zeit.minute = 3 * 60; Z().zeit.tag++;
  HG.medien.effekt('uhr', { mal: 3, laut: true });
  pruefe(Z().flags._lauterSchreck === HG.nacht.nummer(), 'Lauter Schreck: für diese Nacht vermerkt (ein zweiter bleibt stumm, nur Untertitel)');
  const fehlend = ['ort-haus-nacht', 'effekt-spuk-schritte_oben', 'effekt-klopfen-dreimal', 'effekt-kinderlachen', 'effekt-uhr', 'effekt-herzschlag'].filter(n => !HG.daten.klaenge[n] || !HG.daten.klaenge[n].prompt);
  pruefe(!fehlend.length, 'Sound-Verzeichnis: die fünf Probe-Sounds und der Herzschlag' + (fehlend.length ? ' – fehlt: ' + fehlend.join(', ') : ''));
  pruefe(Object.values(HG.daten.klaenge).every(k => k.sek > 0 && k.sek <= 30 && /^(schleife|effekt)$/.test(k.art)), 'Alle Sounds: Art und Länge 0–30 s');
  // Stundenschlag: 19 Uhr sieben Schläge, Mitternacht zwölf, 1 Uhr eins, 3 Uhr nur der Höhepunkt
  {
    const u = imHaus(); const UH = u.HG, UZ = () => UH.zustand.z;
    const tonNach = n => u.bloecke.slice(n).filter(b => b.typ === 'ton').map(b => b.html).join(' | ');
    let n = u.bloecke.length; UZ().zeit.minute = 18 * 60 + 59; u.tu('warte');
    pruefe(/schlägt sieben/.test(tonNach(n)) && UZ().flags.uhr_gehoert, 'Stundenschlag: 19 Uhr, sieben Schläge');
    n = u.bloecke.length; UZ().zeit.minute = 23 * 60 + 59; u.tu('warte');
    pruefe(/schlägt zwölf/.test(tonNach(n)), 'Mitternacht: zwölf Schläge');
    n = u.bloecke.length; UZ().zeit.minute = 24 * 60 + 59; u.tu('warte');
    pruefe(/schlägt eins/.test(tonNach(n)), '1 Uhr: ein Schlag');
    n = u.bloecke.length; UZ().zeit.minute = 26 * 60 + 59; u.tu('warte');
    pruefe(tonNach(n) === '[Eine Uhr schlägt drei]', '3 Uhr: nur der Höhepunkt schlägt (einmal) – ' + tonNach(n));
    UZ().zeit.minute = 14 * 60 + 59; n = u.bloecke.length; u.tu('warte');
    pruefe(!tonNach(n), 'Bei Tag schlägt keine Uhr');
  }
  pruefe(/ElevenLabs \(elevenlabs\.io\)/.test(HG.wert(HG.daten.spiel.abspann, HG.api)), 'Abspann nennt ElevenLabs');
}

// --- 29. Alpha-Test 27.11.2026 ------------------------------------------------------------------------------
{
  console.log('\n29. Alpha-Test: Neustart, Platzhalter, Version, Tagebuch in Stufen, Gerdes-Tür, Ziele, Jansen, Notizbuch-Paare');
  // Neustart aus einem geladenen Spielstand: alles ersetzt, Protokollkopf mit Namen, Charakter nur einmal
  {
    const ctx = neueWelt(); const s = spieler(ctx); const H = s.HG;
    H.spiel.start(); ['Anna Alt', 'Frau', 'würfeln', '1', 'öffne umschlag'].forEach(c => s.tu(c));
    H.zustand.speichern('auto');
    H.zustand.laden('auto');
    const n = s.bloecke.length;
    ['neustart ja', 'Bert Neu', 'Mann', 'würfeln', '2', 'öffne umschlag', 'lies notarbrief'].forEach(c => s.tu(c));
    const neu = s.bloecke.slice(n).map(b => String(b.html || '')).join('\n');
    pruefe(!PLATZHALTER_RE.test(neu) && /Neu/.test(neu), 'Neustart aus geladenem Spielstand: Platzhalter ersetzt');
    pruefe(s.bloecke.slice(n).filter(b => /Wie heißt du/.test(b.html || '')).length === 1, 'Neustart: die Charaktererstellung läuft genau einmal');
    pruefe(/Figur: Bert Neu \(männlich\)/.test(H.protokoll.kurzinfo()), 'Protokollkopf nennt die Figur: ' + H.protokoll.kurzinfo().split('\n')[0]);
    pruefe(!PLATZHALTER_RE.test(H.protokoll.text()), 'Protokoll enthält keine unersetzten Platzhalter');
    pruefe(/Spielversion \d+/.test(H.protokoll.text()), 'Protokoll nennt die Spielversion');
    pruefe(H.text.fuelle('{name}, {g:a|b|c}') === 'Bert Neu, a', 'fuelle ersetzt Name und Geschlecht');
  }
  // Alle Texte aller Daten: nach dem Ersetzen bleibt kein Platzhalter stehen (auch nicht vor der Charaktererstellung)
  {
    const s = prolog(); const H = s.HG; const rest = [];
    const pruefeText = (wo, t) => { if (typeof t === 'string' && PLATZHALTER_RE.test(H.text.fuelle(t))) rest.push(wo); };
    const alle = (wo, o, tiefe) => {
      if (tiefe > 4 || !o) return;
      if (typeof o === 'string') return pruefeText(wo, o);
      if (typeof o === 'function') { try { const r = o(H.api); if (typeof r === 'string') pruefeText(wo, r); } catch (e) { /* braucht Kontext */ } return; }
      if (typeof o === 'object') Object.keys(o).forEach(k => alle(wo + '.' + k, o[k], tiefe + 1));
    };
    ['dinge', 'raeume', 'hinweise', 'schluesse', 'nachrichten', 'anrufe'].forEach(k => alle(k, H.daten[k], 0));
    alle('spiel', H.daten.spiel, 0);
    pruefe(!rest.length, 'Alle Texte: kein Platzhalter bleibt unersetzt' + (rest.length ? ' – ' + rest.slice(0, 5).join(', ') : ''));
    const z = H.zustand.z.spieler; H.zustand.z.spieler = null;
    pruefe(!PLATZHALTER_RE.test(H.text.fuelle('{name} {anrede} {g:x|y}')), 'Noch ohne Namen: neutrale Wörter statt Platzhalter');
    H.zustand.z.spieler = z;
  }
  // Spielversion = Cache-Version des Service Workers
  {
    const ctx = neueWelt();
    const sw = fs.readFileSync(path.join(WURZEL, 'sw.js'), 'utf8').match(/VERSION = 'haus-grest-(\d+)'/);
    pruefe(sw && +sw[1] === ctx.HG.SPIELVERSION, 'sw.js VERSION passt zu HG.SPIELVERSION (' + (sw && sw[1]) + ' / ' + ctx.HG.SPIELVERSION + ')');
  }
  // Carstens Tagebuch in Stufen
  const tbWelt = () => {
    const s = imLager(); const H = s.HG;
    H.spukwerk.zug = () => {}; H.gefahren.darf = () => false;
    H.zustand.setze('tagebuch', 'ort', 'spieler'); H.zustand.setze('tagebuch', 'rel', 'in');
    return s;
  };
  const seite = (H, titel) => H.daten.dinge.tagebuch.buch.seiten.find(x => x.titel === titel);
  {
    const s = tbWelt(); const H = s.HG, Z = () => H.zustand.z;
    const t0 = s.tu('lies tagebuch');
    pruefe(/6 beschriebene Seiten/.test(t0), 'Stufe 0: sechs beschriebene Seiten – ' + (t0.match(/\d+ beschriebene Seiten[^.]*/) || [''])[0]);
    pruefe(!H.buch.erschienen(seite(H, '2. Oktober 2025')) && !H.buch.erschienen(seite(H, '19. Juni 2026')), 'Stufe 0: Gerdes-SMS und Brandplan noch leer');
    const order = H.buch.beschrieben('tagebuch').map(x => x.s.titel);
    pruefe(order.indexOf('14. Februar 2026') === order.indexOf('11. Februar 2026') + 1, 'Kästchen (14.2.2026) steht nach „Lager gemietet“ (11.2.2026)');
    for (let i = 1; i <= 20; i++) s.tu('lies eintrag ' + i);
    pruefe(Z().hinweise.includes('tb_zweifel') && !Z().hinweise.includes('fremde_nummern'), 'Stufe 0: „erste Monate“, aber noch nicht „Das Haus benutzt fremde Nummern“');
    // Stufe 1: erste Nacht im Haus
    Z().flags.nacht_im_haus = true;
    const tf = s.tu('warte');
    pruefe(/schwerer geworden/.test(tf), 'Stufe 1: „Das Tagebuch in deiner Tasche ist schwerer geworden.“');
    const t1 = s.tu('lies tagebuch');
    pruefe(/Die Tinte glänzt noch/.test(t1) && /2\. Oktober 2025|24\. Dezember 2025|3\. April 2026/.test(t1), 'Stufe 1: beim Öffnen „Die Tinte glänzt noch“, eine neue Seite');
    for (let i = 1; i <= 20; i++) s.tu('lies eintrag ' + i);
    pruefe(Z().hinweise.includes('fremde_nummern') && Z().hinweise.includes('tb_angst') && !Z().hinweise.includes('tb_brand'), 'Stufe 1: fremde Nummern und Angst – noch kein Brand');
    // Stufe 2: Polizeiakte Häuser (oder Keller)
    Z().hinweise.push('polizeiakte_haeuser'); s.tu('warte');
    for (let i = 1; i <= 20; i++) s.tu('lies eintrag ' + i);
    pruefe(Z().hinweise.includes('tb_brand') && !Z().hinweise.includes('tb_wandlung'), 'Stufe 2: Brandplan und Brandversuch („Carsten wollte das Haus anzünden“)');
    pruefe(s.bloecke.some(b => /Ab hier wird Carstens Schrift fahrig/.test(b.html || '') && b.typ === 'text'), '14.8.: „fahrig“ steht als Erzähltext unter der Seite');
    pruefe(!H.gefahren.weiss('carsten'), 'Vor Stufe 3 kann man Carsten nicht bekehren');
    // Stufe 3: Carsten begegnet (Wandspiegel im Gästezimmer)
    Z().raum = 'gaestezimmer'; Z().besucht.gaestezimmer = true;
    s.tu('schau in den wandspiegel');
    pruefe(Z().flags.carsten_begegnet, 'Begegnung mit Carsten im Wandspiegel des Gästezimmers');
    s.tu('warte');
    for (let i = 1; i <= 20; i++) s.tu('lies eintrag ' + i);
    Z().hinweise.push('testament');
    pruefe(Z().hinweise.includes('tb_wandlung') && H.gefahren.weiss('carsten'), 'Stufe 3: „Carsten verliebt sich“ – jetzt kennt man seine Geschichte');
    pruefe(!H.buch.seiten('tagebuch').some(x => H.buch.erschienen(x.s) && /Willkommen|gehört mir|zwei Hände/.test(x.s.text)), 'Vor Stufe 4: kein Ende im Tagebuch');
    // Stufe 4b: Neumondnacht, Carsten nicht bekehrt
    const s2 = JSON.stringify(Z());
    const nm = [7, 8, 9, 10].find(n => H.nacht.istNeumond(n));
    Z().zeit.tag = nm; Z().zeit.minute = 19 * 60 + 59; s.tu('warte');
    pruefe(Z().flags.tb_fremd, 'Neumondnacht ohne bekehrten Carsten: fremde Schrift (Nacht ' + nm + ')');
    const nerven = Z().werte.nerven;
    for (let i = 1; i <= 25; i++) s.tu('lies eintrag ' + i);
    const fremd = H.buch.beschrieben('tagebuch').map(x => H.wert(x.s.text, H.api)).join(' ');
    pruefe(/Er gehört mir/.test(fremd) && /Du gehörst auch zu mir/.test(fremd) && /Willkommen zu Hause/.test(fremd) && !/zwei Hände/.test(fremd), 'Stufe 4b: „Er gehört mir.“ – „Du gehörst auch zu mir.“ – „Willkommen zu Hause.“');
    pruefe(s.bloecke.some(b => b.typ === 'wurf' || /NERVEN/.test(b.html || '')) && Z().werte.nerven <= nerven, 'Stufe 4b: NERVEN-Probe beim Lesen');
    pruefe(!Z().hinweise.includes('carstens_letzte_seite'), 'Stufe 4b: nur Grusel, kein Hinweis');
    // Stufe 4a: Carsten bekehrt
    H.zustand.z = JSON.parse(s2);
    Z().gefahren.seelen.carsten = 'bekehrt'; s.tu('warte');
    for (let i = 1; i <= 25; i++) s.tu('lies eintrag ' + i);
    const klar = H.buch.beschrieben('tagebuch').map(x => H.wert(x.s.text, H.api)).join(' ');
    pruefe(/Nimm die andere – die dünne, die mit dem Abdruck vom Ring/.test(klar) && !/Er gehört mir/.test(klar), 'Stufe 4a: Carstens letzte Seite – die richtige Hand');
    pruefe(Z().hinweise.includes('carstens_letzte_seite') && H.daten.schluesse.ring_wartet.aus.includes('carstens_letzte_seite'), 'Stufe 4a: Hinweis „Carstens letzte Seite“ (Quelle für „Der Ring wartet“)');
    // Finale: kämpft Carsten gegen dich, füllen sich die Seiten ebenfalls fremd
    H.zustand.z = JSON.parse(s2);
    const k = H.daten.manifestationen ? H.daten.manifestationen.die_andere : null;
    if (k && k.angriff) { k.angriff(H.api, { runde: 3 }); pruefe(Z().flags.tb_fremd, 'Finale: Carsten hält dich fest → fremde Schrift im Tagebuch'); }
  }
  // Alte Spielstände: Brandversuch gelesen → neuer Hinweis, nichts geht verloren
  {
    const ctx = neueWelt(); const s = spieler(ctx); const H = s.HG;
    H.spiel.start(); ['A B', 'Frau', 'verteilen', '12 12 12 12 12 12', '1'].forEach(c => s.tu(c));
    H.zustand.speichern('9');
    const p = JSON.parse(ctx.localStorage.getItem('hausgrest:9'));
    p.version = 9; p.zustand.version = 9; delete p.zustand.buchSeiten;
    p.zustand.hinweise.push('tb_wandlung', 'tb_angst');
    p.zustand.buecher = { tagebuch: { seite: 6, gelesen: [0, 6, 7, 10, 15] } };
    ctx.localStorage.setItem('hausgrest:9', JSON.stringify(p));
    const r = H.zustand.laden('9');
    pruefe(r.ok && H.zustand.z.hinweise.includes('tb_brand') && H.zustand.z.hinweise.includes('tb_wandlung'), 'Alter Spielstand: „Carsten wollte das Haus anzünden“ ergänzt, nichts verloren');
    pruefe(H.zustand.z.buecher.tagebuch.gelesen.includes(7) && H.zustand.z.buecher.tagebuch.gelesen.includes(6) && !H.zustand.z.buecher.tagebuch.gelesen.includes(15), 'Alter Spielstand: gelesene Seiten umgerechnet');
  }
  // Gerdes: Tür zu nach dem Abweisen – Raumtext, Vorschläge, kein „geh hinein“
  {
    const s = prolog(); const H = s.HG, Z = () => H.zustand.z;
    Z().zeit.minute = 10 * 60; H.reisen.schalteFrei('gerdes', true); H.spiel.betrete('gerdes');
    s.tu('sprich mit brigitte'); s.tu('1');
    pruefe(Z().flags.gerdes_tuer_zu, 'Gerdes: nach dem Abweisen ist die Tür zu');
    pruefe(/ist zu/.test(s.tu('schau')) && !H.spiel.ausgaenge().some(a => a.id === 'hinein'), 'Gerdes: Raumtext „zu“, kein Ausgang hinein');
    pruefe(H.spiel.vorschlaege().includes('klopfe an die tür') && !H.spiel.vorschlaege().includes('geh hinein'), 'Gerdes: Vorschlag „klopfe an die tür“');
    const tk = s.tu('klopfe an die tür');
    pruefe(!Z().flags.gerdes_tuer_zu && /Spalt/.test(tk), 'Gerdes: Klopfen – die Tür geht wieder einen Spalt auf');
    s.tu('sprich mit brigitte'); s.tu('1'); s.tu('sprich mit brigitte'); s.tu('1');
    const tipps = s.bloecke.filter(b => b.typ === 'tipp').map(b => b.html).join(' ');
    pruefe(tipps && !/Haarspange|Puppenhaus/.test(tipps), 'Gerdes-Tipps nennen die Haarspange nicht, solange man sie nicht gefunden hat');
  }
  // Ziele: feste Nummern in der Reihenfolge der Freischaltung, der aktuelle Ort grau „(hier)“
  {
    const s = prolog(); const H = s.HG;
    s.tu('öffne umschlag'); s.tu('lies notarbrief');
    const vorher = H.reisen.bekannt().slice();
    H.reisen.schalteFrei('friedhof', true); H.reisen.schalteFrei('gerdes', true);
    const nachher = H.reisen.bekannt();
    pruefe(JSON.stringify(nachher.slice(0, vorher.length)) === JSON.stringify(vorher) && nachher.slice(-2).join() === 'friedhof,gerdes', 'Ziele: neue hinten angehängt (' + nachher.join(', ') + ')');
    const t = s.tu('fahre los');
    pruefe(/\(hier\)/.test(s.bloecke.filter(b => b.typ === 'auswahl').pop().html), 'Zielauswahl: aktueller Ort mit „(hier)“');
    H.spiel.offen = null;
  }
  // Polizeiwache: nach der Übergabe „Haben Sie alles? Noch Fragen?“
  {
    const s = prolog(); const H = s.HG, Z = () => H.zustand.z;
    Z().zeit.minute = 10 * 60; H.reisen.schalteFrei('polizei', true); H.spiel.betrete('polizei');
    Z().flags.nachlass_erhalten = true;
    const t = s.tu('sprich mit jansen');
    pruefe(/Haben Sie alles\?/.test(t) && /Noch Fragen\?/.test(t) && /akte/.test(t), 'Jansen nach der Übergabe: „Haben Sie alles? Noch Fragen?“ mit offenen Themen');
  }
  // Notizbuch: kombinierbare Paare markiert, nach einer Weile nennt die Erinnerung beide
  {
    const s = imHaus(); const H = s.HG, Z = () => H.zustand.z;
    H.api.hinweis('hallmann_brand'); H.api.hinweis('tb_brand');
    const p = H.spiel.paare();
    pruefe(p.some(x => x.sid === 'das_haus_brennt_nicht'), 'Notizbuch: „Das Haus lässt sich nicht verbrennen“ ist ein offenes Paar');
    for (let i = 0; i < 45; i++) s.tu('warte');
    pruefe(s.bloecke.some(b => b.typ === 'andeutung' && /Hallmann|Brand/.test(b.html) && /anzünden/.test(b.html)), 'Notizbuch: Erinnerung nennt beide Notizen beim Namen');
    H.spiel.kombiniereHinweise('hallmann_brand', 'tb_brand');
    pruefe(Z().schluesse.includes('das_haus_brennt_nicht') && !H.spiel.paare().some(x => x.sid === 'das_haus_brennt_nicht'), 'Nach dem Kombinieren ist das Paar erledigt');
  }
  // Pistole im Schuhkarton antippbar: der Öffnen-Text nennt sie
  pruefe(/Pistole/.test(prolog().HG.daten.dinge.schuhkarton.texte.oeffnen), 'Schuhkarton: der Öffnen-Text nennt die Pistole (antippbar)');
}
// --- 30. Spieltest 2 (28.11.2026): alle Orte außer dem Haus ------------------------------------------------
{
  console.log('\n30. Spieltest 2: Fälle, Grest-Karton, Gerdes (Tür, Handy, Packung), Archiv, Lotte, Ring-Schlüsse, Fahrziele, Krähe, Tagebuch-Reihenfolge, SMS, Fotos, Protokoll');
  // 2. Fälle: jeder Artikel stimmt (Nominativ nach „Darin liegt“, Akkusativ nach „du findest“)
  {
    const H = prolog().HG, T = H.text, bad = [];
    Object.keys(H.daten.dinge).forEach(id => {
      const d = H.daten.dinge[id]; if (!d.nomen) return;
      if (/^(einen|keinen) /.test(T.ein(id, 'nom'))) bad.push(id + ' nom');
      if (d.genus === 'm' && !d.eigenname && /^ein /.test(T.ein(id, 'akk'))) bad.push(id + ' akk');
    });
    pruefe(!bad.length, 'Alle Dinge: Nominativ/Akkusativ der Artikel stimmen' + (bad.length ? ' – ' + bad.slice(0, 5).join(', ') : ''));
  }
  // 3. Grest-Karton: „etwas Hartes“ schon beim Öffnen, antippbar
  {
    const s = imLager(); const H = s.HG;
    s.tu('öffne grest-karton');
    const b = s.bloecke.slice(-3).map(x => x.html || '').join(' ');
    pruefe(/etwas Hartes/.test(b) && /data-befehle="Nehmen=nimm etwas hartes/.test(b), 'Grest-Karton: beim Öffnen „etwas Hartes“, antippbar mit „nimm etwas hartes“');
    s.tu('nimm etwas hartes');
    pruefe(H.welt.getragen('zirkel'), '„nimm etwas hartes“ findet den Zirkel');
    s.tu('öffne schuhkarton');
    pruefe(s.bloecke.slice(-2).filter(x => /Pistole/.test(x.html || '')).length === 1 && !/Darin liegen eine Pistole/.test(s.bloecke.slice(-2).map(x => x.html).join(' ')), 'Schuhkarton: Pistole einmal genannt, keine doppelte Aufzählung');
  }
  // 4. Schleifen nur gleichmäßiger Hintergrund, Effekte einmalig
  {
    const H = prolog().HG;
    const orte = Object.keys(H.daten.klaenge).filter(n => /^ort-/.test(n) && n !== 'ort-haus-nacht');
    const mitEreignis = orte.filter(n => !/no distinct single events/.test(H.daten.klaenge[n].prompt) && /door|footsteps|phone|knock/i.test(H.daten.klaenge[n].prompt));
    pruefe(!mitEreignis.length, 'Hintergrund-Schleifen ohne Einzelereignisse (Türen, Schritte, Telefon)' + (mitEreignis.length ? ' – ' + mitEreignis.join(', ') : ''));
    pruefe(/a\.loop = false/.test(fs.readFileSync(path.join(WURZEL, 'js/engine/medien.js'), 'utf8')), 'Effekte werden nie in Schleife gespielt');
  }
  // 5.–8. Wohnung Gerdes
  const zuGerdes = (opt) => {
    const s = prolog(); const H = s.HG, Z = () => H.zustand.z;
    H.spukwerk.zug = () => {};
    Z().zeit.minute = 10 * 60; H.reisen.schalteFrei('gerdes', true); H.spiel.betrete('gerdes');
    if (opt && opt.vorher) opt.vorher(H, Z());
    return s;
  };
  const optionen = s => (s.HG.spiel.offen && s.HG.spiel.offen.optionen || []).map(o => o.text).join(' | ');
  {
    const s = zuGerdes({ vorher: (H, z) => { z.hinweise.push('tote_anrufer'); } });
    s.tu('sprich mit brigitte');
    pruefe(!/Schreibt es Ihnen auch/.test(optionen(s)), 'Gerdes: „Schreibt es Ihnen auch?“ nicht nur nach Schmidts Erzählung');
    s.HG.spiel.offen = null;
    s.HG.handy.nachricht('carsten_spiegelzimmer');
    s.tu('sprich mit brigitte');
    pruefe(/Schreibt es Ihnen auch/.test(optionen(s)), 'Gerdes: nach einer gefälschten SMS von Carsten wird die Frage angeboten');
  }
  {
    const s = zuGerdes({ vorher: (H, z) => { z.hinweise.push('lotte_zwei_gesichter'); } });
    s.tu('sprich mit brigitte');
    pruefe(/Lotte Wiegand/.test(optionen(s)), 'Gerdes: „Ich war bei Lotte Wiegand“ nach dem Gespräch mit Lotte');
    s.tu('„Ich war bei Lotte Wiegand. Im Lindenhof.“');
    pruefe(s.HG.zustand.z.raum === 'gerdes_wohnung', 'Gerdes: über Lotte hinein');
  }
  {
    const s = zuGerdes({ vorher: (H) => { H.zustand.setze('haarspange', 'ort', 'spieler'); H.zustand.setze('haarspange', 'versteckt', false); } });
    s.tu('sprich mit brigitte');
    pruefe(/Haarspange/.test(optionen(s)), 'Gerdes: Haarspange zeigen als Antwort an der Tür');
    s.tu('Ihr Bettinas Haarspange zeigen');
    pruefe(s.HG.zustand.z.raum === 'gerdes_wohnung', 'Gerdes: mit der Haarspange hinein');
    // 6. Trauerkarte ohne Carstens Anmerkungen und ohne Foto-Effekt
    const H = s.HG;
    const tk = [H.wert(H.daten.dinge.trauerkarte.beschreibung, H.api), H.wert(H.daten.dinge.trauerkarte.lesbar, H.api), H.daten.dinge.trauerkarte.foto].join(' ');
    pruefe(!/Carsten|eingekreist|nachgezogen/.test(tk), 'Trauerkarte: keine Anmerkungen von Carsten, kein Foto-Effekt');
    // 7. „Packung“ meint die Taschentücher, nicht die Streichhölzer im Gepäck
    ['sturmstreichhoelzer', 'streichhoelzer'].forEach(id => H.zustand.setze(id, 'ort', 'spieler'));
    const tp = s.tu('untersuche packung');
    pruefe(/Taschentücher/.test(tp) && !H.spiel.offen, '„untersuche packung“ auf dem Sofa: die Taschentücher');
    pruefe(!(H.spiel.wortIndex().packung || []).some(id => /streich/.test(id)), 'Antippbares „Packung“ zeigt nicht auf die Streichhölzer im Gepäck');
    // 8. Brigittes Handy: nie das eigene Handy; Bettinas Handy in der Schublade ist nicht antippbar
    const th = s.tu('untersuche handy');
    pruefe(/Brigittes Handy/.test(th), '„untersuche handy“ bei Brigitte: ihr Handy, nicht deins');
    pruefe(/Brigittes Handy/.test(s.tu('lies nachrichten auf brigittes handy')), '„lies nachrichten auf brigittes handy“ springt nicht auf dein Handy');
    pruefe(!/Brigittes Handy/.test(s.tu('lies nachrichten')), '„lies nachrichten“ allein: dein eigenes Handy');
    pruefe(/kein-wort">Handy/.test(s.tu('öffne schublade') && s.bloecke.slice(-1)[0].html), 'Bettinas Handy in der Schublade ist nicht antippbar');
    pruefe(!H.daten.dinge.handy_brigitte.woerter.some(w => /brigitte/.test(w)), 'Brigittes Handy konkurriert nicht mit Brigitte selbst');
  }
  // 7. Allgemein: Ein Wort, das ein Ding im Raum trifft, meint nie ein gleichnamiges Ding im Gepäck
  {
    const s = prolog(); const H = s.HG, P = H.parser, z = H.zustand.z, fehler7 = [];
    const nehmbar = Object.keys(H.daten.dinge).filter(id => H.spiel.nehmbar(id) && !H.daten.dinge[id].dokument);
    Object.keys(H.daten.raeume).forEach(r => {
      Object.keys(H.daten.dinge).forEach(a => {
        const d = H.daten.dinge[a];
        if (d.ort !== r || d.versteckt || d.kulisse || d.person) return;
        (d.woerter || []).forEach(w => {
          nehmbar.filter(b => b !== a && (H.daten.dinge[b].woerter || []).includes(w)).forEach(b => {
            const alt = JSON.stringify(z.dinge[b] || null);
            H.zustand.setze(b, 'ort', 'spieler'); z.raum = r;
            const e = H.welt.hell(r) ? P.aufloesen([w], {}) : {};   // im Dunkeln sieht man nur, was man trägt
            if (e.ids && e.ids.length === 1 && e.ids[0] === b) fehler7.push(r + ': „' + w + '“ → ' + b + ' statt ' + a);
            z.dinge[b] = JSON.parse(alt) || undefined; if (!z.dinge[b]) delete z.dinge[b];
          });
        });
      });
    });
    pruefe(!fehler7.length, 'Gleiche Wörter: Dinge im Raum gehen vor Dingen im Gepäck' + (fehler7.length ? ' – ' + fehler7.slice(0, 4).join('; ') : ''));
  }
  // 9. Archiv: alles gefunden → „Mehr hab ich zu dem Haus nicht.“
  {
    const s = prolog(); const H = s.HG, z = H.zustand.z;
    z.zeit.minute = 10 * 60; H.reisen.schalteFrei('stadtarchiv', true); H.spiel.betrete('stadtarchiv');
    pruefe(!/Mehr hab ich/.test(s.tu('sprich mit frau wessels')), 'Archiv: am Anfang hilft Frau Wessels');
    z.flags.archiv_grest = true; z.hinweise.push('hochzeitstag', 'bauantrag_1899', 'pflegerin_vermisst', 'zeitung_1974', 'zeitung_1963');
    pruefe(/Mehr hab ich zu dem Haus nicht/.test(s.tu('sprich mit frau wessels')), 'Archiv: alles gefunden – „Mehr hab ich zu dem Haus nicht. Wirklich nicht.“');
    pruefe(H.reisen.erschoepft('stadtarchiv') === false, 'Fahrziel: am aktuellen Ort nie „erschöpft“');
  }
  // 10. Keine nackten Zahlen in den Reitern
  {
    const a = fs.readFileSync(path.join(WURZEL, 'js/engine/anzeige.js'), 'utf8');
    pruefe(/rn\.textContent = 'NERVEN ' \+/.test(a) && /neu \? neu \+ ' neu'/.test(a), 'Reiter zeigen keine Zahl ohne Bedeutung (NERVEN …, „3 neu“)');
  }
  // 11. + 16. Lotte: Ring erst mit Ehering, Andeutung statt Lösung, danach schließt sie sich
  {
    const s = prolog(); const H = s.HG, z = H.zustand.z;
    z.zeit.minute = 10 * 60; z.flags.lotte_klar = z.zeit.tag; H.reisen.schalteFrei('altenheim', true); H.spiel.betrete('altenheim_aufenthalt');
    pruefe(!H.spiel.vorschlaege().includes('frage lotte nach dem ring') && !/der Ring/.test(s.tu('sprich mit lotte')), 'Lotte: ohne Ehering kein Angebot „Ring“');
    H.zustand.setze('ehering', 'ort', 'spieler');
    s.tu('frage lotte nach der gnädigen frau');
    const tr = s.tu('frage lotte nach dem ring');
    pruefe(/an ihren Finger gefasst/.test(tr) && /Die andere nie/.test(tr) && !/keinen Ring/.test(tr), 'Lotte: Andeutung („Die andere nie“), nicht die Lösung');
    s.tu('warte');
    const tz = s.tu('sprich mit lotte');
    pruefe(/erkennt dich nicht mehr/.test(tz), 'Lotte: alles erzählt – sie erkennt dich nicht mehr');
    pruefe(/erkennt dich nicht mehr/.test(s.tu('frage lotte nach der schwester')) && H.spiel.vorschlaege().join() === 'geh nach süden', 'Lotte bleibt verschlossen, keine Gesprächsvorschläge');
    pruefe(H.reisen.erschoepft('altenheim') === false, 'Altenheim: solange man dort ist, nicht „erschöpft“');
  }
  // 12. Ehering im Kästchen: „Nehmen“ im Menü
  {
    const s = imLager(); const H = s.HG;
    H.zustand.setze('kaestchen', 'ort', 'spieler'); H.zustand.setze('kaestchen', 'offen', true); H.zustand.setze('ehering', 'ort', 'kaestchen'); H.zustand.setze('ehering', 'rel', 'in');
    pruefe(H.spiel.aktionenFuer('ehering').some(a => /^nimm /.test(a.befehl || '')), 'Ehering im getragenen Kästchen: Menü bietet „nimm“');
  }
  // 13. + 17. Ring-Schlüsse: erst „Der Ring wartet“, mit „Zwei Elisabeths“ folgt „Der Ring ist der Anker“
  {
    const s = imHaus(); const H = s.HG, z = H.zustand.z;
    z.hinweise.push('bernwards_letzter_brief', 'elisabeths_ring');
    H.spiel.kombiniereHinweise('bernwards_letzter_brief', 'elisabeths_ring');
    const t = H.spiel.schlussText('ring_wartet');
    pruefe(z.schluesse.includes('ring_wartet') && !z.schluesse.includes('ring_ist_anker'), 'Brief 1905 + Ring: „Der Ring wartet“');
    pruefe(!/gute|frei|zwei Elisabeth|andere/.test(t), '„Der Ring wartet“ nimmt nichts vorweg: ' + t);
    z.hinweise.push('kraehe_gebetbuch', 'lotte_zwei_gesichter');
    H.spiel.kombiniereHinweise('kraehe_gebetbuch', 'lotte_zwei_gesichter');
    pruefe(z.schluesse.includes('zwei_elisabeths') && z.schluesse.includes('ring_ist_anker'), 'Mit „Zwei Elisabeths“ folgt „Der Ring ist der Anker“');
    // Kein Zitat aus nicht gefundenen Quellen – für jeden Schluss mit „mindestens“ und jedes mögliche Paar
    const zitate = id => (String(H.daten.hinweise[id].text).match(/„[^“]{15,}“/g) || []);   // echte Zitate, keine Allerweltswörter wie „die andere“
    const verstoesse = [];
    Object.values(H.daten.schluesse).filter(x => x.mindestens).forEach(sl => {
      sl.aus.forEach((a, i) => sl.aus.slice(i + 1).forEach(b => {
        z.hinweise = [a, b];
        const text = H.spiel.schlussText(sl.id);
        sl.aus.filter(c => c !== a && c !== b).forEach(c => {
          zitate(c).filter(q => !zitate(a).concat(zitate(b)).includes(q)).forEach(q => { if (text.includes(q.slice(1, -1))) verstoesse.push(sl.id + ' zitiert ' + c + ' (' + a + '+' + b + ')'); });
        });
      }));
    });
    pruefe(!verstoesse.length, 'Schlussfolgerungen zitieren nur gefundene Quellen' + (verstoesse.length ? ' – ' + verstoesse.slice(0, 3).join('; ') : ''));
  }
  // 14. Fahrziele: erschöpfte Orte verschwinden, Nummern bleiben, Zuhause/Krankenhaus/Haus immer
  {
    const s = prolog(); const H = s.HG, z = H.zustand.z, R = H.reisen;
    s.tu('öffne umschlag'); s.tu('lies notarbrief');
    ['stadtarchiv', 'altenheim', 'gerdes', 'polizei'].forEach(id => R.schalteFrei(id, true));
    const nummer = id => R.bekannt().indexOf(id) + 1;
    const vorher = { gerdes: nummer('gerdes'), polizei: nummer('polizei') };
    z.flags.archiv_grest = true; z.hinweise.push('hochzeitstag', 'bauantrag_1899', 'pflegerin_vermisst', 'zeitung_1974', 'zeitung_1963');
    pruefe(R.erschoepft('stadtarchiv') && !R.liste().includes('stadtarchiv'), 'Archiv erschöpft: verschwindet aus „fahre los“');
    z.hinweise.push('polizeiakte_haeuser', 'polizeiakte_romanow'); z.flags.nachlass_erhalten = true;
    pruefe(!R.erschoepft('polizei'), 'Wache: solange die Pistole nicht abgegeben ist, bleibt sie im Angebot');
    z.flags.pistole_abgegeben = true;
    pruefe(R.erschoepft('polizei'), 'Wache: alles geholt und Pistole abgegeben → erschöpft');
    pruefe(['zuhause', 'krankenhaus', 'haus'].every(id => !R.erschoepft(id)), 'Zuhause, Krankenhaus und Haus Grest bleiben immer');
    s.tu('geh nach süden'); s.tu('fahre los');
    const html = s.bloecke.filter(b => b.typ === 'auswahl').pop().html;
    pruefe(!/Stadtarchiv/.test(html) && new RegExp('value="' + vorher.gerdes + '">Wohnung Gerdes').test(html), 'Zielauswahl: Archiv fehlt, Gerdes behält Nummer ' + vorher.gerdes);
    const ziel = s.HG.spiel.offen && s.HG.spiel.offen.liste;
    pruefe(ziel && ziel[vorher.gerdes - 1] === 'gerdes', 'Antwort per fester Nummer trifft dasselbe Ziel');
    H.spiel.offen = null;
  }
  // 18. Tagebuch-Stufen strikt nacheinander
  {
    const s = imLager(); const H = s.HG, z = H.zustand.z;
    H.spukwerk.zug = () => {}; H.gefahren.darf = () => false;
    z.flags.nacht_im_haus = true; z.flags.carsten_begegnet = true; z.hinweise.push('polizeiakte_haeuser');
    const stufen = [];
    for (let i = 0; i < 4; i++) { s.tu('warte'); stufen.push(H.tagebuchStufe(H.api)); }
    pruefe(stufen.join() === '1,2,3,3', 'Tagebuch: Stufen nacheinander, auch wenn alles schon erfüllt ist (' + stufen.join() + ')');
  }
  // 19. Erste SMS: „Du hast seine Augen.“ – Carstens SMS später und woanders
  {
    const H = prolog().HG;
    pruefe(H.daten.nachrichten.willkommen.text === 'Du hast seine Augen.', 'Erste SMS des Hauses: „Du hast seine Augen.“');
    const sp = H.daten.spuk.sms_carsten; const z = H.zustand.z;
    z.flags.willkommen_min = H.zeit.jetzt(); z.raum = 'halle';
    pruefe(!sp.bedingung(H.api), 'Carstens SMS nicht gleichzeitig');
    z.zeit.minute += 15; z.raum = 'flur';
    pruefe(sp.bedingung(H.api), 'Carstens SMS einige Minuten später in einem anderen Raum');
  }
  // 20. Handyfotos: jede Unheimlichkeit nur einmal
  {
    const H = prolog().HG;
    const fotos = Object.keys(H.daten.dinge).map(id => H.daten.dinge[id].foto).filter(f => typeof f === 'string');
    pruefe(fotos.filter(f => /nachgezogen/.test(f)).length <= 1 && new Set(fotos).size === fotos.length, 'Handyfotos: keine wiederholte Unheimlichkeit');
  }
  // 21. Protokoll: nur die aktuelle Partie
  {
    const ctx = neueWelt(); const s = spieler(ctx); const H = s.HG;
    H.protokoll.leeren();
    H.spiel.start(); ['Alte Partie', 'Frau', 'würfeln', '1', 'öffne umschlag'].forEach(c => s.tu(c));
    ['neustart ja', 'Neue Partie', 'Mann', 'würfeln', '1'].forEach(c => s.tu(c));
    const t = H.protokoll.text();
    pruefe(!/Alte Partie/.test(t.split('--- Verlauf')[1]) && /Neue Partie/.test(t), 'Protokoll kopiert nur die aktuelle Partie');
  }
}
// --- 31. Spielgröße fürs Handy (28.11.2026) ---------------------------------------------------------------
{
  console.log('\n31. Spielgröße: WebP + 768-px-Fassung, keine Originale im Spiel, Sounds verkleinert, nur Spieldateien veröffentlicht');
  const B = path.join(WURZEL, 'assets', 'bilder'), S = path.join(WURZEL, 'assets', 'sound');
  const dateien = fs.readdirSync(B).filter(f => !fs.statSync(path.join(B, f)).isDirectory());
  pruefe(!dateien.some(f => /\.(jpe?g|png)$/i.test(f)), 'assets/bilder: keine JPG/PNG mehr (Originale in assets/original/)');
  const gross = dateien.filter(f => /\.webp$/.test(f) && !/-768\.webp$/.test(f));
  const ohne = gross.filter(f => !dateien.includes(f.replace(/\.webp$/, '-768.webp')));
  pruefe(gross.length > 100 && !ohne.length, 'Jedes Bild als WebP mit 768-px-Fassung (' + gross.length + ')' + (ohne.length ? ' – ohne: ' + ohne.slice(0, 3).join(', ') : ''));
  const zuGross = gross.filter(f => fs.statSync(path.join(B, f)).size > 400 * 1024);
  pruefe(!zuGross.length, 'Kein Spielbild über 400 KB' + (zuGross.length ? ' – ' + zuGross.slice(0, 3).join(', ') : ''));
  const mp3 = fs.readdirSync(S).filter(f => /\.mp3$/.test(f));
  pruefe(mp3.length > 100 && mp3.every(f => fs.statSync(path.join(S, f)).size < 600 * 1024), 'Sounds verkleinert (' + mp3.length + ' MP3)');
  const ign = fs.readFileSync(path.join(WURZEL, '.gitignore'), 'utf8');
  pruefe(['assets/original/', 'docs/', 'assets/bilder/_kandidaten/', 'assets/bilder/_stiltest/', 'assets/bilder/_vorlagen/'].every(p => ign.includes(p)), '.gitignore: Originale, docs und Entwürfe bleiben lokal');
  const wf = fs.readFileSync(path.join(WURZEL, '.github', 'workflows', 'pages.yml'), 'utf8');
  pruefe(/cp index\.html manifest\.webmanifest sw\.js _site/.test(wf) && !/cp -r[^\n]*tools/.test(wf) && /rm -rf _site\/assets\/original/.test(wf), 'Veröffentlicht wird nur das Spiel (ohne tools/, docs/, CLAUDE.md, Originale)');
  const sw = fs.readFileSync(path.join(WURZEL, 'sw.js'), 'utf8');
  pruefe(/raum-wohnung/.test(sw) && /MEDIEN/.test(sw) && !/assets\/sound/.test(sw.split('self.addEventListener')[0]), 'Service Worker: beim Start nur Code und die Prolog-Bilder');
  const m = fs.readFileSync(path.join(WURZEL, 'js/engine/medien.js'), 'utf8');
  pruefe(/-768\.webp/.test(m) && /TON = \['mp3'/.test(m), 'Spiel: auf schmalen Bildschirmen die 768-px-Fassung, Sound zuerst als MP3');
}
// --- 32. Spieltest 3 (28.11.2026) --------------------------------------------------------------------------
{
  console.log('\n32. Spieltest 3: Pistole/Grest-Karton, Menü-Gruppen, Handy-Nachricht, Tippfehler, Protokoll, Schlüssel, Geräusche, Friedhof, Nachbarin, Klavier, Kerze, Porträt, Dunkelheit');
  const roh = s => s.bloecke.map(b => String(b.html || '')).join('\n');
  // 1./2. Lager
  {
    const s = imLager();
    s.tu('öffne schuhkarton');
    pruefe(/<span class="kein-wort">Geschirrtuch<\/span>[^]*Pistole/.test(roh(s)), 'Schuhkarton: „Geschirrtuch“ verbraucht den Link nicht – die Pistole ist antippbar');
    s.tu('öffne grest-karton');
    pruefe(/data-befehle="[^"]*nimm etwas hartes[^"]*">etwas Hartes<\/span>/.test(s.bloecke[s.bloecke.length - 1].html), 'Grest-Karton: „etwas Hartes“ schon beim Öffnen, antippbar');
    // 3. Menü nach Herkunft
    s.tu('nimm kästchen');
    const g = s.HG.spiel.menueGruppen('untersuche');
    const bei = g.find(x => x.titel === 'Bei dir');
    pruefe(g[0].titel === 'Hier im Raum' && bei && bei.unter && bei.unter.map(u => u.titel).join('|') === 'Von zu Hause|Aus dem Lager' && bei.unter[1].ids.includes('kaestchen'),
      'Menü „Untersuche“: Hier im Raum · Bei dir → Von zu Hause / Aus dem Lager (' + g.map(x => x.titel).join(', ') + ')');
    const a = fs.readFileSync(path.join(WURZEL, 'js/engine/anzeige.js'), 'utf8');
    pruefe(/wm-gruppe/.test(a) && /menueGruppen/.test(a) && /_gruppeZu/.test(a), 'Oberfläche: Gruppen auf- und zuklappbar (merkt sich offen/zu)');
    pruefe(/inRede/.test(a), 'Antippbare Wörter: nichts in wörtlicher Rede („Wand“ in Lottes Erzählung)');
    // 6. Tippfehler
    let t = s.tu('untersuhce kästchen');
    pruefe(/Meintest du „untersuche kästchen“/.test(t) && /data-tippbefehl="untersuche kästchen"/.test(roh(s)), 'Tippfehler: „Meintest du ‚untersuche kästchen‘?“ (antippbar)');
    t = s.tu('ja');
    pruefe(/Nussbaum/.test(t), 'Tippfehler: „ja“ führt den Vorschlag aus');
    t = s.tu('untersuhce tagebuch'); s.tu('nein');
    pruefe(/Meintest du „untersuche tagebuch“/.test(t), 'Tippfehler vor einem Wort, das selbst ein Befehl ist („untersuhce tagebuch“)');
    s.tu('öffne schuhkarton');
    t = s.tu('nimm pistle');
    pruefe(/Meintest du „nimm pistole“/.test(t), 'Tippfehler bei Dingen: ähnlichstes Wort im Raum');
    const s2 = imLager(); t = s2.tu('nimm pistle');
    pruefe(!/Meintest/.test(t), 'Tippfehler verraten nichts Verstecktes (Pistole im geschlossenen Karton)');
    // 7. Protokoll
    s.HG.ausgabe.schreibe('system', 'Protokoll kopiert (Test)', { keinProtokoll: true });
    pruefe(!/Protokoll kopiert \(Test\)/.test(s.HG.protokoll.text()), 'Protokoll: die Meldung „Protokoll kopiert“ steht nicht im Protokoll');
    pruefe(/navigator\.share/.test(a) && /canShare/.test(a) && /_protokollLaeuft/.test(a) && /download/.test(a), 'Protokoll: Teilen-Menü (Web Share, .txt), Rückfall Download/Zwischenablage, nur einmal auslösen');
  }
  // 4. Handy-Nachricht antippbar · 12. Nachbarhaus · 13. Frau Kolbe vor dem ersten Hausbesuch
  {
    const s = prolog(); s.tu('öffne umschlag'); s.tu('lies notarbrief'); s.tu('nimm hausschlüssel'); s.tu('fahre zum haus');
    const b = s.bloecke.filter(x => x.typ === 'handy' && /Neue Nachricht/.test(x.html)).pop();
    pruefe(b && b.befehl === 'lies nachrichten', 'Handy: eingeblendete Nachricht öffnet sich per Tipp („lies nachrichten“)');
    pruefe(/Ligusterhecke[^]*Gardine/.test(s.tu('schau')), 'Vor Haus Grest: Hinweis auf das Nachbarhaus im Westen (Hecke, Gardine)');
    s.HG.zufall = () => 0.05;
    s.tu('geh nach westen'); s.HG.zustand.z.zeit.minute = 11 * 60;
    const t = s.tu('geh hinein');
    pruefe(/Ihr Auto gesehen/.test(t) && !/reingegangen/.test(t), 'Frau Kolbe: „Ich hab Ihr Auto gesehen“, solange man nicht im Haus war');
  }
  // 14. Gesprächsoptionen
  {
    const k = fs.readFileSync(path.join(WURZEL, 'js/content/kolbe.js'), 'utf8'), g = fs.readFileSync(path.join(WURZEL, 'js/content/gerdes.js'), 'utf8');
    pruefe(/Das Haus da drüben gehört jetzt mir/.test(k) && /Ich habe das Haus geerbt/.test(g) && !/Ich wohne jetzt/.test(k + g), 'Kolbe und Gerdes: „Das Haus gehört jetzt mir“ / „Ich habe das Haus geerbt“');
  }
  // 8./9. Schlüssel und Geräusche · 18./19. Porträt
  {
    const s = imHaus();
    s.tu('schließe haustür'); s.tu('schließe haustür ab');
    let t = s.tu('öffne haustür');
    pruefe(/\(mit dem alten Hausschlüssel\)/.test(t) && s.HG.api.eig('haustuer', 'offen'), '„öffne haustür“ schließt mit dem passenden Schlüssel von selbst auf');
    s.tu('schließe haustür'); s.tu('schließe haustür ab');
    t = s.tu('geh nach süden');
    pruefe(/\(mit dem alten Hausschlüssel\)/.test(t) && s.HG.zustand.z.raum === 'einfahrt', '„geh nach …“ schließt ebenso auf');
    s.tu('geh nach norden');
    t = s.tu('öffne eichentür');
    pruefe(/passt nicht/.test(t) && !/\[Ein Schlüssel dreht sich/.test(t) && !/\[Die Tür knarrt\]/.test(t), 'Ohne passenden Schlüssel: „passt nicht“ – kein Schlüssel- und kein Knarr-Geräusch');
    t = s.tu('geh nach westen');
    pruefe(/verschlossen/.test(t) && !/\[/.test(t), '„geh nach westen“ an der verschlossenen Eichentür: kein Geräusch');
    s.HG.api.bewege('eisenschluessel', 'spieler'); s.HG.api.setze('eisenschluessel', 'versteckt', false);
    t = s.tu('öffne eichentür');
    pruefe(/\(mit dem [^)]*Schlüssel\)/.test(t) && /\[Ein Schlüssel dreht sich im Schloss\]/.test(t) && /\[Die Tür knarrt\]/.test(t), 'Mit dem eisernen Schlüssel: aufgeschlossen und geöffnet, beide Geräusche');
    s.tu('geh nach westen');
    t = s.tu('richte porträt gerade');
    pruefe(/Messingschlüssel/.test(t) && !s.HG.api.eig('messingschluessel', 'versteckt'), '„richte porträt gerade“ findet den Messingschlüssel');
    s.tu('untersuche portrait');
    t = s.tu('untersuche zirkel');
    pruefe(/Bernward hält den Zirkel/.test(t) && !/derselbe/.test(t), '„untersuche zirkel“ vor dem Porträt: der gemalte Zirkel („Portrait“ geht auch)');
    s.HG.api.bewege('zirkel', 'kaestchen'); s.HG.api.setze('zirkel', 'versteckt', false);
    t = s.tu('untersuche zirkel');
    pruefe(/derselbe Zirkel, der in Bernwards Kästchen steckt – B\. G\. im Griff/.test(t), 'Ist der Zirkel gefunden: „Es ist derselbe Zirkel …“');
    const u = imHaus(); u.HG.spiel.betrete('arbeitszimmer');
    pruefe(/Messingschlüssel/.test(u.tu('häng das bild gerade')), '„häng das bild gerade“ ebenso');
  }
  // 10./11. Friedhof
  {
    const s = imLager(); s.HG.spiel.betrete('friedhof');
    pruefe(/noch nie gesehen, wer/.test(s.tu('frage gärtner nach carstens grab')), 'Kowalski: Thema „Carstens Grab“ – der Lavendel, „Ich hab noch nie gesehen, wer.“');
    s.tu('geh nach norden');
    pruefe(/Efeu überzieht/.test(s.tu('untersuche efeu')), '„untersuche efeu“: eigenes Detail');
    pruefe(/gemeißelt/.test(s.tu('untersuche efeu am grabstein')), '„efeu am grabstein“: der gemeißelte Efeukranz');
  }
  // 15./16. Klavier vor der Haustür, Uhrticken
  {
    const s = imHaus(); s.tu('geh nach süden'); s.tu('schließe haustür');
    let t = s.tu('warte bis abend');
    pruefe(/\[Drinnen spielt jemand Klavier\]/.test(t), 'Abends vor der geschlossenen Haustür: [Drinnen spielt jemand Klavier]');
    pruefe(s.HG.medien.atmoKandidaten()[0] === 'klavier-gedaempft', 'Dazu der Raum-Sound klavier-gedaempft');
    t = s.tu('öffne haustür');
    pruefe(/\[Die Musik bricht ab\]/.test(t) && s.HG.medien.atmoKandidaten()[0] !== 'klavier-gedaempft', 'Beim Öffnen: [Die Musik bricht ab]');
    const K = s.HG.daten.klaenge;
    pruefe(K['klavier-gedaempft'] && K['klavier-gedaempft'].abbruch && K['ort-haus'].ausblenden === 30, 'Klang-Daten: Klavier bricht hart ab, Haus-Ticken blendet nach 30 s aus');
    const ml = path.join(WURZEL, 'docs/medien-liste.md');
    pruefe(!fs.existsSync(ml) || /klavier-gedaempft/.test(fs.readFileSync(ml, 'utf8')), 'Medienliste: klavier-gedaempft eingetragen');
  }
  // 17. Die wandernde Kerze brennt auf der untersten Stufe
  {
    const s = imHaus(), H = s.HG;
    H.zustand.z.zeit.minute = 20 * 60;
    H.api.spuk('kerze_wandert');
    let t = s.tu('schau');
    pruefe(/untersten Treppenstufe steht die Kerze[^]*brennt/.test(t) && H.medien.raumKandidaten().some(k => /raum-halle-spuk/.test(k.name)), 'Kerzen-Spuk: brennt auf der untersten Stufe (Text und Spukbild)');
    s.tu('geh nach osten'); s.tu('geh nach westen');
    pruefe(/untersten Stufe/.test(s.tu('untersuche kerze')), 'Der Zustand bleibt, solange man im Haus ist');
    t = s.tu('nimm kerze');
    pruefe(/brennt weiter/.test(t) && H.api.eig('kerze', 'brennt'), 'Genommen brennt sie weiter (Licht)');
    const u = imHaus(), U = u.HG; U.zustand.z.zeit.minute = 14 * 60; U.api.spuk('kerze_wandert');
    u.tu('geh nach süden');
    pruefe(U.api.eig('kerze', 'ort') === 'kommode' && !U.api.eig('kerze', 'brennt'), 'Wer das Haus verlässt: Die Kerze steht wieder kalt auf der Kommode');
  }
  // 20. Dunkelheit ab 16:30
  {
    const s = imHaus(), H = s.HG, z = H.zustand.z;
    s.tu('geh nach süden'); z.zeit.minute = 16 * 60 + 43;
    let t = s.tu('schau');
    pruefe(H.zeit.phase() === 'abend' && !/Mittagslicht/.test(t) && /dunkel/.test(t), '16:43 vor dem Haus: schon dunkel, kein „Mittagslicht“');
    s.tu('geh nach norden'); s.tu('schalte taschenlampe aus');
    pruefe(!H.welt.hell(), '16:43 in der Halle ohne Licht: dunkel');
    s.tu('schalte taschenlampe ein'); H.spiel.betrete('arbeitszimmer'); z.zeit.minute = 17 * 60 + 39;
    t = s.tu('schau');
    pruefe(!/Abendlicht/.test(t) && /dunkel/.test(t), '17:39 im Arbeitszimmer: kein „Abendlicht“');
    z.zeit.minute = 16 * 60 + 20;
    pruefe(H.zeit.phase() === 'mittag' && H.welt.hell('halle'), '16:20: noch hell');
  }
}
pruefe(!UNERSETZT.length, 'In keiner Ausgabe aller Tests steht ein unersetzter Platzhalter' + (UNERSETZT.length ? ': ' + UNERSETZT.slice(0, 3).join(' | ') : ''));

console.log('\n' + (tests - fehler) + ' von ' + tests + ' Prüfungen bestanden.' + (fehler ? ' ' + fehler + ' FEHLGESCHLAGEN.' : ''));
process.exit(fehler ? 1 : 0);
