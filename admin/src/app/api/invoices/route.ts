import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';

const TABLE_NAME = 'Master Data Of Gurukrupa';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page   = Math.max(1, parseInt(searchParams.get('page')  || '1'));
    const limit  = Math.max(1, parseInt(searchParams.get('limit') || '25'));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'All';
    const offset = (page - 1) * limit;
    const supabase = createServiceClient();

    // Build filtered query
    let query = supabase.from(TABLE_NAME).select('*', { count: 'exact' });
    if (search) query = query.or(`client_name.ilike.%${search}%,society_name.ilike.%${search}%`);
    if (status === 'Paid')    query = query.not('emi_paid_date', 'is', null).neq('emi_paid_date', '');
    if (status === 'Pending') query = query.or('emi_paid_date.is.null,emi_paid_date.eq.');

    const { data, error, count } = await query
      .order('id', { ascending: false })
      .range(offset, offset + limit - 1);
    if (error) throw new Error(error.message);

    // Fast COUNT-only queries for summary (no data transfer)
    const [paidRes, pendingRes] = await Promise.all([
      supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true })
        .not('emi_paid_date', 'is', null).neq('emi_paid_date', ''),
      supabase.from(TABLE_NAME).select('*', { count: 'exact', head: true })
        .or('emi_paid_date.is.null,emi_paid_date.eq.'),
    ]);

    const invoices = (data || []).map((row: any) => {
      const paid   = isPaid(row.emi_paid_date);
      const d      = paid ? normalizeDate(row.emi_paid_date) : null;
      const amount = parseAmount(row.emi_amount);
      return {
        id:            String(row.id),
        invoiceNumber: row.r_no || row.emi_no || `INV-${String(row.id).padStart(6, '0')}`,
        date:          d || (paid ? String(row.emi_paid_date).trim() : null),
        amount:        `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`,
        amountNum:     amount,
        status:        paid ? 'Paid' : 'Pending',
        client: {
          name: row.client_name || 'Unknown',
          type: 'Individual',
          id:   String(row.id),
        },
        property: row.society_name
          ? { id: String(row.id), title: [row.society_name, row.plot_no ? `Plot ${row.plot_no}` : null].filter(Boolean).join(' – ') }
          : undefined,
        broker: row["broker's_name"] || null,
      };
    });

    return NextResponse.json({
      invoices,
      pagination: { page, limit, totalItems: count || 0, totalPages: Math.ceil((count || 0) / limit) },
      summary: {
        paidCount:    paidRes.count    || 0,
        pendingCount: pendingRes.count || 0,
        totalCount:   (paidRes.count || 0) + (pendingRes.count || 0),
      },
    });

  } catch (error: any) {
    console.error('Invoices API error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
