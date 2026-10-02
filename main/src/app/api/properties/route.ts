import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import type { Property } from '@/app/(main)/properties/types';

type MasterProperty = {
  id: number;
  society_name: string | null;
  client_name: string | null;
  plot_no: string | null;
  plot_size: string | null;
  plot_amount: string | null;
  paid_amount: string | null;
  cancel_date: string | null;
  date_of_form: string | null;
  date: string | null;
  remarks: string | null;
};

const fallbackImage = '/auth/properties/property-1.jpg';

function parseAmount(value: string | null) {
  if (!value) return 0;
  const normalized = value.replace(/[^\d.]/g, '');
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : 0;
}

function parseArea(value: string | null) {
  if (!value) return 0;
  const area = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(area) ? area : 0;
}

function formatPrice(amount: number) {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(1)} Lac`;
  return amount ? `₹${amount.toLocaleString('en-IN')}` : 'Price on request';
}

function toProperty(row: MasterProperty): Property {
  const title = [row.society_name, row.plot_no && `Plot ${row.plot_no}`]
    .filter(Boolean)
    .join(' — ') || 'Property listing';
  const areaNumeric = parseArea(row.plot_size);
  const priceNumeric = parseAmount(row.plot_amount);
  const listedDate = row.date_of_form || row.date || undefined;

  return {
    id: String(row.id),
    title,
    type: 'Plot',
    location: row.society_name || 'Bangalore',
    description: row.remarks || 'Property listing from Indusun master data.',
    price: formatPrice(priceNumeric),
    priceNumeric,
    image: fallbackImage,
    area: row.plot_size || 'Area on request',
    areaNumeric,
    featured: !row.cancel_date,
    new: listedDate ? Date.now() - new Date(listedDate).getTime() < 30 * 86_400_000 : false,
    amenities: ['Verified listing'],
    listedDate,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('q')?.trim() || '';
  const type = searchParams.get('type')?.trim() || '';
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('Master Data Of Gurukrupa')
    .select('id,society_name,client_name,plot_no,plot_size,plot_amount,paid_amount,cancel_date,date_of_form,date,remarks')
    .is('cancel_date', null)
    .order('id', { ascending: false });

  if (search) {
    query = query.or(`society_name.ilike.%${search}%,client_name.ilike.%${search}%,plot_no.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: 'Property listings are temporarily unavailable.' }, { status: 503 });
  }

  const properties = (data as MasterProperty[]).map(toProperty).filter((property) => !type || property.type === type);
  return NextResponse.json({ data: properties, count: properties.length }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
