import CRMLayout from '@/components/CRMLayout';
import ReportsContent from './ReportsContent';
import { getMasterDataSummary } from '@/services/masterDataService';
import { createServiceClient } from '@/utils/supabase/service';
import { withServerCache } from '@/utils/serverCache';

export const metadata = { title: 'Reports & Analytics | Indusun CRM' };

export default async function ReportsPage() {
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
