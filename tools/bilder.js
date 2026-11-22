#!/usr/bin/env node
/*
 * Haus Grest – Bilder über die Gemini API erzeugen.
 *
 * Aufruf (im Projektordner):
 *   node tools/bilder.js                     alles Fehlende aus docs/medien-liste.md: erst Tagbilder,
 *                                            für übernommene Tagbilder dann die Varianten (Tabelle 1b)
 *   node tools/bilder.js halle brief         nur diese (Kurzname oder voller Name wie raum-halle);
 *                                            "halle" umfasst auch die Varianten der Halle
 *   node tools/bilder.js halle-spuk          nur diese eine Variante
 *   node tools/bilder.js --liste             nur anzeigen, was erzeugt würde (kostet nichts)
 *   node tools/bilder.js --neu halle         Kandidaten neu erzeugen (alte wandern nach _kandidaten/_alt/)
 *   node tools/bilder.js halle --stil="…"    anderen Stil-Baustein ausprobieren
 *   node tools/bilder.js halle --motiv="…"   anderes Motiv bzw. andere Anweisung (nur bei genau einem Bild)
 *   node tools/bilder.js ableiten halle regen --motiv="…"   freie Variante aus dem Tagbild ableiten
 *   node tools/bilder.js auswahl             Auswahl-Seite im Browser öffnen (Übernehmen per Klick)
 *   node tools/bilder.js nimm halle 2        Kandidat 2 als assets/bilder/raum-halle.jpg übernehmen
 *   node tools/bilder.js nimm halle-nacht 1  Kandidat 1 als assets/bilder/raum-halle-nacht.jpg übernehmen
 *   node tools/bilder.js bauplan-eg …        Tabelle 2b: Fundstücke aus einer Vorlage (z. B. Grundriss-PNG aus
 *                                            tools/grundriss.js) per Bildbearbeitung – die Anweisung gilt wörtlich
 *
 * Vor jedem API-Aufruf werden Anzahl und geschätzte Kosten angezeigt und es wird nachgefragt
 * (außer mit --ja).
 *
 * Der API-Key kommt ausschließlich aus der Umgebungsvariable GEMINI_API_KEY.
 * Er wird nirgends gespeichert und nie ausgegeben.
 *
 * Keine npm-Pakete nötig (Node 18+ hat fetch eingebaut).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const readline = require('readline');

// ---------------------------------------------------------------- Einstellungen
const MODELL = 'gemini-nano-banana-2.1';
const VARIANTEN = 2;                // Kandidaten pro Bild (Davids Vorgabe vom 22.11.2026)
const BILDGROESSE = '1K';           // 1K (≈1600 px breit, passt zur Medienliste), 2K oder 4K
// Preis pro erzeugtem Bild in US-Dollar (Gemini-Preisliste, Stand Nov. 2026 – bitte gelegentlich prüfen)
const PREIS = { '1K': 0.0336, '2K': 0.0504, '4K': 0.113 };
const SEITENVERHAELTNIS = { raum: '21:9', ort: '21:9', ding: '4:3' };
const PORT = 8377;

// Zusatz für abgeleitete Varianten (die Anweisungen selbst stehen in der Medienliste, Tabelle 1b)
const ZUSATZ_LICHT = 'Perspektive, Bildaufbau, Gegenstände und Malstil exakt beibehalten, nur Licht und Stimmung ändern.';
const ZUSATZ_SONST = 'Perspektive, Bildaufbau und Malstil exakt beibehalten, sonst nichts verändern.';

const WURZEL = path.resolve(__dirname, '..');
const MEDIENLISTE = path.join(WURZEL, 'docs', 'medien-liste.md');
const BILDER = path.join(WURZEL, 'assets', 'bilder');
const KANDIDATEN = path.join(BILDER, '_kandidaten');
const ALT = path.join(KANDIDATEN, '_alt');
const STILBILD = path.join(BILDER, '_stil.png');
const KANDIDATEN_JS = path.join(__dirname, 'kandidaten.js');
const ENDUNGEN = ['.webp', '.jpg', '.png'];
const MIME = { '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

// ---------------------------------------------------------------- Medienliste lesen
function leseMedienliste() {
  const md = fs.readFileSync(MEDIENLISTE, 'utf8');
  const hole = (re, was) => {
    const m = md.match(re);
    if (!m) throw new Error(was + ' in docs/medien-liste.md nicht gefunden.');
    return m[1].trim();
  };
  const stile = {
    raum: hole(/Stil-Baustein Räume:\*\* „([^“]+)“/, 'Stil-Baustein Räume'),
    fund: hole(/Stil-Baustein Fundstücke:\*\* „([^“]+)“/, 'Stil-Baustein Fundstücke'),
    schrift: hole(/Schrift-Zusatz:\*\*[^„]*„–\s*([^“]+)“/, 'Schrift-Zusatz'),
    nacht: hole(/Standard Nacht:\*\* „([^“]+)“/, 'Standard Nacht'),
    abend: hole(/Standard Abend:\*\* „([^“]+)“/, 'Standard Abend')
  };

  const eintraege = [], varianten = [];
  let abschnitt = '';
  for (const zeile of md.split(/\r?\n/)) {
    const ueberschrift = zeile.match(/^##\s+(\d+b?)\./);
    if (ueberschrift) { abschnitt = ueberschrift[1]; continue; }
    if (!['1', '1b', '2', '2b', '3'].includes(abschnitt) || !zeile.startsWith('|')) continue;

    const zellen = zeile.split('|').slice(1, -1).map(s => s.trim());
    const i = zellen.findIndex(z => /^`(raum|ding|ort)-[^`]+`$/.test(z));
    if (i < 0 || i === zellen.length - 1) continue;
    const name = zellen[i].slice(1, -1);
    const roh = zellen[zellen.length - 1].replace(/\s*\*\([^)]*\)\*\s*/g, ' ').trim();   // "*(Vorschlag)*" weg
    if (!roh) continue;

    // Tabelle 2b: Vorlage (Bilddatei) + wörtliche Anweisung für die Bildbearbeitung, kein angehängter Stil
    if (abschnitt === '2b') {
      const vorlage = (zellen.find(z => /^`[^`]+.(png|jpg|jpeg|webp)`$/.test(z)) || '').slice(1, -1);
      if (!vorlage) continue;
      eintraege.push({ name, titel: zellen[0] || name, art: 'ding', motiv: roh, stil: '', referenz: false, vorlage });
      continue;
    }
    if (abschnitt === '1b') {
      const standard = /^Standard (Nacht|Abend)$/i.exec(roh);
      varianten.push({
        name,
        anweisung: standard ? stile[standard[1].toLowerCase()] : roh,
        nurLicht: !!standard
      });
      continue;
    }

    // Motiv; ein angehängter Schrift-Zusatz steuert „kein Text“ vs. „Schrift unleserlich“
    const schriftRe = new RegExp('\\s*–\\s*' + stile.schrift.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*$');
    const mitSchrift = schriftRe.test(roh);
    // Text-Ausnahme: "… – Text im Bild: auf dem Schild steht „LAGER SCHMIDT“"
    const textRe = /\s*–\s*Text im Bild:\s*(.+)$/;
    const textImBild = (textRe.exec(roh) || [])[1];
    const motiv = roh.replace(schriftRe, '').replace(textRe, '');
    const fund = abschnitt === '2';
    let stil = fund ? stile.fund + ', kein Text' : stile.raum;
    if (mitSchrift) stil = stil.replace(/,\s*kein Text\s*$/, '') + ', ' + stile.schrift;
    else if (textImBild) stil = stil.replace(/,\s*kein Text\s*$/, '') + ', ' + textImBild + ', sonst kein Text im Bild';
    eintraege.push({
      name,
      titel: zellen[i - 1] || name,
      art: name.split('-')[0],
      motiv, stil,
      referenz: !fund            // Stil-Referenzbild nur für den gemalten Raumstil
    });
  }

  // Jede Variante gehört zum längsten passenden Grundbild (raum-halle-tuer-offen -> raum-halle)
  for (const v of varianten) {
    const basis = eintraege.filter(e => v.name.startsWith(e.name + '-')).sort((a, b) => b.name.length - a.name.length)[0];
    if (!basis) throw new Error('Variante ' + v.name + ': kein passendes Tagbild in Tabelle 1.');
    v.basis = basis.name;
    v.art = basis.art;
    v.titel = basis.titel + ' – ' + v.name.slice(basis.name.length + 1);
  }
  return { eintraege, varianten, stile };
}

function variantenPrompt(anweisung, nurLicht, stil) {
  return 'Bearbeite das beigefügte Bild: ' + anweisung.replace(/\.?\s*$/, '.') + ' ' +
    (nurLicht ? ZUSATZ_LICHT : ZUSATZ_SONST) + ' Stil: ' + stil;
}

function vorhandeneDatei(name) {
  for (const e of ENDUNGEN) {
    const p = path.join(BILDER, name + e);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function kandidatenVon(name) {
  if (!fs.existsSync(KANDIDATEN)) return [];
  const re = new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '-(\\d+)\\.(jpg|png|webp)$');
  return fs.readdirSync(KANDIDATEN)
    .map(f => ({ f, m: f.match(re) }))
    .filter(x => x.m)
    .sort((a, b) => a.m[1] - b.m[1])
    .map(x => x.f);
}

// Alte Kandidaten nicht löschen, sondern beiseitelegen
function legeAlteBeiseite(name) {
  const alte = kandidatenVon(name);
  if (!alte.length) return;
  const stempel = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  fs.mkdirSync(ALT, { recursive: true });
  for (const f of alte) fs.renameSync(path.join(KANDIDATEN, f), path.join(ALT, stempel + '-' + f));
  console.log('  ältere Kandidaten verschoben nach assets/bilder/_kandidaten/_alt/');
}

function passt(name, wunsch) {
  const w = wunsch.toLowerCase();
  return name === w || ['raum-', 'ding-', 'ort-'].some(p => name === p + w);
}

function vollerName(wunsch, eintraege) {
  const e = eintraege.find(x => passt(x.name, wunsch));
  if (e) return e.name;
  // abgeleitete Varianten (z. B. halle-nacht) stehen nicht in der Liste
  for (const p of ['', 'raum-', 'ding-', 'ort-']) {
    if (kandidatenVon(p + wunsch).length || vorhandeneDatei(p + wunsch)) return p + wunsch;
  }
  return null;
}

function leseBild(datei) {
  const daten = fs.readFileSync(datei);
  // Dateityp am Inhalt erkennen – die Endung kann täuschen
  const mime = daten[0] === 0x89 && daten[1] === 0x50 ? 'image/png'
    : daten[0] === 0xFF && daten[1] === 0xD8 ? 'image/jpeg'
      : daten.slice(8, 12).toString() === 'WEBP' ? 'image/webp'
        : MIME[path.extname(datei)] || 'image/png';
  return { mime, base64: daten.toString('base64') };
}

// ---------------------------------------------------------------- Gemini API
// auftrag: { text, art, eingabeBild?: {mime, base64}, stilbild?: {mime, base64} }
async function erzeugeBild(auftrag) {
  const key = process.env.GEMINI_API_KEY;
  const eingabe = [{ type: 'text', text: auftrag.text }];
  if (auftrag.eingabeBild) {
    eingabe.push({ type: 'image', mime_type: auftrag.eingabeBild.mime, data: auftrag.eingabeBild.base64 });
  }
  if (auftrag.stilbild) {
    eingabe.push({
      type: 'text',
      text: 'Das folgende Bild ist nur eine Stilvorlage: Übernimm Malstil, Pinselführung und Farbgebung, aber nicht Inhalt oder Bildaufbau.'
    });
    eingabe.push({ type: 'image', mime_type: auftrag.stilbild.mime, data: auftrag.stilbild.base64 });
  }

  const antwort = await mitWiederholung(() => fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODELL,
      input: eingabe,
      response_format: {
        type: 'image', mime_type: 'image/jpeg',
        aspect_ratio: SEITENVERHAELTNIS[auftrag.art] || '16:9', image_size: BILDGROESSE
      }
    })
  }));

  const daten = await antwort.json().catch(() => ({}));
  if (!antwort.ok) {
    const meldung = (daten.error && daten.error.message) || antwort.statusText;
    throw new Error('API-Fehler ' + antwort.status + ': ' + meldung);
  }
  const bild = findeBild(daten);
  if (!bild) {
    const text = findeText(daten);
    throw new Error('Kein Bild in der Antwort.' + (text ? ' Modell sagt: ' + text.slice(0, 300) : ''));
  }
  return bild;
}

async function mitWiederholung(anfrage) {
  for (let versuch = 1; ; versuch++) {
    const antwort = await anfrage();
    if ((antwort.status === 429 || antwort.status >= 500) && versuch < 4) {
      const warte = 10 * versuch;
      console.log('    Server ausgelastet (' + antwort.status + '), neuer Versuch in ' + warte + ' s …');
      await new Promise(r => setTimeout(r, warte * 1000));
      continue;
    }
    return antwort;
  }
}

// Sucht das erste Bild in der Antwort, egal wie tief verschachtelt.
function findeBild(o) {
  if (!o || typeof o !== 'object') return null;
  const mime = o.mime_type || o.mimeType;
  if (typeof o.data === 'string' && o.data.length > 1000 && (o.type === 'image' || /^image\//.test(mime || ''))) {
    return { mime: mime || 'image/jpeg', base64: o.data };
  }
  for (const k of Object.keys(o)) {
    const r = findeBild(o[k]);
    if (r) return r;
  }
  return null;
}

function findeText(o) {
  if (!o || typeof o !== 'object') return '';
  if (o.type === 'text' && typeof o.text === 'string') return o.text;
  for (const k of Object.keys(o)) {
    const r = findeText(o[k]);
    if (r) return r;
  }
  return '';
}

// Erzeugt VARIANTEN Kandidaten für einen Auftrag und legt eine Info-Datei für die Auswahl-Seite daneben.
async function erzeugeKandidaten(name, auftrag, info) {
  console.log('\n' + name + ':');
  fs.mkdirSync(KANDIDATEN, { recursive: true });
  legeAlteBeiseite(name);
  fs.writeFileSync(path.join(KANDIDATEN, name + '.json'), JSON.stringify(info, null, 2), 'utf8');
  let fehler = 0;
  for (let n = 1; n <= VARIANTEN; n++) {
    try {
      const bild = await erzeugeBild(auftrag);
      const endung = bild.mime === 'image/png' ? '.png' : bild.mime === 'image/webp' ? '.webp' : '.jpg';
      const datei = path.join(KANDIDATEN, name + '-' + n + endung);
      fs.writeFileSync(datei, Buffer.from(bild.base64, 'base64'));
      console.log('  Kandidat ' + n + ' gespeichert: ' + path.relative(WURZEL, datei));
    } catch (err) {
      fehler++;
      console.log('  Kandidat ' + n + ' FEHLER: ' + err.message);
    }
  }
  return fehler;
}

// ---------------------------------------------------------------- Auswahl-Daten
function schreibeKandidatenJs() {
  const gruppen = {};
  if (fs.existsSync(KANDIDATEN)) {
    for (const f of fs.readdirSync(KANDIDATEN)) {
      const m = f.match(/^(.+)-(\d+)\.(jpg|png|webp)$/);
      if (m) (gruppen[m[1]] = gruppen[m[1]] || []).push(f);
    }
  }
  const liste = Object.keys(gruppen).sort().map(name => {
    let info = {};
    try { info = JSON.parse(fs.readFileSync(path.join(KANDIDATEN, name + '.json'), 'utf8')); } catch (e) { /* ohne Info */ }
    const gewaehlt = vorhandeneDatei(name);
    const vorlage = info.vorlage && vorhandeneDatei(info.vorlage);
    return {
      name,
      titel: info.titel || name,
      prompt: info.prompt || '',
      kandidaten: kandidatenVon(name),
      gewaehlt: gewaehlt ? path.basename(gewaehlt) : null,
      vorlage: vorlage ? path.basename(vorlage) : null
    };
  });
  fs.writeFileSync(KANDIDATEN_JS,
    '// Automatisch erzeugt von tools/bilder.js – nicht von Hand bearbeiten.\n' +
    'window.KANDIDATEN = ' + JSON.stringify(liste, null, 2) + ';\n', 'utf8');
}

function uebernimm(name, nummer) {
  const datei = kandidatenVon(name).find(f => f.startsWith(name + '-' + nummer + '.'));
  if (!datei) throw new Error('Kandidat ' + name + ' Nr. ' + nummer + ' nicht gefunden.');
  for (const e of ENDUNGEN) {               // alte Fassung in anderem Format entfernen
    const alt = path.join(BILDER, name + e);
    if (fs.existsSync(alt)) fs.unlinkSync(alt);
  }
  const ziel = path.join(BILDER, name + path.extname(datei));
  fs.copyFileSync(path.join(KANDIDATEN, datei), ziel);
  return path.relative(WURZEL, ziel);
}

// ---------------------------------------------------------------- Auswahl-Server
function starteAuswahl() {
  schreibeKandidatenJs();
  const typen = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.jpg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };

  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (req.method === 'POST' && url === '/uebernehmen') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const { name, nummer } = JSON.parse(body);
          if (!/^(raum|ding|ort)-[\w-]+$/.test(name) || !/^\d+$/.test(String(nummer))) throw new Error('Ungültige Angabe.');
          const ziel = uebernimm(name, nummer);
          console.log('Übernommen: ' + ziel);
          schreibeKandidatenJs();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, ziel }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, fehler: e.message }));
        }
      });
      return;
    }
    if (url === '/') { res.writeHead(302, { Location: '/tools/auswahl.html' }); res.end(); return; }
    if (url === '/tools/kandidaten.js') schreibeKandidatenJs();   // immer frisch
    // Nur Dateien aus tools/ und assets/bilder/ ausliefern
    const pfad = path.normalize(path.join(WURZEL, url));
    const erlaubt = [__dirname, BILDER].some(o => pfad.startsWith(o + path.sep));
    if (!erlaubt || !fs.existsSync(pfad) || fs.statSync(pfad).isDirectory()) {
      res.writeHead(404); res.end('Nicht gefunden'); return;
    }
    res.writeHead(200, { 'Content-Type': typen[path.extname(pfad)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(pfad).pipe(res);
  });

  server.listen(PORT, '127.0.0.1', () => {
    const adresse = 'http://localhost:' + PORT + '/tools/auswahl.html';
    console.log('Auswahl-Seite läuft: ' + adresse);
    console.log('Beenden mit Strg+C.');
    const { exec } = require('child_process');
    const befehl = process.platform === 'win32' ? 'start "" "' + adresse + '"'
      : process.platform === 'darwin' ? 'open ' + adresse : 'xdg-open ' + adresse;
    exec(befehl);
  });
}

// ---------------------------------------------------------------- Hilfen
function frage(text) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r => rl.question(text, a => { rl.close(); r(a.trim().toLowerCase()); }));
}

function leseSchalter(args) {
  const schalter = {};
  const woerter = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const m = a.match(/^--([a-zäöü]+)(?:=(.*))?$/s);
    if (!m) { woerter.push(a); continue; }
    if (m[2] !== undefined) schalter[m[1]] = m[2];
    else if ((m[1] === 'stil' || m[1] === 'motiv') && i + 1 < args.length) schalter[m[1]] = args[++i];
    else schalter[m[1]] = true;
  }
  return { schalter, woerter };
}

// Zeigt Aufträge und Kosten, fragt nach. Liefert true, wenn es losgehen darf.
async function bestaetige(auftraege, schalter) {
  const anzahl = auftraege.length * VARIANTEN;
  const kosten = anzahl * PREIS[BILDGROESSE];
  console.log('\nZu erzeugen:');
  for (const a of auftraege) console.log('  ' + a.name.padEnd(26) + a.info.titel + (a.variante ? '  (aus dem Tagbild)' : a.auftrag.stilbild ? '  (+ Stil-Referenz)' : ''));
  console.log('\nModell: ' + MODELL + ', Größe ' + BILDGROESSE + ', ' + VARIANTEN + ' Kandidaten pro Bild');
  if (!fs.existsSync(STILBILD)) console.log('Hinweis: assets/bilder/_stil.png fehlt – Raumbilder ohne Stil-Referenz.');
  console.log(auftraege.length + ' Bilder × ' + VARIANTEN + ' = ' + anzahl + ' Aufrufe, geschätzte Kosten ca. ' +
    kosten.toFixed(2) + ' US-$ (ohne Gewähr, kostenlose Kontingente nicht berücksichtigt)');

  if (schalter.liste) {
    console.log('\nVorschau der Prompts:');
    for (const a of auftraege) console.log('\n[' + a.name + ']\n' + a.info.prompt);
    return false;
  }
  if (!process.env.GEMINI_API_KEY) throw new Error('Umgebungsvariable GEMINI_API_KEY ist nicht gesetzt.');
  if (schalter.ja) return true;
  const antwort = await frage('\nStarten? (j/n) ');
  if (antwort === 'j' || antwort === 'ja') return true;
  console.log('Abgebrochen.');
  return false;
}

async function fuehreAus(auftraege) {
  let fehler = 0;
  for (const a of auftraege) fehler += await erzeugeKandidaten(a.name, a.auftrag, a.info);
  schreibeKandidatenJs();
  console.log('\nFertig' + (fehler ? ' (' + fehler + ' Fehler)' : '') + '. Auswählen mit: node tools/bilder.js auswahl');
}

// ---------------------------------------------------------------- Hauptprogramm
async function main() {
  const { schalter, woerter } = leseSchalter(process.argv.slice(2));
  const { eintraege, varianten, stile } = leseMedienliste();
  const eigenerStil = typeof schalter.stil === 'string' ? schalter.stil : null;
  const eigenesMotiv = typeof schalter.motiv === 'string' ? schalter.motiv : null;
  const stilbild = fs.existsSync(STILBILD) ? leseBild(STILBILD) : null;
  const alleNamen = eintraege.map(e => e.name).concat(varianten.map(v => v.name));

  if (woerter[0] === 'auswahl') return starteAuswahl();

  if (woerter[0] === 'nimm') {
    const name = alleNamen.find(n => passt(n, woerter[1] || '')) || vollerName(woerter[1] || '', eintraege);
    if (!name || !woerter[2]) throw new Error('Aufruf: node tools/bilder.js nimm <name> <nummer>');
    console.log('Übernommen: ' + uebernimm(name, woerter[2]));
    schreibeKandidatenJs();
    return;
  }

  // Auftrag für eine Variante: Bildbearbeitung des übernommenen Tagbilds
  const variantenAuftrag = (v, anweisung) => {
    const text = variantenPrompt(anweisung, v.nurLicht, eigenerStil || stile.raum);
    return {
      name: v.name, variante: true,
      auftrag: { text, art: v.art, eingabeBild: leseBild(vorhandeneDatei(v.basis)) },
      info: { titel: v.titel, prompt: text, vorlage: v.basis }
    };
  };

  // ---- Freie Variante, die nicht in der Medienliste steht
  if (woerter[0] === 'ableiten') {
    const basis = eintraege.find(e => passt(e.name, woerter[1] || ''));
    const art = woerter[2];
    if (!basis || !art) throw new Error('Aufruf: node tools/bilder.js ableiten <name> <variante> --motiv="Anweisung"');
    if (!vorhandeneDatei(basis.name)) throw new Error('Erst ein Tagbild für ' + basis.name + ' übernehmen.');
    const bekannt = varianten.find(v => v.name === basis.name + '-' + art);
    const anweisung = eigenesMotiv || (bekannt && bekannt.anweisung) || (art === 'nacht' ? stile.nacht : art === 'abend' ? stile.abend : null);
    if (!anweisung) throw new Error('Keine Anweisung für „' + art + '“. Bitte mit --motiv="…" angeben (oder in Tabelle 1b eintragen).');
    const v = bekannt || { name: basis.name + '-' + art, basis: basis.name, art: basis.art, titel: basis.titel + ' – ' + art, nurLicht: !eigenesMotiv && (art === 'nacht' || art === 'abend') };
    if (!schalter.neu && (vorhandeneDatei(v.name) || kandidatenVon(v.name).length)) {
      console.log('Für ' + v.name + ' gibt es schon ein Bild oder Kandidaten. Mit --neu erzwingen.');
      return schreibeKandidatenJs();
    }
    const auftraege = [variantenAuftrag(v, anweisung)];
    if (await bestaetige(auftraege, schalter)) await fuehreAus(auftraege);
    return;
  }

  // ---- Auswahl: ohne Angabe alles; ein Tagbild-Name umfasst seine Varianten
  let tagbilder = eintraege, vars = varianten;
  if (woerter.length) {
    const unbekannt = woerter.filter(w => !alleNamen.some(n => passt(n, w)));
    if (unbekannt.length) throw new Error('Unbekannt: ' + unbekannt.join(', ') + '\nBekannte Namen: ' + alleNamen.join(', '));
    tagbilder = eintraege.filter(e => woerter.some(w => passt(e.name, w)));
    vars = varianten.filter(v => woerter.some(w => passt(v.name, w) || passt(v.basis, w)));
  }

  const auftraege = [], vorhanden = [], mitKandidaten = [], wartend = [];
  const offen = name => {
    if (schalter.neu) return true;
    if (vorhandeneDatei(name)) { vorhanden.push(name); return false; }
    if (kandidatenVon(name).length) { mitKandidaten.push(name); return false; }
    return true;
  };

  // 1. Tagbilder
  for (const e of tagbilder) {
    if (!offen(e.name)) continue;
    const stil = eigenerStil || e.stil;
    const prompt = (eigenesMotiv || e.motiv) + (stil ? ' – ' + stil : '');
    let eingabeBild;
    if (e.vorlage) {
      const pfad = path.join(WURZEL, e.vorlage);
      if (!fs.existsSync(pfad)) { console.log('Vorlage fehlt: ' + e.vorlage + ' (erst „node tools/grundriss.js“ ausführen) – übersprungen.'); continue; }
      eingabeBild = leseBild(pfad);
    }
    auftraege.push({
      name: e.name,
      auftrag: { text: prompt, art: e.art, stilbild: e.referenz ? stilbild : null, eingabeBild },
      info: { titel: e.titel, prompt }
    });
  }
  // 2. Varianten – nur, wenn ihr Tagbild schon übernommen ist
  for (const v of vars) {
    if (!vorhandeneDatei(v.basis)) { wartend.push(v.name); continue; }
    if (!offen(v.name)) continue;
    auftraege.push(variantenAuftrag(v, eigenesMotiv || v.anweisung));
  }
  if (eigenesMotiv && auftraege.length !== 1) throw new Error('--motiv geht nur zusammen mit genau einem Bild.');

  if (vorhanden.length) console.log('Schon im Spiel (übersprungen): ' + vorhanden.join(', '));
  if (mitKandidaten.length) console.log('Kandidaten warten auf Auswahl (übersprungen, --neu erzwingt): ' + mitKandidaten.join(', '));
  if (wartend.length) console.log('Varianten warten auf ihr Tagbild: ' + wartend.join(', '));

  if (!auftraege.length) {
    console.log('\nNichts zu tun.');
    return schreibeKandidatenJs();
  }
  if (await bestaetige(auftraege, schalter)) await fuehreAus(auftraege);
}

main().catch(err => { console.error('\n' + err.message); process.exitCode = 1; });
