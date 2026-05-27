import { getAllMasterData, getMasterDataSummary, getUniqueSocieties } from '@/services/masterDataService';
import { MasterDataOfGurukrupa } from '@/types/masterData';

export default async function MasterDataPage() {
  const { data: records, error } = await getAllMasterData();
  const { summary } = await getMasterDataSummary();
  const { societies } = await getUniqueSocieties();

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
            </ul>
          </div>
          
          <div className="mt-4 flex gap-2">
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
      <h1 className="text-3xl font-bold mb-6">Master Data - Gurukrupa</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Records</p>
            <p className="text-2xl font-bold text-blue-900">{summary.totalRecords}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Total Clients</p>
            <p className="text-2xl font-bold text-green-900">{summary.totalClients}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">Societies</p>
            <p className="text-2xl font-bold text-purple-900">{summary.uniqueSocieties}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Brokers</p>
            <p className="text-2xl font-bold text-orange-900">{summary.uniqueBrokers}</p>
          </div>
          <div className="bg-cyan-50 p-4 rounded-lg col-span-1 md:col-span-2">
            <p className="text-sm text-cyan-600 font-medium">Total Plot Amount</p>
            <p className="text-2xl font-bold text-cyan-900">
              ₹{summary.totalPlotAmount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Societies Filter */}
      {societies.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">Available Societies ({societies.length})</h3>
          <div className="flex flex-wrap gap-2">
            {societies.map((society) => (
              <span
                key={society}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                {society}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">All Records ({records?.length || 0})</h2>
        </div>

        {records && records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Society</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plot No</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plot Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plot Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Broker</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record: MasterDataOfGurukrupa) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{record.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.client_name || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {record.society_name || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {record.plot_no || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {record.plot_size || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {record.plot_amount || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                      {record.paid_amount || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {record["broker's_name"] || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {record.contact_no || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            No records found in the "Master Data Of Gurukrupa" table.
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
        <p className="font-semibold mb-2">Connection Info:</p>
        <p>Table: &quot;Master Data Of Gurukrupa&quot;</p>
        <p>Records loaded: {records?.length || 0}</p>
        <p>Societies found: {societies.length}</p>
      </div>
    </div>
  );
}
