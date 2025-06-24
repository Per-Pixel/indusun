# 🔐 Complete Authentication Testing Guide - Indusun Project

## 🚀 **QUICK START CHECKLIST**

### **Prerequisites**
- ✅ PostgreSQL server running
- ✅ Main app running on `http://localhost:3000`
- ✅ Admin app running on `http://localhost:3001`
- ✅ Mock authentication data setup completed

### **Setup Commands**
```bash
# Terminal 1: Start main application
cd main && npm run dev

# Terminal 2: Start admin application  
cd admin && npm run dev

# Terminal 3: Setup authentication data
# Visit: http://localhost:3000/setup-auth.html
# Click "Setup Authentication Data" button
```

---

## 🧪 **TESTING SCENARIOS**

### **Scenario 1: Database Setup & Verification**

**Step 1: Setup Mock Data**
1. Open: `http://localhost:3000/setup-auth.html`
2. Click "🚀 Setup Authentication Data"
3. **Expected Result**: Success message with 4 users created
4. Click "🔍 Verify Current Users" to confirm

**Step 2: Verify Database**
- **Expected Users**:
  - `super.admin@indusun.com` (super_admin)
  - `sarika.singh@indusun.com` (admin)
  - `hritik@example.com` (user)
  - `romit@example.com` (user)

---

### **Scenario 2: Customer Authentication Testing**

**Test Tool**: `http://localhost:3000/test-login.html`

#### **2A: Email/Password Login**
1. **Credentials**: `hritik@example.com` / `Customer@123`
2. **Action**: Click "Test Email Login"
3. **Expected**: ✅ Success with user object and JWT tokens
4. **Verify**: Check browser cookies for `access_token` and `refresh_token`

#### **2B: Phone/Password Login**
1. **Credentials**: `+91 98765 12345` / `Customer@123`
2. **Action**: Click "Test Phone Login"
3. **Expected**: ✅ Success with user object and JWT tokens

#### **2C: Phone/OTP Login**
1. **Phone**: `+91 87654 32109`
2. **Action**: Click "Send OTP"
3. **Expected**: ✅ OTP sent message with development OTP displayed
4. **Action**: Click "Verify OTP" (OTP auto-filled in development)
5. **Expected**: ✅ Login successful with user object

---

### **Scenario 3: Admin Authentication Testing**

#### **3A: Super Admin Login**
1. **Credentials**: `super.admin@indusun.com` / `SuperAdmin@123`
2. **Action**: Click "Test Super Admin Login"
3. **Expected**: ✅ Success with admin user object and admin_token

#### **3B: Regular Admin Login**
1. **Credentials**: `sarika.singh@indusun.com` / `Admin@123`
2. **Action**: Click "Test Admin Login"
3. **Expected**: ✅ Success with admin user object (limited permissions)

---

### **Scenario 4: UI Integration Testing**

#### **4A: Customer Login Page**
1. **URL**: `http://localhost:3000/login`
2. **Test Email Tab**: Use `hritik@example.com` / `Customer@123`
3. **Expected**: Redirect to `/dashboard` after successful login
4. **Test Phone Tab**: Use `+91 98765 12345` / `Customer@123`
5. **Expected**: Redirect to `/dashboard` after successful login

#### **4B: OTP Workflow**
1. **URL**: `http://localhost:3000/login`
2. **Select**: Phone tab
3. **Enter**: `+91 87654 32109`
4. **Click**: "Get OTP"
5. **Expected**: 
   - Button shows countdown (60s)
   - Toast shows development OTP
   - OTP input field appears
6. **Enter**: OTP from toast
7. **Click**: "Verify OTP"
8. **Expected**: Redirect to `/dashboard`

#### **4C: Admin Login Page**
1. **URL**: `http://localhost:3001/auth/login`
2. **Test**: `super.admin@indusun.com` / `SuperAdmin@123`
3. **Expected**: Redirect to admin `/dashboard`

---

## 🔧 **TROUBLESHOOTING GUIDE**

### **Common Issues & Solutions**

#### **Issue 1: "User does not exist" Error**
**Cause**: Mock data not setup or database connection issue
**Solution**:
1. Visit `http://localhost:3000/setup-auth.html`
2. Click "Setup Authentication Data"
3. Verify PostgreSQL is running

#### **Issue 2: "Invalid password" Error**
**Cause**: Incorrect credentials or password hashing issue
**Solution**:
1. Use exact credentials from guide
2. Check for extra spaces in input fields
3. Verify mock data was created correctly

#### **Issue 3: OTP Not Working**
**Cause**: OTP generation or storage issue
**Solution**:
1. Check browser console for OTP display
2. Look for toast notifications with OTP
3. Verify phone number format: `+91 XXXXX XXXXX`

#### **Issue 4: "Too many failed attempts"**
**Cause**: Rate limiting triggered
**Solution**:
1. Wait 15 minutes for rate limit reset
2. Use different email/phone for testing
3. Restart development server to clear memory

#### **Issue 5: JWT Token Issues**
**Cause**: Missing JWT_SECRET or token verification failure
**Solution**:
1. Check `.env.local` file has `JWT_SECRET`
2. Clear browser cookies and try again
3. Restart development server

#### **Issue 6: CORS Errors**
**Cause**: Cross-origin request issues
**Solution**:
1. Ensure both servers are running on correct ports
2. Use full URLs for admin API calls
3. Check browser network tab for failed requests

---

## 📊 **Expected API Responses**

### **Successful Login Response**
```json
{
  "message": "Login successful",
  "user": {
    "id": "1",
    "name": "Hritik",
    "email": "hritik@example.com",
    "role": "user"
  }
}
```

### **Successful OTP Send Response**
```json
{
  "message": "OTP sent successfully",
  "otp": "123456",
  "debug": true,
  "note": "OTP included in response for development testing"
}
```

### **Error Response Format**
```json
{
  "error": "Invalid credentials"
}
```

---

## 🎯 **Testing Checklist**

### **Database Setup**
- [ ] PostgreSQL server running
- [ ] Users table created with correct schema
- [ ] 4 test accounts created with hashed passwords
- [ ] Database connection working

### **Customer Authentication**
- [ ] Email/password login working
- [ ] Phone/password login working
- [ ] OTP generation working
- [ ] OTP verification working
- [ ] JWT tokens being set correctly
- [ ] Redirects working properly

### **Admin Authentication**
- [ ] Super admin login working
- [ ] Regular admin login working
- [ ] Role-based access control working
- [ ] Admin JWT tokens being set correctly

### **UI Integration**
- [ ] Login page loads correctly
- [ ] Form validation working
- [ ] OTP countdown timer working
- [ ] Toast notifications appearing
- [ ] Error messages displaying
- [ ] Success redirects working

### **Security Features**
- [ ] Passwords hashed in database
- [ ] Rate limiting working
- [ ] JWT tokens secure (HTTP-only cookies)
- [ ] OTP expiration working
- [ ] Failed attempt tracking working

---

## 🚨 **Critical Error Messages to Watch For**

1. **"Module not found: '@/lib/auth-utils'"** - Build configuration issue
2. **"Database connection failed"** - PostgreSQL not running
3. **"JWT_SECRET is not defined"** - Environment variable missing
4. **"Cannot find module 'bcrypt'"** - Dependency installation issue
5. **"CORS policy"** - Cross-origin request blocked

---

## 📞 **Support & Next Steps**

### **If All Tests Pass**
✅ Authentication system is fully functional
✅ Ready for production deployment
✅ Can proceed with feature development

### **If Tests Fail**
1. Check server logs in terminal
2. Check browser console for errors
3. Verify environment variables
4. Restart development servers
5. Clear browser cache and cookies

### **Additional Testing**
- Load testing with multiple concurrent users
- Security penetration testing
- Mobile device compatibility testing
- Different browser compatibility testing

---

*Last Updated: December 2024*
*For technical support, check server logs and browser console first*
