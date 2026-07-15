const { Pool } = require('pg');
require('dotenv').config();

const conn = process.env.DATABASE_URL;
if(!conn) { console.error('No DATABASE_URL'); process.exit(1); }

const usaSsl = /sslmode=require/.test(conn) || /neon\.tech/.test(conn) || process.env.DATABASE_SSL === 'true';
const pool = new Pool({ connectionString: conn, ssl: usaSsl ? { rejectUnauthorized: false } : false });

(async () => {
  try {
    await pool.query("UPDATE categorias SET icono = '💻' WHERE nombre = 'Programación'");
    await pool.query("UPDATE categorias SET icono = '🎨' WHERE nombre = 'Diseño'");
    await pool.query("UPDATE categorias SET icono = '💼' WHERE nombre = 'Negocios'");
    await pool.query("UPDATE categorias SET icono = '📈' WHERE nombre = 'Marketing'");
    await pool.query("UPDATE categorias SET icono = '📊' WHERE nombre = 'Ciencia de Datos'");
    await pool.query("UPDATE categorias SET icono = '🌐' WHERE nombre = 'Idiomas'");
    await pool.query("UPDATE categorias SET icono = '📷' WHERE nombre = 'Foto y Video'");
    await pool.query("UPDATE categorias SET icono = '🎵' WHERE nombre = 'Música'");
    console.log('DB Updated');
  } catch(e) {
    console.error(e);
  } finally {
    await pool.end();
  }
})();
