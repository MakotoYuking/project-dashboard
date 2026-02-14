# Git Workflow Guide - Update Files in GitHub

## 🔄 Basic File Update Process

### Step 1: Check Current Status
```bash
# See what files have changed
git status

# See specific changes in a file
git diff src/app/page.tsx
```

### Step 2: Add Changes to Staging
```bash
# Add specific file
git add src/app/page.tsx

# Add multiple files
git add src/app/page.tsx src/components/FirebaseTest.tsx

# Add all changes
git add .
```

### Step 3: Commit Changes
```bash
# Commit with descriptive message
git commit -m "Update dashboard UI with new features"

# Commit with detailed message
git commit -m "Fix: Resolve Firebase connection issues

- Updated error handling in FirebaseTest component
- Added loading states for better UX
- Fixed TypeScript type errors"
```

### Step 4: Push to GitHub
```bash
# Push to main branch
git push origin main

# Push to specific branch
git push origin feature-name
```

## 🎯 Practical Examples

### Example 1: Update Single File
```bash
# 1. Edit the file (in VS Code or editor)
# 2. Check status
git status

# 3. Add the specific file
git add src/components/FirebaseTest.tsx

# 4. Commit
git commit -m "Fix: Improve Firebase test error handling"

# 5. Push
git push origin main
```

### Example 2: Update Multiple Files
```bash
# 1. Edit multiple files
# 2. Check what changed
git status

# 3. Add all changes
git add .

# 4. Commit with detailed message
git commit -m "Feature: Add comprehensive Firebase testing

- Created FirebaseTest component with connection testing
- Added real-time sync monitoring
- Implemented test data management
- Updated dashboard to use Firebase provider"

# 5. Push
git push origin main
```

### Example 3: Quick Fix
```bash
# Quick one-liner for small changes
git add . && git commit -m "Hotfix: Resolve button styling issue" && git push origin main
```

## 📋 Git Commands Reference

### Status & Changes
```bash
git status              # Show working tree status
git diff                # Show unstaged changes
git diff --staged       # Show staged changes
git log                 # Show commit history
git log --oneline       # Show compact commit history
```

### Adding Files
```bash
git add <file>          # Add specific file
git add *.tsx           # Add all TypeScript files
git add src/             # Add all files in src folder
git add .                # Add all changes
```

### Committing
```bash
git commit -m "message" # Commit with message
git commit -am "message"# Add and commit modified files
git commit --amend      # Modify last commit
```

### Pushing & Pulling
```bash
git push origin main    # Push to GitHub
git pull origin main    # Pull latest changes
git fetch origin        # Fetch without merging
```

## 🔧 Advanced Workflow

### Working with Branches
```bash
# Create new branch
git checkout -b feature/firebase-improvements

# Make changes...
git add .
git commit -m "Add Firebase improvements"

# Switch back to main
git checkout main

# Merge branch
git merge feature/firebase-improvements

# Push merged changes
git push origin main

# Delete branch
git branch -d feature/firebase-improvements
```

### Checking Before Push
```bash
# Check what will be pushed
git log origin/main..HEAD

# Check specific file changes
git diff origin/main -- src/app/page.tsx

# See commit history
git log --oneline -5
```

## 🚨 Common Issues & Solutions

### Issue: "Push rejected - non-fast-forward"
```bash
# Solution: Pull latest changes first
git pull origin main
# Resolve any conflicts if needed
# Then push
git push origin main
```

### Issue: "Nothing to commit"
```bash
# Check if files are actually changed
git status
# If no changes, make some edits first
```

### Issue: "Permission denied"
```bash
# Check GitHub credentials
git config --list
# Re-authenticate if needed
git remote set-url origin https://YOUR_USERNAME:YOUR_TOKEN@github.com/YOUR_USERNAME/project-dashboard.git
```

## 📱 Best Practices

### Commit Message Format
```
type(scope): description

feat(dashboard): add Firebase integration
fix(auth): resolve login error
docs(readme): update setup instructions
style(ui): improve button styling
refactor(api): simplify database queries
test(firebase): add connection tests
```

### Commit Message Examples
```bash
# Good
git commit -m "feat(firebase): add real-time data synchronization"

# Bad
git commit -m "update stuff"

# Good with details
git commit -m "fix(ui): resolve responsive design issues

- Fixed mobile layout for project cards
- Improved button sizing on small screens
- Added proper breakpoints for tablets"
```

### Workflow Tips
1. **Commit often**: Small, focused commits
2. **Write clear messages**: Explain what and why
3. **Pull before push**: Avoid conflicts
4. **Check status**: Know what you're committing
5. **Review changes**: Use `git diff` before commit

## 🎯 Quick Reference

### Update Single File (Most Common)
```bash
git add path/to/your/file.tsx
git commit -m "Describe your changes"
git push origin main
```

### Update Multiple Files
```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

### Check Before Push
```bash
git status
git log --oneline -3
git push origin main
```

## 🔍 Real Example: Update Firebase Test Component

Let's say you want to update the FirebaseTest component:

```bash
# 1. Edit src/components/FirebaseTest.tsx
# 2. Check what changed
git status

# Output:
# On branch main
# Your branch is up to date with 'origin/main'.
# Changes not staged for commit:
#   (use "git add <file>..." to update what will be committed)
#   (use "git restore <file>..." to discard changes in working directory)
#         modified:   src/components/FirebaseTest.tsx

# 3. Add the specific file
git add src/components/FirebaseTest.tsx

# 4. Commit with descriptive message
git commit -m "fix(firebase): improve error handling in test component"

# 5. Push to GitHub
git push origin main

# Output:
# Enumerating objects: 7, done.
# Counting objects: 100% (7/7), done.
# Delta compression using up to 6 threads
# Compressing objects: 100% (4/4), done.
# Writing objects: 100% (4/4), 1.2 KiB | 1.2 MiB/s, done.
# Total 4 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
# To https://github.com/MakotoYuking/project-dashboard.git
#    abc1234..def5678  main -> main
```

That's it! Your changes are now on GitHub! 🎉
