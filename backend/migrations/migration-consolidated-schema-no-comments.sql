ALTER TABLE drafts ADD COLUMN created_at INTEGER;

UPDATE drafts SET created_at = updated_at WHERE created_at IS NULL;

ALTER TABLE listings ADD COLUMN master_interior_photos TEXT;

ALTER TABLE listings ADD COLUMN additional_interior_photos TEXT;

ALTER TABLE listings ADD COLUMN exterior_photos TEXT;

UPDATE listings 
SET 
  master_interior_photos = CASE 
    WHEN photos IS NOT NULL AND json_valid(photos) AND json_array_length(photos) >= 2 
      THEN json_extract(photos, '$[0:2]')
    WHEN photos IS NOT NULL AND json_valid(photos) AND json_array_length(photos) = 1 
      THEN photos
    ELSE '[]'
  END,
  additional_interior_photos = CASE 
    WHEN photos IS NOT NULL AND json_valid(photos) AND json_array_length(photos) > 2 
      THEN json_extract(photos, '$[2:]')
    ELSE '[]'
  END,
  exterior_photos = '[]'
WHERE master_interior_photos IS NULL;
