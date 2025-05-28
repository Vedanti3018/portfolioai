-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL,
  is_primary BOOLEAN DEFAULT false NOT NULL
);

-- Enable Row Level Security
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own resumes"
  ON resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON resumes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to ensure only one primary resume per user
CREATE OR REPLACE FUNCTION ensure_single_primary_resume()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary THEN
    UPDATE resumes
    SET is_primary = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single primary resume
CREATE TRIGGER ensure_single_primary_resume_trigger
  BEFORE INSERT OR UPDATE ON resumes
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_resume();

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_is_primary_idx ON resumes(is_primary); 