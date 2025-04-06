import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Policy from '@/models/Policy';
import { verifyAuthToken } from '@/lib/auth';
import mongoose from 'mongoose';

// Define route segment config
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET handler to retrieve a single policy by ID
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Get the ID parameter
    const { id } = params;
    
    // Connect to the database
    await connectToDatabase();

    // Check that ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid policy ID format' },
        { status: 400 }
      );
    }

    // Find policy by ID
    const policy = await Policy.findById(id).populate('createdBy', 'firstName lastName email');

    if (!policy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ policy }, { status: 200 });
  } catch (error) {
    console.error('Error fetching policy:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policy' },
      { status: 500 }
    );
  }
} 