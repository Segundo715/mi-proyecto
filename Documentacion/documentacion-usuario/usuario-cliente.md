# Documentación del Usuario Cliente — Plataforma NICHO

**Perfil:** Cliente (comensal / público general)
**Plataforma:** NICHO — SaaS para restaurantes en México
**Stack técnico:** Next.js 16 (App Router) · Supabase · TypeScript
**Fecha del documento:** 2026-07-08
**Versión:** 1.0

---

## Índice

1. [Visión general](#1-visión-general)
2. [¿Quién es el Usuario Cliente?](#2-quién-es-el-usuario-cliente)
3. [Mapa completo de rutas públicas](#3-mapa-completo-de-rutas-públicas)
4. [Programa de lealtad — flujo completo](#4-programa-de-lealtad--flujo-completo)
5. [Máquina de estados del registro](#5-máquina-de-estados-del-registro)
6. [La tarjeta de lealtad y sus variantes](#6-la-tarjeta-de-lealtad-y-sus-variantes)
7. [Flujos de código QR](#7-flujos-de-código-qr)
8. [Menú digital y pedidos](#8-menú-digital-y-pedidos)
9. [Asistente de inteligencia artificial](#9-asistente-de-inteligencia-artificial)
10. [Reseñas](#10-reseñas)
11. [Recetario público](#11-recetario-público)
12. [Cumpleaños](#12-cumpleaños)
13. [Activación por WhatsApp](#13-activación-por-whatsapp)
14. [Likes en el menú](#14-likes-en-el-menú)
15. [Cuenta de cliente (acceso multi-dispositivo)](#15-cuenta-de-cliente-acceso-multi-dispositivo)
16. [Barra de navegación del cliente (CustomerNav)](#16-barra-de-navegación-del-cliente-customernav)
17. [Permisos del cliente](#17-permisos-del-cliente)
18. [Personalización visual](#18-personalización-visual)
19. [Seguridad y privacidad](#19-seguridad-y-privacidad)
20. [Preguntas frecuentes (FAQ)](#20-preguntas-frecuentes-faq)
21. [Diagrama del flujo de registro](#21-diagrama-del-flujo-de-registro)

---

## 1. Visión general

La plataforma NICHO es un sistema integral para restaurantes que reúne cuatro perfiles de usuario:

| Perfil | Descripción |
|--------|-------------|
| **Admin** | Dueño o gerente del restaurante. Configura todo. |
| **Empleado** | Personal operativo. Sella tarjetas, gestiona pedidos. |
| **RESTA3** | Perfil de operación avanzada / punto de venta. |
| **Cliente** | Comensal o público general. **Es el tema de este documento.** |

Este documento describe **únicamente** todo lo que puede ver y hacer el **Cliente**: la persona que come en el restaurante o pide a domicilio, que se inscribe al programa de lealtad, que deja reseñas y que interactúa con el menú digital.

El Cliente **no necesita instalar ninguna aplicación**. Todo funciona desde el navegador del teléfono a través de enlaces y códigos QR. La mayoría de las funciones son **públicas**: no requieren usuario ni contraseña. Solo la "Cuenta de cliente" (opcional) usa contraseña para permitir el acceso desde varios dispositivos.

### Principios de diseño del perfil Cliente

- **Sin fricción:** el cliente puede registrarse en segundos, solo con nombre, WhatsApp y fecha de nacimiento.
- **Público por defecto:** menú, reseñas, recetario, likes y asistente IA no piden inicio de sesión.
- **Persistencia local:** el estado del cliente se guarda en el `localStorage` del navegador, de modo que al regresar ve su tarjeta sin volver a registrarse.
- **Personalizable por restaurante:** cada restaurante define colores, logos, textos y qué pestañas ve el cliente.

---

## 2. ¿Quién es el Usuario Cliente?

El Usuario Cliente es el **comensal** o el **público general** que interactúa con el restaurante desde su propio teléfono. No forma parte del personal. Sus objetivos típicos son:

- Ver el menú y hacer un pedido (en mesa o a domicilio).
- Inscribirse al programa de lealtad y acumular sellos.
- Mostrar su tarjeta digital para que le sellen una visita.
- Canjear recompensas al completar los sellos.
- Dejar una reseña de su experiencia.
- Consultar el recetario público del restaurante.
- Registrar su cumpleaños para recibir promociones.

El Cliente accede a través de:

- **Códigos QR** colocados en mesas, mostrador o materiales impresos.
- **Enlaces de WhatsApp** que envía el restaurante.
- **La barra de navegación inferior** (CustomerNav) una vez dentro de cualquier página del cliente.

---

## 3. Mapa completo de rutas públicas

Todas estas rutas son accesibles sin sesión (salvo donde se indique). Se sirven bajo el dominio del restaurante.

| Ruta | Propósito |
|------|-----------|
| `/menu` | Menú digital + realización y seguimiento de pedidos + asistente IA |
| `/registro` | Registro al programa de lealtad (alias) |
| `/loyalty` | Registro al programa de lealtad (alias equivalente) |
| `/card` | Tarjeta de lealtad: frente + reverso con QR personal |
| `/card/premium` | Variante de tarjeta: premium |
| `/card/2x1` | Variante de tarjeta: promoción 2x1 |
| `/card/descuento` | Variante de tarjeta: descuento |
| `/card/wallet` | Variante de tarjeta: formato tipo wallet |
| `/card/usuario` | Cuenta de cliente (registro/login con contraseña) |
| `/review` | Dejar una reseña (alias) |
| `/resena` | Dejar una reseña (alias equivalente) |
| `/recetas` | Recetario público (alias) |
| `/resetas` | Recetario público (alias equivalente) |
| `/activate` | Activar cuenta mediante enlace de WhatsApp (usa `?id=[UUID]`) |
| `/cumpleanos` | Registro de cumpleaños |

> **Nota sobre alias:** varias rutas tienen dos nombres (por ejemplo `/registro` y `/loyalty`, o `/review` y `/resena`). Ambos llevan a la misma funcionalidad. Esto facilita compartir el enlace en español o en inglés según prefiera el restaurante.

---

## 4. Programa de lealtad — flujo completo

El corazón del perfil Cliente es el **programa de lealtad por sellos**. Funciona como la clásica tarjeta de "compra 9 y el 10 es gratis", pero en digital.

### Paso a paso

1. **Registro.** El cliente entra a `/registro` (o `/loyalty`) y llena un formulario con:
   - Nombre
   - Número de WhatsApp
   - Fecha de nacimiento

2. **Tarjeta pendiente.** Al enviar el formulario, la tarjeta queda en estado **"pendiente de activación"**. Todavía no acumula sellos.

3. **Activación por el empleado.** Un empleado del restaurante activa la tarjeta desde:
   - `/employee/customers` (panel de empleado), o
   - `/admin/sellar` (panel de admin)

   La activación confirma que el cliente es real y habilita la tarjeta.

4. **El cliente ve su tarjeta.** Una vez activada, el cliente abre `/card`. Ve el **frente** de su tarjeta. Al **girarla**, aparece el **reverso con su código QR personal**.

5. **Sellado de visita.** En cada visita, el empleado **escanea el QR** del cliente. Cada escaneo válido **agrega un sello**.

6. **Recompensa.** Cuando el cliente **alcanza el número máximo de sellos**, se genera una **recompensa** (por ejemplo, un producto gratis o descuento). Tras canjearla, **el contador vuelve a 0** y el ciclo se reinicia.

### Resumen del ciclo de sellos

```
Registro → Pendiente → Activada → [sello + sello + ... + sello] → Recompensa → vuelve a 0
```

---

## 5. Máquina de estados del registro

El proceso de registro del cliente se controla con una **máquina de estados** cuyo progreso se guarda en el `localStorage` del navegador. Esto permite que, si el cliente cierra la página y vuelve, retome exactamente donde se quedó.

### Estados

```
loading → form → confirm → waiting → card
```

| Estado | Qué ve el cliente |
|--------|-------------------|
| `loading` | Pantalla de carga inicial mientras se revisa el `localStorage`. |
| `form` | El formulario de registro (nombre, WhatsApp, fecha de nacimiento). |
| `confirm` | Pantalla de confirmación de los datos ingresados. |
| `waiting` | "Tu tarjeta está pendiente de activación" — espera a que el empleado la active. |
| `card` | La tarjeta ya activada y lista para usar. |

### Claves de `localStorage`

| Clave | Contenido |
|-------|-----------|
| `loyalty_pending_id` | Identificador de la tarjeta mientras está pendiente de activación. |
| `loyalty_id` | Identificador del registro de lealtad del cliente. |
| `loyalty_card_id` | Identificador de la tarjeta ya activada. |

### Lógica de recuperación

- Al cargar la página, el sistema lee estas claves.
- Si encuentra `loyalty_card_id`, salta directamente al estado `card`.
- Si encuentra `loyalty_pending_id` pero aún no está activada, muestra `waiting`.
- Si no hay nada guardado, muestra el `form`.

> **Importante:** como el estado vive en el `localStorage`, si el cliente **cambia de teléfono o borra los datos del navegador**, perderá la referencia local. Para evitarlo puede crear una **Cuenta de cliente** (ver sección 15), que le permite recuperar su tarjeta desde cualquier dispositivo.

---

## 6. La tarjeta de lealtad y sus variantes

La tarjeta digital es una tarjeta de dos caras:

- **Frente:** muestra el diseño del restaurante, el nombre del cliente y el progreso de sellos.
- **Reverso:** muestra el **código QR personal** del cliente (basado en un UUID único). Este QR es el que el empleado escanea para sellar.

El cliente **gira la tarjeta** con un toque para pasar del frente al reverso.

### Variantes de tarjeta

Cada restaurante puede ofrecer distintos tipos de tarjeta según su estrategia de lealtad:

| Ruta | Variante | Uso típico |
|------|----------|------------|
| `/card` | Estándar | Tarjeta de sellos clásica. |
| `/card/premium` | Premium | Nivel superior con beneficios adicionales. |
| `/card/2x1` | 2x1 | Promoción de dos por uno. |
| `/card/descuento` | Descuento | Tarjeta enfocada en descuentos. |
| `/card/wallet` | Wallet | Formato compacto tipo cartera digital. |
| `/card/usuario` | Cuenta de usuario | Registro/login con contraseña (ver sección 15). |

Todas las variantes comparten la mecánica central de sellos y QR, pero cambian el diseño y el tipo de beneficio.

---

## 7. Flujos de código QR

Existen **dos flujos de QR** complementarios. Es importante no confundirlos.

### Flujo A — El negocio muestra un QR, el cliente lo escanea

- El **empleado o el restaurante** muestra un QR que codifica la URL del sitio del cliente: `${origin}/card`.
- El **cliente escanea** ese QR con la cámara de su teléfono.
- Se abre `/card` y el cliente ve (o comienza a registrar) su tarjeta.

**Uso:** para dirigir a un cliente nuevo hacia el registro, o para que un cliente existente abra su tarjeta rápidamente.

### Flujo B — El cliente muestra su QR personal, el empleado lo escanea

- El **cliente gira su tarjeta** en `/card` y muestra su **QR personal** (que codifica su UUID único).
- El **empleado escanea** ese QR.
- El sistema **registra un sello** en la tarjeta de ese cliente.

**Uso:** para acumular una visita/compra en cada consumo.

### Tabla comparativa

| | Flujo A | Flujo B |
|--|---------|---------|
| ¿Quién muestra el QR? | El negocio | El cliente |
| ¿Qué codifica el QR? | `${origin}/card` | El UUID personal del cliente |
| ¿Quién escanea? | El cliente | El empleado |
| Resultado | El cliente ve/crea su tarjeta | Se sella una visita |

---

## 8. Menú digital y pedidos

La ruta `/menu` es la más completa del perfil Cliente. Combina **catálogo**, **carrito**, **pedidos** y **asistente IA**.

### 8.1 El menú

- Muestra los platillos organizados por categorías.
- Cada platillo puede tener foto, descripción, precio y un botón de **"me encanta" (❤)** (ver sección 14).
- La apariencia (colores, logo) es personalizable por el restaurante (ver sección 18).

### 8.2 Realización de pedidos

El cliente arma su carrito y elige el **tipo de pedido**:

| Tipo | Datos requeridos |
|------|------------------|
| **En restaurante** | Nombre del cliente + número de mesa (opcional) |
| **A domicilio** | Nombre + dirección + forma de pago |

Además, el cliente puede agregar **notas por platillo** (por ejemplo: "sin cebolla", "término medio").

### 8.3 Estados del pedido

Una vez enviado, el pedido pasa por estos estados:

```
pending → preparing → ready → delivered
```

| Estado | Significado para el cliente |
|--------|------------------------------|
| `pending` | Pedido recibido, en espera de que la cocina lo tome. |
| `preparing` | Se está preparando. |
| `ready` | Listo (para recoger o para servir). |
| `delivered` | Entregado. |

### 8.4 Seguimiento en tiempo real

- El cliente ve el estado de su pedido **actualizándose en tiempo real** mediante *polling* (consultas periódicas al servidor).
- Cuando un pedido llega a `delivered`, **desaparece de la vista 30 segundos después**, para mantener la pantalla limpia.

---

## 9. Asistente de inteligencia artificial

Dentro de `/menu`, el cliente cuenta con un **asistente de IA** que le ayuda a decidir qué pedir.

### Características

| Aspecto | Detalle |
|---------|---------|
| **Rol** | `customer` |
| **¿Requiere sesión?** | **No.** Es público por diseño. |
| **Modelo** | `llama-3.1-8b-instant` (optimizado para respuestas rápidas) |
| **Fuente de datos** | Recibe el `menuContext` **directamente desde el cliente**; no realiza consultas a Supabase. |
| **Entrada por voz** | Disponible vía Web Speech API (requiere conexión **HTTPS**). |

### Qué puede hacer el asistente

- **Recomendar platillos** según lo que el cliente pida (por ejemplo: "algo picante y económico").
- **Agregar platillos al carrito con un solo toque** desde su recomendación.
- Responder preguntas sobre el menú disponible.

### Detalle técnico relevante

Como el asistente recibe el contexto del menú desde el propio cliente (`menuContext`) y **no consulta la base de datos**, es muy rápido y ligero. El endpoint que lo atiende es `/api/ai/chat`.

> **Nota de seguridad (2026-07-06):** el rol `customer` en `/api/ai/chat` es el **único** que **no requiere sesión**. Es público a propósito, para que cualquier comensal pueda usarlo sin registrarse. Todos los demás roles (admin, empleado, resta3) sí requieren sesión válida.

---

## 10. Reseñas

El cliente puede dejar una reseña de su experiencia en `/review` (o `/resena`).

### Cómo funciona la calificación

El sistema aplica una **lógica de moderación automática** según el rating (de 1 a 5 estrellas):

| Rating | Acción |
|--------|--------|
| **4 – 5 estrellas** | Se **publica automáticamente**. |
| **1 – 3 estrellas** | Se marca como **negativa**, **no se publica**, y **dispara un email de alerta** al restaurante. |

Esta lógica protege la reputación pública del restaurante y, al mismo tiempo, permite que el negocio se entere de inmediato de una experiencia negativa para atenderla en privado.

### Endpoint

- `POST /api/reviews`

---

## 11. Recetario público

El restaurante puede publicar un **recetario** accesible al cliente en `/recetas` (o `/resetas`).

- Es contenido **público**, sin necesidad de sesión.
- Permite compartir recetas caseras, tips o preparaciones representativas del restaurante.
- Su apariencia se personaliza con `recetario_logo` y `recetario_color` (ver sección 18).

---

## 12. Cumpleaños

El cliente puede registrar su cumpleaños en `/cumpleanos` para recibir promociones especiales.

| Aspecto | Detalle |
|---------|---------|
| **Ruta del cliente** | `/cumpleanos` |
| **Endpoint** | `POST /api/cumpleanos` (público, auto-registro) |
| **Dónde lo ve el restaurante** | El admin consulta los registros en `/admin/cumpleanos` |

El registro es de **auto-servicio**: el propio cliente ingresa sus datos y quedan disponibles para que el restaurante los use en campañas de cumpleaños.

---

## 13. Activación por WhatsApp

Además de la activación presencial por un empleado, existe un flujo de **activación mediante enlace de WhatsApp**.

### Formato del enlace

```
wa.me/[BUSINESS_WA]?text=Tu enlace: /activate?id=[UUID]
```

- `[BUSINESS_WA]` es el número de WhatsApp del negocio.
- `[UUID]` es el identificador único de la tarjeta/cliente.

### La página `/activate`

- Recibe el parámetro `?id=[UUID]` desde la URL.
- Usa `useSearchParams()` de Next.js envuelto en un `<Suspense>` (requisito técnico de Next.js 16 para leer parámetros de la URL sin romper el renderizado).
- Al abrirse, procesa la activación de la cuenta correspondiente a ese UUID.

**Uso típico:** el restaurante envía por WhatsApp un enlace personalizado; el cliente lo toca y su cuenta/tarjeta queda activada.

---

## 14. Likes en el menú

Cada platillo del menú tiene un botón **"me encanta" (❤)**.

| Aspecto | Detalle |
|---------|---------|
| **Dónde** | En cada platillo dentro de `/menu` |
| **Endpoint** | `POST /api/menu/[id]/like` |
| **¿Requiere sesión?** | No. Es **público, sin sesión.** |

Los likes permiten al cliente expresar preferencia por sus platillos favoritos y le dan al restaurante señales de popularidad.

---

## 15. Cuenta de cliente (acceso multi-dispositivo)

El estado del cliente normalmente vive en el `localStorage` del navegador. Para no depender de un solo dispositivo, el cliente puede crear una **Cuenta de cliente** desde `/card/usuario`.

### Cómo funciona

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/card/usuario` |
| **Registro** | Nombre + contraseña |
| **Almacenamiento** | La contraseña se guarda cifrada con **SHA-256** en la tabla `customers` |
| **Beneficio** | Permite **acceder a la tarjeta desde cualquier dispositivo**, sin depender del `localStorage` |
| **Endpoint** | `POST /api/customer-auth` con `action: 'register'` o `action: 'login'` |

### Acciones disponibles

- `action: 'register'` — crea la cuenta con nombre y contraseña.
- `action: 'login'` — inicia sesión desde otro dispositivo y recupera la tarjeta.

Con esta cuenta, si el cliente cambia de teléfono o borra los datos del navegador, puede iniciar sesión y volver a ver su tarjeta con todos sus sellos.

---

## 16. Barra de navegación del cliente (CustomerNav)

El componente `app/components/CustomerNav.tsx` renderiza una **barra de navegación inferior** totalmente configurable por el restaurante. Es la manera en que el cliente se mueve entre las secciones (Menú, Tarjeta, Reseñas, etc.).

### Configuración vía JSON (`customer_nav` en la tabla `settings`)

```json
{
  "bg": "#0d0d0d",
  "border": "#1a1a1a",
  "accent": "#B90F45",
  "inactive": "#666",
  "radius": 9999,
  "showLogout": false,
  "tabs": [
    { "id": "menu",   "label": "Menú",     "href": "/menu",   "icon": "..." },
    { "id": "card",   "label": "Tarjeta",  "href": "/card",   "icon": "..." },
    { "id": "review", "label": "Reseñas",  "href": "/review", "icon": "..." }
  ]
}
```

### Significado de cada propiedad

| Propiedad | Función |
|-----------|---------|
| `bg` | Color de fondo de la barra. |
| `border` | Color del borde de la barra. |
| `accent` | Color de la pestaña activa / acento. |
| `inactive` | Color de las pestañas inactivas. |
| `radius` | Radio de las esquinas (`9999` = totalmente redondeado). |
| `showLogout` | Si se muestra o no un botón de cerrar sesión. |
| `tabs` | Arreglo de pestañas. Cada una con `id`, `label`, `href` e `icon`. |

### Interacción con los permisos

Las pestañas que se muestran realmente dependen también de los **permisos del cliente** (ver sección 17). Aunque una pestaña esté definida en `customer_nav`, si el permiso correspondiente está apagado, no se muestra.

---

## 17. Permisos del cliente

El **Superadmin** de la plataforma NICHO controla qué secciones puede ver el cliente mediante los **permisos de usuario** (`user_permissions`), almacenados en la tabla `settings`.

### Permisos disponibles

| Permiso | Efecto |
|---------|--------|
| `usr_menu` | Muestra u oculta la pestaña **Menú**. |
| `usr_resenas` | Muestra u oculta la pestaña **Reseñas**. |
| `usr_tarjeta` | Muestra u oculta la pestaña **Tarjeta**. |

### Cómo se consultan

El endpoint `GET /api/permissions` devuelve un objeto con dos secciones:

```json
{
  "employee": { "...": "permisos del empleado" },
  "user":     { "usr_menu": true, "usr_resenas": true, "usr_tarjeta": true }
}
```

El perfil Cliente usa la sección `user`. Con estos permisos, cada restaurante decide qué experiencia ofrece: por ejemplo, un restaurante que solo quiere programa de lealtad puede dejar visible únicamente la pestaña **Tarjeta**.

---

## 18. Personalización visual

Cada restaurante personaliza la apariencia del perfil Cliente desde la tabla `settings`. Esto asegura que el cliente vea la marca del restaurante, no una interfaz genérica.

### Ajustes del menú

| Clave | Función | Valor por defecto |
|-------|---------|-------------------|
| `menu_logo` | Logo mostrado en el menú | — |
| `menu_bg_color` | Color de fondo del menú | `#0d0d0d` |
| `menu_btn_color` | Color de los botones | `#B90F45` |
| `menu_hover_color` | Color al pasar/oprimir | `#DC5E86` |

### Ajustes del recetario

| Clave | Función |
|-------|---------|
| `recetario_logo` | Logo del recetario |
| `recetario_color` | Color principal del recetario |

### Ajustes del registro

| Clave | Función |
|-------|---------|
| `registro_titulo` | Título de la pantalla de registro |
| `registro_subtitulo` | Subtítulo de la pantalla de registro |

### Ajuste de la navegación

| Clave | Función |
|-------|---------|
| `customer_nav` | JSON con la configuración de la barra inferior (ver sección 16) |

### Nota sobre los colores de marca

- El color base de la plataforma NICHO es **`#B90F45`** (rosa/guinda).
- Cada restaurante puede sobrescribir estos colores con los suyos.

---

## 19. Seguridad y privacidad

### Qué es público y qué no

| Función | ¿Requiere sesión? |
|---------|-------------------|
| Menú (`/menu`) | No |
| Asistente IA (rol `customer`) | **No** (público por diseño) |
| Likes (`POST /api/menu/[id]/like`) | No |
| Reseñas (`POST /api/reviews`) | No |
| Recetario | No |
| Cumpleaños (`POST /api/cumpleanos`) | No |
| Registro de lealtad | No |
| Cuenta de cliente (`/card/usuario`) | Sí, usa contraseña (SHA-256) |

### Puntos clave de seguridad

- **Contraseñas cifradas:** la cuenta de cliente guarda la contraseña con **SHA-256** en la tabla `customers`. Nunca se almacena en texto plano.
- **Asistente IA público a propósito:** de acuerdo con la nota de seguridad del **2026-07-06**, el rol `customer` en `/api/ai/chat` es el **único** que no exige sesión. Esto es intencional para que cualquier comensal lo use. El resto de roles sí requieren autenticación.
- **Voz requiere HTTPS:** la entrada por voz del asistente (Web Speech API) solo funciona sobre conexiones seguras (HTTPS).
- **Datos mínimos:** el registro de lealtad pide solo nombre, WhatsApp y fecha de nacimiento — lo indispensable para el programa.
- **Estado local:** al depender del `localStorage`, la información del cliente en su dispositivo puede perderse si borra los datos del navegador. La Cuenta de cliente resuelve esto.

---

## 20. Preguntas frecuentes (FAQ)

**¿Necesito descargar una app?**
No. Todo funciona desde el navegador de tu teléfono mediante enlaces y códigos QR.

**¿Cómo me inscribo al programa de lealtad?**
Entra a `/registro` (o `/loyalty`), llena tu nombre, WhatsApp y fecha de nacimiento. Tu tarjeta quedará pendiente hasta que un empleado la active.

**¿Por qué mi tarjeta dice "pendiente de activación"?**
Porque un empleado del restaurante todavía no la ha activado. Es un paso para confirmar que eres un cliente real. Puedes activarla en el mostrador o mediante el enlace de WhatsApp.

**¿Cómo me sellan una visita?**
Abre tu tarjeta en `/card`, gírala para mostrar tu QR personal y pídele al empleado que lo escanee. Cada escaneo válido suma un sello.

**¿Qué pasa cuando lleno todos los sellos?**
Obtienes una recompensa. Al canjearla, tu contador vuelve a 0 y comienzas de nuevo.

**Cambié de teléfono y ya no veo mi tarjeta. ¿Qué hago?**
El estado se guarda en tu navegador. Para no perderlo, crea una **Cuenta de cliente** en `/card/usuario` con nombre y contraseña; así podrás iniciar sesión desde cualquier dispositivo.

**¿Puedo pedir a domicilio?**
Sí. En `/menu` elige el tipo "a domicilio" e ingresa tu nombre, dirección y forma de pago.

**¿Puedo agregar notas a un platillo?**
Sí, cada platillo permite notas (por ejemplo "sin cebolla").

**¿Cómo sé en qué va mi pedido?**
El estado se actualiza en tiempo real: `pending → preparing → ready → delivered`. Los pedidos entregados desaparecen de la vista 30 segundos después.

**¿El asistente de IA necesita que inicie sesión?**
No. Es público. Puedes pedirle recomendaciones y hasta agregar platillos al carrito con un toque. También puedes hablarle por voz (requiere conexión segura HTTPS).

**Dejé una reseña de 5 estrellas, ¿se publica?**
Sí. Las reseñas de 4 y 5 estrellas se publican automáticamente. Las de 1 a 3 estrellas no se publican y en su lugar alertan al restaurante para que atienda tu caso.

**¿Puedo registrar mi cumpleaños?**
Sí, en `/cumpleanos`. El restaurante podrá enviarte promociones especiales.

**¿Los likes cuentan si no tengo cuenta?**
Sí, el botón "me encanta" es público y funciona sin sesión.

---

## 21. Diagrama del flujo de registro

```
┌───────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE REGISTRO DEL CLIENTE                        │
│                       Programa de Lealtad NICHO                         │
└───────────────────────────────────────────────────────────────────────┘

     [ Cliente escanea QR del negocio ]   ó   [ abre enlace /registro ]
                          │
                          ▼
                 ┌─────────────────┐
                 │     loading      │   Revisa localStorage:
                 │  (carga inicial) │   loyalty_card_id / loyalty_pending_id
                 └────────┬─────────┘
                          │
          ¿hay tarjeta guardada?  ──── Sí ──► salta al estado correspondiente
                          │
                          No
                          ▼
                 ┌─────────────────┐
                 │      form        │   Ingresa:
                 │  (formulario)    │   • Nombre
                 │                  │   • WhatsApp
                 │                  │   • Fecha de nacimiento
                 └────────┬─────────┘
                          │  (enviar)
                          ▼
                 ┌─────────────────┐
                 │     confirm      │   Confirma los datos
                 │ (confirmación)   │
                 └────────┬─────────┘
                          │
                          ▼
                 ┌─────────────────┐      Guarda en localStorage:
                 │     waiting      │◄──── loyalty_pending_id
                 │  "Pendiente de   │
                 │   activación"    │
                 └────────┬─────────┘
                          │
                          │  El EMPLEADO activa la tarjeta desde
                          │  /employee/customers  ó  /admin/sellar
                          │  (o el cliente usa enlace WhatsApp /activate?id=UUID)
                          ▼
                 ┌─────────────────┐      Guarda en localStorage:
                 │      card        │◄──── loyalty_id + loyalty_card_id
                 │  (tarjeta lista) │
                 └────────┬─────────┘
                          │
          ┌───────────────┴────────────────┐
          ▼                                 ▼
   [ FRENTE de la tarjeta ]        [ REVERSO: QR personal (UUID) ]
     progreso de sellos                     │
                                            ▼
                              El EMPLEADO escanea el QR ► + 1 SELLO
                                            │
                                            ▼
                          ┌─────────────────────────────────┐
                          │   ¿Alcanzó el máximo de sellos?  │
                          └───────┬───────────────────┬──────┘
                                  │ No                 │ Sí
                                  ▼                    ▼
                         sigue acumulando       ┌──────────────┐
                                                │  RECOMPENSA  │
                                                │  contador→0  │
                                                └──────────────┘
                                                       │
                                                       ▼
                                             (el ciclo se reinicia)

  Opcional en cualquier momento:
  ┌──────────────────────────────────────────────────────────────┐
  │  /card/usuario → crear Cuenta de cliente (nombre + contraseña)│
  │  Permite recuperar la tarjeta desde cualquier dispositivo     │
  │  sin depender del localStorage.                               │
  └──────────────────────────────────────────────────────────────┘
```

---

*Documento generado el 2026-07-08 · Plataforma NICHO · Perfil: Usuario Cliente*
