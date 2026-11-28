// Haus Grest – Inhalt: Schauplatz ALTENHEIM „Seniorenheim Lindenhof“, Hombruch (Akt 2)
// Spielbibel 9.4 (Zeugin im Altenheim, von David bestätigt), 4 (Mädchenkammer: „L. W. 1928“), 8.7 (Hinweis-Landkarte:
// Zeugin = Quelle für „Zwei Elisabeths“). David, 27.11.2026: Die Zeugin ist die über hundertjährige Tochter der Köchin.
// Namen, Wortlaut und Ablauf [Vorschlag von Claude, 27.11.2026].
//
// Räume:  altenheim (Empfang, Ankunft)  –N→  altenheim_aufenthalt (Aufenthaltsraum, Lotte am Fenster)
// Brigittes „Sie werden’s merken“: Wer schon im Haus war, den erkennt Lotte am Lavendel – man muss ihren Namen nicht kennen.
// Lotte Wiegand ist 104 und nicht immer klar. Klar wird sie auf einem von vier Wegen:
//   Zeit      – vormittags (bis 11 Uhr) ist sie klar (das sagt Frau Arslan am Empfang)
//   Kopf      – nach etwas fragen, das nur sie kennt (Ritzung, Kammer, Mutter Martha, Zuckerstücke) – braucht die
//               Mädchenkammer oder Bettinas Referat
//   Beruf     – Pflegekraft: weiß, wie man mit ihr spricht
//   Fertigkeit – ihre Hand nehmen und ruhig mit ihr reden (Erste Hilfe); misslungen: sie döst eine halbe Stunde
// Klar erzählt sie von den zwei Gesichtern der gnädigen Frau und vom Ring (zwei Notizbuch-Einträge).
(function () {

  var BESUCHSZEIT = { von: '09:00', bis: '19:00' };
  var VORMITTAG = { von: '09:00', bis: '11:00' };

  HG.ziel('altenheim', {
    name: 'Seniorenheim Lindenhof', herkunft: 'Aus dem Altenheim',
    woerter: ['altenheim', 'seniorenheim', 'pflegeheim', 'altersheim', 'lindenhof', 'heim'],
    ankunft: 'altenheim', fahrzeit: 25, geoeffnet: BESUCHSZEIT,
    geschlossen: 'Die Besuchszeit im Lindenhof ist vorbei (9–19 Uhr).',
    fahrt: 'Du fährst nach Hombruch. Der Lindenhof ist ein flacher Klinkerbau hinter einer Reihe alter Linden, mit Rampen statt Stufen und einer Bank vor der Tür, auf der niemand sitzt.'
  });

  // ===================================================================
  // EMPFANG
  // ===================================================================
  HG.raum('altenheim', {
    name: 'Empfang im Lindenhof', woerter: ['empfang', 'eingang', 'foyer', 'eingangshalle'],
    schauplatz: 'altenheim', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: 'Ein heller Eingangsbereich mit Linoleum, das nach Desinfektionsmittel und Kamillentee riecht. An einem Empfangstresen mit einem Topf Orchideen sitzt eine Pflegerin und schreibt etwas in eine Mappe. An der Pinnwand hängen ein Speiseplan und Fotos vom Sommerfest. Im Norden geht es in den Aufenthaltsraum.',
    kurz: 'Der Empfang im Lindenhof. Frau Arslan am Tresen. Norden: Aufenthaltsraum.',
    riechen: 'Desinfektionsmittel, Kamillentee, ein bisschen Mittagessen (Frikadellen).',
    horchen: 'Ein Rollator quietscht im Flur. Irgendwo läuft ein Fernseher, ein Quiz. Eine Klingel, eine Tür.',
    ausgaenge: { norden: 'altenheim_aufenthalt' },
    beimBetreten: function (api, info) {
      if (info.erstesMal) api.sage('Die Pflegerin am Tresen sieht auf und lächelt müde. „Guten Tag. Zu wem möchten Sie denn?“ <span class="nebenbei">(„sprich mit pflegerin“)</span>');
    },
    vorschlaege: function (api) {
      var v = ['sprich mit pflegerin'];
      if (!api.flag('arslan_lotte')) v.push(api.hatHinweis('bettinas_referat') || api.hatHinweis('zwei_gesichter') ? 'frage pflegerin nach lotte' : 'frage pflegerin nach dem ulmenweg');
      return v.concat(['geh nach norden']);
    },
    details: [
      { nomen: 'Pinnwand', genus: 'f', woerter: ['pinnwand', 'speiseplan', 'fotos', 'sommerfest', 'aushang'],
        text: 'Montag Frikadellen, Dienstag Grünkohl. Fotos vom Sommerfest: Luftballons, ein Akkordeonspieler, alte Menschen mit Papierhüten. Auf einem Foto sitzt eine winzige Frau im Rollstuhl am Rand und sieht nicht in die Kamera, sondern in die Fensterscheibe hinter dem Fotografen.' },
      { nomen: 'Orchideen', genus: 'pl', woerter: ['orchideen', 'orchidee', 'blumen', 'topf'], text: 'Weiße Orchideen in einem Übertopf. Echt. Du hast nachgefühlt.' }
    ]
  });

  function lotteVerweis(api, ohneAnrede) {
    api.setzeFlag('arslan_lotte');
    return (ohneAnrede ? '„Lotte Wiegand, hundertvier im März. Die sitzt im Aufenthaltsraum am Fenster, wie immer.“ ' : '„Ach, zu Frau Wiegand!“ Die Pflegerin strahlt. „Lotte Wiegand, hundertvier im März. Die sitzt im Aufenthaltsraum am Fenster, wie immer.“ ') + 'Sie senkt die Stimme. ' +
      '„Vormittags ist sie am klarsten. Nachmittags verwechselt sie die Leute manchmal. Dann nicht drängeln – Hand halten, ruhig reden, dann kommt sie meistens zurück.“';
  }

  HG.ding('arslan', {
    nomen: 'Frau Arslan', genus: 'f', eigenname: true,
    woerter: ['arslan', 'pflegerin', 'schwester', 'frau', 'empfang', 'pflegekraft', 'personal'],
    ort: 'altenheim', person: true, szenerie: true,
    beschreibung: 'Eine Pflegerin um die vierzig in hellblauer Dienstkleidung, Namensschild „S. Arslan – Wohnbereichsleitung“. Sie sieht aus, als hätte sie seit dem Frühdienst nicht gesessen.',
    gespraech: function (api) {
      if (api.hatVorteil('altenheim')) return '„Sie sind vom Fach, oder?“ Sie mustert dich und nickt. „Merkt man. Wen besuchen Sie?“ <span class="nebenbei">(„frage arslan nach …“)</span>';
      return '„Arslan, Wohnbereichsleitung.“ Sie klappt die Mappe zu. „Wen möchten Sie besuchen?“ <span class="nebenbei">(„frage arslan nach …“)</span>';
    },
    themen: {
      'lotte,wiegand,charlotte,koechin,referat,zimmer,14,zeitzeugin': lotteVerweis,
      'ulmenweg,haus,grest,kirchhoerde,villa,elisabeth,spiegel': function (api) {
        return '„Ulmenweg?“ Sie lacht kurz. „Da kann ich nur an Frau Wiegand denken. Die erzählt jedem vom Ulmenweg, ob er’s hören will oder nicht.“ ' + lotteVerweis(api, true);
      },
      'bettina,gerdes,maedchen,schuelerin,schule,brigitte': function (api) {
        return '„Ein Mädchen war mal da, für die Schule. Vor ein paar Jahren.“ Frau Arslan wird ernst. „Danach hat Frau Wiegand drei Nächte nicht geschlafen. Sie hat verlangt, dass wir den Spiegel in ihrem Zimmer abhängen. Seitdem ist da keiner mehr.“ ' + (api.flag('arslan_lotte') ? '' : lotteVerweis(api, true));
      },
      'besuch,besuchszeit,besuchen': '„Besuchszeit ist von neun bis sieben. Tragen Sie sich bitte ins Buch ein.“'
    },
    themaSonst: '„Da fragen Sie mich was.“ Sie lächelt entschuldigend. „Wen möchten Sie denn besuchen?“'
  });

  // ===================================================================
  // AUFENTHALTSRAUM
  // ===================================================================
  HG.raum('altenheim_aufenthalt', {
    name: 'Aufenthaltsraum', woerter: ['aufenthaltsraum', 'tagesraum', 'saal'],
    schauplatz: 'altenheim', karte: { x: 0, y: -1 },
    beschreibung: function (api) {
      var t = 'Ein heller Aufenthaltsraum mit großen Fenstern zum Garten. In Sesseln dösen alte Menschen vor einem Fernseher, in dem leise ein Quiz läuft. Auf den Tischen Teetassen und ein Puzzle mit einem Leuchtturm, an dem seit Wochen keiner weitergelegt hat. ' +
        'Am Fenster sitzt eine winzige alte Frau im Rollstuhl, eine Wolldecke über den Knien, und sieht hinaus.';
      if (api.tageszeit() === 'abend') t += ' Draußen dämmert es. Die großen Scheiben fangen an zu spiegeln.';
      return t + ' Im Süden geht es zurück zum Empfang.';
    },
    kurz: 'Der Aufenthaltsraum. Lotte Wiegand am Fenster. Süden: Empfang.',
    riechen: 'Tee, Kölnisch Wasser, Desinfektionsmittel.',
    horchen: function (api) { return 'Das Quiz im Fernseher. Jemand schnarcht. Ein Teelöffel klappert in einer Tasse.' + (lotteKlar(api) ? '' : ' Am Fenster murmelt die alte Frau etwas vor sich hin, immer dasselbe.'); },
    ausgaenge: { sueden: 'altenheim' },
    beimBetreten: function (api, info) {
      if (info.erstesMal) {
        var imHaus = HG.zustand.z.besucht && HG.zustand.z.besucht.halle;
        if (imHaus) {
          api.setzeFlag('lotte_lavendel');
          api.abschnitt(52, 'Du bist kaum zwei Schritte im Raum, da dreht die alte Frau am Fenster den Kopf. Langsam, wie eine Eule. Sie sieht dich an, und ihre Augen sind hell und ganz wach.<br><br>' +
            '„Lavendel“, sagt sie, laut genug, dass ein Mann im Sessel aufschreckt. „Sie riechen nach Lavendel.“ Sie winkt dich mit einer Hand heran, die nur noch aus Knöcheln besteht. „Sie kommen aus dem Haus. Kommen Sie her, Kind. Setzen Sie sich zu mir.“');
          if (!api.flag('lotte_klar')) api.setzeFlag('lotte_klar', api.tag());
        } else {
          api.sage('Die alte Frau am Fenster dreht den Kopf, als du hereinkommst, mustert dich kurz und sieht dann wieder hinaus. „Nein“, sagt sie zu niemandem. „Der nicht.“');
        }
      }
      if (api.tageszeit() === 'abend' && api.flag('spiegel_lindenhof') !== api.tag()) {
        api.setzeFlag('spiegel_lindenhof', api.tag());
        // Text passt zum Bild raum-aufenthaltsraum-spuk (David, Alpha-Test 27.11.2026)
        api.sage('In der dunkler werdenden Scheibe siehst du den Raum noch einmal: die Sessel, den Fernseher, dich. Und draußen im Garten, hinter dem Glas, steht eine Frau in einem hellen Kleid und sieht herein. Nicht zu Lotte. Zu dir. Auf der Vogeltränke neben ihr sitzt eine Krähe. Du blinzelst, und da ist nur noch der Regen.<br>' +
          'Lotte hat es auch gesehen. Sie zieht die Wolldecke höher. „Die geht mit“, sagt sie. „Die geht immer mit.“');
        api.nervenProbe('0/1W3', { grund: 'Die Frau in der Scheibe' });
      }
    },
    vorschlaege: function (api) {
      if (lotteFertig(api)) return ['geh nach süden'];
      if (!lotteKlar(api)) return ['sprich mit lotte', 'geh nach süden'];
      var v = [];
      if (!api.hatHinweis('lotte_zwei_gesichter')) v.push('frage lotte nach der gnädigen frau');
      if (!api.hatHinweis('lotte_ring') && api.kennt('ehering')) v.push('frage lotte nach dem ring');
      v.push('frage lotte nach der schwester');
      return v.concat(['geh nach süden']);
    },
    details: [
      { nomen: 'Fernseher', genus: 'm', woerter: ['fernseher', 'quiz', 'tv'], text: '„Wer wird Millionär“, eine Wiederholung. Niemand sieht hin.' },
      { nomen: 'Puzzle', genus: 'n', woerter: ['puzzle', 'leuchtturm', 'tische', 'tisch', 'teetassen', 'tassen'], text: 'Ein Leuchtturm, tausend Teile, der Himmel fehlt noch fast ganz. Jemand hat ein Teil mit einem Stück Wolke ordentlich neben die Schachtel gelegt, als hätte er gewartet, bis es passt.' },
      { nomen: 'Alte Menschen', genus: 'pl', woerter: ['menschen', 'bewohner', 'leute', 'alte', 'mann', 'senioren'], text: 'Ein Mann mit Hosenträgern schläft mit offenem Mund. Zwei Frauen teilen sich wortlos eine Zeitung. Keiner von ihnen sieht zum Fenster, wo Lotte sitzt.' },
      { nomen: 'Fenster', genus: 'n', woerter: ['fenster', 'scheibe', 'scheiben', 'garten'],
        text: function (api) { return api.tageszeit() === 'abend' ? 'Draußen ist es fast dunkel. In den Scheiben spiegelt sich der Raum. Du siehst nicht lange hin.' : 'Ein Garten mit Hochbeeten und einer Vogeltränke. Auf dem Rand der Tränke sitzt eine Krähe und rührt sich nicht.'; } }
    ]
  });

  // ===================================================================
  // LOTTE WIEGAND
  // ===================================================================
  function lotteKlar(api) {
    return api.flag('lotte_klar') === api.tag() || api.istOffen(VORMITTAG) || api.hatVorteil('altenheim');
  }
  var LOTTE_TIPPS = {
    2: 'Lotte ist hundertvier. Frau Arslan am Empfang weiß, wann sie am klarsten ist. Vielleicht holt sie auch etwas aus ihrer eigenen Kindheit zurück.',
    3: function (api) {
      var t = ['Komm vormittags wieder, zwischen 9 und 11 Uhr.'];
      if (api.hatHinweis('zwei_gesichter') || api.hatHinweis('bettinas_referat')) t.push('Oder frag sie nach etwas, das nur sie kennt – ihre Kammer unter dem Dach, ihre Mutter Martha. <span class="nebenbei">(„frage lotte nach der kammer“)</span>');
      else t.push(HG.zustand.z.besucht.maedchenkammer ? 'Unter dem Dach von Haus Grest, in der Mädchenkammer, hat sie als Kind geschlafen. Was dort steht, würde sie wiedererkennen.' : 'Lotte ist in Haus Grest aufgewachsen. Etwas aus ihrer Kindheit dort würde sie zurückholen.');
      t.push('Oder nimm ihre Hand und rede ruhig mit ihr. <span class="nebenbei">(„sprich mit lotte“)</span>');
      return t.join(' ');
    }
  };

  /** Lotte ist gerade nicht klar: Bruchstücke, gestaffelte Hinweise. */
  function verwirrt(api) {
    if (api.flag('lotte_doest') && api.minuten() < api.flag('lotte_doest')) {
      api.sage('Lotte ist eingenickt. Ihr Kopf ist zur Seite gesunken, ihre Hand liegt auf der Wolldecke. Lass sie eine Weile schlafen.');
      api.fehlversuch('lotte', LOTTE_TIPPS);
      return true;
    }
    var saetze = [
      '„Gnädige Frau?“ Lotte sieht dich an und zieht die Hände unter die Decke. „Ich hab nicht reingeguckt. Ich schwör’s. Mutter hat gesagt, ich soll nicht reingucken.“',
      '„Ist schon Kaffeezeit?“ Sie lächelt dich an, freundlich und fremd. „Sie sind die Neue, ja? Die Neue von oben.“',
      '„Die Schwester kommt gleich“, flüstert Lotte. „Psst. Nicht in die Augen sehen. Nicht in die Augen.“'
    ];
    api.sage(saetze[api.zaehle('lotte_verwirrt') % saetze.length]);
    api.fehlversuch('lotte', LOTTE_TIPPS);
    return true;
  }

  /** Nach etwas fragen, das nur sie kennt – sie kommt zurück (Kopf-Weg). */
  function erinnerung(api) {
    var kennt = api.hatHinweis('zwei_gesichter') || api.hatHinweis('bettinas_referat');
    if (!lotteKlar(api) && !kennt) return verwirrt(api);
    var warKlar = lotteKlar(api);
    api.setzeFlag('lotte_klar', api.tag());
    api.fehlversucheVergessen('lotte');
    api.sage((warKlar ? '' : 'Bei dem Wort hält Lotte inne. Etwas kommt in ihr Gesicht zurück, von sehr weit her. ') +
      '„Die Kammer unterm Dach.“ Sie lacht, ein trockenes kleines Geräusch. „Da hab ich mit Mutters Schälmesser was in die Wand gekratzt. Hat’s jemand gefunden? Mutter hat mir dafür eine gescheuert.“ ' +
      'Sie wird still. „Martha Wiegand. Beste Köchin in ganz Kirchhörde. Und die gnädige Frau hat mir Zuckerstücke gegeben, wenn Mutter nicht hingeguckt hat. Bei Tag.“ Sie sieht dich an. „Fragen Sie, Kind. Solange ich noch weiß, wer Sie sind.“');
    return true;
  }

  /** Fertigkeits-Weg: Hand halten, ruhig reden (Erste Hilfe). */
  function handHalten(api) {
    if (api.flag('lotte_doest') && api.minuten() < api.flag('lotte_doest')) return verwirrt(api);
    var rat = api.flag('arslan_lotte');   // Frau Arslans Rat: nicht drängeln, Hand halten
    var e = api.probe('erstehilfe', { mod: rat ? 20 : 0, modGrund: rat ? 'Frau Arslans Rat' : '', grund: 'Lotte zurückholen – Hand halten, ruhig reden' });
    if (e.erfolg) {
      api.setzeFlag('lotte_klar', api.tag());
      api.fehlversucheVergessen('lotte');
      api.sage('Du nimmst ihre Hand. Sie ist kalt und leicht wie ein Vogel. Du sagst deinen Namen, zweimal, dann erzählst du ihr vom Wetter, vom Lindenhof, von den Linden vor der Tür. Irgendwann hört sie auf zu murmeln. „Ach“, sagt sie, ganz klar. „Sie sind ja gar nicht die Neue von oben. Sie sind aus dem Haus.“ Sie drückt deine Hand. „Fragen Sie.“');
      return true;
    }
    api.setzeFlag('lotte_doest', api.minuten() + 30);
    api.sage('Du nimmst ihre Hand und redest ruhig mit ihr. Lotte sieht dich an, sieht durch dich hindurch, und irgendwann fallen ihr die Augen zu. Sie ist eingenickt. Frau Arslan hat gesagt: nicht drängeln.');
    api.fehlversuch('lotte', LOTTE_TIPPS);
    return true;
  }

  function zweiGesichter(api) {
    if (!lotteKlar(api)) return verwirrt(api);
    if (api.hatHinweis('lotte_zwei_gesichter')) { api.sage('„Hab ich doch erzählt“, sagt Lotte. „Zwei Gesichter. Bei Tag und bei Nacht. Und wenn sie gelächelt hat, war’s die andere.“'); return true; }
    api.abschnitt(53, '„Die gnädige Frau.“ Lotte faltet die Hände auf der Decke. „Bei Tag konnte sie kaum die Tasse halten. Gelähmt, sagte Mutter. Sie saß im Rollstuhl am Fenster, und wenn ich kam, hat sie mir ein Zuckerstück in die Hand gedrückt und gesagt: ‚Nicht verraten, Lottchen.‘ Die war gut. Die war so gut.“<br><br>' +
      '„Aber nachts.“ Sie senkt die Stimme. „Nachts hat jemand mit ihrer Stimme geredet. Im Spiegel im Flur. Ich hab sie gesehen, einmal, wie ich runter bin zum Abort: die gnädige Frau im Spiegel, und sie hat gelächelt. Die gnädige Frau hat nie gelächelt, die hatte zu viele Schmerzen. Die im Spiegel schon.“<br><br>' +
      '„Zwei Gesichter, hab ich gesagt, und Mutter hat mir den Mund zugehalten.“ Lotte sieht aus dem Fenster. „Und im Herbst, das letzte Jahr, in der Nacht ohne Mond, da war die gnädige Frau unten im Keller, mit der Schwester. Auf ihren eigenen Füßen, die doch nicht gingen. Und dann hat sie geschrien. ‚Nein!‘ Nur das, ‚Nein!‘, durchs ganze Haus. Am Morgen war die Schwester weg. Und die gnädige Frau hat die Kammer von der Schwester zugemacht, mit rotem Wachs, und hat dabei geweint.“');
    api.hinweis('lotte_zwei_gesichter');
    return true;
  }

  function ring(api) {
    if (!lotteKlar(api)) return verwirrt(api);
    // Erst, wenn man den Ehering kennt (Spieltest 2). Lotte deutet nur an – welche Hand die richtige ist, ergibt sich erst
    // aus Ring, Bernwards Brief und späteren Funden (Spielbibel 9.6).
    if (!api.kennt('ehering')) { api.sage('„Ringe.“ Lotte dreht an ihrem leeren Finger. „Ich hab keinen mehr. Die Schwestern hier haben ihn weggeschlossen, weil ich so dünn geworden bin.“'); return true; }
    if (api.hatHinweis('lotte_ring')) { api.sage('„Die gnädige Frau hat immer an ihren Finger gefasst“, sagt Lotte. „Da, wo der Ring war. Die andere nie.“'); return true; }
    api.abschnitt(54, '„Der Ring.“ Lotte greift an ihren eigenen Ringfinger, an dem nichts steckt. „Bei der gnädigen Frau war da ein weißer Streifen, wo er gesessen hat. Der Herr hatte ihn verwahrt, sagte Mutter, als sie krank wurde. ‚Bis du gesund bist.‘ Und dann ist der Herr gestorben, und der Ring war weg.“<br><br>' +
      '„Die gnädige Frau hat immer an ihren Finger gefasst, wo der Ring war. Immer, wenn sie an den Herrn gedacht hat. So.“ Lotte reibt mit dem Daumen über ihren leeren Finger, langsam, hin und her. „Die andere nie.“<br><br>' +
      'Sie sieht dich lange an. „Hundert Jahre hat mich keiner danach gefragt.“');
    api.hinweis('lotte_ring');
    return true;
  }

  HG.ding('lotte', {
    nomen: 'Lotte Wiegand', genus: 'f', eigenname: true,
    woerter: ['lotte', 'wiegand', 'charlotte', 'frau', 'alte', 'rollstuhl', 'zeugin', 'dame'],
    ort: 'altenheim_aufenthalt', person: true, szenerie: true,
    beschreibung: function (api) {
      return 'Lotte Wiegand ist so klein, dass der Rollstuhl um sie herum zu groß aussieht. Weißes, dünnes Haar, eine Strickjacke, die Hände wie trockene Blätter auf der Wolldecke. ' +
        (lotteKlar(api) ? 'Ihre Augen sind hell und wach, und sie lassen dich nicht los.' : 'Sie sieht aus dem Fenster und bewegt die Lippen, als zählte sie etwas.');
    },
    gespraech: function (api) {
      if (lotteKlar(api)) return '„Na, Kind?“ Lotte klopft auf die Armlehne neben sich. „Fragen Sie. Die gnädige Frau, die Schwester' + (api.kennt('ehering') ? ', der Ring' : '') + ' – ich hab alles noch hier drin.“ Sie tippt sich an die Stirn. <span class="nebenbei">(„frage lotte nach …“)</span>';
      if (api.flag('lotte_doest') && api.minuten() < api.flag('lotte_doest')) return verwirrt(api);
      api.sage('Lotte sieht dich an, ohne dich zu erkennen. „Gnädige Frau?“, flüstert sie.');
      api.auswahl('Was tust du?', [
        { text: 'Ihre Hand nehmen und ruhig mit ihr reden', tu: function () { handHalten(api); } },
        { text: 'Sie nach ihrer Kindheit im Haus fragen', tu: function () { erinnerung(api); } },
        { text: 'Sie in Ruhe lassen', tu: function () { api.sage('Du lässt sie. Lotte sieht wieder aus dem Fenster. Draußen, auf der Vogeltränke, sitzt eine Krähe.'); } }
      ]);
      return true;
    },
    themen: {
      'kammer,ritzung,wand,dach,dachkammer,maedchenkammer,mutter,martha,kindheit,zuckerstueck,zuckerstuecke,lottchen,lw,1928,kind': erinnerung,
      'gnaedige,gnaedigen,gnaedig,elisabeth,grest,gesichter,gesicht,zwei,spiegel,laecheln,andere': zweiGesichter,
      'ring,ehering,finger,hand,haende,bernward,herr,maerz,1930,tod,ende': ring,
      'schwester,pflegerin,kraehe,vogel,keller,neumond,mond,augen,lied': function (api) {
        if (!lotteKlar(api)) return verwirrt(api);
        return '„Die Schwester.“ Lotte zieht die Decke höher. „Die hatte einen Vogel. Eine Krähe, die saß ihr auf der Schulter wie eine Brosche. Ich durfte ihr nie in die Augen sehen, hat Mutter gesagt, sonst nimmt sie sich was.“ ' +
          '„Einmal im Monat, in der Nacht ohne Mond, ist sie runter in den Keller. Unter die Halle. Dann musste Mutter die Küche abschließen, und von unten hat man sie singen hören. Kein Lied, das ich kannte. Und am Morgen fehlte im Taubenschlag eine Taube.“';
      },
      'bettina,maedchen,schuelerin,spange,haarspange,referat,schule': function (api) {
        if (!lotteKlar(api)) return verwirrt(api);
        return '„Das Mädchen mit der blauen Spange.“ Lottes Gesicht wird hart. „Ich hab ihr gesagt, sie soll nicht in dem Zimmer schlafen. Sie hat gelacht.“ Eine lange Pause. „Sie hat genauso gelacht wie die im Spiegel. Da wusst ich, dass es zu spät ist.“';
      },
      'haus,ulmenweg,villa,lavendel,wintergarten': function (api) {
        if (!lotteKlar(api)) return verwirrt(api);
        return '„Der Lavendel im Wintergarten. Den hat die Schwester gezogen, für die Tropfen.“ Sie schnuppert in deine Richtung. „Riecht man heute noch an Ihnen. Das Haus hat ihn behalten. Das Haus behält alles.“';
      },
      'carsten,haeuser': function (api) {
        if (!lotteKlar(api)) return verwirrt(api);
        return '„Der Mann mit der Brille?“ Lotte schüttelt den Kopf. „Der war nicht hier. Der hat nur angerufen. Hat gefragt, ob ich die gnädige Frau gekannt hab. Und dann hat er gesagt, sie wär so schön. So schön.“ Sie sieht dich an. „Die im Spiegel ist schön. Die gnädige Frau war krank.“';
      }
    },
    themaSonst: function (api) {
      if (!lotteKlar(api)) return verwirrt(api);
      return '„Ach, Kind. Das weiß ich nicht mehr.“';
    }
  });

  // Hat Lotte alles erzählt, schließt sie sich: freundlich, endgültig (Spieltest 2). Gilt ab dem nächsten Gespräch.
  function lotteFertig(api) { return api.hatHinweis('lotte_zwei_gesichter') && api.hatHinweis('lotte_ring') && api.flag('lotte_fertig_ab') && api.zug() > api.flag('lotte_fertig_ab'); }
  var LOTTE_ZU = 'Lotte sieht aus dem Fenster. Sie erkennt dich nicht mehr. Als du ihr die Hand auf den Arm legst, lächelt sie freundlich, wie man einem Fremden zulächelt, und sieht wieder hinaus in den Garten.';
  (function () {
    var d = HG.daten.dinge.lotte;
    function zu(fn) {
      return function (api, ctx) {
        if (lotteFertig(api)) { api.sage(LOTTE_ZU); return true; }
        var r = HG.wert(fn, api, ctx);
        if (api.hatHinweis('lotte_zwei_gesichter') && api.hatHinweis('lotte_ring') && !api.flag('lotte_fertig_ab')) api.setzeFlag('lotte_fertig_ab', api.zug());
        return r;
      };
    }
    d.gespraech = zu(d.gespraech);
    d.themaSonst = zu(d.themaSonst);
    Object.keys(d.themen).forEach(function (k) { d.themen[k] = zu(d.themen[k]); });
  })();

  // ===================================================================
  // HINWEISE
  // ===================================================================
  HG.hinweis('lotte_zwei_gesichter', {
    titel: 'Lotte: zwei Gesichter', strang: 'B',
    text: 'Lotte Wiegand (104), die Tochter der Köchin: Bei Tag war die gnädige Frau gelähmt und sanft und lächelte nie. Nachts sprach im Flurspiegel eine mit ihrer Stimme, und die lächelte. Im Herbst 1929, in einer Neumondnacht, stand Elisabeth mit der Pflegerin im Keller und schrie „Nein!“. Am Morgen war die Pflegerin fort; Elisabeth versiegelte weinend deren Kammer.',
    stichworte: ['lotte', 'wiegand', 'gesichter', 'spiegel', 'nein', 'siegel', '1929', 'elisabeth']
  });
  HG.hinweis('lotte_ring', {
    titel: 'Lotte: der Ring', strang: 'B',
    text: 'Elisabeth trug ihren Ehering nicht mehr: Bernward hatte ihn verwahrt, „bis du gesund bist“, und nach seinem Tod war er fort. Lotte: „Die gnädige Frau hat immer an ihren Finger gefasst, wo der Ring war. Die andere nie.“',
    stichworte: ['lotte', 'ring', 'finger', 'elisabeth', 'spiegel', '1930']
  });

})();
