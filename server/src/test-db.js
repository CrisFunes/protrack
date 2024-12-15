// scripts/test-db.js
const mongoose = require('mongoose');

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // Create a test collection
    const Test = mongoose.model('Test', new mongoose.Schema({
      name: String,
      date: { type: Date, default: Date.now }
    }));

    // Create a test document
    await Test.create({ name: 'test_connection' });
    console.log('Test document created successfully');

    // Find the test document
    const doc = await Test.findOne({ name: 'test_connection' });
    console.log('Test document found:', doc);

    // Clean up
    await Test.deleteMany({});
    console.log('Test cleanup completed');

    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

testConnection();