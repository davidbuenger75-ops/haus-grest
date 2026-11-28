// Haus Grest – Engine: Grundlagen
// Namensraum, Register für Inhalte, Textwerkzeuge, deutsche Grammatik, Würfel.
// Enthält keine Story-Texte.
window.HG = window.HG || {};
// Spielversion: bei jeder Veröffentlichung hochzählen – zusammen mit VERSION in sw.js (der Test prüft, dass beide passen).
// Steht im Protokollkopf, damit man sieht, welcher Stand gespielt wurde.
window.HG.SPIELVERSION = 31;

(function (HG) {
  'use strict';

  // ---------------------------------------------------------------
  // Register: Hier tragen die Inhaltsdateien (js/content/) ihre Daten ein.
  // ---------------------------------------------------------------
  HG.daten = {
    raeume: {},     // id -> Raum-Definition
    dinge: {},      // id -> Gegenstand/Tür/Kulisse
    hinweise: {},   // id -> Hinweis fürs Notizbuch
    schluesse: {},  // id -> Schlussfolgerung aus zwei (oder mehr) Hinweisen
    bilder: {},     // id -> function(api) liefert SVG-Text
    ziele: {},      // id -> Reiseziel (Schauplatz außerhalb)
    nachrichten: {},// id -> Textnachricht fürs Handy
    anrufe: {},     // id -> Anruf aufs Handy
    kontakte: {},   // id -> Kontakt im Handy (anrufbar)
    spuk: {},       // id -> Spuk-Ereignis
    spiel: {}       // Startwerte, Einleitung, Endtexte usw.
  };

  /** Raum anlegen. Kleine Kulissen-Details werden automatisch zu festen Dingen. */
  HG.raum = function (id, def) {
    def.id = id;
    HG.daten.raeume[id] = def;
    (def.details || []).forEach(function (d, i) {
      var dd = Object.assign({ fest: true, szenerie: true, ort: id, genus: 'm' }, d);
      dd.beschreibung = d.text;
      HG.ding(id + '_detail' + i, dd);
    });
    return def;
  };

  /** Gegenstand, Tür oder Kulisse anlegen. */
  HG.ding = function (id, def) {
    def.id = id;
    def.genus = def.genus || 'n';
    HG.daten.dinge[id] = def;
    return def;
  };

  HG.hinweis = function (id, def) { def.id = id; HG.daten.hinweise[id] = def; return def; };
  HG.schluss = function (id, def) { def.id = id; HG.daten.schluesse[id] = def; return def; };
  HG.bild = function (id, fn) { HG.daten.bilder[id] = fn; };
  HG.spielDaten = function (obj) { Object.assign(HG.daten.spiel, obj); };
  HG.ziel = function (id, def) { def.id = id; HG.daten.ziele[id] = def; return def; };
  HG.nachricht = function (id, def) { def.id = id; HG.daten.nachrichten[id] = def; return def; };
  HG.anruf = function (id, def) { def.id = id; HG.daten.anrufe[id] = def; return def; };
  HG.kontakt = function (id, def) { def.id = id; HG.daten.kontakte[id] = def; return def; };
  HG.spuk = function (id, def) { def.id = id; HG.daten.spuk[id] = def; return def; };

  /** Zufall – austauschbar (z. B. für Tests). */
  HG.zufall = function () { return Math.random(); };

  // ---------------------------------------------------------------
  // Textwerkzeuge
  // ---------------------------------------------------------------
  var T = HG.text = {};

  /** Kleinschreibung, Umlaute als ae/oe/ue, ß als ss – für Vergleiche. */
  T.norm = function (s) {
    return String(s).toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss');
  };

  T.esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  T.gross = function (s) { s = String(s); return s.charAt(0).toUpperCase() + s.slice(1); };

  // --- Spielfigur: Name und Geschlecht ---------------------------------
  /** Geschlechtsabhängiger Text: HG.g('Cousin', 'Cousine', 'Cousin/Cousine'). */
  HG.g = function (m, w, d) {
    var sp = HG.zustand && HG.zustand.z && HG.zustand.z.spieler;
    var ge = sp && sp.geschlecht;
    if (ge === 'm') return m;
    if (ge === 'w') return w;
    return d !== undefined ? d : m + '/' + w;
  };

  /**
   * Platzhalter in Texten ersetzen (geschieht automatisch bei jeder Ausgabe):
   *   {name} {vorname} {nachname} {anrede} ("Frau Berger") {briefanrede} ("Sehr geehrte Frau Berger")
   *   {g:Cousin|Cousine|Cousin oder Cousine}  – männlich|weiblich|ohne Angabe (dritte Form optional)
   */
  T.fuelle = function (s) {
    var sp = HG.zustand && HG.zustand.z && HG.zustand.z.spieler;
    if (!s || typeof s !== 'string' || s.indexOf('{') < 0) return s;
    // Noch kein Name (Charaktererstellung)? Dann neutrale Wörter – ein Platzhalter darf nie sichtbar werden.
    if (!sp || !sp.name) sp = { name: 'Unbekannt', geschlecht: sp && sp.geschlecht };
    var teile = sp.name.trim().split(/\s+/);
    var vor = T.esc(teile[0]), nach = T.esc(teile[teile.length - 1]), voll = T.esc(sp.name);
    var anrede = sp.geschlecht === 'm' ? 'Herr ' + nach : sp.geschlecht === 'w' ? 'Frau ' + nach : voll;
    var brief = sp.geschlecht === 'm' ? 'Sehr geehrter Herr ' + nach : sp.geschlecht === 'w' ? 'Sehr geehrte Frau ' + nach : 'Guten Tag, ' + voll;
    return s.replace(/\{g:([^|}]*)\|([^|}]*)(?:\|([^}]*))?\}/g, function (m, a, b, c) { return HG.g(a, b, c); })
      .replace(/\{name\}/g, voll).replace(/\{vorname\}/g, vor).replace(/\{nachname\}/g, nach)
      .replace(/\{anrede\}/g, anrede).replace(/\{briefanrede\}/g, brief);
  };

  /** Antippbares Wort mit festen Befehlen: T.befehlWort('etwas Hartes', [['Nehmen', 'nimm etwas hartes'], …]) */
  T.befehlWort = function (text, befehle) {
    return '<span class="wort" data-befehle="' + befehle.map(function (b) { return T.esc(b[0]) + '=' + T.esc(b[1]); }).join(';') + '">' + text + '</span>';
  };

  /** ["a","b","c"] -> "a, b und c" */
  T.liste = function (arr, wort) {
    wort = wort || 'und';
    if (arr.length === 0) return '';
    if (arr.length === 1) return arr[0];
    return arr.slice(0, -1).join(', ') + ' ' + wort + ' ' + arr[arr.length - 1];
  };

  // --- Grammatik: Artikel und Adjektivendungen -----------------------
  var BEST = {
    nom: { m: 'der', f: 'die', n: 'das', pl: 'die' },
    akk: { m: 'den', f: 'die', n: 'das', pl: 'die' },
    dat: { m: 'dem', f: 'der', n: 'dem', pl: 'den' }
  };
  var UNBEST = {
    nom: { m: 'ein', f: 'eine', n: 'ein', pl: '' },
    akk: { m: 'einen', f: 'eine', n: 'ein', pl: '' },
    dat: { m: 'einem', f: 'einer', n: 'einem', pl: '' }
  };
  var SCHWACH = { // nach "der/die/das"
    nom: { m: 'e', f: 'e', n: 'e', pl: 'en' },
    akk: { m: 'en', f: 'e', n: 'e', pl: 'en' },
    dat: { m: 'en', f: 'en', n: 'en', pl: 'en' }
  };
  var GEMISCHT = { // nach "ein/eine" bzw. ohne Artikel im Plural
    nom: { m: 'er', f: 'e', n: 'es', pl: 'e' },
    akk: { m: 'en', f: 'e', n: 'es', pl: 'e' },
    dat: { m: 'en', f: 'en', n: 'en', pl: 'en' }
  };

  /** Adjektivstamm + Endung ("dunkel" + "e" -> "dunkle"). */
  T.adjektiv = function (stamm, endung) {
    if (/el$/.test(stamm) && endung) return stamm.slice(0, -2) + 'l' + endung;
    return stamm + endung;
  };

  /**
   * Name eines Dings in einem Fall.
   * art: 'der' (bestimmt), 'ein' (unbestimmt) oder '' (nur Adjektiv+Nomen).
   * Definition: { nomen:'Schlüssel', adj:['eisern'], genus:'m', nomenDat:'...' , eigenname:true, zusatz:'von 1905' }
   */
  T.name = function (def, kasus, art) {
    if (typeof def === 'string') def = HG.daten.dinge[def];
    kasus = kasus || 'nom';
    var g = def.genus || 'n';
    var tabelle = art === 'der' ? SCHWACH : GEMISCHT;
    var teile = [];
    if (!def.eigenname) {
      if (art === 'der') teile.push(BEST[kasus][g]);
      if (art === 'ein' && UNBEST[kasus][g]) teile.push(UNBEST[kasus][g]);
    }
    (def.adj || []).forEach(function (a) { teile.push(T.adjektiv(a, tabelle[kasus][g])); });
    var nomen = def.nomen;
    if (kasus === 'dat' && def.nomenDat) nomen = def.nomenDat;
    teile.push(nomen);
    if (def.zusatz) teile.push(HG.wert(def.zusatz, HG.api));   // nachgestellt (Text oder Funktion), z. B. "der Brief von 1905" – unterscheidet gleichnamige Dinge
    return teile.join(' ');
  };
  T.der = function (def, kasus) { return T.name(def, kasus, 'der'); };
  T.ein = function (def, kasus) { return T.name(def, kasus, 'ein'); };

  var PRONOMEN = {
    nom: { m: 'er', f: 'sie', n: 'es', pl: 'sie' },
    akk: { m: 'ihn', f: 'sie', n: 'es', pl: 'sie' },
    dat: { m: 'ihm', f: 'ihr', n: 'ihm', pl: 'ihnen' }
  };
  T.pron = function (def, kasus) {
    if (typeof def === 'string') def = HG.daten.dinge[def];
    return PRONOMEN[kasus || 'nom'][def.genus || 'n'];
  };

  /** Verbform je nach Einzahl/Mehrzahl: T.vb(def, 'ist', 'sind') */
  T.vb = function (def, sg, pl) {
    if (typeof def === 'string') def = HG.daten.dinge[def];
    return def.genus === 'pl' ? pl : sg;
  };

  /** "Welchen/Welche/Welches" */
  T.welch = function (genus) {
    return { m: 'Welchen', f: 'Welche', n: 'Welches', pl: 'Welche' }[genus] || 'Was';
  };

  /**
   * Liest einen Wert, der sein darf:
   *  - Text/Zahl (wird direkt geliefert)
   *  - Funktion(api, ctx)
   *  - Tageszeit-Objekt { morgen, mittag, abend, nacht, tag, sonst }
   *    ("tag" gilt für Morgen und Mittag, "sonst" für alles Übrige;
   *     fehlt beides, gilt der Tagestext bzw. der erste Eintrag)
   */
  var ZEITSCHLUESSEL = { morgen: 1, mittag: 1, abend: 1, nacht: 1, tag: 1, sonst: 1 };
  HG.istZeitObjekt = function (x) {
    if (!x || typeof x !== 'object' || Array.isArray(x)) return false;
    var k = Object.keys(x);
    return k.length > 0 && k.every(function (kk) { return ZEITSCHLUESSEL[kk]; });
  };
  HG.wert = function (x, api, ctx) {
    if (typeof x === 'function') return HG.wert(x(api || HG.api, ctx), api, ctx);
    if (HG.istZeitObjekt(x)) {
      var p = HG.zeit && HG.zustand && HG.zustand.z ? HG.zeit.phase() : 'morgen';
      var v = Object.prototype.hasOwnProperty.call(x, p) ? x[p]
        : ((p === 'morgen' || p === 'mittag') && Object.prototype.hasOwnProperty.call(x, 'tag')) ? x.tag
        : Object.prototype.hasOwnProperty.call(x, 'sonst') ? x.sonst
        : Object.prototype.hasOwnProperty.call(x, 'tag') ? x.tag : x[Object.keys(x)[0]];
      return HG.wert(v, api, ctx);
    }
    return x;
  };

  // ---------------------------------------------------------------
  // Würfel: "2W6+12", "1W6+6"
  // ---------------------------------------------------------------
  HG.wuerfel = function (formel) {
    var m = /^(\d*)\s*[wWdD]\s*(\d+)\s*([+-]\s*\d+)?$/.exec(String(formel).trim());
    if (!m) return parseInt(formel, 10) || 0;
    var anzahl = parseInt(m[1] || '1', 10), seiten = parseInt(m[2], 10);
    var summe = m[3] ? parseInt(m[3].replace(/\s/g, ''), 10) : 0;
    for (var i = 0; i < anzahl; i++) summe += 1 + Math.floor(HG.zufall() * seiten);
    return summe;
  };
})(window.HG);
