# Indusun Project

Indusun is a real estate platform built with Next.js, using the App Router for page routing and Tailwind CSS for styling. The project follows a modular approach with components organized by their function and pages grouped by their purpose.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Status

The Indusun project is nearing completion with most core features implemented:

### Completed Features
- Responsive navigation and layout
- Property listing and filtering system
- Property search functionality
- Favorites system
- Broker dashboard with property management
- Broker client management
- User authentication flow

### In Progress
- User dashboard enhancements
- Property detail page improvements
- Loading states and spinners
- Homepage sections (hero, featured properties, etc.)

## Project Organization

This section outlines the current organization of the Indusun project, including directory structure, file naming conventions, and component organization.

### Directory Structure

```
indusun/main/
├── public/               # Static assets
├── src/                  # Source code
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/            # Authentication-related pages
│   │   ├── (main)/            # Main public-facing pages
│   │   ├── (user)/            # User dashboard pages
│   │   ├── broker/            # Broker dashboard and pages
│   │   ├── user/              # User dashboard and pages
│   │   ├── api/          # API routes
│   │   ├── globals.css   # Global styles
│   │   └── layout.tsx    # Root layout
│   ├── components/       # Reusable UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Library code and utilities
│   ├── middleware/       # Next.js middleware
│   ├── modules/          # Larger, complex components
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
```

### Route Groups

The project uses Next.js App Router route groups to organize pages by their purpose:

#### (auth) - Authentication Pages
- `/login` - User login page
- `/sign-up` - User registration page
- `/broker` - Broker-specific authentication

#### (main) - Public-Facing Pages
- `/` - Homepage
- `/about` - About Us page
- `/contact` - Contact Us page
- `/properties` - Property listings
- `/properties/[id]` - Individual property details
- `/search` - Property search page
- `/favorites` - User favorites (requires authentication)
- `/real-estate` - Real estate information

#### (user) - User Dashboard Pages (Legacy Route Group)
Contains the original user dashboard pages that are being migrated to the new structure.

#### user/ - User Dashboard Pages
- `/user/dashboard` - User dashboard overview
- `/user/profile` - User profile management
- `/user/invoices` - User invoices
- `/user/payments` - Payment management
- `/user/receipts` - Receipt history
- `/user/chat` - User messaging
- `/user/orders` - Order history

#### broker/ - Broker Dashboard Pages
- `/broker/dashboard` - Broker dashboard overview
- `/broker/properties` - Property management
- `/broker/contacts` - Contact management
- `/broker/clients` - Client management
- `/broker/reports` - Reports and analytics
- `/broker/settings` - Broker settings
- `/broker/apply` - Broker application

#### API Routes
- `/api/auth/*` - Authentication endpoints
- `/api/broker/*` - Broker-specific endpoints
- `/api/admin/*` - Admin-only endpoints

### Component Organization

Components are organized by their function and purpose:

#### components/auth/
Authentication-related components like social login buttons.
- `SocialLoginButtons.tsx` - Buttons for social media login options

#### components/dashboard/
Components used in the user dashboard:
- `DashboardLayout.tsx` - Layout wrapper for user dashboard pages
- `PaymentHistory.tsx` - Payment history display
- `RemainingAmount.tsx` - Remaining balance display
- `Sidebar.tsx` - User dashboard navigation sidebar
- `SummaryCard.tsx` - Summary information cards
- `TransactionList.tsx` - List of transactions

#### components/broker/
Components used in the broker dashboard:
- `BrokerDashboardLayout.tsx` - Layout wrapper for broker dashboard pages
- `BrokerSidebar.tsx` - Broker dashboard navigation sidebar
- `IncomeStatistics.tsx` - Income statistics display
- `PropertyList.tsx` - Property list component
- `SalesAnalytics.tsx` - Sales analytics charts
- `SalesReport.tsx` - Sales report table
- `StatsCard.tsx` - Statistics card component
- `PromotionalBanner.tsx` - Promotional banner component
- `SalesMap.tsx` - Sales map visualization

#### components/properties/
Property-related components:
- `FilterDropdown.tsx` - Dropdown for property filtering

#### components/shared/
Shared components used across multiple pages:
- `AnimatedDropdown.tsx` - Animated dropdown component
- `BottomNavigation.tsx` - Mobile bottom navigation bar
- `Dropdown.tsx` - Generic dropdown component

#### components/ui/
Basic UI elements:
- `GlobalLoading.tsx` - Loading indicator
- `PlaceholderImage.tsx` - Image placeholder with fallback icons

## Development Guidelines

When adding new files or components to the project:

1. **Follow Existing Patterns**: Place new files in the appropriate directories based on their function.
2. **Maintain Consistency**: Use the same naming conventions as existing files in the same directory.
3. **Component Organization**:
   - Place small, reusable UI components in `components/ui`
   - Place shared components used across multiple pages in `components/shared`
   - Place page-specific components in their respective page directories
   - Place large, complex components in `modules`
4. **Page Organization**:
   - Place new pages in the appropriate route group based on their purpose
   - Use dynamic routes for parameterized pages (e.g., `[id]`)
5. **Asset Organization**:
   - Place new assets in the appropriate subdirectory of `public` based on their purpose
   - Use descriptive filenames for assets

## Deployment

The project is configured for deployment on Vercel, with separate environments for:
- Development: Feature branches
- Staging: Main branch
- Production: Production branch

## Admin Dashboard

A separate admin dashboard is available in the `/admin` directory, which is a standalone Next.js application. This separation allows for independent development and deployment of the admin interface.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
