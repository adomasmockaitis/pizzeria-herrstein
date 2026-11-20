# Pizzeria Turnhalle Herrstein (Demo)

Demo-Website für die **Pizzeria Turnhalle Herrstein** auf Basis von Astro.

## Voraussetzungen

- Node.js ≥ 22

## Lokal starten

```bash
npm install
npm run dev
```

Die Seite läuft anschließend unter `http://localhost:4321`.

## Bauen & Vorschau

```bash
npm run build
npm run preview
```

## Inhalte ändern

Alle Inhalte liegen als JSON-Dateien in `src/content/`:

| Datei | Inhalt |
|---|---|
| `src/content/kontakt.json` | Name, Adresse, Telefon, WhatsApp, E-Mail, Karten-Links |
| `src/content/oeffnungszeiten.json` | Zeitzone, reguläre Öffnungszeiten, Ruhetag, Sonderzeiten |
| `src/content/lieferzonen.json` | Lieferzonen, Orte, Preise, Mindestbestellwert, Hinweise |
| `src/content/hinweis.json` | Optionaler Hinweis-Banner (z. B. Betriebsurlaub) |
| `src/content/allergene.json` | Legende für Allergene und Zusatzstoffe |
| `src/content/speisekarte.json` | Kategorien und Gerichte der Speisekarte |
| `src/content/texte.json` | Sichtbare Texte und Navigation der Startseite |

## Demo-Modus

In `src/config.ts` steuert `DEMO_MODE`:

- `true`: Suchmaschinen werden blockiert (`noindex, nofollow` und `robots.txt` mit `Disallow: /`) und der Demo-Hinweisbalken wird angezeigt.
- `false`: Indexierung erlaubt, Demo-Hinweisbalken ausgeblendet.

## Deployment

Folgt in Phase 6 (GitHub Pages).
