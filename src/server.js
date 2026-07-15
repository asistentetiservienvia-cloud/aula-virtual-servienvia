// Punto de entrada: arranca el servidor HTTP.
const { crearApp } = require('./appConfig');
const { config } = require('./config');
const db = require('./db');

// Advertencia visible si el JWT_SECRET es el valor por defecto
if (config.jwtSecret === 'cambia-esto-en-produccion' && config.nodeEnv === 'production') {
  console.error('⚠️  ADVERTENCIA: JWT_SECRET tiene el valor por defecto. Define la variable de entorno JWT_SECRET antes de exponer este servidor.');
  process.exit(1);
}

async function arrancar() {
  // Verificar conexión a la base de datos antes de aceptar peticiones
  try {
    await db.query('SELECT 1');
    console.log('✓ Conexión a la base de datos establecida.');
  } catch (e) {
    console.error('✗ No se pudo conectar a la base de datos:', e.message);
    console.error('  Verifica que DATABASE_URL esté definida y sea correcta.');
    process.exit(1);
  }

  const app = crearApp();
  app.listen(config.port, () => {
    console.log(`✓ Aula Virtual Servienvia API lista en http://localhost:${config.port}`);
    console.log(`  Entorno: ${config.nodeEnv}`);
  });
}

arrancar();
