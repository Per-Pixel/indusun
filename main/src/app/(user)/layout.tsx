import React from 'react';
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
    </>
  );
}
