// Haus Grest – Engine: Uhrzeit, Datum, Tageszeit, Öffnungszeiten
//
// Die Spielzeit läuft in Minuten (z.zeit = { tag, minute }). Daraus ergeben sich
//   - die Uhrzeit ("09:40") und das Datum (ab HG.daten.spiel.startDatum),
//   - die Tageszeit: Morgen 6–11, Mittag 11–17, Abend 17–19, Nacht 19–6 Uhr.
// Jede Handlung kostet ein paar Minuten (Tabelle DAUER unten; Inhalte können pro Ding
// "dauer: { lesen: 20 }" angeben). Fahrten kosten die Fahrzeit des Ziels.
//
// Inhalte nutzen die Tageszeit so:
//   - Texte als Tageszeit-Objekt: { tag: '…', abend: '…', nacht: '…', sonst: '…' }
//   - in Funktionen: api.tageszeit() === 'nacht', api.istNacht(), api.uhrzeit()
//   - Öffnungszeiten: { von: '08:00', bis: '16:00', tage: 'werktags' }  (tage: 'werktags' | 'taeglich' | [1,2,3,4,5])
//   - Raum-Haken beiTageszeit(api, phase), Spiel-Haken HG.spielDaten({ beiTageszeit })
(function (HG) {
  'use strict';

  var W = HG.welt;
  var PHASEN = ['morgen', 'mittag', 'abend', 'nacht'];
  var NAMEN = { morgen: 'Morgen', mittag: 'Mittag', abend: 'Abend', nacht: 'Nacht' };
  var BEGINN = { morgen: 6 * 60, mittag: 11 * 60, abend: 17 * 60, nacht: 19 * 60 };   // Nacht ab 19 Uhr (David, 24.11.2026)
  // "warte bis morgen" usw. springt zu dieser Uhrzeit
  var ZIELZEIT = { morgen: 7 * 60, mittag: 12 * 60, abend: 18 * 60, nacht: 19 * 60 };
  var WOERTER = {
    morgen: 'morgen', morgens: 'morgen', frueh: 'morgen', vormittag: 'morgen', tagesanbruch: 'morgen', sonnenaufgang: 'morgen', hell: 'morgen', tag: 'morgen',
    mittag: 'mittag', mittags: 'mittag', nachmittag: 'mittag', nachmittags: 'mittag',
    abend: 'abend', abends: 'abend', daemmerung: 'abend', sonnenuntergang: 'abend',
    nacht: 'nacht', nachts: 'nacht', mitternacht: 'nacht', dunkel: 'nacht', dunkelheit: 'nacht'
  };
  var WOCHENTAG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var MONAT = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  /** Minuten, die eine Handlung kostet (Standard: 1). */
  var DAUER = {
    gehen: 2, schauen: 1, untersuchen: 1, durchsuchen: 10, hineinschauen: 1, unterschauen: 2, hinterschauen: 2,
    lesen: 3, nehmen: 1, ablegen: 1, legen: 1, oeffnen: 1, schliessen: 1, aufschliessen: 1, abschliessen: 1,
    anzuenden: 1, loeschen: 1, warten: 10, sprechen: 5, fragen: 3, sagen: 1, anrufen: 4, rangehen: 2,
    fotografieren: 1, schreiben: 3, kombinieren: 2, klettern: 2, verstecken: 2, anheben: 2, schieben: 2,
    fahren: 0, schlafen: 0, buchseite: 2, einstellen: 1, knacken: 15, ersteHilfe: 10, zerbrechen: 5, entziffern: 20, oelen: 2, spielen: 2,
    messen: 5, entfernen: 2, streuen: 2
  };

  function Z() { return HG.zustand.z; }
  function zwei(n) { return (n < 10 ? '0' : '') + n; }

  var ZT = HG.zeit = {
    PHASEN: PHASEN,
    NAMEN: NAMEN,
    DAUER: DAUER,

    minutenAus: function (hhmm) {
      var m = /^(\d{1,2})(?::(\d{2}))?$/.exec(String(hhmm).trim());
      return m ? parseInt(m[1], 10) * 60 + parseInt(m[2] || '0', 10) : 0;
    },
    uhr: function (min) {
      if (min === undefined) min = Z().zeit.minute;
      min = ((min % 1440) + 1440) % 1440;
      return zwei(Math.floor(min / 60)) + ':' + zwei(min % 60);
    },
    /** Absolute Minuten seit Spielbeginn (Tag 1, 0:00). */
    jetzt: function () { var z = Z(); return (z.zeit.tag - 1) * 1440 + z.zeit.minute; },

    phaseVon: function (min) {
      min = ((min % 1440) + 1440) % 1440;
      if (min >= BEGINN.nacht || min < BEGINN.morgen) return 'nacht';
      if (min >= BEGINN.abend) return 'abend';
      if (min >= BEGINN.mittag) return 'mittag';
      return 'morgen';
    },
    phase: function () { return ZT.phaseVon(Z().zeit.minute); },
    /** Beginn einer Tageszeit in Minuten des Tages ('morgen', 'mittag', 'abend', 'nacht'). */
    beginn: function (p) { return BEGINN[p]; },
    name: function (p) { return NAMEN[p || ZT.phase()]; },
    istNacht: function () { return ZT.phase() === 'nacht'; },

    // --- Datum --------------------------------------------------------
    datum: function (tag) {
      var start = HG.daten.spiel.startDatum || '2026-11-16';
      var t = start.split('-').map(Number);
      return new Date(Date.UTC(t[0], t[1] - 1, t[2] + ((tag || Z().zeit.tag) - 1)));
    },
    /** 0 = Sonntag … 6 = Samstag */
    wochentag: function () { return ZT.datum().getUTCDay(); },
    istWerktag: function () { var w = ZT.wochentag(); return w >= 1 && w <= 5; },
    /** "Montag, 16. November 2026, 08:10 Uhr" */
    langText: function () {
      var d = ZT.datum();
      return WOCHENTAG[d.getUTCDay()] + ', ' + d.getUTCDate() + '. ' + MONAT[d.getUTCMonth()] + ' ' + d.getUTCFullYear() + ', ' + ZT.uhr() + ' Uhr';
    },
    /** "Mo 16.11., 08:10" – kurz, z. B. für Handy-Zeitstempel */
    text: function () {
      var d = ZT.datum();
      return WOCHENTAG[d.getUTCDay()].slice(0, 2) + ' ' + d.getUTCDate() + '.' + (d.getUTCMonth() + 1) + '., ' + ZT.uhr();
    },
    datumText: function () {
      var d = ZT.datum();
      return WOCHENTAG[d.getUTCDay()] + ', ' + d.getUTCDate() + '. ' + MONAT[d.getUTCMonth()];
    },

    // --- Zeit vergeht ---------------------------------------------------
    /** Zeit um min Minuten vorstellen. opt.still = ohne Meldung zum Tageszeitwechsel. */
    vergeht: function (min, opt) {
      opt = opt || {};
      if (!min || min < 0) return;
      var z = Z(), r = W.raum();
      var altPhase = ZT.phase(), altTag = z.zeit.tag, warHell = r ? W.hell() : true, vorherAbs = ZT.jetzt();
      var m = z.zeit.minute + Math.round(min);
      z.zeit.tag += Math.floor(m / 1440);
      z.zeit.minute = m % 1440;
      // Lichtvorrat (Akku, Kerzen) und der 3-Uhr-Höhepunkt (js/engine/gefahr.js)
      if (HG.licht) HG.licht.vergeht(Math.round(min));
      if (HG.gefahren) HG.gefahren.vergeht(Math.round(min), vorherAbs);
      var p = ZT.phase();
      if (p === altPhase && z.zeit.tag === altTag) return;
      if (p === altPhase) return; // ganzer Tag vergangen, gleiche Tageszeit
      if (!opt.still) {
        var t = HG.daten.spiel.tageszeitTexte && HG.wert(HG.daten.spiel.tageszeitTexte[p], HG.api);
        HG.ausgabe.schreibe('zeit', (p === 'morgen' || z.zeit.tag !== altTag ? ZT.datumText() + ', ' : '') + ZT.uhr() + ' Uhr' + (t ? ' – ' + t : ''));
      }
      if (r && r.beiTageszeit) r.beiTageszeit(HG.api, p);
      if (HG.daten.spiel.beiTageszeit) HG.daten.spiel.beiTageszeit(HG.api, p);
      if (!opt.still && r) {
        var jetztHell = W.hell();
        if (warHell && !jetztHell) HG.ausgabe.text(HG.wert(r.dunkelText, HG.api) || HG.daten.spiel.wirdDunkelText || 'Es ist dunkel geworden.');
        else if (!warHell && jetztHell) HG.ausgabe.text('Es wird hell genug, um zu sehen.');
      }
    },

    /** Minuten bis zur nächsten Uhrzeit (in Minuten des Tages), mindestens 1. */
    minutenBis: function (zielMin) {
      var d = zielMin - Z().zeit.minute;
      while (d <= 0) d += 1440;
      return d;
    },
    /** Bis zur nächsten Tageszeit vorstellen ("warte bis zum Abend"). */
    bis: function (phase, opt) {
      if (ZIELZEIT[phase] === undefined) return 0;
      var d = ZT.minutenBis(ZIELZEIT[phase]);
      ZT.vergeht(d, opt);
      return d;
    },

    phaseAusWoertern: function (tokens) {
      for (var i = 0; i < (tokens || []).length; i++) if (WOERTER[tokens[i]]) return WOERTER[tokens[i]];
      return null;
    },

    /**
     * "warte 20 minuten", "warte eine stunde", "warte bis 14 uhr", "warte bis 14 30", "warte bis abend"
     * Liefert Minuten oder null.
     */
    dauerAusWoertern: function (tokens) {
      tokens = tokens || [];
      var ZAHL = { eine: 1, einen: 1, ein: 1, zwei: 2, drei: 3, vier: 4, fuenf: 5, zehn: 10, zwanzig: 20, dreissig: 30, halbe: 0.5 };
      var zahl = function (t) { return /^\d+$/.test(t) ? parseInt(t, 10) : ZAHL[t]; };
      var bisI = tokens.indexOf('bis');
      if (bisI >= 0) {
        var h = zahl(tokens[bisI + 1]);
        if (h !== undefined && h <= 24) {
          var mm = zahl(tokens[bisI + 2]);
          var ziel = h * 60 + (mm !== undefined && mm < 60 ? mm : 0);
          return ZT.minutenBis(ziel % 1440);
        }
        var p = ZT.phaseAusWoertern(tokens.slice(bisI + 1));
        return p ? ZT.minutenBis(ZIELZEIT[p]) : null;
      }
      for (var i = 0; i < tokens.length; i++) {
        var n = zahl(tokens[i]);
        var einheit = tokens[i + 1] || '';
        if (n !== undefined && /^minute/.test(einheit)) return Math.round(n);
        if (n !== undefined && /^stunde/.test(einheit)) return Math.round(n * 60);
        if (/^stunde/.test(tokens[i]) && (i === 0 || zahl(tokens[i - 1]) === undefined)) return 60;
      }
      var ph = ZT.phaseAusWoertern(tokens);
      return ph ? ZT.minutenBis(ZIELZEIT[ph]) : null;
    },

    // --- Öffnungszeiten -------------------------------------------------
    /** spec: null/true = immer; { von, bis, tage } oder Liste solcher Angaben; Funktion(api). */
    istOffen: function (spec) {
      spec = HG.wert(spec, HG.api);
      if (!spec || spec === true) return true;
      if (Array.isArray(spec)) {
        if (typeof spec[0] === 'string' && NAMEN[spec[0]]) return spec.indexOf(ZT.phase()) >= 0; // alte Form: Tageszeiten
        return spec.some(ZT.istOffen);
      }
      var tage = spec.tage || 'taeglich';
      var w = ZT.wochentag();
      if (tage === 'werktags' && !(w >= 1 && w <= 5)) return false;
      if (Array.isArray(tage) && tage.indexOf(w) < 0) return false;
      var von = ZT.minutenAus(spec.von || '0:00'), bis = ZT.minutenAus(spec.bis || '24:00'), m = Z().zeit.minute;
      return von <= bis ? (m >= von && m < bis) : (m >= von || m < bis);
    },
    oeffnungsText: function (spec) {
      spec = HG.wert(spec, HG.api);
      if (!spec || spec === true) return 'rund um die Uhr';
      if (Array.isArray(spec)) {
        if (typeof spec[0] === 'string') return 'geöffnet ' + HG.text.liste(spec.map(function (p) { return { morgen: 'morgens', mittag: 'mittags', abend: 'abends', nacht: 'nachts' }[p]; }));
        return spec.map(ZT.oeffnungsText).join(', ');
      }
      var kurz = function (t) { return t.replace(/^0/, '').replace(/:00$/, ''); };
      var tage = spec.tage === 'werktags' ? 'werktags ' : '';
      return tage + kurz(spec.von || '0:00') + '–' + kurz(spec.bis || '24:00') + ' Uhr';
    }
  };

  // ------------------------------------------------------------------
  // Handlungen
  // ------------------------------------------------------------------
  var A = HG.aktionen;
  var altWarten = A.warten;

  A.warten = function (ctx) {
    var min = ZT.dauerAusWoertern(ctx.np1);
    if (!min) { altWarten(ctx); return; }
    var r = W.raum();
    ctx.dauer = 0;
    HG.ausgabe.text(HG.wert(r.wartenLange, HG.api, ctx) || HG.daten.spiel.wartenLangeText || 'Du wartest.');
    ZT.vergeht(min);
    HG.ausgabe.text('<span class="nebenbei">Es ist jetzt ' + ZT.uhr() + ' Uhr.</span>');
  };

  A.schlafen = function (ctx) {
    var r = W.raum();
    ctx.dauer = 0;
    var platz = HG.wert(r.schlafplatz, HG.api, ctx);
    if (!platz) { HG.ausgabe.text(HG.wert(r.keinSchlaf, HG.api, ctx) || HG.daten.spiel.keinSchlafText || 'Hier kannst du nicht schlafen.'); return; }
    var nacht = ZT.istNacht() || ZT.phase() === 'abend';
    HG.ausgabe.text(typeof platz === 'string' ? platz : 'Du legst dich hin und schläfst ein.');
    ZT.vergeht(ZT.minutenBis(ZIELZEIT.morgen));
    HG.ausgabe.text('<span class="nebenbei">Du wachst um ' + ZT.uhr() + ' Uhr auf.</span>');
    // Erholung: { lp: '1W4', nerven: '1W8', wp: 'voll' } (Zahl, Würfel oder 'voll'); Werte aus erholungNurAusserhalb nur nach einer Nacht außerhalb des Hauses
    var sp = HG.daten.spiel, er = sp.erholungBeimSchlaf || { nerven: 1 };
    var nurAussen = sp.erholungNurAusserhalb || ['nerven'];
    var z = HG.zustand.z;
    var imHaus = (sp.nachtMalusOrte || ['haus']).indexOf(r.schauplatz) >= 0;
    Object.keys(er).forEach(function (k) {
      if (!er[k] || z.werte[k] === undefined) return;
      if (nurAussen.indexOf(k) >= 0 && (imHaus || !nacht)) return;
      var grenze = k === 'nerven' ? z.start.nerven : z.max[k];         // NERVEN höchstens bis zum Startwert
      var menge = er[k] === 'voll' ? grenze - z.werte[k] : HG.wuerfel(er[k]);
      var delta = Math.max(0, Math.min(menge, grenze - z.werte[k]));
      if (delta) HG.api.aendere(k, delta, 'Schlaf');
    });
  };

  A.zeit = function () {
    HG.ausgabe.system('Es ist ' + ZT.langText() + ' (' + ZT.name() + ').');
  };
})(window.HG);
