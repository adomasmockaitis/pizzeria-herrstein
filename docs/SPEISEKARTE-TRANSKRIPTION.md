# Speisekarte – Transkriptionsbericht

Stand der Vorlage: **01.01.2024** (Flyer „Lieferservice, gültig ab 01.01.2024“, Fotos `karte1.png` / `karte2.png` sowie 4×-Spaltenvergrößerungen `karte1-spalte1..4.png` und `karte2-spalte1..4.png`, ergänzt um die Figma-Referenz `docs/figma-export/speisekarte-1-1028.md`).

---

## 1. Anzahl Gerichte je Kategorie

| Kategorie (`id`) | Name | Abschnitte | Anzahl Gerichte |
| :--- | :--- | :--- | ---: |
| `vorspeisen` | Vorspeisen | 1 (Standard) | **11** |
| `salat` | Salat | 1 (Standard) | **11** |
| `kindermenue` | Kindermenü | 1 (Standard) | **8** |
| `pizza` | Pizza | 2 (`Pizza`: 47, `Jumbo-Pizza`: 5) | **52** |
| `nudeln` | Nudeln | 2 (`Nudeln`: 32, `Nudeln überbacken`: 9) | **41** |
| `fleischgerichte` | Fleischgerichte | 2 (`vom Schwein`: 13, `vom Rind`: 5) | **18** |
| **Gesamt** | | | **141** |

---

## 2. Vollständige Liste aller unsicheren / unleserlichen Stellen

Da die hochgestellten Allergen- und Zusatzstoff-Kürzel auf dem Originalfoto nur ca. 3–4 Pixel hoch sind, wurden gemäß Vorgabe (*„NICHTS raten … Wenn unlesbar: kennzeichnung: [] und "kennzeichnung" in "unsicher" aufnehmen“*) sämtliche nicht zweifelsfrei lesbaren Kürzel als `[]` mit `"unsicher": ["kennzeichnung"]` erfasst.

### 2.1 Preis-Unsicherheiten (handschriftliche Korrektur auf dem Flyer)

| Kategorie | Abschnitt | Gericht | Feld(er) | Was auf dem Flyer zu sehen ist |
| :--- | :--- | :--- | :--- | :--- |
| `pizza` | `Pizza` | **La Casa** | `preisKlein`, `preisGross` | Auf `karte2-spalte3.png` sind beide Preise handschriftlich mit Kugelschreiber überschrieben. Beim kleinen Preis ist `10,00 €` bzw. `11,00 €` mit schwarz überschrieben (sieht nach `10,00 €` oder `11,00 €` aus), beim großen Preis ist `11,00 €` bzw. `12,00 €` mit blauem Stift zu `12,00 €` (oder `11,00 €`) korrigiert. Daher `preisKlein: null`, `preisGross: null`. |

### 2.2 Legende der Zusatzstoffe und Allergene (`karte1-spalte3.png` unten)

- **Zusatzstoffe**:
  - `1` bis `9` sowie `13` (`Alkohol`) sind lesbar.
  - `10`: `[unleserlich]` – stark verschwommen (vermutlich Standardtext *„Aspartam/enthält eine Phenylalaninquelle“*, ca. 1,5 Zeilen lang).
  - `11`: `[unleserlich]` – verschwommen (optisch ähnlich *„koffeinhaltig“*).
  - `12`: `[unleserlich]` – verschwommen (optisch ähnlich *„chininhaltig“*).
- **Allergene**:
  - `A` (*Glutenhaltiges Getreide: Weizen¹, Roggen², Gerste³, Hafer⁴, Dinkel⁵, Kamut⁶*), `B` (*Fisch*), `C` (*Krebstiere*), `D` (*Schwefeldioxid und Sulfite*), `E` (*Sellerie*), `F` (*Milch und Laktose*), `G` (*Sesamsamen*), `K` (*Senf*), `L` (*Soja/Sojabohne*), `M` (*Weichtiere*) sind erkennbar.
  - `H`: *Schalenfrüchte (Mandel¹, Haselnuss², Walnuss³, Cashew⁴, Pekanuss⁵, Paranuss⁶, Pistazie⁷, Macadamianuss⁸, Queenslandnuss⁹)* – die einzelnen Nussnamen und hochgestellten Ziffern sind teilweise stark verpixelt (`[teilweise unleserlich]`).
  - `I`: `[unleserlich]` – steht ganz rechts am Zeilenende nach `Queenslandnuss⁹)` (vermutlich *„Ei“* / *„Eier“*, aber im Foto verschwommen).
  - `J`: `[unleserlich]` – Beginn der letzten Zeile (vermutlich *„Lupine“* / *„Lupinen“*).
  - `N`: `[unleserlich]` – Ende der letzten Zeile (vermutlich *„Erdnuss“* / *„Erdnüsse“*).

### 2.3 Allergen- und Zusatzstoff-Kürzel (`kennzeichnung`) bei den Gerichten

#### Sicher lesbare bzw. nicht vorhandene Kürzel (`unsicher: []`)
- **Ohne gedruckte Kürzel auf dem Flyer** (`kennzeichnung: []`, `unsicher: []`):
  - `salat`: *Gemischter Salat*, *Beilagensalat*, *Grüner Salat*, *Karottensalat*
  - `kindermenue`: *Pommes Frites*, *Kroketten*
  - `pizza` → `Jumbo-Pizza`: *Jumbo Pizza Margarita*, *Jumbo Pizza Salami*, *Jumbo Pizza Speciale*, *Jumbo Pizza F.D.M.*, *Jumbo Pizza Tonno Cipolle*
  - `fleischgerichte` → `vom Rind`: *Rumpsteak Natur*, *Rumpsteak mit Zwiebeln*, *Rumpsteak mit Zwiebeln u. Champignons*
- **Eindeutig lesbare Kürzel auf dem Flyer**:
  - `vorspeisen`: *Caprese* → `["F"]` (einzelnes `F`, zudem durch Figma bestätigt)
  - `fleischgerichte` → `vom Schwein`: *Schnitzel Brokkoli* → `["2", "A1", "F", "I"]` (auf dem Flyer versehentlich in großer Hauptschrift statt hochgestellt gedruckt: `Schnitzel Brokkoli 2,A1,F,I`)

#### Durch Figma-Lesehilfe gestützte, auf dem Flyer jedoch unscharfe Kürzel
- `vorspeisen` → **Shrimps Cocktail**: `["1", "2", "13", "A1", "B", "C", "I", "K", "F"]` aus Figma übernommen; auf dem Flyer selbst verschwommen (`"kennzeichnung"` in `"unsicher"`).
- `vorspeisen` → **Pizzabrot Speziale**: `["1", "A1", "F", "I"]` aus Figma übernommen; auf dem Flyer selbst verschwommen (`"kennzeichnung"` in `"unsicher"`).

#### Auf dem Flyer unscharfe Kürzel (`kennzeichnung: []`, `"unsicher": ["kennzeichnung"]`)

| Kategorie | Gericht | Was im Foto schemenhaft zu erkennen ist |
| :--- | :--- | :--- |
| `vorspeisen` | Carpaccio | ca. 3 Kürzel, ähnlich `2, F, G` oder `2, F, I` |
| `vorspeisen` | Bruschetta Classica | 2 Kürzel, ähnlich `A, F` oder `A1, F` |
| `vorspeisen` | Kräuterbutter-Toast | ca. 5–6 Kürzel, ähnlich `1, 2, A1, F, I, K` |
| `vorspeisen` | Toast mit Käse | ca. 5–6 Kürzel, ähnlich `1, 2, A1, F, I, K` |
| `vorspeisen` | Pizzabrot | ca. 4 Kürzel, ähnlich `1, A1, F, I` |
| `vorspeisen` | Panini | lange Kette, ähnlich `1, 2, 3, 4, A1, F, I, K` |
| `vorspeisen` | Knoblauchsoße oder Salatsoße | hinter beiden Wörtern jeweils ca. 6–7 Kürzel (`1, 2, A1, F, I, K...`) |
| `vorspeisen` | Cocktailsoße | ca. 7 Kürzel, ähnlich `1, 2, 13, A1, F, I, K` |
| `salat` | Spezial Salat | 2 Buchstaben, ähnlich `B, C` |
| `salat` | Italienischer Salat | ca. 5 Kürzel, ähnlich `1, 2, 3, 4, F` oder `1, 2, 3, A, F` |
| `salat` | Italienischer Salat mit Thunfisch | ca. 6 Kürzel, ähnlich `1, 2, 3, 4, B, F` |
| `salat` | Salat Contadino | ca. 6 Kürzel, ähnlich `1, 2, 3, 4, B, F` |
| `salat` | Salat Hawaii | 1 Buchstabe, ähnlich `C` |
| `salat` | Salat di Mare | ca. 7 Kürzel, ähnlich `1, 2, 4, A1, C, I, M` |
| `salat` | Salat „EFFGEN“ | 1 Buchstabe, ähnlich `F` |
| `salat` (Hinweis) | Salatsauce nach Wahl | hinter *Cremesoße* (`1, 2`), *Cocktailsoße* (`1, 2, 13, A1, F, I, K`), *Essig und Öl* (`D, K`) hochgestellt und unscharf |
| `kindermenue` | Spaghetti Bolognese | ähnlich `6, 13, A1, D, E, L` |
| `kindermenue` | Mini-Pizza Salami | ähnlich `1, 2, 4, 9, A1, F, I, K` |
| `kindermenue` | Schweineschnitzel „Wiener Art“ | ähnlich `1, A1, I` |
| `kindermenue` | Schweineschnitzel „Jäger Art“ | ähnlich `A1, E, F, I, K, L` |
| `kindermenue` | Schweineschnitzel in Rahmsoße | ähnlich `2, A1, E, F, I, K, L` |
| `kindermenue` | Chicken Nuggets | ähnlich `1, A1` |
| `pizza` (`Pizza`) | Alaska | ähnlich `A1, B, F, I` |
| `pizza` (`Pizza`) | Alla Chef | lange Kette, ähnlich `1, 2, 3, 4, 6, 9, 13, A1, D, E, F, I, K` |
| `pizza` (`Pizza`) | alla Kim | ähnlich `2, 4, A1, F, I, K` |
| `pizza` (`Pizza`) | Amerikana | ähnlich `6, 13, A1, D, E, F` |
| `pizza` (`Pizza`) | Bologna | ähnlich `2, 4, A1, F, I, K` |
| `pizza` (`Pizza`) | Calzone | lange Kette, ähnlich `1, 2, 4, 6, 9, 13, A1, D, E, F, I, K` |
| `pizza` (`Pizza`) | Campagnola | ähnlich `1, 2, 3, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Capricciosa | ähnlich `2, 3, 4, A1, F, I` |
| `pizza` (`Pizza`) | della Stagione | ähnlich `A1, F, I` |
| `pizza` (`Pizza`) | Diavolo | ähnlich `1, 2, 4, A1, F, I, K` |
| `pizza` (`Pizza`) | F.D.M. | ähnlich `1, 2, 4, A1, B, C, F, I, M` |
| `pizza` (`Pizza`) | Fabio | ähnlich `1, 2, 4, 6, 9, 13, A1, B, D, E, F, I, K` |
| `pizza` (`Pizza`) | Firenze | ähnlich `2, 4, A1, C, F, I, K` |
| `pizza` (`Pizza`) | Garda | ähnlich `2, 4, A1, F, I, K` |
| `pizza` (`Pizza`) | Gerold | ähnlich `2, 4, A1, F, I, K` |
| `pizza` (`Pizza`) | Grandiosa | ähnlich `2, 4, A1, B, F, I, K` |
| `pizza` (`Pizza`) | Hawaii | ähnlich `2, 3, 4, A1, F, I` |
| `pizza` (`Pizza`) | Italia | ähnlich `1, 2, 3, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Katrin | ähnlich `1, 2, 4, A1, F, I, K` |
| `pizza` (`Pizza`) | Klaus | ähnlich `2, 4, A1, F, I, K` |
| `pizza` (`Pizza`) | Lachs | ähnlich `A1, B, F, I` |
| `pizza` (`Pizza`) | La Casa | ähnlich `1, 2, 3, 4, 9, A1, F, I, K` (zudem Preise handschriftlich überschrieben) |
| `pizza` (`Pizza`) | Mafiosa | ähnlich `2, 4, 6, 13, A1, F, I, K` |
| `pizza` (`Pizza`) | Mare e Monti | ähnlich `2, 3, 4, A1, C, F, I` |
| `pizza` (`Pizza`) | Margarita | ähnlich `A1, F, I` |
| `pizza` (`Pizza`) | Mozzarella | ähnlich `A1, F, I` |
| `pizza` (`Pizza`) | Normale | ähnlich `1, 2, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Pasta | ähnlich `6, 13, A1, D, E, F, I` |
| `pizza` (`Pizza`) | Peperoniwurst | ähnlich `2, 4, A1, F, I, K` |
| `pizza` (`Pizza`) | Pico | ähnlich `1, 2, 3, 4, 6, 9, 13, A1, D, E, F, I, K` |
| `pizza` (`Pizza`) | Quattro Formaggi | ähnlich `2, A1, F, I` |
| `pizza` (`Pizza`) | Quattro Stagione | ähnlich `1, 2, 3, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Rango | ähnlich `1, 2, 4, 6, 9, 13, A1, D, E, F, I, K` |
| `pizza` (`Pizza`) | Sofia Loren | ähnlich `1, 2, 3, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Sorrento | ähnlich `1, 2, 4, 9, A1, B, F, I, K` |
| `pizza` (`Pizza`) | Salami | ähnlich `1, 2, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Schinken | ähnlich `2, 3, 4, A1, F, I` |
| `pizza` (`Pizza`) | Schmidt | ähnlich `2, 4, 6, 13, A1, D, E, F, I, K` |
| `pizza` (`Pizza`) | Sole Mio | ähnlich `1, 2, 3, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Speziale | ähnlich `1, 2, 3, 4, 6, 9, 13, A1, D, E, F, I, K` |
| `pizza` (`Pizza`) | Tonno Cipolle | ähnlich `A1, B, F, I` |
| `pizza` (`Pizza`) | Tris | ähnlich `1, 2, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Vegetale | ähnlich `A1, F, I` |
| `pizza` (`Pizza`) | Venezia | ähnlich `2, 3, 4, 9, A1, F, I` |
| `pizza` (`Pizza`) | Vesuvio | ähnlich `1, 2, 3, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Vulcano | ähnlich `1, 2, 4, 9, A1, F, I, K` |
| `pizza` (`Pizza`) | Werzbach | ähnlich `2, 4, 6, 13, A1, D, E, F, I, K` |
| `nudeln` (`Nudeln`) | Alle 32 Nudelgerichte | hochgestellte Kürzel hinter allen 32 Namen durchgängig unscharf (z. B. `A1, D, E, F, I, L`, `6, 13, A1, D, E, F, I, L` etc.) |
| `nudeln` (`Nudeln überbacken`) | Alle 9 überbackenen Nudelgerichte | hochgestellte Kürzel hinter allen 9 Namen durchgängig unscharf |
| `fleischgerichte` (`vom Schwein`) | Alle außer *Schnitzel Brokkoli* (12 Gerichte) | hochgestellte Kürzel hinter den 12 Namen durchgängig unscharf |
| `fleischgerichte` (`vom Rind`) | Rumpsteak mit Pfeffersoße | ca. 2 Kürzel, ähnlich `2, F` |
| `fleischgerichte` (`vom Rind`) | Rumpsteak mit Kräuterbutter | ca. 1 Kürzel, ähnlich `F` |

---

## 3. Abweichungen Figma ↔ Flyer

Bei allen Abweichungen wurde gemäß Vorgabe der **Flyer-Wert** in `src/content/speisekarte.json` übernommen:

1. **Vorspeisen – Fehlende Gerichte in Figma**:
   - Auf dem Flyer stehen **Carpaccio** (15 €), **Bruschetta Classica** (7 €), **Kräuterbutter-Toast** (3 Stück, 4 €), **Toast mit Käse** (3 Stück, 5 €) und **Pizzabrot** (mit Olivenöl und Oregano, 6 €). In Figma fehlen diese fünf Gerichte komplett.
2. **Vorspeisen – Panini (Varianten und Preis)**:
   - **Figma**: Drei einzelne Gerichte (*Panini Schinken (10 Stück)*, *Panini Salami (10 Stück)*, *Panini Käse (10 Stück)*) zu je **12 €**.
   - **Flyer**: Nur ein einziges Gericht **Panini** (*10 Stück, mit Käse, Formfleischvorderschinken und Knoblauchsoße*) für **11,00 €**.
3. **Vorspeisen – Bezeichnung der Soße**:
   - **Figma**: *Knoblauch oder Salatsoße* (2 €).
   - **Flyer**: *Knoblauchsoße oder Salatsoße* (2,00 €).
4. **Salat – Salat Contadino (Preis)**:
   - **Figma**: **12 €**.
   - **Flyer**: **13,00 €**.
5. **Salat – Italienischer Salat mit Thunfisch (Reihenfolge der Zutaten)**:
   - **Figma**: Reihenfolge analog *Italienischer Salat* mit *„… und Thunfisch“* am Ende.
   - **Flyer**: *„gemischter Salat mit Käse, Tomaten, Gurken, Eiern, Thunfisch, Zwiebeln, Formfleischvorderschinken und Karotten“*.
6. **Salat – Salat Hawaii (Dopplung in Figma)**:
   - **Figma**: Doppelt aufgeführt.
   - **Flyer**: Nur einmal aufgeführt (12,00 €).
7. **Salat – Salat „EFFGEN“ (Interpunktion)**:
   - **Figma**: Komma nach *Karotten* (*„… Karotten, gebratenen Champignons und Rindfleisch“*).
   - **Flyer**: Ohne Komma nach *Karotten* (*„… Karotten gebratenen Champignons und Rindfleisch“*).
8. **Salat – Fehlende Gerichte und Hinweise in Figma**:
   - Auf dem Flyer stehen zusätzlich **Salat di Mare** (13,00 €), **Beilagensalat** (7,00 €), **Grüner Salat** (7,00 €) und **Karottensalat** (7,00 €) sowie der Hinweis *„Salatsauce nach Wahl: Cremesoße, Cocktailsoße, Essig und Öl“*. In Figma fehlen diese Einträge.

---

## 4. Empfehlung für schärfere Fotos

Damit alle unsicheren Stellen restlos aufgelöst werden können, sollte der Nutzer folgende Bereiche des Flyers noch einmal aus kurzer Distanz (Makro/Nahaufnahme, ohne digitalen Zoom, gutes Licht) fotografieren:

1. **`karte1-spalte3` (untere Hälfte – höchste Priorität)**:
   - Die **Legende der Zusatzstoffe (1–13) und Allergene (A–N)** sowie der Block **Aufpreis je Zutat** sind in sehr kleiner Schrift gedruckt; insbesondere die Zusatzstoffe `10–12` und die Allergene `H`, `I`, `J`, `N` sind im aktuellen Foto kaum entzifferbar.
2. **`karte2-spalte3` (Mitte – hohe Priorität)**:
   - Nahaufnahme der Zeile **Pizza „La Casa“**, um die handschriftliche Preiskorrektur (klein `10,00 €` vs. `11,00 €`, groß `11,00 €` vs. `12,00 €`) eindeutig zu klären.
3. **Alle 7 Speisen-Spalten (`karte1-spalte1..3` und `karte2-spalte1..4`) für die Allergen-/Zusatzstoff-Kürzel**:
   - Falls die hochgestellten Allergen-/Zusatzstoff-Kürzel im Frontend angezeigt werden sollen, wird von jeder Spalte eine scharfe Nahaufnahme benötigt (ideal: jeweils obere und untere Spaltenhälfte getrennt fotografieren), da die ca. 5 pt kleinen Hochzahlen im bisherigen Gesamtfoto unterhalb der Auflösungsgrenze liegen.
