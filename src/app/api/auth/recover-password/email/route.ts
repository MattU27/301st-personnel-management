import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Token, { TokenType } from '@/models/Token';
import { sendPasswordResetEmail } from '@/services/emailService';
import mongoose from 'mongoose';

/**
 * API endpoint for requesting a password reset using alternative email
 * POST /api/auth/recover-password/email
 */
export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get email from request body
    const body = await req.json().catch(err => {
      console.error('Error parsing request body:', err);
      return {};
    });
    
    const { email } = body;
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email address is required' 
      }, { status: 400 });
    }
    
    console.log(`Password reset requested for email: ${email}`);
    
    // Check if there's a user with this alternative email
    const user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { alternativeEmail: email.toLowerCase() }
      ]
    });
    
    // For security reasons, always return the same response regardless of whether
    // the user was found or not to prevent email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({ 
        success: true,
        message: 'If your email is registered in our system, you will receive a password reset link.'
      });
    }
    
    try {
      // Generate a password reset token
      const resetToken = await Token.generatePasswordResetToken(user._id);
      
      // Send the password reset email
      const emailSent = await sendPasswordResetEmail(
        email,
        resetToken,
        user.firstName || 'User',
        user.lastName || ''
      );
      
      if (!emailSent) {
        console.error(`Failed to send password reset email to ${email}`);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to send password reset email. Please try again later.' 
        }, { status: 500 });
      }
      
      console.log(`Password reset email sent to ${email}`);
      return NextResponse.json({ 
        success: true,
        message: 'If your email is registered in our system, you will receive a password reset link.'
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