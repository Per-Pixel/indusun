/**
 * Supabase service for site visit scheduling.
 * Derived from Master Data — uses emi_paid_date, date_of_form as visit proxies.
 */
import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import { withServerCache } from '@/utils/serverCache';
import { cachedRowCount } from '@/utils/rowCount';
import { executeQuery } from '@/lib/db';

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

function likePattern(search: string) {
  return `%${search.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

function mapVisit(row: MasterDataOfGurukrupa): SiteVisitRecord {
  return {
    id: row.id,
    client_name: row.client_name,
    contact_no: row.contact_no,
    society_name: row.society_name,
    plot_no: row.plot_no,
    visit_date: row.date_of_form ?? row.date ?? null,
    status: deriveVisitStatus(row),
    broker: row["broker's_name"],
    remarks: row.remarks,
  };
}

function visitStatusSql(status: SiteVisitRecord['status'] | '') {
  const visitDay = `CASE
    WHEN COALESCE(emi_paid_date_iso::text, '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN left(emi_paid_date_iso::text, 10)::date
    WHEN COALESCE(form_date_iso::text, '') ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}' THEN left(form_date_iso::text, 10)::date
    ELSE NULL
  END`;
  if (status === 'cancelled') return `cancel_date IS NOT NULL`;
  if (status === 'completed') {
    return `cancel_date IS NULL AND (COALESCE(paid_amount_num, 0) > 0 OR (${visitDay}) < CURRENT_DATE)`;
  }
  if (status === 'scheduled') {
    return `cancel_date IS NULL AND COALESCE(paid_amount_num, 0) <= 0 AND ((${visitDay}) IS NULL OR (${visitDay}) >= CURRENT_DATE)`;
  }
  if (status === 'no_show') return 'FALSE';
  return 'TRUE';
}

export async function getSiteVisits({
  page = 1, pageSize = 25, search = '', societyFilter = '', statusFilter = '',
}: { page?: number; pageSize?: number; search?: string; societyFilter?: string; statusFilter?: SiteVisitRecord['status'] | '' }): Promise<{
  data: SiteVisitRecord[]; count: number; error: Error | null;
}> {
  try {
    if (statusFilter) {
      const params: unknown[] = [];
      const where = [`date_of_form IS NOT NULL`, visitStatusSql(statusFilter)];
      if (search) {
        params.push(likePattern(search));
        const p = `$${params.length}`;
        where.push(`(client_name ILIKE ${p} OR contact_no ILIKE ${p} OR society_name ILIKE ${p} OR plot_no ILIKE ${p} OR "broker's_name" ILIKE ${p} OR broker_code ILIKE ${p} OR ba_code ILIKE ${p} OR broker_name_clean ILIKE ${p})`);
      }
      if (societyFilter) {
        params.push(societyFilter);
        where.push(`society_name = $${params.length}`);
      }
      const clause = where.join(' AND ');
      const offset = (page - 1) * pageSize;
      const cols = `id,client_name,contact_no,society_name,plot_no,emi_paid_date,date_of_form,date,paid_amount,cancel_date,"broker's_name",remarks`;
      const [rows, counted] = await Promise.all([
        executeQuery(
          `SELECT ${cols} FROM "${TABLE}" WHERE ${clause} ORDER BY date_of_form DESC NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
          [...params, pageSize, offset],
        ),
        executeQuery(`SELECT count(*)::int AS count FROM "${TABLE}" WHERE ${clause}`, params),
      ]);
      return {
        data: (rows.rows as MasterDataOfGurukrupa[]).map(mapVisit),
        count: Number(counted.rows[0]?.count || 0),
        error: null,
      };
    }

    const supabase = createServiceClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const COLS = 'id,client_name,contact_no,society_name,plot_no,emi_paid_date,date_of_form,date,paid_amount,cancel_date,"broker\'s_name",remarks';
    const applyFilters = (q: any) => {
      q = q.not('date_of_form', 'is', null);
      if (search) {
        q = q.or(
          `client_name.ilike.%${search}%,contact_no.ilike.%${search}%,society_name.ilike.%${search}%,plot_no.ilike.%${search}%,"broker's_name".ilike.%${search}%,broker_code.ilike.%${search}%,ba_code.ilike.%${search}%,broker_name_clean.ilike.%${search}%`
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
      cachedRowCount(
        countCacheKey,
        () => applyFilters(supabase.from(TABLE).select('id', { count: 'exact', head: true })),
      ),
    ]);

    if (error) return { data: [], count: 0, error: new Error(error.message) };

    return { data: (data as MasterDataOfGurukrupa[]).map(mapVisit), count: count || 0, error: null };
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
