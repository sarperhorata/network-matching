#!/usr/bin/env python3
"""
Generic Auto Git Commit & Push Script
Usage: python3 auto_git.py [options]
"""

import os
import sys
import subprocess
import argparse
from datetime import datetime
from pathlib import Path

class Colors:
    GREEN = '\033[0;32m'
    BLUE = '\033[0;34m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    BOLD = '\033[1m'
    NC = '\033[0m'  # No Color

def run_cmd(cmd, capture=True):
    """Run shell command and return output"""
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=capture, 
            text=True,
            check=True
        )
        return result.stdout.strip() if capture else None
    except subprocess.CalledProcessError as e:
        return None

def get_git_stats():
    """Get git statistics for changes"""
    stats = {
        'added': 0,
        'modified': 0,
        'deleted': 0,
        'renamed': 0,
        'total': 0,
        'files': [],
        'dirs': set()
    }
    
    # Get file changes
    files = run_cmd("git diff --cached --name-status")
    if not files:
        return stats
    
    for line in files.split('\n'):
        if not line:
            continue
        parts = line.split('\t')
        status = parts[0]
        filename = parts[1] if len(parts) > 1 else ''
        
        if filename:
            stats['files'].append(filename)
            stats['dirs'].add(filename.split('/')[0])
        
        if status == 'A':
            stats['added'] += 1
        elif status == 'M':
            stats['modified'] += 1
        elif status == 'D':
            stats['deleted'] += 1
        elif status.startswith('R'):
            stats['renamed'] += 1
    
    stats['total'] = len(stats['files'])
    return stats

def generate_auto_message(stats):
    """Generate automatic commit message based on changes"""
    if stats['total'] == 0:
        return "chore: Update project files"
    
    # Determine commit type
    if stats['added'] > stats['modified']:
        commit_type = "feat"
    elif stats['deleted'] > 0:
        commit_type = "refactor"
    else:
        commit_type = "chore"
    
    # Build message
    msg = f"{commit_type}: Update project files\n\n"
    
    if stats['added'] > 0:
        msg += f"✅ Added: {stats['added']} files\n"
    if stats['modified'] > 0:
        msg += f"📝 Modified: {stats['modified']} files\n"
    if stats['deleted'] > 0:
        msg += f"🗑️  Deleted: {stats['deleted']} files\n"
    if stats['renamed'] > 0:
        msg += f"📦 Renamed: {stats['renamed']} files\n"
    
    # Add affected directories
    if stats['dirs']:
        dirs = ', '.join(sorted(stats['dirs']))
        msg += f"\nAffected: {dirs}\n"
    
    # Add timestamp
    msg += f"\nTimestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    return msg

def main():
    parser = argparse.ArgumentParser(description='Auto Git Commit & Push')
    parser.add_argument('message', nargs='*', help='Commit message')
    parser.add_argument('--auto', '-a', action='store_true', help='Auto-generate commit message')
    parser.add_argument('--branch', '-b', default='main', help='Branch name (default: main)')
    parser.add_argument('--no-push', action='store_true', help='Commit only, do not push')
    args = parser.parse_args()
    
    # Change to project directory
    os.chdir('/Users/sarperhorata/12net')
    
    print()
    print("=" * 50)
    print(f"{Colors.BOLD}🚀 AUTO COMMIT & PUSH{Colors.NC}")
    print("=" * 50)
    print()
    
    # Check if git repo
    if not Path('.git').exists():
        print(f"{Colors.RED}❌ Error: Not a git repository!{Colors.NC}")
        sys.exit(1)
    
    # Reset any pending commits
    run_cmd("git reset", capture=False)
    
    # Stage all changes
    print(f"{Colors.BLUE}📦 Staging all changes...{Colors.NC}")
    run_cmd("git add -A", capture=False)
    
    # Check if there are changes
    has_changes = run_cmd("git diff --cached --quiet") is None
    if not has_changes:
        print(f"{Colors.YELLOW}⚠️  No changes to commit!{Colors.NC}")
        sys.exit(0)
    
    # Get statistics
    stats = get_git_stats()
    
    # Show changes
    print()
    print(f"{Colors.BLUE}📝 Changes to commit:{Colors.NC}")
    status = run_cmd("git status --short")
    if status:
        for line in status.split('\n')[:30]:
            print(f"  {line}")
    print()
    print(f"{Colors.GREEN}Total files changed: {stats['total']}{Colors.NC}")
    print()
    
    # Get commit message
    if args.auto or not args.message:
        commit_msg = generate_auto_message(stats)
        print(f"{Colors.YELLOW}📝 Auto-generated commit message:{Colors.NC}")
    else:
        commit_msg = ' '.join(args.message)
        print(f"{Colors.BLUE}📝 Using provided commit message:{Colors.NC}")
    
    print(f"{Colors.GREEN}{commit_msg}{Colors.NC}")
    print()
    
    # Commit
    print(f"{Colors.BLUE}💾 Committing changes...{Colors.NC}")
    with open('.commit_msg_tmp', 'w') as f:
        f.write(commit_msg)
    run_cmd("git commit -F .commit_msg_tmp", capture=False)
    os.remove('.commit_msg_tmp')
    
    # Get commit hash
    commit_hash = run_cmd("git rev-parse --short HEAD")
    print()
    print(f"{Colors.GREEN}✅ Commit successful!{Colors.NC}")
    print(f"{Colors.BLUE}Commit hash: {commit_hash}{Colors.NC}")
    print()
    
    # Push if not disabled
    if not args.no_push:
        print(f"{Colors.BLUE}📤 Pushing to {args.branch}...{Colors.NC}")
        run_cmd(f"git push origin {args.branch}", capture=False)
        
        print()
        print("=" * 50)
        print(f"{Colors.GREEN}✅ SUCCESSFULLY PUSHED!{Colors.NC}")
        print("=" * 50)
    else:
        print()
        print("=" * 50)
        print(f"{Colors.GREEN}✅ COMMITTED (not pushed){Colors.NC}")
        print("=" * 50)
    
    # Summary
    print()
    print(f"{Colors.BLUE}📊 Summary:{Colors.NC}")
    print(f"  {Colors.GREEN}✅{Colors.NC} Files changed: {stats['total']}")
    print(f"  {Colors.GREEN}✅{Colors.NC} Branch: {args.branch}")
    print(f"  {Colors.GREEN}✅{Colors.NC} Commit: {commit_hash}")
    if not args.no_push:
        print()
        print(f"{Colors.BLUE}🌐 Check GitHub:{Colors.NC}")
        print("   https://github.com/sarperhorata/network-matching")
    print()
    print(f"{Colors.GREEN}🎉 All done!{Colors.NC}")

if __name__ == '__main__':
    main()

