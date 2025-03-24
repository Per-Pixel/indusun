'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';

export default function AuthTestPage() {
  const searchParams = useSearchParams();
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [cookies, setCookies] = useState<string>('');

  useEffect(() => {
    // Check for error parameter in URL
    const error = searchParams.get('error');
    if (error) {
      setAuthStatus(`Authentication Error: ${error}`);
    }

    // Check for cookies (to see if we're authenticated)
    setCookies(document.cookie);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
      
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Social Login Test</h2>
        <SocialLoginButtons />
        
        {authStatus && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
            {authStatus}
          </div>
        )}
        
        <div className="mt-6">
          <h3 className="font-medium mb-2">Debug Information:</h3>
          <div className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
            <p><strong>Cookies:</strong> {cookies || 'No cookies found'}</p>
            <p><strong>URL Parameters:</strong> {Array.from(searchParams.entries()).map(([key, value]) => `${key}=${value}`).join(', ') || 'None'}</p>
          </div>
        </div>
        
        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Note:</strong> After successful authentication, you should be redirected to the dashboard with cookies set.</p>
        </div>
      </div>
    </div>
  );
}
