# Coding Conventions

**Analysis Date:** 2026-01-30

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `page.tsx`, `layout.tsx`)
- Configuration files: kebab-case with descriptive names (e.g., `next.config.ts`, `eslint.config.mjs`)
- Styles: kebab-case with `.css` extension (e.g., `globals.css`)

**Functions:**
- React components: PascalCase for component functions (e.g., `RootLayout`, `Home`)
- Exported component functions use `export default` pattern
- Variables storing configuration use camelCase (e.g., `geistSans`, `geistMono`, `nextConfig`)

**Variables:**
- camelCase for all variable declarations (const/let)
- Font configuration variables follow descriptive naming: `geistSans`, `geistMono`
- Component prop variables use camelCase and are destructured

**Types:**
- React types imported from `react` (e.g., `React.ReactNode`)
- TypeScript type annotations use `Readonly<>` for immutable prop types
- Metadata exported as typed objects: `Metadata` type from `next`

## Code Style

**Formatting:**
- No explicit formatter config (Prettier not configured)
- ESLint used for linting with flat config system (eslint.config.mjs)
- Default JavaScript/TypeScript conventions apply

**Linting:**
- Tool: ESLint v9+
- Configuration file: `eslint.config.mjs` at project root
- Uses flat config format (`defineConfig`, `globalIgnores`)
- Extends: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Key settings:
  - Ignores `.next/**`, `out/**`, `build/**`, `next-env.d.ts` directories
  - Strict TypeScript checking enabled
  - Core Web Vitals compliance enforced
  - React 19 support (via @types/react v19)

## Import Organization

**Order:**
1. Next.js imports (e.g., `import type { Metadata } from "next"`)
2. Next.js specific features (e.g., `import { Geist, Geist_Mono } from "next/font/google"`)
3. React/React-DOM imports (e.g., `import Image from "next/image"`)
4. Local imports (e.g., `import "./globals.css"`)

**Path Aliases:**
- Configured in `tsconfig.json`: `"@/*": ["./*"]`
- Root-relative imports available but not actively used in current codebase

## Error Handling

**Patterns:**
- No explicit error handling patterns observed in current minimal codebase
- TypeScript strict mode enabled ensures type safety at compile time
- Standard React error boundaries would be recommended for future error handling

## Logging

**Framework:** No explicit logging framework configured
- Would use `console` methods for basic logging if needed
- No structured logging integration (no Winston, Pino, etc.)

## Comments

**When to Comment:**
- JSDoc comments not observed in current codebase
- Minimal inline comments present
- Code clarity preferred over extensive commenting

**JSDoc/TSDoc:**
- Not currently used in codebase
- Would be recommended for exported functions and complex logic

## Function Design

**Size:** Functions are concise and single-purpose
- `RootLayout`: 15 lines - wraps children with global configuration
- `Home`: 62 lines - single component with inline JSX

**Parameters:**
- Destructured from props object with type annotations
- Example: `{ children }: Readonly<{ children: React.ReactNode }>` in `layout.tsx`
- `export default` patterns used for page components

**Return Values:**
- React components return JSX elements (typed as React ReactNode or implicit)
- Implicit return types in component functions
- No explicit function signatures for simple components

## Module Design

**Exports:**
- `export default` for page components and layout components
- Named exports with `export const` for metadata objects (e.g., `export const metadata: Metadata`)
- Single default export per page/layout file

**Barrel Files:**
- Not used in current codebase (only 4 source files total)
- Would be relevant for larger feature modules if expanded

## Component Patterns

**Next.js App Router:**
- Files in `app/` directory: `page.tsx` and `layout.tsx` files define routes
- `layout.tsx`: Root layout wrapper with global metadata, fonts, and styles
- `page.tsx`: Home page component
- Metadata defined as typed exports in layout

**Styling:**
- Tailwind CSS v4 used exclusively
- Tailwind v4 new @import syntax used in `globals.css`
- CSS custom properties for theming (--background, --foreground)
- Dark mode support via `prefers-color-scheme` media query

**Fonts:**
- Google Fonts integration via `next/font/google`
- Font variables injected as CSS custom properties (--font-geist-sans, --font-geist-mono)
- Applied via className strings with template literals

---

*Convention analysis: 2026-01-30*
