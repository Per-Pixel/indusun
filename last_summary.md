# Last Summary

Ran a full DB-vs-website verification, fixed everything found, cleaned the production data, and shipped it all. The verifier now reports **22/22 live checks pass** — every number the admin app shows matches the database exactly.

## Verification result (post-fix)

- Sales: 86,542 transactions, ₹22,07,17,567 revenue, 5,421 clients, 329 brokers, 4,661 properties, 4,212 sold
- Billing: same revenue, ₹0 pending, 86,542 completed / 90,352 total, 3,810 cancelled deals (₹91,03,046)
- Invoices 90,351 paid / 1 pending, transactions/properties 90,352, brokers 329, admin users 1
- `/api/health`: all 14 checks green

## Fixes applied

1. **`parseAmount` hardened** (`dataUtils.ts`): multi-amount cells like `"(80000/-1), (89600/-4), (11520/-1)"` now sum the `/-` parts instead of concatenating digits — dashboard Total Plot Amount went from ₹8×10¹⁷ nonsense to the real ₹136.8 Cr.
2. **Cancelled deals separated**: `/api/sales` and `/api/billing` exclude cancelled rows from revenue/completed counts and report `cancelledTransactions`/`cancelledRevenue` (+ `cancelledCount`/`cancelledAmount`). New "Cancelled Deals" stat card on both pages (red, shows count + written-off amount).
3. **Broker count fixed**: `/api/sales` now trims + case-dedupes `broker's_name` — 337 phantom count → real 329, matching the brokers page. Broker dropdown uses clean names; filter compares trimmed values.
4. **`normalizeDate` guard**: pure-integer strings outside Excel-serial range no longer parse as dates (`new Date('150')` was year 150).
5. **Public site pagination**: `main/src/app/api/properties/route.ts` batches through the ~1000-row PostgREST cap — all 86,488 live listings now returned (was silently ~1,000) with a real count.

## Production data cleanup (applied via PostgREST)

- `cancel_date`: `'CANSAL'`(3,303)/`'DASTAVEJ'`(489)/`'PLOT TRF'`(2)/stray numbers(6) → `'Cancelled'`; date strings → ISO (~15); whitespace-only → `NULL` (54 rows now correctly listed, not cancelled)
- `paid_amount`: 40 non-numeric values (`'PENDING'`,`'BAKI'`,`'OM'`,`'DONE'`,`'ADJUST'`,`'0'`) → `NULL` (removed phantom bookings)
- `broker's_name`: 851 rows trimmed of stray whitespace, 1 whitespace-only → `NULL`
- Gotcha: supabase-js `.update()` can't write `broker's_name` (PostgREST splits on the apostrophe) — raw REST `PATCH ?columns=%22broker's_name%22` works (`scripts/cleanup-brokers.mjs`)
- **Left untouched**: row id=1608 `plot_amount` — ambiguous whether `/-N` parts are totals or per-plot counts; displays sanely now via parseAmount either way

## Scripts (all re-runnable)

- `admin/scripts/verify-data.mjs` — full DB-vs-live-API verifier, mints auth session via service role
- `admin/scripts/cleanup-data.mjs` / `cleanup-brokers.mjs` — the cleanup that ran (dry-run default, `--apply` to write)
- `admin/scripts/verify-anomalies.mjs`, `verify-brokers.mjs`, `test-broker-update.mjs` — ad-hoc probes

## Notes

- Post-cleanup figures changed: completed 86,542 (was 86,488), cancelled 3,810 (was 3,864), revenue ₹22.07Cr (was ₹22.98Cr — cancelled ₹91L now excluded from revenue)
- Per-row invoice/transaction status still labels cancelled rows "Completed" — summary cards are honest, per-row status isn't (follow-up candidate)
- Dev server on :3001 is running (restarted during verification); `bills`/`brokers` tables exist but are empty
