#!/usr/bin/env node
/*
 * Haus Grest – Sounds über die ElevenLabs Sound-Effects-API erzeugen.
 *
 * Quelle: js/content/klang.js (Prompt, Länge, Schleife ja/nein – dieselbe Datei liefert dem Spiel die Untertitel).
 *
 * Aufruf (im Projektordner):
 *   node tools/sounds.js                       alles, was in assets/sound/ noch fehlt
 *   node tools/sounds.js ort-haus-nacht uhr-drei   nur diese (voller Name oder ohne „effekt-“)
 *   node tools/sounds.js --liste               nur anzeigen, was erzeugt würde (kostet nichts)
 *   node tools/sounds.js --neu uhr-drei        neu erzeugen, auch wenn es schon Kandidaten gibt (alte → _alt/)
 *   node tools/sounds.js --varianten=1 …       Kandidaten pro Sound (Standard 2; bei 1 wird er gleich übernommen)
 *   node tools/sounds.js auswahl               Auswahl-Seite im Browser (Abspielen, Übernehmen per Klick)
 *   node tools/sounds.js nimm uhr-drei 2       Kandidat 2 als assets/sound/effekt-uhr-drei.mp3 übernehmen
 *   node tools/sounds.js credits               nur den Credit-Stand des Kontos anzeigen
 *
 * Vor jedem API-Aufruf werden Anzahl und geschätzte Credits angezeigt und es wird nachgefragt (außer mit --ja).
 * Danach zeigt das Skript, wie viele Credits wirklich verbraucht wurden (Kontostand vorher/nachher).
 *
 * API (geprüft 27.11.2026, elevenlabs.io/docs): POST https://api.elevenlabs.io/v1/sound-generation
 *   Kopfzeile xi-api-key · JSON { text, duration_seconds (0,5–30), prompt_influence (0–1, Standard 0,3), loop,
 *   model_id } · ?output_format=mp3_44100_128 · Antwort: MP3-Daten. Modell eleven_text_to_sound_v3 (v2 entfällt
 *   am 1.3.2027; „loop“ gehört zu v3). Kosten: 40 Credits pro Sekunde bei fester Länge.
 *
 * Der API-Key kommt ausschließlich aus der Umgebungsvariable ELEVENLABS_API_KEY.
 * Er wird nirgends gespeichert und nie ausgegeben. Keine npm-Pakete nötig (Node 18+).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const http = require('http');
const readline = require('readline');

// ---------------------------------------------------------------- Einstellungen
const MODELL = 'eleven_text_to_sound_v3';
const FORMAT = 'mp3_44100_128';
const PROMPT_EINFLUSS = 0.4;          // etwas wörtlicher als der Standard 0,3
const CREDITS_PRO_SEKUNDE = 40;
let VARIANTEN = 2;                    // Kandidaten pro Sound (David, 27.11.2026)
const PORT = 8378;
const API = 'https://api.elevenlabs.io/v1';

const WURZEL = path.resolve(__dirname, '..');
const KLANG_JS = path.join(WURZEL, 'js', 'content', 'klang.js');
const SOUND = path.join(WURZEL, 'assets', 'sound');
const KANDIDATEN = path.join(SOUND, '_kandidaten');
const ALT = path.join(KANDIDATEN, '_alt');
const KANDIDATEN_JS = path.join(__dirname, 'sound-kandidaten.js');
const ENDUNGEN = ['.mp3', '.ogg'];

// ---------------------------------------------------------------- Verzeichnis lesen
function leseKlaenge() {
  const liste = {};
  const ctx = { HG: { klang: (name, def) => { liste[name] = Object.assign({ name }, def); } } };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(KLANG_JS, 'utf8'), ctx, { filename: 'klang.js' });
  return liste;
}
function vorhandeneDatei(name) {
  for (const e of ENDUNGEN) { const p = path.join(SOUND, name + e); if (fs.existsSync(p)) return p; }
  return null;
}
function kandidatenVon(name) {
  if (!fs.existsSync(KANDIDATEN)) return [];
  return fs.readdirSync(KANDIDATEN).filter(f => f.startsWith(name + '-') && /^\d+\.mp3$/.test(f.slice(name.length + 1))).sort();
}
function vollerName(wunsch, alle) {
  if (alle[wunsch]) return wunsch;
  for (const p of ['effekt-', 'effekt-spuk-', 'ort-']) if (alle[p + wunsch]) return p + wunsch;
  return null;
}
function credits(def) { return Math.ceil(def.sek * CREDITS_PRO_SEKUNDE); }

// ---------------------------------------------------------------- API
function schluessel() {
  const k = process.env.ELEVENLABS_API_KEY;
  if (!k) throw new Error('Umgebungsvariable ELEVENLABS_API_KEY ist nicht gesetzt.');
  return k;
}
/** Kontostand: { verbraucht, grenze } in Credits – oder null, wenn die Abfrage nicht klappt. */
async function kontostand() {
  try {
    const r = await fetch(API + '/user/subscription', { headers: { 'xi-api-key': schluessel() } });
    if (!r.ok) return null;
    const j = await r.json();
    return { verbraucht: j.character_count, grenze: j.character_limit, tarif: j.tier };
  } catch (e) { return null; }
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
async function erzeugeSound(def) {
  const body = {
    text: def.prompt,
    duration_seconds: Math.max(0.5, Math.min(30, def.sek)),
    prompt_influence: PROMPT_EINFLUSS,
    loop: def.art === 'schleife',
    model_id: MODELL
  };
  const antwort = await mitWiederholung(() => fetch(API + '/sound-generation?output_format=' + FORMAT, {
    method: 'POST',
    headers: { 'xi-api-key': schluessel(), 'Content-Type': 'application/json', 'Accept': 'audio/mpeg' },
    body: JSON.stringify(body)
  }));
  if (!antwort.ok) {
    let text = '';
    try { text = await antwort.text(); } catch (e) { /* egal */ }
    throw new Error('HTTP ' + antwort.status + ' ' + text.slice(0, 300));
  }
  return Buffer.from(await antwort.arrayBuffer());
}

function legeAlteBeiseite(name) {
  const alte = kandidatenVon(name);
  if (!alte.length) return;
  fs.mkdirSync(ALT, { recursive: true });
  const stempel = new Date().toISOString().replace(/[:.]/g, '-');
  for (const f of alte) fs.renameSync(path.join(KANDIDATEN, f), path.join(ALT, stempel + '-' + f));
}

async function erzeugeKandidaten(def) {
  fs.mkdirSync(KANDIDATEN, { recursive: true });
  console.log('\n' + def.name + ' (' + def.art + ', ' + def.sek + ' s):');
  let fehler = 0;
  const vorhanden = kandidatenVon(def.name).length;
  for (let i = 1; i <= VARIANTEN; i++) {
    const nr = vorhanden + i;
    try {
      const daten = await erzeugeSound(def);
      const datei = path.join(KANDIDATEN, def.name + '-' + nr + '.mp3');
      fs.writeFileSync(datei, daten);
      console.log('  Kandidat ' + nr + ' gespeichert: ' + path.relative(WURZEL, datei) + ' (' + Math.round(daten.length / 1024) + ' KB)');
      if (VARIANTEN === 1) console.log('  Übernommen: ' + uebernimm(def.name, nr));   // nur ein Kandidat: gleich ins Spiel
    } catch (e) {
      fehler++;
      console.log('  Fehler bei Kandidat ' + nr + ': ' + e.message);
    }
  }
  fs.writeFileSync(path.join(KANDIDATEN, def.name + '.json'),
    JSON.stringify({ name: def.name, art: def.art, sek: def.sek, untertitel: def.untertitel || '', prompt: def.prompt }, null, 2), 'utf8');
  return fehler;
}

// ---------------------------------------------------------------- Auswahl
function schreibeKandidatenJs() {
  const alle = leseKlaenge();
  const namen = new Set();
  if (fs.existsSync(KANDIDATEN)) for (const f of fs.readdirSync(KANDIDATEN)) { const m = f.match(/^(.+)-\d+\.mp3$/); if (m) namen.add(m[1]); }
  const liste = [...namen].sort().map(name => {
    const def = alle[name] || {};
    const gewaehlt = vorhandeneDatei(name);
    return { name, art: def.art || '', sek: def.sek || 0, untertitel: def.untertitel || '', prompt: def.prompt || '',
      kandidaten: kandidatenVon(name), gewaehlt: gewaehlt ? path.basename(gewaehlt) : null };
  });
  fs.writeFileSync(KANDIDATEN_JS, '// Automatisch erzeugt von tools/sounds.js – nicht von Hand bearbeiten.\nwindow.SOUNDS = ' + JSON.stringify(liste, null, 2) + ';\n', 'utf8');
}
function uebernimm(name, nummer) {
  const datei = kandidatenVon(name).find(f => f === name + '-' + nummer + '.mp3');
  if (!datei) throw new Error('Kandidat ' + name + ' Nr. ' + nummer + ' nicht gefunden.');
  for (const e of ENDUNGEN) { const alt = path.join(SOUND, name + e); if (fs.existsSync(alt)) fs.unlinkSync(alt); }
  const ziel = path.join(SOUND, name + '.mp3');
  fs.copyFileSync(path.join(KANDIDATEN, datei), ziel);
  return path.relative(WURZEL, ziel);
}
function starteAuswahl() {
  schreibeKandidatenJs();
  const typen = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg' };
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (req.method === 'POST' && url === '/uebernehmen') {
      let body = '';
      req.on('data', c => { body += c; });
      req.on('end', () => {
        try {
          const { name, nummer } = JSON.parse(body);
          if (!/^(ort|effekt)-[\w-]+$/.test(name) || !/^\d+$/.test(String(nummer))) throw new Error('Ungültige Angabe.');
          const ziel = uebernimm(name, nummer);
          console.log('Übernommen: ' + ziel);
          schreibeKandidatenJs();
          res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: true, ziel }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ ok: false, fehler: e.message }));
        }
      });
      return;
    }
    if (url === '/') { res.writeHead(302, { Location: '/tools/sound-auswahl.html' }); res.end(); return; }
    if (url === '/tools/sound-kandidaten.js') schreibeKandidatenJs();
    const pfad = path.normalize(path.join(WURZEL, url));
    const erlaubt = [__dirname, SOUND].some(o => pfad.startsWith(o + path.sep));
    if (!erlaubt || !fs.existsSync(pfad) || fs.statSync(pfad).isDirectory()) { res.writeHead(404); res.end('Nicht gefunden'); return; }
    res.writeHead(200, { 'Content-Type': typen[path.extname(pfad)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    fs.createReadStream(pfad).pipe(res);
  });
  server.listen(PORT, '127.0.0.1', () => {
    const adresse = 'http://localhost:' + PORT + '/tools/sound-auswahl.html';
    console.log('Sound-Auswahl läuft: ' + adresse + '\nBeenden mit Strg+C.');
    const { exec } = require('child_process');
    exec(process.platform === 'win32' ? 'start "" "' + adresse + '"' : process.platform === 'darwin' ? 'open ' + adresse : 'xdg-open ' + adresse);
  });
}

// ---------------------------------------------------------------- Hilfen
function frage(text) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(r => rl.question(text, a => { rl.close(); r(a.trim().toLowerCase()); }));
}
function leseSchalter(args) {
  const schalter = {}, woerter = [];
  for (const a of args) {
    const m = a.match(/^--([a-zäöü]+)(?:=(.*))?$/);
    if (m) schalter[m[1]] = m[2] === undefined ? true : m[2]; else woerter.push(a);
  }
  return { schalter, woerter };
}
function zeigeStand(s, titel) {
  if (!s) { console.log(titel + ': (nicht abrufbar)'); return; }
  console.log(titel + ': ' + s.verbraucht + ' von ' + s.grenze + ' Credits verbraucht, ' + (s.grenze - s.verbraucht) + ' übrig' + (s.tarif ? ' (Tarif ' + s.tarif + ')' : ''));
}

// ---------------------------------------------------------------- Hauptprogramm
async function main() {
  const { schalter, woerter } = leseSchalter(process.argv.slice(2));
  if (schalter.varianten) VARIANTEN = Math.max(1, parseInt(schalter.varianten, 10) || 1);
  const alle = leseKlaenge();

  if (woerter[0] === 'auswahl') return starteAuswahl();
  if (woerter[0] === 'credits') { zeigeStand(await kontostand(), 'Konto'); return; }
  if (woerter[0] === 'nimm') {
    const name = vollerName(woerter[1] || '', alle) || woerter[1];
    console.log('Übernommen: ' + uebernimm(name, woerter[2] || '1'));
    schreibeKandidatenJs();
    return;
  }

  let auftraege;
  if (woerter.length) {
    auftraege = woerter.map(w => { const n = vollerName(w, alle); if (!n) throw new Error('Unbekannter Sound: ' + w); return alle[n]; });
  } else {
    auftraege = Object.values(alle).filter(d => !vorhandeneDatei(d.name) && (schalter.neu || !kandidatenVon(d.name).length));
    const uebersprungen = Object.values(alle).filter(d => !auftraege.includes(d)).map(d => d.name);
    if (uebersprungen.length) console.log('Schon vorhanden oder schon Kandidaten (übersprungen): ' + uebersprungen.join(', '));
  }
  if (!auftraege.length) { console.log('Nichts zu tun.'); return; }

  const summe = auftraege.reduce((s, d) => s + credits(d) * VARIANTEN, 0);
  console.log('\nZu erzeugen (' + VARIANTEN + ' Kandidaten je Sound):');
  for (const d of auftraege) console.log('  ' + d.name.padEnd(30) + (d.art === 'schleife' ? 'Schleife' : 'Effekt  ') + String(d.sek).padStart(5) + ' s   ≈ ' + credits(d) * VARIANTEN + ' Credits' + (d.untertitel ? '   [' + d.untertitel + ']' : ''));
  console.log('\nModell ' + MODELL + ', ' + FORMAT + '. ' + auftraege.length + ' Sounds × ' + VARIANTEN + ' = ' + auftraege.length * VARIANTEN + ' Aufrufe, geschätzt ' + summe + ' Credits (40 pro Sekunde).');

  if (schalter.liste) {
    console.log('\nPrompts:');
    for (const d of auftraege) console.log('\n[' + d.name + ']\n' + d.prompt);
    return;
  }
  const vorher = await kontostand();
  zeigeStand(vorher, 'Konto vorher');
  if (vorher && vorher.grenze - vorher.verbraucht < summe) console.log('ACHTUNG: Das reicht vermutlich nicht für alle Aufträge.');
  if (!schalter.ja) {
    const a = await frage('\nStarten? (j/n) ');
    if (a !== 'j' && a !== 'ja') { console.log('Abgebrochen.'); return; }
  }
  let fehler = 0;
  for (const d of auftraege) {
    if (schalter.neu) legeAlteBeiseite(d.name);
    fehler += await erzeugeKandidaten(d);
  }
  schreibeKandidatenJs();
  const nachher = await kontostand();
  zeigeStand(nachher, '\nKonto nachher');
  if (vorher && nachher) console.log('Verbraucht bei diesem Lauf: ' + (nachher.verbraucht - vorher.verbraucht) + ' Credits.');
  console.log('\nFertig' + (fehler ? ' (' + fehler + ' Fehler)' : '') + '. Anhören und auswählen mit: node tools/sounds.js auswahl');
}

main().catch(e => { console.error('Fehler: ' + e.message); process.exit(1); });
