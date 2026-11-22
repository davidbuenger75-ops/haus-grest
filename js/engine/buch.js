// Haus Grest – Engine: Bücher zum Blättern (z. B. Carstens Tagebuch)
//
//   HG.ding('tagebuch', { …,
//     buch: {
//       titel: 'Carstens Tagebuch',
//       dauerProSeite: 2,                 // Minuten pro gelesener Seite
//       schrift: 'hand',                  // Darstellung: 'hand' | 'druck' | 'fraktur'
//       seiten: [
//         { titel: '3. August 2025', text: '…', hinweis: 'tb_kaufvertrag' },
//         { titel: 'Letzte Seite', text: '…', bedingung: function (api) { … }, beimLesen: function (api) { … } }
//       ]
//     }
//   });
// Befehle: "lies tagebuch" (öffnet die Lese-Ansicht), "lies eintrag 3", "lies seite 3",
//          "blättere weiter" / "blättere zurück", "lies weiter", "lies die letzte seite".
// Ohne Browser-Oberfläche (Tests) erscheinen die Seiten vollständig im Textverlauf.
(function (HG) {
  'use strict';

  var W = HG.welt, T = HG.text;
  function Z() { return HG.zustand.z; }
  function D(id) { return HG.daten.dinge[id]; }
  function bz(id) {
    var z = Z(); if (!z.buecher) z.buecher = {};
    if (!z.buecher[id]) z.buecher[id] = { seite: 0, gelesen: [] };
    return z.buecher[id];
  }

  var B = HG.buch = {
    /** Sichtbare Seiten (Seiten mit erfüllter Bedingung), jeweils mit Index. */
    seiten: function (id) {
      return D(id).buch.seiten.map(function (s, i) { return { s: s, i: i }; })
        .filter(function (x) { return !x.s.bedingung || x.s.bedingung(HG.api); });
    },
    /** Welches Buch ist gemeint? Zuletzt aufgeschlagenes oder das einzige erreichbare. */
    aktuell: function () {
      var u = W.umfeld(true); // auch im Dunkeln finden – lesen geht dann aber nicht
      var offen = Z().buchOffen;
      if (offen && u.indexOf(offen) >= 0) return offen;
      return u.filter(function (id) { return D(id).buch; })[0] || null;
    },
    hatOberflaeche: function () { return !!(HG.anzeige && HG.anzeige.zeigeBuch); },

    /** Buch aufschlagen. */
    oeffne: function (id, ctx) {
      if (!W.hell()) { HG.ausgabe.text('Es ist zu dunkel zum Lesen.'); return; }
      Z().buchOffen = id;
      var b = D(id).buch, liste = B.seiten(id), st = bz(id);
      // beim ersten Öffnen: erste Seite; sonst die erste ungelesene
      var naechste = liste.filter(function (x) { return st.gelesen.indexOf(x.i) < 0; })[0];
      var pos = naechste ? liste.indexOf(naechste) : 0;
      HG.ausgabe.text('Du schlägst ' + T.der(id, 'akk') + ' auf. ' + liste.length + ' beschriebene Seiten.' +
        (B.hatOberflaeche() ? '' : ' <span class="nebenbei">(„lies eintrag 1“ … „lies eintrag ' + liste.length + '“, „blättere weiter“)</span>'));
      if (!B.hatOberflaeche()) {
        HG.ausgabe.schreibe('buchinhalt', '<b>' + b.titel + '</b><ol>' + liste.map(function (x) {
          return '<li>' + x.s.titel + (st.gelesen.indexOf(x.i) >= 0 ? ' ✓' : '') + '</li>';
        }).join('') + '</ol>');
      }
      B.lies(id, pos, ctx);
    },

    /** Seite (Position in der Liste der sichtbaren Seiten) lesen. */
    lies: function (id, pos, ctx) {
      var b = D(id).buch, liste = B.seiten(id), st = bz(id);
      if (pos < 0 || pos >= liste.length) { HG.ausgabe.text(pos < 0 ? 'Das ist schon die erste Seite.' : 'Danach sind die Seiten leer.'); return; }
      var x = liste[pos], neu = st.gelesen.indexOf(x.i) < 0;
      st.seite = pos;
      Z().buchOffen = id;
      HG.medien.effekt('seite');
      if (ctx) ctx.dauer = neu ? (b.dauerProSeite === undefined ? 2 : b.dauerProSeite) : 1;
      var text = HG.wert(x.s.text, HG.api);
      if (neu) st.gelesen.push(x.i); // vor der Anzeige, damit das Lesezeichen ein Häkchen bekommt
      if (B.hatOberflaeche()) {
        HG.ausgabe.text('<span class="nebenbei">📖 ' + T.esc(b.titel) + ', Seite ' + (pos + 1) + ' von ' + liste.length + ': ' + x.s.titel + '</span>');
        HG.anzeige.zeigeBuch(id);
      } else {
        HG.ausgabe.schreibe('schrift', '<b>' + x.s.titel + '</b><br>' + text, { stil: x.s.schrift || b.schrift || 'hand' });
      }
      if (neu) {
        if (x.s.hinweis) [].concat(x.s.hinweis).forEach(function (h) { HG.api.hinweis(h); });
        if (x.s.beimLesen) x.s.beimLesen(HG.api);
      }
    },

    /** "lies eintrag 3" / "blättere weiter" … ziel: Zahl (1-basiert) oder 'weiter' | 'zurueck' | 'erste' | 'letzte' */
    blaettere: function (ziel, ctx) {
      var id = B.aktuell();
      if (!id) { HG.ausgabe.text('Du hast kein Buch zur Hand, in dem du blättern könntest.'); return; }
      if (!W.hell()) { HG.ausgabe.text('Es ist zu dunkel zum Lesen.'); return; }
      var liste = B.seiten(id), st = bz(id), pos;
      if (Z().buchOffen !== id && (ziel === 'weiter' || ziel === 'zurueck')) { B.oeffne(id, ctx); return; }
      if (ziel === 'weiter') pos = st.seite + 1;
      else if (ziel === 'zurueck') pos = st.seite - 1;
      else if (ziel === 'erste') pos = 0;
      else if (ziel === 'letzte') pos = liste.length - 1;
      else if (typeof ziel === 'object') {
        // "lies den eintrag vom 7. oktober"
        pos = -1;
        liste.forEach(function (x, i) { if (pos < 0 && T.norm(x.s.titel).indexOf(ziel.tag + '. ' + ziel.monat) === 0) pos = i; });
        if (pos < 0) { HG.ausgabe.text('Einen Eintrag von diesem Tag findest du nicht.'); return; }
      }
      else pos = parseInt(ziel, 10) - 1;
      if (isNaN(pos)) { HG.ausgabe.text('Welche Seite? Zum Beispiel „lies eintrag 2“.'); return; }
      B.lies(id, pos, ctx);
    }
  };

  // ------------------------------------------------------------------
  // Handlungen
  // ------------------------------------------------------------------
  var A = HG.aktionen;
  var altLesen = A.lesen;
  A.lesen = function (ctx) {
    if (ctx.obj && D(ctx.obj).buch) { B.oeffne(ctx.obj, ctx); return; }
    altLesen(ctx);
  };
  A.buchseite = function (ctx) { B.blaettere(ctx.buchZiel || 'weiter', ctx); };
})(window.HG);
