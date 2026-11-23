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
  const getragen1 = HG.welt.getragen('brief_1905');
  HG.spiel.offen = null; HG.zustand.z = JSON.parse(sicher);
  const t2 = s.tu('nimm brief aus kästchen');
  const getragen2 = HG.welt.getragen('brief_1905');
  pruefe(getragen1 && getragen2, weg + ': „nimm brief“ und „nimm brief aus kästchen“ stecken den Brief ein' + (getragen1 ? '' : '  →  ' + t1.split('\n')[0]) + (getragen2 ? '' : '  →  ' + t2.split('\n')[0]));
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
  pruefe(s.HG.welt.getragen('brief_1905'), 'Gewalt: zerrissener Brief eingesteckt');
  const l = s.tu('lies brief');
  pruefe(/Riss/.test(l), 'Gewalt: zerrissener Brief lesbar');
}

// --- 5. Mehrdeutigkeit „Brief“ ----------------------------------------------
{
  console.log('\n5. Rückfragen bei „Brief“');
  const s = imLager();
  s.tu('nimm notarbrief');
  // Notarbrief mitnehmen? (er liegt im Umschlag zu Hause – dort holen)
  const s2 = prolog();
  s2.tu('öffne umschlag'); s2.tu('nimm notarbrief');
  pruefe(s2.HG.welt.getragen('notarbrief'), 'Notarbrief lässt sich einstecken');
  zumLager(s2);
  s2.tu('schiebe leiste'); s2.tu('öffne grest-karton'); s2.tu('nimm etwas hartes'); s2.tu('stecke zirkel in schlitz'); s2.tu('drehe ringe auf 1205');
  {
    const sicher = JSON.stringify(s2.HG.zustand.z);
    s2.tu('nimm brief');   // den Notarbrief hat man schon – gemeint ist der aus dem Kästchen
    pruefe(s2.HG.welt.getragen('brief_1905'), '„nimm brief“ nimmt den Brief von 1905 (den Notarbrief hast du schon)');
    s2.HG.zustand.z = JSON.parse(sicher);
  }
  ['lies brief', 'untersuche brief', 'riech an brief'].forEach(b => {
    const sicher = JSON.stringify(s2.HG.zustand.z);
    const t = s2.tu(b);
    const frage = s2.HG.spiel.offen && s2.HG.spiel.offen.art === 'wahl';
    pruefe(frage && /Notarbrief/.test(t) && /1905/.test(t), '„' + b + '“ fragt nach: ' + t.split('\n').pop());
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

console.log('\n' + (tests - fehler) + ' von ' + tests + ' Prüfungen bestanden.' + (fehler ? ' ' + fehler + ' FEHLGESCHLAGEN.' : ''));
process.exit(fehler ? 1 : 0);
