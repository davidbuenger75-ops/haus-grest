// Haus Grest – Engine: Anzeige (Browser-Oberfläche)
// Bild oben, Textverlauf, Eingabezeile, anklickbare Vorschläge,
// Seitenleiste mit Werten, Inventar und Notizbuch, Karte als Dialog.
(function (HG) {
  'use strict';

  var T = HG.text;
  function $(id) { return document.getElementById(id); }
  function Z() { return HG.zustand.z; }
  function D(id) { return HG.daten.dinge[id]; }
  var W = HG.welt;

  var verlaufEingaben = [], verlaufPos = 0, letztesBild = null, gewaehlt = [];
  var nbOffen = { gruppe: {}, hinweis: {} };   // Notizbuch: welche Gruppen/Hinweise aufgeklappt sind (nur Oberfläche)

  /** Bedienung per Finger (kein Mauszeiger)? Dann kein automatisches Fokussieren – sonst springt die Tastatur auf. */
  function touch() { return !!(window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches); }

  // Verb-Leiste: "b" = Befehl sofort, "v" = Verb, danach Objekt auswählen
  var LEISTE = [
    { t: 'Schau', b: 'schau' }, { t: 'Untersuche …', v: 'untersuche' }, { t: 'Nimm …', v: 'nimm' },
    { t: 'Öffne …', v: 'öffne' }, { t: 'Lies …', v: 'lies' }, { t: 'Benutze …', v: 'benutze' },
    { t: 'Horche', b: 'horche' }, { t: 'Warte', b: 'warte' }, { t: 'Karte', b: 'karte' },
    { t: '↶ Zurück', b: 'rückgängig' }, { t: 'Hilfe', b: 'hilfe' }
  ];
  var KURZ = { norden: 'N', osten: 'O', sueden: 'S', westen: 'W', nordosten: 'NO', nordwesten: 'NW', suedosten: 'SO', suedwesten: 'SW', hoch: '↑', runter: '↓', hinein: 'rein', hinaus: 'raus' };
  var BLATT_TITEL = { werte: 'Werte & Spiel', inventar: 'Inventar', notizbuch: 'Notizbuch', handy: 'Handy' };

  var A = HG.anzeige = {
    start: function () {
      HG.ausgabe.ziel = A.block;

      $('eingabe').addEventListener('submit', function (e) {
        e.preventDefault();
        var feld = $('befehl'), wert = feld.value;
        if (!wert.trim()) return;
        verlaufEingaben.push(wert); verlaufPos = verlaufEingaben.length;
        feld.value = '';
        A.ergaenzung();
        A.schliesseMenue(); A.blatt(null);
        HG.spiel.eingabe(wert);
      });

      // Autovervollständigung: Vorschläge zum Antippen, am PC übernimmt Tab den ersten
      $('befehl').addEventListener('input', function () { A.ergaenzung(); });
      $('ergaenzung').addEventListener('mousedown', function (e) { e.preventDefault(); }); // Fokus (und Handy-Tastatur) behalten
      $('ergaenzung').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (b) A.uebernimmErgaenzung(+b.getAttribute('data-i'));
      });
      $('befehl').addEventListener('keydown', function (e) {
        if (e.key === 'Tab' && !e.shiftKey && A._ergaenzung && A._ergaenzung.length) { e.preventDefault(); A.uebernimmErgaenzung(0); }
      });

      // Verb-Leiste und Richtungstasten
      $('leiste').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || b.disabled) return;
        if (b.hasAttribute('data-verb')) A.verbMenue(b.getAttribute('data-verb'), b);
        else A.befehl(b.getAttribute('data-befehl'));
      });

      // Antippbare Wörter im Text und ihr Aktionsmenü
      $('log').addEventListener('click', function (e) {
        var w = e.target.closest('.wort'); if (w) A.wortMenue(w);
      });
      $('wortmenue').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b || !A._menue) return;
        var x = A._menue[+b.getAttribute('data-i')];
        A.schliesseMenue();
        if (x.befehl) A.befehl(x.befehl);
        else if (x.eingabe !== undefined) A.vorbelegen(x.eingabe, x.cursorVorne);
      });
      document.addEventListener('pointerdown', function (e) {
        if ($('wortmenue').hidden) return;
        if (!e.target.closest('#wortmenue, .wort, [data-verb]')) A.schliesseMenue();
      }, true);
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        if (!$('wortmenue').hidden) { A.schliesseMenue(); A.fokus(); }
        else if (document.body.hasAttribute('data-blatt')) A.blatt(null);
      });
      window.addEventListener('resize', function () { A.schliesseMenue(); });

      // Reiter unten (schmale Bildschirme): Seitenleiste als Blatt
      document.querySelectorAll('.reiter button').forEach(function (b) {
        b.addEventListener('click', function () { A.blatt(b.getAttribute('data-blatt')); });
      });
      $('schleier').addEventListener('click', function () { A.blatt(null); });
      document.querySelector('.blatt-zu').addEventListener('click', function () { A.blatt(null); });

      // Raumbild antippen = groß anzeigen
      $('bild').addEventListener('click', function () {
        var fig = $('bild'), img = fig.querySelector('img'), r = HG.welt.raum();
        var klasse = fig.className.split(' ').filter(function (k) { return k.indexOf('art-') === 0; }).join(' ');
        var titel = r ? T.esc(r.name) : '';
        if (img) A.grossbild(img.getAttribute('src'), titel, null, klasse);
        else if (fig.querySelector('svg')) A.grossbild(null, titel, fig.innerHTML, klasse);
      });

      $('befehl').addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp' && verlaufPos > 0) { verlaufPos--; this.value = verlaufEingaben[verlaufPos]; e.preventDefault(); }
        if (e.key === 'ArrowDown') { verlaufPos = Math.min(verlaufEingaben.length, verlaufPos + 1); this.value = verlaufEingaben[verlaufPos] || ''; e.preventDefault(); }
      });

      $('vorschlaege').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        A.befehl(b.getAttribute('data-befehl'));
      });
      $('handy').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        A.befehl(b.getAttribute('data-befehl'));
      });
      $('inventar').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return;
        A.befehl(b.getAttribute('data-befehl'));
      });
      document.querySelectorAll('.tabs button').forEach(function (b) {
        b.addEventListener('click', function () { A.zeigeTab(b.getAttribute('data-tab')); });
      });
      $('notizbuch').addEventListener('change', function (e) {
        if (!e.target.matches('input[type=checkbox]')) return;
        var id = e.target.value;
        if (e.target.checked) { gewaehlt.push(id); if (gewaehlt.length > 2) gewaehlt.shift(); }
        else gewaehlt = gewaehlt.filter(function (x) { return x !== id; });
        A.notizbuch();
      });
      $('notizbuch').addEventListener('click', function (e) {
        if (e.target.closest('#verbinden') && gewaehlt.length === 2) {
          HG.spiel.verbindeImNotizbuch(gewaehlt[0], gewaehlt[1]);
          gewaehlt = [];
          A.auffrischen();
        }
      });
      // Auf-/Zuklappen merken; ein neuer Hinweis gilt als angesehen, sobald er einmal offen war.
      // ("toggle" steigt nicht auf – daher in der Einfangphase lauschen.)
      $('notizbuch').addEventListener('toggle', function (e) {
        var d = e.target;
        if (d.classList.contains('nb-gruppe')) nbOffen.gruppe[d.getAttribute('data-gruppe')] = d.open;
        else if (d.classList.contains('nb-hinweis')) {
          var id = d.getAttribute('data-id');
          nbOffen.hinweis[id] = d.open;
          if (d.open && HG.spiel.hinweisNeu(id)) {
            HG.spiel.hinweisGesehen(id);
            var p = d.querySelector('.nb-punkt'); if (p) p.parentNode.removeChild(p);
            A.notizZaehler();
            if (!Z().vorbei) HG.zustand.speichern('auto');
          }
        }
      }, true);
      document.querySelectorAll('[data-befehl-knopf]').forEach(function (b) {
        b.addEventListener('click', function () {
          var c = b.getAttribute('data-befehl-knopf');
          if (c === 'neustart ja' && !Z().vorbei && !window.confirm('Wirklich ein neues Spiel beginnen? Der aktuelle Stand geht verloren (außer du hast gespeichert).')) return;
          A.befehl(c);
        });
      });
      $('karte-zu').addEventListener('click', function () { $('karte').close(); A.fokus(); });
      // Nahansicht: Bereiche lösen Befehle aus, Ringe drehen sich erst lokal und rasten per Knopf ein
      $('nah-zu').addEventListener('click', function () { $('nah').close(); A.fokus(); });
      $('nah-bild').addEventListener('click', function (e) {
        var d = A._nah && D(A._nah); if (!d) return;
        var ring = e.target.closest('.nah-ring');
        if (ring) {
          if (ring.classList.contains('fest')) { var b = HG.wert(d.zahlenschloss.bereit, HG.api); $('nah-text').innerHTML = '<p>' + (typeof b === 'string' ? b : 'Die Ringe rühren sich nicht.') + '</p>'; return; }
          var i = +ring.getAttribute('data-ring'); A._nahZiffern[i] = (A._nahZiffern[i] + 1) % 10; HG.medien.effekt('klick'); A.zeigeNah(A._nah); return;
        }
        var ber = e.target.closest('.nah-bereich');
        if (ber) { var x = d.nahansicht.bereiche[+ber.getAttribute('data-i')]; A.nahBefehl(HG.wert(x.befehl, HG.api)); }
      });
      $('nah-steuer').addEventListener('click', function (e) {
        if (e.target.closest('.nah-einrasten') && A._nah) A.nahBefehl('drehe ' + HG.spiel.kurzwort(A._nah) + ' auf ' + A._nahZiffern.join(''));
      });
      $('werte-bereich').addEventListener('click', function (e) { var b = e.target.closest('[data-befehl]'); if (b) A.befehl(b.getAttribute('data-befehl')); });
      // Bauplan: Stockwerk wechseln, Raum antippen
      $('karte-bild').addEventListener('click', function (e) {
        var plan = A._plan && HG.daten.plaene[A._plan]; if (!plan) return;
        var s = e.target.closest('[data-stock]');
        if (s && s.getAttribute('data-stock')) { A.zeigePlan(plan, s.getAttribute('data-stock')); return; }
        var f = e.target.closest('.pr-flaeche');
        if (f) {
          var zst = { hier: 'Hier bist du.', besucht: 'Schon betreten.', neu: 'Noch nicht betreten.' }[f.getAttribute('data-zustand')];
          $('karte-bild').querySelector('.plan-info').innerHTML = '<b>' + T.esc(f.getAttribute('data-name')) + '</b> – ' + zst;
          $('karte-bild').querySelectorAll('.pr-flaeche.gewaehlt').forEach(function (x) { x.classList.remove('gewaehlt'); });
          $('karte-bild').querySelectorAll('.pr-flaeche[data-name="' + f.getAttribute('data-name').replace(/"/g, '\\"') + '"]').forEach(function (x) { x.classList.add('gewaehlt'); });
        }
      });
      $('karte').addEventListener('keydown', function (e) {
        var plan = A._plan && HG.daten.plaene[A._plan];
        if (!plan || !$('karte').classList.contains('mit-plan') || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'PageUp' && e.key !== 'PageDown')) return;
        var i = plan.stockwerke.map(function (s) { return s.id; }).indexOf(A._planStock) + (e.key === 'ArrowRight' || e.key === 'PageUp' ? 1 : -1);
        if (i >= 0 && i < plan.stockwerke.length) { A.zeigePlan(plan, plan.stockwerke[i].id); e.preventDefault(); }
      });
      $('grossbild').addEventListener('click', function () { $('grossbild').close(); A.fokus(); });

      // Ton: Browser erlauben ihn erst nach einer Eingabe des Spielers
      ['keydown', 'pointerdown'].forEach(function (ev) {
        document.addEventListener(ev, function () { HG.medien.entsperre(); }, { once: true, capture: true });
      });
      $('ton-stumm').addEventListener('click', function () { HG.medien.entsperre(); HG.medien.setzeStumm(!HG.medien.einst.stumm); A.ton(); });
      $('ton-regler').addEventListener('input', function () { HG.medien.entsperre(); HG.medien.setzeLautstaerke(this.value / 100); });
      $('ton-regler').addEventListener('change', function () { HG.medien.effekt('wuerfel'); });

      // Lese-Ansicht für Bücher: Blättern läuft über normale (leise) Befehle
      $('buch-weiter').addEventListener('click', function () { HG.spiel.eingabe('blättere weiter', { leise: true }); });
      $('buch-zurueck').addEventListener('click', function () { HG.spiel.eingabe('blättere zurück', { leise: true }); });
      $('buch-lesezeichen').addEventListener('change', function () { HG.spiel.eingabe('lies eintrag ' + this.value, { leise: true }); });
      $('buch-zu').addEventListener('click', function () { $('buch').close(); A.fokus(); });
      $('buch').addEventListener('keydown', function (e) {
        if (e.target.tagName === 'SELECT') return;
        if (e.key === 'ArrowRight') { e.preventDefault(); $('buch-weiter').click(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); $('buch-zurueck').click(); }
      });

      HG.spiel.start();
      A.fokus();
    },

    befehl: function (text) {
      A.schliesseMenue(); A.blatt(null);
      HG.spiel.eingabe(text);
      A.fokus();
    },

    /** Eingabezeile fokussieren – nur mit Maus/Tastatur, auf dem Handy bliebe sonst ständig die Tastatur offen. */
    fokus: function () { if (!touch()) $('befehl').focus(); },

    // ---------------- Autovervollständigung ----------------
    ergaenzung: function () {
      var f = $('befehl'), vorne = f.value.slice(0, f.selectionStart == null ? f.value.length : f.selectionStart);
      var liste = [];
      try { liste = HG.spiel.ergaenze(vorne); } catch (e) { liste = []; }
      A._ergaenzung = liste;
      $('ergaenzung').innerHTML = liste.map(function (x, i) { return '<button type="button" data-i="' + i + '">' + T.esc(x.anzeige) + '</button>'; }).join('');
      $('ergaenzung').hidden = !liste.length;
      document.body.classList.toggle('ergaenzt', liste.length > 0);
    },
    uebernimmErgaenzung: function (i) {
      var x = A._ergaenzung && A._ergaenzung[i]; if (!x) return;
      var f = $('befehl'), pos = f.selectionStart == null ? f.value.length : f.selectionStart;
      var hinten = f.value.slice(pos).trim();
      var neu = hinten ? x.neu.replace(/\s+$/, '') + ' ' : x.neu;
      f.value = neu + hinten;
      f.focus();
      try { f.setSelectionRange(neu.length, neu.length); } catch (e) { /* ältere Browser */ }
      A.ergaenzung();
    },
    /** Text in die Eingabezeile legen (z. B. "nimm "), Cursor ans Ende oder an den Anfang. */
    vorbelegen: function (text, cursorVorne) {
      var f = $('befehl');
      f.value = text; f.focus();
      var p = cursorVorne ? 0 : text.length;
      try { f.setSelectionRange(p, p); } catch (e) { /* ältere Browser */ }
      A.ergaenzung();
    },

    // ---------------- Verb-Leiste ----------------
    leiste: function () {
      var aus = [], da = {};
      try { if (HG.welt.raum()) aus = HG.spiel.ausgaenge(); } catch (e) { aus = []; }
      aus.forEach(function (a) { da[a.id] = a; });
      var feste = ['norden', 'osten', 'sueden', 'westen'];
      var richtungen = feste.concat(aus.filter(function (a) { return a.richtung && feste.indexOf(a.id) < 0; }).map(function (a) { return a.id; }));
      var html = '<div class="richtungen">';
      richtungen.forEach(function (k) {
        var a = da[k], name = T.gross(HG.welt.RICHTUNGEN[k].nach);
        html += '<button type="button" class="ri"' + (a ? ' data-befehl="' + T.esc(a.befehl) + '"' : ' disabled') +
          ' aria-label="' + name + '" title="' + name + '">' + (KURZ[k] || k) + '</button>';
      });
      aus.filter(function (a) { return !a.richtung; }).forEach(function (a) {
        html += '<button type="button" class="ri wortausgang" data-befehl="' + T.esc(a.befehl) + '">→ ' + T.esc(T.gross(a.id)) + '</button>';
      });
      html += '</div><div class="verben">';
      LEISTE.forEach(function (x) {
        html += '<button type="button"' + (x.b ? ' data-befehl="' + T.esc(x.b) + '"' : ' data-verb="' + x.v + '"') + '>' + T.esc(x.t) + '</button>';
      });
      $('leiste').innerHTML = html + '</div>';
    },

    // ---------------- Menüs (angetipptes Wort, Verb mit Objektauswahl) ----------------
    /** eintraege: [{ text, befehl, erledigt? } | { text, eingabe } | { kopf }]
     *  erledigt: true – landet im eingeklappten Bereich "erledigtTitel" (z. B. "Bereits gelesen") unter der Liste. */
    zeigeMenue: function (anker, titel, eintraege, erledigtTitel) {
      var m = $('wortmenue'), html = '<div class="wm-titel">' + titel + '</div>', alt = '', nAlt = 0;
      function knopf(x, i) { return '<button type="button" data-i="' + i + '"' + (x.eingabe !== undefined ? ' class="wm-eingabe"' : '') + '>' + T.esc(x.text) + '</button>'; }
      eintraege.forEach(function (x, i) {
        if (x.kopf) html += '<div class="wm-kopf">' + x.kopf + '</div>';
        else if (x.erledigt) { alt += knopf(x, i); nAlt++; }
        else if (x.eingabe !== undefined) return;   // Eingabe-Knöpfe kommen ganz nach unten
        else html += knopf(x, i);
      });
      if (nAlt) html += '<details class="wm-erledigt"><summary>' + T.esc(erledigtTitel || 'Erledigt') + ' <span class="nb-zahl">' + nAlt + '</span></summary><div class="wm-alt">' + alt + '</div></details>';
      eintraege.forEach(function (x, i) { if (!x.kopf && !x.erledigt && x.eingabe !== undefined) html += knopf(x, i); });
      m.innerHTML = html; m.hidden = false; A._menue = eintraege; A._menueAnker = anker;
      A.platziereMenue();
      var erster = m.querySelector('button, summary');
      if (erster && !touch()) erster.focus();
      var det = m.querySelector('.wm-erledigt');
      if (det) det.addEventListener('toggle', function () {
        A.platziereMenue();
        if (det.open) { det.querySelector('.wm-alt').scrollTop = 0; m.scrollTop = Math.max(0, det.offsetTop - 8); }   // aufgeklappten Bereich zeigen
      });
    },
    /** Menü am Anker ausrichten, so dass es ganz im Fenster bleibt (auch nach dem Aufklappen). */
    platziereMenue: function () {
      var m = $('wortmenue'), anker = A._menueAnker;
      if (!anker || m.hidden) return;
      m.style.left = '0px'; m.style.top = '0px';
      var r = anker.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
      var vw = document.documentElement.clientWidth, vh = window.innerHeight;
      var x = Math.min(Math.max(8, r.left), vw - mw - 8);
      var y = r.bottom + 6;
      if (y + mh > vh - 8) y = Math.max(8, r.top - mh - 6);
      m.style.left = x + 'px'; m.style.top = y + 'px';
    },
    schliesseMenue: function () {
      if ($('wortmenue')) $('wortmenue').hidden = true;
      A._menue = null;
      document.querySelectorAll('#log .wort.aktiv').forEach(function (w) { w.classList.remove('aktiv'); });
    },
    wortMenue: function (w) {
      var ids = w.getAttribute('data-ids').split(','), liste = [];
      ids.forEach(function (id) {
        var akt = HG.spiel.aktionenFuer(id);
        if (!akt.length) return;
        if (ids.length > 1) liste.push({ kopf: id.charAt(0) === '>' ? 'Ausgang' : T.esc(T.gross(T.name(id, 'nom', ''))) });
        liste = liste.concat(akt);
      });
      var wort = ids.length === 1 && ids[0].charAt(0) !== '>' && HG.daten.dinge[ids[0]] ? HG.spiel.kurzwort(ids[0]) : w.textContent.toLowerCase();
      liste.push({ text: 'Eigener Befehl …', eingabe: ' ' + wort, cursorVorne: true });
      A.schliesseMenue();
      w.classList.add('aktiv');
      A.zeigeMenue(w, T.esc(w.textContent), liste);
    },
    verbMenue: function (verb, knopf) {
      // Schon Gelesenes/Untersuchtes rutscht in den eingeklappten Bereich darunter (HG.spiel.erledigt)
      var liste = HG.spiel.objekteFuer(verb).map(function (id) {
        return { text: T.gross(T.name(id, 'nom', '')), befehl: verb + ' ' + HG.spiel.kurzwort(id), erledigt: HG.spiel.erledigt(verb, id) };
      });
      if (!liste.length) liste.push({ kopf: 'Hier ist nichts Passendes zu sehen.' });
      liste.push({ text: 'Selbst eintippen …', eingabe: verb + ' ' });
      A.zeigeMenue(knopf, T.esc(T.gross(verb)) + ' …', liste, HG.spiel.erledigtTitel(verb));
    },

    // ---------------- Blatt (Seitenleiste auf schmalen Bildschirmen) ----------------
    blatt: function (name) {
      var b = document.body;
      if (name && name === b.getAttribute('data-blatt')) name = null;
      if (name) { b.setAttribute('data-blatt', name); if (name !== 'werte') A.zeigeTab(name); }
      else b.removeAttribute('data-blatt');
      if ($('schleier')) $('schleier').hidden = !name;
      if ($('blatt-titel')) $('blatt-titel').textContent = name ? BLATT_TITEL[name] : '';
      document.querySelectorAll('.reiter button').forEach(function (k) {
        var an = k.getAttribute('data-blatt') === name;
        k.classList.toggle('aktiv', an); k.setAttribute('aria-expanded', an);
      });
      if (name) { var s = $('seite'); s.scrollTop = 0; }
    },

    // ---------------- Antippbare Wörter ----------------
    /** Hauptwörter im Text, die auf Dinge in der Nähe zeigen, antippbar machen (je Ding einmal pro Absatz). */
    verlinke: function (el) {
      try {
        if (!HG.welt.raum()) return;
        var idx = HG.spiel.wortIndex(), schon = {};
        var gang = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), knoten = [];
        while (gang.nextNode()) {
          var n = gang.currentNode;
          if (!n.parentNode.closest('button, a, .wort, .nebenbei, .unsichtbar')) knoten.push(n);
        }
        knoten.forEach(function (n) {
          var text = n.nodeValue, re = /[A-ZÄÖÜ][A-Za-zÄÖÜäöüß]{2,}/g, m, frag = null, pos = 0;
          while ((m = re.exec(text))) {
            var ids = A.findeWort(idx, m[0]);
            if (!ids) continue;
            var schl = ids.join(',');
            if (schon[schl]) continue;
            schon[schl] = true;
            frag = frag || document.createDocumentFragment();
            frag.appendChild(document.createTextNode(text.slice(pos, m.index)));
            var s = document.createElement('span');
            s.className = 'wort'; s.setAttribute('data-ids', schl); s.textContent = m[0];
            frag.appendChild(s);
            pos = m.index + m[0].length;
          }
          if (frag) { frag.appendChild(document.createTextNode(text.slice(pos))); n.parentNode.replaceChild(frag, n); }
        });
      } catch (e) { /* Verlinken ist nur Komfort – nie das Spiel stören */ }
    },
    findeWort: function (idx, wort) {
      var n = T.norm(wort), enden = ['es', 'en', 'n', 's', 'e'];
      if (idx[n]) return idx[n];
      for (var i = 0; i < enden.length; i++) {
        var e = enden[i], stamm = n.slice(0, -e.length);
        if (stamm.length >= 3 && n.slice(-e.length) === e && idx[stamm]) return idx[stamm];
      }
      return null;
    },

    /** Einen Ausgabe-Block in den Textverlauf schreiben. */
    block: function (b) {
      var log = $('log'), el;
      // Während eines Befehls aus der Nahansicht die Antwort mitschneiden (wird dort angezeigt)
      if (A._nahLog && ['text', 'wurf', 'hinweis', 'wert', 'schrift', 'system', 'frage', 'spuk', 'schock', 'andeutung'].indexOf(b.typ) >= 0) A._nahLog.push(b);
      switch (b.typ) {
        case 'eingabe': el = document.createElement('p'); el.className = 'eingabe'; el.innerHTML = '› ' + b.html; break;
        case 'titel': el = document.createElement('h2'); el.className = 'raumtitel'; el.innerHTML = b.html; break;
        case 'schrift': el = document.createElement('blockquote'); el.className = 'schrift' + (b.stil ? ' stil-' + b.stil : ''); el.innerHTML = b.html; break;
        case 'abschnitt':
          el = document.createElement('div'); el.className = 'abschnitt';
          el.innerHTML = '<div class="nr">' + b.nr + '</div><div class="abschnitt-text">' + b.html + '</div>';
          break;
        case 'ende': el = document.createElement('div'); el.className = 'ende'; el.innerHTML = b.html; break;
        case 'wurf': el = A.wurfBlock(b); break;
        case 'verteiler': el = A.verteiler(b); break;
        case 'nahknopf':
          el = document.createElement('p'); el.className = 'planknopf';
          el.innerHTML = '<button type="button">🔍 Nahansicht: ' + b.html + '</button>';
          el.querySelector('button').addEventListener('click', function () { A.zeigeNah(b.ding); });
          break;
        case 'abbildung': el = A.abbildung(b); break;
        case 'planknopf':
          el = document.createElement('p'); el.className = 'planknopf';
          el.innerHTML = '<button type="button">🗺 ' + b.html + ' ansehen</button> <span class="nebenbei">(„karte“ zeigt ihn jederzeit)</span>';
          el.querySelector('button').addEventListener('click', function () { var p = HG.daten.plaene[b.plan]; if (p) A.zeigePlan(p); });
          break;
        case 'schock': el = document.createElement('p'); el.className = 'schock'; el.innerHTML = b.html; break;
        case 'buchinhalt': el = document.createElement('div'); el.className = 'auswahl'; el.innerHTML = b.html; break;
        case 'handy': case 'anruf': case 'auswahl':
          el = document.createElement('div'); el.className = b.typ; el.innerHTML = b.html; break;
        case 'zeit': el = document.createElement('p'); el.className = 'zeitwechsel'; el.innerHTML = '— ' + b.html + ' —'; break;
        case 'spuk': el = document.createElement('p'); el.className = 'spuk'; el.innerHTML = b.html; break;
        case 'ziel': el = document.createElement('p'); el.className = 'hinweis'; el.innerHTML = '➜ ' + b.html; break;
        default:
          el = document.createElement('p'); el.className = b.typ === 'text' ? '' : b.typ === 'andeutung' ? 'system' : b.typ;
          if (b.typ === 'wert') el.className = 'wertmeldung' + (b.delta < 0 ? ' minus' : ' plus');
          el.innerHTML = (b.typ === 'hinweis' ? '✎ ' : '') + b.html;
      }
      if (b.typ === 'text' || b.typ === 'abschnitt' || b.typ === 'spuk') A.verlinke(el);
      log.appendChild(el);
      // Ältere Einträge begrenzen, damit die Seite flott bleibt
      while (log.children.length > 600) log.removeChild(log.firstChild);
      log.scrollTop = log.scrollHeight;
    },

    /** Punkte verteilen bei der Charaktererstellung: +/− je Eigenschaft, „Übernehmen“ schickt die sechs Zahlen. */
    verteiler: function (b) {
      var el = document.createElement('div'), werte = {}, gleich = Math.floor(b.punkte / b.eigenschaften.length), rest = b.punkte - gleich * b.eigenschaften.length;
      el.className = 'verteiler';
      b.eigenschaften.forEach(function (d, i) { werte[d.k] = gleich + (i < rest ? 1 : 0); });
      function summe() { return b.eigenschaften.reduce(function (s, d) { return s + werte[d.k]; }, 0); }
      function zeichne() {
        var frei = b.punkte - summe();
        el.innerHTML = b.eigenschaften.map(function (d) {
          return '<div class="vt-zeile"><span class="vt-name">' + d.name + '</span>' +
            '<button type="button" data-k="' + d.k + '" data-d="-1" aria-label="' + d.name + ' verringern"' + (werte[d.k] <= b.min ? ' disabled' : '') + '>−</button>' +
            '<b class="vt-wert">' + werte[d.k] + '</b>' +
            '<button type="button" data-k="' + d.k + '" data-d="1" aria-label="' + d.name + ' erhöhen"' + (werte[d.k] >= b.max || frei <= 0 ? ' disabled' : '') + '>+</button>' +
            '<span class="vt-proz">' + werte[d.k] * 5 + ' %</span></div>';
        }).join('') +
          '<p class="vt-frei">' + (frei === 0 ? 'Alle Punkte verteilt.' : frei > 0 ? 'Noch ' + frei + ' Punkte frei.' : (-frei) + ' Punkte zu viel.') + '</p>' +
          '<button type="button" class="vt-ok"' + (frei === 0 ? '' : ' disabled') + '>Übernehmen</button>';
      }
      el.addEventListener('click', function (e) {
        var btn = e.target.closest('button'); if (!btn || btn.disabled) return;
        if (btn.classList.contains('vt-ok')) {
          var z = HG.spiel.offen; if (!z || z.art !== 'verteilen') return;
          A.befehl(b.eigenschaften.map(function (d) { return werte[d.k]; }).join(' '));
          el.querySelectorAll('button').forEach(function (x) { x.disabled = true; });
          return;
        }
        var k = btn.getAttribute('data-k'); werte[k] += +btn.getAttribute('data-d'); zeichne();
      });
      zeichne();
      return el;
    },

    /** Würfel-Block: die Zahl rollt kurz, dann erscheint das Ergebnis. */
    wurfBlock: function (b) {
      var e = b.probe, el = document.createElement('div');
      el.className = 'wurf ' + (e.erfolg ? 'erfolg' : 'fehlschlag') + (e.kritisch ? ' kritisch' : '') + (e.patzer ? ' patzer' : '');
      if (e.auto) {
        el.className += ' fertig automatisch';
        el.innerHTML = '<span class="unsichtbar">' + b.html + '</span><div aria-hidden="true"><div class="wurf-kopf"><b>' + e.titel + '</b>' + (e.grund ? ' <span class="grund">· ' + e.grund + '</span>' : '') + '</div>' +
          '<div class="wurf-zeile"><span class="ergebnis">✓ ohne Wurf – ' + T.esc(e.berufName || 'dein Beruf') + '</span></div></div>';
        return el;
      }
      var mod = e.mod ? ' <small>(' + e.basis + ' ' + (e.mod < 0 ? '−' : '+') + ' ' + Math.abs(e.mod) + (e.modGrund ? ' ' + T.esc(e.modGrund) : '') + ')</small>' : '';
      el.innerHTML = '<span class="unsichtbar">' + b.html + '</span>' +
        '<div aria-hidden="true"><div class="wurf-kopf"><b>' + e.titel + '</b>' + (e.grund ? ' <span class="grund">· ' + e.grund + '</span>' : '') + '</div>' +
        '<div class="wurf-zeile"><span class="w100">W100</span><span class="wuerfel">' + (e.wurf === 100 ? '00' : e.wurf < 10 ? '0' + e.wurf : e.wurf) + '</span>' +
        '<span class="gegen">≤ ' + e.ziel + mod + '?</span>' +
        '<span class="ergebnis">' + (e.kritisch ? '★ kritischer Erfolg' : e.patzer ? '✗ Patzer' : e.erfolg ? '✓ bestanden' : '✗ misslungen') + '</span></div>' +
        (e.verlustSpec !== undefined ? '<div class="wurf-verlust">Verlust ' + e.verlustSpec + ' → ' + (e.erfolg ? 'Erfolg' : 'Misserfolg') + ': ' + e.verlustTeil +
          (/W/i.test(e.verlustTeil) ? ' = <b>' + e.verlust + '</b>' : '') + ' · NERVEN jetzt <b>' + e.neu + '</b></div>' : '') + '</div>';
      var ruhig = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (ruhig) { el.classList.add('fertig'); return el; }
      el.classList.add('rollt');
      var w = el.querySelector('.wuerfel'), n = 0;
      var t = setInterval(function () {
        w.textContent = 1 + Math.floor(Math.random() * 100);
        if (++n >= 14) { clearInterval(t); w.textContent = e.wurf === 100 ? '00' : e.wurf < 10 ? '0' + e.wurf : e.wurf; el.classList.remove('rollt'); el.classList.add('fertig'); }
      }, 60);
      return el;
    },

    /** Lese-Ansicht eines Buchs öffnen bzw. auf die aktuelle Seite stellen. */
    zeigeBuch: function (id) {
      var d = D(id), liste = HG.buch.seiten(id), st = Z().buecher[id] || { seite: 0, gelesen: [] };
      var pos = Math.min(st.seite, liste.length - 1), x = liste[pos];
      $('buch-titel').textContent = d.buch.titel;
      $('buch-zaehler').textContent = 'Seite ' + (pos + 1) + ' von ' + liste.length;
      $('buch-seitentitel').innerHTML = HG.text.fuelle(x.s.titel);
      var txt = $('buch-text');
      txt.className = 'buch-text stil-' + (x.s.schrift || d.buch.schrift || 'hand');
      txt.innerHTML = HG.text.fuelle(HG.wert(x.s.text, HG.api));
      var seitenBild = $('buch-bild'), nr = x.i + 1;
      seitenBild.innerHTML = ''; seitenBild.hidden = true;
      HG.medien.erstesBild([HG.medien.dingName(id) + '-' + nr], function (url) {
        if (!url || $('buch-seitentitel').textContent !== x.s.titel.replace(/<[^>]+>/g, '')) return;
        seitenBild.innerHTML = '<img src="' + url + '" alt="' + T.esc(x.s.titel) + '">'; seitenBild.hidden = false;
      });
      $('buch-zurueck').disabled = pos === 0;
      $('buch-weiter').disabled = pos >= liste.length - 1;
      $('buch-lesezeichen').innerHTML = liste.map(function (y, i) {
        return '<option value="' + (i + 1) + '"' + (i === pos ? ' selected' : '') + '>' + (st.gelesen.indexOf(y.i) >= 0 ? '✓ ' : '· ') + T.esc(y.s.titel.replace(/<[^>]+>/g, '')) + '</option>';
      }).join('');
      var seite = document.querySelector('#buch .buch-seite');
      seite.classList.remove('blaettern'); void seite.offsetWidth; seite.classList.add('blaettern');
      if (!$('buch').open) { if ($('buch').showModal) $('buch').showModal(); else $('buch').setAttribute('open', ''); }
      $('buch-weiter').focus();
    },

    auffrischen: function () {
      A.bild(); A.werte(); A.inventar(); A.notizbuch(); A.handy(); A.vorschlaege(); A.leiste(); A.tageszeit(); A.ton();
      HG.medien.atmo();
      if ($('karte').open) A.zeigeKarte();
    },

    /** Raumbild: Bilddatei aus assets/bilder/ (wenn vorhanden), sonst die SVG-Szene. */
    bild: function () {
      var r = HG.welt.raum(), hell = HG.welt.hell();
      var kand = hell ? HG.medien.raumKandidaten() : [];
      var schluessel = r.id + '|' + hell + '|' + HG.zeit.phase() + '|' + kand.map(function (k) { return k.name; }).join(',');
      var svgSchl = hell ? (r.bild || r.id) : '_dunkel';
      var fn = HG.daten.bilder[svgSchl];
      var svg = fn ? fn(HG.api) : '';
      var token = (A._bildToken = (A._bildToken || 0) + 1);
      HG.medien.erstesBild(kand.map(function (k) { return k.name; }), function (url, i) {
        if (token !== A._bildToken) return;               // inzwischen neues Bild angefordert
        var fig = $('bild'), inhalt, art;
        if (url) {
          inhalt = '<img src="' + url + '" alt="' + T.esc(r.name) + '">';
          art = kand[i].nacht ? 'datei' : 'datei auto';       // eigenes Nachtbild: kein Filter
        } else { inhalt = svg; art = 'svg'; }
        var neu = art + '|' + inhalt;
        if (neu === letztesBild && schluessel === A._bildSchluessel) return;
        var wechsel = neu !== letztesBild;
        letztesBild = neu; A._bildSchluessel = schluessel;
        fig.innerHTML = inhalt;
        fig.className = (inhalt ? '' : 'leer ') + 'art-' + art.replace(' ', ' art-');
        if (wechsel) { void fig.offsetWidth; fig.classList.add('neu'); }
      });
    },

    /** Großes Bild eines Fundstücks im Textverlauf (nur, wenn die Datei existiert). */
    abbildung: function (b) {
      var el = document.createElement('figure');
      el.className = 'abbildung';
      el.hidden = true;
      HG.medien.erstesBild([b.datei || HG.medien.dingName(b.ding)], function (url) {
        if (!url && b.umdrehen) {   // kein Bild vorhanden: nur der Umdreh-Knopf
          el.className = 'abbildung ohne-bild';
          el.innerHTML = '<figcaption><button type="button" class="abb-umdrehen">↻ Umdrehen</button></figcaption>';
          el.hidden = false;
          el.querySelector('.abb-umdrehen').addEventListener('click', function () { A.befehl(b.umdrehen); });
          return;
        }
        if (!url) { if (el.parentNode) el.parentNode.removeChild(el); return; }
        el.innerHTML = '<button type="button" class="abb-gross" title="Groß anzeigen"><img src="' + url + '" alt="' + b.html + '"></button><figcaption>' + b.html +
          (b.umdrehen ? ' <button type="button" class="abb-umdrehen" data-befehl="' + T.esc(b.umdrehen) + '">↻ Umdrehen</button>' : '') + '</figcaption>';
        el.hidden = false;
        el.querySelector('.abb-gross').addEventListener('click', function () { A.grossbild(url, b.html); });
        var u = el.querySelector('.abb-umdrehen');
        if (u) u.addEventListener('click', function () { A.befehl(u.getAttribute('data-befehl')); });
        $('log').scrollTop = $('log').scrollHeight;
      });
      return el;
    },
    /** Großansicht: Bild-URL oder fertiges HTML (z. B. SVG-Szene); klasse überträgt den Tageszeit-Filter. */
    grossbild: function (url, titel, html, klasse) {
      $('grossbild-bild').innerHTML = html || '<img src="' + url + '" alt="' + titel + '">';
      $('grossbild-bild').className = klasse || '';
      $('grossbild-titel').innerHTML = titel;
      if ($('grossbild').showModal) $('grossbild').showModal(); else $('grossbild').setAttribute('open', '');
    },

    /** Lautstärke und Stummschalter in der Seitenleiste. */
    ton: function () {
      var e = HG.medien.einst;
      $('ton-stumm').textContent = e.stumm ? '🔇' : '🔊';
      $('ton-stumm').setAttribute('aria-pressed', e.stumm);
      $('ton-stumm').title = e.stumm ? 'Ton einschalten' : 'Ton ausschalten';
      $('ton-regler').value = Math.round(e.lautstaerke * 100);
      $('ton-regler').disabled = e.stumm;
    },

    // Charakterbogen in der Seitenleiste (auf dem Handy der Reiter „Werte“). Das Gerüst wird nur neu gebaut,
    // wenn sich Eigenschaften, Beruf oder Wunden ändern – Zahlen und Balken werden direkt aufgefrischt.
    werte: function () {
      var z = Z(), C = HG.charakter, sec = $('werte-bereich');
      var BALKEN = [['lp', 'LP', 'Lebenspunkte'], ['nerven', 'NERVEN', 'NERVEN – bei 0 ist das Spiel verloren'], ['wp', 'WP', 'Willenspunkte – um dem Haus zu widerstehen']]
        .filter(function (b) { return z.max[b[0]] !== undefined; });
      var offen = (z.wunden || []).filter(function (w) { return !w.versorgt; }).length;
      var sig = JSON.stringify([z.eigenschaften, z.beruf, z.fertigkeiten, (z.wunden || []).length, offen, C.schwerVerletzt(), BALKEN.length]);
      if (sec.getAttribute('data-sig') !== sig) {
        var html = BALKEN.map(function (b) {
          return '<div class="wert" id="wert-' + b[0] + '" title="' + b[2] + '"><span class="name">' + b[1] + '</span><span class="zahl">–</span><span class="max"></span><span class="balken"><i></i></span></div>';
        }).join('');
        if (C.eigenschaftListe().length) {
          html += '<div class="eigenschaften">' + C.eigenschaftListe().map(function (d) {
            return '<div class="eig" title="' + T.esc(d.name + ': ' + (d.text || '')) + '"><span class="kurz">' + d.kurz + '</span><span class="zahl">' + (z.eigenschaften[d.k] || '–') + '</span>' +
              '<span class="proz">' + C.eigenschaftZiel(d.k) + ' %</span></div>';
          }).join('') + '</div>';
          var b = C.berufDef();
          if (b) html += '<p class="beruf"><b>' + T.esc(C.berufName()) + '</b>' + (b.text ? ' – <span>' + T.esc(HG.text.fuelle(b.text)) + '</span>' : '') + '</p>';
          if ((z.wunden || []).length || C.schwerVerletzt()) {
            html += '<p class="wunden">' + (C.schwerVerletzt() ? '<b>Schwer verletzt</b> (−' + (HG.daten.spiel.schwerMalus || 20) + ' % auf körperliche Proben). ' : '') +
              (offen ? offen + (offen === 1 ? ' Wunde' : ' Wunden') + ' unversorgt – <button type="button" data-befehl="versorge wunde">versorgen</button>' : 'Wunden versorgt.') + '</p>';
          }
          var stark = b ? Object.keys(b.boni || {}) : [];
          html += '<details class="fertigkeiten"><summary>Fertigkeiten</summary><ul>' + C.fertigkeitListe().map(function (f) {
            return '<li' + (stark.indexOf(f.k) >= 0 ? ' class="stark"' : '') + '><span>' + f.name + '</span><b>' + (z.fertigkeiten[f.k] || 0) + ' %</b></li>';
          }).join('') + '</ul></details>';
        }
        sec.innerHTML = html;
        sec.setAttribute('data-sig', sig);
      }
      BALKEN.forEach(function (bk) {
        var k = bk[0], el = $('wert-' + k); if (!el) return;
        el.querySelector('.zahl').textContent = z.werte[k];
        el.querySelector('.max').textContent = k === 'nerven' ? ' %' : '/' + z.max[k];
        var anteil = z.max[k] ? z.werte[k] / z.max[k] : 0;
        el.querySelector('.balken i').style.width = Math.round(anteil * 100) + '%';
        el.classList.toggle('knapp', k === 'lp' ? C.schwerVerletzt() : anteil <= 0.34);
      });
      // Kurzanzeige im Reiter (schmale Bildschirme)
      var rn = $('reiter-nerven');
      if (rn) {
        rn.textContent = z.werte.nerven;
        rn.parentNode.classList.toggle('knapp', z.max.nerven ? z.werte.nerven / z.max.nerven <= 0.34 : false);
        rn.parentNode.setAttribute('aria-label', 'Werte, NERVEN ' + z.werte.nerven + ' von ' + z.max.nerven);
      }
    },

    blitz: function (name, delta) {
      var els = (name === 'notizbuch' || name === 'handy')
        ? document.querySelectorAll('[data-tab=' + name + ']')
        : [$('wert-' + name), document.querySelector('.reiter [data-blatt=werte]')];
      var k = delta < 0 ? 'blitz-minus' : 'blitz-plus';
      Array.prototype.forEach.call(els, function (el) {
        if (!el) return;
        el.classList.remove('blitz-minus', 'blitz-plus'); void el.offsetWidth; el.classList.add(k);
      });
    },

    inventar: function () {
      var ids = HG.welt.kinder('spieler');
      var html = ids.length ? '' : '<p class="leer">Du hast nichts bei dir.</p>';
      ids.forEach(function (id) {
        var name = T.gross(T.name(id, 'nom', ''));
        if (D(id).lichtquelle && HG.zustand.eig(id, 'brennt')) name += ' <span class="brennt" title="brennt">🔥</span>';
        html += '<button type="button" data-befehl="untersuche ' + T.esc((D(id).kurzwort || T.name(id, 'akk', '')).toLowerCase()) + '">' + name + '</button>';
        if (HG.welt.innenZugaenglich(id)) HG.welt.kinder(id, 'in').forEach(function (k) {
          html += '<button type="button" class="drin" data-befehl="untersuche ' + T.esc((D(k).kurzwort || T.name(k, 'akk', '')).toLowerCase()) + '">↳ ' + T.gross(T.name(k, 'nom', '')) + '</button>';
        });
      });
      $('inventar').innerHTML = html;
    },

    // Notizbuch: Schlussfolgerungen oben, darunter die Hinweise nach Ermittlungsstrang in aufklappbaren
    // Gruppen. Jeder Hinweis zeigt zugeklappt Titel + erste Zeile; neue Hinweise tragen einen Punkt,
    // bis man sie einmal aufklappt (z.gesehen). Welche Gruppen/Hinweise offen sind, merkt sich nur die Oberfläche.
    notizbuch: function () {
      var z = Z(), html = '', S = HG.spiel;
      gewaehlt = gewaehlt.filter(function (id) { return z.hinweise.indexOf(id) >= 0; });
      if (!z.hinweise.length && !z.notizen.length) html = '<p class="leer">Noch keine Einträge. Hinweise werden automatisch notiert.</p>';
      if (z.schluesse.length) {
        html += '<section class="nb-schluesse"><h4>★ Schlussfolgerungen <span class="nb-zahl">' + z.schluesse.length + '</span></h4><ul class="schluesse">';
        z.schluesse.forEach(function (id) { var s = HG.daten.schluesse[id]; html += '<li><b>' + s.titel + '</b><div>' + HG.text.fuelle(s.text) + '</div></li>'; });
        html += '</ul></section>';
      }
      if (z.hinweise.length) {
        if (z.hinweise.length >= 2) html += '<p class="nb-tipp">Hake zwei Hinweise an, um sie zu verbinden.</p>';
        S.notizGruppen().forEach(function (g) {
          var neu = g.ids.filter(S.hinweisNeu).length;
          var offen = nbOffen.gruppe[g.schluessel] !== undefined ? nbOffen.gruppe[g.schluessel] : neu > 0;
          html += '<details class="nb-gruppe" data-gruppe="' + g.schluessel + '"' + (offen ? ' open' : '') + '><summary>' +
            '<span class="nb-gruppe-titel">' + T.esc(g.titel) + '</span> <span class="nb-zahl">' + g.ids.length + '</span>' +
            '<span class="nb-neu-zahl"' + (neu ? '' : ' hidden') + '>' + neu + ' neu</span></summary><ul class="hinweise">';
          g.ids.forEach(function (id) {
            var h = HG.daten.hinweise[id], text = HG.text.fuelle(h.text);
            var vorschau = text.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '');
            html += '<li><input type="checkbox" value="' + id + '" aria-label="' + T.esc(h.titel) + ' zum Verbinden wählen"' + (gewaehlt.indexOf(id) >= 0 ? ' checked' : '') + '>' +
              '<details class="nb-hinweis" data-id="' + id + '"' + (nbOffen.hinweis[id] ? ' open' : '') + '><summary>' +
              (S.hinweisNeu(id) ? '<span class="nb-punkt" title="neu" aria-label="neu"></span>' : '') +
              '<b>' + h.titel + '</b>' + (/\//.test(h.strang || '') ? ' <span class="strang">' + T.esc(h.strang) + '</span>' : '') +
              '<span class="nb-vorschau">' + vorschau + '</span></summary><div class="nb-text">' + text + '</div></details></li>';
          });
          html += '</ul></details>';
        });
        if (z.hinweise.length >= 2) {
          html += '<div class="nb-leiste"><button type="button" id="verbinden"' + (gewaehlt.length === 2 ? '' : ' disabled') + '>Zwei Hinweise verbinden' +
            (gewaehlt.length ? ' (' + gewaehlt.length + '/2)' : '') + '</button></div>';
        }
      }
      if (z.notizen.length) {
        html += '<h4>Eigene Notizen</h4><ul class="notizen">';
        z.notizen.forEach(function (n) { html += '<li>„' + T.esc(n) + '“</li>'; });
        html += '</ul>';
      }
      var box = $('notizbuch'), scroll = box.scrollTop;
      box.innerHTML = html;
      box.scrollTop = scroll;
      A.notizZaehler();
    },
    /** Zahlen und Neu-Markierungen im Reiter und an den Gruppen auffrischen (ohne alles neu zu zeichnen). */
    notizZaehler: function () {
      var z = Z(), S = HG.spiel, neu = z.hinweise.filter(S.hinweisNeu).length;
      document.querySelectorAll('[data-tab=notizbuch] .anzahl').forEach(function (t) {
        t.textContent = z.hinweise.length ? '(' + z.hinweise.length + ')' : '';
        t.classList.toggle('hat-neue', neu > 0);
        t.title = neu ? neu + ' neue Hinweise' : '';
      });
      document.querySelectorAll('#notizbuch .nb-gruppe').forEach(function (g) {
        var n = g.querySelectorAll('.nb-punkt').length, el = g.querySelector('.nb-neu-zahl');
        el.textContent = n + ' neu'; el.hidden = !n;
      });
    },

    tageszeit: function () {
      var p = HG.zeit.phase();
      document.body.setAttribute('data-zeit', p);
      var sym = { morgen: '◐', mittag: '☀', abend: '◑', nacht: '☾' }[p];
      var r = HG.welt.raum();
      var ort = r.schauplatz && HG.daten.ziele[r.schauplatz] ? HG.daten.ziele[r.schauplatz].name : '';
      var sp = Z().spieler;
      $('tageszeit').innerHTML = (sp && sp.name ? '<span class="wer">' + T.esc(sp.name) + '</span><br>' : '') + '<span class="sym">' + sym + '</span> ' + HG.zeit.datumText() + ' · <b>' + HG.zeit.uhr() + '</b>' + (ort ? '<br><span class="ort">' + T.esc(ort) + '</span>' : '');
    },

    handy: function () {
      var h = Z().handy, html = '';
      if (!HG.handy.dabei()) html += '<p class="leer">Du hast dein Handy nicht dabei.</p>';
      var neu = HG.handy.ungelesen();
      html += '<div class="handy-knoepfe"><button type="button" data-befehl="lies nachrichten">Nachrichten' + (neu ? ' (' + neu + ' neu)' : '') + '</button>' +
        '<button type="button" data-befehl="anrufliste">Anrufe</button><button type="button" data-befehl="fotos">Fotos (' + h.fotos.length + ')</button>' +
        '<button type="button" data-befehl="fotografiere">Foto machen</button><button type="button" data-befehl="ruf an">Anrufen …</button></div>';
      if (h.klingelt) html += '<p class="klingelt">☎ Es klingelt! <button type="button" data-befehl="geh ran">Rangehen</button> <button type="button" data-befehl="ignoriere">Ignorieren</button></p>';
      h.nachrichten.slice(-4).reverse().forEach(function (m) {
        var d = HG.daten.nachrichten[m.id];
        html += '<div class="sms klein' + (m.gelesen ? '' : ' neu') + '"><span class="von">' + T.esc(HG.wert(d.von, HG.api)) + '</span> <span class="wann">' + m.zeit + '</span>' +
          (m.gelesen ? '<div>' + HG.wert(d.text, HG.api) + '</div>' : '<div><i>ungelesen</i></div>') + '</div>';
      });
      $('handy').innerHTML = html;
      document.querySelectorAll('[data-tab=handy] .anzahl').forEach(function (t) { t.textContent = h.klingelt ? '(☎)' : neu ? '(' + neu + ')' : ''; });
    },

    zeigeTab: function (name) {
      document.querySelectorAll('.tabs button').forEach(function (b) {
        var an = b.getAttribute('data-tab') === name;
        b.classList.toggle('aktiv', an); b.setAttribute('aria-selected', an);
      });
      document.querySelectorAll('.tab-inhalt').forEach(function (t) { t.hidden = t.id !== name; });
    },

    vorschlaege: function () {
      var html = '';
      HG.spiel.vorschlaege().forEach(function (v) {
        html += '<button type="button" data-befehl="' + T.esc(v) + '">' + T.esc(v) + '</button>';
      });
      $('vorschlaege').innerHTML = html;
    },

    zeigeKarte: function () {
      // Kennt der Spieler den Bauplan dieses Schauplatzes, ist der Plan die Karte (js/engine/plan.js)
      var r = HG.welt.raum(), plan = r && HG.plan && HG.plan.fuerSchauplatz(r.schauplatz);
      if (plan && HG.plan.bekannt(plan)) { A.zeigePlan(plan); return; }
      A._plan = null;
      var k = HG.welt.kartenDaten();
      var B = 150, H = 70, GX = 210, GY = 130;
      var pos = {};
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      k.raeume.forEach(function (r) {
        pos[r.id] = { x: r.x * GX, y: r.y * GY };
        minX = Math.min(minX, r.x * GX); maxX = Math.max(maxX, r.x * GX);
        minY = Math.min(minY, r.y * GY); maxY = Math.max(maxY, r.y * GY);
      });
      var rand = 110;
      // Mindestgröße, damit ein einzelner Raum nicht riesig erscheint
      var breite = Math.max(maxX - minX + 2 * rand, 3 * GX), hoehe = Math.max(maxY - minY + 2 * rand, 3 * GY);
      var vb = ((minX + maxX) / 2 - breite / 2) + ' ' + ((minY + maxY) / 2 - hoehe / 2) + ' ' + breite + ' ' + hoehe;
      var VEK = { norden: [0, -1], sueden: [0, 1], osten: [1, 0], westen: [-1, 0], nordosten: [1, -1], nordwesten: [-1, -1], suedosten: [1, 1], suedwesten: [-1, 1], hoch: [0.6, -0.6], runter: [-0.6, 0.6] };
      var linien = '';
      k.wege.forEach(function (w) {
        var a = pos[w.von]; if (!a) return;
        var v = VEK[w.richtung] || [0, 0];
        if (w.nach && pos[w.nach]) {
          var b = pos[w.nach];
          linien += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '"/>';
        } else {
          var lx = v[0] * (B / 2 + 30), ly = v[1] * (H / 2 + 30);
          linien += '<line class="offen" x1="' + a.x + '" y1="' + a.y + '" x2="' + (a.x + lx) + '" y2="' + (a.y + ly) + '"/>';
          if (w.richtung === 'hoch' || w.richtung === 'runter') linien += '<text class="treppe" x="' + (a.x + lx) + '" y="' + (a.y + ly) + '">' + (w.richtung === 'hoch' ? '↑' : '↓') + '</text>';
        }
      });
      var kasten = '';
      k.raeume.forEach(function (r) {
        var p = pos[r.id];
        kasten += '<g class="raum' + (r.hier ? ' hier' : '') + '"><rect x="' + (p.x - B / 2) + '" y="' + (p.y - H / 2) + '" width="' + B + '" height="' + H + '" rx="4"/>' +
          '<text x="' + p.x + '" y="' + (p.y + 6) + '">' + T.esc(r.name) + '</text>' + (r.hier ? '<text class="du" x="' + p.x + '" y="' + (p.y + 26) + '">(du bist hier)</text>' : '') + '</g>';
      });
      $('karte-bild').innerHTML = '<svg viewBox="' + vb + '" role="img" aria-label="Karte der bekannten Räume">' +
        '<g class="wege">' + linien + '</g>' + kasten + '</svg>';
      $('karte').classList.remove('mit-plan');
      if (!$('karte').open) {
        if ($('karte').showModal) $('karte').showModal(); else $('karte').setAttribute('open', '');
      }
    },

    // ---------------- Nahansicht eines Dings ----------------
    // Ding: nahansicht: { groesse: [800, 600], svg: fn(api), bereiche: [{ titel, r: [x, y, w, h], befehl: fn(api) | 'text', sichtbar: fn(api) }],
    //                     ringe: [[x, y, r], …] }  – Ringe gehören zum zahlenschloss des Dings. Alles bleibt auch per Texteingabe lösbar.
    zeigeNah: function (id) {
      var d = D(id), n = d && d.nahansicht, api = HG.api;
      if (!n) return;
      if (A._nah !== id) { A._nah = id; A._nahZiffern = null; $('nah-text').innerHTML = ''; }
      var g = n.groesse || [800, 600], pc = function (v, i) { return (v / g[i] * 100).toFixed(2) + '%'; };
      var zs = d.zahlenschloss, n4 = zs ? (zs.stellen || 4) : 0;
      if (zs && !A._nahZiffern) A._nahZiffern = (HG.zustand.eig(id, 'ziffern') || '0000000000'.slice(0, n4)).split('').map(Number);
      var bereit = zs ? HG.wert(zs.bereit, api) : false;
      var html = '<div class="nah-flaeche" style="aspect-ratio:' + g[0] + ' / ' + g[1] + '">' + (HG.wert(n.svg, api) || '');
      (n.bereiche || []).forEach(function (b, i) {
        if (b.sichtbar !== undefined && !HG.wert(b.sichtbar, api)) return;
        html += '<button type="button" class="nah-bereich" data-i="' + i + '" title="' + T.esc(b.titel) + '" aria-label="' + T.esc(b.titel) + '" style="left:' + pc(b.r[0], 0) + ';top:' + pc(b.r[1], 1) + ';width:' + pc(b.r[2], 0) + ';height:' + pc(b.r[3], 1) + '"></button>';
      });
      if (zs && n.ringe && !HG.zustand.eig(id, 'offen')) n.ringe.forEach(function (r, i) {
        html += '<button type="button" class="nah-ring' + (bereit === true || bereit === undefined ? '' : ' fest') + '" data-ring="' + i + '" aria-label="Ring ' + (i + 1) + ', steht auf ' + A._nahZiffern[i] + '" style="left:' + pc(r[0] - r[2], 0) + ';top:' + pc(r[1] - r[2], 1) + ';width:' + pc(2 * r[2], 0) + ';height:' + pc(2 * r[2], 1) + '"><span>' + A._nahZiffern[i] + '</span></button>';
      });
      html += '</div>';
      $('nah-bild').innerHTML = html;
      $('nah-titel').textContent = T.gross(T.name(id, 'nom', ''));
      $('nah-steuer').innerHTML = (zs && n.ringe && !HG.zustand.eig(id, 'offen'))
        ? '<span class="nebenbei">Ringe antippen zum Drehen, dann:</span> <button type="button" class="nah-einrasten">Ringe auf ' + A._nahZiffern.join('') + ' einrasten lassen</button>'
        : '';
      if (!$('nah').open) { if ($('nah').showModal) $('nah').showModal(); else $('nah').setAttribute('open', ''); }
    },
    /** Befehl aus der Nahansicht: ausführen und die Antwort im Dialog zeigen. */
    nahBefehl: function (text) {
      A._nahLog = [];
      HG.spiel.eingabe(text);
      var log = A._nahLog; A._nahLog = null;
      $('nah-text').innerHTML = '<p class="nah-eingabe">› ' + T.esc(text) + '</p>' + log.map(function (b) {
        if (b.typ === 'wurf') return '<p class="nah-wurf">🎲 ' + b.html + '</p>';
        return '<p class="nah-' + b.typ + '">' + (b.typ === 'hinweis' ? '✎ ' : '') + b.html + '</p>';
      }).join('');
      if (A._nah && W.imUmfeld(A._nah, true)) A.zeigeNah(A._nah); else $('nah').close();
    },

    // ---------------- Bauplan als Karte ----------------
    // Blatt = Fundstück-Foto ding-<ding>-<stockwerk> (falls vorhanden), sonst das gezeichnete SVG.
    // Darüber die Raumnamen: unbesucht = Name aus dem Plan, besucht = Name im Spiel, aktueller Raum hervorgehoben.
    zeigePlan: function (plan, stockId) {
      var z = Z(), hier = HG.plan.finde(plan, z.raum);
      if (A._plan !== plan.id) A._planStock = null;
      A._plan = plan.id;
      var st = plan.stockwerke.filter(function (s) { return s.id === (stockId || A._planStock); })[0] ||
        (hier && hier.stock) || plan.stockwerke.filter(function (s) { return s.id === 'eg'; })[0] || plan.stockwerke[0];
      A._planStock = st.id;
      var reiter = plan.stockwerke.map(function (s) {
        return '<button type="button" data-stock="' + s.id + '"' + (s.id === st.id ? ' aria-current="true" class="an"' : '') + '>' + T.esc(s.kurz || s.name) +
          (hier && hier.stock.id === s.id ? ' <span class="plan-du" aria-label="du bist hier">●</span>' : '') + '</button>';
      }).join('');
      var i = plan.stockwerke.indexOf(st);
      var ebene = '';
      st.raeume.forEach(function (raum) {
        var lage = HG.plan.lage(raum), besucht = !!(raum.raum && z.besucht[raum.raum]), ist = raum.raum && raum.raum === z.raum;
        var name = HG.plan.name(raum), kl = (besucht ? ' besucht' : '') + (ist ? ' hier' : '');
        lage.flaechen.forEach(function (f) {
          ebene += '<button type="button" class="pr-flaeche' + kl + '" data-name="' + T.esc(name) + '" data-zustand="' + (ist ? 'hier' : besucht ? 'besucht' : 'neu') + '"' +
            ' style="left:' + f.l.toFixed(2) + '%;top:' + f.t.toFixed(2) + '%;width:' + f.w.toFixed(2) + '%;height:' + f.h.toFixed(2) + '%" aria-label="' + T.esc(name) + '"></button>';
        });
        ebene += '<span class="pr-name' + kl + (raum.klein ? ' klein' : '') + '" style="left:' + lage.label.x.toFixed(2) + '%;top:' + lage.label.y.toFixed(2) + '%">' +
          (ist ? '<b class="pr-du">●</b> ' : besucht ? '<span class="pr-haken">✓</span> ' : '') + T.esc(name) + '</span>';
      });
      $('karte-bild').innerHTML = '<div class="plan">' +
        '<div class="plan-kopf"><button type="button" class="plan-blaettern" data-stock="' + (i > 0 ? plan.stockwerke[i - 1].id : '') + '"' + (i > 0 ? '' : ' disabled') + ' aria-label="Stockwerk darunter">‹</button>' +
        '<div class="plan-reiter" role="tablist">' + reiter + '</div>' +
        '<button type="button" class="plan-blaettern" data-stock="' + (i < plan.stockwerke.length - 1 ? plan.stockwerke[i + 1].id : '') + '"' + (i < plan.stockwerke.length - 1 ? '' : ' disabled') + ' aria-label="Stockwerk darüber">›</button></div>' +
        '<div class="plan-blatt"><div class="plan-grund">' + HG.plan.svg(plan, st.id) + '</div><div class="plan-ebene">' + ebene + '</div></div>' +
        '<p class="plan-info" aria-live="polite">' + T.esc(st.name) + ' – tippe auf einen Raum. <span class="pr-legende"><b class="pr-du">●</b> du bist hier · <span class="pr-haken">✓</span> betreten</span></p></div>';
      $('karte').classList.add('mit-plan');
      // Fundstück-Foto des Blatts, wenn vorhanden (ersetzt die Zeichnung)
      var token = (A._planToken = (A._planToken || 0) + 1);
      HG.medien.erstesBild([HG.plan.bildName(plan, st.id)], function (url) {
        if (!url || token !== A._planToken) return;
        var g = $('karte-bild').querySelector('.plan-grund');
        if (g) g.innerHTML = '<img src="' + url + '" alt="Bauplan, ' + T.esc(st.name) + '">';
      });
      if (!$('karte').open) {
        if ($('karte').showModal) $('karte').showModal(); else $('karte').setAttribute('open', '');
      }
    }
  };
})(window.HG);
