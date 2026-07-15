-- ============================================================
--  Aula Virtual Servienvia — Datos de ejemplo (seed)
--  Ejecutar DESPUÉS de schema.sql
--  Contraseña de TODOS los usuarios demo: servienvia2026
--  (hash bcrypt real ya incluido más abajo)
-- ============================================================

INSERT INTO categorias (nombre, icono) VALUES
  ('Programación', 'code'),
  ('Diseño', 'palette'),
  ('Negocios', 'briefcase'),
  ('Marketing', 'megaphone'),
  ('Ciencia de Datos', 'robot'),
  ('Idiomas', 'language'),
  ('Foto y Video', 'camera'),
  ('Música', 'music');

-- ----------- USUARIOS -----------
-- El administrador (id=1) crea al resto. Hash bcrypt de 'servienvia2026'.
INSERT INTO usuarios (rol, nombre, correo, contrasena_hash, profesion, intereses, creado_por) VALUES
  ('administrador', 'Admin Servienvia',     'admin@servienvia.com',  '$2a$10$ivvXhtnLv2MIKy6VWuk8W.l70zGEBSwVZBkDu80OUfdBfFydN84iy', 'Administrador de la plataforma', NULL, NULL),
  ('estudiante',    'María Restrepo',     'maria@servienvia.com',  '$2a$10$ivvXhtnLv2MIKy6VWuk8W.l70zGEBSwVZBkDu80OUfdBfFydN84iy', 'Desarrolladora frontend en formación', 'JavaScript, UX, Ciencia de Datos', 1),
  ('instructor',    'Carlos Ruiz',        'carlos@servienvia.com', '$2a$10$ivvXhtnLv2MIKy6VWuk8W.l70zGEBSwVZBkDu80OUfdBfFydN84iy', 'Diseñador de producto y mentor', 'Diseño, UX', 1),
  ('instructor',    'Ana Gómez',          'ana@servienvia.com',    '$2a$10$ivvXhtnLv2MIKy6VWuk8W.l70zGEBSwVZBkDu80OUfdBfFydN84iy', 'Ingeniera de software', 'Python, backend', 1),
  ('institucion',   'Universidad Andes',  'andes@servienvia.com',  '$2a$10$ivvXhtnLv2MIKy6VWuk8W.l70zGEBSwVZBkDu80OUfdBfFydN84iy', 'Institución educativa aliada', 'Datos, ciencia', 1),
  ('institucion',   'EduPro',             'edupro@servienvia.com', '$2a$10$ivvXhtnLv2MIKy6VWuk8W.l70zGEBSwVZBkDu80OUfdBfFydN84iy', 'Academia de idiomas', 'Idiomas', 1);

-- ----------- CURSOS -----------
-- instructor_id: 4=Ana, 3=Carlos, 5=Andes, 6=EduPro
INSERT INTO cursos (instructor_id, categoria_id, titulo, descripcion, calificacion_promedio, num_valoraciones, publicado) VALUES
  (4, 1, 'Python desde cero: tu primer programa', 'De cero a tus primeros programas funcionales en Python. Sin conocimientos previos.', 4.8, 12430, TRUE),
  (3, 2, 'Diseño UX/UI profesional con Figma',     'Aprende a diseñar interfaces modernas y flujos de usuario con Figma.', 4.9, 8210, TRUE),
  (5, 5, 'Ciencia de Datos y Machine Learning',    'Fundamentos prácticos de análisis de datos y modelos de ML.', 4.7, 15090, TRUE),
  (3, 4, 'Marketing digital y crecimiento',        'Estrategias de marketing y crecimiento orgánico para 2026.', 4.6, 6540, TRUE),
  (4, 1, 'React + Tailwind: apps en producción',   'Construye y despliega aplicaciones modernas con React y Tailwind.', 4.9, 9870, TRUE),
  (6, 6, 'Inglés conversacional para profesionales','Gana fluidez para entornos de trabajo reales.', 4.5, 20310, TRUE);

-- ----------- SECCIONES Y LECCIONES (curso 1: Python) -----------
-- Coincide con el reproductor: 4 secciones, 12 lecciones.
INSERT INTO secciones (curso_id, titulo, orden) VALUES
  (1, 'Introducción al curso', 1),     -- id 1
  (1, 'Fundamentos', 2),                -- id 2
  (1, 'Estructuras de control', 3),     -- id 3
  (1, 'Proyecto final', 4);             -- id 4

-- Videos de YouTube de ejemplo (freeCodeCamp Python for Beginners, dominio público).
-- Para tu propio contenido: sustituye estas URLs por tus videos "no listados" en YouTube.
INSERT INTO lecciones (seccion_id, titulo, tipo, duracion_segundos, url_contenido, orden) VALUES
  (1, 'Bienvenida y objetivos',        'video',    270, 'https://www.youtube.com/watch?v=rfscVS0vtbw', 1),
  (1, 'Cómo aprovechar el curso',      'video',    375, 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 2),
  (1, 'Recursos y guía de inicio',     'documento',480, NULL, 3),
  (2, 'Tu primer programa',            'video',    740, 'https://www.youtube.com/watch?v=eWRfhZUzrAc', 1),
  (2, 'Variables y tipos de datos',    'video',    940, 'https://www.youtube.com/watch?v=cQT33yu9pY8', 2),
  (2, 'Operadores',                    'video',    570, 'https://www.youtube.com/watch?v=v5MR5JnKcZI', 3),
  (2, 'Ejercicio práctico',            'documento',870, NULL, 4),
  (3, 'Condicionales (if / else)',     'video',    790, 'https://www.youtube.com/watch?v=f4KOjWS_KZs', 1),
  (3, 'Bucles (for / while)',          'video',   1010, 'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ', 2),
  (3, 'Quiz de la sección',            'documento',480, NULL, 3),
  (4, 'Construyendo el proyecto',      'video',   1320, 'https://www.youtube.com/watch?v=8DvywoWv6fI', 1),
  (4, 'Cierre y siguientes pasos',     'video',    480, 'https://www.youtube.com/watch?v=rfscVS0vtbw', 2);

-- ----------- RECURSOS (lección 5: Variables) -----------
INSERT INTO recursos (leccion_id, nombre, url_archivo, tipo_archivo) VALUES
  (5, 'Guía de inicio',          '/assets/recursos/guia-inicio.pdf',      'pdf'),
  (5, 'Código fuente lección 5', '/assets/recursos/leccion5-codigo.zip',  'zip'),
  (5, 'Cheatsheet de Python',    '/assets/recursos/python-cheatsheet.pdf','pdf');

-- ----------- INSCRIPCIONES (María, id=2) -----------
INSERT INTO inscripciones (usuario_id, curso_id, progreso, horas_dedicadas, favorito) VALUES
  (2, 1, 65, 12.5, TRUE),
  (2, 2, 30, 4.0, FALSE),
  (2, 3, 90, 18.0, FALSE),
  (2, 4, 12, 1.5, FALSE),
  (2, 5, 0,  0.0, FALSE),
  (2, 6, 100, 22.0, FALSE);

-- ----------- PROGRESO POR LECCIÓN (curso Python de María -> inscripción id=1) -----------
-- Primeras 4 lecciones completadas (33% ~ coincide con el reproductor).
INSERT INTO progreso_lecciones (inscripcion_id, leccion_id, completada, ultima_posicion_segundos) VALUES
  (1, 1, TRUE, 270),
  (1, 2, TRUE, 375),
  (1, 3, TRUE, 480),
  (1, 4, TRUE, 740),
  (1, 5, FALSE, 222);

-- ----------- ACTIVIDAD / RACHA (María) -----------
INSERT INTO actividad (usuario_id, fecha, minutos) VALUES
  (2, CURRENT_DATE - 4, 45),
  (2, CURRENT_DATE - 3, 60),
  (2, CURRENT_DATE - 2, 30),
  (2, CURRENT_DATE - 1, 75),
  (2, CURRENT_DATE,     65);

-- ----------- RESEÑAS (curso Python) -----------
INSERT INTO resenas (curso_id, usuario_id, calificacion, comentario) VALUES
  (1, 2, 5, 'El mejor curso para empezar. Explicaciones clarísimas y ejercicios muy prácticos.');

-- ----------- PREGUNTAS Y RESPUESTAS (lección 5) -----------
INSERT INTO preguntas (leccion_id, usuario_id, texto, util_count) VALUES
  (5, 2, '¿Python distingue entre mayúsculas y minúsculas en los nombres de variables?', 12);
INSERT INTO respuestas (pregunta_id, usuario_id, texto) VALUES
  (1, 4, 'Sí, Python es sensible a mayúsculas: edad y Edad son variables distintas.');

-- ----------- NOTAS (María, lección 5) -----------
INSERT INTO notas (usuario_id, leccion_id, marca_tiempo_segundos, texto) VALUES
  (2, 5, 70, 'Los tipos básicos: int, float, str y bool.');

-- ----------- ANUNCIOS (curso Python, autor Ana id=4) -----------
INSERT INTO anuncios (curso_id, autor_id, texto) VALUES
  (1, 4, '¡Bienvenidos al curso! Subí nuevos ejercicios en la sección de Fundamentos.');

-- ----------- EXAMEN Y RESULTADO -----------
INSERT INTO examenes (curso_id, titulo, puntaje_aprobacion) VALUES
  (1, 'Examen final de Python', 70);
INSERT INTO resultados_examen (examen_id, usuario_id, puntaje, aprobado) VALUES
  (1, 2, 88.0, TRUE);

-- ----------- CERTIFICACIÓN (María completó Inglés, curso 6) -----------
INSERT INTO certificaciones (usuario_id, curso_id, codigo_verificacion) VALUES
  (2, 6, 'AV-2026-INGLES-0007');

-- ----------- HORARIO DE ESTUDIO (María) -----------
INSERT INTO horarios_estudio (usuario_id, dias_semana, hora_inicio, duracion_minutos) VALUES
  (2, 'L,X,V', '19:00', 45);

-- ----------- LISTAS Y LISTA DE DESEOS (María) -----------
INSERT INTO listas (usuario_id, nombre, es_lista_deseos) VALUES
  (2, 'Front-end 2026', FALSE),       -- id 1
  (2, 'Lista de deseos', TRUE);       -- id 2
INSERT INTO lista_cursos (lista_id, curso_id) VALUES
  (1, 1), (1, 5),                     -- Front-end 2026: Python, React
  (2, 2), (2, 3);                     -- Deseos: Diseño UX, Ciencia de Datos

-- ----------- VÍAS DE APRENDIZAJE -----------
INSERT INTO vias_aprendizaje (nombre, descripcion) VALUES
  ('Conviértete en Desarrollador Full-Stack', 'Ruta de programación de cero a producción.'),  -- id 1
  ('Analista de Datos profesional', 'Del análisis básico al machine learning.');               -- id 2
INSERT INTO via_cursos (via_id, curso_id, orden) VALUES
  (1, 1, 1), (1, 5, 2),              -- Full-Stack: Python -> React
  (2, 3, 1);                          -- Datos: Ciencia de Datos

-- ============================================================
--  FIN DEL SEED
-- ============================================================