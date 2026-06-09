@AGENTS.md

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (next dev --webpack)
npm run build    # Production build
npm run lint     # Run ESLint
npx tsc --noEmit # Type-check without emitting files
```

No test suite is configured.

## What This App Does

Restaurant/coffee-shop SaaS platform ("Chubis", white-labeled per tenant). It started as a single loyalty-card system and has grown into a multi-module product with three audiences:

- **Customers** (public, no chrome): digital menu (`/menu`), reviews (`/review`, `/resena`), recipe book (`/recetas`, `/resetas`), and several loyalty-card styles (`/card`, `/card/premium`, `/card/2x1`, `/card/descuento`, `/card/wallet`, `/card/usuario`), registration (`/registro`, `/loyalty`), and the activation page (`/activate`). The TV signage view (`/tv`) is meant for an in-store screen.
- **Employees** (`/employee/*`): scan/stamp loyalty cards, manage orders, menu, TV slides, recipes, customers. Login at `/employee/login`.
- **Admins** (`/admin/*`): full dashboard — analytics, marketing, CRM, sales, menu, recipes, operations, TV signage (`/admin/tv`), reservations & floor-plan ops (`/admin/reservaciones`), loyalty/stamping (`/admin/sellar`), cards (`/admin/tarjetas`), reviews, automation, content, production, reports, configuration (`/admin/configuracion`), and the customer-nav editor (`/admin/navegador`). Login at `/admin/login`.

The classic loyalty flow still exists: 5 stamps → free coffee. `app/page.tsx` redirects `/` → `/menu`.

## Architecture

**Stack:** Next.js 16 (App Router, webpack) · React 19 · Tailwind CSS 4 · TypeScript · Supabase · Konva/react-konva (canvas) · lottie-react

> ⚠️ This is Next.js 16 with breaking changes vs. older versions. See `AGENTS.md` — read `node_modules/next/dist/docs/` before writing framework code.

### Data layer — Supabase (NOT flat-file JSON anymore)

All persistence goes through Supabase (`lib/supabase.ts`, a single anon-key client). Each domain has its own `lib/*Db.ts` module that owns a table and exposes async functions returning camelCase domain types via a `toX(row)` mapper (DB columns are snake_case):

| Module | Table | Notes |
|---|---|---|
| `lib/db.ts` | `customers` | Legacy loyalty customers + customer accounts (`createCustomerAccount`/`authenticateCustomer`, SHA-256 password hash). Activation state machine lives here. |
| `lib/loyaltyDb.ts` | `loyalty_cards` | Newer card model: `active` flag, 90-day rolling `expires_at` (refreshed on each stamp/redeem). `findOrCreate` matches by name + normalized phone. |
| `lib/menuDb.ts` | `menu_items` | Menu CRUD, `likes` counter, `available` flag. |
| `lib/ordersDb.ts` | `orders` | `status`: pending → preparing → ready → delivered. |
| `lib/recipeDb.ts` | `recipes` | Recipe book; seeded from `data/recipes.json` via `POST /api/recipes/seed`. |
| `lib/reviewDb.ts` | `reviews` | Auto: `bad = rating <= 3`, `published = rating >= 4`. Bad reviews trigger an email. |
| `lib/tvDb.ts` | `tv_slides` | Ordered slides (`slide_order`), `active`, `is_offer`. |
| `lib/settingsDb.ts` | `settings` | Generic key/value store: `getSetting(key, fallback)` / `setSetting(key, value)` (upsert). Drives all branding/config. |
| `lib/adminDb.ts` | `admins` | Admin accounts, SHA-256(`ADMIN_SECRET:name:password`). |
| `lib/employeeDb.ts` | `employees` | Employee accounts, SHA-256(`emp:ADMIN_SECRET:name:password`). |

These modules are **server-only** — never import them from client components; clients reach data through the API routes under `app/api/`. The legacy `data/*.json` files (except `recipes.json`) are stale leftovers from the old flat-file design and are not used at runtime.

**Image uploads:** `app/api/{menu,tv,recipes,settings}/upload/route.ts` accept multipart form data, push the file to the Supabase Storage bucket `uploads/` (path prefixed per domain, e.g. `menu/<uuid>.jpg`), and return the public URL.

### Auth & sessions

- **Admin/employee:** `lib/auth.ts` issues a stateless HMAC session token `"<id>.<hmac(id)>"` signed with `ADMIN_SECRET`, stored in the `admin_session` httpOnly cookie (+ readable `admin_name` cookie). API routes guard writes with `verifySession(req.cookies.get('admin_session')?.value)`. Login/logout: `POST`/`DELETE /api/auth` (admin), `/api/employee/auth`.
- **Customer accounts:** name + password (`/api/customer-auth`), hashed in `lib/db.ts`. Most customer-facing reads/writes are unauthenticated.

### Branding & configuration (the `settings` table)

Branding is data-driven, not hardcoded. The admin/employee layouts (`app/{admin,employee}/layout.tsx`) read settings **on the server** and pass them through `BrandProvider` (`useBrand()`) so the sidebar name/logo/accent render with no flash; they also inline a `data-admin-theme` init script and accent-colored scrollbar CSS. Known settings keys (set via `/admin/configuracion`, `/admin/navegador`, `/admin/menu`, `/admin/recipes`):

- `restaurant_name`, `profile_logo`, `sidebar_accent` — admin/employee chrome branding
- `registro_titulo`, `registro_subtitulo` — `/registro` welcome copy
- `customer_nav` — JSON config for the bottom `CustomerNav` (tabs, colors, radius, logout) — see `normalizeNavConfig` in `app/components/CustomerNav.tsx`
- `reward_categories` — JSON driving the loyalty card reward tiers (consumed by every `/card/*` variant and `/admin/tarjetas`)
- `recetario_color`, `recetario_logo` — recipe-book branding
- plus per-page keys read in `/admin/menu`, `/menu`, `/resetas`, `/admin/produccion`

### Feature flags

`lib/features.ts` exports `FEATURES` (key → `{ enabled, label, emoji }`). `AdminNav` (`app/components/AdminNav.tsx`) greys out and shows a "PRO" badge on links whose feature is disabled. Toggling a flag is the lever for gating modules per tenant. `AdminNav` is also drag-reorderable (order persisted in localStorage `admin_nav_order`).

### Customer state machine (`app/components/LoyaltyCard.tsx` / card pages)

```
loading → form → confirm → waiting → (employee sends activation link) → card
```
- `loyalty_pending_id` in localStorage = registered, not yet activated
- `loyalty_id` / `loyalty_card_id` in localStorage = confirmed, active card
- On mount the component checks these keys and routes to the correct step.

**Activation flow:**
1. Customer submits form → `POST /api/customers` (`confirmed: false`) → ID saved as `loyalty_pending_id`
2. Employee sees the pending customer → taps "Enviar por WhatsApp/SMS" → opens `wa.me/${phone}?text=...${origin}/activate?id=${uuid}`
3. Customer taps the link → `/activate?id=UUID` → `PATCH /api/customers/:id { action: 'confirm' }` → `loyalty_id` set → redirect to `/`

### API routes (`app/api/`)

Each domain has a collection route (`GET` list / `POST` create) and an `[id]` route (`GET`/`PATCH`/`DELETE`). `PATCH` routes dispatch on an `action` field. Notable ones:
- `customers/[id]` — `action`: `confirm` | `stamp` | `redeem` (`stamp` no-ops if `confirmed === false`)
- `loyalty/[id]` — `action`: `stamp` | `redeem` | `activate` | `deactivate` (all admin-guarded)
- `menu/[id]/like` — public increment of `likes`
- `settings` — `GET ?key=` public read; `POST` admin-only write
- `recipes/seed` — fills/creates recipes from `data/recipes.json` without overwriting captured ingredients/steps
- `analytics`, `tv`, `reviews`, `orders`, `admins`, `auth`, `employee/auth`, `customer-auth`

### QR codes & scanner

- Shop QR (`/admin`): encodes `window.location.origin` — customers scan to open registration
- Customer QR (on the card): encodes the UUID — employee scans to add a stamp
- `QRScanner` (`app/components/QRScanner.tsx`): dynamically imports `html5-qrcode` (SSR-unsafe) inside `useEffect`, guards double-fire with `didScanRef`. The `div#qr-reader` must be in the DOM before `Html5Qrcode.start()`; the parent re-mounts it via a `scanKey` ref bump.
- `/activate` uses `<Suspense>` (`page.tsx`) + inner client component (`ActivateClient.tsx`) because `useSearchParams()` requires Suspense in the App Router.

### Client-only modules (Konva canvas + localStorage)

Two newer feature areas run **entirely in the browser** — no Supabase, no API routes. State lives in React and persists to `localStorage`. Most live in a **repo-root `components/` folder** (distinct from `app/components/`), imported via `@/components/...` (the `@/*` alias maps to the repo root — see `tsconfig.json`).

- **TV digital signage** — `/admin/tv` is a "Gestión de Pantallas" editor (clients → TVs → screens) with a Lottie animation system; per-screen fullscreen public view at `/admin/tv/pantalla/[id]`. Components in `app/components/` (`LottiePlayer`, `AnimationRenderer`, `AnimationEditorModal`, `animations/` registry). Lottie JSON lives in `public/animations/`; register a new animation by adding its `<id>.tsx` `AnimationDef` to `app/components/animations/registry.ts`. localStorage key: `pantalla_dashboard_v1`. Uses `lottie-react` (client-only).
- **Reservations operations** — `/admin/reservaciones` is tabbed: Reservaciones (list) · Servicio · Plano de mesas · Perfiles · Timeline · Consumo · Turnos. Modules under root `components/{floor-plan,service,guests,timeline,spend,shifts}/`:
  - `floor-plan/` — interactive table-layout editor (react-konva). Domain types in `floor-plan/types.ts` (`RestaurantTable`, `FloorPlan`). localStorage key: `floor_plan_v1`.
  - `service/` — host/service panel (waitlist + reservation rows) beside a live read-only floor plan; seating a party updates the table status and re-persists `floor_plan_v1`.
  - `guests/` (`guest_profiles_v1`) and `shifts/` (`shift_plan_v1`) are localStorage-backed; `timeline/` and `spend/` read the saved floor plan for table names and otherwise use demo data.

**Konva/SSR rule:** `react-konva`/`konva` are not SSR-safe. The canvas (`FloorCanvas`) is loaded with `next/dynamic(() => import('./FloorCanvas'), { ssr: false })` from a `"use client"` parent — never import react-konva from a Server Component. All these modules theme via the admin `--ad-*` CSS vars, so they follow the light/dark toggle.

### Email

`lib/email.ts` uses `nodemailer` (Gmail). `createReview` with `rating <= 3` sends a "reseña negativa" alert. No-ops silently if `GMAIL_USER` / `GMAIL_APP_PASSWORD` are unset.

## Environment Variables

Set in `.env.local` (only Supabase is currently configured locally):

- `NEXT_PUBLIC_SUPABASE_URL` — **required**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **required**
- `ADMIN_SECRET` — HMAC session + password-hash secret. **Set in production** (falls back to `'dev-secret'`, which makes sessions forgeable).
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `REVIEW_EMAIL` — optional, enable bad-review email alerts

`app/components/LoyaltyCard.tsx` also has a `BUSINESS_WA` constant (WhatsApp number, no `+`/spaces) to change per deployment. The activation-link domain comes from `window.location.origin` at runtime.

## Important Constraints

- **Add a new persisted field** → update the table's `toX(row)` mapper, the insert/update payloads, and the `interface` in the relevant `lib/*Db.ts` (DB is snake_case, domain types are camelCase).
- Tailwind CSS 4 uses `@import "tailwindcss"` in `globals.css` — there is no `tailwind.config.js`. Custom theme tokens go in `@theme inline {}`. Admin/employee theming uses CSS vars (`--ad-bg`, `--ad-accent`, …) toggled by `data-admin-theme`.
- `RouteContext<'/api/.../[id]'>` is a globally available Next.js 16 type — no import needed.
- `html5-qrcode` must never be statically imported; always `import()` inside `useEffect`.
- `react-konva`/`konva` must never be statically imported either; load the canvas with `next/dynamic(..., { ssr: false })` from a client component (not SSR-safe).
- The `@/*` alias points at the **repo root**, so root-level `components/` (the Konva/localStorage modules) imports as `@/components/...` — distinct from the server-adjacent `app/components/`.
- Server-only `lib/*Db.ts` and `lib/auth.ts`/`lib/email.ts` must not be imported from client components.
