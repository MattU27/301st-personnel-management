// Script to verify user accounts and their status in the database
require('dotenv').config();
const mongoose = require('mongoose');

// Get MongoDB URI from environment or use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/afp_personnel_db';
console.log('Using database URI:', MONGODB_URI.replace(/:([^:@]+)@/, ':****@'));

// Define UserStatus enum to match what's in the app
const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

async function verifyDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define a simple User schema
    const UserSchema = new mongoose.Schema({
      firstName: String,
      lastName: String,
      email: String,
      status: String,
      role: String,
      deactivationReason: String,
      militaryId: String,
      createdAt: Date,
      updatedAt: Date
    }, { 
      strict: false // Allow flexible schema matching
    });

    // Get the User model
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // 1. Count users by status
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: UserStatus.ACTIVE });
    const inactiveUsers = await User.countDocuments({ status: UserStatus.INACTIVE });
    const pendingUsers = await User.countDocuments({ status: UserStatus.PENDING });
    const unknownStatus = totalUsers - activeUsers - inactiveUsers - pendingUsers;

    console.log('\nUSER STATISTICS:');
    console.log('----------------');
    console.log(`Total users: ${totalUsers}`);
    console.log(`Active users: ${activeUsers}`);
    console.log(`Inactive users: ${inactiveUsers}`);
    console.log(`Pending users: ${pendingUsers}`);
    if (unknownStatus > 0) {
      console.log(`Users with unknown status: ${unknownStatus}`);
    }

    // 2. List inactive users with their deactivation reasons
    if (inactiveUsers > 0) {
      console.log('\nINACTIVE USERS:');
      console.log('---------------');
      const inactiveUsersList = await User.find({ status: UserStatus.INACTIVE })
        .select('firstName lastName email deactivationReason')
        .lean();

      inactiveUsersList.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`   Reason: ${user.deactivationReason || 'No reason provided'}`);
      });
    } else {
      console.log('\nNo inactive users found');
    }

    // 3. Check if we need to create a test inactive user
    const createTestUser = process.argv.includes('--create-test-user');
    if (createTestUser) {
      console.log('\nCreating test inactive user...');
      
      // Check if test user already exists
      const testEmail = 'test.inactive@example.com';
      const existingUser = await User.findOne({ email: testEmail });
      
      if (existingUser) {
        console.log(`Test user already exists: ${existingUser.firstName} ${existingUser.lastName}`);
        console.log(`Status: ${existingUser.status}`);
        
        // If user exists but is not inactive, make them inactive without a reason
        if (existingUser.status !== UserStatus.INACTIVE) {
          existingUser.status = UserStatus.INACTIVE;
          existingUser.deactivationReason = null; // Explicitly set to null
          await existingUser.save();
          console.log('Updated test user to inactive status with null deactivation reason');
        } else if (existingUser.deactivationReason) {
          // If user exists and is inactive but has a reason, remove it
          existingUser.deactivationReason = null;
          await existingUser.save();
          console.log('Removed deactivation reason from test user');
        } else {
          console.log('Test user is already inactive with no deactivation reason');
        }
      } else {
        // Create a new test user
        const newUser = new User({
          firstName: 'Test',
          lastName: 'Inactive',
          email: testEmail,
          password: 'password123', // This would normally be hashed
          militaryId: 'TEST12345',
          role: 'staff',
          status: UserStatus.INACTIVE,
          // Deliberately not setting deactivationReason
        });
        
        await newUser.save();
        console.log('Created new test inactive user with no deactivation reason');
      }
    }

    // 4. Print any users with mismatched status/reason
    const mismatchedUsers = await User.find({
      $or: [
        // Active users with deactivation reason
        { status: UserStatus.ACTIVE, deactivationReason: { $ne: null, $exists: true } },
        // Inactive users without deactivation reason
        { status: UserStatus.INACTIVE, $or: [
          { deactivationReason: null },
          { deactivationReason: { $exists: false } }
        ]}
      ]
    }).select('firstName lastName email status deactivationReason').lean();

    if (mismatchedUsers.length > 0) {
      console.log('\nUSERS WITH MISMATCHED STATUS/REASON:');
      console.log('-----------------------------------');
      mismatchedUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
        console.log(`   Status: ${user.status}, Reason: ${user.deactivationReason || 'No reason provided'}`);
      });
    } else {
      console.log('\nNo users with mismatched status/reason found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDisconnected from MongoDB');
  }
}

// Run the verification
verifyDatabase(); 