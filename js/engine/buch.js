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
//
// Gesperrte Seiten (z. B. fahrig geschrieben, verklebt): Seite mit
//   gesperrt: { frei: function (api) { … }, text: 'was man stattdessen sieht' }
// Solange frei() nicht stimmt und das Buch nicht entziffert ist, zeigt die Seite den Ersatztext, gilt nicht als
// gelesen und gibt keinen Hinweis. Entziffern per Probe ("entziffere tagebuch"):
//   buch: { entziffern: { wer: ['ve', 'geschichte'], mod: -20, dauer: 20, erfolg: 'Text', misserfolg: 'Text',
//           tipps: { 2: …, 3: … } } }   – geprobt wird mit dem besseren der Werte; Erfolg gilt fürs ganze Buch.
// Seiten, die sich erst später füllen (Carstens Tagebuch in Stufen, David 27.11.2026): Seite mit
//   erscheint: function (api) { … }      – bis dahin ist sie leer (buch.leerText), ohne Titel, ohne Hinweis
//   bedingung: function (api) { … }      – (wie bisher) ohne Bedingung fehlt die Seite ganz, auch nicht leer
//   nachText: '…'                        – Erzähltext UNTER der Seite (z. B. „Hier wird die Schrift fahrig …“)
// Füllen sich Seiten, ruft die Engine nach dem Zug buch.gefuellt(api, { seiten, getragen, hier, gelesen }) – der
// Inhalt erzählt den Moment; beim nächsten Aufschlagen buch.neuBeimOeffnen(api, seiten) (Text) und es geht zur
// ersten neuen Seite.
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

    /** Ist die Seite schon beschrieben? (Seiten mit erscheint: erst, wenn es so weit ist) */
    erschienen: function (s) { return !s.erscheint || !!s.erscheint(HG.api); },
    /** Titel einer Seite – leere Seiten haben keinen. */
    titel: function (id, x) { return B.erschienen(x.s) ? x.s.titel : '(leer)'; },
    /** Ist die Seite lesbar? (beschrieben, nicht gesperrt bzw. Bedingung erfüllt oder das Buch entziffert) */
    frei: function (id, s) {
      if (!B.erschienen(s)) return false;
      if (!s.gesperrt) return true;
      return !!bz(id).entziffert || !!HG.wert(s.gesperrt.frei, HG.api);
    },
    /** Text einer Seite – bei gesperrten Seiten der Ersatztext. */
    text: function (id, x) {
      if (!B.erschienen(x.s)) return HG.wert(D(id).buch.leerText, HG.api) || '<i>(Diese Seite ist leer.)</i>';
      return B.frei(id, x.s) ? HG.wert(x.s.text, HG.api)
        : HG.wert(x.s.gesperrt.text, HG.api) + ' <span class="nebenbei">(„entziffere ' + D(id).nomen.toLowerCase() + '“)</span>';
    },
    /** Gibt es noch gesperrte Seiten? */
    hatGesperrte: function (id) { return B.seiten(id).some(function (x) { return B.erschienen(x.s) && !B.frei(id, x.s); }); },
    /** Beschriebene Seiten (ohne leere). */
    beschrieben: function (id) { return B.seiten(id).filter(function (x) { return B.erschienen(x.s); }); },

    /** Nach jedem Zug: Haben sich Seiten gefüllt? Dann erzählt der Inhalt den Moment (buch.gefuellt). */
    zug: function () {
      var z = Z(); if (!z) return;
      Object.keys(HG.daten.dinge).forEach(function (id) {
        var b = D(id).buch;
        if (!b || !b.seiten.some(function (s) { return s.erscheint; })) return;
        var da = B.seiten(id).filter(function (x) { return x.s.erscheint && B.erschienen(x.s); }).map(function (x) { return x.i; });
        if (!z.buchSeiten) z.buchSeiten = {};
        var alt = z.buchSeiten[id] || [], neu = da.filter(function (i) { return alt.indexOf(i) < 0; });
        z.buchSeiten[id] = da;
        if (!neu.length) return;
        var st = z.buecher && z.buecher[id], gelesen = !!(st && st.gelesen && st.gelesen.length);
        if (gelesen) { st.neueSeiten = (st.neueSeiten || []).concat(neu); }
        if (b.gefuellt) b.gefuellt(HG.api, { seiten: neu, getragen: W.getragen(id), hier: W.umfeld().indexOf(id) >= 0, gelesen: gelesen });
      });
    },

    /** Fahrige oder verklebte Seiten per Probe entziffern. */
    entziffere: function (id, ctx) {
      var e = D(id).buch.entziffern || {}, api = HG.api;
      if (!B.hatGesperrte(id)) { HG.ausgabe.text('Du kannst alles in ' + T.der(id, 'dat') + ' lesen, was es zu lesen gibt.'); return; }
      if (!W.hell()) { HG.ausgabe.text('Es ist zu dunkel zum Lesen.'); return; }
      var wer = [].concat(e.wer || ['ve']).sort(function (a, b) { return HG.proben.basis(b) - HG.proben.basis(a); })[0];
      if (ctx) ctx.dauer = e.dauer === undefined ? 20 : e.dauer;
      var p = api.probe(wer, { mod: e.mod || 0, modGrund: e.modGrund || 'schwer lesbar', grund: e.grund || 'Schrift entziffern', beruf: e.beruf });
      if (p.erfolg) {
        bz(id).entziffert = true;
        HG.ausgabe.text(HG.wert(e.erfolg, api) || 'Wort für Wort setzt du die Zeilen zusammen. Jetzt kannst du die Seiten lesen.');
        var liste = B.seiten(id), erste = liste.filter(function (x) { return x.s.gesperrt && B.frei(id, x.s) && bz(id).gelesen.indexOf(x.i) < 0; })[0];
        if (erste) B.lies(id, liste.indexOf(erste), null);
      } else {
        HG.ausgabe.text(HG.wert(e.misserfolg, api) || 'Die Buchstaben verschwimmen. Du bekommst kaum ein Wort zusammen.');
        if (e.tipps) api.fehlversuch('entziffern_' + id, e.tipps);
      }
    },

    /** Buch aufschlagen. */
    oeffne: function (id, ctx) {
      if (!W.hell()) { HG.ausgabe.text('Es ist zu dunkel zum Lesen.'); return; }
      Z().buchOffen = id;
      var b = D(id).buch, liste = B.seiten(id), st = bz(id);
      // beim ersten Öffnen: erste Seite; sonst die erste ungelesene (beschriebene)
      var naechste = liste.filter(function (x) { return B.erschienen(x.s) && st.gelesen.indexOf(x.i) < 0; })[0];
      var pos = naechste ? liste.indexOf(naechste) : 0;
      var neue = (st.neueSeiten || []).slice();
      st.neueSeiten = [];
      if (neue.length && b.neuBeimOeffnen) HG.ausgabe.text(HG.wert(b.neuBeimOeffnen, HG.api, neue));
      var anzahl = B.beschrieben(id).length;
      HG.ausgabe.text('Du schlägst ' + T.der(id, 'akk') + ' auf. ' + anzahl + (anzahl === 1 ? ' beschriebene Seite' : ' beschriebene Seiten') +
        (anzahl < liste.length ? ', ' + (liste.length - anzahl) + ' leer' : '') + '.' +
        (B.hatOberflaeche() ? '' : ' <span class="nebenbei">(„lies eintrag 1“ … „lies eintrag ' + liste.length + '“, „blättere weiter“)</span>'));
      if (!B.hatOberflaeche()) {
        HG.ausgabe.schreibe('buchinhalt', '<b>' + b.titel + '</b><ol>' + liste.map(function (x) {
          return '<li>' + B.titel(id, x) + (st.gelesen.indexOf(x.i) >= 0 ? ' ✓' : '') + '</li>';
        }).join('') + '</ol>');
      }
      B.lies(id, pos, ctx);
    },

    /** Seite (Position in der Liste der sichtbaren Seiten) lesen. */
    lies: function (id, pos, ctx) {
      var b = D(id).buch, liste = B.seiten(id), st = bz(id);
      if (pos < 0 || pos >= liste.length) { HG.ausgabe.text(pos < 0 ? 'Das ist schon die erste Seite.' : 'Danach sind die Seiten leer.'); return; }
      var x = liste[pos], frei = B.frei(id, x.s), neu = frei && st.gelesen.indexOf(x.i) < 0;
      st.seite = pos;
      Z().buchOffen = id;
      var wieder = Z().buchOffen === id && st.seite === pos && st._zuletzt === pos;
      HG.medien.effekt('seite');
      if (ctx) ctx.dauer = neu ? (b.dauerProSeite === undefined ? 2 : b.dauerProSeite) : 1;
      var text = B.text(id, x);
      if (neu) st.gelesen.push(x.i); // vor der Anzeige, damit das Lesezeichen ein Häkchen bekommt
      if (B.hatOberflaeche()) {
        // dieselbe Seite gleich noch einmal (Doppelklick, Pfeiltaste am Ende) nicht erneut in den Verlauf schreiben
        if (!wieder) HG.ausgabe.text('<span class="nebenbei">📖 ' + T.esc(b.titel) + ', Seite ' + (pos + 1) + ' von ' + liste.length + ': ' + B.titel(id, x) + '</span>');
        HG.anzeige.zeigeBuch(id);
      } else {
        HG.ausgabe.schreibe('schrift', (B.erschienen(x.s) ? '<b>' + x.s.titel + '</b><br>' : '') + text, { stil: x.s.schrift || b.schrift || 'hand' });
      }
      st._zuletzt = pos;
      if (x.s.nachText && frei && !wieder) HG.ausgabe.text(HG.wert(x.s.nachText, HG.api));
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
        liste.forEach(function (x, i) { if (pos < 0 && B.erschienen(x.s) && T.norm(x.s.titel).indexOf(ziel.tag + '. ' + ziel.monat) === 0) pos = i; });
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
  A.entziffern = function (ctx) {
    var id = (ctx.obj && D(ctx.obj).buch) ? ctx.obj : B.aktuell();
    if (!id) { HG.ausgabe.text('Hier gibt es nichts, was du entziffern müsstest.'); return; }
    B.entziffere(id, ctx);
  };
})(window.HG);
