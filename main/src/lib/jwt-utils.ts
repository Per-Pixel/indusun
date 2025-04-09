import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { isTokenBlacklisted } from "./redis";
import { error } from "console";
import { decode } from "punycode";

// Define JWT payload type with role
export interface JWTPayload{
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
        throw new Error("JWT is missing")
    }

    const jti = uuidv4();

    return jwt.sign(
        { ...payload, jti},
        process.env.JWT_SECRET,
        { expiresIn }
    )
}

// Verify JWT token and check if it's blacklisted
export async function verifyToken(token:string): Promise<JWTPayload | null> {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT is missing")
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload

        // check if token is blacklisted and has jti
        if (decoded.jti && await isTokenBlacklisted(decoded.jti)) {
            return null
        }

        return decoded
    } catch (error) {
        console.error('Token verification error: ', error)
        return null
    }
}