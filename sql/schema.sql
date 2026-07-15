-- ============================================================
--  Aula Virtual Servienvia — Esquema de Base de Datos (PostgreSQL)
--  Fase M (Montaje) · Derivado del Cap. 3 del documento de Arquitectura
--  Convención: tablas y columnas en minúscula con guion_bajo
-- ============================================================

-- Limpieza opcional (descomenta para recrear desde cero)
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;

-- ----------- TIPOS -----------
CREATE TYPE rol_usuario AS ENUM ('estudiante', 'instructor', 'institucion', 'administrador');
CREATE TYPE tipo_leccion AS ENUM ('video', 'documento');

-- ============================================================
--  DOMINIO A · IDENTIDAD Y ACCESO
-- ============================================================

-- [NÚCLEO] Usuario. Las cuentas SOLO las crea un administrador (correo + contraseña).
CREATE TABLE IF NOT EXISTS usuarios (
    id               SERIAL PRIMARY KEY,
    rol              rol_usuario  NOT NULL DEFAULT 'estudiante',
    nombre           VARCHAR(120) NOT NULL,
    correo           VARCHAR(160) NOT NULL UNIQUE,
    contrasena_hash  VARCHAR(255) NOT NULL,          -- bcrypt (hash + sal). Nunca texto plano.
    foto_url         VARCHAR(300),
    profesion        VARCHAR(160),
    intereses        TEXT,                            -- lista separada por comas (simplificado)
    activo           BOOLEAN      NOT NULL DEFAULT TRUE,   -- baja lógica desde el panel admin
    creado_por       INTEGER      REFERENCES usuarios(id) ON DELETE SET NULL,  -- qué admin lo creó
    fecha_creacion   TIMESTAMPTZ  NOT NULL DEFAULT now()
);
COMMENT ON TABLE usuarios IS 'Cuentas del sistema. Solo el rol administrador puede crear/editar/eliminar.';

-- ============================================================
--  DOMINIO B · CATÁLOGO Y CONTENIDO
-- ============================================================

-- [SOPORTE] Categorías de cursos (Programación, Diseño, etc.)
CREATE TABLE IF NOT EXISTS categorias (
    id           SERIAL PRIMARY KEY,
    nombre       VARCHAR(80) NOT NULL UNIQUE,
    icono        VARCHAR(80),                         -- nombre/ruta del icono
    descripcion  TEXT
);

-- [NÚCLEO] Curso. Lo publica un instructor o una institución.
CREATE TABLE IF NOT EXISTS cursos (
    id                    SERIAL PRIMARY KEY,
    instructor_id         INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    categoria_id          INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
    titulo                VARCHAR(200) NOT NULL,
    descripcion           TEXT,
    portada_url           VARCHAR(300),
    calificacion_promedio NUMERIC(2,1) NOT NULL DEFAULT 0.0,   -- denormalizado para listados
    num_valoraciones      INTEGER      NOT NULL DEFAULT 0,
    publicado             BOOLEAN      NOT NULL DEFAULT FALSE,
    fecha_creacion        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- [NÚCLEO] Sección: agrupa lecciones dentro de un curso.
CREATE TABLE IF NOT EXISTS secciones (
    id        SERIAL PRIMARY KEY,
    curso_id  INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    titulo    VARCHAR(200) NOT NULL,
    orden     INTEGER NOT NULL DEFAULT 1
);

-- [NÚCLEO] Lección: un video o un documento.
CREATE TABLE IF NOT EXISTS lecciones (
    id                SERIAL PRIMARY KEY,
    seccion_id        INTEGER NOT NULL REFERENCES secciones(id) ON DELETE CASCADE,
    titulo            VARCHAR(200) NOT NULL,
    tipo              tipo_leccion NOT NULL DEFAULT 'video',
    duracion_segundos INTEGER NOT NULL DEFAULT 0,
    url_contenido     VARCHAR(300),
    orden             INTEGER NOT NULL DEFAULT 1
);

-- [SOPORTE] Recursos descargables de una lección (PDF, .zip, etc.)
CREATE TABLE IF NOT EXISTS recursos (
    id           SERIAL PRIMARY KEY,
    leccion_id   INTEGER NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
    nombre       VARCHAR(200) NOT NULL,
    url_archivo  VARCHAR(300) NOT NULL,
    tipo_archivo VARCHAR(20)                          -- pdf, zip, png...
);

-- ============================================================
--  DOMINIO C · APRENDIZAJE DEL ESTUDIANTE
-- ============================================================

-- [NÚCLEO] Inscripción: relación estudiante <-> curso (resuelve el N:N).
CREATE TABLE IF NOT EXISTS inscripciones (
    id                 SERIAL PRIMARY KEY,
    usuario_id         INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id           INTEGER NOT NULL REFERENCES cursos(id)   ON DELETE CASCADE,
    fecha_inscripcion  TIMESTAMPTZ NOT NULL DEFAULT now(),
    progreso           INTEGER NOT NULL DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
    horas_dedicadas    NUMERIC(6,2) NOT NULL DEFAULT 0,
    favorito           BOOLEAN NOT NULL DEFAULT FALSE,
    archivado          BOOLEAN NOT NULL DEFAULT FALSE,
    recibe_anuncios    BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (usuario_id, curso_id)
);

-- [SOPORTE] Progreso por lección (alimenta el % del curso y los checks del reproductor).
CREATE TABLE IF NOT EXISTS progreso_lecciones (
    id                       SERIAL PRIMARY KEY,
    inscripcion_id           INTEGER NOT NULL REFERENCES inscripciones(id) ON DELETE CASCADE,
    leccion_id               INTEGER NOT NULL REFERENCES lecciones(id)     ON DELETE CASCADE,
    completada               BOOLEAN NOT NULL DEFAULT FALSE,
    ultima_posicion_segundos INTEGER NOT NULL DEFAULT 0,    -- punto para "continuar viendo"
    UNIQUE (inscripcion_id, leccion_id)
);

-- [NÚCLEO] Racha / Actividad diaria (minutos por día -> rachas).
CREATE TABLE IF NOT EXISTS actividad (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha       DATE    NOT NULL,
    minutos     INTEGER NOT NULL DEFAULT 0,
    UNIQUE (usuario_id, fecha)
);

-- [NÚCLEO] Examen del curso.
CREATE TABLE IF NOT EXISTS examenes (
    id        SERIAL PRIMARY KEY,
    curso_id  INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    titulo    VARCHAR(200) NOT NULL,
    puntaje_aprobacion INTEGER NOT NULL DEFAULT 70
);

-- [NÚCLEO] Resultado de examen.
CREATE TABLE IF NOT EXISTS resultados_examen (
    id          SERIAL PRIMARY KEY,
    examen_id   INTEGER NOT NULL REFERENCES examenes(id) ON DELETE CASCADE,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    puntaje     NUMERIC(5,2) NOT NULL,
    aprobado    BOOLEAN NOT NULL DEFAULT FALSE,
    fecha       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [NÚCLEO] Certificación emitida al completar un curso.
CREATE TABLE IF NOT EXISTS certificaciones (
    id                  SERIAL PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    curso_id            INTEGER NOT NULL REFERENCES cursos(id)   ON DELETE CASCADE,
    fecha_emision       TIMESTAMPTZ NOT NULL DEFAULT now(),
    codigo_verificacion VARCHAR(40) UNIQUE,
    UNIQUE (usuario_id, curso_id)
);

-- [SOPORTE] Horario de estudio programado (dashboard "programar tiempo").
CREATE TABLE IF NOT EXISTS horarios_estudio (
    id                SERIAL PRIMARY KEY,
    usuario_id        INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    dias_semana       VARCHAR(20) NOT NULL,            -- ej. 'L,X,V'
    hora_inicio       TIME NOT NULL,
    duracion_minutos  INTEGER NOT NULL DEFAULT 30
);

-- [SOPORTE] Listas del usuario. La lista de deseos es una lista marcada.
CREATE TABLE IF NOT EXISTS listas (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nombre          VARCHAR(120) NOT NULL,
    es_lista_deseos BOOLEAN NOT NULL DEFAULT FALSE
);

-- [SOPORTE] Cursos dentro de una lista (N:N).
CREATE TABLE IF NOT EXISTS lista_cursos (
    lista_id  INTEGER NOT NULL REFERENCES listas(id) ON DELETE CASCADE,
    curso_id  INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    PRIMARY KEY (lista_id, curso_id)
);

-- [SOPORTE] Vías de aprendizaje (rutas de varios cursos).
CREATE TABLE IF NOT EXISTS vias_aprendizaje (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(160) NOT NULL,
    descripcion TEXT
);

-- [SOPORTE] Cursos dentro de una vía, ordenados (N:N).
CREATE TABLE IF NOT EXISTS via_cursos (
    via_id    INTEGER NOT NULL REFERENCES vias_aprendizaje(id) ON DELETE CASCADE,
    curso_id  INTEGER NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
    orden     INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (via_id, curso_id)
);

-- ============================================================
--  DOMINIO D · INTERACCIÓN Y SOCIAL
-- ============================================================

-- [NÚCLEO] Pregunta (Q&A) sobre una lección.
CREATE TABLE IF NOT EXISTS preguntas (
    id          SERIAL PRIMARY KEY,
    leccion_id  INTEGER NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
    texto       TEXT NOT NULL,
    util_count  INTEGER NOT NULL DEFAULT 0,
    fecha       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [NÚCLEO] Respuesta a una pregunta.
CREATE TABLE IF NOT EXISTS respuestas (
    id          SERIAL PRIMARY KEY,
    pregunta_id INTEGER NOT NULL REFERENCES preguntas(id) ON DELETE CASCADE,
    usuario_id  INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
    texto       TEXT NOT NULL,
    fecha       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [NÚCLEO] Nota personal del estudiante en una marca de tiempo del video.
CREATE TABLE IF NOT EXISTS notas (
    id                    SERIAL PRIMARY KEY,
    usuario_id            INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
    leccion_id            INTEGER NOT NULL REFERENCES lecciones(id) ON DELETE CASCADE,
    marca_tiempo_segundos INTEGER NOT NULL DEFAULT 0,
    texto                 TEXT NOT NULL,
    fecha                 TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- [NÚCLEO] Reseña de un curso (1 por usuario y curso).
CREATE TABLE IF NOT EXISTS resenas (
    id           SERIAL PRIMARY KEY,
    curso_id     INTEGER NOT NULL REFERENCES cursos(id)   ON DELETE CASCADE,
    usuario_id   INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
    comentario   TEXT,
    fecha        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (curso_id, usuario_id)
);

-- [SOPORTE] Anuncios del instructor en un curso.
CREATE TABLE IF NOT EXISTS anuncios (
    id        SERIAL PRIMARY KEY,
    curso_id  INTEGER NOT NULL REFERENCES cursos(id)   ON DELETE CASCADE,
    autor_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    texto     TEXT NOT NULL,
    fecha     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
--  ÍNDICES (rendimiento en consultas frecuentes)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cursos_instructor   ON cursos(instructor_id);
CREATE INDEX IF NOT EXISTS idx_cursos_categoria    ON cursos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_secciones_curso     ON secciones(curso_id);
CREATE INDEX IF NOT EXISTS idx_lecciones_seccion   ON lecciones(seccion_id);
CREATE INDEX IF NOT EXISTS idx_inscrip_usuario     ON inscripciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_inscrip_curso       ON inscripciones(curso_id);
CREATE INDEX IF NOT EXISTS idx_progreso_inscrip    ON progreso_lecciones(inscripcion_id);
CREATE INDEX IF NOT EXISTS idx_actividad_usuario   ON actividad(usuario_id);
CREATE INDEX IF NOT EXISTS idx_preguntas_leccion   ON preguntas(leccion_id);
CREATE INDEX IF NOT EXISTS idx_notas_usuario_lec   ON notas(usuario_id, leccion_id);
CREATE INDEX IF NOT EXISTS idx_resenas_curso       ON resenas(curso_id);
CREATE INDEX IF NOT EXISTS idx_anuncios_curso      ON anuncios(curso_id);

-- ============================================================
--  FIN DEL ESQUEMA
-- ============================================================
