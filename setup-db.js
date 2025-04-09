// Simple script to run the database setup
const { exec } = require('child_process');

console.log('Transpiling TypeScript and running database setup script...');

// First compile the TypeScript file
exec('npx tsc src/scripts/setupDb.ts --esModuleInterop --outDir dist', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error compiling TypeScript: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`TypeScript compilation stderr: ${stderr}`);
  }
  console.log(`TypeScript compilation stdout: ${stdout}`);
  
  // Then run the compiled JavaScript file
  exec('node dist/scripts/setupDb.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Error running setup script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Setup script stderr: ${stderr}`);
    }
    console.log(`Setup script stdout: ${stdout}`);
    console.log('Database setup completed.');
  });
}); 