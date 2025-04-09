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
