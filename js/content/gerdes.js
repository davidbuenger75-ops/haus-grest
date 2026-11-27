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
    name: 'Wohnung Gerdes (Unna)',
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
      return t + 'Sie steht einen Spalt offen, die Kette vorgelegt. Dahinter: Brigitte Gerdes.';
    },
    kurz: function (api) { return 'Das Treppenhaus vor der Wohnung Gerdes. ' + (api.flag('gerdes_herein') ? 'Die Tür ist angelehnt.' : 'Die Tür ist einen Spalt offen, die Kette vorgelegt.'); },
    riechen: 'Bohnensuppe aus dem ersten Stock, Reinigungsmittel, kalter Zigarettenrauch.',
    horchen: 'Irgendwo oben ein Fernseher. Draußen schreien Kinder beim Fußball. Hinter Brigittes Tür ist es sehr still.',
    ausgaenge: {
      hinein: { ziel: 'gerdes_wohnung', sperre: function (api) {
        return api.flag('gerdes_herein') ? null : 'Die Kette ist vorgelegt, und Brigitte macht keine Anstalten, sie abzunehmen. <span class="nebenbei">(„sprich mit brigitte“)</span>';
      } }
    },
    vorBetreten: function (api) { if (!api.flag('gerdes_herein')) api.bewege('brigitte', 'gerdes'); },
    beimBetreten: function (api, info) {
      if (api.flag('gerdes_herein')) return;
      api.sage(info.erstesMal
        ? 'Du hast kaum geklingelt, da geht die Tür einen Spalt auf. Eine Frau um die fünfzig, die Kette vorgelegt. „Sie kommen wegen dem Haus“, sagt sie. Es ist keine Frage. <span class="nebenbei">(„sprich mit brigitte“)</span>'
        : 'Die Tür geht wieder einen Spalt auf, die Kette bleibt vor. Brigitte sieht dich an, als hätte sie gewusst, dass du wiederkommst.');
    },
    vorschlaege: function (api) {
      if (api.flag('gerdes_herein')) return ['geh hinein'];
      var v = ['sprich mit brigitte'];
      if (api.traegt('haarspange')) v.push('zeige brigitte die haarspange');
      return v;
    },
    details: [
      { nomen: 'Wohnungstür', genus: 'f', woerter: ['tuer', 'wohnungstuer', 'kette', 'tuerkette', 'spalt', 'schild', 'klingel'],
        text: function (api) { return api.flag('gerdes_herein') ? 'Die Tür ist angelehnt, die Kette hängt lose herunter.' : 'Eine furnierte Tür mit Spion und einem Messingschild „Gerdes“. Die Kette ist vorgelegt. Im Spalt: ein Stück Flur, ein Ärmel, ein Auge.'; } },
      { nomen: 'Briefkästen', genus: 'pl', woerter: ['briefkaesten', 'briefkasten', 'post'],
        text: 'Eine Reihe Briefkästen. Bei „Gerdes“ ist das Namensschild zweimal überklebt worden: erst „P. + B. Gerdes“, darüber nur noch „B. Gerdes“.' }
    ]
  });

  // Gestaffelte Hinweise, wenn Brigitte einen nicht hereinlässt
  var TUER_TIPPS = {
    2: 'Brigitte hat Angst – aber nicht vor dir. Vielleicht hat das Haus auch ihr Nachrichten geschickt, wie Carsten. Oder du bringst ihr etwas mit, das Bettina gehört hat.',
    3: function (api) {
      var t = [];
      if (kenntNummern(api)) t.push('Frag sie, ob das Haus ihr auch von fremden Nummern schreibt. <span class="nebenbei">(„sprich mit brigitte“, dann die passende Antwort)</span>');
      else t.push('In Carstens Tagebuch steht, wie das Haus mit fremden Nummern schreibt. Wer das weiß, kann Brigitte danach fragen.');
      t.push(api.traegt('haarspange')
        ? 'Zeig ihr Bettinas Haarspange. <span class="nebenbei">(„zeige brigitte die haarspange“)</span>'
        : 'Bettinas Haarspange liegt noch im Haus – im Kinderzimmer, im Puppenhaus. Die würde sie erkennen.');
      t.push('Oder versuch es morgen noch einmal mit Überreden.');
      return t.join(' ');
    }
  };

  /** Weiß die Spielfigur, dass das Haus mit fremden Nummern anruft und schreibt? */
  function kenntNummern(api) {
    return ['fremde_nummern', 'tote_anrufer', 'falscher_anruf_polizei', 'falscher_anruf_schmidt'].some(api.hatHinweis);
  }

  /** Davids Festlegung: An der Tür schickt sie einen ins Altenheim – ohne zu sagen, zu wem. */
  function altenheimSatz(api) {
    api.hinweis('brigitte_altenheim');
    return ' „Wenn Sie wirklich wissen wollen, was da los ist – fahren Sie ins Altenheim. Ins Lindenhof, in Hombruch. Ich sag Ihnen nicht, zu wem. Sie werden’s merken.“';
  }
  function abweisen(api, text) {
    api.sage(text + altenheimSatz(api) + ' Dann schließt sie die Tür. Die Kette klirrt.');
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
    optionen.push({ text: '„Ich wohne jetzt in dem Haus. Ich brauche Ihre Hilfe.“', tu: function () {
      var e = api.probe('ueberreden', { grund: 'Brigitte Gerdes dazu bringen, die Tür aufzumachen' });
      if (e.erfolg) {
        herein(api, 'Du redest nicht über das Haus. Du redest über die Nächte, über das Licht oben, wenn keiner da ist, und dass du nicht weißt, wen du sonst fragen sollst. Brigitte hört zu. Ihre Hand an der Kette zittert.');
        return;
      }
      api.setzeFlag('brigitte_abgewiesen', api.tag());
      abweisen(api, '„Dann ziehen Sie aus“, sagt sie. „Heute noch. Das ist die ganze Hilfe, die ich habe.“');
    } });
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
    return '„Ich zahl ihren Vertrag weiter. Damit keiner anders ihre Nummer kriegt.“ Brigitte zeigt auf die Schublade im Sideboard. „Ihr Handy liegt da drin. Aus. Seit drei Jahren.“ Sie schluckt. ' +
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
        return '„Die eine da, mit dem Kreis.“ Ihre Stimme wird flach. „Die kam mit der Post. Eine Woche nachdem Herr Häuser tot war. Kein Absender, kein Brief. Nur die Karte, und das Wort eingekreist. In seiner Schrift.“';
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
      { nomen: 'Sofa', genus: 'n', woerter: ['sofa', 'couch'], text: 'Ein graues Sofa mit einer Wolldecke. Auf der Armlehne eine Packung Taschentücher und eine Fernbedienung, die sie nicht braucht.' }
    ]
  });

  HG.ding('couchtisch_gerdes', {
    nomen: 'Couchtisch', genus: 'm', woerter: ['couchtisch', 'tisch'],
    ort: 'gerdes_wohnung', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein niedriger Tisch aus Kiefernholz. Eine Teetasse mit Rand, ein Untersetzer aus Kork, Brigittes Handy mit dem Display nach unten.'
  });
  HG.ding('sideboard_gerdes', {
    nomen: 'Sideboard', genus: 'n', woerter: ['sideboard', 'kommode', 'anrichte', 'schublade', 'schrank'],
    ort: 'gerdes_wohnung', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein Sideboard in Buche. Darauf Bettinas Foto und ein Stapel Trauerkarten. Die obere Schublade ist zu.',
    bei: { oeffnen: function (api) { api.sage('Du legst die Hand an die Schublade. Brigitte sagt nichts. Sie sieht dich nur an, und du nimmst die Hand wieder weg. Darin liegt Bettinas Handy. Es bleibt, wo es ist.'); return true; } }
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
    beschreibung: 'Ein Stapel Trauerkarten für Bettina Gerdes. Das Foto zeigt ein lachendes Mädchen mit Zahnspange. Darunter: <i>„Du bist nur in ein anderes Zimmer gegangen.“</i> Auf der obersten Karte hat jemand mit Kugelschreiber das Wort „Zimmer“ eingekreist.',
    lesbar: '<i>Bettina Gerdes · 2005 – 2022</i><br><br>„Du bist nur in ein anderes Zimmer gegangen.“<br><br><span class="rot">Zimmer</span> <i>(eingekreist, mit blauem Kugelschreiber – in Carstens Schrift)</i>',
    foto: 'Auf dem Foto ist der Kreis um „Zimmer“ dunkler als auf der Karte, als hätte ihn jemand nachgezogen.'
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
