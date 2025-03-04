#!/bin/bash


# Define the base directory
BASE_DIR="/home/pjebreo/repos/easypoliticalnews-main"

# Find the most recent deployment directory based on timestamp in the name
LATEST_DEPLOY=$(ls -d $BASE_DIR/deploy-* 2>/dev/null | sort -r | head -n 1)


# Check if a directory was found
if [[ -z "$LATEST_DEPLOY" ]]; then
    echo "❌ No deployment directories found in $BASE_DIR" >> "$LOG_FILE"
    exit 1
fi

# Construct the final path
FINAL_PATH="$LATEST_DEPLOY/src/backend"

# Output the final path
echo "✅ Most recent deployment directory:" >> "$LOG_FILE"
echo "$FINAL_PATH" >> "$LOG_FILE"

# Optionally, change to the directory (uncomment the next line)
cd "$FINAL_PATH"
echo "✅ Add symlink" >> "$LOG_FILE"
ln -s "$BASE_DIR/node_modules" ./node_modules

ts-node news_agg.ts
echo "✅ Run the news_agg.ts" >> "$LOG_FILE"

exit 0