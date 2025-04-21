"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeftIcon, 
  DocumentTextIcon, 
  CloudArrowUpIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { PolicyCategory, PolicyStatus } from '@/app/policies/page';

export default function UploadPolicyPage() {
  const { user, isAuthenticated, getToken } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [policyData, setPolicyData] = useState({
    title: '',
    category: PolicyCategory.GENERAL,
    description: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    expirationDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPolicyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setLoading(true);

    try {
      // Here we would upload the file and policy data to the server
      // This is a placeholder for demonstration
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Policy uploaded successfully');
      
      // In a real implementation, this would navigate to a policy detail page
      // or back to the policies list
      router.push('/policies');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload policy');
      console.error('Error uploading policy:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="secondary" 
              onClick={() => router.push('/dashboard')}
              className="mr-4"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Upload Policy</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left side - File upload */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Policy Document</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Policy File*
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md h-60">
                    <div className="space-y-1 text-center flex flex-col items-center justify-center">
                      {file ? (
                        <>
                          <DocumentTextIcon className="mx-auto h-12 w-12 text-indigo-600" />
                          <p className="text-sm text-gray-600 break-all">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="text-xs text-red-600 hover:text-red-800 mt-2"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="text-sm text-gray-600">
                            <span className="inline-block">
                              Drag and drop your file here, or
                            </span>
                          </p>
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                          >
                            <span>Browse files</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="text-xs text-gray-500">
                            PDF, DOC, DOCX up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right side - Policy details */}
          <div className="lg:col-span-3">
            <Card>
              <div className="p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Policy Details</h2>
                
                <div className="grid grid-cols-1 gap-y-4 gap-x-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Policy Title*
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={policyData.title}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Category*
                    </label>
                    <select
                      name="category"
                      id="category"
                      value={policyData.category}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {Object.values(PolicyCategory).map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="effectiveDate" className="block text-sm font-medium text-gray-700">
                      Effective Date*
                    </label>
                    <input
                      type="date"
                      name="effectiveDate"
                      id="effectiveDate"
                      value={policyData.effectiveDate}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="date"
                      name="expirationDate"
                      id="expirationDate"
                      value={policyData.expirationDate}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description*
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      rows={3}
                      value={policyData.description}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom action buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !file}
            className="flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <PaperClipIcon className="h-5 w-5 mr-2" />
                Upload Policy
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
} 