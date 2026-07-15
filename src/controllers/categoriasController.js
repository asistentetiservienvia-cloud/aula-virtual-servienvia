const db = require('../db');

// Listar todas las categorías
async function listarCategorias(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT id, nombre, icono, descripcion FROM categorias ORDER BY nombre ASC`
    );
    res.json({ categorias: rows, total: rows.length });
  } catch (e) { next(e); }
}

// Crear una categoría (solo administradores)
async function crearCategoria(req, res, next) {
  try {
    const { nombre, icono, descripcion } = req.body;
    const { rows } = await db.query(
      `INSERT INTO categorias (nombre, icono, descripcion) VALUES ($1, $2, $3) RETURNING *`,
      [nombre, icono || null, descripcion || null]
    );
    res.status(201).json({ categoria: rows[0] });
  } catch (e) {
    if (e.code === '23505') { // unique_violation
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre', codigo: 'nombre_duplicado' });
    }
    next(e);
  }
}

// Actualizar una categoría (solo administradores)
async function actualizarCategoria(req, res, next) {
  try {
    const id = req.params.id;
    const { nombre, icono, descripcion } = req.body;
    const { rows } = await db.query(
      `UPDATE categorias SET nombre = $1, icono = $2, descripcion = $3 WHERE id = $4 RETURNING *`,
      [nombre, icono || null, descripcion || null, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ categoria: rows[0] });
  } catch (e) {
    if (e.code === '23505') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre', codigo: 'nombre_duplicado' });
    }
    next(e);
  }
}

// Eliminar una categoría (solo administradores)
async function eliminarCategoria(req, res, next) {
  try {
    const id = req.params.id;
    // Esto pondrá en null la categoria_id en los cursos gracias a ON DELETE SET NULL
    const { rows } = await db.query('DELETE FROM categorias WHERE id = $1 RETURNING id', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (e) { next(e); }
}

module.exports = {
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
};
