# 🔐 Authentication & User Management System - Testing Guide

## 📋 Overview

This guide provides comprehensive testing instructions for the authentication and user management system implemented for the property management application. The system works completely offline using mock data without requiring any database connections.

## 🚀 Quick Start

### Prerequisites
- No database setup required
- No Redis setup required
- System works completely with mock data
- All authentication flows are functional offline

### Starting the Applications

1. **Main Application (Customer/User Interface)**
   ```bash
   cd main
   npm run dev
   # Runs on http://localhost:3000
   ```

2. **Admin Application**
   ```bash
   cd admin
   npm run dev
   # Runs on http://localhost:3001 (or next available port)
   ```

## 🔑 Login Credentials

### Customer Users

#### User 1: Per Pixel
- **Email**: `perpixel@email.com`
- **Phone**: `+91 8849180795`
- **Password**: `customer123`
- **Profile**: Premium property seeker in Bangalore
- **Agent**: Arshir Patel
- **Outstanding**: INR 12,340.00

#### User 2: Romit Singh
- **Email**: `romitsignh749@email.com`
- **Phone**: `+91 7490825290`
- **Password**: `customer123`
- **Profile**: First-time home buyer in NCR
- **Agent**: Vikram Singh
- **Outstanding**: INR 8,750.00

### Admin Users

#### Super Admin: Amit Verma
- **Email**: `amit.verma@indusun.com`
- **Phone**: `+91 9123456789`
- **Password**: `admin123`
- **Access Level**: Super Administrator
- **Permissions**: Full system access (8 permissions)

#### Limited Admin: Sneha Patel
- **Email**: `sneha.patel@indusun.com`
- **Phone**: `+91 8912345678`
- **Password**: `admin123`
- **Access Level**: Limited Administrator
- **Permissions**: Basic access (3 permissions)

## 🧪 Testing Scenarios

### 1. Customer Login Testing

#### Email/Password Login
1. Go to `http://localhost:3000/login`
2. Select "Email" tab
3. Enter: `perpixel@email.com` / `customer123`
4. Click "Log in"
5. **Expected**: Redirect to dashboard with personalized data

#### Phone/Password Login
1. Go to `http://localhost:3000/login`
2. Select "Phone" tab
3. Enter: `+91 8849180795` / `customer123`
4. Click "Log in"
5. **Expected**: Redirect to dashboard with personalized data

#### OTP Login Flow
1. Go to `http://localhost:3000/login`
2. Select "Phone" tab
3. Enter: `+91 8849180795`
4. Click "Get OTP to login instead"
5. **Expected**: Redirect to OTP page
6. **Development Mode**: OTP will be displayed in:
   - Browser console
   - Toast notification (10 seconds)
7. Enter the 6-digit OTP
8. Click "Verify OTP"
9. **Expected**: Successful login and redirect to dashboard

### 2. Admin Login Testing

#### Admin Email Login
1. Go to `http://localhost:3001/auth/login`
2. Enter: `amit.verma@indusun.com` / `admin123`
3. Click "Login"
4. **Expected**: Redirect to admin dashboard

#### Limited Admin Login
1. Go to `http://localhost:3001/auth/login`
2. Enter: `sneha.patel@indusun.com` / `admin123`
3. Click "Login"
4. **Expected**: Redirect to admin dashboard with limited permissions

### 3. Dashboard Testing

#### Customer Dashboard
- **URL**: `http://localhost:3000/dashboard`
- **Features to Test**:
  - Personalized welcome message
  - Real payment history (24 months)
  - Real transaction data (120+ transactions)
  - Agent information
  - Outstanding amounts
  - Mobile responsive design

#### Admin Dashboard
- **URL**: `http://localhost:3001/dashboard`
- **Features to Test**:
  - Admin-specific interface
  - System overview
  - User management access

### 4. Profile Management Testing

#### Customer Profile
- **URL**: `http://localhost:3000/profile`
- **Features to Test**:
  - View profile information
  - Edit profile (name, email, phone, address, bio)
  - Save changes
  - Profile image display

#### Customer Settings
- **URL**: `http://localhost:3000/settings`
- **Features to Test**:
  - Password change functionality
  - Notification preferences
  - Security settings
  - Sign out functionality

#### Admin Profile
- **URL**: `http://localhost:3001/profile`
- **Features to Test**:
  - View admin information
  - Access level display
  - Permission list
  - Edit profile functionality

#### Admin Settings
- **URL**: `http://localhost:3001/settings`
- **Features to Test**:
  - System settings
  - Security configurations
  - Password management
  - Sign out functionality

## 📊 Mock Data Structure

### Customer Data Includes:
- **Personal Information**: Name, email, phone, address, bio
- **Financial Data**: Overdue amounts, upcoming payments, remaining balance
- **Transaction History**: 120 transactions over 12 months
- **Payment History**: 24 months of payment records
- **Agent Assignment**: Dedicated agent with contact info

### Admin Data Includes:
- **Profile Information**: Name, email, phone, address, bio
- **Access Levels**: Super admin, limited admin
- **Permissions**: Granular permission system
- **Role-based Access**: Different UI based on access level

## 🔧 Development Features

### OTP Testing
- **Development Mode**: OTP is displayed in console and toast
- **Production Ready**: SMS integration can be added later
- **Timer**: 5-minute expiry with resend functionality
- **Validation**: 6-digit numeric OTP with auto-focus

### Error Handling
- **Invalid Credentials**: Proper error messages
- **Rate Limiting**: Brute force protection
- **Session Management**: Automatic token handling
- **Offline Mode**: Works without database/Redis

## 🚨 Troubleshooting

### Common Issues

#### "Invalid Credentials" Error
- **Cause**: Typo in email/password
- **Solution**: Use exact credentials from this guide
- **Note**: Passwords are case-sensitive

#### Dashboard Loading Forever
- **Cause**: User data not found
- **Solution**: Ensure you're using mock user credentials
- **Check**: Browser console for authentication status

#### OTP Not Working
- **Cause**: Phone number not in mock data
- **Solution**: Use exact phone numbers from credentials
- **Development**: Check console for OTP display

#### Admin Profile Import Error
- **Status**: ✅ Fixed
- **Solution**: Mock data copied to admin directory

### Debug Information

#### Check Authentication Status
```javascript
// In browser console
console.log('User:', localStorage.getItem('user'));
console.log('Cookies:', document.cookie);
```

#### Verify Mock Data Loading
```javascript
// Check if mock data is accessible
import { mockCustomerUsers } from './src/data/mockUsers';
console.log('Mock users:', mockCustomerUsers);
```

## 📱 Mobile Testing

### Responsive Design
- **Dashboard**: Optimized for mobile screens
- **Login Forms**: Touch-friendly inputs
- **OTP Input**: Mobile-optimized numeric keypad
- **Navigation**: Mobile-first sidebar

### Touch Interactions
- **Buttons**: Proper touch targets
- **Forms**: Smooth scrolling and focus
- **Modals**: Swipe-friendly interactions

## 🔒 Security Features

### Implemented Security
- **Password Validation**: Minimum 6 characters
- **Rate Limiting**: Failed attempt tracking
- **Session Management**: JWT tokens with expiry
- **Input Sanitization**: XSS prevention
- **CSRF Protection**: SameSite cookies

### Development vs Production
- **Development**: Simplified for testing
- **Production Ready**: All security features functional
- **Scalable**: Easy to add Redis/Database later

## 📈 Performance

### Mock Data Performance
- **Load Time**: Instant (no database calls)
- **Memory Usage**: Minimal (in-memory storage)
- **Scalability**: Easily replaceable with real APIs

### Optimization Features
- **Lazy Loading**: Components load on demand
- **Caching**: In-memory data caching
- **Responsive**: Optimized for all screen sizes

## 🎯 Next Steps

### Production Deployment
1. Replace mock data with real database
2. Implement real SMS OTP service
3. Add Redis for session management
4. Configure production environment variables

### Additional Features
1. Social login integration
2. Multi-factor authentication
3. Advanced audit logging
4. Real-time notifications

---

## 📞 Support

If you encounter any issues during testing:

1. **Check Console**: Browser developer tools for errors
2. **Verify Credentials**: Use exact credentials from this guide
3. **Clear Cache**: Clear browser cache and cookies
4. **Restart Server**: Stop and restart development server

**Note**: This system is designed to work completely offline with mock data. No external dependencies or database setup is required for testing.
