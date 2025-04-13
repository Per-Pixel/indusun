import React from 'react';
import { usePathname } from 'next/navigation';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper = ({ children }: PageWrapperProps) => {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/sign-up';

  return (
    <div className={`min-h-screen ${isAuthPage ? 'pt-0 md:pt-0' : 'pt-16'}`}>
      {children}
    </div>
  );
};

export default PageWrapper;