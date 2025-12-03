const { Schema, model } = require('mongoose');

const MateriaSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    codigo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    carrera: { type: Schema.Types.ObjectId, ref: 'Carrera', required: true },
    facultad: { type: Schema.Types.ObjectId, ref: 'Facultad' },
    creditos: { type: Number },
    semestre: { type: Number },
    descripcion: { type: String, trim: true },   // 👈 agrega esto
    estado: {
      type: String,
      enum: ['ACTIVA', 'INACTIVA'],
      default: 'ACTIVA',
    },
  },
  { timestamps: true }
);

module.exports = model('Materia', MateriaSchema);
