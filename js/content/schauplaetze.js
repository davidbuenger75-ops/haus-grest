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
    beschreibung: platzhalter('Ein Flur mit Linoleumboden und nummerierten Türen. Hinter einem Tresen sortiert eine Sachbearbeiterin Akten. Irgendwo hier müsste es die Bauakte von Haus Grest geben.')
  });

  HG.ziel('polizei', {
    name: 'Polizeiwache',
    woerter: ['polizei', 'polizeiwache', 'wache', 'revier', 'kommissariat'],
    ankunft: 'polizei', fahrzeit: 25
  });
  HG.raum('polizei', {
    name: 'Polizeiwache', schauplatz: 'polizei', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: { tag: platzhalter('Ein Wartebereich mit Plastikstühlen, ein Tresen hinter Panzerglas. Hier wurden die Todesfälle im Ulmenweg 12 untersucht.'),
      nacht: platzhalter('Die Wache ist auch nachts besetzt. Ein müder Beamter blickt hinter dem Panzerglas auf.') }
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
