import { createClient } from "redis";

// create redis client 
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    // Uncomment and set if your Redis requires authentication
    // password: process.env.REDIS_PASSWORD
});

redisClient.on('error', (err) => {
    console.error('Redis Client Connection Error:', err);
    // Optionally, you can add more sophisticated error handling here
    // For example, retry connection or notify monitoring system
});

// Async function to connect with retry logic
async function connectRedisWithRetry(maxRetries = 3) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await redisClient.connect();
            console.log('Redis connected successfully');
            return;
        } catch (err) {
            retries++;
            console.error(`Redis connection attempt ${retries} failed:`, err);
            await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
        }
    }
    throw new Error('Could not connect to Redis after multiple attempts');
}

// Connect to Redis on module load
connectRedisWithRetry().catch(console.error);

// function to add token to blacklist
export async function blacklistToken(jti: string, exp: number) {
    const ttl = exp - Math.floor(Date.now()/1000) //calculate ttl in seconds
    if (ttl > 0) {
        try {
            await redisClient.set(`blacklist:${jti}`, 'true', { EX: ttl });
            console.log(`Token ${jti} blacklisted successfully`);
        } catch (error) {
            console.error('Error blacklisting token:', error);
        }
    }
}

// function to check if token is blacklisted
export async function isTokenBlacklisted(jti: string): Promise<boolean> {
    try {
        const result = await redisClient.get(`blacklist:${jti}`);
        return result !== null;
    } catch (error) {
        console.error('Error checking token blacklist:', error);
        return false; // Default to not blacklisted in case of error
    }
}

export default redisClient;
