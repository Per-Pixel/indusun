'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { homePath, pathAllowed } from '@/lib/staffNav';

export default function AccessGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAdminAuth();
  const allowed = !user || pathAllowed(user, pathname);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!pathAllowed(user, pathname)) {
      router.replace(homePath(user));
    }
  }, [isLoading, user, pathname, router]);

  if (!isLoading && user && !allowed) {
    return null;
  }

  return <>{children}</>;
}
