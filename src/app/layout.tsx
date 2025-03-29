import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import SessionTimeoutWarning from '@/components/SessionTimeoutWarning';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AFP Personnel Management System",
  description: "A comprehensive personnel management system for military reservists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow bg-gray-50">
              {children}
            </main>
            <Footer />
            <SessionTimeoutWarning />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
