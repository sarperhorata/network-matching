#!/bin/bash

# ============================================
# ORGANIZE DOCUMENTATION - Move to docs/
# ============================================

echo "📚 Dökümanları organize ediyorum..."
echo ""

cd /Users/sarperhorata/12net

# Create docs directory structure
echo "📁 Klasör yapısı oluşturuluyor..."
mkdir -p docs/guides
mkdir -p docs/reports
mkdir -p docs/scripts

echo "✅ Klasörler oluşturuldu!"
echo ""

# Move guide documents
echo "📖 Guide dökümanları taşınıyor..."
git mv ROADMAP.md docs/guides/ 2>/dev/null || mv ROADMAP.md docs/guides/
git mv OAUTH_SETUP_GUIDE.md docs/guides/ 2>/dev/null || mv OAUTH_SETUP_GUIDE.md docs/guides/
git mv DEPLOYMENT_CHECKLIST.md docs/guides/ 2>/dev/null || mv DEPLOYMENT_CHECKLIST.md docs/guides/

echo "✅ Guides taşındı!"
echo ""

# Move report documents
echo "📊 Report dökümanları taşınıyor..."
git mv COMPLETE_SESSION_FINAL_REPORT.md docs/reports/ 2>/dev/null || mv COMPLETE_SESSION_FINAL_REPORT.md docs/reports/
git mv SESSION_COMPLETE_SUMMARY.md docs/reports/ 2>/dev/null || mv SESSION_COMPLETE_SUMMARY.md docs/reports/
git mv FRONTEND_BACKEND_INTEGRATION_STATUS.md docs/reports/ 2>/dev/null || mv FRONTEND_BACKEND_INTEGRATION_STATUS.md docs/reports/
git mv FEATURE_GAP_ANALYSIS.md docs/reports/ 2>/dev/null || mv FEATURE_GAP_ANALYSIS.md docs/reports/
git mv QUICK_REFERENCE_GAPS.md docs/reports/ 2>/dev/null || mv QUICK_REFERENCE_GAPS.md docs/reports/
git mv QUICK_WINS_COMPLETED.md docs/reports/ 2>/dev/null || mv QUICK_WINS_COMPLETED.md docs/reports/
git mv PROJECT_STATUS_REPORT.md docs/reports/ 2>/dev/null || mv PROJECT_STATUS_REPORT.md docs/reports/
git mv FIGMA_INTEGRATION_SUMMARY.md docs/reports/ 2>/dev/null || mv FIGMA_INTEGRATION_SUMMARY.md docs/reports/
git mv SESSION_SUMMARY.md docs/reports/ 2>/dev/null || mv SESSION_SUMMARY.md docs/reports/

echo "✅ Reports taşındı!"
echo ""

# Move script files
echo "🔧 Script dosyaları taşınıyor..."
git mv GIT_PUSH_FINAL_COMMANDS.sh docs/scripts/ 2>/dev/null || mv GIT_PUSH_FINAL_COMMANDS.sh docs/scripts/
git mv GIT_PUSH_WITH_ROADMAP.sh docs/scripts/ 2>/dev/null || mv GIT_PUSH_WITH_ROADMAP.sh docs/scripts/
git mv GIT_PUSH_COMMANDS.sh docs/scripts/ 2>/dev/null || mv GIT_PUSH_COMMANDS.sh docs/scripts/
git mv FINAL_COMMIT_MESSAGE.txt docs/scripts/ 2>/dev/null || mv FINAL_COMMIT_MESSAGE.txt docs/scripts/

echo "✅ Scripts taşındı!"
echo ""

# Optional: Move other docs if they exist
echo "📄 Diğer dökümanlar kontrol ediliyor..."
[ -f "API_REFERENCE.md" ] && (git mv API_REFERENCE.md docs/guides/ 2>/dev/null || mv API_REFERENCE.md docs/guides/)
[ -f "GETTING_STARTED.md" ] && (git mv GETTING_STARTED.md docs/guides/ 2>/dev/null || mv GETTING_STARTED.md docs/guides/)
[ -f "MVP_SUMMARY.md" ] && (git mv MVP_SUMMARY.md docs/reports/ 2>/dev/null || mv MVP_SUMMARY.md docs/reports/)
[ -f "PRODUCTION_DEPLOYMENT_GUIDE.md" ] && (git mv PRODUCTION_DEPLOYMENT_GUIDE.md docs/guides/ 2>/dev/null || mv PRODUCTION_DEPLOYMENT_GUIDE.md docs/guides/)

echo "✅ Tüm dökümanlar organize edildi!"
echo ""

# Create docs README
echo "📝 docs/README.md oluşturuluyor..."
cat > docs/README.md << 'EOF'
# 📚 Oniki.net Documentation

This directory contains all project documentation organized by category.

## 📖 Directory Structure

```
docs/
├── guides/          # Setup and implementation guides
├── reports/         # Status reports and analysis
├── scripts/         # Helper scripts and automation
└── README.md        # This file
```

## 📖 Guides

### Setup & Deployment
- **[ROADMAP.md](guides/ROADMAP.md)** - Complete product roadmap (70 pages)
- **[OAUTH_SETUP_GUIDE.md](guides/OAUTH_SETUP_GUIDE.md)** - OAuth implementation guide
- **[DEPLOYMENT_CHECKLIST.md](guides/DEPLOYMENT_CHECKLIST.md)** - Production deployment steps
- **[PRODUCTION_DEPLOYMENT_GUIDE.md](guides/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Deployment guide
- **[API_REFERENCE.md](guides/API_REFERENCE.md)** - Complete API documentation
- **[GETTING_STARTED.md](guides/GETTING_STARTED.md)** - Quick start guide

## 📊 Reports

### Status & Analysis
- **[COMPLETE_SESSION_FINAL_REPORT.md](reports/COMPLETE_SESSION_FINAL_REPORT.md)** - Final session report (35 pages)
- **[SESSION_COMPLETE_SUMMARY.md](reports/SESSION_COMPLETE_SUMMARY.md)** - Session summary
- **[FRONTEND_BACKEND_INTEGRATION_STATUS.md](reports/FRONTEND_BACKEND_INTEGRATION_STATUS.md)** - Integration analysis
- **[FEATURE_GAP_ANALYSIS.md](reports/FEATURE_GAP_ANALYSIS.md)** - Gap analysis (16 pages)
- **[QUICK_REFERENCE_GAPS.md](reports/QUICK_REFERENCE_GAPS.md)** - Quick reference
- **[QUICK_WINS_COMPLETED.md](reports/QUICK_WINS_COMPLETED.md)** - Completed quick wins
- **[PROJECT_STATUS_REPORT.md](reports/PROJECT_STATUS_REPORT.md)** - Project status
- **[FIGMA_INTEGRATION_SUMMARY.md](reports/FIGMA_INTEGRATION_SUMMARY.md)** - Figma integration
- **[SESSION_SUMMARY.md](reports/SESSION_SUMMARY.md)** - Session summary
- **[MVP_SUMMARY.md](reports/MVP_SUMMARY.md)** - MVP feature summary

## 🔧 Scripts

### Git & Automation
- **[GIT_PUSH_FINAL_COMMANDS.sh](scripts/GIT_PUSH_FINAL_COMMANDS.sh)** - Final git push script
- **[GIT_PUSH_WITH_ROADMAP.sh](scripts/GIT_PUSH_WITH_ROADMAP.sh)** - Roadmap update push
- **[GIT_PUSH_COMMANDS.sh](scripts/GIT_PUSH_COMMANDS.sh)** - Git push commands
- **[FINAL_COMMIT_MESSAGE.txt](scripts/FINAL_COMMIT_MESSAGE.txt)** - Commit message template

## 🎯 Quick Links

### Most Important Documents
1. 📖 [Main README](../README.md) - Start here!
2. 🗺️ [ROADMAP](guides/ROADMAP.md) - Product roadmap (70 pages)
3. 📊 [Final Report](reports/COMPLETE_SESSION_FINAL_REPORT.md) - Session achievements (35 pages)
4. 🔗 [Integration Status](reports/FRONTEND_BACKEND_INTEGRATION_STATUS.md) - 100% integration verified

### For Developers
- [API Reference](guides/API_REFERENCE.md) - All 62 endpoints
- [Getting Started](guides/GETTING_STARTED.md) - Setup instructions
- [OAuth Guide](guides/OAUTH_SETUP_GUIDE.md) - OAuth implementation

### For Product/Management
- [Roadmap](guides/ROADMAP.md) - MVP phases & future plans
- [Feature Gap Analysis](reports/FEATURE_GAP_ANALYSIS.md) - What's next
- [Project Status](reports/PROJECT_STATUS_REPORT.md) - Current status

### For Deployment
- [Deployment Checklist](guides/DEPLOYMENT_CHECKLIST.md) - Step-by-step
- [Production Guide](guides/PRODUCTION_DEPLOYMENT_GUIDE.md) - Deploy in 30-60 min

---

## 📊 Documentation Statistics

```
Total Pages:        450+
Guides:            6 files
Reports:           10 files
Scripts:           4 files
Total Files:       20+
```

## 🔄 Updates

**Last Updated**: October 18, 2025  
**Documentation Version**: 1.0.0-mvp

---

**Note**: All documentation is automatically updated with each major release.  
For the latest information, always refer to the main [README.md](../README.md).
EOF

echo "✅ docs/README.md oluşturuldu!"
echo ""

# Show final structure
echo "📂 Yeni yapı:"
echo ""
tree docs/ -L 2 2>/dev/null || find docs/ -type f | sort

echo ""
echo "✅ DOKÜMANTASYON ORGANİZE EDİLDİ!"
echo ""
echo "📁 Yapı:"
echo "  docs/"
echo "  ├── guides/      (6+ files) - Setup & implementation guides"
echo "  ├── reports/     (10+ files) - Status reports & analysis"
echo "  ├── scripts/     (4 files) - Git & automation scripts"
echo "  └── README.md    - Documentation index"
echo ""
echo "📝 Ana dizinde kalan:"
echo "  - README.md (main project readme)"
echo "  - LICENSE"
echo "  - package.json files"
echo "  - .env files"
echo "  - .gitignore"
echo ""
echo "🔄 Sonraki adım: Git commit ve push"

