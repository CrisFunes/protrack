const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Asegurarnos de que sea requerido
  },
  service: {
    type: String,
    enum: ['jira', 'slack', 'bitbucket', 'github', 'trello'],
    required: true
  },
  credentials: {
    baseUrl: String,
    email: String,
    apiToken: String,
    accessToken: String,
    refreshToken: String
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  lastSync: {
    type: Date,
    default: null
  }
}, { 
  timestamps: true 
});

// Índice compuesto para asegurar que no hay duplicados para el mismo usuario y servicio
integrationSchema.index({ userId: 1, service: 1 }, { unique: true });

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;