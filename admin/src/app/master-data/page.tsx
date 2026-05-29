'use client';

import { useState, useEffect } from 'react';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import DataTable from '@/components/ui/DataTable';

export default function MasterDataPage() {
  const [data, setData] = useState<MasterDataOfGurukrupa[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [societies, setSocieties] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientNameFilter, setClientNameFilter] = useState('');
  const [societyFilter, setSocietyFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const pageSize = 50;

  // Fetch societies on mount
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await fetch('/api/master-data/societies');
        if (!res.ok) throw new Error('Failed to fetch societies');
        const json = await res.json();
        setSocieties(json.societies || []);
      } catch (err) {
        console.error('Error fetching societies:', err);
      }
    };
    fetchSocieties();
  }, []);

  // Fetch data when page or filters change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          pageSize: String(pageSize),
          clientNameFilter,
          societyFilter,
        });
        const res = await fetch(`/api/master-data?${params}`);
        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || 'Failed to fetch data');
        }
        const json = await res.json();
        setData(json.data || []);
        setTotalCount(json.count || 0);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentPage, clientNameFilter, societyFilter]);

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-red-700 mb-2">Error Loading Data</h1>
          <p className="text-red-600 mb-4">{error.message}</p>
          
          <div className="bg-white rounded p-4 text-sm">
            <p className="font-semibold text-gray-700 mb-2">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
              <li>Make sure <code className="bg-gray-100 px-1 rounded">.env.local</code> has both Publishable Key AND Service Role Key</li>
              <li>Get Service Role Key from: Supabase Dashboard → Project Settings → API</li>
              <li>Check that the table &quot;Master Data Of Gurukrupa&quot; exists in Supabase</li>
              <li>Verify the table name matches exactly (case-sensitive)</li>
              <li>Restart the dev server after adding environment variables</li>
              <li>Check browser console (F12) for detailed error messages</li>
            </ul>
          </div>
          
          <div className="mt-4 flex gap-2">
            <a 
              href="/debug-data" 
              className="inline-block px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
            >
              Debug Data Access
            </a>
            <a 
              href="/supabase-test" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Test Supabase Connection
            </a>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Master Data - Gurukrupa</h1>
        <p className="text-gray-600">
          Browse and search through all master data records with server-side pagination and filtering.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600 font-medium">Total Records</p>
          <p className="text-2xl font-bold text-blue-900">{totalCount.toLocaleString()}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600 font-medium">Current Page</p>
          <p className="text-2xl font-bold text-green-900">{currentPage}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600 font-medium">Societies</p>
          <p className="text-2xl font-bold text-purple-900">{societies.length}</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-sm text-orange-600 font-medium">Rows per Page</p>
          <p className="text-2xl font-bold text-orange-900">{pageSize}</p>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={data}
        totalCount={totalCount}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onClientNameFilter={setClientNameFilter}
        onSocietyFilter={setSocietyFilter}
        clientNameFilter={clientNameFilter}
        societyFilter={societyFilter}
        societies={societies}
        isLoading={isLoading}
      />

      {/* Footer Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          {clientNameFilter && `Searching for "${clientNameFilter}" in client names. `}
          {societyFilter && `Filtered by society "${societyFilter}". `}
          {!clientNameFilter && !societyFilter && 'Showing all records. '}
          Data is fetched server-side with pagination for optimal performance.
        </p>
      </div>
    </div>
  );
}
