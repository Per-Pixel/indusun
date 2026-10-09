# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The user identified the audience as “all” admin personas rather than one team. The existing portal serves sales and CRM, property operations, website/content, finance, communications, and system administration roles.

## Product Purpose

Indusun’s admin portal is an internal real-estate CRM and operations workspace. Its documented and implemented workflows cover property and project inventory, leads and customers, brokers, site visits, bookings, sales, billing and invoices, website content, team communications, and administration. The user’s highest-priority dashboard addition is lead follow-up triage, and they want the shared dashboard’s emphasis to adapt to each admin role.

## Positioning

The portal brings property inventory, customer relationships, and operating workflows together in one admin workspace. No comparative market claim is confirmed.

## Operating Context

The portal is a private, authenticated web application built with Next.js and Supabase. The user wants it to serve a mixed real-estate portfolio, including new-build sales, brokerage, and rental management. The current documented workflows are strongest around property sales and development; rental-specific data and operations have not been confirmed in the existing app.

## Capabilities and Constraints

- Preserve the existing admin panel, routes, roles, and working capabilities while changing its visual system and layout.
- Prioritize useful, actionable lead follow-ups in the dashboard, with role-relevant emphasis that does not hide existing workflows.
- Protect the three user-identified quality constraints: keep existing workflows reachable, avoid misleading or unsupported data, and keep frequent-use screens easy to scan.
- Use existing persisted data for operational figures and records. Do not present estimates, placeholder trends, or invented portfolio data as live facts.
- Treat brokerage and rental management as product direction, not as proof that their full data models or workflows already exist. Do not imply unsupported capabilities.
- Existing documentation uses Indian rupees and the `Asia/Kolkata` timezone; retain those conventions where the current data supports them.

## Brand Commitments

Preserve the Indusun name and the existing admin logo asset during this work.

## Evidence on Hand

The repository contains a Supabase-backed admin portal and an operational guide at `admin/README.md`. The current dashboard includes hard-coded percentage trends and estimated lead-source shares; those values are not verified live business data and must not be carried forward as factual metrics.

## Product Principles

- Preserve existing capability and data ownership.
- Put the next useful operational action close to the information that motivates it.
- Make portfolio and customer work understandable across admin roles.
- Distinguish live facts from missing or unsupported data.
