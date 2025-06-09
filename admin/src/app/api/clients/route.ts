import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    console.log('Fetching clients from database...');
    
    // Get pagination parameters from query string
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const search = url.searchParams.get('search') || '';
    
    // Calculate offset
    const offset = (page - 1) * limit;
    
    // Build the query based on search parameter
    let query = `
      SELECT 
        id,
        full_name as name,
        normalized_name,
        contact_number as phone,
        created_at as "createdAt"
      FROM clients
    `;
    
    const queryParams: any[] = [];
    
    // Add search condition if search parameter is provided
    if (search) {
      query += ` WHERE normalized_name ILIKE $1 OR contact_number ILIKE $1`;
      queryParams.push(`%${search}%`);
    }
    
    // Add sorting - alphabetical by normalized_name
    query += ` ORDER BY normalized_name ASC`;
    
    // Add pagination
    query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);
    
    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM clients`;
    if (search) {
      countQuery += ` WHERE normalized_name ILIKE $1 OR contact_number ILIKE $1`;
    }
    
    // Execute the queries
    const [clientsResult, countResult] = await Promise.all([
      pool.query(query, queryParams),
      pool.query(countQuery, search ? [`%${search}%`] : [])
    ]).catch((err: Error) => {
      console.error('Database query error:', err.message);
      throw new Error(`Database query failed: ${err.message}`);
    });
    
    const totalClients = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalClients / limit);
    
    console.log(`Found ${totalClients} clients in database, showing page ${page} of ${totalPages}`);

    if (clientsResult.rows.length === 0) {
      return NextResponse.json(
        { clients: [] },
        { status: 200 }
      );
    }

    // Map database results to expected format
    const clients = clientsResult.rows.map(client => {
      // Generate a simplified email from the normalized name
      const nameParts = client.normalized_name.split(' ');
      const firstName = nameParts[0].toLowerCase();
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
      const email = `${firstName}.${lastName}@example.com`;
      
      return {
        id: client.id,
        name: client.name,
        phone: client.phone,
        // Add missing fields required by the frontend
        email,
        role: 'client',
        status: 'active',
        location: '',
        image: `/images/avatars/avatar_${(client.id % 24) + 1}.jpg`,
        lastActive: new Date().toISOString().split('T')[0],
        createdAt: client.createdAt ? new Date(client.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
    });

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        totalItems: totalClients,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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

    // Insert client into database
    const result = await pool.query(`
      INSERT INTO clients (
        full_name,
        normalized_name,
        contact_number
      ) VALUES ($1, $2, $3)
      RETURNING 
        id,
        full_name as name,
        contact_number as phone,
        created_at as "createdAt"
    `, [
      name,
      normalizedName,
      phone
    ]);

    // Generate a simplified email from the normalized name
    const nameParts = normalizedName.split(' ');
    const firstName = nameParts[0].toLowerCase();
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
    const email = `${firstName}.${lastName}@example.com`;
    
    const newClient = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      phone: result.rows[0].phone,
      email,
      role: 'client',
      status: 'active',
      location: '',
      image: `/images/avatars/avatar_${(result.rows[0].id % 24) + 1}.jpg`,
      lastActive: new Date().toISOString().split('T')[0],
      createdAt: result.rows[0].createdAt ? new Date(result.rows[0].createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    };

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
