import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  // Get pagination and filtering parameters
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '25', 10);
  const offset = (page - 1) * limit;
  const searchTerm = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'All';
  const source = searchParams.get('source') || 'All';
  try {
    // Get summary metrics
    const summaryResult = await db.query(`
      SELECT
        SUM(amount) AS total_revenue,
        COUNT(*) AS total_transactions
      FROM 
        installments 
      WHERE 
        payment_date IS NOT NULL
    `);
    
    // Get billing trends (revenue by month)
    const trendsResult = await db.query(`
      SELECT
        TO_CHAR(payment_date, 'Mon') AS name,
        EXTRACT(MONTH FROM payment_date) AS month_num,
        EXTRACT(YEAR FROM payment_date) AS year,
        COALESCE(SUM(amount), 0)::NUMERIC AS value
      FROM
        installments
      WHERE
        payment_date IS NOT NULL
        AND amount IS NOT NULL
      GROUP BY
        TO_CHAR(payment_date, 'Mon'),
        EXTRACT(MONTH FROM payment_date),
        EXTRACT(YEAR FROM payment_date)
      ORDER BY
        year, month_num
      LIMIT 12
    `);

    // Transform trends data to ensure proper format
    const formattedTrends = trendsResult.rows.map(row => {
      const value = row.value;
      const numericValue = typeof value === 'string' ? parseFloat(value) : (typeof value === 'number' ? value : 0);
      return {
        name: row.name || 'Unknown',
        value: isNaN(numericValue) ? 0 : numericValue
      };
    });

    console.log('Raw trends data from DB:', trendsResult.rows);
    console.log('Formatted trends data:', formattedTrends);

    // If no trends data, provide some default structure
    const finalTrends = formattedTrends.length > 0 ? formattedTrends : [
      { name: 'Jan', value: 0 },
      { name: 'Feb', value: 0 },
      { name: 'Mar', value: 0 },
      { name: 'Apr', value: 0 },
      { name: 'May', value: 0 },
      { name: 'Jun', value: 0 }
    ];
    
    // Build the WHERE clause for filtering
    let whereConditions = [];
    let queryParams = [];
    let paramCounter = 1;
    
    // Add search term filter if provided
    if (searchTerm) {
      whereConditions.push(`(
        LOWER(p.plot_number::text) LIKE LOWER($${paramCounter}) OR 
        LOWER(i.receipt_number) LIKE LOWER($${paramCounter + 1}) OR
        LOWER(c.full_name) LIKE LOWER($${paramCounter + 2})
      )`);
      const searchPattern = `%${searchTerm}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
      paramCounter += 3;
    }
    
    // Add status filter if provided
    if (status && status !== 'All') {
      if (status === 'Completed') {
        whereConditions.push('i.payment_date IS NOT NULL');
      } else if (status === 'Pending') {
        whereConditions.push('i.payment_date IS NULL');
      }
    }
    
    // Construct the final WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get paginated transactions
    const transactionsResult = await db.query({
      text: `
        SELECT 
          i.id,
          i.payment_date AS date,
          CONCAT('Payment for Plot ', p.plot_number) AS description,
          i.amount,
          CASE WHEN i.payment_date IS NOT NULL THEN 'Completed' ELSE 'Pending' END AS status,
          'Property Sale' AS source,
          i.receipt_number AS reference,
          c.full_name AS client_name,
          'Individual' AS client_type
        FROM 
          installments i
        JOIN 
          plots p ON i.plot_id = p.id
        JOIN 
          clients c ON p.client_id = c.id
        ${whereClause}
        ORDER BY 
          i.payment_date DESC NULLS LAST,
          i.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `,
      values: queryParams
    });
    
    // Get total count for pagination (with the same filters)
    const countResult = await db.query({
      text: `
        SELECT COUNT(*) AS total
        FROM installments i
        JOIN plots p ON i.plot_id = p.id
        JOIN clients c ON p.client_id = c.id
        ${whereClause}
      `,
      values: queryParams
    });

    // Get pending payments
    const pendingPaymentsResult = await db.query(`
      SELECT
        SUM(amount) AS pending_amount
      FROM 
        installments 
      WHERE 
        payment_date IS NULL
    `);
    
    
    // Format the transactions data to match the expected structure
    const formattedTransactions = transactionsResult.rows.map(transaction => ({
      id: transaction.id,
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : null,
      description: transaction.description,
      amount: `₹${formatAmount(transaction.amount)}`,
      status: transaction.status,
      source: transaction.source,
      reference: transaction.reference,
      client: {
        name: transaction.client_name,
        type: transaction.client_type
      }
    }));
    
    // Calculate total pages
    const totalItems = parseInt(countResult.rows[0]?.total || '0', 10);
    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      summary: {
        totalRevenue: summaryResult.rows[0]?.total_revenue || 0,
        totalTransactions: summaryResult.rows[0]?.total_transactions || 0,
        pendingPayments: pendingPaymentsResult.rows[0]?.pending_amount || 0
      },
      trends: finalTrends,
      transactions: formattedTransactions,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch billing data' },
      { status: 500 }
    );
  }
}

// Helper function to format amount in Indian currency format
function formatAmount(amount: number): string {
  if (amount >= 10000000) { // 1 crore or more
    return `${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) { // 1 lakh or more
    return `${(amount / 100000).toFixed(2)} Lakhs`;
  } else {
    return amount.toLocaleString('en-IN');
  }
}
