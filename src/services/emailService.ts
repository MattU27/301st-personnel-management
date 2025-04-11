// @ts-ignore
import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// This would typically come from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || '587');
const EMAIL_USER = process.env.EMAIL_USER || 'your-email@example.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'your-password';
const EMAIL_FROM = process.env.EMAIL_FROM || 'AFP Password Recovery <noreply@afp.mil.ph>';

// Create a nodemailer transporter with better error handling
let transporter: any;

try {
  // Create nodemailer transporter
  transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    // Add debug option for development
    ...(process.env.NODE_ENV !== 'production' && { debug: true }),
  });
} catch (error) {
  console.error('Error creating nodemailer transporter:', error);
}

/**
 * Send an email using nodemailer
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<boolean> {
  if (!transporter) {
    console.error('Email transporter not initialized');
    return false;
  }

  try {
    console.log(`Attempting to send email to ${to}`);
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    });

    console.log(`Email sent: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send a password reset email with a reset link
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  firstName: string,
  lastName: string
): Promise<boolean> {
  // For testing/development, log the reset token
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(`Reset URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
  }
  
  // The base URL would typically come from an environment variable
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #092140; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">301st READY RESERVE</h1>
        <p style="margin: 5px 0 0; color: #D1B000;">INFANTRY BATTALION</p>
      </div>
      
      <div style="padding: 20px; border: 1px solid #e1e1e1; border-top: none;">
        <h2>Password Reset Request</h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>We received a request to reset your password. If you did not make this request, please ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #092140; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="background-color: #f5f5f5; padding: 10px; word-break: break-all;">${resetUrl}</p>
        
        <p>This link will expire in 1 hour for security reasons.</p>
        
        <p>If you need further assistance, please contact our support team.</p>
        
        <p>Best regards,<br>301st READY RESERVE INFANTRY BATTALION</p>
      </div>
      
      <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
        <p>This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset Request - 301st READY RESERVE',
    html,
  });
} 