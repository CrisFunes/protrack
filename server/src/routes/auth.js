const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// User profile routes
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.put('/preferences', auth, authController.updatePreferences);
router.delete('/profile', auth, authController.deleteAccount); // Nueva ruta

module.exports = router;