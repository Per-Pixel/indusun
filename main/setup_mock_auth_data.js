const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Database connection configuration
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'indusun',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Mock authentication data
const mockUsers = [
  // Admin Section Users
  {
    name: 'Admin Superuser',
    email: 'super.admin@indusun.com',
    password: 'SuperAdmin@123',
    phone: '+91 98765 12345',
    role: 'super_admin',
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
  // Customer/User Accounts
  {
    name: 'Hritik',
    email: 'hritik@example.com',
    password: 'Customer@123',
    phone: '+91 98765 12345',
    role: 'user',
    email_verified: true,
    profile_picture: '/auth/Agents/client-01.jpg'
  },
  {
    name: 'Romit',
    email: 'romit@example.com',
    password: 'Customer@123',
    phone: '+91 87654 32109',
    role: 'user',
    email_verified: true,
    profile_picture: '/auth/Agents/client-02.jpg'
  }
];

async function setupMockAuthData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up mock authentication data...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Create tables if they don't exist
    console.log('📋 Creating tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        email_verified BOOLEAN DEFAULT false,
        google_id VARCHAR(255),
        profile_picture VARCHAR(500),
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
    for (const user of mockUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      await client.query(`
        INSERT INTO users (name, email, password, phone, role, email_verified, profile_picture, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        user.name,
        user.email,
        hashedPassword,
        user.phone,
        user.role,
        user.email_verified,
        user.profile_picture
      ]);
      
      console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n🎉 Mock authentication data setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Super Admin: super.admin@indusun.com / SuperAdmin@123');
    console.log('- Admin: sarika.singh@indusun.com / Admin@123');
    console.log('- Customer 1: hritik@example.com / Customer@123');
    console.log('- Customer 2: romit@example.com / Customer@123');
    
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('❌ Error setting up mock authentication data:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function verifySetup() {
  try {
    console.log('\n🔍 Verifying setup...');
    const result = await pool.query('SELECT name, email, role FROM users ORDER BY role, name');
    
    console.log('\n📊 Users in database:');
    result.rows.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
  } catch (error) {
    console.error('❌ Error verifying setup:', error);
  }
}

// Main execution
async function main() {
  try {
    await setupMockAuthData();
    await verifySetup();
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { setupMockAuthData, verifySetup };
