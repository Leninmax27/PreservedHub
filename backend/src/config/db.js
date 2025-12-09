const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: la variable de entorno MONGO_URI no está definida.');
      console.error('En Render añade la variable de entorno `MONGO_URI` en la sección Environment.');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // usa los valores por defecto de mongoose v6/9
    });

    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error.message);
    process.exit(1); 
  }
};

module.exports = connectDB;
