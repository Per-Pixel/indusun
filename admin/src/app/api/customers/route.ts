import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { invalidateServerCache } from '@/utils/serverCache';

const TABLE_NAME = 'Master Data Of Gurukrupa';

function cleanStr(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s || null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      client_name,
      father_or_husband_name,
      age,
      date_of_birth,
      profession,
      address,
      contact_no,
      resident_no,
      aadhar_no,
      pan_no,
      nominee_name,
      nominee_relation,
      nominee_age,
      nominee_dob,
      nominee_profession,
      society_name,
      block_name,
      plot_no,
      plot_size,
      plot_amount,
      paid_amount,
      amount_in_word,
      emi_amount,
      emi_time,
      emi_no,
      emi_date,
      emi_paid_date,
      "broker's_name": brokerName,
      broker_code,
      ba_code,
      date_of_form,
      date,
      remarks,
      r_no,
      registration_no,
      policy_number,
      cheque_cash,
      month_and_year,
      applicant_photo,
    } = body;

    if (!client_name || !String(client_name).trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }

    const regNo = cleanStr(registration_no) || cleanStr(r_no);
    const baOrBrokerCode = cleanStr(ba_code) || cleanStr(broker_code);
    const resolvedBrokerName = cleanStr(brokerName) || baOrBrokerCode;

    const insertData: Record<string, any> = {
      client_name: String(client_name).trim(),
      father_or_husband_name: cleanStr(father_or_husband_name),
      age: cleanStr(age),
      date_of_birth: cleanStr(date_of_birth),
      profession: cleanStr(profession),
      address: cleanStr(address),
      contact_no: cleanStr(contact_no),
      resident_no: cleanStr(resident_no),
      aadhar_no: cleanStr(aadhar_no),
      pan_no: cleanStr(pan_no),
      nominee_name: cleanStr(nominee_name),
      nominee_relation: cleanStr(nominee_relation),
      nominee_age: cleanStr(nominee_age),
      nominee_dob: cleanStr(nominee_dob),
      nominee_profession: cleanStr(nominee_profession),
      society_name: cleanStr(society_name),
      block_name: cleanStr(block_name),
      plot_no: cleanStr(plot_no),
      plot_size: cleanStr(plot_size),
      plot_amount: cleanStr(plot_amount),
      paid_amount: cleanStr(paid_amount),
      amount_in_word: cleanStr(amount_in_word),
      emi_amount: cleanStr(emi_amount),
      emi_time: cleanStr(emi_time),
      emi_no: cleanStr(emi_no),
      emi_date: cleanStr(emi_date),
      emi_paid_date: cleanStr(emi_paid_date),
      "broker's_name": resolvedBrokerName,
      broker_code: cleanStr(broker_code) || baOrBrokerCode,
      ba_code: baOrBrokerCode,
      date_of_form: cleanStr(date_of_form),
      date: cleanStr(date) || cleanStr(date_of_form),
      remarks: cleanStr(remarks),
      r_no: regNo,
      registration_no: regNo,
      policy_number: cleanStr(policy_number),
      cheque_cash: cleanStr(cheque_cash),
      month_and_year: cleanStr(month_and_year),
      applicant_photo: cleanStr(applicant_photo),
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

    invalidateServerCache();

    return NextResponse.json({ success: true, customer: data }, { status: 201 });
  } catch (err: any) {
    console.error('Unexpected error in customers POST:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to add customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const rawIds: unknown[] = Array.isArray(body?.ids) ? body.ids : [];
    const scope: 'record' | 'customer' = body?.scope === 'customer' ? 'customer' : 'record';

    const validIds = rawIds
      .map((v) => Number(v))
      .filter((n) => Number.isFinite(n) && n > 0);

    if (validIds.length === 0) {
      return NextResponse.json({ error: 'No valid record IDs provided' }, { status: 400 });
    }

    const supabase = createServiceClient();

    if (scope === 'customer') {
      const { data: rows, error: fetchErr } = await supabase
        .from(TABLE_NAME)
        .select('id,client_name')
        .in('id', validIds);

      if (fetchErr) {
        return NextResponse.json(
          { error: fetchErr.message || 'Failed to look up customers' },
          { status: 500 }
        );
      }

      const uniqueNames = Array.from(
        new Set(
          (rows || [])
            .map((r: any) => String(r.client_name || '').trim())
            .filter(Boolean)
        )
      );

      for (const name of uniqueNames) {
        const { error: delErr } = await supabase
          .from(TABLE_NAME)
          .delete()
          .ilike('client_name', name);

        if (delErr) {
          return NextResponse.json(
            { error: delErr.message || `Failed to delete records for ${name}` },
            { status: 500 }
          );
        }

        await supabase.from('clients').delete().ilike('name', name);
      }

      // Also delete any selected rows that had empty client_name
      await supabase.from(TABLE_NAME).delete().in('id', validIds);

      invalidateServerCache();
      return NextResponse.json({
        success: true,
        scope: 'customer',
        deletedClients: uniqueNames.length,
        deletedIds: validIds.length,
      });
    }

    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .in('id', validIds);

    if (error) {
      return NextResponse.json(
        { error: error.message || 'Failed to delete customer records' },
        { status: 500 }
      );
    }

    invalidateServerCache();
    return NextResponse.json({
      success: true,
      scope: 'record',
      deletedCount: validIds.length,
    });
  } catch (err: any) {
    console.error('Unexpected error in customers DELETE:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to delete customer records' },
      { status: 500 }
    );
  }
}
