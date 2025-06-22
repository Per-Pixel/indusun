// Mock OTP service for development and testing
export interface OTPSession {
  phone: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  isVerified: boolean;
}

// In-memory storage for OTP sessions (in production, use Redis or database)
const otpSessions = new Map<string, OTPSession>();

// Mock OTP configuration
const OTP_CONFIG = {
  length: 6,
  expiryMinutes: 5,
  maxAttempts: 3,
  resendCooldownSeconds: 30
};

// Generate a random OTP
export const generateOTP = (length: number = OTP_CONFIG.length): string => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};

// Send OTP to phone number (mock implementation)
export const sendOTP = async (phone: string): Promise<{ success: boolean; message: string; sessionId?: string }> => {
  try {
    // Clean phone number format
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    
    // Check if there's an existing session
    const existingSession = otpSessions.get(cleanPhone);
    if (existingSession && !isOTPExpired(existingSession)) {
      return {
        success: false,
        message: 'OTP already sent. Please wait before requesting a new one.'
      };
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_CONFIG.expiryMinutes);

    // Create OTP session
    const session: OTPSession = {
      phone: cleanPhone,
      otp,
      expiresAt,
      attempts: 0,
      isVerified: false
    };

    // Store session
    otpSessions.set(cleanPhone, session);

    // In a real implementation, you would send SMS here
    console.log(`📱 Mock OTP sent to ${cleanPhone}: ${otp}`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      sessionId: cleanPhone
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again.'
    };
  }
};

// Verify OTP
export const verifyOTP = async (phone: string, otp: string): Promise<{ success: boolean; message: string }> => {
  try {
    const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
    const session = otpSessions.get(cleanPhone);

    if (!session) {
      return {
        success: false,
        message: 'No OTP session found. Please request a new OTP.'
      };
    }

    // Check if OTP is expired
    if (isOTPExpired(session)) {
      otpSessions.delete(cleanPhone);
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.'
      };
    }

    // Check max attempts
    if (session.attempts >= OTP_CONFIG.maxAttempts) {
      otpSessions.delete(cleanPhone);
      return {
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      };
    }

    // Increment attempts
    session.attempts++;

    // Verify OTP
    if (session.otp !== otp) {
      return {
        success: false,
        message: `Invalid OTP. ${OTP_CONFIG.maxAttempts - session.attempts} attempts remaining.`
      };
    }

    // Mark as verified
    session.isVerified = true;
    
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    };
  }
};

// Check if OTP is expired
export const isOTPExpired = (session: OTPSession): boolean => {
  return new Date() > session.expiresAt;
};

// Get OTP session status
export const getOTPSession = (phone: string): OTPSession | null => {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  return otpSessions.get(cleanPhone) || null;
};

// Clear OTP session
export const clearOTPSession = (phone: string): void => {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  otpSessions.delete(cleanPhone);
};

// Resend OTP
export const resendOTP = async (phone: string): Promise<{ success: boolean; message: string }> => {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Clear existing session
  otpSessions.delete(cleanPhone);
  
  // Send new OTP
  return await sendOTP(cleanPhone);
};

// Get remaining time for OTP expiry
export const getOTPRemainingTime = (phone: string): number => {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  const session = otpSessions.get(cleanPhone);
  
  if (!session) return 0;
  
  const now = new Date();
  const remaining = session.expiresAt.getTime() - now.getTime();
  
  return Math.max(0, Math.floor(remaining / 1000)); // Return seconds
};

// Format remaining time as MM:SS
export const formatRemainingTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Mock phone number validation
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  // Basic validation for Indian phone numbers
  const indianPhoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  
  return indianPhoneRegex.test(cleanPhone);
};

// Get formatted phone number for display
export const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  
  if (cleanPhone.startsWith('+91')) {
    return cleanPhone.replace(/(\+91)(\d{5})(\d{5})/, '$1 $2 $3');
  } else if (cleanPhone.startsWith('91')) {
    return cleanPhone.replace(/(91)(\d{5})(\d{5})/, '+$1 $2 $3');
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{5})(\d{5})/, '+91 $1 $2');
  }
  
  return phone;
};

// Development helper: Get all active OTP sessions
export const getAllOTPSessions = (): Array<{ phone: string; otp: string; expiresAt: Date; attempts: number }> => {
  const sessions: Array<{ phone: string; otp: string; expiresAt: Date; attempts: number }> = [];
  
  otpSessions.forEach((session, phone) => {
    if (!isOTPExpired(session)) {
      sessions.push({
        phone,
        otp: session.otp,
        expiresAt: session.expiresAt,
        attempts: session.attempts
      });
    }
  });
  
  return sessions;
};

// Clean up expired sessions (should be called periodically)
export const cleanupExpiredSessions = (): number => {
  let cleaned = 0;
  
  otpSessions.forEach((session, phone) => {
    if (isOTPExpired(session)) {
      otpSessions.delete(phone);
      cleaned++;
    }
  });
  
  return cleaned;
};

// For development: Log current OTP for a phone number
export const getOTPForDevelopment = (phone: string): string | null => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  const cleanPhone = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  const session = otpSessions.get(cleanPhone);
  
  return session && !isOTPExpired(session) ? session.otp : null;
};
