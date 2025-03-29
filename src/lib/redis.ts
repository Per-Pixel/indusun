import { createClient } from "redis";

// create redis client 
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
    // password: process.env.REDIS_PASSWORD || ''
})

redisClient.on('error', (err) => console.error('Redis Client Error', err))
redisClient.connect().catch(console.error)

// function to add token to blacklist
export async function blacklistToken(jti: string, exp: number) {
    const ttl = exp - Math.floor(Date.now()/1000) //calculate ttl in seconds
    if (ttl > 0) {
        await redisClient.set(`blacklist:${jti}`, 'true', { EX: ttl })
    }
}

// function to check if token is blacklisted
export async function isTokenBlacklisted(jti: string): Promise<boolean> {
    const result = await redisClient.get(`blacklist:${jti}`);
    return result !== null;
}

export default redisClient;
