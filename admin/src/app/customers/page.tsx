import CRMLayout from '@/components/CRMLayout';
import CustomersContent from './CustomersContent';
import {
  getPaginatedMasterData,
  getUniqueSocieties,
  getUniqueBrokers,
} from '@/services/masterDataService';

export const metadata = { title: 'Customers | Indusun CRM' };

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    society?: string;
    broker?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const search = params.search || '';
  const society = params.society || '';
  const broker = params.broker || '';
  const status = params.status || '';
  const sort = params.sort || 'newest';

  const sortMap: Record<string, { sortBy: 'id' | 'client_name'; sortOrder: 'asc' | 'desc' }> = {
    newest: { sortBy: 'id', sortOrder: 'desc' },
    oldest: { sortBy: 'id', sortOrder: 'asc' },
    name_asc: { sortBy: 'client_name', sortOrder: 'asc' },
    name_desc: { sortBy: 'client_name', sortOrder: 'desc' },
  };
  const { sortBy, sortOrder } = sortMap[sort] || sortMap.newest;

  const [dataResult, societiesResult, brokersResult] = await Promise.all([
    getPaginatedMasterData({
      page,
      pageSize: 25,
      search,
      societyFilter: society,
      brokerFilter: broker,
      statusFilter: status,
      sortBy,
      sortOrder,
    }),
    getUniqueSocieties(),
    getUniqueBrokers(),
  ]);

  return (
    <CRMLayout>
      <CustomersContent
        customers={dataResult.data || []}
        totalCount={dataResult.count || 0}
        page={page}
        societies={societiesResult.societies}
        brokers={brokersResult.brokers}
        filters={{ search, society, broker, status, sort }}
        error={dataResult.error}
      />
    </CRMLayout>
  );
}
