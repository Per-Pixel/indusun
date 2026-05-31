// Type definition for Supabase table: "Master Data Of Gurukrupa"

export interface MasterDataOfGurukrupa {
  id: number;
  r_no: string | null;
  society_name: string | null;
  client_name: string | null;
  contact_no: string | null;
  plot_no: string | null;
  plot_size: string | null;
  emi_paid_date: string | null;
  plot_amount: string | null;
  emi_amount: string | null;
  paid_amount: string | null;
  amount_in_word: string | null;
  emi_time: string | null;
  "broker's_name": string | null; // Note: special character in column name
  cheque_cash: string | null;
  remarks: string | null;
  emi_no: string | null;
  month_and_year: string | null;
  yes: string | null;
  policy_number: string | null;
  date: string | null;
  cancel_date: string | null;
  date_of_form: string | null;
  created_at?: string;
  updated_at?: string;
}

// Summary statistics type
export interface MasterDataSummary {
  totalRecords: number;
  totalClients: number;
  uniqueSocieties: number;
  uniqueBrokers: number;
  totalPlotAmount: number;
  totalPaidAmount: number;
  listedProperties: number;
  soldProperties: number;
  cancelledProperties: number;
  propertiesBySociety: { name: string; count: number }[];
  monthlyListings: { month: string; count: number }[];
}
