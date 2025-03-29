export type UserRole = 'RESERVIST' | 'STAFF' | 'ADMIN' | 'DIRECTOR';

export type CompanyType = 'Alpha' | 'Bravo' | 'Charlie' | 'HQ' | 'Signal' | 'FAB';

export type PersonnelStatus = 'Ready' | 'Standby' | 'Retired';

export type SecurityClassification = 'Unclassified' | 'Confidential' | 'Secret' | 'Top Secret';

export interface Personnel {
  id: number;
  name: string;
  rank: string;
  company: CompanyType;
  status: PersonnelStatus;
  lastUpdated: string;
  email: string;
  phoneNumber?: string;
  dateJoined: string;
  trainings: Training[];
  documents: Document[];
  role: UserRole;
}

export interface Training {
  id: number;
  title: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Missed';
  verifiedBy?: string;
}

export interface DocumentVersion {
  versionId: string;
  uploadDate: string;
  uploadedBy: string;
  notes?: string;
  url: string;
}

export interface Document {
  id: number;
  title: string;
  type: string;
  uploadDate: string;
  status: string;
  verifiedBy?: string;
  url: string;
  securityClassification?: SecurityClassification;
  expiryDate?: string;
  notes?: string;
  versions?: DocumentVersion[];
  currentVersion: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PersonnelFilters {
  search?: string;
  company?: CompanyType | 'All';
  status?: PersonnelStatus | 'All';
  page: number;
  pageSize: number;
} 