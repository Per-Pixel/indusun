/**
 * Nodemailer stub — email sending placeholder.
 * Install 'nodemailer' package and configure SMTP credentials to enable.
 */

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // TODO: Configure real nodemailer transporter once SMTP credentials are available
  console.log('[Email Stub] Would send email:', {
    to: options.to,
    subject: options.subject,
  });
  return { success: true };
}

export default { sendEmail };
