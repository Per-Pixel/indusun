// Test database connection
const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'indusun',
  password: '1234',
  port: 5432,
});

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL database');
    
    // Test if users table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log('📋 Users table exists:', tableCheck.rows[0].exists);
    
    if (tableCheck.rows[0].exists) {
      // Check users in table
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log('👥 Users in database:', userCount.rows[0].count);
      
      // Get all users
      const users = await client.query('SELECT id, name, email, role FROM users');
      console.log('📊 User details:');
      users.rows.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
      });
    } else {
      console.log('⚠️ Users table does not exist - needs to be created');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    console.error('Full error:', error);
  } finally {
    await pool.end();
  }
}

testDatabaseConnection();
