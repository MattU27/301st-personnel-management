const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const backupDir = path.join(__dirname, 'afp_personnel_db');
const dbName = 'afp_personnel_db';
const uri = `mongodb://localhost:27017/${dbName}`;

async function connectToMongoDB() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    return false;
  }
}

async function processJSONFile(filePath, collectionName) {
  try {
    console.log(`Processing ${collectionName} from ${filePath}...`);
    
    // Read file content
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Try to parse as JSON
    let documents = [];
    try {
      const parsed = JSON.parse(fileContent);
      if (Array.isArray(parsed)) {
        documents = parsed;
      } else {
        documents = [parsed];
      }
    } catch (e) {
      console.log(`File is not valid JSON, trying line by line...`);
      // Try line by line for JSONL format
      const lines = fileContent.split('\n').filter(line => line.trim());
      for (const line of lines) {
        try {
          const doc = JSON.parse(line);
          documents.push(doc);
        } catch (error) {
          console.error(`Error parsing line: ${line.substring(0, 50)}...`);
        }
      }
    }
    
    if (documents.length === 0) {
      console.log(`No valid documents found in ${filePath}`);
      return 0;
    }
    
    console.log(`Found ${documents.length} documents to import`);
    
    // Process documents to handle MongoDB Extended JSON format
    const processedDocs = documents.map(doc => {
      return processDocument(doc);
    });
    
    // Get collection and clear it
    const collection = mongoose.connection.collection(collectionName);
    await collection.deleteMany({});
    
    // Insert documents in batches to avoid issues with large files
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < processedDocs.length; i += batchSize) {
      const batch = processedDocs.slice(i, i + batchSize);
      try {
        const result = await collection.insertMany(batch, { ordered: false });
        inserted += batch.length;
        console.log(`Inserted batch ${i/batchSize + 1}, total: ${inserted}/${processedDocs.length}`);
      } catch (error) {
        console.error(`Error inserting batch: ${error.message}`);
      }
    }
    
    console.log(`Completed import for ${collectionName}, inserted ${inserted} documents`);
    return inserted;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return 0;
  }
}

// Process a document to handle MongoDB Extended JSON format
function processDocument(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  
  const result = {};
  
  for (const [key, value] of Object.entries(doc)) {
    if (key === '_id' && value && typeof value === 'object' && value.$oid) {
      // Convert MongoDB ObjectId
      result[key] = new mongoose.Types.ObjectId(value.$oid);
    } else if (value && typeof value === 'object' && value.$date) {
      // Convert dates
      result[key] = new Date(value.$date);
    } else if (value && typeof value === 'object' && value.$numberLong) {
      // Convert long numbers
      result[key] = Number(value.$numberLong);
    } else if (value && typeof value === 'object' && value.$numberInt) {
      // Convert int numbers
      result[key] = Number(value.$numberInt);
    } else if (value && typeof value === 'object' && value.$numberDecimal) {
      // Convert decimal numbers
      result[key] = Number(value.$numberDecimal);
    } else if (Array.isArray(value)) {
      // Handle arrays recursively
      result[key] = value.map(item => processDocument(item));
    } else if (value && typeof value === 'object') {
      // Handle nested objects recursively
      result[key] = processDocument(value);
    } else {
      // Keep other values as is
      result[key] = value;
    }
  }
  
  return result;
}

async function importAllFiles() {
  // Connect to MongoDB
  const connected = await connectToMongoDB();
  if (!connected) return;
  
  try {
    // Get all JSON files in the backup directory
    const files = fs.readdirSync(backupDir)
      .filter(file => file.endsWith('.json'));
    
    console.log(`Found ${files.length} files to process`);
    
    let totalImported = 0;
    
    // Process each file
    for (const file of files) {
      const filePath = path.join(backupDir, file);
      const collectionName = file.split('.')[1]; // Get collection name from filename
      
      const imported = await processJSONFile(filePath, collectionName);
      totalImported += imported;
    }
    
    console.log(`Total imported: ${totalImported} documents`);
    
    // Verify the import
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\nCollections in database: ${collections.map(c => c.name).join(', ')}`);
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`${collection.name}: ${count} documents`);
    }
  } catch (error) {
    console.error('Error importing files:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

importAllFiles(); 