# Last Summary

Gurukrupa master-workbook import, a Biller role, bulk bill printing, and a tighter receipt layout. Not committed or deployed.

## Workbook

`MASTER COPY GURUKRUPA CO.xlsx` is a 124 MB accounts file. The property ledger is **MAIN SHEET** only: columns A–T match `Master Data Of Gurukrupa` (receipt no, society, client, phone, plot, size, EMI date, plot amount, EMI, paid, words, tenure, broker, cash/cheque, remarks, EMI no, month/year, yes, policy, date). About 97,400 usable receipt rows and 65 real societies. Row 2 is an ॐ placeholder. `OM` in paid amount is empty. Month/year values like `22017` are `2/2017`. Remarks containing “cancel” set `cancel_date`.

Other sheets are not the ledger. Cash book, petty cash, salary, and broker commission stay out. **A.C BOOK** and MAIN SHEET both claim a used range out to column AMK, which is why SheetJS and the 10 MB upload limit could not open the original file. The new importer reads only MAIN SHEET.

## Import

Excel Import recognises the master workbook and asks for one property or all of them. Rows post in batches to `/api/data-import/gurukrupa`. A repeat import skips matches on receipt number, society, plot, EMI number, paid date, amount, and client. Existing rows are not updated. Parser check on the real file: 97,441 rows, 65 societies, 11s, sample receipt 2 maps to Shiv Sai Nagar / 10 Feb 2017.

## Biller

Role slug `biller`, permission `billing_management` only. It is inserted the next time an admin opens Roles or Admin Users (and it is in `admin/sql/admin_roles.sql`). Login sends that role to `/billing`. Sales, reports, the admin dashboard, imports, user management, and revenue totals are blocked in the page guard and on the APIs. Individual bill amounts stay visible so a bill can be prepared. Assign the role on an admin user before expecting the new dashboard.

## Bills

Invoices can be multi-selected and printed. Each Gurukrupa receipt is 190mm wide on A4 and starts on its own page. The receipt keeps the same fields, banks, QR, note, and signature, with cleaner type and rules.

## Verification

`npx tsc --noEmit` in `admin` passed. The workbook parser was run against the original file. The signed-in admin UI was not clicked through in a browser, so login redirect, print preview, and a live database insert still need a pass with a real account.

## Next step

Open Admin Users, confirm Biller is listed, create a biller login, then import one small society from the master workbook and print two bills.
