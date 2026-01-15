# Test User Setup Guide

This document explains how to set up Free and Pro tier test users for QA testing.

---

## Current Test User

The `.env` file already has a test user configured:

```
TEST_USER_EMAIL=test-admin@teachy.local
TEST_USER_PASSWORD=TestAdmin123!
```

This user may already exist and may be on Pro tier (if dev-upgrade was used).

---

## Creating a Free Tier Test User

### Option 1: Via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: `free-test@teachy.local`
   - Password: `FreeTest123!`
   - Auto-confirm: Yes
4. The auth middleware will auto-create the user in your database with FREE tier

### Option 2: Via API

```bash
# From the project root
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "free-test@teachy.local",
    "password": "FreeTest123!",
    "displayName": "Free Test User"
  }'
```

Expected response:
```json
{
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "email": "free-test@teachy.local",
    "displayName": "Free Test User",
    "emailVerified": false,
    "tier": "FREE",
    "onboardingCompleted": false
  },
  "accessToken": "jwt..."
}
```

### Option 3: Via Frontend

1. Go to http://localhost:5173/signup
2. Enter:
   - Display Name: `Free Test User`
   - Email: `free-test@teachy.local`
   - Password: `FreeTest123!`
3. Submit
4. User will be created with FREE tier

---

## Creating/Verifying a Pro Tier Test User

### Step 1: Create User (if not exists)

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pro-test@teachy.local",
    "password": "ProTest123!",
    "displayName": "Pro Test User"
  }'
```

### Step 2: Login and Get Token

```bash
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "pro-test@teachy.local", "password": "ProTest123!"}' \
  | jq -r '.accessToken')

echo "Token: $TOKEN"
```

### Step 3: Upgrade to Pro (Dev Mode)

```bash
curl -X POST http://localhost:3001/api/subscriptions/dev-upgrade \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"billingType": "monthly"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Subscription upgraded to PRO (development mode)",
  "billingType": "monthly",
  "periodEnd": "2026-02-15T..."
}
```

### Step 4: Verify Pro Status

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/me | jq '{email, tier, subscriptionStatus}'
```

Expected:
```json
{
  "email": "pro-test@teachy.local",
  "tier": "PRO",
  "subscriptionStatus": "ACTIVE"
}
```

---

## Test Credentials Summary

| User Type | Email | Password | Expected Tier |
|-----------|-------|----------|---------------|
| Free | `free-test@teachy.local` | `FreeTest123!` | FREE |
| Pro | `pro-test@teachy.local` | `ProTest123!` | PRO |
| Admin | `test-admin@teachy.local` | `TestAdmin123!` | Check DB |

---

## Verifying Tier in Database

### Via Supabase SQL Editor

```sql
-- Check all test users
SELECT
  u.email,
  u.display_name,
  s.tier,
  s.status,
  s.current_period_end
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE u.email LIKE '%@teachy.local'
ORDER BY u.email;
```

### Via API Health Check

Create a simple script to verify all test users:

```bash
#!/bin/bash

echo "=== Testing Free User ==="
FREE_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "free-test@teachy.local", "password": "FreeTest123!"}' \
  | jq -r '.accessToken')

if [ "$FREE_TOKEN" != "null" ] && [ -n "$FREE_TOKEN" ]; then
  TIER=$(curl -s -H "Authorization: Bearer $FREE_TOKEN" \
    http://localhost:3001/api/auth/me | jq -r '.tier')
  echo "Free user tier: $TIER"
  [ "$TIER" = "FREE" ] && echo "✓ PASS" || echo "✗ FAIL - Expected FREE"
else
  echo "✗ FAIL - Could not login as free user"
fi

echo ""
echo "=== Testing Pro User ==="
PRO_TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "pro-test@teachy.local", "password": "ProTest123!"}' \
  | jq -r '.accessToken')

if [ "$PRO_TOKEN" != "null" ] && [ -n "$PRO_TOKEN" ]; then
  TIER=$(curl -s -H "Authorization: Bearer $PRO_TOKEN" \
    http://localhost:3001/api/auth/me | jq -r '.tier')
  echo "Pro user tier: $TIER"
  [ "$TIER" = "PRO" ] && echo "✓ PASS" || echo "✗ FAIL - Expected PRO"
else
  echo "✗ FAIL - Could not login as pro user"
fi
```

---

## Troubleshooting

### User can't login
- Check if user exists in Supabase Auth dashboard
- Check if user has a record in `users` table
- Verify password meets requirements (8+ chars)

### User shows wrong tier
- Check `subscriptions` table has correct tier value
- Apply the code fixes in `code-fixes.md`
- Clear browser localStorage and login again

### User has no subscription record
Run this SQL to fix:
```sql
INSERT INTO subscriptions (id, user_id, tier, status, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  'FREE',
  'ACTIVE',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'user@example.com'
AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = u.id);
```

---

## Quick Reference Commands

```bash
# Login and save token
export TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "EMAIL", "password": "PASSWORD"}' | jq -r '.accessToken')

# Check current user info
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/auth/me | jq

# Check subscription status
curl -H "Authorization: Bearer $TOKEN" http://localhost:3001/api/subscriptions/status | jq

# Upgrade to Pro
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  http://localhost:3001/api/subscriptions/dev-upgrade \
  -d '{"billingType": "monthly"}'

# Downgrade to Free (cancel)
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/subscriptions/dev-cancel
```
