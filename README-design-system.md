# CroxCom Design System

Terminal-inspired, minimalist community platform for AI developers.

## Where tokens live

All design tokens are defined in `src/styles.css`:

- `:root` — light-mode values (off-white surface).
- `.dark` — dark-mode values (default, near-black surface).
- `@theme inline` — maps CSS custom properties to Tailwind utilities
  (`bg-primary`, `text-foreground`, `border-border`, etc.).

Colors are all in `oklch()` so they interpolate correctly and stay in the
same perceptual family across light/dark. The accent (`--primary`) is a
single teal/cyan (`#00ff9f`) shared across both modes.

## Adding a new semantic color

1. Add the raw value under both `:root` and `.dark` in `src/styles.css`,
   e.g. `--success: oklch(0.75 0.17 155);`.
2. Register it in `@theme inline` as `--color-success: var(--success);`.
3. Use it as a Tailwind utility: `bg-success`, `text-success`, `border-success`.

## Typography

- Body / UI: **Inter** (loaded via `<link>` in `src/routes/__root.tsx`).
  Family aliased as `--font-sans`.
- Monospace / metadata / terminal prompts: **JetBrains Mono**, aliased as
  `--font-mono`. Use `font-mono` on anything that should feel like
  terminal output: handles, timestamps, tags, commands, code, counters.
- Base body size is 15px, line-height 1.65 — tuned for long technical
  posts.

## Theme toggle

Theme is stored in `localStorage("croxcom-theme")` and applied as the
`.dark` class on `<html>`.

- `src/lib/theme.ts` exposes `getStoredTheme`, `setTheme`, `applyTheme`,
  and `themeInitScript` (an inline script the root route injects into the
  document head so the theme is set before hydration and there's no flash).
- `src/components/theme-toggle.tsx` renders the Sun/Moon toggle button.

## Layout primitives

- `AppShell` — 3-column responsive frame (sidebar / main / right rail).
- `SideNav` — desktop side navigation.
- `MobileNav` — mobile top bar (with slide-out `Sheet`) + bottom tab bar.
- `TopBar` — sticky segmented tabs (For You / Following / Communities).
- `RightRail` — trending + suggested communities (xl+ only).

## Feed primitives

- `PostCard` — handles text, image, image-grid, video-thumbnail, and code
  post variants; supports 6-line clamp with "read more" for long-form.
- `Composer` — terminal-styled post composer with tag parsing, privacy
  popover, character counter, and attachment chips.
- `FeedSkeleton` — skeleton loader with the shared `.cursor-pulse`
  blinking caret utility.

## Utilities added in `styles.css`

- `.cursor-pulse` — blinking terminal caret pseudo-element (`▊`),
  colored with `--primary`.
- `.line-clamp-6` — six-line text clamp used by long-form post bodies.

## Interaction principles

- Hovers only on interactive elements; transitions fast (~150ms).
- Icon-only buttons always carry `aria-label`.
- Focus rings use `--ring` (accent at ~50% opacity) via shadcn defaults.
- Motion is limited to layout transitions on the composer and
  enter/exit on newly posted items — nothing decorative.

## Icons

Lucide only (`lucide-react`). Prefer 16–18px in navigation and 14–16px in
engagement rows.
