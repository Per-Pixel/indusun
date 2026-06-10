/**
 * Lead Management Service
 * Reads from the "Master Data Of Gurukrupa" Supabase table.
 * Treats each unique client as a lead record.
 */

import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa } from '@/types/masterData';

const TABLE = 'Master Data Of Gurukrupa';

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
}: {
  page?: number;
  pageSize?: number;
  search?: string;
  societyFilter?: string;
  statusFilter?: string;
}): Promise<{ data: LeadRecord[]; count: number; error: Error | null }> {
  try {
    const supabase = createServiceClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`client_name.ilike.%${search}%,contact_no.ilike.%${search}%`);
    }
    if (societyFilter) {
      query = query.eq('society_name', societyFilter);
    }

    const { data, count, error } = await query
      .order('id', { ascending: false })
      .range(from, to);

    if (error) return { data: [], count: 0, error: new Error(error.message) };

    let leads = (data as MasterDataOfGurukrupa[]).map((row) => ({
      ...row,
      lead_status: deriveLeadStatus(row),
      lead_score: deriveLeadScore(row),
    }));

    // Client-side status filter (since status is derived, not a DB column)
    if (statusFilter) {
      leads = leads.filter((l) => l.lead_status === statusFilter);
    }

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
    const supabase = createServiceClient();
    const { data, error } = await supabase.from(TABLE).select('cancel_date,paid_amount,emi_amount,plot_no');
    if (error) return { counts: {} as Record<LeadStatus, number>, error: new Error(error.message) };

    const counts: Record<LeadStatus, number> = {
      new: 0, contacted: 0, interested: 0, site_visit: 0,
      negotiation: 0, booked: 0, cancelled: 0,
    };
    (data as Partial<MasterDataOfGurukrupa>[]).forEach((row) => {
      const status = deriveLeadStatus(row as MasterDataOfGurukrupa);
      counts[status]++;
    });

    return { counts, error: null };
  } catch (err) {
    return { counts: {} as Record<LeadStatus, number>, error: err as Error };
  }
}
