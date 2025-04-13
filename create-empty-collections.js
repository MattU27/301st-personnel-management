const mongoose = require('mongoose');

async function createEmptyCollections() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/afp_personnel_db');
    console.log('Connected to MongoDB');
    
    // Create the empty training_registrations collection
    await mongoose.connection.createCollection('training_registrations');
    console.log('Created empty training_registrations collection');
    
    // Verify collections in database
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

createEmptyCollections(); 