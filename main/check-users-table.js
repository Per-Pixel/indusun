// Check the actual users table structure
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'indusun',
  password: '1234',
  port: 5432,
});

async function checkUsersTable() {
  try {
    console.log('🔍 Checking users table structure...');
    
    const client = await pool.connect();
    
    // Check if users table exists and get its structure
    const tableInfo = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    if (tableInfo.rows.length > 0) {
      console.log('📋 Users table structure:');
      tableInfo.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      
      // Check current users
      const users = await client.query('SELECT * FROM users LIMIT 5');
      console.log(`\n👥 Current users: ${users.rows.length}`);
      if (users.rows.length > 0) {
        users.rows.forEach(user => {
          console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
        });
      }
    } else {
      console.log('❌ Users table does not exist');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkUsersTable();
