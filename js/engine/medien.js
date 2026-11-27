// Haus Grest – Engine: Bilder und Sound aus Dateien
//
// Weil das Spiel per Doppelklick (file://) läuft, kann es keine Ordner durchsuchen.
// Stattdessen probiert es feste Dateinamen der Reihe nach aus; fehlt eine Datei,
// wird sie still übersprungen. Endungen: Bilder .webp, .jpg, .png – Sound .ogg, .mp3.
//
// BILDER (assets/bilder/)
//   Raum:        raum-<raumId>.webp        z. B. raum-halle.webp
//   Variante:    raum-<raumId>-<variante>  z. B. raum-halle-spuk.webp (kurz nach einem Spuk-Ereignis)
//   Abend/Nacht: raum-<raumId>-abend, raum-<raumId>-nacht – eigene Bilder (sonst wird das Tagbild per CSS getönt)
//   Schauplatz:  ort-<schauplatz>          Ersatz für alle Räume des Schauplatzes ohne eigenes Bild
//   Fundstück:   ding-<dingId>             wird beim Untersuchen/Lesen groß angezeigt (Ding mit fundstueck: true)
//   Buchpapier:  ding-<dingId>-seite[-<papier>]  z. B. ding-tagebuch-seite-spaet.webp (Hintergrund der Lese-Ansicht)
//   Inhalte können abweichende Namen setzen: Raum/Ding "bildDatei: 'name'", Raum "bildVariante: fn(api)".
//   Ohne Bilddatei zeigt das Spiel die gezeichnete SVG-Szene.
//
// SOUND (assets/sound/)
//   Hintergrund: ort-<schauplatz>[-nacht]  oder Raum "sound: 'name'"  – Endlosschleife, weich überblendet
//   Effekte:     effekt-<name>             api.sound('name'); Spuk-Ereignisse spielen effekt-spuk-<id>
//                (oder "sound: 'name'" am Ereignis); Dinge: "geraeusch: { oeffnen: 'tuer-knarren' }"
//   Engine-Effekte: effekt-wuerfel, effekt-schock, effekt-handy-vibriert, effekt-handy-klingelt, effekt-seite
// Lautstärke (getrennt: Hintergrund / Effekte), Stummschaltung und Untertitel merkt sich der Browser
// (localStorage, nicht im Spielstand).
//
// SOUND-VERZEICHNIS (js/content/klang.js): HG.klang('effekt-name', { art, sek, untertitel, laut, prompt })
//   untertitel – erscheint bei jedem Abspielen als [Untertitel] im Text, auch ohne Ton (barrierearm, Handy stumm)
//   laut       – lauter Schreck: höchstens einer pro Nacht, danach nur noch der Untertitel
//   wiederholen – { mal: 3, abstand: 2.5 }: die Datei mehrmals abspielen, jeder Einsatz abstand Sekunden nach dem
//                 vorigen (überlappt den Nachhall – z. B. eine Uhr, die dreimal schlägt, aus einem einzelnen Gong)
//   Herzschlag: effekt-herzschlag läuft als Schleife, sobald die NERVEN unter HERZ.ab fallen – je tiefer, desto
//   lauter und schneller (M.herz(), nach jedem Zug).
(function (HG) {
  'use strict';

  var BILD = ['webp', 'jpg', 'png'], TON = ['ogg', 'mp3'];
  var hatBrowser = typeof window.Image !== 'undefined' && typeof window.document !== 'undefined';
  var hatAudio = typeof window.Audio !== 'undefined';
  var cache = {};          // URL -> true (vorhanden) / false (fehlt)
  var EINST_KEY = 'hausgrest:einstellungen';
  var HERZ = { ab: 30, schnell: 10 };   // NERVEN: darunter Herzschlag; unter 'schnell' deutlich schneller

  HG.daten.klaenge = HG.daten.klaenge || {};
  /** Sound-Verzeichnis (js/content/klang.js). */
  HG.klang = function (name, def) { def.name = name; HG.daten.klaenge[name] = def; return def; };

  function Z() { return HG.zustand.z; }
  function ruhig() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /** Erste vorhandene Bilddatei aus einer Liste von Namen finden. cb(url, index) bzw. cb(null). */
  function erstesBild(namen, cb) {
    if (!hatBrowser || !namen.length) { cb(null); return; }
    var liste = [];
    namen.forEach(function (n, i) { BILD.forEach(function (e) { liste.push({ url: M.ordnerBilder + n + '.' + e, i: i }); }); });
    (function weiter(k) {
      if (k >= liste.length) { cb(null); return; }
      var url = liste[k].url;
      if (cache[url] === true) { cb(url, liste[k].i); return; }
      if (cache[url] === false) { weiter(k + 1); return; }
      var img = new window.Image();
      img.onload = function () { cache[url] = true; cb(url, liste[k].i); };
      img.onerror = function () { cache[url] = false; weiter(k + 1); };
      img.src = url;
    })(0);
  }

  /** Erste vorhandene Tondatei laden. cb(audioElement) bzw. cb(null). */
  function ersterTon(namen, cb) {
    if (!hatAudio || !namen.length) { cb(null); return; }
    var liste = [];
    namen.forEach(function (n) { TON.forEach(function (e) { liste.push(M.ordnerTon + n + '.' + e); }); });
    (function weiter(k) {
      if (k >= liste.length) { cb(null); return; }
      var url = liste[k];
      if (cache[url] === false) { weiter(k + 1); return; }
      var a = new window.Audio();
      var fertig = false;
      a.preload = 'auto';
      a.addEventListener('canplaythrough', function () { if (fertig) return; fertig = true; cache[url] = true; cb(a); }, { once: true });
      a.addEventListener('error', function () { if (fertig) return; fertig = true; cache[url] = false; weiter(k + 1); }, { once: true });
      a.src = url;
      try { a.load(); } catch (e) { /* ignorieren */ }
    })(0);
  }

  var M = HG.medien = {
    ordnerBilder: 'assets/bilder/',
    ordnerTon: 'assets/sound/',
    spukVariante: null,      // { raum, bisZug, variante } – kurz nach einem Spuk (bild: true) oder api.zeigeBild zeigt der Raum diese Variante
    einst: { hintergrund: 0.6, effekte: 0.8, stumm: false, untertitel: true },
    entsperrt: false,        // Browser erlauben Ton erst nach der ersten Eingabe

    erstesBild: erstesBild,

    // ---------------- Bilder ----------------
    /** Namen für das Raumbild in Reihenfolge der Priorität: [{ name, nacht }] */
    raumKandidaten: function () {
      var r = HG.welt.raum(), z = Z(), phase = HG.zeit.phase();
      var eigeneZeit = (phase === 'abend' || phase === 'nacht') ? phase : null; // eigenes Abend-/Nachtbild
      var varianten = [];
      var v = HG.wert(r.bildVariante, HG.api);
      if (M.spukVariante && M.spukVariante.raum === r.id && z.zug <= M.spukVariante.bisZug) varianten.push(M.spukVariante.variante || 'spuk');
      if (v) varianten.push(v);
      varianten.push('');
      var basen = [r.bildDatei || 'raum-' + r.id];
      if (r.schauplatz) basen.push('ort-' + r.schauplatz);
      var liste = [];
      basen.forEach(function (b) {
        varianten.forEach(function (va) {
          var n = b + (va ? '-' + va : '');
          if (eigeneZeit) liste.push({ name: n + '-' + eigeneZeit, nacht: true });
          liste.push({ name: n, nacht: false });
        });
      });
      return liste;
    },
    dingName: function (id) { var d = HG.daten.dinge[id]; return d.bildDatei || 'ding-' + id; },
    hatFundBild: function (id) { var d = HG.daten.dinge[id]; return !!(d && (d.fundstueck || d.bildDatei)); },

    // ---------------- Sound ----------------
    ladeEinstellungen: function () {
      try {
        var s = JSON.parse(window.localStorage.getItem(EINST_KEY) || 'null');
        if (s) {
          if (typeof s.lautstaerke === 'number') { M.einst.hintergrund = s.lautstaerke; M.einst.effekte = s.lautstaerke; }   // alte Einstellung
          if (typeof s.hintergrund === 'number') M.einst.hintergrund = s.hintergrund;
          if (typeof s.effekte === 'number') M.einst.effekte = s.effekte;
          if (typeof s.untertitel === 'boolean') M.einst.untertitel = s.untertitel;
          M.einst.stumm = !!s.stumm;
        }
      } catch (e) { /* kein Speicher */ }
    },
    speichereEinstellungen: function () {
      try { window.localStorage.setItem(EINST_KEY, JSON.stringify(M.einst)); } catch (e) { /* kein Speicher */ }
    },
    /** Lautstärke für 'hintergrund' oder 'effekte' (Standard), mal Anteil. */
    pegel: function (anteil, art) {
      if (M.einst.stumm) return 0;
      var basis = art === 'hintergrund' ? M.einst.hintergrund : M.einst.effekte;
      return Math.max(0, Math.min(1, basis * (anteil === undefined ? 1 : anteil)));
    },
    setzeLautstaerke: function (wert, art) {
      if (art === 'hintergrund') M.einst.hintergrund = wert; else M.einst.effekte = wert;
      M.speichereEinstellungen(); M.atmoPegel(); M.herz();
    },
    setzeUntertitel: function (an) { M.einst.untertitel = !!an; M.speichereEinstellungen(); },
    setzeStumm: function (stumm) { M.einst.stumm = stumm; M.speichereEinstellungen(); M.atmoPegel(); M.herz(); if (!stumm) M.atmo(); },

    /** Kurzer Effekt: assets/sound/effekt-<name>.ogg|mp3 – mit Untertitel (klang.js), laute nur einmal pro Nacht.
     *  opt: { mal: 7 (so oft abspielen), untertitel: '…' (statt des Eintrags), laut: true|false } */
    effekt: function (name, opt) {
      if (!name) return;
      opt = opt || {};
      var def = Object.assign({}, HG.daten.klaenge['effekt-' + name] || {}, opt.untertitel !== undefined ? { untertitel: opt.untertitel } : {},
        opt.laut !== undefined ? { laut: opt.laut } : {});
      if (opt.mal) def.wiederholen = Object.assign({}, def.wiederholen || {}, { mal: opt.mal });
      var z = Z();
      var stumm = false;
      if (def && def.laut && z && HG.nacht) {
        var nacht = HG.nacht.nummer();
        if (z.flags._lauterSchreck === nacht) stumm = true;      // heute Nacht schon einen lauten Schreck gehabt
        else z.flags._lauterSchreck = nacht;
      }
      if (def && def.untertitel && M.einst.untertitel !== false) HG.ausgabe.schreibe('ton', '[' + def.untertitel + ']');
      if (stumm || !hatAudio || !M.entsperrt || M.einst.stumm) return;
      ersterTon(['effekt-' + name], function (a) {
        if (!a) return;
        a.volume = M.pegel(1);
        var p = a.play(); if (p && p.catch) p.catch(function () { /* blockiert */ });
        var w = def && def.wiederholen;
        if (w && w.mal > 1) {
          for (var i = 1; i < w.mal; i++) {
            setTimeout(function () {
              if (M.einst.stumm) return;
              var b = a.cloneNode(); b.volume = M.pegel(1);
              var q = b.play(); if (q && q.catch) q.catch(function () { /* blockiert */ });
            }, i * (w.abstand || 2) * 1000);
          }
        }
      });
    },

    // Hintergrundschleife mit Überblendung
    _atmo: null, _atmoName: null, _atmoAnteil: 0.45,
    atmoKandidaten: function () {
      var r = HG.welt.raum(), nacht = HG.zeit.istNacht(), basen = [];
      if (r.sound) basen.push(r.sound);
      if (r.schauplatz) basen.push('ort-' + r.schauplatz);
      var liste = [];
      basen.forEach(function (b) { if (nacht) liste.push(b + '-nacht'); liste.push(b); });
      return liste;
    },
    atmo: function () {
      if (!hatAudio || !M.entsperrt || !Z() || !HG.welt.raum()) return;
      var kand = M.atmoKandidaten(), schluessel = kand.join('|');
      if (schluessel === M._atmoSchluessel) return;
      M._atmoSchluessel = schluessel;
      ersterTon(kand, function (a) {
        if (schluessel !== M._atmoSchluessel) return;          // inzwischen woanders
        var neuName = a ? a.src : null;
        if (neuName && neuName === M._atmoName) return;          // gleiche Schleife läuft schon
        var alt = M._atmo;
        M._atmo = a; M._atmoName = neuName;
        if (alt) M.blende(alt, alt.volume, 0, function () { alt.pause(); });
        if (a) {
          a.loop = true; a.volume = 0;
          var p = a.play(); if (p && p.catch) p.catch(function () { /* blockiert */ });
          M.blende(a, 0, M.pegel(M._atmoAnteil, 'hintergrund'));
        }
      });
    },
    atmoPegel: function () { if (M._atmo) M._atmo.volume = M.pegel(M._atmoAnteil, 'hintergrund'); },

    /** Herzschlag bei niedrigen NERVEN (nach jedem Zug aufrufen). */
    _herz: null, _herzLaedt: false,
    herz: function () {
      var z = Z();
      var n = z && z.werte ? z.werte.nerven : 100;
      var an = !!(hatAudio && M.entsperrt && !M.einst.stumm && z && !z.vorbei && n < HERZ.ab);
      if (!an) { if (M._herz) { var h = M._herz; M._herz = null; M.blende(h, h.volume, 0, function () { h.pause(); }); } return; }
      var staerke = Math.min(1, (HERZ.ab - n) / HERZ.ab + 0.3);           // je tiefer, desto lauter
      var tempo = n < HERZ.schnell ? 1.45 : 1 + (HERZ.ab - n) / HERZ.ab * 0.35;
      if (M._herz) { M._herz.volume = M.pegel(staerke); try { M._herz.playbackRate = tempo; } catch (e) { /* egal */ } return; }
      if (M._herzLaedt) return;
      M._herzLaedt = true;
      ersterTon(['effekt-herzschlag'], function (a) {
        M._herzLaedt = false;
        if (!a) return;
        M._herz = a; a.loop = true; a.volume = 0;
        try { a.playbackRate = tempo; } catch (e) { /* egal */ }
        var p = a.play(); if (p && p.catch) p.catch(function () { /* blockiert */ });
        M.blende(a, 0, M.pegel(staerke));
      });
    },
    /** Lautstärke weich ändern (2 Sekunden, ohne Animation sofort). */
    blende: function (a, von, bis, fertig) {
      if (ruhig()) { a.volume = bis; if (fertig) fertig(); return; }
      var schritte = 20, i = 0;
      var t = setInterval(function () {
        i++;
        try { a.volume = Math.max(0, Math.min(1, von + (bis - von) * i / schritte)); } catch (e) { /* ignorieren */ }
        if (i >= schritte) { clearInterval(t); if (fertig) fertig(); }
      }, 100);
    },
    /** Nach der ersten Eingabe des Spielers: Ton erlauben und Hintergrund starten. */
    entsperre: function () {
      if (M.entsperrt) return;
      M.entsperrt = true;
      M.atmo();
      M.herz();
    }
  };
  M.ladeEinstellungen();
})(window.HG);
