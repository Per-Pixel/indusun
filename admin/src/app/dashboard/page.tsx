// Dashboard page - Server Component with Supabase integration
import { redirect } from 'next/navigation';
import { getMasterDataSummary, getUniqueSocieties } from '@/services/masterDataService';
import { getLeads, getLeadPipelineCounts } from '@/services/leadService';
import { getCurrentUser } from '@/services/supabaseAuth';
import { homePath, pathAllowed } from '@/lib/staffNav';
import DashboardContent from './DashboardContent';
import CRMLayout from '@/components/CRMLayout';

export default async function DashboardPage() {
  const { user } = await getCurrentUser();
  if (!user) redirect('/auth/login');
  if (!pathAllowed(user, '/dashboard')) redirect(homePath(user));

  const [{ summary, error }, { societies }, { data: leadRows }, { counts: pipelineCounts }] = await Promise.all([
    getMasterDataSummary(),
    getUniqueSocieties(),
    // Oldest records first — derived "new" enquiries surface longest-waiting first.
    getLeads({ page: 1, pageSize: 20, statusFilter: 'new', order: 'asc' }),
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
