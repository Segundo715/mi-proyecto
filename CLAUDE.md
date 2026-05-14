@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npx tsc --noEmit # Type-check without emitting files
```

No test suite is configured.

## What This App Does

Coffee shop loyalty card system. Customers scan a shop QR code → fill a registration form → the employee sends them a WhatsApp/SMS activation link → once confirmed, customers show their personal QR code to receive visit stamps. After 5 stamps they earn a free coffee. The employee dashboard at `/admin` handles scanning and activation.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · Tailwind CSS 4 · TypeScript

**Data layer:** `lib/db.ts` — flat-file JSON database at `data/customers.json`. All reads and writes go through synchronous `fs` calls (no ORM, no migrations). This file is server-only; never import it from client components. The `data/` directory is gitignored and auto-created on first write.

**Customer state machine** (`app/components/LoyaltyCard.tsx`):
```
loading → form → confirm → waiting → (employee sends activation link) → card
```
- `loyalty_pending_id` in localStorage = registered but not yet activated
- `loyalty_id` in localStorage = confirmed, active card
- On mount, the component checks both keys and routes to the correct step.

**Activation flow** (the key design decision):
1. Customer submits form → `POST /api/customers` → customer created with `confirmed: false` → ID saved as `loyalty_pending_id`
2. Employee sees pending customer in `/admin` → taps "Enviar por WhatsApp/SMS" → opens `wa.me/${customerPhone}?text=...${origin}/activate?id=${uuid}`
3. Customer taps the link in their WhatsApp → `/activate?id=UUID` → `PATCH /api/customers/:id { action: 'confirm' }` → `loyalty_id` set in localStorage → redirected to `/`

**API routes** (all under `app/api/customers/`):
- `GET /api/customers` — full customer list
- `POST /api/customers` — create customer (`confirmed: false`)
- `GET /api/customers/[id]` — single customer
- `PATCH /api/customers/[id]` — action dispatch: `confirm` | `stamp` | `redeem`
  - `stamp` silently no-ops if `confirmed === false` (returns null → 404)

**QR codes:**
- Shop QR (shown in `/admin`): encodes `window.location.origin` — customers scan this to open the registration page
- Customer QR (shown on their card): encodes their UUID — employee scans this to add a stamp

**`QRScanner` component** (`app/components/QRScanner.tsx`): dynamically imports `html5-qrcode` (SSR-unsafe) inside `useEffect`. Uses a `didScanRef` guard to prevent double-firing. The scanner `div#qr-reader` must already be in the DOM when `Html5Qrcode.start()` is called — the component re-mounts via a `scanKey` ref increment in the parent to reset state cleanly.

**`/activate` page**: Uses a `<Suspense>` wrapper (`page.tsx`) + inner client component (`ActivateClient.tsx`) because `useSearchParams()` requires Suspense in Next.js App Router.

## Configuration to Change Before Deployment

**`app/components/LoyaltyCard.tsx` line 7:**
```ts
const BUSINESS_WA = '4471078185' // number without + or spaces
```
This is the WhatsApp number customers message when notifying the business of their registration.

The activation link domain comes from `window.location.origin` at runtime — no static config needed.

## Important Constraints

- `lib/db.ts` uses synchronous `fs` — fine for a single-server deployment but will lose data if the process restarts on serverless platforms (Vercel, etc.). For serverless, replace `lib/db.ts` with a real database while keeping the same exported function signatures.
- Tailwind CSS 4 uses `@import "tailwindcss"` in `globals.css`, not a `tailwind.config.js`. Custom theme tokens go inside `@theme inline {}` in that file.
- `RouteContext<'/api/customers/[id]'>` is a globally available Next.js 16 type — no import needed.
- `html5-qrcode` must never be statically imported; always use dynamic `import()` inside `useEffect`.
