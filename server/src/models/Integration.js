const mongoose = require('mongoose');

const integrationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true // Añadir índice para mejor rendimiento
  },
  service: {
    type: String,
    required: true,
    enum: ['jira', 'trello', 'github', 'bitbucket']
  },
  credentials: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    validate: {
      validator: function(credentials) {
        switch (this.service) {
          case 'jira':
            return credentials.baseUrl && credentials.email && credentials.apiToken;
          case 'trello':
            return credentials.apiKey && credentials.token;
          default:
            return true;
        }
      },
      message: props => `Credenciales inválidas para el servicio ${props.value}`
    }
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  lastSync: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índice compuesto para asegurar que no hay duplicados para el mismo usuario y servicio
integrationSchema.index({ userId: 1, service: 1 }, { unique: true });

const Integration = mongoose.model('Integration', integrationSchema);

module.exports = Integration;