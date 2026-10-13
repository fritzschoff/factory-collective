# Concept. ( ) Collective — Website

Komplette Website als Code: 99 Seiten (Home, Menü, Atelier, Fashion, Bags, Jewellery, Scan Series, Factory + Texte, Studio + Werke, Campaigns, Bag/Checkout, About, Kontakt, Info-Seiten, 404), Warenkorb, Stripe-Checkout, Suche, Anfrage-Formular, Newsletter.
Gezeichnet ist alles bei **1440 px Design-Breite** und skaliert fließend bis Tablet und Smartphone (390 px).

> **Das Wichtigste in drei Sätzen**
> 1. `npm install && npm run dev` — die Seite läuft sofort, mit Beispielbildern und „€ [price]".
> 2. Jedes Bild ist ein **Slot** (z. B. `fashion/JK-001`). Datei `public/images/fashion/JK-001.jpg` ablegen → ersetzt das Beispielbild beim nächsten Build. Es ändert sich kein Code. Alle Slots mit Format und Größe stehen in `IMAGE-SLOTS.md`.
> 3. Produkte und Preise legt die Inhaberin in **Stripe** an (Metadaten-Feld `cfc_code`), `npm run stripe:sync` holt Preise und Bilder in die Seite, der Checkout läuft über Stripe.

---

## 1 Schnellstart

Voraussetzung: Node ≥ 20.6.

```bash
npm install
cp .env.example .env        # nur nötig für Stripe / Mail; zum Anschauen nicht
npm run dev                 # http://localhost:3000, baut bei jeder Änderung neu + Live-Reload
```

| Befehl | Was er tut |
|---|---|
| `npm run dev` | Entwicklungsserver, Rebuild + Reload bei Änderungen in `src/`, `public/`, `data/` |
| `npm run build` | Produktions-Build nach `dist/` (HTML pro Seite, CSS/JS mit Hash, Bildvarianten) und `dist-server/server.mjs` |
| `npm start` | Startet den Server (`dist-server/server.mjs`): liefert `dist/` aus + `/api/*` |
| `npm run typecheck` | TypeScript-Prüfung (strict) |
| `npm run test:links` | Prüft alle internen Links, Anker und Dateien in `dist/` |
| `npm run images:report` | Schreibt `IMAGE-SLOTS.md` neu |
| `npm run build:placeholders` | Build ganz ohne Bilder (leere Platzhalter) — zeigt die Seite „nackt" |
| `npm run stripe:seed` | Legt alle Produkte in Stripe an (siehe 3) |
| `npm run stripe:sync` | Liest Preise und Bilder aus Stripe in die Seite (siehe 3) |

## 2 Technik in Kürze

* **React 19, serverseitig zu statischem HTML gerendert** (`renderToStaticMarkup`, ein `index.html` pro Route). Kein Framework-Overhead, keine Hydration: Die Seite ist sofort da. Interaktion (Menü, Suche, Warenkorb, Galerie, Filter) steckt in **einer** kleinen Datei: `src/client/main.ts` (≈ 15 KB, kein React im Browser).
* **Gebündelt mit esbuild** (`scripts/build.mjs`). Bildvarianten (WebP 480/960/1600) erzeugt `sharp`.
* **Node-Server ohne Abhängigkeiten** (`server/index.ts`): statische Dateien (Brotli/Gzip, Cache-Header, CSP und Security-Header) und die API: `/api/checkout`, `/api/stripe-webhook`, `/api/enquire`, `/api/newsletter`, `/api/health`. Rate-Limit und Honeypot-Felder sind eingebaut.
* **Warum nicht Next.js?** Die Entwicklungsumgebung, in der der Code entstand, hatte keinen Zugriff auf die npm-Registry; ein Next-Projekt hätte sich dort nicht bauen und testen lassen. Alles hier ist getestet. Wer lieber Next.js/Astro hat: `src/pages/*.tsx` und `src/components/*.tsx` sind reine React-Komponenten ohne Server-Abhängigkeit, `src/content/*.ts` ist reine Daten — beides lässt sich 1:1 übernehmen. `src/ssr/entry.tsx` ist die Routentabelle.

### Ordner

```
src/content/    catalog.ts (alle Produkte, Optionen, Texte), nav.ts (Menü), texts.ts (Factory-Texte), site.ts (Name, Mail, Instagram), samples.ts (Beispielbilder)
src/pages/      eine Datei pro Bereich: home, atelier, series, product, factory, studio, campaigns, info
src/components/ ui.tsx (Zeichen, Klammerfenster, Linse, Marken), layout.tsx (Band, Menü, Suche, Footer), shop.tsx, blocks.tsx, quiet.tsx, source.tsx
src/styles/     tokens.css (Farben, Abstände) · sign.css · band.css · menu.css · marks.css · components.css · pages.css · responsive.css
src/client/     main.ts (Browser-Skript)
src/ssr/        entry.tsx (Routentabelle, Sitemap, Suchindex)
server/         index.ts (Server + API)
scripts/        build, dev, stripe-seed, stripe-sync, check-links, measure-font
public/         fonts/, images/ (hier kommen die echten Bilder hin), favicon.svg
data/           prices.json (optional), stripe-catalog.json (von stripe:sync), *.jsonl (Bestellungen, Anfragen, Newsletter — zur Laufzeit)
```

## 3 Bilder — so tauscht man Platzhalter gegen echte Fotos

**Prinzip:** Im Code steht nirgends ein Dateiname, sondern ein **Slot-Schlüssel**: der Pfad unter `public/images/` ohne Endung.

| Slot | Datei |
|---|---|
| `fashion/JK-001` | `public/images/fashion/JK-001.jpg` (oder .png / .webp / .avif) |
| `fashion/SH-001-2` (2. Bild der Galerie) | `public/images/fashion/SH-001-2.jpg` |
| `bags/BG-114` | `public/images/bags/BG-114.jpg` |
| `art/CI-07` | `public/images/art/CI-07.jpg` |
| `art/LP-02-1` … `-3` (die drei Zustände) | `public/images/art/LP-02-1.jpg` … |
| `campaign-01/look-01` | `public/images/campaign-01/look-01.jpg` |
| `home/hero-1`, `studio/hero-ci` … | entsprechend |

**Auflösungsreihenfolge** (`IMAGES=local`, Standard):

1. Datei in `public/images/<slot>.*`
2. Bild am Stripe-Produkt (heruntergeladen oder per URL)
3. Beispielbild (`public/images/_sample/…`, nur zum Anschauen)
4. Leerer Platzhalter: gestrichelte Diagonalen, Slot-Name und empfohlene Pixelgröße im Feld

`IMAGES` in `.env`:

* `local` — wie oben
* `stripe` — Stripe-Bilder haben Vorrang vor lokalen Dateien
* **`strict` — nur echte Bilder. Beispielbilder werden nie benutzt. Zum Launch einstellen.**
* `placeholders` — alles leer

**`IMAGE-SLOTS.md`** wird bei jedem Build erzeugt: alle 126 Slots, Seitenverhältnis, empfohlene Pixelbreite (2× Anzeigebreite), auf welchen Seiten das Bild steht und ob es schon echt, ein Beispiel oder leer ist. Das ist die Bestell-/Fotoliste.

Hinweise für die Fotografie:
* JPG, sRGB, Qualität 80–85, so groß wie in der Liste. Der Build macht daraus selbst WebP-Varianten (`srcset`).
* Das Bild wird auf das Seitenverhältnis des Slots zugeschnitten (`object-fit: cover`). Motiv in die mittlere Drittel. Den Bildausschnitt je Produkt steuert `pos` in `src/content/catalog.ts`.
* Objekte auf Grund (Scan Series, Schmuck) werden **ganz** auf Papiergrund gezeigt — neutraler Hintergrund fotografieren.
* Weitere Galeriebilder: im `catalog.ts` beim Produkt unter `images` einen Slot ergänzen (z. B. `'fashion/JK-004-2'`); die Galerie mit Vorschaubildern erscheint automatisch ab 2 Bildern.

### Bilder aus Stripe

`npm run stripe:sync -- --download` lädt die Stripe-Produktbilder nach `public/images/_stripe/<slot>.<ext>`; die Seite liefert sie dann selbst aus (skaliert, mit `srcset`) statt von Stripe. Zuordnung: das n-te Bild des Stripe-Produkts ist der n-te Slot des Produkts (`JK-001`, `JK-001-2`, …). Ohne `--download` werden die Stripe-URLs direkt benutzt.

## 4 Stripe

### Produkte anlegen

* Variante A (empfohlen): `npm run stripe:seed -- --dry` zeigt, was angelegt würde; `npm run stripe:seed` legt **alle 80 Produkte** (Fashion, Bags, Jewellery, Scan Series, je Kunstwerk Poster + Archival Print) mit Name, Beschreibung und dem Metadaten-Feld `cfc_code` an. Preise: in `data/prices.json` eintragen (EUR, ganze Zahlen, Beispiele stehen in der Datei) — dann legt das Skript auch die Preise an. `--update` aktualisiert bestehende Produkte.
* Variante B: Produkte von Hand im Stripe-Dashboard anlegen. **Entscheidend:** am Produkt das Metadaten-Feld **`cfc_code`** setzen, genau wie im Code: `JK-001`, `SH-001`, `BG-114`, `BR-A`, `OB-011`, bei Kunstdrucken `CI-07.P` (Poster) und `CI-07.A` (Archival). Die vollständige Liste der Codes steht in `src/content/catalog.ts` und im Ausgang von `stripe:seed --dry`.
* Originale (Gemälde) werden nicht verkauft, sondern **angefragt** („Enquire") → `/api/enquire`.

### Preise und Bilder in die Seite holen

```bash
npm run stripe:sync        # schreibt data/stripe-catalog.json (Preis, Price-ID, Bild-URLs)
npm run build              # Preise stehen auf jeder Seite, der Checkout nutzt die echten Price-IDs
```

Preisquelle in dieser Reihenfolge: `data/stripe-catalog.json` (Stripe) → `data/prices.json` (manuell) → `DEMO_PRICES=1` (nur Entwicklung, Beispielpreise) → „€ [price]". Ein Produkt ohne Preis kann nicht in den Warenkorb-Checkout; der Server meldet das freundlich.
Mit Demo-Preisen gebaute Seiten nehmen **keine echten Bestellungen** an (nur mit `sk_test_`-Schlüssel).

### Checkout

Warenkorb liegt im Browser (`localStorage`, Schlüssel `cfc.bag.v1`). „Checkout" sendet Produkt-IDs, Mengen und Optionen an `/api/checkout`. **Preise werden nie vom Browser übernommen**, der Server liest sie aus dem Katalog. Er erzeugt eine Stripe-Checkout-Session (Hosted Checkout) mit Versandadresse, Telefon, Promo-Codes; gewählte Optionen (Größe, Farbe, Zustand, Monogramm …) stehen in den Session-Metadaten `item_1`, `item_2` …

Umgebungsvariablen (`.env.example` ist kommentiert):

| Variable | Zweck |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_test_…` zum Bauen, `sk_live_…` zum Launch. Nur auf dem Server. |
| `STRIPE_WEBHOOK_SECRET` | Signing-Secret des Webhooks `https://<domain>/api/stripe-webhook` |
| `SITE_URL` | öffentliche Adresse (Sitemap, Canonical, Stripe-Rücksprung) |
| `SHIPPING_COUNTRIES` | Länder, in die Checkout liefert (ISO-Codes) |
| `STRIPE_SHIPPING_RATES` | optional: `shr_…`-IDs der Versandtarife |
| `STRIPE_AUTOMATIC_TAX` | `1` = Stripe Tax berechnet Steuern |

### Webhook

Im Stripe-Dashboard einen Endpoint auf `/api/stripe-webhook` anlegen mit den Ereignissen `checkout.session.completed`, `product.created`, `product.updated`, `price.created`, `price.updated`.
Der Server prüft die Signatur (HMAC-SHA256, 5 min Toleranz) und
* hängt jede Bestellung an `data/orders.jsonl` an, sendet sie optional an `ORDER_WEBHOOK_URL` und per Mail (Resend),
* ruft bei Produkt-/Preisänderungen `REBUILD_HOOK_URL` (z. B. Deploy-Hook von Vercel/Netlify/GitHub Actions) auf — gebündelt (30 s Entprellung) —, damit die statischen Seiten neue Preise zeigen. Wer den Node-Server auf einer VM betreibt, kann stattdessen per Cron `npm run stripe:sync && npm run build` laufen lassen.

### Anfragen & Newsletter

`/api/enquire` (Anfrage zu Originalen + Kontaktformular) und `/api/newsletter` schreiben in `data/*.jsonl`; zusätzlich per Mail (`RESEND_API_KEY`, `ENQUIRY_TO`, `MAIL_FROM`) und/oder an `NEWSLETTER_WEBHOOK_URL` (z. B. Mailchimp/Brevo-Zapier). Spam-Schutz: Honeypot-Feld `company`, Rate-Limit je IP.

## 5 Inhalte ändern

* **Produkte, Optionen, Preise der Optionen, Beschreibungen, Akkordeon-Texte:** `src/content/catalog.ts`
* **Kunstwerke (19 Werke: CI-01…15, LP-01…04) und ihre Kaufoptionen:** unten in `catalog.ts` (`WORKS`)
* **Menü / Navigation:** `src/content/nav.ts` (jede Ebene des Menüs ist direkt verlinkt)
* **Factory-Texte T01/T02 und Glossar:** `src/content/texts.ts`
* **Name, Tagline, Mail, Instagram:** `src/content/site.ts`
* **Seitenaufbau:** `src/pages/*.tsx` — die Bausteine (`Sp`-Abstände, `Plate`, `Lens`, `Opening`, `SectionAA`, `AxisV` …) stehen in `src/components/ui.tsx`.

Fehlt ein Produkt (noch) → in `catalog.ts` ergänzen, `npm run build`: Seite, Sitemap, Suche, Menü und Stripe-Zuordnung entstehen automatisch.

## 6 Designsystem (aus dem Plan übernommen)

* Raster bei 1440: Satzkante links 96, rechts 1344, Bildspalte 768 / Textspalte 368, Vollbild-Elemente von 10 bis 1430. Tokens: `--gut`, `--edge`, `--page` in `src/styles/tokens.css`.
* **Genau vier vertikale Abstände:** 72 · 156 · 272 · 440 (`--g-s/-m/-l/-xl`, Klassen `sp-s/m/l/xl`). Bitte nicht „ausgleichen".
* Farben: `--ink #0B0B0B`, `--red #D2141C` (nur Zeichen, leere Klammern ( ), „noch nicht", Schnittlinie A—A), `--grey #6B6A66`, `--paper #F4F3F1`.
* **Das Zeichen** (`.sign`) ist reines CSS (Container-Query-Einheiten), skaliert über die ganze Breite. Das Fenster zwischen den Klammern ist ausgeschnitten; darunter läuft das erste Bild der Seite durch und wandert beim Scrollen (Parallax, `data-par`). Die Fensterform stammt aus der gemessenen Schrift (`src/lib/font-metrics.json`, erzeugt von `scripts/measure-font.py`, Ausgabe `src/styles/generated/bwin.css`).
* Marken über Bildern (Achsen, Schnitt A—A, Höhenkoten, Durchbruch-Kapseln, Fahnen) sind SVG/HTML in Prozentkoordinaten, siehe `src/components/ui.tsx`.
* Kein grauer Grund, kein Rahmen um Klammerfenster — nur Bild zwischen den Klammern.

## 7 Deployment

**Node-Server (einfachster Weg)** — VM, Render, Railway, Fly …:
```bash
npm ci && npm run build && npm start     # PORT, SITE_URL, Stripe-Variablen in der Umgebung
```
`data/` muss beschreibbar und persistent sein (Bestellungen, Anfragen).

**Statisch + Funktionen** — `dist/` auf ein CDN legen und `server/index.ts` als Funktionen betreiben (vier Handler: checkout, webhook, enquire, newsletter; sie sind in sich geschlossen). `REBUILD_HOOK_URL` löst dann den Neu-Build aus.

Vor dem Launch: `IMAGES=strict`, echte `STRIPE_*`-Schlüssel, `DEMO_PRICES=0`, `SITE_URL` setzen, Webhook einrichten, `npm run test:links`.

## 8 Bekannte Abweichungen und offene Punkte

1. **Kopf (Band):** Im Plan steht das große Band mit dem Zeichen auf jeder Seite oben. Im Code läuft das große Band beim Scrollen weg und eine **schmale Leiste** (Zeichen klein, Navigation, Search, Bag) bleibt oben stehen — sonst würde das 166 px hohe Band auf jedem Bildschirm Platz fressen. Umschalten per `html.is-compact` in `src/client/main.ts` (IntersectionObserver); wer das große Band lieber fest oben haben will, entfernt den Block „compact bar“ in `main.ts` und die `.bar` in `layout.tsx`.
2. **Schriften:** Der Plan benutzt Arial Black / Arial. Mitgeliefert sind die offenen Ersatzschriften **Archivo Black** (Titel) und **Arimo** (Fließtext, metrisch Arial-gleich), Lizenzen in `public/fonts/`. Bei Wechsel auf Arial Black: Datei in `public/fonts/` tauschen, `tokens.css` anpassen, danach `python3 scripts/measure-font.py` (Python + playwright) und `npm run build`, damit die Klammerfenster zur neuen Schrift passen — und die Lizenz der Schrift prüfen.
3. **Sprache:** nur Englisch. Der DE/EN-Schalter im Footer ist noch nicht verdrahtet; Texte stehen in `catalog.ts`/`texts.ts` und sind für i18n isoliert.
4. **Rechtstexte:** Imprint, Privacy und Terms sind **Platzhalter** und müssen von der Inhaberin/Kanzlei ersetzt werden (`src/pages/info.tsx`). Gleiches für Versand-, Rückgabe- und FAQ-Texte, soweit sie Zusagen machen (Lieferzeiten, 30 Tage Rückgabe).
5. **Platzhalter im Inhalt:** `0??`-Stücknummern, `[ place ]`, `[ year ]`, `[ campaign title ]`, „€ [price]" bleiben, bis echte Daten da sind (so im Plan vorgesehen). Die rot gestrichelten leeren Felder (Furniture, Rings, Outerwear, weitere Taschen, Campaign ( 03 ) …) sind Teil des Konzepts und bleiben sichtbar.
6. **Links „Film" / „Behind the set"** in Campaign 01 zeigen vorerst auf `/journal/`.
7. **Cookie-Banner:** keiner nötig — die Seite setzt keine Cookies, kein Tracking. Wird Analytics ergänzt, Einwilligung einbauen. Der Warenkorb liegt im `localStorage`.
8. Browser: aktuelle Versionen von Chrome, Safari (ab 16), Firefox, Edge.

## 9 Qualität (vor Übergabe geprüft)

* `tsc --noEmit` ohne Fehler (strict), `npm run test:links`: 99 Seiten, 9 276 Links, 10 673 Dateien — keine toten Links/Anker.
* Seiten bei 1440 px und 390 px gerendert und geprüft, kein horizontaler Überlauf.
* Checkout, Webhook-Signatur, Anfrage-Formular, Newsletter, `stripe:sync` mit Bildern und Preisen gegen einen Test-Server geprüft. Ein Durchlauf mit echtem Stripe-Testkonto (`sk_test_…`) ist vor dem Launch Pflicht, da hier kein Zugriff auf api.stripe.com bestand.
