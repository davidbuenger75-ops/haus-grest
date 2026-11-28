// Haus Grest – Inhalt: STADTARCHIV (Akt 2)
// Spielbibel 5e. Von David (27.11.2026): eine Angestellte hilft, bestimmte Unterlagen zu finden.
// Bernwards Tod 1905 war wirklich ein Baustellenunfall (David). Name, Wortlaut, Ablauf [Vorschlag von Claude].
//
// Ein Raum: der Lesesaal. Frau Wessels bringt an den Lesetisch, wonach man fragt:
//   Grest      – Kirchenbuch (Trauung 12.5.1898 = 3. Quelle „Unser Tag“), Archivkopien (Bauantrag 1899, Unfall und
//                Todesanzeige 1905), Zeitungsnotiz 1930. Carsten hatte das alles schon bestellt – sie erinnert sich.
//   Zeitungen  – Hallmann 1974 und Brzezinski 1963 liegen nur auf Mikrofilm:
//                Kopf      – mit genauem Datum (Feuerwehrbericht 4.11.1974) sucht sie es selbst heraus
//                Fertigkeit – sonst gibt sie die Jahrgangsrolle, man sucht am Lesegerät (Recherche, 30 Minuten)
//                Beruf     – Journalist(in): findet es am Lesegerät ohne Probe
// Notizbuch höchstens fünf Einträge: hochzeitstag, bauantrag_1899, pflegerin_vermisst, zeitung_1974, zeitung_1963.
(function () {

  function hier(api, id) { return api.eig(id, 'ort') === 'lesetisch'; }
  function bringe(api, id) { api.bewege(id, 'lesetisch', 'auf'); }

  // ===================================================================
  // LESESAAL
  // ===================================================================
  HG.raum('stadtarchiv', {
    name: 'Stadtarchiv – Lesesaal', woerter: ['lesesaal', 'archiv', 'stadtarchiv', 'saal'],
    schauplatz: 'stadtarchiv', abfahrt: true, karte: { x: 0, y: 0 },
    beschreibung: function (api) {
      var t = 'Ein Lesesaal unter einer Glaskuppel aus den Zwanzigern, das Glas milchig vor Alter. Grüne Leselampen auf langen Eichentischen, an den Wänden Karteikästen bis unter die Decke. Es riecht nach Papier, Staub und dem Ozon der Kopierer. ' +
        'Hinter dem Ausgabetresen arbeitet eine Angestellte. In einer Nische brummt ein Mikrofilm-Lesegerät mit einem großen grauen Bildschirm.';
      var da = ['kirchenbuch', 'archivkopien', 'zeitung_1930', 'zeitung_1974', 'zeitung_1963'].filter(function (id) { return hier(api, id); });
      if (da.length) t += ' Auf deinem Platz am Lesetisch liegt, was Frau Wessels dir herausgesucht hat.';
      return t;
    },
    kurz: 'Der Lesesaal des Stadtarchivs: Ausgabetresen mit Frau Wessels, Lesetisch, Mikrofilm-Lesegerät.',
    riechen: 'Altes Papier, Staub, Ozon vom Kopierer. Und Frau Wessels’ Pfefferminzbonbons.',
    horchen: 'Das Lesegerät brummt. Irgendwo blättert jemand. Die Uhr über der Tür tickt so laut, dass man sie zählen könnte.',
    beimBetreten: function (api, info) {
      if (info.erstesMal) api.sage('Die Angestellte am Ausgabetresen sieht auf und schiebt ein Klemmbrett mit einem Anmeldeformular über den Tresen. „Erst eintragen, dann fragen“, sagt sie freundlich. „Und Jacken und Taschen bitte in die Schließfächer.“ Du trägst dich ein. Sie liest deinen Namen und dann noch einmal die Adresse. „Ulmenweg zwölf“, sagt sie. „Dann waren Sie mit Herrn Häuser verwandt.“ <span class="nebenbei">(„sprich mit frau wessels“)</span>');
    },
    vorschlaege: function (api) {
      var v = ['sprich mit frau wessels'];
      if (!api.flag('archiv_grest')) v.push('frage frau wessels nach grest');
      ['kirchenbuch', 'archivkopien', 'zeitung_1930', 'zeitung_1974', 'zeitung_1963'].forEach(function (id) {
        if (hier(api, id) && !api.hatHinweis(HG.daten.dinge[id].hinweis)) v.push('lies ' + HG.spiel.kurzwort(id));
      });
      if (!hier(api, 'zeitung_1974')) v.push('frage frau wessels nach hallmann');
      if (!hier(api, 'zeitung_1963') && (api.hatHinweis('kiste_brzezinski') || api.hatHinweis('dreizehn_kreuze'))) v.push('frage frau wessels nach brzezinski');
      if (api.flag('rolle_1974') && !hier(api, 'zeitung_1974') || api.flag('rolle_1963') && !hier(api, 'zeitung_1963')) v.push('benutze lesegerät');
      return v;
    },
    details: [
      { nomen: 'Karteikästen', genus: 'pl', woerter: ['karteikaesten', 'kartei', 'karteikasten', 'karteikarten', 'findbuch', 'findbuecher'],
        text: 'Hunderte kleine Schubladen mit Messinggriffen: „Bauakten (Abschriften)“, „Kirchenbücher – Zweitschriften“, „Zeitungen 1880–1990 – Mikrofilm“. Ein Fach ist mit Tesafilm beschriftet: „Meldekarten – VERBRANNT 2/1965“. Es ist leer.' },
      { nomen: 'Glaskuppel', genus: 'f', woerter: ['kuppel', 'glaskuppel', 'decke', 'glas'], text: 'Eine Kuppel aus Milchglas in Eisenrahmen. Ein paar Scheiben sind durch helleres Glas ersetzt. Durch eine davon siehst du eine Krähe auf dem Rahmen sitzen. Sie sieht herunter.' },
      { nomen: 'Schließfächer', genus: 'pl', woerter: ['schliessfaecher', 'schliessfach', 'spind', 'faecher'], text: 'Graue Blechfächer mit Münzschloss. Deines hat die Nummer 13. Du nimmst es trotzdem.' }
    ]
  });

  HG.ding('ausgabetresen', {
    nomen: 'Ausgabetresen', genus: 'm', woerter: ['tresen', 'ausgabetresen', 'ausgabe', 'theke', 'klemmbrett', 'formular', 'bestellzettel'],
    ort: 'stadtarchiv', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein langer Tresen aus Eiche mit einer Schreibtischlampe, einem Klemmbrett voller Bestellzettel und einer Glasschale mit Pfefferminzbonbons.'
  });
  HG.ding('lesetisch', {
    nomen: 'Lesetisch', genus: 'm', woerter: ['lesetisch', 'tisch', 'platz', 'leselampe', 'lampe'],
    ort: 'stadtarchiv', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein langer Eichentisch mit grünen Leselampen und Bleistiften. Kugelschreiber sind hier verboten, steht auf einem Schild.'
  });

  // ===================================================================
  // DAS LESEGERÄT – selbst suchen (Fertigkeit) oder als Journalist(in)
  // ===================================================================
  var SUCHE = {
    1974: { ding: 'zeitung_1974', flag: 'rolle_1974', tipps: 'archiv_1974',
      suche: 'Ruhr Nachrichten, Jahrgang 1974: dreihundert Ausgaben auf zwölf Rollen. Du spulst, bis dir die Augen tränen.',
      gefunden: 'Da: Montag, 5. November 1974, Lokalteil. Ein Foto der verrußten Fassade.' },
    1963: { ding: 'zeitung_1963', flag: 'rolle_1963', tipps: 'archiv_1963',
      suche: 'Westfälische Rundschau, Jahrgang 1963. Grubenunglücke, Karneval, Kennedy in Berlin. Du spulst.',
      gefunden: 'Da: Dienstag, 19. Februar 1963, Lokales aus dem Süden. Eine kurze Meldung mit einem Foto des Hauses.' }
  };
  var TIPPS_SUCHE = {
    1974: { 2: 'Ein genaues Datum würde helfen. Frau Wessels kann einen Artikel selbst heraussuchen, wenn man ihr den Tag nennt.',
      3: function (api) { return api.hatHinweis('hallmann_brand')
        ? 'Der Feuerwehrbericht in der Bauakte nennt die Nacht: 4.11.1974. Frag Frau Wessels noch einmal nach Hallmann. <span class="nebenbei">(„frage frau wessels nach hallmann“)</span>'
        : 'Ein genaues Datum steht vielleicht in amtlichen Unterlagen über das Haus – das Bauamt führt eine Akte. Oder versuch es am Lesegerät noch einmal.'; } },
    1963: { 2: 'Wonach suchst du eigentlich? Ein Steiger, ein Todesfall, Spiegel. Wer mehr über Brzezinski weiß, erkennt die Meldung schneller.',
      3: function (api) { return api.hatHinweis('kiste_brzezinski')
        ? 'Du weißt von der Kiste auf dem Dachboden, was geschah. Versuch es noch einmal am Lesegerät – du weißt jetzt, wonach du suchst. <span class="nebenbei">(„benutze lesegerät“)</span>'
        : 'Wer mehr über Brzezinski weiß, findet die Meldung leichter – vielleicht hat das Haus selbst noch etwas von seinen früheren Bewohnern aufbewahrt. Oder versuch es noch einmal am Lesegerät.'; } }
  };

  function suchen(api, jahr) {
    var s = SUCHE[jahr];
    if (hier(api, s.ding)) { api.sage('Den Artikel hast du schon gefunden. Die Kopie liegt auf deinem Platz.'); return; }
    api.sage(s.suche);
    api.zeitVergeht(30);
    var gut = api.hatVorteil('archiv');
    if (!gut) {
      // Wer weiß, wonach er sucht, ist schneller (+20); jeder vergebliche Versuch grenzt die Monate ein (+10).
      var weiss = jahr === 1963 ? api.hatHinweis('kiste_brzezinski') : (api.hatHinweis('kolbe_hallmann') || api.hatHinweis('hallmann_protokolle'));
      var mod = (weiss ? 20 : 0) + 10 * Math.min(3, api.fehlversuche(s.tipps));
      var e = api.probe('recherche', { mod: mod, grund: 'Mikrofilm durchsuchen, Jahrgang ' + jahr });
      gut = e.erfolg;
    } else {
      api.sage('<span class="nebenbei">(Als ' + api.g('Journalist', 'Journalistin', 'Journalist(in)') + ' weißt du, wo der Lokalteil steht und wie man Mikrofilm liest.)</span>');
    }
    if (!gut) {
      api.sage('Nach einer halben Stunde verschwimmen die Spalten. Du hast nichts gefunden – oder du hast darübergelesen. Immerhin weißt du jetzt, welche Monate du nicht noch einmal durchsehen musst.');
      api.fehlversuch(s.tipps, TIPPS_SUCHE[jahr]);
      return;
    }
    api.fehlversucheVergessen(s.tipps);
    bringe(api, s.ding);
    api.sage(s.gefunden + ' Frau Wessels druckt dir die Seite aus und legt sie auf deinen Platz. <span class="nebenbei">(„lies ' + HG.spiel.kurzwort(s.ding) + '“)</span>');
  }

  function lesegeraet(api) {
    var offen = [1974, 1963].filter(function (j) { return api.flag(SUCHE[j].flag) && !hier(api, SUCHE[j].ding); });
    if (!offen.length) {
      api.sage('Das Lesegerät brummt vor sich hin. Ohne Filmrolle zeigt der Bildschirm nur Grau. Die Rollen gibt Frau Wessels heraus. <span class="nebenbei">(„frage frau wessels nach …“)</span>');
      return true;
    }
    if (offen.length === 1) { suchen(api, offen[0]); return true; }
    api.auswahl('Welche Rolle legst du ein?', offen.map(function (j) {
      return { text: j === 1974 ? 'Ruhr Nachrichten 1974 (Hallmann)' : 'Westfälische Rundschau 1963 (Brzezinski)', tu: function () { suchen(api, j); } };
    }));
    return true;
  }

  HG.ding('lesegeraet', {
    nomen: 'Lesegerät', genus: 'n', woerter: ['lesegeraet', 'mikrofilm', 'mikrofilmlesegeraet', 'geraet', 'bildschirm', 'rolle', 'filmrolle', 'mikrofilme'],
    ort: 'stadtarchiv', fest: true, szenerie: true,
    beschreibung: function (api) {
      return 'Ein Mikrofilm-Lesegerät aus den Achtzigern, so groß wie ein Fernseher, mit Kurbel und einem Bildschirm, auf dem Zeitungsseiten als graue Negative vorbeiziehen. Ist es aus, spiegelt der dunkle Schirm den Saal hinter dir.' +
        ([1974, 1963].some(function (j) { return api.flag(SUCHE[j].flag) && !hier(api, SUCHE[j].ding); }) ? ' Daneben liegt die Filmrolle, die Frau Wessels dir gegeben hat. <span class="nebenbei">(„benutze lesegerät“)</span>' : '');
    },
    bei: { benutzen: lesegeraet, durchsuchen: lesegeraet, einschalten: lesegeraet, lesen: lesegeraet }
  });

  // ===================================================================
  // FRAU WESSELS
  // ===================================================================
  function grest(api) {
    if (api.flag('archiv_grest')) {
      return '„Alles, was wir zu Grest haben, liegt auf Ihrem Platz.“ Sie zählt an den Fingern ab: „Kirchenbuch, Bauantrag, die Sache von 1905, die Todesnachricht 1930. Mehr gibt’s nicht. Den Rest hat der Rathausbrand gefressen.“';
    }
    api.setzeFlag('archiv_grest');
    api.zeitVergeht(15);
    ['kirchenbuch', 'archivkopien', 'zeitung_1930'].forEach(function (id) { bringe(api, id); });
    return '„Grest.“ Frau Wessels nickt langsam. „Das hab ich alles schon einmal rausgesucht. Für Herrn Häuser, letztes Jahr. Er hat jede Seite kopiert, zweimal, und sich bedankt, als hätte ich ihm das Leben gerettet.“ Sie verschwindet zwischen den Regalen und kommt nach einer Viertelstunde mit einem Rollwagen zurück. ' +
      'Auf deinen Platz legt sie ein schweres, in Leinen gebundenes Kirchenbuch, eine Mappe mit Kopien und eine Zeitungskopie in Fraktur. „Bitte nur mit Bleistift. Und blättern Sie mit trockenen Händen.“ <span class="nebenbei">(„lies kirchenbuch“, „lies archivkopien“, „lies zeitungsnotiz“)</span>';
  }

  function hallmann(api) {
    if (hier(api, 'zeitung_1974')) return '„Den Artikel haben Sie doch.“ Sie tippt auf die Kopie an deinem Platz.';
    var datum = api.hatHinweis('hallmann_brand');
    if (datum) {
      api.zeitVergeht(15);
      bringe(api, 'zeitung_1974');
      api.fehlversucheVergessen('archiv_1974');
      return '„Nacht zum 4. November 1974? Dann steht’s am Dienstag drin, am Fünften.“ Frau Wessels geht, spult, kommt zurück und legt dir einen warmen Ausdruck hin. „Ruhr Nachrichten. Lokalteil, Seite drei.“ Sie zögert. „Den hat Herr Häuser nie bestellt. Komisch eigentlich. Er hat sonst alles bestellt.“ <span class="nebenbei">(„lies zeitung von 1974“)</span>';
    }
    api.setzeFlag('rolle_1974');
    return '„Hallmann. 1974, sagen Sie?“ Sie seufzt. „Ohne Tag such ich da eine Woche. Ich geb Ihnen die Rollen vom ganzen Jahrgang, Ruhr Nachrichten. Das Lesegerät steht in der Nische.“ Sie legt eine Filmrolle neben das Gerät. <span class="nebenbei">(„benutze lesegerät“)</span>';
  }

  function brzezinski(api) {
    if (hier(api, 'zeitung_1963')) return '„Die Meldung haben Sie doch gefunden.“';
    api.setzeFlag('rolle_1963');
    return '„Brzezinski. Neunzehnhundertdreiundsechzig.“ Sie schreibt es auf einen Bestellzettel. „Ein Datum haben Sie nicht? Dann bekommen Sie die Rollen. Westfälische Rundschau, Lokales Süd. Viel Glück, das sind dreihundert Ausgaben.“ Sie legt eine Filmrolle neben das Lesegerät. <span class="nebenbei">(„benutze lesegerät“)</span>';
  }

  HG.ding('frau_wessels', {
    nomen: 'Frau Wessels', genus: 'f', eigenname: true,
    woerter: ['wessels', 'frau', 'angestellte', 'archivarin', 'mitarbeiterin', 'dame'],
    ort: 'stadtarchiv', person: true, szenerie: true,
    beschreibung: 'Frau Wessels, Mitte vierzig, Strickjacke, eine Brille an einer Perlenkette. Auf ihrem Namensschild steht „S. Wessels – Lesesaal“. Sie bewegt sich zwischen den Regalen, als wüsste sie im Dunkeln, wo jedes Blatt liegt.',
    gespraech: function (api) {
      return '„Was suchen Sie denn?“ Frau Wessels schiebt die Brille hoch. „Ich brauch einen Namen und am besten ein Jahr. Mit einem genauen Datum bin ich schneller als jede Datenbank.“ <span class="nebenbei">(„frage frau wessels nach …“ – Grest, Hallmann, Brzezinski, Pflegerin, Carsten, Friedhof)</span>';
    },
    themen: {
      'grest,elisabeth,bernward,hochzeit,trauung,kirchenbuch,bauantrag,todesanzeige,1898,1899,1905,1930,unfall,kopien': grest,
      'hallmann,wolfgang,irmgard,brand,feuer,1974,zeitung': hallmann,
      'brzezinski,josef,steiger,1963,spiegel': brzezinski,
      'pflegerin,kraehe,schwester,meldekarte,meldekarten,name': function () {
        return '„Das hat Herr Häuser auch gefragt. Immer wieder.“ Frau Wessels schüttelt den Kopf. „Keine Meldekarte – die sind 1965 verbrannt. Aber auch sonst nichts: keine Steuerliste, keine Kirchensteuer, kein Eintrag im Adressbuch. Zweiundzwanzig Jahre in dem Haus, und nirgends ein Name. Als hätte es sie nie gegeben.“ Sie senkt die Stimme. „Oder als hätte jemand sehr gründlich aufgeräumt.“';
      },
      'carsten,haeuser,cousin,vetter': function () {
        return '„Herr Häuser hat hier im letzten Winter ganze Tage gesessen. Immer derselbe Platz, da hinten, mit dem Rücken zur Wand. Er hat das Lesegerät nie ausgeschaltet, nicht mal in der Mittagspause.“ Sie zögert. „Ich hab ihn gefragt, warum. Er hat gesagt: ‚Wenn der Bildschirm aus ist, spiegelt er.‘“';
      },
      'friedhof,grab,grabstelle,beerdigung,beisetzung': function (api) {
        api.zielFrei('friedhof');
        return '„Die Grests? Alter Friedhof Kirchhörde, an der Kirche. Da liegen alle, die vor dem Krieg im Dorf gestorben sind. Die Grabstelle ist bezahlt bis 2050, das hat mal jemand nachgefragt. Weiß der Himmel, wer.“';
      },
      'rathausbrand,rathaus,1965,verbrannt,akten': function () {
        return '„Februar 65. Der Keller vom alten Rathaus, mit allem drin: Meldekarten, Sterbebücher, Bauakten. Brandursache nie geklärt.“ Sie lächelt schief. „Zum Glück sind wir nicht das Rathaus. Zeitungen und die Zweitschriften der Kirchenbücher lagen hier.“';
      },
      'ostermann,albers,teubner,brinkhoff,vogt,renate,gerdes,bettina,romanow,natascha': function () {
        return '„Dazu hab ich nur, was in der Zeitung stand – und da stand bei dem Haus immer erstaunlich wenig.“ Sie zuckt mit den Schultern. „Wenn Sie ein Datum haben, suche ich’s Ihnen raus.“';
      }
    },
    themaSonst: '„Dazu müsste ich wissen, wonach ich suche. Ein Name, ein Jahr?“'
  });

  // ===================================================================
  // UNTERLAGEN
  // ===================================================================
  HG.ding('kirchenbuch', {
    dokument: true,
    nomen: 'Kirchenbuch', genus: 'n', adj: ['schwer', 'alt'],
    woerter: ['kirchenbuch', 'trauregister', 'traubuch', 'register', 'zweitschrift', 'buch'],
    ort: null, fest: true, schriftart: 'hand', dauer: { lesen: 10 },
    beschreibung: 'Ein in graues Leinen gebundener Band: „Ev. Gemeinde Kirchhörde – Trauregister 1890–1905 – Zweitschrift“. Ein Lesezeichen aus Papier steckt darin; darauf in Carstens Schrift: „Grest“.',
    lesbar: '<i>Trauregister, Jahrgang 1898, laufende Nummer 11:</i><br><br>Getraut am <b>zwölften Mai 1898</b> in der Kirche zu Kirchhörde:<br>der Architekt <b>Bernward Grest</b>, evangelisch, wohnhaft zu Dortmund,<br>und die Jungfrau <b>Elisabeth</b>, evangelisch, wohnhaft zu Kirchhörde.<br>Trauzeugen: zwei Unterschriften.<br><br>' +
      '<i>Am Rand, mit späterer Tinte, in einer spitzen, steilen Schrift, die nicht zur Hand des Pfarrers passt:</i><br>„Was Gott zusammenfügt, trennt das Glas.“',
    hinweis: 'hochzeitstag', hinweisBei: 'lesen',
    bei: {
      lesen: function (api) {
        if (!api.flag('kirchenbuch_rand')) { api.setzeFlag('kirchenbuch_rand'); api.nervenProbe('0/1', { grund: 'die fremde Schrift am Rand' }); }
        return false;
      },
      nehmen: function (api) { api.sage('„Das bleibt im Haus“, sagt Frau Wessels, ohne aufzusehen. „Fotografieren dürfen Sie. Ohne Blitz.“'); return false; }
    }
  });

  // Archivkopien und Zeitungsnotiz 1930 stehen schon in lager-schmidt.js (dort vorgemerkt); hier bekommen sie ihren Platz.
  Object.assign(HG.daten.dinge.archivkopien, {
    woerter: HG.daten.dinge.archivkopien.woerter.concat(['unfall', 'geruest', 'mappe', '1905']),
    beschreibung: 'Eine Mappe mit Kopien: ein Bauantrag, eine Zeitungsmeldung von 1905 und eine Todesanzeige.',
    lesbar: '<b>Bauantrag</b>, eingereicht am 12. Mai 1899 – „Wohnhaus nebst Remise, Ulmenweg“. Unterschrift: <i>B. Grest, Architekt</i>.<br><br>' +
      '<b>Dortmunder Zeitung, 21. Juli 1905 – Unglücksfall auf dem Bau</b><br>Auf der Baustelle des neuen Postamtes in Hörde stürzte am Mittwoch der Architekt <b>Bernward Grest</b> aus Kirchhörde von einem Gerüst, als eine Bohle unter ihm brach. Er war sofort tot. Die Bauaufsicht stellte fest, dass die Bohle morsch war; ein Verschulden Dritter liegt nicht vor. Der Verunglückte hinterlässt seine leidende Gattin.<br><br>' +
      '<b>Todesanzeige</b>, Juli 1905: „Plötzlich und unerwartet verstarb mein geliebter Gatte, der Architekt <b>Bernward Grest</b>. In tiefer Trauer: Elisabeth Grest.“',
  });
  HG.daten.hinweise.bauantrag_1899.text = 'Bauantrag vom 12. Mai 1899, unterschrieben „B. Grest, Architekt“ – auf den Tag ein Jahr nach der Hochzeit. Juli 1905: Bernward stürzt auf einer Baustelle in Hörde von einem Gerüst, eine morsche Bohle. Ein Unfall. Elisabeth bleibt allein im Haus.';
  HG.daten.hinweise.bauantrag_1899.titel = 'Bauantrag und Bernwards Unfall';

  HG.ding('zeitung_1974', {
    dokument: true,
    nomen: 'Zeitung', zusatz: 'von 1974', genus: 'f', adj: ['ausgedruckt'],
    woerter: ['zeitung', 'artikel', 'ausdruck', 'ruhr', 'nachrichten', '1974', 'brand'],
    ort: null, schriftart: 'druck', dauer: { lesen: 5 },
    beschreibung: 'Ein Ausdruck vom Mikrofilm, grau und körnig: Ruhr Nachrichten, 5. November 1974, Lokalteil. Ein Foto der verrußten Villa.',
    lesbar: '<i>Ruhr Nachrichten · Dienstag, 5. November 1974 · Dortmund-Süd</i><br><b>Studienrat stirbt in brennender Villa</b><br><br>' +
      'In der Nacht zum Montag ist in Kirchhörde der Studienrat Wolfgang H. (46) beim Brand seines Hauses am Ulmenweg ums Leben gekommen. Die Feuerwehr fand ihn im Obergeschoss. Die Polizei geht von Brandstiftung durch den Bewohner aus.<br><br>' +
      'Kollegen am Gymnasium beschreiben H. als gewissenhaften Lehrer, der seit dem Tod seiner Frau vor zwei Jahren „nicht mehr derselbe“ gewesen sei. Er habe im Lehrerzimmer erzählt, <b>seine verstorbene Frau rufe ihn nachts an</b>. „Er wusste, dass das nicht sein kann“, sagt ein Kollege. „Er hat es selbst gesagt: Es ist nicht Irmgard. Aber es klingt wie sie.“<br><br>' +
      'Rätselhaft bleibt der Notruf: Um 2.58 Uhr meldete eine Frau den Brand – vom Telefonanschluss des Hauses. H. lebte allein.',
    foto: 'Auf deinem Handyfoto ist die verrußte Fassade schärfer als auf dem Ausdruck. Im ersten Stock, wo jedes Fenster schwarz ist, ist eins hell.',
    hinweis: 'zeitung_1974', hinweisBei: 'lesen'
  });

  HG.ding('zeitung_1963', {
    dokument: true,
    nomen: 'Zeitung', zusatz: 'von 1963', genus: 'f', adj: ['ausgedruckt'],
    woerter: ['zeitung', 'meldung', 'artikel', 'ausdruck', 'rundschau', '1963', 'steiger'],
    ort: null, schriftart: 'druck', dauer: { lesen: 5 },
    beschreibung: 'Ein Ausdruck vom Mikrofilm: Westfälische Rundschau, 19. Februar 1963. Eine kurze Meldung mit einem Foto des Hauses.',
    lesbar: '<i>Westfälische Rundschau · 19. Februar 1963 · Lokales aus dem Süden</i><br><b>Rätselhafter Tod eines Steigers</b><br><br>' +
      'Tot aufgefunden wurde am Sonntagmorgen der Steiger Josef B. (51) in seinem Haus am Ulmenweg. Nachbarn hatten in der Nacht stundenlang Glas splittern hören. Der Mann saß im Flur, die Hände von Schnittwunden übersät; der Arzt stellte Herzversagen fest.<br><br>' +
      'Unerklärlich ist der Polizei, woher die Verletzungen stammen: <b>Sämtliche Spiegel des Hauses waren unversehrt.</b> Glassplitter fand man keine. B. hatte drei Grubenunglücke auf der Zeche überlebt. Er hinterlässt seine Ehefrau.',
    hinweis: 'zeitung_1963', hinweisBei: 'lesen',
    bei: {
      lesen: function (api) {
        if (!api.flag('foto_1963_gesehen')) {
          api.setzeFlag('foto_1963_gesehen');
          api.sage('Auf dem Foto neben der Meldung: Haus Grest, 1963, Winter, die Bäume kahl. Alle Fenster dunkel. Nur im ersten Stock, an der Ostseite, wo heute kein Fenster mehr ist, steht eine Frau im hellen Kleid hinter der Scheibe – scharf, als wäre sie das Einzige auf dem Bild, das stillgehalten hat.');
          api.nervenProbe('0/1W3', { grund: 'die Frau auf dem Foto von 1963' });
        }
        return false;
      }
    }
  });

  // ===================================================================
  // HINWEISE
  // ===================================================================
  HG.hinweis('zeitung_1974', {
    titel: 'Hallmann: „Es ist nicht Irmgard“', strang: 'D',
    text: 'Ruhr Nachrichten, 5.11.1974: Wolfgang Hallmann erzählte seinen Kollegen, seine tote Frau rufe ihn nachts an. „Er hat es selbst gesagt: Es ist nicht Irmgard. Aber es klingt wie sie.“ Den Brand meldete um 2.58 Uhr eine Frau – vom Anschluss des Hauses. Hallmann lebte allein.',
    stichworte: ['hallmann', 'zeitung', '1974', 'irmgard', 'anruf']
  });
  HG.hinweis('zeitung_1963', {
    titel: 'Der Steiger und die heilen Spiegel', strang: 'D',
    text: 'Westfälische Rundschau, 19.2.1963: Josef Brzezinski starb mit zerschnittenen Händen, nachdem die Nachbarn die ganze Nacht Glas splittern hörten. Am Morgen waren sämtliche Spiegel im Haus unversehrt – keine Splitter.',
    stichworte: ['brzezinski', 'zeitung', '1963', 'spiegel', 'steiger']
  });
  HG.schluss('spiegel_heilen', {
    aus: ['kiste_brzezinski', 'zeitung_1963'],
    titel: 'Die Spiegel heilen',
    text: 'Brzezinski hat 1963 alle Spiegel zerschlagen, die Nachbarn haben es gehört – und am Morgen war keiner zerbrochen. Einen Spiegel zu zerschlagen, verschafft mir eine Nacht, nicht mehr. Um drei Uhr ist das Glas wieder heil.'
  });

  // Brzezinski: Grundbuch + Kiste – die Zeitung 1963 zählt als weitere Quelle.
  var bz = HG.daten.seelen.josef;
  if (bz && bz.wissen) {
    var i = bz.wissen.indexOf('kiste_brzezinski');
    if (i >= 0) bz.wissen[i] = ['kiste_brzezinski', 'zeitung_1963'];
  }

})();
