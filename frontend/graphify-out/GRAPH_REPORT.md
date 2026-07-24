# Graph Report - frontend  (2026-07-20)

## Corpus Check
- 88 files · ~44,614 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 759 nodes · 817 edges · 57 communities (51 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `594b7db4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `compilerOptions` - 16 edges
3. `apiFetch()` - 14 edges
4. `Next.js Performance Optimization` - 14 edges
5. `Post` - 11 edges
6. `Next.js Data Fetching` - 11 edges
7. `Next.js Performance Optimization Checklist` - 10 edges
8. `Next.js Patterns` - 9 edges
9. `Next.js Code Review` - 9 edges
10. `Route Handlers Ottimizzati` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Button()` --calls--> `cn()`  [EXTRACTED]
  components/ui/button.tsx → lib/utils.ts
- `DetailModalProps` --references--> `Post`  [EXTRACTED]
  src/app/features/sports-blog-home/components/DetailModal.tsx → src/app/features/sports-blog-home/types/index.ts
- `SkeletonGridProps` --references--> `LayoutMode`  [EXTRACTED]
  src/app/features/sports-blog-home/components/SkeletonGrid.tsx → src/app/features/sports-blog-home/types/index.ts
- `loginUser()` --calls--> `setAuthCookies()`  [EXTRACTED]
  src/app/features/auth/actions/login_user.ts → src/app/configs/apiClient.ts
- `getSinglePost()` --calls--> `apiFetch()`  [EXTRACTED]
  src/app/features/sports-blog-home/actions/get_single_post.ts → src/app/configs/apiClient.ts

## Import Cycles
- 1-file cycle: `src/app/login/page.tsx -> src/app/login/page.tsx`

## Communities (57 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (39): createPost(), CreatePostInput, deletePost(), getCurrentUser(), getSinglePost(), listAllPosts(), ListPostsParams, ReactionType (+31 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (35): Async Params, Before Starting, Best Practices, Bundle, Bundle Analysis, Bundle Size Warnings, Caching, Caching Considerations (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (32): dependencies, @base-ui/react, class-variance-authority, clsx, lucide-react, next, next-themes, react (+24 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (26): AI Directory Structure, Architecture, Async Params (Next.js 16), Best Practices, Cached Data Function, className Pattern, Component Patterns, Component Placement (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (26): Animated Spotlight, Animation Decision Tree, Animations, Background Decision Tree, CSS Page Transitions, Decorative Backgrounds, Dot Pattern, Faded Edge Effect (+18 more)

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (25): Best Practices, Client-Side Data Fetching, Common Pitfalls, Constraints and Warnings, Critical Constraints, Error Boundaries, Example 1: Blog with ISR, Example 2: Dashboard with Parallel Fetching (+17 more)

### Community 6 - "Community 6"
Cohesion: 0.08
Nodes (23): API Route Performance, Avoid Request Waterfalls, Bundle Optimization, Caching Strategy, Code Splitting, Core Web Vitals, Cumulative Layout Shift (CLS), Data Fetching Performance (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 8 - "Community 8"
Cohesion: 0.10
Nodes (20): On-demand Revalidation, Best Practices, Cache con Headers Condizionali, Cache con Parametri, Cache di Funzioni, Cache Tagging Granulare, Cache Time-based (ISR), Caching Strategies in Next.js (+12 more)

### Community 9 - "Community 9"
Cohesion: 0.10
Nodes (20): 1. Summary, 2. Critical Issues (Must Fix), 3. Warnings (Should Fix), 4. Suggestions (Consider Improving), 5. Positive Observations, 6. Recommendations, Best Practices, Constraints and Warnings (+12 more)

### Community 10 - "Community 10"
Cohesion: 0.10
Nodes (20): API Route with Proper Validation, Caching Patterns, Data Fetching Patterns, Dynamic Metadata, Error Boundaries, Form Handling with Server Actions, Layouts, Loading States (+12 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (11): LoginInput, LoginResult, loginUser(), RegisterInput, RegisterResult, registerUser(), LoginForm(), setAuthCookies() (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 13 - "Community 13"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.11
Nodes (18): Async Params, Caching, Client Boundaries, Component Rules, Core Principles, Data Fetching vs Server Actions, Dev Tools (next-devtools-mcp), File Organization (+10 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (18): 1. Immagine Hero (LCP), 2. Immagini Responsive, 3. Grid di Immagini, 4. Immagini da CMS/CDN Esterno, Art Direction (Picture Element), Blur Placeholder, Client-side Image Loading (con fallback), Color Placeholder (+10 more)

### Community 16 - "Community 16"
Cohesion: 0.11
Nodes (17): Best Practices, Bundle Analysis, Bundle Optimization, Code Splitting, Condizionale Loading, Dynamic Imports, ESM over CommonJS, Export Named vs Default (+9 more)

### Community 17 - "Community 17"
Cohesion: 0.11
Nodes (16): Async Context, Async Layout, Async Server Components, Error Boundaries, Error Handling, Form Actions, Incremental Static Regeneration (ISR), Next.js 16 + React 19 Patterns (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.12
Nodes (16): Boundary Placement Strategy, Common Mistakes, Component Boundary Rules, Context Providers, Data Passing Patterns, Importing Server-Only Code in Client Components, Push 'use client' Down the Tree, Review Checklist for Component Boundaries (+8 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (16): Accesso a Risorse Server-side, Async Params (Next.js 15+), Checklist di Conversione, Client Component Ibrido, Conversione Client → Server Component, Database Access, Environment Variables, Errori Comuni (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.12
Nodes (16): CLS Optimization, Core Web Vitals - Next.js Optimization, Elementi che contribuiscono a LCP, INP Optimization, LCP Optimization, Lighthouse CI, Monitoring CWV in Next.js, Overview (+8 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (16): Configurazione Base, Errori Comuni, Font con CSS Fallback Ottimizzato, Font con Tailwind CSS v4, Font Condizionali per Lingue, Font Optimization - next/font, Font Ottimizzati per Performance, Google Font (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.13
Nodes (14): dependencies, @clerk/nextjs, next, react, react-dom, devDependencies, @types/react, @types/react-dom (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.13
Nodes (14): Background Refetching, Basic Mutation, Dependent Queries, Infinite Queries, Infinite Scroll, Mutations and Optimistic Updates, Optimistic Updates, Parallel Queries (+6 more)

### Community 24 - "Community 24"
Cohesion: 0.19
Nodes (8): geistMono, geistSans, metadata, Providers(), queryClient, FootballCursor(), Toaster(), ToasterProps

### Community 25 - "Community 25"
Cohesion: 0.14
Nodes (13): Common Pitfalls, Conditional Rendering with `<Show>`, Docs, getToken() for external APIs, Manual JWT verification (no Clerk middleware), Mental Model, Minimal Pattern, Next.js Patterns (+5 more)

### Community 26 - "Community 26"
Cohesion: 0.15
Nodes (12): Article Structured Data, Dynamic Metadata, Metadata Base, Metadata e SEO, OpenGraph e Social, Overview, Pattern Base, Robots e Sitemap (+4 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (12): Best Practices, Con Props, Error Boundaries, Loading.tsx, Nested Suspense, Overview, Pattern Base, Streaming e Suspense in Next.js (+4 more)

### Community 28 - "Community 28"
Cohesion: 0.17
Nodes (11): Caching Headers, Edge Runtime, Error Handling, GET Handler, Middleware, Overview, Pattern Base, POST Handler (+3 more)

### Community 29 - "Community 29"
Cohesion: 0.17
Nodes (11): Add Components, Bun Commands Reference, Common Dependencies, Create New Project, Existing Project, Inspect Before Changing, Minimal Setup, Monorepo (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.18
Nodes (10): AppSidebar Component, Collapsible Options, Dashboard Layout, File Structure, Installation, Layout Pattern, Navigation Config, Page Component (+2 more)

### Community 31 - "Community 31"
Cohesion: 0.22
Nodes (8): Code Style and Structure, Error Handling and Validation, Optimization Best Practices, Optimized Next.js TypeScript Best Practices, Security and Performance, State and Data Management, Testing and Documentation, UI and Styling

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (8): Client Component, Conditional Rendering, CRITICAL: Always `await auth()`, Hybrid Pattern, Import Rules, Server Component, Server vs Client, When to Use

### Community 33 - "Community 33"
Cohesion: 0.22
Nodes (8): 1. Fixed `sports-blog-home` to Match the Real Backend, 2. Restructured Data Fetching into `actions/`, 3. Built the `auth` Feature (Login + Registration), Khela Dekho — Frontend/Backend Integration Session Memory, Shared API client promoted to `configs/`, Verified end-to-end against the live backend, What's Not Done Yet, What We Accomplished

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (7): On-Demand Revalidation, Cache Selection Checklist, Caching and Revalidation Strategies, Example: Blog Page with ISR, Opt Out of Caching, Tag Cached Data for Selective Invalidation, Time-based Revalidation (ISR)

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (7): Creating Error Boundaries, Error and Loading States, Error Boundary with Reset, Loading.tsx Pattern, Selection Guide, Suspense Boundaries, Using Error Boundaries with Data Fetching

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (6): Data Fetching Patterns, Example: Dashboard with Parallel Requests, Parallel Data Fetching, Pattern Selection, Sequential Data Fetching (When Dependencies Exist), Server Component Fetching (Default)

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (6): Middleware Strategies, Permission-Gated Routes, Protected-First (internal tools, dashboards), Public-First (marketing sites, blogs), Session Tasks, Token-Based Protection (Machine APIs)

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (5): Basic Mutation, Delete Action, Form with Client-Side Error Handling, Form with useActionState for Error Handling, Server Actions Reference

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (5): Client-Side Data Fetching, Example: Real-Time Data with SWR, Library Selection Guide, React Query Integration, SWR Integration

### Community 40 - "Community 40"
Cohesion: 0.33
Nodes (5): Basic ErrorBoundary, Error Boundaries Reference, ErrorBoundary with Reset, Usage with Data Fetching, Using ErrorBoundary with SWR/React Query

### Community 41 - "Community 41"
Cohesion: 0.40
Nodes (4): 401 vs 403, API Routes, Auth Check Pattern, Org Route Protection

### Community 42 - "Community 42"
Cohesion: 0.40
Nodes (4): Basic Protection, Org + Role Check (B2B), Permission Check (RBAC), Server Actions

### Community 43 - "Community 43"
Cohesion: 0.70
Nodes (3): cn(), Button(), buttonVariants

### Community 44 - "Community 44"
Cohesion: 0.40
Nodes (4): Caching with Auth, Org-Scoped Cache, Revalidate After Updates, User-Scoped Cache

### Community 45 - "Community 45"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **482 isolated node(s):** `name`, `private`, `dev`, `build`, `next` (+477 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `apiFetch()` connect `Community 0` to `Community 11`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `name`, `private`, `dev` to the rest of the system?**
  _482 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08646616541353383 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._