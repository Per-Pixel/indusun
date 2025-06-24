import * as nodemailer from 'nodemailer';

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
};

// Create transporter
export const transporter = nodemailer.createTransport(emailConfig);

// Email templates
export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Send verification email
export async function sendVerificationEmail(email: string, verificationCode: string): Promise<boolean> {
  try {
    // In development mode, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Verification Email for ${email}:`);
      console.log(`Verification Code: ${verificationCode}`);
      console.log(`Link: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?code=${verificationCode}`);
      return true;
    }

    const mailOptions: EmailTemplate = {
      to: email,
      subject: 'Verify Your Email - Indusun',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Welcome to Indusun!</h2>
          <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/verify-email?code=${verificationCode}" 
             style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
          <p>Or use this verification code: <strong>${verificationCode}</strong></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
      text: `Welcome to Indusun! Please verify your email by visiting: ${process.env.NEXT_PUBLIC_APP_URL}/verify-email?code=${verificationCode}`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Send broker application notification
export async function sendBrokerApplicationEmail(email: string, name: string): Promise<boolean> {
  try {
    // In development mode, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Broker Application Email for ${email}:`);
      console.log(`Applicant: ${name}`);
      return true;
    }

    const mailOptions: EmailTemplate = {
      to: email,
      subject: 'Broker Application Received - Indusun',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Broker Application Received</h2>
          <p>Dear ${name},</p>
          <p>Thank you for your interest in becoming a broker with Indusun. We have received your application and will review it shortly.</p>
          <p>Our team will contact you within 2-3 business days with the next steps.</p>
          <p>If you have any questions, please contact us at support@indusun.com</p>
          <p>Best regards,<br>The Indusun Team</p>
        </div>
      `,
      text: `Dear ${name}, Thank you for your broker application. We will review it and contact you within 2-3 business days.`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending broker application email:', error);
    return false;
  }
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
  try {
    // In development mode, just log the email
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Password Reset Email for ${email}:`);
      console.log(`Reset Token: ${resetToken}`);
      console.log(`Link: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`);
      return true;
    }

    const mailOptions: EmailTemplate = {
      to: email,
      subject: 'Password Reset - Indusun',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Password Reset Request</h2>
          <p>You requested a password reset for your Indusun account.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}" 
             style="background-color: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
      `,
      text: `Reset your password by visiting: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return true;
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return false;
  }
}
