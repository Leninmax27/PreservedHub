const { Schema, model } = require('mongoose');

const UsuarioSchema = new Schema(
  {
    nombre: { type: String, required: true, trim: true },
    apellido: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true }, // hash con bcrypt
    rol: {
      type: String,
      enum: ['ESTUDIANTE', 'DOCENTE', 'ADMIN'],
      default: 'ESTUDIANTE',
    },
    estado: {
      type: String,
      enum: ['ACTIVO', 'INACTIVO'],
      default: 'ACTIVO',
    },
  },
  { timestamps: true }
);

module.exports = model('Usuario', UsuarioSchema);
