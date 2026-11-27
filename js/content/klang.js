// Haus Grest – Inhalt: Sound-Verzeichnis (David, 27.11.2026)
// EINE Quelle für beides:
//   • das Spiel: Untertitel (für jedes Geräusch, auch ohne Ton) und „laut“ (höchstens ein lauter Schreck pro Nacht)
//   • tools/sounds.js: erzeugt die Dateien über die ElevenLabs Sound-Effects-API (Prompt, Länge, Schleife)
//
// HG.klang('<dateiname ohne Endung>', {
//   art: 'schleife' | 'effekt',      // Schleife = nahtlos loopbar (API: loop), Effekt = einmalig
//   sek: 4,                          // Länge in Sekunden (Effekte kurz, Schleifen 20–30, höchstens 30)
//   untertitel: 'Schritte über dir', // erscheint als [Schritte über dir] im Text; leer = kein Untertitel
//   laut: true,                      // lauter Schreck – höchstens einer pro Nacht, danach nur der Untertitel
//   prompt: '…'                      // Beschreibung für ElevenLabs (Englisch klingt dort zuverlässiger)
// });
// Dateien: assets/sound/<name>.mp3 · Hintergrund ort-<schauplatz>[-nacht] · Effekte effekt-<name>
// (api.sound('name') spielt effekt-<name>; Spuk-Ereignisse spielen effekt-spuk-<id>).
// Stand: die fünf Probe-Sounds und der Herzschlag. Der Rest folgt, wenn David den Klang abgenommen hat.
(function () {

  // --- Probe 1: Hintergrund Haus nachts ----------------------------------
  HG.klang('ort-haus-nacht', { art: 'schleife', sek: 30, untertitel: '',
    prompt: 'Inside a large empty old Victorian house at night: deep low drone, old wooden beams creaking slowly, faint wind moaning in a chimney, very distant settling knocks, an almost inaudible slow heartbeat-like pulse. Dark, oppressive, quiet, no music, no voices. Seamless ambient loop.' });

  // --- Probe 2: Schritte über dir ----------------------------------------
  HG.klang('effekt-spuk-schritte_oben', { art: 'effekt', sek: 6, untertitel: 'Schritte über dir',
    prompt: 'Slow heavy footsteps on old creaking wooden floorboards in the room directly above, heard from below through the ceiling, muffled, five or six steps, then they stop right overhead. Silence after. Horror atmosphere.' });

  // --- Probe 3: Klopfen, dreimal -----------------------------------------
  HG.klang('effekt-klopfen-dreimal', { art: 'effekt', sek: 4, untertitel: 'Es klopft dreimal zurück',
    prompt: 'Three slow deliberate knocks with knuckles on a wooden door from the other side, dull and close, long pauses between the knocks, silence afterwards. Eerie, intimate, dry room.' });

  // --- Probe 4: Kinderlachen ---------------------------------------------
  HG.klang('effekt-kinderlachen', { art: 'effekt', sek: 4, untertitel: 'Irgendwo lacht ein Kind',
    prompt: 'A single young girl giggling softly somewhere far away in an empty old house, short and bright, with a long hollow reverb from distant rooms and corridors, then sudden silence. Unsettling, ghostly.' });

  // --- Probe 5: Eine Uhr schlägt drei ------------------------------------
  // EIN Gongschlag (David, 27.11.2026: „macht nur einmal gong“). Die Engine spielt ihn so oft, wie die Uhr schlägt:
  // nachts im Haus jede volle Stunde (gefahren.js), um 3 Uhr als lauter Höhepunkt. Mal und Untertitel kommen vom Aufruf.
  HG.klang('effekt-uhr', { art: 'effekt', sek: 9, untertitel: 'Eine Uhr schlägt',
    wiederholen: { mal: 1, abstand: 2.6 },
    prompt: 'A single deep resonant strike of an old grandfather clock bell at night, one metallic chime with a long slow decay, heard through a large silent hall. No ticking, nothing else.' });

  // --- Herzschlag bei niedrigen NERVEN (Engine, Spielbibel / seelen-gefahren-sound.md 4.1) ---
  HG.klang('effekt-herzschlag', { art: 'schleife', sek: 20, untertitel: '',
    prompt: 'Close, muffled human heartbeat heard from inside the body, steady resting pace around 70 beats per minute, deep low thumps, no other sounds. Seamless loop.' });

})();
