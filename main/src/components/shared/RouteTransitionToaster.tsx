'use client';

// Fires a brief loading toast on every client-side route change.
// Mounted once in the root layout, alongside <Toaster />.

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function RouteTransitionToaster() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const id = toast.loading('Loading page…', { duration: 1500 });
    const t = setTimeout(() => toast.dismiss(id), 600);
    return () => {
      clearTimeout(t);
      toast.dismiss(id);
    };
  }, [pathname]);

  return null;
}
