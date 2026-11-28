// Haus Grest – Inhalt: Erdgeschoss Ost (Speisezimmer, Salon, Wintergarten)
// Raumaufteilung: Spielbibel 4 / js/content/grundriss.js. Alle Texte und Rätsel [Vorschlag von Claude, 23.11.2026].
//
// Rätsel „Carstens Wintergarten“ (Zugang zum Wintergarten):
//   Carsten hat beide Glastüren abgeschlossen („Nachts sind die Scheiben wie Spiegel. Alle.“). Den Schlüssel hat er
//   „da, wo ich nicht mehr hinsehe“ versteckt (Zettel am Kühlschrank) – hinter dem verhängten Spiegel im Gäste-WC.
//   Hinweise darauf: der Zettel, das Handtuch über dem WC-Spiegel, Carstens Einkaufszettel „Spiegel abhängen!!!“
//   (Lager), Tagebuch 9.9.2025 (Laken über den Spiegeln).
//   Kopf:       Schlüssel hinter dem WC-Spiegel – „schau hinter spiegel“ / „nimm spiegel ab“ (ohne hineinzusehen,
//               solange das Handtuch hängt).
//   Fertigkeit: „knacke glastür mit werkzeug“ – Handwerk-Probe (Feinmechaniker-Set besser).
//   Gewalt:     „zerbrich glastür“ – Glas splittert, ohne Werkzeug 1W3 LP; in den Scherben sieht dich etwas an.
// Im Wintergarten: Elisabeths Rollstuhl (wie auf dem Foto von 1912) und eine Tinktur der Pflegerin.
(function () {

  function nacht(api) { return api.istNacht(); }

  // ===================================================================
  // SPEISEZIMMER – bei Tag unter Laken, nachts gedeckt
  // ===================================================================
  HG.raum('speisezimmer', {
    name: 'Speisezimmer',
    woerter: ['speisezimmer', 'esszimmer', 'speisesaal'],
    schauplatz: 'haus', karte: { x: 1, y: 0 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Dein Knie stößt an eine Stuhllehne. Auf dem Tisch klirrt leise Glas an Glas.',
    beschreibung: function (api) {
      var t = 'Ein langer Raum mit dunkler Holzdecke und einem Kronleuchter, dessen Kristalle grau vor Staub sind. In der Mitte eine Tafel für ein Dutzend Gäste. ';
      t += api.istNacht()
        ? 'Die Laken, die bei Tag darüberliegen, liegen jetzt am Boden. <b>Die Tafel ist gedeckt</b>: weißes Porzellan, Silber, Kristallgläser, vor jedem Stuhl. Die Kerzen in den Leuchtern sind nicht angezündet, aber ihre Dochte sind schwarz. '
        : 'Über Tisch und Stühle sind weiße Laken gebreitet, weiße Buckel in Reih und Glied. ';
      return t + 'In der Nordwand eine Durchreiche und eine schmale Dienertür zur Küche, im Süden eine Flügeltür zum Salon. Im Osten zwei Glastüren zum Wintergarten, ' +
        (api.eig('wg_tuer_speise', 'offen') ? 'eine davon offen.' : 'von innen mit Laken verhängt.') + ' Im Westen geht es zurück in die Halle.';
    },
    kurz: function (api) { return 'Das Speisezimmer mit der langen Tafel' + (api.istNacht() ? ' – gedeckt.' : ' unter Laken.') + ' Westen: Halle, Norden: Küche, Süden: Salon, Osten: Wintergarten.'; },
    riechen: { tag: 'Staub und Bohnerwachs.', nacht: 'Bratenduft. Warm, fett, festlich. In diesem Haus hat seit Jahren niemand gekocht.' },
    horchen: { tag: 'Die Kristalle des Kronleuchters klirren leise, obwohl kein Luftzug geht.', nacht: 'Stimmengemurmel, sehr leise, wie aus einem anderen Raum. Besteck auf Porzellan. Dann Stille, als hätten alle zugleich aufgehört zu essen – und dich angesehen.' },
    ausgaenge: {
      westen: 'halle', norden: 'kueche', sueden: 'salon',
      osten: { ziel: 'wintergarten', tuer: 'wg_tuer_speise' }
    },
    beimBetreten: function (api) {
      if (api.istNacht() && !api.flag('tafel_gedeckt_gesehen')) {
        api.setzeFlag('tafel_gedeckt_gesehen');
        api.sage('Du bleibst in der Tür stehen. Am Tag lagen hier Laken. Jetzt ist gedeckt – für dreizehn. Du zählst zweimal.');
        api.nervenProbe('1/1W6', { grund: 'gedeckte Tafel', gewoehnung: 'tafel' });
        api.hinweis('dreizehn_gedecke');
      }
    },
    vorschlaege: function (api) { return api.istNacht() ? ['untersuche tafel', 'lies tischkarten'] : ['untersuche laken', 'untersuche glastür']; },
    details: [
      { nomen: 'Kronleuchter', genus: 'm', woerter: ['kronleuchter', 'leuchter', 'kristalle', 'kristall', 'luester'], text: 'Ein Kronleuchter aus Messing und geschliffenem Glas, grau vor Staub. Die Kristalle klirren manchmal, ohne dass sich etwas bewegt.' },
      { nomen: 'Durchreiche', genus: 'f', woerter: ['durchreiche', 'dienertuer', 'klappe'], text: 'Eine Klappe in der Wand zur Küche und daneben eine schmale Tür ohne Klinke auf dieser Seite. Damit das Personal unsichtbar kam und ging.' }
    ]
  });

  HG.ding('tafel', {
    nomen: 'Tafel', genus: 'f', adj: ['lang'],
    woerter: ['tafel', 'tisch', 'esstisch', 'laken', 'stuehle', 'stuhl', 'gedecke', 'gedeck', 'porzellan', 'teller', 'besteck', 'tischkarten', 'tischkarte'],
    ort: 'speisezimmer', fest: true, szenerie: true,
    beschreibung: function (api) {
      if (!api.istNacht()) return 'Unter den Laken zeichnen sich zwölf Stühle und eine lange Tafel ab. Hebst du ein Laken an: blankes, staubfreies Holz. Unter den Laken staubt es nicht.';
      return 'Dreizehn Gedecke. Porzellan mit Goldrand, das Monogramm E. G., Silberbesteck, schwer und kalt. Vor jedem Teller eine Tischkarte, aber die Namen sind verblasst, nur einzelne Buchstaben sind noch zu lesen: ein O, ein A, ein T … ' +
        'Am Kopfende, wo bei Tag kein Stuhl stand, steht ein dreizehnter.';
    },
    lesbar: { nacht: 'Auf den Tischkarten, verblasst: <i>„… Osterm…“, „Marg…“, „Dr. Alb…“, „W. Teub…“, „J. Brz…“, „Irmg…“, „Wolfg…“, „H.-J. Brinkh…“, „Renate“, „Bettina“, „Natascha“, „Carsten“</i>. Die Karte am Kopfende trägt nur einen einzigen, sorgfältig gemalten Buchstaben: <b>E.</b>', sonst: 'Unter den Laken liegen keine Tischkarten. Nur blankes Holz.' },
    bei: {
      untersuchen: function (api) { if (api.istNacht()) api.hinweis('dreizehn_gedecke'); return false; },
      lesen: function (api) { if (api.istNacht()) api.hinweis('dreizehn_gedecke'); return false; }
    },
    klettern: 'Auf die Tafel? Du bringst es nicht über dich.'
  });

  // ===================================================================
  // SALON – Kamin mit Gravur (zweite Quelle für „unser Tag“), Flügel (Renate Vogt)
  // ===================================================================
  HG.raum('salon', {
    name: 'Salon',
    woerter: ['salon', 'wohnzimmer', 'musikzimmer', 'turmerker', 'erker'],
    schauplatz: 'haus', karte: { x: 1, y: 1 },
    dunkel: nacht,
    dunkelText: 'Stockfinster. Etwas Großes, Schwarzes steht mitten im Raum. Du hörst eine Saite nachschwingen, ganz leise.',
    beschreibung: function (api) {
      return 'Der Salon: hohe Fenster zur Straße mit schweren Samtvorhängen, ein Kamin aus grünem Marmor mit geschnitztem Sims, davor zwei Sessel mit verblichenem Bezug. ' +
        'Mitten im Raum ein schwarzer Flügel unter einem Tuch. Im Turmerker eine Fensterbank mit Kissen, von der aus man auf die Straße sieht. ' +
        'Im Norden eine Flügeltür ins Speisezimmer, im Osten eine Glastür zum Wintergarten, ' + (api.eig('wg_tuer_salon', 'offen') ? 'offen' : 'verhängt') + '. Im Nordwesten geht es durch den dunklen Durchgang zurück in die Halle.';
    },
    kurz: 'Der Salon mit dem Marmorkamin und dem Flügel unter dem Tuch. Norden: Speisezimmer, Osten: Wintergarten, Nordwesten: Halle.',
    riechen: 'Kalte Asche, Samt, Mottenpulver.',
    horchen: { tag: 'Verkehr auf der Straße, gedämpft durch die Vorhänge.', nacht: 'Eine Saite im Flügel schwingt nach, als hätte gerade jemand eine Taste losgelassen.' },
    ausgaenge: {
      nordwesten: 'halle', norden: 'speisezimmer',
      osten: { ziel: 'wintergarten', tuer: 'wg_tuer_salon' }
    },
    vorschlaege: ['untersuche kamin', 'untersuche flügel'],
    details: [
      { nomen: 'Sessel', genus: 'pl', woerter: ['sessel', 'polster'], text: 'Zwei Sessel mit verblichenem Rosenmuster. In einem ist eine Mulde, als säße dort jeden Abend jemand.' },
      { nomen: 'Turmerker', genus: 'm', woerter: ['turmerker', 'erker', 'fensterbank', 'kissen', 'fenster', 'vorhaenge', 'vorhang', 'strasse'], text: 'Eine runde Nische im Türmchen, mit einer Fensterbank und Kissen. Von hier sieht man den Ulmenweg hinunter. Auf einem Kissen liegt ein vergessenes Haargummi, rosa, mit Glitzer.', klettern: 'Du setzt dich auf die Fensterbank. Unten auf der Straße steht jemand und sieht herauf. Als du blinzelst, ist niemand da.' }
    ]
  });

  HG.ding('kamin', {
    nomen: 'Kamin', genus: 'm', adj: ['grün'],
    woerter: ['kamin', 'marmorkamin', 'kaminsims', 'sims', 'marmor', 'schnitzerei', 'feuerstelle'], adjektive: ['marmorn'],
    ort: 'salon', fest: true, szenerie: true,
    beschreibung: 'Ein Kamin aus grünem, weiß geädertem Marmor. Der Sims darüber ist aus Eichenholz, geschnitzt mit Lilienranken – und in der Mitte, zwischen zwei Lilien, eine kleine Messingplatte mit einer Gravur. <span class="nebenbei">(„lies messingplatte“)</span>',
    tasten: 'Kalter Marmor. In der Feuerstelle feine, weiße Asche. Jemand hat hier vor nicht allzu langer Zeit Papier verbrannt.',
    riechen: 'Kalte Asche – und verbranntes Papier.'
  });

  // Die Messingplatte am Kaminsims (Hochzeitstag = zweite Quelle für den Code des Kästchens)
  HG.ding('kaminplatte', {
    nomen: 'Messingplatte', genus: 'f', adj: ['klein'],
    woerter: ['messingplatte', 'platte', 'gravur', 'inschrift', 'schild'],
    ort: 'kamin', rel: 'teil', fest: true, szenerie: true,
    beschreibung: 'Eine kleine Messingplatte zwischen zwei geschnitzten Lilien, blank gerieben, als hätte jemand oft mit dem Daumen darübergestrichen. Darauf eine Gravur.',
    lesbar: '<b>B. &amp; E.</b><br>12. V. 1898<br><i>Unser Tag</i>',
    hinweis: 'hochzeitstag', hinweisBei: 'lesen'
  });

  HG.ding('fluegel', {
    nomen: 'Flügel', genus: 'm', adj: ['schwarz'],
    woerter: ['fluegel', 'klavier', 'piano', 'tasten', 'taste', 'deckel', 'tuch', 'notenpult'],
    ort: 'salon', fest: 'Ein Konzertflügel. Den trägt niemand irgendwohin.', szenerie: true, ablage: true,
    beschreibung: 'Ein schwarzer Flügel, halb unter einem Tuch. Der Deckel über den Tasten ist offen, das Elfenbein vergilbt. Auf dem Notenpult steht ein altes Notenheft.',
    horchen: 'Wenn du das Ohr an das Holz legst, summt es darin. Ganz leise. Eine Melodie, die du kennst und nicht kennst.',
    bei: {
      spielen: function (api) {
        if (api.istNacht()) {
          api.sage('Du schlägst ein paar Töne an. Der Flügel ist verstimmt, die Töne kommen schief und dumpf. Aber als du aufhörst, spielt er weiter – zwei, drei Töne, eine Melodie wie ein Wiegenlied. Von oben, aus dem ersten Stock, summt eine Frauenstimme mit.');
          api.nervenProbe('1/1W6', { grund: 'der Flügel spielt weiter', gewoehnung: 'fluegel_nacht' });
        } else {
          api.sage('Du schlägst ein paar Töne an. Der Flügel ist verstimmt; die Töne hängen lange in der Luft. Irgendwo über dir knarrt eine Diele, als hätte sich jemand aufgesetzt, um zuzuhören.');
        }
        return true;
      }
    }
  });
  HG.ding('notenheft', {
    dokument: true,   // wird fotografiert
    nomen: 'Notenheft', genus: 'n', adj: ['alt'],
    woerter: ['notenheft', 'heft', 'noten', 'klavierschule', 'kinderzeichnung', 'zeichnung', 'deckblatt', 'stempel'],
    ort: 'fluegel', rel: 'auf', schriftart: 'hand',
    beschreibung: 'Eine Klavierschule für Anfänger mit Eselsohren. Auf dem Deckblatt ein Stempel: „Renate Vogt – Klavierunterricht – Ulmenweg 12“. Auf der letzten Seite eine Kinderzeichnung mit Buntstift.',
    lesbar: 'Die Kinderzeichnung: eine Frau mit Dutt am Klavier, daneben ein kleines Mädchen. Darüber, im ersten Stock des Hauses, am Fenster, eine zweite Frau in einem langen hellen Kleid, den Mund weit offen, und Noten fliegen aus ihrem Mund.<br><br>' +
      'Darunter, in Kinderschrift: <i>„Frau Vogt und ich. Und die Dame oben, die immer mitsingt.“</i><br>Und kleiner, mit Bleistift, in der Handschrift einer Erwachsenen: <i>„Sie singt nicht mit. Sie singt vor.“</i>',
    foto: 'Auf deinem Foto ist die Dame oben am Fenster nicht gemalt. Sie ist ein graues, unscharfes Gesicht, wie auf einer alten Fotografie.',
    hinweis: 'renate_vogt', hinweisBei: 'lesen',
    bei: { untersuchen: function (api) { api.hinweis('renate_vogt'); return false; } }
  });

  // ===================================================================
  // WINTERGARTEN (Rätsel: Carstens verschlossene Glastüren)
  // ===================================================================
  var WG_TIPPS = {
    2: 'Abgeschlossen – ein neues Zylinderschloss in der alten Tür. Carsten hat es einbauen lassen. Den Schlüssel hat er sicher irgendwo im Haus versteckt.',
    3: function (api) {
      if (api.traegt('wg_schluessel')) return 'Du hast den Schlüssel mit dem Anhänger „WG“. <span class="nebenbei">(„schließe glastür auf“)</span>';
      if (api.hatHinweis('carstens_wg_zettel')) return '„Da, wo ich nicht mehr hinsehe.“ Carsten hat Spiegel verhängt. Im Gäste-WC an der Anrichte hängt einer unter einem Handtuch. <span class="nebenbei">(„schau hinter spiegel“)</span>';
      return 'Carsten hat im Haus Nachrichten für sich hinterlassen – sieh dir in der Küche den Kühlschrank an. Oder du nimmst Werkzeug („knacke glastür mit …“) – oder du schlägst das Glas ein.';
    }
  };
  function wgTuer(id, raum, raumName) {
    HG.ding(id, {
      // Im Wintergarten sieht man beide Glastüren – der Zusatz unterscheidet sie („die Glastür zum Salon“)
      nomen: 'Glastür', genus: 'f',
      zusatz: function (api) { return api.raum() === 'wintergarten' ? 'zum ' + raumName : 'zum Wintergarten'; },
      woerter: ['glastuer', 'glastueren', 'tuer', 'wintergartentuer', 'zylinderschloss', 'schloss', 'wintergarten', HG.text.norm(raumName)],
      tuer: true, orte: [raum, 'wintergarten'],
      oeffenbar: true, offen: false, verschlossen: true, schluessel: 'wg_schluessel',
      beschreibung: function (api) {
        if (api.eig(id, 'zerbrochen')) return 'Die Glastür. Eine Scheibe ist eingeschlagen; Scherben liegen auf beiden Seiten.';
        if (api.eig(id, 'erneuert')) { api.setze(id, 'erneuert', false); return 'Die Glastür. Die Scheibe, die du eingeschlagen hast, ist heil. Kein Sprung, keine Scherbe auf dem Boden – als wäre nie etwas gewesen. Nur das Schloss ist noch offen, so wie du es gelassen hast.'; }
        if (api.raum() === 'wintergarten') return 'Die Glastür zurück ins Haus.';
        return 'Eine Glastür mit weiß gestrichenen Sprossen. Von der anderen Seite ist ein Laken davorgehängt, sodass du nur grünliches Licht siehst. Im alten Holz steckt ein neues, glänzendes Zylinderschloss.';
      },
      texte: {
        verschlossen: 'Die Glastür ist abgeschlossen. Das Schloss ist neu – Carsten.',
        aufschliessen: 'Der kleine Schlüssel passt. Das neue Schloss dreht sich butterweich.',
        oeffnen: 'Die Glastür schwingt auf. Feuchte, grüne Luft – und ein Duft, so stark, dass du einen Schritt zurücktrittst: Lavendel.'
      },
      tipps: { verschlossen: WG_TIPPS },
      bei: {
        zerbrechen: function (api, ctx) {
          if (!api.eig(id, 'verschlossen') && !api.eig(id, 'zerbrochen') && api.eig(id, 'offen')) { api.sage('Die Tür steht offen. Kein Grund, das Glas einzuschlagen.'); return true; }
          if (api.eig(id, 'zerbrochen')) { api.sage('Die Scheibe ist schon eingeschlagen.'); return true; }
          var mit = ctx.obj2 && ctx.obj2 !== id && api.traegt(ctx.obj2);
          api.sound('glas-splittert');
          api.sage('Du schlägst ' + (mit ? 'mit ' + api.der(ctx.obj2, 'dat') + ' ' : '') + 'in die Scheibe neben dem Schloss. Das Glas zerspringt, Scherben klirren auf den Boden. Du greifst hindurch, drehst von innen am Schloss – die Tür ist offen.');
          if (!mit) api.verletze('1W3', { grund: 'Glasscherben' });
          // Die Scheibe erneuert sich über Nacht wie ein Spiegel (David, 23.11.2026; Engine: macht.js, um 3 Uhr). Die Tür bleibt danach aufgeschlossen.
          api.setze(id, 'zerbrochen', true); api.setze(id, 'zerbrochenUm', api.minuten()); api.setze(id, 'verschlossen', false); api.setze(id, 'offen', true);
          api.sage('Auf dem Boden liegen die Scherben. In jeder spiegelt sich ein Stück von dir – und in einer, ganz kurz, ein Auge, das nicht blinzelt.');
          api.nervenProbe('0/1W3', { grund: 'Scherben', gewoehnung: 'wg_scherben' });
          return true;
        },
        knacken: function (api, ctx) {
          if (!api.eig(id, 'verschlossen')) { api.sage('Die Tür ist nicht abgeschlossen.'); return true; }
          var w = ctx.obj2 && HG.daten.dinge[ctx.obj2].werkzeug ? ctx.obj2 : null;
          if (!w) { api.sage('Mit bloßen Händen bekommst du kein Zylinderschloss auf. Du bräuchtest feines Werkzeug.'); return true; }
          if (!api.traegt(w)) { api.sage('Dafür musst du ' + api.der(w, 'akk') + ' in der Hand haben.'); return true; }
          var q = HG.daten.dinge[w].werkzeug;
          var e = api.probe('handwerk', { mod: q >= 2 ? 0 : -30, modGrund: q >= 2 ? '' : 'grobes Werkzeug', grund: 'Schloss öffnen' });
          if (e.erfolg) { api.setze(id, 'verschlossen', false); api.sage('Stift um Stift drückst du die Zuhaltungen hoch. Dann dreht sich der Zylinder. Offen.'); return true; }
          api.sage('Die Zuhaltungen springen immer wieder zurück. Das Schloss ist neu und gut.');
          api.fehlversuch(id + '_verschlossen', WG_TIPPS);
          return true;
        }
      }
    });
  }
  wgTuer('wg_tuer_speise', 'speisezimmer', 'Speisezimmer');
  wgTuer('wg_tuer_salon', 'salon', 'Salon');

  HG.raum('wintergarten', {
    name: 'Wintergarten',
    woerter: ['wintergarten', 'glashaus', 'orangerie'],
    schauplatz: 'haus', karte: { x: 2, y: 0 },
    // nachts nicht dunkel – Mondlicht fällt durchs Glas (und jede Scheibe wird zum Spiegel, js/content/macht.js)
    beschreibung: function (api) {
      var t = 'Ein Glashaus aus weiß gestrichenem Eisen, angebaut an die Ostseite. Die Pflanzen sind verwildert: Palmen mit braunen Spitzen, ein Feigenbaum, der das Glasdach anhebt, und überall Lavendel, der aus den Kübeln in die Fugen der Fliesen gewuchert ist. ' +
        'In der Mitte, zwischen den Kübeln, steht ein alter Rollstuhl aus Korbgeflecht, als hätte ihn jemand eben dort abgestellt. ';
      t += api.istNacht()
        ? 'Draußen ist es schwarz. Jede Scheibe ist ein dunkler Spiegel, und in jeder stehst du – hundertmal, in hundert Glashäusern. '
        : 'Durch das schmutzige Glas fällt grünes Licht. ';
      return t + 'Im Westen geht es ins Speisezimmer, im Südwesten in den Salon.';
    },
    kurz: function (api) { return 'Der verwilderte Wintergarten mit dem Lavendel und dem Rollstuhl.' + (api.istNacht() ? ' Jede Scheibe spiegelt.' : '') + ' Westen: Speisezimmer, Südwesten: Salon.'; },
    riechen: 'Lavendel. Feuchte Erde. Und etwas Bitteres, Medizinisches.',
    horchen: { tag: 'Krallen auf Glas. Über dir laufen Krähen über das Dach.', nacht: 'Das Korbgeflecht des Rollstuhls knistert. Wie unter einem Gewicht.' },
    ausgaenge: {
      westen: { ziel: 'speisezimmer', tuer: 'wg_tuer_speise' },
      suedwesten: { ziel: 'salon', tuer: 'wg_tuer_salon' }
    },
    beimBetreten: function (api, info) { if (info.erstesMal) api.sage('Der Lavendel wächst hier, als hätte ihn jemand jeden Tag gegossen. Seit Monaten war niemand hier.'); },
    vorschlaege: ['untersuche rollstuhl', 'durchsuche tasche'],
    details: [
      { nomen: 'Scheiben', genus: 'pl', woerter: ['scheiben', 'scheibe', 'glas', 'glasdach', 'dach', 'fenster'], text: { tag: 'Schmutziges Glas in weißen Eisensprossen. Auf dem Dach sitzen Krähen.', nacht: 'Schwarze Spiegel. In jedem du. In manchen stehst du nicht allein.' } },
      { nomen: 'Lavendel', genus: 'm', woerter: ['lavendel', 'pflanzen', 'kuebel', 'palmen', 'feigenbaum', 'feige'], text: 'Lavendel in dichten Büschen, blühend – im November. Die anderen Pflanzen sind halb vertrocknet. Nur der Lavendel steht in voller Blüte.', riechen: 'So süß, dass dir übel wird.' }
    ]
  });

  HG.ding('rollstuhl', {
    nomen: 'Rollstuhl', genus: 'm', adj: ['alt'],
    woerter: ['rollstuhl', 'korbrollstuhl', 'korbgeflecht', 'raeder', 'rad', 'decke'],
    ort: 'wintergarten', fest: 'Der Rollstuhl ist schwer, und du willst ihn nicht von seinem Platz rücken. Er steht, wo er stehen soll.', szenerie: true,
    beschreibung: function (api) {
      return 'Ein Rollstuhl aus Korbgeflecht mit großen, dünnen Speichenrädern und einer verblichenen Wolldecke auf dem Sitz. An der Rückenlehne hängt eine Ledertasche.' +
        (api.hatHinweis('pflegerin_kraehe') ? ' Du kennst diesen Rollstuhl. Auf Carstens Foto von 1912 sitzt Elisabeth darin, und hinter ihr steht die Pflegerin mit der Krähe.' : ' Er ist sehr alt – älter als jeder Rollstuhl, den du je gesehen hast.');
    },
    tasten: 'Die Decke auf dem Sitz ist warm.',
    riechen: 'Lavendel.',
    klettern: 'Du setzt dich nicht hinein. Unter keinen Umständen.',
    hinweis: 'rollstuhl_elisabeth', hinweisBei: 'untersuchen'
  });
  HG.ding('rollstuhltasche', {
    nomen: 'Ledertasche', genus: 'f', adj: ['alt'],
    woerter: ['ledertasche', 'tasche', 'rollstuhltasche'],
    ort: 'wintergarten', fest: true, szenerie: true,
    behaelter: true, oeffenbar: true, offen: false,
    beschreibung: 'Eine kleine Ledertasche an der Rückenlehne des Rollstuhls, mit einer Schnalle verschlossen.',
    texte: { oeffnen: 'Die Schnalle ist steif, dann gibt sie nach.' }
  });
  HG.ding('tinktur', {
  klein: true,      // zählt nicht zur Tragkraft
    nomen: 'Fläschchen', genus: 'n', adj: ['braun'], kurzwort: 'fläschchen',
    woerter: ['flaeschchen', 'flasche', 'tinktur', 'medizin', 'etikett', 'arznei'],
    ort: 'rollstuhltasche', rel: 'in', schriftart: 'hand',
    beschreibung: 'Ein kleines braunes Apothekerfläschchen mit Glasstopfen, zu einem Drittel gefüllt mit einer dunklen, öligen Flüssigkeit. Auf dem Etikett eine spitze, fremde Handschrift.',
    lesbar: '<i>Für die Herrin.</i><br>Abends zwölf Tropfen, in Wein.<br>Nie vergessen. Nie, solange ich wache.',
    riechen: 'Bitter. Wermut, Lavendel und etwas, das dir die Kehle zuschnürt.',
    hinweis: 'tinktur', hinweisBei: 'lesen',
    bei: { untersuchen: function (api) { api.hinweis('tinktur'); return false; } }
  });


})();
