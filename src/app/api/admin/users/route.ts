import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import User from '@/models/User';
import { verifyJWT } from '@/utils/auth';
import { UserStatus } from '@/types/auth';
import { sendNotificationToUser } from '@/app/api/ws/route';
import { WebSocketEventType } from '@/utils/websocketService';

/**
 * GET handler to retrieve user accounts with filtering options
 */
export async function GET(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Only directors can manage users
    if (decoded.role !== 'director') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Only directors can manage user accounts.' },
        { status: 403 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Build query
    const query: any = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { militaryId: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Fetch users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log('Fetched users from database:', JSON.stringify(users.map(u => ({
      _id: u._id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      status: u.status,
      deactivationReason: u.deactivationReason
    }))));
    
    // Filter out the super director account
    const filteredUsers = users.filter(user => 
      !(user.role === 'director' && user.firstName === 'Super' && user.lastName === 'Director')
    );
    
    // Count total users for pagination (excluding super director)
    const total = filteredUsers.length;
    
    // Ensure deactivation reason is included for inactive users
    const usersWithDeactivationInfo = filteredUsers.map(user => {
      // Make sure deactivationReason is included for inactive users
      if (user.status === UserStatus.INACTIVE) {
        console.log(`Inactive user ${user._id} (${user.firstName} ${user.lastName}), deactivation reason:`, user.deactivationReason || 'None');
        if (!user.deactivationReason) {
          return { ...user, deactivationReason: "No reason provided" };
        }
      }
      return user;
    });
    
    console.log('Final users with deactivation info:', JSON.stringify(usersWithDeactivationInfo.map(u => ({
      _id: u._id,
      firstName: u.firstName, 
      lastName: u.lastName,
      status: u.status,
      deactivationReason: u.deactivationReason
    }))));
    
    // Return users list
    return NextResponse.json({
      success: true,
      data: {
        users: usersWithDeactivationInfo,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler to update user status
 */
export async function PATCH(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Only directors can update user status
    if (decoded.role !== 'director') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Only directors can update user accounts.' },
        { status: 403 }
      );
    }
    
    // Get request body
    const data = await request.json();
    
    console.log('PATCH request received with data:', JSON.stringify(data));
    
    if (!data.userId || !data.status) {
      return NextResponse.json(
        { success: false, error: 'User ID and status are required' },
        { status: 400 }
      );
    }
    
    // Validate status
    if (!Object.values(UserStatus).includes(data.status as UserStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // Prepare update object with debugging
    console.log('Updating user status with data:', JSON.stringify(data));
    
    const updateData: any = { 
      status: data.status, 
      updatedAt: new Date() 
    };
    
    // Add deactivation reason if provided and status is INACTIVE
    if (data.status === UserStatus.INACTIVE) {
      if (data.reason) {
        console.log(`PATCH: Setting explicit deactivation reason for user ${data.userId}: "${data.reason}"`);
        updateData.deactivationReason = data.reason;
      } else {
        console.log(`PATCH: No deactivation reason provided for user ${data.userId}, setting default`);
        updateData.deactivationReason = 'No reason provided';
      }
    } else if (data.status === UserStatus.ACTIVE) {
      // Clear deactivation reason if reactivating the account
      console.log(`PATCH: Clearing deactivation reason for user ${data.userId} (account reactivation)`);
      updateData.deactivationReason = null;
    }
    
    console.log('PATCH: Final update data:', JSON.stringify(updateData));
    
    try {
      // Update user status with the deactivation reason
      const user = await User.findByIdAndUpdate(
        data.userId,
        updateData,
        { new: true }
      ).select('-password');
      
      console.log('PATCH: User after update:', JSON.stringify(user));
  
      // Verify the update worked correctly
      const updatedUser = await User.findById(data.userId).select('-password');
      console.log('PATCH: Verification check - user after update:', JSON.stringify({
        _id: updatedUser?._id,
        status: updatedUser?.status,
        deactivationReason: updatedUser?.deactivationReason
      }));
      
      if (!updatedUser) {
        console.error(`PATCH: Failed to find user after update!`);
        return NextResponse.json(
          { success: false, error: 'User not found after update' },
          { status: 404 }
        );
      }
      
      // Enhanced verification for deactivation reason
      if (data.status === UserStatus.INACTIVE) {
        if (!updatedUser.deactivationReason) {
          console.error(`PATCH: Deactivation reason not saved! Attempting repair...`);
          
          // Try a direct update as a backup
          const repairResult = await User.updateOne(
            { _id: data.userId },
            { $set: { deactivationReason: data.reason || 'No reason provided (repair)' } }
          );
          
          console.log(`PATCH: Repair attempt result:`, repairResult);
          
          // Fetch the user one more time to confirm repair
          const repairedUser = await User.findById(data.userId).select('deactivationReason');
          console.log(`PATCH: User after repair:`, repairedUser);
        } else {
          console.log(`PATCH: Deactivation reason successfully saved: "${updatedUser.deactivationReason}"`);
        }
      }
    
      // Send WebSocket notification to the affected user
      if (data.status === UserStatus.INACTIVE) {
        // For deactivation, send a special notification
        // Make sure the reason is never empty or null
        const deactivationReason = data.reason || updateData.deactivationReason || 'No reason provided';
        
        const notificationPayload = {
          message: 'Your account has been deactivated by an administrator.',
          timestamp: new Date().toISOString(),
          adminId: decoded?.userId || 'unknown',
          adminRole: decoded?.role || 'administrator',
          reason: deactivationReason
        };
        
        console.log(`PATCH: Sending deactivation notification with reason: "${notificationPayload.reason}"`);
        
        // Also log the user that's being deactivated and the reason for server logs
        console.log(`PATCH: User ${data.userId} deactivated by ${decoded?.userId} with reason: "${deactivationReason}"`);
        
        sendNotificationToUser(
          data.userId, 
          WebSocketEventType.ACCOUNT_DEACTIVATED, 
          notificationPayload
        );
      } else if (data.status === UserStatus.ACTIVE) {
        // For activation, send an activation notification
        sendNotificationToUser(
          data.userId, 
          WebSocketEventType.ACCOUNT_ACTIVATED, 
          {
            message: 'Your account has been activated by an administrator.',
            timestamp: new Date().toISOString()
          }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('PATCH: Error during user update or notification:', error);
      return NextResponse.json(
        { success: false, error: 'Error updating user: ' + (error instanceof Error ? error.message : String(error)) },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update user status' },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a user account
 */
export async function DELETE(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = await verifyJWT(token);
    
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Only directors can delete users
    if (decoded.role !== 'director') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Only directors can delete user accounts.' },
        { status: 403 }
      );
    }
    
    // Get user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Find and delete user
    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'User account deleted successfully'
    });
    
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete user account' },
      { status: 500 }
    );
  }
} 