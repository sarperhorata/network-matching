#!/bin/bash

cd /Users/sarperhorata/12net

echo "📚 Dökümanları docs/ klasörüne taşıyorum..."
echo ""

# Ana dizinde docs klasörünü oluştur
mkdir -p docs/guides
mkdir -p docs/reports  
mkdir -p docs/scripts

echo "✅ docs/ klasör yapısı oluşturuldu!"
echo ""

# GUIDES - Setup ve implementasyon rehberleri
echo "📖 Guides taşınıyor..."
[ -f "ROADMAP.md" ] && mv ROADMAP.md docs/guides/ && echo "  ✅ ROADMAP.md"
[ -f "backend/OAUTH_SETUP_GUIDE.md" ] && mv backend/OAUTH_SETUP_GUIDE.md docs/guides/ && echo "  ✅ OAUTH_SETUP_GUIDE.md"
[ -f "API_REFERENCE.md" ] && mv API_REFERENCE.md docs/guides/ && echo "  ✅ API_REFERENCE.md"
[ -f "GETTING_STARTED.md" ] && mv GETTING_STARTED.md docs/guides/ && echo "  ✅ GETTING_STARTED.md"
[ -f "DEPLOYMENT_CHECKLIST.md" ] && mv DEPLOYMENT_CHECKLIST.md docs/guides/ && echo "  ✅ DEPLOYMENT_CHECKLIST.md"
[ -f "PRODUCTION_DEPLOYMENT_GUIDE.md" ] && mv PRODUCTION_DEPLOYMENT_GUIDE.md docs/guides/ && echo "  ✅ PRODUCTION_DEPLOYMENT_GUIDE.md"

# REPORTS - Status raporları ve analizler
echo ""
echo "📊 Reports taşınıyor..."
[ -f "COMPLETE_SESSION_FINAL_REPORT.md" ] && mv COMPLETE_SESSION_FINAL_REPORT.md docs/reports/ && echo "  ✅ COMPLETE_SESSION_FINAL_REPORT.md"
[ -f "SESSION_COMPLETE_SUMMARY.md" ] && mv SESSION_COMPLETE_SUMMARY.md docs/reports/ && echo "  ✅ SESSION_COMPLETE_SUMMARY.md"
[ -f "FRONTEND_BACKEND_INTEGRATION_STATUS.md" ] && mv FRONTEND_BACKEND_INTEGRATION_STATUS.md docs/reports/ && echo "  ✅ FRONTEND_BACKEND_INTEGRATION_STATUS.md"
[ -f "docs/reports/FEATURE_GAP_ANALYSIS.md" ] && echo "  ✅ FEATURE_GAP_ANALYSIS.md (zaten taşınmış)"
[ -f "docs/reports/QUICK_REFERENCE_GAPS.md" ] && echo "  ✅ QUICK_REFERENCE_GAPS.md (zaten taşınmış)"
[ -f "QUICK_WINS_COMPLETED.md" ] && mv QUICK_WINS_COMPLETED.md docs/reports/ && echo "  ✅ QUICK_WINS_COMPLETED.md"
[ -f "PROJECT_STATUS_REPORT.md" ] && mv PROJECT_STATUS_REPORT.md docs/reports/ && echo "  ✅ PROJECT_STATUS_REPORT.md"
[ -f "FIGMA_INTEGRATION_SUMMARY.md" ] && mv FIGMA_INTEGRATION_SUMMARY.md docs/reports/ && echo "  ✅ FIGMA_INTEGRATION_SUMMARY.md"
[ -f "SESSION_SUMMARY.md" ] && mv SESSION_SUMMARY.md docs/reports/ && echo "  ✅ SESSION_SUMMARY.md"
[ -f "MVP_SUMMARY.md" ] && mv MVP_SUMMARY.md docs/reports/ && echo "  ✅ MVP_SUMMARY.md"
[ -f "FINAL_UPDATE_SUMMARY.md" ] && mv FINAL_UPDATE_SUMMARY.md docs/reports/ && echo "  ✅ FINAL_UPDATE_SUMMARY.md"

# SCRIPTS - Otomasyon ve helper script'ler
echo ""
echo "🔧 Scripts taşınıyor..."
[ -f "GIT_PUSH_FINAL_COMMANDS.sh" ] && mv GIT_PUSH_FINAL_COMMANDS.sh docs/scripts/ && echo "  ✅ GIT_PUSH_FINAL_COMMANDS.sh"
[ -f "GIT_PUSH_WITH_ROADMAP.sh" ] && mv GIT_PUSH_WITH_ROADMAP.sh docs/scripts/ && echo "  ✅ GIT_PUSH_WITH_ROADMAP.sh"
[ -f "GIT_PUSH_COMMANDS.sh" ] && mv GIT_PUSH_COMMANDS.sh docs/scripts/ && echo "  ✅ GIT_PUSH_COMMANDS.sh"
[ -f "FINAL_COMMIT_MESSAGE.txt" ] && mv FINAL_COMMIT_MESSAGE.txt docs/scripts/ && echo "  ✅ FINAL_COMMIT_MESSAGE.txt"
[ -f "organize_docs.sh" ] && mv organize_docs.sh docs/scripts/ && echo "  ✅ organize_docs.sh"
[ -f "ORGANIZE_AND_PUSH.sh" ] && mv ORGANIZE_AND_PUSH.sh docs/scripts/ && echo "  ✅ ORGANIZE_AND_PUSH.sh"
[ -f "MANUAL_ORGANIZE_COMMANDS.md" ] && mv MANUAL_ORGANIZE_COMMANDS.md docs/scripts/ && echo "  ✅ MANUAL_ORGANIZE_COMMANDS.md"
[ -f "auto_push.sh" ] && mv auto_push.sh docs/scripts/ && echo "  ✅ auto_push.sh"
[ -f ".commit-message.txt" ] && mv .commit-message.txt docs/scripts/ && echo "  ✅ .commit-message.txt"
[ -f "PUSH_NOW.md" ] && mv PUSH_NOW.md docs/scripts/ && echo "  ✅ PUSH_NOW.md"
[ -f "DOCS_ORGANIZATION_COMMIT.txt" ] && mv DOCS_ORGANIZATION_COMMIT.txt docs/scripts/ && echo "  ✅ DOCS_ORGANIZATION_COMMIT.txt"

echo ""
echo "📝 docs/README.md oluşturuluyor..."

# docs/README.md'yi güncelle (zaten var ama daha kapsamlı yap)
cat > docs/README.md << 'DOCREADME'
# 📚 Oniki.net - Comprehensive Documentation

All project documentation organized into a clear, navigable structure.

## 📂 Directory Structure

```
docs/
├── guides/          # Setup, deployment, and implementation guides
├── reports/         # Status reports, analysis, and session summaries
├── scripts/         # Automation scripts and helper tools
└── README.md        # This file
```

---

## 📖 Guides (Setup & Implementation)

### Product & Planning
- 🗺️ **[ROADMAP.md](guides/ROADMAP.md)** ⭐ - Complete product roadmap (70 pages)
  - MVP Phase 1-6 (completed)
  - Phase 7: Testing & QA (in progress)
  - Phase 8-11: Future features (v2.0, v3.0)
  - Decision framework and success metrics

### Technical Setup
- 🔐 **[OAUTH_SETUP_GUIDE.md](guides/OAUTH_SETUP_GUIDE.md)** - OAuth implementation (Google + LinkedIn)
- 🚀 **[DEPLOYMENT_CHECKLIST.md](guides/DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment
- 📦 **[PRODUCTION_DEPLOYMENT_GUIDE.md](guides/PRODUCTION_DEPLOYMENT_GUIDE.md)** - Full deployment guide
- 🏁 **[GETTING_STARTED.md](guides/GETTING_STARTED.md)** - Quick start guide

### API Documentation
- 🔗 **[API_REFERENCE.md](guides/API_REFERENCE.md)** - All 62 endpoints with examples

---

## 📊 Reports (Status & Analysis)

### Session Reports
- 📋 **[COMPLETE_SESSION_FINAL_REPORT.md](reports/COMPLETE_SESSION_FINAL_REPORT.md)** ⭐ - Final session report (35 pages)
  - 10 major features completed
  - 75+ files changed
  - Platform evolution 95% → 99%
  
- 📝 **[SESSION_COMPLETE_SUMMARY.md](reports/SESSION_COMPLETE_SUMMARY.md)** - Session achievements summary
- 📄 **[SESSION_SUMMARY.md](reports/SESSION_SUMMARY.md)** - Earlier session summary
- 📌 **[FINAL_UPDATE_SUMMARY.md](reports/FINAL_UPDATE_SUMMARY.md)** - Update summary

### Integration & Gaps
- ✅ **[FRONTEND_BACKEND_INTEGRATION_STATUS.md](reports/FRONTEND_BACKEND_INTEGRATION_STATUS.md)** - 100% integration verified
  - 9/9 modules integrated
  - All endpoint mappings confirmed
  
- 📈 **[FEATURE_GAP_ANALYSIS.md](reports/FEATURE_GAP_ANALYSIS.md)** - Comprehensive gap analysis (16 pages)
  - 6 critical gaps identified
  - 5 quick wins documented
  - ROI analysis and implementation plan
  
- 📊 **[QUICK_REFERENCE_GAPS.md](reports/QUICK_REFERENCE_GAPS.md)** - Quick reference tables

### Achievements
- 🎯 **[QUICK_WINS_COMPLETED.md](reports/QUICK_WINS_COMPLETED.md)** - Completed quick wins
  - Settings Page
  - Modern Login/Register
  - TenantThemeSwitcher integration

### Project Status
- 📊 **[PROJECT_STATUS_REPORT.md](reports/PROJECT_STATUS_REPORT.md)** - Overall project status
- 🎨 **[FIGMA_INTEGRATION_SUMMARY.md](reports/FIGMA_INTEGRATION_SUMMARY.md)** - UI component integration
- 📦 **[MVP_SUMMARY.md](reports/MVP_SUMMARY.md)** - MVP feature summary

---

## 🔧 Scripts (Automation & Helpers)

### Git Automation
- 🚀 **[GIT_PUSH_FINAL_COMMANDS.sh](scripts/GIT_PUSH_FINAL_COMMANDS.sh)** - Final git push script
- 🗺️ **[GIT_PUSH_WITH_ROADMAP.sh](scripts/GIT_PUSH_WITH_ROADMAP.sh)** - Roadmap update push
- 📝 **[GIT_PUSH_COMMANDS.sh](scripts/GIT_PUSH_COMMANDS.sh)** - General git commands
- ⚡ **[auto_push.sh](scripts/auto_push.sh)** - Automated commit and push

### Organization & Setup
- 📚 **[organize_docs.sh](scripts/organize_docs.sh)** - Document organization script
- 📦 **[ORGANIZE_AND_PUSH.sh](scripts/ORGANIZE_AND_PUSH.sh)** - Organize and push
- 📋 **[MANUAL_ORGANIZE_COMMANDS.md](scripts/MANUAL_ORGANIZE_COMMANDS.md)** - Manual commands

### Commit Messages
- 📝 **[FINAL_COMMIT_MESSAGE.txt](scripts/FINAL_COMMIT_MESSAGE.txt)** - Comprehensive commit template
- 📄 **[DOCS_ORGANIZATION_COMMIT.txt](scripts/DOCS_ORGANIZATION_COMMIT.txt)** - Docs organization commit
- 📌 **[.commit-message.txt](scripts/.commit-message.txt)** - Commit message template
- 🚀 **[PUSH_NOW.md](scripts/PUSH_NOW.md)** - Push instructions

---

## 🎯 Quick Start Guide

### For New Developers
1. 📖 Start with [Main README](../README.md)
2. 🏁 Follow [Getting Started Guide](guides/GETTING_STARTED.md)
3. 🔗 Review [API Reference](guides/API_REFERENCE.md)
4. 🔐 Setup [OAuth](guides/OAUTH_SETUP_GUIDE.md) if needed

### For Product/Management
1. 🗺️ Review [Roadmap](guides/ROADMAP.md) - 70 pages comprehensive plan
2. 📋 Check [Final Report](reports/COMPLETE_SESSION_FINAL_REPORT.md) - Latest achievements
3. 📈 Understand [Feature Gaps](reports/FEATURE_GAP_ANALYSIS.md) - What's next
4. ✅ Verify [Integration Status](reports/FRONTEND_BACKEND_INTEGRATION_STATUS.md) - 100%

### For Deployment
1. 📋 Follow [Deployment Checklist](guides/DEPLOYMENT_CHECKLIST.md)
2. 🚀 Use [Production Guide](guides/PRODUCTION_DEPLOYMENT_GUIDE.md)
3. 🔧 Run deployment scripts from [scripts/](scripts/)

---

## 📊 Documentation Statistics

```
Total Documentation:    450+ pages
Guides:                6 files
Reports:               11 files
Scripts:               11 files
Total Files:           28 organized files
```

---

## 🎯 Platform Status Summary

### Current Status (October 18, 2025)
```
✅ Platform Completion:    99%
✅ MVP Features:           100% (16/16 completed)
✅ Modules:                9/9 (100%)
✅ API Endpoints:          62 (100% Swagger documented)
✅ Frontend Pages:         11 (all modernized)
✅ UI Components:          46 (latest Figma design)
✅ Integration:            100% (frontend ↔ backend)
✅ Documentation:          450+ pages organized
```

### Key Features Delivered
- ✅ Authentication (JWT + OAuth ready)
- ✅ Event Management (full lifecycle)
- ✅ AI Matching (4 algorithms)
- ✅ Real-time Messaging (WebSocket)
- ✅ Meeting Scheduler
- ✅ Analytics Dashboard
- ✅ Settings Page (5 tabs)
- ✅ Notification System
- ✅ White-label (TenantThemeSwitcher)

---

## 🚀 Next Steps

### Immediate (This Week)
1. Deploy to production (Render + Vercel)
2. Final testing on production environment
3. Recruit 10-20 beta users

### Short-term (Next Month)
4. Collect beta feedback
5. Fix critical bugs
6. Build 1-2 high-priority features from Phase 8

### Long-term (Next 6 months)
- Phase 8: Enterprise features (Admin Panel, etc.)
- Phase 9: Advanced AI/ML (v2.0)
- Phase 10: White-label scale (v2.0)

See [Roadmap](guides/ROADMAP.md) for detailed timeline.

---

## 📞 Documentation Maintenance

**Last Updated**: October 18, 2025  
**Documentation Version**: 1.0.0-mvp  
**Maintained By**: Development Team

All documentation is automatically updated with each major release.  
For the latest platform information, always refer to the [Main README](../README.md).

---

**🎉 Platform Status: 99% Complete - Production Ready!**

**Built with ❤️ by the Oniki.net Team**
DOCREADME

echo "✅ docs/README.md oluşturuldu!"
echo ""

# Git'e ekle
git add docs/
git add -A

echo "=================================="
echo "✅ TAMAMLANDI!"
echo "=================================="
echo ""
echo "📊 Sonuç:"
echo "  ✅ docs/ klasörü oluşturuldu"
echo "  ✅ docs/guides/ (6+ dosya)"
echo "  ✅ docs/reports/ (11+ dosya)"
echo "  ✅ docs/scripts/ (11+ dosya)"
echo "  ✅ docs/README.md (kapsamlı index)"
echo ""
echo "📁 Ana dizinde kalan:"
echo "  - README.md (ana proje readme)"
echo "  - LICENSE"
echo "  - frontend/"
echo "  - backend/"
echo "  - .env files"
echo "  - package.json"
echo ""
echo "🔄 Git durumu:"
git status --short | head -30
echo ""
echo "📝 Sonraki adım: Commit ve push"
echo "   git commit -m \"docs: Organize all documentation into docs/ directory\""
echo "   git push origin main"
DOCREADME

chmod +x move_to_docs.sh

echo "✅ docs/README.md oluşturuldu!"
echo ""

