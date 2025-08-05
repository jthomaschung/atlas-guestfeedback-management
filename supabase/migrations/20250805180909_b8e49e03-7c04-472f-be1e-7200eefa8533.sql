-- Add director_id column to user_hierarchy table for store level users
ALTER TABLE user_hierarchy ADD COLUMN director_id UUID REFERENCES auth.users(id);