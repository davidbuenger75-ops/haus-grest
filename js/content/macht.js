// Haus Grest – Inhalt: MACHT des Hauses und Spiegel (Spielbibel 8.2 und 8.3)
//
// Hier lassen sich alle Werte bequem anpassen. Die Regeln selbst stehen in js/engine/macht.js.
// Alle Zahlen sind [Vorschlag] – Stand 22.11.2026, zum Ausprobieren und Nachjustieren.
// Muss nach den Inhaltsdateien mit den Dingen geladen werden.
(function () {

  HG.spielDaten({
    macht: {
      max: 100,              // Obergrenze
      start: 100,            // Spielbeginn: volle MACHT (Carsten war das letzte Opfer)
      proNervenpunkt: 1,     // so viel MACHT bringt jeder NERVEN-Punkt, den die Spielfigur verliert

      // Was eine Handlung des Hauses kostet (Spuk-Ereignisse nach ihrer "art")
      kosten: {
        geruch: 2,
        geraeusch: 2,
        illusion: 4,
        bewegung: 5,
        erscheinen: 10,      // Gegenstand aus der Spiegelwelt materialisieren
        nachricht: 3,        // gefälschte Nachricht
        anruf: 5,            // gefälschter Anruf
        heraustreten: 15,    // aus einem Spiegel heraustreten (noch nicht im Spiel)
        feuerwehr: 25,       // die Feuerwehr rufen (Feuer-Ende, noch nicht im Spiel)
        erneuern: 0,         // zerbrochenen Spiegel erneuern – [offen 8.3] Idee: teuer machen, damit Zerschlagen die MACHT senkt
        sonst: 3
      },
      // Aufschlag, wenn ein Spuk durch einen Spiegel wirkt – je größer, desto teurer
      spiegelZuschlag: { winzig: 0, klein: 1, gross: 3, spiegelzimmer: 6 },
      nachtKostenFaktor: 1,  // [Vorschlag 8.3] z. B. 0.5 = nachts kostet alles nur die Hälfte; 1 = aus

      // Indirekte Anzeige: wie oft und wie heftig es spukt
      haeufigkeit: { leer: 0.25, voll: 1 },          // Faktor auf die Spuk-Wahrscheinlichkeit bei leerer/voller MACHT
      stufen: { stark: 0.66, mittel: 0.33 },         // ab welchem Anteil die MACHT als stark/mittel gilt (api.machtStufe())
      probenMod: { stark: -10, mittel: 0, schwach: 10 }, // Modifikator auf NERVEN-Proben beim Spuk (minus = schwerer)

      // Spiegel erneuern sich über Nacht – um diese Uhrzeit (Spielbibel 8.2)
      erneuerungUm: '03:00',

      texte: {
        zerbrechen: 'Du schlägst zu. Das Glas zerspringt in ein Netz aus Sprüngen, Splitter rieseln auf den Boden. Für einen Moment zeigt jede Scherbe ein anderes Bild – und keines davon bist du.',
        schonZerbrochen: 'Das Glas ist schon zersprungen. Aus jeder Scherbe sieht dich ein Stück von dir an.',
        zerbrochen: 'Das Glas ist zersprungen; ein Netz aus Sprüngen zieht sich darüber.',
        erneuert: 'Das Glas ist heil. Kein Sprung, kein Splitter – als hättest du es nie zerschlagen.',
        erneuertVorAugen: 'Ein feines Knistern, wie Eis, das zufriert. Die Sprünge im Glas schließen sich, einer nach dem anderen.'
      }
    }
  });

  // Spiegelnde Dinge und ihre Größe (winzig | klein | gross | spiegelzimmer).
  // Fensterscheiben spiegeln nur nachts. Ein ganzer Raum kann mit  spiegel: 'spiegelzimmer'  am Raum markiert werden.
  var SPIEGEL = {
    spiegel: 'gross',                                       // Flur: türhoher Spiegel
    taschenspiegel: 'winzig',                               // Lager, Handtuchbündel
    handy: 'winzig',                                        // das Display
    rasiermesser: 'winzig',                                 // die polierte Klinge
    arbeitszimmer_detail0: { nacht: 'klein', sonst: null }, // Fenster im Arbeitszimmer
    wohnung_detail1: { nacht: 'klein', sonst: null }        // Fenster deiner Wohnung
  };
  Object.keys(SPIEGEL).forEach(function (id) { if (HG.daten.dinge[id]) HG.daten.dinge[id].spiegel = SPIEGEL[id]; });

  // Diese spiegeln zwar, lassen sich aber nicht als Spiegel zerschlagen (eigene Regeln bzw. eigener Text)
  ['handy', 'rasiermesser', 'arbeitszimmer_detail0', 'wohnung_detail1'].forEach(function (id) {
    if (HG.daten.dinge[id]) HG.daten.dinge[id].spiegelZerbrechlich = false;
  });
})();
