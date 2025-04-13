const mongoose = require('mongoose');

async function verifyDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/afp_personnel_db');
    console.log('Connected to MongoDB');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(` - ${collection.name}`);
    });
    
    // Count documents in each collection
    console.log('\nDocument counts:');
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(` - ${collection.name}: ${count} documents`);
    }
    
    console.log('\nDatabase verification complete!');
  } catch (error) {
    console.error('Error verifying database:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

verifyDatabase(); 