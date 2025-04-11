import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import AuditLog from '@/models/AuditLog';

// JWT secret key - in production, this should be an environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-jwt-signing';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Get login credentials from request body
    const { email, password } = await request.json();
    
    console.log(`Login attempt for: ${email}`);
    
    // Validate email and password
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const userCollection = await mongoose.connection.collection('users');
    const user = await userCollection.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`User not found: ${email}`);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    console.log(`User found: ${email}`);
    
    // Check if user is deactivated
    if (user.status === 'deactivated' || user.status === 'inactive') {
      console.log(`Attempt to login to deactivated account: ${email}`);
      return NextResponse.json(
        { success: false, error: 'This account has been deactivated. Please contact an administrator.' },
        { status: 403 }
      );
    }
    
    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log(`Invalid password for user: ${email}`);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Update last login date
    await userCollection.updateOne(
      { _id: user._id },
      { $set: { lastLogin: new Date() } }
    );
    
    // Create user object without password
    const userWithoutPassword = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      rank: user.rank,
      company: user.company,
      profileImage: user.profileImage,
    };
    
    // Create JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        role: user.role,
        status: user.status
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    console.log(`Login successful for user: ${email}, role: ${user.role}`);
    
    // Log the successful login to the audit log
    try {
      const auditLog = new AuditLog({
        timestamp: new Date(),
        userId: user._id,
        userName: `${user.firstName} ${user.lastName}`,
        userRole: user.role,
        action: 'login',
        resource: 'user',
        details: 'User login successful',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      await auditLog.save();
      console.log('Login event logged to audit system');
    } catch (auditError) {
      // Don't fail the login if audit logging fails
      console.error('Error logging to audit system:', auditError);
    }
    
    // Create response with token and user data
    const response = NextResponse.json({
      success: true,
      data: {
        token,
        user: userWithoutPassword
      }
    });
    
    // Set the token as an HTTP-only cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: '/',
      sameSite: 'strict',
    });
    
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
} 