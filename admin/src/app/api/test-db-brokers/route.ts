import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check if the brokers table exists
    const tableCheckResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'brokers'
      );
    `);
    
    const brokersTableExists = tableCheckResult.rows[0].exists;
    
    // If the table exists, get its structure and sample data
    let tableInfo = null;
    let sampleData = null;
    
    if (brokersTableExists) {
      // Get table structure
      const tableStructureResult = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'brokers';
      `);
      
      tableInfo = tableStructureResult.rows;
      
      // Get sample data (first 5 rows)
      const sampleDataResult = await pool.query(`
        SELECT * FROM brokers LIMIT 5;
      `);
      
      sampleData = sampleDataResult.rows;
    }
    
    // Check if there's a table with a similar name (in case of typo)
    const similarTablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%broker%';
    `);
    
    const similarTables = similarTablesResult.rows;
    
    return NextResponse.json({
      brokersTableExists,
      tableInfo,
      sampleData,
      similarTables
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ error: 'Database test failed', details: error }, { status: 500 });
  }
}
