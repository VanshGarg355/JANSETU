-- ====================================================================
-- JANSETU MIGRATION 03: EXTEND PROFILES WITH CITIZEN PERSONAL DETAILS
-- Adds fields required for Smart Form Autofill & eligibility checks.
-- ====================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS father_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mother_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dob text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mobile text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS annual_income text;

-- Keep RLS as-is: users can only access their own profile row
-- (policy "User profiles self access" on profiles USING (auth.uid() = auth_user_id)).
