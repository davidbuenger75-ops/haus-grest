// Haus Grest – Inhalt: Hinweise aus Lager Schmidt (Vorlage: docs/lager-schmidt.md, Abschnitt 5)
// Eigene Datei, damit hinweise.js übersichtlich bleibt. [Vorschlag] bei allen
// Formulierungen; die Freischaltungen folgen der Tabelle in Abschnitt 5.

HG.hinweis('tote_anrufer', {
  titel: 'Der Anruf des toten Carsten', strang: 'E',
  text: 'Heinz Schmidt: Eine Woche nach Carstens Beerdigung rief „Carsten“ an – seine Nummer, seine Stimme. Er solle alles wegwerfen, das Tagebuch zuerst. Dann hat er gelacht.',
  stichworte: ['anruf', 'schmidt', 'beerdigung']
});
HG.hinweis('dreizehn_kreuze', {
  titel: 'Dreizehn Kreuze', strang: 'D',
  text: 'Grundbuchauszug Ulmenweg 12: Carsten hat neben jedem Eigentümer, bei dem jemand im Haus starb, ein Kreuz gemacht. 13 Kreuze. Nur bei dreien steht ein Name: Gerdes, Romanow, Grest.',
  stichworte: ['kreuze', 'grundbuch', 'dreizehn'],
  schaltetFrei: ['stadtarchiv']
});
HG.hinweis('bettina_gerdes', {
  titel: 'Bettina Gerdes', strang: 'D',
  text: 'Oktober 2022: Eine 17-jährige Schülerin wird im Ulmenweg tot aufgefunden – Bettina Gerdes. „Mit dem Haus war schon immer was.“',
  stichworte: ['bettina', 'zeitungsausschnitt', '2022']
});
HG.hinweis('brigitte_gerdes', {
  titel: 'Brigitte Gerdes redet vielleicht', strang: 'D',
  text: 'Carstens Zettel: „Am Kreuzkamp 7, Unna. Brigitte G. – redet vielleicht. Peter NICHT anrufen.“',
  stichworte: ['brigitte', 'unna', 'zettel'],
  schaltetFrei: ['gerdes']
});
HG.hinweis('natascha_romanow', {
  titel: 'Natascha Romanow', strang: 'D',
  text: 'Mai 2025: Natascha Romanow (44) tot in der Eingangshalle, das Staubsaugerkabel am Treppengeländer. Offiziell ein Haushaltsunfall. Ein gelöschter Kommentar von „e.grest1900“: „Sie hat nicht aufgeräumt.“',
  stichworte: ['romanow', 'natascha', 'artikel', 'kommentar']
});
HG.hinweis('expose_spiegelzimmer', {
  titel: 'Das „Ankleidezimmer“', strang: 'D',
  text: 'Im Makler-Exposé von 2025 ist das Spiegelzimmer als „Ankleidezimmer mit Originalausstattung“ abgebildet. In einem der hinteren Spiegel: eine Frau im hellen Kleid, schärfer als die Möbel.',
  stichworte: ['expose', 'ankleidezimmer']
});
HG.hinweis('aktenzeichen_romanow', {
  titel: 'Aktenzeichen Romanow', strang: 'D/E',
  text: 'Polizeiliche Freigabe des Hauses nach dem Tod von Natascha Romanow, Az. 2025-KK11-04417. Carsten: „Nach Akte fragen.“',
  stichworte: ['aktenzeichen', 'freigabe', 'akte'],
  schaltetFrei: ['polizei']
});
HG.hinweis('bauantrag_1899', {
  titel: 'Bauantrag und Todesanzeige', strang: 'A',
  text: 'Bauantrag vom 12. Mai 1899, unterschrieben „B. Grest, Architekt“. Todesanzeige 1905: Bernward Grest verstarb „plötzlich und unerwartet“.',
  stichworte: ['bauantrag', 'todesanzeige', 'kopien']
});
HG.hinweis('pflegerin_vermisst', {
  titel: 'Elisabeths Tod 1930', strang: 'B',
  text: 'Dortmunder Zeitung, 4. März 1930: Elisabeth Grest starb am 1. März „nach langem, schwerem Leiden“. Ihre langjährige Pflegerin wird seit dem vergangenen Herbst vermisst.',
  stichworte: ['1930', 'zeitungsnotiz', 'pflegerin']
});
HG.hinweis('pflegerin_kraehe', {
  titel: 'Die Pflegerin mit der Krähe', strang: 'C',
  text: 'Fotografie um 1912: Elisabeth im Rollstuhl, dahinter eine alte Frau in schwarzem Tuch mit verwischtem Gesicht, eine Krähe auf der Schulter. Rückseite: „E. mit Pflegerin. Der Herr segne ihre Hände.“',
  stichworte: ['fotografie', 'kraehe', '1912'],
  schaltetFrei: ['friedhof']
});
HG.hinweis('taschenspiegel', {
  titel: 'Der eingewickelte Taschenspiegel', strang: 'Spiegelwelt',
  text: 'Carsten hatte einen Taschenspiegel in ein Handtuch gewickelt und mit Klebeband umwickelt. Darin sah ich für einen Augenblick ein fremdes Gesicht. Auf seinem Einkaufszettel: „Spiegel abhängen!!!“',
  stichworte: ['taschenspiegel']
});

// --- Carstens Tagebuch: jeder Eintrag ergibt einen Hinweis ---------------
HG.hinweis('tb_kauf', { titel: 'Tagebuch: Der Kauf (3.8.2025)', strang: 'E',
  text: 'Carsten kaufte das Haus für ein Drittel des Werts. Der Makler: Die Vorbesitzerin sei „verunglückt“, das Haus „etwas eigen“.', stichworte: ['kauf', 'makler'] });
HG.hinweis('tb_lavendel', { titel: 'Tagebuch: Lavendel um drei (21.8.2025)', strang: 'E',
  text: 'Jede Nacht gegen drei Uhr roch es nach Lavendel – Carsten besaß nichts mit Lavendel.', stichworte: ['lavendel'] });
HG.hinweis('tb_spiegelzimmer', { titel: 'Tagebuch: Die Tapetentür (9.9.2025)', strang: 'E',
  text: 'Hinter der Tapete im ersten Stock: eine Tür zu einem Zimmer voller Spiegel, alle mit Bettlaken verhängt – wohl von Natascha Romanow.', stichworte: ['tapetentuer', 'laken'] });
HG.hinweis('fremde_nummern', { titel: 'Das Haus benutzt fremde Nummern', strang: 'E',
  text: 'Carsten bekam eine SMS „von Peter Gerdes“ („Grüßen Sie Bettina“), die Peter nie geschrieben hat – und später einen Anruf „von Peter“, der längst in Portugal lebt. Das Haus schreibt und ruft mit fremden Nummern und Stimmen an.',
  stichworte: ['nummern', 'sms', 'peter'] });
HG.hinweis('tb_dreizehn', { titel: 'Tagebuch: Dreizehn (18.11.2025)', strang: 'D',
  text: 'Im Stadtarchiv zählte Carsten die Todesfälle im Haus. Er hörte bei dreizehn auf, „weil ich nicht weiterzählen will“.', stichworte: ['zaehlen', 'todesfaelle'] });
HG.hinweis('tb_mutter', { titel: 'Tagebuch: Mutter ruft an (24.12.2025)', strang: 'E',
  text: 'Heiligabend 23:40: Carstens Mutter, seit 2011 tot, ruft an – von seiner eigenen Festnetznummer. Das Zimmer oben sei „nicht für ihn gemacht“.', stichworte: ['mutter', 'heiligabend'] });
HG.hinweis('tb_bleib', { titel: 'Tagebuch: „Bleib.“ (11.2.2026)', strang: 'E',
  text: 'Carsten mietete das Lager, weil er glaubte, das Haus lese mit. In seinem Notizbuch stand in seiner eigenen Schrift ein Wort, das er nie geschrieben hatte: „Bleib.“', stichworte: ['bleib'] });
HG.hinweis('tb_pistole', { titel: 'Tagebuch: Die Pistole (3.4.2026)', strang: 'E',
  text: 'Nachts schwere Schritte auf der Treppe, dann das Quietschen der Tapetentür. Carsten kaufte eine Pistole ohne Papiere. Die Schritte gingen durch ihn hindurch. Die Waffe ließ er im Lager.', stichworte: ['pistole', 'schritte'] });
HG.hinweis('tb_brand_plan', { titel: 'Tagebuch: Es muss brennen (19.6.2026)', strang: 'E',
  text: 'Carsten plante, das Haus mit sechzig Litern Benzin anzuzünden – „die Halle und die Treppe. Und das Zimmer.“', stichworte: ['brand', 'benzin'] });
HG.hinweis('tb_brand', { titel: 'Tagebuch: Der gescheiterte Brand (14.8.2026)', strang: 'E',
  text: 'Ein falscher Anruf hielt Carsten vier Stunden auf, danach waren die Streichhölzer nass – in einer verschlossenen Packung. „Sie wollte nicht, dass das Haus brennt.“', stichworte: ['nass', 'gescheitert'] });
HG.hinweis('drei_regeln', { titel: 'Carstens drei Regeln',
  text: 'Geh nicht nachts hinein. Sieh nicht zu lange in die Spiegel. Glaub keiner Nachricht und keinem Anruf, die du nicht selbst überprüft hast. Auch nicht von mir.', stichworte: ['regeln'] });
HG.hinweis('von_drueben', { titel: 'Das Rasiermesser kommt „von drüben“', strang: 'E/Spiegelwelt',
  text: '7.10.2026, mit links geschrieben: „Sie“ hat Carsten ein Rasiermesser mit Perlmuttgriff geschenkt, Gravur 1906. Niemand hat es gekauft. „Es ist von DRÜBEN. Sie sagt, es tut nicht weh.“', stichworte: ['drueben', 'geschenk', 'perlmutt'] });
HG.hinweis('tagebuch_willkommen', { titel: 'Die letzte Seite',
  text: 'Auf der letzten Seite von Carstens Tagebuch steht in fremder, altmodischer Handschrift: „Willkommen zu Hause.“ Dieselben Worte wie in der SMS beim ersten Betreten des Hauses.', stichworte: ['willkommen', 'letzte'] });

// --- Schlussfolgerungen ----------------------------------------------
HG.schluss('das_haus_ruft_an', {
  aus: ['tote_anrufer', 'fremde_nummern'],
  titel: 'Das Haus ruft an',
  text: 'Carsten rief Schmidt nach seinem Tod an. „Peter Gerdes“ schrieb SMS, die er nie geschrieben hat. Es sind immer Stimmen und Nummern, denen man vertraut. Carsten hatte recht: Keiner Nachricht trauen, die ich nicht selbst überprüft habe.'
});
HG.schluss('die_pflegerin', {
  aus: ['pflegerin_kraehe', 'pflegerin_vermisst'],
  titel: 'Die verschwundene Pflegerin',
  text: 'Die alte Frau mit der Krähe pflegte Elisabeth jahrzehntelang – und verschwand im Herbst vor Elisabeths Tod spurlos. Wer war sie?'
});

// --- Wohnung Gerdes ----------------------------------------------------
HG.hinweis('brigitte_altenheim', {
  titel: 'Brigitte schickt mich ins Altenheim', strang: 'D',
  text: 'Brigitte Gerdes will nicht über das Haus reden. Aber: „Fahren Sie ins Altenheim. Ich sag Ihnen nicht, zu wem. Sie werden’s merken.“',
  stichworte: ['brigitte', 'altenheim'],
  schaltetFrei: ['altenheim']
});
