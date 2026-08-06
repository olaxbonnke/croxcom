import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, type OnboardingDetails } from "@/lib/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight, Check, Github, Mail, Sparkles, Terminal, Users, User } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

type AuthPhase = "loading" | "login" | "check-inbox" | "awaiting-redirect" | "onboarding";

const TOOLS_LIST = [
  "PyTorch",
  "vLLM",
  "Transformers",
  "LangChain",
  "Ollama",
  "LlamaIndex",
  "Next.js",
  "Triton",
];
const INTERESTS_LIST = [
  "RAG & Vector DBs",
  "Model Fine-Tuning",
  "Autonomous Agents",
  "Interpretability",
  "Synthetic Data",
  "Evals",
];

function AuthPage() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    hasCompletedOnboarding,
    currentUser,
    login,
    completeOnboarding,
    updateUser,
  } = useAuth();

  const [phase, setPhase] = useState<AuthPhase>("loading");
  const [email, setEmail] = useState("");

  // Onboarding state
  const [displayName, setDisplayName] = useState(() => {
    if (currentUser?.name && currentUser.name !== "New Developer") return currentUser.name;
    return "";
  });
  const [userHandle, setUserHandle] = useState(() => {
    if (currentUser?.handle && currentUser.handle !== "new_developer") return currentUser.handle;
    return "";
  });
  const [selectedTools, setSelectedTools] = useState<string[]>(["PyTorch", "vLLM"]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "Autonomous Agents",
    "RAG & Vector DBs",
  ]);
  const [devPosition, setDevPosition] = useState<"Solo" | "Team">("Team");
  const [teamRole, setTeamRole] = useState("AI Infrastructure Engineer");

  // Keep displayName and userHandle updated from currentUser only if genuine name
  useEffect(() => {
    if (currentUser?.name && currentUser.name !== "New Developer" && !displayName) {
      setDisplayName(currentUser.name);
    }
    if (currentUser?.handle && currentUser.handle !== "new_developer" && !userHandle) {
      setUserHandle(currentUser.handle);
    }
  }, [currentUser, displayName, userHandle]);

  // Step 1: Handle loading animation timeline (2s logo + slide out text)
  useEffect(() => {
    if (phase === "loading") {
      const timer = setTimeout(() => {
        if (!isAuthenticated) {
          setPhase("login");
        } else if (!hasCompletedOnboarding) {
          setPhase("onboarding");
        } else {
          navigate({ to: "/", replace: true });
        }
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [phase, isAuthenticated, hasCompletedOnboarding, navigate]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await login("email", email.trim());
    // If Supabase is not configured, mock mode advances directly to onboarding
    if (!isSupabaseConfigured) {
      setPhase("onboarding");
    } else {
      // Real Supabase: show "check your inbox" screen, wait for magic link
      setPhase("check-inbox");
    }
  };

  const handleGithubLogin = async () => {
    await login("github");
    if (!isSupabaseConfigured) {
      setPhase("onboarding");
    } else {
      setPhase("awaiting-redirect");
    }
  };

  const handleGoogleLogin = async () => {
    await login("google");
    if (!isSupabaseConfigured) {
      setPhase("onboarding");
    } else {
      setPhase("awaiting-redirect");
    }
  };

  // When real auth completes (OAuth redirect return or magic link), transition to onboarding
  useEffect(() => {
    if (isAuthenticated && !hasCompletedOnboarding && (phase === "check-inbox" || phase === "awaiting-redirect" || phase === "login")) {
      setPhase("onboarding");
    }
  }, [isAuthenticated, hasCompletedOnboarding, phase]);

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = (userHandle || email.split("@")[0] || "dev")
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");

    updateUser({
      name: displayName.trim() || email.split("@")[0] || "AI Developer",
      handle: cleanHandle,
    });

    const details: OnboardingDetails = {
      preferences: selectedInterests,
      tools: selectedTools,
      interests: selectedInterests,
      devPosition,
      teamRole: devPosition === "Team" ? teamRole : "Solo Builder",
    };
    completeOnboarding(details);
    navigate({ to: "/", replace: true });
  };

  const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-8 relative overflow-hidden font-sans">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Grid background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* ── PHASE 1: Loading Screen (Logo 2s + terminal slide out) ── */}
        {phase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center text-center z-10"
          >
            <div className="flex items-center gap-4">
              <motion.img
                src="/logo.svg"
                alt="CroxCom Logo"
                initial={{ scale: 0.8, rotate: -10 }}
                animate={{ scale: 1.1, rotate: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-20 w-20 shadow-2xl rounded-xl"
              />
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8, ease: "easeInOut" }}
                className="overflow-hidden whitespace-nowrap font-mono text-3xl font-bold tracking-tight text-foreground flex items-center"
              >
                <span className="text-muted-foreground mr-1">{">"}</span>
                croxcom
                <span className="text-primary animate-pulse">_</span>
              </motion.div>
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-6 font-mono text-xs text-muted-foreground tracking-widest uppercase"
            >
              initializing developer environment...
            </motion.p>
          </motion.div>
        )}

        {/* ── PHASE 2: Login / Sign up Screen ── */}
        {phase === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md rounded-xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <Logo size="lg" />
              <span className="font-mono text-xs border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 rounded">
                v0.1.0
              </span>
            </div>

            <div className="mb-6">
              <h1 className="text-xl font-semibold text-foreground">Welcome to CroxCom</h1>
              <p className="text-sm text-muted-foreground mt-1">
                The terminal-inspired community for AI developers.
              </p>
            </div>

            {/* Social OAuth Providers */}
            <div className="space-y-2.5 mb-4">
              <button
                type="button"
                onClick={handleGithubLogin}
                className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border bg-background py-2.5 px-4 font-mono text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-accent/40 cursor-pointer shadow-sm"
              >
                <Github className="h-4 w-4" />
                <span>Continue with GitHub</span>
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2.5 rounded-lg border border-border bg-background py-2.5 px-4 font-mono text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-accent/40 cursor-pointer shadow-sm"
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/70" />
              </div>
              <span className="relative bg-card px-3 font-mono text-xs text-muted-foreground uppercase">
                or email
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-1.5">
                  Developer Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ada@voxel.ai"
                    className="w-full rounded-lg border border-border bg-background/80 pl-9 pr-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 px-4 font-mono text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 cursor-pointer shadow-md"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 text-center font-mono text-xs text-muted-foreground/70">
              By signing in, you agree to our Code of Conduct & Privacy rules.
            </p>
          </motion.div>
        )}

        {/* ── PHASE: Check Inbox Screen ── */}
        {phase === "check-inbox" && (
          <motion.div
            key="check-inbox"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex min-h-screen items-center justify-center bg-background p-4"
          >
            <div className="w-full max-w-md space-y-6 text-center z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Check your inbox</h2>
              <p className="text-muted-foreground">
                We sent a magic link to <span className="font-medium text-foreground">{email}</span>.
                Click the link in your email to sign in.
              </p>
              <button
                type="button"
                onClick={() => setPhase("login")}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                ← Back to login
              </button>
            </div>
          </motion.div>
        )}

        {/* ── PHASE: Awaiting Redirect Screen ── */}
        {phase === "awaiting-redirect" && (
          <motion.div
            key="awaiting-redirect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex min-h-screen items-center justify-center bg-background p-4"
          >
            <div className="w-full max-w-md space-y-6 text-center z-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 animate-pulse">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Redirecting...</h2>
              <p className="text-muted-foreground">Taking you to the authentication provider.</p>
            </div>
          </motion.div>
        )}

        {/* ── PHASE 3: Onboarding Screen ── */}
        {phase === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg rounded-xl border border-border/80 bg-card/70 p-6 sm:p-8 shadow-2xl backdrop-blur-md z-10"
          >
            <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs text-primary font-semibold">
                <Terminal className="h-4 w-4" />
                <span>$ croxcom --setup-profile</span>
              </div>
              <span className="font-mono text-xs text-primary font-semibold">Profile Setup</span>
            </div>

            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">
                Complete Your Developer Profile
              </h2>
              <p className="text-xs text-muted-foreground">
                Set your public display name, unique handle, and developer stack.
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="space-y-5">
              {/* Step 1: Display Name & Unique Handle */}
              <div className="rounded-lg border border-border/80 bg-background/50 p-3.5 space-y-3">
                <label className="block font-mono text-xs text-primary font-bold uppercase tracking-wider">
                  1. Your Public Identity
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono text-[11px] text-muted-foreground mb-1">
                      Display Name <span className="text-primary">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-[11px] text-muted-foreground mb-1">
                      Unique Handle (@username) <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 font-mono text-sm text-muted-foreground">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={userHandle}
                        onChange={(e) =>
                          setUserHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                        }
                        placeholder="alex_rivera"
                        className="w-full rounded-lg border border-border bg-background pl-7 pr-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tools Selection */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-2">
                  1. Tools & Frameworks You Use
                </label>

                <div className="flex flex-wrap gap-2">
                  {TOOLS_LIST.map((tool) => {
                    const active = selectedTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => toggleItem(selectedTools, setSelectedTools, tool)}
                        className={`font-mono text-xs rounded-md px-3 py-1.5 border transition-all cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-background/50 text-muted-foreground hover:border-muted-foreground"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 stroke-[3]" />}
                        <span>{tool}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interests Selection */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-2">
                  2. Primary AI Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map((interest) => {
                    const active = selectedInterests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() =>
                          toggleItem(selectedInterests, setSelectedInterests, interest)
                        }
                        className={`font-mono text-xs rounded-md px-3 py-1.5 border transition-all cursor-pointer flex items-center gap-1.5 ${
                          active
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-background/50 text-muted-foreground hover:border-muted-foreground"
                        }`}
                      >
                        {active && <Check className="h-3 w-3 stroke-[3]" />}
                        <span>{interest}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dev Position: Solo or Team */}
              <div>
                <label className="block font-mono text-xs text-muted-foreground mb-2">
                  3. Developer Position
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDevPosition("Solo")}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 font-mono text-xs transition-all cursor-pointer ${
                      devPosition === "Solo"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-accent/40"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span>Solo Builder</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDevPosition("Team")}
                    className={`flex items-center justify-center gap-2 rounded-lg border py-2.5 font-mono text-xs transition-all cursor-pointer ${
                      devPosition === "Team"
                        ? "border-primary bg-primary/10 text-primary font-semibold"
                        : "border-border bg-background/50 text-muted-foreground hover:bg-accent/40"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Team / Lab</span>
                  </button>
                </div>
              </div>

              {/* Conditional Role input if Team */}
              {devPosition === "Team" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <label className="block font-mono text-xs text-muted-foreground mb-1">
                    Your Role in Team
                  </label>
                  <input
                    type="text"
                    required
                    value={teamRole}
                    onChange={(e) => setTeamRole(e.target.value)}
                    placeholder="e.g. Senior ML Engineer, Researcher"
                    className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 font-mono text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </motion.div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 font-mono text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 cursor-pointer shadow-md mt-6"
              >
                <Sparkles className="h-4 w-4" />
                <span>Complete Setup & Enter CroxCom</span>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
