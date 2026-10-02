import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';

const TABLE_NAME = 'Master Data Of Gurukrupa';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      client_name,
      contact_no,
      society_name,
      plot_no,
      plot_size,
      plot_amount,
      paid_amount,
      emi_amount,
      emi_time,
      emi_no,
      emi_paid_date,
      "broker's_name": brokerName,
      date_of_form,
      remarks,
      r_no,
      policy_number,
      cheque_cash,
      month_and_year,
    } = body;

    if (!client_name || !String(client_name).trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const insertData: Record<string, any> = {
      client_name: String(client_name).trim(),
      contact_no: contact_no ? String(contact_no).trim() || null : null,
      society_name: society_name ? String(society_name).trim() || null : null,
      plot_no: plot_no ? String(plot_no).trim() || null : null,
      plot_size: plot_size ? String(plot_size).trim() || null : null,
      plot_amount: plot_amount ? String(plot_amount).trim() || null : null,
      paid_amount: paid_amount ? String(paid_amount).trim() || null : null,
      emi_amount: emi_amount ? String(emi_amount).trim() || null : null,
      emi_time: emi_time ? String(emi_time).trim() || null : null,
      emi_no: emi_no ? String(emi_no).trim() || null : null,
      emi_paid_date: emi_paid_date ? String(emi_paid_date).trim() || null : null,
      "broker's_name": brokerName ? String(brokerName).trim() || null : null,
      date_of_form: date_of_form ? String(date_of_form).trim() || null : null,
      remarks: remarks ? String(remarks).trim() || null : null,
      r_no: r_no ? String(r_no).trim() || null : null,
      policy_number: policy_number ? String(policy_number).trim() || null : null,
      cheque_cash: cheque_cash ? String(cheque_cash).trim() || null : null,
      month_and_year: month_and_year ? String(month_and_year).trim() || null : null,
    };

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error adding customer:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to add customer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, customer: data }, { status: 201 });
  } catch (err: any) {
    console.error('Unexpected error in customers POST:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to add customer' },
      { status: 500 }
    );
  }
}
