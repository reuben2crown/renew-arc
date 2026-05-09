-- RenewPilot Database Schema with Row Level Security (RLS)
-- This schema ensures strict data isolation: users can ONLY access their own data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  timezone TEXT DEFAULT 'America/Los_Angeles' NOT NULL,
  opt_in_sms BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Licenses table
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profession TEXT NOT NULL,
  state TEXT NOT NULL CHECK (state IN ('CA', 'TX', 'NY', 'FL', 'IL')),
  license_number TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending')),
  required_hours_total INTEGER DEFAULT 0,
  required_hours_ethics INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, state, license_number)
);

-- CE Credits table
CREATE TABLE IF NOT EXISTS public.ce_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  license_id UUID REFERENCES public.licenses(id) ON DELETE SET NULL,
  provider_name TEXT NOT NULL,
  course_title TEXT NOT NULL,
  hours REAL NOT NULL CHECK (hours > 0),
  category TEXT CHECK (category IN ('ethics', 'core', 'elective')),
  completion_date DATE NOT NULL,
  ocr_confidence REAL CHECK (ocr_confidence >= 0 AND ocr_confidence <= 1),
  image_url TEXT,
  verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reminders table
CREATE TABLE IF NOT EXISTS public.reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  license_id UUID REFERENCES public.licenses(id) ON DELETE SET NULL,
  trigger_days INTEGER NOT NULL CHECK (trigger_days IN (90, 60, 30, 7)),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, license_id, trigger_days, channel)
);

-- State Rules table (reference data)
CREATE TABLE IF NOT EXISTS public.state_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  state TEXT UNIQUE NOT NULL CHECK (state IN ('CA', 'TX', 'NY', 'FL', 'IL')),
  profession JSONB NOT NULL,
  last_updated TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON public.licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_expiry_date ON public.licenses(expiry_date);
CREATE INDEX IF NOT EXISTS idx_licenses_state ON public.licenses(state);
CREATE INDEX IF NOT EXISTS idx_ce_credits_user_id ON public.ce_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_ce_credits_license_id ON public.ce_credits(license_id);
CREATE INDEX IF NOT EXISTS idx_ce_credits_completion_date ON public.ce_credits(completion_date);
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON public.reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON public.reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_sent_at ON public.reminders(sent_at);
CREATE INDEX IF NOT EXISTS idx_state_rules_state ON public.state_rules(state);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ce_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.state_rules ENABLE ROW LEVEL SECURITY;

-- Users: Users can only access their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Licenses: Users can only access their own licenses
CREATE POLICY "Users can view own licenses"
  ON public.licenses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own licenses"
  ON public.licenses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own licenses"
  ON public.licenses FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own licenses"
  ON public.licenses FOR DELETE
  USING (auth.uid() = user_id);

-- CE Credits: Users can only access their own CE credits
CREATE POLICY "Users can view own ce credits"
  ON public.ce_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ce credits"
  ON public.ce_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ce credits"
  ON public.ce_credits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ce credits"
  ON public.ce_credits FOR DELETE
  USING (auth.uid() = user_id);

-- Reminders: Users can only access their own reminders
CREATE POLICY "Users can view own reminders"
  ON public.reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON public.reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON public.reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON public.reminders FOR DELETE
  USING (auth.uid() = user_id);

-- State Rules: Public read-only access (reference data)
CREATE POLICY "Anyone can view state rules"
  ON public.state_rules FOR SELECT
  USING (true);

-- Service role has full access (for server-side operations)
CREATE POLICY "Service role has full access to users"
  ON public.users FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to licenses"
  ON public.licenses FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to ce credits"
  ON public.ce_credits FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to reminders"
  ON public.reminders FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

CREATE POLICY "Service role has full access to state rules"
  ON public.state_rules FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ce_credits_updated_at
  BEFORE UPDATE ON public.ce_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA FOR STATE RULES
-- ============================================

INSERT INTO public.state_rules (state, profession, last_updated) VALUES
('CA', '{
  "LCSW": {"total_hours": 36, "ethics_hours": 6, "renewal_period_years": 2},
  "LMFT": {"total_hours": 36, "ethics_hours": 6, "renewal_period_years": 2},
  "LPCC": {"total_hours": 36, "ethics_hours": 6, "renewal_period_years": 2}
}'::jsonb, NOW()),
('TX', '{
  "LCSW": {"total_hours": 30, "ethics_hours": 6, "renewal_period_years": 2},
  "LMFT": {"total_hours": 30, "ethics_hours": 6, "renewal_period_years": 2},
  "LPCC": {"total_hours": 30, "ethics_hours": 6, "renewal_period_years": 2}
}'::jsonb, NOW()),
('NY', '{
  "LCSW": {"total_hours": 36, "ethics_hours": 0, "renewal_period_years": 3},
  "LMFT": {"total_hours": 36, "ethics_hours": 0, "renewal_period_years": 3},
  "LPCC": {"total_hours": 36, "ethics_hours": 0, "renewal_period_years": 3}
}'::jsonb, NOW()),
('FL', '{
  "LCSW": {"total_hours": 30, "ethics_hours": 3, "renewal_period_years": 2},
  "LMFT": {"total_hours": 30, "ethics_hours": 3, "renewal_period_years": 2},
  "LPCC": {"total_hours": 30, "ethics_hours": 3, "renewal_period_years": 2}
}'::jsonb, NOW()),
('IL', '{
  "LCSW": {"total_hours": 30, "ethics_hours": 3, "renewal_period_years": 2},
  "LMFT": {"total_hours": 30, "ethics_hours": 3, "renewal_period_years": 2},
  "LPCC": {"total_hours": 30, "ethics_hours": 3, "renewal_period_years": 2}
}'::jsonb, NOW())
ON CONFLICT (state) DO UPDATE SET
  profession = EXCLUDED.profession,
  last_updated = EXCLUDED.last_updated;
