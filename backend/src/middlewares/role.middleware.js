// Verifica que el usuario tenga alguno de los roles indicados
const tieneRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ message: 'No tienes permisos para esta acción' });
    }

    next();
  };
};

// Helpers por si quieres usarlos directos
const esAdmin = tieneRol('ADMIN');
const esDocente = tieneRol('DOCENTE');
const esEstudiante = tieneRol('ESTUDIANTE');

module.exports = {
  tieneRol,
  esAdmin,
  esDocente,
  esEstudiante,
};