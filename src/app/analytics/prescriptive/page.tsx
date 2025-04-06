"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { 
  LightBulbIcon, 
  ArrowTrendingUpIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

// Helper function to get cookies
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Prescriptive analytics data interface
interface PrescriptiveData {
  trainingRecommendations: {
    companies: Array<{
      company: string;
      currentTrainingCompletion: number;
      potentialImprovement: number;
      currentReadiness: number;
      projectedReadiness: number;
    }>;
    overallSuggestion: string;
  };
  resourceAllocation: {
    imbalances: Array<{
      company: string;
      currentCount: number;
      deviation: number;
      recommendation: string;
    }>;
    suggestion: string;
  };
  documentVerification: {
    backlog: Array<{
      company: string;
      count: number;
      oldestPendingDate: string;
    }>;
    growthRate: number;
    suggestion: string;
  };
}

export default function PrescriptiveAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [prescriptiveData, setPrescriptiveData] = useState<PrescriptiveData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch prescriptive analytics data from the API
  const fetchPrescriptiveData = async () => {
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

      console.log('Fetching prescriptive data with token:', token.substring(0, 10) + '...');
      
      const response = await fetch('/api/analytics/prescriptive', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        throw new Error(`Failed to fetch prescriptive analytics data: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Successfully fetched prescriptive data');
        setPrescriptiveData(data.data);
      } else {
        console.error('API returned success: false', data.message);
        throw new Error(data.message || 'Failed to fetch prescriptive analytics data');
      }
    } catch (err) {
      console.error('Error fetching prescriptive analytics data:', err);
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

    fetchPrescriptiveData();
  }, [isLoading, isAuthenticated, router, user]);

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
            <h3 className="text-sm font-medium text-red-800">Error loading prescriptive analytics</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button 
            className="mt-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
            onClick={() => fetchPrescriptiveData()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!prescriptiveData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">No data available</h3>
          </div>
          <p className="mt-2 text-sm text-yellow-700">No prescriptive analytics data is currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Prescriptive Analytics</h1>
        <button 
          onClick={() => fetchPrescriptiveData()} 
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Analysis
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <LightBulbIcon className="h-8 w-8 text-indigo-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Strategic Recommendations</h2>
            </div>
            <p className="text-gray-600 mb-6">AI-driven insights and recommendations for organizational improvement.</p>

            <div className="space-y-5">
              {/* Training Optimization */}
              <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
                <div className="flex items-start">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-md font-semibold text-gray-900">Training Optimization</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {prescriptiveData.trainingRecommendations.overallSuggestion}
                    </p>
                    
                    {prescriptiveData.trainingRecommendations.companies.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Projected Improvements</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-indigo-50">
                              <tr>
                                <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500">Company</th>
                                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500">Current</th>
                                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500">Potential</th>
                                <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500">Improvement</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {prescriptiveData.trainingRecommendations.companies.map((company, index) => (
                                <tr key={index}>
                                  <td className="px-3 py-2 text-xs text-gray-900">{company.company}</td>
                                  <td className="px-3 py-2 text-xs text-center text-gray-500">{company.currentReadiness}%</td>
                                  <td className="px-3 py-2 text-xs text-center text-emerald-600 font-medium">{company.projectedReadiness}%</td>
                                  <td className="px-3 py-2 text-xs text-center">
                                    <span className="px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-800">
                                      +{company.potentialImprovement}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 flex items-center">
                        View Details
                        <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Reallocation */}
              <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-100">
                <div className="flex items-start">
                  <ArrowPathIcon className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-md font-semibold text-gray-900">Resource Allocation</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {prescriptiveData.resourceAllocation.suggestion}
                    </p>
                    
                    {prescriptiveData.resourceAllocation.imbalances.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Personnel Distribution</h4>
                        <div className="space-y-2">
                          {prescriptiveData.resourceAllocation.imbalances.map((item, index) => (
                            <div key={index} className="flex justify-between items-center bg-white rounded p-2 text-xs">
                              <span className="font-medium">{item.company}</span>
                              <div className="flex items-center">
                                <span className="mr-2">{item.currentCount} personnel</span>
                                <span className={`px-2 py-1 rounded-full ${
                                  item.deviation > 0 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {item.deviation > 0 ? '+' : ''}{item.deviation}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <button className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 flex items-center">
                        View Details
                        <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Verification Backlog */}
              <div className="bg-amber-50 rounded-lg p-5 border border-amber-100">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-md font-semibold text-gray-900">Document Backlog</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {prescriptiveData.documentVerification.suggestion}
                    </p>
                    
                    {prescriptiveData.documentVerification.backlog.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Pending Documents by Company</h4>
                          <div className="space-y-2">
                            {prescriptiveData.documentVerification.backlog.map((item, index) => (
                              <div key={index} className="flex justify-between items-center bg-white rounded p-2 text-xs">
                                <span className="font-medium">{item.company || 'Unassigned'}</span>
                                <span className="px-2 py-1 rounded-full bg-red-100 text-red-800">
                                  {item.count} pending
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wider mb-2">Backlog Growth Rate</h4>
                          <div className="bg-white rounded p-3">
                            <div className="flex items-end justify-between mb-1">
                              <span className="text-xs text-gray-600">30-Day Change:</span>
                              <span className={`text-sm font-semibold ${
                                prescriptiveData.documentVerification.growthRate > 0 
                                  ? 'text-red-600' 
                                  : 'text-green-600'
                              }`}>
                                {prescriptiveData.documentVerification.growthRate > 0 ? '+' : ''}
                                {prescriptiveData.documentVerification.growthRate}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${
                                prescriptiveData.documentVerification.growthRate > 0 
                                  ? 'bg-red-500' 
                                  : 'bg-green-500'
                              }`} style={{ 
                                width: `${Math.min(100, Math.abs(prescriptiveData.documentVerification.growthRate))}%` 
                              }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <button className="px-3 py-1.5 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 flex items-center">
                        View Details
                        <ArrowTopRightOnSquareIcon className="ml-1 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center mb-4">
              <LightBulbIcon className="h-8 w-8 text-indigo-600" />
              <h2 className="ml-3 text-lg font-medium text-gray-900">Predictive Scenarios</h2>
            </div>
            <p className="text-gray-600 mb-6">Projected outcomes based on different strategic decisions.</p>
            
            <div className="text-center py-6">
              <div className="bg-gray-50 rounded-lg p-8 border border-gray-200 inline-block">
                <div className="text-gray-500 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">Interactive Scenario Builder</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Create and analyze different strategic scenarios to visualize potential outcomes.
                </p>
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700">
                  Launch Scenario Builder
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 