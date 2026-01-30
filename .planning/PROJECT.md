# E23 Suite Website

## What This Is

A private hub for the E23 college suite — 8 members coordinating events, building identity, and keeping track of what's happening tonight. Not a social network; a suite identity + coordination tool wrapped in a premium, curated aesthetic.

## Core Value

**Members can instantly see what's happening tonight and who's going.**

Everything else supports this: the landing page establishes identity, the events page delivers utility, photos reward engagement over time.

## Requirements

### Validated

(None yet — ship to validate)

### Active

**Landing Page**
- [ ] Hero section with title, subtitle, dark aesthetic background
- [ ] "Tonight in E23" widget showing current/next event with countdown
- [ ] Suite photo with short description
- [ ] Member grid (8 cards with name + one-liner, hover animation)
- [ ] CTAs: "Meet the Suite" and "Upcoming Events"

**Events Page**
- [ ] Event cards with: title, date/time, location, vibe tag, bring notes
- [ ] RSVP system (Going/Maybe/Not Going) with name entry
- [ ] Countdown timer for upcoming events
- [ ] Past events section (collapsible, sorted by date)

**Admin**
- [ ] Password-protected admin page
- [ ] Add/edit/delete events via form interface

**Foundation**
- [ ] Mobile responsive design
- [ ] Dark, premium aesthetic throughout
- [ ] Fast load times

### Out of Scope

- Photo galleries / event recaps — v2 feature, not MVP
- Suggestion box — nice to have, not core
- Suite lore/rules page — can add later
- Guest access page — defer until member experience solid
- Calendar sync (Google/Apple) — v2
- Event check-in system — v2
- Leaderboard / stats — v2
- Comments, DMs, chat — explicitly not building this
- OAuth / user accounts — trust-based name entry is sufficient for v1
- Notion/Google Calendar integration — v2 data source

## Context

**Existing codebase:** Fresh Next.js 16 starter with React 19, Tailwind CSS v4, TypeScript. No existing features — clean slate.

**Suite context:** 8 members in college suite E23. Events range from chill hangouts to turn-ups. Goal is higher attendance through visibility and reducing group chat coordination friction.

**Design direction:** Dark, aesthetic, premium feel. Not a generic Bootstrap site. Should feel curated and exclusive.

## Constraints

- **Tech stack**: Next.js + Tailwind (already set up), Vercel hosting
- **Backend**: Lightweight only — Vercel KV for events, localStorage for RSVPs
- **Auth**: Password protection for admin only, no user accounts in v1
- **Audience**: 8 suite members + occasional guests (low scale)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Trust-based RSVP (enter name freely) | Small trusted group, no need for accounts | — Pending |
| Vercel KV for events storage | Simple, free tier, no backend to manage | — Pending |
| localStorage for RSVPs | Per-browser, lightweight, sufficient for v1 | — Pending |
| No user accounts in v1 | Reduces complexity, suite members are trusted | — Pending |
| Dark aesthetic | Matches "premium, curated" vision from PRD | — Pending |

---
*Last updated: 2026-01-30 after initialization*
