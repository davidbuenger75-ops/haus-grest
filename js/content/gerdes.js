// Haus Grest – Inhalt: Schauplatz WOHNUNG GERDES, Unna (Akt 2)
// Spielbibel 5b (Brigitte „redet vielleicht“, schaltet das Altenheim frei – David), 8.6.5 (Gespräch mit Brigitte =
// 2. Quelle für Bettina), 9.3. Namen, Wortlaut und Ablauf [Vorschlag von Claude, 27.11.2026].
//
// Räume:  gerdes (Treppenhaus vor der Wohnungstür, Ankunft)  –hinein→  gerdes_wohnung (Wohnzimmer)
// Ablauf: Brigitte öffnet nur mit vorgelegter Kette. Egal, wie das Gespräch an der Tür ausgeht, nennt sie das Altenheim
//         (Davids Festlegung: „Sie werden’s merken.“). Hereingelassen wird man auf einem von drei Wegen:
//           Kopf      – sie fragen, ob das Haus auch ihr von fremden Nummern schreibt (braucht Carstens Tagebuch o. Ä.)
//           Anker     – ihr Bettinas Haarspange zeigen (Puppenhaus im Kinderzimmer)
//           Fertigkeit – Überreden (misslungen: heute nicht mehr, gestaffelte Hinweise)
// Drinnen: ihre Geschichte (Hinweis „Was Brigitte erzählt“ → Seele Bettina) und Bettinas Schulreferat über eine
//          Zeitzeugin im Altenheim (Lotte W., Tochter der Köchin der Grests).
(function () {

  var BESUCHSZEIT = { von: '08:00', bis: '18:00' };

  HG.ziel('gerdes', {
    name: 'Wohnung Gerdes (Unna)', herkunft: 'Von Brigitte Gerdes',
    woerter: ['gerdes', 'unna', 'brigitte', 'kreuzkamp'],
    ankunft: 'gerdes', fahrzeit: 35, geoeffnet: BESUCHSZEIT,
    geschlossen: 'Um diese Uhrzeit bei einer fremden Frau klingeln, die nicht reden will? Brigitte Gerdes würde nicht öffnen. Besser morgen ab acht.',
    fahrt: { tag: 'Du fährst über die B 1 nach Unna. Am Kreuzkamp stehen Mehrfamilienhäuser aus den Siebzigern in einer Reihe, eins wie das andere.',
      abend: 'Du fährst im Feierabendverkehr nach Unna. Am Kreuzkamp gehen hinter den Fenstern die Fernseher an.' }
  });

  // ===================================================================
  // TREPPENHAUS
  // ===================================================================
  HG.raum('gerdes', {
    name: 'Vor der Wohnung Gerdes', woerter: ['treppenhaus', 'flur', 'hausflur'],
    schauplatz: 'gerdes', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: function (api) {
      var t = 'Ein Treppenhaus aus den Siebzigern: Waschbeton, Geländer mit braunem Kunststoffhandlauf, ein Geruch nach Bohnensuppe und Reinigungsmittel. Im Erdgeschoss eine Wohnungstür mit dem Schild „Gerdes“. ';
      if (api.flag('gerdes_herein')) return t + 'Die Tür ist nur angelehnt. Brigitte hat dir offen gelassen.';
      if (api.flag('gerdes_tuer_zu')) return t + 'Sie ist zu. Hinter dem Spion bewegt sich ein Schatten, dann nichts mehr.';
      return t + 'Sie steht einen Spalt offen, die Kette vorgelegt. Dahinter: Brigitte Gerdes.';
    },
    kurz: function (api) { return 'Das Treppenhaus vor der Wohnung Gerdes. ' + (api.flag('gerdes_herein') ? 'Die Tür ist angelehnt.' : api.flag('gerdes_tuer_zu') ? 'Die Tür ist zu.' : 'Die Tür ist einen Spalt offen, die Kette vorgelegt.'); },
    riechen: 'Bohnensuppe aus dem ersten Stock, Reinigungsmittel, kalter Zigarettenrauch.',
    horchen: 'Irgendwo oben ein Fernseher. Draußen schreien Kinder beim Fußball. Hinter Brigittes Tür ist es sehr still.',
    ausgaenge: {
      // Erst, wenn Brigitte einen hereinlässt, gibt es den Weg hinein (Alpha-Test: kein „geh hinein“ vor geschlossener Tür)
      hinein: { ziel: 'gerdes_wohnung', unsichtbar: function (api) { return !api.flag('gerdes_herein'); }, sperre: function (api) {
        return api.flag('gerdes_herein') ? null : (api.flag('gerdes_tuer_zu') ? 'Die Tür ist zu. <span class="nebenbei">(„klopfe an die tür“)</span>' : 'Die Kette ist vorgelegt, und Brigitte macht keine Anstalten, sie abzunehmen. <span class="nebenbei">(„sprich mit brigitte“)</span>');
      } }
    },
    vorBetreten: function (api) { if (!api.flag('gerdes_herein')) { api.bewege('brigitte', 'gerdes'); api.setzeFlag('gerdes_tuer_zu', false); } },
    beimBetreten: function (api, info) {
      if (api.flag('gerdes_herein')) return;
      api.sage(info.erstesMal
        ? 'Du hast kaum geklingelt, da geht die Tür einen Spalt auf. Eine Frau um die fünfzig, die Kette vorgelegt. „Sie kommen wegen dem Haus“, sagt sie. Es ist keine Frage. <span class="nebenbei">(„sprich mit brigitte“)</span>'
        : 'Die Tür geht wieder einen Spalt auf, die Kette bleibt vor. Brigitte sieht dich an, als hätte sie gewusst, dass du wiederkommst.');
    },
    vorschlaege: function (api) {
      if (api.flag('gerdes_herein')) return ['geh hinein'];
      if (api.flag('gerdes_tuer_zu')) return api.traegt('haarspange') ? ['klopfe an die tür', 'zeige brigitte die haarspange'] : ['klopfe an die tür'];
      var v = ['sprich mit brigitte'];
      if (api.traegt('haarspange')) v.push('zeige brigitte die haarspange');
      return v;
    },
    details: [
      { nomen: 'Briefkästen', genus: 'pl', woerter: ['briefkaesten', 'briefkasten', 'post'],
        text: 'Eine Reihe Briefkästen. Bei „Gerdes“ ist das Namensschild zweimal überklebt worden: erst „P. + B. Gerdes“, darüber nur noch „B. Gerdes“.' }
    ]
  });

  // Die Wohnungstür (eigenes Ding, damit man klopfen und klingeln kann)
  HG.ding('gerdes_tuer', {
    nomen: 'Wohnungstür', genus: 'f', woerter: ['tuer', 'wohnungstuer', 'kette', 'tuerkette', 'spalt', 'schild', 'klingel', 'spion'],
    ort: 'gerdes', fest: true, szenerie: true,
    beschreibung: function (api) {
      if (api.flag('gerdes_herein')) return 'Die Tür ist angelehnt, die Kette hängt lose herunter.';
      if (api.flag('gerdes_tuer_zu')) return 'Eine furnierte Tür mit Spion und einem Messingschild „Gerdes“. Sie ist zu. <span class="nebenbei">(„klopfe an die tür“)</span>';
      return 'Eine furnierte Tür mit Spion und einem Messingschild „Gerdes“. Die Kette ist vorgelegt. Im Spalt: ein Stück Flur, ein Ärmel, ein Auge.';
    },
    bei: {
      klopfen: function (api) { klopfen(api); return true; },
      druecken: function (api) { klopfen(api); return true; },
      oeffnen: function (api) { api.sage(api.flag('gerdes_herein') ? 'Sie ist schon offen.' : 'Von außen? Mit vorgelegter Kette? Das muss Brigitte tun.'); return true; }
    }
  });
  /** An die geschlossene Tür klopfen: Brigitte macht wieder einen Spalt auf – außer, sie hat heute endgültig genug. */
  function klopfen(api) {
    if (api.flag('gerdes_herein')) { api.sage('Die Tür ist doch offen.'); return; }
    if (!api.flag('gerdes_tuer_zu')) { api.sage('Brigitte steht doch im Spalt und sieht dich an. <span class="nebenbei">(„sprich mit brigitte“)</span>'); return; }
    if (api.flag('brigitte_abgewiesen') === api.tag()) {
      api.sage('Du klopfst. Hinter der Tür bleibt es still. Heute macht Brigitte nicht mehr auf.');
      api.fehlversuch('gerdes_tuer', TUER_TIPPS);
      return;
    }
    api.setzeFlag('gerdes_tuer_zu', false);
    api.sage('Du klopfst. Eine ganze Weile passiert nichts. Dann geht die Tür wieder einen Spalt auf, die Kette bleibt vor. „Was denn noch?“ <span class="nebenbei">(„sprich mit brigitte“)</span>');
  }

  /** Kennt die Spielfigur Bettinas Haarspange schon? (gefunden – erst dann darf ein Tipp davon reden) */
  function kenntHaarspange(api) { return api.traegt('haarspange') || !api.eig('haarspange', 'versteckt'); }

  // Gestaffelte Hinweise, wenn Brigitte einen nicht hereinlässt – sie verraten nichts, was man noch nicht gefunden hat
  var TUER_TIPPS = {
    2: function (api) {
      return 'Brigitte hat Angst – aber nicht vor dir. Vielleicht hat das Haus auch ihr Nachrichten geschickt, wie Carsten.' +
        (kenntHaarspange(api) ? ' Oder du bringst ihr etwas mit, das Bettina gehört hat.' : '');
    },
    3: function (api) {
      var t = [];
      if (kenntNummern(api)) t.push('Frag sie, ob das Haus ihr auch von fremden Nummern schreibt. <span class="nebenbei">(„sprich mit brigitte“, dann die passende Antwort)</span>');
      else t.push('Wer weiß, wie das Haus mit Menschen Kontakt aufnimmt, kann Brigitte danach fragen.');
      if (api.traegt('haarspange')) t.push('Zeig ihr Bettinas Haarspange. <span class="nebenbei">(„zeige brigitte die haarspange“)</span>');
      else if (kenntHaarspange(api)) t.push('Bettinas Haarspange würde sie erkennen. Bring sie mit.');
      t.push('Oder versuch es morgen noch einmal mit Überreden.');
      return t.join(' ');
    }
  };

  /** Hat die Spielfigur selbst erlebt, dass das Haus mit fremden Nummern schreibt oder anruft? (Spieltest 2: erst dann
   *  die Frage „Schreibt es Ihnen auch?“) – Carstens Tagebuch („fremde Nummern“) oder eine gefälschte Nachricht bzw. ein
   *  gefälschter Anruf von jemandem, den man kennt (nicht nur „Unbekannte Nummer“). */
  function kenntNummern(api) {
    if (['fremde_nummern', 'falscher_anruf_polizei', 'falscher_anruf_schmidt'].some(api.hatHinweis)) return true;
    var h = HG.zustand.z.handy || {};
    return (h.nachrichten || []).concat(h.anrufe || []).some(function (n) {
      var d = HG.daten.nachrichten[n.id] || HG.daten.anrufe[n.id];
      return d && d.falsch && !/unbekannt/i.test(HG.wert(d.von, api) || '');
    });
  }
  /** Hat man mit Lotte Wiegand gesprochen (und von ihr etwas erfahren)? */
  function warBeiLotte(api) { return api.hatHinweis('lotte_zwei_gesichter') || api.hatHinweis('lotte_ring') || !!api.flag('lotte_lavendel'); }

  /** Davids Festlegung: An der Tür schickt sie einen ins Altenheim – ohne zu sagen, zu wem. */
  function altenheimSatz(api) {
    api.hinweis('brigitte_altenheim');
    return ' „Wenn Sie wirklich wissen wollen, was da los ist – fahren Sie ins Altenheim. Ins Lindenhof, in Hombruch. Ich sag Ihnen nicht, zu wem. Sie werden’s merken.“';
  }
  function abweisen(api, text) {
    api.sage(text + altenheimSatz(api) + ' Dann schließt sie die Tür. Die Kette klirrt.');
    api.setzeFlag('gerdes_tuer_zu');
    api.fehlversuch('gerdes_tuer', TUER_TIPPS);
  }

  /** Brigitte lässt einen herein. */
  function herein(api, text) {
    api.setzeFlag('gerdes_herein');
    api.fehlversucheVergessen('gerdes_tuer');
    api.sage(text);
    api.abschnitt(50, 'Die Tür schließt sich, die Kette rasselt, dann geht sie ganz auf. Brigitte Gerdes steht in einem grauen Strickpullover im Flur und hält sich mit einer Hand an der Wand fest. „Kommen Sie rein“, sagt sie. „Schuhe können Sie anlassen.“');
    api.bewege('brigitte', 'gerdes_wohnung');
    api.gehe('gerdes_wohnung');
  }

  /** Das Gespräch an der Tür: Spielbuch-Auswahl. */
  function anDerTuer(api) {
    if (api.flag('gerdes_tuer_zu')) {
      if (api.flag('brigitte_abgewiesen') === api.tag()) { klopfen(api); return true; }
      api.setzeFlag('gerdes_tuer_zu', false);
      api.sage('Du klopfst, bis die Tür wieder einen Spalt aufgeht.');
    }
    if (api.flag('brigitte_abgewiesen') === api.tag()) {
      api.sage('„Ich hab gesagt, was ich sagen kann.“ Hinter der Tür wird es still. Dann, leiser: „Gehen Sie. Bitte.“');
      api.fehlversuch('gerdes_tuer', TUER_TIPPS);
      return true;
    }
    var optionen = [
      { text: '„Ich will nur wissen, was mit Carsten Häuser passiert ist.“', tu: function () {
        abweisen(api, '„Dann fragen Sie die Polizei.“ Sie sieht an dir vorbei ins Treppenhaus. „Ich rede nicht über das Haus. Peter auch nicht, der ist weg, Portugal.“ Eine lange Pause.');
      } }
    ];
    if (kenntNummern(api)) optionen.push({ text: '„Schreibt es Ihnen auch? Von Nummern, die es nicht mehr geben kann?“', tu: function () {
      herein(api, 'Brigitte sieht dich lange an. Ihr Mund wird schmal. „Von welcher Nummer schreibt es Ihnen?“, fragt sie. Du erzählst von Carsten, von „Peter Gerdes“, der in Portugal ist und trotzdem vor der Tür stand. Sie schließt kurz die Augen.');
    } });
    optionen.push({ text: '„Ich habe das Haus geerbt. Ich brauche Ihre Hilfe.“', tu: function () {
      var e = api.probe('ueberreden', { grund: 'Brigitte Gerdes dazu bringen, die Tür aufzumachen' });
      if (e.erfolg) {
        herein(api, 'Du redest nicht über das Haus. Du redest über die Nächte, über das Licht oben, wenn keiner da ist, und dass du nicht weißt, wen du sonst fragen sollst. Brigitte hört zu. Ihre Hand an der Kette zittert.');
        return;
      }
      api.setzeFlag('brigitte_abgewiesen', api.tag());
      abweisen(api, '„Dann ziehen Sie aus“, sagt sie. „Heute noch. Das ist die ganze Hilfe, die ich habe.“');
    } });
    // Weitere Wege hinein (Spieltest 2): Lotte Wiegand, die Haarspange – und Überreden (oben, einmal pro Tag)
    if (warBeiLotte(api)) optionen.push({ text: '„Ich war bei Lotte Wiegand. Im Lindenhof.“', tu: function () {
      herein(api, 'Brigitte hält die Luft an. „Bei Lotte.“ Sie sagt den Namen, als hätte sie ihn lange nicht gehört. „Bettina war jeden Mittwoch bei ihr. Für das Referat. Danach hat sie nicht mehr geschlafen.“ Sie sieht dich an, ein langer Blick durch den Spalt. „Was hat sie Ihnen erzählt?“');
    } });
    if (api.traegt('haarspange')) optionen.push({ text: 'Ihr Bettinas Haarspange zeigen', tu: function () { haarspangeZeigen(api); } });
    optionen.push({ text: '„Es geht um Bettina.“', tu: function () {
      abweisen(api, '„Nicht.“ Ihre Stimme bricht nicht, sie wird nur sehr leise. „Nicht Bettinas Namen. Nicht hier im Treppenhaus.“');
    } });
    api.sage('Brigitte wartet. Die Kette bleibt vor.');
    api.auswahl('Was sagst du?', optionen);
    return true;
  }

  /** Bettinas Haarspange zeigen – der Anker öffnet die Tür (und bleibt bei der Spielfigur). */
  function haarspangeZeigen(api) {
    if (!api.traegt('haarspange')) return false;
    if (api.flag('gerdes_tuer_zu') && !api.flag('gerdes_herein')) { api.setzeFlag('gerdes_tuer_zu', false); api.sage('Du klopfst. Als die Tür einen Spalt aufgeht, bist du schneller als jedes Wort.'); }
    if (api.flag('gerdes_herein')) {
      api.sage('Brigitte streicht mit einem Finger über die Glitzersteinchen. „Behalten Sie sie“, sagt sie. „Sie gehört nicht hierher. Sie gehört zu ihr.“');
      return true;
    }
    herein(api, 'Du hältst die blaue Haarspange in den Türspalt. Brigitte starrt sie an. Dann greift sie danach, ganz langsam, als könnte sie zerfallen. „Wo …“ Sie bringt den Satz nicht zu Ende. „Die hat sie nie abgenommen. Nie. Wir haben sie überall gesucht.“ Sie drückt dir die Spange zurück in die Hand.');
    return true;
  }

  // ===================================================================
  // BRIGITTE GERDES
  // ===================================================================
  function geschichte(api) {
    if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
    if (api.hatHinweis('gespraech_brigitte')) {
      api.sage('„Ich hab Ihnen alles erzählt.“ Sie sieht zum Foto auf dem Sideboard. „Mehr weiß ich nicht. Ich hab ja nicht zugehört, damals.“');
      return true;
    }
    api.abschnitt(51, 'Brigitte setzt sich auf die Sofakante, die Hände zwischen den Knien. Lange sagt sie nichts. Dann fängt sie an, ohne dich anzusehen.<br><br>' +
      '„Im September hat sie dieses Schulprojekt gemacht. Zeitzeugen. Sie war so stolz, dass sie jemanden gefunden hat, der in unserem Haus aufgewachsen ist. Danach hat sie nicht mehr geschlafen. Gar nicht. Sie hat gesagt, in ihrem Zimmer ist es zu laut.“<br><br>' +
      '„Dann ist sie nachts rüber. In das Ankleidezimmer. Hinter der Tapetentür. ‚Da schläft man so gut, Mama.‘ Ich hab sie gehört, durch die Wand. Wie sie flüstert. Und einmal hab ich gefragt, mit wem. Und sie hat gesagt: ‚Die Dame sagt, ich darf bleiben.‘“<br><br>' +
      'Brigitte reibt sich die Hände, als wäre ihr kalt. „Ich hab gesagt, sie bildet sich das ein. Ich hab gesagt, sie soll nicht so theatralisch sein. Das war das Letzte, was ich …“ Sie hört auf.<br><br>' +
      '„Sie hat ihr geglaubt. Dieser Dame. Mehr als mir.“');
    api.hinweis('gespraech_brigitte');
    api.setzeFlag('brigitte_erzaehlt');
    return true;
  }
  function nummer(api) {
    if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
    api.setzeFlag('brigitte_handy_erzaehlt');
    return '„Ich zahl ihren Vertrag weiter. Damit keiner anders ihre Nummer kriegt.“ Brigitte zeigt auf die Schublade im Sideboard. „Ihr <span class="kein-wort">Handy</span> liegt da drin. Aus. Seit drei Jahren.“ Sie schluckt. ' +
      '„Und trotzdem schreibt sie mir. Nachts. ‚Mama, komm nach Hause.‘ ‚Mama, mir ist kalt.‘ ‚Mama, die Dame ist so lieb zu mir.‘“ Sie sieht dich an. „Bettina hat nie ‚Dame‘ gesagt. Das war nicht ihr Wort.“';
  }
  function referat(api) {
    if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
    if (api.eig('referat_bettina', 'ort')) return '„Liegt doch da.“ Sie nickt zum Couchtisch, ohne hinzusehen. „Lesen Sie’s. Ich kann nicht.“';
    api.bewege('referat_bettina', 'couchtisch_gerdes', 'auf');
    return 'Brigitte steht auf, zieht aus einem der Umzugskartons eine blaue Schnellhefter-Mappe und legt sie vor dich auf den Couchtisch, als wäre sie heiß. „Ihr Referat. Die Frau aus dem Altenheim steht da drin.“ Sie setzt sich wieder. „Drei Wochen danach war Bettina tot. Lesen Sie’s. Ich kann nicht.“ <span class="nebenbei">(„lies referat“)</span>';
  }

  HG.ding('brigitte', {
    nomen: 'Brigitte Gerdes', genus: 'f', eigenname: true,
    woerter: ['brigitte', 'gerdes', 'frau', 'mutter'],
    ort: 'gerdes', person: true, szenerie: true,
    beschreibung: function (api) {
      return api.raum() === 'gerdes_wohnung'
        ? 'Brigitte Gerdes, um die fünfzig, graues Haar, das sie lange nicht geschnitten hat, ein Strickpullover mit zu langen Ärmeln. Sie sitzt nie richtig, immer nur auf der Kante.'
        : 'Brigitte Gerdes, um die fünfzig, graues Haar, das sie lange nicht geschnitten hat. Sie hält die Tür mit einer Hand fest, als könnte jemand hereinwollen, den sie nicht sieht.';
    },
    gespraech: function (api) {
      if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
      return api.flag('brigitte_erzaehlt')
        ? '„Fragen Sie.“ Sie zieht die Ärmel über die Hände. <span class="nebenbei">(„frage brigitte nach …“ – Bettina, Handy, Altenheim, Haarspange, Peter)</span>'
        : '„Sie wollen wissen, was mit Bettina war.“ Sie setzt sich auf die Sofakante. „Fragen Sie. Bevor ich’s mir anders überlege.“ <span class="nebenbei">(„frage brigitte nach bettina“)</span>';
    },
    themen: {
      'bettina,tochter,maedchen,tod,oktober,2022,dame,ankleidezimmer,spiegelzimmer,zimmer,schlaf,schlafen': geschichte,
      'handy,nummer,nachricht,nachrichten,sms,anruf,anrufe,schreibt,vertrag': nummer,
      'altenheim,lindenhof,referat,schule,schulprojekt,projekt,zeitzeugin,zeitzeuge,zeitzeugen,lotte,koechin,frau,mappe,hefter': referat,
      'haarspange,spange,glitzer': function (api) {
        if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
        if (api.traegt('haarspange')) { haarspangeZeigen(api); return true; }
        return '„Blau, mit kleinen Glitzersteinen. Die hat sie nie abgenommen, nicht mal zum Schlafen.“ Sie sieht zum Foto auf dem Sideboard. „Gefunden haben wir sie nicht. Nicht in ihrem Zimmer, nicht in dem anderen. Als hätte sie sie jemand versteckt.“';
      },
      'peter,mann,ehemann,portugal': function (api) {
        if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
        return '„Peter ist im Januar nach Portugal. Algarve. Er sagt, da ist es hell.“ Sie lächelt nicht. „Herr Häuser hat erzählt, Peter hätte ihm geschrieben. Und angerufen, und vor dem Haus gestanden. Peter hat nicht mal mehr ein deutsches Handy. Und er würde den Ulmenweg nicht mal auf dem Navi eingeben.“';
      },
      'daniel,sohn,bruder': function (api) {
        if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
        return '„Daniel studiert in Münster. Er ruft sonntags an.“ Eine Pause. „Er sagt nie ‚das Haus‘. Er sagt ‚damals‘.“';
      },
      'carsten,haeuser,cousin,vetter': function (api) {
        if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
        return '„Er hat einmal angerufen, im Winter. Ich hab aufgelegt. Dann stand er vor der Tür, so wie Sie. Ich hab nicht aufgemacht.“ Sie sieht auf ihre Hände. „Ich hab gedacht, wenn ich nicht drüber rede, hört es auf. Für ihn hat’s nicht aufgehört.“';
      },
      'haus,ulmenweg,grest,villa,spiegel,spiegeln': function (api) {
        if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
        return '„Hier gibt es keine Spiegel“, sagt Brigitte. „Keinen einzigen. Ich schminke mich nicht mehr. Ich weiß, wie ich aussehe.“ Sie sieht zum verhängten Fernseher. „Und den hab ich zugehängt, weil der schwarz so spiegelt, wenn er aus ist.“';
      },
      'trauerkarte,karte,karten': function (api) {
        if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
        return '„Hundert Stück hab ich drucken lassen.“ Ihre Stimme wird flach. „Verschickt hab ich keine. Ich wusste nicht, an wen. Alle, die sie kannten, waren ja auf der Beerdigung.“ Sie sieht auf die oberste Karte. „Der Vierzehnte. Da hab ich sie zum letzten Mal lachen hören.“';
      }
    },
    themaSonst: function (api) {
      if (api.raum() !== 'gerdes_wohnung') return anDerTuer(api);
      return '„Dazu weiß ich nichts.“';
    },
    bei: {
      zeigen: function (api, ctx) { return ctx.obj === 'haarspange' ? haarspangeZeigen(api) : false; },
      geben: function (api, ctx) { return ctx.obj === 'haarspange' ? haarspangeZeigen(api) : false; }
    }
  });

  // ===================================================================
  // WOHNZIMMER
  // ===================================================================
  HG.raum('gerdes_wohnung', {
    name: 'Wohnzimmer Gerdes', woerter: ['wohnzimmer', 'wohnung'],
    schauplatz: 'gerdes', karte: { x: -1, y: 0 },
    beschreibung: function (api) {
      var t = 'Ein Wohnzimmer, das aussieht, als wäre hier vor drei Jahren jemand eingezogen und hätte dann aufgehört. Ein Sofa, ein Couchtisch, ein Sideboard. An der Wand stapeln sich Umzugskartons, beschriftet „ULMENWEG“, keiner davon geöffnet. ' +
        'Der Fernseher ist mit einem Badetuch verhängt. Auf dem Sideboard steht ein gerahmtes Foto, davor ein Stapel Trauerkarten.';
      if (api.istNacht() || api.tageszeit() === 'abend') t += ' Die Vorhänge sind zugezogen, auch die Lücke dazwischen ist mit einer Wäscheklammer verschlossen.';
      return t + ' Durch die offene Tür siehst du ins Bad. Hinaus geht es ins Treppenhaus.';
    },
    kurz: 'Brigittes Wohnzimmer: Sofa, Couchtisch, Sideboard mit Bettinas Foto, Umzugskartons, der verhängte Fernseher.',
    riechen: 'Pfefferminztee. Ein Hauch Lavendel – nein. Weichspüler. Nur Weichspüler.',
    horchen: 'Die Kühlschranktür in der Küche summt. Brigitte atmet flach. Sonst nichts – kein Radio, kein Fernseher, keine Uhr.',
    ausgaenge: { hinaus: 'gerdes' },
    jedeRunde: function (api) {
      // Einmal, nach Brigittes Geschichte: eine Nachricht von Bettinas Nummer
      if (!api.flag('brigitte_erzaehlt') || api.flag('bettina_sms') || api.raum() !== 'gerdes_wohnung') return;
      if (api.zaehle('gerdes_nach_geschichte') < 2) return;
      api.setzeFlag('bettina_sms');
      api.sage('Auf dem Couchtisch brummt Brigittes Handy. Sie sieht nicht hin. Du schon. Auf dem Sperrbildschirm: <b>Bettina ♥</b> – <i>„mama wer ist da bei dir“</i><br>' +
        'Brigitte dreht das Handy um, mit dem Display nach unten, ganz ruhig, wie man etwas tut, das man schon oft getan hat. Die Schublade im Sideboard bleibt zu.');
      api.nervenProbe('0/1W3', { grund: 'Bettinas Nachricht' });
    },
    vorschlaege: function (api) {
      var v = [];
      if (!api.hatHinweis('gespraech_brigitte')) v.push('frage brigitte nach bettina');
      else if (!api.eig('referat_bettina', 'ort')) v.push('frage brigitte nach dem altenheim');
      if (api.eig('referat_bettina', 'ort') && !api.hatHinweis('bettinas_referat')) v.push('lies referat');
      if (!api.flag('brigitte_handy_erzaehlt') && api.hatHinweis('gespraech_brigitte')) v.push('frage brigitte nach dem handy');
      v.push('untersuche foto');
      return v.concat(['geh hinaus']);
    },
    details: [
      { nomen: 'Fernseher', genus: 'm', woerter: ['fernseher', 'badetuch', 'tuch', 'bildschirm', 'tv'],
        text: 'Ein großer Flachbildfernseher unter einem hellblauen Badetuch. Darunter schaut ein Stück schwarzer Bildschirm hervor, und in dem Stück siehst du einen Ausschnitt des Zimmers. Du siehst schnell wieder weg.' },
      { nomen: 'Umzugskartons', genus: 'pl', woerter: ['umzugskartons', 'kartons', 'karton', 'kisten'],
        text: '„ULMENWEG – KÜCHE“, „ULMENWEG – BÜCHER“, „ULMENWEG – KELLER“ und ganz unten, mit anderem Filzstift: „BETTINA“. Das Klebeband ist vergilbt, aber heil. Seit drei Jahren hat sie keinen davon aufgemacht.',
        bei: { oeffnen: function (api) { api.sage('„Nicht“, sagt Brigitte, bevor du die Hand ausgestreckt hast. Nicht laut. Du lässt es.'); return true; } } },
      { nomen: 'Bad', genus: 'n', woerter: ['bad', 'badezimmer', 'waschbecken', 'duebel', 'loecher'],
        text: 'Ein kleines Bad mit beigen Fliesen. Über dem Waschbecken sind vier Dübellöcher und ein hellerer Rahmen auf den Fliesen, wo einmal ein Spiegelschrank hing. Daneben klebt ein Zettel mit Tesafilm: „Haare: gut. Zähne: gut.“' },
      { nomen: 'Vorhänge', genus: 'pl', woerter: ['vorhaenge', 'vorhang', 'fenster', 'gardinen', 'waescheklammer'],
        text: 'Dicke Vorhänge. Am Abend zieht Brigitte sie zu, bevor es draußen dunkel genug wird, dass die Scheibe spiegelt.' },
      { nomen: 'Sofa', genus: 'n', woerter: ['sofa', 'couch', 'wolldecke', 'armlehne'], text: 'Ein graues Sofa mit einer Wolldecke. Auf der Armlehne eine Packung Taschentücher und eine Fernbedienung, die sie nicht braucht.' },
      // Spieltest 2: „Packung“ meinte sonst die Sturmstreichhölzer im Gepäck
      { nomen: 'Taschentücher', genus: 'pl', woerter: ['taschentuecher', 'taschentuch', 'packung', 'tempos'], text: 'Eine angebrochene Packung Taschentücher. Ein paar zerknüllte liegen daneben, als hätte sie sie nicht mehr bis in den Müll geschafft.' },
      { nomen: 'Fernbedienung', genus: 'f', woerter: ['fernbedienung'], text: 'Die Fernbedienung für den verhängten Fernseher. Die Batteriefachklappe fehlt, die Batterien auch.' }
    ]
  });

  HG.ding('couchtisch_gerdes', {
    nomen: 'Couchtisch', genus: 'm', woerter: ['couchtisch', 'tisch'],
    ort: 'gerdes_wohnung', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein niedriger Tisch aus Kiefernholz. Eine Teetasse mit Rand, ein Untersetzer aus Kork, Brigittes Handy mit dem Display nach unten.'
  });
  // Brigittes Handy: ein eigenes Ding, damit „handy“, „nachrichten“, „fotos“ hier nie auf dein eigenes Handy springen.
  // Man sieht nur, was Brigitte zeigt (die Nachricht von Bettinas Nummer, wenn sie kam). Bettinas Handy in der Schublade
  // ist kein Ding – die Schublade bleibt zu (Spieltest 2).
  function brigittesHandy(api) {
    api.sage(api.flag('bettina_sms')
      ? 'Brigittes Handy liegt mit dem Display nach unten. Du hast gesehen, was darauf stand: <b>Bettina ♥</b> – <i>„mama wer ist da bei dir“</i>. Du drehst es nicht um.'
      : 'Brigittes Handy liegt mit dem Display nach unten auf dem Couchtisch. Es gehört dir nicht, und Brigitte sieht dir zu.');
    return true;
  }
  HG.ding('handy_brigitte', {
    nomen: 'Handy', genus: 'n', zusatz: function () { return 'von Brigitte'; }, kurzwort: 'brigittes handy',
    woerter: ['handy', 'smartphone', 'telefon', 'sperrbildschirm'], adjektive: ['brigittes'],
    // „lies nachrichten“ allein bleibt dein eigenes Handy; „nachrichten auf brigittes handy“ meint dieses (parser.js)
    teilWoerter: ['nachrichten', 'nachricht', 'sms', 'fotos', 'bilder', 'display'],
    ort: 'couchtisch_gerdes', rel: 'auf', fest: 'Das ist Brigittes Handy. Du lässt es liegen.', szenerie: true,
    beschreibung: 'Brigittes Handy, mit dem Display nach unten.',
    bei: { untersuchen: brigittesHandy, hineinschauen: brigittesHandy, lesen: brigittesHandy, benutzen: brigittesHandy, umdrehen: brigittesHandy, nehmen: function (api) { api.sage('Das ist Brigittes Handy. Du lässt es liegen.'); return true; } }
  });
  HG.ding('sideboard_gerdes', {
    nomen: 'Sideboard', genus: 'n', woerter: ['sideboard', 'kommode', 'anrichte', 'schublade', 'schrank'],
    ort: 'gerdes_wohnung', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein Sideboard in Buche. Darauf Bettinas Foto und ein Stapel Trauerkarten. Die obere Schublade ist zu.',
    bei: { oeffnen: function (api) { api.sage('Du legst die Hand an die Schublade. Brigitte sagt nichts. Sie sieht dich nur an, und du nimmst die Hand wieder weg. Darin liegt Bettinas <span class="kein-wort">Handy</span>. Es bleibt, wo es ist.'); return true; } }
  });
  HG.ding('foto_bettina', {
    nomen: 'Foto', genus: 'n', woerter: ['foto', 'bild', 'rahmen', 'bettina', 'portraet'], adj: ['gerahmt'],
    ort: 'sideboard_gerdes', rel: 'auf', fest: true, szenerie: true,
    beschreibung: 'Bettina, vielleicht sechzehn, auf einer Schaukel, mitten im Lachen, die Zahnspange blitzt. In ihrem Haar steckt eine blaue Haarspange mit kleinen Glitzersteinen.',
    texte: { nehmen: 'Du lässt das Foto stehen. Es gehört hierher.' }
  });
  // Die Trauerkarte (ursprünglich in Carstens Karton GERDES, laut Spielbibel 5b hierher verschoben):
  // Stimmung, kein Notizbuch-Eintrag. Sie kam nach Carstens Tod mit der Post.
  HG.ding('trauerkarte', {
    dokument: true,
    nomen: 'Trauerkarte', genus: 'f',
    woerter: ['trauerkarte', 'karte', 'sterbebild', 'karten', 'trauerkarten'],
    ort: 'sideboard_gerdes', rel: 'auf',
    // Spieltest 2: keine Anmerkungen von Carsten (Rest der alten Lager-Fassung), kein Foto-Effekt – nur Brigittes Datum
    beschreibung: 'Ein Stapel Trauerkarten für Bettina Gerdes, alle gleich, keine verschickt. Das Foto zeigt ein lachendes Mädchen mit Zahnspange. Darunter: <i>„Du bist nur in ein anderes Zimmer gegangen.“</i>',
    lesbar: '<i>Bettina Gerdes · 2005 – 2022</i><br><br>„Du bist nur in ein anderes Zimmer gegangen.“<br><br><i>(Auf der Rückseite der obersten Karte, in Brigittes runder Schrift, nur ein Datum: 14.10.)</i>',
    foto: 'Bettinas Trauerkarte, scharf und gerade.'
  });

  HG.ding('referat_bettina', {
    dokument: true,
    nomen: 'Referat', genus: 'n', adj: ['blau'],
    woerter: ['referat', 'mappe', 'schnellhefter', 'hefter', 'projekt', 'schulprojekt', 'interview', 'notizen'],
    ort: null,   // holt Brigitte aus dem Karton „BETTINA“, wenn man nach dem Altenheim fragt
    schriftart: 'hand', dauer: { lesen: 10 },
    beschreibung: 'Eine blaue Schnellhefter-Mappe mit einem aufgeklebten Etikett: „Projektkurs Geschichte Q1 – Zeitzeugen: Wohnen in Kirchhörde um 1930 – Bettina Gerdes“. Darin ein paar getippte Seiten und viele handschriftliche Notizen.',
    lesbar: '<b>Projektkurs Geschichte Q1 · Gymnasium Hombruch · Bettina Gerdes</b><br><i>Zeitzeugen: Wohnen in Kirchhörde um 1930</i><br><br>' +
      '<b>Interview 2 – Frau Lotte W., 100 Jahre (!!!)</b><br>Seniorenheim Lindenhof, Hombruch, Zimmer 14 – 13.9.2022<br><br>' +
      '– ist in UNSEREM HAUS aufgewachsen!!! 1922 bis 1930. Ihre Mutter (Martha W.) war Köchin bei Grests.<br>' +
      '– hat oben unterm Dach geschlafen, in der kleinen Kammer (Speicher? fragen, ob ich da hochdarf)<br>' +
      '– „die gnädige Frau“ = Elisabeth Grest: krank, Rollstuhl, sehr lieb zu ihr, gab ihr Zuckerstücke<br>' +
      '– die Pflegerin = „die Schwester“. Hatte einen Vogel (?). Lotte durfte ihr nie in die Augen sehen.<br>' +
      '– <b>Frau W. sagt: „Die gnädige Frau hatte zwei Gesichter.“</b> Ich hab gefragt, was sie meint. Sie hat auf meine Tasche gezeigt. Da war mein Taschenspiegel drin. Dann wollte sie nicht mehr reden.<br><br>' +
      '<i>(Mama nichts davon sagen. Sie findet das Haus eh schon gruselig.)</i><br><br>' +
      '<i>Ganz unten, mit einem anderen Stift, die Schrift kleiner und schief:</i><br>Sie hat recht. Ich hab sie gesehen. Wenn sie lächelt, ist es die andere.',
    hinweis: 'bettinas_referat', hinweisBei: 'lesen',
    bei: { nehmen: function (api) { api.sage('„Lassen Sie’s hier“, sagt Brigitte leise. „Fotografieren Sie’s, wenn Sie müssen.“'); return false; } }
  });

  // ===================================================================
  // HINWEISE
  // ===================================================================
  HG.hinweis('gespraech_brigitte', {
    titel: 'Was Brigitte erzählt', strang: 'D',
    text: 'Bettina konnte im Herbst 2022 nicht mehr schlafen. Nachts zog sie ins Ankleidezimmer, „da schläft man so gut“, und flüsterte mit jemandem: „Die Dame sagt, ich darf bleiben.“ Brigitte hat ihr nicht geglaubt. Bettina hat der Dame geglaubt. Seit ihrem Tod kommen Nachrichten von Bettinas Nummer – das Handy liegt ausgeschaltet in einer Schublade.',
    stichworte: ['brigitte', 'bettina', 'dame', 'ankleidezimmer', 'nachrichten', 'gerdes']
  });
  HG.hinweis('bettinas_referat', {
    titel: 'Bettinas Zeitzeugin', strang: 'B',
    text: 'Bettinas Schulreferat, September 2022: ein Interview mit Lotte W., damals 100, im Seniorenheim Lindenhof in Hombruch, Zimmer 14. Sie ist als Tochter der Köchin im Haus Grest aufgewachsen (1922–1930). Ihr Satz: „Die gnädige Frau hatte zwei Gesichter.“ Darunter Bettina, später: „Wenn sie lächelt, ist es die andere.“',
    stichworte: ['bettina', 'referat', 'lotte', 'lindenhof', 'altenheim', 'koechin', 'zeitzeugin'],
    schaltetFrei: ['altenheim']
  });

})();
