// Inscripciones del usuario y su progreso por lección.
// Todas las operaciones son sobre el usuario autenticado (req.usuario.id).
const db = require('../db');

// GET /api/inscripciones  -> cursos en los que está inscrito el usuario
// Filtros opcionales: ?categoria= &q= &estado=(new|progress|done) &archivado= &favorito=
async function listar(req, res, next) {
  try {
    const cond = ['i.usuario_id = $1'];
    const params = [req.usuario.id];

    if (req.query.categoria) { params.push(req.query.categoria); cond.push(`cat.nombre = $${params.length}`); }
    if (req.query.q) { params.push(`%${req.query.q.toLowerCase()}%`); cond.push(`(LOWER(c.titulo) LIKE $${params.length} OR LOWER(u.nombre) LIKE $${params.length})`); }
    if (req.query.archivado !== undefined) { params.push(req.query.archivado === 'true'); cond.push(`i.archivado = $${params.length}`); }
    if (req.query.favorito !== undefined) { params.push(req.query.favorito === 'true'); cond.push(`i.favorito = $${params.length}`); }
    if (req.query.estado === 'new') cond.push('i.progreso = 0');
    else if (req.query.estado === 'progress') cond.push('i.progreso > 0 AND i.progreso < 100');
    else if (req.query.estado === 'done') cond.push('i.progreso = 100');

    const { rows } = await db.query(
      `SELECT i.id, i.curso_id, i.progreso, i.horas_dedicadas, i.favorito, i.archivado, i.fecha_inscripcion,
              c.titulo, c.calificacion_promedio, c.portada_url,
              u.nombre AS instructor, cat.nombre AS categoria
       FROM inscripciones i
       JOIN cursos c    ON c.id = i.curso_id
       JOIN usuarios u  ON u.id = c.instructor_id
       LEFT JOIN categorias cat ON cat.id = c.categoria_id
       WHERE ${cond.join(' AND ')}
       ORDER BY i.fecha_inscripcion DESC`,
      params
    );
    res.json({ inscripciones: rows, total: rows.length });
  } catch (e) { next(e); }
}

// POST /api/inscripciones  { curso_id }  -> inscribir al usuario en un curso
async function crear(req, res, next) {
  try {
    const { curso_id } = req.body;
    if (!curso_id) return res.status(400).json({ error: 'Falta curso_id', codigo: 'datos_incompletos' });

    const curso = await db.query('SELECT id FROM cursos WHERE id = $1', [curso_id]);
    if (curso.rows.length === 0) return res.status(404).json({ error: 'Curso no encontrado', codigo: 'curso_no_encontrado' });

    const { rows } = await db.query(
      'INSERT INTO inscripciones (usuario_id, curso_id) VALUES ($1, $2) RETURNING *',
      [req.usuario.id, curso_id]
    );
    res.status(201).json({ inscripcion: rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Ya estás inscrito en este curso', codigo: 'ya_inscrito' });
    next(e);
  }
}

// PUT /api/inscripciones/:id  { favorito?, archivado? }
async function actualizar(req, res, next) {
  try {
    const propia = await db.query('SELECT id FROM inscripciones WHERE id = $1 AND usuario_id = $2', [req.params.id, req.usuario.id]);
    if (propia.rows.length === 0) return res.status(404).json({ error: 'Inscripción no encontrada', codigo: 'no_encontrado' });

    const sets = []; const params = [];
    if (req.body.favorito !== undefined) { params.push(!!req.body.favorito); sets.push(`favorito = $${params.length}`); }
    if (req.body.archivado !== undefined) { params.push(!!req.body.archivado); sets.push(`archivado = $${params.length}`); }
    if (sets.length === 0) return res.status(400).json({ error: 'Nada que actualizar', codigo: 'sin_cambios' });

    params.push(req.params.id);
    const { rows } = await db.query(`UPDATE inscripciones SET ${sets.join(', ')} WHERE id = $${params.length} RETURNING *`, params);
    res.json({ inscripcion: rows[0] });
  } catch (e) { next(e); }
}

// GET /api/inscripciones/:id/progreso  -> progreso por lección de esa inscripción
async function obtenerProgreso(req, res, next) {
  try {
    const ins = await db.query('SELECT id, curso_id, progreso FROM inscripciones WHERE id = $1 AND usuario_id = $2', [req.params.id, req.usuario.id]);
    if (ins.rows.length === 0) return res.status(404).json({ error: 'Inscripción no encontrada', codigo: 'no_encontrado' });

    const { rows } = await db.query(
      'SELECT leccion_id, completada, ultima_posicion_segundos FROM progreso_lecciones WHERE inscripcion_id = $1',
      [req.params.id]
    );
    res.json({ inscripcion: ins.rows[0], progreso_lecciones: rows });
  } catch (e) { next(e); }
}

// PUT /api/inscripciones/:id/progreso  { leccion_id, completada, ultima_posicion_segundos? }
// Marca/desmarca una lección y RECALCULA el porcentaje del curso.
async function marcarLeccion(req, res, next) {
  try {
    const { leccion_id, completada, ultima_posicion_segundos } = req.body;
    if (leccion_id === undefined) return res.status(400).json({ error: 'Falta leccion_id', codigo: 'datos_incompletos' });

    const ins = await db.query('SELECT id, curso_id FROM inscripciones WHERE id = $1 AND usuario_id = $2', [req.params.id, req.usuario.id]);
    if (ins.rows.length === 0) return res.status(404).json({ error: 'Inscripción no encontrada', codigo: 'no_encontrado' });
    const cursoId = ins.rows[0].curso_id;

    // Upsert manual (compatible con cualquier PostgreSQL)
    const existe = await db.query('SELECT id FROM progreso_lecciones WHERE inscripcion_id = $1 AND leccion_id = $2', [req.params.id, leccion_id]);
    if (existe.rows.length) {
      const sets = ['completada = $1']; const params = [!!completada];
      if (ultima_posicion_segundos !== undefined) { params.push(ultima_posicion_segundos); sets.push(`ultima_posicion_segundos = $${params.length}`); }
      params.push(existe.rows[0].id);
      await db.query(`UPDATE progreso_lecciones SET ${sets.join(', ')} WHERE id = $${params.length}`, params);
    } else {
      await db.query(
        'INSERT INTO progreso_lecciones (inscripcion_id, leccion_id, completada, ultima_posicion_segundos) VALUES ($1, $2, $3, $4)',
        [req.params.id, leccion_id, !!completada, ultima_posicion_segundos || 0]
      );
    }

    // Recalcular el porcentaje: lecciones completadas / total de lecciones del curso
    const totalRes = await db.query(
      'SELECT COUNT(*) AS n FROM lecciones l JOIN secciones s ON s.id = l.seccion_id WHERE s.curso_id = $1',
      [cursoId]
    );
    const hechasRes = await db.query(
      'SELECT COUNT(*) AS n FROM progreso_lecciones WHERE inscripcion_id = $1 AND completada = TRUE',
      [req.params.id]
    );
    const total = Number(totalRes.rows[0].n) || 0;
    const hechas = Number(hechasRes.rows[0].n) || 0;
    const pct = total ? Math.round((100 * hechas) / total) : 0;
    await db.query('UPDATE inscripciones SET progreso = $1 WHERE id = $2', [pct, req.params.id]);

    res.json({ progreso: pct, lecciones_completadas: hechas, total_lecciones: total });
  } catch (e) { next(e); }
}

module.exports = { listar, crear, actualizar, obtenerProgreso, marcarLeccion };
