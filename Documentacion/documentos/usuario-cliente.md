# Documentación del Usuario Cliente — NICHO

**Última actualización:** 2026-07-08
**Alcance:** Todo lo que ve, usa y experimenta el cliente (comensal/público) de la plataforma.

---

## 1. Rutas públicas del cliente

El cliente nunca tiene un panel de control. Accede directamente a rutas públicas desde su celular o navegador.

| Ruta | Para qué sirve |
|------|----------------|
| `/menu` | Menú digital + hacer pedidos |
| `/registro` o `/loyalty` | Registro en el programa de lealtad |
| `/card` | Ver tarjeta de lealtad y código QR |
| `/card/premium` | Variante premium de tarjeta |
| `/card/2x1` | Tarjeta promoción 2x1 |
| `/card/descuento` | Tarjeta con descuento |
| `/card/wallet` | Tarjeta tipo wallet |
| `/card/usuario` | Tarjeta con cuenta de usuario |
| `/review` o `/resena` | Dejar reseña del restaurante |
| `/recetas` o `/resetas` | Ver recetario público |
| `/activate` | Activar cuenta de cliente (enlace por WhatsApp) |
| `/cumpleanos` | Registrar fecha de nacimiento |

Todas estas rutas son **públicas** — no requieren contraseña.

---

## 2. Menú digital (`/menu`)

### Qué ve el cliente

- **Barra superior:** logo del restaurante y nombre.
- **Categorías:** botones horizontales para filtrar (ej. Entradas, Bebidas, Postres).
- **Tarjetas de platillos:** foto, nombre, descripción y precio. Los platillos agotados aparecen en gris con etiqueta **(Agotado)** y no se pueden agregar.
- **Botón "me encanta" (❤):** incrementa el contador de likes del platillo. Público, sin necesidad de cuenta.
- **Botón flotante de pedido:** aparece cuando hay al menos un artículo en el carrito.

### Cómo hacer un pedido

1. Toca un platillo → se añade al pedido.
2. Ajusta cantidad con **−** y **+**.
3. Pulsa el botón flotante **"Realizar pedido"**.
4. En el resumen, agrega **notas por platillo** si quieres (ej. "sin cebolla").
5. Elige tipo de pedido:
   - **En restaurante:** nombre y mesa (opcional).
   - **A domicilio:** nombre, dirección, referencias y forma de pago.
6. Pulsa **"Confirmar pedido"**.

### Seguimiento en tiempo real

Después de confirmar, el cliente ve una barra de progreso:

```
Recibido → Preparando → Listo → Entregado
```

La barra se actualiza sola (polling cada pocos segundos). Los pedidos entregados desaparecen automáticamente 30 segundos después.

### Asistente IA en el menú

El cliente puede usar el botón flotante de IA (abajo a la derecha). El rol es `customer` — **no requiere sesión**. El sistema de IA recibe el contexto del menú desde el cliente (no consulta Supabase para este rol). El asistente puede:
- Recomendar platillos según preferencias.
- Explicar ingredientes o alérgenos.
- Agregar platillos recomendados al carrito con un toque.

---

## 3. Programa de lealtad — Registro

### Flujo de registro (`/registro` o `/loyalty`)

El registro pasa por una máquina de estados guardada en `localStorage`:

```
loading → form → confirm → waiting → card
```

| Estado | Qué ve el cliente |
|--------|-----------------|
| `loading` | Spinner mientras se carga |
| `form` | Formulario de registro |
| `confirm` | Resumen para confirmar |
| `waiting` | "Registro recibido, espera activación" |
| `card` | Tarjeta activada y sellos |

**Paso a paso:**

1. Abre `/registro`.
2. Llena:
   - **Nombre completo**
   - **Número de WhatsApp** (con código de país, ej. 526641234567)
   - **Fecha de nacimiento**
3. Acepta términos y pulsa **"Unirme"**.
4. La tarjeta queda en estado **pendiente** — el restaurante debe activarla.
5. La página hace polling automático. Cuando el admin activa, el cliente ve **"¡Tarjeta activada!"** sin recargar.

**Claves de localStorage usadas:**
- `loyalty_pending_id` — UUID de cliente registrado pero sin activar
- `loyalty_id` — UUID de cliente confirmado y activo
- `loyalty_card_id` — ID de la tarjeta de lealtad activa

Si el cliente ya estaba registrado en ese dispositivo, la app lo saluda por nombre y muestra sus sellos.

---

## 4. Tarjeta de lealtad (`/card`)

### Qué ve el cliente

- **Frente de la tarjeta:** logo del restaurante, nombre del cliente, sellos acumulados (íconos sobre imagen de fondo) y progreso hacia la recompensa.
- **Reverso de la tarjeta** (al tocar): código QR con el UUID del cliente.
- **Estado de sellos:** de 0 a N sellos configurados. Al llegar al máximo, aparece el mensaje de recompensa.

### Variantes de tarjeta

Cada ruta muestra un diseño distinto configurado por el admin:

| Ruta | Descripción |
|------|-------------|
| `/card` | Tarjeta estándar |
| `/card/premium` | Diseño premium |
| `/card/2x1` | Promoción 2 por 1 |
| `/card/descuento` | Descuento especial |
| `/card/wallet` | Diseño estilo wallet |
| `/card/usuario` | Requiere cuenta de cliente (`/api/customer-auth`) |

### Cómo mostrar el QR al empleado

1. Abre `/card`.
2. Si es la primera vez, escribe tu **nombre y teléfono** para recuperar tu tarjeta.
3. Toca la tarjeta para **girarla** y ver el código QR.
4. Muéstraselo al empleado para que lo escanee y selle tu visita.

### Reglas del programa

- Solo tarjetas **activas** acumulan sellos.
- Al canjear la recompensa, los sellos vuelven a cero.
- El número máximo de sellos y la recompensa los define el admin en `/admin/tarjetas`.

---

## 5. Cuenta de cliente (`/card/usuario`)

La variante `/card/usuario` permite al cliente crear una cuenta con contraseña para acceder a su tarjeta desde cualquier dispositivo (sin depender de localStorage).

### Registro de cuenta

- Requiere nombre y contraseña.
- Hash almacenado en la tabla `customers` (SHA-256).
- Endpoint: `POST /api/customer-auth` con `action: 'register'`.

### Inicio de sesión

- Endpoint: `POST /api/customer-auth` con `action: 'login'`.
- La sesión se guarda en localStorage (no cookie).

---

## 6. Reseñas (`/review` o `/resena`)

### Dejar una reseña

1. Abre `/review`.
2. Selecciona una calificación de **1 a 5 estrellas** tocando las estrellas.
3. Escribe tu **nombre** y un **comentario**.
4. Pulsa **"Enviar reseña"**.

### Cómo se moderan

- Reseñas de **4 o 5 estrellas**: se publican automáticamente en la página.
- Reseñas de **3 estrellas o menos**: se marcan como negativas. El admin las ve en su panel pero no se publican. Se dispara un email de alerta al restaurante.
- El cliente ve la **calificación promedio** y las reseñas publicadas de otros.

---

## 7. Recetario público (`/recetas` o `/resetas`)

Vista pública de recetas del restaurante. Muestra:
- Lista de recetas con nombre, descripción y foto.
- Al tocar una receta: ingredientes y pasos de preparación.
- Marca propia: logo y color configurados en `recetario_logo` y `recetario_color` (tabla `settings`).

No requiere sesión. El cliente puede explorar y consultar recetas libremente.

---

## 8. Club de cumpleaños (`/cumpleanos`)

El cliente puede registrar su fecha de nacimiento para recibir promociones en su día.

1. Abre `/cumpleanos`.
2. Llena **nombre**, **teléfono** y **fecha de nacimiento**.
3. Pulsa registrar.

Endpoint público: `POST /api/cumpleanos`. El admin ve todos los registros en `/admin/cumpleanos` (requiere sesión de admin).

---

## 9. Activación de cuenta (`/activate`)

Cuando un cliente se registra, el empleado le envía un enlace de activación por WhatsApp:

```
wa.me/[BUSINESS_WA]?text=Tu%20enlace:%20/activate?id=[UUID]
```

El cliente toca el enlace → se abre `/activate?id=UUID` → la tarjeta queda confirmada y activa.

La página envuelve `useSearchParams()` en `<Suspense>` (requerido por App Router de Next.js).

---

## 10. Navegación del cliente (`CustomerNav`)

Barra de navegación inferior visible en las rutas públicas del cliente. Configurable desde el admin en `/admin/navegador` (editor visual `NavegadorEditor`).

La configuración se guarda en `settings` con clave `customer_nav` como JSON:

```json
{
  "bg": "#0d0d0d",
  "border": "#1a1a1a",
  "accent": "#B90F45",
  "inactive": "#666",
  "radius": 9999,
  "tabs": [
    { "id": "menu",    "label": "Menú",    "href": "/menu",    "icon": "url-o-ruta" },
    { "id": "card",    "label": "Tarjeta", "href": "/card",    "icon": "url-o-ruta" },
    { "id": "review",  "label": "Reseñas", "href": "/review",  "icon": "url-o-ruta" }
  ],
  "showLogout": false
}
```

Los tabs visibles dependen también de `user_permissions` (escrito por el superadmin):

| Permiso | Controla |
|---------|---------|
| `usr_menu` | Tab de menú |
| `usr_resenas` | Tab de reseñas |
| `usr_tarjeta` | Tab de tarjeta de lealtad |

Si un permiso es `false`, el tab se oculta en `CustomerNav`.

---

## 11. Permisos del cliente (superadmin)

El superadmin puede habilitar o deshabilitar qué tabs ve el cliente desde `mi-superadmindrestaurante`. Se guarda en `settings` con clave `user_permissions`:

```json
{
  "usr_menu": true,
  "usr_resenas": true,
  "usr_tarjeta": true
}
```

Leído por `GET /api/permissions` y aplicado en `CustomerNav`.

---

## 12. Personalización visual del portal

El admin configura los colores y logo que ve el cliente en `/admin/configuracion` → sección "Menú del cliente":

| Clave en settings | Qué controla |
|-------------------|-------------|
| `menu_logo` | Logo en `/menu` y `/card` (fallback: `profile_logo`) |
| `menu_bg_color` | Color de fondo del menú (default: `#0d0d0d`) |
| `menu_btn_color` | Color de botones (default: `#B90F45`) |
| `menu_hover_color` | Color de hover (default: `#DC5E86`) |
| `recetario_logo` | Logo del recetario |
| `recetario_color` | Color de acento del recetario |
| `registro_titulo` | Título en `/registro` |
| `registro_subtitulo` | Subtítulo en `/registro` |

---

## 13. QR — flujo completo

### QR del empleado → cliente escanea

1. El empleado en `/employee` muestra el QR del negocio (codifica `${origin}/card`).
2. El cliente escanea → se abre `/card` en su celular.
3. El cliente recupera su tarjeta y muestra su QR personal.

### QR del cliente → empleado escanea

1. El cliente gira su tarjeta en `/card` y muestra su QR (contiene el UUID).
2. El empleado en `/employee/customers` o `/admin/sellar` usa el escáner (`QRScanner`).
3. Al leer el UUID, sella la visita automáticamente.

**Nota técnica:** `QRScanner` usa `html5-qrcode` cargado dinámicamente en `useEffect` (nunca importación estática por incompatibilidad con SSR).

---

*Fin — usuario-cliente.md · NICHO · 2026-07-08*
