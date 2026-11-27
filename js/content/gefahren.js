// Haus Grest – Inhalt: die dreizehn Seelen, Manifestationen (Kämpfe), Gefahren der Diener, die Nacht
// Regeln: js/engine/gefahr.js · Spielbibel 8.4 (Seelen) und 8.9 (Gefahren, Kämpfe, Nacht).
// Muss nach den Inhaltsdateien mit den Räumen und Dingen geladen werden.
(function () {

  var G = function () { return HG.gefahren; };
  function raumName(id) { var r = HG.daten.raeume[id]; return r ? r.name : id; }

  // =====================================================================
  // 1. Die dreizehn Seelen (Spielbibel 8.4)
  //    art: 'diener' (unbekehrbar, für eine Nacht bannbar) · 'gefangen' (bekehrbar) · 'gut' (Hallmann) · 'elisabeth'
  //    wissen: Hinweise, die ihre Geschichte erzählen (alle nötig). Hinweise, die es noch nicht gibt, kommen mit
  //    Dachboden (Kisten der Vorbesitzer) und Akt 2 (Stadtarchiv, Wohnung Gerdes, Polizeiwache, Altenheim).
  // =====================================================================
  HG.seele('elisabeth', { name: 'Elisabeth Grest', jahr: 1930, art: 'elisabeth' });

  // --- Die Diener -------------------------------------------------------
  HG.seele('heinrich', {
    name: 'Heinrich Ostermann', jahr: 1933, art: 'diener', gefahr: 'schlaefer', anrede: 'Heinrich',
    wissen: ['dreizehn_kreuze', 'kiste_ostermann'],
    wahrheit: 'Heinrich, du bist im Schlaf gestorben. Du musst nicht mehr schlafen.',
    falsch: ['Heinrich, Margarete wartet unten auf dich.', 'Heinrich, das Haus gehört wieder dir.'],
    gebanntText: 'Das Bett liegt still. Die Müdigkeit fällt von dir ab wie ein nasser Mantel. Irgendwo seufzt jemand, sehr alt und sehr erleichtert.'
  });
  HG.seele('margarete', {
    name: 'Margarete Ostermann', jahr: 1938, art: 'diener', gefahr: 'witwe', anrede: 'Margarete',
    wissen: ['dreizehn_kreuze', 'kiste_ostermann'],
    wahrheit: 'Margarete, Heinrich ist tot. Im Spiegel ist nicht er.',
    falsch: ['Margarete, Heinrich wartet oben im Spiegel auf dich.', 'Margarete, du bist nur gestolpert. Das war alles.'],
    gebanntText: 'Die Gestalt am Fuß der Treppe senkt den Kopf. „Ich weiß“, sagt eine Frauenstimme, ganz leise. Dann ist die Treppe nur eine Treppe.'
  });
  HG.seele('albers', {
    name: 'Dr. Karl Albers', jahr: 1946, art: 'diener', gefahr: 'gas', anrede: 'Doktor Albers',
    wissen: ['dreizehn_kreuze', 'kiste_albers'],
    wahrheit: 'Doktor Albers, der Krieg ist vorbei. Sie haben überlebt – das Haus nicht.',
    falsch: ['Doktor Albers, drehen Sie das Gas ab.', 'Doktor Albers, Ihre Praxis wartet.'],
    gebanntText: 'Der Geruch zieht ab, als hätte jemand ein Fenster geöffnet. Am Herd steht für einen Moment ein Mann im weißen Kittel und dreht einen Knopf zu, der nicht mehr da ist.'
  });
  HG.seele('wilhelmine', {
    name: 'Wilhelmine Teubner', jahr: 1955, art: 'diener', gefahr: 'fenster', anrede: 'Wilhelmine',
    wissen: ['dreizehn_kreuze', 'kiste_teubner'],
    wahrheit: 'Wilhelmine, dein Mann ist 1944 gefallen. Er steht nicht vor dem Fenster.',
    falsch: ['Wilhelmine, er kommt bald nach Hause.', 'Wilhelmine, mach das Fenster zu, es zieht.'],
    gebanntText: 'Im Glas verblasst das Gesicht. Für einen Augenblick siehst du eine Frau im geblümten Kittel, die die Stirn an die Scheibe lehnt und weint. Dann nur noch Nacht.'
  });
  HG.seele('josef', {
    name: 'Josef Brzezinski', jahr: 1963, art: 'diener', gefahr: 'zerschlagende', anrede: 'Josef',
    wissen: ['dreizehn_kreuze', 'kiste_brzezinski'],
    wahrheit: 'Josef, die Spiegel kommen immer wieder. Du kannst sie nicht alle zerschlagen.',
    falsch: ['Josef, zerschlag sie alle, ich helfe dir.', 'Josef, die Grube ist eingestürzt.'],
    gebanntText: 'Die Hände aus den Scherben halten inne, die Finger gespreizt, voller Schnitte. Dann ziehen sie sich zurück ins Glas, langsam, wie ein Mann, der sehr müde ist.'
  });
  HG.seele('irmgard', {
    name: 'Irmgard Hallmann', jahr: 1972, art: 'diener', gefahr: 'naeherin', anrede: 'Irmgard',
    wissen: ['hallmann_brand', 'hallmann_protokolle'],
    wahrheit: 'Irmgard, das Kind, das sie dir versprochen hat, gibt es nicht.',
    falsch: ['Irmgard, Wolfgang wartet auf dich.', 'Irmgard, das Kleid ist fertig.'],
    gebanntText: 'Die Fäden erschlaffen. Irgendwo verstummt das Rattern einer Nähmaschine, mitten im Saum.'
  });
  HG.seele('brinkhoff', {
    name: 'Hans-Joachim Brinkhoff', jahr: 1986, art: 'diener', gefahr: 'baumeister', anrede: 'Herr Brinkhoff',
    wissen: ['architekt_brinkhoff', ['brinkhoff_plaene', 'kiste_brinkhoff']],
    wahrheit: 'Herr Brinkhoff, das ist nicht Ihr Haus. Es ist Bernwards – und Sie sind tot.',
    falsch: ['Herr Brinkhoff, Ihr zweites Spiegelzimmer ist fertig.', 'Herr Brinkhoff, das Haus braucht Sie noch.'],
    gebanntText: 'Die Wände rücken zurück, wo sie hingehören. Irgendwo raschelt Papier, als rolle jemand einen Plan zusammen.'
  });

  // --- Die fünf Bekehrbaren (Spielbibel 8.6.5) --------------------------
  HG.seele('hallmann', {
    name: 'Wolfgang Hallmann', jahr: 1974, art: 'gut', anrede: 'Herr Hallmann',
    wissen: ['hallmann_brand', 'zeitung_1974'], anker: 'taschenuhr', macht: 12,
    wahrheit: 'Es war nicht Irmgard, die angerufen hat. Sie hat Irmgards Stimme benutzt.',
    falsch: ['Irmgard hat Sie gerufen. Sie wollte, dass Sie kommen.', 'Sie hätten das Feuer früher legen müssen.']
  });
  HG.seele('renate', {
    name: 'Renate Vogt', jahr: 1997, art: 'gefangen', anrede: 'Frau Vogt',
    wissen: ['renate_vogt', 'kolbe_renate'], anker: 'stimmgabel', macht: 12,
    wahrheit: 'Sie singt nicht mit. Sie singt vor – und Sie müssen ihr nicht folgen.',
    falsch: ['Singen Sie mit ihr, dann ist es vorbei.', 'Die Kinder haben sich das nur ausgedacht.'],
    ding: { nomen: 'Frau', genus: 'f', adj: ['grau'], woerter: ['renate', 'vogt', 'frau', 'gestalt', 'lehrerin'], beschreibung: 'Eine Frau mit grauem Dutt und einer Strickjacke, durchsichtig wie Atem auf Glas. Ihre Lippen bewegen sich. Sie summt.' },
    erscheint: { orte: ['bad', 'salon'], phasen: ['daemmerung', 'tief'], chance: 0.25, zuege: 3,
      text: 'Ein Summen, dünn und brüchig, ganz in der Nähe. Am Rand deines Lichts steht eine Frau mit grauem Dutt und hält die Hände, als lägen sie auf Tasten.',
      weg: 'Das Summen bricht ab. Die Frau ist fort.' }
  });
  HG.seele('bettina', {
    name: 'Bettina Gerdes', jahr: 2022, art: 'gefangen', anrede: 'Bettina',
    wissen: ['bettina_gerdes', 'gespraech_brigitte'], anker: 'haarspange', macht: 12,
    wahrheit: 'Es war nicht deine Schuld. Du hast ihr nur geglaubt.',
    falsch: ['Du hättest nicht nach oben gehen dürfen.', 'Deine Eltern haben dich vergessen.'],
    ding: { nomen: 'Mädchen', genus: 'n', woerter: ['bettina', 'maedchen', 'gestalt', 'schuelerin'], beschreibung: 'Ein Mädchen von siebzehn, Kapuzenpulli, die Haare hinter die Ohren gestrichen. Sie ist nicht ganz da. Durch ihre Schultern siehst du die Tapete.' },
    erscheint: { orte: ['kinderzimmer', 'galerie'], phasen: ['daemmerung', 'tief'], chance: 0.3, zuege: 3,
      text: 'Auf dem Fußboden, mit dem Rücken zur Wand, sitzt ein Mädchen und hat die Knie angezogen. Sie sieht nicht dich an. Sie sieht zur Tür.',
      weg: 'Als du wieder hinsiehst, ist da nur die helle Stelle an der Tapete, wo ein Poster hing.' },
    bekehrt: function (api) { api.sage('„Nicht die Treppe“, sagt sie. „Wenn sie dich unten rufen – geh nicht. Ich sag’s dir, wenn es echt ist.“'); }
  });
  HG.seele('natascha', {
    name: 'Natascha Romanow', jahr: 2025, art: 'gefangen', anrede: 'Natascha',
    wissen: ['natascha_romanow', 'polizeiakte_romanow'], anker: 'spachtel', macht: 12,
    wahrheit: 'Du hast aufgeräumt. Das Kabel hat sie dir in den Weg gelegt.',
    falsch: ['Du hättest das Kabel wegräumen sollen.', 'Das Geländer war morsch, das war alles.'],
    ding: { nomen: 'Frau', genus: 'f', adj: ['blond'], woerter: ['natascha', 'romanow', 'frau', 'gestalt', 'restauratorin'], beschreibung: 'Eine Frau in staubiger Latzhose, das blonde Haar unter einem Tuch. Sie kniet am Geländer und schleift, ohne dass es ein Geräusch macht.' },
    erscheint: { orte: ['galerie', 'halle'], phasen: ['daemmerung', 'tief'], chance: 0.25, zuege: 3,
      text: 'Am Geländer kniet jemand. Eine Frau in Latzhose, ein Tuch im Haar, und schleift an einem Pfosten. Unten in der Halle brummt ein Staubsauger, der nicht da ist.',
      weg: 'Der Staubsauger verstummt. Am Geländer ist niemand.' },
    bekehrt: function (api) { api.sage('Sie legt die flache Hand auf den Boden, als horche sie durch die Dielen nach unten. „Da unten“, sagt sie. „Wo die Wand zu neu ist.“'); }
  });
  HG.seele('carsten', {
    name: 'Carsten Häuser', jahr: 2026, art: 'gefangen', anrede: 'Carsten',
    wissen: ['tb_wandlung', 'testament', 'polizeiakte_haeuser'], anker: 'tagebuch', macht: 20,
    wahrheit: 'Sie hat dich nicht geliebt. Sie wollte nur Familie im Haus – deshalb erbe ich.',
    falsch: ['Sie liebt dich. Sie wartet auf dich.', 'Du hättest das Haus nie kaufen sollen.'],
    ding: { nomen: 'Mann', genus: 'm', woerter: ['carsten', 'haeuser', 'mann', 'gestalt', 'cousin', 'vetter'], beschreibung: 'Carsten. Er sieht aus wie auf dem Foto im Lager, nur blasser, und er lächelt, als hätte er dich erwartet.' },
    erscheint: { orte: ['gaestezimmer'], phasen: ['daemmerung', 'tief'], chance: 0.2, zuege: 3,
      text: 'Auf der Bettkante sitzt Carsten. Er hat zwei Tassen in den Händen und hält dir eine hin. „Du bist ja doch gekommen“, sagt er. „Sie hat gesagt, du kommst.“',
      weg: 'Die Bettkante ist leer. Auf dem Nachttisch stehen zwei Tassen.' }
  });

  // =====================================================================
  // 2. Manifestationen (Kämpfe, Spielbibel 8.9.1 und 8.9.3)
  // =====================================================================
  // Die böse Elisabeth selbst – Stärke nach Spiegelgröße
  HG.manifestation('die_hand', {
    name: 'Die Hand', halt: 6, ausSpiegel: true, koerper: true,
    start: 'Im Glas bewegt sich etwas, das nicht dein Spiegelbild ist. Dann schiebt sich eine Hand heraus – schmal, weiß, mit zu langen Fingern.',
    angriffe: [
      { text: 'Die Hand packt dein Handgelenk. Ihre Haut ist kalt und glatt wie das Glas, aus dem sie kommt.', griff: true, nerven: '0/1W3' },
      { text: 'Sie zieht. Dein Arm ist bis zum Ellbogen kalt.', lp: '1W2' },
      { text: 'Die Fingernägel graben sich in deine Haut.', lp: '1W3' }
    ],
    griffFolge: { runden: 3, text: 'Für einen Herzschlag ist dein Gesicht so nah am Glas, dass du ihren Atem darauf siehst – von innen. Dann lässt sie los.', nerven: '1W3/1W10', lp: '1W4', endet: true },
    texte: { aufgeloest: 'Die Hand zuckt zurück ins Glas, als hätte sie sich verbrannt. Im Spiegel ist nur noch dein eigenes, bleiches Gesicht.' }
  });
  HG.manifestation('sie_greift', {
    name: 'Sie greift', halt: 12, ausSpiegel: true, koerper: true,
    start: 'Im großen Spiegel steht eine Frau. Ihr Haar ist offen, ihr Kleid hell, und sie lehnt sich aus dem Glas wie aus einem Fenster – Kopf, Schultern, beide Arme.',
    nerven: '1/1W6',
    angriffe: [
      { text: 'Sie streckt die Arme nach dir aus. Ihre Finger schließen sich um deine Schultern.', griff: true },
      { text: 'Sie zieht dich zum Glas. Einen Schritt. Noch einen.', lp: '1W3' },
      { text: 'Sie flüstert deinen Namen, und es klingt, als würde sie ihn schon sehr lange kennen.', nerven: '0/1W4' }
    ],
    griffFolge: { runden: 3, text: 'Deine Stirn berührt das Glas. Es ist nicht kalt. Es ist warm, wie Haut. Dann, mit einem Ruck, lässt sie los – als hätte sie etwas probiert und für gut befunden.', nerven: '1W4/1W10', lp: '1W6', endet: true },
    texte: {
      abgeschnitten: 'Das Glas ist verhängt bzw. zersprungen. Hinter dem Stoff, hinter den Sprüngen, hörst du sie noch einen Moment atmen. Dann nichts.',
      aufgeloest: 'Sie weicht zurück ins Glas, langsam, ohne den Blick von dir zu nehmen. Der Spiegel zeigt wieder den Raum. Nur den Raum.'
    }
  });
  // Im Bad: das schwarze Wasser
  HG.manifestation('hand_im_wasser', {
    name: 'Die Hand im Wasser', halt: 5, koerper: true,
    start: 'Deine Finger tasten im schwarzen Wasser nach dem Grund – und etwas tastet zurück.',
    nerven: '1/1W6',
    angriffe: [
      { text: 'Eine Hand umklammert dein Handgelenk und zieht. Das Wasser ist eisig.', griff: true },
      { text: 'Du wirst nach vorn gezogen, dein Gesicht nähert sich der schwarzen Fläche. Darin: ein Gesicht, das nicht deins ist.', nerven: '0/1W4' },
      { text: 'Dein Arm ist bis zur Schulter im Wasser. Es ist viel tiefer, als eine Wanne sein kann.', lp: '1W3' }
    ],
    griffFolge: { runden: 3, text: 'Wasser schlägt dir ins Gesicht. Du schluckst, hustest, und dann bist du frei und liegst auf den Fliesen.', lp: '1W4', nerven: '1W3/1W8', endet: true },
    texte: { aufgeloest: 'Die Hand löst sich, die Finger gleiten von deiner Haut. Das Wasser liegt still, schwarz und glatt.', losgerissen: 'Du reißt den Arm aus dem Wasser. Es tropft schwarz von deinen Fingern.' }
  });
  // Diener: Der Zerschlagende (Josef Brzezinski) – Flurspiegel (und Waschküche, Keller-Schritt)
  HG.manifestation('zerschlagende', {
    name: 'Der Zerschlagende', halt: 8, ausSpiegel: true, koerper: true, seele: 'josef',
    start: 'Ein Krachen – der Spiegel springt, ohne dass ihn jemand berührt. Aus den Sprüngen schieben sich Hände, rau, mit schwarzen Rändern unter den Nägeln, voller Schnitte. Hände, die Kohle gekannt haben.',
    nerven: '1/1W6',
    angriffe: [
      { text: 'Die Hände greifen nach dir. Wo sie dich streifen, schneiden die Scherben an ihnen.', lp: '1W4' },
      { text: 'Eine Faust schlägt ins Glas neben deinem Kopf. Splitter regnen auf dich nieder.', lp: '1W4' },
      { text: 'Eine Stimme, heiser, mit hartem Akzent: „Alle. Alle zerschlagen. Dann ist Ruhe.“', nerven: '0/1W3' }
    ],
    texte: { aufgeloest: 'Die Hände ziehen sich zurück. Der Spiegel ist heil, als sei nichts gewesen. Nur auf dem Boden glitzern Splitter.' }
  });
  // Diener: Die Näherin (Irmgard Hallmann) – Wäschekammer, Wäscheboden
  HG.manifestation('naeherin', {
    name: 'Die Näherin', halt: 6, koerper: true, seele: 'irmgard',
    start: 'Die Laken auf den Regalen bewegen sich. Eins gleitet herab, legt sich um deine Schultern, und Fäden, fein wie Haar, ziehen es fest.',
    angriff: function (api, k) {
      if (!k.griff) return { text: 'Stoff wickelt sich um deine Arme, deine Brust. Irgendwo rattert eine Nähmaschine.', griff: true };
      var e = api.probe('au', { grund: 'Ersticken' });
      return e.erfolg
        ? { text: 'Der Stoff liegt dir über Mund und Nase. Du bekommst gerade so Luft. Eine Frauenstimme flüstert: „Ich nähe ihm ein Jäckchen. Er kommt bald.“' }
        : { text: 'Du bekommst keine Luft. Der Stoff saugt sich an deine Lippen.', lp: '1' };
    },
    griffFolge: { runden: 4, text: 'Vor deinen Augen wird es schwarz – und dann fallen die Laken einfach von dir ab, als hätte jemand die Fäden durchgeschnitten.', nerven: '1/1W6', endet: true },
    texte: { aufgeloest: 'Die Laken sacken zu Boden. Nur Stoff. Die Nähmaschine ist still.', losgerissen: 'Du reißt den Stoff auseinander. Die Fäden singen, als sie reißen.' }
  });
  // Die Wandernde: die böse Elisabeth geht nachts durchs Haus (Wanderer)
  HG.manifestation('die_wandernde', {
    name: 'Sie geht durchs Haus', halt: 10,
    start: 'Sie steht in der Tür. Ein helles Kleid, offenes Haar, nackte Füße, die den Boden nicht ganz berühren. Ihr Gesicht kannst du nicht erkennen – es ist, als sähest du es durch beschlagenes Glas.',
    nerven: '1/1W8',
    angriffe: [
      { text: 'Sie kommt näher, ohne einen Schritt zu tun. Die Luft riecht nach Lavendel.', nerven: '0/1W4' },
      { text: 'Sie hebt die Hand und legt sie dir an die Wange. Wo sie dich berührt, wird es taub.', lp: '1W3' },
      { text: '„Bleib“, sagt sie, mit einer Stimme wie deine Mutter, wie jeder, den du je geliebt hast. „Bleib doch.“', nerven: '1/1W6' }
    ],
    texte: {
      aufgeloest: 'Das Licht zerreißt sie wie Nebel. Für einen Moment bleibt nur der Geruch nach Lavendel. Dann ist auch der fort – für diese Nacht.',
      geflohen: 'Du rennst, ohne dich umzudrehen. Hinter dir lacht jemand, leise und geduldig.'
    }
  });

  // =====================================================================
  // 3. Gefahren (Spielbibel 8.9.2)
  // =====================================================================

  // --- Die Witwe auf der Treppe (Margarete Ostermann) -------------------
  // Am Ausgang einstellbar (Kellertreppe, keller.js): treppe: { unten: 'kellerflur', kabel: false, runter, hoch, sturz }
  function treppe(ctx) { return (ctx.ausgang && ctx.ausgang.treppe) || {}; }
  function treppenProbe(api, ctx, vorsichtig) {
    var tr = treppe(ctx), unten = tr.unten || 'halle', kabel = tr.kabel !== false && !api.bekehrt('natascha');
    var mod = -10, gruende = ['Nacht'];
    if (vorsichtig) { mod += 20; gruende.push('vorsichtig'); api.zeitVergeht(4); }
    if (api.hell()) { mod += 10; gruende.push('Licht'); }
    if (kabel) { mod -= 10; gruende.push('Kabel'); }
    if (api.bekehrt('bettina')) { mod += 20; gruende.push('Bettina warnt dich'); }
    var e = api.probe('ge', { grund: 'Treppe', mod: mod, modGrund: gruende.join(', ') });
    if (e.erfolg) {
      api.sage(vorsichtig ? 'Stufe für Stufe, die Hand am Geländer. Du zählst mit. Die Treppe hat so viele Stufen, wie sie haben muss.' : 'Du hältst dich am Geländer fest, bis die Täuschung vergeht. Die Stufe ist da. Sie war immer da.');
      api.gehe(ctx.ausgang.ziel);
      return;
    }
    var patzer = e.patzer;
    api.sage('Dein Fuß tritt ins Leere. Du stürzt, schlägst auf, rutschst die Stufen hinab' + (kabel ? ', und irgendwo dazwischen verfängt sich dein Knöchel in einem Kabel, das eben noch nicht da war' : '') + '. ' + (tr.sturz || 'Unten in der Halle bleibst du liegen.'));
    api.verletze(patzer ? '2W6' : '1W6', { grund: 'Treppensturz' });
    if (HG.zustand.z.werte.lp > 0) api.nervenProbe('1/1W4', { grund: 'Treppensturz' });
    if (HG.zustand.z.raum !== unten && HG.zustand.z.werte.lp > 0) api.gehe(unten);
  }
  HG.gefahr('witwe', {
    name: 'Die Witwe auf der Treppe', seele: 'margarete', ausloeser: 'weg',
    phasen: ['daemmerung', 'tief', 'abebben'], chance: { daemmerung: 0.25, tief: 0.6, abebben: 0.25 },
    ablauf: function (api, ctx) {
      var runter = ctx.richtung === 'runter', tr = treppe(ctx);
      if (ctx.vorsichtig) { treppenProbe(api, ctx, true); return false; }
      var bild = runter
        ? (tr.runter || 'Du siehst hinunter – und unten in der Halle steht jemand. Eine Frau in Schwarz, die Hände gefaltet, und sieht zu dir herauf. Die Treppe wirkt plötzlich kürzer, als sie sein dürfte, als fehle eine Stufe.')
        : (tr.hoch || 'Auf halber Höhe wird die Treppe falsch. Die nächste Stufe ist zu nah, oder zu weit, du kannst es nicht sagen. Hinter dir, am Fuß der Treppe, raschelt schwarzer Stoff.');
      if (!api.bekehrt('bettina') && HG.zufall() < 0.5) bild += ' Ganz nah an deinem Ohr flüstert eine Mädchenstimme: „Schnell! Lauf!“';
      var opt = [
        { text: 'Einfach weitergehen', tu: function () { treppenProbe(api, ctx, false); } },
        { text: 'Langsam gehen, Stufe für Stufe', tu: function () { treppenProbe(api, ctx, true); } },
        { text: 'Umkehren', tu: function () { api.sage('Du gehst zurück, rückwärts, die Augen auf der Gestalt. Sie rührt sich nicht.'); } }
      ];
      if (api.weiss('margarete')) opt.splice(2, 0, { text: 'Sie beim Namen nennen', tu: function () {
        HG.gefahren.nennen(function (ok) { if (ok) api.gehe(ctx.ausgang.ziel); });
      } });
      api.abschnitt(41, bild);
      api.auswahl('Was tust du?', opt);
      return false;
    }
  });

  // --- Der Schläfer (Heinrich Ostermann) – Gästezimmer -------------------
  function einschlafen(api, wie) {
    api.sage(wie || 'Deine Lider werden schwer. Du setzt dich nur kurz auf die Bettkante – nur einen Moment …');
    var bis = HG.zeit.minutenBis(180);
    if (bis > 0 && bis < 12 * 60) api.zeitVergeht(bis);
    api.gehe('flur');
    api.abschnitt(42, 'Du wachst auf, weil dir kalt ist. Du stehst. Barfuß, im Flur im Erdgeschoss, vor dem großen Spiegel – und dein Spiegelbild hat die Augen noch zu.');
    api.nervenProbe('1/1W6', { grund: 'Aufwachen vor dem Spiegel' });
  }
  HG.gefahr('schlaefer', {
    einschlafen: einschlafen,   // auch für "schlafe" im Gästezimmer (obergeschoss.js)
    name: 'Der Schläfer', seele: 'heinrich', ausloeser: 'betreten', orte: ['gaestezimmer'],
    phasen: ['daemmerung', 'tief'], chance: { daemmerung: 0.4, tief: 0.8 },
    ablauf: function (api) {
      api.sage('Kaum bist du im Zimmer, legt sich eine Müdigkeit über dich, schwer und warm. Das Bett sieht so weich aus. Jemand hat die Decke zurückgeschlagen. <i>Du bist so müde.</i>');
      var opt = [
        { text: 'Dagegen ankämpfen', tu: function () {
          var e = api.probe('au', { grund: 'Müdigkeit' });
          if (e.erfolg) api.sage('Du beißt dir auf die Lippe, bis es wehtut. Die Müdigkeit weicht zurück – sie lauert, aber sie hat dich nicht.');
          else einschlafen(api);
        } },
        { text: 'Sofort hinausgehen', tu: function () { api.sage('Du drehst dich um und gehst, ohne das Bett noch einmal anzusehen. Auf der Galerie ist die Luft kälter und klarer.'); api.gehe('galerie'); } }
      ];
      if (api.weiss('heinrich')) opt.push({ text: 'Ihn beim Namen nennen', tu: function () { HG.gefahren.nennen(function (ok) { if (!ok) einschlafen(api); }); } });
      api.auswahl('Was tust du?', opt);
    }
  });

  // --- Das Gas (Dr. Karl Albers) – Küche (und Weinkeller, keller.js) ----
  // Texte je Raum: HG.daten.gefahren.gas.raeume[raumId]
  function gasOrt() { var g = HG.daten.gefahren.gas.raeume; return g[HG.zustand.z.raum] || g.kueche; }
  function gasRunde(api) {
    var s = G().st(), o = gasOrt();
    s.gas = (s.gas || 0);
    var e = api.probe('au', { grund: 'Gas', mod: -10 * Math.min(2, s.gas) });
    if (e.erfolg) { api.sage('Du hältst den Atem an, so gut es geht.'); }
    else {
      s.gas++;
      api.verletze('1', { grund: 'Gas' });
      api.sage(o.schwindel);
      if (s.gas >= 3) {
        s.gas = 0;
        api.sage('Der Boden kommt dir entgegen.');
        var bis = HG.zeit.minutenBis(180);
        if (bis > 0 && bis < 12 * 60) api.zeitVergeht(bis);
        api.abschnitt(43, o.aufwachen);
        api.nervenProbe('1/1W8', { grund: 'Ohnmacht' });
        return;
      }
    }
    gasAuswahl(api);
  }
  function gasAuswahl(api) {
    var o = gasOrt();
    var opt = [
      { text: o.fenster, tu: function () {
        var e = api.probe('st', { grund: o.fensterGrund });
        if (e.erfolg) { G().st().gas = 0; api.sage(o.fensterAuf); }
        else { api.sage(o.fensterKlemmt); api.zeitVergeht(1); gasRunde(api); }
      } },
      { text: o.raus, tu: function () { G().st().gas = 0; api.sage('Du stolperst hinaus, die Hand vor dem Mund.'); api.gehe(o.rausNach); } },
      { text: o.herd, tu: function () { api.sage(o.herdText); api.zeitVergeht(1); gasRunde(api); } }
    ];
    if (api.weiss('albers')) opt.push({ text: 'Ihn beim Namen nennen', tu: function () { HG.gefahren.nennen(function (ok) { if (ok) G().st().gas = 0; else gasRunde(api); }); } });
    api.auswahl('Was tust du?', opt);
  }
  HG.gefahr('gas', {
    name: 'Das Gas', seele: 'albers', ausloeser: 'raum', orte: ['kueche'],
    phasen: ['daemmerung', 'tief'], chance: { daemmerung: 0.05, tief: 0.3 },
    raeume: {
      kueche: {
        abschnitt: 44, start: 'Ein Zischen, leise, gleichmäßig. Dann der Geruch: süßlich, faulig, nach Gas. Er kommt vom alten weißen Herd, der seit 1946 stillgelegt ist.',
        schwindel: 'Dir wird schwindlig. Die Küche dreht sich, langsam, wie ein Karussell.',
        aufwachen: 'Du wachst auf dem Küchenboden auf. Es ist drei Uhr. Kein Geruch mehr, kein Zischen. Der Gasherd ist kalt, die Knöpfe sind fest – seit 1946 verplombt.',
        fenster: 'Das Fenster aufreißen', fensterGrund: 'verzogenes Fenster',
        fensterAuf: 'Das Fenster gibt mit einem Ruck nach. Kalte Nachtluft strömt herein, und der Geruch ist fort, als hätte es ihn nie gegeben.',
        fensterKlemmt: 'Der Rahmen ist verzogen und klemmt.',
        raus: 'Raus aus der Küche', rausNach: 'anrichte',
        herd: 'Luft anhalten und den Gasherd untersuchen', herdText: 'Die Knöpfe des Gasherds sind verplombt, seit 1946. Und doch zischt es irgendwo darin.'
      }
    },
    ablauf: function (api) {
      var o = gasOrt();
      G().st().gas = 0;
      api.abschnitt(o.abschnitt, o.start);
      gasAuswahl(api);
    }
  });

  // --- Die am Fenster (Wilhelmine Teubner) – Fenster im OG ---------------
  HG.gefahr('fenster', {
    name: 'Die am Fenster', seele: 'wilhelmine', ausloeser: 'raum', orte: ['schlafzimmer', 'gaestezimmer', 'kinderzimmer', 'bibliothek'],
    phasen: ['tief'], chance: 0.12,
    ablauf: function (api) {
      api.abschnitt(45, 'Im schwarzen Fensterglas, draußen, wo kein Boden ist, steht jemand und winkt. Jemand, den du liebst. Du weißt nicht, woher du das weißt, aber du weißt es – und er ruft deinen Namen, ganz leise, durch das Glas.');
      var opt = [
        { text: 'Wegsehen', tu: function () {
          var e = api.probe(Math.max(1, HG.zustand.z.werte.wp * 5), { titel: 'Willenskraft-Probe', grund: 'Lockruf' });
          if (e.erfolg) { api.sage('Du drehst dich weg und zählst bis zehn. Als du wieder hinsiehst, ist da nur die Nacht.'); return; }
          api.sage('Du gehst zum Fenster. Du drehst den Griff. Kalte Luft schlägt dir ins Gesicht – und da ist niemand, nur die Tiefe.');
          var g = api.probe('ge', { grund: 'am offenen Fenster' });
          if (g.erfolg) { api.sage('Im letzten Moment krallen sich deine Finger in den Rahmen. Du ziehst dich zurück und schlägst das Fenster zu.'); api.nervenProbe('1/1W6', { grund: 'am Abgrund' }); return; }
          api.verletze('2W6', { grund: 'Sturz aus dem Fenster' });
          if (HG.zustand.z.werte.lp <= 0) { api.ende('Kalte Luft, dann nichts mehr. Unten auf dem Pflaster liegt jemand, und oben im Fenster steht eine Frau im geblümten Kittel und sieht hinunter.<br><br><b>Dein Abenteuer endet hier.</b>'); return; }
          api.sage('Du stürzt. Die Hecke unter dem Fenster fängt dich auf, mehr schlecht als recht. Als du dich aufrappelst, stehst du vor dem Haus.');
          api.gehe('einfahrt');
          api.nervenProbe('1/1W8', { grund: 'Sturz' });
        } }
      ];
      if (W().inventar().some(function (id) { return HG.daten.dinge[id].tuch; })) opt.push({ text: 'Ein Laken vor das Fenster hängen', tu: function () { api.sage('Du klemmst das Laken in den Fensterrahmen. Das Rufen wird dumpf, dann verstummt es.'); } });
      if (api.traegt('stimmgabel')) opt.push({ text: 'Die Stimmgabel anschlagen', tu: function () { api.sage('Der Ton schwingt – und die Stimme draußen klingt plötzlich falsch, verstimmt, wie eine Platte, die zu langsam läuft. Das ist niemand, den du liebst.'); } });
      if (api.weiss('wilhelmine')) opt.push({ text: 'Sie beim Namen nennen', tu: function () { HG.gefahren.nennen(); } });
      api.auswahl('Was tust du?', opt);
    }
  });
  function W() { return HG.welt; }

  // --- Der Zerschlagende (Josef Brzezinski) – Flurspiegel (und Waschküche, keller.js) ---
  // spiegelIn: welcher Spiegel in welchem Raum
  function zerschlagSpiegel() { return HG.daten.gefahren.zerschlagende.spiegelIn[HG.zustand.z.raum]; }
  HG.gefahr('zerschlagende', {
    name: 'Der Zerschlagende', seele: 'josef', ausloeser: 'raum', orte: ['flur'],
    spiegelIn: { flur: 'spiegel' },
    phasen: ['tief'], chance: 0.15,
    bedingung: function (api) { var sp = zerschlagSpiegel(); return !!sp && HG.macht.istPortal(sp) && api.hell(); },
    ablauf: function (api) { api.kampf('zerschlagende', { spiegel: zerschlagSpiegel() }); }
  });

  // --- Die Näherin (Irmgard Hallmann) – Wäschekammer --------------------
  HG.gefahr('naeherin', {
    name: 'Die Näherin', seele: 'irmgard', ausloeser: 'raum', orte: ['waeschekammer'],
    phasen: ['tief'], chance: 0.3,
    ablauf: function (api) { api.kampf('naeherin', {}); }
  });

  // --- Der Baumeister (Brinkhoff) – das Haus verändert sich --------------
  HG.gefahr('baumeister', {
    name: 'Der Baumeister', seele: 'brinkhoff', ausloeser: 'jederWeg', schauplatz: 'haus',
    phasen: ['daemmerung', 'tief'], chance: 1, einmalProNacht: false,
    ablauf: function (api, ctx) {
      var s = G().st(), n = HG.nacht.nummer();
      if (s.baumeister !== n) {
        if (HG.zufall() >= ({ daemmerung: 0.03, tief: 0.08 }[api.nachtphase()] || 0)) return true;
        s.baumeister = n;
      } else if (HG.zufall() >= 0.3) return true;
      var ziel = ctx.ausgang.ziel, von = HG.zustand.z.raum;
      var kandidaten = G().nachbarn(ziel).filter(function (r) { return r !== von && r !== ziel; });
      if (!kandidaten.length) return true;
      var falsch = kandidaten[Math.floor(HG.zufall() * kandidaten.length)];
      api.gehe(falsch);
      api.sage('<i>Das ist nicht ' + raumName(ziel) + '.</i> Die Tür hat dich woanders hingeführt. Hinter dir ist die Wand glatt, als hätte es nie eine Tür gegeben – und dann doch wieder eine Tür.');
      var opt = [{ text: 'Weitergehen, als wäre nichts', tu: function () { api.sage('Du atmest durch. Irgendwo knarrt Holz, als arbeite jemand am Haus.'); } }];
      var plan = ['bauplan', 'bauplan_kopie'].filter(function (id) { return HG.daten.dinge[id] && api.traegt(id); })[0];
      if (plan) opt.unshift({ text: 'Bernwards Plan mit dem Raum vergleichen', tu: function () {
        s.baumeister = -1; HG.gefahren.st().gebannt.brinkhoff = n;
        api.sage('Du faltest den Plan auf und hältst ihn ins Licht. Raum für Raum, Tür für Tür: So hat Bernward es gebaut. So <i>ist</i> es. Die Wände scheinen sich zu schämen. Für diese Nacht führt jede Tür wieder dorthin, wo sie hingehört.');
        api.gehe(ziel);
      } });
      if (api.weiss('brinkhoff')) opt.push({ text: 'Ihn beim Namen nennen', tu: function () { HG.gefahren.nennen(function (ok) { if (ok) { s.baumeister = -1; api.gehe(ziel); } }); } });
      api.auswahl('Was tust du?', opt);
      return false;
    }
  });

  // --- Die böse Elisabeth in den Spiegeln (Spielbibel 8.9.3) ------------
  function spiegelGenau(groesse) {
    var id = HG.macht.spiegelHier(groesse);
    return id && HG.macht.groesse(id) === groesse && HG.daten.dinge[id] ? id : null;
  }
  HG.gefahr('elisabeth_klein', {
    name: 'Die Hand', ausloeser: 'raum', schauplatz: 'haus', phasen: ['tief'], chance: 0.06,
    bedingung: function (api) { return !!spiegelGenau('klein') && api.hell(); },
    ablauf: function (api) {
      if (!api.hausHandelt('heraustreten', 'klein')) return;
      api.kampf('die_hand', { spiegel: spiegelGenau('klein') });
    }
  });
  HG.gefahr('elisabeth_gross', {
    name: 'Sie greift', ausloeser: 'raum', schauplatz: 'haus', phasen: ['tief'], chance: 0.08,
    bedingung: function (api) { return !!spiegelGenau('gross') && api.hell(); },
    ablauf: function (api) {
      if (!api.hausHandelt('heraustreten', 'gross')) return;
      api.kampf('sie_greift', { spiegel: spiegelGenau('gross') });
    }
  });

  // =====================================================================
  // 4. Die Nacht: Wanderer, Höhepunkt um 3 Uhr, Licht
  // =====================================================================
  HG.spielDaten({
    wanderer: {
      manifestation: 'die_wandernde', start: 'galerie',
      // Hat man bei Tag die Krähen im Turm aufgescheucht, kommt sie in dieser Nacht schon in der Dämmerung (dachboden.js)
      phasen: function (api) { return api.flag('kraehen_nacht') === HG.nacht.nummer() ? ['daemmerung', 'tief'] : ['tief']; }, schauplatz: 'haus', alle: 20, zielstrebig: 0.5,
      bedingung: function (api) { return api.machtStufe() !== 'schwach'; },
      warnText: 'Schritte. Nackte Füße auf Holz, ganz in der Nähe. Sie kommen näher. <span class="nebenbei">(Verstecken? Fliehen? Licht?)</span>',
      vorbeiText: 'Etwas kommt herein. Lavendel, so dicht, dass du ihn schmecken kannst. Es bleibt stehen, eine Handbreit von deinem Versteck. Dann geht es weiter, und die Schritte entfernen sich.'
    },
    // Stundenschlag (David, 27.11.2026): nachts im Haus schlägt jede volle Stunde eine Uhr, die es nicht gibt –
    // 19 Uhr sieben Schläge … Mitternacht zwölf, 1 Uhr einer … 5 Uhr fünf. Um 3 Uhr übernimmt der Höhepunkt.
    stunde: function (api, h) {
      var r = HG.welt.raum();
      if (!r || r.schauplatz !== 'haus' || !(h >= 19 || h <= 5) || h === 3) return;
      var n = h % 12 || 12;
      var wort = ['', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'][n];
      if (!api.flag('uhr_gehoert')) {
        api.setzeFlag('uhr_gehoert');
        HG.ausgabe.schreibe('spuk', 'Irgendwo im Haus schlägt eine Uhr. Tief, langsam, ' + (n === 1 ? 'ein einziger Schlag' : n + ' Schläge') + '. Du zählst mit, ohne es zu wollen. Erst danach fällt dir ein, dass du im ganzen Haus keine Uhr gesehen hast.');
      }
      api.sound('uhr', { mal: n, untertitel: n === 1 ? 'Eine Uhr schlägt eins' : 'Eine Uhr schlägt ' + wort });
    },
    hoehepunkt: function (api) {
      var stufe = api.machtStufe();
      api.sound('uhr', { mal: 3, laut: true, untertitel: 'Eine Uhr schlägt drei' });
      api.setzeFlag('klappe_ankleidezimmer');
      HG.ausgabe.schreibe('spuk', {
        stark: 'Drei Uhr. Irgendwo im Haus schlägt eine Uhr, obwohl es im ganzen Haus keine Uhr gibt. Unten in der Küche schrillt die Klingel, einmal, lang. Lavendel liegt in der Luft, schwer wie ein Tuch. Und überall gleichzeitig ein feines Knistern – wie Eis, das zufriert. Die Spiegel heilen.',
        mittel: 'Drei Uhr. Unten in der Küche schlägt die Klingel an, einmal. Lavendel, plötzlich und süß. Aus allen Richtungen ein leises Knistern, wie Eis.',
        schwach: 'Drei Uhr. Ganz fern schlägt eine Klingel an, dünn und zögernd, als habe sie selbst keine Lust mehr. Ein Hauch Lavendel – dann nichts.'
      }[stufe]);
      api.nervenProbe({ stark: '1/1W8', mittel: '1/1W6', schwach: '0/1W3' }[stufe], { grund: 'drei Uhr' });
      // Ein starkes Haus nimmt die Laken von den Spiegeln
      if (stufe === 'stark') Object.keys(HG.daten.dinge).forEach(function (id) { if (api.eig(id, 'verhaengt') && id !== 'wc_spiegel') api.setze(id, 'verhaengt', false); });
    }
  });

  // Licht ist knapp: Handy-Akku und die Kerze brennen herunter
  Object.assign(HG.daten.dinge.handy, {
    lichtStaerke: 2,
    vorrat: {
      start: 100, proMinute: 0.5, einheit: ' %', warnung: [20, 5], kampfKosten: 5, fahrt: 1,
      warnText: 'Dein Handy vibriert kurz: noch {rest} % Akku.',
      leerText: 'Das Display flackert, dann wird es schwarz. Der Akku ist leer.',
      laden: function (api) { return HG.welt.raum() && HG.welt.raum().schauplatz === 'zuhause' ? 2 : 0; }   // zu Hause an der Steckdose
    }
  });
  Object.assign(HG.daten.dinge.kerze, {
    lichtStaerke: 1,
    vorrat: {
      start: 100, proMinute: 0.42, einheit: ' %', warnung: [15],
      warnText: 'Die Kerze ist fast heruntergebrannt. Das Wachs läuft über den Leuchter.',
      leerText: 'Die Flamme ertrinkt im Wachs. Die Kerze ist heruntergebrannt.'
    }
  });
})();
