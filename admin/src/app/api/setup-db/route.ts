import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    console.log('Setting up database tables...');
    
    // Create clients table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        normalized_name VARCHAR(255) NOT NULL,
        contact_number VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert some sample data if the table is empty
    const countResult = await pool.query('SELECT COUNT(*) FROM clients');
    
    if (parseInt(countResult.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO clients (full_name, normalized_name, contact_number) VALUES
        ('John Smith', 'John Smith', '+1 555-123-4567'),
        ('Mary Johnson', 'Mary Johnson', '+1 555-234-5678'),
        ('Robert Williams', 'Robert Williams', '+1 555-345-6789'),
        ('Sarah Davis', 'Sarah Davis', '+1 555-456-7890'),
        ('Michael Brown', 'Michael Brown', '+1 555-567-8901')
      `);
      console.log('Sample client data inserted');
    }
    
    // Check that the table was created successfully
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows.map((row: any) => row.table_name);
    
    // Get the structure of the clients table
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clients'
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      tables,
      clientsStructure: columnsResult.rows
    });
  } catch (error: any) {
    console.error('Database setup failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database setup failed',
      error: error.message
    }, { status: 500 });
  }
}
