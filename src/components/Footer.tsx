'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <h3 className="text-sm font-semibold mb-2">Quick Links</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
              <Link href="/documents" className="text-gray-300 hover:text-white">Documents</Link>
              <Link href="/trainings" className="text-gray-300 hover:text-white">Trainings</Link>
              <Link href="/personnel" className="text-gray-300 hover:text-white">Personnel</Link>
            </div>
          </div>
          <div className="flex-1 min-w-[200px] max-w-xs">
            <h3 className="text-sm font-semibold mb-2">Contact</h3>
            <div className="text-xs text-gray-300 space-y-1">
              <p>Email: support@afppms.mil</p>
              <p>Phone: +63 (2) 8911-6001</p>
              <p>Camp General E. Aguinaldo, QC</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-center text-gray-400">&copy; {new Date().getFullYear()} AFP Personnel Management System</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 