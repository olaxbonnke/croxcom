import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface BookmarkContextType {
  savedPosts: string[];
  toggleBookmark: (postId: string) => void;
  isSaved: (postId: string) => boolean;
  clearBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("croxcom-bookmarks");
      if (stored) {
        setSavedPosts(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse bookmarks", e);
    }
  }, []);

  const toggleBookmark = (postId: string) => {
    setSavedPosts((prev) => {
      const newSaved = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      
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
