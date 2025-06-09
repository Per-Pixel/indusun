import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test the connection with a simple query
    const result = await pool.query('SELECT NOW() as current_time');
    
    // Get detailed information about the clients table
    const clientsColumnsResult = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'clients'
      ORDER BY ordinal_position
    `);
    
    // Get sample data from the clients table
    const clientsSampleResult = await pool.query(`
      SELECT * FROM clients LIMIT 5
    `);
    
    console.log('Sample client data:', JSON.stringify(clientsSampleResult.rows, null, 2));
    
    // Get count of clients
    const clientsCountResult = await pool.query(`
      SELECT COUNT(*) as count FROM clients
    `);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      currentTime: result.rows[0].current_time,
      clientsTableStructure: clientsColumnsResult.rows,
      clientsSampleData: clientsSampleResult.rows,
      clientsCount: clientsCountResult.rows[0].count
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    }, { status: 500 });
  }
}
