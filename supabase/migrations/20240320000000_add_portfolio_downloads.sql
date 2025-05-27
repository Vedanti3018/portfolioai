-- Create portfolio_downloads table
CREATE TABLE IF NOT EXISTS portfolio_downloads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS portfolio_downloads_portfolio_id_idx ON portfolio_downloads(portfolio_id);
CREATE INDEX IF NOT EXISTS portfolio_downloads_user_id_idx ON portfolio_downloads(user_id);
CREATE INDEX IF NOT EXISTS portfolio_downloads_template_id_idx ON portfolio_downloads(template_id);

-- Add RLS policies
ALTER TABLE portfolio_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own downloads"
    ON portfolio_downloads
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads"
    ON portfolio_downloads
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Add download tracking columns to portfolios table
ALTER TABLE portfolios
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMP WITH TIME ZONE; 