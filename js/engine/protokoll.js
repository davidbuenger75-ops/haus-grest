// Haus Grest – Engine: Spielprotokoll für Tester (David, 27.11.2026)
// Schreibt jede Ausgabe (Eingaben, Texte, Würfe, Werte …) mit Spieltag und Uhrzeit mit. Getrennt vom Spielstand:
// liegt im Speicher und zusätzlich in localStorage (Schlüssel SCHLUESSEL), damit ein Neuladen des Browsers nichts
// verliert. „Rückgängig“ und „Laden“ löschen das Protokoll nicht – es zeigt, was wirklich gespielt wurde.
// HG.protokoll.text() baut den Text zum Kopieren (Knopf „Protokoll kopieren“ in anzeige.js, Befehl „protokoll“).
(function (HG) {
  'use strict';

  var SCHLUESSEL = 'hausgrest-protokoll';
  var MAX = 6000;                 // Einträge; ältere fallen vorn heraus
  var eintraege = [];
  try { eintraege = JSON.parse(localStorage.getItem(SCHLUESSEL) || '[]') || []; } catch (e) { eintraege = []; }

  function reinerText(html) {
    return String(html || '')
      .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li|h\d)>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
      .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  function spielzeit() {
    try {
      var z = HG.zustand.z;
      if (!z || !z.zeit) return '';
      return 'T' + z.zeit.tag + ' ' + HG.zeit.uhr();
    } catch (e) { return ''; }
  }
  var speicherTimer = null;
  function speichern() {
    if (speicherTimer) return;
    speicherTimer = setTimeout(function () {
      speicherTimer = null;
      try { localStorage.setItem(SCHLUESSEL, JSON.stringify(eintraege)); }
      catch (e) { eintraege = eintraege.slice(-Math.floor(MAX / 2)); try { localStorage.setItem(SCHLUESSEL, JSON.stringify(eintraege)); } catch (e2) { /* voll – dann nur im Speicher */ } }
    }, 400);
  }

  // In die Ausgabe einhängen: alles, was angezeigt wird, kommt ins Protokoll
  var schreibe = HG.ausgabe.schreibe;
  HG.ausgabe.schreibe = function (typ, html, extra) {
    schreibe.apply(this, arguments);
    if (this.puffer && (typ === 'wert' || typ === 'hinweis' || typ === 'andeutung' || typ === 'ziel')) return;   // kommt später über leere()
    var t = reinerText(typeof html === 'string' ? html : (html && html.html) || '');
    if (!t && typ !== 'eingabe') return;
    eintraege.push({ z: spielzeit(), t: typ, x: typ === 'abschnitt' && extra && extra.nr ? '§' + extra.nr + ' ' + t : t });
    if (eintraege.length > MAX) eintraege.splice(0, eintraege.length - MAX);
    speichern();
  };

  HG.protokoll = {
    /** Trennlinie, z. B. bei neuem Spiel oder geladenem Spielstand. */
    marke: function (text) { eintraege.push({ z: spielzeit(), t: 'marke', x: text }); speichern(); },
    leeren: function () { eintraege = []; try { localStorage.removeItem(SCHLUESSEL); } catch (e) { /* egal */ } },
    anzahl: function () { return eintraege.length; },

    /** Kurzinfo zum aktuellen Spielstand. */
    kurzinfo: function () {
      var z = HG.zustand.z, zeilen = [];
      if (!z) return 'Kein Spiel geladen.';
      try {
        var sp = z.spieler || {};
        zeilen.push('Figur: ' + ([sp.vorname, sp.nachname].filter(Boolean).join(' ') || '–') + (HG.charakter && HG.charakter.berufName ? ' · ' + HG.charakter.berufName() : ''));
        zeilen.push('Zeit: ' + (HG.zeit.langText ? HG.zeit.langText() : spielzeit()) + ' · Nacht ' + (HG.nacht ? HG.nacht.nummer() : '?') +
          (HG.nacht && HG.nacht.bisNeumond ? ' · Neumond in ' + HG.nacht.bisNeumond() + ' Nächten' : '') + ' · Zug ' + (z.zug || 0));
        var r = HG.daten.raeume[z.raum];
        zeilen.push('Ort: ' + (r ? r.name + ' (' + z.raum + ', ' + (r.schauplatz || '–') + ')' : z.raum));
        zeilen.push('Werte: LP ' + z.werte.lp + '/' + (z.max && z.max.lp) + ' · NERVEN ' + z.werte.nerven + ' · WP ' + z.werte.wp + '/' + (z.max && z.max.wp) +
          (HG.macht ? ' · MACHT ' + Math.round(HG.macht.wert()) : ''));
        zeilen.push('Inventar: ' + (HG.welt.inventar().map(function (id) { return id; }).join(', ') || '–'));
        zeilen.push('Notizbuch: ' + (z.hinweise || []).length + ' Hinweise, ' + (z.schluesse || []).length + ' Schlüsse (' + (z.schluesse || []).join(', ') + ')');
        var seelen = (z.gefahren && z.gefahren.seelen) || {};
        var bekehrt = Object.keys(seelen).filter(function (k) { return seelen[k] === 'bekehrt'; });
        zeilen.push('Bekehrt: ' + (bekehrt.join(', ') || '–') + (z.flags && z.flags.kreis_gebrochen ? ' · Kreis gebrochen' : ''));
        if (z.kampf) zeilen.push('Im Kampf: ' + z.kampf.id + ' (HALT ' + z.kampf.halt + ')');
        if (z.vorbei) zeilen.push('Spiel ist vorbei.');
      } catch (e) { zeilen.push('(Kurzinfo unvollständig: ' + e.message + ')'); }
      return zeilen.join('\n');
    },

    /** Der ganze Text zum Kopieren. */
    text: function () {
      var kopf = [
        '=== Haus Grest – Spielprotokoll ===',
        'Kopiert: ' + new Date().toLocaleString('de-DE') + ' · Spielstand-Version ' + (HG.zustand.VERSION || '?'),
        (typeof navigator !== 'undefined' && navigator.userAgent ? 'Browser: ' + navigator.userAgent : ''),
        '',
        '--- Spielstand ---',
        HG.protokoll.kurzinfo(),
        '',
        '--- Verlauf (' + eintraege.length + ' Einträge) ---'
      ].filter(function (x) { return x !== null; });
      var verlauf = eintraege.map(function (e) {
        var zeit = e.z ? '[' + e.z + '] ' : '';
        if (e.t === 'eingabe') return '\n' + zeit + '> ' + e.x;
        if (e.t === 'marke') return '\n===== ' + e.x + ' =====';
        var vor = { wurf: '🎲 ', wert: '  · ', hinweis: '  ✎ ', system: '  (', tipp: '  💡 ', schock: '  ⚡ ', spuk: '  👻 ', kampf: '  ⚔ ', ende: '  ✝ ' }[e.t] || '  ';
        var nach = e.t === 'system' ? ')' : '';
        return vor + e.x.replace(/\n/g, '\n    ') + nach;
      });
      return kopf.join('\n') + '\n' + verlauf.join('\n') + '\n';
    }
  };
})(window.HG);
