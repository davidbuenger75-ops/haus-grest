// Haus Grest – Engine: Parser
// Zerlegt deutsche Eingaben in Befehle und löst Wörter zu Dingen auf.
//
// Ablauf:  Eingabe -> zerlege() -> Liste von Token-Befehlen
//          -> analysiere() -> {aktion, np1, np2, prep, prep2, ...}
//          -> aufloesen() (Wörter -> Ding-IDs, mit Rückfrage bei Mehrdeutigkeit)
(function (HG) {
  'use strict';

  var T = HG.text;
  function eig(id, k) { return HG.zustand.eig(id, k); }
  function D(id) { return HG.daten.dinge[id]; }
  function L(s) { return s.split(' '); }

  // -----------------------------------------------------------------
  // Verb-Wortschatz
  //  a     = Aktion (siehe aktionen.js)
  //  w     = Verbwörter (normalisiert: ae/oe/ue/ss)
  //  p     = abtrennbarer Partikel, der vorhanden sein MUSS ("zünde ... an")
  //  o     = 0 kein Objekt, 1 Objekt nötig, '?' Objekt optional
  //  vor   = Präpositionen direkt nach dem Verb ("schau UNTER ...")
  //  vorPflicht = Eintrag passt nur, wenn so eine Präposition da ist
  //  vorAktion  = andere Aktion je nach Präposition
  //  p2    = Präpositionen, die ein zweites Objekt einleiten ("... MIT dem Schlüssel")
  //  p2Text= das zweite "Objekt" ist ein freies Thema (fragen nach ...)
  //  mehr  = mehrere Objekte / "alles" erlaubt
  //  doppel= zwei Objekte ohne Präposition möglich ("gib dem Mann den Brief")
  //  text  = freier Text statt Objekt (schreiben, sagen)
  //  meta  = Meta-Befehl (kostet keinen Zug, wird nicht rückgängig gemacht)
  // -----------------------------------------------------------------
  var SCHAU = L('schau schaue schauen sieh siehe sehen guck gucke gucken blick blicke blicken');
  var VERBEN = [
    // Meta
    { a: 'hilfe', w: L('hilfe help h ? befehle anleitung'), o: '?', meta: true, text: true },
    { a: 'inventar', w: L('inventar i inv besitz'), o: 0, meta: true },
    { a: 'notizbuch', w: L('notizbuch notizen nb hinweise tagebuch'), o: 0, meta: true },
    { a: 'karte', w: L('karte map'), o: 0, meta: true },
    { a: 'werte', w: L('werte status zustand'), o: 0, meta: true },
    { a: 'speichern', w: L('speichern speichere speicher sichern sichere save'), o: '?', text: true, meta: true },
    { a: 'laden', w: L('laden lade lad load'), o: '?', text: true, meta: true },
    { a: 'rueckgaengig', w: L('rueckgaengig undo zurueck'), o: 0, meta: true },
    { a: 'neustart', w: L('neustart neubeginn restart'), o: '?', text: true, meta: true },
    { a: 'nochmal', w: L('nochmal g wiederhole wiederholen'), o: 0, meta: true },
    { a: 'zeit', w: L('zeit uhrzeit uhr tageszeit spaet'), o: 0, meta: true },
    { a: 'nachrichten', w: L('nachrichten sms posteingang'), o: 0, meta: true },
    { a: 'fotos', w: L('fotos galerie'), o: 0, meta: true },
    { a: 'anrufliste', w: L('anrufe anrufliste'), o: 0, meta: true },

    // Umsehen und Untersuchen
    { a: 'schauen', w: SCHAU, p: 'um', o: 0 },
    { a: 'untersuchen', w: SCHAU, p: 'an', o: 1 },
    { a: 'untersuchen', w: SCHAU, vor: L('auf durch aus'), vorPflicht: true, o: 1 },
    { a: 'hineinschauen', w: SCHAU.concat(L('spaehe spaeh')), vor: L('in'), vorPflicht: true, o: 1 },
    { a: 'unterschauen', w: SCHAU.concat(L('spaehe spaeh')), vor: L('unter'), vorPflicht: true, o: 1 },
    { a: 'hinterschauen', w: SCHAU.concat(L('spaehe spaeh')), vor: L('hinter'), vorPflicht: true, o: 1 },
    { a: 'schauen', w: SCHAU.concat(L('l umschauen umsehen')), o: 0 },
    { a: 'untersuchen', w: SCHAU, o: 1 },
    { a: 'hineinschauen', w: L('betrachte betracht untersuche untersuch mustere'), vor: L('in'), vorPflicht: true, o: 1 },
    { a: 'untersuchen', w: L('untersuche untersuch untersuchen betrachte betracht betrachten x pruefe pruef pruefen inspiziere inspizier besieh beschau beschaue mustere muster begutachte'), o: 1 },
    { a: 'durchsuchen', w: L('durchsuche durchsuch durchsuchen durchwuehle durchwuehl durchstoebere filze'), o: 1 },
    { a: 'durchsuchen', w: L('such suche suchen wuehl wuehle stoebere stoebern'), vor: L('in'), vorPflicht: true, o: 1 },
    { a: 'unterschauen', w: L('such suche suchen'), vor: L('unter'), vorPflicht: true, o: 1 },
    { a: 'hinterschauen', w: L('such suche suchen'), vor: L('hinter'), vorPflicht: true, o: 1 },
    { a: 'durchsuchen', w: L('such suche suchen'), p: 'ab', o: 1 },
    { a: 'durchsuchen', w: L('such suche suchen'), o: 1 },
    { a: 'lesen', w: L('lies lese lesen'), o: 1 },

    // Nehmen und Ablegen
    { a: 'abnehmen', w: L('nimm nehme nehm nehmen hol hole'), p: 'ab', o: 1 },
    { a: 'nehmen', w: L('nimm nehme nehm nehmen hol hole holen schnapp schnappe greif greife ergreife ergreif pack packe klau klaue'), o: 1, mehr: true, p2: L('aus von vom') },
    { a: 'nehmen', w: L('heb hebe heben'), p: 'auf', o: 1, mehr: true },
    { a: 'nehmen', w: L('steck stecke stecken'), p: 'ein', o: 1, mehr: true },
    { a: 'nehmen', w: L('aufheben einstecken mitnehmen nimmmit'), o: 1, mehr: true },
    { a: 'nehmen', w: L('nimm nehme'), p: 'mit', o: 1, mehr: true },
    { a: 'nehmen', w: L('nimm nehme nehm hol hole'), p: 'heraus', o: 1, mehr: true, p2: L('aus') },   // "nimm das Foto heraus"
    { a: 'nehmen', w: L('nimm nehme nehm hol hole'), p: 'raus', o: 1, mehr: true, p2: L('aus') },
    { a: 'nehmen', w: L('hol hole zieh ziehe'), p: 'hervor', o: 1, mehr: true, p2: L('aus unter') },
    { a: 'anheben', w: L('heb hebe heben'), p: 'hoch', o: 1 },
    { a: 'anheben', w: L('heb hebe heben'), p: 'an', o: 1 },
    { a: 'anheben', w: L('heb hebe heben anheben hochheben lupfe luefte lueft'), o: 1 },
    { a: 'anheben', w: L('klapp klappe schlag schlage'), p: 'um', o: 1 },
    { a: 'ablegen', w: L('leg lege legen stell stelle stellen setz setze'), p: 'ab', o: 1, mehr: true },
    { a: 'ablegen', w: L('lass lasse'), p: 'fallen', o: 1, mehr: true },
    { a: 'behandeln', w: L('lass lasse'), p: 'behandeln', o: 0 },   // "lass dich behandeln" (Krankenhaus)
    { a: 'behandeln', w: L('lass lasse'), p: 'verarzten', o: 0 },
    { a: 'ablegen', w: L('wirf werfe'), p: 'weg', o: 1, mehr: true },
    { a: 'ablegen', w: L('ablegen fallenlassen wegwerfen'), o: 1, mehr: true },
    { a: 'legen', w: L('leg lege legen stell stelle stellen steck stecke stecken tu tue pack packe setz setze wirf werfe'), o: 1, mehr: true, p2: L('in auf unter hinter') },
    { a: 'ablegen', w: L('leg lege legen stell stelle stellen'), o: 1, mehr: true },

    // Öffnen, Schließen, Schlüssel
    { a: 'aufschliessen', w: L('schliess schliesse schliessen sperr sperre'), p: 'auf', o: 1, p2: L('mit') },
    { a: 'abschliessen', w: L('schliess schliesse schliessen sperr sperre'), p: 'ab', o: 1, p2: L('mit') },
    { a: 'aufschliessen', w: L('aufschliessen entriegle entriegel entriegeln aufsperren'), o: 1, p2: L('mit') },
    { a: 'abschliessen', w: L('abschliessen verriegle verriegel verriegeln verschliesse verschliess zusperren'), o: 1, p2: L('mit') },
    { a: 'oeffnen', w: L('mach mache machen zieh ziehe klapp klappe reiss reisse stoss stosse'), p: 'auf', o: 1 },
    { a: 'oeffnen', w: L('zieh ziehe'), p: 'heraus', o: 1 },
    { a: 'oeffnen', w: L('zieh ziehe'), p: 'raus', o: 1 },
    { a: 'oeffnen', w: L('oeffne oeffn oeffnen aufmachen'), o: 1, p2: L('mit') },
    { a: 'schliessen', w: L('mach mache machen klapp klappe schieb schiebe drueck druecke'), p: 'zu', o: 1 },
    { a: 'schliessen', w: L('schliess schliesse schliessen zumachen'), o: 1 },

    // Bewegen
    { a: 'druecken', w: L('drueck druecke druecken press presse betaetige'), vor: L('auf gegen'), o: 1 },
    { a: 'ziehen', w: L('zieh ziehe ziehen zerr zerre'), vor: L('an'), o: 1, p2: L('mit') },   // "zieh kette mit hakenstange"
    { a: 'umdrehen', w: L('dreh drehe drehen wend wende wenden'), p: 'um', o: '?' },   // "dreh das Foto um", "dreh dich um"
    { a: 'umdrehen', w: L('wend wende wenden umdrehen umwenden'), o: 1 },
    { a: 'einstellen', w: L('dreh drehe drehen'), o: 1, p2: L('auf'), p2Text: true },   // "drehe ringe auf 1205" (Zahlenschloss)
    { a: 'drehen', w: L('dreh drehe drehen kurbel kurble'), o: 1 },
    { a: 'knacken', w: L('knack knacke knacken'), o: 1, p2: L('mit') },
    { a: 'spielen', w: L('spiel spiele spielen klimper klimpere'), vor: L('auf an'), o: 1 },   // "spiele flügel", "spiel auf dem klavier"
    { a: 'oelen', w: L('oel oele oelen schmier schmiere schmieren fette fetten'), o: 1, p2: L('mit') },   // "öle den Riegel"
    { a: 'nahansicht', w: L('nahansicht'), o: 1 },
    { a: 'entziffern', w: L('entziffer entziffere entziffern'), o: '?', text: true },   // gesperrte Buchseiten
    { a: 'ersteHilfe', w: L('versorg versorge versorgen verarzt verarzte verarzten'), o: '?', text: true },
    { a: 'schieben', w: L('schieb schiebe schieben rueck ruecke'), p: 'beiseite', o: 1 },
    { a: 'schieben', w: L('schieb schiebe schieben rueck ruecke'), p: 'weg', o: 1 },
    { a: 'schieben', w: L('schieb schiebe schieben verschieb verschiebe rueck ruecke verrueck verruecke'), o: 1 },

    // Licht
    { a: 'anzuenden', w: L('zuend zuende zuenden steck stecke'), p: 'an', o: 1, p2: L('mit') },
    { a: 'anzuenden', w: L('mach mache machen'), p: 'an', o: 1, p2: L('mit') },
    { a: 'anzuenden', w: L('anzuenden entzuende entzuend entfache entfach'), o: 1, p2: L('mit') },
    { a: 'loeschen', w: L('blas blase puste pust mach mache'), p: 'aus', o: 1 },
    { a: 'loeschen', w: L('loesch loesche loeschen ersticke ausblasen auspusten'), o: 1 },

    // Sinne
    { a: 'horchen', w: L('horch horche horchen lausch lausche lauschen'), vor: L('an'), o: '?', blind: true },
    { a: 'horchen', w: L('hoer hoere hoeren'), p: 'zu', o: '?', blind: true },
    { a: 'horchen', w: L('hoer hoere hoeren'), vor: L('an'), o: '?', blind: true },
    { a: 'riechen', w: L('riech rieche riechen schnupper schnuppere schnueffel schnueffle'), vor: L('an'), o: '?', blind: true },
    { a: 'tasten', w: L('tast taste tasten fuehl fuehle fuehlen befuehle befuehl betaste betast beruehre beruehr beruehren streichle'), vor: L('an nach'), o: '?', blind: true },
    { a: 'tasten', w: L('tast taste tasten'), p: 'ab', o: 1, blind: true },             // "taste das Kästchen ab"
    { a: 'tasten', w: L('tast taste'), p: 'umher', o: 0, blind: true },
    { a: 'schuetteln', w: L('schuettel schuettle schuetteln ruettel ruettle ruetteln'), o: 1 },
    { a: 'tasten', w: L('tast taste'), p: 'herum', o: 0, blind: true },
    { a: 'klopfen', w: L('klopf klopfe klopfen poch poche pochen'), vor: L('an auf gegen'), o: '?', blind: true },

    // Gewalt und Körper
    { a: 'zerbrechen', w: L('brich breche brechen hebel hebele'), p: 'auf', o: 1, p2: L('mit') },   // "brich das Kästchen auf"
    { a: 'zerbrechen', w: L('zerbrich zerbreche zerbrechen zerschlag zerschlage zertruemmere zertruemmer zerstoer zerstoere zerstoeren brich breche'), o: 1, p2: L('mit') },
    { a: 'zerbrechen', w: L('schlag schlage tritt'), p: 'ein', o: 1, p2: L('mit') },
    { a: 'zerbrechen', w: L('schlag schlage hau haue'), o: 1, p2: L('mit') },
    { a: 'reissen', w: L('reiss reisse reissen zerreiss zerreisse zerreissen zerr'), vor: L('an'), o: 1 },   // "reiß am Riegel"
    { a: 'reissen', w: L('reiss reisse'), p: 'ab', o: 1 },
    { a: 'reissen', w: L('reiss reisse'), p: 'heraus', o: 1 },
    { a: 'klettern', w: L('kletter klettere klettre klettern steig steige steigen klimm klimme'), vor: L('auf ueber in durch hinauf unter'), o: '?' },
    { a: 'verstecken', w: L('versteck verstecke verstecken verbirg verberge'), vor: L('unter hinter in'), o: '?' },
    { a: 'warten', w: L('wart warte warten z abwarten ausharren'), vor: L('bis auf'), o: '?', text: true },
    { a: 'schlafen', w: L('schlaf schlafe schlafen pennen penne uebernachte uebernachten nickerchen'), o: 0 },
    { a: 'schlafen', w: L('ruh ruhe'), p: 'aus', o: 0 },
    { a: 'schlafen', w: L('leg lege'), p: 'hin', o: 0 },

    // Reisen
    { a: 'fahren', w: L('fahr fahre fahren reise reis reisen'), p: 'los', o: 0 },
    { a: 'fahren', w: L('fahr fahre fahren reise reis reisen'), p: 'weg', o: 0 },
    { a: 'fahren', w: L('fahr fahre fahren reise reis reisen heimfahren losfahren wegfahren'), vor: L('zu nach in richtung'), o: '?', text: true },

    // Handy
    { a: 'rangehen', w: L('geh gehe'), p: 'ran', o: 0 },
    { a: 'rangehen', w: L('geh gehe'), p: 'dran', o: 0 },
    { a: 'rangehen', w: L('heb hebe'), p: 'ab', o: '?' },
    { a: 'rangehen', w: L('nimm nehme'), p: 'an', o: '?' },
    { a: 'rangehen', w: L('antworte antworten abheben rangehen annehmen melde'), o: '?' },
    { a: 'ablehnen', w: L('ignorier ignoriere ignorieren wegdruecken'), o: '?' },
    { a: 'ablehnen', w: L('lehn lehne'), p: 'ab', o: '?' },
    { a: 'ablehnen', w: L('drueck druecke'), p: 'weg', o: '?' },
    { a: 'anrufen', w: L('ruf rufe'), p: 'an', o: 1, text: true },
    { a: 'anrufen', w: L('ruf rufe'), p: 'zurueck', o: 1, text: true },
    { a: 'anrufen', w: L('anrufen telefonier telefoniere telefonieren waehl waehle'), vor: L('mit bei'), o: 1, text: true },
    { a: 'fotografieren', w: L('fotografier fotografiere fotografieren knips knipse photographiere filme filmen'), o: '?' },

    // Schalter (Handy-Taschenlampe, Lampen)
    { a: 'anzuenden', w: L('schalt schalte'), p: 'ein', o: 1 },
    { a: 'anzuenden', w: L('schalt schalte'), p: 'an', o: 1 },
    { a: 'loeschen', w: L('schalt schalte'), p: 'aus', o: 1 },
    { a: 'anzuenden', w: L('einschalten anschalten aktiviere'), o: 1 },
    { a: 'loeschen', w: L('ausschalten deaktiviere'), o: 1 },

    // Gespräche
    { a: 'sprechen', w: L('sprich sprech spreche sprechen red rede reden unterhalte unterhalt'), vor: L('mit zu'), o: 1, p2: L('ueber von'), p2Text: true },
    { a: 'fragen', w: L('frag frage fragen befrag befrage'), o: 1, p2: L('nach ueber zu wegen'), p2Text: true },
    { a: 'sagen', w: L('sag sage sagen ruf rufe rufen fluester fluestere schrei schreie'), o: '?', text: true, p2: L('zu') },
    { a: 'zeigen', w: L('zeig zeige zeigen'), o: 1, p2: L('an'), doppel: true },
    { a: 'entladen', w: L('entlad entlade entladen'), o: 1 },                          // "entlade die Pistole"
    { a: 'unterschreiben', w: L('unterschreib unterschreibe unterschreiben unterzeichne unterzeichnen signiere signieren'), o: '?' },   // "unterschreibe protokoll"
    { a: 'nennen', w: L('nenn nenne nennen'), o: '?' },
    { a: 'saegen', w: L('saeg saege saegen zersaeg zersaege zersaegen durchsaeg durchsaege durchsaegen'), o: 1, p2: L('mit') },   // "säge kette mit bügelsäge"
    { a: 'saegen', w: L('saeg saege'), p: 'durch', o: 1, p2: L('mit') },
    { a: 'fuellen', w: L('fuell fuelle fuellen nachfuellen'), o: 1, p2: L('in mit') },          // "fülle karbid in lampe"
    { a: 'messen', w: L('miss misse messe messen vermesse vermessen ausmessen abmessen nachmessen'), o: '?', text: true, p2: L('mit') },   // "miss raum (mit laser)"
    { a: 'messen', w: L('miss misse messe'), p: 'nach', o: '?', text: true, p2: L('mit') },
    { a: 'messen', w: L('miss misse messe'), p: 'aus', o: '?', text: true, p2: L('mit') },
    { a: 'entfernen', w: L('wisch wische kratz kratze kehr kehre feg fege tritt scharr scharre'), p: 'weg', o: 1, p2: L('mit') },   // "wische das blut weg"
    { a: 'entfernen', w: L('kratz kratze'), p: 'aus', o: 1, p2: L('mit') },
    { a: 'entfernen', w: L('entfern entferne entfernen beseitig beseitige beseitigen verwisch verwische wisch wische kratz kratze'), o: 1, p2: L('mit') },
    { a: 'streuen', w: L('streu streue streuen'), o: 1, p2: L('vor auf in an um') },              // "streue salz (vor die tür)"
    { a: 'erwaermen', w: L('erwaerm erwaerme erwaermen waerm waerme waermen halt halte halten'), o: 1, p2: L('ueber mit an vor') },   // "halte tagebuch über kerze"
    { a: 'schoepfen', w: L('schoepf schoepfe schoepfen'), o: '?', p2: L('mit aus') },          // "schöpfe wasser mit eimer"
    { a: 'verhaengen', w: L('verhaeng verhaenge verhaengen bedeck bedecke bedecken'), o: 1, p2: L('mit') },   // "verhänge spiegel (mit laken)"                                  // "nenne sie beim Namen" (Diener bannen)
    { a: 'geben', w: L('gib gebe'), p: 'ab', o: 1 },                                     // "gib die pistole ab"
    { a: 'geben', w: L('gib gebe geben reich reiche ueberreiche biete'), o: 1, p2: L('an'), doppel: true },

    // Werkzeuge und Notizen
    { a: 'benutzen', w: L('benutz benutze benutzen verwende verwend verwenden nutz nutze nutzen gebrauche'), o: 1, p2: L('mit an auf bei fuer in') },
    { a: 'kombinieren', w: L('kombinier kombiniere kombinieren verbind verbinde verbinden vergleich vergleiche'), o: 1, p2: L('mit'), hinweise: true },
    { a: 'schreiben', w: L('schreib schreibe schreiben kritzel kritzle notier notiere'), o: '?', text: true, p2: L('auf in an') },

    // Auspacken, Codes, Bewegungsmelder, Bücher
    { a: 'oeffnen', w: L('pack packe wickel wickle'), p: 'aus', o: 1 },
    { a: 'oeffnen', w: L('auspacken auswickeln entpacke'), o: 1 },
    { a: 'eintippen', w: L('gib gebe'), p: 'ein', o: 1, text: true },
    { a: 'eintippen', w: L('tipp tippe tippen eintippen'), o: 1, text: true },
    { a: 'winken', w: L('wink winke winken fuchtel fuchtle spring springe huepf huepfe beweg bewege'), o: '?' },
    { a: 'buchseite', w: L('blaetter blaettere blaettern'), o: '?', text: true },

    // Gehen
    { a: 'gehen', w: L('geh gehe gehen lauf laufe laufen renn renne schleich schleiche wander wandere flieh fliehe eil eile betritt betrete betreten tritt folge'), vor: L('nach in durch zu richtung'), o: '?' }
  ];

  var VERB_MAP = {};
  VERBEN.forEach(function (e) {
    e.w.forEach(function (w) { (VERB_MAP[w] = VERB_MAP[w] || []).push(e); });
  });

  var PARTIKEL = {}; VERBEN.forEach(function (e) { if (e.p) PARTIKEL[e.p] = true; });
  var ALLE_P2 = { mit: 1, aus: 1, von: 1, in: 1, auf: 1, unter: 1, hinter: 1, an: 1, nach: 1, ueber: 1, zu: 1 };

  var ARTIKEL = L('der die das den dem des ein eine einen einem einer eines mein meine meinen meinem meiner dein deine deinen deinem diese dieser dieses diesen diesem jene jenen jenem');
  var FUELL = L('bitte ich mal doch jetzt nun noch einmal einfach vorsichtig langsam leise schnell genau ganz kurz wieder sofort her etwas dort da selbst also');
  var REFLEXIV = L('dich mich dir mir');
  var PRONOMEN = { es: ['n', 'letzt'], ihn: ['m', 'letzt'], ihm: ['m', 'n', 'letzt'], sie: ['f', 'pl', 'letzt'], ihr: ['f', 'letzt'], ihnen: ['pl', 'letzt'] };
  var ZUSAMMEN = {
    ins: ['in', 'das'], im: ['in', 'dem'], zum: ['zu', 'dem'], zur: ['zu', 'der'], am: ['an', 'dem'], ans: ['an', 'das'],
    aufs: ['auf', 'das'], unterm: ['unter', 'dem'], unters: ['unter', 'das'], hinterm: ['hinter', 'dem'], hinters: ['hinter', 'das'],
    vom: ['von', 'dem'], beim: ['bei', 'dem'], durchs: ['durch', 'das'], uebers: ['ueber', 'das'], fuers: ['fuer', 'das'], ueberm: ['ueber', 'dem']
  };

  // -----------------------------------------------------------------
  // Wortschatz der Dinge (wird beim ersten Gebrauch aufgebaut)
  // -----------------------------------------------------------------
  var LEX = null;
  var ENDUNGEN = ['', 'e', 'en', 'er', 'es', 'em'];

  function adjFormen(stamm) {
    stamm = T.norm(stamm);
    var f = {};
    ENDUNGEN.forEach(function (e) { f[T.norm(T.adjektiv(stamm, e))] = 1; f[stamm + e] = 1; });
    return Object.keys(f);
  }

  // Bindewörter innerhalb einer Wortgruppe ("der Brief von 1905") – zählen beim Vergleich nicht mit
  var BINDEWORT = { von: 1, zu: 1 };   // "Brief von 1905", "Glastür zum Salon"

  function baueLexikon() {
    LEX = { nomen: {}, adj: {}, bekannt: {}, andeutung: {} };
    Object.keys(HG.daten.dinge).forEach(function (id) {
      var d = HG.daten.dinge[id];
      var n = {}, a = {};
      (d.woerter || []).concat(d.nomen ? [d.nomen] : []).forEach(function (w) {
        w = T.norm(w); n[w] = 1;
        if (d.genus === 'pl') n[w + 'n'] = 1;
      });
      // Namenszusatz ("von 1905") gehört zum Namen: seine Wörter treffen das Ding
      if (typeof d.zusatz === 'string') T.norm(d.zusatz).split(/\s+/).forEach(function (w) { if (w && !BINDEWORT[w] && ARTIKEL.indexOf(w) < 0) n[w] = 1; });
      (d.adj || []).concat(d.adjektive || []).forEach(function (s) { adjFormen(s).forEach(function (f) { a[f] = 1; }); });
      LEX.nomen[id] = n; LEX.adj[id] = a;
      Object.keys(n).concat(Object.keys(a)).forEach(function (w) { LEX.bekannt[w] = 1; });
      // Verstecktes, auf das ein Text hindeutet ("etwas Hartes"): versteckt: { andeutung: ['hart', 'schwer', 'taschentuch'] }
      var v = d.versteckt && typeof d.versteckt === 'object' ? d.versteckt : null;
      if (v && v.andeutung) {
        var an = {};
        v.andeutung.forEach(function (s) { adjFormen(s).forEach(function (f) { an[f] = 1; LEX.bekannt[f] = 1; }); });
        LEX.andeutung[id] = an;
      }
    });
    Object.keys(HG.daten.raeume).forEach(function (id) {
      var r = HG.daten.raeume[id];
      (r.woerter || []).concat([r.name]).forEach(function (w) { T.norm(w).split(' ').forEach(function (x) { LEX.bekannt[x] = 1; }); });
    });
    Object.keys(HG.daten.hinweise).forEach(function (id) {
      (HG.daten.hinweise[id].stichworte || []).forEach(function (w) { LEX.bekannt[T.norm(w)] = 1; });
    });
  }
  function lex() { if (!LEX) baueLexikon(); return LEX; }

  /** Nomen auch mit Beugungsendung erkennen (Streichhölzern, Tisches …) */
  function nomenForm(n, w) {
    if (n[w]) return true;
    var m = /^(.{3,}?)(en|n|es|s|e)$/.exec(w);
    return !!(m && n[m[1]]) || !!(/en$/.test(w) && n[w.slice(0, -1)]);
  }

  function istBekannt(w) {
    return !!(lex().bekannt[w] || nomenForm(lex().bekannt, w) || VERB_MAP[w] || HG.welt.RICHTUNG_WORT[w] || PRONOMEN[w] ||
      ARTIKEL.indexOf(w) >= 0 || FUELL.indexOf(w) >= 0 || ALLE_P2[w] || PARTIKEL[w] ||
      w === 'und' || w === ',' || w === 'alles' || w === 'alle' || w === 'ausser' || /^#|^§/.test(w));
  }

  /** Passt eine Wortgruppe (ohne Artikel) zu einem Ding? 0 = nein, 1 = nur Adjektive, 2 = mit Nomen */
  function passt(id, woerter) {
    var l = lex(), n = l.nomen[id], a = l.adj[id], mitNomen = false;
    if (!n) return 0;
    for (var i = 0; i < woerter.length; i++) {
      var w = woerter[i];
      if (BINDEWORT[w] && i > 0 && i < woerter.length - 1) continue;
      if (nomenForm(n, w)) mitNomen = true;
      else if (!a[w]) return 0;
    }
    return mitNomen ? 2 : 1;
  }

  /** Versteckte Dinge mit passender Andeutung, deren Versteck hier zugänglich ist. */
  function angedeutetes(woerter, umfeld) {
    var an = lex().andeutung;
    return Object.keys(an).filter(function (id) {
      var v = eig(id, 'versteckt');
      if (!v || typeof v !== 'object' || umfeld.indexOf(v.bei) < 0) return false;
      if (v.nurOffen && !HG.welt.innenZugaenglich(v.bei)) return false;
      return woerter.every(function (w) { return an[id][w]; });
    });
  }

  /** Gehört die Präposition an Stelle x zum Namen eines Dings in der Nähe ("Brief von 1905")? */
  function gehoertZumDing(r, x, p2) {
    if (!BINDEWORT[r[x]] || !HG.zustand.z) return false;
    var ende = r.length;
    for (var k = x + 1; k < r.length; k++) if (p2.indexOf(r[k]) >= 0) { ende = k; break; }
    var woerter = r.slice(0, ende).filter(function (t) { return ARTIKEL.indexOf(t) < 0; });
    return HG.welt.umfeld(true).some(function (id) { return passt(id, woerter) === 2; });
  }

  /** Wortfolge in zwei Dinge teilen, von denen genau eins eine Person ist ("brigitte die haarspange").
   *  Passt die ganze Folge schon auf ein Ding, bleibt sie ein Objekt. Rückgabe { person, ding } oder null. */
  function zweiDinge(r) {
    if (!HG.zustand.z || r.length < 2) return null;
    var um = HG.welt.umfeld(true);
    function treffer(ws) {
      ws = ws.filter(function (t) { return ARTIKEL.indexOf(t) < 0; });
      return ws.length ? um.filter(function (id) { return passt(id, ws) === 2; }) : [];
    }
    function person(ids) { return ids.some(function (id) { return HG.daten.dinge[id] && HG.daten.dinge[id].person; }); }
    if (treffer(r).length) return null;
    for (var k = 1; k < r.length; k++) {
      var a = r.slice(0, k), b = r.slice(k), ta = treffer(a), tb = treffer(b);
      if (!ta.length || !tb.length) continue;
      if (person(ta) && !person(tb)) return { person: a, ding: b };
      if (person(tb) && !person(ta)) return { person: b, ding: a };
    }
    return null;
  }

  // -----------------------------------------------------------------
  // Zerlegen in Befehle
  // -----------------------------------------------------------------
  // Häufige Befehle in Anzeigeform – für die Autovervollständigung.
  // "…" steht für das Objekt; was danach kommt, wird nach dem Objekt ergänzt.
  var VERB_LISTE = [
    'untersuche …', 'nimm …', 'öffne …', 'schließe …', 'lies …', 'durchsuche …', 'schau', 'schau in …',
    'schau unter …', 'schau hinter …', 'geh …', 'zünde … an', 'lösche …', 'schalte … ein', 'schalte … aus',
    'schließe … auf', 'schließe … ab', 'lege … ab', 'lege … in …', 'lege … auf …', 'gib … an …', 'zeige … …',
    'sprich mit …', 'frage … nach …', 'benutze …', 'kombiniere … mit …', 'drücke …', 'ziehe an …', 'drehe …', 'drehe … um', 'drehe … auf …', 'knacke …', 'öle …', 'brich … auf', 'versorge wunde', 'erste hilfe', 'entziffere …',
    'schiebe …', 'horche', 'lausche an …', 'rieche an …', 'taste …', 'taste umher', 'klopfe an …', 'zerbrich …',
    'miss …', 'entferne …', 'streue …',
    'reiße an …', 'klettere auf …', 'verstecke dich hinter …', 'warte', 'warte bis …', 'schlafe', 'fahre los',
    'fahre zu …', 'ruf … an', 'fotografiere …', 'schreibe …', 'tippe …', 'unterschreibe …', 'winke', 'blättere weiter',
    'inventar', 'notizbuch', 'karte', 'hilfe', 'speichern', 'laden', 'rückgängig', 'zeit', 'werte',
    'lies nachrichten', 'anrufliste', 'fotos'
  ];

  var P = HG.parser = {
    VERB_MAP: VERB_MAP,
    VERB_LISTE: VERB_LISTE,
    roh: {},   // normalisiertes Wort -> Originalschreibung (für Meldungen)
    texte: [], // Text in Anführungszeichen

    istVerb: function (w) { return !!VERB_MAP[w]; },
    lexikonNeu: function () { LEX = null; },

    zerlege: function (eingabe) {
      var texte = P.texte = [];
      // "24. Dezember": Punkt nach einer Zahl ist eine Ordnungszahl, kein Satzende
      eingabe = String(eingabe).replace(/(\d)\.(?=\s*[A-Za-zÄÖÜäöü])/g, '$1 ');
      var s = String(eingabe).replace(/[„“”"»«](.*?)[“”"«»]/g, function (m, t) { texte.push(t); return ' §' + (texte.length - 1) + ' '; });
      P.roh = {};
      s.split(/[\s.,;!?]+/).forEach(function (w) { if (w) P.roh[T.norm(w)] = w; });
      s = T.norm(s).replace(/[.;!]+/g, ' . ').replace(/,/g, ' , ').replace(/[()\[\]:]/g, ' ').replace(/\?/g, ' ? ');
      var roh = s.split(/\s+/).filter(Boolean);
      var tokens = [];
      roh.forEach(function (t) {
        if (ZUSAMMEN[t]) tokens.push.apply(tokens, ZUSAMMEN[t]);
        else if (t === '?' && roh.length > 1) { /* Fragezeichen am Satzende ignorieren */ }
        else tokens.push(t);
      });
      var befehle = [[]];
      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i], cur = befehle[befehle.length - 1];
        var naechst = tokens[i + 1];
        var neuerSatz = t === '.' || t === 'dann' ||
          ((t === 'und' || t === ',') && cur.length && naechst &&
            ((VERB_MAP[naechst] && !VERB_MAP[naechst][0].meta && !lex().bekannt[naechst]) ||
              (HG.welt.RICHTUNG_WORT[naechst] && HG.welt.RICHTUNG_WORT[cur[cur.length - 1]])));
        if (neuerSatz) { if (cur.length) befehle.push([]); continue; }
        cur.push(t);
      }
      return befehle.filter(function (b) { return b.length; });
    },

    /** Einen Token-Befehl analysieren -> Befehlsobjekt oder {fehler} */
    analysiere: function (tokens) {
      var reflexiv = false;
      tokens = tokens.filter(function (t) {
        if (REFLEXIV.indexOf(t) >= 0) { reflexiv = true; return false; }
        return FUELL.indexOf(t) < 0;
      });
      if (!tokens.length) return { fehler: 'Wie bitte?' };

      // Nur eine Richtung: "n", "norden", "nach norden"
      var RW = HG.welt.RICHTUNG_WORT;
      if (tokens.length === 1 && RW[tokens[0]]) return { aktion: 'gehen', richtung: RW[tokens[0]], np1: [] };
      if (tokens.length === 2 && tokens[0] === 'nach' && RW[tokens[1]]) return { aktion: 'gehen', richtung: RW[tokens[1]], np1: [] };

      // Bücher: "lies eintrag 3", "lies seite 2", "blättere weiter", "lies weiter", "lies den eintrag vom 7. oktober"
      if (/^(lies|lese|lesen|blaetter|blaettere|blaettern|schlag|schlage)$/.test(tokens[0])) {
        var bw = tokens.slice(1).filter(function (t) { return ARTIKEL.indexOf(t) < 0 && !/^(im|in|vom|von|tagebuch|buch|notizbuch)$/.test(t); });
        var hatSeite = bw.some(function (t) { return /^(eintrag|eintraege|seite|seiten|lesezeichen)$/.test(t); });
        var blaettern = /^blaetter/.test(tokens[0]);
        var MONATE = ['januar', 'februar', 'maerz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
        var monat = bw.filter(function (t) { return MONATE.indexOf(t) >= 0; })[0];
        var zahl = bw.filter(function (t) { return /^\d+$/.test(t); })[0];
        var richtung = bw.indexOf('weiter') >= 0 || bw.indexOf('vor') >= 0 || bw.indexOf('um') >= 0 || bw.indexOf('naechste') >= 0 ? 'weiter'
          : bw.indexOf('zurueck') >= 0 || bw.indexOf('vorherige') >= 0 ? 'zurueck'
          : bw.some(function (t) { return /^letzte/.test(t); }) ? 'letzte'
          : bw.some(function (t) { return /^erste/.test(t); }) ? 'erste' : null;
        if (hatSeite || blaettern || (bw.length === 1 && bw[0] === 'weiter') || (monat && zahl)) {
          var bz = monat && zahl ? { tag: zahl, monat: monat } : (zahl || richtung || (blaettern ? 'weiter' : null));
          if (bz) return { aktion: 'buchseite', eintrag: VERB_MAP.blaettere[0], np1: [], np2: [], buchZiel: bz };
        }
      }
      // "wie spät ist es?", "wieviel uhr"
      if (tokens.indexOf('spaet') >= 0 || (tokens[0] === 'wieviel' || tokens[0] === 'wie') && tokens.indexOf('uhr') >= 0) {
        return { aktion: 'zeit', eintrag: VERB_MAP.zeit[0], np1: [], np2: [] };
      }
      // "erste hilfe", "verbinde die wunde", "kümmere dich um die verletzung" -> Erste Hilfe
      if ((tokens[0] === 'erste' && tokens[1] === 'hilfe') ||
          (/^(verbind|versorg|verarzt|behandel|behandl|kuemmer|desinfizier|reinig)/.test(tokens[0]) && tokens.some(function (t) { return /^(wunde|wunden|verletzung|verletzungen|schnitt|schnittwunde|kratzer)$/.test(t); }))) {
        return { aktion: 'ersteHilfe', eintrag: VERB_MAP.versorge[0], np1: [], np2: [] };
      }
      // "untersuche X genau / gründlich" -> durchsuche X
      if (/^(untersuch|betracht|pruef)/.test(tokens[0]) && tokens.some(function (t) { return /^(genau|genauer|gruendlich|gruendlicher|naeher|eingehend)$/.test(t); })) {
        tokens = ['durchsuche'].concat(tokens.slice(1).filter(function (t) { return !/^(genau|genauer|gruendlich|gruendlicher|naeher|eingehend)$/.test(t); }));
      }
      // "stelle die ringe auf 1205" -> "drehe die ringe auf 1205" (sonst wäre es "lege … auf …")
      if (/^(stell|stelle|stellen)$/.test(tokens[0]) && /^\d+$/.test(tokens[tokens.length - 1]) && tokens.indexOf('auf') > 0) tokens[0] = 'drehe';
      // "lies foto 3", "zeig bild 2", "foto 3" -> ein Foto aus der Galerie
      if (tokens.some(function (t) { return /^(foto|fotos|bild|bilder|galerie)$/.test(t); }) && /^\d+$/.test(tokens[tokens.length - 1]) &&
          (tokens.length === 2 || /^(lies|les|zeig|zeige|oeffne|schau|betracht|betrachte|sieh)$/.test(tokens[0]))) {
        return { aktion: 'fotos', eintrag: VERB_MAP.fotos[0], np1: [tokens[tokens.length - 1]], np2: [] };
      }
      // "mach ein Foto von X" -> "fotografiere X", "mach ein Selfie"
      if (/^mach/.test(tokens[0]) && tokens.some(function (t) { return /^(foto|fotos|bild|aufnahme|selfie)$/.test(t); })) {
        var vonI = tokens.indexOf('von');
        if (tokens.indexOf('selfie') >= 0) reflexiv = true;
        tokens = ['fotografiere'].concat(vonI >= 0 ? tokens.slice(vonI + 1) : []);
      }

      // Verb vorne – oder Infinitiv am Ende ("kerze nehmen")
      if (!VERB_MAP[tokens[0]] && VERB_MAP[tokens[tokens.length - 1]]) {
        tokens = [tokens[tokens.length - 1]].concat(tokens.slice(0, -1));
      }
      var verb = tokens[0], eintraege = VERB_MAP[verb];
      if (!eintraege) {
        if (!istBekannt(verb)) return { fehler: 'Das Wort „' + T.esc(P.roh[verb] || verb) + '“ kenne ich nicht.' };
        return { fehler: 'Ich verstehe nicht, was du tun möchtest. Ein Befehl beginnt mit einem Verb, z.&nbsp;B. „untersuche ' + T.esc(P.roh[verb] || verb) + '“.' };
      }
      var rest = tokens.slice(1);

      // Abtrennbaren Partikel suchen ("schließe ... auf", "zünde ... an mit ...")
      var partikel = null, mitP = [];
      var moegliche = {}; eintraege.forEach(function (e) { if (e.p) moegliche[e.p] = true; });
      for (var i = rest.length - 1; i >= 0; i--) {
        if (moegliche[rest[i]] && (i === rest.length - 1 || ALLE_P2[rest[i + 1]] && i > 0)) {
          // Nicht als Partikel werten, wenn es eine führende Präposition ist ("schau an der Tür")
          if (i === 0 && rest.length > 1) continue;
          partikel = rest[i];
          mitP = eintraege.filter(function (e) { return e.p === partikel; });
          rest = rest.slice(0, i).concat(rest.slice(i + 1));
          break;
        }
      }
      var kandidaten = partikel ? mitP : eintraege.filter(function (e) { return !e.p; });

      for (var k = 0; k < kandidaten.length; k++) {
        var e = kandidaten[k], r = rest.slice(), prep = null;
        if (e.vor && r.length && e.vor.indexOf(r[0]) >= 0) prep = r.shift();
        else if (e.vorPflicht) continue;
        if (e.o === 0 && r.length) continue;
        var j = -1;
        if (e.p2) for (var x = (e.p2Text ? 0 : 1); x < r.length; x++) {
          // "nimm den Brief von 1905": passt die Wortfolge samt "von …" auf ein Ding, ist sie EIN Objekt
          if (e.p2.indexOf(r[x]) >= 0 && (e.p2Text || !gehoertZumDing(r, x, e.p2))) { j = x; break; }
        }
        var np1 = j >= 0 ? r.slice(0, j) : r;
        var befehl = {
          aktion: e.a, eintrag: e, verb: verb, partikel: partikel, prep: prep, reflexiv: reflexiv,
          np1: np1, prep2: j >= 0 ? r[j] : null, np2: j >= 0 ? r.slice(j + 1) : []
        };
        // "fotografiere den Raum" = Foto ohne bestimmtes Ding
        if (e.a === 'fotografieren' && np1.length && np1.every(function (t) { return /^(raum|zimmer|umgebung|hier|alles|szene|gegend|ort|den|das|die|dem)$/.test(t); })) befehl.np1 = [];
        // "gib dem Mann den Brief"
        if (e.doppel && j < 0) {
          var art = []; np1.forEach(function (t, idx) { if (ARTIKEL.indexOf(t) >= 0) art.push(idx); });
          if (art.length >= 2) {
            var a = np1.slice(art[0], art[1]), b = np1.slice(art[1]);
            var bDat = ['dem', 'einem'].indexOf(b[0]) >= 0;
            befehl.np1 = bDat ? a : b; befehl.np2 = bDat ? b : a; befehl.prep2 = 'an';
          } else {
            // "zeige brigitte die haarspange", "gib jansen pistole": zwei Dinge ohne zwei Artikel – die Person bekommt
            var tr = zweiDinge(np1);
            if (tr) { befehl.np1 = tr.ding; befehl.np2 = tr.person; befehl.prep2 = 'an'; }
          }
        }
        return befehl;
      }
      if (kandidaten.length && kandidaten[0].o === 0) return { fehler: 'Dieser Befehl braucht keine weiteren Wörter. Versuche einfach „' + T.esc(P.roh[verb] || verb) + '“.' };
      return { fehler: 'Diesen Satz verstehe ich nicht ganz. Versuche es einfacher, z.&nbsp;B. „schau unter den Teppich“.' };
    },

    /** Text eines Befehls (für schreiben/sagen) in Originalschreibung. */
    freierText: function (tokens) {
      var plain = [];
      tokens.forEach(function (w) {
        var m = /^§(\d+)$/.exec(w);
        plain.push(m ? P.texte[+m[1]] : (P.roh[w] || w));
      });
      return plain.join(' ');
    },

    /**
     * Wortgruppe zu Ding-IDs auflösen.
     * opt: { blind, universum: [ids], bevorzuge: fn(id)->bool, mehr: bool }
     * Rückgabe: {ids:[...]} | {alles:true, ausser:[ids]} | {fehler:'...'} | {frage:'...', kandidaten:[ids]}
     */
    aufloesen: function (np, opt) {
      opt = opt || {};
      var woerter = np.filter(function (t) { return ARTIKEL.indexOf(t) < 0; });
      if (!woerter.length) return { leer: true };

      // "alles", "alles außer X"
      if (woerter[0] === 'alles' || woerter[0] === 'alle') {
        if (!opt.mehr) return { fehler: '„Alles“ kannst du bei diesem Befehl nicht verwenden.' };
        var ausser = [];
        if (woerter[1] === 'ausser' && woerter.length > 2) {
          var r0 = P.aufloesen(woerter.slice(2), Object.assign({}, opt, { mehr: true }));
          if (r0.fehler || r0.frage) return r0;
          ausser = r0.ids || [];
        }
        return { alles: true, ausser: ausser };
      }

      // Aufzählung "A und B", "A, B"
      var gruppen = [[]];
      woerter.forEach(function (w) { if (w === 'und' || w === ',') gruppen.push([]); else gruppen[gruppen.length - 1].push(w); });
      gruppen = gruppen.filter(function (g) { return g.length; });
      if (gruppen.length > 1 && !opt.mehr) return { fehler: 'Das kannst du nur mit einem Ding auf einmal tun.' };

      var umfeld = opt.universum || HG.welt.umfeld(opt.blind);
      var ids = [], aufdecken = [];
      for (var gi = 0; gi < gruppen.length; gi++) {
        var g = gruppen[gi];

        if (g.length === 1 && /^#/.test(g[0])) { ids.push(g[0].slice(1)); continue; }

        if (g.length === 1 && PRONOMEN[g[0]]) {
          var pz = HG.zustand.z.pronomen, gefunden = null;
          PRONOMEN[g[0]].some(function (k) { if (pz[k]) { gefunden = pz[k]; return true; } return false; });
          if (!gefunden) return { fehler: 'Ich weiß nicht, was du mit „' + g[0] + '“ meinst.' };
          if (umfeld.indexOf(gefunden) < 0) return { fehler: T.gross(T.der(gefunden, 'nom')) + ' ' + T.vb(gefunden, 'ist', 'sind') + ' nicht hier.' };
          ids.push(gefunden); continue;
        }

        for (var wi = 0; wi < g.length; wi++) {
          if (!istBekannt(g[wi])) return { fehler: 'Das Wort „' + T.esc(P.roh[g[wi]] || g[wi]) + '“ kenne ich nicht.' };
        }

        var treffer = [], besteStufe = 0;
        umfeld.forEach(function (id) {
          var s = passt(id, g);
          if (s > besteStufe) { besteStufe = s; treffer = [id]; } else if (s && s === besteStufe) treffer.push(id);
        });
        // Verstecktes, auf das ein Text hindeutet ("nimm etwas Hartes"): schlägt reine Adjektiv-Treffer, nicht aber Nomen
        if (besteStufe < 2) {
          var angedeutet = angedeutetes(g, opt.universum ? umfeld.concat(HG.welt.umfeld(opt.blind)) : umfeld);
          if (angedeutet.length) { treffer = angedeutet; aufdecken = aufdecken.concat(angedeutet); }
        }

        if (!treffer.length) {
          var irgendwo = Object.keys(HG.daten.dinge).some(function (id) { return passt(id, g); });
          if (irgendwo && !HG.welt.hell()) return { fehler: 'Es ist zu dunkel, um das zu finden.' };
          return { fehler: 'Du siehst hier nichts dergleichen.' };
        }
        if (treffer.length > 1 && opt.bevorzuge) {
          var besser = treffer.filter(opt.bevorzuge);
          if (besser.length) treffer = besser;
        }
        if (treffer.length > 1) {
          var gen = D(treffer[0]).genus;
          var gleich = treffer.every(function (id) { return D(id).genus === gen; });
          var namen = treffer.map(function (id) { return T.der(id, 'akk'); });
          return {
            frage: (gleich ? T.welch(gen) : 'Was') + ' meinst du: ' + T.liste(namen, 'oder') + '?',
            kandidaten: treffer, gruppe: gi
          };
        }
        ids.push(treffer[0]);
      }
      return aufdecken.length ? { ids: ids, aufdecken: aufdecken } : { ids: ids };
    },

    /** Passt eine Antwort ("den eisernen") auf einen der Kandidaten? */
    filtereKandidaten: function (tokens, kandidaten) {
      var woerter = tokens.filter(function (t) { return ARTIKEL.indexOf(t) < 0 && FUELL.indexOf(t) < 0; });
      while (woerter.length > 1 && BINDEWORT[woerter[0]]) woerter.shift();   // "den von 1905"
      if (!woerter.length) return [];
      var best = 0, erg = [];
      kandidaten.forEach(function (id) {
        var s = passt(id, woerter);
        if (s > best) { best = s; erg = [id]; } else if (s && s === best) erg.push(id);
      });
      return erg;
    },

    /** Hinweise im Notizbuch über Stichworte finden (für "kombiniere"). */
    findeHinweis: function (np) {
      var woerter = np.filter(function (t) { return ARTIKEL.indexOf(t) < 0 && t !== 'hinweis' && t !== 'notiz'; });
      if (!woerter.length) return null;
      var z = HG.zustand.z;
      var erg = z.hinweise.filter(function (hid) {
        var sw = (HG.daten.hinweise[hid].stichworte || []).map(T.norm);
        return woerter.every(function (w) { return sw.indexOf(w) >= 0; });
      });
      return erg.length === 1 ? erg[0] : null;
    }
  };
})(window.HG);
