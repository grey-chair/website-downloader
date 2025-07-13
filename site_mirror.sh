#!/bin/bash

# Step 1: Set target URL and output folder
URL=""
OUTPUT_DIR="site_dump"

echo "🔄 Starting wget site mirror of $URL..."

# Step 2: Download the site
wget \
  -r \
  -p \
  -k \
  -e robots=off \
  --html-extension \
  --convert-links \
  --restrict-file-names=windows \
  --no-parent \
  --directory-prefix="$OUTPUT_DIR" \
  -U Mozilla \
  "$URL"

echo "✅ Site download complete."

# Step 3: Generate Markdown site map
echo "📝 Generating Markdown site map..."

SITE_MAP="$OUTPUT_DIR/site_map.md"

# Clean old map if it exists
rm -f "$SITE_MAP"

# Build new one
python3 - <<EOF
import os

def generate_site_map(root_dir, output_file):
    with open(output_file, "w", encoding="utf-8") as f:
        for dirpath, _, filenames in os.walk(root_dir):
            depth = dirpath[len(root_dir):].count(os.sep)
            indent = "  " * depth
            f.write(f"{indent}- \`{os.path.basename(dirpath)}/\`\n")
            subindent = "  " * (depth + 1)
            for filename in sorted(filenames):
                if filename != "site_map.md":
                    f.write(f"{subindent}- \`{filename}\`\n")

generate_site_map("$OUTPUT_DIR", "$SITE_MAP")
EOF

echo "✅ Markdown site map created at $SITE_MAP"