import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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
  companyName?: string;
};

interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  hasCompletedOnboarding: boolean;
  currentUser: MockUser;
  onboardingDetails?: OnboardingDetails;
  login: (provider: "email" | "github" | "google", email?: string, captchaToken?: string) => Promise<void> | void;
  logout: () => Promise<void> | void;
  completeOnboarding: (details: OnboardingDetails, userUpdates?: Partial<MockUser>) => void;
  updateUser: (user: Partial<MockUser>) => void;
  isRealUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "croxcom-auth-session";
const USER_PROFILE_KEY = "croxcom-user-profile";
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

  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);

  // Supabase auth state listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoadingAuth(false);
      return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        const sbUser = session.user;
        const profile = await fetchProfile(sbUser.id);
        const emailPrefix = sbUser.email?.split("@")[0] || "user";
        // Create unique handle from user email / metadata
        const uniqueHandle =
          profile?.handle ||
          sbUser.user_metadata?.user_name ||
          `${emailPrefix.toLowerCase().replace(/[^a-z0-9_]/g, "_")}_${sbUser.id.slice(0, 4)}`;
        const name =
          profile?.name || sbUser.user_metadata?.full_name || emailPrefix || "AI Developer";
        const avatar =
          profile?.avatar || sbUser.user_metadata?.avatar_url || currentUserRef.current.avatar;

        const updatedUser: MockUser = {
          ...currentUserRef.current,
          id: sbUser.id,
          name,
          handle: uniqueHandle,
          avatar,
          role: profile?.role || currentUserRef.current.role,
          bio: profile?.bio ?? currentUserRef.current.bio,
          followers: profile?.followers ?? 0,
          following: profile?.following ?? 0,
          posts: profile?.posts ?? 0,
        };
        setCurrentUser(updatedUser);
        localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updatedUser));

        // A user has completed onboarding ONLY if onboarding_completed is explicitly true in Supabase profile
        const isCompleted = Boolean(profile?.onboarding_completed === true);
        setHasCompletedOnboarding(isCompleted);
        setIsLoadingAuth(false);
      } else if (event === "SIGNED_OUT") {
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
        setIsLoadingAuth(false);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(USER_PROFILE_KEY);
      } else {
        setIsLoadingAuth(false);
      }
    });

    // Fallback safety timeout if auth listener takes too long
    const timer = setTimeout(() => {
      setIsLoadingAuth(false);
    }, 1500);

    return () => {
      clearTimeout(timer);
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

  const login = async (provider: "email" | "github" | "google", email?: string, captchaToken?: string) => {
    if (isSupabaseConfigured) {
      if (provider === "github") {
        const { data, error } = await signInWithGitHub();
        if (error) throw error;
        if (data?.url) {
          window.location.assign(data.url);
        } else {
          throw new Error("GitHub authentication URL was not returned by Supabase.");
        }
      } else if (provider === "google") {
        const { data, error } = await signInWithGoogle();
        if (error) throw error;
        if (data?.url) {
          window.location.assign(data.url);
        } else {
          throw new Error("Google authentication URL was not returned by Supabase.");
        }
      } else if (email) {
        const { error } = await signInWithEmail(email, captchaToken);
        if (error) throw error;
      }
    } else {
      // Mock mode fallback when Supabase is not configured
      setIsAuthenticated(true);
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
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await signOutSupabase();
    }
    setIsAuthenticated(false);
    setHasCompletedOnboarding(false);
    setOnboardingDetails(undefined);
    setCurrentUser(DEFAULT_LIVE_USER);
    // Clear all user-specific localStorage keys to prevent data bleed (Issue #9)
    localStorage.removeItem(USER_PROFILE_KEY);
    localStorage.removeItem("croxcom-bookmarks");
    localStorage.removeItem("croxcom_communities");
    localStorage.removeItem("croxcom-saved-library-ids");
    // AUTH_STORAGE_KEY is written by the persistence effect with the new false state
  };

  const completeOnboarding = (details: OnboardingDetails, userUpdates?: Partial<MockUser>) => {
    setOnboardingDetails(details);
    setHasCompletedOnboarding(true);

    const mergedUser: MockUser = {
      ...currentUser,
      ...(userUpdates || {}),
      role: details.teamRole || details.devPosition || userUpdates?.role || currentUser.role,
    };

    setCurrentUser(mergedUser);
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(mergedUser));

    if (isSupabaseConfigured && mergedUser.id) {
      upsertProfile({
        id: mergedUser.id,
        name: mergedUser.name,
        handle: mergedUser.handle,
        role: mergedUser.role,
        bio: mergedUser.bio || "",
        avatar: mergedUser.avatar,
        onboarding_completed: true,
        company_name: details.companyName,
        preferences: details.preferences,
        tools: details.tools,
        interests: details.interests,
        dev_position: details.devPosition,
      });
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
          avatar: newProfile.avatar,
          bio: newProfile.bio,
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
        isLoadingAuth,
        hasCompletedOnboarding,
        currentUser,
        onboardingDetails,
        login,
        logout,
        completeOnboarding,
        updateUser,
        isRealUser: currentUser.id !== "user-new",
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
