-- Add payment method column to custom bills table
ALTER TABLE bills
ADD COLUMN IF NOT EXISTS payment_method TEXT;
