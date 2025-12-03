// src/models/ticket.model.js
const { Schema, model } = require('mongoose');

const TicketSchema = new Schema(
  {
    codigo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true, // ej: RHB-2025-000123
    },
    reserva: {
      type: Schema.Types.ObjectId,
      ref: 'Reserva',
      required: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    estado: {
      type: String,
      enum: ['EMITIDO', 'USADO', 'CANCELADO'],
      default: 'EMITIDO',
    },
  },
  { timestamps: true }
);

module.exports = model('Ticket', TicketSchema);
