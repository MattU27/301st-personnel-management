'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { toast } from 'react-hot-toast';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  PencilIcon,
  UserPlusIcon,
  ArrowPathIcon,
  ChartBarIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import Link from 'next/link';

// Company types from the existing model
const COMPANIES = [
  'Alpha', 
  'Bravo', 
  'Charlie', 
  'Headquarters', 
  'NERRSC (NERR-Signal Company)', 
  'NERRFAB (NERR-Field Artillery Battery)'
];

// Sample company data - will be replaced with API call
interface CompanyData {
  name: string;
  totalPersonnel: number;
  activePersonnel: number;
  readinessScore: number;
  documentsComplete: number;
  trainingsComplete: number;
}

const MOCK_COMPANY_DATA: CompanyData[] = [
  {
    name: 'Alpha',
    totalPersonnel: 45,
    activePersonnel: 38,
    readinessScore: 87,
    documentsComplete: 92,
    trainingsComplete: 85
  },
  {
    name: 'Bravo',
    totalPersonnel: 52,
    activePersonnel: 48,
    readinessScore: 92,
    documentsComplete: 96,
    trainingsComplete: 90
  },
  {
    name: 'Charlie',
    totalPersonnel: 38,
    activePersonnel: 32,
    readinessScore: 76,
    documentsComplete: 82,
    trainingsComplete: 74
  },
  {
    name: 'Headquarters',
    totalPersonnel: 24,
    activePersonnel: 22,
    readinessScore: 94,
    documentsComplete: 98,
    trainingsComplete: 92
  },
  {
    name: 'NERRSC (NERR-Signal Company)',
    totalPersonnel: 32,
    activePersonnel: 27,
    readinessScore: 85,
    documentsComplete: 88,
    trainingsComplete: 84
  },
  {
    name: 'NERRFAB (NERR-Field Artillery Battery)',
    totalPersonnel: 28,
    activePersonnel: 24,
    readinessScore: 82,
    documentsComplete: 84,
    trainingsComplete: 81
  }
];

export default function CompaniesPage() {
  const { user, isAuthenticated, isLoading, getToken, hasSpecificPermission } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'sync' | null>(null);
  
  // Check if user has permission to manage companies
  const canManageCompanies = hasSpecificPermission('manage_company_personnel');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && user && !['staff', 'admin', 'director'].includes(user.role)) {
      router.push('/dashboard');
      toast.error('You do not have permission to access this page');
      return;
    }

    // Fetch companies data
    fetchCompaniesData();
  }, [isLoading, isAuthenticated, user, router]);

  const fetchCompaniesData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // For now, use the mock data
      setCompanies(MOCK_COMPANY_DATA);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error fetching companies data:', error);
      toast.error('Failed to load companies data');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncCompanyData = async () => {
    setShowConfirmation(false);
    toast.promise(
      // This would be an actual API call in the real implementation
      new Promise(resolve => setTimeout(resolve, 1500)),
      {
        loading: 'Syncing company data...',
        success: 'Company data synced successfully',
        error: 'Failed to sync company data'
      }
    );
  };

  const getReadinessColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-full p-3">
                <BuildingOfficeIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Company Management</h2>
                <p className="text-sm text-gray-500">
                  Manage and view company data
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setConfirmationAction('sync');
                  setShowConfirmation(true);
                }}
                className="flex items-center"
              >
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Sync Data
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <Card key={company.name}>
              <div className="p-5 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="bg-indigo-100 rounded-full p-2">
                      <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="ml-3 text-lg font-medium text-gray-900">{company.name}</h3>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => router.push(`/personnel/company/${company.name.toLowerCase()}`)}
                  >
                    <UsersIcon className="h-4 w-4 mr-1" />
                    View Personnel
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Readiness Score</span>
                      <span className="text-sm font-medium text-gray-700">{company.readinessScore}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${getReadinessColor(company.readinessScore)}`} style={{ width: `${company.readinessScore}%` }}></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Personnel</div>
                      <div className="mt-1 flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{company.activePersonnel}</div>
                        <div className="ml-2 text-sm text-gray-500">/ {company.totalPersonnel}</div>
                      </div>
                      <div className="text-xs text-gray-500">Active Personnel</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Documents</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900">{company.documentsComplete}%</div>
                      <div className="text-xs text-gray-500">Completion Rate</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500">Trainings</div>
                      <div className="mt-1 text-2xl font-semibold text-gray-900">{company.trainingsComplete}%</div>
                      <div className="text-xs text-gray-500">Completion Rate</div>
                    </div>

                    <div className="flex items-end">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => router.push(`/reports/company/${company.name.toLowerCase().replace(/\s+/g, '-')}`)}
                        className="w-full"
                      >
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        View Report
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleSyncCompanyData}
        title="Sync Company Data"
        message="Are you sure you want to sync company data with the central database? This may take a few moments."
        confirmText="Sync Data"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
} 