import CRMLayout from '@/components/CRMLayout';
import ActivityLogsContent from './ActivityLogsContent';
import { getPaginatedMasterData } from '@/services/masterDataService';

export const metadata = { title: 'Activity Logs | Indusun CRM' };

export default async function ActivityLogsPage({
  searchParams,
}: { searchParams: Promise<{ page?: string; search?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  // Activity logs represent changes to master data records
  const { data, count, error } = await getPaginatedMasterData({
    page, pageSize: 50,
    clientNameFilter: params.search || '',
  });

  return (
    <CRMLayout>
      <ActivityLogsContent
        records={data || []}
        totalCount={count || 0}
        page={page}
        search={params.search || ''}
        error={error}
      />
    </CRMLayout>
  );
}
