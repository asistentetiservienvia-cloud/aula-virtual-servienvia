const express = require('express');
const router = express.Router();
const c = require('../controllers/actividadController');
const { autenticar } = require('../middleware/auth');

router.use(autenticar);

router.get('/', c.listar);
router.post('/', c.registrar);

module.exports = router;
