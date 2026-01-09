
const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket.model');



const generarCodigoTicket = () => {
  const timestamp = Date.now(); // milisegundos
  return `RHB-${timestamp}`;
};

// GET /api/tickets
// Filtros opcionales: usuario, reserva, estado
router.get('/', async (req, res) => {
  try {
    const { usuario, reserva, estado } = req.query;
    const filtro = {};

    if (usuario) filtro.usuario = usuario;
    if (reserva) filtro.reserva = reserva;
    if (estado) filtro.estado = estado;

    const tickets = await Ticket.find(filtro)
      .populate('usuario', 'nombre apellido correo')
      .populate('reserva')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    console.error('Error al obtener tickets:', error);
    res.status(500).json({ message: 'Error al obtener tickets' });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('usuario', 'nombre apellido correo')
      .populate('reserva');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({ message: 'Error al obtener el ticket' });
  }
});

// GET /api/tickets/reserva/:reservaId
// Para obtener el ticket asociado a una reserva específica
router.get('/reserva/:reservaId', async (req, res) => {
  try {
    const { reservaId } = req.params;

    const ticket = await Ticket.findOne({ reserva: reservaId })
      .populate('usuario', 'nombre apellido correo')
      .populate('reserva');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado para esa reserva' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error al obtener ticket por reserva:', error);
    res.status(500).json({ message: 'Error al obtener el ticket' });
  }
});

// POST /api/tickets
// Crea un ticket para una reserva
// Por ahora recibe usuario y reserva en el body
router.post('/', async (req, res) => {
  try {
    let { codigo, reserva, usuario } = req.body;

    if (!codigo) {
      codigo = generarCodigoTicket();
    }

    const nuevoTicket = new Ticket({
      codigo,
      reserva,
      usuario,
    });

    const guardado = await nuevoTicket.save();
    res.status(201).json(guardado);
  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({ message: 'Error al crear el ticket' });
  }
});

// PATCH /api/tickets/:id/estado
// Cambia el estado del ticket: EMITIDO, USADO, CANCELADO
router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;

    const actualizado = await Ticket.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    console.error('Error al cambiar estado de ticket:', error);
    res.status(500).json({ message: 'Error al cambiar el estado del ticket' });
  }
});

module.exports = router;
