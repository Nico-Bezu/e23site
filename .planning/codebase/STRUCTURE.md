# Codebase Structure

**Analysis Date:** 2026-01-30

## Directory Layout

```
e23site/
├── app/                    # Next.js App Router pages and layouts
│   ├── layout.tsx         # Root layout component
│   ├── page.tsx           # Home page component
│   ├── globals.css        # Global styles and Tailwind setup
│   └── favicon.ico        # Favicon file
├── public/                # Static assets served as-is
│   ├── next.svg          # Next.js logo
│   ├── vercel.svg        # Vercel logo
│   ├── file.svg          # Icon asset
│   ├── globe.svg         # Icon asset
│   └── window.svg        # Icon asset
├── node_modules/          # Dependencies (generated)
├── .next/                 # Next.js build output (generated)
├── .git/                  # Git repository metadata
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── tsconfig.json          # TypeScript configuration
├── next.config.ts         # Next.js configuration
├── eslint.config.mjs      # ESLint configuration
├── postcss.config.mjs     # PostCSS configuration
├── next-env.d.ts          # Next.js TypeScript declarations
├── .gitignore            # Git ignore rules
└── README.md             # Project documentation
```

## Directory Purposes

**app/:**
- Purpose: Next.js App Router root - contains all routes and layout
- Contains: Page components (.tsx), layout components, styling files
- Key files: `layout.tsx`, `page.tsx`, `globals.css`

**public/:**
- Purpose: Static assets served directly by web server
- Contains: Images, icons, logos used in pages
- Key files: `next.svg`, `vercel.svg`

**node_modules/:**
- Purpose: Installed npm dependencies
- Contains: All third-party packages
- Generated: Yes, created by npm install

**.next/:**
- Purpose: Next.js build output and cache
- Contains: Compiled pages, CSS, manifests
- Generated: Yes, created by npm run build or dev

**.git/:**
- Purpose: Git version control metadata
- Contains: Commit history, branches, configuration
- Key files: objects, refs, HEAD

## Key File Locations

**Entry Points:**
- `app/layout.tsx`: Root layout that wraps all pages
- `app/page.tsx`: Home page component
- `next.config.ts`: Next.js configuration

**Configuration:**
- `package.json`: Project metadata, scripts, dependencies
- `tsconfig.json`: TypeScript compiler options and paths
- `eslint.config.mjs`: ESLint rules and Next.js presets
- `postcss.config.mjs`: PostCSS plugin configuration

**Core Logic:**
- `app/layout.tsx`: Font loading, metadata setup, HTML structure
- `app/page.tsx`: Home page UI and content

**Styling:**
- `app/globals.css`: Global Tailwind setup and CSS variables
- Inline Tailwind classes in component files

## Naming Conventions

**Files:**
- Layout files: `layout.tsx` (Next.js convention)
- Page files: `page.tsx` (Next.js convention)
- Config files: `*.config.ts` or `*.config.mjs` (kebab-case with config suffix)
- Styles: `globals.css` for global styles, `[name].module.css` pattern not used

**Directories:**
- `app/` for routes/pages (Next.js convention)
- `public/` for static assets (Next.js convention)
- lowercase for all custom directories

**Components:**
- PascalCase for React components: `RootLayout`, `Home`
- Default export for page/layout components

**Variables:**
- camelCase: `geistSans`, `geistMono`, `metadata`

**Types:**
- PascalCase: `Metadata`, `NextConfig`

## Where to Add New Code

**New Feature:**
- Primary code: `app/[featureName]/` - create new directory with `page.tsx`
- Tests: Create adjacent `[featureName].test.tsx` (if testing added)

**New Component/Module:**
- Implementation: `app/components/` - create new directory or file if it exists, otherwise follow layout pattern
- Reusable component: Create under `app/components/` directory for shared components

**Utilities:**
- Shared helpers: `app/lib/` directory (create if needed for utility functions)
- Styling utilities: Extend Tailwind config in `tailwind.config.ts` if needed

**New Layout:**
- Location: `app/[section]/layout.tsx` - create new layout.tsx for route group
- Inherited by: All pages in that directory and subdirectories

**New API Routes:**
- Location: `app/api/[endpoint]/route.ts` - not yet implemented
- Pattern: Create `route.ts` file with GET, POST, etc. handlers

**Styling:**
- Global styles: Add to `app/globals.css`
- Component-specific: Use inline Tailwind classes in component JSX
- Config overrides: Extend in `postcss.config.mjs` or `tailwind.config.ts` (if created)

## Special Directories

**node_modules/:**
- Purpose: External dependencies installed via npm
- Generated: Yes
- Committed: No (excluded by .gitignore)

**.next/:**
- Purpose: Next.js build cache and compiled output
- Generated: Yes, during build or dev
- Committed: No (excluded by .gitignore)

**.git/:**
- Purpose: Git version control data
- Generated: Yes, on git init
- Committed: Yes (git internal)

---

*Structure analysis: 2026-01-30*
