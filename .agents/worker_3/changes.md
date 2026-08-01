# Changes Log — worker_3

## Summary of Scope & Fixes Implemented

### 1. Theme Persistence & Mount Initialization

- **Files**: `src/lib/theme.ts`, `src/components/theme-toggle.tsx`
- **Changes**:
  - Updated `themeInitScript` in `src/lib/theme.ts` to call `document.documentElement.classList.remove('dark')` when stored theme is `'light'`.
  - Added `applyTheme(t)` invocation on mount inside `ThemeToggle`'s `useEffect` to ensure stored light theme persists and applies immediately across reloads.

### 2. Code Block Readability in Light Mode

- **Files**: `src/components/feed/Composer.tsx`, `src/components/feed/PostCard.tsx`, `src/routes/posts.$postId.tsx`
- **Changes**:
  - `Composer.tsx`: Updated IDE section line numbers styling (`text-zinc-500`) and input text color (`text-primary`) inside dark container `bg-[#0a0a0c]`.
  - `PostCard.tsx`: Updated code block `<pre>` element to use `text-zinc-100` and line numbers to use `text-zinc-500` inside dark container `bg-[#0d0d0d]`, ensuring high-contrast readable code text in both Light and Dark themes.
  - `posts.$postId.tsx`: Updated code block `<pre>` element to use `text-zinc-100` and line numbers to use `text-zinc-500` inside dark container `bg-[#0d0d0d]`.

### 3. Mobile Reply Input Overlap

- **Files**: `src/routes/posts.$postId.tsx`
- **Changes**:
  - Adjusted padding on mobile viewports (`pb-24 md:pb-0`) for comments container.
  - Updated sticky bottom reply composer container styling (`sticky bottom-14 lg:bottom-0 z-20`) so it sits above `MobileTabBar` on mobile viewports and is fully visible without being obscured.

### 4. Accent Color Inconsistency

- **Files**: `src/components/feed/Composer.tsx`, `src/components/feed/PostCard.tsx`, `src/components/notifications/NotifItem.tsx`, `src/routes/posts.$postId.tsx`
- **Changes**:
  - Replaced hardcoded `emerald-400` / `emerald-500` with specified `#00ff9f` / `text-primary` / `bg-primary` neon accent across components:
    - `Composer.tsx`: Updated dot accent to `bg-primary/80` and code text to `text-primary`.
    - `PostCard.tsx`: Updated repost active class to `text-primary` and dot accent to `bg-primary/80`.
    - `NotifItem.tsx`: Updated comment icon badge styling to `text-primary bg-primary/10`.
    - `posts.$postId.tsx`: Updated repost active class to `text-primary` and dot accent to `bg-primary/80`.

### 5. Avatar Contrast & AppShell Borders

- **Files**: `src/components/layout/AppShell.tsx`, `src/components/profile/ProfileHeader.tsx`
- **Changes**:
  - `AppShell.tsx`: Changed `<main>` element border class from `border-x border-border/70` to `border-r border-border/70` to remove the redundant left border that caused a 2px composite line with `<aside>`'s right border.
  - `ProfileHeader.tsx`: Changed avatar initials text color from `text-background` to explicit `color: "#0a0a0a"` to ensure accessible dark contrast text over bright/neon background in Light and Dark modes.

---

## Verification Results

- **TypeScript Check**: `npx tsc --noEmit` -> Passed (0 compilation errors)
- **Production Build**: `npm run build` -> Passed (successful build)
