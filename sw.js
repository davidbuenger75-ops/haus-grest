// Haus Grest – Service Worker: macht das Spiel offline spielbar, wenn es als Web-App
// über http(s) läuft. Beim Doppelklick auf index.html (file://) wird er nicht benutzt.
//
// Beim Installieren liest er index.html und speichert alle dort eingebundenen Skripte
// und Stile – eine eigene Dateiliste muss also nicht gepflegt werden.
// Bilder und Sounds landen im Speicher, sobald sie einmal geladen wurden.
//
// Nach Änderungen am Spiel VERSION hochzählen, damit alte Speicherstände verschwinden.
'use strict';

var VERSION = 'haus-grest-24';
var GRUNDDATEIEN = ['./', './index.html', './manifest.webmanifest', './assets/icons/icon.svg',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    fetch('./index.html', { cache: 'no-store' }).then(function (r) { return r.text(); }).then(function (html) {
      var dateien = GRUNDDATEIEN.slice(), m, re = /<(?:script|link)[^>]+(?:src|href)="([^"#:]+)"/g;
      while ((m = re.exec(html))) if (dateien.indexOf(m[1]) < 0) dateien.push(m[1]);
      return caches.open(VERSION).then(function (c) { return c.addAll(dateien); });
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

// Erst aus dem Speicher antworten (schnell, offline), im Hintergrund auffrischen.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(VERSION).then(function (c) {
      return c.match(req, { ignoreSearch: true }).then(function (alt) {
        var neu = fetch(req).then(function (antwort) {
          if (antwort && antwort.ok) c.put(req, antwort.clone());
          return antwort;
        }).catch(function () { return alt || Response.error(); });
        return alt || neu;
      });
    })
  );
});
