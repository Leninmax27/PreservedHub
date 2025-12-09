// src/models/recurso.model.js
const { Schema, model } = require('mongoose');

const RecursoSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },

    tipo: {
      type: String,
      enum: [
        'COMPUTADORA',
        'PROYECTOR',
        'AUDIO',        // parlantes, micrófonos
        'VR',           // oculus, visores
        'CONSOLA',      // PlayStation, Xbox, etc.
        'KITS_LAB',     // arduino, kits de electrónica
        'INSTRUMENTAL', // médico/lab
        'MOBILIARIO',   // sillas especiales, mesas, etc.
        'OTRO',
      ],
      required: true,
    },

    codigoInventario: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },

    descripcion: {
      type: String,
      trim: true,
    },

    facultad: {
      type: Schema.Types.ObjectId,
      ref: 'Facultad',
      required: true,
    },

    espacio: {
      type: Schema.Types.ObjectId,
      ref: 'Espacio',
      default: null,
    },

    cantidad: {
      type: Number,
      default: 1,
      min: 1,
    },

    estado: {
      type: String,
      enum: ['DISPONIBLE', 'RESERVADO', 'MANTENIMIENTO', 'INACTIVO'],
      default: 'DISPONIBLE',
    },
  },
  { timestamps: true }
);

module.exports = model('Recurso', RecursoSchema);
