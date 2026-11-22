// Haus Grest – Engine: Handy
// Nachrichten, Anrufe, Fotos und Kontakte. Das Handy ist ein normales Ding mit
// "istHandy: true" (siehe js/content/handy.js).
//
// Inhalte:
//   HG.nachricht('id', { von: 'Dr. Brandt', text: '…', falsch: true })   // falsch = vom Haus gefälscht (nur Info für Autoren)
//   HG.anruf('id', { von: 'Carsten Häuser', text: '…', nerven: '1/1W6', danach: function (api) {…} })
//   HG.kontakt('id', { name: 'Dr. Brandt (Notar)', woerter: ['notar','brandt'], rueckruf: { tag: '…', nacht: '…' } })
// Auslösen: api.nachricht('id'), api.anruf('id') – z. B. in beimBetreten, Spuk oder Haken.
(function (HG) {
  'use strict';

  var T = HG.text, W = HG.welt;
  function Z() { return HG.zustand.z; }
  function D(id) { return HG.daten.dinge[id]; }
  function hz() { var z = Z(); if (!z.handy) z.handy = { nachrichten: [], anrufe: [], fotos: [], klingelt: null }; return z.handy; }

  var H = HG.handy = {
    id: function () {
      var ids = Object.keys(HG.daten.dinge).filter(function (k) { return D(k).istHandy; });
      return ids[0] || null;
    },
    dabei: function () { var id = H.id(); return !!id && W.getragen(id); },
    ungelesen: function () { return hz().nachrichten.filter(function (n) { return !n.gelesen; }).length; },

    /** Neue Nachricht empfangen. */
    nachricht: function (nid) {
      var d = HG.daten.nachrichten[nid];
      if (!d) return false;
      if (!d.wiederholbar && hz().nachrichten.some(function (n) { return n.id === nid; })) return false;
      // Gefälschte Nachricht = Handlung des Hauses: kostet MACHT (außer im Spuk-Ereignis schon bezahlt)
      if (d.falsch && HG.macht && !HG.macht._imSpuk) HG.macht.verbrauche(HG.macht.kosten('nachricht'));
      hz().nachrichten.push({ id: nid, zeit: HG.zeit.text(), gelesen: false });
      if (H.dabei()) HG.medien.effekt('handy-vibriert');
      if (H.dabei()) HG.ausgabe.schreibe('handy', HG.wert(HG.daten.spiel.vibrierText, HG.api) ? HG.wert(HG.daten.spiel.vibrierText, HG.api).replace('%VON%', T.esc(HG.wert(d.von, HG.api)))
        : 'Dein Handy vibriert. Neue Nachricht von <b>' + T.esc(HG.wert(d.von, HG.api)) + '</b>. <span class="nebenbei">(„lies nachrichten“)</span>');
      return true;
    },

    /** Eingehender Anruf: klingelt bis zum nächsten Zug. */
    anruf: function (aid) {
      var d = HG.daten.anrufe[aid];
      if (!d) return false;
      if (!d.wiederholbar && hz().anrufe.some(function (a) { return a.id === aid; })) return false;
      if (d.falsch && HG.macht && !HG.macht._imSpuk) HG.macht.verbrauche(HG.macht.kosten('anruf'));
      if (!H.dabei()) { hz().anrufe.push({ id: aid, zeit: HG.zeit.text(), status: 'verpasst' }); return true; }
      hz().klingelt = { id: aid, zug: Z().zug };
      HG.medien.effekt('handy-klingelt');
      HG.ausgabe.schreibe('handy', 'Dein Handy klingelt. Auf dem Display: <b>' + T.esc(HG.wert(d.von, HG.api)) + '</b>. <span class="nebenbei">(„geh ran“ oder „ignoriere“)</span>');
      return true;
    },

    /** Am Zugende: nicht angenommene Anrufe verfallen. */
    zug: function () {
      var k = hz().klingelt;
      if (k && k.zug < Z().zug) {
        hz().klingelt = null;
        hz().anrufe.push({ id: k.id, zeit: HG.zeit.text(), status: 'verpasst' });
        HG.ausgabe.schreibe('handy', 'Das Klingeln verstummt. <span class="nebenbei">(Verpasster Anruf)</span>');
      }
    },

    rangehen: function () {
      var k = hz().klingelt;
      if (!k) { HG.ausgabe.text('Dein Handy klingelt gerade nicht.'); return; }
      var d = HG.daten.anrufe[k.id];
      hz().klingelt = null;
      hz().anrufe.push({ id: k.id, zeit: HG.zeit.text(), status: 'angenommen' });
      HG.ausgabe.schreibe('anruf', '<b>' + T.esc(HG.wert(d.von, HG.api)) + ':</b> ' + HG.wert(d.text, HG.api));
      var n = HG.wert(d.nerven, HG.api);
      if (typeof n === 'string') HG.api.nervenProbe(n, { grund: 'Anruf' });
      else if (n) HG.api.nerven(n, 'Schrecken');
      if (d.hinweis) HG.api.hinweis(d.hinweis);
      if (d.danach) d.danach(HG.api);
    },

    ablehnen: function () {
      var k = hz().klingelt;
      if (!k) { HG.ausgabe.text('Dein Handy klingelt gerade nicht.'); return; }
      hz().klingelt = null;
      hz().anrufe.push({ id: k.id, zeit: HG.zeit.text(), status: 'abgelehnt' });
      HG.ausgabe.text('Du drückst den Anruf weg. Das Display wird schwarz.');
    },

    anrufen: function (tokens) {
      if (!H.dabei()) { HG.ausgabe.text('Du hast dein Handy nicht dabei.'); return; }
      var w = (tokens || []).filter(function (t) { return !/^(der|die|das|den|dem|bei|mit|herrn|frau|herr)$/.test(t); });
      if (!w.length) { HG.ausgabe.text('Wen willst du anrufen? Deine Kontakte: ' + T.liste(Object.keys(HG.daten.kontakte).map(function (k) { return HG.daten.kontakte[k].name; })) + '.'); return; }
      var kid = Object.keys(HG.daten.kontakte).filter(function (k) {
        var d = HG.daten.kontakte[k];
        var wl = (d.woerter || []).concat(T.norm(d.name).split(/[\s()]+/)).map(T.norm);
        return w.every(function (x) { return wl.indexOf(x) >= 0; });
      })[0];
      if (!kid || (HG.daten.kontakte[kid].bedingung && !HG.daten.kontakte[kid].bedingung(HG.api))) { HG.ausgabe.text('Diese Nummer hast du nicht.'); return; }
      var d = HG.daten.kontakte[kid];
      hz().anrufe.push({ kontakt: kid, zeit: HG.zeit.text(), status: 'ausgehend' });
      HG.ausgabe.schreibe('anruf', 'Du rufst <b>' + T.esc(d.name) + '</b> an. ' + (HG.wert(d.rueckruf, HG.api) || 'Es klingelt und klingelt. Niemand nimmt ab.'));
      if (d.danach) d.danach(HG.api);
    },

    zeigeNachrichten: function () {
      var n = hz().nachrichten;
      if (!n.length) { HG.ausgabe.text('Keine Nachrichten.'); return; }
      var html = '';
      n.forEach(function (m) {
        var d = HG.daten.nachrichten[m.id];
        html += '<div class="sms' + (m.gelesen ? '' : ' neu') + '"><span class="von">' + T.esc(HG.wert(d.von, HG.api)) + '</span> <span class="wann">' + m.zeit + '</span><div>' + HG.wert(d.text, HG.api) + '</div></div>';
        if (!m.gelesen && d.hinweis) HG.api.hinweis(d.hinweis);
        m.gelesen = true;
      });
      HG.ausgabe.schreibe('handy', html);
    },

    zeigeAnrufe: function () {
      var a = hz().anrufe;
      if (!a.length) { HG.ausgabe.text('Keine Anrufe.'); return; }
      var STATUS = { verpasst: 'verpasst', angenommen: 'angenommen', abgelehnt: 'abgelehnt', ausgehend: 'ausgehend' };
      HG.ausgabe.schreibe('handy', '<b>Anrufliste</b><br>' + a.map(function (x) {
        var wer = x.kontakt ? HG.daten.kontakte[x.kontakt].name : HG.wert(HG.daten.anrufe[x.id].von, HG.api);
        return T.esc(wer) + ' – ' + STATUS[x.status] + ' <span class="wann">(' + x.zeit + ')</span>';
      }).join('<br>'));
    },

    zeigeFotos: function () {
      var f = hz().fotos;
      if (!f.length) { HG.ausgabe.text('Noch keine Fotos.'); return; }
      HG.ausgabe.schreibe('handy', '<b>Fotos</b><br>' + f.map(function (x, i) {
        return (i + 1) + '. <b>' + x.titel + '</b> <span class="wann">(' + x.zeit + ')</span> – ' + x.text;
      }).join('<br>'));
    },

    /** Foto von einem Ding (id) oder vom Raum (null). */
    foto: function (id, ctx) {
      if (!H.dabei()) { HG.ausgabe.text('Du hast dein Handy nicht dabei.'); return; }
      var r = W.raum(), titel, text;
      if (ctx && ctx.reflexiv && !id) {
        titel = 'Selfie';
        text = HG.wert(r.selfie, HG.api) || HG.wert(HG.daten.spiel.selfieText, HG.api) || 'Ein müdes Gesicht schaut dich an.';
      } else if (!W.hell() && !(id && W.getragen(id))) {
        titel = id ? T.gross(T.name(id, 'nom', '')) : r.name;
        text = HG.wert(r.fotoDunkel, HG.api) || 'Der Blitz zuckt durch die Dunkelheit. Auf dem Foto: nur Schwärze und ein paar körnige Schatten.';
      } else if (id) {
        titel = T.gross(T.name(id, 'nom', ''));
        text = HG.wert(D(id).foto, HG.api, ctx) || null;
        if (!text) {
          var b = HG.wert(D(id).beschreibung, HG.api, ctx) || '';
          text = b.split(/(?<=[.!?])\s/)[0] || titel;
        }
      } else {
        titel = r.name;
        text = HG.wert(r.foto, HG.api) || (r.name + ', festgehalten.');
      }
      hz().fotos.push({ id: id || r.id, titel: titel, text: text, zeit: HG.zeit.text() });
      HG.ausgabe.text('Klick. ' + (id ? 'Du fotografierst ' + T.der(id, 'akk') + '.' : 'Du machst ein Foto.') + ' <span class="nebenbei">Auf dem Display:</span> <i>' + text + '</i>');
      if (id && D(id).fotoHinweis) HG.api.hinweis(D(id).fotoHinweis);
    }
  };

  // ------------------------------------------------------------------
  // Handlungen
  // ------------------------------------------------------------------
  var A = HG.aktionen;
  A.nachrichten = function () { if (!H.dabei()) { HG.ausgabe.text('Du hast dein Handy nicht dabei.'); return; } H.zeigeNachrichten(); };
  A.fotos = function () { if (!H.dabei()) { HG.ausgabe.text('Du hast dein Handy nicht dabei.'); return; } H.zeigeFotos(); };
  A.anrufliste = function () { if (!H.dabei()) { HG.ausgabe.text('Du hast dein Handy nicht dabei.'); return; } H.zeigeAnrufe(); };
  A.rangehen = function () { H.rangehen(); };
  A.ablehnen = function () { H.ablehnen(); };
  A.anrufen = function (ctx) { H.anrufen(ctx.np1); };
  A.fotografieren = function (ctx) { H.foto(ctx.obj || null, ctx); };

  /** Welcher Teil des Handys ist gemeint? ("lies nachrichten", "schau fotos an") */
  function handyTeil(ctx) {
    var w = (ctx.np1 || []).join(' ');
    if (/foto|galerie|bilder/.test(w)) return 'fotos';
    if (/anruf/.test(w)) return 'anrufe';
    if (/nachricht|sms|posteingang/.test(w)) return 'nachrichten';
    return null;
  }
  function zeigeTeil(teil) {
    if (teil === 'fotos') H.zeigeFotos(); else if (teil === 'anrufe') H.zeigeAnrufe(); else H.zeigeNachrichten();
  }
  ['lesen', 'untersuchen', 'benutzen', 'hineinschauen'].forEach(function (a) {
    var alt = A[a];
    A[a] = function (ctx) {
      if (ctx.obj && D(ctx.obj).istHandy && !ctx.obj2) {
        var teil = handyTeil(ctx);
        if (teil || a !== 'untersuchen') { zeigeTeil(teil); return; }
      }
      alt(ctx);
    };
  });
})(window.HG);
