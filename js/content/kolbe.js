// Haus Grest – Inhalt: FRAU KOLBE, Nachbarhaus Ulmenweg 10 (Akt 2)
// Spielbibel 5e. Von David (27.11.2026): um die 80, ängstlich und abergläubisch, überzeugt, dass das Haus böse ist;
// tagsüber macht sie auf, beim Thema Haus wird sie verschlossen und muss überzeugt werden.
// Name „Karin“, Wortlaut und Ablauf [Vorschlag von Claude, 27.11.2026].
//
// Räume:  kolbe (vor ihrer Haustür, zu Fuß von der Einfahrt nach Westen)  –hinein→  kolbe_kueche
// Ablauf: Kleinkram erzählt sie gern. Fragt man nach dem Haus, wird sie still → Spielbuch-Auswahl zum Überzeugen:
//           Kopf      – ihr eigener Kommentar unter Nataschas Artikel (Singen) oder Renates Notenheft („Sie singt vor“)
//           Anker     – Hallmanns Taschenuhr zeigen
//           Fertigkeit – Überreden (misslungen: heute nicht mehr; die Kopf-Wege bleiben offen)
// Danach: Renate (kolbe_renate → Seele Renate) und Hallmann 1974 (kolbe_hallmann → Seele Hallmann).
(function () {

  var OFFEN = { von: '08:00', bis: '18:00' };

  function vertraut(api) { return !!api.flag('kolbe_vertraut'); }
  function imHaus(api) { return api.flag('kolbe_drin') || api.raum() === 'kolbe_kueche'; }

  // ===================================================================
  // VOR DEM HAUS KOLBE
  // ===================================================================
  HG.raum('kolbe', {
    name: 'Vor dem Haus Kolbe', woerter: ['nachbarhaus', 'vorgarten', 'haustuer', 'kolbe'],
    schauplatz: 'kolbe', karte: { x: 0, y: 0 },
    beschreibung: function (api) {
      var t = 'Ein kleines Siedlungshaus aus den Fünfzigern, weiß verputzt, mit Geranienkästen und einem akkurat geschnittenen Vorgarten. Über der Haustür ist ein rostiges Hufeisen angenagelt, die Öffnung nach oben. ' +
        'Alle Rollläden auf der Seite zu Haus Grest sind heruntergelassen. ';
      if (!api.istOffen(OFFEN)) return t + 'Im Haus ist es dunkel. Nur hinter der Milchglasscheibe der Tür brennt ein schwaches Nachtlicht. Im Osten, hinter der Ligusterhecke, liegt Haus Grest.';
      return t + 'An der Klingel steht „Kolbe“. Im Osten, hinter der Ligusterhecke, liegt Haus Grest.';
    },
    kurz: 'Vor dem Haus Kolbe: Hufeisen über der Tür, die Rollläden zum Haus Grest unten. Osten: zurück zum Haus Grest.',
    riechen: 'Frisch gemähtes Gras, Bohnerwachs, ein Hauch Kaffee durch den Türspalt.',
    horchen: { tag: 'Ein Radio, leise, irgendwo drinnen. Schlager.', nacht: 'Hinter der Tür tickt eine Uhr. Sonst nichts.' },
    ausgaenge: {
      osten: 'einfahrt',
      hinein: { ziel: 'kolbe_kueche', sperre: function (api) {
        if (!api.istOffen(OFFEN)) return 'Du klingelst. Drinnen geht kein Licht an. Hinter der Milchglasscheibe bewegt sich ein Schatten – und bleibt stehen. Frau Kolbe macht im Dunkeln nicht auf, schon gar nicht für jemanden, der von dort drüben kommt. <span class="nebenbei">(Sie öffnet tagsüber, etwa von 8 bis 18 Uhr.)</span>';
        return null;
      } }
    },
    beimBetreten: function (api, info) {
      if (info.erstesMal && api.istOffen(OFFEN)) api.sage('Bevor du klingeln kannst, geht die Tür auf. Eine kleine alte Frau mit Kittelschürze sieht dich an, dann an dir vorbei zur Hecke. „Sie sind der neue Erbe“, sagt sie. „Kommen Sie rein. Schnell.“'.replace('der neue Erbe', api.g('der neue Erbe', 'die neue Erbin', 'die neue Erbin')) + ' <span class="nebenbei">(„geh hinein“)</span>');
    },
    vorschlaege: function (api) { return api.istOffen(OFFEN) ? ['geh hinein', 'geh nach osten'] : ['geh nach osten']; },
    details: [
      { nomen: 'Hufeisen', genus: 'n', woerter: ['hufeisen', 'eisen'], text: 'Ein altes Hufeisen, rostig, mit vier krummen Nägeln über der Tür befestigt – die Öffnung nach oben, „damit das Glück nicht rausfällt“. Daneben, mit Kreide auf den Türsturz geschrieben und halb verwaschen: <i>20 * C + M + B * 26</i>.' },
      { nomen: 'Rollläden', genus: 'pl', woerter: ['rolllaeden', 'rollladen', 'rolladen', 'fenster', 'jalousien'], text: 'Auf der Ostseite, zu Haus Grest hin, sind alle Rollläden unten. Nicht halb, ganz. Auf der anderen Seite stehen sie offen, mit Geranien davor.' },
      { nomen: 'Klingel', genus: 'f', woerter: ['klingel', 'schild', 'namensschild', 'briefkasten'], text: 'Ein Messingschild: „H. + K. Kolbe“. Das „H.“ ist mit einem Streifen Klebeband überklebt, schon lange.' },
      { nomen: 'Ligusterhecke', genus: 'f', woerter: ['hecke', 'liguster', 'ligusterhecke', 'grenze'], text: 'Eine hohe Ligusterhecke zwischen den Grundstücken. Auf Frau Kolbes Seite ist sie dicht und gepflegt. Auf der anderen Seite, zu Haus Grest hin, sind die Blätter grau.' }
    ]
  });

  // Die Einfahrt von Haus Grest bekommt den Weg zum Nachbarhaus.
  (function () {
    var e = HG.daten.raeume.einfahrt;
    e.ausgaenge.westen = 'kolbe';
    HG.ding('einfahrt_nachbarhaus', { nomen: 'Nachbarhaus', genus: 'n', woerter: ['nachbarhaus', 'nachbarin', 'kolbe', 'nachbarn', 'hecke', 'siedlungshaus'],
      ort: 'einfahrt', fest: true, szenerie: true,
      beschreibung: 'Hinter der Ligusterhecke im Westen ein kleines weißes Siedlungshaus mit Geranien. Alle Fenster, die hierher zeigen, haben die Rollläden unten. Hin kommst du zu Fuß: „geh nach westen“.' });
  })();

  // ===================================================================
  // KÜCHE
  // ===================================================================
  HG.raum('kolbe_kueche', {
    name: 'Küche bei Frau Kolbe', woerter: ['kueche', 'wohnkueche'],
    schauplatz: 'kolbe', karte: { x: 0, y: -1 },
    beschreibung: function (api) {
      return 'Eine Wohnküche, in der seit 1975 nichts verändert wurde: orangefarbene Schranktüren, eine Eckbank mit karierten Kissen, eine Wachstuchdecke mit Kirschen. Auf dem Tisch eine Kanne Kaffee und ein Teller Spritzgebäck. ' +
        'An der Wand ein Kruzifix mit einem vertrockneten Palmzweig, auf der Fensterbank ein Schälchen mit grobem Salz. Das Fenster zum Haus Grest ist mit einem Rollladen verschlossen, obwohl es Tag ist; eine Neonröhre summt darüber. ' +
        'Auf der Eckbank liegt ein dicker grauer Kater. Hinaus geht es zur Haustür.';
    },
    kurz: 'Frau Kolbes Küche: Eckbank, Kaffee, Kruzifix, Salz auf der Fensterbank, der Rollladen zum Haus Grest unten.',
    riechen: 'Filterkaffee, Spritzgebäck, Kölnisch Wasser. Und, schwach, Mottenkugeln.',
    horchen: 'Die Neonröhre summt. Eine Küchenuhr tickt. Der Kater schnurrt, bis er dich ansieht – dann hört er auf.',
    ausgaenge: { hinaus: 'kolbe' },
    vorBetreten: function (api) { api.bewege('frau_kolbe', 'kolbe_kueche'); },
    beimBetreten: function (api, info) {
      api.setzeFlag('kolbe_drin');
      if (!info.erstesMal) { api.sage('Frau Kolbe schenkt dir Kaffee nach, ohne zu fragen.'); return; }
      var t = 'Frau Kolbe schiebt dich in die Küche, schließt die Haustür und legt den Riegel vor. Erst dann atmet sie aus. „Kaffee?“ Sie gießt ein, bevor du antworten kannst. „Ich hab Sie gesehen, wie Sie da reingegangen sind. Ich hab gebetet, dass Sie wieder rauskommen.“';
      if (HG.zustand.z.besucht.halle) {
        t += '<br><br>Als sie dir die Tasse hinstellt, hält sie inne. Sie schnuppert, kaum merklich, und tritt einen Schritt zurück. „Lavendel“, sagt sie leise. „Sie riechen schon danach.“ Sie bekreuzigt sich, schnell, als wäre es ihr peinlich.';
      }
      api.sage(t + ' <span class="nebenbei">(„sprich mit frau kolbe“)</span>');
    },
    vorschlaege: function (api) {
      var v = [];
      if (!vertraut(api)) {
        v.push('frage frau kolbe nach dem haus');
        if (api.traegt('taschenuhr')) v.push('zeige frau kolbe die taschenuhr');
      } else {
        if (!api.hatHinweis('kolbe_renate')) v.push('frage frau kolbe nach renate');
        if (!api.hatHinweis('kolbe_hallmann')) v.push('frage frau kolbe nach hallmann');
        v.push('frage frau kolbe nach carsten');
      }
      return v.concat(['geh hinaus']);
    },
    details: [
      { nomen: 'Salzschälchen', genus: 'n', woerter: ['salz', 'schaelchen', 'salzschaelchen', 'schale', 'fensterbank'], text: 'Eine Untertasse voll grobem Salz, grau vom Staub. „Das wechsel ich jeden Monat“, sagt Frau Kolbe, ohne dass du gefragt hast. „Bei Neumond. Meine Mutter hat das auch so gemacht.“' },
      { nomen: 'Kruzifix', genus: 'n', woerter: ['kruzifix', 'kreuz', 'palmzweig', 'palmzweige'], text: 'Ein Holzkreuz mit einem vertrockneten Buchsbaumzweig vom Palmsonntag. Es hängt genau an der Wand, die zum Haus Grest zeigt.' },
      { nomen: 'Kater', genus: 'm', woerter: ['kater', 'katze', 'moritz', 'tier'], text: 'Ein grauer, sehr dicker Kater. „Moritz“, sagt Frau Kolbe. „Der geht nicht über die Hecke. Nie. Der Vorige ist rübergegangen.“ Sie sagt nicht, was mit dem Vorigen war.',
        bei: { tasten: function (api) { api.sage('Moritz lässt sich kurz streicheln, dann schnuppert er an deinem Ärmel, legt die Ohren an und springt von der Bank.'); return true; } } },
      { nomen: 'Rollladen', genus: 'm', woerter: ['rollladen', 'rolladen', 'fenster', 'rolllaeden'], text: 'Das Küchenfenster zeigt zum Haus Grest. Der Rollladen ist ganz unten, die Ritzen sind von innen mit Malerkrepp zugeklebt.',
        bei: { oeffnen: function (api) { api.sage('„Nicht!“ Frau Kolbe ist schneller am Gurt als du. „Der bleibt zu. Ich will das Haus nicht sehen. Und ich will nicht, dass es mich sieht.“'); return true; } } },
      { nomen: 'Kaffee', genus: 'm', woerter: ['kaffee', 'tasse', 'kanne', 'spritzgebaeck', 'gebaeck', 'kekse', 'teller'], text: 'Filterkaffee, sehr stark, in einer Tasse mit Goldrand. Das Spritzgebäck ist selbst gemacht und ein bisschen zu hart.',
        bei: { essen: function (api) { api.sage('Du nimmst ein Spritzgebäck. Frau Kolbe nickt zufrieden. „Essen Sie. Sie sind ganz blass. Die da drüben sind alle so blass geworden.“'); return true; },
          trinken: function (api) { api.sage('Der Kaffee ist stark genug, um einen Löffel darin stehen zu lassen. Er tut gut.'); return true; } } },
      { nomen: 'Eckbank', genus: 'f', woerter: ['eckbank', 'bank', 'kissen', 'tisch', 'wachstuch', 'wachstuchdecke'], text: 'Eine Eckbank mit karierten Kissen. Auf dem Tisch eine Wachstuchdecke mit Kirschen, an einer Stelle hat sie ein Brandloch von einer Zigarette, die hier lange keiner mehr geraucht hat.' }
    ]
  });

  // ===================================================================
  // ÜBERZEUGEN
  // ===================================================================
  var TIPPS = {
    2: 'Frau Kolbe hat Angst, für verrückt gehalten zu werden. Sie redet erst, wenn sie merkt, dass du ihr glaubst – oder etwas mitbringst, das sie kennt.',
    3: function (api) {
      var t = [];
      if (api.hatHinweis('natascha_romanow')) t.push('Sie hat unter Nataschas Artikel einen Kommentar geschrieben. Sprich sie darauf an. <span class="nebenbei">(„frage frau kolbe nach dem haus“, dann die passende Antwort)</span>');
      else t.push('Unter dem Online-Artikel über Natascha Romanow (Lager Schmidt, Karton ROMANOW) steht ein Kommentar von „K. Kolbe“.');
      if (api.hatHinweis('renate_vogt')) t.push('Oder erzähl ihr, was in Renate Vogts Notenheft steht.');
      t.push(api.traegt('taschenuhr') ? 'Oder zeig ihr Hallmanns Taschenuhr. <span class="nebenbei">(„zeige frau kolbe die taschenuhr“)</span>'
        : 'Hallmanns Taschenuhr (Dachboden) würde sie wiedererkennen.');
      return t.join(' ');
    }
  };

  function oeffnetSich(api, text) {
    api.setzeFlag('kolbe_vertraut');
    api.fehlversucheVergessen('kolbe');
    api.sage(text);
    api.abschnitt(55, 'Frau Kolbe setzt sich. Sie faltet die Hände auf der Wachstuchdecke, als wolle sie beten, und tut es dann doch nicht. „Ich wohne hier seit 1970“, sagt sie. „Ich hab sie alle kommen sehen. Und ich hab sie alle rausgetragen sehen.“ Sie sieht auf den heruntergelassenen Rollladen. „Fragen Sie. Aber sagen Sie hinterher nicht, ich hätte Sie nicht gewarnt.“ <span class="nebenbei">(„frage frau kolbe nach …“ – Renate, Hallmann, Carsten, Natascha, Bettina)</span>');
  }

  function verschlossen(api) {
    if (vertraut(api)) return false;
    var heuteAbgewiesen = api.flag('kolbe_abgewiesen') === api.tag();
    var optionen = [
      { text: '„Ich will nur wissen, was in dem Haus los ist.“', tu: function () {
        api.sage('„Nichts ist da los.“ Sie steht auf und spült eine Tasse, die schon sauber ist. „Ein altes Haus. Da knackt es eben. Trinken Sie Ihren Kaffee.“');
        api.fehlversuch('kolbe', TIPPS);
      } }
    ];
    if (api.hatHinweis('natascha_romanow')) optionen.push({ text: '„Sie haben unter Nataschas Artikel geschrieben, dass sie nachts oben jemanden singen hörte. Ich höre es auch.“', tu: function () {
      oeffnetSich(api, 'Frau Kolbe hält mitten in der Bewegung inne. „Das haben Sie gelesen.“ Ihre Stimme ist ganz dünn. „Meine Enkelin hat mir gezeigt, wie man das schreibt, im Internet. Alle haben gedacht, ich bin eine verrückte Alte.“ Sie sieht dich lange an. „Sie hören es auch.“ Es ist keine Frage.');
    } });
    if (api.hatHinweis('renate_vogt')) optionen.push({ text: '„In Renate Vogts Notenheft steht: ‚Sie singt nicht mit. Sie singt vor.‘“', tu: function () {
      oeffnetSich(api, 'Die Kaffeekanne in Frau Kolbes Hand klirrt gegen die Tasse. Sie stellt sie ab, sehr vorsichtig. „Das hat sie zu mir auch gesagt“, flüstert sie. „Genau so. Renate.“ Sie bekreuzigt sich, und diesmal schämt sie sich nicht dafür.');
    } });
    if (!heuteAbgewiesen) optionen.push({ text: '„Bitte. Ich wohne jetzt da drüben, und ich habe niemanden sonst, der es mir sagen kann.“', tu: function () {
      var e = api.probe('ueberreden', { grund: 'Frau Kolbe zum Reden bringen' });
      if (e.erfolg) {
        oeffnetSich(api, 'Du sagst nichts vom Spuk. Du sagst, dass du nachts nicht schläfst, dass du nicht weißt, ob du dir alles nur einbildest. Frau Kolbe hört zu und nickt bei jedem Satz ein bisschen mehr. „Nein“, sagt sie schließlich. „Sie bilden sich nichts ein.“');
        return;
      }
      api.setzeFlag('kolbe_abgewiesen', api.tag());
      api.sage('„Dann ziehen Sie aus. Verkaufen Sie, verschenken Sie’s, lassen Sie’s verfallen.“ Sie schiebt dir den Teller mit dem Spritzgebäck hin, als wäre damit alles gesagt. „Mehr hab ich dazu nicht. Heute nicht.“');
      api.fehlversuch('kolbe', TIPPS);
    } });
    if (heuteAbgewiesen) api.sage('Frau Kolbe presst die Lippen zusammen. „Ich hab gesagt, heute nicht.“ Aber sie steht nicht auf.');
    else api.sage('Bei dem Wort „Haus“ wird Frau Kolbe still. Sie rührt in ihrem Kaffee, obwohl kein Zucker darin ist, und sieht zum Kruzifix.');
    api.auswahl('Was sagst du?', optionen);
    return true;
  }

  function uhrZeigen(api) {
    if (!api.traegt('taschenuhr')) return false;
    if (vertraut(api)) {
      api.sage('Frau Kolbe streicht über den Sprungdeckel. „Halten Sie die gut fest“, sagt sie. „Er hat sie nie aus der Hand gelegt. Nicht mal beim Rasenmähen.“');
      return true;
    }
    oeffnetSich(api, 'Du legst die silberne Taschenuhr auf die Wachstuchdecke. Frau Kolbe wird grau im Gesicht. Sie berührt sie nicht. „Das ist Wolfgangs Uhr. Von Irmgard, zur Hochzeit.“ Sie zeigt auf die Zeiger. „Zwei Uhr achtundfünfzig. Um die Zeit hat bei uns das Telefon geklingelt, in der Nacht. Ich hab fünfzig Jahre auf diese Zeiger gewartet.“');
    return true;
  }

  // ===================================================================
  // WAS SIE ERZÄHLT (erst, wenn sie Vertrauen hat)
  // ===================================================================
  function nurVertraut(fn) {
    return function (api) {
      if (!vertraut(api)) return verschlossen(api);
      return fn(api);
    };
  }

  var renate = nurVertraut(function (api) {
    if (api.hatHinweis('kolbe_renate')) return '„Ich hab Ihnen alles von Renate erzählt.“ Sie sieht auf ihre Hände. „Ich hätte sie in dem Sommer nicht allein lassen sollen. Das denk ich jeden Tag.“';
    api.abschnitt(56, '„Renate.“ Frau Kolbe lächelt zum ersten Mal, ganz kurz. „Meine Tochter hatte bei ihr Klavierstunde, jeden Dienstag, zehn Jahre lang. Eine feine Frau. Witwe, wie ich. Wir haben manchmal hier gesessen, genau da, wo Sie sitzen.“<br><br>' +
      '„Im letzten Sommer ist sie dünn geworden. Hat gesagt, sie singt jetzt abends. Allein, oben. Ich hab gefragt, warum sie nicht unten am Flügel singt, und da hat sie mich angesehen, als hätte ich was Dummes gesagt. ‚Weil sie mir vorsingt, Karin. Oben. Und ich muss nachsingen.‘“<br><br>' +
      '„Und dann: ‚Wenn ich richtig nachsinge, darf ich bleiben.‘“ Frau Kolbe drückt den Daumen auf einen Krümel auf der Wachstuchdecke. „Im Oktober haben sie sie aus der Badewanne geholt. Das Wasser war noch warm. Und die Kinder im Haus gegenüber haben gesagt, oben hat bis zum Morgen jemand gesungen. Eine Stimme. Nicht zwei.“');
    api.hinweis('kolbe_renate');
    return true;
  });

  var hallmann = nurVertraut(function (api) {
    if (api.hatHinweis('kolbe_hallmann')) return '„Wolfgang hat gewusst, dass sie es nicht ist. Das ist das Schlimmste. Er hat’s gewusst.“';
    api.abschnitt(57, '„Wolfgang Hallmann. Studienrat, Latein und Physik.“ Sie sagt es wie einen Grabspruch. „Nach Irmgards Tod hat er angefangen zu messen. Thermometer, Uhren, Hefte. Er hat gesagt, wenn man es messen kann, ist es nicht verrückt.“<br><br>' +
      '„Im Herbst 74 stand er hier am Zaun, morgens um sieben, unrasiert. ‚Irmgard ruft mich nachts an, Karin. Ich weiß, dass sie es nicht ist. Ich weiß es. Und ich geh trotzdem ran.‘“<br><br>' +
      'Frau Kolbe sieht zum Telefon an der Wand, einem alten grauen Wählscheibenapparat. „In der Nacht zum vierten November hat es hier geklingelt. Kurz vor drei. Mein Mann hat abgenommen und gleich wieder an mich weitergegeben, weil er gedacht hat, es ist eine Freundin von mir. Eine Frau. ‚Es brennt bei Hallmanns‘, hat sie gesagt. Ganz ruhig.“<br><br>' +
      '„Das war Irmgards Stimme. Ich hab mit Irmgard zwanzig Jahre lang über den Zaun geredet, ich kenn die Stimme. Und Irmgard war da seit zwei Jahren tot.“');
    api.hinweis('kolbe_hallmann');
    return true;
  });

  var carsten = nurVertraut(function (api) {
    return '„Herr Häuser.“ Sie seufzt. „Ein netter Mann. Am Anfang hat er mir den Rasen gemäht, weil mein Knie nicht mehr will. Dann nicht mehr. Dann hat er nicht mehr gegrüßt. Und im Oktober hat oben wieder jemand gesungen, nachts um drei, und bei ihm ging keiner mehr ans Telefon.“ Sie sieht dich an. ' +
      '„Ich hab die Feuerwehr gerufen. Nicht die Polizei. Bei dem Haus ruft man die Feuerwehr, das hab ich 1974 gelernt. Die kommen schneller, und die brechen Türen auf.“';
  });

  var natascha = nurVertraut(function (api) {
    return '„Die Natascha hat das Haus geliebt. Sie hat jeden Tag geschliffen und gestrichen. Eine Woche vorher hat sie mir gesagt, oben singt jemand, und dass es schön klingt. Schön!“ Frau Kolbe schüttelt den Kopf. „Ich hab ihr Salz gegeben. Für die Türschwellen. Sie hat gelacht. Und dann hat sie mit dem Staubsauger die Treppe gemacht.“';
  });

  var gerdes = nurVertraut(function (api) {
    return '„Die Bettina hat manchmal hier Hausaufgaben gemacht, wenn sie nicht rüber wollte. Hat nie gesagt, warum. Nur einmal: ‚Bei Ihnen ist es so leise, Frau Kolbe. Bei uns redet immer wer.‘“ Sie schluckt. „Die Mutter hat mich nach der Beerdigung nicht mehr angesehen. Ich glaub, sie denkt, ich hätte was sagen müssen. Hab ich auch. Ich hab’s nicht getan.“';
  });

  var haus = nurVertraut(function (api) {
    return '„Das Haus ist böse.“ Sie sagt es ganz sachlich, wie man sagt, dass es regnet. „Nicht verflucht, nicht verhext – böse. Es will was. Es nimmt sich die Leute, einen nach dem anderen. Und die, die es genommen hat, bleiben drin. Ich hör sie manchmal. Den Wolfgang, die Renate. Das Mädchen.“ ' +
      '<span class="nebenbei">(„frage frau kolbe nach …“ – Renate, Hallmann, Carsten, Natascha, Bettina, Spiegel)</span>';
  });

  var aberglaube = nurVertraut(function (api) {
    return '„Wenn einer stirbt, hängt man die Spiegel zu. Damit die Seele nicht drin hängen bleibt. Das weiß doch jeder.“ Sie zeigt mit dem Kinn zur Hecke. „Bei Grests hat 1930 keiner zugehängt. Die Pflegerin war ja weg, und der Arzt kam aus der Stadt.“ ' +
      'Dann, leiser: „Und Salz auf die Schwelle. Da geht nichts drüber, was nicht laufen kann wie wir.“';
  });

  var frueher = nurVertraut(function (api) {
    return '„Das war vor meiner Zeit. Aber meine Schwiegermutter hat hier schon gewohnt. Die hat erzählt, der Steiger – Brzezinski – hat in einer Nacht alle Spiegel da drüben zerschlagen, man hat es bis hier klirren hören. Und am Morgen, als sie ihn rausgetragen haben, waren die Spiegel wieder heil. Alle.“ Sie bekreuzigt sich. „Die Grest selbst, sagt sie, hat nach dem Tod noch gelächelt. Im Sarg. Die Leute sind reihenweise rausgegangen.“';
  });

  var brinkhoff = nurVertraut(function (api) {
    return '„Der Architekt. Der hat da gewohnt wie in einer Kirche. Hat jeden Tag gemessen und gezeichnet, und nachts hat bei ihm Licht gebrannt, oben, in einem Fenster, das es gar nicht gibt. Das hab ich meinem Mann gezeigt. Am nächsten Morgen war da Wand.“';
  });

  HG.ding('frau_kolbe', {
    nomen: 'Frau Kolbe', genus: 'f', eigenname: true,
    woerter: ['kolbe', 'karin', 'frau', 'nachbarin', 'alte', 'oma'],
    ort: 'kolbe_kueche', person: true, szenerie: true,
    beschreibung: 'Frau Kolbe, fast achtzig, klein und rundlich, in einer geblümten Kittelschürze. Um den Hals trägt sie ein goldenes Kreuz an einer dünnen Kette, das sie immer wieder zwischen die Finger nimmt. Sie sitzt so, dass sie das Fenster zum Haus Grest nicht im Rücken hat.',
    gespraech: function (api) {
      return vertraut(api)
        ? '„Fragen Sie ruhig.“ Sie zieht ihre Kittelschürze glatt. <span class="nebenbei">(„frage frau kolbe nach …“ – Renate, Hallmann, Carsten, Natascha, Bettina, Spiegel)</span>'
        : '„Nehmen Sie sich Gebäck.“ Frau Kolbe erzählt dir von ihrem Knie, vom Kater Moritz und von ihrem Mann Heinz, der 2011 gestorben ist, „ganz friedlich, im eigenen Bett, Gott sei Dank“. Über das Haus nebenan sagt sie kein Wort. <span class="nebenbei">(„frage frau kolbe nach dem haus“)</span>';
    },
    themen: {
      'haus,ulmenweg,grest,villa,nebenan,drueben,nachbarhaus,tote,toten,todesfaelle,spuk,boese': function (api) { return vertraut(api) ? haus(api) : verschlossen(api); },
      'renate,vogt,klavier,klavierstunde,singen,gesang,singt,stimme,badewanne,1997': renate,
      'hallmann,wolfgang,irmgard,brand,feuer,1974,telefon,anruf,uhr,taschenuhr': function (api) {
        if (api.traegt('taschenuhr') && !vertraut(api)) return uhrZeigen(api);
        return hallmann(api);
      },
      'carsten,haeuser,feuerwehr,2026,erbe,cousin': carsten,
      'natascha,romanow,restauratorin,kommentar,artikel,internet,2025': natascha,
      'bettina,gerdes,brigitte,maedchen,peter,2022': gerdes,
      'spiegel,salz,aberglaube,hufeisen,kreuz,kruzifix,neumond,schwelle': aberglaube,
      'brzezinski,steiger,ostermann,albers,teubner,frueher,schwiegermutter,elisabeth,pflegerin,1930': frueher,
      'brinkhoff,architekt,fenster,1986': brinkhoff,
      'lavendel,geruch': function (api) {
        return '„Riechen Sie’s nicht selbst?“ Sie wedelt mit der Hand, als wolle sie eine Fliege verscheuchen. „Das hatten sie alle. Am Ende hat man es bis an den Zaun gerochen.“';
      },
      'knie,moritz,kater,heinz,mann,garten,rasen,wetter,geranien,kaffee,gebaeck,enkelin,tochter': function (api) {
        return '„Ach, das Knie.“ Frau Kolbe erzählt ausführlich: vom Knie, von der Enkelin in Bochum, die ihr das Internet eingerichtet hat, von den Geranien, die dieses Jahr nichts geworden sind. „Auf der Seite zur Hecke wird nichts. Nie.“';
      }
    },
    themaSonst: function (api) { return vertraut(api) ? '„Da weiß ich nichts.“ Sie nimmt ihr Kreuz zwischen die Finger. „Und was ich nicht weiß, will ich auch nicht wissen.“' : '„Davon versteh ich nichts.“ Sie schiebt dir den Teller hin. „Noch ein Plätzchen?“'; },
    bei: {
      zeigen: function (api, ctx) {
        if (ctx.obj === 'taschenuhr') return uhrZeigen(api);
        if (HG.daten.dinge[ctx.obj] && HG.daten.dinge[ctx.obj].spiegel) { api.sage('Frau Kolbe dreht den Kopf weg, bevor du es ganz hochgehalten hast. „Stecken Sie das weg. Bitte. Nicht in meiner Küche.“'); return true; }
        return false;
      },
      geben: function (api, ctx) { return ctx.obj === 'taschenuhr' ? uhrZeigen(api) : false; }
    }
  });

  HG.ding('telefon_kolbe', {
    nomen: 'Telefon', genus: 'n', adj: ['grau', 'alt'], woerter: ['telefon', 'waehlscheibe', 'apparat', 'hoerer'],
    ort: 'kolbe_kueche', fest: true, szenerie: true,
    beschreibung: 'Ein grauer Wählscheibenapparat an der Wand, Bundespost, mit einem Spiralkabel, das bis zum Boden reicht. Daneben ein Zettel mit Nummern in großer Schrift: „Tochter“, „Arzt“, „Feuerwehr 112“ – das letzte zweimal unterstrichen.',
    texte: { nehmen: 'Das Telefon hängt an der Wand. Frau Kolbe sieht dich an, als hättest du nach ihrem Gebiss gegriffen.' }
  });

  // ===================================================================
  // HINWEISE
  // ===================================================================
  HG.hinweis('kolbe_renate', {
    titel: 'Frau Kolbe über Renate Vogt', strang: 'D',
    text: 'Frau Kolbe: Im Sommer 1997 sang Renate Vogt abends allein oben. „Weil sie mir vorsingt, Karin. Und ich muss nachsingen. Wenn ich richtig nachsinge, darf ich bleiben.“ Im Oktober fand man sie in der Badewanne. Die Nachbarskinder hörten bis zum Morgen eine einzige Stimme singen.',
    stichworte: ['kolbe', 'renate', 'vogt', 'singen', 'vorsingen', 'badewanne']
  });
  HG.hinweis('kolbe_hallmann', {
    titel: 'Frau Kolbe über Wolfgang Hallmann', strang: 'D',
    text: 'Frau Kolbe: Im Herbst 1974 sagte Wolfgang Hallmann: „Irmgard ruft mich nachts an. Ich weiß, dass sie es nicht ist. Und ich geh trotzdem ran.“ In der Brandnacht klingelte bei Kolbes kurz vor drei das Telefon: „Es brennt bei Hallmanns“ – mit Irmgards Stimme. Irmgard war seit zwei Jahren tot.',
    stichworte: ['kolbe', 'hallmann', 'irmgard', 'telefon', 'brand', '1974'],
    schaltetFrei: ['stadtarchiv']
  });

  // Hallmanns Geschichte: Bauakte + (Messprotokolle oder Zeitung 1974 oder Frau Kolbe)
  var hm = HG.daten.seelen.hallmann;
  if (hm && Array.isArray(hm.wissen[1])) hm.wissen[1].push('kolbe_hallmann');

})();
