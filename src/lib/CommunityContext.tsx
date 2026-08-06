import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { mockCommunities, type MockCommunity } from "@/data/mock";

interface CommunityContextValue {
  joinedCommunityIds: Set<string>;
  createdCommunities: MockCommunity[];
  joinCommunity: (id: string) => void;
  leaveCommunity: (id: string) => void;
  createCommunity: (data: {
    name: string;
    description: string;
    isPublic: boolean;
  }) => MockCommunity;
  isMember: (id: string) => boolean;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

const STORAGE_KEY = "croxcom_communities";

export function CommunityProvider({ children }: { children: ReactNode }) {
  const [joinedCommunityIds, setJoinedCommunityIds] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set<string>(parsed.joined || []);
      }
    } catch {
      /* ignore storage errors */
    }
    return new Set();
  });

  const [createdCommunities, setCreatedCommunities] = useState<MockCommunity[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.created || [];
      }
    } catch {
      /* ignore storage errors */
    }
    return [];
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          joined: Array.from(joinedCommunityIds),
          created: createdCommunities,
        }),
      );
    } catch {
      /* ignore storage errors */
    }
  }, [joinedCommunityIds, createdCommunities]);

  const joinCommunity = (id: string) => {
    setJoinedCommunityIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const leaveCommunity = (id: string) => {
    setJoinedCommunityIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const createCommunity = (data: {
    name: string;
    description: string;
    isPublic: boolean;
  }): MockCommunity => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    const newCommunity: MockCommunity = {
      id: `user-c-${Date.now()}`,
      slug,
      name: data.name,
      members: 1,
      description: data.description,
      tags: [],
      isPublic: data.isPublic,
    };
    setCreatedCommunities((prev) => [newCommunity, ...prev]);
    // Auto-join created community
    joinCommunity(newCommunity.id);
    return newCommunity;
  };

  const isMember = (id: string) => joinedCommunityIds.has(id);

  return (
    <CommunityContext.Provider
      value={{
        joinedCommunityIds,
        createdCommunities,
        joinCommunity,
        leaveCommunity,
        createCommunity,
        isMember,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunities() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunities must be used within CommunityProvider");
  return ctx;
}
