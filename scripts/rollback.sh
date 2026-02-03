#!/bin/bash
# ===========================================
# QuizTube Rollback Script
# Reverts to a previous deployment
# ===========================================

set -e

# Configuration
DEPLOY_PATH=${DEPLOY_PATH:-"/home/deploy/quiztube"}
ROLLBACK_COMMITS=${1:-1}
SKIP_SMOKE_TEST=${2:-false}

echo "========================================="
echo "QuizTube Rollback Script"
echo "========================================="
echo "Deploy Path: $DEPLOY_PATH"
echo "Commits to rollback: $ROLLBACK_COMMITS"
echo "========================================="
echo ""

cd "$DEPLOY_PATH"

# Get current commit info
CURRENT_COMMIT=$(git rev-parse --short HEAD)
CURRENT_COMMIT_MSG=$(git log -1 --pretty=%B | head -1)

echo "Current deployment:"
echo "  Commit: $CURRENT_COMMIT"
echo "  Message: $CURRENT_COMMIT_MSG"
echo ""

# Get target commit info
TARGET_COMMIT=$(git rev-parse --short HEAD~$ROLLBACK_COMMITS)
TARGET_COMMIT_MSG=$(git log -1 --pretty=%B HEAD~$ROLLBACK_COMMITS | head -1)

echo "Rolling back to:"
echo "  Commit: $TARGET_COMMIT"
echo "  Message: $TARGET_COMMIT_MSG"
echo ""

# Confirm rollback
read -p "Proceed with rollback? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Rollback cancelled"
  exit 0
fi

echo ""
echo "Starting rollback..."

# Log rollback start
echo "$(date): Starting rollback from $CURRENT_COMMIT to $TARGET_COMMIT" >> rollbacks.log

# Checkout target commit
echo "Checking out commit $TARGET_COMMIT..."
git checkout HEAD~$ROLLBACK_COMMITS

# Restart services
echo "Restarting services..."
docker compose -f docker-compose.prod.yml up -d --force-recreate

# Wait for services to start
echo "Waiting for services to stabilize..."
sleep 15

# Run smoke tests unless skipped
if [ "$SKIP_SMOKE_TEST" != "true" ]; then
  echo ""
  echo "Running smoke tests..."

  if ./scripts/smoke-test.sh; then
    echo "Smoke tests passed!"
  else
    echo ""
    echo "WARNING: Smoke tests failed after rollback!"
    echo "Manual intervention may be required."
    echo "$(date): Rollback smoke tests FAILED" >> rollbacks.log
    exit 1
  fi
fi

# Log successful rollback
echo "$(date): Successfully rolled back from $CURRENT_COMMIT to $TARGET_COMMIT" >> rollbacks.log

echo ""
echo "========================================="
echo "Rollback Complete"
echo "========================================="
echo "Previous: $CURRENT_COMMIT"
echo "Current:  $TARGET_COMMIT"
echo "========================================="
echo ""
echo "To roll forward again, run:"
echo "  git checkout main && git pull && docker compose -f docker-compose.prod.yml up -d --force-recreate"
