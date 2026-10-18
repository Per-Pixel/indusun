# Last Summary

Added all missing Gurukrupa Corporation Application Form fields to the Add Customer form (`/customers/add`), Customer API (`/api/customers`), and Customer Profile view (`/customers/[id]`), migrated `"Master Data Of Gurukrupa"` in Supabase (`ebhnbnewthtzhxsinuad`), fixed the missing auto-increment sequence on `"Master Data Of Gurukrupa".id`, and seeded Application Form `#9003` (`Ashok Kumar Varma S/O - Rampal Varma`).

## Changes Made

1. **Database Schema & Trigger (`"Master Data Of Gurukrupa"` & `admin/sql/brokers_and_bills_enhancements.sql`)**:
   - Added auto-incrementing sequence `public.master_data_of_gurukrupa_id_seq` as the default for `"Master Data Of Gurukrupa".id` so new customer/property inserts no longer fail with a `NOT NULL` constraint violation on `id`.
   - Added columns: `registration_no`, `ba_code`, `father_or_husband_name`, `age`, `date_of_birth`, `profession`, `address`, `resident_no`, `aadhar_no`, `pan_no`, `nominee_name`, `nominee_relation`, `nominee_age`, `nominee_dob`, `nominee_profession`, `emi_date`, and `applicant_photo`.
   - Updated `public.sync_master_data_normalized_cols()` so explicitly provided `block_name`, `ba_code`, `broker_code`, and `registration_no` values are preserved.
   - Inserted Application Form `#9003` (`Ashok Kumar Varma S/O - Rampal Varma`, BA Code `BS`, `ROYAL CITY ( I/BLOCK )`, Block `I`, Plot `219, 220`, Size `14x36`, DOB `1979-06-20`, Profession `Job`, Address `H No. 2198, Pragati Nagar, Gandhiwadi, Umbergam, Valsad, Umbergam, Gujarat - 396170`, Mobile `8401348543`, Aadhar `753000774699`, EMI `5000`, Payment Mode `Transfer`, EMI Date `15 to 20`, Date `2026-10-01`).
2. **Add Customer Form (`admin/src/app/customers/add/page.tsx`)**:
   - Added inputs for Registration No. (`r_no` / `registration_no`), Application Date, BA Code (`ba_code`), Broker Name, Society Name (with live datalist), Block (`block_name`), Plot No., Size (with presets), Applicant Full Name, Father/Husband Name (`S/O, D/O, W/O`), Date of Birth (auto-calculates Age), Age, Profession, Residential Address, Mobile No., Resident/Alternate No., Applicant Passport Photo upload, Aadhar No., PAN No., Policy No., Nominee Details (Name, Relation, DOB, Age, Profession), Enclosed EMI of Rs., Payment Mode (`Transfer`, `Cash`, `Cheque`, `UPI`, etc.), Monthly EMI Date cycle (`15 to 20`), Total Plot Amount, Paid Amount, Total EMI Months, EMI No., auto-computed Amount in Words, and Remarks.
   - Added an interactive **Preview Application Form** toggle with print support matching the physical Gurukrupa Corporation Application Form layout.
3. **API, Service & Profile View (`admin/src/app/api/customers/route.ts`, `admin/src/services/masterDataService.ts`, `admin/src/app/customers/[id]/ProfileContent.tsx`, `admin/src/types/masterData.ts`)**:
   - Wired all new fields through `POST /api/customers`, search filters, and the Customer Profile page.
