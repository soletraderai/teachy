# Phase 6: Comprehensive Tier Display Bug Fix

## Problem Summary
Pro user `test-admin@teachy.local` shows as "FREE" in sidebar despite database having correct `tier: 'PRO'`.

## Investigation Findings

### Database Verification (CORRECT)
```sql
-- User record
id: test-admin-4ef45215
email: test-admin@teachy.local
supabase_id: dccfef81-5415-4097-9d7f-0b732ca99fc1

-- Subscription record
user_id: test-admin-4ef45215
tier: PRO
status: ACTIVE
```

### Backend API (CORRECT)
`/auth/me` endpoint correctly returns `tier: user.subscription?.tier || 'FREE'`

## Root Cause Analysis

**Five overlapping failure points** explain why 5 previous fixes failed:

| # | Bug | Location | Impact |
|---|-----|----------|--------|
| 1 | Non-blocking initialization | `main.tsx:27` | React renders before data is ready |
| 2 | isLoading starts as `false` | `authStore.ts:73` | No loading state during fetch |
| 3 | Zustand hydrates BEFORE initializeAuth | `authStore.ts` persist config | Stale localStorage data used |
| 4 | ProfileTicket default `tier = 'Free'` | `ProfileTicket.tsx:29` | Masks undefined tier issues |
| 5 | No atomic state updates | `authStore.ts` onAuthStateChange | Stale user data persists |

### The Race Condition Timeline

```
T0: Page loads
T1: Zustand persist hydrates from localStorage
    -> user = { tier: 'FREE' } (STALE)
T2: React renders App immediately
    -> isLoading = false (NOT SET TO TRUE YET)
T3: Sidebar renders with stale tier = 'FREE'
T4: initializeAuth() called (async, non-blocking)
    -> set({ isLoading: true }) -- TOO LATE!
T5: Backend returns tier: 'PRO'
T6: UI may or may not re-render
```

## Implementation Plan

### Fix 1: Add Hydration-Aware State to authStore.ts
**File:** `generations/teachy/src/stores/authStore.ts`

```typescript
// Add to AuthState interface:
hasHydrated: boolean;
setHasHydrated: (hydrated: boolean) => void;

// Change initial state:
isLoading: true,  // Was false
hasHydrated: false,

// Add to persist config:
onRehydrateStorage: () => (state) => {
  state?.setHasHydrated(true);
},
```

### Fix 2: Create AuthProvider Component (NEW FILE)
**File:** `generations/teachy/src/components/auth/AuthProvider.tsx`

```typescript
import { useEffect, useState, ReactNode } from 'react';
import { useAuthStore, authApi } from '../../stores/authStore';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const { hasHydrated, accessToken, setLoading } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    const refreshUserData = async () => {
      if (accessToken) {
        setLoading(true);
        try {
          await authApi.refreshUserData();
        } catch (error) {
          console.warn('[AuthProvider] Failed to refresh user:', error);
        } finally {
          setLoading(false);
        }
      }
      setIsInitialized(true);
    };

    refreshUserData();
  }, [hasHydrated, accessToken]);

  if (!hasHydrated || !isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
```

### Fix 3: Update main.tsx
**File:** `generations/teachy/src/main.tsx`

```typescript
import AuthProvider from './components/auth/AuthProvider'

// REMOVE the initializeApp() call entirely

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
```

### Fix 4: Remove Dangerous Default in ProfileTicket
**File:** `generations/teachy/src/components/ui/ProfileTicket.tsx`

```typescript
// Line 29 - REMOVE default:
tier,  // Was: tier = 'Free'

// Line 192 - Add conditional rendering:
{tier ? (
  <span className={`pop-badge mt-1 ${getTierBadgeClass(tier)}`}>
    {tier}
  </span>
) : (
  <span className="pop-badge mt-1 pop-badge-lemon animate-pulse">
    ...
  </span>
)}
```

### Fix 5: Update Sidebar Loading State
**File:** `generations/teachy/src/components/ui/Sidebar.tsx`

```typescript
// Line 63:
const { user, isAuthenticated, isLoading } = useAuthStore();

// Line 228:
tier={isLoading ? undefined : user.tier}
```

### Fix 6: Atomic State Updates in onAuthStateChange
**File:** `generations/teachy/src/stores/authStore.ts`

```typescript
// Around line 179:
if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
  // FIRST: Clear stale data atomically
  set({
    supabaseSession: session,
    accessToken: session.access_token,
    isLoading: true,
    user: null,  // <- Clear stale user
  });

  // THEN: Fetch fresh data
  try {
    const backendUser = await authApi.getMe();
    set({
      user: supabaseUserToAuthUser(session.user, backendUser),
      isLoading: false,
    });
  } catch (error) {
    // ... error handling
  }
}
```

## Files to Modify

| File | Change Type | Priority |
|------|-------------|----------|
| `src/stores/authStore.ts` | Modify | CRITICAL |
| `src/components/auth/AuthProvider.tsx` | NEW | CRITICAL |
| `src/main.tsx` | Modify | CRITICAL |
| `src/components/ui/ProfileTicket.tsx` | Modify | HIGH |
| `src/components/ui/Sidebar.tsx` | Modify | HIGH |

## Why This Will Work

| Previous Fix | What It Addressed | Why It Failed |
|-------------|------------------|---------------|
| CheckoutSuccess.tsx | Wrong property access | Stale localStorage |
| backendUserToAuthUser | Mapping helper | Race condition |
| logout clear | Data leakage | Upgrade path doesn't logout |
| main.tsx async/await | Init ordering | Still non-blocking render |
| initializeAuth error | Error handling | Hydration timing unchanged |

**This fix addresses ALL failure points simultaneously:**
- Hydration timing via `hasHydrated` state
- Rendering blocked until fresh data via `AuthProvider`
- No dangerous defaults in `ProfileTicket`
- Loading state shown during data fetch
- Atomic updates that clear stale data before setting fresh data

## Verification Steps

1. Clear browser localStorage:
   - `teachy-auth` key
   - `teachy-supabase-auth` key

2. Login as `test-admin@teachy.local` / `TestAdmin123!`

3. Verify:
   - [ ] Tier shows "PRO" in sidebar immediately after login
   - [ ] Page refresh - tier still shows "PRO"
   - [ ] Console shows `[AuthProvider] Refreshed user data: PRO`
   - [ ] No "FREE" flash before "PRO" appears
