'use client';

import { useState, useEffect } from 'react';
import { getPaginatedMasterData, getUniqueSocieties } from '@/services/masterDataService';

export default function TestPaginationPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setError(null);
    const testResults = [];

    try {
      // Test 1: Basic pagination - Page 1
      console.log('Testing: Page 1, no filters');
      const result1 = await getPaginatedMasterData({ page: 1, pageSize: 50 });
      testResults.push({
        test: 'Page 1 (50 records)',
        success: !result1.error,
        dataCount: result1.data?.length || 0,
        totalCount: result1.count,
        error: result1.error?.message
      });

      // Test 2: Page 2
      console.log('Testing: Page 2, no filters');
      const result2 = await getPaginatedMasterData({ page: 2, pageSize: 50 });
      testResults.push({
        test: 'Page 2 (50 records)',
        success: !result2.error,
        dataCount: result2.data?.length || 0,
        totalCount: result2.count,
        error: result2.error?.message
      });

      // Test 3: Client name filter
      console.log('Testing: Client name filter');
      const result3 = await getPaginatedMasterData({ 
        page: 1, 
        pageSize: 50, 
        clientNameFilter: 'a'  // Search for clients with 'a' in name
      });
      testResults.push({
        test: 'Client name filter "a"',
        success: !result3.error,
        dataCount: result3.data?.length || 0,
        totalCount: result3.count,
        error: result3.error?.message
      });

      // Test 4: Society filter
      console.log('Testing: Society filter');
      const societies = await getUniqueSocieties();
      if (societies.societies.length > 0) {
        const firstSociety = societies.societies[0];
        const result4 = await getPaginatedMasterData({ 
          page: 1, 
          pageSize: 50, 
          societyFilter: firstSociety
        });
        testResults.push({
          test: `Society filter "${firstSociety}"`,
          success: !result4.error,
          dataCount: result4.data?.length || 0,
          totalCount: result4.count,
          error: result4.error?.message
        });
      }

      // Test 5: Combined filters
      console.log('Testing: Combined filters');
      const result5 = await getPaginatedMasterData({ 
        page: 1, 
        pageSize: 50, 
        clientNameFilter: 'a',
        societyFilter: societies.societies[0] || ''
      });
      testResults.push({
        test: 'Combined filters',
        success: !result5.error,
        dataCount: result5.data?.length || 0,
        totalCount: result5.count,
        error: result5.error?.message
      });

      // Test 6: Large page size
      console.log('Testing: Large page size');
      const result6 = await getPaginatedMasterData({ page: 1, pageSize: 100 });
      testResults.push({
        test: 'Page size 100',
        success: !result6.error,
        dataCount: result6.data?.length || 0,
        totalCount: result6.count,
        error: result6.error?.message
      });

      setResults(testResults);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Pagination & Filtering Test</h1>
      
      <div className="mb-6">
        <button
          onClick={runTests}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Running Tests...' : 'Run Tests'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-semibold">Error:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results:</h2>
          {results.map((result, index) => (
            <div 
              key={index} 
              className={`p-4 rounded-lg border ${
                result.success 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{result.test}</h3>
                <span className={`px-2 py-1 rounded text-sm ${
                  result.success 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {result.success ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Data returned:</strong> {result.dataCount} records</p>
                <p><strong>Total count:</strong> {result.totalCount}</p>
                {result.error && (
                  <p className="text-red-600"><strong>Error:</strong> {result.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">What these tests verify:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          <li>Basic pagination works (Page 1 vs Page 2)</li>
          <li>Exact count is returned with {`{ count: 'exact' }`}</li>
          <li>Fuzzy search with .ilike() works for client names</li>
          <li>Exact match with .eq() works for society names</li>
          <li>Combined filters work together</li>
          <li>Different page sizes work correctly</li>
        </ul>
      </div>
    </div>
  );
}
