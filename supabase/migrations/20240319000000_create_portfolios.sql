-- Create portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    published BOOLEAN DEFAULT false,
    theme TEXT DEFAULT 'dark',
    custom_domain TEXT,
    basic_info JSONB DEFAULT '{}',
    education JSONB DEFAULT '[]',
    experience JSONB DEFAULT '[]',
    skills JSONB DEFAULT '{}',
    projects JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    testimonials JSONB DEFAULT '[]',
    template_style TEXT DEFAULT 'Professional',
    template_name TEXT DEFAULT 'Modern Black & White',
    linkedin_url TEXT,
    github_url TEXT,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS portfolios_user_id_idx ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS portfolios_published_idx ON portfolios(published);

-- Enable Row Level Security
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own portfolios"
    ON portfolios
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
    ON portfolios
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
    ON portfolios
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
    ON portfolios
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_portfolios_updated_at
    BEFORE UPDATE ON portfolios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 