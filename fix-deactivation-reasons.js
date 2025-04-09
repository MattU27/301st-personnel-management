// Script to directly fix deactivation reasons in the database
const mongoose = require('mongoose');

// Connect to the database
async function main() {
  try {
    // Connect to MongoDB - make sure this is the correct connection string
    await mongoose.connect('mongodb://localhost:27017/afp_personnel_db');
    console.log('Connected to MongoDB');

    // Define a simple User schema just for this script
    const userSchema = new mongoose.Schema({
      firstName: String,
      lastName: String, 
      email: String,
      status: String,
      deactivationReason: String
    });

    // Use the existing User model or create a temporary one
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Find all users with inactive status
    const inactiveUsers = await User.find({ status: 'inactive' });
    console.log(`Found ${inactiveUsers.length} inactive users`);

    // Update all inactive users with a custom deactivation reason if not already set
    for (const user of inactiveUsers) {
      console.log(`Processing user: ${user.firstName} ${user.lastName} (${user.email})`);
      console.log(`Current deactivation reason: "${user.deactivationReason || 'NONE'}"`);
      
      // Update with custom reason if none exists
      if (!user.deactivationReason) {
        user.deactivationReason = "Account manually deactivated by administrator";
        await user.save();
        console.log(`✓ Updated user with reason: "${user.deactivationReason}"`);
      } else {
        console.log(`✓ User already has reason: "${user.deactivationReason}"`);
      }
    }
    
    console.log('Database update completed successfully!');
  } catch (error) {
    console.error('Error updating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

main(); 