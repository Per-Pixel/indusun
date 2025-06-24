import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Get a specific client by ID
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
        'client' as role,
        'active' as status,
        '' as location,
        created_at as createdAt
      FROM clients
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Generate a simplified email from the name (which is now normalized_name)
    const nameParts = result.rows[0].name.split(' ');
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
    const email = `${firstName}.${lastName}@example.com`;
    
    const client = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      phone: result.rows[0].phone,
      email,
      role: 'client',
      status: 'active',
      location: '',
      image: `/images/avatars/avatar_${(result.rows[0].id % 24) + 1}.jpg`,
      lastActive: new Date().toISOString().split('T')[0],
      createdAt: result.rows[0].createdat ? new Date(result.rows[0].createdat).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

// Update a client by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await req.json();
    const { name, phone } = data;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json(
        { error: 'Name and phone are required fields' },
        { status: 400 }
      );
    }

    // Generate normalized name (lowercase first letter of each word)
    const normalizedName = name.split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Check if client exists
    const checkResult = await pool.query(
      'SELECT id FROM clients WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Update client in database
    const result = await pool.query(`
      UPDATE clients
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
      phone,
      id
    ]);

    // Generate a simplified email from the normalized name
    const nameParts = normalizedName.split(' ');
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
    const email = `${firstName}.${lastName}@example.com`;
    
    const updatedClient = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      phone: result.rows[0].phone,
      email,
      role: 'client',
      status: 'active',
      location: data.location || '',
      image: data.image || `/images/avatars/avatar_${(result.rows[0].id % 24) + 1}.jpg`,
      lastActive: new Date().toISOString().split('T')[0],
      createdAt: result.rows[0].createdAt ? new Date(result.rows[0].createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({ client: updatedClient });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

// Delete a client by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if client exists
    const checkResult = await pool.query(
      'SELECT id FROM clients WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Delete client from database
    await pool.query('DELETE FROM clients WHERE id = $1', [id]);

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}
