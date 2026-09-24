# Voortgang en leerrondes — 19 september 2026

Een ster wijzigen zette de actieve FC/ST-sessie uit, waardoor volgende antwoorden niet meer werden opgeslagen. Daarnaast deelden de gewone sessie en het sterfilter één opslagsleutel. Beide zijn hersteld.

Elke modus bewaart nu afzonderlijke voortgang voor alle begrippen en voor elke exacte sterselectie. De lopende sessie houdt haar eigen selectie; sterwijzigingen veranderen die bij de volgende start. Wisselen van filter wist andere voortgang niet. Hervatten controleert de setinhoud om te voorkomen dat gewijzigde begrippen onder oude indices worden teruggezet. Compatibele oude voortgang wordt gelezen; niet verifieerbare oude sterselecties worden niet aan een andere selectie gekoppeld.

Overslaan, verlaten van de modus en het verbergen/sluiten van de pagina slaan de stand op. Het laatste flitskaartantwoord wordt al vóór de uit-animatie als afgerond opgeslagen.

Leren gaat onbeperkt door: meerkeuze 1, meerkeuze 2, schriftelijk 1, meerkeuze 3, schriftelijk 2, meerkeuze 4, schriftelijk 3, enzovoort. Elke ronde bevat zeven verschillende begrippen, of de hele selectie als die kleiner is. Meerkeuze 1 en schriftelijk 1 gebruiken hetzelfde blok, net als meerkeuze 2 en schriftelijk 2. Blokken lopen door de geschudde of vaste setvolgorde en gaan na het laatste begrip verder vanaf het begin. Een fout antwoord wordt binnen de ronde herhaald; deze herhalingen komen bovenop de zeven begrippen. Een al opgeslagen ronde uit de vorige versie wordt eerst afgemaakt. Een schriftelijke ronde wordt pas gestart wanneer de bijbehorende meerkeuzevragen goed zijn beantwoord. De ronde, herhaalwachtrij en goed beantwoorde meerkeuzevragen worden mee opgeslagen. De voortgangsbalk hoort bij de huidige ronde.

Alle herstartknoppen heten Opnieuw.

Validatie: tests/learning.py controleert onder meer sterren wijzigen tijdens oefenen, onafhankelijk hervatten per selectie, daadwerkelijk herladen van de pagina, herhaalvragen, de rondevolgorde en gewijzigde setinhoud. Cacheversie 20260919-1. Lokaal, niet gepubliceerd.
