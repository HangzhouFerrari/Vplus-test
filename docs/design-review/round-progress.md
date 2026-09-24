# Gedeelde rondevoortgang

Stampen en Flitskaarten met Leren gebruiken dezelfde segmentbalk, met behoud van de beschikbare breedte. Gewone flitskaarten en Overhoren gebruiken een doorlopende balk. Elk segment bevat zeven vragen. Leren toont tweemaal zoveel rondes per setdoorgang en breidt de reeks uit wanneer het oefenen verdergaat.

Maximaal vijf hele segmenten zijn zichtbaar. Bij langere reeksen is het zesde segment half zichtbaar met een vervagende rand. Vanaf de zesde ronde schuift de balk met een animatie; het vorige segment blijft half zichtbaar. Aan het einde sluit de laatste ronde aan op de rechterrand. Minder beweging gebruikt de bestaande toegankelijkheidsinstelling.

Overhoren telt alleen ingevulde antwoorden, ook wanneer de gebruiker tussen vragen navigeert. Stampen houdt herhaalvragen open totdat ze zijn afgerond. De checkpointbalk gebruikt hetzelfde component.

Validatie: tests/round-progress.py (13 browsercontroles, waaronder geometrie op 390 en 1363 pixels) en tests/learning.py (33 controles op rondes en opgeslagen voortgang).
