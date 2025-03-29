"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { 
  DocumentTextIcon, 
  DocumentPlusIcon, 
  DocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import ConfirmationDialog from '@/components/ConfirmationDialog';

type DocumentStatus = 'verified' | 'pending' | 'rejected';
type SecurityClassification = 'Unclassified' | 'Confidential' | 'Secret' | 'Top Secret';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: DocumentStatus;
  verifiedBy?: string;
  verifiedDate?: string;
  comments?: string;
  fileUrl: string;
  securityClassification: SecurityClassification;
  expiryDate?: string;
}

export default function DocumentsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [securityClassification, setSecurityClassification] = useState<SecurityClassification>('Unclassified');
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }

    // Mock data for documents
    if (user) {
      const mockDocuments: Document[] = [
        {
          id: '1',
          name: 'Personal Information Form.pdf',
          type: 'Personal Information',
          uploadDate: '2024-01-15',
          status: 'verified',
          verifiedBy: 'Jane Smith',
          verifiedDate: '2024-01-20',
          fileUrl: '#',
          securityClassification: 'Unclassified',
          expiryDate: '2024-12-31'
        },
        {
          id: '2',
          name: 'Medical Certificate.pdf',
          type: 'Medical Certificate',
          uploadDate: '2024-02-10',
          status: 'pending',
          fileUrl: '#',
          securityClassification: 'Unclassified',
          expiryDate: '2024-12-31'
        },
        {
          id: '3',
          name: 'Training Completion.pdf',
          type: 'Training Certificate',
          uploadDate: '2024-02-25',
          status: 'rejected',
          comments: 'Document is not legible. Please upload a clearer copy.',
          fileUrl: '#',
          securityClassification: 'Unclassified',
          expiryDate: '2024-12-31'
        },
        {
          id: '4',
          name: 'ID Card.jpg',
          type: 'Identification',
          uploadDate: '2024-03-01',
          status: 'verified',
          verifiedBy: 'John Admin',
          verifiedDate: '2024-03-05',
          fileUrl: '#',
          securityClassification: 'Unclassified',
          expiryDate: '2024-12-31'
        }
      ];
      setDocuments(mockDocuments);
    }
  }, [isLoading, isAuthenticated, router, user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !documentType) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    
    // Simulate upload completion
    setTimeout(() => {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        type: documentType,
        uploadDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        fileUrl: URL.createObjectURL(selectedFile),
        securityClassification,
        expiryDate: expiryDate || undefined
      };
      
      setDocuments([newDocument, ...documents]);
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      setDocumentType('');
      setSecurityClassification('Unclassified');
      setExpiryDate('');
      setShowUploadModal(false);
    }, 3000);
  };

  const handleDeleteDocumentClick = (id: string) => {
    setDocumentToDelete(id);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteDocument = () => {
    if (!documentToDelete) return;
    
    setDocuments(documents.filter(doc => doc.id !== documentToDelete));
    setDocumentToDelete(null);
  };

  const filteredDocuments = activeTab === 'all' 
    ? documents 
    : documents.filter(doc => doc.status === activeTab);

  const documentTypes = [
    'Personal Information',
    'Medical Certificate',
    'Training Certificate',
    'Identification',
    'Educational Background',
    'Military Training',
    'Other'
  ];

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-4 w-4 mr-1" />
            Pending
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            Rejected
          </span>
        );
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-full p-3">
                <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Documents</h2>
                <p className="text-sm text-gray-500">
                  Upload, manage, and track your document verification status
                </p>
              </div>
            </div>
            <Button 
              variant="primary" 
              onClick={() => setShowUploadModal(true)}
              className="flex items-center"
            >
              <DocumentPlusIcon className="h-5 w-5 mr-2" />
              Upload Document
            </Button>
          </div>
        </div>

        <Card>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === 'all'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('all')}
              >
                All Documents
              </button>
              <button
                className={`${
                  activeTab === 'verified'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('verified')}
              >
                Verified
              </button>
              <button
                className={`${
                  activeTab === 'pending'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </button>
              <button
                className={`${
                  activeTab === 'rejected'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
                onClick={() => setActiveTab('rejected')}
              >
                Rejected
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === 'all' 
                    ? 'Get started by uploading a document.' 
                    : `You don't have any ${activeTab} documents.`}
                </p>
                <div className="mt-6">
                  <Button 
                    variant="primary" 
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center mx-auto"
                  >
                    <DocumentPlusIcon className="h-5 w-5 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classification
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.map((document) => (
                      <tr key={document.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div className="text-sm font-medium text-gray-900">{document.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{document.type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              document.securityClassification === 'Unclassified' ? 'bg-gray-100 text-gray-800' :
                              document.securityClassification === 'Confidential' ? 'bg-blue-100 text-blue-800' :
                              document.securityClassification === 'Secret' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {document.securityClassification}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(document.status)}
                          {document.status === 'rejected' && document.comments && (
                            <div className="mt-1 text-xs text-red-600">{document.comments}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{document.expiryDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <DocumentMagnifyingGlassIcon className="h-5 w-5" />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteDocumentClick(document.id)}
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <DocumentPlusIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Document</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="document-type" className="block text-sm font-medium text-gray-700">
                          Document Type
                        </label>
                        <select
                          id="document-type"
                          name="document-type"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={documentType}
                          onChange={(e) => setDocumentType(e.target.value)}
                        >
                          <option value="">Select Document Type</option>
                          {documentTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="securityClassification" className="block text-sm font-medium text-gray-700">
                          Security Classification
                        </label>
                        <select
                          id="securityClassification"
                          name="securityClassification"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={securityClassification}
                          onChange={(e) => setSecurityClassification(e.target.value as SecurityClassification)}
                        >
                          <option value="Unclassified">Unclassified</option>
                          <option value="Confidential">Confidential</option>
                          <option value="Secret">Secret</option>
                          <option value="Top Secret">Top Secret</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                          Expiry Date (if applicable)
                        </label>
                        <input
                          type="date"
                          id="expiryDate"
                          name="expiryDate"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">File</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                              >
                                <span>Upload a file</span>
                                <input
                                  id="file-upload"
                                  name="file-upload"
                                  type="file"
                                  className="sr-only"
                                  onChange={handleFileChange}
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PDF, PNG, JPG, GIF up to 10MB</p>
                          </div>
                        </div>
                        {selectedFile && (
                          <p className="mt-2 text-sm text-gray-500">
                            Selected file: {selectedFile.name}
                          </p>
                        )}
                      </div>
                      {isUploading && (
                        <div>
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div>
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                  {uploadProgress}%
                                </span>
                              </div>
                            </div>
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                              <div
                                style={{ width: `${uploadProgress}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!selectedFile || !documentType || isUploading}
                  isLoading={isUploading}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Upload
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowUploadModal(false)}
                  disabled={isUploading}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteDocument}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
} 