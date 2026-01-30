# Architecture Patterns: Next.js Event Coordination Site

**Domain:** Event coordination hub for small group
**Researched:** 2026-01-30
**Confidence:** HIGH (verified with official Next.js docs and current 2026 patterns)

## Recommended Architecture

Next.js App Router with server-first architecture, client islands for interactivity, and clear component boundaries between static content and user interactions.

```
app/
├── layout.tsx                    # Root layout (Server Component)
├── page.tsx                      # Landing page (Server Component)
├── (public)/                     # Route group: public-facing pages
│   ├── events/
│   │   └── page.tsx              # Events list (Server Component)
│   └── layout.tsx                # Shared header/nav for public pages
├── (admin)/                      # Route group: admin section
│   ├── admin/
│   │   └── page.tsx              # Admin dashboard (Server Component)
│   └── layout.tsx                # Admin-specific layout with auth check
└── api/
    └── events/
        └── route.ts              # API route for event mutations

components/
├── ui/                           # Shared UI components
│   ├── hero.tsx                  # Server Component
│   ├── tonight-widget.tsx        # Hybrid: Server wrapper + Client countdown
│   ├── member-grid.tsx           # Server Component
│   └── event-card.tsx            # Hybrid: Server wrapper + Client RSVP
└── client/                       # Pure client components
    ├── rsvp-button.tsx           # Client Component (interactivity)
    ├── countdown-timer.tsx       # Client Component (real-time updates)
    └── event-form.tsx            # Client Component (admin forms)

lib/
├── events.ts                     # Server-side data layer (fetch from storage)
├── rsvp.ts                       # Client-side RSVP logic (localStorage)
└── utils.ts                      # Shared utilities
```

### Component Boundaries

| Component | Type | Responsibility | Communicates With |
|-----------|------|----------------|-------------------|
| **Root Layout** | Server | HTML shell, global styles, metadata | All pages |
| **Route Group Layouts** | Server | Shared navigation, section-specific UI | Pages in group |
| **Landing Page** | Server | Fetch events, render static hero/members | Tonight Widget, Member Grid |
| **Events Page** | Server | Fetch all events, render list | Event Cards |
| **Event Card** | Hybrid | Render event data (server) + RSVP UI (client) | RSVP Button |
| **Tonight Widget** | Hybrid | Render event data (server) + countdown (client) | Countdown Timer |
| **RSVP Button** | Client | Handle RSVP clicks, localStorage updates | Event Card |
| **Countdown Timer** | Client | Real-time countdown display | Tonight Widget, Event Card |
| **Admin Form** | Client | Form input, validation, submission | API Route |
| **API Route** | Server | Mutate event data in storage | Admin Form |

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ SERVER COMPONENTS (Data Fetching Layer)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Page (Server) → Fetch from Storage → Pass data as props    │
│       ↓                                                      │
│  Component (Server) → Render static UI                      │
│       ↓                                                      │
│  Pass data to Client Component via props                    │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ CLIENT COMPONENTS (Interactivity Layer)                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Receive props → useState/useEffect → Render interactive UI │
│       ↓                                                      │
│  User interaction (click, input)                            │
│       ↓                                                      │
│  Update localStorage (RSVPs) OR call Server Action (events) │
│       ↓                                                      │
│  Optimistic UI update → Revalidate on server response       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Event Data Flow:**
1. **Read:** Page (Server) → Fetch from storage API → Render with data → Pass to components
2. **Write (Admin):** Form (Client) → Server Action → Update storage → Revalidate cache → Re-render pages
3. **RSVP:** Button (Client) → Update localStorage → Re-render component (no server round-trip)

**Storage Layer Split:**
- **Events:** Server-side storage (Upstash Redis, Supabase, or file-based JSON)
- **RSVPs:** Client-side localStorage (per-browser, no persistence needed across devices)

## Patterns to Follow

### Pattern 1: Server Component Wrapper with Client Island
**What:** Fetch data in Server Component, pass to Client Component as props
**When:** Need both data fetching and interactivity (RSVP, countdown timer)
**Example:**
```typescript
// components/ui/event-card.tsx (Server Component)
import { getEvent } from '@/lib/events'
import RSVPButton from '@/components/client/rsvp-button'

export default async function EventCard({ eventId }: { eventId: string }) {
  const event = await getEvent(eventId) // Server-side fetch

  return (
    <div className="event-card">
      <h3>{event.title}</h3>
      <p>{event.date}</p>
      {/* Pass data to Client Component */}
      <RSVPButton eventId={event.id} initialRsvp={null} />
    </div>
  )
}
```

```typescript
// components/client/rsvp-button.tsx (Client Component)
'use client'
import { useState, useEffect } from 'react'

export default function RSVPButton({ eventId }: { eventId: string }) {
  const [rsvp, setRsvp] = useState<'going' | 'maybe' | 'not-going' | null>(null)

  // Hydrate from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem(`rsvp-${eventId}`)
    if (stored) setRsvp(stored as any)
  }, [eventId])

  const handleRsvp = (status: string) => {
    setRsvp(status as any)
    localStorage.setItem(`rsvp-${eventId}`, status)
  }

  return (
    <div>
      <button onClick={() => handleRsvp('going')}>Going</button>
      <button onClick={() => handleRsvp('maybe')}>Maybe</button>
      <button onClick={() => handleRsvp('not-going')}>Not Going</button>
    </div>
  )
}
```

**Why this works:**
- Server Component fetches data securely (no API keys exposed)
- Client Component handles interactivity (localStorage access)
- Data passed via props, no prop drilling
- Client bundle only includes interactive code

### Pattern 2: Route Groups for Layout Separation
**What:** Organize routes by section without affecting URLs
**When:** Different sections need different layouts (public vs admin)
**Example:**
```typescript
// app/(public)/layout.tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <a href="/">Home</a>
        <a href="/events">Events</a>
      </nav>
      {children}
    </>
  )
}

// app/(admin)/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav>
        <a href="/admin">Dashboard</a>
        <a href="/">Back to Site</a>
      </nav>
      {children}
    </>
  )
}
```

**Why this works:**
- `/events` stays as `/events` (no `/public/events`)
- Each section has isolated layout
- Navigation between route groups triggers full page reload (acceptable for admin)
- No layout conflicts or shared state issues

### Pattern 3: Server Actions for Form Mutations
**What:** Use Server Actions for form submissions instead of API routes
**When:** Admin forms, event creation/editing
**Example:**
```typescript
// app/(admin)/admin/actions.ts
'use server'
import { revalidatePath } from 'next/cache'
import { createEvent } from '@/lib/events'

export async function addEvent(formData: FormData) {
  const title = formData.get('title') as string
  const date = formData.get('date') as string

  await createEvent({ title, date })

  // Revalidate pages that show events
  revalidatePath('/')
  revalidatePath('/events')
}
```

```typescript
// components/client/event-form.tsx
'use client'
import { useActionState } from 'react'
import { addEvent } from '@/app/(admin)/admin/actions'

export default function EventForm() {
  const [state, formAction, pending] = useActionState(addEvent, null)

  return (
    <form action={formAction}>
      <input name="title" required />
      <input name="date" type="datetime-local" required />
      <button type="submit" disabled={pending}>
        {pending ? 'Adding...' : 'Add Event'}
      </button>
    </form>
  )
}
```

**Why this works:**
- No separate API route needed
- Automatic revalidation with `revalidatePath()`
- Progressive enhancement (works without JS)
- Loading states with `useActionState`

### Pattern 4: localStorage with SSR Hydration
**What:** Safely access localStorage in Client Components
**When:** Browser-only state (RSVP, user preferences)
**Example:**
```typescript
'use client'
import { useState, useEffect } from 'react'

export default function RSVPStatus({ eventId }: { eventId: string }) {
  const [mounted, setMounted] = useState(false)
  const [rsvp, setRsvp] = useState<string | null>(null)

  // Wait for client-side mount before accessing localStorage
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(`rsvp-${eventId}`)
    setRsvp(stored)
  }, [eventId])

  // Prevent hydration mismatch
  if (!mounted) return null

  return <div>Your RSVP: {rsvp || 'Not set'}</div>
}
```

**Why this works:**
- Avoids hydration errors (server/client HTML mismatch)
- `mounted` flag prevents rendering until client-side
- localStorage only accessed in browser
- Returns `null` during SSR (no flash of incorrect content)

### Pattern 5: Parallel Data Fetching
**What:** Fetch multiple data sources simultaneously in Server Components
**When:** Page needs data from multiple sources (events, members)
**Example:**
```typescript
// app/page.tsx
import { getUpcomingEvents, getMembers } from '@/lib/events'

export default async function HomePage() {
  // Fetch in parallel
  const [events, members] = await Promise.all([
    getUpcomingEvents(),
    getMembers(),
  ])

  return (
    <>
      <TonightWidget event={events[0]} />
      <MemberGrid members={members} />
    </>
  )
}
```

**Why this works:**
- No waterfall (sequential fetching)
- Reduces total load time
- Server Components make this pattern simple
- No need for `useEffect` chains

## Anti-Patterns to Avoid

### Anti-Pattern 1: Marking Everything as Client Component
**What:** Adding `'use client'` to components that don't need interactivity
**Why bad:**
- Increases JavaScript bundle size
- Loses benefits of server rendering
- Can't access server-only APIs (databases, secrets)
**Instead:**
- Default to Server Components
- Only add `'use client'` to components with hooks, event handlers, or browser APIs
- Use composition pattern to nest Server Components inside Client Components via `children` prop

### Anti-Pattern 2: Fetching in Client Components with useEffect
**What:** Using `useEffect` to fetch data in Client Components
**Why bad:**
- Causes loading waterfalls (wait for JS → mount → fetch → render)
- Requires loading states, error handling in every component
- Can't be cached by Next.js
**Instead:**
- Fetch in Server Components with `async/await`
- Pass data as props to Client Components
- Use Server Actions for mutations

### Anti-Pattern 3: Creating API Routes for Everything
**What:** Using Route Handlers (`app/api/*/route.ts`) for all data operations
**Why bad:**
- Extra network round-trip
- More boilerplate (create route, fetch from component)
- Harder to type-check
**Instead:**
- Fetch directly in Server Components
- Use Server Actions for mutations
- Only use Route Handlers for webhooks, third-party integrations, or non-React clients

### Anti-Pattern 4: Storing Sensitive Data in localStorage
**What:** Saving API keys, tokens, or passwords in localStorage
**Why bad:**
- localStorage is not encrypted
- Accessible to any script (XSS vulnerability)
- Not suitable for secure data
**Instead:**
- Use httpOnly cookies for authentication tokens
- Keep secrets in environment variables on server
- Use localStorage only for non-sensitive, per-browser preferences

### Anti-Pattern 5: Multiple Root Layouts for Same URL Structure
**What:** Creating route groups with different root layouts but overlapping URLs
**Why bad:**
- Full page reload on navigation between groups
- Can cause routing conflicts (`/about` in multiple groups)
- Confusing user experience
**Instead:**
- Use route groups only for truly separate sections (public vs admin)
- Share layouts for related pages
- If navigation between sections is common, use single root layout

### Anti-Pattern 6: Prop Drilling Through Multiple Layers
**What:** Passing props through many components to reach deeply nested children
**Why bad:**
- Hard to maintain as component tree grows
- Tightly couples components
- Makes refactoring difficult
**Instead:**
- Use React Context for truly global state (theme, auth)
- Use composition pattern: pass components as `children` props
- Fetch data where it's needed (Server Components)

## Server vs Client Component Decision Tree

```
┌─────────────────────────────────────┐
│ Does component need interactivity?  │
│ (onClick, onChange, useState, etc.) │
└────────────┬───────────┬────────────┘
             │           │
            YES         NO
             │           │
             ↓           ↓
    ┌────────────┐  ┌─────────────┐
    │   CLIENT   │  │   SERVER    │
    │ COMPONENT  │  │  COMPONENT  │
    └────────────┘  └─────────────┘
         │               │
         ↓               ↓
    'use client'    (default)
         │               │
         ↓               ↓
    Can use:        Can use:
    - useState      - async/await
    - useEffect     - fetch/DB
    - onClick       - secrets
    - localStorage  - server APIs
    - browser APIs  - streaming
```

### Component Type Guide

| Need | Component Type | Example |
|------|---------------|---------|
| **Static content** | Server | Hero, member cards, event list |
| **Data fetching** | Server | Pages, layouts |
| **User input** | Client | Forms, RSVP buttons |
| **Real-time updates** | Client | Countdown timer, live RSVP count |
| **Browser APIs** | Client | localStorage, geolocation, window |
| **Animations** | Client | Hover effects, transitions |
| **Hybrid (static + interactive)** | Both | Event card (server wrapper + client RSVP) |

## Build Order for E23 Suite Website

### Phase 1: Foundation (Server Components)
**Goal:** Set up routing, layouts, and static content
**Components:**
1. Root layout (`app/layout.tsx`)
2. Route groups (`(public)/`, `(admin)/`)
3. Landing page skeleton (`app/page.tsx`)
4. Events page skeleton (`app/(public)/events/page.tsx`)

**Why first:**
- Establishes navigation structure
- No dependencies on data layer yet
- Can verify routing and layouts work

### Phase 2: Data Layer (Server-Side)
**Goal:** Set up event storage and fetching
**Components:**
1. Storage integration (Upstash/Supabase or JSON files)
2. Data fetching functions (`lib/events.ts`)
3. Environment variables and configuration
4. Seed data for development

**Why second:**
- Server Components need data source
- Can test data fetching independently
- Enables rendering with real data

### Phase 3: Static UI (Server Components)
**Goal:** Build non-interactive visual components
**Components:**
1. Hero section (`components/ui/hero.tsx`)
2. Member grid (`components/ui/member-grid.tsx`)
3. Event card wrapper (`components/ui/event-card.tsx`)
4. Tonight widget wrapper (`components/ui/tonight-widget.tsx`)

**Why third:**
- Can render with fetched data
- No client-side dependencies
- Validates design/styling

### Phase 4: Interactive UI (Client Components)
**Goal:** Add user interactions
**Components:**
1. RSVP button (`components/client/rsvp-button.tsx`)
2. Countdown timer (`components/client/countdown-timer.tsx`)
3. localStorage RSVP logic (`lib/rsvp.ts`)

**Why fourth:**
- Depends on static UI structure
- Can integrate with existing Server Components
- Isolated interactivity is easier to test

### Phase 5: Admin Section (Hybrid)
**Goal:** Build event management interface
**Components:**
1. Admin layout with password protection
2. Event form (Client Component)
3. Server Actions for mutations
4. Revalidation logic

**Why last:**
- Depends on data layer
- More complex (auth, forms, mutations)
- Not needed for public-facing site to work

**Dependency Chain:**
```
Foundation → Data Layer → Static UI → Interactive UI → Admin
    ↓            ↓            ↓             ↓            ↓
  Routes      Storage      Display      Clicks       Edit
```

## App Router Specific Patterns

### Loading States with Suspense
```typescript
// app/(public)/events/loading.tsx
export default function Loading() {
  return <div>Loading events...</div>
}

// app/(public)/events/page.tsx (Server Component)
export default async function EventsPage() {
  const events = await getEvents() // Streaming during fetch
  return <EventList events={events} />
}
```

**Why:** Automatic loading UI while Server Component fetches data

### Error Boundaries
```typescript
// app/(public)/events/error.tsx
'use client' // Error components must be Client Components
export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div>
      <h2>Failed to load events</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Why:** Graceful error handling per route segment

### Metadata for SEO
```typescript
// app/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'E23 Suite | College Event Hub',
  description: 'Private event coordination for E23 suite members',
}
```

**Why:** Server-side metadata generation for each page

### Dynamic Routes (Future)
```typescript
// app/(public)/events/[id]/page.tsx
export default async function EventPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id)
  return <EventDetail event={event} />
}

// Generate static params at build time
export async function generateStaticParams() {
  const events = await getEvents()
  return events.map(event => ({ id: event.id }))
}
```

**Why:** Individual event pages with static generation

## Scalability Considerations

| Concern | At 8 users (MVP) | At 100 users | At 1000+ users |
|---------|------------------|--------------|----------------|
| **Event Storage** | JSON files in repo, localStorage RSVPs | Upstash Redis, localStorage RSVPs | Upstash/Supabase with database RSVPs |
| **RSVP Tracking** | localStorage (per-browser) | localStorage + optional server sync | Database with user accounts |
| **Auth** | Password-protected admin page | Same | OAuth or magic links |
| **Caching** | Default Next.js caching | Add revalidation tags | Edge caching with ISR |
| **Real-time** | Client-side polling (countdown) | Same | WebSockets or Server-Sent Events |
| **Images** | Direct `<img>` tags from `/public` | Next.js `<Image>` component | Vercel Blob or Cloudflare R2 |

**For MVP (8 users):**
- Use simplest solutions (localStorage, JSON files)
- Avoid premature optimization
- Focus on fast iteration

**Scale when needed:**
- Add database when RSVPs need cross-device sync
- Add auth when managing access becomes painful
- Add real-time when polling causes issues

## Critical Decisions for E23 Suite

### Decision 1: Event Storage
**Recommended:** Upstash Redis via Vercel Marketplace (free tier)
**Alternative:** JSON files in repo (simplest, no external dependencies)
**Why Upstash:**
- Free tier available
- Serverless (no connection pooling needed)
- Simple key-value API for event CRUD
- Easy migration path (matches original Vercel KV plan)

**If using JSON:**
```typescript
// lib/events.ts
import fs from 'fs/promises'
import path from 'path'

export async function getEvents() {
  const file = await fs.readFile(path.join(process.cwd(), 'data', 'events.json'), 'utf-8')
  return JSON.parse(file)
}

export async function createEvent(event: Event) {
  const events = await getEvents()
  events.push(event)
  await fs.writeFile(
    path.join(process.cwd(), 'data', 'events.json'),
    JSON.stringify(events, null, 2)
  )
}
```

### Decision 2: RSVP Storage
**Recommended:** localStorage (per-browser)
**Why:**
- No backend needed
- Fast (no network latency)
- Sufficient for trust-based small group
- Each member uses their own browser

**Limitation:** RSVPs don't sync across devices
**Mitigation:** Document this as feature (each device = separate RSVP, intentional)

### Decision 3: Admin Auth
**Recommended:** Middleware-based password check
**Why:**
- No user accounts needed
- Single shared password for 8 members
- Protects `/admin` routes

**Implementation:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('admin-auth')
    if (authCookie?.value !== process.env.ADMIN_PASSWORD_HASH) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  return NextResponse.next()
}
```

### Decision 4: Route Structure
**Recommended:** Route groups for public vs admin
```
(public)/
  events/
    page.tsx
(admin)/
  admin/
    page.tsx
```

**Why:**
- Separate layouts (public has main nav, admin has admin nav)
- Password protection via route group layout
- Clean URL structure (`/events`, `/admin`)

## Confidence Notes

**HIGH confidence areas (verified with official docs):**
- Server vs Client Component patterns
- Route group structure
- Server Actions for mutations
- Data fetching in Server Components
- localStorage hydration patterns

**MEDIUM confidence areas (community patterns):**
- Specific event coordination patterns
- Build order recommendations (based on dependencies)

**LOW confidence areas (needs validation):**
- Vercel KV sunset details (recent change, documentation removed)
- Performance at scale beyond 100 users (no real-world data for this specific use case)

## Sources

### Official Next.js Documentation
- [Getting Started: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)
- [Getting Started: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Getting Started: Layouts and Pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages)
- [File-system conventions: Route Groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups)
- [Guides: Forms](https://nextjs.org/docs/app/guides/forms)
- [Getting Started: Updating Data](https://nextjs.org/docs/app/getting-started/updating-data)
- [App Router: Fetching Data](https://nextjs.org/learn/dashboard-app/fetching-data)

### 2026 Architecture Patterns
- [Next.js Architecture in 2026 — Server-First, Client-Islands, and Scalable App Router Patterns](https://www.yogijs.tech/blog/nextjs-project-architecture-app-router)
- [Next.js (App Router) — Advanced Patterns for 2026: Server Actions, PPR, Streaming & Edge-first Architectures](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7)
- [Building a Production-Ready Next.js App Router Architecture: A Complete Playbook](https://dev.to/yukionishi1129/building-a-production-ready-nextjs-app-router-architecture-a-complete-playbook-3f3h)
- [Modern Full Stack Application Architecture Using Next.js 15+](https://softwaremill.com/modern-full-stack-application-architecture-using-next-js-15/)

### Server Components & Data Fetching
- [React Foundations: Server and Client Components](https://nextjs.org/learn/react-foundations/server-and-client-components)
- [React Server Components vs Client Components — When to Use What?](https://medium.com/@123ajaybisht/react-server-components-vs-client-components-when-to-use-what-bcec46cacded)
- [Next.js Server Components vs. Client Components: Best Practices](https://medium.com/@jigsz6391/next-js-server-components-vs-client-components-best-practices-2e735f4ad27c)
- [React Server Components in practice (Next.js App Router patterns, streaming, caching, partial pre‑render)](https://medium.com/@vyakymenko/react-server-components-in-practice-next-js-d1c3c8a4971f)

### Storage & State Management
- [11+ Best Databases for Next.js in 2026](https://nextjstemplates.com/blog/best-database-for-nextjs)
- [Best Databases for Next.js](https://upstash.com/blog/best-database-for-nextjs)
- [Vercel KV Documentation Removed · Issue #829](https://github.com/vercel/storage/issues/829)
- [Vercel Storage overview](https://vercel.com/docs/storage)
- [Using local storage in Next.js application](https://medium.com/@dimterion/using-local-storage-in-next-js-application-b1557c69e152)
- [Using LocalStorage with Next.js: A Beginner's Guide](https://articles.wesionary.team/using-localstorage-with-next-js-a-beginners-guide-7fc4f8bfd9dc)
- [Mastering State Management with Zustand in Next.js and React](https://dev.to/mrsupercraft/mastering-state-management-with-zustand-in-nextjs-and-react-1g26)

### Route Groups & Layouts
- [Next.js Route Groups: Organizing Your App Router Like a Pro](https://medium.com/@shrutishende11/next-js-route-groups-organizing-your-app-router-like-a-pro-aa58ca11f973)
- [Mastering Next.js Routing: Dynamic Routes, Route Groups, and Parallel Routes](https://dev.to/devjordan/mastering-nextjs-routing-dynamic-routes-route-groups-and-parallel-routes-1m5h)
- [A guide to Next.js layouts and nested layouts](https://blog.logrocket.com/guide-next-js-layouts-nested-layouts/)

### Server Actions
- [Next.js Server Actions: Complete Guide with Examples for 2026](https://dev.to/marufrahmanlive/nextjs-server-actions-complete-guide-with-examples-for-2026-2do0)
- [Next.js Quick Guide to Server Actions (App Router)](https://dev.to/alvisonhunter/nextjs-quick-guide-to-server-actions-44an)
- [Next.js Forms with Server Actions](https://www.robinwieruch.de/next-forms/)
