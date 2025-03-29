'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import Card from '@/components/Card';
import Button from '@/components/Button';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import PersonnelModal from '@/components/PersonnelModal';
import { Personnel, PersonnelStatus, CompanyType } from '@/types/personnel';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import PermissionGuard from '@/components/PermissionGuard';
import { useRouter } from 'next/navigation';

// Mock data for demonstration
const MOCK_PERSONNEL: Personnel[] = [
  {
    id: 1,
    name: 'John Doe',
    rank: 'Captain',
    company: 'Alpha',
    status: 'Ready',
    lastUpdated: '2024-01-15',
    email: 'john.doe@example.com',
    dateJoined: '2023-01-01',
    role: 'RESERVIST',
    trainings: [
      { id: 1, title: 'Basic Training', date: '2023-02-15', status: 'Completed', verifiedBy: 'Maj. Smith' },
      { id: 2, title: 'Advanced Combat', date: '2023-06-20', status: 'Completed', verifiedBy: 'Col. Johnson' },
    ],
    documents: [
      { id: 1, title: 'Military ID', type: 'ID', uploadDate: '2023-01-01', status: 'Verified', verifiedBy: 'Lt. Brown', url: '/docs/id-1', currentVersion: 1 },
      { id: 2, title: 'Medical Certificate', type: 'Medical', uploadDate: '2023-12-01', status: 'Verified', verifiedBy: 'Maj. Smith', url: '/docs/med-1', currentVersion: 1 },
    ]
  },
  {
    id: 2,
    name: 'Jane Smith',
    rank: 'Lieutenant',
    company: 'Bravo',
    status: 'Standby',
    lastUpdated: '2024-01-10',
    email: 'jane.smith@example.com',
    dateJoined: '2023-02-15',
    role: 'RESERVIST',
    trainings: [
      { id: 3, title: 'Basic Training', date: '2023-03-15', status: 'Completed', verifiedBy: 'Maj. Smith' }
    ],
    documents: [
      { id: 3, title: 'Military ID', type: 'ID', uploadDate: '2023-02-15', status: 'Verified', verifiedBy: 'Lt. Brown', url: '/docs/id-2', currentVersion: 1 }
    ]
  },
  {
    id: 3,
    name: 'Robert Johnson',
    rank: 'Sergeant',
    company: 'Charlie',
    status: 'Ready',
    lastUpdated: '2024-01-05',
    email: 'robert.johnson@example.com',
    dateJoined: '2023-03-01',
    role: 'RESERVIST',
    trainings: [
      { id: 4, title: 'Basic Training', date: '2023-04-15', status: 'Completed', verifiedBy: 'Maj. Smith' }
    ],
    documents: [
      { id: 4, title: 'Military ID', type: 'ID', uploadDate: '2023-03-01', status: 'Verified', verifiedBy: 'Lt. Brown', url: '/docs/id-3', currentVersion: 1 }
    ]
  },
  {
    id: 4,
    name: 'Emily Davis',
    rank: 'Corporal',
    company: 'HQ',
    status: 'Retired',
    lastUpdated: '2023-12-20',
    email: 'emily.davis@example.com',
    dateJoined: '2023-01-15',
    role: 'RESERVIST',
    trainings: [
      { id: 5, title: 'Basic Training', date: '2023-02-20', status: 'Completed', verifiedBy: 'Maj. Smith' }
    ],
    documents: [
      { id: 5, title: 'Military ID', type: 'ID', uploadDate: '2023-01-15', status: 'Verified', verifiedBy: 'Lt. Brown', url: '/docs/id-4', currentVersion: 1 }
    ]
  },
  {
    id: 5,
    name: 'Michael Wilson',
    rank: 'Private',
    company: 'Signal',
    status: 'Ready',
    lastUpdated: '2024-01-12',
    email: 'michael.wilson@example.com',
    dateJoined: '2023-06-01',
    role: 'RESERVIST',
    trainings: [
      { id: 6, title: 'Basic Training', date: '2023-07-10', status: 'Completed', verifiedBy: 'Maj. Smith' }
    ],
    documents: [
      { id: 6, title: 'Military ID', type: 'ID', uploadDate: '2023-06-01', status: 'Verified', verifiedBy: 'Lt. Brown', url: '/docs/id-5', currentVersion: 1 }
    ]
  },
  {
    id: 6,
    name: 'Sarah Brown',
    rank: 'Major',
    company: 'HQ',
    status: 'Ready',
    lastUpdated: '2024-01-18',
    email: 'sarah.brown@example.com',
    dateJoined: '2022-11-15',
    role: 'STAFF',
    trainings: [
      { id: 7, title: 'Leadership Course', date: '2023-01-10', status: 'Completed', verifiedBy: 'Col. Johnson' },
      { id: 8, title: 'Advanced Tactics', date: '2023-05-15', status: 'Completed', verifiedBy: 'Col. Johnson' }
    ],
    documents: [
      { id: 7, title: 'Military ID', type: 'ID', uploadDate: '2022-11-15', status: 'Verified', verifiedBy: 'Lt. Brown', url: '/docs/id-6', currentVersion: 1 },
      { id: 8, title: 'Security Clearance', type: 'Clearance', uploadDate: '2023-01-05', status: 'Verified', verifiedBy: 'Col. Johnson', url: '/docs/cl-1', currentVersion: 1 },
      { id: 9, title: 'Military ID', type: 'ID', uploadDate: '2023-02-01', status: 'Verified', verifiedBy: 'Lt. Brown', url: '/docs/id-8', currentVersion: 1 }
    ]
  }
];

const COMPANIES: CompanyType[] = ['Alpha', 'Bravo', 'Charlie', 'HQ', 'Signal', 'FAB'];
const STATUS_OPTIONS: PersonnelStatus[] = ['Ready', 'Standby', 'Retired'];

const ITEMS_PER_PAGE = 10;

export default function PersonnelPage() {
  const { user, hasPermission, hasSpecificPermission } = useAuth();
  const router = useRouter();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<PersonnelStatus | 'All'>('All');
  const [filterCompany, setFilterCompany] = useState<CompanyType | 'All'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel | null>(null);

  // Check if user has permission to view personnel
  const hasViewPermission = hasSpecificPermission('view_company_personnel') || 
                           hasSpecificPermission('view_all_personnel');

  // Fetch personnel data
  useEffect(() => {
    const fetchPersonnel = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        setPersonnel(MOCK_PERSONNEL);
      } catch (error) {
        console.error('Failed to fetch personnel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch data if user has permission
    if (hasViewPermission) {
      fetchPersonnel();
    } else {
      setIsLoading(false);
    }
  }, [hasViewPermission]);

  // Filter personnel based on search term and filters
  const filteredPersonnel = useMemo(() => {
    return personnel.filter(person => {
      const matchesSearch = searchTerm === '' || 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.rank.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCompany = filterCompany === 'All' || person.company === filterCompany;
      const matchesStatus = filterStatus === 'All' || person.status === filterStatus;
      
      return matchesSearch && matchesCompany && matchesStatus;
    });
  }, [personnel, searchTerm, filterCompany, filterStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredPersonnel.length / ITEMS_PER_PAGE);
  const paginatedPersonnel = filteredPersonnel.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Modal handlers
  const handleView = (person: Personnel) => {
    setSelectedPersonnel(person);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleEdit = (person: Personnel) => {
    setSelectedPersonnel(person);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (person: Personnel) => {
    setPersonnelToDelete(person);
    setIsDeleteConfirmationOpen(true);
  };

  const handleDelete = async () => {
    if (!personnelToDelete) return;
    
    try {
      // In a real app, this would be an API call
      setPersonnel(prev => prev.filter(p => p.id !== personnelToDelete.id));
      setPersonnelToDelete(null);
      setIsDeleteConfirmationOpen(false);
    } catch (error) {
      console.error('Failed to delete personnel:', error);
    }
  };

  const handleSave = async (updatedData: Partial<Personnel>) => {
    if (!selectedPersonnel) return;
    
    try {
      // In a real app, this would be an API call
      setPersonnel(prev => 
        prev.map(p => 
          p.id === selectedPersonnel.id ? { ...p, ...updatedData } : p
        )
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update personnel:', error);
    }
  };

  // Content for users without permission
  const LimitedAccessContent = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Card>
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 rounded-full p-3 mr-4">
              <UserGroupIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Personnel Management</h1>
          </div>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Limited Access</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    You don't have permission to view personnel records. This feature is available to Staff, Admin, and Director roles.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personnel Management Features</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-gray-400">•</span>
                <span className="ml-2 text-gray-600">View personnel records across your company or the entire organization</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-gray-400">•</span>
                <span className="ml-2 text-gray-600">Add, edit, and manage personnel information</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-gray-400">•</span>
                <span className="ml-2 text-gray-600">Track personnel status, training, and document verification</span>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-5 w-5 text-gray-400">•</span>
                <span className="ml-2 text-gray-600">Generate reports and analytics on personnel readiness</span>
              </li>
            </ul>
          </div>
          
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Main content for users with permission
  const PersonnelContent = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="bg-indigo-100 rounded-full p-3 mr-4">
            <UserGroupIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Personnel Management</h1>
        </div>
      </div>

      {/* Search and filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="sr-only">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search by name or rank"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label htmlFor="company" className="sr-only">Company</label>
              <div className="relative">
                <select
                  id="company"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterCompany}
                  onChange={(e) => setFilterCompany(e.target.value as 'All' | CompanyType)}
                >
                  <option value="All">All Companies</option>
                  {COMPANIES.map((company) => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="w-full md:w-48">
              <label htmlFor="status" className="sr-only">Status</label>
              <div className="relative">
                <select
                  id="status"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'All' | PersonnelStatus)}
                >
                  <option value="All">All Status</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Personnel table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paginatedPersonnel.length > 0 ? (
                paginatedPersonnel.map((person) => (
                  <tr key={person.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{person.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{person.rank}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{person.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        person.status === 'Ready' 
                          ? 'bg-green-100 text-green-800' 
                          : person.status === 'Standby' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {person.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {person.lastUpdated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View details"
                          onClick={() => handleView(person)}
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        {hasPermission('STAFF') && (
                          <>
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                              onClick={() => handleEdit(person)}
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            {hasPermission('ADMIN') && (
                              <button
                                className="text-red-600 hover:text-red-900"
                                title="Delete"
                                onClick={() => handleDeleteClick(person)}
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    No personnel records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{paginatedPersonnel.length}</span> of{' '}
          <span className="font-medium">{filteredPersonnel.length}</span> personnel
        </div>
        <div className="flex space-x-2">
          <button
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Personnel button (only for Staff and above) */}
      {hasPermission('STAFF') && (
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={() => {
              setSelectedPersonnel(null);
              setModalMode('edit');
              setIsModalOpen(true);
            }}
            className="flex items-center"
          >
            <UserPlusIcon className="h-5 w-5 mr-2" />
            Add Personnel
          </Button>
        </div>
      )}

      {/* Personnel Modal */}
      <PersonnelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        personnel={selectedPersonnel}
        mode={modalMode}
        onSave={handleSave}
      />

      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={handleDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${personnelToDelete?.name}'s record? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );

  // Render the appropriate content based on permissions
  return hasViewPermission ? <PersonnelContent /> : <LimitedAccessContent />;
}
