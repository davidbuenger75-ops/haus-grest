// Haus Grest – Engine: Prozentproben (W100), NERVEN-Proben, Schock
//
// Allgemein:  api.probe('st')                         -> Eigenschaftsprobe: W100 gegen Wert × 5 (+ Berufsbonus)
//             api.probe('handwerk', { mod: -20 })     -> Fertigkeitsprobe (Prozentwert aus z.fertigkeiten)
//             api.probe('nerven') · api.probe(65, { titel: 'Glück' })
//             opt: { mod, modGrund, grund, titel, still, beruf: { handwerk: 0 | 'auto' } }
//               beruf: für diese Berufe gilt ein anderer Modifikator (Zahl) oder die Probe gelingt ohne Wurf ('auto')
//             Schwer verletzt (LP ≤ 2): −20 % auf körperliche Proben (Inhalt: schwerMalus, koerperlich)
// Ergebnis:   { erfolg, kritisch, patzer, wurf, ziel, auto } – kritisch/Patzer wie Delta Green:
//             Pasch (11, 22 …) oder 01 unter dem Ziel = kritisch; Pasch über dem Ziel oder 100 = Patzer.
// NERVEN:     api.nervenProbe('1/1W6', { grund: 'Gestalt im Spiegel', gewoehnung: 'lavendel' })
//             gewoehnung: nach einer bestandenen Probe mit diesem Schlüssel gibt es keine Probe mehr (Spuk: automatisch).
//             Erfolg/Misserfolg-Verlust wie bei Delta Green: "0/1W3", "1/1W6", "1/1W8", "1W3/1W10", "1W4/1W12".
//             Nachts an Orten aus HG.daten.spiel.nachtMalusOrte (Standard: 'haus') gibt es −10 %.
//             Wer 5 oder mehr Punkte auf einmal verliert (HG.daten.spiel.schockAb), erleidet am Zugende einen Schock.
// Jede Probe erscheint im Text als Würfel-Block (Typ 'wurf'), den die Anzeige animiert.
(function (HG) {
  'use strict';

  var W = HG.welt, T = HG.text;
  function Z() { return HG.zustand.z; }
  var NAMEN = { nerven: 'NERVEN', lp: 'LP', wp: 'WP' };
  function name(wer) {
    if (NAMEN[wer]) return NAMEN[wer];
    var e = HG.charakter && HG.charakter.eigenschaftDef(wer); if (e) return e.name;
    var f = HG.charakter && HG.charakter.fertigkeitDef(wer); if (f) return f.name;
    return typeof wer === 'string' ? T.gross(wer) : 'Prozent';
  }

  var P = HG.proben = {
    schockFaellig: false,

    w100: function () { return 1 + Math.floor(HG.zufall() * 100); },

    /** Zielwert ermitteln: Zahl, Eigenschaft (× 5), Wert (z.werte) oder Fertigkeit (z.fertigkeiten). */
    basis: function (wer) {
      if (typeof wer === 'number') return wer;
      var z = Z();
      if (z.eigenschaften && z.eigenschaften[wer] !== undefined) return HG.charakter.eigenschaftZiel(wer);
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
      var basis = P.basis(wer), mod = opt.mod || 0, modGrund = opt.modGrund || '';
      var titel = opt.titel || (name(wer) + '-Probe');
      // Beruf: anderer Modifikator oder automatischer Erfolg
      var beruf = HG.charakter && opt.beruf && Z().beruf && opt.beruf[Z().beruf];
      if (beruf === 'auto') {
        var a = { wurf: 0, ziel: basis, basis: basis, mod: 0, erfolg: true, kritisch: false, patzer: false, auto: true,
          titel: titel, grund: opt.grund || '', berufName: HG.charakter.berufName() };
        if (!opt.still) P.zeige(a);
        return a;
      }
      if (typeof beruf === 'number') { mod = beruf; modGrund = modGrund || HG.charakter.berufName(); }
      // Schwer verletzt: körperliche Proben schwerer
      if (HG.charakter && typeof wer === 'string' && HG.charakter.istKoerperlich(wer) && HG.charakter.schwerVerletzt()) {
        mod -= HG.daten.spiel.schwerMalus || 20; modGrund = (modGrund ? modGrund + ', ' : '') + 'schwer verletzt';
      }
      var ziel = Math.max(1, Math.min(99, basis + mod));
      var wurf = P.w100();
      var pasch = wurf < 100 && wurf % 11 === 0;
      var erfolg = wurf <= ziel;
      var e = {
        wurf: wurf, ziel: ziel, basis: basis, mod: mod, modGrund: modGrund,
        erfolg: erfolg, kritisch: erfolg && (wurf === 1 || pasch), patzer: !erfolg && (wurf === 100 || pasch),
        titel: titel, grund: opt.grund || ''
      };
      if (!opt.still) P.zeige(e);
      return e;
    },

    /** Würfel-Block ausgeben (Text für Protokoll/Screenreader, Daten für die Animation). */
    zeige: function (e) {
      var ziel = e.ziel + (e.mod ? ' <small>(' + e.basis + ' ' + (e.mod < 0 ? '−' : '+') + ' ' + Math.abs(e.mod) + (e.modGrund ? ' ' + T.esc(e.modGrund) : '') + ')</small>' : '');
      var html = e.auto
        ? '<b>' + e.titel + '</b>' + (e.grund ? ' (' + e.grund + ')' : '') + ': kein Wurf nötig – ' + T.esc(e.berufName || 'dein Beruf') + '.'
        : '<b>' + e.titel + '</b>' + (e.grund ? ' (' + e.grund + ')' : '') + ': W100 → <b>' + e.wurf + '</b> gegen ' + ziel +
        ' – ' + (e.kritisch ? 'kritischer Erfolg' : e.patzer ? 'Patzer' : e.erfolg ? 'bestanden' : 'misslungen') + '.' +
        (e.verlustSpec !== undefined ? ' Verlust ' + e.verlustSpec + ' → ' + e.verlust + ' · NERVEN jetzt ' + e.neu + '.' : '');
      HG.ausgabe.schreibe('wurf', html, { probe: e });
      if (!e.auto) HG.medien.effekt('wuerfel');
    },

    /** Malus für Nacht im Haus. */
    nachtMalus: function () {
      var r = W.raum(), sp = HG.daten.spiel;
      var orte = sp.nachtMalusOrte || ['haus'];
      // Nach 3 Uhr ebbt die Nacht ab: NERVEN-Proben leichter (kein Malus mehr)
      if (HG.nacht && HG.nacht.phase() === 'abebben') return { mod: 0, grund: '' };
      if (HG.zeit.istNacht() && r && orte.indexOf(r.schauplatz) >= 0) return { mod: -(sp.nachtMalus === undefined ? 10 : sp.nachtMalus), grund: 'Nacht im Haus' };
      return { mod: 0, grund: '' };
    },

    /** NERVEN-Probe mit Verlust "Erfolg/Misserfolg". */
    nerven: function (spec, opt) {
      opt = opt || {};
      // Gewöhnung (opt.gewoehnung = Schlüssel): Wer denselben Schrecken einmal mit bestandener Probe überstanden hat,
      // würfelt beim nächsten Mal nicht mehr. Gemerkt im Spielzustand (z.gewoehnt).
      var gz = Z().gewoehnt || (Z().gewoehnt = {});
      if (opt.gewoehnung && gz[opt.gewoehnung]) return { erfolg: true, gewoehnt: true, verlust: 0, wurf: 0, ziel: 0 };
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
      if (opt.gewoehnung && e.erfolg) gz[opt.gewoehnung] = true;
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
