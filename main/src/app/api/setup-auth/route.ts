import { NextResponse } from 'next/server';
const bcrypt = require('bcrypt');
import pool from '@/lib/db';

// Mock authentication data - using correct enum values: customer, broker, admin
const mockUsers = [
  // Admin Section Users
  {
    name: 'Admin Superuser',
    email: 'super.admin@indusun.com',
    password: 'SuperAdmin@123',
    phone: '+91 98765 12345',
    role: 'admin', // Using 'admin' instead of 'super_admin'
    email_verified: true,
    profile_picture: '/auth/Agents/admin-02.jpg'
  },
  {
    name: 'Sarika Singh',
    email: 'sarika.singh@indusun.com',
    password: 'Admin@123',
    phone: '+91 87654 32109',
    role: 'admin',
    email_verified: true,
    profile_picture: '/auth/Agents/admin-01.jpg'
  },
  // Customer Accounts
  {
    name: 'Hritik',
    email: 'hritik@example.com',
    password: 'Customer@123',
    phone: '+91 98765 12345',
    role: 'customer', // Using 'customer' instead of 'user'
    email_verified: true,
    profile_picture: '/auth/Agents/client-01.jpg'
  },
  {
    name: 'Romit',
    email: 'romit@example.com',
    password: 'Customer@123',
    phone: '+91 87654 32109',
    role: 'customer', // Using 'customer' instead of 'user'
    email_verified: true,
    profile_picture: '/auth/Agents/client-02.jpg'
  }
];

export async function POST() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up mock authentication data...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Add phone column if it doesn't exist (for existing table)
    console.log('📋 Checking table structure...');
    try {
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)');
      console.log('✅ Phone column added/verified');
    } catch (error) {
      console.log('ℹ️ Phone column already exists or table structure is different');
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS blacklisted_tokens (
        token_id VARCHAR(255) PRIMARY KEY,
        expiry TIMESTAMP NOT NULL
      )
    `);
    
    // Clear existing mock users (only the ones we're about to insert)
    console.log('🧹 Clearing existing mock users...');
    const emailsToDelete = mockUsers.map(user => user.email);
    await client.query(
      'DELETE FROM users WHERE email = ANY($1)',
      [emailsToDelete]
    );
    
    // Insert mock users
    console.log('👥 Inserting mock users...');
    const results = [];
    
    for (const user of mockUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const result = await client.query(`
        INSERT INTO users (name, email, password, phone, role, email_verified, profile_picture, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING id, name, email, role
      `, [
        user.name,
        user.email,
        hashedPassword,
        user.phone,
        user.role,
        user.email_verified,
        user.profile_picture
      ]);
      
      results.push(result.rows[0]);
      console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n🎉 Mock authentication data setup completed successfully!');
    
    return NextResponse.json({
      success: true,
      message: 'Mock authentication data setup completed successfully!',
      users: results,
      summary: {
        'Admin (Super)': 'super.admin@indusun.com / SuperAdmin@123',
        'Admin (Regular)': 'sarika.singh@indusun.com / Admin@123',
        'Customer 1': 'hritik@example.com / Customer@123',
        'Customer 2': 'romit@example.com / Customer@123'
      }
    });
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('❌ Error setting up mock authentication data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to setup mock authentication data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
    
  } finally {
    client.release();
  }
}

export async function GET() {
  try {
    console.log('\n🔍 Verifying setup...');
    const result = await pool.query('SELECT name, email, role FROM users ORDER BY role, name');
    
    const users = result.rows.map(user => ({
      name: user.name,
      email: user.email,
      role: user.role
    }));
    
    return NextResponse.json({
      success: true,
      message: 'Current users in database',
      users,
      count: users.length
    });
    
  } catch (error) {
    console.error('❌ Error verifying setup:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to verify setup',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
