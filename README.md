# Velios+ - dé open-source website voor het leren van begrippen

```
Maak je eigen begrippensets, deel ze met anderen, leer bestaande sets en combineer meerdere sets tot één - kortom alles is mogelijk. Je hebt zelfs de optie om het uiterlijk aan te passen. Dit klink allemaal heel ingewikkeld om te realiseren tot een website, maar dat valt wel mee. De JavaScript zet .vset (JSON) bestanden om in digitale flitskaarten. Deze kan je in verschillende modi leren, wat het leren gepersonaliseerd maakt.
```

## URL-structuur

```
https://plus.velios.com/set?set=naam-set
```

Velios+ laadt dan `sets/naam-set.vset`.

## .vset bestanden

`.vset` bestanden zijn versleuteld — niet leesbaar als plain JSON.
Aanmaken via de nieuwe set knop op de startpagina, dan set downloaden vanuit de ontwikkelaars-console en tot slot in de `sets/` map zetten.

## Maak sets op jouw manier

1. Open `index.html` → **Nieuwe set**
2. Vul de begrippen en definities in.
3. Formateer de begrippen en definities tot wens en voeg evt. een afbeelding toe.
4. Klik op aanmaken.

## Fallback

Als het `.vset` bestand niet op de server staat, valt de app terug
op lokaal opgeslagen sets (localStorage van `index.html`).

## .vset naam structuur

1. Vak:
```
La: 01	Du: 02	Gr: 03	Gs: 04	Na: 04	Sk: 05	Ak: 06	Ne: 07	Bi: 08
```

2. Hoofdstuk/paragraaf
```
H1: ..01..	H2: ..02..	etc
```
```
§1: ..010..	P2: ..020..	P12: ..012..	P2 t/m P6: ..2t6..	etc
```

3. Periode en klas
```
Bijv. Periode 1 en klas 4: ..14		Periode 3 klas 5: ..35
```

Voorbeeld: 	Natuurkunde H5 §3 t/m 5 periode 3 klas 3: 04053t533.vset
		Duits boek 3 schritt 17 periode 2 klas 2: 020301722.vset
