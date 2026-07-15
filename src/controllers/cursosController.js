// Lectura del catálogo de cursos para alimentar la Home y el detalle del curso.
const db = require('../db');

// GET /api/cursos  -> cursos publicados (con instructor y categoría)
async function listar(req, res, next) {
  try {
    const params = [];
    let where = 'WHERE c.publicado = TRUE';
    if (req.query.categoria) { params.push(req.query.categoria); where += ` AND cat.nombre = $${params.length}`; }
    if (req.query.q) { params.push(`%${req.query.q.toLowerCase()}%`); where += ` AND LOWER(c.titulo) LIKE $${params.length}`; }

    const { rows } = await db.query(
      `SELECT c.id, c.titulo, c.descripcion, c.portada_url,
              c.calificacion_promedio, c.num_valoraciones,
              u.nombre AS instructor, cat.nombre AS categoria
       FROM cursos c
       JOIN usuarios u   ON u.id = c.instructor_id
       LEFT JOIN categorias cat ON cat.id = c.categoria_id
       ${where}
       ORDER BY c.num_valoraciones DESC`,
      params
    );
    res.json({ cursos: rows, total: rows.length });
  } catch (e) { next(e); }
}

// GET /api/cursos/:id  -> detalle con secciones y lecciones anidadas
async function obtener(req, res, next) {
  try {
    const cursoRes = await db.query(
      `SELECT c.id, c.titulo, c.descripcion, c.portada_url,
              c.calificacion_promedio, c.num_valoraciones,
              u.nombre AS instructor, cat.nombre AS categoria
       FROM cursos c
       JOIN usuarios u ON u.id = c.instructor_id
       LEFT JOIN categorias cat ON cat.id = c.categoria_id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (cursoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado', codigo: 'no_encontrado' });
    }
    const curso = cursoRes.rows[0];

    const secciones = await db.query(
      'SELECT id, titulo, orden FROM secciones WHERE curso_id = $1 ORDER BY orden',
      [curso.id]
    );
    const lecciones = await db.query(
      `SELECT l.id, l.seccion_id, l.titulo, l.tipo, l.duracion_segundos, l.url_contenido, l.orden
       FROM lecciones l
       JOIN secciones s ON s.id = l.seccion_id
       WHERE s.curso_id = $1
       ORDER BY l.orden`,
      [curso.id]
    );

    curso.secciones = secciones.rows.map(sec => ({
      ...sec,
      lecciones: lecciones.rows.filter(l => l.seccion_id === sec.id),
    }));

    res.json({ curso });
  } catch (e) { next(e); }
}

module.exports = { listar, obtener };
