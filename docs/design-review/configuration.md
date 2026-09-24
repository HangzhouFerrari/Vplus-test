# Configuratiemenu’s — 16 september 2026

De configuratie van Flitskaarten, Stampen en Overhoren opent in hetzelfde menuvenster als het hoofdmenu. De bestaande acc-ov-stijlen zijn gedeeld tussen index en set: desktop heeft een gecentreerd paneel met categorieën links; mobiel heeft een menu vanaf onderen met een categorieoverzicht en subpagina’s met terugknop. De hoofdmodus is niet interactief zolang het menu openstaat.

Categorieën zijn per modus gegroepeerd: Kaarten, Vragen of Toets, Nakijken, Hulp en Voorkeuren. Alle bestaande instellingen en handlers zijn behouden. De eerder besproken uitbreidingsideeën zijn niet toegevoegd. Opnieuw beginnen staat onderaan de categorienavigatie.

Sluiten werkt via de bestaande ronde sluitknop, achtergrond en Escape. De mobiele greep ondersteunt een neerwaartse veeg. Moduswissels verwijderen het venster direct; normaal sluiten gebruikt de hoofdmenu-animatie. Bij sluiten keren de instellingsvelden terug naar hun bron, zodat waarden en handlers behouden blijven.

Controle: lichte en donkere modus op 390px en 1363px, alle instellingen aanwezig, categorie- en terugnavigatie, sluiten, wijzigen van het invoertype en opruimen bij verlaten van een modus. Screenshots zijn visueel bekeken. Resultaten staan in configuration.json. Cacheversie 20260916-3.

De browserkeuzelijsten zijn vervangen door de bestaande VeliosSelect-component. De oorspronkelijke selectvelden blijven verborgen als gegevensbron, met behoud van hun change-handlers. Keuzevensters sluiten bij categoriewissels en sluiten van het instellingenvenster. Escape sluit eerst alleen de keuzelijst. Het aantal-vragenveld behoudt numerieke invoer en gebruikt de ronde Velios-veldvorm.
