// Haus Grest – Engine: Prozentproben (W100), NERVEN-Proben, Schock
//
// Allgemein:  api.probe('nerven')                     -> W100 gegen den Wert, Ergebnis-Objekt
//             api.probe(65, { titel: 'Suchen' })      -> W100 gegen eine feste Zahl (spätere Fertigkeiten)
//             api.probe('suchen', { mod: -20, modGrund: 'Dunkelheit' })  (Fertigkeiten in z.werte oder z.fertigkeiten)
// NERVEN:     api.nervenProbe('1/1W6', { grund: 'Gestalt im Spiegel' })
//             Erfolg/Misserfolg-Verlust wie bei Delta Green: "0/1W3", "1/1W6", "1/1W8", "1W3/1W10", "1W4/1W12".
//             Nachts an Orten aus HG.daten.spiel.nachtMalusOrte (Standard: 'haus') gibt es −10 %.
//             Wer 5 oder mehr Punkte auf einmal verliert (HG.daten.spiel.schockAb), erleidet am Zugende einen Schock.
// Jede Probe erscheint im Text als Würfel-Block (Typ 'wurf'), den die Anzeige animiert.
(function (HG) {
  'use strict';

  var W = HG.welt, T = HG.text;
  function Z() { return HG.zustand.z; }
  var NAMEN = { nerven: 'NERVEN', geschick: 'GESCHICK', ausdauer: 'AUSDAUER' };

  var P = HG.proben = {
    schockFaellig: false,

    w100: function () { return 1 + Math.floor(HG.zufall() * 100); },

    /** Zielwert ermitteln: Zahl, Wert (z.werte) oder Fertigkeit (z.fertigkeiten). */
    basis: function (wer) {
      if (typeof wer === 'number') return wer;
      var z = Z();
      if (z.werte && z.werte[wer] !== undefined) return z.werte[wer];
      if (z.fertigkeiten && z.fertigkeiten[wer] !== undefined) return z.fertigkeiten[wer];
      return 50;
    },

    /**
     * Prozentprobe. opt: { titel, grund, mod, modGrund, still }
     * Rückgabe: { wurf, ziel, basis, mod, erfolg, kritisch, patzer }
     */
    probe: function (wer, opt) {
      opt = opt || {};
      var basis = P.basis(wer), mod = opt.mod || 0;
      var ziel = Math.max(1, Math.min(99, basis + mod));
      var wurf = P.w100();
      var e = {
        wurf: wurf, ziel: ziel, basis: basis, mod: mod, modGrund: opt.modGrund || '',
        erfolg: wurf <= ziel, kritisch: wurf <= 5 && wurf <= ziel, patzer: wurf >= 96 && wurf > ziel,
        titel: opt.titel || ((NAMEN[wer] || (typeof wer === 'string' ? T.gross(wer) : 'Prozent')) + '-Probe'),
        grund: opt.grund || ''
      };
      if (!opt.still) P.zeige(e);
      return e;
    },

    /** Würfel-Block ausgeben (Text für Protokoll/Screenreader, Daten für die Animation). */
    zeige: function (e) {
      var ziel = e.ziel + (e.mod ? ' <small>(' + e.basis + ' ' + (e.mod < 0 ? '−' : '+') + ' ' + Math.abs(e.mod) + (e.modGrund ? ' ' + T.esc(e.modGrund) : '') + ')</small>' : '');
      var html = '<b>' + e.titel + '</b>' + (e.grund ? ' (' + e.grund + ')' : '') + ': W100 → <b>' + e.wurf + '</b> gegen ' + ziel +
        ' – ' + (e.erfolg ? 'bestanden' : 'misslungen') + '.' +
        (e.verlustSpec !== undefined ? ' Verlust ' + e.verlustSpec + ' → ' + e.verlust + ' · NERVEN jetzt ' + e.neu + '.' : '');
      HG.ausgabe.schreibe('wurf', html, { probe: e });
      HG.medien.effekt('wuerfel');
    },

    /** Malus für Nacht im Haus. */
    nachtMalus: function () {
      var r = W.raum(), sp = HG.daten.spiel;
      var orte = sp.nachtMalusOrte || ['haus'];
      if (HG.zeit.istNacht() && r && orte.indexOf(r.schauplatz) >= 0) return { mod: -(sp.nachtMalus === undefined ? 10 : sp.nachtMalus), grund: 'Nacht im Haus' };
      return { mod: 0, grund: '' };
    },

    /** NERVEN-Probe mit Verlust "Erfolg/Misserfolg". */
    nerven: function (spec, opt) {
      opt = opt || {};
      spec = String(HG.wert(spec, HG.api) || '0/1W3');
      var teile = spec.split('/');
      if (teile.length < 2) teile = ['0', teile[0]];
      var malus = P.nachtMalus();
      var e = P.probe('nerven', { titel: 'NERVEN-Probe', grund: opt.grund, mod: (opt.mod || 0) + malus.mod, modGrund: malus.grund, still: true });
      var teil = (e.erfolg ? teile[0] : teile[1]).trim();
      var verlust = Math.max(0, HG.wuerfel(teil));
      HG.api.aendere('nerven', -verlust, null, true);
      e.verlustSpec = spec; e.verlustTeil = teil; e.verlust = verlust; e.neu = Z().werte.nerven;
      P.zeige(e);
      if (verlust >= (HG.daten.spiel.schockAb || 5) && Z().werte.nerven > 0) P.schockFaellig = true;
      return e;
    },

    /** Kurze Panikreaktion (am Zugende). */
    schock: function () {
      P.schockFaellig = false;
      var z = Z(), r = W.raum(), api = HG.api;
      var reaktionen = (HG.daten.spiel.schockReaktionen || [{ art: 'schrei', text: 'Du schreist auf, bevor du es verhindern kannst.' }]).slice();
      // Welche Reaktionen sind hier möglich?
      var tragbar = W.kinder('spieler').filter(function (id) { return !HG.daten.dinge[id].istHandy; });
      var wege = Object.keys(r.ausgaenge || {}).filter(function (k) {
        var a = r.ausgaenge[k]; if (typeof a === 'string') a = { ziel: a };
        if (!a.ziel || (a.sperre && HG.wert(a.sperre, api))) return false;
        return !a.tuer || HG.zustand.eig(a.tuer, 'offen') || !HG.zustand.eig(a.tuer, 'verschlossen');
      });
      reaktionen = reaktionen.filter(function (x) {
        if (x.art === 'fallen') return tragbar.length > 0;
        if (x.art === 'flucht') return wege.length > 0;
        return true;
      });
      var x = reaktionen[Math.floor(HG.zufall() * reaktionen.length)];
      var text = HG.wert(x.text, api) || '';
      if (x.art === 'fallen') {
        var id = tragbar[Math.floor(HG.zufall() * tragbar.length)];
        api.bewege(id, z.raum, null);
        if (HG.zustand.eig(id, 'brennt') && !HG.daten.dinge[id].schalter) HG.zustand.setze(id, 'brennt', false);
        text = text.replace('%DING%', T.der(id, 'nom'));
      }
      HG.ausgabe.schreibe('schock', '<b>Schock!</b> ' + text);
      HG.medien.effekt('schock');
      if (x.art === 'flucht') {
        var k = wege[Math.floor(HG.zufall() * wege.length)];
        var a = r.ausgaenge[k]; if (typeof a === 'string') a = { ziel: a };
        if (a.tuer) HG.zustand.setze(a.tuer, 'offen', true);
        HG.spiel.betrete(a.ziel);
      }
    }
  };
})(window.HG);
