import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Policy from '@/models/Policy';
import { verifyAuthToken } from '@/lib/auth';
import mongoose from 'mongoose';

// Define policy status for server-side use only
enum PolicyStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// GET handler to retrieve policies
export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const queryParams: any = {};

    // Add filters if provided
    if (status) {
      queryParams.status = status;
    }
    if (category) {
      queryParams.category = category;
    }

    // Fetch policies with optional filters
    const policies = await Policy.find(queryParams)
      .sort({ updatedAt: -1 })
      .populate('createdBy', 'firstName lastName email')
      .lean();

    return NextResponse.json({ policies }, { status: 200 });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

// POST handler to create a new policy
export async function POST(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const decoded = await verifyAuthToken(token);
    if (!decoded || !['admin', 'director'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can create policies' },
        { status: 403 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Parse request body
    const data = await request.json();
    
    // Create new policy
    const policy = new Policy({
      ...data,
      createdBy: new mongoose.Types.ObjectId(decoded.id)
    });

    // Save the policy
    await policy.save();

    return NextResponse.json(
      { message: 'Policy created successfully', policy },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating policy:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: 'Validation error', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A policy with this title and version already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}

// PUT handler to update a policy
export async function PUT(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const decoded = await verifyAuthToken(token);
    if (!decoded || !['admin', 'director'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can update policies' },
        { status: 403 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Parse request body
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Policy ID is required' },
        { status: 400 }
      );
    }

    // Find and update the policy
    const updatedPolicy = await Policy.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPolicy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Policy updated successfully', policy: updatedPolicy },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating policy:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: 'Validation error', details: validationErrors },
        { status: 400 }
      );
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A policy with this title and version already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update policy' },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a policy
export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const decoded = await verifyAuthToken(token);
    if (!decoded || !['admin', 'director'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only administrators can delete policies' },
        { status: 403 }
      );
    }

    // Connect to the database
    await connectToDatabase();

    // Extract policy ID from query parameters
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Policy ID is required' },
        { status: 400 }
      );
    }

    // Find and archive the policy instead of deleting it
    const updatedPolicy = await Policy.findByIdAndUpdate(
      id,
      { status: PolicyStatus.ARCHIVED },
      { new: true }
    );

    if (!updatedPolicy) {
      return NextResponse.json(
        { error: 'Policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Policy archived successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error archiving policy:', error);
    return NextResponse.json(
      { error: 'Failed to archive policy' },
      { status: 500 }
    );
  }
} 