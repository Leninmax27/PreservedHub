const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario.model');
const authMiddleware = require('../middlewares/auth.middleware');
const { esAdmin } = require('../middlewares/role.middleware');

/**
 * GET /api/usuarios
 * Lista todos los usuarios (solo ADMIN)
 * Filtros opcionales: rol, estado, correo (parcial)
 */
router.get('/', authMiddleware, esAdmin, async (req, res) => {
  try {
    const { rol, estado, correo } = req.query;
    const filtro = {};

    if (rol) filtro.rol = rol;
    if (estado) filtro.estado = estado;
    if (correo) filtro.correo = new RegExp(correo, 'i');

    const usuarios = await Usuario.find(filtro).select('-password').sort({ nombre: 1 });

    res.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

/**
 * GET /api/usuarios/:id
 */
router.get('/:id', authMiddleware, esAdmin, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).select('-password');

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
});

/**
 * POST /api/usuarios
 * Crear usuario desde el panel admin (ej: crear otro ADMIN o DOCENTE)
 */
router.post('/', authMiddleware, esAdmin, async (req, res) => {
  try {
    const { nombre, apellido, correo, password, rol } = req.body;

    const usuarioExiste = await Usuario.findOne({ correo });
    if (usuarioExiste) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      correo,
      password: passwordHash,
      rol: rol || 'ESTUDIANTE',
    });

    const guardado = await nuevoUsuario.save();

    res.status(201).json({
      id: guardado._id,
      nombre: guardado.nombre,
      apellido: guardado.apellido,
      correo: guardado.correo,
      rol: guardado.rol,
      estado: guardado.estado,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
});

/**
 * PUT /api/usuarios/:id
 * Actualiza datos básicos del usuario (nombre, apellido, correo)
 */
router.put('/:id', authMiddleware, esAdmin, async (req, res) => {
  try {
    const { nombre, apellido, correo, rol, estado } = req.body;

    const actualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { nombre, apellido, correo, rol, estado },
      { new: true }
    ).select('-password');

    if (!actualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
});

/**
 * PATCH /api/usuarios/:id/rol
 * Cambiar solo el rol del usuario
 */
router.patch('/:id/rol', authMiddleware, esAdmin, async (req, res) => {
  try {
    const { rol } = req.body;

    const actualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { rol },
      { new: true }
    ).select('-password');

    if (!actualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    res.status(500).json({ message: 'Error al cambiar el rol del usuario' });
  }
});

/**
 * PATCH /api/usuarios/:id/estado
 * Cambiar solo el estado (ACTIVO / INACTIVO)
 */
router.patch('/:id/estado', authMiddleware, esAdmin, async (req, res) => {
  try {
    const { estado } = req.body;

    const actualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    ).select('-password');

    if (!actualizado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ message: 'Error al cambiar el estado del usuario' });
  }
});

/**
 * DELETE /api/usuarios/:id
 * (Opcional) Borrado físico. A veces es mejor solo poner INACTIVO.
 */
router.delete('/:id', authMiddleware, esAdmin, async (req, res) => {
  try {
    const eliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!eliminado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
});

module.exports = router;