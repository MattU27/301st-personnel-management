"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  AcademicCapIcon, 
  CalendarIcon, 
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { toast } from 'react-hot-toast';
import { auditService } from '@/utils/auditService';

type TrainingStatus = 'upcoming' | 'ongoing' | 'completed';
type RegistrationStatus = 'registered' | 'not_registered' | 'completed' | 'cancelled';

interface Training {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  type?: string;
  startDate: string;
  endDate: string;
  location: string | { 
    name?: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    }
  };
  locationDisplay?: string;
  status: TrainingStatus;
  capacity: number;
  registered: number;
  registrationStatus?: RegistrationStatus;
  instructor?: string | {
    name?: string;
    rank?: string;
    specialization?: string;
    contactInfo?: string;
  };
  instructorDisplay?: string;
  category?: string;
  mandatory?: boolean;
  attendees?: Array<any>;
  tags?: string[];
}

export default function TrainingsPage() {
  const { user, isAuthenticated, isLoading, hasSpecificPermission } = useAuth();
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'registered' | 'completed'>('all');
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [trainingToCancel, setTrainingToCancel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Add a ref to track if we've already logged the page view
  const hasLoggedPageView = useRef(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    const fetchTrainings = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Get the auth token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }
        
        // Call the API to get trainings with authorization header
        const response = await fetch('/api/trainings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch trainings');
        }
        
        const data = await response.json();
        if (data.success) {
          // Process the trainings to match our interface
          const processedTrainings = data.data.trainings.map((training: any) => {
            // Create display strings for complex objects
            const locationDisplay = typeof training.location === 'object' 
              ? (training.location?.name || training.location?.address || 'No location specified') 
              : training.location || 'No location specified';
            
            const instructorDisplay = typeof training.instructor === 'object'
              ? (training.instructor?.name || 'TBD')
              : training.instructor || 'TBD';
            
            return {
              id: training._id,
              _id: training._id,
              title: training.title,
              description: training.description || '',
              type: training.type,
              startDate: training.startDate || new Date().toISOString(),
              endDate: training.endDate || new Date().toISOString(),
              location: training.location,
              locationDisplay,
              status: training.status,
              capacity: training.capacity || 0,
              registered: training.attendees?.length || 0,
              registrationStatus: training.registrationStatus || 'not_registered',
              instructor: training.instructor,
              instructorDisplay,
              category: training.type || 'Other', // Use type as category, default to 'Other'
              mandatory: training.mandatory || false,
              attendees: training.attendees || [],
              tags: training.tags || []
            };
          });
          
          setTrainings(processedTrainings);
        } else {
          throw new Error(data.error || 'Failed to load trainings');
        }
      } catch (error) {
        console.error('Error fetching trainings:', error);
        toast.error('Failed to load trainings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrainings();
    
    // Log page view to audit log - only once per session
    if (user && !hasLoggedPageView.current) {
      auditService.logPageView(
        user._id,
        `${user.firstName} ${user.lastName}`,
        user.role,
        '/trainings'
      );
      hasLoggedPageView.current = true;
    }
  }, [isLoading, isAuthenticated, router, user]);

  const handleRegister = async (trainingId: string | undefined) => {
    if (!user) {
      toast.error('You must be logged in to register for trainings.');
      return;
    }
    
    if (!trainingId) {
      toast.error('Training ID is required');
      return;
    }

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trainingId,
          action: 'register',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register for training');
      }

      const data = await response.json();
      
      // Update local state with the updated training
      setTrainings(prevTrainings => 
        prevTrainings.map(training => 
          training.id === trainingId ? { 
            ...data.data.training,
            id: trainingId  // Ensure ID is preserved
          } : training
        )
      );

      toast.success('You have been registered for the training.');
    } catch (error) {
      console.error('Error registering for training:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to register for training');
    }
  };

  const handleCancelRegistrationClick = (trainingId: string | undefined) => {
    if (!trainingId) {
      toast.error('Training ID is required');
      return;
    }
    setTrainingToCancel(trainingId);
    setShowCancelConfirmation(true);
  };

  const handleCancelRegistration = async () => {
    if (!user || !trainingToCancel) return;

    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          trainingId: trainingToCancel,
          action: 'cancel',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel registration');
      }

      const data = await response.json();
      
      // Update local state with the updated training
      setTrainings(prevTrainings => 
        prevTrainings.map(training => 
          training.id === trainingToCancel ? {
            ...data.data.training,
            id: trainingToCancel  // Ensure ID is preserved
          } : training
        )
      );

      setTrainingToCancel(null);
      setShowCancelConfirmation(false);

      toast.success('Your registration has been cancelled.');
    } catch (error) {
      console.error('Error cancelling registration:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to cancel registration');
    }
  };

  const handleViewDetails = (training: Training) => {
    setSelectedTraining(training);
    setShowDetailsModal(true);
  };

  const filteredTrainings = () => {
    switch (activeTab) {
      case 'upcoming':
        return trainings.filter(training => training.status === 'upcoming');
      case 'registered':
        return trainings.filter(training => training.registrationStatus === 'registered');
      case 'completed':
        return trainings.filter(training => training.status === 'completed' || training.registrationStatus === 'completed');
      default:
        return trainings;
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Date not specified';
    
    try {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <AcademicCapIcon className="h-10 w-10 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">Trainings & Seminars</h1>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3">
              <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">Trainings & Seminars</h2>
              <p className="text-sm text-gray-500">
                View and register for upcoming trainings and seminars
              </p>
            </div>
          </div>
        </div>

        <Card>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'all'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('all')}
              >
                All Trainings
              </button>
              <button
                className={`${
                  activeTab === 'upcoming'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`${
                  activeTab === 'registered'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('registered')}
              >
                Registered
              </button>
              <button
                className={`${
                  activeTab === 'completed'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {filteredTrainings().length === 0 ? (
              <div className="text-center py-12">
                <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No trainings found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'all' 
                    ? 'There are no trainings available at the moment.' 
                    : activeTab === 'upcoming'
                    ? 'There are no upcoming trainings at the moment.'
                    : activeTab === 'registered'
                    ? 'You are not registered for any trainings.'
                    : 'You have not completed any trainings yet.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTrainings().map((training) => (
                  <div key={training.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                          <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{training.category}</dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">{training.title}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>{formatDate(training.startDate)} - {formatDate(training.endDate)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>{training.locationDisplay}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <UserGroupIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>{training.registered} / {training.capacity} registered</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          <span>
                            {training.status === 'upcoming' ? 'Upcoming' : 
                             training.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-5 flex space-x-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleViewDetails(training)}
                        >
                          View Details
                        </Button>
                        {training.status === 'upcoming' && (
                          training.registrationStatus === 'registered' ? (
                            <Button 
                              variant="danger" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleCancelRegistrationClick(training.id)}
                            >
                              Cancel
                            </Button>
                          ) : (
                            <Button 
                              variant="primary" 
                              size="sm" 
                              className="w-full"
                              onClick={() => handleRegister(training.id || '')}
                              disabled={training.registered >= training.capacity}
                            >
                              Register
                            </Button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Training Details Modal */}
      {showDetailsModal && selectedTraining && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{selectedTraining.title}</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Description</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedTraining.description}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Start Date</h4>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTraining.startDate)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">End Date</h4>
                          <p className="mt-1 text-sm text-gray-900">{formatDate(selectedTraining.endDate)}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Location</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedTraining.locationDisplay}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Instructor</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedTraining.instructorDisplay}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Category</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedTraining.category}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Status</h4>
                          <p className="mt-1 text-sm text-gray-900 capitalize">{selectedTraining.status}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Registration</h4>
                        <div className="mt-1 flex items-center">
                          {selectedTraining.registrationStatus === 'registered' ? (
                            <>
                              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                              <span className="text-sm text-green-700">You are registered for this training</span>
                            </>
                          ) : selectedTraining.registrationStatus === 'completed' ? (
                            <>
                              <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
                              <span className="text-sm text-blue-700">You have completed this training</span>
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-500">You are not registered for this training</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                {Math.round((selectedTraining.registered / selectedTraining.capacity) * 100)}% Full
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-indigo-600">
                                {selectedTraining.registered}/{selectedTraining.capacity} Slots
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                            <div
                              style={{ width: `${(selectedTraining.registered / selectedTraining.capacity) * 100}%` }}
                              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Registered Personnel List */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">Registered Personnel</h4>
                        {selectedTraining.attendees && selectedTraining.attendees.length > 0 ? (
                          <div className="mt-1 border border-gray-200 rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rank
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Company
                                  </th>
                                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedTraining.attendees.map((attendee, index) => (
                                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {attendee.userData?.rank || 'N/A'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {attendee.userData?.firstName && attendee.userData?.lastName 
                                        ? `${attendee.userData.firstName} ${attendee.userData.lastName}`
                                        : 'N/A'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {attendee.userData?.company || 'N/A'}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                        ${attendee.status === 'registered' ? 'bg-green-100 text-green-800' : 
                                          attendee.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                                          attendee.status === 'absent' ? 'bg-red-100 text-red-800' : 
                                          attendee.status === 'excused' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-gray-100 text-gray-800'}`}>
                                        {attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No personnel registered yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedTraining.status === 'upcoming' && (
                  selectedTraining.registrationStatus === 'registered' ? (
                    <Button
                      variant="danger"
                      onClick={() => {
                        handleCancelRegistration();
                        setShowDetailsModal(false);
                      }}
                      className="w-full sm:w-auto sm:ml-3"
                    >
                      Cancel Registration
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      onClick={() => {
                        handleRegister(selectedTraining.id || '');
                        setShowDetailsModal(false);
                      }}
                      disabled={selectedTraining.registered >= selectedTraining.capacity}
                      className="w-full sm:w-auto sm:ml-3"
                    >
                      Register
                    </Button>
                  )
                )}
                <Button
                  variant="secondary"
                  onClick={() => setShowDetailsModal(false)}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Registration Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showCancelConfirmation}
        onClose={() => setShowCancelConfirmation(false)}
        onConfirm={handleCancelRegistration}
        title="Cancel Registration"
        message="Are you sure you want to cancel your registration for this training? Your spot will be given to someone else."
        confirmText="Cancel Registration"
        cancelText="Keep Registration"
        type="warning"
      />
    </div>
  );
} 