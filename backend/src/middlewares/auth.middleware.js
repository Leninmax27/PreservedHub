const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario.model');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Buscar al usuario en la BD (por si fue desactivado, etc.)
      const usuario = await Usuario.findById(decoded.id);

      if (!usuario || usuario.estado !== 'ACTIVO') {
        return res.status(401).json({ message: 'Usuario no autorizado o inactivo' });
      }

      // Guardamos el usuario en la request para usarlo en los controladores
      req.usuario = {
        id: usuario._id,
        correo: usuario.correo,
        rol: usuario.rol,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
      };

      next();
    } catch (error) {
      console.error('Error al verificar token:', error);
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    res.status(500).json({ message: 'Error en autenticación' });
  }
};

module.exports = authMiddleware;