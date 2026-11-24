import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { requireStaff } from '@/lib/adminAccess';
import { isMessageCentralConfigured, sendBulkCustomSMS } from '@/lib/messageCentral';
import { createInternalMessage } from '@/services/internalMessageService';

type Channel = 'internal' | 'sms' | 'email' | 'whatsapp';

interface Recipient {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  type?: 'client' | 'broker' | 'admin';
}

function sanitisePhone(raw: string): string | null {
  const digits = (raw || '').replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return null;
}

export async function POST(req: NextRequest) {
  const access = await requireStaff('messaging');
  if (access.denied) return access.denied;

  try {
    const body = await req.json();
    const channel = body.channel as Channel;
    const message = String(body.message || '').trim();
    const subject = String(body.subject || '').trim();
    const recipients = (Array.isArray(body.recipients) ? body.recipients : []) as Recipient[];

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message is required' }, { status: 400 });
    }
    if (channel === 'email' || channel === 'whatsapp') {
      return NextResponse.json(
        { success: false, error: 'Email and WhatsApp are turned off. Send an internal message instead.' },
        { status: 400 }
      );
    }
    if (!['internal', 'sms'].includes(channel)) {
      return NextResponse.json({ success: false, error: 'Choose an internal message or SMS' }, { status: 400 });
    }
    if (recipients.length === 0) {
      return NextResponse.json({ success: false, error: 'Select at least one recipient' }, { status: 400 });
    }

    const senderName = access.user.name || 'Admin';
    const senderEmail = access.user.email || 'admin@indusun.com';
    const logRows: Record<string, unknown>[] = [];
    let sent = 0;
    let failed = 0;
    let warning: string | undefined;
    let inbox = false;

    if (channel === 'internal') {
      const mailSubject = subject || message.slice(0, 80);
      const admins = recipients.filter((r) => r.type === 'admin' && r.id && r.id !== access.user.id);
      const others = recipients.filter((r) => r.type !== 'admin');

      if (admins.length === 0 && others.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Choose someone other than yourself' },
          { status: 400 }
        );
      }

      if (admins.length > 0) {
        const { error: inboxError } = await createInternalMessage({
          sender_id: access.user.id,
          subject: mailSubject,
          body: message,
          visibility: 'custom',
          allowed_user_ids: [...new Set([access.user.id, ...admins.map((r) => r.id as string)])],
        });
        if (inboxError) {
          return NextResponse.json({ success: false, error: inboxError }, { status: 400 });
        }
        inbox = true;
        sent += admins.length;
      }

      for (const recipient of others) {
        sent += 1;
        logRows.push({
          sender_name: senderName,
          sender_email: senderEmail,
          sender_phone: recipient.phone || null,
          subject: mailSubject,
          message_content: message,
          source: 'internal',
          source_page: 'messages',
          status: 'sent',
          admin_notes: `Internal record for ${recipient.name || 'recipient'}. Not sent by email or WhatsApp.`,
        });
      }

      if (others.length > 0) {
        warning = inbox
          ? 'Admins can read this in Internal Comms. Clients and brokers only have a copy in message history.'
          : 'Saved in message history. Clients and brokers do not get an email or WhatsApp from this.';
      }
    }

    if (channel === 'sms') {
      if (!isMessageCentralConfigured()) {
        return NextResponse.json(
          { success: false, error: 'SMS is not configured. Set MESSAGECENTRAL_AUTH_TOKEN.' },
          { status: 500 }
        );
      }
      const ready = recipients
        .map((r) => ({ name: r.name || 'Recipient', phone: sanitisePhone(r.phone || '') }))
        .filter((r) => r.phone) as { name: string; phone: string }[];
      if (ready.length === 0) {
        return NextResponse.json({ success: false, error: 'None of the selected people have a valid mobile number' }, { status: 400 });
      }
      const results = await sendBulkCustomSMS(ready.map((r) => r.phone), message);
      results.forEach((result, i) => {
        const ok = result.success;
        if (ok) sent += 1;
        else failed += 1;
        logRows.push({
          sender_name: senderName,
          sender_email: senderEmail,
          sender_phone: result.phone,
          subject: 'SMS',
          message_content: message,
          source: 'sms',
          source_page: 'messages',
          status: ok ? 'sent' : 'failed',
          admin_notes: `${ok ? 'Sent to' : 'Failed for'}: ${ready[i]?.name || result.phone}${result.message && !ok ? ` — ${result.message}` : ''}`,
        });
      });
    }

    try {
      const supabase = createServiceClient();
      if (logRows.length > 0) {
        const { error: dbError } = await supabase.from('messages').insert(logRows);
        if (dbError) console.error('Failed to log outbound messages:', dbError.message);
      }
    } catch (dbEx) {
      console.error('Supabase exception logging messages:', dbEx);
    }

    if (sent === 0) {
      return NextResponse.json(
        { success: false, error: 'Nothing was sent', failed, warning },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: sent,
      failed,
      channel,
      warning,
      inbox,
    });
  } catch (err: any) {
    console.error('POST /api/messages/send error:', err);
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 });
  }
}
