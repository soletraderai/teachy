# Phase 6: Specific Code Fixes

This document contains the exact code changes needed to fix the session and tier issues.

---

## Fix 1: CheckoutSuccess.tsx (CRITICAL)

### Problem
Line 44-45 and 79-80 incorrectly access `userData.user` which is `undefined`.

### File: `src/pages/CheckoutSuccess.tsx`

### Changes Required

**Line 44-45 (dev mode path):**

BEFORE:
```typescript
// Refresh user data to get updated tier
const userData = await authApi.getMe();
setUser(userData.user);
```

AFTER:
```typescript
// Refresh user data to get updated tier
const backendData = await authApi.getMe();
setUser({
  id: backendData.id,
  email: backendData.email,
  displayName: backendData.displayName,
  emailVerified: backendData.emailVerified,
  tier: backendData.tier,
  onboardingCompleted: backendData.onboardingCompleted,
  avatarUrl: backendData.avatarUrl,
});
```

**Line 79-80 (production path):**

BEFORE:
```typescript
// Refresh user data to get updated tier
const userData = await authApi.getMe();
setUser(userData.user);
```

AFTER:
```typescript
// Refresh user data to get updated tier
const backendData = await authApi.getMe();
setUser({
  id: backendData.id,
  email: backendData.email,
  displayName: backendData.displayName,
  emailVerified: backendData.emailVerified,
  tier: backendData.tier,
  onboardingCompleted: backendData.onboardingCompleted,
  avatarUrl: backendData.avatarUrl,
});
```

---

## Fix 2: Add Helper Function to authStore.ts

### File: `src/stores/authStore.ts`

### Add new helper function after `supabaseUserToAuthUser` (around line 56):

```typescript
// Convert backend /auth/me response to AuthUser format
export const backendUserToAuthUser = (backendUser: any): AuthUser => ({
  id: backendUser.id,
  email: backendUser.email,
  displayName: backendUser.displayName,
  emailVerified: backendUser.emailVerified ?? false,
  tier: backendUser.tier || 'FREE',
  onboardingCompleted: backendUser.onboardingCompleted ?? false,
  avatarUrl: backendUser.avatarUrl,
});
```

### Add refreshUserData method to authApi (around line 418):

```typescript
// Refresh user data from backend and update store
async refreshUserData(): Promise<AuthUser | null> {
  try {
    const backendData = await this.getMe();
    const authUser = backendUserToAuthUser(backendData);
    useAuthStore.getState().setUser(authUser);
    return authUser;
  } catch (error) {
    console.error('Failed to refresh user data:', error);
    return null;
  }
},
```

---

## Fix 3: Update CheckoutSuccess.tsx to Use Helper

### File: `src/pages/CheckoutSuccess.tsx`

### Update imports (line 6):

BEFORE:
```typescript
import { useAuthStore, authApi } from '../stores/authStore';
```

AFTER:
```typescript
import { useAuthStore, authApi, backendUserToAuthUser } from '../stores/authStore';
```

### Update line 44-45:

```typescript
const backendData = await authApi.getMe();
setUser(backendUserToAuthUser(backendData));
```

### Update line 79-80:

```typescript
const backendData = await authApi.getMe();
setUser(backendUserToAuthUser(backendData));
```

---

## Fix 4: Clear Session Store on Logout

### File: `src/stores/authStore.ts`

### Update logout function (line 72-81):

BEFORE:
```typescript
logout: async () => {
  try {
    if (isSupabaseConfigured()) {
      await supabaseAuth.signOut();
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
  set({ user: null, accessToken: null, error: null, supabaseSession: null });
},
```

AFTER:
```typescript
logout: async () => {
  try {
    if (isSupabaseConfigured()) {
      await supabaseAuth.signOut();
    }
  } catch (error) {
    console.error('Logout error:', error);
  }

  // Clear auth state
  set({ user: null, accessToken: null, error: null, supabaseSession: null });

  // Clear session store to prevent data leakage between users
  // Using dynamic import to avoid circular dependency
  try {
    const { useSessionStore } = await import('./sessionStore');
    useSessionStore.getState().clearLibrary();
  } catch (err) {
    console.warn('Failed to clear session library:', err);
  }
},
```

---

## Fix 5: Improve Auth Initialization

### File: `src/main.tsx`

### Replace lines 10-20:

BEFORE:
```typescript
// Initialize auth on app startup to fetch fresh user data
useAuthStore.getState().initializeAuth();

// Sync sessions from cloud if user is already authenticated
// (Handles case where auth state is restored from localStorage before INITIAL_SESSION fires)
setTimeout(() => {
  const { isAuthenticated, accessToken } = useAuthStore.getState();
  if (isAuthenticated() && accessToken) {
    useSessionStore.getState().syncWithCloud();
  }
}, 1000); // Delay to allow auth initialization to complete
```

AFTER:
```typescript
// Initialize auth and sync sessions on app startup
const initializeApp = async () => {
  try {
    // Wait for auth to initialize
    await useAuthStore.getState().initializeAuth();

    // Then sync sessions if authenticated
    const { isAuthenticated, accessToken } = useAuthStore.getState();
    if (isAuthenticated() && accessToken) {
      await useSessionStore.getState().syncWithCloud();
    }
  } catch (error) {
    console.error('App initialization error:', error);
  }
};

// Run initialization (non-blocking for initial render)
initializeApp();
```

---

## Fix 6: Make initializeAuth Return a Promise Properly

### File: `src/stores/authStore.ts`

The current `initializeAuth` function already returns a Promise, but we need to ensure it resolves after all async operations complete.

### Update initializeAuth (line 88-123):

The current implementation is mostly correct, but ensure the function doesn't swallow errors:

BEFORE:
```typescript
initializeAuth: async () => {
  if (!isSupabaseConfigured()) {
    return;
  }

  set({ isLoading: true });

  try {
    const session = await supabaseAuth.getSession();
    // ...
  } catch (error) {
    console.error('Failed to initialize auth:', error);
  } finally {
    set({ isLoading: false });
  }
},
```

AFTER:
```typescript
initializeAuth: async () => {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, skipping auth initialization');
    return;
  }

  set({ isLoading: true });

  try {
    const session = await supabaseAuth.getSession();

    if (session?.user) {
      set({
        supabaseSession: session,
        accessToken: session.access_token,
      });

      // Fetch user profile from backend
      try {
        const backendUser = await authApi.getMe();
        set({
          user: supabaseUserToAuthUser(session.user, backendUser),
        });
      } catch (backendError) {
        console.warn('Backend user fetch failed, using Supabase data only:', backendError);
        // Backend might not have user yet, use Supabase data
        set({
          user: supabaseUserToAuthUser(session.user),
        });
      }
    } else {
      // No active session
      set({
        user: null,
        accessToken: null,
        supabaseSession: null,
      });
    }
  } catch (error) {
    console.error('Failed to initialize auth:', error);
    // Clear potentially stale state
    set({
      user: null,
      accessToken: null,
      supabaseSession: null,
    });
    throw error; // Re-throw so caller knows init failed
  } finally {
    set({ isLoading: false });
  }
},
```

---

## Testing Commands

### Create Free Test User via API:

```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "free-user@teachy.local",
    "password": "FreeUser123!",
    "displayName": "Free Test User"
  }'
```

### Verify User Tier via API:

```bash
# First login to get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test-admin@teachy.local", "password": "TestAdmin123!"}' \
  | jq -r '.accessToken')

# Then check user info
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/me | jq '.tier'
```

### Upgrade to Pro (Dev Mode):

```bash
curl -X POST http://localhost:3001/api/subscriptions/dev-upgrade \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"billingType": "monthly"}'
```

---

## Verification Steps

After implementing fixes:

1. **Test Checkout Flow:**
   - Login as free user
   - Go to /pricing, click upgrade
   - Complete checkout (dev mode)
   - Verify tier badge shows "Pro" in sidebar
   - Refresh page, verify still shows "Pro"

2. **Test Logout/Login:**
   - Note current user's tier
   - Logout
   - Login again
   - Verify tier is preserved

3. **Test Session Persistence:**
   - Create a learning session
   - Logout
   - Login
   - Verify session still exists (now should be from cloud sync)

4. **Test Multi-Account:**
   - Login as User A, create session
   - Logout
   - Login as User B
   - Verify User A's sessions are NOT visible

---

## Database Verification Queries

Run these in Supabase SQL Editor:

```sql
-- Check all users and their tiers
SELECT
  u.email,
  u.display_name,
  s.tier,
  s.status,
  s.stripe_subscription_id
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
ORDER BY u.created_at DESC;

-- Find users missing subscription records
SELECT u.email, u.id
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE s.id IS NULL;

-- Fix missing subscription records
INSERT INTO subscriptions (id, user_id, tier, status, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  'FREE',
  'ACTIVE',
  NOW(),
  NOW()
FROM users u
LEFT JOIN subscriptions s ON u.id = s.user_id
WHERE s.id IS NULL;
```
