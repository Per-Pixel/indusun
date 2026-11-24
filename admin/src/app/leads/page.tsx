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
  searchParams: Promise<{
    page?: string; search?: string; society?: string; status?: string;
    score?: string; from?: string; to?: string; min?: string; max?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const society = params.society || '';
  const status = params.status || '';
  const score = params.score || '';
  const from = params.from || '';
  const to = params.to || '';
  const minAmount = params.min != null && params.min !== '' && Number.isFinite(Number(params.min)) ? Number(params.min) : null;
  const maxAmount = params.max != null && params.max !== '' && Number.isFinite(Number(params.max)) ? Number(params.max) : null;

  const [leadsResult, pipelineResult, societiesResult] = await Promise.all([
    getLeads({
      page, pageSize: 25, search, societyFilter: society, statusFilter: status,
      scoreFilter: score, dateFrom: from, dateTo: to, minAmount, maxAmount,
    }),
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
        filters={{ search, society, status, score, from, to, min: params.min || '', max: params.max || '' }}
        error={leadsResult.error}
      />
    </CRMLayout>
  );
}
