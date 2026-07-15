const express = require('express');
const router = express.Router();
const { login, yo } = require('../controllers/authController');
const { autenticar } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', autenticar, yo);

module.exports = router;
