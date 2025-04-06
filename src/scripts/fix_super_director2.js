// Script to create a super director account with correct enum values
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// Connection URL and Database Name
const url = 'mongodb://localhost:27017';
const dbName = 'afp_personnel_db';

async function createSuperDirector() {
  try {
    // Connect to MongoDB
    const client = new MongoClient(url);
    await client.connect();
    console.log('Connected successfully to MongoDB server');

    // Get reference to the database
    const db = client.db(dbName);
    
    // Generate fresh password hash for "admin123"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create a new super director with proper schema
    // Using "Headquarters" instead of "HQ" and "Colonel" for rank
    const superDirector = {
      firstName: 'Super',
      lastName: 'Director',
      email: 'director@afp.gov.ph',
      password: hashedPassword,
      role: 'director',
      status: 'active',
      militaryId: '2024-SD004',
      rank: 'Colonel', // Using exact enum value
      company: 'Headquarters', // Using exact enum value
      specializations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert the super director account
    const result = await db.collection('users').insertOne(superDirector);
    console.log(`Super director account created with ID: ${result.insertedId}`);
    console.log('Login credentials:');
    console.log('Email: director@afp.gov.ph');
    console.log('Password: admin123');

    // Close the connection
    await client.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run the function
createSuperDirector(); 