import CRMLayout from '@/components/CRMLayout';
import ReportsContent from './ReportsContent';
import { getMasterDataSummary, getAllMasterData } from '@/services/masterDataService';

export const metadata = { title: 'Reports & Analytics | Indusun CRM' };

export default async function ReportsPage() {
  const [summaryResult, allDataResult] = await Promise.all([
    getMasterDataSummary(),
    getAllMasterData(),
  ]);

  // Build broker performance from all data
  const brokerStats: Record<string, { deals: number; revenue: number; paid: number }> = {};
  if (allDataResult.data) {
    allDataResult.data.forEach((row) => {
      const broker = row["broker's_name"] || 'Direct';
      if (!brokerStats[broker]) brokerStats[broker] = { deals: 0, revenue: 0, paid: 0 };
      brokerStats[broker].deals++;
      brokerStats[broker].revenue += parseFloat(row.plot_amount?.replace(/[^0-9.]/g, '') || '0') || 0;
      brokerStats[broker].paid    += parseFloat(row.paid_amount?.replace(/[^0-9.]/g, '') || '0') || 0;
    });
  }

  const topBrokers = Object.entries(brokerStats)
    .sort((a, b) => b[1].deals - a[1].deals)
    .slice(0, 10)
    .map(([name, stats]) => ({ name, ...stats }));

  return (
    <CRMLayout>
      <ReportsContent
        summary={summaryResult.summary}
        topBrokers={topBrokers}
        error={summaryResult.error}
      />
    </CRMLayout>
  );
}
