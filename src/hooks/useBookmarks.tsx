// Re-export from the canonical BookmarkContext so all components share one state.
// Previously this file had its own localStorage hook using key "croxcom_bookmarks",
// which conflicted with BookmarkContext (key: "croxcom-bookmarks"). Now there is
// exactly one source of truth: lib/BookmarkContext.tsx.
export { useBookmarks } from "@/lib/BookmarkContext";
