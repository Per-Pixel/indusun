import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import RouteTransitionToaster from '@/components/common/RouteTransitionToaster';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Indusun CRM | Real Estate Management Platform",
  description: "Enterprise-grade real estate CRM and admin panel for Indusun — Lead management, bookings, site visits, analytics and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AdminAuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'var(--font-geist-sans), sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#2563EB', secondary: '#fff' } },
            }}
          />
          <RouteTransitionToaster />
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  );
}
