const express = require('express');
const router = express.Router();
const c = require('../controllers/comunidadController');
const { autenticar } = require('../middleware/auth');

// Rutas públicas (lectura)
router.get('/lecciones/:leccionId/preguntas', c.listarPreguntasLeccion);
router.get('/cursos/:cursoId/resenas', c.listarResenasCurso);

// Rutas protegidas (escritura)
router.post('/lecciones/:leccionId/preguntas', autenticar, c.crearPregunta);
router.post('/cursos/:cursoId/resenas', autenticar, c.crearResena);

module.exports = router;
