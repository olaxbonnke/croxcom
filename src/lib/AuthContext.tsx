import React, { createContext, useContext, useEffect, useState } from "react";
import { mockUsers, type MockUser } from "@/data/mock";
import {
  supabase,
  isSupabaseConfigured,
  signInWithEmail,
  signInWithGitHub,
  signInWithGoogle,
  signOutSupabase,
  upsertProfile,
  fetchProfile,
} from "@/lib/supabase";

export type OnboardingDetails = {
  preferences: string[];
  tools: string[];
  interests: string[];
  devPosition: "Solo" | "Team";
  teamRole?: string;
};

interface AuthContextType {
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  currentUser: MockUser;
  onboardingDetails?: OnboardingDetails;
  login: (provider: "email" | "github" | "google", email?: string) => Promise<void> | void;
  logout: () => Promise<void> | void;
  completeOnboarding: (details: OnboardingDetails) => void;
  updateUser: (user: Partial<MockUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "croxcom-auth-session";
const DEFAULT_LIVE_USER: MockUser = {
  id: "user-new",
  name: "New Developer",
  handle: "new_developer",
  avatarColor: "#00ff9f",
  role: "AI Developer",
  bio: "",
  followers: 0,
  following: 0,
  posts: 0,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser>(() => {
    try {
      const stored = localStorage.getItem(USER_PROFILE_KEY);
      if (stored) return { ...DEFAULT_LIVE_USER, ...JSON.parse(stored) };
    } catch {
      /* ignore */
    }
    return DEFAULT_LIVE_USER;
  });


  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        return Boolean(parsed.isAuthenticated);
      }
    } catch {
      /* ignore */
    }
    return false; // Default unauthenticated for real visitor onboarding flow
  });

  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(() => {
    try {
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        return Boolean(parsed.hasCompletedOnboarding);
      }
    } catch {
      /* ignore */
    }
    return false; // Default uncompleted onboarding for new visitors
  });

  const [onboardingDetails, setOnboardingDetails] = useState<OnboardingDetails | undefined>(() => {
    try {
      const session = localStorage.getItem(AUTH_STORAGE_KEY);
      if (session) {
        const parsed = JSON.parse(session);
        return parsed.onboardingDetails;
      }
    } catch {
      /* ignore */
    }
    return undefined;
  });

  // Supabase auth state listener
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const sbUser = session.user;
        const profile = await fetchProfile(sbUser.id);
        const emailPrefix = sbUser.email?.split("@")[0] || "user";
        // Create unique handle from user email / metadata
        const uniqueHandle = (
          profile?.handle ||
          sbUser.user_metadata?.user_name ||
          `${emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, "_")}_${sbUser.id.slice(0, 4)}`
        );
        const name = profile?.name || sbUser.user_metadata?.full_name || emailPrefix || "AI Developer";
        const avatar = profile?.avatar || sbUser.user_metadata?.avatar_url || currentUser.avatar;

        const updatedUser: MockUser = {
          ...currentUser,
          id: sbUser.id,
          name,
          handle: uniqueHandle,
          avatar,
          followers: profile?.followers ?? 0,
          following: profile?.following ?? 0,
          posts: profile?.posts ?? 0,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedUser));
      } else if (event === "SIGNED_OUT") {

        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_PROFILE_KEY);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isAuthenticated, hasCompletedOnboarding, onboardingDetails }),
      );
    } catch {
      /* ignore */
    }
  }, [isAuthenticated, hasCompletedOnboarding, onboardingDetails]);

  const login = async (provider: "email" | "github" | "google", email?: string) => {
    setIsAuthenticated(true);
    setHasCompletedOnboarding(false);

    if (isSupabaseConfigured) {
      if (provider === "github") {
        await signInWithGitHub();
      } else if (provider === "google") {
        await signInWithGoogle();
      } else if (email) {
        await signInWithEmail(email);
      }
    }

    if (email) {
      const updated = {
        ...currentUser,
        name: email.split("@")[0],
        handle: email
          .split("@")[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_"),
      };
      setCurrentUser(updated);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await signOutSupabase();
    }
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const completeOnboarding = (details: OnboardingDetails) => {
    setOnboardingDetails(details);
    setHasCompletedOnboarding(true);
    if (details.teamRole) {
      const updated = { ...currentUser, role: details.teamRole };
      setCurrentUser(updated);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));

      if (isSupabaseConfigured && currentUser.id) {
        upsertProfile({
          id: currentUser.id,
          name: currentUser.name,
          handle: currentUser.handle,
          role: details.teamRole,
          preferences: details.preferences,
          tools: details.tools,
          interests: details.interests,
          dev_position: details.devPosition,
        });
      }
    }
  };

  const updateUser = (updated: Partial<MockUser>) => {
    const newProfile = { ...currentUser, ...updated };
    setCurrentUser(newProfile);
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
      if (isSupabaseConfigured && currentUser.id) {
        upsertProfile({
          id: currentUser.id,
          name: newProfile.name,
          handle: newProfile.handle,
          bio: newProfile.bio,
          company: newProfile.company,
          location: newProfile.location,
          role: newProfile.role,
        });
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        hasCompletedOnboarding,
        currentUser,
        onboardingDetails,
        login,
        logout,
        completeOnboarding,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
