import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/lib/AuthContext";
import {
  isSupabaseConfigured,
  fetchBookmarksSupabase,
  toggleBookmarkSupabase,
} from "@/lib/supabase";

interface BookmarkContextType {
  savedPosts: string[];
  toggleBookmark: (postId: string) => void;
  isSaved: (postId: string) => boolean;
  clearBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  useEffect(() => {
    async function loadBookmarks() {
      if (isSupabaseConfigured && currentUser?.id) {
        const sbBookmarks = await fetchBookmarksSupabase(currentUser.id);
        setSavedPosts(sbBookmarks);
        return;
      }

      try {
        const stored = localStorage.getItem("croxcom-bookmarks");
        if (stored) {
          setSavedPosts(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
    loadBookmarks();
  }, [currentUser?.id]);

  const toggleBookmark = (postId: string) => {
    setSavedPosts((prev) => {
      const isCurrentlySaved = prev.includes(postId);
      const newSaved = isCurrentlySaved ? prev.filter((id) => id !== postId) : [...prev, postId];

      if (isSupabaseConfigured && currentUser?.id) {
        toggleBookmarkSupabase(currentUser.id, postId, isCurrentlySaved);
      }

      try {
        localStorage.setItem("croxcom-bookmarks", JSON.stringify(newSaved));
      } catch (e) {
        console.error("Failed to save bookmarks", e);
      }

      return newSaved;
    });
  };

  const clearBookmarks = () => {
    setSavedPosts([]);
    try {
      localStorage.removeItem("croxcom-bookmarks");
    } catch (e) {
      console.error("Failed to clear bookmarks", e);
    }
  };

  const isSaved = (postId: string) => savedPosts.includes(postId);

  return (
    <BookmarkContext.Provider value={{ savedPosts, toggleBookmark, isSaved, clearBookmarks }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
