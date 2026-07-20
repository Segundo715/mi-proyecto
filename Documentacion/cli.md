# CLI — Comandos de mi-proyecto

> Todos los comandos se ejecutan desde la raíz de `mi-proyecto` con `npm run <comando>`.

---

## Desarrollo

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:3000` |
| `npm run build` | Compila el proyecto para producción |
| `npm run start` | Inicia el servidor de producción (requiere `build` previo) |
| `npm run lint` | Revisa el código con ESLint |

---

## Seeds — Poblar la base de datos

Insertan datos de prueba en Supabase. Requieren `.env.local` con las variables de entorno.

| Comando | Qué inserta |
|---------|-------------|
| `npm run seed` (sin args) | Muestra la ayuda con este mismo resumen |
| `npm run seed:1` | Fase cliente 1 — el teléfono del cliente solo ve tab Menú |
| `npm run seed:2` | Fase cliente 2 — Menú + Tarjeta de lealtad |
| `npm run seed:3` | Fase cliente 3 — Menú + Tarjeta + Reseñas (todo) |
| `npm run seed:menu` | 4 platillos en el menú digital |
| `npm run seed:rec` | 2 recetas con pasos, para el panel de empleado |
| `npm run seed:ped` | 1 pedido activo en el panel de empleado |
| `npm run seed:res` | 1 reseña buena + 1 mala (la mala dispara alerta al admin) |
| `npm run seed:inv` | Inventario con 2 alertas de stock bajo |
| `npm run seed:tv` | 3 slides para la pantalla de TV del negocio |
| `npm run seed:leal` | Cliente demo con 4 sellos de lealtad |
| `npm run seed:emp` | Atajo: `rec` + `ped` + `leal` (todo lo del rol empleado) |
| `npm run seed:adm` | Atajo: `res` + `inv` + `tv` (todo lo del rol admin) |
| `npm run seed:todo` | Todos los módulos + arranca en fase 1 |

Las fases (1/2/3) controlan qué tabs ve el cliente en `CustomerNav`, pensadas
para ir avanzando durante una demo en vivo: `seed:1 → seed:2 → seed:3`.
Todos los comandos son idempotentes — no duplican datos existentes.

---

## Comandos de demo — mi-pruebas

> Todos estos comandos se ejecutan desde la raíz de **`mi-pruebas`**.
> Para hacer una copia del proyecto configurada para un módulo: `npm run copia <modulo> <nombre-carpeta>`

### Sin combo — por módulo y rol

Cada comando activa un set de feature flags en `features.config.json` y
levanta `next dev --webpack` aterrizando directo en la ruta del módulo. La
columna "Copia" usa la misma clave de módulo con `npm run copia <modulo> <carpeta>`.

#### Menú

| Rol | Comando dev | Copia |
|-----|-------------|-------|
| Admin | `npm run admin:menu` | `npm run copia admin_menu mi-cliente-admin-menu` |
| Empleado | `npm run empleado:menu` | `npm run copia empleado_menu mi-cliente-empleado-menu` |
| Usuario | `npm run menu` | `npm run copia menu mi-cliente-menu` |
| Resta3 | `npm run resta3:menu` | `npm run copia resta3_menu mi-cliente-resta3-menu` |

#### Pantallas (TV)

| Rol | Comando dev | Copia |
|-----|-------------|-------|
| Admin | `npm run admin:pantallas` | `npm run copia admin_pantallas mi-cliente-admin-pantallas` |
| Empleado | `npm run empleado:pantallas` | `npm run copia empleado_pantallas mi-cliente-empleado-pantallas` |
| Usuario | `npm run tv` | `npm run copia tv mi-cliente-tv` |
| Resta3 | `npm run resta3:tv` | `npm run copia resta3_tv mi-cliente-resta3-tv` |

#### Pedidos

| Rol | Comando dev | Copia |
|-----|-------------|-------|
| Admin | `npm run pedidos` | `npm run copia pedidos mi-cliente-pedidos` |
| Empleado | `npm run empleado:pedidos` | `npm run copia empleado_pedidos mi-cliente-empleado-pedidos` |
| Resta3 | `npm run resta3:tpv` (o `resta3:cocina`) | `npm run copia resta3_tpv mi-cliente-resta3-tpv` |
| Usuario | — no aplica — | — |

#### Fidelización

| Rol | Comando dev | Copia |
|-----|-------------|-------|
| Admin | `npm run fidelizacion` | `npm run copia fidelizacion mi-cliente-fidelizacion` |
| Empleado | `npm run empleado:fidelizacion` | `npm run copia empleado_fidelizacion mi-cliente-empleado-fidelizacion` |
| Usuario | `npm run usuarios` | `npm run copia usuarios mi-cliente-usuarios` |
| Resta3 | — no aplica — | — |

#### Módulos solo-admin

| Módulo | Comando dev | Copia |
|-----|-------------|-------|
| Reseñas | `npm run resenas` | `npm run copia resenas mi-cliente-resenas` |
| Cumpleaños | `npm run cumpleanos` | `npm run copia cumpleanos mi-cliente-cumpleanos` |
| Clientes | `npm run clientes` | `npm run copia clientes mi-cliente-clientes` |
| Tarjetas | `npm run tarjetas` | `npm run copia tarjetas mi-cliente-tarjetas` |
| Ventas | `npm run ventas` | `npm run copia ventas mi-cliente-ventas` |
| Dashboard | `npm run dashboard` | `npm run copia dashboard mi-cliente-dashboard` |
| Estadísticas | `npm run estadisticas` | `npm run copia estadisticas mi-cliente-estadisticas` |
| Reportes | `npm run reportes` | `npm run copia reportes mi-cliente-reportes` |
| Marketing | `npm run marketing` | `npm run copia marketing mi-cliente-marketing` |
| CRM | `npm run crm` | `npm run copia crm mi-cliente-crm` |
| Automatizaciones | `npm run automatizaciones` | `npm run copia automatizaciones mi-cliente-automatizaciones` |
| Contenido | `npm run contenido` | `npm run copia contenido mi-cliente-contenido` |
| Reservaciones | `npm run reservaciones` | `npm run copia reservaciones mi-cliente-reservaciones` |
| Operaciones | `npm run operaciones` | `npm run copia operaciones mi-cliente-operaciones` |
| Producción | `npm run produccion` | `npm run copia produccion mi-cliente-produccion` |
| Inventario | `npm run inventario` | `npm run copia inventario mi-cliente-inventario` |
| Recetas | `npm run recetas` | `npm run copia recetas mi-cliente-recetas` |

#### Empleados (gestión de personal)

| Rol | Comando dev | Copia |
|-----|-------------|-------|
| Empleado | `npm run empleados` | `npm run copia empleados mi-cliente-empleados` |
| Resta3 | `npm run resta3:empleados` | `npm run copia resta3_empleados mi-cliente-resta3-empleados` |

#### Módulos exclusivos de Resta3

| Módulo | Comando dev | Copia |
|-----|-------------|-------|
| Resta3 completo | `npm run resta3` | `npm run copia resta3 mi-cliente-resta3` |
| Dashboard | `npm run resta3:dashboard` | `npm run copia resta3_dashboard mi-cliente-resta3-dashboard` |
| Cocina | `npm run resta3:cocina` | `npm run copia resta3_cocina mi-cliente-resta3-cocina` |
| Domicilios | `npm run resta3:domicilios` | `npm run copia resta3_domicilios mi-cliente-resta3-domicilios` |
| Mesas | `npm run resta3:mesas` | `npm run copia resta3_mesas mi-cliente-resta3-mesas` |
| Compras | `npm run resta3:compras` | `npm run copia resta3_compras mi-cliente-resta3-compras` |
| Corte de caja | `npm run resta3:corte` | `npm run copia resta3_corte mi-cliente-resta3-corte` |
| Inventario | `npm run resta3:inventario` | `npm run copia resta3_inventario mi-cliente-resta3-inventario` |
| Reportes | `npm run resta3:reportes` | `npm run copia resta3_reportes mi-cliente-resta3-reportes` |

> La lista de claves válidas vive en `mi-pruebas/scripts/module.js` (objeto
> `MODULES`). Antes de usar una clave que no esté en esta tabla, corre
> `node scripts/module.js` sin argumentos desde `mi-pruebas` para ver la
> lista completa vigente.

### Todo activado

`npm run todo` — activa todos los feature flags a la vez, aterriza en `/admin`.
Copia: `npm run copia todo mi-cliente-todo`.

### Con combo (Menú + Pantallas + Pedidos + Fidelización)

| Rol | Comando dev | Copia |
|-----|-------------|-------|
| Admin | `npm run combo:admin` | `npm run copia combo_admin mi-cliente-combo-admin` |
| Empleado | `npm run combo:empleado` | `npm run copia combo_empleado mi-cliente-combo-empleado` |
| Resta3 | `npm run combo:resta3` | `npm run copia combo_resta3 mi-cliente-combo-resta3` |
| Usuario | `npm run combo:usuario` | `npm run copia combo_usuario mi-cliente-combo-usuario` |

---

## Variables de entorno requeridas

Archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
NEXT_PUBLIC_RESTAURANT_ID=
ADMIN_SECRET=
GROQ_API_KEY=
```

> `GROQ_API_KEY` es la clave de la IA (Llama vía Groq). Se obtiene en https://console.groq.com/keys
>
> `ADMIN_SECRET` firma las cookies de sesión (`admin_session`, `employee_session`,
> `resta3_session`) y los hashes de contraseña. Si no está definida, cae al
> valor inseguro `'dev-secret'` — solo aceptable en desarrollo local.
