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

// Rückruf entlarvt die Ablenkungen des Hauses (js/content/spuk.js, „Ablenkungen bei Tag“) [Vorschlag]
HG.kontakt('polizei', {
  name: 'Polizeiwache Hombruch',
  woerter: ['polizei', 'wache', 'polizeiwache', 'revier', 'brenner', 'kommissar', 'hauptkommissar', 'hombruch'],
  bedingung: function (api) { return !!api.flag('ablenkung_polizei'); },
  rueckruf: function (api) {
    api.setzeFlag('ablenkung_polizei_geklaert');
    api.hinweis('falscher_anruf_polizei');
    return 'Eine Frauenstimme, müde: „Polizeiwache Hombruch.“ Du fragst nach Hauptkommissar Brenner. Tastaturklappern. „Einen Brenner haben wir hier nicht. Und angerufen hat Sie von uns heute auch keiner – ich seh hier nichts.“ Pause. „Ulmenweg zwölf, sagen Sie?“ Noch eine Pause. „Passen Sie auf sich auf.“';
  }
});
HG.kontakt('lager', {
  name: 'Lager Schmidt (Büro)',
  woerter: ['lager', 'schmidt', 'heinz', 'buero', 'lagerschmidt'],
  bedingung: function (api) { return api.hatHinweis('notarbrief'); },
  rueckruf: function (api) {
    if (!api.istOffen({ von: '07:00', bis: '19:00' })) return 'Anrufbeantworter: „Lager Schmidt, das Büro ist von sieben bis neunzehn Uhr besetzt. Mieter erreichen ihre Einheit rund um die Uhr mit ihrem Code.“';
    if (api.flag('ablenkung_schmidt')) {
      api.setzeFlag('ablenkung_schmidt_geklaert');
      api.hinweis('falscher_anruf_schmidt');
      return '„Schmidt, Lager Schmidt.“ Du fragst nach seiner Nachricht. „Nachricht? Ich? Ich kann gar nicht simsen, fragen Sie meine Frau.“ Er lacht. „Bei Ihrer Einheit ist alles ruhig. War den ganzen Tag keiner da.“ Dann leiser: „Komisch. Genau so was hab ich mit Herrn Häuser auch erlebt.“';
    }
    return '„Schmidt, Lager Schmidt.“ Im Hintergrund läuft Schlager. „Alles in Ordnung bei Ihnen? Kommen Sie ruhig vorbei, Kaffee ist immer da.“';
  }
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

// --- Ablenkungen bei Tag (David, 23.11.2026: Das Haus will nicht bei Tag durchsucht werden) [Vorschlag] ---
HG.nachricht('sms_schmidt', {
  von: 'Lager Schmidt', falsch: true,
  text: 'Hallo, hier Schmidt vom Lager. Bei Ihrer Einheit C-214 war heute Nacht jemand am Schloss. Kommen Sie bitte gleich mal vorbei und schauen nach, ob was fehlt. Ich bin bis 19 Uhr im Büro. H. Schmidt'
});
HG.nachricht('komm_nachts', {
  von: 'Unbekannte Nummer', falsch: true,
  text: 'Bei Tag findest du nichts. Komm heute Nacht wieder. Dann zeige ich dir alles.'
});

// ---------------------------------------------------------------------
// Anrufe
// ---------------------------------------------------------------------
HG.anruf('anruf_polizei', {
  von: 'Polizeiwache Hombruch', falsch: true,
  text: '„Brenner, Hauptkommissar, Polizeiwache Hombruch. Spreche ich mit {anrede}?“ Eine ruhige, freundliche Männerstimme. „Es geht um den Nachlass Ihres Verwandten. Wir haben hier noch persönliche Gegenstände von Herrn Häuser, die Sie abholen müssten, und ich bräuchte eine Unterschrift fürs Protokoll. Am besten heute noch – kommen Sie gleich vorbei, ja? Ich warte auf Sie.“ Klick. Er hat aufgelegt, bevor du etwas sagen konntest.',
  danach: function (api) { api.zielFrei('polizei'); }   // der Merker „ablenkung_polizei“ wird schon beim Klingeln gesetzt (spuk.js)
});

HG.anruf('anruf_carsten', {
  von: 'Carsten Häuser', falsch: true,
  text: 'Zuerst nur Rauschen. Dann, sehr weit weg, eine Frau, die eine Melodie summt – ein altes Wiegenlied. Das Summen kommt näher, als ginge sie auf das Telefon zu. Ein Klicken. Stille.',
  nerven: '1/1W6'
});
