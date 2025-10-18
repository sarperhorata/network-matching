#!/bin/bash

cd /Users/sarperhorata/12net

# Make scripts executable
chmod +x auto_commit_push.sh
chmod +x auto_git.py
chmod +x CLEAN_AND_PUSH.sh

# First, clean up and move docs
echo "🧹 Cleaning up documentation..."
bash CLEAN_AND_PUSH.sh

echo ""
echo "✅ TAMAMLANDI!"
echo ""
echo "📊 GitHub'ı kontrol et:"
echo "   https://github.com/sarperhorata/network-matching"
echo ""
echo "🎯 Artık otomatik push için:"
echo "   bash auto_commit_push.sh --auto"
echo "   VEYA"
echo "   python3 auto_git.py --auto"

