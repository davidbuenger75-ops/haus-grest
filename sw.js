// Haus Grest – Service Worker: macht das Spiel offline spielbar, wenn es als Web-App
// über http(s) läuft. Beim Doppelklick auf index.html (file://) wird er nicht benutzt.
//
// Beim Installieren liest er index.html und speichert alle dort eingebundenen Skripte
// und Stile – eine eigene Dateiliste muss also nicht gepflegt werden.
//
// Code (index.html, Skripte, Stile) kommt immer zuerst frisch aus dem Netz; nur offline aus dem Speicher.
// So mischen sich nach einer Veröffentlichung nie alte und neue Dateien. Bilder und Sounds kommen
// aus dem Speicher (schnell), sobald sie einmal geladen wurden.
//
// Bei JEDER Veröffentlichung VERSION hochzählen – gleiche Zahl wie HG.SPIELVERSION in js/engine/grundlagen.js
// (node tools/test.js prüft das).
'use strict';

var VERSION = 'haus-grest-30';
var GRUNDDATEIEN = ['./', './index.html', './manifest.webmanifest', './assets/icons/icon.svg',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    fetch('./index.html', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (html) {
      var dateien = GRUNDDATEIEN.slice(), m, re = /<(?:script|link)[^>]+(?:src|href)="([^"#:]+)"/g;
      while ((m = re.exec(html))) if (dateien.indexOf(m[1]) < 0) dateien.push(m[1]);
      // cache: 'reload' umgeht den Browser-Zwischenspeicher – sonst landen alte Dateien im neuen Speicher
      return caches.open(VERSION).then(function (c) {
        return c.addAll(dateien.map(function (d) { return new Request(d, { cache: 'reload' }); }));
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (namen) {
      return Promise.all(namen.filter(function (n) { return n !== VERSION; }).map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function istCode(url) {
  return url.pathname.slice(-1) === '/' || /\.(html|js|css|webmanifest)$/.test(url.pathname);
}

self.addEventListener('fetch', function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  if (istCode(url)) {
    // Netz zuerst (am Browser-Zwischenspeicher vorbei), Speicher nur, wenn offline
    e.respondWith(
      caches.open(VERSION).then(function (c) {
        return fetch(req, { cache: 'no-cache' }).then(function (antwort) {
          if (antwort && antwort.ok) c.put(req, antwort.clone());
          return antwort;
        }).catch(function () {
          return c.match(req, { ignoreSearch: true }).then(function (alt) { return alt || Response.error(); });
        });
      })
    );
    return;
  }
  // Bilder, Sounds: aus dem Speicher, sonst laden und merken
  e.respondWith(
    caches.open(VERSION).then(function (c) {
      return c.match(req, { ignoreSearch: true }).then(function (alt) {
        return alt || fetch(req).then(function (antwort) {
          if (antwort && antwort.ok && antwort.status === 200) c.put(req, antwort.clone());
          return antwort;
        });
      });
    })
  );
});
