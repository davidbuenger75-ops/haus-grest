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
  art: 'illusion', orte: ['flur'], zeiten: ['abend', 'nacht'], chance: 0.15, max: 2, hell: true,
  spiegel: 'gross',   // nur, solange der Flurspiegel heil ist
  text: 'Aus dem Augenwinkel: Im Spiegel am Ende des Flurs bewegt sich etwas, obwohl du ganz still stehst. Als du hinsiehst, ist da nur dein eigenes Bild.',
  nerven: '1/1W6', grund: 'kurze Illusion'
});

// --- Bewegter Gegenstand ---------------------------------------------
HG.spuk('kerze_wandert', {
  art: 'bewegung', orte: ['halle'], chance: 0.12, einmalig: true,
  // nur, wenn die Kerze noch auf der Kommode steht und du nicht hinsiehst
  bedingung: function (api) { return api.eig('kerze', 'ort') === 'kommode' && !api.eig('kerze', 'brennt'); },
  bewege: { ding: 'kerze', nach: 'halle', rel: null },
  text: 'Hinter dir ein leises Scharren. Als du dich umdrehst, steht die Kerze nicht mehr auf der Kommode – sondern auf der untersten Treppenstufe, als wolle sie dir den Weg nach oben leuchten.',
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

// --- Nachrichten und Anrufe vom Haus ---------------------------------
HG.spuk('sms_carsten', {
  art: 'nachricht', schauplatz: 'haus', zeiten: ['abend', 'nacht'], chance: 0.08, einmalig: true,
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
