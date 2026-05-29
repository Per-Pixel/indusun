import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedMasterData } from '@/services/masterDataService';
import { MasterDataOfGurukrupa } from '@/types/masterData';
import { formatIndianNumber } from '@/utils/format';

/**
 * Maps a single MasterDataOfGurukrupa row to the Property shape used by
 * the /properties page. Fields that have no equivalent are given sensible
 * defaults so the page renders without crashing.
 */
function toProperty(r: MasterDataOfGurukrupa) {
  // Derive a human-readable title
  const parts = [r.society_name, r.plot_no].filter(Boolean);
  const title = parts.length ? parts.join(' – Plot ') : `Record #${r.id}`;

  // Status: if cancel_date is set → Unlisted, otherwise Listed
  const status: 'Listed' | 'Unlisted' | 'Sold' | 'Pending' =
    r.cancel_date ? 'Unlisted' : 'Listed';

  // Broker or admin?
  const brokerName = r["broker's_name"];
  const listedBy = brokerName
    ? { id: `broker-${r.id}`, name: brokerName, type: 'Broker' as const, email: '', phone: r.contact_no ?? '' }
    : { id: 'admin', name: 'Admin', type: 'Admin' as const, email: '', phone: '' };

  const dateAdded = r.date_of_form ?? r.date ?? r.emi_paid_date ?? r.created_at ?? '';

  return {
    id: String(r.id),
    title,
    description: [
      r.society_name && `Society: ${r.society_name}`,
      r.plot_no && `Plot No: ${r.plot_no}`,
      r.plot_size && `Size: ${r.plot_size}`,
      r.emi_time && `EMI Term: ${r.emi_time}`,
      r.remarks && `Remarks: ${r.remarks}`,
    ].filter(Boolean).join(' · ') || 'No description available.',
    price: formatIndianNumber(r.plot_amount),
    status,
    isDraft: false,
    images: [],
    targetedLocation: r.society_name ?? '',
    actualLocation: r.society_name ?? '',
    listedBy,
    bedrooms: 0,
    bathrooms: 0,
    squareFootage: r.plot_size ?? '',
    propertyType: 'Plot' as const,
    categories: r.society_name ? [r.society_name] : [],
    displayPages: [
      { page: 'search' as const, enabled: true },
      { page: 'listing' as const, enabled: true },
      { page: 'homepage' as const, enabled: false },
      { page: 'category' as const, enabled: false },
    ],
    dateAdded: dateAdded ? dateAdded.split('T')[0] : '',
    dateModified: r.updated_at ? r.updated_at.split('T')[0] : '',
    // Extra master-data fields surfaced for display
    _clientName: r.client_name ?? '',
    _contactNo: r.contact_no ?? '',
    _plotNo: r.plot_no ?? '',
    _emiAmount: formatIndianNumber(r.emi_amount),
    _paidAmount: formatIndianNumber(r.paid_amount),
    _rNo: r.r_no ?? '',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '50', 10);
  const search = searchParams.get('search') || '';
  const society = searchParams.get('society') || '';
  const status = searchParams.get('status') || '';

  const result = await getPaginatedMasterData({
    page,
    pageSize,
    clientNameFilter: search,
    societyFilter: society,
  });

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }

  let properties = (result.data ?? []).map(toProperty);

  // Client-side status filter (cancel_date logic is already baked into toProperty)
  if (status && status !== 'All') {
    properties = properties.filter((p) => p.status === status);
  }

  return NextResponse.json({ data: properties, count: result.count });
}
