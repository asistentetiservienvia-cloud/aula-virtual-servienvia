// Carga y centraliza la configuración desde variables de entorno.
require('dotenv').config();

const config = {
  port: process.env.PORT || 4000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/aulavirtual',
  jwtSecret: process.env.JWT_SECRET || 'cambia-esto-en-produccion',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = { config };
