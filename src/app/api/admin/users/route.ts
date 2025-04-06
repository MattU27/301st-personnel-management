import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import User from '@/models/User';
import { verifyJWT } from '@/utils/auth';
import { UserStatus } from '@/types/auth';

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
    
    // Filter out the super director account
    const filteredUsers = users.filter(user => 
      !(user.role === 'director' && user.firstName === 'Super' && user.lastName === 'Director')
    );
    
    // Count total users for pagination (excluding super director)
    const total = filteredUsers.length;
    
    // Return users list
    return NextResponse.json({
      success: true,
      data: {
        users: filteredUsers,
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
    
    // Update user status
    const user = await User.findByIdAndUpdate(
      data.userId,
      { status: data.status, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: { user }
    });
    
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