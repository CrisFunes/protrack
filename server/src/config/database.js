const mongoose = require('mongoose');

const connectDB = async (uri) => {
  try {
    console.log('Intentando conectar a MongoDB...');
    await mongoose.connect(uri);
    console.log('MongoDB conectado exitosamente');
  } catch (err) {
    console.error('Error en la conexión MongoDB:', err);
    process.exit(1);
  }
};

module.exports = connectDB;