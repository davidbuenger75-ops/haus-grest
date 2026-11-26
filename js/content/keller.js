// Haus Grest – Inhalt: der Keller und der Ritualraum der Krähe (Spielbibel 4 „Keller im Spiel“, 8.6.2, 8.9)
// [Vorschlag von Claude, 26.11.2026, aus docs/haus-og-dach-keller.md; Größe und Neumond von David festgelegt]
//
// Kellerflur (Kellertreppe = zweite Treppe der Witwe, Sicherungskasten, zugemauerte Tür zum Kohlenkeller),
// Vorratskeller, Weinkeller (Das Gas), Waschküche (Der Zerschlagende, Salz), Heizungskeller (Rätsel „Die fehlende
// Tür“: messen → Westwand → Vorschlaghammer) und der Ritualraum (Rätsel „Den Kreis brechen“, dreizehn Nägel,
// Kalender der Krähe mit dem Neumond-Countdown).
//
// Lage (David, 26.11.2026 – „schmaler Streifen“): Brinkhoff hat 1975 beim Einbau der Ölheizung den Heizungskeller
// in den Kohlenkeller hinein verbreitert und davor eine neue Wand gezogen. Dahinter blieb ein Gewölbestreifen
// von 2,40 × 8,50 m unter der Halle – der Ritualraum. Daher Carstens Notiz: „Heizungskeller bis Wand 3,60. Fehlen: 2,40 m.“
// Laut Plan: Heizungskeller 7,00 + Kohlenkeller 6,00 = 13,00 m; gemessen von der Ostwand: 10,60 m.
//
// Muss nach gefahren.js, dachboden.js und polizeiwache.js geladen werden.
(function () {

  var KELLER = ['kellerflur', 'vorratskeller', 'weinkeller', 'waschkueche', 'heizungskeller', 'ritualraum'];
  var TAG = ['morgen', 'mittag'], NACHT = ['nacht'];
  function imKeller(api) { return KELLER.indexOf(api.raum()) >= 0; }
  function durch(api) { return !!api.flag('wand_durch'); }
  function gebrochen(api) { return !!api.flag('kreis_gebrochen'); }

  // Lärm im Keller: In der Nacht hört das Haus zu – die Wandernde kommt (einmal pro Nacht)
  function laerm(api, text) {
    if (!api.istNacht()) return;
    var ph = api.nachtphase();
    if (ph !== 'daemmerung' && ph !== 'tief') return;
    if (api.flag('keller_laerm_nacht') === HG.nacht.nummer() || api.machtStufe() === 'schwach') return;
    var w = HG.gefahren.st().wanderer;
    if (w && w.nacht === HG.nacht.nummer() && w.fertig) return;
    api.setzeFlag('keller_laerm_nacht', HG.nacht.nummer());
    HG.ausgabe.schreibe('spuk', text || 'Über dir, im Erdgeschoss, schlägt eine Tür. Dann nackte Füße auf der Kellertreppe, langsam, Stufe für Stufe. Lavendel kriecht durch den Keller.');
    api.kampf('die_wandernde', {});
  }

  // ===================================================================
  // Zugang: die Kellertür im Flur (die Kette öffnet dachboden.js) und die Kellertreppe
  // ===================================================================
  var KELLERTREPPE = {
    unten: 'kellerflur', kabel: false,
    runter: 'Du leuchtest die Kellertreppe hinunter – und unten, auf dem Steinboden, steht jemand. Eine Frau in Schwarz, die Hände gefaltet, das Gesicht im Schatten. Die Stufen sind plötzlich schmaler, als sie sein dürften, und eine fehlt, ganz bestimmt fehlt eine.',
    hoch: 'Auf halber Höhe der Kellertreppe gibt die nächste Stufe nach – oder sie war nie da. Hinter dir, unten im Kellerflur, raschelt schwarzer Stoff.',
    sturz: 'Unten auf dem Steinboden des Kellerflurs bleibst du liegen.'
  };
  var flur = HG.daten.raeume.flur;
  var flurKurz = flur.kurz;
  flur.kurz = function (api) { var t = HG.wert(flurKurz, api); return api.flag('kellerkette_offen') ? t.replace('Die Kellertür ist mit einer Kette gesichert.', 'Unten: der Keller.') : t; };
  flur.ausgaenge.runter = {
    ziel: 'kellerflur', gefahr: 'witwe', treppe: KELLERTREPPE,
    sperre: function (api) {
      if (!api.flag('kellerkette_offen')) return 'Die Kellertür ist mit einer schweren Kette und einem Vorhängeschloss gesichert. Ohne den passenden Schlüssel – oder eine Säge – kommst du nicht hinunter.';
      return null;
    },
    text: function (api) {
      return api.flag('keller_besucht') ? 'Du ziehst die Kellertür auf und steigst die steile Steintreppe hinunter.'
        : 'Du ziehst die Kellertür auf. Eine steile Steintreppe führt in die Dunkelheit, kalte Luft steigt dir entgegen, und ganz unten riecht es nach Lavendel. Elf Stufen. Du zählst sie.';
    }
  };

  // ===================================================================
  // KELLERFLUR
  // ===================================================================
  HG.raum('kellerflur', {
    name: 'Kellerflur',
    woerter: ['kellerflur', 'keller', 'flur', 'gang', 'kellergang'],
    schauplatz: 'haus', karte: { x: -10, y: -1 },
    dunkel: true,
    dunkelText: 'Stockfinster. Unter deinen Schuhen Stein, feucht und kalt. Irgendwo tropft Wasser, in langen, regelmäßigen Abständen, als zähle jemand.',
    beschreibung: function (api) {
      return 'Ein niedriger Gang aus Bruchstein, gewölbt, so feucht, dass die Wände im Licht glänzen. Die steile Steintreppe führt hinauf zum Flur. ' +
        'Neben der Treppe hängt ein grauer Sicherungskasten aus den Siebzigern, aus dem Kabel in alle Richtungen laufen – und alle irgendwo abgeschnitten. ' +
        'In der Südwand zeichnet sich der Umriss einer Tür ab, vermauert mit Ziegeln, die heller sind als der Stein ringsum. ' +
        'Nach Westen geht es in einen Vorratskeller, nach Osten in die Waschküche.';
    },
    kurz: 'Der feuchte Kellerflur mit dem Sicherungskasten und der vermauerten Tür. Westen: Vorratskeller, Osten: Waschküche, hoch: Flur.',
    horchen: { tag: 'Wasser tropft. Über dir, gedämpft durch die Decke, gehen Schritte durch das Haus – oder es arbeitet nur das Holz.', nacht: 'Über dir knarrt die Kellertreppe. Eine Stufe. Dann lange nichts. Dann die nächste.' },
    riechen: 'Nasser Stein, Schimmel – und, ganz schwach, Lavendel.',
    tasten: 'Der Stein ist kalt und schmierig vor Feuchtigkeit.',
    ausgaenge: {
      hoch: { ziel: 'flur', gefahr: 'witwe', treppe: KELLERTREPPE, text: 'Du steigst die elf Stufen hinauf zurück in den Flur.' },
      westen: 'vorratskeller', osten: 'waschkueche'
    },
    beimBetreten: function (api) {
      if (api.flag('keller_besucht')) return;
      api.setzeFlag('keller_besucht');
      if (!api.hell()) api.sage('<span class="nebenbei">(Hier unten gibt es kein Licht. Ohne Lampe oder Kerze siehst du nichts.)</span>');
    },
    vorschlaege: function (api) { return api.hell() ? ['untersuche sicherungskasten', 'untersuche vermauerte tür', 'geh nach osten'] : ['geh hoch']; },
    details: [
      { nomen: 'Kellertreppe', genus: 'f', woerter: ['kellertreppe', 'treppe', 'stufen', 'stufe'], text: 'Elf Stufen aus Stein, ausgetreten in der Mitte, als wären hundert Jahre lang Menschen hier hinauf- und hinabgestiegen. Ein Geländer gibt es nicht. Auf der vorletzten Stufe liegt ein schwarzer Knopf, wie von einem Damenmantel.' }
    ]
  });

  // Sicherungskasten: Der falsche Notar hat geschrieben, hier komme der Strom zurück. Er kommt nicht. (Stimmung)
  function hauptschalter(api) {
    if (!api.hell()) { api.sage('Du tastest nach dem Kasten, findest einen Hebel und legst ihn um. Ein Klacken. Sonst nichts.'); return true; }
    if (api.zaehle('hauptschalter') > 1) { api.sage('Du legst den Hauptschalter um. Er klackt. Nichts geschieht – nur, ganz weit oben im Haus, knackt etwas, als hielte jemand den Atem an.'); return true; }
    api.sage('Du legst den Hauptschalter um. Ein Klacken, ein Summen in den Kabeln – und für einen Herzschlag fällt von oben, durch die Ritzen der Kellertür, Licht die Treppe herunter. Nicht das Licht einer Lampe im Flur. Es kommt von weiter oben, aus dem ersten Stock, und es ist kalt und silbrig, wie Licht, das von Glas zurückgeworfen wird. Dann ist es dunkel. Der Schalter steht wieder auf AUS, obwohl du ihn nicht losgelassen hast.');
    var sms = (HG.zustand.z.handy && HG.zustand.z.handy.nachrichten) || [];
    if (sms.some(function (n) { return n.id === 'falscher_notar_keller'; })) api.sage('Der Notar hat geschrieben, der Strom sei wieder da. Der Notar hat dir nie eine SMS geschrieben.');
    api.nervenProbe('0/1W3', { grund: 'Licht von oben', gewoehnung: 'hauptschalter' });
    return true;
  }
  HG.ding('sicherungskasten', {
    nomen: 'Sicherungskasten', genus: 'm', adj: ['grau'], woerter: ['sicherungskasten', 'kasten', 'sicherungen', 'hauptschalter', 'schalter', 'hebel', 'kabel', 'stromkasten'],
    ort: 'kellerflur', fest: 'Der Kasten ist fest an die Wand geschraubt.', szenerie: true,
    beschreibung: 'Ein grauer Blechkasten, „Elektro Brinkhoff & Sohn, 1975“ auf einem Aufkleber. Darin Schraubsicherungen, eine Reihe Kippschalter, alle mit Bleistift beschriftet: Halle, Küche, Salon, Bibliothek … Ein Feld ist leer und mit Klebeband überklebt. Daneben ein großer roter Hebel: HAUPTSCHALTER. Er steht auf AUS. Die Kabel, die aus dem Kasten laufen, sind alle nach ein paar Zentimetern sauber durchgeschnitten.',
    bei: { druecken: hauptschalter, ziehen: hauptschalter, anzuenden: hauptschalter, benutzen: hauptschalter, drehen: hauptschalter }
  });
  HG.ding('vermauerte_tuer', {
    nomen: 'Tür', genus: 'f', adj: ['vermauert'], kurzwort: 'vermauerte tür',
    woerter: ['tuer', 'tuerumriss', 'umriss', 'ziegel', 'suedwand', 'kohlenkellertuer', 'mauer', 'wand'], adjektive: ['vermauert', 'zugemauert', 'hell'],
    ort: 'kellerflur', fest: true, szenerie: true,
    beschreibung: 'In der Südwand des Kellerflurs: ein Türbogen, ausgefüllt mit hellen, neueren Ziegeln, sauber verfugt. Laut Bernwards Plan führte hier die Tür in den Kohlenkeller. Die Ziegel sind gestempelt: „1975“.',
    klopfen: 'Du klopfst gegen die Ziegel. Es klingt massiv. Als du das Ohr daran legst, hörst du dahinter ein leises Ticken, wie Metall, das abkühlt – und das Gluckern von Öl in einem Tank. Hinter dieser Tür liegt nicht der Kohlenkeller. Dahinter steht die Heizung.',
    bei: {
      zerbrechen: function (api, ctx) {
        if (!api.traegt('vorschlaghammer')) return false;
        ctx.dauer = 10;
        api.sage('Du schlägst ein paar Ziegel heraus. Dahinter: Beton, grau und glatt, und durch einen Spalt siehst du die gelbe Flanke eines Öltanks. Hier geht es nur in den Heizungskeller. Brinkhoff hat gründlich gearbeitet.');
        laerm(api);
        return true;
      }
    }
  });

  // ===================================================================
  // VORRATSKELLER
  // ===================================================================
  HG.raum('vorratskeller', {
    name: 'Vorratskeller',
    woerter: ['vorratskeller', 'vorrat', 'vorratsraum'],
    schauplatz: 'haus', karte: { x: -11, y: -1 },
    dunkel: true,
    dunkelText: 'Stockfinster. Durch einen Lichtschacht oben in der Wand fällt ein schmutziger Schimmer, der nichts erhellt. Es riecht nach Erde und Essig.',
    beschreibung: 'Ein gewölbter Raum mit Holzregalen bis unter die Decke. Darauf Einmachgläser, Hunderte, mit vergilbten Etiketten in einer runden, sorgfältigen Frauenschrift. In der Ecke eine Lattenkiste für Kartoffeln, leer bis auf ein paar schwarze Keime. Oben in der Wand ein vergittertes Kellerfenster zu einem Lichtschacht. Im Süden führt ein niedriger Bogen in den Weinkeller, im Osten geht es zurück in den Kellerflur.',
    kurz: 'Der Vorratskeller mit den Einmachgläsern. Süden: Weinkeller, Osten: Kellerflur.',
    horchen: { tag: 'Stille. Dann ein leises Klicken, wie ein Deckel, der sich im Glas setzt.', nacht: 'In den Regalen klirrt Glas gegen Glas, leise und rhythmisch, wie Zähne, die klappern.' },
    riechen: 'Essig, Erde und süßlich Vergorenes.',
    versteckOrt: { text: 'Du kauerst dich hinter die Kartoffelkiste in die Ecke, die Knie an der Brust. Um dich herum stehen die Gläser wie Zuschauer.', mod: 5 },
    ausgaenge: { osten: 'kellerflur', sueden: 'weinkeller' },
    vorschlaege: function (api) { return api.hell() ? ['untersuche einmachgläser', 'geh nach süden'] : ['geh nach osten']; },
    details: [
      { nomen: 'Kartoffelkiste', genus: 'f', woerter: ['kartoffelkiste', 'kiste', 'lattenkiste', 'kartoffeln', 'keime'], text: 'Eine Lattenkiste, leer bis auf schwarze, fingerlange Keime, die sich zum Lichtschacht recken.', versteckOrt: { text: 'Du kauerst dich hinter die Kartoffelkiste.', mod: 5 } },
      { nomen: 'Kellerfenster', genus: 'n', woerter: ['kellerfenster', 'fenster', 'lichtschacht', 'gitter', 'schacht'], text: 'Ein kleines Fenster mit Eisengitter, dahinter ein Lichtschacht voller nasser Blätter. Zu schmal, selbst für ein Kind. Draußen geht der Garten weiter, als gäbe es kein Haus.' }
    ]
  });
  HG.ding('einmachglaeser', {
    nomen: 'Einmachgläser', genus: 'pl', woerter: ['einmachglaeser', 'glaeser', 'glas', 'einmachglas', 'etiketten', 'etikett', 'regale', 'regal'],
    ort: 'vorratskeller', fest: 'Die Gläser sind festgerostet, eins am anderen. Du lässt sie stehen.', szenerie: true,
    beschreibung: function (api) {
      return 'Bohnen, Rote Bete, Pflaumen, Kürbis. Die Etiketten tragen alle dieselbe Handschrift und Daten von 1934 bis 1938: „M. O. – Stachelbeeren, Juli 1936“. Margarete Ostermann hat hier unten Vorräte angelegt, als wolle sie eine Belagerung überstehen. Die letzten Gläser von 1938 haben kein Obst mehr in sich, nur trübes Wasser – und Etiketten, auf denen dasselbe steht: <i>„Für Heinrich.“</i> ' +
        'Ganz hinten steht ein Glas ohne Etikett. Darin schwimmt etwas Dunkles, Gefiedertes.' + (api.istNacht() ? ' Es bewegt sich.' : '');
    },
    riechen: 'Essig und etwas Süßes, das nicht süß sein sollte.'
  });

  // ===================================================================
  // WEINKELLER (Das Gas – Dr. Karl Albers)
  // ===================================================================
  HG.raum('weinkeller', {
    name: 'Weinkeller',
    woerter: ['weinkeller', 'gewoelbe', 'weinregal'],
    schauplatz: 'haus', karte: { x: -11, y: 0 },
    dunkel: true,
    dunkelText: 'Stockfinster. Ein langes Gewölbe – du hörst es am Echo deines Atems. Es riecht nach Kork und nach etwas Süßlichem, das du nicht einordnen kannst.',
    beschreibung: 'Ein langes Tonnengewölbe aus Backstein, tief und kühl. An beiden Seiten Weinregale aus Holz, die meisten Fächer leer, in einigen liegen noch Flaschen unter einer Staubschicht, dick wie Filz. Unter dem Scheitel des Gewölbes läuft ein altes Rohr entlang, mit Rostblüten, das irgendwo oben in der Decke verschwindet. In der Westwand zwei schmale Kellerfenster, vergittert. Es gibt nur einen Weg hinaus: nach Norden, zurück in den Vorratskeller.',
    kurz: 'Das Tonnengewölbe des Weinkellers – eine Sackgasse. Norden: Vorratskeller.',
    horchen: { tag: 'Stille, so tief, dass du dein Blut hörst.', nacht: 'Ein Zischen, ganz leise, von irgendwo über dir. Wie ein Ventil, das nicht ganz schließt.' },
    riechen: 'Kork, Staub, Wein, der zu Essig geworden ist – und ein Hauch von etwas Süßlich-Fauligem.',
    ausgaenge: { norden: 'vorratskeller' },
    bei: {
      // Sackgasse: hier versteckt man sich nicht (Entwurf)
      verstecken: function (api) { api.sage('Hier nicht. Der Gedanke, am Ende dieses Gewölbes zu kauern, mit nur einem Weg hinaus, schnürt dir die Kehle zu.'); return true; }
    },
    vorschlaege: function (api) { return api.hell() ? ['untersuche weinregale', 'untersuche rohr'] : ['geh nach norden']; },
    details: [
      { nomen: 'Rohr', genus: 'n', woerter: ['rohr', 'gasleitung', 'leitung', 'rostblueten', 'ventil'], text: 'Eine alte Gasleitung aus Eisen, gelb gestrichen, die Farbe abgeblättert. Ein Messingschild: „Stadtwerke Dortmund – stillgelegt 10/1946“. Das Ventil ist mit Draht und einer Plombe gesichert.', riechen: 'Rost. Und, wenn du lange genug daran riechst, etwas Süßliches.' },
      { nomen: 'Kellerfenster', genus: 'pl', woerter: ['kellerfenster', 'fenster', 'gitter'], text: 'Zwei schmale Fenster unter der Decke, vergittert, das Glas blind vor Schmutz. Sie lassen sich kippen – wenn man fest genug drückt.' }
    ]
  });
  HG.ding('weinregale', {
    nomen: 'Weinregale', genus: 'pl', woerter: ['weinregale', 'regale', 'regal', 'flaschen', 'flasche', 'wein'],
    ort: 'weinkeller', fest: true, szenerie: true,
    beschreibung: 'Die meisten Fächer sind leer. Die Flaschen, die noch liegen, tragen Etiketten von Weingütern an der Mosel, Jahrgänge 1934 bis 1943, und ein kleines Klebeschild: „Dr. K. A.“. Eine einzelne Flasche liegt quer vor den anderen, als hätte sie jemand zuletzt hingelegt. Um ihren Hals hängt ein Pappschild.',
    lesbar: 'Auf dem Pappschild, in einer schrägen Arztschrift: <i>„Für den Tag, an dem sie geht. K. A., Mai 1945.“</i> Die Flasche ist nie geöffnet worden.'
  });
  // Das Gas auch im Weinkeller (Spielbibel 8.9.0: „Weinkeller folgt“)
  HG.daten.gefahren.gas.orte.push('weinkeller');
  HG.daten.gefahren.gas.raeume.weinkeller = {
    abschnitt: 50, start: 'Ein Zischen, leise, gleichmäßig, über dir. Dann der Geruch: süßlich, faulig, nach Gas. Er kommt aus dem alten Rohr unter dem Gewölbe, das seit 1946 verplombt ist – und er sammelt sich hier unten, am tiefsten Punkt des Hauses.',
    schwindel: 'Dir wird schwindlig. Das Gewölbe senkt sich, Regal für Regal, als wolle es sich über dich legen.',
    aufwachen: 'Du wachst auf dem Backsteinboden des Weinkellers auf, die Wange im Staub. Es ist drei Uhr. Kein Zischen mehr. Das Ventil oben am Rohr ist verplombt, der Draht unberührt.',
    fenster: 'Ein Kellerfenster aufstoßen', fensterGrund: 'verrostetes Kellerfenster',
    fensterAuf: 'Das Kellerfenster schlägt mit einem Kreischen nach außen auf. Nasse Nachtluft fällt herein, und der Geruch ist fort, als hätte es ihn nie gegeben.',
    fensterKlemmt: 'Das Fenster ist festgerostet und rührt sich nicht.',
    raus: 'Raus in den Vorratskeller', rausNach: 'vorratskeller',
    herd: 'Luft anhalten und das Ventil am Rohr untersuchen', herdText: 'Das Ventil ist verplombt, seit 1946. Und doch zischt es irgendwo darin, ganz nah an deinem Ohr.'
  };

  // ===================================================================
  // WASCHKÜCHE (Der Zerschlagende – Josef Brzezinski; Salz)
  // ===================================================================
  HG.raum('waschkueche', {
    name: 'Waschküche',
    woerter: ['waschkueche', 'waschraum'],
    schauplatz: 'haus', karte: { x: -9, y: -1 },
    dunkel: true,
    dunkelText: 'Stockfinster. Es riecht nach Seifenlauge und kaltem Wasser. Irgendwo vor dir glänzt etwas schwach – Glas.',
    beschreibung: function (api) {
      return 'Eine Waschküche wie aus einem Museum: ein eingemauerter Waschkessel aus Kupfer mit Feuerloch darunter, eine Wäschemangel mit Holzwalzen und Kurbel, an der Wand Zinkwannen und Waschbretter. Über dem steinernen Ausguss hängt ein kleiner, trüber Spiegel. ' +
        'Auf einem Bord neben dem Kessel steht ein großer Steinguttopf. Im Westen geht es zurück in den Kellerflur, im Süden in den Heizungskeller.';
    },
    kurz: 'Die Waschküche mit Waschkessel, Mangel und dem trüben Spiegel. Westen: Kellerflur, Süden: Heizungskeller.',
    horchen: { tag: 'Ein Tropfen fällt in den Kupferkessel. Es klingt wie eine Glocke, ganz fern.', nacht: 'Glas, das knackt. Leise, immer wieder, wie Eis auf einem See.' },
    riechen: 'Kernseife, Lauge, nasses Holz.',
    ausgaenge: { westen: 'kellerflur', sueden: 'heizungskeller' },
    vorschlaege: function (api) { return api.hell() ? ['untersuche steinguttopf', 'untersuche spiegel', 'geh nach süden'] : ['geh nach westen']; },
    details: [
      { nomen: 'Waschkessel', genus: 'm', woerter: ['waschkessel', 'kessel', 'kupferkessel', 'feuerloch'], text: 'Ein Kupferkessel, eingemauert in einen Sockel aus Ziegeln, darunter ein Feuerloch voller kalter Asche. Im Kessel steht ein Rest Wasser, schwarz und still.' },
      { nomen: 'Mangel', genus: 'f', woerter: ['mangel', 'waeschemangel', 'walzen', 'kurbel'], text: 'Eine Wäschemangel aus Gusseisen mit zwei Holzwalzen. Zwischen den Walzen klemmt noch ein Zipfel Stoff, grau und brüchig.', drehen: 'Du drehst an der Kurbel. Die Walzen knarren und ziehen den Stoffzipfel ein Stück weiter – und von der anderen Seite schiebt sich ein Ärmel heraus, hellblau, wie frisch genäht.' },
      { nomen: 'Zinkwannen', genus: 'pl', woerter: ['zinkwannen', 'wannen', 'wanne', 'waschbretter', 'waschbrett'], text: 'Zinkwannen, verbeult, und Waschbretter aus Riffelblech. Alles ordentlich an Haken gehängt.' }
    ]
  });
  HG.ding('waschkueche_spiegel', {
    nomen: 'Spiegel', genus: 'm', adj: ['trüb', 'klein'], woerter: ['spiegel', 'glas', 'spiegelglas', 'ausguss'],
    ort: 'waschkueche', fest: 'Der Spiegel hängt an einem rostigen Nagel und lässt sich nicht abnehmen – als wäre er in die Wand gewachsen.', szenerie: true,
    spiegel: 'klein',
    beschreibung: 'Ein kleiner Spiegel über dem Ausguss, das Glas trüb und an den Rändern schwarz angelaufen. In der Ecke ein Sprung, der schon wieder zugewachsen ist – du siehst noch die feine Naht.',
    bei: {
      hineinschauen: function (api) {
        api.sage('Im trüben Glas siehst du dich, verschwommen wie unter Wasser. Hinter deiner Schulter steht ein Mann im Unterhemd, die Hände erhoben, die Fäuste voller Blut, und sieht nicht dich an – sondern den Spiegel. Als du dich umdrehst, ist da nur die Mangel.');
        api.nervenProbe('0/1W3', { grund: 'Blick in den Spiegel', gewoehnung: 'waschkueche_spiegel' });
        return true;
      }
    }
  });
  // Der Zerschlagende wartet auch hier (Spielbibel 8.9.0: „Waschküche folgt“)
  HG.daten.gefahren.zerschlagende.orte.push('waschkueche');
  HG.daten.gefahren.zerschlagende.spiegelIn.waschkueche = 'waschkueche_spiegel';

  // --- Salz: „Salz auf die Schwelle, in einer Linie ohne Lücke“ (Kräuterbuch) ---
  HG.ding('salztopf', {
    nomen: 'Steinguttopf', genus: 'm', adj: ['groß'], woerter: ['steinguttopf', 'topf', 'salztopf', 'steingut'],
    ort: 'waschkueche', fest: 'Der Topf ist zu schwer. Er ist fast bis oben voll.', szenerie: true,
    behaelter: true, offen: true,
    beschreibung: 'Ein großer grauer Steinguttopf mit blauer Glasur, auf dem Bauch in Blau: <b>SALZ</b>. Er ist fast bis zum Rand voll mit grobem, grauem Salz – genug für Jahre. Wer braucht in einer Waschküche so viel Salz?'
  });
  function salzDabei(api) { return api.traegt('salz'); }
  HG.ding('salz', {
    nomen: 'Salz', genus: 'n', adj: ['grob', 'grau'], woerter: ['salz', 'salztuete', 'tuete', 'papiertuete', 'salzlinie', 'linie'],
    ort: 'salztopf', rel: 'in', klein: true,
    salz: true, vorratStueck: 3,   // drei Linien, dann ist die Tüte leer (sie liegt dann wieder beim Topf) – js/engine/gefahr.js
    beschreibung: function (api) {
      if (!salzDabei(api)) return 'Grobes, graues Salz, fast bis zum Rand des Topfes.';
      var n = api.eig('salz', 'anzahl'); if (n === undefined || n === null) n = 3;
      return 'Eine alte Papiertüte voll grobem Salz aus der Waschküche. Genug für ' + (n === 1 ? 'eine Linie' : (['', '', 'zwei', 'drei'][n] || n) + ' Linien') + '.';
    },
    tasten: 'Grob und kühl, wie Kies.',
    bei: {
      nehmen: function (api) {
        if (salzDabei(api)) return false;
        api.bewege('salz', 'spieler');
        api.setze('salz', 'anzahl', 3);
        api.sage('Neben dem Topf liegt eine alte Papiertüte. Du füllst sie mit Salz und drehst sie oben zu. Genug für drei Linien, vielleicht.');
        return true;
      },
      streuen: function (api) {
        if (!salzDabei(api)) { api.sage('Nimm dir zuerst etwas Salz.'); return true; }
        var r = HG.welt.raum();
        if (r.schauplatz !== 'haus') { api.sage('Hier braucht es keine Salzlinie.'); return true; }
        if (HG.gefahren.geschuetzt(r.id)) { api.sage('Hier liegt schon eine Linie. Ohne Lücke.'); return true; }
        HG.gefahren.schuetze(r.id);
        var leer = HG.stueckVerbrauchen('salz');
        api.sage('Du streust Salz über jede Schwelle des Raums, eine graue Linie ohne Lücke, von Türrahmen zu Türrahmen. Es sieht lächerlich aus. Du fühlst dich trotzdem besser.' +
          (api.hatHinweis('kraeuterbuch') || (HG.zustand.z.getan || {}).kraeuterbuch ?' <i>„Was aus dem Glas kommt, geht nicht darüber. Für eine Nacht.“</i>' : '') +
          (leer ? ' Die Tüte ist leer.' : ''));
        return true;
      },
      legen: function (api, ctx) { if (ctx.obj2 === 'salztopf') return false; return HG.daten.dinge.salz.bei.streuen(api); },
      benutzen: function (api) { return HG.daten.dinge.salz.bei.streuen(api); }
    }
  });
  HG.spielDaten({ wanderer: Object.assign(HG.daten.spiel.wanderer, {
    salzText: 'Schritte, ganz nah. Nackte Füße. Sie bleiben an der Schwelle stehen, genau vor der Salzlinie. Lange. Du hörst sie atmen, ruhig und geduldig. Dann gehen sie weiter.'
  }) });

  // ===================================================================
  // HEIZUNGSKELLER – Rätsel „Die fehlende Tür“
  // ===================================================================
  function planBekannt(api) {
    var g = HG.zustand.z.getan || {};
    return api.hatHinweis('bauplan_signatur') || api.hatHinweis('carstens_plan') || api.traegt('bauplan') ||
      !!(g.messnotizen && g.messnotizen.lesen) || HG.handy.hatFoto('messnotizen');
  }
  function gefunden(api, text) {
    if (api.flag('wand_gefunden')) return;
    api.setzeFlag('wand_gefunden');
    api.sage((text ? text + ' ' : '') + 'Du nimmst ein Stück Kreide von der Werkbank und ziehst ein großes Kreuz auf den Putz der Westwand.');
    api.hinweis('fehlende_wand');
  }
  // Messen: mit dem Laser (schnell, genau) oder dem Zollstock von der Werkbank (lange, Probe)
  function messung(api, ctx, womit) {
    if (api.flag('wand_gefunden')) { api.sage('Du hast schon gemessen: 10,60 m, wo es 13,00 sein müssten. Das Kreuz an der Westwand markiert die Stelle.'); return true; }
    var laser = (womit === 'laser' || !womit) && api.traegt('laser') && !api.eig('laser', 'kaputt');
    var zoll = !laser && (womit === 'zollstock' || !womit || womit === 'laser') && (api.traegt('zollstock') || api.hier('zollstock'));
    if (womit === 'laser' && api.traegt('laser') && api.eig('laser', 'kaputt') && !zoll) { api.sage('Das Display des Lasers zeigt nur Striche.'); return true; }
    var ergebnis;
    if (laser) {
      ctx.dauer = 3;
      ergebnis = 'Ein roter Punkt springt an die Westwand. Das Display, quer durch den Riss: <b>10,60 m</b> – von der Ostwand bis zur Westwand.';
    } else if (zoll) {
      ctx.dauer = 25;
      if (!api.traegt('zollstock')) { api.bewege('zollstock', 'spieler'); api.sage('<span class="nebenbei">(Du nimmst den Zollstock von der Werkbank.)</span>'); }
      if (api.eig('laser', 'kaputt') && api.traegt('laser')) api.sage('Der Laser ist kaputt – also von Hand.');
      var e = api.probe('wahrnehmung', { grund: 'von Hand messen' });
      if (!e.erfolg) {
        api.sage('Du klappst den Zollstock auf und zu, Meter für Meter an der Wand entlang, über den Öltank hinweg. Irgendwo verzählst du dich: einmal 10,40, einmal 10,80. Du müsstest noch einmal von vorn anfangen.');
        api.fehlversuch('wand_messen', { 2: 'Mit einem Laser ginge es schneller – Carsten hatte einen. Oder du versuchst es noch einmal mit dem Zollstock.', 3: 'Du kannst die Stelle auch finden, indem du an die Wände klopfst. <span class="nebenbei">(„klopfe an die westwand“)</span>' });
        return true;
      }
      ergebnis = 'Du klappst den Zollstock auf und zu, Meter für Meter, über den Öltank hinweg, bis an die Westwand. Zweimal, um sicher zu sein: <b>10,60 m</b>.';
    } else {
      api.sage(api.traegt('laser') ? 'Das Display des Lasers zeigt nur Striche.' : 'Womit? Mit bloßem Auge lässt sich das nicht sagen.');
      return true;
    }
    api.setzeFlag('wand_gemessen');
    if (!planBekannt(api)) { api.sage(ergebnis + ' Ob das zum Haus passt? Ohne Bernwards Bauplan kannst du es nicht sagen.'); return true; }
    gefunden(api, ergebnis + ' Laut Bernwards Plan reichte der Heizungskeller sieben Meter weit, dahinter lag der Kohlenkeller, noch einmal sechs: zusammen <b>13,00 m</b>. Es fehlen <b>2,40 m</b> – genau wie Carsten notiert hat. Hinter der Westwand ist ein Raum.');
    return true;
  }

  HG.raum('heizungskeller', {
    name: 'Heizungskeller',
    woerter: ['heizungskeller', 'heizraum', 'heizung'],
    schauplatz: 'haus', karte: { x: -9, y: 0 },
    dunkel: true,
    dunkelText: 'Stockfinster. Es riecht nach Heizöl. Etwas Großes, Rundes steht vor dir im Dunkeln – du stößt mit dem Knie dagegen, und es klingt hohl.',
    beschreibung: function (api) {
      var t = 'Ein langer, niedriger Raum, größer, als ein Heizungskeller sein müsste. An der Ostwand steht eine Ölheizung aus den Siebzigern, orange lackiert, kalt. Davor, wo der Raum nach Westen weitergeht, ein riesiger gelber Öltank. Im Estrich läuft quer durch den Raum eine gerade Naht, als hätte dort einmal eine Wand gestanden. An der Nordseite eine Werkbank mit Werkzeug. ';
      if (durch(api)) t += 'In der Westwand klafft ein Loch, groß genug, um hindurchzusteigen. Dahinter: Schwärze und kalte Luft.';
      else t += 'Die Westwand ist glatt verputzt, heller als die anderen Wände – auffallend frisch, als wäre sie gestern gestrichen worden.' + (api.flag('wand_gefunden') ? ' Darauf dein Kreidekreuz.' : '');
      return t + ' Im Norden geht es zurück in die Waschküche.';
    },
    kurz: function (api) { return 'Der Heizungskeller mit Ölheizung, Tank und Werkbank. ' + (durch(api) ? 'Westen: durch das Loch in den Raum dahinter. ' : '') + 'Norden: Waschküche.'; },
    horchen: { tag: 'Das Gluckern von Öl im Tank. Und, wenn du still bist, etwas hinter der Westwand – wie ein sehr langsamer Atem.', nacht: 'Hinter der Westwand scharrt etwas über Stein. Dann Stille, als lausche es zurück.' },
    riechen: function (api) { return durch(api) ? 'Heizöl – und aus dem Loch in der Westwand: Kohle, Asche und Lavendel.' : 'Heizöl und feuchter Putz. Und, ganz nah an der Westwand, Lavendel.'; },
    ausgaenge: {
      norden: 'waschkueche',
      westen: { ziel: 'ritualraum', unsichtbar: function (api) { return !durch(api); },
        sperre: function (api) { return durch(api) ? null : 'Da ist nur die Westwand.'; },
        text: 'Du steigst über die Ziegelbrocken durch das Loch in der Wand.' }
    },
    // „miss raum“, „miss die wand mit dem laser“ (Verb messen, js/engine/aktionen.js)
    bei: {
      messen: function (api, ctx) { return messung(api, ctx, ctx.obj2 || null); }
    },
    // Natascha (bekehrt) zeigt die Stelle (Spielbibel 8.6.5)
    beimBetreten: function (api) {
      if (api.flag('wand_gefunden') || !api.bekehrt('natascha')) return;
      HG.ausgabe.schreibe('spuk', 'An der Westwand kratzt etwas. Ein Spachtel, der über Putz fährt, ruhig und geübt. Als du hinleuchtest, ist niemand da – aber im frischen Putz ist ein langer, gerader Strich, in Hüfthöhe, und darunter, in einer schnellen, schrägen Schrift: <i>hier</i>.');
      gefunden(api, 'Natascha hat dir die Stelle gezeigt.');
    },
    vorschlaege: function (api) {
      if (durch(api)) return ['geh nach westen'];
      if (!api.hell()) return ['geh nach norden'];
      var v = [];
      if (!api.flag('wand_gefunden')) { v.push(api.traegt('laser') && !api.eig('laser', 'kaputt') ? 'miss raum mit laser' : 'miss raum'); v.push('klopfe an westwand'); }
      v.push('untersuche werkbank');
      if (api.flag('wand_gefunden')) v.push('zerschlage wand mit vorschlaghammer');
      return v;
    },
    details: [
      { nomen: 'Ölheizung', genus: 'f', woerter: ['oelheizung', 'heizung', 'brenner', 'kessel', 'heizkessel'], text: 'Ein orangefarbener Heizkessel, Baujahr 1975, auf dem Typenschild: „Einbau: Architekturbüro H.-J. Brinkhoff“. Der Brenner ist kalt, die Leitungen nach oben sind abgeklemmt. Diese Heizung hat seit Jahrzehnten niemanden gewärmt.' },
      { nomen: 'Öltank', genus: 'm', woerter: ['oeltank', 'tank', 'kohlenschuette', 'schuette'], text: 'Ein gelber Kunststofftank, mannshoch. Er steht genau dort, wo laut Bernwards Plan der Kohlenkeller anfing. Dahinter, im Boden, eine zubetonierte Öffnung: die alte Kohlenschütte.', klopfen: 'Hohl. Ein Rest Öl schwappt darin.' },
      { nomen: 'Naht', genus: 'f', woerter: ['naht', 'estrich', 'boden', 'fuge'], text: 'Eine gerade Fuge im Estrich, quer durch den Raum, sieben Meter von der Ostwand. Hier stand einmal die Wand zwischen Heizungskeller und Kohlenkeller. Jemand hat sie herausgerissen – und weiter westlich eine neue gezogen.' }
    ]
  });
  HG.ding('werkbank', {
    nomen: 'Werkbank', genus: 'f', woerter: ['werkbank', 'werkzeug', 'werkzeuge', 'kreide', 'schraubstock'],
    ort: 'heizungskeller', fest: 'Die Werkbank ist an die Wand geschraubt.', szenerie: true, ablage: true,
    beschreibung: function (api) {
      var t = 'Eine Werkbank mit Schraubstock, darüber eine Lochwand mit den Umrissen von Werkzeugen, die meisten Haken leer. Ein Stück Schneiderkreide liegt in einer Rille.';
      var auf = [];
      if (api.eig('vorschlaghammer', 'ort') === 'werkbank') auf.push('ein Vorschlaghammer');
      if (api.eig('zollstock', 'ort') === 'werkbank') auf.push('ein gelber Zollstock');
      return t + (auf.length ? ' Auf der Bank liegen ' + HG.text.liste(auf, 'und') + '.' : '') + ' In das Holz der Bank ist ein Satz geritzt: <i>„Bernwards Pläne sind das Einzige, was sie nicht ändern kann.“</i>';
    }
  });
  HG.ding('vorschlaghammer', {
    nomen: 'Vorschlaghammer', genus: 'm', adj: ['schwer'], woerter: ['vorschlaghammer', 'hammer', 'faeustel'],
    ort: 'werkbank', rel: 'auf', hammer: true,
    beschreibung: 'Ein Vorschlaghammer, fünf Kilo, der Stiel aus Esche, dunkel von Händen. Am Kopf klebt grauer Putzstaub. Auf den Stiel ist mit Kugelschreiber geschrieben: „H.-J. B.“'
  });
  HG.ding('zollstock', {
    nomen: 'Zollstock', genus: 'm', adj: ['gelb'], woerter: ['zollstock', 'meterstab', 'gliedermassstab', 'massstab'],
    ort: 'werkbank', rel: 'auf', klein: true, messgeraet: true,
    beschreibung: 'Ein gelber Zollstock aus Holz, zwei Meter. Mühsam, aber genau – wenn man sich nicht verzählt.',
    bei: { benutzen: function (api, ctx) { if (api.raum() !== 'heizungskeller') return false; return messung(api, ctx, 'zollstock'); } }
  });
  HG.daten.dinge.laser.messgeraet = true;
  var laserBenutzen = HG.daten.dinge.laser.bei.benutzen;
  HG.daten.dinge.laser.bei.benutzen = function (api, ctx) {
    if (api.raum() === 'heizungskeller' && !durch(api)) return messung(api, ctx, 'laser');
    if (imKeller(api) && !api.eig('laser', 'kaputt')) { api.sage('Ein roter Punkt springt an die Wand. Hier unten stimmt alles mit Bernwards Plan überein – bis auf den Heizungskeller.'); return true; }
    return laserBenutzen(api, ctx);
  };

  // --- Die Westwand: finden (messen, klopfen, Natascha, blind schlagen) und durchbrechen (3 Treffer) ---
  function treffer(api) { return api.eig('kellerwand', 'treffer') || 0; }
  function hammern(api, ctx) {
    if (durch(api)) { api.sage('Das Loch ist groß genug. Mehr musst du nicht einreißen.'); return true; }
    if (ctx.obj2 === 'brecheisen' || (!api.traegt('vorschlaghammer') && api.traegt('brecheisen') && !api.hier('vorschlaghammer'))) {
      api.sage('Das Brecheisen kratzt nur am Putz. Für diese Wand brauchst du etwas Schweres.'); return true;
    }
    if (!api.traegt('vorschlaghammer')) {
      if (!api.hier('vorschlaghammer')) { api.sage('Mit bloßen Fäusten? Du bräuchtest einen schweren Hammer.'); return true; }
      api.bewege('vorschlaghammer', 'spieler');
      api.sage('<span class="nebenbei">(Du nimmst den Vorschlaghammer von der Werkbank.)</span>');
    }
    ctx.dauer = 5;
    // Wo? Ohne Messung schlägt man aufs Geratewohl (teuer, aber keine Sackgasse)
    if (!api.flag('wand_gefunden')) {
      ctx.dauer = 10;
      if (api.zaehle('wand_blind') < 2) {
        api.sage('Du weißt nicht, wo. Bruchstein, Putz, Ziegel – die Wände sehen alle gleich aus. Du suchst dir eine Stelle an der Nordwand aus und holst aus. Der Hammer prallt vom Bruchstein ab, der Stiel schlägt dir gegen den Oberschenkel.');
        api.verletze('1', { grund: 'Rückschlag' });
        api.fehlversuch('wand_blind', { 2: 'Carsten hat hier unten etwas vermisst – 2,40 Meter. Vielleicht lohnt es sich nachzumessen, bevor du die Wände einreißt.', 3: 'Miss den Raum nach (Laser oder Zollstock) oder klopfe die Wände ab. <span class="nebenbei">(„miss raum“, „klopfe an westwand“)</span>' });
      } else {
        gefunden(api, 'Diesmal versuchst du es an der Westwand, der mit dem frischen Putz. Er platzt in einer Platte ab – und darunter klingt es hohl. Nicht Bruchstein. Ziegel, und dahinter Luft.');
      }
      laermZaehlen(api);
      return true;
    }
    var tag = api.istTag();
    var e = api.probe('st', { grund: 'Wand einschlagen', mod: tag ? -10 : 0, modGrund: tag ? 'bei Tag hart wie Stein' : undefined });
    if (e.patzer) { api.sage('Der Hammer rutscht ab, prallt von der Kante zurück und schlägt dir gegen das Schienbein.'); api.verletze('1W3', { grund: 'Rückschlag' }); }
    else if (!e.erfolg) {
      api.sage(tag ? 'Der Hammer prallt ab, als schlügest du auf Granit. Der Putz bekommt nicht einmal einen Riss. Bei Tag ist diese Wand hart wie Stein.' : 'Der Hammer prallt ab. Ein paar Brocken Putz rieseln herab, mehr nicht.');
      api.fehlversuch('wand_einschlagen', { 2: 'Schwer – aber nicht unmöglich. Bei Tag ist die Wand härter. Nachts gibt sie leichter nach … und nachts hört das Haus jeden Schlag.', 3: 'Schlag einfach weiter zu. Drei gute Treffer, dann ist sie durch. <span class="nebenbei">(„zerschlage wand mit vorschlaghammer“)</span>' });
    } else {
      var n = treffer(api) + 1;
      api.setze('kellerwand', 'treffer', n);
      api.sound(n >= 3 ? 'wand-durchbruch' : 'hammer-wand');
      if (n === 1) api.sage('Du holst aus und schlägst zu, mit dem ganzen Gewicht. Der Putz platzt in Platten ab. Darunter: Ziegel, nicht Bruchstein – neu, schlampig vermauert. Der Schlag hallt durch den ganzen Keller.');
      else if (n === 2) api.sage('Noch ein Schlag. Ein Ziegel bricht nach innen weg und fällt – lange, zu lange – irgendwo auf Stein. Aus dem Loch, faustgroß, kommt kalte Luft. Und Lavendel.');
      else durchbruch(api);
    }
    if (!durch(api)) laermZaehlen(api);
    return true;
  }
  // Nachts: nach dem zweiten Schlag in dieser Nacht kommt die Wandernde
  function laermZaehlen(api) {
    if (!api.istNacht()) return;
    var n = HG.nacht.nummer(), s = api.flag('wand_laerm') || {};
    if (s.nacht !== n) s = { nacht: n, zahl: 0 };
    s.zahl++;
    api.setzeFlag('wand_laerm', s);
    if (s.zahl >= 2) laerm(api);
  }
  function durchbruch(api) {
    api.setzeFlag('wand_durch');
    api.abschnitt(47, 'Beim dritten Schlag gibt die Wand nach. Ziegel poltern nach innen, in eine Dunkelheit, die tiefer ist als der Keller. Kalte Luft schlägt dir entgegen, trocken und alt, und sie riecht nach Lavendel – und darunter nach etwas Älterem: Kohle, Asche, ein Stall im Winter. Hinter der Wand liegt ein schmaler, gewölbter Raum, kaum zweieinhalb Meter breit. Der Kohlenkeller. Oder das, was die Pflegerin daraus gemacht hat.');
    api.nervenProbe('1/1W6', { grund: 'Durchbruch', gewoehnung: 'durchbruch' });
  }
  HG.ding('kellerwand', {
    nomen: 'Westwand', genus: 'f', adj: ['frisch', 'verputzt'], kurzwort: 'westwand',
    woerter: ['westwand', 'wand', 'putz', 'mauer', 'stelle', 'markierung', 'kreuz', 'kreidekreuz', 'loch', 'durchbruch', 'ziegel', 'waende'],
    ort: 'heizungskeller', fest: true, szenerie: true,
    beschreibung: function (api) {
      if (durch(api)) return 'In der Westwand klafft ein Loch, gut einen Meter breit, an den Rändern zersplitterte Ziegel. Dahinter liegt ein schmaler Gewölberaum.';
      var t = 'Die Westwand ist glatt verputzt und heller als die übrigen Wände. Der Putz ist auffallend frisch – feucht fast, als wäre er gestern aufgetragen worden. Dabei war seit Monaten niemand hier unten.';
      if (api.eig('kellerwand', 'geheilt')) { api.setze('kellerwand', 'geheilt', false); t += ' Von deinen Schlägen ist nichts mehr zu sehen. Kein Riss, kein Loch. Der Putz ist glatt wie am ersten Tag.'; }
      else if (treffer(api) === 1) t += ' Wo du zugeschlagen hast, ist der Putz in Platten abgeplatzt; darunter liegen Ziegel.';
      else if (treffer(api) >= 2) t += ' In den Ziegeln ist ein faustgroßes Loch. Kalte Luft zieht hindurch.';
      if (api.flag('wand_gefunden')) t += ' Dein Kreidekreuz markiert die Stelle.';
      return t;
    },
    tasten: function (api) { return durch(api) ? 'Scharfe Ziegelkanten.' : 'Der Putz ist kalt und ein wenig klamm. Und er gibt nach, ganz wenig, wie Haut.'; },
    riechen: 'Frischer Kalk. Und Lavendel, der durch die Wand dringt.',
    proben: {
      // Fertigkeit: Wände abklopfen (Wahrnehmung −20) – hohl klingt es nur hier
      klopfen: {
        wer: 'wahrnehmung', mod: -20, modGrund: 'dicker Putz', grund: 'Wände abklopfen', dauer: 10,
        wenn: function (api) { return !api.flag('wand_gefunden') && !durch(api); },
        erfolg: function (api) { gefunden(api, 'Du klopfst dich Wand für Wand entlang. Bruchstein, Bruchstein, Bruchstein – und dann, an der Westwand, ein anderer Klang: dumpf und hohl, wie ein Fass. Dahinter ist Luft.'); },
        misserfolg: 'Du klopfst die Wände ab, Handbreit für Handbreit. Überall klingt es gleich dumpf. Vielleicht täuschst du dich, vielleicht ist der Putz zu dick.',
        tipps: { 2: 'Carstens Notiz: „Heizungskeller bis Wand 3,60. Fehlen: 2,40 m.“ Nachmessen wäre genauer als klopfen.', 3: 'Miss den Raum nach – mit dem Laser oder dem Zollstock von der Werkbank. <span class="nebenbei">(„miss raum“)</span>' }
      }
    },
    bei: {
      klopfen: function (api) {
        if (durch(api)) { api.sage('Du klopfst an den Rand des Lochs. Aus dem Raum dahinter kommt ein Echo, das zu lange dauert.'); return true; }
        if (api.flag('wand_gefunden')) { api.sage('Du klopfst neben dein Kreidekreuz. Hohl. Und für einen Moment meinst du, von der anderen Seite klopfe es zurück.'); return true; }
        return false;   // → Probe (proben.klopfen)
      },
      zerbrechen: function (api, ctx) { return hammern(api, ctx); },
      messen: function (api, ctx) { return messung(api, ctx, ctx.obj2 || null); },
      kombinieren: function (api, ctx) {
        var a = ctx.obj === 'kellerwand' ? ctx.obj2 : ctx.obj;
        if (a !== 'bauplan' && a !== 'bauplan_kopie') return false;
        if (api.flag('wand_gefunden')) { api.sage('Laut Plan müsste hinter dieser Wand der Kohlenkeller liegen. Du hast es nachgemessen: Es fehlen 2,40 Meter.'); return true; }
        api.sage('Laut Bernwards Plan liegt hinter dem Heizungskeller der Kohlenkeller. Aber ist der Heizungskeller überhaupt so groß wie im Plan? Das müsstest du nachmessen.');
        return true;
      }
    }
  });
  // Die Wand heilt um drei Uhr, solange sie nicht durchbrochen ist (wie die Spiegel)
  var hoehepunktAlt = HG.daten.spiel.hoehepunkt;
  HG.daten.spiel.hoehepunkt = function (api) {
    hoehepunktAlt(api);
    if (durch(api) || !treffer(api)) return;
    api.setze('kellerwand', 'treffer', 0);
    api.setze('kellerwand', 'geheilt', true);
    if (imKeller(api)) HG.ausgabe.schreibe('spuk', 'Aus Richtung der Westwand kommt ein feines Knistern, wie Eis, das zufriert. Dann rieselt kein Putz mehr.');
  };

  // ===================================================================
  // RITUALRAUM – der frühere Kohlenkeller (Spielbibel 8.6.2: „Die Tür unter dem Haus schließen“)
  // ===================================================================
  HG.raum('ritualraum', {
    name: 'Gewölbe hinter der Wand',
    woerter: ['ritualraum', 'gewoelbe', 'kohlenkeller', 'raum', 'gang'],
    schauplatz: 'haus', karte: { x: -10, y: 0 },
    dunkel: true,
    dunkelText: 'Stockfinster. Die Luft steht, als hätte sie seit hundert Jahren niemand geatmet. Unter deinen Schuhen knirscht etwas, das kein Sand ist.',
    beschreibung: function (api) {
      var t = 'Ein schmaler Gewölbegang, kaum zweieinhalb Meter breit und so lang wie ein Eisenbahnwagen, schwarz von altem Kohlenstaub. Kein Fenster, keine Tür – nur das Loch, durch das du gekommen bist, im Osten. Die Decke ist so niedrig, dass du den Kopf einziehst. Über dir, irgendwo, muss die Halle sein. ';
      if (gebrochen(api)) {
        t += 'In der Mitte des Bodens ist eine runde Scheibe eingelassen, grau und matt wie Schiefer. Der Kreis um sie ist zerstört: verstreute Kohle, umgestürzte Knochen, eine leere Schale, ein ausgekratztes Wort. Die dreizehn Nägel ringsum stecken noch im Boden.';
      } else {
        t += 'Auf dem Boden, von Wand zu Wand, liegt ein Kreis aus Kohlestücken und winzigen weißen Vogelschädeln. In seiner Mitte ist eine runde Scheibe in den Boden eingelassen, schwarz und glatt wie Wasser, in der sich dein Licht spiegelt. ' +
          'An vier Stellen ist der Kreis anders: Im <b>Osten</b>, zum Durchbruch hin, liegt ' + (api.eig('kreis_kohle', 'entfernt') ? 'verstreute Kohle' : 'ein Haufen Kohle') + '. Im <b>Süden</b> ' + (api.eig('kreis_knochen', 'entfernt') ? 'liegen umgestürzte Vogelschädel' : 'sind Vogelschädel zu einer kleinen Pyramide geschichtet') + '. Im <b>Westen</b> steht ' + (api.eig('kreis_blut', 'entfernt') ? 'eine umgekippte Tonschale' : 'eine Tonschale mit etwas Schwarzem, Eingetrocknetem') + '. Im <b>Norden</b> ' + (api.eig('kreis_name', 'entfernt') ? 'ist ein Wort aus dem Boden gekratzt' : 'ist ein Wort in den Boden geritzt') + '. ' +
          'Rund um den Kreis stecken dreizehn Nägel im Boden.';
      }
      return t + ' An der Wand über dem Kreis: Kreidestriche, Reihe um Reihe.';
    },
    kurz: function (api) { return 'Das Gewölbe hinter der Wand: ' + (gebrochen(api) ? 'der zerstörte Kreis, die matte Scheibe' : 'der Kreis, die schwarze Scheibe') + ', dreizehn Nägel, der Kalender an der Wand. Osten: Heizungskeller.'; },
    horchen: { tag: 'Nichts. Kein Tropfen, kein Knacken. Eine Stille wie unter Wasser.', nacht: function (api) { return gebrochen(api) ? 'Stille. Eine leere, erschöpfte Stille.' : 'Ein Summen, sehr tief, unterhalb dessen, was man hören kann. Es kommt aus der Scheibe. Es kennt deinen Namen.'; } },
    riechen: 'Kohle, kalte Asche, Lavendel – und etwas Süßes, Verdorbenes, wie Blumenwasser, das zu lange gestanden hat.',
    ausgaenge: { osten: { ziel: 'heizungskeller', text: 'Du kletterst durch das Loch zurück in den Heizungskeller.' } },
    beimBetreten: function (api) {
      if (api.flag('ritualraum_betreten')) return;
      api.setzeFlag('ritualraum_betreten');
      if (api.hell()) api.nervenProbe('1/1W4', { grund: 'der Kreis der Pflegerin' });
    },
    vorschlaege: function (api) {
      if (!api.hell()) return ['geh nach osten'];
      if (gebrochen(api)) return ['untersuche nägel', 'geh nach osten'];
      return ['untersuche kreis', 'lies kalender', 'untersuche nägel'];
    }
  });

  // --- Der Kreis und seine vier Teile --------------------------------
  // Geöffnet hat die Pflegerin: Kohle (Osten) – Knochen (Süden) – Blut (Westen) – Name (Norden).
  // Schließen = rückwärts: Name, Blut, Knochen, Kohle (Gebetbuch, Elisabeths Tagebuch 1929, Kalender-Skizze).
  var ORDNUNG = ['kreis_name', 'kreis_blut', 'kreis_knochen', 'kreis_kohle'];
  function kreisSchritt(api) { return ORDNUNG.filter(function (id) { return api.eig(id, 'entfernt'); }).length; }
  var WEG_TEXT = {
    kreis_name: 'Du kratzt mit dem Fingernagel über die Rillen, immer wieder, bis die Haut aufreißt. Es ist, als kratze jemand von der anderen Seite zurück. Dann ist das Wort nur noch ein Kratzer im Stein, und das Summen in deinen Ohren bricht ab, mitten im Ton.',
    kreis_blut: 'Du stößt die Tonschale um. Was darin eingetrocknet war, ist nicht mehr trocken: Es läuft schwarz über den Boden, auf den Kreis zu – und versickert im Kohlenstaub, eine Handbreit vor der Linie.',
    kreis_knochen: 'Du fegst die Vogelschädel mit dem Ärmel aus dem Kreis. Sie klappern über den Stein wie lose Zähne. Einer rollt zurück, bis an deinen Schuh. Du stößt ihn weg.'
  };
  function teilWeg(api, id, ctx) {
    if (!api.hell()) { api.sage('Im Dunkeln findest du nur Kohlenstaub.'); return true; }
    if (gebrochen(api)) { api.sage('Der Kreis ist gebrochen. Da ist nichts mehr, was etwas hält.'); return true; }
    if (api.eig(id, 'entfernt')) { api.sage('Das hast du schon fortgenommen.'); return true; }
    if (ctx) ctx.dauer = 2;
    var soll = ORDNUNG[kreisSchritt(api)];
    if (id !== soll) { falscheOrdnung(api); return true; }
    api.setze(id, 'entfernt', true);
    if (id === 'kreis_kohle') { kreisBrechen(api); return true; }
    api.sage(WEG_TEXT[id]);
    api.nervenProbe('0/1W3', { grund: 'am Kreis', gewoehnung: 'kreis_' + id });
    return true;
  }
  function falscheOrdnung(api) {
    ORDNUNG.forEach(function (id) { api.setze(id, 'entfernt', false); });
    api.abschnitt(48, 'Kaum hast du den Kreis berührt, geht ein Ruck durch den Boden, als hätte unter dir etwas sehr Großes die Augen geöffnet. Die Kohle liegt wieder, wo sie lag, die Knochen stehen, die Schale ist voll, das Wort ist tief in den Stein geritzt, als hättest du nie etwas angerührt. Und die schwarze Scheibe ist nicht mehr glatt.');
    api.fehlversuch('kreis', {
      2: 'Die Pflegerin hat den Kreis in einer bestimmten Ordnung gelegt. Sie steht im Gebetbuch – und Elisabeth hat gesehen, wie sie es tat.',
      3: function (api) {
        return api.hatHinweis('kraehe_gebetbuch')
          ? '„Kohle, wo Er aufgeht (Osten). Knochen, wo Er am höchsten steht (Süden). Blut, wo Er versinkt (Westen). Sein Name, wo Er niemals ist (Norden).“ So wurde geöffnet. Fortnehmen musst du es rückwärts. <span class="nebenbei">(„entferne den namen“)</span>'
          : 'Sieh dir die Skizze am Kalender an: vier Zeichen, vier Zahlen. Und dann rückwärts – vom Letzten bis zum Ersten. <span class="nebenbei">(„lies kalender“, dann „entferne den namen“)</span>';
      }
    });
    api.kampf('die_tuer', { spiegel: 'schwarze_scheibe' });
  }
  function kreisBrechen(api) {
    api.setzeFlag('kreis_gebrochen');
    api.abschnitt(49, 'Als die letzte Kohle aus dem Kreis rollt, wird es still. Nicht die Stille eines leeren Raums – die Stille, wenn ein Atem anhält und nicht wieder einsetzt. Die schwarze Scheibe wird grau, dann matt wie Schiefer, und dein Licht spiegelt sich nicht mehr darin. Rund um den Kreis zittern die dreizehn Nägel, alle zugleich, wie Stimmgabeln. ' +
      'Und weit über dir, oben in der Halle, schlägt eine Tür zu, so hart, dass Kalk von der Decke rieselt.<br><br>Etwas in diesem Haus hat gerade sehr viel verloren. Die Tür unter dem Haus ist zu.');
    HG.macht.verbrauche(25);
    api.nervenProbe('1/1W6', { grund: 'der Kreis bricht' });
    api.hinweis('kreis_gebrochen');
    api.sage('<span class="nebenbei">(Das Finale – die Neumondnacht im Spiegelzimmer – wird noch gebaut.)</span>');
  }
  function teil(id, def) {
    HG.ding(id, Object.assign({
      ort: 'ritualraum', fest: 'Du müsstest es schon aus dem Kreis entfernen. („entferne …“)', szenerie: true,
      bei: {
        entfernen: function (api, ctx) { return teilWeg(api, id, ctx); },
        nehmen: function (api, ctx) { return teilWeg(api, id, ctx); },
        zerbrechen: function (api, ctx) { return teilWeg(api, id, ctx); },
        schieben: function (api, ctx) { return teilWeg(api, id, ctx); },
        umdrehen: function (api, ctx) { return teilWeg(api, id, ctx); }
      }
    }, def));
  }
  teil('kreis_kohle', {
    nomen: 'Kohle', genus: 'f', woerter: ['kohle', 'kohlen', 'kohlehaufen', 'kohlenhaufen', 'haufen', 'osten', 'ostseite'],
    beschreibung: function (api) { return gebrochen(api) || api.eig('kreis_kohle', 'entfernt') ? 'Verstreute Kohlestücke.' : 'Im Osten des Kreises: ein Haufen Steinkohle, die Stücke sorgfältig geschichtet, glänzend schwarz, als hätte sie jemand poliert.'; }
  });
  teil('kreis_knochen', {
    nomen: 'Vogelschädel', genus: 'pl', woerter: ['vogelschaedel', 'schaedel', 'knochen', 'pyramide', 'sueden', 'suedseite'],
    beschreibung: function (api) { return gebrochen(api) || api.eig('kreis_knochen', 'entfernt') ? 'Umgestürzte Vogelschädel, über den Boden verstreut.' : 'Im Süden des Kreises: winzige Vogelschädel, Dutzende, zu einer Pyramide geschichtet, alle mit den leeren Augen nach innen.'; }
  });
  teil('kreis_blut', {
    nomen: 'Tonschale', genus: 'f', woerter: ['tonschale', 'schale', 'blut', 'blutschale', 'westen', 'westseite'],
    beschreibung: function (api) { return gebrochen(api) || api.eig('kreis_blut', 'entfernt') ? 'Eine umgekippte Tonschale, leer.' : 'Im Westen des Kreises: eine flache Tonschale, darin eine schwarze, rissige Kruste. Blut, sehr alt. Aber der Rand ist feucht.'; },
    riechen: 'Eisen. Und Lavendel.'
  });
  teil('kreis_name', {
    nomen: 'Wort', genus: 'n', woerter: ['wort', 'name', 'namen', 'schrift', 'zeichen', 'rillen', 'norden', 'nordseite'], adjektive: ['geritzt'],
    beschreibung: function (api) { return gebrochen(api) || api.eig('kreis_name', 'entfernt') ? 'Nur noch Kratzer im Stein.' : 'Im Norden des Kreises: ein Wort, tief in den Stein geritzt, in Buchstaben, die keine sind. Wenn du es ansiehst, summt es in deinen Ohren.'; },
    lesbar: function (api) { return gebrochen(api) || api.eig('kreis_name', 'entfernt') ? 'Da steht nichts mehr.' : 'Du kannst es nicht lesen. Aber während du es versuchst, hörst du es – nicht mit den Ohren, sondern irgendwo hinter den Augen, ein Wort, lang und tief, das nicht für einen menschlichen Mund gemacht ist.'; }
  });
  HG.daten.dinge.kreis_name.bei.lesen = function (api) {
    if (gebrochen(api) || api.eig('kreis_name', 'entfernt') || !api.hell()) return false;
    api.sage(HG.wert(HG.daten.dinge.kreis_name.lesbar, api));
    api.nervenProbe('0/1W4', { grund: 'Sein Name', gewoehnung: 'sein_name' });
    return true;
  };

  HG.ding('kreis', {
    nomen: 'Kreis', genus: 'm', woerter: ['kreis', 'ritualkreis', 'bannkreis', 'linie', 'ritual'],
    ort: 'ritualraum', fest: true, szenerie: true,
    beschreibung: function (api) {
      if (gebrochen(api)) return 'Der Kreis ist zerstört. Nur noch Kohlenstaub und Knochensplitter, die nichts mehr bedeuten.';
      return 'Ein Kreis, von Wand zu Wand, aus Kohlestücken und Vogelschädeln, so sorgfältig gelegt, dass keine Lücke bleibt. Vier Stellen sind anders: im Osten die Kohle, im Süden die Knochen, im Westen die Schale mit Blut, im Norden das Wort. Wer diesen Kreis gelegt hat, hat es in einer bestimmten Ordnung getan.';
    },
    bei: {
      untersuchen: function (api, ctx) {
        if (!api.hell() || gebrochen(api)) return false;
        api.sage(HG.wert(HG.daten.dinge.kreis.beschreibung, api));
        // Fertigkeit: Okkultismus −20 erkennt die Ordnung (einmal)
        if (!api.flag('kreis_ordnung') && !api.flag('_kreis_okkultismus')) {
          api.setzeFlag('_kreis_okkultismus');
          var e = api.probe('okkultismus', { grund: 'die Ordnung des Kreises', mod: -20, modGrund: 'fremdes Ritual' });
          if (e.erfolg) {
            api.setzeFlag('kreis_ordnung');
            api.sage('Du hast so etwas in alten Büchern gesehen. Die Teile sind nach dem Lauf der Sonne gelegt: Aufgang, Mittag, Untergang – und zuletzt der Name dort, wo sie nie steht. Was so geöffnet wurde, schließt man rückwärts: <b>zuerst der Name im Norden, dann das Blut im Westen, dann die Knochen im Süden, zuletzt die Kohle im Osten.</b>');
          }
        }
        return true;
      },
      entfernen: function (api) { api.sage(gebrochen(api) ? 'Der Kreis ist gebrochen.' : 'Wo anfangen? Kohle, Knochen, Blut oder das Wort – du musst dich entscheiden, womit du beginnst.'); return true; },
      zerbrechen: function (api) { api.sage(gebrochen(api) ? 'Der Kreis ist gebrochen.' : 'Wo anfangen? Kohle, Knochen, Blut oder das Wort – du musst dich entscheiden, womit du beginnst.'); return true; }
    }
  });

  // --- Die schwarze Scheibe: „die Tür unter dem Haus“ -----------------
  HG.ding('schwarze_scheibe', {
    nomen: 'Scheibe', genus: 'f', adj: ['schwarz'], woerter: ['scheibe', 'spiegelscheibe', 'mitte', 'obsidian', 'spiegel'], adjektive: ['schwarz', 'rund', 'glatt'],
    ort: 'ritualraum', fest: 'Die Scheibe ist in den Boden eingelassen.', szenerie: true,
    spiegel: function (api) { return api.flag('kreis_gebrochen') ? null : 'gross'; },
    beschreibung: function (api) {
      if (gebrochen(api)) return 'Eine runde Steinscheibe, grau und matt wie Schiefer. Nichts spiegelt sich mehr darin. Es ist nur noch ein Stein.';
      return 'Eine runde Scheibe, gut einen Meter breit, in den Boden eingelassen, schwarz wie Wasser in einem Brunnen. Dein Licht spiegelt sich darin – und tief unten, viel tiefer, als der Boden sein kann, ein zweites Licht, das sich nicht mit deinem bewegt.' + HG.macht.beschreibungZusatz('schwarze_scheibe');
    },
    tasten: 'Glatt. Und nicht kalt, wie Stein sein müsste, sondern lauwarm, wie Haut.',
    bei: {
      hineinschauen: function (api) {
        if (gebrochen(api)) { api.sage('Grauer Stein. Nichts.'); return true; }
        api.sage('Du beugst dich über die Scheibe. Dein Gesicht, sehr blass. Und hinter deinem Gesicht – unter ihm – ein Raum, der nach unten weitergeht, Stufe um Stufe, und am Ende der Stufen steht etwas und sieht herauf.');
        api.nervenProbe('1/1W6', { grund: 'Blick durch die Tür', gewoehnung: 'scheibe' });
        return true;
      },
      // Gewalt: Zerschlagen schließt die Tür nicht – die Scheibe heilt um drei Uhr, und das Haus wird stärker
      zerbrechen: function (api, ctx) {
        if (gebrochen(api)) { api.sage('Es ist nur noch ein Stein. Es gibt keinen Grund mehr.'); return true; }
        if (api.eig('schwarze_scheibe', 'zerbrochen')) { api.sage('Die Scheibe ist schon zersprungen. In jeder Scherbe bewegt sich etwas.'); return true; }
        if (!api.traegt('vorschlaghammer') && ctx.obj2 !== 'vorschlaghammer' && !api.traegt('brecheisen')) { api.sage('Mit der bloßen Hand? Du bräuchtest etwas Schweres.'); return true; }
        scheibeZerschlagen(api);
        return true;
      }
    }
  });
  function scheibeZerschlagen(api) {
    HG.macht.zerbrich('schwarze_scheibe');
    api.sound('spiegel-zerbricht');
    api.sage('Du schlägst zu. Die Scheibe zerspringt in ein Netz aus Sprüngen – und unter dir, sehr tief, lacht etwas. Kein Laut, eher ein Beben, das dir durch die Fußsohlen in die Zähne steigt. Du spürst, wie das Haus atmet: tiefer, satter, als hättest du ihm etwas zu essen gegeben.');
    machtZurueck(api);
  }
  function machtZurueck(api) {
    HG.macht.setze(HG.macht.wert() + 20);
    api.nervenProbe('1/1W4', { grund: 'das Haus lacht' });
    api.fehlversuch('scheibe_zerschlagen', { 1: 'So nicht. Spiegel heilen in diesem Haus – um drei Uhr ist auch diese Scheibe wieder ganz. Die Tür schließt man nicht mit Gewalt, sondern indem man den Kreis bricht, in der richtigen Ordnung.' });
  }

  // Manifestation: „Die Tür“ – bei falscher Ordnung greift etwas aus der Scheibe
  HG.manifestation('die_tuer', {
    name: 'Die Tür', halt: 10, ausSpiegel: true, koerper: true,
    start: 'Die schwarze Scheibe wölbt sich, wie Wasser über einer Quelle. Dann öffnet sie sich, einen Spalt, und aus dem Spalt schiebt sich etwas, das zu viele Gelenke hat – ein Arm, oder etwas, das einen Arm nachahmt, und tastet über den Kohlenstaub nach deinem Fuß.',
    nerven: '1W3/1W10',
    angriffe: [
      { text: 'Es findet deinen Knöchel und schließt sich darum, kalt und nass.', griff: true },
      { text: 'Es zieht. Dein Fuß rutscht über den Rand des Kreises, auf die Scheibe zu.', lp: '1W4' },
      { text: 'Aus dem Spalt kommt ein Summen, und darin, ganz deutlich, dein Name – ausgesprochen von einer Stimme, die ihn lernen musste.', nerven: '0/1W6' }
    ],
    griffFolge: { runden: 3, text: 'Dein Bein ist bis zum Knie in der Scheibe. Darunter ist kein Boden. Dann, mit einem Ruck, spuckt sie dich aus, und du liegst keuchend im Kohlenstaub.', nerven: '1W4/1W8', lp: '1W6', endet: true },
    texte: {
      abgeschnitten: 'Die Scheibe ist blind. Was eben noch nach dir griff, ist abgeschnitten – du hörst es unter dem Stein, ein Kratzen, das sich entfernt.',
      aufgeloest: 'Es zuckt zurück in den Spalt, und die Scheibe schließt sich über ihm wie Wasser. Glatt. Schwarz. Wartend.',
      geflohen: 'Du kriechst rückwärts durch das Loch in der Wand. Hinter dir ein Geräusch wie Wasser, das sich über etwas schließt.'
    },
    fliehenNach: 'heizungskeller',
    nachher: function (api, art) {
      if (art === 'abgeschnitten' && api.eig('schwarze_scheibe', 'zerbrochen')) machtZurueck(api);
    }
  });

  // --- Dreizehn Nägel: die gebundenen Toten (sichtbarer Fortschritt beim Bekehren) ---
  var NAEGEL = [
    ['elisabeth', 'ein langes, helles Frauenhaar, wieder und wieder um den Nagel gewickelt'],
    ['heinrich', 'ein Faden aus weißem Leinen mit einem gestickten „H“'],
    ['margarete', 'ein Streifen schwarzer Trauerflor'],
    ['albers', 'ein weißer Baumwollfaden, steif wie gestärkt'],
    ['wilhelmine', 'ein Fetzen geblümter Kittelstoff'],
    ['josef', 'ein Faden, schwarz von Kohlenstaub'],
    ['irmgard', 'ein hellblauer Nähfaden'],
    ['hallmann', 'ein Faden aus grauem Loden'],
    ['brinkhoff', 'ein Stück Bindfaden mit Tuscheflecken'],
    ['renate', 'ein graues Haar'],
    ['bettina', 'ein dunkles Haar, in dem ein Glitzerfaden steckt'],
    ['natascha', 'ein blondes Haar, weiß von Schleifstaub'],
    ['carsten', 'ein kurzes braunes Haar']
  ];
  var ZAHLWORT = ['null', 'ein', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf', 'dreizehn'];
  function lose() { return NAEGEL.filter(function (n) { return HG.gefahren.istBekehrt(n[0]); }); }
  HG.ding('naegel', {
    nomen: 'Nägel', genus: 'pl', woerter: ['naegel', 'nagel', 'haare', 'haar', 'faeden', 'faden'],
    ort: 'ritualraum', fest: 'Die Nägel stecken tief im Stein.', szenerie: true,
    beschreibung: function (api) {
      var l = lose(), fest = NAEGEL.filter(function (n) { return l.indexOf(n) < 0; });
      var t = 'Dreizehn Schmiedenägel, rund um den Kreis in den Boden geschlagen, in gleichen Abständen wie die Ziffern einer Uhr, die eine Stunde zu viel hat. Dreizehn Tote. Dreizehn Gebundene. ';
      t += (l.length ? 'An den übrigen hängt' : 'An jedem hängt') + ' etwas: ' + HG.text.liste(fest.map(function (n) { return n[1]; }), 'und') + '.';
      if (!l.length) return t + ' Alle Nägel sitzen fest, als wären sie in den Stein gewachsen.';
      return (l.length === 1 ? 'Ein Nagel sitzt locker, und an ihm hängt nichts mehr – du weißt, wessen er war: ' : HG.text.gross(ZAHLWORT[l.length] || String(l.length)) + ' Nägel sitzen locker, und an ihnen hängt nichts mehr – du weißt, wessen sie waren: ') +
        HG.text.liste(l.map(function (n) { return HG.daten.seelen[n[0]].name; }), 'und') + '. Wer frei ist, den hält hier nichts mehr.<br><br>' + t;
    },
    tasten: 'Kaltes Eisen. Einige Nägel sind warm, als hätte sie eben jemand angefasst.',
    hinweis: 'dreizehn_naegel',
    bei: {
      ziehen: function (api) { api.sage(lose().length ? 'Die lockeren Nägel lassen sich bewegen – aber herausziehen willst du sie nicht. Sie gehören jetzt niemandem mehr.' : 'Du ziehst an einem Nagel. Er sitzt fest wie eingewachsen. Und irgendwo im Haus, weit oben, schreit jemand leise auf.'); return true; },
      nehmen: function (api) { return HG.daten.dinge.naegel.bei.ziehen(api); }
    }
  });

  // --- Kalender der Krähe: Zwölferblöcke bis 1929, Skizze des Kreises, Countdown bis Neumond ---
  function striche(k) {
    var s = '', i;
    for (i = 1; i <= Math.min(k, 40); i++) s += 'I' + (i % 5 === 0 ? ' ' : '');
    return s.trim() + (k > 40 ? ' …' : '');
  }
  function countdown(api) {
    var k = HG.nacht.bisNeumond();
    if (k === 0) return 'Darunter, in frischer weißer Kreide, als hätte sie eben erst jemand gezogen: ein ausgemalter schwarzer Kreis. Daneben ein einziges Wort: <b>heute</b>.';
    return 'Darunter, in frischer weißer Kreide, als hätte sie eben erst jemand gezogen: <b>' + striche(k) + '</b> – ' + (k === 1 ? 'ein Strich' : k + ' Striche') + ', und dahinter ein ausgemalter schwarzer Kreis. Eine Zählung. Jemand zählt die Nächte bis zum nächsten Neumond.';
  }
  HG.ding('kalender_kraehe', {
    dokument: true,
    nomen: 'Kreidestriche', genus: 'pl', kurzwort: 'kalender',
    woerter: ['kalender', 'kreidestriche', 'striche', 'kreide', 'zaehlung', 'skizze', 'wand', 'bloecke'],
    ort: 'ritualraum', fest: true, szenerie: true,
    beschreibung: 'Auf der Wand über dem Kreis sind mit Kreide Striche gezogen, Reihe um Reihe, immer zwölf zu einem Block. Daneben eine Skizze. Und darunter etwas Neueres.',
    lesbar: function (api) {
      return 'Zwölf Striche, ein Block. Zehn volle Blöcke, ein angefangener – wie im Deckel der Zigarrenkiste. Über dem letzten Block: <b>1929</b>. Jeden Neumond ein Strich. Jeden Neumond ein Leben.<br><br>' +
        'Daneben eine Skizze: ein Kreis, an vier Stellen ein Zeichen und eine Zahl. Eine Sonne, die aus einem Strich steigt: <b>1</b>. Eine Sonne hoch über dem Strich: <b>2</b>. Eine Sonne, die im Strich versinkt: <b>3</b>. Ein ausgemalter schwarzer Punkt: <b>4</b>.<br><br>' + countdown(api);
    },
    foto: 'Auf deinem Foto sind die alten Striche grau und verwischt. Die frischen fehlen. Die Wand darunter ist leer.',
    hinweis: 'kalender_kraehe', hinweisBei: 'lesen'
  });

  // ===================================================================
  // HINWEISE und SCHLÜSSE (Spielbibel 8.7: Tür unter dem Haus, Neumond, Den Kreis brechen)
  // ===================================================================
  HG.hinweis('fehlende_wand', {
    titel: 'Die Wand im Heizungskeller', strang: 'A',
    text: 'Der Heizungskeller misst von der Ostwand bis zur Westwand 10,60 m. Laut Bernwards Plan müssten es 13,00 sein: Heizungskeller und dahinter der Kohlenkeller. Es fehlen 2,40 m. Die Westwand ist frisch verputzt. Ich habe ein Kreidekreuz darauf gemacht.',
    stichworte: ['wand', 'westwand', 'heizungskeller', 'kohlenkeller', 'messung']
  });
  HG.hinweis('dreizehn_naegel', {
    titel: 'Dreizehn Nägel', strang: 'D',
    text: 'Hinter der Wand im Keller, rund um den Kreis der Pflegerin: dreizehn Nägel, an jedem ein Haar oder ein Faden. Dreizehn Tote, hier unten gebunden. Wer bekehrt ist, dessen Nagel sitzt locker.',
    stichworte: ['naegel', 'nagel', 'dreizehn', 'tote', 'kreis']
  });
  HG.hinweis('kalender_kraehe', {
    titel: 'Der Kalender der Krähe', strang: 'C',
    text: 'An der Wand des Gewölbes: Kreidestriche in Zwölferblöcken bis 1929 – jeden Neumond ein Leben. Daneben die Skizze des Kreises: 1 aufgehende Sonne, 2 Sonne im Mittag, 3 sinkende Sonne, 4 schwarzer Punkt. Darunter zählt jemand in frischer Kreide die Nächte bis zum nächsten Neumond.',
    stichworte: ['kalender', 'kreide', 'striche', 'neumond', 'skizze', 'kreis']
  });
  HG.hinweis('kreis_gebrochen', {
    titel: 'Die Tür unter dem Haus ist zu', strang: 'C',
    text: 'Ich habe den Kreis der Pflegerin gebrochen – rückwärts, vom Namen bis zur Kohle. Die schwarze Scheibe ist nur noch Stein. Oben in der Halle schlug eine Tür zu. Das Haus hat viel verloren. Jetzt fehlt noch: die richtige Nacht.',
    stichworte: ['kreis', 'tuer', 'scheibe', 'ritual', 'gebrochen']
  });
  // Die Paare dürfen sich mit anderen Schlüssen nicht überschneiden (Gebetbuch + Tagebuch = „Zwei Elisabeths“)
  HG.schluss('kreis_rueckwaerts', {
    aus: ['kalender_kraehe', 'kraehe_gebetbuch'],
    titel: 'Den Kreis rückwärts brechen',
    text: 'Die Skizze am Kalender und das Gebetbuch sagen dasselbe: Die Pflegerin hat den Kreis nach dem Lauf der Sonne gelegt – 1 Kohle im Osten (wo sie aufgeht), 2 Knochen im Süden (Mittag), 3 Blut im Westen (wo sie versinkt), 4 Sein Name im Norden (wo sie nie steht). Was so geöffnet wurde, schließt man rückwärts: zuerst den Namen, dann das Blut, dann die Knochen, zuletzt die Kohle.'
  });
  HG.schluss('nacht_der_tuer', {
    aus: ['kalender_kraehe', 'vogelschaedel', 'elisabeths_tagebuch'], mindestens: 2,
    titel: 'Die Nacht der Tür',
    text: 'Neumond ist die Nacht der Pflegerin: jeden Neumond ein Opfer, in einer Neumondnacht trug sie Elisabeth in den Keller – und der Kalender in ihrem Gewölbe zählt noch immer die Nächte bis zum nächsten. Wenn sich in diesem Haus etwas entscheidet, dann in einer Neumondnacht.'
  });

  // ===================================================================
  // Spuk im Keller (Tag und Nacht je Raum)
  // ===================================================================
  HG.spuk('kellerflur_tuer', { art: 'geraeusch', orte: ['kellerflur'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Oben fällt die Kellertür ins Schloss, langsam, mit einem langen Knarren. Als du hinaufleuchtest, steht sie offen, so wie du sie gelassen hast.', nerven: '0/1W3', grund: 'Kellertür' });
  HG.spuk('kellerflur_schritte', { art: 'geraeusch', orte: ['kellerflur'], zeiten: NACHT, chance: 0.2, max: 2, bild: true,
    text: 'Auf der Treppe über dir: Schritte. Barfuß. Sie kommen herunter, Stufe für Stufe, elf Stufen, und hören auf der vorletzten auf. Direkt hinter dir. Als du dich umdrehst, liegt dort nur der schwarze Knopf.', nerven: '1/1W6', grund: 'Schritte auf der Treppe' });
  HG.spuk('vorrat_glas', { art: 'geraeusch', orte: ['vorratskeller'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Ein Einmachglas klirrt leise gegen seinen Nachbarn. Das Glas ohne Etikett. Was darin schwimmt, hat sich gedreht – zu dir.', nerven: '0/1W3', grund: 'Einmachglas' });
  HG.spuk('vorrat_etiketten', { art: 'illusion', orte: ['vorratskeller'], zeiten: NACHT, chance: 0.2, max: 2, hell: true, bild: true,
    text: 'Dein Licht streift die Regale, und auf allen Etiketten steht plötzlich dasselbe: das heutige Datum. In deiner eigenen Handschrift. Du blinzelst – und es sind wieder Stachelbeeren, Juli 1936.', nerven: '1/1W6', grund: 'Etiketten' });
  HG.spuk('wein_flasche', { art: 'bewegung', orte: ['weinkeller'], zeiten: TAG, chance: 0.1, max: 1, hell: true,
    text: 'Eine Flasche rollt aus dem Regal, ganz langsam, und bleibt vor deinen Füßen liegen. Um ihren Hals ein Pappschild: „Für den Tag, an dem sie geht.“', nerven: '0/1W3', grund: 'Flasche' });
  HG.spuk('wein_arzt', { art: 'geraeusch', orte: ['weinkeller'], zeiten: NACHT, chance: 0.2, max: 2, bild: true,
    text: 'Unter dem Gewölbe räuspert sich jemand. Ein Mann, höflich, wie ein Arzt vor einer schlechten Nachricht. „Sie sollten hier nicht atmen“, sagt er freundlich. „Wirklich nicht.“ Dann ist es still.', nerven: '1/1W6', grund: 'Stimme im Gewölbe' });
  HG.spuk('waschkueche_mangel', { art: 'bewegung', orte: ['waschkueche'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Die Mangel dreht sich, eine halbe Umdrehung, quietschend. Niemand steht an der Kurbel. Zwischen den Walzen schiebt sich ein Zipfel hellblauer Stoff hervor.', nerven: '0/1W3', grund: 'Mangel' });
  HG.spuk('waschkueche_hand', { art: 'illusion', orte: ['waschkueche'], zeiten: NACHT, chance: 0.2, max: 2, hell: true, spiegel: 'klein', bild: true,
    text: 'Im trüben Spiegel über dem Ausguss wischt eine Hand von innen über das Glas, als wolle sie besser sehen. Eine Männerhand, die Knöchel aufgeschlagen, schwarz von Kohlenstaub. Dann ballt sie sich zur Faust.', nerven: '1/1W6', grund: 'Hand im Spiegel' });
  HG.spuk('heizung_brenner', { art: 'geraeusch', orte: ['heizungskeller'], zeiten: TAG, chance: 0.1, max: 1,
    text: 'Die Ölheizung springt an. Ein Fauchen, ein Rumpeln, die Rohre zittern – und aus. Als du die Hand an den Kessel legst, ist er eiskalt. Er ist seit Jahrzehnten kalt.', nerven: '0/1W3', grund: 'Heizung' });
  HG.spuk('heizung_kratzen', { art: 'geraeusch', orte: ['heizungskeller'], zeiten: NACHT, chance: 0.2, max: 2, bild: true,
    text: function (api) {
      return durch(api) ? 'Aus dem Loch in der Westwand kommt ein Summen, tief und gleichmäßig. Und dazwischen, sehr leise, Kohle, die über Stein rollt.'
        : 'Hinter der Westwand kratzt etwas. Langsam, gleichmäßig, wie jemand, der mit einem Spachtel Putz abträgt – von der anderen Seite. Es hört auf, sobald du den Atem anhältst.';
    }, nerven: '1/1W6', grund: 'Kratzen in der Wand' });
  HG.spuk('ritual_schaedel', { art: 'bewegung', orte: ['ritualraum'], zeiten: TAG, chance: 0.1, max: 1, hell: true,
    text: function (api) { return gebrochen(api) ? 'Ein Vogelschädel rollt über den Boden und bleibt liegen. Nichts weiter. Nur ein Knochen.' : 'Einer der Vogelschädel im Kreis dreht sich, ganz langsam, auf seiner Stelle – bis seine leeren Augen auf dich gerichtet sind.'; },
    nerven: '0/1W3', grund: 'Vogelschädel' });
  HG.spuk('ritual_himmel', { art: 'illusion', orte: ['ritualraum'], zeiten: NACHT, chance: 0.25, max: 2, hell: true, bild: true,
    bedingung: function (api) { return !gebrochen(api); },
    text: 'In der schwarzen Scheibe ist ein Himmel. Ein Nachthimmel ohne Mond und ohne Sterne, so tief, dass dir schwindlig wird – und etwas darin kommt näher, sehr langsam, wie jemand, der eine lange Treppe heraufsteigt.', nerven: '1/1W8', grund: 'der Himmel in der Scheibe' });
  HG.spuk('ritual_stille', { art: 'geraeusch', orte: ['ritualraum'], zeiten: NACHT, chance: 0.15, max: 1,
    bedingung: function (api) { return gebrochen(api); },
    text: 'Oben im Haus, weit weg, weint jemand. Nicht vor Angst. Vor Wut.', nerven: '0/1W3', grund: 'Weinen' });

  // ===================================================================
  // Anschlüsse: „Sie greift“ nicht aus der Scheibe am Boden (dort: „Die Tür“), Puppenhaus zeigt den Streifen
  // ===================================================================
  var eGross = HG.daten.gefahren.elisabeth_gross, eGrossBed = eGross.bedingung;
  eGross.bedingung = function (api) { return api.raum() !== 'ritualraum' && eGrossBed(api); };
  var ph = HG.daten.dinge.puppenhaus;
  var phAlt = ph.beschreibung;
  ph.beschreibung = function (api) {
    return HG.wert(phAlt, api).replace('ein Stückchen grauer Gips, wo eine Tür sein müsste. ',
      'ein Stückchen grauer Gips, wo eine Tür sein müsste. Daneben ist der Heizungskeller breiter, als Bernward ihn gebaut hat, und zwischen ihm und dem Vorratskeller bleibt ein schmaler Streifen, ganz aus Gips, ohne Tür und ohne Fenster' +
      (api.flag('kreis_gebrochen') ? ' – mit einem winzigen Loch in der Seite' : '') + '. ');
  };
})();
