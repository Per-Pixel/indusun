const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkInstallmentsTable() {
    try {
        // Connect to the database
        const client = await pool.connect();
        console.log('Successfully connected to database');

        // Query to get column information for the installments table
        const columnsQuery = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'installments'
            ORDER BY ordinal_position;
        `;
        
        const columnsResult = await client.query(columnsQuery);
        console.log('Installments table columns:');
        console.table(columnsResult.rows);

        // Query to get a sample row from the installments table
        const sampleQuery = `
            SELECT * FROM installments LIMIT 1;
        `;
        
        const sampleResult = await client.query(sampleQuery);
        console.log('\nSample installment row:');
        console.log(sampleResult.rows[0]);

        client.release();
    } catch (error) {
        console.error('Error checking installments table:', error);
    } finally {
        // Close the pool
        pool.end();
    }
}

checkInstallmentsTable();
