// Haus Grest – Inhalt: Erdgeschoss von Haus Grest
// [Probe] Vor dem Haus, Eingangshalle, Arbeitszimmer, Flur mit Spiegel.
// Rätselkette: Hausschlüssel (Prolog) -> Haustür -> Kerze + Streichhölzer (Kommode)
// -> eiserner Schlüssel (unter dem Teppich) -> Eichentür zum Arbeitszimmer
// -> Messingschlüssel (hinter dem Porträt) -> Schreibtischschublade -> Brief von Bernward.
// Der Flur ist immer dunkel, die Halle nachts (der Strom ist abgestellt):
// Licht gibt es per Kerze oder Handy-Taschenlampe.
// Nachts hält das Haus die Haustür von innen zu (bis zum Morgen).

HG.ziel('haus', {
  name: 'Haus Grest',
  woerter: ['haus', 'grest', 'hausgrest', 'villa', 'erbe'],
  ankunft: 'einfahrt', fahrzeit: 25,
  fahrt: { tag: 'Du fährst hinaus an den Stadtrand, wo die Straßen breiter und die Gärten verwilderter werden.', abend: 'Du fährst in die Dämmerung hinein. Je näher du dem Haus kommst, desto weniger Laternen brennen.', nacht: 'Du fährst durch die Nacht. Die letzte Laterne liegt weit hinter dir, als die Scheinwerfer das Gartentor von Haus Grest aus der Dunkelheit schneiden.' }
});

// =====================================================================
// VOR DEM HAUS
// =====================================================================
HG.raum('einfahrt', {
  name: 'Vor Haus Grest',
  woerter: ['einfahrt', 'garten', 'vorgarten', 'gartentor', 'draussen'],
  schauplatz: 'haus', abfahrt: true, bild: 'einfahrt',
  karte: { x: 0, y: 1 },
  beschreibung: {
    morgen: 'Morgennebel hängt im verwilderten Garten. Vor dir steht Haus Grest: drei Stockwerke aus dunklem Stein, spitze Giebel, Fenster wie geschlossene Augen. Ein Kiesweg führt nach Norden zur Haustür. Dein Auto steht am Gartentor.',
    mittag: 'Selbst im Mittagslicht wirkt Haus Grest, als stünde es im Schatten. Drei Stockwerke aus dunklem Stein, spitze Giebel. Ein Kiesweg führt nach Norden zur Haustür. Dein Auto steht am Gartentor.',
    abend: 'Haus Grest ragt schwarz gegen den Abendhimmel. In einem Fenster im ersten Stock glaubst du für einen Herzschlag eine Frau zu sehen. Ein Kiesweg führt nach Norden zur Haustür. Dein Auto steht am Gartentor.',
    nacht: 'Das Haus ist nur ein schwärzerer Umriss vor dem Nachthimmel. Kein Fenster ist erleuchtet – und doch hast du das Gefühl, dass dich etwas ansieht. Der Kiesweg führt nach Norden zur Haustür. Dein Auto steht am Gartentor.'
  },
  kurz: 'Vor Haus Grest. Nach Norden geht es zur Haustür, dein Auto steht am Gartentor.',
  horchen: { tag: 'Krähen in den alten Bäumen. Sonst nichts.', nacht: 'Kein Wind, kein Tier. Die Stille um das Haus ist vollkommen.' },
  riechen: 'Feuchte Erde, nasses Laub.',
  foto: { tag: 'Haus Grest im Tageslicht. Im Fenster des ersten Stocks: ein heller Fleck. Eine Spiegelung, sicher.', nacht: 'Fast nur Schwärze. Doch im Fenster des ersten Stocks: ein blasses Oval, wie ein Gesicht.' },
  ausgaenge: {
    norden: { ziel: 'halle', tuer: 'haustuer' }
  },
  beimBetreten: function (api, info) {
    if (info.erstesMal) {
      api.sage('Das Gartentor quietscht. Das also ist dein Erbe.');
      api.nachricht('brandt_strom');
    }
  },
  vorschlaege: function (api) { return api.eig('haustuer', 'verschlossen') ? ['schließe haustür auf'] : ['geh nach norden']; },
  details: [
    { nomen: 'Haus', genus: 'n', woerter: ['haus', 'fassade', 'giebel', 'fenster', 'grest'], text: { tag: 'Dunkler Stein, spitze Giebel, hohe Fenster. Über der Tür ist eine Jahreszahl in den Stein gemeißelt: 1900.', nacht: 'Ein schwarzer Umriss. Die Fenster spiegeln nichts, nicht einmal den Himmel.' } },
    { nomen: 'Auto', genus: 'n', woerter: ['auto', 'wagen'], text: 'Dein Auto. Von hier kannst du losfahren: „fahre los“.' }
  ]
});

// =====================================================================
// EINGANGSHALLE
// =====================================================================
HG.raum('halle', {
  name: 'Eingangshalle',
  woerter: ['halle', 'eingangshalle', 'diele', 'vorhalle', 'eingang'],
  schauplatz: 'haus',
  karte: { x: 0, y: 0 },
  dunkel: function (api) { return api.istNacht(); },   // kein Strom: nachts stockfinster
  dunkelText: 'Stockfinster. Nur das Oberlicht über der Haustür zeichnet ein graues Halbrund in die Schwärze.',
  beschreibung: function (api) {
    var licht = {
      morgen: 'Durch das bunte Oberlicht über der Haustür fällt graues Morgenlicht',
      mittag: 'Durch das bunte Oberlicht über der Haustür fällt Mittagslicht und legt farbige Flecken',
      abend: 'Durch das bunte Oberlicht über der Haustür fällt das letzte Tageslicht und legt rote Flecken',
      nacht: 'Dein Licht lässt die Schatten der Geländerstäbe über die Wände wandern. Das Oberlicht über der Haustür ist ein schwarzes Halbrund. Dein Lichtkegel fällt'
    }[api.tageszeit()];
    return 'Eine hohe Halle, getäfelt mit dunklem Holz. Eine breite Treppe schwingt sich ins Obergeschoss hinauf, ihr Geländer ist grau vor Staub. ' +
      licht + ' auf einen abgetretenen Teppich. ' +
      'An der Wand steht eine alte Kommode. Im Westen ' + (api.eig('eichentuer', 'offen') ? 'steht eine schwere Eichentür offen' : 'führt eine schwere Eichentür weiter') +
      ', im Osten eine hohe Flügeltür ins Speisezimmer. Links neben der Haustür führt ein dunkler Durchgang nach Südosten in den Salon, nach Norden öffnet sich ein dunkler Flur. Im Süden liegt die Haustür.';
  },
  kurz: function (api) {
    return 'Die Halle mit der staubigen Treppe, der Kommode und dem abgetretenen Teppich. Die Eichentür im Westen ist ' +
      (api.eig('eichentuer', 'offen') ? 'offen' : 'geschlossen') + '. Osten: Speisezimmer, Südosten: Salon, Norden: Flur, Süden: Haustür.';
  },
  beimBetreten: function (api, info) {
    if (info.erstesMal) api.nachricht('willkommen');
  },
  horchen: { tag: 'Irgendwo über dir knackt eine Diele. Dann ist es wieder still – zu still für ein Haus dieser Größe.', nacht: 'Das Haus atmet. Holz arbeitet, Rohre knacken. Und über dir, ganz leise, etwas, das wie Summen klingt.' },
  riechen: 'Staub, kaltes Kerzenwachs und etwas Süßliches, das du nicht einordnen kannst.',
  versteck: 'Der Raum unter der Treppe wäre ein Versteck – aber im Moment gibt es nichts, wovor du dich verstecken müsstest. Noch nicht.',
  ausgaenge: {
    norden: 'flur',
    osten: 'speisezimmer',
    suedosten: 'salon',
    westen: { ziel: 'arbeitszimmer', tuer: 'eichentuer' },
    sueden: {
      ziel: 'einfahrt', tuer: 'haustuer',
      // Nachts lässt das Haus dich nicht hinaus.
      sperre: function (api) {
        if (!api.istNacht()) return null;
        api.zaehle('haustuer_nachts');
        return 'Du drückst die Klinke der Haustür hinunter. Das Schloss ist offen, du hast es selbst gehört – und doch gibt die Tür nicht nach, als lehne sich von draußen jemand dagegen. <span class="nebenbei">(Vielleicht, wenn es hell wird …)</span>';
      }
    },
    hoch: { sperre: 'Du setzt den Fuß auf die erste Stufe. Sie ächzt so laut, dass du zurückweichst. <span class="nebenbei">(Das Obergeschoss ist in dieser Probe-Fassung noch nicht gebaut.)</span>' }
  },
  vorschlaege: ['untersuche kommode', 'untersuche teppich'],
  details: [
    { nomen: 'Treppe', genus: 'f', woerter: ['treppe', 'stufen', 'stufe', 'treppenhaus'], text: 'Eine breite Treppe aus dunklem Holz. Auf den Stufen liegt Staub – bis auf eine schmale Spur in der Mitte, als ginge hier regelmäßig jemand hinauf und hinab.', klettern: 'Die Stufen ächzen schon unter dem ersten Schritt. Du bleibst lieber unten. <span class="nebenbei">(Das Obergeschoss ist noch nicht gebaut.)</span>' },
    { nomen: 'Geländer', genus: 'n', woerter: ['gelaender', 'handlauf'], text: 'Gedrechselte Stäbe, ein glatt gegriffener Handlauf. Du hinterlässt deutliche Fingerspuren im Staub.' },
    { nomen: 'Oberlicht', genus: 'n', woerter: ['oberlicht', 'buntglas', 'glasfenster'], text: 'Ein halbrundes Fenster aus farbigem Glas über der Haustür: Ranken und Lilien in Rot, Grün und Gold.' },
    { nomen: 'Täfelung', genus: 'f', woerter: ['taefelung', 'holz', 'wand', 'waende', 'vertaefelung'], text: 'Dunkles, gewachstes Holz bis in Schulterhöhe. Darüber eine Tapete, deren Muster im Dämmerlicht zu wandern scheint, wenn du nicht direkt hinsiehst.', klopfen: 'Du klopfst gegen die Täfelung. Es klingt überall gleich massiv.' }
  ]
});

HG.ding('haustuer', {
  nomen: 'Haustür', genus: 'f',
  woerter: ['haustuer', 'tuer', 'eingangstuer', 'vordertuer', 'klinke'],
  tuer: true, orte: ['einfahrt', 'halle'],
  oeffenbar: true, offen: false, verschlossen: true, schluessel: 'hausschluessel',
  beschreibung: function (api) {
    return api.raum() === 'einfahrt'
      ? 'Eine schwere Haustür aus dunklem Holz mit einem Messingklopfer in Form eines Löwenkopfs. Über der Tür ein halbrundes Oberlicht aus buntem Glas.'
      : 'Die schwere Haustür. Durch das Oberlicht darüber ' + (api.istNacht() ? 'dringt kein Licht.' : 'fällt farbiges Licht.');
  },
  texte: {
    aufschliessen: 'Der alte Hausschlüssel dreht sich mit einem satten Klacken. Die Tür ist offen.',
    oeffnen: 'Die Haustür schwingt nach innen auf. Kalte, staubige Luft schlägt dir entgegen.',
    verschlossen: 'Die Haustür ist abgeschlossen.'
  },
  bei: {
    oeffnen: function (api) {
      if (api.raum() === 'halle' && api.istNacht()) {
        api.sage('Die Klinke gibt nach, das Schloss ist offen – aber die Tür bewegt sich keinen Millimeter. Als hielte sie jemand von außen zu.');
        return true;
      }
      return false;
    }
  },
  klopfen: { tag: 'Du lässt den Messingklopfer fallen. Das Geräusch hallt im Inneren wider, viel länger als es sollte.', nacht: 'Du klopfst. Von innen, ganz nah an der Tür, klopft es zweimal zurück.' },
  horchen: 'Du presst das Ohr an das Holz. Nichts. Als hielte das Haus den Atem an.',
  zerbrechen: 'Du wirfst dich gegen die Tür. Das Holz ist massiv; du holst dir nur eine schmerzende Schulter.'
});

HG.ding('eichentuer', {
  nomen: 'Eichentür', genus: 'f',
  adjektive: ['schwer'],
  woerter: ['eichentuer', 'tuer', 'arbeitszimmertuer', 'schloss'],
  tuer: true, orte: ['halle', 'arbeitszimmer'],
  oeffenbar: true, offen: false, verschlossen: true, schluessel: 'eisenschluessel',
  beschreibung: function (api) {
    return api.raum() === 'halle'
      ? 'Eine schwere Tür aus dunkler Eiche mit einem großen, altmodischen Schlüsselloch.'
      : 'Die Eichentür, die zurück in die Halle führt.';
  },
  texte: {
    aufschliessen: 'Der eiserne Schlüssel dreht sich schwer im Schloss. Dann ein Klacken, das durch die ganze Halle hallt.',
    oeffnen: 'Die Eichentür schwingt mit einem langen Knarren auf.'
  },
  klopfen: 'Du klopfst an die Eichentür. Das Geräusch klingt dumpf – und einen Augenblick später, ganz leise, noch einmal. Ein Echo, sagst du dir.',
  horchen: 'Dahinter ist es still.'
});

HG.ding('kommode', {
  nomen: 'Kommode', genus: 'f', adj: ['alt'],
  woerter: ['kommode', 'anrichte'], adjektive: ['dunkel'],
  ort: 'halle', fest: 'Die Kommode ist viel zu schwer.', szenerie: true, ablage: true,
  beschreibung: 'Eine Kommode aus dunklem Nussholz mit Messingbeschlägen. Sie hat eine einzige breite Schublade.',
  riechen: 'Bienenwachs und Mottenkugeln.'
});

HG.ding('kommodenschublade', {
  nomen: 'Schublade', genus: 'f',
  woerter: ['schublade', 'lade', 'kommodenschublade'], adjektive: ['breit'],
  ort: 'halle', fest: true, szenerie: true,
  behaelter: true, oeffenbar: true, offen: false,
  beschreibung: 'Eine breite Schublade mit einem Griff aus Messing.',
  texte: { oeffnen: 'Die Schublade klemmt, dann gleitet sie mit einem Ruck heraus.' }
});

HG.ding('streichhoelzer', {
  nomen: 'Streichholzschachtel', genus: 'f', kurzwort: 'streichhölzer',
  woerter: ['streichholzschachtel', 'schachtel', 'streichhoelzer', 'streichholz', 'zuendhoelzer', 'hoelzer', 'zuendholz'],
  ort: 'kommodenschublade', rel: 'in',
  feuer: true,
  beschreibung: 'Eine flache Schachtel Streichhölzer. Sie klappert, wenn du sie schüttelst – es sind noch einige darin.',
  texte: { anzuenden: 'Du reißt ein Streichholz an. Die kleine Flamme zittert, obwohl kein Luftzug geht – dann erlischt sie.' },
  riechen: 'Schwefel.'
});

HG.ding('kerze', {
  nomen: 'Kerze', genus: 'f',
  woerter: ['kerze', 'kerzenleuchter', 'leuchter', 'kerzenhalter', 'licht', 'docht'],
  ort: 'kommode', rel: 'auf', haltung: 'steht',
  lichtquelle: true, anzuendbar: true, brennt: false,
  beschreibung: function (api) {
    return api.eig('kerze', 'brennt')
      ? 'Eine halb heruntergebrannte Kerze in einem Messingleuchter. Die Flamme brennt ruhig und ein wenig zu hoch.'
      : 'Eine halb heruntergebrannte Kerze in einem Messingleuchter. Der Docht ist schwarz – sie hat schon einmal gebrannt.';
  },
  texte: {
    anzuenden: 'Das Streichholz flammt auf, der Docht fängt Feuer. Das Licht der Kerze schiebt die Schatten an die Wände zurück – nicht weit, aber weit genug.',
    loeschen: 'Du bläst die Kerze aus. Ein dünner Rauchfaden steigt auf.'
  },
  riechen: 'Bienenwachs.'
});

HG.ding('teppich', {
  nomen: 'Teppich', genus: 'm', adj: ['abgetreten'],
  woerter: ['teppich', 'laeufer', 'perserteppich', 'ecke'], adjektive: ['alt'],
  ort: 'halle', szenerie: true, anhebbar: true,
  fest: 'Der Teppich ist viel zu groß und schwer, um ihn mitzunehmen. Anheben könntest du ihn aber.',
  beschreibung: function (api) {
    return 'Ein abgetretener Teppich mit verblichenem Rankenmuster.' +
      (api.eig('eisenschluessel', 'versteckt') ? ' An einer Ecke wölbt er sich ein wenig, als läge etwas darunter.' : ' An einer Ecke ist er umgeschlagen.');
  },
  tasten: function (api) {
    return api.eig('eisenschluessel', 'versteckt')
      ? 'Unter dem Gewebe fühlst du an einer Ecke etwas Hartes, Längliches.'
      : 'Rauer, abgewetzter Flor.';
  }
});

HG.ding('eisenschluessel', {
  nomen: 'Schlüssel', genus: 'm', adj: ['eisern'],
  woerter: ['schluessel', 'eisenschluessel', 'bartschluessel'], adjektive: ['gross', 'schwer', 'rostig'],
  kurzwort: 'eisernen schlüssel',
  ort: 'halle', istSchluessel: true,
  versteckt: {
    bei: 'teppich', wie: ['unter', 'anheben', 'durchsuchen'],
    text: 'Du schlägst die Ecke des Teppichs zurück. Darunter, in einer Mulde zwischen den Dielen, liegt ein großer eiserner Schlüssel.'
  },
  beschreibung: 'Ein schwerer Bartschlüssel aus Eisen, kalt und ein wenig rostig. Er sieht aus, als gehöre er zu einer Tür.'
});

// =====================================================================
// ARBEITSZIMMER DES ARCHITEKTEN
// =====================================================================
HG.raum('arbeitszimmer', {
  name: 'Arbeitszimmer',
  woerter: ['arbeitszimmer', 'studierzimmer', 'buero', 'kontor'],
  schauplatz: 'haus',
  karte: { x: -1, y: 0 },
  // Nachts nicht ganz dunkel: Mondlicht fällt durchs Fenster.
  beschreibung: function (api) {
    var licht = {
      morgen: 'Durch das hohe Fenster fällt fahles Morgenlicht.',
      mittag: 'Staub tanzt im Licht, das durch das hohe Fenster fällt.',
      abend: 'Das Abendlicht färbt die Buchrücken rot.',
      nacht: 'Durch das hohe Fenster fällt Mondlicht und macht alles grau und flach wie auf einer alten Fotografie.'
    }[api.tageszeit()];
    return 'Das Arbeitszimmer eines Architekten. Regale voller Bücher und gerollter Pläne bedecken die Wände bis unter die Decke. ' +
      'Vor dem hohen Fenster steht ein wuchtiger Schreibtisch, und an der Wand daneben hängt das Porträt eines ernst blickenden Mannes. ' + licht +
      ' Die Luft ist still, als hätte hier seit Jahrzehnten niemand mehr geatmet. Die Eichentür im Osten führt zurück in die Halle.';
  },
  kurz: 'Das Arbeitszimmer mit dem wuchtigen Schreibtisch, den Bücherregalen und dem Porträt. Im Osten geht es zurück in die Halle.',
  horchen: { tag: 'Das Ticken einer Uhr – aber du siehst nirgends eine Uhr.', nacht: 'Das Ticken einer Uhr. Es wird langsamer, je länger du lauschst. Dann setzt es aus.' },
  riechen: 'Altes Papier, Tusche, kalter Tabak.',
  versteck: 'Du könntest dich unter den Schreibtisch kauern. Im Moment gibt es dafür keinen Grund.',
  ausgaenge: {
    osten: { ziel: 'halle', tuer: 'eichentuer' }
  },
  vorschlaege: function (api) {
    var v = ['untersuche schreibtisch', 'untersuche porträt'];
    if (api.eig('schreibtischschublade', 'verschlossen')) v.push('öffne schublade');
    return v;
  },
  details: [
    { nomen: 'Fenster', genus: 'n', woerter: ['fenster', 'scheibe', 'vorhang', 'vorhaenge', 'garten'], text: 'Hinter dem Glas liegt der verwilderte Garten im letzten Licht. Die Vorhänge sind schwer vor Staub. Das Fenster ist verriegelt, der Griff fehlt.' },
    { nomen: 'Bücherregal', genus: 'n', woerter: ['regal', 'regale', 'buecherregal', 'buecher', 'buch', 'band', 'baende', 'rollen'], text: 'Bücher über Statik, Baukunst und Geometrie, dazwischen Rollen mit Plänen. Alles ordentlich beschriftet – in derselben schrägen Handschrift.', lesbar: 'Du ziehst wahllos einen Band heraus: „Handbuch der Baukonstruktion“. Am Rand Notizen in schräger Handschrift: Lasten, Winkel, Zahlenkolonnen. Nichts Persönliches.' }
  ]
});

HG.ding('schreibtisch', {
  nomen: 'Schreibtisch', genus: 'm', adj: ['wuchtig'],
  woerter: ['schreibtisch', 'tisch', 'pult', 'sekretaer', 'tischplatte', 'platte'], adjektive: ['eichen'],
  ort: 'arbeitszimmer', fest: 'Der Schreibtisch wiegt mehr als du.', szenerie: true, ablage: true,
  beschreibung: 'Ein wuchtiger Schreibtisch aus Eiche, die Platte mit grünem Leder bezogen. Er hat eine einzige Schublade mit einem kleinen Messingschloss.',
  versteck: 'Du kauerst dich unter den Schreibtisch. Von hier unten siehst du nur die Tür – und hörst dein eigenes Herz.'
});

HG.ding('schreibtischschublade', {
  nomen: 'Schublade', genus: 'f',
  woerter: ['schublade', 'lade', 'schreibtischschublade', 'messingschloss', 'schloss'],
  ort: 'arbeitszimmer', fest: true, szenerie: true,
  behaelter: true, oeffenbar: true, offen: false, verschlossen: true, schluessel: 'messingschluessel',
  beschreibung: function (api) {
    return 'Die Schublade des Schreibtischs, mit einem kleinen Schloss aus Messing.' +
      (api.eig('schreibtischschublade', 'verschlossen') ? ' Sie ist abgeschlossen.' : '');
  },
  texte: {
    verschlossen: 'Die Schublade ist abgeschlossen. Das kleine Messingschloss glänzt matt.',
    aufschliessen: 'Der kleine Schlüssel passt. Mit einem leisen Klicken gibt das Schloss nach.',
    oeffnen: 'Du ziehst die Schublade auf. Ein Geruch nach altem Papier steigt dir entgegen.'
  }
});

HG.ding('bauplan', {
  nomen: 'Bauplan', genus: 'm',
  woerter: ['bauplan', 'plan', 'zeichnung', 'grundriss', 'entwurf', 'bogen', 'signatur'], adjektive: ['vergilbt', 'gross'],
  ort: 'schreibtisch', rel: 'auf', beschreibbar: true,
  plan: 'haus',   // Bernwards Bauplan von 1899 (js/content/grundriss.js) – zugleich die Karte des Hauses
  beschreibung: 'Vier große, vergilbte Bögen, mit Reißzwecken zusammengeheftet: die Grundrisse dieses Hauses – Keller, Erdgeschoss, Obergeschoss, Dach –, mit Tusche gezeichnet und sauber bemaßt. Im Stempelfeld jedes Blatts steht in sorgfältiger Schrift: „Entwurf und Ausführung: B. Grest, Architekt“. Darunter, kleiner und mit anderer Tinte: „Für E.“',
  lesbar: '„Villa für die Eheleute Grest · Kirchhörde. Entwurf und Ausführung: B. Grest, Architekt. Dortmund, im Mai 1899.“<br>Darunter, kleiner und mit anderer Tinte: „Für E.“',
  hinweis: 'bauplan_signatur', hinweisBei: 'untersuchen',
  bei: { lesen: function (api) { api.hinweis('bauplan_signatur'); return false; } }
});

HG.ding('bleistift', {
  nomen: 'Bleistift', genus: 'm',
  woerter: ['bleistift', 'stift'],
  ort: 'schreibtisch', rel: 'auf',
  schreibgeraet: true,
  beschreibung: 'Ein kurzer, sorgfältig gespitzter Zimmermannsbleistift.'
});

HG.ding('portraet', {
  nomen: 'Porträt', genus: 'n',
  woerter: ['portraet', 'bild', 'gemaelde', 'bildnis', 'mann', 'rahmen', 'messingschild', 'schild'], adjektive: ['ernst'],
  ort: 'arbeitszimmer', szenerie: true,
  fest: 'Das Porträt hängt an einem Haken an der Wand. Mitnehmen willst du es nicht – aber du könntest es abnehmen.',
  beschreibung: function (api) {
    return 'Ein Mann in dunklem Gehrock, mit gepflegtem Bart und einem Zirkel in der Hand. Die Augen sind gut gemalt – zu gut. ' +
      'Auf einem Messingschild am Rahmen steht: „Bernward Grest, Architekt, 1900“.' +
      (api.eig('messingschluessel', 'versteckt') ? ' Der Rahmen hängt ein wenig schief.' : '');
  },
  hinweis: 'portraet_bernward',
  texte: { abnehmen: 'Du hebst das Porträt an, aber dahinter ist nur ein hellerer Fleck auf der Tapete. Du hängst es zurück.' }
});

HG.ding('messingschluessel', {
  nomen: 'Messingschlüssel', genus: 'm', adj: ['klein'],
  woerter: ['messingschluessel', 'schluessel', 'schluesselchen'], adjektive: ['golden'],
  kurzwort: 'messingschlüssel',
  ort: 'arbeitszimmer', istSchluessel: true,
  versteckt: {
    bei: 'portraet', wie: ['hinter', 'abnehmen', 'anheben', 'schieben', 'ziehen'],
    text: 'Du hebst das Porträt ein Stück von der Wand. Etwas fällt klirrend zu Boden: ein kleiner Messingschlüssel, der hinter dem Rahmen an einem Nagel hing.'
  },
  beschreibung: 'Ein kleiner Schlüssel aus Messing, kaum länger als dein kleiner Finger. Zu klein für eine Tür.'
});

HG.ding('brief', {
  nomen: 'Brief', genus: 'm', adj: ['vergilbt'],
  woerter: ['brief', 'briefbogen', 'umschlag', 'handschrift'], adjektive: ['alt'],
  ort: 'schreibtischschublade', rel: 'in',
  beschreibung: 'Ein vergilbter Briefbogen, eng beschrieben in einer sauberen, schrägen Handschrift. Er wurde nie abgeschickt.',
  lesbar: '<i>Haus Grest, im November 1900</i><br><br>Lieber Freund,<br>das Haus ist fertig. Jeder Raum ist so geworden, wie Elisabeth ihn sich gewünscht hat – ich habe keinen Strich gezogen, den sie nicht gesehen hätte.<br><br>' +
    'Und doch: Seit wir eingezogen sind, geht es ihr mit jeder Woche schlechter. Erst die Müdigkeit, nun die Anfälle. Die Ärzte finden keine Ursache. Am zwölften Mai, an unserem Tag, wollte ich ihr das fertige Haus schenken – zwei Jahre nach unserer Hochzeit. Sie konnte an diesem Tag kaum die Treppe hinaufsteigen.<br><br>' +
    'Manchmal, wenn ich nachts durch die Flure gehe, ist mir, als hätte ich mich verrechnet. Nicht an den Mauern. An etwas anderem.<br><br>' +
    'Verzeih die wirren Zeilen. Ich schlafe schlecht.<br><br>Dein Bernward',
  hinweis: 'brief_bernward', hinweisBei: 'lesen',
  bei: { lesen: function (api) { api.hinweis('hochzeitstag'); return false; } },
  riechen: 'Ganz schwach: Lavendel.'
});

// =====================================================================
// FLUR MIT DEM GROSSEN SPIEGEL (dunkel)
// =====================================================================
HG.raum('flur', {
  name: 'Flur',
  woerter: ['flur', 'gang', 'korridor'],
  schauplatz: 'haus',
  karte: { x: 0, y: -1 },
  selfie: { tag: 'Dein Gesicht, bleich im Blitzlicht. Hinter dir der Flur und der Spiegel. Im Spiegel: dein Hinterkopf – und daneben ein zweiter.', nacht: 'Dein Gesicht, bleich im Blitzlicht. Hinter dir, ganz nah, eine Hand auf deiner Schulter. Du spürst nichts.' },
  dunkel: true,
  dunkelText: 'Es ist stockfinster. Irgendwo vor dir tickt etwas – oder ist es dein eigener Puls? Hinter dir, im Süden, schimmert schwach das Licht der Halle.',
  beschreibung: function (api) {
    var licht = api.eig('kerze', 'brennt') && api.traegt('kerze') ? 'Im Kerzenschein' : 'Im Lichtkegel deiner Lampe';
    return 'Ein langer, schmaler Flur. Die Tapete hat sich an den Nähten gelöst und hängt in Fahnen herab. ' +
      'Am Ende des Flurs hängt ein großer Spiegel in einem schwarzen Rahmen, fast so hoch wie eine Tür. ' + licht + ' siehst du darin einen zweiten Flur, der dir entgegenkommt. ' +
      'Links eine niedrige Tür mit einer Kette davor – der Keller. Weiter hinten zweigt nach Westen ein Gang zur Hinterdiele ab, nach Osten eine Tür zur Anrichte. Im Süden liegt die Halle.';
  },
  kurz: 'Der schmale Flur mit der abblätternden Tapete. Am Ende wartet der große Spiegel. Westen: Hinterdiele, Osten: Anrichte, Süden: Halle. Die Kellertür ist mit einer Kette gesichert.',
  tasten: function (api) {
    return api.hell()
      ? 'Die Tapete fühlt sich feucht an, fast lebendig.'
      : 'Deine Finger gleiten über feuchte, sich lösende Tapete. Weiter vorn wird die Wand plötzlich glatt und eiskalt – Glas.';
  },
  horchen: 'Stille. Nur einmal meinst du, vom Ende des Flurs ein leises Atmen zu hören.',
  riechen: 'Feuchter Putz. Und ganz schwach: Lavendel.',
  ausgaenge: {
    sueden: 'halle', westen: 'hinterdiele', osten: 'anrichte',
    runter: { sperre: 'Die Kellertür ist mit einer schweren Kette und einem Vorhängeschloss gesichert. <span class="nebenbei">(Der Keller wird noch gebaut.)</span>' }
  },
  vorschlaege: function (api) { return api.hell() ? ['untersuche spiegel', 'schau in den spiegel'] : ['geh nach süden']; },
  details: [
    { nomen: 'Tapete', genus: 'f', woerter: ['tapete', 'tapeten', 'fahnen', 'wand', 'waende'], text: 'Ein Muster aus dunklen Lilien. An den Nähten hat sie sich gelöst; darunter ist der Putz fleckig und feucht.', reissen: 'Du reißt einen Streifen Tapete ab. Darunter: nur fleckiger Putz. Irgendwie hattest du etwas anderes erwartet.' },
    // [später] Keller: Schlüssel zum Vorhängeschloss und Rätsel folgen mit dem Keller
    { nomen: 'Kellertür', genus: 'f', woerter: ['kellertuer', 'keller', 'kette', 'vorhaengeschloss', 'kellertreppe', 'pappschild', 'schild'],
      text: 'Eine niedrige Brettertür. Jemand hat zwei Ösen ins Holz geschraubt und eine schwere Kette hindurchgezogen, gesichert mit einem neuen Vorhängeschloss. An der Kette hängt ein Pappschild, in Carstens Schrift: <b>NICHT RUNTER.</b>',
      horchen: 'Von unten kommt kalte Luft durch die Ritzen. Und ein Geräusch, gleichmäßig, wie jemand, der sehr langsam atmet. Oder eine Heizung. Es gibt keine Heizung, die läuft.',
      zerbrechen: 'Die Kette ist neu und dick. Mit bloßen Händen keine Chance.' }
  ]
});

HG.ding('spiegel', {
  nomen: 'Spiegel', genus: 'm', adj: ['groß'],
  woerter: ['spiegel', 'glas', 'spiegelglas', 'spiegelbild', 'spiegelrahmen'], adjektive: ['gross', 'schwarz'],
  ort: 'flur', szenerie: true,
  fest: 'Der Spiegel ist fest mit der Wand verschraubt – und ohnehin viel zu groß.',
  beschreibung: 'Ein Spiegel, fast so hoch wie eine Tür, in einem schweren Rahmen aus schwarz gebeiztem Holz. Das Glas ist an den Rändern blind geworden, in der Mitte aber vollkommen klar. Du müsstest nur hineinsehen.',
  tasten: 'Das Glas ist eiskalt. Kälter, als es sein dürfte.',
  foto: 'Der Rahmen ist da, die Tapete daneben, der Flur. Aber im Spiegel ist nichts – kein Flur, kein Licht, keine Spur von dir. Nur Schwärze im Rahmen.',
  gespraech: 'Du flüsterst einen Gruß. Im Glas bewegen sich deine Lippen – einen Lidschlag zu spät.',
  bei: {
    // NERVEN-Proben nach Delta-Green-Art (siehe Spielbibel): leicht 0/1W3, mittel 1/1W6, schwer 1/1W8
    klopfen: function (api) {
      if (api.zaehle('spiegel_klopfen') === 1) {
        api.sound('klopfen-glas');
        api.sage('Du klopfst an das Glas. Von der anderen Seite klopft es zurück. Einmal.');
        api.nervenProbe('1/1W6', { grund: 'Klopfen im Glas' });
      } else {
        api.sage('Du klopfst an das Glas. Diesmal bleibt es still. Du bist nicht sicher, ob das besser ist.');
      }
      return true;
    },
    zerbrechen: function (api) {
      // Beim ersten Versuch zögerst du; danach zerspringt das Glas (allgemeine Spiegel-Regel, js/engine/macht.js).
      // Es erneuert sich über Nacht (Spielbibel 8.2).
      if (api.zaehle('spiegel_zerbrechen') > 1) return false;
      api.sage('Du ballst die Faust – und hältst inne. Für einen Augenblick ist dir, als hebe dein Spiegelbild die Hand nicht mit dir.');
      api.nervenProbe('0/1W3', { grund: 'Spiegelbild' });
      return true;
    },
    hineinschauen: function (api) {
      var n = api.zaehle('spiegel_blick');
      if (n === 1) {
        api.abschnitt(13, 'Du hebst dein Licht und siehst in das Glas. Da ist der Flur, das flackernde Licht, dein eigenes bleiches Gesicht. ' +
          'Und hinter deiner linken Schulter, ganz nah, eine Frau im Nachthemd. Ihr Haar ist offen, ihr Kopf zur Seite geneigt, als lausche sie. Ihre Lippen bewegen sich.<br><br>' +
          'Du fährst herum. Der Flur hinter dir ist leer.');
        api.nervenProbe('1/1W8', { grund: 'Gestalt im Spiegel' });
        api.hinweis('frau_im_spiegel');
      } else if (n === 2) {
        api.sage('Du zwingst dich, noch einmal hinzusehen. Nur du – und dein Spiegelbild, das einen Herzschlag nach dir blinzelt.');
        api.nervenProbe('1/1W6', { grund: 'Spiegelbild' });
      } else {
        var texte = [
          'Die Frau ist wieder da. Diesmal steht sie näher.',
          'Dein Spiegelbild lächelt. Du nicht.',
          'Im Glas ist der Flur hinter dir länger als in Wirklichkeit. Viel länger.'
        ];
        api.sage(texte[(n - 3) % texte.length]);
        api.nervenProbe('1/1W6', { grund: 'zu lange in den Spiegel gesehen' });
      }
      return true;
    },
    untersuchen: function (api, ctx) {
      // "betrachte dich im Spiegel" landet hier ebenfalls beim Hineinsehen
      if (ctx.reflexiv) return HG.daten.dinge.spiegel.bei.hineinschauen(api, ctx);
      return false;
    }
  }
});

// =====================================================================
// DINGE, DIE ERST DURCH SPUK AUFTAUCHEN
// =====================================================================
HG.ding('rasiermesser', {
  nomen: 'Rasiermesser', genus: 'n', adj: ['alt'],
  woerter: ['rasiermesser', 'messer', 'klinge'], adjektive: ['aufgeklappt'],
  ort: null,   // erscheint erst durch das Spuk-Ereignis "rasiermesser_erscheint"
  beschreibung: 'Ein altes Rasiermesser mit Perlmuttgriff, die Klinge aufgeklappt. In den Stahl ist eine Jahreszahl geätzt: <b>1906</b>. Das Metall ist eiskalt, wie Glas im Winter.',
  hinweis: 'rasiermesser_1906',
  foto: 'Auf dem Foto liegt nichts. Nur das grüne Leder der Schreibtischplatte.',
  tasten: 'Eiskalt. Die Klinge ist scharf genug, um ein Haar zu spalten.'
});
