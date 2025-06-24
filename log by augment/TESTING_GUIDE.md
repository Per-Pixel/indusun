# Message System Testing Guide

## Issues Fixed

### ✅ 1. Database Connection Error
- **Problem**: Main app was using undefined environment variables for database connection
- **Solution**: Updated `main/src/lib/db.ts` to use the same connection string as admin app
- **Connection String**: `postgresql://postgres:1234@localhost:5432/indusun`

### ✅ 2. Missing Success Feedback
- **Problem**: No confirmation when messages were successfully submitted
- **Solution**: Added `react-hot-toast` notifications with:
  - Success toast with green background
  - Error toast for failures
  - 5-second duration
  - Top-center positioning

### ✅ 3. Improved Error Handling
- **Problem**: Generic error messages
- **Solution**: Added specific error handling for:
  - Database connection failures (ECONNREFUSED)
  - Missing tables (42P01)
  - Network errors
  - User-friendly error messages

### ✅ 4. Database Setup
- **Problem**: Messages table might not exist
- **Solution**: Created setup endpoints for both apps:
  - `http://localhost:3000/api/setup-db` (Main app)
  - `http://localhost:3001/api/setup-db` (Admin app)

## Testing Steps

### Prerequisites
1. **PostgreSQL must be running** on localhost:5432
2. **Database 'indusun' must exist** with credentials:
   - Username: postgres
   - Password: 1234
   - Host: localhost
   - Port: 5432

### Step 1: Setup Database Tables

#### Option A: Using Browser
1. Visit `http://localhost:3000/api/setup-db` (Main app)
2. Visit `http://localhost:3001/api/setup-db` (Admin app)
3. Both should return success JSON responses

#### Option B: Using Test File
1. Open `test-message-system.html` in browser
2. Click "Setup Main App Database"
3. Click "Setup Admin App Database"
4. Both should show green success messages

### Step 2: Start Applications

```bash
# Terminal 1 - Main Website (port 3000)
cd main
npm run dev

# Terminal 2 - Admin Panel (port 3001)
cd admin
npm run dev:port
```

### Step 3: Test Message Submission

#### Test Contact Form
1. Go to `http://localhost:3000/contact`
2. Fill out the form:
   - Name: Test User
   - Email: test@example.com
   - Phone: +1234567890
   - Subject: Residential
   - Message: This is a test message
3. Click "Send Your Message"
4. **Expected Results**:
   - Button shows "Sending..." with spinner
   - Green success toast appears: "Message sent successfully! We'll get back to you shortly."
   - Form resets to empty
   - Success confirmation page shows

#### Test About Form
1. Go to `http://localhost:3000/about`
2. Scroll to contact form
3. Fill out the form with test data
4. Submit and verify same success behavior

### Step 4: Verify Admin Panel

1. Go to `http://localhost:3001/messages/received`
2. **Expected Results**:
   - See submitted messages in the table
   - Messages show correct source (contact_page, about_page)
   - Status shows as "unread"
   - Sender information displays correctly

### Step 5: Test Broker Dashboard

1. Go to `http://localhost:3000/broker/login`
2. Login as a broker (if authentication is set up)
3. Go to `http://localhost:3000/broker/messages`
4. **Expected Results**:
   - See messages in broker interface
   - Can mark messages as read
   - Statistics update correctly

### Step 6: Test Error Scenarios

#### Database Connection Error
1. Stop PostgreSQL service
2. Try submitting a form
3. **Expected Results**:
   - Red error toast: "Database connection failed. Please ensure PostgreSQL is running and try again."
   - Form shows error message

#### Network Error
1. Stop the main application
2. Try submitting via test file
3. **Expected Results**:
   - Network error message appears

## Verification Checklist

### ✅ Form Submission
- [ ] Contact form submits successfully
- [ ] About form submits successfully
- [ ] Loading states work (spinner, "Sending...")
- [ ] Forms reset after successful submission

### ✅ Success Feedback
- [ ] Green success toast appears
- [ ] Success message is clear and helpful
- [ ] Toast disappears after 5 seconds
- [ ] Success confirmation page shows

### ✅ Error Handling
- [ ] Database errors show helpful messages
- [ ] Network errors are handled gracefully
- [ ] Error toasts appear in red
- [ ] Error messages are user-friendly

### ✅ Database Integration
- [ ] Messages appear in admin panel
- [ ] Messages appear in broker dashboard
- [ ] Source tracking works correctly
- [ ] Timestamps are accurate

### ✅ Admin Panel
- [ ] Real-time message statistics
- [ ] Clickable stats filter messages
- [ ] Message details display correctly
- [ ] Black text colors for readability

### ✅ Broker Dashboard
- [ ] Messages page accessible via navigation
- [ ] Recent messages widget on dashboard
- [ ] Mark as read functionality
- [ ] Message statistics accurate

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Connect to database manually
psql -h localhost -p 5432 -U postgres -d indusun

# Check if messages table exists
\dt messages
```

### Port Conflicts
- Main app should run on port 3000
- Admin app should run on port 3001
- If ports are taken, update the commands accordingly

### Missing Dependencies
```bash
# If react-hot-toast is missing
cd main
npm install react-hot-toast

cd admin
npm install react-hot-toast
```

## Success Criteria

The system is working correctly when:

1. ✅ **Forms submit without errors**
2. ✅ **Success toasts appear immediately after submission**
3. ✅ **Messages appear in both admin and broker interfaces**
4. ✅ **Error handling provides helpful feedback**
5. ✅ **Database connection is stable**
6. ✅ **All statistics update in real-time**

## Next Steps

After successful testing:
1. Deploy to production environment
2. Set up proper environment variables
3. Configure production database
4. Set up monitoring and logging
5. Add email notifications (optional)
6. Implement message threading (optional)
