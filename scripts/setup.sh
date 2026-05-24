#!/bin/bash
# DigiFlow Setup Script
# Run this script after cloning the repository to set up the project

set -e

echo "🚀 DigiFlow - Project Setup"
echo "=========================="
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 18."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

if ! command -v firebase &> /dev/null; then
    echo "🔥 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js >= 18 is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites satisfied"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup environment files
if [ ! -f apps/web/.env.local ]; then
    echo "📝 Creating apps/web/.env.local from template..."
    cp apps/web/.env.example apps/web/.env.local
    echo "⚠️  Please fill in the values in apps/web/.env.local"
fi

if [ ! -f apps/admin/.env.local ]; then
    echo "📝 Creating apps/admin/.env.local from template..."
    cp apps/admin/.env.example apps/admin/.env.local
    echo "⚠️  Please fill in the values in apps/admin/.env.local"
fi

if [ ! -f functions/.env.yaml ]; then
    echo "📝 Creating functions/.env.yaml from template..."
    cp functions/.env.yaml.example functions/.env.yaml
    echo "⚠️  Please fill in the values in functions/.env.yaml"
fi

# Create brand assets directory and copy logos
if [ -d "../Logo VyomAi" ]; then
    echo "🎨 Copying brand assets..."
    cp "../Logo VyomAi/VYOMAI_logo_white_bg.png" apps/web/public/logo.png 2>/dev/null || true
    cp "../Logo VyomAi/VYOMAI_logo_dark_bg.png" apps/web/public/logo-dark.png 2>/dev/null || true
    cp "../Logo VyomAi/VYOMAI_logo_transparent.png" apps/web/public/logo-transparent.png 2>/dev/null || true
    cp "../Logo VyomAi/VYOMAI_favicon_64.png" apps/web/public/favicon.ico 2>/dev/null || true
    cp "../Logo VyomAi/VYOMAI_social_profile_400.png" apps/web/public/og-image.png 2>/dev/null || true
    cp "../Logo VyomAi/VYOMAI_social_cover_1200x630.png" apps/web/public/social-card.png 2>/dev/null || true
    cp "../Logo VyomAi/VYOMAI_business_card_logo_600x300.png" apps/web/public/logo-print.png 2>/dev/null || true
    cp "../Logo VyomAi/VYOMAI_brand_sheet.png" docs/brand-assets/ 2>/dev/null || true
    echo "✅ Brand assets copied"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Fill in the environment variables"
echo "  2. Run 'pnpm dev' to start development"
echo "  3. Run 'pnpm build' to build for production"
echo ""
echo "📚 Documentation available in docs/"
