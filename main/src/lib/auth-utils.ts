// Authentication utilities for rate limiting and security

<<<<<<< HEAD
// In-memory store for failed login attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
=======
// In-memory storage for failed attempts (in production, use Redis)
const failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();
>>>>>>> 64f2abca7c485ee82b9820a9f5ac64ee8aeedafd

// Configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

<<<<<<< HEAD
=======
/**
 * Check if an identifier (email/phone) has too many failed attempts
 */
>>>>>>> 64f2abca7c485ee82b9820a9f5ac64ee8aeedafd
export function hasTooManyAttempts(identifier: string): boolean {
  const attempts = failedAttempts.get(identifier);
  
  if (!attempts) {
    return false;
  }
<<<<<<< HEAD
  
  const now = Date.now();
  
  // If lockout period has passed, reset attempts
  if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
    failedAttempts.delete(identifier);
    return false;
  }
  
  return attempts.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const attempts = failedAttempts.get(identifier);
  
  if (!attempts) {
    failedAttempts.set(identifier, { count: 1, lastAttempt: now });
    return;
  }
  
  // If attempt is within the window, increment count
  if (now - attempts.lastAttempt < ATTEMPT_WINDOW) {
    attempts.count += 1;
  } else {
    // Reset count if outside window
    attempts.count = 1;
  }
  
  attempts.lastAttempt = now;
  failedAttempts.set(identifier, attempts);
}

=======

  const now = new Date();
  const timeSinceLastAttempt = now.getTime() - attempts.lastAttempt.getTime();

  // Reset attempts if lockout period has passed
  if (timeSinceLastAttempt > LOCKOUT_DURATION) {
    failedAttempts.delete(identifier);
    return false;
  }

  // Check if attempts exceed maximum
  return attempts.count >= MAX_ATTEMPTS;
}

/**
 * Record a failed login attempt
 */
export function recordFailedAttempt(identifier: string): void {
  const now = new Date();
  const existing = failedAttempts.get(identifier);

  if (!existing) {
    failedAttempts.set(identifier, { count: 1, lastAttempt: now });
    return;
  }

  const timeSinceLastAttempt = now.getTime() - existing.lastAttempt.getTime();

  // Reset count if attempt window has passed
  if (timeSinceLastAttempt > ATTEMPT_WINDOW) {
    failedAttempts.set(identifier, { count: 1, lastAttempt: now });
  } else {
    // Increment count
    existing.count++;
    existing.lastAttempt = now;
  }
}

/**
 * Clear failed attempts for an identifier (called on successful login)
 */
>>>>>>> 64f2abca7c485ee82b9820a9f5ac64ee8aeedafd
export function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier);
}

<<<<<<< HEAD
// OTP utilities
export interface PendingVerification {
  code: string;
  userData: {
    name: string;
    email: string;
    hashedPassword: string;
  };
  expiresAt: number;
  attempts: number;
}

// In-memory store for pending verifications
export const pendingVerifications = new Map<string, PendingVerification>();

// OTP configuration
export const VERIFICATION_EXPIRY = 10 * 60 * 1000; // 10 minutes
export const ATTEMPT_COOLDOWN = 60 * 1000; // 1 minute between attempts
export const MAX_VERIFICATION_ATTEMPTS = 3;

export function generateSecureCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP store for phone authentication
interface OTPData {
  code: string;
  phone: string;
  expiresAt: number;
  attempts: number;
}

const otpStore = new Map<string, OTPData>();

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function storeOTP(phone: string, code: string): void {
  const expiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
  console.log('💾 Storing OTP for phone:', phone, 'code:', code, 'expires:', new Date(expiresAt).toISOString());
  otpStore.set(phone, {
    code,
    phone,
    expiresAt,
    attempts: 0
  });
  console.log('📊 OTP store now has keys:', Array.from(otpStore.keys()));
}

export function verifyOTP(phone: string, code: string): boolean {
  console.log('🔍 verifyOTP called with phone:', phone, 'code:', code);
  const otpData = otpStore.get(phone);

  if (!otpData) {
    console.log('❌ No OTP data found for phone:', phone);
    console.log('📊 Current OTP store keys:', Array.from(otpStore.keys()));
    return false;
  }

  console.log('📋 Found OTP data:', {
    storedCode: otpData.code,
    expiresAt: new Date(otpData.expiresAt).toISOString(),
    attempts: otpData.attempts,
    timeRemaining: Math.max(0, otpData.expiresAt - Date.now())
  });

  // Check if OTP has expired
  if (Date.now() > otpData.expiresAt) {
    console.log('⏰ OTP has expired for phone:', phone);
    otpStore.delete(phone);
    return false;
  }

  // Check if too many attempts
  if (otpData.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    console.log('🚫 Too many attempts for phone:', phone, 'attempts:', otpData.attempts);
    otpStore.delete(phone);
    return false;
  }

  // Increment attempts
  otpData.attempts += 1;
  console.log('📈 Incremented attempts to:', otpData.attempts);

  // Check if code matches
  if (otpData.code === code) {
    console.log('✅ OTP code matches! Deleting OTP data.');
    otpStore.delete(phone);
    return true;
  }

  console.log('❌ OTP code does not match. Expected:', otpData.code, 'Got:', code);
  return false;
}

export function clearOTP(phone: string): void {
  otpStore.delete(phone);
}

// Get verification data
export function getVerification(identifier: string): PendingVerification | undefined {
  return pendingVerifications.get(identifier);
}

// Store verification data
export function storeVerification(identifier: string, verification: PendingVerification): void {
  pendingVerifications.set(identifier, verification);
}

// Remove verification data
export function removeVerification(identifier: string): void {
  pendingVerifications.delete(identifier);
}

// Clean up expired entries function (called manually to avoid setInterval in server environment)
export function cleanupExpiredEntries(): void {
  const now = Date.now();

  // Clean up failed attempts
  for (const [key, attempts] of failedAttempts.entries()) {
    if (now - attempts.lastAttempt > LOCKOUT_DURATION) {
      failedAttempts.delete(key);
    }
  }

  // Clean up expired verifications
  for (const [key, verification] of pendingVerifications.entries()) {
    if (now > verification.expiresAt) {
      pendingVerifications.delete(key);
    }
  }

  // Clean up expired OTPs
  for (const [key, otp] of otpStore.entries()) {
    if (now > otp.expiresAt) {
      otpStore.delete(key);
    }
  }
}

// Initialize cleanup only in browser environment
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000); // Clean up every 5 minutes
=======
/**
 * Get remaining lockout time in seconds
 */
export function getRemainingLockoutTime(identifier: string): number {
  const attempts = failedAttempts.get(identifier);
  
  if (!attempts || attempts.count < MAX_ATTEMPTS) {
    return 0;
  }

  const now = new Date();
  const timeSinceLastAttempt = now.getTime() - attempts.lastAttempt.getTime();
  const remainingTime = LOCKOUT_DURATION - timeSinceLastAttempt;

  return Math.max(0, Math.ceil(remainingTime / 1000));
}

/**
 * Get failed attempt count for an identifier
 */
export function getFailedAttemptCount(identifier: string): number {
  const attempts = failedAttempts.get(identifier);
  return attempts ? attempts.count : 0;
}

/**
 * Clean up expired failed attempts (should be called periodically)
 */
export function cleanupExpiredAttempts(): number {
  const now = new Date();
  let cleaned = 0;

  failedAttempts.forEach((attempts, identifier) => {
    const timeSinceLastAttempt = now.getTime() - attempts.lastAttempt.getTime();
    
    if (timeSinceLastAttempt > LOCKOUT_DURATION) {
      failedAttempts.delete(identifier);
      cleaned++;
    }
  });

  return cleaned;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a secure random password
 */
export function generateSecurePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';

  // Ensure at least one character from each category
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Hash a password using bcrypt (for development/testing)
 */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcrypt');
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure session ID
 */
export function generateSessionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format (Indian numbers)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return indianPhoneRegex.test(cleanPhone);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  if (cleanPhone.startsWith('+91')) {
    return cleanPhone.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 $3');
  } else if (cleanPhone.startsWith('91')) {
    return cleanPhone.replace(/(91)(\d{5})(\d{5})/, '+$1 $2 $3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{5})(\d{5})/, '+91 $1 $2');
  }
  
  return phone;
>>>>>>> 64f2abca7c485ee82b9820a9f5ac64ee8aeedafd
}
