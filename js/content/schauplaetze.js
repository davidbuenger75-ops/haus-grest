// Haus Grest – Inhalt: Schauplätze außerhalb des Hauses (Platzhalter)
// Jeder Schauplatz hat vorerst nur einen Raum. Lager Schmidt steht in lager-schmidt.js.
// Fahrzeiten in Minuten (innerhalb Dortmunds 20–40, Unna ca. 35), Öffnungszeiten [Vorschlag].
// Freigeschaltet werden die Ziele über Hinweise (siehe hinweise.js und lager-schmidt.js).
(function () {

  function platzhalter(text) {
    return text + ' <span class="nebenbei">(Platzhalter – dieser Schauplatz wird noch ausgebaut.)</span>';
  }
  var AMT = { von: '08:00', bis: '16:00', tage: 'werktags' };

  HG.ziel('bauamt', {
    name: 'Stadtverwaltung / Bauamt',
    woerter: ['bauamt', 'stadtverwaltung', 'verwaltung', 'rathaus', 'amt'],
    ankunft: 'bauamt', fahrzeit: 20, geoeffnet: AMT,
    geschlossen: 'Das Bauamt hat jetzt geschlossen. Geöffnet ist werktags von 8 bis 16 Uhr.'
  });
  HG.raum('bauamt', {
    name: 'Bauamt', schauplatz: 'bauamt', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: 'Ein Flur mit Linoleumboden und nummerierten Türen, es riecht nach Bohnerwachs und Kopierpapier. Hinter einem Tresen sortiert eine Sachbearbeiterin Akten. Irgendwo hier müsste es die Bauakte von Haus Grest geben.',
    vorschlaege: ['sprich mit sachbearbeiterin', 'frage sachbearbeiterin nach bauakte', 'frage sachbearbeiterin nach brand']
  });

  // Stadtverwaltung (David, 22.11.2026): Hier erfährt man vom Brand 1974 und vom Architekten,
  // der das Haus danach wiederhergestellt hat. Alles vor 1965 ist beim Rathausbrand verbrannt.
  // Namen der Sachbearbeiterin und Wortlaut [Vorschlag]; Hintergründe: Spielbibel 8.4.
  function bauakteHolen(api) {
    if (api.flag('bauakte_geholt')) return '„Die Akte liegt doch vor Ihnen“, sagt Frau Pohl und tippt auf den grauen Ordner. „Lesen dürfen Sie, mitnehmen nicht.“';
    api.setzeFlag('bauakte_geholt');
    api.bewege('bauakte', 'tresen', 'auf');
    return 'Frau Pohl tippt etwas in ihren Rechner, verschwindet hinter einem Regal und kommt mit einem grauen, erstaunlich dünnen Ordner zurück. „Ulmenweg zwölf. Viel ist da nicht drin.“ Sie legt ihn auf den Tresen. „Lesen dürfen Sie, mitnehmen nicht. Kopien kosten fünfzig Cent die Seite.“';
  }
  HG.ding('tresen', {
    nomen: 'Tresen', genus: 'm', woerter: ['tresen', 'theke', 'schalter'],
    ort: 'bauamt', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein Tresen aus hellem Holzimitat, abgegriffen, mit einer Klingel und einem Ständer voller Formulare.'
  });
  HG.ding('sachbearbeiterin', {
    nomen: 'Frau Pohl', genus: 'f', eigenname: true,
    woerter: ['sachbearbeiterin', 'pohl', 'frau', 'beamtin', 'angestellte'],
    ort: 'bauamt', person: true, szenerie: true,
    beschreibung: 'Eine Frau um die sechzig mit Lesebrille im Haar und einem Namensschild: „M. Pohl“. Sie sortiert Akten mit der Ruhe von jemandem, der schon alles gesehen hat.',
    gespraech: function () {
      return '„Guten Tag. Pohl, Bauordnung.“ Sie schiebt die Brille auf die Nase. „Worum geht’s? Bauakte, Bauantrag, Beschwerde über den Nachbarn?“ <span class="nebenbei">(„frage pohl nach …“)</span>';
    },
    themen: {
      'bauakte,akte,ulmenweg,haus,grest,villa,unterlagen': bauakteHolen,
      'rathausbrand,rathaus,1965,verbrannt,vernichtet,alt,aelter,frueher,vor': function () {
        return '„Alles vor 1965? Weg.“ Sie zuckt mit den Schultern. „Februar 65 hat das alte Rathaus gebrannt, der ganze Keller mit den Bauakten, Meldekarten, Sterbebüchern. Was davor war, kennt keiner mehr. Nur das Grundbuch nicht – das liegt beim Amtsgericht, das hat’s überstanden.“';
      },
      'grundbuch,eigentuemer,amtsgericht': function () {
        return '„Grundbuch macht das Amtsgericht, nicht wir. Da stehen aber nur Namen drin, wer wann Eigentümer war. Warum, wieso, woran gestorben – das steht da nicht.“';
      },
      'brand,feuer,1974,hallmann,feuerwehr': function (api) {
        if (!api.flag('bauakte_geholt')) return '„Brand? Am Ulmenweg?“ Sie runzelt die Stirn. „Da müsste ich in die Akte gucken.“ ' + bauakteHolen(api);
        return '„Steht alles da drin. Der Feuerwehrbericht ist als Abschrift beigeheftet.“ Sie zögert. „Komische Sache übrigens, mit dem Anruf. Das hat mir mein Vorgänger schon erzählt. Der Notruf kam aus dem Haus selbst, und der Mann war da schon oben.“';
      },
      'brinkhoff,architekt,reparatur,wiederaufbau,umbau': function (api) {
        if (!api.flag('bauakte_geholt')) return bauakteHolen(api);
        return '„Brinkhoff. Hat die Ruine damals gekauft und alles wieder hergerichtet, sehr ordentlich, nach den alten Zeichnungen. Der hatte einen Narren an dem Haus gefressen.“';
      }
    },
    themaSonst: '„Da kann ich Ihnen nicht helfen“, sagt Frau Pohl. „Ich bin Bauordnung.“'
  });
  HG.ding('bauakte', {
    dokument: true,   // mitnehmen darf man sie nicht – fotografieren schon
    nomen: 'Bauakte', genus: 'f', adj: ['grau'],
    woerter: ['bauakte', 'akte', 'ordner', 'brandbericht', 'bericht', 'bauantrag'],
    ort: null,   // legt Frau Pohl erst auf den Tresen, wenn man nach der Akte fragt
    fest: true, schriftart: 'druck', dauer: { lesen: 15 },
    beschreibung: 'Ein grauer Ordner, beschriftet „Ulmenweg 12 – Gemarkung Kirchhörde“. Erstaunlich dünn für ein Haus von 1900. Darin ein Vorblatt, eine Abschrift des Feuerwehrberichts von 1974 und ein Bauantrag von 1975.',
    foto: 'Auf dem Foto vom Brandbericht ist am Rand ein rußiger Fingerabdruck. Auf dem Papier ist keiner.',
    lesbar: '<b>Stadt Dortmund – Bauordnungsamt – Bauakte Ulmenweg 12</b><br><i>Vorblatt: Akte neu angelegt am 1.3.1965. Ältere Vorgänge beim Brand im Rathaus (Februar 1965) vernichtet.</i><br><br>' +
      '<b>4.11.1974 – Abschrift: Feuerwehr Dortmund, Einsatzbericht</b><br>Alarmierung 02:58 Uhr über Notruf. Anruferin weiblich, nannte keinen Namen; Anschluss laut Fernmeldeamt: Ulmenweg 12 (Brandobjekt). Zeitgleich Anrufe gleichen Inhalts bei drei Nachbarn („Es brennt bei Hallmanns“). Eintreffen 03:07 Uhr.<br>' +
      'Brand in Eingangshalle und Treppenhaus, Brandbeschleuniger (Benzin). Eigentümer Wolfgang Hallmann (46), Studienrat, im Obergeschoss tot aufgefunden, vor einer tapezierten Tür, die von innen verriegelt war. Todesursache: Rauchgasvergiftung. Brandstiftung durch den Eigentümer anzunehmen.<br>' +
      'Raum hinter der genannten Tür (Ankleidezimmer) ohne jeden Brandschaden, auch kein Rußniederschlag.<br><br>' +
      '<b>12.5.1975 – Bauantrag: Wiederherstellung nach Brandschaden</b><br>Bauherr und Entwurfsverfasser: Hans-Joachim Brinkhoff, Architekt (Eigentümer seit April 1975). Neue Treppe in Eiche nach den Originalzeichnungen, Erneuerung der Hallenvertäfelung, neue Elektroinstallation, Zentralheizung. Vermerk: „Ankleidezimmer OG: keine Maßnahmen erforderlich. Originalausstattung erhalten.“<br><br>' +
      '<b>2.9.1976 – Schlussabnahme</b> ohne Beanstandungen.',
    hinweis: 'architekt_brinkhoff', hinweisBei: 'lesen',
    bei: {
      lesen: function (api) { api.hinweis('hallmann_brand'); return false; },
      nehmen: function (api) { api.sage('„Die bleibt hier“, sagt Frau Pohl, ohne aufzusehen. „Kopien kosten fünfzig Cent.“'); return true; }
    }
  });

  // Krankenhaus: volle Heilung, kostet einen ganzen Tag (Spielbibel, Abschnitt 6) [Vorschlag: Klinikum Nord]
  HG.ziel('krankenhaus', {
    name: 'Krankenhaus',
    woerter: ['krankenhaus', 'klinik', 'klinikum', 'notaufnahme', 'arzt', 'hospital'],
    ankunft: 'krankenhaus', fahrzeit: 20
  });
  HG.raum('krankenhaus', {
    name: 'Notaufnahme', schauplatz: 'krankenhaus', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: 'Neonlicht, Plastikstühle, ein Getränkeautomat, der leise brummt. Hinter einer Glasscheibe sitzt eine Pflegekraft am Empfang. <span class="nebenbei">(„lass dich behandeln“)</span>',
    vorschlaege: ['lass dich behandeln', 'fahre los'],
    bei: {
      behandeln: function (api) { return behandeln(api); },
      warten: function (api) { return behandeln(api); }
    }
  });
  function behandeln(api) {
    var z = HG.zustand.z;
    if (z.werte.lp >= z.max.lp && !(z.wunden || []).some(function (w) { return !w.versorgt; })) {
      api.sage('„Ihnen fehlt nichts“, sagt die Pflegekraft nach einem kurzen Blick. „Außer Schlaf vielleicht.“'); return true;
    }
    api.sage('Du wartest. Und wartest. Irgendwann wirst du aufgerufen, genäht, verbunden, geröntgt und mit einer Packung Schmerztabletten wieder entlassen. Als du hinausgehst, ist ein ganzer Tag vergangen.');
    api.zeitVergeht(24 * 60);
    api.vollHeilen('Krankenhaus');
    return true;
  }

  HG.ziel('polizei', {
    name: 'Polizeiwache',
    woerter: ['polizei', 'polizeiwache', 'wache', 'revier', 'kommissariat'],
    ankunft: 'polizei', fahrzeit: 25
  });
  HG.raum('polizei', {
    name: 'Polizeiwache', schauplatz: 'polizei', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: { tag: platzhalter('Ein Wartebereich mit Plastikstühlen, ein Tresen hinter Panzerglas. Hier wurden die Todesfälle im Ulmenweg 12 untersucht.'),
      nacht: platzhalter('Die Wache ist auch nachts besetzt. Ein müder Beamter blickt hinter dem Panzerglas auf.') },
    // Ablenkung des Hauses: der Anruf von „Hauptkommissar Brenner“ war gefälscht [Vorschlag]
    beimBetreten: function (api) {
      if (api.flag('ablenkung_polizei') && !api.flag('ablenkung_polizei_geklaert')) {
        api.setzeFlag('ablenkung_polizei_geklaert');
        api.sage('Du nennst am Tresen deinen Namen und fragst nach Hauptkommissar Brenner. Die Beamtin hinter dem Panzerglas sieht in ihren Rechner, dann telefoniert sie kurz. „Einen Brenner gibt es bei uns nicht. Und hinbestellt hat Sie auch keiner.“ Sie mustert dich. „Ulmenweg zwölf? … Da sind Sie nicht der Erste, der so einen Anruf bekommt.“');
        api.hinweis('falscher_anruf_polizei');
      }
    }
  });

  HG.ziel('friedhof', {
    name: 'Friedhof',
    woerter: ['friedhof', 'gottesacker', 'grab', 'graeber', 'gruft', 'grabstelle'],
    ankunft: 'friedhof', fahrzeit: 30, geoeffnet: { von: '07:00', bis: '20:00' },
    geschlossen: 'Nachts ist das Friedhofstor verschlossen (geöffnet 7–20 Uhr).'
  });
  HG.raum('friedhof', {
    name: 'Friedhof', schauplatz: 'friedhof', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: { tag: platzhalter('Alte Linden, schiefe Grabsteine, Moos auf den Wegen. Im älteren Teil liegen die Gräber aus der Zeit um 1900 – irgendwo hier die Grabstelle Grest.'),
      abend: platzhalter('Im Abendlicht werfen die Grabsteine lange Schatten. Der Friedhofswärter klappert schon mit den Schlüsseln.') }
  });

  HG.ziel('altenheim', {
    name: 'Altenheim',
    woerter: ['altenheim', 'seniorenheim', 'pflegeheim', 'altersheim'],
    ankunft: 'altenheim', fahrzeit: 30, geoeffnet: { von: '09:00', bis: '19:00' },
    geschlossen: 'Die Besuchszeit ist vorbei (9–19 Uhr).'
  });
  HG.raum('altenheim', {
    name: 'Altenheim', schauplatz: 'altenheim', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: platzhalter('Ein heller Aufenthaltsraum, es riecht nach Kamillentee und Desinfektionsmittel. In den Sesseln dösen alte Menschen vor einem leisen Fernseher.')
  });

  HG.ziel('stadtarchiv', {
    name: 'Stadtarchiv',
    woerter: ['stadtarchiv', 'archiv'],
    ankunft: 'stadtarchiv', fahrzeit: 20, geoeffnet: AMT,
    geschlossen: 'Das Stadtarchiv hat jetzt geschlossen. Geöffnet ist werktags von 8 bis 16 Uhr.'
  });
  HG.raum('stadtarchiv', {
    name: 'Stadtarchiv', schauplatz: 'stadtarchiv', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: platzhalter('Ein Lesesaal unter einer Glaskuppel. Grüne Leselampen, Karteikästen, das Rascheln von Papier. Ein Archivar mustert dich über seine Brille hinweg.')
  });

  // [Vorschlag] neuer Schauplatz aus Carstens Karton „GERDES“
  HG.ziel('gerdes', {
    name: 'Wohnung Gerdes (Unna)',
    woerter: ['gerdes', 'unna', 'brigitte'],
    ankunft: 'gerdes', fahrzeit: 35
  });
  HG.raum('gerdes', {
    name: 'Vor der Wohnung Gerdes', schauplatz: 'gerdes', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: platzhalter('Ein Mehrfamilienhaus aus den Siebzigern in Unna, Waschbeton und Geranienkästen. Im Erdgeschoss steht eine Wohnungstür einen Spalt offen, die Kette vorgelegt. Dahinter: Brigitte Gerdes.'),
    beimBetreten: function (api, info) {
      if (info.erstesMal) api.sage('Du hast kaum geklingelt, da geht die Tür einen Spalt auf. Eine Frau um die fünfzig, die Kette vorgelegt. „Sie kommen wegen dem Haus“, sagt sie. Es ist keine Frage. <span class="nebenbei">(„sprich mit brigitte“)</span>');
    },
    vorschlaege: ['sprich mit brigitte', 'frage brigitte nach bettina', 'frage brigitte nach dem haus']
  });

  // [Vorschlag] Brigitte Gerdes – vorerst nur ein kurzer Auftritt, der zum Altenheim führt
  // (David: „Das Altenheim schaltet Brigitte Gerdes frei“).
  function brigitteAltenheim(api) {
    api.hinweis('brigitte_altenheim');
    return 'Brigitte sieht an dir vorbei ins Treppenhaus. „Ich rede nicht über das Haus. Peter auch nicht, der ist weg, Portugal.“ Eine lange Pause. ' +
      '„Aber wenn Sie wirklich wissen wollen, was da los ist – fahren Sie ins Altenheim. Ich sag Ihnen nicht, zu wem. Sie werden’s merken.“ Dann schließt sie die Tür.';
  }
  HG.ding('brigitte', {
    nomen: 'Brigitte Gerdes', genus: 'f', eigenname: true,
    woerter: ['brigitte', 'gerdes', 'frau', 'mutter'],
    ort: 'gerdes', person: true, szenerie: true,
    beschreibung: 'Brigitte Gerdes, um die fünfzig, graues Haar, das sie lange nicht geschnitten hat. Sie hält die Tür mit einer Hand fest, als könnte jemand hereinwollen, den sie nicht sieht.',
    gespraech: brigitteAltenheim,
    themen: {
      'bettina,tochter,maedchen': function (api) {
        return '„Nicht.“ Ihre Stimme bricht nicht, sie wird nur sehr leise. „Nicht Bettinas Namen. Nicht hier.“ ' + brigitteAltenheim(api);
      },
      'haus,ulmenweg,spiegel,spiegelzimmer,carsten,altenheim': brigitteAltenheim
    },
    themaSonst: brigitteAltenheim
  });

})();
