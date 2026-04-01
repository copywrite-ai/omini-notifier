#!/bin/bash
set -e

# Read version from manifest.json
VERSION=$(grep '"version"' manifest.json | head -1 | sed 's/.*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/')

if [ -z "$VERSION" ]; then
  echo "❌ Failed to read version from manifest.json"
  exit 1
fi

DIST_DIR="dist"
FILENAME="omini-notifier-v${VERSION}.zip"
OUTPUT="${DIST_DIR}/${FILENAME}"

echo "📦 Building Omini-Notifier v${VERSION}..."

# Clean previous build
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Create zip with only the extension files
zip -r "$OUTPUT" \
  manifest.json \
  background.js \
  content.js \
  intercept.js \
  adapters.js \
  popup.html \
  popup.js \
  popup.css \
  icons/ \
  -x "*.DS_Store"

echo ""
echo "✅ Build complete: ${OUTPUT}"
echo "📏 Size: $(du -h "$OUTPUT" | cut -f1)"
echo ""
echo "Next steps:"
echo "  1. git tag v${VERSION}"
echo "  2. git push origin v${VERSION}"
echo "  3. gh release create v${VERSION} ${OUTPUT} --title \"v${VERSION}\" --notes \"Release notes here\""
