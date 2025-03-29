'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Personnel, Training, Document } from '@/types/personnel';
import { z } from 'zod';

interface PersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: Personnel | null;
  mode: 'view' | 'edit';
  onSave?: (data: Partial<Personnel>) => Promise<void>;
}

// Add validation schema
const personnelSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  rank: z.string().min(1, "Rank is required"),
  company: z.string().min(1, "Company is required"),
  status: z.string().min(1, "Status is required"),
  email: z.string().email("Invalid email address"),
  dateJoined: z.string().refine((val: string) => !isNaN(Date.parse(val)), {
    message: "Invalid date format"
  }),
  role: z.string().min(1, "Role is required"),
  // Optional fields can be added with .optional()
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional()
});

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
      setFormData(personnel);
    } else {
      setFormData({
        name: '',
        rank: '',
        company: 'Alpha',
        status: 'Ready',
        email: '',
        dateJoined: new Date().toISOString().split('T')[0],
        role: 'RESERVIST',
        trainings: [],
        documents: []
      });
    }
    setErrors({});
  }, [personnel, isOpen]);

  const validateField = (name: string, value: any) => {
    try {
      personnelSchema.shape[name as keyof typeof personnelSchema.shape].parse(value);
      setErrors(prev => ({ ...prev, [name]: '' }));
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const message = error.errors[0]?.message || `Invalid ${name}`;
        setErrors(prev => ({ ...prev, [name]: message }));
        return false;
      }
      return true;
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

  if (!personnel) return null;

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
                      {mode === 'view' ? 'Personnel Details' : 'Edit Personnel'}
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
                        
                        {/* Apply similar validation to other fields */}
                        
                        {/* ... existing fields ... */}
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