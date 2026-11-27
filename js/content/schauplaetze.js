// Haus Grest – Inhalt: Schauplätze außerhalb des Hauses: Bauamt, Krankenhaus, Fahrziele Friedhof und Stadtarchiv.
// Eigene Dateien: lager-schmidt.js, polizeiwache.js, gerdes.js, altenheim.js, kolbe.js, stadtarchiv.js, friedhof.js.
// Fahrzeiten in Minuten (innerhalb Dortmunds 20–40, Unna ca. 35), Öffnungszeiten [Vorschlag].
// Freigeschaltet werden die Ziele über Hinweise (siehe hinweise.js und lager-schmidt.js).
(function () {

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

  // Polizeiwache: eigener Schauplatz in polizeiwache.js

  HG.ziel('friedhof', {
    name: 'Friedhof',
    woerter: ['friedhof', 'gottesacker', 'grab', 'graeber', 'gruft', 'grabstelle'],
    ankunft: 'friedhof', fahrzeit: 30, geoeffnet: { von: '07:00', bis: '20:00' },
    geschlossen: 'Nachts ist das Friedhofstor verschlossen (geöffnet 7–20 Uhr).'
  });
  // Friedhof: Räume in friedhof.js

  // Altenheim: eigener Schauplatz in altenheim.js

  HG.ziel('stadtarchiv', {
    name: 'Stadtarchiv',
    woerter: ['stadtarchiv', 'archiv'],
    ankunft: 'stadtarchiv', fahrzeit: 20, geoeffnet: AMT,
    geschlossen: 'Das Stadtarchiv hat jetzt geschlossen. Geöffnet ist werktags von 8 bis 16 Uhr.'
  });
  // Stadtarchiv: Lesesaal in stadtarchiv.js

  // Wohnung Gerdes: eigener Schauplatz in gerdes.js

})();
