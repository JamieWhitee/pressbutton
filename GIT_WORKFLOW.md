# Git Workflow Cheat Sheet

## Daily Development Workflow

### Starting New Feature
```bash
# Ensure dev is up to date
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/your-feature-name

# Development cycle
# ... code changes ...
git add .
git commit -m "feat: describe your changes"

# Push feature branch (first time)
git push -u origin feature/your-feature-name

# Continue development
git add .
git commit -m "feat: more changes"
git push
```

### Testing and Integration
```bash
# Switch back to dev for integration
git checkout dev
git pull origin dev  # Get latest changes from team

# Merge your feature
git merge feature/your-feature-name

# Test everything together
npm test
npm run build

# Push integrated changes
git push origin dev
```

### Production Release
```bash
# When dev is stable and tested
git checkout main
git pull origin main
git merge dev
git push origin main

# Tag the release (optional)
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

### Cleanup
```bash
# Delete merged feature branches
git branch -d feature/your-feature-name
git push origin --delete feature/your-feature-name
```

## Quick Commands
```bash
# See all branches
git branch -a

# See branch status
git status

# See commit history
git log --oneline --graph

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Switch branches quickly
git checkout dev
git checkout main
```

## Best Practices
- ✅ Always pull before starting new work
- ✅ Use descriptive commit messages
- ✅ Test before merging to dev
- ✅ Keep feature branches small and focused
- ✅ Delete merged branches to keep clean
- ❌ Never force push to main or dev
- ❌ Never work directly on main
