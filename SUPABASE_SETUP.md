# Supabase Setup Guide

## Current Issue
Your application is failing because the required Supabase environment variables are missing. You're seeing errors like:
```
Error: Your project's URL and Key are required to create a Supabase client!
```

## Required Environment Variables

You need to create a `.env.local` file in your project root with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Site URL (optional, used for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## How to Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project (or create a new one if you don't have one)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Use as `SUPABASE_SERVICE_ROLE_KEY`

## Steps to Fix

1. Create a `.env.local` file in your project root:
   ```bash
   touch .env.local
   ```

2. Add the environment variables to the file with your actual values:
   ```bash
   # Replace with your actual Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. Restart your development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Database Schema

Your project expects the following Supabase tables to exist:
- `profiles` - User profiles with onboarding status
- `onboarding_drafts` - Draft data during onboarding
- `portfolios` - Portfolio data
- `resumes` - Resume data

Make sure these tables are created in your Supabase database. You can find the migration files in the `supabase/migrations/` directory.

## Security Notes

- Never commit your `.env.local` file to version control
- The `NEXT_PUBLIC_` prefixed variables are safe to expose to the client
- The `SUPABASE_SERVICE_ROLE_KEY` should be kept secret and only used on the server side 