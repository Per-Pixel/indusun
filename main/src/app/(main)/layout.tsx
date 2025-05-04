'use client';

import React from 'react';
import { Navbar, Footer } from "@/modules";
import { SearchTransition } from './properties/components/SearchTransition';

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SearchTransition />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
