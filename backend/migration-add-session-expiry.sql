-- Add expires_at column to sessions table for token expiry
-- Run this in Cloudflare D1 database console

ALTER TABLE sessions ADD COLUMN expires_at INTEGER;

-- Create index for faster expiry checks
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- Clean up any existing sessions (optional - they'll auto-expire anyway)
-- DELETE FROM sessions;
