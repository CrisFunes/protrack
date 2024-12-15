// config/database.js
const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  integrations: {
    jira: {
      token: {
        type: String,
        select: false // No se incluirá por defecto en las consultas
      },
      domain: String,
      email: String,
      isConnected: {
        type: Boolean,
        default: false
      }
    },
    slack: {
      token: {
        type: String,
        select: false
      },
      workspaceId: String,
      isConnected: {
        type: Boolean,
        default: false
      }
    },
    bitbucket: {
      token: {
        type: String,
        select: false
      },
      username: String,
      isConnected: {
        type: Boolean,
        default: false
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Método para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;

// models/Integration.js
const mongoose = require('mongoose');

const integrationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    enum: ['jira', 'slack', 'bitbucket'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['success', 'error'],
    required: true
  },
  details: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const IntegrationLog = mongoose.model('IntegrationLog', integrationLogSchema);
module.exports = IntegrationLog;