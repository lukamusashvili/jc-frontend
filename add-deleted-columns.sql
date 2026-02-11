-- Migration: Add deleted column to product and transactions tables
-- Run this in Supabase SQL Editor if the columns don't exist yet

-- Add deleted column to product table if it doesn't exist
ALTER TABLE product ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Add deleted column to transactions table if it doesn't exist
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Update existing records to have deleted = false (for safety)
UPDATE product SET deleted = FALSE WHERE deleted IS NULL;
UPDATE transactions SET deleted = FALSE WHERE deleted IS NULL;
