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
  startZiele: ['zuhause', 'krankenhaus'],   // weitere Ziele schaltet der Brief des Notars frei

  // --- Charaktererstellung ---------------------------------------------
  charakterText: 'Bevor die Geschichte beginnt: Wer bist du?',
  frageName: 'Wie heißt du? <span class="nebenbei">(Tippe deinen Vor- und Nachnamen, z. B. „Alex Berger“.)</span>',
  frageGeschlecht: 'Bist du eine Frau, ein Mann – oder möchtest du das offen lassen? <span class="nebenbei">(„Frau“, „Mann“ oder „ohne Angabe“)</span>',
  charakterFertig: 'Gut, {name}. Dann beginnt es.',

  frageMethode: 'Wie sollen deine sechs Eigenschaften entstehen? <span class="nebenbei">(„würfeln“: je 4W6, die niedrigste Augenzahl fällt weg – oder „verteilen“: 72 Punkte selbst verteilen, jede Eigenschaft 3 bis 18)</span>',
  frageVerteilen: 'Verteile 72 Punkte auf Stärke, Ausdauer, Geschick, Verstand, Willenskraft und Ausstrahlung – jede zwischen 3 und 18. <span class="nebenbei">(Sechs Zahlen in dieser Reihenfolge, z. B. „13 12 12 12 12 11“)</span>',
  frageBeruf: 'Und was machst du beruflich? Dein Beruf bestimmt, worin du gut bist – und eröffnet manchmal eigene Wege.',

  // --- Regelsystem nach Delta Green (Spielbibel, Abschnitt 6) ------------
  // Eigenschaften 3–18, Probe = Wert × 5 %. Alles [Vorschlag], außer NERVEN (Start 80, höchstens 99).
  eigenschaften: [
    { k: 'st', name: 'Stärke', kurz: 'ST', text: 'Türen aufbrechen, festhalten, tragen, sich losreißen' },
    { k: 'au', name: 'Ausdauer', kurz: 'AU', text: 'Schmerzen, Kälte, Gift, Schlafentzug' },
    { k: 'ge', name: 'Geschick', kurz: 'GE', text: 'Fingerfertigkeit, Balance, Ausweichen' },
    { k: 've', name: 'Verstand', kurz: 'VE', text: 'Kombinieren, Muster erkennen, Erinnern' },
    { k: 'wi', name: 'Willenskraft', kurz: 'WI', text: 'Widerstehen gegen Einflüsterungen und Besessenheit' },
    { k: 'as', name: 'Ausstrahlung', kurz: 'AS', text: 'Überzeugen, Vertrauen gewinnen' }
  ],
  eigenschaftPunkte: 72,         // beim Verteilen
  eigenschaftMin: 3, eigenschaftMax: 18,
  koerperlich: ['st', 'au', 'ge'],   // Malus, wenn schwer verletzt (dazu Fertigkeiten mit koerperlich: true)

  // Fertigkeiten in Prozent; basis: Zahl oder 'ge*2' (Eigenschaft × Faktor)
  fertigkeiten: [
    { k: 'wahrnehmung', name: 'Wahrnehmung', basis: 20 },
    { k: 'suchen', name: 'Suchen', basis: 20 },
    { k: 'recherche', name: 'Recherche', basis: 20 },
    { k: 'geschichte', name: 'Geschichte', basis: 10 },
    { k: 'okkultismus', name: 'Okkultismus', basis: 10 },
    { k: 'handwerk', name: 'Handwerk', basis: 10, koerperlich: true },
    { k: 'erstehilfe', name: 'Erste Hilfe', basis: 10 },
    { k: 'ueberreden', name: 'Überreden', basis: 20 },
    { k: 'schleichen', name: 'Schleichen', basis: 10, koerperlich: true },
    { k: 'schusswaffen', name: 'Schusswaffen', basis: 20 },
    { k: 'nahkampf', name: 'Nahkampf', basis: 30, koerperlich: true },
    { k: 'ausweichen', name: 'Ausweichen', basis: 'ge*2', koerperlich: true }
  ],

  // Berufe: Boni auf Fertigkeiten (Prozentpunkte), probeBoni auf Eigenschaftsproben, vorteile = eigene Wege
  berufe: [
    { id: 'polizei', woerter: ['polizei', 'polizist', 'polizistin', 'kommissar', 'kommissarin', 'beamter', 'beamtin'], name: '{g:Polizist|Polizistin|Polizist(in)}', boni: { wahrnehmung: 30, schusswaffen: 30, ueberreden: 20 },
      vorteile: ['akte'], text: 'Leichterer Zugang zur Ermittlungsakte auf der Polizeiwache.' },
    { id: 'journalismus', woerter: ['journalist', 'journalistin', 'reporter', 'reporterin', 'redakteur', 'redakteurin', 'presse'], name: '{g:Journalist|Journalistin|Journalist(in)}', boni: { recherche: 30, ueberreden: 20, wahrnehmung: 20 },
      vorteile: ['archiv'], text: 'Zeitungsarchiv ohne Termin, alte Kontakte.' },
    { id: 'handwerk', woerter: ['handwerker', 'handwerkerin', 'tischler', 'tischlerin', 'schreiner', 'schreinerin', 'schlosser', 'schlosserin', 'mechaniker', 'mechanikerin', 'elektriker', 'elektrikerin'], name: '{g:Handwerker|Handwerkerin|Handwerker(in)}', boni: { handwerk: 40, suchen: 20 }, probeBoni: { st: 10 },
      vorteile: ['mechanik'], text: 'Überwindet Mechaniken und Schlösser leichter; +10 % auf Stärke-Proben.' },
    { id: 'geschichte', woerter: ['historiker', 'historikerin', 'lehrer', 'lehrerin', 'archivar', 'archivarin', 'geschichte'], name: '{g:Historiker oder Lehrer|Historikerin oder Lehrerin|Historiker(in) oder Lehrer(in)}', boni: { geschichte: 40, recherche: 20, okkultismus: 20 },
      vorteile: ['suetterlin'], text: 'Liest alte deutsche Handschrift ohne Probe.' },
    { id: 'pflege', woerter: ['pflege', 'pfleger', 'pflegerin', 'pflegekraft', 'krankenpfleger', 'krankenschwester', 'altenpfleger', 'altenpflegerin'], name: 'Pflegekraft', boni: { erstehilfe: 40, ueberreden: 20, wahrnehmung: 20 },
      vorteile: ['altenheim', 'krankenakten'], text: 'Zugang im Altenheim, versteht alte Krankenakten.' }
  ],

  // Abgeleitete Werte (e = Eigenschaften)
  lebenspunkte: function (e) { return Math.ceil((e.st + e.au) / 2); },
  willenspunkte: function (e) { return e.wi; },
  werte: { nerven: 80 },
  maxWerte: { nerven: 99 },
  schwerVerletztAb: 2,           // LP ≤ 2: schwer verletzt
  schwerMalus: 20,               // … dann −20 % auf körperliche Proben
  schwerNerven: '0/1W4',         // … und NERVEN-Probe bei jeder weiteren Verletzung
  ersteHilfe: '1W4',             // Erste Hilfe heilt einmal pro Verletzung
  endeLp: 'Dir wird schwarz vor Augen. Du spürst den kalten Boden nicht mehr, nur noch, wie etwas dich aufmerksam betrachtet, während du gehst. <b>Deine Lebenspunkte sind aufgebraucht.</b>',
  nachtMalus: 10,                // nachts an diesen Orten −10 % auf NERVEN-Proben
  nachtMalusOrte: ['haus'],
  schockAb: 5,                   // ab so vielen verlorenen Punkten auf einmal: Schock
  schockReaktionen: [            // [Vorschlag]
    { art: 'schrei', text: 'Ein Schrei entfährt dir, laut und fremd. Er hallt viel zu lange nach.' },
    { art: 'fallen', text: 'Deine Hände zittern so sehr, dass dir %DING% entgleitet und zu Boden fällt.' },
    { art: 'flucht', text: 'Du denkst nicht nach. Deine Beine tragen dich einfach fort, nur weg von hier.' }
  ],
  // Schlaf: +1 LP und +1 NERVEN pro Nacht außerhalb des Hauses (NERVEN höchstens bis zum Startwert), WP wieder voll
  erholungBeimSchlaf: { lp: 1, nerven: 1, wp: 'voll' },
  erholungNurAusserhalb: ['lp', 'nerven', 'wp'],
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
