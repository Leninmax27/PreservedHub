const express = require('express');
const router = express.Router();
const Recurso = require('../models/recurso.model');

// GET /api/recursos
// Filtros opcionales: facultad, espacio, tipo, estado
router.get('/', async (req, res) => {
  try {
    const { facultad, espacio, tipo, estado } = req.query;
    const filtro = {};

    if (facultad) {
      filtro.facultad = facultad;
    }

    if (espacio) {
      filtro.espacio = espacio;
    }

    if (tipo) {
      filtro.tipo = tipo;
    }

    if (estado) {
      filtro.estado = estado;
    }

    const recursos = await Recurso.find(filtro)
      .populate('facultad', 'nombre codigo')
      .populate('espacio', 'nombre codigo')
      .sort({ nombre: 1 });

    res.json(recursos);
  } catch (error) {
    console.error('Error al listar recursos:', error);
    res.status(500).json({ message: 'Error al obtener recursos' });
  }
});

// GET /api/recursos/:id
router.get('/:id', async (req, res) => {
  try {
    const recurso = await Recurso.findById(req.params.id)
      .populate('facultad', 'nombre codigo')
      .populate('espacio', 'nombre codigo');

    if (!recurso) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    res.json(recurso);
  } catch (error) {
    console.error('Error al obtener recurso:', error);
    res.status(500).json({ message: 'Error al obtener el recurso' });
  }
});

// POST /api/recursos
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      tipo,
      codigoInventario,
      descripcion,
      facultad,
      espacio,
      cantidad,
      estado,
    } = req.body;

    if (!nombre || !tipo || !facultad) {
      return res
        .status(400)
        .json({ message: 'Nombre, tipo y facultad son obligatorios' });
    }

    const nuevoRecurso = new Recurso({
      nombre,
      tipo,
      codigoInventario,
      descripcion,
      facultad,
      espacio: espacio || null,
      cantidad,
      estado,
    });

    const guardado = await nuevoRecurso.save();
    const poblado = await guardado
      .populate('facultad', 'nombre codigo')
      .populate('espacio', 'nombre codigo');

    res.status(201).json(poblado);
  } catch (error) {
    console.error('Error al crear recurso:', error);
    res.status(500).json({ message: 'Error al crear el recurso' });
  }
});

// PUT /api/recursos/:id
router.put('/:id', async (req, res) => {
  try {
    const {
      nombre,
      tipo,
      codigoInventario,
      descripcion,
      facultad,
      espacio,
      cantidad,
      estado,
    } = req.body;

    const actualizado = await Recurso.findByIdAndUpdate(
      req.params.id,
      {
        nombre,
        tipo,
        codigoInventario,
        descripcion,
        facultad,
        espacio: espacio || null,
        cantidad,
        estado,
      },
      { new: true, runValidators: true }
    )
      .populate('facultad', 'nombre codigo')
      .populate('espacio', 'nombre codigo');

    if (!actualizado) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar recurso:', error);
    res.status(500).json({ message: 'Error al actualizar el recurso' });
  }
});

// DELETE /api/recursos/:id
router.delete('/:id', async (req, res) => {
  try {
    const eliminado = await Recurso.findByIdAndDelete(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    res.json({ message: 'Recurso eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar recurso:', error);
    res.status(500).json({ message: 'Error al eliminar el recurso' });
  }
});

// PATCH /api/recursos/:id/estado
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ message: 'El estado es obligatorio' });
    }

    const actualizado = await Recurso.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true, runValidators: true }
    );

    if (!actualizado) {
      return res.status(404).json({ message: 'Recurso no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    console.error('Error al cambiar estado de recurso:', error);
    res.status(500).json({ message: 'Error al cambiar el estado del recurso' });
  }
});

module.exports = router;