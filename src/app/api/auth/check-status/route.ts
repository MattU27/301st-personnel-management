import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import User from '@/models/User';
import { UserStatus } from '@/types/auth';

interface UserDocument {
  _id: string;
  status: UserStatus;
  [key: string]: any;
}

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Get email from request body
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find user by email (only return necessary fields)
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('status')
      .lean() as UserDocument | null;
    
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Return user status
    return NextResponse.json({
      success: true,
      user: {
        status: user.status
      }
    });
  } catch (error: any) {
    console.error('Error checking user status:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while checking user status' },
      { status: 500 }
    );
  }
} 