# Phase 6: User Session and Tier Management Fix Plan

## Executive Summary

After a comprehensive code review of the authentication, session management, and subscription tier systems, I have identified **3 critical bugs** and **4 architectural issues** that are causing:

1. **Session data loss** when logging out and starting new sessions
2. **Pro tier users showing as Free tier** despite database showing correct subscription
3. **Inconsistent user state** after checkout completion

---

## Root Cause Analysis

### Critical Bug #1: CheckoutSuccess.tsx - Incorrect User State Update

**Location:** `src/pages/CheckoutSuccess.tsx:44-45, 79-80`

**Problem:**
```typescript
const userData = await authApi.getMe();
setUser(userData.user);  // BUG: userData.user is UNDEFINED!
```

**Why It's Broken:**
- `authApi.getMe()` returns the backend response directly with properties (`id`, `email`, `tier`, etc.) at the top level
- The code assumes it's wrapped in a `.user` property, which doesn't exist
- **Result:** `setUser(undefined)` is called, clearing the user state entirely
- This explains why Pro users appear as Free after checkout - their user state gets wiped

**Backend Response Structure (`/api/auth/me`):**
```javascript
{
  id: "uuid",
  email: "user@example.com",
  displayName: "User Name",
  tier: "PRO",          // At top level, NOT in .user
  onboardingCompleted: true,
  // ...
}
```

---

### Critical Bug #2: AuthUser Type Mismatch After API Calls

**Location:** Multiple files where `authApi.getMe()` is used

**Problem:**
The `authApi.getMe()` function returns raw backend data that doesn't match the `AuthUser` interface structure. Some code paths correctly convert it using `supabaseUserToAuthUser()`, but others don't.

**Correct Usage (authStore.ts:147-148):**
```typescript
const backendUser = await authApi.getMe();
store.setUser(supabaseUserToAuthUser(session.user, backendUser));
```

**Incorrect Usage (CheckoutSuccess.tsx:44-45):**
```typescript
const userData = await authApi.getMe();
setUser(userData.user);  // No conversion, wrong property access
```

---

### Critical Bug #3: Race Condition in Auth Initialization

**Location:** `src/main.tsx:11-20`

**Problem:**
```typescript
// main.tsx
useAuthStore.getState().initializeAuth();  // ASYNC - NOT AWAITED!

setTimeout(() => {
  const { isAuthenticated, accessToken } = useAuthStore.getState();
  if (isAuthenticated() && accessToken) {
    useSessionStore.getState().syncWithCloud();
  }
}, 1000);
```

**Why It's Broken:**
1. `initializeAuth()` is async but not awaited
2. The 1-second timeout for `syncWithCloud()` is arbitrary and may be insufficient
3. If auth initialization takes longer, `syncWithCloud()` could run before auth is ready
4. If auth completes quickly, the Supabase auth listener fires `INITIAL_SESSION` which ALSO calls `syncWithCloud()` - potential double-sync

---

### Architectural Issue #1: Dual Session Storage Without Proper Sync

**Problem:**
Sessions are stored in two places:
1. **localStorage** (`youtube-learning-sessions`) - via Zustand persist
2. **PostgreSQL** (`sessions` table) - via API calls

The sync logic has several issues:
- `sessionApi.saveSession()` is async but NOT awaited when creating sessions
- If save to cloud fails, it only logs a warning - session is in localStorage but not cloud
- On login, `syncWithCloud()` merges cloud + local, but if cloud is empty, local sessions may be treated differently

---

### Architectural Issue #2: Inconsistent Token Refresh Handling

**Location:** `authStore.ts:165-175`

**Problem:**
```typescript
} else if (event === 'TOKEN_REFRESHED' && session) {
  store.setSupabaseSession(session);
  store.setAccessToken(session.access_token);

  try {
    const backendUser = await authApi.getMe();
    store.setUser(supabaseUserToAuthUser(session.user, backendUser));
  } catch {
    // Keep existing user data if refresh fails - SILENT FAILURE
  }
}
```

If the backend call fails during token refresh, the user's tier data could become stale.

---

### Architectural Issue #3: No User Data Persistence Validation

**Problem:**
When Zustand restores user state from localStorage (`teachy-auth`), there's no validation that:
1. The token is still valid
2. The user data is current
3. The tier hasn't changed

The `initializeAuth()` does fetch fresh data, but race conditions can cause stale localStorage data to be used.

---

### Architectural Issue #4: Session Store Not Cleared on Logout

**Location:** `authStore.ts:72-81`

**Problem:**
When logout occurs:
```typescript
logout: async () => {
  // Only clears AUTH state
  set({ user: null, accessToken: null, error: null, supabaseSession: null });
}
```

The session store (`youtube-learning-sessions`) is NOT cleared. This means:
- If user A logs out and user B logs in, user B sees user A's local sessions
- Session data leakage between accounts
- Confusing behavior when the same user logs back in

---

## Impact Assessment

| Issue | Severity | User Impact |
|-------|----------|-------------|
| CheckoutSuccess.tsx bug | **CRITICAL** | Pro users show as Free after checkout |
| AuthUser type mismatch | **HIGH** | Inconsistent tier display across app |
| Race condition in init | **MEDIUM** | Intermittent session data loss |
| Dual storage sync | **HIGH** | Sessions may not persist to cloud |
| Token refresh handling | **MEDIUM** | Stale tier data after token refresh |
| No data validation | **LOW** | Edge case stale data |
| Session store not cleared | **HIGH** | Data leakage between users |

---

## Implementation Plan

### Phase 6A: Critical Bug Fixes (Immediate)

#### Fix 1: CheckoutSuccess.tsx User State Update

**File:** `src/pages/CheckoutSuccess.tsx`

**Current (Broken):**
```typescript
const userData = await authApi.getMe();
setUser(userData.user);  // Line 45 and 80
```

**Fixed:**
```typescript
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

**Better Fix (Create Helper):**
```typescript
// In authStore.ts - Add new helper function
export const backendUserToAuthUser = (backendUser: any): AuthUser => ({
  id: backendUser.id,
  email: backendUser.email,
  displayName: backendUser.displayName,
  emailVerified: backendUser.emailVerified,
  tier: backendUser.tier || 'FREE',
  onboardingCompleted: backendUser.onboardingCompleted || false,
  avatarUrl: backendUser.avatarUrl,
});

// In CheckoutSuccess.tsx
const backendData = await authApi.getMe();
setUser(backendUserToAuthUser(backendData));
```

---

#### Fix 2: Create Centralized User Refresh Function

**File:** `src/stores/authStore.ts`

**Add new function:**
```typescript
// Add to authApi object
async refreshUserData(): Promise<AuthUser | null> {
  try {
    const backendData = await authApi.getMe();
    const authUser = backendUserToAuthUser(backendData);
    useAuthStore.getState().setUser(authUser);
    return authUser;
  } catch (error) {
    console.error('Failed to refresh user data:', error);
    return null;
  }
}
```

**Update CheckoutSuccess.tsx to use it:**
```typescript
// In verifyCheckout function
await authApi.refreshUserData();
setSuccess(true);
```

---

#### Fix 3: Race Condition in Main.tsx

**File:** `src/main.tsx`

**Current:**
```typescript
useAuthStore.getState().initializeAuth();

setTimeout(() => {
  // ...
}, 1000);
```

**Fixed:**
```typescript
// Make initialization synchronous-safe
const init = async () => {
  await useAuthStore.getState().initializeAuth();

  const { isAuthenticated, accessToken } = useAuthStore.getState();
  if (isAuthenticated() && accessToken) {
    await useSessionStore.getState().syncWithCloud();
  }
};

// Run initialization (non-blocking for render)
init().catch(console.error);
```

**Alternative (Better UX):**
Move initialization to App.tsx with a loading state so users see a spinner until auth is ready.

---

### Phase 6B: Architectural Improvements

#### Improvement 1: Clear Session Store on Logout

**File:** `src/stores/authStore.ts`

**Update logout function:**
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

  // ALSO clear session store to prevent data leakage
  // Import dynamically to avoid circular dependency
  import('./sessionStore').then(({ useSessionStore }) => {
    useSessionStore.getState().clearLibrary();
  });
}
```

---

#### Improvement 2: Add Session Save Error Handling

**File:** `src/stores/sessionStore.ts`

**Current (fire-and-forget):**
```typescript
createSession: (session) => {
  sessionApi.saveSession(session);  // Not awaited, errors swallowed
  return set((state) => ({ ... }));
}
```

**Improved:**
```typescript
createSession: async (session) => {
  // Save locally first
  set((state) => ({
    library: { sessions: [session, ...state.library.sessions] },
    currentSession: session,
  }));

  // Then sync to cloud with retry
  try {
    await sessionApi.saveSession(session);
  } catch (error) {
    console.error('Failed to save session to cloud:', error);
    // Mark session as needing sync
    set((state) => ({
      pendingSyncSessions: [...(state.pendingSyncSessions || []), session.id],
    }));
  }
}
```

---

#### Improvement 3: Add Sync Status Indicator

**New Component:** `src/components/ui/SyncStatus.tsx`

Add a visual indicator showing:
- Sync in progress
- Last successful sync time
- Number of pending unsynced sessions
- Error state with retry button

---

### Phase 6C: Testing Setup

#### Create Free Tier Test User in Supabase

1. Use Supabase Dashboard or SQL:
```sql
-- Create user in auth.users (via Dashboard or API)
-- Then ensure subscription record exists:
INSERT INTO subscriptions (id, user_id, tier, status, created_at, updated_at)
SELECT
  gen_random_uuid(),
  id,
  'FREE',
  'ACTIVE',
  NOW(),
  NOW()
FROM users
WHERE email = 'free-test@teachy.local'
ON CONFLICT (user_id) DO UPDATE SET tier = 'FREE';
```

2. Create via API (development mode):
```bash
# Sign up new user
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"free-test@teachy.local","password":"TestFree123!","displayName":"Free Test User"}'
```

#### Verify Pro Tier Test User

```sql
-- Check current Pro user subscription
SELECT u.email, u.display_name, s.tier, s.status
FROM users u
JOIN subscriptions s ON u.id = s.user_id
WHERE s.tier = 'PRO';

-- If Pro user shows as Free in app but DB shows Pro,
-- it confirms the frontend bug in CheckoutSuccess.tsx
```

---

## File Changes Summary

| File | Change Type | Priority |
|------|-------------|----------|
| `src/pages/CheckoutSuccess.tsx` | Bug fix | **CRITICAL** |
| `src/stores/authStore.ts` | Add helper function | **HIGH** |
| `src/stores/authStore.ts` | Update logout function | **HIGH** |
| `src/main.tsx` | Fix race condition | **MEDIUM** |
| `src/stores/sessionStore.ts` | Add error handling | **MEDIUM** |
| `src/components/ui/SyncStatus.tsx` | New component | **LOW** |

---

## Testing Checklist

After implementing fixes:

- [ ] Sign up new user → verify tier is FREE
- [ ] Upgrade to Pro (dev mode) → verify tier changes to PRO immediately
- [ ] Logout → verify session data is cleared
- [ ] Login again → verify tier is still PRO
- [ ] Create learning session → verify it syncs to cloud
- [ ] Logout and login with different account → verify no data leakage
- [ ] Kill browser and reopen → verify session persists
- [ ] Token refresh (wait 15+ mins) → verify tier still correct

---

## Recommended Implementation Order

1. **Fix CheckoutSuccess.tsx bug** - This is the root cause of Pro→Free issue
2. **Add `backendUserToAuthUser` helper** - Prevents future similar bugs
3. **Fix logout to clear sessions** - Prevents data leakage
4. **Fix main.tsx race condition** - Prevents intermittent issues
5. **Add error handling to session sync** - Improves reliability
6. **Create test users** - Enables proper QA

---

## Estimated Effort

| Task | Effort |
|------|--------|
| CheckoutSuccess.tsx fix | 15 minutes |
| Add helper function | 15 minutes |
| Update logout | 15 minutes |
| Fix main.tsx | 30 minutes |
| Session sync improvements | 1 hour |
| Testing | 1 hour |
| **Total** | **~3.5 hours** |
