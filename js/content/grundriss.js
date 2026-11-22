// Haus Grest – Inhalt: Bernwards Bauplan von 1899 (Originalzustand) – zugleich die Karte des Hauses
//
// Maße in Metern, x von West (0) nach Ost, y von Nord (0) nach Süd. Haus 20 × 16 m, Wintergarten
// im Osten (nur EG), Erkertürmchen an der Südostecke. Raumaufteilung: Spielbibel, Abschnitt 4.
// Der Plan zeigt das Haus, wie Bernward es gebaut hat. Zwei Abweichungen zum heutigen Haus sind Hinweise:
//   1. Ankleidezimmer (OG Ost) mit Fenster und Tür zum Schlafzimmer – heute das Spiegelzimmer.
//   2. Kohlenkeller unter der Halle – heute zugemauert, dahinter der Ritualraum der Krähe.
// "raum" ist die (spätere) Raum-ID im Spiel. Unbesuchte Räume zeigen auf der Karte den Namen aus dem Plan.
(function () {

  // Erkertürmchen an der Südostecke (Achteck) und der Umriss von Haus + Turm
  var TURM = [[21.34, 16.2], [20.2, 17.34], [18.6, 17.34], [17.46, 16.2], [17.46, 14.6], [18.6, 13.46], [20.2, 13.46], [21.34, 14.6]];
  var TURM_FLAECHE = [17.46, 13.46, 21.34, 17.34];
  var UMRISS = [[0, 0], [20, 0], [20, 13.46], [20.2, 13.46], [21.34, 14.6], [21.34, 16.2], [20.2, 17.34], [18.6, 17.34], [17.46, 16.2], [17.46, 16], [0, 16]];
  var TURMFENSTER = [{ x: 21.34, y: 15.4, o: 'v', b: 1 }, { x: 19.4, y: 17.34, o: 'h', b: 1 }];

  HG.bauplan('haus', {
    schauplatz: 'haus',
    ding: 'bauplan',
    stempel: ['Villa für die Eheleute Grest · Kirchhörde', 'Entwurf und Ausführung:', 'B. Grest, Architekt', 'Dortmund, im Mai 1899'],
    widmung: 'Für E.',
    massstab: 'Maßstab 1 : 100',
    blatt: 'Blatt',
    stockwerke: [
      // ------------------------------------------------------------ Keller
      {
        id: 'keller', name: 'Kellergeschoss', kurz: 'Keller',
        umriss: [[0, 0], [20, 0], [20, 16], [0, 16]],
        raeume: [
          { id: 'vorratskeller', plan: 'Vorratskeller', raum: 'vorratskeller', r: [[0, 0, 7, 5.5]] },
          { id: 'weinkeller', plan: 'Weinkeller', raum: 'weinkeller', r: [[0, 5.5, 7, 16]] },
          { id: 'kellerflur', plan: 'Kellerflur', raum: 'kellerflur', r: [[7, 0, 13, 5.5]], l: [11.2, 2.4] },
          { id: 'kohlenkeller', plan: 'Kohlenkeller', raum: 'ritualraum', r: [[7, 5.5, 13, 14]] },
          { id: 'waschkueche', plan: 'Waschküche', raum: 'waschkueche', r: [[13, 0, 20, 5.5]] },
          { id: 'heizungskeller', plan: 'Heizungskeller', raum: 'heizungskeller', r: [[13, 5.5, 20, 16]] }
        ],
        tueren: [
          { x: 7, y: 1.2, o: 'v', b: 1, auf: -1 },
          { x: 3.5, y: 5.5, o: 'h', b: 1, auf: 1 },
          { x: 13, y: 1.2, o: 'v', b: 1, auf: 1 },
          { x: 11, y: 5.5, o: 'h', b: 1.2, auf: 1 },          // Tür zum Kohlenkeller (heute zugemauert)
          { x: 16.5, y: 5.5, o: 'h', b: 1, auf: 1 },
          { x: 13, y: 10, o: 'v', b: 1, auf: 1 },
          { x: 12.35, y: 14, o: 'h', b: 0.9, art: 'offen' }   // Kohlenschütte
        ],
        fenster: [
          { x: 3.5, y: 0, o: 'h', b: 0.9 }, { x: 10.5, y: 0, o: 'h', b: 0.9 }, { x: 16.5, y: 0, o: 'h', b: 0.9 },
          { x: 0, y: 9, o: 'v', b: 0.9 }, { x: 0, y: 13, o: 'v', b: 0.9 },
          { x: 20, y: 8.5, o: 'v', b: 0.9 }, { x: 20, y: 13, o: 'v', b: 0.9 }, { x: 16.5, y: 16, o: 'h', b: 0.9 }
        ],
        treppen: [{ r: [8, 2.2, 9.1, 5.3], hoch: 's', stufen: 11 }],
        zeichen: [
          { art: 'gewoelbe', r: [0.4, 5.9, 6.6, 15.6] },
          { art: 'erde', r: [7.11, 14.11, 12.89, 15.75] },
          { art: 'schacht', r: [11.9, 14.2, 12.8, 15.75] }
        ],
        masse: { oben: [0, 7, 13, 20], links: [0, 5.5, 14, 16] }
      },
      // ------------------------------------------------------------ Erdgeschoss
      {
        id: 'eg', name: 'Erdgeschoss', kurz: 'EG',
        umriss: UMRISS,
        raeume: [
          { id: 'dienstbotenzimmer', plan: 'Dienstbotenzimmer', raum: 'dienstbotenzimmer', r: [[0, 0, 7, 5.5]] },
          { id: 'hinterdiele', plan: 'Hinterdiele', raum: 'hinterdiele', r: [[7, 0, 9.25, 2]], klein: true },
          { id: 'kellertreppe', plan: 'Kellertreppe', raum: null, r: [[7, 2, 9.25, 5.5]], klein: true },
          { id: 'flur', plan: 'Flur', raum: 'flur', r: [[9.25, 0, 10.75, 5.5]], klein: true },
          { id: 'anrichte', plan: 'Anrichte', raum: 'anrichte', r: [[10.75, 0, 13, 3]], klein: true },
          { id: 'speisekammer', plan: 'Speisekammer', raum: 'speisekammer', r: [[10.75, 3, 13, 5.5]], klein: true },
          { id: 'kueche', plan: 'Küche', raum: 'kueche', r: [[13, 0, 20, 5.5]] },
          { id: 'arbeitszimmer', plan: 'Arbeitszimmer', raum: 'arbeitszimmer', r: [[0, 5.5, 7, 16]] },
          { id: 'halle', plan: 'Halle', raum: 'halle', r: [[7, 5.5, 13, 14]], l: [10.6, 9.5] },
          { id: 'garderobe', plan: 'Garderobe', raum: null, r: [[7, 14, 8.5, 16]], klein: true },
          { id: 'windfang', plan: 'Windfang', raum: null, r: [[8.5, 14, 11.5, 16]], klein: true },
          { id: 'speisezimmer', plan: 'Speisezimmer', raum: 'speisezimmer', r: [[13, 5.5, 20, 10.5]] },
          { id: 'salon', plan: 'Salon', raum: 'salon', wand: false, r: [[13, 10.5, 20, 16], [11.5, 14, 13, 16], TURM_FLAECHE], l: [16.3, 13.2] },
          { id: 'wintergarten', plan: 'Wintergarten', raum: 'wintergarten', wand: false, r: [[20, 4, 24, 12]] }
        ],
        tueren: [
          { x: 7, y: 7.6, o: 'v', b: 1.2, auf: -1 },            // Eichentür zum Arbeitszimmer
          { x: 8.1, y: 0, o: 'h', b: 1, auf: 1 },               // Hintertür zum Garten
          { x: 7, y: 1, o: 'v', b: 0.9, auf: -1 },
          { x: 9.25, y: 1, o: 'v', b: 0.9, auf: -1 },
          { x: 9.25, y: 4.6, o: 'v', b: 0.9, auf: 1 },          // Kellertür
          { x: 10.75, y: 1, o: 'v', b: 0.9, auf: 1 },
          { x: 13, y: 1.5, o: 'v', b: 0.9, auf: 1 },
          { x: 13, y: 4.3, o: 'v', b: 0.8, auf: -1 },
          { x: 10, y: 5.5, o: 'h', b: 1.3, art: 'offen' },       // Flur ↔ Halle
          { x: 13, y: 7.8, o: 'v', b: 1.4, art: 'doppel', auf: 1 },
          { x: 14, y: 5.5, o: 'h', b: 0.9, auf: 1 },
          { x: 16, y: 5.5, o: 'h', b: 0.8, art: 'durchreiche' },
          { x: 16.5, y: 10.5, o: 'h', b: 1.6, art: 'doppel', auf: 1 },
          { x: 12.25, y: 14, o: 'h', b: 1.2, art: 'offen' },     // dunkler Durchgang links der Haustür
          { x: 13, y: 15, o: 'v', b: 1.4, art: 'offen' },
          { x: 10, y: 14, o: 'h', b: 1.4, art: 'doppel', auf: -1 },  // Haustür mit Oberlicht
          { x: 10, y: 16, o: 'h', b: 1.4, auf: -1 },             // äußere Tür des Windfangs
          { x: 7.75, y: 14, o: 'h', b: 0.9, art: 'offen' },
          { x: 20, y: 8, o: 'v', b: 1.4, art: 'doppel', auf: 1 },
          { x: 20, y: 11.4, o: 'v', b: 1, auf: 1 }
        ],
        fenster: [
          { x: 3.5, y: 0, o: 'h' }, { x: 0, y: 2.7, o: 'v' }, { x: 12, y: 0, o: 'h', b: 0.8 },
          { x: 16.5, y: 0, o: 'h' }, { x: 20, y: 2.2, o: 'v' },
          { x: 0, y: 8.5, o: 'v', b: 1.4 }, { x: 0, y: 12.5, o: 'v', b: 1.4 }, { x: 3.5, y: 16, o: 'h', b: 1.6 },
          { x: 7.75, y: 16, o: 'h', b: 0.6 }, { x: 15.2, y: 16, o: 'h', b: 1.6 }
        ].concat(TURMFENSTER),
        treppen: [
          { r: [7.15, 6.8, 8.65, 12.4], hoch: 's', stufen: 20 },
          { r: [7.15, 12.4, 8.65, 13.9], podest: true },
          { r: [8.65, 12.4, 10.1, 13.9], hoch: 'o', stufen: 5, gestrichelt: true },
          { r: [8, 2.2, 9.1, 5.3], hoch: 's', stufen: 11 }
        ],
        zeichen: [
          { art: 'glas', r: [20, 4, 24, 12] },
          { art: 'stufen', r: [8.8, 16.25, 11.2, 17.0], n: 3 },
          { art: 'kamin', r: [13.11, 11.6, 13.6, 12.8] }
        ],
        masse: { oben: [0, 7, 13, 20, 24], links: [0, 5.5, 14, 16] }
      },
      // ------------------------------------------------------------ Obergeschoss
      {
        id: 'og', name: 'Obergeschoss', kurz: 'OG',
        umriss: UMRISS,
        raeume: [
          { id: 'kinderzimmer', plan: 'Kinderzimmer', raum: 'kinderzimmer', r: [[0, 0, 7, 5.5]] },
          { id: 'bodentreppe', plan: 'Bodentreppe', raum: null, r: [[7, 0, 8.5, 3.5]], klein: true },
          { id: 'bad', plan: 'Bad', raum: 'bad', r: [[8.5, 0, 11.5, 3.5]] },
          { id: 'kammer', plan: 'Kammer', raum: null, r: [[11.5, 0, 13, 3.5]], klein: true },
          { id: 'gaestezimmer', plan: 'Gästezimmer', raum: 'gaestezimmer', r: [[13, 0, 20, 6.5]] },
          { id: 'galerie', plan: 'Galerie', raum: 'galerie', r: [[7, 3.5, 13, 16]], l: [10, 15] },
          { id: 'bibliothek', plan: 'Bibliothek', raum: 'bibliothek', r: [[0, 5.5, 7, 16]] },
          { id: 'ankleidezimmer', plan: 'Ankleidezimmer', raum: 'spiegelzimmer', r: [[13, 6.5, 20, 10.5]] },
          { id: 'schlafzimmer', plan: 'Schlafzimmer', raum: 'schlafzimmer', wand: false, r: [[13, 10.5, 20, 16], TURM_FLAECHE], l: [16.3, 13.2] }
        ],
        tueren: [
          { x: 7, y: 4.5, o: 'v', b: 0.9, auf: -1 },
          { x: 7, y: 6.3, o: 'v', b: 1, auf: -1 },
          { x: 7.75, y: 3.5, o: 'h', b: 0.9, auf: 1 },
          { x: 10, y: 3.5, o: 'h', b: 0.9, auf: -1 },
          { x: 12.25, y: 3.5, o: 'h', b: 0.8, auf: -1 },
          { x: 13, y: 5, o: 'v', b: 0.9, auf: 1 },
          { x: 16.5, y: 10.5, o: 'h', b: 0.9, auf: -1 },         // Ankleidezimmer nur vom Schlafzimmer aus
          { x: 13, y: 13, o: 'v', b: 1, auf: 1 },
          { x: 15.6, y: 16, o: 'h', b: 1.2, art: 'doppel', auf: 1 }   // Balkontür
        ],
        fenster: [
          { x: 3.5, y: 0, o: 'h' }, { x: 0, y: 2.7, o: 'v' }, { x: 10, y: 0, o: 'h', b: 0.9 },
          { x: 16.5, y: 0, o: 'h' }, { x: 20, y: 3, o: 'v' },
          { x: 0, y: 8.5, o: 'v', b: 1.4 }, { x: 0, y: 12.5, o: 'v', b: 1.4 }, { x: 3.5, y: 16, o: 'h', b: 1.6 },
          { x: 20, y: 8.5, o: 'v', b: 1.2 },                     // Fenster des Ankleidezimmers (heute zugemauert)
          { x: 20, y: 12, o: 'v' }, { x: 10, y: 16, o: 'h', b: 2 }
        ].concat(TURMFENSTER),
        treppen: [
          { r: [7.15, 6.8, 8.65, 12.4], hoch: 's', stufen: 20, gestrichelt: true },
          { r: [7.15, 12.4, 8.65, 13.9], podest: true },
          { r: [8.65, 12.4, 10.1, 13.9], hoch: 'o', stufen: 5 },
          { r: [7.25, 0.3, 8.25, 3.3], hoch: 'n', stufen: 12 }
        ],
        zeichen: [
          { art: 'luftraum', r: [8.65, 6.8, 11.4, 12.4] },
          { art: 'gelaender', r: [14.2, 16, 17.3, 17.1] }
        ],
        masse: { oben: [0, 7, 13, 20], links: [0, 5.5, 10.5, 16] }
      },
      // ------------------------------------------------------------ Dachgeschoss
      {
        id: 'dach', name: 'Dachgeschoss', kurz: 'Dach',
        umriss: UMRISS,
        raeume: [
          { id: 'speicher', plan: 'Speicher', raum: 'speicher', wand: false, r: [[0, 0, 10, 5], [0, 5, 20, 11.5], [0, 11.5, 8, 16], [12, 11.5, 17.46, 16]], l: [4, 8.6] },
          { id: 'waescheboden', plan: 'Wäscheboden', raum: 'waescheboden', r: [[10, 0, 20, 5]] },
          { id: 'maedchenkammer', plan: 'Mädchenkammer', raum: 'maedchenkammer', r: [[8, 11.5, 12, 16]] },
          { id: 'turmerker', plan: 'Turmerker', raum: 'turmerker', poly: TURM, r: [TURM_FLAECHE], l: [19.4, 15.4] }
        ],
        tueren: [
          { x: 12, y: 5, o: 'h', b: 0.9, auf: 1 },
          { x: 10, y: 11.5, o: 'h', b: 0.8, auf: 1 },
          { x: 17.46, y: 15.3, o: 'v', b: 0.8, art: 'offen' }
        ],
        fenster: [
          { x: 10, y: 16, o: 'h', b: 1.4 }, { x: 0, y: 8, o: 'v' }, { x: 20, y: 8, o: 'v' }, { x: 15, y: 0, o: 'h' },
          { x: 21.34, y: 15.4, o: 'v', b: 0.8 }
        ],
        treppen: [{ r: [7.25, 0.3, 8.25, 3.3], hoch: 'n', stufen: 12 }],
        zeichen: [
          { art: 'linie', pts: [[0.25, 0.25], [5, 8], [15, 8], [19.75, 0.25]] },
          { art: 'linie', pts: [[0.25, 15.75], [5, 8]] },
          { art: 'linie', pts: [[17.6, 15.75], [15, 8]] },
          { art: 'linie', pts: [[1.4, 1.4], [18.6, 1.4], [18.6, 13.2], [17.3, 14.6], [1.4, 14.6], [1.4, 1.4]] }   // Kniestock
        ],
        masse: { oben: [0, 8, 12, 20], links: [0, 5, 11.5, 16] }
      }
    ]
  });

})();
