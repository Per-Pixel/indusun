import CRMLayout from '@/components/CRMLayout';
import BookingsContent from './BookingsContent';
import { getBookings, getBookingSummary } from '@/services/bookingService';
import { getUniqueSocieties } from '@/services/masterDataService';

export const metadata = { title: 'Bookings | Indusun CRM' };

export default async function BookingsPage({
  searchParams,
}: { searchParams: Promise<{ page?: string; search?: string; society?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);

  const [bookingsResult, summaryResult, societiesResult] = await Promise.all([
    getBookings({ page, pageSize: 25, search: params.search || '', societyFilter: params.society || '' }),
    getBookingSummary(),
    getUniqueSocieties(),
  ]);

  return (
    <CRMLayout>
      <BookingsContent
        bookings={bookingsResult.data}
        totalCount={bookingsResult.count}
        page={page}
        summary={summaryResult}
        societies={societiesResult.societies}
        filters={{ search: params.search || '', society: params.society || '' }}
        error={bookingsResult.error}
      />
    </CRMLayout>
  );
}
