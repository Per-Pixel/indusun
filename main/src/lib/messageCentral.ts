// Message Central SMS API service
// Docs: https://cpaas.messagecentral.com / Verify Now V3

const MESSAGECENTRAL_BASE_URL = 'https://cpaas.messagecentral.com';

interface SendOTPResponse {
  success: boolean;
  verificationId?: string;
  message: string;
}

interface ValidateOTPResponse {
  success: boolean;
  message: string;
}

export function isMessageCentralConfigured(): boolean {
  return !!process.env.MESSAGECENTRAL_AUTH_TOKEN;
}

// Extracts 10-digit national number from an Indian phone number string
function extractNationalNumber(phone: string): string {
  const clean = phone.replace(/\s+/g, '').replace(/[^\d+]/g, '');
  if (clean.startsWith('+91') && clean.length === 13) return clean.slice(3);
  if (clean.startsWith('91') && clean.length === 12) return clean.slice(2);
  return clean;
}

export async function sendOTPviaSMS(
  phone: string,
  countryCode: string = '91'
): Promise<SendOTPResponse> {
  const authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;

  if (!authToken) {
    return { success: false, message: 'MessageCentral auth token not configured' };
  }

  const mobileNumber = extractNationalNumber(phone);

  try {
    const url = new URL(`${MESSAGECENTRAL_BASE_URL}/verification/v3/send`);
    url.searchParams.set('countryCode', countryCode);
    url.searchParams.set('flowType', 'SMS');
    url.searchParams.set('mobileNumber', mobileNumber);

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        authToken,
        accept: '*/*',
      },
    });

    const data = await response.json();

    if (data.responseCode === 200 && data.data?.verificationId) {
      return {
        success: true,
        verificationId: String(data.data.verificationId),
        message: 'OTP sent successfully via SMS',
      };
    }

    console.error('MessageCentral sendOTP failed:', data);
    return {
      success: false,
      message: data.message || data.data?.errorMessage || 'Failed to send OTP via SMS',
    };
  } catch (error) {
    console.error('MessageCentral sendOTP error:', error);
    return { success: false, message: 'SMS service unavailable. Please try again.' };
  }
}

export async function validateOTPCode(
  verificationId: string,
  code: string
): Promise<ValidateOTPResponse> {
  const authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;

  if (!authToken) {
    return { success: false, message: 'MessageCentral auth token not configured' };
  }

  try {
    const url = new URL(`${MESSAGECENTRAL_BASE_URL}/verification/v3/validateOtp`);
    url.searchParams.set('verificationId', verificationId);
    url.searchParams.set('code', code);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        authToken,
        accept: '*/*',
      },
    });

    const data = await response.json();

    if (
      data.responseCode === 200 &&
      data.data?.verificationStatus === 'VERIFICATION_COMPLETED'
    ) {
      return { success: true, message: 'OTP verified successfully' };
    }

    const errorCode = Number(data.responseCode ?? data.data?.responseCode ?? 0);
    let message = 'Invalid OTP. Please try again.';
    if (errorCode === 702) message = 'Wrong OTP provided.';
    else if (errorCode === 703) message = 'OTP already verified.';
    else if (errorCode === 705) message = 'OTP has expired. Please request a new one.';
    else if (errorCode === 700) message = 'OTP verification failed.';

    console.error('MessageCentral validateOTP failed:', data);
    return { success: false, message };
  } catch (error) {
    console.error('MessageCentral validateOTP error:', error);
    return { success: false, message: 'OTP validation service unavailable. Please try again.' };
  }
}
