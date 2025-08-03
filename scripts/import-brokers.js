const fs = require('fs');
const { Pool } = require('pg');
const xlsx = require('xlsx');

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'indusun',
  password: '1234',
  port: 5432,
});

async function importBrokers() {
  let client;
  try {
    console.log('Starting broker import process...');
    
    // Read Excel file
    console.log('Reading Excel file...');
    const workbook = xlsx.readFile('./scripts/data/ALL BROKERS NAME.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Get the range of cells in the worksheet
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    const totalRows = range.e.r + 1; // +1 because it's 0-indexed
    
    console.log(`Excel file has ${totalRows} rows (including header if present)`);
    
    // Extract all data as an array of arrays
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    // Connect to database
    console.log('Connecting to database...');
    client = await pool.connect();
    
    // Get existing brokers to avoid duplicates
    console.log('Fetching existing brokers...');
    const existingBrokersResult = await client.query('SELECT name FROM brokers');
    const existingBrokers = new Set(
      existingBrokersResult.rows
        .filter(row => row.name) // Filter out null/undefined names
        .map(row => row.name.toLowerCase().trim())
    );
    
    console.log(`Found ${existingBrokers.size} existing brokers in database`);
    
    // Process broker names
    const brokerNames = new Set();
    
    // Extract all broker names from all columns
    console.log('Processing Excel data...');
    data.forEach((row, rowIndex) => {
      if (Array.isArray(row)) {
        row.forEach((cell, colIndex) => {
          if (cell && typeof cell === 'string' && cell.trim() !== '') {
            const cleanName = cell.trim();
            brokerNames.add(cleanName);
          }
        });
      }
    });
    
    console.log(`Found ${brokerNames.size} unique broker names in Excel file`);
    
    // Insert new brokers
    console.log('Inserting new brokers...');
    let newBrokersCount = 0;
    let skippedCount = 0;
    
    // Use a transaction for better performance and data integrity
    await client.query('BEGIN');
    
    for (const name of brokerNames) {
      // Skip if broker already exists
      if (existingBrokers.has(name.toLowerCase().trim())) {
        skippedCount++;
        continue;
      }
      
      try {
        // Insert new broker
        await client.query(
          'INSERT INTO brokers (name, created_at) VALUES ($1, NOW())',
          [name]
        );
        newBrokersCount++;
      } catch (err) {
        console.error(`Error inserting broker "${name}":`, err.message);
      }
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    
    console.log(`Import summary:`);
    console.log(`- Total unique broker names found: ${brokerNames.size}`);
    console.log(`- Skipped (already exist): ${skippedCount}`);
    console.log(`- Successfully imported: ${newBrokersCount}`);
    
  } catch (error) {
    console.error('Error importing brokers:', error);
    
    // Rollback transaction if there was an error
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
  } finally {
    // Release client
    if (client) {
      client.release();
    }
    
    // Close pool
    try {
      await pool.end();
    } catch (err) {
      console.error('Error closing pool:', err);
    }
    
    console.log('Import process completed.');
  }
}

// Run the import function
importBrokers();
