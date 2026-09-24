# Ontwerpcontrole — bijgewerkt 14 september 2026

De oranje identiteit, pagina-indeling, Help en ongedaan maken zijn behouden. Gewone actieknoppen hebben een egale vulling. Succes en fout blijven groen en rood. Verplicht doorscrollen door de uitleg blijft behouden, op uitdrukkelijk verzoek. De zwarte focusring is vervangen door een dunne accentrand bij invoervelden. Het uitlegscrollvak heeft geen gele omlijning. De normale primaire knoppen gebruiken witte tekst; via Menu → Toegankelijkheid kan Hoog contrast worden ingeschakeld.

Het [Apple Design Skill](https://github.com/dickwu/apple-design-skill) is gebruikt voor consistentie, leesbaarheid en interactie. Relevante referenties: `accessibility.md` (Vision, Mobility, Speech), `buttons.md` (Style), `motion.md` (Best practices) en `onboarding.md` (Best practices). Native Apple-patronen zijn niet als webvereiste toegepast. De effen vulling en verplichte uitleg zijn productkeuzes.

## Status per bevinding

De ongenummerde bevindingen uit het aangeleverde document zijn hieronder in oorspronkelijke volgorde genummerd.

| Nr. | Status | Wijziging en controle |
| --- | --- | --- |
| 1 | Aangepast | Rode en groene leerknoppen gebruiken effen gedeelde varianten. Computed styles: `background-image: none`. |
| 2 | Aangepast | Beide leerknoppen hebben `box-shadow: none`. Toetsenbordfocus staat hier los van. |
| 3 | Aangepast | Primaire acties, introductie en editor gebruiken dezelfde effen accentkleur en leesbare tekstkleur. |
| 4 | Aangepast | Schaduwen op leerinstellingen, schakelaars én schuifknoppen verwijderd. |
| 5 | Aangepast | Hoofd- en setzijbalk delen achtergrond- en randtokens, inclusief donker thema. |
| 6 | Aangepast | Stermodus gebruikt de effen secundaire variant en een expliciete accentselectie met `aria-pressed`. |
| 7 | Aangepast | Standaard witte tekst op de gekozen accentkleur, op verzoek. Hoog contrast maakt het knopvlak donkerder tot witte tekst minstens 7:1 haalt; alle vijf accenten zijn in licht/donker gecontroleerd. De standaard oranje/witte combinatie haalt geen 4,5:1. Disabled heeft een neutrale achtergrond, leesbare tekst en gestippelde rand. |
| 8 | Aangepast | Gelijke antwoordknoppen, 44px hoog. Desktop 180px breed; kleinere schermen verdelen de beschikbare ruimte gelijk. Getest op 360, 390, 768, 1024 en 1363px. |
| 9 | Aangepast | Op verzoek twee sterren binnen de roterende kaart: één rechtsboven op iedere zijde. Alleen de zichtbare zijde is bedienbaar. Echte Chrome-flip bevestigt dezelfde eindpositie; sterklik draait de kaart niet om. |
| 10 | Aangepast | Gedeelde duur/easing voor bediening, navigatie, panelen en flip. Hover animeert in 160ms naar scale(0.98) en brightness(0.95), en weer terug. Expliciete transition-eigenschappen op deze componenten. Reduced-motion-browsercontrole slaagt. Niet iedere oudere animatie in de hele app is herschreven. |
| 11 | Aangepast, verplicht lezen behouden | Uitleg heeft een focusbare scrollregio, zichtbare scrollbar en tekst waarom Verdergaan geblokkeerd is. Onderkant ontgrendelt de knop. Pas bij afronden wordt de uitleg als voltooid opgeslagen. Browsercontrole test beide toestanden. Scrollen kan uiteraard niet bewijzen dat iemand de tekst werkelijk heeft gelezen. |
| 12 | Aangepast | Automatisch meldingenverzoek uit de opstartflow gehaald; toestemming blijft via instellingen beschikbaar. De aparte antwoordkeuzedialoog is verwijderd; de bestaande instelling ‘Enkele antwoorden’ blijft beschikbaar. Verplichte basis- en moduitleg behouden. |
| 13 | Aangepast | Controleer verandert op dezelfde plek in Volgende. Hint en overslaan verdwijnen in de feedbackfase. Overtypen blokkeert doorgaan totdat het antwoord is overgenomen. Duplicaatknop verborgen. Getest: fout, overtypen, overslaan. |
| 14 | Aangepast | Correctieactie is een afgeronde secundaire knop van 44px hoog met donkere tekst. SVG-statussymbolen voor de aangepaste feedback en herstartacties. Buiten deze flow staan nog enkele oudere tekstsymbolen. |
| 15 | Aangepast | Hoofdsecties zijn echte buttons, met `aria-current` en zichtbare toetsenbordfocus. |
| 16 | Aangepast | Namen voor leerinstellingen, selects, schakelaars, zoeken en logolink. Settingsknoppen geven expanded/controls door. Namen geautomatiseerd gecontroleerd voor Flitskaarten. |
| 17 | Aangepast; schermlezertest open | Op elke kaartzijde een native, benoemde flipknop met Enter/spatie. Alleen de actuele kaartzijde is toegankelijk; animatiekopieën zijn inert en verborgen voor hulptechnologie. DOM-controle slaagt. Echte VoiceOver/NVDA-test is niet uitgevoerd. |
| 18 | Aangepast; volledige handmatige toetsenbordtest open | Benoemde dialoog, initiële focus, Tab-begrenzing, Escape en focusherstel. Editors heten Begrip/Definitie met nummer. Opmaak- en kleurknoppen zijn benoemd en toetsenbordactiveerbaar. Native Tab-volgorde vervangt het overslaan van de toolbar. Sluiten verwijdert editorinhoud. |
| 19 | Aangepast | Tooltips Dashboard/Bestanden, ‘reeks’ en Nederlandse zichtbare toetsdatum. Opslag/native datumvelden houden hun ISO-formaat. Het bestaande datamodel kan bij geïmporteerde cloudsets nog een wijzigingsdatum als fallback bevatten; de historische betekenis daarvan is niet opnieuw vastgesteld. |
| 20 | Aangepast | Bibliotheek toont de zoekterm bij nul resultaten, met Zoekopdracht wissen of Filters wissen. Geen concurrerende zoekpopover in de bibliotheek. |

## Laadtijd index

Voorheen bleef de volledige pagina verborgen totdat alle openbare sets achtereenvolgens waren geladen en vervolgens accountsynchronisatie was afgerond. Het externe Supabase-script blokkeerde bovendien de HTML-parser.

Nu:

- De lokale inhoud en navigatie verschijnen onafhankelijk van setverzoeken en accountsynchronisatie.
- Openbare sets laden met maximaal zes gelijktijdige verzoeken; elk verzoek heeft een timeout van acht seconden.
- Accountsynchronisatie loopt afzonderlijk en werkt de zichtbare inhoud later bij.
- Accountscripts zijn deferred; de externe lettertypestylesheet blokkeert de eerste weergave niet meer.
- Nieuwe set en menu-URL's hoeven niet op de bibliotheek te wachten.
- Zonder lokale sets staat een duidelijke laadmelding in de inhoud, met de mogelijkheid alvast te navigeren.
- De serviceworkerbuild is verhoogd en bevat de gedeelde UI-helper.

De test `slow-index.html` laat set- en accountverzoeken onbeperkt hangen. Index wordt toch zichtbaar en het setformulier kan openen. De gemeten lokale tijd staat in [slow-index.json](slow-index.json). Dit is een regressietest in lokaal Chrome met virtuele tijd, geen live snelheidsmeting en geen garantie over de downloadsnelheid van de server.

## Bewijs en resterende controles

Uitvoering: lokale HTTP-server, Chrome headless, set `040402033` (Begrippen H4.2). De tests gebruiken afzonderlijke browserprofielen.

- [Interactiecontroles](design-review.json): effen knoppen, afmetingen, sterpositie, kaartzijden, snelle antwoorden, undo, labels, scrollvergrendeling, editor en zoeken.
- [Responsive/thema/contrast](responsive.json): vijf breedtes voor antwoordknoppen, vijf accenten in twee thema's, overtypen, overslaan en bereikbare Opslaan-knop op vier breedtes.
- [Reduced motion](motion.json).
- [Flitskaarten mobiel](flashcards-mobile.png) en [Stampen met foutfeedback](stampen-desktop.png), visueel bekeken.

Er zijn geen nieuwe voor-screenshots gemaakt; de voor-situatie is onderbouwd door het aangeleverde rapport en de oorspronkelijke CSS/DOM-code.

Aanvullende onderzoeksaanwijzingen:

1. Eigenaren van oude paarse panel-/toastschaduwen gevonden. Leerinstellingen, milestone, checkpoint, modal en toast gebruiken nu neutrale schaduwen; niet ieder popupscenario is visueel opnieuw geopend.
2. Aanbevelingen werden bij iedere dashboardrender opnieuw geloot. De volgorde is nu stabiel op set-ID.
3. Editorresten na sluiten zijn verwijderd en geautomatiseerd gecontroleerd.
4. Volledige voltooiingsschermen, checkpoints, alle hints, lange teksten, afbeeldingen en alle laad-/foutscenario's zijn nog niet integraal getest.
5. Breedtes zijn gecontroleerd; echte browserzoom van 200%, landscape en Safari blijven open.
6. Primair knopcontrast in de hoogcontraststand en antwoordknopcontrast zijn voor alle thema's getest; een volledige audit van iedere geselecteerde, disabled en popupcombinatie in de app blijft open.
7. Snelle dubbele antwoorden en undo zijn gecontroleerd. Er is geen FPS-profiel gemaakt.

Belangrijkste bestanden: `style.css`, `ui-system.js`, `app.js`, `set-app.js`, `index.html`, `set.html`, `sw.js` en `sw-register.js`.

Herhalen: start vanuit de projectmap `python3 -m http.server 8765`, en voer daarna `python3 tests/qa.py` uit. Hiervoor moet Google Chrome beschikbaar zijn. Geen wijzigingen zijn gepubliceerd.

## Aanvullingen van 14 september

- `style.css` bevat één sectie VELIOS DESIGN SYSTEM met tokens, componenten, semantische varianten, maten en interactiestaten. 201 concurrerende declaraties zijn verwijderd; lokale regels bepalen vooral plaatsing en afmetingen.
- Alle interactieve elementen delen vloeiende hoverovergangen voor schaal en helderheid (160ms). Uitgeschakelde bediening blijft stil. Minder beweging en de systeemvoorkeur beperken animatie.
- Menu → Toegankelijkheid bevat Hoog contrast, Minder beweging en Links onderstrepen. Voorkeuren blijven op het apparaat bewaard en gelden ook op de setpagina.
- Index bewaart de gewenste hashroute zonder de browser naar het bijbehorende element te laten springen. Scrollherstel staat op handmatig; bij openen, terugkeren vanuit de paginacache en viewwissels wordt de scrollpositie hersteld naar boven. Automatische focus op de uitleg gebruikt preventScroll.
- De ster draait mee binnen beide kaartzijden; de verborgen zijde is inert en de zichtbare ster blijft rechtsboven.

Extra bewijs: [voorkeuren en scrollpositie](preferences.json), [echte hover en kaartflip](hover.json), [toegankelijkheidsmenu](accessibility-menu.png), [achterkant van de flitskaart](flashcard-back.png).

`python3 tests/hover.py` voert aanvullend echte muis- en animatiecontroles uit via Chrome DevTools. De overige controles gebruiken virtuele tijd; daar wordt voor de vergelijking van de twee ster-eindposities tijdelijk de flipovergang uitgeschakeld. De echte animatie wordt afzonderlijk in de DevTools-test gecontroleerd.

Laatste keuze eigenaar: hover-schaal 0,98 behouden, helderheid 0,95 en overgang 160ms. Deze waarden staan centraal als `--hover-scale`, `--hover-brightness` en `--motion-control`.

Vervolg: [websitebrede stijlen, hover en overlay-header](sitewide.md).

15 september: [Stampen, taaluitspraak en navigatie](study-redesign.md).

Vervolg 15 september: [kaartcentrering, tellers en modusbediening](mode-polish.md).
