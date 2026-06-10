import CRMLayout from '@/components/CRMLayout';
import CustomersContent from './CustomersContent';
import { getPaginatedMasterData, getUniqueSocieties } from '@/services/masterDataService';

export const metadata = { title: 'Customer Profiles | Indusun CRM' };

export default async function CustomersPage({
  searchParams,
}: { searchParams: Promise<{ page?: string; search?: string; society?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  const [dataResult, societiesResult] = await Promise.all([
    getPaginatedMasterData({ page, pageSize: 25, clientNameFilter: params.search || '', societyFilter: params.society || '' }),
    getUniqueSocieties(),
  ]);

  return (
    <CRMLayout>
      <CustomersContent
        customers={dataResult.data || []}
        totalCount={dataResult.count || 0}
        page={page}
        societies={societiesResult.societies}
        filters={{ search: params.search || '', society: params.society || '' }}
        error={dataResult.error}
      />
    </CRMLayout>
  );
}
