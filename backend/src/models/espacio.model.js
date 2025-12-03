const { Schema, model } = require('mongoose');

const EspacioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    codigo: { type: String, unique: true, uppercase: true, trim: true },
    tipo: {
      type: String,
      enum: ['AULA', 'LABORATORIO', 'AUDITORIO', 'SALA'],
      required: true,
    },
    capacidad: { type: Number, required: true },
    ubicacion: { type: String, trim: true },
    facultad: {
      type: Schema.Types.ObjectId,
      ref: 'Facultad',
      required: true,
    },
    estado: {
      type: String,
      enum: ['ACTIVO', 'INACTIVO', 'MANTENIMIENTO'],
      default: 'ACTIVO',
    },
  },
  { timestamps: true }
);

module.exports = model('Espacio', EspacioSchema);
