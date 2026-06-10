/**
 * Supabase service for site visit scheduling.
 * Derived from Master Data — uses emi_paid_date, date_of_form as visit proxies.
 */
import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa } from '@/types/masterData';

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

    let query = supabase
      .from(TABLE)
      .select('id,client_name,contact_no,society_name,plot_no,emi_paid_date,date_of_form,date,paid_amount,cancel_date,"broker\'s_name",remarks', { count: 'exact' });

    if (search) query = query.ilike('client_name', `%${search}%`);
    if (societyFilter) query = query.eq('society_name', societyFilter);

    // Only include records that have a date to represent a visit
    query = query.not('date_of_form', 'is', null);

    const { data, count, error } = await query
      .order('date_of_form', { ascending: false })
      .range(from, to);

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
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('cancel_date,paid_amount,date_of_form,date,emi_paid_date');

    if (error) throw new Error(error.message);

    let scheduled = 0, completed = 0, cancelled = 0;
    (data as Partial<MasterDataOfGurukrupa>[]).forEach((row) => {
      const status = deriveVisitStatus(row as MasterDataOfGurukrupa);
      if (status === 'scheduled') scheduled++;
      else if (status === 'completed') completed++;
      else if (status === 'cancelled') cancelled++;
    });

    return { total: data.length, scheduled, completed, cancelled, noShow: 0, error: null };
  } catch (err) {
    return { total: 0, scheduled: 0, completed: 0, cancelled: 0, noShow: 0, error: err as Error };
  }
}
