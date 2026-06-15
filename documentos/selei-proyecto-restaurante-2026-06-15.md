# SELEI — Sistema Estratégico para la Elaboración e Implantación de Sistemas de Información

## Proyecto: Plataforma Digital para Restaurantes "Chubis"

**Alumno:** Jesús Segundo  
**Fecha:** 15 de junio de 2026  
**URL de producción:** https://mi-proyecto-phi-ecru.vercel.app

---

## 1. DIAGNÓSTICO — Situación Actual del Restaurante

### 1.1 Problemática Identificada

Los restaurantes pequeños y medianos en México enfrentan los siguientes problemas operativos:

| Problema | Impacto |
|---|---|
| Menú solo en papel o pizarrón | Clientes no pueden ver el menú desde su teléfono |
| Sin sistema de lealtad digital | Se pierden clientes frecuentes, no hay registro |
| Pedidos por voz o libreta | Errores, pedidos perdidos, sin trazabilidad |
| Recetas solo en la cabeza del chef | Si el cocinero falta, la producción se para |
| Sin analíticas de ventas | El dueño no sabe qué platillos venden más |
| Reseñas negativas ignoradas | La reputación cae sin que el dueño se entere |

### 1.2 Justificación del Sistema

Se requiere un sistema de información que:
- Digitalice el menú y lo haga accesible desde cualquier teléfono sin instalar apps
- Registre y fidelice a los clientes con tarjetas de lealtad digitales
- Gestione pedidos en tiempo real desde la toma hasta la entrega
- Centralice recetas para que cualquier empleado pueda producir con calidad
- Proporcione datos al dueño para tomar mejores decisiones

---

## 2. ANÁLISIS DE REQUERIMIENTOS

### 2.1 Requerimientos Funcionales

#### Para Clientes (público general)
- RF01 — Ver el menú digital desde el teléfono escaneando un QR
- RF02 — Registrarse en el programa de lealtad con nombre y teléfono
- RF03 — Ver sus sellos acumulados y cuándo ganan su recompensa
- RF04 — Consultar el recetario del restaurante
- RF05 — Dejar una reseña del servicio

#### Para Empleados
- RF06 — Iniciar sesión con usuario y contraseña
- RF07 — Sellar tarjetas de lealtad escaneando el QR del cliente
- RF08 — Consultar recetas paso a paso con asistente de IA
- RF09 — Ver y actualizar el estado de los pedidos
- RF10 — Registrar nuevos clientes en el sistema

#### Para Administradores
- RF11 — Ver analíticas de ventas del día, semana y mes
- RF12 — Gestionar el menú (agregar, editar, desactivar platillos)
- RF13 — Ver todas las reseñas y recibir alerta de reseñas negativas
- RF14 — Gestionar tarjetas de lealtad y niveles de recompensa
- RF15 — Configurar la marca del restaurante (logo, colores, nombre)
- RF16 — Ver el plan de mesas y reservaciones
- RF17 — Gestionar inventario y recibir alertas de stock bajo

### 2.2 Requerimientos No Funcionales

| Código | Requerimiento | Valor |
|---|---|---|
| RNF01 | Disponibilidad | 99.9% — alojado en la nube (Vercel) |
| RNF02 | Rendimiento | Carga en menos de 2 segundos |
| RNF03 | Seguridad | HTTPS, cabeceras de seguridad, sesiones HMAC |
| RNF04 | Usabilidad | Funciona en cualquier teléfono sin instalar apps |
| RNF05 | Escalabilidad | Multi-tenant: un sistema para varios restaurantes |
| RNF06 | Accesibilidad | Diseño responsivo para móvil, tablet y escritorio |

---

## 3. DISEÑO DEL SISTEMA

### 3.1 Arquitectura General

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTES (Público)                    │
│         /menu  /card  /recetas  /review  /registro      │
└──────────────────────┬──────────────────────────────────┘
                       │  Teléfono / navegador
┌──────────────────────▼──────────────────────────────────┐
│              EMPLEADOS  /employee/*                      │
│     Sellado · Pedidos · Recetario IA · Clientes         │
├─────────────────────────────────────────────────────────┤
│            PANEL RESTA3  /resta3/*                       │
│     Mesas · Cocina · Inventario · Operaciones           │
├─────────────────────────────────────────────────────────┤
│           ADMINISTRADOR  /admin/*                        │
│  Analíticas · Ventas · CRM · Menú · Configuración       │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  API PROPIA  /api/*                      │
│        Autenticación · Datos · IA · Uploads             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                  SUPABASE (Base de datos)                │
│   customers · menu_items · orders · recipes · reviews   │
│   loyalty_cards · tv_slides · settings · inventory      │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Módulos del Sistema

| # | Módulo | Audiencia | Descripción |
|---|---|---|---|
| 1 | Menú Digital | Clientes | Menú en QR, sin app, con fotos y precios |
| 2 | Tarjetas de Lealtad | Clientes | 5 sellos = recompensa, QR por cliente |
| 3 | Pedidos | Empleados/Admin | Estado en tiempo real: pendiente → entregado |
| 4 | Recetario IA | Empleados | Paso a paso con asistente inteligente |
| 5 | Reseñas | Clientes/Admin | Alerta automática por email en reseñas negativas |
| 6 | Inventario | Admin/RESTA3 | Stock con alertas de mínimo |
| 7 | Analíticas | Admin | Ventas por día/semana, platillos más populares |
| 8 | Señalización TV | Admin | Pantallas digitales en el negocio |
| 9 | Reservaciones | Admin | Plano de mesas interactivo |
| 10 | Configuración | Admin | Logo, colores y nombre por restaurante |

### 3.3 Modelo de Base de Datos (tablas principales)

```
customers         → id, name, phone, stamps, confirmed, created_at
loyalty_cards     → id, name, phone, stamps, active, expires_at
menu_items        → id, name, description, price, category, image_url, available, likes
orders            → id, customer_name, items(JSON), status, table_number, total
recipes           → id, name, ingredients(JSON), steps(JSON), image_url
reviews           → id, customer_name, rating, comment, bad, published
inventory         → id, name, category, stock, min_stock, unit, cost
settings          → key, value  (configuración libre por clave)
admins            → id, name, password_hash
employees         → id, name, password_hash
```

---

## 4. ELABORACIÓN — Desarrollo del Sistema

### 4.1 Tecnologías Utilizadas

| Capa | Tecnología | Razón de elección |
|---|---|---|
| **Frontend** | Next.js 16 + React 19 | Renderizado en servidor, velocidad, SEO |
| **Estilos** | Tailwind CSS 4 | Diseño rápido, responsivo, sin archivos CSS separados |
| **Lenguaje** | TypeScript | Tipos estáticos, menos errores en producción |
| **Base de datos** | Supabase (PostgreSQL) | Tiempo real, sin servidor propio, gratis en inicio |
| **Almacenamiento** | Supabase Storage | Imágenes del menú y recetario en la nube |
| **Autenticación** | HMAC propio | Token seguro sin dependencias externas |
| **IA** | Groq API (Llama 3) | Respuestas rápidas para el asistente de empleados |
| **Deploy** | Vercel | Deploy automático, HTTPS gratis, CDN global |

### 4.2 Método de Inserción por Fases

El sistema fue elaborado y puede demostrarse en tres fases progresivas:

#### ⚡ Fase 1 — Menú Digital
**Qué se activa:** 8 platillos de demostración en 5 categorías  
**Qué ve el público:** El menú desde su teléfono escaneando un QR  
**Módulos activos:** `/menu`, tarjetas de lealtad, reseñas  
**Comando:** `POST /api/menu/seed` (inserta los platillos automáticamente)

```
Hamburguesas → Hamburguesa Clásica $120, Hamburguesa BBQ $145
Pizzas       → Pizza Margherita $155, Pizza Pepperoni $170
Ensaladas    → Ensalada César $95
Pastas       → Pasta Alfredo $130
Bebidas      → Café Americano $45
Postres      → Cheesecake de Fresa $80
```

#### 👨‍🍳 Fase 2 — Recetario y Empleados
**Qué se activa:** Acceso al recetario con asistente de IA  
**Qué ve el público:** Empleados consultan recetas paso a paso  
**Módulos activos:** `/resetas`, `/employee`, `/resta3`  
**Demostración:** El empleado pregunta "¿cómo preparo la Pasta Alfredo?" → IA responde paso a paso

#### 📊 Fase 3 — Sistema Completo
**Qué se activa:** Panel de administración completo  
**Qué ve el público:** El dueño ve ventas, pedidos, clientes y configuración  
**Módulos activos:** `/admin` — analíticas, CRM, inventario, reservaciones, TV

### 4.3 Seguridad Implementada

- **Sesiones HMAC:** tokens firmados con clave secreta, sin base de datos de sesiones
- **Contraseñas:** hash SHA-256 con sal (ADMIN_SECRET), nunca texto plano
- **Cabeceras HTTP:** `X-Content-Type-Options`, `Content-Security-Policy`, `Referrer-Policy`
- **HTTPS:** obligatorio en producción (Vercel lo gestiona automáticamente)
- **Variables de entorno:** claves de API fuera del código fuente

### 4.4 Funcionalidad de Inteligencia Artificial

El sistema integra un asistente de IA con contexto en tiempo real:

| Rol | Modelo | Datos que conoce |
|---|---|---|
| Clientes | Llama 3.1 8B (rápido) | Menú disponible, precios, descripción |
| Empleados | Llama 3.3 70B (potente) | Recetario completo, pedidos activos, tarjetas |
| RESTA3 | Llama 3.3 70B | Mesas, inventario, pedidos, ventas del día |
| Admin | Llama 3.3 70B | Todo lo anterior + reseñas, analíticas, lealtad |

---

## 5. IMPLANTACIÓN — Despliegue en Producción

### 5.1 Infraestructura en la Nube

```
Desarrollador → GitHub (código) → Vercel (build automático) → Producción
                                        ↕
                               Supabase (base de datos)
                               Groq API (inteligencia artificial)
```

### 5.2 Proceso de Despliegue

1. El código se sube a GitHub (control de versiones)
2. Vercel detecta el cambio y construye automáticamente
3. En menos de 2 minutos el sistema está actualizado en producción
4. Sin tiempo de inactividad — el cambio es instantáneo para los usuarios

### 5.3 Ambientes

| Ambiente | URL | Uso |
|---|---|---|
| Producción | https://mi-proyecto-phi-ecru.vercel.app | Usuarios reales |
| Desarrollo | http://localhost:3000 | Pruebas del desarrollador |

### 5.4 Configuración por Restaurante (Multi-tenant)

El sistema está diseñado para usarse por múltiples restaurantes. Cada uno puede configurar:
- Nombre del negocio
- Logo propio
- Color de acento (marca)
- Número de WhatsApp para contacto
- Niveles de recompensa de lealtad

---

## 6. RESULTADOS

### 6.1 Sistema Entregado

El sistema quedó completamente funcional y desplegado en producción con:

✅ **10 módulos operativos** (menú, lealtad, pedidos, recetario, reseñas, TV, reservaciones, inventario, analíticas, configuración)  
✅ **3 roles de acceso** diferenciados (cliente, empleado/RESTA3, administrador)  
✅ **Asistente de IA** integrado con datos en tiempo real por rol  
✅ **Aplicación web progresiva** — funciona en cualquier teléfono sin instalar  
✅ **Sistema en la nube** — disponible 24/7 desde cualquier lugar  
✅ **Imágenes optimizadas** — conversión automática a WebP en el navegador  
✅ **Señalización digital** — pantallas TV controladas desde el panel  

### 6.2 Beneficios para el Restaurante

| Antes | Después |
|---|---|
| Menú en papel, se mancha y pierde | Menú digital actualizable en segundos |
| Sellos en tarjeta física que se olvidan | Tarjeta digital con QR, nunca se pierde |
| Pedidos por voz o libreta | Sistema digital con estado en tiempo real |
| Recetas solo en la memoria del chef | Recetario digital con IA de apoyo |
| Sin saber qué vende más | Analíticas por día, semana y platillo |
| Reseñas negativas ignoradas | Alerta por correo al instante |

---

## 7. CONCLUSIONES

La aplicación de la metodología SELEI al proyecto de plataforma digital para restaurantes demostró que es posible elaborar e implantar un sistema de información completo y funcional que resuelve problemas reales del negocio.

El sistema fue construido de forma estratégica: comenzando con los módulos de mayor impacto para el cliente (menú y lealtad), avanzando hacia las herramientas operativas para el personal (pedidos y recetario), hasta llegar a las analíticas para la toma de decisiones del administrador.

La metodología de inserción por fases permite que el sistema pueda ser presentado y adoptado progresivamente, sin abrumar a los usuarios con funcionalidades que aún no conocen, facilitando la capacitación y la transición desde los métodos tradicionales.

**El proyecto está disponible en producción en:** https://mi-proyecto-phi-ecru.vercel.app

---

*Documento generado para la presentación SELEI — Junio 2026*
