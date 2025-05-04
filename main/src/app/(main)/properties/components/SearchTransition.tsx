'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function SearchTransition() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Check if we're on the search results page
    const isSearchPage = pathname.includes('/properties/search');
    
    // Set data attribute on body
    document.body.setAttribute('data-search-active', isSearchPage ? 'true' : 'false');
    
    // If we're on the search page, add the data attribute to the main element
    if (isSearchPage) {
      // Find the main content element
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.setAttribute('data-search-results', 'true');
      }
    }
    
    return () => {
      // Clean up when component unmounts
      if (document.body.getAttribute('data-search-active') === 'true') {
        document.body.setAttribute('data-search-active', 'false');
      }
    };
  }, [pathname]);
  
  return null; // This component doesn't render anything
}