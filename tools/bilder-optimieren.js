#!/usr/bin/env node
/*
 * Haus Grest – Spielbilder fürs Netz verkleinern (Hilfswerkzeug, gehört nicht zum Spiel).
 *
 *   node tools/bilder-optimieren.js            alle Bilder verarbeiten (neue und geänderte)
 *   node tools/bilder-optimieren.js raum-halle nur dieses eine Bild (Name ohne Endung)
 *   node tools/bilder-optimieren.js --alle     alles neu rechnen, auch wenn es aktuell ist
 *
 * Ablauf:
 *   - JPG/PNG in assets/bilder/ (ohne Ordner und Dateien mit „_“ vorn) wandern als Original nach
 *     assets/original/bilder/ (steht in .gitignore, wird nicht veröffentlicht).
 *   - Aus jedem Original entstehen in assets/bilder/:
 *       <name>.webp       höchstens 1280 px breit, Qualität 75
 *       <name>-768.webp   768 px breit, für schmale Bildschirme (Handy)
 *   - Aktuell ist ein Bild, wenn beide WebP-Dateien neuer sind als das Original.
 *
 * tools/bilder.js ruft das beim Übernehmen eines Kandidaten automatisch auf (optimiere(name)).
 * Braucht das npm-Paket „sharp“ (cd tools && npm install).
 */
'use strict';

const fs = require('fs');
const path = require('path');

const WURZEL = path.resolve(__dirname, '..');
const BILDER = path.join(WURZEL, 'assets', 'bilder');
const ORIGINAL = path.join(WURZEL, 'assets', 'original', 'bilder');
const GROSS = { breite: 1280, qualitaet: 75 };
const KLEIN = { breite: 768, qualitaet: 72, zusatz: '-768' };
const QUELLE = /\.(jpe?g|png|webp)$/i;

function sharp() { return require(path.join(__dirname, 'node_modules', 'sharp')); }

/** Original zu einem Namen (assets/original/bilder/<name>.jpg|png|webp) – oder null. */
function original(name) {
  for (const e of ['.png', '.jpg', '.jpeg', '.webp']) {
    const p = path.join(ORIGINAL, name + e);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

/** Neue Quelldateien aus assets/bilder/ ins Original-Verzeichnis verschieben. Liefert die Namen. */
function einsammeln() {
  fs.mkdirSync(ORIGINAL, { recursive: true });
  const namen = [];
  for (const f of fs.readdirSync(BILDER)) {
    const p = path.join(BILDER, f);
    if (f.startsWith('_') || fs.statSync(p).isDirectory() || !/\.(jpe?g|png)$/i.test(f)) continue;
    const name = f.replace(QUELLE, '');
    // ältere Originale gleichen Namens (andere Endung) ersetzen
    for (const e of ['.png', '.jpg', '.jpeg', '.webp']) { const alt = path.join(ORIGINAL, name + e); if (fs.existsSync(alt)) fs.unlinkSync(alt); }
    fs.renameSync(p, path.join(ORIGINAL, f));
    namen.push(name);
  }
  return namen;
}

function aktuell(name, quelle) {
  const t = fs.statSync(quelle).mtimeMs;
  return [GROSS, KLEIN].every(g => {
    const z = path.join(BILDER, name + (g.zusatz || '') + '.webp');
    return fs.existsSync(z) && fs.statSync(z).mtimeMs >= t;
  });
}

/** Ein Bild umwandeln (aus dem Original). Liefert { name, vorher, nachher } in Bytes oder null. */
async function optimiere(name, erzwingen) {
  einsammeln();
  const quelle = original(name);
  if (!quelle) return null;
  if (!erzwingen && aktuell(name, quelle)) return null;
  let nachher = 0;
  for (const g of [GROSS, KLEIN]) {
    const ziel = path.join(BILDER, name + (g.zusatz || '') + '.webp');
    await sharp()(quelle).resize({ width: g.breite, withoutEnlargement: true }).webp({ quality: g.qualitaet, effort: 5 }).toFile(ziel);
    nachher += fs.statSync(ziel).size;
  }
  return { name, vorher: fs.statSync(quelle).size, nachher };
}

async function alle(erzwingen, nur) {
  einsammeln();
  const namen = nur && nur.length ? nur : fs.readdirSync(ORIGINAL).filter(f => QUELLE.test(f) && !f.startsWith('_')).map(f => f.replace(QUELLE, ''));
  let n = 0, vorher = 0, nachher = 0;
  for (const name of namen) {
    const r = await optimiere(name, erzwingen);
    if (!r) continue;
    n++; vorher += r.vorher; nachher += r.nachher;
    console.log('  ' + name.padEnd(42) + kb(r.vorher).padStart(9) + ' → ' + kb(r.nachher).padStart(8) + ' (beide Größen)');
  }
  // Verwaiste WebP ohne Original melden (z. B. umbenannte Bilder)
  const verwaist = fs.readdirSync(BILDER).filter(f => /\.webp$/.test(f) && !original(f.replace(/(-768)?\.webp$/, '')));
  if (verwaist.length) console.log('Hinweis: WebP ohne Original: ' + verwaist.join(', '));
  console.log(n ? '\n' + n + ' Bilder umgewandelt: ' + kb(vorher) + ' → ' + kb(nachher) + '.' : 'Alle Bilder sind aktuell.');
}

function kb(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB'; }

module.exports = { optimiere, einsammeln, original, ORIGINAL };

if (require.main === module) {
  const args = process.argv.slice(2);
  alle(args.includes('--alle'), args.filter(a => !a.startsWith('--'))).catch(e => { console.error('Fehler: ' + e.message); process.exit(1); });
}
