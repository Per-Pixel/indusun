import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

// Schema for installment/transaction validation
const transactionSchema = z.object({
  payment_date: z.string().optional(), // date of payment, null means pending
  amount: z.number(),
  receipt_number: z.string().optional(), // reference
  plot_id: z.number(), // property ID
  // Derived fields (not directly in installments table but used in UI)
  description: z.string().optional(),
  status: z.enum(['Completed', 'Pending']).optional(),
  source: z.literal('Property Sale').optional() // All installments are property sales
});

// GET handler - retrieve transactions with pagination, filtering, and sorting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Parse filter parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const source = searchParams.get('source') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const brokerId = searchParams.get('brokerId') || '';
    
    // Parse sort parameters
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Build SQL query with conditions
    let whereConditions = [];
    let queryParams: any[] = [];
    let paramCounter = 1;
    
    if (search) {
      whereConditions.push(`(CONCAT('Payment for Plot ', p.plot_number) ILIKE $${paramCounter} OR i.receipt_number ILIKE $${paramCounter})`);
      queryParams.push(`%${search}%`);
      paramCounter++;
    }
    
    if (status && status !== 'All') {
      if (status === 'Completed') {
        whereConditions.push(`i.payment_date IS NOT NULL`);
      } else if (status === 'Pending') {
        whereConditions.push(`i.payment_date IS NULL`);
      }
    }
    
    // All installments are property sales, so we don't need to filter by source
    
    if (startDate) {
      whereConditions.push(`i.payment_date >= $${paramCounter}`);
      queryParams.push(startDate);
      paramCounter++;
    }
    
    if (endDate) {
      whereConditions.push(`i.payment_date <= $${paramCounter}`);
      queryParams.push(endDate);
      paramCounter++;
    }
    
    // Installments don't have direct broker association, so we skip broker filtering
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Execute query to get transactions from installments table
    const sortField = sortBy === 'date' ? 'i.payment_date' : 
                      sortBy === 'amount' ? 'i.amount' : 
                      sortBy === 'reference' ? 'i.receipt_number' : 
                      'i.payment_date';
    
    const transactionQuery = `
      SELECT 
        i.id,
        i.payment_date,
        CONCAT('Payment for Plot ', p.plot_number) AS description,
        i.amount,
        CASE WHEN i.payment_date IS NOT NULL THEN 'Completed' ELSE 'Pending' END AS status,
        'Property Sale' AS source,
        i.receipt_number AS reference,
        c.id as client_id,
        c.full_name as client_name,
        'Individual' as client_type,
        p.id as plot_id
      FROM installments i
      JOIN plots p ON i.plot_id = p.id
      JOIN clients c ON p.client_id = c.id
      ${whereClause}
      ORDER BY ${sortField} ${sortOrder} NULLS LAST, i.created_at DESC
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;
    
    const transactionResult = await db.query(transactionQuery, [...queryParams, limit, offset]);
    
    // Format transactions to match the expected structure in the frontend
    const transactions = transactionResult.rows.map(row => ({
      id: row.id,
      date: row.payment_date,
      description: row.description,
      amount: row.amount,
      status: row.status,
      source: row.source,
      reference: row.reference,
      clientId: row.client_id,
      propertyId: row.plot_id,
      client: row.client_id ? {
        id: row.client_id,
        name: row.client_name,
        type: row.client_type
      } : null,
      // No broker for installments
      broker: null
    }));
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM installments i
      JOIN plots p ON i.plot_id = p.id
      JOIN clients c ON p.client_id = c.id
      ${whereClause}
    `;
    
    const countResult = await db.query(countQuery, queryParams);
    const totalItems = parseInt(countResult.rows[0].total);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalItems / limit);
    
    // Since installments don't have brokers, we'll just return an empty array
    const brokers: { id: number; name: string }[] = [];
    
    return NextResponse.json({
      transactions,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        itemsPerPage: limit
      },
      filterOptions: {
        brokers
      }
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

// POST handler - create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = transactionSchema.parse(body);
    
    // Create installment in database using raw SQL
    const query = `
      INSERT INTO installments (
        payment_date, amount, receipt_number, plot_id
      ) VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [
      validatedData.payment_date || null,
      validatedData.amount,
      validatedData.receipt_number || null,
      validatedData.plot_id
    ];
    
    const result = await db.query(query, values);
    const transaction = result.rows[0];
    
    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
