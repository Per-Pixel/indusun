# 🔑 Login Credentials - Quick Reference

## 🏠 Customer Users (Main App - localhost:3000)

### 👤 Rajesh Kumar
```
Email: rajesh.kumar@email.com
Phone: +91 9876543210
Password: customer123
```
**Profile**: Premium property seeker in Bangalore  
**Agent**: Arshir Patel  
**Outstanding**: INR 12,340.00  
**Dashboard**: Full transaction history (120+ transactions)

### 👤 Priya Sharma
```
Email: priya.sharma@email.com
Phone: +91 8765432109
Password: customer123
```
**Profile**: First-time home buyer in NCR  
**Agent**: Vikram Singh  
**Outstanding**: INR 8,750.00  
**Dashboard**: Full transaction history (120+ transactions)

---

## 👨‍💼 Admin Users (Admin App - localhost:3001)

### 🔐 Super Admin - Amit Verma
```
Email: amit.verma@indusun.com
Phone: +91 9123456789
Password: admin123
```
**Access Level**: Super Administrator  
**Permissions**: Full system access (8 permissions)
- user_management
- property_management
- broker_management
- financial_reports
- system_settings
- audit_logs
- backup_restore
- security_settings

### 🔐 Limited Admin - Sneha Patel
```
Email: sneha.patel@indusun.com
Phone: +91 8912345678
Password: admin123
```
**Access Level**: Limited Administrator  
**Permissions**: Basic access (3 permissions)
- user_management
- property_management
- basic_reports

---

## � IMPORTANT: Restart Required

**After fixing authentication issues, you MUST restart both development servers:**

```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Terminal 1 - Customer App
cd main
npm run dev

# Terminal 2 - Admin App
cd admin
npm run dev
```

**Reason**: Environment variables (.env.local files) are only loaded on server startup.

## �🚀 Quick Test Commands

### Customer Login Test
```bash
# Email Login
Email: rajesh.kumar@email.com
Password: customer123

# Phone Login
Phone: +91 9876543210
Password: customer123

# OTP Login
Phone: +91 9876543210
# Click "Get OTP to login instead"
# Check console for OTP in development mode
```

### Admin Login Test
```bash
# Super Admin
Email: amit.verma@indusun.com
Password: admin123

# Limited Admin
Email: sneha.patel@indusun.com
Password: admin123
```

---

## 📱 OTP Testing (Development Mode)

When testing OTP login:
1. Enter any phone number from the list above
2. Click "Get OTP to login instead"
3. **OTP will be displayed in**:
   - Browser console (F12 → Console)
   - Toast notification (visible for 10 seconds)
4. Enter the 6-digit OTP
5. Click "Verify OTP"

**Example OTP Flow**:
```
Phone: +91 9876543210
→ OTP Page
→ Check console: "🔐 Development OTP: 123456"
→ Enter: 123456
→ Login Success
```

---

## 🌐 Application URLs

### Main Application (Customer)
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard
- **Profile**: http://localhost:3000/profile
- **Settings**: http://localhost:3000/settings
- **OTP Login**: http://localhost:3000/otp-login

### Admin Application
- **Login**: http://localhost:3001/auth/login
- **Dashboard**: http://localhost:3001/dashboard
- **Profile**: http://localhost:3001/profile
- **Settings**: http://localhost:3001/settings

---

## ✅ Testing Checklist

### Customer Authentication
- [ ] Email/Password login (Rajesh)
- [ ] Email/Password login (Priya)
- [ ] Phone/Password login (Rajesh)
- [ ] Phone/Password login (Priya)
- [ ] OTP login flow (any customer phone)
- [ ] Dashboard loads with personalized data
- [ ] Profile page shows correct information
- [ ] Settings page functional
- [ ] Sign out works

### Admin Authentication
- [ ] Super admin login (Amit)
- [ ] Limited admin login (Sneha)
- [ ] Admin dashboard loads
- [ ] Profile shows access level
- [ ] Settings page functional
- [ ] Permission display correct
- [ ] Sign out works

### Data Verification
- [ ] Customer dashboard shows real transaction data
- [ ] Payment history displays 24 months
- [ ] Agent information correct
- [ ] Outstanding amounts match
- [ ] Admin permissions display correctly
- [ ] Profile editing works

---

## 🔧 Development Notes

### Mock Data Features
- **120+ Transactions**: Generated for each customer over 12 months
- **24 Payment Records**: 2 years of payment history per customer
- **Realistic Data**: Property-related transactions and payments
- **Agent Assignment**: Each customer has a dedicated agent
- **Permission System**: Granular admin permissions

### Security Features
- **Rate Limiting**: Failed login attempt tracking
- **Password Validation**: Minimum requirements enforced
- **Session Management**: JWT tokens with proper expiry
- **Input Sanitization**: XSS protection implemented

### Development Mode Benefits
- **No Database Required**: All data in memory
- **No Redis Required**: Simplified session management
- **Instant Testing**: No setup time required
- **OTP Visibility**: Console display for easy testing
- **Hot Reload**: Changes reflect immediately

---

## 🚨 Important Notes

1. **Case Sensitive**: Passwords are case-sensitive
2. **Exact Match**: Use exact email/phone formats provided
3. **Development Only**: OTP display only works in development mode
4. **No External Dependencies**: System works completely offline
5. **Mock Data**: All data is simulated for testing purposes

---

## 📞 Quick Support

**Issue**: Login not working  
**Solution**: Check exact credentials, clear browser cache

**Issue**: Dashboard loading forever  
**Solution**: Verify using mock user credentials from this list

**Issue**: OTP not visible  
**Solution**: Check browser console (F12) for development OTP

**Issue**: Admin profile error  
**Solution**: ✅ Fixed - mock data now properly imported
