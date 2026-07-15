// Verifica el token JWT del encabezado Authorization y adjunta el usuario a la petición.
const jwt = require('jsonwebtoken');
const { config } = require('../config');

function autenticar(req, res, next) {
  const header = req.headers.authorization || '';
  const [esquema, token] = header.split(' ');

  if (esquema !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'No autenticado', codigo: 'sin_token' });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    // payload contiene: id, rol, nombre, correo
    req.usuario = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Sesión inválida o expirada', codigo: 'token_invalido' });
  }
}

module.exports = { autenticar };
