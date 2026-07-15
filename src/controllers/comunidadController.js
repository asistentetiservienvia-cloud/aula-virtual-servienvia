const db = require('../db');

// --- PREGUNTAS (Q&A por Lección) ---

async function listarPreguntasLeccion(req, res, next) {
  try {
    const leccionId = req.params.leccionId;
    const { rows } = await db.query(
      `SELECT p.id, p.texto, p.fecha, p.util_count, u.nombre AS autor, u.rol AS rol_autor
       FROM preguntas p
       JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.leccion_id = $1
       ORDER BY p.fecha DESC`,
      [leccionId]
    );
    res.json({ preguntas: rows });
  } catch (e) { next(e); }
}

async function crearPregunta(req, res, next) {
  try {
    const leccionId = req.params.leccionId;
    const { texto } = req.body;
    if (!texto) return res.status(400).json({ error: 'El texto es requerido' });

    const { rows } = await db.query(
      `INSERT INTO preguntas (leccion_id, usuario_id, texto) 
       VALUES ($1, $2, $3) RETURNING id, texto, fecha`,
      [leccionId, req.usuario.id, texto]
    );
    res.status(201).json({ pregunta: rows[0] });
  } catch (e) { next(e); }
}

// --- RESEÑAS (Por Curso) ---

async function listarResenasCurso(req, res, next) {
  try {
    const cursoId = req.params.cursoId;
    const { rows } = await db.query(
      `SELECT r.id, r.calificacion, r.comentario, r.fecha, u.nombre AS autor
       FROM resenas r
       JOIN usuarios u ON u.id = r.usuario_id
       WHERE r.curso_id = $1
       ORDER BY r.fecha DESC`,
      [cursoId]
    );
    res.json({ resenas: rows });
  } catch (e) { next(e); }
}

async function crearResena(req, res, next) {
  try {
    const cursoId = req.params.cursoId;
    const { calificacion, comentario } = req.body;
    
    if (calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ error: 'La calificación debe estar entre 1 y 5' });
    }

    const { rows } = await db.query(
      `INSERT INTO resenas (curso_id, usuario_id, calificacion, comentario)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (curso_id, usuario_id) 
       DO UPDATE SET calificacion = EXCLUDED.calificacion, comentario = EXCLUDED.comentario, fecha = now()
       RETURNING id, calificacion, comentario, fecha`,
      [cursoId, req.usuario.id, calificacion, comentario || null]
    );

    // Actualizar el promedio del curso
    await db.query(
      `UPDATE cursos 
       SET calificacion_promedio = (SELECT ROUND(AVG(calificacion), 1) FROM resenas WHERE curso_id = $1),
           num_valoraciones = (SELECT COUNT(*) FROM resenas WHERE curso_id = $1)
       WHERE id = $1`,
      [cursoId]
    );

    res.status(201).json({ resena: rows[0] });
  } catch (e) { next(e); }
}

module.exports = {
  listarPreguntasLeccion,
  crearPregunta,
  listarResenasCurso,
  crearResena
};
