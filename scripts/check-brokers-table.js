const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'indusun',
  password: '1234',
  port: 5432,
});

async function checkBrokersTable() {
  try {
    console.log('Checking brokers table structure...');
    
    const client = await pool.connect();
    
    // Query to get column information for the brokers table
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'brokers'
      ORDER BY ordinal_position;
    `;
    
    const columnsResult = await client.query(columnsQuery);
    console.log('Brokers table columns:');
    console.table(columnsResult.rows);

    // Query to get a sample row from the brokers table
    const sampleQuery = `
      SELECT * FROM brokers LIMIT 1;
    `;
    
    const sampleResult = await client.query(sampleQuery);
    console.log('\nSample broker row:');
    console.log(sampleResult.rows[0]);

    client.release();
  } catch (error) {
    console.error('Error checking brokers table:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

checkBrokersTable();
