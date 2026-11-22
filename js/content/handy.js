// Haus Grest – Inhalt: Handy, Kontakte, Nachrichten, Anrufe
// "falsch: true" markiert Nachrichten/Anrufe, die das Haus fälscht. Der Spieler sieht
// diesen Vermerk nicht – er dient nur uns Autoren zur Übersicht.
// [Vorschlag] alle Texte hier.

HG.ding('handy', {
  nomen: 'Handy', genus: 'n',
  woerter: ['handy', 'telefon', 'smartphone', 'mobiltelefon', 'taschenlampe', 'lampe', 'display', 'nachricht', 'nachrichten', 'sms', 'anrufe', 'anrufliste'],
  ort: 'spieler', istHandy: true,
  lichtquelle: true, schalter: true, brennt: false,   // Taschenlampe
  beschreibung: function (api) {
    var n = HG.handy.ungelesen();
    return 'Dein Handy. Der Akku ist fast voll.' + (n ? ' <b>' + n + ' ungelesene Nachricht' + (n > 1 ? 'en' : '') + '.</b>' : '') +
      (api.eig('handy', 'brennt') ? ' Die Taschenlampe ist eingeschaltet.' : '') +
      ' <span class="nebenbei">(„lies nachrichten“, „anrufliste“, „fotos“, „fotografiere …“, „ruf … an“, „schalte die taschenlampe ein“)</span>';
  },
  texte: {
    anzuenden: 'Du schaltest die Taschenlampe deines Handys ein. Ein kalter, weißer Lichtkegel.',
    loeschen: 'Du schaltest die Taschenlampe aus.'
  },
  fest: false
});

// ---------------------------------------------------------------------
// Kontakte (anrufbar mit "ruf … an")
// ---------------------------------------------------------------------
HG.kontakt('notar', {
  name: 'Dr. Brandt (Notar)',
  woerter: ['notar', 'brandt', 'notariat', 'kanzlei', 'dr'],
  bedingung: function (api) { return api.hatHinweis('notarbrief'); },
  rueckruf: function (api) {
    if (api.tageszeit() === 'abend' || api.istNacht()) {
      return 'Anrufbeantworter: „Notariat Dr. Brandt. Sie rufen außerhalb unserer Geschäftszeiten an …“ Du legst auf.';
    }
    if (api.hatHinweis('carstens_tod')) {
      return 'Die Sekretärin stellt dich durch. Dr. Brandt klingt müde. „Ich habe Ihnen alles gesagt, was ich weiß. Seien Sie vorsichtig in dem Haus.“';
    }
    api.hinweis('carstens_tod');
    return 'Die Sekretärin stellt dich durch. Dr. Brandt räuspert sich lange. „Ihr Verwandter wurde im Obergeschoss des Hauses gefunden. In einem Zimmer voller Spiegel. ' +
      'Die Polizei sagt: Selbstmord. Er hat … er hat ein Rasiermesser benutzt. Ein altes. Es soll von 1906 sein.“ Eine Pause. „Niemand weiß, woher er es hatte.“';
  }
});

HG.kontakt('carsten', {
  name: 'Carsten Häuser',
  woerter: ['carsten', 'haeuser', 'onkel'],
  bedingung: function (api) { return api.hatHinweis('notarbrief'); },
  rueckruf: 'Eine Computerstimme: „Kein Anschluss unter dieser Nummer.“'
});

// ---------------------------------------------------------------------
// Nachrichten
// ---------------------------------------------------------------------
HG.nachricht('brandt_strom', {
  von: 'Dr. Brandt (Notar)',
  text: 'Guten Tag, kurze Info: Der Strom in Haus Grest ist abgestellt, ich kümmere mich darum. Nehmen Sie eine Lampe mit. Und bitte nicht die Treppe ins Obergeschoss – sie soll morsch sein. Brandt'
});

HG.nachricht('willkommen', {
  von: 'Unbekannte Nummer', falsch: true,
  text: 'Willkommen zu Hause.'
});

HG.nachricht('carsten_spiegelzimmer', {
  von: 'Carsten Häuser', falsch: true,
  text: 'Komm hoch. Ins Zimmer mit den Spiegeln. Ich zeig dir alles.'
});

HG.nachricht('falscher_notar_keller', {
  von: 'Dr. Brandt (Notar)', falsch: true,   // lügt: Strom ist nicht wieder da, und den Keller gibt es (noch) nicht zu sehen
  text: 'Strom ist wieder da. Der Sicherungskasten ist im Keller, falls etwas klemmt. Gehen Sie ruhig nachts hinunter.'
});

// ---------------------------------------------------------------------
// Anrufe
// ---------------------------------------------------------------------
HG.anruf('anruf_carsten', {
  von: 'Carsten Häuser', falsch: true,
  text: 'Zuerst nur Rauschen. Dann, sehr weit weg, eine Frau, die eine Melodie summt – ein altes Wiegenlied. Das Summen kommt näher, als ginge sie auf das Telefon zu. Ein Klicken. Stille.',
  nerven: '1/1W6'
});
