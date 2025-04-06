'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  UserPlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon
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
import { auditService } from '@/utils/auditService';
import { AuditAction } from '@/models/AuditLog';
import { getRankDisplayName, getCompanyDisplayName } from '@/utils/formatters';

const COMPANIES: CompanyType[] = ['Alpha', 'Bravo', 'Charlie', 'Headquarters', 'NERRSC (NERR-Signal Company)', 'NERRFAB (NERR-Field Artillery Battery)'];
const STATUS_OPTIONS: PersonnelStatus[] = ['ready', 'standby', 'retired'];

const ITEMS_PER_PAGE = 10;

// Toast notification component
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast = ({ message, type, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
      <div className={`flex items-center p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {type === 'success' ? (
          <CheckCircleIcon className="h-5 w-5 mr-2" />
        ) : (
          <XCircleIcon className="h-5 w-5 mr-2" />
        )}
        <span>{message}</span>
        <button 
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <XCircleIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// SearchInput component separated for better focus management
const SearchInput = ({ value, onChange }: { value: string, onChange: (value: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = "personnel-search";
  
  // Handle change with direct value manipulation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent default behavior
    e.stopPropagation(); // Stop event propagation
    onChange(e.target.value);
  };

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      // Focus the input element when component mounts
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, []);

  return (
    <div className="relative w-full md:w-64">
      <label htmlFor={inputId} className="sr-only">Search personnel</label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        placeholder="Search personnel..."
        className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        value={value}
        onChange={handleChange}
        autoComplete="off"
        spellCheck="false"
        aria-label="Search personnel by name, rank, email or service number"
      />
    </div>
  );
};

// FilterDropdown component for consistent styling
const FilterDropdown = ({ 
  value, 
  onChange, 
  options, 
  label 
}: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, 
  options: {value: string, label: string}[],
  label: string
}) => {
  const id = `filter-${label.toLowerCase().replace(/\s/g, '-')}`;
  
  return (
    <div className="relative w-full md:w-auto">
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg appearance-none w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        value={value}
        onChange={onChange}
        aria-label={label}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
};

export default function PersonnelPage() {
  const { user, hasPermission, hasSpecificPermission } = useAuth();
  const router = useRouter();
  const [allPersonnel, setAllPersonnel] = useState<Personnel[]>([]);
  const [filteredPersonnel, setFilteredPersonnel] = useState<Personnel[]>([]);
  
  // Create separate state variables for input and filters
  const [searchValue, setSearchValue] = useState("");
  const [filterStatus, setFilterStatus] = useState<PersonnelStatus | 'All'>('All');
  const [filterCompany, setFilterCompany] = useState<CompanyType | 'All'>('All');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [personnelToDelete, setPersonnelToDelete] = useState<Personnel | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Track recently modified personnel for animations
  const [recentlyModified, setRecentlyModified] = useState<string | null>(null);
  
  // Function to apply filters to personnel data
  const applyFilters = (personnelData: Personnel[]) => {
    const filtered = personnelData.filter(person => {
      // Search filter
      const searchTerm = searchValue.toLowerCase();
      const searchMatch = searchValue === '' || 
        (person.name?.toLowerCase().includes(searchTerm)) ||
        (person.rank?.toLowerCase().includes(searchTerm)) ||
        (person.email?.toLowerCase().includes(searchTerm)) ||
        (typeof person.serviceNumber === 'string' && person.serviceNumber.toLowerCase().includes(searchTerm));
      
      // Company & status filters
      const companyMatch = filterCompany === 'All' || person.company === filterCompany;
      const statusMatch = filterStatus === 'All' || person.status === filterStatus;
      
      return searchMatch && companyMatch && statusMatch;
    });
    
    setFilteredPersonnel(filtered);
  };

  // Check if user has permission to view personnel
  const hasViewPermission = hasSpecificPermission('view_company_personnel') || 
                           hasSpecificPermission('view_all_personnel');

  // Load all personnel data once
  useEffect(() => {
    const fetchAllPersonnel = async () => {
      setIsLoading(true);
      try {
        // Only fetch once at the beginning
        console.log('Fetching all personnel data...');
        
        // Increase pageSize to ensure we get all personnel
        const response = await fetch(`/api/personnel?pageSize=1000`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          // Process the data
          let personnelData = data.data.personnel || [];
          
          console.log(`Loaded ${personnelData.length} personnel records from API`);
          
          // Map MongoDB _id to id for frontend compatibility and normalize status values
          personnelData = personnelData.map((person: any) => {
            // Normalize status to match our allowed values
            const normalizedStatus = normalizeStatus(person.status);
            
            return {
              ...person,
              id: person._id || person.id,
              status: normalizedStatus,
              lastUpdated: person.lastUpdated ? new Date(person.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()
            };
          });
          
          setAllPersonnel(personnelData);
          setFilteredPersonnel(personnelData);
          
          // Set pagination data
          const totalPagesCount = Math.ceil(personnelData.length / ITEMS_PER_PAGE);
          setTotalPages(totalPagesCount);
          console.log(`Setting total pages to ${totalPagesCount} (${personnelData.length} items at ${ITEMS_PER_PAGE} per page)`);
          setInitialLoadComplete(true);
        } else {
          throw new Error(data.error || 'Failed to fetch personnel');
        }
      } catch (error) {
        console.error('Failed to fetch personnel:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPersonnel();
  }, []);

  // Helper function to normalize status values
  const normalizeStatus = (status: string): PersonnelStatus => {
    const validStatuses: PersonnelStatus[] = ['active', 'pending', 'inactive', 'retired', 'standby', 'ready'];
    
    // Return the status if it's already valid
    if (validStatuses.includes(status?.toLowerCase() as PersonnelStatus)) {
      return status.toLowerCase() as PersonnelStatus;
    }
    
    // Map specific legacy statuses
    if (status?.toLowerCase() === 'medical' || status?.toLowerCase() === 'leave') {
      return 'inactive';
    }
    
    // Default fallback
    return 'inactive';
  };

  // Client-side filtering effect
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    // Filter personnel
    const filtered = allPersonnel.filter(person => {
      // Search filter
      const searchTerm = searchValue.toLowerCase();
      const searchMatch = searchValue === '' || 
        (person.name?.toLowerCase().includes(searchTerm)) ||
        (person.rank?.toLowerCase().includes(searchTerm)) ||
        (person.email?.toLowerCase().includes(searchTerm)) ||
        (typeof person.serviceNumber === 'string' && person.serviceNumber.toLowerCase().includes(searchTerm));
      
      // Company & status filters
      const companyMatch = filterCompany === 'All' || person.company === filterCompany;
      const statusMatch = filterStatus === 'All' || person.status === filterStatus;
      
      return searchMatch && companyMatch && statusMatch;
    });
    
    setFilteredPersonnel(filtered);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE)));
    
    // Reset to first page when filters change
    setCurrentPage(1);
  }, [searchValue, filterCompany, filterStatus, allPersonnel, initialLoadComplete]);

  // Handle search input change separately to avoid rendering issues
  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  // Get current page data
  const currentPersonnel = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    // Log pagination information for debugging
    console.log(`Pagination: Page ${currentPage}, showing items ${startIndex+1}-${Math.min(endIndex, filteredPersonnel.length)} of ${filteredPersonnel.length}`);
    
    return filteredPersonnel.slice(startIndex, endIndex);
  }, [filteredPersonnel, currentPage, ITEMS_PER_PAGE]);

  // Company filter options
  const companyOptions = [
    { value: 'All', label: 'All Companies' },
    ...COMPANIES.map(company => ({ 
      value: company, 
      label: company 
    }))
  ];

  // Status filter options
  const statusOptions = [
    { value: 'All', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'pending', label: 'Pending' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'retired', label: 'Retired' },
    { value: 'standby', label: 'Standby' },
    { value: 'ready', label: 'Ready' }
  ];

  // Modal handlers
  const handleView = (person: Personnel) => {
    setSelectedPersonnel(person);
    setModalMode('view');
    setIsModalOpen(true);
    
    // Log this view action to the audit system
    if (user && user._id) {
      auditService.logPersonnelAction(
        user._id,
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        user.role,
        'view' as AuditAction,
        person.id,
        person.name
      ).catch(error => console.error('Failed to log personnel view:', error));
    }
  };

  const handleEdit = (person: Personnel) => {
    setSelectedPersonnel(person);
    setModalMode('edit');
    setIsModalOpen(true);
    
    // Log this edit action to the audit system
    if (user && user._id) {
      auditService.logPersonnelAction(
        user._id,
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        user.role,
        'update' as AuditAction,
        person.id,
        person.name
      ).catch(error => console.error('Failed to log personnel edit initiation:', error));
    }
  };

  const handleDeleteClick = (person: Personnel) => {
    setPersonnelToDelete(person);
    setIsDeleteConfirmationOpen(true);
    
    // Log this delete attempt to the audit system
    if (user && user._id) {
      auditService.logPersonnelAction(
        user._id,
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        user.role,
        'delete' as AuditAction,
        person.id,
        person.name
      ).catch(error => console.error('Failed to log personnel delete attempt:', error));
    }
  };

  const handleDelete = async () => {
    if (!personnelToDelete || !user || !user._id) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/personnel?id=${personnelToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        setAllPersonnel(prev => prev.filter(p => p.id !== personnelToDelete.id));
        setFilteredPersonnel(prev => prev.filter(p => p.id !== personnelToDelete.id));
        
        // Show success message
        setToast({
          message: `${personnelToDelete.name} has been deleted successfully`,
          type: 'success'
        });
        
        // Log successful delete to audit system
        auditService.logPersonnelAction(
          user._id,
          `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          user.role,
          'delete' as AuditAction,
          personnelToDelete.id,
          personnelToDelete.name
        ).catch(error => console.error('Failed to log personnel deletion:', error));
      } else {
        throw new Error(result.error || 'Failed to delete personnel');
      }
    } catch (error) {
      console.error('Error deleting personnel:', error);
      setToast({
        message: 'Failed to delete personnel. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
      setIsDeleteConfirmationOpen(false);
      setPersonnelToDelete(null);
    }
  };

  const handleSave = async (updatedData: Partial<Personnel>) => {
    if (!selectedPersonnel || !user || !user._id) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Check for a string 'new' not a numerical comparison
      const isNewPersonnel = selectedPersonnel.id.toString() === 'new';
      const url = `/api/personnel${isNewPersonnel ? '' : `?id=${selectedPersonnel.id}`}`;
      const method = isNewPersonnel ? 'POST' : 'PUT';
      
      // Prepare the data
      const personnelData = isNewPersonnel
        ? { ...updatedData }
        : { ...selectedPersonnel, ...updatedData };
      
      // Set last updated timestamp as string
      personnelData.lastUpdated = new Date().toISOString();
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(personnelData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update was successful
        setIsModalOpen(false);
        
        // Show success message
        setToast({
          message: `${personnelData.name} has been ${isNewPersonnel ? 'created' : 'updated'} successfully`,
          type: 'success'
        });
        
        // Mark as recently modified for animation
        const newId = isNewPersonnel && result.data?.id ? result.data.id : selectedPersonnel.id;
        if (newId) setRecentlyModified(newId);
        
        // Log to audit system
        const action = isNewPersonnel ? 'create' as AuditAction : 'update' as AuditAction;
        auditService.logPersonnelAction(
          user._id,
          `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          user.role,
          action,
          isNewPersonnel && result.data?.id ? result.data.id : selectedPersonnel.id,
          personnelData.name || ''
        ).catch(error => console.error(`Failed to log personnel ${action}:`, error));
        
        // Refresh the personnel list
        const refreshPersonnel = async () => {
          try {
            const response = await fetch(`/api/personnel?pageSize=100`);
            
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
              // Process the data
              let personnelData = data.data.personnel || [];
              
              // Map MongoDB _id to id for frontend compatibility and normalize statuses
              personnelData = personnelData.map((person: any) => ({
                ...person,
                id: person._id || person.id,
                status: normalizeStatus(person.status),
                lastUpdated: person.lastUpdated ? new Date(person.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()
              }));
              
              setAllPersonnel(personnelData);
              
              // Apply existing filters
              applyFilters(personnelData);
            } else {
              throw new Error(data.error || 'Failed to fetch personnel');
            }
          } catch (error) {
            console.error('Failed to fetch personnel:', error);
          }
        };
        
        refreshPersonnel();
      } else {
        throw new Error(result.error || 'Failed to save personnel');
      }
    } catch (error) {
      console.error('Failed to save personnel:', error);
      setToast({
        message: 'Failed to save personnel. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Force re-render when current page changes to ensure pagination works correctly
  useEffect(() => {
    // Calculate current items for this page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    
    // Force data refresh by setting a new array (even though it's the same data)
    const currentItems = filteredPersonnel.slice(startIndex, endIndex);
    console.log(`Page changed to ${currentPage}: showing items ${startIndex+1}-${Math.min(endIndex, filteredPersonnel.length)}`);
    
    // This will trigger a re-render even if filteredPersonnel hasn't changed
    if (currentPage > 1 && currentItems.length === 0 && filteredPersonnel.length > 0) {
      // If we ended up on a page with no items but there are items available,
      // reset to page 1 (this can happen if filtering changed)
      console.log("Reset to page 1 because current page has no items");
      setCurrentPage(1);
    }
  }, [currentPage, filteredPersonnel]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0 text-white bg-indigo-600 py-2 px-4 rounded-lg shadow-md">Personnel Management</h1>
        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <div className="text-sm font-medium text-gray-600 mb-3">Filter Personnel</div>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <SearchInput 
              value={searchValue} 
              onChange={handleSearchChange} 
            />
            
            <FilterDropdown 
              value={filterCompany} 
              onChange={(e) => setFilterCompany(e.target.value as CompanyType | 'All')} 
              options={companyOptions}
              label="Filter by company"
            />
            
            <FilterDropdown 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as PersonnelStatus | 'All')} 
              options={statusOptions}
              label="Filter by status"
            />
          </div>
        </div>
      </div>
      
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
              ) : currentPersonnel.length > 0 ? (
                currentPersonnel.map((person, index) => (
                  <tr 
                    key={person.id}
                    className={`${recentlyModified === person.id.toString() 
                      ? 'animate-highlight' 
                      : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{person.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getRankDisplayName(person.rank)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{getCompanyDisplayName(person.company)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`status-badge ${
                        // Map any statuses not in our official list to "inactive"
                        ['ready', 'standby', 'active', 'pending', 'inactive', 'retired'].includes(person.status?.toLowerCase()) ?
                          person.status?.toLowerCase() === 'ready' 
                            ? 'status-badge-ready' 
                            : person.status?.toLowerCase() === 'standby' 
                              ? 'status-badge-standby' 
                              : person.status?.toLowerCase() === 'active'
                                ? 'status-badge-active'
                                : person.status?.toLowerCase() === 'pending'
                                  ? 'status-badge-pending'
                                  : person.status?.toLowerCase() === 'inactive'
                                    ? 'status-badge-inactive'
                                    : person.status?.toLowerCase() === 'retired'
                                      ? 'status-badge-retired'
                                      : 'status-badge-inactive'
                        : 'status-badge-inactive'
                      }`}>
                        {['ready', 'standby', 'active', 'pending', 'inactive', 'retired'].includes(person.status?.toLowerCase()) ?
                          person.status?.charAt(0).toUpperCase() + person.status?.slice(1).toLowerCase() :
                          'Inactive'}
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
                        {hasPermission('staff') && (
                          <>
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                              onClick={() => handleEdit(person)}
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                            </button>
                            {hasPermission('admin') && (
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
          Showing <span className="font-medium">
            {currentPage === 1 ? "1" : `${(currentPage - 1) * ITEMS_PER_PAGE + 1}`} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredPersonnel.length)}
          </span> of{' '}
          <span className="font-medium">{filteredPersonnel.length}</span> personnel
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setCurrentPage(prev => Math.max(1, prev - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {/* Page numbers */}
          <div className="flex items-center">
            <span className="px-3 py-2 text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            {/* Only show page number buttons if there are multiple pages */}
            {totalPages > 1 && (
              <div className="hidden sm:flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Calculate which page numbers to show
                  let pageNum;
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // If near beginning, show first 5 pages
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // If near end, show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show current page and 2 on each side
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => {
                        setCurrentPage(pageNum);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md ${
                        currentPage === pageNum
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          
          <button
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => {
              setCurrentPage(prev => Math.min(totalPages, prev + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Personnel button (only for Staff and above) */}
      {hasPermission('staff') && (
        <div className="mt-6">
          <Button
            variant="primary"
            onClick={() => {
              // Reset the selected personnel to null for creating a new record
              setSelectedPersonnel(null);
              setModalMode('edit');
              setIsModalOpen(true);
              
              // Small delay to ensure state is updated before modal opens
              setTimeout(() => {
                console.log("Opening modal for new personnel");
              }, 100);
            }}
            className="flex items-center shadow-md hover:shadow-lg transition-shadow duration-300"
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
        title="Delete Personnel Record"
        message={`Are you sure you want to delete the record for ${personnelToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gray-100 pb-10">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        // Always show the PersonnelContent for now
        <PersonnelContent />
      )}

      {/* Personnel modal */}
      {isModalOpen && selectedPersonnel && (
        <PersonnelModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          personnel={selectedPersonnel}
          mode={modalMode}
          onSave={handleSave}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmationDialog
        isOpen={isDeleteConfirmationOpen}
        onClose={() => setIsDeleteConfirmationOpen(false)}
        onConfirm={handleDelete}
        title="Delete Personnel Record"
        message={`Are you sure you want to delete the record for ${personnelToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
      
      {/* Toast notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
}
