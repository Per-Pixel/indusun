import CRMLayout from '@/components/CRMLayout';
import SiteVisitsContent from './SiteVisitsContent';
import { getSiteVisits, getVisitStatsSummary } from '@/services/siteVisitService';
import { getUniqueSocieties } from '@/services/masterDataService';

export const metadata = { title: 'Site Visits | Indusun CRM' };

export default async function SiteVisitsPage({
  searchParams,
}: { searchParams: Promise<{ page?: string; search?: string; society?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  const [visitsResult, statsResult, societiesResult] = await Promise.all([
    getSiteVisits({ page, pageSize: 25, search: params.search || '', societyFilter: params.society || '' }),
    getVisitStatsSummary(),
    getUniqueSocieties(),
  ]);

  return (
    <CRMLayout>
      <SiteVisitsContent
        visits={visitsResult.data}
        totalCount={visitsResult.count}
        page={page}
        stats={statsResult}
        societies={societiesResult.societies}
        filters={{ search: params.search || '', society: params.society || '' }}
        error={visitsResult.error}
      />
    </CRMLayout>
  );
}
