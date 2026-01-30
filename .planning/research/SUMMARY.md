# Stack Research Summary: E23 Suite Website

**Project:** E23 Suite Website (8-person college suite hub)
**Research Dimension:** Technology Stack
**Researched:** 2026-01-30
**Overall Confidence:** HIGH

---

## Executive Summary

For an 8-person private event coordination site, the 2025 Next.js stack prioritizes **simplicity over scalability**. The core principle: leverage Vercel's serverless ecosystem and avoid enterprise tooling designed for 10,000+ users.

**Key insight:** Vercel KV was sunset in 2025, requiring alternative key-value storage. Upstash Redis (the original technology behind Vercel KV) is the direct replacement with generous free tier (500K commands/month = sufficient for years of usage by 8 users).

**Tech philosophy:**
1. **Managed services > Self-hosted** (Upstash Redis, not self-managed)
2. **Zero-config > Configuration** (bcryptjs not bcrypt, shadcn/ui not MUI)
3. **Server Actions > API routes** (Next.js 16 built-in patterns)
4. **TypeScript types > Database schemas** (Redis + Zod, not Prisma ORM)

---

## Critical Stack Decisions

### ✅ Confirmed Choices (Already Decided)

| Technology | Version | Status | Notes |
|------------|---------|--------|-------|
| Next.js | 16.1+ | ✅ LTS | Stable Turbopack (Oct 2025), 5-100x faster builds |
| React | 19.2+ | ✅ Stable | Server Components stable (Dec 2024) |
| Tailwind CSS | 4.0+ | ✅ Latest | Oxide engine (Jan 2025), sub-second builds |
| Vercel | Latest | ✅ Hosting | Zero DevOps for small team |

**Confidence:** HIGH (all official stable releases)

---

### 🔑 Key Recommendations (New Findings)

#### 1. Data Storage: Upstash Redis (HIGH priority)

**Recommendation:** `@upstash/redis` v1.36.1+

**Why:**
- Vercel KV was discontinued in 2025 → Upstash is direct replacement
- Free tier: 256MB storage, 500K commands/month (enough for ~16K events/month at 8 users creating ~2 events/week)
- Serverless-first HTTP API (no connection pooling issues)
- Simple key-value model perfect for events/RSVPs (no complex relations)

**Alternative considered:** Vercel Postgres + Prisma
- **Why not:** Overkill for 3 entities (events, RSVPs, members), adds 50KB+ bundle, requires migrations

**Data model:**
```typescript
event:{id} → { title, date, location, description }
rsvp:{eventId}:{userId} → "going" | "maybe" | "not_going"
member:{id} → { name, avatar, role }
session:{token} → { userId, expiresAt }
```

**Confidence:** HIGH

---

#### 2. Date/Time: date-fns (MEDIUM priority)

**Recommendation:** `date-fns` v2.29.3+

**Why:**
- Better tree-shaking than Day.js (2-3KB vs 6KB)
- Functional API fits Next.js patterns (`format(date, 'PPP')`)
- Standard in 2025 React ecosystem

**Usage:**
```typescript
import { formatDistanceToNow, format } from 'date-fns'

// Countdown: "in 3 hours"
formatDistanceToNow(eventDate, { addSuffix: true })

// Display: "Friday, March 21 • 9:00 PM"
format(eventDate, 'EEEE, MMMM d • h:mm a')
```

**Confidence:** HIGH

---

#### 3. Forms: React Hook Form + Zod (HIGH priority)

**Recommendation:**
- `react-hook-form` v7.71.1+
- `zod` v4.3.6+
- `@hookform/resolvers` latest

**Why:**
- Industry standard for Next.js 16 + Server Actions
- TypeScript-native validation, same schema for client + server
- Minimal re-renders (critical for mobile)

**2025 Pattern:**
```typescript
// Shared schema
const eventSchema = z.object({
  title: z.string().min(1),
  date: z.string().datetime(),
})

// Client: React Hook Form
const { register, handleSubmit } = useForm({
  resolver: zodResolver(eventSchema)
})

// Server: Reuse validation
export async function createEventAction(formData: unknown) {
  const parsed = eventSchema.parse(formData)
  await redis.set(`event:${id}`, parsed)
}
```

**Confidence:** HIGH

---

#### 4. UI Components: shadcn/ui + next-themes (HIGH priority)

**Recommendation:**
- `shadcn/ui` (CLI-based, latest)
- `next-themes` v0.4.6+

**Why:**
- Copy-paste components (0KB dependency, full customization for "dark premium" look)
- Built on Radix UI (accessibility handled)
- React 19 + Tailwind v4 compatible (updated Jan 2025)
- Dark mode in 2 lines: `<ThemeProvider attribute="class" defaultTheme="dark">`

**Components needed:** button, card, form, dialog, badge, avatar (~30KB total)

**Confidence:** HIGH

---

#### 5. Authentication: bcryptjs + Middleware (MEDIUM priority)

**Recommendation:** `bcryptjs` v2.4.3+ (NOT NextAuth.js)

**Why:**
- Single shared password for 8 suite members (no individual accounts)
- Pure JavaScript (serverless-compatible, bcrypt breaks on Vercel)
- Simple: 20 lines vs 200+ with NextAuth.js

**Pattern:**
```typescript
// lib/auth.ts - password hashing
bcryptjs.hash(password, 10)
bcryptjs.compare(input, hash)

// middleware.ts - protect /admin
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const session = await validateSession(request.cookies.get('session'))
    if (!session) return NextResponse.redirect('/login')
  }
}
```

**When NextAuth.js would be better:** If you need OAuth (Google/GitHub login) or individual user accounts. You don't.

**Confidence:** HIGH

---

## Bundle Impact Analysis

| Category | Libraries | Estimated Size |
|----------|-----------|----------------|
| Core framework | Next.js 16 + React 19 + Tailwind v4 | ~100KB |
| Data & validation | Upstash Redis + date-fns + RHF + Zod | ~35KB |
| UI components | shadcn/ui (6 components) + next-themes | ~30KB |
| Authentication | bcryptjs | ~5KB |
| **Total added** | | **~70KB** |

**For 8 users on mobile:** 70KB is negligible. Modern images are larger. Prioritize simplicity over micro-optimizations.

---

## What NOT to Use (Over-Engineering Traps)

### ❌ Prisma or Drizzle ORM
**Why not:** 3 entities with no complex relations. Redis + TypeScript types + Zod validation is simpler than migrations.
**When to add:** If you hit 10+ entities with JOINs. You won't.

### ❌ TanStack Query (React Query)
**Why not:** Next.js Server Components + Server Actions handle data fetching. React Query is for complex client-side cache management.
**When to add:** If you build real-time features with polling. Not in roadmap.

### ❌ Redux, Zustand, Jotai
**Why not:** React Context + URL state covers your needs. 8 users, simple UI state.
**When to add:** Never for this project.

### ❌ NextAuth.js
**Why not:** Designed for OAuth and individual user accounts. You need shared password protection.
**When to add:** If each member needs separate accounts (unlikely for college suite).

### ❌ Separate API routes (`/api/*`)
**Why not:** Next.js Server Actions replace 90% of API routes. `createEventAction()` is simpler.
**When to use:** If you need webhooks or external API access. You don't.

---

## Critical Finding: Vercel KV Sunset

**⚠️ Important for roadmap:**

The project context mentioned "considering Vercel KV" for data storage. **Vercel KV was discontinued in 2025** and transitioned to Vercel Marketplace.

**Impact on roadmap:**
- Don't reference "Vercel KV" in implementation plans
- Use "Upstash Redis via Vercel Marketplace" instead
- Setup: Vercel dashboard → Storage tab → Add Upstash (automatic provisioning)

**Sources:**
- [Vercel Storage Docs](https://vercel.com/docs/storage)
- [Vercel KV Sunset Discussion](https://github.com/vercel/storage/issues/829)

---

## Installation Summary

```bash
# Core dependencies
npm install @upstash/redis date-fns react-hook-form zod @hookform/resolvers bcryptjs
npm install --save-dev @types/bcryptjs

# UI components (initialize shadcn, then add as needed)
npx shadcn@latest init
npx shadcn@latest add button card form dialog badge avatar

# Dark mode
npm install next-themes
```

**Total commands:** 3 (npm installs can be combined)
**Setup time:** ~5 minutes

---

## Confidence Assessment

| Category | Confidence | Rationale |
|----------|------------|-----------|
| Core framework | HIGH | Official stable releases verified (Next.js 16, React 19, Tailwind v4) |
| Data storage | HIGH | Upstash official docs, Vercel marketplace integration confirmed |
| Date handling | HIGH | date-fns current version verified, ecosystem standard |
| Forms | HIGH | React Hook Form v7.71.1 + Zod v4.3.6 verified, 2025 patterns documented |
| UI components | HIGH | shadcn/ui React 19 + Tailwind v4 support verified (Jan 2025) |
| Authentication | HIGH | bcryptjs serverless compatibility verified, standard Next.js pattern |
| Bundle estimates | MEDIUM | Based on bundlephobia, actual size varies with tree-shaking |

**Overall:** All critical stack decisions are HIGH confidence with verified current versions.

---

## Implications for Roadmap Creation

### Phase Structure Recommendations

**Phase 1: Foundation (Core Stack Setup)**
- Next.js 16 + Tailwind v4 project structure ✅ (already done)
- Upstash Redis setup via Vercel Marketplace
- Dark mode with next-themes + shadcn/ui theming
- Basic UI components (button, card)

**Phase 2: Event Management**
- Form handling (React Hook Form + Zod)
- Event CRUD with Server Actions
- date-fns for countdown timers and formatting
- shadcn/ui form components

**Phase 3: RSVP System**
- RSVP state management in Redis
- Real-time status updates
- Badge components for status display

**Phase 4: Admin Interface**
- Password protection (bcryptjs + middleware)
- Admin-only event creation/editing
- Session management

**Phase 5: Polish**
- Member grid with avatars
- "Tonight" widget on landing page
- Mobile-first responsive design

### Research Needs Per Phase

| Phase | Likely Needs Deeper Research? | Rationale |
|-------|-------------------------------|-----------|
| Phase 1 | ❌ No | Standard Next.js setup, shadcn/ui well-documented |
| Phase 2 | ⚠️ Maybe | Countdown timer edge cases (timezone handling, "tonight" logic) |
| Phase 3 | ❌ No | Redis key-value for RSVPs is straightforward |
| Phase 4 | ⚠️ Maybe | Session management patterns (expiry, refresh) |
| Phase 5 | ❌ No | Standard responsive design with Tailwind |

**Phases 2 and 4 may benefit from focused research when implemented.**

---

## Open Questions (For Phase-Specific Research)

These questions were out of scope for stack research but should be addressed during implementation:

1. **"Tonight" logic:** How to define "tonight"? (6pm-2am? User timezone? Suite-wide timezone?)
2. **RSVP deadline:** Should events lock RSVPs after they start? 1 hour before?
3. **Member photos:** Upload to Vercel Blob? Hardcode URLs? Gravatar?
4. **Event recurrence:** Do you need "every Friday at 9pm"? (Assumption: No, manual creation is fine)
5. **Notifications:** Push notifications when new event? (Assumption: No, check website)

**Recommendation:** Start with simplest assumptions (tonight = 6pm-2am, no RSVP deadline, hardcoded avatar URLs, no recurrence, no notifications). Add complexity only if users request it.

---

## Migration Path (Future-Proofing)

If the project outlives college or grows beyond 8 users:

**10-50 users:**
- Keep Redis (still appropriate)
- Add individual user accounts (migrate to NextAuth.js)
- Add rate limiting (@upstash/ratelimit)

**50-200 users:**
- Migrate to Postgres + Prisma for better querying
- Keep Redis for sessions/cache
- Upgrade Vercel plan (Hobby → Pro)

**Reality check:** This is a college suite for 4 years max. You will never need to scale beyond 8 users. **Don't optimize for scale you won't reach.**

---

## Sources

**Framework:**
- [Next.js 16 Release](https://nextjs.org/blog/next-16)
- [React 19 Stable](https://react.dev/blog/2024/12/05/react-19)
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4)

**Data Storage:**
- [Vercel Storage](https://vercel.com/docs/storage)
- [Upstash Redis Docs](https://upstash.com/docs/redis/sdks/ts/getstarted)
- [Upstash Pricing](https://upstash.com/docs/redis/overall/pricing)

**Libraries:**
- [date-fns docs](https://date-fns.org/)
- [React Hook Form releases](https://github.com/react-hook-form/react-hook-form/releases)
- [Zod releases](https://github.com/colinhacks/zod/releases)
- [shadcn/ui React 19](https://ui.shadcn.com/docs/react-19)
- [next-themes npm](https://www.npmjs.com/package/next-themes)
- [bcrypt vs bcryptjs](https://medium.com/@abdulakeemabdulafeez/bcrypt-vs-bcryptjs-the-developer-myth-i-finally-stopped-believing-c7dd54d76496)

---

## Files Created

| File | Purpose |
|------|---------|
| `.planning/research/STACK.md` | Comprehensive stack recommendations with versions, rationale, code examples, and architecture decisions |
| `.planning/research/SUMMARY.md` | This executive summary for roadmap creation |

---

## Ready for Roadmap Creation

**Stack research is complete.** All critical technology decisions are documented with:
- ✅ Current verified versions (2025/2026)
- ✅ Clear rationale for each choice
- ✅ Code examples and patterns
- ✅ What NOT to use (avoid over-engineering)
- ✅ Bundle impact analysis
- ✅ Phase-by-phase implications

**Next step:** Roadmap creator can structure phases based on:
1. Foundation dependencies (Phase 1: Redis setup, UI components)
2. Feature complexity (Phase 2: Forms before Phase 3: RSVPs)
3. Risk areas flagged (Phases 2 & 4 may need deeper research)

**Confidence:** HIGH - Ready to proceed to roadmap creation.
