#!/usr/bin/env node
/*
 * Haus Grest – Grundrisse als SVG und PNG ausgeben (Vorlagen für die Bildbearbeitung).
 *
 * Aufruf (im Projektordner):
 *   node tools/grundriss.js            alle Stockwerke aller Baupläne
 *
 * Liest die Plandaten aus js/content/grundriss.js und zeichnet sie mit js/engine/plan.js –
 * genau so, wie das Spiel sie als Karte zeigt. Ergebnis:
 *   assets/bilder/_vorlagen/<ding>-<stockwerk>.svg  und  .png (1600 × 1200)
 * Die PNGs sind die Eingabe für "node tools/bilder.js" (Medienliste, Tabelle 2b).
 * Für das PNG wird Chrome bzw. Edge im Hintergrund benutzt (kein npm-Paket nötig).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');

const WURZEL = path.resolve(__dirname, '..');
const ZIEL = path.join(WURZEL, 'assets', 'bilder', '_vorlagen');

// Engine-Grundlagen, Plan-Zeichner und Plandaten in einer kleinen Sandbox laden
const ctx = { console, Math, JSON };
ctx.window = ctx;
vm.createContext(ctx);
for (const f of ['js/engine/grundlagen.js', 'js/engine/plan.js', 'js/content/grundriss.js']) {
  vm.runInContext(fs.readFileSync(path.join(WURZEL, f), 'utf8'), ctx, { filename: f });
}
const HG = ctx.HG;

function findeBrowser() {
  const kandidaten = [
    process.env.CHROME,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium'
  ].filter(Boolean);
  return kandidaten.find(p => fs.existsSync(p)) || null;
}

fs.mkdirSync(ZIEL, { recursive: true });
const browser = findeBrowser();
if (!browser) console.log('Hinweis: Kein Chrome/Edge gefunden – es entstehen nur SVG-Dateien (Pfad per CHROME=… angeben).');
const G = HG.plan.G;

for (const plan of Object.values(HG.daten.plaene)) {
  for (const st of plan.stockwerke) {
    const name = (plan.ding || plan.id) + '-' + st.id;
    const svgDatei = path.join(ZIEL, name + '.svg');
    fs.writeFileSync(svgDatei, HG.plan.svg(plan, st.id, { groesse: true }), 'utf8');
    let info = path.relative(WURZEL, svgDatei);
    if (browser) {
      const pngDatei = path.join(ZIEL, name + '.png');
      const profil = path.join(ZIEL, '.chrome-profil');
      execFileSync(browser, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
        '--user-data-dir=' + profil, '--window-size=' + G.W + ',' + G.H, '--screenshot=' + pngDatei,
        'file:///' + svgDatei.replace(/\\/g, '/')], { stdio: 'ignore', timeout: 60000 });
      info += ' + .png';
    }
    console.log('  ' + info);
  }
}
console.log('Fertig.');
