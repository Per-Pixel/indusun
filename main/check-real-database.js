// Check what's actually in the real database
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'indusun',
  password: '1234',
  port: 5432,
});

async function checkRealDatabase() {
  try {
    console.log('🔍 Checking real database structure...');
    
    const client = await pool.connect();
    
    // Check all tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tables in database:');
    tables.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // Check clients table if it exists
    const clientsExist = tables.rows.some(table => table.table_name === 'clients');
    if (clientsExist) {
      const clientCount = await client.query('SELECT COUNT(*) FROM clients');
      console.log(`\n👥 Clients in database: ${clientCount.rows[0].count}`);
      
      // Get sample clients
      const sampleClients = await client.query('SELECT * FROM clients LIMIT 5');
      console.log('📊 Sample clients:');
      sampleClients.rows.forEach(client => {
        console.log(`  - ${client.full_name} (${client.contact_number})`);
      });
    }
    
    // Check users table
    const usersExist = tables.rows.some(table => table.table_name === 'users');
    if (usersExist) {
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`\n🔐 Users in database: ${userCount.rows[0].count}`);
      
      if (userCount.rows[0].count > 0) {
        const users = await client.query('SELECT id, name, email, role FROM users LIMIT 10');
        console.log('📊 Users:');
        users.rows.forEach(user => {
          console.log(`  - ${user.name} (${user.email}) - Role: ${user.role}`);
        });
      }
    } else {
      console.log('\n⚠️ Users table does not exist - authentication not set up');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRealDatabase();
