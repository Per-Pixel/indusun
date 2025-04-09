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
    
    // Get the application with user info
    const applicationResult = await pool.query(
      `SELECT ba.*, u.email, u.name 
       FROM broker_applications ba
       JOIN users u ON ba.user_id = u.id
       WHERE ba.id = $1`,
      [applicationId]
    );
    
    if (applicationResult.rows.length === 0) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }
    
    const application = applicationResult.rows[0];
    
    // Update application status
    await pool.query(
      `UPDATE broker_applications 
       SET status = $1, reviewed_by = $2, review_date = NOW(), notes = $3
       WHERE id = $4`,
      ['rejected', adminId, adminNotes, applicationId]
    );
    
    // Send rejection email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: application.email,
      subject: 'Broker Application Status',
      html: `
        <h1>Application Update</h1>
        <p>Dear ${application.name},</p>
        <p>Thank you for your interest in becoming a broker on our platform.</p>
        <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
        <p>Reason: ${adminNotes || 'Your application does not meet our current requirements.'}</p>
        <p>You are welcome to apply again in the future.</p>
      `
    });
    
    return NextResponse.json({
      message: "Application rejected successfully",
      applicationId
    });
  } catch (error) {
    console.error("Error rejecting broker application:", error);
    return NextResponse.json({ error: "Failed to reject application" }, { status: 500 });
  }
}
