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
  project_name?: string | null;
  block_name?: string | null;
  broker_code?: string | null;
  broker_name_clean?: string | null;
  plot_amount_num?: number | null;
  paid_amount_num?: number | null;
  emi_amount_num?: number | null;
  emi_paid_date_iso?: string | null;
  form_date_iso?: string | null;
  registration_no?: string | null;
  ba_code?: string | null;
  father_or_husband_name?: string | null;
  age?: string | null;
  date_of_birth?: string | null;
  profession?: string | null;
  address?: string | null;
  resident_no?: string | null;
  aadhar_no?: string | null;
  pan_no?: string | null;
  nominee_name?: string | null;
  nominee_relation?: string | null;
  nominee_age?: string | null;
  nominee_dob?: string | null;
  nominee_profession?: string | null;
  emi_date?: string | null;
  applicant_photo?: string | null;
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
  activePaidAmount?: number;
  cancelledPaidAmount?: number;
  totalEmiAmount?: number;
  uniquePlots?: number;
  uniqueSoldPlots?: number;
  uniquePlotValue?: number;
  listedProperties: number;
  soldProperties: number;
  cancelledProperties: number;
  propertiesBySociety: { name: string; count: number }[];
  monthlyListings: { month: string; count: number }[];
}
