const express = require('express');
const router = express.Router();
const c = require('../controllers/inscripcionesController');
const { autenticar } = require('../middleware/auth');

// Todas las rutas de inscripciones requieren sesión iniciada.
router.use(autenticar);

router.get('/', c.listar);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.get('/:id/progreso', c.obtenerProgreso);
router.put('/:id/progreso', c.marcarLeccion);

module.exports = router;
