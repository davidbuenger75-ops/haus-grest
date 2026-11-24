// Haus Grest – Inhalt: das Obergeschoss (Spielbibel 4 „Obergeschoss im Spiel“, 8.9)
// Galerie, Elisabeths Krankenzimmer (Plan: Schlafzimmer), Bibliothek, Kinderzimmer mit dem Puppenhaus, Bad,
// Wäschekammer (Plan: Kammer), Gästezimmer. Die Tapetentür zum Spiegelzimmer bleibt zu (Finale).
// Rätsel: „Die unsichtbare Schrift“ (Krankenzimmer), „Ein Buch zu viel“ (Bibliothek), „Bettinas Versteck“
// (Kinderzimmer), „Das schwarze Wasser“ (Bad), „Der Koffer“ (Gästezimmer).
(function () {

  function nacht(api) { return api.istNacht(); }
  function sichtbarSchrift(api) { return !!api.flag('zitronentinte'); }

  // ===================================================================
  // GALERIE (Treppenflur)
  // ===================================================================
  HG.raum('galerie', {
    name: 'Galerie',
    woerter: ['galerie', 'treppenflur', 'obergeschoss', 'og'],
    schauplatz: 'haus', karte: { x: 10, y: 0 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Unter dir, wo die Halle sein muss, ein Abgrund aus Schwärze. Deine Hand findet das Geländer.',
    beschreibung: function (api) {
      return 'Die Galerie umläuft die Halle wie ein Balkon. Über das Geländer siehst du hinunter auf den abgetretenen Teppich – genau auf die Stelle am Fuß der Treppe, an der Natascha Romanow lag. ' +
        'Ein Stück Geländer ist frisch abgeschliffen, das Holz darunter hell wie neu. An der Decke im Norden eine Bodenklappe' + (api.eig('bodenklappe', 'offen') ? ', die offen steht; eine Leiter führt ins Dunkel hinauf' : ' mit einem Eisenring') + '. ' +
        'Zwischen den Türen im Osten ist die Wand mit derselben Tapete beklebt wie überall – nur dass sich unter ihr der Umriss einer Tür abzeichnet.' +
        (api.istNacht() ? ' Durch einen haarfeinen Spalt am Rand dieser Tür fällt kein Licht. Aber es riecht nach Lavendel.' : '') +
        ' Türen: Nordwesten Kinderzimmer, Westen Bibliothek, Norden Bad, Nordosten eine schmale Kammer, Osten Gästezimmer, Südosten das große Schlafzimmer. Die Treppe führt hinunter in die Halle.';
    },
    kurz: 'Die Galerie über der Halle. Nordwesten Kinderzimmer, Westen Bibliothek, Norden Bad, Nordosten Kammer, Osten Gästezimmer, Südosten Schlafzimmer, runter: Halle.',
    horchen: { tag: 'Von unten das Ticken des Hauses. Über dir, hinter der Bodenklappe, ein Scharren – vielleicht Tauben.', nacht: 'Unten in der Halle brummt ein Staubsauger. Er kommt nicht näher und geht nicht weg. Es gibt keinen Strom im Haus.' },
    riechen: 'Frisch geschliffenes Holz. Und vom Rand der Tapetentür: Lavendel.',
    ausgaenge: {
      runter: { ziel: 'halle', gefahr: 'witwe' },
      nordwesten: 'kinderzimmer', westen: 'bibliothek', norden: 'bad', nordosten: 'waeschekammer',
      osten: 'gaestezimmer', suedosten: 'schlafzimmer',
      hoch: { sperre: function (api) {
        if (!api.eig('bodenklappe', 'offen')) return 'Die Bodenklappe ist zu, und der Eisenring hängt gut einen Meter über deinen Fingerspitzen. Du bräuchtest etwas, um ihn zu erreichen.';
        return 'Du setzt den Fuß auf die erste Sprosse. Von oben kommt kalte Luft und ein Geruch nach Staub und altem Papier. <span class="nebenbei">(Der Dachboden ist in dieser Fassung noch nicht gebaut.)</span>';
      } }
    },
    vorschlaege: function (api) {
      var v = ['untersuche tapetentür', 'untersuche geländer'];
      if (!api.eig('bodenklappe', 'offen')) v.push('untersuche bodenklappe');
      return v;
    },
    details: [
      { nomen: 'Geländer', genus: 'n', woerter: ['gelaender', 'handlauf', 'pfosten', 'stelle', 'restaurierung'], text: 'Ein Geländer aus Eiche, geschnitzt mit Lilien. Ein Stück von etwa zwei Metern ist frisch abgeschliffen, säuberlich mit Kreppband abgeklebt – eine Arbeit, die jemand angefangen und nicht beendet hat. Natascha Romanow war Restauratorin.', klettern: 'Du setzt dich auf das Geländer. Unter dir die Halle, viel tiefer als sie sein dürfte. Du steigst schnell wieder herunter.' }
    ]
  });

  HG.ding('spachtel', {
    nomen: 'Spachtel', genus: 'm', adj: ['schmal'], kurzwort: 'spachtel',
    woerter: ['spachtel', 'restauratorenspachtel', 'malerspachtel', 'werkzeug'], klein: true,
    ort: 'galerie',
    beschreibung: 'Ein schmaler Restauratorenspachtel mit abgegriffenem Holzgriff. In den Griff ist ein „N. R.“ eingebrannt. Er lag am Fuß des Geländers, als hätte ihn jemand eben erst hingelegt.',
    texte: { nehmen: 'Du nimmst den Spachtel. Der Griff ist warm, als hätte ihn gerade noch jemand gehalten.' }
  });

  HG.ding('tapetentuer', {
    nomen: 'Tapetentür', genus: 'f', woerter: ['tapetentuer', 'tuer', 'tapete', 'umriss', 'spalt'], adjektive: ['verborgen', 'tapeziert'],
    ort: 'galerie', fest: true, szenerie: true,
    beschreibung: function (api) {
      return 'Eine Tür, die keine sein soll: bündig in die Wand gesetzt und mit derselben Tapete beklebt, nur am Rand verrät ein feiner Schnitt ihren Umriss. Kein Griff, kein Schloss. Auf Bernwards Plan liegt dahinter das Ankleidezimmer.' +
        (api.istNacht() ? ' Jetzt, in der Nacht, steht sie einen haarfeinen Spalt offen. Dahinter ist es nicht dunkel. Dahinter ist es grau, wie Licht in einem Spiegel.' : ' Sie ist zu, und sie gibt nicht einen Millimeter nach.');
    },
    texte: {
      oeffnen: 'Du drückst dagegen, stemmst die Schulter hinein. Die Tür sitzt fest, als wäre sie von innen verriegelt. Genau wie 1974, als Hallmann davorstand.',
      zerbrechen: 'Du wirfst dich dagegen. Es ist, als hieltest du die Schulter an eine Mauer. Nicht jetzt. Nicht so.',
      ziehen: 'Es gibt keinen Griff, an dem du ziehen könntest.',
      horchen: 'Dahinter ist es still. Dann, ganz leise, wie aus großer Ferne: jemand, der vor sich hin summt.'
    },
    bei: {
      klopfen: function (api) {
        api.sage('Du klopfst. Einmal, zweimal. Stille. Dann klopft es von drinnen zurück – dreimal, langsam, genau an der Stelle, an der deine Knöchel das Holz berührt haben.');
        api.nervenProbe('0/1W3', { grund: 'Klopfen', gewoehnung: 'tapetentuer_klopfen' });
        return true;
      }
    }
  });

  HG.ding('bodenklappe', {
    nomen: 'Bodenklappe', genus: 'f', woerter: ['bodenklappe', 'klappe', 'luke', 'dachluke', 'ring', 'eisenring', 'decke'],
    ort: 'galerie', fest: true, szenerie: true, oeffenbar: true, offen: false,
    beschreibung: function (api) {
      return api.eig('bodenklappe', 'offen') ? 'Die Bodenklappe ist heruntergeklappt, eine Holzleiter hängt daran bis fast zum Boden.' : 'Eine hölzerne Klappe in der Decke, gut drei Meter über dem Boden. Ein Eisenring hängt daran, zu hoch für deine Hand. Für so etwas gab es früher lange Stangen mit einem Haken.';
    },
    bei: {
      oeffnen: function (api, ctx) {
        if (api.eig('bodenklappe', 'offen')) return false;
        var stange = ctx.obj2 === 'hakenstange' || api.traegt('hakenstange');
        if (!stange) {
          api.sage('Du streckst dich, springst. Deine Finger streifen den Ring nicht einmal.');
          api.fehlversuch('bodenklappe', { 2: 'Der Ring ist für eine Stange mit Haken gemacht. In einem Haus wie diesem lag so etwas meist in der Wäschekammer.', 3: 'Hol die Hakenstange aus der Kammer im Nordosten. <span class="nebenbei">(„öffne klappe mit hakenstange“)</span>' });
          return true;
        }
        api.setze('bodenklappe', 'offen', true);
        api.sage('Du hakst die Stange in den Ring und ziehst. Die Klappe gibt nach, und eine Holzleiter rumpelt herunter, so plötzlich, dass du zurückspringst. Oben ist es schwarz. Ein Schwall kalter Luft, Staub, Taubenkot – und ganz zuletzt Papier, sehr altes Papier.');
        return true;
      },
      ziehen: function (api, ctx) { return HG.daten.dinge.bodenklappe.bei.oeffnen(api, ctx); }
    }
  });

  // ===================================================================
  // ELISABETHS KRANKENZIMMER (im Plan: Schlafzimmer)
  // ===================================================================
  HG.raum('schlafzimmer', {
    name: 'Elisabeths Krankenzimmer',
    woerter: ['schlafzimmer', 'krankenzimmer', 'elternschlafzimmer', 'zimmer'],
    schauplatz: 'haus', karte: { x: 11, y: 1 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Es riecht nach Kampfer und kaltem Lavendel. Irgendwo knarrt Leder.',
    beschreibung: function (api) {
      return 'Das größte Zimmer des Hauses war einmal ein Schlafzimmer. Heute steht hier ein Krankenbett aus weiß lackiertem Eisen mit breiten Ledergurten' +
        (api.istTag() && api.flag('nacht_im_haus') ? ' – die Decke zerwühlt, die Gurte offen, obwohl hier niemand schläft' : '') + '. ' +
        'Im Parkett laufen zwei feine, glänzende Spuren vom Bett zum Fenster und zurück: Rollstuhlräder, tausendmal dieselbe Strecke. Am Fenster ein Lesepult, an der Wand neben dem Bett ein Klingelzug. ' +
        'Eine Glastür führt auf einen kleinen Balkon zur Straße, und im Südosten öffnet sich der runde Turmerker. An der Nordwand steht ein wuchtiger Kleiderschrank. Die Tür im Westen führt zurück auf die Galerie.';
    },
    kurz: 'Elisabeths Krankenzimmer: Krankenbett, Lesepult, Balkontür, Turmerker. Westen: Galerie.',
    horchen: { tag: 'Das leise Knarren von Leder. Wie ein Gurt, an dem jemand zieht.', nacht: 'Gummiräder auf Parkett, vom Bett zum Fenster. Dann vom Fenster zum Bett.' },
    riechen: 'Kampfer, Wermut, Lavendel. Ein Krankenzimmergeruch, hundert Jahre alt.',
    versteckOrt: { text: 'Du kriechst unter das Krankenbett. Über dir hängen die Gurte herab wie die Arme von jemandem, der schläft.', mod: 0 },
    ausgaenge: { westen: 'galerie' },
    vorschlaege: ['untersuche lesepult', 'untersuche krankenbett', 'ziehe am klingelzug'],
    details: [
      { nomen: 'Krankenbett', genus: 'n', woerter: ['krankenbett', 'bett', 'gurte', 'gurt', 'ledergurte', 'decke'], text: 'Weiß lackiertes Eisen, abgeplatzt an den Kanten. Vier breite Ledergurte, je einer für die Handgelenke, je einer für die Knöchel. Die Schnallen sind innen blank gescheuert. Wer hier lag, hat gekämpft – oder etwas in ihr.', versteckOrt: { text: 'Du kriechst unter das Krankenbett. Über dir hängen die Gurte herab.', mod: 0 } },
      { nomen: 'Rollstuhlspuren', genus: 'pl', woerter: ['spuren', 'rollstuhlspuren', 'parkett', 'boden'], text: 'Zwei glänzende Bahnen im matten Parkett, eine Handbreit auseinander. Vom Bett zum Fenster. Vom Fenster zum Bett. Jahrelang.' },
      { nomen: 'Klingelzug', genus: 'm', woerter: ['klingelzug', 'zug', 'klingel', 'quaste'], text: 'Eine verblichene Quaste an einer Schnur. Von hier hat Elisabeth die Pflegerin gerufen. Unten in der Küche hängt die Klappe dazu.',
        bei: { ziehen: function (api) { api.setzeFlag('klappe_ankleidezimmer'); api.sage('Du ziehst. Tief unter dir, in der Küche, schlägt eine Glocke an, dünn und weit weg. Einen Moment lang wartest du darauf, dass jemand die Treppe heraufkommt.'); return true; } } },
      { nomen: 'Balkontür', genus: 'f', woerter: ['balkontuer', 'balkon', 'glastuer', 'fenster', 'strasse'], text: 'Eine hohe Glastür mit Messinggriff. Draußen ein winziger Balkon mit schmiedeeisernem Gitter, darunter die Straße und die Hecke. Die Tür lässt sich öffnen – aber du hast keinen Grund, hinauszugehen.' },
      { nomen: 'Turmerker', genus: 'm', woerter: ['turmerker', 'erker', 'turm', 'nische'], text: 'Eine runde Nische im Türmchen, ringsum Fenster. Hier stand der Rollstuhl, mit Blick auf die Straße. Auf dem Fensterbrett ein Rand aus getrockneten Lavendelblüten.' },
      { nomen: 'Kleiderschrank', genus: 'm', woerter: ['kleiderschrank', 'schrank', 'nordwand'], text: 'Ein Schrank aus dunkler Eiche, fast bis zur Decke. Er ist leer. Als du an seine Rückwand klopfst, klingt es hohl, und dahinter ist kein Zimmer, sondern noch etwas Holz – als stünde er vor einer alten Tür.', versteckOrt: { text: 'Du steigst in den Kleiderschrank und ziehst die Tür bis auf einen Spalt zu. Es riecht nach Mottenpulver und kaltem Holz.', mod: 10 } }
    ]
  });

  HG.ding('lesepult', {
    nomen: 'Lesepult', genus: 'n', woerter: ['lesepult', 'pult', 'staender'],
    ort: 'schlafzimmer', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein schräges Lesepult aus Nussbaum, so hoch, dass man es aus dem Rollstuhl erreicht.'
  });

  // „Die unsichtbare Schrift“: ab 1920 hat Elisabeth mit Zitronensaft geschrieben
  var TB_LEER = '<i>(Die Seite wirkt leer. Nur das Papier ist leicht gewellt, als wäre es einmal feucht gewesen.)</i>';
  function zeigeSchrift(api, wie) {
    api.setzeFlag('zitronentinte');
    api.sage(wie + ' Erst nichts – dann, langsam, wie aus dem Papier herausgeschwitzt, braune Buchstaben. Zeile um Zeile, Seite um Seite: eine zweite, verborgene Schrift. <span class="nebenbei">(„lies tagebuch von elisabeth“)</span>');
  }
  function waerme(api, ctx) {
    if (api.flag('zitronentinte')) { api.sage('Die braune Schrift ist schon sichtbar. Mehr Wärme würde das Papier nur versengen.'); return true; }
    var quelle = [ctx.obj2].concat(HG.welt.inventar()).filter(function (id) {
      var d = id && HG.daten.dinge[id];
      return d && ((d.anzuendbar && api.eig(id, 'brennt')) || d.feuer);
    })[0];
    if (!quelle) {
      api.sage('Womit willst du das Papier erwärmen? Deine Hände sind zu kalt dafür.');
      api.fehlversuch('zitronentinte', { 2: 'Eine Flamme wäre gut – nicht zu nah.', 3: 'Zünde die Kerze an und halte das Tagebuch darüber. <span class="nebenbei">(„halte tagebuch über kerze“)</span>' });
      return true;
    }
    if (api.beruf() === 'geschichte') { zeigeSchrift(api, 'Zitronentinte – du hast das in alten Briefen schon gesehen. Du hältst die Seiten in sicherem Abstand über ' + api.der(quelle, 'akk') + '.'); return true; }
    var e = api.probe('ge', { grund: 'Papier erwärmen', mod: 20, modGrund: 'mit Geduld' });
    if (e.erfolg) { zeigeSchrift(api, 'Du hältst die Seiten über ' + api.der(quelle, 'akk') + ', nah genug, dass das Papier warm wird, nicht so nah, dass es brennt.'); return true; }
    if (e.patzer) {
      api.setzeFlag('tagebuch_angesengt');
      zeigeSchrift(api, 'Zu nah! Eine Ecke fängt Feuer, du schlägst die Flamme mit der flachen Hand aus. Eine Seite ist halb verkohlt – aber auf dem Rest erscheint etwas.');
      return true;
    }
    api.sage('Du hältst das Papier zu weit weg, dann zu kurz. Es wird nur ein bisschen warm.');
    api.fehlversuch('zitronentinte', { 2: 'Ruhiger. Länger. Nicht zu weit weg.', 3: 'Versuch es noch einmal – die Wärme muss eine Weile wirken. <span class="nebenbei">(„halte tagebuch über kerze“)</span>' });
    return true;
  }
  HG.ding('elisabeths_tagebuch', {
    nomen: 'Tagebuch', genus: 'n', adj: ['rot', 'schmal'], zusatz: function () { return 'von Elisabeth'; },
    woerter: ['tagebuch', 'elisabeth', 'elisabeths', 'lederbuch', 'seiten', 'schrift'], adjektive: ['ledern', 'unsichtbar', 'braun'],
    ort: 'lesepult', rel: 'auf',
    beschreibung: function (api) {
      return 'Ein schmales Tagebuch in rotem Leder, ein „E.“ in den Deckel geprägt. Die erste Seite ist in einer zarten, steilen Handschrift beschrieben. ' +
        (sichtbarSchrift(api) ? 'Auf den übrigen Seiten steht jetzt die braune, verborgene Schrift.' : 'Die übrigen Seiten wirken leer – aber das Papier ist an vielen Stellen leicht gewellt, als wäre es einmal feucht gewesen. Es riecht, ganz schwach, nach Zitrone.');
    },
    riechen: 'Altes Leder. Und, ganz schwach, Zitrone.',
    foto: 'Im Blitzlicht schimmern auf den leeren Seiten feine, matte Linien – wie Schrift, die sich versteckt.',
    buch: {
      titel: 'Elisabeths Tagebuch', schrift: 'hand', dauerProSeite: 3,
      seiten: [
        { titel: 'Erste Seite', text: 'Dieses Buch gehört Elisabeth Grest.<br><br>Was ich wirklich denke, sieht nur, wer mich wärmt.' },
        { titel: '1908', gesperrt: { frei: sichtbarSchrift, text: TB_LEER },
          text: 'Die neue Pflegerin ist gekommen. Sie hat kalte Hände und ein warmes Lächeln, und zum ersten Mal seit Jahren schlafe ich. B. sagt, sie sei ein Segen. Sie trägt immer Schwarz. Auf dem Fensterbrett sitzt jeden Morgen eine Krähe und sieht ihr zu.' },
        { titel: '1915', gesperrt: { frei: sichtbarSchrift, text: TB_LEER },
          text: 'Ich bin gesund. Ich weiß es. Ich fühle es in den Händen, in den Knien, ich könnte aufstehen. Aber im Spiegel sehe ich mich krank, gelb und eingefallen, und hinter mir steht sie und lächelt.' },
        { titel: '1926', gesperrt: { frei: sichtbarSchrift, text: TB_LEER },
          text: function (api) { return api.flag('tagebuch_angesengt') ? '<i>(Die Seite ist halb verkohlt. Lesbar ist nur noch:)</i> … spricht nachts mit mir. Sie hat meine Stimme … weiß Dinge, die nur ich …' : 'Die andere spricht nachts mit mir. Sie hat meine Stimme, aber sie benutzt sie falsch, wie jemand, der ein Kleid trägt, das ihm nicht passt. Sie sagt, sie sei ich. Sie sagt, ohne sie wäre ich nichts als Schmerz.'; } },
        { titel: '1929, Neumond', gesperrt: { frei: sichtbarSchrift, text: TB_LEER },
          text: 'Heute Nacht hat die Pflegerin mich in den Keller getragen. Kohle, Knochen, ein Kreis, und in der Mitte eine Scheibe, schwarz wie Wasser. Sie hat gesagt: Gib sie Ihm, und du bist für immer gesund. Ich habe gesagt: Lieber krank und mein eigen.' },
        { titel: '1929, Herbst', gesperrt: { frei: sichtbarSchrift, text: TB_LEER },
          text: 'Ich habe ihre Kammer versiegelt, mit meinem eigenen Siegel. Sie ist seit drei Tagen fort. Die Krähe sitzt noch auf dem Fensterbrett. Die andere ist nicht fort. Sie ist lauter.' },
        { titel: '1930', gesperrt: { frei: sichtbarSchrift, text: TB_LEER }, hinweis: 'elisabeths_tagebuch',
          text: 'Wenn B. mir den Ring wiedergibt, bin ich frei. Er hat versprochen, ihn zu verwahren, bis unser Tag wiederkommt. Ich weiß nicht mehr, wo er ihn hingelegt hat.<br><br>Die andere weiß es auch nicht. Das ist mein Trost.' }
      ],
      entziffern: { wer: ['geschichte', 'wahrnehmung'], mod: -20, dauer: 30,
        erfolg: 'Im schrägen Licht erkennst du auf den leeren Seiten feine Linien – eingetrocknete Schrift, matt auf dem glänzenden Papier. Buchstabe für Buchstabe tastest du sie ab. Zitronentinte.',
        misserfolg: 'Da ist etwas auf dem Papier – aber du kannst es nicht greifen.',
        tipps: { 2: 'Die erste Seite verrät, wie man die Schrift sichtbar macht: „wer mich wärmt“.', 3: 'Halte das Tagebuch über eine brennende Kerze. <span class="nebenbei">(„halte tagebuch über kerze“)</span>' } }
    },
    bei: {
      erwaermen: waerme,
      benutzen: function (api, ctx) {
        var anderes = ctx.obj === 'elisabeths_tagebuch' ? ctx.obj2 : ctx.obj;
        var d = anderes && HG.daten.dinge[anderes];
        if (d && (d.anzuendbar || d.feuer)) return waerme(api, { obj2: anderes });
        return false;
      }
    }
  });

  // ===================================================================
  // BIBLIOTHEK (über dem Arbeitszimmer)
  // ===================================================================
  HG.raum('bibliothek', {
    name: 'Bibliothek',
    woerter: ['bibliothek', 'buecherzimmer', 'lesezimmer'],
    schauplatz: 'haus', karte: { x: 9, y: 0 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Es riecht nach Papier und Leder. Irgendwo vor dir, sehr groß, schimmert Glas.',
    beschreibung: function (api) {
      return 'Bernwards Bibliothek: Regale bis unter die Decke, jedes hinter Glastüren mit Messingrahmen. Bücher über Statik, Baukunst, Mathematik, ordentlich, Rücken an Rücken, und auf jedem Rücken ein kleines weißes Etikett. ' +
        'An einer Schiene unter der Decke hängt eine Rollleiter. Vor dem Fenster ein Lesesessel mit eingesessenem Leder.' +
        (api.istNacht() ? ' In den Glastüren spiegelt sich dein Licht – zehnmal, zwanzigmal, und nicht jedes Spiegelbild bewegt sich mit dir.' : '') +
        ' Die Tür im Osten führt zurück auf die Galerie.';
    },
    kurz: 'Bernwards Bibliothek: Regale mit Glastüren, Etiketten, Rollleiter, Lesesessel. Osten: Galerie.',
    horchen: { tag: 'Papier, das sich in der Wärme leise dehnt.', nacht: 'Hinter einer der Glastüren tickt etwas, als klopfe ein Fingernagel von innen gegen das Glas.' },
    riechen: 'Papier, Leim, Leder. Und zwischen den Büchern: getrocknete Kräuter.',
    ausgaenge: { osten: 'galerie' },
    beimVerlassen: function (api) { api.setzeFlag('auf_leiter', false); },
    vorschlaege: function (api) {
      var v = ['untersuche etiketten'];
      if (api.flag('buch_ohne_etikett')) v.push(api.flag('auf_leiter') ? 'nimm kräuterbuch' : 'kletter auf die leiter');
      return v;
    },
    details: [
      { nomen: 'Lesesessel', genus: 'm', woerter: ['lesesessel', 'sessel', 'leder'], text: 'Ein Ohrensessel aus rissigem Leder. Die Sitzfläche ist eingesunken, als säße jeden Abend jemand darin.' }
    ]
  });

  // Das Buch ohne Etikett ist entdeckt: es steht im obersten Fach (nur mit der Rollleiter erreichbar)
  function buchEntdeckt(api) {
    if (api.flag('buch_ohne_etikett')) return;
    api.setzeFlag('buch_ohne_etikett');
    if (!api.eig('kraeuterbuch', 'ort')) { api.bewege('kraeuterbuch', 'bibliothek', null); api.setze('kraeuterbuch', 'oben', true); }
  }
  HG.ding('regale', {
    nomen: 'Bücherregale', genus: 'pl', woerter: ['regale', 'regal', 'buecherregale', 'buecher', 'buch', 'fach', 'faecher', 'bibliothek'], adjektive: ['oberst', 'hoch'],
    ort: 'bibliothek', fest: true, szenerie: true,
    beschreibung: function (api) {
      return 'Fach um Fach, Buch um Buch. Bernward hatte ein System: Jedes Buch trägt ein Etikett mit Buchstabe und Nummer, „A 1“ bis „M 40“, ohne Lücke. ' +
        (api.flag('buch_ohne_etikett') ? 'Ganz oben, im obersten Fach, steht das eine Buch ohne Etikett.' : 'Ganz oben, unter der Decke, verlieren sich die Fächer im Halbdunkel.');
    },
    proben: {
      durchsuchen: {
        wer: 'suchen', mod: -20, modGrund: 'tausend Bücher',
        wenn: function (api) { return !api.flag('buch_ohne_etikett'); },
        erfolg: function (api) { buchEntdeckt(api); api.sage('Du gehst die Reihen ab, Fach für Fach. Ganz oben, im obersten Fach, stockt dein Blick: Ein Buch hat kein Etikett. In Bernwards Ordnung ist das wie ein Fehler in einer Rechnung.'); },
        misserfolg: 'Bücher, Bücher, Bücher. Nach einer Weile verschwimmen die Rücken vor deinen Augen.',
        tipps: { 2: 'Bernward hat alles beschriftet. Vielleicht verrät gerade das, was nicht beschriftet ist, etwas.', 3: 'Sieh dir die Etiketten genauer an. <span class="nebenbei">(„untersuche etiketten“)</span>' }
      }
    },
    bei: {
      reissen: function (api) {
        if (api.flag('kraeuterbuch_gefunden')) { api.sage('Es gibt keinen Grund mehr, die Bücher herauszureißen.'); return true; }
        api.sage('Du ziehst Buch um Buch heraus, wirfst sie auf den Boden, Fach um Fach, bis deine Arme brennen. Es dauert fast eine Stunde. Ganz zuletzt, aus dem obersten Fach, das du mit der Rollleiter erreichst, fällt ein dünnes Buch ohne Etikett vor deine Füße.');
        api.zeitVergeht(55);
        buchEntdeckt(api); api.setzeFlag('kraeuterbuch_gefunden');
        api.setze('kraeuterbuch', 'oben', false);
        if (api.nachtphase() === 'tief') { api.sage('Der Lärm hallt durchs ganze Haus. Und irgendwo antwortet etwas.'); api.kampf('die_wandernde', {}); }
        return true;
      },
      zerbrechen: function (api) { return HG.daten.dinge.regale.bei.reissen(api); }
    }
  });
  HG.ding('etiketten', {
    nomen: 'Etiketten', genus: 'pl', woerter: ['etiketten', 'etikett', 'schildchen', 'beschriftung', 'nummern', 'system', 'ordnung'],
    ort: 'regale', rel: 'teil', fest: true, szenerie: true,
    beschreibung: function (api) {
      if (!api.hell()) return 'Dafür ist es zu dunkel.';
      buchEntdeckt(api);
      return 'Kleine weiße Schildchen in Bernwards akkurater Schrift: „A 1“, „A 2“ … „M 40“. Keine Nummer fehlt, keine ist doppelt. Du folgst den Reihen mit den Augen nach oben – und ganz oben, im obersten Fach, steht ein dünnes Buch ohne Etikett. Das einzige im ganzen Raum. Es gehört nicht in Bernwards Ordnung.';
    },
    lesbar: '„A 1 – Statik der Gewölbe“, „A 2 – Eisenbeton“ … „M 40 – Grundrisse städtischer Villen“. Und oben ein Buch ohne Schild.'
  });
  HG.ding('rollleiter', {
    nomen: 'Rollleiter', genus: 'f', woerter: ['rollleiter', 'leiter', 'schiene', 'sprossen'],
    ort: 'bibliothek', fest: true, szenerie: true,
    beschreibung: 'Eine Leiter aus Eiche, die oben an einer Messingschiene hängt und unten auf Rollen läuft. Sie reicht bis zum obersten Fach.',
    klettern: function (api) {
      if (api.flag('auf_leiter')) return 'Du stehst schon auf der Leiter.';
      if (api.istNacht()) {
        var e = api.probe('ge', { grund: 'Rollleiter', mod: -10, modGrund: 'in den Glastüren bewegt sich etwas' });
        if (!e.erfolg) {
          api.verletze('1W4', { grund: 'Sturz von der Leiter' });
          return 'Auf halber Höhe siehst du es: In der Glastür neben dir steigt jemand mit dir hinauf, Sprosse um Sprosse, und lächelt. Du greifst daneben und stürzt.';
        }
      }
      api.setzeFlag('auf_leiter');
      return 'Du rollst die Leiter heran und steigst hinauf. Unter der Decke ist die Luft warm und staubig.' + (api.flag('buch_ohne_etikett') ? ' Das Buch ohne Etikett ist jetzt in Reichweite.' : '');
    },
    bei: { benutzen: function (api) { api.sage(HG.wert(HG.daten.dinge.rollleiter.klettern, api)); return true; }, schieben: function (api) { api.sage('Die Leiter rollt mit einem leisen Quietschen über die Schiene.'); return true; } }
  });
  HG.ding('glastueren', {
    nomen: 'Glastüren', genus: 'pl', woerter: ['glastueren', 'glastuer', 'glas', 'vitrine', 'spiegelungen'],
    ort: 'bibliothek', fest: true, szenerie: true,
    spiegel: { nacht: 'gross', sonst: null },   // nachts spiegeln die Glastüren wie ein großer Spiegel
    beschreibung: function (api) { return api.istNacht() ? 'Die Glastüren sind schwarze Spiegel. In jedem stehst du – und in einem stehst du nicht allein.' : 'Glastüren mit Messingrahmen, staubig, aber unversehrt.'; }
  });

  HG.ding('kraeuterbuch', {
    nomen: 'Kräuterbuch', genus: 'n', adj: ['dünn'], kurzwort: 'kräuterbuch',
    woerter: ['kraeuterbuch', 'buch', 'kraeuterkunde', 'rezeptbuch', 'rezepte', 'rezept'], adjektive: ['etikettlos', 'schwarz'],
    ort: null,
    beschreibung: function (api) { return api.eig('kraeuterbuch', 'oben') ? 'Ein dünnes Buch in schwarzem Leinen, ganz oben im obersten Fach, ohne Etikett. Von hier unten erkennst du nicht mehr.' : 'Ein dünnes Buch in schwarzem Leinen, ohne Titel. Gepresste Pflanzen zwischen den Seiten, und die spitze, enge Schrift kennst du: Es ist dieselbe wie im Gebetbuch der Pflegerin.'; },
    riechen: 'Wermut, Lavendel und etwas Bitteres darunter.',
    buch: {
      titel: 'Das Kräuterbuch der Pflegerin', schrift: 'hand', dauerProSeite: 3,
      seiten: [
        { titel: 'Lavendel', text: 'Lavendel für den Schlaf, für die Motten, für die Toten. Er blüht, solange jemand an ihn denkt.' },
        { titel: 'Die Tropfen', hinweis: 'kraeuterbuch', text: 'Wermut, Mohn, Bilsenkraut, drei Nächte gezogen. <b>Drei Tropfen, und die Kranke schläft – und was in ihr krank ist, schläft mit ihr.</b> Wirkt nur, solange ich wache. Nicht mehr als drei Tropfen. Nie mehr als einmal in einer Nacht.' },
        { titel: 'Salz', text: 'Salz auf die Schwelle, in einer Linie ohne Lücke, und was aus dem Glas kommt, geht nicht darüber. Für eine Nacht.' },
        { titel: 'Neumond', text: '<i>(Eine Seite in Spiegelschrift: Zahlenreihen, Mondsicheln, Tage. Eine Rechnung, die immer bei einer schwarzen Scheibe endet.)</i>' }
      ]
    }
  });
  HG.daten.dinge.kraeuterbuch.bei = {
    nehmen: function (api) {
      if (!api.eig('kraeuterbuch', 'oben')) return false;
      if (!api.flag('auf_leiter')) {
        api.sage('Das Buch steht im obersten Fach, gut drei Meter über dir. Ohne die Rollleiter kommst du nicht hinauf.');
        api.fehlversuch('kraeuterbuch_hoch', { 2: 'An der Decke hängt eine Rollleiter an einer Schiene.', 3: 'Steig auf die Rollleiter. <span class="nebenbei">(„kletter auf die leiter“)</span>' });
        return true;
      }
      api.setze('kraeuterbuch', 'oben', false);
      api.setzeFlag('kraeuterbuch_gefunden');
      return false;
    }
  };

  HG.ding('brinkhoff_plaene', {
    dokument: true,
    nomen: 'Zeichenrolle', genus: 'f', adj: ['eingeklemmt'], woerter: ['zeichenrolle', 'rolle', 'plaene', 'plan', 'zeichnungen', 'brinkhoff'],
    ort: 'bibliothek',
    versteckt: { bei: 'regale', wie: ['hinter', 'schieben', 'tasten', 'durchsuchen'], text: 'Hinter einem der Regale, zwischen Holz und Wand, klemmt eine Papierrolle.' },
    beschreibung: 'Eine Rolle Transparentpapier, Bleistift und Tusche, gezeichnet in den Achtzigern. Ein Grundriss des Obergeschosses von Haus Grest – mit einem zweiten Raum neben dem Ankleidezimmer, rundum mit Spiegeln ausgekleidet. Stempel: „H.-J. Brinkhoff, Architekt, 1986“. Quer über das Blatt, mit zittrigem Strich: „Sie will mehr Platz.“',
    lesbar: '„Spiegelkabinett II – Entwurf 3. Wandflächen vollständig verspiegelt, Fenster entfällt. Abnahme durch: E.“ Und darunter, kaum lesbar: „Sie will mehr Platz.“',
    hinweis: 'brinkhoff_plaene', hinweisBei: 'lesen'
  });

  // ===================================================================
  // KINDERZIMMER (Bettinas Zimmer)
  // ===================================================================
  HG.raum('kinderzimmer', {
    name: 'Kinderzimmer',
    woerter: ['kinderzimmer', 'bettinas zimmer', 'jugendzimmer'],
    schauplatz: 'haus', karte: { x: 9, y: -1 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Irgendwo vor dir ein leises Klicken, wie von winzigen Türen.',
    beschreibung: function (api) {
      return 'Ein Zimmer, das 1899 für ein Kind geplant wurde und erst hundert Jahre später eins bekam. Die Tapete hat helle Rechtecke, wo Poster hingen; an einem Nagel hängt noch ein Kalender von 2022, aufgeschlagen beim Oktober. ' +
        'Ein schmales Bett, ein Schreibtisch, ein Regal mit ein paar alten Büchern. Und auf einem niedrigen Tisch in der Mitte des Raums: ein Puppenhaus, fast so groß wie ein Koffer – ein Haus mit Walmdach, spitzen Giebeln und einem kleinen Erkertürmchen an der Ecke. Es ist dieses Haus. Die Tür im Osten führt zurück auf die Galerie.';
    },
    kurz: 'Das Kinderzimmer: Bettinas Kalender, das Regal, das Puppenhaus. Osten: Galerie.',
    horchen: { tag: 'Ein leises Klicken aus dem Puppenhaus, wie von einer winzigen Tür.', nacht: 'Eine Mädchenstimme, ganz nah an deinem Ohr, flüstert etwas, das du nicht verstehst.' },
    riechen: 'Staub, Holzleim, ein Rest von Erdbeershampoo.',
    versteckOrt: { text: 'Du kriechst unter Bettinas Bett. Auf der Unterseite des Lattenrosts klebt ein Zettel: „Sie sieht dich trotzdem.“', mod: -10 },
    ausgaenge: { osten: 'galerie' },
    vorschlaege: ['untersuche puppenhaus', 'untersuche regal', 'schau ins puppenhaus'],
    details: [
      { nomen: 'Kalender', genus: 'm', woerter: ['kalender', 'oktober', '2022'], text: 'Ein Schülerkalender von 2022, aufgeschlagen beim Oktober. Am 14. ein Herz und „Lena B-Day!!“, am 21. „Mathe“. Danach nichts mehr. Bettina ist am 18. gestorben.' },
      { nomen: 'Rechtecke', genus: 'pl', woerter: ['rechtecke', 'tapete', 'poster', 'stellen'], text: 'Helle Rechtecke auf vergilbter Tapete, wo Bettinas Poster hingen. Brigitte Gerdes hat sie mitgenommen. Alles andere nicht.' },
      { nomen: 'Bett', genus: 'n', woerter: ['bett', 'kinderbett', 'matratze'], text: 'Ein schmales Jugendbett, die Matratze nackt.', versteckOrt: { text: 'Du kriechst unter Bettinas Bett.', mod: -10 } },
      { nomen: 'Regal', genus: 'n', woerter: ['regal', 'buecherregal', 'buecher', 'schreibtisch'], text: 'Ein paar Schulbücher von 2022, ein Atlas, und ganz unten, als hätte es schon immer hier gestanden, ein altes Kinderbuch mit gezacktem Goldrand.' }
    ]
  });

  // Das Puppenhaus: Bernwards Modell von 1900 – es zeigt das Haus, wie es JETZT ist
  var RAUMNAMEN_PUPPEN = function (id) { var r = HG.daten.raeume[id]; return r ? r.name : (id === 'spiegelzimmer' ? 'Ankleidezimmer' : id); };
  function puppenhausNachts(api) {
    if (api.eig('puppenhaus', 'kaputt')) return ' Seit du die Vorderwand aufgebrochen hast, stehen keine Figuren mehr darin. Das Modell ist nur noch ein Modell.';
    var lage = HG.gefahren.lage();
    var orte = {};
    lage.forEach(function (l) { orte[l.raum] = (orte[l.raum] || 0) + 1; });
    var namen = Object.keys(orte).filter(function (id) { return HG.daten.raeume[id]; }).map(RAUMNAMEN_PUPPEN);
    api.nervenProbe('0/1', { grund: 'die Figuren im Puppenhaus' });
    var hier = orte[api.raum()] ? ' Eine steht im winzigen Kinderzimmer, vor dem winzigen Puppenhaus. Sie hat den Kopf gehoben.' : '';
    if (!namen.length) return ' In keinem der Räume steht eine Figur. Heute Nacht ist das Haus still – oder es versteckt sich gut.';
    return ' In einigen Räumen stehen kleine, dunkle Figuren, die gestern noch nicht da waren: ' + HG.text.liste(namen, 'und') + '.' + hier;
  }
  HG.ding('puppenhaus', {
    nomen: 'Puppenhaus', genus: 'n', adj: ['groß'], woerter: ['puppenhaus', 'modell', 'haus', 'vorderwand', 'haken', 'figuren', 'fenster', 'zimmerchen'],
    ort: 'kinderzimmer', fest: 'Das Puppenhaus ist zu groß und zu schwer, um es herumzutragen.', szenerie: true,
    oeffenbar: true, offen: false, verschlossen: true, behaelter: true,
    beschreibung: function (api) {
      var t = 'Bernwards Modell von Haus Grest, Maßstab 1 : 20, auf dem Sockel eingeschnitzt: „Für unser Kind. B. G. 1900“. Jeder Raum ist da, jedes Möbelstück, sogar die Rollleiter in der Bibliothek. Durch die winzigen Fenster siehst du hinein. ';
      t += 'Zwei Dinge stimmen nicht mit Bernwards Plan überein: Das Ankleidezimmer ist innen mit winzigen Spiegelscherben ausgekleidet, Wand für Wand, wie ein Kaleidoskop. Und im Keller ist die Tür zum Kohlenkeller zugemauert – ein Stückchen grauer Gips, wo eine Tür sein müsste. Das Modell zeigt das Haus, wie es jetzt ist. ';
      t += api.eig('puppenhaus', 'offen') ? 'Die Vorderwand ist aufgeklappt.' : 'Die Vorderwand ist mit einem kleinen Messinghaken verschlossen.';
      if (api.istNacht() && api.hell()) t += puppenhausNachts(api);
      return t;
    },
    hinweis: 'puppenhaus_modell', hinweisBei: 'untersuchen',
    bei: {
      hineinschauen: function (api) {
        if (!api.hell()) { api.sage('Es ist zu dunkel.'); return true; }
        api.hinweis('puppenhaus_modell');
        if (!api.istNacht()) { api.sage('Du beugst dich vor und siehst durch die Fensterchen. Alles ist da, winzig und genau – die Halle, die Kommode, sogar ein Fleck auf dem Teppich am Fuß der Treppe. Keine Figuren. Bei Tag ist das Modell nur ein Modell.'); return true; }
        api.sage('Du beugst dich vor und siehst durch die Fensterchen.' + puppenhausNachts(api));
        return true;
      },
      oeffnen: function (api, ctx) {
        if (api.eig('puppenhaus', 'offen')) return false;
        var werkzeug = ctx.obj2 && HG.daten.dinge[ctx.obj2].werkzeug ? ctx.obj2 : (api.traegt('feinwerkzeug') ? 'feinwerkzeug' : null);
        if (werkzeug === 'feinwerkzeug') { oeffnePuppenhaus(api, 'Mit der feinsten Pinzette aus Carstens Set drückst du den verbogenen Haken aus der Öse. Die Vorderwand schwingt auf.'); return true; }
        var e = api.probe('ge', { grund: 'Haken mit den Fingern', mod: -20, modGrund: 'winzig und verbogen' });
        if (e.erfolg) { oeffnePuppenhaus(api, 'Mit dem Fingernagel hebelst du den verbogenen Haken aus der Öse. Die Vorderwand schwingt auf.'); return true; }
        api.sage('Der Haken ist verbogen und klemmt. Deine Finger sind zu groß dafür.');
        api.fehlversuch('puppenhaus', { 2: 'Für so einen winzigen Haken bräuchte man eine Pinzette.', 3: 'In Carstens Feinmechaniker-Set aus dem Lager ist eine Pinzette. <span class="nebenbei">(„öffne puppenhaus mit werkzeug“)</span>' });
        return true;
      },
      knacken: function (api, ctx) { return HG.daten.dinge.puppenhaus.bei.oeffnen(api, ctx); },
      zerbrechen: function (api) {
        if (api.eig('puppenhaus', 'offen')) { api.sage('Es ist schon offen.'); return true; }
        api.setze('puppenhaus', 'kaputt', true);
        oeffnePuppenhaus(api, 'Du reißt an der Vorderwand. Der Haken bricht, ein Scharnier splittert, und ein Stück Fassade fällt dir in die Hand. Im Haus, ganz weit unten, knallt eine Tür.');
        return true;
      }
    }
  });
  function oeffnePuppenhaus(api, text) {
    api.setze('puppenhaus', 'verschlossen', false);
    api.setze('puppenhaus', 'offen', true);
    api.sage(text + ' Drinnen, im winzigen Kinderzimmer, steht ein Puppenbett mit einer Decke aus Stoffresten.');
  }
  HG.ding('puppenbett', {
    nomen: 'Puppenbett', genus: 'n', woerter: ['puppenbett', 'bettchen', 'decke'], klein: true,
    ort: 'puppenhaus', rel: 'in', fest: 'Es ist am Boden des Puppenhauses festgeleimt.', szenerie: true,
    beschreibung: 'Ein Puppenbett, kaum länger als dein Finger. Unter der winzigen Decke schimmert etwas Blaues.'
  });
  HG.ding('haarspange', {
    nomen: 'Haarspange', genus: 'f', adj: ['blau'], woerter: ['haarspange', 'spange', 'klammer', 'haarklammer'], adjektive: ['glitzernd'],
    ort: 'puppenhaus', rel: 'in', klein: true,
    versteckt: { bei: 'puppenbett', wie: ['unter', 'anheben', 'nehmen', 'durchsuchen'], text: 'Unter dem Puppenbett liegt eine blaue Haarspange mit Glitzersteinchen.' },
    beschreibung: 'Eine blaue Haarspange mit Glitzersteinchen, wie sie Mädchen mit siebzehn eigentlich nicht mehr tragen. Bettina hat sie trotzdem getragen. Jemand hat sie hier versteckt, wo nur Kinder suchen.',
    bei: {
      nehmen: function (api) {
        if (api.traegt('haarspange')) return false;
        if (api.traegt('feinwerkzeug')) { api.sage('Mit der Pinzette angelst du die Spange unter dem Puppenbett hervor.'); return false; }
        var e = api.probe('ge', { grund: 'Spange angeln', mod: -20, modGrund: 'mit dicken Fingern' });
        if (e.erfolg) return false;
        api.sage('Deine Finger stoßen gegen die winzigen Möbel. Die Spange rutscht noch weiter unter das Bett.');
        api.fehlversuch('haarspange', { 2: 'Eine Pinzette wäre hier eine große Hilfe.', 3: 'Carstens Feinmechaniker-Set hat eine Pinzette. Mit ihm in der Hand geht es leicht.' });
        return true;
      }
    }
  });
  HG.ding('kinderbuch', {
    dokument: true,
    nomen: 'Kinderbuch', genus: 'n', adj: ['alt'], woerter: ['kinderbuch', 'geheimschriften', 'goldrand', 'eselsohr'],
    ort: 'kinderzimmer',
    beschreibung: '„Geheimschriften für kluge Kinder“, Berlin 1898, mit Goldrand und Stichen von Kindern mit Lupen. Eine Seite hat ein Eselsohr.',
    lesbar: '<b>Die Zitronentinte.</b> Tauche die Feder in den Saft einer Zitrone und schreibe deine Botschaft. Ist der Saft getrocknet, sieht das Blatt leer aus. Willst du sie lesen, so <i>halte das Blatt über eine Kerzenflamme</i> – nicht zu nah! –, und die Schrift erscheint braun, wie von Zauberhand.<br><br>Am Rand, mit Bleistift, in einer erwachsenen, zarten, steilen Handschrift: <i>„Für das Kind, das wir haben werden. E.“</i>',
    hinweis: 'geheimschrift', hinweisBei: 'lesen'
  });

  // ===================================================================
  // BAD
  // ===================================================================
  HG.raum('bad', {
    name: 'Bad',
    woerter: ['bad', 'badezimmer'],
    schauplatz: 'haus', karte: { x: 10, y: -1 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Fliesen unter deinen Füßen. Irgendwo tropft es, und jeder Tropfen fällt in tiefes Wasser.',
    beschreibung: function (api) {
      return 'Schwarz-weiße Fliesen, ein Waschbecken mit Messinghähnen, darüber ein Spiegel. In der Mitte des Raums steht eine Wanne auf Löwenfüßen, ' +
        (api.eig('wanne', 'leer') ? 'leer, mit einem dunklen Rand, wo das Wasser stand.' : 'randvoll mit schwarzem, stehendem Wasser. Es bewegt sich nicht. Es spiegelt die Decke, als wäre es Glas. Eine dünne Kette hängt vom Wannenrand hinein und verschwindet darin.') +
        ' Die Tür im Süden führt zurück auf die Galerie.';
    },
    kurz: function (api) { return 'Das Bad: Waschbecken, Spiegel, die Wanne' + (api.eig('wanne', 'leer') ? ' (leer)' : ' mit dem schwarzen Wasser') + '. Süden: Galerie.'; },
    horchen: { tag: 'Ein Tropfen. Lange nichts. Noch ein Tropfen.', nacht: 'Aus der Wanne ein Geräusch wie Atmen unter Wasser.' },
    riechen: 'Feuchtigkeit, Kalk, und aus der Wanne etwas Süßliches, Faules.',
    ausgaenge: { sueden: 'galerie' },
    vorschlaege: function (api) { return api.eig('wanne', 'leer') ? ['untersuche wanne', 'schau in den spiegel'] : ['untersuche wanne', 'untersuche kette', 'schau in den spiegel']; }
  });
  function wanneLeeren(api, text) {
    api.setze('wanne', 'leer', true);
    api.bewege('stimmgabel', 'wanne', 'in');
    api.sage(text + ' Das schwarze Wasser gurgelt, sinkt, verschwindet mit einem langen Seufzen im Abfluss. Auf dem Grund der Wanne liegen eine Stimmgabel aus angelaufenem Stahl und ein langes graues Haar.');
  }
  function insWasser(api) {
    if (api.eig('wanne', 'leer')) return false;
    api.kampf('hand_im_wasser', {});
    return true;
  }
  HG.ding('wanne', {
    nomen: 'Wanne', genus: 'f', woerter: ['wanne', 'badewanne', 'wasser', 'loewenfuesse', 'grund', 'abfluss'], adjektive: ['schwarz', 'stehend'],
    ort: 'bad', fest: true, szenerie: true, behaelter: true, offen: true,
    spiegel: function (api) { return api.eig('wanne', 'leer') ? null : 'klein'; },   // stehendes Wasser ist ein Spiegel
    beschreibung: function (api) {
      if (api.eig('wanne', 'leer')) return 'Eine leere Wanne auf Löwenfüßen, innen ein schwarzer Rand, wo das Wasser stand.';
      return 'Das Wasser ist schwarz, nicht trüb – schwarz, wie Tinte, und vollkommen glatt. Du siehst nicht hinein, nur dich selbst darauf, und die Decke über dir. Eine dünne Kette führt vom Rand ins Wasser: der Stöpsel. Hineingreifen willst du nicht.';
    },
    riechen: 'Süßlich. Faulig. Wie Blumen, die zu lange in der Vase standen.',
    bei: {
      tasten: function (api) { return insWasser(api); },
      durchsuchen: function (api) { return insWasser(api); },
      nehmen: function (api) { if (api.eig('wanne', 'leer')) return false; return insWasser(api); },
      hineinschauen: function (api) {
        if (api.eig('wanne', 'leer')) return false;
        api.sage('Dein Gesicht auf der schwarzen Fläche. Und darunter, tiefer als jede Wanne sein kann, ein zweites, das die Augen öffnet.');
        api.nervenProbe('0/1W4', { grund: 'Gesicht im Wasser', gewoehnung: 'wanne_blick' });
        return true;
      },
      benutzen: function (api, ctx) {
        var anderes = ctx.obj === 'wanne' ? ctx.obj2 : ctx.obj;
        if (anderes === 'hakenstange') return HG.daten.dinge.wannenkette.bei.ziehen(api, { obj2: 'hakenstange' });
        if (anderes === 'eimer') return schoepfe(api);
        return false;
      },
      schoepfen: function (api) { return schoepfe(api); }
    }
  });
  function schoepfe(api) {
    if (api.eig('wanne', 'leer')) { api.sage('Die Wanne ist leer.'); return true; }
    if (!api.traegt('eimer')) { api.sage('Womit? Mit bloßen Händen schöpfst du kein schwarzes Wasser.'); return true; }
    api.sage('Eimer um Eimer schöpfst du das schwarze Wasser ab und kippst es ins Waschbecken. Es dauert. In jedem Eimer schwimmt dein Gesicht, und in jedem ist es ein bisschen weniger deins.');
    api.zeitVergeht(30);
    api.nervenProbe('0/1W3', { grund: 'Spiegelungen im Eimer' });
    wanneLeeren(api, 'Als der Eimer zum letzten Mal über den Grund schrammt, ist es geschafft.');
    return true;
  }
  HG.ding('wannenkette', {
    nomen: 'Kette', genus: 'f', woerter: ['kette', 'stoepsel', 'stoepselkette', 'kettchen'],
    ort: 'wanne', rel: 'teil', fest: true, szenerie: true,
    beschreibung: function (api) { return api.eig('wanne', 'leer') ? 'Die Stöpselkette hängt schlaff über den Rand.' : 'Eine dünne Messingkette, am Wannenrand eingehakt. Das andere Ende verschwindet im schwarzen Wasser – am Stöpsel, irgendwo tief unten. Wenn du sie greifen könntest, ohne die Hand ins Wasser zu stecken …'; },
    bei: {
      ziehen: function (api, ctx) {
        if (api.eig('wanne', 'leer')) { api.sage('Der Stöpsel ist schon gezogen.'); return true; }
        if (ctx.obj2 === 'hakenstange' || api.traegt('hakenstange')) {
          wanneLeeren(api, 'Du hältst die Hakenstange ins Wasser, ohne hinzusehen, tastest, fängst die Kette mit dem Haken und ziehst.');
          return true;
        }
        api.sage('Die Kette ist am Rand eingehakt, aber sie ist kürzer, als du dachtest: Um daran zu ziehen, müsstest du ins Wasser greifen.');
        api.fehlversuch('wannenkette', { 2: 'Mit einer langen Stange könntest du die Kette angeln, ohne das Wasser zu berühren.', 3: 'In der Wäschekammer gibt es eine Hakenstange. <span class="nebenbei">(„zieh kette mit hakenstange“)</span> – oder du schöpfst mit einem Eimer.' });
        return true;
      },
      benutzen: function (api, ctx) { return HG.daten.dinge.wannenkette.bei.ziehen(api, ctx); }
    }
  });
  HG.ding('stimmgabel', {
    nomen: 'Stimmgabel', genus: 'f', adj: ['stählern'], woerter: ['stimmgabel', 'gabel'], adjektive: ['angelaufen'],
    ort: null, klein: true,
    stimmgabel: true,   // Kampf: lässt Täuschungen zerfallen (js/engine/gefahr.js)
    beschreibung: 'Eine Stimmgabel aus angelaufenem Stahl, A 440. Am Griff ein Klebestreifen mit der Aufschrift „R. Vogt“. Renate Vogt hat damit den Flügel gestimmt.',
    bei: {
      benutzen: function (api) { return stimme(api); }, spielen: function (api) { return stimme(api); }, klopfen: function (api) { return stimme(api); }
    }
  });
  function stimme(api) {
    api.sage('Du schlägst die Stimmgabel gegen die Handkante und hältst sie ans Ohr. Ein reines, klares A, das lange schwingt. ' + (api.istNacht() ? 'Für einen Augenblick klingt das ganze Haus darum herum falsch – verstimmt, wie ein Klavier, das zu lange niemand gespielt hat.' : 'Alles um dich herum scheint für einen Moment schärfer, deutlicher.'));
    return true;
  }
  HG.ding('badspiegel', {
    nomen: 'Spiegel', genus: 'm', adj: ['klein'], woerter: ['spiegel', 'badspiegel', 'waschbecken', 'hahn', 'haehne'],
    ort: 'bad', fest: 'Der Spiegel ist fest an die Wand geschraubt.', szenerie: true,
    spiegel: 'klein',
    beschreibung: 'Ein Spiegel über dem Waschbecken, die Ränder blind geworden. Hier hat Carsten im Oktober das Rasiermesser gefunden – auf der Ablage, wo vorher keins lag.',
    bei: {
      hineinschauen: function (api) {
        api.sage(api.eig('wanne', 'leer') ? 'Dein Gesicht. Hinter dir die leere Wanne. Leer. Ganz sicher leer.' : 'Dein Gesicht – und hinter dir, im Spiegel, die Wanne. Sie ist voll. Und es liegt jemand darin, bis zum Kinn im schwarzen Wasser, und sieht dich an. Du drehst dich um: Das Wasser ist glatt.');
        api.nervenProbe('0/1W4', { grund: 'Blick in den Badspiegel', gewoehnung: 'badspiegel' });
        return true;
      },
      untersuchen: function (api, ctx) { if (ctx.reflexiv) return HG.daten.dinge.badspiegel.bei.hineinschauen(api); return false; }
    }
  });

  // ===================================================================
  // WÄSCHEKAMMER (im Plan: Kammer)
  // ===================================================================
  HG.raum('waeschekammer', {
    name: 'Wäschekammer',
    woerter: ['waeschekammer', 'kammer', 'naehzimmer', 'abstellkammer'],
    schauplatz: 'haus', karte: { x: 11, y: -1 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Stoff streift dein Gesicht. Irgendwo tickt etwas Metallisches, wie eine Nadel, die auf und ab geht.',
    beschreibung: 'Eine schmale Kammer mit Regalen bis zur Decke, voller sorgfältig gefalteter Bettwäsche. Unter dem Fenster steht eine alte schwarze Singer-Nähmaschine mit goldenen Schnörkeln, daneben lehnt ein Bügelbrett. In der Ecke lehnen eine lange Stange mit Eisenhaken und ein Zinkeimer. Die Tür im Südwesten führt zurück auf die Galerie.',
    kurz: 'Die Wäschekammer: Regale mit Laken, Nähmaschine, Hakenstange, Eimer. Südwesten: Galerie.',
    horchen: { tag: 'Ganz leise, wie im Nebenzimmer: das Rattern einer Nähmaschine, das sofort aufhört, als du hinhörst.', nacht: 'Die Nähmaschine. Sie näht. Niemand sitzt davor.' },
    riechen: 'Lavendelsäckchen zwischen der Wäsche, Maschinenöl, Staub.',
    ausgaenge: { suedwesten: 'galerie' },
    vorschlaege: ['nimm hakenstange', 'nimm laken', 'untersuche nähmaschine'],
    details: [
      { nomen: 'Bügelbrett', genus: 'n', woerter: ['buegelbrett', 'buegeleisen'], text: 'Ein hölzernes Bügelbrett mit verbranntem Bezug. Ein Bügeleisen aus Gusseisen steht darauf, kalt.' },
      { nomen: 'Regale', genus: 'pl', woerter: ['regale', 'regal', 'waesche', 'bettwaesche', 'kissenbezuege', 'lavendelsaeckchen'], text: 'Bettwäsche, sorgfältig gefaltet, mit eingestickten Monogrammen: E. G., dann M. O., dann I. H. Jede Besitzerin hat dazugelegt und nichts weggenommen. Laken gibt es mehr als genug.' }
    ]
  });
  HG.ding('naehmaschine', {
    nomen: 'Nähmaschine', genus: 'f', adj: ['schwarz'], woerter: ['naehmaschine', 'singer', 'maschine', 'nadel', 'faden'],
    ort: 'waeschekammer', fest: true, szenerie: true,
    beschreibung: 'Eine schwarze Singer mit Fußpedal und goldenen Schnörkeln. Unter dem Fuß steckt noch ein Stück Stoff, ein winziger Ärmel aus hellblauem Batist, halb gesäumt. Irmgard Hallmann war Schneiderin. Unter der Tischplatte ist eine kleine Schublade.',
    bei: { spielen: function (api) { api.sage('Du trittst einmal auf das Pedal. Die Nadel fährt herunter, herauf. Irgendwo im Haus lacht eine Frau, erfreut, wie über einen Besuch.'); return true; } }
  });
  HG.ding('naehschublade', {
    nomen: 'Schublade', genus: 'f', adj: ['klein'], woerter: ['schublade', 'naehschublade', 'lade'],
    ort: 'naehmaschine', rel: 'teil', fest: true, szenerie: true, oeffenbar: true, offen: false, behaelter: true,
    beschreibung: 'Eine kleine Schublade unter der Tischplatte der Nähmaschine.'
  });
  HG.ding('schere', {
    nomen: 'Schere', genus: 'f', adj: ['lang'], woerter: ['schere', 'schneiderschere', 'stoffschere'],
    ort: 'naehschublade', rel: 'in',
    klinge: true,   // Kampf: schneidet Stoff und Fäden (js/engine/gefahr.js)
    beschreibung: 'Eine lange Schneiderschere, schwer und scharf. In die Klinge ist „I. H.“ eingraviert.'
  });
  HG.ding('fingerhut', {
    nomen: 'Fingerhut', genus: 'm', adj: ['silbern'], woerter: ['fingerhut'], klein: true,
    ort: 'naehmaschine', rel: 'auf',
    beschreibung: 'Ein silberner Fingerhut, die Grübchen blank gewetzt. Innen, winzig eingraviert: „Für Irmgard. W.“'
  });
  HG.ding('hakenstange', {
    nomen: 'Hakenstange', genus: 'f', adj: ['lang'], woerter: ['hakenstange', 'stange', 'haken', 'eisenhaken'],
    ort: 'waeschekammer',
    beschreibung: 'Eine Holzstange, fast zwei Meter lang, mit einem Eisenhaken an der Spitze. Damit öffnete man Oberlichter und Bodenklappen.',
    texte: { nehmen: 'Du nimmst die Hakenstange. Sie ist unhandlich, aber leicht.' }
  });
  HG.ding('laken', {
    nomen: 'Laken', genus: 'n', adj: ['weiß'], woerter: ['laken', 'bettlaken', 'tuch', 'leinentuch'],
    ort: 'waeschekammer',
    tuch: true,   // zum Verhängen von Spiegeln („verhänge spiegel“), js/engine/gefahr.js
    beschreibung: 'Ein schweres Leinenlaken, gestärkt und nach Lavendel duftend. Groß genug, um einen Spiegel zu verhängen. In den Regalen liegen noch viele davon.',
    texte: { nehmen: 'Du nimmst ein Laken aus dem Regal und legst es dir über den Arm. Es gibt genug davon.' }
  });
  HG.ding('eimer', {
    nomen: 'Eimer', genus: 'm', adj: ['zinken'], woerter: ['eimer', 'zinkeimer', 'kuebel'],
    ort: 'waeschekammer',
    beschreibung: 'Ein verbeulter Zinkeimer mit Holzgriff am Henkel.'
  });

  // ===================================================================
  // GÄSTEZIMMER (Carstens Schlafzimmer)
  // ===================================================================
  HG.raum('gaestezimmer', {
    name: 'Gästezimmer',
    woerter: ['gaestezimmer', 'carstens zimmer', 'schlafraum'],
    schauplatz: 'haus', karte: { x: 12, y: -1 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Ein Geruch nach kaltem Kaffee und ungewaschener Bettwäsche. Und nach Lavendel.',
    beschreibung: 'Hier hat Carsten in seinen letzten Monaten geschlafen. Das Bett ist ungemacht, das Kissen trägt noch den Abdruck eines Kopfes. Auf dem Nachttisch stehen zwei Kaffeetassen, beide mit einem braunen Rand. In einer Ecke liegt ein Stapel sorgfältig gefalteter Laken. Über einer Kommode hängt ein Wandspiegel, an dessen Rahmen ein gelber Klebezettel klebt. Vor dem Bett steht ein silberner Alukoffer. Die Tür im Westen führt zurück auf die Galerie.',
    kurz: 'Carstens Zimmer: ungemachtes Bett, zwei Tassen, Wandspiegel mit Zettel, der Alukoffer. Westen: Galerie.',
    horchen: { tag: 'Stille. Dann, sehr leise, zwei Löffel, die in zwei Tassen rühren.', nacht: 'Jemand atmet im Bett. Langsam, tief, wie im Schlaf. Das Bett ist leer.' },
    riechen: 'Kalter Kaffee. Carstens Aftershave. Lavendel.',
    versteckOrt: { text: 'Du kriechst unter das Bett. Der Lattenrost ist so nah über deinem Gesicht, dass du jeden Abdruck sehen könntest, wenn sich jemand hinlegte.', mod: 0 },
    schlafplatz: 'Du legst dich in Carstens Bett. Es riecht nach ihm. Lange liegst du wach, dann schläfst du ein.',
    bei: {
      schlafen: function (api) {
        if (!api.istNacht()) return false;
        HG.daten.gefahren.schlaefer.einschlafen(api, 'Du legst dich in Carstens Bett, nur kurz, nur die Augen zumachen …');
        return true;
      }
    },
    ausgaenge: { westen: 'galerie' },
    vorschlaege: ['untersuche koffer', 'lies klebezettel', 'untersuche tassen'],
    details: [
      { nomen: 'Kaffeetassen', genus: 'pl', woerter: ['kaffeetassen', 'tassen', 'tasse', 'nachttisch', 'kaffee'], text: 'Zwei Tassen mit eingetrocknetem Kaffeerand. An einer ist ein Abdruck von Lippenstift, blassrosa, altmodisch. Carsten trank keinen Kaffee – das steht in seinem Tagebuch.' },
      { nomen: 'Laken', genus: 'pl', woerter: ['spiegellaken', 'stapel', 'lakenstapel'], text: 'Laken, akkurat auf Kante gefaltet, mit Reißzwecklöchern an den Ecken. Damit hatte Carsten die Spiegel verhängt. Im September hat er sie abgenommen – „weil sie es nicht mag“, steht im Tagebuch.' },
      { nomen: 'Bett', genus: 'n', woerter: ['bett', 'kissen', 'bettdecke'], text: 'Ein Doppelbett, ungemacht. Zwei Kissen, und in beiden ein Abdruck.', versteckOrt: { text: 'Du kriechst unter das Bett.', mod: 0 } }
    ]
  });
  HG.ding('gaeste_spiegel', {
    nomen: 'Wandspiegel', genus: 'm', woerter: ['wandspiegel', 'spiegel', 'kommode', 'rahmen'],
    ort: 'gaestezimmer', fest: 'Der Spiegel hängt fest.', szenerie: true,
    spiegel: 'klein',
    beschreibung: 'Ein ovaler Spiegel im Goldrahmen über einer Kommode. Am Rahmen klebt ein gelber Zettel in Carstens Schrift.',
    bei: { hineinschauen: function (api) { api.sage('Dein Gesicht – müde, blass. Hinter dir das Bett. Einen Atemzug lang sitzt jemand auf der Bettkante, ein Mann mit Carstens Schultern, und hebt grüßend eine Tasse.'); api.nervenProbe('0/1W3', { grund: 'Blick in den Spiegel', gewoehnung: 'gaeste_spiegel' }); return true; } }
  });
  HG.ding('klebezettel', {
    nomen: 'Klebezettel', genus: 'm', adj: ['gelb'], woerter: ['klebezettel', 'zettel', 'postit', 'notiz'],
    ort: 'gaeste_spiegel', rel: 'teil', fest: true, szenerie: true,
    beschreibung: 'Ein gelber Klebezettel, mehrfach überschrieben.',
    lesbar: '<i>„Mein Tag. Unser Tag. 3.8.“</i><br>Darunter, mit anderem Stift: <i>„Sie sagt, es ist auch ihr Tag.“</i>'
  });
  // „Der Koffer“: Zahlenschloss 0308 (Tag des Hauskaufs; Tor-Code im Lager)
  function oeffneKoffer(api, text) {
    api.setze('koffer', 'verschlossen', false);
    api.setze('koffer', 'offen', true);
    api.sage(text + ' Im Schaumstoff liegen Carstens Messgeräte, sauber in ihren Fächern: ein Laser-Entfernungsmesser, ein Zollstock, eine Wasserwaage – und ein Bündel Notizen.');
  }
  HG.ding('koffer', {
    nomen: 'Vermessungskoffer', genus: 'm', adj: ['silbern'], kurzwort: 'koffer',
    woerter: ['vermessungskoffer', 'koffer', 'alukoffer', 'aktenkoffer', 'schloss', 'zahlenschloss', 'raedchen', 'zahlenraedchen'],
    ort: 'gaestezimmer', szenerie: true, fest: 'Der Koffer ist schwer und voller Metall. Du lässt ihn hier und öffnest ihn lieber.',
    oeffenbar: true, offen: false, verschlossen: true, behaelter: true,
    beschreibung: function (api) {
      return 'Ein silberner Alukoffer mit abgestoßenen Ecken und einem Aufkleber „Häuser Vermessung“. ' + (api.eig('koffer', 'offen') ? 'Er steht offen.' : 'Er ist mit einem Zahlenschloss gesichert – vier kleine Rädchen.');
    },
    zahlenschloss: {
      stellen: 4, code: '0308',
      bereit: function (api) { return api.eig('koffer', 'offen') ? 'Der Koffer ist schon offen.' : true; },
      richtig: function (api) { oeffneKoffer(api, 'Null, drei, null, acht. Das Schloss springt auf. Der Tag, an dem Carsten das Haus gekauft hat.'); },
      falsch: 'Die Schlösser rühren sich nicht.',
      tipps: { falsch: { 2: 'Carsten hat für das Tor im Lager einen Code benutzt, der ihm etwas bedeutete. Vielleicht auch hier?', 3: 'Der Klebezettel am Spiegel: „Mein Tag. Unser Tag. 3.8.“ <span class="nebenbei">(„drehe rädchen auf 0308“)</span>' } }
    },
    proben: {
      knacken: {
        wer: 'handwerk', mod: function (api) { return api.traegt('feinwerkzeug') ? 20 : -20; }, grund: 'Zahlenschloss',
        wenn: function (api) { return !api.eig('koffer', 'offen'); },
        erfolg: function (api) { oeffneKoffer(api, 'Du tastest mit dem feinen Schraubendreher nach den Sperrscheiben, eine nach der anderen. Klick.'); },
        misserfolg: 'Die Rädchen drehen sich, aber das Schloss bleibt zu.',
        tipps: { 2: 'Ohne feines Werkzeug ist das kaum zu schaffen – und vielleicht kennst du den Code ja schon.', 3: 'Der Code steht am Spiegel: „3.8.“ <span class="nebenbei">(„drehe rädchen auf 0308“)</span>' }
      }
    },
    bei: {
      zerbrechen: function (api) {
        if (api.eig('koffer', 'offen')) { api.sage('Er ist schon offen.'); return true; }
        api.setze('laser', 'kaputt', true);
        oeffneKoffer(api, 'Du setzt den Absatz auf die Schlösser und trittst zu, wieder und wieder, bis das Blech nachgibt. Der Koffer springt auf – und etwas darin knackt.');
        api.sage('Das Display des Laser-Entfernungsmessers ist gesprungen. Er zeigt nur noch Striche.');
        return true;
      }
    }
  });
  HG.ding('laser', {
    nomen: 'Laser-Entfernungsmesser', genus: 'm', kurzwort: 'laser',
    woerter: ['laserentfernungsmesser', 'entfernungsmesser', 'laser', 'messgeraet', 'distanzmesser'],
    ort: 'koffer', rel: 'in',
    beschreibung: function (api) { return api.eig('laser', 'kaputt') ? 'Ein gelber Laser-Entfernungsmesser. Das Display ist gesprungen; er zeigt nur noch Striche. Messen musst du jetzt von Hand.' : 'Ein gelber Laser-Entfernungsmesser, Carstens wichtigstes Werkzeug. Damit misst man Räume auf den Millimeter genau – und findet, was fehlt.'; },
    bei: { benutzen: function (api) { api.sage(api.eig('laser', 'kaputt') ? 'Das Display bleibt dunkel.' : 'Ein roter Punkt springt an die Wand. „' + (3 + Math.floor(HG.zufall() * 600) / 100).toFixed(2) + ' m“. Hier oben stimmt alles mit Bernwards Plan überein. Die fehlenden Meter, von denen Carsten schreibt, liegen woanders – unten.'); return true; } }
  });
  HG.ding('messnotizen', {
    dokument: true,
    nomen: 'Notizen', genus: 'pl', woerter: ['notizen', 'messnotizen', 'buendel', 'messprotokoll'],
    ort: 'koffer', rel: 'in',
    beschreibung: 'Ein Bündel karierter Zettel in Carstens Schrift, Zahlenkolonnen und Skizzen.',
    lesbar: '„EG Halle: 6,00 × 8,50 – stimmt. Keller unter Halle: Flur 6,00, dann WAND. Plan: Kohlenkeller 6,00 × 8,50. Gemessen: Heizungskeller bis Wand 3,60. Fehlen: 2,40 m. WO?“ Darunter, dick unterstrichen: „Nicht allein runtergehen.“'
  });

  // ===================================================================
  // Spuk im Obergeschoss (Tag und Nacht je Raum)
  // ===================================================================
  var TAG = ['morgen', 'mittag'], NACHT = ['nacht'];
  HG.spuk('galerie_kreppband', { art: 'bewegung', orte: ['galerie'], zeiten: TAG, chance: 0.1, max: 1, hell: true,
    text: 'Ein Streifen Kreppband löst sich vom Geländer und segelt langsam in die Halle hinunter. Unten bleibt er genau dort liegen, wo Natascha lag.', nerven: '0/1W2', grund: 'Kreppband' });
  HG.spuk('galerie_staubsauger', { art: 'geraeusch', orte: ['galerie'], zeiten: NACHT, chance: 0.2, max: 2,
    text: 'Unten in der Halle springt ein Staubsauger an. Das Brummen kommt die Treppe herauf, Stufe für Stufe, und hört genau vor dir auf. Auf der obersten Stufe liegt ein Kabel. Es war eben noch nicht da.', nerven: '1/1W6', grund: 'Staubsauger' });
  HG.spuk('krankenzimmer_gurte', { art: 'geraeusch', orte: ['schlafzimmer'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Hinter dir das Knarren von Leder. Als du dich umdrehst, ist einer der Gurte am Krankenbett straff gespannt, als läge ein Handgelenk darin. Dann sackt er herab.', nerven: '0/1W3', grund: 'Gurt' });
  HG.spuk('krankenzimmer_rollstuhl', { art: 'geraeusch', orte: ['schlafzimmer'], zeiten: NACHT, chance: 0.2, max: 2, bild: true,
    text: 'Gummiräder auf Parkett. Sie rollen vom Bett zum Fenster, ganz nah an dir vorbei, und du spürst den Luftzug an deinen Knöcheln. Im Turmerker bleiben sie stehen. Niemand ist da.', nerven: '1/1W6', grund: 'Rollstuhl' });
  HG.spuk('bibliothek_buch', { art: 'bewegung', orte: ['bibliothek'], zeiten: TAG, chance: 0.1, max: 1, hell: true,
    text: 'Ein Buch rutscht aus dem Regal und fällt aufgeschlagen auf den Boden. „Grundrisse städtischer Villen“. Auf der Seite ein Haus, das diesem gleicht – und ein Zimmer ohne Fenster ist mit Bleistift eingekreist.', nerven: '0/1W2', grund: 'Buch' });
  HG.spuk('bibliothek_glastuer', { art: 'illusion', orte: ['bibliothek'], zeiten: NACHT, chance: 0.2, max: 2, hell: true, spiegel: 'gross', bild: true,
    text: 'In einer der Glastüren steht jemand hinter dir und liest über deine Schulter mit. Als du dich umdrehst, ist da nur das Regal. Im Glas blättert die Gestalt eine Seite um.', nerven: '1/1W6', grund: 'Gestalt im Glas' });
  HG.spuk('kinderzimmer_klicken', { art: 'geraeusch', orte: ['kinderzimmer'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Im Puppenhaus klickt eine winzige Tür. Als du hinsiehst, steht sie offen – die Tür zum winzigen Bad.', nerven: '0/1W2', grund: 'Puppenhaus' });
  HG.spuk('kinderzimmer_fluestern', { art: 'geraeusch', orte: ['kinderzimmer'], zeiten: NACHT, chance: 0.25, max: 2, bild: true,
    text: function (api) { return api.bekehrt('bettina') ? 'Eine Mädchenstimme, ganz nah: „Sie ist auf der Galerie. Bleib hier, bis sie weg ist.“ Diesmal glaubst du ihr.' : 'Eine Mädchenstimme, ganz nah an deinem Ohr: „Geh runter. Schnell. Unten ist es sicher.“ Sie kichert.'; },
    nerven: '0/1W4', grund: 'Flüstern' });
  HG.spuk('bad_tropfen', { art: 'geraeusch', orte: ['bad'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Ein Tropfen fällt in die Wanne. Die Ringe breiten sich aus – und laufen zurück, zur Mitte hin, als spule jemand die Zeit rückwärts.', nerven: '0/1W3', grund: 'Wasser' });
  HG.spuk('bad_atmen', { art: 'illusion', orte: ['bad'], zeiten: NACHT, chance: 0.2, max: 2, bild: true,
    bedingung: function (api) { return !api.eig('wanne', 'leer'); },
    text: 'Auf dem schwarzen Wasser steigen Blasen auf, langsam, regelmäßig. Wie Atem. Dann bricht die Oberfläche einen Fingerbreit auf, und ein Mund holt Luft.', nerven: '1/1W6', grund: 'Atem im Wasser' });
  HG.spuk('kammer_naehmaschine', { art: 'geraeusch', orte: ['waeschekammer'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Die Nähmaschine macht einen einzigen Stich. Die Nadel fährt herab und bleibt im hellblauen Ärmel stecken.', nerven: '0/1W2', grund: 'Nähmaschine' });
  HG.spuk('kammer_rattern', { art: 'geraeusch', orte: ['waeschekammer'], zeiten: NACHT, chance: 0.2, max: 2, bild: true,
    text: 'Die Nähmaschine rattert. Das Pedal hebt und senkt sich, die Nadel fliegt, und Stoff schiebt sich unter ihr hindurch, hellblau, endlos, ein Ärmel nach dem anderen.', nerven: '1/1W6', grund: 'Nähmaschine' });
  HG.spuk('gaestezimmer_tassen', { art: 'bewegung', orte: ['gaestezimmer'], zeiten: TAG, chance: 0.1, max: 1, hell: true,
    text: 'Auf dem Nachttisch klirren die beiden Tassen leise gegeneinander. Wie zwei Menschen, die anstoßen.', nerven: '0/1W2', grund: 'Tassen' });
  HG.spuk('gaestezimmer_atmen', { art: 'geraeusch', orte: ['gaestezimmer'], zeiten: NACHT, chance: 0.2, max: 2, bild: true,
    text: 'Die Bettdecke hebt und senkt sich. Darunter atmet jemand, ruhig und tief. Als du die Decke zurückschlägst, ist das Laken warm.', nerven: '1/1W6', grund: 'Atem im Bett' });

  // ===================================================================
  // Anschlüsse im Erdgeschoss: Treppe frei, Verstecke, Zitronen in der Speisekammer
  // ===================================================================
  var halle = HG.daten.raeume.halle;
  halle.ausgaenge.hoch = { ziel: 'galerie', gefahr: 'witwe' };
  halle.versteck = null;
  halle.versteckOrt = { text: 'Du drückst dich in den Winkel unter der Treppe, zwischen die Wand und die schräge Unterseite der Stufen. Hier ist es so dunkel, dass du deine eigene Hand nicht siehst.', mod: 10 };
  var garderobe = HG.daten.raeume.garderobe;
  if (garderobe) garderobe.versteckOrt = { text: 'Du drückst dich in den hintersten Winkel der Garderobe, unter die Hutablage, und ziehst Carstens Regenjacke vor dich.', mod: 0 };
  var speisekammer = HG.daten.raeume.speisekammer;
  if (speisekammer) {
    speisekammer.versteckOrt = { text: 'Du kauerst dich hinter das unterste Regal, zwischen Eimer und Besen. Es riecht nach Essig und Lavendel.', mod: 10 };
    speisekammer.details.push({ nomen: 'Zitronenhälften', genus: 'pl', woerter: ['zitronen', 'zitronenhaelften', 'zitrone', 'schaelchen', 'federhalter', 'feder'],
      text: 'Auf dem mittleren Regal steht ein Porzellanschälchen mit eingetrockneten Zitronenhälften, steinhart und braun. Daneben liegt ein alter Federhalter mit rostiger Feder. Wer schreibt in einer Speisekammer – und womit?',
      riechen: 'Ganz schwach noch: Zitrone.' });
  }
})();
