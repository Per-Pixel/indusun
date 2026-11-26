# Last Summary

The Gurukrupa master-workbook import now writes the Excel values onto receipts that are already stored, and still adds receipts that are not in the database.

A stored receipt matches on receipt number, society, plot, EMI number, and client. Paid amount, date, phone, broker, remarks, and the other ledger fields are replaced from the file. If several stored rows share that identity, only an exact match (including date and amount) is updated, so two instalments are not collapsed.

The import button stays available when every selected receipt is already stored. It reads “Update N receipts from this file”, or “Update N and import M” when the file also has new rows.
