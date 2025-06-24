# Indusun Authentication Credentials Reference

This document provides comprehensive login credentials for testing the Indusun application's authentication system.

## 🔐 Customer/User Login Credentials

### Customer Account 1: Hritik
- **Name**: Hritik
- **Email**: hritik@example.com
- **Phone**: +91 98765 12345
- **Password**: Customer@123
- **Role**: user
- **Status**: active
- **Email Verified**: true

**Authentication Methods:**
- ✅ Email + Password: `hritik@example.com` / `Customer@123`
- ✅ Phone + Password: `+91 98765 12345` / `Customer@123`

### Customer Account 2: Romit
- **Name**: Romit
- **Email**: romit@example.com
- **Phone**: +91 87654 32109
- **Password**: Customer@123
- **Role**: user
- **Status**: active
- **Email Verified**: true

**Authentication Methods:**
- ✅ Email + Password: `romit@example.com` / `Customer@123`
- ✅ Phone + Password: `+91 87654 32109` / `Customer@123`

### Customer Account 2: Romit
- **Name**: Romit
- **Email**: romit@example.com
- **Phone**: +91 98765 67890
- **Password**: Customer@456
- **Role**: customer
- **Status**: active
- **KYC Status**: verified
- **Properties**: 2 (Prestige Lakeside Habitat Villa + Sobha City Plot)
- **Account Balance**: ₹180,000
- **Credit Score**: 780

**Authentication Methods:**
- ✅ Email + Password: `romit@example.com` / `Customer@456`
- ✅ Phone + OTP: `+91 98765 67890` / Any 6-digit OTP (development mode)

---

## 👨‍💼 Admin Login Credentials

---

## 🔑 Admin Section Login Credentials

### Super Admin Account
- **Name**: Admin Superuser
- **Email**: super.admin@indusun.com
- **Password**: SuperAdmin@123
- **Phone**: +91 98765 12345
- **Role**: super_admin
- **Status**: active
- **Email Verified**: true
- **Permissions**: Complete system access including user management, admin management, system settings, all financial operations, and full dashboard access

**Authentication Method:**
- ✅ Email + Password: `super.admin@indusun.com` / `SuperAdmin@123`

### Regular Admin Account
- **Name**: Sarika Singh
- **Email**: sarika.singh@indusun.com
- **Password**: Admin@123
- **Phone**: +91 87654 32109
- **Role**: admin
- **Status**: active
- **Email Verified**: true
- **Permissions**: Limited access excluding admin account management, system settings, and restricted financial operations

**Authentication Method:**
- ✅ Email + Password: `sarika.singh@indusun.com` / `Admin@123`

---

## 🧪 Testing Instructions

### Customer Login Testing (Main Application - Port 3000)

#### Email/Password Authentication:
1. Navigate to `http://localhost:3000/login` in the main application
2. Select "Email" tab
3. Enter email and password from the customer credentials above
4. Click "Log in"
5. Should redirect to `/dashboard`

#### Phone/Password Authentication:
1. Navigate to `http://localhost:3000/login` in the main application
2. Select "Phone" tab
3. Enter phone number and password from the customer credentials above
4. Click "Log in"
5. Should redirect to `/dashboard`

### Admin Login Testing (Admin Application - Port 3001)

#### Admin Authentication:
1. Navigate to `http://localhost:3001/auth/login` in the admin application
2. Enter email and password from the admin credentials above
3. Click "Log in"
4. Should redirect to admin `/dashboard`
5. Test role-based access:
   - Super Admin: Full access to all features
   - Regular Admin: Limited access (some features restricted)

#### Phone/OTP Authentication:
1. Navigate to `/login` in the main application
2. Select "Phone" tab
3. Enter phone number from the credentials above
4. Click "Send OTP"
5. In development mode, the OTP will be displayed in:
   - Browser console
   - Toast notification
   - Network response (check DevTools)
6. Enter any 6-digit number as OTP (e.g., 123456)
7. Click "Log in"
8. Should redirect to `/dashboard`

### Admin Login Testing

#### Admin Authentication:
1. Navigate to `/auth/login` in the admin application
2. Enter admin email and password from the credentials above
3. Click "LOG IN"
4. Should redirect to `/dashboard`
5. Profile dropdown should show correct role badge (Super Admin/Admin)

---

## 📱 Application URLs

### Main Application (Customer Portal):
- **Login**: `http://localhost:3000/login`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Profile**: `http://localhost:3000/profile`
- **Settings**: `http://localhost:3000/settings`

### Admin Application:
- **Login**: `http://localhost:3001/auth/login`
- **Dashboard**: `http://localhost:3001/dashboard`
- **Clients**: `http://localhost:3001/clients`
- **Brokers**: `http://localhost:3001/brokers`

---

## 🔍 Account Features by User

### Hritik's Account Features:
- **Properties**: 1 apartment (Godrej Splendour)
- **EMI Details**: Active loan with HDFC Bank
- **Overdue Invoices**: 3 overdue payments (₹29,500 - ₹76,700)
- **Upcoming Payments**: 6 scheduled EMI payments
- **Documents**: Aadhar, PAN, Property Agreement (all verified)

### Romit's Account Features:
- **Properties**: 2 properties (Villa + Plot)
- **EMI Details**: Active loan with ICICI Bank
- **Overdue Invoices**: 2 overdue payments (₹41,300 - ₹88,500)
- **Upcoming Payments**: 6 scheduled payments (EMI + development fees)
- **Documents**: Aadhar, PAN, Villa Agreement, Plot Agreement, Income Certificate (all verified)

### Admin Account Features:
- **Super Admin**: Full access to all modules, user management, system settings
- **Regular Admin**: Limited access based on department (Customer Relations or Sales & Marketing)
- **Profile Integration**: Role badges, department display, profile pictures

---

## 🚨 Important Notes

1. **Development Mode**: OTP authentication accepts any 6-digit number in development
2. **Session Management**: Users remain logged in until manual logout or session expiry
3. **Role-Based Access**: Admin roles have different permission levels
4. **Mock Data**: All financial data, transactions, and documents are simulated
5. **Phone Format**: Use the exact phone format shown (with country code +91)
6. **Case Sensitivity**: Passwords are case-sensitive

---

## 🐛 Troubleshooting

### Common Issues:
1. **"Invalid credentials"**: Check email/password spelling and case
2. **"No account found"**: Verify phone number format includes +91
3. **OTP not working**: Any 6-digit number should work in development
4. **Page not loading**: Ensure correct application URL (main vs admin)
5. **Profile not showing**: Clear browser cache and re-login

### Reset Instructions:
- **Clear Session**: Use browser DevTools → Application → Local Storage → Clear
- **Fresh Login**: Always logout before testing different accounts
- **Cache Issues**: Hard refresh (Ctrl+F5) if pages don't update

---

## 🔧 Development Setup

To use these credentials in development:

1. **Database Setup**: Ensure PostgreSQL is running with the `indusun` database
2. **Environment Variables**: Set up `.env` files with database connection details
3. **Seed Data**: Run the authentication setup script to populate user data
4. **Test Login**: Use the credentials above to test both applications

### Database Seeding Command:
```bash
# Run the authentication setup script
node scripts/setup_mock_auth_data.js
```

This will create all the user accounts with properly hashed passwords in your database.

### Testing URLs:
- **Main Application**: http://localhost:3000/login
- **Admin Application**: http://localhost:3001/auth/login

---

*Last Updated: December 2024*
*For technical support, refer to the development team*
