#!/bin/bash

# ============================================
# GENERIC AUTO COMMIT & PUSH SCRIPT
# Usage: bash auto_commit_push.sh "commit message" [branch]
# Or: bash auto_commit_push.sh --auto [branch]
# ============================================

set -e  # Exit on error

cd /Users/sarperhorata/12net

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get parameters
COMMIT_MSG="$1"
BRANCH="${2:-main}"  # Default to main if not specified

# Function to generate automatic commit message
generate_auto_message() {
    echo "🤖 Otomatik commit mesajı oluşturuluyor..."
    
    # Get file changes
    local added=$(git diff --cached --name-only --diff-filter=A | wc -l | tr -d ' ')
    local modified=$(git diff --cached --name-only --diff-filter=M | wc -l | tr -d ' ')
    local deleted=$(git diff --cached --name-only --diff-filter=D | wc -l | tr -d ' ')
    local renamed=$(git diff --cached --name-only --diff-filter=R | wc -l | tr -d ' ')
    
    # Get changed directories/modules
    local changed_dirs=$(git diff --cached --name-only | cut -d'/' -f1 | sort -u | tr '\n' ', ' | sed 's/,$//')
    
    # Build commit message
    local msg="chore: Update project files"
    
    if [ "$added" -gt 0 ] || [ "$modified" -gt 0 ] || [ "$deleted" -gt 0 ] || [ "$renamed" -gt 0 ]; then
        msg="feat: Update project"
        msg="$msg\n\n"
        [ "$added" -gt 0 ] && msg="${msg}✅ Added: $added files\n"
        [ "$modified" -gt 0 ] && msg="${msg}📝 Modified: $modified files\n"
        [ "$deleted" -gt 0 ] && msg="${msg}🗑️  Deleted: $deleted files\n"
        [ "$renamed" -gt 0 ] && msg="${msg}📦 Renamed: $renamed files\n"
        msg="${msg}\nAffected: $changed_dirs"
    fi
    
    echo -e "$msg"
}

# Show header
echo ""
echo "=================================="
echo "🚀 AUTO COMMIT & PUSH"
echo "=================================="
echo ""

# Check if git repo
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Not a git repository!${NC}"
    exit 1
fi

# Reset any pending commits
git reset 2>/dev/null || true

# Stage all changes
echo -e "${BLUE}📦 Staging all changes...${NC}"
git add -A

# Check if there are changes
if git diff --cached --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit!${NC}"
    exit 0
fi

# Show what will be committed
echo ""
echo -e "${BLUE}📝 Changes to commit:${NC}"
git status --short | head -30
echo ""

# Get total file count
TOTAL_FILES=$(git diff --cached --name-only | wc -l | tr -d ' ')
echo -e "${GREEN}Total files changed: $TOTAL_FILES${NC}"
echo ""

# Handle commit message
if [ -z "$COMMIT_MSG" ] || [ "$COMMIT_MSG" = "--auto" ]; then
    # Auto-generate commit message
    COMMIT_MSG=$(generate_auto_message)
    echo -e "${YELLOW}📝 Using auto-generated commit message:${NC}"
    echo -e "${BLUE}$COMMIT_MSG${NC}"
    echo ""
else
    echo -e "${BLUE}📝 Using provided commit message:${NC}"
    echo -e "${GREEN}$COMMIT_MSG${NC}"
    echo ""
fi

# Commit
echo -e "${BLUE}💾 Committing changes...${NC}"
echo -e "$COMMIT_MSG" | git commit -F -

# Show commit info
echo ""
echo -e "${GREEN}✅ Commit successful!${NC}"
COMMIT_HASH=$(git rev-parse --short HEAD)
echo -e "${BLUE}Commit hash: $COMMIT_HASH${NC}"
echo ""

# Push to remote
echo -e "${BLUE}📤 Pushing to $BRANCH...${NC}"
git push origin "$BRANCH"

# Success message
echo ""
echo "=================================="
echo -e "${GREEN}✅ SUCCESSFULLY PUSHED!${NC}"
echo "=================================="
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo -e "  ${GREEN}✅${NC} Files changed: $TOTAL_FILES"
echo -e "  ${GREEN}✅${NC} Branch: $BRANCH"
echo -e "  ${GREEN}✅${NC} Commit: $COMMIT_HASH"
echo ""
echo -e "${BLUE}🌐 Check GitHub:${NC}"
echo "   https://github.com/sarperhorata/network-matching"
echo ""
echo -e "${GREEN}🎉 All done!${NC}"

