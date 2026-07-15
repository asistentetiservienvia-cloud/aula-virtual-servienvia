# Desplegar Aula Virtual Servienvia en internet (gratis, sin tarjeta)

Guía paso a paso desde tu computadora hasta una **URL pública** que cualquiera puede abrir. Usaremos tres herramientas gratuitas:

- **GitHub** — guarda tu código en la nube.
- **Neon** — base de datos PostgreSQL (gratis, sin tarjeta, sin caducidad).
- **Vercel** — ejecuta la aplicación (backend + frontend en el mismo servicio; gratis, sin tarjeta, **sin dormirse** entre peticiones).

> **Por qué Vercel:** a diferencia de otros hostings gratuitos que "duermen" la app tras 15 minutos de inactividad (haciendo esperar 30-60 s a tu primer usuario), Vercel ejecuta la app como **funciones serverless** que arrancan casi instantáneamente. El resultado es una app que se siente rápida siempre.

```
   Tu navegador
        │
        ▼
    Vercel  ── frontend (CDN) + backend Node (funciones)
        │
        ▼
    Neon    ── base de datos PostgreSQL
```

---

## Antes de empezar

Necesitas:
- Una cuenta de **GitHub**: https://github.com
- **Git** instalado: https://git-scm.com/downloads
- **Node.js 18+** (ya lo tienes, lo usaste para probar localmente).
- El proyecto en tu computadora (carpeta `backend/`).

Verifica que Git funciona:
```bash
git --version
```

---

## Paso 1 — Subir el código a GitHub

1. En https://github.com/new crea un repositorio nuevo (por ejemplo `aula-virtual-servienvia`). Puedes marcarlo **público o privado**. **No** marques añadir README (ya tienes uno).

2. En tu terminal, entra a la carpeta `backend/` y sube el código (cambia `TU-USUARIO`):

```bash
cd backend
git init
git add .
git commit -m "Aula Virtual Servienvia: primera versión"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/aula-virtual-servienvia.git
git push -u origin main
```

> Si Git pide autenticarse, en GitHub necesitas un **token personal** en vez de contraseña: Settings → Developer settings → Personal access tokens → Generate new token (classic) → marca la casilla `repo`.

Recarga tu repositorio en GitHub: verás `src/`, `public/`, `api/`, `sql/`, `vercel.json`, etc. `node_modules/` y `.env` no se suben (los protege `.gitignore`).

---

## Paso 2 — Crear la base de datos en Neon

1. Entra a https://neon.tech y regístrate con tu cuenta de GitHub. **No pide tarjeta.**

2. Crea un proyecto (**Create project**). Nombre: `aula-virtual-servienvia`. Región: la más cercana. Deja la versión de PostgreSQL por defecto.

3. Neon te muestra una **cadena de conexión** (Connection string) parecida a:

```
postgresql://usuario:clave@ep-algo-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

4. **Cópiala completa y guárdala**. Si la pierdes, la recuperas en Dashboard → Connection Details.

---

## Paso 3 — Cargar el esquema y los datos demo en Neon

Desde la carpeta `backend/`, ejecuta (**reemplaza la cadena por la tuya**):

**Mac/Linux:**
```bash
DATABASE_URL="postgresql://usuario:clave@...neon.tech/neondb?sslmode=require" npm run db:init
```

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://usuario:clave@...neon.tech/neondb?sslmode=require"; npm run db:init
```

Deberías ver:
```
→ Aplicando schema.sql (creando tipos y tablas)...
  ✓ Esquema creado.
→ Aplicando seed.sql (datos de ejemplo)...
  ✓ Datos de ejemplo cargados.
¡Base de datos inicializada con éxito!
```

Se crearon 22 tablas y se cargaron los usuarios demo. El script es **idempotente**: puedes correrlo dos veces sin que rompa nada.

---

## Paso 4 — Desplegar en Vercel

1. Entra a https://vercel.com y regístrate con tu cuenta de GitHub. **El plan Hobby es gratis y no pide tarjeta.**

2. En el panel, pulsa **Add New → Project**.

3. Vercel te muestra tus repositorios de GitHub. Busca `aula-virtual-servienvia` y pulsa **Import**.

4. En la pantalla de configuración:
   - **Project Name:** `aula-virtual-servienvia` (aparece en tu URL pública).
   - **Framework Preset:** *Other* (Vercel debería detectarlo así solo; si te propone Next.js u otro, cámbialo a Other).
   - **Root Directory:** déjalo como está (raíz del repo).
   - **Build & Development Settings:** déjalo por defecto. El `vercel.json` del proyecto ya configura todo.

5. **Muy importante:** abre **Environment Variables** y añade estas tres antes de desplegar:

   | Nombre | Valor |
   |---|---|
   | `DATABASE_URL` | *tu cadena de conexión de Neon (Paso 2)* |
   | `JWT_SECRET` | *una frase larga y aleatoria, por ejemplo 40 caracteres al azar* |
   | `NODE_ENV` | `production` |

   > **Consejo para el JWT_SECRET:** en Mac/Linux, `openssl rand -base64 40` te genera uno bueno. O escribe caracteres al azar en el teclado durante unos segundos.

6. Pulsa **Deploy**. Vercel descargará tu código, ejecutará `npm install` y desplegará todo. Tarda 1-2 minutos.

7. Cuando termine verás **Congratulations!** y tu URL pública, tipo:
   ```
   https://aula-virtual-servienvia.vercel.app
   ```

---

## Paso 5 — Probar que funciona

Abre tu URL pública. Deberías ver la Home con el catálogo de cursos.

**Recorrido de verificación** (haz cada paso en orden):

1. **Home**: cursos cargando, buscador y filtros de categoría funcionan.
2. **Login** con `maria@servienvia.com` / `servienvia2026` → te lleva al Dashboard.
3. **Dashboard**: tus 6 cursos, racha de 5 días, botón "Registrar tiempo" funciona.
4. **Reproductor**: pulsa "Continuar" en Python → deberías ver el **video de YouTube embebido** de la primera lección. Marca lecciones como completadas y ve subir el progreso.
5. **Panel admin**: cierra sesión, entra como `admin@servienvia.com` / `servienvia2026` → deberías ver los 6 usuarios en el panel de administración.
6. **Crea un usuario** desde el panel, cierra sesión, **entra con él** para confirmar que se creó correctamente.

Si todo funciona: **¡felicidades, tu Aula Virtual está en línea!** 🎉

---

## Cosas importantes que debes saber

- **Actualizar es automático.** Cada `git push` a la rama `main` dispara un deploy nuevo en Vercel. Tu ciclo será:
  ```bash
  git add .
  git commit -m "describe tu cambio"
  git push
  ```
  Vercel te enseña el progreso en tiempo real en su panel.

- **Cambia las contraseñas demo.** Los usuarios de ejemplo tienen la contraseña pública `servienvia2026`. Cuando el sitio ya vaya en serio, entra como admin y cámbialas o crea tu propio administrador y borra los demo.

- **Los videos vienen de YouTube.** Cada lección tipo *video* referencia una URL de YouTube. Para poner tus **propios videos**:
  1. Súbelos a YouTube como **"No listados"** (no aparecen en búsqueda, pero cualquiera con el link los ve — perfecto para un aula virtual).
  2. En Neon, abre la tabla `lecciones` (desde el SQL Editor de Neon) y actualiza la columna `url_contenido` con la URL de tu video, por ejemplo:
     ```sql
     UPDATE lecciones SET url_contenido = 'https://www.youtube.com/watch?v=TU_ID' WHERE id = 1;
     ```
  El reproductor detecta y embebe cualquier link de YouTube o Vimeo automáticamente.

- **Los datos viven en Neon**, no en Vercel. Redespliegar Vercel no borra usuarios, cursos ni progreso.

---

## Solución de problemas

**"Function invocation failed" o error 500 al cargar la Home**
Suele ser la base de datos. Comprueba en Vercel → Deployments → tu último deploy → Functions → Logs. Ahí ves el error exacto. Casi siempre es que `DATABASE_URL` no está bien copiada o que olvidaste correr el Paso 3 (`db:init`).

**Error de conexión SSL**
Asegúrate de que `DATABASE_URL` termina en `?sslmode=require`. Si aun así falla, en Vercel añade la variable `DATABASE_SSL` con valor `true`.

**El video de YouTube no se carga en el reproductor**
Confirma que la URL en `lecciones.url_contenido` sea del tipo `https://www.youtube.com/watch?v=ID` o `https://youtu.be/ID`. Si sigue sin cargar, en YouTube ese video probablemente tiene la incrustación desactivada por el creador.

**Hice `git push` y Vercel no actualiza**
En Vercel → Deployments verifica que el último commit se recibió. Si tarda, revisa la pestaña "Building" — a veces `npm install` demora un poco más de lo normal.

**Vercel me da un error al desplegar (Build Failed)**
Abre el log del deploy. Los errores comunes son: falta alguna dependencia en `package.json` (usa `npm install --save NOMBRE` para añadirla) o el `vercel.json` está mal (compáralo con el del repo).
