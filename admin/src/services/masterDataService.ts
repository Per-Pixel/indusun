// Service to interact with Supabase "Master Data Of Gurukrupa" table

import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa, MasterDataSummary } from '@/types/masterData';
import { parseAmount } from '@/utils/dataUtils';

// Table name with spaces needs special handling
const TABLE_NAME = 'Master Data Of Gurukrupa';

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

    console.log(`Fetching: page ${page}, pageSize ${pageSize}, range ${from}-${to}`);

    // Start building the query - explicitly set no limit to override any defaults
    let query = supabase
      .from(TABLE_NAME)
      .select('*', { count: 'exact' });

    // Backward-compatible single-field filter
    if (clientNameFilter) {
      query = query.ilike('client_name', `%${clientNameFilter}%`);
    }

    // Multi-field search across customer, contact, society, plot and broker
    const searchTerm = search || clientNameFilter;
    if (searchTerm) {
      query = query.or(
        `client_name.ilike.%${searchTerm}%,contact_no.ilike.%${searchTerm}%,society_name.ilike.%${searchTerm}%,plot_no.ilike.%${searchTerm}%,broker's_name.ilike.%${searchTerm}%`
      );
    }

    if (societyFilter) {
      query = query.eq('society_name', societyFilter);
    }

    if (brokerFilter) {
      query = query.eq("broker's_name", brokerFilter);
    }

    if (statusFilter) {
      if (statusFilter === 'active') {
        query = query
          .is('cancel_date', null)
          .not('paid_amount', 'is', null)
          .neq('paid_amount', '');
      } else if (statusFilter === 'prospect') {
        query = query
          .is('cancel_date', null)
          .or('paid_amount.is.null,paid_amount.eq.');
      } else if (statusFilter === 'cancelled') {
        query = query
          .not('cancel_date', 'is', null)
          .neq('cancel_date', '');
      } else if (statusFilter === 'installment') {
        query = query
          .is('cancel_date', null)
          .not('emi_amount', 'is', null)
          .neq('emi_amount', '');
      }
    }

    // Sorting
    const orderColumn = ['id', 'client_name'].includes(sortBy) ? sortBy : 'id';
    const ascending = sortOrder === 'desc' ? false : true;

    // Apply pagination and ordering - ensure no implicit limits
    const { data, error, count } = await query
      .order(orderColumn, { ascending })
      .range(from, to);

    if (error) {
      console.error('Error fetching paginated master data:', error);
      return { data: null, count: null, error: new Error(error.message) };
    }

    console.log(`Fetched ${data?.length || 0} records, total count: ${count}`);

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
 * Get unique broker names (for filtering) - optimized for large datasets
 */
export async function getUniqueBrokers(): Promise<{
  brokers: string[];
  error: Error | null;
}> {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .range(0, 9999);

    if (error) {
      console.error('Error fetching brokers:', error);
      return { brokers: [], error: new Error(error.message) };
    }

    const uniqueBrokers = Array.from(
      new Set(
        (data || [])
          .map((item: any) => item["broker's_name"])
          .filter((v: any) => v != null && String(v).trim() !== '')
      )
    ).sort() as string[];

    return { brokers: uniqueBrokers as string[], error: null };
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
 * Get summary statistics
 */
export async function getMasterDataSummary(): Promise<{
  summary: MasterDataSummary | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await getAllMasterData();

    if (error || !data) {
      return { summary: null, error };
    }

    // Calculate statistics
    const uniqueClients = new Set(data.map((item) => item.client_name).filter(Boolean));
    const uniqueSocieties = new Set(data.map((item) => item.society_name).filter(Boolean));
    const uniqueBrokers = new Set(data.map((item) => item["broker's_name"]).filter(Boolean));

    const totalPlotAmount = data.reduce((sum, item) => sum + parseAmount(item.plot_amount), 0);
    const totalPaidAmount = data.reduce((sum, item) => sum + parseAmount(item.paid_amount), 0);

    const listedProperties = data.filter((r) => !r.cancel_date).length;
    const soldProperties = data.filter((r) => r.paid_amount && !r.cancel_date).length;
    const cancelledProperties = data.filter((r) => !!r.cancel_date).length;

    // Count by society (top 8)
    const societyCounts: Record<string, number> = {};
    data.forEach((r) => {
      if (r.society_name) {
        societyCounts[r.society_name] = (societyCounts[r.society_name] || 0) + 1;
      }
    });
    const propertiesBySociety = Object.entries(societyCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({
        name: name.length > 12 ? name.substring(0, 12) + '…' : name,
        count,
      }));

    // Monthly listings from date_of_form / date / created_at
    const monthlyCounts: Record<string, number> = {};
    data.forEach((r) => {
      const raw = r.date_of_form ?? r.date ?? r.created_at;
      if (raw) {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
        }
      }
    });
    const monthlyListings = Object.entries(monthlyCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-8)
      .map(([key, count]) => ({
        month: new Date(key + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        count,
      }));

    const summary: MasterDataSummary = {
      totalRecords: data.length,
      totalClients: uniqueClients.size,
      uniqueSocieties: uniqueSocieties.size,
      uniqueBrokers: uniqueBrokers.size,
      totalPlotAmount,
      totalPaidAmount,
      listedProperties,
      soldProperties,
      cancelledProperties,
      propertiesBySociety,
      monthlyListings,
    };

    return { summary, error: null };
  } catch (err) {
    console.error('Unexpected error in getMasterDataSummary:', err);
    return { summary: null, error: err as Error };
  }
}

/**
 * Get unique society names (for filtering) - optimized for large datasets
 */
export async function getUniqueSocieties(): Promise<{
  societies: string[];
  error: Error | null;
}> {
  try {
    const supabase = createServiceClient();
    
    // Use a more efficient query to get unique societies without fetching all data
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('society_name')
      .not('society_name', 'is', null);

    if (error) {
      console.error('Error fetching societies:', error);
      return { societies: [], error: new Error(error.message) };
    }

    const uniqueSocieties = Array.from(
      new Set(data.map((item) => item.society_name).filter(Boolean))
    ).sort();

    return { societies: uniqueSocieties as string[], error: null };
  } catch (err) {
    console.error('Unexpected error in getUniqueSocieties:', err);
    return { societies: [], error: err as Error };
  }
}



