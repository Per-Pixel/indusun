# Last Summary

Built the Brokers & Codes directory into the CRM and made broker name / GKC code / BA code searchable across every customer-facing surface. Brokers now have real profile pages listing their deals and customers.

## Changes Made

1. **CRM navigation**: added "Brokers & Codes" (`/brokers`) to the CRM sidebar group; global ⌘K search in `AdminTopNavbar` gained a Brokers quick-link and a second action — "Search Brokers" alongside "Search Master Data" — with a code-aware placeholder.
2. **`/brokers` page (rewritten)**: shows name, broker/BA code (amber badge + copy button), full record identifier, deal count, collected revenue, contact; filter pills (All / With Code / Direct-Named); sort by deals, revenue, code, or name; deep-links `?search=` and `?filter=`; per-row actions to view deals, open that broker's customers, edit, and delete (delete only for directory brokers).
3. **`/brokers/[id]` (rewritten, was stale mock data)**: real broker profile — code + full record identifier with copy, contact, commission, RERA, KPIs (deals, collected revenue, societies), and a filterable table of all their customers/plots from master data linking to `/customers/[id]`.
4. **`/api/brokers`**: merges directory rows + `get_derived_brokers_rpc` (deduped by `raw_identifier` key so same-name brokers with different codes aren't dropped); search now covers `name`, `broker_code`, `raw_identifier`, phone, email, location, RERA plus punctuation-insensitive compact matching; new `filter` (all/coded/uncoded/directory/records) and `sort` params; POST auto-builds `raw_identifier` from `broker_code/name` and invalidates the RPC cache.
5. **`/api/brokers/[id]`**: resolves `t<id>`, plain ids, broker codes, raw identifiers, or clean names against both the `brokers` table and derived stats — so `/brokers/GKC%2F10%2FRS` works; returns broker + stats + up to 100 linked master-data deals matched by `"broker's_name"`/`broker_code`/`ba_code`. PUT on a records-derived broker now promotes it into the directory instead of 405; DELETE stays directory-only.
6. **Search coverage**: `masterDataService` OR clause now includes `broker_code`, `ba_code`, `broker_name_clean` and resolves broker-directory matches (name→code→raw_identifier) as exact-match clauses — searching `JUBER` or `GKC/10/RS` in Customers/Master Data finds all their rows. Same three columns added to invoices, billing, and transactions search. `getUniqueBrokers` merges derived names with directory codes.
7. **Bug fixes found while wiring**: `.eq("broker's_name", …)` in `transactions` route was invalid PostgREST (parsed column `broker`) — replaced with quoted OR filter, same fix applied to the `brokerFilter` param in `masterDataService`. `/api/master-data` now accepts `search` and `broker` params. `/master-data` reads `?search=`/`?broker=`/`?society=` deep links and has a broker dropdown. `api/media` spread of `{societies, error}` fixed (pre-existing type error). Customer profile broker card + customer-card broker name now show the code badge and link to the broker profile.
8. **Data**: inserted 22 broker identifiers from `scripts/data/ALL BROKERS NAME.xlsx` that were missing from the `brokers` table.
9. **Deps**: `date-fns@4.1.0` (was imported by calendar but never installed — blocked every build).

## Verified

- `npm run build` green; `tsc --noEmit` clean.
- Live on dev server: `/api/brokers` → 350 brokers / 202 coded / 90,142 deals; `?search=JUBER` → 13 brokers; `?search=GKC/10/RS` → JUBER (GKC/10/RS/JUBER); `/api/brokers/t1` and `/api/brokers/GKC%2F10%2FRS` both return JUBER with 16 real deals; `/api/master-data?search=GKC/10/RS` → 16 rows; `?broker=GKC/10/RS/JUBER` → 16 rows.

## Pending / Watch

- Vercel deploys manually (`vercel --prod` in `admin/`); GitHub auto-deploy needs the Vercel GitHub App on `Per-Pixel/indusun` with root `admin`.
- Derived brokers delete stays disabled by design — remove the name from master-data rows instead.
