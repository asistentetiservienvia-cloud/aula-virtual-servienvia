const db = require('../db');

// --- CURSOS ---

// Listar cursos para el panel de administración
async function listarAdmin(req, res, next) {
  try {
    const { rows } = await db.query(
      `SELECT c.id, c.titulo, c.descripcion, c.portada_url, c.publicado, c.fecha_creacion,
              u.nombre AS instructor, cat.nombre AS categoria
       FROM cursos c
       JOIN usuarios u ON u.id = c.instructor_id
       LEFT JOIN categorias cat ON cat.id = c.categoria_id
       ORDER BY c.fecha_creacion DESC`
    );
    res.json({ cursos: rows, total: rows.length });
  } catch (e) { next(e); }
}

async function crearCurso(req, res, next) {
  try {
    const { titulo, descripcion, portada_url, publicado, categoria_id } = req.body;
    // Si no es admin, forzar que el instructor_id sea el del usuario actual
    let instructorId = req.usuario.id; 
    if (req.usuario.rol === 'administrador' && req.body.instructor_id) {
      instructorId = req.body.instructor_id;
    }

    const { rows } = await db.query(
      `INSERT INTO cursos (instructor_id, categoria_id, titulo, descripcion, portada_url, publicado)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [instructorId, categoria_id || null, titulo, descripcion || null, portada_url || null, publicado || false]
    );
    res.status(201).json({ curso: rows[0] });
  } catch (e) { next(e); }
}

async function actualizarCurso(req, res, next) {
  try {
    const id = req.params.id;
    const { titulo, descripcion, portada_url, publicado, categoria_id, instructor_id } = req.body;
    
    // Verificación básica: un instructor solo puede editar sus propios cursos
    if (req.usuario.rol !== 'administrador') {
      const cur = await db.query('SELECT instructor_id FROM cursos WHERE id = $1', [id]);
      if (cur.rows.length === 0 || cur.rows[0].instructor_id !== req.usuario.id) {
        return res.status(403).json({ error: 'No tienes permiso para editar este curso', codigo: 'sin_permiso' });
      }
    }

    let instrId = instructor_id;
    if (req.usuario.rol !== 'administrador') instrId = req.usuario.id;

    const { rows } = await db.query(
      `UPDATE cursos 
       SET titulo = $1, descripcion = $2, portada_url = $3, publicado = $4, categoria_id = $5, instructor_id = COALESCE($6, instructor_id)
       WHERE id = $7 RETURNING *`,
      [titulo, descripcion || null, portada_url || null, publicado, categoria_id || null, instrId || null, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json({ curso: rows[0] });
  } catch (e) { next(e); }
}

async function eliminarCurso(req, res, next) {
  try {
    const id = req.params.id;
    if (req.usuario.rol !== 'administrador') {
      const cur = await db.query('SELECT instructor_id FROM cursos WHERE id = $1', [id]);
      if (cur.rows.length === 0 || cur.rows[0].instructor_id !== req.usuario.id) {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este curso', codigo: 'sin_permiso' });
      }
    }
    const { rows } = await db.query('DELETE FROM cursos WHERE id = $1 RETURNING id', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Curso no encontrado' });
    res.json({ mensaje: 'Curso eliminado' });
  } catch (e) { next(e); }
}

// --- SECCIONES ---

async function crearSeccion(req, res, next) {
  try {
    const cursoId = req.params.id;
    const { titulo, orden } = req.body;
    const { rows } = await db.query(
      `INSERT INTO secciones (curso_id, titulo, orden) VALUES ($1, $2, $3) RETURNING *`,
      [cursoId, titulo, orden || 1]
    );
    res.status(201).json({ seccion: rows[0] });
  } catch (e) { next(e); }
}

async function actualizarSeccion(req, res, next) {
  try {
    const { titulo, orden } = req.body;
    const { rows } = await db.query(
      `UPDATE secciones SET titulo = $1, orden = $2 WHERE id = $3 RETURNING *`,
      [titulo, orden, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json({ seccion: rows[0] });
  } catch (e) { next(e); }
}

async function eliminarSeccion(req, res, next) {
  try {
    const { rows } = await db.query('DELETE FROM secciones WHERE id = $1 RETURNING id', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Sección no encontrada' });
    res.json({ mensaje: 'Sección eliminada' });
  } catch (e) { next(e); }
}

// --- LECCIONES ---

async function crearLeccion(req, res, next) {
  try {
    const secId = req.params.id;
    const { titulo, tipo, duracion_segundos, url_contenido, orden } = req.body;
    const { rows } = await db.query(
      `INSERT INTO lecciones (seccion_id, titulo, tipo, duracion_segundos, url_contenido, orden) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [secId, titulo, tipo || 'video', duracion_segundos || 0, url_contenido || null, orden || 1]
    );
    res.status(201).json({ leccion: rows[0] });
  } catch (e) { next(e); }
}

async function actualizarLeccion(req, res, next) {
  try {
    const { titulo, tipo, duracion_segundos, url_contenido, orden } = req.body;
    const { rows } = await db.query(
      `UPDATE lecciones 
       SET titulo = $1, tipo = $2, duracion_segundos = $3, url_contenido = $4, orden = $5 
       WHERE id = $6 RETURNING *`,
      [titulo, tipo, duracion_segundos, url_contenido || null, orden, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Lección no encontrada' });
    res.json({ leccion: rows[0] });
  } catch (e) { next(e); }
}

async function eliminarLeccion(req, res, next) {
  try {
    const { rows } = await db.query('DELETE FROM lecciones WHERE id = $1 RETURNING id', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Lección no encontrada' });
    res.json({ mensaje: 'Lección eliminada' });
  } catch (e) { next(e); }
}

module.exports = {
  listarAdmin, crearCurso, actualizarCurso, eliminarCurso,
  crearSeccion, actualizarSeccion, eliminarSeccion,
  crearLeccion, actualizarLeccion, eliminarLeccion
};
