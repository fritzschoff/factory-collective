# Phase 1 — Frontend (Next.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the static Concept. ( ) Collective site to Next.js 16.4 on Vercel — every page, the fixed see-through header (variant B), the Loewe-style menu (M2) and "coming soon" — with product data behind a data layer that Phase 2 can switch to Firebase.

**Architecture:** App Router with Cache Components; all pages are prerendered. Editorial content stays in `src/content/*.ts`; the old page components move to `src/views/` and become (mostly async) Server Components that read products through `getCatalog()`. Interactivity (header, menu, search, bag, buy forms) is a set of small Client Components sharing state through `ChromeProvider`. No Route Handlers, no Server Actions; forms and checkout call `NEXT_PUBLIC_API_BASE` (Firebase Functions, Phase 2) and say "not connected yet" until it is set.

**Tech Stack:** Next.js 16.4.0, React 19, TypeScript 5.9 (strict), plain global CSS (existing files), `next/font/local`, `next/image`, Vitest 5 + Testing Library (jsdom), Playwright 1.64, ESLint 9 + `eslint-config-next`.

**Spec:** `docs/superpowers/specs/2026-10-13-nextjs-firebase-rebuild-design.md` — sections 3.1, 4, 5, 6, 9, 10, 11, 13 (phase 1).

## Global Constraints

- Next.js `16.4.0`, App Router, `trailingSlash: true`, `cacheComponents: true`, `partialPrefetching: true`, Node ≥ 20.9, TypeScript `^5.9.3` (not 7.x), ESLint `^9`.
- `package.json` has **no** `"type": "module"`: Playwright then loads the TypeScript test files as CommonJS, and only in that mode can they import modules that import JSON (verified with Playwright 1.64 — in ESM mode it fails with `needs an import attribute of "type: json"`). Scripts that must be ESM use the `.mjs` extension.
- ESLint runs the React Compiler rules of `eslint-config-next`: no component defined inside another component, no `any`, no straight `'` or `"` in JSX text (the copy uses ’ “ ”).
- Vercel serves the frontend only: **no Route Handlers, no Server Actions, no Firebase credentials** in this app. `sitemap.ts` / `robots.ts` are allowed (built statically).
- Every existing URL with content keeps its address, trailing slash included. Removed pages redirect **307** (table in spec §6, source of truth `src/content/soon.ts`).
- Design stays 1:1: tokens in `src/styles/tokens.css`, the four distances 72 · 156 · 272 · 440, red `#D2141C` only for sign / empty brackets / "not yet" / A—A / closing fade.
- Header = variant B: fixed, white except the window between the brackets, folds circles + labels after **40 px** of scrolling; page content starts **below** the header.
- Menu = variant M2: one panel per room (Factory · Atelier · Studio · Campaigns · About), drops from the top over the header, page dimmed `rgba(11,11,11,.38)`, Esc / ( Close ) / click on the dim closes, focus trapped and restored.
- Coming soon = red, with ( ), the words "coming soon", dash-dot-dot line, **never a link**; "Notify me" links go to `/contact/?subject=…`.
- Site copy is English. Bag key in localStorage stays `cfc.bag.v1`. Bag copy: "Pieces are held for 30 minutes once you check out."
- Images: slot files `public/images/<slot>.(jpg|png|webp|avif)`, sample fallback, switch `IMAGES=local|strict|placeholders`.
- The repository is public: never commit `.env*` (except `.env.example`), keys or service accounts.
- Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **The window must sit exactly on the brackets** at any width (390, 1024, 1440, 1920 px) once the display font has loaded — glyph advances must match `font-metrics.json`, otherwise the hole drifts off the brackets. → Task 10 test "sign glyphs have the measured advances".
2. **Wider than 1440 px the header margins must stay white** — only the window may show the page. → Task 10 test "outside the 1440 frame the header is white".
3. **Broken or foreign localStorage** (invalid JSON, old lines, products that no longer exist, storage blocked in private mode) must give an empty or partial bag, never a crash. → Task 8 tests `parseBag` + blocked storage; Task 19 `BagView` test "lists lines, changes quantities, skips products that no longer exist".
4. **Keyboard users**: menu and search open by keyboard, Tab stays inside, Esc closes, focus returns to the trigger; coming-soon rows are not focusable links. → Task 11 test "Tab stays inside the open menu".
5. **Old links to removed pages** (bookmarks, search engines, our own content) must land on the parent page, no page of ours may link to a coming-soon address — and the day an entry is switched to `live`, it must be linked everywhere again and stop redirecting. → Task 3 redirect and live-switch tests; Task 20 crawler fails on any internal redirect, 404 or missing picture.

---

## File structure (end of Phase 1)

```
next.config.ts · tsconfig.json · eslint.config.mjs · vitest.config.mts · playwright.config.ts · .env.example
scripts/images-manifest.mjs        real pictures → src/generated/image-manifest.json (predev/prebuild)
scripts/images-report.ts           rewrites the Status column of IMAGE-SLOTS.md
scripts/sign-css.mjs               font-metrics.json → src/styles/generated/bwin.css
scripts/measure-font.py            measures the display font → src/lib/sign/font-metrics.json (kept from the old site)
src/app/layout.tsx                 <html>, fonts, global CSS, root metadata
src/app/not-found.tsx              404 inside the site chrome
src/app/sitemap.ts · robots.ts
src/app/(site)/layout.tsx          SiteChrome around every public page
src/app/(site)/**/page.tsx         one thin route file per page
src/components/site-chrome.tsx     header, menu, search, footer, dialogs, toast
src/components/link.tsx            A — next/link for internal hrefs, <a> otherwise
src/components/soon.tsx            Soon — red label while coming soon, a plain link once live
src/components/ui/*.tsx            img, sign, window (Lens), text, marks, elevation (+ index.ts)
src/components/blocks.tsx · quiet.tsx · tiles.tsx · source.tsx
src/components/chrome/ChromeProvider.tsx · Toast.tsx
src/components/header/Header.tsx
src/components/menu/MenuPanel.tsx
src/components/search/Search.tsx
src/components/footer/Footer.tsx · FooterSheet.tsx · NewsletterForm.tsx
src/components/forms/EnquireDialog.tsx · EnquireButton.tsx · ContactForm.tsx
src/components/shop/QuickAdd.tsx · BagCount.tsx · BuyForm.tsx · Gallery.tsx · FashionFilter.tsx · WorkState.tsx · BagView.tsx · ClearBag.tsx
src/content/site.ts · texts.ts · samples.ts · catalog.ts · prices.json · soon.ts · nav.ts · menu.ts · pages.ts
src/lib/cx.ts · format.ts · types.ts · images.ts · api.ts · seo.ts
src/lib/data/catalog.ts            getCatalog() — the only door to product data
src/lib/bag/items.ts · store.ts
src/lib/products/summary.ts · options.ts
src/lib/sign/geometry.ts · font-metrics.json
src/lib/nav/world.ts
src/lib/search/index.ts
src/lib/a11y/use-dialog.ts
src/styles/*.css (+ header.css, menu.css, overlays.css)
src/views/home.tsx · atelier.tsx · series.tsx · product.tsx · factory.tsx · studio.tsx · campaigns.tsx · info.tsx
src/test/setup.ts · chrome.tsx     jest-dom matchers · render inside the page chrome
e2e/*.spec.ts · e2e/pixels.ts
```

The old code lives in `legacy/` during the phase (excluded from TypeScript, ESLint, Vitest) and is deleted in Task 20.

---

### Task 1: Scaffold Next.js next to the legacy code

**Files:**
- Move: `src/` → `legacy/src/`, `server/` → `legacy/server/`, `scripts/` → `legacy/scripts/` (except `scripts/measure-font.py`, which stays). `data/prices.json` stays where it is until Task 4.
- Delete: `package-lock.json`, `tsconfig.json` (rewritten)
- Create: `package.json` (rewritten), `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `vitest.config.mts`, `src/test/setup.ts`, `playwright.config.ts`, `.env.example` (rewritten), `src/app/layout.tsx`, `src/app/(site)/page.tsx`, `src/lib/cx.ts`, `src/lib/cx.test.ts`, `e2e/smoke.spec.ts`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `cx(...names: (string | false | null | undefined)[]): string` in `src/lib/cx.ts`; npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`; Playwright base URL `http://localhost:3100`.

- [ ] **Step 1: Move the old code out of the way**

```bash
mkdir -p legacy
git mv src legacy/src && git mv server legacy/server && git mv scripts legacy/scripts
mkdir scripts && git mv legacy/scripts/measure-font.py scripts/measure-font.py
git rm -q package-lock.json tsconfig.json
rmdir types 2>/dev/null || true
```

`types/` is an empty, untracked folder of the old setup. The old build output `dist/` and `dist-server/` (git-ignored) stays for now: `PORT=4310 node dist-server/server.mjs` still serves the old site for side-by-side comparison until Task 20.

- [ ] **Step 2: Write `package.json`**

```json
{
  "name": "cfc-website",
  "version": "2.0.0",
  "private": true,
  "engines": { "node": ">=20.9" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "next typegen && tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
npm install next@16.4.0 react@^19.3.0 react-dom@^19.3.0
npm install -D typescript@^5.9.3 @types/node@^24 @types/react@^19.3.0 @types/react-dom@^19.3.0 \
  eslint@^9 eslint-config-next@16.4.0 \
  vitest@^5.0.4 @vitejs/plugin-react vite-tsconfig-paths jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom \
  @playwright/test@^1.64.0 pngjs @types/pngjs tsx
npx playwright install chromium
```

Expected: `package.json` now lists the packages; no peer-dependency errors.

- [ ] **Step 4: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules", "legacy"]
}
```

- [ ] **Step 5: Write `next.config.ts`**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  trailingSlash: true,
  cacheComponents: true,
  partialPrefetching: true,
  /** printed in the title blocks of every page (DD.MM.YYYY) */
  env: { NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10) },
};

export default nextConfig;
```

- [ ] **Step 6: Write `eslint.config.mjs`**

```js
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'legacy/**', 'playwright-report/**', 'test-results/**']),
]);
```

- [ ] **Step 7: Write `vitest.config.mts`**

```ts
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{ts,mjs}'],
    exclude: ['legacy/**', 'node_modules/**', 'e2e/**'],
    setupFiles: ['src/test/setup.ts'],
    // next/link drops the trailing slash unless Next tells it the site uses them
    env: { __NEXT_TRAILING_SLASH: 'true' },
  },
});
```

`src/test/setup.ts` (matchers like `toHaveTextContent`, `toBeChecked`):

```ts
import '@testing-library/jest-dom/vitest';
```

Component tests start with `// @vitest-environment jsdom`. Tests that render something using `usePathname` mock `next/navigation` and keep the rest of the module:

```ts
vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/' }));
```

- [ ] **Step 8: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 3100;

export default defineConfig({
  testDir: 'e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'phone', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, grep: /@phone/ },
  ],
  webServer: {
    // E2E_DEV=1 runs against `next dev` while working; the default tests the production build
    command: process.env.E2E_DEV ? `npx next dev -p ${PORT}` : `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
  },
});
```

- [ ] **Step 9: Write `.env.example` and extend `.gitignore`**

`.env.example`:

```bash
# Image slots: local (own files, else sample pictures) · strict (own files only) · placeholders (none)
IMAGES=local
# Public address of the site — canonical URLs and sitemap
SITE_URL=http://localhost:3000
# Plausible prices for previews; never in production
DEMO_PRICES=0
# Base URL of the Firebase Functions (Phase 2). Empty: forms and checkout say "… is not connected yet."
NEXT_PUBLIC_API_BASE=
```

Append to `.gitignore`:

```
# test output
test-results/
playwright-report/
blob-report/
```

- [ ] **Step 10: Write the failing unit test `src/lib/cx.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { cx } from './cx';

describe('cx', () => {
  it('joins truthy class names and drops the rest', () => {
    expect(cx('a', false, null, undefined, 'b', '')).toBe('a b');
  });
});
```

- [ ] **Step 11: Run it to see it fail**

Run: `npx vitest run src/lib/cx.test.ts`
Expected: FAIL — `Failed to resolve import "./cx"`.

- [ ] **Step 12: Write `src/lib/cx.ts`**

```ts
/** Joins truthy class names: cx('a', false && 'b', 'c') → 'a c'. */
export const cx = (...names: (string | false | null | undefined)[]): string => names.filter(Boolean).join(' ');
```

- [ ] **Step 13: Write the minimal app**

`src/app/layout.tsx`:

```tsx
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/(site)/page.tsx` (replaced in Task 15):

```tsx
export default function Page() {
  return <main id="main"><h1>Concept. ( ) Collective</h1></main>;
}
```

`e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('the home page answers', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
```

- [ ] **Step 14: Verify everything is green**

Run: `npx vitest run && npm run typecheck && npm run lint && npx playwright test`
Expected: 1 unit test passes; `tsc` and ESLint report nothing; the build lists `/` as static (○); 1 E2E test passes (the `phone` project runs none yet).

- [ ] **Step 15: Commit**

```bash
git add -A
git commit -m "$(printf 'Scaffold Next.js 16.4 app; move static site to legacy/\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 2: Global CSS, fonts, root layout

**Files:**
- Move: `legacy/src/styles/{tokens,base,sign,marks,components,pages,footer}.css` and `legacy/src/styles/generated/bwin.css` → `src/styles/` (same names)
- Create: `src/styles/overlays.css`, `src/styles/responsive.css` (rewritten without the old band/menu rules), `src/styles/index.css`, `e2e/fonts.spec.ts`
- Modify: `src/styles/tokens.css:1-2,16-17`, `src/app/layout.tsx`

**Interfaces:**
- Produces: CSS variables `--font-display`, `--font-text` on `<html>`; `--display`, `--text` in tokens point to them; global stylesheet `@/styles/index.css`.

- [ ] **Step 1: Move the stylesheets**

```bash
mkdir -p src/styles/generated
for f in tokens base sign marks components pages footer; do git mv legacy/src/styles/$f.css src/styles/$f.css; done
git mv legacy/src/styles/generated/bwin.css src/styles/generated/bwin.css
```

- [ ] **Step 2: Point the font variables at `next/font`** — in `src/styles/tokens.css` delete the two `@font-face` lines at the top and replace the two font lines in `:root`:

```css
  --display: var(--font-display), 'Arial Black', Arial, sans-serif;
  --text: var(--font-text), Arial, Helvetica, sans-serif;
```

- [ ] **Step 3: Create `src/styles/overlays.css`** — the search, dialog, toast and quick-add rules of the old `menu.css`. First line:

```css
/* ── overlays: search, enquiry dialog, toast, quick add ─────────────────────── */
.search { position: fixed; inset: 0; z-index: 200; background: #fff; overflow-y: auto; overscroll-behavior: contain; animation: fadein .25s var(--ease); }
@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
```

then append lines 43 to the end of `legacy/src/styles/menu.css` unchanged:

```bash
sed -n '43,$p' legacy/src/styles/menu.css >> src/styles/overlays.css
```

- [ ] **Step 4: Write `src/styles/responsive.css`** — the old file without the band, bar and old-menu rules:

```css
/* ═══════════════ responsive ═══════════════
   Desktop (1440 design) → tablet (≤ 1100) → phone (≤ 700). The measured page scales fluidly in between. */

@media (max-width: 1100px) {
  :root { --fs-title: clamp(28px, 4vw, 34px); }
  .prow, .walk { grid-template-columns: minmax(0, 1fr); gap: 24px; } .prow__side, .walk__t { grid-column: 1; } .prow__buy { margin-top: 0; } .prow__mark { max-width: 360px; }
  .prose { grid-template-columns: minmax(0, 1fr); row-gap: 0; } .prose > .tx:nth-child(2) { grid-column: 1; }
  .sech, .head6, .room, .home__scan, .exh, .camp-cap, .contact, .src { grid-template-columns: minmax(0, 1fr); gap: 28px; }
  .sech__read { text-align: left; }
  .stage { grid-template-columns: minmax(0, 1fr); } .stage__one { margin-inline: auto; }
  .pdp__top { grid-template-columns: minmax(0, 1fr); } .buy { position: static; padding-right: 0; }
  .bag__cols { grid-template-columns: minmax(0, 1fr); } .sum { position: static; }
  .g5 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .theses { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rows__r.has-img { grid-template-columns: minmax(0, 200px) minmax(0, 1fr); } .rows__r.has-img .rows__no { display: none; } .rows__r.has-img .rows__img { grid-row: span 3; } .rows__r.has-img .rows__go { text-align: left; }
  .paper-hero { grid-template-columns: minmax(0, 1fr); } .paper-hero__m { grid-column: 1; grid-row: auto; margin-top: 24px; }
  .ft__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 36px; } .ft__base { grid-template-columns: 1fr; }
  .triptych { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } .triptych .tri__c, .tri__l3 { display: none; }
  .register li { grid-template-columns: 40px minmax(0, 1fr) auto; } .register__meta { grid-column: 2 / -1; grid-row: 2; }
  .srclist li { grid-template-columns: minmax(0, 1fr) auto; } .srclist .micro { display: none; }
  .ghostwrap__g { width: 90%; }
}

@media (max-width: 900px) {
  .g4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .g3 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .home__bags { grid-template-columns: minmax(0, 1fr); } .home__bagtiles { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .trips { grid-template-columns: minmax(0, 1fr); }
  .pick { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
  .notmade { grid-template-columns: minmax(0, 1fr); } .notmade__b { padding-bottom: 30px; }
}

@media (max-width: 700px) {
  :root { --gut: 20px; --edge: 8px; --g-s: 40px; --g-m: 72px; --g-l: 112px; --g-xl: 168px; --fs-xl: 21px; --fs-l: 17px; }
  body { font-size: 13.5px; }
  /* typography */
  .q-title { font-size: 28px; } .q-narr { margin-top: 32px; } .narr { grid-template-columns: 44px minmax(0, 1fr); }
  .tx p { font-size: 15px; }
  /* grids */
  .g5 { grid-template-columns: repeat(2, minmax(0, 1fr)); } .g4, .g3, .g2 { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; row-gap: 34px; }
  .g2.home__studio, .g2.routes, .g2.edit { grid-template-columns: minmax(0, 1fr); }
  .home__scant2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .rows__r { grid-template-columns: 34px minmax(0, 1fr); } .rows__m { grid-column: 2; } .rows__go { grid-column: 2; text-align: left; }
  .rows__r.has-img { grid-template-columns: minmax(0, 1fr); } .rows__r.has-img .rows__img { grid-row: auto; max-width: 240px; }
  .theses { grid-template-columns: minmax(0, 1fr); }
  .hero__pics { grid-template-columns: minmax(0, 1fr); } .hero__b, .hero2__b { display: none !important; } .hero__a { aspect-ratio: 4 / 5 !important; } .hero2 { grid-template-columns: minmax(0, 1fr); } .hero2__a { aspect-ratio: 4 / 5 !important; } .hero2__k2, .hero2__k1 { display: none; }
  .hero__t { right: 16px; bottom: 70px; } .hero__go { left: calc(var(--edge) + 16px); right: auto; bottom: 28px; }
  .triptych { grid-template-columns: minmax(0, 1fr); } .triptych .tri__b, .tri__l2, .tri__l1 { display: none; } .triptych .tri__a { aspect-ratio: 4 / 5 !important; }
  .over { font-size: 9px; } .mk-card { max-width: 52%; } .mk-notin { max-width: 40%; } .mk-open em, .mk-level em { font-size: 9px; }
  .wall3 { gap: 8px; } .wall3 figcaption { padding-top: 54px; } .wall3 figcaption::before { height: 36px; } .wall3 figcaption .cir { top: 36px; }
  .stage__three { gap: 8px; } .stage { padding: 20px 14px 36px; } .stage .mk-dim { bottom: -40px; }
  .pick { grid-template-columns: repeat(3, minmax(0, 1fr)); } .pick .sub { font-size: 11px; }
  .gal__th { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .bi { grid-template-columns: 88px minmax(0, 1fr); } .bi__p { grid-column: 2; text-align: left; }
  .ft__grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .tb { min-width: 0; width: 100%; }
  .coming { grid-template-columns: minmax(0, 1fr); gap: 14px; }
  .q-end__row { flex-direction: column; gap: 22px; } .q-cap { flex-direction: column; gap: 4px; }
  .pills { flex-direction: column; align-items: stretch; } .pills .pill { width: 100%; } .pills__n { margin-left: 0; text-align: left; }
  .gloss > div { grid-template-columns: minmax(0, 1fr); gap: 6px; }
  .tracks li { grid-template-columns: minmax(0, 1fr) auto; } .tracks i { display: none; }
  .filters { overflow-x: auto; white-space: nowrap; }
  .ghostwrap__g { top: -60px; width: 100%; }
}

@media print { .hd, .mp, .mp__dim, .search, .dlg, .toast, .qa, .ft { display: none !important; } main#main { padding-top: 0; } }
```

- [ ] **Step 5: Write `src/styles/index.css`**

```css
@import './tokens.css';
@import './base.css';
@import './generated/bwin.css';
@import './sign.css';
@import './marks.css';
@import './components.css';
@import './overlays.css';
@import './footer.css';
@import './pages.css';
@import './responsive.css';
```

- [ ] **Step 6: Write the failing E2E test `e2e/fonts.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('both brand fonts load and the tokens use them', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    await document.fonts.ready;
    const css = getComputedStyle(document.documentElement);
    const display = css.getPropertyValue('--font-display').trim();
    const text = css.getPropertyValue('--font-text').trim();
    return { display, text, loaded: [...document.fonts].filter((f) => f.status === 'loaded').length };
  });
  expect(result.display).not.toBe('');
  expect(result.text).not.toBe('');
  expect(result.loaded).toBeGreaterThanOrEqual(1);
});
```

- [ ] **Step 7: Run it to see it fail**

Run: `npx playwright test e2e/fonts.spec.ts`
Expected: FAIL — `--font-display` is empty.

- [ ] **Step 8: Load fonts and CSS in `src/app/layout.tsx`**

```tsx
import localFont from 'next/font/local';
import type { ReactNode } from 'react';
import '@/styles/index.css';

/** Archivo Black — the sign and the titles. `block`: the window is cut for these exact glyphs. */
const display = localFont({ src: '../../public/fonts/archivo-black.woff', weight: '400', style: 'normal', display: 'block', variable: '--font-display', fallback: ['Arial Black', 'Arial', 'sans-serif'] });
/** Arimo — running text (metrically equal to Arial). */
const text = localFont({ src: '../../public/fonts/arimo.woff', weight: '400', style: 'normal', display: 'swap', variable: '--font-text', fallback: ['Arial', 'Helvetica', 'sans-serif'] });

export default function RootLayout({ children }: { children: ReactNode }) {
  // data-scroll-behavior: base.css scrolls smoothly; Next 16 only suspends that during route changes when asked to
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${display.variable} ${text.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 9: Run the tests**

Run: `npx playwright test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "$(printf 'Bring over global CSS and load the brand fonts with next/font\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 3: Coming-soon registry and redirects

**Files:**
- Create: `src/content/soon.ts`, `src/content/soon.test.ts`, `e2e/redirects.spec.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `type SoonKey`, `interface SoonEntry`, `type SoonRegistry`; `SOON`; `isSoon(key, registry?): boolean`; `soonHref(key, registry?): string | undefined` — the page to link to once the entry is live; `soonLabel(key): string`; `soonRedirects(registry?): { source: string; destination: string; permanent: false }[]`; `soonPaths(registry?): string[]`. `registry` defaults to `SOON` and exists so tests can switch an entry to `live`.

- [ ] **Step 1: Write the failing test `src/content/soon.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { SOON, isSoon, soonHref, soonLabel, soonPaths, soonRedirects } from './soon';

describe('coming-soon registry', () => {
  it('adds the empty brackets exactly once', () => {
    expect(soonLabel('furniture')).toBe('Furniture ( )');
    expect(soonLabel('theses')).toBe('T03 ( )  T04 ( )');
    expect(soonLabel('campaign03')).toBe('( 03 ) ( )');
  });

  it('redirects every removed page to its parent while it is soon', () => {
    const r = soonRedirects();
    expect(r).toHaveLength(11);
    expect(r).toEqual(expect.arrayContaining([
      { source: '/atelier/furniture/', destination: '/atelier/', permanent: false },
      { source: '/factory/bag-profile-series/', destination: '/factory/', permanent: false },
      { source: '/factory/publishing/', destination: '/factory/', permanent: false },
      { source: '/factory/archive/', destination: '/factory/', permanent: false },
      { source: '/factory/lectures/', destination: '/factory/', permanent: false },
      { source: '/studio/exhibitions/', destination: '/studio/', permanent: false },
      { source: '/studio/sound/', destination: '/studio/', permanent: false },
      { source: '/studio/scenography/', destination: '/studio/', permanent: false },
      { source: '/studio/architecture/', destination: '/studio/', permanent: false },
      { source: '/journal/', destination: '/', permanent: false },
      { source: '/press/', destination: '/about/', permanent: false },
    ]));
  });

  it('entries without an address have no redirect', () => {
    expect(soonRedirects().some((r) => r.source.includes('outerwear'))).toBe(false);
  });

  it('isSoon and soonPaths agree with the registry', () => {
    expect(Object.keys(SOON)).toHaveLength(16);
    expect(isSoon('journal')).toBe(true);
    expect(soonPaths()).toContain('/press/');
    expect(soonPaths()).toHaveLength(11);
  });

  it('while soon there is nothing to link to', () => {
    expect(soonHref('furniture')).toBeUndefined();
  });

  it('switched to live: linked again, no redirect, no longer forbidden', () => {
    const live = { ...SOON, furniture: { ...SOON.furniture, status: 'live' as const } };
    expect(isSoon('furniture', live)).toBe(false);
    expect(soonHref('furniture', live)).toBe('/atelier/furniture/');
    expect(soonRedirects(live).map((r) => r.source)).not.toContain('/atelier/furniture/');
    expect(soonPaths(live)).not.toContain('/atelier/furniture/');
  });

  it('a live entry without a page of its own has nothing to link to', () => {
    const live = { ...SOON, rings: { ...SOON.rings, status: 'live' as const } };
    expect(soonHref('rings', live)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/content/soon.test.ts`
Expected: FAIL — cannot resolve `./soon`.

- [ ] **Step 3: Write `src/content/soon.ts`**

```ts
/**
 * Everything that is drawn but not built yet — "coming soon".
 * Shown in red with ( ) and the words "coming soon", never linked.
 * Flip `status` to 'live' once the page exists (and its route is back in src/app):
 * the links switch on everywhere and the redirect from the old address disappears.
 */
export type SoonStatus = 'soon' | 'live';

export interface SoonEntry {
  label: string;
  /** the address the page had or will have */
  path?: string;
  /** where that address sends people while the entry is 'soon' */
  redirectTo?: string;
  status: SoonStatus;
}

export const SOON = {
  furniture: { label: 'Furniture', path: '/atelier/furniture/', redirectTo: '/atelier/', status: 'soon' },
  outerwear: { label: 'Outerwear', status: 'soon' },
  rings: { label: 'Rings', status: 'soon' },
  moreBags: { label: 'Six more bags', status: 'soon' },
  bagText: { label: 'Bag / Profile Series', path: '/factory/bag-profile-series/', redirectTo: '/factory/', status: 'soon' },
  theses: { label: 'T03 ( )  T04 ( )', status: 'soon' },
  publishing: { label: 'Publishing', path: '/factory/publishing/', redirectTo: '/factory/', status: 'soon' },
  archive: { label: 'Archive', path: '/factory/archive/', redirectTo: '/factory/', status: 'soon' },
  lectures: { label: 'Lectures', path: '/factory/lectures/', redirectTo: '/factory/', status: 'soon' },
  exhibitions: { label: 'Exhibitions', path: '/studio/exhibitions/', redirectTo: '/studio/', status: 'soon' },
  sound: { label: 'Sound', path: '/studio/sound/', redirectTo: '/studio/', status: 'soon' },
  scenography: { label: 'Scenography', path: '/studio/scenography/', redirectTo: '/studio/', status: 'soon' },
  architecture: { label: 'Architecture', path: '/studio/architecture/', redirectTo: '/studio/', status: 'soon' },
  campaign03: { label: '( 03 )', status: 'soon' },
  journal: { label: 'Journal', path: '/journal/', redirectTo: '/', status: 'soon' },
  press: { label: 'Press', path: '/press/', redirectTo: '/about/', status: 'soon' },
} as const satisfies Record<string, SoonEntry>;

export type SoonKey = keyof typeof SOON;
/** The registry as the functions below read it; tests pass a copy with an entry switched to 'live'. */
export type SoonRegistry = Readonly<Record<SoonKey, SoonEntry>>;

const entries = (registry: SoonRegistry): SoonEntry[] => Object.values(registry);

export const isSoon = (key: SoonKey, registry: SoonRegistry = SOON): boolean => registry[key].status === 'soon';

/** The page to link to once the entry is live; undefined while it is coming soon or has no page of its own. */
export function soonHref(key: SoonKey, registry: SoonRegistry = SOON): string | undefined {
  const e = registry[key];
  return e.status === 'live' ? e.path : undefined;
}

/** "Furniture ( )" — the label with the empty brackets, unless it already has them. */
export function soonLabel(key: SoonKey): string {
  const { label } = SOON[key];
  return /\(\s\)/.test(label) ? label : `${label} ( )`;
}

/** Old addresses of pages that are 'soon' — fed to next.config `redirects()`. */
export function soonRedirects(registry: SoonRegistry = SOON): { source: string; destination: string; permanent: false }[] {
  return entries(registry)
    .filter((e) => e.status === 'soon' && e.path && e.redirectTo)
    .map((e) => ({ source: e.path!, destination: e.redirectTo!, permanent: false as const }));
}

/** Addresses nothing on the site may link to while they are 'soon'. */
export const soonPaths = (registry: SoonRegistry = SOON): string[] =>
  entries(registry).filter((e) => e.status === 'soon' && e.path).map((e) => e.path!);
```

- [ ] **Step 4: Run the unit test**

Run: `npx vitest run src/content/soon.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Wire the redirects** — `next.config.ts` becomes:

```ts
import type { NextConfig } from 'next';
import { soonRedirects } from './src/content/soon';

const nextConfig: NextConfig = {
  trailingSlash: true,
  cacheComponents: true,
  partialPrefetching: true,
  /** printed in the title blocks of every page (DD.MM.YYYY) */
  env: { NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10) },
  /** pages that are "coming soon" send visitors to their parent (307) */
  async redirects() {
    return soonRedirects();
  },
};

export default nextConfig;
```

- [ ] **Step 6: Write the E2E test `e2e/redirects.spec.ts`**

```ts
import { expect, test } from '@playwright/test';
import { soonRedirects } from '../src/content/soon';

for (const r of soonRedirects()) {
  test(`${r.source} redirects temporarily to ${r.destination}`, async ({ request }) => {
    const res = await request.get(r.source, { maxRedirects: 0 });
    expect(res.status()).toBe(307);
    expect(new URL(res.headers()['location'], 'http://x').pathname).toBe(r.destination);
  });

  test(`${r.source.slice(0, -1)} without the slash also ends on ${r.destination}`, async ({ request }) => {
    const res = await request.get(r.source.slice(0, -1));
    expect(new URL(res.url()).pathname).toBe(r.destination);
  });
}
```

- [ ] **Step 7: Run it**

Run: `npx playwright test e2e/redirects.spec.ts`
Expected: 22 tests PASS. (Destinations other than `/` answer 404 until their pages exist; the test only checks where the redirect goes.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(printf 'Add the coming-soon registry and redirect removed pages (307)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 4: Content and the catalog data layer

**Files:**
- Move: `legacy/src/content/{site,texts,samples,catalog}.ts` → `src/content/`; `data/prices.json` → `src/content/prices.json` (then `data/` is empty and goes); `legacy/src/lib/types.ts`, `legacy/src/lib/format.ts` → `src/lib/`
- Modify: `src/content/catalog.ts`, `src/lib/types.ts`, `src/lib/format.ts`
- Create: `src/lib/data/catalog.ts`, `src/lib/data/catalog.test.ts`, `src/lib/format.test.ts`

**Interfaces:**
- Consumes: `SoonKey` (Task 3).
- Produces:
  - `src/lib/types.ts`: `ProductKind`, `OptionValue`, `OptionDef`, `TextLink`, `Product`, `Crumb`.
  - `src/lib/format.ts`: `fmtPrice(cents: number | null | undefined): string`, `fmtDate(iso: string): string`, `slugify`, `pad`, `word`, `Word`, `nbsp`.
  - `src/content/catalog.ts`: `PRODUCTS: Product[]` (no prices), `WORKS: Work[]`, `work(id)`, `interface Work`.
  - `src/lib/data/catalog.ts`: `interface Catalog { products; byId(id): Product | undefined; pick(ids): Product[]; shop(kind): Product[]; group(kind, g): Product[]; bySlug(kind, slug): Product | undefined; printsOf(workId): Product[] }`, `createCatalog(products)`, `demoPriceCents(p)`, `priceCentsFor(p, manual, demo)`, `getCatalog(): Promise<Catalog>`, `fromPrice(cat, w): string`.

- [ ] **Step 1: Move the content**

```bash
mkdir -p src/content src/lib/data
for f in site texts samples catalog; do git mv legacy/src/content/$f.ts src/content/$f.ts; done
git mv data/prices.json src/content/prices.json && rmdir data
git mv legacy/src/lib/types.ts src/lib/types.ts
git mv legacy/src/lib/format.ts src/lib/format.ts
```

- [ ] **Step 2: Rewrite `src/lib/types.ts`**

```ts
import type { SoonKey } from '@/content/soon';

export type ProductKind = 'fashion' | 'bag' | 'jewellery' | 'scan' | 'print';

export interface OptionValue { id: string; label: string; swatch?: string }

/** One choice the buyer makes before adding to the bag. */
export interface OptionDef {
  id: string;
  label: string;
  type: 'swatch' | 'size' | 'choice' | 'text';
  values?: OptionValue[];
  note?: string;
  /** text options: maximum length */
  max?: number;
  optional?: boolean;
}

/** From a product to the text it came out of; `soon` while the text is not written. */
export type TextLink = { label: string } & ({ href: string } | { soon: SoonKey });

export interface Product {
  /** the key everywhere: JK-001 */
  id: string;
  /** printed code: JK / 001 */
  code: string;
  slug: string;
  kind: ProductKind;
  /** group inside the series (jackets, vases …) */
  group: string;
  name: string;
  /** one short line: cloth / metal / glaze */
  material: string;
  sub?: string;
  description: string;
  /** image slot keys; the first is the main picture, the rest the gallery */
  images: string[];
  /** object-position of the main picture in crops */
  pos?: string;
  /** main picture is an object on a paper ground */
  ground?: boolean;
  tag?: string;
  options: OptionDef[];
  /** museum label rows */
  spec: [string, string][];
  /** line under the Add button */
  note: string;
  dims?: string;
  inv: string;
  text?: TextLink;
  accordions: { title: string; body: string }[];
  href: string;
  /** set by the data layer (src/lib/data/catalog.ts) */
  priceCents?: number | null;
  /** short lead time shown in the bag */
  lead: string;
  /** prints only: which work, which edition */
  work?: { id: string; edition: 'poster' | 'archival' };
}

export interface Crumb { label: string; href?: string }
```

- [ ] **Step 3: Edit `src/content/catalog.ts`**
  1. Replace the three import lines with:
     ```ts
     import type { OptionDef, Product } from '@/lib/types';
     import { slugify } from '@/lib/format';
     ```
  2. In the bags loop replace `text: { href: '/factory/bag-profile-series/', label: 'Bag / Profile Series — the text' }` with `text: { soon: 'bagText', label: 'Bag / Profile Series — the text' }`.
  3. Delete every line from `export const byId = …` through the end of the file (the `/* ── prices ── */` block: `DEMO`, `priceCents`, `price`, `hasPrice`, and the exports `byId`, `shop`, `group`, `printsOf`). Keep `export const PRODUCTS = P;`.

- [ ] **Step 4: Add `fmtDate` to `src/lib/format.ts`** (append):

```ts
/** '2026-10-13' → '13.10.2026', the date of the title blocks; anything else → ''. */
export function fmtDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : '';
}
```

- [ ] **Step 5: Write the failing tests**

`src/lib/format.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { fmtDate, fmtPrice } from './format';

describe('format', () => {
  it('prices: euro sign, a space, no cents for whole amounts', () => {
    expect(fmtPrice(4500)).toBe('€ 45');
    expect(fmtPrice(28050)).toBe('€ 280.50');
    expect(fmtPrice(null)).toBe('€ [price]');
  });
  it('dates of the title blocks', () => {
    expect(fmtDate('2026-10-13')).toBe('13.10.2026');
    expect(fmtDate('')).toBe('');
  });
});
```

`src/lib/data/catalog.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { PRODUCTS, WORKS } from '@/content/catalog';
import { createCatalog, demoPriceCents, fromPrice, getCatalog, priceCentsFor } from './catalog';

const cat = createCatalog(PRODUCTS.map((p) => ({ ...p, priceCents: null })));

describe('catalog', () => {
  it('holds the 80 products of the current site', () => {
    expect(cat.products).toHaveLength(80);
  });
  it('finds by id and by slug', () => {
    expect(cat.byId('SH-001')?.name).toBe('shirt, grey band');
    expect(cat.bySlug('fashion', 'sh-001')?.id).toBe('SH-001');
    expect(cat.bySlug('bag', 'sh-001')).toBeUndefined();
  });
  it('pick keeps the order and skips unknown ids', () => {
    expect(cat.pick(['TR-002', 'NOPE', 'JK-004']).map((p) => p.id)).toEqual(['TR-002', 'JK-004']);
  });
  it('counts series and groups', () => {
    expect(cat.shop('fashion')).toHaveLength(18);
    expect(cat.group('fashion', 'jackets')).toHaveLength(8);
    expect(cat.shop('bag')).toHaveLength(4);
    expect(cat.shop('jewellery')).toHaveLength(5);
    expect(cat.shop('scan')).toHaveLength(15);
  });
  it('lists the two editions of a work', () => {
    expect(cat.printsOf('CI-07').map((p) => p.id).sort()).toEqual(['CI-07.A', 'CI-07.P']);
  });
  it('bags point to the unwritten text as coming soon', () => {
    expect(cat.byId('BG-114')?.text).toEqual({ soon: 'bagText', label: 'Bag / Profile Series — the text' });
  });
});

describe('prices', () => {
  const sh = cat.byId('SH-001')!;
  it('takes the manual EUR price first', () => {
    expect(priceCentsFor(sh, { 'SH-001': 280 }, true)).toBe(28000);
  });
  it('ignores entries of the manual list that are not numbers', () => {
    expect(priceCentsFor(sh, { 'SH-001': '280', _readme: 'x' }, false)).toBeNull();
  });
  it('falls back to demo prices only when asked', () => {
    expect(priceCentsFor(sh, {}, true)).toBe(demoPriceCents(sh));
    expect(priceCentsFor(sh, {}, false)).toBeNull();
  });
  it('fromPrice shows the cheapest edition, or the placeholder', () => {
    const w = WORKS.find((x) => x.id === 'CI-07')!;
    expect(fromPrice(cat, w)).toBe('from € [price]');
    const priced = createCatalog(cat.products.map((p) => ({ ...p, priceCents: p.id === 'CI-07.P' ? 4500 : p.id === 'CI-07.A' ? 16000 : null })));
    expect(fromPrice(priced, w)).toBe('from € 45');
  });
  it('getCatalog has no prices without DEMO_PRICES', async () => {
    delete process.env.DEMO_PRICES;
    expect((await getCatalog()).byId('JK-001')?.priceCents).toBeNull();
  });
});
```

- [ ] **Step 6: Run them to see them fail**

Run: `npx vitest run src/lib`
Expected: `format.test.ts` passes for `fmtPrice` and fails on `fmtDate` only if Step 4 was skipped; `catalog.test.ts` FAILS — cannot resolve `./catalog`.

- [ ] **Step 7: Write `src/lib/data/catalog.ts`**

```ts
import { cache } from 'react';
import { PRODUCTS, WORKS, type Work } from '@/content/catalog';
import manualPrices from '@/content/prices.json';
import { fmtPrice } from '@/lib/format';
import type { Product, ProductKind } from '@/lib/types';

/**
 * The only door to product data. Phase 1 reads the catalogue in the code;
 * Phase 2 replaces the body of getCatalog() with the Firebase `catalog` function.
 */
export interface Catalog {
  readonly products: readonly Product[];
  byId(id: string): Product | undefined;
  /** these products, in this order; unknown ids are skipped — an editorial pick must not break a page */
  pick(ids: readonly string[]): Product[];
  shop(kind: ProductKind): Product[];
  group(kind: ProductKind, group: string): Product[];
  bySlug(kind: ProductKind, slug: string): Product | undefined;
  printsOf(workId: string): Product[];
}

export function createCatalog(products: readonly Product[]): Catalog {
  const ids = new Map(products.map((p) => [p.id, p]));
  return {
    products,
    byId: (id) => ids.get(id),
    pick: (list) => list.map((id) => ids.get(id)).filter((p): p is Product => p !== undefined),
    shop: (kind) => products.filter((p) => p.kind === kind),
    group: (kind, g) => products.filter((p) => p.kind === kind && p.group === g),
    bySlug: (kind, slug) => products.find((p) => p.kind === kind && p.slug === slug),
    printsOf: (workId) => products.filter((p) => p.work?.id === workId),
  };
}

const DEMO_EUR: Record<string, number> = { jackets: 520, shirts: 260, trousers: 340, vests: 300, bags: 880, totes: 1240, cuffs: 5400, bangles: 3200, bracelets: 3600, vases: 280, 'catch-alls': 190, holders: 240, trays: 210 };

/** Plausible prices for previews only (DEMO_PRICES=1). */
export function demoPriceCents(p: Product): number {
  if (p.kind === 'print') return p.work?.edition === 'poster' ? 4500 : 16000;
  return (DEMO_EUR[p.group] ?? 300) * 100 + (p.id.charCodeAt(p.id.length - 1) % 5) * 1000;
}

/** Price, in order: the manual list (EUR, whole numbers) → demo prices → none ("€ [price]"). */
export function priceCentsFor(p: Product, manual: Readonly<Record<string, unknown>>, demo: boolean): number | null {
  const eur = manual[p.id];
  if (typeof eur === 'number') return Math.round(eur * 100);
  return demo ? demoPriceCents(p) : null;
}

export const getCatalog = cache(async (): Promise<Catalog> => {
  const demo = process.env.DEMO_PRICES === '1';
  return createCatalog(PRODUCTS.map((p) => ({ ...p, priceCents: priceCentsFor(p, manualPrices, demo) })));
});

/** "from € 45" over the print editions of a work. */
export function fromPrice(cat: Catalog, w: Work): string {
  const cents = cat.printsOf(w.id).map((p) => p.priceCents).filter((c): c is number => c != null);
  return cents.length ? `from ${fmtPrice(Math.min(...cents))}` : 'from € [price]';
}

export { WORKS };
export type { Work };
```

- [ ] **Step 8: Run the tests**

Run: `npx vitest run && npm run typecheck`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "$(printf 'Move the content and put products behind getCatalog()\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 5: Image slots

**Files:**
- Create: `scripts/images-manifest.mjs`, `scripts/images-manifest.test.mjs`, `src/generated/image-manifest.json`, `src/lib/images.ts`, `src/lib/images.test.ts`, `scripts/images-report.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces: `type ImageMode = 'local' | 'strict' | 'placeholders'`; `imageMode(value?: string): ImageMode`; `resolveSlot(slot, mode?, files?): { slot: string; source: 'local' | 'sample' | 'none'; src: string | null }`; `slotSrc(slot): string | null`; `hasRealPictures(): boolean`; npm scripts `predev`, `prebuild`, `images:report`.

- [ ] **Step 1: Write the failing test `scripts/images-manifest.test.mjs`**

```js
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { buildManifest } from './images-manifest.mjs';

const DIR = path.resolve('public/images');

describe('image manifest', () => {
  it('maps slot keys to public URLs and skips samples and non-images', () => {
    const files = ['fashion/JK-001.jpg', '_sample/camp2/jk_white.jpg', 'notes.txt', 'art/CI-07.webp'].map((f) => path.join(DIR, f));
    expect(buildManifest(files)).toEqual({ slots: { 'art/CI-07': '/images/art/CI-07.webp', 'fashion/JK-001': '/images/fashion/JK-001.jpg' } });
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run scripts`
Expected: FAIL — cannot resolve `./images-manifest.mjs`.

- [ ] **Step 3: Write `scripts/images-manifest.mjs`**

```js
#!/usr/bin/env node
/**
 * Lists the real pictures in public/images (everything except _sample/) so slots resolve
 * without touching the file system while pages render (Vercel functions do not carry public/).
 * Writes src/generated/image-manifest.json — runs before `dev` and `build`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'public/images');
const OUT = path.join(ROOT, 'src/generated/image-manifest.json');
const EXT = /\.(jpe?g|png|webp|avif)$/i;

const walk = (dir) => (!fs.existsSync(dir) ? [] : fs.readdirSync(dir, { withFileTypes: true })
  .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)])));

/** absolute file paths → { slots: { 'fashion/JK-001': '/images/fashion/JK-001.jpg' } } */
export function buildManifest(files) {
  const slots = {};
  for (const abs of files) {
    const rel = path.relative(DIR, abs).split(path.sep).join('/');
    if (!EXT.test(rel) || rel.startsWith('_')) continue;
    slots[rel.replace(EXT, '')] = `/images/${rel}`;
  }
  return { slots: Object.fromEntries(Object.entries(slots).sort(([a], [b]) => a.localeCompare(b))) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = buildManifest(walk(DIR));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`image manifest: ${Object.keys(manifest.slots).length} real pictures`);
}
```

- [ ] **Step 4: Run the test, generate the manifest, add the scripts**

Run: `npx vitest run scripts && node scripts/images-manifest.mjs`
Expected: PASS; prints `image manifest: 0 real pictures`; `src/generated/image-manifest.json` is `{ "slots": {} }`.

Add to `package.json` → `scripts`:

```json
"predev": "node scripts/images-manifest.mjs",
"prebuild": "node scripts/images-manifest.mjs",
"images:report": "tsx scripts/images-report.ts"
```

- [ ] **Step 5: Write the failing test `src/lib/images.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { imageMode, resolveSlot } from './images';

const files = { 'fashion/JK-001': '/images/fashion/JK-001.jpg' };

describe('resolveSlot', () => {
  it('prefers a real picture', () => {
    expect(resolveSlot('fashion/JK-001', 'local', files)).toEqual({ slot: 'fashion/JK-001', source: 'local', src: '/images/fashion/JK-001.jpg' });
  });
  it('falls back to the sample picture', () => {
    expect(resolveSlot('fashion/SH-001', 'local', files)).toEqual({ slot: 'fashion/SH-001', source: 'sample', src: '/images/_sample/camp2/sh_grey_band.jpg' });
  });
  it('never uses samples in strict mode', () => {
    expect(resolveSlot('fashion/SH-001', 'strict', files).source).toBe('none');
  });
  it('placeholders mode ignores even real pictures', () => {
    expect(resolveSlot('fashion/JK-001', 'placeholders', files).src).toBeNull();
  });
  it('slots without any picture are placeholders', () => {
    expect(resolveSlot('studio/exhibition-1', 'local', files).source).toBe('none');
  });
  it('reads the mode from IMAGES', () => {
    expect(imageMode('strict')).toBe('strict');
    expect(imageMode(undefined)).toBe('local');
    expect(imageMode('nonsense')).toBe('local');
  });
});
```

- [ ] **Step 6: Run it to see it fail**

Run: `npx vitest run src/lib/images.test.ts`
Expected: FAIL — cannot resolve `./images`.

- [ ] **Step 7: Write `src/lib/images.ts`**

```ts
import { SAMPLES } from '@/content/samples';
import manifest from '@/generated/image-manifest.json';

export type ImageMode = 'local' | 'strict' | 'placeholders';
export type ImageSource = 'local' | 'sample' | 'none';
export interface ResolvedImage { slot: string; source: ImageSource; src: string | null }

const REAL: Readonly<Record<string, string>> = manifest.slots;

export const imageMode = (value: string | undefined = process.env.IMAGES): ImageMode =>
  value === 'strict' || value === 'placeholders' ? value : 'local';

/**
 * Where the picture of a slot comes from:
 *  1. public/images/<slot>.(jpg|png|webp|avif) — a real picture
 *  2. the sample in public/images/_sample (not with IMAGES=strict)
 *  3. nothing — the placeholder that names the slot
 */
export function resolveSlot(slot: string, mode: ImageMode = imageMode(), files: Readonly<Record<string, string>> = REAL): ResolvedImage {
  if (mode === 'placeholders') return { slot, source: 'none', src: null };
  const local = files[slot];
  if (local) return { slot, source: 'local', src: local };
  const sample = SAMPLES[slot];
  if (sample && mode !== 'strict') return { slot, source: 'sample', src: `/images/_sample/${sample}.jpg` };
  return { slot, source: 'none', src: null };
}

export const slotSrc = (slot: string): string | null => resolveSlot(slot).src;

export const hasRealPictures = (): boolean => Object.keys(REAL).length > 0;
```

- [ ] **Step 8: Write `scripts/images-report.ts`** (keeps `IMAGE-SLOTS.md` current; ratios and sizes in it stay valid because layouts do not change)

```ts
/** Rewrites the Status column, the count line and the date line of IMAGE-SLOTS.md from the current files. */
import fs from 'node:fs';
import path from 'node:path';
import { resolveSlot } from '../src/lib/images';

// npm scripts run in the project root (tsx runs this file as CommonJS, so no import.meta)
const FILE = path.resolve('IMAGE-SLOTS.md');
const LABEL = { local: 'local', sample: 'sample picture', none: 'EMPTY (placeholder)' } as const;

let md = fs.readFileSync(FILE, 'utf8');
md = md.replace(/^Generated by .*$/m, `Status updated by \`npm run images:report\` on ${new Date().toISOString().slice(0, 10)}.`);
const sources: (keyof typeof LABEL)[] = [];
md = md.replace(/^\| `([^`]+)\.jpg` \|(.*)\| ([^|]+) \|$/gm, (_row, slot: string, middle: string) => {
  const { source } = resolveSlot(slot);
  sources.push(source);
  return `| \`${slot}.jpg\` |${middle}| ${LABEL[source]} |`;
});
const n = (s: keyof typeof LABEL) => sources.filter((x) => x === s).length;
md = md.replace(/\*\*\d+ slots\*\* · \d+ real pictures · \d+ sample pictures · \d+ empty\./, `**${sources.length} slots** · ${n('local')} real pictures · ${n('sample')} sample pictures · ${n('none')} empty.`);
fs.writeFileSync(FILE, md);
console.log(`IMAGE-SLOTS.md: ${sources.length} slots, ${n('local')} real, ${n('sample')} samples, ${n('none')} empty`);
```

- [ ] **Step 9: Bring the intro of `IMAGE-SLOTS.md` up to date** — two sentences describe the old build. Replace

```text
The build makes 480 / 960 / 1600 px WebP variants itself (needs `sharp`).
```

with

```text
Next.js serves resized WebP / AVIF versions itself (`next/image`).
```

and in the Status line delete

```text
`stripe` = picture on the Stripe product · 
```

The three `EMPTY` slots are `studio/exhibition-1` … `-3`; they belonged to the Exhibitions block that becomes a coming-soon box in Task 18 and simply stay listed.

- [ ] **Step 10: Run everything**

Run: `npx vitest run && npm run images:report && git diff IMAGE-SLOTS.md | head -40 && npm run typecheck`
Expected: PASS; the report prints `IMAGE-SLOTS.md: 126 slots, 0 real, 123 samples, 3 empty`; the diff shows only the intro lines and the date line — every Status cell keeps its value.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "$(printf 'Resolve image slots from a build-time manifest\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 6: Sign geometry and the header window shape

**Files:**
- Move: `legacy/src/lib/font-metrics.json` → `src/lib/sign/font-metrics.json`
- Create: `src/lib/sign/geometry.ts`, `src/lib/sign/geometry.test.ts`, `scripts/sign-css.mjs`, `scripts/sign-css.test.mjs`
- Modify: `src/styles/generated/bwin.css` (regenerated), `package.json` (`sign:css`), `scripts/measure-font.py` (output path)

**Interfaces:**
- Produces: `signGeometry(word?: string): { tot: number; xF: number; xA: number; xS: number; brL: number; brR: number; winLeft: number }`; `windowShape(word?: string, padEm?: number, bleedEm?: number): { viewBox: string; d: string }`; `HEADER_PAD_EM` constant; `signAdvances(): number[]` — the advances of the nine pieces C · ONCEPT · . · ( · ATELIER · ) · C · OLLECTIVE · . in that order (the header test compares them with the rendered glyphs).

- [ ] **Step 1: Move the metrics**

```bash
mkdir -p src/lib/sign && git mv legacy/src/lib/font-metrics.json src/lib/sign/font-metrics.json
perl -pi -e "s#src/lib/font-metrics\.json#src/lib/sign/font-metrics.json#g; s#'src/lib'\)#'src/lib/sign')#" scripts/measure-font.py
grep -n "src/lib" scripts/measure-font.py
```

Expected: the three hits of `grep` all name `src/lib/sign` (docstring, `os.makedirs`, `json.dump`). The script needs Python 3 with `pip install playwright` and is only re-run when the display font is replaced.

- [ ] **Step 2: Write the failing test `src/lib/sign/geometry.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { HEADER_PAD_EM, signAdvances, signGeometry, windowShape } from './geometry';

describe('sign geometry', () => {
  it('spans 19.596 em with ATELIER in the brackets', () => {
    expect(signGeometry().tot).toBeCloseTo(19.5964, 3);
  });
  it('lists the nine pieces of the sign in order', () => {
    const adv = signAdvances();
    expect(adv).toHaveLength(9);
    expect(adv[0]).toBeCloseTo(0.778, 3); // C
    expect(adv[3]).toBeCloseTo(0.389, 3); // (
    expect(adv.reduce((a, c) => a + c, 0)).toBeCloseTo(signGeometry().tot, 6);
  });
  it('puts the A axis in the middle of the brackets', () => {
    const g = signGeometry();
    expect(g.xA).toBeGreaterThan(g.brL);
    expect(g.xA).toBeLessThan(g.brR);
    expect(g.xA).toBeCloseTo((g.brL + g.brR) / 2, 2);
  });
});

describe('window shape', () => {
  const { d, viewBox } = windowShape('ATELIER', 0.109);
  const nums = (s: string) => (s.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);

  it('is a white row with exactly one hole', () => {
    expect(d.match(/M/g)).toHaveLength(2);
    expect(d.match(/Z/g)).toHaveLength(2);
  });
  it('covers the row including the side padding', () => {
    expect(nums(viewBox)).toEqual([-0.109, 0, 19.8144, 1]);
  });
  it('cuts the hole between the inner contours of the brackets, slightly under them', () => {
    const hole = nums(d.slice(d.indexOf('Z') + 1));
    const xs = hole.filter((_, i) => i % 2 === 0);
    const ys = hole.filter((_, i) => i % 2 === 1);
    expect(Math.min(...xs)).toBeCloseTo(6.2646, 3);
    expect(Math.max(...xs)).toBeCloseTo(11.3305, 3);
    expect(Math.min(...ys)).toBeCloseTo(0.095, 3);
    expect(Math.max(...ys)).toBeCloseTo(0.9925, 3);
  });
  it('the header padding is .55 % of the width, in em of the sign', () => {
    expect(HEADER_PAD_EM).toBeCloseTo(0.109, 3);
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run src/lib/sign`
Expected: FAIL — cannot resolve `./geometry`.

- [ ] **Step 4: Write `src/lib/sign/geometry.ts`**

```ts
import metrics from './font-metrics.json';

/**
 * The long-form sign  C ONCEPT. ( WORD ) C OLLECTIVE .  measured in Archivo Black.
 * All values in em of the sign's font size (scripts/measure-font.py produced the JSON).
 */
const ADV = metrics.advEm as Record<string, number>;
const WORDS = metrics.words as Record<string, number>;
const B = metrics.bracket;

/** Advances of the nine pieces, in the order the JSON lists them: C · ONCEPT · . · ( · ATELIER · ) · C · OLLECTIVE · . */
export const signAdvances = (): number[] => Object.values(ADV);

export interface SignGeometry {
  /** total advance in em */
  tot: number;
  /** fractions of the sign width: the F, A and S axes and the two brackets */
  xF: number; xA: number; xS: number; brL: number; brR: number;
  /** left edge of the window, fraction of the width */
  winLeft: number;
}

const advOf = (word: string) => WORDS[word.toUpperCase()] ?? ADV.ATELIER;
const BEFORE = ADV.C + ADV.ONCEPT + ADV['. '];

export function signGeometry(word = 'ATELIER'): SignGeometry {
  const w = advOf(word);
  const tot = Object.values(ADV).reduce((a, c) => a + c, 0) - ADV.ATELIER + w;
  const half = ADV['('] / 2;
  return {
    tot,
    winLeft: (BEFORE + half) / tot,
    xF: 0.36 / tot,
    xA: (BEFORE + (ADV['('] + w + ADV[')']) / 2) / tot,
    xS: (BEFORE + ADV['('] + w + ADV[')'] + ADV[' C'] - 0.36) / tot,
    brL: (BEFORE + half) / tot,
    brR: (BEFORE + ADV['('] + w + ADV[')'] / 2) / tot,
  };
}

/** The header's sign row has .55 % of the width as padding on each side; the sign fills the other 98.9 %. */
export const HEADER_PAD_EM = (0.55 * signGeometry().tot) / 98.9;

export interface WindowShape {
  /** viewBox of the sign row in em, including the side padding */
  viewBox: string;
  /** white row with the window cut out — use with fill-rule="evenodd" */
  d: string;
}

/**
 * The sign row as a white band with the window between the brackets cut out.
 * `bleedEm` widens the hole a little under the red glyphs so no white seam can show.
 */
export function windowShape(word = 'ATELIER', padEm = HEADER_PAD_EM, bleedEm = 0.012): WindowShape {
  const w = advOf(word);
  const H = B.inkHeightEm;
  const top = metrics.baselineFromTopEm + B.inkTopFromBaselineEm;
  const innerL = BEFORE + B.left.innerAtMidEm;
  const innerR = BEFORE + ADV['('] + w + B.right.innerAtMidEm;
  const n = (v: number) => Number(v.toFixed(4)).toString();
  const left = B.rows.map((r, i) => [innerL + B.kLeft[i] * H - bleedEm, top + r * H] as const);
  const right = B.rows.map((r, i) => [innerR + B.kRight[i] * H + bleedEm, top + r * H] as const).reverse();
  const hole = [...left, ...right].map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join(' ');
  const x0 = -padEm;
  const width = signGeometry(word).tot + 2 * padEm;
  return { viewBox: `${n(x0)} 0 ${n(width)} 1`, d: `M${n(x0)} 0 H${n(x0 + width)} V1 H${n(x0)} Z ${hole} Z` };
}
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/lib/sign`
Expected: PASS (7 tests).

- [ ] **Step 6: Write the failing test `scripts/sign-css.test.mjs`**

```js
import fs from 'node:fs';
import { describe, expect, it } from 'vitest';
import { bracketCss } from './sign-css.mjs';

describe('bracket window CSS', () => {
  it('the committed stylesheet is what the metrics produce', () => {
    const metrics = JSON.parse(fs.readFileSync('src/lib/sign/font-metrics.json', 'utf8'));
    expect(fs.readFileSync('src/styles/generated/bwin.css', 'utf8')).toBe(bracketCss(metrics));
  });
});
```

- [ ] **Step 7: Write `scripts/sign-css.mjs`** (port of `genBracketCss` from `legacy/scripts/build.mjs`)

```js
#!/usr/bin/env node
/** font-metrics.json → src/styles/generated/bwin.css: the clip path of the bracket window. Re-run after replacing the display font. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function bracketCss(m) {
  const b = m.bracket;
  const pts = (arr, right) => arr.map((k, i) => `${right ? `calc(100% + var(--h) * ${k})` : `calc(var(--h) * ${k})`} ${(b.rows[i] * 100).toFixed(3)}%`);
  const poly = [...pts(b.kLeft, false), ...pts(b.kRight, true).reverse()];
  return `/* generated by scripts/sign-css.mjs from src/lib/sign/font-metrics.json — do not edit */
.bwin__pic{clip-path:polygon(${poly.join(',')})}
:root{--k-ink:${b.inkHeightEm};--k-top:${(m.baselineFromTopEm + b.inkTopFromBaselineEm).toFixed(5)};--k-li:${(b.left.innerAtMidEm - b.left.inkLeftEm).toFixed(5)};--k-ll:${b.left.inkLeftEm};--k-rr:${(b.right.inkRightEm - b.right.innerAtMidEm).toFixed(5)};--k-ri:${b.right.innerAtMidEm}}
`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const metrics = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/lib/sign/font-metrics.json'), 'utf8'));
  fs.writeFileSync(path.join(ROOT, 'src/styles/generated/bwin.css'), bracketCss(metrics));
  console.log('src/styles/generated/bwin.css written');
}
```

- [ ] **Step 8: Regenerate, run the tests**

Add `"sign:css": "node scripts/sign-css.mjs"` to `package.json` scripts, then:

Run: `npm run sign:css && npx vitest run scripts && git diff --stat src/styles/generated/bwin.css`
Expected: PASS; the diff changes only the comment line of `bwin.css`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "$(printf 'Compute the sign geometry and the window shape from the font metrics\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 7: Page chrome state, dialog behaviour, toast

**Files:**
- Create: `src/lib/nav/world.ts`, `src/lib/nav/world.test.ts`, `src/components/chrome/ChromeProvider.tsx`, `src/components/chrome/ChromeProvider.test.tsx`, `src/components/chrome/Toast.tsx`, `src/lib/a11y/use-dialog.ts`, `src/lib/a11y/use-dialog.test.tsx`

**Interfaces:**
- Produces:
  - `type WorldId = 'factory' | 'atelier' | 'studio' | 'campaigns' | 'about'`, `WORLD_IDS`, `worldOf(pathname: string | null): WorldId | null`.
  - `ChromeProvider`, `useChrome(): Chrome` with `menu: { open: boolean; tab: WorldId }`, `openMenu(tab?)`, `closeMenu()`, `searchOpen`, `openSearch()`, `closeSearch()`, `enquiry: { open: boolean; what: string; n: number }`, `openEnquiry(what)`, `closeEnquiry()`, `toast: { id; text; link? } | null`, `showToast(text, link?)`.
  - `useDialog(ref, open, onClose, initialFocus?)`.
  - `<Toast />`.

- [ ] **Step 1: Write the failing test `src/lib/nav/world.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { worldOf } from './world';

describe('worldOf', () => {
  it('reads the room from the first segment', () => {
    expect(worldOf('/atelier/fashion/sh-001/')).toBe('atelier');
    expect(worldOf('/factory/')).toBe('factory');
    expect(worldOf('/campaigns/01/')).toBe('campaigns');
  });
  it('contact belongs to About', () => {
    expect(worldOf('/contact/')).toBe('about');
  });
  it('pages outside the rooms have none', () => {
    expect(worldOf('/')).toBeNull();
    expect(worldOf('/bag/')).toBeNull();
    expect(worldOf(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/lib/nav`
Expected: FAIL — cannot resolve `./world`.

- [ ] **Step 3: Write `src/lib/nav/world.ts`**

```ts
export type WorldId = 'factory' | 'atelier' | 'studio' | 'campaigns' | 'about';
export const WORLD_IDS: readonly WorldId[] = ['factory', 'atelier', 'studio', 'campaigns', 'about'];

/** Which room a path belongs to; /contact/ belongs to About. */
export function worldOf(pathname: string | null): WorldId | null {
  const first = (pathname ?? '/').split('/')[1] ?? '';
  if (first === 'contact') return 'about';
  return (WORLD_IDS as readonly string[]).includes(first) ? (first as WorldId) : null;
}
```

- [ ] **Step 4: Write the failing test `src/components/chrome/ChromeProvider.test.tsx`**

```tsx
// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const nav = vi.hoisted(() => ({ path: '/studio/conceptual-interference/' }));
vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => nav.path }));

import { ChromeProvider, useChrome } from './ChromeProvider';

const wrapper = ({ children }: { children: ReactNode }) => <ChromeProvider>{children}</ChromeProvider>;

describe('ChromeProvider', () => {
  afterEach(() => { nav.path = '/studio/conceptual-interference/'; vi.useRealTimers(); });

  it('opens the menu on the room of the page and closes it', () => {
    const { result } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openMenu());
    expect(result.current.menu).toEqual({ open: true, tab: 'studio' });
    act(() => result.current.closeMenu());
    expect(result.current.menu.open).toBe(false);
  });

  it('a navigation closes the menu without any effect', () => {
    const { result, rerender } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openMenu('factory'));
    nav.path = '/factory/';
    rerender();
    expect(result.current.menu.open).toBe(false);
  });

  it('search and menu exclude each other', () => {
    const { result } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openMenu());
    act(() => result.current.openSearch());
    expect(result.current.searchOpen).toBe(true);
    expect(result.current.menu.open).toBe(false);
  });

  it('counts enquiry openings so the form starts fresh', () => {
    const { result } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.openEnquiry('CI / 07 — the original'));
    expect(result.current.enquiry).toEqual({ open: true, what: 'CI / 07 — the original', n: 1 });
  });

  it('the toast goes away after 4.2 s', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useChrome(), { wrapper });
    act(() => result.current.showToast('In your bag.'));
    expect(result.current.toast?.text).toBe('In your bag.');
    act(() => { vi.advanceTimersByTime(4200); });
    expect(result.current.toast).toBeNull();
  });
});
```

- [ ] **Step 5: Run it to see it fail**

Run: `npx vitest run src/components/chrome`
Expected: FAIL — cannot resolve `./ChromeProvider`.

- [ ] **Step 6: Write `src/components/chrome/ChromeProvider.tsx`**

```tsx
'use client';

import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { worldOf, type WorldId } from '@/lib/nav/world';

export interface ToastLink { href: string; label: string }
export interface ToastMessage { id: number; text: string; link?: ToastLink }

export interface Chrome {
  menu: { open: boolean; tab: WorldId };
  openMenu: (tab?: WorldId) => void;
  closeMenu: () => void;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  enquiry: { open: boolean; what: string; n: number };
  openEnquiry: (what: string) => void;
  closeEnquiry: () => void;
  toast: ToastMessage | null;
  showToast: (text: string, link?: ToastLink) => void;
}

const ChromeContext = createContext<Chrome | null>(null);
const TOAST_MS = 4200;

/**
 * Shared state of the page chrome: menu, search, enquiry dialog, toast.
 * Menu and search remember the path they were opened on, so any navigation closes them.
 */
export function ChromeProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const [menuState, setMenuState] = useState<{ path: string; tab: WorldId }>({ path: '', tab: 'atelier' });
  const [searchPath, setSearchPath] = useState('');
  const [enquiry, setEnquiry] = useState({ open: false, what: '', n: 0 });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const openMenu = useCallback((tab?: WorldId) => {
    setSearchPath('');
    setMenuState({ path: pathname, tab: tab ?? worldOf(pathname) ?? 'atelier' });
  }, [pathname]);
  const closeMenu = useCallback(() => setMenuState((m) => ({ ...m, path: '' })), []);
  const openSearch = useCallback(() => {
    setMenuState((m) => ({ ...m, path: '' }));
    setSearchPath(pathname);
  }, [pathname]);
  const closeSearch = useCallback(() => setSearchPath(''), []);
  const openEnquiry = useCallback((what: string) => setEnquiry((e) => ({ open: true, what, n: e.n + 1 })), []);
  const closeEnquiry = useCallback(() => setEnquiry((e) => ({ ...e, open: false })), []);
  const showToast = useCallback((text: string, link?: ToastLink) => {
    window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), text, link });
    toastTimer.current = window.setTimeout(() => setToast(null), TOAST_MS);
  }, []);

  const value = useMemo<Chrome>(() => ({
    menu: { open: menuState.path === pathname, tab: menuState.tab }, openMenu, closeMenu,
    searchOpen: searchPath === pathname, openSearch, closeSearch,
    enquiry, openEnquiry, closeEnquiry,
    toast, showToast,
  }), [menuState, searchPath, pathname, openMenu, closeMenu, openSearch, closeSearch, enquiry, openEnquiry, closeEnquiry, toast, showToast]);

  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome(): Chrome {
  const chrome = useContext(ChromeContext);
  if (!chrome) throw new Error('useChrome() needs <ChromeProvider> around it');
  return chrome;
}
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run src/components/chrome src/lib/nav`
Expected: PASS (8 tests).

- [ ] **Step 8: Write the failing test `src/lib/a11y/use-dialog.test.tsx`**

```tsx
// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useDialog } from './use-dialog';

function Harness({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => { onClose(); setOpen(false); };
  useDialog(ref, open, close);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Open</button>
      <div ref={ref} hidden={!open}><button type="button">Inside</button></div>
    </>
  );
}

describe('useDialog', () => {
  it('moves focus in, closes on Esc, locks the page, gives focus back', () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    const trigger = screen.getByText('Open');
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.activeElement).toBe(screen.getByText('Inside'));
    expect(document.body.classList.contains('is-locked')).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(document.body.classList.contains('is-locked')).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });
});
```

- [ ] **Step 9: Run it to see it fail**

Run: `npx vitest run src/lib/a11y`
Expected: FAIL — cannot resolve `./use-dialog`.

- [ ] **Step 10: Write `src/lib/a11y/use-dialog.ts`**

```ts
'use client';

import { useEffect, type RefObject } from 'react';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([type=hidden]):not([tabindex="-1"]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Modal behaviour for an overlay: Esc closes, Tab stays inside, the page does not scroll, focus returns afterwards. */
export function useDialog(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  initialFocus?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const el = ref.current;
    if (!open || !el) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('is-locked');
    (initialFocus?.current ?? el.querySelector<HTMLElement>(FOCUSABLE))?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const items = Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((x) => x.offsetParent !== null || x === document.activeElement);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('is-locked');
      previous?.focus({ preventScroll: true });
    };
  }, [open, ref, onClose, initialFocus]);
}
```

- [ ] **Step 11: Write `src/components/chrome/Toast.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useChrome } from './ChromeProvider';

/** "SH / 001 // shirt, grey band is in your bag.  View bag →" — top right, under the header. */
export function Toast() {
  const { toast } = useChrome();
  if (!toast) return <div className="toast" role="status" aria-live="polite" hidden />;
  return (
    <div className="toast" role="status" aria-live="polite" key={toast.id}>
      <span>{toast.text}</span>
      {toast.link && <Link href={toast.link.href}>{toast.link.label}</Link>}
    </div>
  );
}
```

- [ ] **Step 12: Run the tests and checks**

Run: `npx vitest run && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "$(printf 'Add the shared chrome state, modal behaviour and the toast\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 8: The bag, product summaries, quick add

**Files:**
- Create: `src/lib/bag/items.ts`, `src/lib/bag/items.test.ts`, `src/lib/bag/store.ts`, `src/lib/bag/store.test.tsx`, `src/lib/products/summary.ts`, `src/lib/products/options.ts`, `src/lib/products/products.test.ts`, `src/components/shop/BagCount.tsx`, `src/components/shop/QuickAdd.tsx`, `src/components/shop/QuickAdd.test.tsx`, `src/test/chrome.tsx`

**Interfaces:**
- Consumes: `useChrome().showToast` (Task 7), `fmtPrice` (Task 4), `slotSrc` (Task 5), `Product`, `OptionDef` (Task 4).
- Produces:
  - `BagOption { v; l }`, `BagOptions`, `BagLine { key; id; qty; opts }`, `MAX_QTY = 9`, `lineKey`, `addLine`, `setQty`, `countItems`, `parseBag`.
  - `useBag(): { items: BagLine[]; count: number; add(id, opts, qty?); set(key, qty); clear() }` (localStorage key `cfc.bag.v1`).
  - `ProductSummary` + `toSummary(p: Product): ProductSummary`.
  - `defaultValueIndex(o: OptionDef): number`.
  - `<BagCount />`, `<QuickAddButton product={ProductSummary} label?="Add" />`.
  - Test helper `renderWithChrome(ui)` in `src/test/chrome.tsx`.

- [ ] **Step 1: Write the failing test `src/lib/bag/items.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { MAX_QTY, addLine, countItems, lineKey, parseBag, setQty } from './items';

const white = { colour: { v: 'white', l: 'White' }, size: { v: '50', l: '50' } };

describe('bag lines', () => {
  it('one line per product and options, options sorted', () => {
    expect(lineKey('JK-001', { size: { v: '50', l: '50' }, colour: { v: 'white', l: 'White' } })).toBe('JK-001|colour=white&size=50');
  });
  it('adding the same thing again raises the quantity, never beyond 9', () => {
    let items = addLine([], 'JK-001', white, 1);
    items = addLine(items, 'JK-001', white, 20);
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(MAX_QTY);
  });
  it('other options make another line', () => {
    const items = addLine(addLine([], 'JK-001', white), 'JK-001', { ...white, size: { v: '52', l: '52' } });
    expect(items).toHaveLength(2);
    expect(countItems(items)).toBe(2);
  });
  it('quantity 0 removes the line', () => {
    const items = addLine([], 'OB-011', {});
    expect(setQty(items, items[0].key, 0)).toEqual([]);
  });
});

describe('parseBag', () => {
  it('survives garbage', () => {
    expect(parseBag('{not json')).toEqual([]);
    expect(parseBag('{"a":1}')).toEqual([]);
    expect(parseBag(null)).toEqual([]);
  });
  it('keeps the valid lines, repairs keys, drops the rest', () => {
    const raw = JSON.stringify([
      { key: 'stale', id: 'JK-001', qty: 2, opts: { size: { v: '50', l: '50' }, bad: 7 } },
      { id: 42, qty: 1 },
      { id: 'OB-011', qty: 0 },
      { id: 'OB-011', qty: 30, opts: null },
    ]);
    expect(parseBag(raw)).toEqual([
      { key: 'JK-001|size=50', id: 'JK-001', qty: 2, opts: { size: { v: '50', l: '50' } } },
      { key: 'OB-011|', id: 'OB-011', qty: 9, opts: {} },
    ]);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/lib/bag/items.test.ts`
Expected: FAIL — cannot resolve `./items`.

- [ ] **Step 3: Write `src/lib/bag/items.ts`**

```ts
/** A chosen option: v = value id, l = label shown in the bag. */
export interface BagOption { v: string; l: string }
export type BagOptions = Record<string, BagOption>;
export interface BagLine { key: string; id: string; qty: number; opts: BagOptions }

export const MAX_QTY = 9;

/** One line per product + chosen options: "JK-001|colour=white&size=50". */
export const lineKey = (id: string, opts: BagOptions): string =>
  `${id}|${Object.keys(opts).sort().map((k) => `${k}=${opts[k].v}`).join('&')}`;

export function addLine(items: readonly BagLine[], id: string, opts: BagOptions, qty = 1): BagLine[] {
  const key = lineKey(id, opts);
  if (items.some((i) => i.key === key)) {
    return items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i));
  }
  return [...items, { key, id, qty: Math.min(MAX_QTY, Math.max(1, qty)), opts }];
}

export function setQty(items: readonly BagLine[], key: string, qty: number): BagLine[] {
  return items.map((i) => (i.key === key ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)).filter((i) => i.qty > 0);
}

export const countItems = (items: readonly BagLine[]): number => items.reduce((n, i) => n + i.qty, 0);

const isOption = (o: unknown): o is BagOption =>
  typeof o === 'object' && o !== null && typeof (o as BagOption).v === 'string' && typeof (o as BagOption).l === 'string';

/** What localStorage holds, cleaned: anything broken or foreign is dropped instead of breaking the bag. */
export function parseBag(raw: string | null): BagLine[] {
  let data: unknown;
  try { data = JSON.parse(raw ?? '[]'); } catch { return []; }
  if (!Array.isArray(data)) return [];
  return data.flatMap((x): BagLine[] => {
    if (typeof x !== 'object' || x === null) return [];
    const { id, qty, opts } = x as Record<string, unknown>;
    if (typeof id !== 'string' || typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) return [];
    const clean: BagOptions = typeof opts === 'object' && opts !== null
      ? Object.fromEntries(Object.entries(opts).filter(([, v]) => isOption(v))) as BagOptions
      : {};
    return [{ key: lineKey(id, clean), id, qty: Math.min(MAX_QTY, qty), opts: clean }];
  });
}
```

- [ ] **Step 4: Run it**

Run: `npx vitest run src/lib/bag/items.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Write the failing test `src/lib/bag/store.test.tsx`**

```tsx
// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useBag } from './store';

describe('useBag', () => {
  afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });

  it('adds, counts and persists under cfc.bag.v1', () => {
    const { result } = renderHook(() => useBag());
    act(() => result.current.add('OB-011', {}));
    act(() => result.current.add('OB-011', {}));
    expect(result.current.count).toBe(2);
    expect(JSON.parse(localStorage.getItem('cfc.bag.v1')!)).toHaveLength(1);
  });

  it('follows changes made in another tab', () => {
    const { result } = renderHook(() => useBag());
    act(() => {
      localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'JK-001', qty: 3, opts: {} }]));
      window.dispatchEvent(new StorageEvent('storage', { key: 'cfc.bag.v1' }));
    });
    expect(result.current.count).toBe(3);
  });

  it('keeps working in memory when storage is blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const { result } = renderHook(() => useBag());
    act(() => result.current.add('JK-001', {}));
    expect(result.current.count).toBe(1);
  });
});
```

- [ ] **Step 6: Run it to see it fail**

Run: `npx vitest run src/lib/bag/store.test.tsx`
Expected: FAIL — cannot resolve `./store`.

- [ ] **Step 7: Write `src/lib/bag/store.ts`**

```ts
'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { addLine, countItems, parseBag, setQty, type BagLine, type BagOptions } from './items';

const KEY = 'cfc.bag.v1';
const EVENT = 'cfc:bag';
const EMPTY: BagLine[] = [];

/** When localStorage is blocked (private mode, full quota) the bag lives in memory for this page view. */
let blocked = false;
let memory: string | null = null;
let cachedRaw: string | null | undefined;
let cachedItems: BagLine[] = EMPTY;

function getRaw(): string | null {
  if (blocked) return memory;
  try { return window.localStorage.getItem(KEY); } catch { blocked = true; return memory; }
}
function setRaw(raw: string): void {
  memory = raw;
  if (blocked) return;
  try { window.localStorage.setItem(KEY, raw); } catch { blocked = true; }
}
function read(): BagLine[] {
  const raw = getRaw();
  if (raw !== cachedRaw) { cachedRaw = raw; cachedItems = parseBag(raw); }
  return cachedItems;
}
function write(items: BagLine[]): void {
  setRaw(JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}
function subscribe(onChange: () => void): () => void {
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) onChange(); };
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(EVENT, onChange); window.removeEventListener('storage', onStorage); };
}

export function useBag() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const add = useCallback((id: string, opts: BagOptions, qty = 1) => write(addLine(read(), id, opts, qty)), []);
  const set = useCallback((key: string, qty: number) => write(setQty(read(), key, qty)), []);
  const clear = useCallback(() => write([]), []);
  return { items, count: countItems(items), add, set, clear };
}
```

- [ ] **Step 8: Run it**

Run: `npx vitest run src/lib/bag`
Expected: PASS (9 tests).

- [ ] **Step 9: Write the failing test `src/lib/products/products.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { defaultValueIndex } from './options';
import { toSummary } from './summary';

const sh = PRODUCTS.find((p) => p.id === 'SH-001')!;

describe('options', () => {
  it('starts with the middle size, otherwise the first value', () => {
    const size = sh.options.find((o) => o.id === 'size')!;
    const colour = sh.options.find((o) => o.id === 'colour')!;
    expect(size.values![defaultValueIndex(size)].id).toBe('50');
    expect(defaultValueIndex(colour)).toBe(0);
    const ring = PRODUCTS.find((p) => p.id === 'BR-A')!.options.find((o) => o.id === 'size')!;
    expect(ring.values![defaultValueIndex(ring)].id).toBe('M');
  });
});

describe('toSummary', () => {
  it('is plain data the browser can receive', () => {
    const s = toSummary({ ...sh, priceCents: 28000 });
    expect(JSON.parse(JSON.stringify(s))).toEqual(s);
    expect(s).toMatchObject({ id: 'SH-001', code: 'SH / 001', href: '/atelier/fashion/sh-001/', priceCents: 28000, img: '/images/_sample/camp2/sh_grey_band.jpg' });
  });
});
```

- [ ] **Step 10: Write `src/lib/products/options.ts` and `src/lib/products/summary.ts`**

```ts
// src/lib/products/options.ts
import type { OptionDef } from '@/lib/types';

/** The value chosen before the buyer touches anything: the middle size, otherwise the first value. */
export const defaultValueIndex = (o: OptionDef): number => {
  const n = o.values?.length ?? 0;
  return o.type === 'size' && n > 2 ? Math.floor(n / 2) : 0;
};
```

```ts
// src/lib/products/summary.ts
import { slotSrc } from '@/lib/images';
import type { OptionDef, Product, ProductKind } from '@/lib/types';

/** What the browser needs to know about a product (bag, quick add): plain data, no functions. */
export interface ProductSummary {
  id: string;
  code: string;
  name: string;
  sub: string;
  kind: ProductKind;
  href: string;
  img: string | null;
  ground: boolean;
  pos: string | null;
  priceCents: number | null;
  lead: string;
  options: OptionDef[];
  work: { id: string; edition: 'poster' | 'archival' } | null;
}

export function toSummary(p: Product): ProductSummary {
  return {
    id: p.id, code: p.code, name: p.name, sub: p.sub ?? p.material, kind: p.kind, href: p.href,
    img: slotSrc(p.images[0]), ground: !!p.ground, pos: p.pos ?? null,
    priceCents: p.priceCents ?? null, lead: p.lead, options: p.options, work: p.work ?? null,
  };
}
```

Run: `npx vitest run src/lib/products`
Expected: PASS.

- [ ] **Step 11: Write the test helper `src/test/chrome.tsx`**

```tsx
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { Toast } from '@/components/chrome/Toast';

/** Renders inside the page chrome; the test file must mock next/navigation's usePathname. */
export const renderWithChrome = (ui: ReactElement) => render(<ChromeProvider>{ui}<Toast /></ChromeProvider>);
```

- [ ] **Step 12: Write the failing test `src/components/shop/QuickAdd.test.tsx`**

```tsx
// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/' }));
import { QuickAddButton } from './QuickAdd';

const summary = (id: string) => toSummary({ ...PRODUCTS.find((p) => p.id === id)!, priceCents: 26000 });
const stored = () => JSON.parse(localStorage.getItem('cfc.bag.v1') ?? '[]');

describe('QuickAddButton', () => {
  afterEach(() => localStorage.clear());

  it('asks for the choices first and adds with them', () => {
    renderWithChrome(<QuickAddButton product={summary('SH-001')} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    fireEvent.click(screen.getByRole('button', { name: '52' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(stored()[0]).toMatchObject({ id: 'SH-001', qty: 1, opts: { colour: { v: 'light-grey' }, size: { v: '52' } } });
    expect(screen.getByRole('status')).toHaveTextContent('SH / 001 // shirt, grey band is in your bag.');
  });

  it('prints with a choice of state send you to the work page', () => {
    renderWithChrome(<QuickAddButton product={summary('LP-02.P')} />);
    expect(screen.getByRole('link', { name: 'Choose & add' })).toHaveAttribute('href', '/studio/layer-paintings/lp-02/');
  });
});
```

- [ ] **Step 13: Run it to see it fail**

Run: `npx vitest run src/components/shop`
Expected: FAIL — cannot resolve `./QuickAdd`.

- [ ] **Step 14: Write `src/components/shop/BagCount.tsx` and `src/components/shop/QuickAdd.tsx`**

```tsx
// src/components/shop/BagCount.tsx
'use client';

import { useBag } from '@/lib/bag/store';

/** The number in "Bag ( n )". */
export function BagCount() {
  const { count } = useBag();
  return <>{count}</>;
}
```

```tsx
// src/components/shop/QuickAdd.tsx
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { useChrome } from '@/components/chrome/ChromeProvider';
import type { BagOptions } from '@/lib/bag/items';
import { useBag } from '@/lib/bag/store';
import { cx } from '@/lib/cx';
import { fmtPrice } from '@/lib/format';
import { defaultValueIndex } from '@/lib/products/options';
import type { ProductSummary } from '@/lib/products/summary';

/** "Add" on a tile: adds at once, or first asks for size, colour … in a small box. */
export function QuickAddButton({ product, label = 'Add' }: { product: ProductSummary; label?: string }) {
  const { add } = useBag();
  const { showToast } = useChrome();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);
  const choices = product.options.filter((o) => o.type !== 'text');

  if (product.kind === 'print' && product.options.length) {
    return <Link className="link-u" href={product.href}>Choose &amp; add</Link>;
  }
  const commit = (opts: BagOptions) => {
    add(product.id, opts);
    showToast(`${product.code} // ${product.name} is in your bag.`, { href: '/bag/', label: 'View bag  →' });
    setOpen(false);
  };
  return (
    <>
      <button
        ref={button}
        type="button"
        aria-haspopup={choices.length ? 'dialog' : undefined}
        aria-expanded={choices.length ? open : undefined}
        onClick={() => (choices.length ? setOpen((o) => !o) : commit({}))}
      >
        {label}
      </button>
      {open && <QuickAddBox anchor={button} product={product} onAdd={commit} onClose={close} />}
    </>
  );
}

function QuickAddBox({ anchor, product, onAdd, onClose }: { anchor: RefObject<HTMLButtonElement | null>; product: ProductSummary; onAdd: (o: BagOptions) => void; onClose: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const choices = product.options.filter((o) => o.type !== 'text');
  const [picked, setPicked] = useState<Record<string, number>>(() => Object.fromEntries(choices.map((o) => [o.id, defaultValueIndex(o)])));

  // place the box under the button, right-aligned; above it when there is no room below
  useLayoutEffect(() => {
    const a = anchor.current?.getBoundingClientRect();
    const el = box.current;
    if (!a || !el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    el.style.left = `${Math.max(12, Math.min(window.innerWidth - w - 12, a.right - w))}px`;
    el.style.top = `${a.bottom + h + 12 > window.innerHeight ? Math.max(12, a.top - h - 8) : a.bottom + 8}px`;
    el.style.visibility = 'visible';
  }, [anchor]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!box.current?.contains(t) && !anchor.current?.contains(t)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { onClose(); anchor.current?.focus(); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onClose, { passive: true });
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onClose);
    };
  }, [anchor, onClose]);

  const submit = () => onAdd(Object.fromEntries(choices.map((o) => {
    const v = o.values![picked[o.id]];
    return [o.id, { v: v.id, l: v.label }];
  })));

  return createPortal(
    <div ref={box} className="qa" role="dialog" aria-label={`Choose and add ${product.code}`} style={{ visibility: 'hidden' }}>
      <div className="qa__h"><b>{product.code}</b><span>{fmtPrice(product.priceCents)}</span></div>
      {choices.map((o) => (
        <div className="qa__o" key={o.id}>
          <span>{o.label}</span>
          <div className="qa__c">
            {(o.values ?? []).map((v, i) => (
              <button key={v.id} type="button" className={cx('chip', picked[o.id] === i && 'is-on')} aria-pressed={picked[o.id] === i} onClick={() => setPicked((p) => ({ ...p, [o.id]: i }))}>{v.label}</button>
            ))}
          </div>
        </div>
      ))}
      <button className="pill" type="button" onClick={submit}>Add to bag</button>
    </div>,
    document.body,
  );
}
```

- [ ] **Step 15: Run the tests and checks**

Run: `npx vitest run && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "$(printf 'Add the bag store, product summaries and quick add\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 9: Port the UI component library

**Files:**
- Create: `src/components/link.tsx`, `src/components/soon.tsx`, `src/components/ui/{img,sign,window,text,marks,elevation}.tsx`, `src/components/ui/index.ts`, `src/components/blocks.tsx`, `src/components/quiet.tsx`, `src/components/tiles.tsx`, `src/components/ui/ui.test.tsx`
- Move: `legacy/src/components/source.tsx` → `src/components/source.tsx` (unchanged)
- Modify: `src/styles/components.css` (append `.soon`)

**Interfaces:**
- Consumes: `cx`, `slotSrc`/`resolveSlot`, `signGeometry`, `QuickAddButton`, `toSummary`, `fmtPrice`, `fmtDate`, `SOON`/`SoonKey`/`isSoon`/`soonHref`/`soonLabel`, `SITE`.
- Produces (all importable from `@/components/ui` unless noted):
  - `A({ href, ...anchorProps })`, `isInternal(href)` — `@/components/link`.
  - `Soon({ k, children?, className?, note? })` — `@/components/soon`: the red label while the entry is coming soon; once it is `live`, a plain link to its page (plain text if it has none). Every place that names a coming-soon entry goes through `Soon` (or `soonHref`), so switching an entry to `live` links it everywhere.
  - `Img`, `Plate`, `RedFade`, `OutPlate`, `Sign`, `MarkBar`, `RunOff`, `Br`, `Lens`, `Raw`, `md`, `Kick`, `Micro`, `Title`, `Narrate`, `Hair`, `Rule`, `Crumb`, `Museum`, `TitleBlock`, `Register` (`RegisterRow.soon?`), `Pill` (`href` required), `Coming`, `AxisV`, `AxisH`, `LevelMark`, `SectionAA`, `Opening`, `NotIn`, `Diag`, `Redact`, `Dim`, `ShopPoint` (`product?: ProductSummary` instead of `id`), `Steps`, `Elevation`, `cx`.
  - `@/components/blocks`: `type WayIn = { label; href } | { label; soon }`, `SecHead`, `Room`, `Prose`, `Rows` (`RowItem.soon?`), `LinkRow({ links: WayIn[] })`, `PillRow`, `Statement`, `Lede`.
  - `@/components/quiet`: `QOpen`, `QCap`, `Sp`, `QEnd`, `Tx`.
  - `@/components/tiles`: `AddLink`, `Tile`, `ComingTile`, `Rail`, `PlateRow`, `IndexGrid`.

- [ ] **Step 1: Write the failing test `src/components/ui/ui.test.tsx`**

```tsx
// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/' }));
import { SecHead } from '@/components/blocks';
import { Soon } from '@/components/soon';
import { Tile } from '@/components/tiles';
import { Img, Register } from '@/components/ui';

describe('ui', () => {
  afterEach(() => { delete process.env.IMAGES; });

  it('Img shows the named placeholder when a slot has no picture', () => {
    process.env.IMAGES = 'placeholders';
    render(<Img slot="fashion/JK-001" ratio="4/5" />);
    expect(screen.getByRole('img', { name: 'Placeholder: fashion/JK-001' })).toBeInTheDocument();
  });

  it('Img renders an optimised picture for a sample slot', () => {
    const { container } = render(<Img slot="fashion/SH-001" ratio="4/5" alt="SH / 001" />);
    expect(container.querySelector('img')?.getAttribute('src')).toContain(encodeURIComponent('/images/_sample/camp2/sh_grey_band.jpg'));
  });

  it('Soon is red text, never a link', () => {
    const { container } = render(<Soon k="furniture" />);
    expect(container.querySelector('a')).toBeNull();
    expect(container).toHaveTextContent('Furniture ( )coming soon');
  });

  it('Tile links the product, shows the price and an Add button', () => {
    const p = { ...PRODUCTS.find((x) => x.id === 'SH-001')!, priceCents: 26000 };
    renderWithChrome(<Tile p={p} />);
    expect(screen.getByRole('link', { name: 'SH / 001 shirt, grey band' })).toHaveAttribute('href', '/atelier/fashion/sh-001/');
    expect(screen.getByText('€ 260')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('SecHead and Register turn soon entries into labels', () => {
    const { container } = render(
      <>
        <SecHead kick="k" title="t" text="x" links={[{ label: 'Bags', href: '/atelier/bags/' }, { label: 'Read the text', soon: 'bagText' }]} />
        <Register rows={[{ no: '03', name: 'Bag / Profile Series', soon: 'bagText' }]} />
      </>,
    );
    expect([...container.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(['/atelier/bags/']);
    expect(container.querySelectorAll('.soon')).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/components/ui`
Expected: FAIL — cannot resolve `@/components/blocks`.

- [ ] **Step 3: Write `src/components/link.tsx` and `src/components/soon.tsx`**

```tsx
// src/components/link.tsx
import Link from 'next/link';
import type { ComponentProps } from 'react';

/** Links inside the site go through next/link; mail, other sites and #anchors stay a plain <a>. */
export const isInternal = (href: string): boolean => href.startsWith('/') && !href.startsWith('//');

export function A({ href, ...rest }: ComponentProps<'a'> & { href: string }) {
  return isInternal(href) ? <Link href={href} {...rest} /> : <a href={href} {...rest} />;
}
```

```tsx
// src/components/soon.tsx
import type { ReactNode } from 'react';
import { A } from '@/components/link';
import { SOON, isSoon, soonHref, soonLabel, type SoonKey } from '@/content/soon';
import { cx } from '@/lib/cx';

/**
 * Drawn, not built: red, empty brackets, "coming soon" — never a link.
 * Once the entry is switched to 'live' in src/content/soon.ts: a plain link to its page (plain text if it has none).
 */
export function Soon({ k, children, className, note = true }: { k: SoonKey; children?: ReactNode; className?: string; note?: boolean }) {
  if (!isSoon(k)) {
    const href = soonHref(k);
    const text = children ?? SOON[k].label;
    return href ? <A href={href} className={className}>{text}</A> : <span className={className}>{text}</span>;
  }
  return (
    <span className={cx('soon', className)} data-soon={k}>
      <span className="soon__t">{children ?? soonLabel(k)}</span>
      {note && <small className="soon__n">coming soon</small>}
    </span>
  );
}
```

Append to `src/styles/components.css`:

```css
/* ── coming soon: drawn, not built — red, never a link ─────────────────────── */
.soon { color: var(--red); cursor: default; }
.soon__t { background: repeating-linear-gradient(to right, var(--red) 0 16px, transparent 16px 19px, var(--red) 19px 21px, transparent 21px 24px, var(--red) 24px 26px, transparent 26px 29px) bottom / 100% 1px no-repeat; padding-bottom: 2px; }
.soon__n { margin-left: .7em; font-size: 9.5px; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }
```

- [ ] **Step 4: Write `src/components/ui/img.tsx`**

```tsx
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { A } from '@/components/link';
import { cx } from '@/lib/cx';
import { resolveSlot } from '@/lib/images';

export interface ImgProps {
  /** slot key = the file name in public/images, without extension */
  slot: string;
  /** CSS aspect ratio of the box, e.g. "4/5"; omit when the parent sets the size */
  ratio?: string;
  pos?: string;
  sizes?: string;
  alt?: string;
  eager?: boolean;
  /** design width at 1440 px — documents the slot size (IMAGE-SLOTS.md) */
  w?: number;
  /** object photographs on a ground: shown whole, on paper */
  ground?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  as?: 'span' | 'figure' | 'div';
}

export function Img({ slot, ratio, pos, sizes = '(min-width: 1440px) 1440px, 100vw', alt = '', eager, ground, className, style, children, as: Tag = 'span' }: ImgProps) {
  const r = resolveSlot(slot);
  const st: CSSProperties = { ...(ratio ? { aspectRatio: ratio } : {}), ...style };
  if (!r.src) {
    return (
      <Tag className={cx('img', 'img--ph', className)} style={st} data-slot={slot} data-source="none" role="img" aria-label={alt || `Placeholder: ${slot}`}>
        <svg className="ph__x" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="0" x2="100" y2="100" /><line x1="100" y1="0" x2="0" y2="100" />
          <line x1="50" y1="0" x2="50" y2="100" className="ph__axis" /><line x1="0" y1="50" x2="100" y2="50" className="ph__axis" />
        </svg>
        <span className="ph__id">{slot}</span>
        <span className="ph__ratio">{(ratio ?? 'fill').replace('/', ' : ')}</span>
        {children}
      </Tag>
    );
  }
  return (
    <Tag className={cx('img', ground && 'img--ground', className)} style={st} data-slot={slot} data-source={r.source}>
      <Image src={r.src} alt={alt} fill sizes={sizes} preload={eager} loading={eager ? 'eager' : undefined} style={pos ? { objectPosition: pos } : undefined} />
      {children}
    </Tag>
  );
}

/** A picture with marks laid over it; the marks' % refer to this box. */
export function Plate({ slot, ratio, pos, w, ground, children, className, alt, eager, sizes }: { slot: string; ratio?: string; pos?: string; w?: number; ground?: boolean; children?: ReactNode; className?: string; alt?: string; eager?: boolean; sizes?: string }) {
  return <Img slot={slot} ratio={ratio} pos={pos} w={w} ground={ground} className={cx('plate', className)} alt={alt} eager={eager} sizes={sizes} as="figure">{children && <span className="over">{children}</span>}</Img>;
}

export const RedFade = ({ h = 'clamp(90px, 10vw, 150px)' }: { h?: string }) => <span className="redfade" style={{ '--h': h } as CSSProperties} aria-hidden="true" />;

/** Closing plate: a big picture with a red fade at its lower edge and a line of text. */
export function OutPlate({ slot, pos, title, line, href, ratio = '1248/600' }: { slot: string; pos?: string; title: ReactNode; line?: ReactNode; href: string; ratio?: string }) {
  return (
    <A className="out" href={href}>
      <Img slot={slot} ratio={ratio} pos={pos} w={1248} className="out__img" sizes="(min-width:1440px) 1248px, 92vw">
        <RedFade />
        <span className="out__t"><b>{title}</b></span>
        {line && <span className="out__l">{line}</span>}
      </Img>
    </A>
  );
}
```

- [ ] **Step 5: Write `src/components/ui/sign.tsx`**

```tsx
import type { CSSProperties, ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { signGeometry } from '@/lib/sign/geometry';

export interface SignProps {
  word?: string;
  /** window: ink = black bar, open = see-through, red = red bar */
  win?: 'ink' | 'open' | 'red';
  className?: string;
  style?: CSSProperties;
  /** show the word inside the brackets instead of the empty window */
  showWord?: boolean;
  children?: ReactNode;
}

/** The long-form sign C ONCEPT. ( WORD ) C OLLECTIVE . — only the red marks and the window are visible. */
export function Sign({ word = 'ATELIER', win = 'ink', className, style, showWord, children }: SignProps) {
  const g = signGeometry(word);
  const st = { '--tot': g.tot.toFixed(4), '--wl': g.winLeft.toFixed(5), ...style } as CSSProperties;
  return (
    <span className={cx('sign', `sign--${win}`, className)} style={st} aria-hidden="true">
      <span className="sg-m">C</span><span className="sg-h">ONCEPT</span><span className="sg-m">. </span>
      <span className="sg-g">
        <span className="sg-win" />
        <span className="sg-m sg-br">(</span><span className={cx('sg-word', !showWord && 'sg-h')}>{word.toUpperCase()}</span><span className="sg-m sg-br">)</span>
      </span>
      <span className="sg-m"> C</span><span className="sg-h">OLLECTIVE</span><span className="sg-m"> .</span>
      {children}
    </span>
  );
}

/** The sign as a block in the page: bar, ghost, with a caption. */
export function MarkBar({ word = 'ATELIER', w = '82%', win = 'ink', ghost, caption, className, style }: { word?: string; w?: string; win?: 'ink' | 'red' | 'open'; ghost?: boolean; caption?: string; className?: string; style?: CSSProperties }) {
  return (
    <div className={cx('markbar', ghost && 'markbar--ghost', className)} style={style}>
      <div className="markbar__in" style={{ width: w }}><Sign word={word} win={win} /></div>
      {caption && <p className="micro markbar__cap">{caption}</p>}
    </div>
  );
}

/** The sign, large, running off the right edge of the page. */
export function RunOff({ word = 'ATELIER', win = 'ink' }: { word?: string; win?: 'ink' | 'red' }) {
  return <div className="runoff" aria-hidden="true"><div className="runoff__in"><Sign word={word} win={win} /></div></div>;
}

/** ( ) as a decorative inline. */
export const Br = ({ children = '' }: { children?: ReactNode }) => <span className="br">( {children}{children ? ' ' : ''})</span>;
```

- [ ] **Step 6: Write `src/components/ui/window.tsx`**

```tsx
import type { CSSProperties } from 'react';
import { cx } from '@/lib/cx';
import { slotSrc } from '@/lib/images';

/** The lens: the picture blurred, sharp only between the brackets, flush to their inner edge. */
export function Lens({ slot, ratio = '1248/700', pos = 'center', fx = 46, fy = 50, cw = 43, ch = 24, blur = 14, caption, className }: { slot: string; ratio?: string; pos?: string; fx?: number; fy?: number; cw?: number; ch?: number; blur?: number; caption?: string; className?: string }) {
  const src = slotSrc(slot);
  const bg = src ? { backgroundImage: `url(${src})`, backgroundPosition: pos } : undefined;
  const st = { aspectRatio: ratio, '--blur': `${blur}px`, '--lx': fx - cw / 2, '--ty': fy - ch / 2, '--cw': cw, '--chh': ch } as CSSProperties;
  return (
    <figure className={cx('lens', className)}>
      <div className="lens__box" style={st} data-slot={slot}>
        <div className={cx('lens__bg', !src && 'img--ph')} style={bg}>{!src && <span className="ph__id">{slot}</span>}</div>
        <div className="bwin lens__bw" aria-hidden="true">
          <span className="bwin__g bwin__g--l">(</span>
          <span className="bwin__pic"><span className="lens__sharp" style={bg} /></span>
          <span className="bwin__g bwin__g--r">)</span>
        </div>
      </div>
      {caption && <figcaption className="micro lens__cap">{caption}</figcaption>}
    </figure>
  );
}
```

- [ ] **Step 7: Write `src/components/ui/text.tsx`**

```tsx
import type { ReactNode } from 'react';
import { A } from '@/components/link';
import { Soon } from '@/components/soon';
import { isSoon, soonHref, type SoonKey } from '@/content/soon';
import { cx } from '@/lib/cx';

/** Authored copy from src/content may contain <i> and &nbsp; — rendered as HTML. Never user input. */
export const Raw = ({ html, as: T = 'span', className }: { html: string; as?: 'span' | 'p' | 'div'; className?: string }) => <T className={className} dangerouslySetInnerHTML={{ __html: html }} />;
/** `*italic*` in authored copy */
export const md = (s: string): string => s.replace(/\*([^*]+)\*/g, '<i>$1</i>');

export const Kick = ({ children, className }: { children: ReactNode; className?: string }) => <p className={cx('kick', className)}>{children}</p>;
export const Micro = ({ children, className, as: T = 'p' }: { children: ReactNode; className?: string; as?: 'p' | 'span' }) => <T className={cx('micro', className)}>{children}</T>;
export const Title = ({ children, className, as: T = 'h1' }: { children: ReactNode; className?: string; as?: 'h1' | 'h2' }) => <T className={cx('title', className)}>{children}</T>;

export function Narrate({ children, className, size, id }: { children: ReactNode; className?: string; size?: 'l'; id?: string }) {
  return <div className={cx('narr', size === 'l' && 'narr--l', className)} id={id}><span className="narr__lead" aria-hidden="true" /><p className="narr__txt">{children}</p></div>;
}
export const Hair = ({ left, right, id, className, children }: { left?: ReactNode; right?: ReactNode; id?: string; className?: string; children?: ReactNode }) => (
  <div className={cx('hair', className)} id={id}><span className="hair__l">{left}</span>{right && <span className="hair__r">{right}</span>}{children}</div>
);
export const Rule = ({ title, note, right, id, className }: { title: ReactNode; note?: ReactNode; right?: ReactNode; id?: string; className?: string }) => (
  <div className={cx('rule', className)} id={id}><span className="rule__l"><b>{title}</b>{note && <span className="rule__note">{note}</span>}</span>{right && <span className="rule__r">{right}</span>}</div>
);
export const Crumb = ({ items }: { items: { label: string; href?: string }[] }) => (
  <nav className="crumb" aria-label="Breadcrumb">/// {items.map((c, i) => <span key={i}>{i > 0 && ' / '}{c.href ? <A href={c.href}>{c.label}</A> : c.label}</span>)}</nav>
);
export function Museum({ rows, className, light }: { rows: [string, ReactNode][]; className?: string; light?: boolean }) {
  return <dl className={cx('museum', light && 'museum--light', className)}>{rows.map(([k, v], i) => <div key={i}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>;
}
export function TitleBlock({ rows, className }: { rows: [[string, ReactNode], ([string, ReactNode] | null)?][]; className?: string }) {
  return (
    <div className={cx('tblock', className)} role="group" aria-label="Sheet">
      {rows.map((r, i) => <div className="tblock__row" key={i}>{r.map((c, k) => c && <div key={k}><span>{c[0]}</span><b>{c[1]}</b></div>)}</div>)}
    </div>
  );
}

/** `soon`: red and unlinked while the entry is coming soon, linked to its page once it is live. */
export interface RegisterRow { no: string; name: ReactNode; meta?: ReactNode; href?: string; link?: string; red?: boolean; current?: boolean; soon?: SoonKey }
export function Register({ rows }: { rows: RegisterRow[] }) {
  return (
    <ul className="register">
      {rows.map((r, i) => {
        const soon = r.soon !== undefined && isSoon(r.soon);
        const href = r.soon ? soonHref(r.soon) : r.href;
        return (
          <li key={i} className={cx((r.red || soon) && 'is-red', r.current && 'is-current')}>
            <span className="register__no">{r.no}</span><span className="register__name">{r.name}</span><span className="register__meta">{r.meta}</span>
            <span className="register__go">{r.soon && soon ? <Soon k={r.soon}>( )</Soon> : href ? <A href={href}>{r.link ?? 'Open'}&nbsp;&nbsp;→</A> : r.link}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function Pill({ href, children, ghost, className }: { href: string; children: ReactNode; ghost?: boolean; className?: string }) {
  return <A className={cx('pill', ghost && 'pill--ghost', className)} href={href}>{children}</A>;
}

export const Coming = ({ title, text, link, href, className, id }: { title: ReactNode; text?: ReactNode; link?: ReactNode; href?: string; className?: string; id?: string }) => (
  <aside className={cx('coming', className)} id={id}>
    <div className="coming__l"><h3 className="coming__t">{title}</h3>{text && <p className="coming__p">{text}</p>}</div>
    {link && <div className="coming__r">{href ? <A href={href}>{link}</A> : link}</div>}
  </aside>
);
```

- [ ] **Step 8: Write `src/components/ui/marks.tsx`** — the marks of `legacy/src/components/ui.tsx`; `Opening` now uses `A`, `ShopPoint` takes a `ProductSummary` instead of an id:

```tsx
import type { CSSProperties } from 'react';
import { A } from '@/components/link';
import { QuickAddButton } from '@/components/shop/QuickAdd';
import { cx } from '@/lib/cx';
import type { ProductSummary } from '@/lib/products/summary';

/* marks laid over a picture — coordinates in % of the picture */
const lc = (light?: boolean) => (light ? 'is-light' : '');

export function AxisV({ x, letter, light, y0 = 0 }: { x: number; letter?: string; light?: boolean; y0?: number }) {
  return <span className={cx('mk mk-axisv', lc(light))} style={{ left: `${x}%`, top: `${y0}%` }} aria-hidden="true">{letter && <i>{letter}</i>}</span>;
}
export function AxisH({ y, light, x0 = 0, x1 = 100 }: { y: number; light?: boolean; x0?: number; x1?: number }) {
  return <span className={cx('mk mk-axish', lc(light))} style={{ top: `${y}%`, left: `${x0}%`, right: `${100 - x1}%` }} aria-hidden="true" />;
}
export function LevelMark({ x, y, label, len = 150, light }: { x: number; y: number; label: string; len?: number; light?: boolean }) {
  return <span className={cx('mk mk-level', lc(light))} style={{ left: `${x}%`, top: `${y}%`, '--len': `${len}px` } as CSSProperties} aria-hidden="true"><svg viewBox="0 0 12 9" width="12" height="9"><path d="M.5 .5 H11.5 L6 8.5 Z" /></svg><em>{label}</em></span>;
}
export function SectionAA({ y, inset = 5, light, fs = 'clamp(14px,1.3vw,19px)' }: { y: number; inset?: number; light?: boolean; fs?: string }) {
  return <span className={cx('mk mk-aa', lc(light))} style={{ top: `${y}%`, left: `${inset}%`, right: `${inset}%`, '--fs': fs } as CSSProperties} aria-hidden="true"><b>(</b><b>A</b><i /><b>A</b><b>)</b></span>;
}

/** Capsule with a cross: the link from a picture to the piece named in it. */
export function Opening({ x, y, w = 11, label, href, light }: { x: number; y: number; w?: number; label?: string; href?: string; light?: boolean }) {
  const inner = (<><svg viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><rect x=".5" y=".5" width="99" height="29" rx="9" ry="14.5" /><line x1="16" y1="1.5" x2="84" y2="28.5" /><line x1="16" y1="28.5" x2="84" y2="1.5" /></svg>{label && <em>{label}</em>}</>);
  const st = { left: `${x}%`, top: `${y}%`, '--w': `${w}%` } as CSSProperties;
  return href ? <A className={cx('mk mk-open', lc(light))} style={st} href={href}>{inner}</A> : <span className={cx('mk mk-open', lc(light))} style={st} aria-hidden="true">{inner}</span>;
}

export function NotIn({ x, y, lx, ly, label, note = 'not in the collection', light, side }: { x: number; y: number; lx: number; ly: number; label: string; note?: string; light?: boolean; side?: -1 }) {
  return (
    <>
      <svg className={cx('mk mk-svg mk-notin-l', lc(light))} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={x} y1={y} x2={lx} y2={ly} vectorEffect="non-scaling-stroke" /></svg>
      <span className="mk mk-dot" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true" />
      <span className={cx('mk mk-notin', lc(light), side === -1 && 'is-left')} style={{ left: `${lx}%`, top: `${ly}%` }}><span className="r">( )</span>&nbsp; {label}<small>{note}</small></span>
    </>
  );
}
export function Diag({ x1, y1, x2, y2, label, lx, ly, light, lw = 30 }: { x1: number; y1: number; x2: number; y2: number; label?: string; lx?: number; ly?: number; light?: boolean; lw?: number }) {
  return (
    <>
      <svg className={cx('mk mk-svg mk-diag', lc(light))} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={x1} y1={y1} x2={x2} y2={y2} vectorEffect="non-scaling-stroke" /></svg>
      <span className={cx('mk mk-dot', lc(light), 'is-grey')} style={{ left: `${x2}%`, top: `${y2}%` }} aria-hidden="true" />
      {label && <span className={cx('mk mk-cap', lc(light))} style={{ left: `${lx ?? x1}%`, top: `${ly ?? y1 - 3}%`, width: `${lw}%` }}>{label}</span>}
    </>
  );
}
export function Redact({ x, y, w, h, label, light }: { x: number; y: number; w: number; h: number; label?: string; light?: boolean }) {
  return <span className={cx('mk mk-redact', lc(light))} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }} aria-hidden="true">{label && <em><span className="r">( )</span>&nbsp; {label}</em>}</span>;
}
export function Dim({ x1, x2, y, label, light }: { x1: number; x2: number; y: number; label: string; light?: boolean }) {
  return <span className={cx('mk mk-dim', lc(light))} style={{ left: `${x1}%`, right: `${100 - x2}%`, top: `${y}%` }} aria-hidden="true"><em>{label}</em></span>;
}

/** A point in a picture with a card: code, name, price, Add (or View when there is no product). */
export function ShopPoint({ px, py, lx, ly, code, name, sub, price, href, side, product }: { px: number; py: number; lx: number; ly: number; code: string; name: string; sub?: string; price?: string; href: string; side?: -1; product?: ProductSummary }) {
  return (
    <>
      <svg className="mk mk-svg mk-diag is-light" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={px} y1={py} x2={lx} y2={ly} vectorEffect="non-scaling-stroke" /></svg>
      <A className="mk mk-sp" style={{ left: `${px}%`, top: `${py}%` }} href={href} aria-label={`${code} ${name}`}><i /></A>
      <span className={cx('mk mk-card', side === -1 && 'is-left')} style={{ left: `${lx}%`, top: `${ly}%` }}>
        <b>{code}</b>&nbsp; // {name}<small>{sub}</small>
        <span className="mk-card__buy">{price ?? '€ [price]'}&nbsp;&nbsp; {product ? <QuickAddButton product={product} /> : <A href={href}>View</A>}</span>
      </span>
    </>
  );
}

/** The three steps: C — ( ) — C. running diagonally through a picture. */
export function Steps({ fs = 'clamp(36px, 10.4vw, 150px)' }: { fs?: string }) {
  return (
    <span className="mk mk-steps" style={{ '--fs': fs } as CSSProperties} aria-hidden="true">
      <b style={{ left: '5%', top: '4%' }}>C</b><b style={{ left: '22%', top: '40%' }} className="dot">.</b>
      <b style={{ left: '38%', top: '44%' }}>(</b><b style={{ left: '66%', top: '44%' }}>)</b><b style={{ left: '74%', top: '74%' }}>C</b><b style={{ left: '92%', top: '86%' }} className="dot">.</b>
    </span>
  );
}
```

- [ ] **Step 9: Write `src/components/ui/elevation.tsx`**

```tsx
import { slotSrc } from '@/lib/images';

/** Wall elevation 1 : 10 with a 1.75 m figure; all measures in cm. */
export function Elevation({ slots, cw, ch, centre = 145, n = 1, gap = 0, label, dimW }: { slots: string[]; cw: number; ch: number; centre?: number; n?: number; gap?: number; label: string; dimW?: string }) {
  const W = 440, H = 250, floor = 215, k = 1.26; // 1 cm = k units of the drawing
  const pw = cw * k, phh = ch * k, tot = n * pw + (n - 1) * gap * k, cx0 = 180 - tot / 2, cy = floor - centre * k;
  const fx = cx0 + tot + 74;
  return (
    <figure className="elev">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <line x1="14" y1={floor} x2={W - 14} y2={floor} className="e-floor" />
        {Array.from({ length: n }).map((_, i) => {
          const x = cx0 + i * (pw + gap * k);
          const slot = slots[Math.min(i, slots.length - 1)];
          const src = slotSrc(slot);
          return (
            <g key={i}>
              <rect x={x} y={cy - phh / 2} width={pw} height={phh} className="e-work" />
              {src
                ? <image href={src} x={x + .5} y={cy - phh / 2 + .5} width={pw - 1} height={phh - 1} preserveAspectRatio="xMidYMid slice" />
                : <text x={x + pw / 2} y={cy} className="e-ph" textAnchor="middle">{slot}</text>}
            </g>
          );
        })}
        <g className="e-fig">
          <circle cx={fx} cy={floor - 164 * k} r={11 * k * .9} /><line x1={fx} y1={floor - 153 * k} x2={fx} y2={floor - 92 * k} />
          <line x1={fx} y1={floor - 146 * k} x2={fx - 20} y2={floor - 100 * k} /><line x1={fx} y1={floor - 146 * k} x2={fx + 20} y2={floor - 100 * k} />
          <line x1={fx} y1={floor - 92 * k} x2={fx - 14} y2={floor} /><line x1={fx} y1={floor - 92 * k} x2={fx + 14} y2={floor} />
        </g>
        <g className="e-dim">
          <line x1={cx0} y1={cy + phh / 2 + 14} x2={cx0 + tot} y2={cy + phh / 2 + 14} /><text x={cx0 + tot / 2} y={cy + phh / 2 + 12} textAnchor="middle">{dimW ?? `${cw} cm`}</text>
          <line x1={cx0 - 16} y1={cy - phh / 2} x2={cx0 - 16} y2={cy + phh / 2} /><text x={cx0 - 20} y={cy} textAnchor="middle" transform={`rotate(-90 ${cx0 - 20} ${cy})`}>{ch} cm</text>
          <line x1={W - 36} y1={floor} x2={W - 36} y2={cy} /><text x={W - 40} y={(floor + cy) / 2} textAnchor="middle" transform={`rotate(-90 ${W - 40} ${(floor + cy) / 2})`}>+ {(centre / 100).toFixed(2)} centre</text>
          <text x={fx} y={floor + 14} textAnchor="middle">1.75 m</text>
        </g>
      </svg>
      <figcaption className="micro">{label}</figcaption>
    </figure>
  );
}
```

- [ ] **Step 10: Write `src/components/ui/index.ts`**

```ts
export { cx } from '@/lib/cx';
export * from './elevation';
export * from './img';
export * from './marks';
export * from './sign';
export * from './text';
export * from './window';
```

- [ ] **Step 11: Write `src/components/blocks.tsx`**

```tsx
import type { ReactNode } from 'react';
import { A } from '@/components/link';
import { Tx } from '@/components/quiet';
import { Soon } from '@/components/soon';
import { Img } from '@/components/ui/img';
import { isSoon, soonHref, type SoonKey } from '@/content/soon';
import { cx } from '@/lib/cx';

/** A way into a section: a link, or the red label while it is coming soon. */
export type WayIn = { label: string; href: string } | { label: string; soon: SoonKey };
const Way = ({ w, className }: { w: WayIn; className?: string }) =>
  ('soon' in w ? <Soon k={w.soon} className={className}>{w.label}</Soon> : <A href={w.href} className={className}>{w.label}</A>);

/** A section head on the Home and hub pages: world, title, one paragraph, the ways in. */
export function SecHead({ kick, title, text, links, read, id }: { kick: ReactNode; title: ReactNode; text: ReactNode; links?: WayIn[]; read?: WayIn; id?: string }) {
  return (
    <header className="sech" id={id}>
      <div className="sech__l">
        <p className="micro sech__k">{kick}</p>
        <h2 className="sech__t">{title}</h2>
        <p className="sech__p">{text}</p>
      </div>
      <div className="sech__r">
        {read && ('soon' in read ? <Soon k={read.soon} className="sech__read">{read.label}</Soon> : <A className="sech__read" href={read.href}>{read.label}&nbsp;&nbsp;→</A>)}
        {links && <p className="sech__links">{links.map((l, i) => <span key={i}>{i > 0 && ' · '}<Way w={l} /></span>)}</p>}
      </div>
    </header>
  );
}

/** Image left (55 %), text right: the rooms of a hub. */
export function Room({ slot, pos, w = 690, kick, title, text, links, href, ratio = '690/620' }: { slot: string; pos?: string; w?: number; kick: string; title: string; text: string; links?: WayIn[]; href: string; ratio?: string }) {
  return (
    <section className="room">
      <A className="room__img" href={href} tabIndex={-1} aria-hidden="true"><Img slot={slot} ratio={ratio} pos={pos} w={w} sizes="(min-width:1440px) 690px, (min-width:900px) 52vw, 100vw" /></A>
      <div className="room__t">
        <div className="room__h"><div><p className="micro">{kick}</p><h2 className="room__title">{title}</h2></div><A className="room__go" href={href}>Enter&nbsp;&nbsp;→</A></div>
        <p className="room__p">{text}</p>
        {links && <p className="room__links">{links.map((l, i) => <span key={i}><Way w={l} /></span>)}</p>}
      </div>
    </section>
  );
}

/** Two columns of prose. */
export function Prose({ a, b }: { a: string[]; b: string[] }) {
  return <div className="prose"><Tx paras={a} /><Tx paras={b} /></div>;
}

export interface RowItem { no: string; title: ReactNode; meta: ReactNode; go: ReactNode; href?: string; red?: boolean; img?: { slot: string; pos?: string }; here?: boolean; soon?: SoonKey }

/** A hairline-ruled list of texts / campaigns; a `soon` row is red and unlinked until its entry is live. */
export function Rows({ rows }: { rows: RowItem[] }) {
  return (
    <ul className="rows">
      {rows.map((r, i) => {
        const soon = r.soon !== undefined && isSoon(r.soon);
        const to = r.soon ? soonHref(r.soon) : r.href;
        const pic = r.img && <Img slot={r.img.slot} ratio="240/150" pos={r.img.pos} w={240} sizes="240px" />;
        return (
          <li key={i} className={cx('rows__r', (r.red || soon) && 'is-red', r.img && 'has-img')}>
            {pic && (to ? <A className="rows__img" href={to} tabIndex={-1} aria-hidden="true">{pic}</A> : <span className="rows__img">{pic}</span>)}
            <span className="rows__no">{r.no}</span>
            <span className="rows__t">{to ? <A href={to}>{r.title}</A> : r.title}</span>
            <span className="rows__m">{r.meta}</span>
            <span className={cx('rows__go', r.here && 'is-here')}>{r.soon && soon ? <Soon k={r.soon}>( )</Soon> : to && !r.here ? <A href={to}>{r.go}</A> : r.go}</span>
          </li>
        );
      })}
    </ul>
  );
}

export const LinkRow = ({ links }: { links: WayIn[] }) => <p className="linkrow">{links.map((l, i) => <Way key={i} w={l} />)}</p>;
export const PillRow = ({ children }: { children: ReactNode }) => <div className="pills">{children}</div>;
export const Statement = ({ children, w }: { children: ReactNode; w?: string }) => <p className="statement" style={w ? { maxWidth: w } : undefined}>{children}</p>;
export const Lede = ({ children }: { children: ReactNode }) => <p className="lede">{children}</p>;
```

- [ ] **Step 12: Write `src/components/quiet.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Crumb, Kick, Micro, Narrate, Raw, TitleBlock, md } from '@/components/ui/text';
import { SITE } from '@/content/site';
import { cx } from '@/lib/cx';
import { fmtDate } from '@/lib/format';

/** DD.MM.YYYY of the build (next.config env). */
export const buildDate = (): string => fmtDate(process.env.NEXT_PUBLIC_BUILD_DATE ?? '');

/** The opening of a quiet page: kicker, title, one sentence on a dash-dot line. */
export function QOpen({ kick, meta, title, sub, children }: { kick: ReactNode; meta?: ReactNode; title: ReactNode; sub?: ReactNode; children?: ReactNode }) {
  return (
    <header className="q-open">
      <div className="q-open__row"><Kick>{kick}</Kick>{meta && <Micro className="q-open__meta">{meta}</Micro>}</div>
      <h1 className="title q-title">{title}</h1>
      {sub && <p className="q-sub">{sub}</p>}
      {children && <div className="q-narr"><Narrate>{children}</Narrate></div>}
    </header>
  );
}

export const QCap = ({ l, r }: { l?: ReactNode; r?: ReactNode }) => <div className="q-cap"><p className="micro ink">{l}</p><p className="micro">{r}</p></div>;

/** One of the four distances: s 72 · m 156 · l 272 · xl 440 (at 1440). */
export const Sp = ({ s = 'l', children, className, id }: { s?: 's' | 'm' | 'l' | 'xl'; children?: ReactNode; className?: string; id?: string }) =>
  <div className={cx(`sp-${s}`, className)} id={id}>{children}</div>;

/** The sheet at the foot of a quiet page: title block, a cross-reference, breadcrumb. */
export function QEnd({ sheet, index, thesis, scale = '1 : 1', cf, crumb, date, project = SITE.name }: { sheet: string; index: string; thesis?: string; scale?: string; cf?: ReactNode; crumb?: { label: string; href?: string }[]; date?: string; project?: string }) {
  return (
    <div className="q-end">
      <div className="q-end__row">
        <TitleBlock rows={[[['Sheet', sheet], ['Index', index]], [['Thesis', thesis ?? '—'], ['Scale', scale]], [['Project', project], ['Date', date ?? buildDate()]]]} />
        {cf && <p className="q-end__cf">{cf}</p>}
      </div>
      {crumb && <Crumb items={crumb} />}
    </div>
  );
}

export const Tx = ({ paras }: { paras: string[] }) => <div className="tx">{paras.map((t, i) => <Raw key={i} as="p" html={md(t)} />)}</div>;
```

- [ ] **Step 13: Write `src/components/tiles.tsx`**

```tsx
import type { CSSProperties, ReactNode } from 'react';
import { A } from '@/components/link';
import { QuickAddButton } from '@/components/shop/QuickAdd';
import { Img } from '@/components/ui/img';
import { Rule } from '@/components/ui/text';
import { cx } from '@/lib/cx';
import { fmtPrice } from '@/lib/format';
import { toSummary } from '@/lib/products/summary';
import type { Product } from '@/lib/types';

/** The quick "Add": opens the option box, adds directly, or sends prints to their work page. */
export const AddLink = ({ p, label }: { p: Product; label?: string }) => <QuickAddButton product={toSummary(p)} label={label} />;

/** Product tile: picture, code // name, material, price, Add. */
export function Tile({ p, ratio = '4/5', w = 340, sub, tag, pos, className, eager, sizes, ground }: { p: Product; ground?: boolean; ratio?: string; w?: number; sub?: ReactNode; tag?: string; pos?: string; className?: string; eager?: boolean; sizes?: string }) {
  return (
    <article className={cx('tile', className)} data-id={p.id}>
      {(tag ?? p.tag) && <span className="tile__tag">{tag ?? p.tag}</span>}
      <A className="tile__a" href={p.href} aria-label={`${p.code} ${p.name}`}>
        <Img slot={p.images[0]} ratio={ratio} pos={pos ?? p.pos} w={w} ground={ground ?? p.ground} alt={`${p.code} — ${p.name}`} eager={eager} sizes={sizes ?? '(min-width:1440px) 340px, (min-width:700px) 25vw, 50vw'} />
      </A>
      <p className="tile__t"><b>{p.code}</b> // {p.name}</p>
      <p className="tile__s">{sub ?? p.material}</p>
      <p className="tile__b"><span>{fmtPrice(p.priceCents)}</span><AddLink p={p} /></p>
    </article>
  );
}

/** A gap in the inventory: red, dashed, empty brackets. */
export function ComingTile({ title, line, ratio = '4/5', cta = 'Notify me' }: { title: string; line: string; ratio?: string; cta?: string }) {
  return (
    <article className="tile tile--coming">
      <div className="tile__ph" style={{ '--r': ratio } as CSSProperties}><span>( )</span></div>
      <p className="tile__t"><b>{title}</b></p>
      <p className="tile__s">{line}</p>
      <p className="tile__b"><span /><A className="link-u" href="/contact/?subject=notify">{cta}</A></p>
    </article>
  );
}

/** A rail of tiles under a ruled title. */
export function Rail({ title, note, right, items, ratio = '17/21', w = 340, className }: { title: string; note?: ReactNode; right?: ReactNode; items: (Product | { coming: boolean; title: string; line: string })[]; ratio?: string; w?: number; className?: string }) {
  return (
    <section className={cx('rail', className)} aria-label={title}>
      <Rule title={title} note={note} right={right} />
      <div className={cx(items.length === 3 ? 'g3' : items.length === 5 ? 'g5' : 'g4')}>
        {items.map((it, i) => ('coming' in it ? <ComingTile key={i} title={it.title} line={it.line} ratio={ratio} /> : <Tile key={it.id} p={it} ratio={ratio} w={w} />))}
      </div>
    </section>
  );
}

/** Quiet-page row: the picture in the 768 column, one line beside it, the price at its foot. */
export function PlateRow({ slot, ratio = '768/900', pos, ground, code, line, price: pr, cta, href, product, mark, buy = true, w = 768, alt }: {
  slot: string; ratio?: string; pos?: string; ground?: boolean; code: ReactNode; line: ReactNode; price?: string; cta?: string; href?: string; product?: Product; mark?: ReactNode; buy?: boolean; w?: number; alt?: string;
}) {
  const to = product?.href ?? href;
  const pic = <Img slot={slot} ratio={ratio} pos={pos} ground={ground} w={w} alt={alt ?? ''} sizes="(min-width:1440px) 768px, (min-width:900px) 53vw, 100vw" />;
  return (
    <div className="prow">
      {to ? <A className="prow__img" href={to}>{pic}</A> : <span className="prow__img">{pic}</span>}
      <div className="prow__side">
        <div><p className="micro prow__code">{code}</p><p className="prow__line">{line}</p></div>
        {mark && <div className="prow__mark">{mark}</div>}
        {buy && (
          <p className="prow__buy">
            {product
              ? <><span>{fmtPrice(product.priceCents)}</span> <AddLink p={product} /></>
              : <><span>{pr ?? '€ [price]'}</span> {href ? <A className="link-u" href={href}>{cta ?? 'View'}</A> : null}</>}
          </p>
        )}
      </div>
    </div>
  );
}

/** Index grid on quiet pages: code + price (+ Add) under each picture. */
export function IndexGrid({ items, cols = 5, ratio = '1/1.2', add = true }: { items: Product[]; cols?: 4 | 5; ratio?: string; add?: boolean }) {
  return (
    <div className={cols === 5 ? 'g5' : 'g4'}>
      {items.map((p) => (
        <article className="tile tile--idx" key={p.id}>
          <A className="tile__a" href={p.href}><Img slot={p.images[0]} ratio={ratio} pos={p.pos} ground={p.ground} w={230} alt={`${p.code} — ${p.name}`} sizes="(min-width:1440px) 230px, 40vw" /></A>
          <p className="micro tile__c"><b>{p.code}</b><span>{fmtPrice(p.priceCents)}</span></p>
          <p className="tile__s">{p.name}{add && <> &nbsp; <AddLink p={p} /></>}</p>
        </article>
      ))}
    </div>
  );
}
```

- [ ] **Step 14: Move `source.tsx`**

```bash
git mv legacy/src/components/source.tsx src/components/source.tsx
```

- [ ] **Step 15: Run the tests and checks**

Run: `npx vitest run && npm run typecheck && npm run lint`
Expected: PASS (5 new UI tests).

- [ ] **Step 16: Commit**

```bash
git add -A
git commit -m "$(printf 'Port the UI component library (next/link, next/image, coming soon)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 10: Header — variant B, see-through window

**Files:**
- Create: `src/components/header/Header.tsx`, `src/styles/header.css`, `src/components/site-chrome.tsx`, `src/app/(site)/layout.tsx`, `e2e/header.spec.ts`, `e2e/pixels.ts`
- Modify: `src/styles/index.css` (import `header.css` after `sign.css`), `src/styles/base.css:3`, `src/styles/pages.css` (`.thesis`, `.buy`, `.sum`), `src/styles/overlays.css` (`.toast` top), `src/app/(site)/page.tsx` (drop its own `<main>`)

**Interfaces:**
- Consumes: `useChrome` (Task 7), `BagCount` (Task 8), `signGeometry`, `windowShape`, `HEADER_PAD_EM` (Task 6), `worldOf` (Task 7).
- Produces: `<Header />` (client, `data-header`, class `is-compact` after 40 px); CSS variables `--u`, `--hd-h` (full header height), `--hd-compact`; `<SiteChrome>` wrapping all public pages (grows in Tasks 11, 13, 14).

- [ ] **Step 1: Write the pixel helper `e2e/pixels.ts`**

```ts
import type { Page } from '@playwright/test';
import { PNG } from 'pngjs';

/** The colour of one screen pixel (device scale 1). */
export async function pixel(page: Page, x: number, y: number): Promise<[number, number, number]> {
  const png = PNG.sync.read(await page.screenshot({ clip: { x: Math.round(x), y: Math.round(y), width: 1, height: 1 } }));
  return [png.data[0], png.data[1], png.data[2]];
}

/** Lays a full-screen green sheet under everything that is fixed, so see-through areas show green. */
export async function greenUnderneath(page: Page): Promise<void> {
  await page.evaluate(() => {
    const d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;background:#00ff00;z-index:1';
    document.body.appendChild(d);
  });
}
```

- [ ] **Step 2: Write the failing E2E test `e2e/header.spec.ts`**

```ts
import { expect, test } from '@playwright/test';
import { signAdvances, signGeometry } from '../src/lib/sign/geometry';
import { greenUnderneath, pixel } from './pixels';

const G = signGeometry();
const GREEN: [number, number, number] = [0, 255, 0];
const WHITE: [number, number, number] = [255, 255, 255];

/** centre of the window and a point of the white row, in page pixels */
async function points(page: import('@playwright/test').Page) {
  const row = (await page.locator('.hd__sign').boundingBox())!;
  const y = row.y + row.height * 0.55;
  const at = (fraction: number) => row.x + row.width * (0.0055 + 0.989 * fraction);
  return { window: { x: at(G.xA) + 12, y }, wall: { x: at(0.2), y } };
}

test.describe('header', () => {
  test('is fixed and its sign row has exactly one window', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header[data-header]')).toHaveCSS('position', 'fixed');
    // the menu carries the same sign row — always scope to the header
    expect((await page.locator('header[data-header] .hd__bg path').getAttribute('d'))?.match(/M/g)).toHaveLength(2);
  });

  test('the window shows what lies beneath, the rest of the row is white', async ({ page }) => {
    await page.goto('/');
    await greenUnderneath(page);
    const p = await points(page);
    expect(await pixel(page, p.window.x, p.window.y)).toEqual(GREEN);
    expect(await pixel(page, p.wall.x, p.wall.y)).toEqual(WHITE);
  });

  test('outside the 1440 frame the header is white', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/');
    await greenUnderneath(page);
    const row = (await page.locator('.hd__sign').boundingBox())!;
    expect(await pixel(page, 20, row.y + row.height / 2)).toEqual(WHITE);
    expect(await pixel(page, 1900, row.y + row.height / 2)).toEqual(WHITE);
  });

  test('sign glyphs have the measured advances (the window stays on the brackets)', async ({ page }) => {
    for (const width of [390, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const r = await page.evaluate(async () => {
        await document.fonts.ready;
        const spans = [...document.querySelectorAll<HTMLElement>('header[data-header] .hd__glyphs > span')];
        const size = parseFloat(getComputedStyle(spans[0]).fontSize);
        return { size, widths: spans.map((s) => s.getBoundingClientRect().width) };
      });
      const adv = signAdvances();
      expect(r.widths).toHaveLength(adv.length);
      r.widths.forEach((w, i) => expect(Math.abs(w - adv[i] * r.size)).toBeLessThan(1));
    }
  });

  test('folds circles and labels away after 40 px, unfolds at the top', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => { document.body.style.minHeight = '4000px'; });
    const header = page.locator('header[data-header]');
    await expect(header).not.toHaveClass(/is-compact/);
    await page.mouse.wheel(0, 300);
    await expect(header).toHaveClass(/is-compact/);
    await expect(page.locator('.hd__bot button').first()).toHaveCSS('opacity', '0');
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(header).not.toHaveClass(/is-compact/);
  });

  test('page content starts below the header', async ({ page }) => {
    await page.goto('/');
    const header = (await page.locator('header[data-header]').boundingBox())!;
    const main = (await page.locator('main#main h1').first().boundingBox())!;
    expect(main.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
  });

  test('@phone the header keeps its window on a phone', async ({ page }) => {
    await page.goto('/');
    await greenUnderneath(page);
    const p = await points(page);
    expect(await pixel(page, p.window.x, p.window.y)).toEqual(GREEN);
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx playwright test e2e/header.spec.ts`
Expected: FAIL — `header[data-header]` not found.

- [ ] **Step 4: Write `src/components/header/Header.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import { BagCount } from '@/components/shop/BagCount';
import { cx } from '@/lib/cx';
import { worldOf, type WorldId } from '@/lib/nav/world';
import { signGeometry, windowShape } from '@/lib/sign/geometry';

const G = signGeometry('ATELIER');
const SHAPE = windowShape('ATELIER');
const COMPACT_AFTER = 40;

/** x position on the sign row: .55 % padding + the fraction of the 98.9 % sign */
export const at = (fraction: number) => ({ left: `calc(.55cqw + 98.9cqw * ${fraction.toFixed(5)})` });

const subscribe = (cb: () => void) => {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
};
const useCompact = () => useSyncExternalStore(subscribe, () => window.scrollY > COMPACT_AFTER, () => false);

/** C ONCEPT. ( ATELIER ) C OLLECTIVE . — only the red pieces are visible. */
export function SignGlyphs() {
  return (
    <span className="hd__glyphs" aria-hidden="true">
      <span>C</span><span className="h">ONCEPT</span><span>. </span><span>(</span><span className="h">ATELIER</span><span>)</span><span> C</span><span className="h">OLLECTIVE</span><span> .</span>
    </span>
  );
}

/** The white sign row with the window cut out. */
export function SignRow() {
  return (
    <svg className="hd__bg" viewBox={SHAPE.viewBox} preserveAspectRatio="none" aria-hidden="true">
      <path d={SHAPE.d} fill="#fff" fillRule="evenodd" />
    </svg>
  );
}

/**
 * The header (variant B): fixed, white — except between the brackets, where the page scrolls by.
 * After 40 px the circles F · A · S and the room labels fold away; the sign stays at full width.
 */
export function Header() {
  const compact = useCompact();
  const world = worldOf(usePathname());
  const { menu, openMenu, openSearch } = useChrome();
  const room = (id: WorldId, text: string, x: number, first = false) => (
    <button key={id} type="button" className={cx(first && 'is-first', world === id && 'is-on')} style={at(x)} aria-haspopup="dialog" aria-controls="menu" aria-expanded={menu.open && menu.tab === id} onClick={() => openMenu(id)}>
      {world === id ? `( ${text} )` : text}
    </button>
  );
  const brackets = !world || world === 'atelier';
  return (
    <header className={cx('hd', compact && 'is-compact')} data-header>
      <div className="hd__in">
        <div className="hd__top">
          <span className="hd__bb" style={at(G.xF)} aria-hidden="true"><i>F</i><b /></span>
          <span className="hd__bb" style={at(G.xA)} aria-hidden="true"><i>A</i><b /></span>
          <span className="hd__bb" style={at(G.xS)} aria-hidden="true"><i>S</i><b /></span>
          <div className="hd__util">
            <button type="button" aria-haspopup="dialog" aria-controls="menu" aria-expanded={menu.open} onClick={() => openMenu()}>Menu</button>
            <button type="button" className="hd__search" onClick={openSearch}><span>Search</span><i /></button>
            <Link href="/bag/">Bag ( <BagCount /> )</Link>
          </div>
        </div>
        <Link className="hd__sign" href="/" aria-label="Concept. ( ) Collective — home">
          <SignRow />
          <span className="hd__axis" style={at(G.xA)} aria-hidden="true" />
          <SignGlyphs />
        </Link>
        <nav className="hd__bot" aria-label="Rooms">
          {room('factory', 'Factory', G.xF, true)}
          {brackets && <span className="hd__br" style={at(G.brL)} aria-hidden="true">(</span>}
          {room('atelier', 'Atelier', G.xA)}
          {brackets && <span className="hd__br" style={at(G.brR)} aria-hidden="true">)</span>}
          {room('studio', 'Studio', G.xS)}
          <span className="hd__r">
            <button type="button" className={cx(world === 'campaigns' && 'is-on')} aria-haspopup="dialog" aria-controls="menu" onClick={() => openMenu('campaigns')}>Campaigns</button>
            <button type="button" className={cx(world === 'about' && 'is-on')} aria-haspopup="dialog" aria-controls="menu" onClick={() => openMenu('about')}>About</button>
          </span>
        </nav>
        <div className="hd__hair" />
      </div>
    </header>
  );
}
```

- [ ] **Step 5: Write `src/styles/header.css`** and import it in `index.css` right after `sign.css`

```css
/* ── header (variant B): fixed, white — except the window between the brackets ──
   Sizes follow the 1440 design through container units of .hd__in (max 1440 wide).  */
:root {
  --u: min(1vw, 14.4px);
  --hd-h: calc(max(3.889 * var(--u), 44px) + 98.9 * var(--u) / 19.59640625 + max(3.472 * var(--u), 34px) + 1px);
  --hd-compact: calc(max(2.9 * var(--u), 40px) + 98.9 * var(--u) / 19.59640625 + 1px);
}
main#main { padding-top: var(--hd-h); }

.hd { position: fixed; left: 0; right: 0; top: 0; z-index: 90; pointer-events: none; }
/* wider than 1440: the margins beside the frame are white too — only the window may show the page */
.hd::before, .hd::after { content: ''; position: absolute; top: 0; bottom: 0; width: max(0px, (100% - var(--page)) / 2); background: #fff; }
.hd::before { left: 0; } .hd::after { right: 0; }
.hd a, .hd button { pointer-events: auto; }
.hd__in { position: relative; max-width: var(--page); margin: 0 auto; container: hd / inline-size; --sh: calc(98.9cqw / 19.59640625); }

.hd__top { position: relative; z-index: 0; height: max(3.889cqw, 44px); background: #fff; box-shadow: 0 1px 0 #fff; transition: height .4s var(--ease); }
.hd__bb { position: absolute; top: max(.833cqw, 9px); transform: translateX(-50%); transition: opacity .25s; }
.hd__bb i { display: grid; place-items: center; width: max(1.389cqw, 16px); height: max(1.389cqw, 16px); border: 1px solid var(--ink); border-radius: 50%; font-style: normal; font-size: clamp(8px, .66cqw, 9.5px); line-height: 1; background: #fff; }
.hd__bb b { position: absolute; left: 50%; top: 100%; height: max(1.5cqw, 9px); border-left: 1px dashed #9c9b97; }
.hd__util { position: absolute; right: max(1.67cqw, 12px); top: 0; height: max(3.611cqw, 40px); display: flex; align-items: center; gap: clamp(14px, 2.6cqw, 38px); font-size: clamp(11.5px, .903cqw, 13px); }
.hd__search { position: relative; min-width: clamp(70px, 15cqw, 220px); text-align: left; padding: 3px 0; }
.hd__search i { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--ink); }
.hd__util a:hover, .hd__util button:hover { text-decoration: underline; text-underline-offset: 4px; }

/* the sign row: an SVG white band with the window cut out; the red glyphs lie on top */
.hd__sign { position: relative; z-index: 1; display: block; height: var(--sh); }
.hd__sign:hover { text-decoration: none; }
.hd__bg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }
.hd__axis { position: absolute; top: 4%; bottom: 0; border-left: 1px dashed rgba(120,119,115,.9); }
.hd__glyphs { position: absolute; left: .55cqw; top: 0; display: flex; white-space: pre; font-family: var(--display); font-size: var(--sh); line-height: 1; color: var(--red); user-select: none; }
.hd__glyphs .h { visibility: hidden; }

.hd__bot { position: relative; z-index: 0; height: max(3.472cqw, 34px); background: #fff; box-shadow: 0 -1px 0 #fff; overflow: hidden; transition: height .4s var(--ease); }
.hd__bot > button, .hd__br { position: absolute; top: max(.83cqw, 7px); transform: translateX(-50%); font-size: clamp(11px, .972cqw, 14px); line-height: 1.6; white-space: nowrap; transition: opacity .25s; }
.hd__bot > .is-first { transform: none; margin-left: -6px; }
.hd__bot button:hover { text-decoration: underline; text-underline-offset: 4px; }
.hd__r { position: absolute; right: max(1.1cqw, 10px); top: max(.83cqw, 7px); display: flex; gap: clamp(14px, 2.6cqw, 38px); font-size: clamp(11px, .972cqw, 14px); line-height: 1.6; transition: opacity .25s; }
.hd__r button { color: var(--grey); } .hd__r button:hover, .hd__r button.is-on { color: var(--ink); }
.hd__hair { height: 1px; background: var(--hair); }

/* B: after 40 px the circles and the labels fold away; the sign stays at full width */
.hd.is-compact .hd__top { height: max(2.9cqw, 40px); }
.hd.is-compact .hd__bb { opacity: 0; }
.hd.is-compact .hd__bot { height: 0; }
.hd.is-compact .hd__bot > button, .hd.is-compact .hd__br, .hd.is-compact .hd__r { opacity: 0; pointer-events: none; }

@container hd (max-width: 700px) {
  .hd__top { height: 74px; } .hd__bb { top: 44px; } .hd__bb b { height: 8px; }
  .hd.is-compact .hd__top { height: 40px; }
  .hd__util { gap: 16px; } .hd__search { min-width: 0; } .hd__search i { display: none; }
  .hd__bot > button { font-size: 11.5px; } .hd__br, .hd__r { display: none; }
}
@media (max-width: 700px) {
  :root { --hd-h: calc(74px + 98.9 * var(--u) / 19.59640625 + 34px + 1px); --hd-compact: calc(40px + 98.9 * var(--u) / 19.59640625 + 1px); }
}
```

- [ ] **Step 6: Follow the header height elsewhere**
  - `src/styles/base.css` line 3: replace `scroll-padding-top: 72px;` with `scroll-padding-top: calc(var(--hd-compact) + 16px);`
  - `src/styles/pages.css`: in `.thesis` replace `scroll-margin-top: 80px;` with `scroll-margin-top: calc(var(--hd-compact) + 24px);`; in `.buy` replace `top: 76px;` with `top: calc(var(--hd-compact) + 20px);`; in `.sum` replace `top: 80px;` with `top: calc(var(--hd-compact) + 20px);`
  - `src/styles/overlays.css`: in `.toast` replace `top: 70px;` with `top: calc(var(--hd-compact) + 12px);`

- [ ] **Step 7: Write `src/components/site-chrome.tsx` and the site layout**

```tsx
// src/components/site-chrome.tsx
import type { ReactNode } from 'react';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { Toast } from '@/components/chrome/Toast';
import { Header } from '@/components/header/Header';

/** Everything around a public page: header, (menu, search, footer, dialogs follow), toast. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <ChromeProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <Toast />
    </ChromeProvider>
  );
}
```

```tsx
// src/app/(site)/layout.tsx
import type { ReactNode } from 'react';
import { SiteChrome } from '@/components/site-chrome';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
```

`src/app/(site)/page.tsx` becomes `export default function Page() { return <h1>Concept. ( ) Collective</h1>; }` (the `<main>` now comes from the chrome).

- [ ] **Step 8: Run the tests**

Run: `npx playwright test e2e/header.spec.ts && npx vitest run && npm run typecheck && npm run lint`
Expected: PASS (7 tests in the desktop project — it runs the `@phone` test too — and 1 in the phone project). If "sign glyphs have the measured advances" fails by more than 1 px, the font did not load as `--font-display`: check Task 2.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "$(printf 'Add the fixed header with the see-through window (variant B)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 11: Menu — one panel per room (M2)

**Files:**
- Create: `src/content/nav.ts` (new structure), `src/content/menu.ts`, `src/content/menu.test.ts`, `src/components/menu/MenuPanel.tsx`, `src/styles/menu.css`, `e2e/menu.spec.ts`
- Modify: `src/components/site-chrome.tsx`, `src/styles/index.css` (import `menu.css` after `header.css`)

**Interfaces:**
- Consumes: `Catalog`, `slotSrc`, `soonLabel`, `useChrome`, `useDialog`, `BagCount`, `SignRow`, `SignGlyphs` (Task 10), `WorldId`.
- Produces: `NAV: NavWorld[]`, `FOOTER: Record<'service' | 'company' | 'follow', NavEntry[]>`, types `CountOf`, `NavEntry`, `NavGroup`, `NavWorld`; `buildMenu(cat, nav?): MenuWorld[]`, types `MenuEntry { label; href: string | null; count: string | null; win: string[]; cap: string }`, `MenuGroup`, `MenuWorld`; `<MenuPanel worlds={MenuWorld[]} />` (`#menu`, class `is-open`).

- [ ] **Step 1: Write `src/content/nav.ts`**

```ts
import type { SoonKey } from '@/content/soon';
import type { WorldId } from '@/lib/nav/world';
import type { ProductKind } from '@/lib/types';

/** How many pieces a series or group has — counted from the catalogue, never typed in. */
export interface CountOf { kind: ProductKind; group?: string }

/** A row of the menu: a link (with the pictures its hover window shows), or a coming-soon entry. */
export type NavEntry =
  | { label: string; href: string; count?: CountOf; win?: string[]; cap?: string }
  | { soon: SoonKey };

export interface NavGroup { head: NavEntry; note?: string; items?: NavEntry[] }

export interface NavWorld {
  id: WorldId;
  label: string;
  verb?: string;
  line?: string;
  enter: { label: string; href: string };
  /** pictures of the window while no row is hovered, and the line under it */
  win: string[];
  cap: string;
  /** up to four columns, each one or more groups */
  columns: NavGroup[][];
  /** Campaigns and About are grey in the tab row */
  quiet?: boolean;
}

export const NAV: NavWorld[] = [
  {
    id: 'factory', label: 'Factory', verb: 'to think', line: 'The drawing room. Everything else is obliged to what is written here.',
    enter: { label: 'Enter the Factory', href: '/factory/' }, win: ['factory/section-1', 'factory/section-3', 'factory/stair'], cap: 'T01 · T02 · Glossary',
    columns: [
      [{ head: { label: 'Texts', href: '/factory/#texts', win: ['factory/section-1', 'jewellery/hero', 'bags/hero'], cap: 'T01 · T02 · T03' }, note: '( 3 )', items: [
        { label: 'Tectonics without origin', href: '/factory/tectonics-without-origin/', win: ['factory/section-1', 'factory/stair', 'factory/section-3'], cap: 'T01 // profile' },
        { label: 'Ordinary Objects', href: '/factory/ordinary-objects/', win: ['jewellery/hero', 'scan/OB-021', 'jewellery/BR-B'], cap: 'T02 // ordinary object' },
        { soon: 'bagText' },
      ] }],
      [{ head: { label: 'Theses', href: '/factory/#theses', win: ['factory/section-1', 'jewellery/BR-A'], cap: 'T01 · T02' }, note: '( 2 of n )', items: [
        { label: 'T01 // profile', href: '/factory/#t01', win: ['bags/BG-114', 'fashion/JK-001', 'factory/section-2'], cap: 'Fashion · Bags' },
        { label: 'T02 // ordinary object', href: '/factory/#t02', win: ['jewellery/BR-A', 'scan/OB-011', 'scan/OB-021'], cap: 'Jewellery · Scan Series' },
        { soon: 'theses' },
      ] }],
      [{ head: { label: 'Glossary', href: '/factory/glossary/', win: ['factory/section-4', 'factory/section-2'], cap: 'F · A · S' } }],
      [{ head: { soon: 'publishing' } }, { head: { soon: 'archive' } }, { head: { soon: 'lectures' } }],
    ],
  },
  {
    id: 'atelier', label: 'Atelier', verb: 'to make', line: 'The workshop. Everything here is cut, cast or printed — and everything here can be bought.',
    enter: { label: 'Enter the Atelier', href: '/atelier/' }, win: ['fashion/JK-001', 'bags/BG-114', 'jewellery/BR-A', 'scan/OB-011'], cap: 'JK / 001 · BG / 114 · BR / 0??.a · OB / 011',
    columns: [
      [{ head: { label: 'Fashion', href: '/atelier/fashion/', count: { kind: 'fashion' }, win: ['fashion/SH-001', 'fashion/JK-004', 'fashion/TR-002', 'fashion/VT-001'], cap: 'SH / 001 · JK / 004 · TR / 002 · VT / 001' }, items: [
        { label: 'Jackets', href: '/atelier/fashion/#jackets', count: { kind: 'fashion', group: 'jackets' }, win: ['fashion/JK-004', 'fashion/JK-001'] },
        { label: 'Shirts', href: '/atelier/fashion/#shirts', count: { kind: 'fashion', group: 'shirts' }, win: ['fashion/SH-001', 'fashion/SH-001-2', 'fashion/SH-001-3'] },
        { label: 'Trousers', href: '/atelier/fashion/#trousers', count: { kind: 'fashion', group: 'trousers' }, win: ['fashion/TR-002', 'fashion/TR-001'] },
        { label: 'Vests', href: '/atelier/fashion/#vests', count: { kind: 'fashion', group: 'vests' }, win: ['fashion/VT-001'] },
        { soon: 'outerwear' },
      ] }],
      [{ head: { label: 'Bag / Profile Series', href: '/atelier/bags/', count: { kind: 'bag' }, win: ['bags/BG-114', 'bags/BG-098', 'bags/BG-086', 'bags/BG-NEW'], cap: 'BG / 114 · 098 · 086' }, items: [
        { label: 'BG / 114  tote', href: '/atelier/bags/bg-114/', win: ['bags/BG-114', 'bags/BG-114-2'], cap: 'BG / 114' },
        { label: 'BG / 098  shoulder bag', href: '/atelier/bags/bg-098/', win: ['bags/BG-098'], cap: 'BG / 098' },
        { label: 'BG / 086  clutch', href: '/atelier/bags/bg-086/', win: ['bags/BG-086'], cap: 'BG / 086' },
        { label: 'BG / 0??  stitched panels', href: '/atelier/bags/bg-new/', win: ['bags/BG-NEW'], cap: 'BG / 0??' },
        { soon: 'moreBags' },
      ] }],
      [{ head: { label: 'Jewellery', href: '/atelier/jewellery/', count: { kind: 'jewellery' }, win: ['jewellery/BR-A', 'jewellery/BR-B', 'jewellery/BR-C', 'jewellery/BR-D'], cap: 'BR / 0??.a – d' }, items: [
        { label: 'Cuffs', href: '/atelier/jewellery/br-a/', count: { kind: 'jewellery', group: 'cuffs' }, win: ['jewellery/BR-A', 'jewellery/BR-A-2'] },
        { label: 'Bangles', href: '/atelier/jewellery/', count: { kind: 'jewellery', group: 'bangles' }, win: ['jewellery/BR-B', 'jewellery/BR-C', 'jewellery/BR-D'] },
        { label: 'Bracelets', href: '/atelier/jewellery/br-e/', count: { kind: 'jewellery', group: 'bracelets' }, win: ['jewellery/BR-E'] },
        { soon: 'rings' },
      ] }],
      [{ head: { label: 'Scan Series', href: '/atelier/scan-series/', count: { kind: 'scan' }, win: ['scan/OB-011', 'scan/OB-021', 'scan/OB-031', 'scan/OB-034'], cap: 'OB / 011 · 021 · 031 · 034' }, items: [
        { label: 'Vases', href: '/atelier/scan-series/', count: { kind: 'scan', group: 'vases' }, win: ['scan/OB-011', 'scan/OB-012', 'scan/OB-013'] },
        { label: 'Catch-alls', href: '/atelier/scan-series/', count: { kind: 'scan', group: 'catch-alls' }, win: ['scan/OB-021', 'scan/OB-022', 'scan/OB-023'] },
        { label: 'Holders', href: '/atelier/scan-series/', count: { kind: 'scan', group: 'holders' }, win: ['scan/OB-031', 'scan/OB-032', 'scan/OB-033'] },
        { label: 'Trays', href: '/atelier/scan-series/', count: { kind: 'scan', group: 'trays' }, win: ['scan/OB-034', 'scan/OB-035', 'scan/OB-036'] },
      ] }, { head: { soon: 'furniture' } }],
    ],
  },
  {
    id: 'studio', label: 'Studio', verb: 'to enter', line: 'The space. The works are for sale: the original, and two print editions.',
    enter: { label: 'Enter the Studio', href: '/studio/' }, win: ['art/CI-07', 'art/LP-02-2', 'art/CI-detail'], cap: 'CI / 07 · LP / 02',
    columns: [
      [{ head: { label: 'Conceptual Interference', href: '/studio/conceptual-interference/', win: ['art/CI-07', 'art/CI-03', 'art/CI-11', 'art/CI-14'], cap: 'CI / 07 · 03 · 11 · 14' }, note: '( 15 )', items: [
        { label: 'CI / 07  original & prints', href: '/studio/conceptual-interference/ci-07/', win: ['art/CI-07', 'art/CI-detail'], cap: 'CI / 07' },
        { label: 'All fifteen plates', href: '/studio/conceptual-interference/#all', win: ['art/CI-01', 'art/CI-05', 'art/CI-09', 'art/CI-14'] },
      ] }],
      [{ head: { label: 'Layer Paintings', href: '/studio/layer-paintings/', win: ['art/LP-02-1', 'art/LP-02-2', 'art/LP-02-3'], cap: 'LP / 02 · three states' }, note: '( 4 )', items: [
        { label: 'LP / 02  triptych & prints', href: '/studio/layer-paintings/lp-02/', win: ['art/LP-02-1', 'art/LP-02-2', 'art/LP-02-3'], cap: 'LP / 02' },
        { label: 'Choose a state · poster, archival', href: '/studio/layer-paintings/lp-02/#states', win: ['art/LP-02-2', 'art/LP-01-2', 'art/LP-04-3'] },
      ] }],
      [{ head: { soon: 'exhibitions' } }, { head: { soon: 'sound' } }],
      [{ head: { soon: 'scenography' } }, { head: { soon: 'architecture' } }],
    ],
  },
  {
    id: 'campaigns', label: 'Campaigns', quiet: true,
    enter: { label: 'All campaigns', href: '/campaigns/' }, win: ['campaign-01/cover', 'campaign-02/cover'], cap: '( 01 ) · ( 02 )',
    columns: [
      [{ head: { label: '( 01 )  [ campaign title ]', href: '/campaigns/01/', win: ['campaign-01/cover', 'campaign-01/look-01', 'campaign-01/look-04'], cap: 'Autumn 2026' } }],
      [{ head: { label: '( 02 )  The objects, at home', href: '/campaigns/02/', win: ['campaign-02/cover', 'campaign-02/life-1'], cap: 'Scan Series, in use' } }],
      [{ head: { label: 'Editorials', href: '/campaigns/', win: ['art/CI-detail', 'art/LP-detail'] }, items: [
        { label: 'Conceptual Interference', href: '/studio/conceptual-interference/', win: ['art/CI-detail'] },
        { label: 'Layer Paintings', href: '/studio/layer-paintings/', win: ['art/LP-detail'] },
      ] }],
      [{ head: { soon: 'campaign03' } }],
    ],
  },
  {
    id: 'about', label: 'About', quiet: true,
    enter: { label: 'About', href: '/about/' }, win: ['art/CI-detail', 'fashion/JK-001', 'art/LP-detail'], cap: 'One sign, three rooms',
    columns: [
      [{ head: { label: 'One sign, three rooms', href: '/about/', win: ['art/CI-detail', 'fashion/JK-001', 'art/LP-detail'] } }],
      [{ head: { label: 'Contact', href: '/contact/', win: ['factory/section-3'] } }],
      [{ head: { soon: 'press' } }],
      [{ head: { soon: 'journal' } }],
    ],
  },
];

export const FOOTER: Record<'service' | 'company' | 'follow', NavEntry[]> = {
  service: [{ label: 'Contact', href: '/contact/' }, { label: 'Shipping', href: '/shipping/' }, { label: 'Returns', href: '/returns/' }, { label: 'FAQ', href: '/faq/' }],
  company: [{ label: 'About', href: '/about/' }, { label: 'Campaigns', href: '/campaigns/' }, { soon: 'journal' }, { label: 'Imprint', href: '/imprint/' }],
  follow: [{ label: 'Instagram', href: 'https://www.instagram.com/' }, { label: 'Newsletter', href: '/#newsletter' }],
};
```

- [ ] **Step 2: Write the failing test `src/content/menu.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { soonPaths } from '@/content/soon';
import { getCatalog } from '@/lib/data/catalog';
import { buildMenu, type MenuEntry } from './menu';

const entries = (worlds: Awaited<ReturnType<typeof buildMenu>>): MenuEntry[] =>
  worlds.flatMap((w) => w.columns.flat().flatMap((g) => [g.head, ...g.items]));

describe('buildMenu', () => {
  it('has the five rooms in order', async () => {
    expect(buildMenu(await getCatalog()).map((w) => w.id)).toEqual(['factory', 'atelier', 'studio', 'campaigns', 'about']);
  });
  it('counts series and groups from the catalogue', async () => {
    const atelier = buildMenu(await getCatalog())[1];
    const fashion = atelier.columns[0][0];
    expect(fashion.head.count).toBe('( 18 )');
    expect(fashion.items[0]).toMatchObject({ label: 'Jackets', count: '( 8 )' });
  });
  it('coming-soon rows have no link and carry the empty brackets', async () => {
    const all = entries(buildMenu(await getCatalog()));
    const soon = all.filter((e) => e.href === null);
    expect(soon.map((e) => e.label)).toEqual(expect.arrayContaining(['Outerwear ( )', 'Furniture ( )', 'Bag / Profile Series ( )', '( 03 ) ( )', 'Journal ( )']));
    expect(soon.every((e) => e.label.includes('( )'))).toBe(true);
  });
  it('no menu link points to a coming-soon address', async () => {
    const hrefs = entries(buildMenu(await getCatalog())).map((e) => e.href).filter((h): h is string => h !== null);
    for (const p of soonPaths()) expect(hrefs.some((h) => h.startsWith(p))).toBe(false);
  });
  it('window pictures are resolved to URLs', async () => {
    const factory = buildMenu(await getCatalog())[0];
    expect(factory.win[0]).toBe('/images/_sample/art/arch1.jpg');
  });
});
```

- [ ] **Step 3: Run it to see it fail**

Run: `npx vitest run src/content/menu.test.ts`
Expected: FAIL — cannot resolve `./menu`.

- [ ] **Step 4: Write `src/content/menu.ts`**

```ts
import { NAV, type CountOf, type NavEntry, type NavWorld } from '@/content/nav';
import { SOON, soonHref, soonLabel } from '@/content/soon';
import type { Catalog } from '@/lib/data/catalog';
import { slotSrc } from '@/lib/images';
import type { WorldId } from '@/lib/nav/world';

/** A menu row as the browser receives it: plain data, pictures already URLs, href null = coming soon. */
export interface MenuEntry { label: string; href: string | null; count: string | null; win: string[]; cap: string }
export interface MenuGroup { head: MenuEntry; note: string | null; items: MenuEntry[] }
export interface MenuWorld {
  id: WorldId; label: string; quiet: boolean; verb: string | null; line: string | null;
  enter: { label: string; href: string }; win: string[]; cap: string; columns: MenuGroup[][];
}

const urls = (slots: readonly string[] | undefined): string[] => (slots ?? []).map(slotSrc).filter((s): s is string => s !== null);
const countOf = (cat: Catalog, c: CountOf): number => (c.group ? cat.group(c.kind, c.group) : cat.shop(c.kind)).length;

/** A coming-soon entry stays red until it is live and has a page; then it is an ordinary row. */
export function menuEntry(cat: Catalog, e: NavEntry): MenuEntry {
  if ('soon' in e) {
    const href = soonHref(e.soon);
    return href
      ? { label: SOON[e.soon].label, href, count: null, win: [], cap: '' }
      : { label: soonLabel(e.soon), href: null, count: null, win: [], cap: '' };
  }
  return { label: e.label, href: e.href, count: e.count ? `( ${countOf(cat, e.count)} )` : null, win: urls(e.win), cap: e.cap ?? '' };
}

export function buildMenu(cat: Catalog, nav: readonly NavWorld[] = NAV): MenuWorld[] {
  return nav.map((w) => ({
    id: w.id, label: w.label, quiet: !!w.quiet, verb: w.verb ?? null, line: w.line ?? null, enter: w.enter,
    win: urls(w.win), cap: w.cap,
    columns: w.columns.map((col) => col.map((g) => ({ head: menuEntry(cat, g.head), note: g.note ?? null, items: (g.items ?? []).map((i) => menuEntry(cat, i)) }))),
  }));
}
```

- [ ] **Step 5: Run it**

Run: `npx vitest run src/content/menu.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Write the failing E2E test `e2e/menu.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

const menu = (page: import('@playwright/test').Page) => page.locator('#menu');
/** the panel of one room — all five are in the page, only the chosen one is visible */
const panel = (page: import('@playwright/test').Page, room: string) => menu(page).getByRole('tabpanel', { name: room });

test.describe('menu', () => {
  test('all five rooms are in the HTML; a closed menu loads no pictures', async ({ page }) => {
    await page.goto('/');
    await expect(menu(page).locator('[role=tabpanel]')).toHaveCount(5);
    await expect(menu(page).locator('.bwin__img')).toHaveCount(0);
  });

  test('Menu opens the room of the page; Esc closes and gives focus back', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('.hd__util').getByRole('button', { name: 'Menu' });
    await trigger.click();
    await expect(menu(page)).toHaveClass(/is-open/);
    await expect(menu(page).getByRole('tab', { name: 'Atelier' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Escape');
    await expect(menu(page)).not.toHaveClass(/is-open/);
    await expect(trigger).toBeFocused();
  });

  test('a room label opens that room; tabs switch without closing; the dim closes', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hd__bot').getByRole('button', { name: 'Factory' }).click();
    await expect(menu(page).getByRole('tab', { name: 'Factory' })).toHaveAttribute('aria-selected', 'true');
    await menu(page).getByRole('tab', { name: 'Studio' }).click();
    await expect(menu(page)).toHaveClass(/is-open/);
    await expect(panel(page, 'Studio').getByText('Conceptual Interference', { exact: true })).toBeVisible();
    await page.mouse.click(700, 880);
    await expect(menu(page)).not.toHaveClass(/is-open/);
  });

  test('coming-soon rows are not links', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hd__bot').getByRole('button', { name: 'Factory' }).click();
    await expect(panel(page, 'Factory').locator('.soon')).toHaveCount(5);
    await expect(panel(page, 'Factory').getByRole('link', { name: /Publishing|Archive|Lectures/ })).toHaveCount(0);
  });

  test('Tab stays inside the open menu', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hd__util').getByRole('button', { name: 'Menu' }).click();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => !!document.activeElement?.closest('#menu'))).toBe(true);
    }
  });

  test('hovering a row shows its pictures in the window', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hd__util').getByRole('button', { name: 'Menu' }).click();
    const atelier = panel(page, 'Atelier');
    await atelier.getByRole('link', { name: /Jackets/ }).hover();
    await expect(atelier.locator('.bwin__img').first()).toHaveAttribute('style', /jk_pinstripe/);
    await expect(atelier.locator('.mp__ft')).toHaveText('Atelier / Jackets');
  });

  test('the sign at the foot of the panel has its window', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hd__util').getByRole('button', { name: 'Menu' }).click();
    expect((await menu(page).locator('.mp__sign path').getAttribute('d'))?.match(/M/g)).toHaveLength(2);
  });

  test('@phone the menu is a full screen with the tabs on top', async ({ page }) => {
    await page.goto('/');
    await page.locator('.hd__util').getByRole('button', { name: 'Menu' }).click();
    const box = (await menu(page).boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(840);
    await expect(menu(page).getByRole('tab', { name: 'About' })).toBeVisible();
  });
});
```

- [ ] **Step 7: Run it to see it fail**

Run: `npx playwright test e2e/menu.spec.ts`
Expected: FAIL — `#menu` not found.

- [ ] **Step 8: Write `src/components/menu/MenuPanel.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import { SignGlyphs, SignRow } from '@/components/header/Header';
import { BagCount } from '@/components/shop/BagCount';
import type { MenuEntry, MenuWorld } from '@/content/menu';
import { useDialog } from '@/lib/a11y/use-dialog';
import { cx } from '@/lib/cx';

const FADE_MS = 1200;

/** Index of the picture on show; two to four pictures cross-fade every 1.2 s. */
function useCrossFade(urls: string[]): number {
  const key = urls.join('|');
  const [state, setState] = useState({ key, i: 0 });
  useEffect(() => {
    if (urls.length < 2) return;
    const t = window.setInterval(() => setState((s) => ({ key, i: (s.key === key ? s.i : 0) + 1 })), FADE_MS);
    return () => window.clearInterval(t);
  }, [key, urls.length]);
  const i = state.key === key ? state.i : 0;
  return urls.length ? i % urls.length : 0;
}

/** The window of the menu: the pictures exist only between the brackets (one rule with header and lens). */
function MenuWindow({ urls, title, cap }: { urls: string[]; title: string; cap: string }) {
  const on = useCrossFade(urls);
  return (
    <aside className="mp__field" aria-hidden="true">
      <p className="mp__ft">{title || ' '}</p>
      <div className="bwin mp__win">
        <span className="bwin__g bwin__g--l">(</span>
        <span className="bwin__pic">{urls.map((u, k) => <span key={u} className={cx('bwin__img', k === on && 'is-on')} style={{ backgroundImage: `url(${u})` }} />)}</span>
        <span className="bwin__g bwin__g--r">)</span>
      </div>
      <p className="mp__fc">{cap || ' '}</p>
    </aside>
  );
}

/** One room: up to four columns, the window, "Enter the …". `live` = the menu is open on this room — only then are pictures loaded. */
function WorldPanel({ world, shown, live, onNavigate }: { world: MenuWorld; shown: boolean; live: boolean; onNavigate: () => void }) {
  const [hover, setHover] = useState<MenuEntry | null>(null);
  const show = (e: MenuEntry) => () => { if (e.win.length) setHover(e); };
  const row = (e: MenuEntry, key: string) => (e.href
    ? <li key={key}><Link className="mp__it" href={e.href} onClick={onNavigate} onMouseEnter={show(e)} onFocus={show(e)}><span className="mp__t">{e.label}</span>{e.count && <small>{e.count}</small>}</Link></li>
    : <li key={key}><span className="mp__it soon"><span className="soon__t">{e.label}</span><small className="soon__n">coming soon</small></span></li>);
  const urls = live ? (hover?.win.length ? hover.win : world.win) : [];
  return (
    <div className="mp__body" id={`mp-${world.id}`} role="tabpanel" aria-labelledby={`mp-tab-${world.id}`} hidden={!shown} onMouseLeave={() => setHover(null)}>
      <div className="mp__cols">
        {world.columns.map((col, c) => (
          <div className="mp__col" key={c}>
            {col.map((g, k) => (
              <section className="mp__grp" key={k}>
                {g.head.href
                  ? <h3 className="mp__h"><Link href={g.head.href} onClick={onNavigate} onMouseEnter={show(g.head)} onFocus={show(g.head)}><span className="mp__t">{g.head.label}</span></Link><small>{g.head.count ?? g.note ?? ''}</small></h3>
                  : <h3 className="mp__h soon"><span className="soon__t">{g.head.label}</span><small className="soon__n">coming soon</small></h3>}
                {g.items.length > 0 && <ul>{g.items.map((e, i) => row(e, `${k}-${i}`))}</ul>}
              </section>
            ))}
          </div>
        ))}
        <MenuWindow urls={urls} title={hover ? `${world.label} / ${hover.label}` : ''} cap={hover ? hover.cap : world.cap} />
      </div>
      <Link className="mp__enter" href={world.enter.href} onClick={onNavigate}>{world.enter.label}&nbsp;&nbsp;→</Link>
    </div>
  );
}

/**
 * The menu (M2): one panel per room, dropped from the top over the header; the page behind is dimmed.
 * All five panels are in the HTML (crawlers, link check); only the chosen one is shown.
 */
export function MenuPanel({ worlds }: { worlds: MenuWorld[] }) {
  const { menu, openMenu, closeMenu, openSearch } = useChrome();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useDialog(ref, menu.open, closeMenu, closeRef);
  const current = worlds.find((w) => w.id === menu.tab) ?? worlds[0];

  return (
    <>
      <div className={cx('mp__dim', menu.open && 'is-open')} onClick={closeMenu} aria-hidden="true" />
      <div ref={ref} id="menu" className={cx('mp', menu.open && 'is-open')} role="dialog" aria-modal="true" aria-label="Menu" aria-hidden={!menu.open} inert={!menu.open}>
        <div className="mp__in">
          <div className="mp__top">
            <div className="mp__tabs" role="tablist" aria-label="Rooms">
              {worlds.map((w) => (
                <button key={w.id} id={`mp-tab-${w.id}`} type="button" role="tab" aria-selected={w.id === current.id} aria-controls={`mp-${w.id}`} className={cx(w.quiet && 'is-quiet', w.id === current.id && 'is-on')} onClick={() => openMenu(w.id)}>{w.label}</button>
              ))}
            </div>
            <div className="mp__util">
              <button ref={closeRef} type="button" onClick={closeMenu}>( Close )</button>
              <button type="button" className="mp__search" onClick={openSearch}>Search</button>
              <Link href="/bag/" onClick={closeMenu}>Bag ( <BagCount /> )</Link>
            </div>
          </div>
          {worlds.map((w) => <WorldPanel key={w.id} world={w} shown={w.id === current.id} live={menu.open && w.id === current.id} onNavigate={closeMenu} />)}
          <div className="mp__foot">
            <span>{current.verb ? `( ${current.verb.toUpperCase()} )  ` : ''}{current.line ?? ''}</span>
            <span><Link href="/shipping/" onClick={closeMenu}>Shipping</Link> · <Link href="/contact/" onClick={closeMenu}>Contact</Link> · English</span>
          </div>
          <div className="mp__sign" aria-hidden="true"><SignRow /><SignGlyphs /></div>
          <div className="mp__sigb" />
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 9: Write `src/styles/menu.css`** and import it in `index.css` right after `header.css`

```css
/* ── menu (M2): one panel per room, dropped over the header like Loewe ───────── */
.mp__dim { position: fixed; inset: 0; z-index: 95; background: rgba(11,11,11,.38); opacity: 0; pointer-events: none; transition: opacity .35s var(--ease); }
.mp__dim.is-open { opacity: 1; pointer-events: auto; }
.mp { position: fixed; left: 0; right: 0; top: 0; z-index: 100; max-height: 100dvh; overflow-y: auto; overscroll-behavior: contain; transform: translateY(-104%); transition: transform .45s var(--ease); }
.mp.is-open { transform: none; }
.mp::before, .mp::after { content: ''; position: absolute; top: 0; bottom: 0; width: max(0px, (100% - var(--page)) / 2); background: #fff; }
.mp::before { left: 0; } .mp::after { right: 0; }
.mp__in { position: relative; max-width: var(--page); margin: 0 auto; container: mp / inline-size; --sh: calc(98.9cqw / 19.59640625); }
.mp__top { display: flex; align-items: center; justify-content: space-between; gap: 20px; height: max(3.889cqw, 44px); padding: 0 max(1.67cqw, 12px) 0 max(1.4cqw, 12px); background: #fff; box-shadow: 0 1px 0 #fff; font-size: clamp(11.5px, .972cqw, 14px); }
.mp__tabs { display: flex; gap: clamp(16px, 2.6cqw, 38px); white-space: nowrap; overflow-x: auto; scrollbar-width: none; }
.mp__tabs button { padding: 4px 0; }
.mp__tabs button.is-quiet { color: var(--grey); }
.mp__tabs button.is-on { color: var(--ink); }
.mp__tabs button.is-on::before { content: '( '; } .mp__tabs button.is-on::after { content: ' )'; }
.mp__util { display: flex; gap: clamp(14px, 2.6cqw, 38px); align-items: center; font-size: clamp(11.5px, .903cqw, 13px); white-space: nowrap; }
.mp__search { min-width: clamp(70px, 15cqw, 220px); text-align: left; border-bottom: 1px solid var(--ink); padding: 3px 0; }
.mp__body { background: #fff; padding: max(2.2cqw, 18px) max(1.4cqw, 12px) max(1.6cqw, 14px); }
.mp__cols { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(0, 1.55fr); gap: 0 max(2cqw, 16px); }
.mp__grp + .mp__grp { margin-top: 22px; }
.mp__h { font-family: var(--display); font-weight: 400; font-size: clamp(13.5px, 1.04cqw, 15px); padding: 0 0 9px; border-bottom: 1px solid var(--ink); display: flex; justify-content: space-between; gap: 8px; }
.mp__h small { font-family: var(--text); font-size: 11px; color: var(--grey); }
.mp__h.soon { border-bottom: 0; flex-direction: column; align-items: flex-start; gap: 3px; }
.mp__h.soon .soon__n { margin-left: 0; }
.mp__it { display: flex; justify-content: space-between; gap: 8px; padding: 9px 0 8px; border-bottom: 1px solid var(--hair); font-size: clamp(12.5px, .94cqw, 13.5px); line-height: 1.35; }
.mp__it small { font-size: 11px; color: var(--grey); white-space: nowrap; }
.mp__it.soon { flex-direction: column; align-items: flex-start; gap: 3px; border-bottom: 0; }
.mp__it.soon .soon__n { margin-left: 0; }
a.mp__it:hover, .mp__h a:hover { text-decoration: none; }
a.mp__it:hover .mp__t::before, a.mp__it:focus-visible .mp__t::before, .mp__h a:hover .mp__t::before, .mp__h a:focus-visible .mp__t::before { content: '( '; }
a.mp__it:hover .mp__t::after, a.mp__it:focus-visible .mp__t::after, .mp__h a:hover .mp__t::after, .mp__h a:focus-visible .mp__t::after { content: ' )'; }
.mp__field { padding-left: max(1cqw, 8px); }
.mp__ft, .mp__fc { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--grey); min-height: 1.4em; }
.mp__ft { margin-bottom: 12px; } .mp__fc { margin-top: 16px; }
.mp__win { --h: max(8.3cqw, 72px); }
.mp__enter { display: inline-block; margin-top: 18px; font-size: 13.5px; }
.mp__foot { display: flex; justify-content: space-between; gap: 20px; padding: 0 max(1.4cqw, 12px) max(1.6cqw, 12px); background: #fff; box-shadow: 0 1px 0 #fff; font-size: 13px; color: var(--grey); }
.mp__foot a { color: var(--ink); }
.mp__sign { position: relative; z-index: 1; height: var(--sh); }
.mp__sigb { height: max(1.2cqw, 10px); background: #fff; box-shadow: 0 -1px 0 #fff; }

@container mp (max-width: 700px) {
  .mp__top { flex-wrap: wrap; height: auto; padding-top: 10px; padding-bottom: 10px; row-gap: 10px; }
  .mp__tabs { order: 2; width: 100%; } .mp__util { order: 1; width: 100%; justify-content: space-between; }
  .mp__search { min-width: 0; border: 0; }
  .mp__cols { grid-template-columns: minmax(0, 1fr); } .mp__field { order: -1; padding: 0 0 18px; }
  .mp__foot { flex-direction: column; gap: 6px; }
}
@media (max-width: 700px) { .mp { bottom: 0; max-height: none; background: #fff; } }
```

- [ ] **Step 10: Add the menu to the chrome** — `src/components/site-chrome.tsx`:

```tsx
import type { ReactNode } from 'react';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { Toast } from '@/components/chrome/Toast';
import { Header } from '@/components/header/Header';
import { MenuPanel } from '@/components/menu/MenuPanel';
import { buildMenu } from '@/content/menu';
import { getCatalog } from '@/lib/data/catalog';

/** Everything around a public page: header, menu, (search, footer, dialogs follow), toast. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const cat = await getCatalog();
  return (
    <ChromeProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <MenuPanel worlds={buildMenu(cat)} />
      <Toast />
    </ChromeProvider>
  );
}
```

- [ ] **Step 11: Run the tests**

Run: `npx playwright test e2e/menu.spec.ts e2e/header.spec.ts && npx vitest run && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "$(printf 'Add the menu: one panel per room over the header (M2)\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 12: Page registry, metadata, sitemap, robots

**Files:**
- Create: `src/content/pages.ts`, `src/content/pages.test.ts`, `src/lib/seo.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `e2e/seo.spec.ts`
- Modify: `src/app/layout.tsx` (root metadata, viewport)

**Interfaces:**
- Consumes: `Catalog`, `WORKS`, `SITE`, `slotSrc`, `WorldId`, `soonPaths`.
- Produces: `PageEntry { path; title; description; sheet; world: WorldId | null; og?; noindex?; search? }`, `STATIC_PAGES`, `productPages(cat)`, `workPages()`, `allPages(cat)`, `staticPage(path)`; `siteUrl()`, `pageMetadata(entry): Metadata`.

- [ ] **Step 1: Write the failing test `src/content/pages.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { soonPaths } from '@/content/soon';
import { getCatalog } from '@/lib/data/catalog';
import { allPages, staticPage } from './pages';

describe('page registry', () => {
  it('has the 87 pages of the rebuilt site, each once', async () => {
    const pages = allPages(await getCatalog());
    expect(pages).toHaveLength(87);
    expect(new Set(pages.map((p) => p.path)).size).toBe(87);
  });
  it('every address ends with a slash and none is coming soon', async () => {
    for (const p of allPages(await getCatalog())) {
      expect(p.path.endsWith('/')).toBe(true);
      expect(soonPaths()).not.toContain(p.path);
    }
  });
  it('products and works carry search entries with a picture', async () => {
    const sh = allPages(await getCatalog()).find((p) => p.path === '/atelier/fashion/sh-001/')!;
    expect(sh).toMatchObject({ title: 'SH / 001 // shirt, grey band', world: 'atelier', sheet: 'Atelier / Fashion / SH / 001', search: { kind: 'Fashion', slot: 'fashion/SH-001' } });
  });
  it('the bag is not indexed', () => {
    expect(staticPage('/bag/').noindex).toBe(true);
  });
  it('an unknown static path is an error, not a silent default', () => {
    expect(() => staticPage('/nowhere/')).toThrow('No page entry for /nowhere/');
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/content/pages.test.ts`
Expected: FAIL — cannot resolve `./pages`.

- [ ] **Step 3: Write `src/content/pages.ts`** (titles and descriptions transcribed from `legacy/src/ssr/entry.tsx`; coming-soon pages and the 404 are gone)

```ts
import { WORKS } from '@/content/catalog';
import { SITE } from '@/content/site';
import type { Catalog } from '@/lib/data/catalog';
import type { WorldId } from '@/lib/nav/world';
import type { ProductKind } from '@/lib/types';

/** One entry per page: metadata, footer sheet, sitemap, search. */
export interface PageEntry {
  path: string;
  title: string;
  description: string;
  /** the line in the footer title block */
  sheet: string;
  world: WorldId | null;
  /** social image slot */
  og?: string;
  noindex?: boolean;
  search?: { kind: string; label: string; sub?: string; slot?: string };
}

const page = (e: Omit<PageEntry, 'world'> & { world?: WorldId | null }): PageEntry => ({ world: null, ...e });

export const STATIC_PAGES: readonly PageEntry[] = [
  page({ path: '/', title: SITE.name, description: SITE.description, og: 'home/hero-1', sheet: 'Home', search: { kind: 'Page', label: 'Home' } }),
  page({ path: '/atelier/', title: 'Atelier', description: 'Where the thesis becomes an object you can own. Fashion, bags, jewellery and objects — cut, cast or printed in small series.', world: 'atelier', og: 'fashion/hero-1', sheet: 'Atelier', search: { kind: 'Room', label: 'Atelier', sub: 'to make — fashion, bags, jewellery, objects', slot: 'fashion/JK-001' } }),
  page({ path: '/atelier/fashion/', title: 'Fashion', description: 'Eighteen pieces built from one profile. Seams sit where a joint would sit; a shoulder carries the way a lintel carries.', world: 'atelier', og: 'fashion/hero-1', sheet: 'Atelier / Fashion', search: { kind: 'Series', label: 'Fashion', sub: '18 pieces', slot: 'fashion/JK-001' } }),
  page({ path: '/atelier/bags/', title: 'Bag / Profile Series', description: 'A bag is a room you agree to carry. Chambers, a span, a way in — made to order in leather.', world: 'atelier', og: 'bags/hero', sheet: 'Atelier / Bags', search: { kind: 'Series', label: 'Bag / Profile Series', sub: 'bags, totes — leather', slot: 'bags/BG-114' } }),
  page({ path: '/atelier/jewellery/', title: 'Ordinary Objects, in silver', description: 'Five tools — a clasp, a clamp, a level, a profile, a sheet — reforged at the scale of the wrist.', world: 'atelier', og: 'jewellery/hero', sheet: 'Atelier / Jewellery', search: { kind: 'Series', label: 'Jewellery', sub: 'Ordinary Objects, in silver', slot: 'jewellery/BR-A' } }),
  page({ path: '/atelier/scan-series/', title: 'Scan Series', description: 'Fifteen found objects scanned, printed in ceramic and glazed by hand. The form is a perfect copy; the surface never repeats.', world: 'atelier', og: 'scan/life-garden', sheet: 'Atelier / Scan Series', search: { kind: 'Series', label: 'Scan Series', sub: '15 ceramic objects', slot: 'scan/OB-011' } }),
  page({ path: '/factory/', title: 'Factory', description: 'The drawing room. Texts, theses and a glossary — everything else is obliged to what is written here.', world: 'factory', og: 'factory/section-1', sheet: 'Factory', search: { kind: 'Room', label: 'Factory', sub: 'to think — texts, theses, glossary', slot: 'factory/section-1' } }),
  page({ path: '/factory/tectonics-without-origin/', title: 'Tectonics without origin', description: 'Objects from a world that was never built. The invented fragment is not part of a whole — it is the place where the whole is missing.', world: 'factory', og: 'factory/stair', sheet: 'Factory / Texts / T01', search: { kind: 'Text', label: 'Tectonics without origin', sub: 'T01 // profile', slot: 'factory/section-1' } }),
  page({ path: '/factory/ordinary-objects/', title: 'Ordinary Objects', description: 'On reproduction, the hand, and what a found form owes to nobody.', world: 'factory', og: 'jewellery/hero', sheet: 'Factory / Texts / T02', search: { kind: 'Text', label: 'Ordinary Objects', sub: 'T02 // ordinary object', slot: 'jewellery/hero' } }),
  page({ path: '/factory/glossary/', title: 'Glossary', description: 'The words the site uses, and what they point at.', world: 'factory', sheet: 'Factory / Glossary', search: { kind: 'Page', label: 'Glossary' } }),
  page({ path: '/studio/', title: 'Studio', description: 'What has become space. Art series, exhibitions, sound.', world: 'studio', og: 'studio/hero-ci', sheet: 'Studio', search: { kind: 'Room', label: 'Studio', sub: 'to enter — art, exhibitions, sound', slot: 'studio/hero-ci' } }),
  page({ path: '/studio/conceptual-interference/', title: 'Conceptual Interference', description: 'Fifteen plates. Translucent material over colour and gesture, lit from behind. Chance treated as a layer of authorship.', world: 'studio', og: 'art/CI-07', sheet: 'Studio / Art / Series 01', search: { kind: 'Series', label: 'Conceptual Interference', sub: '15 plates — originals and prints', slot: 'art/CI-07' } }),
  page({ path: '/studio/layer-paintings/', title: 'Layer Paintings', description: 'Four triptychs. City plans, fields, roads and borders drawn onto layered film — three states of the same layers.', world: 'studio', og: 'art/LP-02-2', sheet: 'Studio / Art / Series 02', search: { kind: 'Series', label: 'Layer Paintings', sub: '4 triptychs — originals and prints', slot: 'art/LP-02-2' } }),
  page({ path: '/campaigns/', title: 'Campaigns', description: 'A campaign is a thesis carried out on location.', world: 'campaigns', og: 'campaign-01/cover', sheet: 'Campaigns', search: { kind: 'Page', label: 'Campaigns' } }),
  page({ path: '/campaigns/01/', title: 'Campaign ( 01 ) — [ campaign title ]', description: 'Eighteen pieces, cut like a section, worn against concrete, glass and steel.', world: 'campaigns', og: 'campaign-01/cover', sheet: 'Campaigns / ( 01 )', search: { kind: 'Campaign', label: 'Campaign ( 01 ) — Autumn 2026', slot: 'campaign-01/cover' } }),
  page({ path: '/campaigns/02/', title: 'Campaign ( 02 ) — The objects, at home', description: 'Fifteen ceramic objects, photographed where they are used rather than where they were made.', world: 'campaigns', og: 'campaign-02/cover', sheet: 'Campaigns / ( 02 )', search: { kind: 'Campaign', label: 'Campaign ( 02 ) — The objects, at home', slot: 'campaign-02/cover' } }),
  page({ path: '/bag/', title: 'Bag', description: 'Your bag.', noindex: true, sheet: 'Bag' }),
  page({ path: '/bag/thank-you/', title: 'Thank you', description: 'Your order is placed.', noindex: true, sheet: 'Order' }),
  page({ path: '/about/', title: 'About — One sign, three rooms', description: 'Concept. ( Factory ) Collective is one practice working in three registers: Factory, Atelier, Studio.', world: 'about', sheet: 'About', search: { kind: 'Page', label: 'About — One sign, three rooms' } }),
  page({ path: '/contact/', title: 'Contact', description: 'Write to us about an order, an original, a fitting, or a piece that is not yet made.', world: 'about', sheet: 'Contact', search: { kind: 'Page', label: 'Contact' } }),
  page({ path: '/shipping/', title: 'Shipping', description: 'Lead times, countries, insured shipping.', sheet: 'Shipping', search: { kind: 'Page', label: 'Shipping' } }),
  page({ path: '/returns/', title: 'Returns', description: 'Free returns within 30 days if the piece is unworn. Lifetime repair.', sheet: 'Returns', search: { kind: 'Page', label: 'Returns' } }),
  page({ path: '/faq/', title: 'FAQ', description: 'The short answers.', sheet: 'FAQ', search: { kind: 'Page', label: 'FAQ' } }),
  page({ path: '/imprint/', title: 'Imprint', description: 'Legal notice.', sheet: 'Imprint' }),
  page({ path: '/privacy/', title: 'Privacy', description: 'Privacy policy.', sheet: 'Privacy' }),
  page({ path: '/terms/', title: 'Terms', description: 'Terms of sale.', sheet: 'Terms' }),
];

const SERIES: Record<Exclude<ProductKind, 'print'>, string> = { fashion: 'Fashion', bag: 'Bag / Profile Series', jewellery: 'Jewellery', scan: 'Scan Series' };

export function productPages(cat: Catalog): PageEntry[] {
  return cat.products.filter((p) => p.kind !== 'print').map((p) => {
    const series = SERIES[p.kind as Exclude<ProductKind, 'print'>];
    return {
      path: p.href, title: `${p.code} // ${p.name}`, description: p.description, world: 'atelier', og: p.images[0],
      sheet: `Atelier / ${series} / ${p.code}`, search: { kind: series, label: `${p.code} ${p.name}`, sub: p.sub ?? p.material, slot: p.images[0] },
    };
  });
}

export function workPages(): PageEntry[] {
  return WORKS.map((w) => {
    const ci = w.series === 'ci';
    const slot = ci ? w.slots[0] : w.slots[1];
    return {
      path: w.href, title: `${w.code} — ${ci ? 'Conceptual Interference' : 'Layer Paintings'}`,
      description: `${w.code}: the original, a poster print (edition 100) and an archival print (edition 25).`, world: 'studio', og: slot,
      sheet: `Studio / Art / ${w.code}`, search: { kind: ci ? 'Conceptual Interference' : 'Layer Paintings', label: `${w.code} — original & prints`, sub: ci ? '90 × 120 cm' : 'triptych, 3 × 50 × 70 cm', slot },
    };
  });
}

export const allPages = (cat: Catalog): PageEntry[] => [...STATIC_PAGES, ...productPages(cat), ...workPages()];

/** The entry of a static page; throws on a typo so a broken route file fails the build. */
export function staticPage(path: string): PageEntry {
  const found = STATIC_PAGES.find((p) => p.path === path);
  if (!found) throw new Error(`No page entry for ${path}`);
  return found;
}
```

- [ ] **Step 4: Write `src/lib/seo.ts`**

```ts
import type { Metadata } from 'next';
import type { PageEntry } from '@/content/pages';
import { SITE } from '@/content/site';
import { slotSrc } from '@/lib/images';

export const siteUrl = (): string => (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** Title, description, canonical address and social picture of a page. */
export function pageMetadata(p: PageEntry): Metadata {
  const og = p.og ? slotSrc(p.og) : null;
  const home = p.path === '/';
  const full = home ? `${SITE.name} — ${SITE.tagline}` : `${p.title} — ${SITE.short}`;
  return {
    title: home ? { absolute: full } : p.title,
    description: p.description,
    alternates: p.noindex ? undefined : { canonical: p.path },
    robots: p.noindex ? { index: false, follow: true } : undefined,
    openGraph: { title: full, description: p.description, type: 'website', url: p.path, images: og ? [{ url: og }] : undefined },
    twitter: { card: og ? 'summary_large_image' : 'summary' },
  };
}
```

- [ ] **Step 5: Root metadata, sitemap, robots**

In `src/app/layout.tsx` add (above the component):

```tsx
import type { Metadata, Viewport } from 'next';
import { SITE } from '@/content/site';
import { siteUrl } from '@/lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s — ${SITE.short}` },
  description: SITE.description,
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { themeColor: '#ffffff' };
```

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next';
import { allPages } from '@/content/pages';
import { getCatalog } from '@/lib/data/catalog';
import { siteUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = allPages(await getCatalog());
  return pages.filter((p) => !p.noindex).map((p) => ({ url: `${siteUrl()}${p.path}`, lastModified: process.env.NEXT_PUBLIC_BUILD_DATE }));
}
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/bag/', '/admin/'] }, sitemap: `${siteUrl()}/sitemap.xml` };
}
```

- [ ] **Step 6: Write `e2e/seo.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('robots.txt keeps the bag and the admin out', async ({ request }) => {
  const txt = await (await request.get('/robots.txt')).text();
  expect(txt).toContain('Disallow: /bag/');
  expect(txt).toContain('Disallow: /admin/');
  expect(txt).toContain('Sitemap: http://localhost:3000/sitemap.xml');
});

test('the sitemap lists the pages and no coming-soon address', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('<loc>http://localhost:3000/atelier/fashion/sh-001/</loc>');
  expect(xml).not.toContain('/furniture/');
  expect(xml).not.toContain('/bag/');
  expect(xml.match(/<loc>/g)).toHaveLength(85);
});
```

- [ ] **Step 7: Run the tests**

Run: `npx vitest run && npx playwright test e2e/seo.spec.ts && npm run typecheck && npm run lint`
Expected: PASS (85 = 87 pages minus the two bag pages).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(printf 'Add the page registry, metadata, sitemap and robots\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 13: Search

**Files:**
- Create: `src/lib/search/index.ts`, `src/lib/search/index.test.ts`, `src/components/search/Search.tsx`, `e2e/search.spec.ts`
- Modify: `src/components/site-chrome.tsx`

**Interfaces:**
- Consumes: `PageEntry`, `Catalog`, `slotSrc`, `fmtPrice`, `useChrome`, `useDialog`.
- Produces: `SearchEntry { k; n; s; h; i; p }`, `normalize(s)`, `searchEntries(index, query, limit?)`, `groupByKind(entries)`, `buildSearchIndex(pages, cat)`; `<Search index={SearchEntry[]} />` (shortcuts `/` and ⌘K / Ctrl+K).

- [ ] **Step 1: Write the failing test `src/lib/search/index.test.ts`**

```ts
import { describe, expect, it } from 'vitest';
import { allPages } from '@/content/pages';
import { getCatalog } from '@/lib/data/catalog';
import { buildSearchIndex, groupByKind, normalize, searchEntries } from './index';

describe('search', () => {
  it('normalises codes and punctuation', () => {
    expect(normalize('SH / 001 — Shirt')).toBe('sh 001 shirt');
  });
  it('finds a code with or without its spaces and slash', async () => {
    const cat = await getCatalog();
    const index = buildSearchIndex(allPages(cat), cat);
    expect(searchEntries(index, 'SH / 001')[0]).toMatchObject({ n: 'SH / 001 shirt, grey band', h: '/atelier/fashion/sh-001/', p: '€ [price]' });
    expect(searchEntries(index, 'sh001')[0].h).toBe('/atelier/fashion/sh-001/');
  });
  it('the typed code comes before pieces that merely contain its words', async () => {
    const cat = await getCatalog();
    const hits = searchEntries(buildSearchIndex(allPages(cat), cat), 'SH / 001');
    expect(hits.map((h) => h.h)).toContain('/atelier/fashion/jk-001/'); // "sh" is in "Fashion", "001" in the code
    expect(hits[0].h).toBe('/atelier/fashion/sh-001/');
  });
  it('an empty query finds nothing', async () => {
    const cat = await getCatalog();
    expect(searchEntries(buildSearchIndex(allPages(cat), cat), '   ')).toEqual([]);
  });
  it('groups results by kind in order of appearance', () => {
    const e = (k: string, n: string) => ({ k, n, s: '', h: '/', i: null, p: null });
    expect(groupByKind([e('Fashion', 'a'), e('Text', 'b'), e('Fashion', 'c')]).map(([k, l]) => [k, l.length])).toEqual([['Fashion', 2], ['Text', 1]]);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/lib/search`
Expected: FAIL — cannot resolve `./index`.

- [ ] **Step 3: Write `src/lib/search/index.ts`**

```ts
import type { PageEntry } from '@/content/pages';
import type { Catalog } from '@/lib/data/catalog';
import { fmtPrice } from '@/lib/format';
import { slotSrc } from '@/lib/images';

/** k kind · n name · s sub line · h href · i thumbnail · p price */
export interface SearchEntry { k: string; n: string; s: string; h: string; i: string | null; p: string | null }

export const normalize = (s: string): string => s.toLowerCase().replace(/[\s/.\-–—]+/g, ' ').trim();

export function buildSearchIndex(pages: readonly PageEntry[], cat: Catalog): SearchEntry[] {
  const byHref = new Map(cat.products.map((p) => [p.href, p]));
  return pages.flatMap((page) => {
    if (!page.search) return [];
    const product = byHref.get(page.path);
    return [{ k: page.search.kind, n: page.search.label, s: page.search.sub ?? '', h: page.path, i: page.search.slot ? slotSrc(page.search.slot) : null, p: product ? fmtPrice(product.priceCents) : null }];
  });
}

/**
 * Every word must appear (name, sub line or kind), or the query without spaces appears without spaces (sh001).
 * Codes first: a name that starts with the query ("SH / 001 …") beats a name that only contains its words,
 * which beats a hit somewhere else ("sh" inside "Fashion"). The old site had no ranking: "SH / 001" showed JK / 001 first.
 */
export function searchEntries(index: readonly SearchEntry[], query: string, limit = 40): SearchEntry[] {
  const q = normalize(query);
  if (!q) return [];
  const words = q.split(' ');
  const compact = q.replace(/ /g, '');
  const rank = (x: SearchEntry): number => {
    const name = normalize(x.n);
    if (name.replace(/ /g, '').startsWith(compact)) return 0;
    return words.every((w) => name.includes(w)) ? 1 : 2;
  };
  return index
    .filter((x) => {
      const hay = normalize(`${x.n} ${x.s} ${x.k}`);
      return words.every((w) => hay.includes(w)) || hay.replace(/ /g, '').includes(compact);
    })
    .map((x) => ({ x, r: rank(x) }))
    .sort((a, b) => a.r - b.r)
    .slice(0, limit)
    .map(({ x }) => x);
}

export function groupByKind(entries: readonly SearchEntry[]): [string, SearchEntry[]][] {
  const groups = new Map<string, SearchEntry[]>();
  for (const e of entries) groups.set(e.k, [...(groups.get(e.k) ?? []), e]);
  return [...groups];
}
```

- [ ] **Step 4: Run it**

Run: `npx vitest run src/lib/search`
Expected: PASS (5 tests).

- [ ] **Step 5: Write the failing E2E test `e2e/search.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('slash opens the search; a code finds its piece; Enter goes there', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('/');
  const input = page.getByRole('searchbox', { name: 'Search the site' });
  await expect(input).toBeFocused();
  await input.fill('SH / 001');
  await expect(page.locator('.sres__a').first()).toContainText('SH / 001 shirt, grey band');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/atelier\/fashion\/sh-001\/$/);
});

test('nothing found says so; Esc closes', async ({ page }) => {
  await page.goto('/');
  await page.locator('.hd__util').getByRole('button', { name: 'Search' }).click();
  await page.getByRole('searchbox', { name: 'Search the site' }).fill('zzzz');
  await expect(page.getByText('Nothing drawn under that name. ( )')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#search')).toBeHidden();
});
```

- [ ] **Step 6: Write `src/components/search/Search.tsx`**

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import { useDialog } from '@/lib/a11y/use-dialog';
import { cx } from '@/lib/cx';
import { groupByKind, searchEntries, type SearchEntry } from '@/lib/search/index';

const QUICK = [
  { label: 'Fashion ( 18 )', href: '/atelier/fashion/' }, { label: 'Bags', href: '/atelier/bags/' }, { label: 'Jewellery ( 5 )', href: '/atelier/jewellery/' },
  { label: 'Scan Series ( 15 )', href: '/atelier/scan-series/' }, { label: 'Conceptual Interference', href: '/studio/conceptual-interference/' },
  { label: 'Layer Paintings', href: '/studio/layer-paintings/' }, { label: 'Texts', href: '/factory/' },
];
const CODES = ['SH / 001', 'OB / 011', 'CI / 07'];

/** Full-screen search over pages and pieces; `/` or ⌘K opens it from anywhere. */
export function Search({ index }: { index: SearchEntry[] }) {
  const { searchOpen, openSearch, closeSearch } = useChrome();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(-1);
  useDialog(ref, searchOpen, closeSearch, input);
  const groups = useMemo(() => groupByKind(searchEntries(index, q)), [index, q]);
  // the order on screen (grouped by kind) — the arrow keys walk it, Enter opens it
  const flat = useMemo(() => groups.flatMap(([, list]) => list), [groups]);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement).tagName);
      if (!typing && (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey)))) { e.preventDefault(); openSearch(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [openSearch]);

  const go = (href: string) => { closeSearch(); router.push(href); };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && flat.length) {
      e.preventDefault();
      const down = e.key === 'ArrowDown';
      setSel((s) => (s < 0 ? (down ? 0 : flat.length - 1) : (s + (down ? 1 : -1) + flat.length) % flat.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = flat[Math.max(sel, 0)];
      if (hit) go(hit.h);
    }
  };

  return (
    <div ref={ref} id="search" className="search" role="dialog" aria-modal="true" aria-label="Search" hidden={!searchOpen}>
      <div className="search__top"><span className="micro">Search</span><button type="button" onClick={closeSearch}>( Close )</button></div>
      <form className="search__form" role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="q" className="sr">Search the site</label>
        <input ref={input} id="q" type="search" autoComplete="off" placeholder="Search — a piece, a code, a text" value={q} onChange={(e) => { setQ(e.target.value); setSel(-1); }} onKeyDown={onKeyDown} />
      </form>
      <div className="search__res" aria-live="polite">
        {q.trim() && !flat.length && <p className="sres__none">Nothing drawn under that name. ( )</p>}
        {groups.map(([kind, list]) => (
          <section className="sres__g" key={kind}>
            <h3>{kind}</h3>
            {list.map((x) => (
              <Link key={x.h + x.n} className={cx('sres__a', flat.indexOf(x) === sel && 'is-sel')} href={x.h} onClick={closeSearch}>
                <span className="sres__t">{x.i && <Image src={x.i} alt="" width={54} height={66} />}</span>
                <span className="sres__n">{x.n}<br /><span className="sres__m">{x.s}</span></span>
                <span className="sres__m">{x.p ?? ''}</span>
              </Link>
            ))}
          </section>
        ))}
      </div>
      {!q.trim() && (
        <div className="search__hint">
          <p className="micro">Quick ways in</p>
          <p>{QUICK.map((l, i) => <span key={l.href}>{i > 0 && ' · '}<Link href={l.href} onClick={closeSearch}>{l.label}</Link></span>)}</p>
          <p className="micro">Try a code: {CODES.map((c, i) => <span key={c}>{i > 0 && ' · '}<button type="button" onClick={() => { setQ(c); input.current?.focus(); }}>{c}</button></span>)}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Add the search to the chrome** — in `src/components/site-chrome.tsx` import `Search`, `allPages`, `buildSearchIndex` and render `<Search index={buildSearchIndex(allPages(cat), cat)} />` right after `<MenuPanel … />`.

- [ ] **Step 8: Run the tests**

Run: `npx playwright test e2e/search.spec.ts && npx vitest run && npm run typecheck && npm run lint`
Expected: the "nothing found" test passes; the first test passes up to the URL check (the product page itself answers 404 until Task 16 — the assertion checks only the address).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "$(printf 'Add the site search\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 14: Footer, forms, enquiry dialog

**Files:**
- Create: `src/lib/api.ts`, `src/lib/api.test.ts`, `src/components/footer/Footer.tsx`, `src/components/footer/FooterSheet.tsx`, `src/components/footer/NewsletterForm.tsx`, `src/components/forms/EnquireDialog.tsx`, `src/components/forms/EnquireButton.tsx`, `e2e/footer.spec.ts`
- Modify: `src/components/site-chrome.tsx` (final form)

**Interfaces:**
- Consumes: `FOOTER` (Task 11), `SITE`, `buildDate` (Task 9), `imageMode`, `hasRealPictures` (Task 5), `useChrome`, `Soon`, `A`.
- Produces: `apiBase(): string | null`, `class ApiNotConnectedError`, `postApi<T>(name: 'checkout' | 'enquire' | 'newsletter', body): Promise<T>`; `<Footer sheets={Record<path, sheet>} />`; `<EnquireDialog />`; `<EnquireButton what label className? />`.

- [ ] **Step 1: Write the failing test `src/lib/api.test.ts`**

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiNotConnectedError, postApi } from './api';

describe('postApi', () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it('says the function is not connected while there is no API base', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', '');
    await expect(postApi('checkout', {})).rejects.toThrow(new ApiNotConnectedError('Checkout'));
    await expect(postApi('checkout', {})).rejects.toThrow('Checkout is not connected yet.');
  });

  it('posts JSON to <base>/<name> and returns the answer', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example/');
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(postApi('newsletter', { email: 'a@b.de' })).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith('https://api.example/newsletter', expect.objectContaining({ method: 'POST', body: '{"email":"a@b.de"}' }));
  });

  it('passes on the error message of the function', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'Your bag is empty.' }), { status: 400 })));
    await expect(postApi('checkout', {})).rejects.toThrow('Your bag is empty.');
  });

  it('a network failure becomes a plain sentence', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.example');
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));
    await expect(postApi('enquire', {})).rejects.toThrow('No connection. Please try again in a moment.');
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/lib/api.test.ts`
Expected: FAIL — cannot resolve `./api`.

- [ ] **Step 3: Write `src/lib/api.ts`**

```ts
/** Calls of the Firebase Functions (Phase 2). Until NEXT_PUBLIC_API_BASE is set, every call says so politely. */
export type ApiName = 'checkout' | 'enquire' | 'newsletter';

const WHAT: Record<ApiName, string> = { checkout: 'Checkout', enquire: 'Sending messages', newsletter: 'The newsletter' };

export class ApiNotConnectedError extends Error {
  constructor(what: string) {
    super(`${what} is not connected yet.`);
    this.name = 'ApiNotConnectedError';
  }
}

export const apiBase = (): string | null => (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/$/, '') || null;

export async function postApi<T = unknown>(name: ApiName, body: unknown): Promise<T> {
  const base = apiBase();
  if (!base) throw new ApiNotConnectedError(WHAT[name]);
  let res: Response;
  try {
    res = await fetch(`${base}/${name}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  } catch {
    throw new Error('No connection. Please try again in a moment.');
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data as T;
}
```

- [ ] **Step 4: Run it**

Run: `npx vitest run src/lib/api.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Write the footer components**

```tsx
// src/components/footer/FooterSheet.tsx
'use client';

import { usePathname } from 'next/navigation';

/** The sheet name of the current page in the footer title block. */
export function FooterSheet({ sheets }: { sheets: Record<string, string> }) {
  const path = usePathname() ?? '/';
  return <span>{sheets[path] ?? sheets[`${path}/`] ?? ''}</span>;
}
```

```tsx
// src/components/footer/NewsletterForm.tsx
'use client';

import { useState, type FormEvent } from 'react';
import { postApi } from '@/lib/api';

export function NewsletterForm() {
  const [msg, setMsg] = useState('');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { setMsg('Please enter a valid e-mail address.'); return; }
    setMsg('…');
    try {
      await postApi('newsletter', Object.fromEntries(new FormData(form)));
      setMsg('Subscribed. One letter a month.');
      form.reset();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };
  return (
    <form className="nl" noValidate onSubmit={onSubmit}>
      <label className="sr" htmlFor="nl-mail">E-mail</label>
      <input id="nl-mail" name="email" type="email" required placeholder="E-mail" autoComplete="email" />
      <button type="submit">( Subscribe )</button>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <p className="nl__msg" role="status">{msg}</p>
    </form>
  );
}
```

```tsx
// src/components/footer/Footer.tsx
import { FooterSheet } from '@/components/footer/FooterSheet';
import { NewsletterForm } from '@/components/footer/NewsletterForm';
import { A } from '@/components/link';
import { buildDate } from '@/components/quiet';
import { Soon } from '@/components/soon';
import { FOOTER, type NavEntry } from '@/content/nav';
import { SITE } from '@/content/site';
import { hasRealPictures, imageMode } from '@/lib/images';

function Column({ title, items }: { title: string; items: NavEntry[] }) {
  return (
    <div className="ft__c">
      <h2>{title}</h2>
      <ul>
        {items.map((l, i) => (
          <li key={i}>{'soon' in l ? <Soon k={l.soon} /> : <A href={l.href} {...(l.href.startsWith('http') ? { rel: 'noopener', target: '_blank' } : {})}>{l.label}</A>}</li>
        ))}
      </ul>
    </div>
  );
}

export function Footer({ sheets }: { sheets: Record<string, string> }) {
  const year = (process.env.NEXT_PUBLIC_BUILD_DATE ?? '').slice(0, 4);
  const notes = [process.env.DEMO_PRICES === '1' && 'demo prices', imageMode() === 'local' && !hasRealPictures() && 'sample pictures'].filter(Boolean);
  return (
    <footer className="ft" id="newsletter">
      <div className="ft__grid">
        <Column title="Client services" items={FOOTER.service} />
        <Column title="Company" items={FOOTER.company} />
        <Column title="Follow" items={FOOTER.follow} />
        <div className="ft__c ft__news"><h2>Newsletter</h2><p>New pieces, once a month.</p><NewsletterForm /></div>
      </div>
      <div className="ft__base">
        <div className="legend" aria-label="Legend">
          <span><i className="lg lg--solid" /> shown</span><span><i className="lg lg--hidden" /> Cf. — elsewhere</span><span><i className="lg lg--axis" /> axis</span><span className="r"><i className="lg lg--poss" /> coming</span><span><i className="lg lg--dot" /> other level</span>
        </div>
        <div className="tb" role="group" aria-label="Sheet">
          <div><span>{SITE.name}</span><span>{buildDate()}</span></div>
          <div><FooterSheet sheets={sheets} /><span>English</span></div>
        </div>
      </div>
      <p className="ft__c2">© {year} {SITE.name}{notes.map((n) => ` · ${n}`).join('')}</p>
    </footer>
  );
}
```

- [ ] **Step 6: Write the enquiry dialog**

```tsx
// src/components/forms/EnquireButton.tsx
'use client';

import { useChrome } from '@/components/chrome/ChromeProvider';

/** Opens the enquiry dialog for an original. */
export function EnquireButton({ what, label, className = 'pill' }: { what: string; label: string; className?: string }) {
  const { openEnquiry } = useChrome();
  return <button type="button" className={className} onClick={() => openEnquiry(what)}>{label}</button>;
}
```

```tsx
// src/components/forms/EnquireDialog.tsx
'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import { postApi } from '@/lib/api';

function EnquireForm({ what, onClose }: { what: string; onClose: () => void }) {
  const [msg, setMsg] = useState('');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { setMsg('Please enter your name and a valid e-mail address.'); return; }
    setMsg('Sending …');
    try {
      await postApi('enquire', { ...Object.fromEntries(new FormData(form)), work: what, subject: 'original' });
      setMsg('Thank you. We write back within two working days.');
      form.reset();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };
  return (
    <form className="dlg__f" noValidate onSubmit={onSubmit}>
      <div className="dlg__top"><h2 id="enq-t" className="dlg__t">Enquire</h2><button type="button" onClick={onClose}>( Close )</button></div>
      <p className="dlg__sub">{what}</p>
      <label>Name<input name="name" required autoComplete="name" /></label>
      <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
      <label>Message<textarea name="message" rows={4} placeholder="Where would it hang? Do you want to see it in person?" /></label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <button className="pill" type="submit">Send enquiry</button>
      <p className="dlg__msg" role="status">{msg}</p>
    </form>
  );
}

/** One <dialog> for every "Enquire" button on the site. */
export function EnquireDialog() {
  const { enquiry, closeEnquiry } = useChrome();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (enquiry.open && !d.open) d.showModal();
    if (!enquiry.open && d.open) d.close();
  }, [enquiry.open]);
  return (
    <dialog ref={ref} className="dlg" aria-labelledby="enq-t" onClose={closeEnquiry} onClick={(e) => { if (e.target === ref.current) closeEnquiry(); }}>
      <EnquireForm key={enquiry.n} what={enquiry.what} onClose={closeEnquiry} />
    </dialog>
  );
}
```

- [ ] **Step 7: Final chrome** — `src/components/site-chrome.tsx`:

```tsx
import type { ReactNode } from 'react';
import { ChromeProvider } from '@/components/chrome/ChromeProvider';
import { Toast } from '@/components/chrome/Toast';
import { Footer } from '@/components/footer/Footer';
import { EnquireDialog } from '@/components/forms/EnquireDialog';
import { Header } from '@/components/header/Header';
import { MenuPanel } from '@/components/menu/MenuPanel';
import { Search } from '@/components/search/Search';
import { buildMenu } from '@/content/menu';
import { allPages } from '@/content/pages';
import { getCatalog } from '@/lib/data/catalog';
import { buildSearchIndex } from '@/lib/search/index';

/** Everything around a public page: header, menu, search, footer, enquiry dialog, toast. */
export async function SiteChrome({ children }: { children: ReactNode }) {
  const cat = await getCatalog();
  const pages = allPages(cat);
  return (
    <ChromeProvider>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main" tabIndex={-1}>{children}</main>
      <Footer sheets={Object.fromEntries(pages.map((p) => [p.path, p.sheet]))} />
      <MenuPanel worlds={buildMenu(cat)} />
      <Search index={buildSearchIndex(pages, cat)} />
      <EnquireDialog />
      <Toast />
    </ChromeProvider>
  );
}
```

- [ ] **Step 8: Write `e2e/footer.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('the footer names the sheet of the page and the build date', async ({ page }) => {
  await page.goto('/');
  const block = page.locator('.ft .tb');
  await expect(block).toContainText('Home');
  await expect(block).toContainText(/\d{2}\.\d{2}\.\d{4}/);
});

test('Journal is coming soon in the footer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.ft').getByRole('link', { name: 'Journal' })).toHaveCount(0);
  await expect(page.locator('.ft .soon')).toContainText('Journal ( )');
});

test('the newsletter says it is not connected yet', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('E-mail').fill('someone@example.com');
  await page.getByRole('button', { name: '( Subscribe )' }).click();
  await expect(page.locator('.nl__msg')).toHaveText('The newsletter is not connected yet.');
});
```

- [ ] **Step 9: Run the tests**

Run: `npx playwright test && npx vitest run && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "$(printf 'Add the footer, the newsletter and the enquiry dialog\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

## Porting rules for Tasks 15 – 19

Every view file is moved with `git mv legacy/src/pages/<file>.tsx src/views/<file>.tsx` and then changed by these rules. The TypeScript compiler finds every place a rule was missed.

1. **Imports** — `../content/catalog` (helpers) → `import { getCatalog, type Catalog } from '@/lib/data/catalog'` (and `fromPrice`, `WORKS` from the same module where used); other `../content/*` → `@/content/*`; `../components/ui` → `@/components/ui`; `../components/shop` → `@/components/tiles`; `../components/blocks|quiet|source` → `@/components/…`; `../lib/format` → `@/lib/format`. Add `fmtPrice` from `@/lib/format`, `toSummary` from `@/lib/products/summary`, `Soon` from `@/components/soon`, `A` from `@/components/link` where used.
2. **Catalogue access** — a page component that reads products becomes `export async function XPage()` and starts with `const cat = await getCatalog();` (sub-components get `cat` as a prop). Then: `[…].map(byId)` → `cat.pick([…])`; `byId('X')` → `cat.byId('X')`, and every JSX that needs the product is wrapped `{x && …}`; `shop(k)` → `cat.shop(k)`; `group(k, g)` → `cat.group(k, g)`; `printsOf(id)` → `cat.printsOf(id)`; `price(p)` → `fmtPrice(p.priceCents)`; `fromPrice(w)` → `fromPrice(cat, w)`.
3. **Index-based content** — where a list of products is paired with a list of lines by index (`sub[i]`, `i === 0 || i === 1 ? 'T02' : 'T01'`), replace the index by a map keyed by product id (shown in the task), so a missing product never shifts the texts.
4. **Links** — every internal `<a href="/…">` / `<a href={x.href}>` → `<A href=…>` (keeps the attributes). Anchors without a path (`href="#states"`) stay `<a>`.
5. **Interactivity** — `data-quickadd={id}` buttons → `<QuickAddButton product={toSummary(p)} />`; `ShopPoint … id="X"` → `product={toSummary(p)}`; the other `data-*` hooks are replaced as listed per task.
6. **Coming soon** — exactly the replacements listed per task.
7. **Lint** — the React Compiler rules of `eslint-config-next` apply to the ported code: a component defined inside another component moves to module level (only `EditionForm` in `studio.tsx`, Task 18); the one `any` (the theses tuples in `factory.tsx`, Task 17) becomes a typed array; a straight `'` or `"` in JSX text becomes ’ or “ ” — the copy already uses the typographic ones.
8. **Editorial picks** — spec §8: a product named in the code that the catalogue does not have is skipped, never shown half. Tiles, plate rows, shop points and openings that need a product render only when `cat.byId` finds it (`cat.pick` already skips).

After each task: `grep -n 'href="/' src/views/<file>.tsx` must print nothing except lines inside `A`, `Pill`, `Coming`, `OutPlate` props.

Route file for a static page (one per page, `export const metadata` + default export):

```tsx
import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { AtelierPage } from '@/views/atelier';

export const metadata = pageMetadata(staticPage('/atelier/'));

export default function Page() {
  return <AtelierPage />;
}
```

---

### Task 15: Home, Atelier, Fashion

**Files:**
- Move: `legacy/src/pages/home.tsx` → `src/views/home.tsx`, `legacy/src/pages/atelier.tsx` → `src/views/atelier.tsx`
- Create: `src/components/shop/FashionFilter.tsx`, `src/app/(site)/atelier/page.tsx`, `src/app/(site)/atelier/fashion/page.tsx`, `e2e/pages-atelier.spec.ts`
- Modify: `src/app/(site)/page.tsx`, `src/styles/pages.css` (filter rules)

**Interfaces:**
- Consumes: porting rules; `Tile`, `Rail`, `Room`, `SecHead`, `Coming`, `QEnd`, `Sp`, `ShopPoint`, `Img`, `Plate`.
- Produces: `HomePage`, `AtelierPage`, `FashionPage` (async); `<FashionFilter groups total>{sections}</FashionFilter>`.

- [ ] **Step 1: Write the failing E2E test `e2e/pages-atelier.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('home shows the campaign, four fashion pieces and the rooms', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Eighteen pieces, cut like a section.')).toBeVisible();
  await expect(page.locator('.home__tiles .tile')).toHaveCount(4);
  // bags head: "Read the text" twice · studio head: Scenography
  await expect(page.locator('.sech .soon')).toHaveCount(3);
});

test('quick add from a home tile fills the bag', async ({ page }) => {
  await page.goto('/');
  await page.locator('.home__tiles .tile').first().getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'is in your bag.' })).toBeVisible();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
});

test('atelier lists its rooms; Furniture and Rings are coming soon', async ({ page }) => {
  await page.goto('/atelier/');
  await expect(page.getByRole('heading', { level: 1, name: 'Atelier' })).toBeVisible();
  await expect(page.locator('.head6__r .soon')).toContainText('Furniture ( )');
  await expect(page.getByRole('link', { name: /Rings/ })).toHaveCount(0);
});

test('fashion filter shows one group at a time', async ({ page }) => {
  await page.goto('/atelier/fashion/');
  await expect(page.locator('.fgrp .tile')).toHaveCount(18);
  await page.getByRole('button', { name: 'Shirts ( 4 )' }).click();
  await expect(page.locator('.fgrp .tile:visible')).toHaveCount(4);
  await expect(page).toHaveURL(/#shirts$/);
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx playwright test e2e/pages-atelier.spec.ts`
Expected: FAIL — the home page is still the scaffold; `/atelier/` answers 404.

- [ ] **Step 3: Port `src/views/home.tsx`** (rules 1–5), plus:
  - `const cuff = byId('BR-A')` → `const cuff = cat.byId('BR-A');` and add `const bnew = cat.byId('BG-NEW');`
  - BG-NEW ShopPoint → `{bnew && <ShopPoint px={46} py={44} lx={20} ly={78} code="BG / 0??" name="bag, stitched panels" sub="Leather, bonded seams" price={fmtPrice(bnew.priceCents)} href={bnew.href} product={toSummary(bnew)} />}`
  - cuff ShopPoint → `{cuff && <ShopPoint px={42} py={36} lx={56} ly={17} code="BR / 0??.a" name="cuff" sub="White gold, gold inserts" price={fmtPrice(cuff.priceCents)} href={cuff.href} product={toSummary(cuff)} />}`
  - Bags `SecHead`: `links={[{ label: 'Bags ( 4 )', href: '/atelier/bags/' }, { label: 'Totes ( 1 )', href: '/atelier/bags/#series' }, { label: 'Read the text', soon: 'bagText' }]}` and `read={{ label: 'Read the text', soon: 'bagText' }}` — the old site linked the text twice in this head, so both mentions turn red (and both link again once `bagText` is live)
  - Studio `SecHead` links: `{ label: 'Scenography ( )', href: '/studio/scenography/', coming: true }` → `{ label: 'Scenography', soon: 'scenography' }`
  - `['OB-011', 'OB-021'].map(byId).map(…)` → `cat.pick(['OB-011', 'OB-021']).map(…)`

- [ ] **Step 4: Write `src/components/shop/FashionFilter.tsx`**

```tsx
'use client';

import { useState, type ReactNode } from 'react';

/** All / Jackets / Shirts … — hides the other groups; the address keeps the choice as #jackets. */
export function FashionFilter({ groups, total, children }: { groups: { id: string; label: string; n: number }[]; total: number; children: ReactNode }) {
  const [active, setActive] = useState('all');
  const choose = (id: string) => {
    setActive(id);
    window.history.replaceState(null, '', id === 'all' ? window.location.pathname : `#${id}`);
  };
  return (
    <div data-filter={active}>
      <div className="sp-m">
        <div className="filters" role="toolbar" aria-label="Filter">
          <span>
            <button type="button" className={active === 'all' ? 'is-on' : undefined} aria-pressed={active === 'all'} onClick={() => choose('all')}>All ( {total} )</button>
            {groups.map((g) => (
              <button key={g.id} type="button" className={active === g.id ? 'is-on' : undefined} aria-pressed={active === g.id} onClick={() => choose(g.id)}>{g.label} ( {g.n} )</button>
            ))}
          </span>
        </div>
      </div>
      {children}
    </div>
  );
}
```

Append to `src/styles/pages.css`:

```css
/* fashion filter: one group at a time */
[data-filter]:not([data-filter="all"]) .fgrp { display: none; }
[data-filter="jackets"] .fgrp[data-group="jackets"], [data-filter="shirts"] .fgrp[data-group="shirts"],
[data-filter="trousers"] .fgrp[data-group="trousers"], [data-filter="vests"] .fgrp[data-group="vests"] { display: block; }
```

- [ ] **Step 5: Port `src/views/atelier.tsx`** (rules 1–5), plus:
  - `AtelierPage`: `newIn = [byId('BG-NEW'), byId('BR-A'), byId('OB-037'), byId('SH-004')]` → `cat.pick(['BG-NEW', 'BR-A', 'OB-037', 'SH-004'])`; in `head6__r` the four series links become `<A>` and `<a className="r" href="/atelier/furniture/">Furniture ( )</a>` → `<Soon k="furniture" />`; jewellery `Room` links `{ label: 'Rings ( )', href: '/atelier/jewellery/', coming: true }` → `{ label: 'Rings', soon: 'rings' }`; bags `Room` links `{ label: 'Read the text', href: '/factory/bag-profile-series/' }` → `{ label: 'Read the text', soon: 'bagText' }`.
  - `FashionPage`: `const jk1 = cat.byId('JK-001');` ShopPoint → `{jk1 && <ShopPoint px={24} py={56} lx={12} ly={30} code={jk1.code} name="jacket, white" sub="Cotton canvas" price={fmtPrice(jk1.priceCents)} href={jk1.href} product={toSummary(jk1)} side={-1} />}`; root `<div className="q fashion" data-filter-root>` → `<div className="q fashion">`; title count `( 18 )` → `( {cat.shop('fashion').length} )`; delete the old `<Sp s="m"><div className="filters" …>…</div></Sp>` block and wrap the `groups.map(…)` sections in
    ```tsx
    <FashionFilter groups={groups.map(([g, l]) => ({ id: g, label: l, n: cat.group('fashion', g).length }))} total={cat.shop('fashion').length}>
      {groups.map(([g, l], gi) => ( /* the sections as before, with cat.group */ ))}
    </FashionFilter>
    ```
    `<a className="break" href="/campaigns/01/">` → `<A className="break" href="/campaigns/01/">`.

- [ ] **Step 6: Route files**

`src/app/(site)/page.tsx`:

```tsx
import { staticPage } from '@/content/pages';
import { pageMetadata } from '@/lib/seo';
import { HomePage } from '@/views/home';

export const metadata = pageMetadata(staticPage('/'));

export default function Page() {
  return <HomePage />;
}
```

`src/app/(site)/atelier/page.tsx` (`AtelierPage`, `'/atelier/'`) and `src/app/(site)/atelier/fashion/page.tsx` (`FashionPage`, `'/atelier/fashion/'`) follow the route template above.

- [ ] **Step 7: Run the tests**

Run: `npx playwright test e2e/pages-atelier.spec.ts && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "$(printf 'Port Home, Atelier and Fashion\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 16: Series pages and product pages

**Files:**
- Move: `legacy/src/pages/series.tsx` → `src/views/series.tsx`
- Create: `src/views/product.tsx` (rewritten, below), `src/components/shop/BuyForm.tsx`, `src/components/shop/BuyForm.test.tsx`, `src/components/shop/Gallery.tsx`, `src/app/(site)/atelier/{bags,jewellery,scan-series}/page.tsx`, `src/app/(site)/atelier/{fashion,bags,jewellery,scan-series}/[slug]/page.tsx`, `e2e/pages-product.spec.ts`
- Modify: `src/styles/pages.css` (gallery wrapper rules)

**Interfaces:**
- Consumes: porting rules; `useBag`, `useChrome`, `defaultValueIndex`, `ProductSummary`.
- Produces: `BagsPage`, `JewelleryPage`, `ScanPage`; `ProductPage({ p, cat })`, `BuyBox({ p, children? })`; `<BuyForm product note />`; `<GalleryClient slides thumbs overlay />`.

- [ ] **Step 1: Write the failing test `src/components/shop/BuyForm.test.tsx`**

```tsx
// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/atelier/fashion/sh-001/' }));
import { BuyForm } from './BuyForm';

describe('BuyForm', () => {
  afterEach(() => localStorage.clear());

  it('starts on the middle size and adds the chosen options', () => {
    const p = toSummary({ ...PRODUCTS.find((x) => x.id === 'SH-001')!, priceCents: 26000 });
    renderWithChrome(<BuyForm product={p} note="Ships in 5 days." />);
    expect(screen.getByRole('radio', { name: '50' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Chambray' }));
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(JSON.parse(localStorage.getItem('cfc.bag.v1')!)[0]).toMatchObject({ id: 'SH-001', opts: { colour: { v: 'chambray', l: 'Chambray' }, size: { v: '50', l: '50' } } });
    expect(screen.getByRole('button', { name: /^Added/ })).toBeDisabled();
  });

  it('a monogram is optional and kept in capitals', () => {
    const p = toSummary({ ...PRODUCTS.find((x) => x.id === 'BG-114')!, priceCents: 124000 });
    renderWithChrome(<BuyForm product={p} note="" />);
    fireEvent.change(screen.getByPlaceholderText('Optional'), { target: { value: 'mf' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add to bag' }));
    expect(JSON.parse(localStorage.getItem('cfc.bag.v1')!)[0].opts.monogram).toEqual({ v: 'mf', l: 'MF' });
  });
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run src/components/shop/BuyForm.test.tsx`
Expected: FAIL — cannot resolve `./BuyForm`.

- [ ] **Step 3: Write `src/components/shop/BuyForm.tsx`**

```tsx
'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import type { BagOptions } from '@/lib/bag/items';
import { useBag } from '@/lib/bag/store';
import { cx } from '@/lib/cx';
import { defaultValueIndex } from '@/lib/products/options';
import type { ProductSummary } from '@/lib/products/summary';
import type { OptionDef } from '@/lib/types';

const ADDED_MS = 1600;

/** The buy form of a product page: options, Add to bag, the note under it. */
export function BuyForm({ product, note }: { product: ProductSummary; note: string }) {
  const { add } = useBag();
  const { showToast } = useChrome();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const opts: BagOptions = {};
    for (const o of product.options) {
      const raw = String(data.get(o.id) ?? '').trim();
      if (!raw) continue;
      if (o.type === 'text') { opts[o.id] = { v: raw, l: raw.toUpperCase() }; continue; }
      const v = o.values?.find((x) => x.id === raw);
      if (v) opts[o.id] = { v: v.id, l: v.label };
    }
    add(product.id, opts);
    showToast(`${product.code} // ${product.name} is in your bag.`, { href: '/bag/', label: 'View bag  →' });
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), ADDED_MS);
  };

  return (
    <form className="buy__form" noValidate onSubmit={onSubmit}>
      {product.options.map((o) => <OptionField key={o.id} o={o} />)}
      <button className="pill pill--block" type="submit" disabled={added}>{added ? 'Added  ✓' : 'Add to bag'}</button>
      <p className="buy__note">{note}</p>
    </form>
  );
}

function OptionField({ o }: { o: OptionDef }) {
  if (o.type === 'text') {
    return (
      <fieldset className="opt opt--text">
        <legend className="micro">{o.label}</legend>
        <label><input type="text" name={o.id} maxLength={o.max} placeholder="Optional" autoComplete="off" /><span>{o.note}</span></label>
      </fieldset>
    );
  }
  const values = o.values ?? [];
  const start = defaultValueIndex(o);
  return (
    <fieldset className={cx('opt', `opt--${o.type}`)}>
      <legend className="micro">{o.label}</legend>
      <div className="opt__v">
        {values.map((v, i) => (
          <label key={v.id} className="opt__c">
            <input type="radio" name={o.id} value={v.id} defaultChecked={i === start} aria-label={v.label} />
            {o.type === 'swatch' && <i className="opt__sw" style={{ background: v.swatch }} />}
            <span>{v.label}</span>
          </label>
        ))}
        {o.type === 'size' && o.note && <SizeGuideLink />}
      </div>
    </fieldset>
  );
}

/** Opens the Measurements accordion and scrolls to it. */
function SizeGuideLink() {
  return (
    <a
      className="opt__guide"
      href="#acc-measurements"
      onClick={(e) => {
        const d = document.getElementById('acc-measurements');
        if (d instanceof HTMLDetailsElement) { e.preventDefault(); d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      }}
    >
      Size guide&nbsp;&nbsp;→
    </a>
  );
}
```

- [ ] **Step 4: Write `src/components/shop/Gallery.tsx`** and its CSS

```tsx
'use client';

import { useRef, useState, type ReactNode } from 'react';
import { cx } from '@/lib/cx';

const SWIPE_PX = 40;

/** Product gallery: one picture at a time, thumbnails, swipe on touch. */
export function GalleryClient({ slides, thumbs, overlay }: { slides: ReactNode[]; thumbs: ReactNode[]; overlay: ReactNode }) {
  const [active, setActive] = useState(0);
  const x0 = useRef(0);
  const n = slides.length;
  const go = (i: number) => setActive(((i % n) + n) % n);
  return (
    <div className="gal">
      <div
        className="gal__main"
        onTouchStart={(e) => { x0.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - x0.current; if (Math.abs(dx) > SWIPE_PX && n > 1) go(active + (dx < 0 ? 1 : -1)); }}
      >
        {slides.map((s, i) => <div key={i} className={cx('gal__i', i === active && 'is-on')} aria-hidden={i !== active}>{s}</div>)}
        {overlay}
        {n > 1 && <span className="mk gal__n" aria-hidden="true">{active + 1} of {n}</span>}
      </div>
      {n > 1 && (
        <div className="gal__th" role="tablist" aria-label="Pictures">
          {thumbs.map((t, i) => (
            <button type="button" key={i} role="tab" aria-selected={i === active} aria-label={`Picture ${i + 1}`} className={cx(i === active && 'is-on')} onClick={() => go(i)}>{t}</button>
          ))}
        </div>
      )}
    </div>
  );
}
```

Append to `src/styles/pages.css`:

```css
.gal__main .gal__i > .img { width: 100%; height: 100%; aspect-ratio: auto !important; }
.gal__main .gal__n { z-index: 4; }
```

- [ ] **Step 5: Write `src/views/product.tsx`**

```tsx
import type { ReactNode } from 'react';
import { A } from '@/components/link';
import { BuyForm } from '@/components/shop/BuyForm';
import { GalleryClient } from '@/components/shop/Gallery';
import { Soon } from '@/components/soon';
import { SourceDrawing } from '@/components/source';
import { Rail, Tile } from '@/components/tiles';
import { AxisV, Crumb, Diag, Dim, Img, Micro, Museum, Plate, Rule, SectionAA, ShopPoint } from '@/components/ui';
import type { Catalog } from '@/lib/data/catalog';
import { fmtPrice } from '@/lib/format';
import { toSummary } from '@/lib/products/summary';
import type { Product } from '@/lib/types';

const SERIES: Record<Product['kind'], { label: string; href: string; crumb: string[] }> = {
  fashion: { label: 'Fashion', href: '/atelier/fashion/', crumb: ['Atelier', 'Fashion'] },
  bag: { label: 'Profile Series', href: '/atelier/bags/', crumb: ['Atelier', 'Accessories'] },
  jewellery: { label: 'Jewellery', href: '/atelier/jewellery/', crumb: ['Atelier', 'Jewellery'] },
  scan: { label: 'Scan Series', href: '/atelier/scan-series/', crumb: ['Atelier', 'Objects', 'Scan Series'] },
  print: { label: 'Prints', href: '/studio/', crumb: ['Studio'] },
};
const GROUP_LABEL = (g: string) => g[0].toUpperCase() + g.slice(1);

function Gallery({ p }: { p: Product }) {
  const slides = p.images.map((s, i) => (
    <Img key={s} slot={s} ratio="895/1060" pos={i === 0 ? p.pos : undefined} ground={p.ground && i === 0} w={895} eager={i === 0} alt={i === 0 ? `${p.code} — ${p.name}` : `${p.code} — view ${i + 1}`} sizes="(min-width:1440px) 895px, (min-width:900px) 62vw, 100vw" />
  ));
  const thumbs = p.images.map((s, i) => <Img key={s} slot={s} ratio="215/200" pos={i === 0 ? p.pos : undefined} ground={p.ground && i === 0} w={215} sizes="(min-width:900px) 16vw, 24vw" />);
  const overlay = (
    <span className="over">
      <span className="mk mk-axisv" style={{ left: '50%', top: 0, padding: 0 }} aria-hidden="true" />
      {p.dims && <Dim x1={10} x2={90} y={93.5} label={p.dims} light={!p.ground} />}
    </span>
  );
  return <GalleryClient slides={slides} thumbs={thumbs} overlay={overlay} />;
}

function TextLink({ p }: { p: Product }) {
  if (!p.text) return null;
  return 'soon' in p.text
    ? <span className="acc__link"><Soon k={p.text.soon}>{p.text.label}</Soon></span>
    : <A className="acc__link" href={p.text.href}>{p.text.label}&nbsp;&nbsp;→</A>;
}

export function BuyBox({ p, children }: { p: Product; children?: ReactNode }) {
  const s = SERIES[p.kind];
  const crumbs = [
    ...s.crumb.map((l, i) => ({ label: l, href: i === s.crumb.length - 1 ? s.href : undefined })),
    ...(p.kind === 'fashion' || p.kind === 'bag' || p.kind === 'jewellery' ? [{ label: GROUP_LABEL(p.group) }] : []),
    { label: p.code },
  ];
  return (
    <div className="buy">
      <Crumb items={crumbs} />
      <h1 className="buy__h"><span className="buy__code">{p.code}</span> <span className="buy__name">// {p.name}</span></h1>
      <p className="buy__meta">{s.label}{p.sub ? ` · ${p.sub}` : ''} · Inv. {p.inv}</p>
      <p className="buy__price">{fmtPrice(p.priceCents)}</p>
      <p className="buy__desc">{p.description}</p>
      <BuyForm product={toSummary(p)} note={p.note} />
      <div className="acc">
        {p.accordions.map((a) => (
          <details key={a.title} id={/^(measurements|dimensions)/i.test(a.title) ? 'acc-measurements' : `acc-${a.title.split(' ')[0].toLowerCase()}`}><summary>{a.title}</summary><p>{a.body}</p></details>
        ))}
        <TextLink p={p} />
      </div>
      {children}
    </div>
  );
}

function Spec({ p }: { p: Product }) {
  const rows: [string, ReactNode][][] = [];
  for (let i = 0; i < p.spec.length; i += 3) rows.push(p.spec.slice(i, i + 3));
  return (
    <section className="pdp__sec" aria-label="Specification">
      <Rule title="Specification" />
      <div className="museum-grid">{rows.map((r, i) => <Museum key={i} rows={r} />)}</div>
    </section>
  );
}

function FashionExtras({ p, cat }: { p: Product; cat: Catalog }) {
  const looks = ['campaign-01/look-04', 'campaign-01/look-09', 'campaign-01/look-01'];
  const wornWith = cat.pick(['TR-002', 'VT-001', 'JK-001', 'BG-114']).filter((x) => x.id !== p.id).slice(0, 4);
  return (
    <>
      <section className="pdp__sec" aria-label="In the campaign">
        <Rule title="In the campaign" note="— look 04, shot on the stair" right={<A href="/campaigns/01/">Campaign ( 01 )&nbsp;&nbsp;→</A>} />
        <div className="g3">
          {looks.map((s, i) => (
            <Plate key={s} slot={s} ratio="2/3" w={470} pos="50% 40%" sizes="(min-width:1440px) 470px, 100vw">
              {i === 0 && <ShopPoint px={50} py={50} lx={66} ly={80} code={p.code} name={p.name} sub="Look 04" href={p.href} product={toSummary(p)} price={fmtPrice(p.priceCents)} side={-1} />}
            </Plate>
          ))}
        </div>
      </section>
      <Spec p={p} />
      <Rail title="Worn with" right={<A href="/campaigns/01/">Shop the look&nbsp;&nbsp;→</A>} items={wornWith} />
    </>
  );
}

function BagExtras({ p, cat }: { p: Product; cat: Catalog }) {
  const others = cat.shop('bag').filter((b) => b.id !== p.id).slice(0, 3);
  const first = others[0];
  return (
    <>
      <section className="pdp__sec" aria-label="The section it comes from">
        <Rule title="The section it comes from" note="— three chambers held apart by one spine" right={<A href="/factory/tectonics-without-origin/">Tectonics without origin&nbsp;&nbsp;→</A>} />
        <Plate slot="factory/section-2" ratio="1420/400" w={1420}><SectionAA y={55} light={false} inset={5.6} /></Plate>
        <Micro className="pdp__cap">SECTION A — A&nbsp;&nbsp;·&nbsp;&nbsp;{p.code}&nbsp;&nbsp;·&nbsp;&nbsp;NOTHING IS LINED; THE LEATHER CARRIES</Micro>
      </section>
      <section className="pdp__sec">
        <div className="g2">
          <figure><Img slot="bags/carried" ratio="710/620" pos="50% 42%" w={710} /><figcaption className="pcap"><b>Campaign ( 01 )</b> // carried, look 03 <A className="link-u" href="/campaigns/01/">View the campaign&nbsp;&nbsp;→</A></figcaption></figure>
          {first && <figure><Img slot={first.images[0]} ratio="710/620" pos="50% 48%" w={710} /><figcaption className="pcap"><b>{first.code}</b> // {first.name} <span>{fmtPrice(first.priceCents)}</span></figcaption></figure>}
        </div>
      </section>
      <Spec p={p} />
      <Rail title="Cf." right={<A href="/atelier/bags/">All bags&nbsp;&nbsp;→</A>} items={[...others, { coming: true, title: 'Six more ( )', line: 'Drawn, not yet stitched' }].slice(0, 4)} />
    </>
  );
}

function JewelleryExtras({ p, cat }: { p: Product; cat: Catalog }) {
  const idx = ['BR-C', 'BR-B', 'BR-E', 'BR-D', 'BR-A'].indexOf(p.id);
  const others = cat.shop('jewellery').filter((j) => j.id !== p.id).slice(0, 3);
  return (
    <>
      <section className="pdp__sec" aria-label="The source object">
        <Rule title="The source object" note="— drawn 1 : 1, before anything was melted" right={<A href="/factory/ordinary-objects/">Ordinary Objects — the text&nbsp;&nbsp;→</A>} />
        <div className="src">
          <div className="src__t">
            <p className="src__l">{p.sub ? `A ${p.sub.replace('after a ', '')} is already ` : ''}{p.id === 'BR-A' ? 'a hinge, two locking ends and a tolerance.' : 'a form with a job. Nothing had to be invented for the wrist.'}<br /><span className="g">Nothing had to be invented for the wrist. It was simply made out of a better material, at the same size.</span></p>
            <p className="src__s">Found&nbsp;&nbsp;→&nbsp;&nbsp;Measured&nbsp;&nbsp;→&nbsp;&nbsp;Cast&nbsp;&nbsp;→&nbsp;&nbsp;Riveted&nbsp;&nbsp;→&nbsp;&nbsp;Set</p>
          </div>
          <SourceDrawing only={idx >= 0 ? idx : 4} made={false} className="src__d" ground={false} />
        </div>
      </section>
      <section className="pdp__sec" aria-label="Exploded view">
        <Plate slot="jewellery/exploded" ratio="1420/760" pos="50% 42%" w={1420}>
          <AxisV x={33.3} /><AxisV x={66.6} />
          <Micro className="mk mk-ex">EXPLODED&nbsp;&nbsp;—&nbsp;&nbsp;1 : 1</Micro>
          <Diag x1={33} y1={22} x2={52} y2={10} label="Gold insert, riveted" lx={34} ly={5} lw={22} />
          <Diag x1={32} y1={48} x2={12} y2={86} label="Magnet closure, hidden" lx={5} ly={88} lw={22} />
          <Diag x1={47} y1={82} x2={62} y2={90} label="Stone: white · green · red" lx={50} ly={92} lw={26} />
        </Plate>
      </section>
      <Spec p={p} />
      <Rail title="Cf." note="— more ordinary objects" right={<A href="/atelier/jewellery/">All jewellery&nbsp;&nbsp;→</A>} items={[...others, { coming: true, title: 'Rings ( )', line: 'The same profiles, closed small' }].slice(0, 4)} />
    </>
  );
}

function ScanExtras({ p, cat }: { p: Product; cat: Catalog }) {
  const four = cat.pick(['OB-021', 'OB-022', 'OB-023', 'OB-024']);
  const rest = cat.pick(['OB-012', 'OB-031', 'OB-034']).filter((x) => x.id !== p.id);
  return (
    <>
      <section className="pdp__sec">
        <Rule title="One file, four hands" note="— the print repeats exactly; the glaze cannot" right="Yours will be the fifth" />
        <div className="g4">{four.map((t) => <Tile key={t.id} p={t} ratio="1/1.06" w={320} ground sub={t.name} />)}</div>
      </section>
      <section className="pdp__sec">
        <div className="g2">
          <figure><Img slot="scan/life-window" ratio="698/620" pos="50% 45%" w={698} /><figcaption className="pcap"><b>{p.code}</b> // windowsill, single stem</figcaption></figure>
          <figure><Img slot="scan/life-shelf" ratio="698/620" pos="50% 42%" w={698} /><figcaption className="pcap"><b>{p.code}</b> // shelf, dried flowers</figcaption></figure>
        </div>
      </section>
      <Spec p={p} />
      <Rail title="Cf." note="— the rest of the Scan Series" right={<A href="/atelier/scan-series/">All fifteen&nbsp;&nbsp;→</A>} items={[...rest, ...cat.pick(['BR-A'])].slice(0, 4)} />
    </>
  );
}

export function ProductPage({ p, cat }: { p: Product; cat: Catalog }) {
  return (
    <div className="w pdp">
      <div className="pdp__top">
        <Gallery p={p} />
        <BuyBox p={p} />
      </div>
      {p.kind === 'fashion' && <FashionExtras p={p} cat={cat} />}
      {p.kind === 'bag' && <BagExtras p={p} cat={cat} />}
      {p.kind === 'jewellery' && <JewelleryExtras p={p} cat={cat} />}
      {p.kind === 'scan' && <ScanExtras p={p} cat={cat} />}
    </div>
  );
}
```

- [ ] **Step 6: Port `src/views/series.tsx`** (rules 1–5), plus:
  - `BagsPage`: `const [b114, b098, b086, bnew] = ['BG-114', 'BG-098', 'BG-086', 'BG-NEW'].map((id) => cat.byId(id));` — wrap the `Opening` (`{bnew && <Opening … href={bnew.href} light />}`) and each `PlateRow` (`{b114 && <PlateRow product={b114} slot={b114.images[0]} …/>}` etc.) in guards; in the `QEnd` cf replace `<a href="/factory/bag-profile-series/">Read&nbsp;&nbsp;→</a>` with `<Soon k="bagText">Read</Soon>`.
  - `JewelleryPage`: `const a = cat.byId('BR-A'), b = cat.byId('BR-B'), e = cat.byId('BR-E'); const all = cat.pick(['BR-A', 'BR-B', 'BR-C', 'BR-D', 'BR-E']);` — guard `Opening` with `a` and each `PlateRow`.
  - `ScanPage`: `const vase = cat.byId('OB-011'), crate = cat.byId('OB-021'), stock = cat.byId('OB-031');` replace `three[0|1|2]` with them and guard each `PlateRow`; `four = cat.pick([…])`; `all = cat.shop('scan')`; the `QCap` link → `<A href="/campaigns/02/">…</A>`.

- [ ] **Step 7: Route files** — the three series pages with the static template (`BagsPage` `'/atelier/bags/'`, `JewelleryPage` `'/atelier/jewellery/'`, `ScanPage` `'/atelier/scan-series/'`), and four product routes. `src/app/(site)/atelier/fashion/[slug]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { productPages } from '@/content/pages';
import { getCatalog } from '@/lib/data/catalog';
import { pageMetadata } from '@/lib/seo';
import { ProductPage } from '@/views/product';

const KIND = 'fashion' as const;

export async function generateStaticParams() {
  return (await getCatalog()).shop(KIND).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<'/atelier/fashion/[slug]'>): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCatalog();
  const p = cat.bySlug(KIND, slug);
  const entry = p && productPages(cat).find((e) => e.path === p.href);
  return entry ? pageMetadata(entry) : {};
}

export default async function Page({ params }: PageProps<'/atelier/fashion/[slug]'>) {
  const { slug } = await params;
  const cat = await getCatalog();
  const p = cat.bySlug(KIND, slug);
  if (!p) notFound();
  return <ProductPage p={p} cat={cat} />;
}
```

`bags/[slug]` (`KIND = 'bag'`, route `'/atelier/bags/[slug]'`), `jewellery/[slug]` (`'jewellery'`, `'/atelier/jewellery/[slug]'`) and `scan-series/[slug]` (`'scan'`, `'/atelier/scan-series/[slug]'`) are the same file with those two values changed.

- [ ] **Step 8: Write `e2e/pages-product.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('a product page: gallery, size guide, add to bag', async ({ page }) => {
  await page.goto('/atelier/fashion/sh-001/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('SH / 001');
  await page.getByRole('tab', { name: 'Picture 2' }).click();
  await expect(page.locator('.gal__i.is-on')).toHaveCount(1);
  await expect(page.locator('.gal__n')).toHaveText('2 of 4');
  await page.getByRole('link', { name: /Size guide/ }).click();
  await expect(page.locator('#acc-measurements')).toHaveAttribute('open', '');
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
});

test('bags point to their unwritten text as coming soon', async ({ page }) => {
  await page.goto('/atelier/bags/bg-114/');
  await expect(page.locator('.acc .soon')).toContainText('Bag / Profile Series — the text');
  await expect(page.getByRole('link', { name: /the text/ })).toHaveCount(0);
});

test('every series page answers', async ({ page }) => {
  for (const path of ['/atelier/bags/', '/atelier/jewellery/', '/atelier/scan-series/', '/atelier/jewellery/br-a/', '/atelier/scan-series/ob-011/']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.locator('h1').first()).toBeVisible();
  }
});

test('an unknown product is a 404', async ({ page }) => {
  const res = await page.goto('/atelier/fashion/nope/');
  expect(res?.status()).toBe(404);
});
```

- [ ] **Step 9: Run the tests**

Run: `npx vitest run && npx playwright test e2e/pages-product.spec.ts e2e/search.spec.ts && npm run typecheck && npm run lint`
Expected: PASS (the search test now also lands on a real product page).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "$(printf 'Port the series pages and the product pages\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 17: Factory, texts, glossary

**Files:**
- Move: `legacy/src/pages/factory.tsx` → `src/views/factory.tsx`
- Create: `src/app/(site)/factory/page.tsx`, `src/app/(site)/factory/tectonics-without-origin/page.tsx`, `src/app/(site)/factory/ordinary-objects/page.tsx`, `src/app/(site)/factory/glossary/page.tsx`, `e2e/pages-factory.spec.ts`

**Interfaces:**
- Produces: `FactoryPage`, `TextT01`, `TextT02`, `GlossaryPage`.

- [ ] **Step 1: Write the failing E2E test `e2e/pages-factory.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('factory: text 03, theses T03 / T04 and three side rooms are coming soon', async ({ page }) => {
  await page.goto('/factory/');
  await expect(page.getByRole('heading', { level: 1, name: 'Factory' })).toBeVisible();
  await expect(page.locator('.rows__r.is-red')).toContainText('Bag / Profile Series');
  await expect(page.locator('#theses .thesis.is-red .soon')).toHaveCount(2);
  await expect(page.locator('.linkrow .soon')).toHaveCount(3);
  await expect(page.locator('a[href*="bag-profile-series"]')).toHaveCount(0);
});

test('T01 adds a piece from its list', async ({ page }) => {
  await page.goto('/factory/tectonics-without-origin/');
  await page.locator('.tile--idx').first().getByRole('button', { name: 'Add' }).click();
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
});

test('T02 and the glossary answer', async ({ page }) => {
  for (const path of ['/factory/ordinary-objects/', '/factory/glossary/']) {
    expect((await page.goto(path))?.status(), path).toBe(200);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx playwright test e2e/pages-factory.spec.ts`
Expected: FAIL — 404.

- [ ] **Step 3: Port `src/views/factory.tsx`** (rules 1–5), plus:
  - `TEXTS[2]`: replace `href: '/factory/bag-profile-series/'` with `soon: 'bagText' as const`; in `FactoryPage` pass it on: `rows={TEXTS.map((x) => ({ no: x.no, title: x.t, meta: x.d, go: <>Text, [ year ] · {x.min}<br />Read&nbsp;&nbsp;→</>, href: x.href, soon: x.soon, img: { slot: x.slot, pos: x.pos } }))}` (add `href?: string; soon?: SoonKey` to the `TEXTS` element type by declaring `const TEXTS: { no: string; t: string; d: string; min: string; href?: string; soon?: SoonKey; slot: string; pos: string }[]`).
  - `came` → `cat.pick(['BR-A', 'OB-011', 'BG-114', 'JK-001'])` and the thesis label by id: `const THESIS: Record<string, string> = { 'BR-A': 'T02', 'OB-011': 'T02', 'BG-114': 'T01', 'JK-001': 'T01' };` → `<span>Thesis {THESIS[p.id]}</span>`.
  - The theses block (`<div className="theses">`): the inline tuple array typed `any` becomes a typed list, and T03 / T04 get the coming-soon line (spec §6). Put above `FactoryPage`:
    ```tsx
    const THESES: { n: string; t: string; d: string; used?: string; href?: string; id?: string }[] = [
      { n: 'T01', t: '// profile', d: 'The construction profile as a basic form', used: 'Fashion · Bags', href: '/factory/tectonics-without-origin/', id: 't01' },
      { n: 'T02', t: '// ordinary object', d: 'The found tool, taken at face value', used: 'Jewellery · Scan Series', href: '/factory/ordinary-objects/', id: 't02' },
      { n: 'T03', t: '( )', d: 'In work' },
      { n: 'T04', t: '( )', d: 'In work' },
    ];
    ```
    and render it as
    ```tsx
    <div className="theses">
      {THESES.map((x) => (
        <article key={x.n} id={x.id} className={cx('thesis', !x.href && 'is-red')}>
          <p><b>{x.n}</b>&nbsp;&nbsp;{x.t}</p>
          <p className="thesis__d">{x.href ? x.d : <Soon k="theses">{x.d}</Soon>}</p>
          {x.used && <p className="micro">Used in: {x.used}</p>}
          {x.href && <A className="link-u" href={x.href}>Read&nbsp;&nbsp;→</A>}
        </article>
      ))}
    </div>
    ```
  - `LinkRow` links → `[{ label: 'Publishing', soon: 'publishing' }, { label: 'Archive', soon: 'archive' }, { label: 'Glossary', href: '/factory/glossary/' }, { label: 'Lectures', soon: 'lectures' }]`.
  - `READER[2]` → `{ no: '03', t: 'Bag / Profile Series', m: 'Mobile architecture at the scale of the body', soon: 'bagText' as const }` (type the array with `href?: string; soon?: SoonKey`, and the `items` prop of `Reader` the same way); `Reader` maps `soon: x.soon` into the rows.
  - `TextT01`: `const sh3 = cat.byId('SH-003');` → `{sh3 && <Opening x={34} y={62} w={12} label="SH / 003  //shirt  →  shop" href={sh3.href} light />}`; `works` → `cat.pick(['BG-114', 'BG-NEW', 'JK-001', 'VT-001'])` and the sub line by id: `const SUB: Record<string, string> = { 'BG-114': 'U, turned on its side', 'BG-NEW': 'A bonded spine', 'JK-001': 'Shoulder as lintel', 'VT-001': 'A diagonal brace' };`; the `tile__b` button → `<QuickAddButton product={toSummary(p)} />`.
  - `TextT02`: `works` → `cat.pick(['BR-A', 'BR-B', 'OB-011', 'OB-021'])`.
  - Delete `TextT03` and drop now-unused imports (`Coming` stays only if still used).

- [ ] **Step 4: Route files** — `FactoryPage` `'/factory/'`, `TextT01` `'/factory/tectonics-without-origin/'`, `TextT02` `'/factory/ordinary-objects/'`, `GlossaryPage` `'/factory/glossary/'` with the static template.

- [ ] **Step 5: Run the tests**

Run: `npx playwright test e2e/pages-factory.spec.ts && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "$(printf 'Port the Factory and its texts\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 18: Studio, series, works

**Files:**
- Move: `legacy/src/pages/studio.tsx` → `src/views/studio.tsx`
- Create: `src/components/shop/WorkState.tsx`, `src/app/(site)/studio/page.tsx`, `src/app/(site)/studio/conceptual-interference/page.tsx`, `src/app/(site)/studio/conceptual-interference/[work]/page.tsx`, `src/app/(site)/studio/layer-paintings/page.tsx`, `src/app/(site)/studio/layer-paintings/[work]/page.tsx`, `e2e/pages-studio.spec.ts`

**Interfaces:**
- Consumes: `EnquireButton` (Task 14), `useBag`, `useChrome`, `fromPrice(cat, w)`.
- Produces: `StudioPage`, `CIPage`, `LPPage` (async), `WorkPage({ w, cat })`; `WorkStateProvider({ initial, children })`, `StatePick({ options })`, `EditionAdd({ product, needsState })`.

- [ ] **Step 1: Write the failing E2E test `e2e/pages-studio.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('studio: exhibitions, sound, scenography, architecture are coming soon', async ({ page }) => {
  await page.goto('/studio/');
  await expect(page.locator('.head6__r .soon')).toHaveCount(4);
  await expect(page.locator('a[href*="/studio/exhibitions/"], a[href*="/studio/sound/"]')).toHaveCount(0);
});

test('a layer painting: choose a state, add the archival print', async ({ page }) => {
  await page.goto('/studio/layer-paintings/lp-02/');
  await page.locator('#states').getByText('State 03').click();
  await page.locator('.own__o').nth(2).getByRole('button', { name: 'Choose a state · Add' }).click();
  await expect(page.locator('.hd__util')).toContainText('Bag ( 1 )');
  const bag = await page.evaluate(() => JSON.parse(localStorage.getItem('cfc.bag.v1')!));
  expect(bag[0]).toMatchObject({ id: 'LP-02.A', opts: { state: { v: '3', l: 'State 03' } } });
});

test('enquiring about an original says it is not connected yet', async ({ page }) => {
  await page.goto('/studio/conceptual-interference/ci-07/');
  await page.getByRole('button', { name: 'Enquire about the original' }).click();
  const dialog = page.getByRole('dialog', { name: 'Enquire' });
  await expect(dialog).toContainText('CI / 07 — the original');
  await dialog.getByLabel('Name').fill('A. Person');
  await dialog.getByLabel('E-mail').fill('a@example.com');
  await dialog.getByRole('button', { name: 'Send enquiry' }).click();
  await expect(dialog.getByRole('status')).toHaveText('Sending messages is not connected yet.');
});

test('the series pages answer', async ({ page }) => {
  for (const path of ['/studio/conceptual-interference/', '/studio/layer-paintings/', '/studio/layer-paintings/lp-04/']) {
    expect((await page.goto(path))?.status(), path).toBe(200);
  }
});
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx playwright test e2e/pages-studio.spec.ts`
Expected: FAIL — 404.

- [ ] **Step 3: Write `src/components/shop/WorkState.tsx`**

```tsx
'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useChrome } from '@/components/chrome/ChromeProvider';
import { useBag } from '@/lib/bag/store';
import { cx } from '@/lib/cx';
import type { ProductSummary } from '@/lib/products/summary';

interface WorkStateValue { state: string | null; setState: (s: string) => void }
const WorkState = createContext<WorkStateValue>({ state: null, setState: () => {} });

/** The state (01 – 03) a Layer Paintings print is made from — shared by the picker and the Add buttons. */
export function WorkStateProvider({ initial, children }: { initial: string | null; children: ReactNode }) {
  const [state, setState] = useState(initial);
  return <WorkState.Provider value={{ state, setState }}>{children}</WorkState.Provider>;
}

export function StatePick({ options }: { options: { value: string; label: string; image: ReactNode; sub: ReactNode }[] }) {
  const { state, setState } = useContext(WorkState);
  return (
    <fieldset className="pick" aria-label="State for the print">
      {options.map((o) => (
        <label key={o.value}>
          <input type="radio" name="lpstate" value={o.value} checked={state === o.value} onChange={() => setState(o.value)} />
          {o.image}
          <p className="micro ink">{o.label}</p>
          <span className="sub">{o.sub}</span>
        </label>
      ))}
    </fieldset>
  );
}

export function EditionAdd({ product, needsState }: { product: ProductSummary; needsState: boolean }) {
  const { state } = useContext(WorkState);
  const { add } = useBag();
  const { showToast } = useChrome();
  const [msg, setMsg] = useState('');
  const onClick = () => {
    if (needsState && !state) {
      setMsg('Choose a state first.');
      document.getElementById('states')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setMsg('');
    add(product.id, needsState && state ? { state: { v: state, l: `State 0${state}` } } : {});
    showToast(`${product.code} // ${product.name} is in your bag.`, { href: '/bag/', label: 'View bag  →' });
  };
  return (
    <>
      <button className="pill pill--ghost" type="button" onClick={onClick}>{needsState ? 'Choose a state · Add' : 'Add to bag'}</button>
      <p className={cx('buy__msg', msg && 'is-err')} role="status">{msg}</p>
    </>
  );
}
```

- [ ] **Step 4: Port `src/views/studio.tsx`** (rules 1–5), plus:
  - Delete the local `fromPrice` function; import `fromPrice` from `@/lib/data/catalog` and call `fromPrice(cat, w)` everywhere.
  - `StudioPage` (async): `head6__r` becomes `<A href="/studio/conceptual-interference/">Art ( 2 series )</A> · <Soon k="exhibitions" /> · <Soon k="sound" /> · <Soon k="scenography" /> · <Soon k="architecture" />`; replace the whole Exhibitions `<Sp s="m">…</Sp>` block with `<Sp s="m"><Coming title="Exhibitions&nbsp;&nbsp;( )" text="The show is over. The document stays — the documentation is being prepared." link="Notify me&nbsp;&nbsp;→" href="/contact/?subject=notify-exhibition" /></Sp>` and the Sound block with `<Sp s="m"><Coming title="Sound&nbsp;&nbsp;( )" text="Recordings from the room the work stood in. Not yet published." link="Notify me&nbsp;&nbsp;→" href="/contact/?subject=notify-sound" /></Sp>`.
  - `CIPage`: `ed` → `cat.pick(['CI-05.P', 'CI-09.P', 'CI-14.P'])`.
  - `LPPage`: editions → `ed.map(({ w, s }) => { const p = cat.byId(`${w.id}.A`); return p && <Tile key={w.id} p={p} ratio="2/3" w={390} sub={`state 0${s} · ${p.sub}`} pos="center" />; })`.
  - `WorkPage({ w, cat }: { w: Work; cat: Catalog })`: `const poster = cat.byId(`${w.id}.P`), arch = cat.byId(`${w.id}.A`);`; wrap the returned JSX in `<WorkStateProvider initial={tri ? '2' : null}>…</WorkStateProvider>`; `EditionForm` moves out of `WorkPage` to module level (rule 7) and gets `tri` as the prop `needsState`:
    ```tsx
    /** One print edition on a work page: number, name, edition and size, price, Add. */
    function EditionForm({ p, no, name, spec, note, needsState }: { p: Product; no: string; name: string; spec: ReactNode; note: string; needsState: boolean }) {
      return (
        <div className="own__o">
          <p className="own__n"><b>{no}</b>&nbsp;&nbsp;<span>{name}</span></p>
          <p className="own__s">{spec}</p><p className="own__d">{note}</p>
          <p className="own__p">{fmtPrice(p.priceCents)}</p>
          <EditionAdd product={toSummary(p)} needsState={needsState} />
        </div>
      );
    }
    ```
    and is rendered as `{poster && <EditionForm p={poster} needsState={tri} … />}` / `{arch && <EditionForm p={arch} needsState={tri} … />}`; the original's `<button className="pill" … data-enquire=…>` → `<EnquireButton what={`${w.code} — ${isCi ? 'the original' : 'the triptych'}`} label={isCi ? 'Enquire about the original' : 'Enquire about the work'} />`; the `<fieldset className="pick">…</fieldset>` →
    ```tsx
    <StatePick options={w.slots.map((s, i) => ({
      value: String(i + 1),
      label: `State 0${i + 1}`,
      image: <Img slot={s} ratio="2/3" w={390} alt={`State 0${i + 1}`} sizes="(min-width:1440px) 390px, 30vw" />,
      sub: <>{['the plan is still legible', 'the road bends, the field closes', 'the first reading is gone'][i]} &nbsp; {arch ? fmtPrice(arch.priceCents) : ''}</>,
    }))} />
    ```
  - Delete `ExhibitionsPage` and `SoundPage`.

- [ ] **Step 5: Route files** — `StudioPage` `'/studio/'`, `CIPage` `'/studio/conceptual-interference/'`, `LPPage` `'/studio/layer-paintings/'` with the static template. `src/app/(site)/studio/conceptual-interference/[work]/page.tsx`:

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WORKS } from '@/content/catalog';
import { workPages } from '@/content/pages';
import { getCatalog } from '@/lib/data/catalog';
import { pageMetadata } from '@/lib/seo';
import { WorkPage } from '@/views/studio';

const SERIES = 'ci' as const;
const BASE = '/studio/conceptual-interference/';

export function generateStaticParams() {
  return WORKS.filter((w) => w.series === SERIES).map((w) => ({ work: w.slug }));
}

export async function generateMetadata({ params }: PageProps<'/studio/conceptual-interference/[work]'>): Promise<Metadata> {
  const { work } = await params;
  const entry = workPages().find((e) => e.path === `${BASE}${work}/`);
  return entry ? pageMetadata(entry) : {};
}

export default async function Page({ params }: PageProps<'/studio/conceptual-interference/[work]'>) {
  const { work } = await params;
  const w = WORKS.find((x) => x.series === SERIES && x.slug === work);
  if (!w) notFound();
  return <WorkPage w={w} cat={await getCatalog()} />;
}
```

`layer-paintings/[work]` is the same with `SERIES = 'lp'`, `BASE = '/studio/layer-paintings/'` and route `'/studio/layer-paintings/[work]'`.

- [ ] **Step 6: Run the tests**

Run: `npx playwright test e2e/pages-studio.spec.ts && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(printf 'Port the Studio, its series and the work pages\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 19: Campaigns, About, Contact, info pages, bag, 404

**Files:**
- Move: `legacy/src/pages/campaigns.tsx` → `src/views/campaigns.tsx`, `legacy/src/pages/info.tsx` → `src/views/info.tsx`
- Create: `src/components/shop/BagView.tsx`, `src/components/shop/BagView.test.tsx`, `src/components/shop/ClearBag.tsx`, `src/components/forms/ContactForm.tsx`, `src/components/forms/ContactForm.test.ts`, route files for `/campaigns/`, `/campaigns/01/`, `/campaigns/02/`, `/bag/`, `/bag/thank-you/`, `/about/`, `/contact/`, `/shipping/`, `/returns/`, `/faq/`, `/imprint/`, `/privacy/`, `/terms/`, `src/app/not-found.tsx`, `e2e/pages-info.spec.ts`
- Modify: `src/styles/pages.css` (`.bi__img` position)

**Interfaces:**
- Consumes: `postApi`, `useBag`, `MAX_QTY`, `fmtPrice`, `ProductSummary`, `SiteChrome`.
- Produces: `CampaignsPage`, `Campaign01`, `Campaign02`, `BagPage`, `ThankYouPage`, `AboutPage`, `ContactPage`, `ShippingPage`, `ReturnsPage`, `FaqPage`, `ImprintPage`, `PrivacyPage`, `TermsPage`, `NotFoundPage`; `<BagView products />`, `<ClearBag />`, `<ContactForm />`, `subjectFromQuery(q)`.

- [ ] **Step 1: Write the failing unit tests**

`src/components/forms/ContactForm.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { subjectFromQuery } from './ContactForm';

describe('subjectFromQuery', () => {
  it('notify-furniture preselects "notify" and keeps the full subject', () => {
    expect(subjectFromQuery('notify-furniture')).toEqual({ key: 'notify', full: 'notify-furniture' });
  });
  it('unknown or missing subjects fall back to general', () => {
    expect(subjectFromQuery('weird')).toEqual({ key: 'general', full: 'weird' });
    expect(subjectFromQuery(null)).toEqual({ key: 'general', full: '' });
  });
});
```

`src/components/shop/BagView.test.tsx`:

```tsx
// @vitest-environment jsdom
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PRODUCTS } from '@/content/catalog';
import { toSummary } from '@/lib/products/summary';
import { renderWithChrome } from '@/test/chrome';

vi.mock('next/navigation', async (importOriginal) => ({ ...(await importOriginal<typeof import('next/navigation')>()), usePathname: () => '/bag/' }));
import { BagView } from './BagView';

const products = Object.fromEntries(PRODUCTS.map((p) => [p.id, toSummary({ ...p, priceCents: p.id === 'OB-011' ? 32000 : null })]));

describe('BagView', () => {
  afterEach(() => { localStorage.clear(); vi.unstubAllEnvs(); });

  it('an empty bag says so', () => {
    renderWithChrome(<BagView products={products} />);
    expect(screen.getByText('Your bag is empty.')).toBeInTheDocument();
  });

  it('lists lines, changes quantities, skips products that no longer exist', () => {
    localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'OB-011', qty: 1, opts: {} }, { id: 'GONE-1', qty: 2, opts: {} }]));
    renderWithChrome(<BagView products={products} />);
    expect(screen.getAllByRole('article')).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'One more' }));
    expect(screen.getAllByText('€ 640').length).toBeGreaterThan(0);
  });

  it('checkout says it is not connected yet', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_BASE', '');
    localStorage.setItem('cfc.bag.v1', JSON.stringify([{ id: 'OB-011', qty: 1, opts: {} }]));
    renderWithChrome(<BagView products={products} />);
    fireEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(await screen.findByText('Checkout is not connected yet.')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run src/components/forms src/components/shop/BagView.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write `src/components/forms/ContactForm.tsx`**

```tsx
'use client';

import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { postApi } from '@/lib/api';

const SUBJECTS = [
  ['general', 'General'], ['order', 'An order'], ['original', 'An original'], ['fitting', 'A fitting'],
  ['studio', 'Studio visit'], ['press', 'Press'], ['wholesale', 'Wholesale'], ['notify', 'Notify me when it exists'],
] as const;

/** ?subject=notify-furniture preselects "Notify me …" and keeps the full subject for the message. */
export function subjectFromQuery(q: string | null): { key: string; full: string } {
  const full = q ?? '';
  const key = full.split('-')[0];
  return { key: SUBJECTS.some(([k]) => k === key) ? key : 'general', full };
}

/** The contact form — also the target of every "Notify me". */
export function ContactForm() {
  const { key, full } = subjectFromQuery(useSearchParams().get('subject'));
  const [msg, setMsg] = useState('');
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { setMsg('Please enter your name, a valid e-mail address and a few words.'); return; }
    setMsg('Sending …');
    try {
      await postApi('enquire', { ...Object.fromEntries(new FormData(form)), work: full });
      setMsg('Thank you. We write back within two working days.');
      form.reset();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };
  return (
    <form className="cform" noValidate onSubmit={onSubmit}>
      <label>Name<input name="name" required autoComplete="name" /></label>
      <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
      <label>Subject<select name="subject" defaultValue={key}>{SUBJECTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
      <label>Message<textarea name="message" rows={6} required /></label>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hp" aria-hidden="true" />
      <button className="pill" type="submit">Send</button>
      <p className="dlg__msg" role="status">{msg}</p>
    </form>
  );
}
```

- [ ] **Step 4: Write `src/components/shop/BagView.tsx` and `src/components/shop/ClearBag.tsx`**

```tsx
// src/components/shop/BagView.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { postApi } from '@/lib/api';
import { MAX_QTY } from '@/lib/bag/items';
import { useBag } from '@/lib/bag/store';
import { cx } from '@/lib/cx';
import { fmtPrice } from '@/lib/format';
import type { ProductSummary } from '@/lib/products/summary';

/** The bag: lines from localStorage, prices from the catalogue, checkout through the API (Phase 2). */
export function BagView({ products }: { products: Record<string, ProductSummary> }) {
  const { items, count, set } = useBag();
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const lines = items.flatMap((i) => (products[i.id] ? [{ i, p: products[i.id] }] : []));

  if (!lines.length) {
    // as on the old site: the list column keeps its place, the summary is not shown
    return (
      <div className="bag__cols">
        <div className="bag__list">
          <div className="bag__empty"><p>Your bag is empty.</p><Link className="pill" href="/atelier/">Go to the Atelier&nbsp;&nbsp;→</Link></div>
        </div>
      </div>
    );
  }
  const unpriced = lines.some(({ p }) => p.priceCents == null);
  const total = lines.reduce((sum, { i, p }) => sum + (p.priceCents ?? 0) * i.qty, 0);
  const checkout = async () => {
    setMsg('');
    setBusy(true);
    try {
      const r = await postApi<{ url: string }>('checkout', { items: lines.map(({ i }) => ({ id: i.id, qty: i.qty, opts: Object.fromEntries(Object.entries(i.opts).map(([k, v]) => [k, v.v])) })) });
      window.location.href = r.url;
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setBusy(false);
    }
  };

  return (
    <div className="bag__cols">
      <div className="bag__list" aria-live="polite">
        {lines.map(({ i, p }) => (
          <article className="bi" key={i.key}>
            <Link className={cx('bi__img', p.ground && 'is-ground')} href={p.href}>
              {p.img && <Image src={p.img} alt="" fill sizes="160px" style={{ objectPosition: p.pos ?? '50% 50%' }} />}
            </Link>
            <div className="bi__t">
              <b>{p.code}</b> // {p.name}
              <span className="sub">{p.sub}</span>
              <span className="sub">{Object.entries(i.opts).map(([k, v]) => `${p.options.find((o) => o.id === k)?.label ?? (k === 'state' ? 'State' : k)}: ${v.l}`).join('  ·  ')}</span>
              <span className="bi__q">
                <button type="button" aria-label="One less" onClick={() => set(i.key, i.qty - 1)}>–</button>
                <span>{i.qty}</span>
                <button type="button" aria-label="One more" disabled={i.qty >= MAX_QTY} onClick={() => set(i.key, i.qty + 1)}>+</button>
              </span>
              <button type="button" className="bi__rm" onClick={() => set(i.key, 0)}>Remove</button>
            </div>
            <div className="bi__p">{p.priceCents == null ? '€ [price]' : fmtPrice(p.priceCents * i.qty)}<small>{p.lead}</small></div>
          </article>
        ))}
      </div>
      <aside className="sum" aria-label="Summary">
        <h2 className="sum__h">Summary</h2>
        <dl className="sum__rows">
          <div><dt>Subtotal ( {count} )</dt><dd>{unpriced ? '€ [price]' : fmtPrice(total)}</dd></div>
          <div><dt>Shipping</dt><dd>Calculated at checkout</dd></div>
          <div><dt>Duties</dt><dd>Calculated at checkout</dd></div>
        </dl>
        <p className="sum__t"><span>Total</span><b>{unpriced ? '€ [price]' : fmtPrice(total)}</b></p>
        <button className="pill pill--block" type="button" disabled={busy} onClick={checkout}>{busy ? 'One moment …' : 'Checkout'}</button>
        <p className="sum__n">Secure payment via Stripe&nbsp;&nbsp;·&nbsp;&nbsp;Free returns within 30 days</p>
        <p className="sum__e" role="alert">{msg}</p>
        <div className="tb sum__tb" role="group" aria-label="Order slate"><div><span>Order</span><span>not yet</span></div><div><span>Pieces</span><span>{count}</span></div><div><span>Ships from</span><span>[ place ]</span></div><div><span>Repair</span><span>lifetime</span></div></div>
        <p className="sum__r"><span className="r">( )</span>&nbsp; Everything here is made after you order it.</p>
      </aside>
    </div>
  );
}
```

```tsx
// src/components/shop/ClearBag.tsx
'use client';

import { useEffect } from 'react';
import { useBag } from '@/lib/bag/store';

/** On the thank-you page: the order is placed, the bag is emptied. */
export function ClearBag() {
  const { clear } = useBag();
  useEffect(() => { clear(); }, [clear]);
  return null;
}
```

Append to `src/styles/pages.css`: `.bi__img { position: relative; }`

- [ ] **Step 5: Run the unit tests**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 6: Port `src/views/campaigns.tsx`** (rules 1–5), plus:
  - `CampaignsPage` stays synchronous (no products); its links become `<A>`.
  - `Campaign01` (async): `shop4` → `cat.pick(['JK-001', 'SH-001', 'TR-002', 'VT-001'])`; the five plate rows with `product={byId('X')}` (looks 02, 04, 08, 09, 11) are skipped when their product is missing (rule 8): `const [jk1, sh1, tr3, sh3, tr2] = ['JK-001', 'SH-001', 'TR-003', 'SH-003', 'TR-002'].map((id) => cat.byId(id));` and `{jk1 && <PlateRow product={jk1} slot="campaign-01/look-02" … />}` etc.; `const jk3 = cat.byId('JK-003');` → `{jk3 && <ShopPoint px={46} py={50} lx={48} ly={80} code="JK / 003" name="jacket, black funnel" sub="Bonded wool" price={fmtPrice(jk3.priceCents)} href={jk3.href} product={toSummary(jk3)} />}`; `const jk5 = cat.byId('JK-005');` → `{jk5 && <p className="walk__b">{fmtPrice(jk5.priceCents)}&nbsp;&nbsp;&nbsp;<QuickAddButton product={toSummary(jk5)} /></p>}`; in `linkcol` replace the two `<a href="/journal/">` with `<Soon k="journal">Film</Soon>` and `<Soon k="journal">Behind the set</Soon>`.
  - `Campaign02` (async): `lives.map(…)` → `lives.flatMap((x) => { const p = cat.byId(x.p); return p ? [<PlateRow key={x.slot} product={p} slot={x.slot} ratio="768/900" pos={x.pos} w={768} code={`${p.code}  //${p.name}`} line={x.l} />] : []; })`; tiles → `cat.pick(['OB-011', 'OB-021', 'OB-031', 'OB-034'])`.

- [ ] **Step 7: Port `src/views/info.tsx`** (rules 1–5), plus:
  - `BagPage` (async): `rail` → `cat.pick(['BR-B', 'OB-021', 'BG-114', 'TR-002'])`; replace the `<div className="bag" data-bag-root>…</div>` block with
    ```tsx
    <div className="bag">
      <header className="bag__h"><h1 className="title">Bag <span className="sub">( <BagCount /> )</span></h1><p className="sub">Everything is made in a small series. Pieces are held for 30 minutes once you check out.</p></header>
      <BagView products={Object.fromEntries(cat.products.map((p) => [p.id, toSummary(p)]))} />
      <p className="bag__back"><A href="/atelier/">◂&nbsp;&nbsp;Continue shopping</A></p>
    </div>
    ```
  - `ThankYouPage`: add `<ClearBag />` as its first child.
  - `AboutPage`: `Register` row 03 → `{ no: '03', name: 'Bag / Profile Series', meta: 'Mobile architecture at the scale of the body', link: 'Read', soon: 'bagText' }` (`link` is the word shown once the text is live).
  - `ContactPage`: replace the `<form className="cform" data-contact …>…</form>` with `<Suspense fallback={<p className="g">Loading the form …</p>}><ContactForm /></Suspense>` (`import { Suspense } from 'react'`).
  - Delete `PressPage`, `JournalPage`, `EmptyRoom`.

- [ ] **Step 8: Route files** — static template for `CampaignsPage` `'/campaigns/'`, `Campaign01` `'/campaigns/01/'`, `Campaign02` `'/campaigns/02/'`, `BagPage` `'/bag/'`, `ThankYouPage` `'/bag/thank-you/'`, `AboutPage` `'/about/'`, `ContactPage` `'/contact/'`, `ShippingPage` `'/shipping/'`, `ReturnsPage` `'/returns/'`, `FaqPage` `'/faq/'`, `ImprintPage` `'/imprint/'`, `PrivacyPage` `'/privacy/'`, `TermsPage` `'/terms/'`. And `src/app/not-found.tsx`:

```tsx
import type { Metadata } from 'next';
import { SiteChrome } from '@/components/site-chrome';
import { NotFoundPage } from '@/views/info';

export const metadata: Metadata = { title: 'Not found', robots: { index: false } };

export default function NotFound() {
  return <SiteChrome><NotFoundPage /></SiteChrome>;
}
```

- [ ] **Step 9: Write `e2e/pages-info.spec.ts`**

```ts
import { expect, test } from '@playwright/test';

test('the bag: list, quantity, remove, checkout not connected', async ({ page }) => {
  await page.goto('/atelier/scan-series/ob-011/');
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await page.goto('/bag/');
  await expect(page.locator('.bi')).toHaveCount(1);
  await page.getByRole('button', { name: 'One more' }).click();
  await expect(page.locator('.bi__q span')).toHaveText('2');
  await page.getByRole('button', { name: 'Checkout' }).click();
  // not getByRole('alert'): Next adds its own route announcer with that role
  await expect(page.locator('.sum__e')).toHaveText('Checkout is not connected yet.');
  await page.getByRole('button', { name: 'Remove' }).click();
  await expect(page.getByText('Your bag is empty.')).toBeVisible();
});

test('thank-you empties the bag', async ({ page }) => {
  await page.goto('/atelier/scan-series/ob-011/');
  await page.getByRole('button', { name: 'Add to bag' }).click();
  await page.goto('/bag/thank-you/');
  await expect(page.locator('.hd__util')).toContainText('Bag ( 0 )');
});

test('Notify me preselects the subject of the contact form', async ({ page }) => {
  await page.goto('/contact/?subject=notify-furniture');
  await expect(page.getByLabel('Subject')).toHaveValue('notify');
});

test('campaign 01 links Film and Behind the set as coming soon', async ({ page }) => {
  await page.goto('/campaigns/01/');
  await expect(page.locator('.linkcol .soon')).toHaveCount(2);
});

test('the info pages answer; an unknown page is a 404 inside the site', async ({ page }) => {
  for (const path of ['/campaigns/', '/campaigns/02/', '/about/', '/shipping/', '/returns/', '/faq/', '/imprint/', '/privacy/', '/terms/']) {
    expect((await page.goto(path))?.status(), path).toBe(200);
  }
  const res = await page.goto('/nowhere/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('header[data-header]')).toBeVisible();
  await expect(page.getByText('This page is drawn nowhere.')).toBeVisible();
});
```

- [ ] **Step 10: Run the tests**

Run: `npx playwright test && npx vitest run && npm run typecheck && npm run lint`
Expected: PASS — the whole suite.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "$(printf 'Port Campaigns, About, Contact, the info pages, the bag and the 404\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 20: Link crawl, visual check, legacy removal, README

**Files:**
- Create: `e2e/links.spec.ts`, `e2e/visual.spec.ts`
- Delete: `legacy/`
- Modify: `README.md` (rewritten), `tsconfig.json`, `eslint.config.mjs`, `vitest.config.mts` (drop the `legacy` excludes)

**Interfaces:**
- Consumes: `allPages`, `getCatalog`, `soonPaths`.

- [ ] **Step 1: Write `e2e/links.spec.ts`**

```ts
import { expect, test } from '@playwright/test';
import { allPages } from '../src/content/pages';
import { soonPaths } from '../src/content/soon';
import { getCatalog } from '../src/lib/data/catalog';

/** href / src values of a page that point into the site — path plus anchor; query strings are dropped. */
function internalRefs(html: string): { url: string; hash?: string }[] {
  return [...html.matchAll(/\s(?:href|src)="(\/[^"#?]*)(\?[^"#]*)?(#[^"]*)?"/g)].map((m) => {
    // next/image: check the picture file itself, not the optimiser
    if (m[1] === '/_next/image') return { url: new URLSearchParams((m[2] ?? '').slice(1).replace(/&amp;/g, '&')).get('url') ?? '' };
    return { url: m[1], hash: m[3]?.slice(1) };
  });
}

test('every internal link and picture of every page answers 200, no redirects, no coming-soon targets', async ({ request }) => {
  test.setTimeout(600_000);
  const pages = allPages(await getCatalog()).map((p) => p.path);
  const status = new Map<string, number>();
  const html = new Map<string, string>();
  const problems: string[] = [];
  const get = async (url: string): Promise<number> => {
    if (!status.has(url)) {
      const res = await request.get(url, { maxRedirects: 0 });
      status.set(url, res.status());
      if (res.status() === 200 && url.endsWith('/')) html.set(url, await res.text());
    }
    return status.get(url)!;
  };

  for (const path of pages) {
    if ((await get(path)) !== 200) { problems.push(`${path} → ${status.get(path)}`); continue; }
    for (const { url, hash } of internalRefs(html.get(path)!)) {
      if (!url || url.startsWith('/_next/')) continue;
      if (soonPaths().some((s) => url.startsWith(s))) problems.push(`${path} links to coming-soon ${url}`);
      const code = await get(url);
      if (code !== 200) problems.push(`${path} → ${url} answers ${code}`);
      else if (hash && html.has(url) && !html.get(url)!.includes(`id="${hash}"`)) problems.push(`${path} → ${url}#${hash}: no such anchor`);
    }
  }
  expect(problems).toEqual([]);
});
```

- [ ] **Step 2: Run it and fix what it finds**

Run: `npx playwright test e2e/links.spec.ts`
Expected: PASS. Every reported line is a real defect (a missed `<A>`, a removed page still linked, a missing anchor id, a sample picture that does not exist) — fix it in the view or slot it names and re-run until the list is empty.

- [ ] **Step 3: Write `e2e/visual.spec.ts`** (screenshots for review, not assertions)

```ts
import { test } from '@playwright/test';

const PAGES = ['/', '/atelier/', '/atelier/fashion/', '/atelier/fashion/sh-001/', '/atelier/bags/', '/factory/', '/factory/tectonics-without-origin/', '/studio/', '/studio/layer-paintings/lp-02/', '/campaigns/01/', '/about/', '/bag/'];

test.describe('@visual @phone screenshots for review', () => {
  for (const path of PAGES) {
    test(path, async ({ page }, info) => {
      await page.goto(path);
      await page.evaluate(async () => { await document.fonts.ready; });
      const name = `${info.project.name}${path.replace(/\//g, '_') || '_home'}.png`;
      await page.screenshot({ path: `test-results/visual/${name}`, fullPage: true });
    });
  }
});
```

Run: `npx playwright test e2e/visual.spec.ts --grep @visual`
Expected: 24 screenshots in `test-results/visual/` (12 pages × desktop 1440 and phone 390). Open them and compare with the PDF sheets: header window on the brackets, no horizontal overflow on the phone, coming-soon entries red.

- [ ] **Step 4: Delete the legacy code**

```bash
git rm -r -q legacy
rm -rf dist dist-server   # build output of the old site, git-ignored; stop `node dist-server/server.mjs` first if it still runs
```

Remove `"legacy"` from `exclude` in `tsconfig.json`, `'legacy/**'` from `eslint.config.mjs` and `vitest.config.mts`. In `.gitignore` delete the block that no longer has anything to match:

```
# runtime data of the old static server
data/*.jsonl
data/stripe-catalog.json
```

- [ ] **Step 5: Rewrite `README.md`**

````markdown
# Concept. ( ) Collective — Website

Next.js 16 (App Router) auf Vercel. Backend (Checkout, Bestand, Formulare, Admin) kommt in Phase 2/3 als Firebase Functions — siehe `docs/superpowers/specs/2026-10-13-nextjs-firebase-rebuild-design.md`.

## Schnellstart

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
| `npm run typecheck` · `npm run lint` | TypeScript · ESLint |
| `npm run images:report` | Status-Spalte von `IMAGE-SLOTS.md` aktualisieren |
| `npm run sign:css` | Klammerfenster-CSS aus den Schrift-Messdaten neu erzeugen |
| `python3 scripts/measure-font.py` | Display-Schrift neu vermessen — nur wenn sie ersetzt wird (braucht `pip install playwright`); danach `npm run sign:css` |

## Inhalte

* Produkte: `src/content/catalog.ts` (Phase 2: Admin + Firestore). Preise: `src/content/prices.json` (EUR) oder `DEMO_PRICES=1` für Vorschauen.
* Menü und Footer: `src/content/nav.ts` · Texte: `src/content/texts.ts` · Seiten-Metadaten: `src/content/pages.ts`.
* **Coming soon:** `src/content/soon.ts`. Status auf `'live'` setzen, sobald eine Seite Inhalt hat (Route in `src/app/(site)` wieder anlegen) — Links schalten sich überall frei, die Weiterleitung entfällt.
* Bilder: Datei `public/images/<slot>.jpg` ablegen (Slot-Liste: `IMAGE-SLOTS.md`). `IMAGES=strict` zum Launch — dann keine Beispielbilder mehr.

## Header und Menü

* Header (Variante B): fixiert, weiß, nur zwischen den Klammern durchsichtig. Die Fensterform wird aus `src/lib/sign/font-metrics.json` berechnet (`windowShape`). Nach 40 px Scrollen klappen Kreise und Beschriftung weg.
* Menü (M2): ein Panel pro Welt, fährt über den Header; Inhalte in `src/content/nav.ts`.

## Deploy

Branch → Pull Request → Vercel-Preview → Merge nach `main`. Umgebungsvariablen siehe `.env.example`; das Repository ist öffentlich — keine Schlüssel einchecken.
````

- [ ] **Step 6: Full verification**

Run: `npm run typecheck && npm run lint && npx vitest run && npx playwright test`
Expected: everything PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(printf 'Check every link, remove the legacy code, rewrite the README\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>')"
```

---

### Task 21: First Vercel preview

**Files:** none (deployment)

- [ ] **Step 1: Ask the user for the go-ahead** — pushing publishes the branch in the public repository and starts a Vercel build. Confirm: push `nextjs-rebuild` and open a draft pull request against `main`?

- [ ] **Step 2: Push and open a draft PR**

```bash
git push -u origin nextjs-rebuild
gh pr create --draft --base main --head nextjs-rebuild --title "Next.js rebuild — phase 1 (frontend)" --body "$(printf 'Phase 1 of docs/superpowers/specs/2026-10-13-nextjs-firebase-rebuild-design.md: every page on Next.js 16.4, fixed see-through header (B), menu per room (M2), coming soon + redirects. Checkout and forms say \"not connected yet\" until phase 2.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)')"
```

- [ ] **Step 3: Check the preview**

Run: `gh pr checks --watch` (Vercel's check appears when the repository is connected to a Vercel project; if no Vercel check appears, tell the user the repository is not connected and ask them to import it in Vercel or to run `vercel link`).
Expected: the Vercel deployment succeeds; open the preview URL and click through Home → Menu → a product → Bag. Set `DEMO_PRICES=1` and `IMAGES=local` for the Preview environment in Vercel if prices should show.

- [ ] **Step 4: Report** the preview URL and the PR link to the user.
