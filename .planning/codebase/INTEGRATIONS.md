# External Integrations

**Analysis Date:** 2026-01-30

## APIs & External Services

**No external API integrations detected** - The codebase contains no imports or configurations for third-party API SDKs.

## Data Storage

**Databases:**
- Not configured - No database client libraries installed (no prisma, sequelize, mongoose, etc.)

**File Storage:**
- Local filesystem only - Uses Next.js public directory (`public/`) for static assets
- Location: `public/` directory contains favicon and image assets

**Caching:**
- Not configured - No caching library installed (no redis, memcached, or Node.js cache packages)

## Authentication & Identity

**Auth Provider:**
- Not implemented - No authentication libraries installed
- Approach: Not applicable (application is currently a static/public site)

## Monitoring & Observability

**Error Tracking:**
- Not configured - No error tracking services (Sentry, Rollbar, etc.) configured

**Logs:**
- Console logging only - Standard Node.js console output for development and production logs

## CI/CD & Deployment

**Hosting:**
- Vercel (primary deployment platform referenced in documentation)
  - README recommends Vercel as "the easiest way to deploy"
  - Configuration: Vercel auto-detects Next.js projects and handles builds automatically
  - `.vercel/` directory is gitignored (per `.gitignore`)

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, Jenkins, or other CI configuration files present
- Deployment likely handled by Vercel's built-in CI/CD

## Environment Configuration

**Required env vars:**
- None currently in use - No environment variables referenced in code or configuration files

**Secrets location:**
- Not applicable - No secrets currently required or configured

## Webhooks & Callbacks

**Incoming:**
- None detected - No API routes configured for receiving webhooks

**Outgoing:**
- None detected - No outbound webhook implementations found

## Font & Asset CDN

**Google Fonts:**
- Integration: `next/font/google` (imported in `app/layout.tsx`)
- Usage: Loads two font families (Geist and Geist_Mono) from Google Fonts CDN
- Files:
  - `app/layout.tsx` - Font loading configuration (lines 2, 5-13)
  - `app/globals.css` - Font variable usage

## Build-Time Integrations

**Next.js Built-in Features:**
- Image Optimization: `next/image` component used for optimized image serving
  - Located in: `app/page.tsx` (lines 1, 7-13, 44-50)
- Font Optimization: `next/font/google` for automatic font optimization
- Static Asset Serving: SVG assets (next.svg, vercel.svg) served from `public/` directory

## Development-Only Integrations

**ESLint Configuration Sources:**
- Uses `eslint-config-next` which provides:
  - Core Web Vitals rules
  - TypeScript-specific linting rules
  - Configuration file: `eslint.config.mjs`

---

*Integration audit: 2026-01-30*
