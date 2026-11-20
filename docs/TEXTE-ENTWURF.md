# Text-Entwurf (Phase 4): ALT → NEU

Alle Texte wurden durchgehend auf **„du“** umgestellt und in einem herzlichen, bodenständigen, dorfnahen Ton ohne Werbefloskeln und unbelegbare Superlative formuliert. Wo es natürlich passt, klingen kräftiger Geschmack, freundlicher Service und faire Preise an – ohne erfundene Fakten, Zitate oder Bewertungen. Fakten (Nummern, Adresse, Zeiten, Zonen, Preise) bleiben unverändert; die Lieferkosten-Suche wird sauber als **Ortssuche** beschrieben, Buttons bleiben kurz (max. 22 Zeichen).

---

## 1. Header / Navigation

| Ort | ALT | NEU | Warum (kurz) |
|---|---|---|---|
| `texte.json` → `navigation[0].label` (Fallback: `Header.astro:25`, `Footer.astro:12`) | Home | Startseite | Deutsch statt Anglizismus, bodenständiger |
| `texte.json` → `navigation[1..4].label` | Speisekarte, Lieferservice, Öffnungszeiten, Kontakt | unverändert | Klar und passend |
| `src/components/Header.astro:77` (`alt` Logo) | Pizzeria Turnhalle Herrstein – Startseite | unverändert | Kurz und beschreibend |
| `src/components/Header.astro:84` (`aria-label` Nav) | Hauptnavigation | unverändert | Barrierefreier Standard |

---

## 2. Hero

| Ort | ALT | NEU | Warum (kurz) |
|---|---|---|---|
| `texte.json` → `hero.headline` | Frisch. Heiß. Direkt zu dir. | unverändert | Kurz, warm, bereits im „du“ |
| `texte.json` → `hero.subline` | Authentische italienische Küche – perfekt für Lieferung und Abholung | Italienische Küche mit vollem Geschmack – zum Liefern oder Abholen. | Weniger Werbesprech („Authentische“, „perfekt“), betont Geschmack |
| `texte.json` → `hero.buttonPrimaer` | Jetzt bestellen | unverändert | Kurz (15 Zeichen), klar (siehe offene Frage 5) |
| `texte.json` → `hero.buttonSekundaer` | Speisekarte ansehen | unverändert | Kurz (19 Zeichen), klar |
| `texte.json` → `hero.bildAlt` | Frisch gebackene Pizza mit geschmolzenem Käse und frischen Kräutern auf einem Holzbrett | Frisch gebackene Pizza mit Käse und Kräutern auf einem Holzbrett | Kürzer, ohne doppeltes „frisch“ |
| `texte.json` → `hero.scrollPfeilLabel` | Zum nächsten Abschnitt scrollen | unverändert | Kurz und beschreibend |

---

## 3. Italienischer Genuss + 5 Kategorie-Karten

| Ort | ALT | NEU | Warum (kurz) |
|---|---|---|---|
| `texte.json` → `genuss.ueberschrift` | Italienischer Genuss pur | Frisch aus unserer Küche | Ohne Werbefloskel („Genuss pur“), gleiche Länge |
| `texte.json` → `genuss.text` | Entdecke die Vielfalt unserer frisch zubereiteten Vorspeisen, knackigen Salate, herzhaften Fleischgerichte sowie unserer beliebten Pizzen und cremigen Pastagerichte – für jeden Geschmack das Richtige. | Ob Vorspeise, knackiger Salat, Pizza, Pasta oder ein herzhaftes Fleischgericht: Wir kochen frisch, würzen kräftig und bleiben fair im Preis – da findest du bestimmt genau das, worauf du Lust hast. | Ohne Standardfloskeln, persönliches „du“, Geschmack & faire Preise eingebunden |
| `texte.json` → `genuss.button` | Speisekarte ansehen | unverändert | Kurz (19 Zeichen), klar |
| `texte.json` → `genuss.kategorien[0].titel` | Vorspeisen entdecken | Vorspeisen zum Start | Vermeidet Doppelung mit Button |
| `texte.json` → `genuss.kategorien[0].text` | Starte dein Menü mit Caprese, Shrimps-Cocktail, Panini oder Pizzabrot – klassisch italienisch und immer lecker. | Starte mit Caprese, Shrimps-Cocktail, Panini oder Pizzabrot – frisch zubereitet für den Appetit vorweg. | Weniger floskelig („immer lecker“), bodenständiger |
| `texte.json` → `genuss.kategorien[0].button` | Vorspeisen entdecken | Alle Vorspeisen | Einheitlich, direkt, 15 Zeichen |
| `texte.json` → `genuss.kategorien[1].titel` | Frische Salate | unverändert | Kurz und klar |
| `texte.json` → `genuss.kategorien[1].text` | Ob gemischt, italienisch, mit Shrimps oder klassisch als Beilage – unsere Salate passen zu jedem Gericht. | Ob gemischt, italienisch, mit Shrimps oder einfach als Beilage – knackig frisch und mit Dressing nach deiner Wahl. | Konkreter (Dressing nach Wahl laut Karte), direktes „du“ |
| `texte.json` → `genuss.kategorien[1].button` | Salate entdecken | Alle Salate | Einheitlich, direkt, 11 Zeichen |
| `texte.json` → `genuss.kategorien[2].titel` | Pizza genießen | Unsere Pizzen | Bodenständiger ohne „genießen“-Floskel |
| `texte.json` → `genuss.kategorien[2].text` | Über 30 verschiedene Pizzen, darunter Klassiker und Spezialitäten wie Diavolo, Calzone oder Chef – auch als Jumbo erhältlich. | Über 30 verschiedene Pizzen – von Klassikern bis Diavolo, Calzone oder Alla Chef. Für den großen Hunger gibt es einige auch als Jumbo. | Wärmer als „erhältlich“, exakter Name „Alla Chef“ |
| `texte.json` → `genuss.kategorien[2].button` | Pizza entdecken | Alle Pizzen | Einheitlich, direkt, 11 Zeichen |
| `texte.json` → `genuss.kategorien[3].titel` | Nudeln wie in Italien | Nudeln & Überbackenes | Ohne Floskel, bildet auch die überbackenen Gerichte ab |
| `texte.json` → `genuss.kategorien[3].text` | Spaghetti, Penne, Tagliatelle oder Tortellini – mit Carbonara, Lachs, Steinpilzen und vielen weiteren Saucen. | Spaghetti, Penne, Tagliatelle oder Tortellini – ob mit Carbonara, Lachs, Steinpilzen oder im Ofen überbacken, immer kräftig abgeschmeckt. | Greift Überbackenes und kräftigen Geschmack auf |
| `texte.json` → `genuss.kategorien[3].button` | Nudeln entdecken | Alle Nudelgerichte | Einheitlich, direkt, 18 Zeichen |
| `texte.json` → `genuss.kategorien[4].titel` | Fleischgerichte vom Feinsten | Herzhafte Fleischgerichte | Ersetzt den Superlativ „vom Feinsten“ |
| `texte.json` → `genuss.kategorien[4].text` | Schnitzel, Cordon Bleu, Rumpsteak und mehr – frisch zubereitet, mit Sauce, Beilage und knackigem Salat serviert. | Schnitzel, Cordon Bleu oder Rumpsteak – frisch zubereitet, serviert mit Pommes oder Kroketten und knackigem Salat. | Konkrete Beilagen laut Karte, ohne „und mehr“ |
| `texte.json` → `genuss.kategorien[4].button` | Fleischgerichte entdecken | Alle Fleischgerichte | Kürzer (20 statt 25 Zeichen), einheitlich |

---

## 4. Lieferservice-Karten

| Ort | ALT | NEU | Warum (kurz) |
|---|---|---|---|
| `texte.json` → `lieferservice.ueberschrift` | Heiß & frisch - direkt zu dir nach Hause | Heiß & frisch – direkt zu dir nach Hause | Typografisch korrekter Gedankenstrich, Text passt |
| `texte.json` → `lieferservice.intro` | Ob Sie Ihr Lieblingsgericht lieber bequem liefern lassen oder selbst abholen – wir sorgen dafür, dass alles frisch zubereitet und heiß bei Ihnen ankommt. Die Lieferkosten richten sich nach dem Ort und sind unten in der Übersicht aufgeführt. Weitere Orte beliefern wir gerne auf Anfrage. | Ob du dir dein Essen liefern lässt oder es selbst abholst – bei uns erwarten dich freundlicher Service und frisch zubereitete, heiße Gerichte. Die Lieferkosten richten sich nach deinem Ort und stehen gleich hier unten. Weitere Orte beliefern wir gerne auf Anfrage. | Von „Sie“ auf „du“, weniger steif, freundlicher Service eingebunden |
| `lieferzonen.json` → `firmenlieferung.text` | Für Firmen liefern wir mittags kostenfrei. | unverändert | Kurz und klar; Aussage unverändert (Bestätigung offen) |
| `texte.json` → `lieferservice.karten.telefon` | Telefonisch bestellen | unverändert | Kurz und klar |
| `texte.json` → `lieferservice.telefonUntertitel` | Rufen Sie uns direkt an | Ruf uns direkt an | Von „Sie“ auf „du“ |
| `texte.json` → `lieferservice.telefonButton` | Jetzt anrufen | unverändert | Kurz (13 Zeichen), klar |
| `texte.json` → `lieferservice.karten.whatsapp` | WhatsApp bestellen | Per WhatsApp bestellen | Natürliches Deutsch, passend zu „Telefonisch bestellen“ |
| `texte.json` → `lieferservice.whatsappUntertitel` | Schreiben Sie uns eine Nachricht | Schreib uns eine Nachricht | Von „Sie“ auf „du“ |
| `texte.json` → `lieferservice.whatsappButton` | WhatsApp öffnen | unverändert | Kurz (15 Zeichen), klar |
| `texte.json` → `lieferservice.whatsappAriaLabel` | WhatsApp öffnen (öffnet in neuem Tab) | Per WhatsApp schreiben (öffnet in neuem Tab) | Vermeidet Wortdoppelung „öffnen/öffnet“, einheitlich mit Kontaktkarte |
| `texte.json` → `lieferservice.karten.bestellinfos` | Bestellinformationen | unverändert | Klar und gut scanbar |
| `texte.json` → `lieferservice.bestellinfoPunkte.abholungTitel` | Abholung | unverändert | Kurz und klar |
| `texte.json` → `lieferservice.bestellinfoPunkte.abholungText` | Abholung vor Ort möglich. | Du kannst dein Essen auch direkt bei uns abholen. | Herzlicher statt bürokratisch, mit „du“ |
| `texte.json` → `lieferservice.bestellinfoPunkte.lieferungTitel` | Lieferung | unverändert | Kurz und klar |
| `texte.json` → `lieferservice.bestellinfoPunkte.lieferungText` | Lieferkosten finden Sie in der Übersicht oder per Adresssuche. | Die Lieferkosten findest du unten in der Übersicht oder über die Ortssuche. | Von „Sie“ auf „du“ und „Ortssuche“ statt „Adresssuche“ |
| `texte.json` → `lieferservice.bestellinfoPunkte.mindestbestellwertTitel` | Mindestbestellwert | unverändert | Klar |
| `lieferzonen.json` → `mindestbestellwert.text` | Kein Mindestbestellwert | unverändert | Kurz und klar; Aussage unverändert (Bestätigung offen) |
| `texte.json` → `lieferservice.bestellinfoPunkte.oeffnungszeitenTitel` | Öffnungszeiten | unverändert | Klar |
| `texte.json` → `lieferservice.karten.adresse` | Adresse | unverändert | Klar |
| `texte.json` → `lieferservice.adresseButton` | Auf Karte anzeigen | unverändert | Kurz (18 Zeichen), klar |
| `texte.json` → `lieferservice.adresseAriaLabel` | Standort auf Google Maps anzeigen (öffnet in neuem Tab) | unverändert | Beschreibend und barrierefrei |

---

## 5. Lieferkosten

| Ort | ALT | NEU | Warum (kurz) |
|---|---|---|---|
| `texte.json` → `lieferkosten.ueberschrift` | Lieferkosten | unverändert | Kurz und klar |
| `texte.json` → `lieferkosten.untertitel` | Suchen Sie per Adresseingabe oder direkt in der Übersicht. | Gib deinen Ortsnamen ein oder schau direkt in der Übersicht nach. | Von „Sie“ auf „du“; Suche funktioniert nur mit Ortsnamen |
| `texte.json` → `lieferkosten.suchfeldLabel` | Ort suchen | unverändert | Kurz und sachlich korrekt |
| `texte.json` → `lieferkosten.suchfeldPlatzhalter` | Ort eingeben, z. B. Idar … | Ortsname, z. B. Idar … | Macht klar, dass keine Straße gemeint ist; kurz genug für 375 px |
| `texte.json` → `lieferkosten.sucheLeerenLabel` | Suche leeren | unverändert | Kurz und beschreibend |
| `texte.json` → `lieferkosten.zonePrefix` | Lieferzone | unverändert | Klar |
| `texte.json` → `lieferkosten.statusAlle` | Alle {anzahl} Lieferzonen angezeigt | unverändert | Klar für Screenreader |
| `texte.json` → `lieferkosten.statusTrefferSingular` | 1 Zone gefunden | unverändert | Klar für Screenreader |
| `texte.json` → `lieferkosten.statusTrefferPlural` | {anzahl} Zonen gefunden | unverändert | Klar für Screenreader |
| `texte.json` → `lieferkosten.statusKeinTreffer` | Keine Lieferzone gefunden | unverändert | Klar für Screenreader |
| `lieferzonen.json` → `keinTrefferText` | Dein Ort ist nicht dabei? Ruf uns an, wir liefern gerne auf Anfrage. | unverändert | Bereits im „du“, herzlich, stimmt mit Plan überein |

---

## 6. Öffnungszeiten & Kontakt

| Ort | ALT | NEU | Warum (kurz) |
|---|---|---|---|
| `texte.json` → `oeffnungszeitenKontakt.ueberschrift` | Öffnungszeiten & Kontakt | unverändert | Kurz und klar |
| `texte.json` → `oeffnungszeitenKontakt.oeffnungszeitenTitel` | Unsere Öffnungszeiten | unverändert | Herzlich und klar |
| `texte.json` → `oeffnungszeitenKontakt.geschlossenLabel` | geschlossen | Ruhetag | Bodenständiger, einheitlich mit mobilem Menü („Mo Ruhetag“) und Karte |
| `texte.json` → `oeffnungszeitenKontakt.kontaktTitel` | So erreichen Sie uns | So erreichst du uns | Von „Sie“ auf „du“ |
| `texte.json` → `oeffnungszeitenKontakt.labelTelefon` / `labelWhatsapp` / `labelEmail` | Telefon:, WhatsApp:, E-Mail: | unverändert | Klar |
| `texte.json` → `oeffnungszeitenKontakt.whatsappAriaLabel` | Per WhatsApp schreiben (öffnet in neuem Tab) | unverändert | Kurz und beschreibend |
| `texte.json` → `oeffnungszeitenKontakt.karteButton` | Auf Karte anzeigen | unverändert | Kurz (18 Zeichen), klar |
| `texte.json` → `oeffnungszeitenKontakt.karteAriaLabel` | Standort auf Google Maps anzeigen (öffnet in neuem Tab) | unverändert | Kurz und beschreibend |
| `src/scripts/oeffnungsstatus.ts:101–162` (Live-Status-Badge) | Jetzt geöffnet · bis {bis} Uhr / Geschlossen · öffnet heute {von} Uhr / Geschlossen · öffnet {tag} {von} Uhr / Geschlossen · {text} / Derzeit geschlossen | unverändert | Kurz, sachlich, gut lesbar |

---

## 7. Footer

| Ort | ALT | NEU | Warum (kurz) |
|---|---|---|---|
| `src/components/Footer.astro:32` (`alt` Logo) | Pizzeria Turnhalle Herrstein – Startseite | unverändert | Kurz und beschreibend |
| `src/components/Footer.astro:39` (`aria-label` Nav) | Fußnavigation | unverändert | Barrierefreier Standard |
| `src/components/Footer.astro:59` | © {Jahr} Pizzeria Turnhalle Herrstein. Alle Rechte vorbehalten. | unverändert | Sachlicher Standard |
| `src/components/Footer.astro:61` | Website by Adomas Mockaitis. | Website von Adomas Mockaitis | Einheitlich deutsch (siehe offene Frage 3) |
| `src/components/Footer.astro:65–66` | Impressum, Datenschutz | unverändert | Rechtlich erforderlich |
| `src/components/Footer.astro:71` | Fotos: Ivan Torres, Inna Gurina, Nicholas Grande via Unsplash | Fotos: Ivan Torres, Inna Gurina, Oksana Simanovscaia, mk. s, behrouz sasani (Unsplash) | Passt zu `docs/BILDNACHWEISE.md` (Nicholas Grande nicht genutzt; siehe offene Frage 4) |

---

## 8. Mobile Leiste / Menü

| Ort | ALT | NEU | Warum (kurz) |
|---|---|---|---|
| `src/components/Header.astro:122, 193, 203` (`aria-label` Burger) | Menü öffnen / Menü schließen | unverändert | Kurz und beschreibend |
| `src/components/Header.astro:132` (`aria-label` Dialog) | Menü | unverändert | Kurz und beschreibend |
| `src/components/Header.astro:137` (`aria-label` Schließen) | Menü schließen | unverändert | Kurz und beschreibend |
| `src/components/Header.astro:162` | Anrufen · 06785 9992555 | unverändert | Direkt und klar |
| `src/components/Header.astro:171` | WhatsApp schreiben | Per WhatsApp schreiben | Natürlicher, 22 Zeichen |
| `src/components/Header.astro:164` (`aria-label` WhatsApp-Link im Menü) | *(fehlt)* | Per WhatsApp schreiben (öffnet in neuem Tab) | Barrierefreier Hinweis auf neuen Tab (wie auf der Startseite) |
| `src/components/Header.astro:63–68, 173` (Kurzzeiten) | Di–So 11–14 & 17–22 Uhr · Mo Ruhetag | unverändert | Fakten aus `oeffnungszeiten.json` |
| `src/components/MobileAktionsleiste.astro:9` (`aria-label`) | Schnellkontakt | unverändert | Kurz und beschreibend |
| `src/components/MobileAktionsleiste.astro:19` | Anrufen | unverändert | Kurz (7 Zeichen) |
| `src/components/MobileAktionsleiste.astro:36` | WhatsApp | unverändert | Kurz (8 Zeichen) |
| `src/components/MobileAktionsleiste.astro:22` (`aria-label` WhatsApp-Link) | *(fehlt)* | Per WhatsApp schreiben (öffnet in neuem Tab) | Barrierefreier Hinweis auf neuen Tab |

---

## 9. Sonstiges (Meta, Demo-Balken, Skip-Link, Hinweis-Banner)

| Ort | ALT | NEU | Warum (kurz) |
|---|---|---|---|
| `texte.json` → `meta.beschreibung` | Pizzeria Turnhalle Herrstein – Authentische italienische Küche, perfekt für Lieferung und Abholung in Herrstein und Umgebung. | Pizzeria Turnhalle Herrstein: Pizza, Pasta, Salate & Fleischgerichte zu fairen Preisen – zum Liefern oder Abholen in Herrstein und Umgebung. | Ohne Werbefloskeln, konkretes Angebot + faire Preise, gute Länge (140 Zeichen) |
| `src/config.ts:13` (`DEMO_HINWEIS_TEXT`, genutzt in `DemoBalken.astro:8`) | Entwurf – Preise und Angaben ohne Gewähr | unverändert | Klar und exakt wie im Plan |
| `src/layouts/BaseLayout.astro:54` (Skip-Link) | Zum Inhalt springen | unverändert | Barrierefreier Standard |
| `src/content/hinweis.json:3` (`text`, genutzt in `HinweisBanner.astro:8`) | *(leer, `aktiv: false`)* | unverändert | Optionaler Banner, erst bei Bedarf befüllen |

---

## Fest eingebaute Texte, die nach `texte.json` umziehen sollten

Alle folgenden Texte stehen derzeit noch direkt in Komponenten oder Skripten und sollten beim Einbau der freigegebenen Texte zentral in `src/content/texte.json` abgelegt werden:

- `src/layouts/BaseLayout.astro:54` – `"Zum Inhalt springen"`
- `src/components/Header.astro:25` – Fallback-Array `['Home', 'Speisekarte', 'Lieferservice', 'Öffnungszeiten', 'Kontakt']` (doppelt zu `Footer.astro:12` und `texte.json`)
- `src/components/Header.astro:63` & `:66` – `"Uhr"` und `"Ruhetag"` (in der Öffnungszeiten-Kurzinfo)
- `src/components/Header.astro:77` & `:135` – `"– Startseite"` im Logo-Alt-Text
- `src/components/Header.astro:84` & `:140` – `"Hauptnavigation"` (`aria-label`)
- `src/components/Header.astro:122`, `:193`, `:203` – `"Menü öffnen"` / `"Menü schließen"` (`aria-label` inkl. Inline-Script)
- `src/components/Header.astro:132` – `"Menü"` (`aria-label` des mobilen Sheets)
- `src/components/Header.astro:137` – `"Menü schließen"` (`aria-label` des Schließen-Buttons)
- `src/components/Header.astro:162` – `"Anrufen"` (vor der Telefonnummer im Menü-Sheet)
- `src/components/Header.astro:171` – `"WhatsApp schreiben"` (Button im Menü-Sheet)
- `src/components/Footer.astro:12` – Fallback-Array `['Home', 'Speisekarte', 'Lieferservice', 'Öffnungszeiten', 'Kontakt']`
- `src/components/Footer.astro:32` – `"– Startseite"` im Logo-Alt-Text
- `src/components/Footer.astro:39` – `"Fußnavigation"` (`aria-label`)
- `src/components/Footer.astro:59` – `"Alle Rechte vorbehalten."`
- `src/components/Footer.astro:61` – `"Website by Adomas Mockaitis."`
- `src/components/Footer.astro:65` & `:66` – `"Impressum"`, `"Datenschutz"`
- `src/components/Footer.astro:71` – `"Fotos: Ivan Torres, Inna Gurina, Nicholas Grande via Unsplash"`
- `src/components/MobileAktionsleiste.astro:9` – `"Schnellkontakt"` (`aria-label`)
- `src/components/MobileAktionsleiste.astro:19` – `"Anrufen"`
- `src/components/MobileAktionsleiste.astro:36` – `"WhatsApp"`
- `src/components/startseite/OeffnungszeitenKontakt.astro:49` – `"Uhr"` (hinter Zeitspannen)
- `src/scripts/oeffnungsstatus.ts:101–102`, `:123`, `:134`, `:154`, `:162` – Live-Status-Texte (`"Jetzt geöffnet · bis … Uhr"`, `"Geschlossen · öffnet heute … Uhr"`, `"Geschlossen · öffnet … Uhr"`, `"Geschlossen"`, `"Derzeit geschlossen"`) sowie `:215–216` (`"bis"`, `"Uhr"`)

*(Hinweis: `DEMO_HINWEIS_TEXT` in `src/config.ts:13` liegt dort passend neben `DEMO_MODE` und muss nicht zwingend umziehen.)*

---

## Offene Fragen an den Nutzer

1. **WhatsApp-Bestellungen (1 Tag Vorlauf?):** Auf dem Speisekarten-Foto (`docs/speisekarte-fotos/karte1.png`) steht: *„Bestellungen können ein Tag vor gewünschter Lieferung oder Abholung auch per WhatsApp aufgegeben werden. Name und Adresse bei jeder Bestellung angeben.“* Auf der Startseite wirkt die WhatsApp-Karte derzeit wie eine Sofortbestellung. Soll sie für die Demo erst mal allgemein bleiben (bis der Inhaber es klärt) oder schon einen kurzen Hinweis zur Vorbestellung enthalten?
2. **„Home“ vs. „Startseite“:** Soll der erste Navigationspunkt von „Home“ auf „Startseite“ geändert werden oder wie in Figma „Home“ heißen?
3. **Footer-Credit:** Soll „Website by Adomas Mockaitis.“ bewusst auf Englisch bleiben oder auf „Website von Adomas Mockaitis“ geändert werden?
4. **Fotonachweis im Footer:** Soll der Footer-Text direkt auf die tatsächlich eingebundenen Unsplash-Fotografen aus `docs/BILDNACHWEISE.md` aktualisiert werden (ohne den nicht genutzten Nicholas Grande)? *(Hinweis: Das Nudel-Foto ist dort noch ungeklärt und bereits in `docs/OFFENE-PUNKTE.md` erfasst.)*
5. **Hero-Button „Jetzt bestellen“:** Der Button startet direkt einen Telefonanruf (`tel:`). Passt „Jetzt bestellen“ (mit Telefon-Icon) oder wäre „Jetzt anrufen“ klarer, damit niemand ein Online-Bestellformular erwartet?

---

## Entscheidungen des Nutzers (20.11.2026)

1. **WhatsApp:** Hinweis auf Vorbestellung aufnehmen (laut Flyer: Bestellungen per WhatsApp einen Tag vor gewünschter Lieferung/Abholung). Untertitel der WhatsApp-Karte z. B. „Bestell gern einen Tag im Voraus“. → In OFFENE-PUNKTE zur Bestätigung durch den Inhaber.
2. **Navigation:** „Startseite“ (deutsch). Später kommen weitere Sprachen dazu.
3. **Footer-Credit:** „Website von Adomas Mockaitis“ (deutsch; je Sprache später übersetzt).
4. **Hero-Button:** „Jetzt anrufen“.
5. **Fotonachweis:** auf die tatsächlich genutzten Fotos laut `docs/BILDNACHWEISE.md` aktualisieren.
6. Alle übrigen Vorschläge aus den Tabellen werden übernommen.
