-- Migration 05: Add state and ensure UUID default for users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS state VARCHAR(100) DEFAULT 'India';
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
