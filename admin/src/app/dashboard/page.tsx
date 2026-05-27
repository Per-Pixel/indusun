// Dashboard page - Server Component with Supabase integration
import { getMasterDataSummary, getUniqueSocieties } from '@/services/masterDataService';
import DashboardContent from './DashboardContent';

export default async function DashboardPage() {
  // Fetch data from Supabase on the server
  const { summary, error } = await getMasterDataSummary();
  const { societies } = await getUniqueSocieties();

  // Pass data to client component
  return (
    <DashboardContent 
      summary={summary} 
      societies={societies} 
      error={error} 
    />
  );
}
