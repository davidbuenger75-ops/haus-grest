// Haus Grest – Inhalt: FRIEDHOF (Akt 2)
// Spielbibel 9.3/8.7: Grab Grest mit der Inschrift zum Ring („Bis unser Tag wiederkommt“) = 3. Quelle „Der Ring ist der
// Anker“; kein Grab der Pflegerin. Bernwards Tod 1905 war ein Unfall (David). Alles Übrige [Vorschlag von Claude, 27.11.2026].
//
// Räume: friedhof (Tor und Hauptweg, Gärtnerhäuschen, Ankunft)  –norden→  friedhof_alt (alter Teil, Grabstelle Grest)
// Rätsel „Die Inschrift“ (Moos in den Buchstaben):
//   Kopf      – das Moos entfernen („entferne moos“, „kratze moos aus“)
//   Fertigkeit – Wahrnehmung beim Lesen (abends −10)
//   Figur     – Herr Kowalski, der Friedhofsgärtner, kennt die Inschrift auswendig
// Das Grabsymbol (zwei Hände, nur die schmale trägt einen Ring) deutet die Wahl im Spiegelzimmer an.
(function () {

  // Das Platzhalter-Ziel bleibt (schauplaetze.js), der Raum wird hier neu angelegt.
  HG.daten.ziele.friedhof.fahrt = { tag: 'Du fährst nach Kirchhörde hinein. Die alte Dorfkirche steht auf einem kleinen Hügel, darum herum der Friedhof hinter einer Bruchsteinmauer.',
    abend: 'Du fährst nach Kirchhörde. Hinter der Bruchsteinmauer des Friedhofs brennen schon die ersten Grablichter.' };

  function inschriftGelesen(api) {
    api.hinweis('grabstein_grest');
  }

  // ===================================================================
  // TOR UND HAUPTWEG
  // ===================================================================
  HG.raum('friedhof', {
    name: 'Friedhof Kirchhörde', woerter: ['friedhof', 'hauptweg', 'tor', 'eingang'],
    schauplatz: 'friedhof', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: {
      tag: 'Ein schmiedeeisernes Tor in einer Bruchsteinmauer, dahinter ein Hauptweg aus Kies zwischen alten Linden. Rechts die Gräber der letzten Jahrzehnte, gepflegt, mit Heidekraut und Grablichtern. Neben dem Tor ein Gärtnerhäuschen mit Schubkarre, Gießkannen und einem Wasserhahn. Nach Norden, hinter der Kirche, wird der Friedhof älter und dunkler.',
      abend: 'Das Tor steht noch offen, aber nicht mehr lange. Unter den Linden ist der Hauptweg schon dunkel, auf den neueren Gräbern flackern rote Grablichter. Am Gärtnerhäuschen brennt eine Lampe. Nach Norden, hinter der Kirche, ist es schon fast dunkel.'
    },
    kurz: 'Am Tor des Friedhofs Kirchhörde: Hauptweg, Linden, das Gärtnerhäuschen. Norden: der alte Teil hinter der Kirche.',
    riechen: 'Nasses Laub, Kerzenwachs, frische Erde von einem neuen Grab.',
    horchen: 'Krähen in den Linden. Ein Rechen auf Kies. Von der Straße her, sehr weit weg, ein Bus.',
    ausgaenge: { norden: 'friedhof_alt' },
    vorBetreten: function (api) { api.bewege('kowalski', 'friedhof'); },
    beimBetreten: function (api, info) {
      if (info.erstesMal) api.sage('Am Gärtnerhäuschen recht ein Mann in grüner Latzhose Laub zusammen. Er sieht kurz auf, nickt und recht weiter. <span class="nebenbei">(„sprich mit gärtner“)</span>');
    },
    vorschlaege: function (api) {
      var v = ['sprich mit gärtner'];
      if (!api.flag('kowalski_grest')) v.push('frage gärtner nach grest');
      return v.concat(['geh nach norden']);
    },
    details: [
      { nomen: 'Gärtnerhäuschen', genus: 'n', woerter: ['gaertnerhaeuschen', 'haeuschen', 'schuppen', 'schubkarre', 'giesskannen', 'wasserhahn'], text: 'Ein Backsteinhäuschen mit grüner Tür. Davor eine Schubkarre voller Laub, Gießkannen in einer Reihe, ein Rechen. An der Tür eine Liste mit Grabstellen und Daten in Druckschrift.' },
      { nomen: 'Linden', genus: 'pl', woerter: ['linden', 'baeume', 'baum', 'kraehen'], text: 'Alte Linden, hohl im Stamm. In den Kronen sitzen Krähen, sehr viele, und sehr still.' },
      { nomen: 'Gräber', genus: 'pl', woerter: ['graeber', 'grab', 'grablichter', 'grablicht', 'heidekraut'], text: 'Neuere Gräber: polierter Granit, Heidekraut, Grablichter in roten Hüllen. Namen, die du nicht kennst. Ein Grab weiter vorn ist ganz frisch, die Erde noch locker. „Häuser“ steht auf dem Holzkreuz. Carsten.',
        bei: { untersuchen: function (api) {
          if (api.flag('carstens_grab')) return false;
          api.setzeFlag('carstens_grab');
          api.sage('Neuere Gräber: polierter Granit, Heidekraut, Grablichter in roten Hüllen. Ein Grab weiter vorn ist ganz frisch, die Erde noch locker, ein schlichtes Holzkreuz: <i>Carsten Häuser · 1968 – 2026</i>. Kein Kranz, keine Blumen. Nur, in einem Senfglas, ein Zweig Lavendel. Du hast ihn nicht hingestellt.');
          api.nervenProbe('0/1W2', { grund: 'Lavendel auf Carstens Grab' });
          return true;
        } } }
    ]
  });

  // ===================================================================
  // DER ALTE TEIL
  // ===================================================================
  HG.raum('friedhof_alt', {
    name: 'Alter Friedhof', woerter: ['alter', 'teil', 'kirche', 'grabstelle'],
    schauplatz: 'friedhof', karte: { x: 0, y: -1 },
    beschreibung: {
      tag: 'Hinter der Kirche ist der Friedhof hundert Jahre älter. Schiefe Steine, Efeu, Eisenkreuze mit abgeblätterter Farbe, Engel ohne Nasen. Die Wege sind kaum mehr als Trampelpfade. An der Kirchenmauer, unter einer Eibe, steht ein hoher Stein aus dunklem Sandstein mit einer Einfassung aus Eisen – die Grabstelle Grest. Auf dem Grab, mitten im November, blüht Lavendel.',
      abend: 'Hinter der Kirche ist es fast dunkel. Die alten Steine stehen schief wie Leute, die sich nach dir umdrehen. Unter der Eibe an der Kirchenmauer der hohe dunkle Stein der Grabstelle Grest. Der Lavendel darauf ist das Einzige, was noch Farbe hat.'
    },
    kurz: 'Der alte Teil hinter der Kirche: schiefe Steine, Efeu, die Grabstelle Grest unter der Eibe. Süden: zurück zum Tor.',
    riechen: 'Moos, Eibennadeln, kalter Sandstein. Und Lavendel, so stark, als stünde jemand neben dir, der sich damit parfümiert hat.',
    horchen: { tag: 'Die Krähen sind hierher gefolgt. Sie sitzen auf der Kirchenmauer, eine neben der anderen, und keine sagt etwas.', abend: 'Nichts. Selbst die Krähen sind still. Dann, vom Grab Grest her, ein leises Knistern, wie trockene Blätter. Es ist windstill.' },
    ausgaenge: { sueden: 'friedhof' },
    // Abends wacht eine Krähe (Spieltest 2): Sie fliegt auf, landet ein paar Steine weiter und sieht dir zu – solange du
    // hier bist, jedes Mal von einem anderen Platz aus. Sie setzt sich nicht auf die Hand.
    vorBetreten: function (api) { api.bewege('kraehe_grab', api.flag('friedhof_abend_' + api.tag()) ? 'friedhof_alt' : null); },
    beimBetreten: function (api, info) {
      if (info.erstesMal) api.sage('Als du um die Kirche biegst, fliegen die Krähen von der Mauer auf, alle zugleich, und lassen sich drei Meter weiter wieder nieder. Wie Leute, die Platz machen.');
      if (api.tageszeit() === 'abend' && !api.flag('friedhof_abend_' + api.tag())) {
        api.setzeFlag('friedhof_abend_' + api.tag());
        api.bewege('kraehe_grab', 'friedhof_alt');
        api.sage('Auf dem Stein der Grests sitzt eine einzelne Krähe. Sie sieht dich an, dann zum Lavendel, dann wieder dich. Als du einen Schritt näher kommst, fliegt sie auf, schwer und ohne einen Laut, und landet ein paar Grabsteine weiter auf einem Eisenkreuz. Dort dreht sie den Kopf und sieht dich weiter an.');
      }
    },
    vorschlaege: function (api) {
      var v = ['untersuche grabstein'];
      if (!api.hatHinweis('grabstein_grest')) v.push('lies inschrift');
      return v.concat(['geh nach süden']);
    },
    details: [
      { nomen: 'Gräber', genus: 'pl', adj: ['alt'], woerter: ['graeber', 'kreuze', 'eisenkreuze', 'engel', 'reihen'], text: 'Hier liegt das alte Kirchhörde: Bauern, Bergleute, ein Lehrer, Kinder. Viele Namen sind nicht mehr zu lesen. Einige weiter hinten tragen Namen, die du aus Carstens Grundbuchauszug kennst: Ostermann, Teubner. Man hat sie nebeneinandergelegt, als gehörten sie zusammen.' },
      // Efeu als eigenes Detail (Spieltest 3: „untersuche efeu“ zeigte die Beschreibung der alten Gräber)
      { nomen: 'Efeu', genus: 'm', woerter: ['efeu', 'ranken', 'efeuranken', 'blaetter'], text: 'Efeu überzieht die alten Steine, dunkelgrün und glänzend, als wäre nicht November. An manchen Gräbern hat er die Namen ganz verschluckt; du müsstest ihn wegreißen, um zu lesen, wer darunter liegt. Nur am Stein der Grests wächst kein lebendiger Efeu – dort ist er aus Sandstein, ein gemeißelter Kranz um die beiden Hände.',
        tasten: 'Die Blätter sind kalt und wachsig. Darunter, zwischen den Ranken, der raue Stein.', entfernen: 'Du ziehst an einer Ranke. Sie gibt nicht nach, sie hält sich am Stein fest wie mit Fingern. Du lässt sie.' },
      { nomen: 'Eibe', genus: 'f', woerter: ['eibe', 'baum', 'nadeln'], text: 'Eine alte Eibe, dunkel und dicht. Der Boden darunter ist trocken, obwohl es geregnet hat. Nur das Grab der Grests liegt im Schatten, als hätte der Baum sich darüber gebeugt.' },
      { nomen: 'Kirchenmauer', genus: 'f', woerter: ['kirchenmauer', 'mauer', 'kirche'], text: 'Die Rückwand der Dorfkirche, Bruchstein, ein vermauertes gotisches Fenster. Die Krähen sitzen auf dem Sims in einer Reihe.' }
    ]
  });

  var KRAEHE_PLAETZE = [
    'Auf einem schiefen Eisenkreuz ein paar Gräber weiter sitzt die Krähe und sieht dich an.',
    'Die Krähe sitzt jetzt auf dem Kopf eines Engels ohne Nase, zwei Reihen hinter dir. Sie sieht her.',
    'Auf der Einfassung eines eingesunkenen Grabes, ganz nah am Weg, sitzt die Krähe. Ihr Auge glänzt. Sie sieht dich an.',
    'Die Krähe hat sich auf den unteren Ast der Eibe gesetzt, genau über dir. Sie sieht hinunter.'
  ];
  HG.ding('kraehe_grab', {
    nomen: 'Krähe', genus: 'f', adj: ['einzeln', 'schwarz'], woerter: ['kraehe', 'vogel', 'rabe'],
    ort: null, fest: 'Sie lässt dich nicht näher als drei Schritte heran. Dann hüpft sie weiter, ohne Eile.',
    hierText: function (api) { return KRAEHE_PLAETZE[api.zug() % KRAEHE_PLAETZE.length]; },
    beschreibung: 'Eine einzelne Krähe, größer als die auf der Mauer, das Gefieder stumpf wie Asche. Sie beobachtet dich. Wenn du dich bewegst, bewegt sich nur ihr Kopf.',
    texte: { sprechen: 'Die Krähe legt den Kopf schief. Sonst nichts.', horchen: 'Kein Laut. Nicht einmal das Rascheln von Federn.' }
  });

  HG.ding('lavendel_grab', {
    nomen: 'Lavendel', genus: 'm', woerter: ['lavendel', 'blueten', 'blumen', 'strauch', 'grabbepflanzung'],
    ort: 'friedhof_alt', fest: true, szenerie: true,
    beschreibung: 'Ein Lavendelstrauch, so dicht und so violett wie im Juli. Es ist Ende November. Rundherum ist alles welk, nur der Lavendel nicht. Kein Unkraut, kein Laub darin. Jemand pflegt das.',
    riechen: 'Lavendel. Schwer, süß, viel zu stark. Wie in der Halle von Haus Grest um drei Uhr nachts.',
    texte: { nehmen: 'Du greifst nach einem Zweig. Die Krähen auf der Mauer heben die Köpfe, alle zugleich. Du lässt es.' }
  });

  // ===================================================================
  // DER GRABSTEIN – Rätsel „Die Inschrift“
  // ===================================================================
  var TIPPS = {
    2: 'Die Buchstaben unter den Händen sind voller Moos. Ohne das Moos kann man sie kaum lesen.',
    3: 'Kratz das Moos aus den Buchstaben – oder frag den Gärtner, der kennt die Steine hier auswendig. <span class="nebenbei">(„entferne moos“, „frage gärtner nach der inschrift“)</span>'
  };
  var INSCHRIFT = '<i>In den Sockel gehauen, unter den Händen:</i><br><br><b>BIS UNSER TAG WIEDERKOMMT</b>';

  function lesen(api) {
    if (api.flag('moos_weg') || api.hatHinweis('grabstein_grest')) {
      api.schrift(INSCHRIFT, 'druck');
      inschriftGelesen(api);
      return true;
    }
    var e = api.probe('wahrnehmung', { mod: api.tageszeit() === 'abend' ? -10 : 0, grund: 'die Inschrift unter dem Moos entziffern' });
    if (e.erfolg) {
      api.sage('Du gehst in die Hocke, bis das Licht schräg über den Stein fällt. Buchstabe für Buchstabe tritt aus dem Moos hervor.');
      api.schrift(INSCHRIFT, 'druck');
      inschriftGelesen(api);
      api.fehlversucheVergessen('inschrift');
      return true;
    }
    api.sage('Unter den Händen steht eine Zeile, aber das Moos sitzt so dicht in den Buchstaben, dass du nur ein „B“ erkennst und vielleicht ein „T“.');
    api.fehlversuch('inschrift', TIPPS);
    return true;
  }
  function moosWeg(api) {
    if (api.flag('moos_weg')) { api.sage('Die Inschrift ist frei. Mehr Moos gibt es nicht, nur grüne Spuren in den Rillen.'); return true; }
    api.setzeFlag('moos_weg');
    api.zeitVergeht(10);
    api.sage('Du kratzt mit dem Fingernagel und dann mit einem Schlüssel das Moos aus den Buchstaben. Es löst sich in feuchten grünen Krumen. Die Krähen auf der Mauer sehen dir zu. Nach zehn Minuten sind deine Finger kalt und grün, und die Zeile ist frei.');
    lesen(api);
    return true;
  }

  HG.ding('grabstein_grest', {
    nomen: 'Grabstein', genus: 'm', adj: ['dunkel'],
    woerter: ['grabstein', 'grab', 'grabmal', 'grests', 'grabstelle', 'grest', 'haende', 'hand', 'ring', 'sockel', 'einfassung'],
    ort: 'friedhof_alt', fest: true, szenerie: true,
    beschreibung: function (api) {
      return 'Ein hoher Stein aus dunklem Sandstein, oben abgerundet, mit einer rostigen Eiseneinfassung. Oben, in einem Kranz aus gemeißeltem Efeu, <b>zwei Hände, die einander halten</b> – ein altes Grabsymbol für Ehe und Wiedersehen. Die rechte ist eine Männerhand mit steifer Manschette. Die linke ist schmal, mit sehr dünnen Fingern, und am Ringfinger hat der Steinmetz einen <b>Ring</b> herausgearbeitet. Jemand hat ihn blank gerieben; er ist heller als der ganze Stein.<br><br>' +
        'Darunter:<br><i>Bernward Grest · Architekt · † 19. Juli 1905</i><br><i>Elisabeth Grest · † 1. März 1930</i><br><br>' +
        (api.flag('moos_weg') ? 'Im Sockel die Zeile, jetzt frei vom Moos. <span class="nebenbei">(„lies inschrift“)</span>' : 'Im Sockel eine weitere Zeile, die Buchstaben voller Moos. <span class="nebenbei">(„lies inschrift“)</span>');
    },
    lesbar: INSCHRIFT,
    bei: {
      lesen: lesen,
      entfernen: moosWeg,
      tasten: function (api) {
        api.sage('Du legst die Finger auf die gemeißelten Hände. Der Stein ist eiskalt – bis auf den Ring. Der ist warm, als hätte ihn eben noch jemand getragen.');
        api.nervenProbe('0/1', { grund: 'der warme Ring im Stein' });
        return true;
      }
    }
  });
  // Der gemeißelte Efeukranz – „untersuche efeu am grabstein“ (Spieltest 3)
  HG.ding('efeukranz_grab', {
    nomen: 'Efeukranz', genus: 'm', adj: ['gemeißelt'], woerter: ['efeukranz', 'kranz', 'efeu', 'blaetter'],
    ort: 'grabstein_grest', rel: 'teil', fest: true, szenerie: true,
    beschreibung: 'Ein Kranz aus Efeu, in den Sandstein gemeißelt, jedes Blatt einzeln, die Adern fein wie mit der Nadel gezogen. Er schließt sich um die beiden Hände. Echter Efeu wuchert an allen Steinen ringsum – nur an diesem nicht, als hielte er Abstand.',
    tasten: 'Kalter, körniger Stein. Die Blätter sind so fein gearbeitet, dass du ihre Ränder unter den Fingerkuppen spürst.'
  });
  HG.ding('moos_grab', {
    nomen: 'Moos', genus: 'n', woerter: ['moos', 'flechten', 'buchstaben', 'inschrift', 'zeile'],
    ort: 'friedhof_alt', fest: true, szenerie: true,
    beschreibung: function (api) {
      return api.flag('moos_weg') ? 'Nur noch grüne Spuren in den Rillen der Buchstaben. Die Inschrift ist frei. <span class="nebenbei">(„lies inschrift“)</span>'
        : 'Dichtes, feuchtes Moos in den Rillen der Inschrift im Sockel. Man könnte es auskratzen.';
    },
    bei: { lesen: lesen, entfernen: moosWeg, nehmen: moosWeg }
  });

  // ===================================================================
  // HERR KOWALSKI, FRIEDHOFSGÄRTNER
  // ===================================================================
  HG.ding('kowalski', {
    nomen: 'Herr Kowalski', genus: 'm', eigenname: true,
    woerter: ['kowalski', 'gaertner', 'friedhofsgaertner', 'mann', 'herr', 'waerter', 'friedhofswaerter'],
    ort: 'friedhof', person: true, szenerie: true,
    beschreibung: 'Ein Mann um die sechzig in grüner Latzhose, Wollmütze, Hände wie Baumrinde. Er recht ruhig und gründlich und sieht nur auf, wenn er muss.',
    gespraech: function (api) {
      return '„Kowalski. Ich mach hier die Gräber, seit dreißig Jahren.“ Er stützt sich auf den Rechen. „Wen suchen Sie?“ <span class="nebenbei">(„frage gärtner nach …“ – Grest, Carstens Grab, Lavendel, Pflegerin, Inschrift)</span>';
    },
    themen: {
      // „frage gärtner nach carstens grab“ (Spieltest 3) – steht vorn, sonst fängt „grab“ das Thema Grest ab [Vorschlag]
      'carstens,carstensgrab,beerdigung,beerdigt,bestattung,beisetzung,senfglas': function () {
        return '„Häuser, ja.“ Er lehnt den Rechen an die Schubkarre. „Ende Oktober unter die Erde gekommen. Kein Pfarrer, nur einer vom Bestatter, der was vorgelesen hat. Bezahlt hat der Notar, aus dem Nachlass – Reihengrab, das Einfachste, Holzkreuz, bis ein Stein kommt. Wenn einer kommt.“ Er sieht zum frischen Grab hinüber. „Da waren nur der Notar und die alte Frau aus dem Ulmenweg. Und der Lavendel im Senfglas …“ Er schüttelt langsam den Kopf. „Den stellt jemand jeden Morgen hin. Ich hab ihn zweimal weggeräumt. Ich bin um sieben hier, und er steht schon da. Ich hab noch nie gesehen, wer.“';
      },
      'grest,grab,grabstelle,elisabeth,bernward,stein,grabstein': function (api) {
        api.setzeFlag('kowalski_grest');
        return '„Grest? Hinten, hinter der Kirche, unter der Eibe. Der hohe dunkle Stein mit den Händen.“ Er sieht zur Kirche. „Das ist bezahlt bis 2050. Im Februar 1930 bar bezahlt, für hundertzwanzig Jahre. Steht so in der alten Kartei. Unterschrieben hat sie selbst, die Frau Grest. Vier Wochen bevor sie gestorben ist.“ Er kratzt sich unter der Mütze. „Als hätte sie gewusst, dass sie lange warten muss.“';
      },
      'inschrift,zeile,spruch,moos,sockel,schrift': function (api) {
        api.sage('„Die Zeile im Sockel?“ Er muss nicht nachdenken. „Bis unser Tag wiederkommt. Hat sie 1905 für ihn machen lassen, als er verunglückt ist. Ich kratz da jedes Frühjahr das Moos raus, und jeden Herbst ist es wieder drin.“ Er sieht dich an. „Und den Ring putzt einer. Ich nicht.“');
        inschriftGelesen(api);
        return true;
      },
      'lavendel,blumen,strauch,pflanze,pflege': function () {
        return '„Den hab ich nicht gepflanzt.“ Er sagt es schnell, als hätte ihn das schon mal jemand gefragt. „Der war schon da, als ich angefangen hab. Und der blüht. Immer. Auch im Januar. Ich hab ihn mal zurückgeschnitten, 1998. Am nächsten Morgen war er wieder so wie vorher.“ Er recht weiter. „Ich schneid ihn nicht mehr.“';
      },
      'pflegerin,kraehe,schwester,kraehen': function () {
        return '„Eine Pflegerin? Bei den Grests?“ Er schüttelt den Kopf. „Da liegt nur das Ehepaar. In der ganzen Kartei steht keine Pflegerin, keine Haushälterin, nichts.“ Er sieht hoch in die Linden, wo die Krähen sitzen. „Die Viecher sind auch erst seit ein paar Jahren so viele. Seit die Leute da im Ulmenweg wieder anfangen zu sterben.“';
      },
      'carsten,haeuser,neues,frisch,holzkreuz': function () {
        return '„Der Neue da vorne? Häuser.“ Er nickt zum frischen Grab. „Keiner zur Beerdigung, nur der Notar und eine alte Frau aus der Nachbarschaft. Den Lavendel im Senfglas hat aber keiner von beiden hingestellt. Ich hab’s zweimal weggeräumt.“';
      },
      'bernward,unfall,1905,architekt,postamt': function () {
        return '„Der Architekt. Vom Gerüst gefallen, beim Postamt in Hörde, sagen die Alten. Eine morsche Bohle.“ Er zuckt mit den Schultern. „Passiert. Damals ist dauernd einer vom Gerüst gefallen. Aber sie hat ihm den schönsten Stein auf dem ganzen Friedhof machen lassen.“';
      },
      'ostermann,teubner,hallmann,brzezinski,albers,vogt,ulmenweg,tote': function () {
        return '„Vom Ulmenweg liegen viele hier. Ostermanns, die Teubner, der Lehrer mit seiner Frau.“ Er rechnet nicht nach, er weiß es. „Komisch ist nur: Bei denen vom Ulmenweg wächst nichts an. Kein Grabgesteck hält länger als eine Woche. Nur der Lavendel bei den Grests.“';
      }
    },
    themaSonst: '„Da kann ich Ihnen nicht helfen. Ich kenn die Gräber, nicht die Leute.“'
  });

  // ===================================================================
  // HINWEIS
  // ===================================================================
  HG.hinweis('grabstein_grest', {
    titel: 'Das Grab der Grests', strang: 'B',
    text: 'Friedhof Kirchhörde: Auf dem Grabstein zwei Hände, die einander halten. Nur die schmale, mit sehr dünnen Fingern, trägt einen Ring – und jemand hält ihn blank. Im Sockel: „Bis unser Tag wiederkommt.“ Elisabeth hat das Grab im Februar 1930 selbst bezahlt, bis 2050.',
    stichworte: ['grab', 'grabstein', 'friedhof', 'haende', 'ring', 'inschrift']
  });
  // Dritte Quelle für „Der Ring ist der Anker“ (Spielbibel 8.7)
  /* Grabstein: Quelle für „Der Ring wartet“ (hinweise.js) */

})();
