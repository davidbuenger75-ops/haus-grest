// Haus Grest – Inhalt: Hinweise und Schlussfolgerungen fürs Notizbuch
// strang = Ermittlungsstrang aus der Spielbibel (A–E)
// stichworte = Wörter, mit denen man den Hinweis bei "kombiniere … mit …" nennen kann
// schaltetFrei = Reiseziele, die mit diesem Hinweis bekannt werden
// [Vorschlag] alle Hinweise hier.

// ---------------------------------------------------------------------
// Prolog und Carsten (Strang E)
// ---------------------------------------------------------------------
HG.hinweis('notarbrief', {
  titel: 'Der Brief des Notars', strang: 'E',
  text: 'Carsten Häuser ist tot. Er hat mir Haus Grest und einen Lagerraum bei „Lager Schmidt“ vermacht. Die Polizei hat ermittelt. Dr. Brandt will mir den Rest nur am Telefon sagen.',
  stichworte: ['notar', 'notarbrief', 'brandt', 'erbe'],
  schaltetFrei: ['haus', 'lager']
});

HG.hinweis('testament', {
  titel: 'Carstens Testament', strang: 'E',
  text: 'Carsten vermacht alles „dem letzten Menschen, der von meiner Familie übrig ist“. Und: „Verkaufe es nicht. Es lässt dich nicht gehen.“ Der Code fürs Tor bei Lager Schmidt: 0308.',
  stichworte: ['testament', 'carsten']
});

HG.hinweis('carstens_tod', {
  titel: 'Wie Carsten starb', strang: 'E',
  text: 'Laut Dr. Brandt: gefunden im Obergeschoss, in einem Zimmer voller Spiegel. Selbstmord – mit einem alten Rasiermesser, angeblich von 1906. Niemand weiß, woher er es hatte.',
  stichworte: ['tod', 'selbstmord', 'spiegelzimmer', 'rasiermesser']
});


HG.hinweis('rasiermesser_1906', {
  titel: 'Ein Rasiermesser von 1906',
  text: 'Nachts lag plötzlich ein aufgeklapptes Rasiermesser auf Bernwards Schreibtisch, wo vorher nichts war. In die Klinge ist „1906“ geätzt. Auf dem Foto ist es nicht zu sehen.',
  stichworte: ['messer', 'klinge', '1906']
});

// ---------------------------------------------------------------------
// Haus Grest, Erdgeschoss (Strang A/B)
// ---------------------------------------------------------------------

HG.hinweis('portraet_bernward', {
  titel: 'Das Porträt', strang: 'A',
  text: 'Im Arbeitszimmer hängt ein Porträt: „Bernward Grest, Architekt, 1900“. Der Mann, der dieses Haus gebaut hat.',
  stichworte: ['portraet', 'bild', 'gemaelde', 'bildnis'],
  schaltetFrei: ['friedhof']   // Bernwards Grab
});

HG.hinweis('bauplan_signatur', {
  titel: 'Der Bauplan', strang: 'A',
  text: 'Der Grundriss des Hauses ist signiert: „Entwurf und Ausführung: B. Grest, Architekt“. Darunter, mit anderer Tinte: „Für E.“',
  stichworte: ['bauplan', 'plan', 'grundriss', 'signatur', 'entwurf'],
  schaltetFrei: ['bauamt']     // die Bauakte
});

HG.hinweis('brief_bernward', {
  titel: 'Bernwards Brief', strang: 'A/B',
  text: 'Ein nie abgeschickter Brief, November 1900: Seit dem Einzug wird Elisabeth von Woche zu Woche kränker, die Ärzte finden keine Ursache. Bernward fürchtet, er habe sich „verrechnet – nicht an den Mauern“.',
  stichworte: ['brief', 'bernward', 'elisabeth'],
  schaltetFrei: ['stadtarchiv']
});

HG.hinweis('frau_im_spiegel', {
  titel: 'Die Frau im Spiegel',
  text: 'Im großen Spiegel im Flur: eine Frau im Nachthemd, direkt hinter mir. Umgedreht – niemand da.',
  stichworte: ['frau', 'spiegel', 'nachthemd']
});

HG.schluss('zwei_rasiermesser', {
  aus: ['carstens_tod', 'rasiermesser_1906'],
  titel: 'Das Messer kommt wieder',
  text: 'Carsten starb mit einem Rasiermesser von 1906, das die Polizei sicher längst mitgenommen hat. Und doch lag eins auf dem Schreibtisch, das auf keinem Foto erscheint. Woher kommt es?'
});

HG.schluss('haus_fuer_elisabeth', {
  aus: ['bauplan_signatur', 'brief_bernward'],
  titel: 'Ein Haus für E.',
  text: 'Bernward hat das Haus eigens für Elisabeth entworfen – „Für E.“. Doch kaum waren sie eingezogen, wurde sie krank. Hat ihre Krankheit etwas mit dem Haus selbst zu tun?'
});
