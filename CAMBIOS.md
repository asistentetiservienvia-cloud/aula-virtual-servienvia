# CAMBIOS — Aula Virtual Servienvia

> Este archivo es la **fuente única de verdad** sobre el estado del proyecto: qué está hecho, qué está pendiente y las decisiones importantes. Actualízalo cada vez que hagas cambios significativos.

**Última actualización:** iteración 6 (branding + Vercel + YouTube)
**Stack:** Node.js + Express + PostgreSQL (Neon en producción; pg-mem para tests y modo demo)
**Frontend:** HTML + CSS + JavaScript vanilla, servido por el mismo servicio Node
**Despliegue objetivo:** Vercel (Hobby / gratis) + Neon (Free / gratis)

---

## 1. Estado general (metodología F.R.A.M.E.)

| Fase | Estado | Detalle |
|---|---|---|
| **F** · Foundation | ✓ Completo | Arquitectura documentada (7 vistas), modelo de datos con 22 tablas. |
| **R** · Render | ✓ Completo | Guía visual (paleta + tipografías), inventario de imágenes, 5 prototipos HTML. |
| **A** · Animation | ✓ Completo | Sistema de movimiento con tokens y microinteracciones. |
| **M** · Montaje | ✓ Completo | Base de datos + backend completo + 5 pantallas conectadas. **41 pruebas pasando.** |
| **E** · Entrega | 🚧 Preparada | Código listo para Vercel. Solo falta ejecutar el despliegue (ver `DESPLIEGUE.md`). |

---

## 2. Historial de iteraciones

### Iteración 6 — Rebranding + Vercel + YouTube *(actual)*
- **Rebranding completo:** "AulaViva" → "Aula Virtual Servienvia".
  - Textos visibles: título de pestaña, logos ("Aula Virtual"), footer, textos del hero.
  - Correos demo: `@aulaviva.com` → `@servienvia.com`.
  - Contraseña demo: `aulaviva2026` → `servienvia2026` (hash bcrypt regenerado).
  - Identificadores técnicos: `aulaviva_token` → `avs_token`, `aulaviva_usuario` → `avs_usuario`.
  - `package.json`: nombre `aula-virtual-servienvia`.
- **Adaptación a Vercel:**
  - Nuevo archivo `api/index.js` (handler serverless que exporta la app Express).
  - Nuevo archivo `vercel.json` (enruta `/api/*` a la función; el resto lo sirve el CDN).
  - Nuevo archivo `.vercelignore` (excluye `node_modules`, tests, docs).
  - Eliminado `render.yaml`.
- **Videos de YouTube en el reproductor:**
  - `sql/seed.sql`: 8 lecciones tipo video ahora tienen URLs de YouTube reales de ejemplo.
  - `src/controllers/cursosController.js`: incluye `url_contenido` en el detalle del curso.
  - `public/reproductor.html`: nueva función `extraerEmbed()` que detecta URLs de YouTube y Vimeo, y renderiza `<iframe>` cuando corresponde. Estilos ajustados.
- **`DESPLIEGUE.md`:** reescrito para Vercel + Neon.
- **`CAMBIOS.md`:** este archivo (nuevo).
- Pruebas: **41/41** siguen pasando tras todos los cambios.

### Iteración 5 — Fase E preparada *(antes)*
- Script `scripts/initDb.js` para inicializar BD en producción (idempotente).
- `src/db.js` con SSL automático para Neon.
- `src/server.js` con verificación de conexión y JWT al arrancar.
- Schema idempotente (`IF NOT EXISTS` en tablas e índices).

### Iteraciones anteriores
- **Iteración 4** — Reproductor conectado con progreso real por lección.
- **Iteración 3** — Dashboard conectado con inscripciones y rachas.
- **Iteración 2** — API ampliada (inscripciones, progreso, actividad). +19 pruebas.
- **Iteración 1** — Home + Login + Panel Admin conectados. 22 pruebas.
- **Iteración 0** — F.R.A.M.E. Fases F, R, A + BD + backend base.

---

## 3. Qué está terminado

### 3.1 Base de datos (22 tablas)
`usuarios`, `categorias`, `cursos`, `secciones`, `lecciones`, `recursos`, `inscripciones`, `progreso_lecciones`, `actividad`, `examenes`, `resultados_examen`, `certificaciones`, `horarios_estudio`, `listas`, `lista_cursos`, `vias_aprendizaje`, `via_cursos`, `preguntas`, `respuestas`, `notas`, `resenas`, `anuncios`.

*De estas, la Fase M actual usa las primeras 9. Las demás están definidas pero se usarán en el roadmap.*

### 3.2 API (endpoints implementados)

| Categoría | Endpoints |
|---|---|
| **Autenticación** | `POST /api/auth/login`, `GET /api/auth/me` |
| **Usuarios (solo admin)** | `GET/POST/PUT/DELETE /api/usuarios[/:id]` |
| **Catálogo (público)** | `GET /api/cursos`, `GET /api/cursos/:id` |
| **Inscripciones (con sesión)** | `GET/POST /api/inscripciones`, `PUT /api/inscripciones/:id`, `GET/PUT /api/inscripciones/:id/progreso` |
| **Actividad (con sesión)** | `GET/POST /api/actividad` |
| **Salud** | `GET /api/health` |

### 3.3 Pantallas conectadas (5)
- `/` — **Home** con catálogo en vivo, búsqueda y filtros por categoría.
- `/login.html` — **Login** con manejo de errores específicos.
- `/dashboard.html` — **Mi aprendizaje**: cursos, favoritos, archivados, racha y minutos.
- `/reproductor.html` — Curso con video de YouTube embebido, temario, progreso.
- `/admin.html` — Panel de administración con CRUD real de usuarios.

### 3.4 Cuentas demo
Contraseña de todas: **`servienvia2026`**
- `admin@servienvia.com` — administrador
- `maria@servienvia.com` — estudiante (6 cursos inscritos, racha activa)
- `carlos@servienvia.com` — instructor
- `ana@servienvia.com` — instructora
- `andes@servienvia.com` — institución
- `edupro@servienvia.com` — institución

---

## 4. Cómo probar localmente

```bash
cd backend
npm install      # solo la primera vez
npm test         # debe mostrar: Pruebas superadas: 41 / fallidas: 0
npm run demo     # arranca en http://localhost:4000 con BD en memoria
```

---

## 5. Qué falta antes de desplegar

**Nada bloqueante.** El código está listo. Solo falta *ejecutar* los pasos de `DESPLIEGUE.md`:

- [ ] Subir el código a GitHub.
- [ ] Crear la base de datos en Neon.
- [ ] Ejecutar `npm run db:init` apuntando a Neon.
- [ ] Crear el proyecto en Vercel, añadir las 3 variables de entorno y desplegar.
- [ ] Recorrer las 5 pantallas en la URL pública para confirmar.

---

## 6. Roadmap — mejoras futuras

Estas son **ideas para después del primer despliegue**. Priorizadas por relación **impacto/esfuerzo**. Puedes elegir cuáles añadir cuando quieras.

### 🎯 Prioridad alta (grande impacto, esfuerzo bajo o medio)

- **Confetti al completar un curso.** Ya hay una celebración; añadir una lluvia de confetti hará el momento memorable. Librería: `canvas-confetti` (ligera). *Esfuerzo: 15 min.*
- **Skeleton loaders más consistentes.** Algunos ya existen (dashboard, home); replicar el patrón en admin y reproductor para que la app se sienta más "viva" mientras carga. *Esfuerzo: 30 min.*
- **Panel del instructor.** Instructores pueden ver a los estudiantes inscritos en sus cursos, marcar anuncios y responder preguntas. Endpoints nuevos: `GET /api/instructor/cursos`, `GET /api/instructor/estudiantes`. *Esfuerzo: 3-4 h.*
- **Sistema de reseñas.** Cada estudiante que completó un curso puede dejar una reseña (1-5 estrellas + texto). Ya existe la tabla `resenas`; solo falta el CRUD y una sección en el reproductor. *Esfuerzo: 2-3 h.*
- **Notas por lección.** Un panel lateral en el reproductor para tomar notas. Ya existe la tabla `notas`. *Esfuerzo: 2 h.*

### ✨ Prioridad media (impacto notable, esfuerzo mayor)

- **Q&A por lección.** Los estudiantes pueden hacer preguntas y ver respuestas. Tablas `preguntas` y `respuestas` ya definidas. *Esfuerzo: 4-5 h.*
- **Gamificación básica:** puntos por lección completada, insignias por rachas, ranking semanal. Muy motivador para estudiantes. *Esfuerzo: 4-6 h.*
- **Panel del admin para gestión de cursos.** Actualmente el admin solo gestiona usuarios; añadir CRUD de cursos, secciones y lecciones (con campo `url_contenido` para el video). *Esfuerzo: 6-8 h.*
- **Búsqueda con autocompletado en la Home.** Sugerencias mientras escribes. *Esfuerzo: 1-2 h.*
- **Recordatorios por email.** Si el usuario lleva 2 días sin estudiar, un email amable ("¡Sigue tu racha!"). Requiere integrar un servicio de email (Resend tiene plan gratuito generoso). *Esfuerzo: 3 h + configuración.*

### 💫 Prioridad baja (nice-to-have)

- **Dark mode.** Un toggle en el header que cambia entre claro/oscuro con `prefers-color-scheme` como default. *Esfuerzo: 1-2 h.*
- **Tour de bienvenida.** Al primer login, un tour guiado en 4 pasos (librería: `driver.js`). *Esfuerzo: 1 h.*
- **PWA / instalable.** Añadir un `manifest.json` y `service worker` para que se pueda "instalar" desde el navegador. *Esfuerzo: 2-3 h.*
- **Certificados descargables.** Al 100% de un curso, generar un PDF con el nombre del estudiante. Librería: `pdfkit`. Tabla `certificaciones` ya existe. *Esfuerzo: 3-4 h.*
- **Traducción a inglés / multi-idioma.** Preparar el frontend para i18n. *Esfuerzo: 4-6 h.*

### 📌 Ideas pendientes de decidir

- Foro global del sitio (no solo Q&A por lección).
- Integración con Google Calendar para programar sesiones.
- Chat de instructor ↔ estudiante en vivo.
- Analíticas del admin (cuántos activos, cuántos progresando, cursos más populares).

---

## 7. Sobre el hosting de videos

**Decisión tomada: YouTube.** Es la mejor opción gratuita y no hay competencia real en el plan gratis. Justificación:

| Opción | Coste | Sin límites | CDN global | Recomendable |
|---|---|---|---|---|
| **YouTube (no listado)** | Gratis | ✅ | ✅ | ✅ **La elegida** |
| Vimeo Free | Gratis | ❌ (500 MB/semana) | ✅ | ⚠️ Muy limitado |
| Cloudflare Stream | Pago | Según plan | ✅ | ❌ No aplica ahora |
| Bunny.net | Pago desde $1/mes | Según plan | ✅ | 🚀 Cuando quieras evitar el logo de YouTube |
| Google Drive | Gratis (15 GB) | ❌ | ⚠️ Streaming pobre | ❌ No es para eso |
| Alojar en el servidor | Gratis | Depende | ❌ | ❌ Ni por asomo |

**Cómo funciona:**
1. Sube tus videos a YouTube marcados como **"No listado"** (no salen en búsquedas ni en el canal público).
2. Copia el link.
3. En Neon (tabla `lecciones`), actualiza la columna `url_contenido` con ese link.
4. El reproductor detecta automáticamente que es de YouTube y embebe el iframe.

**Ventajas:**
- Ancho de banda ilimitado usando el CDN de Google.
- Reproducción adaptativa (calidad se ajusta a la conexión del usuario).
- Sin coste operativo.
- Los usuarios pueden ver en pantalla completa, cambiar calidad, activar subtítulos automáticos.

**Contras honestas:**
- Aparece el logo de YouTube y "Ver en YouTube" al final. Aceptable para un proyecto interno.
- Si quieres una experiencia 100% marca-blanca, la alternativa es Bunny.net (~$1-5/mes).

---

## 8. Flujo de trabajo recomendado (para iteraciones con Antigravity)

Ya que trabajas con Google Antigravity y me pasas el zip para revisiones, este es el flujo eficiente:

1. **En Antigravity**, aplicas los cambios que necesites (por ejemplo, del roadmap del punto 6).
2. **Prueba localmente** con `npm run demo` y `npm test`.
3. **Actualiza este `CAMBIOS.md`** con lo que hiciste (añade una nueva sección "Iteración N" arriba del historial).
4. **Empaqueta el zip** (excluyendo `node_modules`) y me lo pasas.
5. **Yo reviso**: sintaxis, integridad, coherencia visual, seguridad y actualización del `CAMBIOS.md`.
6. **Te devuelvo el zip corregido** con las anotaciones en este archivo.

Consejos:
- **Un cambio por iteración.** Es más fácil revisar 1 cambio grande que 5 pequeños mezclados.
- **Corre `npm test` antes de mandarme el zip.** Si las 41 pruebas no pasan, arregla antes.
- **Documenta las decisiones que tomaste** (por ejemplo, "usé la librería X porque…"). Ayuda al mantenimiento futuro.

---

## 9. Contacto y créditos

Desarrollado por **Roger** como parte del rol de IT en **Servienvia C.A.**, aplicando el framework F.R.A.M.E. de generación de webs con IA. Trabajo iterativo asistido por Anthropic Claude + Google Antigravity.
