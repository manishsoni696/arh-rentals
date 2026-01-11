-- ARH Rentals - Complete Schema Fix Migration
-- Adds all missing columns to align database with worker code expectations

-- Add mobile column (user's phone number)
ALTER TABLE listings ADD COLUMN mobile TEXT;

-- Add category column (residential/commercial)
ALTER TABLE listings ADD COLUMN category TEXT;

-- Add city column
ALTER TABLE listings ADD COLUMN city TEXT;

-- Add security_deposit column
ALTER TABLE listings ADD COLUMN security_deposit INTEGER;

-- Add floor_on_rent column
ALTER TABLE listings ADD COLUMN floor_on_rent TEXT;

-- Add number_of_rooms column
ALTER TABLE listings ADD COLUMN number_of_rooms TEXT;

-- Add size column (we'll migrate from size_sqft)
ALTER TABLE listings ADD COLUMN size INTEGER;

-- Add size_unit column
ALTER TABLE listings ADD COLUMN size_unit TEXT;

-- Add property_age column
ALTER TABLE listings ADD COLUMN property_age TEXT;

-- Add available_from column
ALTER TABLE listings ADD COLUMN available_from TEXT;

-- Add amenities column (JSON)
ALTER TABLE listings ADD COLUMN amenities TEXT;

-- Add extra_notes column
ALTER TABLE listings ADD COLUMN extra_notes TEXT;

-- Add status column
ALTER TABLE listings ADD COLUMN status TEXT;

-- Add expires_at column
ALTER TABLE listings ADD COLUMN expires_at INTEGER;

-- Migrate existing data where possible
UPDATE listings 
SET 
  size = size_sqft,
  size_unit = 'sq_ft',
  status = 'active',
  category = 'residential',
  city = 'Hisar',
  expires_at = strftime('%s', 'now') + (30 * 24 * 60 * 60)
WHERE size IS NULL;
