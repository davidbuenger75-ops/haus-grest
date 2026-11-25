// Haus Grest – Inhalt: der Dachboden (Spielbibel 4 „Dachboden im Spiel“, 8.9)
// Speicher mit den Kisten der Vorbesitzer (Wissen über die Diener), Hallmanns Kiste (Code 0258 – der Kalender steckt
// in seinem Mantel daneben), Grubenlampe mit Karbid; Mädchenkammer (Ritzung „L. W. 1928“), Wäscheboden (Die Näherin),
// Turmerker (Krähennest). Dazu: die Kellerkette lässt sich mit Hallmanns Bügelsäge oder dem Brecheisen öffnen
// (der Keller selbst folgt), und Wolfgang Hallmann lässt sich bekehren.
(function () {

  function nacht(api) { return api.istNacht(); }

  // ===================================================================
  // Zugang: die Bodenklappe an der Galerie
  // ===================================================================
  HG.daten.raeume.galerie.ausgaenge.hoch = {
    ziel: 'speicher',
    sperre: function (api) {
      if (!api.eig('bodenklappe', 'offen')) return 'Die Bodenklappe ist zu, und der Eisenring hängt gut einen Meter über deinen Fingerspitzen. Du bräuchtest etwas, um ihn zu erreichen.';
      return null;
    },
    text: 'Du steigst die wacklige Leiter hinauf, Sprosse um Sprosse, und schiebst den Kopf durch die Luke in kalte, staubige Luft.'
  };

  // ===================================================================
  // SPEICHER
  // ===================================================================
  HG.raum('speicher', {
    name: 'Speicher',
    woerter: ['speicher', 'dachboden', 'boden', 'dach'],
    schauplatz: 'haus', karte: { x: 20, y: 0 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Über dir knackt das Gebälk. Irgendwo scharrt etwas über Holz – eine Kiste, die jemand ein Stück weiterschiebt.',
    beschreibung: function (api) {
      return 'Der Speicher zieht sich unter dem ganzen Walmdach hin, Balken und Sparren wie die Rippen eines umgedrehten Schiffs. Durch zwei Gauben fällt ' +
        (api.istNacht() ? 'kein Licht, nur Schwärze mit ein paar Sternen' : 'graues Licht auf Staub, der seit Jahrzehnten liegt') + '. ' +
        'An der Wand stehen Kisten aufgereiht, jede mit einem Namen in anderer Schrift: <b>OSTERMANN</b>, <b>DR. ALBERS</b>, <b>TEUBNER</b>, <b>BRZEZINSKI</b>, <b>BRINKHOFF</b>. ' +
        'Etwas abseits, unter einem Nagel, an dem ein alter Herrenmantel hängt, steht eine Holzkiste mit einem Zahlenschloss: <b>HALLMANN</b>. ' +
        'Im Nordosten führt eine Tür auf den Wäscheboden, im Süden eine niedrige in eine Kammer, im Südosten geht es in das Türmchen. Die Luke führt hinunter zur Galerie.';
    },
    kurz: 'Der Speicher mit den Kisten der Vorbesitzer und Hallmanns Kiste. Nordosten: Wäscheboden, Süden: Kammer, Südosten: Turmerker, runter: Galerie.',
    horchen: { tag: 'Tauben auf dem Dach. Der Wind in den Ziegeln. Und ganz leise, unter allem: ein Ticken, wie von einer Taschenuhr.', nacht: 'Schritte auf den Dielen, langsam, von Kiste zu Kiste. Sie bleiben stehen, wo du stehst.' },
    riechen: 'Staub, Taubenkot, Mottenpulver und kalter Zigarrenrauch.',
    versteckOrt: { text: 'Du kauerst dich zwischen die Kisten, hinter BRZEZINSKI, und ziehst die Knie an. Es riecht nach Kohle.', mod: 10 },
    ausgaenge: { runter: 'galerie', nordosten: 'waescheboden', sueden: 'maedchenkammer', suedosten: 'turmerker' },
    vorschlaege: function (api) {
      var v = [];
      ['kiste_ostermann', 'kiste_albers', 'kiste_teubner', 'kiste_brzezinski', 'kiste_brinkhoff'].forEach(function (k) {
        if (!api.eig(k, 'offen')) v.push('öffne ' + HG.daten.dinge[k].kurzwort);
      });
      v.push('untersuche mantel');
      if (!api.eig('hallmann_kiste', 'offen')) v.push('untersuche hallmanns kiste');
      return v.slice(0, 5);
    },
    details: [
      { nomen: 'Gebälk', genus: 'n', woerter: ['gebaelk', 'balken', 'sparren', 'dachbalken', 'ziegel', 'gauben', 'gaube'], text: 'Eichenbalken, dunkel vom Alter. In einen hat jemand Striche geritzt, zu Fünferbündeln, wie ein Gefangener seine Tage zählt. Daneben die Jahreszahl 1974.' }
    ]
  });

  // --- Die Kisten der Vorbesitzer: das Wissen über die Diener ------------
  function kiste(id, def) {
    HG.ding(id, Object.assign({
      genus: 'f', ort: 'speicher', fest: 'Die Kiste ist zu schwer. Du öffnest sie lieber hier.', szenerie: true,
      oeffenbar: true, offen: false, behaelter: true
    }, def, {
      bei: Object.assign({
        oeffnen: function (api) {
          if (api.eig(id, 'offen')) return false;
          api.setze(id, 'offen', true);
          api.sage(HG.wert(def.inhaltText, api));
          if (def.wissen) api.hinweis(def.wissen);
          return true;
        },
        durchsuchen: function (api) { return HG.daten.dinge[id].bei.oeffnen(api) || false; }
      }, def.bei || {})
    }));
  }
  kiste('kiste_ostermann', {
    nomen: 'Kiste', adj: ['grau'], zusatz: function () { return 'Ostermann'; }, kurzwort: 'ostermann-kiste',
    woerter: ['kiste', 'ostermann', 'ostermannkiste', 'ostermann-kiste'],
    beschreibung: function (api) { return 'Eine graue Pappkiste, mit Bindfaden verschnürt, „OSTERMANN“ in Sütterlin.' + (api.eig('kiste_ostermann', 'offen') ? ' Darin: ein Kissenbezug mit Monogramm „H. O.“, ein braunes Fläschchen Veronal, halb leer, und ein Haushaltsbuch, in dem auf den letzten Seiten keine Ausgaben mehr stehen, sondern Sätze.' : ''); },
    inhaltText: 'Du löst den Bindfaden. Obenauf ein Kissenbezug mit dem gestickten Monogramm „H. O.“, darunter ein braunes Fläschchen <i>Veronal – Schlafmittel</i>, halb leer. Ganz unten ein Haushaltsbuch von 1938. Die letzten Seiten sind in einer runden Frauenschrift geschrieben: <i>„Heinrich spricht wieder mit mir. Abends, im Spiegel. Er sagt, er schläft jetzt so gut. Ich soll zu ihm kommen. Ich gehe nicht mehr hinaus. Ich mache niemandem mehr auf.“</i> Der letzte Eintrag: <i>„Er steht unten an der Treppe und ruft.“</i>',
    wissen: 'kiste_ostermann'
  });
  kiste('kiste_albers', {
    nomen: 'Koffer', genus: 'm', adj: ['braun'], zusatz: function () { return 'von Dr. Albers'; }, kurzwort: 'albers-kiste',
    woerter: ['koffer', 'arztkoffer', 'zahnarztkoffer', 'albers', 'albers-kiste', 'kiste'],
    beschreibung: function (api) { return 'Ein brauner Lederkoffer mit Messingschloss, „DR. K. ALBERS – ZAHNARZT“ auf dem Deckel.' + (api.eig('kiste_albers', 'offen') ? ' Darin Zahnarztbesteck, ein Brief von 1945 und eine Rechnung der Stadtwerke.' : ''); },
    inhaltText: 'Der Koffer klappt auf. Zahnarztbesteck in verblichenem Samt, Spiegelchen an langen Stielen. Ein Brief vom Mai 1945 an einen Bruder: <i>„Die ganze Straße liegt in Trümmern. Nur unser Haus steht. Nicht ein Fenster ist gesprungen. Ich weiß nicht, ob ich dankbar sein soll.“</i> Darunter eine Rechnung der Stadtwerke vom Oktober 1946 mit einem Stempel: <i>„Anschluss nach Unglücksfall gesperrt. Herd verplombt.“</i>',
    wissen: 'kiste_albers'
  });
  kiste('kiste_teubner', {
    nomen: 'Schachtel', adj: ['blau'], zusatz: function () { return 'Teubner'; }, kurzwort: 'teubner-schachtel',
    woerter: ['schachtel', 'hutschachtel', 'teubner', 'teubner-schachtel', 'kiste'],
    beschreibung: function (api) { return 'Eine blaue Hutschachtel, „W. TEUBNER“ mit Bleistift.' + (api.eig('kiste_teubner', 'offen') ? ' Darin ein Bündel Feldpostbriefe und eine Benachrichtigung von 1944.' : ''); },
    inhaltText: 'In der Hutschachtel liegt ein Bündel Feldpostbriefe, mit rotem Band verschnürt, alle unterschrieben mit <i>„Dein Otto“</i>. Obenauf ein Formblatt vom August 1944: <i>„… teilen wir Ihnen mit, dass Ihr Ehemann, Gefreiter Otto Teubner, bei Kämpfen in Ostpreußen gefallen ist.“</i> Auf die Rückseite hat sie geschrieben, 1955, in zittriger Schrift: <i>„Er steht wieder vor dem Fenster. Im ersten Stock. Wie kann er da stehen?“</i>',
    wissen: 'kiste_teubner'
  });
  kiste('kiste_brzezinski', {
    nomen: 'Kiste', adj: ['schwarz'], zusatz: function () { return 'Brzezinski'; }, kurzwort: 'brzezinski-kiste',
    woerter: ['kiste', 'brzezinski', 'brzezinski-kiste', 'kohlenkiste', 'holzkiste'],
    beschreibung: function (api) { return 'Eine schwarze Holzkiste, „J. BRZEZINSKI – ZECHE GNEISENAU“ mit weißer Farbe.' + (api.eig('kiste_brzezinski', 'offen') ? ' Darin liegen ein Brief, ein Zeitungsausschnitt' + (api.eig('grubenlampe', 'ort') === 'kiste_brzezinski' ? ', eine Grubenlampe' : '') + (api.eig('karbid', 'ort') === 'kiste_brzezinski' ? ' und eine Dose Karbid' : '') + '.' : ''); },
    inhaltText: 'Die Kiste riecht nach Kohle. Obenauf ein Zeitungsausschnitt von 1951 – <i>„Drei Kumpel nach vier Tagen lebend geborgen“</i> –, einer der drei ist Josef Brzezinski. Darunter ein Brief seiner Frau Hedwig an ihre Schwester, 1963: <i>„Er hat in einer Nacht alle Spiegel im Haus zerschlagen. Am Morgen waren sie heil, alle, und er saß davor mit zerschnittenen Händen und hat nicht mehr geatmet.“</i> Ganz unten liegen eine alte Grubenlampe aus Messing und eine Blechdose Karbid.',
    wissen: 'kiste_brzezinski'
  });
  kiste('kiste_brinkhoff', {
    nomen: 'Kiste', adj: ['länglich'], zusatz: function () { return 'Brinkhoff'; }, kurzwort: 'brinkhoff-kiste',
    woerter: ['kiste', 'brinkhoff', 'brinkhoff-kiste', 'zeichenrollen', 'rollen', 'planrollen'],
    beschreibung: function (api) { return 'Eine längliche Planlade aus Sperrholz, „BRINKHOFF“ mit Filzstift.' + (api.eig('kiste_brinkhoff', 'offen') ? ' Darin Zeichenrollen und ein Notizblock.' : ''); },
    inhaltText: 'In der Planlade liegen Zeichenrollen, Dutzende, alle von diesem Haus, und alle etwas anders: Mal hat der Flur einen Knick, mal ist ein Zimmer dazugekommen, mal führt eine Tür ins Nichts. Ein Notizblock, 1986, in Brinkhoffs nervöser Schrift: <i>„Sie sagt, ich soll weiterbauen. Wenn die Türen nicht dorthin führen, wo Bernward sie hingesetzt hat, findet niemand mehr hinaus. Bernwards Pläne sind das Einzige, was sie nicht ändern kann.“</i>',
    wissen: 'kiste_brinkhoff'
  });

  // --- Grubenlampe und Karbid (Kiste Brzezinski) -------------------------
  HG.ding('grubenlampe', {
    nomen: 'Grubenlampe', genus: 'f', adj: ['messingfarben', 'alt'], woerter: ['grubenlampe', 'lampe', 'karbidlampe', 'messinglampe'],
    ort: 'kiste_brzezinski', rel: 'in',
    lichtquelle: true, anzuendbar: true, brennt: false,
    lichtStaerke: 4,   // Kampf: HALT −4 (js/engine/gefahr.js)
    vorrat: {
      start: 0, proMinute: 0.83, einheit: ' %', warnung: [20],   // eine halbe Dose Karbid reicht etwa zwei Stunden
      warnText: 'Die Flamme der Grubenlampe wird kleiner und bläulicher. Das Karbid geht zur Neige.',
      leerText: 'Die Grubenlampe zischt, flackert und erlischt. Kein Karbid mehr.'
    },
    beschreibung: function (api) {
      var v = HG.licht.prozent('grubenlampe');
      return 'Eine Karbidlampe aus Messing, wie sie die Bergleute trugen: unten der Behälter fürs Karbid, oben der Wassertank, vorn ein Reflektor. In den Boden ist „J. B.“ geritzt. ' +
        (api.eig('grubenlampe', 'brennt') ? 'Die Flamme brennt weiß und hell und zischt leise. Ihr Licht ist härter als jedes andere im Haus.' : v > 0 ? 'Karbid ist eingefüllt (' + v + ' %).' : 'Der Behälter ist leer. Ohne Karbid brennt sie nicht.');
    },
    texte: {
      anzuenden: 'Wasser tropft aufs Karbid, es zischt, du hältst das Streichholz an den Brenner – und eine weiße, harte Flamme springt auf. Das Licht schneidet durch die Dunkelheit wie ein Messer. Die Schatten weichen nicht zurück. Sie fliehen.',
      loeschen: 'Du drehst das Wasser ab. Die Flamme schrumpft und erlischt.'
    }
  });
  HG.daten.dinge.grubenlampe.vorrat.leerText = function (api) { return api.flag('karbid_eingefuellt') ? 'Die Grubenlampe zischt, flackert und erlischt. Kein Karbid mehr.' : 'Der Behälter der Grubenlampe ist leer. Ohne Karbid brennt sie nicht.'; };
  function fuelleKarbid(api) {
    if (api.flag('karbid_eingefuellt')) { api.sage('Die Dose ist leer. Du hast das Karbid schon eingefüllt.'); return true; }
    if (!api.traegt('grubenlampe')) { api.sage('Dafür musst du die Grubenlampe in der Hand haben.'); return true; }
    api.setzeFlag('karbid_eingefuellt');
    api.setze('grubenlampe', 'vorratStand', 100);
    api.setze('karbid', 'leer', true);
    api.sage('Du schraubst den Behälter auf und schüttest das Karbid hinein, graue Brocken, die nach faulem Knoblauch riechen. Die Dose war nur halb voll. Für zwei Stunden Licht wird es reichen, vielleicht.');
    return true;
  }
  HG.ding('karbid', {
    nomen: 'Karbiddose', genus: 'f', adj: ['blechern'], kurzwort: 'karbid',
    woerter: ['karbiddose', 'karbid', 'dose', 'blechdose'], klein: true,
    ort: 'kiste_brzezinski', rel: 'in',
    beschreibung: function (api) { return api.eig('karbid', 'leer') ? 'Eine leere Blechdose, innen grauer Staub.' : 'Eine Blechdose „Calciumcarbid – Vorsicht, nicht nass werden lassen“. Sie ist etwa halb voll.'; },
    riechen: 'Fauliger Knoblauch.',
    bei: {
      fuellen: function (api) { return fuelleKarbid(api); },
      benutzen: function (api, ctx) { var a = ctx.obj === 'karbid' ? ctx.obj2 : ctx.obj; if (a === 'grubenlampe' || !a) return fuelleKarbid(api); return false; },
      legen: function (api, ctx) { if (ctx.obj2 === 'grubenlampe') return fuelleKarbid(api); return false; }
    }
  });
  HG.daten.dinge.grubenlampe.bei = {
    fuellen: function (api, ctx) { if (ctx.obj2 === 'karbid' || api.traegt('karbid') || HG.welt.umfeld().indexOf('karbid') >= 0) return fuelleKarbid(api); return false; },
    benutzen: function (api, ctx) { var a = ctx.obj === 'grubenlampe' ? ctx.obj2 : ctx.obj; if (a === 'karbid') return fuelleKarbid(api); return false; }
  };

  // --- Hallmanns Mantel mit dem Taschenkalender (Fingerzeig für 0258) -----
  HG.ding('hallmann_mantel', {
    nomen: 'Mantel', genus: 'm', adj: ['grau', 'alt'], woerter: ['mantel', 'herrenmantel', 'nagel', 'manteltasche', 'tasche', 'taschen'],
    ort: 'speicher', fest: 'Der Mantel hängt hier, seit fünfzig Jahren. Du lässt ihn hängen.', szenerie: true,
    beschreibung: 'Ein grauer Herrenmantel aus schwerem Loden, an den Schultern ausgeblichen. Am Kragen ein Abzeichen eines Dortmunder Gymnasiums. In der Brusttasche zeichnet sich etwas Flaches, Eckiges ab.',
    riechen: 'Kalter Pfeifentabak. Und Rauch – nicht Tabak. Brandrauch.'
  });
  HG.ding('taschenkalender', {
    dokument: true,
    nomen: 'Taschenkalender', genus: 'm', adj: ['klein'], woerter: ['taschenkalender', 'kalender', 'notizkalender'],
    ort: 'speicher', rel: null,
    versteckt: { bei: 'hallmann_mantel', wie: ['durchsuchen', 'tasten', 'hineinschauen', 'nehmen', 'in'], text: 'In der Brusttasche des Mantels steckt ein kleiner Taschenkalender von 1974, abgegriffen, der Rücken gebrochen.' },
    andeutung: ['flach', 'eckig'],
    beschreibung: 'Ein Taschenkalender von 1974, Kunstleder, „W. Hallmann“ auf dem Vorsatzblatt. Viele Seiten tragen dieselbe Notiz.',
    lesbar: 'Im Herbst stehen auf vielen Seiten nur Uhrzeiten, in Hallmanns kleiner, genauer Schrift: <i>„2:58 – Telefon. I.“</i> – <i>„2:58 – nicht rangegangen. 3 Nächte Ruhe.“</i> – <i>„2:58 – rangegangen.“</i><br><br>Der <b>4. November</b> ist mit Tinte eingekreist. Daneben, in einer anderen, zarten, steilen Handschrift, die nicht Hallmanns ist:<br><i>„2:58 – SIE hat gerufen.“</i>',
    foto: 'Auf deinem Foto ist der Kreis um den 4. November nicht blau, sondern rotbraun.'
  });

  // --- Hallmanns Kiste: Zahlenschloss 0258 ------------------------------
  function oeffneHallmann(api, text) {
    api.setze('hallmann_kiste', 'verschlossen', false);
    api.setze('hallmann_kiste', 'offen', true);
    api.sage(text + ' Obenauf liegt eine Taschenuhr. Darunter ein Stapel karierter Hefte, mit Gummiband zusammengehalten – Messprotokolle. Und ganz unten eine Werkzeugkiste aus Blech.');
  }
  function laerm(api, wie) {
    if (!api.istNacht()) return;
    api.sage(wie || 'Der Lärm hallt durch das ganze Haus. Unter dir, im Obergeschoss, öffnet sich eine Tür.');
    if (api.nachtphase() === 'tief' || api.nachtphase() === 'daemmerung') api.kampf('die_wandernde', {});
  }
  HG.ding('hallmann_kiste', {
    nomen: 'Kiste', genus: 'f', adj: ['hölzern'], zusatz: function () { return 'Hallmann'; }, kurzwort: 'hallmanns kiste',
    woerter: ['kiste', 'hallmann', 'hallmanns', 'holzkiste', 'zahlenschloss', 'schloss', 'ziffern', 'raedchen', 'zahlenraedchen'],
    ort: 'speicher', szenerie: true, fest: 'Die Kiste ist mit Eisenbändern beschlagen und viel zu schwer.',
    oeffenbar: true, offen: false, verschlossen: true, behaelter: true,
    beschreibung: function (api) {
      return 'Eine Holzkiste mit Eisenbändern, „W. HALLMANN“ in akkuraten Druckbuchstaben. ' + (api.eig('hallmann_kiste', 'offen') ? 'Sie steht offen.' : 'Ein Zahlenschloss mit vier Rädchen sichert den Deckel. Hallmann war Physiklehrer – er hat sich bestimmt eine Zahl ausgesucht, die ihm etwas bedeutet hat.');
    },
    zahlenschloss: {
      stellen: 4, code: '0258',
      bereit: function (api) { return api.eig('hallmann_kiste', 'offen') ? 'Die Kiste ist schon offen.' : true; },
      richtig: function (api) { oeffneHallmann(api, 'Null, zwei, fünf, acht. Zwei Uhr achtundfünfzig. Das Schloss springt auf.'); },
      falsch: 'Das Schloss rührt sich nicht.',
      tipps: { falsch: {
        2: 'Hallmann hat seine Nächte nach Uhrzeiten gezählt. Vielleicht steht in seinen Sachen eine, die immer wiederkehrt.',
        3: function (api) { return api.hatHinweis('hallmann_brand') ? 'Der Feuerwehrbericht und sein Kalender nennen dieselbe Uhrzeit. <span class="nebenbei">(„drehe rädchen auf 0258“)</span>' : 'Sieh in die Taschen seines Mantels. Sein Kalender nennt eine Uhrzeit. <span class="nebenbei">(„durchsuche mantel“)</span>'; }
      } }
    },
    proben: {
      knacken: {
        wer: 'handwerk', mod: function (api) { return api.traegt('feinwerkzeug') ? 0 : -20; }, modGrund: 'altes Schloss', grund: 'Zahlenschloss',
        wenn: function (api) { return !api.eig('hallmann_kiste', 'offen'); },
        erfolg: function (api) { oeffneHallmann(api, 'Du hörst die Sperrscheiben ab, eine nach der anderen, bis das Schloss mit einem trockenen Klacken aufgibt.'); },
        misserfolg: 'Die Rädchen drehen sich, das Schloss bleibt zu.',
        tipps: { 2: 'Das Schloss ist alt und schwergängig – vielleicht findest du den Code irgendwo.', 3: 'Durchsuche den Mantel neben der Kiste. <span class="nebenbei">(„durchsuche mantel“)</span>' }
      }
    },
    bei: {
      zerbrechen: function (api) {
        if (api.eig('hallmann_kiste', 'offen')) { api.sage('Sie ist schon offen.'); return true; }
        var e = api.probe('st', { grund: 'Kiste aufbrechen', mod: -10, modGrund: 'Eisenbänder' });
        if (!e.erfolg) { api.sage('Du trittst gegen das Schloss, wieder und wieder. Es ist lauter, als du dachtest – aber das Schloss hält.'); laerm(api); return true; }
        oeffneHallmann(api, 'Mit einem letzten Tritt bricht der Bügel aus dem Holz. Das Krachen hallt durch den ganzen Dachstuhl.');
        laerm(api);
        return true;
      }
    }
  });
  HG.ding('taschenuhr', {
    nomen: 'Taschenuhr', genus: 'f', adj: ['silbern'], woerter: ['taschenuhr', 'uhr', 'sprungdeckel'], klein: true,
    ort: 'hallmann_kiste', rel: 'in',
    beschreibung: 'Eine silberne Taschenuhr mit Sprungdeckel, innen graviert: „Für Wolfgang – I. 1964“. Die Zeiger stehen auf zwei Uhr achtundfünfzig. Das Glas ist rußig, und wenn du sie ans Ohr hältst, meinst du für einen Moment ein Ticken zu hören. Dann nicht mehr.',
    horchen: 'Nichts. Dann, ganz kurz: tick. Dann nichts mehr.'
  });
  HG.ding('messprotokolle', {
    dokument: true,
    nomen: 'Messprotokolle', genus: 'pl', woerter: ['messprotokolle', 'protokolle', 'hefte', 'messhefte', 'protokoll'],
    ort: 'hallmann_kiste', rel: 'in',
    beschreibung: 'Ein Stapel karierter Schulhefte, 1972 bis 1974, säuberlich beschriftet: „Beobachtungen Ulmenweg 12“. Tabellen, Uhrzeiten, Temperaturen – und Anmerkungen.',
    lesbar: 'Spalten: Datum · Uhrzeit · Ereignis · eigener Zustand · Dauer der Ruhe danach. Und Anmerkungen am Rand:<br><i>„Irmgard ist an Entkräftung gestorben, sagt der Arzt. Sie hat ein Kinderjäckchen nach dem anderen genäht. Die Dame im Spiegel hat ihr ein Kind versprochen.“</i><br><i>„Je mehr Angst ich habe, desto mehr kann sie. Messbar.“</i><br><i>„Wenn ich nicht ans Telefon gehe, ist es drei Nächte still. Gehe ich ran, kommt sie in der nächsten Nacht näher.“</i><br><i>„Sie nährt sich von uns. Von der Angst, vom Gehorchen. Man muss sie aushungern.“</i>',
    hinweis: 'hallmann_protokolle', hinweisBei: 'lesen'
  });
  HG.ding('werkzeugkiste', {
    nomen: 'Werkzeugkiste', genus: 'f', adj: ['blechern'], woerter: ['werkzeugkiste', 'blechkiste', 'werkzeugkasten'],
    ort: 'hallmann_kiste', rel: 'in', fest: 'Die Werkzeugkiste ist schwer. Nimm dir lieber, was du brauchst.',
    behaelter: true, oeffenbar: true, offen: true,
    beschreibung: 'Eine grüne Werkzeugkiste aus Blech. Ordentlich sortiert: Zangen, Schraubendreher – und eine Bügelsäge und ein Brecheisen.'
  });
  HG.ding('buegelsaege', {
    nomen: 'Bügelsäge', genus: 'f', woerter: ['buegelsaege', 'saege', 'metallsaege', 'eisensaege'],
    ort: 'werkzeugkiste', rel: 'in', saege: true,
    beschreibung: 'Eine Bügelsäge für Metall mit einem neuen Sägeblatt. Hallmann hat es nie benutzt.'
  });
  HG.ding('brecheisen', {
    nomen: 'Brecheisen', genus: 'n', woerter: ['brecheisen', 'kuhfuss', 'stemmeisen', 'hebel'],
    ort: 'werkzeugkiste', rel: 'in', werkzeug: 1,
    beschreibung: 'Ein schweres Brecheisen, an der Spitze blank gescheuert.'
  });

  // ===================================================================
  // MÄDCHENKAMMER
  // ===================================================================
  HG.raum('maedchenkammer', {
    name: 'Mädchenkammer',
    woerter: ['maedchenkammer', 'kammer', 'dachkammer'],
    schauplatz: 'haus', karte: { x: 20, y: 1 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Ganz nah, als säße es neben dir: ein Kind, das leise weint.',
    beschreibung: 'Eine winzige Kammer unter der Dachschräge, durch eine Gaube fällt ' + 'ein Streifen Licht. Ein schmales Eisenbett, ein Waschgestell, ein Haken an der Tür. Hier schlief die Köchin der Grests – und, so sieht es aus, ein Kind: Am Kopfende des Bettes sind Buchstaben ins Holz der Wand geritzt, kindlich, mit großer Mühe. Die Tür im Norden führt zurück auf den Speicher.',
    kurz: 'Die Mädchenkammer mit der Ritzung an der Wand. Norden: Speicher.',
    horchen: { tag: 'Stille. Eine Fliege am Fenster.', nacht: 'Ein Kind weint, leise, in ein Kissen hinein, damit es niemand hört. Wenn du still bist, hört es auf. Wenn du dich bewegst, fängt es wieder an.' },
    riechen: 'Kernseife und Staub.',
    versteckOrt: { text: 'Du kriechst unter das schmale Eisenbett. Unter dem Bettgestell ist das Holz voller kleiner Kerben, als hätte hier ein Kind die Tage gezählt.', mod: 0 },
    ausgaenge: { norden: 'speicher' },
    vorschlaege: ['lies ritzung', 'untersuche bett'],
    details: [
      { nomen: 'Eisenbett', genus: 'n', woerter: ['eisenbett', 'bett', 'waschgestell', 'haken'], text: 'Ein Eisenbett, kaum länger als ein Kind. Das Waschgestell hat eine Emailleschüssel mit einem Sprung.', versteckOrt: { text: 'Du kriechst unter das schmale Eisenbett.', mod: 0 } }
    ]
  });
  HG.ding('ritzung', {
    nomen: 'Ritzung', genus: 'f', woerter: ['ritzung', 'buchstaben', 'inschrift', 'wand', 'holz', 'schrift'], adjektive: ['kindlich', 'geritzt'],
    ort: 'maedchenkammer', fest: true, szenerie: true,
    beschreibung: 'Buchstaben, mit einer Nadel oder einem Nagel ins Holz der Wandverkleidung geritzt, tief und mühsam, wie Kinder schreiben, die gerade erst schreiben gelernt haben.',
    lesbar: '<b>L. W. 1928</b><br><i>die gnädige frau hat zwei gesichter</i>',
    hinweis: 'zwei_gesichter', hinweisBei: 'lesen'
  });

  // ===================================================================
  // WÄSCHEBODEN
  // ===================================================================
  HG.raum('waescheboden', {
    name: 'Wäscheboden',
    woerter: ['waescheboden', 'trockenboden'],
    schauplatz: 'haus', karte: { x: 21, y: 0 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Stoff streift dein Gesicht, kühl und feucht, und noch einer, und noch einer.',
    beschreibung: function (api) {
      return 'Leinen sind kreuz und quer unter das Dach gespannt, und an einigen hängen noch Laken, grau geworden, steif vom Staub von Jahrzehnten. ' +
        (api.istNacht() ? 'Sie bewegen sich, obwohl kein Luftzug geht. Hier und da wölbt sich eins, als stünde jemand dahinter.' : 'Wenn der Wind durch die Ziegel streicht, bauschen sie sich ein wenig, wie Segel.') +
        ' In einer Ecke steht ein Korb mit Wäscheklammern. Die Tür im Südwesten führt zurück auf den Speicher.';
    },
    kurz: 'Der Wäscheboden mit den hängenden Laken. Südwesten: Speicher.',
    horchen: { tag: 'Das leise Klappern von Wäscheklammern im Wind.', nacht: 'Irgendwo zwischen den Laken summt eine Frau ein Wiegenlied. Und eine Nähmaschine rattert dazu.' },
    riechen: 'Staub, alte Stärke, Lavendel.',
    ausgaenge: { suedwesten: 'speicher' },
    details: [
      { nomen: 'Laken', genus: 'pl', woerter: ['laken', 'leinen', 'waesche', 'waescheleinen', 'klammern', 'waescheklammern', 'korb'], text: function (api) { return api.istNacht() ? 'Die Laken hängen still. Zu still. Eins hat die Form von Schultern.' : 'Alte Laken, grau, mit gestickten Monogrammen: I. H. Irmgard Hallmann hat hier ihre Wäsche aufgehängt – und nie wieder abgenommen.'; } }
    ]
  });
  // Die Näherin wartet auch hier (Spielbibel 8.9.2)
  HG.daten.gefahren.naeherin.orte = ['waeschekammer', 'waescheboden'];

  // ===================================================================
  // TURMERKER
  // ===================================================================
  HG.raum('turmerker', {
    name: 'Turmerker',
    woerter: ['turmerker', 'turm', 'tuermchen', 'ausguck', 'turmzimmer'],
    schauplatz: 'haus', karte: { x: 21, y: 1 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Um dich herum, ganz nah: das Rascheln von Federn.',
    beschreibung: function (api) {
      return 'Ganz oben im Türmchen: ein achteckiger Ausguck, kaum zwei Meter breit, mit schmalen Fenstern nach allen Seiten. Ein Fenster ist zerbrochen, und durch die Öffnung haben die Krähen ein Nest gebaut, groß wie ein Waschkorb, aus Zweigen, Draht und glitzerndem Kram. ' +
        (api.istNacht() ? 'Unten auf der Straße steht eine Laterne. Und unter der Laterne steht jemand und sieht herauf, ganz still, die Hände gefaltet.' : 'Von hier siehst du den Ulmenweg hinunter, die Dächer, den Kirchturm.') +
        ' Die schmale Öffnung im Nordwesten führt zurück auf den Speicher.';
    },
    kurz: 'Der Turmerker mit dem Krähennest. Nordwesten: Speicher.',
    horchen: { tag: 'Krähen. Viele. Sie reden miteinander, und manchmal klingt es wie dein Name.', nacht: 'Federn, die sich ordnen. Ein Schnabel, der leise gegen Glas klopft.' },
    riechen: 'Vogelkot, kalte Luft, Regen.',
    ausgaenge: { nordwesten: 'speicher' },
    // Bei Tag scheucht man die Krähen auf: Das Haus weiß, wo du bist – die Wandernde kommt diese Nacht früher
    beimBetreten: function (api) {
      if (api.istNacht() || api.flag('kraehen_nacht') === HG.nacht.nummer()) return;
      api.setzeFlag('kraehen_nacht', HG.nacht.nummer());
      HG.ausgabe.schreibe('spuk', 'Kaum steckst du den Kopf in den Turm, explodiert das Nest: Krähen, ein Dutzend, zwei Dutzend, schreiend, flatternd, sie streifen dein Gesicht und schießen durch das zerbrochene Fenster hinaus. Draußen kreisen sie um das Haus, einmal, zweimal – und lassen sich dann auf dem Dachfirst nieder. Alle mit dem Gesicht zu dir. <i>Jetzt weiß das Haus, wo du bist.</i>');
      api.nervenProbe('0/1W3', { grund: 'Krähen', gewoehnung: 'kraehen_turm' });
    },
    details: [
      { nomen: 'Laterne', genus: 'f', woerter: ['laterne', 'strasse', 'gestalt', 'ulmenweg', 'kirchturm', 'daecher'], text: function (api) { return api.istNacht() ? 'Unter der Laterne steht eine Frau in einem hellen Kleid, das Haar offen, und sieht herauf. Zu dir. Als ein Auto vorbeifährt, ist sie in seinen Scheinwerfern nicht zu sehen. Danach steht sie wieder da.' : 'Eine gusseiserne Laterne an der Ecke. Darunter niemand.'; } }
    ]
  });
  HG.ding('kraehennest', {
    nomen: 'Krähennest', genus: 'n', woerter: ['kraehennest', 'nest', 'zweige', 'draht', 'kram'], adjektive: ['glitzernd'],
    ort: 'turmerker', fest: 'Das Nest ist mit dem Fensterrahmen verwachsen.', szenerie: true,
    behaelter: true, offen: true,
    beschreibung: 'Zweige, Draht, Wolle – und dazwischen, was Krähen glänzend finden: Kronkorken, Stanniol, ein Fingerhut, Glasscherben. 120 Jahre Diebstahl.'
  });
  HG.ding('silberloeffel', {
    nomen: 'Silberlöffel', genus: 'm', adj: ['angelaufen'], woerter: ['silberloeffel', 'loeffel', 'teeloeffel'], klein: true,
    ort: 'kraehennest', rel: 'in',
    spiegel: 'winzig',
    beschreibung: 'Ein angelaufener Teelöffel aus Silber, auf dem Stiel die verschlungenen Buchstaben „E. G.“. In der Wölbung spiegelst du dich, klein und auf dem Kopf.',
    bei: { hineinschauen: function (api) { api.sage('In der Wölbung des Löffels stehst du auf dem Kopf. Und hinter dir – auch auf dem Kopf – eine Frau mit offenem Haar, die sich über deine Schulter beugt. Du drehst dich um. Niemand.'); api.nervenProbe('0/1W2', { grund: 'Spiegelbild im Löffel', gewoehnung: 'loeffel' }); return true; } }
  });
  HG.ding('ohrring', {
    nomen: 'Ohrring', genus: 'm', adj: ['silbern'], woerter: ['ohrring', 'ohrstecker', 'stern'], klein: true,
    ort: 'kraehennest', rel: 'in',
    beschreibung: 'Ein kleiner silberner Ohrstecker in Form eines Sterns. Modeschmuck, zwanzig Euro vielleicht. Bettina Gerdes hatte auf dem Foto in der Zeitung genau solche Sterne in den Ohren.'
  });

  // ===================================================================
  // Die Kellerkette lässt sich jetzt öffnen (der Keller folgt)
  // ===================================================================
  var KETTE = 'flur_detail1';
  var kellertuer = HG.daten.dinge[KETTE];
  function ketteAb(api, text) {
    api.setzeFlag('kellerkette_offen');
    api.sage(text + ' Die Kette rasselt zu Boden, das Pappschild mit „NICHT RUNTER.“ landet auf deinen Schuhen.');
  }
  function saege(api) {
    if (api.flag('kellerkette_offen')) { api.sage('Die Kette ist schon ab.'); return true; }
    var saegeId = HG.welt.inventar().filter(function (id) { return HG.daten.dinge[id].saege; })[0];
    if (!saegeId) { api.sage('Womit? Die Kette ist acht Millimeter dick und gehärtet. Du bräuchtest eine Metallsäge.'); return true; }
    api.zeitVergeht(40);
    ketteAb(api, 'Du setzt die Bügelsäge an ein Kettenglied und sägst. Das Kreischen von Stahl auf Stahl füllt den Flur, bis dir die Ohren klingen. Vierzig Minuten. Dann gibt das Glied nach.');
    if (api.istNacht()) laerm(api, 'Das Kreischen hat das ganze Haus geweckt. Am Ende des Flurs, im großen Spiegel, bewegt sich etwas.');
    return true;
  }
  // Der saubere Weg: Carstens Schlüsselbund aus seinem Nachlass (Polizeiwache, polizeiwache.js)
  function aufschliessen(api) {
    if (api.flag('kellerkette_offen')) { api.sage('Die Kette ist schon ab.'); return true; }
    if (!api.traegt('carstens_schluessel')) { api.sage('Keiner deiner Schlüssel passt in das Vorhängeschloss. Es ist neu, aus Messing – der passende Schlüssel muss irgendwo bei Carstens Sachen sein.'); return true; }
    api.setzeFlag('kellerkette_offen'); api.setzeFlag('kellerkette_aufgeschlossen');
    api.sound('vorhaengeschloss');
    api.sage('Du steckst den kleinen Messingschlüssel mit dem „K“ ins Vorhängeschloss. Er dreht sich leicht, als wäre er gerade erst geölt worden. Das Schloss springt auf. Du ziehst die Kette durch die Ösen; sie rasselt zu Boden, das Pappschild mit „NICHT RUNTER.“ landet auf deinen Schuhen.');
    return true;
  }
  kellertuer.bei = Object.assign({}, kellertuer.bei, {
    saegen: function (api) { return saege(api); },
    aufschliessen: function (api) { return aufschliessen(api); },
    oeffnen: function (api) { if (api.flag('kellerkette_offen')) return false; if (api.traegt('carstens_schluessel')) return aufschliessen(api); return false; },
    benutzen: function (api, ctx) {
      var a = ctx.obj === KETTE ? ctx.obj2 : ctx.obj;
      if (a === 'carstens_schluessel') return aufschliessen(api);
      if (a && HG.daten.dinge[a].saege) return saege(api);
      return false;
    },
    zerbrechen: function (api, ctx) {
      if (api.flag('kellerkette_offen')) { api.sage('Die Kette ist schon ab.'); return true; }
      var hebel = ctx.obj2 === 'brecheisen' || api.traegt('brecheisen');
      if (!hebel) return false;
      var e = api.probe('st', { grund: 'Kette aufbrechen', mod: -20, modGrund: 'gehärteter Stahl' });
      if (!e.erfolg) { api.sage('Du setzt das Brecheisen zwischen Öse und Tür und stemmst dich dagegen. Das Holz knarrt, die Kette hält. Es kracht und dröhnt im ganzen Flur.'); if (api.istNacht()) laerm(api); return true; }
      ketteAb(api, 'Du setzt das Brecheisen an der Öse an und stemmst dich mit dem ganzen Gewicht dagegen. Mit einem Krachen reißt die Öse aus dem Holz.');
      if (api.istNacht()) laerm(api);
      return true;
    }
  });
  var altTextKette = kellertuer.text;
  kellertuer.beschreibung = function (api) { return api.flag('kellerkette_offen') ? 'Eine niedrige Brettertür. Die Kette liegt ' + (api.flag('kellerkette_aufgeschlossen') ? 'aufgeschlossen' : 'durchtrennt') + ' auf dem Boden, daneben das Pappschild: <b>NICHT RUNTER.</b> Durch die Ritzen kommt kalte Luft.' : HG.wert(altTextKette, api); };
  var flur = HG.daten.raeume.flur;
  flur.ausgaenge.runter = { sperre: function (api) {
    if (!api.flag('kellerkette_offen')) return 'Die Kellertür ist mit einer schweren Kette und einem Vorhängeschloss gesichert. Ohne den passenden Schlüssel – oder eine Säge – kommst du nicht hinunter.';
    return 'Du ziehst die Kellertür auf. Eine steile Steintreppe führt in die Dunkelheit, kalte Luft steigt dir entgegen, und ganz unten riecht es nach Lavendel. <span class="nebenbei">(Der Keller wird noch gebaut.)</span>';
  } };
  var flurBeschreibung = flur.beschreibung;
  flur.beschreibung = function (api) {
    var t = flurBeschreibung(api);
    return api.flag('kellerkette_offen') ? t.replace('Links eine niedrige Tür mit einer Kette davor – der Keller.', 'Links eine niedrige Tür, die Kette liegt ' + (api.flag('kellerkette_aufgeschlossen') ? 'abgenommen' : 'durchtrennt') + ' davor – der Keller.') : t;
  };

  // ===================================================================
  // Wolfgang Hallmann: erscheint auf dem Speicher, lässt sich bekehren
  // ===================================================================
  Object.assign(HG.daten.seelen.hallmann, {
    wissen: ['hallmann_brand', ['hallmann_protokolle', 'zeitung_1974']],   // Bauakte + Messprotokolle (oder später die Zeitung 1974)
    wahrheit: 'Es war nicht Irmgard am Telefon.',
    falsch: ['Irmgard hat Sie gerufen. Sie wollte, dass Sie kommen.', 'Sie hätten das Haus früher anzünden müssen.'],
    erscheint: { orte: ['speicher'], phasen: ['daemmerung', 'tief'], chance: 0.3, zuege: 3,
      text: 'Neben der Kiste HALLMANN sitzt ein Mann auf einem Schemel, den es eben noch nicht gab. Strickweste, Hornbrille, ein Heft auf den Knien. Er sieht auf seine Taschenuhr und schreibt etwas auf. Sein Gesicht ist voller Ruß.',
      weg: 'Der Schemel ist leer. Auf dem Boden liegt ein bisschen Ruß.' },
    zuWenig: 'Er sieht kurz auf, dann wieder in sein Heft. Er wartet auf etwas, das du noch nicht weißt.',
    ohneAnker: 'Er sieht dich an, freundlich und abwesend, wie ein Lehrer einen Schüler, dessen Namen er vergessen hat. Dir fehlt etwas, das ihm gehört.',
    bekehrtText: 'Wolfgang Hallmann nimmt die Brille ab und reibt sich die Augen. „Nicht Irmgard“, sagt er. „Natürlich nicht. Ich habe es gewusst. Ich habe es gemessen.“ Er sieht dich an, zum ersten Mal wirklich. „Gehen Sie nicht ans Telefon. Wenn sie anruft, rufe ich auch an.“',
    bekehrt: function (api) { api.setzeFlag('hallmann_hilft'); }
  });
  HG.daten.seelen.hallmann.ding = { nomen: 'Mann', genus: 'm', woerter: ['hallmann', 'wolfgang', 'mann', 'gestalt', 'lehrer', 'studienrat'], beschreibung: 'Ein Mann um die vierzig, Strickweste, Hornbrille, Ruß im Gesicht. Er schreibt Uhrzeiten in ein kariertes Heft.' };
  HG.seele('hallmann', HG.daten.seelen.hallmann);

  // Hallmanns Hilfe: Kommt ein gefälschter Anruf, warnt er mit einem zweiten Klingeln (Spielbibel 8.9.0)
  HG.spielDaten({
    beiFalschemAnruf: function (api) {
      if (!api.bekehrt('hallmann')) return;
      HG.ausgabe.schreibe('handy', 'Mitten in das Klingeln mischt sich ein zweites, älter, blecherner – wie ein Telefon mit Wählscheibe. Für einen Moment Rauschen, dann eine heisere Männerstimme, ganz nah: <i>„Nicht rangehen.“</i>');
    }
  });

  // ===================================================================
  // Spuk auf dem Dachboden (Tag und Nacht je Raum)
  // ===================================================================
  var TAG = ['morgen', 'mittag'], NACHT = ['nacht'];
  HG.spuk('speicher_taube', { art: 'geraeusch', orte: ['speicher'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Eine Taube fliegt auf, irgendwo zwischen den Sparren, und schlägt gegen eine Gaube. Dann ist es still – und aus der Kiste HALLMANN kommt ein leises Ticken.', nerven: '0/1W2', grund: 'Ticken' });
  HG.spuk('speicher_kisten', { art: 'bewegung', orte: ['speicher'], zeiten: NACHT, chance: 0.2, max: 2, bild: true,
    text: 'Hinter dir scharrt Holz über Holz. Als du dich umdrehst, steht die Kiste OSTERMANN einen Schritt weiter vorn als vorhin. Genau vor dem Ausgang.', nerven: '1/1W6', grund: 'Kisten' });
  HG.spuk('kammer_kinderlied', { art: 'geraeusch', orte: ['maedchenkammer'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Unter der Tür ein Lachen, hell, ein kleines Mädchen. Dann Schritte, die die Treppe hinunterlaufen, die es hier oben nicht gibt.', nerven: '0/1W2', grund: 'Kinderlachen' });
  HG.spuk('kammer_weinen', { art: 'geraeusch', orte: ['maedchenkammer'], zeiten: NACHT, chance: 0.25, max: 2, bild: true,
    text: 'Das Weinen ist jetzt ganz nah. Ein Kind, unter der Decke des Eisenbetts, die Decke bebt. „Sie hat zwei Gesichter“, flüstert es. „Wenn sie lächelt, ist es das andere.“ Als du die Decke anhebst, ist da nur die nackte Matratze.', nerven: '1/1W6', grund: 'Kinderweinen' });
  HG.spuk('waescheboden_wind', { art: 'bewegung', orte: ['waescheboden'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Ein Windstoß fährt durch die Ziegel, und alle Laken blähen sich gleichzeitig – in die falsche Richtung. Auf dich zu.', nerven: '0/1W2', grund: 'Laken' });
  HG.spuk('waescheboden_gestalten', { art: 'illusion', orte: ['waescheboden'], zeiten: NACHT, chance: 0.2, max: 2, hell: true, bild: true,
    text: 'Zwischen den Laken stehen Gestalten. Erst denkst du, es seien nur Falten im Stoff. Dann dreht sich eine zu dir um, und das Laken legt sich über ein Gesicht, wie ein Tuch über eine Totenmaske.', nerven: '1/1W6', grund: 'Gestalten in den Laken' });
  HG.spuk('turm_kraehen', { art: 'geraeusch', orte: ['turmerker'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Eine Krähe landet auf dem Fensterrahmen, legt den Kopf schief und lässt etwas fallen. Es klimpert auf die Dielen: ein Hosenknopf, ein moderner, aus Metall. Carsten trug Jeans.', nerven: '0/1W2', grund: 'Krähe' });
  HG.spuk('turm_laterne', { art: 'illusion', orte: ['turmerker'], zeiten: NACHT, chance: 0.25, max: 2, hell: true, bild: true,
    text: 'Unter der Laterne hebt die Gestalt die Hand. Sie winkt nicht. Sie zeigt – auf das Haus. Auf das Fenster unter dir, im ersten Stock. Dort geht ein Licht an, in einem Zimmer, das keinen Strom hat.', nerven: '1/1W6', grund: 'Gestalt unter der Laterne' });

  // Puppenhaus: auch der Dachboden ist im Modell (die Figuren der Näherin)
  var ph = HG.daten.dinge.puppenhaus;
  var phAlt = ph.beschreibung;
  ph.beschreibung = function (api) { return HG.wert(phAlt, api).replace('Durch die winzigen Fenster siehst du hinein. ', 'Durch die winzigen Fenster siehst du hinein, und unter dem abnehmbaren Dach liegt sogar der Dachboden mit winzigen Kisten und Leinen voller Stoffreste. '); };
})();
