## CroxCom — Phase 1, Stage 1

Build the foundation of a terminal-inspired, minimalist community platform for AI developers on the existing TanStack Start stack (React 19 + Vite + Tailwind v4 + shadcn/ui). UI-only with mock data. Later stages will add profile, communities, notifications, messaging, and style-guide pages.

### 1. Design tokens (`src/styles.css`)

Replace the current shadcn default palette with the CroxCom system.

- Dark (default): `--background #111`, `--card #1a1a1a`, `--foreground #fff`, `--muted-foreground #a1a1aa`, `--border #333`, `--primary #00ff9f` (teal/cyan accent), `--primary-foreground #0a0a0a`.
- Light: `--background #f8f9fa`, `--card #fff`, `--foreground #111`, `--muted-foreground #52525b`, `--border #e5e5e5`, same accent.
- All values in `oklch()`.
- Base radius small (~6px) for a crisp terminal feel.
- Body font: system sans (Inter fallback stack); mono font: `ui-monospace, "JetBrains Mono", "SF Mono", Menlo`. Register as `--font-sans` / `--font-mono` in `@theme`.
- Base font-size 15–16px, generous line-height (1.65) for long-form.
- Add a `.cursor-pulse` utility (blinking terminal caret) for skeletons/prompts.

### 2. Theme toggle

- `src/lib/theme.ts` — small helper: reads `localStorage("croxcom-theme")`, defaults to `dark`, toggles `.dark` class on `<html>`.
- Inline `<script>` in `__root.tsx` head runs before hydration to set the class (avoids flash).
- `<ThemeToggle />` component (Sun/Moon lucide) in the top bar.

### 3. Root layout (`src/routes/__root.tsx`)

- Update `head()`: title `CroxCom — Community for AI Developers`, matching description, og/twitter tags.
- Add Inter via `<link>` (not `@import`).
- Wrap `<Outlet />` in `<AppShell>` (see below) inside the existing `QueryClientProvider`.

### 4. App shell (`src/components/layout/`)

- `AppShell.tsx`: responsive frame — desktop 3-column (`sidebar | main | right-rail placeholder`), mobile single column with top bar + slide-out drawer.
- `SideNav.tsx` (desktop, `lg:` up, sticky): Logo placeholder (`> croxcom_` monospace wordmark), then nav items with lucide icons — Profile (`User`), Notifications (`Bell`), Chat (`MessageSquare`), Browse (`Compass`), Bookmarks (`Bookmark`), Premium (`Sparkles`), More (`MoreHorizontal`). Uses `<Link>` with `activeProps`. Big "New post" primary button at bottom.
- `MobileNav.tsx`: top bar with hamburger opening a shadcn `Sheet` drawer containing the same items. Bottom tab bar with 4 icons (Home, Browse, Notifications, Chat) for thumb reach.
- `TopBar.tsx`: sits above feed on all breakpoints. Left: logo (mobile only). Center: segmented tabs **For You / Following / Communities** (client-only state for stage 1). Right: theme toggle + avatar.
- All borders 1px `--border`, cards use subtle glass: `bg-card/70 backdrop-blur-sm border border-border`.

### 5. Feed page (`src/routes/index.tsx`)

Replace the placeholder. Renders `AppShell` + list of `PostCard`.

- `src/data/mock.ts`: exports `mockPosts`, `mockUsers`, `mockCommunities` — 8–12 posts spanning text, long-form (truncated), image, video-thumbnail, and code-snippet variants. Realistic AI-dev content (RAG, fine-tuning, agents, evals).
- `PostCard.tsx`:
  - Header: avatar, display name, `@handle` mono, `· 2h` mono timestamp, community badge if any, `…` menu.
  - Body: text with 6-line clamp + inline **`Read more`** link (routes to `/post/$id` — route added in a later stage; for now href is a no-op button styled as link).
  - Media: single image or 2×2 grid; video shows thumbnail with play glyph.
  - Code blocks: mono, subtle bg, no syntax highlighting yet.
  - Tags: `#rag` `#llm` monospace chips.
  - Engagement row: `MessageCircle` (comments), `Repeat2` (repost), `Heart` (like), `Bookmark`, `Share` — icon-only ghost buttons with counts. Toggle-able local state, subtle color shift to accent when active. All buttons have `aria-label`.
- Right rail (desktop `xl:` up): "Trending in AI" mock list + "Suggested communities" — small, subtle. Hidden below `xl`.

### 6. Post composer

- `Composer.tsx` (inline at top of feed on desktop; opens as shadcn `Dialog` from FAB/nav on mobile).
- Terminal-style: monospace prompt `~/croxcom $ share >` prefix, textarea with matching mono placeholder `write something for the community…`, blinking caret utility.
- Toolbar row: `Image`, `Video`, `Code2`, `Hash` (tag), `Globe/Users/Lock` privacy popover (shadcn `Popover`), character counter, primary **Post** button (disabled until content).
- Media upload: hidden file input via label; shows local preview chips (no upload). Tag input parses `#word` tokens.
- All state local (`useState`); on submit prepends to feed list (in-memory).

### 7. Accessibility & polish

- `<main>` wraps feed inside `__root.tsx` Outlet area.
- Icon-only buttons: `aria-label`.
- Focus rings via `--ring` (accent at 40% opacity).
- Skeleton loader component with mono cursor pulse (for later suspense; used in feed initial 300ms simulated load).
- Framer Motion for one subtle effect: composer expand + toast on post.

### 8. Deliverables (files)

- Edit: `src/styles.css`, `src/routes/__root.tsx`, `src/routes/index.tsx`.
- New: `src/lib/theme.ts`, `src/components/theme-toggle.tsx`, `src/components/layout/{AppShell,SideNav,MobileNav,TopBar,RightRail}.tsx`, `src/components/feed/{PostCard,Composer,Skeleton}.tsx`, `src/data/mock.ts`, `README-design-system.md` (short guide covering tokens, fonts, adding a semantic color, theme toggle mechanics).
- Install: `framer-motion` (only new dep; shadcn primitives Sheet/Dialog/Popover added as needed via existing shadcn setup).

### Out of scope (later stages)

Post detail route, profile, communities browse/detail, notifications, messaging inbox, dedicated style-guide page. Nav links to these routes will render but the pages themselves land in the next stage.
