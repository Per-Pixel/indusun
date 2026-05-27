import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function SupabaseExamplePage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // Example: Fetch data from your Supabase tables
  // Replace 'users' with your actual table name
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .limit(10)

  if (error) {
    console.error('Error fetching users:', error)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Integration Example</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="font-semibold mb-2">Connection Status</h2>
        <p className="text-green-600">✅ Supabase client initialized</p>
        {error ? (
          <p className="text-red-600">❌ Error: {error.message}</p>
        ) : (
          <p className="text-green-600">✅ Data fetched successfully</p>
        )}
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Users from Supabase</h2>
        {users && users.length > 0 ? (
          <ul className="space-y-2">
            {users.map((user: any) => (
              <li key={user.id} className="p-2 bg-gray-50 rounded">
                <span className="font-medium">{user.name || user.email}</span>
                <span className="text-gray-500 text-sm ml-2">({user.role || 'no role'})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No users found or table not configured.</p>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Next Steps:</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Ensure your Supabase table names match your queries</li>
          <li>Configure Row Level Security (RLS) policies</li>
          <li>Update API routes to use Supabase instead of mock data</li>
        </ul>
      </div>
    </div>
  )
}
