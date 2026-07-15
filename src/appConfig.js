// Configura la aplicación Express y la exporta (sin abrir puerto, para poder testearla).
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const cursosRoutes = require('./routes/cursos');
const inscripcionesRoutes = require('./routes/inscripciones');
const actividadRoutes = require('./routes/actividad');

function crearApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Sirve los archivos estáticos del frontend (login.html, admin.html, index.html)
  app.use(express.static(require('path').join(__dirname, '..', 'public')));

  // Salud del servicio
  app.get('/api/health', (req, res) => res.json({ ok: true, servicio: 'Aula Virtual Servienvia API' }));

  // Módulos
  app.use('/api/auth', authRoutes);
  app.use('/api/usuarios', usuariosRoutes);
  app.use('/api/cursos', cursosRoutes);
  app.use('/api/inscripciones', inscripcionesRoutes);
  app.use('/api/actividad', actividadRoutes);

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
