import { redirect } from 'next/navigation';
import CRMLayout from '@/components/CRMLayout';
import ReportsContent from './ReportsContent';
import { getMasterDataSummary } from '@/services/masterDataService';
import { getCurrentUser } from '@/services/supabaseAuth';
import { createServiceClient } from '@/utils/supabase/service';
import { withServerCache } from '@/utils/serverCache';
import { homePath, pathAllowed } from '@/lib/staffNav';

export const metadata = { title: 'Reports & Analytics | Indusun CRM' };

export default async function ReportsPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect('/auth/login');
  if (!pathAllowed(user, '/reports')) redirect(homePath(user));

  const [summaryResult, topBrokers] = await Promise.all([
    getMasterDataSummary(),
    withServerCache('rpc:get_top_brokers_rpc:10', async () => {
      const supabase = createServiceClient();
      const { data } = await supabase.rpc('get_top_brokers_rpc', { p_limit: 10 });
      return Array.isArray(data) ? data : [];
    }).catch(() => []),
  ]);

  return (
    <CRMLayout>
      <ReportsContent
        summary={summaryResult.summary}
        topBrokers={topBrokers}
        error={summaryResult.error}
      />
    </CRMLayout>
  );
}
