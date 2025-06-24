import { Pool } from "pg";

// Create a database connection pool using the connection string directly
// In production, this should come from environment variables
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:1234@localhost:5432/indusun";

// Create a singleton pool instance
let _pool: Pool | null = null;

// Function to get the database pool with connection validation
export function getPool(): Pool {
    if (!_pool) {
        _pool = new Pool({ connectionString });
        
        // Add error handler to the pool
        _pool.on('error', (err) => {
            console.error('Unexpected error on idle client', err);
        });
    }
    return _pool;
}

// Export a function that wraps database queries with proper error handling
export async function executeQuery(query: string, params: any[] = []) {
    const client = await getPool().connect();
    try {
        return await client.query(query, params);
    } finally {
        client.release();
    }
}

// For backward compatibility
const pool = getPool();
export default pool;
