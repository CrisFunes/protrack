const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
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
  timestamps: true,
  collection: 'integrations'
});

// Índice compuesto para búsquedas eficientes
integrationSchema.index({ userId: 1, service: 1 }, { unique: true });

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;