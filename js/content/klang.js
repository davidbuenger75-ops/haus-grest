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
// Stand 27.11.2026: Probe-Sounds (von David abgenommen) und der vollständige Rest.
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

  // =====================================================================
  // DER REST (27.11.2026, nach Davids Abnahme der Probe-Sounds)
  // =====================================================================
  function S(name, art, sek, untertitel, prompt, laut) { HG.klang(name, { art: art, sek: sek, untertitel: untertitel, prompt: prompt, laut: !!laut }); }
  var LOOP = ' Seamless ambient loop, no music, no voices unless described.';
  // Spieltest 2: Schleifen nur gleichmäßiger Hintergrund – keine einzelnen Ereignisse (Türen, Schritte, Telefon), die
  // sich alle 25 Sekunden wiederholen würden. Ereignisse sind Effekte und werden einmal gespielt.
  var RUHIG = ' Steady, even background texture only – no distinct single events: no doors, no footsteps, no phones, no knocks.';

  // --- Hintergrundschleifen je Schauplatz --------------------------------
  S('ort-haus', 'schleife', 25, '', 'Inside a large empty old house during the day: slow ticking of a distant clock, old wood quietly creaking and settling, faint wind outside the windows, a very low barely audible hum. Still, uneasy.' + LOOP);
  // Spieltest 3: Das Ticken nervt auf Dauer – nach 30 Sekunden ausblenden, bei jedem Raumwechsel wieder kurz (medien.js)
  HG.daten.klaenge['ort-haus'].ausblenden = 30;
  // Vor der Haustür, abends und nachts (Spieltest 3): gedämpftes Klavier aus dem Haus, bricht beim Öffnen der Tür ab
  // (Raum-Sound der Einfahrt, kolbe.js/erdgeschoss.js; Untertitel aus der Spiellogik)
  HG.klang('klavier-gedaempft', { art: 'schleife', sek: 25, untertitel: 'Drinnen spielt jemand Klavier', abbruch: true,
    prompt: 'A slow, sad lullaby played on an old, slightly out-of-tune grand piano somewhere deep inside a large house, heard from outside through a heavy closed wooden front door: muffled, distant, dull, no high frequencies, a little reverb of an empty hall. Quiet night outdoors, no wind. Seamless loop.' });
  S('effekt-musik-bricht-ab', 'effekt', 1.5, 'Die Musik bricht ab', 'A muffled piano chord inside a house cut off abruptly mid-note, followed by complete dead silence.');
  S('ort-zuhause', 'schleife', 25, '', 'Small quiet city apartment in the morning: soft distant street traffic through a closed window, a fridge humming. Calm, ordinary.' + RUHIG + LOOP);
  S('ort-lager', 'schleife', 25, '', 'Large corrugated-metal self-storage hall: steady buzzing of fluorescent tubes, occasional water drip, faint distant traffic. Cold and empty.' + LOOP);
  S('ort-lager-nacht', 'schleife', 25, '', 'Self-storage hall at night: only the buzz of fluorescent tubes, slow water drips, irregular metallic creaks of the roof cooling down. Lonely, tense.' + LOOP);
  S('ort-bauamt', 'schleife', 25, '', 'Town hall office corridor: muffled indistinct voices behind closed doors, the low hum of office ventilation and computers.' + RUHIG + LOOP);
  S('ort-polizei', 'schleife', 25, '', 'Small police station waiting area: faint, steady police radio static far away, the hum of fluorescent lights and a ventilation fan.' + RUHIG + LOOP);
  S('ort-friedhof', 'schleife', 25, '', 'Old village cemetery in late autumn: soft wind in bare old linden trees, dry leaves rustling on the ground. Melancholic.' + RUHIG + ' No birds.' + LOOP);
  S('ort-altenheim', 'schleife', 25, '', 'Retirement home common room: a television playing quietly in the background, unintelligible, teaspoons clinking in cups, a wall clock ticking, soft murmured conversation.' + LOOP);
  S('ort-stadtarchiv', 'schleife', 25, '', 'Large silent archive reading room under a glass dome: occasional rustle of old paper, a quiet cough, slow ticking of a wall clock, the faint hum of a microfilm reader.' + LOOP);
  S('ort-gerdes', 'schleife', 25, '', 'Stairwell of a 1970s apartment block: a television murmuring indistinctly behind a door far away, faint distant children playing outside, the hollow stillness of a concrete stairwell.' + RUHIG + LOOP);
  S('ort-kolbe', 'schleife', 25, '', 'Small old-fashioned kitchen: a ticking kitchen clock, a fluorescent tube humming, a cat purring now and then, a schlager song very quietly on a radio in another room.' + LOOP);
  S('ort-krankenhaus', 'schleife', 25, '', 'Hospital emergency waiting room: fluorescent hum, a vending machine buzzing, very faint distant steady beeping of monitors.' + RUHIG + LOOP);

  // --- Engine-Effekte (ohne Untertitel – der Text sagt es schon) ----------
  S('effekt-wuerfel', 'effekt', 1, '', 'Two small dice rolling briefly on a wooden table, dry, short.');
  S('effekt-schock', 'effekt', 2, '', 'A sharp dissonant string stab with a sudden gasp of breath, horror sting, very short.', true);
  S('effekt-handy-vibriert', 'effekt', 2, '', 'A smartphone vibrating twice on a wooden table.');
  S('effekt-handy-klingelt', 'effekt', 4, '', 'A plain modern smartphone ringtone, simple tone pattern repeated twice.');
  S('effekt-seite', 'effekt', 1.5, '', 'A single paper page of an old book being turned.');
  S('effekt-klick', 'effekt', 0.5, '', 'A tiny mechanical click of a small brass dial ring turning one notch.');

  // --- Dinge und Inhalte ------------------------------------------------
  S('effekt-spiegel-zerbricht', 'effekt', 3, 'Glas zerspringt', 'A mirror shattering, glass shards tinkling down onto a wooden floor, a short high ringing afterwards.', true);
  S('effekt-tuer-knarren', 'effekt', 3, 'Die Tür knarrt', 'A heavy old wooden door slowly opening with a long creak.');
  S('effekt-schluessel', 'effekt', 2, 'Ein Schlüssel dreht sich im Schloss', 'An old heavy bit key turning stiffly in an old lock, a solid clack.');
  S('effekt-stahltuer', 'effekt', 3, 'Die Stahltür quietscht', 'A steel door squealing open, metallic echo in a large hall.');
  S('effekt-vorhaengeschloss', 'effekt', 1.5, 'Das Schloss springt auf', 'A padlock snapping open with a dry metallic clack.');
  S('effekt-schublade', 'effekt', 1.5, '', 'A sticking old wooden drawer jerked open.');
  S('effekt-streichholz', 'effekt', 2, '', 'A match being struck, the flame flaring up with a soft whoosh.');
  S('effekt-auspusten', 'effekt', 1, '', 'Someone blowing out a candle, a short puff.');
  S('effekt-zugschnur', 'effekt', 1.5, '', 'Click of a pull-chain light switch, then a light bulb starting to hum faintly.');
  S('effekt-klebeband', 'effekt', 2, '', 'Packing tape being slowly and stickily torn off.');
  S('effekt-papier', 'effekt', 2, '', 'A thick paper envelope being opened, sheets of paper rustling.');
  S('effekt-karton', 'effekt', 1.5, '', 'Cardboard box flaps being folded open.');
  S('effekt-neon-an', 'effekt', 2, '', 'A fluorescent tube flickering on with ticking and a clack, then humming.');
  S('effekt-neon-aus', 'effekt', 1.5, '', 'A relay clack and the hum of fluorescent lights stopping abruptly, silence.');
  S('effekt-rolltor', 'effekt', 5, 'Das Rolltor rattert hoch', 'Electronic keypad beep, then a large metal roller shutter gate rattling upward.');
  S('effekt-riegel', 'effekt', 3, 'Der Riegel kreischt', 'A heavy rusty iron bolt screeching back, old sealing wax cracking.');
  S('effekt-glas-splittert', 'effekt', 2.5, 'Eine Scheibe zerspringt', 'A glass pane in a wooden door being smashed, shards clattering on tiles.', true);
  S('effekt-klopfen-glas', 'effekt', 4, 'Es klopft zurück – von innen', 'Two knuckle knocks on thick mirror glass, a pause, then a single duller knock answering from the other side.');
  S('effekt-hammer-wand', 'effekt', 2.5, 'Der Hammer kracht gegen die Wand', 'A heavy sledgehammer blow on plaster and brick in a cellar, debris crumbling down, echo.');
  S('effekt-wand-durchbruch', 'effekt', 4, 'Die Wand bricht ein', 'A final sledgehammer blow, bricks breaking away and tumbling into a hollow space behind, long hollow echo.', true);
  S('effekt-kaestchen-auf', 'effekt', 2, 'Das Kästchen springt auf', 'A small old wooden box with a hidden mechanism clicking and springing open, a soft wooden creak.');

  // --- Kämpfe: effekt-kampf-<manifestation> (die Engine spielt ihn beim Erscheinen) ---
  S('effekt-kampf-die_hand', 'effekt', 3, 'Glas knistert, etwas greift heraus', 'Glass creaking and crackling like ice under stress, then a cold wet slither, close and intimate.');
  S('effekt-kampf-sie_greift', 'effekt', 4, 'Sie lehnt sich aus dem Spiegel', 'Glass bending with a deep groan, a woman exhaling slowly very close, a faint whisper of a name, unintelligible.', true);
  S('effekt-kampf-hand_im_wasser', 'effekt', 3, 'Etwas greift aus dem Wasser', 'A sudden splash in a bathtub and water churning, a hand gripping, gurgling.');
  S('effekt-kampf-zerschlagende', 'effekt', 3, 'Ein Spiegel springt', 'A mirror cracking violently by itself, then rough hands scraping on glass shards, a hoarse male breath.', true);
  S('effekt-kampf-naeherin', 'effekt', 4, 'Eine Nähmaschine rattert', 'An old treadle sewing machine rattling fast, fabric sliding, threads tightening with a thin singing sound.');
  S('effekt-kampf-die_wandernde', 'effekt', 4, 'Nackte Füße auf Holz', 'Slow bare footsteps on old floorboards coming closer, then stopping, a soft woman breath very near.');
  S('effekt-kampf-die_tuer', 'effekt', 4, 'Etwas regt sich unter dem Stein', 'A deep wet rumble from below a stone floor, like something huge shifting under water, a scraping of many joints.', true);
  S('effekt-kampf-alle_spiegel', 'effekt', 5, 'Tausend Stimmen flüstern', 'Hundreds of identical female voices whispering at once from all sides, layered, unintelligible, swelling, glass vibrating.', true);
  S('effekt-kampf-die_andere', 'effekt', 5, 'Sie schreit mit Elisabeths Stimme', 'A woman scream that starts beautiful and human and turns into a distorted inhuman shriek with glass resonance, then a buzzing like flies.', true);

  // --- Spuk-Ereignisse (effekt-spuk-<id>) ---------------------------------
  function SP(id, sek, untertitel, prompt, laut) { S('effekt-spuk-' + id, 'effekt', sek, untertitel, prompt, laut); }
  // Erdgeschoss, Einfahrt
  SP('lavendel', 4, 'Stoff raschelt, jemand atmet ein', 'Very quiet rustle of a silk dress and a barely audible inhale, as if someone stands right next to you.');
  SP('spiegel_bewegung', 3, 'Glas singt leise', 'A high, barely audible glass tone, like a wet finger circling the rim of a glass.');
  SP('kerze_wandert', 2.5, 'Metall scharrt über Holz', 'Soft scraping of a brass candlestick being moved over wood behind you.');
  SP('handylicht_aus', 2, 'Elektrisches Knistern', 'Brief electrical crackle and fizzle, then dead silence.');
  SP('rasiermesser_erscheint', 2, 'Ein metallisches Klicken', 'A quiet metallic click like a straight razor blade being flipped open.');
  SP('einfahrt_kraehen', 4, 'Viele Flügel, kein Laut', 'Many wings flapping at once but strangely muffled, without a single crow call.');
  SP('einfahrt_fenster', 3, 'Es klopft an ein Fenster, weit oben', 'Very faint knocking from inside on a window pane, high above and far away.');
  SP('halle_fussspuren', 4, 'Nackte Füße auf der Treppe', 'Soft patter of small bare feet going up wooden stairs.');
  SP('halle_staubsauger', 6, 'Ein Staubsauger – dann ein Poltern', 'An old vacuum cleaner humming back and forth on wood upstairs, then a jolt and a heavy thumping tumble down wooden stairs, abrupt silence.', true);
  SP('arbeitszimmer_bleistift', 3, 'Ein Bleistift rollt', 'A pencil rolling slowly across a wooden desk and stopping.');
  SP('arbeitszimmer_portraet', 2.5, 'Jemand holt Luft', 'A barely audible sharp inhale, like someone about to call out, then nothing.');
  SP('garderobe_buegel', 3, 'Ein Haken klirrt', 'An empty brass coat hook clinking softly and swinging.');
  SP('garderobe_mantel', 3, 'Stoff raschelt, ein Absatz', 'Heavy fabric rustling and a single quiet heel tap on wood.');
  SP('flur_tapete', 5, 'Die Wände atmen', 'Slow, deep, very quiet breathing coming from inside the walls.');
  SP('hinterdiele_kraehe', 4, 'Tack. Tack. Tack.', 'A beak pecking rhythmically against a glass pane: tack, tack, tack.');
  SP('hinterdiele_kratzen', 4, 'Nägel kratzen über Holz', 'Fingernails slowly scratching over wood, then a hoarse croak.');
  SP('kammer_schaukelstuhl', 3, 'Ein Schaukelstuhl knarrt', 'An old rocking chair creaking twice on floorboards.');
  SP('kammer_gestalt', 4, 'Knarren, ein Krähenruf', 'Rocking chair creaking and a single quiet crow call very close.');
  SP('anrichte_spuelung', 4, 'Eine Spülung rauscht', 'An old toilet flush rushing, gurgling and falling silent.');
  SP('anrichte_spiegel', 3, 'Stoff spannt sich, jemand atmet aus', 'Fabric being stretched taut and a muffled exhale behind it.');
  SP('kueche_kaffee', 2, 'Eine Tasse wird abgestellt', 'A porcelain cup being gently set down on a wooden table.');
  SP('kueche_klingel', 3, 'Die Dienstbotenklingel schrillt', 'A shrill old servant bell ringing, a small wooden flap dropping with a clack.', true);
  SP('speisekammer_glas', 3, 'Gläser klirren', 'Two preserving jars clinking softly and rhythmically, like chattering teeth.');
  SP('speisekammer_birne', 2.5, 'Etwas schwappt im Glas', 'A muffled slosh inside a glass jar.');
  SP('speisezimmer_laken', 2, 'Ein Laken wird weggezogen', 'A dust sheet pulled off a chair with a sharp swish.');
  SP('speisezimmer_vierzehn', 5, 'Ein Stuhl, Gläser, Gemurmel', 'A heavy chair pulled back over parquet, then faint glasses clinking and a low murmur of a dinner party far away.');
  SP('salon_taste', 5, 'Ein einzelner Klavierton', 'A single low A note on an out-of-tune grand piano, ringing out for a long time.');
  SP('salon_lied', 8, 'Ein Wiegenlied am Flügel – oben singt eine Frau', 'An out-of-tune grand piano slowly playing a simple lullaby, a woman humming the melody from far upstairs slightly ahead of the piano.');
  SP('wintergarten_kraehen', 4, 'Krallen auf dem Glasdach', 'Claws scratching across a glass roof, several birds landing heavily.');
  SP('wintergarten_scheiben', 4, 'Korbgeflecht knarzt, ein Rad rollt', 'Creaking wicker and the soft rolling of an old wheelchair wheel.');
  // Obergeschoss
  SP('galerie_kreppband', 2, 'Klebeband löst sich', 'A strip of tape peeling off wood with a soft rip and fluttering down.');
  SP('galerie_staubsauger', 5, 'Ein Staubsauger kommt die Treppe herauf', 'A vacuum cleaner switching on downstairs and coming up wooden stairs step by step, then stopping abruptly.');
  SP('krankenzimmer_gurte', 2.5, 'Leder knarrt', 'Old leather straps creaking as if pulled tight, then going slack.');
  SP('krankenzimmer_rollstuhl', 4, 'Gummiräder auf Parkett', 'Rubber wheels of an old wheelchair rolling slowly across parquet close by, then stopping.');
  SP('bibliothek_buch', 2, 'Ein Buch fällt', 'A heavy book sliding off a shelf and falling open on the floor.');
  SP('bibliothek_glastuer', 2, 'Eine Seite wird umgeblättert', 'A single book page turning very softly behind glass.');
  SP('kinderzimmer_klicken', 1.5, 'Ein winziges Klicken', 'A tiny click of a dollhouse door opening.');
  SP('kinderzimmer_fluestern', 4, 'Ein Mädchen flüstert', 'A teenage girl whispering very close to the ear, unintelligible, then a soft giggle.');
  SP('bad_tropfen', 2.5, 'Ein Tropfen fällt', 'A single water drop falling into a full bathtub, echoing in a tiled bathroom.');
  SP('bad_atmen', 4, 'Blasen steigen auf', 'Slow regular bubbles rising in still water, like breathing, then a gasp breaking the surface.');
  SP('kammer_naehmaschine', 1.5, 'Ein einzelner Stich', 'An old treadle sewing machine making a single stitch, the needle thudding down.');
  SP('kammer_rattern', 5, 'Die Nähmaschine rattert', 'An old treadle sewing machine rattling steadily, fabric sliding through endlessly.');
  SP('gaestezimmer_tassen', 2, 'Zwei Tassen klirren', 'Two porcelain cups clinking gently together like a toast.');
  SP('gaestezimmer_atmen', 5, 'Jemand atmet unter der Decke', 'Slow calm deep breathing of a sleeper under a heavy duvet.');
  // Dachboden
  SP('speicher_taube', 3, 'Flügelschlag, ein Ticken', 'A pigeon flapping up and hitting a small window, then the faint ticking of a pocket watch.');
  SP('speicher_kisten', 2.5, 'Holz scharrt über Holz', 'A heavy wooden crate scraping across attic floorboards behind you.');
  SP('kammer_kinderlied', 4, 'Ein Mädchen lacht, Schritte laufen davon', 'A little girl laughing brightly behind a door, then small footsteps running down wooden stairs.');
  SP('kammer_weinen', 5, 'Ein Kind weint', 'A small child crying quietly under a blanket, muffled sobs, then a whisper.');
  SP('waescheboden_wind', 3, 'Wind fährt in die Laken', 'A gust of wind through roof tiles, many linen sheets on lines billowing and flapping at once.');
  SP('waescheboden_gestalten', 4, 'Stoff raschelt zwischen den Laken', 'Linen sheets rustling slowly as if figures move between them, a soft breath.');
  SP('turm_kraehen', 3, 'Eine Krähe, etwas klimpert', 'A crow landing on a window frame and a small metal button dropping and clinking on wooden boards.');
  SP('turm_laterne', 3, 'Der Wind pfeift um den Turm', 'Wind whistling around a small tower room at night, a faint creak of an old lantern swinging outside.');
  SP('kaestchen_ringe', 3, 'Klick. Klick. Klick.', 'Three tiny precise clicks of brass number rings being turned, very close.');
  // Keller
  SP('kellerflur_tuer', 4, 'Oben fällt eine Tür ins Schloss', 'A heavy plank door upstairs slowly creaking shut and latching.');
  SP('kellerflur_schritte', 6, 'Barfuß auf der Kellertreppe', 'Bare feet on stone cellar steps, slow, one after another, then silence right behind you.');
  SP('vorrat_glas', 2, 'Gläser klirren', 'Two preserving jars clinking once softly together in a cellar.');
  SP('vorrat_etiketten', 3, 'Eine Feder kratzt', 'A quill pen scratching very fast over paper, then silence.');
  SP('wein_flasche', 4, 'Eine Flasche rollt', 'A glass bottle rolling slowly over wood and brick and coming to rest.');
  SP('wein_arzt', 3, 'Ein höfliches Räuspern', 'A polite male clearing his throat under a brick vault, with echo.');
  SP('waschkueche_mangel', 3, 'Die Mangel quietscht', 'An old laundry mangle squeaking through half a turn.');
  SP('waschkueche_hand', 3, 'Eine Hand wischt über Glas', 'A palm squeaking across glass from the other side, then a dull fist thump against a mirror.');
  SP('heizung_brenner', 4, 'Der Brenner faucht auf', 'An old oil burner igniting with a whoosh, rumbling briefly, then dying.');
  SP('heizung_kratzen', 4, 'Hinter der Wand kratzt etwas', 'A spatula scraping slowly over plaster, muffled, from behind a wall.');
  SP('ritual_schaedel', 2, 'Ein Knochen dreht sich', 'A tiny bird skull turning with a dry crunch on stone.');
  SP('ritual_himmel', 6, 'Ein Summen schwillt an', 'A very deep, barely audible hum slowly swelling, vast and far away.');
  SP('ritual_stille', 5, 'Fernes, wütendes Weinen', 'Distant furious weeping of a woman, muffled through thick walls and floors.');

})();
