# Roadmap: E23 Suite Website

## Overview

Transform a fresh Next.js 16 codebase into a private suite coordination hub. The journey: establish the dark premium foundation with Upstash Redis, build the events system with RSVP functionality, add admin controls, then polish the landing page experience. Each phase delivers a deployable increment toward the core value: "Members can instantly see what's happening tonight and who's going."

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Foundation** - Dark theme, UI components, Upstash Redis setup
- [ ] **Phase 2: Events Core** - Event display, countdown timers, past events
- [ ] **Phase 3: RSVP + Admin** - RSVP system and password-protected admin
- [ ] **Phase 4: Landing Page** - Hero, member grid, "Tonight" widget, CTAs

## Phase Details

### Phase 1: Foundation
**Goal**: Establish the technical foundation and visual identity
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03
**Success Criteria** (what must be TRUE):
  1. Site loads with dark theme by default on all pages
  2. Upstash Redis is connected and can store/retrieve data
  3. shadcn/ui components (button, card, badge) are available and styled dark
  4. Site is responsive on mobile devices (320px+)
  5. Page load time is under 3 seconds on 3G
**Plans**: TBD

Plans:
- [ ] 01-01: Upstash Redis setup + connection verification
- [ ] 01-02: Dark theme with shadcn/ui + next-themes
- [ ] 01-03: Base layout and responsive foundations

### Phase 2: Events Core
**Goal**: Members can view events with all details and countdown timers
**Depends on**: Phase 1
**Requirements**: EVENT-01, EVENT-03, EVENT-04
**Success Criteria** (what must be TRUE):
  1. Events page displays all upcoming events as cards with title, date/time, location, vibe tag, and bring notes
  2. Each upcoming event shows an accurate countdown timer (updates in real-time)
  3. Past events are displayed in a collapsible section, sorted newest-first
  4. Event data persists across page reloads (stored in Upstash Redis)
**Plans**: TBD

Plans:
- [ ] 02-01: Event data model and Redis operations
- [ ] 02-02: Events page with cards and countdown timers
- [ ] 02-03: Past events collapsible section

### Phase 3: RSVP + Admin
**Goal**: Members can RSVP to events; admins can manage event content
**Depends on**: Phase 2
**Requirements**: EVENT-02, ADMIN-01, ADMIN-02
**Success Criteria** (what must be TRUE):
  1. User can select Going/Maybe/Not Going for any event with name entry
  2. RSVP status shows who's going to each event (displays names and counts)
  3. Admin page is protected by password (redirects to login if not authenticated)
  4. Admin can create new events via form (title, date, location, vibe tag, bring notes)
  5. Admin can edit and delete existing events
**Plans**: TBD

Plans:
- [ ] 03-01: RSVP system with name entry and status display
- [ ] 03-02: Admin authentication (password + session)
- [ ] 03-03: Admin event CRUD interface

### Phase 4: Landing Page
**Goal**: Landing page establishes suite identity and surfaces tonight's event
**Depends on**: Phase 2 (needs event data for widget)
**Requirements**: LAND-01, LAND-02, LAND-03, LAND-04, LAND-05
**Success Criteria** (what must be TRUE):
  1. Hero section displays with title, subtitle, and dark aesthetic background
  2. "Tonight in E23" widget shows current/next event with countdown (or "Nothing planned" state)
  3. Suite photo with description is prominently displayed
  4. Member grid shows 8 cards with names and one-liners, with hover animations
  5. CTAs "Meet the Suite" and "Upcoming Events" navigate to correct sections/pages
**Plans**: TBD

Plans:
- [ ] 04-01: Hero section and "Tonight in E23" widget
- [ ] 04-02: Suite photo section and member grid
- [ ] 04-03: CTAs and final polish

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Events Core | 0/3 | Not started | - |
| 3. RSVP + Admin | 0/3 | Not started | - |
| 4. Landing Page | 0/3 | Not started | - |

## Requirement Coverage

| Requirement | Description | Phase |
|-------------|-------------|-------|
| FOUND-01 | Mobile responsive design | Phase 1 |
| FOUND-02 | Dark, premium aesthetic throughout | Phase 1 |
| FOUND-03 | Fast load times | Phase 1 |
| EVENT-01 | Event cards with details | Phase 2 |
| EVENT-03 | Countdown timer for upcoming events | Phase 2 |
| EVENT-04 | Past events section (collapsible) | Phase 2 |
| EVENT-02 | RSVP system with name entry | Phase 3 |
| ADMIN-01 | Password-protected admin page | Phase 3 |
| ADMIN-02 | Add/edit/delete events via form | Phase 3 |
| LAND-01 | Hero section with dark aesthetic | Phase 4 |
| LAND-02 | "Tonight in E23" widget with countdown | Phase 4 |
| LAND-03 | Suite photo with description | Phase 4 |
| LAND-04 | Member grid (8 cards with hover) | Phase 4 |
| LAND-05 | CTAs for navigation | Phase 4 |

**Coverage:** 14/14 requirements mapped
