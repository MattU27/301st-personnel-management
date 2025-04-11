import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { dbConnect } from '@/utils/dbConnect';
import Training from '@/models/Training';
import User from '@/models/User';
import { verifyJWT } from '@/utils/auth';

// Add dynamic directive to ensure route is dynamic
export const dynamic = 'force-dynamic';

/**
 * GET handler to fetch personnel data for a training
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
    
    // Get training ID from URL
    const url = new URL(request.url);
    const trainingId = url.searchParams.get('trainingId');
    
    if (!trainingId) {
      return NextResponse.json(
        { success: false, error: 'Training ID is required' },
        { status: 400 }
      );
    }
    
    // Find the training
    const result = await Training.findById(trainingId)
      .populate('attendees.userId', 'firstName lastName rank company email militaryId serviceId')
      .lean();
    
    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Training not found' },
        { status: 404 }
      );
    }
    
    // Cast the result to any to work with it
    const training = result as any;
    
    // Check if the training is upcoming (future date)
    const now = new Date();
    const startDate = new Date(training.startDate);
    const endDate = new Date(training.endDate);
    const isUpcoming = startDate > now;
    const isOngoing = startDate <= now && endDate >= now;
    const isCompleted = endDate < now;
    
    // Process attendees to include complete personnel information
    const processedAttendees = await Promise.all((training.attendees || []).map(async (attendee: any) => {
      // Fix status based on training dates
      let status = attendee.status || 'registered';
      
      // Override status based on training dates
      if (isUpcoming && (status === 'attended' || status === 'completed')) {
        // If training hasn't started, attendees can't have 'attended' or 'completed' status
        status = 'registered';
      } else if (isCompleted && status === 'registered') {
        // If training is completed, update status accordingly
        status = 'completed';
      }
      
      // Get user data (either from userData or userId)
      let userData = attendee.userData || {};
      
      // If userData is not available, try to get from userId
      if (!userData.firstName && !userData.lastName && attendee.userId) {
        if (typeof attendee.userId === 'object') {
          // If userId is populated, extract user data
          const user = attendee.userId;
          userData = {
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            rank: user.rank || '',
            company: user.company || '',
            email: user.email || '',
            militaryId: user.militaryId || user.serviceId || ''
          };
        } else {
          // If userId is just an ID, fetch the user
          try {
            const userId = attendee.userId.toString();
            const user = await User.findById(userId, 'firstName lastName rank company email militaryId serviceId');
            
            if (user) {
              userData = {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                rank: user.rank || '',
                company: user.company || '',
                email: user.email || '',
                militaryId: user.militaryId || user.serviceId || ''
              };
            }
          } catch (error) {
            console.error('Error fetching user data for attendee:', error);
          }
        }
      }
      
      // Return processed attendee with updated status and userData
      return {
        ...attendee,
        status,
        userData
      };
    }));
    
    // Filter out duplicate entries based on userId
    const uniqueAttendees = [];
    const seenUserIds = new Set();
    
    for (const attendee of processedAttendees) {
      const userId = attendee.userId?._id || attendee.userId?.toString();
      
      // Skip if userId is missing or if this is a duplicate
      if (!userId || seenUserIds.has(userId)) {
        continue;
      }
      
      // Skip if both firstName and lastName are empty (blank personnel)
      if (!attendee.userData?.firstName && !attendee.userData?.lastName) {
        continue;
      }
      
      seenUserIds.add(userId);
      uniqueAttendees.push(attendee);
    }
    
    // Update the training's registered count in database to match actual unique attendees
    if (uniqueAttendees.length !== training.registered) {
      console.log(`Fixing training "${training.title}" registered count: ${training.registered} -> ${uniqueAttendees.length}`);
      
      // Update the training's registered count directly in the database
      await Training.findByIdAndUpdate(trainingId, { registered: uniqueAttendees.length });
    }
    
    // Return the processed attendees
    return NextResponse.json({
      success: true,
      data: {
        attendees: uniqueAttendees
      }
    });
  } catch (error: any) {
    console.error('Error fetching training personnel:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error fetching training personnel' },
      { status: 500 }
    );
  }
} 