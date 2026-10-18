/**
 * Lead Management Service
 * Reads from the "Master Data Of Gurukrupa" Supabase table.
 * Treats each unique client as a lead record.
 */

import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import { withServerCache } from '@/utils/serverCache';

const TABLE = 'Master Data Of Gurukrupa';
const LEAD_COLS = 'id,client_name,contact_no,society_name,project_name,plot_no,plot_size,plot_amount,paid_amount,emi_amount,"broker\'s_name",broker_code,broker_name_clean,cancel_date,date_of_form,date';

export type LeadStatus = 'new' | 'contacted' | 'interested' | 'site_visit' | 'negotiation' | 'booked' | 'cancelled';

export interface LeadRecord extends MasterDataOfGurukrupa {
  lead_status: LeadStatus;
  lead_score: 'hot' | 'warm' | 'cold';
}

/**
 * Derive lead status from master data fields.
 * Cancelled → 'cancelled', paid_amount → 'booked', else → 'interested'
 */
function deriveLeadStatus(row: MasterDataOfGurukrupa): LeadStatus {
  if (row.cancel_date) return 'cancelled';
  if (row.paid_amount && parseFloat(row.paid_amount.replace(/[^0-9.]/g, '')) > 0) return 'booked';
  if (row.emi_amount && parseFloat(row.emi_amount.replace(/[^0-9.]/g, '')) > 0) return 'negotiation';
  if (row.plot_no) return 'interested';
  return 'new';
}

/**
 * Derive lead score from paid amount relative to plot amount.
 */
function deriveLeadScore(row: MasterDataOfGurukrupa): 'hot' | 'warm' | 'cold' {
  const paid = parseFloat(row.paid_amount?.replace(/[^0-9.]/g, '') || '0');
  const plot = parseFloat(row.plot_amount?.replace(/[^0-9.]/g, '') || '0');
  if (plot === 0) return 'cold';
  const ratio = paid / plot;
  if (ratio >= 0.5) return 'hot';
  if (ratio >= 0.15) return 'warm';
  return 'cold';
}

export async function getLeads({
  page = 1,
  pageSize = 25,
  search = '',
  societyFilter = '',
  statusFilter = '',
  order = 'desc',
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  societyFilter?: string;
  statusFilter?: string;
  order?: 'asc' | 'desc';
}): Promise<{ data: LeadRecord[]; count: number; error: Error | null }> {
  try {
    const supabase = createServiceClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const applyFilters = (q: any) => {
      if (search) {
        q = q.or(
          `client_name.ilike.%${search}%,contact_no.ilike.%${search}%,society_name.ilike.%${search}%,project_name.ilike.%${search}%,plot_no.ilike.%${search}%,"broker's_name".ilike.%${search}%,broker_code.ilike.%${search}%,ba_code.ilike.%${search}%,broker_name_clean.ilike.%${search}%`
        );
      }
      if (societyFilter) {
        q = q.eq('society_name', societyFilter);
      }
      if (statusFilter) {
        if (statusFilter === 'cancelled') {
          q = q.not('cancel_date', 'is', null);
        } else if (statusFilter === 'booked') {
          q = q.is('cancel_date', null).gt('paid_amount_num', 0);
        } else if (statusFilter === 'negotiation') {
          q = q.is('cancel_date', null).eq('paid_amount_num', 0).gt('emi_amount_num', 0);
        } else if (statusFilter === 'interested') {
          q = q.is('cancel_date', null).eq('paid_amount_num', 0).eq('emi_amount_num', 0).not('plot_no', 'is', null).neq('plot_no', '');
        } else if (statusFilter === 'new') {
          q = q.is('cancel_date', null).eq('paid_amount_num', 0).eq('emi_amount_num', 0).or('plot_no.is.null,plot_no.eq.');
        }
      }
      return q;
    };

    const countCacheKey = `count:leads:${search}|${societyFilter}|${statusFilter}`;
    const [{ data, error }, count] = await Promise.all([
      applyFilters(supabase.from(TABLE).select(LEAD_COLS))
        .order('id', { ascending: order === 'asc' })
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

    const leads = (data as MasterDataOfGurukrupa[]).map((row) => ({
      ...row,
      lead_status: deriveLeadStatus(row),
      lead_score: deriveLeadScore(row),
    }));

    return { data: leads, count: count || 0, error: null };
  } catch (err) {
    return { data: [], count: 0, error: err as Error };
  }
}

export async function getLeadById(id: number): Promise<{ data: LeadRecord | null; error: Error | null }> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { data: null, error: new Error(error.message) };

    const row = data as MasterDataOfGurukrupa;
    return {
      data: { ...row, lead_status: deriveLeadStatus(row), lead_score: deriveLeadScore(row) },
      error: null,
    };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export async function getLeadPipelineCounts(): Promise<{
  counts: Record<LeadStatus, number>;
  error: Error | null;
}> {
  try {
    const counts = await withServerCache('rpc:get_lead_pipeline_counts_rpc', async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase.rpc('get_lead_pipeline_counts_rpc');
      if (error || !data) throw new Error(error?.message || 'Empty pipeline counts');
      return data as Record<LeadStatus, number>;
    });
    return { counts, error: null };
  } catch (err) {
    return { counts: {} as Record<LeadStatus, number>, error: err as Error };
  }
}
