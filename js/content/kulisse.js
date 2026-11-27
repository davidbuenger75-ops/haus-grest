// Haus Grest – Inhalt: allgemeine Kulisse in jedem Raum (David, 27.11.2026, vor dem Alpha-Test)
// Wand/Wände, Boden, Decke, Zimmer/Raum gibt es überall – mit Standardantworten für untersuchen, tasten, klopfen,
// durchsuchen. Kein „nichts dergleichen“ mehr für diese Wörter.
//
// Vorrang (Engine): 1. Raum-Haken r.bei.klopfen usw. · 2. ein eigenes Ding des Raums mit demselben Wort
// (z. B. die Westwand im Heizungskeller) · 3. raumeigene Texte r.kulisse = { wand: { klopfen: '…' }, decke: {…} }
// · 4. die Standardtexte hier (drinnen/draußen, hell/dunkel, im Haus Grest eine Spur unheimlicher).
(function () {

  var DRAUSSEN = ['einfahrt', 'lager_tor', 'kolbe', 'friedhof', 'friedhof_alt'];
  function raum() { return HG.welt.raum() || {}; }
  function draussen() { var r = raum(); return !!(r.draussen || DRAUSSEN.indexOf(r.id) >= 0); }
  function imHaus() { return raum().schauplatz === 'haus'; }
  function hell() { return HG.welt.hell(); }

  /** Text für Teil (wand/boden/decke/raum) und Handlung: Raum-Text, sonst Standard. */
  function text(teil, aktion, std) {
    var eigen = raum().kulisse && raum().kulisse[teil] && raum().kulisse[teil][aktion];
    if (eigen) return HG.wert(eigen, HG.api);
    return typeof std === 'function' ? std() : std;
  }
  function kulisse(id, teil, def, texte) {
    var bei = {};
    ['untersuchen', 'tasten', 'klopfen', 'durchsuchen'].forEach(function (a) {
      bei[a] = function (api) { api.sage(text(teil, a, texte[a])); return true; };
    });
    HG.ding(id, Object.assign({
      kulisse: true, fest: true, szenerie: true, imDunkeln: true, ort: null,
      bei: bei,
      texte: { nehmen: 'Das lässt sich nicht mitnehmen.' }
    }, def));
  }

  // --- Wand -------------------------------------------------------------
  kulisse('kulisse_wand', 'wand', { nomen: 'Wand', genus: 'f', woerter: ['wand', 'waende', 'mauer', 'mauern'] }, {
    untersuchen: function () {
      if (draussen()) return 'Hier draußen gibt es keine Wand, die dich weiterbringt – nur Mauern, Hecken und Himmel.';
      if (!hell()) return 'Zu dunkel. Du siehst die Wand nicht, du ahnst sie nur.';
      return imHaus() ? 'Die Wände sind alt und stumm. Tapete, Holz, Putz. Wenn du lange genug hinsiehst, meinst du, das Muster bewege sich. Es bewegt sich nicht.'
        : 'Nichts Besonderes an den Wänden. Kein Riss, keine Fuge, die nicht da sein sollte.';
    },
    tasten: function () {
      if (draussen()) return 'Rauer Stein, kalt und feucht. Nichts.';
      return imHaus() ? 'Kühl unter deinen Fingern. Für einen Herzschlag meinst du, sie sei warm, wie Haut. Dann ist sie wieder kalt.'
        : 'Kühl und glatt unter deinen Fingern. Nichts Ungewöhnliches.';
    },
    klopfen: function () {
      if (draussen()) return 'Du klopfst gegen den Stein. Er gibt keinen Laut zurück, der dich interessiert.';
      return 'Du klopfst die Wand ab. Fester Klang, kein Hohlraum.' + (imHaus() && HG.zeit.istNacht() ? ' Das Echo bleibt einen Moment zu lange im Raum.' : '');
    },
    durchsuchen: function () {
      if (draussen()) return 'Du suchst die Mauern ab. Moos, Ritzen, nichts darin.';
      return hell() ? 'Du gehst die Wände Stück für Stück ab, fährst mit den Fingern über Fugen und Leisten. Kein Versteck, keine geheime Tür – jedenfalls nicht hier.'
        : 'Im Dunkeln tastest du dich an der Wand entlang. Nichts als Wand.';
    }
  });

  // --- Boden ------------------------------------------------------------
  kulisse('kulisse_boden', 'boden', { nomen: 'Boden', genus: 'm', woerter: ['boden', 'fussboden', 'untergrund'] }, {
    untersuchen: function () {
      if (draussen()) return 'Kies, Erde, nasses Laub. Spuren, aber keine, die dir etwas sagen.';
      if (!hell()) return 'Du siehst deine eigenen Füße kaum.';
      return imHaus() ? 'Staub, Kratzer im Holz, die Spuren von über hundert Jahren. Nichts, was dir weiterhilft.' : 'Ein ganz gewöhnlicher Boden.';
    },
    tasten: function () { return draussen() ? 'Kalte, feuchte Erde.' : 'Der Boden ist kalt. Nichts darauf, was du ertasten könntest.'; },
    klopfen: function () { return draussen() ? 'Du klopfst auf die Erde. Sie antwortet nicht.' : 'Du klopfst auf den Boden. Er klingt fest.'; },
    durchsuchen: function () {
      if (draussen()) return 'Du suchst den Boden ab. Laub, Steine, nichts.';
      return hell() ? 'Du gehst auf die Knie und suchst den Boden ab, auch unter den Möbeln. Staub. Sonst nichts.'
        : 'Auf allen vieren tastest du den Boden ab. Staub unter deinen Fingern. Sonst nichts.';
    }
  });

  // --- Decke ------------------------------------------------------------
  kulisse('kulisse_decke', 'decke', { nomen: 'Decke', genus: 'f', woerter: ['decke', 'zimmerdecke', 'himmel'] }, {
    untersuchen: function () {
      if (draussen()) return 'Über dir ist nur der Himmel.' + (HG.zeit.istNacht() ? ' Kein Stern.' : '');
      if (!hell()) return 'Über dir ist nur Schwärze.';
      return imHaus() ? 'Die Decke ist hoch, mit Stuck oder dunklen Balken. In einer Ecke ein Wasserfleck, der aussieht wie ein Gesicht – wenn man will.' : 'Eine ganz gewöhnliche Decke.';
    },
    tasten: function () { return draussen() ? 'Da ist nichts außer Luft.' : 'Die Decke ist zu hoch. Du kommst nicht heran.'; },
    klopfen: function () { return draussen() ? 'Da ist nichts, woran du klopfen könntest.' : 'Du kommst nicht an die Decke heran.'; },
    durchsuchen: function () { return draussen() ? 'Da oben ist nichts außer Himmel.' : 'Du suchst die Decke mit den Augen ab. Kein Haken, keine Klappe – nichts, was du nicht schon gesehen hättest.'; }
  });

  // --- Raum / Zimmer ----------------------------------------------------
  kulisse('kulisse_raum', 'raum', { nomen: 'Raum', genus: 'm', woerter: ['raum', 'zimmer', 'umgebung'] }, {
    untersuchen: function () { HG.welt.beschreibeRaum(true); return ''; },
    tasten: function () { return hell() ? 'Du streichst mit den Fingern über Wände und Möbel. Nichts Ungewöhnliches.' : 'Du tastest dich durch die Dunkelheit, findest aber nichts Greifbares.'; },
    klopfen: function () { return draussen() ? 'Hier draußen gibt es nichts, woran du klopfen könntest.' : 'Du klopfst die Wände ab, eine nach der anderen. Überall fester Klang.'; },
    durchsuchen: function () {
      return hell() ? 'Du gehst ' + (draussen() ? 'alles' : 'den Raum') + ' Stück für Stück ab. Was es hier gibt, siehst du – untersuche die einzelnen Dinge genauer.'
        : 'Im Dunkeln findest du nichts. Du bräuchtest Licht.';
    }
  });

})();
