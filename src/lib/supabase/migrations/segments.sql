-- Customer segmentation tables
-- Run this migration manually against your Supabase database

-- 1. Customer segments table
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'system' CHECK (type IN ('system', 'custom')),
  criteria JSONB NOT NULL DEFAULT '{}',
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'users',
  auto_actions JSONB DEFAULT '[]',
  customer_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for customer_segments
CREATE INDEX IF NOT EXISTS idx_customer_segments_profile_id ON customer_segments(profile_id);
CREATE INDEX IF NOT EXISTS idx_customer_segments_type ON customer_segments(type);
CREATE INDEX IF NOT EXISTS idx_customer_segments_is_active ON customer_segments(is_active);

-- 2. Junction table for segment membership
CREATE TABLE IF NOT EXISTS customer_segment_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_id UUID NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  entered_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(segment_id, customer_id)
);

-- Indexes for customer_segment_members
CREATE INDEX IF NOT EXISTS idx_customer_segment_members_segment_id ON customer_segment_members(segment_id);
CREATE INDEX IF NOT EXISTS idx_customer_segment_members_customer_id ON customer_segment_members(customer_id);
