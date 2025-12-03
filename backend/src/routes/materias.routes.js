const express = require('express');
const router = express.Router();

const Materia = require('../models/materia.model');
const authMiddleware = require('../middlewares/auth.middleware');
const { esAdmin } = require('../middlewares/role.middleware');

//
// 1) RUTA PARA USUARIOS (estudiante/docente) -> materias por carrera
//    GET /api/materias/carrera/:carreraId
//
router.get(
  '/carrera/:carreraId',
  authMiddleware,
  async (req, res) => {
    try {
      const { carreraId } = req.params;

      const materias = await Materia.find({
        carrera: carreraId,
        estado: 'ACTIVA',
      }).sort({ nombre: 1 });

      res.json(materias);
    } catch (error) {
      console.error('Error al listar materias por carrera:', error);
      res.status(500).json({ message: 'Error al obtener materias' });
    }
  }
);

//
// DESDE AQUÍ SOLO ADMIN
//
router.use(authMiddleware, esAdmin);

//
// GET /api/materias
//
router.get('/', async (req, res, next) => {
  try {
    const materias = await Materia.find()
      .populate('facultad')
      .populate('carrera')
      .sort({ nombre: 1 });

    res.json(materias);
  } catch (error) {
    console.error('Error al listar materias:', error);
    next(error);
  }
});

//
// POST /api/materias
//
router.post('/', async (req, res, next) => {
  try {
    const {
      nombre,
      codigo,
      facultad,
      carrera,
      descripcion,
      creditos,
      semestre,
    } = req.body;

    const nueva = new Materia({
      nombre,
      codigo,
      facultad,
      carrera,
      descripcion,
      creditos,
      semestre,
      estado: 'ACTIVA',
    });

    const guardada = await nueva.save();
    res.status(201).json(guardada);
  } catch (error) {
    console.error('Error al crear materia:', error);
    next(error);
  }
});

//
// PUT /api/materias/:id
//
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      codigo,
      facultad,
      carrera,
      descripcion,
      creditos,
      semestre,
      estado,
    } = req.body;

    const actualizada = await Materia.findByIdAndUpdate(
      id,
      {
        nombre,
        codigo,
        facultad,
        carrera,
        descripcion,
        creditos,
        semestre,
        estado,
      },
      { new: true }
    )
      .populate('facultad')
      .populate('carrera');

    if (!actualizada) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar materia:', error);
    next(error);
  }
});

//
// PATCH /api/materias/:id/estado
//
router.patch('/:id/estado', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const actualizada = await Materia.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Materia no encontrada' });
    }

    res.json(actualizada);
  } catch (error) {
    console.error('Error al cambiar estado de materia:', error);
    next(error);
  }
});

module.exports = router;
