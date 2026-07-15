// Punto de entrada para Vercel Serverless Functions.
// Vercel invoca este handler para cualquier ruta /api/*.
// La instancia de Express se crea una vez y se reusa entre invocaciones "warm"
// (el pool de PostgreSQL también se reusa gracias al singleton en src/db.js).

const express = require('express'); // Truco para que Vercel detecte la app Express
const { crearApp } = require('./src/appConfig');
const { config } = require('./src/config');

// Aviso claro si el secreto por defecto llega a producción.
if (config.jwtSecret === 'cambia-esto-en-produccion' && config.nodeEnv === 'production') {
  console.error('⚠️  ADVERTENCIA: JWT_SECRET tiene el valor por defecto. Define la variable de entorno JWT_SECRET en Vercel.');
}

const app = crearApp();

// Vercel espera una función (req, res). Express es exactamente eso.
module.exports = app;
