import CRMLayout from '@/components/CRMLayout';
import ProjectsContent from './ProjectsContent';
import { getUniqueSocieties, getAllMasterData } from '@/services/masterDataService';

export const metadata = { title: 'Projects | Indusun CRM' };

export default async function ProjectsPage() {
  const [societiesResult, allDataResult] = await Promise.all([
    getUniqueSocieties(),
    getAllMasterData(),
  ]);

  // Build project stats per society from master data
  const projectMap: Record<string, {
    name: string; totalUnits: number; soldUnits: number; cancelledUnits: number;
    availableUnits: number; totalRevenue: number; paidRevenue: number;
    brokers: Set<string>; clients: Set<string>;
  }> = {};

  if (allDataResult.data) {
    allDataResult.data.forEach((row) => {
      const society = row.society_name || 'Unknown';
      if (!projectMap[society]) {
        projectMap[society] = {
          name: society, totalUnits: 0, soldUnits: 0, cancelledUnits: 0,
          availableUnits: 0, totalRevenue: 0, paidRevenue: 0,
          brokers: new Set(), clients: new Set(),
        };
      }
      const p = projectMap[society];
      p.totalUnits++;
      const paid = parseFloat(row.paid_amount?.replace(/[^0-9.]/g, '') || '0') || 0;
      const plot = parseFloat(row.plot_amount?.replace(/[^0-9.]/g, '') || '0') || 0;
      p.totalRevenue += plot;
      p.paidRevenue += paid;
      if (row.cancel_date) p.cancelledUnits++;
      else if (paid > 0) p.soldUnits++;
      else p.availableUnits++;
      if (row["broker's_name"]) p.brokers.add(row["broker's_name"]);
      if (row.client_name) p.clients.add(row.client_name);
    });
  }

  const projects = Object.values(projectMap)
    .sort((a, b) => b.totalUnits - a.totalUnits)
    .map((p) => ({
      ...p,
      brokerCount: p.brokers.size,
      clientCount: p.clients.size,
    }));

  return (
    <CRMLayout>
      <ProjectsContent
        projects={projects}
        totalSocieties={societiesResult.societies.length}
        error={allDataResult.error}
      />
    </CRMLayout>
  );
}
