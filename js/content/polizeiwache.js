// Haus Grest – Inhalt: Schauplatz POLIZEIWACHE HOMBRUCH (Akt 2)
// Spielbibel 8.6.3 (Kellerschlüssel bei Carstens Effekten), 8.6.5 (Polizeiakten = 2. Quelle für Natascha und Carsten),
// 8.6.6 (Pistole: abgeben oder riskieren). Namen, Wortlaut und Zahlen [Vorschlag]; Akteninhalt von David bestätigt (25.11.2026).
//
// Räume:  polizei (Wartebereich mit Tresen, Ankunft)  –O→  polizei_buero (Besprechungsraum, nur in Begleitung)
// Figuren: bei Tag (7–19 Uhr) Polizeioberkommissarin Jansen, nachts Polizeihauptmeister Wolters.
// Ablauf: „frage jansen nach carstens sachen“ → (Pistole dabei? Auswahl: abgeben / nichts sagen) → Besprechungsraum,
//         Jansen holt den Karton (2 Züge allein – ihr Bildschirm zeigt den Vorgang Häuser) → „unterschreibe protokoll“
//         (Pistole verdeckt dabei: versteckter Vergleichswurf Schleichen gegen Jansens Wahrnehmung) → Karton mit
//         Carstens Schlüsselbund (Kellerschlüssel).
// Akte: abgegebene Pistole oder Beruf Polizei → ohne Probe; sonst Überreden (+20 mit Aktenzeichen, −20 nach entdeckter Pistole).
(function () {

  var TAGDIENST = { von: '07:00', bis: '19:00' };
  var JANSEN_WAHRNEHMUNG = 50;   // [Vorschlag]
  var WEG_ZUEGE = 2;             // so lange holt Jansen den Karton

  function tagdienst(api) { return api.istOffen(TAGDIENST); }
  function beamter(api) { return tagdienst(api) ? 'jansen' : 'wolters'; }
  /** Wer sitzt gerade wo? (Jansen bei Tag, Wolters nachts; Jansen begleitet einen nach hinten) */
  function besetzung(api) {
    var hinten = api.raum() === 'polizei_buero';
    if (tagdienst(api)) {
      api.bewege('jansen', hinten ? (api.flag('jansen_weg') ? null : 'polizei_buero') : 'polizei');
      api.bewege('wolters', null);
    } else {
      api.bewege('wolters', 'polizei');
      if (!hinten) api.bewege('jansen', null);
    }
  }

  // ===================================================================
  // ZIEL
  // ===================================================================
  HG.ziel('polizei', {
    name: 'Polizeiwache Hombruch', herkunft: 'Aus der Polizeiwache',
    woerter: ['polizei', 'polizeiwache', 'wache', 'revier', 'kommissariat', 'hombruch'],
    ankunft: 'polizei', fahrzeit: 25,
    fahrt: { tag: 'Du fährst nach Hombruch. Die Wache ist ein Zweckbau aus den Siebzigern zwischen einer Sparkasse und einem Bäcker.',
      nacht: 'Du fährst durch das nächtliche Hombruch. Vor der Wache brennt als einziges Licht weit und breit die blaue Leuchtschrift POLIZEI.' }
  });

  // ===================================================================
  // WARTEBEREICH MIT TRESEN
  // ===================================================================
  HG.raum('polizei', {
    name: 'Polizeiwache Hombruch',
    woerter: ['wache', 'wartebereich', 'warteraum'],
    schauplatz: 'polizei', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: function (api) {
      var t = tagdienst(api)
        ? 'Ein Wartebereich mit festgeschraubten Plastikstühlen, ein Ständer mit Faltblättern („Sicher wohnen im Alter“), ein Tresen hinter Panzerglas mit einer Durchreiche. Hinter der Scheibe sitzt eine Beamtin am Rechner. Neben dem Tresen führt eine Sicherheitstür ohne Klinke nach hinten.'
        : 'Neonlicht, das an den Augen zieht. Die Plastikstühle sind leer. Hinter dem Panzerglas sitzt ein müder Beamter vor einem Becher Tee und einem Funkgerät, das ab und zu knackt. Die Sicherheitstür nach hinten ist zu.';
      if (api.eig('nachlass_karton', 'ort') === 'tresen_wache') t += ' Auf dem Tresen steht dein Karton mit Carstens Sachen.';
      return t;
    },
    kurz: function (api) { return 'Polizeiwache Hombruch. Tresen hinter Panzerglas, ' + (tagdienst(api) ? 'Frau Jansen' : 'Herr Wolters') + ' dahinter.'; },
    riechen: 'Bohnerwachs, Kaffee, nasse Jacken.',
    horchen: { tag: 'Telefone, eine Tastatur, irgendwo hinten lacht jemand.', nacht: 'Das Knacken des Funkgeräts. Das Summen der Neonröhre.' },
    ausgaenge: {
      osten: { ziel: 'polizei_buero', sperre: function (api) { return api.flag('wache_hinten') ? null : 'Die Sicherheitstür hat keine Klinke. Ohne Begleitung kommst du nicht nach hinten.'; } }
    },
    vorBetreten: besetzung,
    jedeRunde: besetzung,
    // Ablenkung des Hauses: der Anruf von „Hauptkommissar Brenner“ war gefälscht
    beimBetreten: function (api, info) {
      if (api.flag('ablenkung_polizei') && !api.flag('ablenkung_polizei_geklaert')) {
        api.setzeFlag('ablenkung_polizei_geklaert');
        api.sage(tagdienst(api)
          ? 'Du nennst am Tresen deinen Namen und fragst nach Hauptkommissar Brenner. Die Beamtin sieht in ihren Rechner, dann telefoniert sie kurz. „Einen Brenner gibt es bei uns nicht. Und hinbestellt hat Sie auch keiner.“ Sie mustert dich. „Ulmenweg zwölf? … Da sind Sie nicht der Erste, der so einen Anruf bekommt.“'
          : 'Du fragst nach Hauptkommissar Brenner. Der Beamte hinter dem Glas reibt sich die Augen. „Brenner? Haben wir nicht. Hatten wir nie.“ Er tippt etwas. „Und von uns hat Sie heute keiner angerufen.“ Dann, leiser: „Ulmenweg? Da rufen öfter Leute an, die’s nicht gibt.“');
        api.hinweis('falscher_anruf_polizei');
      } else if (info.erstesMal) {
        api.sage(tagdienst(api)
          ? 'Die Beamtin hinter dem Panzerglas sieht auf. „Guten Tag. Was kann ich für Sie tun?“ <span class="nebenbei">(„sprich mit jansen“)</span>'
          : 'Der Beamte hinter dem Panzerglas nickt dir zu, ohne aufzustehen. <span class="nebenbei">(„sprich mit wolters“)</span>');
      }
    },
    bei: {
      // „gib die pistole ab“ – an den, der gerade Dienst hat
      geben: function (api, ctx) {
        if (ctx.obj2 || !WAFFE[ctx.obj]) return false;
        return abgeben(api, beamter(api));
      }
    },
    vorschlaege: function (api) {
      var b = tagdienst(api) ? 'jansen' : 'wolters', v = ['sprich mit ' + b];
      if (!api.flag('nachlass_erhalten')) v.push('frage ' + b + ' nach carstens sachen');
      if (api.traegt('pistole') && !api.flag('pistole_abgegeben')) v.push('gib pistole an ' + b);
      if (tagdienst(api) && !api.flag('akte_gezeigt')) v.push('frage jansen nach der akte');
      return v;
    },
    details: [
      { nomen: 'Faltblätter', genus: 'pl', woerter: ['faltblaetter', 'faltblatt', 'staender', 'broschueren', 'flyer'], text: '„Sicher wohnen im Alter“, „Enkeltrick – nicht mit mir!“, „Falsche Polizeibeamte am Telefon“. Das letzte nimmst du in die Hand und legst es dann sehr langsam zurück.' },
      { nomen: 'Panzerglas', genus: 'n', woerter: ['panzerglas', 'scheibe', 'glas', 'durchreiche'], text: 'Dickes Glas mit einer Durchreiche und einer Sprechmembran. Dein Spiegelbild darin ist blass und doppelt – die zwei Scheiben werfen es zweimal zurück, eins knapp hinter dem anderen.' },
      { nomen: 'Sicherheitstür', genus: 'f', woerter: ['sicherheitstuer', 'tuer', 'stahltuer'], text: 'Eine graue Stahltür ohne Klinke, mit einem Kartenleser daneben. Dahinter liegen die Büros.' },
      { nomen: 'Plastikstühle', genus: 'pl', woerter: ['stuehle', 'stuhl', 'plastikstuehle', 'plastikstuhl'], text: 'Orange, festgeschraubt, verkratzt. Auf einem hat jemand mit Kugelschreiber „HILFE“ in die Sitzfläche geritzt, und jemand anderes darunter: „lol“.' }
    ]
  });

  HG.ding('tresen_wache', {
    nomen: 'Tresen', genus: 'm', woerter: ['tresen', 'theke', 'schalter'],
    ort: 'polizei', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein grauer Tresen vor dem Panzerglas, mit einer Klingel und einem angeketteten Kugelschreiber.'
  });

  // ===================================================================
  // DIE BEAMTEN
  // ===================================================================
  var WAFFE = { pistole: true, magazine: true };

  /** Pistole (und Magazine) freiwillig abgeben – straffrei, bringt Vertrauen (Akte ohne Probe). */
  function abgeben(api, wer) {
    if (!api.traegt('pistole') && !api.traegt('magazine')) { api.sage('Du hast nichts dabei, was du abgeben müsstest.'); return true; }
    ['pistole', 'magazine'].forEach(function (id) { if (api.traegt(id)) api.bewege(id, null); });
    api.setzeFlag('pistole_abgegeben');
    if (wer === 'wolters') {
      api.setzeFlag('pistole_bei_wolters');
      api.sage('Du legst die Pistole in die Durchreiche. Wolters ist plötzlich sehr wach. Er zieht die Schublade zu sich, sieht die Waffe lange an, ohne sie anzufassen, dann zieht er Handschuhe an. ' +
        '„Aus dem Nachlass, sagen Sie. Beim Ausräumen gefunden und gleich hergebracht.“ Es klingt nicht wie eine Frage. „So schreib ich das auf. Und ich leg der Kollegin Jansen einen Zettel hin. Die macht morgen Ihren Nachlass.“ Er nickt dir zu. „War richtig so.“');
    } else {
      api.sage('Du legst die Pistole in die Durchreiche. Frau Jansen sieht erst die Waffe an, dann dich. Ihre Hand liegt einen Moment am Holster, dann zieht sie Handschuhe an, nimmt das Magazin heraus und prüft den Lauf. ' +
        '„Walther P99, Seriennummer weggefeilt.“ Lange Pause. „Fundwaffe aus dem Nachlass. Sie haben die beim Ausräumen gefunden und sofort hergebracht. So schreib ich das auf.“ Sie sieht dich über den Rand ihrer Brille an. „Das war vernünftig. Das merk ich mir.“');
    }
    return true;
  }

  function nachlassText(api) {
    if (api.flag('pistole_entdeckt')) return '';
    return api.flag('ablenkung_polizei')
      ? ' Sie stutzt. „Persönliche Gegenstände liegen tatsächlich hier. Woher wissen Sie das? Von uns hat Sie keiner angerufen.“'
      : '';
  }

  /** Carstens Nachlass: Jansen nimmt einen mit nach hinten – vorher die Gelegenheit, die Pistole abzugeben. */
  function nachlass(api) {
    if (!tagdienst(api)) return '„Nachlass? Das macht die Kollegin Jansen, und die Asservatenkammer ist nachts zu. Kommen Sie morgen ab sieben.“';
    if (api.flag('nachlass_erhalten')) {
      if (api.eig('nachlass_karton', 'ort') === 'tresen_wache') return '„Ihr Karton steht doch da“, sagt Frau Jansen und nickt zum Tresen.';
      return '„Den Karton haben Sie schon. Mehr hatten wir nicht von ihm.“';
    }
    if (api.raum() === 'polizei_buero') return '„Ich hol ihn ja schon.“';
    var t = 'Frau Jansen tippt etwas. „Häuser, Carsten. Persönliche Gegenstände, ja, die liegen noch bei uns.“' + nachlassText(api) +
      ' Sie lässt sich den Brief des Notars zeigen, liest ihn gründlich und reicht dir dein Handy zurück. „Gut. Kommen Sie mit nach hinten, da können wir das ordentlich machen.“';
    api.sage(t);
    if (api.traegt('pistole') && !api.flag('pistole_abgegeben')) {
      api.sage('Die Sicherheitstür summt. Und mit einem Mal spürst du Carstens Pistole in deiner Jacke, schwer, als hätte sie sich gerade gemeldet.');
      api.auswahl('Was tust du?', [
        { text: 'Die Pistole in die Durchreiche legen und sagen, woher sie stammt', tu: function () { abgeben(api, 'jansen'); nachHinten(api); } },
        { text: 'Nichts sagen und mitgehen', tu: function () { api.setzeFlag('pistole_verschwiegen'); nachHinten(api); } }
      ]);
      return true;
    }
    nachHinten(api);
    return true;
  }
  function nachHinten(api) {
    api.setzeFlag('wache_hinten');
    api.setzeFlag('jansen_weg', WEG_ZUEGE);
    api.sage('Frau Jansen hält dir die Sicherheitstür auf und führt dich durch einen Flur mit Linoleum in einen kleinen Besprechungsraum. „Einen Moment, ich hol den Karton aus der Asservatenkammer.“ Sie geht hinaus, und die Tür fällt hinter ihr zu.');
    api.gehe('polizei_buero');
  }

  /** Die Ermittlungsakte zeigen lassen: Vertrauen, Beruf oder Überreden. */
  function akte(api) {
    if (!tagdienst(api)) return '„Akten? Nicht um diese Uhrzeit, und nicht von mir. Fragen Sie die Kollegin Jansen, die hat beide Fälle bearbeitet.“';
    if (api.flag('akte_gezeigt')) { zeigeAkte(api, true); return true; }
    var polizei = api.hatVorteil('akte');
    if (!api.flag('pistole_entdeckt') && (api.flag('pistole_abgegeben') || polizei)) {
      api.sage(polizei
        ? 'Frau Jansen sieht deinen Dienstausweis an, dann dich. „{g:Kollege|Kollegin|Kollege}, also.“ Sie seufzt. „Offiziell kriegen Sie das über die Staatsanwaltschaft. Inoffiziell …“'
        : api.flag('pistole_bei_wolters')
          ? 'Frau Jansen zieht einen gelben Zettel unter ihrer Tastatur hervor und liest ihn noch einmal. „Der Kollege Wolters schreibt, Sie haben ihm nachts eine Waffe gebracht. Freiwillig.“ Sie nickt langsam. „Gut.“'
          : 'Frau Jansen zögert. Dann sieht sie zu der Schublade, in der jetzt Carstens Pistole liegt. „Sie haben mir was gebracht, das Sie nicht hätten bringen müssen. Gut.“');
      zeigeAkte(api);
      return true;
    }
    if (api.flag('akte_abgelehnt') === api.tag()) {
      api.sage('„Ich hab Nein gesagt. Und daran ändert sich heute nichts mehr.“');
      api.fehlversuch('polizeiakte', TIPPS);
      return true;
    }
    var mod = 0, gruende = [];
    if (api.hatHinweis('aktenzeichen_romanow')) { mod += 20; gruende.push('Aktenzeichen'); }
    if (api.flag('pistole_entdeckt')) { mod -= 20; gruende.push('Pistole entdeckt'); }
    if (polizei) { mod += 20; gruende.push('Kollegen unter sich'); }
    api.sage('„Die Ermittlungsakte?“ Frau Jansen lehnt sich zurück. „Da haben Sie als Angehörige{g:r||(r)} kein Einsichtsrecht. Das läuft über die Staatsanwaltschaft, mit Anwalt.“' +
      (api.hatHinweis('aktenzeichen_romanow') ? ' Du nennst ihr das Aktenzeichen aus Carstens Unterlagen. Sie hebt die Augenbrauen.' : ''));
    var e = api.probe('ueberreden', { mod: mod, modGrund: gruende.join(', '), grund: 'Frau Jansen die Akte zeigen lassen' });
    if (e.erfolg) {
      api.sage('Du erzählst ihr von Carsten, von dem Haus, von den Anrufen, die es nicht geben kann. Sie hört zu, ohne dich zu unterbrechen. Als du fertig bist, sieht sie eine Weile auf ihre Hände.');
      zeigeAkte(api);
      return true;
    }
    api.setzeFlag('akte_abgelehnt', api.tag());
    api.sage('Sie schüttelt den Kopf. „Tut mir leid. Wirklich. Aber da kann ich nichts machen.“');
    api.fehlversuch('polizeiakte', TIPPS);
    return true;
  }
  var TIPPS = {
    2: function (api) {
      return 'Frau Jansen ist keine, die man überrumpelt. Aber sie merkt sich, wer ehrlich zu ihr ist' +
        (api.traegt('pistole') ? ' – vielleicht hast du etwas bei dir, das du ihr besser freiwillig gibst' : '') + '. Und hinten, im Besprechungsraum, hat sie ihren Bildschirm offen gelassen.';
    },
    3: function (api) {
      return (api.traegt('pistole') ? 'Gib ihr Carstens Pistole. <span class="nebenbei">(„gib pistole an jansen“)</span> Danach zeigt sie dir die Akte. ' : '') +
        'Morgen kannst du es noch einmal versuchen' + (api.hatHinweis('aktenzeichen_romanow') ? ' – mit dem Aktenzeichen aus dem Freigabe-Bescheid fällt es leichter' : ' – mit einem amtlichen Schreiben, das die Akte betrifft, fällt es leichter') + '. Den Vorgang Häuser kannst du auch auf ihrem Bildschirm lesen, solange sie den Karton holt. <span class="nebenbei">(„lies bildschirm“)</span>';
    }
  };
  function zeigeAkte(api, schonGezeigt) {
    api.setzeFlag('akte_gezeigt');
    var wo = api.raum() === 'polizei_buero' ? 'tisch_buero' : 'tresen_wache';
    api.bewege('ermittlungsakte', wo, 'auf');
    api.sage(schonGezeigt
      ? 'Sie schiebt dir die Akte noch einmal hin. „Zehn Minuten.“'
      : 'Sie steht auf, holt zwei graue Hefter aus einem Schrank und legt sie vor dich hin. „Zehn Minuten. Und ich hab Ihnen nichts gezeigt.“ <span class="nebenbei">(„lies akte“)</span>');
  }

  HG.ding('jansen', {
    nomen: 'Frau Jansen', genus: 'f', eigenname: true,
    woerter: ['jansen', 'beamtin', 'polizistin', 'frau', 'oberkommissarin', 'kommissarin', 'polizei'],
    ort: null, person: true, szenerie: true,
    beschreibung: 'Polizeioberkommissarin Anke Jansen, Mitte vierzig, kurze graue Haare, Lesebrille an einer Kette. Sie hat die Art, dich anzusehen, als würde sie sich jedes Wort merken. Wahrscheinlich tut sie das.',
    gespraech: function (api) {
      if (!api.flag('nachlass_erhalten'))
        return '„Jansen.“ Sie schiebt die Brille hoch. „Ich hab die Fälle im Ulmenweg bearbeitet. Beide.“ Eine Pause. „Was wollen Sie wissen?“ <span class="nebenbei">(„frage jansen nach carstens sachen“, „… nach der akte“, „… nach romanow“)</span>';
      // Nach der Übergabe des Nachlasses: neuer Einstieg mit den Themen, die noch offen sind (Alpha-Test 27.11.2026)
      var offen = [];
      if (!api.flag('akte_gezeigt')) offen.push('„… nach der akte“');
      if (!api.flag('jansen_carsten')) offen.push('„… nach carsten“');
      if (!api.flag('jansen_keller')) offen.push('„… nach dem kellerschlüssel“');
      if (!api.flag('jansen_rasiermesser')) offen.push('„… nach dem rasiermesser“');
      return '„Haben Sie alles?“ Sie nickt zu dem Karton, ohne ihn anzusehen. „Noch Fragen?“' +
        (offen.length ? ' <span class="nebenbei">(„frage jansen nach …“: ' + offen.join(', ').replace(/„… nach /g, '„') + ')</span>' : ' Sie wartet einen Moment. „Dann passen Sie auf sich auf. In dem Haus.“');
    },
    themen: {
      'nachlass,sachen,effekten,gegenstaende,persoenliche,karton,abholen,erbe,schluessel,carstens': nachlass,
      'akte,akten,ermittlung,ermittlungen,ermittlungsakte,aktenzeichen,vorgang,bericht,romanow,natascha': akte,
      'carsten,haeuser,tod,selbstmord,suizid,spiegelzimmer': function (api) {
        if (!api.flag('nachlass_erhalten')) return '„Herr Häuser.“ Sie nimmt die Brille ab. „Ich war selbst da, in dem Zimmer mit den Spiegeln. Mehr sag ich dazu nicht, nicht am Tresen.“ Sie sieht dich an. „Seine Sachen liegen übrigens noch bei uns. Die müssten Sie abholen.“';
        api.setzeFlag('jansen_carsten');
        return '„Ich war selbst in dem Zimmer.“ Sie schweigt einen Moment. „Ich hab in zweiundzwanzig Jahren viel gesehen. Aber ich hab danach drei Wochen lang den Badezimmerspiegel zugehängt.“';
      },
      'brenner,anruf,hauptkommissar': function (api) {
        return '„Brenner?“ Sie schüttelt den Kopf. „Gibt’s hier nicht. Wenn Sie so einen Anruf kriegen: auflegen und die 110 wählen. Oder herkommen.“ Sie zögert. „Herr Häuser hat damals auch gesagt, wir hätten ihn angerufen. Hatten wir nicht.“';
      },
      'rasiermesser,messer,1906': function (api) {
        if (api.flag('nachlass_erhalten')) api.setzeFlag('jansen_rasiermesser');
        return api.flag('nachlass_erhalten')
          ? '„Steht im Protokoll. Asservat sieben.“ Ihre Stimme ist sehr ruhig. „Das Siegel war heil. Der Beutel war leer. Ich hab das dreimal nachgezählt, und mein Chef auch.“'
          : '„Darüber rede ich nicht am Tresen.“';
      },
      'pistole,waffe,walther': function (api) {
        if (api.traegt('pistole')) return abgeben(api, 'jansen');
        return api.flag('pistole_abgegeben') ? '„Die ist bei uns gut aufgehoben.“' : '„Was für eine Waffe?“ Sie sieht dich sehr aufmerksam an.';
      },
      'haus,ulmenweg,grest,villa,kolbe,nachbarin': '„Ulmenweg zwölf.“ Sie sagt es, wie andere Leute „Autobahnkreuz“ sagen: eine Stelle, an der es immer wieder kracht. „Die Nachbarin, Frau Kolbe, ruft öfter an. Licht im Haus, wenn keiner drin ist. Wir fahren hin, und da ist nie jemand.“',
      'kellerschluessel,keller,kette,vorhaengeschloss': function (api) {
        if (api.flag('nachlass_erhalten')) api.setzeFlag('jansen_keller');
        return api.flag('nachlass_erhalten') ? '„Den kleinen Schlüssel? Der war an seinem Bund. Den hatte er in der Hand, als wir ihn gefunden haben. Fest in der Hand.“' : '„Was am Schlüsselbund ist, sehen Sie dann ja.“';
      }
    },
    themaSonst: '„Dazu kann ich Ihnen nichts sagen.“',
    bei: {
      geben: function (api, ctx) { if (!WAFFE[ctx.obj]) return false; return abgeben(api, 'jansen'); }
    }
  });

  HG.ding('wolters', {
    nomen: 'Herr Wolters', genus: 'm', eigenname: true,
    woerter: ['wolters', 'beamter', 'polizist', 'herr', 'polizeihauptmeister', 'mann', 'polizei'],
    ort: null, person: true, szenerie: true,
    beschreibung: 'Polizeihauptmeister Wolters, um die sechzig, grauer Vollbart, Glatze mit Haarkranz, Lesebrille auf der Stirn und dunkle Ringe unter den Augen. Nachtschicht seit zwanzig Jahren, sagt sein Gesicht.',
    gespraech: '„Wolters, Nachtdienst.“ Er gähnt hinter vorgehaltener Hand. „Wenn’s kein Notfall ist: Die Kollegen vom Tagdienst sind ab sieben wieder da.“',
    themen: {
      'nachlass,sachen,effekten,gegenstaende,persoenliche,karton,abholen,erbe,carsten,haeuser,carstens': nachlass,
      'akte,akten,ermittlung,ermittlungsakte,aktenzeichen,romanow,natascha': akte,
      'pistole,waffe,walther': function (api) {
        if (api.traegt('pistole')) return abgeben(api, 'wolters');
        return '„Was für eine Waffe?“';
      },
      'haus,ulmenweg,grest,villa,spuk,nachts,nacht': '„Ulmenweg?“ Er sieht auf die Uhr an der Wand. „Ich fahr da nachts nicht mehr hin, wenn’s sich vermeiden lässt. Einmal war oben Licht, und ich hab geklingelt, und dann hat drinnen jemand das Licht ausgemacht. Das Haus war damals versiegelt.“ Er trinkt einen Schluck Tee. „Fragen Sie mich nicht.“',
      'brenner,anruf,hauptkommissar': '„Brenner? Haben wir nicht. Hatten wir nie.“'
    },
    themaSonst: '„Da fragen Sie besser morgen die Kollegin Jansen.“',
    bei: {
      geben: function (api, ctx) { if (!WAFFE[ctx.obj]) return false; return abgeben(api, 'wolters'); }
    }
  });

  // ===================================================================
  // BESPRECHUNGSRAUM
  // ===================================================================
  HG.raum('polizei_buero', {
    name: 'Besprechungsraum',
    woerter: ['besprechungsraum', 'buero', 'raum'],
    schauplatz: 'polizei', karte: { x: 1, y: 0 },
    beschreibung: function (api) {
      var t = 'Ein fensterloser Raum mit einem Resopaltisch, vier Stühlen und einem Kalender der Gewerkschaft der Polizei. An der Wand ein Waschbecken mit einem kleinen Spiegel darüber. Auf dem Tisch steht ein Rechner mit einem großen Bildschirm.';
      if (api.flag('jansen_weg')) t += ' Frau Jansen ist hinausgegangen, um den Karton zu holen. Auf dem Bildschirm ist noch ein Vorgang geöffnet.';
      return t + ' Im Westen geht es zurück zum Wartebereich.';
    },
    kurz: 'Der Besprechungsraum: Resopaltisch, Rechner, ein kleiner Spiegel über dem Waschbecken.',
    riechen: 'Kalter Kaffee und Kopierertoner.',
    horchen: function (api) { return api.flag('jansen_weg') ? 'Schritte im Flur, die sich entfernen. Ein Schlüsselbund. Dann ist es sehr still. Das Waschbecken tropft.' : 'Das Brummen des Rechners. Das Waschbecken tropft.'; },
    ausgaenge: { westen: 'polizei' },
    vorBetreten: besetzung,
    jedeRunde: function (api) {
      var n = api.flag('jansen_weg');
      if (n) {
        n--; api.setzeFlag('jansen_weg', n);
        if (n <= 0) {
          api.setzeFlag('jansen_weg', false);
          api.bewege('jansen', 'polizei_buero');
          api.bewege('nachlass_karton', 'tisch_buero', 'auf');
          api.bewege('uebergabeprotokoll', 'tisch_buero', 'auf');
          api.sage('Die Tür geht auf. Frau Jansen kommt mit einem braunen Karton zurück, auf dem mit Filzstift „HÄUSER, C. – NACHLASS“ steht, und stellt ihn auf den Tisch. Daneben legt sie ein Formular. ' +
            '„Übergabeprotokoll. Lesen Sie’s durch, dann unterschreiben Sie unten.“ <span class="nebenbei">(„lies protokoll“, „unterschreibe protokoll“)</span>');
        }
      }
      besetzung(api);
    },
    // Wer geht, nimmt den Karton mit nach vorn – er wartet auf dem Tresen (keine Sackgasse)
    bei: {
      gehen: function (api) {
        if (api.flag('jansen_weg')) { api.sage('Die Tür lässt sich von innen nur mit einer Karte öffnen. Du musst warten, bis Frau Jansen zurückkommt.'); return true; }
        if (!api.flag('nachlass_erhalten')) { api.sage('„Moment“, sagt Frau Jansen. „Erst unterschreiben, dann können Sie gehen.“'); return true; }
        if (api.eig('nachlass_karton', 'ort') === 'tisch_buero') api.bewege('nachlass_karton', 'tresen_wache', 'auf');
        api.bewege('ermittlungsakte', null);
        api.setzeFlag('wache_hinten', false);
        api.sage('Frau Jansen bringt dich zurück nach vorn' + (api.eig('nachlass_karton', 'ort') === 'tresen_wache' ? ' und stellt den Karton für dich auf den Tresen' : '') + '.');
        return false;
      },
      geben: function (api, ctx) { if (ctx.obj2 || !WAFFE[ctx.obj]) return false; return abgeben(api, 'jansen'); },
      unterschreiben: function (api, ctx) {
        if (ctx.obj && ctx.obj !== 'uebergabeprotokoll') return false;
        return unterschreiben(api);
      }
    },
    vorschlaege: function (api) {
      if (api.flag('jansen_weg')) return ['lies bildschirm', 'warte'];
      if (!api.flag('nachlass_erhalten')) return ['lies protokoll', 'unterschreibe protokoll'];
      var v = ['durchsuche karton'];
      if (!api.flag('akte_gezeigt')) v.push('frage jansen nach der akte');
      return v.concat(['geh nach westen']);
    },
    details: [
      { nomen: 'Spiegel', genus: 'm', woerter: ['spiegel', 'waschbecken', 'becken'], spiegel: 'klein',
        text: 'Ein kleiner, fleckiger Spiegel über einem Waschbecken. Du siehst müde aus. Das Neonlicht macht dich grau.',
        hineinschauen: 'Du siehst hinein. Nur du. Müde, grau, sehr weit weg von Kirchhörde. Es ist erstaunlich, wie erleichternd ein ganz gewöhnlicher Spiegel sein kann.' },
      { nomen: 'Kalender', genus: 'm', woerter: ['kalender'], text: 'November. Ein Streifenwagen vor dem Dortmunder U. Jemand hat den 30. eingekreist: „Urlaub!!!“' },
      { nomen: 'Stühle', genus: 'pl', woerter: ['stuehle', 'stuhl'], text: 'Vier Stühle mit grauem Polster. Einer wackelt.' }
    ]
  });

  HG.ding('tisch_buero', {
    nomen: 'Tisch', genus: 'm', adj: ['grau'], woerter: ['tisch', 'resopaltisch'],
    ort: 'polizei_buero', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein grauer Resopaltisch mit Kaffeerändern.'
  });

  // Solange Jansen den Karton holt, zeigt der Bildschirm den Vorgang Häuser (List-Weg zur Akte)
  HG.ding('bildschirm_wache', {
    nomen: 'Bildschirm', genus: 'm', woerter: ['bildschirm', 'monitor', 'rechner', 'computer', 'vorgang', 'pc'],
    ort: 'polizei_buero', fest: true, szenerie: true, schriftart: 'druck', dauer: { lesen: 3 },
    beschreibung: function (api) {
      return api.flag('jansen_weg') ? 'Der Bildschirm zeigt einen geöffneten Vorgang: „Todesermittlung HÄUSER, Carsten – Ulmenweg 12“. Wenn du dich beeilst …' : 'Der Bildschirm zeigt einen Bildschirmschoner: das Landeswappen, das langsam hin und her schwebt.';
    },
    lesbar: function (api) {
      if (!api.flag('jansen_weg')) return api.hier('jansen') ? 'Frau Jansen dreht den Bildschirm mit einer beiläufigen Bewegung von dir weg.' : 'Nur der Bildschirmschoner.';
      api.hinweis('polizeiakte_haeuser');
      return '<b>Todesermittlung HÄUSER, Carsten (58)</b> – Ulmenweg 12, Obergeschoss, „Ankleidezimmer“ (Tapetentür)<br><br>' + AKTE_HAEUSER +
        '<br><br><i>Im Flur nähern sich Schritte. Du trittst schnell vom Tisch zurück.</i>';
    }
  });

  // ===================================================================
  // AKTE, PROTOKOLL, NACHLASS
  // ===================================================================
  var AKTE_HAEUSER =
    'Aufgefunden am 9.10.2026 durch Kräfte der Feuerwehr nach Hinweis der Nachbarin K. Kolbe. Tapetentür <b>von innen verriegelt</b>, gewaltsam geöffnet. ' +
    'Die Spiegel unverhängt; die Laken (vier Stück) <b>ordentlich gefaltet</b> und neben den Spiegeln gestapelt. Todesursache: Schnittverletzungen, Selbstbeibringung. Keine Hinweise auf Fremdverschulden.<br>' +
    'Mobiltelefon: in den letzten drei Wochen <b>47 eingehende Anrufe</b> von der Nummer, die als „Mama“ gespeichert ist. Anschluss laut Netzbetreiber seit Jahren abgemeldet. Ungeklärt.<br>' +
    'Asservat Nr. 7, Rasiermesser mit Perlmuttgriff, Klinge graviert „1906“: <b>Verbleib ungeklärt</b>. Beutel leer, Siegel unversehrt. Vermerk der Asservatenverwaltung: „Nachzählung negativ“.';
  var AKTE_ROMANOW =
    'Aufgefunden am 22.5.2025, 7:40 Uhr, durch eine Mitarbeiterin der Restaurierungswerkstatt. Todeszeit gegen <b>3 Uhr</b>. Sturz von der Haupttreppe, Genickbruch. ' +
    'Der Staubsauger <b>lief bei Auffinden noch</b>. Das Kabel war in Schienbeinhöhe <b>zweimal um einen Geländerpfosten geknotet</b>. (Randnotiz, Bleistift: „Wer saugt um drei Uhr nachts? Wer knotet das Kabel?“) ' +
    'Ergebnis: Unfall im Haushalt, Verfahren eingestellt.<br>' +
    'Mobiltelefon, letzte SMS an die Schwester (2:51 Uhr): <b>„Die Wand im Keller ist neu verputzt. Ich hab nachgemessen. Da ist ein Raum.“</b>';

  HG.ding('ermittlungsakte', {
    dokument: true,
    nomen: 'Ermittlungsakte', genus: 'f', adj: ['grau'],
    woerter: ['ermittlungsakte', 'akte', 'akten', 'hefter', 'polizeiakte'],
    ort: null, fest: true, schriftart: 'druck', dauer: { lesen: 10 },
    beschreibung: 'Zwei graue Hefter. Auf dem einen: „Az. 2025-KK11-04417 – ROMANOW, Natascha“. Auf dem anderen: „Az. 2026-KK11-05128 – HÄUSER, Carsten“.',
    foto: 'Auf dem Foto der Akte Romanow ist am Rand ein Bleistiftvermerk zu sehen, der im Original fehlt: „Sie hat nicht aufgeräumt.“',
    lesbar: '<b>Polizeipräsidium Dortmund – KK 11 – Todesermittlungen</b><br><br><b>Az. 2025-KK11-04417 – ROMANOW, Natascha (44)</b><br>' + AKTE_ROMANOW +
      '<br><br><b>Az. 2026-KK11-05128 – HÄUSER, Carsten (58)</b><br>' + AKTE_HAEUSER,
    bei: {
      lesen: function (api) { api.hinweis('polizeiakte_romanow'); api.hinweis('polizeiakte_haeuser'); return false; },
      nehmen: function (api) { api.sage('„Die bleibt hier“, sagt Frau Jansen. „Abfotografieren hab ich nicht gesehen.“'); return false; }
    }
  });

  HG.ding('uebergabeprotokoll', {
    dokument: true,
    nomen: 'Übergabeprotokoll', genus: 'n', adj: ['amtlich'],
    woerter: ['uebergabeprotokoll', 'protokoll', 'formular', 'liste', 'asservatenliste'],
    ort: null, fest: true, schriftart: 'druck', dauer: { lesen: 3 },
    beschreibung: 'Ein Formular mit Stempel: „Herausgabe von Nachlassgegenständen“. Unten eine Linie für deine Unterschrift.',
    lesbar: function (api) {
      return '<b>Polizeipräsidium Dortmund – Herausgabe von Nachlassgegenständen</b><br>Verstorbener: Häuser, Carsten · Az. 2026-KK11-05128<br><br>' +
        '1. Schlüsselbund (5 Schlüssel)<br>2. Geldbörse, braun, Leder, mit Inhalt<br>3. Lesebrille im Etui<br>4. Armbanduhr, Edelstahl<br>5. Kugelschreiber<br>6. Mobiltelefon – verbleibt bis zum Abschluss der Auswertung<br>' +
        '<b>7. Rasiermesser, Perlmuttgriff – entfällt. Verbleib ungeklärt.</b><br><br>Empfangen: ____________________' +
        (api.flag('nachlass_erhalten') ? ' <i>(deine Unterschrift)</i>' : '');
    },
    bei: {
      unterschreiben: function (api) { return unterschreiben(api); },
      lesen: function (api) {
        if (!api.flag('protokoll_gelesen')) {
          api.setzeFlag('protokoll_gelesen');
          api.sage('Du bleibst an Position sieben hängen. Frau Jansen folgt deinem Blick. „Ja“, sagt sie nur. „Das steht da so.“');
        }
        return false;
      },
      nehmen: function (api) { api.sage('„Das Original bleibt hier“, sagt Frau Jansen. „Eine Kopie kriegen Sie mit der Post.“'); return true; }
    }
  });

  /** Unterschrift: Wer die Pistole verschwiegen hat, riskiert, dass sie auffällt (verdeckter Vergleichswurf). */
  function unterschreiben(api) {
    if (api.raum() !== 'polizei_buero' || !api.eig('uebergabeprotokoll', 'ort')) { api.sage('Hier gibt es nichts zu unterschreiben.'); return true; }
    if (api.flag('nachlass_erhalten')) { api.sage('Du hast schon unterschrieben.'); return true; }
    api.setzeFlag('nachlass_erhalten');
    api.setze('nachlass_karton', 'offen', true);
    api.sage('Du beugst dich über den Tisch und unterschreibst mit dem Kugelschreiber, den Frau Jansen dir hinhält.');
    if (api.traegt('pistole') && !api.flag('pistole_abgegeben')) {
      // Spielbibel 8.6.6 – Davids Regel (25.11.2026): versteckter Vergleichswurf Schleichen gegen Jansens Wahrnehmung.
      var v = api.vergleich('schleichen', { wert: JANSEN_WAHRNEHMUNG, name: 'Frau Jansen', fertigkeit: 'Wahrnehmung' }, { versteckt: true, grund: 'Pistole verbergen' });
      if (v.verloren) {
        api.setzeFlag('pistole_entdeckt');
        ['pistole', 'magazine'].forEach(function (id) { if (api.traegt(id)) api.bewege(id, null); });
        api.abschnitt(46, 'Als du dich vorbeugst, schwingt deine Jacke vor, und der Griff der Pistole schlägt mit einem dumpfen Klacken gegen die Tischkante.<br><br>' +
          'Frau Jansen ist schneller, als du es ihr zugetraut hättest. Ihre Hand liegt am Holster. „Langsam. Beide Hände auf den Tisch.“ Sie nimmt dir die Waffe ab, entlädt sie, liest die weggefeilte Seriennummer und sieht dich lange an.<br><br>' +
          '„Unerlaubter Besitz einer Schusswaffe. Das gibt eine Anzeige, Sie kriegen Post von der Staatsanwaltschaft.“ Sie schiebt dir trotzdem den Karton hin. „Das hier gehört Ihnen. Ist Erbe, da kann ich nichts machen.“ Ihre Stimme ist kühl geworden. „Und alles andere können Sie vergessen.“');
        api.nervenProbe('0/1W3', { grund: 'Erwischt' });
      } else {
        api.sage('Frau Jansens Blick wandert kurz über deine Jacke. Dann tippt sie auf das Formular. „Hier noch das Datum.“');
      }
    }
    api.sage('„So. Dann gehört das jetzt Ihnen.“ Sie klappt den Karton auf. <span class="nebenbei">(„durchsuche karton“)</span>');
    return true;
  }

  HG.ding('nachlass_karton', {
    nomen: 'Karton', genus: 'm', adj: ['braun'], woerter: ['karton', 'nachlass', 'kiste', 'pappkarton', 'effekten'],
    ort: null, behaelter: true, oeffenbar: true, offen: false, fest: 'Den Karton musst du nicht mitschleppen. Nimm heraus, was du brauchst.',
    beschreibung: 'Ein brauner Umzugskarton, mit Filzstift beschriftet: „HÄUSER, C. – NACHLASS“.',
    bei: {
      oeffnen: function (api) { if (api.flag('nachlass_erhalten')) return false; api.sage('„Erst unterschreiben, bitte“, sagt Frau Jansen und legt die Hand auf den Deckel.'); return true; },
      durchsuchen: function (api) { if (api.flag('nachlass_erhalten')) return false; api.sage('„Erst unterschreiben, bitte“, sagt Frau Jansen und legt die Hand auf den Deckel.'); return true; }
    }
  });

  // Carstens Schlüsselbund: daran der Kellerschlüssel (Spielbibel 8.6.3) – schließt die Kette auf (dachboden.js)
  HG.ding('carstens_schluessel', {
    nomen: 'Schlüsselbund', genus: 'm', adj: ['schwer'],
    woerter: ['schluesselbund', 'schluessel', 'bund', 'kellerschluessel', 'vorhaengeschlossschluessel'],
    kurzwort: 'schlüsselbund',
    ort: 'nachlass_karton', rel: 'in', istSchluessel: true, klein: true,
    beschreibung: 'Carstens Schlüsselbund: ein Autoschlüssel, zwei Haustürschlüssel (einer davon für den Ulmenweg), ein Briefkastenschlüssel – und ein kleiner, neuer Messingschlüssel für ein Vorhängeschloss. An dem hängt ein Streifen Kreppband, in Carstens Schrift: <b>K</b>. Der Messing ist an einer Stelle blank gerieben, als hätte jemand den Schlüssel sehr lange sehr fest gehalten.',
    texte: { nehmen: 'Du nimmst Carstens Schlüsselbund. Er ist schwerer, als er aussieht. Der kleine Messingschlüssel mit dem „K“ klimpert gegen die anderen.' }
  });
  HG.ding('geldboerse', {
    nomen: 'Geldbörse', genus: 'f', adj: ['braun'], woerter: ['geldboerse', 'portemonnaie', 'brieftasche', 'boerse', 'geldbeutel'],
    ort: 'nachlass_karton', rel: 'in', behaelter: true, oeffenbar: true, offen: false, klein: true,
    beschreibung: 'Eine abgewetzte braune Lederbörse. Darin: zwanzig Euro, eine Bankkarte, ein Organspendeausweis – und ein kleines, abgegriffenes Foto.'
  });
  HG.ding('foto_familienfeier', {
    dokument: true,
    nomen: 'Foto', genus: 'n', adj: ['klein', 'abgegriffen'], zusatz: 'von der Familienfeier',
    woerter: ['foto', 'bild', 'familienfeier', 'familienfoto', 'kinderfoto'],
    ort: 'geldboerse', rel: 'in',
    beschreibung: 'Ein kleines Foto, an den Ecken weich gegriffen: eine Familienfeier in einem Garten, Lampions, ein Tapeziertisch mit Kuchen. Ein junger Mann mit Schnurrbart hockt neben einem Kind und zeigt ihm etwas in seiner Hand. Das Kind bist du. Den Tag hattest du vergessen. Er offenbar nicht.',
    rueckseite: { beschreibung: 'Auf der Rückseite, in Kugelschreiber: „Der Letzte, der übrig ist.“.', schrift: true }
  });
  HG.ding('lesebrille_carsten', {
    nomen: 'Lesebrille', genus: 'f', woerter: ['lesebrille', 'brille', 'etui', 'brillenetui'], klein: true,
    ort: 'nachlass_karton', rel: 'in',
    beschreibung: 'Eine Lesebrille in einem harten Etui. Das linke Glas hat einen feinen Sprung, genau in der Mitte.'
  });
  HG.ding('armbanduhr_carsten', {
    nomen: 'Armbanduhr', genus: 'f', adj: ['edelstahl'], woerter: ['armbanduhr', 'uhr'], klein: true,
    ort: 'nachlass_karton', rel: 'in',
    beschreibung: 'Eine schlichte Armbanduhr aus Edelstahl. Sie läuft. Sie geht genau drei Minuten nach.'
  });

  // ===================================================================
  // HINWEISE (Spielbibel 8.6.5: zweite Quelle für Natascha und Carsten)
  // ===================================================================
  HG.hinweis('polizeiakte_romanow', {
    titel: 'Polizeiakte Romanow', strang: 'D',
    text: 'Natascha starb gegen 3 Uhr nachts. Das Staubsaugerkabel war in Schienbeinhöhe zweimal um einen Geländerpfosten geknotet, der Staubsauger lief am Morgen noch. Ihre letzte SMS an die Schwester: „Die Wand im Keller ist neu verputzt. Ich hab nachgemessen. Da ist ein Raum.“ Eingestellt als Unfall.',
    stichworte: ['romanow', 'natascha', 'akte', 'kabel', 'keller', 'wand', 'polizei']
  });
  HG.hinweis('polizeiakte_haeuser', {
    titel: 'Polizeiakte Häuser', strang: 'E',
    text: 'Carsten lag hinter der von innen verriegelten Tapetentür – wie 1974 Hallmann. Die Laken hatte er gefaltet neben die Spiegel gelegt. Auf seinem Handy 47 Anrufe von „Mama“, deren Anschluss seit Jahren abgemeldet ist. Das Rasiermesser von 1906 ist aus der Asservatenkammer verschwunden – Siegel heil, Beutel leer.',
    stichworte: ['carsten', 'haeuser', 'akte', 'rasiermesser', 'mama', 'polizei', 'tapetentuer']
  });

})();
