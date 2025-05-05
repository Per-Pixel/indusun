// src/app/api/broker/apply/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import pool from '@/lib/db';
import { z as zod } from "zod";
import transporter from "@/lib/nodemailer";

const brokerApplicationSchema = zod.object({
  experience: zod.string(),
  qualifications: zod.string(),
  documents: zod.array(zod.string()).optional(),
  message: zod.string()
});

export async function POST(req: NextRequest) {
  return withAuth(req, async (req, user) => {
    try {
      const body = await req.json();

      // Validate input
      const parsedBody = brokerApplicationSchema.safeParse(body);
      if (!parsedBody.success) {
        return NextResponse.json({ error: parsedBody.error.format() }, { status: 400 });
      }

      const { experience, qualifications, documents, message } = parsedBody.data;

      // Check if user already has a pending application
      const existingApp = await pool.query(
        'SELECT * FROM broker_applications WHERE user_id = $1 AND status = $2',
        [user.id, 'pending']
      );

      if (existingApp.rows.length > 0) {
        return NextResponse.json({
          error: "You already have a pending broker application"
        }, { status: 400 });
      }

      // Create new application
      const result = await pool.query(
        `INSERT INTO broker_applications
         (user_id, documents, notes, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [user.id, JSON.stringify({ experience, qualifications, documents }), message, 'pending']
      );

      // Send confirmation email to user
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: user.email,
          subject: 'Broker Application Received',
          html: `
            <h1>Broker Application Received</h1>
            <p>Dear ${user.name},</p>
            <p>We have received your application to become a broker. Our team will review your application and get back to you soon.</p>
            <p>Thank you for your interest!</p>
          `
        });
      } catch (emailError) {
        console.error('Error sending confirmation email:', emailError);
        // Continue even if email fails
      }

      return NextResponse.json({
        message: "Application submitted successfully",
        application: result.rows[0]
      });
    } catch (error) {
      console.error("Error submitting broker application:", error);
      return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
    }
  });
}