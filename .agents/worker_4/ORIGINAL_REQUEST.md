## 2026-07-23T13:12:11Z
You are worker_4 working in c:\Users\olait\Documents\My Coding\croxcom\.agents\worker_4.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your assigned scope & fixes:
1. Fix Code Block Readability in `src/components/feed/PostCard.tsx`:
   - Inspect line 402 (or around code snippet container rendering).
   - Change `text-foreground/90` inside dark background containers (`bg-[#0d0d0d]` or `bg-black/60`) to `text-zinc-100` so text is bright white on dark background in BOTH Light mode and Dark mode.
2. Fix Theme Persistence Hydration Leak in `src/routes/__root.tsx`:
   - Inspect line 125 (or `RootShell` component `<html>` rendering).
   - Change `<html lang="en" className="dark">` to `<html lang="en">` (remove hardcoded `className="dark"` from html tag). This prevents React SSR/CSR hydration from forcing `.dark` onto light-mode users.

After making changes:
1. Run `npx tsc --noEmit` and `npm run build` using run_command to verify 0 compilation errors and successful build.
2. Document all changes made, files modified, build/test results, and handoff report in `c:\Users\olait\Documents\My Coding\croxcom\.agents\worker_4\handoff.md` and `c:\Users\olait\Documents\My Coding\croxcom\.agents\worker_4\changes.md`.
3. Send a message to parent (conversation ID: 54acfb7e-03a4-49a7-ac38-d240f26b9229) with summary and verification evidence.
