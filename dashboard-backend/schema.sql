-- ARH Dashboard Backend - D1 Database Schema
-- Profile storage table

CREATE TABLE IF NOT EXISTS profiles (
  phone TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Index for faster lookups (though phone is already primary key)
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
