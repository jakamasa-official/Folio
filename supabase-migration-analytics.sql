-- Analytics Expansion Migration
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Extend page_views table
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS os TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_medium TEXT;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- 2. Create link_clicks table
CREATE TABLE IF NOT EXISTS link_clicks (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  link_id TEXT NOT NULL,
  link_url TEXT NOT NULL,
  link_label TEXT,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referrer TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert link clicks"
  ON link_clicks FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own link clicks"
  ON link_clicks FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_link_clicks_profile ON link_clicks (profile_id, clicked_at);

-- 3. Create conversion_events table
CREATE TABLE IF NOT EXISTS conversion_events (
  id BIGSERIAL PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  converted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert conversion events"
  ON conversion_events FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own conversions"
  ON conversion_events FOR SELECT
  USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_conversions_profile ON conversion_events (profile_id, event_type, converted_at);

-- 4. Additional index for realtime queries
CREATE INDEX IF NOT EXISTS idx_page_views_profile_viewed ON page_views (profile_id, viewed_at);
