// CRUD de usuarios. Todas estas operaciones están restringidas al rol administrador
// (la restricción se aplica en las rutas con requiereRol('administrador')).
const bcrypt = require('bcryptjs');
const db = require('../db');

const ROLES_VALIDOS = ['estudiante', 'instructor', 'institucion', 'administrador'];

// Columnas seguras a devolver (nunca el hash de contraseña).
const COLS = 'id, rol, nombre, correo, foto_url, profesion, intereses, activo, fecha_creacion';

// GET /api/usuarios  -> lista (con filtros opcionales ?rol= &activo= &q=)
async function listar(req, res, next) {
  try {
    const cond = [];
    const params = [];
    if (req.query.rol) { params.push(req.query.rol); cond.push(`rol = $${params.length}`); }
    if (req.query.activo !== undefined) { params.push(req.query.activo === 'true'); cond.push(`activo = $${params.length}`); }
    if (req.query.q) { params.push(`%${req.query.q.toLowerCase()}%`); cond.push(`(LOWER(nombre) LIKE $${params.length} OR LOWER(correo) LIKE $${params.length})`); }
    const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
    const { rows } = await db.query(`SELECT ${COLS} FROM usuarios ${where} ORDER BY id`, params);
    res.json({ usuarios: rows, total: rows.length });
  } catch (e) { next(e); }
}

// GET /api/usuarios/:id  -> uno
async function obtener(req, res, next) {
  try {
    const { rows } = await db.query(`SELECT ${COLS} FROM usuarios WHERE id = $1`, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado', codigo: 'no_encontrado' });
    res.json({ usuario: rows[0] });
  } catch (e) { next(e); }
}

// POST /api/usuarios  -> crear  { nombre, correo, contrasena, rol, profesion, intereses }
async function crear(req, res, next) {
  try {
    const { nombre, correo, contrasena, rol = 'estudiante', profesion = null, intereses = null } = req.body;

    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios', codigo: 'datos_incompletos' });
    }
    if (!ROLES_VALIDOS.includes(rol)) {
      return res.status(400).json({ error: `Rol inválido. Usa uno de: ${ROLES_VALIDOS.join(', ')}`, codigo: 'rol_invalido' });
    }

    const hash = await bcrypt.hash(contrasena, 10);

    const { rows } = await db.query(
      `INSERT INTO usuarios (rol, nombre, correo, contrasena_hash, profesion, intereses, creado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${COLS}`,
      [rol, nombre, correo.toLowerCase().trim(), hash, profesion, intereses, req.usuario.id]
    );
    res.status(201).json({ usuario: rows[0] });
  } catch (e) {
    if (e.code === '23505') { // violación de UNIQUE (correo duplicado)
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo', codigo: 'correo_duplicado' });
    }
    next(e);
  }
}

// PUT /api/usuarios/:id  -> editar (campos opcionales; si llega contrasena se re-hashea)
async function actualizar(req, res, next) {
  try {
    const permitidos = ['nombre', 'correo', 'rol', 'profesion', 'intereses', 'activo'];
    const sets = [];
    const params = [];

    for (const campo of permitidos) {
      if (req.body[campo] !== undefined) {
        let valor = req.body[campo];
        if (campo === 'rol' && !ROLES_VALIDOS.includes(valor)) {
          return res.status(400).json({ error: 'Rol inválido', codigo: 'rol_invalido' });
        }
        if (campo === 'correo') valor = valor.toLowerCase().trim();
        params.push(valor);
        sets.push(`${campo} = $${params.length}`);
      }
    }

    if (req.body.contrasena) {
      const hash = await bcrypt.hash(req.body.contrasena, 10);
      params.push(hash);
      sets.push(`contrasena_hash = $${params.length}`);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'Nada que actualizar', codigo: 'sin_cambios' });
    }

    params.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE usuarios SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING ${COLS}`,
      params
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado', codigo: 'no_encontrado' });
    res.json({ usuario: rows[0] });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(409).json({ error: 'Ya existe un usuario con ese correo', codigo: 'correo_duplicado' });
    }
    next(e);
  }
}

// DELETE /api/usuarios/:id  -> baja lógica (activo=false). ?hard=true para borrado real.
async function eliminar(req, res, next) {
  try {
    if (Number(req.params.id) === req.usuario.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta', codigo: 'autoeliminacion' });
    }

    if (req.query.hard === 'true') {
      const { rowCount } = await db.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
      if (rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado', codigo: 'no_encontrado' });
      return res.json({ mensaje: 'Usuario eliminado permanentemente' });
    }

    const { rows } = await db.query(
      `UPDATE usuarios SET activo = FALSE WHERE id = $1 RETURNING ${COLS}`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado', codigo: 'no_encontrado' });
    res.json({ mensaje: 'Usuario desactivado', usuario: rows[0] });
  } catch (e) { next(e); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
