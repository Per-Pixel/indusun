// Verify authentication setup
const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'indusun',
  password: '1234',
  port: 5432,
});

async function verifyAuthSetup() {
  try {
    console.log('🔍 Verifying authentication setup...');
    
    const client = await pool.connect();
    
    // Check users
    const users = await client.query('SELECT id, name, email, role, phone FROM users ORDER BY role, name');
    
    console.log(`\n👥 Authentication users in database: ${users.rows.length}`);
    
    if (users.rows.length > 0) {
      console.log('\n📊 User accounts:');
      users.rows.forEach(user => {
        console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - Phone: ${user.phone}`);
      });
      
      console.log('\n✅ Authentication setup complete!');
      console.log('\n🔐 Test credentials:');
      console.log('Customer Login:');
      console.log('  - hritik@example.com / Customer@123');
      console.log('  - romit@example.com / Customer@123');
      console.log('Admin Login:');
      console.log('  - super.admin@indusun.com / SuperAdmin@123 (Super Admin)');
      console.log('  - sarika.singh@indusun.com / Admin@123 (Regular Admin)');
      
    } else {
      console.log('❌ No authentication users found. Run setup first.');
    }
    
    client.release();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

verifyAuthSetup();
