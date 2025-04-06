import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/utils/auth';

// GET /api/personnel/accounts - List all pending account requests
export async function GET(req: NextRequest) {
  try {
    // Verify authentication token
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !['staff', 'admin', 'director'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only staff, administrators and directors can view account requests' },
        { status: 403 }
      );
    }
    
    // In a real implementation, this would fetch data from a database
    // For now, return mock data
    const accountRequests = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@army.mil.ph',
        rank: 'Private First Class',
        company: 'Alpha',
        submittedAt: '2024-04-01T10:30:00Z',
        status: 'pending'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@army.mil.ph',
        rank: 'Corporal',
        company: 'Bravo',
        submittedAt: '2024-04-02T08:15:00Z',
        status: 'pending'
      },
      {
        id: '3',
        name: 'Michael Davis',
        email: 'michael.davis@army.mil.ph',
        rank: 'Sergeant',
        company: 'Charlie',
        submittedAt: '2024-04-02T14:45:00Z',
        status: 'pending'
      },
      {
        id: '4',
        name: 'Lisa Wilson',
        email: 'lisa.wilson@army.mil.ph',
        rank: 'Staff Sergeant',
        company: 'Headquarters',
        submittedAt: '2024-04-03T09:20:00Z',
        status: 'pending'
      }
    ];
    
    return NextResponse.json({ accounts: accountRequests });
  } catch (error) {
    console.error('Error fetching account requests:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/personnel/accounts/:id - Update an account request (approve/reject)
export async function PATCH(req: NextRequest) {
  try {
    // Verify authentication token
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const decoded = await verifyJWT(token);
    if (!decoded || !['staff', 'admin', 'director'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Only staff, administrators and directors can approve/reject account requests' },
        { status: 403 }
      );
    }
    
    // Parse the request body
    const data = await req.json();
    const { id, status, rejectionReason } = data;
    
    if (!id || !status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    
    // In a real implementation, this would update the account status in a database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: `Account ${status}`,
      accountId: id
    });
  } catch (error) {
    console.error('Error updating account request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 