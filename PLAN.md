# Projektplan: Website Pizzeria Turnhalle Herrstein

> Dieser Plan ist für Claude Code. Lies ihn vollständig, bevor du anfängst, und arbeite die Phasen der Reihe nach ab.
> Am Ende jeder Phase: **stopp, fasse kurz zusammen, was erledigt ist, und warte auf mein OK**, bevor du mit der nächsten Phase weitermachst.

---

## 1. Ziel & Kontext

- Website für die **Pizzeria Turnhalle Herrstein** (Brühlstraße 12, 55756 Herrstein, Rheinland-Pfalz).
- Zweck: Gäste sollen schnell die **Speisekarte**, **Infos zu Lieferung/Abholung**, **Lieferkosten**, **Öffnungszeiten** und **Kontakt** finden und dann **anrufen oder per WhatsApp bestellen**.
- **Keine** Online-Bestellung, **keine** Reservierung, kein Shop, keine Zahlungsabwicklung.
- Das Design existiert großteils in Figma (siehe Abschnitt 3).
- Ich (der Entwickler) habe etwas Programmiererfahrung (HTML/CSS). Erkläre wichtige Entscheidungen kurz und verständlich, aber ohne Romane.

### Wichtig: Status „Demo“
Der Inhaber weiß **noch nichts** von der Website. Ich baue sie zuerst als Demo und zeige sie ihm dann. Daraus folgt:
- Die Demo darf **nicht von Suchmaschinen indexiert** werden (`<meta name="robots" content="noindex, nofollow">` und `robots.txt` mit `Disallow: /`), solange `DEMO_MODE` aktiv ist.
- Ein dezenter, aber sichtbarer **Demo-Hinweis** (z. B. schmaler Balken oben: „Entwurf – Preise und Angaben ohne Gewähr“), per Konfiguration abschaltbar.
- **Impressum und Datenschutz** werden als Seiten mit klar markierten Platzhaltern angelegt (`[TODO: Name Inhaber]` usw.). Keine erfundenen Rechtsdaten.
- Alles, was der Inhaber später bestätigen oder liefern muss, kommt in `docs/OFFENE-PUNKTE.md` (siehe Abschnitt 10).

---

## 2. Tech-Stack & Architektur

| Thema | Entscheidung | Begründung |
|---|---|---|
| Framework | **Astro** (statische Seite) | Mehrere Seiten, kein Server nötig, schnell, Inhalte als Dateien |
| Styling | Normales CSS mit **CSS-Variablen** (Design Tokens aus Figma), komponentenweise in Astro-Komponenten | Einfach zu verstehen und zu pflegen |
| Inhalte | **Strukturierte Content-Dateien** (JSON oder YAML) in `src/content/` | Ein Git-basiertes CMS kann sie später direkt bearbeiten (Phase 7) |
| JavaScript | Nur wo nötig (Lieferzonen-Suche, Burger-Menü, „Jetzt geöffnet“-Anzeige) | Leichtgewichtig |
| Schriften | **Selbst gehostet** (z. B. über `@fontsource`), **nicht** von Google Fonts laden | DSGVO |
| Karte | **Kein** eingebettetes Google Maps. Stattdessen Button „Auf Karte anzeigen“ als Link zu Google Maps bzw. OpenStreetMap | DSGVO, keine Cookies |
| Tracking | Keins, keine Cookies | Kein Cookie-Banner nötig |
| Hosting Demo | **GitHub Pages** (öffentliches Repo, Deploy per GitHub Actions) | Kostenlos, reicht zum Testen |
| Hosting live | Später, z. B. Netlify oder Cloudflare Pages + eigene Domain (Phase 7) | Erst wenn der Inhaber zusagt |

### Content-Struktur (Vorschlag)
```
src/content/
  speisekarte.json      # Kategorien → Gerichte (name, beschreibung, preis, allergene[], zusatzstoffe[], vegetarisch?)
  lieferzonen.json      # Zonen → { name, orte[], preis }
  oeffnungszeiten.json  # Wochentage, Zeiten, Ruhetag, optional: Sonderöffnungszeiten/Betriebsurlaub
  kontakt.json          # Adresse, Telefon, WhatsApp, E-Mail, Maps-Link
  hinweis.json          # Optionaler Banner-Text (z. B. „Betriebsurlaub vom … bis …“), an/aus
  allergene.json        # Legende für Allergen- und Zusatzstoff-Kennzeichnungen
src/config.ts           # DEMO_MODE, Site-URL, Base-Path
```
Komponenten und Seiten lesen **nur** aus diesen Dateien, nichts hart codieren (Telefonnummer, Zeiten, Preise usw.).

---

## 3. Design-Quelle: Figma

- Datei: `https://www.figma.com/design/SACZ3Me42J7j9lkiWhkGJY/Pizzeria`
- File-Key: `SACZ3Me42J7j9lkiWhkGJY`
- Voraussetzung: Der **Figma-MCP-Server** ist in Claude Code eingerichtet (siehe Phase 0 A).

### Welche Frames gelten
In der Datei liegen viele alte Entwürfe und Varianten. **Nur diese Frames sind maßgeblich:**

| Frame | Node-ID | Inhalt |
|---|---|---|
| **Desktop - 11** | `1:770` | **Startseite** (finale Version, 1920 px breit) |
| **Desktop - 12** | `1:1028` | **Speisekarte** (nur Vorspeisen + Salat gestaltet) |
| HEADER | `1:1536` | Header-Komponente |

Alle anderen Frames (Desktop 1–6, 9, 10, „Stitch Design“, „Speisekarte“, „Lieferservice“ usw.) sind ältere Varianten. Nutze sie höchstens als Ideenquelle, wenn etwas in den Hauptframes fehlt.

### Was im Design steht (Startseite, von oben nach unten)
1. **Header**: Navigation (Home, Speisekarte, Lieferservice, Öffnungszeiten, Kontakt) + roter Telefon-Button rechts
2. **Hero**: großes Pizza-Foto, Logo, Headline „Frisch. Heiß. Direkt zu dir.“, Subline, Buttons „Jetzt bestellen“ + „Speisekarte ansehen“, Scroll-Pfeil
3. **„Italienischer Genuss pur“**: Intro-Text + Button + grüne Teaser-Karte „Fleischgerichte vom Feinsten“
4. **„Heiß & frisch – direkt zu dir nach Hause“**: 4 Karten: Telefonisch bestellen, WhatsApp bestellen, Bestellinformationen, Adresse
5. **Lieferkosten**: Suchfeld „Adresse suchen …“ + 8 Lieferzonen-Karten (rot/grün im Wechsel, Preis-Badge)
6. **Öffnungszeiten & Kontakt**: 2 Karten
7. **Footer**: Logo, Navigation, Trikolore-Linie, ©, Impressum, Datenschutz

Dekorative Mockup-Bilder (Pizzakarton, Papiertüte, Lieferauto, Pizza am Rand) ragen teils über die Karten. Übernimm das auf Desktop, auf Mobile reduzieren oder ausblenden.

### Vorgehen
1. Lies die beiden Hauptframes mit dem Figma-MCP (Design-Kontext + Screenshot).
2. Leite **Design Tokens** ab: Farben (Rot, Grün, Off-White-Hintergrund, Schwarz/Weiß), Schriften, Größen, Abstände, Radien. Schreibe sie als CSS-Variablen in `src/styles/tokens.css`.
3. Exportiere die Assets: **Logo** (als SVG, falls möglich), Mockups (Karton, Tüte, Auto), Icons. Bilder als **WebP/AVIF** in passenden Größen.
4. Unsplash-Fotos (Ivan Torres, Inna Gurina, Nicholas Grande) sind **Platzhalter**. Verwende sie, ersetze sie aber über eine zentrale Stelle, damit echte Fotos später leicht reinkommen. Fotonachweise auf einer Credits-Stelle (z. B. im Footer oder Impressum) nennen.

---

## 4. Seitenstruktur

| Route | Inhalt |
|---|---|
| `/` | Startseite wie in Figma. Die Navi-Punkte Lieferservice, Öffnungszeiten und Kontakt sind **Anker** auf die Abschnitte der Startseite |
| `/speisekarte` | Speisekarte mit Kategorie-Navigation (Vorspeisen, Salat, Kindermenü, Pizza, Nudeln, Fleischgerichte), „Zurück“-Button, Allergen-Legende unten |
| `/impressum` | Platzhalter-Struktur nach § 5 DDG, alle Pflichtangaben als `[TODO]` |
| `/datenschutz` | Datenschutzerklärung passend zur tatsächlichen Technik (Hosting, keine Cookies, kein Tracking, externe Links zu Maps/WhatsApp). Mit `[TODO]` für Verantwortlichen. **Hinweis an mich**, dass vor dem Livegang ein Generator oder eine Fachperson drüberschauen sollte |
| `404` | Einfache Fehlerseite im Design |

---

## 5. Fakten & Daten (verifiziert vs. offen)

### Online recherchiert (mehrere Branchenverzeichnisse, stimmt mit Figma überein)
- **Adresse:** Brühlstraße 12, 55756 Herrstein
- **Telefon:** 06785 9992555 (Link: `tel:+4967859992555`)
- **Öffnungszeiten:** Montag Ruhetag · Dienstag–Sonntag 11:00–14:00 und 17:00–22:00
- **Angebot laut Verzeichnissen:** Lieferdienst, Abholung, Pizzeria/italienisch

### Nur aus Figma, noch zu bestätigen → in `OFFENE-PUNKTE.md`
- WhatsApp: 0174-5390999 (Link: `https://wa.me/491745390999`)
- E-Mail: kontakt@pizzeria-herrstein.de (Domain existiert vermutlich noch nicht → in der Demo **nicht** als mailto-Link verlinken, nur als Text mit TODO)
- „Kein Mindestbestellwert“, „Für Firmen liefern wir mittags kostenfrei“
- Lieferzonen und Preise (siehe unten)

### Lieferzonen (aus Figma)
- Zone 1 (1 €): Herrstein, Niederwörresbach
- Zone 2 (2 €): Niederhosenbach, Oberwörresbach
- Zone 3 (3 €): Breitenthal, Wickenrodt, Mörschied, Herborn, Veitsrodt, Gerach, Oberhosenbach
- Zone 4 (4 €): Kempfeld, Weiden, Hottenbach, Sonnschied, Fischbach, Hintertiefenbach, Schauren, Vollmersbach, Göttschied, Tiefenstein, Asbach, Sulzbach
- Zone 5 (5 €): Stipshausen, Kirschweiler, Bruchweiler, Weierbach, Idar, Hettenrodt, Hellertshausen, Regulshausen, Griebelschied
- **Zonen 6–8 sind Platzhalter** (Kopien von Zone 2–4). Lege sie in den Daten an, aber blende sie aus (`sichtbar: false`), und trag sie in `OFFENE-PUNKTE.md` ein.
- Achtung Tippfehler in einer Figma-Variante: „Herrnstein“ → richtig ist **„Herrstein“**.

---

## 6. Texte

Die Texte im Figma sind Entwürfe und dürfen **umgeschrieben** werden.
- **Durchgehend duzen** (im Figma gemischt „du“/„Sie“).
- Ton: herzlich, bodenständig, dorfnah, kurz. Keine übertriebenen Werbefloskeln.
- Inhaltlich darauf aufbauen, was Gäste in Bewertungen loben: **intensiver Geschmack, freundlicher Service, faire Preise**. Keine Superlative, die man nicht belegen kann.
- **Keine erfundenen Fakten** (z. B. „seit 1995“, „Holzofen“, Namen) und **keine erfundenen Kundenbewertungen oder Zitate**.
- Lege alle Texte so ab, dass ich sie leicht finde und ändern kann (Content-Dateien oder eine zentrale `texte.json`).
- Zeig mir die neuen Texte in Phase 4 gesammelt zur Freigabe, **bevor** sie final eingebaut werden.

---

## 7. Speisekarte – Inhalte beschaffen

Eine aktuelle Speisekarte habe ich noch nicht. Für die Demo reicht eine ältere Version.

1. **Vorhanden im Figma** (Desktop - 12): Vorspeisen (Shrimps Cocktail, Caprese, Pizzabrot Speziale, Panini Schinken/Salami/Käse, Soßen) und Salate (Gemischter Salat, Spezial, Italienischer, Italienischer mit Thunfisch, Contadino, Hawaii, „EFFGEN“). Übernimm sie inkl. Preisen. Achtung: „Salat Hawaii“ steht doppelt drin, nur einmal übernehmen.
2. **Rest (Pizza, Nudeln, Fleischgerichte, Kindermenü)**: Ich lege (mit deiner Anleitung aus Phase 0 B) Screenshots von Speisekarten-Fotos aus den Google-Bewertungen in den Ordner `docs/speisekarte-fotos/`. Lies diese Bilder und übertrage die Gerichte in `speisekarte.json`.
   - Google Maps lässt sich in der Regel nicht automatisch auslesen. Versuch es also gar nicht erst per Scraping, sondern arbeite mit den Screenshots.
   - Falls die Screenshots noch nicht da sind: Lege pro Kategorie 3–4 klar markierte **Platzhalter-Gerichte** an (`"platzhalter": true`) und mach weiter.
   - Was auf einem Foto unleserlich ist: nicht raten, sondern als `[unleserlich]` markieren und in `OFFENE-PUNKTE.md` eintragen.
3. Allergen-/Zusatzstoff-Kürzel (im Figma klein unter den Gerichten) übernehmen, falls lesbar, plus Legende auf der Seite.
4. Unter der Karte der Hinweis: „Stand: [Datum]. Preise und Angebot können abweichen.“

---

## 8. Responsive / Mobile

Es gibt **kein** Mobile-Design in Figma. Leite es selbst aus dem Desktop-Design ab:
- Breakpoints etwa: 375 px (Handy), 768 px (Tablet), 1024 px, 1440 px, 1920 px (Figma-Referenz).
- **Mobile first**. Die meisten Besucher kommen vom Handy und wollen schnell anrufen.
- Header mobil: Logo + Burger-Menü + gut erreichbarer **Anruf-Button**. Zusätzlich eine **feste „Anrufen / WhatsApp“-Leiste unten** auf kleinen Screens.
- Karten-Raster (2 Spalten) → 1 Spalte. Lieferzonen als Liste.
- Speisekarte mobil: Gericht + Preis oben, Beschreibung darunter. Kategorie-Navi horizontal scrollbar und sticky.
- Mockup-Deko-Bilder mobil verkleinern oder weglassen, damit nichts überlappt.
- Zeig mir Screenshots von Mobile-, Tablet- und Desktop-Ansicht zur Abnahme.

---

### Design-Regeln: Apple Human Interface Guidelines
Figma bestimmt die **Optik** (Farben, Schriften, Karten, Bilder). Die **Bedienung** richtet sich nach den [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines), vor allem mobil:
- **Tippflächen** mindestens 44 × 44 px, genug Abstand zwischen tippbaren Elementen.
- **Lesbarkeit:** Fließtext mobil mindestens 17 px, nichts unter 12 px; Schriftgrößen in `rem`, damit die System-Schriftgröße greift.
- **Hierarchie & Klarheit:** ein klarer Haupt-Call-to-Action pro Bildschirm, keine doppelten Elemente (z. B. Logo oder Anruf-Button nicht zweimal sichtbar).
- **Navigation wie iOS:** großer Titel im Inhalt, kompakte Leiste beim Scrollen („Large Title“-Muster); Menü als Vollbild-Liste mit großen Zeilen.
- **Daumenzone:** wichtige Aktionen (Anrufen, WhatsApp) unten erreichbar; Safe Areas (`env(safe-area-inset-*)`) beachten.
- **Raster:** Abstände im 8-px-Raster, Seitenränder mobil 16–20 px.
- **Konzentrische Ecken:** Liegt ein abgerundetes Element in einem anderen, gilt äußerer Radius = innerer Radius + Abstand. Umsetzung: Karten setzen `--karte-innen` (Innenabstand), der Radius ergibt sich daraus (`--karte-innen` + `--radius-innen` 20 px); innere Buttons/Badges nutzen `--radius-innen` bzw. Kapselform.
- **Feedback:** sichtbare Reaktion beim Antippen (`:active`), nicht nur Hover.
- **Materialien:** schwebende Leisten mit leicht durchscheinendem, unscharfem Hintergrund (`backdrop-filter`), mit Fallback.
- **Bewegung:** dezent, `prefers-reduced-motion` respektieren.

---

## 9. Funktionen im Detail

- **Lieferzonen-Suche**: Eingabe eines Ortsnamens filtert die Zonen live und hebt den Treffer hervor (Groß-/Kleinschreibung und Umlaute egal, Teilwörter erlaubt). Kein Treffer → „Dein Ort ist nicht dabei? Ruf uns an, wir liefern gerne auf Anfrage.“ Funktioniert nur mit Ortsnamen, keine echte Adress-/Geodaten-Suche.
- **„Jetzt geöffnet / geschlossen“-Anzeige** auf Basis von `oeffnungszeiten.json`, Zeitzone Europe/Berlin. Ohne JavaScript werden einfach nur die Zeiten angezeigt.
- **Hinweis-Banner** (z. B. Betriebsurlaub) aus `hinweis.json`, an/aus schaltbar.
- **Anrufen / WhatsApp**: `tel:`- und `wa.me`-Links, auf Desktop zusätzlich die Nummer gut lesbar.
- **„Auf Karte anzeigen“**: externer Link, öffnet in neuem Tab.

### Qualität
- Barrierefreiheit: semantisches HTML, Alt-Texte, sichtbarer Fokus, ausreichender Kontrast (weiße Schrift auf Rot/Grün prüfen und notfalls nachjustieren), Tastaturbedienung für Menü und Suche.
- Performance: Lighthouse **≥ 90** in allen Kategorien (mobil). Bilder optimiert und lazy geladen.
- SEO-Grundlagen (für später): Seitentitel, Meta-Beschreibungen, Open-Graph-Bild, `schema.org/Restaurant` als JSON-LD. In der Demo trotzdem `noindex`.

---

## 10. Datei `docs/OFFENE-PUNKTE.md`

Führe diese Liste während des ganzen Projekts. Sie ist meine Checkliste für das Gespräch mit dem Inhaber. Startinhalt:
- [ ] Impressum-Angaben (Name/Rechtsform, Inhaber, Anschrift, Kontakt, ggf. USt-IdNr.)
- [ ] Verantwortlicher für die Datenschutzerklärung
- [ ] WhatsApp-Nummer bestätigen
- [ ] E-Mail-Adresse / Domain-Wunsch (z. B. pizzeria-herrstein.de)
- [ ] Aktuelle Speisekarte inkl. Preise, Allergene und Zusatzstoffe
- [ ] Lieferzonen 6–8 und alle Lieferpreise bestätigen
- [ ] Mindestbestellwert und Firmen-Lieferung bestätigen
- [ ] Echte Fotos (Pizzen, Laden, Team)
- [ ] Logo als Original-Datei
- [ ] Wer pflegt die Inhalte später (Login für CMS)?

---

## 11. Phasen

### Phase 0 – Vorbereitung (gemeinsam mit mir)
Zwei Dinge muss ich selbst erledigen. Führe mich Schritt für Schritt durch und prüfe am Ende, ob alles geklappt hat.

**A) Figma-MCP-Server in Claude Code einrichten** (wird ab Phase 2 gebraucht)
1. Prüfe mit `claude mcp list`, ob schon ein Figma-MCP-Server verbunden ist. Wenn ja, teste ihn: Lies mit seinen Tools die Metadaten der Datei `SACZ3Me42J7j9lkiWhkGJY` und mach einen Screenshot von Frame `1:770`. Klappt das, ist A erledigt.
2. Falls nicht: Schlag die **aktuelle offizielle Anleitung** von Figma zum MCP-Server für Claude Code nach (Remote-Server oder Desktop-Server), statt einen Befehl aus dem Gedächtnis zu raten. Sag mir genau, welchen Befehl ich ausführen und was ich im Browser bzw. in der Figma-App anklicken muss (Login/Autorisierung).
3. Weise mich darauf hin, dass ich Claude Code danach eventuell neu starten muss. Teste anschließend wie in Schritt 1.
4. Wenn es nicht klappt: Hilf mir bei der Fehlersuche (Login, Berechtigung auf die Datei, Figma-Plan). Als Notlösung kann ich PNG-Exporte der Frames `1:770` und `1:1028` in `docs/figma-export/` legen.

**B) Speisekarten-Fotos aus Google besorgen** (wird in Phase 5 gebraucht, blockiert nichts davor)
1. Lege den Ordner `docs/speisekarte-fotos/` an.
2. Erkläre mir kurz, wie ich vorgehe:
   - Google Maps öffnen und nach „Pizzeria Turnhalle Herrstein“ suchen.
   - Den Bereich **Fotos** öffnen. Wenn es dort einen Reiter **„Speisekarte“** gibt, diesen nehmen, sonst die Fotos aus den Bewertungen durchsehen.
   - Jede Seite der Karte **möglichst groß und scharf** als Screenshot speichern (am Desktop am besten ins Bild hineinzoomen). Lieber mehrere Teil-Screenshots als einen unleserlichen.
   - Wenn möglich, das Datum des Fotos notieren, damit wir wissen, wie alt der Stand ist.
   - Dateien benennen wie `pizza-1.png`, `pizza-2.png`, `nudeln-1.png`, `fleisch-1.png`, `kinder-1.png` (oder einfach durchnummerieren) und in den Ordner legen.
3. Sobald ich Bescheid gebe: Schau dir die Bilder an und sag mir, welche gut lesbar sind, welche Kategorien noch fehlen und wo ich besser nochmal einen schärferen Screenshot mache.
4. Falls ich das erst später schaffe: Mach mit Phase 1 weiter und erinnere mich vor Phase 5 daran.

**Checkpoint:** Figma-Zugriff funktioniert (oder Notlösung steht), Status der Speisekarten-Fotos ist klar.

### Phase 1 – Setup
- Astro-Projekt anlegen, Git initialisieren, sinnvolle `.gitignore`, `README.md` (wie starte ich lokal, wie deploye ich, wo ändere ich Inhalte).
- `src/config.ts` mit `DEMO_MODE = true`.
- Content-Dateien mit den Daten aus Abschnitt 5 anlegen.
- `docs/OFFENE-PUNKTE.md` anlegen.
- **Checkpoint:** Projekt läuft lokal (`npm run dev`).

### Phase 2 – Design-Grundlagen aus Figma
- Figma-Frames lesen, Tokens ableiten, Schriften selbst hosten, Assets exportieren und optimieren.
- Basis-Layout: Header, Footer, Demo-Balken, Container, Buttons, Karten-Komponente.
- **Checkpoint:** Screenshot Header + Footer + eine Beispielkarte, Vergleich mit Figma.

### Phase 3 – Startseite
- Alle Abschnitte aus Abschnitt 3 als Komponenten, Daten aus Content-Dateien.
- Lieferzonen-Suche, Öffnungsstatus, Anker-Navigation mit sanftem Scrollen.
- Vorerst die Figma-Texte verwenden.
- **Checkpoint:** Desktop-Screenshot neben dem Figma-Screenshot von `1:770`, Abweichungen auflisten.

### Phase 4 – Texte überarbeiten
- Alle Texte nach Abschnitt 6 neu schreiben und mir **gesammelt in einer Übersicht zeigen** (alt → neu).
- Nach meinem OK einbauen.

### Phase 5 – Speisekarte
- Seite `/speisekarte` nach Figma `1:1028`. Fehlende Kategorien im gleichen Stil gestalten (Karten abwechselnd rot/grün).
- Inhalte nach Abschnitt 7.
- **Checkpoint:** Screenshot + Liste aller Platzhalter und unleserlichen Stellen.

### Phase 6 – Mobile, Rechtliches, Feinschliff, Demo-Deployment
- Responsive nach Abschnitt 8.
- Impressum, Datenschutz, 404.
- Accessibility- und Lighthouse-Check, Probleme beheben.
- **GitHub Pages**: GitHub-Actions-Workflow für Astro, `site` und `base` in `astro.config` korrekt setzen (Repo-Unterpfad!). Prüfen, dass alle Links und Bilder mit dem Base-Path funktionieren.
- Mir erklären, welche Schritte ich auf GitHub selbst machen muss (Repo anlegen, Pages aktivieren).
- **Checkpoint:** Demo-Link funktioniert, Screenshots mobil/tablet/desktop, Lighthouse-Ergebnisse.

### Phase 7 – Später: Livegang (erst wenn der Inhaber zusagt, jetzt NICHT umsetzen)
Nur als Ausblick, damit die Architektur schon passt:
- Hosting umziehen (z. B. Netlify oder Cloudflare Pages), Domain auf den Inhaber registrieren, `DEMO_MODE = false` (Indexierung an, Demo-Balken aus).
- **Git-basiertes CMS** mit Login für den Inhaber einrichten (z. B. Decap CMS oder Pages CMS; zu dem Zeitpunkt prüfen, was aktuell am einfachsten ist). Bearbeitbar sein sollen: Speisekarte, Preise, Öffnungszeiten, Lieferzonen, Hinweis-Banner. Das Formular muss so einfach sein, dass jemand ohne Technikwissen damit klarkommt.
- Impressum/Datenschutz mit echten Daten, rechtlich prüfen lassen.
- **Mehrsprachigkeit** (Wunsch des Nutzers): weitere Sprachen ergänzen. Deshalb liegen ab Phase 4 **alle** sichtbaren Texte und aria-Labels zentral in `src/content/texte.json` (Deutsch); weitere Sprachen später als eigene Datei je Sprache mit denselben Schlüsseln.
- Echte Fotos und aktuelle Speisekarte einpflegen.

---

## 12. Arbeitsregeln für Claude Code
- Nach jeder Phase stoppen und auf mein OK warten.
- Kleine, sinnvolle Git-Commits mit deutschen Commit-Messages.
- Bei Unklarheiten im Design: lieber kurz fragen als stark vom Figma abweichen. Kleine Verbesserungen (Abstände, Kontrast, Mobile) sind ausdrücklich erlaubt, aber erwähne sie.
- Nichts erfinden, was der Inhaber bestätigen muss. Stattdessen `[TODO]` setzen und in `OFFENE-PUNKTE.md` eintragen.
- Keine externen Dienste einbinden, die Daten der Besucher übertragen (Google Fonts, Maps-Embed, Analytics), ohne mich zu fragen.
