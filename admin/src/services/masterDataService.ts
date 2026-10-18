// Service to interact with Supabase "Master Data Of Gurukrupa" table

import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa, MasterDataSummary } from '@/types/masterData';
import { parseAmount } from '@/utils/dataUtils';
import { withServerCache } from '@/utils/serverCache';

// Table name with spaces needs special handling
const TABLE_NAME = 'Master Data Of Gurukrupa';
const LIST_COLS = 'id,client_name,contact_no,society_name,project_name,block_name,plot_no,plot_size,plot_amount,paid_amount,emi_amount,emi_no,emi_time,r_no,"broker\'s_name",broker_code,broker_name_clean,cancel_date,emi_paid_date,date_of_form,date,remarks';

/**
 * Fetch paginated records from Master Data Of Gurukrupa table with filtering
 */
export async function getPaginatedMasterData({
  page = 1,
  pageSize = 50,
  clientNameFilter = '',
  search = '',
  societyFilter = '',
  brokerFilter = '',
  statusFilter = '',
  sortBy = 'id',
  sortOrder = 'asc',
}: {
  page?: number;
  pageSize?: number;
  clientNameFilter?: string;
  search?: string;
  societyFilter?: string;
  brokerFilter?: string;
  statusFilter?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<{
  data: MasterDataOfGurukrupa[] | null;
  count: number | null;
  error: Error | null;
}> {
  try {
    const supabase = createServiceClient();

    // Calculate range for pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const searchTerm = (search || clientNameFilter).trim();
    const applyFilters = (q: any) => {
      if (searchTerm) {
        q = q.or(
          `client_name.ilike.%${searchTerm}%,contact_no.ilike.%${searchTerm}%,society_name.ilike.%${searchTerm}%,project_name.ilike.%${searchTerm}%,plot_no.ilike.%${searchTerm}%,"broker's_name".ilike.%${searchTerm}%,broker_code.ilike.%${searchTerm}%,broker_name_clean.ilike.%${searchTerm}%,r_no.ilike.%${searchTerm}%`
        );
      }
      if (societyFilter) {
        q = q.eq('society_name', societyFilter);
      }
      if (brokerFilter) {
        q = q.eq("broker's_name", brokerFilter);
      }
      if (statusFilter) {
        if (statusFilter === 'active') {
          q = q.is('cancel_date', null).not('paid_amount', 'is', null).neq('paid_amount', '');
        } else if (statusFilter === 'prospect') {
          q = q.is('cancel_date', null).or('paid_amount.is.null,paid_amount.eq.');
        } else if (statusFilter === 'cancelled') {
          q = q.not('cancel_date', 'is', null).neq('cancel_date', '');
        } else if (statusFilter === 'installment') {
          q = q.is('cancel_date', null).not('emi_amount', 'is', null).neq('emi_amount', '');
        }
      }
      return q;
    };

    // Sorting
    const orderColumn = ['id', 'client_name'].includes(sortBy) ? sortBy : 'id';
    const ascending = sortOrder === 'desc' ? false : true;
    const countCacheKey = `count:master:${searchTerm}|${societyFilter}|${brokerFilter}|${statusFilter}`;

    const [{ data, error }, count] = await Promise.all([
      applyFilters(supabase.from(TABLE_NAME).select(LIST_COLS))
        .order(orderColumn, { ascending })
        .range(from, to),
      withServerCache(countCacheKey, async () => {
        const { count: c, error: cErr } = await applyFilters(
          supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true })
        );
        if (cErr) throw new Error(cErr.message);
        return c || 0;
      }),
    ]);

    if (error) {
      console.error('Error fetching paginated master data:', error);
      return { data: null, count: null, error: new Error(error.message) };
    }

    return {
      data: data as MasterDataOfGurukrupa[],
      count: count || 0,
      error: null,
    };
  } catch (err) {
    console.error('Unexpected error in getPaginatedMasterData:', err);
    return { data: null, count: null, error: err as Error };
  }
}

/**
 * Fetch all records from Master Data Of Gurukrupa table (legacy function)
 */
export async function getAllMasterData(): Promise<{
  data: MasterDataOfGurukrupa[] | null;
  error: Error | null;
}> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching master data:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as MasterDataOfGurukrupa[], error: null };
  } catch (err) {
    console.error('Unexpected error in getAllMasterData:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get unique broker names (for filtering) - optimized via server-side Postgres RPC
 */
export async function getUniqueBrokers(): Promise<{
  brokers: string[];
  error: Error | null;
}> {
  try {
    const data = await withServerCache('rpc:get_unique_brokers_rpc', async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase.rpc('get_unique_brokers_rpc');
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? (data as string[]) : [];
    });
    return { brokers: data, error: null };
  } catch (err) {
    console.error('Unexpected error in getUniqueBrokers:', err);
    return { brokers: [], error: err as Error };
  }
}

/**
 * Get all records matching a client name (used to show a customer's property portfolio)
 */
export async function getMasterDataByClientName(
  clientName: string
): Promise<{ data: MasterDataOfGurukrupa[] | null; error: Error | null }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .ilike('client_name', clientName)
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching master data by client name:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as MasterDataOfGurukrupa[], error: null };
  } catch (err) {
    console.error('Unexpected error in getMasterDataByClientName:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get a single record by ID
 */
export async function getMasterDataById(
  id: number
): Promise<{ data: MasterDataOfGurukrupa | null; error: Error | null }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching master data by ID:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as MasterDataOfGurukrupa, error: null };
  } catch (err) {
    console.error('Unexpected error in getMasterDataById:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Search records by client name
 */
export async function searchByClientName(
  searchTerm: string
): Promise<{ data: MasterDataOfGurukrupa[] | null; error: Error | null }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .ilike('client_name', `%${searchTerm}%`)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error searching master data:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as MasterDataOfGurukrupa[], error: null };
  } catch (err) {
    console.error('Unexpected error in searchByClientName:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get records by society name
 */
export async function getBySociety(
  societyName: string
): Promise<{ data: MasterDataOfGurukrupa[] | null; error: Error | null }> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('society_name', societyName)
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching by society:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as MasterDataOfGurukrupa[], error: null };
  } catch (err) {
    console.error('Unexpected error in getBySociety:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Get summary statistics via fast Postgres RPC across all 90,352 rows
 */
export async function getMasterDataSummary(): Promise<{
  summary: MasterDataSummary | null;
  error: Error | null;
}> {
  try {
    const summary = await withServerCache('rpc:get_master_data_summary_rpc', async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase.rpc('get_master_data_summary_rpc');
      if (error || !data) throw new Error(error?.message || 'Empty summary');
      return data as MasterDataSummary;
    });
    return { summary, error: null };
  } catch (err) {
    console.error('Unexpected error in getMasterDataSummary:', err);
    return { summary: null, error: err as Error };
  }
}

/**
 * Get unique society names (for filtering) - optimized via server-side Postgres RPC
 */
export async function getUniqueSocieties(): Promise<{
  societies: string[];
  error: Error | null;
}> {
  try {
    const societies = await withServerCache('rpc:get_unique_societies_rpc', async () => {
      const supabase = createServiceClient();
      const { data, error } = await supabase.rpc('get_unique_societies_rpc');
      if (error) throw new Error(error.message);
      return Array.isArray(data) ? (data as string[]) : [];
    });
    return { societies, error: null };
  } catch (err) {
    console.error('Unexpected error in getUniqueSocieties:', err);
    return { societies: [], error: err as Error };
  }
}



