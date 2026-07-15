// Configura la aplicación Express y la exporta (sin abrir puerto, para poder testearla).
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const cursosRoutes = require('./routes/cursos');
const inscripcionesRoutes = require('./routes/inscripciones');
const actividadRoutes = require('./routes/actividad');
const adminCursosRoutes = require('./routes/adminCursos');
const comunidadRoutes = require('./routes/comunidad');

function crearApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Sirve los archivos estáticos del frontend (login.html, admin.html, index.html)
  app.use(express.static(require('path').join(__dirname, '..', 'public')));

  // Salud del servicio
  app.get('/api/health', (req, res) => res.json({ ok: true, servicio: 'Aula Virtual Servienvia API' }));

  // Migración en caliente para Vercel
  app.get('/api/dev/migrate-courses', async (req, res) => {
    try {
      const db = require('./db');
      // Revisar si ya existen las lecciones nuevas
      const check = await db.query('SELECT COUNT(*) as n FROM lecciones WHERE seccion_id >= 5');
      if (Number(check.rows[0].n) > 0) {
        return res.json({ msg: 'El contenido ya había sido cargado previamente.' });
      }

      const sql = `
-- Curso 2: Diseño UX/UI (IDs de sección: 5, 6, 7)
INSERT INTO secciones (curso_id, titulo, orden) VALUES
  (2, 'Introducción a Figma', 1),       
  (2, 'Wireframes y Componentes', 2),   
  (2, 'Prototipado Interactivo', 3);    

INSERT INTO lecciones (seccion_id, titulo, tipo, duracion_segundos, url_contenido, orden) VALUES
  (5, 'Interfaz y herramientas básicas', 'video',     420, 'https://www.youtube.com/watch?v=Cx2dkpBxst8', 1),
  (5, 'Configuración del espacio',       'documento', 300, NULL, 2),
  (6, 'Creación de Wireframes',          'video',     750, 'https://www.youtube.com/watch?v=c9Wg6Cb_YlU', 1),
  (6, 'Uso de Auto Layout',              'video',     900, 'https://www.youtube.com/watch?v=NrKX46DpzCQ', 2),
  (7, 'Animaciones y Smart Animate',     'video',    1100, 'https://www.youtube.com/watch?v=kqtD5dpn9C8', 1),
  (7, 'Proyecto Final de UX',            'documento', 800, NULL, 2);

-- Curso 3: Ciencia de Datos (IDs de sección: 8, 9, 10)
INSERT INTO secciones (curso_id, titulo, orden) VALUES
  (3, 'Fundamentos de Datos', 1),       
  (3, 'Pandas y NumPy', 2),             
  (3, 'Machine Learning Básico', 3);    

INSERT INTO lecciones (seccion_id, titulo, tipo, duracion_segundos, url_contenido, orden) VALUES
  (8, '¿Qué es Ciencia de Datos?',       'video',     350, 'https://www.youtube.com/watch?v=X3paOmcrTjQ', 1),
  (8, 'Instalación de Entornos',         'documento', 400, NULL, 2),
  (9, 'Limpieza de Datos',               'video',     800, 'https://www.youtube.com/watch?v=dcqPhpY7tWk', 1),
  (9, 'Manipulación con Pandas',         'video',     950, 'https://www.youtube.com/watch?v=vmEHCJofslg', 2),
  (10,'Regresión Lineal',                'video',    1200, 'https://www.youtube.com/watch?v=zPG4NjIkCjc', 1),
  (10,'Clasificación de datos',          'video',    1150, 'https://www.youtube.com/watch?v=v0wL5M2l3c0', 2);

-- Curso 4: Marketing digital (IDs de sección: 11, 12, 13)
INSERT INTO secciones (curso_id, titulo, orden) VALUES
  (4, 'Fundamentos del Marketing', 1),  
  (4, 'SEO y Contenido', 2),            
  (4, 'Publicidad Pagada', 3);          

INSERT INTO lecciones (seccion_id, titulo, tipo, duracion_segundos, url_contenido, orden) VALUES
  (11,'El embudo de ventas',             'video',     520, 'https://www.youtube.com/watch?v=rfscVS0vtbw', 1),
  (11,'Creación de Buyer Personas',      'documento', 600, NULL, 2),
  (12,'Estrategia SEO 2026',             'video',     850, 'https://www.youtube.com/watch?v=eWRfhZUzrAc', 1),
  (13,'Campañas en Redes Sociales',      'video',     740, 'https://www.youtube.com/watch?v=cQT33yu9pY8', 1);

-- Curso 5: React + Tailwind (IDs de sección: 14, 15, 16)
INSERT INTO secciones (curso_id, titulo, orden) VALUES
  (5, 'Iniciando con React', 1),        
  (5, 'Estilizando con Tailwind', 2),   
  (5, 'Despliegue y Producción', 3);    

INSERT INTO lecciones (seccion_id, titulo, tipo, duracion_segundos, url_contenido, orden) VALUES
  (14,'Componentes y Props',             'video',     650, 'https://www.youtube.com/watch?v=dpw9EHDh2bM', 1),
  (14,'Manejo de Estado (Hooks)',        'video',     900, 'https://www.youtube.com/watch?v=O6P86uwfdR0', 2),
  (15,'Configuración de Tailwind',       'documento', 420, NULL, 1),
  (15,'Diseño Responsivo',               'video',     830, 'https://www.youtube.com/watch?v=UBOj6rqRUME', 2),
  (16,'Build y Deployment en Vercel',    'video',     560, 'https://www.youtube.com/watch?v=QxX2b7ItaT0', 1);

-- Curso 6: Inglés conversacional (IDs de sección: 17, 18, 19)
INSERT INTO secciones (curso_id, titulo, orden) VALUES
  (6, 'Presentaciones', 1),             
  (6, 'Reuniones y Emails', 2),         
  (6, 'Negociaciones', 3);              

INSERT INTO lecciones (seccion_id, titulo, tipo, duracion_segundos, url_contenido, orden) VALUES
  (17,'Introducing Yourself',            'video',     480, 'https://www.youtube.com/watch?v=f4KOjWS_KZs', 1),
  (17,'Vocabulary Quiz',                 'documento', 300, NULL, 2),
  (18,'Leading a Meeting',               'video',     720, 'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ', 1),
  (18,'Writing Professional Emails',     'video',     600, 'https://www.youtube.com/watch?v=v5MR5JnKcZI', 2),
  (19,'Advanced Negotiation Phrases',    'video',     800, 'https://www.youtube.com/watch?v=8DvywoWv6fI', 1);
      `;
      await db.query(sql);
      res.json({ msg: '¡Migración completada con éxito! Todos los cursos ahora tienen contenido y secciones.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // Módulos
  app.use('/api/auth', authRoutes);
  app.use('/api/usuarios', usuariosRoutes);
  app.use('/api/cursos', cursosRoutes);
  app.use('/api/inscripciones', inscripcionesRoutes);
  app.use('/api/actividad', actividadRoutes);
  app.use('/api/admin/cursos', adminCursosRoutes);
  app.use('/api/admin/categorias', require('./routes/adminCategorias'));
  app.use('/api/comunidad', comunidadRoutes);
  app.use('/api/categorias', require('./routes/categorias'));

  // 404 — JSON para rutas de API; cualquier otra ruta cae al SPA (index.html)
  app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'Ruta no encontrada', codigo: 'ruta_inexistente' });
    }
    res.sendFile(require('path').join(__dirname, '..', 'public', 'index.html'));
  });

  // Manejo central de errores
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[error]', err.message);
    res.status(500).json({ error: 'Error interno del servidor', codigo: 'error_interno' });
  });

  return app;
}

module.exports = { crearApp };
