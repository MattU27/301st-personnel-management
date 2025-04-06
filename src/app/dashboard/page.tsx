"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  UserIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  BellAlertIcon, 
  CalendarIcon, 
  ChartBarIcon, 
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  CubeIcon,
  CheckCircleIcon,
  BoltIcon,
  UserPlusIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  HeartIcon,
  DocumentCheckIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import ReadinessChart from '@/components/ReadinessChart';
import { toast } from 'react-hot-toast';

// Define interfaces for the state types
interface ReadinessData {
  company: string;
  personnel: number;
  readyPersonnel: number;
  documentsComplete: number;
  trainingsComplete: number;
  readinessScore: number;
}

interface ActivityData {
  id: string;
  type: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

// Define interfaces for API response data
interface PersonnelStatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    companies?: ReadinessData[];
  };
}

interface DocumentStatsResponse {
  success: boolean;
  data: {
    total: number;
    pending: number;
    verified: number;
  };
}

interface TrainingStatsResponse {
  success: boolean;
  data: {
    upcoming: number;
    completed: number;
    totalRegistrations: number;
    completedRegistrations: number;
  };
}

interface ActivityResponse {
  success: boolean;
  data: {
    activities: ActivityData[];
  };
}

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, hasSpecificPermission } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPersonnel: 0,
    activePersonnel: 0,
    pendingDocuments: 0,
    verifiedDocuments: 0,
    documentCompletionRate: 0,
    upcomingTrainings: 0,
    completedTrainings: 0,
    trainingParticipationRate: 0,
    readinessScore: 0
  });

  const [readinessData, setReadinessData] = useState<ReadinessData[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityData[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is an admin
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Fetch personnel stats
        const personnelResponse = await fetch('/api/personnel/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fetch document stats
        const documentsResponse = await fetch('/api/documents/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fetch training stats
        const trainingsResponse = await fetch('/api/trainings/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Fetch recent activity
        const activityResponse = await fetch('/api/activity', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!personnelResponse.ok || !documentsResponse.ok || !trainingsResponse.ok || !activityResponse.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const personnelData = await personnelResponse.json();
        const documentsData = await documentsResponse.json();
        const trainingsData = await trainingsResponse.json();
        const activityData = await activityResponse.json();
        
        if (personnelData.success && documentsData.success && trainingsData.success && activityData.success) {
          // Update stats
          setStats({
            totalPersonnel: personnelData.data.total || 0,
            activePersonnel: personnelData.data.active || 0,
            pendingDocuments: documentsData.data.pending || 0,
            verifiedDocuments: documentsData.data.verified || 0,
            documentCompletionRate: calculateDocumentCompletionRate(documentsData),
            upcomingTrainings: trainingsData.data.upcoming || 0,
            completedTrainings: trainingsData.data.completed || 0,
            trainingParticipationRate: calculateTrainingParticipationRate(trainingsData),
            readinessScore: calculateReadinessScore(personnelData, documentsData, trainingsData)
          });
          
          // Update readiness data if available
          if (personnelData.data.companies) {
            setReadinessData(personnelData.data.companies);
          }
          
          // Set recent activity
          if (activityData.data.activities) {
            setRecentActivity(activityData.data.activities);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to default values if API calls fail
        setStats({
          totalPersonnel: 245,
          activePersonnel: 198,
          pendingDocuments: 12,
          verifiedDocuments: 0,
          documentCompletionRate: 0,
          upcomingTrainings: 3,
          completedTrainings: 87,
          trainingParticipationRate: 0,
          readinessScore: 78
        });
        
        // Use example data for readiness
        setReadinessData([
          {
            company: 'Alpha',
            personnel: 45,
            readyPersonnel: 38,
            documentsComplete: 92,
            trainingsComplete: 85,
            readinessScore: 88
          },
          {
            company: 'Bravo',
            personnel: 42,
            readyPersonnel: 35,
            documentsComplete: 88,
            trainingsComplete: 82,
            readinessScore: 85
          },
          {
            company: 'Charlie',
            personnel: 38,
            readyPersonnel: 30,
            documentsComplete: 78,
            trainingsComplete: 75,
            readinessScore: 76
          },
          {
            company: 'HQ',
            personnel: 25,
            readyPersonnel: 23,
            documentsComplete: 95,
            trainingsComplete: 90,
            readinessScore: 93
          },
          {
            company: 'Signal',
            personnel: 30,
            readyPersonnel: 24,
            documentsComplete: 80,
            trainingsComplete: 78,
            readinessScore: 79
          },
          {
            company: 'FAB',
            personnel: 35,
            readyPersonnel: 28,
            documentsComplete: 82,
            trainingsComplete: 80,
            readinessScore: 81
          }
        ]);
        
        // Use example data for activity
        setRecentActivity([
          {
            id: '1',
            type: 'personnel',
            action: 'created',
            details: 'Staff account created for Jane Smith',
            timestamp: new Date().toISOString(),
            user: 'admin'
          },
          {
            id: '2',
            type: 'document',
            action: 'uploaded',
            details: 'New policy document uploaded',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user: 'admin'
          },
          {
            id: '3',
            type: 'training',
            action: 'published',
            details: 'New training schedule published',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            user: 'admin'
          },
          {
            id: '4',
            type: 'personnel',
            action: 'updated',
            details: 'Batch processing of 15 personnel records',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            user: 'admin'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);
  
  // Helper function to calculate overall readiness score
  const calculateReadinessScore = (
    personnelData: PersonnelStatsResponse, 
    documentsData: DocumentStatsResponse, 
    trainingsData: TrainingStatsResponse
  ): number => {
    const documentCompletionRate = documentsData.data.verified / (documentsData.data.total || 1) * 100;
    const trainingCompletionRate = trainingsData.data.completedRegistrations / (trainingsData.data.totalRegistrations || 1) * 100;
    const personnelActiveRate = personnelData.data.active / (personnelData.data.total || 1) * 100;
    
    // Weight factors (can be adjusted as needed)
    const documentWeight = 0.3;
    const trainingWeight = 0.5;
    const personnelWeight = 0.2;
    
    // Calculate weighted average
    const readinessScore = Math.round(
      (documentCompletionRate * documentWeight) +
      (trainingCompletionRate * trainingWeight) +
      (personnelActiveRate * personnelWeight)
    );
    
    return Math.min(readinessScore, 100); // Ensure score doesn't exceed 100
  };

  // Helper function to calculate document completion rate
  const calculateDocumentCompletionRate = (documentsData: DocumentStatsResponse): number => {
    return Math.round(documentsData.data.verified / (documentsData.data.total || 1) * 100);
  };

  // Helper function to calculate training participation rate
  const calculateTrainingParticipationRate = (trainingsData: TrainingStatsResponse): number => {
    return Math.round(trainingsData.data.completedRegistrations / (trainingsData.data.totalRegistrations || 1) * 100);
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleNavigation = (path: string, requiredPermission?: string) => {
    // Check if permission is required and user has it
    if (requiredPermission && !hasSpecificPermission(requiredPermission)) {
      toast.error('You do not have permission to access this feature.');
      return;
    }
    router.push(path);
  };

  const renderReservistDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="bg-indigo-100 rounded-full p-3">
            <UserIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user.firstName} {user.lastName}</h2>
            <p className="text-sm text-gray-500">
              {user.rank} | {user.company} Company | Status: {user.status}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="My Documents">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-500">Completed</span>
              <span className="text-sm font-medium text-gray-900">4/6</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '66%' }}></div>
            </div>
            <ul className="mt-4 space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Personal Information Form</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Verified
                </span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Medical Certificate</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </li>
            </ul>
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full mt-4"
              onClick={() => handleNavigation('/documents')}
            >
              View All Documents
            </Button>
          </div>
        </Card>

        <Card title="Upcoming Trainings">
          <div className="space-y-4">
            <ul className="space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <div className="ml-2">
                    <span className="text-sm font-medium text-gray-900">Basic Combat Training</span>
                    <p className="text-xs text-gray-500">March 15, 2024 - Camp Aguinaldo</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => handleNavigation('/trainings/register/basic-combat')}
                >
                  Register
                </Button>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <div className="ml-2">
                    <span className="text-sm font-medium text-gray-900">First Aid Seminar</span>
                    <p className="text-xs text-gray-500">April 2, 2024 - Medical Center</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="primary"
                  onClick={() => handleNavigation('/trainings/register/first-aid')}
                >
                  Register
                </Button>
              </li>
            </ul>
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full mt-4"
              onClick={() => handleNavigation('/trainings')}
            >
              View All Trainings
            </Button>
          </div>
        </Card>
      </div>

      <Card title="Recent Announcements">
        <div className="space-y-4">
          <div className="border-l-4 border-indigo-500 pl-4 py-2">
            <p className="text-sm font-medium text-gray-900">Annual Physical Fitness Test</p>
            <p className="text-xs text-gray-500">Posted on March 1, 2024</p>
            <p className="mt-1 text-sm text-gray-600">
              All reservists are required to attend the annual physical fitness test on April 10, 2024.
            </p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4 py-2">
            <p className="text-sm font-medium text-gray-900">Document Submission Deadline</p>
            <p className="text-xs text-gray-500">Posted on February 25, 2024</p>
            <p className="mt-1 text-sm text-gray-600">
              Please submit all required documents by March 31, 2024 to maintain your active status.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStaffDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="bg-indigo-100 rounded-full p-3">
            <UserIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user.firstName} {user.lastName}</h2>
            <p className="text-sm text-gray-500">Staff | {user.company || 'All'} Company</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-full p-3">
                <UserGroupIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{stats.totalPersonnel}</h3>
                <p className="text-sm text-gray-500">Total Personnel</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleNavigation('/personnel', 'view_personnel')}
            >
              View All
            </Button>
          </div>
        </Card>
        <Card>
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <UserIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{stats.activePersonnel}</h3>
              <p className="text-sm text-gray-500">Active Personnel</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-3">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{stats.pendingDocuments}</h3>
                <p className="text-sm text-gray-500">Pending Documents</p>
              </div>
            </div>
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => handleNavigation('/documents/pending', 'manage_documents')}
            >
              Review
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Personnel Management">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Recent Updates</span>
              <Button size="sm" variant="secondary">View All</Button>
            </div>
            <ul className="mt-4 space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">John Doe (Alpha) - Updated Profile</span>
                </div>
                <span className="text-xs text-gray-500">2h ago</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Jane Smith (Bravo) - New Registration</span>
                </div>
                <span className="text-xs text-gray-500">5h ago</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Mike Johnson (Charlie) - Status Change</span>
                </div>
                <span className="text-xs text-gray-500">1d ago</span>
              </li>
            </ul>
            <div className="flex space-x-2 mt-4">
              <Button 
                size="sm" 
                variant="primary"
                onClick={() => router.push('/personnel/manage')}
              >
                Add Personnel
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => router.push('/companies')}
              >
                Manage Companies
              </Button>
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => router.push('/personnel/accounts')}
              >
                Manage Accounts
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Document Verification">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">Pending Verification</span>
              <Button size="sm" variant="secondary">View All</Button>
            </div>
            <ul className="mt-4 space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Medical Certificate - John Doe</span>
                </div>
                <Button size="sm" variant="info">Verify</Button>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Training Certificate - Jane Smith</span>
                </div>
                <Button size="sm" variant="info">Verify</Button>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Personal Information - Mike Johnson</span>
                </div>
                <Button size="sm" variant="info">Verify</Button>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Personnel administration card */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">Personnel Administration</h2>
          </div>
          <p className="text-gray-600 mb-4">Manage personnel accounts and records across all companies.</p>
          <div className="space-y-2">
            {hasSpecificPermission('view_personnel') && (
              <Button 
                variant="primary" 
                className="w-full" 
                onClick={() => handleNavigation('/personnel', 'view_personnel')}
              >
                View All Personnel
              </Button>
            )}
            {hasSpecificPermission('manage_company_personnel') && (
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleNavigation('/companies', 'manage_company_personnel')}
              >
                Manage Companies
              </Button>
            )}
            {hasSpecificPermission('approve_reservist_accounts') && (
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleNavigation('/personnel/accounts', 'approve_reservist_accounts')}
              >
                Review Account Requests
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Document management card */}
      {hasSpecificPermission('manage_documents') && (
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Document Management</h2>
            </div>
            <p className="text-gray-600 mb-4">Manage and validate official documents.</p>
            <div className="space-y-2">
              <Button 
                variant="primary" 
                className="w-full" 
                onClick={() => handleNavigation('/documents', 'manage_documents')}
              >
                Manage Documents
              </Button>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => handleNavigation('/documents/validation', 'manage_documents')}
              >
                Document Validation
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Policy control card */}
      {(hasSpecificPermission('upload_policy') || hasSpecificPermission('edit_policy') || hasSpecificPermission('delete_policy')) && (
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <ClipboardDocumentListIcon className="h-8 w-8 text-indigo-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Policy Control</h2>
            </div>
            <p className="text-gray-600 mb-4">Manage organizational policies and guidelines.</p>
            <div className="space-y-2">
              <Button 
                variant="primary" 
                className="w-full" 
                onClick={() => handleNavigation('/policies', 'upload_policy')}
              >
                Manage Policies
              </Button>
              {hasSpecificPermission('edit_policy') && (
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={() => handleNavigation('/policies/archive', 'edit_policy')}
                >
                  Policy Archive
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* System administration card - only for administrators */}
      {(hasSpecificPermission('create_admin_accounts') || hasSpecificPermission('view_audit_logs')) && (
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <Cog6ToothIcon className="h-8 w-8 text-indigo-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">System Administration</h2>
            </div>
            <p className="text-gray-600 mb-4">Advanced system management functions.</p>
            <div className="space-y-2">
              {hasSpecificPermission('create_admin_accounts') && (
                <Button 
                  variant="primary" 
                  className="w-full" 
                  onClick={() => handleNavigation('/admin/create', 'create_admin_accounts')}
                >
                  Create Admin Account
                </Button>
              )}
              {hasSpecificPermission('view_audit_logs') && (
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={() => handleNavigation('/admin/audit-logs', 'view_audit_logs')}
                >
                  View Audit Logs
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderDirectorDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Analytics Overview card */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">Analytics & Reporting</h2>
          </div>
          <p className="text-gray-600 mb-4">View comprehensive analytics and generate reports.</p>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={() => handleNavigation('/analytics', 'view_audit_logs')}
            >
              View Analytics Dashboard
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => handleNavigation('/analytics/reports', 'run_reports')}
            >
              Generate Reports
            </Button>
          </div>
        </div>
      </Card>

      {/* System Administration card */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Cog6ToothIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">System Administration</h2>
          </div>
          <p className="text-gray-600 mb-4">Oversee and manage system settings and administrators.</p>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={() => handleNavigation('/admin/accounts', 'create_admin_accounts')}
            >
              Manage Admin Accounts
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => handleNavigation('/admin/settings', 'access_system_settings')}
            >
              System Configuration
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => handleNavigation('/admin/audit-logs', 'view_audit_logs')}
            >
              View Audit Logs
            </Button>
          </div>
        </div>
      </Card>

      {/* Strategic Overview card */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <BoltIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">Strategic Overview</h2>
          </div>
          <p className="text-gray-600 mb-4">Access high-level organizational metrics and KPIs.</p>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={() => handleNavigation('/analytics/readiness', 'view_personnel')}
            >
              Readiness Assessment
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => handleNavigation('/analytics/performance', 'run_reports')}
            >
              Performance Metrics
            </Button>
          </div>
        </div>
      </Card>

      {/* Resource Management card */}
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <CubeIcon className="h-8 w-8 text-indigo-600" />
            <h2 className="ml-3 text-lg font-medium text-gray-900">Resource Management</h2>
          </div>
          <p className="text-gray-600 mb-4">Oversee and allocate resources across companies.</p>
          <div className="space-y-2">
            <Button 
              variant="primary" 
              className="w-full" 
              onClick={() => handleNavigation('/resources', 'manage_company_personnel')}
            >
              Resource Allocation
            </Button>
            <Button 
              variant="secondary" 
              className="w-full" 
              onClick={() => handleNavigation('/companies', 'manage_company_personnel')}
            >
              Manage Companies
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Message */}
      <div className="mb-6">
        <Card>
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3 mr-4">
              <UserIcon className="h-8 w-8 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Welcome, {user?.firstName} {user?.lastName}</h2>
              <p className="text-sm text-gray-700">{user?.role === 'director' ? 'Director' : user?.role === 'admin' ? 'Administrator' : user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}{user?.rank ? ` | ${user?.rank}` : ''}{user?.company ? ` | ${user?.company} Company` : ''}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* System Overview Section */}
      <div className="mb-6">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-100 rounded-lg p-4 border border-indigo-200">
              <div className="flex items-center mb-3">
                <UserGroupIcon className="h-5 w-5 text-indigo-700 mr-2" />
                <h4 className="text-md font-semibold text-gray-900">Personnel</h4>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Total:</span>
                <span className="text-sm font-bold text-gray-900">{stats.totalPersonnel}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Active:</span>
                <span className="text-sm font-bold text-gray-900">{stats.activePersonnel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Readiness:</span>
                <span className="text-sm font-bold text-gray-900">{stats.readinessScore}%</span>
              </div>
            </div>
            
            <div className="bg-emerald-100 rounded-lg p-4 border border-emerald-200">
              <div className="flex items-center mb-3">
                <DocumentTextIcon className="h-5 w-5 text-emerald-700 mr-2" />
                <h4 className="text-md font-semibold text-gray-900">Documents</h4>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Pending:</span>
                <span className="text-sm font-bold text-gray-900">{stats.pendingDocuments}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Verified:</span>
                <span className="text-sm font-bold text-gray-900">{stats.verifiedDocuments || "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Completion:</span>
                <span className="text-sm font-bold text-gray-900">{stats.documentCompletionRate || "N/A"}%</span>
              </div>
            </div>
            
            <div className="bg-amber-100 rounded-lg p-4 border border-amber-200">
              <div className="flex items-center mb-3">
                <AcademicCapIcon className="h-5 w-5 text-amber-700 mr-2" />
                <h4 className="text-md font-semibold text-gray-900">Trainings</h4>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Upcoming:</span>
                <span className="text-sm font-bold text-gray-900">{stats.upcomingTrainings}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Completed:</span>
                <span className="text-sm font-bold text-gray-900">{stats.completedTrainings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Participation:</span>
                <span className="text-sm font-bold text-gray-900">{stats.trainingParticipationRate || "N/A"}%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Role-specific Dashboards */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        {user?.role === 'director' && renderDirectorDashboard()}
        {user?.role === 'admin' && renderAdminDashboard()}
        {user?.role === 'staff' && renderStaffDashboard()}
        {user?.role === 'reservist' && renderReservistDashboard()}
      </div>

      {/* Readiness Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Readiness Status">
          {readinessData.length > 0 ? (
            <div className="h-80">
              <ReadinessChart 
                data={readinessData} 
                type="bar"
                title="Company Readiness"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-md">Readiness data not available</p>
              <p className="text-gray-400 text-sm mt-1">Check back later for updated statistics</p>
            </div>
          )}
        </Card>

        <Card title="Recent Activity">
          {recentActivity.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {recentActivity.slice(0, 5).map((activity) => (
                <li key={activity.id} className="py-2">
                  <div className="flex items-center space-x-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="truncate text-sm text-gray-500">{activity.details}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <time className="text-xs text-gray-500">{activity.timestamp}</time>
                      <p className="text-xs text-gray-400">{activity.user}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <ClipboardDocumentListIcon className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 text-md">No recent activity to display</p>
              <p className="text-gray-400 text-sm mt-1">Activity will appear here as you use the system</p>
            </div>
          )}
          <div className="mt-4 text-right">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => router.push('/activity')}
              className="inline-flex items-center"
            >
              View all activity
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 