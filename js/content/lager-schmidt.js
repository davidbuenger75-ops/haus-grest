// Haus Grest – Inhalt: Schauplatz LAGER SCHMIDT
// Vorlage: docs/lager-schmidt.md (von David). Alles mit [Vorschlag] dort ist übernommen
// und in der Spielbibel als Vorschlag markiert.
//
// Räume:  lager_tor (Ankunft, Tastenfeld)  –N→  lager_empfang (Büro, Heinz Schmidt, 7–19 Uhr)
//         lager_tor  –O→  lager_gang (Gang C, Licht mit Bewegungsmelder)  –O→  lager_c214 (Carstens Einheit)
// Außerhalb der Bürozeiten öffnet der Code 0308 (aus dem Testament) das Tor zu Gang C.
(function () {

  var BUERO = { von: '07:00', bis: '19:00' };
  function bueroOffen(api) { return api.istOffen(BUERO); }

  // Bewegungsmelder in Gang C: Licht brennt 15 Minuten nach der letzten Bewegung
  var LICHTDAUER = 15;
  function lichtAn(api) { return api.minuten() < (api.flag('gangLichtBis') || 0); }
  function bewegung(api, still) {
    var war = lichtAn(api);
    api.setzeFlag('gangLichtBis', api.minuten() + LICHTDAUER);
    api.setzeFlag('gangLichtAusGemeldet', false);
    if (!war && !still) api.sound('neon-an');
    if (!war && !still) api.sage('Klack. Mit einem nervösen Flackern springen die Neonröhren im Gang wieder an.');
  }
  function lichtPruefen(api) {
    if (!lichtAn(api) && !api.flag('gangLichtAusGemeldet')) {
      api.setzeFlag('gangLichtAusGemeldet', true);
      api.sound('neon-aus');
      api.sage(api.raum() === 'lager_c214' && api.eig('gluehbirne', 'brennt')
        ? 'Draußen im Gang klackt es. Das Neonlicht ist ausgegangen; nur deine Glühbirne brennt noch.'
        : 'Klack. Das Neonlicht geht aus. Der Bewegungsmelder hat dich vergessen. <span class="nebenbei">(Winken hilft – oder eine Lampe.)</span>');
    }
  }

  // ===================================================================
  // ZIEL
  // ===================================================================
  HG.ziel('lager', {
    name: 'Lager Schmidt',
    woerter: ['lager', 'schmidt', 'lagerraum', 'einheit', 'lagerhalle', 'storage'],
    ankunft: 'lager_tor', fahrzeit: 30,
    fahrt: { tag: 'Du fährst durch die Nordstadt hinaus ins Gewerbegebiet.', nacht: 'Du fährst durch die nächtliche Nordstadt ins Gewerbegebiet. Nur die Leuchtreklame von „Lager Schmidt“ brennt.' }
  });

  // ===================================================================
  // VOR DEM TOR
  // ===================================================================
  HG.raum('lager_tor', {
    name: 'Vor Lager Schmidt',
    woerter: ['tor', 'hof', 'parkplatz', 'einfahrt'],
    schauplatz: 'lager', abfahrt: true, karte: { x: 0, y: 1 },
    beschreibung: function (api) {
      var t = 'Lager Schmidt, am Rand eines Gewerbegebiets in der Nordstadt: vorne ein weißer Bürocontainer mit einem beleuchteten Schild, daneben eine lange, flache Halle mit Wellblechfassade und einer Reihe gelber Rolltore. Auf dem rissigen Asphalt stehen Pfützen. ';
      if (bueroOffen(api)) {
        t += 'Hinter der Glastür des Containers im Norden brennt Licht. Das große Rolltor im Osten steht offen; dahinter beginnt Gang C.';
      } else {
        t += 'Der Container im Norden ist dunkel, nur eine Notbeleuchtung glimmt hinter der Glastür. Das große Rolltor im Osten ist geschlossen. Daneben leuchtet ein Tastenfeld.';
      }
      return t + ' Auf dem Parkplatz stehen ein paar Autos, deins darunter.';
    },
    kurz: function (api) { return 'Vor Lager Schmidt: Bürocontainer, gelbe Rolltore. Norden: Büro' + (bueroOffen(api) ? '' : ' (geschlossen)') + '. Osten: Rolltor zu Gang C.'; },
    horchen: { tag: 'Ein Radio im Büro, Schlager. Irgendwo piepst ein rückwärts fahrender Lieferwagen.', nacht: 'Das Summen der Leuchtreklame. Sonst nichts.' },
    ausgaenge: {
      norden: { ziel: 'lager_empfang', sperre: function (api) { return bueroOffen(api) ? null : 'Die Glastür zum Büro ist abgeschlossen. Ein Schild: „Büro 7–19 Uhr. Mieter: Zugang über Tastenfeld.“'; } },
      osten: { ziel: 'lager_gang', sperre: function (api) {
        if (bueroOffen(api) || api.minuten() < (api.flag('torOffenBis') || 0)) return null;
        return 'Das Rolltor ist geschlossen. Daneben ein Tastenfeld mit abgegriffenen Zifferntasten. <span class="nebenbei">(„tippe …“)</span>';
      } }
    },
    bei: {
      eintippen: function (api, ctx) {
        if (bueroOffen(api)) { api.sage('Das Tor steht ohnehin offen. Du musst keinen Code eingeben.'); return true; }
        var code = (ctx.np1 || []).join('').replace(/\D/g, '');
        if (!code) { api.sage('Welchen Code willst du eintippen? Zum Beispiel: „tippe 1234“.'); return true; }
        if (code === '0308') {
          api.setzeFlag('torOffenBis', api.minuten() + 30);
          api.sound('rolltor');
          api.sage('Du tippst ' + code + '. Ein Piepen, ein grünes Licht – und das Rolltor rattert nach oben. Dahinter liegt Gang C im Dunkeln.');
        } else {
          api.sage('Du tippst ' + code + '. Das Tastenfeld piept zweimal empört und leuchtet rot.');
        }
        return true;
      }
    },
    vorschlaege: function (api) {
      if (bueroOffen(api)) return ['geh nach norden', 'geh nach osten'];
      return api.minuten() < (api.flag('torOffenBis') || 0) ? ['geh nach osten'] : ['tippe 0308'].filter(function () { return api.hatHinweis('testament'); });
    },
    details: [
      { nomen: 'Tastenfeld', genus: 'n', woerter: ['tastenfeld', 'tasten', 'zahlenfeld', 'code', 'codeschloss'], text: 'Ein Tastenfeld mit Ziffern von 0 bis 9. Die Tasten 0, 3 und 8 sind besonders abgegriffen.' },
      { nomen: 'Rolltor', genus: 'n', woerter: ['rolltor', 'tor'], text: 'Ein breites gelbes Rolltor aus geriffeltem Blech, das größte in der Reihe, darüber ein Schild: „Gang A–D“. Die kleineren Tore daneben sind mit Vorhängeschlössern gesichert.' },
      { nomen: 'Leuchtreklame', genus: 'f', woerter: ['leuchtreklame', 'schild', 'reklame', 'container', 'buerocontainer'], text: 'Ein beleuchtetes Schild auf dem Dach des weißen Bürocontainers: „LAGER SCHMIDT“ in dunklen Blockbuchstaben. Die Röhre dahinter brummt leise und flackert ab und zu.' }
    ]
  });

  // ===================================================================
  // BÜRO / EMPFANG mit Heinz Schmidt
  // ===================================================================
  HG.raum('lager_empfang', {
    name: 'Büro von Lager Schmidt',
    woerter: ['buero', 'empfang', 'theke'],
    schauplatz: 'lager', karte: { x: 0, y: 0 },
    beschreibung: 'Ein enges Büro mit Resopaltheke, einem Gummibaum und einem Kalender vom Autohaus Kowalski. Es riecht nach Filterkaffee. Hinter der Theke sitzt ein alter Mann in Strickjacke über einem Kreuzworträtsel. Durch eine Tür im Osten geht es zu den Gängen, im Süden hinaus zum Parkplatz.',
    kurz: 'Das Büro mit der Resopaltheke. Heinz Schmidt sitzt über seinem Kreuzworträtsel. Osten: Gänge, Süden: Parkplatz.',
    riechen: 'Filterkaffee, der schon seit Stunden auf der Warmhalteplatte steht.',
    horchen: 'Schlager aus einem Kofferradio. Das Kratzen eines Kugelschreibers.',
    ausgaenge: { sueden: 'lager_tor', osten: 'lager_gang' },
    beimBetreten: function (api, info) {
      if (info.erstesMal) {
        api.sage('Der Mann blickt auf und nimmt die Lesebrille ab. „Moin! Was kann ich … Moment.“ Er mustert dich. „Sie sind {g:der Erbe|die Erbin|die Person mit dem Erbe}, oder? Von Herrn Häuser. Der Notar hat angerufen. Herzliches Beileid.“ <span class="nebenbei">(„frage schmidt nach …“)</span>');
      } else if (falscheNachrichtBekommen() && !api.flag('schmidtKuendigung')) {
        api.setzeFlag('schmidtKuendigung', true);
        api.sage(HG.daten.dinge.schmidt.themen['kuendigung,gekuendigt,kuendigen'](api));
      }
    },
    vorschlaege: ['frage schmidt nach carsten', 'frage schmidt nach dem raum'],
    details: [
      { nomen: 'Kaffee', genus: 'm', woerter: ['kaffee', 'kanne', 'filterkaffee', 'tasse'], text: 'Filterkaffee in einer Glaskanne, schwarz wie Teer.', riechen: 'Bitter. Seit Stunden auf der Warmhalteplatte.' },
      { nomen: 'Kreuzworträtsel', genus: 'n', woerter: ['kreuzwortraetsel', 'raetsel', 'zeitschrift'], text: 'Ein Rätselheft. Bei „Spiegelbild (7 Buchstaben)“ hat er „SPIEGEL“ eingetragen und wieder durchgestrichen.' },
      { nomen: 'Kalender', genus: 'm', woerter: ['kalender'], text: 'Autohaus Kowalski, November: ein roter Sportwagen vor einem Bergsee.' }
    ]
  });

  function falscheNachrichtBekommen() {
    var h = HG.zustand.z.handy;
    return !!(h && h.nachrichten.some(function (n) { var d = HG.daten.nachrichten[n.id]; return d && d.falsch; }));
  }

  HG.ding('schmidt', {
    nomen: 'Schmidt', genus: 'm', eigenname: true,
    woerter: ['schmidt', 'heinz', 'mann', 'inhaber', 'alter', 'herr', 'chef'],
    ort: 'lager_empfang', person: true, szenerie: true,
    beschreibung: 'Heinz Schmidt, Anfang siebzig, graue Strickjacke, Lesebrille an einer Kordel. Er sieht aus wie jemand, der gern redet und selten Gelegenheit dazu hat.',
    gespraech: function (api) {
      return '„Heinz Schmidt. Mir gehört der Laden hier, seit 1987.“ Er schiebt dir einen Becher Kaffee hin, ob du willst oder nicht. „Fragen Sie ruhig. Über Herrn Häuser, über den Raum – ich weiß nicht viel, aber das erzähl ich gern.“';
    },
    themen: {
      'carsten,haeuser,onkel,cousin,verwandten,verwandter,mieter,tod,tot': function (api) {
        api.hinweis('tote_anrufer');
        return '„Herr Häuser.“ Schmidt dreht den Kugelschreiber zwischen den Fingern. „Kam in den letzten Monaten oft. Meistens nachts, mit seinem Code. Hat da drin gesessen und geschrieben. Stundenlang. Ich hab ihm mal ’nen Heizlüfter rübergebracht.“<br><br>' +
          'Er senkt die Stimme. „Das Komische war ja … eine Woche nach seiner Beerdigung ruft er mich an. Also, seine Nummer. Seine Stimme. Ich soll den Raum ausräumen und alles wegwerfen, das Tagebuch zuerst. Ich hab gesagt: Herr Häuser, Sie sind tot. Da hat er gelacht. Und aufgelegt.“';
      },
      'anruf,anrufe,telefon,telefonat,stimme,lachen': function (api) {
        api.hinweis('tote_anrufer');
        return '„Seine Nummer, seine Stimme. Eine Woche nach der Beerdigung. ‚Werfen Sie alles weg, das Tagebuch zuerst.‘ Ich hab nichts weggeworfen. Ich werf nie was weg, fragen Sie meine Frau.“ Er lacht, aber nicht lange.';
      },
      'raum,einheit,c214,lagerraum,abteil,box,gang': '„C-214. Gang C, durch die Tür da“ – er nickt nach Osten – „dann die vierte links. Das Licht im Gang hat ’nen Bewegungsmelder. Wenn’s ausgeht: winken. Klingt blöd, hilft aber.“',
      'tagebuch,notizbuch,buch,schreiben,heft': '„Er hatte immer so ein schwarzes Büchlein dabei, mit Gummiband. Hat da reingeschrieben, als ob’s um sein Leben geht.“ Er stockt. „Na ja.“',
      'code,tor,tastenfeld,zahlencode,nachts,nacht,zugang': '„Nach sieben ist das Büro zu, dann kommen Mieter nur mit ihrem Code aufs Gelände. Den Code hatte Herr Häuser selbst eingestellt. Steht nicht bei mir in den Unterlagen, Datenschutz und so.“',
      'haus,ulmenweg,villa,kirchhoerde,grest': '„Das Haus im Ulmenweg? Kenn ich nur aus der Zeitung. Da sind doch schon ein paar … na. Meine Frau sagt, da wohnt das Pech. Ich sag, Pech wohnt nirgends, das zieht um.“',
      'schmidt,sie,firma,laden,geschichte,familie,frau': '„Seit 1987. Erst hatte ich hier Garagen vermietet, dann kam das mit dem Self-Storage aus Amerika. Heute stellen die Leute ihr halbes Leben bei mir unter. Und manche holen’s nie wieder ab.“',
      'pistole,waffe,walther,p99': '„Eine … was?“ Er nimmt die Brille ab. „Nee. Davon will ich nichts gehört haben. Hier ist ein ordentlicher Betrieb.“',
      'benzin,kanister,benzinkanister': '„Benzin? Das ist in den Einheiten eigentlich verboten. Brandschutz.“ Er sieht dich lange an. „Hat er das da drin gelagert?“',
      'romanow,natascha,gerdes,bettina,peter,brigitte': '„Nie gehört. Herr Häuser hat manchmal Namen vor sich hin gemurmelt, wenn er reinkam. Aber ich hör nicht hin.“',
      'kuendigung,gekuendigt,kuendigen': function (api) {
        api.setzeFlag('schmidtKuendigung', true);
        if (!falscheNachrichtBekommen()) return '„Kündigen? Nein, der Raum ist bis Jahresende bezahlt. Machen Sie sich keinen Kopf.“';
        return 'Schmidt runzelt die Stirn. „Sagen Sie mal, haben Sie nicht gestern angerufen? Sie wollten den Raum kündigen, sofort, alles in den Container. Ihre Stimme, ganz sicher.“ Er sieht dich an. „Nicht? … Na. Dann hab ich mich verhört.“ Er hat sich nicht verhört.';
      }
    },
    themaSonst: '„Da kann ich Ihnen nicht helfen.“ Er hebt die Kaffeekanne. „Noch ’n Schluck?“'
  });

  // ===================================================================
  // GANG C
  // ===================================================================
  HG.raum('lager_gang', {
    name: 'Gang C',
    woerter: ['gang', 'flur', 'korridor', 'c'],
    schauplatz: 'lager', karte: { x: 1, y: 0 },
    dunkel: function (api) { return !lichtAn(api); },
    dunkelText: 'Stockdunkel. Irgendwo über dir hängt eine Neonröhre, die nicht angeht. <span class="nebenbei">(Bewegungsmelder: winken!)</span>',
    beschreibung: 'Ein langer Gang unter flackernden Neonröhren. Links und rechts gelb gestrichene Türen mit schwarzen Nummern. An der Decke Kameras – bei der Hälfte baumelt das Kabel lose herunter. Im Osten, die vierte Tür links: <b>C-214</b>. Im Westen geht es ins Büro, im Süden hinaus zum Tor.',
    kurz: 'Gang C. Gelbe Türen, Neonlicht. Osten: C-214. Westen: Büro, Süden: Tor.',
    horchen: function (api) { return lichtAn(api) ? 'Das Summen der Neonröhren. Hinter einer der Türen tropft etwas.' : 'In der Dunkelheit hörst du das Summen nicht mehr. Nur etwas, das wie ein Atemzug klingt, irgendwo weiter hinten.'; },
    winken: 'Du fuchtelst mit den Armen.',
    ausgaenge: {
      osten: { ziel: 'lager_c214', tuer: 'c214_tuer' },
      westen: { ziel: 'lager_empfang', sperre: function (api) { return bueroOffen(api) ? null : 'Die Tür zum Büro ist abgeschlossen.'; } },
      sueden: 'lager_tor'
    },
    vorBetreten: function (api) { bewegung(api, true); },
    jedeRunde: lichtPruefen,
    bei: { winken: function (api) { api.sage('Du fuchtelst mit den Armen.'); bewegung(api); return true; } },
    vorschlaege: function (api) { return lichtAn(api) ? ['geh nach osten'] : ['winke']; },
    details: [
      { nomen: 'Kamera', genus: 'f', woerter: ['kamera', 'kameras', 'kabel'], text: 'Eine Überwachungskamera. Das Kabel hängt lose herunter. Trotzdem hast du das Gefühl, dass sie sich ein winziges Stück dreht, als du vorbeigehst.' },
      { nomen: 'Türen', genus: 'pl', woerter: ['tueren', 'nummern'], text: 'C-201, C-202, C-203 … gelb gestrichen, abgeschabt. Hinter manchen raschelt es, wenn du vorbeigehst. Mäuse. Bestimmt.' }
    ]
  });

  HG.ding('c214_tuer', {
    nomen: 'Tür', genus: 'f', adj: ['gelb'],
    woerter: ['tuer', 'c214', 'einheit', 'vorhaengeschloss', 'schloss', 'rolltuer'],
    tuer: true, orte: ['lager_gang', 'lager_c214'],
    oeffenbar: true, offen: false, verschlossen: true, schluessel: 'lagerschluessel',
    beschreibung: function (api) { return api.raum() === 'lager_gang' ? 'Eine gelbe Stahltür mit der Nummer C-214 und einem schweren Vorhängeschloss.' : 'Die gelbe Tür zurück in den Gang.'; },
    texte: {
      aufschliessen: 'Der kleine Schlüssel passt. Das Vorhängeschloss springt mit einem trockenen Klacken auf.',
      oeffnen: 'Die Tür schwingt quietschend auf. Abgestandene Luft schlägt dir entgegen, Pappe, kaltes Metall – und ganz schwach: Lavendel.',
      verschlossen: 'Ein schweres Vorhängeschloss hängt an der Tür.'
    }
  });

  // ===================================================================
  // EINHEIT C-214
  // ===================================================================
  HG.raum('lager_c214', {
    name: 'Einheit C-214',
    woerter: ['einheit', 'c214', 'lagerraum', 'raum', 'abteil'],
    schauplatz: 'lager', karte: { x: 2, y: 0 },
    dunkel: function (api) { return !lichtAn(api); },
    dunkelText: 'Dunkel. Nur das Licht deines Handys könnte hier helfen – oder die Glühbirne, deren Zugschnur irgendwo vor deinem Gesicht baumeln muss.',
    beschreibung: function (api) {
      return 'Ein Raum, drei mal vier Meter, Betonboden, Wände aus Wellblech. An der Decke eine nackte Glühbirne mit Zugschnur' + (api.eig('gluehbirne', 'brennt') ? ', die brennt' : '') + '. ' +
        'An der linken Wand stehen vier Umzugskartons, mit Edding beschriftet: <b>GERDES</b>, <b>ROMANOW</b>, <b>GREST</b> und <b>KÜCHE / DIVERSES</b>. ' +
        'Daneben drei rote Benzinkanister und ein Schuhkarton. In der Mitte ein Campingtisch und ein Klappstuhl, auf dem Carsten wohl stundenlang gesessen hat. Im Westen geht es zurück in den Gang.';
    },
    kurz: 'Carstens Einheit: vier Kartons, drei Benzinkanister, ein Schuhkarton, Campingtisch und Klappstuhl.',
    riechen: 'Pappe, Benzin, kaltes Metall. Und Lavendel, ganz schwach, als hätte hier jemand gestanden.',
    horchen: 'Das Summen der Neonröhren draußen. Das Ticken des Wellblechs, wenn es abkühlt.',
    ausgaenge: { westen: { ziel: 'lager_gang', tuer: 'c214_tuer' } },
    vorBetreten: function (api) { bewegung(api, true); },
    beimBetreten: function (api, info) { if (info.erstesMal) api.sage('Das also ist Carstens Lager. Hier hat er gesammelt, was er über das Haus herausfand.'); },
    jedeRunde: lichtPruefen,
    bei: { winken: function (api) { api.sage('Du winkst zur offenen Tür hinaus.'); bewegung(api); return true; } },
    vorschlaege: function (api) {
      var v = [];
      if (!api.hatHinweis('tb_kauf')) v.push('lies das tagebuch');
      ['karton_gerdes', 'karton_romanow', 'karton_grest', 'karton_kueche'].forEach(function (k) {
        if (!api.eig(k, 'offen')) v.push('öffne ' + HG.daten.dinge[k].kurzwort);
      });
      if (!api.eig('schuhkarton', 'offen')) v.push('öffne den schuhkarton');
      return v.slice(0, 5);
    }
  });

  HG.ding('gluehbirne', {
    nomen: 'Glühbirne', genus: 'f', adj: ['nackt'],
    woerter: ['gluehbirne', 'birne', 'lampe', 'schnur', 'zugschnur', 'deckenlampe', 'licht'],
    ort: 'lager_c214', fest: true, szenerie: true, imDunkeln: true,
    lichtquelle: true, schalter: true, brennt: false,
    beschreibung: 'Eine nackte Glühbirne an einem Kabel, darunter eine Zugschnur mit einer Holzperle.',
    texte: { anzuenden: 'Du ziehst an der Schnur. Die Glühbirne flammt gelb auf und schwingt leise hin und her. Die Schatten der Kartons wandern.', loeschen: 'Du ziehst an der Schnur. Die Glühbirne erlischt.' },
    bei: {
      ziehen: function (api, ctx) {
        ctx.aktion = api.eig('gluehbirne', 'brennt') ? 'loeschen' : 'anzuenden';
        HG.aktionen[ctx.aktion](ctx);
        return true;
      }
    }
  });

  HG.ding('campingtisch', {
    nomen: 'Campingtisch', genus: 'm',
    woerter: ['campingtisch', 'tisch', 'klapptisch'],
    ort: 'lager_c214', fest: true, szenerie: true, ablage: true,
    beschreibung: 'Ein wackliger Campingtisch. Brandflecken von Zigaretten, ein Kaffeebecherrand, ein leerer Kugelschreiber.'
  });
  HG.ding('klappstuhl', {
    nomen: 'Klappstuhl', genus: 'm',
    woerter: ['klappstuhl', 'stuhl', 'campingstuhl'],
    ort: 'lager_c214', fest: true, szenerie: true,
    beschreibung: 'Ein grüner Klappstuhl. Die Sitzfläche ist durchgesessen.',
    klettern: 'Du setzt dich auf den Klappstuhl, wo Carsten gesessen hat. Von hier aus siehst du direkt auf die Tür. Er hat mit dem Rücken zur Wand gesessen.'
  });

  // --- Pistole -----------------------------------------------------------
  HG.ding('schuhkarton', {
    nomen: 'Schuhkarton', genus: 'm',
    woerter: ['schuhkarton', 'schuhschachtel'],
    ort: 'lager_c214', szenerie: true, fest: 'Du lässt den Schuhkarton lieber, wo er ist – er ist schwerer, als ein Schuhkarton sein sollte.',
    behaelter: true, oeffenbar: true, offen: false,
    beschreibung: 'Ein Schuhkarton, „Größe 44, schwarz“. Er ist schwerer, als er aussieht.',
    texte: { oeffnen: 'Du hebst den Deckel. Darin liegt etwas, eingeschlagen in ein kariertes Geschirrtuch. Du schlägst das Tuch zurück.' }
  });
  HG.ding('pistole', {
    nomen: 'Pistole', genus: 'f',
    woerter: ['pistole', 'waffe', 'walther', 'p99', 'knarre', 'geschirrtuch'],
    ort: 'schuhkarton', rel: 'in',
    beschreibung: 'Eine Walther P99, schwarz und schwerer als erwartet. Keine Seriennummer mehr, sie ist herausgefeilt. Gegen das, was in dem Haus wartet, wird sie nichts nützen. Aber sie liegt sehr ruhig in der Hand.',
    texte: { nehmen: 'Du nimmst die Pistole. Sie ist kalt und schwer, und sofort fühlst du dich wie jemand, der etwas Verbotenes tut. Das bist du auch.' },
    zerbrechen: 'Mit bloßen Händen? Keine Chance.'
  });
  HG.ding('magazine', {
    nomen: 'Magazine', genus: 'pl', adj: ['voll'],
    woerter: ['magazine', 'magazin', 'munition', 'patronen'],
    ort: 'schuhkarton', rel: 'in',
    beschreibung: 'Zwei volle Magazine für die P99.'
  });

  // --- Benzin --------------------------------------------------------------
  HG.ding('benzinkanister', {
    nomen: 'Benzinkanister', genus: 'pl', adj: ['rot'],
    woerter: ['benzinkanister', 'kanister', 'benzin'],
    ort: 'lager_c214', szenerie: true,
    fest: 'Jeder Kanister wiegt gut sechzehn Kilo. Du lässt sie stehen – fürs Erste.',
    beschreibung: 'Drei rote 20-Liter-Kanister, randvoll. Sechzig Liter. Daneben eine ungeöffnete Packung Sturmstreichhölzer.',
    riechen: 'Benzin. Scharf und süßlich.'
  });
  HG.ding('sturmstreichhoelzer', {
    nomen: 'Sturmstreichhölzer', genus: 'pl',
    woerter: ['sturmstreichhoelzer', 'streichhoelzer', 'packung', 'streichholz'],
    ort: 'lager_c214', feuer: true, kurzwort: 'sturmstreichhölzer',
    hierText: 'Neben den Kanistern liegt eine ungeöffnete Packung Sturmstreichhölzer.',
    beschreibung: 'Eine ungeöffnete Packung Sturmstreichhölzer. Brennen angeblich auch im Regen.',
    texte: { anzuenden: 'Du reißt ein Sturmstreichholz an. Es faucht auf, brennt zischend herunter und erlischt.' }
  });

  // --- Kartonstapel (für "durchsuche die kartons") ------------------------
  HG.ding('kartonstapel', {
    nomen: 'Kartons', genus: 'pl', adj: ['vier'],
    woerter: ['kartons', 'umzugskartons', 'kisten', 'stapel'],
    ort: 'lager_c214', fest: true, szenerie: true,
    beschreibung: 'Vier Umzugskartons mit Edding beschriftet: GERDES, ROMANOW, GREST und KÜCHE / DIVERSES. Du kannst sie einzeln öffnen, z. B. „öffne den gerdes-karton“.'
  });

  function karton(id, aufschrift, kurz, text) {
    HG.ding(id, {
      nomen: aufschrift + '-Karton', genus: 'm', kurzwort: kurz,
      woerter: ['karton', 'umzugskarton', 'kiste', T(aufschrift) + 'karton', T(aufschrift)],
      ort: 'lager_c214', szenerie: true,
      fest: 'Der Karton ist schwer. Du sichtest ihn lieber hier.',
      behaelter: true, oeffenbar: true, offen: false,
      beschreibung: text
    });
  }
  function T(s) { return HG.text.norm(s).replace(/[^a-z]/g, ''); }

  karton('karton_gerdes', 'Gerdes', 'gerdes-karton', 'Ein Umzugskarton, mit dickem Edding beschriftet: „GERDES“.');
  karton('karton_romanow', 'Romanow', 'romanow-karton', 'Ein Umzugskarton, beschriftet: „ROMANOW“. Die Schrift ist zittriger als auf den anderen.');
  karton('karton_grest', 'Grest', 'grest-karton', 'Ein Umzugskarton, beschriftet: „GREST“. Der Deckel ist mit Klebeband mehrfach verstärkt.');
  karton('karton_kueche', 'Küchen', 'küchen-karton', 'Ein Umzugskarton: „KÜCHE / DIVERSES“. Er klappert.');
  HG.daten.dinge.karton_kueche.woerter.push('diverses', 'kueche', 'hausrat');

  // ===================================================================
  // KARTON „GERDES“
  // ===================================================================
  HG.ding('grundbuchauszug', {
    nomen: 'Grundbuchauszug', genus: 'm',
    woerter: ['grundbuchauszug', 'grundbuch', 'auszug', 'kreuze', 'liste', 'eigentuemer'],
    ort: 'karton_gerdes', rel: 'in', schriftart: 'druck',
    beschreibung: 'Die Kopie eines Grundbuchauszugs für Ulmenweg 12: alle Eigentümer seit 1900, Zeile für Zeile. Neben vielen Namen hat Carsten mit Kugelschreiber ein Kreuz gemacht. Mittendrin klafft eine Lücke, die er mit dicken Fragezeichen markiert hat.',
    lesbar: '<b>Grundbuch von Kirchhörde – Blatt 1173 – Ulmenweg 12</b><br>Eigentümer seit 1900, in Carstens Kopie mit Kreuzen versehen:<br><br>' +
      'Grest, Bernward (1900) ✝ <i>– daneben: „Grest“</i><br>Grest, Elisabeth (1905) ✝<br>… weitere Namen bis 1930 …<br>' +
      '<i>1931 bis 1964: „Eintragungen durch Brand vernichtet“</i> – daneben, mehrfach nachgezogen: <b>? ? ?</b><br>' +
      '… weitere Namen ab 1965 – zusammen mit denen vor 1931 zwei Dutzend, elf davon mit Kreuz …<br>' +
      'Gerdes, Peter und Brigitte (1998) ✝ <i>– „Gerdes“</i><br>Romanow, Natascha (2023) ✝ <i>– „Romanow“</i><br>Häuser, Carsten (2025)<br><br>' +
      'Am Rand, doppelt unterstrichen: <b>13</b>. Nur bei dreien steht ein Name daneben.',
    hinweis: 'dreizehn_kreuze', hinweisBei: 'lesen',
    bei: { untersuchen: function (api) { api.hinweis('dreizehn_kreuze'); return false; } }
  });

  HG.ding('zeitung_2022', {
    nomen: 'Zeitungsausschnitt', genus: 'm',
    woerter: ['zeitungsausschnitt', 'ausschnitt', 'zeitung', 'meldung', 'abendpost'],
    ort: 'karton_gerdes', rel: 'in', schriftart: 'druck',
    beschreibung: 'Ein Ausschnitt aus der Dortmunder Abendpost vom 19. Oktober 2022, Lokalteil.',
    lesbar: '<i>Dortmunder Abendpost, 19. Oktober 2022</i><br><b>Trauer in Kirchhörde: 17-Jährige tot aufgefunden</b><br><br>' +
      '<i>Dortmund.</i> In einem Wohnhaus im Ulmenweg ist am Sonntagmorgen eine 17-jährige Schülerin tot aufgefunden worden. Nach Angaben der Polizei gibt es keine Hinweise auf ein Fremdverschulden. Die Jugendliche besuchte die Oberstufe eines Gymnasiums in Hombruch. Die Schulleitung zeigte sich tief betroffen; für Mitschüler wurde ein Kriseninterventionsteam eingerichtet.<br><br>' +
      'Nachbarn beschreiben die Familie als „zurückhaltend, aber herzlich“. Eine Anwohnerin, die anonym bleiben möchte, sagte unserer Zeitung: „Mit dem Haus war schon immer was. Meine Großmutter hat da früher nicht mal die Straßenseite gewechselt.“<br><br>' +
      '<small><i>Hinweis der Redaktion: Wir berichten in der Regel nicht über Suizide. Wenn Sie selbst Suizidgedanken haben, finden Sie rund um die Uhr Hilfe bei der Telefonseelsorge unter 0800 111 0 111.</i></small>',
    hinweis: 'bettina_gerdes', hinweisBei: 'lesen'
  });

  HG.ding('trauerkarte', {
    nomen: 'Trauerkarte', genus: 'f',
    woerter: ['trauerkarte', 'karte', 'sterbebild', 'bettina', 'maedchen'],
    ort: 'karton_gerdes', rel: 'in',
    beschreibung: 'Eine Trauerkarte für Bettina Gerdes. Das Foto zeigt ein lachendes Mädchen mit Zahnspange. Darunter: <i>„Du bist nur in ein anderes Zimmer gegangen.“</i> Carsten hat das Wort „Zimmer“ eingekreist.',
    lesbar: '<i>Bettina Gerdes · 2005 – 2022</i><br><br>„Du bist nur in ein anderes Zimmer gegangen.“<br><br><span class="rot">Zimmer</span> <i>(von Carsten eingekreist)</i>'
  });

  HG.ding('foto_gerdes', {
    nomen: 'Familienfoto', genus: 'n',
    woerter: ['familienfoto', 'foto', 'bild', 'abzug', 'familie', 'fenster', 'person'],
    ort: 'karton_gerdes', rel: 'in',
    beschreibung: 'Familie Gerdes vor dem Haus, Sommer 2019: Peter, Brigitte, Daniel und Bettina. Alle lächeln.',
    foto: 'Das Foto vom Foto: vier lächelnde Menschen. Und im Fenster des ersten Stocks – nichts. Auf dem Original war doch …?',
    bei: {
      untersuchen: function (api) {
        api.sage('Familie Gerdes vor dem Haus, Sommer 2019: Peter, Brigitte, Daniel und Bettina, alle lächeln in die Sonne. ' +
          (api.zaehle('foto_gerdes_angesehen') === 1 ? 'Du willst es schon zurücklegen, da fällt dir das Fenster im ersten Stock auf. Darin spiegelt sich eine fünfte Person: eine Frau in einem hellen, altmodischen Kleid. Sie lächelt nicht.' : 'Im Fenster des ersten Stocks: die Frau im hellen Kleid. Du siehst nicht noch einmal genauer hin.'));
        if (api.zaehler('foto_gerdes_angesehen') === 1) api.nervenProbe('0/1W3', { grund: 'unheimliches Foto' });
        return true;
      }
    }
  });

  HG.ding('zettel_unna', {
    nomen: 'Zettel', genus: 'm',
    woerter: ['zettel', 'notiz', 'adresse', 'unna'],
    ort: 'karton_gerdes', rel: 'in',
    beschreibung: 'Ein Notizzettel in Carstens Schrift, mit einer Adresse in Unna.',
    lesbar: 'Am Kreuzkamp 7, 59423 Unna<br><b>Brigitte G. – redet vielleicht.</b><br>Peter NICHT anrufen.',
    hinweis: 'brigitte_gerdes', hinweisBei: 'lesen'
  });

  // ===================================================================
  // KARTON „ROMANOW“
  // ===================================================================
  HG.ding('artikel_2025', {
    nomen: 'Ausdruck', genus: 'm',
    woerter: ['ausdruck', 'artikel', 'onlineartikel', 'kommentare', 'kommentar', 'internet'],
    ort: 'karton_romanow', rel: 'in', schriftart: 'web',
    beschreibung: 'Der Ausdruck eines Online-Artikels von dortmund-aktuell.de, Mai 2025, mit Kommentarspalte. Unten ist etwas rot umkringelt.',
    lesbar: '<i>dortmund-aktuell.de · 23. Mai 2025</i><br><b>Tragischer Unfall: Frau stirbt in Kirchhörder Villa</b><br><br>' +
      'Eine 44 Jahre alte Frau ist in ihrem Haus in Dortmund-Kirchhörde ums Leben gekommen. Eine Bekannte, die sich Sorgen gemacht hatte, weil die Frau seit Tagen nicht ans Telefon ging, alarmierte am Donnerstag die Polizei. Die Beamten fanden die Bewohnerin leblos in der Eingangshalle.<br><br>' +
      'Nach Angaben eines Polizeisprechers deutet alles auf einen tragischen Haushaltsunfall hin. Die Frau habe sich offenbar beim Staubsaugen auf der Treppe im Kabel des Geräts verfangen und sei gestürzt. Ein Fremdverschulden sei ausgeschlossen. Die Ermittlungen seien abgeschlossen.<br><br>' +
      'Die Verstorbene hatte das denkmalgeschützte Gebäude 2023 gekauft und war dabei, es aufwendig zu restaurieren.' +
      '<div class="kommentar"><b>Kommentare (4)</b><br><b>ruhrpottkind_77:</b> Haushaltsunfall?? Mit dem Kabel am Geländer? Wer glaubt denn sowas<br>' +
      '<b>Mia_Hörde:</b> Das ist doch das Haus, wo das Mädchen damals … ich bin da früher immer zur Schule vorbeigelaufen. Gruselig<br>' +
      '<b>K. Kolbe:</b> Ich wohne nebenan. Sie hat mir eine Woche vorher gesagt, sie hört nachts jemanden im ersten Stock singen. Ruhe in Frieden, Natascha.<br>' +
      '<span class="rot"><b>e.grest1900:</b> Sie hat nicht aufgeräumt.</span></div><small><i>(Der letzte Kommentar wurde vom Moderator gelöscht.)</i></small>',
    hinweis: 'natascha_romanow', hinweisBei: 'lesen',
    bei: {
      lesen: function (api) {
        if (!api.flag('kommentarGelesen')) {
          api.setzeFlag('kommentarGelesen', true);
          api.schrift(HG.daten.dinge.artikel_2025.lesbar, 'web');
          api.hinweis('natascha_romanow');
          api.sage('Der gelöschte Kommentar steht nur auf Carstens Ausdruck. Er hat ihn rot umkringelt. <i>e.grest1900.</i>');
          api.nervenProbe('0/1W3', { grund: 'gelöschter Kommentar' });
          return true;
        }
        return false;
      }
    }
  });

  HG.ding('visitenkarte', {
    nomen: 'Visitenkarte', genus: 'f',
    woerter: ['visitenkarte', 'karte', 'romanow', 'natascha'],
    ort: 'karton_romanow', rel: 'in',
    beschreibung: 'Eine schlichte, cremefarbene Visitenkarte.',
    lesbar: '<b>Natascha Romanow</b><br>Restaurierung historischer Innenräume<br><small>Stuck · Vergoldung · Spiegel</small>', schriftart: 'druck'
  });

  HG.ding('expose', {
    nomen: 'Exposé', genus: 'n',
    woerter: ['expose', 'immobilienexpose', 'prospekt', 'makler', 'anzeige', 'ankleidezimmer'],
    ort: 'karton_romanow', rel: 'in', schriftart: 'druck',
    beschreibung: 'Ein Immobilien-Exposé vom Juli 2025: „Jugendstil-Villa mit Charakter, sofort bezugsfrei“. Hochglanzfotos von Halle, Treppe, Salon.',
    lesbar: '<b>Jugendstil-Villa mit Charakter, sofort bezugsfrei</b><br>Ulmenweg 12 · Dortmund-Kirchhörde · Baujahr 1900 · denkmalgeschützt<br><br>„Ein Haus, das Geschichten erzählt.“',
    bei: {
      untersuchen: function (api) {
        api.sage('Hochglanzfotos: die Halle, die Treppe, ein Salon. Auf einem Bild ein Zimmer voller Spiegel, Bildunterschrift: „Ankleidezimmer mit Originalausstattung“. ' +
          'Carsten hat mit Kugelschreiber dazugeschrieben: <i>Warum ist sie auf jedem Foto in diesem Zimmer schärfer als die Möbel?</i>');
        if (api.zaehle('expose_angesehen') === 1) {
          api.sage('Du siehst genau hin. Auf dem Bild ist niemand. Spiegel, Teppich, ein leerer Stuhl.');
          var e = api.nervenProbe('0/1W3', { grund: 'Foto im Exposé' });
          api.sage('Dann, als du das Exposé schon sinken lässt: in einem der hinteren Spiegel, ganz klein, gestochen scharf – eine Frau im hellen Kleid, die direkt in die Kamera sieht.');
          api.hinweis('expose_spiegelzimmer');
        } else {
          api.sage('Die Frau im hinteren Spiegel ist immer noch da. Schärfer als die Möbel.');
        }
        return true;
      }
    }
  });

  HG.ding('freigabe', {
    nomen: 'Freigabe', genus: 'f', adj: ['polizeilich'],
    woerter: ['freigabe', 'bescheid', 'aktenzeichen', 'polizei', 'schreiben'],
    ort: 'karton_romanow', rel: 'in', schriftart: 'druck',
    beschreibung: 'Ein Schreiben des Polizeipräsidiums Dortmund: Freigabe des Hauses nach Abschluss der Ermittlungen im Todesfall Romanow.',
    lesbar: '<b>Polizeipräsidium Dortmund</b><br>Az. 2025-KK11-04417<br><br>Die Ermittlungen im Todesfall Natascha Romanow, Ulmenweg 12, sind abgeschlossen. Das Objekt wird hiermit freigegeben.<br><br>' +
      '<i>Am Rand, in Carstens Schrift: „Aktenzeichen! Nach Akte fragen.“</i>',
    hinweis: 'aktenzeichen_romanow', hinweisBei: 'lesen'
  });

  // ===================================================================
  // KARTON „GREST“
  // ===================================================================
  HG.ding('archivkopien', {
    nomen: 'Archivkopien', genus: 'pl',
    woerter: ['archivkopien', 'kopien', 'bauantrag', 'todesanzeige', 'stadtarchiv'],
    ort: 'karton_grest', rel: 'in', schriftart: 'druck',
    beschreibung: 'Kopien aus dem Stadtarchiv: ein Bauantrag und eine Todesanzeige.',
    lesbar: '<b>Bauantrag</b>, eingereicht am 12. Mai 1899 – „Wohnhaus nebst Remise, Ulmenweg“. Unterschrift: <i>B. Grest, Architekt</i>.<br><br>' +
      '<b>Todesanzeige</b>, 1905: „Plötzlich und unerwartet verstarb mein geliebter Gatte, der Architekt <b>Bernward Grest</b>. In tiefer Trauer: Elisabeth Grest.“',
    hinweis: 'bauantrag_1899', hinweisBei: 'lesen'
  });

  HG.ding('zeitung_1930', {
    nomen: 'Zeitungsnotiz', genus: 'f', adj: ['alt'],
    woerter: ['zeitungsnotiz', 'notiz', 'zeitung', 'familiennachrichten', '1930', 'fraktur'],
    ort: 'karton_grest', rel: 'in', schriftart: 'fraktur',
    beschreibung: 'Die Kopie einer Zeitungsnotiz in Fraktur: Dortmunder Zeitung, 4. März 1930, Familiennachrichten.',
    lesbar: '<i>Dortmunder Zeitung, 4. März 1930 · Familiennachrichten</i><br><br>Nach langem, schwerem Leiden verschied am 1. März unsere Mitbürgerin, Frau <b>Elisabeth Grest</b>, Witwe des Architekten B. Grest. Die Beisetzung findet in aller Stille statt. Von Beileidsbesuchen bittet man abzusehen.<br><br>' +
      'Die langjährige Pflegerin der Verstorbenen wird seit dem vergangenen Herbst vermisst. Zweckdienliche Hinweise nimmt die Polizeiverwaltung entgegen.',
    hinweis: 'pflegerin_vermisst', hinweisBei: 'lesen'
  });

  HG.ding('foto_1912', {
    nomen: 'Fotografie', genus: 'f', adj: ['alt'],
    woerter: ['fotografie', 'foto', 'bild', 'rollstuhl', 'pflegerin', 'kraehe', 'rueckseite', 'elisabeth'],
    ort: 'karton_grest', rel: 'in',
    beschreibung: 'Eine alte Fotografie, um 1912: Elisabeth Grest im Rollstuhl im Garten. Hinter ihr eine alte Frau in schwarzem Tuch, deren Gesicht verwischt ist, als hätte sie sich während der Belichtung bewegt. Auf ihrer Schulter sitzt eine Krähe. Auf der Rückseite steht etwas in Sütterlin.',
    lesbar: '<i>(Rückseite, Sütterlin)</i><br>„E. mit Pflegerin. Der Herr segne ihre Hände.“',
    hinweis: 'pflegerin_kraehe', hinweisBei: 'untersuchen',
    foto: 'Auf deinem Handyfoto ist die Frau hinter dem Rollstuhl nicht verwischt. Sie sieht dich an. Die Krähe auch.',
    bei: { lesen: function (api) { api.hinweis('pflegerin_kraehe'); return false; } }
  });

  // ===================================================================
  // KARTON „KÜCHE / DIVERSES“
  // ===================================================================
  HG.ding('hausrat', {
    nomen: 'Hausrat', genus: 'm',
    woerter: ['hausrat', 'geschirr', 'wasserkocher', 'buecher', 'krimis', 'vermessungshandbuch', 'weihnachtsdeko', 'deko', 'zeitungspapier'],
    ort: 'karton_kueche', rel: 'in', fest: 'Geschirr und Weihnachtsdeko brauchst du nicht.',
    beschreibung: 'Geschirr in Zeitungspapier, ein Wasserkocher, Krimis, ein Vermessungshandbuch, ein Karton Weihnachtsdeko. Ein ganzes Leben, auf das Nötigste geschrumpft.'
  });
  HG.ding('maentel', {
    nomen: 'Wintermäntel', genus: 'pl',
    woerter: ['wintermaentel', 'maentel', 'mantel', 'wintermantel', 'manteltasche', 'tasche'],
    ort: 'karton_kueche', rel: 'in', fest: 'Die Mäntel lässt du hier.',
    beschreibung: 'Zwei Wintermäntel, ordentlich gefaltet. In einer Tasche knistert Papier.',
    tasten: 'In einer Manteltasche knistert Papier.'
  });
  HG.ding('einkaufszettel', {
    nomen: 'Einkaufszettel', genus: 'm',
    woerter: ['einkaufszettel', 'zettel', 'einkaufsliste'],
    ort: 'karton_kueche', rel: 'in',
    versteckt: { bei: 'maentel', wie: ['durchsuchen', 'in', 'tasten', 'untersuchen'], text: 'In einer Manteltasche steckt ein zerknüllter Einkaufszettel.' },
    beschreibung: 'Ein zerknüllter Einkaufszettel.',
    lesbar: 'Milch<br>Brot<br><b>Spiegel abhängen!!!</b>'
  });
  HG.ding('handtuchbuendel', {
    nomen: 'Handtuchbündel', genus: 'n',
    woerter: ['handtuchbuendel', 'handtuch', 'buendel', 'klebeband', 'paket'],
    ort: 'karton_kueche', rel: 'in',
    behaelter: true, oeffenbar: true, offen: false, zeigeZustand: false,
    beschreibung: function (api) { return api.eig('handtuchbuendel', 'offen') ? 'Ein ausgewickeltes Handtuch, Reste von Klebeband daran.' : 'Etwas Flaches, Hartes, fest in ein Handtuch gewickelt und mit Klebeband umwickelt. Viel Klebeband. Als hätte jemand verhindern wollen, dass es jemals wieder ausgepackt wird.'; },
    bei: {
      oeffnen: function (api) {
        if (api.eig('handtuchbuendel', 'offen')) return false;
        api.setze('handtuchbuendel', 'offen', true);
        api.sage('Du reißt das Klebeband ab, Lage um Lage, und wickelst das Handtuch auf. Darin: ein kleiner Taschenspiegel. Das Glas zeigt nach oben – und für einen Augenblick siehst du darin nicht dein Gesicht. Sondern ein anderes, blasses, mit offenem Haar. Dann blinzelst du, und da bist nur du.');
        api.nervenProbe('1/1W6', { grund: 'Taschenspiegel' });
        api.hinweis('taschenspiegel');
        return true;
      },
      reissen: function (api, ctx) { return HG.daten.dinge.handtuchbuendel.bei.oeffnen(api, ctx); }
    }
  });
  HG.ding('taschenspiegel', {
    nomen: 'Taschenspiegel', genus: 'm', adj: ['klein'],
    woerter: ['taschenspiegel', 'spiegel', 'spiegelchen'],
    ort: 'handtuchbuendel', rel: 'in',
    beschreibung: 'Ein kleiner, runder Taschenspiegel mit angelaufenem Silberrand. Vielleicht ist er später nützlich – ein Blick dorthin, wohin man sonst nicht sieht.',
    foto: 'Im Taschenspiegel auf dem Foto: eine Zimmerdecke, die nicht diese ist. Stuck. Ein Kronleuchter.',
    bei: { hineinschauen: function (api) { api.sage('Dein Gesicht. Nur dein Gesicht. Ganz sicher.'); return true; } }
  });

  // ===================================================================
  // CARSTENS TAGEBUCH
  // ===================================================================
  HG.ding('tagebuch', {
    nomen: 'Tagebuch', genus: 'n', adj: ['schwarz'],
    woerter: ['tagebuch', 'notizbuch', 'buch', 'heft', 'gummiband', 'eintraege'],
    ort: 'campingtisch', rel: 'auf',
    beschreibung: 'Ein schwarzes Notizbuch mit Gummiband, eng beschrieben. Anfangs ist die Schrift sauber, am Ende fahrig. Carstens Tagebuch. <span class="nebenbei">(„lies tagebuch“, „lies eintrag 3“)</span>',
    foto: 'Das Tagebuch auf dem Campingtisch. Auf dem Foto ist es aufgeschlagen, obwohl du es zugeklappt hast.',
    buch: {
      titel: 'Carstens Tagebuch',
      dauerProSeite: 2,
      schrift: 'hand',
      seiten: [
        { titel: '3. August 2025', hinweis: 'tb_kauf',
          text: 'Heute den Kaufvertrag unterschrieben. Ein Jugendstilhaus in Kirchhörde für ein Drittel des Werts. Der Makler hat beim Unterschreiben nicht einmal hochgesehen. Er hat nur gesagt, die Vorbesitzerin sei „verunglückt“ und das Haus sei „etwas eigen“. Ich bin achtundfünfzig und habe zum ersten Mal ein eigenes Haus. Mutter wäre stolz.' },
        { titel: '21. August 2025', hinweis: 'tb_lavendel',
          text: 'Jede Nacht gegen drei: Lavendel. So intensiv, als stünde jemand mit einem Flakon neben dem Bett. Ich besitze nichts mit Lavendel. Tagsüber riecht das Haus nach Staub und Bohnerwachs.' },
        { titel: '9. September 2025', hinweis: 'tb_spiegelzimmer',
          text: 'Hinter der Tapete im ersten Stock eine Tür gefunden. Dahinter ein Zimmer voller Spiegel, an allen vier Wänden und an der Decke. Jeder Spiegel ist mit einem Bettlaken verhängt, mit Reißzwecken festgemacht. Das war sicher die Romanow. Ich habe ein Laken abgenommen. Hinter mir war nichts. Ich habe es trotzdem wieder aufgehängt.' },
        { titel: '2. Oktober 2025', hinweis: 'fremde_nummern',
          text: 'Die Nachbarin, Frau Kolbe, hat mir erzählt, dass vor der Romanow ein Mädchen in diesem Haus gestorben ist. Die Tochter der Gerdes. Im Zimmer „mit den Spiegeln“. Ich habe Peter Gerdes angerufen. Er hat aufgelegt, sobald ich den Straßennamen sagte. Eine Stunde später kam eine SMS von seiner Nummer: „Sie wohnen jetzt bei ihr. Grüßen Sie Bettina.“<br>Ich habe zurückgerufen. Er hat geschworen, dass er nichts geschrieben hat.' },
        { titel: '18. November 2025', hinweis: 'tb_dreizehn',
          text: 'Stadtarchiv. Das Haus wurde 1900 von einem Architekten namens Bernward Grest gebaut, für seine Frau Elisabeth. Er stirbt 1905, sie 1930. Dazwischen und danach: Ich habe angefangen, Todesfälle zu zählen. Ich höre bei dreizehn auf, weil ich nicht weiterzählen will.' },
        { titel: '24. Dezember 2025', hinweis: 'tb_mutter',
          text: 'Heiligabend. Um 23:40 ruft Mutter an. Mutter ist seit 2011 tot. Sie hat gesagt, ich soll nicht so viel im ersten Stock sein, das Zimmer sei „nicht für mich gemacht“. Ihre Stimme, ihr Lachen am Ende. Die Nummer im Display: meine eigene Festnetznummer.' },
        { titel: '11. Februar 2026', hinweis: 'tb_bleib',
          text: 'Ich habe den Lagerraum bei Schmidt gemietet. Alles, was ich über das Haus herausfinde, kommt hierher. Im Haus habe ich das Gefühl, dass es mitliest. Gestern Nacht lag mein Notizbuch aufgeschlagen auf dem Küchentisch, an einer Stelle, an der ich nichts geschrieben hatte. In meiner Handschrift stand dort: „Bleib.“' },
        { titel: '3. April 2026', hinweis: 'tb_pistole',
          text: 'Jemand geht nachts die Treppe hinauf. Jede Nacht, die gleichen schweren Schritte, dann das Quietschen der Tapetentür. Ich habe mir in der Nordstadt eine Pistole besorgt, ohne Papiere, ich weiß. Gestern habe ich mit der Waffe in der Hand oben gestanden. Die Schritte sind durch mich hindurchgegangen. Die Waffe bleibt hier im Lager. Im Haus traue ich mir selbst nicht mehr, wenn ich sie bei mir habe.' },
        { titel: '19. Juni 2026', hinweis: 'tb_brand_plan',
          text: 'Ich verstehe es nicht, und ich werde es nicht verstehen. Also muss es brennen. Drei Kanister, sechzig Liter. Das reicht für die Halle und die Treppe. Und das Zimmer.' },
        { titel: '14. August 2026', hinweis: ['tb_brand', 'fremde_nummern'],
          text: 'Ich habe es versucht. Die Kanister standen in der Halle, das Benzin war verteilt. Dann klingelte mein Handy: Peter Gerdes, weinend, er sei in der Nähe, ob er vorbeikommen dürfe. Er wolle nur noch einmal Bettinas Zimmer sehen. Ich habe gewartet, vier Stunden lang. Peter Gerdes lebt seit Januar in Portugal. Als ich die Streichhölzer nehmen wollte, waren sie nass. Alle. In einer verschlossenen Packung.<br>Ich habe die Kanister wieder ins Lager gebracht. Sie wollte nicht, dass das Haus brennt. Und ich habe gemerkt: Ich wollte es auch nicht mehr.' },
        { titel: '28. September 2026', hinweis: 'drei_regeln',
          text: 'Testament gemacht. Das Haus geht an das einzige Familienmitglied, das nie etwas mit ihm zu tun hatte. Wir haben uns einmal gesehen, auf Tante Gerdas Siebzigstem; du warst vielleicht acht. Du erinnerst dich nicht an mich. Vielleicht ist das gut so. Vielleicht sieht es dich nicht kommen.<br><br>Drei Regeln, falls du das hier liest:<br><b>Geh nicht nachts hinein.<br>Sieh nicht zu lange in die Spiegel.<br>Glaub keiner Nachricht und keinem Anruf, die du nicht selbst überprüft hast. Auch nicht von mir.</b>' },
        { titel: '7. Oktober 2026', hinweis: 'von_drueben',
          text: '<i>(Die Schrift ist kaum lesbar, als wäre sie mit links geschrieben.)</i><br>Sie hat mir ein Geschenk gemacht. Es lag heute Morgen auf dem Waschbecken. Ein Rasiermesser mit Perlmuttgriff, auf der Klinge eingraviert: 1906. Es ist so schön. Ich habe es nicht gekauft. Niemand hat es gekauft. Es ist von DRÜBEN.<br>Sie sagt, es tut nicht weh.' },
        { titel: 'Letzte Seite', schrift: 'druck', hinweis: 'tagebuch_willkommen',
          // erscheint erst, wenn die Spielfigur das Haus mindestens einmal betreten hat
          bedingung: function () { return !!HG.zustand.z.besucht.halle; },
          text: '<i>(Danach sind die Seiten leer. Auf der allerletzten Seite steht eine einzige Zeile in sauberer, altmodischer Handschrift, die nicht Carsten gehört.)</i><br><br><span style="font-family:\'Segoe Script\',cursive;font-size:1.3em">Willkommen zu Hause.</span>',
          beimLesen: function (api) { api.nervenProbe('1/1W6', { grund: 'Willkommen zu Hause' }); } }
      ]
    }
  });

})();
