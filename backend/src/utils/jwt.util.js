const jwt = require('jsonwebtoken');

const generarToken = (usuario) => {
  const payload = {
    id: usuario._id,
    correo: usuario.correo,
    rol: usuario.rol,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '8h', // puedes ajustar el tiempo
  });
};

module.exports = {
  generarToken,
};