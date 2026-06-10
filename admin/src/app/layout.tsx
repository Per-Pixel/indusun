import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import RouteTransitionToaster from '@/components/common/RouteTransitionToaster';

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AdminAuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
              success: { iconTheme: { primary: '#C9A84C', secondary: '#fff' } },
            }}
          />
          <RouteTransitionToaster />
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  );
}
