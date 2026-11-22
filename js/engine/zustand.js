// Haus Grest – Engine: Spielzustand, Speichern/Laden, Rückgängig.
// Der Zustand ist ein reines Datenobjekt (keine Funktionen) und lässt sich
// daher mit JSON speichern. Ändert sich sein Aufbau: VERSION hochzählen!
(function (HG) {
  'use strict';

  var VERSION = 5; // 2: Tageszeit, Reiseziele, Handy, Spuk · 3: Spielfigur, Uhrzeit, NERVEN in Prozent, Bücher · 4: MACHT des Hauses
                   // 5: angesehene Hinweise (gesehen), erledigte Handlungen an Dingen (getan)

  // Ältere Spielstände an das aktuelle Format anpassen: MIGRATION[v] macht aus Version v die Version v+1.
  var MIGRATION = {
    3: function (z) { z.macht = HG.macht ? HG.macht.start() : 100; },
    4: function (z) {
      z.gesehen = {}; z.getan = {};
      (z.hinweise || []).forEach(function (id) { z.gesehen[id] = true; }); // alte Hinweise gelten als angesehen
    }
  };
  // Inhalte können eigene Schritte anhängen, z. B. wenn sich Buchseiten verschoben haben:
  // HG.zustand.migration(4, function (z) { ... })  läuft beim Laden nach MIGRATION[4].
  var MIGRATION_INHALT = {};
  var SPEICHER_PREFIX = 'hausgrest:';
  var MAX_RUECKGAENGIG = 50;

  HG.zustand = {
    VERSION: VERSION,
    z: null,          // aktueller Zustand
    verlauf: [],      // Schnappschüsse für "rückgängig"

    /** Neues Spiel: Werte auswürfeln, Gegenstände an ihre Startorte. */
    neu: function () {
      var sp = HG.daten.spiel;
      var w = sp.werte || { geschick: '1W6+6', ausdauer: '2W6+12', nerven: 80 };
      var mx = sp.maxWerte || { nerven: 99 };
      var z = {
        version: VERSION,
        zug: 0,
        raum: sp.startRaum,
        werte: {},
        max: {},
        dinge: {},       // nur Abweichungen von der Definition, z. B. {ort:'spieler', offen:true}
        flags: {},       // freie Merker für den Inhalt
        zaehler: {},     // freie Zähler für den Inhalt
        besucht: {},     // raumId -> true
        hinweise: [],    // gefundene Hinweis-IDs (in Reihenfolge)
        schluesse: [],   // gefundene Schlussfolgerungen
        notizen: [],     // eigene Notizen des Spielers
        gesehen: {},     // Hinweis-ID -> true, sobald der Hinweis im Notizbuch aufgeklappt wurde
        getan: {},       // Ding-ID -> { lesen: true, untersuchen: true } – für "Bereits gelesen" in den Menüs
        pronomen: {},    // m/f/n/pl/letzt -> Ding-ID
        versteckt: null, // Ding, hinter dem sich der Spieler versteckt
        vorbei: false,
        spieler: null,   // { name, geschlecht: 'm' | 'w' | 'd' } – Charaktererstellung
        start: {},       // Startwerte (z. B. Obergrenze für Erholung)
        zeit: { tag: 1, minute: HG.zeit ? HG.zeit.minutenAus(sp.startUhrzeit || '08:00') : 480 },
        buecher: {},     // Ding-ID -> { seite, gelesen: [Seitennummern] }
        ziele: {},       // freigeschaltete Reiseziele: id -> true
        handy: { nachrichten: [], anrufe: [], fotos: [], klingelt: null },
        spuk: { zaehl: {}, letzter: -99 },
        macht: HG.macht ? HG.macht.start() : 100   // unsichtbare Kraftreserve des Hauses (Spielbibel 8.3)
      };
      (sp.startZiele || []).forEach(function (id) { z.ziele[id] = true; });
      ['geschick', 'ausdauer', 'nerven'].forEach(function (k) {
        z.werte[k] = HG.wuerfel(w[k]);
        z.max[k] = mx[k] || z.werte[k];
        z.start[k] = z.werte[k];
      });
      this.z = z;
      this.verlauf = [];
      return z;
    },

    // --- Eigenschaften von Dingen: Zustand überschreibt Definition ---
    eig: function (id, k) {
      var s = this.z.dinge[id];
      if (s && Object.prototype.hasOwnProperty.call(s, k)) return s[k];
      var d = HG.daten.dinge[id];
      return d ? d[k] : undefined;
    },
    setze: function (id, k, v) {
      if (!this.z.dinge[id]) this.z.dinge[id] = {};
      this.z.dinge[id][k] = v;
    },

    // --- Rückgängig ---
    merke: function () {
      this.verlauf.push(JSON.stringify(this.z));
      if (this.verlauf.length > MAX_RUECKGAENGIG) this.verlauf.shift();
    },
    vergiss: function () { this.verlauf.pop(); },
    rueckgaengig: function () {
      if (!this.verlauf.length) return false;
      this.z = JSON.parse(this.verlauf.pop());
      return true;
    },

    /** Inhalts-Schritt für die Migration anmelden (siehe MIGRATION_INHALT). */
    migration: function (v, fn) { (MIGRATION_INHALT[v] = MIGRATION_INHALT[v] || []).push(fn); },

    /** Hinweise und Schlussfolgerungen entfernen, die es im Inhalt nicht mehr gibt (z. B. gestrichene). */
    aufraeumen: function (z) {
      z.hinweise = (z.hinweise || []).filter(function (id) { return !!HG.daten.hinweise[id]; });
      z.schluesse = (z.schluesse || []).filter(function (id) { return !!HG.daten.schluesse[id]; });
      if (!z.gesehen) z.gesehen = {};
      if (!z.getan) z.getan = {};
    },

    // --- Speichern / Laden (localStorage, immer in try/catch) ---
    speichern: function (platz) {
      try {
        var paket = { version: VERSION, zeit: new Date().toISOString(), zustand: this.z };
        window.localStorage.setItem(SPEICHER_PREFIX + (platz || '1'), JSON.stringify(paket));
        return { ok: true };
      } catch (e) {
        return { ok: false, fehler: String(e && e.message || e) };
      }
    },
    laden: function (platz) {
      try {
        var roh = window.localStorage.getItem(SPEICHER_PREFIX + (platz || '1'));
        if (!roh) return { ok: false, fehler: 'leer' };
        var paket = JSON.parse(roh);
        if (!paket || !paket.zustand) return { ok: false, fehler: 'leer' };
        var v = paket.version;
        while (v < VERSION && MIGRATION[v]) {
          MIGRATION[v](paket.zustand);
          (MIGRATION_INHALT[v] || []).forEach(function (fn) { fn(paket.zustand); });
          v++;
        }
        if (v !== VERSION) return { ok: false, fehler: 'version' };
        paket.zustand.version = VERSION;
        this.aufraeumen(paket.zustand);
        this.z = paket.zustand;
        this.verlauf = [];
        return { ok: true, zeit: paket.zeit };
      } catch (e) {
        return { ok: false, fehler: String(e && e.message || e) };
      }
    },
    /** Liste der belegten Speicherplätze: [{platz, zeit}] */
    plaetze: function () {
      var liste = [];
      try {
        for (var i = 0; i < window.localStorage.length; i++) {
          var k = window.localStorage.key(i);
          if (k && k.indexOf(SPEICHER_PREFIX) === 0) {
            var p = JSON.parse(window.localStorage.getItem(k));
            liste.push({ platz: k.slice(SPEICHER_PREFIX.length), zeit: p && p.zeit, version: p && p.version });
          }
        }
      } catch (e) { /* Speicher nicht verfügbar */ }
      return liste.sort(function (a, b) { return a.platz < b.platz ? -1 : 1; });
    }
  };
})(window.HG);
