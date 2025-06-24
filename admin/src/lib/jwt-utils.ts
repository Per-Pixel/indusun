const jwt = require("jsonwebtoken");
import { v4 as uuidv4 } from "uuid";

// Define JWT payload type with role
export interface JWTPayload {
    id: string;
    email: string;
    name: string;
    role: 'customer' | 'broker' | 'admin'
    jti?: string;
}

// Generate JWT token with role and unique identifier
export function generateToken(
    payload: Omit<JWTPayload, 'jti'>,
    expiresIn: string = '1h'
): string {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing")
    }

    const jti = uuidv4();

    return jwt.sign(
        { ...payload, jti},
        process.env.JWT_SECRET as string,
        { expiresIn }
    )
}

// Verify JWT token (simplified for development without Redis)
export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing")
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload

        // For development, we skip blacklist checking since we're not using Redis
        // In production, you would check against a blacklist store

        return decoded
    } catch (error) {
        console.error('Token verification error: ', error)
        return null
    }
}
