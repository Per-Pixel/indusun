# Indusun Admin Panel — Complete User & Operations Manual

This comprehensive guide covers everything you need to know about using, managing, and navigating the Indusun Admin Portal.

---

## Table of Contents
1. [Overview & Quick Start](#1-overview--quick-start)
2. [Where Is Everything? (Complete Navigation Map)](#2-where-is-everything-complete-navigation-map)
3. [Admin User Management (Adding & Managing Admins)](#3-admin-user-management-adding--managing-admins)
4. [Where Settings Are Located](#4-where-settings-are-located)
5. [Billing, Invoices & Financial Operations](#5-billing-invoices--financial-operations)
   - [How to Make a Bill / Invoice](#how-to-make-a-bill--invoice)
   - [How to Download a Bill (Save as PDF)](#how-to-download-a-bill-save-as-pdf)
   - [How to Export Bills & Financial Data](#how-to-export-bills--financial-data)
6. [Internal Communications & File Sharing Hub](#6-internal-communications--file-sharing-hub)
7. [Customer & Broker CRM](#7-customer--broker-crm)
8. [Properties Management](#8-properties-management)
9. [Database & Supabase Setup](#9-database--supabase-setup)

---

## 1. Overview & Quick Start

The Indusun Admin Panel is an enterprise CRM and real estate management system built with Next.js 15 (Turbopack), Tailwind CSS, Lucide icons, and powered by Supabase Auth, PostgreSQL, Storage, and Realtime subscriptions.

### Accessing the Admin Panel
* **Development URL**: `http://localhost:3001`
* **Login URL**: `http://localhost:3001/auth/login`
* **Authentication**: Requires an authorized Supabase user with the `admin` or `super_admin` role.

---

## 2. Where Is Everything? (Complete Navigation Map)

All features are grouped into intuitive sections in the left **Sidebar Navigation**:

| Section | Feature / Page | URL Route | What It Does |
| :--- | :--- | :--- | :--- |
| **Overview** | **Dashboard** | `/dashboard` | KPI metrics, sales statistics, recent transactions, revenue charts, quick action shortcuts. |
| **Properties** | **All Properties** | `/properties` | Complete inventory of Gurukrupa properties with search, category filters, and price ranges. |
| | **Add Property** | `/properties/add` | Multi-step form to list a new property with pricing, bedrooms, location, and specifications. |
| | **Export Properties** | `/properties/export` | Export property listings to CSV or Excel. |
| | **Property Detail & Edit** | `/properties/[id]`, `/properties/[id]/edit` | View property analytics or edit existing listing details. |
| **CRM** | **Customers** | `/customers` | Database of property buyers, leads, and contacts with contact info and lead source. |
| | **Add Customer** | `/customers/add` | Onboarding form to register a new customer or buyer inquiry. |
| | **Customer Profile** | `/customers/[id]` | Customer dossier with transaction history, saved favorites, and inquiries. |
| | **Brokers** | `/brokers`, `/brokers/[id]` | Directory of verified external brokers, commission histories, and deal closures. |
| **Finance** | **Billing Overview** | `/billing` | Revenue metrics, payment status summaries, billing trends chart, and recent transaction log. |
| | **Transactions** | `/billing/transactions` | Detailed ledger of all financial transactions across clients and brokers. |
| | **Export Billing Data** | `/billing/export` | Download financial and transaction reports in CSV or Excel. |
| | **Invoices** | `/invoices` | List of all generated bills and invoices with payment status (`Paid`, `Pending`, `Overdue`). |
| | **Create Invoice / Bill** | `/invoices/create` | Bill generation tool with live preview and database recording. |
| | **Invoice Detail** | `/invoices/[id]` | Full itemized bill with **Download PDF**, **Print**, and **Share** actions. |
| | **Export Invoices** | `/invoices/export` | Filter and export invoice datasets in CSV/Excel. |
| **Communications** | **Internal Comms** | `/internal-comms` | **New In-App Hub**: Share private notes, messages, PDFs, images, and documents between admins. |
| | **Outbound Messaging** | `/messages` | Send SMS, Email, or WhatsApp updates to customers, brokers, or admins. |
| | **Notifications** | `/notifications` | Live system alerts, transaction confirmations, and inquiry notifications. |
| **Development** | **Projects** | `/projects` | Real estate development projects, phases, site progress, and inventory tracking. |
| | **Site Visits** | `/site-visits` | Schedule, assign, and manage customer physical site visits. |
| **Sales** | **Sales Overview** | `/sales` | Sales pipeline, revenue forecasts, and conversion rates. |
| | **Sales Team** | `/sales-team` | Agent performance, assigned leads, and individual deal targets. |
| | **Reports** | `/reports` | Comprehensive monthly/annual financial statements and performance audits. |
| **Content** | **Website CMS** | `/website-cms` | Edit hero banners, homepage announcements, testimonials, and public site copy. |
| **System** | **Admin Users** | `/admin-users` | **Super Admin Hub**: Create new admins, assign permissions, edit roles, and reset passwords. |
| | **Admin User Profile** | `/admin-users/[id]` | Individual admin profile with activity history, permission editor, and password reset. |
| | **Settings** | `/settings` | System-wide preferences, security (2FA/password), active sessions, theme, and API console. |

---

## 3. Admin User Management (Adding & Managing Admins)

> [!IMPORTANT]
> Creating and modifying admin accounts is strictly restricted to **Super Admins** (`role: 'super_admin'`).

### How to Add a New Admin
1. Open the left sidebar and scroll to **System** → click **Admin Users** (URL: `/admin-users`).
2. At the top right of the page, click the blue **"+ Add Admin"** button.
3. In the modal dialog that appears, fill out the admin credentials:
   - **Full Name**: e.g., `Rohit Sharma`
   - **Email Address**: e.g., `rohit.sharma@indusun.com` (this will be their login username)
   - **Temporary Password**: Minimum 8 characters.
   - **Phone Number**: Optional direct contact number.
   - **Role**:
     - `Admin` — standard operational admin based on granted permissions.
     - `Super Admin` — full administrative control over all modules and user management.
   - **Permissions**: Check or uncheck permissions by category:
     - *Users*: User Management
     - *Properties*: Property Management
     - *Brokers*: Broker Management
     - *Finance*: Financial Reports, Billing Management
     - *System*: System Settings, Audit Logs
     - *Content*: CMS Management
     - *Communications*: Messaging, Internal Communications
     - *CRM*: Lead Management, Booking Management
4. Click **"Create Admin"**.
   - The backend securely provisions a real Supabase Auth account via `auth.admin.createUser()` and creates the profile in the `admin_users` table.
   - The new admin can immediately log in at `/auth/login` using their email and password.

### How to Edit an Admin or Change Permissions
1. On `/admin-users`, click on the admin's name or the **"View Profile"** action.
2. This opens the admin details page at `/admin-users/[id]`.
3. Click **"Edit Profile"** in the top action bar to modify:
   - Name, phone number, bio, location, website
   - Operational status: `Active`, `Inactive`, or `Pending`
   - Role: Toggle between `Admin` and `Super Admin`
   - Granular permission checkboxes
4. Click **"Save Changes"**.

### How to Reset an Admin's Password
1. Navigate to `/admin-users/[id]`.
2. Click the **"Reset Password"** button at the top right.
3. Enter a new password (minimum 8 characters) and confirm it.
4. Click **"Update Password"**. The backend updates the password directly in Supabase Auth.

---

## 4. Where Settings Are Located

Settings are accessible in two convenient ways:
1. **Sidebar Navigation**: Scroll to the bottom under **System** → click **Settings** (`/settings`).
2. **Top Navbar**: Click your avatar or initials in the top-right corner → select **Settings**.

### Settings Tabs Overview
* **Profile (`/settings?tab=profile`)**:
  - Update your display name, email, phone number, bio, location, and personal website.
  - Set your preferred language (e.g., English, Hindi) and timezone (`Asia/Kolkata`).
  - Upload a profile picture/avatar.
* **Account (`/settings?tab=account`)**:
  - View your account role badge (`Super Admin` or `Admin`) and creation date.
* **Notifications (`/settings?tab=notifications`)**:
  - Toggle email notifications for: New client registrations, new property listings, sales/transactions, and weekly digest.
  - Configure desktop browser push alerts and sound notifications.
* **Security (`/settings?tab=security`)**:
  - **Change Password**: Enter new password with real-time strength meter (backed by Supabase Auth).
  - **Two-Factor Authentication (2FA)**: Toggle two-factor security for extra protection.
  - **Active Sessions**: Displays your current device, browser, and platform (e.g., *Chrome on Windows*). Allows one-click **"Revoke All Others"** to sign out any other active sessions.
* **Appearance (`/settings?tab=appearance`)**:
  - **Theme**: Select between Light Mode, Dark Mode, or System Auto.
  - **Accent Color**: Choose your favorite theme accent (Blue, Indigo, Violet, Emerald, Orange, or Rose).
  - **Display Density**: Toggle compact density mode for high-information views.
* **API Console (`/settings?tab=api_console`)**:
  - Live system connectivity monitor for testing Supabase database response times, latency, and status.

---

## 5. Billing, Invoices & Financial Operations

The financial workflow is split between two primary pages:
* **Billing Overview (`/billing`)**: High-level financial reporting, charts, transaction ledgers, and revenue analysis.
* **Invoices (`/invoices`)**: Specific bill generation, client billing records, and payment tracking.

---

### How to Make a Bill / Invoice
1. In the sidebar, navigate to **Finance** → **Invoices** (`/invoices`), or go directly to `/invoices/create`.
2. Click the **"+ Create Invoice"** or **"New Bill"** button at the top right.
3. Fill out the bill details:
   - **Bill Number**: Automatically generated (e.g., `BILL-20261002-4821`). You can also customize this if needed.
   - **Client Information**:
     - Client Name (e.g., `Priya Patel`)
     - Phone Number (e.g., `+91 98765 12345`)
     - Billing Address (e.g., `Flat 402, Gurukrupa Heights, Mumbai`)
   - **Description**: Service or property sale note (e.g., *Booking Advance for 3BHK Unit #402*).
   - **Amount (₹)**: Enter the amount in INR (e.g., `1500000`). The page automatically formats it as `Rs. 15,00,000.00`.
   - **Date**: Select bill issue date.
   - **Payment Method**: Select from dropdown: `Cash`, `Bank Transfer`, `UPI`, `Cheque`, or `Credit Card`.
   - **Payment Status**: Set as `Pending` or `Paid`.
   - **Notes / Terms**: Add optional remarks or terms of sale.
4. **Live Preview**: As you type, the right side of the screen displays a live, formatted invoice preview.
5. Click **"Save & Record Bill"**:
   - The bill is recorded in the Supabase database (`bills` table).
   - You can also click **"Print / Download"** directly from this screen.

---

### How to Download a Bill (Save as PDF)
1. Navigate to **Finance** → **Invoices** (`/invoices`).
2. Click on the invoice number you want to view (e.g., `INV-2023-001` or `BILL-...`).
3. You will be taken to the dedicated **Invoice Detail Page** (`/invoices/[id]`).
4. At the top right action bar, click **"Download PDF"** (or **"Print"**):
   - The browser's native print and PDF dialog will immediately open.
   - Under **Destination**, select **"Save as PDF"**.
   - The invoice layout is pre-configured with a custom print stylesheet (`#invoice-print-area`) that hides the sidebar, top navbar, and action buttons, leaving only a clean, professional invoice on crisp white background.
5. Click **Save** on your computer.

---

### How to Export Bills & Financial Data
There are two export options depending on whether you want invoice records or transaction summaries:

#### Option A: Exporting Invoices (`/invoices/export`)
1. Go to **Invoices** (`/invoices`) and click the **"Export"** button, or navigate directly to `/invoices/export`.
2. Configure your export:
   - **Export Format**: Choose between `CSV` or `Excel (.xls)`.
   - **Date Range**: Select `Last 30 Days`, `Last 90 Days`, `This Year`, or `Custom Range`.
   - **Status Filter**: Check or uncheck `Paid`, `Pending`, or `Overdue`.
3. Click **"Export Data"**.
   - The system immediately compiles the data and initiates an instant file download (e.g., `invoices_export_2026-10-02.csv`) to your browser.

#### Option B: Exporting Financial Transactions (`/billing/export`)
1. Go to **Billing** (`/billing`) and click the **"Export Data"** button, or navigate directly to `/billing/export`.
2. Select your date filter and income categories (`Property Sales`, `Broker Commissions`, `Service Fees`, `Rental Income`).
3. Click **"Export Data"** to download `billing_financial_report_2026-10-02.csv`.

---

## 6. Internal Communications & File Sharing Hub

The **Internal Comms** module is an end-to-end private communication system built exclusively for the internal admin team. It does not use external SMS or email gateways.

### Accessing Internal Comms
* In the sidebar under **Communications**, click **Internal Comms** (`/internal-comms`).

### How to Share Messages, Files & Documents
1. Click **"+ New Message"** at the top right.
2. In the compose modal:
   - **Subject**: Enter a title (e.g., *Q4 Gurukrupa Project Valuation Report*).
   - **Message Body**: Enter notes, instructions, or meeting summaries.
   - **Attachments**: Click the **Paperclip / Attach** button. You can select:
     - PDF documents & blueprints
     - Excel / CSV spreadsheets
     - Word documents
     - Images (PNG, JPG, WebP)
     - Files are uploaded directly to secure Supabase Storage (`internal-comms` bucket).
   - **Visibility Controls**:
     - `All Admins`: Shared with every team member.
     - `Super Admins Only`: Restricted strictly to Super Admins.
     - `Selected Members`: Pick specific admin team members who are allowed to see the post.
3. Click **"Send Message"**.

### Managing Internal Messages
* **Unread Indicators**: Blue dots and unread counters show newly arrived messages. Clicking a message marks it as read and displays double checkmarks (`✓✓`) for the sender.
* **Pinning**: Pin important announcements or documents to keep them at the top of the feed.
* **Downloading Files**: In the message detail view, click the download icon next to any attachment to download it to your device. Image files display thumbnail previews directly in the conversation.

---

## 7. Customer & Broker CRM

* **Customers (`/customers`)**:
  - Filter clients by status (`Active`, `Lead`, `Closed`).
  - Search by name, email, or phone number.
  - Click any customer row to open their profile (`/customers/[id]`) to view saved properties, inquiries, and past purchases.
  - Click **"+ Add Customer"** (`/customers/add`) to record new buyers.
* **Brokers (`/brokers`)**:
  - Track registered brokers and channel partners.
  - View individual commission payout percentages, closed deals, and contact details.

---

## 8. Properties Management

* **Properties List (`/properties`)**:
  - Live data synchronized with Supabase's `Master Data Of Gurukrupa` table.
  - Filter by property type (Apartment, Villa, Commercial, Penthouse), bedrooms, and price range.
* **Add Property (`/properties/add`)**:
  - Step-by-step form to publish new real estate inventory to the master database.
* **Export Properties (`/properties/export`)**:
  - Export property catalog listings to CSV/Excel for external analysis.

---

## 9. Database & Supabase Setup

All database migrations required for the admin overhaul are included in [`admin/sql/admin_panel_overhaul.sql`](file:///d:/Dev%20Domain/~Projects/indusun/admin/sql/admin_panel_overhaul.sql).

### How to Apply the SQL Migration:
1. Log in to your [Supabase Dashboard](https://app.supabase.com).
2. Open your project (`ebhnbnewthtzhxsinuad`).
3. Click **SQL Editor** in the left sidebar.
4. Copy and paste the entire contents of [`admin/sql/admin_panel_overhaul.sql`](file:///d:/Dev%20Domain/~Projects/indusun/admin/sql/admin_panel_overhaul.sql).
5. Click **Run**.

This script sets up:
1. `admin_users` table with foreign key linkage to `auth.users`, roles, and permissions.
2. `internal_messages` table with visibility controls and JSONB attachment storage.
3. `internal_message_reads` table for real-time read receipt tracking.
4. Auto-update triggers for `updated_at` columns.
5. Row Level Security (RLS) policies.
6. Realtime publication subscriptions (`ALTER PUBLICATION supabase_realtime ADD TABLE ...`).
7. Performance indexes on sender IDs, creation timestamps, and user reads.

---

## Summary of Key Links & Shortcuts

| Action | Direct URL / Path |
| :--- | :--- |
| **Login** | `/auth/login` |
| **Dashboard** | `/dashboard` |
| **Create Admin** | `/admin-users` (Click "+ Add Admin") |
| **Admin Settings & Permissions** | `/admin-users/[id]` |
| **System & Profile Settings** | `/settings` |
| **Make a Bill** | `/invoices/create` |
| **Download Bill as PDF** | `/invoices/[id]` (Click "Download PDF") |
| **Export Bills & Invoices** | `/invoices/export` |
| **Export Financial Data** | `/billing/export` |
| **Internal Team Comms & Files** | `/internal-comms` |
| **Properties Inventory** | `/properties` |
| **Add New Property** | `/properties/add` |
| **Customer CRM** | `/customers` |
| **Database Migration Script** | `admin/sql/admin_panel_overhaul.sql` |
