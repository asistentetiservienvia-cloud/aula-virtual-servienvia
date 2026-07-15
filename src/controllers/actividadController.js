// Actividad de estudio del usuario: alimenta las rachas y los minutos del Dashboard.
const db = require('../db');

function aISO(fecha) {
  if (fecha instanceof Date) return fecha.toISOString().slice(0, 10);
  return String(fecha).slice(0, 10);
}

// GET /api/actividad  -> días recientes + racha consecutiva + minutos de la semana
async function listar(req, res, next) {
  try {
    const { rows } = await db.query(
      'SELECT fecha, minutos FROM actividad WHERE usuario_id = $1 ORDER BY fecha DESC LIMIT 30',
      [req.usuario.id]
    );
    const dias = rows.map(r => ({ fecha: aISO(r.fecha), minutos: Number(r.minutos) }));
    const porFecha = new Map(dias.map(d => [d.fecha, d.minutos]));

    const hoy = new Date();
    const clave = (offset) => {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - offset);
      return d.toISOString().slice(0, 10);
    };

    // Racha: días consecutivos hasta hoy con minutos > 0
    let racha = 0;
    for (let i = 0; ; i++) {
      const k = clave(i);
      if (porFecha.has(k) && porFecha.get(k) > 0) racha++;
      else break;
    }

    // Minutos de los últimos 7 días
    let minutosSemana = 0;
    for (let i = 0; i < 7; i++) {
      const k = clave(i);
      if (porFecha.has(k)) minutosSemana += porFecha.get(k);
    }

    res.json({ actividad: dias, racha_dias: racha, minutos_semana: minutosSemana });
  } catch (e) { next(e); }
}

// POST /api/actividad  { minutos }  -> suma minutos de estudio al día de hoy
async function registrar(req, res, next) {
  try {
    const minutos = Number(req.body.minutos);
    if (!minutos || minutos <= 0) return res.status(400).json({ error: 'minutos debe ser un número positivo', codigo: 'datos_invalidos' });

    const hoy = new Date().toISOString().slice(0, 10);
    const manana = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    // Buscamos la fila de hoy por rango [hoy, mañana) para tolerar columnas date o timestamp.
    const existe = await db.query(
      'SELECT id FROM actividad WHERE usuario_id = $1 AND fecha >= $2 AND fecha < $3',
      [req.usuario.id, hoy, manana]
    );
    if (existe.rows.length) {
      await db.query('UPDATE actividad SET minutos = minutos + $1 WHERE id = $2', [minutos, existe.rows[0].id]);
    } else {
      await db.query('INSERT INTO actividad (usuario_id, fecha, minutos) VALUES ($1, $2, $3)', [req.usuario.id, hoy, minutos]);
    }
    res.status(201).json({ ok: true, fecha: hoy, minutos_agregados: minutos });
  } catch (e) { next(e); }
}

module.exports = { listar, registrar };
