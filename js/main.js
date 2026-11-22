// Haus Grest – Start. Wird als letzte Datei geladen.
HG.anzeige.start();

// Offline-Fähigkeit als Web-App – nur über http(s), nie beim Doppelklick (file://).
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', function () {
    try { navigator.serviceWorker.register('sw.js').catch(function () { /* egal – das Spiel läuft auch so */ }); } catch (e) { /* dito */ }
  });
}
