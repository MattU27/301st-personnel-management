"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  AcademicCapIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Analytics data interface
interface AnalyticsData {
  personnel: {
    total: number;
    active: number;
    pending: number;
    activeRate: number;
  };
  companies: Array<{
    name: string;
    readinessScore: number;
    totalPersonnel: number;
    activePersonnel: number;
    documentsComplete: number;
    trainingsComplete: number;
  }>;
  documents: {
    total: number;
    pending: number;
    verified: number;
    completionRate: number;
  };
  trainings: {
    upcoming: number;
    completed: number;
    total: number;
    participationRate: number;
    monthlyCompletion: Array<{
      year: number;
      month: number;
      count: number;
    }>;
  };
  distribution: {
    personnelByCompany: Array<{
      company: string;
      count: number;
    }>;
  };
  risks: {
    lowReadinessCompanies: Array<{
      name: string;
      readinessScore: number;
      documentsComplete: number;
      trainingsComplete: number;
    }>;
    documentBacklog: Array<{
      company: string;
      count: number;
    }>;
  };
}

// Helper function to get cookies
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export default function SystemAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data from the API
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try different ways to get the token
      let token = null;
      if (typeof window !== 'undefined') {
        token = 
          localStorage.getItem('token') || 
          getCookie('token') || 
          sessionStorage.getItem('token');
      }
      
      if (!token) {
        console.error('Authentication token not found');
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Fetching analytics data with token:', token.substring(0, 10) + '...');
      
      const response = await fetch('/api/analytics/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`Failed to fetch analytics data: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Successfully fetched analytics data');
        setAnalyticsData(data.data);
      } else {
        console.error('API returned success: false', data.message);
        throw new Error(data.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'director') {
      router.push('/dashboard');
      return;
    }

    fetchAnalyticsData();
  }, [isLoading, isAuthenticated, router, user]);

  const getMonthName = (monthNumber: number) => {
    const months = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August', 
      'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
            <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
            onClick={() => fetchAnalyticsData()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">No data available</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700">No analytics data is currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System-wide Analytics</h1>
        <button 
          onClick={() => fetchAnalyticsData()} 
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Performance Overview</h2>
            </div>
            <p className="text-gray-600 mb-6">Comprehensive view of system-wide metrics and KPIs.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-center mb-2">
                  <UserGroupIcon className="h-5 w-5 text-indigo-700 mr-2" />
                  <h3 className="text-md font-semibold text-gray-900">Personnel</h3>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-bold text-indigo-600">{analyticsData.personnel.total}</div>
                  <div className="text-sm text-gray-600">Total Personnel</div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Active Rate:</span>
                    <span className="text-sm font-bold text-indigo-600">{analyticsData.personnel.activeRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${analyticsData.personnel.activeRate}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <div className="flex items-center mb-2">
                  <DocumentTextIcon className="h-5 w-5 text-emerald-700 mr-2" />
                  <h3 className="text-md font-semibold text-gray-900">Documentation</h3>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-bold text-emerald-600">{analyticsData.documents.completionRate}%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Verified:</span>
                    <span className="text-sm font-bold text-emerald-600">{analyticsData.documents.verified}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${analyticsData.documents.completionRate}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                <div className="flex items-center mb-2">
                  <AcademicCapIcon className="h-5 w-5 text-amber-700 mr-2" />
                  <h3 className="text-md font-semibold text-gray-900">Training</h3>
                </div>
                <div className="mt-2">
                  <div className="text-3xl font-bold text-amber-600">{analyticsData.trainings.participationRate}%</div>
                  <div className="text-sm text-gray-600">Participation Rate</div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed:</span>
                    <span className="text-sm font-bold text-amber-600">{analyticsData.trainings.completed}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div className="bg-amber-600 h-2 rounded-full" style={{ width: `${analyticsData.trainings.participationRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-8 w-8 text-indigo-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Company Performance</h2>
            </div>
            <p className="text-gray-600 mb-6">Comparative analysis of readiness metrics across companies.</p>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Personnel
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Readiness Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documents Completed
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trainings Completed
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.companies.map((company, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {company.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.activePersonnel} / {company.totalPersonnel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm font-medium ${
                            company.readinessScore >= 80 ? 'text-green-700' : 
                            company.readinessScore >= 60 ? 'text-yellow-700' : 
                            'text-red-700'
                          }`}>
                            {company.readinessScore}%
                          </span>
                          <div className="ml-2 w-24 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${
                              company.readinessScore >= 80 ? 'bg-green-500' : 
                              company.readinessScore >= 60 ? 'bg-yellow-500' : 
                              'bg-red-500'
                            }`} style={{ width: `${company.readinessScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.documentsComplete}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {company.trainingsComplete}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <DocumentTextIcon className="h-6 w-6 text-red-600" />
                <h2 className="ml-3 text-lg font-medium text-gray-900">Document Backlog</h2>
              </div>
              <p className="text-gray-600 mb-6">Pending document verifications by company.</p>
              
              {analyticsData.risks.documentBacklog.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No document backlog found
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.risks.documentBacklog.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div>
                        <span className="text-gray-900 font-medium">{item.company || 'Unassigned'}</span>
                      </div>
                      <div>
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                          {item.count} pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                <h2 className="ml-3 text-lg font-medium text-gray-900">Risk Assessment</h2>
              </div>
              <p className="text-gray-600 mb-6">Companies with low readiness scores that require attention.</p>
              
              {analyticsData.risks.lowReadinessCompanies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No companies with low readiness scores
                </div>
              ) : (
                <div className="space-y-4">
                  {analyticsData.risks.lowReadinessCompanies.map((company, index) => (
                    <div key={index} className="p-4 border border-amber-100 rounded-lg bg-amber-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{company.name}</h3>
                          <div className="mt-1 flex items-center">
                            <span className="text-sm text-amber-800">Readiness Score: </span>
                            <span className={`ml-1 text-sm font-bold ${
                              company.readinessScore < 50 ? 'text-red-700' : 'text-amber-700'
                            }`}>{company.readinessScore}%</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Documents: {company.documentsComplete}%</div>
                          <div className="text-xs text-gray-500">Trainings: {company.trainingsComplete}%</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Training Completion Trend</h2>
            </div>
            <p className="text-gray-600 mb-6">Monthly training completion rates over the past 6 months.</p>
            
            {analyticsData.trainings.monthlyCompletion.length === 0 ? (
              <div className="h-60 flex items-center justify-center">
                <div className="text-gray-500 text-lg">
                  No training completion data available for the past 6 months
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-2 h-60">
                {analyticsData.trainings.monthlyCompletion.map((item, index) => {
                  const maxCount = Math.max(...analyticsData.trainings.monthlyCompletion.map(i => i.count));
                  const heightPercentage = (item.count / maxCount) * 100;
                  
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="flex-grow w-full flex items-end">
                        <div 
                          className="bg-indigo-500 w-full rounded-t-md" 
                          style={{ height: `${heightPercentage}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 whitespace-nowrap">
                        {getMonthName(item.month).substring(0, 3)}
                      </div>
                      <div className="text-xs text-gray-900 font-medium">
                        {item.count}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
} 