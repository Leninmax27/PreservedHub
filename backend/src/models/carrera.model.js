const { Schema, model } = require('mongoose');

const CarreraSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true }, 
    facultad: {
      type: Schema.Types.ObjectId,
      ref: 'Facultad',
      required: true, 
    },
    estado: {
      type: String,
      enum: ['ACTIVA', 'INACTIVA'],
      default: 'ACTIVA',
    },
  },
  { timestamps: true }
);

module.exports = model('Carrera', CarreraSchema);
