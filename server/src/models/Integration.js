const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  credentials: {
    type: Object,  // Cambiado de Map a Object para mejor manejo de credenciales
    default: {}
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  lastSync: Date
}, {
  timestamps: true  // Agregar timestamps para mejor tracking
});

// Índice compuesto para asegurar que no hay duplicados para el mismo usuario y servicio
integrationSchema.index({ userId: 1, service: 1 }, { unique: true });

// Método para ocultar credenciales sensibles en las respuestas
integrationSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.credentials;
  return obj;
};

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;