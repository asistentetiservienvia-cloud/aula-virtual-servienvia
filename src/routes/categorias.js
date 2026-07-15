const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoriasController');

// GET /api/categorias - Público (para cargar el header de index.html y dropdowns)
router.get('/', controller.listarCategorias);

module.exports = router;
