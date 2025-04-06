import mongoose, { Document, Schema } from 'mongoose';

// Define personnel status
export enum PersonnelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  RETIRED = 'retired',
  DEPLOYED = 'deployed'
}

// Define user roles
export enum UserRole {
  STAFF = 'staff',           // Company-level access
  ADMIN = 'administrator',   // Administrator access
  ADMINISTRATOR = 'administrator',  // Same as ADMIN, added for compatibility
  DIRECTOR = 'director',     // Super admin with analytics
  RESERVIST = 'reservist',   // Reservist access
  ENLISTED = 'enlisted'      // Enlisted personnel access
}

// Define the Personnel interface
export interface IPersonnel extends Document {
  name: string;
  rank: string;
  serviceNumber: string;
  company?: mongoose.Types.ObjectId;
  status: PersonnelStatus;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  dateJoined?: Date;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
  documents?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Define the Personnel schema
const PersonnelSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    rank: {
      type: String,
      required: [true, 'Rank is required'],
      trim: true,
    },
    serviceNumber: {
      type: String,
      required: [true, 'Service number is required'],
      unique: true,
      trim: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
    },
    status: {
      type: String,
      enum: Object.values(PersonnelStatus),
      default: PersonnelStatus.PENDING,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STAFF,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    dateJoined: {
      type: Date,
      default: Date.now,
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
    },
    documents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient queries
PersonnelSchema.index({ name: 1 });
PersonnelSchema.index({ serviceNumber: 1 }, { unique: true });
PersonnelSchema.index({ company: 1 });
PersonnelSchema.index({ email: 1 }, { unique: true });
PersonnelSchema.index({ status: 1 });
PersonnelSchema.index({ role: 1 });

// Create and export the Personnel model
const Personnel = mongoose.models.Personnel || mongoose.model<IPersonnel>('Personnel', PersonnelSchema);

export default Personnel; 