// Haus Grest – Inhalt: Spuk-Ereignisse in Haus Grest
// Aufbau siehe js/engine/spuk.js. Nachts sind alle Ereignisse häufiger
// (HG.daten.spiel.spukNachtFaktor) und viele Texte/NERVEN-Verluste stärker.
// [Vorschlag] alle Ereignisse hier.
// Jedes Ereignis kostet das Haus MACHT (Tabelle in js/content/macht.js); "spiegel" bindet es an einen Spiegel.

// --- Geruch ----------------------------------------------------------
HG.spuk('lavendel', {
  art: 'geruch', schauplatz: 'haus', chance: 0.06, max: 3,
  bedingung: function (api) { return api.raum() !== 'einfahrt'; },
  text: {
    sonst: 'Plötzlich riecht es nach Lavendel, zart und altmodisch. Dann ist der Duft fort.',
    nacht: 'Lavendel, schwer und süß, als stünde jemand direkt neben dir. Du hältst den Atem an. Der Duft bleibt einen Moment zu lang.'
  },
  nerven: '0/1W3', grund: 'Geruch'
});

// --- Geräusch --------------------------------------------------------
HG.spuk('schritte_oben', {
  art: 'geraeusch', orte: ['halle', 'flur', 'arbeitszimmer'], zeiten: ['abend', 'nacht'], chance: 0.08, max: 2,
  text: {
    abend: 'Über dir, im Obergeschoss, gehen Schritte. Langsam, schlurfend. Dann Stille.',
    nacht: 'Schritte über dir. Sie gehen quer durch das Obergeschoss – und bleiben stehen. Genau über dir.'
  },
  nerven: '0/1W3', grund: 'Geräusch'
});

// --- Illusion --------------------------------------------------------
HG.spuk('spiegel_bewegung', {
  art: 'illusion', bild: true, orte: ['flur'], zeiten: ['abend', 'nacht'], chance: 0.15, max: 2, hell: true,
  spiegel: 'gross',   // nur, solange der Flurspiegel heil ist
  text: 'Aus dem Augenwinkel: Im Spiegel am Ende des Flurs bewegt sich etwas, obwohl du ganz still stehst. Als du hinsiehst, ist da nur dein eigenes Bild.',
  nerven: '1/1W6', grund: 'kurze Illusion'
});

// --- Bewegter Gegenstand ---------------------------------------------
HG.spuk('kerze_wandert', {
  art: 'bewegung', bild: true, orte: ['halle'], chance: 0.12, einmalig: true,
  // nur, wenn die Kerze noch auf der Kommode steht und du nicht hinsiehst
  bedingung: function (api) { return api.eig('kerze', 'ort') === 'kommode' && !api.eig('kerze', 'brennt'); },
  bewege: { ding: 'kerze', nach: 'halle', rel: null },
  // Sie steht auf der untersten Stufe und BRENNT (wie auf dem Bild) – bis es Tag wird oder du das Haus verlässt
  // (Spieltest 3; Zustand: Flag kerze_treppe, erdgeschoss.js)
  aktion: function (api) { api.setze('kerze', 'brennt', true); api.setzeFlag('kerze_treppe', api.istTag() ? 'tag' : 'dunkel'); },
  text: 'Hinter dir ein leises Scharren. Als du dich umdrehst, steht die Kerze nicht mehr auf der Kommode – sondern auf der untersten Treppenstufe. Und sie brennt. Niemand hat sie angezündet. Die Flamme steht still und ein wenig zu hoch, als wolle sie dir den Weg nach oben leuchten.',
  nerven: '1/1W6', grund: 'bewegter Gegenstand'
});

// --- Licht geht aus --------------------------------------------------
HG.spuk('handylicht_aus', {
  art: 'illusion', schauplatz: 'haus', zeiten: ['nacht'], chance: 0.12, max: 2,
  spiegel: 'winzig',  // das Handydisplay als Portal
  bedingung: function (api) { return api.eig('handy', 'brennt') && api.traegt('handy'); },
  text: 'Das Licht deines Handys flackert – und erlischt. Für einen Augenblick zeigt das Display ein Bild, das du nicht gemacht hast: dich selbst, von hinten, in diesem Raum.',
  aktion: function (api) { api.setze('handy', 'brennt', false); },
  nerven: '1/1W6', grund: 'Bild auf dem Display'
});

// --- Auftauchender Gegenstand ----------------------------------------
HG.spuk('rasiermesser_erscheint', {
  art: 'erscheinen', orte: ['arbeitszimmer'], zeiten: ['nacht'], chance: 0.3, einmalig: true,
  spiegel: 'klein',   // kommt durch die nächtliche Fensterscheibe aus der Spiegelwelt
  erscheine: { ding: 'rasiermesser', nach: 'schreibtisch', rel: 'auf' },
  text: 'Ein leises, metallisches Klicken. Auf dem Schreibtisch liegt etwas, das eben noch nicht da war: ein aufgeklapptes Rasiermesser. Die Klinge fängt das Mondlicht.',
  nerven: '1/1W6', grund: 'auftauchender Gegenstand'
});

// =====================================================================
// Jeder Raum im Erdgeschoss: eine Tag- und eine Nacht-Erscheinung (David, 23.11.2026) [Vorschlag: alle Texte]
// Bei Tag selten (spukTagFaktor in allgemein.js) und mild, nachts häufiger und stärker.
// NERVEN-Proben: nach einer bestandenen Probe gewöhnt man sich (Engine, gewoehnung).
// =====================================================================
var SPUK_TAG = ['morgen', 'mittag'], SPUK_NACHT = ['nacht'], SPUK_ABEND_NACHT = ['abend', 'nacht'];   // (global, daher mit Vorsilbe)

// --- Vor dem Haus ----------------------------------------------------
HG.spuk('einfahrt_kraehen', {
  art: 'geraeusch', orte: ['einfahrt'], zeiten: SPUK_TAG, chance: 0.1, max: 2,
  text: 'Auf dem Dachfirst sitzen Krähen, eine neben der anderen, und keine bewegt sich. Als du hinsiehst, fliegen alle zugleich auf – lautlos.',
  nerven: '0/1W2', grund: 'Krähen'
});
HG.spuk('einfahrt_fenster', {
  art: 'illusion', orte: ['einfahrt'], zeiten: SPUK_ABEND_NACHT, chance: 0.2, max: 2,
  text: 'Im ersten Stock, im Fenster über der Haustür, glimmt ein schwaches Licht, wie von einer Kerze. Eine Gestalt steht davor und hebt langsam die Hand. Dann ist das Fenster schwarz.',
  nerven: '0/1W3', grund: 'Licht im Fenster'
});

// --- Halle -----------------------------------------------------------
HG.spuk('halle_fussspuren', {
  art: 'illusion', orte: ['halle'], zeiten: SPUK_TAG, chance: 0.1, max: 1, hell: true,
  text: 'Auf der Treppe, im Staub neben der ausgetretenen Spur: Abdrücke nackter Füße, klein und schmal. Sie führen hinauf. Keiner führt herunter.',
  nerven: '0/1W3', grund: 'Fußspuren'
});
HG.spuk('halle_staubsauger', {
  art: 'geraeusch', orte: ['halle'], zeiten: SPUK_NACHT, chance: 0.15, max: 2,
  text: 'Oben, auf dem Treppenabsatz, springt ein Staubsauger an. Das Brummen, das Hin und Her der Düse über Holz. Dann ein Ruck, ein Poltern die Stufen herab – und Stille. Kein Staubsauger. Keine Stufe knarrt.',
  nerven: '1/1W6', grund: 'Geräusch auf der Treppe'
});

// --- Arbeitszimmer ---------------------------------------------------
HG.spuk('arbeitszimmer_bleistift', {
  art: 'bewegung', orte: ['arbeitszimmer'], zeiten: SPUK_TAG, chance: 0.1, max: 1, hell: true,
  bedingung: function (api) { return api.eig('bleistift', 'ort') === 'schreibtisch'; },
  text: 'Auf dem Schreibtisch rollt der Bleistift langsam bis an die Kante – und bleibt dort liegen, halb über dem Abgrund, als hätte ihn jemand angehalten.',
  nerven: '0/1W2', grund: 'Bleistift'
});
HG.spuk('arbeitszimmer_portraet', {
  art: 'illusion', orte: ['arbeitszimmer'], zeiten: SPUK_NACHT, chance: 0.12, max: 2, hell: true,
  text: 'Im Mondlicht hat sich das Porträt verändert. Bernward sieht nicht mehr geradeaus. Er sieht zur Tür, und sein Mund ist geöffnet, als wolle er etwas rufen. Du blinzelst. Er sieht geradeaus.',
  nerven: '0/1W3', grund: 'Porträt'
});

// --- Flur ------------------------------------------------------------
HG.spuk('flur_tapete', {
  art: 'illusion', orte: ['flur'], zeiten: SPUK_TAG, chance: 0.1, max: 1, hell: true,
  text: 'Die losen Tapetenfahnen heben und senken sich, langsam, gleichmäßig. Wie eine Brust beim Atmen. Kein Luftzug.',
  nerven: '0/1W3', grund: 'atmende Wand'
});

// --- Hinterdiele -----------------------------------------------------
HG.spuk('hinterdiele_kraehe', {
  art: 'geraeusch', orte: ['hinterdiele'], zeiten: SPUK_TAG, chance: 0.1, max: 2,
  text: 'Zwischen den Brettern vor dem Fenster der Hintertür sitzt eine Krähe und hackt gegen das Glas. Tack. Tack. Tack. Sie sieht dabei nicht das Glas an. Sie sieht dich an.',
  nerven: '0/1W2', grund: 'Krähe'
});
HG.spuk('hinterdiele_kratzen', {
  art: 'geraeusch', orte: ['hinterdiele'], zeiten: SPUK_NACHT, chance: 0.2, max: 2,
  text: function (api) {
    return api.eig('kraehentuer', 'verschlossen')
      ? 'Von hinter der verriegelten Tür: ein Kratzen. Langsam, von oben nach unten, wie Fingernägel über Holz. Dann, ganz leise, ein Krächzen.'
      : 'Aus der offenen Kammer im Westen knarrt der Schaukelstuhl. Vor, zurück. Er hört auf, als du hinsiehst.';
  },
  nerven: '1/1W6', grund: 'Kratzen'
});

// --- Dienstbotenzimmer -----------------------------------------------
HG.spuk('kammer_schaukelstuhl', {
  art: 'bewegung', orte: ['dienstbotenzimmer'], zeiten: SPUK_TAG, chance: 0.1, max: 1,
  text: 'Der Schaukelstuhl wippt. Einmal, zweimal, ganz leicht – als wäre eben jemand aufgestanden, um dich zu begrüßen.',
  nerven: '0/1W3', grund: 'Schaukelstuhl'
});
HG.spuk('kammer_gestalt', {
  art: 'illusion', bild: true, orte: ['dienstbotenzimmer'], zeiten: SPUK_NACHT, chance: 0.25, max: 1, hell: true,
  spiegel: 'klein',   // das schwarze Fenster spiegelt
  text: 'Im schwarzen Fensterglas siehst du die Kammer hinter dir – und im Schaukelstuhl eine alte Frau in schwarzem Tuch, die Hände im Schoß, auf ihrer Schulter ein Vogel. Sie nickt dir zu, als hätte sie lange gewartet. Du fährst herum: Der Stuhl ist leer. Er schaukelt.',
  nerven: '1/1W8', grund: 'Gestalt im Fenster'
});

// --- Anrichte / Gäste-WC ---------------------------------------------
HG.spuk('anrichte_spuelung', {
  art: 'geraeusch', orte: ['anrichte'], zeiten: SPUK_TAG, chance: 0.1, max: 1,
  text: 'Hinter der Schiebetür rauscht die Spülung des Gäste-WCs. Das Wasser läuft, gurgelt, verstummt. Es gibt kein Wasser mehr im Spülkasten, du hast es selbst gesehen.',
  nerven: '0/1W2', grund: 'Spülung'
});
HG.spuk('anrichte_spiegel', {
  art: 'illusion', orte: ['anrichte'], zeiten: SPUK_NACHT, chance: 0.2, max: 2,
  text: function (api) {
    return api.eig('wc_handtuch', 'ab')
      ? 'Im kleinen Spiegel über dem Waschbecken bewegt sich dein Spiegelbild, obwohl du ganz still stehst. Es legt den Finger an die Lippen.'
      : 'Das Handtuch über dem kleinen Spiegel wölbt sich nach außen, langsam, wie ein Tuch über einem Gesicht, das sich nach vorne drückt. Dann fällt es wieder flach.';
  },
  nerven: '1/1W6', grund: 'Spiegel'
});

// --- Küche -----------------------------------------------------------
HG.spuk('kueche_kaffee', {
  art: 'erscheinen', orte: ['kueche'], zeiten: ['morgen'], chance: 0.3, max: 1, tagFaktor: 1, hell: true, kosten: 4,
  text: 'Auf dem Küchentisch steht eine Tasse Kaffee. Sie dampft. Vorhin stand sie nicht da – oder doch? Der Kaffee ist heiß und riecht wie bei deiner Großmutter.',
  nerven: '0/1W3', grund: 'Kaffee'
});
HG.spuk('kueche_klingel', {
  art: 'geraeusch', bild: true, orte: ['kueche'], zeiten: SPUK_NACHT, chance: 0.25, max: 2,
  text: 'Über der Tür schlägt eine Glocke an, schrill und blechern. Im Klingelkasten ist eine der kleinen Klappen gefallen. Im Fensterchen steht: <b>ANKLEIDEZIMMER</b>. Oben, im ersten Stock, wartet jemand darauf, dass du kommst.',
  aktion: function (api) { api.setzeFlag('klappe_ankleidezimmer'); },   // bleibt unten, bis man sie hochdrückt (Klingelkasten, erdgeschoss-nord.js)
  nerven: '1/1W6', grund: 'Klingel'
});

// --- Speisekammer ----------------------------------------------------
HG.spuk('speisekammer_glas', {
  art: 'geraeusch', orte: ['speisekammer'], zeiten: SPUK_TAG, chance: 0.1, max: 1,
  text: 'Ein Einmachglas auf dem obersten Regal klirrt gegen das daneben, leise, rhythmisch. Wie Zähne, die klappern.',
  nerven: '0/1W2', grund: 'Klirren'
});
HG.spuk('speisekammer_birne', {
  art: 'illusion', orte: ['speisekammer'], zeiten: SPUK_NACHT, chance: 0.2, max: 1, hell: true,
  text: 'Etwas in einem der Gläser bewegt sich. Du hältst dein Licht daran: Birnen in trübem Sud, „Herbst 1929“. Eine von ihnen hat sich gedreht. Sie hat ein Gesicht, klein und runzlig, die Augen geschlossen. Dann öffnet es sie.',
  nerven: '1/1W6', grund: 'Glas'
});

// --- Garderobe -------------------------------------------------------
HG.spuk('garderobe_buegel', {
  art: 'geraeusch', orte: ['garderobe'], zeiten: SPUK_TAG, chance: 0.1, max: 1,
  text: 'Hinter dir ein leises Klirren. Einer der leeren Messinghaken schwingt hin und her, als hätte gerade jemand einen Mantel davon genommen. Die Haustür ist zu. Es zieht nicht.',
  nerven: '0/1W2', grund: 'Haken'
});
HG.spuk('garderobe_mantel', {
  art: 'illusion', bild: true, orte: ['garderobe'], zeiten: SPUK_NACHT, chance: 0.2, max: 1, hell: true,
  text: 'Dein Licht streift die Haken. Neben Carstens Jacke hängt jetzt ein langer schwarzer Mantel mit hohem Kragen. Darunter stehen die Knopfstiefel – und in den Stiefeln stehen Füße. Du hebst das Licht nicht höher. Als du blinzelst, hängt dort nur noch die Jacke.',
  nerven: '1/1W6', grund: 'Gestalt an der Garderobe'
});

// --- Speisezimmer ----------------------------------------------------
HG.spuk('speisezimmer_laken', {
  art: 'illusion', orte: ['speisezimmer'], zeiten: SPUK_TAG, chance: 0.1, max: 1, hell: true,
  text: 'Unter einem der Laken über den Stühlen zeichnet sich eine Gestalt ab, als säße jemand darunter, ganz still, den Kopf gesenkt. Du ziehst das Laken weg. Der Stuhl ist leer. Das Polster ist warm.',
  nerven: '0/1W3', grund: 'Gestalt unter dem Laken'
});
HG.spuk('speisezimmer_vierzehn', {
  art: 'erscheinen', orte: ['speisezimmer'], zeiten: SPUK_NACHT, chance: 0.25, max: 1, hell: true,
  bedingung: function (api) { return api.flag('tafel_gedeckt_gesehen'); },
  text: 'Du zählst die Gedecke noch einmal. Vierzehn. Am unteren Ende der Tafel steht ein Stuhl, der eben noch nicht da war, zurückgezogen, als warte er auf jemanden. Vor dem Teller eine Tischkarte, frisch, die Tinte noch glänzend: <b>{vorname}</b>.',
  nerven: '1/1W8', grund: 'dein Platz am Tisch'
});

// --- Salon -----------------------------------------------------------
HG.spuk('salon_taste', {
  art: 'geraeusch', orte: ['salon'], zeiten: SPUK_TAG, chance: 0.1, max: 1,
  text: 'Ein einzelner Ton aus dem Flügel. Ein tiefes A, das lange nachschwingt. Niemand hat die Taste berührt.',
  nerven: '0/1W2', grund: 'Flügel'
});
HG.spuk('salon_lied', {
  art: 'geraeusch', bild: true, orte: ['salon'], zeiten: SPUK_NACHT, chance: 0.2, max: 2,
  text: 'Der Flügel spielt. Unter dem Tuch, langsam, ein Wiegenlied, Ton für Ton. Oben, im ersten Stock, singt eine Frauenstimme mit – nein, sie singt vor, und der Flügel folgt ihr.',
  nerven: '1/1W6', grund: 'Wiegenlied'
});

// --- Wintergarten ----------------------------------------------------
HG.spuk('wintergarten_kraehen', {
  art: 'geraeusch', orte: ['wintergarten'], zeiten: SPUK_TAG, chance: 0.1, max: 1,
  text: 'Ein Schlag auf das Glasdach. Noch einer. Krähen landen, eine nach der anderen, und gehen über das Glas, bis sie genau über dir stehen. Dann sehen sie alle zugleich herunter.',
  nerven: '0/1W3', grund: 'Krähen'
});
HG.spuk('wintergarten_scheiben', {
  art: 'illusion', orte: ['wintergarten'], zeiten: SPUK_NACHT, chance: 0.3, max: 1, hell: true,
  spiegel: 'klein',   // nachts ist jede Scheibe ein Spiegel
  text: 'In einer der schwarzen Scheiben ist der Wintergarten nicht verwildert. Der Lavendel steht in Reihen, und im Rollstuhl sitzt eine junge Frau in hellem Kleid, eine Decke über den Knien. Hinter ihr steht jemand in Schwarz und hält die Griffe. Du siehst zum Rollstuhl neben dir: leer. Aber er steht einen halben Meter näher als vorhin.',
  nerven: '1/1W8', grund: 'Bild in der Scheibe'
});

// =====================================================================
// Ablenkungen bei Tag: Das Haus will nicht, dass man es im Hellen durchsucht (David, 23.11.2026) [Vorschlag]
// Je länger man an einem Tag im Haus ist (api.verweilt), desto eher lockt es einen weg – mit gefälschten Anrufen
// und Nachrichten. Entlarven: zurückrufen („ruf polizei an“, „ruf lager an“) oder hinfahren.
// =====================================================================
HG.spuk('ablenkung_polizei', {
  art: 'anruf', schauplatz: 'haus', zeiten: SPUK_TAG, chance: 0.7, tagFaktor: 1, einmalig: true,
  bedingung: function (api) { return api.handyDabei() && api.verweilt('haus') >= 45; },
  aktion: function (api) { api.setzeFlag('ablenkung_polizei'); },
  anruf: 'anruf_polizei'
});
HG.spuk('ablenkung_schmidt', {
  art: 'nachricht', schauplatz: 'haus', zeiten: SPUK_TAG, chance: 0.7, tagFaktor: 1, einmalig: true,
  bedingung: function (api) { return api.verweilt('haus') >= 100 && api.hatHinweis('notarbrief'); },
  aktion: function (api) { api.setzeFlag('ablenkung_schmidt'); },
  nachricht: 'sms_schmidt'
});
HG.spuk('ablenkung_nachts', {
  art: 'nachricht', schauplatz: 'haus', zeiten: SPUK_TAG, chance: 0.7, tagFaktor: 1, einmalig: true,
  bedingung: function (api) { return api.verweilt('haus') >= 160; },
  nachricht: 'komm_nachts'
});

// --- Nachrichten und Anrufe vom Haus ---------------------------------
// Carstens SMS nie gleichzeitig mit der ersten: frühestens zehn Minuten später und in einem anderen Raum als der Halle
HG.spuk('sms_carsten', {
  art: 'nachricht', schauplatz: 'haus', zeiten: ['abend', 'nacht'], chance: 0.08, einmalig: true,
  bedingung: function (api) { var w = api.flag('willkommen_min'); return !!w && api.minuten() - w >= 10 && api.raum() !== 'halle'; },
  nachricht: 'carsten_spiegelzimmer'
});

HG.spuk('sms_falscher_notar', {
  art: 'nachricht', schauplatz: 'haus', zeiten: ['nacht'], chance: 0.06, einmalig: true,
  nachricht: 'falscher_notar_keller'
});

HG.spuk('anruf_carsten', {
  art: 'anruf', schauplatz: 'haus', zeiten: ['nacht'], chance: 0.08, einmalig: true,
  bedingung: function (api) { return api.handyDabei(); },
  anruf: 'anruf_carsten'
});
