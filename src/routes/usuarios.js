const express = require('express');
const router = express.Router();
const c = require('../controllers/usuariosController');
const { autenticar } = require('../middleware/auth');
const { requiereRol } = require('../middleware/roles');

// Todo el módulo de usuarios requiere sesión + rol administrador.
router.use(autenticar, requiereRol('administrador'));

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;
