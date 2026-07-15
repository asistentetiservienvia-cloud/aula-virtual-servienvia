// Acceso a PostgreSQL mediante un pool de conexiones.
// El pool es inyectable (setPool) para poder usar una BD en memoria en las pruebas.
const { Pool } = require('pg');
const { config } = require('./config');

let pool = null;

function getPool() {
  if (!pool) {
    const conn = config.databaseUrl;
    // Neon y la mayoría de servicios de PostgreSQL gestionados exigen SSL.
    // En local (localhost) no se usa SSL.
    const usaSsl = /sslmode=require/.test(conn) || /neon\.tech/.test(conn) || process.env.DATABASE_SSL === 'true';
    pool = new Pool({
      connectionString: conn,
      ssl: usaSsl ? { rejectUnauthorized: false } : false,
    });
  }
  return pool;
}

// Permite inyectar un pool alternativo (p. ej. pg-mem en los tests).
function setPool(externalPool) {
  pool = externalPool;
}

// Helper para ejecutar consultas: db.query('SELECT ...', [params])
function query(text, params) {
  return getPool().query(text, params);
}

module.exports = { query, getPool, setPool };
