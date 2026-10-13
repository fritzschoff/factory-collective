# Concept. ( ) Collective — Umbau auf Next.js + Firebase

Stand 13.10.2026 · Status: zur Freigabe · Branch `nextjs-rebuild`

Grundlage: Brainstorming vom 12./13.10.2026 (sechs Abschnitte, jeweils freigegeben; Nachtrag: alle API-Aufrufe über Firebase Functions), Kundenfeedback vom 12.10.2026, Miro-Board „Website" inkl. „Designsprache, stille Fassung, Stand 12.10.2026" und Export `CFC-website-23-pages.pdf` (liegt lokal, nicht im Repo).

---

## 1 Ziel

Die bestehende Website (React → statisches HTML per esbuild, eigener Node-Server, 99 Seiten) wird umgebaut: **Frontend in Next.js (App Router) auf Vercel, Backend komplett auf Firebase** (Firestore, Auth, Storage, Cloud Functions). Dabei kommen hinzu:

1. ein **fixierter Header**, dessen Fenster zwischen den Klammern ( ) durchsichtig ist,
2. ein **Menü nach Loewe-Vorbild** — Panel von oben, über dem Header,
3. **„coming soon"** für alles ohne Inhalt — sichtbar, aber nicht klickbar,
4. ein **eigener Shop-Unterbau** mit Admin-Bereich für Produkte, Bestand und Bestellungen; bezahlt wird über Stripe Checkout.

**Erfolgskriterien**

- Jede bestehende URL mit Inhalt funktioniert unverändert (inkl. Schrägstrich am Ende). Entfernte Seiten leiten weiter, keine 404.
- Das Design bleibt 1:1: Raster, vier Abstände, Farben, Typografie, Marken, Linse, Klammerfenster. Neu sind nur Header, Menü und die Coming-soon-Darstellung.
- Die Inhaberin pflegt Produkte, Bilder, Preise, Varianten und Bestand selbst und sieht alle Bestellungen. Stücke mit Bestand können nicht überverkauft werden.
- **Vercel liefert nur das Frontend aus. Jeder API-Aufruf läuft über Firebase Functions** — keine Route Handler, keine Server Actions, keine Firebase-Zugangsdaten auf Vercel.
- Keine Geheimnisse im Repo (es ist öffentlich).

**Nicht Teil dieses Umbaus:** zweite Sprache (DE), Redaktionssystem für Texte/Kampagnen/Startseite, Produktdetails als Slide-in (frühe Miro-Idee — der Plan hat Akkordeons), Kundenkonten.

## 2 Ausgangslage

- Der statische Stand ist im Branch `nextjs-rebuild` als Commit `baf402c` gesichert; der frühere Next.js-Starter liegt davor in der Historie von `main`.
- Wiederverwendet werden: `src/content/*` (Katalog, Navigation, Texte), die Komponenten in `src/components/*`, die Seiten in `src/pages/*`, alle Styles in `src/styles/*`, `src/lib/font-metrics.json`, Schriften und Bilder in `public/`.
- Next.js reserviert `src/pages/` für den Pages Router → die alten Seiten-Komponenten ziehen nach `src/views/` um. `src/ssr/entry.tsx` (Routentabelle) wird durch die App-Router-Struktur plus ein Seitenregister für Suche und Sitemap ersetzt.
- `server/index.ts` (alter Node-Server) entfällt. Bekannter Mangel dort: das Rate-Limit nimmt die IP aus dem ersten `X-Forwarded-For`-Eintrag und ist damit umgehbar — in den Functions nicht wiederholen (siehe 3.3).

## 3 Systemaufbau

### 3.1 Frontend — Next.js auf Vercel

- **Next.js 16** (bei Planung 16.4), App Router, TypeScript strict, React 19, `trailingSlash: true`. Nur Seiten: statisch gebaut (SSG) bzw. mit Revalidierung (ISR). **Keine Route Handler, keine Server Actions.**
- **Redaktionelle Seiten** bleiben Code: Inhalte in `src/content/*.ts`, Seiten als Server Components, statisch gebaut.
- **Produktdaten** holt der Build von der Function `catalog`; Seiten mit Produkten revalidieren alle **60 s**. Änderungen im Admin sind damit nach spätestens etwa einer Minute online — ohne eigenen Endpunkt auf Vercel. Neue Produkte werden beim ersten Aufruf erzeugt und danach gecacht.
- **Verfügbarkeit** (Bestand) lädt der Browser frisch von der Function `availability` (Produktseite, Warenkorb).
- **Interaktion** als kleine Client Components statt des heutigen `src/client/main.ts`: Header (Scrollzustand), Menü, Suche, Warenkorb (localStorage, Schlüssel `cfc.bag.v1` bleibt), Kaufformular, Quick-Add, Galerie, Filter, Anfrage-Dialog, Formulare, Toast.
- **CSS**: `tokens`, `base`, `sign`, `marks`, `components`, `pages`, `footer`, `responsive` bleiben als globales CSS. `band.css` und `menu.css` werden durch `header.css` und `menu.css` (neu) ersetzt. Schriften (Archivo Black, Arimo) über `next/font/local`.
- **Bilder**:
  - Redaktionelle Slots bleiben Dateien unter `public/images/<slot>.jpg`, mit Beispielbild-Fallback. Schalter `IMAGES=local | strict | placeholders` (wie bisher, ohne `stripe`).
  - Produktbilder liegen im Firebase Storage.
  - Ausgabe immer über `next/image` (ersetzt die sharp-Varianten des alten Builds). `IMAGE-SLOTS.md` wird weiter per Skript erzeugt.
- **Auf Vercel nur öffentliche Werte**: `NEXT_PUBLIC_API_BASE` (Adresse der Functions), `NEXT_PUBLIC_FIREBASE_*` (Admin-Login), `SITE_URL`, `IMAGES`.
- **Fällt weg:** `server/index.ts`, `scripts/build.mjs`, `scripts/dev.mjs`, `data/*.jsonl`, `stripe:seed`, `stripe:sync`.

### 3.2 Backend — Firebase

Eigenes Projekt (Arbeitstitel `cfc-shop`), Region `europe-west3`, Blaze-Tarif (Storage und Functions verlangen ihn):

- **Firestore**, Standard-Edition (Native Mode) — Shop-Daten.
- **Firebase Auth** — nur der Admin-Login (E-Mail + Passwort), Custom Claim `admin`.
- **Cloud Storage for Firebase** — Produktbilder.
- **Cloud Functions (2nd gen, Node 22, `europe-west3`)** — alle API-Aufrufe:

| Function | Art | Zweck |
|---|---|---|
| `catalog` | HTTP GET, öffentlich | aktive Produkte für Build/Revalidierung, Warenkorb und Suche; mit Cache-Header |
| `availability` | HTTP GET, öffentlich | Bestand je Variante, ungecacht |
| `checkout` | HTTP POST | Reservierung + Stripe Checkout Session |
| `stripeWebhook` | HTTP POST | Stripe-Ereignisse (Rohdaten für die Signaturprüfung) |
| `order` | HTTP GET | Danke-Seite: Bestellung zu `session_id` |
| `enquire`, `newsletter` | HTTP POST | Anfrage-, Kontakt- und Newsletter-Formular |
| `releaseReservations` | zeitgesteuert, stündlich | liegengebliebene Reservierungen freigeben |
| `admin…` | Callable | alle Lese- und Schreibzugriffe des Admins, Upload-URLs, CSV-Export |

- **Nur Functions sprechen mit Firestore und Storage** (`firebase-admin`). Firestore- und Storage-Regeln verbieten jeden Client-Zugriff. Ausnahmen: der Firebase-Auth-Login im Browser (Admin), Bild-Uploads per signierter URL direkt in den Storage, Auslieferung der Produktbilder über Download-URLs mit Token.
- **Geheimnisse** im Firebase Secret Manager (`defineSecret`): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`. Weitere Einstellungen als Parameter: `SITE_URL`, `ALLOWED_ORIGINS`, `SHIPPING_COUNTRIES`, `STRIPE_SHIPPING_RATES`, `STRIPE_AUTOMATIC_TAX`, `ENQUIRY_TO`, `MAIL_FROM`.

### 3.3 Querschnitt

- **Gemeinsamer Kern** `packages/shop-core` (reines TypeScript): Typen, Variantenschlüssel, Preisberechnung, Eingabeprüfung (zod). Frontend und Functions benutzen dieselben Regeln; der Functions-Build bündelt das Paket mit.
- **CORS**: öffentliche HTTP-Functions akzeptieren nur `ALLOWED_ORIGINS` (Produktion, Vercel-Previews, localhost in der Entwicklung).
- **Rate-Limit** pro IP über Firestore (`ratelimits`) — Checkout 15/min, Formulare 6/min. Die IP kommt aus der vertrauenswürdigen Quelle der Google-Infrastruktur (nicht der erste, vom Client setzbare `X-Forwarded-For`-Eintrag).

**Ordner (Ziel)**

```
src/app/(site)/…        öffentliche Seiten (Layout mit Header, Menü, Footer)
src/app/admin/…         Admin-Oberfläche (Client, Deutsch)
src/content/            Redaktion wie heute + soon.ts
src/views/              die bisherigen Seiten-Komponenten (aus src/pages/)
src/components/         UI wie heute; client/ für die interaktiven Teile
src/lib/                api (Aufrufe der Functions), firebase-client (Login), images, format, sign
src/styles/             bestehendes CSS + header.css, menu.css
packages/shop-core/     gemeinsame Typen und Regeln
functions/              Firebase Functions (eigene package.json)
firebase.json · .firebaserc · firestore.rules · firestore.indexes.json · storage.rules
scripts/                seed-catalog, admin-add, check-links, images-report, measure-font
```

## 4 Header — Variante B „verdichtet sich"

- `position: fixed`, volle Breite. Aufbau wie heute: Kreise F · A · S, das Zeichen über die ganze Breite, darunter Factory / ( Atelier ) / Studio, rechts Campaigns · About; oben rechts Menu · Search · Bag ( n ).
- **Das Fenster.** Der Header ist weiß, nur zwischen den Klammern durchsichtig — dort sieht man die Seite, die darunter vorbeiscrollt, Bild oder Text. Umsetzung:
  - Die Zeichenzeile bekommt als Hintergrund ein SVG: weißes Rechteck, Fenster ausgeschnitten (`fill-rule: evenodd`).
  - Die Fensterform wird aus `src/lib/font-metrics.json` erzeugt (Innenkontur von „(" und „)"), seitlich 0,012 em unter die Glyphen erweitert, damit keine Naht entsteht. Die Zeichenzeile skaliert proportional zur Breite, deshalb genügt ein `viewBox` in em.
  - Die roten Glyphen liegen darüber, die gestrichelte Achse A läuft durchs Fenster.
  - Weiße Zeilen darüber/darunter überlappen die Zeichenzeile um 1 px (gegen Kantenflimmern).
- **Scrollen.** Ab 40 px Scrollweg klappen Kreise und Beschriftung weg (0,4 s). Menu · Search · Bag und das Zeichen in voller Breite bleiben. Höhe bei 1440 px Breite: ca. 180 px → ca. 110 px. Handy: Zeile Menu/Search/Bag ganz oben, Kreise darunter.
- **Seitenanfang.** Der Inhalt beginnt **unter** dem Header (Abstand = volle Headerhöhe, kein Springen beim Verdichten). Das Fenster zeigt, was beim Scrollen darunter vorbeizieht.
- Das Fenster folgt derselben Regel wie Linse und Menüfenster (Designsprache): kein Rand, keine Fläche, kein Schatten; Klammerhöhe = Fensterhöhe.
- Barrierefreiheit: Zeichengrafik `aria-hidden`, Navigation als echte Links/Buttons, Skip-Link bleibt.
- Referenz: Mockup `.superpowers/brainstorm/…/header-window.html` (lokal).

## 5 Menü — Variante M2 „ein Panel pro Welt"

- **Öffnen** über Menu oder über eine Beschriftung (Factory · Atelier · Studio · Campaigns · About). Ein weißes Panel fährt von oben **über den Header**; die Seite dahinter wird abgedunkelt (`rgba(11,11,11,.38)`). **Schließen**: ( Close ), Klick auf die dunkle Fläche, Esc. Fokus bleibt im Panel und kehrt danach zum Auslöser zurück.
- **Kopfzeile im Panel**: Reiter Factory · Atelier · Studio · Campaigns · About (aktiver Reiter in Klammern), rechts ( Close ) · Search · Bag ( n ). Reiterwechsel ohne Schließen. Menu öffnet die Welt der aktuellen Seite, sonst Atelier.
- **Inhalt je Welt**: bis zu vier Spalten (Gruppe → Einträge, aus `src/content/nav.ts`), rechts das **Klammerfenster** — beim Hover über eine Zeile wechseln deren Bilder im Cross-Fade alle 1,2 s, mit Beschriftung — und „Enter the …". Darunter eine Zeile mit dem Leitsatz der Welt.
- **Unten im Panel** steht das Zeichen mit durchsichtigem Fenster; es zeigt die abgedunkelte Seite.
- **Handy**: Vollbild — Menu/Search/Bag oben, Reiter darunter, Spalten untereinander, Klammerfenster oben.
- Inhalte: Anhang A. Referenz: Mockup `.superpowers/brainstorm/…/menu.html` (lokal).

## 6 Coming soon

- **Entfallen als Seiten** — die alte URL leitet vorübergehend (307) weiter (`redirects` in `next.config`):

  | Alte URL | Ziel |
  |---|---|
  | `/atelier/furniture/` | `/atelier/` |
  | `/factory/bag-profile-series/` | `/factory/` |
  | `/factory/publishing/` · `/factory/archive/` · `/factory/lectures/` | `/factory/` |
  | `/studio/exhibitions/` · `/studio/sound/` · `/studio/scenography/` · `/studio/architecture/` | `/studio/` |
  | `/journal/` | `/` |
  | `/press/` | `/about/` |

- Dazu Einträge ohne eigene Seite: Outerwear, Rings, „Six more bags", Campaign ( 03 ), Thesen T03 / T04.
- **Darstellung** überall, wo sie genannt werden (Menü, Hubs, Serienseiten, Footer, Querverweise, Register, Kacheln): rot, mit ( ), Zusatz „coming soon", strichpunktierte rote Linie, **kein Link**. Die Blöcke Exhibitions und Sound auf der Studio-Seite werden zu Coming-soon-Kästen. „Notify me" bleibt ein Link zum Kontaktformular mit vorausgewähltem Betreff.
- **Schalter**: zentrale Liste `src/content/soon.ts` (Schlüssel → Label, Ziel-URL, Status `soon | live`). Steht ein Eintrag auf `live`, wird überall verlinkt, die Seite (falls vorhanden) gebaut und die Weiterleitung entfällt.

## 7 Shop

### 7.1 Datenmodell (Firestore)

- **`products/{id}`** — IDs wie heute (`JK-001`, `BR-A`, `OB-011`, `CI-07.P`, `CI-07.A`). Felder: `kind`, `group`, `code`, `slug`, `name`, `material`, `sub`, `description`, `spec[]`, `accordions[]`, `note`, `lead`, `dims`, `inv`, `tag`, `textLink`, `work` (nur Drucke), `images[]` (Storage-Pfad, URL, Breite, Höhe, Alt, Fokuspunkt), `ground`, `priceCents`, `options[]`, `variants[]`, `status` (`draft | active | archived`), `updatedAt`, `updatedBy`. Produkte werden archiviert, nicht gelöscht (Bestellungen verweisen auf sie).
- **Optionen** sind entweder `variant` — Größe, Farbe, Metall, Glasur, Zustand; sie bilden Varianten — oder `config` — Monogramm, Riemen, Liner, Stein; ohne Bestand. Typen: `swatch | size | choice | text`.
- **Varianten** entstehen aus den Varianten-Optionen (Schlüssel z. B. `light-grey.50`), je Variante optional eigener Preis.
- **`inventory/{sku}`** — `sku` = `<productId>` oder `<productId>__<variantKey>`. `onHand`: Zahl, oder `null` = wird auf Bestellung gefertigt (unbegrenzt); `0` = ausverkauft. `reserved`: Zahl. Verfügbar = `onHand − reserved`. Getrennt vom Produkt, damit eine Textänderung nie einen gleichzeitigen Verkauf überschreibt.
- **`reservations/{id}`** — `items[{sku, qty}]`, `status` (`pending | awaiting_payment | completed | released`), `expiresAt`, `stripeSessionId`.
- **`orders/{id}`** — fortlaufende Nummer (`counters/orders`), Status (`paid → in_progress → shipped → done`, außerdem `awaiting_payment`, `cancelled`), Kunde, Lieferadresse, Telefon, Positionen inkl. Optionen und Monogramm, Beträge, Stripe-IDs, Sendungsnummer, interne Notiz, Verlauf, Flag „Bestand reichte nicht".
- **`enquiries/{id}`**, **`newsletter/{id}`**, **`ratelimits/{key}`**.

### 7.2 Checkout

1. Der Browser schickt den Warenkorb an die Function **`checkout`** (productId, Varianten- und Ausführungs-Optionen, Menge). Sie liest Produkte und Bestand frisch, prüft Status und Optionen und berechnet die Preise. Browserpreise zählen nie.
2. **Eine Transaktion**: Für jede bestandsgeführte Position muss verfügbar ≥ Menge sein, sonst Fehler mit der Restmenge. Dann `reserved += qty` und Reservierung `pending` mit `expiresAt = jetzt + 35 min`.
3. **Stripe Checkout Session**: je Position `price_data` (Name `CODE // name`, Beschreibung = Variante/Optionen, erstes Produktbild, `metadata.productId`/`sku`); `expires_at = jetzt + 30 min`; `metadata.reservationId`; Versandadresse (Länder aus Parameter), Versandtarife, Telefon, Gutscheine, optional Stripe Tax; `success_url {SITE_URL}/bag/thank-you/?session_id={CHECKOUT_SESSION_ID}`, `cancel_url {SITE_URL}/bag/`. Antwort an den Browser: die Checkout-URL. Scheitert Stripe, wird die Reservierung sofort freigegeben.
4. **Function `stripeWebhook`** (Signatur über die Rohdaten geprüft, jeder Schritt idempotent über Session- bzw. Reservierungs-ID):
   - `checkout.session.completed`, bezahlt → Transaktion: Reservierung `completed`, `onHand −= qty`, `reserved −= qty`, Bestellung anlegen, Mail an die Inhaberin.
   - `checkout.session.completed`, noch unbezahlt (verzögerte Zahlart, z. B. SEPA) → Reservierung `awaiting_payment`, Bestellung `awaiting_payment`.
   - `checkout.session.async_payment_succeeded` → wie bezahlt. `checkout.session.async_payment_failed` → Reservierung frei, Bestellung `cancelled`.
   - `checkout.session.expired` → Reservierung frei.
   - Kommt eine Zahlung zu einer schon freigegebenen Reservierung an, wird trotzdem gebucht (`onHand −= qty`); reicht der Bestand nicht, bekommt die Bestellung das Flag.
5. **Function `releaseReservations`** (stündlich) gibt `pending`-Reservierungen frei, die mehr als 1 h über ihrem Ablauf liegen (`awaiting_payment` bleibt unberührt).

- **Kein Produkt-Sync zu Stripe.** Stripe kennt nur Zahlungen mit ihren Positionen; im Dashboard werden nur Einstellungen gepflegt (Versandtarife, Steuer, Zahlungsarten, Webhook auf die Function `stripeWebhook`).
- Hinweis im Warenkorb: „Pieces are held for 30 minutes once you check out."
- Die Danke-Seite leert den Warenkorb und zeigt Bestellnummer und Positionen (Function `order` mit `session_id`).

### 7.3 Anzeige

- Produktseite: ausverkaufte Varianten durchgestrichen und nicht wählbar; „Only n left" ab n ≤ 3; ist alles ausverkauft, wird der Button zu „Sold out" mit „Notify me". Daten von `availability`; bis sie da sind, gilt der Stand der Seite.
- Der Warenkorb lädt beim Öffnen aktuelle Preise (`catalog`) und Verfügbarkeit (`availability`) und markiert Positionen, die nicht mehr gehen.

### 7.4 Übernahme der vorhandenen Produkte

- `npm run seed:catalog` (lokal, mit Service-Account) liest den heutigen Katalog (80 Produkte aus `src/content/catalog.ts`), schreibt `products` und `inventory` und lädt die Produktbilder (Slot-Datei, sonst Beispielbild) in den Storage.
- Bestand: Poster-Drucke 100, Archival-Drucke 25, alles andere `null` (auf Bestellung).
- Preise aus `data/prices.json`, falls vorhanden; sonst leer → „€ [price]", nicht kaufbar.

## 8 Admin (`/admin`, Deutsch)

- **Technik**: eine Client-Oberfläche unter `/admin` (statisch ausgeliefert, `noindex`, kein Link von der öffentlichen Seite). Login mit Firebase Auth (E-Mail + Passwort) im Browser. **Jeder Lese- und Schreibzugriff** läuft über Callable Functions; jede prüft `request.auth.token.admin`. Admin-Konten werden per `npm run admin:add <email>` freigeschaltet.
- **Produkte**: Liste mit Suche und Filter (Bereich, Status), Neu, Duplizieren. Bearbeiten: Texte, Spezifikation, Akkordeons, Lieferzeit, Hinweis; Bilder hochladen (mehrere, Drag & Drop; signierte Upload-URL von einer Callable), sortieren, Alt-Text, Fokuspunkt per Klick, „auf Papiergrund"; Preis; Optionen; Variantentabelle (baut sich aus den Varianten-Optionen auf) mit Bestand und eigenem Preis; Status; Vorschau (die Produktseite mit dem Entwurf, im Admin gerendert). Haben zwei Leute dasselbe Produkt offen, warnt das Speichern (Vergleich `updatedAt`). Gespeichertes ist nach spätestens ca. 1 min auf der Seite (Revalidierung).
- **Bestand**: alle Varianten mit Bestand, reserviert, verfügbar; direkt änderbar (Transaktion, `reserved` bleibt unberührt); Filter „knapp / ausverkauft".
- **Bestellungen**: Liste nach Status; Detail mit Positionen, Kunde, Adresse, Beträgen, Link zur Zahlung in Stripe; Status setzen, Sendungsnummer, interne Notiz; Stornieren mit „Bestand zurückbuchen". Erstattungen laufen im Stripe-Dashboard.
- **Anfragen** und **Newsletter**: Listen, Newsletter als CSV-Export.
- Gruppen je Bereich (Jackets, Shirts, …) sind fest im Code. Neue Produkte erscheinen automatisch in ihrer Serie, in Suche und Sitemap. Redaktionell hervorgehobene Produkte (z. B. auf der Startseite) bleiben im Code; fehlt eines, wird die Stelle übersprungen.

## 9 Formulare, Suche, SEO

- Anfrage (Originale), Kontakt, Newsletter: Functions `enquire` / `newsletter` → Firestore + Mail über Resend. Spam-Schutz: verstecktes Feld `company` (Honeypot) und Rate-Limit (3.3).
- Suche wie heute (Tastenkürzel `/` und ⌘K): Seitenregister aus dem Code plus aktive Produkte von `catalog`, im Browser durchsucht.
- `sitemap.ts`, `robots.ts` (`Disallow: /bag/ /admin/`), Metadaten je Seite, OG-Bild aus Slot bzw. Produktbild — alles beim Build bzw. per Revalidierung erzeugt, ohne API auf Vercel.

## 10 Fehlerfälle

- `catalog` beim Build nicht erreichbar → der Build schlägt fehl (nie ein leerer Shop online). Bei der Revalidierung bleibt der letzte gute Stand stehen.
- Checkout: ausverkauft, Preis geändert oder Produkt inaktiv → Meldung im Warenkorb, Position markiert. Stripe oder Function nicht erreichbar → Meldung, Reservierung frei.
- Webhook: falsche Signatur → 400. Fehler → Stripe wiederholt; Doppelmeldungen sind folgenlos.
- Fehlende Bilder → Slot-Platzhalter wie heute.
- Admin: Validierungsfehler je Feld, Konfliktwarnung, sichtbare Upload-Fehler, abgelaufener Login → zurück zur Anmeldung.

## 11 Tests und Qualität

- **Firebase Emulator Suite** (Functions, Firestore, Auth, Storage) für lokale Entwicklung und Integrationstests.
- **Vitest**: `shop-core` (Preisberechnung, Variantenschlüssel, Validierung, Fensterpfad) und Functions gegen die Emulatoren — Reservieren, Buchen, Freigeben inkl. parallelem Kauf des letzten Stücks und doppelter Webhooks.
- **Stripe im Testmodus**, Webhooks per Stripe CLI an den Emulator weitergeleitet.
- **Playwright (E2E)** gegen `next dev` + Emulatoren: Header-Fenster (durchsichtig, verdichtet); Menü (öffnen, Reiter, Esc, Fokus); Coming soon nicht klickbar und Weiterleitungen; Warenkorb → Stripe-Testseite; Admin-Login, Produkt speichern, Bestand ändern.
- Link-Prüfung aller Seiten (Port von `scripts/check-links.mjs`), `tsc --noEmit`, ESLint, Sichtprüfung bei 1440 und 390 px.

## 12 Auslieferung

- **Frontend**: Branch `nextjs-rebuild` im öffentlichen Repo `fritzschoff/factory-collective` → Pull Request → Vercel-Preview → Merge nach `main` = Produktion (erst nach Freigabe).
- **Backend**: `firebase deploy --only functions,firestore,storage` über ein npm-Skript (später optional per GitHub Action).
- Geheimnisse nur im Firebase Secret Manager bzw. lokal in nicht eingecheckten Dateien (`.env.local`, `functions/.secret.local`). `.env.example` dokumentiert alle Werte.

## 13 Phasen

Jede Phase bekommt einen eigenen Umsetzungsplan und endet mit einem lauffähigen Stand.

1. **Fundament (Frontend)** — Next.js-Projekt, globale Styles, Schriften, Bilder; alle Seiten portiert; Header B; Menü M2; Coming soon und Weiterleitungen; Suche, Sitemap, Metadaten. Produktdaten zunächst aus dem Code-Katalog hinter einer Datenzugriffs-Schicht (`getProduct`, `listProducts`, …), damit Phase 2 nur die Quelle tauscht. Ergebnis: erste Vercel-Preview.
2. **Shop-Unterbau (Firebase)** — Projekt, Regeln, `shop-core`, Functions `catalog`, `availability`, `checkout`, `stripeWebhook`, `order`, `enquire`, `newsletter`, `releaseReservations`; Import-Skript; Datenzugriff des Frontends auf `catalog` umgestellt.
3. **Admin** — Login, Callable Functions und Oberfläche für Produkte, Bilder, Bestand, Bestellungen, Anfragen, Newsletter.
4. **Go-live** — Werte in Vercel und Firebase, Stripe-Webhook, vollständige Tests, Merge nach `main`.

## 14 Offene Punkte

- Firebase: neues Projekt `cfc-shop` oder das Projekt aus dem alten Repo?
- Stripe-Konto (zuerst Testschlüssel), Versandtarife, Steuer, Zahlungsarten.
- Absender-Domain für Mails (Resend).
- Header-Seitenanfang „unter dem Header" stammt aus dem letzten Klick im Mockup; „hinter dem Header" wäre eine Zeile CSS.
- Aus dem alten Stand weiter offen (nicht Teil des Umbaus): Rechtstexte sind Platzhalter; Archivo Black / Arimo als Ersatz für Arial Black / Arial; Platzhalter wie „[ place ]", „€ [price]".

---

## Anhang A — Menü-Inhalte (M2)

( ) = coming soon, nicht klickbar.

- **Factory** — Texts ( 3 ): Tectonics without origin · Ordinary Objects · Bag / Profile Series ( ) — Theses ( 2 of n ): T01 // profile · T02 // ordinary object · T03 ( ) T04 ( ) — Glossary — Publishing ( ) · Archive ( ) · Lectures ( )
- **Atelier** — Fashion ( 18 ): Jackets · Shirts · Trousers · Vests · Outerwear ( ) — Bag / Profile Series ( 4 ): BG / 114 · 098 · 086 · 0?? · Six more ( ) — Jewellery ( 5 ): Cuffs · Bangles · Bracelets · Rings ( ) — Scan Series ( 15 ): Vases · Catch-alls · Holders · Trays — Furniture ( )
- **Studio** — Conceptual Interference ( 15 ): CI / 07 · all fifteen — Layer Paintings ( 4 ): LP / 02 · choose a state — Exhibitions ( ) · Sound ( ) · Scenography ( ) · Architecture ( )
- **Campaigns** — ( 01 ) [ campaign title ] · ( 02 ) The objects, at home · Editorials (Conceptual Interference, Layer Paintings) · ( 03 ) ( )
- **About** — One sign, three rooms · Contact · Press ( ) · Journal ( )

## Anhang B — Seiten nach dem Umbau (87)

Home 1 · Atelier 47 (Hub, Fashion + 18 Produkte, Bags + 4, Jewellery + 5, Scan Series + 15) · Factory 4 (Hub, T01, T02, Glossary) · Studio 22 (Hub, Conceptual Interference + 15 Werke, Layer Paintings + 4 Werke) · Campaigns 3 · Bag 2 (Warenkorb, Danke) · About, Contact 2 · Shipping, Returns, FAQ, Imprint, Privacy, Terms 6 · dazu 404 und der Admin.
