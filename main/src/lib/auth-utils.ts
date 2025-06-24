// Authentication utilities for rate limiting and security

// In-memory storage for failed attempts (in production, use Redis)
const failedAttempts = new Map<string, { count: number; lastAttempt: Date }>();

// Configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Check if an identifier (email/phone) has too many failed attempts
 */
export function hasTooManyAttempts(identifier: string): boolean {
  const attempts = failedAttempts.get(identifier);

  if (!attempts) {
    return false;
  }

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
export function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier);
}

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
}
