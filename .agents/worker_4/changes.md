# Summary of Changes

## Files Modified

### 1. `src/components/feed/PostCard.tsx`

- **Location**: Line 402 (`pre` tag in code media rendering section)
- **Original**: `className="flex-1 overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-foreground/90"`
- **Updated**: `className="flex-1 overflow-x-auto p-3 font-mono text-[13px] leading-relaxed text-zinc-100"`
- **Rationale**: The code snippet container uses dark background `bg-[#0d0d0d]`. Using `text-foreground/90` caused code text to appear near-black in Light mode, making it unreadable. Updating to `text-zinc-100` ensures bright white text contrast across both Light and Dark modes.

### 2. `src/routes/__root.tsx`

- **Location**: Line 125 (`RootShell` component `<html>` tag rendering)
- **Original**: `<html lang="en" className="dark">`
- **Updated**: `<html lang="en">`
- **Rationale**: Hardcoding `className="dark"` on the `<html>` root element in `RootShell` overrode user theme preferences during React SSR/CSR hydration and forced dark mode on light-mode users. Removing the hardcoded class lets the inline `themeInitScript` correctly manage the `.dark` class state without hydration leaks.

## Build and Test Verification

1. `npx tsc --noEmit`: Executed cleanly with 0 type errors.
2. `npm run build`: Executed cleanly, generated Nitro/Vite production build without errors.
