import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get query parameters for pagination and search
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10'); // 10 brokers per page
    const search = url.searchParams.get('search') || '';
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit;
    
    // Build the query based on search parameter
    let query = `
      SELECT 
        id,
        full_name,
        normalized_name as name,
        contact_number as phone,
        created_at as "createdAt"
      FROM brokers
    `;
    
    let countQuery = `SELECT COUNT(*) FROM brokers`;
    const queryParams = [];
    
    // Add search condition if search parameter is provided
    if (search) {
      query += `
        WHERE 
          normalized_name ILIKE $1 OR
          contact_number ILIKE $1
      `;
      countQuery += `
        WHERE 
          normalized_name ILIKE $1 OR
          contact_number ILIKE $1
      `;
      queryParams.push(`%${search}%`);
    }
    
    // Add sorting and pagination
    query += `
      ORDER BY normalized_name ASC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    // Add limit and offset parameters
    queryParams.push(limit, offset);
    
    // Execute the queries
    const [brokersResult, countResult] = await Promise.all([
      executeQuery(query, queryParams),
      executeQuery(countQuery, search ? [queryParams[0]] : [])
    ]);
    
    // Calculate total pages
    const totalBrokers = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalBrokers / limit);
    
    // Define broker type
    interface BrokerRow {
      id: number;
      name: string;
      phone?: string;
      createdAt: string;
    }
    
    // Map database results to expected format
    const brokers = brokersResult.rows.map((broker: BrokerRow) => {
      // Generate a simplified email from the name (which is now normalized_name)
      const nameParts = broker.name.split(' ');
      const firstName = nameParts[0].toLowerCase();
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';
      const email = `${firstName}.${lastName}@indusun.com`;
      
      return {
        id: broker.id,
        name: broker.name,
        email,
        phone: broker.phone || '',
        role: 'broker',
        status: 'active',
        image: `/images/avatars/avatar_${(broker.id % 24) + 1}.jpg`,
        location: 'India',
        lastActive: new Date().toISOString().split('T')[0],
        createdAt: broker.createdAt ? new Date(broker.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };
    });
    
    return NextResponse.json({
      brokers,
      pagination: {
        page,
        limit,
        totalItems: totalBrokers,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching brokers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brokers' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { name, phone } = data;
    
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
    
    // Insert broker into database
    const result = await executeQuery(`
      INSERT INTO brokers (
        full_name,
        normalized_name,
        contact_number
      ) VALUES ($1, $2, $3)
      RETURNING 
        id,
        normalized_name as name,
        contact_number as phone,
        created_at as "createdAt"
    `, [
      name,
      normalizedName,
      phone || ''
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
    console.error('Error creating broker:', error);
    return NextResponse.json(
      { error: 'Failed to create broker' },
      { status: 500 }
    );
  }
}
