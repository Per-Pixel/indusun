const { Pool } = require('pg');

// Create a database connection pool using the connection string directly
const connectionString = "postgresql://postgres:1234@localhost:5432/indusun";

const pool = new Pool({
    connectionString,
});

async function checkBrokersTable() {
    try {
        // Connect to the database
        const client = await pool.connect();
        console.log('Successfully connected to database');

        // Query to get column information for the brokers table
        const columnsQuery = `
            SELECT column_name, data_type 
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
