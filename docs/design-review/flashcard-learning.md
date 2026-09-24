# Leren met flitskaarten

De kaartinstellingen bieden Flitskaarten en Leren. Gewone flitskaarten en Overhoren hebben een doorlopende voortgangsbalk. Leren gebruikt één segment per zeven kaarten, zonder de verdubbeling van Stampen.

Na elk blok (ook het kortere laatste blok) verschijnt een rondeoverzicht met goed/fout en de foute kaarten. Deze kaarten worden vóór het volgende blok herhaald totdat ze gekend zijn. Na het laatste blok en de eventuele herhalingen verschijnen de resultaten.

Modus, ronde, herhaalwachtrij en het rondeoverzicht worden met de bestaande selectiegebonden voortgang opgeslagen. Opnieuw en schudden behouden de moduskeuze. Ongedaan maken herstelt ook de herhaalwachtrij.

Tests: tests/flashcard-learning.py controleert 13 scenario’s, waaronder hervatten, herhalen, ongedaan maken, een kort laatste blok en beide doorlopende balken.

Kaartwissels gebruiken nu dezelfde gedeelde animatie als gewone flitskaarten. Korte aanmoedigingen staan boven de antwoordbediening. Reeksmeldingen sluiten na twee seconden met een aftelvulling in de sluitknop; checkpointachtergronden zijn neutraal. De flitskaarttest bevat nu 17 controles.

Checkpoints gebruiken nu dezelfde overlay, statistiekvakken en tiensecondenknop als Stampen. De bestaande kaart en voortgangsbalk blijven staan. Nieuw opgebouwde segmentbalken starten direct op de juiste positie, zonder herhaalde schuifanimatie.

Elke foute kaart telt één keer als onopgelost. Bij een goed herhaalantwoord daalt Fout met één en stijgt Goed met één. Fouten tijdens een herhaalronde gaan naar een aparte wachtrij voor de volgende herhaalronde, met een checkpoint ertussen. Eerdere fouten blijven opgeslagen en kunnen via het checkpoint of eindresultaat gezamenlijk een ster krijgen.
