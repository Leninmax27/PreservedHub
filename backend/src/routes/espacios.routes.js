const express = require('express');
const router = express.Router();
const Espacio = require('../models/espacio.model');

// GET /api/espacios?facultad=:id
router.get('/', async (req, res) => {
  try {
    const { facultad } = req.query;
    const filtro = {};

    if (facultad) {
      filtro.facultad = facultad;
    }

    const espacios = await Espacio.find(filtro)
      .populate('facultad', 'nombre codigo')
      .sort({ nombre: 1 });

    res.json(espacios);
  } catch (error) {
    console.error('Error al listar espacios:', error);
    res.status(500).json({ message: 'Error al obtener espacios' });
  }
});

// GET /api/espacios/:id
router.get('/:id', async (req, res) => {
  try {
    const espacio = await Espacio.findById(req.params.id).populate(
      'facultad',
      'nombre codigo'
    );

    if (!espacio) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    res.json(espacio);
  } catch (error) {
    console.error('Error al obtener espacio:', error);
    res.status(500).json({ message: 'Error al obtener el espacio' });
  }
});

// POST /api/espacios
router.post('/', async (req, res) => {
  try {
    const { nombre, codigo, tipo, capacidad, ubicacion, facultad, estado } =
      req.body;

    const nuevoEspacio = new Espacio({
      nombre,
      codigo,
      tipo,
      capacidad,
      ubicacion,
      facultad,
      estado,
    });

    const guardado = await nuevoEspacio.save();
    const poblado = await guardado.populate('facultad', 'nombre codigo');

    res.status(201).json(poblado);
  } catch (error) {
    console.error('Error al crear espacio:', error);
    res.status(500).json({ message: 'Error al crear el espacio' });
  }
});

// PUT /api/espacios/:id
router.put('/:id', async (req, res) => {
  try {
    const { nombre, codigo, tipo, capacidad, ubicacion, facultad, estado } =
      req.body;

    const actualizado = await Espacio.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        codigo,
        tipo,
        capacidad,
        ubicacion,
        facultad,
        estado,
      },
      { new: true, runValidators: true }
    ).populate('facultad', 'nombre codigo');

    if (!actualizado) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar espacio:', error);
    res.status(500).json({ message: 'Error al actualizar el espacio' });
  }
});

// DELETE /api/espacios/:id
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await Espacio.findByIdAndDelete(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    res.json({ message: 'Espacio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar espacio:', error);
    res.status(500).json({ message: 'Error al eliminar el espacio' });
  }
});

module.exports = router;
