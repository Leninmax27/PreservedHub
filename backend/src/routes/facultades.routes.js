// src/routes/facultades.routes.js
const express = require('express');
const router = express.Router();
const Facultad = require('../models/facultad.model');

// TODO: cuando tengas auth, aquí puedes importar middlewares de autenticación y rol
// const authMiddleware = require('../middlewares/auth.middleware');
// const { esAdmin } = require('../middlewares/role.middleware');

// GET /api/facultades
// Lista todas las facultades (opcionalmente filtradas por estado)
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = {};
    if (estado) {
      filtro.estado = estado;
    }

    const facultades = await Facultad.find(filtro).sort({ nombre: 1 });
    res.json(facultades);
  } catch (error) {
    console.error('Error al obtener facultades:', error);
    res.status(500).json({ message: 'Error al obtener facultades' });
  }
});

// GET /api/facultades/:id
router.get('/:id', async (req, res) => {
  try {
    const facultad = await Facultad.findById(req.params.id);
    if (!facultad) {
      return res.status(404).json({ message: 'Facultad no encontrada' });
    }
    res.json(facultad);
  } catch (error) {
    console.error('Error al obtener facultad:', error);
    res.status(500).json({ message: 'Error al obtener la facultad' });
  }
});

// POST /api/facultades
// (Ideal: solo ADMIN)
router.post('/', async (req, res) => {
  try {
    const { nombre, codigo, descripcion } = req.body;

    const nuevaFacultad = new Facultad({
      nombre,
      codigo,
      descripcion,
    });

    const guardada = await nuevaFacultad.save();
    res.status(201).json(guardada);
  } catch (error) {
    console.error('Error al crear facultad:', error);
    res.status(500).json({ message: 'Error al crear la facultad' });
  }
});

// PUT /api/facultades/:id
// Actualiza datos de la facultad
router.put('/:id', async (req, res) => {
  try {
    const { nombre, codigo, descripcion, estado } = req.body;

    const actualizada = await Facultad.findByIdAndUpdate(
      req.params.id,
      { nombre, codigo, descripcion, estado },
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Facultad no encontrada' });
    }

    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar facultad:', error);
    res.status(500).json({ message: 'Error al actualizar la facultad' });
  }
});

// PATCH /api/facultades/:id/estado
// Cambia solo el estado (ACTIVA / INACTIVA)
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;

    const actualizada = await Facultad.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Facultad no encontrada' });
    }

    res.json(actualizada);
  } catch (error) {
    console.error('Error al cambiar estado de facultad:', error);
    res.status(500).json({ message: 'Error al cambiar el estado' });
  }
});

module.exports = router;
