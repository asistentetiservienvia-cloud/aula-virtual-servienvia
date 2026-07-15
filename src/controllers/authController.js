// Lógica de autenticación. Sin registro público: las cuentas las crea el administrador.
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { config } = require('../config');

// POST /api/auth/login  { correo, contrasena }
async function login(req, res, next) {
  try {
    const { correo, contrasena } = req.body;

    if (!correo || !contrasena) {
      return res.status(400).json({ error: 'Correo y contraseña son obligatorios', codigo: 'datos_incompletos' });
    }

    const { rows } = await db.query(
      'SELECT id, rol, nombre, correo, contrasena_hash, activo FROM usuarios WHERE correo = $1',
      [correo.toLowerCase().trim()]
    );

    // El flujo del proyecto distingue "cuenta inexistente" de "contraseña incorrecta"
    // a propósito: en Aula Virtual Servienvia las cuentas las crea un administrador, así que es útil
    // avisar al usuario que su cuenta debe ser creada. (Decisión de UX documentada.)
    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Tu cuenta debe ser creada por un administrador',
        codigo: 'cuenta_no_encontrada',
      });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Cuenta desactivada. Contacta al administrador', codigo: 'cuenta_inactiva' });
    }

    const coincide = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    if (!coincide) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos', codigo: 'credenciales_invalidas' });
    }

    // Genera el token de sesión (no incluimos el hash en el payload).
    const payload = { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre, correo: usuario.correo };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpires });

    res.json({ token, usuario: payload });
  } catch (e) {
    next(e);
  }
}

// GET /api/auth/me  (requiere token)
async function yo(req, res, next) {
  try {
    const { rows } = await db.query(
      'SELECT id, rol, nombre, correo, foto_url, profesion, intereses FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado', codigo: 'no_encontrado' });
    }
    res.json({ usuario: rows[0] });
  } catch (e) {
    next(e);
  }
}

module.exports = { login, yo };
