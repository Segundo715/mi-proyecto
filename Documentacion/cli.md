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
| `npm run seed` | Seed completo (todos los datos) |
| `npm run seed:1` | Preset 1 |
| `npm run seed:2` | Preset 2 |
| `npm run seed:3` | Preset 3 |
| `npm run seed:menu` | Ítems del menú |
| `npm run seed:rec` | Recetas |
| `npm run seed:ped` | Pedidos de ejemplo |
| `npm run seed:res` | Reseñas |
| `npm run seed:inv` | Inventario |
| `npm run seed:tv` | Slides de pantalla TV |
| `npm run seed:leal` | Tarjetas de lealtad |
| `npm run seed:emp` | Empleados |
| `npm run seed:adm` | Administradores |
| `npm run seed:todo` | Todo (equivalente a `seed` completo) |

---

## Comandos de demo — mi-pruebas

> Todos estos comandos se ejecutan desde la raíz de **`mi-pruebas`**.
> Para hacer una copia del proyecto configurada para un módulo: `npm run copia <modulo> <nombre-carpeta>`

### Sin combo — por módulo y rol

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
| Resta3 | `npm run resta3:tpv` | `npm run copia resta3_tpv mi-cliente-resta3-tpv` |
| Usuario | — no aplica — | — |

#### Fidelización

| Rol | Comando dev | Copia |
|-----|-------------|-------|
| Admin | `npm run fidelizacion` | `npm run copia fidelizacion mi-cliente-fidelizacion` |
| Empleado | `npm run empleado:fidelizacion` | `npm run copia empleado_fidelizacion mi-cliente-empleado-fidelizacion` |
| Usuario | `npm run usuarios` | `npm run copia usuarios mi-cliente-usuarios` |
| Resta3 | — no aplica — | — |

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
GROQ_API_KEY=
```

> `GROQ_API_KEY` es la clave de la IA (Llama vía Groq). Se obtiene en https://console.groq.com/keys
