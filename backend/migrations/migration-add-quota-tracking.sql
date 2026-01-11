-- ARH Rentals - Listing Plans Migration
-- Add quota tracking for free listings

-- =============================================================================
-- USER QUOTAS TABLE
-- =============================================================================
-- Tracks how many free listings each user has used
CREATE TABLE IF NOT EXISTS user_quotas (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  mobile TEXT UNIQUE NOT NULL,
  total_free_used INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_quotas_mobile ON user_quotas(mobile);

-- =============================================================================
-- GLOBAL SETTINGS TABLE
-- =============================================================================
-- Stores global settings like total listing count for launch phase
CREATE TABLE IF NOT EXISTS global_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Initialize total listings counter
INSERT OR IGNORE INTO global_settings (key, value, updated_at) 
VALUES ('total_listings_created', '0', unixepoch());

-- =============================================================================
-- NOTES
-- =============================================================================
-- Launch phase: First 500 total listings → users get 2 free listings each
-- Post-launch: After 500 total listings → users get 1 free listing each
-- Total listings counter tracks ALL listings ever created (including deleted)
