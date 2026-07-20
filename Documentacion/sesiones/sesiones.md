# Sesiones de trabajo — mi-proyecto (NICHO / Chubis)

> Se actualiza automáticamente en cada `git commit` vía el hook `.git/hooks/post-commit`.
> Formato: fecha, día, hora, rama, mensaje del commit, archivos cambiados.

---

## 2026-07-03 — Jueves

### 09:14 PM — main
**docs: crear estructura de documentacion, sesiones y sql**
Documentacion/indice.md, Documentacion/sesiones/sesiones.md, Documentacion/sql/tablas.sql

---

## 2026-07-06 — Lunes — Resumen de sesión

### Auditoría de seguridad y correcciones generales

**Vulnerabilidades corregidas:**
- `/api/ai/chat`: abierto sin auth → agregado `verifySession()` con parse manual de cookie. Rol `customer` permanece público.
- `/api/features` (mi-restauranteportales): solo CORS → agregado header `x-admin-secret` contra `ADMIN_SECRET`.
- `/api/save-flags` (superadmin): sin auth → agregado `verifySaSession()`.

**Correcciones funcionales:**
- QR del panel de empleado (`app/employee/page.tsx:117,120`): apuntaba a `/loyalty` (ruta inexistente) → corregido a `/card`.
- 7 páginas de resta3 (`tpv`, `cocina`, `compras`, `corte`, `empleados`, `inventario`, `reportes`): color naranja hardcodeado `linear-gradient(135deg,#f59e0b,#d97706)` en botones de acción → reemplazado por `{ backgroundColor: S.accent, color: '#fff' }`.

**Documentación nueva:**
- `Documentacion/cli.md` — comandos de demo (mi-pruebas) con y sin combo por rol (admin, empleado, resta3, usuario)

**Módulos demo (`mi-pruebas/scripts/module.js`):**
- `combo_empleado`: faltaba `tv: true` → corregido
- `combo_resta3`: tenía `dashboard: true` de más → removido; target → `/resta3/tpv`

---

## 2026-07-06 — Monday

### 01:08 PM — main
**fix: corregir URL del QR de fidelizacion y seguridad en ai/chat**
Documentacion/cli.md,Documentacion/indice.md,Documentacion/sesiones/sesiones.md,Documentacion/sql/tablas.sql,app/api/ai/chat/route.ts,app/employee/page.tsx

---

## 2026-07-06 — Monday

### 01:22 PM — main
**fix: reemplazar naranja hardcodeado por accent color en TPV resta3**
app/resta3/(panel)/tpv/page.tsx

---

## 2026-07-06 — Monday

### 01:39 PM — main
**fix: reemplazar naranja hardcodeado por accent en todas las páginas resta3**
app/resta3/(panel)/cocina/page.tsx,app/resta3/(panel)/compras/page.tsx,app/resta3/(panel)/corte/page.tsx,app/resta3/(panel)/empleados/page.tsx,app/resta3/(panel)/inventario/page.tsx,app/resta3/(panel)/reportes/page.tsx

---

## 2026-07-06 — Monday

### 01:57 PM — main
**docs: actualizar CLAUDE.md y sesiones 2026-07-06**
CLAUDE.md,Documentacion/sesiones/sesiones.md

---

## 2026-07-08 — Miércoles — Resumen de sesión

### Documentación del usuario cliente + corrección de flujo de registro

**Documentación nueva:**
- Carpeta `Documentacion/documentacion-usuario/` creada con `usuario-cliente.md`
- Generada con Claude Opus (1481 líneas): 25 secciones, código real leído de los archivos fuente, diagramas ASCII, 24 FAQ, glosario
- Corrige errores del documento anterior: estados reales del registro, claves de localStorage, `/recetas` vs `/resetas`, dos sistemas separados (`loyalty_cards` vs `customers`)

**Corrección de flujo de registro (`app/registro/page.tsx`):**
- `findOrCreate()` crea tarjetas con `active: true` inmediatamente — clientes nuevos nunca esperan activación de admin
- Paso `active` ahora redirige automáticamente a `/card` en 3 segundos (`useEffect` con `setTimeout`)
- El estado `waiting` solo existe para tarjetas desactivadas manualmente por admin

**Sincronización de mi-restauranteportales:**
- Miembro de equipo hizo commit de sync (GitHub Actions) con el fix de `ai/chat`
- Rebase local: 4 commits (Dashboard/analytics + fix features POST) sobre el commit del miembro
- Push limpio sin conflictos

---

## 2026-07-08 — Wednesday

### 11:19 AM — main
**docs: agregar documentacion completa del usuario cliente**
Documentacion/documentos/usuario-cliente.md,Documentacion/indice.md

---

## 2026-07-08 — Wednesday

### 11:31 AM — main
**docs: documentacion exhaustiva del usuario cliente con Opus (566 lineas)**
Documentacion/documentacion-usuario/usuario-cliente.md,Documentacion/documentos/usuario-cliente.md,Documentacion/indice.md

---

## 2026-07-08 — Wednesday

### 11:46 AM — main
**docs: reescribir documentacion cliente con Opus v2.0 (1481 lineas)**
Documentacion/documentacion-usuario/usuario-cliente.md

---

## 2026-07-08 — Wednesday

### 12:27 PM — main
**fix: auto-redirigir a /card tras registro exitoso + corregir docs**
Documentacion/documentacion-usuario/usuario-cliente.md,app/registro/page.tsx

---

## 2026-07-08 — Wednesday

### 09:51 AM — main
**docs: agregar resumen manual de sesion 2026-07-08**
Documentacion/sesiones/sesiones.md

---

## 2026-07-16 — Thursday

### 12:16 PM — main
**fix: corregir key duplicado en Dashboard y lista de empleados vacia en RESTA3**
app/api/analytics/route.ts,app/api/employee/auth/route.ts

---

## 2026-07-20 — Monday

### 10:24 AM — main
**docs: agregar skill de CLI y completar comandos faltantes de mi-pruebas**
.claude/skills/cli/SKILL.md,.gitignore,Documentacion/cli.md

---

## 2026-07-20 — Lunes — Resumen de sesión

### Bug de tarjetas encimadas en Dashboard + lista de empleados vacía en RESTA3 + skill de CLI

**Bug corregido — Dashboard (`/admin/analytics`) con tarjetas encimadas en móvil:**
- `app/api/analytics/route.ts:86`: el histograma de "Últimos 7 días" devolvía cada entrada como `{ day, orders, revenue }`, pero `app/admin/analytics/page.tsx` esperaba `{ label, orders, revenue }` → `d.label` era `undefined` en las 7 tarjetas, dándoles a todas el mismo `key` de React (bug de reconciliación: fechas en blanco + warning de "duplicate key" en consola)
- Corregido renombrando el campo a `label`. Reproducido y verificado el fix con Chrome headless en viewport móvil (cookie de sesión forjada localmente con `ADMIN_SECRET`, sin credenciales reales)
- El encimado visual que el usuario seguía viendo después del fix se aisló a una limitación de GPU del teléfono (Samsung Galaxy A05 / SM-A055M, gama muy baja, Chrome 150 actualizado) — confirmado porque el mismo efecto ya se veía en otras apps/sitios de ese equipo, no es un bug de esta app

**Bug corregido — RESTA3, lista de Empleados siempre vacía:**
- `app/resta3/(panel)/empleados/page.tsx:29` pedía `GET /api/employee/auth` para listar empleados, pero esa ruta solo tenía `POST` (login/registro) y `DELETE` (logout) → 405 atrapado en silencio por el `try/catch`, la lista nunca se llenaba
- Agregado `GET` en `app/api/employee/auth/route.ts` que devuelve `listEmployees()` (sin datos sensibles: id, nombre, rol, fecha de alta)
- Auditoría del resto de `/resta3` (mesas, inventario, tpv, cocina, domicilios, menú, corte, reportes) buscando el mismo patrón de campo renombrado entre API y frontend: sin otros casos encontrados

**Nueva skill de CLI + documentación:**
- `.claude/skills/cli/SKILL.md`: todos los atajos npm de `mi-proyecto` (dev/build/start/seed) y `mi-pruebas` (módulos por rol, combos, `copia`), más el truco de forjar cookies de sesión (`admin_session`/`employee_session`) con `ADMIN_SECRET` para probar rutas protegidas sin login real, y la advertencia de no matar procesos `node` a lo bruto (mata también los del usuario)
- `Documentacion/cli.md` actualizado: se completaron 17+ módulos de `mi-pruebas` que faltaban (reseñas, cumpleaños, clientes, tarjetas, ventas, dashboard, estadísticas, reportes, marketing, CRM, automatizaciones, contenido, reservaciones, operaciones, producción, inventario, recetas, empleados, y los módulos exclusivos de resta3), descripciones reales de los `seed:*` (antes solo decía "Preset 1/2/3"), y `ADMIN_SECRET` agregado a las variables de entorno documentadas
- `.gitignore`: `.claude/skills/` ahora se trackea en git (antes todo `.claude/` estaba ignorado); `settings.local.json` y `worktrees/` se mantienen ignorados

---

## 2026-07-20 — Monday

### 10:28 AM — main
**docs: agregar resumen manual de sesion 2026-07-20**
Documentacion/sesiones/sesiones.md

---
