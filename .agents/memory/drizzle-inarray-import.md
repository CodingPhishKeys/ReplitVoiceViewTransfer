---
name: Drizzle inArray static import
description: inArray from drizzle-orm must be statically imported; dynamic import silently fails in storage methods.
---

## Rule
Always import `inArray` (and all drizzle-orm helpers) at the top of `server/storage.ts` as a static import.

```typescript
import { eq, ilike, and, count, inArray } from "drizzle-orm";
```

Never use `const { inArray } = await import("drizzle-orm")` inside a method.

**Why:** Dynamic `await import("drizzle-orm")` inside an async storage method silently fails in this ESM/tsx environment — the function resolves but the resulting query silently does nothing or errors without surfacing to the client. The mutation appears to fire (no client error) but the server route handler throws without logging, so the user sees "nothing happens."

**How to apply:** Any time a new drizzle-orm operator (inArray, notInArray, between, etc.) is needed in storage.ts, add it to the static import line at the top of the file.
