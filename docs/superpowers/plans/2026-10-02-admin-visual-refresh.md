# Admin Visual Refresh — Client-Site Alignment + Lead Follow-Up Queue

Date: 2026-10-02 · Status: In progress

## Goal
Re-skin the Indusun admin panel to match the public client site (white surfaces,
blue `#2563EB` actions/active states, charcoal text, white→blue topbar, warm-tinted
inputs), improve layout/hierarchy/responsive behavior and purposeful motion —
without removing a single route, edit, or add flow. Replace invented dashboard
metrics (percentage-derived "lead sources", fake trends) with a real, derived
"new enquiries to contact" queue.

## Architecture
- Next.js 15 App Router, React 19, Tailwind v4 tokens in `globals.css`, Framer Motion.
- Server components fetch data (`dashboard/page.tsx`); `DashboardContent` renders.
- `leadService.ts` derives `lead_status`/`lead_score` from `Master Data Of Gurukrupa`.
  No persisted follow-up schema — queue is derived & labeled as such.
- `AdminAuthContext.hasPermission` gates role-focused dashboard views
  (`lead_management`, `property_management`, `billing_management`/`financial_reports`,
  `messaging`/`internal_comms`, admin fallback).

## Global constraints
- Keep all 20+ routes, CRUD, auth, billing, CMS, exports intact.
- No fabricated metrics; label derived data.
- Motion: 150–250ms, interruptible, `prefers-reduced-motion` honored, no page-load choreography.
- Preserve semantic success/warning/danger/info colors.

## Tasks
1. `admin/src/app/globals.css` — new token system, shell/table/badge/btn/input,
   ops components, responsive + reduced-motion. ✅
2. `admin/src/app/layout.tsx` — Geist font vars, blue toast accent. ✅
3. `admin/src/components/CRMLayout.tsx` — collapsed-rail desktop sidebar,
   mobile drawer, realtime subscriptions kept. ✅
4. `admin/src/components/dashboard/Sidebar.tsx` — `isCollapsed` prop, blue active
   states, chevron wrapper, live-sync footer.
5. `admin/src/components/AdminTopNavbar.tsx` — command-palette trigger styling,
   aria attributes, blue accents.
6. `admin/src/app/dashboard/page.tsx` — also fetch leads for the queue.
7. `admin/src/app/dashboard/DashboardContent.tsx` — blue hero + metric rail,
   focus tabs, enquiry queue panel, retinted charts, removed fake sources/trends.
8. Verify: `npm run build`, `npm run lint`, browser desktop/mobile inspection,
   Impeccable detector on changed files.
9. Replace `last_summary.md` with session summary.

## Tests / expected output
- Build & lint pass clean.
- Sidebar collapses to icon rail on desktop, slides as drawer on mobile.
- Search ⌘K, notifications, profile, logout all still work.
- Dashboard shows real enquiry queue; no invented percentages.
- Queue rows link into `/leads`.
