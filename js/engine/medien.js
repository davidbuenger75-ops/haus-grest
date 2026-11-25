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
// Lautstärke und Stummschaltung merkt sich der Browser (localStorage, nicht im Spielstand).
(function (HG) {
  'use strict';

  var BILD = ['webp', 'jpg', 'png'], TON = ['ogg', 'mp3'];
  var hatBrowser = typeof window.Image !== 'undefined' && typeof window.document !== 'undefined';
  var hatAudio = typeof window.Audio !== 'undefined';
  var cache = {};          // URL -> true (vorhanden) / false (fehlt)
  var EINST_KEY = 'hausgrest:einstellungen';

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
    einst: { lautstaerke: 0.6, stumm: false },
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
        if (s) { if (typeof s.lautstaerke === 'number') M.einst.lautstaerke = s.lautstaerke; M.einst.stumm = !!s.stumm; }
      } catch (e) { /* kein Speicher */ }
    },
    speichereEinstellungen: function () {
      try { window.localStorage.setItem(EINST_KEY, JSON.stringify(M.einst)); } catch (e) { /* kein Speicher */ }
    },
    pegel: function (anteil) { return M.einst.stumm ? 0 : Math.max(0, Math.min(1, M.einst.lautstaerke * (anteil === undefined ? 1 : anteil))); },
    setzeLautstaerke: function (wert) { M.einst.lautstaerke = wert; M.speichereEinstellungen(); M.atmoPegel(); },
    setzeStumm: function (stumm) { M.einst.stumm = stumm; M.speichereEinstellungen(); M.atmoPegel(); if (!stumm) M.atmo(); },

    /** Kurzer Effekt: assets/sound/effekt-<name>.ogg|mp3 */
    effekt: function (name) {
      if (!hatAudio || !name || !M.entsperrt || M.einst.stumm) return;
      ersterTon(['effekt-' + name], function (a) {
        if (!a) return;
        a.volume = M.pegel(1);
        var p = a.play(); if (p && p.catch) p.catch(function () { /* blockiert */ });
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
          M.blende(a, 0, M.pegel(M._atmoAnteil));
        }
      });
    },
    atmoPegel: function () { if (M._atmo) M._atmo.volume = M.pegel(M._atmoAnteil); },
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
    }
  };
  M.ladeEinstellungen();
})(window.HG);
