import { Pool } from "pg";

// Log database configuration (without sensitive data)
// console.log('Database configuration:', {
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     port: Number(process.env.DB_PORT) || 5432,
    // Not logging password for security
// });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT) || 5432,
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
