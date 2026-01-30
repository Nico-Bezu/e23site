# Technology Stack

**Analysis Date:** 2026-01-30

## Languages

**Primary:**
- TypeScript 5.x - Used throughout the application for type safety
- JavaScript (React JSX) - Used in React components and Next.js configuration files

**Secondary:**
- CSS - Styles using Tailwind CSS with PostCSS

## Runtime

**Environment:**
- Node.js 22.11.0 (development environment detected)
- Next.js 16.1.6 (full-stack framework)

**Package Manager:**
- npm 10.9.0
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.1.6 - Full-stack React framework with server and client components, routing, and build optimization
- React 19.2.3 - UI library for building components
- React DOM 19.2.3 - React bindings for the DOM

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- @tailwindcss/postcss 4.x - PostCSS plugin for Tailwind CSS
- PostCSS - CSS transformation tool (configured in `postcss.config.mjs`)

**Development/Linting:**
- ESLint 9.x - JavaScript/TypeScript linter
- eslint-config-next 16.1.6 - Next.js-specific ESLint configuration and Core Web Vitals rules
- TypeScript 5.x - TypeScript compiler and language support

## Key Dependencies

**Runtime Dependencies (3 total):**
- next@16.1.6 - Web framework
- react@19.2.3 - UI library
- react-dom@19.2.3 - React DOM bindings

**Development Dependencies (8 total):**
- @tailwindcss/postcss@^4 - Tailwind CSS PostCSS integration
- @types/node@^20 - TypeScript type definitions for Node.js
- @types/react@^19 - TypeScript type definitions for React
- @types/react-dom@^19 - TypeScript type definitions for React DOM
- eslint@^9 - Code quality and linting tool
- eslint-config-next@16.1.6 - Next.js ESLint configuration
- tailwindcss@^4 - CSS framework
- typescript@^5 - TypeScript language and compiler

## Configuration

**Environment:**
- No `.env` files detected in repository (per `.gitignore` policy)
- Environment-based configuration may be handled at deployment/hosting level
- Next.js configuration: `next.config.ts` (currently minimal/empty configuration)

**Build:**
- `tsconfig.json` - TypeScript compiler configuration with:
  - Target: ES2017
  - Module: esnext
  - Strict mode enabled
  - Path alias: `@/*` maps to root directory
  - JSX: react-jsx
- `eslint.config.mjs` - ESLint flat config format with Next.js defaults
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS

## Platform Requirements

**Development:**
- Node.js 20+ (TypeScript target ES2017, compatible with Node 22.x observed)
- npm (package manager)
- Supports modern browsers (uses Tailwind CSS and React 19)

**Production:**
- Deployment platform: Vercel (primary target as mentioned in README and documentation)
- Alternative: Standard Node.js hosting supporting Next.js
- Build output: Static and server-side rendered pages in `.next/` directory

## Dependencies Snapshot

**Total Direct Dependencies:**
- Production: 3 packages
- Development: 8 packages
- Total: 11 direct dependencies
- Total installed (with transitive): 291 node_modules directories detected

**Minimal Surface Area:**
This is a lean, modern stack with only essential dependencies. No database clients, API SDKs, authentication libraries, or monitoring tools are currently installed.

---

*Stack analysis: 2026-01-30*
