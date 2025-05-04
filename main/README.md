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

## Project Organization

This section outlines the current organization of the Indusun project, including directory structure, file naming conventions, and component organization.

### Directory Structure

```
indusun/main/
├── public/               # Static assets
├── src/                  # Source code
│   ├── app/              # Next.js App Router pages
│   │   ├── (auth)/       # Authentication-related pages
│   │   ├── (main)/       # Main public-facing pages
│   │   ├── (user)/       # User dashboard pages
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

#### (user) - User Dashboard Pages
- `/dashboard` - User dashboard overview
- `/profile` - User profile management
- `/invoices` - User invoices
- `/payments` - Payment management
- `/receipts` - Receipt history
- `/chat` - User messaging
- `/orders` - Order history

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
- `DashboardLayout.tsx` - Layout wrapper for dashboard pages
- `PaymentHistory.tsx` - Payment history display
- `RemainingAmount.tsx` - Remaining balance display
- `Sidebar.tsx` - Dashboard navigation sidebar
- `SummaryCard.tsx` - Summary information cards
- `TransactionList.tsx` - List of transactions

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

#### modules/
Larger, more complex components that are used across the application:
- `Navbar.tsx` - Main navigation bar
- `Footer.tsx` - Site footer
- `index.ts` - Export file for modules

### Asset Organization

Assets are organized in the public directory by their purpose:

#### public/auth/
Authentication-related images:
- Login and signup background images
- User profile images

#### public/navbar/
Navigation-related assets:
- `logo.svg` - Company logo
- `logo.png` - Company logo (PNG format)

#### public/bottom-nav/
Bottom navigation assets:
- `Icons-BG.svg` - Background for navigation icons

#### public/broker/
Broker-related assets

#### public/transaction-icons/
Icons used for transactions

### Context Providers

React context providers are used for state management:
- `AuthProvider` - Authentication state management
- Other context providers as needed

### Middleware

Custom middleware functions are stored in the `src/middleware` directory:
- Authentication middleware
- Role-based access control

## Naming Conventions

The project uses a mix of naming conventions:

### File and Directory Naming

#### React Components
**Convention**: PascalCase
**Examples**: `Button.tsx`, `PropertyCard.tsx`, `DashboardLayout.tsx`

#### Directories
**Convention**: camelCase or kebab-case (depending on context)
**Examples**: `components/ui`, `components/dashboard`, `public/bottom-nav`

#### Utility Files
**Convention**: camelCase
**Examples**: `dateUtils.ts`, `formatters.ts`, `apiHelpers.ts`

#### Asset Files
**Convention**: Descriptive names with spaces for readability
**Examples**: `Login Art.png`, `Transaction icon.png`

### Code Naming

#### React Components
**Convention**: PascalCase
```tsx
const PropertyCard = () => {
  // Component implementation
};
```

#### Component Props
**Convention**: PascalCase for interface names, camelCase for props
```tsx
interface ButtonProps {
  variant: 'primary' | 'secondary';
  onClick: () => void;
}
```

#### Functions
**Convention**: camelCase
```tsx
const formatDate = (date: Date): string => {
  // Function implementation
};
```

#### Variables
**Convention**: camelCase
```tsx
const userName = 'John Doe';
const isLoading = true;
```

#### TypeScript Types and Interfaces
**Convention**: PascalCase
```tsx
interface User {
  id: string;
  name: string;
}
```

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

## Page Structure

Each page typically follows this structure:

```tsx
'use client';  // If using client-side features

import React from 'react';
import { ComponentName } from '@/components/path';

const PageName = () => {
  return (
    <div>
      {/* Page content */}
    </div>
  );
};

export default PageName;
```

## Component Structure

Components typically follow this structure:

```tsx
'use client';  // If using client-side features

import React from 'react';
import { OtherComponent } from '@/components/path';

interface ComponentNameProps {
  prop1: string;
  prop2?: number;
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  return (
    <div>
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

## Conclusion

This organization structure provides a clear separation of concerns and makes it easy to locate files based on their function. While there may be some inconsistencies in naming conventions, the overall structure is functional and supports the development of the application.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
