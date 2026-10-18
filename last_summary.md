# Last Summary

Replaced every remaining mock/demo module in the admin CRM with live Supabase-backed data, wired four new API routes, fixed the DataTable page-size gap, removed dead test routes, and documented every module in `/guide` + `ADMIN_PANEL_GUIDE.md`.

## Changes Made

1. **New API routes (all persisted via `page_content` reserved slugs — no new migrations needed)**:
   - `/api/cms` (GET/PUT): reads `page_content` sections for schema pages; blogs, SEO entries, banners, custom pages stored under `page_slug = '_cms_registry'`. SEO scores auto-compute from meta length + keyword presence.
   - `/api/media` (GET/POST/DELETE): indexes real assets — official `public/` files (UPI QR, emblems, signature, logo), every file in `public/uploads/`, plus attachments from `internal_messages` and `bills`. Uploads register metadata under `_media_library`; deletions record tombstones.
   - `/api/notifications` (GET/PUT): aggregates live events from `bills`, `Master Data Of Gurukrupa` (registrations, EMI receipts, cancellations), `internal_messages`, and `messages`; read/deleted state stored under `_notifications_state`.
   - `/api/workspace` (GET/PUT): serves calendar events (derived from recent master-data rows + persisted custom events), notes, and tasks under `_workspace`; seeds initial notes/tasks from real records on first visit.
2. **Pages rewired to live data**: `/website-cms` (pages/blog/SEO/banners CRUD), `/media-library` (upload + preview + delete), `/notifications` (live feed + read/unread/delete + top-navbar bell wired to same API with real unread count), `/messages/history` (real `messages` table + CSV export + detail modal), `/properties/export` (live `/api/properties`, society + date + status filters), `/components/calendar`, `/components/notes`, `/components/tasks` (persistent CRUD via `/api/workspace`).
3. **DataTable page-size**: added `onPageSizeChange` prop; `/master-data` now keeps `pageSize` in state and refetches (50/100/200).
4. **Cleanup**: deleted dead dev-only routes `/supabase-test`, `/supabase-example`, `/test-pagination`; no `MOCK_*` constants remain in `src/`.
5. **Docs**: `/guide` gained a "Live Modules" tab with per-module explanations (what it is, data source, how it works) and an expanded sitemap; `ADMIN_PANEL_GUIDE.md` gained Section 10 covering all eight modules + API map, nav-map corrections (removed stale `/sales-team`, added Workspace/Content/Message History rows).
6. **Deps**: added `date-fns@4.1.0` (calendar rendering).

## Verified

- `npm run build` passes (all new APIs + pages bundled).
- Live smoke tests on `localhost:3001`: `/api/cms`, `/api/media`, `/api/notifications`, `/api/workspace?type=notes|tasks|calendar` all return 200 with real payloads.
- `sql/brokers_and_bills_enhancements.sql` applied to Supabase (sequence set to 90353; trigram indexes present).

## Pending / Watch

- User's broker/search enhancements (broker codes `ba_code`, broker profile pages, expanded search across broker fields) are uncommitted — include in this session's commit batch.
- Vercel project `admin` deployed manually via `vercel --prod`; GitHub auto-deploy still needs the Vercel GitHub App granted access to `Per-Pixel/indusun` + root dir `admin`.
- Uploads in `/api/uploads` still write to local `public/uploads` (ephemeral on Vercel); production-hardening would move them to Supabase Storage.
