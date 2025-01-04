require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const initializePreferences = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const users = await User.find({ preferences: { $exists: false } });
    console.log(`Found ${users.length} users without preferences`);

    for (const user of users) {
      user.preferences = {
        emailNotifications: true,
        darkMode: false
      };
      await user.save();
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

initializePreferences();