// Haus Grest – Inhalt: Prolog
// Die Spielfigur zu Hause. Auf dem Küchentisch liegt der Umschlag des Notars mit
// Brief, Testament-Abschrift, Hausschlüssel und Lagerschlüssel.
// Den Brief zu lesen schaltet die ersten Reiseziele frei (siehe hinweise.js).
// [Vorschlag] Notar "Dr. M. Brandt", Wortlaut von Brief und Testament.

HG.ziel('zuhause', {
  name: 'Zuhause',
  woerter: ['zuhause', 'hause', 'heim', 'wohnung', 'daheim'],
  ankunft: 'wohnung', fahrzeit: 25,
  fahrt: { tag: 'Du fährst nach Hause.', sonst: 'Du fährst nach Hause. Die Fenster deiner Nachbarn sind dunkel.' }
});

HG.raum('wohnung', {
  name: 'Deine Wohnung',
  woerter: ['wohnung', 'kueche', 'zuhause'],
  schauplatz: 'zuhause',
  karte: { x: 0, y: 0 },
  abfahrt: true,     // das Auto steht vor der Tür
  schlafplatz: { nacht: 'Du legst dich ins Bett. Lange starrst du an die Decke, dann holt dich der Schlaf.', sonst: 'Du legst dich hin. Irgendwann schläfst du ein und wachst erst am nächsten Morgen wieder auf.' },
  beschreibung: {
    morgen: 'Deine kleine Wohnung, Küche und Wohnzimmer in einem. Graues Morgenlicht fällt durchs Fenster auf den Küchentisch. Der Kaffee ist kalt geworden. Dein Auto steht unten vor dem Haus – von hier kannst du jederzeit losfahren.',
    mittag: 'Deine kleine Wohnung, Küche und Wohnzimmer in einem. Von der Straße dringt Verkehrslärm herauf. Dein Auto steht unten vor dem Haus.',
    abend: 'Deine kleine Wohnung im Licht der Stehlampe. Draußen wird es dunkel. Dein Auto steht unten vor dem Haus.',
    nacht: 'Deine Wohnung, still und dunkel bis auf das Licht über dem Herd. Das Bett im Nebenzimmer wartet. Dein Auto steht unten vor dem Haus.'
  },
  kurz: { tag: 'Deine Wohnung. Unten steht dein Auto.', nacht: 'Deine Wohnung, still und dunkel. Unten steht dein Auto.' },
  horchen: { tag: 'Der Kühlschrank brummt. Irgendwo im Treppenhaus fällt eine Tür zu.', nacht: 'Nur der Kühlschrank. Und dein eigener Atem.' },
  riechen: 'Kalter Kaffee.',
  keinWeg: 'Wenn du los willst: „fahre los“.',
  vorschlaege: function (api) {
    var v = [];
    if (!api.eig('umschlag', 'offen')) v.push('öffne den umschlag');
    if (!api.hatHinweis('notarbrief')) v.push('lies den brief');
    if (!api.hatHinweis('testament')) v.push('lies das testament');
    return v;
  },
  details: [
    { nomen: 'Bett', genus: 'n', woerter: ['bett'], text: 'Dein Bett im Nebenzimmer. Wenn du müde bist: „schlafe“.' },
    { nomen: 'Fenster', genus: 'n', woerter: ['fenster', 'strasse', 'auto', 'wagen'], text: { tag: 'Unten auf der Straße steht dein Auto. Es ist voll getankt.', nacht: 'Unten glänzt dein Auto im Licht der Straßenlaterne.' } },
    { nomen: 'Kaffee', genus: 'm', woerter: ['kaffee', 'tasse', 'becher'], text: 'Kalt. Du hast ihn vergessen, als du den Brief gelesen hast.' }
  ]
});

HG.ding('kuechentisch', {
  nomen: 'Küchentisch', genus: 'm',
  woerter: ['kuechentisch', 'tisch'],
  ort: 'wohnung', fest: true, szenerie: true, ablage: true,
  beschreibung: 'Ein kleiner Tisch mit Kaffeeringen auf der Platte.'
});

HG.ding('umschlag', {
  nomen: 'Umschlag', genus: 'm', adj: ['cremefarben'],
  woerter: ['umschlag', 'kuvert', 'post'], adjektive: ['schwer'],
  ort: 'kuechentisch', rel: 'auf',
  behaelter: true, oeffenbar: true, offen: false,
  beschreibung: 'Ein schwerer, cremefarbener Umschlag. Absender: „Notariat Dr. M. Brandt“. Er ist dick – es steckt mehr darin als nur ein Brief.',
  texte: { oeffnen: 'Du ziehst den Inhalt heraus und breitest ihn auf dem Tisch aus.' }
});

HG.ding('notarbrief', {
  nomen: 'Brief', genus: 'm',
  woerter: ['brief', 'notarbrief', 'mitteilung', 'briefbogen'],
  ort: 'umschlag', rel: 'in',
  beschreibung: 'Ein Brief auf schwerem Papier, mit Briefkopf des Notariats und einer schwungvollen Unterschrift.',
  lesbar: '<i>Notariat Dr. M. Brandt · Dortmund</i><br><b>Betreff: Nachlass Herr Carsten Häuser, zuletzt wohnhaft Ulmenweg 12, Dortmund-Kirchhörde</b><br><br>' +
    '{briefanrede},<br><br>zu meinem Bedauern muss ich Ihnen mitteilen, dass Herr Carsten Häuser im Oktober verstorben ist. Nach unseren Ermittlungen sind Sie die letzte lebende Person aus seiner Familie.<br><br>' +
    'Herr Häuser hat Ihnen in seinem Testament (Abschrift anbei) sein Wohnhaus, das sogenannte <b>Haus Grest</b>, sowie den Inhalt eines Lagerraums bei der Firma <b>Lager Schmidt</b> (Einheit C-214) vermacht. Die Schlüssel zu beiden liegen diesem Schreiben bei.<br><br>' +
    'Zu den Umständen seines Todes möchte ich mich lieber telefonisch äußern. Die <b>Polizei</b> hat ihre Ermittlungen inzwischen abgeschlossen. Sie erreichen mich werktags in der Kanzlei.<br><br>' +
    'Mit freundlichen Grüßen<br>Dr. M. Brandt, Notar',
  hinweis: 'notarbrief', hinweisBei: 'lesen'
});

HG.ding('testament', {
  nomen: 'Testament', genus: 'n',
  woerter: ['testament', 'abschrift', 'kopie'],
  ort: 'umschlag', rel: 'in',
  beschreibung: 'Die Abschrift eines handschriftlichen Testaments. Die Schrift wird zum Ende hin unruhig.',
  lesbar: '<i>Mein letzter Wille. Dortmund, den 28. September 2026.</i><br><br>Alles, was ich besitze – das Haus Grest und was in meinem Lager liegt –, soll an den letzten Menschen gehen, der von meiner Familie übrig ist.<br><br>' +
    'Es tut mir leid. Ich hätte dich gern noch einmal gesehen.<br><br>' +
    'Für das Lager: Wenn bei Schmidt das Büro zu ist, öffnet der Code <b>0308</b> das Tor. Der Tag, an dem alles anfing.<br><br>Carsten Häuser',
  hinweis: 'testament', hinweisBei: 'lesen'
});

HG.ding('hausschluessel', {
  nomen: 'Hausschlüssel', genus: 'm', adj: ['alt'],
  woerter: ['hausschluessel', 'schluessel', 'haustuerschluessel'], adjektive: ['schwer', 'gross'],
  kurzwort: 'hausschlüssel',
  ort: 'umschlag', rel: 'in', istSchluessel: true,
  beschreibung: 'Ein alter, schwerer Schlüssel an einem Pappanhänger. Darauf, in Carstens unruhiger Schrift: „Haus Grest – Haustür“.'
});

HG.ding('lagerschluessel', {
  nomen: 'Lagerschlüssel', genus: 'm', adj: ['klein'],
  woerter: ['lagerschluessel', 'schluessel'], adjektive: ['flach', 'modern'],
  kurzwort: 'lagerschlüssel',
  ort: 'umschlag', rel: 'in', istSchluessel: true,
  beschreibung: 'Ein kleiner, flacher Sicherheitsschlüssel. Auf dem Plastikanhänger: „Lager Schmidt – C-214“.'
});
