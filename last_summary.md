# Last Summary

Verified and unified data metrics across all CRM pages and Supabase RPCs (`₹29.66 Cr` total paid vs `₹22.07 Cr` EMI installment revenue, `5,401` unique customers vs `90,353` installment/receipt records, `4,484` unique plots [`4,064` sold], and `90,353` bills/receipts), added single and bulk delete, edit, and unlink capabilities across Bills/Invoices, Billing, Transactions, Brokers, Customers, Clients, Properties, Bookings, Leads, and Master Data, and verified everything via `agent-bridge` (`agy`).

## Root Cause of Data Discrepancies

1. **Revenue (`₹29.66 Cr` vs `₹22.07 Cr`)**:
   - Every row in `"Master Data Of Gurukrupa"` (`90,353` rows) is an EMI receipt/installment record.
   - `paid_amount_num` stores actual cash/cheque collected on each receipt (including booking downpayments and multi-EMI payments), totaling **₹29,66,20,023 (`₹29.66 Cr`)** across all rows (**₹28,72,84,970 [`₹28.73 Cr`]** across `86,362` active non-cancelled rows; **₹93,35,053 [`₹93.35 L`]** across `3,991` cancelled rows).
   - `emi_amount_num` stores only the plot's nominal monthly EMI rate, totaling **₹22,07,16,417 (`₹22.07 Cr`)** across active rows (**₹22,98,25,613 [`₹22.98 Cr`]** including cancelled).
   - Dashboard, Reports, Projects, and Bookings summed `paid_amount_num` (`₹29.66 Cr`), while Sales, Billing, Invoices, Transactions, and Brokers summed `emi_amount_num` (`₹22.07 Cr`).
   - Summing `plot_amount_num` across all 90,353 receipt rows counted each plot's price ~20–60 times (`₹1,367.71 Cr`); the true contract value across the **4,484 unique plots** (`4,064` active sold plots) is **₹67.04 Cr** active (**₹74.82 Cr** all plots).
2. **Users / Customers (`5,401` vs `5,421` vs `90,353`)**:
   - There are **5,401 unique customers** across **90,353 installment records**.
   - 19 client names had trailing/leading whitespace in `"Master Data Of Gurukrupa"`, causing untrimmed `COUNT(DISTINCT client_name)` on Sales to report `5,421` while Dashboard/Clients reported `5,401`. Trimmed all `client_name` values in the DB and in `sync_master_data_normalized_cols()`.
   - `/customers` previously displayed `90,353 customers in the system` (raw row count) and computed status KPI cards from only the 25 rows on the current page.
   - `/customers/[id]` previously displayed `paid_amount` from only the single clicked EMI receipt row rather than cumulative payments across all receipts for that plot.
3. **Bills / Invoices (`90,353` bills)**:
   - `/api/invoices` merges custom admin bills (`bills` table) with all `90,353` EMI receipt rows from `"Master Data Of Gurukrupa"`, and previously counted `3,991` cancelled rows as `Paid`.

## Changes Made

1. **Supabase RPCs & Data Normalization (`admin/sql/brokers_and_bills_enhancements.sql`)**:
   - Trimmed `client_name` in `"Master Data Of Gurukrupa"` and in `sync_master_data_normalized_cols()`.
   - Updated `get_master_data_summary_rpc`, `get_sales_aggregates_rpc`, `get_billing_aggregates_rpc`, `get_derived_brokers_rpc`, and `get_unique_clients_rpc` so every endpoint exposes both Collected Paid Revenue (`₹29.66 Cr` total / `₹28.73 Cr` active) and EMI Installment Revenue (`₹22.07 Cr`), plus unique plot counts (`4,484` total / `4,064` sold) and consistent client counts (`5,401`).
2. **Bills, Invoices, Billing & Transactions (`api/bills`, `api/invoices`, `api/billing`, `api/transactions`, UI pages)**:
   - Added single and bulk `DELETE` across `/api/bills`, `/api/invoices`, `/api/invoices/[id]`, `/api/billing`, `/api/transactions`, and `/api/transactions/[id]` (plus `PUT /api/transactions/[id]`) supporting both `b<id>` custom bills and numeric master-data receipt rows.
   - Separated `Custom Bills` vs `EMI Receipts` and `Cancelled` status on `/invoices` and `/billing`, added single/bulk delete on `/invoices`, `/invoices/[id]`, `/billing`, `/billing/transactions`, and `RecentTransactions`.
3. **Brokers Directory & Broker Profile (`api/brokers`, `api/brokers/[id]`, `/brokers`, `/brokers/[id]`)**:
   - Enabled deleting **any** broker (both `directory` and `records`-derived) with choice to **unlink deals** (clears broker fields on master-data rows so the broker does not reappear) or **delete associated deal rows**, plus bulk broker delete and per-deal **Unlink** / **Delete** actions on `/brokers/[id]`.
   - Removed stray file `admin/src/app/api/brokers/[id]/route.ts.new`.
4. **Customers & Clients (`api/customers`, `api/customers/[id]`, `api/clients`, `api/clients/[id]`, UI pages)**:
   - Created `/api/customers/[id]` (`GET`, `PUT`, `DELETE` with `scope=record|customer`) and bulk `DELETE /api/customers`.
   - Updated `/customers` to display database-wide KPIs (`5,401` Unique Customers, `90,353` Total Records, `86,350` Active/Paid, `3,991` Cancelled) and added single/bulk delete (single record or entire customer profile).
   - Updated `/customers/[id]` to group portfolio plots, compute cumulative plot paid amounts across all receipts, and support editing/deleting customers and individual receipts.
   - Replaced mock data in `/clients/[id]` with live API calls and enabled editing/deleting master-data clients in `/api/clients/[id]`.
5. **Master Data, Properties, Bookings, Leads, Dashboard, Reports, Projects & Sales**:
   - Added `DELETE` (single & bulk) and `PATCH`/`PUT` to `/api/master-data`, `/api/properties`, and `/api/properties/[id]`.
   - Wired real single/bulk delete and edit actions into `/master-data` (`DataTable`), `/properties`, `/bookings`, and `/leads`.
   - Unified KPI labels and breakdowns across `/dashboard`, `/reports`, `/projects`, and `/sales`.

## Verified

- `agent-bridge` (`agy`) audit and verification completed with `SUCCESS`.
- `npx tsc --noEmit` in `admin/` passed with 0 errors; `npm run build` compiled all 75 routes cleanly.
