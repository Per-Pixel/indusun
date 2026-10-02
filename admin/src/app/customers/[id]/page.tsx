import { notFound } from 'next/navigation';
import CRMLayout from '@/components/CRMLayout';
import {
  getMasterDataById,
  getMasterDataByClientName,
} from '@/services/masterDataService';
import ProfileContent from './ProfileContent';

export const metadata = { title: 'Customer Profile | Indusun CRM' };

export default async function CustomerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) notFound();

  const { data: customer, error } = await getMasterDataById(numericId);

  if (error || !customer) notFound();

  const { data: portfolio } = await getMasterDataByClientName(customer.client_name || '');

  return (
    <CRMLayout>
      <ProfileContent customer={customer} portfolio={portfolio || []} />
    </CRMLayout>
  );
}
