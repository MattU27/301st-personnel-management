// Database setup script for ensuring deactivation reasons are properly saved
const mongoose = require('mongoose');

// MongoDB connection string - adjust if needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/afp_personnel_db';

// Define UserStatus enum to match the TypeScript version
const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

// Connect to MongoDB
async function dbConnect() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    return mongoose;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function setupDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected successfully to MongoDB');

    // Get the User model - ensure it matches your schema
    const UserSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      password: String,
      role: String,
      status: String,
      militaryId: String,
      deactivationReason: String,
      // Add other fields as needed but we only need these for our task
    });
    
    // Use existing model if available or create a new one
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check for existing inactive users and update them with deactivation reasons if missing
    const inactiveUsers = await User.find({ status: UserStatus.INACTIVE });
    console.log(`Found ${inactiveUsers.length} inactive users`);

    let updatedCount = 0;
    for (const user of inactiveUsers) {
      if (!user.deactivationReason) {
        user.deactivationReason = 'Account deactivated by administrator (auto-updated)';
        await user.save();
        updatedCount++;
        console.log(`Updated user ${user._id} (${user.firstName} ${user.lastName}) with default deactivation reason`);
      } else {
        console.log(`User ${user._id} already has deactivation reason: ${user.deactivationReason}`);
      }
    }
    console.log(`Updated ${updatedCount} users with default deactivation reasons`);

    // Create a test deactivated user if needed for testing
    const testUserEmail = 'testdeactivated@example.com';
    const existingTestUser = await User.findOne({ email: testUserEmail });

    if (!existingTestUser) {
      console.log('Creating test deactivated user...');
      const testUser = new User({
        firstName: 'Test',
        lastName: 'Deactivated',
        email: testUserEmail,
        password: 'password123', // This would normally be hashed
        role: 'staff',
        status: UserStatus.INACTIVE,
        militaryId: 'TST12345',
        deactivationReason: 'This account was deactivated for testing purposes'
      });
      await testUser.save();
      console.log(`Created test deactivated user: ${testUser._id}`);
    } else {
      console.log('Test deactivated user already exists');
      if (existingTestUser.status !== UserStatus.INACTIVE) {
        existingTestUser.status = UserStatus.INACTIVE;
        existingTestUser.deactivationReason = 'This account was deactivated for testing purposes';
        await existingTestUser.save();
        console.log('Updated test user to inactive status with reason');
      }
    }

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the setup function
setupDatabase(); 