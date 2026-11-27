// Haus Grest – Inhalt: DAS FINALE (Akt 3) – Spiegelzimmer, Wahl der Hand, Feuer-Ende
// Spielbibel 8.5, 8.6, 8.6.7 (Entscheidungen David, 27.11.2026):
//   • Vor der Neumondnacht: Die Tapetentür steht nachts einen Spalt offen und lockt; wer hineingeht, erlebt eine
//     extreme Manifestation und muss fliehen.
//   • Neumondnacht ab 3 Uhr, Kreis NICHT gebrochen: Das Böse ist zu stark – man zieht sich zurück (kein Ende) und
//     ahnt, dass sich die Kraft mildern lässt; eine bekehrte Seele hilft dabei.
//   • Kreis gebrochen: kein Zurück. Ein harter Kampf, umso härter, je stärker die MACHT ist („schwach“ = mindestens
//     zwei bekehrte Seelen oder MACHT-Stufe schwach). Verloren = „Willkommen zu Hause“. Gewonnen → Wahl der Hand.
//   • Feuer: Das Haus ruft selbst die Feuerwehr (kostet MACHT), außer Hallmann verhindert es → gelöscht, Spiel geht
//     weiter. Sonst brennt es – und wird Wochen später originalgetreu wieder aufgebaut.
// Wortlaut, Zahlen und die Hilfen der Seelen im Einzelnen [Vorschlag von Claude, 27.11.2026].
(function () {

  var BEKEHRBAR = ['hallmann', 'renate', 'bettina', 'natascha', 'carsten'];
  function bekehrte(api) { return BEKEHRBAR.filter(function (s) { return api.bekehrt(s); }); }
  /** Stärke im Finale: schwach | mittel | stark */
  function stufe(api) { return bekehrte(api).length >= 2 ? 'schwach' : api.machtStufe(); }
  function nacht() { return HG.nacht.nummer(); }
  function kreis(api) { return !!api.flag('kreis_gebrochen'); }
  /** Die Tür ist in dieser Nacht nach 3 Uhr offen (Höhepunkt einer Neumondnacht im Haus erlebt). */
  function neumondOffen(api) { return api.flag('spiegelzimmer_offen') === nacht() && HG.nacht.phase() === 'abebben'; }
  function neumondVorDrei(api) { return HG.nacht.istNeumond(nacht()) && (HG.nacht.phase() === 'daemmerung' || HG.nacht.phase() === 'tief'); }

  // ===================================================================
  // DIE TAPETENTÜR
  // ===================================================================
  function sperre(api) {
    if (neumondOffen(api)) return null;
    if (!api.istNacht()) return HG.daten.dinge.tapetentuer.texte.oeffnen;
    if (neumondVorDrei(api)) return 'Heute steht kein Spalt offen. Die Tür ist zu, fest und kalt, als hielte jemand von innen die Hand dagegen und warte. Nicht jetzt, sagt das Haus. Um drei.';
    return null;   // eine gewöhnliche Nacht: der Spalt lockt
  }
  HG.daten.raeume.galerie.ausgaenge.hinein = { ziel: 'spiegelzimmer', sperre: sperre, nurSpieler: true };
  var tuer = HG.daten.dinge.tapetentuer;
  tuer.bei = tuer.bei || {};
  tuer.bei.oeffnen = function (api) {
    var s = sperre(api);
    if (s) { api.sage(s); return true; }
    api.sage(neumondOffen(api) ? 'Die Tapetentür steht offen. Ganz. Zum ersten Mal.' : 'Du legst die Fingerspitzen in den Spalt. Die Tür gibt nach, viel zu leicht, als hätte sie darauf gewartet.');
    api.gehe('spiegelzimmer');
    return true;
  };
  tuer.bei.ziehen = tuer.bei.oeffnen;
  var tuerBeschr = tuer.beschreibung;
  tuer.beschreibung = function (api) {
    if (neumondOffen(api)) return 'Die Tapetentür steht weit offen. Dahinter ist es hell – nicht wie Licht, sondern wie Glas. <span class="nebenbei">(„geh hinein“)</span>';
    if (neumondVorDrei(api)) return 'Eine Tür, die keine sein soll, bündig in der Wand, mit derselben Tapete beklebt. Heute Nacht steht kein Spalt offen. Sie ist zu und kalt wie ein Fenster im Winter. Sie wartet auf etwas.';
    return tuerBeschr(api) + (api.istNacht() ? ' <span class="nebenbei">(„geh hinein“ – wenn du dich traust)</span>' : '');
  };

  // ===================================================================
  // DAS SPIEGELZIMMER
  // ===================================================================
  HG.raum('spiegelzimmer', {
    name: 'Spiegelzimmer', woerter: ['spiegelzimmer', 'ankleidezimmer', 'zimmer'],
    schauplatz: 'haus', karte: { x: 11, y: 0 }, spiegel: 'spiegelzimmer',
    beschreibung: 'Ein kleiner Raum, und doch endlos: Jede Wand, die Decke, selbst der Boden sind Spiegel, alte, fleckige, in vergoldeten Rahmen, Kante an Kante. Du stehst in einem Gang aus dir selbst, tausendfach, bis ins Graue. Das Fenster nach Osten ist zugemauert und verspiegelt wie alles andere.',
    kurz: 'Das Spiegelzimmer: Wände, Decke und Boden aus Spiegeln.',
    riechen: 'Lavendel. Nur Lavendel. So dicht, dass du kaum atmen kannst.',
    horchen: 'Dein eigener Atem, tausendmal. Und einer, der nicht im Takt ist.',
    ausgaenge: { hinaus: 'galerie' },
    beimBetreten: function (api) {
      if (neumondOffen(api)) return kreis(api) ? finale(api) : zuStark(api);
      locken(api);
    }
  });
  HG.ding('spiegelwaende', {
    nomen: 'Spiegel', genus: 'pl', woerter: ['spiegel', 'spiegelwaende', 'waende', 'wand', 'decke', 'boden', 'glas'],
    ort: 'spiegelzimmer', fest: true, szenerie: true, spiegel: 'spiegelzimmer', zerbrechlich: false,
    beschreibung: 'Spiegel an jeder Fläche. In keinem bist du allein.',
    texte: { zerbrechen: 'Du schlägst zu. Der Spiegel springt – und dahinter ist der nächste. Und dahinter der nächste.' }
  });

  // --- Vor der Neumondnacht: Die Spiegel locken --------------------------
  HG.manifestation('alle_spiegel', {
    name: 'Alle Spiegel', halt: 30, koerper: true, fliehenNach: 'galerie', fluchtMod: 20,
    start: 'Die Tür fällt hinter dir nicht zu. Das ist das Schlimmste: Sie lässt dir den Weg offen. In allen Spiegeln dreht sich die Frau im hellen Kleid gleichzeitig zu dir um, tausendmal, und tausendmal lächelt sie. Dann treten sie heraus – nicht eine, alle.',
    nerven: '1W4/1W10',
    angriffe: [
      { text: 'Hände von allen Seiten, aus jedem Rahmen. Sie greifen dein Haar, deine Ärmel, deine Finger.', griff: true, nerven: '1/1W4' },
      { text: 'Sie ziehen dich in die Mitte, wo der Gang aus Spiegeln am tiefsten ist.', lp: '1W4' },
      { text: '„Noch nicht“, sagen tausend Münder. „Aber bald. Bleib doch gleich.“', nerven: '1/1W6' }
    ],
    griffFolge: { runden: 2, text: 'Für einen Moment siehst du dich im Spiegel stehen – ruhig, lächelnd, mit ihrem Lächeln. Dann wirft dich etwas rückwärts durch die Tür.', nerven: '1W3/1W8', endet: true },
    warum: {
      verhaengen: 'Ein Laken für tausend Spiegel? Du kannst nur hinaus.',
      zerschlagen: 'Hinter jedem Spiegel ist der nächste. Du kannst nur hinaus.',
      nahkampf: 'Du schlägst um dich, und überall ist Glas. Du kannst nur hinaus.'
    },
    texte: {
      geflohen: 'Du wirfst dich durch die Tür auf die Galerie. Hinter dir schließt sie sich, sanft, mit einem Klicken. Von drinnen klopft es dreimal.',
      aufgeloest: 'Das Licht frisst sich in sie hinein, und sie weichen zurück in die Rahmen – lachend. Die Tür hinter dir geht auf, als wolle man dich hinausbitten. Du gehst.'
    },
    nachher: function (api, art) {
      if (HG.zustand.z.vorbei) return;
      if (art !== 'geflohen') api.gehe('galerie');
      api.setzeFlag('spiegelzimmer_gelockt', true);
    }
  });
  function locken(api) {
    if (!api.flag('spiegelzimmer_gelockt')) api.abschnitt(60, 'Du trittst ein. Hinter dir, auf der Galerie, ist es dunkel; hier drinnen ist es grau und hell zugleich, wie das Licht unter Wasser. Von überall her siehst du dich selbst. Und neben dir, in jedem Spiegel, eine Frau im hellen Kleid, die dir die Hand auf die Schulter legt.<br><br>Die Schulter in deinem Spiegelbild. Nicht deine. Noch nicht.');
    api.zeigeBild('spuk');   // raum-spiegelzimmer-spuk: die Frau in jedem Spiegel, Hände aus den Rahmen
    api.kampf('alle_spiegel');
  }

  // --- Neumondnacht, Kreis nicht gebrochen: zurückziehen ---------------
  function zuStark(api) {
    api.abschnitt(61, 'Du machst einen Schritt hinein, und die Luft wird dick wie Wasser. In jedem Spiegel steht sie, und hinter ihr, tief im Grau, bewegt sich etwas anderes – etwas, das nicht in Spiegeln wohnt, sondern unter ihnen. Darunter. Es atmet durch das ganze Haus herauf, aus dem Boden, aus der Halle, aus etwas, das noch offen steht.<br><br>' +
      'Du weißt es, bevor du es denkst: Das ist zu stark. Nicht sie – das, was sie trägt. Du weichst zurück, Schritt für Schritt, bis du auf der Galerie stehst und die Tür sich vor dir schließt. Aber du hast es gespürt: Es kommt von unten. Und was offen steht, kann man schließen.');
    api.nervenProbe('1/1W6', { grund: 'die Kraft unter dem Haus' });
    var helfer = bekehrte(api)[0];
    var texte = {
      hallmann: 'Auf der Galerie riecht es nach Ruß. Neben dir steht Wolfgang Hallmann und sieht auf seine Uhr. „Ich habe es gemessen“, sagt er leise. „Es kommt aus dem Keller. Unter der Halle. Dort ist noch eine Tür offen – schließen Sie sie.“',
      renate: 'Ganz leise summt jemand neben dir, eine brüchige Stimme. Renate Vogt. Sie zeigt mit dem Kinn nach unten, zur Treppe. „Da unten singt etwas mit“, flüstert sie. „Bring es zum Schweigen. Dann singt sie allein.“',
      bettina: 'Bettina sitzt auf der obersten Treppenstufe, die Knie angezogen. „Unten“, sagt sie. „Im Keller ist eine Tür, die keiner sehen soll. Mach sie zu, dann ist sie nicht mehr so stark.“',
      natascha: 'Natascha kniet am Geländer und legt die flache Hand auf die Dielen, als horche sie hindurch. „Da unten“, sagt sie. „Hinter der Wand, die zu neu ist. Der Kreis. Brich ihn.“',
      carsten: 'Carsten steht am Fuß der Treppe, grau, durchsichtig, und sieht nicht dich an, sondern den Boden. „Der Kreis unter der Halle“, sagt er. „Solange der offen ist, kommst du nicht an ihr vorbei. Ich hab’s nie geschafft.“'
    };
    api.gehe('galerie');
    if (helfer) api.sage(texte[helfer]);
    else api.fehlversuch('finale_kreis', {
      1: 'Es kommt von unten. Was immer das Haus trägt, sitzt unter der Halle.',
      2: 'Die Pflegerin schrieb von einer „Tür unter dem Haus“. Carsten hat im Keller 2,40 Meter vermisst.',
      3: 'Hinter der Westwand im Heizungskeller liegt der alte Kohlenkeller. Dort ist der Kreis der Krähe – erst wenn er gebrochen ist, kannst du ins Spiegelzimmer. <span class="nebenbei">(Keller → Heizungskeller → Wand durchbrechen → den Kreis rückwärts brechen)</span>'
    });
  }

  // --- Neumondnacht, Kreis gebrochen: das Finale -------------------------
  HG.manifestation('die_andere', {
    name: 'Die andere Elisabeth', halt: 12, koerper: true, flucht: false, salzHalt: '1W4',
    start: 'Sie tritt aus dem Spiegel, ganz. Zum ersten Mal siehst du ihr Gesicht klar: Es ist schön, und es ist Elisabeths, und es lächelt mit zu vielen Zähnen.',
    nerven: '1/1W8',
    angriff: function (api, k) {
      var st = stufe(api);
      var liste = [
        { text: 'Sie greift nach dir, und ihre Finger schließen sich um dein Handgelenk wie ein Ring aus Eis.', griff: true, nerven: '0/1W4' },
        { text: 'Sie zieht dich zum Glas. Du siehst dein Spiegelbild – es hat schon aufgehört, sich zu wehren.', lp: st === 'schwach' ? '1W3' : '1W6' },
        { text: '„Bleib“, singt sie, und in ihrer Stimme sind alle, die je in diesem Haus gestorben sind. „Bleib doch. Hier tut nichts mehr weh.“', nerven: st === 'stark' ? '1/1W8' : '1/1W4' }
      ];
      if (!api.bekehrt('carsten') && k.runde % 3 === 0) return { text: 'Hinter dir: Carsten. Er hält dich fest, sanft, fast entschuldigend. „Sie will doch nur, dass jemand bleibt“, flüstert er.', griff: true, nerven: '0/1W4' };
      return liste[(k.runde - 1) % liste.length];
    },
    griffFolge: { runden: 3, text: 'Deine Hand berührt das Glas. Es gibt nach.', endet: true },
    warum: {
      verhaengen: 'Jede Wand, die Decke, der Boden – alles ist Spiegel. Kein Laken der Welt reicht dafür.',
      zerschlagen: 'Du schlägst gegen eine Spiegelwand. Hinter dem Sprung ist die nächste.',
      stimmgabel: 'Das hier ist keine Täuschung mehr. Sie ist wirklich hier.',
      nennen: 'Sie hat keinen Namen. Sie hat nur Elisabeths.'
    },
    texte: {
      licht: 'Du hältst das Licht auf sie. Sie schreit, mit Elisabeths Stimme, und für einen Augenblick wird sie durchscheinend wie Rauch.',
      treffer: 'Du triffst sie, und sie splittert an dieser Stelle wie Glas – und wächst wieder zu.',
      aufgeloest: 'Sie taumelt zurück, und diesmal fängt kein Spiegel sie auf. Sie fällt in das Glas wie in Wasser, und das Glas schließt sich über ihr. In allen Spiegeln zugleich wird es dunkel.'
    },
    nachher: function (api, art) {
      if (HG.zustand.z.vorbei) return;
      if (art === 'aufgeloest') return wahlDerHand(api);
      endeWillkommen(api, 'Das Glas gibt nach wie Wasser, und du fällst. Ohne Laut, ohne Schmerz. Als du die Augen öffnest, stehst du im Spiegelzimmer und siehst hinaus, auf ein leeres Zimmer, in dem jemand mit deinem Gesicht die Laken zusammenfaltet. Es lächelt.');
    }
  });

  function finale(api) {
    if (api.flag('finale_begonnen') === nacht()) return;
    api.setzeFlag('finale_begonnen', nacht());
    api.zeigeBild('spuk');
    var st = stufe(api);
    api.abschnitt(62, 'Die Tür schließt sich hinter dir, und als du dich umdrehst, ist sie nicht mehr da. Nur Spiegel.<br><br>' +
      'Diesmal ist es still. Kein Lachen, kein Flüstern. Unter dem Haus atmet nichts mehr herauf – der Kreis ist gebrochen, und was sie getragen hat, ist fort. Sie ist allein.<br><br>' +
      'In allen Spiegeln zugleich steht eine Frau im hellen Kleid. Sie sieht dich an. Sie lächelt nicht. „Endlich“, sagt sie. „Du hast mir meinen Ring gebracht.“' +
      { schwach: '<br><br>Sie ist schwächer, als du gedacht hast. In manchen Spiegeln ist ihr Bild nur ein Hauch, wie Atem auf Glas.',
        mittel: '<br><br>In manchen Spiegeln flackert ihr Bild. Aber in den meisten steht sie fest.',
        stark: '<br><br>In jedem einzelnen Spiegel steht sie, scharf und fest und hell. Das Haus hat sich satt gegessen, und alles, was es hat, ist jetzt in ihr.' }[st]);

    // Die Hilfen der Seelen
    var halt = { schwach: 12, mittel: 18, stark: 24 }[st];
    var hilfe = [];
    if (api.bekehrt('bettina')) { halt -= 3; hilfe.push('Neben dir steht Bettina. Sie presst beide Hände gegen den größten Spiegel, und in diesem einen bleibt das Glas leer. „Den halt ich“, sagt sie. „Den kriegt sie nicht.“'); }
    if (api.bekehrt('natascha')) { halt -= 2; hilfe.push('Natascha kniet am Boden und reibt mit ihrem Ärmel über einen Rahmen, als restauriere sie ihn. Wo sie wischt, wird das Gold stumpf und das Glas blind.'); }
    if (api.bekehrt('hallmann')) { halt -= 2; hilfe.push('Irgendwo im Haus klingelt ein Telefon. Wolfgang Hallmann steht in der Ecke, die Uhr in der Hand. „Nicht rangehen“, sagt er ruhig. Das Klingeln bricht ab.'); }
    if (api.bekehrt('carsten')) { halt -= 4; hilfe.push('Und Carsten. Er steht zwischen dir und ihr, durchsichtig, die Hände zu Fäusten geballt. „Ich hab dich geliebt“, sagt er zu ihr. „Das war nicht dasselbe.“'); }
    else hilfe.push('Hinter ihr, in einem Spiegel, steht Carsten. Er sieht sie an, wie man jemanden ansieht, den man liebt. Er wird dir nicht helfen. Er wird ihr helfen.');
    if (api.traegt('tinktur')) {
      halt -= 4;
      api.bewege('tinktur', null);
      hilfe.push('Deine Hand findet das braune Fläschchen der Pflegerin. „Solange ich wache.“ Du schleuderst es gegen den Spiegel, und wo die Tropfen laufen, wird sie träge, als schlafe sie im Stehen ein.');
    }
    if (hilfe.length) api.sage(hilfe.join('<br><br>'));
    HG.daten.manifestationen.die_andere.halt = Math.max(6, halt);

    // Sie bittet um den Ring – wer die zwei Elisabeths kennt, erkennt die andere
    var kenntZwei = HG.zustand.z.schluesse.indexOf('zwei_elisabeths') >= 0;
    if (api.bekehrt('renate')) api.sage('Da singt jemand gegen sie an. Eine brüchige alte Stimme, Renate Vogt, ein Kinderlied, falsch und tapfer. Und unter Renates Lied hörst du, für einen Herzschlag, die Stimme der Frau im Spiegel, wie sie wirklich ist: kein Gesang. Ein Summen wie von Fliegen.');
    var kampf = function (mod, text) {
      if (text) api.sage(text);
      HG.daten.manifestationen.die_andere.halt = Math.max(6, HG.daten.manifestationen.die_andere.halt + mod);
      api.kampf('die_andere', { spiegel: null });
    };
    api.auswahl('Sie streckt dir die Hand entgegen, schmal, weiß, mit sehr dünnen Fingern. „Gib ihn mir. Bitte. Dann bin ich frei.“', [
      { text: 'Ihr den Ring geben.', tu: function () {
        if (!api.traegt('ehering')) return kampf(2, 'Du greifst in die Tasche. Da ist kein Ring. Ihr Gesicht verändert sich nicht. Nur die Zähne werden mehr.');
        endeWillkommen(api, 'Du legst ihr den Ring in die Hand. Sie steckt ihn an, langsam, und betrachtet ihn. Dann lächelt sie – und es ist das Lächeln, das Lotte Wiegand ihr Leben lang nicht vergessen hat. Irgendwo, sehr weit weg, hinter allen Spiegeln, schreit jemand. Dann nicht mehr.');
      } },
      { text: '„Du bist nicht Elisabeth. Du bist die andere.“', tu: function () {
        if (kenntZwei || api.bekehrt('renate')) return kampf(-2, 'Ihr Lächeln reißt. „Woher …“ Dann ist ihr Gesicht nicht mehr schön.');
        var z = HG.zustand.z;
        var e = api.probe(Math.max(1, (z.werte.wp || 0) * 5), { titel: 'Willenskraft-Probe', grund: 'Du bist dir nicht sicher' });
        if (e.erfolg) return kampf(0, 'Du sagst es, und du glaubst es fast. Ihr Lächeln wird starr.');
        api.nervenProbe('1W4/1W8', { grund: 'ihr Blick' });
        if (!z.vorbei) kampf(2, 'Deine Stimme zittert. „Und wenn doch?“, fragt sie sanft. „Wenn ich es doch bin?“ Dann greift sie zu.');
      } }
    ]);
  }

  // --- Die Wahl der Hand ---------------------------------------------------
  function wahlDerHand(api) {
    api.abschnitt(63, 'Dunkelheit in allen Spiegeln. Dann, in einem einzigen, ganz vorn, ein graues Licht.<br><br>Aus diesem Spiegel greifen <b>zwei Hände</b>. Beide schmal, beide weiß, beide mit sehr dünnen Fingern. Beide strecken sich nach dir aus.');
    var richtig = { text: 'Die Hand, die zittert – kalt, und am Ringfinger ein heller Abdruck, wo lange ein Ring gesessen hat.', tu: function () { richtigeHand(api); } };
    var falsch = { text: 'Die Hand, die ruhig wartet – warm, glatt, makellos, ohne jede Spur.', tu: function () {
      endeWillkommen(api, 'Du nimmst die warme Hand. Sie schließt sich um deine, fest, sehr fest. Aus dem Spiegel tritt eine Frau im hellen Kleid, ohne Ring am Finger, und lächelt. „Danke“, sagt sie. „Jetzt bleibst du.“ Hinter ihr, im Glas, schlägt eine andere Hand gegen die Scheibe, immer wieder, bis sie im Grau verschwindet.');
    } };
    api.auswahl('Welche Hand nimmst du?', HG.zufall() < 0.5 ? [richtig, falsch] : [falsch, richtig]);
  }
  function richtigeHand(api) {
    if (!api.traegt('ehering')) {
      endeWillkommen(api, 'Du nimmst die kalte Hand, und sie hält sich an dir fest wie eine Ertrinkende. Aber du hast nichts, was du ihr geben kannst. Kein Ring, kein Anker. Langsam gleiten ihre Finger aus deinen, zurück ins Grau. Und hinter dir, im Glas, das wieder hell wird, lächelt jemand.');
      return;
    }
    api.bewege('ehering', null);
    api.abschnitt(64, 'Du nimmst die kalte Hand. Sie zittert. Mit der anderen ziehst du den schmalen goldenen Ring hervor – „B. 12. V. 1898“ – und steckst ihn ihr an den Finger, auf den hellen Abdruck, wo er hingehört. Er passt. Er hat immer gepasst.<br><br>' +
      'Die Hand hält still. Dann wird sie warm, ganz langsam, wie eine Hand, die aus dem Schnee kommt. Aus dem Spiegel tritt eine Frau, nicht im hellen Kleid, sondern in einem einfachen grauen, mit aufgestecktem Haar und müden Augen, und sie sieht auf ihren Ring und dann dich an. Sie lächelt nicht. Sie weint.<br><br>' +
      '„Unser Tag“, sagt Elisabeth Grest.');
    endeErloesung(api);
  }

  // ===================================================================
  // ENDEN
  // ===================================================================
  function endeWillkommen(api, text) {
    if (HG.zustand.z.kampf) HG.zustand.z.kampf = null;
    api.abschnitt(66, text);
    api.ende('Am Morgen ist das Haus still. Die Laken liegen gefaltet neben den Spiegeln. Irgendwann wird ein Brief kommen, schwer und cremefarben, an einen entfernten Verwandten, von dem du nicht einmal mehr den Namen weißt.<br><br><b>Willkommen zu Hause.</b>');
  }
  function endeErloesung(api) {
    var frei = bekehrte(api).map(function (s) { return HG.daten.seelen[s].name; });
    api.ende('<b>Erlösung</b><br><br>Sie nimmt deine Hand, kurz, nur einen Augenblick, und lässt sie wieder los. Dann geht sie an dir vorbei zur Tür, die wieder da ist, und hinaus auf die Galerie, und du hörst ihre Schritte auf der Treppe, leicht, ohne Rollstuhl, ohne Stock. Unten öffnet sich die Haustür, mitten in der Nacht, und bleibt offen. Draußen, viel zu früh, wird der Himmel grau.<br><br>' +
      (frei.length ? 'Auf der Galerie stehen sie und sehen ihr nach: ' + frei.join(', ') + '. Einer nach dem anderen sind sie nicht mehr da. ' : '') +
      'In den Spiegeln ist nur noch dein eigenes Gesicht, müde, bleich und ganz und gar deins. Im Garten krächzt eine Krähe, einmal, und fliegt fort.<br><br>' +
      'Wochen später steht Haus Grest zum Verkauf. Der Makler schreibt „lichtdurchflutet“ ins Exposé. Es ist das erste Mal, dass das stimmt.');
  }
  HG.finale = { stufe: stufe, bekehrte: bekehrte, endeWillkommen: endeWillkommen };

  // Um drei Uhr in einer Neumondnacht öffnet sich die Tapetentür
  var hoehepunktVorher = HG.daten.spiel.hoehepunkt;
  HG.daten.spiel.hoehepunkt = function (api) {
    hoehepunktVorher(api);
    if (!HG.nacht.istNeumond(nacht())) return;
    api.setzeFlag('spiegelzimmer_offen', nacht());
    HG.ausgabe.schreibe('spuk', 'Und dann, durch das ganze Haus, ein Geräusch, das du noch nie gehört hast: eine Tür, die aufgeht. Oben, auf der Galerie. Neumond. Drei Uhr. <span class="nebenbei">(Die Tapetentür zum Spiegelzimmer steht offen.)</span>');
  };

  // ===================================================================
  // FEUER (Spielbibel 8.5, Ende 2)
  // ===================================================================
  var kanister = HG.daten.dinge.benzinkanister;
  kanister.fest = false;
  kanister.anzuendbar = false;
  kanister.beschreibung = function (api) {
    return api.traegt('benzinkanister') ? 'Carstens rote Benzinkanister, randvoll. Sechzig Liter. Sie stinken durch den ganzen Wagen.' : 'Drei rote 20-Liter-Kanister, randvoll. Sechzig Liter.';
  };
  kanister.texte = Object.assign({}, kanister.texte, { nehmen: 'Du schleppst die Kanister einzeln hinaus. Sechzehn Kilo jeder. Danach riechen deine Hände nach Benzin, und es geht nicht weg.' });
  kanister.bei = Object.assign({}, kanister.bei, { giessen: function (api) { return giessen(api); } });

  HG.ding('benzinlache', {
    nomen: 'Benzin', genus: 'n', woerter: ['benzin', 'lache', 'benzinlache', 'pfuetze', 'spur'],
    ort: null, fest: true, szenerie: true, anzuendbar: true,
    beschreibung: 'Benzin, über Dielen und Teppich verschüttet. Die Dämpfe flimmern in der Luft.',
    riechen: 'Benzin, so stark, dass dir schwindlig wird. Und darunter, hartnäckig: Lavendel.',
    bei: {
      anzuenden: function (api, ctx) {
        var mit = ctx.obj2 || HG.welt.inventar().filter(function (id) { return HG.daten.dinge[id].feuer; })[0];
        if (!mit) { api.sage('Womit? Du hast nichts, womit du Feuer machen könntest.'); return true; }
        feuer(api);
        return true;
      }
    }
  });

  function giessen(api) {
    if (!api.traegt('benzinkanister')) { api.sage('Du müsstest die Kanister erst nehmen.'); return true; }
    var r = HG.welt.raum();
    if (!r || r.schauplatz !== 'haus' || ['einfahrt'].indexOf(r.id) >= 0) { api.sage('Nicht hier. Nicht so.'); return true; }
    api.bewege('benzinlache', r.id);
    api.bewege('benzinkanister', null);
    api.setzeFlag('benzin_raum', r.id);
    api.zeitVergeht(10);
    api.sage('Du schraubst den ersten Kanister auf und gießt. Das Benzin klatscht auf die Dielen, läuft unter die Vertäfelung, zieht in den Teppich. Ein zweiter Kanister, ein dritter. Die Luft flimmert. Irgendwo im Haus geht eine Tür auf und wieder zu, ganz leise, wie jemand, der nachsehen will.');
    return true;
  }

  function feuer(api) {
    var z = HG.zustand.z, kosten = (HG.daten.spiel.macht.kosten || {}).feuerwehr || 25;
    api.bewege('benzinlache', null);
    api.bewege('benzinkanister', null);
    api.abschnitt(65, 'Das Streichholz fällt. Für einen Herzschlag passiert nichts. Dann steht der Raum in Flammen, mit einem Laut wie ein tiefer Atemzug. Hitze schlägt dir ins Gesicht. Du stolperst zurück, hinaus, und das Feuer frisst sich hinter dir die Vertäfelung hinauf.');
    if (api.flag('hallmann_hilft')) {
      api.sage('Unten in der Halle klingelt das Telefon, das es nicht gibt. Einmal. Dann bricht es ab, mitten im Klingeln, als hätte jemand den Hörer abgenommen und gleich wieder aufgelegt. Durch den Rauch siehst du eine Gestalt in Strickweste neben dem Apparat. Sie nickt dir zu.');
    } else if (HG.macht.wert() >= kosten) {
      HG.macht.verbrauche(kosten);
      api.sage('Unten in der Halle klingelt ein Telefon. Dann, durch das Prasseln, eine Frauenstimme, ruhig und deutlich: „Ulmenweg zwölf. Es brennt. Bitte kommen Sie schnell.“<br><br>Sechs Minuten später sind sie da. Martinshorn, Blaulicht im Rauch, schwere Stiefel auf dem Kies. Sie holen dich aus dem Garten und das Feuer aus dem Haus, und als der Morgen kommt, ist nur ein schwarzer Fleck auf den Dielen geblieben.');
      api.zeitVergeht(180);
      api.gehe('einfahrt');
      api.sage('Ein Polizist stellt dir viele Fragen, und du gibst wenige Antworten. Die Kanister nehmen sie mit. „Wer hat angerufen?“, fragst du. Er sieht auf sein Tablet. „Der Notruf kam aus dem Haus. Eine Frau.“ Er sieht dich an. „Wohnt hier noch jemand?“');
      api.nervenProbe('1/1W6', { grund: 'das Haus hat die Feuerwehr gerufen' });
      api.setzeFlag('feuer_geloescht');
      return;
    }
    api.sage('Diesmal ruft niemand an. Das Haus schreit – mit Holz, mit Glas, mit tausend Spiegeln, die in der Hitze springen. Du kommst durch ein Fenster ins Freie, das Gesicht voller Ruß.');
    api.verletze('1W4', { grund: 'Feuer' });
    if (z.vorbei) return;
    api.ende('<b>Feuer</b><br><br>Bis zum Morgen brennt Haus Grest bis auf die Grundmauern nieder. Die Feuerwehr kommt zu spät, und sie weiß nicht, wer sie gerufen hat. Du stehst am Gartentor und siehst zu, wie der Turm einstürzt. Zum ersten Mal seit Wochen riecht es nicht nach Lavendel.<br><br>' +
      'Im Frühjahr liest du in der Zeitung, dass jemand das Grundstück am Ulmenweg gekauft hat. Ein Bauherr, der anonym bleiben will. Das Haus soll originalgetreu wiederaufgebaut werden, nach den alten Plänen von 1899. Auf dem Foto zum Artikel steht ein Architekt vor dem Bauzaun und hält die Zeichnungen hoch. Du erkennst die Handschrift auf dem obersten Blatt: <i>Ankleidezimmer</i>.<br><br>Alles beginnt von vorn.');
  }

})();
