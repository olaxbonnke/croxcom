import React, { createContext, useContext, useEffect, useState } from "react";
import { mockUsers, type MockUser } from "@/data/mock";

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
  login: (provider: "email" | "github", email?: string) => void;
  logout: () => void;
  completeOnboarding: (details: OnboardingDetails) => void;
  updateUser: (user: Partial<MockUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "croxcom-auth-session";
const USER_PROFILE_KEY = "croxcom-user-profile";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser>(() => {
    try {
      const stored = localStorage.getItem(USER_PROFILE_KEY);
      if (stored) return { ...mockUsers[0], ...JSON.parse(stored) };
    } catch {
      /* ignore */
    }
    return mockUsers[0];
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
    return true; // Default logged-in for demo smoothness
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
    return true;
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

  useEffect(() => {
    try {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ isAuthenticated, hasCompletedOnboarding, onboardingDetails })
      );
    } catch {
      /* ignore */
    }
  }, [isAuthenticated, hasCompletedOnboarding, onboardingDetails]);

  const login = (provider: "email" | "github", email?: string) => {
    setIsAuthenticated(true);
    setHasCompletedOnboarding(false); // trigger onboarding after fresh login
    if (email) {
      const updated = {
        ...currentUser,
        name: email.split("@")[0],
        handle: email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      };
      setCurrentUser(updated);
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(updated));
    }
  };

  const logout = () => {
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
    }
  };

  const updateUser = (updated: Partial<MockUser>) => {
    const newProfile = { ...currentUser, ...updated };
    setCurrentUser(newProfile);
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(newProfile));
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
