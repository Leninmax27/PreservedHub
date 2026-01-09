const express = require('express');
const router = express.Router();

const Reserva = require('../models/reserva.model');
const Espacio = require('../models/espacio.model');
const Recurso = require('../models/recurso.model');
const authMiddleware = require('../middlewares/auth.middleware'); // usamos JWT

const { calcularPronosticoPorFacultad } = require('../pronostico');



const ESTADOS_CONFLICTO = ['PENDIENTE', 'CONFIRMADA'];


const existeConflictoEspacio = async (espacioId, fechaInicio, fechaFin, reservaIdExcluir = null) => {
  const filtro = {
    espacio: espacioId,
    estado: { $in: ESTADOS_CONFLICTO },
    
    fechaInicio: { $lt: fechaFin },
    fechaFin: { $gt: fechaInicio },
  };

  if (reservaIdExcluir) {
    filtro._id = { $ne: reservaIdExcluir };
  }

  const conflicto = await Reserva.findOne(filtro);
  return !!conflicto;
};

/**
 * Helper: verifica si hay conflicto con alguno de los recursos solicitados
 */
const existeConflictoRecursos = async (recursosIds, fechaInicio, fechaFin, reservaIdExcluir = null) => {
  if (!recursosIds || recursosIds.length === 0) return false;

  const filtro = {
    recursos: { $in: recursosIds }, 
    estado: { $in: ESTADOS_CONFLICTO },
    fechaInicio: { $lt: fechaFin },
    fechaFin: { $gt: fechaInicio },
  };

  if (reservaIdExcluir) {
    filtro._id = { $ne: reservaIdExcluir };
  }

  const conflicto = await Reserva.findOne(filtro);
  return !!conflicto;
};

/**
 * GET /api/reservas
 * Lista reservas (con filtros opcionales)
 */
router.get('/:id', async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('usuario', 'nombre apellido correo rol')
      .populate('espacio', 'nombre tipo codigo')
      .populate({
        path: 'materia',
        populate: [
          {
            path: 'carrera',
            populate: { path: 'facultad' },
          },
          {
            path: 'facultad',
          },
        ],
      })
      .populate('recursos', 'nombre tipo codigoInventario');

    if (!reserva) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json(reserva);
  } catch (error) {
    console.error('Error al obtener reserva:', error);
    res.status(500).json({ message: 'Error al obtener la reserva' });
  }
});

/**
 * GET /api/reservas/:id
 */
router.get('/', async (req, res) => {
  try {
    const { usuario, espacio, estado, desde, hasta } = req.query;
    const filtro = {};

    if (usuario) filtro.usuario = usuario;
    if (espacio) filtro.espacio = espacio;
    if (estado) filtro.estado = estado;

    if (desde || hasta) {
      filtro.fechaInicio = {};
      if (desde) filtro.fechaInicio.$gte = new Date(desde);
      if (hasta) filtro.fechaInicio.$lte = new Date(hasta);
    }

    const reservas = await Reserva.find(filtro)
      .populate('usuario', 'nombre apellido correo rol')
      .populate('espacio', 'nombre tipo codigo')
      .populate('recursos', 'nombre tipo codigoInventario')
      .populate({
        path: 'materia',
        populate: {
          path: 'carrera',
          populate: { path: 'facultad' },
        },
      })
      .sort({ fechaInicio: -1 });

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ message: 'Error al obtener las reservas' });
  }
});

/**
 * GET /api/reservas/mis-reservas
 * Lista reservas del usuario autenticado
 */
router.get('/usuario/mis-reservas', authMiddleware, async (req, res) => {
  try {
    const reservas = await Reserva.find({ usuario: req.usuario.id })
      .populate('espacio', 'nombre tipo codigo')
      .populate('recursos', 'nombre tipo codigoInventario')
      .populate('materia', 'nombre codigo')
      .sort({ fechaInicio: -1 });

    res.json(reservas);
  } catch (error) {
    console.error('Error al obtener reservas del usuario:', error);
    res.status(500).json({ message: 'Error al obtener tus reservas' });
  }
});

/**
 * POST /api/reservas
 * Crea una nueva reserva con validación de choques de horario
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      espacio,
      recursos = [],
      materia,
      fechaInicio,
      fechaFin,
      motivo,
    } = req.body;

    // 1. Validar fechas
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    if (isNaN(fechaInicioDate) || isNaN(fechaFinDate)) {
      return res.status(400).json({ message: 'Fechas inválidas' });
    }

    if (fechaInicioDate >= fechaFinDate) {
      return res.status(400).json({
        message: 'La fecha de inicio debe ser menor que la fecha de fin',
      });
    }

    
    // 2. Validar estado del espacio
    const espacioDoc = await Espacio.findById(espacio);
    if (!espacioDoc) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }

    if (espacioDoc.estado !== 'ACTIVO') {
      return res.status(400).json({
        message: `El espacio no está disponible (estado: ${espacioDoc.estado})`,
      });
    }

    // 3. Validar choques de horario en el espacio
    const hayConflictoEspacio = await existeConflictoEspacio(
      espacio,
      fechaInicioDate,
      fechaFinDate
    );

    if (hayConflictoEspacio) {
      return res.status(409).json({
        message: 'Ya existe una reserva para ese espacio en el rango de tiempo indicado',
      });
    }

    // 4. Validar choques de horario en recursos (si se envían)
    const hayConflictoRecursos = await existeConflictoRecursos(
      recursos,
      fechaInicioDate,
      fechaFinDate
    );

    if (hayConflictoRecursos) {
      return res.status(409).json({
        message: 'Uno o más recursos ya están reservados en ese rango de tiempo',
      });
    }

    // 5. Crear la reserva (usuario viene del token)
    const nuevaReserva = new Reserva({
      usuario: req.usuario.id,
      espacio,
      recursos,
      materia,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate,
      motivo,
      estado: 'PENDIENTE',
    });

    const guardada = await nuevaReserva.save();
    res.status(201).json(guardada);
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ message: 'Error al crear la reserva' });
  }
});

/**
 * PUT /api/reservas/:id
 * Actualiza una reserva (también con validación de choques)
 * Idealmente usarás reglas de negocio: solo PENDIENTE se puede editar, etc.
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      espacio,
      recursos = [],
      materia,
      fechaInicio,
      fechaFin,
      motivo,
      estado,
    } = req.body;

    const reservaExistente = await Reserva.findById(req.params.id);
    if (!reservaExistente) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // (Opcional) validar que el usuario sea dueño o que sea admin
    // if (req.usuario.rol !== 'ADMIN' && reservaExistente.usuario.toString() !== req.usuario.id) { ... }

    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    if (isNaN(fechaInicioDate) || isNaN(fechaFinDate)) {
      return res.status(400).json({ message: 'Fechas inválidas' });
    }

    if (fechaInicioDate >= fechaFinDate) {
      return res.status(400).json({
        message: 'La fecha de inicio debe ser menor que la fecha de fin',
      });
    }

    // Validar estado del espacio
    const espacioId = espacio || reservaExistente.espacio;
    const espacioDoc = await Espacio.findById(espacioId);
    if (!espacioDoc) {
      return res.status(404).json({ message: 'Espacio no encontrado' });
    }
    if (espacioDoc.estado !== 'ACTIVO') {
      return res.status(400).json({
        message: `El espacio no está disponible (estado: ${espacioDoc.estado})`,
      });
    }

    // Validar choque de horarios en espacio (excluyendo la propia reserva)
    const hayConflictoEspacio = await existeConflictoEspacio(
      espacioId,
      fechaInicioDate,
      fechaFinDate,
      reservaExistente._id
    );

    if (hayConflictoEspacio) {
      return res.status(409).json({
        message: 'Ya existe otra reserva para ese espacio en el rango de tiempo indicado',
      });
    }

    // Validar choque de horarios en recursos
    const recursosIds = recursos.length > 0 ? recursos : reservaExistente.recursos;
    const hayConflictoRecursos = await existeConflictoRecursos(
      recursosIds,
      fechaInicioDate,
      fechaFinDate,
      reservaExistente._id
    );

    if (hayConflictoRecursos) {
      return res.status(409).json({
        message: 'Uno o más recursos ya están reservados en ese rango de tiempo',
      });
    }

    // Actualizar
    reservaExistente.espacio = espacioId;
    reservaExistente.recursos = recursosIds;
    reservaExistente.materia = materia || reservaExistente.materia;
    reservaExistente.fechaInicio = fechaInicioDate;
    reservaExistente.fechaFin = fechaFinDate;
    reservaExistente.motivo = motivo || reservaExistente.motivo;
    if (estado) reservaExistente.estado = estado;

    const actualizada = await reservaExistente.save();

    res.json(actualizada);
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ message: 'Error al actualizar la reserva' });
  }
});

/**
 * PATCH /api/reservas/:id/estado
 * Cambia solo el estado (ej: CANCELADA, CONFIRMADA, etc.)
 */
router.patch('/:id/estado', authMiddleware, async (req, res) => {
  try {
    const { estado } = req.body;

    const actualizada = await Reserva.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json(actualizada);
  } catch (error) {
    console.error('Error al cambiar estado de reserva:', error);
    res.status(500).json({ message: 'Error al cambiar el estado de la reserva' });
  }
});


router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const eliminada = await Reserva.findByIdAndDelete(req.params.id);

    if (!eliminada) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error);
    res.status(500).json({ message: 'Error al eliminar la reserva' });
  }
});


//Nuevo endpoint para el pronóstico

router.get('/pronostico/facultad/:id', async (req, res) => {
  try {
    const facultadId = req.params.id;
    const crecimiento = parseFloat(req.query.crecimiento || '0.2');
    const meses = req.query.meses;
    const estrategia = req.query.estrategia;

    const data = await calcularPronosticoPorFacultad({
      facultadId,
      crecimiento,
      meses,
      estrategia,
    });

    res.json(data);
  } catch (error) {
    console.error('Error en pronóstico por facultad:', error);
    res.status(500).json({ message: 'Error al calcular pronóstico' });
  }
});



module.exports = router;