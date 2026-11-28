// Haus Grest – Inhalt: Erdgeschoss Nord (Hinterdiele, Dienstbotenzimmer, Anrichte mit Gäste-WC, Küche, Speisekammer)
// Raumaufteilung: Spielbibel 4 / js/content/grundriss.js. Alle Texte und Rätsel [Vorschlag von Claude, 23.11.2026].
//
// Grundsatz (David, 23.11.2026): Bei Tag spukt es wenig, und das Haus will nicht, dass man es bei Tag durchsucht.
// Nachts öffnet es sich – und lockt.
//
// Rätsel „Der Riegel“ (Zugang zum Dienstbotenzimmer, ab 1908 das Zimmer der Krähe):
//   Die Tür ist von AUSSEN verriegelt und mit Siegelwachs verschlossen (Initialen „E. G.“ – Elisabeth hat die Kammer
//   1929 versiegelt). Bei Tag ist der Riegel festgerostet.
//   Kopf:       Öl aus der Speisekammer – „öle riegel“, dann „schiebe riegel“.
//   Fertigkeit: „benutze werkzeug mit riegel“ / „knacke riegel“ – Handwerk-Probe, den Rost lösen.
//   Gewalt:     „reiß am riegel“ / „brich riegel auf“ – Stärke-Probe (−20, jeder Versuch +10); Lärm, das Haus hört es.
//   Nacht:      Der Riegel gleitet leicht, als hätte ihn jemand geölt. Das Haus will, dass du hineingehst.
// Drinnen: Gebetbuch der Pflegerin in Spiegelschrift (lesbar mit einem Spiegel – Taschenspiegel aus der Küche,
// WC-Spiegel, Flurspiegel, nachts das Fenster – oder per Verstand-Probe), Zigarrenkiste mit Vogelschädeln unter der Diele.
(function () {

  function nacht(api) { return api.istNacht(); }
  function dunkelDraussen(api) { return api.istDunkel(); }   // kein Strom: ab Einbruch der Dunkelheit (16:30) finster

  // ===================================================================
  // HINTERDIELE
  // ===================================================================
  HG.raum('hinterdiele', {
    name: 'Hinterdiele',
    woerter: ['hinterdiele', 'diele', 'hintereingang'],
    schauplatz: 'haus', karte: { x: -1, y: -1 },
    dunkel: dunkelDraussen,
    dunkelText: 'Stockfinster. Unter deinen Schuhen Steinfliesen. Irgendwo links von dir kratzt etwas an Holz.',
    beschreibung: function (api) {
      var tuer = api.eig('kraehentuer', 'verschlossen')
        ? 'Im Westen eine schmale Tür, von außen mit einem schweren Eisenriegel verschlossen. Über den Spalt zwischen Tür und Rahmen ist rotes Siegelwachs gestrichen.'
        : 'Im Westen steht die schmale Tür ' + (api.eig('kraehentuer', 'offen') ? 'offen' : 'angelehnt') + ', das rote Siegel ist gebrochen.';
      return 'Eine schmale Diele mit schwarz-weißen Steinfliesen wie ein Schachbrett. An der Wand eine Reihe Garderobenhaken, alle leer bis auf einen. ' +
        'Im Norden die Hintertür zum Garten – von innen mit Brettern vernagelt, die Nägel sind neu. ' + tuer + ' Im Osten geht es zurück in den Flur.';
    },
    kurz: function (api) { return 'Die Hinterdiele mit den Schachbrettfliesen. Norden: die vernagelte Hintertür. Westen: die schmale Tür' + (api.eig('kraehentuer', 'verschlossen') ? ' mit dem Riegel' : '') + '. Osten: Flur.'; },
    riechen: 'Kalter Stein. Und von der schmalen Tür her: getrocknete Kräuter, Rosmarin vielleicht, und etwas Süßliches darunter.',
    horchen: { tag: 'Draußen im Garten Krähen. Drinnen nichts.', nacht: 'Hinter der schmalen Tür knarrt etwas, gleichmäßig. Vor, zurück. Vor, zurück.' },
    ausgaenge: {
      osten: 'flur',
      westen: { ziel: 'dienstbotenzimmer', tuer: 'kraehentuer' },
      norden: { sperre: 'Die Hintertür ist mit drei Brettern vernagelt. Carsten wollte offenbar nicht, dass hier jemand hereinkommt. Oder hinaus.' }
    },
    vorschlaege: function (api) { return api.eig('kraehentuer', 'verschlossen') ? ['untersuche riegel', 'schiebe riegel'] : ['geh nach westen']; },
    details: [
      { nomen: 'Hintertür', genus: 'f', woerter: ['hintertuer', 'gartentuer', 'bretter', 'brett', 'naegel'], text: 'Eine Tür mit einem kleinen Fenster. Quer darüber drei rohe Bretter, mit glänzenden neuen Nägeln festgeschlagen. Zwischen den Brettern siehst du ein Stück verwilderten Garten.', zerbrechen: 'Die Bretter sitzen bombenfest. Carsten hat gründlich gearbeitet.' },
      { nomen: 'Mantel', genus: 'm', adj: ['schwarz'], woerter: ['mantel', 'garderobe', 'haken', 'garderobenhaken', 'damenmantel'], text: 'An einem der Haken hängt ein langer, schwarzer Damenmantel mit hohem Kragen, viel älter als alles andere im Haus. Die Taschen sind leer.', riechen: 'Lavendel. Und Mottenpulver.', tasten: 'Schwerer Wollstoff, innen noch warm. Als hätte ihn eben noch jemand getragen.' },
      { nomen: 'Fliesen', genus: 'pl', woerter: ['fliesen', 'boden', 'schachbrett'], text: 'Schwarz und weiß, abgetreten. Vor der schmalen Tür sind die Fliesen heller, als hätte dort lange niemand gestanden.' }
    ]
  });

  HG.ding('kraehentuer', {
    nomen: 'Tür', genus: 'f', adj: ['schmal'],
    woerter: ['tuer', 'kammertuer', 'dienstbotentuer', 'westtuer'],
    tuer: true, orte: ['hinterdiele', 'dienstbotenzimmer'],
    oeffenbar: true, offen: false, verschlossen: true,
    beschreibung: function (api) {
      if (api.raum() === 'dienstbotenzimmer') return 'Die schmale Tür zur Hinterdiele. Von innen hat sie weder Klinke noch Riegel – nur einen Knauf, der sich lose dreht.';
      return api.eig('kraehentuer', 'verschlossen')
        ? 'Eine schmale Tür aus einfachem Holz, eine Dienstbotentür. Ein schwerer Eisenriegel ist von außen vorgeschoben – wer hier drin war, sollte drin bleiben. Über dem Spalt zum Rahmen klebt rotes Siegelwachs.'
        : 'Die schmale Tür. Das Siegelwachs ist gebrochen, der Riegel zurückgeschoben.';
    },
    texte: {
      verschlossen: 'Die Tür rührt sich nicht. Ein Eisenriegel hält sie von außen zu.',
      oeffnen: 'Die Tür schwingt nach innen. Kräuterduft schlägt dir entgegen – und Kälte.'
    },
    tipps: { verschlossen: {
      2: 'Der Riegel ist vorgeschoben. Vielleicht lässt er sich zurückschieben.',
      3: function (api) { return api.istNacht() ? 'Schieb den Riegel zurück. <span class="nebenbei">(„schiebe riegel“)</span>' : 'Schieb den Riegel zurück – wenn der Rost es zulässt. <span class="nebenbei">(„schiebe riegel“)</span>'; }
    } },
    horchen: { tag: 'Stille.', nacht: 'Ein Knarren, gleichmäßig, vor und zurück. Wie ein Schaukelstuhl.' },
    klopfen: { tag: 'Hohl. Dahinter ein kleiner Raum.', nacht: 'Du klopfst. Das Knarren dahinter hört auf.' }
  });

  // --- Der Riegel (Rätsel) --------------------------------------------------
  function riegelAuf(api, text) {
    api.setze('kraehentuer', 'verschlossen', false);
    api.setze('riegel', 'offen', true);
    api.sound('riegel');
    api.sage(text + ' Das rote Siegelwachs über dem Türspalt bricht mit einem trockenen Knacken. In den Bruchstücken erkennst du zwei Buchstaben, sauber in das Wachs gedrückt: <b>E. G.</b>');
    api.hinweis('elisabeths_siegel');
  }
  var RIEGEL_TIPPS = {
    2: 'Der Riegel ist braun vor Rost. Mit Gewalt vielleicht – oder mit etwas, das den Rost löst.',
    3: function (api) {
      if (api.traegt('oelkanne')) return 'Du hast doch das Ölkännchen. <span class="nebenbei">(„öle riegel“, dann „schiebe riegel“)</span>';
      return (api.kennt('oelkanne') ? 'Das Ölkännchen aus der Speisekammer würde den Rost lösen.' : 'Öl würde helfen – sieh dich in den Wirtschaftsräumen hier unten um.') + ' Oder du versuchst es mit Werkzeug oder roher Kraft („reiß am riegel“). Und nachts … bewegt sich in diesem Haus manches leichter.';
    }
  };
  function schiebeRiegel(api) {
    if (!api.eig('kraehentuer', 'verschlossen')) { api.sage('Der Riegel ist schon zurückgeschoben.'); return true; }
    if (api.istNacht()) {
      riegelAuf(api, 'Du legst die Hand an den Riegel – und er gleitet zurück, leicht und lautlos, als hätte ihn jemand frisch geölt. Der Rost ist fort. Vorhin war er noch da.');
      api.nervenProbe('0/1W3', { grund: 'der Riegel', gewoehnung: 'riegel_nachts' });
      return true;
    }
    if (api.eig('riegel', 'geoelt')) { riegelAuf(api, 'Das Öl hat gewirkt. Mit einem rostigen Kreischen gleitet der Riegel zurück.'); return true; }
    api.sage('Du stemmst dich gegen den Riegel. Er rührt sich keinen Millimeter – festgerostet, seit Jahrzehnten.');
    api.fehlversuch('riegel', RIEGEL_TIPPS);
    return true;
  }
  function riegelGewalt(api) {
    if (!api.eig('kraehentuer', 'verschlossen')) { api.sage('Der Riegel ist schon offen.'); return true; }
    if (api.istNacht() || api.eig('riegel', 'geoelt')) return schiebeRiegel(api);
    var n = api.zaehle('riegel_gewalt');
    var e = api.probe('st', { mod: -20 + Math.min(20, (n - 1) * 10), modGrund: 'festgerostet' + (n > 1 ? ', schon gelockert' : ''), grund: 'Riegel losreißen' });
    if (e.erfolg) {
      riegelAuf(api, 'Du reißt mit aller Kraft. Der Rost bricht, der Riegel fährt mit einem Knall zurück, der durch das ganze Haus hallt.');
      api.sage('Danach ist es still. Zu still. Irgendwo im Haus fällt eine Tür ins Schloss, als hätte jemand gehört, was du getan hast.');
      api.nervenProbe('0/1W3', { grund: 'das Haus hat es gehört' });
      return true;
    }
    if (e.patzer) { api.sage('Deine Hand rutscht ab und schrammt über das rostige Eisen.'); api.verletze('1', { grund: 'Rost' }); }
    else api.sage('Der Riegel ächzt, aber er hält. ' + (n < 3 ? 'Ein Stück hat er nachgegeben.' : 'Der Rost bröckelt schon.'));
    api.fehlversuch('riegel', RIEGEL_TIPPS);
    return true;
  }
  function riegelWerkzeug(api, ctx) {
    var w = ctx.obj2 && ctx.obj2 !== 'riegel' ? ctx.obj2 : (ctx.obj !== 'riegel' ? ctx.obj : null);
    if (w && HG.daten.dinge[w].oel) return oele(api);
    if (!w || !HG.daten.dinge[w].werkzeug) { api.sage('Womit? Du bräuchtest Werkzeug, um den Rost zu lösen – oder Öl.'); return true; }
    if (!api.traegt(w)) { api.sage('Dafür musst du ' + api.der(w, 'akk') + ' in der Hand haben.'); return true; }
    if (!api.eig('kraehentuer', 'verschlossen') || api.istNacht() || api.eig('riegel', 'geoelt')) return schiebeRiegel(api);
    var e = api.probe('handwerk', { mod: HG.daten.dinge[w].werkzeug >= 2 ? 10 : -10, modGrund: HG.daten.dinge[w].werkzeug >= 2 ? 'gutes Werkzeug' : 'grobes Werkzeug', grund: 'Rost lösen' });
    if (e.erfolg) { api.setze('riegel', 'geoelt', true); api.sage('Du kratzt den Rost aus der Führung, Krümel um Krümel. Jetzt sitzt der Riegel lockerer.'); return schiebeRiegel(api); }
    api.sage('Der Rost sitzt zu tief. Du schabst eine Weile, ohne dass sich etwas tut.');
    api.fehlversuch('riegel', RIEGEL_TIPPS);
    return true;
  }
  function oele(api) {
    if (!api.eig('kraehentuer', 'verschlossen')) { api.sage('Der Riegel ist schon offen.'); return true; }
    if (!api.traegt('oelkanne')) { api.sage('Du hast nichts, womit du den Riegel ölen könntest.'); return true; }
    if (api.eig('riegel', 'geoelt')) { api.sage('Der Riegel glänzt schon vor Öl.'); return true; }
    api.setze('riegel', 'geoelt', true);
    api.sage('Du drückst das Ölkännchen, bis ein dünner Strahl in die Führung des Riegels läuft. Das Öl frisst sich braun schäumend in den Rost. Ein paar Minuten, dann müsste er sich bewegen lassen.');
    return true;
  }

  HG.ding('riegel', {
    nomen: 'Riegel', genus: 'm', adj: ['rostig'],
    woerter: ['riegel', 'eisenriegel', 'schieberiegel', 'rost'], adjektive: ['eisern', 'schwer'],
    ort: 'hinterdiele', fest: true, szenerie: true,
    beschreibung: function (api) {
      if (!api.eig('kraehentuer', 'verschlossen')) return 'Ein schwerer Eisenriegel, zurückgeschoben.';
      if (api.istNacht()) return 'Ein schwerer Eisenriegel, vorgeschoben. Im Licht sieht er seltsam glatt aus, beinahe blank.';
      return 'Ein schwerer Eisenriegel, vorgeschoben und braun vor Rost. Er sieht aus, als hätte ihn seit hundert Jahren niemand bewegt.' + (api.eig('riegel', 'geoelt') ? ' Öl glänzt in der Führung.' : '');
    },
    tasten: function (api) { return api.istNacht() ? 'Glatt und kalt. Kein Rost. Am Tag war da Rost, ganz sicher.' : 'Rau vor Rost. Er sitzt bombenfest.'; },
    bei: {
      schieben: schiebeRiegel, ziehen: schiebeRiegel, oeffnen: schiebeRiegel, druecken: schiebeRiegel,
      oelen: function (api) { return oele(api); },
      reissen: riegelGewalt, zerbrechen: riegelGewalt,
      knacken: riegelWerkzeug, benutzen: riegelWerkzeug
    }
  });

  HG.ding('siegel', {
    nomen: 'Siegelwachs', genus: 'n', adj: ['rot'],
    woerter: ['siegelwachs', 'siegel', 'wachs', 'initialen'],
    ort: 'hinterdiele', fest: true, szenerie: true,
    beschreibung: function (api) {
      return api.eig('kraehentuer', 'verschlossen')
        ? 'Rotes Siegelwachs, dick über den Spalt zwischen Tür und Rahmen gestrichen. In der Mitte ist ein Siegel eingedrückt, ein verschlungenes Monogramm: <b>E. G.</b> Das Wachs ist alt und spröde.'
        : 'Die Reste des roten Siegels. Auf zwei Bruchstücken noch die Initialen: E. G.';
    },
    bei: { untersuchen: function (api) { if (api.eig('kraehentuer', 'verschlossen')) api.hinweis('elisabeths_siegel'); return false; } },
    zerbrechen: 'Das Siegel bricht ohnehin, sobald jemand die Tür öffnet. Erst muss der Riegel zurück.'
  });

  // ===================================================================
  // DIENSTBOTENZIMMER – ab 1908 das Zimmer der Krähe (Strang C)
  // ===================================================================
  HG.raum('dienstbotenzimmer', {
    name: 'Dienstbotenzimmer',
    woerter: ['dienstbotenzimmer', 'kammer', 'maedchenzimmer', 'pflegerzimmer'],
    schauplatz: 'haus', karte: { x: -2, y: -1 },
    dunkel: dunkelDraussen,
    dunkelText: 'Stockfinster. Es riecht nach Kräutern. Ganz nah knarrt etwas, vor und zurück.',
    beschreibung: function (api) {
      return 'Eine schmale Kammer mit einem einzigen Fenster nach Norden, das Glas blind vor Schmutz. Ein eisernes Bettgestell ohne Matratze, ein Waschtisch mit Krug und Schüssel, in der Ecke ein Schaukelstuhl aus dunklem Holz. ' +
        'An der Wand über dem Waschtisch ein heller, rechteckiger Fleck, wo einmal ein Spiegel hing; der Nagel steckt noch. Auf den Dielen, auf dem Bettgestell, auf der Fensterbank: schwarze Federn. ' +
        (api.istNacht() ? 'Im schwarzen Fensterglas siehst du dein Licht – und den Schaukelstuhl hinter dir. ' : '') + 'Im Osten führt die Tür zurück in die Hinterdiele.';
    },
    kurz: 'Die Kammer mit dem Bettgestell, dem Waschtisch und dem Schaukelstuhl. Überall schwarze Federn. Osten: Hinterdiele.',
    riechen: 'Getrocknete Kräuter – Rosmarin, Wermut, etwas Bitteres. Und darunter etwas Süßes, Verdorbenes, wie altes Blut.',
    horchen: { tag: 'Krähen auf dem Dach. Sehr viele.', nacht: 'Der Schaukelstuhl knarrt. Er knarrt, auch wenn du ihn ansiehst.' },
    ausgaenge: { osten: { ziel: 'hinterdiele', tuer: 'kraehentuer' } },
    beimBetreten: function (api, info) { if (info.erstesMal) api.sage('Du bleibst auf der Schwelle stehen. Dieses Zimmer ist seit langer Zeit niemandes Zimmer gewesen. Und doch hast du das Gefühl, dass du störst.'); },
    vorschlaege: ['untersuche waschtisch', 'untersuche dielen', 'untersuche schaukelstuhl'],
    details: [
      { nomen: 'Bettgestell', genus: 'n', woerter: ['bett', 'bettgestell', 'eisenbett'], text: 'Ein schmales Eisenbett ohne Matratze. Am Kopfende sind Kerben ins Metall gekratzt, viele, in Reihen zu zwölf.', klettern: 'Du setzt dich auf das Gestell. Das Eisen ist kalt wie ein Grabgitter.' },
      { nomen: 'Federn', genus: 'pl', adj: ['schwarz'], woerter: ['federn', 'feder', 'kraehenfedern'], text: 'Schwarze Federn, glänzend, als wären sie gestern ausgefallen. Krähenfedern. Das Fenster ist geschlossen.' },
      { nomen: 'Fenster', genus: 'n', woerter: ['fenster', 'scheibe', 'glas', 'fensterbank'], text: { tag: 'Blindes Glas. Draußen nur grauer Schemen: der Garten.', nacht: 'Schwarzes Glas, in dem dein Licht schwimmt. Und hinter dir, im Glas, der Schaukelstuhl.' } },
      { nomen: 'Fleck', genus: 'm', adj: ['hell'], woerter: ['fleck', 'nagel', 'spiegelfleck'], text: 'Ein heller Rechteck auf der Tapete, wo ein Spiegel gehangen haben muss, mittelgroß, oval. Wer immer ihn abgenommen hat, hat ihn mitgenommen.' }
    ]
  });

  HG.ding('schaukelstuhl', {
    nomen: 'Schaukelstuhl', genus: 'm', adj: ['dunkel'],
    woerter: ['schaukelstuhl', 'stuhl', 'schaukel'],
    ort: 'dienstbotenzimmer', fest: 'Der Schaukelstuhl bleibt hier. Du willst ihn nicht anfassen.', szenerie: true,
    beschreibung: function (api) {
      return 'Ein Schaukelstuhl aus dunklem, fast schwarzem Holz, das Sitzgeflecht durchgesessen. Auf der Lehne liegen zwei schwarze Federn, sauber nebeneinander.' + (api.istNacht() ? ' Er bewegt sich. Ganz leicht.' : '');
    },
    klettern: 'Du setzt dich nicht. Du weißt nicht, warum, aber du setzt dich nicht.',
    tasten: 'Das Holz ist warm.'
  });

  HG.ding('waschtisch', {
    nomen: 'Waschtisch', genus: 'm',
    woerter: ['waschtisch', 'krug', 'schuessel', 'waschschuessel'],
    ort: 'dienstbotenzimmer', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein Waschtisch mit einer Marmorplatte, darauf ein Krug und eine Schüssel aus weißem Porzellan. In der Schüssel ein brauner Rand, wo einmal etwas Dunkleres als Wasser eingetrocknet ist.'
  });

  // Gebetbuch der Pflegerin – Spiegelschrift
  var SPIEGELSCHRIFT = '<i>(Zwischen den durchgestrichenen Gebeten, in winziger, spitzer Schrift:)</i><br><br>' +
    'Neumond. Wieder ein Vogel. Er hört schon.<br><br>' +
    'Die Herrin schläft, und was in ihr krank ist, schläft mit ihr. Solange ich wache.<br><br>' +
    'Noch zehn Winter. Jeden Monat ein Leben. Dann ist die Tür unter dem Haus weit genug, und Er kommt hindurch.<br><br>' +
    // Reihenfolge des Kreises im Ritualraum (keller.js): Osten, Süden, Westen, Norden – geschlossen wird rückwärts
    'Kohle, wo Er aufgeht. Knochen, wo Er am höchsten steht. Blut, wo Er versinkt. Und zuletzt Sein Name, wo Er niemals ist.<br><br>' +
    'Sie wird Ihm gehören. Oder keinem.';
  // Ist dieses Ding ein Spiegel, vor den man das Buch halten kann? (Taschenspiegel, Flurspiegel, nachts das Fenster …)
  function istSpiegel(api, id) {
    if (!id || id === 'gebetbuch') return false;
    if (id === 'taschenspiegel') return true;
    var d = HG.daten.dinge[id];
    return !!(d && HG.wert(d.spiegel, api)) || HG.macht.spiegelHier('klein') === id;
  }
  // „benutze taschenspiegel mit gebetbuch“ (oder umgekehrt, auch „kombiniere …“). Lesen allein nimmt
  // keinen Spiegel mehr von selbst – man muss ihn gezielt benutzen (David, 24.11.2026).
  function mitSpiegel(api, ctx) {
    var sp = ctx.obj === 'gebetbuch' ? ctx.obj2 : ctx.obj;
    if (!ctx.obj2 || !istSpiegel(api, sp)) return false;
    if (!api.hell()) { api.sage('Es ist zu dunkel zum Lesen.'); return true; }
    api.sage(sp === 'taschenspiegel'
      ? 'Du hältst den Taschenspiegel schräg über die Seite. Im kleinen runden Glas drehen sich die Buchstaben um und werden lesbar. Am Rand des Spiegels, ganz kurz, ein Auge, das nicht deins ist.'
      : 'Du hältst das Gebetbuch vor ' + api.der(sp, 'akk') + '. Im Glas drehen sich die Buchstaben um und werden lesbar – und hinter deinem Spiegelbild ist es dunkler, als es sein dürfte.');
    api.nervenProbe('0/1W3', { grund: 'Blick in den Spiegel', gewoehnung: 'spiegelschrift' });
    return leseSpiegelschrift(api);
  }
  function leseSpiegelschrift(api) {
    api.setzeFlag('spiegelschrift_gelesen');
    api.schrift(SPIEGELSCHRIFT, 'hand');
    api.hinweis('kraehe_gebetbuch');
    return true;
  }
  HG.ding('gebetbuch', {
    nomen: 'Gebetbuch', genus: 'n', adj: ['abgegriffen'],
    woerter: ['gebetbuch', 'gebetsbuch', 'buch', 'buechlein', 'gesangbuch', 'spiegelschrift', 'schrift'], adjektive: ['schwarz', 'klein'],
    ort: 'waschtisch', rel: 'auf',
    beschreibung: 'Ein kleines, abgegriffenes Gebetbuch mit schwarzem Einband. Die gedruckten Gebete sind sorgfältig durchgestrichen, Zeile für Zeile. Dazwischen hat jemand in winziger, spitzer Schrift geschrieben – spiegelverkehrt.',
    riechen: 'Wermut und Wachs.',
    lesen: true,   // erscheint im Lies-Menü (lesbar mit einem Spiegel – siehe mitSpiegel – oder per Probe)
    dauer: { lesen: 5, benutzen: 5, kombinieren: 5 },
    bei: {
      benutzen: mitSpiegel,
      kombinieren: mitSpiegel,
      lesen: function (api) {
        if (!api.hell()) { api.sage('Es ist zu dunkel zum Lesen.'); return true; }
        if (api.flag('spiegelschrift_gelesen')) return leseSpiegelschrift(api);
        var e = api.probe('ve', { mod: -20, modGrund: 'spiegelverkehrt', grund: 'Spiegelschrift entziffern' });
        if (e.erfolg) {
          api.setzeFlag('spiegelschrift_entziffert');
          api.sage('Buchstabe für Buchstabe drehst du die Schrift im Kopf um. Es dauert, und deine Augen brennen – aber es geht.');
          return leseSpiegelschrift(api);
        }
        api.sage('Spiegelverkehrt und winzig. Die Buchstaben tanzen dir vor den Augen. Mit einem Spiegel wäre es leicht.');
        api.fehlversuch('gebetbuch', {
          2: 'Spiegelschrift liest man am besten in einem Spiegel. Hier hing einmal einer – jetzt nicht mehr.',
          3: function (api2) {
            return api2.traegt('taschenspiegel') ? 'Halt den Taschenspiegel daneben. <span class="nebenbei">(„benutze taschenspiegel mit gebetbuch“)</span>'
              : 'Nimm das Gebetbuch mit zu einem Spiegel – dem großen im Flur, dem kleinen im Gäste-WC' + (api2.kennt('taschenspiegel') ? ' – oder hol den Taschenspiegel' : '') + '. <span class="nebenbei">(„benutze spiegel mit gebetbuch“)</span>';
          }
        });
        return true;
      }
    }
  });

  // Unter einer losen Diele: Zigarrenkiste mit Vogelschädeln (die monatlichen Opfer, Spielbibel Zeitleiste 1919–1929)
  HG.ding('lose_diele', {
    nomen: 'Dielen', genus: 'pl', woerter: ['dielen', 'diele', 'boden', 'fussboden', 'bodenbrett'], adjektive: ['lose', 'locker'],
    ort: 'dienstbotenzimmer', fest: true, szenerie: true, anhebbar: true,
    beschreibung: function (api) {
      return 'Breite, dunkle Dielen voller Federn.' + (api.eig('vogelkiste', 'versteckt') ? ' Unter dem Bett liegt eine Diele ein wenig höher als die anderen; die Nägel fehlen.' : ' Eine Diele unter dem Bett ist herausgehoben.');
    },
    tasten: function (api) { return api.eig('vogelkiste', 'versteckt') ? 'Unter dem Bett gibt eine Diele nach, wenn du drückst. Darunter ist es hohl.' : 'Raue Dielen, Federn.'; }
  });
  HG.ding('vogelkiste', {
    nomen: 'Zigarrenkiste', genus: 'f', adj: ['alt'],
    woerter: ['zigarrenkiste', 'kiste', 'kistchen', 'schaedel', 'vogelschaedel', 'knochen', 'striche'],
    ort: 'dienstbotenzimmer',
    fest: 'Du willst sie nicht mitnehmen. Du willst sie eigentlich nicht einmal anfassen.',
    versteckt: {
      bei: 'lose_diele', wie: ['anheben', 'unter', 'durchsuchen', 'tasten', 'schieben', 'ziehen'],
      andeutung: ['hohl', 'locker', 'lose'],
      text: 'Du hebst die lose Diele an. Darunter, zwischen den Balken, liegt eine flache Zigarrenkiste.'
    },
    beschreibung: 'Eine alte Zigarrenkiste. Darin, sauber in Reihen gebettet auf schwarzen Federn: winzige Vogelschädel. Dutzende. Auf der Innenseite des Deckels Striche, in Zwölferblöcken – du zählst zehn volle Blöcke und einen angefangenen.',
    riechen: 'Moder und Wermut.',
    foto: 'Auf dem Foto sind die Schädel nicht in Reihen geordnet. Sie liegen im Kreis, und alle schauen zur Kamera.',
    hinweis: 'vogelschaedel', hinweisBei: 'untersuchen'
  });

  // ===================================================================
  // ANRICHTE mit Gäste-WC
  // ===================================================================
  HG.raum('anrichte', {
    name: 'Anrichte',
    woerter: ['anrichte', 'wc', 'gaestewc', 'toilette', 'klo'],
    schauplatz: 'haus', karte: { x: 1, y: -1 },
    dunkel: dunkelDraussen,
    dunkelText: 'Stockfinster. Irgendwo tropft Wasser in ein Becken. Tropf. Tropf.',
    beschreibung: function (api) {
      return 'Ein schmaler Raum zwischen Flur und Küche. Wandschränke bis unter die Decke, eine Marmorplatte zum Anrichten, an der Wand eine Messingglocke an einer Feder. ' +
        'In der Nordwand eine Schiebetür, viel neuer als alles andere: das später eingebaute Gäste-WC mit einem kleinen Waschbecken. Über dem Waschbecken hängt ein Spiegel – ' +
        (api.eig('wc_handtuch', 'ab') ? 'unverhängt.' : 'jemand hat ein Handtuch darübergehängt und mit Reißzwecken festgesteckt.') +
        ' Im Westen der Flur, im Osten die Küche.';
    },
    kurz: function (api) { return 'Die Anrichte mit den Wandschränken und dem Gäste-WC. Der Spiegel über dem Waschbecken ist ' + (api.eig('wc_handtuch', 'ab') ? 'unverhängt' : 'mit einem Handtuch verhängt') + '. Westen: Flur, Osten: Küche.'; },
    horchen: 'Ein Tropfen fällt ins Waschbecken. Dann lange nichts. Dann noch einer.',
    riechen: 'Feuchtigkeit, Seife. Ein altes Stück Lavendelseife liegt am Waschbecken.',
    ausgaenge: { westen: 'flur', osten: 'kueche' },
    details: [
      { nomen: 'Wandschränke', genus: 'pl', woerter: ['wandschraenke', 'schraenke', 'schrank', 'geschirr', 'silber'], text: 'Glastüren, dahinter Geschirr mit Goldrand, ordentlich gestapelt. Auf jedem Teller dasselbe Monogramm: ein verschlungenes E und G.' },
      { nomen: 'Waschbecken', genus: 'n', woerter: ['waschbecken', 'becken', 'wasserhahn', 'hahn', 'seife', 'lavendelseife', 'schiebetuer'], text: 'Ein kleines Waschbecken, der Hahn tropft. Daneben ein ausgetrocknetes Stück Lavendelseife.', riechen: 'Lavendel.' },
      // Kein Klingelzug: Hier läutet es, wenn oben jemand zieht – die Dienstboten waren ja in der Anrichte (David, 24.11.2026)
      { nomen: 'Glocke', genus: 'f', adj: ['messingfarben'], woerter: ['glocke', 'messingglocke', 'klingel', 'feder', 'band', 'klingelzug', 'zug'],
        text: 'Eine Glocke aus Messing an einer gebogenen Stahlfeder, darunter hängt ein verblichenes Band. Ein Draht führt aus ihr in die Wand und nach oben. Wenn in einem der Zimmer jemand am Klingelzug zog, schlug sie hier an – damit man es auch in der Anrichte hörte, nicht nur in der Küche. Ziehen kann man hier nichts; rufen konnten nur die anderen.',
        bei: {
          ziehen: function (api) { api.sage('Du ziehst an dem Band. Die Glocke schlägt einmal an, hell und dünn, und die Feder zittert lange nach. Niemand kommt. Wer sollte auch – gerufen wurde immer von oben.'); return true; },
          klopfen: function (api) { api.sage('Du stößt die Glocke mit dem Finger an. Ein heller, dünner Ton, der viel zu lange im Raum hängt.'); return true; },
          druecken: function (api) { api.sage('Du drückst die Glocke zur Seite. Die Feder federt zurück, die Glocke schlägt leise an.'); return true; }
        } }
    ]
  });

  // Der verhängte Spiegel – Carsten hat dahinter den Schlüssel zum Wintergarten versteckt
  // („da, wo ich nicht mehr hinsehe“, Zettel am Kühlschrank). Wer das Handtuch abnimmt, muss hineinsehen.
  HG.ding('wc_spiegel', {
    nomen: 'Spiegel', genus: 'm', adj: ['klein'],
    woerter: ['spiegel', 'wcspiegel', 'badspiegel', 'spiegelglas'], adjektive: ['verhaengt'],
    ort: 'anrichte', szenerie: true,
    fest: 'Der Spiegel hängt an einem Nagel. Abnehmen könntest du ihn.',
    spiegel: function (api) { return api.eig('wc_handtuch', 'ab') ? 'klein' : null; },   // verhängt = kein Portal
    beschreibung: function (api) {
      if (!api.eig('wc_handtuch', 'ab')) return 'Ein kleiner Spiegel über dem Waschbecken, kaum größer als ein Buch. Ein Handtuch ist darübergehängt und an allen vier Ecken mit Reißzwecken festgesteckt. Sorgfältig. Ängstlich.';
      return 'Ein kleiner Spiegel über dem Waschbecken. Das Glas ist fleckig. Dein Gesicht darin sieht müde aus.' + (api.eig('wg_schluessel', 'versteckt') ? ' Der Spiegel hängt nicht ganz gerade an seinem Nagel.' : '');
    },
    texte: { abnehmen: 'Du hebst den Spiegel vom Nagel, siehst nach, hängst ihn zurück. Dahinter ist nichts mehr.' },
    bei: {
      hineinschauen: function (api) {
        if (!api.eig('wc_handtuch', 'ab')) { api.sage('Du siehst nur das Handtuch, das darüberhängt.'); return true; }
        api.sage('Dein Gesicht. Die Fliesen hinter dir. Und für den Bruchteil einer Sekunde, ganz am Rand, ein zweites Gesicht, das sich zurückzieht, als du hinsiehst.');
        api.nervenProbe('0/1W3', { grund: 'Blick in den Spiegel', gewoehnung: 'wc_spiegel' });
        return true;
      },
      untersuchen: function (api, ctx) { if (ctx.reflexiv) return HG.daten.dinge.wc_spiegel.bei.hineinschauen(api, ctx); return false; }
    }
  });
  HG.ding('wc_handtuch', {
    nomen: 'Handtuch', genus: 'n', adj: ['grau'],
    woerter: ['handtuch', 'tuch', 'reisszwecken', 'reisszwecke'],
    ort: 'anrichte', szenerie: true,
    fest: 'Das Handtuch lässt du hier.',
    beschreibung: function (api) {
      if (api.eig('wc_handtuch', 'ab')) return 'Ein graues Handtuch, zusammengeknüllt im Waschbecken.';
      return 'Ein graues Frotteehandtuch, mit vier Reißzwecken über dem Spiegel festgesteckt. Carsten wollte offenbar nicht hineinsehen.' +
        (api.flag('handtuch_gesicht') ? ' Es hängt ganz flach und still. Wenn du wissen willst, was darunter ist, musst du dich überwinden und es noch einmal versuchen.' : '');
    },
    bei: {
      nehmen: abHandtuch, abnehmen: abHandtuch, reissen: abHandtuch, ziehen: abHandtuch, schieben: abHandtuch
    }
  });
  function abHandtuch(api) {
    if (api.eig('wc_handtuch', 'ab')) { api.sage('Das Handtuch ist schon ab.'); return true; }
    // Erster Versuch: das Gesicht im Handtuch (Bild raum-anrichte-spuk) – man zuckt zurück (David, 24.11.2026)
    if (!api.flag('handtuch_gesicht')) {
      api.setzeFlag('handtuch_gesicht');
      api.zeigeBild('spuk');
      api.sound('spuk-anrichte_spiegel');
      api.sage('Du greifst nach der ersten Reißzwecke. Da wölbt sich das Handtuch dir entgegen. Unter dem grauen Frottee drückt sich etwas nach vorn – eine Stirn, eine Nase, eingefallene Wangen, ein Mund, der sich öffnet. Ein Gesicht, eine Handbreit vor deinen Fingern.');
      api.nervenProbe('1/1W6', { grund: 'Gesicht im Handtuch' });
      api.sage('Du reißt die Hand zurück. Das Tuch fällt flach. Nur ein Handtuch über einem kleinen Spiegel. Carsten hat es nicht ohne Grund festgesteckt. Du willst es nicht noch einmal anfassen.');
      return true;
    }
    api.setze('wc_handtuch', 'ab', true);
    api.sage('Du nimmst all deinen Mut zusammen und greifst zu, schnell, bevor du es dir anders überlegst. Das Tuch ist nur Stoff, kühl und ein wenig feucht. Du ziehst die Reißzwecken heraus. Das Handtuch rutscht ins Waschbecken – und du siehst in den Spiegel, ob du willst oder nicht. Dein Gesicht. Und hinter dir, im dunklen Rechteck der Tür, eine Gestalt, die genau so schnell verschwindet, wie du sie bemerkst.');
    api.nervenProbe('1/1W6', { grund: 'unverhängter Spiegel', gewoehnung: 'wc_spiegel' });
    return true;
  }
  HG.ding('wg_schluessel', {
    nomen: 'Schlüssel', genus: 'm', adj: ['klein'], kurzwort: 'wg-schlüssel',
    woerter: ['schluessel', 'wgschluessel', 'wg-schluessel', 'wintergartenschluessel', 'anhaenger', 'klebeband'], adjektive: ['flach'],
    ort: 'anrichte', istSchluessel: true,
    versteckt: {
      bei: 'wc_spiegel', wie: ['hinter', 'abnehmen', 'anheben', 'schieben', 'ziehen', 'tasten', 'drehen'],
      auchBei: { wc_handtuch: ['hinter'] },
      text: 'Du hebst den Spiegel vom Nagel. Auf die Rückseite ist mit Klebeband ein kleiner Schlüssel geklebt, an einem Pappanhänger in Carstens Schrift: <b>WG</b>.'
    },
    beschreibung: 'Ein kleiner Schlüssel für ein Türschloss, an einem Pappanhänger: „WG“. Wintergarten.'
  });

  // ===================================================================
  // KÜCHE
  // ===================================================================
  HG.raum('kueche', {
    name: 'Küche',
    woerter: ['kueche', 'kochkueche'],
    schauplatz: 'haus', karte: { x: 2, y: -1 },
    dunkel: dunkelDraussen,
    dunkelText: 'Stockfinster. Es riecht nach kaltem Ruß. Über der Tür tickt etwas metallisch, wie eine Klappe, die zittert.',
    beschreibung: function (api) {
      return 'Eine große, hohe Küche. Ein gusseiserner Kohleherd, schwarz und kalt, daneben ein Gasherd aus den Fünfzigern mit abgeplatzter Emaille. Ein moderner Kühlschrank steht stumm daneben – kein Strom. ' +
        'Über der Tür hängt ein Klingelkasten aus dunklem Holz mit einer Reihe kleiner Fenster, unter jedem ein Name. Auf dem Küchentisch Carstens Spuren: eine Tasse, ein Stapel ungeöffneter Post, ein Ladekabel ohne Gerät. ' +
        'Im Westen geht es in die Anrichte, im Südwesten in die Speisekammer, im Süden führt eine schmale Dienertür ins Speisezimmer.';
    },
    kurz: 'Die Küche mit Kohleherd, Gasherd, Kühlschrank und Klingelkasten. Westen: Anrichte, Südwesten: Speisekammer, Süden: Speisezimmer.',
    riechen: 'Kalter Ruß. Und ganz schwach, als hätte jemand vor kurzem welchen gekocht: Kaffee.',
    horchen: { tag: 'Der Wasserhahn tropft. Draußen eine Krähe.', nacht: 'Über der Tür zittert eine der kleinen Klappen im Klingelkasten, als käme gleich ein Ruf.' },
    ausgaenge: { westen: 'anrichte', suedwesten: 'speisekammer', sueden: 'speisezimmer' },
    vorschlaege: ['untersuche kühlschrank', 'untersuche klingelkasten', 'öffne schublade'],
    details: [
      { nomen: 'Kohleherd', genus: 'm', woerter: ['kohleherd', 'herd', 'ofen', 'ofenklappe'], text: 'Ein gusseiserner Herd mit Messingstangen. In der Ofenklappe Asche, längst kalt.' },
      { nomen: 'Gasherd', genus: 'm', woerter: ['gasherd', 'gashahn', 'gashaehne', 'haehne', 'brenner'], text: 'Ein weißer Gasherd mit vier Brennern, die Emaille abgeplatzt. Die Gasleitung dahinter ist abgeklemmt, ein Plombenschild hängt daran: „Stillgelegt 1946“.', riechen: 'Nichts. Fast nichts.' },
      { nomen: 'Klingelkasten', genus: 'm', woerter: ['klingelkasten', 'klingeltafel', 'tableau', 'klappen', 'klappe', 'fenster', 'namen'], text: function () { return 'Ein Kasten aus dunklem Holz mit acht kleinen Fenstern. Darunter, in goldener Schrift: Salon · Speisezimmer · Arbeitszimmer · Schlafzimmer · Ankleidezimmer · Bad · Kinderzimmer · Mädchenkammer. Wenn irgendwo im Haus jemand am Klingelzug zieht, fällt hier eine Klappe. ' +
          (HG.zustand.z.flags.klappe_ankleidezimmer ? 'Eine Klappe ist gefallen. Im Fensterchen steht rot: <b>ANKLEIDEZIMMER</b>.' : 'Alle Klappen sind oben.'); },
        bei: {
          druecken: function (api) {
            if (!api.flag('klappe_ankleidezimmer')) { api.sage('Alle Klappen sind oben. Es gibt nichts zurückzustellen.'); return true; }
            api.setzeFlag('klappe_ankleidezimmer', false);
            api.sage('Du drückst die Klappe mit dem Finger hoch. Sie rastet ein. ANKLEIDEZIMMER verschwindet hinter dem kleinen Fenster – für jetzt.');
            return true;
          }
        } },
      { nomen: 'Post', genus: 'f', woerter: ['post', 'briefe', 'stapel', 'werbung', 'rechnungen'], text: 'Werbung, eine Rechnung der Stadtwerke, ein Katalog. Alles an Carsten adressiert, alles ungeöffnet. Der jüngste Poststempel: Anfang Oktober.' },
      { nomen: 'Tasse', genus: 'f', woerter: ['tasse', 'kaffeetasse', 'becher'], text: 'Eine weiße Tasse mit einem braunen Rand. Kaffee. Carsten hat keinen Kaffee getrunken, steht in seinem Tagebuch.', riechen: 'Kaffee. Frischer Kaffee.' }
    ]
  });

  HG.ding('kuehlschrank', {
    nomen: 'Kühlschrank', genus: 'm',
    woerter: ['kuehlschrank', 'eisschrank', 'kuehlschranktuer', 'magnet'],
    ort: 'kueche', fest: true, szenerie: true,
    behaelter: true, oeffenbar: true, offen: false,
    beschreibung: 'Ein moderner Kühlschrank, das Einzige in diesem Raum aus diesem Jahrhundert. An der Tür hält ein Magnet einen Zettel.',
    texte: { oeffnen: 'Du öffnest den Kühlschrank. Kein Licht, kein Summen, nur ein schaler Geruch. Bis auf eine Packung Milch ist er leer.' },
    riechen: 'Saure Milch.'
  });
  HG.ding('kuehlschrankzettel', {
    dokument: true,   // wird fotografiert
    nomen: 'Zettel', genus: 'm', adj: ['gelb'], kurzwort: 'kühlschrankzettel',
    woerter: ['zettel', 'kuehlschrankzettel', 'notiz', 'notizzettel'],
    ort: 'kueche', szenerie: true, schriftart: 'hand',
    beschreibung: 'Ein gelber Notizzettel unter einem Magneten an der Kühlschranktür, in Carstens Schrift, die Buchstaben gedrückt und hastig.',
    lesbar: '<b>Wintergarten ZU LASSEN!!</b><br>Nachts sind die Scheiben wie Spiegel. Alle.<br><br>Schlüssel: da, wo ich nicht mehr hinsehe.<br><i>– C.</i>',
    hinweis: 'carstens_wg_zettel', hinweisBei: 'lesen'
  });

  HG.ding('kuechenschublade', {
    nomen: 'Schublade', genus: 'f', adj: ['breit'],
    woerter: ['schublade', 'kuechenschublade', 'tischschublade', 'lade'],
    ort: 'kueche', fest: true, szenerie: true,
    behaelter: true, oeffenbar: true, offen: false,
    beschreibung: 'Die breite Schublade des Küchentischs.',
    texte: { oeffnen: 'Die Schublade gleitet auf. Besteck, Gummibänder, Batterien.' }
  });

  // ===================================================================
  // SPEISEKAMMER (immer dunkel – kein Fenster)
  // ===================================================================
  HG.raum('speisekammer', {
    name: 'Speisekammer',
    woerter: ['speisekammer', 'vorratskammer', 'kammer'],
    schauplatz: 'haus', karte: { x: 2, y: -2 },
    dunkel: true,
    dunkelText: 'Stockfinster. Kühle Luft, ein Geruch nach Essig und Staub. Etwas hängt von der Decke und streift dein Gesicht.',
    beschreibung: 'Eine fensterlose Kammer, Regale bis unter die Decke. Reihen von Einmachgläsern mit trübem Inhalt, beschriftet in alter Schrift. Von einer Leine unter der Decke hängen Bündel getrockneter Kräuter, und unten auf dem Boden stehen ein paar Dinge, die Carsten hier abgestellt hat: ein Eimer, ein Besen, Putzmittel. Im Nordosten geht es zurück in die Küche.',
    kurz: 'Die fensterlose Speisekammer mit den Einmachgläsern und den Kräuterbündeln. Nordosten: Küche.',
    riechen: 'Essig, Staub – und Lavendel, frisch, als wäre er heute geschnitten.',
    horchen: 'Ganz leise ein Klirren. Glas an Glas.',
    ausgaenge: { nordosten: 'kueche' },
    details: [
      { nomen: 'Einmachgläser', genus: 'pl', woerter: ['einmachglaeser', 'glaeser', 'glas', 'regale', 'regal', 'etiketten', 'birnen'], text: 'Birnen, Bohnen, Kirschen. Die Etiketten sind in alter, verschnörkelter Schrift beschrieben. Das jüngste Datum, das du findest: „Birnen, Herbst 1929“. Der Inhalt ist trüb, aber die Gläser sind noch zu.', lesbar: '„Birnen, Herbst 1929“, „Kirschen 1928“, „Bohnen 1927“ … Niemand hat sie je gegessen.' },
      { nomen: 'Kräuterbündel', genus: 'pl', woerter: ['kraeuterbuendel', 'kraeuter', 'buendel', 'lavendel', 'leine', 'lavendelbuendel'], text: 'Bündel getrockneter Kräuter an einer Leine: Rosmarin, Salbei, Wermut. Und Lavendel – der Lavendel ist nicht trocken. Er ist frisch und duftet, als wäre er heute Morgen geschnitten worden.', riechen: 'Lavendel. So stark, dass dir schwindlig wird.' },
      { nomen: 'Putzsachen', genus: 'pl', woerter: ['putzsachen', 'eimer', 'besen', 'putzmittel', 'lappen'], text: 'Ein Eimer, ein Besen, Scheuermilch, ein Stapel Lappen. Carsten hat hier geputzt. Viel geputzt.' }
    ]
  });
  HG.ding('oelkanne', {
    nomen: 'Ölkännchen', genus: 'n', adj: ['alt'], kurzwort: 'ölkännchen',
    woerter: ['oelkaennchen', 'oelkanne', 'oel', 'kaennchen', 'naehmaschinenoel', 'oeler'], adjektive: ['klein', 'grün'],
    ort: 'speisekammer', oel: true,
    hierText: 'Auf dem untersten Regal steht ein kleines grünes Ölkännchen.',
    beschreibung: 'Ein kleines grünes Blechkännchen mit langer Tülle: „Nähmaschinenöl“. Es ist noch halb voll. Auf dem Boden steht mit Filzstift: <i>I. Hallmann</i>.',
    riechen: 'Maschinenöl.'
  });

})();
