import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SkipToContent from "@/components/SkipToContent";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import SessionTimeoutWarning from '@/components/SessionTimeoutWarning';
import AccountDeactivationNotice from '@/components/AccountDeactivationNotice';
import StateResetWrapper from '@/components/StateResetWrapper';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Armed Forces of the Philippines Personnel Management System",
  description: "Personnel management system for the Armed Forces of the Philippines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <StateResetWrapper>
            <SkipToContent />
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-grow bg-gray-50 min-h-screen">
              {children}
            </main>
            <Footer />
            <SessionTimeoutWarning />
            <AccountDeactivationNotice />
            <Toaster position="top-right" />
          </StateResetWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
