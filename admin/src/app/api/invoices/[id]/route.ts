import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { parseAmount, normalizeDate, isPaid } from '@/utils/dataUtils';

const TABLE_NAME = 'Master Data Of Gurukrupa';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createServiceClient();

    // ── Custom bill (id = "b123") ─────────────────────────────────────────────
    if (id.startsWith('b')) {
      const billId = parseInt(id.slice(1));
      if (isNaN(billId)) {
        return NextResponse.json({ error: 'Invalid bill ID' }, { status: 400 });
      }
      const { data: bill, error: billErr } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .limit(1)
        .single();
      if (billErr || !bill) {
        return NextResponse.json({ error: 'Bill not found' }, { status: 404 });
      }
      const b = bill as any;
      const amt = parseFloat(b.amount) || 0;
      const fmt = (n: number) =>
        `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`;
      const amtFmt = fmt(amt);

      const storedItems = Array.isArray(b.items) ? b.items : [];
      const items = storedItems.length > 0
        ? storedItems.map((it: any) => ({
            description: it.description || '',
            quantity:    it.quantity ?? 1,
            unitPrice:   fmt(parseFloat(it.unit_price ?? it.unitPrice) || 0),
            total:       fmt((parseFloat(it.unit_price ?? it.unitPrice) || 0) * (it.quantity ?? 1)),
          }))
        : [{
            description: b.description || b.bill_number,
            quantity:    1,
            unitPrice:   amtFmt,
            total:       amtFmt,
          }];

      const taxRate  = parseFloat(b.tax_rate) || 0;
      const discount = parseFloat(b.discount) || 0;
      const subtotal = items.reduce((s: number, it: any) => s + (parseFloat(String(it.total).replace(/[^\d.]/g, '')) || 0), 0);

      return NextResponse.json({
        invoice: {
          id:            `b${b.id}`,
          invoiceNumber: b.bill_number,
          date:          b.date     || null,
          dueDate:       b.due_date || b.date || null,
          amount:        amtFmt,
          amountNum:     amt,
          status:        b.status === 'Paid' ? 'Paid' : 'Pending',
          client: {
            name:    b.client_name,
            type:    'Individual',
            id:      `b${b.id}`,
            phone:   b.client_phone   || null,
            address: b.client_address || null,
          },
          property:      b.description ? { id: `b${b.id}`, title: b.description } : undefined,
          broker:        null,
          generatedBy:   'Admin',
          generatorName: null,
          notes:         b.notes || null,
          paymentMethod: b.payment_method || '—',
          paymentRef:    b.payment_ref || null,
          items,
          subtotal:      fmt(subtotal || amt),
          taxRate,
          taxAmount:     fmt(subtotal ? (subtotal * taxRate) / 100 : 0),
          discount:      fmt(discount),
        },
      });
    }

    // ── Master data (numeric id) ──────────────────────────────────────────────
    const rowId = parseInt(id);
    if (isNaN(rowId)) {
      return NextResponse.json({ error: 'Invalid invoice ID' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', rowId)
      .limit(1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const row = data as any;
    const paid   = isPaid(row.emi_paid_date);
    const d      = paid ? normalizeDate(row.emi_paid_date) : null;
    const amount = parseAmount(row.emi_amount);
    const amountFormatted = `Rs. ${new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;
    const propertyTitle = [row.society_name, row.plot_no ? `Plot ${row.plot_no}` : null].filter(Boolean).join(' – ') || null;

    return NextResponse.json({
      invoice: {
        id:            String(row.id),
        invoiceNumber: row.r_no || row.emi_no || `INV-${String(row.id).padStart(6, '0')}`,
        date:          d,
        dueDate:       d,
        amount:        amountFormatted,
        amountNum:     amount,
        status:        paid ? 'Paid' : 'Pending',
        client: {
          name:  row.client_name || 'Unknown',
          type:  'Individual',
          id:    String(row.id),
          phone: row.contact_no  || null,
        },
        property: propertyTitle
          ? { id: String(row.id), title: propertyTitle }
          : undefined,
        broker:        row["broker's_name"] || null,
        generatedBy:   'System',
        generatorName: null,
        items: [{
          description: propertyTitle || `EMI Payment – ${row.r_no || row.emi_no || `INV-${String(row.id).padStart(6, '0')}`}`,
          quantity:    1,
          unitPrice:   amountFormatted,
          total:       amountFormatted,
        }],
      },
    });
  } catch (error: any) {
    console.error('Invoice detail API error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}
