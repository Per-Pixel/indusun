// Message Central SMS API service (admin – custom/transactional messages)
// Docs: https://cpaas.messagecentral.com / Message Now API

const MESSAGECENTRAL_BASE_URL = 'https://cpaas.messagecentral.com';

export function isMessageCentralConfigured(): boolean {
  return !!process.env.MESSAGECENTRAL_AUTH_TOKEN;
}

/** Strips country code and returns the 10-digit national number for India */
function toNationalNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits; // assume already 10-digit
}

export interface SMSSendResult {
  phone: string;
  success: boolean;
  message?: string;
}

/**
 * Send a custom (transactional) SMS to a single number via Message Central.
 */
export async function sendCustomSMS(
  phone: string,
  messageText: string,
  countryCode: string = '91'
): Promise<SMSSendResult> {
  const authToken = process.env.MESSAGECENTRAL_AUTH_TOKEN;
  if (!authToken) {
    return { phone, success: false, message: 'MESSAGECENTRAL_AUTH_TOKEN not configured' };
  }

  const mobileNumber = toNationalNumber(phone);

  try {
    const url = new URL(`${MESSAGECENTRAL_BASE_URL}/verification/v3/send`);
    url.searchParams.set('countryCode', countryCode);
    url.searchParams.set('flowType', 'SMS');
    url.searchParams.set('mobileNumber', mobileNumber);
    url.searchParams.set('messageType', 'TRANSACTION');
    url.searchParams.set('message', messageText.trim());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        authToken,
        accept: '*/*',
      },
    });

    const data = await response.json();

    if (data.responseCode === 200) {
      return { phone, success: true };
    }

    const errMsg = data.message || data.data?.errorMessage || `Response code: ${data.responseCode}`;
    console.error(`MessageCentral sendCustomSMS failed for ${mobileNumber}:`, data);
    return { phone, success: false, message: errMsg };
  } catch (error: any) {
    console.error(`MessageCentral sendCustomSMS error for ${mobileNumber}:`, error);
    return { phone, success: false, message: error?.message || 'SMS service unavailable' };
  }
}

/**
 * Send a custom SMS to multiple numbers concurrently.
 * Returns per-number results.
 */
export async function sendBulkCustomSMS(
  phones: string[],
  messageText: string,
  countryCode: string = '91'
): Promise<SMSSendResult[]> {
  return Promise.all(phones.map((p) => sendCustomSMS(p, messageText, countryCode)));
}
