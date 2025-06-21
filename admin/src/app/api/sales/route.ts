import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyToken } from '@/lib/jwt-utils';

// Define the type for filters
interface SalesFilters {
  startDate?: string;
  endDate?: string;
  brokerId?: number;
  clientId?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

export async function GET(request: NextRequest) {
  try {
    // DEVELOPMENT MODE: Authentication bypass
    // TODO: Remove this bypass in production and implement proper authentication
    console.log('Authentication bypassed for development');
    
    // For reference, this is the original authentication code:
    /*
    // Check if user is authenticated using JWT token
    const adminToken = request.cookies.get('admin_token')?.value;
    
    if (!adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized access - No token provided' },
        { status: 401 }
      );
    }
    
    // Verify the admin token
    const user = await verifyToken(adminToken);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access - Invalid token' },
        { status: 401 }
      );
    }
    */

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: SalesFilters = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      brokerId: searchParams.get('brokerId') ? parseInt(searchParams.get('brokerId') as string) : undefined,
      clientId: searchParams.get('clientId') ? parseInt(searchParams.get('clientId') as string) : undefined,
      sortBy: searchParams.get('sortBy') || 'payment_date',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit') as string) : 100,
    };

    // Build the SQL query based on filters
    let query = `
      SELECT 
        DATE(i.payment_date) as date,
        SUM(i.amount) as total_amount,
        COUNT(i.id) as transaction_count
      FROM 
        installments i
      LEFT JOIN
        plots p ON i.plot_id = p.id
      LEFT JOIN
        clients c ON p.client_id = c.id
      LEFT JOIN
        brokers b ON i.broker_id = b.id
      WHERE 
        i.payment_date IS NOT NULL
    `;

    const queryParams: any[] = [];
    
    // Add filters to query
    if (filters.startDate) {
      query += ` AND i.payment_date >= $${queryParams.length + 1}`;
      queryParams.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ` AND i.payment_date <= $${queryParams.length + 1}`;
      queryParams.push(filters.endDate);
    }
    
    if (filters.brokerId) {
      query += ` AND i.broker_id = $${queryParams.length + 1}`;
      queryParams.push(filters.brokerId);
    }
    
    if (filters.clientId) {
      query += ` AND p.client_id = $${queryParams.length + 1}`;
      queryParams.push(filters.clientId);
    }
    
    // Group by date
    query += ` GROUP BY DATE(i.payment_date)`;
    
    // Add sorting with validation
    // Validate sortBy to prevent SQL injection
    const validSortColumns = ['date', 'total_amount', 'transaction_count'];
    const sortColumn = validSortColumns.includes(filters.sortBy || '') ? filters.sortBy : 'date';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortColumn} ${sortOrder}`;
    
    // Add limit
    query += ` LIMIT $${queryParams.length + 1}`;
    queryParams.push(filters.limit);

    // Execute the query with specific error handling
    let result;
    try {
      console.log('Executing sales query:', query);
      console.log('Query parameters:', queryParams);
      result = await db.query(query, queryParams);
      console.log('Sales query successful, returned rows:', result.rows.length);
    } catch (queryError) {
      console.error('Error executing sales query:', queryError);
      if (queryError instanceof Error) {
        console.error('Query error message:', queryError.message);
        console.error('Query error stack:', queryError.stack);
      }
      throw new Error(`Sales query failed: ${queryError instanceof Error ? queryError.message : String(queryError)}`);
    }
    
    // Get broker list for filters with specific error handling
    let brokers;
    try {
      console.log('Fetching broker list');
      brokers = await db.query(`
        SELECT id, full_name as name FROM brokers ORDER BY full_name
      `);
      console.log('Broker query successful, returned brokers:', brokers.rows.length);
    } catch (brokerError) {
      console.error('Error fetching brokers:', brokerError);
      if (brokerError instanceof Error) {
        console.error('Broker error message:', brokerError.message);
        console.error('Broker error stack:', brokerError.stack);
      }
      throw new Error(`Broker query failed: ${brokerError instanceof Error ? brokerError.message : String(brokerError)}`);
    }
    
    // Return the sales data and filter options
    return NextResponse.json({
      sales: result.rows,
      filterOptions: {
        brokers: brokers.rows
      }
    });

  } catch (error) {
    console.error('Error fetching sales data:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Log query details for debugging
    console.error('Query parameters:', request.nextUrl.searchParams.toString());
    
    return NextResponse.json(
      { error: 'Failed to fetch sales data', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
