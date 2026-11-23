// Haus Grest – Engine: Handlungen
// Allgemeines Verhalten der Verben. Inhalte können jede Handlung übersteuern:
//   - pro Ding:  bei: { oeffnen: function (api, ctx) { ...; return true; } }
//   - pro Raum:  bei: { warten: function (api, ctx) { ... } }
//   - Texte:     texte: { oeffnen: 'Die Schublade klemmt, dann gibt sie nach.' }
// Gibt ein Haken "true" zurück, entfällt das allgemeine Verhalten.
(function (HG) {
  'use strict';

  var T = HG.text, W = HG.welt;
  function Z() { return HG.zustand.z; }
  function eig(id, k) { return HG.zustand.eig(id, k); }
  function setze(id, k, v) { HG.zustand.setze(id, k, v); }
  function D(id) { return HG.daten.dinge[id]; }
  function sag(h) { HG.ausgabe.text(h); }
  function der(id, k) { return T.der(id, k || 'akk'); }
  function Der(id, k) { return T.gross(T.der(id, k || 'nom')); }
  function ein(id, k) { return T.ein(id, k || 'akk'); }
  function Pron(id, k) { return T.gross(T.pron(id, k || 'nom')); }
  function vb(id, sg, pl) { return T.vb(id, sg, pl); }
  function ist(id) { return vb(id, 'ist', 'sind'); }
  function txt(id, key, ctx) { var t = D(id).texte && D(id).texte[key]; return t ? HG.wert(t, HG.api, ctx) : null; }
  function raum() { return W.raum(); }

  function istFest(id) { return !!(eig(id, 'fest') || D(id).tuer || D(id).orte || D(id).person); }

  /** Tragkraft: Dinge direkt beim Spieler. Nicht mit zählen: Inhalt getragener Behälter, das Handy
   *  und kleine Dinge (klein: true, Schlüssel). */
  function istKlein(id) { var d = D(id); return !!(d.istHandy || d.klein || d.istSchluessel); }
  function getragenZahl() {
    return W.kinder('spieler').filter(function (k) { return !istKlein(k); }).length;
  }
  function tragkraftVoll() {
    var max = HG.daten.spiel.tragkraft || 10;
    if (getragenZahl() < max) return false;
    sag('Du kannst nicht noch mehr tragen – du hast schon ' + max + ' Dinge bei dir. Leg zuerst etwas ab („lege … ab“).');
    return true;
  }

  /** Sorgt dafür, dass der Spieler das Ding hält (nimmt es notfalls). */
  function inDieHand(id) {
    if (W.getragen(id)) return true;
    if (istFest(id)) { sag('Dafür müsstest du ' + der(id) + ' in der Hand halten.'); return false; }
    if (!istKlein(id) && tragkraftVoll()) return false;
    setze(id, 'ort', 'spieler'); setze(id, 'rel', null);
    sag('<span class="nebenbei">(Du nimmst zuerst ' + der(id) + '.)</span>');
    return true;
  }

  function schluesselPasst(schl, id) {
    var s = D(id).schluessel;
    return Array.isArray(s) ? s.indexOf(schl) >= 0 : s === schl;
  }

  /** Gestaffelte Hinweise an verschlossenen Türen und Behältern: tipps: { verschlossen: { 2: '…', 3: '…' } } */
  function verschlossenTipp(id) {
    var t = D(id).tipps && D(id).tipps.verschlossen;
    if (t) HG.api.fehlversuch(id + '_verschlossen', t);
  }

  function inhaltListe(id, rel) {
    return W.kinder(id, rel).filter(function (k) { return !D(k).szenerie; });
  }

  function darinSatz(id) {
    var ks = inhaltListe(id, 'in');
    if (!ks.length) return '';
    var verb = ks.length === 1 && D(ks[0]).genus !== 'pl' ? (D(ks[0]).haltung || 'liegt') : 'liegen';
    if (verb === 'steht' && ks.length > 1) verb = 'stehen';
    return 'Darin ' + verb + ' ' + T.liste(ks.map(function (k) { return T.ein(k, 'nom'); })) + '.';
  }

  var A = HG.aktionen = {};

  // ================= Umsehen und Untersuchen =========================
  A.schauen = function () { W.beschreibeRaum(true); };

  A.untersuchen = function (ctx) {
    var id = ctx.obj, d = D(id);
    if (!W.hell()) {
      sag(HG.wert(d.tasten, HG.api, ctx) || 'Es ist zu dunkel, um viel zu erkennen. Du ertastest ' + ein(id) + '.');
      return;
    }
    if (d.rueckseite) setze(id, 'umgedreht', false);   // beim Untersuchen zuerst die Vorderseite
    var teile = [HG.wert(d.beschreibung, HG.api, ctx) || 'Du bemerkst nichts Besonderes an ' + der(id, 'dat') + '.'];
    if (d.oeffenbar && d.zeigeZustand !== false) teile.push(Pron(id) + ' ' + ist(id) + ' ' + (eig(id, 'offen') ? 'offen.' : 'geschlossen.'));
    if (d.lichtquelle && eig(id, 'brennt')) teile.push(Pron(id) + ' ' + vb(id, 'brennt', 'brennen') + '.');
    if (d.ablage) teile.push(W.inhaltSatz(id, 'auf'));
    if (d.behaelter && W.innenZugaenglich(id)) teile.push(W.inhaltSatz(id, 'in'));
    var b = eig(id, 'beschriftung');
    if (b) teile.push('Darauf steht in deiner Handschrift: „' + T.esc(b) + '“.');
    if (HG.macht) teile.push(HG.macht.beschreibungZusatz(id));   // Spiegel: zersprungen / wieder heil
    sag(teile.filter(Boolean).join(' '));
    W.enthuelle(id, 'untersuchen');
    if (d.hinweis && (d.hinweisBei || 'untersuchen') === 'untersuchen') HG.api.hinweis(d.hinweis);
  };

  A.lesen = function (ctx) {
    var id = ctx.obj, d = D(id);
    if (!W.hell()) { sag('Es ist zu dunkel zum Lesen.'); return; }
    // Steht die Schrift auf der Rückseite (rueckseite: { schrift: true }), wird das Ding dafür umgedreht.
    if (d.rueckseite && d.rueckseite.schrift && d.lesbar) {
      var schonHinten = !!eig(id, 'umgedreht');
      setze(id, 'umgedreht', true);
      zeigeSeite(id, true, ctx, schonHinten);
      if (d.hinweis && (d.hinweisBei === 'lesen' || d.hinweisBei === undefined)) HG.api.hinweis(d.hinweis);
      return;
    }
    var text = HG.wert(d.lesbar, HG.api, ctx);
    if (!text) {
      var b = eig(id, 'beschriftung');
      if (b) { sag('Du liest, was du selbst geschrieben hast: „' + T.esc(b) + '“.'); return; }
      sag('Auf ' + der(id, 'dat') + ' steht nichts, was du lesen könntest.'); return;
    }
    HG.ausgabe.schrift(text, d.schriftart);
    if (d.hinweis && (d.hinweisBei === 'lesen' || d.hinweisBei === undefined)) HG.api.hinweis(d.hinweis);
  };

  A.durchsuchen = function (ctx) {
    var id = ctx.obj, d = D(id);
    var f = W.enthuelle(id, 'durchsuchen');
    if (d.behaelter) {
      if (!W.innenZugaenglich(id)) { if (!f.length) sag(Der(id) + ' ' + ist(id) + ' geschlossen.'); return; }
      var s = W.inhaltSatz(id, 'in');
      if (s) sag(s); else if (!f.length) sag(Der(id) + ' ' + ist(id) + ' leer.');
      return;
    }
    if (d.ablage) {
      var s2 = W.inhaltSatz(id, 'auf');
      if (s2) sag(s2); else if (!f.length) sag('Auf ' + der(id, 'dat') + ' liegt nichts.');
      return;
    }
    if (!f.length) sag('Du durchsuchst ' + der(id) + ', findest aber nichts.');
  };

  A.hineinschauen = function (ctx) {
    var id = ctx.obj, d = D(id);
    var f = W.enthuelle(id, 'in');
    if (d.behaelter) {
      if (!W.innenZugaenglich(id)) { if (!f.length) sag(Der(id) + ' ' + ist(id) + ' geschlossen.'); return; }
      var s = W.inhaltSatz(id, 'in');
      if (s) sag(s); else if (!f.length) sag(Der(id) + ' ' + ist(id) + ' leer.');
      return;
    }
    if (!f.length) A.untersuchen(ctx);
  };

  A.unterschauen = function (ctx) {
    var f = W.enthuelle(ctx.obj, 'unter');
    if (!f.length) sag('Unter ' + der(ctx.obj, 'dat') + ' findest du nichts.');
  };

  A.hinterschauen = function (ctx) {
    var f = W.enthuelle(ctx.obj, 'hinter');
    if (!f.length) sag('Hinter ' + der(ctx.obj, 'dat') + ' ist nichts.');
  };

  // ================= Nehmen und Ablegen ==============================
  A.nehmen = function (ctx) {
    var id = ctx.obj, d = D(id);
    if (ctx.obj2 && eig(id, 'ort') !== ctx.obj2) {
      sag(Der(id) + ' ' + ist(id) + ' nicht ' + (eig(id, 'rel') === 'auf' ? 'auf ' : 'in ') + der(ctx.obj2, 'dat') + '.'); return;
    }
    if (W.inHand(id)) { sag('Du hast ' + der(id) + ' schon.'); return; }
    if (istFest(id)) {
      var f = HG.wert(eig(id, 'fest'), HG.api, ctx);
      sag(typeof f === 'string' ? f : Der(id) + ' ' + vb(id, 'lässt', 'lassen') + ' sich nicht mitnehmen.'); return;
    }
    if (!istKlein(id) && tragkraftVoll()) return;
    var ausBeh = !W.istRaum(eig(id, 'ort')) && eig(id, 'ort') !== 'spieler' ? eig(id, 'ort') : null;
    setze(id, 'ort', 'spieler'); setze(id, 'rel', null);
    if (ctx.mehrfach) { sag('Genommen.'); W.enthuelle(id, 'nehmen'); return; }
    sag(txt(id, 'nehmen', ctx) || ('Du nimmst ' + der(id) + (ausBeh && W.getragen(ausBeh) ? ' aus ' + der(ausBeh, 'dat') : '') + '.'));
    if (d.hinweis && d.hinweisBei === 'nehmen') HG.api.hinweis(d.hinweis);
    W.enthuelle(id, 'nehmen');   // was darunter lag (versteckt: { auchBei: { id: ['nehmen'] } })
  };

  A.abnehmen = function (ctx) {
    var f = W.enthuelle(ctx.obj, 'abnehmen');
    if (f.length) return;
    if (istFest(ctx.obj)) {
      sag(txt(ctx.obj, 'abnehmen', ctx) || Der(ctx.obj) + ' ' + vb(ctx.obj, 'lässt', 'lassen') + ' sich nicht abnehmen.');
      return;
    }
    A.nehmen(ctx);
  };

  A.ablegen = function (ctx) {
    var id = ctx.obj;
    if (!W.getragen(id)) { sag('Du hast ' + der(id) + ' gar nicht.'); return; }
    setze(id, 'ort', Z().raum); setze(id, 'rel', null);
    if (ctx.mehrfach) { sag('Abgelegt.'); return; }
    sag(txt(id, 'ablegen', ctx) || ('Du legst ' + der(id) + ' ab.'));
  };

  A.legen = function (ctx) {
    var id = ctx.obj, ziel = ctx.obj2, p = ctx.prep2;
    if (!p) { A.ablegen(ctx); return; }
    if (!ziel) { sag('Wohin willst du ' + der(id) + ' legen?'); return; }
    if (id === ziel) { sag('Das geht nicht.'); return; }
    if (p === 'unter' || p === 'hinter') { sag('Das bringt dir nichts.'); return; }
    // Kein Ding in sich selbst (auch nicht über Umwege)
    var o = ziel, n = 0;
    while (o && n++ < 20) { if (o === id) { sag('Das geht nicht.'); return; } o = eig(o, 'ort'); }
    if (p === 'in') {
      if (!D(ziel).behaelter) { sag('In ' + der(ziel) + ' kannst du nichts legen.'); return; }
      if (!W.innenZugaenglich(ziel)) { sag(Der(ziel) + ' ' + ist(ziel) + ' geschlossen.'); return; }
    } else if (p === 'auf') {
      if (!D(ziel).ablage) { sag('Auf ' + der(ziel) + ' kannst du nichts legen.'); return; }
    }
    if (!inDieHand(id)) return;
    setze(id, 'ort', ziel); setze(id, 'rel', p);
    if (ctx.mehrfach) { sag('Erledigt.'); return; }
    var verb = D(id).haltung === 'steht' ? 'stellst' : 'legst';
    sag('Du ' + verb + ' ' + der(id) + ' ' + p + ' ' + der(ziel) + '.');
  };

  // ================= Öffnen, Schließen, Schlüssel ====================
  A.oeffnen = function (ctx) {
    var id = ctx.obj, d = D(id);
    if (!d.oeffenbar) { sag(Der(id) + ' ' + vb(id, 'lässt', 'lassen') + ' sich nicht öffnen.'); return; }
    if (eig(id, 'offen')) { sag(Der(id) + ' ' + ist(id) + ' schon offen.'); return; }
    if (eig(id, 'verschlossen')) {
      if (ctx.obj2 && D(ctx.obj2).istSchluessel) { A.aufschliessen(ctx); if (eig(id, 'verschlossen')) return; }
      else { sag(txt(id, 'verschlossen', ctx) || Der(id) + ' ' + ist(id) + ' verschlossen.'); verschlossenTipp(id); return; }
    }
    setze(id, 'offen', true);
    var t = txt(id, 'oeffnen', ctx) || ('Du öffnest ' + der(id) + '.');
    if (d.behaelter) t += ' ' + (darinSatz(id) || Pron(id) + ' ' + ist(id) + ' leer.');
    sag(t);
    W.enthuelle(id, 'oeffnen');
  };

  A.schliessen = function (ctx) {
    var id = ctx.obj, d = D(id);
    if (!d.oeffenbar) { sag(Der(id) + ' ' + vb(id, 'lässt', 'lassen') + ' sich nicht schließen.'); return; }
    if (!eig(id, 'offen')) { sag(Der(id) + ' ' + ist(id) + ' schon geschlossen.'); return; }
    setze(id, 'offen', false);
    sag(txt(id, 'schliessen', ctx) || ('Du schließt ' + der(id) + '.'));
  };

  /** Passenden Schlüssel bestimmen (angegeben oder aus dem Inventar). */
  function findeSchluessel(ctx, wozu) {
    var id = ctx.obj;
    if (ctx.obj2) {
      if (!D(ctx.obj2).istSchluessel) { sag('Mit ' + der(ctx.obj2, 'dat') + ' kannst du ' + der(id) + ' nicht ' + wozu + '.'); return null; }
      if (!inDieHand(ctx.obj2)) return null;
      if (!schluesselPasst(ctx.obj2, id)) { sag(Der(ctx.obj2) + ' passt nicht.'); return null; }
      return ctx.obj2;
    }
    var meine = W.inventar().filter(function (k) { return D(k).istSchluessel; });
    var passend = meine.filter(function (k) { return schluesselPasst(k, id); });
    if (passend.length) { sag('<span class="nebenbei">(mit ' + der(passend[0], 'dat') + ')</span>'); return passend[0]; }
    if (meine.length === 1) sag(Der(meine[0]) + ' passt nicht.');
    else if (meine.length > 1) sag('Keiner deiner Schlüssel passt.');
    else sag(txt(id, 'keinSchluessel', ctx) || 'Du hast nichts, womit du ' + der(id) + ' ' + wozu + ' könntest.');
    return null;
  }

  A.aufschliessen = function (ctx) {
    var id = ctx.obj, d = D(id);
    if (d.schluessel === undefined) { sag(Der(id) + ' ' + vb(id, 'hat', 'haben') + ' kein Schloss.'); return; }
    if (!eig(id, 'verschlossen')) { sag(Der(id) + ' ' + ist(id) + ' nicht verschlossen.'); return; }
    if (!findeSchluessel(ctx, 'aufschließen')) return;
    setze(id, 'verschlossen', false);
    sag(txt(id, 'aufschliessen', ctx) || ('Du schließt ' + der(id) + ' auf. Das Schloss gibt mit einem Klicken nach.'));
  };

  A.abschliessen = function (ctx) {
    var id = ctx.obj, d = D(id);
    if (d.schluessel === undefined) { sag(Der(id) + ' ' + vb(id, 'hat', 'haben') + ' kein Schloss.'); return; }
    if (eig(id, 'verschlossen')) { sag(Der(id) + ' ' + ist(id) + ' schon verschlossen.'); return; }
    if (eig(id, 'offen')) { sag('Du musst ' + der(id) + ' zuerst schließen.'); return; }
    if (!findeSchluessel(ctx, 'abschließen')) return;
    setze(id, 'verschlossen', true);
    sag(txt(id, 'abschliessen', ctx) || ('Du schließt ' + der(id) + ' ab.'));
  };

  // ================= Bewegen =========================================
  A.anheben = function (ctx) {
    var id = ctx.obj;
    var f = W.enthuelle(id, 'anheben').concat(W.enthuelle(id, 'unter'));
    if (f.length) return;
    if (istFest(id) && !D(id).anhebbar) { sag(Der(id) + ' ' + vb(id, 'lässt', 'lassen') + ' sich nicht anheben.'); return; }
    sag('Du hebst ' + der(id) + ' kurz an, findest darunter aber nichts.');
  };

  A.schieben = function (ctx) {
    var id = ctx.obj;
    if (W.enthuelle(id, 'schieben').length) return;
    if (istFest(id)) sag(Der(id) + ' ' + vb(id, 'rührt', 'rühren') + ' sich nicht von der Stelle.');
    else sag('Du schiebst ' + der(id) + ' ein Stück zur Seite. Nichts geschieht.');
  };

  A.ziehen = function (ctx) {
    var id = ctx.obj;
    if (D(id).oeffenbar && !eig(id, 'offen')) { A.oeffnen(ctx); return; }
    if (W.enthuelle(id, 'ziehen').length) return;
    sag('Du ziehst an ' + der(id, 'dat') + '. Nichts geschieht.');
  };

  A.druecken = function (ctx) {
    var id = ctx.obj;
    if (D(id).oeffenbar && eig(id, 'offen')) { A.schliessen(ctx); return; }
    if (W.enthuelle(id, 'druecken').length) return;
    sag('Du drückst auf ' + der(id) + '. Nichts geschieht.');
  };

  // ================= Umdrehen (Fotos, Karten … mit Rückseite) ===========
  //   rueckseite: { beschreibung: '…', vorne: '…', schrift: true }
  //     beschreibung = beim Umdrehen auf die Rückseite, vorne = beim Zurückdrehen (sonst die normale Beschreibung),
  //     schrift: true = der lesbar-Text steht hinten (wird unter dem Bild gezeigt)
  //   Bilder: ding-<id> (Vorderseite) und ding-<id>-rueckseite. Zustand: eig(id, 'umgedreht').
  function zeigeSeite(id, hinten, ctx, liegtSchon) {
    var d = D(id), r = d.rueckseite;
    if (hinten) {
      if (!liegtSchon) sag(HG.wert(r.beschreibung, HG.api, ctx) || 'Du drehst ' + der(id) + ' um.');
      HG.spiel.zeigeFundBild(id, ctx);                       // Bild vor der Schrift, die Schrift steht darunter
      if (r.schrift && d.lesbar) HG.ausgabe.schrift(HG.wert(d.lesbar, HG.api, ctx), d.schriftart);
    } else {
      sag(HG.wert(r.vorne, HG.api, ctx) || HG.wert(d.beschreibung, HG.api, ctx) || 'Du drehst ' + der(id) + ' wieder um.');
      HG.spiel.zeigeFundBild(id, ctx);
    }
  }
  A.umdrehen = function (ctx) {
    var id = ctx.obj;
    if (!id) { sag(HG.wert(HG.daten.spiel.umdrehenText, HG.api, ctx) || 'Du drehst dich um. Da ist nichts.'); return; }
    var d = D(id);
    if (!d.rueckseite) {
      if (W.enthuelle(id, 'drehen').length) return;
      sag(istFest(id) ? Der(id) + ' ' + vb(id, 'lässt', 'lassen') + ' sich nicht umdrehen.' : 'Du drehst ' + der(id) + ' um. Auf der anderen Seite ist nichts Besonderes.');
      return;
    }
    if (!W.hell()) { sag('Es ist zu dunkel, um viel zu erkennen.'); return; }
    var hinten = !eig(id, 'umgedreht');
    setze(id, 'umgedreht', hinten);
    zeigeSeite(id, hinten, ctx);
  };

  A.drehen = function (ctx) {
    if (W.enthuelle(ctx.obj, 'drehen').length) return;
    sag(istFest(ctx.obj) ? Der(ctx.obj) + ' ' + vb(ctx.obj, 'lässt', 'lassen') + ' sich nicht drehen.' : 'Du drehst ' + der(ctx.obj) + ' in den Händen. Nichts geschieht.');
  };

  // ================= Licht ===========================================
  A.anzuenden = function (ctx) {
    var id = ctx.obj, d = D(id);
    if (eig(id, 'brennt')) { sag(Der(id) + ' ' + vb(id, 'brennt', 'brennen') + (d.schalter ? ' schon.' : ' schon.')); return; }
    if (d.schalter) {
      // Lampen, Handy-Taschenlampe: kein Feuer nötig
      var dunkelVorher = !W.hell();
      setze(id, 'brennt', true);
      sag(txt(id, 'anzuenden', ctx) || ('Du schaltest ' + der(id) + ' ein.'));
      if (dunkelVorher && W.hell()) W.beschreibeRaum(true);
      return;
    }
    if (!d.anzuendbar) { sag(txt(id, 'anzuenden', ctx) || Der(id) + ' ' + vb(id, 'lässt', 'lassen') + ' sich nicht anzünden.'); return; }
    var feuer = ctx.obj2;
    if (feuer && !D(feuer).feuer) { sag('Mit ' + der(feuer, 'dat') + ' kannst du nichts anzünden.'); return; }
    if (!feuer) feuer = W.inventar().filter(function (k) { return D(k).feuer; })[0];
    if (!feuer) { sag('Du hast nichts, womit du ' + der(id) + ' anzünden könntest.'); return; }
    if (!inDieHand(feuer)) return;
    var warDunkel = !W.hell();
    setze(id, 'brennt', true);
    ctx.feuer = feuer;
    sag(txt(id, 'anzuenden', ctx) || ('Du zündest ' + der(id) + ' mit ' + der(feuer, 'dat') + ' an.'));
    if (warDunkel && W.hell()) W.beschreibeRaum(true);
  };

  A.loeschen = function (ctx) {
    var id = ctx.obj;
    if (!eig(id, 'brennt')) { sag(Der(id) + ' ' + vb(id, 'brennt', 'brennen') + ' nicht.'); return; }
    setze(id, 'brennt', false);
    sag(txt(id, 'loeschen', ctx) || ((D(id).schalter ? 'Du schaltest ' + der(id) + ' aus' : 'Du löschst ' + der(id)) + '.'));
    if (!W.hell()) sag(HG.daten.spiel.wirdDunkelText || 'Die Dunkelheit schließt sich um dich.');
  };

  // ================= Sinne ===========================================
  A.horchen = function (ctx) {
    if (ctx.obj) { sag(HG.wert(D(ctx.obj).horchen, HG.api, ctx) || 'Du lauschst an ' + der(ctx.obj, 'dat') + '. Nichts.'); return; }
    sag(HG.wert(raum().horchen, HG.api, ctx) || 'Du hörst nur deinen eigenen Atem.');
  };

  A.riechen = function (ctx) {
    if (ctx.obj) { sag(HG.wert(D(ctx.obj).riechen, HG.api, ctx) || 'Du riechst an ' + der(ctx.obj, 'dat') + '. Nichts Besonderes.'); return; }
    sag(HG.wert(raum().riechen, HG.api, ctx) || 'Du riechst nichts Besonderes.');
  };

  A.tasten = function (ctx) {
    var hell = W.hell();
    if (ctx.obj) {
      var t = HG.wert(D(ctx.obj).tasten, HG.api, ctx);
      sag(t || (hell ? 'Du fühlst nichts Ungewöhnliches.' : 'Du ertastest ' + ein(ctx.obj) + '.'));
      W.enthuelle(ctx.obj, 'tasten');
      return;
    }
    var rt = HG.wert(raum().tasten, HG.api, ctx);
    if (rt) { sag(rt); return; }
    sag(hell ? 'Du streichst mit den Fingern über Wände und Möbel. Nichts Ungewöhnliches.'
      : 'Du tastest dich durch die Dunkelheit, findest aber nichts Greifbares.');
  };

  A.klopfen = function (ctx) {
    if (!ctx.obj) { sag('Du klopfst gegen die Wand. Das Geräusch verhallt.'); return; }
    var t = HG.wert(D(ctx.obj).klopfen, HG.api, ctx);
    sag(t || (D(ctx.obj).tuer ? 'Du klopfst an ' + der(ctx.obj) + '. Niemand antwortet.' : 'Du klopfst auf ' + der(ctx.obj) + '. Es klingt dumpf.'));
  };

  // ================= Gewalt und Körper ===============================
  A.zerbrechen = function (ctx) {
    var M = HG.macht;
    // Spiegel lassen sich zerschlagen – sie erneuern sich aber über Nacht (Spielbibel 8.2)
    if (M && M.groesse(ctx.obj) && D(ctx.obj).spiegelZerbrechlich !== false) {
      if (eig(ctx.obj, 'zerbrochen')) { sag(M.text('schonZerbrochen') || T.gross(T.der(ctx.obj, 'nom')) + ' ist schon zersprungen.'); return; }
      M.zerbrich(ctx.obj);
      HG.api.sound('spiegel-zerbricht');
      sag(HG.wert(D(ctx.obj).zerbrechen, HG.api, ctx) || M.text('zerbrechen') || 'Das Glas zerspringt.');
      return;
    }
    sag(HG.wert(D(ctx.obj).zerbrechen, HG.api, ctx) || 'Du hast keinen Grund, ' + der(ctx.obj) + ' zu zerstören.');
  };
  A.reissen = function (ctx) {
    sag(HG.wert(D(ctx.obj).reissen, HG.api, ctx) || 'Daran zu reißen bringt nichts.');
  };
  A.klettern = function (ctx) {
    if (ctx.obj) { sag(HG.wert(D(ctx.obj).klettern, HG.api, ctx) || 'Auf ' + der(ctx.obj) + ' kannst du nicht klettern.'); return; }
    sag(HG.wert(raum().klettern, HG.api, ctx) || 'Hier gibt es nichts, worauf du klettern könntest.');
  };
  A.verstecken = function (ctx) {
    if (ctx.obj && !ctx.prep && !ctx.reflexiv) { sag('Es gibt keinen Grund, ' + der(ctx.obj) + ' zu verstecken.'); return; }
    if (ctx.obj) {
      var v = HG.wert(D(ctx.obj).versteck, HG.api, ctx);
      if (v) { Z().versteckt = ctx.obj; sag(v); return; }
      sag((ctx.prep ? T.gross(ctx.prep) : 'Bei') + ' ' + der(ctx.obj, 'dat') + ' kannst du dich nicht verstecken.');
      return;
    }
    sag(HG.wert(raum().versteck, HG.api, ctx) || 'Hier gibt es kein gutes Versteck.');
  };
  A.warten = function (ctx) {
    var t = HG.wert(raum().warten, HG.api, ctx);
    if (!t) {
      var liste = HG.daten.spiel.wartenTexte || ['Du wartest. Die Zeit vergeht.'];
      t = liste[Z().zug % liste.length];
    }
    sag(t);
  };

  // ================= Gespräche =======================================
  function themaText(d, ctx) {
    var themen = d.themen || {};
    var woerter = ctx.thema || [];
    var keys = Object.keys(themen);
    for (var i = 0; i < keys.length; i++) {
      var sw = keys[i].split(/[ ,]+/).map(T.norm);
      if (woerter.some(function (w) { return sw.indexOf(w) >= 0; })) return HG.wert(themen[keys[i]], HG.api, ctx);
    }
    return null;
  }
  A.sprechen = function (ctx) {
    var d = D(ctx.obj);
    if (ctx.thema && ctx.thema.length) { A.fragen(ctx); return; }
    if (d.person) sag(HG.wert(d.gespraech, HG.api, ctx) || Der(ctx.obj) + ' ' + vb(ctx.obj, 'antwortet', 'antworten') + ' nicht.');
    else sag(HG.wert(d.gespraech, HG.api, ctx) || 'Du sprichst ' + der(ctx.obj) + ' an. Keine Antwort.');
  };
  A.fragen = function (ctx) {
    var d = D(ctx.obj);
    if (!ctx.thema || !ctx.thema.length) { sag('Wonach willst du ' + der(ctx.obj) + ' fragen?'); return; }
    var t = themaText(d, ctx);
    if (t) { sag(t); return; }
    sag(HG.wert(d.themaSonst, HG.api, ctx) || (d.person ? Der(ctx.obj) + ' ' + vb(ctx.obj, 'weiß', 'wissen') + ' darauf nichts zu sagen.' : 'Keine Antwort.'));
  };
  A.sagen = function (ctx) {
    if (!ctx.text) { sag('Was willst du sagen?'); return; }
    sag('Du sagst: „' + T.esc(ctx.text) + '“. ' + (HG.daten.spiel.sagenText || 'Niemand antwortet.'));
  };
  A.zeigen = function (ctx) {
    if (!ctx.obj2) { sag('Wem willst du ' + der(ctx.obj) + ' zeigen?'); return; }
    if (!inDieHand(ctx.obj)) return;
    sag(D(ctx.obj2).person ? Der(ctx.obj2) + ' ' + vb(ctx.obj2, 'zeigt', 'zeigen') + ' keine Reaktion.' : 'Du hältst ' + der(ctx.obj) + ' vor ' + der(ctx.obj2, 'akk') + '. Nichts geschieht.');
  };
  A.geben = function (ctx) {
    if (!ctx.obj2) { sag('Wem willst du ' + der(ctx.obj) + ' geben?'); return; }
    if (!inDieHand(ctx.obj)) return;
    sag(D(ctx.obj2).person ? Der(ctx.obj2) + ' ' + vb(ctx.obj2, 'will', 'wollen') + ' ' + der(ctx.obj) + ' nicht.' : (Der(ctx.obj2) + ' kann nichts annehmen.'));
  };

  // ================= Werkzeuge =======================================
  A.benutzen = function (ctx) {
    var a = D(ctx.obj), b = ctx.obj2 && D(ctx.obj2);
    var neu = function (aktion, obj, obj2) { HG.spiel.handle(Object.assign({}, ctx, { aktion: aktion, obj: obj, obj2: obj2 })); };
    if (a.istSchluessel && b) return neu(eig(ctx.obj2, 'verschlossen') ? 'aufschliessen' : 'abschliessen', ctx.obj2, ctx.obj);
    if (a.feuer && b) return neu('anzuenden', ctx.obj2, ctx.obj);
    if (a.oel && b) return neu('oelen', ctx.obj2, ctx.obj);
    if (b && b.feuer && a.anzuendbar) return neu('anzuenden', ctx.obj, ctx.obj2);
    if (a.anzuendbar && !b) return neu(eig(ctx.obj, 'brennt') ? 'loeschen' : 'anzuenden', ctx.obj, null);
    if (a.lesbar && !b) return neu('lesen', ctx.obj, null);
    if (a.oeffenbar && !b) return neu(eig(ctx.obj, 'offen') ? 'schliessen' : 'oeffnen', ctx.obj, null);
    if (a.feuer && !b) { sag('Was willst du damit anzünden?'); return; }
    sag('Wie genau willst du ' + der(ctx.obj) + ' benutzen? Versuche einen genaueren Befehl, z.&nbsp;B. „öffne …“, „schließe … mit … auf“ oder „zünde … an“.');
  };

  A.kombinieren = function (ctx) {
    if (!ctx.obj2) { sag('Womit willst du ' + der(ctx.obj) + ' kombinieren?'); return; }
    var h1 = D(ctx.obj).hinweis, h2 = D(ctx.obj2).hinweis;
    if (h1 && h2 && Z().hinweise.indexOf(h1) >= 0 && Z().hinweise.indexOf(h2) >= 0) { HG.spiel.kombiniereHinweise(h1, h2); return; }
    sag(Der(ctx.obj) + ' und ' + der(ctx.obj2, 'nom') + ' lassen sich nicht sinnvoll kombinieren.');
  };

  A.schreiben = function (ctx) {
    if (!ctx.text) { sag('Was willst du schreiben? Setze den Text in Anführungszeichen, z.&nbsp;B. schreibe "Hilfe" ins Notizbuch.'); return; }
    if (ctx.insNotizbuch || (!ctx.obj2 && /^notier/.test(ctx.verb || ''))) {
      Z().notizen.push(ctx.text);
      HG.ausgabe.hinweis('Du notierst im Notizbuch: „' + T.esc(ctx.text) + '“');
      return;
    }
    if (!ctx.obj2) { sag('Worauf willst du schreiben? (Ins Notizbuch: schreibe "…" ins Notizbuch)'); return; }
    if (!D(ctx.obj2).beschreibbar) { sag('Auf ' + der(ctx.obj2) + ' kannst du nicht schreiben.'); return; }
    var stift = W.inventar().filter(function (k) { return D(k).schreibgeraet; })[0];
    if (!stift) { sag('Du hast nichts, womit du schreiben könntest.'); return; }
    var alt = eig(ctx.obj2, 'beschriftung');
    setze(ctx.obj2, 'beschriftung', alt ? alt + ' … ' + ctx.text : ctx.text);
    sag('Du schreibst mit ' + der(stift, 'dat') + ' „' + T.esc(ctx.text) + '“ auf ' + der(ctx.obj2) + '.');
  };

  A.eintippen = function (ctx) {
    // Ziffern an einem Zahlenschloss in der Nähe? ("tippe 1205", "gib 1205 ein")
    var ziffern = String(ctx.text || '').replace(/\D/g, '');
    var schloss = ziffern && W.umfeld().filter(function (id) { return D(id).zahlenschloss; })[0];
    if (schloss) return HG.spiel.handle(Object.assign({}, ctx, { aktion: 'einstellen', obj: schloss, thema: [ziffern] }));
    sag('Hier gibt es nichts, wo du etwas eintippen könntest.');
  };

  // ================= Zahlenschloss ==================================
  //   zahlenschloss: { stellen: 4, code: '1205', bereit: fn(api) -> true | 'Text, warum nicht',
  //                    richtig: fn(api, ctx), falsch: 'Text' | fn }   Teile verweisen mit teilVon: 'id' darauf.
  //   tipps: { gesperrt: { 2: …, 3: … }, falsch: { 2: …, 3: … } } – gestaffelte Hinweise nach Fehlversuchen
  //   (api.fehlversuch; Zähler "<id>_gesperrt" bzw. "<id>_falsch").
  //   Zustand: eig(id, 'ziffern') – die zuletzt eingestellte Zahl.
  A.einstellen = function (ctx) {
    var id = ctx.obj, d = D(id);
    if (!d.zahlenschloss && d.teilVon && D(d.teilVon).zahlenschloss) { id = d.teilVon; d = D(id); }
    var ziffern = (ctx.thema || []).join('').replace(/\D/g, '');
    if (!d.zahlenschloss) {
      if (!ziffern) return HG.spiel.handle(Object.assign({}, ctx, { aktion: 'drehen' }));   // "drehe X" ohne Zahl
      sag('An ' + der(ctx.obj, 'dat') + ' lässt sich keine Zahl einstellen.'); return;
    }
    var zs = d.zahlenschloss, n = zs.stellen || 4;
    if (!W.hell()) { sag('Es ist zu dunkel, um die Ziffern zu erkennen.'); return; }
    if (!ziffern) { sag('Auf welche Zahl? Zum Beispiel: „drehe die Ringe auf ' + '1234567890'.slice(0, n) + '“.'); return; }
    if (ziffern.length !== n) { sag('Es sind ' + n + ' Ringe – du brauchst eine ' + n + '-stellige Zahl.'); return; }
    var bereit = HG.wert(zs.bereit, HG.api, ctx);
    if (bereit !== undefined && bereit !== true) {
      sag(typeof bereit === 'string' ? bereit : 'Die Ringe rühren sich nicht.');
      if (zs.tipps && zs.tipps.gesperrt) HG.api.fehlversuch(id + '_gesperrt', zs.tipps.gesperrt);
      return;
    }
    setze(id, 'ziffern', ziffern);
    if (ziffern === String(HG.wert(zs.code, HG.api, ctx))) { if (zs.richtig) zs.richtig(HG.api, ctx); return; }
    sag(HG.wert(zs.falsch, HG.api, ctx) || 'Du stellst die Ringe auf ' + ziffern.split('').join(' – ') + '. Nichts geschieht.');
    if (zs.tipps && zs.tipps.falsch) HG.api.fehlversuch(id + '_falsch', zs.tipps.falsch);
  };

  // ================= Erste Hilfe, Knacken ===========================
  A.ersteHilfe = function (ctx) { HG.charakter.ersteHilfe(ctx); };
  A.behandeln = function () { sag('Hier ist niemand, der dich behandeln könnte. Für Wunden gibt es Erste Hilfe („versorge wunde“) – oder das Krankenhaus.'); };
  // Nahansicht (Ding mit "nahansicht"): öffnet die Ansicht in der Oberfläche, sonst wie Untersuchen
  A.nahansicht = function (ctx) {
    ctx.dauer = 0;
    if (!D(ctx.obj).nahansicht) { A.untersuchen(ctx); return; }
    if (!W.hell()) { sag('Es ist zu dunkel, um Einzelheiten zu erkennen.'); return; }
    if (HG.anzeige && HG.anzeige.zeigeNah) { HG.anzeige.zeigeNah(ctx.obj); sag('Du siehst dir ' + der(ctx.obj) + ' aus der Nähe an.'); }
    else A.untersuchen(ctx);
  };
  A.schuetteln = function (ctx) { sag(txt(ctx.obj, 'schuetteln', ctx) || (istFest(ctx.obj) ? Der(ctx.obj) + ' ' + vb(ctx.obj, 'rührt', 'rühren') + ' sich nicht.' : 'Du schüttelst ' + der(ctx.obj) + '. Nichts klappert.')); };
  // Ölen: braucht ein Ding mit "oel: true" (angegeben oder im Inventar). Inhalte übersteuern mit bei.oelen / texte.oelen.
  A.oelen = function (ctx) {
    var oel = ctx.obj2 || W.inventar().filter(function (k) { return D(k).oel; })[0];
    if (!oel) { sag('Du hast nichts, womit du ' + der(ctx.obj) + ' ölen könntest.'); return; }
    if (!D(oel).oel) { sag('Mit ' + der(oel, 'dat') + ' kannst du nichts ölen.'); return; }
    if (!inDieHand(oel)) return;
    sag(txt(ctx.obj, 'oelen', ctx) || 'Du träufelst ein wenig Öl auf ' + der(ctx.obj) + '. ' + Pron(ctx.obj) + ' ' + vb(ctx.obj, 'glänzt', 'glänzen') + ' jetzt. Sonst ändert sich nichts.');
  };
  A.spielen = function (ctx) { sag(HG.wert(D(ctx.obj).spielen, HG.api, ctx) || 'Auf ' + der(ctx.obj, 'dat') + ' kannst du nicht spielen.'); };
  A.knacken = function (ctx) { sag('An ' + der(ctx.obj, 'dat') + ' gibt es nichts, was du knacken könntest.'); };
  A.winken = function () { sag(HG.wert(raum().winken, HG.api) || 'Du fuchtelst mit den Armen. Niemand sieht es – hoffentlich.'); };

  // ================= Gehen ===========================================
  A.gehen = function (ctx) {
    var r = raum(), richtung = ctx.richtung;
    if (!richtung) { sag('Wohin willst du gehen?'); return; }
    var a = (r.ausgaenge || {})[richtung];
    if (!a) { sag(HG.wert(r.keinWeg, HG.api, ctx) || 'In diese Richtung geht es nicht weiter.'); return; }
    if (typeof a === 'string') a = { ziel: a };
    if (a.sperre) {
      var s = HG.wert(a.sperre, HG.api, ctx);
      if (s) { sag(s); return; }
    }
    if (a.tuer && !eig(a.tuer, 'offen')) {
      if (eig(a.tuer, 'verschlossen')) { sag(txt(a.tuer, 'verschlossen', ctx) || Der(a.tuer) + ' ' + ist(a.tuer) + ' verschlossen.'); verschlossenTipp(a.tuer); return; }
      setze(a.tuer, 'offen', true);
      sag('<span class="nebenbei">(Du öffnest zuerst ' + der(a.tuer) + '.)</span>');
    }
    if (r.beimVerlassen && r.beimVerlassen(HG.api, { richtung: richtung, ziel: a.ziel })) return;
    if (a.text) sag(HG.wert(a.text, HG.api, ctx));
    HG.spiel.betrete(a.ziel);
  };
})(window.HG);
