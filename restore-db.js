const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { BSON } = require('bson');
require('dotenv').config();

// Connection string from .env file or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/afp_personnel_db';
const backupDir = path.join(__dirname, 'afp_personnel_db');

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

// Function to transform MongoDB Extended JSON to BSON objects
function transformExtendedJSON(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(transformExtendedJSON);
  }
  
  if (obj.$oid) {
    return new mongoose.Types.ObjectId(obj.$oid);
  }
  
  if (obj.$date) {
    return new Date(obj.$date);
  }
  
  if (obj.$numberDecimal) {
    return parseFloat(obj.$numberDecimal);
  }
  
  if (obj.$numberLong) {
    return parseInt(obj.$numberLong, 10);
  }
  
  if (obj.$numberInt) {
    return parseInt(obj.$numberInt, 10);
  }
  
  // Recursively transform nested objects
  const result = {};
  for (const key in obj) {
    result[key] = transformExtendedJSON(obj[key]);
  }
  
  return result;
}

// Import a single collection
async function importCollection(file) {
  try {
    const filePath = path.join(backupDir, file);
    const collectionName = file.split('.')[1].split('.')[0]; // Extract collection name from filename
    
    console.log(`Importing ${collectionName} from ${filePath}...`);
    
    // Read the JSON file
    const data = fs.readFileSync(filePath, 'utf8');
    let documents = [];
    
    try {
      // Try parsing as JSON array
      documents = JSON.parse(data);
      // If it's a single line JSON array file
      if (!Array.isArray(documents)) {
        documents = [documents];
      }
    } catch (e) {
      try {
        // If the file contains one JSON object per line
        documents = data
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      } catch (error) {
        console.error(`Could not parse JSON in ${file}, skipping...`);
        return;
      }
    }
    
    if (documents.length === 0) {
      console.log(`No documents found in ${file}, skipping...`);
      return;
    }
    
    // Transform Extended JSON to BSON
    const transformedDocuments = documents.map(transformExtendedJSON);
    
    // Get the collection and insert documents
    const collection = mongoose.connection.collection(collectionName);
    
    // Drop existing collection if it exists
    await collection.drop().catch(() => console.log(`Collection ${collectionName} does not exist, creating new...`));
    
    // Insert all documents
    if (transformedDocuments.length > 0) {
      const result = await collection.insertMany(transformedDocuments, { ordered: false });
      console.log(`Successfully imported ${transformedDocuments.length} documents into ${collectionName}`);
    } else {
      console.log(`No valid documents to import in ${file}, skipping...`);
    }
  } catch (error) {
    console.error(`Failed to import ${file}:`, error.message);
  }
}

async function restoreDatabase() {
  try {
    // Check if backup directory exists
    if (!fs.existsSync(backupDir)) {
      console.error(`Backup directory ${backupDir} does not exist!`);
      return;
    }
    
    // Get all backup files
    const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.error('No JSON backup files found in the backup directory!');
      return;
    }
    
    console.log(`Found ${files.length} backup files to restore.`);
    
    // Connect to MongoDB
    await connectToMongoDB();
    
    // Import each collection
    for (const file of files) {
      await importCollection(file);
    }
    
    console.log('Database restoration complete!');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Failed to restore database:', error.message);
  }
}

// Run the script
restoreDatabase(); 