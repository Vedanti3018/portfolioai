-- Create users table for analytics and profile
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  plan_name TEXT,
  feature_used INT,
  template_id UUID,
  option_id INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for analytics
CREATE INDEX IF NOT EXISTS users_plan_name_idx ON users(plan_name);
CREATE INDEX IF NOT EXISTS users_feature_used_idx ON users(feature_used);
CREATE INDEX IF NOT EXISTS users_template_id_idx ON users(template_id); 