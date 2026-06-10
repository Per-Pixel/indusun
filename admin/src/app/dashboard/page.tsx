// Dashboard page - Server Component with Supabase integration
import { getMasterDataSummary, getUniqueSocieties } from '@/services/masterDataService';
import DashboardContent from './DashboardContent';
import CRMLayout from '@/components/CRMLayout';

export default async function DashboardPage() {
  const { summary, error } = await getMasterDataSummary();
  const { societies } = await getUniqueSocieties();

  return (
    <CRMLayout>
      <DashboardContent
        summary={summary}
        societies={societies}
        error={error}
      />
    </CRMLayout>
  );
}

