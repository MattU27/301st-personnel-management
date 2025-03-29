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
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import ReadinessChart from '@/components/ReadinessChart';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, hasSpecificPermission } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalPersonnel: 245,
    activePersonnel: 198,
    pendingDocuments: 12,
    upcomingTrainings: 3,
    completedTrainings: 87,
    readinessScore: 78
  });

  const [readinessData, setReadinessData] = useState([
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

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
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
    if (requiredPermission && !hasSpecificPermission(requiredPermission)) {
      alert('You do not have permission to access this feature.');
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
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user.name}</h2>
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
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user.name}</h2>
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
              <Button size="sm" variant="primary">Add Personnel</Button>
              <Button size="sm" variant="secondary">Manage Companies</Button>
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
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="bg-indigo-100 rounded-full p-3">
            <UserIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="ml-4">
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user.name}</h2>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3">
              <UserGroupIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{stats.totalPersonnel}</h3>
              <p className="text-sm text-gray-500">Total Personnel</p>
            </div>
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
          <div className="flex items-center">
            <div className="bg-yellow-100 rounded-full p-3">
              <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">{stats.pendingDocuments}</h3>
              <p className="text-sm text-gray-500">Pending Documents</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="System Management">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" className="flex items-center justify-center">
                <UserGroupIcon className="h-5 w-5 mr-2" />
                Manage Staff
              </Button>
              <Button variant="secondary" className="flex items-center justify-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Manage Documents
              </Button>
              <Button variant="secondary" className="flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Manage Trainings
              </Button>
              <Button variant="secondary" className="flex items-center justify-center">
                <BellAlertIcon className="h-5 w-5 mr-2" />
                Announcements
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Recent Activity">
          <div className="space-y-4">
            <ul className="mt-4 space-y-3">
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Staff account created for Jane Smith</span>
                </div>
                <span className="text-xs text-gray-500">1h ago</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">New policy document uploaded</span>
                </div>
                <span className="text-xs text-gray-500">3h ago</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">New training schedule published</span>
                </div>
                <span className="text-xs text-gray-500">1d ago</span>
              </li>
              <li className="flex justify-between items-center">
                <div className="flex items-center">
                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">Batch processing of 15 personnel records</span>
                </div>
                <span className="text-xs text-gray-500">2d ago</span>
              </li>
            </ul>
            <Button size="sm" variant="secondary" className="w-full mt-4">
              View All Activity
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderDirectorDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-indigo-100 rounded-full p-2.5">
            <UserIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-medium text-gray-900">Welcome, {user.name}</h2>
            <p className="text-sm text-gray-700">Director | Super Admin</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => router.push('/reports/readiness')}
          >
            Quick Report
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => router.push('/system/settings')}
          >
            System Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center">
          <div className="rounded-full bg-indigo-100 p-2 mr-3">
            <UserGroupIcon className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">245</p>
            <p className="text-xs text-gray-700">Total Personnel</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center">
          <div className="rounded-full bg-green-100 p-2 mr-3">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">198</p>
            <p className="text-xs text-gray-700">Ready Personnel</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center">
          <div className="rounded-full bg-yellow-100 p-2 mr-3">
            <DocumentTextIcon className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">12</p>
            <p className="text-xs text-gray-700">Pending Documents</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <div className="p-4">
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <BoltIcon className="h-5 w-5 text-indigo-500 mr-2" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => router.push('/admin/create')}
                className="justify-start text-gray-800"
              >
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Create Admin Account
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => router.push('/reports/export')}
                className="justify-start text-gray-800"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => router.push('/trainings/schedule')}
                className="justify-start text-gray-800"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule Training
              </Button>
              <Button
                variant="secondary"
                size="sm"
                fullWidth
                onClick={() => router.push('/system/logs')}
                className="justify-start text-gray-800"
              >
                <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                View System Logs
              </Button>
            </div>
          </div>
        </Card>

        <Card className="col-span-1">
          <div className="p-4">
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <ClockIcon className="h-5 w-5 text-indigo-500 mr-2" />
              Recent Activity
            </h3>
            <ul className="space-y-2">
              <li className="flex items-center text-sm py-1 border-b border-gray-100">
                <div className="rounded-full bg-blue-100 p-1 mr-2">
                  <UserIcon className="h-3 w-3 text-blue-600" />
                </div>
                <span className="flex-1 text-gray-800">New admin account created</span>
                <span className="text-xs text-gray-600">2h ago</span>
              </li>
              <li className="flex items-center text-sm py-1 border-b border-gray-100">
                <div className="rounded-full bg-green-100 p-1 mr-2">
                  <DocumentCheckIcon className="h-3 w-3 text-green-600" />
                </div>
                <span className="flex-1 text-gray-800">15 documents verified</span>
                <span className="text-xs text-gray-600">5h ago</span>
              </li>
              <li className="flex items-center text-sm py-1 border-b border-gray-100">
                <div className="rounded-full bg-yellow-100 p-1 mr-2">
                  <BellAlertIcon className="h-3 w-3 text-yellow-600" />
                </div>
                <span className="flex-1 text-gray-800">System maintenance scheduled</span>
                <span className="text-xs text-gray-600">1d ago</span>
              </li>
              <li className="flex items-center text-sm py-1">
                <div className="rounded-full bg-purple-100 p-1 mr-2">
                  <AcademicCapIcon className="h-3 w-3 text-purple-600" />
                </div>
                <span className="flex-1 text-gray-800">New training program added</span>
                <span className="text-xs text-gray-600">2d ago</span>
              </li>
            </ul>
            <Button
              variant="secondary"
              size="sm"
              className="text-indigo-600 mt-2 text-xs"
              onClick={() => router.push('/activity')}
            >
              View all activity →
            </Button>
          </div>
        </Card>

        <Card className="col-span-1">
          <div className="p-4">
            <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <HeartIcon className="h-5 w-5 text-indigo-500 mr-2" />
              System Health
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-800">Server Status</span>
                  <span className="text-xs text-green-600 font-medium">Operational</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-800">Database</span>
                  <span className="text-xs text-green-600 font-medium">Healthy</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '95%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-800">Storage</span>
                  <span className="text-xs text-yellow-600 font-medium">72% Used</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-gray-800">API Services</span>
                  <span className="text-xs text-green-600 font-medium">All Active</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="text-indigo-600 mt-2 text-xs"
                onClick={() => router.push('/system/health')}
              >
                View detailed report →
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 text-indigo-500 mr-2" />
              Company Readiness
            </h3>
            <Button
              variant="secondary"
              size="sm"
              className="text-indigo-600 text-xs"
              onClick={() => router.push('/reports/readiness')}
            >
              Full Report →
            </Button>
          </div>
          <div className="space-y-2">
            {readinessData.slice(0, 4).map((company) => (
              <div key={company.company} className="flex items-center">
                <span className="text-xs w-16 text-gray-800">{company.company}</span>
                <div className="flex-1 mx-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full ${
                        company.readinessScore >= 90 ? 'bg-green-500' : 
                        company.readinessScore >= 80 ? 'bg-blue-500' : 
                        company.readinessScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} 
                      style={{ width: `${company.readinessScore}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs font-medium w-8 text-gray-800">{company.readinessScore}%</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-md font-medium text-gray-900 flex items-center">
              <Cog6ToothIcon className="h-5 w-5 text-indigo-500 mr-2" />
              Management Tools
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/admin/accounts')}
              className="text-xs justify-start text-gray-800"
            >
              <UserGroupIcon className="h-3 w-3 mr-1" />
              Admin Accounts
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/resources/allocation')}
              className="text-xs justify-start text-gray-800"
            >
              <CubeIcon className="h-3 w-3 mr-1" />
              Resources
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/system/settings')}
              className="text-xs justify-start text-gray-800"
            >
              <Cog6ToothIcon className="h-3 w-3 mr-1" />
              Settings
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push('/reports/analytics')}
              className="text-xs justify-start text-gray-800"
            >
              <ChartBarIcon className="h-3 w-3 mr-1" />
              Analytics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {user.role === 'RESERVIST' && renderReservistDashboard()}
      {user.role === 'STAFF' && renderStaffDashboard()}
      {user.role === 'ADMIN' && renderAdminDashboard()}
      {user.role === 'DIRECTOR' && renderDirectorDashboard()}
    </div>
  );
} 