const { Schema, model } = require('mongoose');

const FacultadSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true }, // ej: FICA, FING
    descripcion: { type: String, trim: true },
    estado: {
      type: String,
      enum: ['ACTIVA', 'INACTIVA'],
      default: 'ACTIVA',
    },
  },
  { timestamps: true }
);

module.exports = model('Facultad', FacultadSchema);
