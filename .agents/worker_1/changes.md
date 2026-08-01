# Changes Summary — worker_1

## Modified Files

1. `src/data/mock.ts`
   - Updated `MockPost.media` type to `PostMedia | PostMedia[]` to support posts containing multiple media blocks (e.g., both image/image-grid and code snippet simultaneously).

2. `src/components/feed/Composer.tsx`
   - **Fix Composer Media Collision**: Refactored `submit()` to build `mediaItems: PostMedia[]` containing both image blocks (`image` or `image-grid`) and code blocks (`code`) when both are attached, passing `PostMedia | PostMedia[]` to `onSubmit`.
   - **Fix Editor Line Numbers Scroll & Wrapping**: Added `lineNumbersRef` with `overflow-hidden`, synced vertical scroll (`onScroll` setting `lineNumbersRef.current.scrollTop`), set `wrap="off"` with `overflow-x-auto whitespace-pre` on the code textarea to prevent line number misalignment on wrap/scroll.
   - **Fix IDE Panel Close**: Created `closeIde()` helper function that resets `codeValue` to `""`, resets `language` to `"typescript"`, and closes/unminimizes the panel. Wired `closeIde` to `× close` button and `toggleIde` close action.

3. `src/components/feed/PostCard.tsx`
   - Updated `MediaBlock` component to accept `PostMedia | PostMedia[]`. If an array of media items is passed, it renders each item sequentially in a vertical flex stack (`SingleMediaBlock`).

4. `src/routes/posts.$postId.tsx`
   - Updated post detail page `MediaBlock` component to accept `PostMedia | PostMedia[]` and render multiple media items sequentially.

5. `src/routes/index.tsx`
   - **Fix Trend Feed Ad Interleaving**: Updated `trendItems` generation logic to interleave sponsored ads from `ADS` after every 4 posts (`(i + 1) % 4 === 0`) using cyclic ad indexing `Math.floor(i / 4) % ADS.length`. All ads (`ADS[0]`, `ADS[1]`, etc.) are now cyclically interleaved throughout the feed.
   - **Trend Tab Composer**: Added `<Composer onSubmit={handlePost} ... />` to the Trend tab so user post creation is consistently accessible directly from the Trend tab.
   - Updated `handlePost` parameter type to support `media?: PostMedia | PostMedia[]`.

6. `src/components/layout/AppShell.tsx` & `src/routes/communities.$slug.tsx`
   - Updated `handlePost` and `handleCommunityPost` parameter type signatures to accept `media?: PostMedia | PostMedia[]`.

7. `src/components/feed/LinkPreviewCard.tsx`
   - **Fix URL Parsing**: Updated `extractUrl()` to strip trailing punctuation (`/[.,!?);:"']+$/`).
   - Cleaned `domain` extraction in `LinkPreviewCard` to remove trailing dots and punctuation so hostnames like `techcrunch.com.` clean to `techcrunch.com` and match mock preview cards accurately.

## Verification Results

- `npx tsc --noEmit`: Completed with 0 errors.
- `npm run build`: Completed successfully with Cloudflare / Nitro output generated in `.output/`.
