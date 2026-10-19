# Concept. ( ) Collective — Website

Next.js 16 (App Router) auf Vercel. Backend (Checkout, Bestand, Formulare, Admin) kommt in Phase 2/3 als Firebase Functions — siehe `docs/superpowers/specs/2026-10-13-nextjs-firebase-rebuild-design.md`.

## Schnellstart

Voraussetzung: Node in der Version aus `package.json` (`engines`: `^22.13.0 || ^24.0.0 || >=26.0.0`).

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

| Befehl | Was er tut |
|---|---|
| `npm run dev` | Entwicklungsserver |
| `npm run build` / `npm start` | Produktions-Build / -Server |
| `npm test` | Unit-Tests (Vitest) |
| `npm run test:e2e` | Browser-Tests (Playwright, baut vorher) |
| `VISUAL=1 npx playwright test e2e/visual.spec.ts` | Bildschirmfotos der wichtigsten Seiten (Desktop 1440 px und Smartphone 390 px) nach `test-results/visual/` — zum Anschauen, keine Prüfung; ohne `VISUAL=1` wird die Datei übersprungen |
| `npm run typecheck` · `npm run lint` | TypeScript · ESLint |
| `npm run images:report` | Status-Spalte von `IMAGE-SLOTS.md` aktualisieren; schreibt außerdem `src/generated/image-manifest.json` neu — diese Datei bei neuen Bildern mit einchecken |
| `npm run sign:css` | Klammerfenster-CSS aus den Schrift-Messdaten neu erzeugen |
| `python3 scripts/measure-font.py` | Display-Schrift neu vermessen — nur wenn sie ersetzt wird (braucht `pip install playwright`); danach `npm run sign:css`; Achtung: das Skript lässt die Tabelle `words` weg, siehe „Header und Menü“ |

## Inhalte

* Produkte: `src/content/catalog.ts` (Phase 2: Admin + Firestore). Preise: `src/content/prices.json` (EUR) oder `DEMO_PRICES=1` für Vorschauen.
* Menü und Footer: `src/content/nav.ts` · Texte: `src/content/texts.ts` · Seiten-Metadaten: `src/content/pages.ts`.
* **Coming soon:** `src/content/soon.ts`. Status auf `'live'` setzen, sobald eine Seite Inhalt hat (Route in `src/app/(site)` wieder anlegen) — Links schalten sich überall frei, die Weiterleitung entfällt.
* Bilder: Datei `public/images/<slot>.jpg` ablegen (Slot-Liste: `IMAGE-SLOTS.md`). `IMAGES=strict` zum Launch — dann keine Beispielbilder mehr.
  Nach neuen Bildern `npm run images:report` ausführen und `IMAGE-SLOTS.md` sowie `src/generated/image-manifest.json` mit einchecken (`npm run dev` und `npm run build` erzeugen das Manifest ebenfalls selbst, eingecheckt wird es trotzdem).

## Header und Menü

* Header (Variante B): fixiert, weiß, nur zwischen den Klammern durchsichtig. Die Fensterform wird aus `src/lib/sign/font-metrics.json` berechnet (`windowShape`). Nach 40 px Scrollen klappen Kreise und Beschriftung weg.
* Menü (M2): ein Panel pro Welt, fährt über den Header; Inhalte in `src/content/nav.ts`.
* Die Tabelle `words` in `src/lib/sign/font-metrics.json` (Breite der Weltnamen in em: ATELIER, FACTORY, STUDIO, CAMPAIGN, CONCEPT, ABOUT) wird **von Hand** gepflegt. `scripts/measure-font.py` schreibt sie nicht — es schreibt die ganze Datei neu und lässt `words` dabei weg. Nach einem Lauf die Tabelle aus dem Git-Verlauf zurückholen (`git diff` prüfen) und für neue Menüwörter ergänzen.

## Tests

* `npm test` — Unit-Tests (Vitest, `src/**` und `scripts/**`).
* `npx playwright test` (oder `npm run test:e2e`) — Browser-Tests in `e2e/`. Playwright baut die Seite (`npm run build`), startet dafür einen **eigenen Server auf Port 3100** und beendet ihn am Ende; dort darf vorher nichts laufen (ein schon laufender Server auf 3100 würde wiederverwendet und alten Code testen). `E2E_DEV=1` testet stattdessen gegen `next dev`.
* `e2e/links.spec.ts` ruft alle Seiten auf und prüft jeden internen Link und jedes Bild darauf: Antwort 200, keine Weiterleitung, kein Link auf eine Coming-soon-Seite, Anker vorhanden. Jede gemeldete Zeile ist ein echter Fehler.

## Launch

* `IMAGES=strict` — nur eigene Bilder, keine Beispielbilder mehr.
* `SITE_URL` auf die echte Domain setzen (z. B. `https://www.example.com`) — daraus entstehen die kanonischen URLs und die Sitemap. Ohne `SITE_URL` nimmt ein Vercel-Production-Deployment die Production-Domain des Projekts (`VERCEL_PROJECT_PRODUCTION_URL`), jedes andere Vercel-Deployment seine eigene Adresse (`VERCEL_URL`), außerhalb von Vercel `http://localhost:3000`.
* `DEMO_PRICES` nicht setzen (oder `0`); echte Preise in `src/content/prices.json`.

## Deploy

Branch → Pull Request → Vercel-Preview → Merge nach `main`. Umgebungsvariablen siehe `.env.example`; das Repository ist öffentlich — keine Schlüssel einchecken.
