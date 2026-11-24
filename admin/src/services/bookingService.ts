/**
 * Booking Management Service
 * Records with paid_amount > 0 are considered "booked" properties.
 */
import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import { withServerCache } from '@/utils/serverCache';
import { cachedRowCount } from '@/utils/rowCount';
import { executeQuery } from '@/lib/db';

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

function likePattern(search: string) {
  return `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

function mapBooking(row: MasterDataOfGurukrupa): BookingRecord {
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
}

function bookingStatusSql(status: BookingStatus | '') {
  if (status === 'cancelled') return `cancel_date IS NOT NULL`;
  if (status === 'possession') return `cancel_date IS NULL AND COALESCE(plot_amount_num, 0) > 0 AND COALESCE(paid_amount_num, 0) >= plot_amount_num * 0.9`;
  if (status === 'registered') return `cancel_date IS NULL AND COALESCE(plot_amount_num, 0) > 0 AND COALESCE(paid_amount_num, 0) >= plot_amount_num * 0.5 AND COALESCE(paid_amount_num, 0) < plot_amount_num * 0.9`;
  if (status === 'agreement') return `cancel_date IS NULL AND COALESCE(plot_amount_num, 0) > 0 AND COALESCE(paid_amount_num, 0) >= plot_amount_num * 0.1 AND COALESCE(paid_amount_num, 0) < plot_amount_num * 0.5`;
  if (status === 'token') return `cancel_date IS NULL AND (COALESCE(plot_amount_num, 0) <= 0 OR COALESCE(paid_amount_num, 0) < plot_amount_num * 0.1)`;
  return 'TRUE';
}

export async function getBookings({
  page = 1, pageSize = 25, search = '', societyFilter = '', statusFilter = '',
}: { page?: number; pageSize?: number; search?: string; societyFilter?: string; statusFilter?: BookingStatus | '' }): Promise<{
  data: BookingRecord[]; count: number; error: Error | null;
}> {
  try {
    if (statusFilter) {
      const params: unknown[] = [];
      const where = [`paid_amount IS NOT NULL`, bookingStatusSql(statusFilter)];
      if (search) {
        params.push(likePattern(search));
        const p = `$${params.length}`;
        where.push(`(client_name ILIKE ${p} OR contact_no ILIKE ${p} OR society_name ILIKE ${p} OR project_name ILIKE ${p} OR plot_no ILIKE ${p} OR "broker's_name" ILIKE ${p} OR broker_code ILIKE ${p} OR ba_code ILIKE ${p} OR broker_name_clean ILIKE ${p})`);
      }
      if (societyFilter) {
        params.push(societyFilter);
        where.push(`society_name = $${params.length}`);
      }
      const clause = where.join(' AND ');
      const offset = (page - 1) * pageSize;
      const [rows, counted] = await Promise.all([
        executeQuery(
          `SELECT ${BOOKING_COLS} FROM "${TABLE}" WHERE ${clause} ORDER BY id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
          [...params, pageSize, offset],
        ),
        executeQuery(`SELECT count(*)::int AS count FROM "${TABLE}" WHERE ${clause}`, params),
      ]);
      return {
        data: (rows.rows as MasterDataOfGurukrupa[]).map(mapBooking),
        count: Number(counted.rows[0]?.count || 0),
        error: null,
      };
    }

    const supabase = createServiceClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const applyFilters = (q: any) => {
      q = q.not('paid_amount', 'is', null);
      if (search) {
        q = q.or(
          `client_name.ilike.%${search}%,contact_no.ilike.%${search}%,society_name.ilike.%${search}%,project_name.ilike.%${search}%,plot_no.ilike.%${search}%,"broker's_name".ilike.%${search}%,broker_code.ilike.%${search}%,ba_code.ilike.%${search}%,broker_name_clean.ilike.%${search}%`
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
      cachedRowCount(
        countCacheKey,
        () => applyFilters(supabase.from(TABLE).select('id', { count: 'exact', head: true })),
      ),
    ]);

    if (error) return { data: [], count: 0, error: new Error(error.message) };

    return { data: (data as MasterDataOfGurukrupa[]).map(mapBooking), count: count || 0, error: null };
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
