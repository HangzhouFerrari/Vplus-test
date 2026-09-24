# Vervolgcontrole — 14 september 2026

Hover beperkt tot knoppen, links en expliciet interactieve kaarten. Een onclick-handler alleen maakt een element geen hoverdoel meer. Achtergronden, dialoogpanelen en set-card-actions blijven op hun plaats; ook de kaart krimpt niet mee wanneer een actie wordt aangewezen. Knoppen animeren in 160 ms naar schaal 0,98 en brightness 0,95 en terug.

De live stylesheet van https://plus.velios.nl/style.css is als referentie gelezen: set-icon-btn had een grijs vlak (#e5e5ea; donker #2c2c2e). Deze variant is hersteld als btn-tonal. De vergelijking betrof componentstijlen, geen volledige visuele vergelijking van alle ingelogde schermen.

Gedeelde tokens, knopvarianten, focus, hover en toegankelijkheidsregels staan in design-system.css. Alle negen HTML-pagina’s laden deze stylesheet. Inloggen, accountpagina’s, welkom en de foutpagina gebruiken dezelfde knopklassen. De pagina voor niet-ondersteunde browsers laadt geen moderne toegankelijkheids-JavaScript. Authenticatie en accountmutaties zijn niet uitgevoerd.

De set-editor heeft consistente actieknoppen en pictogrammen, een verbeterde veldindeling en native donkere scrollbars/datumvelden. Screenshots zijn bekeken op 390 en 1363 pixels. Bestaande editorcontroles dekken ook 360, 768 en 1024 pixels.

Het verdwijnen van de sticky header kwam door overflow:hidden op body: dat maakte body tot een nieuwe scrollcontainer. De documentroot vergrendelt het scrollen; body gebruikt bij overlays overflow:clip. Browsercontroles bevestigen dat de header op y=0 blijft bij de set-editor en accountoverlay na scrollen.

Validatie: tests/qa.py, tests/hover.py en tests/sitewide.py slagen (71 controles). git diff --check slaagt. Resultaten staan in de bijbehorende JSON-bestanden. Cacheversie verhoogd naar 20260914-1 en de gedeelde stylesheet toegevoegd aan de offlinecache. Wijzigingen zijn lokaal, niet gepubliceerd.
