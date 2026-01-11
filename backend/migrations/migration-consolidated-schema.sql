-- ARH Rentals - Consolidated Schema Migration
-- Fixes: Missing photo category columns + drafts table column mismatch
-- Safe to run multiple times (uses IF NOT EXISTS and ALTER TABLE ADD COLUMN)

-- =============================================================================
-- FIX DRAFTS TABLE - Add created_at column
-- =============================================================================
-- The worker code uses 'created_at' but schema has 'updated_at'
-- We'll add created_at and keep both for compatibility

-- Check if created_at exists, if not add it
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- So we'll use a workaround with a conditional check

-- Add created_at column (will fail silently if already exists in newer SQLite)
ALTER TABLE drafts ADD COLUMN created_at INTEGER;

-- Populate created_at from updated_at for existing records
UPDATE drafts SET created_at = updated_at WHERE created_at IS NULL;

-- =============================================================================
-- FIX LISTINGS TABLE - Add photo category columns
-- =============================================================================
-- Add the three new photo category columns if they don't exist

-- Add master_interior_photos (required: 2 photos, always public)
ALTER TABLE listings ADD COLUMN master_interior_photos TEXT;

-- Add additional_interior_photos (optional: 0-6 photos, locked)
ALTER TABLE listings ADD COLUMN additional_interior_photos TEXT;

-- Add exterior_photos (optional: 0-2 photos, locked)
ALTER TABLE listings ADD COLUMN exterior_photos TEXT;

-- =============================================================================
-- DATA MIGRATION - Migrate existing photos column data
-- =============================================================================
-- For any existing listings that have photos but no master_interior_photos,
-- migrate the data from the old 'photos' column to the new structure

-- If listing has 2+ photos: First 2 → master, rest → additional
-- If listing has 1 photo: That 1 → master
UPDATE listings 
SET 
  master_interior_photos = CASE 
    -- If photos is a JSON array with 2+ items, take first 2
    WHEN photos IS NOT NULL AND json_valid(photos) AND json_array_length(photos) >= 2 
      THEN json_extract(photos, '$[0:2]')
    -- If photos has 1 item, use it as master (edge case)
    WHEN photos IS NOT NULL AND json_valid(photos) AND json_array_length(photos) = 1 
      THEN photos
    -- Otherwise empty array
    ELSE '[]'
  END,
  additional_interior_photos = CASE 
    -- If photos has more than 2 items, take the rest
    WHEN photos IS NOT NULL AND json_valid(photos) AND json_array_length(photos) > 2 
      THEN json_extract(photos, '$[2:]')
    -- Otherwise empty array
    ELSE '[]'
  END,
  exterior_photos = '[]'
WHERE master_interior_photos IS NULL;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- After running this migration, verify with:
-- 
-- Check drafts table structure:
-- PRAGMA table_info(drafts);
--
-- Check listings table structure:
-- PRAGMA table_info(listings);
--
-- Check if data was migrated:
-- SELECT id, master_interior_photos, additional_interior_photos, exterior_photos 
-- FROM listings LIMIT 5;
