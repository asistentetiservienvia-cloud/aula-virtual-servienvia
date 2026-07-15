// Modo demo: arranca la API con una base de datos PostgreSQL EN MEMORIA (pg-mem),
// precargada con el schema.sql y seed.sql. Útil para probar todo de extremo a extremo
// sin instalar PostgreSQL. NO usar en producción.
const fs = require('fs');
const path = require('path');
const { newDb } = require('pg-mem');
const db = require('./db');
const { crearApp } = require('./app');
const { config } = require('./config');

const mem = newDb();
mem.public.registerFunction({
  name: 'now',
  returns: require('pg-mem').DataType.timestamp,
  implementation: () => new Date(),
});

const schema = fs.readFileSync(path.join(__dirname, '..', 'sql', 'schema.sql'), 'utf8');
const seed = fs.readFileSync(path.join(__dirname, '..', 'sql', 'seed.sql'), 'utf8');

mem.public.none(schema);
mem.public.none(seed);

const { Pool } = mem.adapters.createPg();
db.setPool(new Pool());

const app = crearApp();
app.listen(config.port, () => {
  console.log('====================================================');
  console.log('  AULA VIRTUAL SERVIENVIA — MODO DEMO');
  console.log('  Base de datos PostgreSQL en memoria (pg-mem)');
  console.log(`  Servidor:  http://localhost:${config.port}`);
  console.log('');
  console.log('  Cuentas demo (contraseña: servienvia2026):');
  console.log('    admin@servienvia.com   (administrador)');
  console.log('    maria@servienvia.com   (estudiante)');
  console.log('    carlos@servienvia.com  (instructor)');
  console.log('====================================================');
});
