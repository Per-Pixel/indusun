// Check what role enum values are allowed
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'indusun',
  password: '1234',
  port: 5432,
});

async function checkRoleEnum() {
  try {
    console.log('🔍 Checking role enum values...');
    
    const client = await pool.connect();
    
    // Check enum values for user_role
    const enumQuery = await client.query(`
      SELECT enumlabel 
      FROM pg_enum 
      WHERE enumtypid = (
        SELECT oid 
        FROM pg_type 
        WHERE typname = 'user_role'
      )
      ORDER BY enumsortorder;
    `);
    
    console.log('📋 Allowed role values:');
    enumQuery.rows.forEach(row => {
      console.log(`  - ${row.enumlabel}`);
    });
    
    // Also check the column definition
    const columnQuery = await client.query(`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role';
    `);
    
    console.log('\n📊 Role column info:');
    columnQuery.rows.forEach(row => {
      console.log(`  - Column: ${row.column_name}, Type: ${row.data_type}, UDT: ${row.udt_name}`);
    });
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkRoleEnum();
