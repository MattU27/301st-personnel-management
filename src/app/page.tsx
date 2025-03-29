'use client';

import Link from 'next/link';
import { 
  UserGroupIcon, 
  DocumentTextIcon, 
  AcademicCapIcon, 
  ShieldCheckIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '@/components/Button';

export default function Home() {
  const features = [
    {
      name: 'Personnel Management',
      description: 'Efficiently manage reservist and enlisted personnel records with role-based access control.',
      icon: UserGroupIcon,
    },
    {
      name: 'Document Validation',
      description: 'Secure document upload, verification, and management with blockchain-backed immutability.',
      icon: DocumentTextIcon,
    },
    {
      name: 'Training Tracking',
      description: 'Schedule, manage, and track training sessions and attendance for all personnel.',
      icon: AcademicCapIcon,
    },
    {
      name: 'Secure Infrastructure',
      description: 'Built with security in mind, featuring JWT authentication and role-based permissions.',
      icon: ShieldCheckIcon,
    },
    {
      name: 'Analytics Dashboard',
      description: 'Comprehensive analytics and reporting for data-driven decision making.',
      icon: ChartBarIcon,
    },
    {
      name: 'Mobile Responsive',
      description: 'Access the system on any device with a fully responsive design.',
      icon: DevicePhoneMobileIcon,
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-indigo-800">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1521336993297-77c011e0ad42?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Military personnel"
          />
          <div className="absolute inset-0 bg-indigo-800 mix-blend-multiply" aria-hidden="true" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">AFP Personnel Management System</h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            A comprehensive system for managing military reservists, document validation, and training tracking.
          </p>
          <div className="mt-10 flex space-x-4">
            <Link href="/login">
              <Button size="lg" variant="primary">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Register
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to manage personnel
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our system streamlines personnel management, document validation, and training tracking for military reservists.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => (
                <div key={feature.name} className="relative">
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="ml-16">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{feature.name}</h3>
                    <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-indigo-600">Sign up today or contact us for more information.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/register">
                <Button variant="primary" size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
