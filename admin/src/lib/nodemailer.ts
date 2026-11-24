/**
 * Outbound email. Delivers when SMTP_HOST is set and nodemailer is installed.
 * Otherwise the caller still records the message in history.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(
  options: EmailOptions
): Promise<{ success: boolean; delivered: boolean; error?: string }> {
  const host = process.env.SMTP_HOST;
  if (!host) {
    return {
      success: true,
      delivered: false,
      error: 'Saved to message history. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM to deliver email.',
    };
  }

  try {
    // Optional dependency — only resolved when SMTP is configured.
    const nodemailer = await (Function('return import("nodemailer")')() as Promise<{
      createTransport: (opts: Record<string, unknown>) => { sendMail: (mail: Record<string, unknown>) => Promise<unknown> };
    }>);
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
        : undefined,
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@indusun.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    return { success: true, delivered: true };
  } catch (err: any) {
    const missing = /cannot find module/i.test(err?.message || '') || err?.code === 'MODULE_NOT_FOUND';
    return {
      success: false,
      delivered: false,
      error: missing
        ? 'Email could not be delivered because nodemailer is not installed.'
        : err?.message || 'Email delivery failed',
    };
  }
}

export default { sendEmail };
