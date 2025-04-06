import { NextResponse } from 'next/server';
import { dbConnect } from '@/utils/dbConnect';
import mongoose from 'mongoose';

// Define route segment config
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Get the military ID from the URL
    const url = new URL(request.url);
    const militaryId = url.searchParams.get('id');
    
    if (!militaryId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Military ID is required' 
      }, { status: 400 });
    }
    
    // Check if the military ID exists in the database
    const userCollection = await mongoose.connection.collection('users');
    const existingUser = await userCollection.findOne({ militaryId });
    
    return NextResponse.json({
      success: true,
      exists: !!existingUser
    });
    
  } catch (error: any) {
    console.error('Check military ID error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error checking military ID' 
    }, { status: 500 });
  }
} 