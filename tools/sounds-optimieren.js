#!/usr/bin/env node
/*
 * Haus Grest – Sounds fürs Netz verkleinern (Hilfswerkzeug, gehört nicht zum Spiel).
 *
 *   node tools/sounds-optimieren.js              alle Sounds (neue und geänderte)
 *   node tools/sounds-optimieren.js effekt-uhr   nur diesen einen (Name ohne Endung)
 *   node tools/sounds-optimieren.js --alle       alles neu rechnen
 *
 * Ablauf:
 *   - MP3 in assets/sound/ wandern als Original nach assets/original/sound/ (in .gitignore, nicht veröffentlicht).
 *   - Kurze Effekte: Mono, 96 kbit/s. Schleifen (art: 'schleife' in js/content/klang.js): Stereo, 128 kbit/s –
 *     liegt das Original schon so vor, wird es unverändert kopiert (neu kodieren würde die nahtlose Schleife
 *     an der Nahtstelle hörbar machen).
 *   - Aktuell ist ein Sound, wenn die Spieldatei neuer ist als das Original.
 *
 * tools/sounds.js ruft das beim Übernehmen eines Kandidaten automatisch auf (optimiere(name)).
 * Braucht das npm-Paket „ffmpeg-static“ (cd tools && npm install).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync, spawnSync } = require('child_process');

const WURZEL = path.resolve(__dirname, '..');
const SOUND = path.join(WURZEL, 'assets', 'sound');
const ORIGINAL = path.join(WURZEL, 'assets', 'original', 'sound');
const KLANG_JS = path.join(WURZEL, 'js', 'content', 'klang.js');

function ffmpeg() { return require(path.join(__dirname, 'node_modules', 'ffmpeg-static')); }

function arten() {
  const liste = {};
  const ctx = { HG: { klang: (name, def) => { liste[name] = def.art; } } };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(KLANG_JS, 'utf8'), ctx, { filename: 'klang.js' });
  return liste;
}
function istSchleife(name, art) { return (art[name] || (/^ort-/.test(name) ? 'schleife' : 'effekt')) === 'schleife'; }

/** Neue MP3 aus assets/sound/ ins Original-Verzeichnis verschieben – nur, wenn es dort noch keins gibt oder die
 *  Datei neuer ist als die letzte umgewandelte Fassung (dann ist sie ein frisch übernommener Kandidat). */
function einsammeln() {
  fs.mkdirSync(ORIGINAL, { recursive: true });
  for (const f of fs.readdirSync(SOUND)) {
    const p = path.join(SOUND, f);
    if (!/\.mp3$/.test(f) || fs.statSync(p).isDirectory()) continue;
    const o = path.join(ORIGINAL, f);
    const markiert = fs.existsSync(o + '.fertig') && Math.abs(fs.statSync(o + '.fertig').mtimeMs - fs.statSync(p).mtimeMs) < 2000;
    if (markiert) continue;                         // ist schon die verkleinerte Fassung
    fs.copyFileSync(p, o);
  }
}

function info(datei) {
  const r = spawnSync(ffmpeg(), ['-hide_banner', '-i', datei], { encoding: 'utf8' });
  const t = r.stderr || '';
  const kbit = +((t.match(/bitrate: (\d+) kb\/s/) || [])[1] || 0);
  const kanaele = /mono/.test(t) ? 1 : 2;
  return { kbit, kanaele };
}

/** Einen Sound umwandeln. Liefert { name, vorher, nachher } oder null (schon aktuell). */
function optimiere(name, erzwingen, art) {
  art = art || arten();
  einsammeln();
  const quelle = path.join(ORIGINAL, name + '.mp3'), ziel = path.join(SOUND, name + '.mp3'), marke = quelle + '.fertig';
  if (!fs.existsSync(quelle)) return null;
  if (!erzwingen && fs.existsSync(marke) && fs.existsSync(ziel) && fs.statSync(marke).mtimeMs >= fs.statSync(quelle).mtimeMs) return null;
  const schleife = istSchleife(name, art), i = info(quelle);
  if (schleife && i.kbit && i.kbit <= 128 && i.kanaele === 2) {
    fs.copyFileSync(quelle, ziel);                 // schon passend – unverändert, damit die Schleife nahtlos bleibt
  } else {
    const tmp = ziel + '.tmp.mp3';
    execFileSync(ffmpeg(), ['-hide_banner', '-loglevel', 'error', '-y', '-i', quelle,
      '-ac', schleife ? '2' : '1', '-b:a', schleife ? '128k' : '96k', '-codec:a', 'libmp3lame', tmp]);
    fs.renameSync(tmp, ziel);
  }
  fs.writeFileSync(marke, '');                     // merkt sich: diese Spieldatei ist die verkleinerte Fassung
  const t = new Date(); fs.utimesSync(marke, t, t); fs.utimesSync(ziel, t, t);
  return { name, vorher: fs.statSync(quelle).size, nachher: fs.statSync(ziel).size, schleife };
}

function alle(erzwingen, nur) {
  const art = arten();
  einsammeln();
  const namen = nur && nur.length ? nur : fs.readdirSync(ORIGINAL).filter(f => /\.mp3$/.test(f)).map(f => f.replace(/\.mp3$/, ''));
  let n = 0, vorher = 0, nachher = 0;
  for (const name of namen) {
    const r = optimiere(name, erzwingen, art);
    if (!r) continue;
    n++; vorher += r.vorher; nachher += r.nachher;
    console.log('  ' + name.padEnd(42) + (r.schleife ? 'Schleife' : 'Effekt  ') + kb(r.vorher).padStart(9) + ' → ' + kb(r.nachher).padStart(8));
  }
  console.log(n ? '\n' + n + ' Sounds umgewandelt: ' + kb(vorher) + ' → ' + kb(nachher) + '.' : 'Alle Sounds sind aktuell.');
}

function kb(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB'; }

module.exports = { optimiere, ORIGINAL };

if (require.main === module) {
  const args = process.argv.slice(2);
  try { alle(args.includes('--alle'), args.filter(a => !a.startsWith('--'))); } catch (e) { console.error('Fehler: ' + e.message); process.exit(1); }
}
