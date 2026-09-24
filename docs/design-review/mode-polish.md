# Kaartcentrering en modusbediening — 15 september 2026

Flitskaarten hebben geen schaduw en geen “van x gekend”-regel meer. Boven de kaart staan goed/fout-tellers voor gegeven antwoorden. Deze worden opgeslagen en teruggedraaid bij Ongedaan maken; bestaande opgeslagen voortgang krijgt compatibele beginwaarden.

Alleen het hoofdvlak wordt gecentreerd: de flitskaart bij Flitskaarten en het antwoordvlak bij Stampen. De knop Sluiten staat linksboven. Overhoren toont één vraag per pagina, met Vorige en Volgende; ook de resultaatcontrole is gepagineerd. De positie wordt opnieuw bepaald na wijzigingen in kaartinhoud, afmetingen en venstergrootte. De modus zelf is vastgezet zonder paginascroll. De inhoud past zich aan de zichtbare schermhoogte aan, met 24 px ruimte onder Sluiten; uitleg en instellingen behouden hun eigen scrollruimte. De sterknop is 44 × 44 px.

Stampen gaat na een juist open of meerkeuzeantwoord na 1.000 ms verder. Dit geldt ook na correct overtypen en Toch goedkeuren. Handmatig doorgaan, een nieuwe vraag of het verlaten van de modus annuleert de timer. Een open uitleg-, mijlpaal- of instellingenvenster stelt doorgaan uit. Foute antwoorden gaan niet automatisch verder.

De volledige voorleesfunctie is op verzoek verwijderd, inclusief client, servercode en configuratie. De bestaande geluidseffecten blijven beschikbaar.

De mobiele setnaam verschijnt na scrollen in een eigen rij onder logo en menu. Alle leermodi hebben een Sluiten-knop met kruisje in dezelfde stijl als Sla over. Actieve sterren hebben een accentkleurige achtergrond met een witte, gevulde ster.

De browsercontroles staan in mode-polish.json en study-redesign.json. Cacheversie 20260915-7. Wijzigingen zijn lokaal.

Alle tekstuele terugknoppen gebruiken de gedeelde neutrale knopstijl. Invoervelden op aanraakschermen hebben minimaal 16 px tekst om automatische iOS-focuszoom tegen te gaan; handmatig zoomen blijft mogelijk. De inactieve kaarttekst en ster worden direct verborgen. Dit is in Chromium gecontroleerd, niet op een fysiek iOS-apparaat.

Het setmenu blijft bij de driepuntjes op de pagina, op mobiel en desktop; bij scrollen verdwijnt het mee uit beeld. Bij moduswissels wordt het direct opgeruimd, inclusief eventuele sluitanimatie. Knoppen zijn per sectie gegroepeerd, met kleine binnenhoeken en ronde buitenhoeken. Alles met ster en Alle sterren wissen werken op de hele set; wissen schakelt een eventueel leeg sterfilter uit. De achtergrond is zwart in donkere modus.

De groepshoeken staan in design-system.css: gebruik een .button-group met directe .btn-kinderen. Tokens: --control-group-radius (22px), --control-group-inner-radius (6px) en --control-group-gap (4px). Verborgen knoppen tellen niet mee voor de buitenhoeken. De 16 controles in fixed-menu.json slagen.

Vervolg: bij het verschijnen van de setnaam in de header sluit het setmenu met de gebruikelijke sluitanimatie. Header (200) en sidebar (190) staan boven het menu (150). Modusstart wist de scrollpositie vóór het vastzetten van de pagina en nogmaals op het volgende frame; terug naar de set reset ook direct. Index reset zowel bij laden als bij pageshow, inclusief browser-terugnavigatie.

Vervolg iPhone: modusinhoud en Sluiten houden rekening met safe-area-inset-top en safe-area-inset-bottom. De hoogteberekening gebruikt dezelfde CSS-padding. Het thema wordt inline vóór externe scripts bepaald en direct bij het openen van body toegepast; donkere oppervlaktekleuren staan ook in CSS. Getest met gesimuleerde veilige ruimte van 59 px boven en 34 px onder, en met geblokkeerde hoofdcode voor de vroege themaweergave. Geen fysieke iPhone-test uitgevoerd.
