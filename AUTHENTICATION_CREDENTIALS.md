# Indusun Authentication Credentials Reference

This document provides comprehensive login credentials for testing the Indusun application's authentication system.

## 🔐 Customer/User Login Credentials

### Customer Account 1: Hritik
- **Name**: Hritik
- **Email**: hritik@example.com
- **Phone**: +91 98765 12345
- **Password**: Customer@123
- **Role**: customer
- **Status**: active
- **KYC Status**: verified
- **Properties**: 1 (Godrej Splendour Apartment)
- **Account Balance**: ₹150,000
- **Credit Score**: 750

**Authentication Methods:**
- ✅ Email + Password: `hritik@example.com` / `Customer@123`
- ✅ Phone + OTP: `+91 98765 12345` / Any 6-digit OTP (development mode)

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

### Super Admin Account
- **Name**: Arjun Patel
- **Email**: arjun.patel@indusun.com
- **Password**: SuperAdmin@123
- **Role**: super_admin
- **Department**: Executive Management
- **Status**: active
- **Permissions**: Full system access, user management, financial reports, system settings

**Authentication Method:**
- ✅ Email + Password: `arjun.patel@indusun.com` / `SuperAdmin@123`

### Admin Account 1
- **Name**: Sarkia Singh
- **Email**: priya.sharma@indusun.com
- **Password**: Admin@123
- **Role**: admin
- **Department**: Customer Relations
- **Status**: active
- **Permissions**: Customer management, property listings, basic reports

**Authentication Method:**
- ✅ Email + Password: `priya.sharma@indusun.com` / `Admin@123`

### Admin Account 2
- **Name**: Rajesh Kumar
- **Email**: rajesh.kumar@indusun.com
- **Password**: Admin@456
- **Role**: admin
- **Department**: Sales & Marketing
- **Status**: active
- **Permissions**: Lead management, broker oversight, marketing campaigns

**Authentication Method:**
- ✅ Email + Password: `rajesh.kumar@indusun.com` / `Admin@456`

---

## 🧪 Testing Instructions

### Customer Login Testing

#### Email/Password Authentication:
1. Navigate to `/login` in the main application
2. Select "Email" tab
3. Enter email and password from the credentials above
4. Click "Log in"
5. Should redirect to `/dashboard`

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

*Last Updated: December 2024*
*For technical support, refer to the development team*
