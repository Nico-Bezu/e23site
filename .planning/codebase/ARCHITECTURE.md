# Architecture

**Analysis Date:** 2026-01-30

## Pattern Overview

**Overall:** Next.js App Router with Server Components

**Key Characteristics:**
- File-based routing using Next.js 16 App Router
- TypeScript for type safety
- React 19 with Server Components as default
- Tailwind CSS v4 for styling
- ESLint with Next.js and TypeScript support for code quality
- Minimal starter template structure

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle client interactions
- Location: `app/` directory
- Contains: Layout components, page components, styling
- Depends on: Next.js framework, React components
- Used by: Browser/client

**Layout Layer:**
- Purpose: Define application structure and metadata
- Location: `app/layout.tsx`
- Contains: Root HTML structure, font configuration, metadata
- Depends on: Next.js Metadata API, Google Fonts
- Used by: All pages

**Page Layer:**
- Purpose: Define route-specific content and views
- Location: `app/page.tsx`
- Contains: Home page component with hero section
- Depends on: Next.js Image optimization
- Used by: Router at `/`

**Styling Layer:**
- Purpose: Define global styles and theme configuration
- Location: `app/globals.css`
- Contains: Tailwind imports, CSS variables, theme configuration
- Depends on: Tailwind CSS v4, PostCSS
- Used by: All pages

## Data Flow

**Request to Response:**

1. Browser request arrives at Next.js server
2. Router matches path to route (App Router handles routing)
3. Layout component (`RootLayout`) is rendered first with metadata
4. Matched page component is rendered (e.g., `Home` for `/`)
5. Server Components generate HTML
6. Response sent to browser with styling and assets
7. Browser renders HTML with applied Tailwind styles

**Styling Pipeline:**

1. Global styles defined in `app/globals.css`
2. Tailwind CSS v4 processes CSS variables
3. PostCSS transforms Tailwind directives via `postcss.config.mjs`
4. Generated CSS is bundled with application
5. Client receives optimized CSS

## Key Abstractions

**Layout Component:**
- Purpose: Wraps all pages with common structure and configuration
- Examples: `app/layout.tsx`
- Pattern: Export default function component with children prop

**Page Component:**
- Purpose: Defines content for a specific route
- Examples: `app/page.tsx`
- Pattern: Export default function component, uses Next.js Image for optimization

**Metadata Configuration:**
- Purpose: Define SEO and page-specific metadata
- Examples: `app/layout.tsx` - export const metadata
- Pattern: TypeScript typed metadata using Next.js Metadata type

## Entry Points

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Application bootstrap, all page requests
- Responsibilities: Initialize fonts, set metadata, provide HTML structure, apply theme variables

**Home Page:**
- Location: `app/page.tsx`
- Triggers: Navigation to `/` route
- Responsibilities: Render landing page content, showcase Next.js templates

**Configuration Entry:**
- Location: `next.config.ts`
- Triggers: Application build time
- Responsibilities: Configure Next.js behavior (currently minimal)

## Error Handling

**Strategy:** Implicit - Next.js default error handling

**Patterns:**
- Server errors logged to console
- Client errors caught by React error boundaries (implicit via Next.js)
- No custom error pages defined (uses Next.js defaults)
- Type safety via TypeScript prevents many errors at compile time

## Cross-Cutting Concerns

**Logging:** Console only - no logging framework configured

**Validation:** TypeScript strict mode provides compile-time validation, React prop validation

**Authentication:** Not implemented - no auth layer in current architecture

**Styling:** Tailwind CSS handles all styling with utility-first approach

---

*Architecture analysis: 2026-01-30*
