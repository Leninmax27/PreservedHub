const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const Usuario = require('../models/usuario.model');
const { generarToken } = require('../utils/jwt.util');
const authMiddleware = require('../middlewares/auth.middleware');

/**
 * POST /api/auth/register
 * Registro básico (por defecto rol ESTUDIANTE)
 * Luego el ADMIN puede cambiar el rol desde usuarios.routes
 */
router.post('/register', async (req, res) => {
  try {
    const { nombre, apellido, correo, password, rol } = req.body;

    // Verificar si el correo ya existe
    const usuarioExiste = await Usuario.findOne({ correo });
    if (usuarioExiste) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = new Usuario({
      nombre,
      apellido,
      correo,
      password: passwordHash,
      rol: rol || 'ESTUDIANTE', // por defecto ESTUDIANTE
    });

    const guardado = await nuevoUsuario.save();

    // Generar token
    const token = generarToken(guardado);

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      usuario: {
        id: guardado._id,
        nombre: guardado.nombre,
        apellido: guardado.apellido,
        correo: guardado.correo,
        rol: guardado.rol,
      },
      token,
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el registro de usuario' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;

    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    const esPasswordValido = await bcrypt.compare(password, usuario.password);
    if (!esPasswordValido) {
      return res.status(400).json({ message: 'Correo o contraseña incorrectos' });
    }

    if (usuario.estado !== 'ACTIVO') {
      return res.status(403).json({ message: 'Usuario inactivo, contacta al administrador' });
    }

    const token = generarToken(usuario);

    res.json({
      message: 'Login exitoso',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      token,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el inicio de sesión' });
  }
});

/**
 * GET /api/auth/me
 * Devuelve la info del usuario autenticado
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error al obtener el perfil' });
  }
});

module.exports = router;