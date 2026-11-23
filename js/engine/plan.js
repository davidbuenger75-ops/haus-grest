// Haus Grest – Engine: Baupläne (Grundrisse als Karte)
//
// Ein Bauplan ist reine Daten (js/content/…): Stockwerke mit Räumen, Türen, Fenstern und Treppen
// in Metern. Diese Datei zeichnet daraus ein SVG im Stil einer Architektenzeichnung und liefert
// die Lage jedes Raums auf dem Blatt (für das Text-Overlay der Karte). Dasselbe SVG nutzt
// tools/grundriss.js, um PNG-Vorlagen für die Bildbearbeitung zu erzeugen – so passen Bild und
// Overlay genau zusammen. Keine Raumnamen im SVG (die zeigt die Oberfläche darüber).
//
// HG.bauplan(id, {
//   schauplatz: 'haus',                    // für welchen Schauplatz der Plan als Karte dient
//   ding: 'bauplan',                       // das Fundstück, das den Plan zeigt
//   stempel: ['Zeile 1', …], widmung: 'Für E.',
//   stockwerke: [{ id, name, umriss: [[x,y]…], raeume: [...], tueren: [...], fenster: [...],
//                  treppen: [...], zeichen: [...], masse: { oben: [x…], links: [y…] } }]
// })
// Raum: { id, plan: 'Name im Plan', raum: 'spiel-raum-id', r: [[x1,y1,x2,y2]…], poly: [[x,y]…],
//         wand: false (keine eigenen Wände), klein: true (Name nur beim Antippen), l: [x,y] (Beschriftung) }
// Tür:  { x, y, o: 'v'|'h' (senkrechte/waagerechte Wand), b: Breite, auf: 1|-1 (Seite), art: 'tuer'|'doppel'|'offen'|'durchreiche' }
// Fenster: { x, y, o, b }   Treppe: { r: [x1,y1,x2,y2], hoch: 'n'|'s'|'o'|'w', stufen, gestrichelt, podest, bruch }
// Zeichen: { art: 'luftraum'|'gewoelbe'|'erde'|'glas'|'gelaender'|'linie'|'stufen'|'schacht'|'kamin', r|pts, gestrichelt }
(function (HG) {
  'use strict';

  HG.daten.plaene = HG.daten.plaene || {};
  HG.bauplan = function (id, def) { def.id = id; HG.daten.plaene[id] = def; return def; };

  // Blatt: 1600 × 1200 (4:3), 45 px pro Meter, Ursprung links oben
  var G = { W: 1600, H: 1200, S: 45, OX: 150, OY: 170 };
  var TINTE = '#1d1a17', PAPIER = '#f4ecd8', ROTTINTE = '#7a2e1a';
  var AUSSEN = 0.5, INNEN = 0.22;

  function px(x) { return +(G.OX + x * G.S).toFixed(1); }
  function py(y) { return +(G.OY + y * G.S).toFixed(1); }
  function m(v) { return +(v * G.S).toFixed(1); }
  function zahl(v) { return v.toFixed(2).replace('.', ','); }

  function aussenwand(st, o, wert) {
    // Liegt die Wand auf dem Umriss? Dann ist sie dick.
    var u = st.umriss || [];
    for (var i = 0; i < u.length; i++) {
      var a = u[i], b = u[(i + 1) % u.length];
      if (o === 'v' && a[0] === b[0] && a[0] === wert) return true;
      if (o === 'h' && a[1] === b[1] && a[1] === wert) return true;
    }
    return false;
  }

  function linie(x1, y1, x2, y2, sw, extra) {
    return '<line x1="' + px(x1) + '" y1="' + py(y1) + '" x2="' + px(x2) + '" y2="' + py(y2) + '" stroke-width="' + sw + '"' + (extra || '') + '/>';
  }

  // ---------------------------------------------------------------- Teile
  function waende(st) {
    var s = '<g stroke="' + TINTE + '" fill="none" stroke-linejoin="miter">';
    (st.raeume || []).forEach(function (r) {
      if (r.wand === false) return;
      // Räume mit eigenem Umriss (poly) zeichnen nur den – "r" dient dann nur dem Overlay
      if (r.poly) { s += '<polygon points="' + r.poly.map(function (p) { return px(p[0]) + ',' + py(p[1]); }).join(' ') + '" stroke-width="' + m(INNEN) + '"/>'; return; }
      (r.r || []).forEach(function (q) {
        s += '<rect x="' + px(q[0]) + '" y="' + py(q[1]) + '" width="' + m(q[2] - q[0]) + '" height="' + m(q[3] - q[1]) + '" stroke-width="' + m(INNEN) + '"/>';
      });
    });
    if (st.umriss) s += '<polygon points="' + st.umriss.map(function (p) { return px(p[0]) + ',' + py(p[1]); }).join(' ') + '" stroke-width="' + m(AUSSEN) + '"/>';
    return s + '</g>';
  }

  function oeffnung(st, x, y, o, b) {
    // Wand an dieser Stelle "ausradieren"
    var t = (aussenwand(st, o, o === 'v' ? x : y) ? AUSSEN : INNEN) + 0.06;
    return o === 'v'
      ? '<rect x="' + px(x - t / 2) + '" y="' + py(y - b / 2) + '" width="' + m(t) + '" height="' + m(b) + '" fill="' + PAPIER + '"/>'
      : '<rect x="' + px(x - b / 2) + '" y="' + py(y - t / 2) + '" width="' + m(b) + '" height="' + m(t) + '" fill="' + PAPIER + '"/>';
  }

  function tuer(st, d) {
    var b = d.b || 1, s = oeffnung(st, d.x, d.y, d.o, b), auf = d.auf || 1, art = d.art || 'tuer';
    var t = aussenwand(st, d.o, d.o === 'v' ? d.x : d.y) ? AUSSEN : INNEN;
    // Leibungen
    if (d.o === 'v') { s += linie(d.x - t / 2, d.y - b / 2, d.x + t / 2, d.y - b / 2, 1.2) + linie(d.x - t / 2, d.y + b / 2, d.x + t / 2, d.y + b / 2, 1.2); }
    else { s += linie(d.x - b / 2, d.y - t / 2, d.x - b / 2, d.y + t / 2, 1.2) + linie(d.x + b / 2, d.y - t / 2, d.x + b / 2, d.y + t / 2, 1.2); }
    if (art === 'offen') return s;
    if (art === 'durchreiche') {
      return s + (d.o === 'v' ? linie(d.x, d.y - b / 2, d.x, d.y + b / 2, 1) : linie(d.x - b / 2, d.y, d.x + b / 2, d.y, 1));
    }
    function fluegel(hx, hy, laenge, richtung) {
      // hx/hy: Angel; richtung: +1/-1 entlang der Wand zur anderen Seite
      var r = m(laenge), g = '';
      if (d.o === 'v') {
        var ex = hx + auf * laenge, ey = hy;
        g += linie(hx, hy, ex, ey, 1.4);
        g += '<path d="M' + px(ex) + ' ' + py(ey) + ' A' + r + ' ' + r + ' 0 0 ' + ((auf * richtung) > 0 ? 1 : 0) + ' ' + px(hx) + ' ' + py(hy + richtung * laenge) + '" fill="none" stroke-width="0.8" stroke-dasharray="5 3"/>';
      } else {
        var fx = hx, fy = hy + auf * laenge;
        g += linie(hx, hy, fx, fy, 1.4);
        g += '<path d="M' + px(fx) + ' ' + py(fy) + ' A' + r + ' ' + r + ' 0 0 ' + ((auf * richtung) > 0 ? 0 : 1) + ' ' + px(hx + richtung * laenge) + ' ' + py(hy) + '" fill="none" stroke-width="0.8" stroke-dasharray="5 3"/>';
      }
      return g;
    }
    s += '<g stroke="' + TINTE + '">';
    if (art === 'doppel') {
      if (d.o === 'v') s += fluegel(d.x, d.y - b / 2, b / 2, 1) + fluegel(d.x, d.y + b / 2, b / 2, -1);
      else s += fluegel(d.x - b / 2, d.y, b / 2, 1) + fluegel(d.x + b / 2, d.y, b / 2, -1);
    } else {
      if (d.o === 'v') s += fluegel(d.x, d.y - b / 2, b, 1);
      else s += fluegel(d.x - b / 2, d.y, b, 1);
    }
    return s + '</g>';
  }

  function fenster(st, f) {
    var b = f.b || 1.2, t = aussenwand(st, f.o, f.o === 'v' ? f.x : f.y) ? AUSSEN : INNEN;
    var s = oeffnung(st, f.x, f.y, f.o, b) + '<g stroke="' + TINTE + '">';
    [-t / 2, 0, t / 2].forEach(function (k, i) {
      var w = i === 1 ? 0.9 : 1.3;
      s += f.o === 'v' ? linie(f.x + k, f.y - b / 2, f.x + k, f.y + b / 2, w) : linie(f.x - b / 2, f.y + k, f.x + b / 2, f.y + k, w);
    });
    s += f.o === 'v' ? linie(f.x - t / 2, f.y - b / 2, f.x + t / 2, f.y - b / 2, 1.3) + linie(f.x - t / 2, f.y + b / 2, f.x + t / 2, f.y + b / 2, 1.3)
      : linie(f.x - b / 2, f.y - t / 2, f.x - b / 2, f.y + t / 2, 1.3) + linie(f.x + b / 2, f.y - t / 2, f.x + b / 2, f.y + t / 2, 1.3);
    return s + '</g>';
  }

  function treppe(tr) {
    var q = tr.r, x1 = q[0], y1 = q[1], x2 = q[2], y2 = q[3];
    var strich = tr.gestrichelt ? ' stroke-dasharray="6 4"' : '';
    var s = '<g stroke="' + TINTE + '" fill="none"' + strich + '>';
    s += '<rect x="' + px(x1) + '" y="' + py(y1) + '" width="' + m(x2 - x1) + '" height="' + m(y2 - y1) + '" stroke-width="1.6"/>';
    if (tr.podest) return s + '</g>';
    var n = tr.stufen || 10, senkrecht = tr.hoch === 'n' || tr.hoch === 's';
    for (var i = 1; i < n; i++) {
      if (senkrecht) { var yy = y1 + (y2 - y1) * i / n; s += linie(x1, yy, x2, yy, 1); }
      else { var xx = x1 + (x2 - x1) * i / n; s += linie(xx, y1, xx, y2, 1); }
    }
    // Lauflinie mit Pfeil zur oberen Stufe
    var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, a, e;
    if (tr.hoch === 's') { a = [mx, y1 + 0.2]; e = [mx, y2 - 0.25]; }
    if (tr.hoch === 'n') { a = [mx, y2 - 0.2]; e = [mx, y1 + 0.25]; }
    if (tr.hoch === 'o') { a = [x1 + 0.2, my]; e = [x2 - 0.25, my]; }
    if (tr.hoch === 'w') { a = [x2 - 0.2, my]; e = [x1 + 0.25, my]; }
    s += '<circle cx="' + px(a[0]) + '" cy="' + py(a[1]) + '" r="3.5" fill="' + TINTE + '" stroke="none"/>';
    s += linie(a[0], a[1], e[0], e[1], 1.1);
    var dx = e[0] - a[0], dy = e[1] - a[1], l = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / l, uy = dy / l, k = 0.35;
    s += '<polyline points="' + px(e[0] - ux * k - uy * k * 0.6) + ',' + py(e[1] - uy * k + ux * k * 0.6) + ' ' + px(e[0]) + ',' + py(e[1]) + ' ' +
      px(e[0] - ux * k + uy * k * 0.6) + ',' + py(e[1] - uy * k - ux * k * 0.6) + '" stroke-width="1.1"/>';
    if (tr.bruch) {
      // Schnittlinie (Zickzack) quer zur Laufrichtung
      var b = tr.bruch;
      s += senkrecht
        ? '<polyline points="' + [[x1, b], [mx - 0.15, b], [mx, b - 0.25], [mx + 0.1, b + 0.25], [mx + 0.25, b], [x2, b]].map(function (p) { return px(p[0]) + ',' + py(p[1]); }).join(' ') + '" stroke-width="1.3" stroke-dasharray="none"/>'
        : '<polyline points="' + [[b, y1], [b, my - 0.15], [b - 0.25, my], [b + 0.25, my + 0.1], [b, my + 0.25], [b, y2]].map(function (p) { return px(p[0]) + ',' + py(p[1]); }).join(' ') + '" stroke-width="1.3" stroke-dasharray="none"/>';
    }
    return s + '</g>';
  }

  function zeichen(z) {
    var s = '', q = z.r, strich = z.gestrichelt === false ? '' : ' stroke-dasharray="7 5"';
    if (z.art === 'luftraum' || z.art === 'gewoelbe') {
      s += '<g stroke="' + TINTE + '" fill="none"' + strich + '>';
      if (z.art === 'luftraum') s += '<rect x="' + px(q[0]) + '" y="' + py(q[1]) + '" width="' + m(q[2] - q[0]) + '" height="' + m(q[3] - q[1]) + '" stroke-width="1"/>';
      s += linie(q[0], q[1], q[2], q[3], 0.9) + linie(q[2], q[1], q[0], q[3], 0.9) + '</g>';
    } else if (z.art === 'erde') {
      s += '<rect x="' + px(q[0]) + '" y="' + py(q[1]) + '" width="' + m(q[2] - q[0]) + '" height="' + m(q[3] - q[1]) + '" fill="url(#schraffur)" stroke="none"/>';
    } else if (z.art === 'glas') {
      s += '<g stroke="' + TINTE + '" fill="none">';
      [0, 0.12].forEach(function (k) { s += '<rect x="' + px(q[0] + k) + '" y="' + py(q[1] + k) + '" width="' + m(q[2] - q[0] - 2 * k) + '" height="' + m(q[3] - q[1] - 2 * k) + '" stroke-width="1.2"/>'; });
      for (var y = q[1] + 1; y < q[3]; y += 1) { s += linie(q[2] - 0.12, y, q[2], y, 1) ; }
      for (var x = q[0] + 1; x < q[2]; x += 1) { s += linie(x, q[1], x, q[1] + 0.12, 1) + linie(x, q[3] - 0.12, x, q[3], 1); }
      s += '</g>';
    } else if (z.art === 'gelaender') {
      s += '<rect x="' + px(q[0]) + '" y="' + py(q[1]) + '" width="' + m(q[2] - q[0]) + '" height="' + m(q[3] - q[1]) + '" fill="none" stroke="' + TINTE + '" stroke-width="1.2" stroke-dasharray="3 3"/>';
    } else if (z.art === 'stufen') {
      s += '<g stroke="' + TINTE + '">';
      for (var i = 0; i <= (z.n || 3); i++) { var yy = q[1] + (q[3] - q[1]) * i / (z.n || 3); s += linie(q[0], yy, q[2], yy, 1); }
      s += linie(q[0], q[1], q[0], q[3], 1) + linie(q[2], q[1], q[2], q[3], 1) + '</g>';
    } else if (z.art === 'schacht' || z.art === 'kamin') {
      s += '<g stroke="' + TINTE + '" fill="none"><rect x="' + px(q[0]) + '" y="' + py(q[1]) + '" width="' + m(q[2] - q[0]) + '" height="' + m(q[3] - q[1]) + '" stroke-width="1.4"/>' +
        linie(q[0], q[1], q[2], q[3], 0.9) + (z.art === 'kamin' ? linie(q[2], q[1], q[0], q[3], 0.9) : '') + '</g>';
    } else if (z.art === 'linie') {
      s += '<polyline points="' + z.pts.map(function (p) { return px(p[0]) + ',' + py(p[1]); }).join(' ') + '" fill="none" stroke="' + TINTE + '" stroke-width="1"' + strich + '/>';
    }
    return s;
  }

  function masse(st) {
    var s = '<g stroke="' + TINTE + '" fill="' + TINTE + '" font-family="Georgia, \'Times New Roman\', serif" font-style="italic" font-size="17" text-anchor="middle">';
    function kette(werte, waagerecht, abstand) {
      var g = '';
      werte.forEach(function (w, i) {
        var a = waagerecht ? [px(w), py(0) - abstand] : [px(0) - abstand, py(w)];
        g += waagerecht ? '<line x1="' + a[0] + '" y1="' + (a[1] - 8) + '" x2="' + a[0] + '" y2="' + (a[1] + 8) + '" stroke-width="1"/>' + '<line x1="' + (a[0] - 5) + '" y1="' + (a[1] + 5) + '" x2="' + (a[0] + 5) + '" y2="' + (a[1] - 5) + '" stroke-width="1.6"/>'
          : '<line x1="' + (a[0] - 8) + '" y1="' + a[1] + '" x2="' + (a[0] + 8) + '" y2="' + a[1] + '" stroke-width="1"/>' + '<line x1="' + (a[0] - 5) + '" y1="' + (a[1] + 5) + '" x2="' + (a[0] + 5) + '" y2="' + (a[1] - 5) + '" stroke-width="1.6"/>';
        if (i) {
          var v = werte[i - 1];
          if (waagerecht) {
            g += '<line x1="' + px(v) + '" y1="' + a[1] + '" x2="' + a[0] + '" y2="' + a[1] + '" stroke-width="0.8"/>';
            g += '<text x="' + ((px(v) + a[0]) / 2) + '" y="' + (a[1] - 7) + '" stroke="none">' + zahl(w - v) + '</text>';
          } else {
            g += '<line x1="' + a[0] + '" y1="' + py(v) + '" x2="' + a[0] + '" y2="' + a[1] + '" stroke-width="0.8"/>';
            var ty = (py(v) + a[1]) / 2;
            g += '<text x="' + (a[0] - 7) + '" y="' + ty + '" stroke="none" transform="rotate(-90 ' + (a[0] - 7) + ' ' + ty + ')">' + zahl(w - v) + '</text>';
          }
        }
      });
      return g;
    }
    var o = (st.masse && st.masse.oben) || [0, 20], l = (st.masse && st.masse.links) || [0, 16];
    s += kette(o, true, 40);
    if (o.length > 2) s += kette([o[0], o[o.length - 1]], true, 80);
    s += kette(l, false, 40);
    if (l.length > 2) s += kette([l[0], l[l.length - 1]], false, 80);
    return s + '</g>';
  }

  function rahmen(plan, st, nr) {
    var s = '';
    // Doppelter Blattrand
    s += '<rect x="30" y="30" width="' + (G.W - 60) + '" height="' + (G.H - 60) + '" fill="none" stroke="' + TINTE + '" stroke-width="2.5"/>';
    s += '<rect x="40" y="40" width="' + (G.W - 80) + '" height="' + (G.H - 80) + '" fill="none" stroke="' + TINTE + '" stroke-width="0.8"/>';
    // Nordpfeil
    var nx = 1440, ny = 175;
    s += '<g stroke="' + TINTE + '" fill="none"><circle cx="' + nx + '" cy="' + ny + '" r="42" stroke-width="1.2"/>' +
      '<polygon points="' + nx + ',' + (ny - 52) + ' ' + (nx + 12) + ',' + (ny + 10) + ' ' + nx + ',' + ny + ' ' + (nx - 12) + ',' + (ny + 10) + '" fill="' + TINTE + '" stroke-width="1"/>' +
      '<line x1="' + nx + '" y1="' + ny + '" x2="' + nx + '" y2="' + (ny + 42) + '" stroke-width="1"/></g>' +
      '<text x="' + nx + '" y="' + (ny - 60) + '" text-anchor="middle" font-family="Georgia, serif" font-size="26" fill="' + TINTE + '">N</text>';
    // Maßstabsleiste (5 m)
    var mx = 1290, my = 860;
    s += '<g stroke="' + TINTE + '">';
    for (var i = 0; i < 5; i++) s += '<rect x="' + (mx + i * G.S) + '" y="' + my + '" width="' + G.S + '" height="8" fill="' + (i % 2 ? PAPIER : TINTE) + '" stroke-width="1"/>';
    s += '</g><g font-family="Georgia, serif" font-style="italic" font-size="15" fill="' + TINTE + '" text-anchor="middle">' +
      '<text x="' + mx + '" y="' + (my + 28) + '">0</text><text x="' + (mx + 5 * G.S) + '" y="' + (my + 28) + '">5 m</text>' +
      '<text x="' + (mx + 2.5 * G.S) + '" y="' + (my - 14) + '">' + T(plan.massstab || '') + '</text></g>';
    // Stempelfeld unten rechts
    var sx = 1180, sy = 930, sw = 380, sh = 230;
    s += '<g stroke="' + TINTE + '" fill="none"><rect x="' + sx + '" y="' + sy + '" width="' + sw + '" height="' + sh + '" stroke-width="2"/>' +
      '<line x1="' + sx + '" y1="' + (sy + 56) + '" x2="' + (sx + sw) + '" y2="' + (sy + 56) + '" stroke-width="1"/>' +
      '<line x1="' + sx + '" y1="' + (sy + 168) + '" x2="' + (sx + sw) + '" y2="' + (sy + 168) + '" stroke-width="1"/>' +
      '<line x1="' + (sx + sw - 90) + '" y1="' + (sy + 168) + '" x2="' + (sx + sw - 90) + '" y2="' + (sy + sh) + '" stroke-width="1"/></g>';
    s += '<g font-family="Georgia, \'Times New Roman\', serif" fill="' + TINTE + '" text-anchor="middle">';
    s += '<text x="' + (sx + sw / 2) + '" y="' + (sy + 38) + '" font-size="26" letter-spacing="3">' + T(st.name) + '</text>';
    (plan.stempel || []).forEach(function (z, i) {
      s += '<text x="' + (sx + sw / 2) + '" y="' + (sy + 86 + i * 25) + '" font-size="' + (i === 0 ? 19 : 16) + '" font-style="' + (i === 0 ? 'normal' : 'italic') + '">' + T(z) + '</text>';
    });
    s += '<text x="' + (sx + sw - 45) + '" y="' + (sy + 207) + '" font-size="17">' + T((plan.blatt || 'Blatt') + ' ' + nr) + '</text>';
    s += '</g>';
    if (plan.widmung) {
      // Widmung in anderer Tinte, im unteren Feld des Stempels
      s += '<text x="' + (sx + 70) + '" y="' + (sy + 212) + '" text-anchor="start" font-family="\'Segoe Script\', \'Brush Script MT\', cursive" font-size="28" fill="' + ROTTINTE + '" transform="rotate(-4 ' + (sx + 70) + ' ' + (sy + 212) + ')">' + T(plan.widmung) + '</text>';
    }
    return s;
  }
  function T(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  // ---------------------------------------------------------------- öffentlich
  var P = HG.plan = {
    G: G,
    /** Plan, der für einen Schauplatz als Karte dient. */
    fuerSchauplatz: function (schauplatz) {
      var ids = Object.keys(HG.daten.plaene);
      for (var i = 0; i < ids.length; i++) if (HG.daten.plaene[ids[i]].schauplatz === schauplatz) return HG.daten.plaene[ids[i]];
      return null;
    },
    /** Stockwerk und Raum-Eintrag zu einer Spiel-Raum-ID. */
    finde: function (plan, raumId) {
      for (var i = 0; i < plan.stockwerke.length; i++) {
        var st = plan.stockwerke[i];
        for (var k = 0; k < st.raeume.length; k++) if (st.raeume[k].raum === raumId) return { stock: st, raum: st.raeume[k], index: i };
      }
      return null;
    },
    /** Vollständiges SVG eines Stockwerks (ohne Raumnamen). opt.ohneHintergrund für transparente Ausgabe. */
    svg: function (plan, stockId, opt) {
      opt = opt || {};
      var nr = 0, st = plan.stockwerke.filter(function (s, i) { if (s.id === stockId) { nr = i + 1; return true; } return false; })[0];
      if (!st) return '';
      var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + G.W + ' ' + G.H + '"' + (opt.groesse ? ' width="' + G.W + '" height="' + G.H + '"' : '') + ' class="bauplan-svg">';
      s += '<defs><pattern id="schraffur" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="12" stroke="' + TINTE + '" stroke-width="1"/></pattern></defs>';
      s += '<rect width="' + G.W + '" height="' + G.H + '" fill="' + PAPIER + '"/>';
      (st.zeichen || []).filter(function (z) { return z.art === 'erde'; }).forEach(function (z) { s += zeichen(z); });
      s += waende(st);
      (st.fenster || []).forEach(function (f) { s += fenster(st, f); });
      (st.tueren || []).forEach(function (d) { s += tuer(st, d); });
      (st.treppen || []).forEach(function (t) { s += treppe(t); });
      (st.zeichen || []).filter(function (z) { return z.art !== 'erde'; }).forEach(function (z) { s += zeichen(z); });
      s += masse(st) + rahmen(plan, st, nr);
      return s + '</svg>';
    },
    /** Lage eines Raums auf dem Blatt in Prozent: { flaechen: [{l,t,w,h}], label: {x,y} } */
    lage: function (raum) {
      var fl = (raum.r || []).map(function (q) {
        return { l: px(q[0]) / G.W * 100, t: py(q[1]) / G.H * 100, w: m(q[2] - q[0]) / G.W * 100, h: m(q[3] - q[1]) / G.H * 100 };
      });
      var lp = raum.l || (raum.r && raum.r[0] ? [(raum.r[0][0] + raum.r[0][2]) / 2, (raum.r[0][1] + raum.r[0][3]) / 2] : [0, 0]);
      return { flaechen: fl, label: { x: px(lp[0]) / G.W * 100, y: py(lp[1]) / G.H * 100 } };
    },
    /** Name eines Raums für die Karte: besucht -> Spielname, sonst der Name aus dem Plan. */
    name: function (raum) {
      var z = HG.zustand.z, r = raum.raum && HG.daten.raeume[raum.raum];
      return (r && z && z.besucht[raum.raum]) ? r.name : raum.plan;
    },
    /** Bilddatei eines Blatts (Fundstück-Foto, falls vorhanden): ding-<ding>-<stockwerk> */
    bildName: function (plan, stockId) { return 'ding-' + (plan.ding || plan.id) + '-' + stockId; },
    /** Hat der Spieler den Plan schon gesehen? (Merker im Spielzustand) */
    bekannt: function (plan) { var z = HG.zustand.z; return !!(z && z.flags['_plan_' + plan.id]); },
    /** Plan als bekannt merken; kam er von einem Ding mit Anmerkungen (planNotizen), gelten auch die. */
    merke: function (plan, dingId) {
      var z = HG.zustand.z;
      z.flags['_plan_' + plan.id] = true;
      if (dingId && HG.daten.dinge[dingId] && HG.daten.dinge[dingId].planNotizen) z.flags['_plannotiz_' + dingId] = true;
    },
    /**
     * Handschriftliche Anmerkungen auf dem Plan – von Dingen, die man schon angesehen hat:
     *   Ding: { plan: 'haus', planNotizen: [{ stock: 'og', raum: 'ankleidezimmer', kreis: true, text: 'SIE', l: [x, y] }] }
     *   raum = id des Raums im Plan; l = Lage des Texts in Metern (sonst knapp unter der Raummitte).
     * Rückgabe: [{ stock, text, kreis: {l,t,w,h} | null, x, y }] mit Lage in Prozent des Blatts.
     */
    notizen: function (plan, stockId) {
      var z = HG.zustand.z, erg = [];
      if (!z) return erg;
      Object.keys(HG.daten.dinge).forEach(function (id) {
        var d = HG.daten.dinge[id];
        if (d.plan !== plan.id || !d.planNotizen || !z.flags['_plannotiz_' + id]) return;
        d.planNotizen.forEach(function (n) {
          if (stockId && n.stock !== stockId) return;
          var st = plan.stockwerke.filter(function (s) { return s.id === n.stock; })[0];
          var raum = st && st.raeume.filter(function (r) { return r.id === n.raum; })[0];
          var lage = raum ? P.lage(raum) : null;
          var f = lage && lage.flaechen[0];
          var pos = n.l ? { x: px(n.l[0]) / G.W * 100, y: py(n.l[1]) / G.H * 100 } : lage ? { x: lage.label.x, y: lage.label.y + 4 } : { x: 50, y: 50 };
          erg.push({ stock: n.stock, text: n.text, kreis: n.kreis && f ? { l: f.l - 1, t: f.t - 1.5, w: f.w + 2, h: f.h + 3 } : null, x: pos.x, y: pos.y, drehung: n.drehung || -4 });
        });
      });
      return erg;
    }
  };
})(window.HG);
