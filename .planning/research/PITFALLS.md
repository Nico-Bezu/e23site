# Domain Pitfalls

**Domain:** Small group event coordination site
**Stack:** Next.js 16, Vercel KV (Upstash Redis), localStorage for RSVPs, dark UI
**Researched:** 2026-01-30
**Confidence:** MEDIUM (verified against official Next.js docs and current CVE disclosures)

## Critical Pitfalls

Mistakes that cause rewrites, security breaches, or major issues.

### Pitfall 1: Middleware Authentication Bypass (CVE-2025-29927)

**What goes wrong:** Admin password protection middleware can be completely bypassed by attackers who inject the `x-middleware-subrequest` header, allowing unauthorized access to event creation/editing without authentication.

**Why it happens:** Next.js versions 11.1.4 through 15.2.2 have a critical vulnerability (CVSS 9.1) where the framework's internal header can be manipulated to skip middleware execution entirely. The server processes requests as though middleware already ran and approved them.

**Consequences:**
- Attackers gain full admin access to create, edit, or delete events
- No audit trail of unauthorized changes
- Suite event data can be corrupted or wiped
- Trust in the platform destroyed

**Prevention:**
1. **Upgrade immediately** to Next.js 15.2.3+ (or 14.2.25+) before deploying to production
2. **Defense-in-depth**: Never rely solely on middleware for auth. Re-verify authentication in every Server Action and API Route:
   ```typescript
   // ❌ Wrong: Only checking in middleware
   export async function createEvent(formData: FormData) {
     // No auth check here
   }

   // ✅ Right: Verify in every action
   export async function createEvent(formData: FormData) {
     const isAdmin = await verifyAdminPassword();
     if (!isAdmin) throw new Error("Unauthorized");
     // proceed with event creation
   }
   ```
3. **Security Headers**: Configure reverse proxy or Vercel edge config to strip `x-middleware-subrequest` headers from incoming requests
4. **Rate limiting**: Implement rate limiting on admin routes even after fixing

**Detection:**
- Check Next.js version: `npx next --version` (must be 15.2.3+ or 14.2.25+)
- Monitor for unusual admin activity patterns
- Review Vercel logs for requests containing `x-middleware-subrequest` header

**Phase:** Foundation/MVP — Address during initial security setup

**Sources:**
- [Next.js CVE-2025-29927](https://thehackernews.com/2025/03/critical-nextjs-vulnerability-allows.html)
- [Akamai Detection Guide](https://www.akamai.com/blog/security-research/march-authorization-bypass-critical-nextjs-detections-mitigations)
- [Strobes Security Analysis](https://strobes.co/blog/understanding-next-js-vulnerability/)

---

### Pitfall 2: localStorage RSVP Race Conditions (Multi-User Double Booking)

**What goes wrong:** When multiple suite members try to RSVP simultaneously, localStorage reads/writes conflict, causing RSVP counts to be incorrect or RSVPs to disappear. If two people check capacity at the same time, both might think there's one spot left, and both complete their RSVP.

**Why it happens:**
- localStorage is client-side only and per-browser — one user's localStorage is invisible to other users
- No atomic operations or transactions in localStorage
- Reading, modifying, and writing back creates a race window where another user's change gets overwritten

**Consequences:**
- RSVP counts don't reflect actual attendance
- Members see different lists of who's going
- Event capacity limits can be exceeded
- Trust in the system erodes when "Going" lists are inconsistent

**Prevention:**

**Option 1: Move RSVPs to Vercel KV (Recommended)**
```typescript
// Use Redis atomic operations
import { kv } from '@vercel/kv';

export async function addRSVP(eventId: string, name: string, status: 'going' | 'maybe' | 'not') {
  // Atomic operation - no race condition
  await kv.hset(`event:${eventId}:rsvps`, { [name]: status });

  // Check capacity with atomic read
  const rsvpCount = await kv.hlen(`event:${eventId}:rsvps`);
  return { success: true, count: rsvpCount };
}
```

**Option 2: If keeping localStorage, warn users about limitations**
```typescript
// Show warning in UI
<p className="text-yellow-500 text-sm">
  RSVPs are stored on your device. Other members may see different counts
  until they refresh. For accurate headcount, check the live count on event day.
</p>
```

**Option 3: Hybrid approach**
- Use Vercel KV for RSVP counts and names (source of truth)
- Cache in localStorage for offline viewing only
- Sync on page load/refresh

**Detection:**
- Different users reporting different RSVP counts
- RSVPs disappearing after page refresh
- "Going" count exceeds event capacity

**Phase:** MVP — Decide RSVP storage strategy during database architecture phase

**Sources:**
- [localStorage multi-user limitations](https://medium.com/@behzadsoleimani97/synchronizing-localstorage-across-multiple-tabs-using-javascrip-f683cc8d0907)
- [Hands-on Race Conditions with Redis](https://iniakunhuda.medium.com/hands-on-preventing-database-race-conditions-with-redis-2c94453c1e47)
- [Double Booking System Design](https://itnext.io/solving-double-booking-at-scale-system-design-patterns-from-top-tech-companies-4c5a3311d8ea)

---

### Pitfall 3: Countdown Timer Hydration Mismatch

**What goes wrong:** The countdown timer shows one time on server render, then "jumps" to a different time on client hydration, causing a flash of wrong content and React hydration errors in the console. In worst cases, it breaks the entire page rendering.

**Why it happens:** Server renders the page at time T1 with "2 days 5 hours remaining", but by the time the client hydrates at T2 (even seconds later), the time has changed to "2 days 4 hours 59 minutes", causing a React tree mismatch.

**Consequences:**
- Annoying visual "jump" when page loads
- React hydration errors flood the console
- Can break interactive features if hydration fails
- Poor user experience on initial page load

**Prevention:**

**Solution 1: Client-only rendering with useEffect (Recommended)**
```typescript
'use client';
import { useEffect, useState } from 'react';

export function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    // Initial calculation after hydration
    const updateTime = () => {
      const diff = targetDate.getTime() - Date.now();
      setTimeRemaining(formatTimeDiff(diff));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Render nothing on server, countdown on client
  if (!timeRemaining) return <div className="h-8" />; // Placeholder to prevent layout shift

  return <div>{timeRemaining}</div>;
}
```

**Solution 2: Suppress hydration warning (only if UI flash is acceptable)**
```typescript
<div suppressHydrationWarning>
  {formatTimeDiff(targetDate)}
</div>
```

**Solution 3: Dynamic import with ssr: false**
```typescript
import dynamic from 'next/dynamic';

const CountdownTimer = dynamic(() => import('./CountdownTimer'), {
  ssr: false,
  loading: () => <div className="h-8" />
});
```

**Detection:**
- React error in console: "Text content does not match server-rendered HTML"
- Visual "jump" in countdown display on page load
- Timer shows wrong time briefly then corrects itself

**Phase:** Events Page — Address when implementing countdown feature

**Sources:**
- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [Resolving Hydration Mismatch in Next.js](https://blog.logrocket.com/resolving-hydration-mismatch-errors-next-js/)
- [Fixing Hydration Errors Guide](https://medium.com/@saurabhraut3102/%EF%B8%8F-hydration-errors-in-next-js-what-they-are-and-how-to-fix-them-c225f89731d5)

---

### Pitfall 4: Dark UI Accessibility Failures (WCAG Violations)

**What goes wrong:** Text, buttons, or status indicators have insufficient contrast against dark backgrounds, making the site unusable for members with vision impairments or in bright environments (outdoor pre-game, etc). 83.6% of websites fail WCAG contrast requirements.

**Why it happens:**
- Designers soften colors to "reduce eye strain" but create low contrast
- Saturated brand colors vibrate on dark backgrounds
- Pure black backgrounds (#000000) with white text cause halation effect on OLED screens
- Interactive states (hover, focus, disabled) overlooked during design

**Consequences:**
- WCAG 2.1 AA compliance failure (4.5:1 contrast requirement)
- Members can't read event details in certain environments
- RSVP buttons hard to distinguish from background
- Legal liability (4,605 ADA lawsuits filed in 2024, European Accessibility Act enforced since June 2025)
- Excludes members with visual impairments

**Prevention:**

**1. Use Dark Grey, Not Pure Black**
```css
/* ❌ Wrong: Pure black causes eye strain */
background: #000000;

/* ✅ Right: Dark grey reduces halation */
background: #121212; /* Material Design dark theme baseline */
background: #0a0a0a; /* Slightly lighter alternative */
```

**2. Test All Color Combinations**
- Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Target 4.5:1 minimum for body text (WCAG AA)
- Target 3:1 minimum for large text (18pt+) and UI components

**3. Desaturate Colors on Dark Backgrounds**
```css
/* ❌ Wrong: Saturated colors vibrate */
.status-going { color: #00FF00; } /* Bright green */

/* ✅ Right: Desaturated colors are readable */
.status-going { color: #4ADE80; } /* Softer green with good contrast */
```

**4. Design Interactive States**
```css
/* All states must meet contrast requirements */
.btn-primary {
  background: #3B82F6; /* 4.5:1 on #121212 */
}
.btn-primary:hover {
  background: #60A5FA; /* Lighter but still 3:1 */
}
.btn-primary:disabled {
  background: #1E3A8A; /* Dimmed but still visible */
  opacity: 0.6;
}
```

**5. Test in Real Conditions**
- View site on phone outdoors in sunlight
- Test with browser zoom at 200%
- Use Chrome DevTools Lighthouse accessibility audit

**Detection:**
- Run Lighthouse audit: look for "Background and foreground colors do not have sufficient contrast ratio"
- Manual testing: squint test — if you can't read it while squinting, contrast is too low
- Use axe DevTools browser extension for automated WCAG checks

**Phase:** Foundation — Define color system before any feature work

**Sources:**
- [WCAG Contrast Requirements](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Dark Mode Accessibility Best Practices](https://dubbot.com/dubblog/2023/dark-mode-a11y.html)
- [Color Contrast WCAG 2025 Guide](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025)
- [WebAIM Million Report 2024](https://webaim.org/resources/contrastchecker/)

---

### Pitfall 5: Vercel KV No Longer Exists (Provider Migration Required)

**What goes wrong:** Vercel KV was sunset in December 2024. Projects attempting to use `@vercel/kv` without proper Upstash Redis setup will fail to connect to any database.

**Why it happens:** Vercel migrated all KV stores to Upstash Redis through the Marketplace. New projects must explicitly install a Redis provider integration; Vercel KV is no longer a built-in service.

**Consequences:**
- Events cannot be created, read, updated, or deleted
- Application appears to work locally but fails in production
- Time wasted debugging connection issues
- Confusion from outdated tutorials showing Vercel KV

**Prevention:**

**1. Use Upstash Redis through Vercel Marketplace**
```bash
# Install from Vercel Marketplace:
# 1. Go to project dashboard → Storage → Browse Marketplace
# 2. Select "Upstash Redis"
# 3. Create database and connect

# Then install the SDK:
npm install @upstash/redis
```

**2. Update imports in codebase**
```typescript
// ❌ Old: Vercel KV (no longer works)
import { kv } from '@vercel/kv';

// ✅ New: Upstash Redis
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

**3. Check environment variables**
```env
# Vercel automatically adds these when you connect Upstash:
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

**Detection:**
- Build errors mentioning `@vercel/kv` package not found
- Runtime errors: "Cannot connect to Redis"
- Docs show Vercel KV but service not available in dashboard

**Phase:** Foundation — Set up Redis provider during database selection

**Sources:**
- [Vercel Redis Docs (Updated December 2024)](https://vercel.com/docs/redis)
- [Upstash Vercel Integration](https://upstash.com/docs/redis/howto/vercelintegration)

---

## Moderate Pitfalls

Mistakes that cause delays, bugs, or technical debt.

### Pitfall 6: Next.js 16 Async Request APIs Breaking Change

**What goes wrong:** Code using `params`, `searchParams`, `cookies()`, `headers()`, or `draftMode()` synchronously will throw runtime errors. This affects event detail pages (`/events/[id]`), admin pages checking auth, and any page reading query parameters.

**Why it happens:** Next.js 16 removed synchronous compatibility for Request APIs. All these APIs now return Promises and must be awaited. This is a major breaking change from Next.js 14/15.

**Consequences:**
- Event pages crash with "params is a Promise" errors
- Admin authentication fails to read cookies
- RSVP forms can't read searchParams for pre-filling
- Development works but production breaks (if not caught in build)

**Prevention:**

**1. Update all page/layout/route components to async**
```typescript
// ❌ Wrong: Synchronous access
export default function EventPage({ params }: { params: { id: string } }) {
  const eventId = params.id; // Runtime error in Next.js 16
}

// ✅ Right: Async page component
export default async function EventPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const event = await getEvent(id);
  return <EventDetails event={event} />;
}
```

**2. Update API routes and Server Actions**
```typescript
// ❌ Wrong: Synchronous cookies
export async function POST(request: Request) {
  const cookieStore = cookies(); // Error in Next.js 16
  const token = cookieStore.get('admin-token');
}

// ✅ Right: Await cookies
export async function POST(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin-token');
}
```

**3. Run codemod to automate migration**
```bash
# Next.js provides a codemod to handle 90% of this work
npx @next/codemod@latest upgrade latest

# Or manually run just the async params codemod
npx @next/codemod@latest next-async-request-api .
```

**4. Update TypeScript types**
```typescript
// Old types
type PageProps = {
  params: { id: string };
  searchParams: { filter?: string };
};

// New types
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
};
```

**Detection:**
- Build-time errors: "params/searchParams is a Promise"
- Runtime errors: "Cannot read property of Promise"
- TypeScript errors if strict mode enabled

**Phase:** Foundation — Address during Next.js 16 setup/migration

**Sources:**
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js 16 Complete Guide](https://codelynx.dev/posts/nextjs-16-complete-guide)
- [Migrating to Next.js 16](https://michaelpilgram.co.uk/blog/migrating-to-nextjs-16)

---

### Pitfall 7: React Server Components Event Handler Errors

**What goes wrong:** Passing event handlers (onClick, onChange, etc.) to components in Server Components causes runtime errors: "Event handlers cannot be passed to Client Component props". This breaks interactive elements like RSVP buttons, admin forms, and navigation.

**Why it happens:** Server Components (default in Next.js App Router) cannot have interactivity. Event handlers require JavaScript to run in the browser, which only Client Components support. Developers default to Server Components and forget to add `'use client'`.

**Consequences:**
- RSVP buttons don't respond to clicks
- Admin form submissions fail
- Navigation elements are non-interactive
- Confusing error messages for developers new to App Router

**Prevention:**

**1. Mark interactive components with 'use client'**
```typescript
// ❌ Wrong: Server Component with onClick
export default function RSVPButton({ eventId }: { eventId: string }) {
  return <button onClick={() => submitRSVP(eventId)}>RSVP</button>;
  // Error: Event handlers cannot be passed to Client Component props
}

// ✅ Right: Client Component
'use client';

export default function RSVPButton({ eventId }: { eventId: string }) {
  const handleClick = () => submitRSVP(eventId);
  return <button onClick={handleClick}>RSVP</button>;
}
```

**2. Split components strategically**
```typescript
// ✅ Keep Server Component for data fetching
export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);

  return (
    <div>
      {/* Server Component parts */}
      <EventDetails event={event} />

      {/* Client Component for interactivity */}
      <RSVPButton eventId={id} />
    </div>
  );
}
```

**3. Avoid over-using 'use client'**
- Only mark components that need interactivity (forms, buttons with state)
- Keep data-fetching components as Server Components
- Pass data down from Server to Client Components via props

**Detection:**
- Runtime error: "Event handlers cannot be passed to Client Component props"
- Interactive elements don't respond to user input
- Console shows warnings about Server Component limitations

**Phase:** Events Page, Admin Panel — Address as interactive features are built

**Sources:**
- [Next.js Event Handler Error](https://www.sanity.io/answers/error-in-next-js-tutorial-with-event-handlers-in-server-components-)
- [Next.js Performance Mistakes](https://medium.com/full-stack-forge/7-common-performance-mistakes-in-next-js-and-how-to-fix-them-edd355e2f9a9)

---

### Pitfall 8: Upstash Redis Connection Limits on Free Tier

**What goes wrong:** Even with only 8 suite members, simultaneous requests during event creation or when everyone checks RSVPs can hit free tier rate limits, causing "Too many requests" errors or slow response times.

**Why it happens:**
- Upstash Redis free tier has request limits (exact limits vary by plan)
- Serverless functions create new connections frequently
- Without connection pooling, each request may create a new Redis connection
- Multiple suite members refreshing the page simultaneously spikes requests

**Consequences:**
- Event page loads fail with 429 errors
- RSVPs fail to save during peak times (right after event posted in group chat)
- Admin can't create events during high traffic
- Unpredictable failures that are hard to debug

**Prevention:**

**1. Check Upstash limits for your tier**
```
Visit Upstash dashboard to see:
- Requests per second limit
- Daily request limit
- Concurrent connection limit
```

**2. Use REST API instead of Redis commands**
```typescript
// ✅ Better: REST API has better connection handling
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Automatically handles connections via HTTP
```

**3. Implement caching to reduce Redis requests**
```typescript
import { unstable_cache } from 'next/cache';

// Cache event list for 60 seconds
export const getEvents = unstable_cache(
  async () => {
    const events = await redis.get('events');
    return events;
  },
  ['events-list'],
  { revalidate: 60 }
);
```

**4. Batch Redis operations**
```typescript
// ❌ Wrong: Multiple round trips
const event1 = await redis.get('event:1');
const event2 = await redis.get('event:2');
const event3 = await redis.get('event:3');

// ✅ Right: Single batch request
const [event1, event2, event3] = await redis.mget(
  'event:1',
  'event:2',
  'event:3'
);
```

**5. Monitor usage in Upstash dashboard**
- Set up alerts for 80% of rate limit
- Track daily request patterns
- Upgrade to paid tier if needed (though unlikely with 8 users)

**Detection:**
- 429 "Too Many Requests" errors in production
- Slow Redis responses in Vercel logs
- Upstash dashboard showing high request volume

**Phase:** Events Database — Address during Redis integration setup

**Sources:**
- [Vercel Connection Pooling Guide](https://vercel.com/guides/connection-pooling-with-serverless-functions)
- [Upstash Vercel Integration](https://upstash.com/docs/redis/howto/vercelintegration)
- [Redis Connection Pools for Serverless](https://redis.io/blog/connection-pools-for-serverless-functions-and-backend-services/)

---

### Pitfall 9: Missing RSVP Validation and Controls

**What goes wrong:** The system allows duplicate RSVPs from the same person, doesn't prevent RSVPs after capacity is reached, and doesn't let event creators disable registration when the event is full or the deadline has passed.

**Why it happens:** Developers focus on the happy path (one person RSVPing once) and forget edge cases:
- Same person clicking "Going" multiple times
- No max capacity enforcement
- No RSVP deadline
- No way for admin to close RSVPs manually

**Consequences:**
- RSVP count is inflated (someone clicked "Going" 5 times)
- Event shows 15 RSVPs when capacity is 12
- People RSVP 2 hours before event with no time to prepare
- No way to stop RSVPs after final headcount

**Prevention:**

**1. Validate duplicate RSVPs**
```typescript
export async function addRSVP(eventId: string, name: string, status: string) {
  // Check if this person already RSVPed
  const existingRSVP = await redis.hget(`event:${eventId}:rsvps`, name);

  if (existingRSVP) {
    // Update existing RSVP, don't create duplicate
    await redis.hset(`event:${eventId}:rsvps`, { [name]: status });
    return { success: true, updated: true };
  }

  // New RSVP
  await redis.hset(`event:${eventId}:rsvps`, { [name]: status });
  return { success: true, updated: false };
}
```

**2. Enforce capacity limits**
```typescript
export async function addRSVP(eventId: string, name: string, status: string) {
  const event = await getEvent(eventId);

  if (status === 'going') {
    const goingCount = await redis.hlen(`event:${eventId}:rsvps:going`);

    if (goingCount >= event.capacity) {
      return {
        success: false,
        error: 'Event is full. Try marking yourself as "Maybe".'
      };
    }
  }

  // Proceed with RSVP
}
```

**3. Add RSVP deadline and manual controls**
```typescript
interface Event {
  id: string;
  title: string;
  date: Date;
  rsvpDeadline?: Date;  // Optional deadline
  rsvpClosed: boolean;   // Manual toggle
  capacity: number;
}

export async function addRSVP(eventId: string, name: string, status: string) {
  const event = await getEvent(eventId);

  // Check if RSVPs are manually closed
  if (event.rsvpClosed) {
    return { success: false, error: 'RSVPs are closed for this event.' };
  }

  // Check deadline
  if (event.rsvpDeadline && Date.now() > event.rsvpDeadline.getTime()) {
    return { success: false, error: 'RSVP deadline has passed.' };
  }

  // Proceed with RSVP
}
```

**4. Show clear feedback in UI**
```typescript
{event.rsvpClosed ? (
  <p className="text-red-500">RSVPs are closed</p>
) : goingCount >= event.capacity ? (
  <p className="text-yellow-500">Event is full (waitlist available)</p>
) : (
  <RSVPButtons eventId={event.id} />
)}
```

**Detection:**
- Same name appears multiple times in RSVP list
- "Going" count exceeds capacity
- RSVPs coming in 30 minutes before event
- Admin requests to "lock" RSVPs but no UI option exists

**Phase:** Events Page — Address during RSVP feature implementation

**Sources:**
- [Next.js Event Registration Validation](https://dev.to/arshadayvid/how-i-built-an-event-ticketing-system-with-nextjs-and-firebase-50l2)
- [Event Ticketing System Design](https://singhajit.com/ticket-booking-system-design/)

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

### Pitfall 10: No Local Development Setup for Upstash Redis

**What goes wrong:** Developers can't test event creation/editing locally without hitting production Redis, or they constantly switch environment variables between local Redis and Upstash, causing confusion and accidental data corruption.

**Why it happens:** Upstash Redis doesn't provide a local Docker image or emulator. The @vercel/kv package doesn't support local Redis either. Developers resort to:
- Commenting out Redis calls during dev
- Using separate "dev" Upstash database (costs money)
- Testing only in preview deployments (slow feedback)

**Consequences:**
- Slower development cycle (deploy to test every change)
- Accidental writes to production database
- Can't develop offline
- Hard to write integration tests

**Prevention:**

**Option 1: Use local Redis with compatible client**
```bash
# Run local Redis in Docker
docker run -d -p 6379:6379 redis:7-alpine

# Install ioredis for local dev
npm install ioredis --save-dev
```

```typescript
// lib/redis.ts
import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

export const redis = process.env.NODE_ENV === 'production'
  ? new UpstashRedis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : new Redis(6379, 'localhost'); // Local Redis
```

**Option 2: Mock Redis for development**
```typescript
// lib/redis-mock.ts
const store = new Map();

export const redis = {
  get: async (key: string) => store.get(key),
  set: async (key: string, value: any) => store.set(key, value),
  hget: async (key: string, field: string) => {
    const hash = store.get(key) || {};
    return hash[field];
  },
  hset: async (key: string, data: Record<string, any>) => {
    const hash = store.get(key) || {};
    store.set(key, { ...hash, ...data });
  },
  // Add other methods as needed
};
```

**Option 3: Use separate Upstash database for dev**
- Create a "dev" database in Upstash (free tier allows multiple databases)
- Use different environment variables: `UPSTASH_REDIS_DEV_URL`
- Downside: Requires internet connection, eats into free tier limits

**Detection:**
- Developers complaining they can't test locally
- Production Redis showing test data
- Environment variables constantly being changed
- GitHub issues requesting Docker image support

**Phase:** Foundation — Set up during initial development environment configuration

**Sources:**
- [Vercel KV Local Development Issue](https://github.com/vercel/storage/issues/281)
- [Vercel Storage Local Redis Request](https://github.com/vercel/storage/issues/673)

---

### Pitfall 11: Missing Event State Management (Draft/Published)

**What goes wrong:** Event creators post an event to the site, then immediately see errors in group chat: "The time is wrong!" or "Wait, we moved the location!". There's no way to save a draft, preview how it looks, or edit after publishing without everyone seeing the changes in real-time.

**Why it happens:** Simple CRUD assumes every event created should be immediately visible. Doesn't account for workflow of drafting, reviewing, and publishing.

**Consequences:**
- Events posted with typos or wrong info
- Members see "half-finished" events
- No way to prepare events in advance
- Admin has to be perfect on first try

**Prevention:**

**1. Add draft/published status to events**
```typescript
interface Event {
  id: string;
  title: string;
  date: Date;
  status: 'draft' | 'published' | 'cancelled';
  createdAt: Date;
  publishedAt?: Date;
}
```

**2. Filter events by status in queries**
```typescript
// Public events page - only show published
export async function getPublicEvents() {
  const allEvents = await redis.get<Event[]>('events') || [];
  return allEvents.filter(e => e.status === 'published');
}

// Admin dashboard - show all events with status badges
export async function getAllEvents() {
  return await redis.get<Event[]>('events') || [];
}
```

**3. Add publish/unpublish actions**
```typescript
export async function publishEvent(eventId: string) {
  const events = await redis.get<Event[]>('events') || [];
  const event = events.find(e => e.id === eventId);

  if (event) {
    event.status = 'published';
    event.publishedAt = new Date();
    await redis.set('events', events);
  }
}
```

**4. Show preview in admin UI**
```typescript
// Admin can see how event will look before publishing
<div className="space-y-4">
  <EventCard event={draftEvent} isPreview />
  <Button onClick={() => publishEvent(event.id)}>
    Publish Event
  </Button>
</div>
```

**Detection:**
- Admin requests "save without posting" feature
- Complaints about typos in published events
- Events being deleted and recreated instead of edited

**Phase:** Admin Panel — Add during event creation workflow

---

### Pitfall 12: Timezone Confusion (Event Times)

**What goes wrong:** Events are stored in UTC but displayed in user's local timezone, causing confusion when suite members are in different timezones during breaks. "Party starts at 9pm" but shows as "2am" for someone visiting home.

**Why it happens:** JavaScript Date objects are timezone-aware, but displaying them requires careful handling. Developers assume everyone is in the same timezone (usually true for the suite, but breaks during holidays).

**Consequences:**
- Event times show wrong for members in different timezones
- "Tonight at 10pm" renders as "Tomorrow at 1am" for West Coast members
- Countdown timers are confusing

**Prevention:**

**1. Store timezone with events**
```typescript
interface Event {
  id: string;
  title: string;
  date: Date;
  timezone: string; // 'America/New_York' for college campus
}
```

**2. Always display in event timezone**
```typescript
import { format, toZonedTime } from 'date-fns-tz';

export function EventTime({ event }: { event: Event }) {
  const zonedDate = toZonedTime(event.date, event.timezone);
  const timeString = format(zonedDate, 'h:mm a zzz', { timeZone: event.timezone });

  return (
    <time dateTime={event.date.toISOString()}>
      {timeString}
    </time>
  );
}
```

**3. Show relative time for clarity**
```typescript
import { formatDistanceToNow } from 'date-fns';

// "Tonight at 9pm (in 3 hours)"
<p>
  Tonight at 9pm
  <span className="text-gray-400">
    ({formatDistanceToNow(event.date, { addSuffix: true })})
  </span>
</p>
```

**Detection:**
- Members report wrong event times
- "Tonight" events showing as "Tomorrow"
- Countdown timers don't match expected time

**Phase:** Events Page — Address when implementing date/time display

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation | Priority |
|-------------|----------------|------------|----------|
| Foundation Setup | Next.js version wrong, Vercel KV doesn't exist | Verify Next.js 15.2.3+, use Upstash Redis | CRITICAL |
| Database Architecture | localStorage RSVP race conditions | Use Vercel KV/Upstash for RSVPs, not localStorage | CRITICAL |
| Admin Security | CVE-2025-29927 middleware bypass | Upgrade Next.js, defense-in-depth auth | CRITICAL |
| Events Page | Countdown timer hydration mismatch | Client-only rendering with useEffect | HIGH |
| Design System | Dark UI contrast failures | WCAG testing, 4.5:1 ratio, dark grey not black | HIGH |
| RSVP Feature | Double booking, no validation | Atomic Redis ops, duplicate checking, capacity limits | HIGH |
| Admin Panel | No draft/publish workflow | Add event status field and filtering | MEDIUM |
| Admin Forms | Server Component event handler errors | Mark form components with 'use client' | MEDIUM |
| Event Display | Timezone confusion | Store timezone with events, use date-fns-tz | MEDIUM |
| Production Deploy | Upstash rate limits hit during traffic spike | REST API, caching, batch operations, monitor limits | MEDIUM |
| Local Development | Can't test Redis locally | Mock Redis or local Redis with ioredis | LOW |

---

## Testing Checklist

Before deploying to production, verify these pitfalls are addressed:

### Security
- [ ] Next.js version is 15.2.3 or higher (CVE-2025-29927 patched)
- [ ] Admin password verified in Server Actions, not just middleware
- [ ] Rate limiting enabled on admin routes
- [ ] No `x-middleware-subrequest` header accepted from external requests

### Data Integrity
- [ ] RSVPs stored in Redis (Upstash), not localStorage
- [ ] Duplicate RSVP checking implemented
- [ ] Event capacity limits enforced
- [ ] RSVP deadline/manual close functionality working

### Accessibility
- [ ] Color contrast tested with WebAIM checker (4.5:1 minimum)
- [ ] Background is dark grey (#121212), not pure black
- [ ] Interactive elements have visible hover/focus states
- [ ] Lighthouse accessibility score 90+

### Next.js 16 Compatibility
- [ ] All pages/layouts are async functions
- [ ] `params`, `searchParams` are awaited
- [ ] `cookies()`, `headers()` are awaited
- [ ] Codemod run: `npx @next/codemod@latest upgrade latest`

### User Experience
- [ ] Countdown timer uses useEffect (no hydration errors)
- [ ] Event times display correctly in event timezone
- [ ] RSVP buttons respond to clicks ('use client' directive)
- [ ] Clear error messages for full events/closed RSVPs

### Infrastructure
- [ ] Upstash Redis connected (not @vercel/kv)
- [ ] Environment variables set: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- [ ] Redis operations use REST API, not TCP
- [ ] Caching implemented for event list (reduce Redis requests)
- [ ] Upstash usage monitored in dashboard

---

## Sources

### Security Vulnerabilities
- [Critical Next.js Middleware Bypass - The Hacker News](https://thehackernews.com/2025/03/critical-nextjs-vulnerability-allows.html)
- [CVE-2025-29927 Detection and Mitigation - Akamai](https://www.akamai.com/blog/security-research/march-authorization-bypass-critical-nextjs-detections-mitigations)
- [Understanding Next.js Vulnerability - Strobes Security](https://strobes.co/blog/understanding-next-js-vulnerability/)
- [Next.js Security Advisory CVE-2025-66478](https://nextjs.org/blog/CVE-2025-66478)
- [Next.js Security Update December 2025](https://nextjs.org/blog/security-update-2025-12-11)

### Race Conditions & RSVP Issues
- [Preventing Database Race Conditions with Redis - Medium](https://iniakunhuda.medium.com/hands-on-preventing-database-race-conditions-with-redis-2c94453c1e47)
- [Building a Ticketing System: Concurrency and Locks - Medium](https://codefarm0.medium.com/building-a-ticketing-system-concurrency-locks-and-race-conditions-182e0932d962)
- [Double Booking System Design - ITNEXT](https://itnext.io/solving-double-booking-at-scale-system-design-patterns-from-top-tech-companies-4c5a3311d8ea)
- [localStorage Synchronization Challenges - Medium](https://medium.com/@behzadsoleimani97/synchronizing-localstorage-across-multiple-tabs-using-javascrip-f683cc8d0907)

### Dark UI Accessibility
- [WCAG Contrast Requirements - W3C](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Dark Mode Accessibility Best Practices - DubBot](https://dubbot.com/dubblog/2023/dark-mode-a11y.html)
- [Color Contrast WCAG 2025 Guide - AllAccessible](https://www.allaccessible.org/blog/color-contrast-accessibility-wcag-guide-2025)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Offering Dark Mode Doesn't Satisfy WCAG - BOIA](https://www.boia.org/blog/offering-a-dark-mode-doesnt-satisfy-wcag-color-contrast-requirements)

### Hydration Errors
- [Next.js Hydration Error Documentation](https://nextjs.org/docs/messages/react-hydration-error)
- [Resolving Hydration Mismatch in Next.js - LogRocket](https://blog.logrocket.com/resolving-hydration-mismatch-errors-next-js/)
- [Fixing Hydration Errors Guide - Medium](https://medium.com/@saurabhraut3102/%EF%B8%8F-hydration-errors-in-next-js-what-they-are-and-how-to-fix-them-c225f89731d5)

### Next.js 16 Breaking Changes
- [Next.js 16 Upgrade Guide - Official Docs](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js 16 Complete Guide - CodeLynx](https://codelynx.dev/posts/nextjs-16-complete-guide)
- [Migrating to Next.js 16 - Michael Pilgram](https://michaelpilgram.co.uk/blog/migrating-to-nextjs-16)

### Vercel KV / Upstash Redis
- [Vercel Redis Documentation](https://vercel.com/docs/redis)
- [Upstash Vercel Integration](https://upstash.com/docs/redis/howto/vercelintegration)
- [Connection Pooling with Vercel Functions](https://vercel.com/guides/connection-pooling-with-serverless-functions)
- [Redis Connection Pools for Serverless - Redis Blog](https://redis.io/blog/connection-pools-for-serverless-functions-and-backend-services/)

### Next.js Best Practices
- [Next.js Authentication Guide 2025 - Clerk](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router)
- [Security Best Practices in Next.js 16 - Medium](https://medium.com/@sureshdotariya/robust-security-authentication-best-practices-in-next-js-16-6265d2d41b13)
- [How to Think About Security in Next.js](https://nextjs.org/blog/security-nextjs-server-components-actions)
- [Event Registration System with Next.js - DEV](https://dev.to/arshadayvid/how-i-built-an-event-ticketing-system-with-nextjs-and-firebase-50l2)
