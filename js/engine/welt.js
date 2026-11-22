// Haus Grest – Engine: Weltmodell
// Orte, Sichtbarkeit (Umfeld), Licht/Dunkelheit, Raumbeschreibung, Verstecke.
(function (HG) {
  'use strict';

  var T = HG.text;
  function Z() { return HG.zustand.z; }
  function eig(id, k) { return HG.zustand.eig(id, k); }
  function D(id) { return HG.daten.dinge[id]; }

  var RICHTUNGEN = {
    norden: { name: 'Norden', nach: 'nach Norden', kurz: ['n', 'nord', 'norden'] },
    sueden: { name: 'Süden', nach: 'nach Süden', kurz: ['s', 'sued', 'sueden'] },
    osten: { name: 'Osten', nach: 'nach Osten', kurz: ['o', 'ost', 'osten'] },
    westen: { name: 'Westen', nach: 'nach Westen', kurz: ['w', 'west', 'westen'] },
    nordosten: { name: 'Nordosten', nach: 'nach Nordosten', kurz: ['no', 'nordost', 'nordosten'] },
    nordwesten: { name: 'Nordwesten', nach: 'nach Nordwesten', kurz: ['nw', 'nordwest', 'nordwesten'] },
    suedosten: { name: 'Südosten', nach: 'nach Südosten', kurz: ['so', 'suedost', 'suedosten'] },
    suedwesten: { name: 'Südwesten', nach: 'nach Südwesten', kurz: ['sw', 'suedwest', 'suedwesten'] },
    hoch: { name: 'nach oben', nach: 'nach oben', kurz: ['hoch', 'oben', 'rauf', 'hinauf', 'herauf', 'aufwaerts', 'u'] },
    runter: { name: 'nach unten', nach: 'nach unten', kurz: ['runter', 'unten', 'hinunter', 'herunter', 'hinab', 'abwaerts', 'r'] },
    hinein: { name: 'hinein', nach: 'hinein', kurz: ['hinein', 'rein', 'herein'] },
    hinaus: { name: 'hinaus', nach: 'hinaus', kurz: ['hinaus', 'raus', 'heraus', 'draussen'] }
  };
  var RICHTUNG_WORT = {};
  Object.keys(RICHTUNGEN).forEach(function (r) {
    RICHTUNGEN[r].kurz.forEach(function (w) { RICHTUNG_WORT[w] = r; });
  });

  var HALTUNG = { liegt: 'liegen', steht: 'stehen', 'hängt': 'hängen', lehnt: 'lehnen' };

  var W = HG.welt = {
    RICHTUNGEN: RICHTUNGEN,
    RICHTUNG_WORT: RICHTUNG_WORT,

    raum: function (id) { return HG.daten.raeume[id || Z().raum]; },

    istRaum: function (id) { return !!HG.daten.raeume[id]; },

    /** Trägt der Spieler das Ding (auch in einem getragenen Behälter)? */
    getragen: function (id) {
      var o = eig(id, 'ort'), n = 0;
      while (o && n++ < 20) {
        if (o === 'spieler') return true;
        if (W.istRaum(o)) return false;
        o = eig(o, 'ort');
      }
      return false;
    },
    /** Direkt in der Hand (nicht in einem Behälter)? */
    inHand: function (id) { return eig(id, 'ort') === 'spieler'; },

    /** In welchem Raum befindet sich das Ding? */
    raumVon: function (id) {
      var d = D(id);
      if (d && d.orte) return d.orte.indexOf(Z().raum) >= 0 ? Z().raum : d.orte[0];
      var o = eig(id, 'ort'), n = 0;
      while (o && n++ < 20) {
        if (o === 'spieler') return Z().raum;
        if (W.istRaum(o)) return o;
        o = eig(o, 'ort');
      }
      return null;
    },

    /** Alle Dinge direkt an einem Ort (ohne versteckte). */
    kinder: function (ortId, rel) {
      var erg = [];
      Object.keys(HG.daten.dinge).forEach(function (id) {
        if (eig(id, 'ort') !== ortId) return;
        if (eig(id, 'versteckt')) return;
        if (rel && (eig(id, 'rel') || 'in') !== rel) return;
        erg.push(id);
      });
      return erg;
    },

    /** Kann man in das Ding hineinsehen bzw. hineingreifen? */
    innenZugaenglich: function (id) {
      if (D(id) && D(id).behaelter) return !D(id).oeffenbar || !!eig(id, 'offen') || !!D(id).durchsichtig;
      return false;
    },

    /** Rekursiv: alles, was an/in einem Ort sichtbar ist. */
    sammle: function (ortId, liste) {
      liste = liste || [];
      W.kinder(ortId).forEach(function (id) {
        liste.push(id);
        if (D(id).ablage) W.kinder(id, 'auf').forEach(function (k) { liste.push(k); W.sammle(k, liste); });
        if (W.innenZugaenglich(id)) W.kinder(id, 'in').forEach(function (k) { liste.push(k); W.sammle(k, liste); });
      });
      return liste.filter(function (v, i, a) { return a.indexOf(v) === i; });
    },

    /** Türen und mehrfach vorhandene Dinge (Definition mit "orte"). */
    mehrortDinge: function (raumId) {
      return Object.keys(HG.daten.dinge).filter(function (id) {
        var o = D(id).orte; return o && o.indexOf(raumId) >= 0 && !eig(id, 'versteckt');
      });
    },

    inventar: function () { return W.sammle('spieler'); },

    /** Ist es im aktuellen Raum hell? */
    hell: function (raumId) {
      raumId = raumId || Z().raum;
      var r = W.raum(raumId);
      if (!r) return true;
      if (!HG.wert(r.dunkel)) return true;
      var nah = W.sammle(raumId).concat(W.inventar());
      return nah.some(function (id) { return D(id).lichtquelle && eig(id, 'brennt'); });
    },

    /**
     * Das Umfeld: alle Dinge, auf die sich ein Befehl beziehen kann.
     * Im Dunkeln nur das Getragene – außer bei "blinden" Handlungen (tasten, horchen ...).
     */
    umfeld: function (blind) {
      var raumId = Z().raum;
      var liste = W.inventar();
      if (W.hell(raumId) || blind) {
        liste = liste.concat(W.sammle(raumId), W.mehrortDinge(raumId));
      } else {
        // Dinge, die man auch im Dunkeln findet (z. B. eine Lampenschnur): imDunkeln: true
        liste = liste.concat(W.sammle(raumId).filter(function (id) { return D(id).imDunkeln; }));
      }
      return liste.filter(function (v, i, a) { return a.indexOf(v) === i; });
    },
    imUmfeld: function (id, blind) { return W.umfeld(blind).indexOf(id) >= 0; },

    // --- Verstecktes aufdecken ----------------------------------------
    /** Deckt alles auf, was bei "beiId" mit der Handlung "modus" zu finden ist. */
    enthuelle: function (beiId, modus) {
      var gefunden = [];
      Object.keys(HG.daten.dinge).forEach(function (id) {
        var v = eig(id, 'versteckt');
        if (!v || v.bei !== beiId) return;
        if ((v.wie || []).indexOf(modus) < 0) return;
        HG.zustand.setze(id, 'versteckt', false);
        gefunden.push(id);
        var txt = HG.wert(v.text, HG.api);
        HG.ausgabe.text(txt || ('Du findest ' + T.ein(id, 'akk') + '.'));
        if (v.hinweis) HG.api.hinweis(v.hinweis);
        HG.api.merkePronomen(id);
      });
      return gefunden;
    },

    // --- Beschreibungen -------------------------------------------------
    /** "In der Schublade liegt ein Brief." – oder "" wenn leer. */
    inhaltSatz: function (behId, rel) {
      rel = rel || (D(behId).ablage && !D(behId).behaelter ? 'auf' : 'in');
      var ks = W.kinder(behId, rel).filter(function (k) { return !D(k).szenerie; });
      if (!ks.length) return '';
      var verb = ks.length === 1 ? (D(ks[0]).haltung || 'liegt') : 'liegen';
      if (ks.length === 1 && D(ks[0]).genus === 'pl') verb = HALTUNG[verb] || verb;
      var praep = rel === 'auf' ? 'Auf' : 'In';
      return praep + ' ' + T.der(behId, 'dat') + ' ' + verb + ' ' + T.liste(ks.map(function (k) { return T.ein(k, 'nom'); })) + '.';
    },

    ausgangsText: function (raumId) {
      var r = W.raum(raumId);
      var richt = Object.keys(r.ausgaenge || {}).filter(function (k) {
        var a = r.ausgaenge[k];
        return !(a && typeof a === 'object' && a.unsichtbar);
      });
      if (!richt.length) return '';
      return 'Ausgänge: ' + T.liste(richt.map(function (k) { return RICHTUNGEN[k] ? RICHTUNGEN[k].name : k; })) + '.';
    },

    /** Raum beschreiben. voll=false zeigt bei bekannten Räumen die Kurzfassung. */
    beschreibeRaum: function (voll) {
      var z = Z(), r = W.raum();
      HG.ausgabe.titel(r.name);
      if (!W.hell()) {
        HG.ausgabe.text(HG.wert(r.dunkelText) || HG.daten.spiel.dunkelText || 'Es ist stockfinster. Du kannst nichts sehen.');
        return;
      }
      var kurz = !voll && z.besucht[r.id] && r.kurz;
      var teile = [HG.wert(kurz ? r.kurz : r.beschreibung, HG.api)];

      // Lose Dinge im Raum
      var lose = W.kinder(r.id).filter(function (id) { return !D(id).szenerie && !D(id).orte; });
      var ohneText = [];
      lose.forEach(function (id) {
        var ht = HG.wert(D(id).hierText, HG.api);
        if (ht) teile.push(ht); else ohneText.push(id);
      });
      if (ohneText.length) {
        teile.push('Hier ' + (ohneText.length === 1 && D(ohneText[0]).genus !== 'pl' ? (D(ohneText[0]).haltung || 'liegt') : 'liegen') +
          ' ' + T.liste(ohneText.map(function (id) { return T.ein(id, 'nom'); })) + '.');
      }
      // Dinge auf Ablagen und in offenen Behältern (eine Ebene tief)
      W.kinder(r.id).forEach(function (id) {
        if (D(id).ablage) { var s = W.inhaltSatz(id, 'auf'); if (s) teile.push(s); }
        if (D(id).behaelter && D(id).oeffenbar && eig(id, 'offen')) { var s2 = W.inhaltSatz(id, 'in'); if (s2) teile.push(s2); }
        // Ablagen auf Ablagen (z. B. Schublade an der Kommode)
        W.kinder(id).forEach(function (k) {
          if (D(k).behaelter && D(k).oeffenbar && eig(k, 'offen')) { var s3 = W.inhaltSatz(k, 'in'); if (s3) teile.push(s3); }
        });
      });
      HG.ausgabe.text(teile.filter(Boolean).join(' '));
      var a = W.ausgangsText(r.id);
      if (a) HG.ausgabe.text('<span class="ausgaenge">' + a + '</span>');
    },

    /** Daten für die Karte: besuchte Räume und ihre Verbindungen. */
    kartenDaten: function () {
      var z = Z(), raeume = [], wege = [];
      Object.keys(HG.daten.raeume).forEach(function (id) {
        var r = HG.daten.raeume[id];
        if (!r.karte || !z.besucht[id]) return;
        if ((r.schauplatz || null) !== (W.raum().schauplatz || null)) return; // nur der aktuelle Schauplatz
        raeume.push({ id: id, name: r.name, x: r.karte.x, y: r.karte.y, hier: id === z.raum });
        Object.keys(r.ausgaenge || {}).forEach(function (k) {
          var a = r.ausgaenge[k];
          var ziel = typeof a === 'string' ? a : a && a.ziel;
          var zr = ziel && HG.daten.raeume[ziel];
          if (zr && zr.karte && zr.schauplatz === r.schauplatz) wege.push({ von: id, nach: ziel, bekannt: !!z.besucht[ziel], richtung: k });
          else if (!a || !a.unsichtbar) wege.push({ von: id, nach: null, richtung: k });
        });
      });
      return { raeume: raeume, wege: wege };
    }
  };
})(window.HG);
