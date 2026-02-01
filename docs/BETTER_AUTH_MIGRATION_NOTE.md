# Better Auth Migration Note

## Current Status
**Date:** 2026-02-01
**Issue:** Using memory adapter for Better Auth (non-persistent storage)

## Problem
The current auth configuration uses `memoryAdapter` which stores user sessions and accounts in memory. This means:
- **User accounts are lost on every deployment**
- **Sessions don't persist across server restarts**
- **Not suitable for production use**

## Current Configuration
```typescript
// lib/auth.ts
export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  database: memoryAdapter({}), // ⚠️ NON-PERSISTENT
  emailAndPassword: { enabled: true },
  // ...
});
```

## Required Migration (Future Phase)
Migrate to **Convex adapter** for persistent storage:

```typescript
// lib/auth.ts - TARGET CONFIGURATION
import { convexAdapter } from "@better-auth/convex";
import { convex } from "@/lib/convex";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  database: convexAdapter(convex), // ✅ PERSISTENT
  emailAndPassword: { 
    enabled: true,
    requireEmailVerification: true, // Enable for production
  },
  // ...
});
```

## Dependencies to Add
```bash
npm install @better-auth/convex
```

## Impact Assessment
| Aspect | Current (Memory) | Target (Convex) |
|--------|------------------|-----------------|
| User Persistence | ❌ Lost on deploy | ✅ Permanent |
| Session Persistence | ❌ Lost on restart | ✅ Persistent |
| Production Ready | ❌ No | ✅ Yes |
| Password Resets | ❌ Not possible | ✅ Possible |
| Email Verification | ❌ Not possible | ✅ Possible |

## Recommended Priority
**HIGH** - Must complete before public launch or user onboarding.

## Related Files
- `lib/auth.ts` - Main auth configuration
- `convex/schema.ts` - May need auth-related tables
- `.env.local` - May need additional Better Auth secrets
