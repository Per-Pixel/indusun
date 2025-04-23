import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar, Footer } from "@/modules";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { BottomNavigation } from '@/components/shared/BottomNavigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Indusun",
  description: "Realtor site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <BottomNavigation />
          <div className="pb-20" />
        </AuthProvider>
      </body>
    </html>
  );
}
