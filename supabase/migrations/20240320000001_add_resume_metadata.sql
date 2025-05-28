-- Add meta fields to resumes table
ALTER TABLE resumes
  ADD COLUMN IF NOT EXISTS target_title TEXT,
  ADD COLUMN IF NOT EXISTS target_description TEXT,
  ADD COLUMN IF NOT EXISTS ai_prompt TEXT,
  ADD COLUMN IF NOT EXISTS source_type TEXT,
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS original_filename TEXT,
  ADD COLUMN IF NOT EXISTS downloaded BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE; 