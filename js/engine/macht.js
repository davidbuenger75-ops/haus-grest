// Haus Grest – Engine: die MACHT des Hauses und die Spiegel-Regeln (Spielbibel 8.2/8.3)
//
// MACHT: unsichtbare Kraftreserve im Spielzustand (z.macht).
//   - Start voll; jeder verlorene NERVEN-Punkt lädt sie auf.
//   - Jede Handlung des Hauses kostet: Spuk-Ereignisse, gefälschte Nachrichten/Anrufe,
//     später auch Heraustreten, Feuerwehr rufen usw. (api.hausHandelt('art')).
//   - Der Spieler sieht keine Zahl. Er merkt sie an der Häufigkeit des Spuks und an
//     schwereren NERVEN-Proben, wenn das Haus stark ist.
//
// Spiegel: Dinge (oder Räume) mit  spiegel: 'winzig' | 'klein' | 'gross' | 'spiegelzimmer'
//   (auch als Tageszeit-Objekt, z. B. Fensterscheiben nur nachts: { nacht: 'klein', sonst: null }).
//   Spuk-Ereignisse mit  spiegel: 'gross'  brauchen einen intakten Spiegel mindestens dieser Größe.
//   Zerbrochene Spiegel erneuern sich über Nacht (Uhrzeit: macht.erneuerungUm).
//
// Alle Zahlen und Texte: HG.daten.spiel.macht (Inhalt: js/content/macht.js).
(function (HG) {
  'use strict';

  var W = HG.welt;
  var GROESSEN = ['winzig', 'klein', 'gross', 'spiegelzimmer'];
  function Z() { return HG.zustand.z; }
  function C() { return HG.daten.spiel.macht || {}; }
  function eig(id, k) { return HG.zustand.eig(id, k); }
  function zahl(x, standard) { return typeof x === 'number' ? x : standard; }

  var M = HG.macht = {
    GROESSEN: GROESSEN,
    _imSpuk: false,        // während ein Spuk-Ereignis läuft (Nachrichten darin nicht doppelt bezahlen)

    // ---------------- MACHT ----------------
    max: function () { return zahl(C().max, 100); },
    start: function () { return zahl(C().start, M.max()); },
    wert: function () {
      var z = Z();
      if (typeof z.macht !== 'number') z.macht = M.start();
      return z.macht;
    },
    anteil: function () { return M.max() ? M.wert() / M.max() : 0; },
    /** 'stark' | 'mittel' | 'schwach' – für Texte, die sich nach der MACHT richten */
    stufe: function () {
      var a = M.anteil(), s = C().stufen || {};
      return a >= zahl(s.stark, 0.66) ? 'stark' : a >= zahl(s.mittel, 0.33) ? 'mittel' : 'schwach';
    },
    setze: function (v) { Z().macht = Math.max(0, Math.min(M.max(), Math.round(v * 10) / 10)); },

    /** Verlorene NERVEN laden die MACHT auf (aufgerufen bei jeder NERVEN-Senkung). */
    nervenVerlust: function (punkte) {
      if (punkte > 0) M.setze(M.wert() + punkte * zahl(C().proNervenpunkt, 1));
    },

    /** Kosten einer Handlung des Hauses: Art aus der Kostentabelle (+ Spiegel-Zuschlag), nachts ggf. billiger. */
    kosten: function (art, spiegelGroesse) {
      var k = C().kosten || {}, z = C().spiegelZuschlag || {};
      var b = typeof art === 'number' ? art : zahl(k[art], zahl(k.sonst, 0));
      if (spiegelGroesse) b += zahl(z[spiegelGroesse], 0);
      if (HG.zeit.istNacht()) b *= zahl(C().nachtKostenFaktor, 1);
      return b;
    },
    kannZahlen: function (betrag) { return M.wert() >= betrag; },
    verbrauche: function (betrag) { if (betrag > 0) M.setze(M.wert() - betrag); },

    /** Faktor auf die Spuk-Wahrscheinlichkeit: wenig MACHT = seltener Spuk. */
    haeufigkeit: function () {
      var h = C().haeufigkeit || {};
      var leer = zahl(h.leer, 0.25), voll = zahl(h.voll, 1);
      return leer + (voll - leer) * M.anteil();
    },
    /** Modifikator für NERVEN-Proben beim Spuk (negativ = schwerer). */
    probenMod: function () { return zahl((C().probenMod || {})[M.stufe()], 0); },

    // ---------------- Spiegel ----------------
    groesse: function (id) {
      var d = HG.daten.dinge[id] || HG.daten.raeume[id];
      if (!d || !d.spiegel) return null;
      var g = HG.wert(d.spiegel, HG.api);
      return GROESSEN.indexOf(g) >= 0 ? g : null;
    },
    istPortal: function (id) { return !!M.groesse(id) && !(HG.daten.dinge[id] && eig(id, 'zerbrochen')); },
    /** Größter intakter Spiegel in der Nähe (mind. Größe min) – Ding-ID, Raum-ID (Spiegelzimmer) oder null. */
    spiegelHier: function (min) {
      var mi = min ? GROESSEN.indexOf(min) : 0, best = null, bi = -1;
      var r = W.raum();
      var kandidaten = W.umfeld(true).concat(r ? [r.id] : []);
      kandidaten.forEach(function (id) {
        if (!M.istPortal(id)) return;
        var i = GROESSEN.indexOf(M.groesse(id));
        if (i >= mi && i > bi) { bi = i; best = id; }
      });
      return best;
    },
    zerbrich: function (id) {
      HG.zustand.setze(id, 'zerbrochen', true);
      HG.zustand.setze(id, 'zerbrochenUm', HG.zeit.jetzt());
      HG.zustand.setze(id, 'erneuert', false);
    },
    text: function (name) { return HG.wert((C().texte || {})[name], HG.api) || ''; },
    /** Zusatz für "untersuche": zersprungen bzw. einmalig "wieder heil". */
    beschreibungZusatz: function (id) {
      if (!M.groesse(id) && !eig(id, 'zerbrochen')) return '';
      if (eig(id, 'zerbrochen')) return M.text('zerbrochen');
      if (eig(id, 'erneuert')) { HG.zustand.setze(id, 'erneuert', false); return M.text('erneuert'); }
      return '';
    },

    /** Am Zugende: Spiegel, die vor der letzten Erneuerungs-Uhrzeit zerbrochen wurden, sind wieder heil. */
    zug: function () {
      var um = HG.zeit.minutenAus(C().erneuerungUm || '03:00'), jetzt = HG.zeit.jetzt();
      var letzte = Math.floor((jetzt - um) / 1440) * 1440 + um;
      Object.keys(Z().dinge).forEach(function (id) {
        if (!eig(id, 'zerbrochen') || (eig(id, 'zerbrochenUm') || 0) >= letzte) return;
        HG.zustand.setze(id, 'zerbrochen', false);
        HG.zustand.setze(id, 'erneuert', true);
        M.verbrauche(M.kosten('erneuern'));
        if (W.imUmfeld(id, true)) {
          var t = M.text('erneuertVorAugen');
          if (t) { HG.ausgabe.schreibe('spuk', t); HG.zustand.setze(id, 'erneuert', false); }
        }
      });
    }
  };
})(window.HG);
