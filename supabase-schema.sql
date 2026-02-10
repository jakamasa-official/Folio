-- Folio Database Schema
-- Run this in your Supabase SQL Editor

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  title TEXT,
  bio TEXT,
  avatar_url TEXT,
  template TEXT NOT NULL DEFAULT 'professional' CHECK (template IN ('professional', 'minimal', 'business', 'creative')),
  links JSONB NOT NULL DEFAULT '[]'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_email TEXT,
  contact_phone TEXT,
  location TEXT,
  business_hours JSONB,
  is_published BOOLEAN NOT NULL DEFAULT false,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_-]{3,30}$')
);

-- Index for fast username lookups
CREATE UNIQUE INDEX idx_profiles_username ON profiles (lower(username));
CREATE INDEX idx_profiles_user_id ON profiles (user_id);

-- Page views table
CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  country TEXT,
  device_type TEXT
);

CREATE INDEX idx_page_views_profile_date ON page_views (profile_id, viewed_at DESC);

-- Wallpapers table (tracks generated wallpapers)
CREATE TABLE wallpapers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL DEFAULT '',
  title TEXT,
  email TEXT,
  phone TEXT,
  style TEXT NOT NULL DEFAULT 'dark',
  phone_model TEXT NOT NULL DEFAULT 'iphone-15',
  qr_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row Level Security

-- Profiles: anyone can read published profiles, users can manage their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (is_published = true);

CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Page views: anyone can insert (for tracking), profile owners can read
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record page views"
  ON page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Profile owners can view their analytics"
  ON page_views FOR SELECT
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Wallpapers: anyone can create, users can view their own
ALTER TABLE wallpapers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create wallpapers"
  ON wallpapers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own wallpapers"
  ON wallpapers FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: authenticated users can upload to their own folder
CREATE POLICY "Users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete their avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
