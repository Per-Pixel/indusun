'use client';

import { useState, useEffect } from 'react';

export default function DebugDataPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const runDebugTests = async () => {
    setLogs([]);
    setIsLoading(true);
    addLog('Starting debug tests...');

    try {
      // Test 1: Check environment variables
      addLog('Checking environment variables...');
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      addLog(`NEXT_PUBLIC_SUPABASE_URL: ${hasUrl ? '✓' : '✗'}`);
      addLog('SUPABASE_SERVICE_ROLE_KEY: (server-only — checked via API)');
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        addLog(`URL prefix: ${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...`);
      }

      // Test 2: Try to get total count
      addLog('\\n--- Testing Total Count ---');
      const countRes = await fetch('/api/master-data?page=1&pageSize=1');
      const countResult = await countRes.json();
      
      if (!countRes.ok || countResult.error) {
        addLog(`❌ Count query failed: ${countResult.error || 'Unknown error'}`);
      } else {
        addLog(`✅ Total count: ${countResult.count?.toLocaleString() || 'Unknown'}`);
        addLog(`✅ Sample data rows: ${countResult.data?.length || 0}`);
      }

      // Test 3: Test different page sizes
      addLog('\\n--- Testing Page Sizes ---');
      const pageSizes = [50, 100, 500, 1000];
      
      for (const size of pageSizes) {
        addLog(`Testing page size ${size}...`);
        const res = await fetch(`/api/master-data?page=1&pageSize=${size}`);
        const result = await res.json();
        
        if (!res.ok || result.error) {
          addLog(`❌ Page size ${size} failed: ${result.error || 'Unknown error'}`);
        } else {
          addLog(`✅ Page size ${size}: ${result.data?.length || 0} rows returned`);
        }
      }

      // Test 4: Test pagination to see if we can access beyond 1000
      addLog('\\n--- Testing Pagination Beyond 1000 ---');
      const testPages = [1, 10, 20, 50, 100];
      
      for (const page of testPages) {
        const from = (page - 1) * 50 + 1;
        const to = page * 50;
        addLog(`Testing page ${page} (rows ${from}-${to})...`);
        
        const res = await fetch(`/api/master-data?page=${page}&pageSize=50`);
        const result = await res.json();
        
        if (!res.ok || result.error) {
          addLog(`❌ Page ${page} failed: ${result.error || 'Unknown error'}`);
          break;
        } else {
          addLog(`✅ Page ${page}: ${result.data?.length || 0} rows`);
          if (result.data && result.data.length > 0) {
            const firstId = result.data[0].id;
            const lastId = result.data[result.data.length - 1].id;
            addLog(`   ID range: ${firstId} - ${lastId}`);
          }
        }
      }

      // Test 5: Test societies query
      addLog('\\n--- Testing Societies Query ---');
      const societiesRes = await fetch('/api/master-data/societies');
      const societiesResult = await societiesRes.json();
      
      if (!societiesRes.ok || societiesResult.error) {
        addLog(`❌ Societies query failed: ${societiesResult.error || 'Unknown error'}`);
      } else {
        addLog(`✅ Found ${societiesResult.societies.length} unique societies`);
        if (societiesResult.societies.length > 0) {
          addLog(`Sample societies: ${societiesResult.societies.slice(0, 5).join(', ')}...`);
        }
      }

      addLog('\\n--- Debug Complete ---');

    } catch (error) {
      addLog(`❌ Unexpected error: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Data Access Debug</h1>
        <p className="text-gray-600">
          Debug page to identify issues with service role key and row limits.
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={runDebugTests}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Running Tests...' : 'Run Debug Tests'}
        </button>
        
        <button
          onClick={() => setLogs([])}
          className="ml-4 px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Clear Logs
        </button>
      </div>

      {logs.length > 0 && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-96">
          <div className="mb-2 text-yellow-400 font-bold">Debug Output:</div>
          {logs.map((log, index) => (
            <div key={index} className="mb-1">
              {log}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Service Role Key Issues</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Check .env.local has SUPABASE_SERVICE_ROLE_KEY</li>
            <li>• Key should start with "sb_service_"</li>
            <li>• Restart dev server after adding env vars</li>
            <li>• Check browser console for errors</li>
          </ul>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-900 mb-2">Row Limit Issues</h3>
          <ul className="text-sm text-orange-800 space-y-1">
            <li>• Supabase default limit is 1000 rows</li>
            <li>• We use .range() for pagination</li>
            <li>• Service role bypasses RLS limits</li>
            <li>• Check table has proper indexes</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Fixes:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Ensure .env.local contains both keys</li>
          <li>Restart the development server (npm run dev)</li>
          <li>Check browser console and server logs</li>
          <li>Run the debug tests above</li>
        </ol>
      </div>
    </div>
  );
}
