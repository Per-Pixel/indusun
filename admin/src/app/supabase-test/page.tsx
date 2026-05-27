'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export default function SupabaseTestPage() {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Checking Supabase connection...');
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    async function checkSupabase() {
      const logs: string[] = [];

      // Check 1: Environment variables
      logs.push(`✓ Supabase URL: ${supabaseUrl ? 'Set' : 'NOT SET'}`);
      logs.push(`✓ Supabase Key: ${supabaseKey ? 'Set' : 'NOT SET'}`);

      if (!supabaseUrl || !supabaseKey) {
        setStatus('error');
        setMessage('Missing environment variables');
        setDetails(logs);
        return;
      }

      try {
        // Check 2: Create client
        const supabase = createBrowserClient(supabaseUrl, supabaseKey);
        logs.push('✓ Supabase client created');

        // Check 3: Test connection by getting session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          logs.push(`✗ Session error: ${sessionError.message}`);
          setStatus('error');
          setMessage('Failed to get session');
          setDetails(logs);
          return;
        }

        if (session) {
          logs.push(`✓ Active session found for: ${session.user.email}`);
        } else {
          logs.push('ℹ No active session (user not logged in)');
        }

        // Check 4: Test Master Data table
        const { data: masterData, error: tableError } = await supabase
          .from('Master Data Of Gurukrupa')
          .select('count')
          .limit(1);

        if (tableError) {
          logs.push(`✗ Master Data table error: ${tableError.message}`);
        } else {
          logs.push('✓ Master Data table accessible');
        }

        // Check 5: Test admin_users table (if exists)
        const { error: adminError } = await supabase
          .from('admin_users')
          .select('count')
          .limit(1);

        if (adminError) {
          logs.push(`ℹ admin_users table: ${adminError.message} (optional)`);
        } else {
          logs.push('✓ admin_users table accessible');
        }

        setStatus('success');
        setMessage('Supabase connection working!');
        setDetails(logs);

      } catch (err) {
        logs.push(`✗ Error: ${(err as Error).message}`);
        setStatus('error');
        setMessage('Connection failed');
        setDetails(logs);
      }
    }

    checkSupabase();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>

        <div className={`p-6 rounded-lg mb-6 ${
          status === 'checking' ? 'bg-yellow-50 border border-yellow-200' :
          status === 'success' ? 'bg-green-50 border border-green-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center mb-4">
            {status === 'checking' && (
              <div className="animate-spin h-6 w-6 border-2 border-yellow-500 border-t-transparent rounded-full mr-3"></div>
            )}
            {status === 'success' && (
              <svg className="h-6 w-6 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <h2 className={`text-xl font-semibold ${
              status === 'checking' ? 'text-yellow-800' :
              status === 'success' ? 'text-green-800' :
              'text-red-800'
            }`}>
              {message}
            </h2>
          </div>

          <div className="bg-white rounded p-4 font-mono text-sm">
            {details.map((detail, index) => (
              <div key={index} className="py-1">{detail}</div>
            ))}
          </div>
        </div>

        {status === 'error' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4">Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Create <code className="bg-gray-100 px-1 rounded">admin/.env.local</code> file</li>
              <li>Add your Supabase URL and Publishable Key</li>
              <li>Restart the development server</li>
              <li>Check that Supabase project is active</li>
            </ol>
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p className="font-semibold mb-2">Required .env.local:</p>
              <pre className="text-sm text-gray-700">
{`NEXT_PUBLIC_SUPABASE_URL=https://ebhnbnewthtzhxsinuad.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_BQ3FhN3eH1G38E2tYvVOdg_jwiwj49F`}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-4">
          <a
            href="/auth/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login →
          </a>
          <a
            href="/dashboard"
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
