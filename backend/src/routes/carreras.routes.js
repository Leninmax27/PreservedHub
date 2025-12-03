const express = require('express');
const router = express.Router();
const Carrera = require('../models/carrera.model');

// GET /api/carreras
router.get('/', async (req, res) => {
  try {
    const { estado, facultad } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (facultad) filtro.facultad = facultad;

    const carreras = await Carrera.find(filtro)
      .populate('facultad', 'nombre codigo')
      .sort({ nombre: 1 });

    res.json(carreras);
  } catch (error) {
    console.error('Error al obtener carreras:', error);
    res.status(500).json({ message: 'Error al obtener carreras' });
  }
});

// GET /api/carreras/facultad/:facultadId
router.get('/facultad/:facultadId', async (req, res) => {
  try {
    const { facultadId } = req.params;

    const carreras = await Carrera.find({
      facultad: facultadId,
      estado: 'ACTIVA',
    })
      .populate('facultad', 'nombre codigo')
      .sort({ nombre: 1 });

    res.json(carreras);
  } catch (error) {
    console.error('Error al listar carreras por facultad:', error);
    res.status(500).json({ message: 'Error al obtener carreras' });
  }
});

// GET /api/carreras/:id
router.get('/:id', async (req, res) => {
  try {
    const carrera = await Carrera.findById(req.params.id).populate(
      'facultad',
      'nombre codigo'
    );
    if (!carrera) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }
    res.json(carrera);
  } catch (error) {
    console.error('Error al obtener carrera:', error);
    res.status(500).json({ message: 'Error al obtener la carrera' });
  }
});

// POST /api/carreras
router.post('/', async (req, res) => {
  try {
    const { nombre, codigo, facultad } = req.body;

    const nuevaCarrera = new Carrera({
      nombre,
      codigo,
      facultad,
    });

    const guardada = await nuevaCarrera.save();
    res.status(201).json(guardada);
  } catch (error) {
    console.error('Error al crear carrera:', error);
    res.status(500).json({ message: 'Error al crear la carrera' });
  }
});

// PUT /api/carreras/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, codigo, facultad, estado } = req.body;

    const actualizada = await Carrera.findByIdAndUpdate(
      req.params.id,
      { nombre, codigo, facultad, estado },
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }

    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar carrera:', error);
    res.status(500).json({ message: 'Error al actualizar la carrera' });
  }
});

// PATCH /api/carreras/:id/estado
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;

    const actualizada = await Carrera.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Carrera no encontrada' });
    }

    res.json(actualizada);
  } catch (error) {
    console.error('Error al cambiar estado de carrera:', error);
    res.status(500).json({ message: 'Error al cambiar el estado' });
  }
});

module.exports = router;
