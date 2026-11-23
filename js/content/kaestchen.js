// Haus Grest – Inhalt: Rätsel „Bernwards Kästchen“ (Lager Schmidt, Einheit C-214)
//
// Carsten hat das Kästchen im Januar 2026 hinter der Täfelung im Arbeitszimmer gefunden und ins Lager gebracht
// (Tagebuch 12.1.2026). Spielbibel, Abschnitt 6c. Lösungsschritte:
//   1. Die Zierleiste lässt sich verschieben (untersuchen/tasten/durchsuchen, Suchen-Probe – oder einfach „schiebe leiste“).
//   2. Darunter ein Schlitz in Form eines Zirkels. Der Zirkel liegt im Karton GREST ganz unten, unter der Fotografie
//      („durchsuche grest-karton“).
//      „stecke zirkel in schlitz“ / „benutze zirkel mit kästchen“ – danach lassen sich die Ringe drehen.
//   3. „Unser Tag“ = Hochzeitstag 12. Mai 1898 → „drehe ringe auf 1205“ (Hinweis: Bernwards Brief im Arbeitszimmer).
//   4. Inhalt: Bernwards letzter Brief (1905) und Elisabeths Ehering.
// Gestaffelte Hinweise nach Fehlversuchen (zahlenschloss.tipps, Engine: api.fehlversuch).
// Andere Wege: Handwerk (grobes Werkzeug −20, Handwerker ohne Malus; Feinmechaniker-Set +20) oder Gewalt (Stärke-Probe,
// der Brief wird zerrissen). Keiner endet in einer Sackgasse. Alles per Text und in der Nahansicht lösbar.
(function () {

  function eig(api, k) { return api.eig('kaestchen', k); }
  function offen(api) { return !!eig(api, 'offen') || !!eig(api, 'weg'); }
  function leisteOffen(api) { return !!api.eig('zierleiste', 'verschoben'); }
  function zirkelSteckt(api) { return api.eig('zirkel', 'ort') === 'kaestchen'; }

  /** Das Kästchen öffnet sich – auf welchem Weg auch immer. */
  function oeffne(api, weg) {
    api.setze('kaestchen', 'offen', true);
    api.setze('kaestchen', 'weg', weg);
    api.sound('kaestchen-auf');
    if (weg === 'code') {
      api.sage('Die Ringe rasten ein: 1 – 2 – 0 – 5. Einen Herzschlag lang geschieht nichts. Dann ein tiefes, sattes Klacken im Inneren, als würde ein Riegel zurückgleiten, den jemand vor hundertzwanzig Jahren vorgeschoben hat. ' +
        'Der Deckel hebt sich einen Fingerbreit. Eine Fuge, wo eben noch keine war.');
    } else if (weg === 'handwerk') {
      api.sage('Ein Federstift gibt nach, dann ein zweiter. Mit einem Ruck springen alle vier Ringe frei, und der Deckel hebt sich einen Fingerbreit. Bernward hätte es dir wohl nicht verziehen – aber der Mechanismus ist heil.');
    } else {
      api.setze('brief_1905', 'zerrissen', true);
      api.sage('Das Holz kreischt, dann splittert es. Der Deckel bricht entlang einer Fuge auf, die es eben noch nicht gab. Papier reißt dabei – ein Brief im Inneren hat sich in der Mechanik verfangen.');
    }
    api.sage('Darin, auf verblichenem Samt: ein gefalteter Brief ' + (weg === 'gewalt' ? '– jetzt zerrissen – ' : '') + 'und ein schmaler goldener Ring.');
  }

  // ------------------------------------------------------------ Das Kästchen
  HG.ding('kaestchen', {
    nomen: 'Kästchen', genus: 'n', adj: ['schwer'], kurzwort: 'kästchen',
    woerter: ['kaestchen', 'kasten', 'kiste', 'schatulle', 'holzkaestchen', 'nussbaumkaestchen', 'deckel'],
    ort: 'campingtisch', rel: 'auf',
    behaelter: true, oeffenbar: true, offen: false, zeigeZustand: false,
    beschreibung: function (api) {
      var t = 'Ein Kästchen aus dunklem Nussbaum, etwa so groß wie ein Schuhkarton, schwerer, als es sein dürfte. Messingbeschläge an den Ecken. ';
      if (eig(api, 'weg') === 'gewalt') return t + 'Der Deckel ist aufgebrochen, das Holz an der Fuge gesplittert. Innen verblichener Samt.';
      if (offen(api)) return t + 'Der Deckel steht offen, innen verblichener Samt. Auf dem Deckel die Messingrosette mit den vier Ringen: 1 – 2 – 0 – 5.';
      t += 'Kein Schloss, kein Scharnier, keine Fuge – als wäre es aus einem Stück gewachsen. Auf dem Deckel eine Messingrosette mit vier drehbaren Ringen, auf jedem die Ziffern 0 bis 9. ' +
        'Darüber eine Gravur. ';
      if (!leisteOffen(api)) t += 'An einer Seite verläuft eine kaum sichtbare Zierleiste.';
      else t += 'An der Seite ist die Zierleiste zur Seite geschoben; darunter ' + (zirkelSteckt(api) ? 'steckt der kleine Zirkel in seinem Schlitz.' : 'ein schmaler, seltsam geformter Schlitz.');
      return t;
    },
    tasten: 'Glattes, kühles Holz, Messing an den Ecken. Wenn du es bewegst, klappert innen etwas Kleines.',
    texte: { schuetteln: 'Du schüttelst das Kästchen vorsichtig. Innen klappert etwas Kleines, Hartes – und etwas raschelt. Papier.' },
    riechen: 'Altes Holz, Wachs, Messing. Und darunter, kaum zu ahnen: Lavendel.',
    foto: 'Auf dem Handyfoto stehen die Ringe auf einer anderen Zahl als in Wirklichkeit. Du kannst sie nicht entziffern.',
    hinweis: 'kaestchen_gravur', hinweisBei: 'untersuchen',
    // Zahlenschloss (allgemeine Engine-Funktion): erst drehbar, wenn der Zirkel steckt
    zahlenschloss: {
      stellen: 4, code: '1205',
      bereit: function (api) {
        if (offen(api)) return 'Das Kästchen ist schon offen.';
        if (!zirkelSteckt(api)) return 'Du versuchst, die Ringe zu drehen. Sie sitzen fest, als hielte sie etwas von innen.';
        return true;
      },
      richtig: function (api) { oeffne(api, 'code'); },
      // Gestaffelte Hinweise (api.fehlversuch): beim 2. und 3. vergeblichen Versuch immer deutlicher – je nach Stand
      tipps: {
        gesperrt: {
          2: function (api) {
            if (!leisteOffen(api)) return 'Etwas blockiert die Ringe von innen, wie ein Riegel. Vielleicht gibt es am Kästchen einen zweiten Mechanismus. Die Zierleiste an der Seite wirkt nicht ganz so fest wie der Rest.';
            return 'Der Schlitz unter der Leiste muss der Schlüssel sein – nur passt kein Schlüssel hinein. Seine Form erinnert an ein Zeichenwerkzeug.';
          },
          3: function (api) {
            if (!leisteOffen(api)) return 'Die Zierleiste. Versuch, sie zur Seite zu schieben. <span class="nebenbei">(„schiebe leiste“)</span>';
            if (api.traegt('zirkel')) return 'Der Schlitz hat genau die Form des kleinen Messingzirkels, den du bei dir trägst. <span class="nebenbei">(„stecke zirkel in schlitz“)</span>';
            return 'Der Schlitz hat die Form eines Zirkels – das Werkzeug eines Architekten. Carsten hat alles über die Grests in einem Karton gesammelt. Vielleicht liegt dort mehr als nur ein Foto. <span class="nebenbei">(„durchsuche grest-karton“)</span>';
          }
        },
        falsch: {
          2: '„Was ich für E. erbaute, öffnet nur, wer unseren Tag kennt.“ Vier Ringe – vier Ziffern. Ein Tag, den nur zwei Menschen „unseren“ nennen.',
          3: 'Ein Datum mit vier Ziffern: Tag und Monat. Bernwards eigene Papiere – sein Brief im Arbeitszimmer des Hauses – erzählen vielleicht, welcher Tag ihnen gehörte.'
        }
      },
      falsch: function (api) { return 'Die Ringe rasten ein: ' + String(api.eig('kaestchen', 'ziffern')).split('').join(' – ') + '. Ein leises Klicken im Inneren – dann nichts. Der Deckel bleibt, wo er ist.'; }
    },
    // Nahansicht mit anklickbaren Bereichen (SVG in js/content/bilder.js: HG.daten.bilder.nah_kaestchen)
    nahansicht: {
      groesse: [800, 600],
      svg: function (api) { return HG.daten.bilder.nah_kaestchen(api); },
      ringe: [[310, 262, 28], [370, 262, 28], [430, 262, 28], [490, 262, 28]],
      bereiche: [
        { titel: 'Gravur', r: [210, 160, 380, 50], befehl: 'lies gravur', sichtbar: function (api) { return !offen(api); } },
        { titel: 'Zierleiste', r: [150, 462, 500, 34], befehl: function (api) { return leisteOffen(api) ? 'untersuche leiste' : 'schiebe leiste'; } },
        { titel: 'Schlitz', r: [205, 455, 90, 50], sichtbar: leisteOffen,
          befehl: function (api) { return zirkelSteckt(api) ? 'untersuche zirkel' : api.traegt('zirkel') ? 'stecke zirkel in schlitz' : 'untersuche schlitz'; } },
        { titel: 'Messingbeschläge', r: [120, 120, 60, 60], befehl: 'taste kästchen ab', sichtbar: function (api) { return !offen(api); } },
        { titel: 'Inneres', r: [180, 330, 440, 100], befehl: 'schau in kästchen', sichtbar: offen }
      ]
    },
    bei: {
      oeffnen: function (api, ctx) {
        if (offen(api) || eig(api, 'weg')) return false;   // einmal geöffnet: normaler Deckel
        if (ctx.obj2 && HG.daten.dinge[ctx.obj2].werkzeug) return knacke(api, ctx.obj2);
        api.sage('Du suchst nach einem Deckel, einer Fuge, irgendetwas zum Ansetzen. Nichts gibt nach. Die Gravur auf dem Deckel scheint dich auszulachen.');
        return true;
      },
      schliessen: function (api) { if (eig(api, 'weg') === 'gewalt') { api.sage('Der Deckel ist zersplittert. Er lässt sich nicht mehr schließen.'); return true; } return false; },
      knacken: function (api, ctx) { return knacke(api, ctx.obj2); },
      zerbrechen: function (api, ctx) { return breche(api, ctx.obj2); },
      benutzen: function (api, ctx) {
        // "benutze X mit kästchen"
        if (ctx.obj === 'zirkel') return setzeZirkel(api);
        if (ctx.obj !== 'kaestchen' && HG.daten.dinge[ctx.obj].werkzeug) return knacke(api, ctx.obj);
        return false;
      },
      legen: function (api, ctx) { if (ctx.obj === 'zirkel' && ctx.obj2 === 'kaestchen') return setzeZirkel(api); return false; }
    },
    // Suchen-Probe beim gründlichen Absuchen: findet heraus, dass die Leiste locker ist (nötig ist das nicht)
    proben: {
      durchsuchen: leistenProbe(),
      tasten: leistenProbe()
    }
  });

  function leistenProbe() {
    return {
      wer: 'suchen', mod: 20, modGrund: 'du suchst gezielt', grund: 'Kästchen absuchen',
      wenn: function (api) { return !offen(api) && !leisteOffen(api) && !api.flag('leiste_lose'); },
      erfolg: function (api) { api.setzeFlag('leiste_lose'); return 'Zentimeter für Zentimeter tastest du das Holz ab. An der Zierleiste stockt dein Finger: Sie sitzt nicht fest. Sie lässt sich verschieben.'; },
      misserfolg: 'Glattes Holz, kühle Beschläge, die vier Ringe. Wenn es hier einen Trick gibt, findest du ihn nicht – oder du suchst an der falschen Stelle. Vielleicht lohnt ein genauerer Blick auf die Zierleiste.'
    };
  }

  // ------------------------------------------------------------ Teile (rel: 'teil' – immer mit dem Kästchen sichtbar)
  HG.ding('gravur', {
    nomen: 'Gravur', genus: 'f', woerter: ['gravur', 'inschrift', 'schrift', 'spruch'],
    ort: 'kaestchen', rel: 'teil', fest: true, szenerie: true,
    beschreibung: 'Feine, sorgfältige Buchstaben, ins Holz des Deckels gestochen und mit Messing ausgelegt.',
    lesbar: '„Was ich für E. erbaute, öffnet nur, wer unseren Tag kennt.“',
    hinweis: 'kaestchen_gravur', hinweisBei: 'lesen'
  });
  HG.ding('rosette', {
    nomen: 'Rosette', genus: 'f', adj: ['messingfarben'],
    woerter: ['rosette', 'messingrosette', 'ringe', 'zahlenringe', 'zahlenring', 'ziffern', 'zahlenschloss', 'schloss', 'code', 'drehringe'],
    ort: 'kaestchen', rel: 'teil', fest: true, szenerie: true, teilVon: 'kaestchen',
    beschreibung: function (api) {
      var z = String(api.eig('kaestchen', 'ziffern') || '0000').split('').join(' – ');
      if (offen(api)) return 'Die Messingrosette auf dem Deckel. Die vier Ringe stehen auf 1 – 2 – 0 – 5.';
      return 'Eine Messingrosette mit vier Ringen nebeneinander, auf jedem die Ziffern 0 bis 9. Sie stehen auf ' + z + '. ' +
        (zirkelSteckt(api) ? 'Seit der Zirkel steckt, lassen sie sich drehen. <span class="nebenbei">(„drehe ringe auf …“)</span>' : 'Sie lassen sich nicht drehen, als hielte sie etwas von innen fest.');
    }
  });
  HG.ding('zierleiste', {
    nomen: 'Zierleiste', genus: 'f', woerter: ['zierleiste', 'leiste', 'holzleiste'],
    ort: 'kaestchen', rel: 'teil', fest: true, szenerie: true,
    beschreibung: function (api) {
      if (leisteOffen(api)) return 'Die Zierleiste ist zur Seite geschoben. Darunter liegt ein schmaler Schlitz.';
      return 'Eine schmale Leiste aus hellerem Holz, die an einer Seite des Kästchens entlangläuft. An einem Ende ein haarfeiner Spalt – als ließe sie sich verschieben.';
    },
    bei: {
      schieben: function (api) {
        if (offen(api) && api.eig('kaestchen', 'weg') === 'gewalt') { api.sage('Die Leiste ist mit dem Deckel zersplittert.'); return true; }
        if (leisteOffen(api)) { api.sage('Die Leiste ist schon zur Seite geschoben.'); return true; }
        api.setze('zierleiste', 'verschoben', true);
        api.setze('schlitz', 'versteckt', false);
        api.sage('Du drückst gegen das Ende der Leiste. Erst nichts – dann gleitet sie mit einem trockenen Schaben zur Seite. Darunter: ein schmaler Schlitz, seltsam geformt. Zwei schlanke Schenkel, oben ein kleiner Kreis. ' +
          'Die Form eines <b>Zirkels</b>.');
        return true;
      },
      ziehen: function (api, ctx) { return HG.daten.dinge.zierleiste.bei.schieben(api, ctx); },
      druecken: function (api, ctx) { return HG.daten.dinge.zierleiste.bei.schieben(api, ctx); }
    }
  });
  HG.ding('schlitz', {
    nomen: 'Schlitz', genus: 'm', woerter: ['schlitz', 'oeffnung', 'aussparung', 'form'],
    ort: 'kaestchen', rel: 'teil', fest: true, szenerie: true,
    versteckt: true,   // erst sichtbar, wenn die Leiste verschoben ist (siehe zierleiste)
    beschreibung: function (api) {
      return zirkelSteckt(api) ? 'Im Schlitz steckt der kleine Messingzirkel, bis zum Griff versenkt.'
        : 'Ein schmaler Schlitz im Holz, genau so geformt wie ein kleiner Zeichenzirkel: zwei Schenkel, oben ein Kreis für den Griff.';
    },
    bei: { legen: function (api, ctx) { if (ctx.obj === 'zirkel') return setzeZirkel(api); api.sage('Das passt nicht in den Schlitz.'); return true; } }
  });

  function setzeZirkel(api) {
    if (offen(api)) { api.sage('Das Kästchen ist schon offen.'); return true; }
    if (!leisteOffen(api)) { api.sage('Du hältst den Zirkel an das Kästchen. Nirgends eine Öffnung, in die er passen könnte. Noch nicht.'); return true; }
    if (zirkelSteckt(api)) { api.sage('Der Zirkel steckt schon im Schlitz.'); return true; }
    if (!api.traegt('zirkel')) { api.sage('Du hast den Zirkel nicht bei dir.'); return true; }
    api.bewege('zirkel', 'kaestchen', 'teil');
    api.setze('zirkel', 'fest', 'Der Zirkel sitzt fest im Schlitz. Er gibt nicht mehr nach.');
    api.sound('klick');
    api.sage('Du setzt den Zirkel in den Schlitz. Er gleitet hinein, als wäre er nie woanders gewesen. Ein Klicken, tief im Holz – und auf dem Deckel geben die vier Ringe ein wenig nach. <b>Jetzt lassen sie sich drehen.</b>');
    return true;
  }

  // ------------------------------------------------------------ Weg 2: Fertigkeit (Handwerk)
  function knacke(api, werkzeugId) {
    if (offen(api)) { api.sage('Das Kästchen ist schon offen.'); return true; }
    var q = werkzeugId ? (HG.daten.dinge[werkzeugId].werkzeug || 0) : 0;
    if (!q) { api.sage('Mit bloßen Händen kommst du nicht an den Mechanismus. Du bräuchtest etwas Feines, Spitzes – Werkzeug.'); return true; }
    if (!api.traegt(werkzeugId)) { api.sage('Dafür musst du ' + api.der(werkzeugId, 'akk') + ' in der Hand haben.'); return true; }
    if (api.flag('kaestchen_hakt') && q < 2) { api.sage('Der Mechanismus hakt seit deinem letzten Versuch. Mit ' + api.der(werkzeugId, 'dat') + ' kommst du nicht weiter – du bräuchtest feineres Werkzeug.'); return true; }
    api.sage('Du setzt ' + api.der(werkzeugId, 'akk') + ' an der Rosette an und tastest nach den Federn hinter den Ringen.');
    // grobes Werkzeug: −20 (Handwerker(in) ohne Malus); Feinmechaniker-Set: +20
    var e = api.probe('handwerk', { mod: q >= 2 ? 20 : -20, modGrund: q >= 2 ? 'Feinmechaniker-Set' : 'grobes Werkzeug', grund: 'Mechanismus überlisten', beruf: q >= 2 ? null : { handwerk: 0 } });
    if (e.erfolg) { oeffne(api, 'handwerk'); return true; }
    api.setzeFlag('kaestchen_hakt');
    if (e.patzer) {
      api.sage('Das Werkzeug rutscht ab und fährt dir in die Finger.');
      api.verletze('1', { grund: 'abgerutscht' });
    }
    api.sage(q >= 2 ? 'Eine Feder schnappt zurück. Fast. Mit etwas Ruhe könntest du es noch einmal versuchen.' : 'Etwas im Inneren verklemmt sich mit einem hässlichen Knirschen. Der Mechanismus hakt. Mit diesem Werkzeug kommst du nicht weiter.');
    return true;
  }

  // ------------------------------------------------------------ Weg 3: Gewalt (Stärke)
  function breche(api, werkzeugId) {
    if (offen(api)) { api.sage(api.eig('kaestchen', 'weg') === 'gewalt' ? 'Es ist schon aufgebrochen.' : 'Das Kästchen ist offen. Es gibt keinen Grund mehr, es zu zerstören.'); return true; }
    var versuche = api.zaehle('kaestchen_gewalt');
    var hebel = werkzeugId && HG.daten.dinge[werkzeugId].werkzeug && api.traegt(werkzeugId);
    var mod = -30 + Math.min(30, (versuche - 1) * 10) + (hebel ? 10 : 0);   // jeder Versuch lockert das Holz ein wenig
    var e = api.probe('st', { mod: mod, modGrund: 'massives Nussholz' + (versuche > 1 ? ', schon gelockert' : '') + (hebel ? ', mit Hebel' : ''), grund: 'Kästchen aufbrechen' });
    if (e.erfolg) { oeffne(api, 'gewalt'); return true; }
    if (e.patzer) { api.sage('Du rutschst ab. Ein Holzsplitter fährt dir tief in den Handballen.'); api.verletze('1W3', { grund: 'Holzsplitter' }); }
    else api.sage('Das Holz ächzt, aber es hält. ' + (versuche < 3 ? 'Noch ein Versuch, und es gibt vielleicht nach.' : 'Die Fuge, wo keine sein dürfte, zeichnet sich schon ab.'));
    return true;
  }

  // ------------------------------------------------------------ Zirkel und Werkzeug
  HG.ding('zirkel', {
    nomen: 'Zirkel', genus: 'm', adj: ['klein'],
    woerter: ['zirkel', 'zeichenzirkel', 'messingzirkel'],
    ort: 'karton_grest', rel: 'in',
    // Der offene Karton verrät „etwas Hartes unter dem Foto“ – darum finden ihn auch „nimm etwas hartes“, „untersuche das harte“,
    // „schau unter foto“, „heb foto hoch“, „nimm foto heraus“ (Engine: andeutung, auchBei – js/engine/welt.js)
    versteckt: {
      bei: 'karton_grest', wie: ['durchsuchen', 'tasten', 'in', 'unter'], nurOffen: true,
      auchBei: { foto_1912: ['unter', 'anheben', 'nehmen', 'schieben', 'durchsuchen'] },
      andeutung: ['hart', 'schwer', 'taschentuch', 'gegenstand', 'ding'],
      text: 'Ganz unten im Karton, unter der Fotografie, ertastest du etwas Hartes, in ein Taschentuch gewickelt: ein kleiner Zeichenzirkel aus Messing.'
    },
    beschreibung: function (api) {
      return 'Ein kleiner Zeichenzirkel aus Messing, sorgfältig gearbeitet, die Spitzen seltsam stumpf geschliffen – zum Zeichnen taugt er so nicht. In den Griff sind zwei Buchstaben eingeschlagen: <b>B. G.</b>' +
        (zirkelSteckt(api) ? ' Er steckt im Schlitz des Kästchens.' : '');
    },
    bei: {
      benutzen: function (api, ctx) {
        if (['kaestchen', 'schlitz', 'rosette', 'zierleiste'].indexOf(ctx.obj2) >= 0) return setzeZirkel(api);
        return false;
      },
      legen: function (api, ctx) { if (['kaestchen', 'schlitz'].indexOf(ctx.obj2) >= 0) return setzeZirkel(api); return false; }
    }
  });
  HG.ding('kugelschreiber', {
    nomen: 'Kugelschreiber', genus: 'm', adj: ['leer'],
    woerter: ['kugelschreiber', 'kuli', 'stift'],
    ort: 'campingtisch', rel: 'auf',
    werkzeug: 1,    // grobes Werkzeug für das Kästchen
    beschreibung: 'Ein billiger, leerer Kugelschreiber. Die Mine ist ausgetrocknet, die Spitze aber schön fein.'
  });
  HG.ding('feinwerkzeug', {
    nomen: 'Feinmechaniker-Set', genus: 'n', kurzwort: 'werkzeug',
    woerter: ['feinmechanikerset', 'feinmechaniker', 'set', 'werkzeug', 'werkzeugset', 'etui', 'schraubendreher', 'uhrmacherwerkzeug', 'pinzette'],
    ort: 'karton_kueche', rel: 'in',
    werkzeug: 2,    // feines Werkzeug: +20 auf Handwerk
    beschreibung: 'Ein schmales Lederetui mit winzigen Schraubendrehern, Pinzetten und einer Lupe. Carsten war Vermessungsingenieur – damit hat er wohl seine Instrumente gepflegt.'
  });

  // ------------------------------------------------------------ Inhalt
  // Ein echter Gegenstand (kein Nur-Foto-Dokument): Bernwards Original kommt ins Inventar (David, 23.11.2026).
  HG.ding('brief_1905', {
    nomen: 'Brief', zusatz: 'von 1905', genus: 'm', adjektive: ['gefaltet', 'letzt', 'zerrissen'], kurzwort: '1905er-brief',
    woerter: ['brief', 'briefbogen', '1905', '1905er', '1905er-brief', 'abschiedsbrief', 'bernwards', 'papier'],
    ort: 'kaestchen', rel: 'in', schriftart: 'hand',
    beschreibung: function (api) {
      return api.eig('brief_1905', 'zerrissen')
        ? 'Ein Briefbogen, mitten durchgerissen und an den Rändern zerfasert. Dieselbe schräge Handschrift wie in Bernwards Brief im Arbeitszimmer.'
        : 'Ein gefalteter Briefbogen in Bernwards sauberer, schräger Handschrift. Er ist an „E.“ gerichtet.';
    },
    // [Vorschlag] Wortlaut – der Brief verrät nichts über die Spiegel (die kommen erst nach 1908)
    lesbar: function (api) {
      if (api.eig('brief_1905', 'zerrissen')) {
        return '<i>Haus Grest, im Frühjahr 1905</i><br><br>Meine E.,<br>wenn Du dies … <i>(Riss)</i> … für Dich gebaut, jeden Raum … <i>(Riss)</i> … ein Haus könne einen Menschen halten. Seit fünf Jahren sehe ich zu, wie es Dich … <i>(Riss)</i><br><br>' +
          '… Deinen Ring hierher … <i>(der Rest ist zerfetzt)</i> … Unser Tag kommt wieder, E. … <i>(Riss)</i><br><br>Dein B.';
      }
      return '<i>Haus Grest, im Frühjahr 1905</i><br><br>Meine E.,<br>wenn Du dies liest, habe ich endlich den Mut gefunden, es Dir zu sagen – oder er hat mich verlassen, und Du findest es nach mir.<br><br>' +
        'Ich habe dieses Haus für Dich gebaut, jeden Raum nach Deinem Wunsch. Ich glaubte, ein Haus könne einen Menschen halten. Seit fünf Jahren sehe ich zu, wie es Dich hält – und nicht loslässt.<br><br>' +
        'Ich habe die Pläne wieder und wieder geprüft. Ich finde keinen Fehler. Und doch weiß ich, dass ich einen gemacht habe.<br><br>' +
        'Ich lege Dir Deinen Ring hierher, den Du nicht mehr tragen magst, weil Deine Finger so dünn geworden sind. Ich verwahre ihn, bis Du gesund bist. Unser Tag kommt wieder, E. Ich verspreche es.<br><br>Dein B.';
    },
    hinweis: 'bernwards_letzter_brief', hinweisBei: 'lesen'
  });
  HG.ding('ehering', {
    nomen: 'Ehering', genus: 'm', adj: ['schmal', 'golden'],
    woerter: ['ehering', 'ring', 'goldring', 'trauring'],
    ort: 'kaestchen', rel: 'in',
    beschreibung: 'Ein schmaler goldener Ring, abgegriffen und warm, als hätte ihn eben noch jemand getragen. Innen eine Gravur: <i>„B. 12. V. 1898“</i>.',
    riechen: 'Lavendel. Ganz deutlich.',
    foto: 'Auf dem Foto liegt der Ring nicht in deiner Hand, sondern an einem Finger. Einem sehr dünnen.',
    hinweis: 'elisabeths_ring', hinweisBei: 'untersuchen'
  });

  // ------------------------------------------------------------ Spuk [Vorschlag]: das Haus will nicht, dass man es öffnet
  HG.spuk('kaestchen_ringe', {
    art: 'geraeusch', schauplatz: 'haus', zeiten: ['nacht'], chance: 0.35, max: 3,
    bedingung: function (api) { return api.traegt('kaestchen') && !offen(api) && zirkelSteckt(api); },
    text: 'Klick. Klick. Klick. Ein feines Drehen, ganz nah – an deinem Körper. Jemand dreht an den Ringen des Kästchens, das du bei dir trägst. Als du hinsiehst, stehen sie auf einer anderen Zahl.',
    nerven: '0/1W3', grund: 'Geräusch',
    aktion: function (api) {
      var z = ''; for (var i = 0; i < 4; i++) z += Math.floor(Math.random() * 10);
      if (z === '1205') z = '1250';
      api.setze('kaestchen', 'ziffern', z);
    }
  });

  // ------------------------------------------------------------ Hinweise und Schlussfolgerung
  HG.hinweis('kaestchen_gravur', {
    titel: 'Bernwards Kästchen', strang: 'A',
    text: 'In Carstens Lager: ein Kästchen aus Nussbaum ohne Schloss und Fuge, vier Zahlenringe auf dem Deckel. Die Gravur: „Was ich für E. erbaute, öffnet nur, wer unseren Tag kennt.“',
    stichworte: ['kaestchen', 'gravur', 'ringe']
  });
  HG.hinweis('hochzeitstag', {
    titel: '„Unser Tag“: der 12. Mai', strang: 'B',
    text: 'Bernwards Brief von 1900: Am zwölften Mai, „an unserem Tag“, wollte er Elisabeth das fertige Haus schenken – zum zweiten Hochzeitstag.',
    stichworte: ['hochzeitstag', 'mai', 'tag']
  });
  HG.hinweis('bernwards_letzter_brief', {
    titel: 'Bernwards letzter Brief (1905)', strang: 'A',
    text: 'Im Frühjahr 1905, kurz vor seinem Tod, schrieb Bernward an Elisabeth: Er habe das Haus gebaut, um sie zu halten – und sehe seit fünf Jahren zu, wie es sie hält. Er habe einen Fehler gemacht, den er nicht findet. Ihren Ring verwahre er, bis sie gesund ist.',
    stichworte: ['1905', 'letzter', 'abschied']
  });
  HG.hinweis('elisabeths_ring', {
    titel: 'Elisabeths Ehering', strang: 'B',
    text: 'Ein schmaler goldener Ring aus Bernwards Kästchen, innen graviert „B. 12. V. 1898“. Er riecht nach Lavendel.',
    stichworte: ['ehering', 'gold']
  });
  HG.schluss('unser_tag', {
    aus: ['kaestchen_gravur', 'hochzeitstag'],
    titel: 'Der Code des Kästchens',
    text: '„Wer unseren Tag kennt“ – Bernwards und Elisabeths Tag ist der 12. Mai, ihr Hochzeitstag. Vier Ringe: 1 – 2 – 0 – 5.'
  });

})();
