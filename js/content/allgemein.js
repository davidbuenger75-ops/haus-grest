// Haus Grest – Inhalt: allgemeine Spieldaten
// Charaktererstellung, Startwerte, Datum/Uhrzeit, Texte für Warten, Dunkelheit,
// Reisen, Schock und Spielende.
// Platzhalter in allen Texten: {name} {vorname} {nachname} {anrede} {briefanrede}
// und {g:männlich|weiblich|ohne Angabe}, z. B. {g:Cousin|Cousine|Cousin oder Cousine}.

HG.spielDaten({
  titel: 'Haus Grest',
  startRaum: 'wohnung',          // Prolog: die Wohnung der Spielfigur (js/content/prolog.js)
  startDatum: '2026-11-16',      // [Vorschlag] Montag, 16. November 2026
  startUhrzeit: '08:10',
  startZiele: ['zuhause'],       // weitere Ziele schaltet der Brief des Notars frei

  // --- Charaktererstellung ---------------------------------------------
  charakterText: 'Bevor die Geschichte beginnt: Wer bist du?',
  frageName: 'Wie heißt du? <span class="nebenbei">(Tippe deinen Vor- und Nachnamen, z. B. „Alex Berger“.)</span>',
  frageGeschlecht: 'Bist du eine Frau, ein Mann – oder möchtest du das offen lassen? <span class="nebenbei">(„Frau“, „Mann“ oder „ohne Angabe“)</span>',
  charakterFertig: 'Gut, {name}. Dann beginnt es.',

  // --- Werte -------------------------------------------------------------
  // GESCHICK und AUSDAUER im Fighting-Fantasy-Stil (ausgewürfelt),
  // NERVEN als Prozentwert nach Delta-Green-Art: Start 80, höchstens 99.
  werte: { geschick: '1W6+6', ausdauer: '2W6+12', nerven: 80 },
  maxWerte: { nerven: 99 },
  nachtMalus: 10,                // nachts an diesen Orten −10 % auf NERVEN-Proben
  nachtMalusOrte: ['haus'],
  schockAb: 5,                   // ab so vielen verlorenen Punkten auf einmal: Schock
  schockReaktionen: [            // [Vorschlag]
    { art: 'schrei', text: 'Ein Schrei entfährt dir, laut und fremd. Er hallt viel zu lange nach.' },
    { art: 'fallen', text: 'Deine Hände zittern so sehr, dass dir %DING% entgleitet und zu Boden fällt.' },
    { art: 'flucht', text: 'Du denkst nicht nach. Deine Beine tragen dich einfach fort, nur weg von hier.' }
  ],
  erholungBeimSchlaf: { ausdauer: 2, nerven: 1 },   // NERVEN nur für eine Nacht außerhalb des Hauses, höchstens bis zum Startwert
  tragkraft: 12,

  tageszeitTexte: {
    morgen: 'Ein neuer Morgen.',
    mittag: 'Mittag.',
    abend: 'Es wird Abend. Die Schatten werden lang.',
    nacht: 'Es ist Nacht geworden.'
  },

  // Spuk: Mindestabstand in Zügen, nachts häufiger
  spukAbstand: 4,
  spukNachtFaktor: 2.5,

  einleitung: [
    'Der Brief kam mit der Morgenpost: ein schwerer, cremefarbener Umschlag, wie ihn heute niemand mehr verschickt. Der Absender ist ein Notariat.',
    'Darin geht es um <b>Carsten Häuser</b>, einen entfernten Verwandten. Wenn du richtig rechnest, bist du {g:sein Cousin|seine Cousine|mit ihm verwandt, Cousine oder Cousin} zweiten Grades. ' +
    'Du hast ihn ein einziges Mal gesehen: auf Tante Gerdas siebzigstem Geburtstag, da warst du vielleicht acht. Ein großer, stiller Mann, der dir ein Stück Kuchen zugeschoben hat und dann den ganzen Nachmittag aus dem Fenster sah. Danach nie wieder.'
  ],

  dunkelText: 'Es ist stockfinster. Du kannst nicht die Hand vor Augen sehen.',
  wirdDunkelText: 'Die Dunkelheit schließt sich um dich wie Wasser.',
  sagenText: 'Deine Stimme klingt fremd in der Stille. Niemand antwortet.',
  wartenTexte: [
    'Du wartest. Irgendwo knackt eine Diele.',
    'Du wartest. Die Zeit vergeht.',
    'Die Zeit vergeht. Nichts geschieht – oder du bemerkst es nicht.',
    'Du wartest und lauschst auf deinen eigenen Herzschlag.'
  ],
  wartenLangeText: 'Du wartest. Die Minuten kriechen dahin.',
  keinSchlafText: 'Hier kannst du nicht schlafen. Du bräuchtest ein Bett – und das Gefühl, sicher zu sein.',
  andeutungText: 'Zwei deiner Notizen scheinen zusammenzupassen. Verbinde sie im Notizbuch – oder tippe „kombiniere … mit …“.',
  // Gruppen im Notizbuch (Ermittlungsstränge der Spielbibel, Abschnitt 5); "strang" am Hinweis wählt die Gruppe
  straenge: [
    { k: 'A', titel: 'A · Der Architekt' },
    { k: 'B', titel: 'B · Elisabeth' },
    { k: 'C', titel: 'C · Die Krähe' },
    { k: 'D', titel: 'D · Die Toten' },
    { k: 'E', titel: 'E · Carsten' }
  ],
  straengeSonst: 'Weitere Hinweise',
  umdrehenText: 'Du drehst dich um. Niemand. Natürlich niemand.',

  // Reisen
  keinAutoText: 'Dein Auto steht nicht hier. Geh erst hinaus.',
  keineZieleText: 'Du hast im Moment keinen Grund wegzufahren. Vielleicht solltest du zuerst den Brief lesen.',
  fahrtText: { tag: 'Du steigst ins Auto und fährst durch die Stadt.', abend: 'Du fährst durch die Dämmerung. Die Straßenlaternen springen eine nach der anderen an.', nacht: 'Du fährst durch die leeren, nassen Straßen. Im Rückspiegel nur Dunkelheit.' },

  // Spielende bei 0 NERVEN – je nach Ort [Vorschlag]
  endeNerven: function (api) {
    var ort = HG.welt.raum().schauplatz;
    if (ort === 'haus') {
      return '<b>Dein Abenteuer endet hier.</b><br>Das Haus hat gewonnen. Das Flüstern ist jetzt überall, in den Wänden, im Glas, in deinem Kopf. Du lachst – und hörst nicht mehr auf. ' +
        'Irgendwann bemerkst du, dass es nicht mehr deine Stimme ist, die lacht. Im großen Spiegel steht jemand, der aussieht wie du, und winkt.';
    }
    return '<b>Dein Abenteuer endet hier.</b><br>Du sitzt im Auto und kannst nicht aufhören zu zittern. Als dein Handy klingelt, gehst du ran. Eine freundliche Frauenstimme sagt: „Komm nach Hause.“ ' +
      'Und du startest den Motor.';
  },
  endeAusdauer: '<b>Dein Abenteuer endet hier.</b><br>Deine Kräfte verlassen dich. Das Haus behält dich.'
});
