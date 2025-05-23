import { UserRole } from '@/types/auth';

export interface NavItem {
  label: string;
  href: string;
  roles: UserRole[];
  children?: NavItem[];
}

export const navigationConfig: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    roles: [UserRole.DIRECTOR, UserRole.ADMIN, UserRole.STAFF], // All roles can access dashboard
  },
  {
    label: 'Documents',
    href: '/documents',
    roles: [UserRole.STAFF, UserRole.ADMIN], // Staff can validate, Admin can manage
  },
  {
    label: 'Policy Control',
    href: '/policy',
    roles: [UserRole.ADMIN], // Admin can control policies
  },
  {
    label: 'Policy',
    href: '/policies',
    roles: [UserRole.STAFF], // Staff can view and upload policies
  },
  {
    label: 'Trainings',
    href: '/trainings?tab=upcoming',
    roles: [UserRole.STAFF, UserRole.ADMIN, UserRole.DIRECTOR], // Staff can manage trainings, Admin and Director can oversee
  },
  {
    label: 'Personnel',
    href: '/personnel',
    roles: [UserRole.STAFF, UserRole.ADMIN], // Staff for their company, Admin for all
  },
  {
    label: 'Companies',
    href: '/companies',
    roles: [UserRole.STAFF, UserRole.ADMIN], // Both Staff and Admin can manage companies
  },
  {
    label: 'Announcements',
    href: '/announcements',
    roles: [UserRole.STAFF], // Only Staff can access announcements
  },
  {
    label: 'Analytics',
    href: '/analytics',
    roles: [UserRole.DIRECTOR], // Only Director can access detailed analytics
    children: [
      {
        label: 'System-wide Analytics',
        href: '/analytics/system',
        roles: [UserRole.DIRECTOR],
      },
      {
        label: 'Prescriptive Analytics',
        href: '/analytics/prescriptive',
        roles: [UserRole.DIRECTOR],
      }
    ]
  },
  {
    label: 'Manage Accounts',
    href: '/admin/accounts',
    roles: [UserRole.DIRECTOR], // Only Director can access account management
  }
]; 