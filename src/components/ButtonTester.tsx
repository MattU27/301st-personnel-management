'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from './Card';
import Button from './Button';
import { UserRole } from '@/types/personnel';

interface ButtonTestProps {
  buttonLabel: string;
  requiredPermission?: string;
  requiredRole?: UserRole;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
}

export default function ButtonTester() {
  const { user, hasSpecificPermission, simulateRole } = useAuth();
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const [activeRole, setActiveRole] = useState<UserRole | null>(user?.role || null);
  const [permissionDebug, setPermissionDebug] = useState<{[key: string]: boolean}>({});
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Reset active role when user changes
  useEffect(() => {
    if (user) {
      setActiveRole(user.role);
    }
  }, [user]);

  // Define test buttons for each role
  const reservistButtons: ButtonTestProps[] = [
    { buttonLabel: 'View Profile', requiredPermission: 'view_own_profile', onClick: () => testButtonClick('View Profile') },
    { buttonLabel: 'Edit Profile', requiredPermission: 'edit_own_profile', onClick: () => testButtonClick('Edit Profile') },
    { buttonLabel: 'Upload Document', requiredPermission: 'upload_own_documents', onClick: () => testButtonClick('Upload Document') },
    { buttonLabel: 'Register for Training', requiredPermission: 'register_trainings', onClick: () => testButtonClick('Register for Training') },
    { buttonLabel: 'View Announcements', requiredPermission: 'view_announcements', onClick: () => testButtonClick('View Announcements') },
  ];

  const staffButtons: ButtonTestProps[] = [
    ...reservistButtons,
    { buttonLabel: 'View Company Personnel', requiredPermission: 'view_company_personnel', onClick: () => testButtonClick('View Company Personnel') },
    { buttonLabel: 'Edit Personnel Records', requiredPermission: 'edit_company_personnel', onClick: () => testButtonClick('Edit Personnel Records') },
    { buttonLabel: 'Verify Documents', requiredPermission: 'verify_documents', onClick: () => testButtonClick('Verify Documents') },
    { buttonLabel: 'Manage Trainings', requiredPermission: 'manage_trainings', onClick: () => testButtonClick('Manage Trainings') },
    { buttonLabel: 'Post Announcements', requiredPermission: 'post_announcements', onClick: () => testButtonClick('Post Announcements') },
  ];

  const adminButtons: ButtonTestProps[] = [
    ...staffButtons,
    { buttonLabel: 'View All Personnel', requiredPermission: 'view_all_personnel', onClick: () => testButtonClick('View All Personnel') },
    { buttonLabel: 'Delete Personnel', requiredPermission: 'delete_personnel', onClick: () => testButtonClick('Delete Personnel') },
    { buttonLabel: 'Manage Staff Accounts', requiredPermission: 'manage_staff_accounts', onClick: () => testButtonClick('Manage Staff Accounts') },
    { buttonLabel: 'View System Logs', requiredPermission: 'view_system_logs', onClick: () => testButtonClick('View System Logs') },
  ];

  const directorButtons: ButtonTestProps[] = [
    ...adminButtons,
    { buttonLabel: 'Manage Admin Accounts', requiredPermission: 'manage_admin_accounts', onClick: () => testButtonClick('Manage Admin Accounts') },
    { buttonLabel: 'View Analytics', requiredPermission: 'view_analytics', onClick: () => testButtonClick('View Analytics') },
    { buttonLabel: 'Export Reports', requiredPermission: 'export_reports', onClick: () => testButtonClick('Export Reports') },
    { buttonLabel: 'System Configuration', requiredPermission: 'system_configuration', onClick: () => testButtonClick('System Configuration') },
  ];

  // Function to test button click
  const testButtonClick = (buttonLabel: string) => {
    setTestResults(prev => ({
      ...prev,
      [buttonLabel]: true
    }));
    
    // Reset after 2 seconds
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [buttonLabel]: false
      }));
    }, 2000);
  };

  // Get buttons for the current role
  const getButtonsForRole = (role: UserRole | null) => {
    switch (role) {
      case 'DIRECTOR':
        return directorButtons;
      case 'ADMIN':
        return adminButtons;
      case 'STAFF':
        return staffButtons;
      case 'RESERVIST':
        return reservistButtons;
      default:
        return [];
    }
  };

  // Check if button should be enabled
  const isButtonEnabled = (button: ButtonTestProps) => {
    if (button.disabled) return false;
    if (!button.requiredPermission) return true;
    
    const hasPermission = hasSpecificPermission(button.requiredPermission);
    
    // Don't update state during render
    return hasPermission;
  };

  // Update permission debug info when activeRole changes
  useEffect(() => {
    if (!activeRole) return;
    
    const updatedPermissionDebug: {[key: string]: boolean} = {};
    
    // Get all permissions for the current role
    const permissions = getCurrentRolePermissions();
    
    // Check each permission
    permissions.forEach(permission => {
      updatedPermissionDebug[permission] = hasSpecificPermission(permission);
    });
    
    setPermissionDebug(updatedPermissionDebug);
  }, [activeRole, hasSpecificPermission]);

  // Update the role selection function to use simulateRole
  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    simulateRole(role);
    
    // Clear test results when changing roles
    setTestResults({});
  };

  // Get all permissions for the current role
  const getCurrentRolePermissions = () => {
    if (!activeRole) return [];
    
    const rolePermissions: Record<UserRole, string[]> = {
      'RESERVIST': [
        'view_own_profile',
        'edit_own_profile',
        'view_own_documents',
        'upload_own_documents',
        'view_trainings',
        'register_trainings',
        'view_announcements'
      ],
      'STAFF': [
        'view_own_profile',
        'edit_own_profile',
        'view_own_documents',
        'upload_own_documents',
        'view_trainings',
        'register_trainings',
        'view_announcements',
        'view_company_personnel',
        'edit_company_personnel',
        'verify_documents',
        'manage_trainings',
        'post_announcements'
      ],
      'ADMIN': [
        'view_own_profile',
        'edit_own_profile',
        'view_own_documents',
        'upload_own_documents',
        'view_trainings',
        'register_trainings',
        'view_announcements',
        'view_all_personnel',
        'edit_all_personnel',
        'delete_personnel',
        'verify_documents',
        'manage_trainings',
        'post_announcements',
        'manage_staff_accounts',
        'view_system_logs'
      ],
      'DIRECTOR': [
        'view_own_profile',
        'edit_own_profile',
        'view_own_documents',
        'upload_own_documents',
        'view_trainings',
        'register_trainings',
        'view_announcements',
        'view_all_personnel',
        'edit_all_personnel',
        'delete_personnel',
        'verify_documents',
        'manage_trainings',
        'post_announcements',
        'manage_staff_accounts',
        'manage_admin_accounts',
        'view_system_logs',
        'view_analytics',
        'export_reports',
        'system_configuration'
      ]
    };
    
    return rolePermissions[activeRole] || [];
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Button Tester</h2>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
            </Button>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Test buttons for different roles to ensure they are working correctly.
            Current user role: <span className="font-semibold">{user?.role || 'Not logged in'}</span>
            {activeRole !== user?.role && activeRole && (
              <span className="ml-2 text-indigo-600">
                (Simulating: {activeRole})
              </span>
            )}
          </p>
          
          <div className="mb-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">Test as Role:</h3>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                variant={activeRole === 'RESERVIST' ? 'primary' : 'secondary'}
                onClick={() => handleRoleChange('RESERVIST')}
              >
                Reservist
              </Button>
              <Button 
                size="sm" 
                variant={activeRole === 'STAFF' ? 'primary' : 'secondary'}
                onClick={() => handleRoleChange('STAFF')}
              >
                Staff
              </Button>
              <Button 
                size="sm" 
                variant={activeRole === 'ADMIN' ? 'primary' : 'secondary'}
                onClick={() => handleRoleChange('ADMIN')}
              >
                Admin
              </Button>
              <Button 
                size="sm" 
                variant={activeRole === 'DIRECTOR' ? 'primary' : 'secondary'}
                onClick={() => handleRoleChange('DIRECTOR')}
              >
                Director
              </Button>
            </div>
          </div>
          
          {showDebugInfo && (
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Information:</h3>
              <div className="text-xs">
                <p className="mb-1"><strong>Active Role:</strong> {activeRole}</p>
                <p className="mb-1"><strong>User Role:</strong> {user?.role}</p>
                <p className="mb-2"><strong>Available Permissions:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  {getCurrentRolePermissions().map(permission => (
                    <li key={permission} className="flex items-center justify-between">
                      <span>{permission}</span>
                      <span className={`ml-2 ${hasSpecificPermission(permission) ? 'text-green-600' : 'text-red-600'}`}>
                        {hasSpecificPermission(permission) ? '✓' : '✗'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Buttons for {activeRole || 'No'} Role:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getButtonsForRole(activeRole).map((button, index) => {
                const enabled = isButtonEnabled(button);
                return (
                  <div key={index} className="relative">
                    <Button
                      variant={button.variant || (enabled ? 'primary' : 'secondary')}
                      onClick={button.onClick}
                      disabled={!enabled}
                      className="w-full"
                      size="sm"
                    >
                      {button.buttonLabel}
                    </Button>
                    {testResults[button.buttonLabel] && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        ✓
                      </span>
                    )}
                    {!enabled && button.requiredPermission && (
                      <p className="text-xs text-red-500 mt-1">
                        Missing permission: {button.requiredPermission}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 