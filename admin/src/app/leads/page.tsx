import CRMLayout from '@/components/CRMLayout';
import LeadsContent from './LeadsContent';
import { getLeads, getLeadPipelineCounts } from '@/services/leadService';
import { getUniqueSocieties } from '@/services/masterDataService';

export const metadata = {
  title: 'Lead Management | Indusun CRM',
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; society?: string; status?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const society = params.society || '';
  const status = params.status || '';

  const [leadsResult, pipelineResult, societiesResult] = await Promise.all([
    getLeads({ page, pageSize: 25, search, societyFilter: society, statusFilter: status }),
    getLeadPipelineCounts(),
    getUniqueSocieties(),
  ]);

  return (
    <CRMLayout>
      <LeadsContent
        leads={leadsResult.data}
        totalCount={leadsResult.count}
        page={page}
        pipeline={pipelineResult.counts}
        societies={societiesResult.societies}
        filters={{ search, society, status }}
        error={leadsResult.error}
      />
    </CRMLayout>
  );
}
