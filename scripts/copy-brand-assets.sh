#!/bin/bash
# Copy brand assets from Logo VyomAi directory to the project
# Run from: digiflow/ directory

LOGO_DIR="/Users/Ai Mark/Digitilaization Automation workflow/Logo VyomAi"
PUBLIC_DIR="apps/web/public"
DOCS_DIR="docs/brand-assets"

echo "🎨 Copying DigiFlow brand assets..."

# Main logos
cp "$LOGO_DIR/VYOMAI_logo_white_bg.png" "$PUBLIC_DIR/logo.png" && echo "  ✅ logo.png"
cp "$LOGO_DIR/VYOMAI_logo_dark_bg.png" "$PUBLIC_DIR/logo-dark.png" && echo "  ✅ logo-dark.png"
cp "$LOGO_DIR/VYOMAI_logo_transparent.png" "$PUBLIC_DIR/logo-transparent.png" && echo "  ✅ logo-transparent.png"
cp "$LOGO_DIR/VYOMAI_favicon_64.png" "$PUBLIC_DIR/favicon.ico" && echo "  ✅ favicon.ico"
cp "$LOGO_DIR/VYOMAI_social_profile_400.png" "$PUBLIC_DIR/og-image.png" && echo "  ✅ og-image.png"
cp "$LOGO_DIR/VYOMAI_social_cover_1200x630.png" "$PUBLIC_DIR/social-card.png" && echo "  ✅ social-card.png"
cp "$LOGO_DIR/VYOMAI_business_card_logo_600x300.png" "$PUBLIC_DIR/logo-print.png" && echo "  ✅ logo-print.png"
cp "$LOGO_DIR/VYOMAI_brand_sheet.png" "$DOCS_DIR/VYOMAI_brand_sheet.png" && echo "  ✅ brand-sheet copied to docs"

echo ""
echo "✅ All brand assets copied successfully!"
