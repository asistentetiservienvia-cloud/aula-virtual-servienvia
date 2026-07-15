const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoriasController');
const { autenticar } = require('../middleware/auth');
const { requiereRol } = require('../middleware/roles');

router.use(autenticar, requiereRol('administrador'));

router.post('/', controller.crearCategoria);
router.put('/:id', controller.actualizarCategoria);
router.delete('/:id', controller.eliminarCategoria);

module.exports = router;
