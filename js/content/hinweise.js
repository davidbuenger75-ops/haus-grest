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
  text: 'Carsten vermacht alles „dem letzten Menschen, der von meiner Familie übrig ist“. Der Code fürs Tor bei Lager Schmidt: 0308.',
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

// ---------------------------------------------------------------------
// Erdgeschoss Nord und Ost (js/content/erdgeschoss-nord.js, erdgeschoss-ost.js) – [Vorschlag von Claude, 23.11.2026]
// ---------------------------------------------------------------------
HG.hinweis('elisabeths_siegel', {
  titel: 'Ein versiegeltes Zimmer', strang: 'B',
  text: 'Das Dienstbotenzimmer hinter der Hinterdiele war von außen verriegelt und mit rotem Siegelwachs verschlossen. Im Siegel die Initialen E. G. Hat Elisabeth jemanden eingeschlossen – oder etwas?',
  stichworte: ['siegel', 'dienstbotenzimmer', 'riegel']
});
HG.hinweis('kraehe_gebetbuch', {
  titel: 'Das Gebetbuch der Pflegerin', strang: 'C',
  text: 'Im Dienstbotenzimmer ein Gebetbuch, die Gebete durchgestrichen. Dazwischen, in Spiegelschrift: Jeden Neumond „ein Vogel“, damit „Er“ hört. „Die Herrin schläft, und was in ihr krank ist, schläft mit ihr.“ Nach zehn Wintern soll „die Tür unter dem Haus“ weit genug sein.',
  stichworte: ['gebetbuch', 'spiegelschrift', 'pflegerin', 'neumond']
});
HG.hinweis('vogelschaedel', {
  titel: 'Die Zigarrenkiste unter der Diele', strang: 'C',
  text: 'Unter einer losen Diele im Dienstbotenzimmer: eine Zigarrenkiste voller winziger Vogelschädel. Im Deckel Striche in Zwölferblöcken – zehn volle und ein angefangener.',
  stichworte: ['schaedel', 'vogelschaedel', 'zigarrenkiste', 'striche']
});
HG.hinweis('carstens_wg_zettel', {
  titel: 'Carstens Zettel am Kühlschrank', strang: 'E',
  text: '„Wintergarten ZU LASSEN!! Nachts sind die Scheiben wie Spiegel. Alle. Schlüssel: da, wo ich nicht mehr hinsehe.“',
  stichworte: ['zettel', 'kuehlschrank', 'wintergarten', 'schluessel']
});
HG.hinweis('dreizehn_gedecke', {
  titel: 'Gedeckt für dreizehn', strang: 'D',
  text: 'Bei Tag liegen im Speisezimmer Laken über Tisch und Stühlen. Nachts ist die Tafel gedeckt: dreizehn Gedecke, verblasste Tischkarten mit Namen – am Kopfende nur ein „E.“',
  stichworte: ['tafel', 'gedecke', 'speisezimmer', 'tischkarten']
});
HG.hinweis('renate_vogt', {
  titel: 'Renate Vogt und die Dame oben', strang: 'D',
  text: 'Im Salon ein Notenheft von Renate Vogt, die hier Klavierstunden gab. Eine Schülerin hat „die Dame oben, die immer mitsingt“ gemalt. Darunter, mit Bleistift: „Sie singt nicht mit. Sie singt vor.“',
  stichworte: ['renate', 'vogt', 'notenheft', 'fluegel', 'klavier']
});
HG.hinweis('rollstuhl_elisabeth', {
  titel: 'Der Rollstuhl im Wintergarten', strang: 'B',
  text: 'Im verwilderten Wintergarten steht ein alter Rollstuhl aus Korbgeflecht, die Decke darauf warm. Ringsum blüht Lavendel – im November.',
  stichworte: ['rollstuhl', 'wintergarten']
});
HG.hinweis('tinktur', {
  titel: 'Die Tinktur der Pflegerin', strang: 'C',
  text: 'In der Tasche des Rollstuhls ein Apothekerfläschchen mit einer dunklen, bitteren Tinktur. Auf dem Etikett, in spitzer, fremder Schrift: „Für die Herrin. Abends zwölf Tropfen, in Wein. Nie vergessen. Nie, solange ich wache.“',
  stichworte: ['tinktur', 'flaeschchen', 'medizin', 'herrin']
});

HG.schluss('pflegerin_wachte', {
  aus: ['kraehe_gebetbuch', 'tinktur'],
  titel: '„Solange ich wache“',
  text: 'Gebetbuch und Tinktur, dieselbe spitze Schrift: Die Pflegerin hat Elisabeths Krankheit nicht geheilt. Sie hat sie schlafen gelegt – mit Tropfen, Opfern und einem Ritual, „solange ich wache“. Was geschah, als sie nicht mehr wachte?'
});
HG.schluss('elf_jahre', {
  aus: ['kraehe_gebetbuch', 'vogelschaedel'],
  titel: 'Jeden Monat ein Opfer',
  text: 'Zehn volle Zwölferblöcke und ein angefangener: Mehr als zehn Jahre lang hat die Pflegerin jeden Neumond einen Vogel getötet, damit „Er“ hört. Zehn Winter, bis sich „die Tür unter dem Haus“ öffnet.'
});
HG.schluss('rollstuhl_foto', {
  aus: ['rollstuhl_elisabeth', 'pflegerin_kraehe'],
  titel: 'Der Rollstuhl vom Foto',
  text: 'Es ist derselbe Rollstuhl wie auf Carstens Foto von 1912: Elisabeth darin, hinter ihr die Pflegerin mit der Krähe. Er steht noch immer da, wo sie ihn abgestellt hat. Und jemand hält den Lavendel am Blühen.'
});
HG.schluss('dreizehn_am_tisch', {
  aus: ['dreizehn_gedecke', 'dreizehn_kreuze'],
  titel: 'Dreizehn am Tisch',
  text: 'Dreizehn Kreuze in Carstens Grundbuchauszug, dreizehn Gedecke an der nächtlichen Tafel. Das Haus deckt für seine Toten. Am Kopfende sitzt „E.“ – und Carsten hat seinen Platz schon.'
});

// --- Ablenkungen: Das Haus lockt die Spielfigur bei Tag weg (js/content/spuk.js, handy.js) ---
HG.hinweis('falscher_anruf_polizei', {
  titel: 'Die Polizei hat nicht angerufen',
  text: 'Ein „Hauptkommissar Brenner“ rief an, ich solle sofort auf die Wache kommen. Auf der Wache kennt ihn niemand, und angerufen hat von dort keiner.',
  stichworte: ['polizei', 'brenner', 'anruf']
});
HG.hinweis('falscher_anruf_schmidt', {
  titel: 'Schmidt hat nicht geschrieben',
  text: 'Eine Nachricht „von Schmidt“: Bei meiner Einheit sei jemand am Schloss gewesen, ich solle kommen. Schmidt weiß von nichts, und das Schloss ist unberührt.',
  stichworte: ['schmidt', 'nachricht', 'einheit']
});
HG.schluss('haus_will_nachts', {
  aus: ['falscher_anruf_polizei', 'falscher_anruf_schmidt'],
  titel: 'Das Haus will mich nachts',
  text: 'Zweimal hat mich jemand bei Tag aus dem Haus gelockt – mit Stimmen und Nummern, die nicht stimmen. Das Haus will nicht, dass ich es im Hellen durchsuche. Es will, dass ich wiederkomme, wenn es dunkel ist.'
});

// --- Stadtverwaltung / Bauamt (David, 22.11.2026; Wortlaut [Vorschlag], Hintergründe: Spielbibel 8.4) ---
HG.hinweis('hallmann_brand', {
  titel: 'Der Brand von 1974', strang: 'D',
  text: 'Bauakte, Feuerwehrbericht vom 4.11.1974: Eigentümer Wolfgang Hallmann (46), Studienrat, legte mit Benzin Feuer in Halle und Treppenhaus. Um 02:58 Uhr rief eine Frau ohne Namen die Feuerwehr – vom Anschluss des brennenden Hauses. Zugleich klingelte bei drei Nachbarn das Telefon. Hallmann starb oben vor einer tapezierten Tür, die von innen verriegelt war. Das Zimmer dahinter: nicht einmal Ruß.',
  stichworte: ['hallmann', '1974', 'feuerwehr', 'bauakte']
});
HG.hinweis('architekt_brinkhoff', {
  titel: 'Der Architekt Brinkhoff', strang: 'A',
  text: 'Bauakte: 1975 kaufte der Architekt Hans-Joachim Brinkhoff die Brandruine und stellte das Haus nach den Originalzeichnungen wieder her – neue Treppe, neue Vertäfelung, Heizung, Strom. Nur im „Ankleidezimmer“ war nichts zu tun. Frau Pohl: „Der hatte einen Narren an dem Haus gefressen.“',
  stichworte: ['brinkhoff', 'architekt', 'wiederaufbau']
});

// [Vorschlag] Beide Brandversuche zusammen
HG.schluss('das_haus_brennt_nicht', {
  aus: ['hallmann_brand', 'tb_wandlung'],
  titel: 'Das Haus lässt sich nicht verbrennen',
  text: '1974 Wolfgang Hallmann, 2026 Carsten: Zweimal wollte jemand das Haus anzünden, beide Male kamen Anrufe mit Stimmen, die es nicht geben dürfte. 1974 hat das Haus sogar selbst die Feuerwehr gerufen. Wer es anzünden will, darf es niemanden rufen lassen.'
});
