# Supabase Auth Setup Guide for Admin Dashboard

## Overview

Your admin dashboard now uses **Supabase Auth** instead of custom JWT authentication. Here's what you need to do to complete the setup.

---

## Step 1: Enable Auth in Supabase

1. Go to your Supabase Dashboard: https://app.supabase.io
2. Select your project: `ebhnbnewthtzhxsinuad`
3. Go to **Authentication** → **Providers**
4. Enable **Email** provider (it's enabled by default)
5. Configure settings:
   - **Enable Email Confirmations**: OFF (for now, until you set up email)
   - **Secure email change**: ON
   - **Secure password change**: ON

---

## Step 2: Create Admin Users Table

You have two options for storing admin user data:

### Option A: Simple (Use Supabase Auth Metadata)

Store admin info directly in Supabase Auth user metadata:

1. Go to **Authentication** → **Users**
2. Click **"Add User"** or **"Invite User"**
3. Add admin users with these credentials:
   - Email: `amit.verma@indusun.com`
   - Password: `admin123`
   - User Metadata:
     ```json
     {
       "name": "Amit Verma",
       "role": "super_admin",
       "permissions": ["user_management", "property_management", "broker_management", "financial_reports", "system_settings", "audit_logs", "backup_restore", "security_settings"]
     }
     ```

4. Add second admin:
   - Email: `sneha.patel@indusun.com`
   - Password: `admin123`
   - User Metadata:
     ```json
     {
       "name": "Sneha Patel",
       "role": "limited_admin",
       "permissions": ["user_management", "property_management", "basic_reports"]
     }
     ```

### Option B: Advanced (Create `admin_users` Table)

Create a separate table for more control:

```sql
-- Create admin_users table
CREATE TABLE admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'super_admin')),
  permissions TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow admins to read all admin users"
  ON admin_users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  ));

-- Insert admin users (after creating auth.users first)
INSERT INTO admin_users (id, name, email, role, permissions)
VALUES 
  ('AUTH_USER_ID_HERE', 'Amit Verma', 'amit.verma@indusun.com', 'super_admin', 
   ARRAY['user_management', 'property_management', 'broker_management', 'financial_reports', 'system_settings', 'audit_logs', 'backup_restore', 'security_settings']),
  ('AUTH_USER_ID_HERE', 'Sneha Patel', 'sneha.patel@indusun.com', 'admin', 
   ARRAY['user_management', 'property_management', 'basic_reports']);
```

---

## Step 3: Update Environment Variables

Make sure your `admin/.env.local` has these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ebhnbnewthtzhxsinuad.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_BQ3FhN3eH1G38E2tYvVOdg_jwiwj49F
SUPABASE_SERVICE_ROLE_KEY=sb_service_xxxxxxxxxxxx

# JWT Secret (keep for compatibility or remove if fully migrated)
JWT_SECRET=your-super-secret-jwt-key
```

**Important**: The `SUPABASE_SERVICE_ROLE_KEY` is required for server-side data fetching. Get it from:
Supabase Dashboard → Project Settings → API → Service Role Key

---

## Step 4: Configure Site URL

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3001` (for development)
3. Set **Redirect URLs**: Add `http://localhost:3001/auth/callback` and `http://localhost:3001/dashboard`

For production, update to your domain.

---

## Step 5: Test the Setup

1. Start your admin app:
   ```bash
   cd admin
   npm run dev
   ```

2. Go to `http://localhost:3001/auth/login`

3. Try logging in with:
   - Email: `amit.verma@indusun.com`
   - Password: `admin123`

4. If successful, you'll be redirected to `/dashboard`

---

## What's Changed?

### API Routes Updated:
- `/api/auth/login` - Now uses Supabase Auth
- `/api/auth/logout` - Now uses Supabase Auth
- `/api/auth/me` - Now uses Supabase Auth

### Context Updated:
- `AdminAuthContext` - Now uses Supabase client
- Login method signature changed: `login(email, password)` instead of `login(userData)`

### New Files Created:
- `src/services/supabaseAuth.ts` - Server-side auth functions
- `src/utils/supabase/*` - Supabase client setup

---

## Troubleshooting

### "Invalid login credentials"
- User doesn't exist in Supabase Auth → Add user in dashboard
- Wrong password → Reset in Supabase Auth dashboard

### "Supabase client not initialized"
- Missing env variables → Check `.env.local`
- Wrong URL or key → Verify from Supabase dashboard

### "Unauthorized - Admin access only"
- User role is not 'admin' or 'super_admin' → Check user metadata in Supabase

### Session not persisting
- Check browser cookies are enabled
- Verify middleware is running (check console logs)

### "Error fetching master data" / "Cannot read table"
- **Missing Service Role Key** → Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`
- Table doesn't exist → Check table name "Master Data Of Gurukrupa" in Supabase
- RLS blocking access → Service role key bypasses RLS (intended for admin operations)
- Wrong table name → Verify exact spelling and case in Supabase

### "Invalid API key"
- Using wrong key type → Service Role Key starts with `sb_service_`
- Key has expired → Generate new key in Supabase Dashboard

---

## Migration from Mock Data

To migrate your existing mock users to Supabase:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" for each admin
3. Enter email and password
4. Add metadata (name, role, permissions)
5. Test login

---

## Security Recommendations

1. **Enable Email Confirmations** once you set up SMTP
2. **Enable 2FA** for admin accounts
3. **Set strong password policies** in Supabase
4. **Enable RLS** on all tables
5. **Use service role key** only for server-side operations
6. **Keep publishable key** for client-side only

---

## Next Steps

1. ✅ Create `.env.local` file
2. ✅ Add admin users to Supabase Auth
3. ✅ Test login/logout
4. ⏭️ Enable email confirmations (optional)
5. ⏭️ Set up RLS policies for your data tables
6. ⏭️ Add password reset functionality

---

## Need Help?

If you get errors:
1. Check browser console for detailed error messages
2. Check server logs
3. Verify Supabase credentials
4. Ensure users are created in Supabase Auth (not just your custom table)
