const dotenv = require('dotenv');
dotenv.config(); // carga el archivo .env

const app = require('./app');
const connectDB = require('./config/db');

// Conectar a MongoDB
connectDB();

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Server escuchando en el puerto ${PORT}`);
});
