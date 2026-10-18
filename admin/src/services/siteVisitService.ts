/**
 * Supabase service for site visit scheduling.
 * Derived from Master Data — uses emi_paid_date, date_of_form as visit proxies.
 */
import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import { withServerCache } from '@/utils/serverCache';

const TABLE = 'Master Data Of Gurukrupa';

export interface SiteVisitRecord {
  id: number;
  client_name: string | null;
  contact_no: string | null;
  society_name: string | null;
  plot_no: string | null;
  visit_date: string | null;
  status: 'scheduled' | 'completed' | 'no_show' | 'cancelled';
  broker: string | null;
  remarks: string | null;
}

function deriveVisitStatus(row: MasterDataOfGurukrupa): SiteVisitRecord['status'] {
  if (row.cancel_date) return 'cancelled';
  const hasPaid = parseFloat(row.paid_amount?.replace(/[^0-9.]/g, '') || '0') > 0;
  if (hasPaid) return 'completed';
  const dateVal = row.emi_paid_date ?? row.date_of_form ?? row.date;
  if (!dateVal) return 'scheduled';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'scheduled';
  return d < new Date() ? 'completed' : 'scheduled';
}

export async function getSiteVisits({
  page = 1, pageSize = 25, search = '', societyFilter = '',
}: { page?: number; pageSize?: number; search?: string; societyFilter?: string }): Promise<{
  data: SiteVisitRecord[]; count: number; error: Error | null;
}> {
  try {
    const supabase = createServiceClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const COLS = 'id,client_name,contact_no,society_name,plot_no,emi_paid_date,date_of_form,date,paid_amount,cancel_date,"broker\'s_name",remarks';
    const applyFilters = (q: any) => {
      q = q.not('date_of_form', 'is', null);
      if (search) {
        q = q.or(
          `client_name.ilike.%${search}%,contact_no.ilike.%${search}%,society_name.ilike.%${search}%,plot_no.ilike.%${search}%,"broker's_name".ilike.%${search}%`
        );
      }
      if (societyFilter) q = q.eq('society_name', societyFilter);
      return q;
    };

    const countCacheKey = `count:visits:${search}|${societyFilter}`;
    const [{ data, error }, count] = await Promise.all([
      applyFilters(supabase.from(TABLE).select(COLS))
        .order('date_of_form', { ascending: false })
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

    const visits: SiteVisitRecord[] = (data as MasterDataOfGurukrupa[]).map((row) => ({
      id: row.id,
      client_name: row.client_name,
      contact_no: row.contact_no,
      society_name: row.society_name,
      plot_no: row.plot_no,
      visit_date: row.date_of_form ?? row.date ?? null,
      status: deriveVisitStatus(row),
      broker: row["broker's_name"],
      remarks: row.remarks,
    }));

    return { data: visits, count: count || 0, error: null };
  } catch (err) {
    return { data: [], count: 0, error: err as Error };
  }
}

export async function getVisitStatsSummary(): Promise<{
  total: number; scheduled: number; completed: number; cancelled: number; noShow: number; error: Error | null;
}> {
  try {
    const s = await withServerCache('rpc:get_visit_stats_summary_rpc', async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase.rpc('get_visit_stats_summary_rpc');
      if (error || !data) throw new Error(error?.message || 'Failed to fetch visit summary');
      return data as { total: number; scheduled: number; completed: number; cancelled: number; noShow: number };
    });
    return {
      total: s.total || 0,
      scheduled: s.scheduled || 0,
      completed: s.completed || 0,
      cancelled: s.cancelled || 0,
      noShow: s.noShow || 0,
      error: null,
    };
  } catch (err) {
    return { total: 0, scheduled: 0, completed: 0, cancelled: 0, noShow: 0, error: err as Error };
  }
}
