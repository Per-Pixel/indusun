import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    console.log('Setting up database tables...');
    
    // Create messages table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_name VARCHAR(255) NOT NULL,
        sender_email VARCHAR(255),
        sender_phone VARCHAR(50),
        subject VARCHAR(500),
        message_content TEXT NOT NULL,
        source VARCHAR(50) NOT NULL,
        source_page VARCHAR(255),
        status VARCHAR(20) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        read_at TIMESTAMP,
        replied_at TIMESTAMP,
        admin_notes TEXT
      )
    `);
    
    // Insert some sample data if the table is empty (for testing)
    const countResult = await pool.query('SELECT COUNT(*) FROM messages');
    
    if (parseInt(countResult.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO messages (sender_name, sender_email, sender_phone, subject, message_content, source, source_page) VALUES
        ('John Doe', 'john@example.com', '+1234567890', 'Property Inquiry', 'I am interested in your residential properties.', 'contact_page', '/contact'),
        ('Jane Smith', 'jane@example.com', '+0987654321', 'Commercial Property', 'Looking for commercial space in Mumbai.', 'about_page', '/about'),
        ('Bob Johnson', 'bob@example.com', '+1122334455', 'Investment Opportunity', 'Want to discuss investment opportunities.', 'contact_page', '/contact')
      `);
      console.log('Sample message data inserted');
    }
    
    // Check that the table was created successfully
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'messages'
    `);
    
    // Get the structure of the messages table
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'messages'
      ORDER BY ordinal_position
    `);
    
    // Get count of messages
    const messageCountResult = await pool.query('SELECT COUNT(*) FROM messages');
    
    return NextResponse.json({
      success: true,
      message: 'Database setup completed successfully',
      tables: tablesResult.rows.map((row: any) => row.table_name),
      messagesTableStructure: columnsResult.rows,
      messageCount: parseInt(messageCountResult.rows[0].count)
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
