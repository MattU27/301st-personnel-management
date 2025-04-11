import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '@/types/auth';

// Define military ranks
export enum MilitaryRank {
  // Enlisted Ranks
  PRIVATE = 'Private',
  PFC = 'Private First Class',
  CORPORAL = 'Corporal',
  SERGEANT = 'Sergeant',
  
  // Officer Ranks
  SECOND_LIEUTENANT = 'Second Lieutenant',
  FIRST_LIEUTENANT = 'First Lieutenant',
  CAPTAIN = 'Captain',
  MAJOR = 'Major',
  LIEUTENANT_COLONEL = 'Lieutenant Colonel',
  COLONEL = 'Colonel',
  BRIGADIER_GENERAL = 'Brigadier General',
  MAJOR_GENERAL = 'Major General',
  LIEUTENANT_GENERAL = 'Lieutenant General',
  GENERAL = 'General',
}

// Define companies
export enum Company {
  ALPHA = 'Alpha',
  BRAVO = 'Bravo',
  CHARLIE = 'Charlie',
  HQ = 'Headquarters',
  NERRSC = 'NERRSC',
  NERRFAB = 'NERRFAB',
  NERRSC_FULL = 'NERRSC (NERR-Signal Company)',
  NERRFAB_FULL = 'NERRFAB (NERR-Field Artillery Battery)'
}

// Define the user document interface
export interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  alternativeEmail?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  rank?: MilitaryRank;
  company?: Company;
  serviceId: string;
  contactNumber?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    province?: string;
    postalCode?: string;
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    contactNumber?: string;
  };
  profileImage?: string;
  specializations?: string[];
  lastLogin?: Date;
  deactivationReason?: string;
  isArchived?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getFullName(): string;
}

// Define the User schema
const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide your first name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  alternativeEmail: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid alternative email address'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password should be at least 8 characters long'],
    select: false, // Don't return password in queries by default
  },
  serviceId: {
    type: String,
    required: [true, 'Please provide your Service ID'],
    trim: true,
  },
  role: {
    type: String,
    default: 'staff',
    enum: [
      'staff',
      'administrator',
      'admin',
      'director',
      'reservist',
      'enlisted'
    ]
  },
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.PENDING,
  },
  deactivationReason: {
    type: String,
    required: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
    index: true, // Add index for faster filtering
    description: 'Flag indicating if the user has been archived'
  },
  rank: {
    type: String,
    required: false,
  },
  company: {
    type: String,
    required: false,
    enum: [
      'Alpha', 
      'Bravo', 
      'Charlie', 
      'Headquarters', 
      'NERRSC', 
      'NERRFAB',
      'NERRSC (NERR-Signal Company)',
      'NERRFAB (NERR-Field Artillery Battery)'
    ]
  },
  contactNumber: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    contactNumber: String,
  },
  profileImage: {
    type: String,
  },
  specializations: [{
    type: String,
  }],
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Get full name method
UserSchema.methods.getFullName = function(): string {
  return `${this.firstName} ${this.lastName}`;
};

// Create and export the User model
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 