'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'warning'
}: ConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [canShow, setCanShow] = useState(false);
  
  // Prevent showing dialog on first render
  useEffect(() => {
    setHasMounted(true);
    
    // Add a minimum delay before the dialog can be shown
    // This helps prevent accidental open on page load/navigation
    const timer = setTimeout(() => {
      setCanShow(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Log when dialog is attempted to be shown
  useEffect(() => {
    if (isOpen) {
      console.log('ConfirmationDialog: Open requested, canShow:', canShow);
    }
  }, [isOpen, canShow]);
  
  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Skip rendering on first mount or during safety period to prevent accidental dialog display
  if (!hasMounted || !canShow) {
    return null;
  }
  
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${
                      type === 'danger' ? 'bg-red-100' : type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                    } sm:mx-0 sm:h-10 sm:w-10`}>
                      {type === 'danger' ? (
                        <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                      ) : (
                        <ExclamationTriangleIcon className={`h-6 w-6 ${
                          type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                        }`} aria-hidden="true" />
                      )}
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                        {title}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          {message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className={`inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto ${
                      type === 'danger' 
                        ? 'bg-red-600 hover:bg-red-500' 
                        : type === 'warning' 
                          ? 'bg-yellow-600 hover:bg-yellow-500' 
                          : 'bg-blue-600 hover:bg-blue-500'
                    }`}
                    onClick={handleConfirm}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {type === 'danger' ? 'Deleting...' : 'Processing...'}
                      </span>
                    ) : (
                      confirmText
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={onClose}
                    disabled={isDeleting}
                  >
                    {cancelText}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 