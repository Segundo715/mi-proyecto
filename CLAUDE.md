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

No test suite is configured. Always run `npx tsc --noEmit` to verify — IDE diagnostics are frequently stale and unreliable.

## What This App Does

Restaurant/coffee-shop SaaS platform ("Chubis", white-labeled per tenant). Three audiences:

- **Customers** (public): digital menu (`/menu`), reviews (`/review`, `/resena`), recipe book (`/recetas`, `/resetas`), loyalty-card styles (`/card`, `/card/premium`, `/card/2x1`, `/card/descuento`, `/card/wallet`, `/card/usuario`), registration (`/registro`, `/loyalty`), activation (`/activate`). TV signage at `/tv`.
- **Employees** (`/employee/*`): stamp loyalty cards, manage orders, menu, recipes, customers. Login at `/employee/login`.
- **RESTA3** (`/resta3/*`): secondary staff panel with its own branding (logo/accent/name stored as `resta3_logo`, `resta3_accent`, `resta3_name` in the `settings` table). Login at `/resta3/login`.
- **Admins** (`/admin/*`): full dashboard — analytics, CRM, sales, menu, recipes, TV signage, reservations & floor-plan, loyalty/stamping, reviews, automation, content, production, reports, configuration (`/admin/configuracion`), customer-nav editor (`/admin/navegador`). Login at `/admin/login`.

`app/page.tsx` redirects `/` → `/menu`.

## Architecture

**Stack:** Next.js 16 (App Router, webpack) · React 19 · Tailwind CSS 4 · TypeScript · Supabase · Konva/react-konva (canvas) · lottie-react

> ⚠️ This is Next.js 16 with breaking changes vs. older versions. See `AGENTS.md` — read `node_modules/next/dist/docs/` before writing framework code.

### Data layer — Supabase

All persistence goes through Supabase (`lib/supabase.ts`, single anon-key client). Each domain has its own `lib/*Db.ts` module owning a table and exposing async functions returning camelCase types via a `toX(row)` mapper (DB columns are snake_case):

| Module | Table | Notes |
|---|---|---|
| `lib/db.ts` | `customers` | Legacy loyalty customers + customer accounts (SHA-256 password hash). Activation state machine. |
| `lib/loyaltyDb.ts` | `loyalty_cards` | `active` flag, 90-day rolling `expires_at`. `findOrCreate` matches by name + normalized phone. |
| `lib/menuDb.ts` | `menu_items` | CRUD, `likes` counter, `available` flag. |
| `lib/ordersDb.ts` | `orders` | `status`: pending → preparing → ready → delivered. |
| `lib/recipeDb.ts` | `recipes` | Seeded from `data/recipes.json` via `POST /api/recipes/seed`. |
| `lib/reviewDb.ts` | `reviews` | `bad = rating <= 3`, `published = rating >= 4`. Bad reviews trigger email. |
| `lib/tvDb.ts` | `tv_slides` | `slide_order`, `active`, `is_offer`. |
| `lib/settingsDb.ts` | `settings` | Generic key/value: `getSetting(key, fallback)` / `setSetting(key, value)` (upsert). |
| `lib/adminDb.ts` | `admins` | SHA-256(`ADMIN_SECRET:name:password`). |
| `lib/employeeDb.ts` | `employees` | SHA-256(`emp:ADMIN_SECRET:name:password`). |
| `lib/tablesDb.ts` | `tables` | Restaurant tables: `status` = `libre \| ocupada \| reservada \| limpieza`. |
| `lib/inventoryDb.ts` | `inventory` | `stock`, `minStock` (alert threshold), `unit`, `cost`. |

These modules are **server-only** — never import from client components. Legacy `data/*.json` (except `recipes.json`) are stale and unused.

**Image uploads:** `app/api/{menu,tv,recipes,settings}/upload/route.ts` accept multipart, push to Supabase Storage bucket `uploads/` (prefixed per domain), return public URL. Upload routes are **pass-through** — they store whatever they receive. Conversion to WebP happens **in the browser** via `lib/uploadWebp.ts` before upload.

### Image handling — client-side WebP

`lib/uploadWebp.ts` is a `'use client'` utility — only import from client components, never from server routes:

- `browserToWebp(file)` — converts via Canvas API at 0.82 quality (skips SVG/WebP)
- `uploadWebp(file, apiUrl, onSize?)` — converts then uploads; `onSize(originalBytes, webpBytes)` callback for UI feedback
- `fmtBytes(n)` — formats bytes as B / KB / MB

`lib/imageWebp.ts` is now a pass-through (no sharp dependency — sharp native binaries fail on Vercel).

### Auth & sessions

- **Admin/employee/resta3:** `lib/auth.ts` issues a stateless HMAC token `"<id>.<hmac(id)>"` signed with `ADMIN_SECRET`, stored in the `admin_session` httpOnly cookie. API routes guard writes with `verifySession(req.cookies.get('admin_session')?.value)`. Login/logout: `POST`/`DELETE /api/auth` (admin), `/api/employee/auth`, `/api/resta3/auth`.
- **Customer accounts:** name + password (`/api/customer-auth`), hashed in `lib/db.ts`.

### Branding & configuration (`settings` table)

Branding is data-driven. The admin/employee/resta3 layouts read settings **on the server** and inject them via `BrandProvider` + a `data-admin-theme` init script to avoid flash. Known keys:

- `restaurant_name`, `profile_logo`, `sidebar_accent` — admin/employee chrome
- `resta3_logo`, `resta3_accent`, `resta3_name` — RESTA3 overrides (fallback to general if empty)
- `employee_logo`, `employee_accent` — employee panel overrides
- `registro_titulo`, `registro_subtitulo` — `/registro` copy
- `customer_nav` — JSON for `CustomerNav` bottom tabs (see `normalizeNavConfig`)
- `reward_categories` — JSON for loyalty card tiers
- `recetario_color`, `recetario_logo` — recipe-book branding

### AI assistant (`app/api/ai/chat/route.ts`)

Streaming chat endpoint backed by Groq API. Key constraints:

- **Must use Node.js Lambda** — `export const maxDuration = 60`. Never use `export const runtime = 'edge'`; Vercel does not inject `GROQ_API_KEY` into Edge Runtime V8 isolates (causes 401).
- Models: `llama-3.1-8b-instant` (customer role, fast) · `llama-3.3-70b-versatile` (all staff/admin roles)
- `buildSystem(role, restaurantName, menuContext?)` fetches real-time data from Supabase per role (2.5 s timeout per call via `Promise.race`):

| Role | Data fetched |
|---|---|
| `customer` | Uses `menuContext` sent by client — no Supabase calls |
| `cook` | Orders + menu + full recipes (step-by-step) |
| `staff` | Orders + menu + loyalty card counts |
| `employee` | Orders + menu + full recipes + loyalty cards |
| `resta3` | Tables (status counts) + orders + inventory alerts + menu + daily/weekly sales |
| `admin` | Orders + menu + reviews (avg rating, negatives) + loyalty cards + inventory alerts + sales |
| `recipe` | Full recipes + menu |

**`AIChat` component** (`app/components/AIChat.tsx`):
- `AIRole` type: `'cook' | 'staff' | 'customer' | 'admin' | 'recipe' | 'resta3' | 'employee'`
- `getRoleFromPath(path)` auto-detects role from URL: `/resta3/cocina` → `cook`, `/resta3` → `resta3`, `/employee` → `employee`, `/admin` → `admin`, `/reseta|/receta` → `recipe`, else `customer`
- Cook and employee roles auto-load the recipe list as quick-action buttons
- Customer role sends `menuContext` (already fetched client-side) to avoid double Supabase calls
- Voice input uses Web Speech API (`SpeechRecognition`). Requires HTTPS. If `busy`, captured text goes to input field instead of being sent immediately.
- Included in: `app/admin/layout.tsx`, `app/employee/layout.tsx`, resta3 pages

### Feature flags

`lib/features.ts` exports `FEATURES` (key → `{ enabled, label, emoji }`). `AdminNav` greys out and shows "PRO" badge on disabled features. `AdminNav` is drag-reorderable (order in localStorage `admin_nav_order`). Feature flag UI was **removed from** `/admin/configuracion` — flags are only toggled in code.

### Customer state machine

```
loading → form → confirm → waiting → (activation link sent) → card
```
- `loyalty_pending_id` in localStorage = registered, not activated
- `loyalty_id` / `loyalty_card_id` = confirmed, active

**Activation:** Customer submits form → `POST /api/customers` → employee sends `wa.me/...?text=.../activate?id=UUID` → customer taps link → confirmed.

### API routes (`app/api/`)

Collection route (`GET`/`POST`) + `[id]` route (`GET`/`PATCH`/`DELETE`). `PATCH` dispatches on `action` field:
- `customers/[id]`: `confirm | stamp | redeem`
- `loyalty/[id]`: `stamp | redeem | activate | deactivate` (admin-guarded)
- `menu/[id]/like`: public `likes` increment
- `settings`: `GET ?key=` public; `POST` admin-only
- `recipes/seed`: fills from `data/recipes.json` without overwriting existing ingredients/steps
- `ai/chat`: streaming Groq proxy — see AI section above

### QR codes & scanner

- Shop QR (`/admin`): encodes `window.location.origin`
- Customer QR: encodes the UUID — employee scans to stamp
- `QRScanner` dynamically imports `html5-qrcode` inside `useEffect` (SSR-unsafe). The `div#qr-reader` must exist before `Html5Qrcode.start()`; parent re-mounts via `scanKey` ref bump.
- `/activate` wraps `useSearchParams()` in `<Suspense>` (required by App Router).

### Client-only modules (Konva + localStorage)

Root `components/` folder (not `app/components/`), imported via `@/components/...`.

- **TV signage** — `/admin/tv` editor + `/admin/tv/pantalla/[id]` fullscreen view. Lottie animations in `public/animations/`; register via `app/components/animations/registry.ts`. localStorage: `pantalla_dashboard_v1`.
- **Reservations** — `/admin/reservaciones` with tabs: floor plan (react-konva, `floor_plan_v1`), service panel, guests (`guest_profiles_v1`), shifts (`shift_plan_v1`), timeline, spend.

**Konva/SSR rule:** load canvas with `next/dynamic(() => import('./FloorCanvas'), { ssr: false })` from a `'use client'` parent — never import react-konva from a Server Component.

### Security headers (`next.config.ts`)

- `poweredByHeader: false` — removes `X-Powered-By`
- All routes: `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Content-Security-Policy: frame-ancestors 'self'`, `Permissions-Policy: microphone=(self)`
- Dynamic pages: `Cache-Control: no-cache`
- `X-Frame-Options` is **not used** — replaced by CSP `frame-ancestors`.

### Email

`lib/email.ts` uses nodemailer (Gmail). `createReview` with `rating <= 3` sends alert. No-ops if `GMAIL_USER`/`GMAIL_APP_PASSWORD` unset.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` — **required**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — **required**
- `ADMIN_SECRET` — HMAC session + password hash secret. Falls back to `'dev-secret'` (insecure).
- `GROQ_API_KEY` — **required for AI chat**. Must be set in Vercel → Settings → Environment Variables (not just `.env.local`).
- `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `REVIEW_EMAIL` — optional, bad-review email alerts

`app/components/LoyaltyCard.tsx` has a `BUSINESS_WA` constant (WhatsApp number, no `+`/spaces) to change per deployment.

## Important Constraints

- **Add a new persisted field** → update `toX(row)` mapper, insert/update payloads, and `interface` in `lib/*Db.ts`.
- Tailwind CSS 4: `@import "tailwindcss"` in `globals.css`, no `tailwind.config.js`. Custom tokens in `@theme inline {}`. Admin theming via `--ad-*` CSS vars toggled by `data-admin-theme`.
- `RouteContext<'/api/.../[id]'>` is a globally available Next.js 16 type — no import needed.
- `html5-qrcode` — never statically import; always `import()` inside `useEffect`.
- `react-konva`/`konva` — never statically import; use `next/dynamic(..., { ssr: false })` from a client component.
- `lib/uploadWebp.ts` — `'use client'` only; never import from server routes or `lib/*Db.ts`.
- `app/api/ai/chat/route.ts` — must stay as Node.js Lambda (`maxDuration = 60`); Edge Runtime breaks `GROQ_API_KEY` injection.
- `@/*` alias → repo root, so `@/components/...` = root `components/` (Konva modules), not `app/components/`.
- Server-only: `lib/*Db.ts`, `lib/auth.ts`, `lib/email.ts` — never import from client components.
