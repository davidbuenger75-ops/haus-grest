// Haus Grest – Engine: Charakter (Eigenschaften, Fertigkeiten, Beruf, Lebenspunkte, Verletzungen)
//
// Regelsystem nach Delta Green; alle Zahlen und Namen stehen im Inhalt (HG.daten.spiel):
//   eigenschaften: [{ k, name, kurz }]   Werte 3–18, Probe = Wert × 5 %
//   fertigkeiten:  [{ k, name, basis: 20 | 'ge*2', koerperlich }]
//   berufe:        [{ id, name, boni: { fertigkeit: +% }, probeBoni: { eigenschaft: +% }, vorteile: [...] }]
//   lebenspunkte(e), willenspunkte(e), schwerVerletztAb, schwerMalus, schwerNerven, ersteHilfe
// Spielzustand: z.eigenschaften, z.fertigkeiten, z.beruf, z.werte.{lp,nerven,wp}, z.max…, z.wunden
(function (HG) {
  'use strict';

  function Z() { return HG.zustand.z; }
  function SP() { return HG.daten.spiel; }
  function wurf(n) { return 1 + Math.floor(HG.zufall() * n); }

  var C = HG.charakter = {
    eigenschaftListe: function () { return SP().eigenschaften || []; },
    fertigkeitListe: function () { return SP().fertigkeiten || []; },
    berufListe: function () { return SP().berufe || []; },
    eigenschaftDef: function (k) { return C.eigenschaftListe().filter(function (e) { return e.k === k; })[0] || null; },
    fertigkeitDef: function (k) { return C.fertigkeitListe().filter(function (f) { return f.k === k; })[0] || null; },
    berufDef: function (id) { return C.berufListe().filter(function (b) { return b.id === (id === undefined ? Z().beruf : id); })[0] || null; },
    berufName: function (id) { var b = C.berufDef(id); return b ? HG.text.fuelle(b.name) : ''; },
    hatVorteil: function (v) { var b = C.berufDef(); return !!(b && (b.vorteile || []).indexOf(v) >= 0); },

    /** 4W6, die niedrigste Augenzahl fällt weg – für jede Eigenschaft. Liefert { st: …, … } und die Einzelwürfe. */
    wuerfle: function () {
      var e = {}, einzeln = {};
      C.eigenschaftListe().forEach(function (d) {
        var w = [wurf(6), wurf(6), wurf(6), wurf(6)].sort(function (a, b) { return b - a; });
        e[d.k] = w[0] + w[1] + w[2];
        einzeln[d.k] = w;
      });
      return { werte: e, einzeln: einzeln };
    },

    /** Prüft verteilte Punkte. Liefert null (in Ordnung) oder einen Fehlertext. */
    pruefeVerteilung: function (zahlen) {
      var sp = SP(), liste = C.eigenschaftListe(), min = sp.eigenschaftMin || 3, max = sp.eigenschaftMax || 18, soll = sp.eigenschaftPunkte || 72;
      if (zahlen.length !== liste.length) return 'Bitte genau ' + liste.length + ' Zahlen angeben (' + liste.map(function (d) { return d.kurz; }).join(' ') + ').';
      if (zahlen.some(function (n) { return n < min || n > max; })) return 'Jede Eigenschaft muss zwischen ' + min + ' und ' + max + ' liegen.';
      var summe = zahlen.reduce(function (a, b) { return a + b; }, 0);
      if (summe !== soll) return 'Zusammen müssen es ' + soll + ' Punkte sein – du hast ' + summe + ' verteilt (' + (summe > soll ? summe - soll + ' zu viel' : soll - summe + ' zu wenig') + ').';
      return null;
    },

    /** Eigenschaften setzen und alles Abgeleitete neu berechnen. */
    setzeEigenschaften: function (e) {
      var z = Z(); z.eigenschaften = {};
      C.eigenschaftListe().forEach(function (d) { z.eigenschaften[d.k] = e[d.k]; });
      C.berechne(true);
    },
    setzeBeruf: function (id) { Z().beruf = id; C.berechne(false); },

    /** Fertigkeiten (Basis + Beruf) und Höchstwerte; voll = LP/WP auf das Maximum setzen. */
    berechne: function (voll) {
      var z = Z(), sp = SP(), e = z.eigenschaften || {}, b = C.berufDef();
      z.fertigkeiten = {};
      C.fertigkeitListe().forEach(function (f) {
        var basis = f.basis;
        if (typeof basis === 'string') { var m = /^(\w+)\*(\d+)$/.exec(basis); basis = m ? (e[m[1]] || 0) * +m[2] : 0; }
        z.fertigkeiten[f.k] = Math.min(99, basis + ((b && b.boni && b.boni[f.k]) || 0));
      });
      if (sp.lebenspunkte) z.max.lp = sp.lebenspunkte(e);
      if (sp.willenspunkte) z.max.wp = sp.willenspunkte(e);
      ['lp', 'wp'].forEach(function (k) {
        if (z.max[k] === undefined) return;
        if (voll || z.werte[k] === undefined) z.werte[k] = z.max[k];
        z.werte[k] = Math.min(z.werte[k], z.max[k]);
        z.start[k] = z.max[k];
      });
    },

    /** Zielwert einer Eigenschaftsprobe (Wert × 5 + Berufsbonus). */
    eigenschaftZiel: function (k) {
      var z = Z(), b = C.berufDef();
      return (z.eigenschaften[k] || 0) * 5 + ((b && b.probeBoni && b.probeBoni[k]) || 0);
    },
    istKoerperlich: function (k) {
      var f = C.fertigkeitDef(k);
      return (SP().koerperlich || []).indexOf(k) >= 0 || !!(f && f.koerperlich);
    },
    schwerVerletzt: function () { var z = Z(); return z.max.lp !== undefined && z.werte.lp <= (SP().schwerVerletztAb === undefined ? 2 : SP().schwerVerletztAb); },

    // ---------------------------------------------------------------- Verletzungen
    /** Schaden nehmen: spec '1W4', '2' … opt: { grund }. Liefert die Zahl der verlorenen LP. */
    verletze: function (spec, opt) {
      opt = opt || {};
      var z = Z(), sp = SP(), schaden = Math.max(1, HG.wuerfel(String(spec)));
      var warSchwer = C.schwerVerletzt();
      z.wunden = z.wunden || [];
      z.wunden.push({ lp: schaden, grund: opt.grund || '', versorgt: false });
      HG.api.aendere('lp', -schaden, opt.grund || 'Verletzung', true);
      HG.ausgabe.schreibe('wert', '<b>Verletzt</b>' + (opt.grund ? ' (' + HG.text.esc(opt.grund) + ')' : '') + ': −' + schaden + ' LP · jetzt ' + z.werte.lp + ' von ' + z.max.lp + '.' +
        (z.werte.lp > 0 && C.schwerVerletzt() ? ' <b>Du bist schwer verletzt.</b>' : ''), { delta: -schaden });
      if (z.werte.lp > 0 && warSchwer && sp.schwerNerven) HG.proben.nerven(sp.schwerNerven, { grund: 'weitere Verletzung' });
      return schaden;
    },
    heile: function (n, grund) {
      var z = Z(), vorher = z.werte.lp;
      z.werte.lp = Math.min(z.max.lp, z.werte.lp + n);
      if (z.werte.lp > vorher) HG.ausgabe.schreibe('wert', (grund ? HG.text.esc(grund) + ': ' : '') + '+' + (z.werte.lp - vorher) + ' LP · jetzt ' + z.werte.lp + ' von ' + z.max.lp + '.', { delta: z.werte.lp - vorher });
      if (HG.anzeige && HG.anzeige.blitz) HG.anzeige.blitz('lp', 1);
      return z.werte.lp - vorher;
    },
    /** Alle Wunden versorgt und LP voll (z. B. Krankenhaus). */
    vollHeilen: function (grund) { var z = Z(); C.heile(z.max.lp, grund); z.wunden = []; },

    /** Erste Hilfe: einmal pro Verletzung, Erfolg +1W4 LP (kritisch: das Maximum), Patzer −1 LP. */
    ersteHilfe: function (ctx) {
      var z = Z(), sp = SP();
      var wunde = (z.wunden || []).filter(function (w) { return !w.versorgt; }).pop();
      if (!wunde) { HG.ausgabe.text(z.werte.lp < z.max.lp ? 'Deine Wunden sind versorgt, so gut es eben geht. Jetzt hilft nur noch Ruhe.' : 'Dir fehlt nichts – zumindest nichts, was ein Verband heilen könnte.'); return; }
      wunde.versorgt = true;
      if (ctx) ctx.dauer = 10;
      var e = HG.proben.probe('erstehilfe', { grund: wunde.grund || 'Wunde versorgen' });
      if (e.erfolg) {
        var spec = sp.ersteHilfe || '1W4', n = e.kritisch ? HG.wuerfel(spec.replace(/(\d*)W(\d+)/i, function (m, a, b) { return String((+a || 1) * +b); })) : HG.wuerfel(spec);
        HG.ausgabe.text(e.kritisch ? 'Saubere Arbeit. Die Wunde ist gereinigt und fest verbunden, als hättest du das schon hundertmal getan.' : 'Du reinigst die Wunde, so gut es geht, und verbindest sie.');
        C.heile(n, 'Erste Hilfe');
      } else if (e.patzer) {
        HG.ausgabe.text('Deine Finger zittern. Du reißt die Wunde wieder auf.');
        z.werte.lp = Math.max(0, z.werte.lp - 1);
        HG.ausgabe.schreibe('wert', '−1 LP · jetzt ' + z.werte.lp + ' von ' + z.max.lp + '.', { delta: -1 });
      } else {
        HG.ausgabe.text('Du tust, was du kannst, aber es hilft kaum. Für diese Wunde kannst du nichts mehr tun.');
      }
    },

    /** Willenspunkte ausgeben, um dem Haus zu widerstehen. true = genug WP, abgezogen. */
    willenskraft: function (kosten, grund) {
      var z = Z(); kosten = kosten || 1;
      if (z.werte.wp === undefined || z.werte.wp < kosten) return false;
      HG.api.aendere('wp', -kosten, grund || 'Widerstand', true);
      return true;
    }
  };
})(window.HG);
