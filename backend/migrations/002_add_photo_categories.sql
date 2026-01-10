-- ARH Rentals Database Migration
-- Add photo categorization columns for privacy-first design
-- Migration: 002_add_photo_categories.sql

-- Add new columns for photo categorization
ALTER TABLE listings ADD COLUMN master_interior_photos TEXT; -- JSON array (2 photos - always public)
ALTER TABLE listings ADD COLUMN additional_interior_photos TEXT; -- JSON array (0-8 photos - unlock after deal)
ALTER TABLE listings ADD COLUMN exterior_photos TEXT; -- JSON array (0-3 photos - unlock after deal)

-- Migrate existing data
-- If listing has 2+ photos: First 2 → master, rest → additional
-- If listing has 1 photo: That 1 → master (edge case)
-- All listings get empty exterior_photos array
UPDATE listings 
SET master_interior_photos = CASE 
    WHEN json_array_length(photos) >= 2 THEN json_extract(photos, '$[0:2]')
    WHEN json_array_length(photos) = 1 THEN photos
    ELSE '[]'
  END,
  additional_interior_photos = CASE 
    WHEN json_array_length(photos) > 2 THEN json_extract(photos, '$[2:]')
    ELSE '[]'
  END,
  exterior_photos = '[]'
WHERE master_interior_photos IS NULL;

-- The old 'photos' column can be kept for backwards compatibility
-- or dropped after confirming migration success
-- Uncomment the line below to drop the old column after verification:
-- ALTER TABLE listings DROP COLUMN photos;
