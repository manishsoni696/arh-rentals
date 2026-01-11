-- ARH Rentals D1 Database Schema
-- Cloud Draft System + Listings Storage

-- =============================================================================
-- DRAFTS TABLE (Cloud Draft - 3 Day Expiry)
-- =============================================================================
CREATE TABLE IF NOT EXISTS drafts (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  mobile TEXT UNIQUE NOT NULL,
  draft_json TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_drafts_mobile ON drafts(mobile);
CREATE INDEX IF NOT EXISTS idx_drafts_expires ON drafts(expires_at);

-- =============================================================================
-- LISTINGS TABLE (Property Listings)
-- =============================================================================
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  mobile TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('residential', 'commercial')),
  property_type TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  rent INTEGER NOT NULL CHECK(rent > 0),
  security_deposit INTEGER,
  floor_on_rent TEXT NOT NULL,
  number_of_rooms TEXT NOT NULL,
  size INTEGER NOT NULL CHECK(size > 0),
  size_unit TEXT NOT NULL CHECK(size_unit IN ('sq_ft', 'sq_yd', 'sq_m')),
  furnishing TEXT,
  property_age TEXT,
  available_from TEXT,
  amenities TEXT,
  extra_notes TEXT,
  master_interior_photos TEXT NOT NULL, -- JSON array: 2 photos (always public)
  additional_interior_photos TEXT, -- JSON array: 0-6 photos (locked until deal)
  exterior_photos TEXT, -- JSON array: 0-2 photos (locked until deal)
  photos TEXT, -- DEPRECATED: kept for backward compatibility, use photo category columns
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'deleted')),
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_listings_mobile ON listings(mobile);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_area ON listings(area);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created ON listings(created_at DESC);

-- =============================================================================
-- HELPER QUERIES (Reference)
-- =============================================================================

-- Clean up expired drafts
-- DELETE FROM drafts WHERE expires_at < unixepoch();

-- Get active listings for a mobile
-- SELECT * FROM listings WHERE mobile = ? AND status = 'active' AND deleted_at IS NULL ORDER BY created_at DESC;

-- Get all listings with photo count
-- SELECT *, (length(photos) - length(replace(photos, ',', '')) + 1) as photo_count FROM listings;
