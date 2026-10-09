// Dashboard page - Server Component with Supabase integration
import { getMasterDataSummary, getUniqueSocieties } from '@/services/masterDataService';
import { getLeads, getLeadPipelineCounts } from '@/services/leadService';
import DashboardContent from './DashboardContent';
import CRMLayout from '@/components/CRMLayout';

export default async function DashboardPage() {
  const [{ summary, error }, { societies }, { data: leadRows }, { counts: pipelineCounts }] = await Promise.all([
    getMasterDataSummary(),
    getUniqueSocieties(),
    // Oldest records first — derived "new" enquiries surface longest-waiting first.
    getLeads({ page: 1, pageSize: 400, order: 'asc' }),
    getLeadPipelineCounts(),
  ]);

  return (
    <CRMLayout>
      <DashboardContent
        summary={summary}
        societies={societies}
        leads={leadRows}
        pipelineCounts={pipelineCounts}
        error={error}
      />
    </CRMLayout>
  );
}
