// src/models/reserva.model.js
const { Schema, model } = require('mongoose');

const ReservaSchema = new Schema(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
    espacio: {
      type: Schema.Types.ObjectId,
      ref: 'Espacio',
      required: true,
    },
    recursos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Recurso',
      },
    ],
    materia: {
      type: Schema.Types.ObjectId,
      ref: 'Materia',
    },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
    motivo: { type: String, trim: true },

    estado: {
      type: String,
      enum: ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'RECHAZADA', 'FINALIZADA'],
      default: 'PENDIENTE',
    },
  },
  { timestamps: true }
);

module.exports = model('Reserva', ReservaSchema);
