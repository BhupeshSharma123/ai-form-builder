-- AI Form Builder Database Setup (Safe Version)
-- Run this in Supabase SQL Editor

-- Create tables (IF NOT EXISTS prevents errors)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  ai_credits INTEGER DEFAULT 50,
  plan TEXT DEFAULT 'FREE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  sections JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'DRAFT',
  is_template BOOLEAN DEFAULT FALSE,
  category TEXT,
  share_url TEXT UNIQUE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first, then recreate
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own forms" ON forms;
DROP POLICY IF EXISTS "Users can create forms" ON forms;
DROP POLICY IF EXISTS "Users can update own forms" ON forms;
DROP POLICY IF EXISTS "Users can delete own forms" ON forms;
DROP POLICY IF EXISTS "Published forms are viewable" ON forms;
DROP POLICY IF EXISTS "Anyone can submit responses" ON responses;
DROP POLICY IF EXISTS "Form owners can view responses" ON responses;

-- Recreate policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own forms" ON forms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create forms" ON forms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own forms" ON forms FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own forms" ON forms FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Published forms are viewable" ON forms FOR SELECT USING (status = 'PUBLISHED');

CREATE POLICY "Anyone can submit responses" ON responses FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM forms WHERE forms.id = form_id AND forms.status = 'PUBLISHED'));
CREATE POLICY "Form owners can view responses" ON responses FOR SELECT 
  USING (EXISTS (SELECT 1 FROM forms WHERE forms.id = form_id AND forms.user_id = auth.uid()));

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, avatar)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON forms TO authenticated;
GRANT ALL ON responses TO authenticated;
GRANT SELECT ON forms TO anon;
GRANT INSERT ON responses TO anon;

SELECT 'Database setup complete! 🎉' as status;
