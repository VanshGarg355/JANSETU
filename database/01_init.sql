-- ====================================================================
-- JANSETU DATABASE SCHEMA (Supabase PostgreSQL)
-- Team Bit Warriors - Build for Bharat 2026
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id uuid UNIQUE,
  name text,
  email text UNIQUE,
  phone text,
  language text DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  is_admin boolean DEFAULT false,
  occupation text,
  state text,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. schemes
CREATE TABLE IF NOT EXISTS schemes (
  id serial PRIMARY KEY,
  name text NOT NULL,
  name_hi text,
  category text NOT NULL,
  description text,
  description_hi text,
  benefits text,
  benefits_hi text,
  eligibility_criteria text,
  eligibility_criteria_hi text,
  required_documents text,
  application_process text,
  official_url text,
  source_url text,
  status text DEFAULT 'verified',
  last_verified date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- 3. scheme_translations
CREATE TABLE IF NOT EXISTS scheme_translations (
  id serial PRIMARY KEY,
  scheme_id integer REFERENCES schemes(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'hi')),
  name text NOT NULL,
  description text,
  benefits text,
  eligibility text,
  UNIQUE(scheme_id, language)
);

-- 4. eligibility_rules
CREATE TABLE IF NOT EXISTS eligibility_rules (
  id serial PRIMARY KEY,
  scheme_id integer REFERENCES schemes(id) ON DELETE CASCADE,
  min_age integer,
  max_age integer,
  target_gender text,
  target_occupation text,
  max_income numeric,
  state text,
  rule_json jsonb,
  created_at timestamptz DEFAULT now()
);

-- 5. saved_schemes
CREATE TABLE IF NOT EXISTS saved_schemes (
  id serial PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  scheme_id integer REFERENCES schemes(id) ON DELETE CASCADE,
  notes text,
  saved_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, scheme_id)
);

-- 6. loan_schemes
CREATE TABLE IF NOT EXISTS loan_schemes (
  id serial PRIMARY KEY,
  scheme_id integer REFERENCES schemes(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_hi text,
  category text NOT NULL DEFAULT 'formal', -- 'formal' or 'suspicious'
  max_amount numeric,
  interest_rate text,
  tenure_months integer,
  eligibility text,
  description text,
  description_hi text,
  official_url text,
  warning text,
  created_at timestamptz DEFAULT now()
);

-- 7. dbt_issues
CREATE TABLE IF NOT EXISTS dbt_issues (
  id serial PRIMARY KEY,
  title text NOT NULL,
  title_hi text NOT NULL,
  category text,
  description text,
  description_hi text,
  created_at timestamptz DEFAULT now()
);

-- 8. diagnostic_questions
CREATE TABLE IF NOT EXISTS diagnostic_questions (
  id serial PRIMARY KEY,
  issue_id integer REFERENCES dbt_issues(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_hi text NOT NULL,
  question_type text DEFAULT 'yesno',
  order_index integer NOT NULL,
  options jsonb
);

-- 9. diagnostic_rules
CREATE TABLE IF NOT EXISTS diagnostic_rules (
  id serial PRIMARY KEY,
  issue_id integer REFERENCES dbt_issues(id) ON DELETE CASCADE,
  answer_pattern text NOT NULL,
  cause text NOT NULL,
  cause_hi text NOT NULL,
  guidance text NOT NULL,
  guidance_hi text NOT NULL,
  escalation_url text,
  escalation_authority text,
  created_at timestamptz DEFAULT now()
);

-- 10. diagnostic_history
CREATE TABLE IF NOT EXISTS diagnostic_history (
  id serial PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  issue_id integer REFERENCES dbt_issues(id) ON DELETE SET NULL,
  answers jsonb NOT NULL,
  result jsonb NOT NULL,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

-- 11. government_sources
CREATE TABLE IF NOT EXISTS government_sources (
  id serial PRIMARY KEY,
  name text NOT NULL,
  url text NOT NULL,
  description text,
  is_verified boolean DEFAULT true,
  last_checked date DEFAULT CURRENT_DATE
);

-- 12. knowledge_base
CREATE TABLE IF NOT EXISTS knowledge_base (
  id serial PRIMARY KEY,
  source_id integer REFERENCES government_sources(id) ON DELETE SET NULL,
  title text NOT NULL,
  category text,
  content text NOT NULL,
  language text DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  tags text[],
  created_at timestamptz DEFAULT now()
);

-- 13. chat_history
CREATE TABLE IF NOT EXISTS chat_history (
  id serial PRIMARY KEY,
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  language text DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  sources jsonb,
  created_at timestamptz DEFAULT now()
);

-- 14. admin_audit_logs
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id serial PRIMARY KEY,
  admin_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- ====================================================================
-- INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON schemes(status);
CREATE INDEX IF NOT EXISTS idx_scheme_translations_lang ON scheme_translations(language);
CREATE INDEX IF NOT EXISTS idx_diagnostic_questions_issue ON diagnostic_questions(issue_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_rules_issue ON diagnostic_rules(issue_id);
CREATE INDEX IF NOT EXISTS idx_saved_schemes_profile ON saved_schemes(profile_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_history_profile ON diagnostic_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_session ON chat_history(session_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheme_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dbt_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Public can read verified schemes & resources
CREATE POLICY "Public schemes read" ON schemes FOR SELECT USING (true);
CREATE POLICY "Public scheme_translations read" ON scheme_translations FOR SELECT USING (true);
CREATE POLICY "Public loan_schemes read" ON loan_schemes FOR SELECT USING (true);
CREATE POLICY "Public dbt_issues read" ON dbt_issues FOR SELECT USING (true);
CREATE POLICY "Public diagnostic_questions read" ON diagnostic_questions FOR SELECT USING (true);
CREATE POLICY "Public diagnostic_rules read" ON diagnostic_rules FOR SELECT USING (true);
CREATE POLICY "Public government_sources read" ON government_sources FOR SELECT USING (true);
CREATE POLICY "Public knowledge_base read" ON knowledge_base FOR SELECT USING (true);

-- User-specific data policies
CREATE POLICY "User profiles self access" ON profiles FOR ALL USING (auth.uid() = auth_user_id);
CREATE POLICY "User saved_schemes self access" ON saved_schemes FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "User diagnostic_history self access" ON diagnostic_history FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = profile_id));
CREATE POLICY "User chat_history self access" ON chat_history FOR ALL USING (auth.uid() = (SELECT auth_user_id FROM profiles WHERE id = profile_id) OR profile_id IS NULL);
