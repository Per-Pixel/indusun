/**
 * Booking Management Service
 * Records with paid_amount > 0 are considered "booked" properties.
 */
import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import { withServerCache } from '@/utils/serverCache';

const TABLE = 'Master Data Of Gurukrupa';
const BOOKING_COLS = 'id,client_name,contact_no,society_name,plot_no,plot_size,plot_amount,paid_amount,emi_amount,emi_time,"broker\'s_name",date_of_form,date,cancel_date,cheque_cash,policy_number,remarks';

export type BookingStatus = 'token' | 'agreement' | 'registered' | 'possession' | 'cancelled';

export interface BookingRecord {
  id: number;
  client_name: string | null;
  contact_no: string | null;
  society_name: string | null;
  plot_no: string | null;
  plot_size: string | null;
  plot_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_pct: number;
  emi_amount: number;
  emi_time: string | null;
  booking_status: BookingStatus;
  broker: string | null;
  booking_date: string | null;
  cancel_date: string | null;
  cheque_cash: string | null;
  policy_number: string | null;
  remarks: string | null;
}

function parseAmt(v: string | null) {
  return parseFloat(v?.replace(/[^0-9.]/g, '') || '0') || 0;
}

function deriveBookingStatus(row: MasterDataOfGurukrupa): BookingStatus {
  if (row.cancel_date) return 'cancelled';
  const paid = parseAmt(row.paid_amount);
  const plot = parseAmt(row.plot_amount);
  if (plot === 0) return 'token';
  const pct = paid / plot;
  if (pct >= 0.9) return 'possession';
  if (pct >= 0.5) return 'registered';
  if (pct >= 0.1) return 'agreement';
  return 'token';
}

export async function getBookings({
  page = 1, pageSize = 25, search = '', societyFilter = '',
}: { page?: number; pageSize?: number; search?: string; societyFilter?: string }): Promise<{
  data: BookingRecord[]; count: number; error: Error | null;
}> {
  try {
    const supabase = createServiceClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const applyFilters = (q: any) => {
      q = q.not('paid_amount', 'is', null);
      if (search) {
        q = q.or(
          `client_name.ilike.%${search}%,contact_no.ilike.%${search}%,society_name.ilike.%${search}%,project_name.ilike.%${search}%,plot_no.ilike.%${search}%,"broker's_name".ilike.%${search}%,broker_code.ilike.%${search}%,broker_name_clean.ilike.%${search}%`
        );
      }
      if (societyFilter) q = q.eq('society_name', societyFilter);
      return q;
    };

    const countCacheKey = `count:bookings:${search}|${societyFilter}`;
    const [{ data, error }, count] = await Promise.all([
      applyFilters(supabase.from(TABLE).select(BOOKING_COLS))
        .order('id', { ascending: false })
        .range(from, to),
      withServerCache(countCacheKey, async () => {
        const { count: c, error: cErr } = await applyFilters(
          supabase.from(TABLE).select('*', { count: 'exact', head: true })
        );
        if (cErr) throw new Error(cErr.message);
        return c || 0;
      }),
    ]);

    if (error) return { data: [], count: 0, error: new Error(error.message) };

    const bookings: BookingRecord[] = (data as MasterDataOfGurukrupa[]).map((row) => {
      const plotAmt = parseAmt(row.plot_amount);
      const paidAmt = parseAmt(row.paid_amount);
      return {
        id: row.id,
        client_name: row.client_name,
        contact_no: row.contact_no,
        society_name: row.society_name,
        plot_no: row.plot_no,
        plot_size: row.plot_size,
        plot_amount: plotAmt,
        paid_amount: paidAmt,
        balance_amount: Math.max(0, plotAmt - paidAmt),
        payment_pct: plotAmt > 0 ? Math.min(100, Math.round((paidAmt / plotAmt) * 100)) : 0,
        emi_amount: parseAmt(row.emi_amount),
        emi_time: row.emi_time,
        booking_status: deriveBookingStatus(row),
        broker: row["broker's_name"],
        booking_date: row.date_of_form ?? row.date ?? null,
        cancel_date: row.cancel_date,
        cheque_cash: row.cheque_cash,
        policy_number: row.policy_number,
        remarks: row.remarks,
      };
    });

    return { data: bookings, count: count || 0, error: null };
  } catch (err) {
    return { data: [], count: 0, error: err as Error };
  }
}

export async function getBookingSummary(): Promise<{
  totalBookings: number; totalRevenue: number; totalPaid: number; totalBalance: number; error: Error | null;
}> {
  try {
    const s = await withServerCache('rpc:get_booking_summary_rpc', async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase.rpc('get_booking_summary_rpc');
      if (error || !data) throw new Error(error?.message || 'Failed to fetch booking summary');
      return data as { totalBookings: number; totalRevenue: number; totalPaid: number; totalBalance: number };
    });
    return {
      totalBookings: s.totalBookings || 0,
      totalRevenue: s.totalRevenue || 0,
      totalPaid: s.totalPaid || 0,
      totalBalance: s.totalBalance || 0,
      error: null,
    };
  } catch (err) {
    return { totalBookings: 0, totalRevenue: 0, totalPaid: 0, totalBalance: 0, error: err as Error };
  }
}
