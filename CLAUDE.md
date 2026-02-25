# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm install              # Install dependencies
pnpm dev                  # Dev server (localhost:5173)
pnpm build                # Production build
pnpm preview              # Preview production build (localhost:4173)
pnpm check                # TypeScript type checking
pnpm lint                 # Prettier + ESLint check
pnpm format               # Auto-format with Prettier
pnpm test                 # Playwright E2E tests (requires build first)
pnpm test:unit            # Vitest unit tests
npx prisma db push        # Push schema changes to database
npx prisma generate       # Regenerate Prisma client
```

## Tech Stack

SvelteKit 2 (Svelte 5) + TypeScript, Tailwind CSS 4 + DaisyUI 5, Prisma 6 ORM with PostgreSQL/PostGIS (hosted on Supabase), Supabase Auth via `@supabase/ssr`.

## Architecture

**App purpose:** Discover restaurants/cafes/bars and their best menu items. Business data is imported from OpenStreetMap PBF files.

**Auth flow:** `hooks.server.ts` creates a Supabase server client per request and attaches `safeGetSession()` to `event.locals`. The root `+layout.server.ts` calls `safeGetSession()` and passes session data down. Protected routes (`/dashboard`, `/import`) check session in their `+page.ts` load functions and redirect to `/` if unauthenticated.

**Routing:** SvelteKit file-based routing under `src/routes/`. The `(app)` route group provides a shared navbar layout. Dynamic `[amenity=amenity]` routes use a custom param matcher (`src/params/amenity.ts`) that validates against the `AMENITIES` constant in `src/lib/amenities.ts`.

**Amenity system:** `src/lib/amenities.ts` defines a bidirectional mapping between URL slugs (e.g., `restaurants`) and DB values (e.g., `restaurant`). Routes like `/restaurants`, `/cafes`, `/bars` are all handled by `[amenity=amenity]/+page.server.ts`.

**Geospatial queries:** The `Business` model has a PostGIS `geometry(Point, 4326)` column with a GIST index. Geospatial queries (e.g., finding nearby businesses) use raw SQL with `ST_DWithin` and `ST_MakePoint` via `prisma.$queryRaw`. The `/api/nearby-businesses` endpoint accepts lat/lng params and returns businesses within 6km.

**OSM import:** `src/lib/server/osm-read.ts` parses OpenStreetMap PBF files, deduplicates businesses within 11m, and upserts via Prisma. Slugs are generated with collision handling (appending `-1`, `-2`, etc.).

**Prisma client:** `src/lib/server/prisma.ts` extends the Prisma client with a custom `exists()` method on all models.

## Code Style

- Svelte 5 runes: use `$state()`, `$derived()`, `$props()` (not legacy `let`/`export let`)
- Prettier: tabs, single quotes, no trailing commas, 100 char width
- Use `$lib/` alias for imports from `src/lib/`
- Server-only code goes in `src/lib/server/`

## Svelte 5 / SvelteKit 2

### Runes (replaces old implicit reactivity)

- `$state()` for reactive variables — replaces plain `let` declarations
- `$derived()` for computed values — replaces `$:` reactive declarations
- `$derived.by(() => {...})` for complex derived logic
- `$effect()` for side effects — replaces `onMount`/`afterUpdate` in most cases; return a cleanup function for teardown
- `$props()` for component props — replaces `export let`
- `$bindable()` for two-way-bindable props

### DO NOT use these deprecated Svelte 4 patterns

| Svelte 4 (deprecated)                | Svelte 5 (use this)                                   |
| ------------------------------------ | ----------------------------------------------------- |
| `export let prop`                    | `let { prop } = $props()`                             |
| `$: derived = x * 2`                 | `let derived = $derived(x * 2)`                       |
| `on:click={handler}`                 | `onclick={handler}`                                   |
| `on:click\|preventDefault`           | `onclick={(e) => { e.preventDefault(); handler(e) }}` |
| `createEventDispatcher()`            | Use callback props                                    |
| `<slot />` / `<slot name="x">`       | `{@render children()}` with `Snippet` type            |
| `import { page } from '$app/stores'` | `import { page } from '$app/state'`                   |

### Props typing pattern

```ts
let { data }: { data: PageData } = $props();
let { data, children }: { data: LayoutData; children: Snippet } = $props();
```

### Layout children pattern

- Import `Snippet` from `'svelte'`
- Accept `children` prop typed as `Snippet`
- Render with `{@render children()}`

### Form enhancement pattern

- Use `use:enhance` with `SubmitFunction`
- Handle `result.type === 'redirect'` by calling `invalidate('supabase:auth')`
- Otherwise call `applyAction(result)`

### SvelteKit 2 specifics

- `error()` and `redirect()` are called, not thrown
- `cookies.set()` requires explicit `path` option
- Use `$app/state` not `$app/stores`

### Deep reactivity

- `$state()` objects/arrays are deeply reactive proxies — mutations trigger updates
- Use `$state.raw()` if you want immutable-style (reassignment only)
- Use `$state.snapshot()` to get a plain object copy (for external APIs, logging, etc.)
