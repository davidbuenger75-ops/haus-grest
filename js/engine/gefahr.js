// Haus Grest – Engine: Nachtphasen, Lichtvorrat, Gefahren, Manifestationen (Kämpfe), Seelen, Verstecken
//
// Alles hier ist allgemein; die Daten stehen in js/content/gefahren.js (Spielbibel 8.4, 8.9).
//
// --- Nachtphasen (HG.nacht.phase()) ------------------------------------------------------------
//   'daemmerung' (Beginn der Nacht – 0 Uhr) · 'tief' (0–3 Uhr) · 'abebben' (3–6 Uhr) · null bei Tag.
//   Um 3 Uhr ruft die Engine HG.daten.spiel.hoehepunkt(api) auf (wenn man im Haus ist).
//   HG.nacht.nummer() = Nummer der Nacht (die Nacht nach Tag 1 ist Nacht 1).
//
// --- Lichtvorrat ----------------------------------------------------------------------------
//   Ding: vorrat: { start: 100, proMinute: 0.5, einheit: '%', warnung: [20, 5], warnText, leerText,
//                   laden: function (api) { return Prozent pro Minute | 0 }, fahrt: 1 (pro Minute im Auto) }
//   Solange das Ding brennt, sinkt der Vorrat (eig 'vorrat'); bei 0 geht es aus und lässt sich nicht einschalten.
//
// --- Manifestationen (Kämpfe) ------------------------------------------------------------------
//   HG.manifestation('die_hand', {
//     name: 'Die Hand', halt: 6,            // HALT: wie Lebenspunkte; bei 0 löst sie sich auf
//     ausSpiegel: true,                     // kommt aus einem Spiegel → verhängen/zerschlagen schneidet sie ab
//     koerper: true,                        // greifbar → Nahkampf möglich
//     illusion: true,                       // Stimmgabel lässt sie zerfallen
//     seele: 'josef',                       // Diener → beim Namen nennen bannt sie
//     start: '…',                           // Text beim Erscheinen
//     angriffe: [{ text, lp: '1W4', nerven: '0/1W3', griff: true }, …],   // reihum, oder angriff: function (api, k)
//     griffFolge: { runden: 3, text, nerven: '1W3/1W10', lp: '1W4' },      // nach n Runden im Griff
//     texte: { aufgeloest, abgeschnitten, gebannt, geflohen, illusion, ausgewichen },
//     nachher: function (api, art) {}
//   });
//   Start: api.kampf('die_hand', { spiegel: 'wc_spiegel' }). Während eines Kampfs versteht die Eingabe nur
//   Kampf-Aktionen (Spielbibel 8.9.1: ausweichen, losreißen, Licht, Spiegel verhängen/zerschlagen, beim Namen
//   nennen, Stimmgabel, Salz, Pistole, fliehen, Nahkampf) und Meta-Befehle; die Vorschläge zeigen, was geht.
//
// --- Gefahren ------------------------------------------------------------------------------------
//   HG.gefahr('witwe', {
//     name, seele: 'margarete',            // Diener-Seele (bannbar)
//     ausloeser: 'weg' | 'jederWeg' | 'raum' | 'betreten' | 'manuell',
//     orte: [...], schauplatz: 'haus',      // wo ('raum'/'betreten'/'jederWeg')
//     phasen: ['tief'], chance: 0.3 | { daemmerung: 0.1, tief: 0.5 },   // Wahrscheinlichkeit je Gelegenheit
//     einmalProNacht: true (Standard), bedingung: function (api) {},
//     ablauf: function (api, ctx) {}        // 'weg': false = Bewegung abbrechen; { ziel: 'raum' } = umleiten
//   });
//   Ausgänge lösen 'weg'-Gefahren aus: ausgaenge: { hoch: { ziel: 'galerie', gefahr: 'witwe' } }.
//
// --- Seelen ---------------------------------------------------------------------------------------
//   HG.seele('bettina', {
//     name: 'Bettina Gerdes', art: 'diener' | 'gefangen' | 'gut',
//     wissen: ['hinweisA', 'hinweisB'],     // Geschichte (alle nötig): erst dann kann man sie nennen/bekehren
//     anker: 'haarspange',                  // bekehrbare: muss man bei sich tragen
//     wahrheit: 'Es war nicht deine Schuld.', falsch: ['…', '…'],
//     ding: { nomen, genus, woerter, beschreibung },   // so erscheint sie (Ding 'seele_<id>')
//     erscheint: { orte, phasen, chance, text, zuege: 3 },
//     macht: 15,                            // so viel MACHT verliert das Haus beim Bekehren
//     bekehrt: function (api) {}            // Text/Wirkung nach dem Bekehren
//   });
//   "nenne sie beim namen" (bei einer Gefahr/Manifestation eines Dieners) → Auswahl: Name, dann Wahrheit,
//   dann Willenskraft-Probe (WP × 5 % + 20) → für diese Nacht gebannt.
//   "sprich mit bettina" / "sag bettina die wahrheit" (während sie erscheint) → Auswahl der Wahrheit → bekehrt.
//
// --- Wanderer und Verstecken -------------------------------------------------------------------
//   HG.daten.spiel.wanderer = { manifestation, start, phasen, schauplatz, alle: 20 (Minuten), warnText, vorbeiText }
//   Räume/Dinge: versteckOrt: { text, mod } – „versteck dich (unter dem Bett)“. Kommt der Wanderer in den Raum,
//   entscheidet eine Schleichen-Probe (+ mod). Sonst beginnt ein Kampf.
(function (HG) {
  'use strict';

  var W = HG.welt, T = HG.text;
  function Z() { return HG.zustand.z; }
  function D(id) { return HG.daten.dinge[id]; }
  function eig(id, k) { return HG.zustand.eig(id, k); }
  function A() { return HG.api; }
  function wert(x, ctx) { return HG.wert(x, HG.api, ctx); }
  function sag(h) { if (h) HG.ausgabe.text(h); }
  function zufall() { return HG.zufall(); }

  /** Ein Tuch (Laken) über einen Spiegel hängen: Spiegel gilt als verhängt; vom Tuch gibt es "vorratTuch" Stück
   *  (Standard 3) – ist es aufgebraucht, liegt es wieder an seinem Startort (z. B. Wäschekammer). */
  HG.tuchVerbrauchen = function (tuch, spiegel) {
    HG.zustand.setze(spiegel, 'verhaengt', true);
    var d = D(tuch), n = eig(tuch, 'anzahl'); if (n === undefined || n === null) n = d.vorratTuch || 3;
    n--;
    if (n <= 0) { HG.zustand.setze(tuch, 'anzahl', d.vorratTuch || 3); HG.zustand.setze(tuch, 'ort', d.ort); HG.zustand.setze(tuch, 'rel', d.rel || null); }
    else HG.zustand.setze(tuch, 'anzahl', n);
  };

  HG.daten.manifestationen = HG.daten.manifestationen || {};
  HG.daten.gefahren = HG.daten.gefahren || {};
  HG.daten.seelen = HG.daten.seelen || {};

  HG.manifestation = function (id, def) { def.id = id; HG.daten.manifestationen[id] = def; return def; };
  HG.gefahr = function (id, def) { def.id = id; HG.daten.gefahren[id] = def; return def; };
  HG.seele = function (id, def) {
    def.id = id; HG.daten.seelen[id] = def;
    // Die Erscheinung als Ding, damit "sprich mit bettina", "untersuche gestalt" funktionieren
    if (def.ding) {
      var d = Object.assign({ genus: 'f', person: true, szenerie: true, fest: 'Deine Hand greift durch sie hindurch.' }, def.ding);
      d.ort = null;
      d.seele = id;
      d.bei = Object.assign({}, d.bei, {
        sprechen: function (api) { return G.wahrheitAnbieten(id); },
        sagen: function (api) { return G.wahrheitAnbieten(id); }
      });
      HG.ding('seele_' + id, d);
    }
    return def;
  };

  // ============================================================== Zustand
  function st() {
    var z = Z();
    if (!z.gefahren) z.gefahren = { nacht: {}, gebannt: {}, seelen: {}, wanderer: null, da: null, aktiv: null };
    return z.gefahren;
  }

  // ============================================================== Nacht
  var N = HG.nacht = {
    /** 'daemmerung' | 'tief' | 'abebben' | null */
    phase: function (minute) {
      var m = minute === undefined ? Z().zeit.minute : ((minute % 1440) + 1440) % 1440;
      var sp = HG.daten.spiel;
      var nachtAb = HG.zeit.beginn ? HG.zeit.beginn('nacht') : 19 * 60;
      var tiefBis = sp.tiefeNachtBis === undefined ? 180 : sp.tiefeNachtBis;   // 3 Uhr
      var morgen = HG.zeit.beginn ? HG.zeit.beginn('morgen') : 360;
      if (m >= nachtAb) return 'daemmerung';
      if (m < tiefBis) return 'tief';
      if (m < morgen) return 'abebben';
      return null;
    },
    /** Nummer der Nacht: Abend von Tag n und Morgen von Tag n+1 gehören zu Nacht n. */
    nummer: function () { var z = Z(); return z.zeit.minute < (HG.zeit.beginn ? HG.zeit.beginn('morgen') : 360) ? z.zeit.tag - 1 : z.zeit.tag; }
  };

  // ============================================================== Lichtvorrat
  var L = HG.licht = {
    vorrat: function (id) { var d = D(id), v = eig(id, 'vorrat'); return v === undefined || v === null ? (d.vorrat.start === undefined ? 100 : d.vorrat.start) : v; },
    prozent: function (id) { return Math.max(0, Math.round(L.vorrat(id))); },
    leer: function (id) { var d = D(id); return !!(d && d.vorrat && L.vorrat(id) <= 0); },
    sichtbar: function (id) { return W.getragen(id) || eig(id, 'ort') === Z().raum || W.sammle(Z().raum).indexOf(id) >= 0; },
    /** Zeit vergeht: brennende Dinge verbrauchen, ladbare laden. */
    vergeht: function (min) {
      Object.keys(HG.daten.dinge).forEach(function (id) {
        var d = D(id); if (!d.vorrat) return;
        var v = L.vorrat(id), alt = v, cfg = d.vorrat;
        var laden = cfg.laden ? (wert(cfg.laden) || 0) : 0;
        if (laden > 0 && v < (cfg.start || 100)) { v = Math.min(cfg.start || 100, v + laden * min); HG.zustand.setze(id, 'vorrat', v); return; }
        if (!eig(id, 'brennt')) return;
        v = Math.max(0, v - (cfg.proMinute || 1) * min);
        HG.zustand.setze(id, 'vorrat', v);
        var zeigen = L.sichtbar(id);
        (cfg.warnung || []).forEach(function (g) {
          if (alt > g && v <= g && v > 0 && zeigen) HG.ausgabe.system(T.fuelle(wert(cfg.warnText) || (T.gross(T.der(id, 'nom')) + ': noch ' + Math.round(v) + (cfg.einheit || ' %') + '.')).replace('{rest}', Math.round(v)));
        });
        if (v <= 0) {
          HG.zustand.setze(id, 'brennt', false);
          if (zeigen) sag(wert(cfg.leerText) || (T.gross(T.der(id, 'nom')) + ' erlischt.'));
        }
      });
    },
    /** Im Auto laden (Reisen). */
    fahrt: function (min) {
      Object.keys(HG.daten.dinge).forEach(function (id) {
        var d = D(id); if (!d.vorrat || !d.vorrat.fahrt || !W.getragen(id)) return;
        HG.zustand.setze(id, 'vorrat', Math.min(d.vorrat.start || 100, L.vorrat(id) + d.vorrat.fahrt * min));
      });
    }
  };

  // ============================================================== Gefahren und Seelen
  var G = HG.gefahren = {
    st: st,

    gebannt: function (seeleId) { return !!seeleId && st().gebannt[seeleId] === N.nummer(); },
    istBekehrt: function (seeleId) { return st().seelen[seeleId] === 'bekehrt'; },

    /** Darf die Gefahr jetzt ausgelöst werden? (Phase, Bann, einmal pro Nacht, Bedingung, Zufall) */
    darf: function (id, ohneZufall) {
      var g = HG.daten.gefahren[id], s = st(), api = A();
      if (!g || Z().kampf) return false;
      var ph = N.phase();
      if (g.phasen && g.phasen.indexOf(ph) < 0) return false;
      if (!g.phasen && !ph) return false;
      if (G.gebannt(g.seele)) return false;
      if (g.einmalProNacht !== false && s.nacht[id] === N.nummer()) return false;
      if (g.bedingung && !g.bedingung(api)) return false;
      if (ohneZufall) return true;
      var c = typeof g.chance === 'object' ? (g.chance[ph] || 0) : (g.chance === undefined ? 1 : g.chance);
      return zufall() < c;
    },
    /** Gefahr auslösen (merkt sie für diese Nacht). */
    loese: function (id, ctx) {
      var g = HG.daten.gefahren[id], s = st();
      s.nacht[id] = N.nummer();
      s.aktiv = { gefahr: id, seele: g.seele || null, bisZug: Z().zug + 1 };
      return g.ablauf ? g.ablauf(A(), ctx || {}) : undefined;
    },
    /** Beim Gehen durch einen Ausgang. Rückgabe: false = abbrechen, String = anderes Ziel, sonst normal weiter. */
    weg: function (ausgang, ctx) {
      var r = W.raum(), ziele = [];
      if (ausgang.gefahr) ziele = [].concat(ausgang.gefahr);
      Object.keys(HG.daten.gefahren).forEach(function (id) {
        var g = HG.daten.gefahren[id];
        if (g.ausloeser === 'jederWeg' && (!g.schauplatz || g.schauplatz === r.schauplatz) && (!g.orte || g.orte.indexOf(r.id) >= 0)) ziele.push(id);
      });
      for (var i = 0; i < ziele.length; i++) {
        if (!G.darf(ziele[i])) continue;
        var erg = G.loese(ziele[i], Object.assign({ ausgang: ausgang }, ctx));
        if (erg === false || typeof erg === 'string') return erg;
      }
      return true;
    },
    /** Beim Betreten eines Raums. */
    betreten: function () {
      var r = W.raum();
      Object.keys(HG.daten.gefahren).forEach(function (id) {
        var g = HG.daten.gefahren[id];
        if (g.ausloeser !== 'betreten' || (g.orte && g.orte.indexOf(r.id) < 0) || Z().kampf) return;
        if (G.darf(id)) G.loese(id, {});
      });
    },

    /** Am Zugende (nicht während eines Kampfs). */
    zug: function () {
      var z = Z(), s = st(), api = A();
      if (z.vorbei || z.kampf || S().offen) return;
      if (s.aktiv && z.zug > s.aktiv.bisZug) s.aktiv = null;
      var r = W.raum();
      // Seelen: Erscheinen und Verschwinden
      if (s.da && z.zug > s.da.bisZug) { G.verschwinde(); }
      if (!s.da) {
        Object.keys(HG.daten.seelen).some(function (id) {
          var se = HG.daten.seelen[id], e = se.erscheint;
          if (!e || G.istBekehrt(id) || (e.orte && e.orte.indexOf(r.id) < 0)) return false;
          if (e.phasen && e.phasen.indexOf(N.phase()) < 0) return false;
          if (s.nacht['seele_' + id] === N.nummer()) return false;
          if (e.bedingung && !e.bedingung(api)) return false;
          if (zufall() >= (e.chance === undefined ? 0.3 : e.chance)) return false;
          G.erscheine(id);
          return true;
        });
      }
      // Gefahren im Raum
      Object.keys(HG.daten.gefahren).some(function (id) {
        var g = HG.daten.gefahren[id];
        if (g.ausloeser !== 'raum') return false;
        if (g.orte && g.orte.indexOf(r.id) < 0) return false;
        if (g.schauplatz && g.schauplatz !== r.schauplatz) return false;
        if (!G.darf(id)) return false;
        G.loese(id, {});
        return true;
      });
      if (!z.kampf) G.wandererZug();
    },

    /** Zeit vergeht (auch beim Warten/Schlafen): 3-Uhr-Höhepunkt. */
    vergeht: function (min, vorherAbs) {
      var jetzt = HG.zeit.jetzt(), um = HG.daten.spiel.hoehepunktUm === undefined ? 180 : HG.daten.spiel.hoehepunktUm;
      // liegt ein 3-Uhr-Zeitpunkt in (vorher, jetzt]?
      var tag0 = Math.floor(vorherAbs / 1440), punkt = tag0 * 1440 + um;
      if (punkt <= vorherAbs) punkt += 1440;
      if (punkt <= jetzt && W.raum() && W.raum().schauplatz === (HG.daten.spiel.hausSchauplatz || 'haus') && HG.daten.spiel.hoehepunkt) {
        HG.daten.spiel.hoehepunkt(A());
      }
    },

    // ---------------------------------------------------------- Seelen erscheinen
    erscheine: function (id) {
      var se = HG.daten.seelen[id], s = st(), e = se.erscheint || {};
      s.nacht['seele_' + id] = N.nummer();
      s.da = { seele: id, bisZug: Z().zug + (e.zuege || 3) };
      if (HG.daten.dinge['seele_' + id]) HG.zustand.setze('seele_' + id, 'ort', Z().raum);
      HG.ausgabe.schreibe('spuk', wert(e.text) || (se.name + ' ist hier.'));
      if (e.sound) HG.medien.effekt(e.sound);
    },
    verschwinde: function () {
      var s = st(); if (!s.da) return;
      var se = HG.daten.seelen[s.da.seele];
      if (HG.daten.dinge['seele_' + se.id]) HG.zustand.setze('seele_' + se.id, 'ort', null);
      if (se.erscheint && se.erscheint.weg && W.raum().id === (s.da.raum || W.raum().id)) sag(wert(se.erscheint.weg));
      s.da = null;
    },
    /** Kennt die Spielfigur die Geschichte dieser Seele? */
    weiss: function (seeleId) {
      var se = HG.daten.seelen[seeleId];
      return !!se && (se.wissen || []).every(function (h) { return Z().hinweise.indexOf(h) >= 0; });
    },

    // ---------------------------------------------------------- Auswahl (Spielbuch-Stil)
    /** Wahrheit aussprechen (bekehrbare Seele, die gerade erscheint). true = erledigt. */
    wahrheitAnbieten: function (id) {
      var se = HG.daten.seelen[id], api = A();
      if (!se) return false;
      if (G.istBekehrt(id)) { sag(wert(se.frei) || se.name + ' ist frei. Sie hört dich nicht mehr – oder sie muss nicht mehr zuhören.'); return true; }
      if (!st().da || st().da.seele !== id) { sag('Hier ist niemand, mit dem du sprechen könntest.'); return true; }
      if (!se.anker) { sag(wert(se.stumm) || 'Sie hört dich nicht. Was sie bindet, lässt sich mit Worten nicht lösen.'); return true; }
      if (!G.weiss(id)) { sag(wert(se.zuWenig) || 'Du willst etwas sagen, aber du weißt zu wenig über sie. Was immer du sagst, wäre geraten.'); return true; }
      if (!W.getragen(se.anker)) { sag(wert(se.ohneAnker) || 'Sie sieht durch dich hindurch. Dir fehlt etwas, das zu ihr gehört – etwas, das sie wiedererkennt.'); return true; }
      G.wahrheitsWahl(se, function (richtig) {
        if (richtig) G.bekehre(id);
        else {
          sag(wert(se.falschText) || 'Die Worte fallen ins Leere. Sie wendet sich ab und ist fort.');
          api.nervenProbe('0/1W4', { grund: 'falsche Worte' });
          G.verschwinde();
        }
      });
      return true;
    },
    bekehre: function (id) {
      var se = HG.daten.seelen[id], s = st(), api = A();
      s.seelen[id] = 'bekehrt';
      if (se.macht) HG.macht.verbrauche(se.macht);
      sag(wert(se.bekehrtText) || (se.name + ' sieht dich an. Zum ersten Mal sieht sie dich wirklich.'));
      if (se.bekehrt) se.bekehrt(api);
      G.verschwinde();
    },
    /** Auswahl zwischen der richtigen Wahrheit und falschen Sätzen. weiter(richtig) */
    wahrheitsWahl: function (se, weiter) {
      var opts = [se.wahrheit].concat(se.falsch || []);
      // feste, aber nicht immer gleiche Reihenfolge (abhängig von der Seele)
      var n = (se.id.length + opts.length) % opts.length;
      opts = opts.slice(n).concat(opts.slice(0, n));
      HG.spiel.auswahl(wert(se.wahrheitFrage) || 'Was sagst du ' + (se.anrede || se.name) + '?', opts.map(function (t) {
        return { text: '„' + t + '“', tu: function () { weiter(t === se.wahrheit); } };
      }));
    },

    /** "nenne sie beim namen": bei einer Gefahr oder einem Kampf mit einem Diener. weiter(erfolg) */
    nennen: function (weiter) {
      var s = st(), z = Z(), api = A();
      var seeleId = z.kampf ? (HG.daten.manifestationen[z.kampf.id] || {}).seele : (s.aktiv && s.aktiv.seele);
      var bekannt = Object.keys(HG.daten.seelen).filter(function (id) { return HG.daten.seelen[id].art === 'diener' && G.weiss(id); });
      if (!seeleId && !bekannt.length) { sag('Du weißt nicht, wen du beim Namen nennen solltest.'); if (weiter) weiter(false); return; }
      if (!bekannt.length) { sag('Du weißt nicht, wer das ist. Ohne ihre Geschichte ist jeder Name geraten.'); if (weiter) weiter(false); return; }
      HG.spiel.auswahl('Wen siehst du vor dir?', bekannt.map(function (id) {
        return { text: HG.daten.seelen[id].name, tu: function () {
          if (id !== seeleId) {
            sag('Du rufst: „' + HG.daten.seelen[id].name + '!“ Nichts geschieht – oder doch: Es lacht leise. Das war der falsche Name.');
            api.nervenProbe('0/1W3', { grund: 'falscher Name' });
            if (weiter) weiter(false);
            return;
          }
          var se = HG.daten.seelen[id];
          G.wahrheitsWahl(se, function (richtig) {
            if (!richtig) { sag('Der Name stimmt, die Worte nicht. Sie lässt sich nicht beirren.'); if (weiter) weiter(false); return; }
            var e = api.probe(Math.max(1, (z.werte.wp || 0) * 5), { titel: 'Willenskraft-Probe', grund: 'beim Namen nennen', mod: 20, modGrund: 'du kennst ihre Geschichte' });
            if (e.erfolg) {
              st().gebannt[id] = N.nummer();
              sag(wert(se.gebanntText) || (se.name + ' hält inne. Für diese Nacht hat sie keine Macht mehr über dich.'));
              if (weiter) weiter(true);
            } else {
              sag('Deine Stimme bricht. Sie hört dich – aber sie gehorcht dir nicht.');
              if (weiter) weiter(false);
            }
          });
        } };
      }));
    },

    // ---------------------------------------------------------- Wanderer und Verstecken
    wandererZug: function () {
      var cfg = HG.daten.spiel.wanderer, s = st(), z = Z(), api = A();
      if (!cfg) return;
      var ph = N.phase(), r = W.raum();
      var aktiv = cfg.phasen.indexOf(ph) >= 0 && r.schauplatz === cfg.schauplatz;
      if (!aktiv) { if (s.wanderer && ph !== 'tief') s.wanderer = null; return; }
      if (s.wanderer && s.wanderer.nacht === N.nummer() && s.wanderer.fertig) return;
      var jetzt = HG.zeit.jetzt();
      if (!s.wanderer || s.wanderer.nacht !== N.nummer()) {
        if (cfg.bedingung && !cfg.bedingung(api)) return;
        s.wanderer = { raum: cfg.start, nacht: N.nummer(), zuletzt: jetzt };
        return;
      }
      if (jetzt - s.wanderer.zuletzt < (cfg.alle || 20)) return;
      s.wanderer.zuletzt = jetzt;
      // einen Schritt: bevorzugt in Richtung der Spielfigur, sonst zufällig
      var nach = G.nachbarn(s.wanderer.raum);
      if (!nach.length) return;
      var ziel = nach.indexOf(r.id) >= 0 && zufall() < (cfg.zielstrebig === undefined ? 0.5 : cfg.zielstrebig) ? r.id : nach[Math.floor(zufall() * nach.length)];
      s.wanderer.raum = ziel;
      if (ziel === r.id) G.wandererKommt();
      else if (G.nachbarn(r.id).indexOf(ziel) >= 0) HG.ausgabe.schreibe('spuk', wert(cfg.warnText) || 'Schritte, ganz in der Nähe. Sie kommen näher.');
    },
    wandererKommt: function () {
      var cfg = HG.daten.spiel.wanderer, s = st(), z = Z(), api = A();
      var v = z.versteckt;
      if (v) {
        var ort = (D(v) && D(v).versteckOrt) || (HG.daten.raeume[v] && HG.daten.raeume[v].versteckOrt) || {};
        var e = api.probe('schleichen', { grund: 'versteckt', mod: wert(ort).mod || 0, modGrund: 'Versteck' });
        if (e.erfolg) {
          HG.ausgabe.schreibe('spuk', wert(cfg.vorbeiText) || 'Etwas kommt herein. Es bleibt stehen, ganz nah. Dann geht es weiter.');
          api.nervenProbe('0/1W3', { grund: 'in deinem Versteck', gewoehnung: 'wanderer_versteck' });
          s.wanderer.raum = G.nachbarn(W.raum().id)[0] || s.wanderer.raum;
          return;
        }
        sag('Es findet dich.');
      }
      api.kampf(cfg.manifestation, {});
    },
    /** Benachbarte Räume desselben Schauplatzes (ohne verschlossene Türen und Sperren). */
    nachbarn: function (raumId) {
      var r = HG.daten.raeume[raumId]; if (!r) return [];
      return Object.keys(r.ausgaenge || {}).map(function (k) {
        var a = r.ausgaenge[k]; if (typeof a === 'string') a = { ziel: a };
        if (!a.ziel || !HG.daten.raeume[a.ziel] || HG.daten.raeume[a.ziel].schauplatz !== r.schauplatz) return null;
        if (a.tuer && eig(a.tuer, 'verschlossen')) return null;
        if (a.sperre && typeof a.sperre === 'string') return null;
        return a.ziel;
      }).filter(Boolean);
    },
    /** Für das Puppenhaus: wo lauert gerade etwas? [{ raum, was }] */
    lage: function () {
      var s = st(), aus = [];
      if (s.wanderer && s.wanderer.nacht === N.nummer() && !s.wanderer.fertig) aus.push({ raum: s.wanderer.raum, was: 'wanderer' });
      if (!N.phase()) return aus;
      Object.keys(HG.daten.gefahren).forEach(function (id) {
        var g = HG.daten.gefahren[id];
        if (!g.orte || (g.phasen && g.phasen.indexOf(N.phase()) < 0) || G.gebannt(g.seele) || s.nacht[id] === N.nummer()) return;
        g.orte.forEach(function (o) { aus.push({ raum: o, was: id }); });
      });
      return aus;
    }
  };
  function S() { return HG.spiel; }

  // ============================================================== Kämpfe
  var AKTIONEN = [
    { id: 'ausweichen', vorschlag: 'weiche aus', muster: /weich|duck|ausweich|spring.*zur seite/ },
    { id: 'losreissen', vorschlag: 'reiß dich los', muster: /reiss|reiß|losreiss|losreiß|befrei|los$|zerr/ },
    { id: 'licht', vorschlag: 'halte das Licht auf sie', muster: /leucht|licht|lampe|kerze|halte .*auf|grubenlampe/ },
    { id: 'verhaengen', vorschlag: 'verhänge den Spiegel', muster: /verh[aä]e?ng|laken|deck.*(zu|ab)|tuch/ },
    { id: 'zerschlagen', vorschlag: 'zerschlage den Spiegel', muster: /zerschlag|zerbrich|zertr[uü]e?mmer|schlag.*(spiegel|glas)|glas/ },
    { id: 'nennen', vorschlag: 'nenne sie beim Namen', muster: /nenn|name|beim namen/ },
    { id: 'schneiden', vorschlag: 'schneide dich frei', muster: /schneid|schere|messer|klinge/ },
    { id: 'stimmgabel', vorschlag: 'schlag die Stimmgabel an', muster: /stimmgabel|gabel/ },
    { id: 'salz', vorschlag: 'streu eine Salzlinie', muster: /salz/ },
    { id: 'schiessen', vorschlag: 'schieß', muster: /schie(ss|ß)|feuer|pistole|abdr[uü]e?ck/ },
    { id: 'fliehen', vorschlag: 'flieh', muster: /flieh|flucht|renn|lauf|weg hier|raus/ },
    { id: 'nahkampf', vorschlag: 'wehr dich', muster: /wehr|schlag|tritt|k[aä]e?mpf|sto(ss|ß)|pack|greif|pr[uü]e?gel|hau/ }
  ];
  function lichtQuelle() {
    return W.inventar().filter(function (id) { return D(id).lichtquelle && eig(id, 'brennt'); })
      .sort(function (a, b) { return (D(b).lichtStaerke || 1) - (D(a).lichtStaerke || 1); })[0] || null;
  }
  function tuchDabei() { return W.inventar().filter(function (id) { return D(id).tuch; })[0] || null; }
  function dingDabei(eigenschaft) { return W.inventar().filter(function (id) { return D(id)[eigenschaft]; })[0] || null; }

  var K = HG.kampf = {
    AKTIONEN: AKTIONEN,
    def: function () { return Z().kampf && HG.daten.manifestationen[Z().kampf.id]; },
    /** Welche Aktionen sind gerade möglich? */
    moeglich: function () {
      var k = Z().kampf, d = K.def(); if (!k || !d) return [];
      var api = A();
      return AKTIONEN.filter(function (a) {
        switch (a.id) {
          case 'ausweichen': return !k.griff;
          case 'losreissen': return !!k.griff;
          case 'licht': return !!lichtQuelle();
          case 'verhaengen': return !!(d.ausSpiegel && k.spiegel && tuchDabei());
          case 'zerschlagen': return !!(d.ausSpiegel && k.spiegel && D(k.spiegel) && D(k.spiegel).zerbrechlich !== false);
          case 'nennen': return !!d.seele && G.weiss(d.seele);
          case 'schneiden': return !!(d.koerper && dingDabei('klinge'));
          case 'stimmgabel': return !!(d.illusion && dingDabei('stimmgabel'));
          case 'salz': return !!dingDabei('salz');
          case 'schiessen': return W.getragen('pistole') && !!eig('pistole', 'geladen');
          case 'fliehen': return G.nachbarn(Z().raum).length > 0 || d.fliehenNach;
          case 'schneiden': {
          var klinge = dingDabei('klinge');
          e = api.probe('nahkampf', { grund: 'mit ' + T.der(klinge, 'dat'), mod: 20, modGrund: 'scharf' });
          if (e.erfolg) { var w2 = HG.wuerfel('1W4'); k.halt -= w2; if (k.griff) { k.griff = false; k.griffRunden = 0; } sag('Du schneidest. Stoff reißt, Fäden springen auseinander wie Saiten.' + ' <span class="nebenbei">(HALT −' + w2 + ')</span>'); }
          else sag('Die Klinge rutscht ab.');
          return null;
        }
        case 'nahkampf': return !!d.koerper;
        }
        return false;
      }).map(function (a) {
        var v = a.vorschlag;
        if (a.id === 'licht') v = 'halte ' + T.der(lichtQuelle(), 'akk') + ' auf sie';
        if (a.id === 'verhaengen' && k.spiegel) v = 'verhänge ' + T.der(k.spiegel, 'akk');
        if (a.id === 'zerschlagen' && k.spiegel) v = 'zerschlage ' + T.der(k.spiegel, 'akk');
        return { id: a.id, vorschlag: v };
      });
    },
    starte: function (id, opt) {
      var d = HG.daten.manifestationen[id];
      if (!d || Z().kampf) return false;
      opt = opt || {};
      Z().kampf = { id: id, halt: d.halt, runde: 0, griff: false, griffRunden: 0, spiegel: opt.spiegel || null, gefahr: opt.gefahr || null, raum: Z().raum };
      Z().versteckt = null;
      HG.ausgabe.schreibe('kampf', '<b>' + T.esc(d.name) + '</b> · HALT ' + d.halt + (wert(d.start) ? '<br>' + wert(d.start) : ''));
      if (d.sound) HG.medien.effekt(d.sound);
      if (d.nerven) A().nervenProbe(d.nerven, { grund: d.name, gewoehnung: d.gewoehnung });
      K.frage();
      return true;
    },
    frage: function () {
      if (!Z().kampf || Z().vorbei) return;
      HG.ausgabe.system('Was tust du? ' + K.moeglich().map(function (a) { return '<i>' + a.vorschlag + '</i>'; }).join(' · '));
    },
    /** Eingabe während eines Kampfs. true = verarbeitet. */
    eingabe: function (roh) {
      var k = Z().kampf; if (!k) return false;
      var t = T.norm ? T.norm(roh) : roh.toLowerCase();
      var low = roh.toLowerCase();
      var moegl = K.moeglich();
      var aktion = null;
      // genaue Übereinstimmung mit einem Vorschlag zuerst
      moegl.some(function (a) { if (a.vorschlag.toLowerCase() === low) { aktion = a.id; return true; } return false; });
      if (!aktion) AKTIONEN.some(function (a) { if (a.muster.test(low) || a.muster.test(t)) { aktion = a.id; return true; } return false; });
      if (!aktion) return false;
      if (!moegl.some(function (a) { return a.id === aktion; })) {
        sag(K.warumNicht(aktion));
        K.frage();
        return true;
      }
      K.runde(aktion);
      return true;
    },
    warumNicht: function (aktion) {
      var d = K.def(), k = Z().kampf;
      switch (aktion) {
        case 'licht': return 'Du hast kein Licht, das brennt.';
        case 'verhaengen': return d.ausSpiegel ? 'Du hast nichts dabei, womit du den Spiegel verhängen könntest – ein Laken, ein Tuch.' : 'Hier ist kein Spiegel, den du verhängen könntest.';
        case 'zerschlagen': return 'Hier ist kein Spiegel, aus dem sie kommt.';
        case 'nennen': return d.seele ? 'Du weißt zu wenig über sie. Jeder Name wäre geraten.' : 'Sie hat keinen Namen, den du kennst. Nicht mehr.';
        case 'schneiden': return 'Du hast nichts Scharfes dabei.';
        case 'stimmgabel': return d.illusion ? 'Du hast keine Stimmgabel.' : 'Das hier ist keine Täuschung. Es ist echt.';
        case 'salz': return 'Du hast kein Salz.';
        case 'schiessen': return 'Du hast keine geladene Waffe.';
        case 'ausweichen': return 'Sie hält dich fest – ausweichen kannst du nicht. Reiß dich los!';
        case 'losreissen': return 'Sie hat dich nicht gepackt.';
        case 'nahkampf': return 'Da ist nichts, das du schlagen könntest. Deine Hand geht durch sie hindurch.';
        case 'fliehen': return 'Es gibt keinen Weg hinaus.';
      }
      return 'Das geht jetzt nicht.';
    },
    /** Eine Runde: erst die Spielfigur, dann die Manifestation. */
    runde: function (aktion) {
      var k = Z().kampf, d = K.def(), api = A();
      k.runde++;
      k.ausgewichen = false;
      HG.spiel.setzeDauer(1);
      var ende = K.handle(aktion);
      if (ende === 'warten') return;      // Auswahl offen (beim Namen nennen)
      K.weiter(ende);
    },
    weiter: function (ende) {
      var k = Z().kampf, d = K.def(), api = A();
      if (!k) return;
      if (!ende && k.halt <= 0) ende = 'aufgeloest';
      if (ende) { K.beende(ende); HG.spiel.zugEnde(); return; }
      K.gegner();
      HG.spiel.zugEnde();
      if (Z().kampf && !Z().vorbei) K.frage();
    },
    handle: function (aktion) {
      var k = Z().kampf, d = K.def(), api = A(), e;
      var tx = d.texte || {};
      switch (aktion) {
        case 'ausweichen':
          e = api.probe('ausweichen', { grund: d.name });
          if (e.erfolg) { k.ausgewichen = true; sag(wert(tx.ausweichen) || 'Du wirfst dich zur Seite.'); }
          else sag('Zu langsam.');
          return null;
        case 'losreissen':
          e = api.probe('st', { grund: 'losreißen' });
          if (e.erfolg) { k.griff = false; k.griffRunden = 0; k.ausgewichen = true; sag(wert(tx.losgerissen) || 'Du reißt dich los und taumelst zurück.'); }
          else sag('Der Griff gibt nicht nach.');
          return null;
        case 'licht': {
          var q = lichtQuelle(), st_ = D(q).lichtStaerke || 1;
          if (D(q).vorrat && D(q).vorrat.kampfKosten) HG.zustand.setze(q, 'vorrat', Math.max(0, HG.licht.vorrat(q) - D(q).vorrat.kampfKosten));
          k.halt -= st_;
          sag(wert(tx.licht) || ('Du hältst ' + T.der(q, 'akk') + ' auf sie. Sie weicht zurück, als brenne das Licht.') + ' <span class="nebenbei">(HALT −' + st_ + ')</span>');
          return null;
        }
        case 'verhaengen': {
          var tuch = tuchDabei();
          e = api.probe('ge', { grund: 'Spiegel verhängen' });
          if (!e.erfolg) { sag('Das Tuch rutscht ab.'); return null; }
          HG.tuchVerbrauchen(tuch, k.spiegel);
          return 'abgeschnitten';
        }
        case 'zerschlagen':
          e = api.probe('st', { grund: 'Spiegel zerschlagen' });
          if (!e.erfolg) { sag('Dein Schlag prallt ab. Das Glas zittert nur.'); return null; }
          HG.macht.zerbrich(k.spiegel);
          api.verletze('1W3', { grund: 'Glassplitter' });
          return 'abgeschnitten';
        case 'nennen':
          G.nennen(function (ok) { K.weiter(ok ? 'gebannt' : null); });
          return 'warten';
        case 'stimmgabel':
          return 'illusion';
        case 'salz':
          e = api.probe('okkultismus', { grund: 'Salzlinie' });
          if (e.erfolg) return 'gebannt';
          sag('Das Salz rieselt dir durch die Finger, die Linie hat Lücken.');
          return null;
        case 'schiessen':
          api.probe('schusswaffen', { grund: d.name, still: false });
          sag(wert(tx.schuss) || 'Der Schuss ist ohrenbetäubend laut in dem leeren Haus. Die Kugel schlägt in die Wand. Sie ist noch da – sie war nie aus Fleisch.');
          api.aendere('nerven', 1, 'die Waffe in der Hand');
          return null;
        case 'fliehen':
          e = api.probe(HG.charakter && api.eigenschaft('ge') >= api.eigenschaft('st') ? 'ge' : 'st', { grund: 'Flucht' });
          if (e.erfolg) return 'geflohen';
          sag('Du kommst nicht weg.');
          return null;
        case 'nahkampf':
          e = api.probe('nahkampf', { grund: d.name });
          if (e.erfolg) { var w = HG.wuerfel('1W3'); k.halt -= w; sag((wert(tx.treffer) || 'Du triffst etwas, das nachgibt wie nasser Stoff.') + ' <span class="nebenbei">(HALT −' + w + ')</span>'); }
          else sag('Du schlägst ins Leere.');
          return null;
      }
      return null;
    },
    /** Die Manifestation handelt. */
    gegner: function () {
      var k = Z().kampf, d = K.def(), api = A();
      if (!k || Z().vorbei) return;
      if (k.ausgewichen) return;
      var a = d.angriff ? d.angriff(api, k) : (d.angriffe || [])[(k.runde - 1) % Math.max(1, (d.angriffe || []).length)];
      if (!a) return;
      if (a.text) HG.ausgabe.schreibe('spuk', wert(a.text));
      if (a.griff) k.griff = true;
      if (a.lp) api.verletze(a.lp, { grund: d.name });
      if (a.nerven) api.nervenProbe(a.nerven, { grund: d.name });
      if (k.griff) {
        k.griffRunden++;
        var f = d.griffFolge;
        if (f && k.griffRunden >= f.runden) {
          if (f.text) HG.ausgabe.schreibe('spuk', wert(f.text));
          if (f.nerven) api.nervenProbe(f.nerven, { grund: d.name });
          if (f.lp) api.verletze(f.lp, { grund: d.name });
          k.griff = false; k.griffRunden = 0;
          if (f.endet) K.beende('losgelassen');
        }
      }
      if (Z().kampf) HG.ausgabe.system('<span class="nebenbei">HALT ' + Math.max(0, k.halt) + (k.griff ? ' · sie hält dich fest' : '') + '</span>');
    },
    beende: function (art) {
      var k = Z().kampf, d = K.def(), api = A();
      if (!k) return;
      var tx = d.texte || {};
      var std = {
        aufgeloest: 'Sie löst sich auf, wie Rauch, den ein Luftzug zerreißt. Es ist still.',
        abgeschnitten: 'Das Glas ist blind. Was eben noch nach dir griff, ist abgeschnitten.',
        gebannt: 'Sie hält inne. Dann ist sie fort. Für diese Nacht.',
        geflohen: 'Du rennst. Hinter dir schlägt eine Tür.',
        illusion: 'Der Ton der Stimmgabel schwingt durch den Raum – und das, was du gesehen hast, fällt in sich zusammen wie ein schlecht gemaltes Bild.',
        losgelassen: 'Plötzlich ist der Griff fort.'
      };
      sag(wert(tx[art]) || std[art] || '');
      Z().kampf = null;
      if (art === 'geflohen') {
        var nach = G.nachbarn(Z().raum);
        var ziel = wert(d.fliehenNach) || nach[Math.floor(zufall() * nach.length)];
        if (ziel) HG.spiel.betrete(ziel);
      }
      if (st().wanderer && d.id === (HG.daten.spiel.wanderer || {}).manifestation && art !== 'geflohen') st().wanderer.fertig = true;
      if (d.nachher) d.nachher(api, art);
    }
  };
})(window.HG);
