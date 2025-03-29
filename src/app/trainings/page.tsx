"use client";

import { useState, useEffect } from 'react';
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

type TrainingStatus = 'upcoming' | 'ongoing' | 'completed';
type RegistrationStatus = 'registered' | 'not_registered' | 'completed' | 'cancelled';

interface Training {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: TrainingStatus;
  capacity: number;
  registered: number;
  registrationStatus?: RegistrationStatus;
  instructor?: string;
  category: string;
}

export default function TrainingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'registered' | 'completed'>('all');
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [trainingToCancel, setTrainingToCancel] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    // Mock data for trainings
    if (user) {
      const mockTrainings: Training[] = [
        {
          id: '1',
          title: 'Basic Combat Training',
          description: 'Fundamental combat skills training for all reservists.',
          startDate: '2024-03-15',
          endDate: '2024-03-20',
          location: 'Camp Aguinaldo, Quezon City',
          status: 'upcoming',
          capacity: 50,
          registered: 32,
          registrationStatus: 'not_registered',
          instructor: 'Col. James Rodriguez',
          category: 'Combat'
        },
        {
          id: '2',
          title: 'First Aid Seminar',
          description: 'Basic first aid and emergency response training.',
          startDate: '2024-04-02',
          endDate: '2024-04-03',
          location: 'AFP Medical Center, Quezon City',
          status: 'upcoming',
          capacity: 30,
          registered: 25,
          registrationStatus: 'registered',
          instructor: 'Maj. Sarah Johnson',
          category: 'Medical'
        },
        {
          id: '3',
          title: 'Leadership Development',
          description: 'Leadership skills and team management training for officers.',
          startDate: '2024-04-10',
          endDate: '2024-04-12',
          location: 'Camp Aguinaldo, Quezon City',
          status: 'upcoming',
          capacity: 25,
          registered: 15,
          registrationStatus: 'not_registered',
          instructor: 'Gen. Robert Smith',
          category: 'Leadership'
        },
        {
          id: '4',
          title: 'Tactical Communications',
          description: 'Training on military communications and protocols.',
          startDate: '2024-01-10',
          endDate: '2024-01-12',
          location: 'Signal Battalion HQ, Taguig City',
          status: 'completed',
          capacity: 40,
          registered: 38,
          registrationStatus: 'completed',
          instructor: 'Lt. Col. David Chen',
          category: 'Communications'
        },
        {
          id: '5',
          title: 'Physical Fitness Assessment',
          description: 'Annual physical fitness test and evaluation.',
          startDate: '2024-02-05',
          endDate: '2024-02-05',
          location: 'Camp Aguinaldo, Quezon City',
          status: 'completed',
          capacity: 100,
          registered: 95,
          registrationStatus: 'completed',
          instructor: 'Maj. Michael Torres',
          category: 'Fitness'
        }
      ];
      setTrainings(mockTrainings);
    }
  }, [isLoading, isAuthenticated, router, user]);

  const handleRegister = (trainingId: string) => {
    setTrainings(trainings.map(training => 
      training.id === trainingId 
        ? { ...training, registrationStatus: 'registered', registered: training.registered + 1 } 
        : training
    ));
  };

  const handleCancelRegistrationClick = (trainingId: string) => {
    setTrainingToCancel(trainingId);
    setShowCancelConfirmation(true);
  };

  const handleCancelRegistration = () => {
    if (!trainingToCancel) return;
    
    setTrainings(trainings.map(training => 
      training.id === trainingToCancel 
        ? { ...training, registrationStatus: 'not_registered', registered: training.registered - 1 } 
        : training
    ));
    
    setTrainingToCancel(null);
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

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                          <span>{training.location}</span>
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
                              onClick={() => handleRegister(training.id)}
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
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <AcademicCapIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
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
                          <p className="mt-1 text-sm text-gray-900">{selectedTraining.location}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">Instructor</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedTraining.instructor || 'TBD'}</p>
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
                        handleRegister(selectedTraining.id);
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