# Documentación Técnica — `mi-proyecto` (NICHO / Chubis)

> **Actualizada:** 2026-06-28
> **URL producción:** mi-proyecto-phi-ecru.vercel.app
> **Restaurant ID:** `'default'` (NICHO / Chubis)

---

## 1. ¿Qué hace esta app?

Plataforma SaaS multi-restaurante. Este proyecto sirve a **NICHO** (Chubis). Comparte Supabase con `mi-restauranteportales` — el aislamiento es por `restaurant_id` en cada tabla.

Cuatro tipos de usuarios:

| Tipo | Rutas | Descripción |
|------|-------|-------------|
| **Clientes** | `/menu`, `/review`, `/recetas`, `/registro`, `/card`, `/loyalty` | Portal público del restaurante |
| **Empleados** | `/employee/*` | Sellar tarjetas, gestionar pedidos y menú |
| **RESTA3** | `/resta3/*` | Panel secundario del personal con marca propia |
| **Admins** | `/admin/*` | Dashboard completo — analíticas, CRM, ventas, configuración |

---

## 2. Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router, webpack) |
| UI | React 19 + TypeScript |
| Estilos | Tailwind CSS 4 |
| Base de datos | Supabase (`@supabase/supabase-js`) |
| IA | Groq API (Llama 3.1/3.3 en streaming) |
| Canvas | Konva / react-konva (reservaciones, TV) |
| Animaciones | lottie-react |
| Deploy | Vercel |

---

## 3. Estructura de carpetas

```
mi-proyecto/
├── app/
│   ├── globals.css                    # Tailwind v4 + variables --ad-*
│   ├── page.tsx                       # Redirige "/" → /menu
│   ├── menu/page.tsx                  # Menú digital público
│   ├── review/page.tsx                # Reseñas (público)
│   ├── resena/page.tsx                # Alias de reseñas
│   ├── recetas/page.tsx               # Recetario público
│   ├── resetas/page.tsx               # Alias recetario
│   ├── registro/page.tsx              # Registro de clientes lealtad
│   ├── loyalty/page.tsx               # Alternativa a registro
│   ├── activate/page.tsx              # Activación de tarjeta de lealtad
│   ├── card/                          # Estilos de tarjeta de lealtad
│   ├── tv/page.tsx                    # Señalización TV fullscreen
│   │
│   ├── admin/                         # Panel admin
│   │   ├── layout.tsx                 # Auth guard + BrandProvider
│   │   ├── login/page.tsx
│   │   ├── page.tsx                   # Dashboard
│   │   ├── menu/page.tsx
│   │   ├── recipes/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── analytics/page.tsx
│   │   ├── tv/page.tsx
│   │   ├── reservaciones/page.tsx     # Plano mesas (Konva)
│   │   ├── loyalty/page.tsx
│   │   ├── reviews/page.tsx
│   │   ├── marketing/page.tsx
│   │   ├── crm/page.tsx
│   │   ├── automatizacion/page.tsx
│   │   ├── contenido/page.tsx
│   │   ├── produccion/page.tsx
│   │   ├── reportes/page.tsx
│   │   ├── configuracion/page.tsx
│   │   └── navegador/page.tsx         # Editor de CustomerNav
│   │
│   ├── employee/                      # Panel empleados
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── ...
│   │
│   ├── resta3/                        # Panel RESTA3 (secundario)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── tpv/page.tsx
│   │   ├── mesas/page.tsx
│   │   ├── cocina/page.tsx
│   │   ├── domicilios/page.tsx
│   │   ├── inventario/page.tsx
│   │   ├── compras/page.tsx
│   │   ├── empleados/page.tsx
│   │   ├── reportes/page.tsx
│   │   └── corte/page.tsx
│   │
│   ├── components/
│   │   ├── AIChat.tsx                 # Chat IA (Groq, roles por URL)
│   │   ├── AdminNav.tsx               # Sidebar admin reorganizable por arrastre
│   │   ├── EmployeeNav.tsx
│   │   ├── CustomerNav.tsx            # Navegación cliente (JSON configurable)
│   │   ├── AdminThemeToggle.tsx       # Dark/light sin hydration mismatch
│   │   ├── RightRail.tsx              # Panel lateral RESTA3 (portal DOM)
│   │   ├── Icon.tsx                   # ~50 íconos de línea
│   │   ├── LoyaltyCard.tsx            # Tarjeta lealtad (BUSINESS_WA hardcodeado)
│   │   └── RewardIcon.tsx             # Íconos categorías de recompensa
│   │
│   └── api/                           # Ver sección 9
│
├── lib/
│   ├── supabase.ts                    # Cliente anon (strip BOM U+FEFF)
│   ├── auth.ts                        # HMAC tokens sin estado
│   ├── db.ts                          # customers
│   ├── menuDb.ts                      # menu_items
│   ├── ordersDb.ts                    # orders
│   ├── recipeDb.ts                    # recipes
│   ├── reviewDb.ts                    # reviews
│   ├── loyaltyDb.ts                   # loyalty_cards
│   ├── tvDb.ts                        # tv_slides
│   ├── settingsDb.ts                  # settings (prefijo por restaurante)
│   ├── adminDb.ts                     # admins
│   ├── employeeDb.ts                  # employees
│   ├── tablesDb.ts                    # tables (mesas)
│   ├── inventoryDb.ts                 # inventory
│   ├── birthdayDb.ts                  # birthday_registrations (fetch directo)
│   ├── features.ts                    # getFeatureFlags(), catálogo FEATURES
│   ├── email.ts                       # Alertas reseñas negativas (nodemailer)
│   ├── uploadWebp.ts                  # Conversión WebP en cliente (Canvas API)
│   └── imageWebp.ts                   # Pass-through (sharp eliminado)
│
├── components/                        # Módulos Konva/canvas (alias @/components)
├── data/                              # JSON de demo (recipes.json, demo-menu.json)
└── .github/workflows/sync-portales.yml
```

---

## 4. Multi-tenancy — restaurant_id

Todos los módulos `lib/*Db.ts` declaran:

```ts
const RID = process.env.NEXT_PUBLIC_RESTAURANT_ID || 'default'
```

- Filtran **todas** las lecturas con `.eq('restaurant_id', RID)`
- Incluyen `restaurant_id: RID` en todos los inserts
- Este proyecto usa `'default'` (NICHO). Portales usa `'portales'`

**Excepción — tabla `settings`:** usa prefijo de clave sin `restaurant_id`:

```ts
// NICHO:   'restaurant_name'
// Portales: 'portales:restaurant_name'
```

> ⚠️ Si datos se crearon sin la env var, tienen `restaurant_id='default'`. Si la app muestra vacío tras configurar la variable, hacer PATCH masivo en Supabase REST.

---

## 5. Autenticación y sesiones

### Admin / Empleado / RESTA3

`lib/auth.ts` emite tokens HMAC sin estado: `"<id>.<hmac(id)>"` firmado con `ADMIN_SECRET`. Cookie httpOnly `admin_session`.

- Hash admin: `SHA-256(ADMIN_SECRET:name:password)`
- Hash empleado: `SHA-256(emp:ADMIN_SECRET:name:password)`
- Hash resta3: `SHA-256(emp:ADMIN_SECRET:name:password)` (misma lógica)

### Clientes

Nombre + contraseña. Endpoint: `POST /api/customer-auth`.

---

## 6. Capa de datos — Módulos lib

| Módulo | Tabla | Notas clave |
|--------|-------|-------------|
| `lib/db.ts` | `customers` | Hash SHA-256, máquina de estados activación |
| `lib/loyaltyDb.ts` | `loyalty_cards` | `active`, `expires_at` 90 días, `findOrCreate` |
| `lib/menuDb.ts` | `menu_items` | CRUD, contador `likes`, flag `available` |
| `lib/ordersDb.ts` | `orders` | Estados: pending→preparing→ready→delivered |
| `lib/recipeDb.ts` | `recipes` | Seed desde `data/recipes.json` |
| `lib/reviewDb.ts` | `reviews` | `bad = rating ≤ 3`, `published = rating ≥ 4`, email en negativas |
| `lib/tvDb.ts` | `tv_slides` | `slide_order`, `active`, `is_offer` |
| `lib/settingsDb.ts` | `settings` | Clave-valor con prefijo por restaurante |
| `lib/adminDb.ts` | `admins` | SHA-256 con salt ADMIN_SECRET |
| `lib/employeeDb.ts` | `employees` | SHA-256 con salt emp:ADMIN_SECRET |
| `lib/tablesDb.ts` | `tables` | Status: libre/ocupada/reservada/limpieza |
| `lib/inventoryDb.ts` | `inventory` | `stock`, `minStock`, `unit`, `cost` |
| `lib/birthdayDb.ts` | `birthday_registrations` | Fetch directo a Supabase REST con service key |

> Todos son **solo de servidor** — nunca importar desde componentes cliente.

---

## 7. Tabla settings — Claves conocidas

| Clave | Descripción |
|-------|-------------|
| `restaurant_name` | Nombre del restaurante |
| `profile_logo` | Logo del panel admin/empleado |
| `sidebar_accent` | Color acento (default `#B90F45`) |
| `restaurant_address`, `restaurant_phone` | Tickets de pedido |
| `admin_subtitle` | Subtítulo en sidebars |
| `resta3_logo`, `resta3_accent`, `resta3_name` | Overrides marca RESTA3 |
| `employee_logo`, `employee_accent` | Overrides panel empleados |
| `menu_logo` | Logo en /menu y /card |
| `menu_bg_color`, `menu_btn_color`, `menu_hover_color` | Colores portal cliente |
| `business_wa` | WhatsApp del negocio (dígitos, ej. `526641234567`) |
| `customer_nav` | JSON NavConfig: tabs, colores, íconos del portal cliente |
| `reward_categories` | JSON niveles de tarjeta de lealtad |
| `employee_permissions` | Flags por módulo de empleado |
| `user_permissions` | Flags por tab de cliente |
| `corte_turno_inicio` | Timestamp turno activo RESTA3 |
| `cortes_historial` | Historial cortes de caja RESTA3 (últimos 100) |
| `feature_flags_${restaurantId}` | Flags de módulos admin (escritos por superadmin) |
| `feature_flags_resta3` | Flags RESTA3: `r3_tpv`, `r3_mesas`, `r3_cocina`, etc. |

---

## 8. Feature flags

`lib/features.ts` — 19 claves admin:

`orders`, `menu`, `reviews`, `tv`, `customers`, `analytics`, `loyaltyCard`, `favorites`, `ventas`, `marketing`, `crm`, `reservaciones`, `operaciones`, `automatizaciones`, `contenido`, `produccion`, `reportes`, `configuracion`, `cumpleanos`

`getFeatureFlags()` busca `feature_flags_${rid}` primero, luego `feature_flags`. Feature no encontrada = **habilitada por defecto**.

**Flags RESTA3** (`feature_flags_resta3`): `r3_tpv`, `r3_mesas`, `r3_cocina`, `r3_inventario`, `r3_compras`, `r3_empleados`, `r3_reportes`

---

## 9. APIs — Todos los endpoints

### Auth y usuarios

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth` | POST/DELETE | Login/logout admin |
| `/api/employee/auth` | POST/DELETE | Login/logout empleado |
| `/api/resta3/auth` | POST/DELETE | Login/logout resta3 (tab login y register) |
| `/api/customer-auth` | POST | Auth cliente nombre+contraseña |
| `/api/admins` | GET/POST | Lista / crea admin |
| `/api/admins?id=` | DELETE | Elimina admin (mínimo 1, no auto-borrado) |
| `/api/employees` | GET/POST | Lista / crea empleado |
| `/api/employees?id=` | DELETE | Elimina empleado |

### Datos principales

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/menu` | GET/POST | Lista items / crea item |
| `/api/menu/[id]` | GET/PATCH/DELETE | Detalle / actualiza / elimina |
| `/api/menu/[id]/like` | POST | Incrementa likes (público) |
| `/api/menu/upload` | POST | Sube imagen → Supabase Storage `uploads/` |
| `/api/menu/seed` | POST | Llena demo desde `demo-menu.json` |
| `/api/orders` | GET/POST | Lista pedidos / crea pedido |
| `/api/orders/[id]` | PATCH | Actualiza status |
| `/api/recipes` | GET/POST | Lista / crea receta |
| `/api/recipes/[id]` | PATCH/DELETE | Actualiza / elimina |
| `/api/recipes/seed` | POST | Seed desde `data/recipes.json` |
| `/api/recipes/upload` | POST | Sube imagen |
| `/api/reviews` | GET/POST | Lista / crea reseña (email si ≤3 estrellas) |
| `/api/reviews/[id]` | PATCH/DELETE | Publicar/despublicar / elimina |
| `/api/customers` | GET/POST | Lista / registra cliente lealtad |
| `/api/customers/[id]` | PATCH | `action: confirm \| stamp \| redeem` |
| `/api/loyalty` | GET/POST | Tarjetas de lealtad |
| `/api/loyalty/[id]` | PATCH | `action: stamp \| redeem \| activate \| deactivate` |
| `/api/tv` | GET/POST | Slides TV |
| `/api/tv/[id]` | PATCH/DELETE | Actualiza / elimina slide |
| `/api/tv/upload` | POST | Sube imagen slide |
| `/api/settings` | GET `?key=` / POST | Lee clave (público) / guarda clave (admin) |
| `/api/settings/upload` | POST | Sube logo/imagen de configuración |
| `/api/cumpleanos` | GET/POST | Lista (admin) / registra (público) |
| `/api/cumpleanos/[id]` | DELETE | Elimina (admin) |

### Analytics, flags y soporte

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/analytics` | GET | KPIs: tarjetas, pedidos, revenue, top 5 items, histograma 7 días |
| `/api/features` | GET/POST | Lee/escribe feature flags (CORS restringido a superadmin) |
| `/api/permissions` | GET | `{employee: {...}, user: {...}}` desde settings |
| `/api/tickets` | POST | Crea ticket de soporte → `sa_tickets` en BD |
| `/api/audit` | POST | Registra acción en log |

### RESTA3

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/resta3/features` | GET | Flags RESTA3 desde `feature_flags_resta3` |
| `/api/resta3/corte` | GET | Turno activo + conteos por tipo de pago + historial |
| `/api/resta3/corte` | POST | Cierra turno activo y abre nuevo |
| `/api/resta3/inventory` | GET/POST | Lista inventario / crea item |
| `/api/resta3/inventory/[id]` | PATCH/DELETE | Actualiza / elimina |

### IA (Groq)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/ai/chat` | POST | Proxy Groq en streaming. `{role, message, menuContext?}`. **Debe ser Lambda Node.js** (`maxDuration=60`) |

---

## 10. Asistente de IA

**Modelos:**
- `llama-3.1-8b-instant` — rol cliente (rápido)
- `llama-3.3-70b-versatile` — todos los roles de personal/admin

**Roles y datos:**

| Rol | Datos desde Supabase |
|-----|---------------------|
| `customer` | Usa `menuContext` del cliente (sin llamadas a Supabase) |
| `cook` | Pedidos + menú + recetas completas |
| `staff` | Pedidos + menú + conteos tarjetas |
| `employee` | Pedidos + menú + recetas + tarjetas |
| `resta3` | Mesas + pedidos + alertas inventario + menú + ventas |
| `admin` | Pedidos + menú + reseñas + tarjetas + inventario + ventas |
| `recipe` | Recetas + menú |

`getRoleFromPath(path)` detecta rol por URL: `/resta3/cocina` → `cook`, `/resta3` → `resta3`, `/employee` → `employee`, `/admin` → `admin`, `/reseta|/receta` → `recipe`, sino → `customer`.

> ⚠️ **Nunca** usar `export const runtime = 'edge'` — Vercel no inyecta `GROQ_API_KEY` en Edge Runtime.

---

## 11. Subida de imágenes

- Conversión a WebP ocurre **en el navegador** via `lib/uploadWebp.ts` (Canvas API, calidad 0.82)
- Las APIs de upload son pass-through
- Imágenes en Supabase Storage bucket `uploads/` — **no están en git, el sync no las afecta**
- `lib/imageWebp.ts` es pass-through (sharp eliminado por binarios nativos en Vercel)

---

## 12. Máquina de estados del cliente lealtad

```
loading → form → confirm → waiting → (activación WA) → card
```

- `loyalty_pending_id` en localStorage = registrado sin activar
- `loyalty_id` / `loyalty_card_id` = confirmado y activo
- Activación: empleado envía `wa.me/...?text=.../activate?id=UUID` → cliente toca enlace

---

## 13. Sync a mi-restauranteportales

`.github/workflows/sync-portales.yml` — rsync con ~20 exclusiones para proteger el branding naranja de portales (`#E8912A`, logo `/logo-portales.svg`).

**Archivos excluidos del sync:**

```
app/admin/login/page.tsx
app/employee/login/page.tsx
app/resta3/login/page.tsx
app/admin/configuracion/page.tsx
app/admin/menu/page.tsx
app/admin/recipes/page.tsx
app/employee/recipes/page.tsx
app/components/AdminNav.tsx
app/components/EmployeeNav.tsx
app/components/CustomerNav.tsx
app/globals.css
app/menu/page.tsx
app/page.tsx
app/loyalty/page.tsx
app/recetas/page.tsx
app/resetas/page.tsx
app/review/page.tsx
app/salon/page.tsx
app/registro/page.tsx
app/resena/page.tsx
app/card/  (directorio completo)
lib/supabase.ts  (BD diferente en portales)
```

> ⚠️ Portales **no tiene auto-deploy en Vercel**. Después de cada push hacer `vercel --prod` manualmente.

---

## 14. Variables de entorno

| Variable | Requerida | Notas |
|----------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Strip BOM automático en `lib/supabase.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Strip BOM automático |
| `NEXT_PUBLIC_RESTAURANT_ID` | Ausente en NICHO | Ausente → `'default'`. Portales = `'portales'` |
| `ADMIN_SECRET` | ✅ | HMAC de sesión + hash contraseñas. Fallback `'dev-secret'` (inseguro) |
| `GROQ_API_KEY` | ✅ para IA | Configurar en Vercel Settings → Env Vars |
| `SUPABASE_SERVICE_KEY` | Opcional | Para `lib/birthdayDb.ts` (service role) |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `REVIEW_EMAIL` | Opcionales | Alertas reseñas negativas |

---

## 15. Restricciones y reglas de código

- **Tabla nueva:** agregar `restaurant_id TEXT DEFAULT 'default'` y filtrar en `lib/*Db.ts`.
- **Campo nuevo:** actualizar mapper `toX(row)`, payloads insert/update e `interface` en `lib/*Db.ts`.
- **Multi-tenancy:** nunca `supabase.from('tabla').select('*')` sin `.eq('restaurant_id', RID)`.
- `html5-qrcode` — siempre `import()` dentro de `useEffect`, nunca estático.
- `react-konva` — siempre `next/dynamic(..., { ssr: false })` desde componente cliente.
- `lib/uploadWebp.ts` — solo `'use client'`, nunca desde rutas de servidor.
- `lib/*Db.ts`, `lib/auth.ts`, `lib/email.ts` — solo servidor.
- Alias `@/*` apunta a raíz del repo → `@/components/...` = carpeta `components/` raíz (Konva), no `app/components/`.
- Tailwind CSS 4: `@import "tailwindcss"` en globals.css, sin `tailwind.config.js`.
