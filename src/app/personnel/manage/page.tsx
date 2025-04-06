'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { toast } from 'react-hot-toast';
import { 
  UserGroupIcon, 
  UserIcon,
  UserPlusIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// Personnel interface
interface Personnel {
  id: string;
  name: string;
  rank: string;
  company: string;
  status: string;
  email: string;
  phone?: string;
  dateJoined: string;
  lastUpdated: string;
}

// Sample data
const MOCK_PERSONNEL: Personnel[] = [
  {
    id: '1',
    name: 'John Smith',
    rank: 'Private First Class',
    company: 'Alpha',
    status: 'Ready',
    email: 'john.smith@army.mil.ph',
    phone: '09123456789',
    dateJoined: '2023-04-15',
    lastUpdated: '2024-03-01'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    rank: 'Corporal',
    company: 'Bravo',
    status: 'Standby',
    email: 'sarah.johnson@army.mil.ph',
    phone: '09234567890',
    dateJoined: '2022-07-22',
    lastUpdated: '2024-02-15'
  },
  {
    id: '3',
    name: 'Michael Davis',
    rank: 'Sergeant',
    company: 'Charlie',
    status: 'Ready',
    email: 'michael.davis@army.mil.ph',
    dateJoined: '2021-09-10',
    lastUpdated: '2024-01-20'
  }
];

// Company options
const COMPANIES = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Headquarters',
  'NERRSC (NERR-Signal Company)',
  'NERRFAB (NERR-Field Artillery Battery)'
];

// Rank options
const RANKS = [
  'Private',
  'Private First Class',
  'Corporal',
  'Sergeant',
  'Staff Sergeant',
  'Technical Sergeant',
  'Master Sergeant',
  'First Master Sergeant',
  'Chief Master Sergeant',
  'Second Lieutenant',
  'First Lieutenant',
  'Captain',
  'Major',
  'Lieutenant Colonel',
  'Colonel',
  'Brigadier General',
  'Major General',
  'Lieutenant General',
  'General'
];

// Status options
const STATUS_OPTIONS = [
  'Ready',
  'Standby',
  'Retired'
];

export default function ManagePersonnelPage() {
  const { user, isAuthenticated, isLoading, hasSpecificPermission } = useAuth();
  const router = useRouter();
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    company: '',
    status: '',
    email: '',
    phone: '',
    dateJoined: ''
  });

  // Check if user has permission to manage personnel
  const canManagePersonnel = hasSpecificPermission('update_personnel_records');
  
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

    // Fetch personnel data
    fetchPersonnelData();
  }, [isLoading, isAuthenticated, user, router]);

  const fetchPersonnelData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would be an API call
      // For now, use the mock data
      setPersonnel(MOCK_PERSONNEL);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error fetching personnel data:', error);
      toast.error('Failed to load personnel data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPersonnel = () => {
    setEditingPersonnel(null);
    setFormData({
      name: '',
      rank: '',
      company: '',
      status: '',
      email: '',
      phone: '',
      dateJoined: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleEditPersonnel = (person: Personnel) => {
    setEditingPersonnel(person);
    setFormData({
      name: person.name,
      rank: person.rank,
      company: person.company,
      status: person.status,
      email: person.email,
      phone: person.phone || '',
      dateJoined: person.dateJoined
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.rank || !formData.company || !formData.status || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // For demo purposes, we'll just update the local state
      if (editingPersonnel) {
        // Update existing personnel
        const updatedPersonnel = personnel.map(p => 
          p.id === editingPersonnel.id ? 
          { 
            ...p, 
            name: formData.name,
            rank: formData.rank,
            company: formData.company,
            status: formData.status,
            email: formData.email,
            phone: formData.phone,
            lastUpdated: new Date().toISOString().split('T')[0]
          } : p
        );
        setPersonnel(updatedPersonnel);
        toast.success('Personnel updated successfully');
      } else {
        // Add new personnel
        const newPersonnel: Personnel = {
          id: Date.now().toString(), // Generate a temporary ID
          name: formData.name,
          rank: formData.rank,
          company: formData.company,
          status: formData.status,
          email: formData.email,
          phone: formData.phone,
          dateJoined: formData.dateJoined,
          lastUpdated: new Date().toISOString().split('T')[0]
        };
        setPersonnel([...personnel, newPersonnel]);
        toast.success('Personnel added successfully');
      }
      
      // Close the modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving personnel:', error);
      toast.error('Failed to save personnel data');
    }
  };

  // Filter personnel based on search term and filters
  const filteredPersonnel = personnel
    .filter(person => 
      (searchTerm === '' || 
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase())
      ) &&
      (companyFilter === 'All' || person.company === companyFilter) &&
      (statusFilter === 'All' || person.status === statusFilter)
    );

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

  if (!canManagePersonnel) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="p-6 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-base font-semibold text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You do not have permission to manage personnel records.
            </p>
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
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-full p-3">
                <UserGroupIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Personnel Management</h2>
                <p className="text-sm text-gray-500">
                  Add, update, and manage personnel records
                </p>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="primary"
                onClick={handleAddPersonnel}
                className="flex items-center"
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Add Personnel
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="companyFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Company
              </label>
              <select
                id="companyFilter"
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="All">All Companies</option>
                {COMPANIES.map((company) => (
                  <option key={company} value={company}>{company}</option>
                ))}
              </select>
            </div>
            <div className="w-full md:w-1/3">
              <label htmlFor="statusFilter" className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="All">All Statuses</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

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
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Joined
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
                {filteredPersonnel.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                      No personnel records found
                    </td>
                  </tr>
                ) : (
                  filteredPersonnel.map((person) => (
                    <tr key={person.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {person.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          person.status === 'Ready' ? 'bg-green-100 text-green-800' :
                          person.status === 'Standby' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {person.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.dateJoined}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {person.lastUpdated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditPersonnel(person)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Personnel Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <UserIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <h3 className="text-base font-semibold leading-6 text-gray-900">
                      {editingPersonnel ? 'Edit Personnel' : 'Add New Personnel'}
                    </h3>
                    <div className="mt-4">
                      <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                              Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              required
                              value={formData.name}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="rank" className="block text-sm font-medium text-gray-700">
                              Rank <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="rank"
                              id="rank"
                              required
                              value={formData.rank}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Select Rank</option>
                              {RANKS.map((rank) => (
                                <option key={rank} value={rank}>{rank}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                              Company <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="company"
                              id="company"
                              required
                              value={formData.company}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Select Company</option>
                              {COMPANIES.map((company) => (
                                <option key={company} value={company}>{company}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                              Status <span className="text-red-500">*</span>
                            </label>
                            <select
                              name="status"
                              id="status"
                              required
                              value={formData.status}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            >
                              <option value="">Select Status</option>
                              {STATUS_OPTIONS.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              required
                              value={formData.email}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Phone
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              id="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="dateJoined" className="block text-sm font-medium text-gray-700">
                              Date Joined <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="date"
                              name="dateJoined"
                              id="dateJoined"
                              required
                              value={formData.dateJoined}
                              onChange={handleInputChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                  onClick={handleSubmit}
                >
                  {editingPersonnel ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 