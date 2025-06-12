import { Pool } from "pg";

// Create a database connection pool using the same connection string as admin
const connectionString = "postgresql://postgres:1234@localhost:5432/indusun";

const pool = new Pool({
    connectionString,
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
        return;
    }
    console.log('Successfully connected to database');
    release();
});

export default pool;
