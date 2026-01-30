# Technology Stack

**Project:** E23 Suite Website
**Domain:** Small group event coordination site (8 users)
**Researched:** 2026-01-30
**Overall Confidence:** HIGH

## Executive Summary

For an 8-person private suite hub, the 2025 stack prioritizes simplicity, minimal infrastructure, and leveraging Vercel's ecosystem. Key principle: **avoid over-engineering for enterprise scale**. This is not a SaaS product with thousands of users - it's a private tool for 8 college friends.

**Stack Philosophy:**
- Use managed services over self-hosted (Upstash over self-managed Redis)
- Prefer zero-config solutions (bcryptjs over bcrypt, shadcn/ui over custom components)
- Leverage Next.js Server Actions over separate API routes
- Keep dependencies minimal (no ORMs for simple data models)

---

## Core Framework (Already Chosen)

### Next.js 16

| Technology | Version | Status | Notes |
|------------|---------|--------|-------|
| Next.js | 16.1+ | ✅ Confirmed | LTS release (Oct 2025), stable Turbopack |
| React | 19.2+ | ✅ Confirmed | Stable (Dec 2024) with Server Components |
| Tailwind CSS | 4.0+ | ✅ Confirmed | Released Jan 2025, 5-100x faster builds |
| Vercel | Latest | ✅ Confirmed | Hosting platform |

**Confidence:** HIGH (Official releases verified)

**Why this works for 8 users:**
- Next.js 16 includes stable Turbopack = instant dev experience
- React 19 Server Components = less JavaScript sent to 8 phones
- Tailwind v4 with Oxide engine = sub-second builds even as CSS grows
- Vercel hosting = zero DevOps for small team

**Sources:**
- [Next.js 16 Official Release](https://nextjs.org/blog/next-16)
- [React 19 Stable Release](https://react.dev/blog/2024/12/05/react-19)
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)

---

## Data Storage

### ⚠️ Important: Vercel KV Sunset

**Critical Finding:** Vercel KV was discontinued and transitioned to Vercel Marketplace in 2025. The original Vercel KV product no longer exists.

### Recommended: Upstash Redis

| Technology | Version | Purpose | Cost |
|------------|---------|---------|------|
| @upstash/redis | 1.36.1+ | Key-value storage for events, RSVPs, sessions | FREE (500K commands/mo) |

**Why Upstash Redis:**
- **Free tier covers your needs:** 256MB storage, 500K commands/month = ~50K RSVPs/day (you have 8 users)
- **Vercel integration:** Available in Vercel Marketplace with auto-provisioning
- **Serverless-first:** HTTP-based, no connection pooling issues in Edge/Serverless Functions
- **Originally powered Vercel KV:** Same underlying technology
- **Simple SDK:** `await redis.set('event:123', data)` - no complex ORM

**Installation:**
```bash
npm install @upstash/redis
```

**Configuration:**
```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})
```

**Data Model for 8 Users:**
```typescript
// Events: event:{id} → { title, date, location, description }
// RSVPs: rsvp:{eventId}:{userId} → "going" | "maybe" | "not_going"
// Members: member:{id} → { name, avatar, role }
// Sessions: session:{token} → { userId, expiresAt }
```

**Confidence:** HIGH (Official Upstash docs, Vercel marketplace verified)

**Sources:**
- [Upstash Redis Documentation](https://upstash.com/docs/redis/sdks/ts/getstarted)
- [Upstash Pricing & Free Tier](https://upstash.com/docs/redis/overall/pricing)
- [Vercel KV Sunset Notice](https://vercel.com/docs/storage)

### Alternative: Vercel Postgres (NOT Recommended for This Scale)

| Technology | Purpose | Why NOT |
|------------|---------|---------|
| Vercel Postgres + Prisma | Relational data with schema | Overkill for 8 users, adds 50KB+ to bundle, requires migrations |
| Vercel Postgres + Drizzle | Lightweight SQL ORM | Still overkill, Redis key-value is simpler for this use case |

**When to use Postgres instead:**
- If you need complex relational queries (you don't - RSVPs are simple lookups)
- If you need strict schema enforcement (you don't - 8 users, evolve quickly)
- If you plan to scale to 100+ users (you won't - it's a college suite)

---

## Date/Time Handling

### Recommended: date-fns

| Library | Version | Bundle Size | Purpose |
|---------|---------|-------------|---------|
| date-fns | 2.29.3+ | ~2-5KB (tree-shaken) | Format dates, calculate countdowns, handle timezones |

**Why date-fns over Day.js:**
- **Better tree-shaking:** Import only `formatDistance`, `format` = 2-3KB (Day.js is 6KB minimum)
- **Faster performance:** Works directly with native Date objects, no wrappers
- **Functional API:** `format(date, 'PPP')` vs `dayjs(date).format('PPP')` = cleaner with TypeScript
- **Standard in 2025:** Used by Next.js official examples, React ecosystem default

**Day.js is only better if:**
- Migrating from Moment.js (you're not)
- Need chainable API `dayjs().add(1, 'day').format()` (you don't for simple countdowns)

**Installation:**
```bash
npm install date-fns
```

**Usage Examples:**
```typescript
import { formatDistanceToNow, format, isPast } from 'date-fns'

// Countdown timer
const timeUntilEvent = formatDistanceToNow(eventDate, { addSuffix: true })
// → "in 3 hours"

// Display format
const displayDate = format(eventDate, 'EEEE, MMMM d • h:mm a')
// → "Friday, March 21 • 9:00 PM"

// Check if event passed
const isEventOver = isPast(eventDate)
```

**Confidence:** HIGH (Official docs, verified version)

**Sources:**
- [date-fns Official Docs](https://date-fns.org/)
- [date-fns vs Day.js Comparison](https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries)

---

## Form Handling & Validation

### Recommended Stack

| Library | Version | Purpose | Bundle Impact |
|---------|---------|---------|---------------|
| react-hook-form | 7.71.1+ | Form state management | ~9KB |
| zod | 4.3.6+ | Schema validation (client + server) | ~14KB |
| @hookform/resolvers | Latest | Connect Zod to RHF | ~2KB |

**Why this combination:**
- **React Hook Form:** Industry standard, works seamlessly with Next.js Server Actions
- **Zod:** TypeScript-native validation, same schema for client AND server validation
- **Minimal re-renders:** RHF only re-renders changed fields, critical for mobile performance

**Integration with Next.js Server Actions (2025 pattern):**
```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createEventAction } from './actions'

const eventSchema = z.object({
  title: z.string().min(1, 'Event name required'),
  date: z.string().datetime(),
  location: z.string().optional(),
})

export function EventForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
  })

  const onSubmit = async (data) => {
    await createEventAction(data) // Server Action
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <span>{errors.title.message}</span>}
      {/* ... */}
    </form>
  )
}
```

**Server-side validation (reuse same schema):**
```typescript
'use server'
import { z } from 'zod'

export async function createEventAction(formData: unknown) {
  const parsed = eventSchema.parse(formData) // Throws if invalid
  // Save to Upstash Redis...
}
```

**Confidence:** HIGH (Official releases, verified 2025 patterns)

**Sources:**
- [React Hook Form v7.71.1 Release](https://github.com/react-hook-form/react-hook-form/releases)
- [Zod v4.3.6 Release](https://github.com/colinhacks/zod/releases)
- [React Hook Form + Server Actions 2025 Guide](https://medium.com/@danielmdob/using-next-js-server-actions-with-react-hook-form-4eadbd7f1c67)

**Alternative Considered:** Native HTML5 validation
- **Why not:** No TypeScript safety, harder to customize error messages, can't reuse on server
- **When to use:** For the simplest possible forms (e.g., password-protect page with single input)

---

## UI Components & Dark Mode

### Recommended: shadcn/ui + next-themes

| Library | Version | Purpose | Bundle Impact |
|---------|---------|---------|---------------|
| shadcn/ui | Latest (CLI) | Copy-paste component library | 0KB base (copy what you need) |
| next-themes | 0.4.6+ | Dark mode management | ~2KB |
| Radix UI primitives | Various | Accessible component primitives (auto-installed with shadcn) | ~5-15KB per component |

**Why shadcn/ui for "dark premium" aesthetic:**
- **Not a dependency:** Components are copied to your codebase, you own them
- **Built on Radix UI:** Accessibility (ARIA, keyboard nav) handled automatically
- **Tailwind v4 support:** Fully updated for Tailwind v4 (Jan 2025)
- **React 19 compatible:** forwardRefs removed, types updated for React 19
- **Dark mode by default:** Designed with dark-first theming via CSS variables

**Components you'll need:**
- `button` - For RSVP actions, admin controls
- `card` - For event cards, member grid
- `form` - Pre-integrated with React Hook Form
- `dialog` - For creating/editing events (admin)
- `badge` - For RSVP status indicators (Going/Maybe/Not Going)
- `avatar` - For member photos

**Installation:**
```bash
npx shadcn@latest init
npx shadcn@latest add button card form dialog badge avatar
```

**Dark Mode Setup (2 lines of code):**
```typescript
// app/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

**Dark Premium Color Scheme (Tailwind v4 CSS):**
```css
/* app/globals.css with Tailwind v4 */
@import "tailwindcss";

@theme {
  --color-background: oklch(10% 0.01 300); /* Deep blue-black */
  --color-foreground: oklch(98% 0.01 300); /* Off-white */
  --color-primary: oklch(70% 0.2 280); /* Premium purple */
  --color-accent: oklch(75% 0.15 200); /* Cool cyan */
}
```

**Confidence:** HIGH (Official shadcn/ui docs, verified React 19 + Tailwind v4 support)

**Sources:**
- [shadcn/ui React 19 Support](https://ui.shadcn.com/docs/react-19)
- [shadcn/ui Tailwind v4 Guide](https://ui.shadcn.com/docs/tailwind-v4)
- [next-themes npm package](https://www.npmjs.com/package/next-themes)

**Why NOT other UI libraries:**
- **Material UI (MUI):** 300KB bundle, not dark-first, opinionated design doesn't match "premium"
- **Chakra UI:** Good but heavier, React 19 support unclear
- **Ant Design:** Enterprise aesthetic, too heavy for 8 users

---

## Authentication (Password Protection)

### Recommended: bcryptjs + Next.js Middleware

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| bcryptjs | 2.4.3+ | Password hashing | Pure JavaScript, works in serverless |
| next-auth (NextAuth.js) | ❌ NOT recommended | Full auth system | Overkill for single password protection |

**Why bcryptjs over bcrypt:**
- **Serverless compatible:** Pure JavaScript, no native bindings (bcrypt breaks on Vercel)
- **Zero compilation:** No build-time issues with C++ addons
- **Good enough security:** 10 rounds = secure for 8 users (performance difference negligible)

**Implementation Pattern (Simple Password Protection):**

```typescript
// lib/auth.ts
import bcryptjs from 'bcryptjs'
import { redis } from './redis'

const ADMIN_PASSWORD_HASH = await bcryptjs.hash(
  process.env.ADMIN_PASSWORD!,
  10
)

export async function verifyPassword(password: string): Promise<boolean> {
  return bcryptjs.compare(password, ADMIN_PASSWORD_HASH)
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID()
  await redis.setex(`session:${token}`, 60 * 60 * 24 * 7, userId) // 7 days
  return token
}

export async function validateSession(token: string): Promise<string | null> {
  return redis.get(`session:${token}`)
}
```

```typescript
// middleware.ts (protect /admin routes)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateSession } from './lib/auth'

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const sessionToken = request.cookies.get('session')?.value

    if (!sessionToken || !(await validateSession(sessionToken))) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

**Why NOT NextAuth.js for this project:**
- Designed for OAuth providers (Google, GitHub) - you just need password
- Adds 50KB+ to bundle for features you won't use
- Requires database adapter setup (more complexity)
- Simple middleware + bcryptjs = 20 lines of code vs 200+ with NextAuth

**When to use NextAuth.js instead:**
- If you want "Sign in with Google" (you don't for private suite)
- If you have 50+ users with different roles (you have 8)
- If you need magic links, 2FA, etc. (you don't)

**Confidence:** HIGH (Verified serverless compatibility, standard 2025 pattern)

**Sources:**
- [bcrypt vs bcryptjs in Next.js](https://medium.com/@abdulakeemabdulafeez/bcrypt-vs-bcryptjs-the-developer-myth-i-finally-stopped-believing-c7dd54d76496)
- [Next.js Authentication Guide](https://nextjs.org/docs/pages/building-your-application/authentication)
- [Vercel Basic Auth Template](https://vercel.com/templates/next.js/basic-auth-password)

---

## Supporting Libraries

### Essential

| Library | Version | Purpose | Bundle Size |
|---------|---------|---------|-------------|
| clsx | 2.1.0+ | Conditional className utility | ~1KB |
| tailwind-merge | 2.5.0+ | Merge Tailwind classes without conflicts | ~3KB |

**Why these two together:**
```typescript
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<button className={cn(
  "bg-primary text-white",
  isLoading && "opacity-50 cursor-wait"
)} />
```

### Optional (Add if needed)

| Library | Purpose | When to Add |
|---------|---------|-------------|
| @upstash/ratelimit | Rate limiting API endpoints | If adding public RSVP links (not in MVP) |
| nuqs | Type-safe URL search params | If adding filters/sorting to events page |
| react-hot-toast | Toast notifications | For success/error feedback on actions |

---

## Installation Commands

**Initial Setup:**
```bash
# Create Next.js 16 project with Tailwind v4
npx create-next-app@latest e23site --typescript --tailwind --app --turbopack

# Core dependencies
npm install @upstash/redis date-fns react-hook-form zod @hookform/resolvers bcryptjs
npm install --save-dev @types/bcryptjs

# UI components (initialize shadcn, then add components as needed)
npx shadcn@latest init
npx shadcn@latest add button card form dialog badge avatar

# Dark mode
npm install next-themes
```

**Total bundle impact (estimated):**
- Core framework (Next.js + React + Tailwind): ~100KB
- Added libraries: ~35KB
- shadcn/ui components (6 components): ~30KB
- **Total added weight: ~65KB** (tiny for modern web)

---

## What NOT to Use (Common Over-Engineering Mistakes)

### ❌ Prisma or Drizzle ORM
**Why not:** Your data model is 3 entities (events, RSVPs, members). Redis key-value with TypeScript types is simpler than running migrations and managing schema files. ORMs add 50-100KB and cognitive overhead.

**When to add:** If you grow to 10+ entities with complex relations. You won't.

### ❌ TanStack Query (React Query)
**Why not:** Next.js Server Components + Server Actions handle data fetching. React Query is for client-side cache management, which you don't need when the server handles it.

**When to add:** If you build a real-time feature with polling/websockets. Not in your roadmap.

### ❌ Redux, Zustand, or other state management
**Why not:** React Context + URL state (nuqs) covers your needs. You have 8 users and simple UI state (is modal open? which event is selected?). Global state libs are for complex apps.

**When to add:** Never for this project.

### ❌ Separate API routes
**Why not:** Next.js Server Actions replace 90% of API routes. `createEventAction()` is simpler than `/api/events POST`.

**When to use:** If you need webhooks or external API access. You don't.

### ❌ Storybook
**Why not:** 8 users, 5 pages, rapid iteration. Storybook is for design systems at scale.

**When to add:** When you have 50+ reusable components. You'll have ~10.

### ❌ Full-text search (Algolia, Typesense)
**Why not:** You have <50 events/year. Filter with JavaScript `events.filter(e => e.title.includes(query))`.

**When to add:** At 1000+ events. You'll never hit that.

---

## Architecture Decision Records

### ADR-001: Redis over Postgres
**Decision:** Use Upstash Redis for all data storage instead of Vercel Postgres + ORM.

**Rationale:**
- 8 users = <1000 events total over 4 years of college
- Event/RSVP data is simple key-value (no complex joins needed)
- Redis free tier (500K commands/mo) covers ~16K events/month = 500 events/day (you'll create ~2/week)
- No migration complexity (schema changes = change TypeScript types)
- Faster for reads (countdown timers check event date frequently)

**Tradeoffs:**
- No complex SQL queries (but you don't need them)
- No schema enforcement (but TypeScript types + Zod validation cover this)
- If you eventually need relations, migration to Postgres is possible (but unlikely)

**Confidence:** HIGH - Right tool for scale and use case.

### ADR-002: date-fns over Day.js
**Decision:** Use date-fns for date formatting and countdown timers.

**Rationale:**
- Better tree-shaking (2-3KB vs 6KB minimum) = faster mobile load
- Functional API matches Next.js/React patterns better than Day.js chainable API
- Standard in 2025 React ecosystem (Next.js examples use date-fns)
- Performance advantage (native Date objects, no wrappers)

**Tradeoffs:**
- Day.js has simpler API for Moment.js migrants (but you're not migrating from Moment)
- Day.js plugins for advanced features (but you only need basic formatting/countdown)

**Confidence:** HIGH - Performance + ecosystem alignment.

### ADR-003: Simple password auth over NextAuth.js
**Decision:** Use bcryptjs + middleware for admin password protection instead of NextAuth.js.

**Rationale:**
- Single shared password for 8 suite members (no individual accounts needed)
- NextAuth.js is 50KB+ for OAuth/magic links you won't use
- Simple middleware = 20 lines of code vs 200+ lines of NextAuth config
- Easier to understand and debug for small team

**Tradeoffs:**
- No "Sign in with Google" (but you don't want it - private suite only)
- Manual session management (but it's 3 functions: create, validate, destroy)
- No built-in CSRF protection (but Next.js Server Actions have CSRF protection built-in)

**When to revisit:** If you decide each member needs individual accounts. Unlikely for college suite.

**Confidence:** HIGH - Right complexity level for use case.

### ADR-004: shadcn/ui over component libraries
**Decision:** Use shadcn/ui (copy-paste components) instead of MUI, Chakra, or Ant Design.

**Rationale:**
- Components live in your codebase = full customization for "dark premium" aesthetic
- Zero KB library dependency (only bring in what you use)
- Built on Radix UI = accessibility without effort
- Tailwind v4 + React 19 compatible (updated Jan 2025)

**Tradeoffs:**
- More components to copy vs single `import { Button } from 'lib'` (but you need <10 components)
- Components need individual updates (but shadcn CLI handles this)

**Confidence:** HIGH - Industry standard for custom-designed apps in 2025.

---

## Version Lock Recommendations

For a college project with 8 users, **version locking is LOW priority**, but here's what to lock if you want stability:

**Lock these (breaking changes likely):**
- Tailwind CSS: `^4.0.0` (v5 may have breaking changes)
- React: `^19.2.0` (v20 will be major rewrite)
- Next.js: `^16.1.0` (v17 will have app router changes)

**Keep updated (patch versions safe):**
- Upstash Redis SDK (bug fixes, performance)
- Zod (validation improvements)
- React Hook Form (performance patches)

**Don't lock:**
- date-fns (mature, stable API)
- bcryptjs (hasn't changed in years)

---

## Deployment Checklist

**Environment variables needed:**
```env
# Upstash Redis (from Vercel Marketplace)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# Admin password (set in Vercel dashboard)
ADMIN_PASSWORD=your-secure-password

# Next.js
NEXT_PUBLIC_SITE_URL=https://e23suite.vercel.app
```

**Vercel configuration:**
```json
// vercel.json (optional, defaults work)
{
  "framework": "nextjs",
  "buildCommand": "next build",
  "devCommand": "next dev --turbopack",
  "installCommand": "npm install"
}
```

**Performance targets for 8 users:**
- Lighthouse score: 95+ (with Turbopack + Tailwind v4, easily achievable)
- First Contentful Paint: <1s (Server Components prerender)
- Time to Interactive: <2s (minimal JavaScript with RSC)

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Core framework (Next.js 16, React 19, Tailwind v4) | HIGH | Official releases verified, stable LTS versions |
| Data storage (Upstash Redis) | HIGH | Official docs, Vercel marketplace integration verified |
| Date handling (date-fns) | HIGH | Current version verified, ecosystem standard |
| Forms (React Hook Form + Zod) | HIGH | Latest versions verified, 2025 patterns documented |
| UI components (shadcn/ui) | HIGH | React 19 + Tailwind v4 support verified |
| Authentication (bcryptjs + middleware) | HIGH | Serverless compatibility verified, standard pattern |
| Bundle size estimates | MEDIUM | Based on bundlephobia data, actual size varies with usage |

---

## Migration Path (Future-Proofing)

If the suite grows beyond 8 users or you build additional features:

**10-50 users:**
- Keep Redis (still appropriate)
- Consider individual user accounts (add NextAuth.js at that point)
- Add rate limiting with @upstash/ratelimit

**50-200 users:**
- Migrate to Vercel Postgres + Prisma for better querying
- Add caching layer (keep Redis for sessions/cache, Postgres for source of truth)
- Consider upgrading Vercel plan (Hobby → Pro)

**200+ users:**
- This won't happen for a college suite, but if it did:
- Move to dedicated database (not serverless Postgres)
- Add CDN for static assets
- Implement proper monitoring (Sentry, etc.)

**For this project, you will never exceed 8 users. Don't optimize for scale you won't reach.**

---

## Sources

**Framework Versions:**
- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [React 19 Stable](https://react.dev/blog/2024/12/05/react-19)
- [Tailwind CSS v4.0](https://tailwindcss.com/blog/tailwindcss-v4)

**Data Storage:**
- [Vercel Storage Overview](https://vercel.com/docs/storage)
- [Upstash Redis Documentation](https://upstash.com/docs/redis/sdks/ts/getstarted)
- [Upstash Pricing](https://upstash.com/docs/redis/overall/pricing)

**Libraries:**
- [date-fns vs Day.js](https://www.dhiwise.com/post/date-fns-vs-dayjs-the-battle-of-javascript-date-libraries)
- [React Hook Form GitHub](https://github.com/react-hook-form/react-hook-form/releases)
- [Zod GitHub](https://github.com/colinhacks/zod/releases)

**UI & Auth:**
- [shadcn/ui React 19](https://ui.shadcn.com/docs/react-19)
- [next-themes npm](https://www.npmjs.com/package/next-themes)
- [bcrypt vs bcryptjs](https://medium.com/@abdulakeemabdulafeez/bcrypt-vs-bcryptjs-the-developer-myth-i-finally-stopped-believing-c7dd54d76496)
- [Next.js Authentication](https://nextjs.org/docs/pages/building-your-application/authentication)

**Patterns:**
- [React Hook Form + Server Actions](https://medium.com/@danielmdob/using-next-js-server-actions-with-react-hook-form-4eadbd7f1c67)
- [Zod + React Hook Form](https://medium.com/@techwithtwin/handling-forms-in-next-js-with-react-hook-form-zod-and-server-actions-e148d4dc6dc1)
