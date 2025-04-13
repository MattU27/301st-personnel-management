const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const backupDir = path.join(__dirname, 'afp_personnel_db');
const dbName = 'afp_personnel_db';
const tempDir = path.join(__dirname, 'temp_restore');

// Create temp directory if it doesn't exist
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

// Convert backup files to mongosh-compatible JavaScript
function processBackupFiles() {
  const files = fs.readdirSync(backupDir).filter(file => file.endsWith('.json'));
  
  console.log(`Found ${files.length} backup files to process.`);
  
  for (const file of files) {
    try {
      const filePath = path.join(backupDir, file);
      const collectionName = file.split('.')[1].split('.')[0]; // Extract collection name from filename
      
      console.log(`Processing ${collectionName} from ${filePath}...`);
      
      // Read the JSON file
      const data = fs.readFileSync(filePath, 'utf8');
      let documents;
      
      try {
        // Try to parse as JSON
        documents = JSON.parse(data);
        
        if (!Array.isArray(documents)) {
          documents = [documents];
        }
      } catch (e) {
        // If it's not valid JSON (might be JSONL), convert line by line
        console.log(`File ${file} is not a valid JSON array, processing line by line...`);
        documents = data
          .split('\n')
          .filter(line => line.trim())
          .map(line => {
            try {
              return JSON.parse(line);
            } catch (error) {
              console.error(`Error parsing line in ${file}, skipping...`);
              return null;
            }
          })
          .filter(doc => doc !== null);
      }
      
      if (documents.length === 0) {
        console.log(`No documents found in ${file}, skipping...`);
        continue;
      }
      
      // Create a mongosh script for this collection
      const scriptContent = `
use ${dbName};

// Drop the collection if it exists
try {
  db.${collectionName}.drop();
} catch (e) {
  print("Collection ${collectionName} does not exist or cannot be dropped: " + e.message);
}

// Insert the documents
const documents = ${JSON.stringify(documents, null, 2)};
db.${collectionName}.insertMany(documents, { ordered: false });
print("Imported " + documents.length + " documents into ${collectionName}");
`;
      
      const scriptPath = path.join(tempDir, `restore_${collectionName}.js`);
      fs.writeFileSync(scriptPath, scriptContent);
      
      console.log(`Created mongosh script for ${collectionName} at ${scriptPath}`);
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }
}

// Run mongosh scripts to restore the database
function restoreWithMongosh() {
  const scriptFiles = fs.readdirSync(tempDir).filter(file => file.endsWith('.js'));
  
  if (scriptFiles.length === 0) {
    console.error('No mongosh scripts found in the temp directory!');
    return;
  }
  
  console.log(`Running ${scriptFiles.length} mongosh scripts to restore the database...`);
  
  for (const scriptFile of scriptFiles) {
    const scriptPath = path.join(tempDir, scriptFile);
    
    console.log(`Running mongosh script ${scriptPath}...`);
    
    try {
      const command = `mongosh --file="${scriptPath}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error running mongosh script ${scriptFile}:`, error.message);
          return;
        }
        
        console.log(`Output from ${scriptFile}:`);
        console.log(stdout);
        
        if (stderr) {
          console.error(`Error output from ${scriptFile}:`);
          console.error(stderr);
        }
      });
    } catch (error) {
      console.error(`Error running mongosh script ${scriptFile}:`, error.message);
    }
  }
}

// Process backup files
processBackupFiles();
console.log('\nTo restore your database, run: mongosh --file="temp_restore/restore_[collection_name].js" for each file in the temp_restore directory');
console.log('OR run mongosh separately and then load("<script_path>") for each script'); 