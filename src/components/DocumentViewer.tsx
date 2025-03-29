'use client';

import { useState } from 'react';
import { Document as DocumentType, DocumentVersion } from '@/types/personnel';
import { 
  DocumentTextIcon, 
  ArrowDownTrayIcon, 
  ClockIcon, 
  UserIcon, 
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import Button from './Button';
import DocumentVersionHistory from './DocumentVersionHistory';
import ConfirmationDialog from './ConfirmationDialog';

interface DocumentViewerProps {
  document: DocumentType;
  onClose: () => void;
  onUploadNewVersion?: (file: File, notes: string) => Promise<void>;
}

export default function DocumentViewer({ 
  document, 
  onClose,
  onUploadNewVersion
}: DocumentViewerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [versionNotes, setVersionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadNewVersion = async () => {
    if (!selectedFile || !onUploadNewVersion) return;
    
    setIsUploading(true);
    try {
      await onUploadNewVersion(selectedFile, versionNotes);
      setSelectedFile(null);
      setVersionNotes('');
      setShowUploadForm(false);
    } catch (error) {
      console.error('Failed to upload new version:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    setSelectedVersionId(versionId);
    setShowConfirmation(true);
  };

  const handleRestoreVersion = async () => {
    if (!selectedVersionId) return;
    
    // In a real app, this would call an API to restore the version
    console.log(`Restoring version ${selectedVersionId}`);
    
    // Reset state
    setSelectedVersionId(null);
    setShowConfirmation(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getSecurityClassColor = (classification?: string) => {
    switch (classification) {
      case 'Unclassified':
        return 'bg-gray-100 text-gray-800';
      case 'Confidential':
        return 'bg-blue-100 text-blue-800';
      case 'Secret':
        return 'bg-yellow-100 text-yellow-800';
      case 'Top Secret':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mock versions for demo purposes
  const mockVersions: DocumentVersion[] = document.versions || [
    {
      versionId: `${document.id}-1`,
      uploadDate: document.uploadDate,
      uploadedBy: 'Original Uploader',
      url: document.url
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto overflow-hidden">
      <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <DocumentTextIcon className="h-6 w-6 text-indigo-600 mr-2" />
          {document.title}
        </h2>
        <button
          type="button"
          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          onClick={onClose}
        >
          <span className="sr-only">Close</span>
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Document Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium text-gray-900">{document.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Upload Date</p>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                  {formatDate(document.uploadDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    document.status === 'verified' ? 'bg-green-100 text-green-800' :
                    document.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                  </span>
                </p>
              </div>
              {document.verifiedBy && (
                <div>
                  <p className="text-xs text-gray-500">Verified By</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center">
                    <UserIcon className="h-4 w-4 text-gray-400 mr-1" />
                    {document.verifiedBy}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Security Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Security Classification</p>
                <p className="text-sm font-medium text-gray-900">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    getSecurityClassColor(document.securityClassification)
                  }`}>
                    <ShieldCheckIcon className="h-3 w-3 mr-1" />
                    {document.securityClassification || 'Unclassified'}
                  </span>
                </p>
              </div>
              {document.expiryDate && (
                <div>
                  <p className="text-xs text-gray-500">Expiry Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(document.expiryDate)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500">Version</p>
                <p className="text-sm font-medium text-gray-900">
                  {document.currentVersion || 1} of {mockVersions.length}
                </p>
              </div>
              {document.notes && (
                <div>
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="text-sm text-gray-900">{document.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">Document Preview</h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                className="flex items-center"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                {showVersionHistory ? 'Hide Version History' : 'Show Version History'}
              </Button>
              {onUploadNewVersion && (
                <Button
                  size="sm"
                  variant="primary"
                  className="flex items-center"
                  onClick={() => setShowUploadForm(!showUploadForm)}
                >
                  <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                  Upload New Version
                </Button>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center h-64">
            {document.url ? (
              document.url.endsWith('.pdf') ? (
                <iframe 
                  src={document.url} 
                  className="w-full h-full" 
                  title={document.title}
                />
              ) : (
                <div className="text-center">
                  <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-4">Preview not available</p>
                  <a
                    href={document.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Download Document
                  </a>
                </div>
              )
            ) : (
              <div className="text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No document available</p>
              </div>
            )}
          </div>

          {showVersionHistory && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Version History</h3>
              <DocumentVersionHistory 
                versions={mockVersions}
                currentVersionId={`${document.id}-${document.currentVersion || 1}`}
                onVersionSelect={handleVersionSelect}
              />
            </div>
          )}

          {showUploadForm && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Upload New Version</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                    File*
                  </label>
                  <input
                    type="file"
                    id="file"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={handleFileChange}
                  />
                </div>
                <div>
                  <label htmlFor="versionNotes" className="block text-sm font-medium text-gray-700 mb-1">
                    Version Notes
                  </label>
                  <textarea
                    id="versionNotes"
                    rows={3}
                    className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    placeholder="Describe what changed in this version"
                    value={versionNotes}
                    onChange={(e) => setVersionNotes(e.target.value)}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowUploadForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleUploadNewVersion}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleRestoreVersion}
        title="Restore Previous Version"
        message="Are you sure you want to restore this version? This will replace the current version of the document."
        confirmText="Restore"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
} 