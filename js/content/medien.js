// Haus Grest – Inhalt: Zuordnung von Bildern und Geräuschen
// Welche Dinge sind Fundstücke mit eigenem Bild, welche Dinge machen Geräusche?
// Dateinamen und Prompts: docs/medien-liste.md. Fehlende Dateien werden still ignoriert.
// Muss nach den Inhaltsdateien mit den Dingen geladen werden.
(function () {

  // Fundstücke: beim Untersuchen/Lesen erscheint assets/bilder/ding-<id>.webp|jpg|png groß im Text
  [
    'notarbrief', 'testament',                                   // Prolog
    'brief', 'portraet', 'rasiermesser',                        // Haus Grest (der Bauplan hat eigene Blätter: ding-bauplan-<stockwerk>)
    'grundbuchauszug', 'zeitung_2022', 'zettel_unna',   // Karton GERDES
    'trauerkarte', 'referat_bettina',                    // Wohnung Gerdes
    'artikel_2025', 'expose', 'freigabe',                              // Karton ROMANOW
    'archivkopien', 'zeitung_1930', 'foto_1912',                                       // Karton GREST
    'taschenspiegel', 'pistole',                                     // Küche, Schuhkarton
    'bauakte',                                                                         // Stadtverwaltung
    'kaestchen', 'zirkel', 'brief_1905', 'ehering',                                    // Bernwards Kästchen
    'gebetbuch', 'vogelkiste', 'kuehlschrankzettel', 'notenheft', 'tinktur',           // Erdgeschoss Nord und Ost
    'elisabeths_tagebuch', 'kraeuterbuch', 'brinkhoff_plaene', 'puppenhaus', 'haarspange', 'kinderbuch',   // Obergeschoss
    'stimmgabel', 'spachtel', 'laser', 'messnotizen',
    'ritzung', 'taschenuhr', 'messprotokolle', 'taschenkalender',                        // Dachboden
    'ermittlungsakte', 'uebergabeprotokoll', 'foto_familienfeier', 'carstens_schluessel', 'nachlass_karton',   // Polizeiwache
    'oelkanne', 'fingerhut', 'koffer', 'grubenlampe', 'hallmann_kiste', 'silberloeffel', 'ohrring',                // weitere Dinge mit Bild
    'kalender_kraehe', 'naegel', 'vorschlaghammer', 'salztopf', 'weinregale'                                         // Keller und Ritualraum
  ].forEach(function (id) { if (HG.daten.dinge[id]) HG.daten.dinge[id].fundstueck = true; });
  // Tagebuch: Papier-Hintergrund ding-tagebuch-seite (ordentlich) bzw. ding-tagebuch-seite-spaet (Seiten mit papier: 'spaet')

  // Geräusche an Dingen: assets/sound/effekt-<name>.ogg|mp3
  var GERAEUSCH = {
    haustuer: { oeffnen: 'tuer-knarren', aufschliessen: 'schluessel' },
    eichentuer: { oeffnen: 'tuer-knarren', aufschliessen: 'schluessel' },
    c214_tuer: { oeffnen: 'stahltuer', aufschliessen: 'vorhaengeschloss' },
    kommodenschublade: { oeffnen: 'schublade' },
    schreibtischschublade: { oeffnen: 'schublade', aufschliessen: 'schluessel' },
    kerze: { anzuenden: 'streichholz', loeschen: 'auspusten' },
    gluehbirne: { ziehen: 'zugschnur', anzuenden: 'zugschnur', loeschen: 'zugschnur' },
    handtuchbuendel: { oeffnen: 'klebeband' },
    kuechenschublade: { oeffnen: 'schublade' },
    umschlag: { oeffnen: 'papier' },
    karton_gerdes: { oeffnen: 'karton' }, karton_romanow: { oeffnen: 'karton' },
    karton_grest: { oeffnen: 'karton' }, karton_kueche: { oeffnen: 'karton' }, schuhkarton: { oeffnen: 'karton' }
  };
  Object.keys(GERAEUSCH).forEach(function (id) { if (HG.daten.dinge[id]) HG.daten.dinge[id].geraeusch = GERAEUSCH[id]; });

  // Raum-Bildvarianten (zusätzlich zur automatischen Variante "spuk" nach einem Spuk-Ereignis)
  var halle = HG.daten.raeume.halle;
  if (halle) halle.bildVariante = function (api) { return api.eig('eichentuer', 'offen') ? 'tuer-offen' : null; };
  // Arbeitszimmer: das Rasiermesser liegt (nach dem Spuk "rasiermesser_erscheint") auf dem Schreibtisch –
  // Bild raum-arbeitszimmer-rasiermesser-nacht (Mondlicht); keine allgemeine Spuk-Variante (David, 23.11.2026)
  var arbeitszimmer = HG.daten.raeume.arbeitszimmer;
  if (arbeitszimmer) arbeitszimmer.bildVariante = function (api) { return api.eig('rasiermesser', 'ort') === 'schreibtisch' ? 'rasiermesser' : null; };
  var hinterdiele = HG.daten.raeume.hinterdiele;
  if (hinterdiele) hinterdiele.bildVariante = function (api) { return api.eig('kraehentuer', 'verschlossen') ? null : 'tuer-offen'; };
  // Keller: das Loch in der Westwand, der zerstörte Kreis (keller.js)
  var heizungskeller = HG.daten.raeume.heizungskeller;
  if (heizungskeller) heizungskeller.bildVariante = function (api) { return api.flag('wand_durch') ? 'durch' : null; };
  var ritualraum = HG.daten.raeume.ritualraum;
  if (ritualraum) ritualraum.bildVariante = function (api) { return api.flag('kreis_gebrochen') ? 'gebrochen' : null; };
})();
