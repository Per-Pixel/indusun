import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get a specific broker by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await pool.query(`
      SELECT 
        id,
        normalized_name as name,
        contact_number as phone,
        'broker' as role,
        'active' as status,
        '' as location,
        created_at as createdAt
      FROM brokers
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Broker not found' },
        { status: 404 }
      );
    }

    // Generate a simplified email from the name (which is now normalized_name)
    const nameParts = result.rows[0].name.split(' ');
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
    const email = `${firstName}.${lastName}@indusun.com`;
    
    const broker = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      phone: result.rows[0].phone || '',
      email,
      role: 'broker',
      status: 'active',
      location: 'India',
      image: `/images/avatars/avatar_${(result.rows[0].id % 24) + 1}.jpg`,
      lastActive: new Date().toISOString().split('T')[0],
      createdAt: result.rows[0].createdAt ? new Date(result.rows[0].createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({ broker });
  } catch (error) {
    console.error('Error fetching broker:', error);
    return NextResponse.json(
      { error: 'Failed to fetch broker' },
      { status: 500 }
    );
  }
}

// Update a broker by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('PUT request for broker ID:', id, 'Type:', typeof id);
    
    const data = await req.json();
    const { name, phone } = data;
    console.log('Broker data to update:', { name, phone });

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is a required field' },
        { status: 400 }
      );
    }

    // Generate normalized name (lowercase first letter of each word)
    const normalizedName = name.split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Check if broker exists
    const checkResult = await pool.query(
      'SELECT id FROM brokers WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Broker not found' },
        { status: 404 }
      );
    }

    // Update broker in database
    const result = await pool.query(`
      UPDATE brokers
      SET 
        full_name = $1,
        normalized_name = $2,
        contact_number = $3
      WHERE id = $4
      RETURNING 
        id,
        normalized_name as name,
        contact_number as phone,
        created_at as createdAt
    `, [
      name,
      normalizedName,
      phone || '',
      id
    ]);

    // Generate a simplified email from the normalized name
    const nameParts = normalizedName.split(' ');
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
    const email = `${firstName}.${lastName}@indusun.com`;
    
    const broker = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email,
      phone: result.rows[0].phone || '',
      role: 'broker',
      status: 'active',
      image: `/images/avatars/avatar_${(result.rows[0].id % 24) + 1}.jpg`,
      location: 'India',
      lastActive: new Date().toISOString().split('T')[0],
      createdAt: result.rows[0].createdAt ? new Date(result.rows[0].createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({ broker });
  } catch (error) {
    console.error('Error updating broker:', error);
    return NextResponse.json(
      { error: 'Failed to update broker' },
      { status: 500 }
    );
  }
}

// Delete a broker by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if broker exists
    const checkResult = await pool.query(
      'SELECT id FROM brokers WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Broker not found' },
        { status: 404 }
      );
    }

    // Delete broker from database
    await pool.query('DELETE FROM brokers WHERE id = $1', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting broker:', error);
    return NextResponse.json(
      { error: 'Failed to delete broker' },
      { status: 500 }
    );
  }
}
