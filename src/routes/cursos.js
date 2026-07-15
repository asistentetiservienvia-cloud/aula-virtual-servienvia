const express = require('express');
const router = express.Router();
const c = require('../controllers/cursosController');

router.get('/', c.listar);
router.get('/:id', c.obtener);

module.exports = router;
