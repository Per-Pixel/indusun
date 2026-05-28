// Service to interact with Supabase "Master Data Of Gurukrupa" table

import { createServiceClient } from '@/utils/supabase/service';
import { MasterDataOfGurukrupa, MasterDataSummary } from '@/types/masterData';

// Table name with spaces needs special handling
const TABLE_NAME = 'Master Data Of Gurukrupa';

/**
 * Fetch paginated records from Master Data Of Gurukrupa table with filtering
 */
export async function getPaginatedMasterData({
  page = 1,
  pageSize = 50,
  clientNameFilter = '',
  societyFilter = '',
}: {
  page?: number;
  pageSize?: number;
  clientNameFilter?: string;
  societyFilter?: string;
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

    // Apply filters if provided
    if (clientNameFilter) {
      query = query.ilike('client_name', `%${clientNameFilter}%`);
    }

    if (societyFilter) {
      query = query.eq('society_name', societyFilter);
    }

    // Apply pagination and ordering - ensure no implicit limits
    const { data, error, count } = await query
      .order('id', { ascending: true })
      .range(from, to);

    if (error) {
      console.error('Error fetching paginated master data:', error);
      return { data: null, count: null, error: new Error(error.message) };
    }

    console.log(`Fetched ${data?.length || 0} records, total count: ${count}`);

    return { 
      data: data as MasterDataOfGurukrupa[], 
      count: count || 0, 
      error: null 
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

    // Parse amounts (remove currency symbols and convert to number)
    const parseAmount = (amount: string | null): number => {
      if (!amount) return 0;
      const cleaned = amount.replace(/[^0-9.]/g, '');
      return parseFloat(cleaned) || 0;
    };

    const totalPlotAmount = data.reduce((sum, item) => sum + parseAmount(item.plot_amount), 0);
    const totalPaidAmount = data.reduce((sum, item) => sum + parseAmount(item.paid_amount), 0);

    const summary: MasterDataSummary = {
      totalRecords: data.length,
      totalClients: uniqueClients.size,
      uniqueSocieties: uniqueSocieties.size,
      uniqueBrokers: uniqueBrokers.size,
      totalPlotAmount,
      totalPaidAmount,
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

    console.log(`Found ${uniqueSocieties.length} unique societies`);

    return { societies: uniqueSocieties as string[], error: null };
  } catch (err) {
    console.error('Unexpected error in getUniqueSocieties:', err);
    return { societies: [], error: err as Error };
  }
}
