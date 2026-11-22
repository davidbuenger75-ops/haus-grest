// Haus Grest – Engine: Spielablauf
// Nimmt Eingaben entgegen, löst sie auf, führt Handlungen aus, verwaltet
// Rückfragen, Meta-Befehle, Notizbuch, Spielende und Vorschläge.
(function (HG) {
  'use strict';

  var T = HG.text, W = HG.welt, P = HG.parser;
  function Z() { return HG.zustand.z; }
  function eig(id, k) { return HG.zustand.eig(id, k); }
  function D(id) { return HG.daten.dinge[id]; }

  // ---------------------------------------------------------------
  // Ausgabe: sammelt Blöcke; die Anzeige (anzeige.js) hängt sich ein.
  // ---------------------------------------------------------------
  HG.ausgabe = {
    ziel: null,
    puffer: null, // während einer Handlung: Wert-/Hinweis-Meldungen sammeln
    schreibe: function (typ, html, extra) {
      if (typ !== 'eingabe') html = T.fuelle(html);
      var b = Object.assign({ typ: typ, html: html }, extra || {});
      if (this.puffer && (typ === 'wert' || typ === 'hinweis' || typ === 'andeutung' || typ === 'ziel')) { this.puffer.push(b); return; }
      if (this.ziel) this.ziel(b);
      if (this.mitschnitt) this.mitschnitt.push(b);
    },
    leere: function () {
      var p = this.puffer || []; this.puffer = null;
      p.forEach(function (b) { this.schreibe(b.typ, b.html, b); }, this);
    },
    praefix: '', // z. B. '<b>Kerze:</b> ' bei 'nimm Kerze und Brief'
    text: function (h) { if (h) { this.schreibe('text', this.praefix + h); this.praefix = ''; } },
    titel: function (h) { this.schreibe('titel', h); },
    system: function (h) { this.schreibe('system', h); },
    schrift: function (h, stil) { this.schreibe('schrift', h, stil ? { stil: stil } : null); },
    hinweis: function (h) { this.schreibe('hinweis', h); },
    wert: function (h, extra) { this.schreibe('wert', h, extra); },
    eingabe: function (h) { this.schreibe('eingabe', h); },
    frage: function (h) { this.schreibe('frage', h); },
    abschnitt: function (nr, h) { this.schreibe('abschnitt', h, { nr: nr }); },
    ende: function (h) { this.schreibe('ende', h); }
  };

  var WERTNAME = { geschick: 'GESCHICK', ausdauer: 'AUSDAUER', nerven: 'NERVEN' };
  // Handlungen, die im Spielzustand (z.getan) gemerkt werden; Menü-Verben, die Erledigtes in einen
  // eingeklappten Bereich schieben (Verb der Leiste -> Aktion und Überschrift)
  var MERKEN = ['lesen', 'untersuchen'];
  var ERLEDIGT_MENUE = {
    lies: { aktion: 'lesen', titel: 'Bereits gelesen' },
    untersuche: { aktion: 'untersuchen', titel: 'Bereits untersucht' }
  };

  // ---------------------------------------------------------------
  // api: Werkzeugkasten für die Inhaltsdateien (Haken bekommen "api")
  // ---------------------------------------------------------------
  var api = HG.api = {
    sage: function (h) { HG.ausgabe.text(h); },
    schrift: function (h, stil) { HG.ausgabe.schrift(h, stil); },
    abschnitt: function (nr, h) { HG.ausgabe.abschnitt(nr, h); },
    raum: function () { return Z().raum; },
    zug: function () { return Z().zug; },
    hell: function () { return W.hell(); },

    wert: function (name) { return Z().werte[name]; },
    aendere: function (name, delta, grund, still) {
      var z = Z(), alt = z.werte[name];
      var neu = Math.max(0, Math.min(z.max[name], alt + delta));
      z.werte[name] = neu;
      if (name === 'nerven' && neu < alt && HG.macht) HG.macht.nervenVerlust(alt - neu);   // Angst nährt das Haus
      if (neu !== alt && still) { if (HG.anzeige && HG.anzeige.blitz) HG.anzeige.blitz(name, delta); }
      else if (neu !== alt) {
        HG.ausgabe.wert((delta < 0 ? '−' : '+') + Math.abs(neu - alt) + ' ' + WERTNAME[name] +
          (grund ? ' <span class="grund">(' + grund + ')</span>' : '') + ' – jetzt ' + neu, { wert: name, delta: delta });
        if (HG.anzeige && HG.anzeige.blitz) HG.anzeige.blitz(name, delta);
      }
      return neu;
    },
    // --- MACHT des Hauses und Spiegel (js/engine/macht.js) ---
    /** 'stark' | 'mittel' | 'schwach' – damit Texte stärker oder schwächer ausfallen können */
    machtStufe: function () { return HG.macht.stufe(); },
    /** Das Haus handelt (z. B. 'feuerwehr', 'heraustreten'): zahlt MACHT, falls genug da ist. true = es geschieht. */
    hausHandelt: function (art, spiegelGroesse) {
      var k = HG.macht.kosten(art, spiegelGroesse);
      if (!HG.macht.kannZahlen(k)) return false;
      HG.macht.verbrauche(k); return true;
    },
    /** Größter intakter Spiegel in der Nähe (mindestens Größe min) oder null */
    spiegel: function (min) { return HG.macht.spiegelHier(min); },

    /** Direkter NERVEN-Verlust ohne Probe (selten nötig – meist nervenProbe benutzen). */
    nerven: function (d, g) { return api.aendere('nerven', d, g); },
    /** NERVEN-Probe: api.nervenProbe('1/1W6', { grund: 'Gestalt im Spiegel' }) */
    nervenProbe: function (spec, opt) { return HG.proben.nerven(spec, opt); },
    ausdauer: function (d, g) { return api.aendere('ausdauer', d, g); },
    geschick: function (d, g) { return api.aendere('geschick', d, g); },
    /** Prozentprobe (W100 ≤ Wert): api.probe('nerven') oder api.probe(60, { titel: 'Suchen' }). Liefert { erfolg, wurf, ziel … }. */
    probe: function (wer, opt) { return HG.proben.probe(wer, opt); },
    /** Geschlechtsabhängig: api.g('Cousin', 'Cousine', 'Cousin/Cousine') */
    g: function (m, w, d) { return HG.g(m, w, d); },
    spieler: function () { return Z().spieler || {}; },

    flag: function (n) { return Z().flags[n]; },
    setzeFlag: function (n, v) { Z().flags[n] = v === undefined ? true : v; },
    zaehler: function (n) { return Z().zaehler[n] || 0; },
    zaehle: function (n) { Z().zaehler[n] = (Z().zaehler[n] || 0) + 1; return Z().zaehler[n]; },

    eig: function (id, k) { return eig(id, k); },
    setze: function (id, k, v) { HG.zustand.setze(id, k, v); },
    bewege: function (id, ort, rel) { HG.zustand.setze(id, 'ort', ort); HG.zustand.setze(id, 'rel', rel || null); },
    hier: function (id) { return W.imUmfeld(id, true); },
    traegt: function (id) { return W.getragen(id); },
    gehe: function (raumId) { HG.spiel.betrete(raumId); },

    der: function (id, k) { return T.der(id, k || 'nom'); },
    ein: function (id, k) { return T.ein(id, k || 'nom'); },
    Der: function (id, k) { return T.gross(T.der(id, k || 'nom')); },

    merkePronomen: function (id) {
      var p = Z().pronomen; p[D(id).genus] = id; p.letzt = id;
    },

    // Tageszeit, Reisen, Handy, Spuk
    tageszeit: function () { return HG.zeit.phase(); },
    istNacht: function () { return HG.zeit.istNacht(); },
    tag: function () { return Z().zeit.tag; },
    uhrzeit: function () { return HG.zeit.uhr(); },
    /** Minuten seit Spielbeginn – für "ist das schon lange her?" */
    minuten: function () { return HG.zeit.jetzt(); },
    zeitVergeht: function (min) { HG.zeit.vergeht(min); },
    zeitBis: function (phase) { HG.zeit.bis(phase); },
    istOffen: function (spec) { return HG.zeit.istOffen(spec); },
    zielFrei: function (id) { return HG.reisen.schalteFrei(id); },
    nachricht: function (id) { return HG.handy.nachricht(id); },
    anruf: function (id) { return HG.handy.anruf(id); },
    handyDabei: function () { return HG.handy.dabei(); },
    /** Kurzen Soundeffekt abspielen: assets/sound/effekt-<name>.ogg|mp3 (fehlt er, passiert nichts). */
    sound: function (name) { HG.medien.effekt(name); },
    /** Spuk-Ereignis gezielt auslösen (ohne Zufall und Ortsprüfung). */
    spuk: function (id) {
      var d = HG.daten.spuk[id]; if (!d) return false;
      var n = (Z().spuk.zaehl || {})[id] || 0;
      if ((d.einmalig && n) || (d.max && n >= d.max)) return false;
      return HG.spukwerk.ausloesen(id);
    },

    hatHinweis: function (id) { return Z().hinweise.indexOf(id) >= 0; },
    hinweis: function (id) {
      var z = Z(), h = HG.daten.hinweise[id];
      if (!h || z.hinweise.indexOf(id) >= 0) return false;
      z.hinweise.push(id);
      HG.ausgabe.hinweis('Neu im Notizbuch: <b>' + h.titel + '</b>');
      (h.schaltetFrei || []).forEach(function (zid) { HG.reisen.schalteFrei(zid); });
      // Gibt es jetzt eine Schlussfolgerung, deren Hinweise alle beisammen sind?
      Object.keys(HG.daten.schluesse).forEach(function (sid) {
        var s = HG.daten.schluesse[sid];
        if (z.schluesse.indexOf(sid) >= 0 || z.flags['_angedeutet_' + sid]) return;
        if (s.aus.every(function (a) { return z.hinweise.indexOf(a) >= 0; })) {
          z.flags['_angedeutet_' + sid] = true;
          HG.ausgabe.schreibe('andeutung', HG.daten.spiel.andeutungText || 'Zwei deiner Notizen scheinen zusammenzupassen. Verbinde sie im Notizbuch – oder tippe „kombiniere … mit …“.');
        }
      });
      if (HG.anzeige && HG.anzeige.blitz) HG.anzeige.blitz('notizbuch', 1);
      return true;
    },

    /** Spiel beenden (verloren oder gewonnen). */
    ende: function (html) {
      Z().vorbei = true;
      HG.ausgabe.ende(html);
      HG.ausgabe.system('Tippe „rückgängig“, „laden“ oder „neustart“.');
    }
  };

  // ---------------------------------------------------------------
  // Vorlieben bei mehrdeutigen Wörtern (z. B. "nimm" mag Dinge, die man nicht hat)
  // ---------------------------------------------------------------
  var VORLIEBE = {
    nehmen: { np1: function (id) { return !W.inHand(id) && !eig(id, 'fest') && !D(id).orte; } },
    ablegen: { np1: function (id) { return W.getragen(id); } },
    legen: { np1: function (id) { return W.getragen(id); } },
    zeigen: { np1: function (id) { return W.getragen(id); } },
    geben: { np1: function (id) { return W.getragen(id); } },
    oeffnen: { np1: function (id) { return D(id).oeffenbar && !eig(id, 'offen'); } },
    schliessen: { np1: function (id) { return D(id).oeffenbar && eig(id, 'offen'); } },
    aufschliessen: { np1: function (id) { return !!eig(id, 'verschlossen') && D(id).schluessel != null; }, np2: function (id) { return D(id).istSchluessel && W.getragen(id); } },
    abschliessen: { np1: function (id) { return D(id).schluessel !== undefined && !eig(id, 'verschlossen'); }, np2: function (id) { return D(id).istSchluessel && W.getragen(id); } },
    anzuenden: { np1: function (id) { return (D(id).anzuendbar || D(id).schalter) && !eig(id, 'brennt'); }, np2: function (id) { return D(id).feuer; } },
    loeschen: { np1: function (id) { return !!eig(id, 'brennt'); } },
    lesen: { np1: function (id) { return !!D(id).lesbar && !(D(id).hinweis && Z().hinweise.indexOf(D(id).hinweis) >= 0); } }
  };

  var INFINITIV = {
    untersuchen: 'untersuchen', durchsuchen: 'durchsuchen', lesen: 'lesen', nehmen: 'nehmen', abnehmen: 'abnehmen',
    anheben: 'anheben', ablegen: 'ablegen', legen: 'hinlegen', aufschliessen: 'aufschließen', abschliessen: 'abschließen',
    oeffnen: 'öffnen', schliessen: 'schließen', druecken: 'drücken', ziehen: 'ziehen', drehen: 'drehen', umdrehen: 'umdrehen', schieben: 'schieben',
    anzuenden: 'anzünden', loeschen: 'löschen', zerbrechen: 'zerbrechen', reissen: 'zerreißen', sprechen: 'ansprechen',
    fragen: 'fragen', zeigen: 'zeigen', geben: 'geben', benutzen: 'benutzen', kombinieren: 'kombinieren',
    hineinschauen: 'hineinschauen', unterschauen: 'darunter ansehen', hinterschauen: 'dahinter ansehen'
  };

  var S = HG.spiel = {
    offen: null,        // laufende Rückfrage
    letzter: null,      // letzter Befehl (für "nochmal")

    // =============== Start, Neues Spiel, Räume ======================
    start: function () {
      var r = HG.zustand.laden('auto');
      if (r.ok && !(Z().spieler && Z().spieler.geschlecht)) r = { ok: false }; // Charakter noch nicht fertig
      if (r.ok) {
        HG.ausgabe.system('Willkommen zurück. Dein letzter Spielstand wurde geladen. („neustart“ beginnt von vorn.)');
        W.beschreibeRaum(true);
      } else {
        S.neuesSpiel();
      }
      S.nachZug(true);
    },

    neuesSpiel: function () {
      HG.zustand.neu();
      S.offen = null;
      var sp = HG.daten.spiel;
      if (sp.titel) HG.ausgabe.titel(sp.titel);
      // Charaktererstellung: erst Name, dann Geschlecht
      if (sp.charakter !== false) {
        if (sp.charakterText) HG.ausgabe.text(HG.wert(sp.charakterText));
        S.frage({ art: 'name' }, HG.wert(sp.frageName) || 'Wie heißt du?');
        return;
      }
      S.prolog();
    },

    /** Nach der Charaktererstellung: Werte, Einleitung, Startraum. */
    prolog: function () {
      var sp = HG.daten.spiel, w = Z().werte;
      [].concat(HG.wert(sp.einleitung) || []).forEach(function (t) { HG.ausgabe.text(t); });
      HG.ausgabe.system('Deine Werte: GESCHICK ' + w.geschick + ', AUSDAUER ' + w.ausdauer + ' – und deine NERVEN stehen bei ' + w.nerven + ' von ' + Z().max.nerven + '. Tippe „hilfe“, wenn du nicht weiterweißt.');
      S.betrete(sp.startRaum);
    },

    GESCHLECHT: {
      w: ['w', 'weiblich', 'frau', 'f', '1', 'sie', 'female'],
      m: ['m', 'maennlich', 'mann', '2', 'er', 'male'],
      d: ['d', 'divers', 'ohne', 'keine', 'neutral', 'offen', '3', 'egal', 'x']
    },
    /** Antworten während der Charaktererstellung. true = erledigt. */
    charakterSchritt: function (roh) {
      var o = S.offen, sp = HG.daten.spiel, z = Z();
      if (!o || (o.art !== 'name' && o.art !== 'geschlecht')) return false;
      S._verwerfeVerlauf = true;
      if (o.art === 'name') {
        var name = roh.replace(/["„“”'»«<>{}]/g, '').replace(/\s+/g, ' ').trim().slice(0, 40);
        if (!name) { S.frage(o, 'Wie heißt du? Tippe einfach deinen Namen.'); return true; }
        name = name.split(' ').map(function (t) { return T.gross(t); }).join(' ');
        z.spieler = { name: name, geschlecht: null };
        S.frage({ art: 'geschlecht' }, HG.wert(sp.frageGeschlecht) || 'Bist du eine Frau, ein Mann – oder möchtest du das offen lassen?');
        return true;
      }
      var w = T.norm(roh).split(/[\s,.!]+/).filter(Boolean), ge = null;
      Object.keys(S.GESCHLECHT).forEach(function (k) { if (!ge && w.some(function (x) { return S.GESCHLECHT[k].indexOf(x) >= 0; })) ge = k; });
      if (!ge) { S.frage(o, 'Tippe „Frau“, „Mann“ oder „ohne Angabe“.'); return true; }
      z.spieler.geschlecht = ge;
      S.offen = null;
      if (sp.charakterFertig) HG.ausgabe.text(HG.wert(sp.charakterFertig));
      S.prolog();
      return true;
    },

    betrete: function (raumId) {
      var z = Z(), r = HG.daten.raeume[raumId];
      var erstes = !z.besucht[raumId];
      z.raum = raumId;
      z.versteckt = null;
      if (r.vorBetreten) r.vorBetreten(api, { erstesMal: erstes });
      W.beschreibeRaum(erstes);
      z.besucht[raumId] = true;
      if (r.beimBetreten) r.beimBetreten(api, { erstesMal: erstes });
    },

    // =============== Eingabe verarbeiten ============================
    eingabe: function (roh, opt) {
      roh = String(roh || '').trim();
      if (!roh) return;
      if (!(opt && opt.leise)) HG.ausgabe.eingabe(T.esc(roh));
      var vorher = JSON.stringify(Z());
      S._verwerfeVerlauf = false;
      try {
        S.verarbeite(roh);
      } catch (e) {
        S._tiefe = 0; HG.ausgabe.leere();
        HG.ausgabe.system('Ein Fehler in der Engine ist aufgetreten: ' + T.esc(e && e.message || e));
        if (window.console) console.error(e);
      }
      if (!S._verwerfeVerlauf && JSON.stringify(Z()) !== vorher) {
        HG.zustand.verlauf.push(vorher);
        if (HG.zustand.verlauf.length > 50) HG.zustand.verlauf.shift();
      }
      S.nachZug(false);
    },

    /** Nach jeder Eingabe: automatisch speichern, Anzeige auffrischen. */
    nachZug: function () {
      if (!Z().vorbei) HG.zustand.speichern('auto');
      if (HG.anzeige && HG.anzeige.auffrischen) HG.anzeige.auffrischen();
    },

    verarbeite: function (roh) {
      if (S.charakterSchritt(roh)) return;
      var befehle = P.zerlege(roh);
      if (!befehle.length) { HG.ausgabe.text('Wie bitte?'); return; }

      // Antwort auf eine Rückfrage?
      if (S.offen) {
        var o = S.offen; S.offen = null;
        var erst = befehle[0];
        var neuerBefehl = (P.istVerb(erst[0]) && !P.filtereKandidaten([erst[0]], o.kandidaten || []).length) || HG.welt.RICHTUNG_WORT[erst[0]];
        if (!neuerBefehl) {
          if (o.art === 'ziel') {
            var zid = HG.reisen.finde(erst, o.liste);
            if (zid) { S.handle({ aktion: 'fahren', zielId: zid, np1: erst }); return; }
          } else if (o.art === 'wahl') {
            var ks = P.filtereKandidaten(erst, o.kandidaten);
            if (ks.length === 1) { S.ersetzeGruppe(o, ks[0]); S.fuehreAus(o.befehl); return; }
            if (ks.length > 1) { o.kandidaten = ks; S.frage(o, 'Welchen davon: ' + T.liste(ks.map(function (k) { return T.der(k, 'akk'); }), 'oder') + '?'); return; }
          } else if (o.art === 'fehlt') {
            o.befehl[o.slot] = erst;
            S.fuehreAus(o.befehl); return;
          }
        }
      }

      for (var i = 0; i < befehle.length; i++) {
        var b = P.analysiere(befehle[i]);
        if (b.fehler) { HG.ausgabe.text(b.fehler); return; }
        if (b.aktion === 'nochmal') {
          if (!S.letzter) { HG.ausgabe.text('Es gibt nichts zu wiederholen.'); return; }
          b = JSON.parse(JSON.stringify(S.letzter));
        } else if (!(b.eintrag && b.eintrag.meta)) {
          S.letzter = JSON.parse(JSON.stringify(b));
        }
        var weiter = S.fuehreAus(b);
        if (weiter === false || S.offen || Z().vorbei) return;
      }
    },

    frage: function (offen, text) {
      S.offen = offen;
      HG.ausgabe.frage(text);
    },

    ersetzeGruppe: function (o, id) {
      var np = o.befehl[o.slot], gruppen = [[]];
      np.forEach(function (t) { if (t === 'und' || t === ',') gruppen.push([]); else gruppen[gruppen.length - 1].push(t); });
      gruppen = gruppen.filter(function (g) { return g.length; });
      // Gruppen ohne Inhaltswörter (nur Artikel) zählen wie im Parser nicht
      var echte = gruppen.filter(function (g) { return g.some(function (t) { return !/^(der|die|das|den|dem|des|ein|eine|einen|einem|einer)$/.test(t); }); });
      echte[o.gruppe || 0] = ['#' + id];
      var neu = [];
      echte.forEach(function (g, i) { if (i) neu.push('und'); neu.push.apply(neu, g); });
      o.befehl[o.slot] = neu;
    },

    /** Einen analysierten Befehl auflösen und ausführen. false = Kette abbrechen. */
    fuehreAus: function (b) {
      var z = Z(), e = b.eintrag || {};

      if (e.meta) return S.meta(b);
      if (z.vorbei) { HG.ausgabe.text('Das Spiel ist vorbei. Tippe „rückgängig“, „laden“ oder „neustart“.'); return false; }

      // "nimm ab" bei klingelndem Handy
      if (b.aktion === 'abnehmen' && !b.np1.length && z.handy && z.handy.klingelt) { b.aktion = 'rangehen'; e = { o: 0 }; }
      var ctx = { aktion: b.aktion, verb: b.verb, prep: b.prep, prep2: b.prep2, reflexiv: b.reflexiv, richtung: b.richtung, np1: b.np1, np2: b.np2, buchZiel: b.buchZiel };
      // "frage nach Carsten", "sprich mit ihm": ist nur eine Person da, ist sie gemeint
      if ((b.aktion === 'fragen' || b.aktion === 'sprechen') && !b.np1.length) {
        var leute = W.umfeld().filter(function (id) { return D(id).person; });
        if (leute.length === 1) b.np1 = ['#' + leute[0]];
      }

      // --- Gehen: Richtung, Raumname oder Tür ---
      if (b.aktion === 'gehen') {
        if (!ctx.richtung && b.np1.length) {
          var r = S.richtungZu(b.np1);
          if (r.fehler) { HG.ausgabe.text(r.fehler); return false; }
          ctx.richtung = r.richtung;
        }
        return S.handle(ctx);
      }

      // --- Hinweise kombinieren (auch ohne die Gegenstände dabei) ---
      if (e.hinweise) {
        var teile = b.np2.length ? [b.np1, b.np2] : S.teileBeiUnd(b.np1);
        if (teile.length === 2) {
          var h1 = P.findeHinweis(teile[0]), h2 = P.findeHinweis(teile[1]);
          if (h1 && h2) { S.kombiniereHinweise(h1, h2); S.zugEnde(); return true; }
        }
      }

      // --- Freier Text (schreiben, sagen) ---
      if (e.text) {
        ctx.text = P.freierText(b.np1);
        if (b.np2.length) {
          var n2 = b.np2.filter(function (t) { return !/^(der|die|das|den|dem|ein|eine|einen|einem|mein|meinem|meinen)$/.test(t); });
          if (b.aktion === 'schreiben' && n2.length === 1 && /^notiz/.test(n2[0])) ctx.insNotizbuch = true;
          else if (!S.loese(b, ctx, 'np2')) return false;
        }
        return S.handle(ctx);
      }

      // --- Objekt 1 ---
      if (b.np1.length) {
        if (!S.loese(b, ctx, 'np1')) return false;
      } else if (e.o === 1) {
        S.frage({ art: 'fehlt', befehl: b, slot: 'np1' }, 'Was willst du ' + (INFINITIV[b.aktion] || b.aktion) + '?');
        return false;
      }

      // --- Objekt 2 oder Thema ---
      if (b.np2.length) {
        if (e.p2Text) ctx.thema = b.np2.filter(function (t) { return !/^(der|die|das|den|dem|ein|eine|einen|einem)$/.test(t); });
        else if (!S.loese(b, ctx, 'np2')) return false;
      }
      // "kombiniere A und B"
      if (b.aktion === 'kombinieren' && ctx.objs && ctx.objs.length === 2 && !ctx.obj2) { ctx.obj2 = ctx.objs[1]; ctx.objs = [ctx.objs[0]]; }

      // --- Ausführen (bei mehreren Objekten einzeln) ---
      if (ctx.objs && ctx.objs.length > 1) {
        ctx.objs.forEach(function (id) {
          HG.ausgabe.praefix = '<b>' + T.gross(T.name(id, 'nom', '')) + ':</b> ';
          S.handle(Object.assign({}, ctx, { obj: id, mehrfach: true }));
        });
        S.zugEnde();
        return true;
      }
      return S.handle(ctx);
    },

    teileBeiUnd: function (np) {
      var g = [[]];
      np.forEach(function (t) { if (t === 'und' || t === ',') g.push([]); else g[g.length - 1].push(t); });
      return g.filter(function (x) { return x.length; });
    },

    /** Wortgruppe np1/np2 auflösen und in ctx eintragen. false bei Fehler/Rückfrage. */
    loese: function (b, ctx, slot) {
      var e = b.eintrag || {};
      var opt = { blind: !!e.blind, mehr: slot === 'np1' && (e.mehr || b.aktion === 'kombinieren') };
      var vl = VORLIEBE[b.aktion]; if (vl && vl[slot]) opt.bevorzuge = vl[slot];
      // "nimm alles aus der Schublade": erst den Behälter, dann den Inhalt
      if (slot === 'np1' && b.aktion === 'nehmen' && b.np2.length && !ctx.obj2) {
        var r2 = P.aufloesen(b.np2, { blind: opt.blind });
        if (r2.fehler) { HG.ausgabe.text(r2.fehler); return false; }
        if (r2.frage) { S.frage({ art: 'wahl', befehl: b, slot: 'np2', gruppe: r2.gruppe, kandidaten: r2.kandidaten }, r2.frage); return false; }
        if (r2.ids) {
          ctx.obj2 = r2.ids[0];
          opt.universum = W.sammle(ctx.obj2).filter(function (k) { return eig(k, 'ort') === ctx.obj2; });
          if (!W.innenZugaenglich(ctx.obj2) && !D(ctx.obj2).ablage) {
            HG.ausgabe.text(T.gross(T.der(ctx.obj2, 'nom')) + ' ' + T.vb(ctx.obj2, 'ist', 'sind') + ' geschlossen.'); return false;
          }
          opt.universum = W.kinder(ctx.obj2);
        }
      }
      if (slot === 'np2' && ctx.obj2 && b.aktion === 'nehmen') return true;

      var r = P.aufloesen(b[slot], opt);
      if (r.fehler) { HG.ausgabe.text(r.fehler); return false; }
      if (r.frage) { S.frage({ art: 'wahl', befehl: b, slot: slot, gruppe: r.gruppe, kandidaten: r.kandidaten }, r.frage); return false; }
      if (r.alles) {
        var ids = S.allesFuer(b.aktion, opt.universum).filter(function (id) { return r.ausser.indexOf(id) < 0; });
        if (!ids.length) { HG.ausgabe.text(b.aktion === 'nehmen' ? 'Hier gibt es nichts, was du mitnehmen könntest.' : 'Du hast nichts bei dir.'); return false; }
        r = { ids: ids };
      }
      if (slot === 'np1') { ctx.objs = r.ids; ctx.obj = r.ids[0]; }
      else ctx.obj2 = r.ids[0];
      if (r.ids.length === 1) api.merkePronomen(r.ids[0]);
      return true;
    },

    allesFuer: function (aktion, universum) {
      if (aktion === 'nehmen') {
        return (universum || W.umfeld()).filter(function (id) {
          return !W.getragen(id) && !eig(id, 'fest') && !D(id).orte && !D(id).szenerie && !D(id).person;
        });
      }
      return W.kinder('spieler');
    },

    /** "geh in den Flur", "geh durch die Tür", "geh nach Norden" */
    richtungZu: function (np) {
      var woerter = np.filter(function (t) { return !/^(der|die|das|den|dem|ein|eine|einen|einem|zu|nach|in|durch)$/.test(t); });
      if (woerter.length === 1 && W.RICHTUNG_WORT[woerter[0]]) return { richtung: W.RICHTUNG_WORT[woerter[0]] };
      var r = W.raum(), aus = r.ausgaenge || {};
      var treffer = Object.keys(aus).filter(function (k) {
        var a = aus[k], ziel = typeof a === 'string' ? a : a.ziel;
        var zr = ziel && HG.daten.raeume[ziel]; if (!zr) return false;
        var wl = (zr.woerter || []).concat(T.norm(zr.name).split(' ')).map(T.norm);
        return woerter.length && woerter.every(function (w) { return wl.indexOf(w) >= 0; });
      });
      if (treffer.length) return { richtung: treffer[0] };
      if (woerter.length && HG.daten.raeume[Z().raum] && (r.woerter || []).concat(T.norm(r.name).split(' ')).map(T.norm).indexOf(woerter[0]) >= 0) {
        return { fehler: 'Da bist du doch schon.' };
      }
      var res = P.aufloesen(np.filter(function (t) { return !/^(zu|nach|in|durch)$/.test(t); }), {});
      if (res.ids) {
        var tuer = res.ids[0];
        var k = Object.keys(aus).filter(function (k2) { return aus[k2] && aus[k2].tuer === tuer; })[0];
        if (k) return { richtung: k };
        return { fehler: 'Dorthin kannst du nicht gehen.' };
      }
      if (res.frage) return { fehler: res.frage.replace('meinst du', 'meinst du – nenne am besten die Richtung') };
      return { fehler: 'Dorthin kommst du von hier aus nicht – zumindest nicht direkt.' };
    },

    /** Haken (Raum, Ding, Ziel-Ding, Spiel) und dann die allgemeine Handlung. */
    _tiefe: 0,
    handle: function (ctx) {
      var r = W.raum(), a = ctx.aktion;
      if (S._tiefe === 0) { HG.ausgabe.puffer = []; S._dauer = null; }
      S._tiefe++;
      var haken = [];
      if (r.bei && r.bei[a]) haken.push(r.bei[a]);
      if (ctx.obj && D(ctx.obj).bei && D(ctx.obj).bei[a]) haken.push(D(ctx.obj).bei[a]);
      if (ctx.obj2 && D(ctx.obj2).bei && D(ctx.obj2).bei[a]) haken.push(D(ctx.obj2).bei[a]);
      if (HG.daten.spiel.bei && HG.daten.spiel.bei[a]) haken.push(HG.daten.spiel.bei[a]);
      var erledigt = false;
      try { erledigt = haken.some(function (h) { return h(api, ctx); }); } catch (e) { S._tiefe = 0; throw e; }
      if (!erledigt) {
        if (!HG.aktionen[a]) HG.ausgabe.text('Das kann ich (noch) nicht.');
        else HG.aktionen[a](ctx);
      }
      // Für die Menüs merken, was schon gelesen bzw. untersucht wurde (nur bei Licht – im Dunkeln sieht man nichts)
      if (ctx.obj && D(ctx.obj) && MERKEN.indexOf(a) >= 0 && W.hell()) {
        var getan = Z().getan || (Z().getan = {});
        (getan[ctx.obj] = getan[ctx.obj] || {})[a] = true;
      }
      S._tiefe--;
      if (S._tiefe === 0) {
        // Wie viele Minuten hat das gedauert? Handlung > Ding (dauer: {lesen: 20}) > Raum > Tabelle
        var dd = ctx.dauer;
        if (dd === undefined && ctx.obj && D(ctx.obj).dauer) dd = HG.wert(D(ctx.obj).dauer[a], api, ctx);
        if (dd === undefined && r.dauer) dd = HG.wert(r.dauer[a], api, ctx);
        if (dd === undefined) dd = HG.zeit.DAUER[a] === undefined ? 1 : HG.zeit.DAUER[a];
        S._dauer = (S._dauer || 0) + dd;
        // Geräusche am Ding (geraeusch: { oeffnen: 'tuer-knarren' }) und große Bilder von Fundstücken
        if (ctx.obj && D(ctx.obj).geraeusch && D(ctx.obj).geraeusch[a]) HG.medien.effekt(HG.wert(D(ctx.obj).geraeusch[a], api, ctx));
        if (ctx.obj && (a === 'untersuchen' || a === 'lesen' || a === 'umdrehen')) S.zeigeFundBild(ctx.obj, ctx);
        HG.ausgabe.leere();
      }
      if (!ctx.mehrfach && S._tiefe === 0) S.zugEnde();
      return true;
    },

    /** Großes Bild eines Fundstücks in den Text schreiben (höchstens einmal pro Handlung).
     *  Dinge mit Rückseite zeigen die Seite, die gerade oben liegt (ding-<id>-rueckseite), und einen Umdreh-Knopf. */
    zeigeFundBild: function (id, ctx) {
      // Ein Bauplan (plan: 'haus') öffnet die Plan-Ansicht und dient ab jetzt als Karte
      var plan = D(id).plan && HG.daten.plaene[D(id).plan];
      if (plan && W.hell() && !(ctx && ctx.bildGezeigt)) {
        if (ctx) ctx.bildGezeigt = true;
        HG.plan.merke(plan);
        HG.ausgabe.schreibe('planknopf', T.gross(T.name(id, 'nom', '')), { plan: plan.id });
        if (HG.anzeige && HG.anzeige.zeigePlan) HG.anzeige.zeigePlan(plan);
        return;
      }
      if ((ctx && ctx.bildGezeigt) || !HG.medien.hatFundBild(id) || D(id).buch || !W.hell()) return;
      if (ctx) ctx.bildGezeigt = true;
      var hinten = !!(D(id).rueckseite && eig(id, 'umgedreht'));
      HG.ausgabe.schreibe('abbildung', T.gross(T.name(id, 'nom', '')) + (hinten ? ' (Rückseite)' : ''), {
        ding: id, datei: HG.medien.dingName(id) + (hinten ? '-rueckseite' : ''),
        umdrehen: D(id).rueckseite ? 'dreh ' + S.kurzwort(id) + ' um' : null
      });
    },

    /** Ein Spielzug ist vorbei: Ereignisse, Spielende prüfen. */
    zugEnde: function () {
      var z = Z();
      if (z.vorbei) return;
      z.zug++;
      // erst vergeht die Zeit, dann reagieren Raum und Spiel darauf
      HG.zeit.vergeht(S._dauer === null || S._dauer === undefined ? 1 : S._dauer);
      S._dauer = null;
      var r = W.raum();
      if (r.jedeRunde) r.jedeRunde(api);
      if (HG.daten.spiel.jedeRunde) HG.daten.spiel.jedeRunde(api);
      HG.handy.zug();
      HG.macht.zug();        // zerbrochene Spiegel erneuern sich über Nacht
      HG.spukwerk.zug();
      if (HG.proben.schockFaellig && z.werte.nerven > 0) HG.proben.schock();
      if (z.werte.nerven <= 0 && !z.vorbei) api.ende(HG.wert(HG.daten.spiel.endeNerven, api) || 'Dein Verstand gibt nach.');
      else if (z.werte.ausdauer <= 0 && !z.vorbei) api.ende(HG.wert(HG.daten.spiel.endeAusdauer) || 'Deine Kräfte verlassen dich.');
    },

    // =============== Notizbuch ======================================
    kombiniereHinweise: function (a, b) {
      var z = Z();
      if (a === b) { HG.ausgabe.text('Das ist zweimal derselbe Hinweis.'); return; }
      var sid = Object.keys(HG.daten.schluesse).filter(function (k) {
        var s = HG.daten.schluesse[k];
        return s.aus.indexOf(a) >= 0 && s.aus.indexOf(b) >= 0;
      })[0];
      if (!sid) { HG.ausgabe.text(HG.daten.spiel.keinSchlussText || 'Du legst die beiden Notizen nebeneinander, aber sie scheinen nicht zusammenzuhängen. Noch nicht.'); return; }
      var s = HG.daten.schluesse[sid];
      if (z.schluesse.indexOf(sid) >= 0) { HG.ausgabe.text('Diesen Schluss hast du bereits gezogen („' + s.titel + '“).'); return; }
      var fehlt = s.aus.filter(function (h) { return z.hinweise.indexOf(h) < 0; });
      if (fehlt.length) { HG.ausgabe.text('Da fehlt noch ein Puzzlestück. Irgendwo im Haus gibt es mehr darüber zu erfahren.'); return; }
      z.schluesse.push(sid);
      z.flags['schluss_' + sid] = true;
      HG.ausgabe.hinweis('Schlussfolgerung: <b>' + s.titel + '</b><br>' + s.text);
      (s.schaltetFrei || []).forEach(function (zid) { HG.reisen.schalteFrei(zid); });
      if (s.beiErkenntnis) s.beiErkenntnis(api);
    },

    /** Für die Notizbuch-Schaltfläche der Oberfläche. */
    verbindeImNotizbuch: function (a, b) {
      var vorher = JSON.stringify(Z());
      HG.ausgabe.eingabe('(Notizbuch: ' + T.esc(HG.daten.hinweise[a].titel) + ' + ' + T.esc(HG.daten.hinweise[b].titel) + ')');
      S.kombiniereHinweise(a, b);
      if (JSON.stringify(Z()) !== vorher) HG.zustand.verlauf.push(vorher);
      S.nachZug();
    },

    // =============== Meta-Befehle ===================================
    meta: function (b) {
      var z = Z(), text = P.freierText(b.np1 || []).trim();
      switch (b.aktion) {
        case 'hilfe': HG.ausgabe.system(HILFE); break;
        case 'inventar': S.zeigeInventar(); break;
        case 'werte':
          HG.ausgabe.system((z.spieler ? T.esc(z.spieler.name) + ': ' : '') + 'GESCHICK ' + z.werte.geschick + '/' + z.max.geschick + ' · AUSDAUER ' + z.werte.ausdauer + '/' + z.max.ausdauer + ' · NERVEN ' + z.werte.nerven + ' % (Start ' + z.start.nerven + ', höchstens ' + z.max.nerven + ')');
          break;
        case 'notizbuch': S.zeigeNotizbuch(); if (HG.anzeige && HG.anzeige.zeigeTab) HG.anzeige.zeigeTab('notizbuch'); break;
        case 'karte':
          if (HG.anzeige && HG.anzeige.zeigeKarte) { HG.anzeige.zeigeKarte(); HG.ausgabe.system(HG.anzeige._plan ? 'Du faltest den Bauplan auseinander.' : 'Du wirfst einen Blick auf deine Skizze des Hauses.'); }
          else HG.ausgabe.system('Bekannte Räume: ' + T.liste(W.kartenDaten().raeume.map(function (r) { return r.name; })) + '.');
          break;
        case 'speichern': {
          var platz = text || '1';
          var r = HG.zustand.speichern(platz);
          HG.ausgabe.system(r.ok ? 'Gespeichert auf Platz „' + T.esc(platz) + '“. Mit „laden ' + T.esc(platz) + '“ kehrst du hierher zurück.' : 'Speichern ist fehlgeschlagen (' + T.esc(r.fehler) + '). Der Browser erlaubt hier vielleicht keinen lokalen Speicher.');
          break;
        }
        case 'laden': {
          var pl = text || '1';
          var lr = HG.zustand.laden(pl);
          if (lr.ok) { S.offen = null; S._verwerfeVerlauf = true; HG.ausgabe.system('Spielstand „' + T.esc(pl) + '“ geladen.'); W.beschreibeRaum(true); }
          else if (lr.fehler === 'leer') HG.ausgabe.system('Auf Platz „' + T.esc(pl) + '“ ist nichts gespeichert.' + S.platzListe());
          else if (lr.fehler === 'version') HG.ausgabe.system('Dieser Spielstand stammt aus einer älteren Version des Spiels und passt nicht mehr.');
          else HG.ausgabe.system('Laden ist fehlgeschlagen (' + T.esc(lr.fehler) + ').');
          break;
        }
        case 'rueckgaengig':
          S._verwerfeVerlauf = true;
          if (HG.zustand.rueckgaengig()) { S.offen = null; HG.ausgabe.system('Rückgängig gemacht.'); W.beschreibeRaum(false); }
          else HG.ausgabe.system('Weiter zurück geht es nicht.');
          break;
        default:
          if (HG.aktionen[b.aktion]) HG.aktionen[b.aktion]({ aktion: b.aktion, np1: b.np1 || [], text: text });
          break;
        case 'neustart':
          if (text !== 'ja' && !z.vorbei) { HG.ausgabe.system('Wirklich von vorn beginnen? Dann tippe „neustart ja“.'); break; }
          S._verwerfeVerlauf = true;
          S.neuesSpiel();
          break;
      }
      return true;
    },

    platzListe: function () {
      var l = HG.zustand.plaetze().filter(function (p) { return p.platz !== 'auto'; });
      if (!l.length) return '';
      return ' Belegte Plätze: ' + l.map(function (p) { return '„' + T.esc(p.platz) + '“'; }).join(', ') + '.';
    },

    zeigeInventar: function () {
      var ids = W.kinder('spieler');
      if (!ids.length) { HG.ausgabe.text('Du hast nichts bei dir.'); return; }
      var teile = ids.map(function (id) {
        var s = T.ein(id, 'akk');
        if (D(id).lichtquelle && eig(id, 'brennt')) s += ' (brennend)';
        var drin = W.innenZugaenglich(id) ? W.kinder(id, 'in') : [];
        if (drin.length) s += ' (darin ' + T.liste(drin.map(function (k) { return T.ein(k, 'nom'); })) + ')';
        return s;
      });
      HG.ausgabe.text('Du trägst ' + T.liste(teile) + ' bei dir.');
    },

    zeigeNotizbuch: function () {
      var z = Z();
      if (!z.hinweise.length && !z.notizen.length) { HG.ausgabe.system('Dein Notizbuch ist noch leer.'); return; }
      var h = [];
      z.schluesse.forEach(function (id) { var s = HG.daten.schluesse[id]; h.push('★ <b>' + s.titel + '</b> – ' + s.text); });
      S.notizGruppen().forEach(function (g) {
        h.push('<br><b>' + T.esc(g.titel) + '</b> (' + g.ids.length + ')');
        g.ids.forEach(function (id) { var x = HG.daten.hinweise[id]; h.push('• <b>' + x.titel + '</b> – ' + x.text); S.hinweisGesehen(id); });
      });
      if (z.notizen.length) h.push('<br><b>Eigene Notizen</b>');
      z.notizen.forEach(function (n) { h.push('✎ „' + T.esc(n) + '“'); });
      HG.ausgabe.system('<b>Notizbuch</b><br>' + h.join('<br>'));
    },

    /** Gefundene Hinweise nach Ermittlungsstrang: [{ schluessel, titel, ids }] – nur Gruppen mit Einträgen.
     *  Die Stränge stehen im Inhalt (HG.daten.spiel.straenge); "D/E" zählt zu D, Unbekanntes zu "Weitere". */
    notizGruppen: function () {
      var z = Z(), sp = HG.daten.spiel, gruppen = [], nach = {};
      (sp.straenge || []).forEach(function (s) { var g = { schluessel: s.k, titel: s.titel, ids: [] }; gruppen.push(g); nach[s.k] = g; });
      var sonst = { schluessel: '_', titel: sp.straengeSonst || 'Weitere Hinweise', ids: [] };
      z.hinweise.forEach(function (id) {
        var h = HG.daten.hinweise[id]; if (!h) return;
        var k = String(h.strang || '').split('/')[0].trim();
        (nach[k] || sonst).ids.push(id);
      });
      gruppen.push(sonst);
      return gruppen.filter(function (g) { return g.ids.length; });
    },
    /** Noch nicht angesehener Hinweis? */
    hinweisNeu: function (id) { return !(Z().gesehen || {})[id]; },
    hinweisGesehen: function (id) { var z = Z(); if (!z.gesehen) z.gesehen = {}; z.gesehen[id] = true; },

    /** Ist die Handlung des Menü-Verbs an diesem Ding schon erledigt? ("lies": Bücher erst, wenn alle Seiten gelesen sind) */
    erledigt: function (verb, id) {
      var e = ERLEDIGT_MENUE[verb], d = D(id);
      if (!e || !d) return false;
      if (e.aktion === 'lesen' && d.buch) {
        var st = (Z().buecher || {})[id];
        return !!st && HG.buch.seiten(id).every(function (x) { return st.gelesen.indexOf(x.i) >= 0; });
      }
      return !!((Z().getan || {})[id] || {})[e.aktion];
    },
    erledigtTitel: function (verb) { return ERLEDIGT_MENUE[verb] ? ERLEDIGT_MENUE[verb].titel : null; },

    // =============== Vorschläge (anklickbar) ========================
    // ---------------------------------------------------------------
    // Hilfen für Tipp-Bedienung (Wort-Menüs, Verb-Leiste, Autovervollständigung).
    // Alles allgemein aus den Ding-Eigenschaften abgeleitet – keine Sonderfälle.
    // ---------------------------------------------------------------

    /** Wort, mit dem ein Befehl ein Ding sicher trifft. */
    kurzwort: function (id) { return D(id).kurzwort || T.name(id, 'akk', '').toLowerCase(); },

    nehmbar: function (id) {
      var d = D(id);
      return !W.getragen(id) && !d.szenerie && !eig(id, 'fest') && !d.orte && !d.person && !d.tuer;
    },

    /** Sichtbare Ausgänge des Raums: [{ id, richtung, befehl }] */
    ausgaenge: function () {
      var r = W.raum(), aus = r.ausgaenge || {};
      return Object.keys(aus).filter(function (k) { return !(aus[k] && aus[k].unsichtbar); }).map(function (k) {
        return { id: k, richtung: !!W.RICHTUNGEN[k], befehl: W.RICHTUNGEN[k] ? 'geh ' + W.RICHTUNGEN[k].nach : k };
      });
    },

    /** Passende Handlungen für ein Ding (oder ">richtung") – für das Tipp-Menü. [{ text, befehl }] */
    aktionenFuer: function (id) {
      var a = [];
      function add(t, b) { a.push({ text: t, befehl: b }); }
      if (id.charAt(0) === '>') {
        var ri = W.RICHTUNGEN[id.slice(1)];
        if (ri) add(T.gross(ri.nach) + ' gehen', 'geh ' + ri.nach);
        return a;
      }
      var d = D(id);
      if (!d) return a;
      var k = S.kurzwort(id);
      add('Untersuchen', 'untersuche ' + k);
      if (d.person) add('Ansprechen', 'sprich mit ' + k);
      if (d.lesbar || d.buch || d.lesen) add('Lesen', 'lies ' + k);
      if (d.rueckseite) add('Umdrehen', 'dreh ' + k + ' um');
      if (d.istHandy) { add('Nachrichten lesen', 'lies nachrichten'); add('Fotos ansehen', 'fotos'); }
      if (d.oeffenbar) {
        if (eig(id, 'verschlossen') && d.schluessel != null) add('Aufschließen', 'schließe ' + k + ' auf');
        if (eig(id, 'offen')) add('Schließen', 'schließe ' + k); else add('Öffnen', 'öffne ' + k);
      }
      if (d.tuer && eig(id, 'offen')) add('Hindurchgehen', 'geh durch ' + k);
      if (d.behaelter && W.innenZugaenglich(id)) add('Hineinschauen', 'schau in ' + k);
      if (d.behaelter || d.ablage) add('Durchsuchen', 'durchsuche ' + k);
      if (d.schalter) {
        add(eig(id, 'brennt') ? 'Ausschalten' : 'Einschalten', 'schalte ' + k + (eig(id, 'brennt') ? ' aus' : ' ein'));
      } else if (d.anzuendbar) {
        add(eig(id, 'brennt') ? 'Löschen' : 'Anzünden', eig(id, 'brennt') ? 'lösche ' + k : 'zünde ' + k + ' an');
      }
      if (S.nehmbar(id)) add('Nehmen', 'nimm ' + k);
      if (W.inHand(id)) add('Ablegen', 'lege ' + k + ' ab');
      if (d.riechen) add('Riechen', 'rieche an ' + k);
      if (d.horchen) add('Lauschen', 'lausche an ' + k);
      if (d.tasten) add('Betasten', 'taste ' + k);
      if (d.klopfen) add('Klopfen', 'klopfe an ' + k);
      return a;
    },

    /** Dinge in der Nähe, die zu einem Verb der Leiste passen. */
    objekteFuer: function (verb) {
      var filter = {
        nimm: S.nehmbar,
        'öffne': function (id) { return D(id).oeffenbar && !eig(id, 'offen'); },
        lies: function (id) { var d = D(id); return d.lesbar || d.buch || d.lesen; },
        benutze: function (id) { return W.getragen(id); }
      }[verb];
      return W.umfeld().filter(function (id) { return !filter || filter(id); });
    },

    /** Wörter, die im Text auf Dinge in der Nähe (oder Ausgänge) zeigen: normWort -> [ids]. */
    wortIndex: function () {
      var idx = {};
      function add(w, id) {
        w = T.norm(w);
        if (w.length < 3 || / /.test(w)) return;
        idx[w] = idx[w] || [];
        if (idx[w].indexOf(id) < 0) idx[w].push(id);
      }
      W.umfeld().forEach(function (id) {
        var d = D(id);
        if (d.nomen) add(d.nomen, id);
        if (d.nomenDat) add(d.nomenDat, id);
        (d.woerter || []).forEach(function (w) { add(w, id); });
      });
      S.ausgaenge().forEach(function (a) { if (a.richtung) add(W.RICHTUNGEN[a.id].name, '>' + a.id); });
      return idx;
    },

    /** Autovervollständigung für die Eingabezeile: [{ anzeige, neu }] */
    ergaenze: function (text) {
      var roh = String(text).replace(/^\s+/, ''), erg = [];
      if (!roh || !W.raum() || Z().vorbei) return erg;
      if (S.offen && (S.offen.art === 'name' || S.offen.art === 'geschlecht')) return erg;
      var offen = /\s$/.test(roh), teile = roh.trim().split(/\s+/);
      var rest = offen ? '' : teile.pop(), vorne = teile.join(' ');
      var p = T.norm(rest), getippt = T.norm(roh.trim()) + (offen ? ' ' : '');
      function add(anzeige, neu) {
        if (erg.length < 8 && T.norm(neu.trim()) !== T.norm(roh.trim()) && !erg.some(function (e) { return e.neu === neu; })) erg.push({ anzeige: anzeige, neu: neu });
      }
      function passt(woerter) { return !p || woerter.some(function (w) { return T.norm(w).indexOf(p) === 0; }); }

      // 1. Befehle, die mit dem Getippten anfangen
      var vorlage = null;
      HG.parser.VERB_LISTE.forEach(function (v) {
        var start = v.split(' …')[0];
        if (T.norm(start).indexOf(getippt) === 0) add(v, start + (v.indexOf('…') >= 0 ? ' ' : ''));
        // längste passende Vorlage für das bisher Getippte ("zünde … an")
        if (vorne && v.indexOf('…') >= 0 && (T.norm(vorne) === T.norm(start) || T.norm(vorne).indexOf(T.norm(start) + ' ') === 0) &&
            (!vorlage || start.length > vorlage.start.length)) vorlage = { start: start, v: v };
      });
      if (!vorne) return erg;

      // 2. Richtungen nach "geh"
      if (/^(geh|gehe|lauf|laufe|renn|renne)$/.test(T.norm(vorne))) {
        S.ausgaenge().forEach(function (a) {
          var wort = a.befehl.replace(/^geh /, '');
          if (passt(wort.split(' '))) add(wort, vorne + ' ' + wort);
        });
        return erg;
      }

      // 3. Dinge in der Nähe
      if (!p && !vorlage) return erg;
      var zusatz = '';
      if (vorlage && T.norm(vorne) === T.norm(vorlage.start)) {
        zusatz = (vorlage.v.split('…')[1] || '').trim();
        if (zusatz) zusatz = ' ' + zusatz + (vorlage.v.split('…').length > 2 ? ' ' : '');
      }
      W.umfeld().forEach(function (id) {
        var d = D(id), k = S.kurzwort(id);
        if (passt(k.split(' ').concat(d.woerter || [], d.nomen ? [d.nomen] : []))) add(k, vorne + ' ' + k + zusatz);
      });
      return erg;
    },

    vorschlaege: function () {
      var z = Z(), v = [];
      function add(s) { if (s && !v.some(function (x) { return x.toLowerCase() === s.toLowerCase(); })) v.push(s); }
      if (S.offen && S.offen.art === 'geschlecht') return ['Frau', 'Mann', 'ohne Angabe'];
      if (S.offen && S.offen.art === 'name') return [];
      if (z.vorbei) return ['rückgängig', 'laden', 'neustart'];
      if (z.handy && z.handy.klingelt) return ['geh ran', 'ignoriere'];
      if (S.offen && S.offen.art === 'ziel') return S.offen.liste.map(function (id) { return 'fahre zu ' + HG.daten.ziele[id].name; });
      if (S.offen && S.offen.art === 'wahl') {
        return S.offen.kandidaten.map(function (id) { return T.name(id, 'akk', ''); });
      }
      var r = W.raum(), hell = W.hell();
      var kw = S.kurzwort;
      // Licht machen
      var feuer = W.inventar().filter(function (id) { return D(id).feuer; })[0];
      W.umfeld().forEach(function (id) {
        if (feuer && D(id).anzuendbar && !eig(id, 'brennt') && (!hell || W.getragen(id))) add('zünde ' + kw(id) + ' an');
      });
      if (!hell) {
        W.inventar().forEach(function (id) { if (D(id).schalter && !eig(id, 'brennt')) add('schalte ' + kw(id) + ' ein'); });
        add('taste umher');
      }
      // Inhaltliche Vorschläge des Raums
      [].concat(HG.wert(r.vorschlaege, api) || []).forEach(add);
      if (hell) {
        W.umfeld().forEach(function (id) {
          if (W.getragen(id) || D(id).szenerie || eig(id, 'fest') || D(id).orte) return;
          add('nimm ' + kw(id));
        });
        W.umfeld().forEach(function (id) {
          if (eig(id, 'verschlossen') && D(id).schluessel != null && W.inventar().some(function (k) { return D(k).istSchluessel; })) add('schließe ' + kw(id) + ' auf');
        });
      }
      S.ausgaenge().forEach(function (a) { add(a.befehl); });
      if (HG.handy.dabei() && HG.handy.ungelesen()) add('lies nachrichten');
      if (r.abfahrt && HG.reisen.liste().length) add('fahre los');
      return v.slice(0, 10);
    }
  };

  var HILFE = [
    '<b>So spielst du</b>',
    'Tippe, was du tun willst – mit einem Verb vorne: <i>untersuche die Kommode</i>, <i>nimm die Kerze</i>, <i>öffne die Schublade</i>.',
    '<b>Bewegen:</b> geh nach Norden (kurz: n, s, o, w, hoch, runter) · geh in den Flur · geh durch die Tür',
    '<b>Umsehen:</b> schau (l) · untersuche … (x) · durchsuche … · schau in/unter/hinter … · lies …',
    '<b>Dinge:</b> nimm … · nimm alles · lege … ab · lege … in/auf … · öffne/schließe … · schließe … mit … auf/ab · heb … hoch · nimm … ab · drücke/ziehe/drehe/schiebe …',
    '<b>Licht:</b> zünde … an (mit …) · lösche … / blas … aus',
    '<b>Sinne:</b> horche · lausche an … · rieche (an …) · taste (…) · klopfe an …',
    '<b>Sonstiges:</b> dreh … um · zerbrich … · reiß an … · kletter auf … · versteck dich hinter … · warte (z) · sprich mit … · frage … nach … · zeige … … · gib … an … · benutze … (mit …) · kombiniere … mit … · schreibe "…" auf …/ins Notizbuch',
    '<b>Abkürzungen:</b> es/ihn/sie meint das zuletzt Genannte. Mehrere Befehle mit „und“ oder „dann“: <i>nimm die Kerze und geh nach Norden</i>. „g“ wiederholt den letzten Befehl.',
    '<b>Reisen:</b> fahre los (zeigt alle bekannten Ziele) · fahre zum Lager · fahre nach Hause – nur dort, wo dein Auto steht. Neue Ziele ergeben sich aus Hinweisen.',
    '<b>Zeit:</b> warte bis zum Abend / bis morgen · schlafe (nur mit Bett) · zeit. Nachts hat das Haus mehr Macht.',
    '<b>Handy:</b> lies nachrichten · anrufliste · fotos · fotografiere … · mach ein Selfie · ruf … an · geh ran / ignoriere · schalte die taschenlampe ein/aus',
    '<b>Spiel:</b> inventar (i) · notizbuch · karte · werte · speichern [Name] · laden [Name] · rückgängig · neustart',
    'Unter der Eingabezeile stehen Vorschläge zum Anklicken. Das Spiel speichert nach jedem Zug automatisch.'
  ].join('<br>');
})(window.HG);
