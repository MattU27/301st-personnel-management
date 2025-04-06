'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { toast } from 'react-hot-toast';
import { 
  UserGroupIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  UserIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// Sample account data - will be replaced with API call
interface AccountRequest {
  id: string;
  name: string;
  email: string;
  rank: string;
  company: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

const MOCK_ACCOUNTS: AccountRequest[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@army.mil.ph',
    rank: 'Private First Class',
    company: 'Alpha',
    submittedAt: '2024-04-01T10:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@army.mil.ph',
    rank: 'Corporal',
    company: 'Bravo',
    submittedAt: '2024-04-02T08:15:00Z',
    status: 'pending'
  },
  {
    id: '3',
    name: 'Michael Davis',
    email: 'michael.davis@army.mil.ph',
    rank: 'Sergeant',
    company: 'Charlie',
    submittedAt: '2024-04-02T14:45:00Z',
    status: 'pending'
  },
  {
    id: '4',
    name: 'Lisa Wilson',
    email: 'lisa.wilson@army.mil.ph',
    rank: 'Staff Sergeant',
    company: 'Headquarters',
    submittedAt: '2024-04-03T09:20:00Z',
    status: 'pending'
  }
];

export default function PersonnelAccountsPage() {
  const { user, isAuthenticated, isLoading, hasSpecificPermission } = useAuth();
  const router = useRouter();
  const [accounts, setAccounts] = useState<AccountRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<AccountRequest | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'approve' | 'reject' | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  
  // Check if user has permission to approve accounts
  const canApproveAccounts = hasSpecificPermission('approve_reservist_accounts');

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

    // Fetch accounts data
    fetchAccountsData();
  }, [isLoading, isAuthenticated, user, router]);

  const fetchAccountsData = async () => {
    setLoading(true);
    try {
      // Call the API to get account requests
      const response = await fetch('/api/personnel/accounts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch account data');
      }
      
      setAccounts(data.accounts || []);
    } catch (error) {
      console.error('Error fetching accounts data:', error);
      toast.error('Failed to load account requests');
      // Fallback to mock data in case of error
      setAccounts(MOCK_ACCOUNTS);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAccount = async (account: AccountRequest) => {
    setSelectedAccount(account);
    setConfirmationAction('approve');
    setShowConfirmation(true);
  };

  const handleRejectAccount = async (account: AccountRequest) => {
    setSelectedAccount(account);
    setShowRejectionModal(true);
  };

  const confirmApprove = async () => {
    if (!selectedAccount) return;
    
    setShowConfirmation(false);
    
    try {
      const response = await fetch('/api/personnel/accounts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: selectedAccount.id,
          status: 'approved' as const
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve account');
      }
      
      // Update the local state
      const updatedAccounts = accounts.map(acc => 
        acc.id === selectedAccount.id ? { ...acc, status: 'approved' as const } : acc
      );
      
      setAccounts(updatedAccounts);
      toast.success(`Account for ${selectedAccount.name} approved successfully`);
    } catch (error) {
      console.error('Error approving account:', error);
      toast.error('Failed to approve account');
    }
  };

  const confirmReject = async () => {
    if (!selectedAccount) return;
    
    setShowRejectionModal(false);
    
    try {
      const response = await fetch('/api/personnel/accounts', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          id: selectedAccount.id,
          status: 'rejected' as const,
          rejectionReason
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject account');
      }
      
      // Update the local state
      const updatedAccounts = accounts.map(acc => 
        acc.id === selectedAccount.id ? { ...acc, status: 'rejected' as const } : acc
      );
      
      setAccounts(updatedAccounts);
      toast.success(`Account for ${selectedAccount.name} rejected`);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting account:', error);
      toast.error('Failed to reject account');
    }
  };

  const filteredAccounts = accounts.filter(account => {
    if (filterStatus === 'all') return true;
    return account.status === filterStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  if (!canApproveAccounts) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="p-6 text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-base font-semibold text-gray-900">Access Denied</h3>
            <p className="mt-1 text-sm text-gray-500">
              You do not have permission to approve personnel accounts.
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-full p-3">
                <UserGroupIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Personnel Account Approval</h2>
                <p className="text-sm text-gray-500">
                  Approve or reject new personnel account requests
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Requests</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <Button
                variant="secondary"
                onClick={() => fetchAccountsData()}
                className="flex items-center"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {filteredAccounts.length === 0 ? (
          <Card>
            <div className="p-6 text-center">
              <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-base font-semibold text-gray-900">No Account Requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no {filterStatus === 'all' ? '' : filterStatus} account requests at this time.
              </p>
            </div>
          </Card>
        ) : (
          <div className="overflow-hidden bg-white shadow sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
                <li key={account.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <p className="truncate text-sm font-medium text-indigo-600">{account.name}</p>
                        <p className="flex-shrink-0 text-xs text-gray-500">
                          Submitted on {formatDate(account.submittedAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {account.status === 'pending' ? (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveAccount(account)}
                              className="flex items-center"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRejectAccount(account)}
                              className="flex items-center"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        ) : (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            account.status === 'approved' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex sm:space-x-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <UserIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                          <p>{account.rank}</p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <UserGroupIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                          <p>{account.company} Company</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>{account.email}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={confirmApprove}
        title="Approve Account"
        message={`Are you sure you want to approve the account for ${selectedAccount?.name}?`}
        confirmText="Approve"
        cancelText="Cancel"
        type="info"
      />

      {/* Rejection Dialog */}
      <div className={`fixed inset-0 z-10 overflow-y-auto ${showRejectionModal ? 'block' : 'hidden'}`}>
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <XCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900">
                    Reject Account
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to reject the account for {selectedAccount?.name}?
                    </p>
                    <div className="mt-4">
                      <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700">
                        Reason for rejection (optional)
                      </label>
                      <textarea
                        id="rejectionReason"
                        name="rejectionReason"
                        rows={3}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                onClick={confirmReject}
              >
                Reject
              </button>
              <button
                type="button"
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                onClick={() => setShowRejectionModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 