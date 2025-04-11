import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Token, { TokenType } from '@/models/Token';
import bcrypt from 'bcryptjs';

/**
 * API endpoint for resetting a password with a token
 * POST /api/auth/reset-password
 */
export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectDB();
    
    // Get token and new password from request body
    const body = await req.json().catch(err => {
      console.error('Error parsing request body:', err);
      return {};
    });
    
    const { token, newPassword } = body;
    
    if (!token || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token and new password are required' 
      }, { status: 400 });
    }
    
    console.log(`Password reset requested with token: ${token.substring(0, 8)}...`);
    
    // Find the token in the database
    const resetToken = await Token.findOne({
      token,
      type: TokenType.PASSWORD_RESET,
    });
    
    // Check if token exists and is valid
    if (!resetToken) {
      console.error('Reset token not found in database');
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid or expired password reset token' 
      }, { status: 400 });
    }
    
    if (!resetToken.isValid()) {
      console.error('Reset token expired');
      return NextResponse.json({ 
        success: false, 
        error: 'Password reset token has expired. Please request a new one.' 
      }, { status: 400 });
    }
    
    // Get the user associated with the token
    const user = await User.findById(resetToken.userId);
    
    if (!user) {
      console.error(`User not found for token userId: ${resetToken.userId}`);
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 });
    }
    
    try {
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the user's password
      user.password = hashedPassword;
      await user.save();
      
      // Delete the used token
      await Token.deleteOne({ _id: resetToken._id });
      
      console.log(`Password reset successful for user ${user._id}`);
      return NextResponse.json({ 
        success: true,
        message: 'Password has been reset successfully'
      });
    } catch (passwordError) {
      console.error('Error updating password:', passwordError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update password. Please try again later.' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'An error occurred while resetting your password. Please try again later.' 
    }, { status: 500 });
  }
} 