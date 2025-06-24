// Authentication utilities for rate limiting and security

// In-memory store for failed login attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Configuration
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds
const ATTEMPT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

export function hasTooManyAttempts(identifier: string): boolean {
  const attempts = failedAttempts.get(identifier);
  
  if (!attempts) {
    return false;
  }
  
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

export function clearFailedAttempts(identifier: string): void {
  failedAttempts.delete(identifier);
}

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
}
