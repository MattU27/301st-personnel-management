"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { UserRole } from '@/types/auth';
import AnnouncementWall from '@/components/AnnouncementWall';
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
    readyPersonnel: 0,
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
  const isAdmin = user?.role === UserRole.ADMIN;

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
            readyPersonnel: personnelData.data.readyPersonnel || personnelData.data.active || 0,
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
          readyPersonnel: 0,
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

  // Helper function to get a formatted role name
  const getFormattedRoleName = (role?: UserRole): string => {
    if (!role) return 'User';
    
    if (role === UserRole.DIRECTOR) return 'Director';
    if (role === UserRole.ADMINISTRATOR || role === UserRole.ADMIN) return 'Administrator';
    
    // For other roles, capitalize the first letter
    const roleStr = role.toString();
    return roleStr.charAt(0).toUpperCase() + roleStr.slice(1);
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

  // Role-specific dashboard rendering
  const renderStaffDashboard = () => (
    <div className="space-y-6">
      {/* Stats row - stays the same */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-2">
              <UserGroupIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-md font-medium text-gray-900">{stats.totalPersonnel}</h3>
              <p className="text-xs text-gray-500">Total Personnel</p>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2">
              <UserIcon className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-md font-medium text-gray-900">{stats.readyPersonnel}</h3>
              <p className="text-xs text-gray-500">Ready Personnel</p>
            </div>
          </div>
        </Card>
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-yellow-100 rounded-full p-2">
                <DocumentTextIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-md font-medium text-gray-900">{stats.pendingDocuments}</h3>
                <p className="text-xs text-gray-500">Pending Documents</p>
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

      {/* Full-width Announcements section */}
      <div className="h-[500px]">
        <AnnouncementWall />
      </div>
    </div>
  );

  // Now let's also optimize the admin dashboard
  const renderAdminDashboard = () => (
    <div className="space-y-4">
      {/* First row - main cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Personnel administration card */}
        <Card className="h-[300px] overflow-auto">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <UserGroupIcon className="h-6 w-6 text-indigo-600" />
              <h2 className="ml-3 text-md font-medium text-gray-900">Personnel Administration</h2>
            </div>
            <p className="text-xs text-gray-600 mb-3">Manage personnel accounts and records across all companies.</p>
            <div className="space-y-2">
              {hasSpecificPermission('view_personnel') && (
                <Button 
                  variant="primary" 
                  size="sm"
                  className="w-full" 
                  onClick={() => handleNavigation('/personnel', 'view_personnel')}
                >
                  View All Personnel
                </Button>
              )}
              {hasSpecificPermission('approve_reservist_accounts') && (
                <Button 
                  variant="secondary"
                  size="sm" 
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
          <Card className="h-[300px] overflow-auto">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                <h2 className="ml-3 text-md font-medium text-gray-900">Document Management</h2>
              </div>
              <p className="text-xs text-gray-600 mb-3">Manage and validate official documents.</p>
              <div className="space-y-2">
                <Button 
                  variant="primary"
                  size="sm" 
                  className="w-full" 
                  onClick={() => handleNavigation('/documents', 'manage_documents')}
                >
                  Manage Documents
                </Button>
                <Button 
                  variant="secondary"
                  size="sm" 
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
          <Card className="h-[300px] overflow-auto">
            <div className="p-4">
              <div className="flex items-center mb-3">
                <ClipboardDocumentListIcon className="h-6 w-6 text-indigo-600" />
                <h2 className="ml-3 text-md font-medium text-gray-900">Policy Control</h2>
              </div>
              <p className="text-xs text-gray-600 mb-3">Manage organizational policies and guidelines.</p>
              <div className="space-y-2">
                <Button 
                  variant="primary"
                  size="sm" 
                  className="w-full" 
                  onClick={() => handleNavigation('/policies', 'upload_policy')}
                >
                  Manage Policies
                </Button>
                {hasSpecificPermission('edit_policy') && (
                  <Button 
                    variant="secondary"
                    size="sm" 
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
      </div>
      
      {/* Second row - Announcements Wall (horizontal) */}
      <div className="h-[250px]">
        <AnnouncementWall />
      </div>
    </div>
  );

  // Finally, the director dashboard
  const renderDirectorDashboard = () => (
    <div className="space-y-4">
      {/* First row - main cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Analytics card */}
        <Card className="h-[300px] overflow-auto">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              <h2 className="ml-3 text-md font-medium text-gray-900">Analytics & Reporting</h2>
            </div>
            <p className="text-xs text-gray-600 mb-3">View comprehensive analytics and generate reports.</p>
            <div className="space-y-2">
              <Button 
                variant="primary"
                size="sm" 
                className="w-full" 
                onClick={() => handleNavigation('/analytics', 'view_audit_logs')}
              >
                Analytics Dashboard
              </Button>
              <Button 
                variant="secondary"
                size="sm" 
                className="w-full" 
                onClick={() => handleNavigation('/analytics/reports', 'run_reports')}
              >
                Generate Reports
              </Button>
            </div>
          </div>
        </Card>

        {/* System Administration card */}
        <Card className="h-[300px] overflow-auto">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <Cog6ToothIcon className="h-6 w-6 text-indigo-600" />
              <h2 className="ml-3 text-md font-medium text-gray-900">System Administration</h2>
            </div>
            <p className="text-xs text-gray-600 mb-3">Oversee and manage system settings and administrators.</p>
            <div className="space-y-2">
              <Button 
                variant="primary"
                size="sm" 
                className="w-full" 
                onClick={() => handleNavigation('/admin/accounts', 'create_admin_accounts')}
              >
                Manage Admin Accounts
              </Button>
              <Button 
                variant="secondary"
                size="sm" 
                className="w-full" 
                onClick={() => handleNavigation('/admin/settings', 'access_system_settings')}
              >
                System Configuration
              </Button>
            </div>
          </div>
        </Card>

        {/* Strategic Overview card */}
        <Card className="h-[300px] overflow-auto">
          <div className="p-4">
            <div className="flex items-center mb-3">
              <BoltIcon className="h-6 w-6 text-indigo-600" />
              <h2 className="ml-3 text-md font-medium text-gray-900">Strategic Overview</h2>
            </div>
            <p className="text-xs text-gray-600 mb-3">Access high-level organizational metrics and KPIs.</p>
            <div className="space-y-2">
              <Button 
                variant="primary"
                size="sm" 
                className="w-full" 
                onClick={() => handleNavigation('/analytics/readiness', 'view_personnel')}
              >
                Readiness Assessment
              </Button>
              <Button 
                variant="secondary"
                size="sm" 
                className="w-full" 
                onClick={() => handleNavigation('/analytics/performance', 'run_reports')}
              >
                Performance Metrics
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Second row - Announcements Wall (horizontal) */}
      <div className="h-[250px]">
        <AnnouncementWall />
      </div>
    </div>
  );

  // Also create a simplified reservist dashboard
  const renderReservistDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="My Documents" className="h-[400px] overflow-auto">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Completed</span>
            <span className="text-sm font-medium text-gray-900">4/6</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '66%' }}></div>
          </div>
          <ul className="space-y-2">
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                <span className="ml-2 text-xs text-gray-600">Personal Information Form</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Verified
              </span>
            </li>
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                <span className="ml-2 text-xs text-gray-600">Medical Certificate</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            </li>
          </ul>
          <Button 
            size="sm" 
            variant="secondary" 
            className="w-full"
            onClick={() => handleNavigation('/documents')}
          >
            View All Documents
          </Button>
        </div>
      </Card>

      <Card title="Upcoming Trainings" className="h-[400px] overflow-auto">
        <div className="space-y-3">
          <ul className="space-y-2">
            <li className="flex justify-between items-center">
              <div className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                <div className="ml-2">
                  <span className="text-xs font-medium text-gray-900">Basic Combat Training</span>
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
                <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                <div className="ml-2">
                  <span className="text-xs font-medium text-gray-900">First Aid Seminar</span>
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
            className="w-full"
            onClick={() => handleNavigation('/trainings?tab=upcoming')}
          >
            View All Trainings
          </Button>
        </div>
      </Card>
    </div>
  );

  // Main return function
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
      {/* Compact inline welcome - no card */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-indigo-100 rounded-full p-2 mr-3">
            <UserIcon className="h-5 w-5 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Welcome, {user?.firstName} {user?.lastName}</h2>
            <p className="text-xs text-gray-700">
              {getFormattedRoleName(user?.role)}
              {user?.rank ? ` | ${user?.rank}` : ''}
              {user?.company ? ` | ${user?.company} Company` : ''}
            </p>
          </div>
        </div>
        
        {/* Stats remain unchanged - this is the notification area */}
        <div className="hidden md:flex space-x-4">
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">{stats.totalPersonnel}</div>
            <div className="text-xs text-gray-500">Personnel</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">{stats.pendingDocuments}</div>
            <div className="text-xs text-gray-500">Pending Docs</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-bold text-gray-900">{stats.upcomingTrainings}</div>
            <div className="text-xs text-gray-500">Trainings</div>
          </div>
        </div>
      </div>

      {/* Role-specific Dashboards - single section without title to save space */}
      {user?.role === UserRole.DIRECTOR && renderDirectorDashboard()}
      {user?.role === UserRole.ADMIN && renderAdminDashboard()}
      {user?.role === UserRole.STAFF && renderStaffDashboard()}
      {user?.role === UserRole.RESERVIST && renderReservistDashboard()}
    </div>
  );
} 