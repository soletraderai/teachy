# Session Notes

This directory contains session notes for tracking development progress across Claude Code sessions.

## Structure

Each session creates a dated file with:
- Problem summary
- Investigation findings
- Fixes applied
- Testing results
- Follow-up items

## Sessions

| Date | File | Summary |
|------|------|---------|
| 2026-01-15 | [2026-01-15-tier-fix.md](./2026-01-15-tier-fix.md) | Fixed Pro tier display race condition (Phase 6) |

## Test Accounts

| Type | Email | Password |
|------|-------|----------|
| PRO | `test-admin@teachy.local` | `TestAdmin123!` |
| FREE | `freetest.teachy@gmail.com` | `FreeTest123!` |

## Quick Reference

### Running the App
```bash
# Frontend (port 5173)
cd /Users/marepomana/Web/Teachy/generations/teachy
npm run dev

# Backend (port 3001) - requires Redis
cd /Users/marepomana/Web/Teachy/generations/teachy/api
npm run dev

# Start Redis
brew services start redis
```

### Key Files for Auth/Tier Issues
- `src/stores/authStore.ts` - Auth state management, tier fetching
- `src/components/ui/ProfileTicket.tsx` - Tier badge display
- `src/App.tsx` - AuthInitializer, hydration handling
