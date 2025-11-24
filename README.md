# Factory Collective

Factory Collective is a fully server-rendered commerce starter built on Next.js 16. It couples Stripe-based product management and checkout with Firebase authentication + profile storage so you can launch collectible marketplaces with confidence.

## Features

- **Latest Next.js 16 app router** with caching (`revalidate: 300`) for the storefront and dynamic rendering where cookies are involved (cart + dashboard).
- **Stripe integration** for listing products, generating checkout sessions, and graceful fallbacks when API keys are missing.
- **Cookie-backed shopping cart** implemented with server actions so state persists across devices and is never exposed to the client.
- **Firebase Auth + Firestore** to gate the `/dashboard` route and store shipping, billing, and payment preferences. When credentials are absent, it falls back to an in-memory profile store for local development.
- **Dashboard** for updating address, shipping, and payment metadata using server actions and Zod validation.

## Getting Started

1. Install dependencies
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and add your secrets (see below).
3. Run the dev server
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000` for the storefront, `/cart` for the manifest, `/login` to authenticate, and `/dashboard` for the authenticated profile editor.

## Environment Variables

Create `.env.local` with the following values:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase admin SDK
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n..."
```

Stripe + Firebase are optional for local UI testing. Without keys, the app will serve mock products, disable checkout redirection, and keep dashboard data inside the dev runtime.

## Stripe Webhooks (optional)

If you need to react to checkout events, create a webhook endpoint (e.g., `/api/stripe/webhook`) and point your Stripe CLI to it. This starter keeps checkout creation isolated in `/api/checkout`.

## Testing Checklist

- `npm run lint` — ensure TypeScript + ESLint pass.
- Stripe keys present — confirm `/api/checkout` returns a session URL.
- Firebase client + admin keys present — create an account via `/login` and verify `/dashboard` loads with persisted data in Firestore.

Deploy on any Next-ready host (Vercel, Render, etc.). Ensure env variables are set in the hosting provider.
