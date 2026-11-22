// Haus Grest – Inhalt: Illustrationen als SVG im Federzeichnungs-Stil
// Jede Szene ist eine Funktion(api), die SVG-Text liefert – so kann das Bild
// den Spielzustand zeigen (Kerze brennt, Tür offen, Schlüssel gefunden …).
// "_dunkel" wird gezeigt, wenn der aktuelle Raum finster ist.
(function () {
  'use strict';

  var TINTE = '#2a1d12';

  function rahmen(inhalt, extraDefs, hintergrund) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' +
      '<filter id="feder" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="2.6"/></filter>' +
      '<pattern id="schraffur" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="' + TINTE + '" stroke-width="1.1"/></pattern>' +
      '<pattern id="kreuz" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0V6M0 0H6" stroke="' + TINTE + '" stroke-width="1.1"/></pattern>' +
      '<pattern id="fein" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)"><line x1="0" y1="0" x2="0" y2="5" stroke="' + TINTE + '" stroke-width=".6"/></pattern>' +
      '<radialGradient id="glut"><stop offset="0" stop-color="#ffd98a" stop-opacity=".85"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>' +
      (extraDefs || '') +
      '</defs>' +
      (hintergrund || '') +
      '<g filter="url(#feder)" fill="none" stroke="' + TINTE + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + inhalt + '</g>' +
      '</svg>';
  }

  function flamme(x, y, gross) {
    var s = gross || 1;
    return '<circle cx="' + x + '" cy="' + (y - 6 * s) + '" r="' + (34 * s) + '" fill="url(#glut)" stroke="none"/>' +
      '<path d="M' + x + ' ' + y + ' q' + (-5 * s) + ' ' + (-7 * s) + ' 0 ' + (-16 * s) + ' q' + (5 * s) + ' ' + (9 * s) + ' 0 ' + (16 * s) + 'z" fill="#f2b84b" stroke-width="1"/>';
  }

  function kerze(x, y, brennt) { // y = Fußpunkt des Leuchters
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="13" ry="3.5"/>' +
      '<path d="M' + (x - 3) + ' ' + y + ' v-6 h6 v6"/>' +
      '<rect x="' + (x - 5) + '" y="' + (y - 26) + '" width="10" height="20" fill="#f3ead6"/>' +
      '<path d="M' + x + ' ' + (y - 26) + ' v-4"/>' +
      (brennt ? flamme(x, y - 29, 0.9) : '');
  }

  function schluessel(x, y, klein) {
    var s = klein ? 0.6 : 1;
    return '<circle cx="' + x + '" cy="' + y + '" r="' + (5 * s) + '"/>' +
      '<path d="M' + (x + 5 * s) + ' ' + y + ' h' + (22 * s) + ' v' + (5 * s) + ' m' + (-6 * s) + ' ' + (-5 * s) + ' v' + (4 * s) + '"/>';
  }

  // ------------------------------------------------------------------
  HG.bild('einfahrt', function (api) {
    var zeit = api.tageszeit(), nacht = zeit === 'nacht', g = '';
    // Himmel: nachts schraffiert, Mond; tags Sonne/Wolken
    if (nacht) g += '<rect x="0" y="0" width="800" height="262" fill="url(#fein)" stroke="none" opacity=".8"/><circle cx="660" cy="56" r="20" fill="#f6efdc"/>';
    else if (zeit === 'abend') g += '<circle cx="680" cy="210" r="30" stroke-dasharray="4 5"/><path d="M590 200 h70 M600 214 h50" stroke-width=".8"/>';
    else g += '<path d="M90 60 q20 -20 40 0 q20 -14 36 4 q14 2 10 14 H86 q-12 -8 4 -18z" stroke-width="1"/><circle cx="690" cy="60" r="16"/>';
    // Boden, Kiesweg
    g += '<path d="M0 262 H800"/><path d="M370 300 L388 262 M430 300 L412 262" stroke-width="1"/>';
    // Haus mit Giebeln
    g += '<path d="M250 262 V110 L300 60 L350 110 V96 L400 40 L450 96 V110 L500 60 L550 110 V262 Z" fill="#e9dcc0"/>';
    g += '<rect x="250" y="110" width="300" height="152" fill="url(#fein)" stroke="none" opacity="' + (nacht ? '.9' : '.35') + '"/>';
    // Fenster
    [[275, 130], [330, 130], [440, 130], [495, 130], [275, 190], [330, 190], [440, 190], [495, 190], [385, 70]].forEach(function (f, i) {
      var leer = nacht ? ' fill="#1b1410"' : ' fill="#e9dcc0"';
      g += '<rect x="' + f[0] + '" y="' + f[1] + '" width="30" height="' + (i === 8 ? 26 : 40) + '"' + leer + '/>';
      if (i !== 8) g += '<path d="M' + (f[0] + 15) + ' ' + f[1] + ' v40 M' + f[0] + ' ' + (f[1] + 18) + ' h30" stroke-width=".8"/>';
    });
    // Gestalt im Fenster des ersten Stocks (abends)
    if (zeit === 'abend') g += '<ellipse cx="510" cy="144" rx="5" ry="7" fill="#f6efdc" stroke-width=".8"/><path d="M503 170 q7 -16 14 0" stroke-width=".8"/>';
    if (nacht) g += '<ellipse cx="510" cy="146" rx="5" ry="7" fill="#d8cdb6" stroke="none" opacity=".7"/>';
    // Tür mit Oberlicht
    var offen = api.eig('haustuer', 'offen');
    g += '<path d="M380 262 V200 Q400 176 420 200 V262" fill="' + (offen ? 'url(#kreuz)' : '#e9dcc0') + '"/>';
    g += '<path d="M384 198 Q400 182 416 198" stroke-width=".8"/><path d="M372 262 h56" stroke-width="2.4"/>';
    // Baum links, kahl
    g += '<path d="M120 262 C126 200 112 160 124 110 M124 160 C100 140 90 120 70 112 M122 140 C150 120 160 100 180 96 M124 110 C118 90 128 76 120 60 M96 124 C88 110 92 100 84 90 M150 112 C160 100 158 88 168 80" stroke-width="2.2"/>';
    // Zaun und Tor
    for (var x = 0; x < 800; x += 18) {
      if (x > 340 && x < 460) continue;
      g += '<path d="M' + x + ' 290 V268 l3 -5 3 5" stroke-width="1.1"/>';
    }
    g += '<path d="M0 274 H340 M460 274 H800 M0 286 H340 M460 286 H800" stroke-width="1"/>';
    // Auto rechts
    g += '<path d="M610 286 v-14 q4 -12 24 -14 l14 -14 h46 l18 14 q20 2 24 14 v14 z" fill="#e9dcc0"/><circle cx="640" cy="288" r="9" fill="#e9dcc0"/><circle cx="710" cy="288" r="9" fill="#e9dcc0"/>';
    if (nacht) g += '<path d="M736 274 l40 -6 v16 z" fill="#ffd98a" stroke="none" opacity=".35"/>';
    return rahmen(g);
  });

  // ------------------------------------------------------------------
  HG.bild('halle', function (api) {
    var g = '';
    // Boden und Wand
    g += '<path d="M0 252 H800"/><path d="M0 172 H800" stroke-width="1"/>';
    for (var x = 120; x < 800; x += 64) g += '<path d="M' + x + ' 176 V248" stroke-width=".8"/>';
    for (var d = 0; d < 800; d += 36) g += '<path d="M' + d + ' 252 L' + (d - 40) + ' 300" stroke-width=".6"/>';
    // Eichentür (Westen) links
    if (api.eig('eichentuer', 'offen')) {
      g += '<rect x="22" y="92" width="74" height="160" fill="url(#kreuz)"/>' +
        '<path d="M22 92 L62 100 L62 246 L22 252 Z" fill="#e9dcc0"/><circle cx="54" cy="176" r="3"/>';
    } else {
      g += '<rect x="22" y="92" width="74" height="160" fill="#e9dcc0"/><rect x="32" y="104" width="54" height="58"/><rect x="32" y="176" width="54" height="64"/>' +
        '<circle cx="86" cy="172" r="3.5"/><path d="M86 180 v8" stroke-width="2.4"/>';
    }
    // Treppe
    for (var i = 0; i < 8; i++) {
      var sx = 140 + i * 24, sy = 252 - i * 21;
      g += '<path d="M' + sx + ' ' + sy + ' V' + (sy - 21) + ' H' + (sx + 24) + '"/>';
      g += '<path d="M' + (sx + 12) + ' ' + (sy - 21) + ' V' + (sy - 66) + '" stroke-width="1"/>';
    }
    g += '<path d="M332 84 H372 V252"/><path d="M146 196 L346 30 H380" stroke-width="3"/>';
    g += '<path d="M140 252 L332 84" stroke-width=".8"/>';
    // Durchgang zum Flur (Norden), dunkel
    g += '<path d="M410 252 V128 Q460 64 510 128 V252" fill="url(#kreuz)"/>' +
      '<path d="M400 252 V124 Q460 50 520 124 V252" stroke-width="2.2"/>';
    // Kronleuchter
    g += '<path d="M600 0 V36"/><path d="M570 44 Q600 64 630 44 M576 44 v-8 M600 52 v-8 M624 44 v-8"/>' +
      '<path d="M574 36 l2 -6 2 6 M598 44 l2 -6 2 6 M622 36 l2 -6 2 6" stroke-width="1"/>';
    // Kommode
    g += '<rect x="592" y="186" width="150" height="58" fill="#e9dcc0"/><path d="M588 186 H746"/>' +
      '<path d="M600 244 v8 M734 244 v8"/>';
    if (api.eig('kommodenschublade', 'offen')) {
      g += '<path d="M602 198 H732 L742 226 H592 Z" fill="#e9dcc0"/><rect x="602" y="190" width="130" height="8" fill="url(#schraffur)" stroke="none"/>' +
        '<circle cx="667" cy="214" r="2.5"/>';
    } else {
      g += '<rect x="602" y="196" width="130" height="24"/><circle cx="667" cy="208" r="2.5"/>';
    }
    g += '<path d="M602 228 H732" stroke-width=".8"/>';
    // Kerze auf der Kommode
    if (api.eig('kerze', 'ort') === 'kommode') g += kerze(700, 186, api.eig('kerze', 'brennt'));
    // Teppich
    var umgeschlagen = !api.eig('eisenschluessel', 'versteckt');
    g += '<path d="M232 262 H600 L640 294 H196 Z" fill="#e9dcc0"/>' +
      '<path d="M248 267 H592 L622 289 H214 Z" stroke-width=".9"/>' +
      '<path d="M300 278 q20 -10 40 0 t40 0 t40 0 t40 0 t40 0" stroke-width=".8"/>';
    if (umgeschlagen) g += '<path d="M600 262 L640 294 L586 284 Z" fill="url(#fein)"/>';
    if (umgeschlagen && api.eig('eisenschluessel', 'ort') === 'halle') g += schluessel(560, 276);
    return rahmen(g);
  });

  // ------------------------------------------------------------------
  HG.bild('arbeitszimmer', function (api) {
    var g = '';
    g += '<path d="M0 256 H800"/>';
    for (var d = 10; d < 800; d += 42) g += '<path d="M' + d + ' 256 L' + (d - 30) + ' 300" stroke-width=".6"/>';
    // Fenster mit Mond
    g += '<rect x="330" y="34" width="140" height="176" fill="#efe4cc"/>' +
      '<circle cx="430" cy="78" r="15" fill="#f6efdc"/>' +
      '<path d="M400 34 V210 M330 92 H470 M330 150 H470" stroke-width="2.2"/>' +
      '<path d="M340 210 q10 -40 30 -60 q20 20 40 10 q20 -30 50 -20 V210" fill="url(#fein)" stroke-width=".8"/>';
    g += '<path d="M318 26 q-14 90 4 190 M482 26 q14 90 -4 190" stroke-width="2.2"/><path d="M314 26 H486"/>';
    // Porträt (schief, solange der Schlüssel dahinter hängt)
    var schief = api.eig('messingschluessel', 'versteckt') ? -4 : 0;
    g += '<g transform="rotate(' + schief + ' 150 112)">' +
      '<rect x="88" y="46" width="124" height="146" fill="#e9dcc0" stroke-width="3.5"/><rect x="98" y="56" width="104" height="126" stroke-width="1"/>' +
      '<ellipse cx="150" cy="104" rx="19" ry="26"/>' +
      '<path d="M131 98 q2 -30 19 -30 q17 0 19 30 q-6 -14 -19 -16 q-13 2 -19 16z" fill="url(#kreuz)" stroke-width="1"/>' +
      '<path d="M139 95 l8 1 M153 96 l8 -1" stroke-width="1.6"/>' +
      '<circle cx="143.5" cy="100" r="1.4" fill="#2a1d12"/><circle cx="156.5" cy="100" r="1.4" fill="#2a1d12"/>' +
      '<path d="M150 102 v9 l-3 2" stroke-width="1"/>' +
      '<path d="M132 110 q2 22 18 28 q16 -6 18 -28 q-7 5 -18 5 q-11 0 -18 -5z" fill="url(#schraffur)" stroke-width="1"/>' +
      '<path d="M141 116 q9 -5 18 0" stroke-width="2"/>' +
      '<path d="M108 182 q8 -40 42 -48 q34 8 42 48" fill="url(#kreuz)"/>' +
      '<rect x="132" y="186" width="36" height="9" fill="#e9dcc0" stroke-width="1"/></g>' +
      '<path d="M150 46 L150 34" stroke-width="1"/>';
    // Bücherregal
    g += '<rect x="604" y="28" width="168" height="228"/>';
    [84, 140, 196].forEach(function (y) { g += '<path d="M604 ' + y + ' H772"/>'; });
    var buecher = [[30, 84], [86, 140], [142, 196], [198, 252]];
    buecher.forEach(function (b, r) {
      for (var x = 610; x < 766; x += 9 + ((x * 7 + r * 3) % 5)) {
        var h = 36 + ((x * 13 + r * 17) % 16);
        if ((x + r) % 5 === 0) { g += '<circle cx="' + (x + 6) + '" cy="' + (b[1] - 7) + '" r="6"/>'; x += 4; continue; }
        g += '<rect x="' + x + '" y="' + (b[1] - h) + '" width="8" height="' + h + '"' + ((x + r) % 3 === 0 ? ' fill="url(#schraffur)"' : '') + ' stroke-width="1"/>';
      }
    });
    // Schreibtisch
    g += '<rect x="236" y="188" width="328" height="12" fill="#e9dcc0"/>' +
      '<rect x="246" y="200" width="78" height="56" fill="#e9dcc0"/><rect x="476" y="200" width="78" height="56" fill="#e9dcc0"/>' +
      '<path d="M254 228 H316 M484 228 H546" stroke-width=".8"/>';
    if (api.eig('schreibtischschublade', 'offen')) {
      g += '<path d="M336 204 H464 L474 232 H326 Z" fill="#e9dcc0"/>';
      if (api.eig('brief', 'ort') === 'schreibtischschublade') g += '<path d="M364 210 L420 208 L428 224 L370 226 Z" fill="#f6efdc" stroke-width="1"/><path d="M376 214 h36 M378 219 h32" stroke-width=".6"/>';
    } else {
      g += '<rect x="336" y="204" width="128" height="22"/><path d="M400 211 v6" stroke-width="2"/><circle cx="400" cy="210" r="2"/>';
    }
    // Dinge auf dem Schreibtisch
    if (api.eig('bauplan', 'ort') === 'schreibtisch') g += '<path d="M262 186 L322 172 L330 184 Z" fill="#f6efdc" stroke-width="1"/><ellipse cx="326" cy="178" rx="4" ry="7" transform="rotate(-14 326 178)"/>';
    if (api.eig('bleistift', 'ort') === 'schreibtisch') g += '<path d="M500 184 L540 178" stroke-width="2.4"/>';
    // Schlüssel am Boden
    if (!api.eig('messingschluessel', 'versteckt') && api.eig('messingschluessel', 'ort') === 'arbeitszimmer') g += schluessel(168, 272, true);
    return rahmen(g);
  });

  // ------------------------------------------------------------------
  HG.bild('flur', function (api) {
    var g = '';
    // Perspektive: Fluchtpunkt in der Mitte
    g += '<path d="M0 0 L330 92 M800 0 L470 92 M0 300 L330 232 M800 300 L470 232"/>';
    g += '<rect x="330" y="92" width="140" height="140" stroke-width="1"/>';
    // Dielen
    for (var i = -6; i <= 6; i++) g += '<path d="M' + (400 + i * 70) + ' 300 L' + (400 + i * 10) + ' 232" stroke-width=".7"/>';
    // Seitentüren
    g += '<path d="M90 42 L170 66 V246 L90 270 Z" fill="url(#fein)"/><path d="M630 66 L710 42 V270 L630 246 Z" fill="url(#fein)"/>';
    // Herabhängende Tapete
    g += '<path d="M220 76 q-6 40 6 70 q-10 20 -4 40" stroke-width="1.1"/><path d="M248 84 q8 30 -2 52" stroke-width="1.1"/>' +
      '<path d="M560 80 q8 44 -4 76" stroke-width="1.1"/><path d="M590 72 q-4 26 6 44 q-6 16 0 30" stroke-width="1.1"/>';
    // Spiegel am Ende
    g += '<rect x="352" y="100" width="96" height="128" fill="#d8cdb6" stroke-width="6"/>' +
      '<path d="M352 100 L382 130 M448 100 L418 130 M352 228 L382 196 M448 228 L418 196" stroke-width=".7"/>' +
      '<rect x="382" y="130" width="36" height="66" stroke-width=".7"/>' +
      '<circle cx="400" cy="214" r="14" fill="url(#glut)" stroke="none"/>';
    if (api.zaehler('spiegel_blick') > 0) {
      g += '<g stroke="#4a3a2c" stroke-width="1" opacity=".75">' +
        '<ellipse cx="374" cy="146" rx="7" ry="9"/>' +
        '<path d="M366 144 q-4 30 -2 50 M382 144 q4 30 2 50"/>' +
        '<path d="M366 158 q8 6 16 0 l6 66 h-28 z" fill="url(#fein)"/></g>';
    }
    var hinter = '<radialGradient id="vignette" cx="50%" cy="100%" r="85%"><stop offset=".25" stop-color="#0e0c0b" stop-opacity="0"/><stop offset=".7" stop-color="#0e0c0b" stop-opacity=".55"/><stop offset="1" stop-color="#0e0c0b" stop-opacity=".92"/></radialGradient>';
    return rahmen(g + '</g><rect width="800" height="300" fill="url(#vignette)"/>' + '<g>' + flamme(400, 296, 2.2), hinter);
  });

  // ------------------------------------------------------------------
  HG.bild('_dunkel', function () {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" preserveAspectRatio="xMidYMid meet">' +
      '<defs><radialGradient id="nacht" cx="50%" cy="55%" r="70%"><stop offset="0" stop-color="#1f1914"/><stop offset="1" stop-color="#050404"/></radialGradient>' +
      '<filter id="korn"><feTurbulence baseFrequency=".9" numOctaves="1" seed="3"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .16  0 0 0 0 .12  0 0 0 .25 0"/></filter></defs>' +
      '<rect width="800" height="300" fill="url(#nacht)"/><rect width="800" height="300" filter="url(#korn)"/>' +
      '</svg>';
  });

  // ------------------------------------------------------------------
  // Nahansicht: Bernwards Kästchen (800 × 600). Lage der Ringe, der Leiste und des Schlitzes
  // passt zu den anklickbaren Bereichen in js/content/kaestchen.js (nahansicht).
  HG.bild('nah_kaestchen', function (api) {
    var offen = !!(api.eig('kaestchen', 'offen') || api.eig('kaestchen', 'weg')), gewalt = api.eig('kaestchen', 'weg') === 'gewalt';
    var leiste = !!api.eig('zierleiste', 'verschoben'), zirkel = api.eig('zirkel', 'ort') === 'kaestchen';
    var MESSING = '#b98a3e', HOLZ = '#5a3b22', HOLZHELL = '#7a5434';
    var g = '';
    // Tischplatte
    g += '<rect x="0" y="0" width="800" height="600" fill="#d9c7a2" stroke="none"/><path d="M0 540 L800 540" stroke-width="1"/>';
    for (var y = 30; y < 600; y += 46) g += '<path d="M0 ' + y + ' q200 ' + (y % 3 ? 6 : -6) + ' 400 0 t400 0" stroke-width=".6" opacity=".35"/>';
    // Vorderseite
    g += '<path d="M120 420 L680 420 L680 520 L120 520 Z" fill="' + HOLZHELL + '"/>';
    for (var x = 140; x < 680; x += 38) g += '<path d="M' + x + ' 424 q6 46 0 92" stroke-width=".6" opacity=".5"/>';
    // Zierleiste (verschoben: nach rechts geschoben) und Schlitz
    var lx = leiste ? 240 : 150;
    if (leiste) {
      g += '<rect x="205" y="458" width="90" height="44" fill="#2a1d12" stroke-width="1.2"/>';
      // Schlitz in Form eines Zirkels: Kreis oben, zwei Schenkel
      g += zirkel
        ? '<g fill="' + MESSING + '" stroke-width="1.3"><circle cx="250" cy="468" r="7"/><path d="M246 474 L228 498 L233 499 L250 478 L267 499 L272 498 L254 474 Z"/></g>'
        : '<g fill="#000" stroke="#6b5a45" stroke-width="1"><circle cx="250" cy="468" r="7"/><path d="M246 474 L228 498 L233 499 L250 478 L267 499 L272 498 L254 474 Z"/></g>';
    }
    var lb = gewalt ? 300 : leiste ? 432 : 500;   // verschoben: das Ende verschwindet in der Seitenwand
    g += '<rect x="' + lx + '" y="465" width="' + lb + '" height="26" rx="3" fill="#8d6a45" stroke-width="1.4"/>' +
      '<path d="M' + (lx + 8) + ' 478 h' + (lb - 16) + '" stroke-width=".7" opacity=".6"/>';
    // Deckel / Oberseite
    if (!offen) {
      g += '<path d="M120 120 L680 120 L680 420 L120 420 Z" fill="' + HOLZ + '"/>';
      for (var x2 = 150; x2 < 680; x2 += 44) g += '<path d="M' + x2 + ' 126 q10 140 -4 288" stroke="#3a2516" stroke-width=".7" opacity=".6"/>';
      // Gravur
      g += '<text x="400" y="192" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="17" fill="' + MESSING + '" stroke="none">Was ich für E. erbaute, öffnet nur, wer unseren Tag kennt.</text>';
      // Rosette mit vier Ringen
      g += '<ellipse cx="400" cy="262" rx="150" ry="62" fill="' + MESSING + '" stroke-width="2"/>' +
        '<ellipse cx="400" cy="262" rx="138" ry="52" fill="none" stroke-width=".9"/>';
      [310, 370, 430, 490].forEach(function (cx) {
        g += '<circle cx="' + cx + '" cy="262" r="28" fill="#d8b36a" stroke-width="1.6"/><circle cx="' + cx + '" cy="262" r="22" fill="none" stroke-width=".7"/>';
        for (var k = 0; k < 10; k++) { var w = k * Math.PI / 5; g += '<path d="M' + (cx + 24 * Math.cos(w)).toFixed(1) + ' ' + (262 + 24 * Math.sin(w)).toFixed(1) + ' L' + (cx + 27 * Math.cos(w)).toFixed(1) + ' ' + (262 + 27 * Math.sin(w)).toFixed(1) + '" stroke-width=".8"/>'; }
      });
    } else {
      // aufgeklappter Deckel hinten, Inneres mit Samt, Brief und Ring
      g += '<path d="M120 120 L680 120 L700 60 L100 60 Z" fill="' + HOLZ + '"/>' +
        (gewalt ? '<path d="M300 120 l14 -22 l10 18 l16 -26 l8 30" stroke-width="1.4"/>' : '<ellipse cx="400" cy="90" rx="80" ry="18" fill="' + MESSING + '" stroke-width="1.3"/>');
      g += '<path d="M120 120 L680 120 L680 420 L120 420 Z" fill="' + HOLZ + '"/><rect x="150" y="150" width="500" height="250" fill="#4a1f24" stroke-width="1.2"/>';
      if (api.eig('brief_1905', 'ort') === 'kaestchen') g += '<path d="M220 300 L420 286 L428 392 L228 404 Z" fill="#efe2c4" stroke-width="1.3"/>' +
        (api.eig('brief_1905', 'zerrissen') ? '<path d="M300 294 l8 30 l-10 24 l12 26 l-6 24" stroke-width="1.3"/>' : '<path d="M250 320 h140 M252 340 h130 M254 360 h120" stroke-width=".7" opacity=".6"/>');
      if (api.eig('ehering', 'ort') === 'kaestchen') g += '<ellipse cx="530" cy="350" rx="26" ry="20" fill="none" stroke="#d9b15a" stroke-width="7"/><ellipse cx="530" cy="350" rx="26" ry="20" fill="none" stroke-width="1"/>';
    }
    // Messingbeschläge an den Ecken
    [[120, 120, 1, 1], [680, 120, -1, 1], [120, 420, 1, -1], [680, 420, -1, -1]].forEach(function (e) {
      g += '<path d="M' + e[0] + ' ' + e[1] + ' h' + (38 * e[2]) + ' v' + (8 * e[3]) + ' h' + (-30 * e[2]) + ' v' + (30 * e[3]) + ' h' + (-8 * e[2]) + ' Z" fill="' + MESSING + '" stroke-width="1.2"/>';
    });
    g += '<path d="M120 520 L680 520 L680 120" stroke-width="2.2"/><path d="M120 120 L120 520" stroke-width="2.2"/>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="none" class="nah-svg">' +
      '<defs><filter id="feder-nah" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="11"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter></defs>' +
      '<g filter="url(#feder-nah)" fill="none" stroke="' + TINTE + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + g + '</g></svg>';
  });
})();
