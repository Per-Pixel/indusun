/**
 * Booking Management Service
 * Records with paid_amount > 0 are considered "booked" properties.
 */
import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa } from '@/types/masterData';

const TABLE = 'Master Data Of Gurukrupa';

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

    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .not('paid_amount', 'is', null);

    if (search) query = query.ilike('client_name', `%${search}%`);
    if (societyFilter) query = query.eq('society_name', societyFilter);

    const { data, count, error } = await query
      .order('id', { ascending: false })
      .range(from, to);

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
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('plot_amount,paid_amount')
      .not('paid_amount', 'is', null);

    if (error) throw new Error(error.message);

    let totalRevenue = 0, totalPaid = 0;
    (data as { plot_amount: string | null; paid_amount: string | null }[]).forEach((r) => {
      totalRevenue += parseAmt(r.plot_amount);
      totalPaid    += parseAmt(r.paid_amount);
    });

    return {
      totalBookings: data.length,
      totalRevenue,
      totalPaid,
      totalBalance: Math.max(0, totalRevenue - totalPaid),
      error: null,
    };
  } catch (err) {
    return { totalBookings: 0, totalRevenue: 0, totalPaid: 0, totalBalance: 0, error: err as Error };
  }
}
