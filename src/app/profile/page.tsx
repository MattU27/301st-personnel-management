"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { UserIcon, DocumentTextIcon, AcademicCapIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import TwoFactorAuthSetup from '@/components/TwoFactorAuthSetup';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    rank: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        company: user.company || '',
        rank: user.rank || '',
        phone: '09123456789', // Mock data
        address: '123 Main St, Quezon City, Philippines', // Mock data
        emergencyContact: 'Jane Doe', // Mock data
        emergencyPhone: '09987654321', // Mock data
      });
    }
  }, [isLoading, isAuthenticated, router, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call to update the user's profile
    setIsEditing(false);
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteAccount = async () => {
    // In a real app, you would make an API call to delete the user's account
    console.log('Account deleted');
    router.push('/login');
  };

  const handle2FASetup = () => {
    setShow2FASetup(true);
  };

  const handle2FAComplete = async (secret: string, backupCodes: string[]) => {
    try {
      // In a real app, you would make an API call to save the 2FA settings
      console.log('2FA enabled with secret:', secret);
      console.log('Backup codes:', backupCodes);
      setIs2FAEnabled(true);
      setShow2FASetup(false);
    } catch (error) {
      console.error('Failed to enable 2FA:', error);
    }
  };

  const handle2FACancel = () => {
    setShow2FASetup(false);
  };

  const handle2FADisable = () => {
    // In a real app, you would make an API call to disable 2FA
    setIs2FAEnabled(false);
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

  const companies = ['Alpha', 'Bravo', 'Charlie', 'HQ', 'Signal', 'FAB'];
  const ranks = ['Private', 'Corporal', 'Sergeant', 'Lieutenant', 'Captain', 'Major', 'Colonel'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center">
            <div className="bg-indigo-100 rounded-full p-3">
              <UserIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h2 className="text-lg font-medium text-gray-900">My Profile</h2>
              <p className="text-sm text-gray-500">
                {user.role === 'RESERVIST' ? `${user.rank || 'N/A'} | ${user.company || 'N/A'} Company | Status: ${user.status || 'N/A'}` : user.role}
              </p>
            </div>
          </div>
        </div>

        <Card title="Personal Information">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                {user.role === 'RESERVIST' && (
                  <>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company
                      </label>
                      <select
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {companies.map((company) => (
                          <option key={company} value={company}>
                            {company}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rank" className="block text-sm font-medium text-gray-700">
                        Rank
                      </label>
                      <select
                        id="rank"
                        name="rank"
                        value={formData.rank}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:text-gray-500"
                      >
                        {ranks.map((rank) => (
                          <option key={rank} value={rank}>
                            {rank}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700">
                    Emergency Contact
                  </label>
                  <input
                    id="emergencyContact"
                    name="emergencyContact"
                    type="text"
                    value={formData.emergencyContact}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700">
                    Emergency Contact Phone
                  </label>
                  <input
                    id="emergencyPhone"
                    name="emergencyPhone"
                    type="text"
                    value={formData.emergencyPhone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                {isEditing ? (
                  <>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button type="button" variant="primary" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>

        {user.role === 'RESERVIST' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="Documents">
              <div className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">Personal Information Form</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">Medical Certificate</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                      <span className="ml-2 text-sm text-gray-600">Training Certificate</span>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Missing
                    </span>
                  </li>
                </ul>
                <Button size="sm" variant="secondary" className="w-full mt-4">
                  Manage Documents
                </Button>
              </div>
            </Card>

            <Card title="Training History">
              <div className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                      <div className="ml-2">
                        <span className="text-sm font-medium text-gray-900">Basic Combat Training</span>
                        <p className="text-xs text-gray-500">January 15, 2024 - Camp Aguinaldo</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                      <div className="ml-2">
                        <span className="text-sm font-medium text-gray-900">First Aid Seminar</span>
                        <p className="text-xs text-gray-500">February 2, 2024 - Medical Center</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <div className="flex items-center">
                      <AcademicCapIcon className="h-5 w-5 text-gray-400" />
                      <div className="ml-2">
                        <span className="text-sm font-medium text-gray-900">Leadership Training</span>
                        <p className="text-xs text-gray-500">March 10, 2024 - Camp Aguinaldo</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Registered
                    </span>
                  </li>
                </ul>
                <Button size="sm" variant="secondary" className="w-full mt-4">
                  View All Trainings
                </Button>
              </div>
            </Card>
          </div>
        )}

        <Card title="Account Settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account.</p>
              
              {is2FAEnabled ? (
                <div className="mt-4">
                  <div className="flex items-center mb-3">
                    <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-sm text-green-600 font-medium">Two-Factor Authentication is enabled</span>
                  </div>
                  <Button 
                    size="sm" 
                    variant="danger" 
                    onClick={handle2FADisable}
                  >
                    Disable 2FA
                  </Button>
                </div>
              ) : (
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="mt-4"
                  onClick={handle2FASetup}
                >
                  Enable 2FA
                </Button>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
              <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all associated data.</p>
              <Button 
                size="sm" 
                variant="danger" 
                className="mt-4"
                onClick={handleDeleteAccountClick}
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
        confirmText="Delete Account"
        cancelText="Cancel"
        type="danger"
      />

      {/* 2FA Setup Modal */}
      {show2FASetup && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <TwoFactorAuthSetup 
              onComplete={handle2FAComplete}
              onCancel={handle2FACancel}
            />
          </div>
        </div>
      )}
    </div>
  );
} 