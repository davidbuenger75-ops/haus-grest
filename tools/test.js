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
function pruefe(bed, text) {
  tests++;
  if (bed) { if (LAUT) console.log('  ✓ ' + text); return; }
  fehler++; console.log('  ✗ ' + text);
}

function spieler(ctx) {
  const HG = ctx.HG, log = [];
  HG.ausgabe.ziel = b => log.push(b);
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
  ['lies brief', 'untersuche brief', 'riech an brief'].forEach(b => {
    const sicher = JSON.stringify(s2.HG.zustand.z);
    const t = s2.tu(b);
    const frage = s2.HG.spiel.offen && s2.HG.spiel.offen.art === 'wahl';
    pruefe(frage && /vergilbt/.test(t) && /1905/.test(t), '„' + b + '“ fragt nach: ' + t.split('\n').pop());
    if (frage) {
      const a = s2.tu('den von 1905');
      pruefe(!KAPUTT.test(a) && !s2.HG.spiel.offen, '  Antwort „den von 1905“ wird verstanden');
    }
    s2.HG.spiel.offen = null; s2.HG.zustand.z = JSON.parse(sicher);
  });
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
  const frage = s.tu('lies gravur');
  pruefe(/Messingplatte/.test(frage) && /Gravur/.test(frage), 'Rückfrage: Messingplatte oder Gravur (Kästchen)');
  s.tu('messingplatte');
  pruefe(HG.zustand.z.hinweise.includes('hochzeitstag'), 'Kaminsims: „Unser Tag“ (zweite Quelle für den Code)');
  s.tu('lies gravur');
  const t2 = s.tu('gravur');
  pruefe(!HG.spiel.offen && /erbaute/.test(t2), 'Antwort „gravur“ wählt die Gravur am Kästchen – keine Endlosschleife');
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
  Z.werte.nerven = 50;
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
  // Neumond: dritte Nacht, danach etwa alle 29,5 Tage
  pruefe(HG.nacht.bisNeumond(1) === 2 && HG.nacht.istNeumond(3) && HG.nacht.bisNeumond(4) === 29 && HG.nacht.istNeumond(33) && HG.nacht.bisNeumond(34) === 28, 'Neumond: Nacht 3, dann Nacht 33, 62 …');

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
    s.tu('frage lotte nach dem ring');
    pruefe(Z().hinweise.includes('lotte_ring'), 'Lotte: der Ring');
    Z().hinweise.push('elisabeths_siegel', 'elisabeths_ring');
    const sl = Object.values(HG.daten.schluesse);
    pruefe(sl.find(x => x.id === 'zwei_elisabeths').aus.includes('lotte_zwei_gesichter') && sl.find(x => x.id === 'ring_ist_anker').aus.includes('lotte_ring'), 'Lottes Aussagen zählen für „Zwei Elisabeths“ und „Der Ring ist der Anker“');
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
    pruefe(Z().schluesse.includes('ring_ist_anker'), 'Grabstein + Ring: „Der Ring ist der Anker“');
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
    pruefe(Z().flags['friedhof_abend_' + Z().zeit.tag], 'Abends: die Krähe auf der Hand ohne Ring');
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

console.log('\n' + (tests - fehler) + ' von ' + tests + ' Prüfungen bestanden.' + (fehler ? ' ' + fehler + ' FEHLGESCHLAGEN.' : ''));
process.exit(fehler ? 1 : 0);
