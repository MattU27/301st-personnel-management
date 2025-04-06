import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import Personnel from '@/models/Personnel';
import { validateToken } from '@/lib/auth';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// Simple in-memory rate limiter
const searches = new Map<string, { count: number, timestamp: number }>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const RATE_LIMIT_MAX = 10; // 10 requests per 5 seconds

// Helper function to log administrator actions
async function logAdminAction(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  resourceId: string,
  details: string,
  request: Request
) {
  try {
    const auditLog = new AuditLog({
      timestamp: new Date(),
      userId,
      userName,
      userRole,
      action,
      resource: 'personnel',
      resourceId,
      details,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    await auditLog.save();
    console.log(`${action} action logged to audit system`);
  } catch (auditError) {
    // Don't fail the main operation if audit logging fails
    console.error('Error logging to audit system:', auditError);
  }
}

// Normalize status values to ensure only valid statuses are saved
function normalizeStatus(status: string) {
  const validStatuses = ['active', 'pending', 'inactive', 'retired', 'standby', 'ready'];
  
  // If status is already valid, return it lowercase
  if (validStatuses.includes(status?.toLowerCase())) {
    return status.toLowerCase();
  }
  
  // Map specific statuses to valid ones
  if (status?.toLowerCase() === 'medical' || status?.toLowerCase() === 'leave') {
    return 'inactive';
  }
  
  // Default fallback
  return 'inactive';
}

/**
 * GET handler to retrieve personnel data
 */
export async function GET(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting
    const now = Date.now();
    const userSearches = searches.get(ip) || { count: 0, timestamp: now };
    
    // Reset counter if window expired
    if (now - userSearches.timestamp > RATE_LIMIT_WINDOW) {
      userSearches.count = 0;
      userSearches.timestamp = now;
    }
    
    // Increment count
    userSearches.count++;
    searches.set(ip, userSearches);
    
    // Check rate limit
    if (userSearches.count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { success: false, error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Connect to MongoDB
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const company = searchParams.get('company');
    const status = searchParams.get('status');
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 10;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    
    // Build query
    const query: any = {};
    if (company) query.company = company;
    if (status) query.status = status;
    
    // Add search functionality
    if (search && search.trim() !== '') {
      // Create a more flexible search query
      const searchRegex = new RegExp(search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
      query.$or = [
        { name: { $regex: searchRegex } },
        { rank: { $regex: searchRegex } },
        { email: { $regex: searchRegex } },
        { serviceNumber: { $regex: searchRegex } },
      ];
    }
    
    // Execute query with optimized options
    const skip = (page - 1) * pageSize;
    const personnel = await Personnel.find(query, {}, { lean: true })
      .skip(skip)
      .limit(pageSize)
      .sort({ lastUpdated: -1 });
    
    // Get total count for pagination
    const total = await Personnel.countDocuments(query);
    const totalPages = Math.ceil(total / pageSize);
    
    // Create response with cache control to prevent browser caching
    const response = NextResponse.json({
      success: true,
      data: {
        personnel,
        totalPages,
        pagination: {
          total,
          page,
          pageSize,
          pages: totalPages,
        },
      },
    });
    
    // Set cache control headers to prevent browser caching
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    
    return response;
  } catch (error: any) {
    console.error('Error fetching personnel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching personnel' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new personnel record
 */
export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Validate token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication token is required' }, 
        { status: 401 }
      );
    }
    
    const decoded = await validateToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' }, 
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || (user.role !== 'administrator' && user.role !== 'admin' && user.role !== 'director')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' }, 
        { status: 403 }
      );
    }
    
    // Parse request body
    const newPersonnelData = await request.json();
    
    // Normalize status if present
    if (newPersonnelData.status) {
      newPersonnelData.status = normalizeStatus(newPersonnelData.status);
    }
    
    // Create new personnel
    const personnel = new Personnel(newPersonnelData);
    const savedPersonnel = await personnel.save();
    
    // Log the admin action
    await logAdminAction(
      decoded.userId,
      `${user.firstName} ${user.lastName}`,
      user.role,
      'create',
      savedPersonnel._id.toString(),
      `Created personnel record: ${savedPersonnel.name.firstName} ${savedPersonnel.name.lastName} (${savedPersonnel.serviceNumber})`,
      request
    );
    
    return NextResponse.json({
      success: true,
      data: savedPersonnel
    });
  } catch (error: any) {
    console.error('Error creating personnel:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          errors: validationErrors 
        }, 
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Duplicate entry error', 
          error: `A record with this ${Object.keys(error.keyValue)[0]} already exists.` 
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to create personnel record', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a personnel record
 */
export async function DELETE(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Get personnel ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Personnel ID is required' }, 
        { status: 400 }
      );
    }
    
    // Validate token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication token is required' }, 
        { status: 401 }
      );
    }
    
    const decoded = await validateToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' }, 
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || (user.role !== 'administrator' && user.role !== 'admin' && user.role !== 'director')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' }, 
        { status: 403 }
      );
    }
    
    // Find personnel by ID
    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return NextResponse.json(
        { success: false, message: 'Personnel not found' }, 
        { status: 404 }
      );
    }
    
    // Delete personnel
    await Personnel.findByIdAndDelete(id);
    
    // Log the admin action
    await logAdminAction(
      decoded.userId,
      `${user.firstName} ${user.lastName}`,
      user.role,
      'delete',
      id,
      `Deleted personnel record: ${personnel.name.firstName} ${personnel.name.lastName} (${personnel.serviceNumber})`,
      request
    );
    
    return NextResponse.json({
      success: true,
      message: 'Personnel deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting personnel:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to delete personnel record', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}

// PUT handler to update personnel
export async function PUT(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Validate token
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication token is required' }, 
        { status: 401 }
      );
    }
    
    const decoded = await validateToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' }, 
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = await User.findById(decoded.userId);
    if (!user || (user.role !== 'administrator' && user.role !== 'admin' && user.role !== 'director')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin access required' }, 
        { status: 403 }
      );
    }
    
    // Parse request body
    const { id, data } = await request.json();
    
    if (!id || !data) {
      return NextResponse.json(
        { success: false, message: 'Personnel ID and update data are required' }, 
        { status: 400 }
      );
    }
    
    // Normalize status if present in the update data
    if (data.status) {
      data.status = normalizeStatus(data.status);
    }
    
    // Find personnel by ID
    const personnel = await Personnel.findById(id);
    if (!personnel) {
      return NextResponse.json(
        { success: false, message: 'Personnel not found' }, 
        { status: 404 }
      );
    }
    
    // Update personnel
    const updatedPersonnel = await Personnel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    // Log the admin action
    await logAdminAction(
      decoded.userId,
      `${user.firstName} ${user.lastName}`,
      user.role,
      'update',
      id,
      `Updated personnel record: ${personnel.name.firstName} ${personnel.name.lastName} (${personnel.serviceNumber})`,
      request
    );
    
    return NextResponse.json({
      success: true,
      data: updatedPersonnel
    });
  } catch (error: any) {
    console.error('Error updating personnel:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Validation error', 
          errors: validationErrors 
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to update personnel record', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
} 