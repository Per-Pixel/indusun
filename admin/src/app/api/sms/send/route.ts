import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { isMessageCentralConfigured, sendBulkCustomSMS } from '@/lib/messageCentral';

/**
 * Sanitise a phone string to a 10-digit Indian mobile number.
 * Returns null if the number is invalid.
 */
function sanitisePhone(raw: string): string | null {
  // Strip spaces, dashes, parentheses, plus sign, country code
  const digits = raw.replace(/\D/g, '');
  // Accept 10-digit or 12-digit (91XXXXXXXXXX) numbers
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { numbers, message, recipientNames } = body as {
      numbers: string[];
      message: string;
      recipientNames?: string[];
    };

    // ── Validation ────────────────────────────────────────────────────────────
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }
    if (!numbers || numbers.length === 0) {
      return NextResponse.json({ error: 'At least one phone number is required' }, { status: 400 });
    }

    if (!isMessageCentralConfigured()) {
      console.error('MESSAGECENTRAL_AUTH_TOKEN is not configured');
      return NextResponse.json({ error: 'SMS service is not configured' }, { status: 500 });
    }

    // ── Sanitise & validate numbers ───────────────────────────────────────────
    const sanitised = numbers.map(sanitisePhone);
    const invalid = numbers.filter((_, i) => sanitised[i] === null);
    const valid = sanitised.filter(Boolean) as string[];

    if (valid.length === 0) {
      return NextResponse.json({
        error: 'No valid Indian mobile numbers provided',
        invalidNumbers: invalid,
      }, { status: 400 });
    }

    let overallSuccess = true;
    let anySuccess = false;
    let anyError: string | null = null;
    const logRows: any[] = [];

    // ── Send SMS via Message Central ──────────────────────────────────────────
    const results = await sendBulkCustomSMS(valid, message.trim());

    results.forEach((result, i) => {
      if (result.success) {
        anySuccess = true;
        logRows.push({
          sender_name: 'Admin',
          sender_email: 'admin@indusun.com',
          sender_phone: result.phone,
          subject: 'SMS',
          message_content: message.trim(),
          source: 'sms',
          source_page: 'messages',
          status: 'sent',
          admin_notes: recipientNames?.[i] ? `Sent to: ${recipientNames[i]}` : undefined,
        });
      } else {
        overallSuccess = false;
        anyError = result.message || 'Failed to send SMS';
        logRows.push({
          sender_name: 'Admin',
          sender_email: 'admin@indusun.com',
          sender_phone: result.phone,
          subject: 'SMS',
          message_content: message.trim(),
          source: 'sms',
          source_page: 'messages',
          status: 'failed',
          admin_notes: `Error: ${result.message || 'Unknown error'}${recipientNames?.[i] ? ` | To: ${recipientNames[i]}` : ''}`,
        });
      }
    });

    // ── Log to Supabase messages table ────────────────────────────────────────
    try {
      const supabase = createServiceClient();
      const { error: dbError } = await supabase.from('messages').insert(logRows);
      if (dbError) {
        console.error('Failed to log SMS to Supabase:', dbError.message);
      }
    } catch (dbEx) {
      console.error('Supabase exception logging messages:', dbEx);
    }

    if (!overallSuccess) {
      if (anySuccess) {
        return NextResponse.json({
          error: 'Some messages failed to send',
          detail: anyError,
          invalidNumbers: invalid,
        }, { status: 207 }); // Partial content/success
      } else {
        return NextResponse.json({
          error: 'Failed to send messages',
          detail: anyError,
          invalidNumbers: invalid,
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      sentCount: valid.length,
      invalidNumbers: invalid,
    });
  } catch (error: any) {
    console.error('SMS API Error:', error.message);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
