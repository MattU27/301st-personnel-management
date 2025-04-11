import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Token, { TokenType } from '@/models/Token';
import { sendPasswordResetEmail } from '@/services/emailService';

/**
 * API endpoint for requesting a password reset using Service ID
 * POST /api/auth/recover-password/service-id
 */
export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get service ID from request body
    const body = await req.json().catch(err => {
      console.error('Error parsing request body:', err);
      return {};
    });
    
    const { serviceId } = body;
    
    if (!serviceId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Service ID is required' 
      }, { status: 400 });
    }
    
    console.log(`Password reset requested for Service ID: ${serviceId}`);
    
    // Find user by service ID
    const user = await User.findOne({ serviceId: serviceId.trim() });
    
    // For security reasons, always return the same response regardless of whether
    // the user was found or not to prevent enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent Service ID: ${serviceId}`);
      return NextResponse.json({ 
        success: true,
        message: 'If your Service ID is registered in our system, you will receive a password reset link at your registered email address.'
      });
    }
    
    // Make sure user has an email
    if (!user.email) {
      console.error(`User ${user._id} (Service ID: ${serviceId}) has no registered email`);
      return NextResponse.json({ 
        success: false, 
        error: 'No email address associated with this Service ID' 
      }, { status: 404 });
    }
    
    try {
      // Generate a password reset token
      const resetToken = await Token.generatePasswordResetToken(user._id);
      
      // Send the password reset email to the user's primary email
      const emailSent = await sendPasswordResetEmail(
        user.email,
        resetToken,
        user.firstName || 'User',
        user.lastName || ''
      );
      
      if (!emailSent) {
        console.error(`Failed to send password reset email to ${user.email}`);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to send password reset email. Please try again later.' 
        }, { status: 500 });
      }
      
      console.log(`Password reset email sent to ${user.email} for Service ID ${serviceId}`);
      return NextResponse.json({ 
        success: true,
        message: 'If your Service ID is registered in our system, you will receive a password reset link at your registered email address.'
      });
    } catch (tokenError) {
      console.error('Token generation or email sending error:', tokenError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to process password reset request. Please try again later.' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred during password recovery. Please try again later.' 
    }, { status: 500 });
  }
} 