const express = require('express');
const router = express.Router();
const c = require('../controllers/adminCursosController');
const { autenticar } = require('../middleware/auth');
const { requiereRol } = require('../middleware/roles');

router.use(autenticar, requiereRol('administrador', 'instructor', 'institucion'));

// Todas estas rutas asumen que el middleware de autenticación (y verificación de rol) ya se ejecutó.
router.get('/', c.listarAdmin);
router.post('/', c.crearCurso);
router.put('/:id', c.actualizarCurso);
router.delete('/:id', c.eliminarCurso);

// Gestión del Temario
router.post('/:id/secciones', c.crearSeccion);
router.put('/secciones/:id', c.actualizarSeccion);
router.delete('/secciones/:id', c.eliminarSeccion);

router.post('/secciones/:id/lecciones', c.crearLeccion);
router.put('/lecciones/:id', c.actualizarLeccion);
router.delete('/lecciones/:id', c.eliminarLeccion);

module.exports = router;
