import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';

// Schema for installment/transaction validation
const transactionSchema = z.object({
  payment_date: z.string().optional(), // date of payment, null means pending
  amount: z.number().optional(),
  receipt_number: z.string().optional(), // reference
  plot_id: z.number().optional(), // property ID
  // Derived fields (not directly in installments table but used in UI)
  description: z.string().optional(),
  status: z.enum(['Completed', 'Pending']).optional(),
  source: z.literal('Property Sale').optional() // All installments are property sales
});

// GET handler - retrieve a single transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }
    
    // Use raw SQL to fetch installment with client and plot details
    const query = `
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
      WHERE i.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Format transaction to include nested client object
    const row = result.rows[0];
    const transaction = {
      id: row.id,
      date: row.payment_date, // Using payment_date as date for frontend
      description: row.description,
      amount: row.amount,
      status: row.status,
      source: row.source,
      reference: row.receipt_number, // Using receipt_number as reference for frontend
      clientId: row.client_id,
      propertyId: row.plot_id,
      client: row.client_id ? {
        id: row.client_id,
        name: row.client_name,
        type: row.client_type
      } : null,
      // No broker for installments
      broker: null
    };
    
    // The transaction existence check is already done above
    
    return NextResponse.json(transaction);
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction' },
      { status: 500 }
    );
  }
}

// PUT handler - update a transaction by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }
    
    // Check if transaction exists using raw SQL
    const checkQuery = `SELECT id FROM transactions WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    
    // Validate request body
    const validatedData = transactionSchema.parse(body);
    
    // Build SET clause and values for SQL update
    const updateFields = [];
    const values = [];
    let paramCounter = 1;
    
    if (validatedData.payment_date !== undefined) {
      updateFields.push(`payment_date = $${paramCounter}`);
      values.push(validatedData.payment_date);
      paramCounter++;
    }
    
    if (validatedData.amount !== undefined) {
      updateFields.push(`amount = $${paramCounter}`);
      values.push(validatedData.amount);
      paramCounter++;
    }
    
    if (validatedData.receipt_number !== undefined) {
      updateFields.push(`receipt_number = $${paramCounter}`);
      values.push(validatedData.receipt_number);
      paramCounter++;
    }
    
    if (validatedData.plot_id !== undefined) {
      updateFields.push(`plot_id = $${paramCounter}`);
      values.push(validatedData.plot_id);
      paramCounter++;
    }
    
    // If no fields to update, return the existing transaction
    if (updateFields.length === 0) {
      const getQuery = `SELECT * FROM installments WHERE id = $1`;
      const getResult = await db.query(getQuery, [id]);
      return NextResponse.json(getResult.rows[0]);
    }
    
    // Update transaction in database using raw SQL
    const updateQuery = `
      UPDATE installments
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;
    
    values.push(id); // Add ID as the last parameter
    
    const result = await db.query(updateQuery, values);
    const updatedTransaction = result.rows[0];
    
    return NextResponse.json(updatedTransaction);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

// DELETE handler - delete a transaction by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }
    
    // Check if installment exists
    const checkQuery = `SELECT * FROM installments WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }
    
    // Delete installment
    const deleteQuery = `DELETE FROM installments WHERE id = $1`;
    await db.query(deleteQuery, [id]);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
