// src/app.js
const express = require('express');
const cors = require('cors');
//grafica
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
const coreRoutes = require('./routes/core.routes');

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ReserveHUB backend is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Rutas principales de la API
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuarios', require('./routes/usuarios.routes'));
app.use('/api/facultades', require('./routes/facultades.routes'));
app.use('/api/carreras', require('./routes/carreras.routes'));
app.use('/api/materias', require('./routes/materias.routes'));
app.use('/api/espacios', require('./routes/espacios.routes'));
app.use('/api/recursos', require('./routes/recursos.routes'));
app.use('/api/reservas', require('./routes/reservas.routes'));
app.use('/api/tickets', require('./routes/tickets.routes'));
//Grafica
app.use('/api/core', coreRoutes);




// Aquí luego montaremos más rutas:
// app.use('/api/auth', require('./routes/auth.routes'));
// app.use('/api/usuarios', require('./routes/usuarios.routes'));

// Middleware de ruta no encontrada (opcional desde ya)
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada',
  });
});

// Middleware de manejo de errores generales (básico)
app.use((err, req, res, next) => {
  console.error('Error interno:', err);
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor',
  });
});

module.exports = app;
