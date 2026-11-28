// Haus Grest – Engine: Reisen zwischen Schauplätzen
// Ein Schauplatz (Haus Grest, Lager Schmidt, Friedhof …) ist ein Reiseziel:
//   HG.ziel('lager', {
//     name: 'Lager Schmidt', woerter: ['lager', 'schmidt'],
//     ankunft: 'lager_gang',              // Raum, in dem man ankommt
//     geoeffnet: { von: '08:00', bis: '16:00', tage: 'werktags' },  // optional: Öffnungszeiten
//     fahrzeit: 30,                       // Minuten (oder [20, 40] = zufällig dazwischen)
//     fahrt: 'Du fährst …',               // optional: Text unterwegs (auch Tageszeit-Objekt)
//     geschlossen: 'Das Tor ist zu.'      // optional: Text, wenn geschlossen
//   });
// Räume gehören über "schauplatz: 'lager'" zu einem Ziel. Abfahren kann man nur
// aus Räumen mit "abfahrt: true" (dort steht das Auto).
// Ziele werden freigeschaltet über Hinweise (schaltetFrei: ['lager']) oder api.zielFrei('lager').
(function (HG) {
  'use strict';

  var T = HG.text, W = HG.welt;
  function Z() { return HG.zustand.z; }
  function ZD(id) { return HG.daten.ziele[id]; }

  var R = HG.reisen = {
    hier: function () { var r = W.raum(); return r && r.schauplatz; },

    /** Freigeschaltete Ziele in der Reihenfolge der Freischaltung (z.ziele[id] = laufende Nummer; true = alter Spielstand,
     *  dann zählt die Reihenfolge der Definition). Neue Ziele kommen hinten dazu – so behält jedes Ziel seine Nummer. */
    bekannt: function () {
      var z = Z(), alle = Object.keys(HG.daten.ziele);
      return alle.filter(function (id) { return z.ziele[id]; }).sort(function (a, b) {
        var na = z.ziele[a] === true ? 0 : z.ziele[a], nb = z.ziele[b] === true ? 0 : z.ziele[b];
        return na - nb || alle.indexOf(a) - alle.indexOf(b);
      });
    },
    /** Freigeschaltete Ziele außer dem aktuellen Schauplatz. */
    liste: function () {
      var hier = R.hier();
      return R.bekannt().filter(function (id) { return id !== hier; });
    },

    istOffen: function (id) { return HG.zeit.istOffen(ZD(id).geoeffnet); },
    oeffnungsText: function (id) { return HG.zeit.oeffnungsText(ZD(id).geoeffnet); },
    fahrzeit: function (id) {
      var f = HG.wert(ZD(id).fahrzeit, HG.api);
      if (Array.isArray(f)) return f[0] + Math.floor(HG.zufall() * (f[1] - f[0] + 1));
      return f === undefined ? 30 : f;
    },

    schalteFrei: function (id, still) {
      if (!ZD(id) || Z().ziele[id]) return false;
      var z = Z(), n = 0;
      Object.keys(z.ziele).forEach(function (k) { if (typeof z.ziele[k] === 'number') n = Math.max(n, z.ziele[k]); else if (z.ziele[k]) n = Math.max(n, 0); });
      z.ziele[id] = n + 1;
      if (!still) HG.ausgabe.schreibe('ziel', 'Neues Ziel: <b>' + ZD(id).name + '</b> – du kannst jetzt dorthin fahren.');
      return true;
    },

    /** Ziel aus Wörtern finden ("haus grest", "archiv", "2"). */
    finde: function (tokens, liste) {
      var w = (tokens || []).filter(function (t) { return !/^(der|die|das|den|dem|zu|zum|zur|nach|in|ins|richtung)$/.test(t); });
      if (!w.length) return null;
      if (liste && /^\d+$/.test(w[0])) return liste[parseInt(w[0], 10) - 1] || null;
      var treffer = Object.keys(HG.daten.ziele).filter(function (id) {
        var d = ZD(id);
        var wl = (d.woerter || []).concat(T.norm(d.name).split(/\s+/)).map(T.norm);
        return w.every(function (x) { return wl.indexOf(x) >= 0; });
      });
      return treffer[0] || null;
    },

    /** Spielbuch-Auswahl: nummerierte Liste der Ziele. */
    auswahl: function () {
      // Feste Nummern: alle bekannten Ziele, der aktuelle Ort grau mit „(hier)“ statt zu fehlen (Alpha-Test 27.11.2026)
      var liste = R.bekannt(), hier = R.hier();
      if (!R.liste().length) {
        HG.ausgabe.text(HG.wert(HG.daten.spiel.keineZieleText, HG.api) || 'Du weißt nicht, wohin du fahren solltest.');
        return;
      }
      var html = '<b>Wohin fährst du?</b><ol>';
      liste.forEach(function (id) {
        if (id === hier) { html += '<li class="hier">' + ZD(id).name + ' <span class="oeffnung">(hier)</span></li>'; return; }
        html += '<li>' + ZD(id).name + ' <span class="oeffnung">(' + (R.istOffen(id) ? R.oeffnungsText(id) : 'jetzt geschlossen – ' + R.oeffnungsText(id)) + ', ca. ' + R.fahrzeit(id) + ' Min. Fahrt' + ')</span></li>';
      });
      html += '</ol>Tippe die Nummer oder den Namen.';
      HG.ausgabe.schreibe('auswahl', html);
      HG.spiel.offen = { art: 'ziel', liste: liste };
    },

    fahre: function (id) {
      var d = ZD(id), r = W.raum();
      if (!r.abfahrt) { HG.ausgabe.text(HG.wert(r.keinAuto, HG.api) || HG.daten.spiel.keinAutoText || 'Von hier aus kannst du nicht losfahren.'); return; }
      if (!d || !Z().ziele[id]) { HG.ausgabe.text('Diesen Ort kennst du nicht – oder noch nicht.'); return; }
      if (id === R.hier()) { HG.ausgabe.text('Du bist doch schon hier.'); return; }
      if (!R.istOffen(id)) {
        HG.ausgabe.text(HG.wert(d.geschlossen, HG.api) || (d.name + ' hat jetzt geschlossen (' + R.oeffnungsText(id) + '). Es ist ' + HG.zeit.uhr() + ' Uhr.'));
        return;
      }
      HG.ausgabe.text(HG.wert(d.fahrt, HG.api) || HG.wert(HG.daten.spiel.fahrtText, HG.api) || ('Du fährst los, nach ' + d.name + '.'));
      var min = R.fahrzeit(id);
      HG.zeit.vergeht(min);
      if (HG.licht) HG.licht.fahrt(min);   // im Auto lädt das Handy
      HG.ausgabe.text('<span class="nebenbei">(' + min + ' Minuten Fahrt – es ist ' + HG.zeit.uhr() + ' Uhr.)</span>');
      HG.spiel.betrete(HG.wert(d.ankunft, HG.api));
    }
  };

  HG.aktionen.fahren = function (ctx) {
    if (ctx.zielId) { R.fahre(ctx.zielId); return; }
    if (!W.raum().abfahrt) { R.fahre(null); return; }
    var woerter = (ctx.np1 || []).filter(function (t) { return t !== 'los' && t !== 'weg'; });
    if (!woerter.length) { R.auswahl(); return; }
    var id = R.finde(woerter);
    if (!id || !Z().ziele[id]) { HG.ausgabe.text('Diesen Ort kennst du nicht – oder noch nicht. Tippe „fahre los“, um deine Ziele zu sehen.'); return; }
    R.fahre(id);
  };
})(window.HG);
