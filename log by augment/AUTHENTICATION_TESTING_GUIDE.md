# Authentication Testing Guide

This guide provides step-by-step instructions for testing the complete authentication system implementation.

## 🚀 Quick Setup

### 1. Setup Mock Authentication Data

First, setup the mock authentication data by calling the setup API:

```bash
# Method 1: Using curl
curl -X POST http://localhost:3000/api/setup-auth

# Method 2: Navigate to the URL in browser
http://localhost:3000/api/setup-auth
```

This will create the following test accounts:

**Admin Accounts:**
- Super Admin: `super.admin@indusun.com` / `SuperAdmin@123`
- Regular Admin: `sarika.singh@indusun.com` / `Admin@123`

**Customer Accounts:**
- Customer 1: `hritik@example.com` / `Customer@123`
- Customer 2: `romit@example.com` / `Customer@123`

### 2. Start Development Servers

```bash
# Terminal 1: Start main application (port 3000)
cd main
npm run dev

# Terminal 2: Start admin application (port 3001)
cd admin
npm run dev
```

## 🧪 Testing Scenarios

### Scenario 1: Customer Email/Password Login

1. **Navigate to**: http://localhost:3000/login
2. **Select**: "Email" tab
3. **Enter**: 
   - Email: `hritik@example.com`
   - Password: `Customer@123`
4. **Click**: "Log in"
5. **Expected**: Redirect to `/dashboard` with user data loaded
6. **Verify**: User name "Hritik" appears in dashboard
7. **Test Logout**: Navigate to `/settings` and click "Sign Out"

### Scenario 2: Customer Phone/Password Login

1. **Navigate to**: http://localhost:3000/login
2. **Select**: "Phone" tab
3. **Enter**: 
   - Phone: `+91 98765 12345`
   - Password: `Customer@123`
4. **Click**: "Log in"
5. **Expected**: Redirect to `/dashboard` with user data loaded

### Scenario 3: Customer Phone/OTP Login

1. **Navigate to**: http://localhost:3000/login
2. **Select**: "Phone" tab
3. **Enter**: Phone: `+91 87654 32109`
4. **Click**: "Get OTP"
5. **Expected**: 
   - Button shows countdown (60s)
   - Toast notification shows OTP (development mode)
   - Console logs the OTP
6. **Enter**: The OTP from toast/console
7. **Click**: "Verify OTP"
8. **Expected**: Redirect to `/dashboard` with user data loaded

### Scenario 4: Admin Login (Regular Admin)

1. **Navigate to**: http://localhost:3001/auth/login
2. **Enter**: 
   - Email: `sarika.singh@indusun.com`
   - Password: `Admin@123`
3. **Click**: "LOG IN"
4. **Expected**: Redirect to admin `/dashboard`
5. **Verify**: 
   - Admin name "Sarika Singh" appears
   - Role badge shows "Admin"
   - Limited permissions (no user management access)
6. **Test Logout**: Navigate to `/settings` and click "Sign Out"

### Scenario 5: Admin Login (Super Admin)

1. **Navigate to**: http://localhost:3001/auth/login
2. **Enter**: 
   - Email: `super.admin@indusun.com`
   - Password: `SuperAdmin@123`
3. **Click**: "LOG IN"
4. **Expected**: Redirect to admin `/dashboard`
5. **Verify**: 
   - Admin name "Admin Superuser" appears
   - Role badge shows "Super Admin"
   - Full permissions (access to all features)

### Scenario 6: Role-Based Access Control

1. **Login as Regular Admin**: `sarika.singh@indusun.com`
2. **Try to access**: Admin user management features
3. **Expected**: Limited access or restricted features
4. **Logout and Login as Super Admin**: `super.admin@indusun.com`
5. **Access**: Same admin user management features
6. **Expected**: Full access to all features

### Scenario 7: Invalid Credentials

1. **Navigate to**: http://localhost:3000/login
2. **Enter**: 
   - Email: `invalid@example.com`
   - Password: `wrongpassword`
3. **Click**: "Log in"
4. **Expected**: Error message "User does not exist"

1. **Navigate to**: http://localhost:3001/auth/login
2. **Enter**: 
   - Email: `hritik@example.com` (customer email)
   - Password: `Customer@123`
3. **Click**: "LOG IN"
4. **Expected**: Error message "Invalid credentials" (customer can't access admin)

### Scenario 8: Session Management

1. **Login**: As any user
2. **Close browser tab**
3. **Reopen**: Navigate to dashboard URL directly
4. **Expected**: Still logged in (session persists)
5. **Wait**: For token expiry (1 hour for customers, 4 hours for admins)
6. **Refresh page**
7. **Expected**: Redirect to login page

## 🔍 Verification Checklist

### Authentication Features
- [ ] Email/password login works for customers
- [ ] Phone/password login works for customers
- [ ] Phone/OTP login works for customers
- [ ] Admin email/password login works
- [ ] Role-based access control works
- [ ] Invalid credentials are rejected
- [ ] Cross-role access is prevented

### User Experience
- [ ] Login forms are responsive
- [ ] Loading states work correctly
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Redirects work properly
- [ ] Logout functionality works

### Security Features
- [ ] Passwords are hashed in database
- [ ] JWT tokens are set as HTTP-only cookies
- [ ] Rate limiting prevents brute force
- [ ] OTP expires after 10 minutes
- [ ] Sessions expire appropriately

### Data Integration
- [ ] Customer dashboard shows mock data
- [ ] Admin dashboard shows appropriate data
- [ ] Role-based UI elements appear/hide correctly
- [ ] Profile information displays correctly

## 🐛 Troubleshooting

### Common Issues

**"Module not found" errors:**
- Ensure all dependencies are installed: `npm install`
- Check that shared libraries are accessible

**Database connection errors:**
- Verify PostgreSQL is running
- Check environment variables in `.env` files
- Ensure database exists

**OTP not working:**
- Check browser console for OTP display
- Verify toast notifications are enabled
- Check network tab for API responses

**Login redirects not working:**
- Clear browser cache and cookies
- Check for JavaScript errors in console
- Verify API routes are responding

**Role-based access issues:**
- Verify user roles in database
- Check JWT token payload
- Ensure role checks in components

### Debug Commands

```bash
# Check users in database
curl http://localhost:3000/api/setup-auth

# Test API endpoints
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hritik@example.com","password":"Customer@123"}'

# Check admin API
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"super.admin@indusun.com","password":"SuperAdmin@123"}'
```

## 📊 Expected Results

After successful testing, you should have:

1. **Working Authentication**: All login methods function correctly
2. **Role-Based Access**: Different user types see appropriate interfaces
3. **Session Management**: Users stay logged in across browser sessions
4. **Security**: Invalid attempts are blocked, passwords are secure
5. **User Experience**: Smooth login/logout flows with proper feedback

## 🎯 Next Steps

Once authentication testing is complete:

1. **Test Customer Features**: Invoices, payments, property data
2. **Test Admin Features**: User management, dashboard analytics
3. **Test API Integration**: Customer data APIs, PDF generation
4. **Performance Testing**: Load testing with multiple users
5. **Security Testing**: Penetration testing, vulnerability assessment

---

*For technical support or issues, refer to the development team or check the application logs.*
