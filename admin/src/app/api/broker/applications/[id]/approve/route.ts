import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import transporter from '@/lib/nodemailer';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const applicationId = params.id;
    const { adminNotes } = await req.json();
    
    // Get the admin user from the token
    const adminToken = req.cookies.get("admin_token")?.value;
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // For simplicity, we'll use a hardcoded admin ID for now
    // In a real implementation, you would decode the token and get the admin ID
    const adminId = 1; // Replace with actual admin ID from token
    
    // Start a transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Get the application with user info
      const applicationResult = await client.query(
        `SELECT ba.*, u.email, u.name 
         FROM broker_applications ba
         JOIN users u ON ba.user_id = u.id
         WHERE ba.id = $1`,
        [applicationId]
      );
      
      if (applicationResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }
      
      const application = applicationResult.rows[0];
      
      // Update application status
      await client.query(
        `UPDATE broker_applications 
         SET status = $1, reviewed_by = $2, review_date = NOW(), notes = $3
         WHERE id = $4`,
        ['approved', adminId, adminNotes, applicationId]
      );
      
      // Update user role to broker
      await client.query(
        `UPDATE users SET role = $1 WHERE id = $2`,
        ['broker', application.user_id]
      );
      
      await client.query('COMMIT');
      
      // Send approval email
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: application.email,
        subject: 'Broker Application Approved',
        html: `
          <h1>Congratulations!</h1>
          <p>Dear ${application.name},</p>
          <p>We are pleased to inform you that your application to become a broker has been approved.</p>
          <p>You can now log in to your account and access broker features.</p>
          <p>Thank you for joining our platform!</p>
        `
      });
      
      return NextResponse.json({
        message: "Application approved successfully",
        applicationId
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error approving broker application:", error);
    return NextResponse.json({ error: "Failed to approve application" }, { status: 500 });
  }
}
