// Haus Grest – automatischer Testdurchlauf (Hilfswerkzeug für den Autor, gehört nicht zum Spiel)
//
//   node tools/test.js            alle Tests
//   node tools/test.js -v         dazu die komplette Spielausgabe
//
// Lädt Engine und Inhalt wie index.html (ohne Oberfläche) in eine Node-Sandbox und spielt:
// Prolog → Lager Schmidt → Kästchen auf allen drei Wegen (Code, Werkzeug, Gewalt) → Brief nehmen und lesen
// (auch über die Menüs) → Zirkel über „nimm etwas hartes“ und andere naheliegende Befehle → Carstens Bauplan.
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

console.log('\n' + (tests - fehler) + ' von ' + tests + ' Prüfungen bestanden.' + (fehler ? ' ' + fehler + ' FEHLGESCHLAGEN.' : ''));
process.exit(fehler ? 1 : 0);
