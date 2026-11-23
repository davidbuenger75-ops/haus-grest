// Haus Grest – Engine: Grusel-Baukasten (Spuk-Ereignisse)
//
//   HG.spuk('lavendel', {
//     art: 'geruch',            // geruch | geraeusch | illusion | bewegung | erscheinen | nachricht | anruf (nur zur Übersicht)
//     orte: ['halle', 'flur'],  // in diesen Räumen …
//     schauplatz: 'haus',       // … oder überall an diesem Schauplatz
//     zeiten: ['abend', 'nacht'],  // optional: nur zu diesen Tageszeiten
//     chance: 0.08,             // Wahrscheinlichkeit pro Zug (nachts × nachtFaktor, morgens/mittags × tagFaktor)
//     nachtFaktor: 2,           // optional, sonst HG.daten.spiel.spukNachtFaktor (Standard 2)
//     tagFaktor: 1,             // optional, sonst HG.daten.spiel.spukTagFaktor (bei Tag spukt es wenig)
//     gewoehnung: false,        // Standard: nach einer bestandenen NERVEN-Probe keine Probe mehr für dieses Ereignis
//     einmalig: true,           // oder max: 3
//     hell: true,               // nur, wenn man etwas sehen kann
//     bedingung: function (api) { return …; },
//     text: { sonst: '…', nacht: '…' },  // Text, Funktion oder Tageszeit-Objekt
//     nerven: '0/1W3',          // optionale NERVEN-Probe (Erfolg/Misserfolg), auch als Tageszeit-Objekt;
//                               // eine Zahl (z. B. -2) zieht direkt ohne Probe ab
//     bewege:   { ding: 'kerze', nach: 'halle', rel: null },        // Gegenstand bewegt sich (muss im Raum sein, darf nicht getragen werden)
//     erscheine:{ ding: 'rasiermesser', nach: 'schreibtisch', rel: 'auf' }, // Gegenstand taucht auf
//     nachricht: 'id', anruf: 'id', hinweis: 'id',
//     aktion: function (api) { … },        // beliebige weitere Wirkung
//     ausloeser: 'manuell',     // nie zufällig, nur per api.spuk('id')
//     sound: 'name',            // Effekt assets/sound/effekt-<name>; Standard: effekt-spuk-<id>
//     spiegel: 'gross',         // nur, wenn ein intakter Spiegel mindestens dieser Größe in der Nähe ist
//                               // (winzig | klein | gross | spiegelzimmer, siehe js/engine/macht.js)
//     kosten: 5                 // MACHT-Kosten; sonst aus der Tabelle nach "art" (+ Spiegel-Zuschlag)
//   });
// Zufällige Ereignisse geschehen nur, wenn das Haus genug MACHT hat; je weniger MACHT,
// desto seltener. Per api.spuk('id') ausgelöste (erzählerische) Ereignisse geschehen immer
// und ziehen die MACHT höchstens bis 0 herunter.
// Zwischen zwei zufälligen Spuk-Ereignissen liegen mindestens
// HG.daten.spiel.spukAbstand Züge (Standard 4).
(function (HG) {
  'use strict';

  var W = HG.welt;
  function Z() { return HG.zustand.z; }
  function sz() { var z = Z(); if (!z.spuk) z.spuk = { zaehl: {}, letzter: -99 }; return z.spuk; }
  function SD(id) { return HG.daten.spuk[id]; }

  var SP = HG.spukwerk = {
    /** Darf dieses Ereignis jetzt hier geschehen? */
    moeglich: function (id) {
      var d = SD(id), r = W.raum(), n = sz().zaehl[id] || 0;
      if (d.einmalig && n) return false;
      if (d.max && n >= d.max) return false;
      var hierOk = (d.orte && d.orte.indexOf(r.id) >= 0) || (d.schauplatz && d.schauplatz === r.schauplatz);
      if (!hierOk) return false;
      if (d.zeiten && d.zeiten.indexOf(HG.zeit.phase()) < 0) return false;
      if (d.hell && !W.hell()) return false;
      if (d.bewege) {
        var b = d.bewege.ding;
        if (W.getragen(b) || W.raumVon(b) !== r.id || HG.zustand.eig(b, 'versteckt')) return false;
        if (HG.zustand.eig(b, 'ort') === d.bewege.nach && (HG.zustand.eig(b, 'rel') || null) === (d.bewege.rel || null)) return false;
      }
      if (d.erscheine) {
        var e = d.erscheine.ding, o = HG.zustand.eig(e, 'ort');
        if (o && !HG.zustand.eig(e, 'versteckt')) return false; // ist schon in der Welt
      }
      if (d.spiegel && !HG.macht.spiegelHier(d.spiegel)) return false;
      if (d.bedingung && !d.bedingung(HG.api)) return false;
      return true;
    },

    /** MACHT-Kosten dieses Ereignisses hier und jetzt. */
    kosten: function (id) {
      var d = SD(id);
      if (typeof d.kosten === 'number') return d.kosten;
      var sp = d.spiegel ? HG.macht.groesse(HG.macht.spiegelHier(d.spiegel)) : null;
      return HG.macht.kosten(d.art || 'sonst', sp);
    },

    /** Ein Ereignis ausführen. */
    ausloesen: function (id) {
      var d = SD(id), api = HG.api, s = sz();
      if (!d) return false;
      s.zaehl[id] = (s.zaehl[id] || 0) + 1;
      s.letzter = Z().zug;
      HG.macht.verbrauche(SP.kosten(id));
      HG.macht.letzterSpiegel = d.spiegel ? HG.macht.spiegelHier(d.spiegel) : null;
      // Bildvariante "spuk" bis zum Ende des nächsten Zugs, dazu ein Soundeffekt
      HG.medien.spukVariante = { raum: Z().raum, bisZug: Z().zug + 1 };
      HG.medien.effekt(HG.wert(d.sound, api) || 'spuk-' + id);
      if (d.bewege) api.bewege(d.bewege.ding, d.bewege.nach, d.bewege.rel);
      if (d.erscheine) { api.setze(d.erscheine.ding, 'versteckt', false); api.bewege(d.erscheine.ding, d.erscheine.nach, d.erscheine.rel); }
      var t = HG.wert(d.text, api);
      if (t) HG.ausgabe.schreibe('spuk', t);
      if (d.aktion) d.aktion(api);
      var n = HG.wert(d.nerven, api);
      // Ein starkes Haus macht die Probe schwerer (indirekte Anzeige der MACHT).
      // Gewöhnung: Wer die Probe für dieses Ereignis einmal bestanden hat, würfelt beim nächsten Mal nicht mehr
      // (gewoehnung: false schaltet das ab, gewoehnung: 'schluessel' teilt sie sich mit anderen Ereignissen).
      var gew = d.gewoehnung === false ? null : (d.gewoehnung || 'spuk_' + id);
      if (typeof n === 'string') api.nervenProbe(n, { grund: d.grund || HG.text.gross(d.art || 'Spuk'), mod: HG.macht.probenMod(), gewoehnung: gew });
      else if (n) api.nerven(n, d.grund || 'Schrecken');
      if (d.hinweis) api.hinweis(d.hinweis);
      HG.macht._imSpuk = true;     // schon bezahlt
      try {
        if (d.nachricht) HG.handy.nachricht(d.nachricht);
        if (d.anruf) HG.handy.anruf(d.anruf);
      } finally { HG.macht._imSpuk = false; }
      return true;
    },

    /** Am Zugende: vielleicht passiert etwas. */
    zug: function () {
      var z = Z(), sp = HG.daten.spiel;
      if (z.vorbei) return;
      if (z.zug - sz().letzter < (sp.spukAbstand === undefined ? 4 : sp.spukAbstand)) return;
      var nacht = HG.zeit.istNacht(), phase = HG.zeit.phase(), tag = phase === 'morgen' || phase === 'mittag';
      var kand = Object.keys(HG.daten.spuk).filter(function (id) { return SD(id).ausloeser !== 'manuell' && SP.moeglich(id) && HG.macht.kannZahlen(SP.kosten(id)); });
      // zufällige Reihenfolge
      for (var i = kand.length - 1; i > 0; i--) { var j = Math.floor(HG.zufall() * (i + 1)); var t = kand[i]; kand[i] = kand[j]; kand[j] = t; }
      for (var k = 0; k < kand.length; k++) {
        var d = SD(kand[k]);
        var c = d.chance === undefined ? 0.1 : d.chance;
        if (nacht) c *= d.nachtFaktor || sp.spukNachtFaktor || 2;
        // Bei Tag spukt es wenig (HG.daten.spiel.spukTagFaktor, pro Ereignis überschreibbar mit tagFaktor)
        if (tag) c *= d.tagFaktor !== undefined ? d.tagFaktor : (sp.spukTagFaktor === undefined ? 1 : sp.spukTagFaktor);
        c *= HG.macht.haeufigkeit();     // wenig MACHT = seltener Spuk
        if (HG.zufall() < c) { SP.ausloesen(kand[k]); return; }
      }
    }
  };
})(window.HG);
