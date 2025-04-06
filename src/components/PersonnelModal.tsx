'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Personnel, Training, Document, RankType, CompanyType } from '@/types/personnel';
import { z } from 'zod';
import { getRankDisplayName, getCompanyDisplayName } from '@/utils/formatters';

interface PersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel | null;
  mode: 'view' | 'edit';
  onSave?: (data: Partial<Personnel>) => Promise<void>;
}

// Validation schema for personnel
const personnelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  rank: z.string().min(1, 'Rank is required'),
  company: z.string().min(1, 'Company is required'),
  status: z.string().min(1, 'Status is required'),
  dateJoined: z.string().min(1, 'Date joined is required'),
  // Optional fields
  serviceNumber: z.string().optional(),
  phone: z.string().optional().nullable(),
});

// Valid ranks and companies based on the dropdown options
const VALID_RANKS: RankType[] = [
  'Private',
  'Private First Class',
  'Corporal',
  'Sergeant',
  'Second Lieutenant',
  'First Lieutenant',
  'Captain',
  'Major',
  'Lieutenant Colonel', 
  'Colonel',
  'Brigadier General'
];

const VALID_COMPANIES: CompanyType[] = [
  'Alpha',
  'Bravo',
  'Charlie',
  'Headquarters',
  'NERRSC (NERR-Signal Company)',
  'NERRFAB (NERR-Field Artillery Battery)'
];

export default function PersonnelModal({
  isOpen,
  onClose,
  personnel,
  mode,
  onSave
}: PersonnelModalProps) {
  const [formData, setFormData] = useState<Partial<Personnel>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (personnel) {
      // Convert any abbreviated ranks or company codes to their full display names
      setFormData({
        ...personnel,
        rank: getRankDisplayName(personnel.rank),
        company: getCompanyDisplayName(personnel.company as any)
      });
    } else {
      // Initialize with default values for a new personnel record
      setFormData({
        name: '',
        email: '',
        rank: '' as unknown as RankType,
        company: '' as unknown as CompanyType,
        status: '' as unknown as Personnel['status'],
        dateJoined: new Date().toISOString().split('T')[0]
      });
    }
    
    setErrors({});
    setIsSubmitting(false);
  }, [personnel, isOpen]);

  const validateField = (name: string, value: any) => {
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    // Validate the field
    try {
      if (personnelSchema.shape[name as keyof typeof personnelSchema.shape]) {
        personnelSchema.shape[name as keyof typeof personnelSchema.shape].parse(value);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [name]: error.errors[0]?.message || `Invalid ${name}` }));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Validate all fields
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    Object.entries(formData).forEach(([key, value]) => {
      if (personnelSchema.shape[key as keyof typeof personnelSchema.shape]) {
        try {
          personnelSchema.shape[key as keyof typeof personnelSchema.shape].parse(value);
        } catch (error) {
          if (error instanceof z.ZodError) {
            isValid = false;
            newErrors[key] = error.errors[0]?.message || `Invalid ${key}`;
          }
        }
      }
    });
    
    setErrors(newErrors);
    
    if (!isValid) {
      setIsSubmitting(false);
      return;
    }
    
    try {
      // Add animation before submitting
      const saveButton = document.querySelector('button[type="submit"]');
      if (saveButton) {
        saveButton.innerHTML = '<span class="flex items-center"><svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Saving...</span>';
      }
      
      if (onSave) {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save personnel:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (mode === 'view' && !personnel) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                      {mode === 'view' ? 'Personnel Details' : (personnel ? 'Edit Personnel' : 'Add New Personnel')}
                    </Dialog.Title>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name*
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className={`block w-full rounded-md border ${
                              errors.name ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                            disabled={mode === 'view'}
                            required
                          />
                          {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email*
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            className={`block w-full rounded-md border ${
                              errors.email ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                            disabled={mode === 'view'}
                            required
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-1">
                            Rank*
                          </label>
                          <select
                            id="rank"
                            name="rank"
                            value={formData.rank || ''}
                            onChange={handleChange}
                            className={`block w-full rounded-md border ${
                              errors.rank ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                            disabled={mode === 'view'}
                            required
                          >
                            <option value="">Select a rank</option>
                            {VALID_RANKS.map((rank) => (
                              <option key={rank} value={rank}>
                                {rank}
                              </option>
                            ))}
                          </select>
                          {errors.rank && (
                            <p className="mt-1 text-sm text-red-600">{errors.rank}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                            Company*
                          </label>
                          <select
                            id="company"
                            name="company"
                            value={formData.company || ''}
                            onChange={handleChange}
                            className={`block w-full rounded-md border ${
                              errors.company ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                            disabled={mode === 'view'}
                            required
                          >
                            <option value="">Select a company</option>
                            {VALID_COMPANIES.map((company) => (
                              <option key={company} value={company}>
                                {company}
                              </option>
                            ))}
                          </select>
                          {errors.company && (
                            <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status*
                          </label>
                          <select
                            id="status"
                            name="status"
                            value={formData.status || ''}
                            onChange={handleChange}
                            className={`block w-full rounded-md border ${
                              errors.status ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                            disabled={mode === 'view'}
                            required
                          >
                            <option value="">Select a status</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                            <option value="retired">Retired</option>
                            <option value="standby">Standby</option>
                            <option value="ready">Ready</option>
                          </select>
                          {errors.status && (
                            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="serviceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Service Number
                          </label>
                          <input
                            type="text"
                            id="serviceNumber"
                            name="serviceNumber"
                            value={formData.serviceNumber || ''}
                            onChange={handleChange}
                            placeholder="Leave blank to auto-generate"
                            className={`block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                            disabled={mode === 'view'}
                          />
                        </div>

                        <div>
                          <label htmlFor="dateJoined" className="block text-sm font-medium text-gray-700 mb-1">
                            Date Joined*
                          </label>
                          <input
                            type="date"
                            id="dateJoined"
                            name="dateJoined"
                            value={formData.dateJoined || ''}
                            onChange={handleChange}
                            className={`block w-full rounded-md border ${
                              errors.dateJoined ? 'border-red-300' : 'border-gray-300'
                            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2`}
                            disabled={mode === 'view'}
                            required
                          />
                          {errors.dateJoined && (
                            <p className="mt-1 text-sm text-red-600">{errors.dateJoined}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Form buttons */}
                      {mode !== 'view' && (
                        <div className="flex justify-end space-x-3 mt-6">
                          <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={onClose}
                            disabled={isSubmitting}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || Object.keys(errors).some(key => !!errors[key])}
                            className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto"
                          >
                            {isSubmitting ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 