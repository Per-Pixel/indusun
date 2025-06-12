-- Create broker applications table
CREATE TABLE IF NOT EXISTS broker_applications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  documents JSONB,
  notes TEXT,
  reviewed_by INTEGER REFERENCES users(id),
  review_date TIMESTAMP
);

-- Create messages table for contact forms and inquiries
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
