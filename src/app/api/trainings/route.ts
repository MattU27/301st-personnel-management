import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import Training, { TrainingStatus } from '@/models/Training';
import User from '@/models/User';
import { verifyJWT } from '@/utils/auth';
import mongoose from 'mongoose';
import AuditLog from '@/models/AuditLog';

// Add dynamic directive to ensure route is dynamic
export const dynamic = 'force-dynamic';

/**
 * GET handler to retrieve trainings
 */
export async function GET(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Import the models to ensure they're registered before using them
    await Promise.all([
      import('@/models/User'),
      import('@/models/Training')
    ]);
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const trainingId = searchParams.get('trainingId');
    
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
    
    // Build query
    const query: any = {};
    
    // If trainingId is provided, fetch a specific training
    if (trainingId) {
      query._id = new mongoose.Types.ObjectId(trainingId);
    }
    
    // Filter by status if provided
    if (status && Object.values(TrainingStatus).includes(status as TrainingStatus)) {
      query.status = status;
    }
    
    // If userId is provided, filter by attendees
    if (userId) {
      query['attendees.userId'] = new mongoose.Types.ObjectId(userId);
    }
    
    // Get user details for role-based filtering
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Implement role-based filtering
    // Directors and Administrators can see all trainings
    if (user.role !== 'director' && user.role !== 'administrator' && user.role !== 'admin') {
      // Staff, Enlisted, and Reservists only see trainings that:
      // 1. Are relevant to their rank (if eligibleRanks is specified)
      // 2. Are relevant to their company (if eligibleCompanies is specified)
      // 3. Are mandatory for everyone
      // 4. Or they are already registered for
      
      const userQuery = {
        $or: [
          // If no eligibleRanks is specified, or user's rank is in eligibleRanks
          { 
            $or: [
              { eligibleRanks: { $exists: false } },
              { eligibleRanks: { $size: 0 } },
              { eligibleRanks: user.rank }
            ]
          },
          // If no eligibleCompanies is specified, or user's company is in eligibleCompanies
          { 
            $or: [
              { eligibleCompanies: { $exists: false } },
              { eligibleCompanies: { $size: 0 } },
              { eligibleCompanies: user.company }
            ]
          },
          // Trainings that are mandatory
          { mandatory: true },
          // Trainings that the user is already registered for
          { 'attendees.userId': user._id }
        ]
      };
      
      // Merge with existing query
      query.$and = query.$and ? [...query.$and, userQuery] : [query, userQuery];
    }
    
    // Execute query and populate attendee user data
    const trainings = await Training.find(query)
      .populate({
        path: 'attendees.userId',
        select: 'firstName lastName rank company email serviceNumber militaryId', 
        model: User
      })
      .sort({ startDate: 1 })
      .lean();
    
    // Process trainings to add registration status and format attendee data
    const processedTrainings = trainings.map(training => {
      const userAttendee = training.attendees?.find(
        (attendee: { userId: mongoose.Types.ObjectId | string | any }) => 
          attendee.userId && attendee.userId._id && 
          attendee.userId._id.toString() === decoded.userId
      );
      
      // Format attendees to include user data in a more accessible format
      const formattedAttendees = training.attendees?.map((attendee: any) => {
        if (attendee.userId && typeof attendee.userId === 'object') {
          return {
            ...attendee,
            userData: {
              firstName: attendee.userId.firstName,
              lastName: attendee.userId.lastName,
              rank: attendee.userId.rank,
              company: attendee.userId.company,
              email: attendee.userId.email,
              militaryId: attendee.userId.militaryId
            },
            userId: attendee.userId._id
          };
        }
        return attendee;
      });
      
      return {
        ...training,
        attendees: formattedAttendees || [],
        registrationStatus: userAttendee ? userAttendee.status : 'not_registered'
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        trainings: processedTrainings
      }
    });
  } catch (error: any) {
    console.error('Error fetching trainings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching trainings' },
      { status: 500 }
    );
  }
}

/**
 * POST handler to register for a training
 */
export async function POST(request: Request) {
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
    
    // Get data from request body
    const data = await request.json();
    const { trainingId, action } = data;
    
    if (!trainingId) {
      return NextResponse.json(
        { success: false, error: 'Training ID is required' },
        { status: 400 }
      );
    }
    
    if (!action || !['register', 'cancel'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid action (register or cancel) is required' },
        { status: 400 }
      );
    }
    
    // Find the training
    const training = await Training.findById(trainingId);
    
    if (!training) {
      return NextResponse.json(
        { success: false, error: 'Training not found' },
        { status: 404 }
      );
    }
    
    // Get user info for audit log
    const user = await User.findById(decoded.userId, 'firstName lastName role');
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if training is upcoming or ongoing
    if (training.status === TrainingStatus.COMPLETED || training.status === TrainingStatus.CANCELLED) {
      return NextResponse.json(
        { success: false, error: 'Cannot register for completed or cancelled trainings' },
        { status: 400 }
      );
    }
    
    const userId = new mongoose.Types.ObjectId(decoded.userId);
    
    // Check if user is already registered
    const attendeeIndex = training.attendees?.findIndex(
      (attendee: { userId: mongoose.Types.ObjectId | string }) => 
        attendee.userId.toString() === decoded.userId
    );
    
    let actionTaken = '';
    
    if (action === 'register') {
      // Check capacity
      if (training.capacity && training.attendees && training.attendees.length >= training.capacity) {
        return NextResponse.json(
          { success: false, error: 'Training has reached maximum capacity' },
          { status: 400 }
        );
      }
      
      // Register user
      if (attendeeIndex !== undefined && attendeeIndex >= 0) {
        // User is already registered, update their status
        training.attendees[attendeeIndex].status = 'registered';
        actionTaken = 'updated registration for';
      } else {
        // Add user to attendees
        if (!training.attendees) {
          training.attendees = [];
        }
        
        training.attendees.push({
          userId,
          status: 'registered',
          registrationDate: new Date()
        });
        actionTaken = 'registered for';
      }
    } else if (action === 'cancel') {
      // Cancel registration
      if (attendeeIndex !== undefined && attendeeIndex >= 0) {
        // Remove from attendees array
        training.attendees.splice(attendeeIndex, 1);
        actionTaken = 'cancelled registration for';
      } else {
        return NextResponse.json(
          { success: false, error: 'User is not registered for this training' },
          { status: 400 }
        );
      }
    }
    
    // Save the updated training
    await training.save();
    
    // Create audit log entry
    try {
      const auditLog = new AuditLog({
        timestamp: new Date(),
        userId: decoded.userId,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role,
        action: action === 'register' ? 'register' : 'cancel',
        resource: 'training',
        resourceId: training._id,
        details: `${actionTaken} training: ${training.title}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      await auditLog.save();
      console.log(`Training ${action} action logged to audit system`);
    } catch (auditError) {
      // Don't fail the main operation if audit logging fails
      console.error('Error logging to audit system:', auditError);
    }
    
    // Return the updated training
    return NextResponse.json({
      success: true,
      data: {
        training: {
          ...training.toObject(),
          registrationStatus: action === 'register' ? 'registered' : 'not_registered'
        }
      }
    });
  } catch (error: any) {
    console.error('Error updating training registration:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error updating training registration' },
      { status: 500 }
    );
  }
} 