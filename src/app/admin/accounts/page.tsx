'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { UserIcon, ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

interface AdminAccount {
  id: string;
  name: string;
  email: string;
  rank: string;
  serialNumber: string;
  branch: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

const MOCK_ADMIN_ACCOUNTS: AdminAccount[] = [
  {
    id: '1',
    name: 'COL Antonio Reyes',
    email: 'antonio.reyes@army.mil.ph',
    rank: 'Colonel',
    serialNumber: '301-34567',
    branch: '301st Infantry Brigade',
    status: 'active',
    lastActive: '2024-03-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'LTC Maria Santos',
    email: 'maria.santos@army.mil.ph',
    rank: 'Lieutenant Colonel',
    serialNumber: '301-45678',
    branch: '301st Infantry Brigade',
    status: 'active',
    lastActive: '2024-03-14T16:45:00Z'
  },
  {
    id: '3',
    name: 'MAJ David Lim',
    email: 'david.lim@army.mil.ph',
    rank: 'Major',
    serialNumber: '301-56789',
    branch: '301st Infantry Brigade',
    status: 'inactive',
    lastActive: '2024-02-28T09:15:00Z'
  }
];

export default function AdminAccountsPage() {
  const router = useRouter();
  const { hasSpecificPermission } = useAuth();
  const [adminAccounts] = useState<AdminAccount[]>(MOCK_ADMIN_ACCOUNTS);

  if (!hasSpecificPermission('manage_admin_roles')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-lg">
          <div className="text-center">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h2>
            <p className="mt-1 text-sm text-gray-500">
              You do not have permission to manage admin accounts.
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

  const handleToggleStatus = (id: string, currentStatus: 'active' | 'inactive') => {
    // Here you would typically make an API call to update the admin account status
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const action = currentStatus === 'active' ? 'deactivated' : 'reactivated';
    alert(`Admin account ${id} ${action} successfully`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Admin Accounts</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Manage system administrator accounts and their access levels.
                </p>
              </div>
              <Button
                variant="primary"
                onClick={() => router.push('/admin/create')}
              >
                Create New Admin
              </Button>
            </div>

            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                      Name & Rank
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Contact
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Serial Number
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Last Active
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {adminAccounts.map((admin) => (
                    <tr key={admin.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3">
                        <div>
                          <div className="font-medium text-gray-900">{admin.name}</div>
                          <div className="text-gray-500">{admin.rank}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <div>
                          <div className="text-gray-900">{admin.email}</div>
                          <div className="text-gray-500">{admin.branch}</div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-gray-900">
                        {admin.serialNumber}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            admin.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-gray-900">
                        {new Date(admin.lastActive).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant={admin.status === 'active' ? 'danger' : 'success'}
                            size="sm"
                            onClick={() => handleToggleStatus(admin.id, admin.status)}
                            className="flex items-center"
                          >
                            {admin.status === 'active' ? (
                              <>
                                <ShieldExclamationIcon className="h-5 w-5 mr-1" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ShieldCheckIcon className="h-5 w-5 mr-1" />
                                Reactivate
                              </>
                            )}
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => router.push(`/admin/manage/${admin.id}`)}
                          >
                            Edit Access
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => router.back()}
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 