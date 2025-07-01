#!/bin/bash

echo "🚀 Supabase Setup Script for PortfolioAI"
echo "========================================"
echo ""

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Please check if it contains the correct Supabase credentials."
    echo "   If not, please update it with the values from your Supabase dashboard."
    echo ""
    echo "Current .env.local contents:"
    cat .env.local
    echo ""
else
    echo "📝 Creating .env.local file..."
    cat > .env.local << 'EOF'
# Supabase Configuration
# Replace these values with your actual Supabase project credentials
# You can find these in your Supabase dashboard: https://supabase.com/dashboard/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Site URL (optional, used for redirects)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF
    echo "✅ .env.local file created!"
    echo ""
    echo "⚠️  IMPORTANT: You need to update .env.local with your actual Supabase credentials."
    echo "   Follow the instructions in SUPABASE_SETUP.md"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Go to https://supabase.com/dashboard"
echo "2. Create a new project or select an existing one"
echo "3. Go to Settings → API"
echo "4. Copy the Project URL and keys to your .env.local file"
echo "5. Run the database migrations in your Supabase SQL editor"
echo "6. Restart your development server: npm run dev"
echo ""
echo "📚 For detailed instructions, see SUPABASE_SETUP.md"
echo ""
echo "🔧 Database Setup:"
echo "   You'll need to run the SQL migrations from the supabase/migrations/ directory"
echo "   in your Supabase SQL editor to create the required tables."
echo ""
echo "🎯 Required Tables:"
echo "   - profiles (for user profiles and onboarding status)"
echo "   - onboarding_drafts (for draft data during onboarding)"
echo "   - portfolios (for portfolio data)"
echo "   - resumes (for resume data)"
echo "   - users (for analytics and profile data)"
echo ""
echo "✨ Happy coding!" 