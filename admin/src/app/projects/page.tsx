import CRMLayout from '@/components/CRMLayout';
import ProjectsContent from './ProjectsContent';
import { createServiceClient } from '@/utils/supabase/service';
import { withServerCache } from '@/utils/serverCache';

export const metadata = { title: 'Projects | Indusun CRM' };

export default async function ProjectsPage() {
  let projects: any[] = [];
  let error: Error | null = null;
  try {
    projects = await withServerCache('rpc:get_projects_summary_rpc', async () => {
      const supabase = createServiceClient();
      const { data, error: rpcErr } = await supabase.rpc('get_projects_summary_rpc');
      if (rpcErr) throw new Error(rpcErr.message);
      return Array.isArray(data) ? data : [];
    });
  } catch (e: any) {
    error = e instanceof Error ? e : new Error(String(e));
  }

  return (
    <CRMLayout>
      <ProjectsContent
        projects={projects}
        totalSocieties={projects.length}
        error={error}
      />
    </CRMLayout>
  );
}
