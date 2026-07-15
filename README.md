# Aula Virtual Servienvia — Backend (API REST)

API de la plataforma Aula Virtual Servienvia: autenticación con credenciales, gestión de usuarios (CRUD exclusivo del administrador) y catálogo de cursos. Construida con **Node.js + Express + PostgreSQL**.

## Requisitos
- Node.js 18 o superior
- PostgreSQL 13 o superior

## Puesta en marcha

### Opción A — Modo demo (recomendado para probar, sin instalar PostgreSQL)

```bash
npm install
npm run demo
```

Abre `http://localhost:4000`. El servidor usa una base de datos PostgreSQL **en memoria** (pg-mem) precargada con `sql/schema.sql` y `sql/seed.sql`, y sirve el frontend completo (Home, login, dashboard, reproductor y panel admin). Los cambios se reinician al detener el servidor.

### Opción B — Con PostgreSQL real

1. Instala las dependencias:
   ```bash
   npm install
   ```

2. Crea la base de datos y carga el esquema y los datos de ejemplo:
   ```bash
   createdb aulaviva
   psql aulaviva -f sql/schema.sql
   psql aulaviva -f sql/seed.sql
   ```
   O bien, con el script incluido (sirve para local y para bases de datos en la nube como Neon):
   ```bash
   DATABASE_URL="postgresql://usuario:clave@localhost:5432/aulaviva" npm run db:init
   ```

3. Copia `.env.example` a `.env` y ajusta tus valores (sobre todo `DATABASE_URL` y `JWT_SECRET`):
   ```bash
   cp .env.example .env
   ```

4. Arranca el servidor:
   ```bash
   npm start        # producción
   npm run dev      # desarrollo (con recarga, requiere nodemon)
   ```

La aplicación quedará en `http://localhost:4000`.

### Desplegar en internet

Sigue la guía paso a paso en **`DESPLIEGUE.md`** (GitHub + Neon + Render, gratis y sin tarjeta).

## Usuarios de ejemplo
Todos con la contraseña `aulaviva2026`:
- `admin@servienvia.com` — administrador
- `maria@servienvia.com` — estudiante
- `carlos@servienvia.com` — instructor

## Endpoints

### Autenticación
| Método | Ruta | Descripción | Acceso |
|---|---|---|---|
| POST | `/api/auth/login` | Inicia sesión con `{ correo, contrasena }`. Devuelve un token. | Público |
| GET | `/api/auth/me` | Perfil del usuario autenticado. | Con token |

### Usuarios (solo administrador)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/usuarios` | Lista usuarios. Filtros: `?rol=`, `?activo=`, `?q=`. |
| GET | `/api/usuarios/:id` | Obtiene un usuario. |
| POST | `/api/usuarios` | Crea un usuario `{ nombre, correo, contrasena, rol, profesion, intereses }`. |
| PUT | `/api/usuarios/:id` | Edita un usuario (campos opcionales; `contrasena` se re-cifra). |
| DELETE | `/api/usuarios/:id` | Baja lógica (`activo=false`). `?hard=true` para borrado real. |

### Cursos (lectura pública)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/cursos` | Cursos publicados. Filtros: `?categoria=`, `?q=`. |
| GET | `/api/cursos/:id` | Detalle del curso con secciones y lecciones. |

### Inscripciones y progreso (requieren sesión)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/inscripciones` | Cursos del usuario. Filtros: `?categoria=`, `?q=`, `?estado=(new\|progress\|done)`, `?archivado=`, `?favorito=`. |
| POST | `/api/inscripciones` | Inscribirse en un curso `{ curso_id }`. |
| PUT | `/api/inscripciones/:id` | Marcar `{ favorito }` o `{ archivado }`. |
| GET | `/api/inscripciones/:id/progreso` | Progreso por lección de esa inscripción. |
| PUT | `/api/inscripciones/:id/progreso` | Marcar lección `{ leccion_id, completada }`; recalcula el % del curso. |

### Actividad / rachas (requieren sesión)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/actividad` | Días recientes, racha consecutiva y minutos de la semana. |
| POST | `/api/actividad` | Suma minutos de estudio al día de hoy `{ minutos }`. |

## Seguridad
- Contraseñas cifradas con **bcrypt** (hash + sal); nunca se devuelven en las respuestas.
- Sesiones mediante **JWT** (`Authorization: Bearer <token>`).
- Autorización por roles (**RBAC**): el CRUD de usuarios está restringido al rol `administrador`.
- Sin registro público: las cuentas solo las crea un administrador.

## Pruebas
La suite de integración levanta la API contra una base de datos PostgreSQL **en memoria** (pg-mem) cargando el `schema.sql` y `seed.sql` reales:
```bash
npm test
```

## Estructura
```
src/
  app.js                 configuración de Express (API + frontend estático)
  server.js              arranque con PostgreSQL real (verifica BD y JWT al iniciar)
  demoServer.js          arranque con BD en memoria (npm run demo)
  config.js              variables de entorno
  db.js                  pool de PostgreSQL (SSL automático para Neon)
  middleware/
    auth.js              verificación de JWT
    roles.js             control de acceso por rol
  controllers/           lógica de cada recurso
  routes/                definición de rutas
public/
  index.html             Home (catálogo en vivo)
  login.html             inicio de sesión
  dashboard.html         panel "Mi aprendizaje"
  reproductor.html       reproductor del curso con progreso
  admin.html             panel del administrador (CRUD de usuarios)
sql/
  schema.sql             esquema (22 tablas, idempotente)
  seed.sql               datos de ejemplo
scripts/
  initDb.js              inicializa la BD de producción (npm run db:init)
test/
  run.js                 41 pruebas de integración
```
