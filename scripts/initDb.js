// Inicializa una base de datos PostgreSQL real (p. ej. Neon) aplicando
// schema.sql y seed.sql. Pensado para ejecutarse UNA vez sobre una BD vacía.
//
// Uso (desde la carpeta backend):
//   DATABASE_URL="postgresql://usuario:clave@host/db?sslmode=require" npm run db:init
//
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const conn = process.env.DATABASE_URL;
if (!conn) {
  console.error('ERROR: falta la variable DATABASE_URL.');
  console.error('Ejemplo: DATABASE_URL="postgresql://...:...@...neon.tech/db?sslmode=require" npm run db:init');
  process.exit(1);
}

const usaSsl = /sslmode=require/.test(conn) || /neon\.tech/.test(conn) || process.env.DATABASE_SSL === 'true';
const pool = new Pool({ connectionString: conn, ssl: usaSsl ? { rejectUnauthorized: false } : false });

(async () => {
  try {
    const schema = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
    const seed = fs.readFileSync(path.join(__dirname, '..', 'sql', 'seed.sql'), 'utf8');

    // ¿El esquema ya existe? (to_regclass devuelve null si la tabla no existe)
    const ya = await pool.query("SELECT to_regclass('public.usuarios') AS t");
    if (ya.rows[0].t) {
      console.log('→ El esquema ya existe: omitiendo schema.sql.');
    } else {
      console.log('→ Aplicando schema.sql (creando tablas)...');
      await pool.query(schema);
      console.log('  ✓ Esquema creado.');
    }

    // Verificar si el seed ya fue aplicado (evita duplicados)
    const { rows } = await pool.query('SELECT COUNT(*) AS n FROM usuarios');
    if (Number(rows[0].n) > 0) {
      console.log('→ La base de datos ya tiene datos: omitiendo seed.sql.');
    } else {
      console.log('→ Aplicando seed.sql (datos de ejemplo)...');
      await pool.query(seed);
      console.log('  ✓ Datos de ejemplo cargados.');
    }

    console.log('\n¡Base de datos inicializada con éxito!');
    console.log('Cuentas demo (contraseña: servienvia2026): admin@servienvia.com, valentina@servienvia.com, carlos@servienvia.com');
  } catch (e) {
    console.error('\nERROR al inicializar la base de datos:', e.message);
    console.error('Si las tablas ya existían, primero vacía la base de datos o usa una nueva.');
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
