# Pizzeria Turnhalle Herrstein (Demo)

Demo-Website für die **Pizzeria Turnhalle Herrstein** auf Basis von Astro.

## Voraussetzungen

- Node.js ≥ 22

## Lokal starten

```bash
npm install
npm run dev
```

Die Seite läuft anschließend unter `http://localhost:4321/pizzeria-herrstein/`.

## Bauen & Vorschau (lokal mit Base-Path testen)

```bash
npm run build
npm run preview
```

Die gebaute Vorschau ist danach lokal unter `http://localhost:4321/pizzeria-herrstein/` (bzw. dem in der Konsole angezeigten Port) erreichbar. So lassen sich alle Unterpfad-Links, Assets und Seitenübergänge exakt wie auf GitHub Pages prüfen.

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

## Demo veröffentlichen (GitHub Pages)

Der GitHub-Actions-Workflow liegt bereits unter `.github/workflows/deploy.yml` und baut die Website automatisch bei jedem Push auf `main` (oder manuell über **Actions → Run workflow**).

### Einmalige Schritte auf GitHub

1. Ein **öffentliches** Repository mit dem Namen `pizzeria-herrstein` unter dem Account `adomasmockaitis` anlegen.
2. Das lokale Projekt auf den Branch `main` pushen.
3. Im Repository unter **Settings → Pages → Build and deployment → Source** den Eintrag **GitHub Actions** auswählen.
4. Im Reiter **Actions** warten, bis der Workflow **Deploy auf GitHub Pages** erfolgreich durchgelaufen ist.
5. Die Demo im Browser testen: `https://adomasmockaitis.github.io/pizzeria-herrstein/` (insbesondere Startseite, `/speisekarte/`, Kategorie-Anker, Zurück-Link und Bilder).

### Hinweis zu `robots.txt` unter einem Unterpfad

Bei GitHub Pages unter einem Repository-Unterpfad (`/pizzeria-herrstein/`) lesen Suchmaschinen-Bots `/pizzeria-herrstein/robots.txt` **nicht**, da `robots.txt` nur im Domain-Root (`https://adomasmockaitis.github.io/robots.txt`) ausgewertet wird. Den Schutz vor Indexierung im Demo-Modus übernehmen zuverlässig die `<meta name="robots" content="noindex, nofollow">`-Tags auf jeder Seite. Der Endpoint `src/pages/robots.txt.ts` bleibt unverändert im Projekt, damit er beim späteren Livegang unter eigener Domain direkt greift.

### Livegang mit eigener Domain (Site & Base per Umgebungsvariable)

Standardmäßig nutzt `astro.config.mjs` die Werte für die GitHub-Pages-Demo (`SITE=https://adomasmockaitis.github.io`, `BASE=/pizzeria-herrstein`). Für den späteren Livegang unter eigener Domain (ohne Unterpfad) lassen sich beide Werte ohne Codeänderung per Umgebungsvariable überschreiben:

```bash
# Linux / macOS
SITE=https://pizzeria-herrstein.de BASE=/ npm run build
```

```powershell
# Windows (PowerShell)
$env:SITE = "https://pizzeria-herrstein.de"
$env:BASE = "/"
npm run build
```

Bei Hosting-Anbietern wie Netlify oder Cloudflare Pages werden `SITE` und `BASE` einfach in den Build-Umgebungsvariablen hinterlegt.

## Vorschauen für Experimente

Jeder Zweig mit dem Namen `experiment/<name>` wird automatisch zusätzlich zur normalen Demo veröffentlicht:
`https://adomasmockaitis.github.io/pizzeria-herrstein/vorschau/<name>/` (Übersicht: `/pizzeria-herrstein/vorschau/`).
Die normale Demo kommt immer aus `main`. Wird ein Experiment-Zweig gelöscht, verschwindet seine Vorschau beim nächsten Deploy.
