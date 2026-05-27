import { Pool } from "pg";

// Read from env so the same code works in dev and prod.
// Override by setting DATABASE_URL in main/.env.local.
const connectionString =
    process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/indusun";

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
