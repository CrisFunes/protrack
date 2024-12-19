const User = require('../models/User');
const { encryptToken, decryptToken } = require('../utils/encryption');

const integrationController = {
  async saveIntegrationToken(req, res) {
    try {
      const { integration, token, additionalData } = req.body;
      const userId = req.user.id; // From auth middleware

      const encryptedToken = encryptToken(token);
      
      const updateData = {
        [`integrations.${integration}.token`]: encryptedToken
      };
      
      // Add any additional integration-specific data
      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          updateData[`integrations.${integration}.${key}`] = additionalData[key];
        });
      }

      await User.findByIdAndUpdate(userId, {
        $set: updateData
      });

      res.json({ message: `${integration} integration saved successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Error saving integration token', error });
    }
  },

  async getIntegrationToken(req, res) {
    try {
      const { integration } = req.params;
      const userId = req.user.id; // From auth middleware

      const user = await User.findById(userId);
      if (!user.integrations[integration]?.token) {
        return res.status(404).json({ message: 'Integration not found' });
      }

      const decryptedToken = decryptToken(user.integrations[integration].token);
      
      res.json({
        token: decryptedToken,
        ...user.integrations[integration]
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving integration token', error });
    }
  }
};

module.exports = integrationController;