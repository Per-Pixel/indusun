# Message/Inquiry System Implementation

## Overview

This implementation creates a complete message/inquiry system that connects the main website and admin panel, allowing messages submitted through forms on the main website to be automatically received and displayed in the admin panel.

## Architecture

### Database Schema

A new `messages` table has been created with the following structure:

```sql
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255),
  sender_phone VARCHAR(50),
  subject VARCHAR(500),
  message_content TEXT NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'contact_page', 'contact_form', 'about_page', etc.
  source_page VARCHAR(255), -- specific page URL or identifier
  status VARCHAR(20) DEFAULT 'unread', -- 'read', 'unread', 'replied'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  replied_at TIMESTAMP,
  admin_notes TEXT
);
```

### API Endpoints

#### Main Website (`main/`)

1. **POST `/api/messages/submit`** - Submit new messages from contact forms
   - Validates input data
   - Stores messages in database
   - Returns success/error response

2. **GET `/api/messages/stats`** - Get message statistics (for future use)

#### Admin Panel (`admin/`)

1. **GET `/api/messages`** - Retrieve messages with filtering and pagination
   - Supports filtering by status, source
   - Pagination support
   - Search functionality

2. **PUT `/api/messages`** - Update message status (mark as read/replied)

3. **GET `/api/messages/stats`** - Get comprehensive message statistics

4. **GET `/api/setup-db`** - Initialize database tables

## Features Implemented

### Main Website Integration

1. **Contact Form (`/contact`)** - Updated to submit to database
   - Real-time form validation
   - Loading states and error handling
   - Success confirmation

2. **About Page Form (`/about`)** - Updated to submit to database
   - Structured data submission
   - Property inquiry specific fields

### Admin Panel Integration

1. **Message Statistics Dashboard** - Real-time stats with clickable cards
   - Total messages
   - Sent/Received counts
   - Unread/Read/Replied status
   - Recent activity (24h, 7d, 30d)

2. **Received Messages Page** - Complete message management
   - Real-time data from database
   - Advanced filtering (source, status)
   - Search functionality
   - Pagination
   - Loading states

3. **Message Detail View** - Individual message viewing
   - Full message content
   - Sender information
   - Source tracking
   - Status management

### UI/UX Improvements

1. **Black Text Colors** - Updated admin interface for better readability
   - Dropdown menus use black text
   - Input fields use black text
   - Consistent color scheme

2. **Clickable Statistics** - Message stats lead to filtered views
   - Total messages → All received messages
   - Unread → Unread messages filter
   - Replied → Replied messages filter

3. **Loading States** - Skeleton loaders for better UX
   - Form submission loading
   - Data fetching loading
   - Error handling

## File Changes

### Main Website (`main/`)

- `src/app/api/messages/submit/route.ts` - New API endpoint for form submissions
- `src/app/api/messages/stats/route.ts` - New API endpoint for statistics
- `src/app/(main)/contact/page.tsx` - Updated contact form with API integration
- `src/app/(main)/about/page.tsx` - Updated about form with API integration
- `sql/create_broker_applications_table.sql` - Added messages table schema

### Admin Panel (`admin/`)

- `src/app/api/messages/route.ts` - New API endpoint for message management
- `src/app/api/messages/stats/route.ts` - New API endpoint for statistics
- `src/app/api/setup-db/route.ts` - Updated to include messages table
- `src/app/messages/page.tsx` - Updated to use real data and clickable stats
- `src/app/messages/received/page.tsx` - Complete rewrite to use real data

## Setup Instructions

### 1. Database Setup

Run the database setup endpoint to create the messages table:

```bash
# For admin panel (port 3001)
curl http://localhost:3001/api/setup-db
```

### 2. Start Applications

```bash
# Main website (port 3000)
cd main
npm run dev

# Admin panel (port 3001)
cd admin
npm run dev:port
```

### 3. Test the System

1. Open the main website at `http://localhost:3000`
2. Navigate to `/contact` or `/about` pages
3. Submit a message through the contact form
4. Open the admin panel at `http://localhost:3001`
5. Navigate to Messages to see the submitted message
6. Click on message statistics to filter messages

### 4. Test File

Use the included `test-message-system.html` file to test the API endpoints directly:

```bash
# Open in browser
open test-message-system.html
```

## Technical Details

### Data Flow

1. User submits form on main website
2. Form data is validated and sent to `/api/messages/submit`
3. API endpoint stores message in PostgreSQL database
4. Admin panel fetches messages via `/api/messages`
5. Statistics are calculated in real-time via `/api/messages/stats`

### Error Handling

- Form validation on client and server side
- Database connection error handling
- User-friendly error messages
- Loading states for better UX

### Security

- Input validation using Zod schemas
- SQL injection prevention using parameterized queries
- CORS handling for cross-origin requests

## Future Enhancements

1. **Real-time Notifications** - WebSocket integration for instant message alerts
2. **Email Integration** - Automatic email notifications for new messages
3. **Message Templates** - Pre-defined response templates
4. **Advanced Search** - Full-text search capabilities
5. **Message Categories** - Categorization and tagging system
6. **Export Functionality** - CSV/PDF export of messages
7. **Message Threading** - Conversation tracking
8. **Auto-responses** - Automated acknowledgment emails

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure PostgreSQL is running
   - Check database credentials in both applications
   - Verify database exists

2. **API Endpoint Not Found**
   - Ensure both applications are running
   - Check port configurations
   - Verify API routes are correctly defined

3. **Form Submission Fails**
   - Check browser console for errors
   - Verify API endpoint is accessible
   - Check form validation requirements

### Debug Commands

```bash
# Test database connection (admin)
curl http://localhost:3001/api/test-db

# Test message submission (main)
curl -X POST http://localhost:3000/api/messages/submit \
  -H "Content-Type: application/json" \
  -d '{"senderName":"Test","senderEmail":"test@example.com","messageContent":"Test message","source":"test"}'

# Get message statistics (admin)
curl http://localhost:3001/api/messages/stats
```
