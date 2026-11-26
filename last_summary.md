# Last Summary

The Gurukrupa master-workbook import now updates receipts that are already stored, and still adds new ones. Commit `9573ddb` is on `main` at https://github.com/Per-Pixel/indusun.git. Admin production is https://admin-liard-chi-50.vercel.app (deployment `dpl_D4ZTbjNXpPoX5hA4jYcnWSfwASZU`).

A stored receipt matches on receipt number, society, plot, EMI number, and client. Paid amount, date, phone, broker, remarks, and the other ledger fields are replaced from the file. The import button stays available when every selected receipt is already stored.
