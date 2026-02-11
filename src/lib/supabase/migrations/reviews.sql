-- Reviews system tables
-- Run this migration manually against your Supabase database

-- 1. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,
  reviewer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  source TEXT DEFAULT 'direct' CHECK (source IN ('direct', 'request', 'manual', 'qr_code')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured BOOLEAN DEFAULT false,
  service_tags TEXT[] DEFAULT '{}',
  response TEXT,
  response_at TIMESTAMPTZ,
  verified BOOLEAN DEFAULT false,
  token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_profile_id ON reviews(profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_token ON reviews(token);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- 2. Review settings table
CREATE TABLE IF NOT EXISTS review_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviews_enabled BOOLEAN DEFAULT true,
  auto_approve BOOLEAN DEFAULT false,
  min_rating_to_show INTEGER DEFAULT 1,
  review_prompt_text TEXT DEFAULT 'サービスのご利用ありがとうございます。ぜひレビューをお寄せください。',
  display_style TEXT DEFAULT 'carousel' CHECK (display_style IN ('grid', 'carousel', 'list')),
  show_aggregate_rating BOOLEAN DEFAULT true,
  request_after_booking BOOLEAN DEFAULT false,
  request_delay_hours INTEGER DEFAULT 48,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_review_settings_profile_id ON review_settings(profile_id);
